import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { computeStreak } from '../utils/streaks'

interface LeaderboardEntry {
  userId: string
  name: string
  username: string | null
  avatarUrl: string | null
  workoutsThisWeek: number
  streak: number
  isCurrentUser: boolean
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

      // Step 5: Assemble leaderboard
      const entries: LeaderboardEntry[] = allUserIds.map((uid) => {
        const profile = profileMap.get(uid)
        const workoutsThisWeek = weeklyCountByUser.get(uid) ?? 0
        const dates = workoutDatesByUser.get(uid) ?? []
        const streak = computeStreak(dates)

        return {
          userId: uid,
          name: profile?.name ?? 'Unknown',
          username: profile?.username ?? null,
          avatarUrl: profile?.avatar_url ?? null,
          workoutsThisWeek,
          streak,
          isCurrentUser: uid === user.id,
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
