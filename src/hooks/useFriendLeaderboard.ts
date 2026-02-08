import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { computeStreak } from '../utils/streaks'

export interface LeaderboardEntry {
  userId: string
  name: string
  username: string | null
  avatarUrl: string | null
  workoutsThisWeek: number
  streak: number
  isCurrentUser: boolean
  benchPR: number | null
  squatPR: number | null
  deadliftPR: number | null
}

export function useFriendLeaderboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = useCallback(async () => {
    if (!user) return
    setLoading(true)

    try {
      // Step 1: Get accepted friend IDs
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

      // All user IDs to include (friends + current user)
      const allUserIds = [...friendIds, user.id]

      // Step 2: Batch-fetch profiles for all users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .in('id', allUserIds)

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.id, p])
      )

      // Step 3: Fetch workouts from the past 7 days for all users
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      sevenDaysAgo.setHours(0, 0, 0, 0)
      const sevenDaysAgoStr = sevenDaysAgo.toISOString()

      const { data: recentWorkouts } = await supabase
        .from('workouts')
        .select(`
          id, user_id, started_at,
          workout_exercises (
            workout_sets ( weight_lbs, reps )
          )
        `)
        .in('user_id', allUserIds)
        .gte('started_at', sevenDaysAgoStr)

      // Step 4: Fetch all workout dates for streak calculation
      const { data: allWorkouts } = await supabase
        .from('workouts')
        .select('user_id, started_at')
        .in('user_id', allUserIds)
        .order('started_at', { ascending: false })

      // Build per-user workout date arrays for streaks
      const workoutDatesByUser = new Map<string, string[]>()
      for (const w of allWorkouts ?? []) {
        const dateStr = w.started_at.split('T')[0]
        if (!workoutDatesByUser.has(w.user_id)) {
          workoutDatesByUser.set(w.user_id, [])
        }
        workoutDatesByUser.get(w.user_id)!.push(dateStr)
      }

      // Build per-user weekly stats
      const weeklyCountByUser = new Map<string, number>()
      for (const w of recentWorkouts ?? []) {
        weeklyCountByUser.set(
          w.user_id,
          (weeklyCountByUser.get(w.user_id) ?? 0) + 1
        )
      }

      // Step 5: Fetch Big 3 PRs and privacy settings
      const [{ data: prData }, { data: privacyData }] = await Promise.all([
        supabase
          .from('personal_records')
          .select('user_id, exercise_name, value')
          .in('user_id', allUserIds)
          .in('exercise_name', ['Bench Press', 'Squat', 'Deadlift'])
          .eq('pr_type', 'weight'),
        supabase
          .from('privacy_settings')
          .select('user_id, share_prs')
          .in('user_id', allUserIds),
      ])

      const prMap = new Map<string, { bench: number; squat: number; deadlift: number }>()
      for (const pr of prData ?? []) {
        if (!prMap.has(pr.user_id)) prMap.set(pr.user_id, { bench: 0, squat: 0, deadlift: 0 })
        const entry = prMap.get(pr.user_id)!
        if (pr.exercise_name === 'Bench Press') entry.bench = Number(pr.value)
        else if (pr.exercise_name === 'Squat') entry.squat = Number(pr.value)
        else if (pr.exercise_name === 'Deadlift') entry.deadlift = Number(pr.value)
      }

      const privacyMap = new Map<string, boolean>()
      for (const p of privacyData ?? []) {
        privacyMap.set(p.user_id, p.share_prs === true)
      }

      // Step 6: Assemble leaderboard
      const entries: LeaderboardEntry[] = allUserIds.map((uid) => {
        const profile = profileMap.get(uid)
        const workoutsThisWeek = weeklyCountByUser.get(uid) ?? 0
        const dates = workoutDatesByUser.get(uid) ?? []
        const streak = computeStreak(dates)
        const prs = prMap.get(uid)
        const sharePRs = privacyMap.get(uid) ?? true
        const showPRs = uid === user.id || sharePRs

        return {
          userId: uid,
          name: profile?.name ?? 'Unknown',
          username: profile?.username ?? null,
          avatarUrl: profile?.avatar_url ?? null,
          workoutsThisWeek,
          streak,
          isCurrentUser: uid === user.id,
          benchPR: showPRs && prs ? prs.bench || null : null,
          squatPR: showPRs && prs ? prs.squat || null : null,
          deadliftPR: showPRs && prs ? prs.deadlift || null : null,
        }
      })

      // Sort by workouts this week (descending)
      entries.sort((a, b) => b.workoutsThisWeek - a.workoutsThisWeek)

      setLeaderboard(entries)
    } catch (err) {
      console.error('Failed to fetch friend leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return { leaderboard, loading, refetch: fetchLeaderboard }
}
