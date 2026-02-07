import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import type { OuraData } from '../types'

export function useOuraData() {
  const { session } = useAuth()
  const [data, setData] = useState<OuraData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!session?.access_token) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/oura-data', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        const errText = await res.text().catch(() => '')
        console.error('[Oura] Fetch failed:', res.status, errText)
        setError(`Oura API error: ${res.status}`)
        setData(null)
      }
    } catch (err) {
      console.error('[Oura] Network error:', err)
      setError(err instanceof Error ? err.message : 'Network error')
      setData(null)
    }
    setLoading(false)
  }, [session?.access_token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
