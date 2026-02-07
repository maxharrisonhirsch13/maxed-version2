import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Require authentication
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing auth token' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const userToken = authHeader.replace('Bearer ', '')
  const authClient = createClient(supabaseUrl, anonKey)
  const { data: authData, error: authError } = await authClient.auth.getUser(userToken)
  if (authError || !authData.user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const userId = authData.user.id

  const q = req.query.q
  if (typeof q !== 'string' || q.trim().length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' })
  }

  const searchTerm = q.trim().slice(0, 50)

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    const { data, error } = await serviceClient
      .from('profiles')
      .select('id, name, username, avatar_url')
      .or(`username.ilike.${searchTerm}%,name.ilike.%${searchTerm}%`)
      .neq('id', userId)
      .not('username', 'is', null)
      .limit(20)

    if (error) {
      console.error('User search error:', error)
      return res.json({ results: [] })
    }

    return res.json({ results: data ?? [] })
  } catch (err) {
    console.error('User search error:', err instanceof Error ? err.message : 'Unknown error')
    return res.json({ results: [] })
  }
}
