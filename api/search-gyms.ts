import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY not set')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const query = req.query.query as string
  const lat = req.query.lat as string
  const lng = req.query.lng as string
  const radius = (req.query.radius as string) || '8000' // default 8km

  try {
    let url: string
    if (lat && lng) {
      // Nearby search mode
      url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=gym&key=${apiKey}`
    } else if (query && query.trim().length >= 2) {
      // Text search mode
      const searchQuery = encodeURIComponent(`${query.trim()} gym`)
      url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&type=gym&key=${apiKey}`
    } else {
      return res.json({ results: [] })
    }

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', data.status, data.error_message)
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
    console.error('Gym search error:', err)
    return res.json({ results: [] })
  }
}
