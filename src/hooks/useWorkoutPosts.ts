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
      // Step 0: Get accepted friend IDs
      const [{ data: asRequester }, { data: asAddressee }] = await Promise.all([
        supabase
          .from('friendships')
          .select('addressee_id')
          .eq('requester_id', user.id)
          .eq('status', 'accepted'),
        supabase
          .from('friendships')
          .select('requester_id')
          .eq('addressee_id', user.id)
          .eq('status', 'accepted'),
      ])

      const friendIds: string[] = [
        ...(asRequester ?? []).map((r) => r.addressee_id),
        ...(asAddressee ?? []).map((r) => r.requester_id),
      ]
      const feedUserIds = [...friendIds, user.id]

      // Step 1: Fetch workout_posts from friends + self only
      const { data: posts, error: postsErr } = await supabase
        .from('workout_posts')
        .select('id, user_id, workout_id, caption, tagged_user_ids, created_at')
        .in('user_id', feedUserIds)
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

      // Step 2: Collect unique user_ids (including tagged) and workout_ids
      const allUserIds = new Set(posts.map(p => p.user_id))
      for (const p of posts) {
        for (const tid of (p.tagged_user_ids ?? [])) {
          allUserIds.add(tid)
        }
      }
      const userIds = [...allUserIds]
      const workoutIds = [...new Set(posts.map(p => p.workout_id))]

      // Step 3: Fetch profiles separately for those user_ids
      const { data: profiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .in('id', userIds)

      if (profilesErr) {
        console.error('Failed to fetch profiles for feed:', profilesErr)
      }

      // Build a map: user_id → profile
      const profilesByUserId = new Map<string, { id: string; name: string; username: string | null; avatar_url: string | null }>()
      for (const profile of profiles ?? []) {
        profilesByUserId.set(profile.id, profile)
      }

      // Step 4: Fetch workouts separately for those workout_ids
      const { data: workouts, error: workoutsErr } = await supabase
        .from('workouts')
        .select('id, workout_type, started_at, completed_at, duration_minutes')
        .in('id', workoutIds)

      if (workoutsErr) {
        console.error('Failed to fetch workouts for feed:', workoutsErr)
      }

      // Build a map: workout_id → workout
      const workoutsByWorkoutId = new Map<string, { id: string; workout_type: string; started_at: string; completed_at: string | null; duration_minutes: number | null }>()
      for (const workout of workouts ?? []) {
        workoutsByWorkoutId.set(workout.id, workout)
      }

      // Step 5: Fetch workout_exercises with workout_sets for those workout_ids
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

      // Step 6: Combine everything into FeedItem objects
      const feedItems: FeedItem[] = posts.map((p: any) => {
        const profile = profilesByUserId.get(p.user_id)
        const workout = workoutsByWorkoutId.get(p.workout_id)

        // Resolve tagged users
        const taggedIds: string[] = p.tagged_user_ids ?? []
        const taggedUsers = taggedIds
          .map(id => {
            const tp = profilesByUserId.get(id)
            return tp ? { id: tp.id, name: tp.name, username: tp.username } : null
          })
          .filter(Boolean) as { id: string; name: string; username: string | null }[]

        return {
          post: {
            id: p.id,
            userId: p.user_id,
            workoutId: p.workout_id,
            caption: p.caption,
            taggedUserIds: taggedIds,
            createdAt: p.created_at,
          },
          user: {
            id: profile?.id ?? p.user_id,
            name: profile?.name ?? 'Unknown',
            username: profile?.username ?? null,
            avatarUrl: profile?.avatar_url ?? null,
          },
          taggedUsers,
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

  async function shareWorkout(workoutId: string, caption?: string, taggedUserIds?: string[]) {
    if (!user) throw new Error('Not authenticated')

    const trimmedCaption = caption?.slice(0, 500) ?? null

    // Insert the post and get its ID back
    const { data: postData, error } = await supabase
      .from('workout_posts')
      .insert({
        user_id: user.id,
        workout_id: workoutId,
        caption: trimmedCaption,
        tagged_user_ids: taggedUserIds && taggedUserIds.length > 0 ? taggedUserIds : null,
      })
      .select('id')
      .single()

    if (error) throw error

    const postId = postData?.id
    if (!postId) return

    // Resolve @mentions from caption to user IDs
    const mentionedUsernames = trimmedCaption?.match(/@(\w+)/g)?.map(m => m.slice(1)) ?? []
    let mentionedUserIds: string[] = []

    if (mentionedUsernames.length > 0) {
      const { data: mentionedProfiles } = await supabase
        .from('profiles')
        .select('id')
        .in('username', mentionedUsernames)

      mentionedUserIds = (mentionedProfiles ?? []).map(p => p.id)
    }

    // Combine tagged + mentioned user IDs, exclude self
    const allNotifyIds = new Set<string>([
      ...(taggedUserIds ?? []),
      ...mentionedUserIds,
    ])
    allNotifyIds.delete(user.id)

    if (allNotifyIds.size > 0) {
      const notifications = [...allNotifyIds].map(uid => ({
        user_id: uid,
        type: (taggedUserIds ?? []).includes(uid) ? 'tag' : 'mention',
        actor_id: user.id,
        post_id: postId,
      }))

      await supabase.from('notifications').insert(notifications)
    }
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
