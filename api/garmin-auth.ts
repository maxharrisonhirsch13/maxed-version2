import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'

// OAuth 1.0a helper: generate signature
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const userId = req.query.userId as string
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' })
  }

  const consumerKey = process.env.GARMIN_CONSUMER_KEY
  const consumerSecret = process.env.GARMIN_CONSUMER_SECRET
  const callbackUrl = process.env.GARMIN_CALLBACK_URI

  if (!consumerKey || !consumerSecret || !callbackUrl) {
    return res.status(500).json({ error: 'Garmin not configured' })
  }

  try {
    // Step 1: Get a request token from Garmin
    const requestTokenUrl = 'https://connectapi.garmin.com/oauth-service/oauth/request_token'
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: generateNonce(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: '1.0',
      oauth_callback: callbackUrl,
    }

    oauthParams.oauth_signature = oauthSign('POST', requestTokenUrl, oauthParams, consumerSecret)

    const authHeader = 'OAuth ' + Object.entries(oauthParams)
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(', ')

    const tokenRes = await fetch(requestTokenUrl, {
      method: 'POST',
      headers: { Authorization: authHeader },
    })

    if (!tokenRes.ok) {
      console.error('Garmin request token failed:', tokenRes.status, await tokenRes.text())
      return res.status(502).json({ error: 'Failed to get Garmin request token' })
    }

    const tokenBody = await tokenRes.text()
    const tokenParams = new URLSearchParams(tokenBody)
    const oauthToken = tokenParams.get('oauth_token')
    const oauthTokenSecret = tokenParams.get('oauth_token_secret')

    if (!oauthToken || !oauthTokenSecret) {
      return res.status(502).json({ error: 'Invalid Garmin token response' })
    }

    // Store the request token secret temporarily (needed for callback)
    // We encode userId + tokenSecret in the state param via a simple approach:
    // Store in a short-lived way — we'll pass it through the flow
    const stateData = Buffer.from(JSON.stringify({ userId, tokenSecret: oauthTokenSecret })).toString('base64url')

    // Step 2: Return the authorization URL
    const authUrl = `https://connect.garmin.com/oauthConfirm?oauth_token=${oauthToken}&state=${stateData}`

    return res.json({ url: authUrl })
  } catch (err) {
    console.error('Garmin auth error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
