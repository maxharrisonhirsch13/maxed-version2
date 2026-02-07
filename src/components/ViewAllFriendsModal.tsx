import { X, Search, UserPlus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useFriendships } from '../hooks/useFriendships';
import { useUserSearch } from '../hooks/useUserSearch';

interface ViewAllFriendsModalProps {
  onClose: () => void;
  onSelectFriend: (friend: { userId: string; name: string; username: string | null }) => void;
}

export function ViewAllFriendsModal({ onClose, onSelectFriend }: ViewAllFriendsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { friends, loading: friendsLoading } = useFriendships();
  const { results: searchResults, loading: searchLoading } = useUserSearch(searchQuery);

  const isSearching = searchQuery.trim().length >= 2;

  const filteredFriends = searchQuery.trim().length > 0 && searchQuery.trim().length < 2
    ? friends.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.username ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : friends;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const gradients = ['from-purple-500 to-blue-500', 'from-pink-500 to-orange-500', 'from-green-500 to-teal-500', 'from-yellow-500 to-red-500', 'from-indigo-500 to-purple-500'];
  const getGradient = (name: string) => gradients[name.charCodeAt(0) % gradients.length];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-t-3xl md:rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold">Friends ({friends.length})</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search friends or find new..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#00ff00] transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {(friendsLoading || searchLoading) && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-[#00ff00] animate-spin" />
            </div>
          )}

          {/* Show search results when searching */}
          {isSearching && !searchLoading && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Search Results</h3>
              {searchResults.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">No users found</p>
              )}
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => { onSelectFriend({ userId: user.id, name: user.name, username: user.username }); onClose(); }}
                    className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-xl p-4 flex items-center gap-3 transition-colors"
                  >
                    {user.avatarUrl ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800">
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getGradient(user.name)} flex items-center justify-center font-bold text-sm`}>
                        {getInitials(user.name)}
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{user.name}</p>
                      {user.username && <p className="text-xs text-gray-400">@{user.username}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Show friends list when not searching */}
          {!isSearching && !friendsLoading && (
            <>
              {filteredFriends.length === 0 && (
                <div className="text-center py-12">
                  <UserPlus className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    {searchQuery ? 'No friends match your search' : 'No friends yet'}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                {filteredFriends.map((friend) => (
                  <button
                    key={friend.friendshipId}
                    onClick={() => { onSelectFriend({ userId: friend.userId, name: friend.name, username: friend.username }); onClose(); }}
                    className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-xl p-4 flex items-center gap-3 transition-colors"
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
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{friend.name}</p>
                      {friend.username && <p className="text-xs text-gray-400">@{friend.username}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
