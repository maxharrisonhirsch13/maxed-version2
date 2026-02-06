import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = req.query.code as string
  const state = req.query.state as string // Supabase user ID

  if (!code || !state) {
    return res.redirect('/?whoop=error&reason=missing_params')
  }

  const clientId = process.env.WHOOP_CLIENT_ID
  const clientSecret = process.env.WHOOP_CLIENT_SECRET
  const redirectUri = process.env.WHOOP_REDIRECT_URI
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!clientId || !clientSecret || !redirectUri || !supabaseUrl || !serviceRoleKey) {
    return res.redirect('/?whoop=error&reason=server_config')
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
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
      console.error('WHOOP token exchange failed:', tokenRes.status, errBody)
      return res.redirect('/?whoop=error&reason=token_exchange')
    }

    const tokenData = await tokenRes.json()
    const { access_token, refresh_token, expires_in } = tokenData

    // Calculate expiration timestamp
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString()

    // Store tokens in Supabase using service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { error: dbError } = await supabase
      .from('whoop_tokens')
      .upsert({
        user_id: state,
        access_token,
        refresh_token,
        expires_at: expiresAt,
        scopes: 'read:recovery read:sleep read:cycles read:profile read:body_measurement offline',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (dbError) {
      console.error('Failed to store WHOOP tokens:', dbError)
      return res.redirect('/?whoop=error&reason=db_save')
    }

    return res.redirect('/?whoop=connected')
  } catch (err) {
    console.error('WHOOP callback error:', err)
    return res.redirect('/?whoop=error&reason=unknown')
  }
}
