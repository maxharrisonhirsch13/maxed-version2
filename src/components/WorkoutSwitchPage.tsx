import { X, Dumbbell, Sparkles, ChevronRight, Loader2, Send, Heart, MapPin, Bike, Footprints, Waves, Mountain, CircleDot } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface WorkoutSwitchPageProps {
  onClose: () => void;
  onSelectWorkout: (type: string, details: any) => void;
  userSplit: string;
  customSplit?: { day: number; muscles: string[] }[];
  scheduledWorkout?: string;
}

export function WorkoutSwitchPage({ onClose, onSelectWorkout, userSplit, customSplit, scheduledWorkout }: WorkoutSwitchPageProps) {
  const { session } = useAuth();
  const [selectedMode, setSelectedMode] = useState<'split' | 'custom' | 'ai' | 'cardio' | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);

  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ name: string; description: string } | null>(null);

  // Cardio state
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const cardioActivities = [
    { id: 'outdoor-run', name: 'Outdoor Run', icon: MapPin, color: 'from-blue-500 to-cyan-500' },
    { id: 'walk', name: 'Walk', icon: Footprints, color: 'from-green-500 to-emerald-500' },
    { id: 'treadmill', name: 'Treadmill', icon: CircleDot, color: 'from-red-500 to-orange-500' },
    { id: 'bike', name: 'Bike Ride', icon: Bike, color: 'from-yellow-500 to-orange-500' },
    { id: 'swim', name: 'Swim', icon: Waves, color: 'from-cyan-500 to-blue-500' },
    { id: 'hike', name: 'Hike', icon: Mountain, color: 'from-emerald-500 to-green-600' },
  ];

  const getSplitDays = () => {
    if (userSplit === 'ppl') return ['Push (Chest, Shoulders, Triceps)', 'Pull (Back, Biceps)', 'Legs (Quads, Hamstrings, Calves)'];
    else if (userSplit === 'upper-lower') return ['Upper Body', 'Lower Body'];
    else if (userSplit === 'bro') return ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs'];
    else if (userSplit === 'arnold') return ['Chest & Back', 'Shoulders & Arms', 'Legs'];
    else if (userSplit === 'custom' && customSplit) return customSplit.map((day, idx) => `Day ${idx + 1}: ${day.muscles.join(', ')}`);
    return ['Full Body'];
  };

  const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Forearms'];

  const toggleMuscle = (muscle: string) => {
    if (selectedMuscles.includes(muscle)) setSelectedMuscles(selectedMuscles.filter(m => m !== muscle));
    else setSelectedMuscles([...selectedMuscles, muscle]);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || !session?.access_token) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: 'workout-from-prompt',
          prompt: aiPrompt,
          scheduledWorkout,
          userSplit,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.name) {
          setAiResult({ name: data.name, description: data.description || '' });
        }
      }
    } catch {
      // Fallback: parse keywords client-side
    }

    // Fallback if API didn't return a result
    if (!aiResult) {
      const lower = aiPrompt.toLowerCase();
      let name = 'Full Body';
      if (lower.includes('calisthenics') || lower.includes('bodyweight')) name = 'Calisthenics';
      else if (lower.includes('kettlebell')) name = 'Kettlebell';
      else if (lower.includes('chest')) name = 'Chest';
      else if (lower.includes('back')) name = 'Back';
      else if (lower.includes('shoulder')) name = 'Shoulders';
      else if (lower.includes('arm') || lower.includes('bicep') || lower.includes('tricep')) name = 'Arms';
      else if (lower.includes('leg') || lower.includes('squat')) name = 'Legs';
      else if (lower.includes('core') || lower.includes('ab') || lower.includes('stability')) name = 'Core';
      else if (lower.includes('push')) name = 'Push';
      else if (lower.includes('pull')) name = 'Pull';
      else if (lower.includes('upper')) name = 'Upper Body';
      else if (lower.includes('lower')) name = 'Lower Body';

      // Combine keywords for compound requests
      const keywords: string[] = [];
      if (lower.includes('calisthenics') || lower.includes('bodyweight')) keywords.push('Calisthenics');
      if (lower.includes('kettlebell')) keywords.push('Kettlebell');
      if (lower.includes('core') || lower.includes('stability') || lower.includes('ab')) keywords.push('Core');
      if (lower.includes('chest')) keywords.push('Chest');
      if (lower.includes('back')) keywords.push('Back');
      if (lower.includes('shoulder')) keywords.push('Shoulders');
      if (lower.includes('leg')) keywords.push('Legs');

      if (keywords.length > 1) name = keywords.join(' & ');

      setAiResult({ name, description: `Custom workout based on: "${aiPrompt}"` });
    }
    setAiLoading(false);
  };

  const handleContinue = () => {
    if (selectedMode === 'split' && selectedDay !== null) onSelectWorkout('split', { day: selectedDay, name: getSplitDays()[selectedDay] });
    else if (selectedMode === 'custom' && selectedMuscles.length > 0) onSelectWorkout('custom', { muscles: selectedMuscles });
    else if (selectedMode === 'ai' && aiResult) onSelectWorkout('ai', { name: aiResult.name });
    else if (selectedMode === 'cardio' && selectedActivity) {
      const activity = cardioActivities.find(a => a.id === selectedActivity);
      onSelectWorkout('cardio', { activity: selectedActivity, activityName: activity?.name || selectedActivity });
    }
  };

  const splitDays = getSplitDays();

  const quickSuggestions = [
    'Calisthenics focused with core stability',
    'Upper body hypertrophy',
    'Kettlebell full body burn',
    'Bodyweight only workout',
    'Light recovery day — mobility and stretching',
    'Chest and arms pump session',
  ];

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Switch Workout</h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>

        {!selectedMode && (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm mb-4">Choose how you want to train today</p>
            <button onClick={() => setSelectedMode('split')} className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-xl flex items-center justify-center"><Dumbbell className="w-6 h-6 text-black" /></div>
                <div className="text-left"><h3 className="font-bold mb-1">From Your Split</h3><p className="text-sm text-gray-400">Choose a day from your training split</p></div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button onClick={() => setSelectedMode('custom')} className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center"><Dumbbell className="w-6 h-6 text-white" /></div>
                <div className="text-left"><h3 className="font-bold mb-1">Custom Muscles</h3><p className="text-sm text-gray-400">Pick specific muscle groups</p></div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button onClick={() => setSelectedMode('ai')} className="w-full bg-gradient-to-br from-[#00ff00]/10 to-[#00cc00]/5 border border-[#00ff00]/20 hover:border-[#00ff00]/40 rounded-2xl p-5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00ff00] rounded-xl flex items-center justify-center"><Sparkles className="w-6 h-6 text-black" /></div>
                <div className="text-left"><h3 className="font-bold mb-1">Ask AI</h3><p className="text-sm text-gray-400">Describe the workout you want</p></div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#00ff00]" />
            </button>
            <button onClick={() => setSelectedMode('cardio')} className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center"><Heart className="w-6 h-6 text-white" /></div>
                <div className="text-left"><h3 className="font-bold mb-1">Cardio / Run</h3><p className="text-sm text-gray-400">Run, walk, bike, or log any cardio</p></div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        )}

        {selectedMode === 'split' && (
          <div className="space-y-3">
            <button onClick={() => setSelectedMode(null)} className="text-[#00ff00] text-sm mb-4 flex items-center gap-1">← Back</button>
            <p className="text-gray-400 text-sm mb-4">Select a training day</p>
            {splitDays.map((day, index) => (
              <button key={index} onClick={() => setSelectedDay(index)} className={`w-full rounded-2xl p-5 flex items-center justify-between transition-colors ${selectedDay === index ? 'bg-[#00ff00] text-black' : 'bg-[#1a1a1a] hover:bg-[#252525] text-white'}`}>
                <div className="text-left"><h3 className="font-bold">{day}</h3></div>
                {selectedDay === index && (<div className="w-6 h-6 bg-black rounded-full flex items-center justify-center"><span className="text-[#00ff00] text-sm">✓</span></div>)}
              </button>
            ))}
          </div>
        )}

        {selectedMode === 'custom' && (
          <div className="space-y-4">
            <button onClick={() => setSelectedMode(null)} className="text-[#00ff00] text-sm mb-2 flex items-center gap-1">← Back</button>
            <p className="text-gray-400 text-sm mb-4">Select muscle groups (tap to toggle)</p>
            <div className="grid grid-cols-2 gap-3">
              {muscleGroups.map((muscle) => (
                <button key={muscle} onClick={() => toggleMuscle(muscle)} className={`rounded-xl p-4 font-semibold transition-colors ${selectedMuscles.includes(muscle) ? 'bg-[#00ff00] text-black' : 'bg-[#1a1a1a] hover:bg-[#252525] text-white'}`}>{muscle}</button>
              ))}
            </div>
          </div>
        )}

        {selectedMode === 'ai' && (
          <div className="space-y-4">
            <button onClick={() => { setSelectedMode(null); setAiResult(null); setAiPrompt(''); }} className="text-[#00ff00] text-sm mb-2 flex items-center gap-1">← Back</button>

            <div className="bg-gradient-to-br from-[#00ff00]/10 to-[#00cc00]/5 border border-[#00ff00]/20 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-[#00ff00]" />
                <h3 className="font-bold">What kind of workout do you want?</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Describe your ideal workout and AI will build it for you.</p>

              {/* Text Input */}
              <div className="relative mb-3">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Calisthenics focused with core stability, or a hypertrophy arm day..."
                  className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff00] transition-colors resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiGenerate(); }
                  }}
                />
                <button
                  onClick={handleAiGenerate}
                  disabled={!aiPrompt.trim() || aiLoading}
                  className="absolute right-3 bottom-3 p-2 bg-[#00ff00] rounded-lg disabled:opacity-30 hover:bg-[#00dd00] transition-all active:scale-95"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 text-black animate-spin" /> : <Send className="w-4 h-4 text-black" />}
                </button>
              </div>

              {/* Quick Suggestions */}
              {!aiResult && !aiLoading && (
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setAiPrompt(suggestion); }}
                      className="text-xs bg-black/30 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* AI Loading */}
            {aiLoading && (
              <div className="bg-[#1a1a1a] rounded-2xl p-6 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-[#00ff00] animate-spin" />
                <p className="text-sm text-gray-400">Designing your workout...</p>
              </div>
            )}

            {/* AI Result */}
            {aiResult && !aiLoading && (
              <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#00ff00]/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#00ff00]" />
                  <span className="text-xs text-[#00ff00] font-semibold tracking-wide">AI GENERATED</span>
                </div>
                <h3 className="text-lg font-bold mb-1">{aiResult.name}</h3>
                {aiResult.description && <p className="text-sm text-gray-400 mb-3">{aiResult.description}</p>}
                <div className="bg-black/30 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Workout Focus</span>
                    <span className="text-[#00ff00] font-semibold">{aiResult.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setAiResult(null); setAiPrompt(''); }}
                  className="text-xs text-gray-500 hover:text-gray-300 mt-3 transition-colors"
                >
                  Try a different prompt →
                </button>
              </div>
            )}
          </div>
        )}

        {selectedMode === 'cardio' && (
          <div className="space-y-3">
            <button onClick={() => { setSelectedMode(null); setSelectedActivity(null); }} className="text-[#00ff00] text-sm mb-4 flex items-center gap-1">← Back</button>
            <p className="text-gray-400 text-sm mb-4">What type of cardio?</p>
            {cardioActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <button key={activity.id} onClick={() => setSelectedActivity(activity.id)} className={`w-full rounded-2xl p-5 flex items-center justify-between transition-colors ${selectedActivity === activity.id ? 'bg-gradient-to-br ' + activity.color + ' text-white' : 'bg-[#1a1a1a] hover:bg-[#252525] text-white'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${selectedActivity === activity.id ? 'bg-white/20' : 'bg-gradient-to-br ' + activity.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold">{activity.name}</h3>
                  </div>
                  {selectedActivity === activity.id && (<div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"><span className="text-white text-sm">✓</span></div>)}
                </button>
              );
            })}
          </div>
        )}

        {((selectedMode === 'split' && selectedDay !== null) || (selectedMode === 'custom' && selectedMuscles.length > 0) || (selectedMode === 'ai' && aiResult) || (selectedMode === 'cardio' && selectedActivity)) && (
          <button onClick={handleContinue} className="fixed bottom-6 left-4 right-4 bg-[#00ff00] text-black font-bold py-4 rounded-xl hover:bg-[#00cc00] transition-colors">Continue</button>
        )}
      </div>
    </div>
  );
}
