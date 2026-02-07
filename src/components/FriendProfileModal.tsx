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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-t-3xl md:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <div className="sticky top-0 z-10 flex justify-end p-4">
          <button onClick={onClose} className="p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Centered avatar + name */}
        <div className="flex flex-col items-center px-6 -mt-2">
          {profile?.avatarUrl ? (
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800 ring-2 ring-[#00ff00]/30">
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-2xl ring-2 ring-[#00ff00]/30`}>
              {getInitials(profile?.name ?? '?')}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-[#00ff00] animate-spin" />
            </div>
          ) : profile && (
            <>
              <h2 className="text-xl font-bold mt-3">{profile.name}</h2>
              {profile.username && <p className="text-[#00ff00]/70 text-sm">@{profile.username}</p>}

              {/* Stats row */}
              <div className="flex items-center gap-6 mt-4 mb-5">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-lg font-bold">{streak}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Streak</p>
                </div>
                <div className="w-px h-8 bg-gray-800" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Dumbbell className="w-4 h-4 text-[#00ff00]" />
                    <span className="text-lg font-bold">{workoutsThisWeek}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">This Week</p>
                </div>
                <div className="w-px h-8 bg-gray-800" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-lg font-bold">{formatJoinDate(profile.createdAt)}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Joined</p>
                </div>
              </div>
            </>
          )}
        </div>

        {!loading && profile && (
          <div className="px-5 pb-6 space-y-4">
            {/* Training info pills */}
            {(profile.experience || profile.split) && (
              <div className="flex flex-wrap gap-2">
                {profile.experience && (
                  <span className="px-3 py-1.5 bg-[#1a1a1a] border border-gray-800 rounded-full text-xs font-medium capitalize">
                    {profile.experience}
                  </span>
                )}
                {profile.split && (
                  <span className="px-3 py-1.5 bg-[#1a1a1a] border border-gray-800 rounded-full text-xs font-medium">
                    {profile.split}
                  </span>
                )}
              </div>
            )}

            {/* Personal Records */}
            {prs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <h3 className="font-semibold text-sm text-gray-300">Personal Records</h3>
                </div>
                <div className="bg-[#111] rounded-2xl border border-gray-800/50 divide-y divide-gray-800/50">
                  {prs.map((pr, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <span className="text-sm font-medium">{pr.exerciseName}</span>
                        <p className="text-[11px] text-gray-600">{timeAgo(pr.achievedAt)}</p>
                      </div>
                      <span className="text-[#00ff00] font-bold text-sm">{pr.value} {pr.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Workouts */}
            {recentWorkouts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="w-4 h-4 text-[#00ff00]" />
                  <h3 className="font-semibold text-sm text-gray-300">Recent Activity</h3>
                </div>
                <div className="bg-[#111] rounded-2xl border border-gray-800/50 divide-y divide-gray-800/50">
                  {recentWorkouts.map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{formatWorkoutType(workout.workoutType)}</p>
                        <p className="text-[11px] text-gray-600">{timeAgo(workout.startedAt)}{workout.exerciseCount > 0 ? ` · ${workout.exerciseCount} exercises` : ''}</p>
                      </div>
                      {workout.durationMinutes && (
                        <span className="text-xs text-gray-500 bg-[#1a1a1a] px-2 py-1 rounded-lg">{workout.durationMinutes}m</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state when no PRs or workouts */}
            {prs.length === 0 && recentWorkouts.length === 0 && (
              <div className="text-center py-6">
                <Dumbbell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No workout data yet</p>
              </div>
            )}

            {/* Remove friend */}
            {friendship && (
              <button
                onClick={handleRemoveFriend}
                disabled={removing}
                className="w-full text-red-500/60 text-xs font-medium py-3 hover:text-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {removing && <Loader2 className="w-3 h-3 animate-spin" />}
                Remove Friend
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
