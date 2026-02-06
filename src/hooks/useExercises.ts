import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface ExerciseRef {
  id: string
  name: string
  muscleGroups: string[]
  equipment: string | null
  category: string | null
  videoId: string | null
}

export function useExercises(category?: string) {
  const [exercises, setExercises] = useState<ExerciseRef[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExercises()
  }, [category])

  async function fetchExercises() {
    let query = supabase.from('exercises').select('*')
    if (category) query = query.eq('category', category)
    query = query.order('name')

    const { data, error } = await query
    if (!error && data) {
      setExercises(data.map((e: any) => ({
        id: e.id,
        name: e.name,
        muscleGroups: e.muscle_groups,
        equipment: e.equipment,
        category: e.category,
        videoId: e.video_id,
      })))
    }
    setLoading(false)
  }

  return { exercises, loading }
}
