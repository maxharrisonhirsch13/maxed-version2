import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import type { WhoopData } from '../types'

export function useWhoopData() {
  const { session } = useAuth()
  const [data, setData] = useState<WhoopData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!session?.access_token) {
      console.log('[WHOOP] No session token, skipping fetch')
      setData(null)
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    console.log('[WHOOP] Fetching data...')
    try {
      const res = await fetch('/api/whoop-data', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const json = await res.json()
        console.log('[WHOOP] Response:', JSON.stringify(json, null, 2))
        setData(json)
      } else {
        const errText = await res.text().catch(() => '')
        console.error('[WHOOP] Fetch failed:', res.status, errText)
        setError(`WHOOP API error: ${res.status}`)
        setData(null)
      }
    } catch (err) {
      console.error('[WHOOP] Network error:', err)
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
