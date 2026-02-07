import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface FriendshipItem {
  friendshipId: string
  userId: string
  name: string
  username: string | null
  avatarUrl: string | null
  status: string
  createdAt: string
}

export function useFriendships() {
  const { user } = useAuth()
  const [friends, setFriends] = useState<FriendshipItem[]>([])
  const [incomingRequests, setIncomingRequests] = useState<FriendshipItem[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<FriendshipItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFriendships = useCallback(async () => {
    if (!user) return
    setLoading(true)

    try {
      // Query 1: friendships where current user is the requester → join addressee profile
      const { data: asRequester, error: err1 } = await supabase
        .from('friendships')
        .select(`
          id, requester_id, addressee_id, status, created_at,
          profiles!friendships_addressee_id_fkey ( id, name, username, avatar_url )
        `)
        .eq('requester_id', user.id)
        .in('status', ['pending', 'accepted'])

      // Query 2: friendships where current user is the addressee → join requester profile
      const { data: asAddressee, error: err2 } = await supabase
        .from('friendships')
        .select(`
          id, requester_id, addressee_id, status, created_at,
          profiles!friendships_requester_id_fkey ( id, name, username, avatar_url )
        `)
        .eq('addressee_id', user.id)
        .in('status', ['pending', 'accepted'])

      if (err1) console.error('Failed to fetch friendships (as requester):', err1)
      if (err2) console.error('Failed to fetch friendships (as addressee):', err2)

      const items: FriendshipItem[] = []

      // Map requester rows — the "other" user is the addressee (joined profile)
      for (const row of asRequester ?? []) {
        const profile = row.profiles as any
        if (!profile) continue
        items.push({
          friendshipId: row.id,
          userId: profile.id,
          name: profile.name,
          username: profile.username ?? null,
          avatarUrl: profile.avatar_url ?? null,
          status: row.status,
          createdAt: row.created_at,
        })
      }

      // Map addressee rows — the "other" user is the requester (joined profile)
      for (const row of asAddressee ?? []) {
        const profile = row.profiles as any
        if (!profile) continue
        items.push({
          friendshipId: row.id,
          userId: profile.id,
          name: profile.name,
          username: profile.username ?? null,
          avatarUrl: profile.avatar_url ?? null,
          status: row.status,
          createdAt: row.created_at,
        })
      }

      setFriends(items.filter(i => i.status === 'accepted'))
      setIncomingRequests(
        items.filter(i => i.status === 'pending' && (asAddressee ?? []).some(r => r.id === i.friendshipId))
      )
      setOutgoingRequests(
        items.filter(i => i.status === 'pending' && (asRequester ?? []).some(r => r.id === i.friendshipId))
      )
    } catch (err) {
      console.error('Failed to fetch friendships:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchFriendships()
  }, [fetchFriendships])

  // Realtime subscription for live updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('friendships-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `requester_id=eq.${user.id}`,
        },
        () => { fetchFriendships() }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `addressee_id=eq.${user.id}`,
        },
        () => { fetchFriendships() }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchFriendships])

  async function sendRequest(userId: string) {
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: userId,
      status: 'pending',
    })

    if (error) throw error
    await fetchFriendships()
  }

  async function acceptRequest(friendshipId: string) {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)

    if (error) throw error
    await fetchFriendships()
  }

  async function declineRequest(friendshipId: string) {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'declined' })
      .eq('id', friendshipId)

    if (error) throw error
    await fetchFriendships()
  }

  async function removeFriend(friendshipId: string) {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)

    if (error) throw error
    await fetchFriendships()
  }

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    loading,
    refetch: fetchFriendships,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
  }
}
