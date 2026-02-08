import { useState, useEffect } from 'react';
import { X, Dumbbell, Trophy, Flame, Calendar, Loader2, Lock, Clock, ChevronDown, ChevronUp, Target, Zap } from 'lucide-react';
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
  goal: string | null;
  gym: string | null;
  createdAt: string;
}

interface FriendPR {
  exerciseName: string;
  value: number;
  unit: string;
  achievedAt: string;
}

interface FriendWorkout {
  id: string;
  workoutType: string;
  startedAt: string;
  durationMinutes: number | null;
  totalVolume: number;
  exercises: {
    name: string;
    sets: { setNumber: number; weightLbs: number | null; reps: number | null }[];
  }[];
}

interface PrivacyFlags {
  sharePrs: boolean;
  shareWorkoutHistory: boolean;
  shareStreak: boolean;
}

export function FriendProfileModal({ friendUserId, onClose }: FriendProfileModalProps) {
  const { friends, removeFriend } = useFriendships();
  const [profile, setProfile] = useState<FriendProfile | null>(null);
  const [privacy, setPrivacy] = useState<PrivacyFlags>({ sharePrs: true, shareWorkoutHistory: true, shareStreak: true });
  const [big3, setBig3] = useState<{ bench: number; squat: number; deadlift: number }>({ bench: 0, squat: 0, deadlift: 0 });
  const [prs, setPrs] = useState<FriendPR[]>([]);
  const [workouts, setWorkouts] = useState<FriendWorkout[]>([]);
  const [streak, setStreak] = useState(0);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [volume30d, setVolume30d] = useState(0);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  const friendship = friends.find(f => f.userId === friendUserId);

  useEffect(() => {
    loadFriendData();
  }, [friendUserId]);

  async function loadFriendData() {
    setLoading(true);
    try {
      // Fetch profile + privacy in parallel
      const [{ data: profileData }, { data: privacyData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('name, username, avatar_url, experience, split, goal, gym, created_at')
          .eq('id', friendUserId)
          .single(),
        supabase
          .from('privacy_settings')
          .select('share_prs, share_workout_history, share_streak')
          .eq('user_id', friendUserId)
          .single(),
      ]);

      if (profileData) {
        setProfile({
          name: profileData.name,
          username: profileData.username,
          avatarUrl: profileData.avatar_url,
          experience: profileData.experience,
          split: profileData.split,
          goal: profileData.goal,
          gym: profileData.gym,
          createdAt: profileData.created_at,
        });
      }

      const flags: PrivacyFlags = {
        sharePrs: privacyData?.share_prs ?? true,
        shareWorkoutHistory: privacyData?.share_workout_history ?? true,
        shareStreak: privacyData?.share_streak ?? true,
      };
      setPrivacy(flags);

      // Now fetch data based on privacy — all in parallel
      const promises: Promise<void>[] = [];

      // PRs (if allowed)
      if (flags.sharePrs) {
        promises.push(
          (async () => {
            const { data: prData } = await supabase
              .from('personal_records')
              .select('exercise_name, value, unit, achieved_at')
              .eq('user_id', friendUserId)
              .eq('pr_type', 'weight')
              .order('value', { ascending: false })
              .limit(15);

            if (prData) {
              // Extract Big 3
              const b3 = { bench: 0, squat: 0, deadlift: 0 };
              const otherPrs: FriendPR[] = [];
              for (const pr of prData) {
                if (pr.exercise_name === 'Bench Press') b3.bench = pr.value;
                else if (pr.exercise_name === 'Squat') b3.squat = pr.value;
                else if (pr.exercise_name === 'Deadlift') b3.deadlift = pr.value;
                else otherPrs.push({ exerciseName: pr.exercise_name, value: pr.value, unit: pr.unit, achievedAt: pr.achieved_at });
              }
              setBig3(b3);
              setPrs(otherPrs.slice(0, 8));
            }
          })()
        );
      }

      // Workouts (if allowed)
      if (flags.shareWorkoutHistory) {
        promises.push(
          (async () => {
            // Recent 10 workouts with exercises + sets
            const { data: workoutData } = await supabase
              .from('workouts')
              .select(`
                id, workout_type, started_at, duration_minutes,
                workout_exercises (
                  exercise_name, sort_order,
                  workout_sets ( set_number, weight_lbs, reps )
                )
              `)
              .eq('user_id', friendUserId)
              .order('started_at', { ascending: false })
              .limit(10);

            if (workoutData) {
              const mapped: FriendWorkout[] = workoutData.map((w: any) => {
                const exercises = ((w.workout_exercises ?? []) as any[])
                  .sort((a: any, b: any) => a.sort_order - b.sort_order)
                  .map((ex: any) => ({
                    name: ex.exercise_name,
                    sets: ((ex.workout_sets ?? []) as any[])
                      .sort((a: any, b: any) => a.set_number - b.set_number)
                      .map((s: any) => ({
                        setNumber: s.set_number,
                        weightLbs: s.weight_lbs,
                        reps: s.reps,
                      })),
                  }));

                const totalVolume = exercises.reduce((sum: number, ex: any) =>
                  sum + ex.sets.reduce((s: number, set: any) =>
                    s + ((set.weightLbs || 0) * (set.reps || 0)), 0), 0);

                return {
                  id: w.id,
                  workoutType: w.workout_type,
                  startedAt: w.started_at,
                  durationMinutes: w.duration_minutes,
                  totalVolume,
                  exercises,
                };
              });
              setWorkouts(mapped);
            }

            // Total workout count
            const { count } = await supabase
              .from('workouts')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', friendUserId);
            setTotalWorkouts(count ?? 0);

            // 30-day volume
            const thirtyAgo = new Date();
            thirtyAgo.setDate(thirtyAgo.getDate() - 30);
            const { data: vol30Data } = await supabase
              .from('workouts')
              .select(`
                workout_exercises (
                  workout_sets ( weight_lbs, reps )
                )
              `)
              .eq('user_id', friendUserId)
              .gte('started_at', thirtyAgo.toISOString());

            if (vol30Data) {
              let vol = 0;
              for (const w of vol30Data as any[]) {
                for (const ex of (w.workout_exercises ?? []) as any[]) {
                  for (const s of (ex.workout_sets ?? []) as any[]) {
                    vol += (s.weight_lbs || 0) * (s.reps || 0);
                  }
                }
              }
              setVolume30d(vol);
            }
          })()
        );
      }

      // Streak (if allowed)
      if (flags.shareStreak) {
        promises.push(
          (async () => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const [{ data: allWorkouts }, { count }] = await Promise.all([
              supabase
                .from('workouts')
                .select('started_at')
                .eq('user_id', friendUserId)
                .order('started_at', { ascending: false }),
              supabase
                .from('workouts')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', friendUserId)
                .gte('started_at', weekAgo.toISOString()),
            ]);

            if (allWorkouts) {
              const dates = allWorkouts.map(w => w.started_at.split('T')[0]);
              setStreak(computeStreak(dates));
            }
            setWorkoutsThisWeek(count ?? 0);
          })()
        );
      }

      await Promise.all(promises);
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
  const gradients = ['from-purple-500 to-blue-500', 'from-pink-500 to-orange-500', 'from-green-500 to-teal-500', 'from-yellow-500 to-red-500', 'from-indigo-500 to-purple-500'];
  const gradient = gradients[(profile?.name ?? '').charCodeAt(0) % gradients.length];

  const formatWorkoutType = (type: string) => type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    return vol.toLocaleString();
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatJoinDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const hasBig3 = big3.bench > 0 || big3.squat > 0 || big3.deadlift > 0;
  const hasPrivateData = !privacy.sharePrs || !privacy.shareWorkoutHistory || !privacy.shareStreak;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-black border border-gray-800/50 rounded-t-3xl md:rounded-3xl w-full max-w-md max-h-[92vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-[#00ff00] animate-spin" />
          </div>
        ) : profile && (
          <>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Hero Header */}
              <div className="relative pt-5 pb-6 px-6">
                {/* Green glow background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 bg-[#00ff00]/[0.04] rounded-full blur-3xl pointer-events-none" />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>

                {/* Avatar */}
                <div className="flex flex-col items-center relative z-[1]">
                  {profile.avatarUrl ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-[3px] ring-[#00ff00]/30 shadow-[0_0_30px_rgba(0,255,0,0.12)]">
                      <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-3xl ring-[3px] ring-[#00ff00]/30 shadow-[0_0_30px_rgba(0,255,0,0.12)]`}>
                      {getInitials(profile.name)}
                    </div>
                  )}

                  <h2 className="text-2xl font-bold mt-4 tracking-tight">{profile.name}</h2>
                  {profile.username && (
                    <p className="text-[#00ff00]/70 text-sm font-medium">@{profile.username}</p>
                  )}

                  {/* Training pills */}
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                    {profile.experience && (
                      <span className="px-2.5 py-1 bg-[#00ff00]/10 border border-[#00ff00]/20 rounded-full text-[11px] font-semibold text-[#00ff00]/80 capitalize">
                        {profile.experience}
                      </span>
                    )}
                    {profile.split && (
                      <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[11px] font-semibold text-blue-400/80">
                        {profile.split}
                      </span>
                    )}
                    {profile.goal && (
                      <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[11px] font-semibold text-purple-400/80 capitalize">
                        {profile.goal}
                      </span>
                    )}
                    {profile.gym && (
                      <span className="px-2.5 py-1 bg-gray-800/50 border border-gray-700/50 rounded-full text-[11px] font-medium text-gray-400">
                        {profile.gym}
                      </span>
                    )}
                  </div>

                  {/* Member since */}
                  <p className="text-[11px] text-gray-600 mt-2">
                    Member since {formatJoinDate(profile.createdAt)}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-6 space-y-4">
                {/* Stats Dashboard */}
                <div className="grid grid-cols-4 gap-2">
                  {/* Streak */}
                  <div className="bg-[#111] rounded-2xl p-3 border border-gray-800/50 flex flex-col items-center">
                    {privacy.shareStreak ? (
                      <>
                        <div className="p-1.5 bg-orange-500/10 rounded-lg mb-1.5">
                          <Flame className="w-3.5 h-3.5 text-orange-400" />
                        </div>
                        <span className="text-lg font-bold leading-none">{streak}</span>
                        <span className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">Streak</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-gray-600 mb-1.5" />
                        <span className="text-[9px] text-gray-600 uppercase tracking-wider">Private</span>
                      </>
                    )}
                  </div>

                  {/* This Week */}
                  <div className="bg-[#111] rounded-2xl p-3 border border-gray-800/50 flex flex-col items-center">
                    {privacy.shareStreak ? (
                      <>
                        <div className="p-1.5 bg-[#00ff00]/10 rounded-lg mb-1.5">
                          <Zap className="w-3.5 h-3.5 text-[#00ff00]" />
                        </div>
                        <span className="text-lg font-bold leading-none">{workoutsThisWeek}</span>
                        <span className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">This Wk</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-gray-600 mb-1.5" />
                        <span className="text-[9px] text-gray-600 uppercase tracking-wider">Private</span>
                      </>
                    )}
                  </div>

                  {/* Total Workouts */}
                  <div className="bg-[#111] rounded-2xl p-3 border border-gray-800/50 flex flex-col items-center">
                    {privacy.shareWorkoutHistory ? (
                      <>
                        <div className="p-1.5 bg-blue-500/10 rounded-lg mb-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="text-lg font-bold leading-none">{totalWorkouts}</span>
                        <span className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">Total</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-gray-600 mb-1.5" />
                        <span className="text-[9px] text-gray-600 uppercase tracking-wider">Private</span>
                      </>
                    )}
                  </div>

                  {/* 30d Volume */}
                  <div className="bg-[#111] rounded-2xl p-3 border border-gray-800/50 flex flex-col items-center">
                    {privacy.shareWorkoutHistory ? (
                      <>
                        <div className="p-1.5 bg-yellow-500/10 rounded-lg mb-1.5">
                          <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                        </div>
                        <span className="text-lg font-bold leading-none">{formatVolume(volume30d)}</span>
                        <span className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">30d lbs</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-gray-600 mb-1.5" />
                        <span className="text-[9px] text-gray-600 uppercase tracking-wider">Private</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Big 3 Showcase */}
                {privacy.sharePrs && hasBig3 && (
                  <div className="bg-gradient-to-r from-[#00ff00]/[0.07] to-[#00ff00]/[0.03] border border-[#00ff00]/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-[#00ff00]" />
                      <h3 className="font-bold text-sm">Big 3 Lifts</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Bench</p>
                        <p className="text-xl font-bold text-[#00ff00]">{big3.bench || '—'}</p>
                        {big3.bench > 0 && <p className="text-[10px] text-gray-600">lbs</p>}
                      </div>
                      <div className="text-center border-x border-[#00ff00]/10">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Squat</p>
                        <p className="text-xl font-bold text-[#00ff00]">{big3.squat || '—'}</p>
                        {big3.squat > 0 && <p className="text-[10px] text-gray-600">lbs</p>}
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Deadlift</p>
                        <p className="text-xl font-bold text-[#00ff00]">{big3.deadlift || '—'}</p>
                        {big3.deadlift > 0 && <p className="text-[10px] text-gray-600">lbs</p>}
                      </div>
                    </div>
                    {(big3.bench + big3.squat + big3.deadlift) > 0 && (
                      <div className="pt-3 border-t border-[#00ff00]/10 flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-medium">Total</span>
                        <span className="text-lg font-bold text-[#00ff00]">{(big3.bench + big3.squat + big3.deadlift).toLocaleString()} lbs</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Other Personal Records */}
                {privacy.sharePrs && prs.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <h3 className="font-bold text-sm text-gray-300">Personal Records</h3>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-2xl border border-gray-800/50 divide-y divide-gray-800/30">
                      {prs.map((pr, idx) => (
                        <div key={idx} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                              <Dumbbell className="w-3 h-3 text-yellow-500/70" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{pr.exerciseName}</p>
                              <p className="text-[10px] text-gray-600">{timeAgo(pr.achievedAt)}</p>
                            </div>
                          </div>
                          <span className="text-[#00ff00] font-bold text-sm">{pr.value} {pr.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Workouts */}
                {privacy.shareWorkoutHistory && (
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Dumbbell className="w-4 h-4 text-[#00ff00]" />
                      <h3 className="font-bold text-sm text-gray-300">Recent Workouts</h3>
                    </div>

                    {workouts.length === 0 ? (
                      <div className="bg-[#0a0a0a] rounded-2xl border border-gray-800/50 py-8 text-center">
                        <Dumbbell className="w-8 h-8 text-gray-800 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">No workouts logged yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {workouts.map((workout) => {
                          const isExpanded = expandedWorkoutId === workout.id;
                          return (
                            <div
                              key={workout.id}
                              className={`bg-[#0a0a0a] rounded-2xl border transition-colors ${
                                isExpanded ? 'border-[#00ff00]/20' : 'border-gray-800/50'
                              }`}
                            >
                              {/* Collapsed header — always visible */}
                              <button
                                onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                                className="w-full text-left px-4 py-3 flex items-center gap-3"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 bg-[#00ff00]/10 text-[#00ff00] text-[10px] font-bold rounded-md">
                                      {formatWorkoutType(workout.workoutType)}
                                    </span>
                                    <span className="text-[11px] text-gray-600">{timeAgo(workout.startedAt)}</span>
                                    {workout.durationMinutes && (
                                      <span className="flex items-center gap-0.5 text-[11px] text-gray-600">
                                        <Clock className="w-2.5 h-2.5" />
                                        {workout.durationMinutes}m
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span><span className="font-semibold text-gray-300">{workout.exercises.length}</span> exercises</span>
                                    {workout.totalVolume > 0 && (
                                      <span><span className="font-semibold text-gray-300">{formatVolume(workout.totalVolume)}</span> lbs</span>
                                    )}
                                  </div>
                                </div>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                )}
                              </button>

                              {/* Expanded exercises */}
                              {isExpanded && (
                                <div className="px-4 pb-4 pt-1 border-t border-gray-800/30 space-y-3">
                                  {workout.exercises.map((exercise, exIdx) => {
                                    const exVolume = exercise.sets.reduce((sum, s) =>
                                      sum + ((s.weightLbs || 0) * (s.reps || 0)), 0);

                                    return (
                                      <div key={exIdx}>
                                        <div className="flex items-center justify-between mb-1.5">
                                          <div className="flex items-center gap-2">
                                            <Dumbbell className="w-3 h-3 text-[#00ff00]/60" />
                                            <span className="text-sm font-semibold">{exercise.name}</span>
                                          </div>
                                          {exVolume > 0 && (
                                            <span className="text-[10px] text-[#00ff00]/60 font-medium">{formatVolume(exVolume)} lbs</span>
                                          )}
                                        </div>
                                        <div className="space-y-1 ml-5">
                                          {exercise.sets.map((set, setIdx) => (
                                            <div key={setIdx} className="flex items-center justify-between text-xs bg-black/40 rounded-lg px-3 py-1.5">
                                              <span className="text-gray-600 font-medium">Set {set.setNumber}</span>
                                              <span className="text-gray-300">
                                                {set.weightLbs && set.weightLbs > 0
                                                  ? <><span className="font-semibold">{set.weightLbs}</span> lbs <span className="text-gray-600">×</span> <span className="font-semibold">{set.reps ?? '—'}</span></>
                                                  : <><span className="font-semibold">{set.reps ?? '—'}</span> reps</>
                                                }
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Privacy notice */}
                {hasPrivateData && (
                  <div className="flex items-center justify-center gap-1.5 py-2">
                    <Lock className="w-3 h-3 text-gray-700" />
                    <span className="text-[11px] text-gray-700">Some data is private</span>
                  </div>
                )}

                {/* Empty state when everything is private */}
                {!privacy.sharePrs && !privacy.shareWorkoutHistory && !privacy.shareStreak && (
                  <div className="text-center py-6">
                    <Lock className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">This user's data is private</p>
                  </div>
                )}

                {/* Remove friend */}
                {friendship && (
                  <button
                    onClick={handleRemoveFriend}
                    disabled={removing}
                    className="w-full text-red-500/50 text-xs font-medium py-3 hover:text-red-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {removing && <Loader2 className="w-3 h-3 animate-spin" />}
                    Remove Friend
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
