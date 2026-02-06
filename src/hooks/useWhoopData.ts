import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import type { WhoopData } from '../types'

export function useWhoopData() {
  const { session } = useAuth()
  const [data, setData] = useState<WhoopData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!session?.access_token) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/whoop-data', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        console.error('WHOOP data fetch failed:', res.status, await res.text().catch(() => ''))
        setData(null)
      }
    } catch (err) {
      console.error('WHOOP data fetch error:', err)
      setData(null)
    }
    setLoading(false)
  }, [session?.access_token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, refetch: fetchData }
}
