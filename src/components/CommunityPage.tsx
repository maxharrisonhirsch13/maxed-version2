import { useState } from 'react';
import { TrendingUp, Users, MapPin, Dumbbell, Clock, User, Flame, Trophy, Activity, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { FriendProfileModal } from './FriendProfileModal';
import { ViewAllFriendsModal } from './ViewAllFriendsModal';
import { useAuth } from '../context/AuthContext';

type Tab = 'trending' | 'friends' | 'classes' | 'nearby';

type LeaderboardTab = 'streaks' | 'prs' | 'movement';

function getTrendingData(userGym: string) {
  return {
    topGym: { name: userGym || 'Your Gym', subtitle: 'Most active gym in your area', change: '+34%', activeNow: 47 },
    topLift: { name: 'Bench Press', subtitle: 'Most popular lift', change: '+22%', performedToday: 234 },
    streakLeaderboard: [
      { rank: 1, name: 'James Lee', gym: userGym || 'Local Gym', streak: 89, isYou: false },
      { rank: 2, name: 'Mike Reynolds', gym: userGym || 'Local Gym', streak: 47, isYou: false },
      { rank: 3, name: 'Alex Park', gym: userGym || 'Local Gym', streak: 41, isYou: false },
      { rank: 4, name: 'You', gym: userGym || 'Local Gym', streak: 38, isYou: true },
      { rank: 5, name: 'Chris Johnson', gym: userGym || 'Local Gym', streak: 32, isYou: false },
    ],
    prLeaderboard: [
      { rank: 1, name: 'Mike Reynolds', gym: userGym || 'Local Gym', lift: 'Bench Press', weight: 315, isYou: false },
      { rank: 2, name: 'James Lee', gym: userGym || 'Local Gym', lift: 'Bench Press', weight: 285, isYou: false },
      { rank: 3, name: 'You', gym: userGym || 'Local Gym', lift: 'Bench Press', weight: 245, isYou: true },
      { rank: 4, name: 'Alex Park', gym: userGym || 'Local Gym', lift: 'Bench Press', weight: 225, isYou: false },
      { rank: 5, name: 'Chris Johnson', gym: userGym || 'Local Gym', lift: 'Bench Press', weight: 205, isYou: false },
    ],
    squatLeaderboard: [
      { rank: 1, name: 'James Lee', gym: userGym || 'Local Gym', lift: 'Squat', weight: 405, isYou: false },
      { rank: 2, name: 'You', gym: userGym || 'Local Gym', lift: 'Squat', weight: 365, isYou: true },
      { rank: 3, name: 'Mike Reynolds', gym: userGym || 'Local Gym', lift: 'Squat', weight: 345, isYou: false },
      { rank: 4, name: 'Chris Johnson', gym: userGym || 'Local Gym', lift: 'Squat', weight: 315, isYou: false },
      { rank: 5, name: 'Alex Park', gym: userGym || 'Local Gym', lift: 'Squat', weight: 275, isYou: false },
    ],
    movementLeaderboard: [
      { rank: 1, name: 'James Lee', gym: userGym || 'Local Gym', change: 0, prevRank: 1, isYou: false, reason: 'Consistent king — 89 day streak' },
      { rank: 2, name: 'You', gym: userGym || 'Local Gym', change: 2, prevRank: 4, isYou: true, reason: 'New squat PR + 5 day streak' },
      { rank: 3, name: 'Mike Reynolds', gym: userGym || 'Local Gym', change: -1, prevRank: 2, isYou: false, reason: 'Missed 2 days this week' },
      { rank: 4, name: 'Alex Park', gym: userGym || 'Local Gym', change: -1, prevRank: 3, isYou: false, reason: 'Dropped volume this week' },
      { rank: 5, name: 'Chris Johnson', gym: userGym || 'Local Gym', change: 0, prevRank: 5, isYou: false, reason: 'Steady — 32 day streak' },
    ],
  };
}

const friendsData = [
  { id: 1, name: 'Sarah Johnson', avatar: 'SJ', gym: 'UM CCRB', status: 'Working out now', exercise: 'Deadlifts', streak: 23, activeNow: true },
  { id: 2, name: 'Mike Chen', avatar: 'MC', gym: 'Gold\'s Gym', status: 'Finished 2h ago', exercise: 'Upper Body', streak: 15, activeNow: false },
  { id: 3, name: 'Jessica Taylor', avatar: 'JT', gym: 'UM CCRB', status: 'Working out now', exercise: 'Squats', streak: 31, activeNow: true },
  { id: 4, name: 'David Rodriguez', avatar: 'DR', gym: 'Planet Fitness', status: 'Rest day', exercise: null, streak: 8, activeNow: false },
];

function getClassesData(userGym: string) {
  const gym = userGym || 'Your Gym';
  return [
    { id: 1, name: 'HIIT Burn', instructor: 'Sarah M.', time: '6:00 AM', duration: 45, enrolled: 14, friendsCount: 2, spotsLeft: 6, difficulty: 'High', gym },
    { id: 2, name: 'Power Lift', instructor: 'Mike R.', time: '7:30 AM', duration: 60, enrolled: 12, friendsCount: 1, spotsLeft: 3, difficulty: 'Medium', gym },
    { id: 3, name: 'Spin Class', instructor: 'Jenny L.', time: '12:00 PM', duration: 45, enrolled: 23, friendsCount: 3, spotsLeft: 2, difficulty: 'Medium', gym },
    { id: 4, name: 'Yoga Flow', instructor: 'Amanda K.', time: '5:30 PM', duration: 60, enrolled: 18, friendsCount: 2, spotsLeft: 7, difficulty: 'Low', gym },
  ];
}

const defaultNearbyGyms = [
  { id: 1, name: 'UM CCRB', distance: '0.3 mi', activeNow: 47, friendsCount: 8, peakTime: '5-7 PM', avgWaitTime: '5 min', equipment: ['Squat Racks', 'Benches', 'Cardio'] },
  { id: 2, name: 'Gold\'s Gym', distance: '1.2 mi', activeNow: 32, friendsCount: 3, peakTime: '6-8 AM', avgWaitTime: '10 min', equipment: ['Full Free Weights', 'Pool', 'Sauna'] },
  { id: 3, name: 'Planet Fitness', distance: '2.1 mi', activeNow: 58, friendsCount: 2, peakTime: '4-6 PM', avgWaitTime: '3 min', equipment: ['Machines', 'Cardio', 'Free Weights'] },
  { id: 4, name: 'LA Fitness', distance: '3.5 mi', activeNow: 41, friendsCount: 5, peakTime: '5-7 PM', avgWaitTime: '8 min', equipment: ['Basketball Court', 'Pool', 'Full Gym'] },
];

export function CommunityPage() {
  const [activeTab, setActiveTab] = useState<Tab>('trending');
  const [leaderboardTab, setLeaderboardTab] = useState<LeaderboardTab>('streaks');
  const [prLift, setPrLift] = useState<'bench' | 'squat'>('bench');
  const [selectedFriend, setSelectedFriend] = useState<typeof friendsData[0] | null>(null);
  const [viewAllFriends, setViewAllFriends] = useState(false);
  const { profile } = useAuth();
  const trendingData = getTrendingData(profile?.gym || '');
  const classesData = getClassesData(profile?.gym || '');

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500';
    if (rank === 2) return 'bg-gray-400';
    if (rank === 3) return 'bg-orange-600';
    return 'bg-gray-600';
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {selectedFriend && (
        <FriendProfileModal
          friend={selectedFriend as any}
          onClose={() => setSelectedFriend(null)}
        />
      )}

      {viewAllFriends && (
        <ViewAllFriendsModal
          onClose={() => setViewAllFriends(false)}
          onSelectFriend={(friend) => {
            setSelectedFriend({
              id: friend.id,
              name: friend.name,
              avatar: friend.name.split(' ').map((n: string) => n[0]).join(''),
              gym: friend.location || '',
              status: friend.currentActivity ? 'Working out now' : 'Offline',
              exercise: friend.currentActivity || null,
              streak: friend.streak || 0,
              activeNow: !!friend.currentActivity
            } as any);
          }}
        />
      )}

      <header className="px-4 pt-safe pt-8 pb-3">
        <h1 className="text-xl font-bold">Community</h1>
      </header>

      <div className="px-4 mb-4">
        <div className="flex gap-2">
          {(['trending', 'friends', 'classes', 'nearby'] as Tab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeTab === tab ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {activeTab === 'trending' && (
          <>
            <div className="bg-[#1a1a1a] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-[#00ff00]" /><h2 className="font-bold text-sm">Trending This Week</h2></div>
              <div className="space-y-3">
                <div className="bg-black/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1"><h3 className="font-bold">{trendingData.topGym.name}</h3><div className="flex items-center gap-1 text-[#00ff00]"><TrendingUp className="w-3 h-3" /><span className="text-xs font-semibold">{trendingData.topGym.change}</span></div></div>
                  <p className="text-xs text-gray-400 mb-2">{trendingData.topGym.subtitle}</p>
                  <div className="flex items-center gap-1 text-[#00ff00]"><Activity className="w-3 h-3" /><span className="text-xs font-semibold">{trendingData.topGym.activeNow} lifting now</span></div>
                </div>
                <div className="bg-black/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1"><h3 className="font-bold">{trendingData.topLift.name}</h3><div className="flex items-center gap-1 text-[#00ff00]"><TrendingUp className="w-3 h-3" /><span className="text-xs font-semibold">{trendingData.topLift.change}</span></div></div>
                  <p className="text-xs text-gray-400 mb-2">{trendingData.topLift.subtitle}</p>
                  <div className="flex items-center gap-1"><Dumbbell className="w-3 h-3 text-blue-400" /><span className="text-xs font-semibold text-blue-400">{trendingData.topLift.performedToday} performed today</span></div>
                </div>
              </div>
            </div>
            <div className="bg-[#1a1a1a] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3"><Trophy className="w-4 h-4 text-yellow-500" /><h2 className="font-bold text-sm">Leaderboard</h2></div>
              <div className="flex gap-1.5 mb-4">
                {([['streaks', 'Streaks'], ['prs', 'PRs'], ['movement', 'Movement']] as [LeaderboardTab, string][]).map(([tab, label]) => (
                  <button key={tab} onClick={() => setLeaderboardTab(tab)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${leaderboardTab === tab ? 'bg-[#00ff00] text-black' : 'bg-black/50 text-gray-400 hover:bg-black/70'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {leaderboardTab === 'streaks' && (
                <div className="space-y-2">
                  {trendingData.streakLeaderboard.map((person) => (
                    <div key={person.rank} className={`rounded-xl p-3 flex items-center gap-3 ${person.isYou ? 'bg-[#00ff00]/10 border border-[#00ff00]/30' : 'bg-black/50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(person.rank)}`}>{person.rank}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><p className="font-semibold text-sm">{person.name}</p>{person.isYou && (<span className="px-2 py-0.5 bg-[#00ff00] text-black text-[10px] font-bold rounded-full">YOU</span>)}</div>
                        <p className="text-xs text-gray-400">{person.gym}</p>
                      </div>
                      <div className="text-right"><p className="text-lg font-bold text-orange-500">{person.streak}</p><p className="text-[10px] text-gray-400">days</p></div>
                    </div>
                  ))}
                </div>
              )}

              {leaderboardTab === 'prs' && (
                <>
                  <div className="flex gap-2 mb-3">
                    <button onClick={() => setPrLift('bench')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${prLift === 'bench' ? 'bg-white text-black' : 'bg-black/50 text-gray-400'}`}>Bench Press</button>
                    <button onClick={() => setPrLift('squat')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${prLift === 'squat' ? 'bg-white text-black' : 'bg-black/50 text-gray-400'}`}>Squat</button>
                  </div>
                  <div className="space-y-2">
                    {(prLift === 'bench' ? trendingData.prLeaderboard : trendingData.squatLeaderboard).map((person) => (
                      <div key={person.rank} className={`rounded-xl p-3 flex items-center gap-3 ${person.isYou ? 'bg-[#00ff00]/10 border border-[#00ff00]/30' : 'bg-black/50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(person.rank)}`}>{person.rank}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2"><p className="font-semibold text-sm">{person.name}</p>{person.isYou && (<span className="px-2 py-0.5 bg-[#00ff00] text-black text-[10px] font-bold rounded-full">YOU</span>)}</div>
                          <p className="text-xs text-gray-400">{person.gym}</p>
                        </div>
                        <div className="text-right"><p className="text-lg font-bold text-blue-400">{person.weight}</p><p className="text-[10px] text-gray-400">lbs</p></div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {leaderboardTab === 'movement' && (
                <div className="space-y-2">
                  {trendingData.movementLeaderboard.map((person) => (
                    <div key={person.rank} className={`rounded-xl p-3 flex items-center gap-3 ${person.isYou ? 'bg-[#00ff00]/10 border border-[#00ff00]/30' : 'bg-black/50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(person.rank)}`}>{person.rank}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{person.name}</p>
                          {person.isYou && (<span className="px-2 py-0.5 bg-[#00ff00] text-black text-[10px] font-bold rounded-full">YOU</span>)}
                        </div>
                        <p className="text-xs text-gray-500">{person.reason}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {person.change > 0 ? (
                          <span className="flex items-center gap-0.5 text-[#00ff00] font-bold text-sm"><ArrowUp className="w-3.5 h-3.5" />{person.change}</span>
                        ) : person.change < 0 ? (
                          <span className="flex items-center gap-0.5 text-red-400 font-bold text-sm"><ArrowDown className="w-3.5 h-3.5" />{Math.abs(person.change)}</span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-gray-500 font-bold text-sm"><Minus className="w-3.5 h-3.5" /></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'friends' && (
          <>
            <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-xl p-3 border border-green-500/20 mb-3">
              <div className="flex items-center justify-between"><div><p className="text-xs text-gray-400 mb-1">Friends Active Now</p><p className="text-2xl font-bold">{friendsData.filter(f => f.activeNow).length}</p></div><Activity className="w-8 h-8 text-[#00ff00]" /></div>
            </div>
            <div className="space-y-2">
              {friendsData.map((friend) => (
                <div key={friend.id} className="bg-[#1a1a1a] rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <button className="relative" onClick={() => setSelectedFriend(friend)}>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold cursor-pointer hover:opacity-80 transition-opacity">{friend.avatar}</div>
                      {friend.activeNow && (<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00ff00] border-2 border-black rounded-full"></div>)}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1"><h3 className="font-bold text-sm">{friend.name}</h3><div className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /><span className="text-xs font-semibold text-orange-500">{friend.streak}</span></div></div>
                      <div className="flex items-center gap-1 mb-1"><MapPin className="w-3 h-3 text-gray-400" /><p className="text-xs text-gray-400">{friend.gym}</p></div>
                      {friend.activeNow && friend.exercise ? (
                        <div className="flex items-center gap-1 text-[#00ff00]"><Dumbbell className="w-3 h-3" /><span className="text-xs font-semibold">{friend.status} • {friend.exercise}</span></div>
                      ) : (<p className="text-xs text-gray-500">{friend.status}</p>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4"><button className="px-4 py-2 bg-white text-black font-semibold rounded-lg text-xs hover:bg-gray-100 transition-colors" onClick={() => setViewAllFriends(true)}>View All Friends</button></div>
          </>
        )}

        {activeTab === 'classes' && (
          <>
            <div className="mb-3"><h3 className="text-sm font-bold text-gray-400">Classes near you</h3></div>
            <div className="space-y-3">
              {classesData.map((classItem) => (
                <div key={classItem.id} className="bg-[#1a1a1a] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-base mb-1">{classItem.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{classItem.instructor}</span><span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{classItem.time}</span><span>•</span><span>{classItem.duration} min</span>
                      </div>
                      <p className="text-xs text-gray-500">{classItem.gym}</p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${classItem.spotsLeft <= 3 ? 'bg-red-500/20 text-red-400' : classItem.spotsLeft <= 6 ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-[#00ff00]'}`}>{classItem.spotsLeft} spots</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-400">{classItem.enrolled} enrolled</span>
                      <span className="text-[#00ff00] font-semibold">{classItem.friendsCount} friends</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${classItem.difficulty === 'High' ? 'bg-red-500/20 text-red-400' : classItem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>{classItem.difficulty}</span>
                    </div>
                    <button className="px-4 py-2 bg-white text-black font-semibold rounded-lg text-xs hover:bg-gray-100 transition-colors">Join</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'nearby' && (
          <>
            {profile?.gym && !profile?.isHomeGym && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-400 mb-3">Your Gym</h3>
                <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#00ff00]/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-base mb-1">{profile.gym}</h3>
                      {profile.gymAddress && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{profile.gymAddress}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00ff00] text-black">YOUR GYM</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/50 rounded-lg p-2">
                      <div className="flex items-center gap-2 mb-1"><Activity className="w-3 h-3 text-[#00ff00]" /><span className="text-xs text-gray-400">Lifting Now</span></div>
                      <p className="text-lg font-bold text-[#00ff00]">--</p>
                    </div>
                    <div className="bg-black/50 rounded-lg p-2">
                      <div className="flex items-center gap-2 mb-1"><Users className="w-3 h-3 text-blue-400" /><span className="text-xs text-gray-400">Friends</span></div>
                      <p className="text-lg font-bold text-blue-400">--</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="mb-3"><h3 className="text-sm font-bold text-gray-400">Other gyms nearby</h3></div>
            <div className="space-y-3">
              {defaultNearbyGyms.map((gym) => (
                <div key={gym.id} className="bg-[#1a1a1a] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1"><h3 className="font-bold text-base mb-1">{gym.name}</h3><div className="flex items-center gap-1 text-xs text-gray-400 mb-2"><MapPin className="w-3 h-3" /><span>{gym.distance} away</span></div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-black/50 rounded-lg p-2"><div className="flex items-center gap-2 mb-1"><Activity className="w-3 h-3 text-[#00ff00]" /><span className="text-xs text-gray-400">Lifting Now</span></div><p className="text-lg font-bold text-[#00ff00]">{gym.activeNow}</p></div>
                    <div className="bg-black/50 rounded-lg p-2"><div className="flex items-center gap-2 mb-1"><Users className="w-3 h-3 text-blue-400" /><span className="text-xs text-gray-400">Friends</span></div><p className="text-lg font-bold text-blue-400">{gym.friendsCount}</p></div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs"><span className="text-gray-400">Peak time</span><span className="font-semibold">{gym.peakTime}</span></div>
                    <div className="flex items-center justify-between text-xs"><span className="text-gray-400">Avg. wait time</span><span className="font-semibold">{gym.avgWaitTime}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {gym.equipment.map((item, idx) => (<span key={idx} className="px-2 py-1 bg-black/50 text-gray-400 rounded text-[10px]">{item}</span>))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
