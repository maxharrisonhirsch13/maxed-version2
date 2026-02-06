import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing auth token' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const userToken = authHeader.replace('Bearer ', '')
    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(userToken)

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Delete tokens and stored data
    await supabase.from('oura_tokens').delete().eq('user_id', user.id)
    await supabase.from('wearable_snapshots').delete().eq('user_id', user.id).eq('source', 'oura')

    return res.json({ success: true })
  } catch (err) {
    console.error('Oura disconnect error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
