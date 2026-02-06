import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const query = req.query.query as string
  if (!query || query.trim().length < 2) {
    return res.json({ results: [] })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY not set')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const searchQuery = encodeURIComponent(`${query.trim()} gym`)
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&type=gym&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', data.status, data.error_message)
      return res.json({ results: [] })
    }

    const results = (data.results || []).slice(0, 10).map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
    }))

    return res.json({ results })
  } catch (err) {
    console.error('Gym search error:', err)
    return res.json({ results: [] })
  }
}
