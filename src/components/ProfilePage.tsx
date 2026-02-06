import { ChevronLeft, ChevronRight, Dumbbell, X, Calendar, Share2, Users as UsersIcon, Mail, MapPin, Calendar as CalendarIcon, Edit, Copy, Check, Phone, Link2, Heart, Bike, TrendingUp, Ruler, Activity, Shield, LogOut } from 'lucide-react';
import { useState } from 'react';
import { FriendProfileModal } from './FriendProfileModal';
import { ViewAllFriendsModal } from './ViewAllFriendsModal';
import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../types';

interface ProfilePageProps {
  userData?: UserProfile | null;
  onIntegrationsClick?: () => void;
}

interface WorkoutLog {
  date: string;
  startTime: string;
  duration: number; // in minutes
  workoutType: string; // e.g., "Chest Day", "Back Day", "Legs + Cardio"
  exercises: {
    name: string;
    sets: {
      weight: number;
      reps: number;
    }[];
    cardioData?: {
      duration: number; // in minutes
      distance?: number; // in miles
      speed?: number; // mph
      incline?: number; // percentage
      calories?: number;
    };
  }[];
}

// Mock workout data
const workoutHistory: WorkoutLog[] = [
  {
    date: '2026-02-03',
    startTime: '6:45 AM',
    duration: 68,
    workoutType: 'CHEST',
    exercises: [
      {
        name: 'Bench Press',
        sets: [
          { weight: 185, reps: 8 },
          { weight: 185, reps: 7 },
          { weight: 185, reps: 6 },
          { weight: 165, reps: 8 }
        ]
      },
      {
        name: 'Incline Dumbbell Press',
        sets: [
          { weight: 70, reps: 10 },
          { weight: 70, reps: 9 },
          { weight: 70, reps: 8 }
        ]
      },
      {
        name: 'Cable Flyes',
        sets: [
          { weight: 40, reps: 12 },
          { weight: 40, reps: 12 },
          { weight: 40, reps: 10 }
        ]
      }
    ]
  },
  {
    date: '2026-02-02',
    startTime: '6:00 AM',
    duration: 58,
    workoutType: 'ARMS',
    exercises: [
      {
        name: 'Barbell Curl',
        sets: [
          { weight: 75, reps: 10 },
          { weight: 75, reps: 9 },
          { weight: 75, reps: 8 }
        ]
      },
      {
        name: 'Tricep Dips',
        sets: [
          { weight: 0, reps: 12 },
          { weight: 0, reps: 11 },
          { weight: 0, reps: 10 }
        ]
      }
    ]
  },
  {
    date: '2026-02-02',
    startTime: '5:00 PM',
    duration: 30,
    workoutType: 'CARDIO',
    exercises: [
      {
        name: 'Treadmill Run',
        sets: [
          { weight: 0, reps: 30 }
        ],
        cardioData: {
          duration: 30,
          distance: 2.5,
          speed: 5,
          incline: 0,
          calories: 150
        }
      }
    ]
  },
  {
    date: '2026-02-01',
    startTime: '7:15 AM',
    duration: 52,
    workoutType: 'BACK',
    exercises: [
      {
        name: 'Deadlift',
        sets: [
          { weight: 315, reps: 5 },
          { weight: 315, reps: 5 },
          { weight: 315, reps: 4 }
        ]
      },
      {
        name: 'Barbell Rows',
        sets: [
          { weight: 155, reps: 8 },
          { weight: 155, reps: 8 },
          { weight: 155, reps: 7 }
        ]
      }
    ]
  },
  {
    date: '2026-01-30',
    startTime: '6:30 AM',
    duration: 75,
    workoutType: 'LEGS',
    exercises: [
      {
        name: 'Squat',
        sets: [
          { weight: 225, reps: 8 },
          { weight: 225, reps: 8 },
          { weight: 225, reps: 7 },
          { weight: 205, reps: 10 }
        ]
      },
      {
        name: 'Leg Press',
        sets: [
          { weight: 360, reps: 12 },
          { weight: 360, reps: 11 },
          { weight: 360, reps: 10 }
        ]
      }
    ]
  },
  {
    date: '2026-01-28',
    startTime: '5:00 PM',
    duration: 45,
    workoutType: 'SHLDR',
    exercises: [
      {
        name: 'Overhead Press',
        sets: [
          { weight: 115, reps: 8 },
          { weight: 115, reps: 7 },
          { weight: 115, reps: 6 }
        ]
      },
      {
        name: 'Lateral Raises',
        sets: [
          { weight: 25, reps: 12 },
          { weight: 25, reps: 12 },
          { weight: 25, reps: 10 }
        ]
      }
    ]
  },
  {
    date: '2026-01-26',
    startTime: '8:00 AM',
    duration: 58,
    workoutType: 'BACK',
    exercises: [
      {
        name: 'Pull-ups',
        sets: [
          { weight: 0, reps: 12 },
          { weight: 0, reps: 10 },
          { weight: 0, reps: 8 }
        ]
      },
      {
        name: 'Lat Pulldown',
        sets: [
          { weight: 140, reps: 10 },
          { weight: 140, reps: 9 },
          { weight: 140, reps: 8 }
        ]
      }
    ]
  }
];

export function ProfilePage({ userData, onIntegrationsClick }: ProfilePageProps) {
  const { signOut } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 5)); // Feb 5, 2026
  const [selectedDay, setSelectedDay] = useState<WorkoutLog[] | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [viewAllFriends, setViewAllFriends] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<{
    id: number;
    name: string;
    username: string;
    profilePic: string;
    location?: string;
    currentActivity?: string;
    streak?: number;
    workoutsThisWeek?: number;
    joined?: string;
  } | null>(null);

  // Privacy settings
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    shareLiveActivity: true,
    sharePRs: true,
    shareWorkoutHistory: true,
    shareStreak: true,
    profileVisibility: 'everyone' as 'everyone' | 'friends' | 'private',
  });

  // Get user's first name and initials
  const firstName = userData?.name.split(' ')[0] || 'Max';
  const initials = userData?.name
    ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'M';
  
  // Format experience level for display
  const experienceLabel = userData?.experience 
    ? userData.experience.charAt(0).toUpperCase() + userData.experience.slice(1)
    : 'Intermediate';

  const handleCopyReferral = () => {
    navigator.clipboard.writeText('maxed.app/ref/MAX2026');
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const hasWorkout = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workoutHistory.filter(w => w.date === dateStr);
  };

  const handleDayClick = (day: number) => {
    const workout = hasWorkout(day);
    if (workout.length > 0) {
      setSelectedDay(workout);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Mock friends data
  const friendsPreview = [
    { id: 1, name: 'Sarah', username: 'sarahlifts', profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', streak: 12, workoutsThisWeek: 5, joined: 'Jan 24', currentActivity: 'Leg Day', location: 'Gold\'s Gym' },
    { id: 2, name: 'Mike', username: 'mikefit', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', streak: 8, workoutsThisWeek: 4, joined: 'Feb 24' },
    { id: 3, name: 'Emma', username: 'emmalifts', profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', streak: 5, workoutsThisWeek: 3, joined: 'Dec 23' },
    { id: 4, name: 'Josh', username: 'joshfit', profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', streak: 15, workoutsThisWeek: 6, joined: 'Oct 23' },
    { id: 5, name: 'Alex', username: 'alexgains', profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', streak: 20, workoutsThisWeek: 5, joined: 'Sep 23' },
    { id: 6, name: 'Kate', username: 'katefit', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', streak: 3, workoutsThisWeek: 2, joined: 'Mar 24' },
    { id: 7, name: 'Tom', username: 'tomstrong', profilePic: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop', streak: 10, workoutsThisWeek: 4, joined: 'Nov 23' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-20 overflow-y-auto">
      {/* Profile Header */}
      <div className="px-5 pt-safe pt-10 pb-6 bg-gradient-to-b from-[#0a0a0a] to-transparent">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-full flex items-center justify-center text-2xl font-bold text-black shadow-lg shadow-[#00ff00]/20">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{userData?.name || 'Max Thompson'}</h1>
            <p className="text-sm text-gray-500">Member since {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'recently'}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowPrivacySettings(true)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <Shield className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <Edit className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={signOut}
              className="p-2 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#0a0a0a] rounded-2xl p-3 border border-gray-900 text-center">
            <div className="text-xl font-bold text-[#00ff00]">127</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Workouts</div>
          </div>
          <div className="bg-[#0a0a0a] rounded-2xl p-3 border border-gray-900 text-center">
            <div className="text-xl font-bold">86h</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Total Time</div>
          </div>
          <div className="bg-[#0a0a0a] rounded-2xl p-3 border border-gray-900 text-center">
            <div className="text-xl font-bold">42</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Day Streak</div>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Personal Information */}
        <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-[#00ff00]" />
            Personal Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium">{userData?.phone || 'No phone set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Training Location</p>
                <p className="text-sm font-medium">{userData?.gym || 'Not set'}</p>
                {userData?.gymAddress && <p className="text-xs text-gray-500">{userData.gymAddress}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Ruler className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Height & Weight</p>
                <p className="text-sm font-medium">
                  {userData?.heightFeet ? `${userData.heightFeet}'${userData.heightInches || 0}"` : '5\'10"'}, {userData?.weight || '175'} lbs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Dumbbell className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Experience Level</p>
                <p className="text-sm font-medium">{experienceLabel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Friends Section */}
        <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-[#00ff00]" />
              Friends
            </h3>
            <span className="text-xs text-gray-500">24 friends</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {friendsPreview.map((friend, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFriend(friend)}
                className="flex-shrink-0 text-center hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 mb-1">
                  <img 
                    src={friend.profilePic} 
                    alt={friend.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[10px] text-gray-500">{friend.name}</p>
              </button>
            ))}
          </div>
          <button 
            onClick={() => setViewAllFriends(true)}
            className="w-full mt-2 bg-[#1a1a1a] hover:bg-[#252525] text-white font-medium py-2.5 rounded-xl text-xs transition-colors"
          >
            View All Friends
          </button>
        </div>

        {/* Referral Section */}
        <div className="bg-gradient-to-br from-[#00ff00]/10 to-[#00ff00]/5 rounded-2xl p-4 border border-[#00ff00]/20">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-[#00ff00]/10 rounded-xl">
              <Share2 className="w-4 h-4 text-[#00ff00]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1">Invite Friends</h3>
              <p className="text-xs text-gray-400">Share your referral link and earn rewards</p>
            </div>
          </div>
          <div className="bg-black/30 rounded-xl p-3 flex items-center justify-between gap-2 mb-2">
            <code className="text-xs text-[#00ff00] font-mono flex-1 truncate">maxed.app/ref/MAX2026</code>
            <button
              onClick={handleCopyReferral}
              className="p-2 bg-[#00ff00] hover:bg-[#00dd00] rounded-lg transition-all active:scale-95"
            >
              {copiedReferral ? (
                <Check className="w-4 h-4 text-black" />
              ) : (
                <Copy className="w-4 h-4 text-black" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-gray-500 text-center">3 friends joined · Earn 1 month free for 5 referrals</p>
        </div>

        {/* App Integrations Section */}
        <button 
          onClick={onIntegrationsClick}
          className="w-full bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900 hover:border-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00ff00]/10 rounded-xl">
              <Link2 className="w-4 h-4 text-[#00ff00]" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-sm mb-0.5">App Integrations</h3>
              <p className="text-xs text-gray-400">Connect fitness apps & sync your data</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
          
          {/* Connected Apps Preview */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-900">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-pink-500 border-2 border-[#0a0a0a] flex items-center justify-center">
                <Heart className="w-3 h-3 text-white" />
              </div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 border-2 border-[#0a0a0a] flex items-center justify-center">
                <Bike className="w-3 h-3 text-white" />
              </div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-[#0a0a0a] flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
            </div>
            <span className="text-[10px] text-gray-500">3 connected</span>
          </div>
        </button>

        {/* Workout History Calendar */}
        <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#00ff00]" />
            Workout History
          </h3>
          
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="text-center">
              <h2 className="font-bold text-sm">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            </div>

            <button
              onClick={nextMonth}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {dayNames.map(day => (
              <div key={day} className="text-center text-[10px] text-gray-500 font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 mb-4">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const workouts = hasWorkout(day);
              const isToday = day === 5; // Current day is Feb 5

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all p-1.5 overflow-hidden ${
                    workouts.length > 0
                      ? 'bg-gradient-to-br from-[#00ff00]/15 to-[#00ff00]/5 border border-[#00ff00]/30 hover:from-[#00ff00]/25 hover:to-[#00ff00]/10'
                      : 'bg-black/30 hover:bg-black/50 border border-transparent'
                  } ${isToday ? 'ring-2 ring-[#00ff00]/50' : ''}`}
                >
                  <span className={`text-[11px] font-bold ${workouts.length > 0 ? 'text-white' : 'text-gray-600'}`}>
                    {day}
                  </span>
                  {workouts.length > 0 && (
                    <div className="flex gap-0.5 items-center mt-0.5">
                      {workouts.map((_, idx) => (
                        <div key={idx} className="w-1.5 h-1.5 rounded-full bg-[#00ff00]" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-black/30 rounded-xl p-2.5 text-center">
              <div className="text-lg font-bold text-[#00ff00]">
                {workoutHistory.filter(w => {
                  const date = new Date(w.date);
                  return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
                }).length}
              </div>
              <div className="text-[9px] text-gray-500">Workouts</div>
            </div>

            <div className="bg-black/30 rounded-xl p-2.5 text-center">
              <div className="text-lg font-bold">
                {workoutHistory
                  .filter(w => {
                    const date = new Date(w.date);
                    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
                  })
                  .reduce((acc, w) => acc + w.exercises.length, 0)}
              </div>
              <div className="text-[9px] text-gray-500">Exercises</div>
            </div>

            <div className="bg-black/30 rounded-xl p-2.5 text-center">
              <div className="text-lg font-bold">
                {workoutHistory
                  .filter(w => {
                    const date = new Date(w.date);
                    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
                  })
                  .reduce((acc, w) => acc + w.exercises.reduce((sum, e) => sum + e.sets.length, 0), 0)}
              </div>
              <div className="text-[9px] text-gray-500">Total Sets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
              <div>
                <h3 className="font-bold text-lg">
                  {new Date(selectedDay[0].date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {selectedDay.map((workout, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[#00ff00]/10 border border-[#00ff00]/30 rounded-lg text-[10px] text-[#00ff00] font-bold">
                      {workout.workoutType}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Exercise List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {selectedDay.map((workout, workoutIdx) => (
                <div key={workoutIdx}>
                  {/* Workout Session Header */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-800">
                    <div>
                      <h3 className="font-bold text-sm text-[#00ff00]">{workout.workoutType}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {workout.startTime} · {workout.duration} min · {workout.exercises.length} exercises
                      </p>
                    </div>
                  </div>

                  {/* Exercises for this workout */}
                  <div className="space-y-3">
                    {workout.exercises.map((exercise, idx) => (
                      <div key={idx} className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                        <div className="flex items-center gap-2 mb-3">
                          {exercise.cardioData ? (
                            <Activity className="w-4 h-4 text-[#00ff00]" />
                          ) : (
                            <Dumbbell className="w-4 h-4 text-[#00ff00]" />
                          )}
                          <h4 className="font-bold text-sm">{exercise.name}</h4>
                        </div>

                        {exercise.cardioData ? (
                          /* Cardio Data Display */
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-black/30 rounded-xl px-3 py-2.5">
                                <p className="text-[10px] text-gray-500 mb-1">Duration</p>
                                <p className="text-sm font-bold">{exercise.cardioData.duration} min</p>
                              </div>
                              {exercise.cardioData.distance && (
                                <div className="bg-black/30 rounded-xl px-3 py-2.5">
                                  <p className="text-[10px] text-gray-500 mb-1">Distance</p>
                                  <p className="text-sm font-bold">{exercise.cardioData.distance} mi</p>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {exercise.cardioData.speed !== undefined && (
                                <div className="bg-black/30 rounded-xl px-3 py-2.5">
                                  <p className="text-[10px] text-gray-500 mb-1">Speed</p>
                                  <p className="text-sm font-bold">{exercise.cardioData.speed} mph</p>
                                </div>
                              )}
                              {exercise.cardioData.incline !== undefined && (
                                <div className="bg-black/30 rounded-xl px-3 py-2.5">
                                  <p className="text-[10px] text-gray-500 mb-1">Incline</p>
                                  <p className="text-sm font-bold">{exercise.cardioData.incline}%</p>
                                </div>
                              )}
                            </div>
                            {exercise.cardioData.calories && (
                              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl px-3 py-2.5">
                                <p className="text-[10px] text-gray-400 mb-1">Calories Burned</p>
                                <p className="text-sm font-bold text-orange-400">{exercise.cardioData.calories} cal</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Weight Training Data Display */
                          <>
                            <div className="space-y-2">
                              {exercise.sets.map((set, setIdx) => (
                                <div key={setIdx} className="flex items-center justify-between text-sm bg-black/30 rounded-xl px-3 py-2.5">
                                  <span className="text-gray-500 font-medium">Set {setIdx + 1}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold">
                                      {set.weight > 0 ? `${set.weight} lbs` : 'Bodyweight'}
                                    </span>
                                    <span className="text-gray-600">×</span>
                                    <span className="font-semibold">{set.reps} reps</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Set Summary */}
                            <div className="mt-3 pt-3 border-t border-gray-900/50 flex items-center justify-between text-xs">
                              <span className="text-gray-500">Total Volume</span>
                              <span className="text-[#00ff00] font-semibold">
                                {exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0).toLocaleString()} lbs
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Friend Profile Modal */}
      {selectedFriend && (
        <FriendProfileModal
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
        />
      )}

      {/* View All Friends Modal */}
      {viewAllFriends && (
        <ViewAllFriendsModal
          onClose={() => setViewAllFriends(false)}
          onSelectFriend={(friend) => {
            setSelectedFriend(friend);
            setViewAllFriends(false);
          }}
        />
      )}

      {/* Privacy Settings Modal */}
      {showPrivacySettings && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#00ff00]/10 rounded-xl">
                  <Shield className="w-4 h-4 text-[#00ff00]" />
                </div>
                <h3 className="font-bold text-lg">Privacy & Sharing</h3>
              </div>
              <button
                onClick={() => setShowPrivacySettings(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Sharing Toggles */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 tracking-wide mb-3">SHARING PREFERENCES</h4>
                <div className="space-y-1">
                  {[
                    { key: 'shareLiveActivity' as const, label: 'Live Activity', desc: 'Show friends when you\'re working out' },
                    { key: 'sharePRs' as const, label: 'Personal Records', desc: 'Share your PRs on your profile' },
                    { key: 'shareWorkoutHistory' as const, label: 'Workout History', desc: 'Let friends see your past workouts' },
                    { key: 'shareStreak' as const, label: 'Streak', desc: 'Display your workout streak' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setPrivacySettings({ ...privacySettings, [item.key]: !privacySettings[item.key] })}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <div className={`w-11 h-6 rounded-full transition-colors relative ${
                        privacySettings[item.key] ? 'bg-[#00ff00]' : 'bg-gray-700'
                      }`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          privacySettings[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Visibility */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 tracking-wide mb-3">PROFILE VISIBILITY</h4>
                <div className="space-y-2">
                  {[
                    { value: 'everyone' as const, label: 'Everyone', desc: 'Anyone can see your profile' },
                    { value: 'friends' as const, label: 'Friends Only', desc: 'Only friends can see your profile' },
                    { value: 'private' as const, label: 'Private', desc: 'Nobody can see your profile' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPrivacySettings({ ...privacySettings, profileVisibility: option.value })}
                      className={`w-full p-3.5 rounded-xl border-2 transition-all text-left ${
                        privacySettings.profileVisibility === option.value
                          ? 'border-[#00ff00] bg-[#00ff00]/5'
                          : 'border-gray-800 bg-[#0a0a0a] hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{option.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
                        </div>
                        {privacySettings.profileVisibility === option.value && (
                          <Check className="w-4 h-4 text-[#00ff00]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="px-5 py-4 border-t border-gray-900">
              <button
                onClick={() => setShowPrivacySettings(false)}
                className="w-full bg-[#00ff00] text-black font-bold py-3.5 rounded-2xl text-sm hover:bg-[#00dd00] transition-all active:scale-[0.97]"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
