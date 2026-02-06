import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const userId = req.query.userId as string
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' })
  }

  const clientId = process.env.WHOOP_CLIENT_ID
  const redirectUri = process.env.WHOOP_REDIRECT_URI
  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'WHOOP not configured' })
  }

  const scopes = 'read:recovery read:sleep read:cycles read:profile read:body_measurement offline'
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    state: userId,
  })

  const url = `https://api.prod.whoop.com/oauth/oauth2/auth?${params.toString()}`
  return res.json({ url })
}
