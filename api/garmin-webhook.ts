import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

// Garmin pushes data to this endpoint when user metrics update
// Data types: dailies, epochs, sleeps, bodyComps, stressDetails, userMetrics
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    const body = req.body

    // Garmin sends arrays of data summaries. Process each type.
    // Dailies — daily summary with steps, heart rate, stress, Body Battery
    if (body.dailies) {
      for (const daily of body.dailies) {
        const userAccessToken = daily.userAccessToken
        if (!userAccessToken) continue

        // Look up user by their Garmin access token
        const { data: tokenRow } = await supabase
          .from('garmin_tokens')
          .select('user_id')
          .eq('access_token', userAccessToken)
          .single()

        if (!tokenRow) continue

        await supabase.from('wearable_snapshots').upsert({
          user_id: tokenRow.user_id,
          source: 'garmin',
          snapshot_date: new Date(daily.startTimeInSeconds * 1000).toISOString().split('T')[0],
          recovery_score: daily.bodyBatteryMostRecentValue ?? null,
          resting_heart_rate: daily.restingHeartRateInBeatsPerMinute ?? null,
          hrv: daily.averageStressLevel != null ? Math.max(0, 100 - daily.averageStressLevel) : null, // Invert stress to recovery proxy
          sleep_score: null,
          sleep_duration_ms: null,
          deep_sleep_ms: null,
          strain_score: daily.activeKilocalories ? Math.min(21, Math.round(daily.activeKilocalories / 100)) : null,
          calories: daily.activeKilocalories ?? null,
          stress_score: daily.averageStressLevel ?? null,
          body_battery: daily.bodyBatteryMostRecentValue ?? null,
          raw_data: daily,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,source,snapshot_date' })
      }
    }

    // Sleeps — sleep summary data
    if (body.sleeps) {
      for (const sleep of body.sleeps) {
        const userAccessToken = sleep.userAccessToken
        if (!userAccessToken) continue

        const { data: tokenRow } = await supabase
          .from('garmin_tokens')
          .select('user_id')
          .eq('access_token', userAccessToken)
          .single()

        if (!tokenRow) continue

        const totalSleepMs = (sleep.durationInSeconds || 0) * 1000
        const deepSleepMs = (sleep.deepSleepDurationInSeconds || 0) * 1000
        const lightSleepMs = (sleep.lightSleepDurationInSeconds || 0) * 1000
        const remSleepMs = (sleep.remSleepInSeconds || 0) * 1000
        const sleepScore = sleep.overallSleepScore?.value ?? null

        const snapshotDate = new Date(sleep.startTimeInSeconds * 1000).toISOString().split('T')[0]

        await supabase.from('wearable_snapshots').upsert({
          user_id: tokenRow.user_id,
          source: 'garmin',
          snapshot_date: snapshotDate,
          sleep_score: sleepScore,
          sleep_duration_ms: totalSleepMs,
          deep_sleep_ms: deepSleepMs,
          raw_data: { ...sleep, lightSleepMs, remSleepMs },
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,source,snapshot_date' })
      }
    }

    // Stress details
    if (body.stressDetails) {
      for (const stress of body.stressDetails) {
        const userAccessToken = stress.userAccessToken
        if (!userAccessToken) continue

        const { data: tokenRow } = await supabase
          .from('garmin_tokens')
          .select('user_id')
          .eq('access_token', userAccessToken)
          .single()

        if (!tokenRow) continue

        const snapshotDate = new Date(stress.startTimeInSeconds * 1000).toISOString().split('T')[0]

        await supabase.from('wearable_snapshots').upsert({
          user_id: tokenRow.user_id,
          source: 'garmin',
          snapshot_date: snapshotDate,
          stress_score: stress.averageStressLevel ?? null,
          body_battery: stress.bodyBatteryMostRecentValue ?? null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,source,snapshot_date' })
      }
    }

    return res.json({ success: true })
  } catch (err) {
    console.error('Garmin webhook error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
