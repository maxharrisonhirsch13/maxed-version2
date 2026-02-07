import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

interface UserSearchResult {
  id: string
  name: string
  username: string | null
  avatarUrl: string | null
}

export function useUserSearch(query: string) {
  const { session } = useAuth()
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (!query || query.trim().length < 2 || !session?.access_token) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-users?q=${encodeURIComponent(query.trim())}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const data = await res.json()
        setResults(
          (data.results || []).map((u: any) => ({
            id: u.id,
            name: u.name,
            username: u.username ?? null,
            avatarUrl: u.avatarUrl ?? u.avatar_url ?? null,
          }))
        )
      } catch (err) {
        console.error('User search failed:', err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [query, session?.access_token])

  return { results, loading }
}
