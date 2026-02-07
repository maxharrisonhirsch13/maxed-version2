import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { UserProfile } from '../types'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  authError: string | null
  signUp: (email: string, password: string) => Promise<{ error: Error | null; needsConfirmation?: boolean }>
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
  const [authError, setAuthError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mountedRef.current) return
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Failed to get session:', err)
        if (!mountedRef.current) return
        setAuthError('Failed to connect. Please check your internet and refresh.')
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mountedRef.current) return
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

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [])

  async function fetchProfile(userId: string, retries = 2) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!mountedRef.current) return

      if (error) {
        // Profile might not exist yet (trigger delay on signup)
        if (retries > 0 && (error.code === 'PGRST116' || error.message?.includes('no rows'))) {
          await new Promise(r => setTimeout(r, 1000))
          return fetchProfile(userId, retries - 1)
        }
        console.error('Failed to fetch profile:', error)
        setAuthError('Failed to load your profile. Try refreshing the page.')
        setLoading(false)
        return
      }

      setAuthError(null)
      setProfile({
        id: data.id,
        name: data.name,
        username: data.username ?? null,
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
    } catch (err) {
      if (!mountedRef.current) return
      console.error('Profile fetch exception:', err)
      setAuthError('Something went wrong loading your profile.')
      setLoading(false)
    }
  }

  async function signUp(email: string, password: string) {
    setAuthError(null)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error as Error }
    // If Supabase has email confirmation enabled and no session is returned,
    // the user needs to confirm their email first
    const needsConfirmation = !data.session && !!data.user
    return { error: null, needsConfirmation }
  }

  async function signIn(email: string, password: string) {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
    setAuthError(null)
    // Clear app-specific storage
    localStorage.removeItem('maxed_onboarding_step')
    localStorage.removeItem('maxed_onboarding_data')
    sessionStorage.clear()
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider value={{
      session, user, profile, loading, authError,
      signUp, signIn, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
