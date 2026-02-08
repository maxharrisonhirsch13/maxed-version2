import { useState, useEffect } from 'react';
import { Users, MapPin, Dumbbell, Flame, Trophy, Star, Loader2, UserPlus, Clock, MessageSquare, Bell, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNearbyGyms } from '../hooks/useNearbyGyms';
import { useFriendships } from '../hooks/useFriendships';
import { useWorkoutPosts } from '../hooks/useWorkoutPosts';
import { useFriendLeaderboard } from '../hooks/useFriendLeaderboard';
import { useGlobalLeaderboard } from '../hooks/useGlobalLeaderboard';
import { useNotifications } from '../hooks/useNotifications';
import { UserSearchModal } from './UserSearchModal';
import { WorkoutDetailModal } from './WorkoutDetailModal';
import { FriendProfileModal } from './FriendProfileModal';
import { renderCaption } from '../utils/renderCaption';
import type { FeedItem, ReactionEmoji } from '../types';

type Tab = 'feed' | 'friends' | 'leaderboard' | 'nearby';

function getDistanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): string {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return d < 0.1 ? '<0.1 mi' : `${d.toFixed(1)} mi`;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CommunityPage() {
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [leaderboardView, setLeaderboardView] = useState<'weekly' | 'prs' | 'global'>('weekly');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedFeedItem, setSelectedFeedItem] = useState<FeedItem | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const { profile } = useAuth();
  const { gyms: nearbyGyms, loading: nearbyLoading } = useNearbyGyms(profile?.gymLat ?? null, profile?.gymLng ?? null);
  const { friends, incomingRequests, loading: friendsLoading } = useFriendships();
  const { feed, feedLoading, fetchFeed, toggleReaction, addComment, fetchComments, deleteComment } = useWorkoutPosts();
  const { leaderboard, loading: leaderboardLoading } = useFriendLeaderboard();
  const { entries: globalEntries, loading: globalLoading } = useGlobalLeaderboard();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch feed on mount
  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500';
    if (rank === 2) return 'bg-gray-400';
    if (rank === 3) return 'bg-orange-600';
    return 'bg-gray-600';
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const gradients = ['from-purple-500 to-blue-500', 'from-pink-500 to-orange-500', 'from-green-500 to-teal-500', 'from-yellow-500 to-red-500', 'from-indigo-500 to-purple-500'];
  const getGradient = (name: string) => gradients[name.charCodeAt(0) % gradients.length];

  const formatWorkoutType = (type: string) => type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const REACTION_EMOJIS: { key: ReactionEmoji; icon: string }[] = [
    { key: 'fire', icon: '🔥' },
    { key: 'strong', icon: '💪' },
    { key: 'cap', icon: '🧢' },
    { key: 'hundred', icon: '💯' },
    { key: 'clap', icon: '👏' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {showSearch && <UserSearchModal onClose={() => setShowSearch(false)} />}
      {selectedFeedItem && (
        <WorkoutDetailModal
          item={selectedFeedItem}
          onClose={() => setSelectedFeedItem(null)}
          toggleReaction={toggleReaction}
          addComment={addComment}
          fetchComments={fetchComments}
          deleteComment={deleteComment}
        />
      )}
      {selectedFriendId && (
        <FriendProfileModal
          friendUserId={selectedFriendId}
          onClose={() => setSelectedFriendId(null)}
        />
      )}

      <header className="px-4 pt-safe pt-8 pb-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Community</h1>
        <button
          onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead(); }}
          className="relative p-2 hover:bg-white/5 rounded-xl transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#00ff00] text-black text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* Notification dropdown */}
      {showNotifications && (
        <div className="mx-4 mb-3 bg-[#111] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <button onClick={() => setShowNotifications(false)} className="text-xs text-gray-500">Close</button>
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <Bell className="w-6 h-6 text-gray-700 mx-auto mb-1" />
              <p className="text-xs text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-800/50">
              {notifications.slice(0, 20).map(n => (
                <div key={n.id} className={`px-4 py-3 ${!n.read ? 'bg-[#00ff00]/5' : ''}`}>
                  <p className="text-xs">
                    <span className="font-semibold">{n.actorName}</span>
                    {n.type === 'tag' && <span className="text-gray-400"> tagged you in a workout</span>}
                    {n.type === 'mention' && <span className="text-gray-400"> mentioned you in a post</span>}
                    {n.type === 'friend_request' && <span className="text-gray-400"> sent you a friend request</span>}
                    {n.type === 'reaction' && <span className="text-gray-400"> reacted to your post</span>}
                    {n.type === 'comment' && <span className="text-gray-400"> commented on your post</span>}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-4 mb-4">
        <div className="flex gap-2">
          {(['feed', 'friends', 'leaderboard', 'nearby'] as Tab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeTab === tab ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'friends' && incomingRequests.length > 0 && (
                <span className="ml-1.5 w-4 h-4 bg-[#00ff00] text-black text-[10px] font-bold rounded-full inline-flex items-center justify-center">
                  {incomingRequests.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* FEED TAB */}
        {activeTab === 'feed' && (
          <>
            {feedLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-[#00ff00] animate-spin" />
                <span className="text-sm text-gray-400 ml-2">Loading feed...</span>
              </div>
            )}

            {!feedLoading && feed.length === 0 && (
              <div className="text-center py-16">
                <Dumbbell className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 font-semibold">No posts yet</p>
                <p className="text-xs text-gray-600 mt-1">
                  {friends.length === 0
                    ? 'Add friends to see their workouts here'
                    : 'Your friends haven\'t shared any workouts yet'}
                </p>
                {friends.length === 0 && (
                  <button onClick={() => setShowSearch(true)} className="mt-4 px-4 py-2 bg-[#00ff00] text-black font-bold rounded-xl text-xs">
                    Find Friends
                  </button>
                )}
              </div>
            )}

            {!feedLoading && feed.length > 0 && (
              <div className="space-y-3">
                {feed.map((item) => {
                  const totalVolume = item.workout.exercises.reduce((sum, ex) =>
                    sum + ex.sets.reduce((s, set) =>
                      s + ((set.weightLbs || 0) * (set.reps || 0)), 0), 0);

                  return (
                    <div
                      key={item.post.id}
                      className="w-full bg-[#1a1a1a] rounded-2xl p-4 text-left"
                    >
                      {/* Clickable area for detail modal */}
                      <button
                        onClick={() => setSelectedFeedItem(item)}
                        className="w-full text-left hover:opacity-90 transition-opacity"
                      >
                        {/* User row */}
                        <div className="flex items-center gap-3 mb-3">
                          {item.user.avatarUrl ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                              <img src={item.user.avatarUrl} alt={item.user.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(item.user.name)} flex items-center justify-center font-bold text-xs`}>
                              {getInitials(item.user.name)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{item.user.name}</p>
                            {item.user.username && <p className="text-[11px] text-gray-500">@{item.user.username}</p>}
                          </div>
                          <span className="text-[11px] text-gray-600">{timeAgo(item.post.createdAt)}</span>
                        </div>

                        {/* Tagged users */}
                        {item.taggedUsers && item.taggedUsers.length > 0 && (
                          <p className="text-[11px] text-gray-500 mb-2">
                            <span className="text-gray-600">with </span>
                            {item.taggedUsers.map((t, i) => (
                              <span key={t.id}>
                                <span className="text-[#00ff00]/70 font-medium">@{t.username || t.name.split(' ')[0].toLowerCase()}</span>
                                {i < item.taggedUsers.length - 1 && <span className="text-gray-600">, </span>}
                              </span>
                            ))}
                          </p>
                        )}

                        {/* Post image */}
                        {item.post.imageUrl && (
                          <div className="mb-3 rounded-xl overflow-hidden">
                            <img src={item.post.imageUrl} alt="Post" className="w-full max-h-64 object-cover" />
                          </div>
                        )}

                        {/* Workout summary */}
                        <div className="bg-black/40 rounded-xl p-3 mb-2">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-[#00ff00]/10 text-[#00ff00] text-[10px] font-bold rounded-md">
                              {formatWorkoutType(item.workout.workoutType)}
                            </span>
                            {item.workout.durationMinutes && (
                              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                                <Clock className="w-3 h-3" />
                                {item.workout.durationMinutes} min
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-gray-400">
                              <span className="font-semibold text-white">{item.workout.exercises.length}</span> exercises
                            </span>
                            {totalVolume > 0 && (
                              <span className="text-gray-400">
                                <span className="font-semibold text-white">{totalVolume.toLocaleString()}</span> lbs
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Caption */}
                        {item.post.caption && (
                          <div className="flex items-start gap-2 mt-2">
                            <MessageSquare className="w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">{renderCaption(item.post.caption)}</p>
                          </div>
                        )}
                      </button>

                      {/* Reaction bar + comment count */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800/50">
                        <div className="flex items-center gap-1.5 flex-1">
                          {REACTION_EMOJIS.map(({ key, icon }) => {
                            const reaction = item.reactions.find(r => r.emoji === key);
                            const count = reaction?.count ?? 0;
                            const reacted = reaction?.reacted ?? false;
                            return (
                              <button
                                key={key}
                                onClick={(e) => { e.stopPropagation(); toggleReaction(item.post.id, key); }}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                                  reacted
                                    ? 'bg-[#00ff00]/15 border border-[#00ff00]/30'
                                    : count > 0
                                      ? 'bg-gray-800/50 border border-gray-700/50'
                                      : 'bg-transparent border border-transparent hover:bg-gray-800/30'
                                }`}
                              >
                                <span className="text-sm">{icon}</span>
                                {count > 0 && <span className={`font-medium ${reacted ? 'text-[#00ff00]' : 'text-gray-400'}`}>{count}</span>}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => setSelectedFeedItem(item)}
                          className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:text-white transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          {item.commentCount > 0 && <span className="text-xs font-medium">{item.commentCount}</span>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* FRIENDS TAB */}
        {activeTab === 'friends' && (
          <>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-gray-400">
                Your Friends ({friends.length})
              </h3>
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00ff00] text-black font-bold rounded-lg text-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {/* Incoming requests */}
            {incomingRequests.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00ff00] rounded-full animate-pulse" />
                  Friend Requests ({incomingRequests.length})
                </h3>
                <div className="space-y-2">
                  {incomingRequests.map((req) => (
                    <IncomingRequestCard key={req.friendshipId} request={req} />
                  ))}
                </div>
              </div>
            )}

            {friendsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-[#00ff00] animate-spin" />
                <span className="text-sm text-gray-400 ml-2">Loading friends...</span>
              </div>
            )}

            {!friendsLoading && friends.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 font-semibold">No friends yet</p>
                <p className="text-xs text-gray-600 mt-1">Search for friends by name or username</p>
                <button onClick={() => setShowSearch(true)} className="mt-4 px-4 py-2 bg-[#00ff00] text-black font-bold rounded-xl text-xs">
                  Find Friends
                </button>
              </div>
            )}

            {!friendsLoading && friends.length > 0 && (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <button
                    key={friend.friendshipId}
                    onClick={() => setSelectedFriendId(friend.userId)}
                    className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-xl p-4 flex items-center gap-3 transition-colors text-left"
                  >
                    {friend.avatarUrl ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800">
                        <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getGradient(friend.name)} flex items-center justify-center font-bold text-sm`}>
                        {getInitials(friend.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{friend.name}</p>
                      {friend.username && <p className="text-xs text-gray-400 truncate">@{friend.username}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <>
            {/* Leaderboard view toggle */}
            <div className="flex gap-1 bg-[#111] rounded-xl p-1 mb-4">
              {(['weekly', 'prs', 'global'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setLeaderboardView(view)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    leaderboardView === view
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {view === 'weekly' ? 'Weekly' : view === 'prs' ? 'Big 3 PRs' : 'Global'}
                </button>
              ))}
            </div>

            {/* Weekly view */}
            {leaderboardView === 'weekly' && (
              <div className="bg-[#1a1a1a] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <h2 className="font-bold text-sm">Weekly Leaderboard</h2>
                </div>

                {leaderboardLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-[#00ff00] animate-spin" />
                    <span className="text-sm text-gray-400 ml-2">Loading...</span>
                  </div>
                )}

                {!leaderboardLoading && leaderboard.length === 0 && (
                  <div className="text-center py-8">
                    <Trophy className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Add friends to see the leaderboard</p>
                  </div>
                )}

                {!leaderboardLoading && leaderboard.length > 0 && (
                  <div className="space-y-2">
                    {leaderboard.map((person, idx) => (
                      <div
                        key={person.userId}
                        className={`rounded-xl p-3 flex items-center gap-3 ${person.isCurrentUser ? 'bg-[#00ff00]/10 border border-[#00ff00]/30' : 'bg-black/50'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(idx + 1)}`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate">{person.name}</p>
                            {person.isCurrentUser && (
                              <span className="px-2 py-0.5 bg-[#00ff00] text-black text-[10px] font-bold rounded-full">YOU</span>
                            )}
                          </div>
                          {person.username && <p className="text-xs text-gray-500">@{person.username}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold">{person.workoutsThisWeek}</p>
                          <p className="text-[10px] text-gray-400">workouts</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            <span className="text-sm font-bold text-orange-500">{person.streak}</span>
                          </div>
                          <p className="text-[10px] text-gray-400">streak</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Big 3 PRs view (friends) */}
            {leaderboardView === 'prs' && (
              <div className="bg-[#1a1a1a] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Dumbbell className="w-4 h-4 text-[#00ff00]" />
                  <h2 className="font-bold text-sm">Big 3 PRs — Friends</h2>
                </div>

                {leaderboardLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-[#00ff00] animate-spin" />
                    <span className="text-sm text-gray-400 ml-2">Loading...</span>
                  </div>
                )}

                {!leaderboardLoading && (() => {
                  const sorted = [...leaderboard]
                    .map(p => ({ ...p, total: (p.benchPR || 0) + (p.squatPR || 0) + (p.deadliftPR || 0) }))
                    .filter(p => p.total > 0)
                    .sort((a, b) => b.total - a.total);

                  if (sorted.length === 0) return (
                    <div className="text-center py-8">
                      <Dumbbell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No PRs recorded yet</p>
                    </div>
                  );

                  return (
                    <div>
                      {/* Header */}
                      <div className="flex items-center gap-2 px-2 pb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        <span className="w-6">#</span>
                        <span className="flex-1">Name</span>
                        <span className="w-14 text-right">Bench</span>
                        <span className="w-14 text-right">Squat</span>
                        <span className="w-14 text-right">Dead</span>
                        <span className="w-16 text-right">Total</span>
                      </div>
                      <div className="space-y-1.5">
                        {sorted.map((person, idx) => (
                          <div
                            key={person.userId}
                            className={`rounded-xl px-2 py-2.5 flex items-center gap-2 ${person.isCurrentUser ? 'bg-[#00ff00]/10 border border-[#00ff00]/30' : 'bg-black/50'}`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${getRankColor(idx + 1)}`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-xs truncate">{person.name}</p>
                                {person.isCurrentUser && (
                                  <span className="px-1.5 py-0.5 bg-[#00ff00] text-black text-[8px] font-bold rounded-full">YOU</span>
                                )}
                              </div>
                            </div>
                            <span className="w-14 text-right text-xs font-medium">{person.benchPR || '—'}</span>
                            <span className="w-14 text-right text-xs font-medium">{person.squatPR || '—'}</span>
                            <span className="w-14 text-right text-xs font-medium">{person.deadliftPR || '—'}</span>
                            <span className="w-16 text-right text-sm font-bold text-[#00ff00]">{person.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Global view */}
            {leaderboardView === 'global' && (
              <div className="bg-[#1a1a1a] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <h2 className="font-bold text-sm">Global Big 3 — Top 20</h2>
                </div>

                {globalLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-[#00ff00] animate-spin" />
                    <span className="text-sm text-gray-400 ml-2">Loading...</span>
                  </div>
                )}

                {!globalLoading && globalEntries.length === 0 && (
                  <div className="text-center py-8">
                    <Trophy className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No PRs recorded yet</p>
                  </div>
                )}

                {!globalLoading && globalEntries.length > 0 && (
                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-2 px-2 pb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      <span className="w-6">#</span>
                      <span className="flex-1">Name</span>
                      <span className="w-14 text-right">Bench</span>
                      <span className="w-14 text-right">Squat</span>
                      <span className="w-14 text-right">Dead</span>
                      <span className="w-16 text-right">Total</span>
                    </div>
                    <div className="space-y-1.5">
                      {globalEntries.map((person, idx) => (
                        <div
                          key={person.userId}
                          className={`rounded-xl px-2 py-2.5 flex items-center gap-2 ${person.isCurrentUser ? 'bg-[#00ff00]/10 border border-[#00ff00]/30' : 'bg-black/50'}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${getRankColor(idx + 1)}`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-xs truncate">{person.name}</p>
                              {person.isCurrentUser && (
                                <span className="px-1.5 py-0.5 bg-[#00ff00] text-black text-[8px] font-bold rounded-full">YOU</span>
                              )}
                            </div>
                            {person.username && <p className="text-[10px] text-gray-500">@{person.username}</p>}
                          </div>
                          <span className="w-14 text-right text-xs font-medium">{person.benchPR || '—'}</span>
                          <span className="w-14 text-right text-xs font-medium">{person.squatPR || '—'}</span>
                          <span className="w-14 text-right text-xs font-medium">{person.deadliftPR || '—'}</span>
                          <span className="w-16 text-right text-sm font-bold text-[#00ff00]">{person.total}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* NEARBY TAB */}
        {activeTab === 'nearby' && (
          <>
            {profile?.gym && !profile?.isHomeGym && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-400 mb-3">Your Gym</h3>
                <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#00ff00]/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-base mb-1">{profile.gym}</h3>
                      {profile.gymAddress && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" />
                          <span>{profile.gymAddress}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00ff00] text-black">YOUR GYM</span>
                  </div>
                </div>
              </div>
            )}
            <div className="mb-3"><h3 className="text-sm font-bold text-gray-400">Gyms nearby</h3></div>
            {nearbyLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-[#00ff00] animate-spin" />
                <span className="text-sm text-gray-400 ml-2">Finding nearby gyms...</span>
              </div>
            )}
            {!nearbyLoading && nearbyGyms.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">{profile?.gymLat ? 'No gyms found nearby' : 'Set your gym location to see nearby gyms'}</p>
              </div>
            )}
            {!nearbyLoading && nearbyGyms.length > 0 && (
              <div className="space-y-3">
                {nearbyGyms.filter(g => g.placeId !== profile?.gymPlaceId).map((gym) => (
                  <div key={gym.placeId} className="bg-[#1a1a1a] rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-base mb-1">{gym.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                          <MapPin className="w-3 h-3" />
                          <span>{profile?.gymLat && profile?.gymLng ? getDistanceMiles(profile.gymLat, profile.gymLng, gym.lat, gym.lng) + ' away' : gym.address}</span>
                        </div>
                        {gym.address && <p className="text-[11px] text-gray-500">{gym.address}</p>}
                      </div>
                      {gym.openNow !== null && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gym.openNow ? 'bg-[#00ff00]/20 text-[#00ff00]' : 'bg-red-500/20 text-red-400'}`}>
                          {gym.openNow ? 'Open' : 'Closed'}
                        </span>
                      )}
                    </div>
                    {gym.rating && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold">{gym.rating}</span>
                        <span className="text-xs text-gray-500">({gym.userRatingsTotal} reviews)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Inline sub-component for incoming friend request cards
function IncomingRequestCard({ request }: { request: { friendshipId: string; name: string; username: string | null; avatarUrl: string | null } }) {
  const { acceptRequest, declineRequest } = useFriendships();
  const [accepting, setAccepting] = useState(false);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const gradients = ['from-purple-500 to-blue-500', 'from-pink-500 to-orange-500', 'from-green-500 to-teal-500'];
  const gradient = gradients[request.name.charCodeAt(0) % gradients.length];

  const handleAccept = async () => {
    setAccepting(true);
    try { await acceptRequest(request.friendshipId); } catch {}
    setAccepting(false);
  };

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-3 flex items-center gap-3 border border-[#00ff00]/10">
      {request.avatarUrl ? (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
          <img src={request.avatarUrl} alt={request.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-xs`}>
          {getInitials(request.name)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{request.name}</p>
        {request.username && <p className="text-[11px] text-gray-500 truncate">@{request.username}</p>}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          disabled={accepting}
          className="px-3 py-1.5 bg-[#00ff00] text-black font-bold rounded-lg text-xs disabled:opacity-50"
        >
          {accepting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Accept'}
        </button>
        <button
          onClick={() => declineRequest(request.friendshipId)}
          className="px-3 py-1.5 bg-gray-800 text-gray-400 font-semibold rounded-lg text-xs"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
