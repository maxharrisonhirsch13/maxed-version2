import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { FeedItem, ReactionEmoji, ReactionSummary, PostComment } from '../types'

const REACTION_EMOJIS: ReactionEmoji[] = ['fire', 'strong', 'cap', 'hundred', 'clap']

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
        .select('id, user_id, workout_id, caption, image_url, tagged_user_ids, created_at')
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

      const postIds = posts.map(p => p.id)

      // Step 2: Collect unique user_ids (including tagged) and workout_ids
      const allUserIds = new Set(posts.map(p => p.user_id))
      for (const p of posts) {
        for (const tid of (p.tagged_user_ids ?? [])) {
          allUserIds.add(tid)
        }
      }
      const userIds = [...allUserIds]
      const workoutIds = [...new Set(posts.map(p => p.workout_id))]

      // Step 3: Fetch profiles, workouts, exercises, reactions, comment counts in parallel
      const [
        { data: profiles, error: profilesErr },
        { data: workouts, error: workoutsErr },
        { data: exercises, error: exErr },
        { data: reactionsData },
        { data: commentsData },
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, name, username, avatar_url')
          .in('id', userIds),
        supabase
          .from('workouts')
          .select('id, workout_type, started_at, completed_at, duration_minutes')
          .in('id', workoutIds),
        supabase
          .from('workout_exercises')
          .select(`
            id, workout_id, exercise_name, sort_order,
            workout_sets ( id, set_number, weight_lbs, reps, duration_minutes, distance_miles )
          `)
          .in('workout_id', workoutIds)
          .order('sort_order', { ascending: true }),
        supabase
          .from('post_reactions')
          .select('post_id, user_id, emoji')
          .in('post_id', postIds),
        supabase
          .from('post_comments')
          .select('post_id')
          .in('post_id', postIds),
      ])

      if (profilesErr) console.error('Failed to fetch profiles for feed:', profilesErr)
      if (workoutsErr) console.error('Failed to fetch workouts for feed:', workoutsErr)
      if (exErr) console.error('Failed to fetch workout exercises for feed:', exErr)

      // Build profile map
      const profilesByUserId = new Map<string, { id: string; name: string; username: string | null; avatar_url: string | null }>()
      for (const profile of profiles ?? []) {
        profilesByUserId.set(profile.id, profile)
      }

      // Build workout map
      const workoutsByWorkoutId = new Map<string, { id: string; workout_type: string; started_at: string; completed_at: string | null; duration_minutes: number | null }>()
      for (const workout of workouts ?? []) {
        workoutsByWorkoutId.set(workout.id, workout)
      }

      // Build exercises map
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

      // Build reactions map: postId → ReactionSummary[]
      const reactionsMap = new Map<string, ReactionSummary[]>()
      for (const postId of postIds) {
        const postReactions = (reactionsData ?? []).filter(r => r.post_id === postId)
        const summaries: ReactionSummary[] = REACTION_EMOJIS.map(emoji => {
          const matching = postReactions.filter(r => r.emoji === emoji)
          return {
            emoji,
            count: matching.length,
            reacted: matching.some(r => r.user_id === user.id),
          }
        })
        reactionsMap.set(postId, summaries)
      }

      // Build comment count map
      const commentCountMap = new Map<string, number>()
      for (const c of commentsData ?? []) {
        commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) ?? 0) + 1)
      }

      // Step 4: Combine everything into FeedItem objects
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
            imageUrl: p.image_url ?? null,
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
          reactions: reactionsMap.get(p.id) ?? REACTION_EMOJIS.map(emoji => ({ emoji, count: 0, reacted: false })),
          commentCount: commentCountMap.get(p.id) ?? 0,
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

  async function shareWorkout(workoutId: string, caption?: string, taggedUserIds?: string[], imageFile?: File) {
    if (!user) throw new Error('Not authenticated')

    const trimmedCaption = caption?.slice(0, 500) ?? null

    // Upload image if provided
    let imageUrl: string | null = null
    if (imageFile) {
      const ext = imageFile.name.split('.').pop() || 'jpg'
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('post-images')
        .upload(path, imageFile, { contentType: imageFile.type })

      if (uploadErr) {
        console.error('Failed to upload image:', uploadErr)
      } else {
        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(path)
        imageUrl = urlData.publicUrl
      }
    }

    // Insert the post and get its ID back
    const { data: postData, error } = await supabase
      .from('workout_posts')
      .insert({
        user_id: user.id,
        workout_id: workoutId,
        caption: trimmedCaption,
        image_url: imageUrl,
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

  async function toggleReaction(postId: string, emoji: ReactionEmoji) {
    if (!user) return

    // Find current state from feed
    const item = feed.find(f => f.post.id === postId)
    const currentReaction = item?.reactions.find(r => r.emoji === emoji)
    const alreadyReacted = currentReaction?.reacted ?? false

    // Optimistic update
    setFeed(prev => prev.map(f => {
      if (f.post.id !== postId) return f
      return {
        ...f,
        reactions: f.reactions.map(r =>
          r.emoji === emoji
            ? { ...r, count: alreadyReacted ? Math.max(0, r.count - 1) : r.count + 1, reacted: !alreadyReacted }
            : r
        ),
      }
    }))

    if (alreadyReacted) {
      await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
    } else {
      await supabase
        .from('post_reactions')
        .insert({ post_id: postId, user_id: user.id, emoji })

      // Send notification to post owner (if not self)
      const postOwnerId = item?.post.userId
      if (postOwnerId && postOwnerId !== user.id) {
        await supabase.from('notifications').insert({
          user_id: postOwnerId,
          type: 'reaction',
          actor_id: user.id,
          post_id: postId,
        })
      }
    }
  }

  async function addComment(postId: string, body: string): Promise<PostComment | null> {
    if (!user) return null

    const trimmed = body.trim().slice(0, 500)
    if (!trimmed) return null

    // Optimistic increment
    setFeed(prev => prev.map(f =>
      f.post.id === postId ? { ...f, commentCount: f.commentCount + 1 } : f
    ))

    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: user.id, body: trimmed })
      .select('id, created_at')
      .single()

    if (error) {
      console.error('Failed to add comment:', error)
      // Revert optimistic
      setFeed(prev => prev.map(f =>
        f.post.id === postId ? { ...f, commentCount: Math.max(0, f.commentCount - 1) } : f
      ))
      return null
    }

    // Send notification to post owner
    const item = feed.find(f => f.post.id === postId)
    const postOwnerId = item?.post.userId
    if (postOwnerId && postOwnerId !== user.id) {
      await supabase.from('notifications').insert({
        user_id: postOwnerId,
        type: 'comment',
        actor_id: user.id,
        post_id: postId,
      })
    }

    // Fetch current user profile for the returned comment
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, username, avatar_url')
      .eq('id', user.id)
      .single()

    return {
      id: data.id,
      userId: user.id,
      userName: profile?.name ?? 'You',
      userUsername: profile?.username ?? null,
      userAvatarUrl: profile?.avatar_url ?? null,
      body: trimmed,
      createdAt: data.created_at,
    }
  }

  async function fetchComments(postId: string): Promise<PostComment[]> {
    const { data: rows, error } = await supabase
      .from('post_comments')
      .select('id, user_id, body, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error || !rows) {
      console.error('Failed to fetch comments:', error)
      return []
    }

    // Fetch profiles for comment authors
    const authorIds = [...new Set(rows.map(r => r.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, username, avatar_url')
      .in('id', authorIds)

    const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

    return rows.map(r => {
      const p = profileMap.get(r.user_id)
      return {
        id: r.id,
        userId: r.user_id,
        userName: p?.name ?? 'Unknown',
        userUsername: p?.username ?? null,
        userAvatarUrl: p?.avatar_url ?? null,
        body: r.body,
        createdAt: r.created_at,
      }
    })
  }

  async function deleteComment(commentId: string, postId: string) {
    if (!user) return

    // Optimistic decrement
    setFeed(prev => prev.map(f =>
      f.post.id === postId ? { ...f, commentCount: Math.max(0, f.commentCount - 1) } : f
    ))

    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('Failed to delete comment:', error)
      // Revert
      setFeed(prev => prev.map(f =>
        f.post.id === postId ? { ...f, commentCount: f.commentCount + 1 } : f
      ))
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
    toggleReaction,
    addComment,
    fetchComments,
    deleteComment,
  }
}
