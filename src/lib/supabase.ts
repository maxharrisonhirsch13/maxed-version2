import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\s+/g, '')
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').replace(/\s+/g, '')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
