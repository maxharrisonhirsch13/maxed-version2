import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { UserProfile } from '../types'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Failed to fetch profile:', error)
      setLoading(false)
      return
    }

    setProfile({
      id: data.id,
      name: data.name,
      phone: data.phone,
      heightFeet: data.height_feet,
      heightInches: data.height_inches,
      weight: data.weight_lbs,
      experience: data.experience as UserProfile['experience'],
      gym: data.gym,
      isHomeGym: data.is_home_gym,
      gymPlaceId: data.gym_place_id,
      gymAddress: data.gym_address,
      gymLat: data.gym_lat,
      gymLng: data.gym_lng,
      wearables: data.wearables ?? [],
      goal: data.goal,
      customGoal: data.custom_goal,
      split: data.split,
      customSplit: (data.custom_split as UserProfile['customSplit']) ?? [],
      homeEquipment: (data.home_equipment && typeof data.home_equipment === 'object' && 'dumbbells' in (data.home_equipment as Record<string, unknown>))
        ? (data.home_equipment as UserProfile['homeEquipment'])
        : null,
      onboardingCompleted: data.onboarding_completed,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
    })
    setLoading(false)
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error as Error | null }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider value={{
      session, user, profile, loading,
      signUp, signIn, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
