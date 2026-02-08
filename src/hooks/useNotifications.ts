import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface Notification {
  id: string
  type: 'mention' | 'tag' | 'friend_request' | 'reaction' | 'comment'
  actorId: string
  actorName: string
  actorUsername: string | null
  postId: string | null
  read: boolean
  createdAt: string
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)

    try {
      const { data: rows, error } = await supabase
        .from('notifications')
        .select('id, type, actor_id, post_id, read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Failed to fetch notifications:', error)
        return
      }

      if (!rows || rows.length === 0) {
        setNotifications([])
        setUnreadCount(0)
        setLoading(false)
        return
      }

      // Fetch actor profiles
      const actorIds = [...new Set(rows.map(r => r.actor_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, username')
        .in('id', actorIds)

      const profileMap = new Map(
        (profiles ?? []).map(p => [p.id, p])
      )

      const items: Notification[] = rows.map(r => {
        const actor = profileMap.get(r.actor_id)
        return {
          id: r.id,
          type: r.type,
          actorId: r.actor_id,
          actorName: actor?.name ?? 'Someone',
          actorUsername: actor?.username ?? null,
          postId: r.post_id,
          read: r.read,
          createdAt: r.created_at,
        }
      })

      setNotifications(items)
      setUnreadCount(items.filter(n => !n.read).length)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Realtime subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => { fetchNotifications() }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchNotifications])

  async function markAllRead() {
    if (!user) return
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      console.error('Failed to mark notifications read:', error)
      return
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return {
    notifications,
    unreadCount,
    loading,
    refetch: fetchNotifications,
    markAllRead,
  }
}
