import { ChevronRight, ChevronLeft, User, Ruler, Dumbbell, MapPin, Target, Calendar, Sparkles, Home as HomeIcon, Search, Check, Watch, Activity, Heart, Zap, Loader2, Pencil, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useGymSearch } from '../hooks/useGymSearch';
import { useWhoopStatus } from '../hooks/useWhoopStatus';
import type { GymResult } from '../types';

interface OnboardingData {
  name: string;
  heightFeet: number;
  heightInches: number;
  weight: number;
  experience: 'beginner' | 'intermediate' | 'advanced' | '';
  gym: string;
  isHomeGym: boolean;
  gymPlaceId: string;
  gymAddress: string;
  gymLat: number | null;
  gymLng: number | null;
  wearables: string[];
  goal: string;
  customGoal: string;
  split: string;
  customSplit: { day: number; muscles: string[] }[];
}

interface OnboardingPageProps {
  onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const { connected: whoopConnected, loading: whoopStatusLoading, refetch: refetchWhoop } = useWhoopStatus();
  const [whoopConnecting, setWhoopConnecting] = useState(false);
  const [step, setStep] = useState(1);
  const [saveError, setSaveError] = useState('');
  const [data, setData] = useState<OnboardingData>({
    name: '',
    heightFeet: 5,
    heightInches: 10,
    weight: 175,
    experience: '',
    gym: '',
    isHomeGym: false,
    gymPlaceId: '',
    gymAddress: '',
    gymLat: null,
    gymLng: null,
    wearables: [],
    goal: '',
    customGoal: '',
    split: '',
    customSplit: []
  });

  const [editingFromReview, setEditingFromReview] = useState(false);
  const [showAIGoalInput, setShowAIGoalInput] = useState(false);
  const [showCustomSplit, setShowCustomSplit] = useState(false);
  const [splitDays, setSplitDays] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [gymSearchQuery, setGymSearchQuery] = useState('');
  const { results: gymResults, loading: gymSearchLoading } = useGymSearch(gymSearchQuery);
  const savingRef = useRef(false);

  // Check WHOOP status on return from OAuth
  useEffect(() => {
    if (window.location.search.includes('whoop=connected')) {
      refetchWhoop();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleWhoopConnect = async () => {
    if (!user) return;
    setWhoopConnecting(true);
    try {
      const res = await fetch(`/api/whoop-auth?userId=${user.id}`);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
    } catch (err) {
      console.error('WHOOP connect error:', err);
    }
    setWhoopConnecting(false);
  };

  const totalSteps = 8;

  const handleNext = () => {
    if (step === 6 && data.goal === 'Ask AI') {
      setShowAIGoalInput(true);
      return;
    }
    if (step === 7 && data.split === 'custom') {
      setShowCustomSplit(true);
      return;
    }
    if (editingFromReview) {
      setEditingFromReview(false);
      setStep(8);
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
    }
  };

  // Loading animation + save to Supabase
  useEffect(() => {
    if (isLoading) {
      savingRef.current = false;
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            // Prevent double-save from interval race
            if (!savingRef.current) {
              savingRef.current = true;
              saveProfile();
            }
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  async function saveProfile() {
    try {
      await updateProfile({
        name: data.name,
        height_feet: data.heightFeet,
        height_inches: data.heightInches,
        weight_lbs: data.weight,
        experience: data.experience || null,
        gym: data.gym || null,
        is_home_gym: data.isHomeGym,
        gym_place_id: data.gymPlaceId || null,
        gym_address: data.gymAddress || null,
        gym_lat: data.gymLat,
        gym_lng: data.gymLng,
        wearables: data.wearables,
        goal: data.goal === 'Ask AI' ? data.customGoal : data.goal,
        custom_goal: data.goal === 'Ask AI' ? data.customGoal : null,
        split: data.split || null,
        custom_split: data.customSplit.length > 0 ? data.customSplit : null,
        onboarding_completed: true,
      });
      setTimeout(() => onComplete(), 500);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save profile');
      setIsLoading(false);
      setLoadingProgress(0);
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1: return data.name.trim().length > 0;
      case 2: return data.heightFeet > 0 && data.weight > 0;
      case 3: return data.experience !== '';
      case 4: return data.isHomeGym || !!data.gymPlaceId;
      case 5: return true; // Wearables are optional
      case 6: return data.goal !== '';
      case 7: return data.split !== '';
      case 8: return true;
      default: return false;
    }
  };

  const wearableOptions = [
    { value: 'whoop', label: 'WHOOP', icon: <Activity className="w-5 h-5" />, color: 'from-red-500 to-pink-600' },
    { value: 'oura', label: 'Oura Ring', icon: <Zap className="w-5 h-5" />, color: 'from-purple-500 to-indigo-600' },
    { value: 'apple-health', label: 'Apple Health', icon: <Heart className="w-5 h-5" />, color: 'from-red-500 to-pink-500' },
    { value: 'fitbit', label: 'Fitbit', icon: <Activity className="w-5 h-5" />, color: 'from-teal-500 to-cyan-600' },
    { value: 'garmin', label: 'Garmin', icon: <Watch className="w-5 h-5" />, color: 'from-blue-500 to-indigo-600' },
  ];

  const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Cardio'];

  const toggleWearable = (value: string) => {
    if (data.wearables.includes(value)) {
      setData({ ...data, wearables: data.wearables.filter(w => w !== value) });
    } else {
      setData({ ...data, wearables: [...data.wearables, value] });
    }
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-5">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Get Maxed</h1>
            <p className="text-gray-400 text-sm">Curating your personalized workout plan...</p>
          </div>

          <div className="bg-[#0a0a0a] rounded-full h-3 overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-[#00ff00] to-[#00cc00] transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-center text-xs text-gray-500">{loadingProgress}%</p>

          <div className="mt-8 space-y-2 text-center text-sm text-gray-400">
            {loadingProgress < 30 && <p>Analyzing your fitness profile...</p>}
            {loadingProgress >= 30 && loadingProgress < 60 && <p>Building your workout split...</p>}
            {loadingProgress >= 60 && loadingProgress < 90 && <p>Selecting optimal exercises...</p>}
            {loadingProgress >= 90 && <p>Finalizing your plan...</p>}
          </div>

          {saveError && (
            <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-xs text-center">{saveError}</p>
              <button
                onClick={() => { setSaveError(''); setIsLoading(true); }}
                className="w-full mt-2 text-sm text-[#00ff00] font-medium"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // AI Goal Input Screen
  if (showAIGoalInput) {
    return (
      <div className="min-h-screen bg-black text-white px-5 py-8">
        <div className="max-w-md mx-auto">
          <button onClick={() => setShowAIGoalInput(false)} className="text-gray-400 text-sm mb-8">
            ← Back
          </button>

          <div className="mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Tell Us Your Goals</h2>
            <p className="text-gray-400 text-sm">Describe what you want to achieve and we'll personalize your plan</p>
          </div>

          <textarea
            value={data.customGoal}
            onChange={(e) => setData({ ...data, customGoal: e.target.value })}
            placeholder="I want to build muscle while staying lean, focusing on upper body strength and improving my endurance..."
            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-2xl px-4 py-4 text-white placeholder-gray-600 text-sm resize-none h-48 focus:outline-none focus:border-[#00ff00] transition-colors"
          />

          <button
            onClick={() => {
              setShowAIGoalInput(false);
              setStep(7);
            }}
            disabled={data.customGoal.trim().length < 10}
            className="w-full bg-[#00ff00] text-black font-bold py-4 rounded-2xl text-base hover:bg-[#00dd00] transition-all active:scale-[0.98] disabled:opacity-30 disabled:hover:bg-[#00ff00] disabled:active:scale-100 flex items-center justify-center gap-2 mt-6"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Custom Split Screen
  if (showCustomSplit) {
    return (
      <div className="min-h-screen bg-black text-white px-5 py-8 pb-24">
        <div className="max-w-md mx-auto">
          <button onClick={() => setShowCustomSplit(false)} className="text-gray-400 text-sm mb-8">
            ← Back
          </button>

          <div className="mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-2xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Custom Split</h2>
            <p className="text-gray-400 text-sm mb-4">Select muscle groups for each training day</p>

            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium">Days per week:</label>
              <select
                value={splitDays}
                onChange={(e) => {
                  const days = parseInt(e.target.value);
                  setSplitDays(days);
                  setData({
                    ...data,
                    customSplit: Array.from({ length: days }, (_, i) => ({
                      day: i + 1,
                      muscles: data.customSplit[i]?.muscles || []
                    }))
                  });
                }}
                className="bg-[#0a0a0a] border border-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00ff00]"
              >
                {[3, 4, 5, 6, 7].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {Array.from({ length: splitDays }, (_, idx) => {
              const dayData = data.customSplit[idx] || { day: idx + 1, muscles: [] };
              return (
                <div key={idx} className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-4">
                  <h3 className="font-bold text-sm mb-3">Day {idx + 1}</h3>
                  <div className="flex flex-wrap gap-2">
                    {muscleGroups.map(muscle => {
                      const isSelected = dayData.muscles.includes(muscle);
                      return (
                        <button
                          key={muscle}
                          onClick={() => {
                            const newCustomSplit = [...data.customSplit];
                            if (!newCustomSplit[idx]) {
                              newCustomSplit[idx] = { day: idx + 1, muscles: [] };
                            }
                            const muscles = newCustomSplit[idx].muscles;
                            if (isSelected) {
                              newCustomSplit[idx].muscles = muscles.filter(m => m !== muscle);
                            } else {
                              newCustomSplit[idx].muscles = [...muscles, muscle];
                            }
                            setData({ ...data, customSplit: newCustomSplit });
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
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

          <button
            onClick={() => {
              setShowCustomSplit(false);
              setStep(8);
            }}
            disabled={!data.customSplit.every(day => day.muscles.length > 0)}
            className="w-full bg-[#00ff00] text-black font-bold py-4 rounded-2xl text-base hover:bg-[#00dd00] transition-all active:scale-[0.98] disabled:opacity-30 disabled:hover:bg-[#00ff00] disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-5 py-8">
      <div className="max-w-md mx-auto">
        {/* Progress Indicator */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all ${
                idx + 1 <= step ? 'bg-[#00ff00]' : 'bg-gray-800'
              }`}
            />
          ))}
        </div>

        {/* Back Button */}
        {step > 1 && (
          <button
            onClick={() => {
              if (editingFromReview) {
                setEditingFromReview(false);
                setStep(8);
              } else {
                setStep(step - 1);
              }
            }}
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors mb-6 -ml-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{editingFromReview ? 'Back to review' : 'Back'}</span>
          </button>
        )}

        {/* Step Content */}
        <div className="mb-12">
          {/* Step 1: Name */}
          {step === 1 && (
            <>
              <div className="w-12 h-12 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-2xl flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2">What's your name?</h2>
              <p className="text-gray-400 text-sm mb-8">Let's personalize your experience</p>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="Enter your full name"
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-2xl px-4 py-4 text-white placeholder-gray-600 text-base focus:outline-none focus:border-[#00ff00] transition-colors"
                autoFocus
              />
            </>
          )}

          {/* Step 2: Height & Weight */}
          {step === 2 && (
            <>
              <div className="w-12 h-12 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-2xl flex items-center justify-center mb-4">
                <Ruler className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your stats</h2>
              <p className="text-gray-400 text-sm mb-8">Help us track your progress</p>

              {/* Height Inputs */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">Height</label>
                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="3"
                      max="8"
                      value={data.heightFeet}
                      onChange={(e) => setData({ ...data, heightFeet: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white text-center text-lg focus:outline-none focus:border-[#00ff00] transition-colors"
                      placeholder="5"
                    />
                    <p className="text-center text-xs text-gray-500 mt-1.5">feet</p>
                  </div>
                  <span className="text-2xl text-gray-600 pb-5">'</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={data.heightInches}
                      onChange={(e) => setData({ ...data, heightInches: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white text-center text-lg focus:outline-none focus:border-[#00ff00] transition-colors"
                      placeholder="10"
                    />
                    <p className="text-center text-xs text-gray-500 mt-1.5">inches</p>
                  </div>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="text-sm font-medium mb-3 block">Weight (lbs)</label>
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="number"
                    min="80"
                    max="500"
                    value={data.weight}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      if (!isNaN(v) && v >= 0) setData({ ...data, weight: Math.min(v, 500) });
                    }}
                    className="w-28 bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white text-center text-2xl font-bold focus:outline-none focus:border-[#00ff00] transition-colors"
                  />
                  <span className="text-gray-500 text-sm">lbs</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="100"
                    max="350"
                    step="1"
                    value={Math.max(100, Math.min(350, data.weight))}
                    onChange={(e) => setData({ ...data, weight: parseInt(e.target.value) })}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer slider-green"
                  />
                  <style>{`
                    .slider-green {
                      background: linear-gradient(to right, #00ff00 0%, #00ff00 ${((Math.max(100, Math.min(350, data.weight)) - 100) / 250) * 100}%, #1a1a1a ${((Math.max(100, Math.min(350, data.weight)) - 100) / 250) * 100}%, #1a1a1a 100%);
                    }
                    .slider-green::-webkit-slider-thumb {
                      appearance: none;
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #00ff00;
                      cursor: pointer;
                      box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
                    }
                    .slider-green::-moz-range-thumb {
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #00ff00;
                      cursor: pointer;
                      border: none;
                      box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
                    }
                  `}</style>
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-gray-600">
                  <span>100</span>
                  <span>350</span>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Experience */}
          {step === 3 && (
            <>
              <div className="w-12 h-12 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-2xl flex items-center justify-center mb-4">
                <Dumbbell className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Lifting experience?</h2>
              <p className="text-gray-400 text-sm mb-8">This helps us recommend the right workouts</p>
              
              <div className="space-y-3">
                {[
                  { value: 'beginner', label: 'Beginner', desc: 'New to lifting or less than 1 year' },
                  { value: 'intermediate', label: 'Intermediate', desc: '1-3 years of consistent training' },
                  { value: 'advanced', label: 'Advanced', desc: '3+ years with solid technique' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      const newVal = data.experience === option.value ? '' as any : option.value as any;
                      setData({ ...data, experience: newVal });
                      if (editingFromReview && newVal) {
                        setEditingFromReview(false);
                        setTimeout(() => setStep(8), 150);
                      }
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                      data.experience === option.value
                        ? 'border-[#00ff00] bg-[#00ff00]/10'
                        : 'border-gray-800 bg-[#0a0a0a] hover:border-gray-700'
                    }`}
                  >
                    <div className="font-bold text-base mb-1">{option.label}</div>
                    <div className="text-xs text-gray-400">{option.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 4: Gym Location */}
          {step === 4 && (
            <>
              <div className="w-12 h-12 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-2xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Where do you train?</h2>
              <p className="text-gray-400 text-sm mb-8">Search for your gym or train at home</p>

              <div className="space-y-3 mb-4">
                <button
                  onClick={() => {
                    if (data.isHomeGym) {
                      setData({ ...data, isHomeGym: false, gym: '', gymPlaceId: '', gymAddress: '', gymLat: null, gymLng: null });
                    } else {
                      setData({ ...data, isHomeGym: true, gym: 'Home Gym', gymPlaceId: '', gymAddress: '', gymLat: null, gymLng: null });
                      setGymSearchQuery('');
                      if (editingFromReview) {
                        setEditingFromReview(false);
                        setTimeout(() => setStep(8), 150);
                      }
                    }
                  }}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                    data.isHomeGym
                      ? 'border-[#00ff00] bg-[#00ff00]/10'
                      : 'border-gray-800 bg-[#0a0a0a] hover:border-gray-700'
                  }`}
                >
                  <HomeIcon className="w-5 h-5" />
                  <div className="text-left flex-1">
                    <div className="font-bold text-base">I work out at home</div>
                    <div className="text-xs text-gray-400">{data.isHomeGym ? 'Tap to deselect' : 'Bodyweight & home equipment'}</div>
                  </div>
                  {data.isHomeGym && <Check className="w-5 h-5 text-[#00ff00]" />}
                </button>
              </div>

              {!data.isHomeGym && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px bg-gray-800 flex-1" />
                    <span className="text-xs text-gray-500">OR</span>
                    <div className="h-px bg-gray-800 flex-1" />
                  </div>

                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={gymSearchQuery}
                      onChange={(e) => {
                        setGymSearchQuery(e.target.value);
                        if (data.gymPlaceId) {
                          setData({ ...data, gym: '', gymPlaceId: '', gymAddress: '', gymLat: null, gymLng: null });
                        }
                      }}
                      placeholder="Search by gym name or zip code"
                      className="w-full bg-[#0a0a0a] border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 text-base focus:outline-none focus:border-[#00ff00] transition-colors"
                    />
                  </div>

                  {/* Selected gym confirmation */}
                  {data.gymPlaceId && (
                    <div className="mt-4 bg-[#00ff00]/10 border border-[#00ff00]/30 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Check className="w-4 h-4 text-[#00ff00]" />
                        <p className="font-bold text-sm">{data.gym}</p>
                      </div>
                      <p className="text-xs text-gray-400 ml-6">{data.gymAddress}</p>
                    </div>
                  )}

                  {/* Search results */}
                  {!data.gymPlaceId && gymSearchQuery.length >= 2 && (
                    <div className="mt-4 space-y-2">
                      {gymSearchLoading && (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-5 h-5 text-[#00ff00] animate-spin" />
                          <span className="text-sm text-gray-400 ml-2">Searching gyms...</span>
                        </div>
                      )}

                      {!gymSearchLoading && gymResults.length === 0 && (
                        <div className="text-center py-6">
                          <p className="text-gray-500 text-sm">No gyms found</p>
                          <p className="text-gray-600 text-xs mt-1">Try a different name or zip code</p>
                        </div>
                      )}

                      {!gymSearchLoading && gymResults.map((gym) => (
                        <button
                          key={gym.placeId}
                          onClick={() => {
                            setData({
                              ...data,
                              gym: gym.name,
                              isHomeGym: false,
                              gymPlaceId: gym.placeId,
                              gymAddress: gym.address,
                              gymLat: gym.lat,
                              gymLng: gym.lng,
                            });
                            setGymSearchQuery(gym.name);
                            if (editingFromReview) {
                              setEditingFromReview(false);
                              setTimeout(() => setStep(8), 150);
                            }
                          }}
                          className="w-full p-3 bg-[#0a0a0a] border border-gray-800 rounded-xl text-left hover:border-gray-700 transition-colors"
                        >
                          <div className="font-medium text-sm">{gym.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{gym.address}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Step 5: Wearables */}
          {step === 5 && (
            <>
              <div className="w-12 h-12 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-2xl flex items-center justify-center mb-4">
                <Watch className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect wearables</h2>
              <p className="text-gray-400 text-sm mb-8">Sync your fitness data automatically (optional)</p>

              <div className="space-y-3 mb-4">
                {/* WHOOP — real OAuth connection */}
                <button
                  onClick={whoopConnected ? undefined : handleWhoopConnect}
                  disabled={whoopConnecting}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                    whoopConnected
                      ? 'border-[#00ff00] bg-[#00ff00]/10'
                      : 'border-gray-800 bg-[#0a0a0a] hover:border-gray-700'
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center text-white">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-base">WHOOP</div>
                    <div className="text-xs text-gray-400">
                      {whoopConnecting ? 'Connecting...' : whoopConnected ? 'AUTO — Syncing recovery, sleep & strain' : 'Tap to connect'}
                    </div>
                  </div>
                  {whoopConnecting ? (
                    <RefreshCw className="w-5 h-5 text-[#00ff00] animate-spin" />
                  ) : whoopConnected ? (
                    <span className="px-2 py-0.5 bg-[#00ff00] text-black text-[10px] font-bold rounded-full">AUTO</span>
                  ) : null}
                </button>

                {/* Other wearables — coming soon */}
                {wearableOptions.filter(w => w.value !== 'whoop').map((wearable) => (
                  <button
                    key={wearable.value}
                    onClick={() => toggleWearable(wearable.value)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                      data.wearables.includes(wearable.value)
                        ? 'border-[#00ff00] bg-[#00ff00]/10'
                        : 'border-gray-800 bg-[#0a0a0a] hover:border-gray-700'
                    }`}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${wearable.color} rounded-xl flex items-center justify-center text-white`}>
                      {wearable.icon}
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-base">{wearable.label}</div>
                      <div className="text-xs text-gray-400">Coming soon</div>
                    </div>
                    {data.wearables.includes(wearable.value) && (
                      <Check className="w-5 h-5 text-[#00ff00]" />
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (editingFromReview) { setEditingFromReview(false); setStep(8); }
                  else setStep(6);
                }}
                className="w-full text-sm text-gray-500 hover:text-white transition-colors"
              >
                {editingFromReview ? 'Back to review' : 'Skip for now'}
              </button>
            </>
          )}

          {/* Step 6: Goals */}
          {step === 6 && (
            <>
              <div className="w-12 h-12 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-2xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2">What's your goal?</h2>
              <p className="text-gray-400 text-sm mb-8">We'll customize your plan to help you achieve it</p>

              <div className="space-y-3">
                {[
                  { value: 'lean', label: 'Get Lean', desc: 'Cut fat while maintaining muscle' },
                  { value: 'muscle', label: 'Build Muscle', desc: 'Maximize hypertrophy and size' },
                  { value: 'strength', label: 'Gain Strength', desc: 'Increase your max lifts' },
                  { value: 'fitness', label: 'General Fitness', desc: 'Stay healthy and active' },
                  { value: 'athletic', label: 'Athletic Performance', desc: 'Power, speed, and explosiveness' },
                  { value: 'Ask AI', label: 'Ask AI', desc: 'Describe your custom goals', icon: <Sparkles className="w-4 h-4" /> }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      const newVal = data.goal === option.value ? '' : option.value;
                      setData({ ...data, goal: newVal });
                      if (editingFromReview && newVal && newVal !== 'Ask AI') {
                        setEditingFromReview(false);
                        setTimeout(() => setStep(8), 150);
                      }
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                      data.goal === option.value
                        ? 'border-[#00ff00] bg-[#00ff00]/10'
                        : 'border-gray-800 bg-[#0a0a0a] hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-bold text-base">{option.label}</div>
                      {option.icon && <span className="text-[#00ff00]">{option.icon}</span>}
                    </div>
                    <div className="text-xs text-gray-400">{option.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 7: Split */}
          {step === 7 && (
            <>
              <div className="w-12 h-12 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-2xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Choose your split</h2>
              <p className="text-gray-400 text-sm mb-8">Pick a training program that fits your schedule</p>

              <div className="space-y-3">
                {[
                  { value: 'ppl', label: 'Push Pull Legs', desc: '6 days/week - Balanced muscle development' },
                  { value: 'arnold', label: "Arnold Split", desc: '6 days/week - Classic bodybuilding routine' },
                  { value: 'bro', label: 'Bro Split', desc: '5 days/week - One muscle group per day' },
                  { value: 'upper-lower', label: 'Upper/Lower', desc: '4 days/week - Strength focused' },
                  { value: 'custom', label: 'Custom Split', desc: 'Build your own training schedule', icon: <Sparkles className="w-4 h-4" /> }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      const newVal = data.split === option.value ? '' : option.value;
                      setData({ ...data, split: newVal });
                      if (editingFromReview && newVal && newVal !== 'custom') {
                        setEditingFromReview(false);
                        setTimeout(() => setStep(8), 150);
                      }
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                      data.split === option.value
                        ? 'border-[#00ff00] bg-[#00ff00]/10'
                        : 'border-gray-800 bg-[#0a0a0a] hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-bold text-base">{option.label}</div>
                      {option.icon && <span className="text-[#00ff00]">{option.icon}</span>}
                    </div>
                    <div className="text-xs text-gray-400">{option.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 8: Final Review */}
          {step === 8 && (
            <>
              <div className="w-12 h-12 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
              <p className="text-gray-400 text-sm mb-8">Review your profile and let's get started</p>

              <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{data.name}</p>
                  </div>
                  <button onClick={() => { setEditingFromReview(true); setStep(1); }} className="ml-3 px-3 py-1.5 text-xs font-medium text-[#00ff00] border border-[#00ff00]/30 rounded-lg hover:bg-[#00ff00]/10 transition-colors">
                    Edit
                  </button>
                </div>
                <div className="h-px bg-gray-800" />
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Stats</p>
                    <p className="font-medium">{data.heightFeet} ft {data.heightInches} in · {data.weight} lbs</p>
                  </div>
                  <button onClick={() => { setEditingFromReview(true); setStep(2); }} className="ml-3 px-3 py-1.5 text-xs font-medium text-[#00ff00] border border-[#00ff00]/30 rounded-lg hover:bg-[#00ff00]/10 transition-colors">
                    Edit
                  </button>
                </div>
                <div className="h-px bg-gray-800" />
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="font-medium capitalize">{data.experience}</p>
                  </div>
                  <button onClick={() => { setEditingFromReview(true); setStep(3); }} className="ml-3 px-3 py-1.5 text-xs font-medium text-[#00ff00] border border-[#00ff00]/30 rounded-lg hover:bg-[#00ff00]/10 transition-colors">
                    Edit
                  </button>
                </div>
                <div className="h-px bg-gray-800" />
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Training Location</p>
                    <p className="font-medium">{data.gym}</p>
                  </div>
                  <button onClick={() => { setEditingFromReview(true); setStep(4); }} className="ml-3 px-3 py-1.5 text-xs font-medium text-[#00ff00] border border-[#00ff00]/30 rounded-lg hover:bg-[#00ff00]/10 transition-colors">
                    Edit
                  </button>
                </div>
                {(whoopConnected || data.wearables.length > 0) && (
                  <>
                    <div className="h-px bg-gray-800" />
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Wearables</p>
                        <p className="font-medium">
                          {whoopConnected ? 'WHOOP — AUTO' : `${data.wearables.length} device${data.wearables.length > 1 ? 's' : ''}`}
                        </p>
                      </div>
                      <button onClick={() => { setEditingFromReview(true); setStep(5); }} className="ml-3 px-3 py-1.5 text-xs font-medium text-[#00ff00] border border-[#00ff00]/30 rounded-lg hover:bg-[#00ff00]/10 transition-colors">
                        Edit
                      </button>
                    </div>
                  </>
                )}
                <div className="h-px bg-gray-800" />
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Goal</p>
                    <p className="font-medium">
                      {data.goal === 'Ask AI' ? data.customGoal :
                       data.goal === 'lean' ? 'Get Lean' :
                       data.goal === 'muscle' ? 'Build Muscle' :
                       data.goal === 'strength' ? 'Gain Strength' :
                       data.goal === 'fitness' ? 'General Fitness' :
                       data.goal === 'athletic' ? 'Athletic Performance' : data.goal}
                    </p>
                  </div>
                  <button onClick={() => { setEditingFromReview(true); setStep(6); }} className="ml-3 px-3 py-1.5 text-xs font-medium text-[#00ff00] border border-[#00ff00]/30 rounded-lg hover:bg-[#00ff00]/10 transition-colors">
                    Edit
                  </button>
                </div>
                <div className="h-px bg-gray-800" />
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Training Split</p>
                    <p className="font-medium">
                      {data.split === 'ppl' ? 'Push Pull Legs' :
                       data.split === 'arnold' ? 'Arnold Split' :
                       data.split === 'bro' ? 'Bro Split' :
                       data.split === 'upper-lower' ? 'Upper/Lower' :
                       data.split === 'custom' ? 'Custom Split' : data.split}
                    </p>
                  </div>
                  <button onClick={() => { setEditingFromReview(true); setStep(7); }} className="ml-3 px-3 py-1.5 text-xs font-medium text-[#00ff00] border border-[#00ff00]/30 rounded-lg hover:bg-[#00ff00]/10 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!isStepValid()}
          className="w-full bg-[#00ff00] text-black font-bold py-4 rounded-2xl text-base hover:bg-[#00dd00] transition-all active:scale-[0.98] disabled:opacity-30 disabled:hover:bg-[#00ff00] disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {step === 8 ? 'Get Maxed' : editingFromReview ? 'Save & Back' : 'Continue'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
