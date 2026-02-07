import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import type { GymResult } from '../types'

export function useGymSearch(query: string) {
  const { session } = useAuth()
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
        const headers: Record<string, string> = {}
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }
        const res = await fetch(`/api/search-gyms?query=${encodeURIComponent(query.trim())}`, { headers })
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
  }, [query, session?.access_token])

  return { results, loading }
}
