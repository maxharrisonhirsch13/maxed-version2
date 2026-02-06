import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export function useWhoopStatus() {
  const { user } = useAuth()
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchStatus = useCallback(async () => {
    if (!user) {
      setConnected(false)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data } = await supabase
        .from('whoop_tokens')
        .select('user_id')
        .eq('user_id', user.id)
        .single()
      setConnected(!!data)
    } catch {
      setConnected(false)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return { connected, loading, refetch: fetchStatus }
}
