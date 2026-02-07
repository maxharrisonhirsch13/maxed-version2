import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

function signState(userId: string, secret: string): string {
  const sig = createHmac('sha256', secret).update(userId).digest('hex').slice(0, 16)
  return `${userId}.${sig}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify JWT to ensure only authenticated users can initiate OAuth
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
  const { data: { user }, error: authError } = await authClient.auth.getUser(userToken)
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const clientId = process.env.WHOOP_CLIENT_ID
  const redirectUri = process.env.WHOOP_REDIRECT_URI
  const stateSecret = process.env.OAUTH_STATE_SECRET
  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'WHOOP not configured' })
  }

  const scopes = 'read:recovery read:sleep read:cycles read:profile read:body_measurement offline'
  const state = stateSecret ? signState(user.id, stateSecret) : user.id
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    state,
  })

  const url = `https://api.prod.whoop.com/oauth/oauth2/auth?${params.toString()}`
  return res.json({ url })
}
