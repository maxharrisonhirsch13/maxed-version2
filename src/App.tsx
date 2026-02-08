import { useState, useEffect, useRef } from 'react';
import { Home, BarChart3, Users, User, Settings, Dumbbell, Play, RefreshCw, Heart, Plus, Loader2, Activity, X, Clock, Lock } from 'lucide-react';
import { ProgressPage } from './components/ProgressPage';
import { CommunityPage } from './components/CommunityPage';
import { WorkoutStartPage } from './components/WorkoutStartPage';
import { LoginScreen } from './components/LoginScreen';
import { ProfilePage } from './components/ProfilePage';
import { OnboardingPage } from './components/OnboardingPageNew';
import { IntegrationsPage } from './components/IntegrationsPage';
import { WorkoutSwitchPage } from './components/WorkoutSwitchPage';
import { PreWorkoutModal } from './components/PreWorkoutModal';
import { CardioSetupPage } from './components/CardioSetupPage';
import { CardioSessionPage } from './components/CardioSessionPage';
import { SecondSessionPage } from './components/SecondSessionPage';
import { ReadinessModal } from './components/ReadinessModal';
import { useAuth } from './context/AuthContext';
import { useWorkoutHistory } from './hooks/useWorkoutHistory';
import { useWhoopData } from './hooks/useWhoopData';
import { useWearableData } from './hooks/useWearableData';
import { useAICoach } from './hooks/useAICoach';

// Compute scheduled workout from user's split and day of week
function getScheduledWorkout(split: string | undefined, customSplit?: { day: number; muscles: string[] }[]) {
  const dayIndex = new Date().getDay(); // 0=Sun ... 6=Sat
  if (split === 'ppl') {
    const cycle = ['Push', 'Pull', 'Legs'];
    const name = dayIndex === 0 ? 'Rest' : cycle[(dayIndex - 1) % 3];
    return { name, splitName: 'Push/Pull/Legs' };
  }
  if (split === 'arnold') {
    const cycle = ['Chest & Back', 'Shoulders & Arms', 'Legs'];
    const name = dayIndex === 0 ? 'Rest' : cycle[(dayIndex - 1) % 3];
    return { name, splitName: "Arnold's Split" };
  }
  if (split === 'bro') {
    const days = ['Rest', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Rest'];
    return { name: days[dayIndex], splitName: 'Bro Split' };
  }
  if (split === 'upper-lower') {
    if (dayIndex === 0) return { name: 'Rest', splitName: 'Upper/Lower' };
    return { name: dayIndex % 2 === 1 ? 'Upper Body' : 'Lower Body', splitName: 'Upper/Lower' };
  }
  if (split === 'full-body') {
    return { name: dayIndex === 0 || dayIndex === 6 ? 'Rest' : 'Full Body', splitName: 'Full Body' };
  }
  if (split === 'custom' && customSplit && customSplit.length > 0) {
    if (dayIndex === 0) return { name: 'Rest', splitName: 'Custom Split' };
    // Cycle through custom days (Mon=1 maps to day 0, etc.)
    const customDayIndex = (dayIndex - 1) % customSplit.length;
    const todayMuscles = customSplit[customDayIndex]?.muscles;
    const name = todayMuscles && todayMuscles.length > 0 ? todayMuscles.join(' & ') : 'Rest';
    return { name, splitName: 'Custom Split' };
  }
  return { name: 'Full Body', splitName: 'Training' };
}

export default function App() {
  const { session, profile, loading, authError, refreshProfile } = useAuth();
  const { workouts: recentWorkouts, refetch: refetchWorkouts } = useWorkoutHistory({ limit: 10 });
  const { data: whoopData, loading: whoopLoading, error: whoopError } = useWhoopData();
  const { data: wearableData } = useWearableData();
  const { readiness, readinessLoading, fetchReadiness } = useAICoach();
  const aiReadinessFetched = useRef(false);

  // Fetch AI readiness on mount (uses WHOOP + workout history, works without WHOOP too)
  useEffect(() => {
    if (aiReadinessFetched.current || whoopLoading) return;
    // Wait for WHOOP to finish loading, then fire AI readiness
    aiReadinessFetched.current = true;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentWorkoutPayload = recentWorkouts
      .filter(w => new Date(w.startedAt) >= sevenDaysAgo)
      .map(w => ({
        date: w.startedAt.split('T')[0],
        type: w.workoutType,
        durationMinutes: w.durationMinutes || 0,
      }));

    const wearablePayload = whoopData?.connected ? {
      recovery: whoopData.recovery,
      sleep: whoopData.sleep ? {
        qualityDuration: whoopData.sleep.qualityDuration,
        deepSleepDuration: whoopData.sleep.deepSleepDuration,
        sleepScore: whoopData.sleep.sleepScore,
      } : null,
      strain: whoopData.strain ? { score: whoopData.strain.score, kilojoules: whoopData.strain.kilojoules } : null,
    } : wearableData ? {
      recovery: wearableData.recoveryScore != null ? { score: wearableData.recoveryScore, restingHeartRate: wearableData.restingHeartRate, hrv: wearableData.hrv } : null,
      sleep: wearableData.sleepScore != null ? { sleepScore: wearableData.sleepScore, qualityDuration: wearableData.sleepDurationMs, deepSleepDuration: wearableData.deepSleepMs } : null,
      strain: wearableData.strainScore != null ? { score: wearableData.strainScore, kilojoules: null } : null,
    } : { recovery: null, sleep: null, strain: null };

    fetchReadiness({
      whoopData: wearablePayload,
      recentWorkouts: recentWorkoutPayload,
      userProfile: {
        experience: profile?.experience || null,
        goal: profile?.goal || null,
      },
    });
  }, [whoopLoading, whoopData, wearableData, recentWorkouts.length]);

  // Readiness: prefer AI score → raw WHOOP score → wearable score → null
  const rawReadiness = readiness?.readinessScore ?? whoopData?.recovery?.score ?? wearableData?.recoveryScore ?? null;
  const readinessScore = rawReadiness != null ? Math.max(rawReadiness, 55) : null;
  const isAIPowered = readiness?.readinessScore != null;
  const readinessColor = readinessScore != null
    ? readinessScore >= 67 ? '#00ff00' : readinessScore >= 34 ? '#facc15' : '#ef4444'
    : '#6b7280';
  const readinessLabel = readinessLoading || whoopLoading
    ? 'Analyzing...'
    : whoopError
      ? 'Sync error'
      : readinessScore != null
        ? readinessScore >= 67 ? 'Optimal' : readinessScore >= 34 ? 'Moderate' : 'Low'
        : 'Calculating...';
  const readinessDetail = readinessLoading || whoopLoading
    ? 'Running AI analysis on your data...'
    : whoopError
      ? 'Check console for details'
      : isAIPowered && readiness?.recommendation
        ? readiness.recommendation
        : readinessScore != null
          ? readinessScore >= 67 ? 'Peak performance expected' : readinessScore >= 34 ? 'Consider lighter intensity' : 'Active recovery recommended'
          : 'AI readiness coming soon';

  // Readiness gating: require wearable connection OR 4+ workout days in last 14 days
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const workoutDaysLast2Weeks = new Set(
    recentWorkouts
      .filter(w => new Date(w.startedAt) >= twoWeeksAgo)
      .map(w => w.startedAt.split('T')[0])
  ).size;
  const hasWearable = whoopData?.connected || wearableData != null;
  const readinessAvailable = hasWearable || workoutDaysLast2Weeks >= 4;

  const [currentPage, setCurrentPage] = useState<'today' | 'progress' | 'community' | 'profile'>('today');
  const [showPreWorkout, setShowPreWorkout] = useState(false);
  const [showWorkoutStart, setShowWorkoutStart] = useState(false);
  const [activeMuscleGroup, setActiveMuscleGroup] = useState('');
  const [trainingLocation, setTrainingLocation] = useState('');
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showWorkoutSwitch, setShowWorkoutSwitch] = useState(false);
  const [showCardioSetup, setShowCardioSetup] = useState(false);
  const [showSecondSession, setShowSecondSession] = useState(false);
  const [showCardioSession, setShowCardioSession] = useState(false);
  const [cardioGoal, setCardioGoal] = useState('');
  const [cardioDetails, setCardioDetails] = useState<any>(null);
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

  // Compute scheduled workout from user's split
  const scheduledWorkout = getScheduledWorkout(profile?.split || undefined, profile?.customSplit);
  const currentMuscleGroup = activeMuscleGroup || scheduledWorkout.name;
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Filter workouts to this week (Monday through today)
  const startOfWeek = new Date(today);
  const dayOfWeek = startOfWeek.getDay(); // 0=Sun, 1=Mon ...
  startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Go back to Monday
  startOfWeek.setHours(0, 0, 0, 0);
  const thisWeekWorkouts = recentWorkouts.filter(w => new Date(w.startedAt) >= startOfWeek);

  // Loading state while auth initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00ff00] animate-spin" />
      </div>
    );
  }

  // Not logged in → show login screen
  if (!session) {
    return <LoginScreen />;
  }

  // Session exists but profile failed to load
  if (authError && !profile) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-5 max-w-sm text-center">
          <p className="text-red-400 text-sm mb-4">{authError}</p>
          <button onClick={() => window.location.reload()} className="bg-[#00ff00] text-black font-bold py-3 px-6 rounded-xl text-sm hover:bg-[#00dd00] transition-all">
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Logged in but hasn't completed onboarding
  if (!profile?.onboardingCompleted) {
    return <OnboardingPage onComplete={async () => { await refreshProfile(); }} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-[#0a0a0a] lg:border-r lg:border-gray-800/50 lg:z-40">
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00ff00] rounded-xl flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">MAXED</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { key: 'today', icon: Home, label: 'Today' },
            { key: 'progress', icon: BarChart3, label: 'Progress' },
            { key: 'community', icon: Users, label: 'Community' },
            { key: 'profile', icon: User, label: 'Profile' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setCurrentPage(key as 'today' | 'progress' | 'community' | 'profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                currentPage === key
                  ? 'bg-[#00ff00]/10 text-[#00ff00]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800/50">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{profile?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.experience || 'Athlete'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content — shifts right on desktop */}
      <div className="pb-24 lg:pb-8 lg:pl-64">
      {/* Render current page */}
      {currentPage === 'today' && (
        <>
          {/* Header */}
          <header className="px-4 lg:px-10 pt-safe pt-8 lg:pt-10 pb-3 lg:pb-6">
            <div className="flex justify-between items-start mb-1">
              <div>
                <p className="text-xs lg:text-sm text-gray-400 mb-0.5 lg:mb-1">{dateStr}</p>
                <h1 className="text-xl lg:text-3xl font-bold">Hey, {profile?.name?.split(' ')[0] || 'there'}</h1>
              </div>
              <button className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors lg:hidden">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="px-4 lg:px-10 lg:max-w-6xl space-y-3 lg:space-y-6 pb-8">
            {/* Dashboard Grid — side by side on desktop */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-3 lg:space-y-0">
            {/* Today's Readiness Card */}
            {readinessAvailable ? (
            <button
              onClick={() => setShowReadinessModal(true)}
              className="w-full bg-[#1a1a1a] rounded-2xl p-4 lg:p-6 relative overflow-hidden hover:bg-[#1f1f1f] transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <p className="text-gray-400 text-xs">Today's Readiness</p>
                  {isAIPowered && <span className="text-[9px] font-bold bg-[#00ff00]/15 text-[#00ff00] px-1.5 py-0.5 rounded">AI</span>}
                </div>
                <span className="text-[10px] font-semibold" style={{ color: readinessColor }}>Learn More →</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                {readinessLoading || whoopLoading ? (
                  <Loader2 className="w-8 h-8 text-[#00ff00] animate-spin" />
                ) : (
                  <>
                    <span className="text-4xl lg:text-5xl font-bold">{readinessScore ?? '—'}</span>
                    {readinessScore != null && <span className="text-lg text-gray-500">/ 100</span>}
                  </>
                )}
              </div>
              <p className="font-semibold text-sm mb-0.5" style={{ color: readinessColor }}>{readinessLabel}</p>
              <p className="text-gray-400 text-xs mb-3">{readinessDetail}</p>
              {isAIPowered && readiness?.intensityRecommendation && (
                <p className="text-[10px] text-gray-500 mb-2">Recommended intensity: <span className="text-white font-semibold">{readiness.intensityRecommendation}</span></p>
              )}
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                <div className="h-full" style={{ width: `${readinessScore ?? 0}%`, backgroundColor: readinessColor }}></div>
              </div>
            </button>
            ) : (
            <div className="w-full bg-[#1a1a1a] rounded-2xl p-4 lg:p-6 relative overflow-hidden">
              <div className="flex items-center gap-1.5 mb-3">
                <Lock className="w-4 h-4 text-gray-500" />
                <p className="text-gray-400 text-xs font-semibold">Readiness Score</p>
              </div>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-4xl lg:text-5xl font-bold text-gray-700">--</span>
                <span className="text-lg text-gray-700">/ 100</span>
              </div>
              <p className="text-gray-400 text-xs font-semibold mb-2">Multi-Factor Algorithm</p>
              <div className="space-y-1.5 mb-3">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] text-[#00ff00] font-bold mt-0.5 shrink-0">40%</span>
                  <p className="text-[11px] text-gray-500 leading-snug"><span className="text-gray-400 font-medium">Recovery Data</span> — HRV, resting heart rate, and wearable recovery metrics</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[10px] text-[#00ff00] font-bold mt-0.5 shrink-0">25%</span>
                  <p className="text-[11px] text-gray-500 leading-snug"><span className="text-gray-400 font-medium">Sleep Quality</span> — Duration, deep sleep stages, and sleep efficiency</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[10px] text-[#00ff00] font-bold mt-0.5 shrink-0">20%</span>
                  <p className="text-[11px] text-gray-500 leading-snug"><span className="text-gray-400 font-medium">HRV Analysis</span> — Autonomic nervous system balance</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[10px] text-[#00ff00] font-bold mt-0.5 shrink-0">15%</span>
                  <p className="text-[11px] text-gray-500 leading-snug"><span className="text-gray-400 font-medium">Training Load</span> — Volume, frequency, and muscle group recovery</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-600 leading-relaxed mb-1">This score directly adjusts your AI workout recommendations — reducing intensity on low-recovery days and pushing progressive overload when you're primed for peak performance.</p>
              <p className="text-[10px] text-gray-500 font-medium">Connect a wearable or log 2 weeks of workouts to activate.</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800" />
            </div>
            )}

            {/* Scheduled Workout Card */}
            <div className="bg-[#1a1a1a] rounded-2xl p-4 lg:p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${
                    currentMuscleGroup === 'Rest' ? 'bg-gray-600 text-white' : 'bg-[#00ff00] text-black'
                  }`}>
                    {currentMuscleGroup === 'Rest' ? 'REST DAY' : 'SCHEDULED'}
                  </span>
                  <h2 className="text-lg font-bold mb-0.5">{currentMuscleGroup}</h2>
                  <p className="text-gray-400 text-sm">{scheduledWorkout.splitName}</p>
                </div>
                <div className="p-2 bg-[#252525] rounded-xl">
                  <Dumbbell className="w-5 h-5 text-[#00ff00]" />
                </div>
              </div>

              {currentMuscleGroup !== 'Rest' ? (
                <button className="w-full bg-white text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                  onClick={() => setShowPreWorkout(true)}
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start Workout
                </button>
              ) : (
                <p className="text-gray-500 text-sm text-center py-2">Recovery day — use Switch to train anyway</p>
              )}
            </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-3 gap-2 lg:gap-4">
              <button className="bg-[#1a1a1a] rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-[#252525] transition-colors min-h-[100px]"
                onClick={() => setShowWorkoutSwitch(true)}
              >
                <div className="p-2 bg-[#252525] rounded-lg">
                  <RefreshCw className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-xs">Switch</p>
                  <p className="text-[10px] text-gray-400">Different day</p>
                </div>
              </button>

              <button className="bg-[#1a1a1a] rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-[#252525] transition-colors min-h-[100px]"
                onClick={() => setShowCardioSetup(true)}
              >
                <div className="p-2 bg-[#252525] rounded-lg">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-xs text-red-400">Cardio</p>
                  <p className="text-[10px] text-gray-400">Start session</p>
                </div>
              </button>

              <button className="bg-[#1a1a1a] rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-[#252525] transition-colors min-h-[100px]"
                onClick={() => setShowSecondSession(true)}
              >
                <div className="p-2 bg-[#252525] rounded-lg">
                  <Plus className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-xs">Add</p>
                  <p className="text-[10px] text-gray-400">2nd session</p>
                </div>
              </button>
            </div>

            {/* This Week Section */}
            <div className="pt-2 lg:pt-4">
              <div className="flex justify-between items-center mb-3 lg:mb-4">
                <h3 className="text-base lg:text-lg font-bold">This Week</h3>
                <p className="text-gray-400 text-xs">{thisWeekWorkouts.length} workout{thisWeekWorkouts.length !== 1 ? 's' : ''}</p>
              </div>

              {thisWeekWorkouts.length === 0 ? (
                <div className="bg-[#1a1a1a] rounded-xl p-6 flex flex-col items-center justify-center">
                  <Dumbbell className="w-8 h-8 text-gray-600 mb-2" />
                  <p className="text-gray-500 text-sm">No workouts yet this week</p>
                  <p className="text-gray-600 text-xs mt-1">Start your first workout above!</p>
                </div>
              ) : (
                <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                  {thisWeekWorkouts.map((workout) => {
                    const isCardio = workout.workoutType.toLowerCase().includes('cardio');
                    return (
                      <button
                        key={workout.id}
                        onClick={() => setSelectedWorkout({
                          date: new Date(workout.startedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                          startTime: new Date(workout.startedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                          duration: workout.durationMinutes || 0,
                          workoutType: workout.workoutType,
                          exercises: workout.exercises.map(ex => {
                            const hasCardioData = ex.sets.some(s => s.durationMinutes || s.distanceMiles || s.caloriesBurned);
                            if (hasCardioData) {
                              const s = ex.sets[0];
                              return {
                                name: ex.exerciseName,
                                sets: [],
                                cardioData: {
                                  duration: s?.durationMinutes || workout.durationMinutes || 0,
                                  distance: s?.distanceMiles || undefined,
                                  speed: s?.speedMph || undefined,
                                  incline: s?.inclinePercent || undefined,
                                  calories: s?.caloriesBurned || undefined,
                                },
                              };
                            }
                            return {
                              name: ex.exerciseName,
                              sets: ex.sets.map(s => ({ weight: s.weightLbs || 0, reps: s.reps || 0 })),
                            };
                          }),
                        })}
                        className="w-full bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between hover:bg-[#252525] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCardio ? 'bg-red-500' : 'bg-[#00ff00]'}`}>
                            {isCardio ? <Activity className="w-5 h-5 text-white" /> : <Dumbbell className="w-5 h-5 text-black" />}
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-sm">{workout.workoutType}</p>
                            <p className="text-gray-400 text-xs">
                              {new Date(workout.startedAt).toLocaleDateString('en-US', { weekday: 'long' })}
                              {workout.durationMinutes ? ` • ${workout.durationMinutes} min` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="text-[#00ff00] text-xs font-semibold">&#10003;</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {currentPage === 'progress' && <ProgressPage />}

      {currentPage === 'community' && <CommunityPage />}

      {currentPage === 'profile' && <ProfilePage userData={profile} onIntegrationsClick={() => setShowIntegrations(true)} />}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-4 py-3 safe-area-inset-bottom lg:hidden">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button 
            onClick={() => setCurrentPage('today')}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              currentPage === 'today' ? 'text-white' : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Today</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('progress')}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              currentPage === 'progress' ? 'text-white' : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px]">Progress</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('community')}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              currentPage === 'community' ? 'text-white' : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Community</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('profile')}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              currentPage === 'profile' ? 'text-white' : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Profile</span>
          </button>
        </div>
      </nav>

      {/* Pre-Workout Location Prompt */}
      {showPreWorkout && (
        <PreWorkoutModal
          onClose={() => setShowPreWorkout(false)}
          onStart={(location) => {
            setTrainingLocation(location);
            setShowPreWorkout(false);
            setShowWorkoutStart(true);
          }}
          muscleGroup={currentMuscleGroup}
        />
      )}

      {/* Workout Start Page */}
      {showWorkoutStart && <WorkoutStartPage onClose={() => { setShowWorkoutStart(false); setActiveMuscleGroup(''); setTrainingLocation(''); refetchWorkouts(); }} muscleGroup={currentMuscleGroup} trainingLocation={trainingLocation} />}

      {/* Integrations Page */}
      {showIntegrations && (
        <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
          <IntegrationsPage onBack={() => setShowIntegrations(false)} />
        </div>
      )}

      {/* Workout Switch Page */}
      {showWorkoutSwitch && (
        <WorkoutSwitchPage
          onClose={() => setShowWorkoutSwitch(false)}
          onSelectWorkout={(type, details) => {
            setShowWorkoutSwitch(false);
            if (type === 'cardio') {
              // Go directly to CardioSessionPage — skip PreWorkoutModal for cardio
              setCardioGoal('quick');
              setCardioDetails({ equipment: details.activity, activityName: details.activityName });
              setShowCardioSession(true);
              return;
            }
            if (type === 'split' && details.name) {
              setActiveMuscleGroup(details.name);
            } else if (type === 'custom' && details.muscles) {
              setActiveMuscleGroup(details.muscles.join(' & '));
            } else if (type === 'ai' && details.name) {
              setActiveMuscleGroup(details.name);
            }
            // Go through PreWorkoutModal (location prompt) instead of straight to workout
            setShowPreWorkout(true);
          }}
          userSplit={profile?.split || ''}
          customSplit={profile?.customSplit || []}
          scheduledWorkout={scheduledWorkout.name}
        />
      )}

      {/* Cardio Setup Page */}
      {showCardioSetup && (
        <CardioSetupPage
          onClose={() => setShowCardioSetup(false)}
          onSelectCardio={(goal, details) => {
            setShowCardioSetup(false);
            setCardioGoal(goal);
            setCardioDetails(details);
            setShowCardioSession(true);
          }}
        />
      )}

      {/* Cardio Session Page */}
      {showCardioSession && (
        <CardioSessionPage
          onClose={() => { setShowCardioSession(false); setCardioGoal(''); setCardioDetails(null); refetchWorkouts(); }}
          goal={cardioGoal}
          details={cardioDetails}
        />
      )}

      {/* Second Session Page */}
      {showSecondSession && (
        <SecondSessionPage
          onClose={() => setShowSecondSession(false)}
          onSelectType={(type) => {
            if (type === 'strength') {
              setShowSecondSession(false);
              setShowWorkoutSwitch(true);
            } else {
              setShowSecondSession(false);
              setShowCardioSetup(true);
            }
          }}
        />
      )}

      {/* Readiness Modal */}
      {showReadinessModal && <ReadinessModal onClose={() => setShowReadinessModal(false)} />}

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-t-3xl md:rounded-3xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div>
                <h3 className="font-bold text-lg">{selectedWorkout.workoutType}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedWorkout.date} · {selectedWorkout.startTime}</p>
              </div>
              <button onClick={() => setSelectedWorkout(null)} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {selectedWorkout.duration > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedWorkout.duration} minutes</span>
                </div>
              )}
              {selectedWorkout.exercises.map((ex: any, idx: number) => (
                <div key={idx} className="bg-[#1a1a1a] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {ex.cardioData ? <Activity className="w-4 h-4 text-red-400" /> : <Dumbbell className="w-4 h-4 text-[#00ff00]" />}
                    <span className="font-semibold text-sm">{ex.name}</span>
                  </div>
                  {ex.cardioData ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {ex.cardioData.duration > 0 && <div className="bg-black/30 rounded-lg px-3 py-2"><span className="text-gray-500">Duration</span><p className="font-bold">{ex.cardioData.duration} min</p></div>}
                      {ex.cardioData.distance && <div className="bg-black/30 rounded-lg px-3 py-2"><span className="text-gray-500">Distance</span><p className="font-bold">{ex.cardioData.distance} mi</p></div>}
                      {ex.cardioData.speed && <div className="bg-black/30 rounded-lg px-3 py-2"><span className="text-gray-500">Speed</span><p className="font-bold">{ex.cardioData.speed} mph</p></div>}
                      {ex.cardioData.calories && <div className="bg-black/30 rounded-lg px-3 py-2"><span className="text-gray-500">Calories</span><p className="font-bold">{ex.cardioData.calories} cal</p></div>}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {ex.sets.map((set: any, sIdx: number) => (
                        <div key={sIdx} className="flex items-center justify-between text-xs bg-black/30 rounded-lg px-3 py-2">
                          <span className="text-gray-500">Set {sIdx + 1}</span>
                          <span className="font-semibold">{set.weight > 0 ? `${set.weight} lbs` : 'BW'} × {set.reps}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
