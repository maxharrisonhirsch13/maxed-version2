import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { PersonalRecord } from '../types'

export function usePersonalRecords() {
  const { user } = useAuth()
  const [records, setRecords] = useState<PersonalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchPRs()
  }, [user])

  async function fetchPRs() {
    if (!user) return
    const { data, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', user.id)

    if (!error && data) {
      setRecords(data.map((r: any) => ({
        exerciseName: r.exercise_name,
        prType: r.pr_type as PersonalRecord['prType'],
        value: Number(r.value),
        unit: r.unit,
        achievedAt: r.achieved_at,
      })))
    }
    setLoading(false)
  }

  function getPR(exerciseName: string, type: string = 'weight') {
    return records.find(r => r.exerciseName === exerciseName && r.prType === type)
  }

  async function upsertPR(exerciseName: string, value: number) {
    if (!user) return
    const { error } = await supabase
      .from('personal_records')
      .upsert({
        user_id: user.id,
        exercise_name: exerciseName,
        pr_type: 'weight',
        value,
        unit: 'lbs',
        achieved_at: new Date().toISOString(),
      }, { onConflict: 'user_id,exercise_name,pr_type' })
    if (error) console.error('Failed to upsert PR:', error)
  }

  async function upsertBig3PRs(bench: number, squat: number, deadlift: number) {
    const entries: [string, number][] = [
      ['Bench Press', bench],
      ['Squat', squat],
      ['Deadlift', deadlift],
    ]
    for (const [name, value] of entries) {
      if (value > 0) await upsertPR(name, value)
    }
    await fetchPRs()
  }

  return { records, loading, getPR, upsertPR, upsertBig3PRs, refetch: fetchPRs }
}
