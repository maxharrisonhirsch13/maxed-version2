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

  return { records, loading, getPR, refetch: fetchPRs }
}
