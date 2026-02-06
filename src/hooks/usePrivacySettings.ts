import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { PrivacySettings } from '../types'

export function usePrivacySettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<PrivacySettings>({
    shareLiveActivity: true,
    sharePrs: true,
    shareWorkoutHistory: true,
    shareStreak: true,
    profileVisibility: 'everyone',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchSettings()
  }, [user])

  async function fetchSettings() {
    if (!user) return
    const { data } = await supabase
      .from('privacy_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setSettings({
        shareLiveActivity: data.share_live_activity,
        sharePrs: data.share_prs,
        shareWorkoutHistory: data.share_workout_history,
        shareStreak: data.share_streak,
        profileVisibility: data.profile_visibility as PrivacySettings['profileVisibility'],
      })
    }
    setLoading(false)
  }

  async function updateSettings(updates: Partial<{
    share_live_activity: boolean
    share_prs: boolean
    share_workout_history: boolean
    share_streak: boolean
    profile_visibility: string
  }>) {
    if (!user) return
    await supabase.from('privacy_settings').update(updates).eq('user_id', user.id)
    await fetchSettings()
  }

  return { settings, loading, updateSettings }
}
