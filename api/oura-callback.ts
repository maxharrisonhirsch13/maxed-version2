import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

function verifyState(state: string, secret: string): string | null {
  const dotIdx = state.lastIndexOf('.')
  if (dotIdx === -1) return null
  const userId = state.slice(0, dotIdx)
  const sig = state.slice(dotIdx + 1)
  const expected = createHmac('sha256', secret).update(userId).digest('hex').slice(0, 16)
  if (sig !== expected) return null
  return userId
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = req.query.code as string
  const state = req.query.state as string

  if (!code || !state) {
    return res.redirect('/?oura=error&reason=missing_params')
  }

  const clientId = process.env.OURA_CLIENT_ID
  const clientSecret = process.env.OURA_CLIENT_SECRET
  const redirectUri = process.env.OURA_REDIRECT_URI
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const stateSecret = process.env.OAUTH_STATE_SECRET

  if (!clientId || !clientSecret || !redirectUri || !supabaseUrl || !serviceRoleKey) {
    return res.redirect('/?oura=error&reason=server_config')
  }

  // Verify HMAC-signed state to prevent CSRF
  let userId: string
  if (stateSecret) {
    const verified = verifyState(state, stateSecret)
    if (!verified) {
      console.error('Oura callback: invalid state signature')
      return res.redirect('/?oura=error&reason=invalid_state')
    }
    userId = verified
  } else {
    // Fallback for when OAUTH_STATE_SECRET is not yet configured
    userId = state
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://api.ouraring.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenRes.ok) {
      console.error('Oura token exchange failed:', tokenRes.status)
      return res.redirect('/?oura=error&reason=token_exchange')
    }

    const tokenData = await tokenRes.json()
    const { access_token, refresh_token, expires_in } = tokenData

    // Calculate expiration timestamp
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString()

    // Store tokens in Supabase using service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { error: dbError } = await supabase
      .from('oura_tokens')
      .upsert({
        user_id: userId,
        access_token,
        refresh_token,
        expires_at: expiresAt,
        scopes: 'daily readiness heartrate personal session',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (dbError) {
      console.error('Failed to store Oura tokens:', dbError.message)
      return res.redirect('/?oura=error&reason=db_save')
    }

    return res.redirect('/?oura=connected')
  } catch (err) {
    console.error('Oura callback error:', err instanceof Error ? err.message : 'Unknown error')
    return res.redirect('/?oura=error&reason=unknown')
  }
}
