import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function oauthSign(method: string, url: string, params: Record<string, string>, consumerSecret: string, tokenSecret = '') {
  const sorted = Object.keys(params).sort().map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&')
  const base = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sorted)}`
  const key = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`
  return crypto.createHmac('sha1', key).update(base).digest('base64')
}

function generateNonce() {
  return crypto.randomBytes(16).toString('hex')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const oauthToken = req.query.oauth_token as string
  const oauthVerifier = req.query.oauth_verifier as string
  const state = req.query.state as string

  if (!oauthToken || !oauthVerifier || !state) {
    return res.redirect('/?garmin=error&reason=missing_params')
  }

  const consumerKey = process.env.GARMIN_CONSUMER_KEY
  const consumerSecret = process.env.GARMIN_CONSUMER_SECRET
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!consumerKey || !consumerSecret || !supabaseUrl || !serviceRoleKey) {
    return res.redirect('/?garmin=error&reason=server_config')
  }

  try {
    // Decode state to get userId and request token secret
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
    const { userId, tokenSecret: requestTokenSecret } = stateData

    if (!userId || !requestTokenSecret) {
      return res.redirect('/?garmin=error&reason=invalid_state')
    }

    // Step 3: Exchange request token for access token
    const accessTokenUrl = 'https://connectapi.garmin.com/oauth-service/oauth/access_token'
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: consumerKey,
      oauth_token: oauthToken,
      oauth_nonce: generateNonce(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_verifier: oauthVerifier,
      oauth_version: '1.0',
    }

    oauthParams.oauth_signature = oauthSign('POST', accessTokenUrl, oauthParams, consumerSecret, requestTokenSecret)

    const authHeader = 'OAuth ' + Object.entries(oauthParams)
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(', ')

    const tokenRes = await fetch(accessTokenUrl, {
      method: 'POST',
      headers: { Authorization: authHeader },
    })

    if (!tokenRes.ok) {
      console.error('Garmin access token failed:', tokenRes.status, await tokenRes.text())
      return res.redirect('/?garmin=error&reason=token_exchange')
    }

    const tokenBody = await tokenRes.text()
    const tokenParams = new URLSearchParams(tokenBody)
    const accessToken = tokenParams.get('oauth_token')
    const accessTokenSecret = tokenParams.get('oauth_token_secret')

    if (!accessToken || !accessTokenSecret) {
      return res.redirect('/?garmin=error&reason=invalid_access_token')
    }

    // Store tokens in Supabase
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { error: dbError } = await supabase
      .from('garmin_tokens')
      .upsert({
        user_id: userId,
        access_token: accessToken,
        access_token_secret: accessTokenSecret,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (dbError) {
      console.error('Failed to store Garmin tokens:', dbError)
      return res.redirect('/?garmin=error&reason=db_save')
    }

    return res.redirect('/?garmin=connected')
  } catch (err) {
    console.error('Garmin callback error:', err)
    return res.redirect('/?garmin=error&reason=unknown')
  }
}
