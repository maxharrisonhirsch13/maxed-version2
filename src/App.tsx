import { useState } from 'react';
import { Home, BarChart3, Users, User, Settings, Dumbbell, Play, RefreshCw, Heart, Plus, Loader2 } from 'lucide-react';
import { ProgressPage } from './components/ProgressPage';
import { CommunityPage } from './components/CommunityPage';
import { WorkoutStartPage } from './components/WorkoutStartPage';
import { LoginScreen } from './components/LoginScreen';
import { ProfilePage } from './components/ProfilePage';
import { OnboardingPage } from './components/OnboardingPageNew';
import { IntegrationsPage } from './components/IntegrationsPage';
import { WorkoutSwitchPage } from './components/WorkoutSwitchPage';
import { CardioSetupPage } from './components/CardioSetupPage';
import { SecondSessionPage } from './components/SecondSessionPage';
import { ReadinessModal } from './components/ReadinessModal';
import { WorkoutDetailModal } from './components/WorkoutDetailModal';
import { useAuth } from './context/AuthContext';
import { useWorkoutHistory } from './hooks/useWorkoutHistory';
import { useWhoopData } from './hooks/useWhoopData';

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
  const { session, profile, loading, refreshProfile } = useAuth();
  const { workouts: recentWorkouts } = useWorkoutHistory({ limit: 10 });
  const { data: whoopData } = useWhoopData();

  // Readiness score from WHOOP recovery data — floor at 55
  const rawReadiness = whoopData?.recovery?.score ?? null;
  const readinessScore = rawReadiness != null ? Math.max(rawReadiness, 55) : null;
  const readinessColor = readinessScore != null
    ? readinessScore >= 67 ? '#00ff00' : readinessScore >= 34 ? '#facc15' : '#ef4444'
    : '#6b7280';
  const readinessLabel = readinessScore != null
    ? readinessScore >= 67 ? 'Optimal' : readinessScore >= 34 ? 'Moderate' : 'Low'
    : 'Connect wearable';
  const readinessDetail = readinessScore != null
    ? readinessScore >= 67 ? 'Peak performance expected' : readinessScore >= 34 ? 'Consider lighter intensity' : 'Active recovery recommended'
    : 'Link WHOOP for insights';
  const [currentPage, setCurrentPage] = useState<'today' | 'progress' | 'community' | 'profile'>('today');
  const [showWorkoutStart, setShowWorkoutStart] = useState(false);
  const [activeMuscleGroup, setActiveMuscleGroup] = useState('');
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showWorkoutSwitch, setShowWorkoutSwitch] = useState(false);
  const [showCardioSetup, setShowCardioSetup] = useState(false);
  const [showSecondSession, setShowSecondSession] = useState(false);
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

  // Compute scheduled workout from user's split
  const scheduledWorkout = getScheduledWorkout(profile?.split || undefined, profile?.customSplit);
  const currentMuscleGroup = activeMuscleGroup || scheduledWorkout.name;
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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

  // Logged in but hasn't completed onboarding
  if (!profile?.onboardingCompleted) {
    return <OnboardingPage onComplete={async () => { await refreshProfile(); }} />;
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Render current page */}
      {currentPage === 'today' && (
        <>
          {/* Header */}
          <header className="px-4 pt-safe pt-8 pb-3">
            <div className="flex justify-between items-start mb-1">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{dateStr}</p>
                <h1 className="text-xl font-bold">Hey, {profile?.name?.split(' ')[0] || 'there'}</h1>
              </div>
              <button className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="px-4 space-y-3 pb-8">
            {/* Today's Readiness Card */}
            <button
              onClick={() => setShowReadinessModal(true)}
              className="w-full bg-[#1a1a1a] rounded-2xl p-4 relative overflow-hidden hover:bg-[#1f1f1f] transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs">Today's Readiness</p>
                <span className="text-[10px] font-semibold" style={{ color: readinessColor }}>Learn More →</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-bold">{readinessScore ?? '—'}</span>
                {readinessScore != null && <span className="text-lg text-gray-500">/ 100</span>}
              </div>
              <p className="font-semibold text-sm mb-0.5" style={{ color: readinessColor }}>{readinessLabel}</p>
              <p className="text-gray-400 text-xs mb-3">{readinessDetail}</p>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                <div className="h-full" style={{ width: `${readinessScore ?? 0}%`, backgroundColor: readinessColor }}></div>
              </div>
            </button>

            {/* Scheduled Workout Card */}
            <div className="bg-[#1a1a1a] rounded-2xl p-4">
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
                  onClick={() => setShowWorkoutStart(true)}
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start Workout
                </button>
              ) : (
                <p className="text-gray-500 text-sm text-center py-2">Recovery day — use Switch to train anyway</p>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
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
            <div className="pt-2">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold">This Week</h3>
                <p className="text-gray-400 text-xs">{recentWorkouts.length} workout{recentWorkouts.length !== 1 ? 's' : ''}</p>
              </div>

              {recentWorkouts.length === 0 ? (
                <div className="bg-[#1a1a1a] rounded-xl p-6 flex flex-col items-center justify-center">
                  <Dumbbell className="w-8 h-8 text-gray-600 mb-2" />
                  <p className="text-gray-500 text-sm">No workouts yet</p>
                  <p className="text-gray-600 text-xs mt-1">Start your first workout above!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentWorkouts.slice(0, 5).map((workout) => (
                    <button
                      key={workout.id}
                      onClick={() => setSelectedWorkout({
                        date: new Date(workout.startedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                        startTime: new Date(workout.startedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                        duration: workout.durationMinutes || 0,
                        workoutType: workout.workoutType,
                        exercises: workout.exercises.map(ex => ({
                          name: ex.exerciseName,
                          sets: ex.sets.map(s => ({ weight: s.weightLbs || 0, reps: s.reps || 0 })),
                        })),
                      })}
                      className="w-full bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between hover:bg-[#252525] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#00ff00] rounded-lg flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-black" />
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
                  ))}
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {currentPage === 'progress' && <ProgressPage />}

      {currentPage === 'community' && <CommunityPage />}

      {currentPage === 'profile' && <ProfilePage userData={profile} onIntegrationsClick={() => setShowIntegrations(true)} />}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-4 py-3 safe-area-inset-bottom">
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

      {/* Workout Start Page */}
      {showWorkoutStart && <WorkoutStartPage onClose={() => { setShowWorkoutStart(false); setActiveMuscleGroup(''); }} muscleGroup={currentMuscleGroup} />}

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
            if (type === 'split' && details.name) {
              setActiveMuscleGroup(details.name);
            } else if (type === 'custom' && details.muscles) {
              setActiveMuscleGroup(details.muscles.join(' & '));
            } else if (type === 'ai' && details.name) {
              setActiveMuscleGroup(details.name);
            }
            setShowWorkoutStart(true);
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
            console.log('Selected cardio:', goal, details);
            setShowCardioSetup(false);
            setShowWorkoutStart(true);
          }}
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
        <WorkoutDetailModal 
          workout={selectedWorkout} 
          onClose={() => setSelectedWorkout(null)} 
        />
      )}
    </div>
  );
}
