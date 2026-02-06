import { X, Dumbbell, Sparkles, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface WorkoutSwitchPageProps {
  onClose: () => void;
  onSelectWorkout: (type: string, details: any) => void;
  userSplit: string;
  customSplit?: { day: number; muscles: string[] }[];
}

export function WorkoutSwitchPage({ onClose, onSelectWorkout, userSplit, customSplit }: WorkoutSwitchPageProps) {
  const [selectedMode, setSelectedMode] = useState<'split' | 'custom' | 'ai' | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);

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

  const handleContinue = () => {
    if (selectedMode === 'split' && selectedDay !== null) onSelectWorkout('split', { day: selectedDay, name: getSplitDays()[selectedDay] });
    else if (selectedMode === 'custom' && selectedMuscles.length > 0) onSelectWorkout('custom', { muscles: selectedMuscles });
    else if (selectedMode === 'ai') onSelectWorkout('ai', {});
  };

  const splitDays = getSplitDays();

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
                <div className="text-left"><h3 className="font-bold mb-1">Ask AI</h3><p className="text-sm text-gray-400">Let AI suggest the best workout</p></div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#00ff00]" />
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
            <button onClick={() => setSelectedMode(null)} className="text-[#00ff00] text-sm mb-2 flex items-center gap-1">← Back</button>
            <div className="bg-gradient-to-br from-[#00ff00]/10 to-[#00cc00]/5 border border-[#00ff00]/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#00ff00] rounded-xl flex items-center justify-center"><Sparkles className="w-6 h-6 text-black" /></div>
                <h3 className="text-xl font-bold">AI Workout Suggestion</h3>
              </div>
              <p className="text-gray-300 mb-4">Based on your recent training history, recovery metrics, and split schedule, I recommend focusing on <span className="text-[#00ff00] font-semibold">Pull Day (Back & Biceps)</span> today.</p>
              <div className="bg-black/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-sm"><span className="text-gray-400">Readiness Score</span><span className="text-[#00ff00] font-semibold">94/100</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-gray-400">Last Pull Session</span><span className="text-white font-semibold">4 days ago</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-gray-400">Optimal Volume</span><span className="text-white font-semibold">18-22 sets</span></div>
              </div>
            </div>
          </div>
        )}

        {((selectedMode === 'split' && selectedDay !== null) || (selectedMode === 'custom' && selectedMuscles.length > 0) || selectedMode === 'ai') && (
          <button onClick={handleContinue} className="fixed bottom-6 left-4 right-4 bg-[#00ff00] text-black font-bold py-4 rounded-xl hover:bg-[#00cc00] transition-colors">Continue</button>
        )}
      </div>
    </div>
  );
}
