import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { WorkoutLog } from '../types'

export function useWorkoutHistory(options?: {
  limit?: number
  startDate?: string
  endDate?: string
}) {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWorkouts = useCallback(async () => {
    if (!user) return
    setLoading(true)

    let query = supabase
      .from('workouts')
      .select(`
        id, user_id, workout_type, started_at, completed_at, duration_minutes,
        workout_exercises (
          id, exercise_name, sort_order,
          workout_sets (
            id, set_number, weight_lbs, reps,
            duration_minutes, distance_miles, speed_mph,
            incline_percent, calories_burned
          )
        )
      `)
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })

    if (options?.limit) query = query.limit(options.limit)
    if (options?.startDate) query = query.gte('started_at', options.startDate)
    if (options?.endDate) query = query.lte('started_at', options.endDate)

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch workouts:', error)
      setLoading(false)
      return
    }

    const mapped: WorkoutLog[] = (data ?? []).map((w: any) => ({
      id: w.id,
      userId: w.user_id,
      workoutType: w.workout_type,
      startedAt: w.started_at,
      completedAt: w.completed_at,
      durationMinutes: w.duration_minutes,
      exercises: (w.workout_exercises ?? [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((ex: any) => ({
          id: ex.id,
          exerciseName: ex.exercise_name,
          sortOrder: ex.sort_order,
          sets: (ex.workout_sets ?? [])
            .sort((a: any, b: any) => a.set_number - b.set_number)
            .map((s: any) => ({
              id: s.id,
              setNumber: s.set_number,
              weightLbs: s.weight_lbs,
              reps: s.reps,
              durationMinutes: s.duration_minutes,
              distanceMiles: s.distance_miles,
              speedMph: s.speed_mph,
              inclinePercent: s.incline_percent,
              caloriesBurned: s.calories_burned,
            })),
        })),
    }))

    setWorkouts(mapped)
    setLoading(false)
  }, [user, options?.startDate, options?.endDate, options?.limit])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  return { workouts, loading, refetch: fetchWorkouts }
}
