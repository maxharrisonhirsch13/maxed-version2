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
  const clientId = process.env.OURA_CLIENT_ID
  const clientSecret = process.env.OURA_CLIENT_SECRET

  if (!supabaseUrl || !serviceRoleKey || !anonKey || !clientId || !clientSecret) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const userToken = authHeader.replace('Bearer ', '')
    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(userToken)

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data: tokenRow, error: dbError } = await supabase
      .from('oura_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (dbError || !tokenRow) {
      return res.json({ connected: false, readiness: null, sleep: null })
    }

    let accessToken = tokenRow.access_token

    // Refresh token if expired
    if (new Date(tokenRow.expires_at) <= new Date()) {
      const refreshRes = await fetch('https://api.ouraring.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokenRow.refresh_token,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      })

      if (!refreshRes.ok) {
        console.error('Oura token refresh failed:', refreshRes.status)
        await supabase.from('oura_tokens').delete().eq('user_id', user.id)
        return res.json({ connected: false, readiness: null, sleep: null })
      }

      const refreshData = await refreshRes.json()
      accessToken = refreshData.access_token
      const expiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString()

      await supabase.from('oura_tokens').update({
        access_token: refreshData.access_token,
        refresh_token: refreshData.refresh_token,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id)
    }

    // Fetch today's data from Oura API v2
    const today = new Date().toISOString().split('T')[0]
    const headers = { Authorization: `Bearer ${accessToken}` }

    const [readinessRes, sleepRes] = await Promise.all([
      fetch(`https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${today}&end_date=${today}`, { headers }),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${today}&end_date=${today}`, { headers }),
    ])

    let readiness = null
    let sleep = null

    if (readinessRes.ok) {
      const readinessData = await readinessRes.json()
      const r = readinessData.data?.[0]
      if (r) {
        readiness = {
          score: r.score ?? null,
          temperatureDeviation: r.temperature_deviation ?? null,
          hrv: r.contributors?.hrv_balance ?? null,
          restingHeartRate: r.contributors?.resting_heart_rate ?? null,
        }
      }
    }

    if (sleepRes.ok) {
      const sleepData = await sleepRes.json()
      const s = sleepData.data?.[0]
      if (s) {
        sleep = {
          score: s.score ?? null,
          totalSleepDuration: s.contributors?.total_sleep ?? null,
          deepSleep: s.contributors?.deep_sleep ?? null,
          remSleep: s.contributors?.rem_sleep ?? null,
          efficiency: s.contributors?.efficiency ?? null,
        }
      }
    }

    // Also store in wearable_snapshots for AI coach
    if (readiness || sleep) {
      await supabase.from('wearable_snapshots').upsert({
        user_id: user.id,
        source: 'oura',
        snapshot_date: today,
        recovery_score: readiness?.score ?? null,
        resting_heart_rate: null,
        hrv: readiness?.hrv ?? null,
        sleep_score: sleep?.score ?? null,
        sleep_duration_ms: null,
        deep_sleep_ms: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,source,snapshot_date' })
    }

    return res.json({ connected: true, readiness, sleep })
  } catch (err) {
    console.error('Oura data fetch error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
