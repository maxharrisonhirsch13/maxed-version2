import { useState, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

export interface AIWorkoutSuggestion {
  exerciseName: string
  weight: number
  reps: string
  sets: number
  note: string
}

export interface AISetUpdate {
  weight: number
  reps: string
  note: string
}

export interface AIReadinessResult {
  readinessScore: number
  coachingText: string
  intensityRecommendation: string
  recommendation: string
}

export function useAICoach() {
  const { session } = useAuth()

  // Workout suggestions state
  const [workoutSuggestions, setWorkoutSuggestions] = useState<AIWorkoutSuggestion[] | null>(null)
  const [workoutLoading, setWorkoutLoading] = useState(false)

  // Live set update state
  const [setUpdateLoading, setSetUpdateLoading] = useState(false)
  const setUpdateAbortRef = useRef<AbortController | null>(null)

  // Readiness state
  const [readiness, setReadiness] = useState<AIReadinessResult | null>(null)
  const [readinessLoading, setReadinessLoading] = useState(false)

  // Cache readiness for 30 minutes
  const readinessCacheRef = useRef<{ data: AIReadinessResult; timestamp: number } | null>(null)

  const fetchWorkoutSuggestions = useCallback(async (payload: {
    exercises: {
      name: string
      muscleGroups: string
      sets: number
      defaultSuggestion: { weight: number; reps: string }
      history: { date: string; sets: { weight: number; reps: number }[] }[]
    }[]
    userProfile: {
      experience: string | null
      goal: string | null
      weightLbs: number | null
      homeEquipment?: any
    }
    recovery: {
      score: number | null
      hrv: number | null
      sleepScore: number | null
    } | null
  }) => {
    if (!session?.access_token) return
    setWorkoutLoading(true)
    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ type: 'workout-suggestions', ...payload }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.suggestions) {
          setWorkoutSuggestions(data.suggestions)
        }
      }
    } catch {
      // Silently fail — hardcoded defaults remain
    }
    setWorkoutLoading(false)
  }, [session?.access_token])

  const fetchReadiness = useCallback(async (payload: {
    whoopData: any
    recentWorkouts: { date: string; type: string; durationMinutes: number }[]
    userProfile: { experience: string | null; goal: string | null }
  }) => {
    if (!session?.access_token) return

    // Check cache
    if (readinessCacheRef.current && Date.now() - readinessCacheRef.current.timestamp < 30 * 60 * 1000) {
      setReadiness(readinessCacheRef.current.data)
      return
    }

    setReadinessLoading(true)
    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ type: 'readiness', ...payload }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.readinessScore != null) {
          setReadiness(data)
          readinessCacheRef.current = { data, timestamp: Date.now() }
        }
      }
    } catch {
      // Silently fail — hardcoded text remains
    }
    setReadinessLoading(false)
  }, [session?.access_token])

  const fetchSetUpdate = useCallback(async (payload: {
    exercise: string
    completedSets: { weight: number; reps: number }[]
    setsRemaining: number
    goal: string | null
  }): Promise<AISetUpdate | null> => {
    if (!session?.access_token) return null

    // Abort any in-flight set update request
    if (setUpdateAbortRef.current) {
      setUpdateAbortRef.current.abort()
    }
    const controller = new AbortController()
    setUpdateAbortRef.current = controller

    setSetUpdateLoading(true)
    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ type: 'set-update', ...payload }),
        signal: controller.signal,
      })
      if (res.ok) {
        const data = await res.json()
        if (data.weight != null) {
          setSetUpdateLoading(false)
          return data as AISetUpdate
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return null
    }
    setSetUpdateLoading(false)
    return null
  }, [session?.access_token])

  return {
    workoutSuggestions, workoutLoading, fetchWorkoutSuggestions,
    setUpdateLoading, fetchSetUpdate,
    readiness, readinessLoading, fetchReadiness,
  }
}
