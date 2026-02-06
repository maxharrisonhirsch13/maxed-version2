import { X, MapPin, Flame, Dumbbell, TrendingUp, Calendar, Trophy, Target, User, Zap } from 'lucide-react';

interface FriendProfileModalProps {
  friend: {
    name: string;
    username: string;
    profilePic: string;
    location?: string;
    currentActivity?: string;
    streak?: number;
    workoutsThisWeek?: number;
    joined?: string;
  };
  onClose: () => void;
}

export function FriendProfileModal({ friend, onClose }: FriendProfileModalProps) {
  const profileData = {
    split: "Arnold's Split",
    splitDays: ['Chest/Back', 'Shoulders/Arms', 'Legs'],
    experience: 'Advanced',
    bodyStats: { height: '5\'11"', weight: '185 lbs', age: 28 },
    prs: [
      { exercise: 'Bench Press', weight: '315 lbs', reps: 1, date: '2 weeks ago' },
      { exercise: 'Squat', weight: '405 lbs', reps: 1, date: '1 month ago' },
      { exercise: 'Deadlift', weight: '495 lbs', reps: 1, date: '3 weeks ago' },
      { exercise: 'Overhead Press', weight: '185 lbs', reps: 1, date: '1 week ago' },
    ],
    weeklyGoal: '6 workouts',
    favoriteExercises: ['Bench Press', 'Squats', 'Pull-ups']
  };

  const recentWorkouts = [
    { name: 'Chest & Back', date: 'Today', duration: '1h 12min', exercises: 8 },
    { name: 'Shoulders & Arms', date: 'Yesterday', duration: '58 min', exercises: 10 },
    { name: 'Legs', date: '2 days ago', duration: '1h 25min', exercises: 7 },
  ];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-t-3xl md:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <div className="h-32 bg-gradient-to-br from-[#00ff00]/20 to-[#00cc00]/10"></div>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-full border-4 border-[#0a0a0a] overflow-hidden bg-gray-800">
              <img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="pt-16 px-6 pb-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-1">{friend.name}</h2>
            <p className="text-gray-400">@{friend.username}</p>
          </div>

          {friend.currentActivity && (
            <div className="bg-[#1a1a1a] rounded-xl p-4 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00ff00] rounded-full flex items-center justify-center animate-pulse"><Dumbbell className="w-5 h-5 text-black" /></div>
              <div><p className="text-xs text-gray-400">Currently working out</p><p className="font-semibold">{friend.currentActivity}</p></div>
            </div>
          )}

          {friend.location && (
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-6"><MapPin className="w-4 h-4" /><span>{friend.location}</span></div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-[#1a1a1a] rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2"><Flame className="w-5 h-5 text-orange-500" /></div>
              <p className="text-2xl font-bold">{friend.streak || 0}</p><p className="text-xs text-gray-400">Day Streak</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2"><Dumbbell className="w-5 h-5 text-[#00ff00]" /></div>
              <p className="text-2xl font-bold">{friend.workoutsThisWeek || 0}</p><p className="text-xs text-gray-400">This Week</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2"><Calendar className="w-5 h-5 text-blue-500" /></div>
              <p className="text-2xl font-bold">{friend.joined || 'Jan 24'}</p><p className="text-xs text-gray-400">Joined</p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-4"><Target className="w-5 h-5 text-[#00ff00]" /><h3 className="font-bold">Training Info</h3></div>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800"><span className="text-sm text-gray-400">Split</span><span className="font-semibold text-sm">{profileData.split}</span></div>
              <div className="flex items-start justify-between pb-3 border-b border-gray-800"><span className="text-sm text-gray-400">Split Days</span><div className="text-right">{profileData.splitDays.map((day, idx) => (<div key={idx} className="text-xs font-semibold text-gray-300">{day}</div>))}</div></div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-800"><span className="text-sm text-gray-400">Experience</span><span className="font-semibold text-sm">{profileData.experience}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Weekly Goal</span><span className="font-semibold text-sm">{profileData.weeklyGoal}</span></div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-4"><User className="w-5 h-5 text-blue-500" /><h3 className="font-bold">Body Stats</h3></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center"><p className="text-xs text-gray-400 mb-1">Height</p><p className="font-bold">{profileData.bodyStats.height}</p></div>
              <div className="text-center"><p className="text-xs text-gray-400 mb-1">Weight</p><p className="font-bold">{profileData.bodyStats.weight}</p></div>
              <div className="text-center"><p className="text-xs text-gray-400 mb-1">Age</p><p className="font-bold">{profileData.bodyStats.age}</p></div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3"><Trophy className="w-5 h-5 text-yellow-500" /><h3 className="font-bold">Personal Records</h3></div>
            <div className="space-y-2">
              {profileData.prs.map((pr, idx) => (
                <div key={idx} className="bg-[#1a1a1a] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1"><span className="font-semibold text-sm">{pr.exercise}</span><span className="text-[#00ff00] font-bold">{pr.weight}</span></div>
                  <div className="flex items-center justify-between text-xs text-gray-400"><span>{pr.reps} rep max</span><span>{pr.date}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#00ff00]" />Recent Activity</h3>
            <div className="space-y-2">
              {recentWorkouts.map((workout, idx) => (
                <div key={idx} className="bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between">
                  <div><p className="font-semibold text-sm">{workout.name}</p><p className="text-xs text-gray-400">{workout.date}</p></div>
                  <span className="text-sm text-gray-400">{workout.duration}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <button className="w-full bg-[#00ff00] text-black font-bold py-3 rounded-xl hover:bg-[#00cc00] transition-colors">Send Message</button>
            <button className="w-full bg-[#1a1a1a] text-white font-semibold py-3 rounded-xl hover:bg-[#252525] transition-colors">Remove Friend</button>
          </div>
        </div>
      </div>
    </div>
  );
}
