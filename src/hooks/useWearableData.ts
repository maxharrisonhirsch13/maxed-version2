import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export interface WearableSnapshot {
  source: string
  snapshotDate: string
  recoveryScore: number | null
  restingHeartRate: number | null
  hrv: number | null
  sleepScore: number | null
  sleepDurationMs: number | null
  deepSleepMs: number | null
  strainScore: number | null
  calories: number | null
  stressScore: number | null
  bodyBattery: number | null
}

export function useWearableData() {
  const { user } = useAuth()
  const [data, setData] = useState<WearableSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!user) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      // Get the most recent snapshot from any source for today (or most recent day)
      const today = new Date().toISOString().split('T')[0]
      const { data: rows, error } = await supabase
        .from('wearable_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .lte('snapshot_date', today)
        .order('snapshot_date', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Failed to fetch wearable data:', error)
        setData(null)
        setLoading(false)
        return
      }

      if (!rows || rows.length === 0) {
        setData(null)
        setLoading(false)
        return
      }

      // Prefer today's data; merge across sources if multiple exist for same date
      const latestDate = rows[0].snapshot_date
      const todayRows = rows.filter(r => r.snapshot_date === latestDate)

      // Merge: prefer non-null values, prioritize WHOOP > Oura > Garmin
      const priorityOrder = ['whoop', 'oura', 'garmin']
      todayRows.sort((a, b) => priorityOrder.indexOf(a.source) - priorityOrder.indexOf(b.source))

      const merged: WearableSnapshot = {
        source: todayRows[0].source,
        snapshotDate: latestDate,
        recoveryScore: null,
        restingHeartRate: null,
        hrv: null,
        sleepScore: null,
        sleepDurationMs: null,
        deepSleepMs: null,
        strainScore: null,
        calories: null,
        stressScore: null,
        bodyBattery: null,
      }

      // Fill from each source, first non-null wins
      for (const row of todayRows) {
        if (merged.recoveryScore == null && row.recovery_score != null) merged.recoveryScore = row.recovery_score
        if (merged.restingHeartRate == null && row.resting_heart_rate != null) merged.restingHeartRate = row.resting_heart_rate
        if (merged.hrv == null && row.hrv != null) merged.hrv = row.hrv
        if (merged.sleepScore == null && row.sleep_score != null) merged.sleepScore = row.sleep_score
        if (merged.sleepDurationMs == null && row.sleep_duration_ms != null) merged.sleepDurationMs = row.sleep_duration_ms
        if (merged.deepSleepMs == null && row.deep_sleep_ms != null) merged.deepSleepMs = row.deep_sleep_ms
        if (merged.strainScore == null && row.strain_score != null) merged.strainScore = row.strain_score
        if (merged.calories == null && row.calories != null) merged.calories = row.calories
        if (merged.stressScore == null && row.stress_score != null) merged.stressScore = row.stress_score
        if (merged.bodyBattery == null && row.body_battery != null) merged.bodyBattery = row.body_battery
      }

      // Track which sources contributed
      merged.source = todayRows.map(r => r.source).join('+')

      setData(merged)
    } catch (err) {
      console.error('Wearable data error:', err)
      setData(null)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, refetch: fetchData }
}
