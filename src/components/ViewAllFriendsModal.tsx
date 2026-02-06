import { X, Search, Dumbbell, MapPin } from 'lucide-react';
import { useState } from 'react';

interface Friend {
  id: number;
  name: string;
  username: string;
  profilePic: string;
  isActive?: boolean;
  currentActivity?: string;
  location?: string;
  streak?: number;
  workoutsThisWeek?: number;
  joined?: string;
}

interface ViewAllFriendsModalProps {
  onClose: () => void;
  onSelectFriend: (friend: Friend) => void;
}

export function ViewAllFriendsModal({ onClose, onSelectFriend }: ViewAllFriendsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const friends: Friend[] = [
    { id: 1, name: 'Sarah Chen', username: 'sarahlifts', profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', isActive: true, currentActivity: 'Leg Day', location: 'Gold\'s Gym', streak: 12, workoutsThisWeek: 5, joined: 'Jan 24' },
    { id: 2, name: 'Mike Rodriguez', username: 'mikefit', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', isActive: true, currentActivity: 'Push Day', location: '24 Hour Fitness', streak: 8, workoutsThisWeek: 4, joined: 'Feb 24' },
    { id: 3, name: 'Jessica Wong', username: 'jesswong', profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', isActive: false, streak: 5, workoutsThisWeek: 3, joined: 'Dec 23' },
    { id: 4, name: 'David Kim', username: 'davidk', profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', isActive: false, streak: 15, workoutsThisWeek: 6, joined: 'Oct 23' },
    { id: 5, name: 'Emily Taylor', username: 'emilytfit', profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', isActive: true, currentActivity: 'Cardio - HIIT', location: 'Equinox', streak: 20, workoutsThisWeek: 5, joined: 'Sep 23' },
    { id: 6, name: 'Alex Johnson', username: 'alexj', profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop', isActive: false, streak: 3, workoutsThisWeek: 2, joined: 'Mar 24' },
    { id: 7, name: 'Nina Patel', username: 'ninastrength', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', isActive: false, streak: 10, workoutsThisWeek: 4, joined: 'Nov 23' },
    { id: 8, name: 'Chris Martinez', username: 'chrism', profilePic: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop', isActive: true, currentActivity: 'Shoulders', location: 'LA Fitness', streak: 7, workoutsThisWeek: 3, joined: 'Jan 24' },
  ];

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFriends = filteredFriends.filter(f => f.isActive);
  const inactiveFriends = filteredFriends.filter(f => !f.isActive);

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
            <input type="text" placeholder="Search friends..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#00ff00] transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {activeFriends.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00ff00] rounded-full animate-pulse"></div>
                Active Now ({activeFriends.length})
              </h3>
              <div className="space-y-2">
                {activeFriends.map((friend) => (
                  <button key={friend.id} onClick={() => { onSelectFriend(friend); onClose(); }} className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-xl p-4 flex items-center gap-3 transition-colors">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800"><img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" /></div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#00ff00] border-2 border-[#1a1a1a] rounded-full"></div>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{friend.name}</p>
                      <p className="text-xs text-gray-400">@{friend.username}</p>
                      {friend.currentActivity && (<div className="flex items-center gap-1.5 mt-1"><Dumbbell className="w-3 h-3 text-[#00ff00]" /><span className="text-xs text-[#00ff00]">{friend.currentActivity}</span></div>)}
                      {friend.location && (<div className="flex items-center gap-1.5 mt-0.5"><MapPin className="w-3 h-3 text-gray-500" /><span className="text-xs text-gray-500">{friend.location}</span></div>)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {inactiveFriends.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">All Friends ({inactiveFriends.length})</h3>
              <div className="space-y-2">
                {inactiveFriends.map((friend) => (
                  <button key={friend.id} onClick={() => { onSelectFriend(friend); onClose(); }} className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-xl p-4 flex items-center gap-3 transition-colors">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800"><img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{friend.name}</p>
                      <p className="text-xs text-gray-400">@{friend.username}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{friend.workoutsThisWeek} workouts this week</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredFriends.length === 0 && (<div className="text-center py-12"><p className="text-gray-400">No friends found</p></div>)}
        </div>
      </div>
    </div>
  );
}
