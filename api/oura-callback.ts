import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = req.query.code as string
  const state = req.query.state as string // Supabase user ID

  if (!code || !state) {
    return res.redirect('/?oura=error&reason=missing_params')
  }

  const clientId = process.env.OURA_CLIENT_ID
  const clientSecret = process.env.OURA_CLIENT_SECRET
  const redirectUri = process.env.OURA_REDIRECT_URI
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!clientId || !clientSecret || !redirectUri || !supabaseUrl || !serviceRoleKey) {
    return res.redirect('/?oura=error&reason=server_config')
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
      const errBody = await tokenRes.text()
      console.error('Oura token exchange failed:', tokenRes.status, errBody)
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
        user_id: state,
        access_token,
        refresh_token,
        expires_at: expiresAt,
        scopes: 'daily readiness heartrate personal session',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (dbError) {
      console.error('Failed to store Oura tokens:', dbError)
      return res.redirect('/?oura=error&reason=db_save')
    }

    return res.redirect('/?oura=connected')
  } catch (err) {
    console.error('Oura callback error:', err)
    return res.redirect('/?oura=error&reason=unknown')
  }
}
