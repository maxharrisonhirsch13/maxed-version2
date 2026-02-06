import { useState, useEffect, useRef } from 'react'
import type { GymResult } from '../types'

export function useGymSearch(query: string) {
  const [results, setResults] = useState<GymResult[]>([])
  const [loading, setLoading] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (!query || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-gyms?query=${encodeURIComponent(query.trim())}`)
        const data = await res.json()
        setResults(data.results || [])
      } catch (err) {
        console.error('Gym search failed:', err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [query])

  return { results, loading }
}
