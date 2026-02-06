import { useState } from 'react';
import { Home, BarChart3, Users, User, Settings, Dumbbell, Play, RefreshCw, Heart, Plus } from 'lucide-react';
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

interface UserData {
  name: string;
  phoneNumber: string;
  verificationCode: string;
  heightFeet: number;
  heightInches: number;
  weight: number;
  experience: 'beginner' | 'intermediate' | 'advanced' | '';
  gym: string;
  isHomeGym: boolean;
  wearables: string[];
  goal: string;
  customGoal: string;
  split: string;
  customSplit: { day: number; muscles: string[] }[];
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'today' | 'progress' | 'community' | 'profile'>('today');
  const [showWorkoutStart, setShowWorkoutStart] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showWorkoutSwitch, setShowWorkoutSwitch] = useState(false);
  const [showCardioSetup, setShowCardioSetup] = useState(false);
  const [showSecondSession, setShowSecondSession] = useState(false);
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: 'Alex Martinez',
    phoneNumber: '',
    verificationCode: '',
    heightFeet: 5,
    heightInches: 10,
    weight: 175,
    experience: 'intermediate',
    gym: 'UM CCRB',
    isHomeGym: false,
    wearables: [],
    goal: 'muscle-gain',
    customGoal: '',
    split: 'arnold',
    customSplit: []
  });

  const handleOnboardingComplete = (data: UserData) => {
    setUserData(data);
    setHasCompletedOnboarding(true);
  };

  // Workout data for completed workouts
  const completedWorkouts = {
    pushDay: {
      date: 'Monday, February 2',
      startTime: '9:30 AM',
      duration: 75,
      workoutType: 'Push Day',
      exercises: [
        {
          name: 'Bench Press',
          sets: [
            { weight: 205, reps: 8 },
            { weight: 215, reps: 6 },
            { weight: 225, reps: 4 },
            { weight: 215, reps: 6 }
          ]
        },
        {
          name: 'Incline Dumbbell Press',
          sets: [
            { weight: 70, reps: 10 },
            { weight: 75, reps: 8 },
            { weight: 75, reps: 8 }
          ]
        },
        {
          name: 'Cable Flyes',
          sets: [
            { weight: 40, reps: 12 },
            { weight: 45, reps: 12 },
            { weight: 50, reps: 10 }
          ]
        },
        {
          name: 'Overhead Press',
          sets: [
            { weight: 115, reps: 8 },
            { weight: 125, reps: 6 },
            { weight: 135, reps: 5 }
          ]
        },
        {
          name: 'Lateral Raises',
          sets: [
            { weight: 25, reps: 15 },
            { weight: 30, reps: 12 },
            { weight: 30, reps: 12 }
          ]
        }
      ]
    },
    cardio: {
      date: 'Sunday, February 1',
      startTime: '7:00 AM',
      duration: 45,
      workoutType: 'Cardio Session',
      exercises: [
        {
          name: 'Treadmill Run',
          sets: [],
          cardioData: {
            duration: 45,
            distance: 4.2,
            speed: 5.6,
            incline: 2,
            calories: 385
          }
        }
      ]
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
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
                <p className="text-xs text-gray-400 mb-0.5">Tuesday, February 3</p>
                <h1 className="text-xl font-bold">Hey, {userData.name.split(' ')[0]}</h1>
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
                <span className="text-[#00ff00] text-[10px] font-semibold">Learn More →</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-bold">94</span>
                <span className="text-lg text-gray-500">/ 100</span>
              </div>
              <p className="text-[#00ff00] font-semibold text-sm mb-0.5">Optimal</p>
              <p className="text-gray-400 text-xs mb-3">Peak performance expected</p>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                <div className="h-full bg-[#00ff00]" style={{ width: '94%' }}></div>
              </div>
            </button>

            {/* Scheduled Workout Card */}
            <div className="bg-[#1a1a1a] rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="inline-block bg-[#00ff00] text-black text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
                    SCHEDULED
                  </span>
                  <h2 className="text-lg font-bold mb-0.5">Shoulders/Arms</h2>
                  <p className="text-gray-400 text-sm">Arnold's Split</p>
                </div>
                <div className="p-2 bg-[#252525] rounded-xl">
                  <Dumbbell className="w-5 h-5 text-[#00ff00]" />
                </div>
              </div>
              
              <button className="w-full bg-white text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                onClick={() => setShowWorkoutStart(true)}
              >
                <Play className="w-4 h-4 fill-current" />
                Start Workout
              </button>
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
                <p className="text-gray-400 text-xs">2 / 6 days</p>
              </div>
              
              {/* Week Progress Cards */}
              <div className="space-y-2">
                <button 
                  onClick={() => setSelectedWorkout(completedWorkouts.pushDay)}
                  className="w-full bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between hover:bg-[#252525] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#00ff00] rounded-lg flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-black" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Push Day</p>
                      <p className="text-gray-400 text-xs">Completed • Monday</p>
                    </div>
                  </div>
                  <span className="text-[#00ff00] text-xs font-semibold">✓</span>
                </button>
                
                <button 
                  onClick={() => setSelectedWorkout(completedWorkouts.cardio)}
                  className="w-full bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between hover:bg-[#252525] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#00ff00] rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-black" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Cardio</p>
                      <p className="text-gray-400 text-xs">Completed • Sunday</p>
                    </div>
                  </div>
                  <span className="text-[#00ff00] text-xs font-semibold">✓</span>
                </button>
              </div>
            </div>
          </main>
        </>
      )}

      {currentPage === 'progress' && <ProgressPage />}

      {currentPage === 'community' && <CommunityPage />}

      {currentPage === 'profile' && <ProfilePage userData={userData} onIntegrationsClick={() => setShowIntegrations(true)} />}

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
      {showWorkoutStart && <WorkoutStartPage onClose={() => setShowWorkoutStart(false)} muscleGroup="Shoulders/Arms" />}

      {/* Integrations Page */}
      {showIntegrations && <IntegrationsPage onBack={() => setShowIntegrations(false)} />}

      {/* Workout Switch Page */}
      {showWorkoutSwitch && (
        <WorkoutSwitchPage
          onClose={() => setShowWorkoutSwitch(false)}
          onSelectWorkout={(type, details) => {
            console.log('Selected workout:', type, details);
            setShowWorkoutSwitch(false);
            setShowWorkoutStart(true);
          }}
          userSplit={userData.split}
          customSplit={userData.customSplit}
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
