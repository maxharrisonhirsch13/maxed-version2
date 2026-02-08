import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export interface GlobalLeaderboardEntry {
  userId: string
  name: string
  username: string | null
  avatarUrl: string | null
  benchPR: number
  squatPR: number
  deadliftPR: number
  total: number
  isCurrentUser: boolean
}

export function useGlobalLeaderboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<GlobalLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGlobal = useCallback(async () => {
    if (!user) return
    setLoading(true)

    try {
      // Step 1: Fetch all Big 3 PRs
      const { data: prData } = await supabase
        .from('personal_records')
        .select('user_id, exercise_name, value')
        .in('exercise_name', ['Bench Press', 'Squat', 'Deadlift'])
        .eq('pr_type', 'weight')

      if (!prData || prData.length === 0) {
        setEntries([])
        setLoading(false)
        return
      }

      // Build per-user PR totals
      const prMap = new Map<string, { bench: number; squat: number; deadlift: number }>()
      for (const pr of prData) {
        if (!prMap.has(pr.user_id)) prMap.set(pr.user_id, { bench: 0, squat: 0, deadlift: 0 })
        const entry = prMap.get(pr.user_id)!
        if (pr.exercise_name === 'Bench Press') entry.bench = Number(pr.value)
        else if (pr.exercise_name === 'Squat') entry.squat = Number(pr.value)
        else if (pr.exercise_name === 'Deadlift') entry.deadlift = Number(pr.value)
      }

      const allUserIds = [...prMap.keys()]

      // Step 2: Fetch profiles and privacy settings
      const [profilesResult, privacyResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, name, username, avatar_url')
          .in('id', allUserIds),
        supabase
          .from('privacy_settings')
          .select('user_id, share_prs, profile_visibility')
          .in('user_id', allUserIds),
      ])
      console.log('[GLOBAL LB DEBUG] allUserIds:', allUserIds)
      console.log('[GLOBAL LB DEBUG] profiles:', profilesResult)
      console.log('[GLOBAL LB DEBUG] privacy:', privacyResult)
      const profiles = profilesResult.data
      const privacyData = privacyResult.data

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.id, p])
      )
      const privacyMap = new Map(
        (privacyData ?? []).map((p) => [p.user_id, p])
      )

      // Step 3: Filter and build entries
      const result: GlobalLeaderboardEntry[] = []
      for (const [uid, prs] of prMap) {
        const profile = profileMap.get(uid)
        const privacy = privacyMap.get(uid)
        const sharePRs = privacy?.share_prs ?? true
        const isCurrentUser = uid === user.id
        const visibility = privacy?.profile_visibility

        // Include if current user, or if share_prs=true and not private profile
        if (!isCurrentUser && (!sharePRs || visibility === 'private')) continue

        const total = prs.bench + prs.squat + prs.deadlift
        if (total === 0) continue

        result.push({
          userId: uid,
          name: profile?.name ?? 'Unknown',
          username: profile?.username ?? null,
          avatarUrl: profile?.avatar_url ?? null,
          benchPR: prs.bench,
          squatPR: prs.squat,
          deadliftPR: prs.deadlift,
          total,
          isCurrentUser,
        })
      }

      // Sort by total descending, take top 20
      result.sort((a, b) => b.total - a.total)
      setEntries(result.slice(0, 20))
    } catch (err) {
      console.error('Failed to fetch global leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchGlobal()
  }, [fetchGlobal])

  return { entries, loading, refetch: fetchGlobal }
}
