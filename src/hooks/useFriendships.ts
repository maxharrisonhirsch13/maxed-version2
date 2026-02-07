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
      // Step 1: Fetch all friendships involving this user (no joins)
      const { data: rows, error } = await supabase
        .from('friendships')
        .select('id, requester_id, addressee_id, status, created_at')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .in('status', ['pending', 'accepted'])

      if (error) {
        console.error('Failed to fetch friendships:', error)
        return
      }

      if (!rows || rows.length === 0) {
        setFriends([])
        setIncomingRequests([])
        setOutgoingRequests([])
        setLoading(false)
        return
      }

      // Step 2: Collect all "other" user IDs
      const otherIds = rows.map(r =>
        r.requester_id === user.id ? r.addressee_id : r.requester_id
      )
      const uniqueIds = [...new Set(otherIds)]

      // Step 3: Fetch profiles for those users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .in('id', uniqueIds)

      if (profileError) {
        console.error('Failed to fetch friend profiles:', profileError)
      }

      const profileMap = new Map(
        (profiles ?? []).map(p => [p.id, p])
      )

      // Step 4: Combine friendships with profile data
      const items: FriendshipItem[] = []
      const incomingIds: Set<string> = new Set()
      const outgoingIds: Set<string> = new Set()

      for (const row of rows) {
        const otherId = row.requester_id === user.id ? row.addressee_id : row.requester_id
        const profile = profileMap.get(otherId)

        if (row.requester_id === user.id) {
          outgoingIds.add(row.id)
        } else {
          incomingIds.add(row.id)
        }

        items.push({
          friendshipId: row.id,
          userId: otherId,
          name: profile?.name ?? 'Unknown',
          username: profile?.username ?? null,
          avatarUrl: profile?.avatar_url ?? null,
          status: row.status,
          createdAt: row.created_at,
        })
      }

      setFriends(items.filter(i => i.status === 'accepted'))
      setIncomingRequests(items.filter(i => i.status === 'pending' && incomingIds.has(i.friendshipId)))
      setOutgoingRequests(items.filter(i => i.status === 'pending' && outgoingIds.has(i.friendshipId)))
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

    // Check if a friendship row already exists in either direction
    const { data: existing } = await supabase
      .from('friendships')
      .select('id, status, requester_id, addressee_id')
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`)
      .maybeSingle()

    if (existing) {
      if (existing.status === 'accepted') {
        await fetchFriendships()
        return
      }
      // Update existing row to accepted
      if (existing.addressee_id === user.id) {
        const { error } = await supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('id', existing.id)
        if (error) throw error
      } else {
        // Delete and re-insert as accepted
        await supabase.from('friendships').delete().eq('id', existing.id)
        const { error } = await supabase.from('friendships').insert({
          requester_id: user.id,
          addressee_id: userId,
          status: 'accepted',
        })
        if (error) throw error
      }
    } else {
      const { error } = await supabase.from('friendships').insert({
        requester_id: user.id,
        addressee_id: userId,
        status: 'accepted',
      })
      if (error) throw error
    }

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
