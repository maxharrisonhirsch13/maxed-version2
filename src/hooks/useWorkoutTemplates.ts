import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export interface WorkoutTemplate {
  id: string
  name: string
  muscleGroup: string
  exercises: { name: string; sets: number }[]
  createdAt: string
}

export function useWorkoutTemplates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTemplates = useCallback(async (muscleGroup?: string) => {
    if (!user) return
    setLoading(true)

    let query = supabase
      .from('workout_templates')
      .select('id, name, muscle_group, exercises, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (muscleGroup) {
      query = query.eq('muscle_group', muscleGroup)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch templates:', error)
      setLoading(false)
      return
    }

    setTemplates(
      (data ?? []).map((t: any) => ({
        id: t.id,
        name: t.name,
        muscleGroup: t.muscle_group,
        exercises: t.exercises ?? [],
        createdAt: t.created_at,
      }))
    )
    setLoading(false)
  }, [user])

  const saveTemplate = useCallback(async (
    name: string,
    muscleGroup: string,
    exercises: { name: string; sets: number }[]
  ) => {
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('workout_templates')
      .insert({
        user_id: user.id,
        name,
        muscle_group: muscleGroup,
        exercises,
      })

    if (error) throw error
  }, [user])

  const deleteTemplate = useCallback(async (id: string) => {
    if (!user) return

    const { error } = await supabase
      .from('workout_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to delete template:', error)
      return
    }

    setTemplates(prev => prev.filter(t => t.id !== id))
  }, [user])

  return { templates, loading, fetchTemplates, saveTemplate, deleteTemplate }
}
