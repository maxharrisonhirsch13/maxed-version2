import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useProfile() {
  const { user, refreshProfile } = useAuth()

  async function updateProfile(updates: {
    name?: string | null
    username?: string | null
    phone?: string | null
    height_feet?: number | null
    height_inches?: number | null
    weight_lbs?: number | null
    experience?: string | null
    gym?: string | null
    is_home_gym?: boolean
    gym_place_id?: string | null
    gym_address?: string | null
    gym_lat?: number | null
    gym_lng?: number | null
    wearables?: string[]
    goal?: string | null
    custom_goal?: string | null
    split?: string | null
    custom_split?: any
    home_equipment?: any
    onboarding_completed?: boolean
  }) {
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) throw error
    await refreshProfile()
  }

  async function updateUsername(username: string) {
    if (!user) throw new Error('Not authenticated')
    const trimmed = username.trim().toLowerCase()
    if (!/^[a-z0-9_]{3,20}$/.test(trimmed)) {
      throw new Error('Username must be 3-20 characters, lowercase letters, numbers, and underscores only')
    }
    const { error } = await supabase
      .from('profiles')
      .update({ username: trimmed })
      .eq('id', user.id)
    if (error) {
      if (error.code === '23505') throw new Error('Username is already taken')
      throw error
    }
    await refreshProfile()
  }

  return { updateProfile, updateUsername }
}
