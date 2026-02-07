import { useState } from 'react';
import { Search, X, UserPlus, Check, Loader2, Users } from 'lucide-react';
import { useUserSearch } from '../hooks/useUserSearch';
import { useFriendships } from '../hooks/useFriendships';
import { ImageWithFallback } from './ImageWithFallback';

interface UserSearchModalProps {
  onClose: () => void;
}

export function UserSearchModal({ onClose }: UserSearchModalProps) {
  const [query, setQuery] = useState('');
  const { results, loading } = useUserSearch(query);
  const { friends, incomingRequests, outgoingRequests, sendRequest, acceptRequest, declineRequest } = useFriendships();
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const friendIds = new Set(friends.map(f => f.userId));
  const outgoingIds = new Set(outgoingRequests.map(r => r.userId));
  const incomingMap = new Map(incomingRequests.map(r => [r.userId, r.friendshipId]));

  const getStatus = (userId: string): 'friends' | 'pending' | 'incoming' | 'none' => {
    if (friendIds.has(userId)) return 'friends';
    if (outgoingIds.has(userId)) return 'pending';
    if (incomingMap.has(userId)) return 'incoming';
    return 'none';
  };

  const handleSendRequest = async (userId: string) => {
    setSendingTo(userId);
    try {
      await sendRequest(userId);
    } catch (err) {
      console.error('Failed to send friend request:', err);
    } finally {
      setSendingTo(null);
    }
  };

  const handleAccept = async (friendshipId: string) => {
    setAcceptingId(friendshipId);
    try {
      await acceptRequest(friendshipId);
    } catch (err) {
      console.error('Failed to accept friend request:', err);
    } finally {
      setAcceptingId(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const gradients = [
    'from-purple-500 to-blue-500',
    'from-pink-500 to-orange-500',
    'from-green-500 to-teal-500',
    'from-yellow-500 to-red-500',
    'from-indigo-500 to-purple-500',
  ];

  const getGradient = (name: string) => {
    const idx = name.charCodeAt(0) % gradients.length;
    return gradients[idx];
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-t-3xl md:rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold">Find Friends</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or @username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#00ff00] transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Incoming Requests Section */}
          {incomingRequests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00ff00] rounded-full animate-pulse" />
                Friend Requests ({incomingRequests.length})
              </h3>
              <div className="space-y-2">
                {incomingRequests.map((request) => (
                  <div key={request.friendshipId} className="bg-[#1a1a1a] rounded-xl p-4 flex items-center gap-3 border border-[#00ff00]/10">
                    {/* Avatar */}
                    {request.avatarUrl ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800">
                        <ImageWithFallback src={request.avatarUrl} alt={request.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getGradient(request.name)} flex items-center justify-center font-bold text-sm`}>
                        {getInitials(request.name)}
                      </div>
                    )}
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{request.name}</p>
                      {request.username && <p className="text-xs text-gray-400 truncate">@{request.username}</p>}
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request.friendshipId)}
                        disabled={acceptingId === request.friendshipId}
                        className="px-3 py-2 bg-[#00ff00] text-black font-bold rounded-xl text-xs disabled:opacity-50 flex items-center gap-1"
                      >
                        {acceptingId === request.friendshipId ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Accept
                      </button>
                      <button
                        onClick={() => declineRequest(request.friendshipId)}
                        className="px-3 py-2 bg-gray-800 text-gray-400 font-semibold rounded-xl text-xs hover:bg-gray-700 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-[#00ff00] animate-spin" />
              <span className="text-sm text-gray-400 ml-2">Searching...</span>
            </div>
          )}

          {/* Search Results */}
          {!loading && results.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Results ({results.length})</h3>
              <div className="space-y-2">
                {results.map((user) => {
                  const status = getStatus(user.id);
                  return (
                    <div key={user.id} className="bg-[#1a1a1a] hover:bg-[#252525] rounded-xl p-4 flex items-center gap-3 transition-colors">
                      {/* Avatar */}
                      {user.avatarUrl ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800">
                          <ImageWithFallback src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getGradient(user.name)} flex items-center justify-center font-bold text-sm`}>
                          {getInitials(user.name)}
                        </div>
                      )}
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.name}</p>
                        {user.username && <p className="text-xs text-gray-400 truncate">@{user.username}</p>}
                      </div>
                      {/* Action Button */}
                      {status === 'friends' && (
                        <span className="px-3 py-2 bg-gray-800 text-gray-400 font-semibold rounded-xl text-xs flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Friends
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="px-3 py-2 bg-gray-800 text-gray-500 font-semibold rounded-xl text-xs">
                          Pending
                        </span>
                      )}
                      {status === 'incoming' && (
                        <button
                          onClick={() => handleAccept(incomingMap.get(user.id)!)}
                          disabled={acceptingId === incomingMap.get(user.id)}
                          className="px-3 py-2 bg-[#00ff00] text-black font-bold rounded-xl text-xs disabled:opacity-50 flex items-center gap-1"
                        >
                          {acceptingId === incomingMap.get(user.id) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          Accept
                        </button>
                      )}
                      {status === 'none' && (
                        <button
                          onClick={() => handleSendRequest(user.id)}
                          disabled={sendingTo === user.id}
                          className="px-3 py-2 bg-[#00ff00] text-black font-bold rounded-xl text-xs disabled:opacity-50 flex items-center gap-1"
                        >
                          {sendingTo === user.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserPlus className="w-3.5 h-3.5" />
                          )}
                          Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold text-sm">No users found</p>
              <p className="text-xs text-gray-600 mt-1">Try searching by name or username</p>
            </div>
          )}

          {/* Initial State */}
          {!loading && query.length < 2 && results.length === 0 && incomingRequests.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold text-sm">Search for friends</p>
              <p className="text-xs text-gray-600 mt-1">Type at least 2 characters to search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
