import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useWorkouts() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

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
    setSaveError(null)

    try {
      // 1. Insert the workout row
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

      if (wErr || !workoutRow) {
        throw new Error(wErr?.message || 'Failed to save workout')
      }

      // 2. Batch insert all exercises at once
      const exerciseInserts = workout.exercises.map(ex => ({
        workout_id: workoutRow.id,
        exercise_name: ex.exerciseName,
        sort_order: ex.sortOrder,
      }))

      const { data: exerciseRows, error: exErr } = await supabase
        .from('workout_exercises')
        .insert(exerciseInserts)
        .select()

      if (exErr || !exerciseRows) {
        // Workout was created but exercises failed — clean up
        await supabase.from('workouts').delete().eq('id', workoutRow.id)
        throw new Error(exErr?.message || 'Failed to save exercises')
      }

      // 3. Batch insert all sets at once
      const allSets: any[] = []
      for (let i = 0; i < workout.exercises.length; i++) {
        const exercise = workout.exercises[i]
        const exRow = exerciseRows[i]
        if (!exRow) continue

        for (const set of exercise.sets) {
          allSets.push({
            workout_exercise_id: exRow.id,
            set_number: set.setNumber,
            weight_lbs: set.weightLbs ?? null,
            reps: set.reps ?? null,
            duration_minutes: set.durationMinutes ?? null,
            distance_miles: set.distanceMiles ?? null,
            speed_mph: set.speedMph ?? null,
            incline_percent: set.inclinePercent ?? null,
            calories_burned: set.caloriesBurned ?? null,
          })
        }
      }

      if (allSets.length > 0) {
        const { error: setErr } = await supabase
          .from('workout_sets')
          .insert(allSets)

        if (setErr) {
          // Exercises were created but sets failed — clean up the whole workout
          await supabase.from('workouts').delete().eq('id', workoutRow.id)
          throw new Error(setErr.message || 'Failed to save sets')
        }
      }

      return workoutRow.id
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save workout'
      setSaveError(msg)
      throw err
    } finally {
      setSaving(false)
    }
  }

  return { saveWorkout, saving, saveError }
}
