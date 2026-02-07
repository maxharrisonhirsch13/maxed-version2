import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { FeedItem } from '../types'

export function useWorkoutPosts() {
  const { user } = useAuth()
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [feedLoading, setFeedLoading] = useState(false)

  const fetchFeed = useCallback(async () => {
    if (!user) return
    setFeedLoading(true)

    try {
      // Step 1: Fetch workout_posts with joined profile and workout data
      const { data: posts, error: postsErr } = await supabase
        .from('workout_posts')
        .select(`
          id, user_id, workout_id, caption, created_at,
          profiles!workout_posts_user_id_fkey ( id, name, username, avatar_url ),
          workouts!workout_posts_workout_id_fkey ( id, workout_type, started_at, completed_at, duration_minutes )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (postsErr) {
        console.error('Failed to fetch workout posts:', postsErr)
        setFeedLoading(false)
        return
      }

      if (!posts || posts.length === 0) {
        setFeed([])
        setFeedLoading(false)
        return
      }

      // Step 2: Collect unique workout IDs
      const workoutIds = [...new Set(posts.map(p => p.workout_id))]

      // Step 3: Fetch workout_exercises with workout_sets for those workouts
      const { data: exercises, error: exErr } = await supabase
        .from('workout_exercises')
        .select(`
          id, workout_id, exercise_name, sort_order,
          workout_sets ( id, set_number, weight_lbs, reps, duration_minutes, distance_miles )
        `)
        .in('workout_id', workoutIds)
        .order('sort_order', { ascending: true })

      if (exErr) {
        console.error('Failed to fetch workout exercises for feed:', exErr)
      }

      // Build a map: workout_id → exercises[]
      const exercisesByWorkout = new Map<string, FeedItem['workout']['exercises']>()
      for (const ex of exercises ?? []) {
        const wId = ex.workout_id as string
        if (!exercisesByWorkout.has(wId)) {
          exercisesByWorkout.set(wId, [])
        }
        const sets = ((ex.workout_sets as any[]) ?? [])
          .sort((a, b) => a.set_number - b.set_number)
          .map((s: any) => ({
            setNumber: s.set_number,
            weightLbs: s.weight_lbs,
            reps: s.reps,
            durationMinutes: s.duration_minutes,
            distanceMiles: s.distance_miles,
          }))

        exercisesByWorkout.get(wId)!.push({
          exerciseName: ex.exercise_name,
          sets,
        })
      }

      // Step 4: Assemble FeedItem objects
      const feedItems: FeedItem[] = posts.map((p: any) => {
        const profile = p.profiles
        const workout = p.workouts

        return {
          post: {
            id: p.id,
            userId: p.user_id,
            workoutId: p.workout_id,
            caption: p.caption,
            createdAt: p.created_at,
          },
          user: {
            id: profile?.id ?? p.user_id,
            name: profile?.name ?? 'Unknown',
            username: profile?.username ?? null,
            avatarUrl: profile?.avatar_url ?? null,
          },
          workout: {
            id: workout?.id ?? p.workout_id,
            workoutType: workout?.workout_type ?? '',
            startedAt: workout?.started_at ?? '',
            completedAt: workout?.completed_at ?? null,
            durationMinutes: workout?.duration_minutes ?? null,
            exercises: exercisesByWorkout.get(p.workout_id) ?? [],
          },
        }
      })

      setFeed(feedItems)
    } catch (err) {
      console.error('Failed to fetch feed:', err)
    } finally {
      setFeedLoading(false)
    }
  }, [user])

  async function shareWorkout(workoutId: string, caption?: string) {
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('workout_posts').insert({
      user_id: user.id,
      workout_id: workoutId,
      caption: caption?.slice(0, 500) ?? null,
    })

    if (error) throw error
  }

  async function deletePost(postId: string) {
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('workout_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id)

    if (error) throw error
    await fetchFeed()
  }

  return {
    feed,
    feedLoading,
    fetchFeed,
    shareWorkout,
    deletePost,
  }
}
