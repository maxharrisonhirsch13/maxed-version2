import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Require authentication to prevent abuse of Google Places API proxy
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
  const { error: authError } = await authClient.auth.getUser(userToken)
  if (authError) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const query = req.query.query as string
  const lat = req.query.lat as string
  const lng = req.query.lng as string
  const radius = (req.query.radius as string) || '8000'

  // Validate numeric inputs
  if (lat && (isNaN(Number(lat)) || Number(lat) < -90 || Number(lat) > 90)) {
    return res.status(400).json({ error: 'Invalid latitude' })
  }
  if (lng && (isNaN(Number(lng)) || Number(lng) < -180 || Number(lng) > 180)) {
    return res.status(400).json({ error: 'Invalid longitude' })
  }
  const radiusNum = Number(radius)
  if (isNaN(radiusNum) || radiusNum < 100 || radiusNum > 50000) {
    return res.status(400).json({ error: 'Invalid radius (100-50000)' })
  }

  try {
    let url: string
    if (lat && lng) {
      // Nearby search mode
      url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=gym&key=${apiKey}`
    } else if (query && query.trim().length >= 2) {
      // Text search mode — sanitize query length
      const trimmed = query.trim().slice(0, 100)
      const searchQuery = encodeURIComponent(`${trimmed} gym`)
      url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&type=gym&key=${apiKey}`
    } else {
      return res.json({ results: [] })
    }

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', data.status)
      return res.json({ results: [] })
    }

    const results = (data.results || []).slice(0, 10).map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address || place.vicinity,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      rating: place.rating ?? null,
      userRatingsTotal: place.user_ratings_total ?? 0,
      openNow: place.opening_hours?.open_now ?? null,
    }))

    return res.json({ results })
  } catch (err) {
    console.error('Gym search error:', err instanceof Error ? err.message : 'Unknown error')
    return res.json({ results: [] })
  }
}
