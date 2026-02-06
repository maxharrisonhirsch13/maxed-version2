import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useWorkouts() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)

  async function saveWorkout(workout: {
    workoutType: string
    startedAt: string
    durationMinutes: number
    exercises: {
      exerciseName: string
      sortOrder: number
      sets: {
        setNumber: number
        weightLbs?: number
        reps?: number
        durationMinutes?: number
        distanceMiles?: number
        speedMph?: number
        inclinePercent?: number
        caloriesBurned?: number
      }[]
    }[]
  }) {
    if (!user) throw new Error('Not authenticated')
    setSaving(true)

    try {
      // Insert the workout
      const { data: workoutRow, error: wErr } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          workout_type: workout.workoutType,
          started_at: workout.startedAt,
          completed_at: new Date().toISOString(),
          duration_minutes: workout.durationMinutes,
        })
        .select()
        .single()

      if (wErr || !workoutRow) throw wErr

      // Insert exercises and sets
      for (const exercise of workout.exercises) {
        const { data: exRow, error: exErr } = await supabase
          .from('workout_exercises')
          .insert({
            workout_id: workoutRow.id,
            exercise_name: exercise.exerciseName,
            sort_order: exercise.sortOrder,
          })
          .select()
          .single()

        if (exErr || !exRow) throw exErr

        if (exercise.sets.length > 0) {
          const setsToInsert = exercise.sets.map(set => ({
            workout_exercise_id: exRow.id,
            set_number: set.setNumber,
            weight_lbs: set.weightLbs ?? null,
            reps: set.reps ?? null,
            duration_minutes: set.durationMinutes ?? null,
            distance_miles: set.distanceMiles ?? null,
            speed_mph: set.speedMph ?? null,
            incline_percent: set.inclinePercent ?? null,
            calories_burned: set.caloriesBurned ?? null,
          }))

          const { error: setErr } = await supabase
            .from('workout_sets')
            .insert(setsToInsert)

          if (setErr) throw setErr
        }
      }

      return workoutRow.id
    } finally {
      setSaving(false)
    }
  }

  return { saveWorkout, saving }
}
