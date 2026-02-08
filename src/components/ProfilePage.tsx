import { ChevronLeft, ChevronRight, Dumbbell, X, Calendar, Share2, Users as UsersIcon, Mail, MapPin, Calendar as CalendarIcon, Edit, Copy, Check, Link2, Heart, Bike, TrendingUp, Ruler, Activity, Shield, LogOut, Loader2, Zap, Moon, Home as HomeIcon, Search, Trophy, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FriendProfileModal } from './FriendProfileModal';
import { ViewAllFriendsModal } from './ViewAllFriendsModal';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { useWhoopStatus } from '../hooks/useWhoopStatus';
import { useGarminStatus } from '../hooks/useGarminStatus';
import { useOuraStatus } from '../hooks/useOuraStatus';
import { useGymSearch } from '../hooks/useGymSearch';
import { usePrivacySettings } from '../hooks/usePrivacySettings';
import { useFriendships } from '../hooks/useFriendships';
import { usePersonalRecords } from '../hooks/usePersonalRecords';
import { useAICoach } from '../hooks/useAICoach';
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


export function ProfilePage({ userData, onIntegrationsClick }: ProfilePageProps) {
  const { signOut, user } = useAuth();
  const { updateProfile } = useProfile();
  const { workouts: rawWorkouts } = useWorkoutHistory();
  const { connected: whoopConnected } = useWhoopStatus();
  const { connected: garminConnected } = useGarminStatus();
  const { connected: ouraConnected } = useOuraStatus();
  const { settings: privacyFromDb, updateSettings: updatePrivacyInDb } = usePrivacySettings();
  const { friends } = useFriendships();
  const { getPR, upsertBig3PRs, loading: prsLoading } = usePersonalRecords();
  const { fetchEstimatePRs, estimatePRsLoading } = useAICoach();

  // Convert real workout data to calendar-friendly format
  const workoutHistory: WorkoutLog[] = rawWorkouts.map(w => ({
    date: w.startedAt.split('T')[0],
    startTime: new Date(w.startedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    duration: w.durationMinutes || 0,
    workoutType: w.workoutType.toUpperCase(),
    exercises: w.exercises.map(ex => ({
      name: ex.exerciseName,
      sets: ex.sets.map(s => ({ weight: s.weightLbs || 0, reps: s.reps || 0 })),
    })),
  }));

  // Compute profile stats from real data
  const totalWorkouts = rawWorkouts.length;
  const totalHours = Math.round(rawWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0) / 60);
  const currentStreak = (() => {
    if (rawWorkouts.length === 0) return 0;
    const workoutDates = [...new Set(rawWorkouts.map(w => w.startedAt.split('T')[0]))].sort().reverse();
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(today);
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    if (!workoutDates.includes(fmt(checkDate))) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (workoutDates.includes(fmt(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  })();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<WorkoutLog[] | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [viewAllFriends, setViewAllFriends] = useState(false);
  const [selectedFriendUserId, setSelectedFriendUserId] = useState<string | null>(null);

  // Privacy settings
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    shareLiveActivity: privacyFromDb.shareLiveActivity,
    sharePRs: privacyFromDb.sharePrs,
    shareWorkoutHistory: privacyFromDb.shareWorkoutHistory,
    shareStreak: privacyFromDb.shareStreak,
    profileVisibility: privacyFromDb.profileVisibility,
  });

  // Sync privacy settings from DB when they load
  useEffect(() => {
    setPrivacySettings({
      shareLiveActivity: privacyFromDb.shareLiveActivity,
      sharePRs: privacyFromDb.sharePrs,
      shareWorkoutHistory: privacyFromDb.shareWorkoutHistory,
      shareStreak: privacyFromDb.shareStreak,
      profileVisibility: privacyFromDb.profileVisibility,
    });
  }, [privacyFromDb]);

  // Edit profile state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    heightFeet: 0,
    heightInches: 0,
    weight: 0,
    experience: '' as string,
    gym: '' as string,
    split: '' as string,
    customSplit: [] as { day: number; muscles: string[] }[],
  });
  const [editCustomDays, setEditCustomDays] = useState(3);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Big 3 PRs state
  const [showEditPRs, setShowEditPRs] = useState(false);
  const [prBench, setPrBench] = useState(0);
  const [prSquat, setPrSquat] = useState(0);
  const [prDeadlift, setPrDeadlift] = useState(0);
  const [prSaving, setPrSaving] = useState(false);

  // Edit Training Setup state
  const [showEditTraining, setShowEditTraining] = useState(false);
  const [trainingIsHome, setTrainingIsHome] = useState(false);
  const [trainingGymName, setTrainingGymName] = useState('');
  const [trainingEquipment, setTrainingEquipment] = useState({
    dumbbells: { has: false, maxWeight: 50 },
    barbell: { has: false, maxWeight: 225 },
    kettlebell: { has: false, maxWeight: 35 },
    cables: false,
    pullUpBar: false,
  });
  const [trainingSaving, setTrainingSaving] = useState(false);
  const [trainingError, setTrainingError] = useState('');
  const [gymSearchQuery, setGymSearchQuery] = useState('');
  const [selectedGymPlaceId, setSelectedGymPlaceId] = useState<string | null>(null);
  const [selectedGymAddress, setSelectedGymAddress] = useState<string | null>(null);
  const [selectedGymLat, setSelectedGymLat] = useState<number | null>(null);
  const [selectedGymLng, setSelectedGymLng] = useState<number | null>(null);

  const { results: gymSearchResults, loading: gymSearchLoading } = useGymSearch(gymSearchQuery);

  const editMuscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Cardio'];

  // Get user's first name and initials
  const firstName = userData?.name?.split(' ')[0] || 'User';
  const initials = userData?.name
    ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  
  // Format experience level for display
  const experienceLabel = userData?.experience 
    ? userData.experience.charAt(0).toUpperCase() + userData.experience.slice(1)
    : 'Intermediate';

  const handleCopyReferral = () => {
    navigator.clipboard.writeText('maxed.app/ref/MAX2026');
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleSaveProfile = async () => {
    setEditSaving(true);
    setEditError('');
    try {
      await updateProfile({
        name: editData.name,
        height_feet: editData.heightFeet,
        height_inches: editData.heightInches,
        weight_lbs: editData.weight,
        experience: editData.experience || null,
        gym: editData.gym || null,
        split: editData.split || null,
        custom_split: editData.split === 'custom' ? editData.customSplit : null,
      });
      setShowEditProfile(false);
    } catch (err: any) {
      setEditError(err.message || 'Failed to save');
    } finally {
      setEditSaving(false);
    }
  };

  const handleSaveTraining = async () => {
    setTrainingSaving(true);
    setTrainingError('');
    try {
      await updateProfile({
        is_home_gym: trainingIsHome,
        gym: trainingIsHome ? 'Home Gym' : (trainingGymName || null),
        gym_address: trainingIsHome ? null : (selectedGymAddress || null),
        gym_place_id: trainingIsHome ? null : (selectedGymPlaceId || null),
        gym_lat: trainingIsHome ? null : (selectedGymLat || null),
        gym_lng: trainingIsHome ? null : (selectedGymLng || null),
        home_equipment: trainingIsHome ? trainingEquipment : null,
      });
      setShowEditTraining(false);
    } catch (err: any) {
      setTrainingError(err.message || 'Failed to save');
    } finally {
      setTrainingSaving(false);
    }
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

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const gradients = ['from-purple-500 to-blue-500', 'from-pink-500 to-orange-500', 'from-green-500 to-teal-500', 'from-yellow-500 to-red-500', 'from-indigo-500 to-purple-500'];
  const getGradient = (name: string) => gradients[name.charCodeAt(0) % gradients.length];

  return (
    <div className="min-h-screen bg-black text-white pb-20 overflow-y-auto">
      {/* Profile Header */}
      <div className="px-5 pt-safe pt-10 pb-6 bg-gradient-to-b from-[#0a0a0a] to-transparent">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-full flex items-center justify-center text-2xl font-bold text-black shadow-lg shadow-[#00ff00]/20">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-0.5">{userData?.name || 'User'}</h1>
            {userData?.username && <p className="text-sm text-[#00ff00] font-medium mb-0.5">@{userData.username}</p>}
            <p className="text-sm text-gray-500">Member since {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'recently'}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowPrivacySettings(true)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <Shield className="w-5 h-5 text-gray-400" />
            </button>
            <button onClick={() => {
              const cs = userData?.customSplit || [];
              setEditData({
                name: userData?.name || '',
                heightFeet: userData?.heightFeet || 5,
                heightInches: userData?.heightInches || 10,
                weight: userData?.weight || 175,
                experience: userData?.experience || '',
                gym: userData?.gym || '',
                split: userData?.split || '',
                customSplit: cs.length > 0 ? cs : Array.from({ length: 3 }, (_, i) => ({ day: i + 1, muscles: [] })),
              });
              setEditCustomDays(cs.length > 0 ? cs.length : 3);
              setShowEditProfile(true);
            }} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
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
            <div className="text-xl font-bold text-[#00ff00]">{totalWorkouts}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Workouts</div>
          </div>
          <div className="bg-[#0a0a0a] rounded-2xl p-3 border border-gray-900 text-center">
            <div className="text-xl font-bold">{totalHours}h</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Total Time</div>
          </div>
          <div className="bg-[#0a0a0a] rounded-2xl p-3 border border-gray-900 text-center">
            <div className="text-xl font-bold">{currentStreak}</div>
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
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{user?.email || 'No email set'}</p>
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

        {/* Big 3 PRs */}
        <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#00ff00]" />
            Big 3 PRs
          </h3>
          {prsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Bench', value: getPR('Bench Press', 'weight')?.value },
                { label: 'Squat', value: getPR('Squat', 'weight')?.value },
                { label: 'Deadlift', value: getPR('Deadlift', 'weight')?.value },
              ].map((lift) => (
                <div key={lift.label} className="bg-black/30 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-[#00ff00]">{lift.value || '—'}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{lift.label}</div>
                </div>
              ))}
            </div>
          )}
          {!prsLoading && (getPR('Bench Press', 'weight')?.value || getPR('Squat', 'weight')?.value || getPR('Deadlift', 'weight')?.value) && (
            <div className="mt-3 bg-black/30 rounded-xl p-2.5 text-center">
              <span className="text-xs text-gray-500">Total: </span>
              <span className="text-sm font-bold text-white">
                {(getPR('Bench Press', 'weight')?.value || 0) + (getPR('Squat', 'weight')?.value || 0) + (getPR('Deadlift', 'weight')?.value || 0)} lbs
              </span>
            </div>
          )}
          <button
            onClick={() => {
              setPrBench(getPR('Bench Press', 'weight')?.value || 0);
              setPrSquat(getPR('Squat', 'weight')?.value || 0);
              setPrDeadlift(getPR('Deadlift', 'weight')?.value || 0);
              setShowEditPRs(true);
            }}
            className="w-full mt-3 bg-[#1a1a1a] hover:bg-[#252525] text-white font-medium py-2.5 rounded-xl text-xs transition-colors"
          >
            {getPR('Bench Press', 'weight') || getPR('Squat', 'weight') || getPR('Deadlift', 'weight') ? 'Edit PRs' : 'Add Your PRs'}
          </button>
        </div>

        {/* Training Setup */}
        <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            {userData?.isHomeGym ? <HomeIcon className="w-4 h-4 text-[#00ff00]" /> : <MapPin className="w-4 h-4 text-[#00ff00]" />}
            Training Setup
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">{userData?.isHomeGym ? 'Home Gym' : 'Default Gym'}</p>
                <p className="text-sm font-medium">{userData?.gym || 'Not set'}</p>
                {userData?.gymAddress && !userData?.isHomeGym && <p className="text-xs text-gray-500">{userData.gymAddress}</p>}
              </div>
            </div>
            {userData?.isHomeGym && userData?.homeEquipment && (
              <div className="flex items-center gap-3">
                <Dumbbell className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Equipment</p>
                  <p className="text-sm font-medium">
                    {[
                      userData.homeEquipment.dumbbells.has && `Dumbbells (${userData.homeEquipment.dumbbells.maxWeight}lb)`,
                      userData.homeEquipment.barbell.has && `Barbell (${userData.homeEquipment.barbell.maxWeight}lb)`,
                      userData.homeEquipment.kettlebell?.has && `Kettlebell (${userData.homeEquipment.kettlebell.maxWeight}lb)`,
                      userData.homeEquipment.cables && 'Cables/Bands',
                      userData.homeEquipment.pullUpBar && 'Pull-up Bar',
                    ].filter(Boolean).join(' · ') || 'Bodyweight only'}
                  </p>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              const eq = userData?.homeEquipment;
              setTrainingIsHome(userData?.isHomeGym || false);
              setTrainingGymName(userData?.gym || '');
              setGymSearchQuery(userData?.gym || '');
              setSelectedGymPlaceId(userData?.gymPlaceId || null);
              setSelectedGymAddress(userData?.gymAddress || null);
              setSelectedGymLat(userData?.gymLat || null);
              setSelectedGymLng(userData?.gymLng || null);
              setTrainingEquipment({
                dumbbells: eq?.dumbbells || { has: false, maxWeight: 50 },
                barbell: eq?.barbell || { has: false, maxWeight: 225 },
                kettlebell: eq?.kettlebell || { has: false, maxWeight: 35 },
                cables: eq?.cables || false,
                pullUpBar: eq?.pullUpBar || false,
              });
              setTrainingError('');
              setShowEditTraining(true);
            }}
            className="w-full mt-3 bg-[#1a1a1a] hover:bg-[#252525] text-white font-medium py-2.5 rounded-xl text-xs transition-colors"
          >
            Edit Training Setup
          </button>
        </div>

        {/* Friends Section */}
        <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-[#00ff00]" />
              Friends
            </h3>
            <span className="text-xs text-gray-500">{friends.length} friends</span>
          </div>
          {friends.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {friends.slice(0, 10).map((friend) => (
                <button
                  key={friend.friendshipId}
                  onClick={() => setSelectedFriendUserId(friend.userId)}
                  className="flex-shrink-0 text-center hover:opacity-80 transition-opacity"
                >
                  {friend.avatarUrl ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 mb-1">
                      <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getGradient(friend.name)} flex items-center justify-center font-bold text-xs mb-1`}>
                      {getInitials(friend.name)}
                    </div>
                  )}
                  <p className="text-[10px] text-gray-500">{friend.name.split(' ')[0]}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-3">No friends yet. Add friends from the Community tab!</p>
          )}
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
              {whoopConnected && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-[#0a0a0a] flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              )}
              {garminConnected && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-[#0a0a0a] flex items-center justify-center">
                  <Activity className="w-3 h-3 text-white" />
                </div>
              )}
              {ouraConnected && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 border-2 border-[#0a0a0a] flex items-center justify-center">
                  <Moon className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-gray-500">{3 + (whoopConnected ? 1 : 0) + (garminConnected ? 1 : 0) + (ouraConnected ? 1 : 0)} auto-synced</span>
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
              const now = new Date();
              const isToday = day === now.getDate() && currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear();

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
      {selectedFriendUserId && (
        <FriendProfileModal
          friendUserId={selectedFriendUserId}
          onClose={() => setSelectedFriendUserId(null)}
        />
      )}

      {/* View All Friends Modal */}
      {viewAllFriends && (
        <ViewAllFriendsModal
          onClose={() => setViewAllFriends(false)}
          onSelectFriend={(friend) => {
            setSelectedFriendUserId(friend.userId);
            setViewAllFriends(false);
          }}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          <div className="min-h-screen px-5 py-8 pb-24">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Edit Profile</h1>
                <button onClick={() => setShowEditProfile(false)} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ff00] transition-colors"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Height</label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        min="3"
                        max="8"
                        value={editData.heightFeet}
                        onChange={(e) => setEditData({ ...editData, heightFeet: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3 text-white text-center focus:outline-none focus:border-[#00ff00] transition-colors"
                      />
                      <p className="text-center text-xs text-gray-500 mt-1">feet</p>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={editData.heightInches}
                        onChange={(e) => setEditData({ ...editData, heightInches: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3 text-white text-center focus:outline-none focus:border-[#00ff00] transition-colors"
                      />
                      <p className="text-center text-xs text-gray-500 mt-1">inches</p>
                    </div>
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Weight (lbs)</label>
                  <input
                    type="number"
                    min="80"
                    max="500"
                    value={editData.weight}
                    onChange={(e) => setEditData({ ...editData, weight: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ff00] transition-colors"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Experience</label>
                  <div className="space-y-2">
                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setEditData({ ...editData, experience: level })}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left capitalize ${
                          editData.experience === level
                            ? 'border-[#00ff00] bg-[#00ff00]/10'
                            : 'border-gray-800 bg-[#1a1a1a] hover:border-gray-700'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Training Split */}
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Training Split</label>
                  <div className="space-y-2">
                    {[
                      { value: 'ppl', label: 'Push Pull Legs' },
                      { value: 'arnold', label: 'Arnold Split' },
                      { value: 'bro', label: 'Bro Split' },
                      { value: 'upper-lower', label: 'Upper/Lower' },
                      { value: 'full-body', label: 'Full Body' },
                      { value: 'custom', label: 'Custom Split' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setEditData({ ...editData, split: option.value });
                          if (option.value === 'custom' && editData.customSplit.length === 0) {
                            setEditData(prev => ({
                              ...prev,
                              split: 'custom',
                              customSplit: Array.from({ length: editCustomDays }, (_, i) => ({ day: i + 1, muscles: [] })),
                            }));
                          }
                        }}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                          editData.split === option.value
                            ? 'border-[#00ff00] bg-[#00ff00]/10'
                            : 'border-gray-800 bg-[#1a1a1a] hover:border-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Split Editor */}
                  {editData.split === 'custom' && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-400">Days per week:</label>
                        <select
                          value={editCustomDays}
                          onChange={(e) => {
                            const days = parseInt(e.target.value);
                            setEditCustomDays(days);
                            setEditData(prev => ({
                              ...prev,
                              customSplit: Array.from({ length: days }, (_, i) => ({
                                day: i + 1,
                                muscles: prev.customSplit[i]?.muscles || [],
                              })),
                            }));
                          }}
                          className="bg-[#0a0a0a] border border-gray-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00ff00]"
                        >
                          {[3, 4, 5, 6, 7].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                      {Array.from({ length: editCustomDays }, (_, idx) => {
                        const dayData = editData.customSplit[idx] || { day: idx + 1, muscles: [] };
                        return (
                          <div key={idx} className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-3">
                            <h4 className="font-bold text-xs mb-2">Day {idx + 1}</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {editMuscleGroups.map(muscle => {
                                const isSelected = dayData.muscles.includes(muscle);
                                return (
                                  <button
                                    key={muscle}
                                    type="button"
                                    onClick={() => {
                                      setEditData(prev => {
                                        const newSplit = [...prev.customSplit];
                                        if (!newSplit[idx]) newSplit[idx] = { day: idx + 1, muscles: [] };
                                        if (isSelected) {
                                          newSplit[idx] = { ...newSplit[idx], muscles: newSplit[idx].muscles.filter(m => m !== muscle) };
                                        } else {
                                          newSplit[idx] = { ...newSplit[idx], muscles: [...newSplit[idx].muscles, muscle] };
                                        }
                                        return { ...prev, customSplit: newSplit };
                                      });
                                    }}
                                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                                      isSelected
                                        ? 'bg-[#00ff00] text-black'
                                        : 'bg-black/50 text-gray-400 hover:bg-black/70'
                                    }`}
                                  >
                                    {muscle}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Error */}
                {editError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                    <p className="text-red-400 text-xs">{editError}</p>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveProfile}
                disabled={editSaving || !editData.name.trim()}
                className="w-full bg-[#00ff00] text-black font-bold py-4 rounded-xl mt-8 hover:bg-[#00dd00] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {editSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Training Setup Modal */}
      {showEditTraining && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#00ff00]/10 rounded-xl">
                  <HomeIcon className="w-4 h-4 text-[#00ff00]" />
                </div>
                <h3 className="font-bold text-lg">Training Setup</h3>
              </div>
              <button onClick={() => setShowEditTraining(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Gym vs Home Toggle */}
              <div>
                <label className="text-xs font-semibold text-gray-500 tracking-wide mb-3 block">TRAINING LOCATION</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTrainingIsHome(false)}
                    className={`p-3.5 rounded-xl border-2 transition-all text-center ${
                      !trainingIsHome ? 'border-[#00ff00] bg-[#00ff00]/10' : 'border-gray-800 bg-[#1a1a1a] hover:border-gray-700'
                    }`}
                  >
                    <MapPin className={`w-5 h-5 mx-auto mb-1.5 ${!trainingIsHome ? 'text-[#00ff00]' : 'text-gray-500'}`} />
                    <p className="text-sm font-medium">Gym</p>
                  </button>
                  <button
                    onClick={() => setTrainingIsHome(true)}
                    className={`p-3.5 rounded-xl border-2 transition-all text-center ${
                      trainingIsHome ? 'border-[#00ff00] bg-[#00ff00]/10' : 'border-gray-800 bg-[#1a1a1a] hover:border-gray-700'
                    }`}
                  >
                    <HomeIcon className={`w-5 h-5 mx-auto mb-1.5 ${trainingIsHome ? 'text-[#00ff00]' : 'text-gray-500'}`} />
                    <p className="text-sm font-medium">Home Gym</p>
                  </button>
                </div>
              </div>

              {/* Gym Search (only for non-home) */}
              {!trainingIsHome && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 tracking-wide mb-2 block">GYM NAME</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={gymSearchQuery}
                      onChange={(e) => {
                        setGymSearchQuery(e.target.value);
                        if (selectedGymPlaceId) {
                          setTrainingGymName('');
                          setSelectedGymPlaceId(null);
                          setSelectedGymAddress(null);
                          setSelectedGymLat(null);
                          setSelectedGymLng(null);
                        }
                      }}
                      placeholder="Search by gym name or zip code"
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff00] transition-colors"
                    />
                  </div>

                  {/* Selected gym confirmation */}
                  {selectedGymPlaceId && (
                    <div className="mt-3 bg-[#00ff00]/10 border border-[#00ff00]/30 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Check className="w-4 h-4 text-[#00ff00] shrink-0" />
                        <p className="font-bold text-sm">{trainingGymName}</p>
                      </div>
                      <p className="text-xs text-gray-400 ml-6">{selectedGymAddress}</p>
                    </div>
                  )}

                  {/* Search results */}
                  {!selectedGymPlaceId && gymSearchQuery.trim().length >= 2 && (
                    <div className="mt-2 space-y-1.5">
                      {gymSearchLoading && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                          <span className="text-xs text-gray-500 ml-2">Searching...</span>
                        </div>
                      )}
                      {!gymSearchLoading && gymSearchResults.length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-3">No gyms found</p>
                      )}
                      {!gymSearchLoading && gymSearchResults.map((gym) => (
                        <button
                          key={gym.placeId}
                          onClick={() => {
                            setTrainingGymName(gym.name);
                            setSelectedGymPlaceId(gym.placeId);
                            setSelectedGymAddress(gym.address);
                            setSelectedGymLat(gym.lat);
                            setSelectedGymLng(gym.lng);
                            setGymSearchQuery(gym.name);
                          }}
                          className="w-full p-3 bg-[#0a0a0a] border border-gray-800 rounded-xl text-left hover:border-gray-700 transition-colors"
                        >
                          <div className="font-medium text-sm">{gym.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{gym.address}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Equipment (only for home gym) */}
              {trainingIsHome && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 tracking-wide mb-3 block">EQUIPMENT</label>
                  <div className="space-y-3">
                    {/* Dumbbells */}
                    <div className="bg-[#1a1a1a] rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Dumbbells</span>
                        <button
                          onClick={() => setTrainingEquipment(prev => ({ ...prev, dumbbells: { ...prev.dumbbells, has: !prev.dumbbells.has } }))}
                          className={`w-11 h-6 rounded-full transition-colors relative ${trainingEquipment.dumbbells.has ? 'bg-[#00ff00]' : 'bg-gray-700'}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${trainingEquipment.dumbbells.has ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      {trainingEquipment.dumbbells.has && (
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-400">Max weight (per dumbbell)</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setTrainingEquipment(prev => ({ ...prev, dumbbells: { ...prev.dumbbells, maxWeight: Math.max(5, prev.dumbbells.maxWeight - 5) } }))}
                              className="w-7 h-7 bg-[#252525] hover:bg-[#333] rounded-lg flex items-center justify-center text-sm font-bold text-gray-400"
                            >&minus;</button>
                            <span className="text-sm font-bold w-12 text-center">{trainingEquipment.dumbbells.maxWeight}lb</span>
                            <button
                              onClick={() => setTrainingEquipment(prev => ({ ...prev, dumbbells: { ...prev.dumbbells, maxWeight: Math.min(200, prev.dumbbells.maxWeight + 5) } }))}
                              className="w-7 h-7 bg-[#252525] hover:bg-[#333] rounded-lg flex items-center justify-center text-sm font-bold text-gray-400"
                            >+</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Barbell */}
                    <div className="bg-[#1a1a1a] rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Barbell</span>
                        <button
                          onClick={() => setTrainingEquipment(prev => ({ ...prev, barbell: { ...prev.barbell, has: !prev.barbell.has } }))}
                          className={`w-11 h-6 rounded-full transition-colors relative ${trainingEquipment.barbell.has ? 'bg-[#00ff00]' : 'bg-gray-700'}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${trainingEquipment.barbell.has ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      {trainingEquipment.barbell.has && (
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-400">Max weight (total)</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setTrainingEquipment(prev => ({ ...prev, barbell: { ...prev.barbell, maxWeight: Math.max(45, prev.barbell.maxWeight - 10) } }))}
                              className="w-7 h-7 bg-[#252525] hover:bg-[#333] rounded-lg flex items-center justify-center text-sm font-bold text-gray-400"
                            >&minus;</button>
                            <span className="text-sm font-bold w-12 text-center">{trainingEquipment.barbell.maxWeight}lb</span>
                            <button
                              onClick={() => setTrainingEquipment(prev => ({ ...prev, barbell: { ...prev.barbell, maxWeight: Math.min(700, prev.barbell.maxWeight + 10) } }))}
                              className="w-7 h-7 bg-[#252525] hover:bg-[#333] rounded-lg flex items-center justify-center text-sm font-bold text-gray-400"
                            >+</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Kettlebell */}
                    <div className="bg-[#1a1a1a] rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Kettlebell</span>
                        <button
                          onClick={() => setTrainingEquipment(prev => ({ ...prev, kettlebell: { ...prev.kettlebell, has: !prev.kettlebell.has } }))}
                          className={`w-11 h-6 rounded-full transition-colors relative ${trainingEquipment.kettlebell.has ? 'bg-[#00ff00]' : 'bg-gray-700'}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${trainingEquipment.kettlebell.has ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      {trainingEquipment.kettlebell.has && (
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-400">Max weight</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setTrainingEquipment(prev => ({ ...prev, kettlebell: { ...prev.kettlebell, maxWeight: Math.max(10, prev.kettlebell.maxWeight - 5) } }))}
                              className="w-7 h-7 bg-[#252525] hover:bg-[#333] rounded-lg flex items-center justify-center text-sm font-bold text-gray-400"
                            >&minus;</button>
                            <span className="text-sm font-bold w-12 text-center">{trainingEquipment.kettlebell.maxWeight}lb</span>
                            <button
                              onClick={() => setTrainingEquipment(prev => ({ ...prev, kettlebell: { ...prev.kettlebell, maxWeight: Math.min(106, prev.kettlebell.maxWeight + 5) } }))}
                              className="w-7 h-7 bg-[#252525] hover:bg-[#333] rounded-lg flex items-center justify-center text-sm font-bold text-gray-400"
                            >+</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cables */}
                    <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between">
                      <span className="text-sm font-medium">Cables / Bands</span>
                      <button
                        onClick={() => setTrainingEquipment(prev => ({ ...prev, cables: !prev.cables }))}
                        className={`w-11 h-6 rounded-full transition-colors relative ${trainingEquipment.cables ? 'bg-[#00ff00]' : 'bg-gray-700'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${trainingEquipment.cables ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    {/* Pull-up Bar */}
                    <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between">
                      <span className="text-sm font-medium">Pull-up Bar</span>
                      <button
                        onClick={() => setTrainingEquipment(prev => ({ ...prev, pullUpBar: !prev.pullUpBar }))}
                        className={`w-11 h-6 rounded-full transition-colors relative ${trainingEquipment.pullUpBar ? 'bg-[#00ff00]' : 'bg-gray-700'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${trainingEquipment.pullUpBar ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {trainingError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <p className="text-red-400 text-xs">{trainingError}</p>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-900">
              <button
                onClick={handleSaveTraining}
                disabled={trainingSaving}
                className="w-full bg-[#00ff00] text-black font-bold py-3.5 rounded-2xl text-sm hover:bg-[#00dd00] transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {trainingSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Training Setup'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit PRs Modal */}
      {showEditPRs && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#00ff00]/10 rounded-xl">
                  <Trophy className="w-4 h-4 text-[#00ff00]" />
                </div>
                <h3 className="font-bold text-lg">Big 3 PRs</h3>
              </div>
              <button onClick={() => setShowEditPRs(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <p className="text-xs text-gray-500">Enter your 1-rep max for each lift (in lbs)</p>

              {[
                { label: 'Bench Press', value: prBench, setter: setPrBench },
                { label: 'Squat', value: prSquat, setter: setPrSquat },
                { label: 'Deadlift', value: prDeadlift, setter: setPrDeadlift },
              ].map((lift) => (
                <div key={lift.label}>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">{lift.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="1500"
                      value={lift.value || ''}
                      onChange={(e) => lift.setter(Math.min(parseInt(e.target.value) || 0, 1500))}
                      placeholder="0"
                      className="w-28 bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3 text-white text-center text-lg font-bold focus:outline-none focus:border-[#00ff00] transition-colors"
                    />
                    <span className="text-gray-500 text-sm">lbs</span>
                  </div>
                </div>
              ))}

              <button
                onClick={async () => {
                  const result = await fetchEstimatePRs({
                    bodyweightLbs: userData?.weight || 175,
                    experience: userData?.experience || 'beginner',
                  });
                  if (result) {
                    setPrBench(result.benchPress);
                    setPrSquat(result.squat);
                    setPrDeadlift(result.deadlift);
                  }
                }}
                disabled={estimatePRsLoading}
                className="w-full p-3 rounded-xl border-2 border-gray-800 bg-[#1a1a1a] hover:border-gray-700 transition-all flex items-center justify-center gap-2"
              >
                {estimatePRsLoading ? (
                  <Loader2 className="w-4 h-4 text-[#00ff00] animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[#00ff00]" />
                )}
                <span className="text-sm font-semibold">{estimatePRsLoading ? 'Estimating...' : 'Guess my PRs'}</span>
              </button>
            </div>

            <div className="px-5 py-4 border-t border-gray-900">
              <button
                onClick={async () => {
                  setPrSaving(true);
                  await upsertBig3PRs(prBench, prSquat, prDeadlift);
                  setPrSaving(false);
                  setShowEditPRs(false);
                }}
                disabled={prSaving}
                className="w-full bg-[#00ff00] text-black font-bold py-3.5 rounded-2xl text-sm hover:bg-[#00dd00] transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {prSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save PRs'
                )}
              </button>
            </div>
          </div>
        </div>
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
                onClick={() => {
                  updatePrivacyInDb({
                    share_live_activity: privacySettings.shareLiveActivity,
                    share_prs: privacySettings.sharePRs,
                    share_workout_history: privacySettings.shareWorkoutHistory,
                    share_streak: privacySettings.shareStreak,
                    profile_visibility: privacySettings.profileVisibility,
                  });
                  setShowPrivacySettings(false);
                }}
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
