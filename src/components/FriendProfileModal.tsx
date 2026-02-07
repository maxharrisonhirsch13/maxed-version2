import { useState, useEffect } from 'react';
import { X, Dumbbell, Trophy, Flame, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useFriendships } from '../hooks/useFriendships';
import { computeStreak } from '../utils/streaks';

interface FriendProfileModalProps {
  friendUserId: string;
  onClose: () => void;
}

interface FriendProfile {
  name: string;
  username: string | null;
  avatarUrl: string | null;
  experience: string | null;
  split: string | null;
  createdAt: string;
}

interface FriendPR {
  exerciseName: string;
  value: number;
  unit: string;
  achievedAt: string;
}

interface RecentWorkout {
  id: string;
  workoutType: string;
  startedAt: string;
  durationMinutes: number | null;
  exerciseCount: number;
}

export function FriendProfileModal({ friendUserId, onClose }: FriendProfileModalProps) {
  const { friends, removeFriend } = useFriendships();
  const [profile, setProfile] = useState<FriendProfile | null>(null);
  const [prs, setPrs] = useState<FriendPR[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [streak, setStreak] = useState(0);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  const friendship = friends.find(f => f.userId === friendUserId);

  useEffect(() => {
    loadFriendData();
  }, [friendUserId]);

  async function loadFriendData() {
    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, username, avatar_url, experience, split, created_at')
        .eq('id', friendUserId)
        .single();

      if (profileData) {
        setProfile({
          name: profileData.name,
          username: profileData.username,
          avatarUrl: profileData.avatar_url,
          experience: profileData.experience,
          split: profileData.split,
          createdAt: profileData.created_at,
        });
      }

      // Fetch PRs
      const { data: prData } = await supabase
        .from('personal_records')
        .select('exercise_name, value, unit, achieved_at')
        .eq('user_id', friendUserId)
        .eq('pr_type', 'weight')
        .order('value', { ascending: false })
        .limit(5);

      if (prData) {
        setPrs(prData.map(pr => ({
          exerciseName: pr.exercise_name,
          value: pr.value,
          unit: pr.unit,
          achievedAt: pr.achieved_at,
        })));
      }

      // Fetch recent workouts (last 5)
      const { data: workoutData } = await supabase
        .from('workouts')
        .select('id, workout_type, started_at, duration_minutes, workout_exercises(id)')
        .eq('user_id', friendUserId)
        .order('started_at', { ascending: false })
        .limit(5);

      if (workoutData) {
        setRecentWorkouts(workoutData.map((w: any) => ({
          id: w.id,
          workoutType: w.workout_type,
          startedAt: w.started_at,
          durationMinutes: w.duration_minutes,
          exerciseCount: (w.workout_exercises ?? []).length,
        })));
      }

      // Fetch all workout dates for streak
      const { data: allWorkouts } = await supabase
        .from('workouts')
        .select('started_at')
        .eq('user_id', friendUserId)
        .order('started_at', { ascending: false });

      if (allWorkouts) {
        const dates = allWorkouts.map(w => w.started_at.split('T')[0]);
        setStreak(computeStreak(dates));
      }

      // Count workouts this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count } = await supabase
        .from('workouts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', friendUserId)
        .gte('started_at', weekAgo.toISOString());

      setWorkoutsThisWeek(count ?? 0);
    } catch (err) {
      console.error('Failed to load friend data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleRemoveFriend = async () => {
    if (!friendship) return;
    setRemoving(true);
    try {
      await removeFriend(friendship.friendshipId);
      onClose();
    } catch {
      setRemoving(false);
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const gradients = ['from-purple-500 to-blue-500', 'from-pink-500 to-orange-500', 'from-green-500 to-teal-500', 'from-yellow-500 to-red-500'];
  const gradient = gradients[(profile?.name ?? '').charCodeAt(0) % gradients.length];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatJoinDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const formatWorkoutType = (type: string) => type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-t-3xl md:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header gradient + avatar */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-br from-[#00ff00]/20 to-[#00cc00]/10" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="absolute -bottom-12 left-6">
            {profile?.avatarUrl ? (
              <div className="w-24 h-24 rounded-full border-4 border-[#0a0a0a] overflow-hidden bg-gray-800">
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-24 h-24 rounded-full border-4 border-[#0a0a0a] bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-2xl`}>
                {getInitials(profile?.name ?? '?')}
              </div>
            )}
          </div>
        </div>

        <div className="pt-16 px-6 pb-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-[#00ff00] animate-spin" />
            </div>
          )}

          {!loading && profile && (
            <>
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
                {profile.username && <p className="text-gray-400">@{profile.username}</p>}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[#1a1a1a] rounded-xl p-4 text-center">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{streak}</p>
                  <p className="text-xs text-gray-400">Day Streak</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-xl p-4 text-center">
                  <Dumbbell className="w-5 h-5 text-[#00ff00] mx-auto mb-2" />
                  <p className="text-2xl font-bold">{workoutsThisWeek}</p>
                  <p className="text-xs text-gray-400">This Week</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-xl p-4 text-center">
                  <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                  <p className="text-lg font-bold">{formatJoinDate(profile.createdAt)}</p>
                  <p className="text-xs text-gray-400">Joined</p>
                </div>
              </div>

              {/* Training info */}
              {(profile.experience || profile.split) && (
                <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-4">
                  <h3 className="font-bold text-sm mb-3">Training Info</h3>
                  <div className="space-y-2">
                    {profile.experience && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Experience</span>
                        <span className="font-semibold text-sm capitalize">{profile.experience}</span>
                      </div>
                    )}
                    {profile.split && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Split</span>
                        <span className="font-semibold text-sm">{profile.split}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Personal Records */}
              {prs.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-bold">Personal Records</h3>
                  </div>
                  <div className="space-y-2">
                    {prs.map((pr, idx) => (
                      <div key={idx} className="bg-[#1a1a1a] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{pr.exerciseName}</span>
                          <span className="text-[#00ff00] font-bold">{pr.value} {pr.unit}</span>
                        </div>
                        <p className="text-xs text-gray-500">{timeAgo(pr.achievedAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Workouts */}
              {recentWorkouts.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[#00ff00]" />
                    Recent Activity
                  </h3>
                  <div className="space-y-2">
                    {recentWorkouts.map((workout) => (
                      <div key={workout.id} className="bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{formatWorkoutType(workout.workoutType)}</p>
                          <p className="text-xs text-gray-400">{timeAgo(workout.startedAt)} &middot; {workout.exerciseCount} exercises</p>
                        </div>
                        {workout.durationMinutes && (
                          <span className="text-sm text-gray-400">{workout.durationMinutes} min</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remove friend button */}
              {friendship && (
                <button
                  onClick={handleRemoveFriend}
                  disabled={removing}
                  className="w-full bg-[#1a1a1a] text-gray-400 font-semibold py-3 rounded-xl hover:bg-[#252525] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {removing && <Loader2 className="w-4 h-4 animate-spin" />}
                  Remove Friend
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
