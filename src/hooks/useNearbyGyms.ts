import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export interface NearbyGym {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
  rating: number | null
  userRatingsTotal: number
  openNow: boolean | null
}

export function useNearbyGyms(lat: number | null, lng: number | null) {
  const { session } = useAuth()
  const [gyms, setGyms] = useState<NearbyGym[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!lat || !lng || !session?.access_token) {
      setGyms([])
      return
    }

    let cancelled = false
    setLoading(true)

    fetch(`/api/search-gyms?lat=${lat}&lng=${lng}&radius=8000`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setGyms(data.results || [])
      })
      .catch(() => {
        if (!cancelled) setGyms([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [lat, lng, session?.access_token])

  return { gyms, loading }
}
