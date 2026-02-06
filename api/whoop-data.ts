import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing auth token' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const clientId = process.env.WHOOP_CLIENT_ID
  const clientSecret = process.env.WHOOP_CLIENT_SECRET

  if (!supabaseUrl || !serviceRoleKey || !anonKey || !clientId || !clientSecret) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    // Verify the user's JWT
    const userToken = authHeader.replace('Bearer ', '')
    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(userToken)

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Get stored WHOOP tokens
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data: tokenRow, error: dbError } = await supabase
      .from('whoop_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (dbError || !tokenRow) {
      return res.json({ connected: false, recovery: null, sleep: null, strain: null })
    }

    let accessToken = tokenRow.access_token

    // Refresh token if expired
    if (new Date(tokenRow.expires_at) <= new Date()) {
      console.log('WHOOP token expired, refreshing...')
      const refreshRes = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokenRow.refresh_token,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      })

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        accessToken = refreshData.access_token
        const expiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString()

        await supabase.from('whoop_tokens').update({
          access_token: refreshData.access_token,
          refresh_token: refreshData.refresh_token,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id)
        console.log('WHOOP token refreshed successfully')
      } else {
        const refreshErr = await refreshRes.text().catch(() => '')
        console.error('WHOOP token refresh failed:', refreshRes.status, refreshErr)
        // Use existing token — it might still work
      }
    }

    // Fetch WHOOP data in parallel
    const headers = { Authorization: `Bearer ${accessToken}` }
    const [recoveryRes, sleepRes, cycleRes] = await Promise.all([
      fetch('https://api.prod.whoop.com/developer/v1/recovery?limit=1', { headers }),
      fetch('https://api.prod.whoop.com/developer/v1/activity/sleep?limit=1', { headers }),
      fetch('https://api.prod.whoop.com/developer/v1/cycle?limit=1', { headers }),
    ])

    let recovery = null
    let sleep = null
    let strain = null

    console.log('WHOOP API status — recovery:', recoveryRes.status, 'sleep:', sleepRes.status, 'cycle:', cycleRes.status)

    if (recoveryRes.ok) {
      const recoveryData = await recoveryRes.json()
      console.log('WHOOP recovery records:', recoveryData.records?.length ?? 0)
      const r = recoveryData.records?.[0]?.score
      if (r) {
        recovery = {
          score: Math.round(r.recovery_score),
          restingHeartRate: Math.round(r.resting_heart_rate),
          hrv: Math.round(r.hrv_rmssd_milli),
          spo2: r.spo2_percentage != null ? Math.round(r.spo2_percentage) : null,
          skinTemp: r.skin_temp_celsius != null ? Math.round(r.skin_temp_celsius * 10) / 10 : null,
        }
      }
    }

    if (!recoveryRes.ok) {
      console.error('WHOOP recovery error:', await recoveryRes.text().catch(() => ''))
    }

    if (sleepRes.ok) {
      const sleepData = await sleepRes.json()
      const s = sleepData.records?.[0]?.score
      if (s) {
        sleep = {
          qualityDuration: s.stage_summary?.total_light_sleep_time_milli +
            s.stage_summary?.total_slow_wave_sleep_time_milli +
            s.stage_summary?.total_rem_sleep_time_milli || 0,
          totalInBedDuration: s.stage_summary?.total_in_bed_time_milli || 0,
          remSleepDuration: s.stage_summary?.total_rem_sleep_time_milli || 0,
          deepSleepDuration: s.stage_summary?.total_slow_wave_sleep_time_milli || 0,
          lightSleepDuration: s.stage_summary?.total_light_sleep_time_milli || 0,
          awakeDuration: s.stage_summary?.total_awake_time_milli || 0,
          sleepScore: s.sleep_performance_percentage != null ? Math.round(s.sleep_performance_percentage) : null,
        }
      }
    }

    if (cycleRes.ok) {
      const cycleData = await cycleRes.json()
      const c = cycleData.records?.[0]?.score?.strain
      if (c) {
        strain = {
          score: Math.round(c.score * 10) / 10,
          averageHeartRate: Math.round(c.average_heart_rate),
          maxHeartRate: Math.round(c.max_heart_rate),
          kilojoules: Math.round(c.kilojoule),
        }
      }
    }

    // Also store in wearable_snapshots for unified readiness access
    const today = new Date().toISOString().split('T')[0]
    if (recovery || sleep) {
      await supabase.from('wearable_snapshots').upsert({
        user_id: user.id,
        source: 'whoop',
        snapshot_date: today,
        recovery_score: recovery?.score ?? null,
        resting_heart_rate: recovery?.restingHeartRate ?? null,
        hrv: recovery?.hrv ?? null,
        sleep_score: sleep?.sleepScore ?? null,
        sleep_duration_ms: sleep?.qualityDuration ?? null,
        deep_sleep_ms: sleep?.deepSleepDuration ?? null,
        strain_score: strain?.score ?? null,
        calories: strain?.kilojoules ? Math.round(strain.kilojoules * 0.239) : null,
        stress_score: null,
        body_battery: null,
        raw_data: { recovery, sleep, strain },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,source,snapshot_date' }).then(({ error }) => {
        if (error) console.error('Failed to store WHOOP snapshot:', error)
      })
    }

    return res.json({
      connected: true,
      recovery,
      sleep,
      strain,
      _debug: {
        tokenExpired: new Date(tokenRow.expires_at) <= new Date(),
        apiStatus: { recovery: recoveryRes.status, sleep: sleepRes.status, cycle: cycleRes.status },
      },
    })
  } catch (err) {
    console.error('WHOOP data fetch error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
