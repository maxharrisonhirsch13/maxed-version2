import { useState } from 'react';
import { X, Settings, Sparkles, ChevronLeft, ChevronRight, Check, Eye, EyeOff, RefreshCw, Plus, List, Search, Dumbbell } from 'lucide-react';

interface ActiveWorkoutPageProps {
  onClose: () => void;
  muscleGroup?: string;
}

interface Exercise {
  id: number;
  name: string;
  muscleGroups: string;
  videoId: string;
  sets: number;
  aiSuggestion: { weight: number; reps: string };
}

const exercisesByMuscleGroup: Record<string, Exercise[]> = {
  'Shoulders/Arms': [
    { id: 1, name: 'Overhead Press', muscleGroups: 'Shoulders • Triceps • Barbell', videoId: '2yjwXTZQDDI', sets: 4, aiSuggestion: { weight: 115, reps: '8-10' } },
    { id: 2, name: 'Lateral Raises', muscleGroups: 'Side Delts • Dumbbells', videoId: '3VcKaXpzqRo', sets: 4, aiSuggestion: { weight: 25, reps: '12-15' } },
    { id: 3, name: 'Barbell Curl', muscleGroups: 'Biceps • Barbell', videoId: 'kwG2ipFRgFo', sets: 4, aiSuggestion: { weight: 75, reps: '10-12' } },
    { id: 4, name: 'Tricep Pushdowns', muscleGroups: 'Triceps • Cable', videoId: '2-LAMcpzODU', sets: 4, aiSuggestion: { weight: 60, reps: '10-12' } },
    { id: 5, name: 'Face Pulls', muscleGroups: 'Rear Delts • Cable', videoId: 'rep-qVOkqgk', sets: 3, aiSuggestion: { weight: 40, reps: '15-20' } },
    { id: 6, name: 'Hammer Curls', muscleGroups: 'Biceps • Brachialis • Dumbbells', videoId: 'zC3nLlEvin4', sets: 3, aiSuggestion: { weight: 35, reps: '10-12' } },
  ],
  'Chest': [
    { id: 1, name: 'Bench Press', muscleGroups: 'Chest • Triceps • Barbell', videoId: 'rT7DgCr-3pg', sets: 4, aiSuggestion: { weight: 185, reps: '8-10' } },
    { id: 2, name: 'Incline Dumbbell Press', muscleGroups: 'Upper Chest • Dumbbells', videoId: '8iPEnn-ltC8', sets: 4, aiSuggestion: { weight: 70, reps: '10-12' } },
    { id: 3, name: 'Cable Flyes', muscleGroups: 'Chest • Cable', videoId: 'Iwe6AmxVf7o', sets: 3, aiSuggestion: { weight: 40, reps: '12-15' } },
    { id: 4, name: 'Dips', muscleGroups: 'Lower Chest • Triceps • Bodyweight', videoId: '2z8JmcrW-As', sets: 3, aiSuggestion: { weight: 0, reps: '10-15' } },
  ],
  'Back': [
    { id: 1, name: 'Deadlift', muscleGroups: 'Back • Hamstrings • Barbell', videoId: 'op9kVnSso6Q', sets: 5, aiSuggestion: { weight: 315, reps: '5-8' } },
    { id: 2, name: 'Barbell Rows', muscleGroups: 'Back • Biceps • Barbell', videoId: 'FWJR5Ve8bnQ', sets: 4, aiSuggestion: { weight: 155, reps: '8-10' } },
    { id: 3, name: 'Pull-ups', muscleGroups: 'Lats • Biceps • Bodyweight', videoId: 'eGo4IYlbE5g', sets: 4, aiSuggestion: { weight: 0, reps: '8-12' } },
    { id: 4, name: 'Lat Pulldown', muscleGroups: 'Lats • Cable', videoId: 'CAwf7n6Luuc', sets: 3, aiSuggestion: { weight: 140, reps: '10-12' } },
  ],
  'Legs': [
    { id: 1, name: 'Squat', muscleGroups: 'Quads • Glutes • Barbell', videoId: 'ultWZbUMPL8', sets: 5, aiSuggestion: { weight: 225, reps: '8-10' } },
    { id: 2, name: 'Romanian Deadlift', muscleGroups: 'Hamstrings • Glutes • Barbell', videoId: 'jEy_czb3RKA', sets: 4, aiSuggestion: { weight: 185, reps: '8-10' } },
    { id: 3, name: 'Leg Press', muscleGroups: 'Quads • Glutes • Machine', videoId: 'IZxyjW7MPJQ', sets: 4, aiSuggestion: { weight: 360, reps: '10-12' } },
    { id: 4, name: 'Leg Curls', muscleGroups: 'Hamstrings • Machine', videoId: '1Tq3QdYUuHs', sets: 3, aiSuggestion: { weight: 100, reps: '12-15' } },
    { id: 5, name: 'Calf Raises', muscleGroups: 'Calves • Machine', videoId: 'gwLzBJYoWlI', sets: 4, aiSuggestion: { weight: 150, reps: '15-20' } },
  ],
  'Push': [
    { id: 1, name: 'Bench Press', muscleGroups: 'Chest • Triceps • Barbell', videoId: 'rT7DgCr-3pg', sets: 4, aiSuggestion: { weight: 185, reps: '8-10' } },
    { id: 2, name: 'Overhead Press', muscleGroups: 'Shoulders • Triceps • Barbell', videoId: '2yjwXTZQDDI', sets: 4, aiSuggestion: { weight: 115, reps: '8-10' } },
    { id: 3, name: 'Incline Dumbbell Press', muscleGroups: 'Upper Chest • Dumbbells', videoId: '8iPEnn-ltC8', sets: 3, aiSuggestion: { weight: 70, reps: '10-12' } },
    { id: 4, name: 'Lateral Raises', muscleGroups: 'Side Delts • Dumbbells', videoId: '3VcKaXpzqRo', sets: 3, aiSuggestion: { weight: 25, reps: '12-15' } },
    { id: 5, name: 'Tricep Pushdowns', muscleGroups: 'Triceps • Cable', videoId: '2-LAMcpzODU', sets: 3, aiSuggestion: { weight: 60, reps: '10-12' } },
  ],
  'Pull': [
    { id: 1, name: 'Barbell Rows', muscleGroups: 'Back • Biceps • Barbell', videoId: 'FWJR5Ve8bnQ', sets: 4, aiSuggestion: { weight: 155, reps: '8-10' } },
    { id: 2, name: 'Pull-ups', muscleGroups: 'Lats • Biceps • Bodyweight', videoId: 'eGo4IYlbE5g', sets: 4, aiSuggestion: { weight: 0, reps: '8-12' } },
    { id: 3, name: 'Face Pulls', muscleGroups: 'Rear Delts • Cable', videoId: 'rep-qVOkqgk', sets: 3, aiSuggestion: { weight: 40, reps: '15-20' } },
    { id: 4, name: 'Barbell Curl', muscleGroups: 'Biceps • Barbell', videoId: 'kwG2ipFRgFo', sets: 3, aiSuggestion: { weight: 75, reps: '10-12' } },
    { id: 5, name: 'Hammer Curls', muscleGroups: 'Biceps • Brachialis • Dumbbells', videoId: 'zC3nLlEvin4', sets: 3, aiSuggestion: { weight: 35, reps: '10-12' } },
  ],
};

const defaultExercises = exercisesByMuscleGroup['Shoulders/Arms'];

// All exercises across all groups for the "Add from Library" feature
const allExercises: Exercise[] = Object.values(exercisesByMuscleGroup).flat().filter(
  (exercise, index, self) => self.findIndex(e => e.name === exercise.name) === index
);

export function ActiveWorkoutPage({ onClose, muscleGroup }: ActiveWorkoutPageProps) {
  const initialExercises = (muscleGroup && exercisesByMuscleGroup[muscleGroup]) || defaultExercises;
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState(initialExercises[0].aiSuggestion.weight);
  const [reps, setReps] = useState(8);
  const [completedSets, setCompletedSets] = useState<number[]>([]);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [logMode, setLogMode] = useState<'set' | 'bulk'>('set');
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'library' | 'custom' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Custom exercise form state
  const [customName, setCustomName] = useState('');
  const [customSets, setCustomSets] = useState(3);
  const [customWeight, setCustomWeight] = useState(0);
  const [customReps, setCustomReps] = useState('8-10');

  // Bulk log state
  const [bulkSets, setBulkSets] = useState<{ weight: number; reps: number }[]>([]);

  const currentExercise = exercises[currentExerciseIndex];

  const initBulkSets = () => {
    setBulkSets(
      Array.from({ length: currentExercise.sets }, () => ({
        weight: currentExercise.aiSuggestion.weight,
        reps: parseInt(currentExercise.aiSuggestion.reps.split('-')[0]),
      }))
    );
  };

  const handleLogSet = () => {
    setCompletedSets([...completedSets, currentSet]);
    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
    } else if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setCompletedSets([]);
      setWeight(exercises[currentExerciseIndex + 1].aiSuggestion.weight);
      setReps(8);
    }
  };

  const handleLogAllSets = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setCompletedSets([]);
      setWeight(exercises[currentExerciseIndex + 1].aiSuggestion.weight);
      setReps(8);
      initBulkSets();
    }
  };

  const handleUseAISuggestion = () => {
    setWeight(currentExercise.aiSuggestion.weight);
    const repRange = currentExercise.aiSuggestion.reps.split('-');
    setReps(parseInt(repRange[0]));
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      const newIdx = currentExerciseIndex - 1;
      setCurrentExerciseIndex(newIdx);
      setCurrentSet(1);
      setCompletedSets([]);
      setWeight(exercises[newIdx].aiSuggestion.weight);
      setReps(8);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      const newIdx = currentExerciseIndex + 1;
      setCurrentExerciseIndex(newIdx);
      setCurrentSet(1);
      setCompletedSets([]);
      setWeight(exercises[newIdx].aiSuggestion.weight);
      setReps(8);
    }
  };

  const handleSwapExercise = (newExercise: Exercise) => {
    const updated = [...exercises];
    updated[currentExerciseIndex] = newExercise;
    setExercises(updated);
    setCurrentSet(1);
    setCompletedSets([]);
    setWeight(newExercise.aiSuggestion.weight);
    setReps(parseInt(newExercise.aiSuggestion.reps.split('-')[0]));
    setShowSwapModal(false);
  };

  const handleAddExercise = (exercise: Exercise) => {
    setExercises([...exercises, exercise]);
    setShowAddModal(false);
    setAddMode(null);
    setSearchQuery('');
  };

  const handleAddCustomExercise = () => {
    if (!customName.trim()) return;
    const newExercise: Exercise = {
      id: Date.now(),
      name: customName.trim(),
      muscleGroups: 'Custom',
      videoId: '',
      sets: customSets,
      aiSuggestion: { weight: customWeight, reps: customReps },
    };
    setExercises([...exercises, newExercise]);
    setShowAddModal(false);
    setAddMode(null);
    setCustomName('');
    setCustomSets(3);
    setCustomWeight(0);
    setCustomReps('8-10');
  };

  // Get swap alternatives: same muscle group exercises not currently in the workout
  const getSwapAlternatives = () => {
    const currentNames = exercises.map(e => e.name);
    const alternatives: Exercise[] = [];
    // First add exercises from the same muscle group
    if (muscleGroup && exercisesByMuscleGroup[muscleGroup]) {
      alternatives.push(...exercisesByMuscleGroup[muscleGroup].filter(e => !currentNames.includes(e.name)));
    }
    // Then add from other groups
    for (const [group, groupExercises] of Object.entries(exercisesByMuscleGroup)) {
      if (group !== muscleGroup) {
        alternatives.push(...groupExercises.filter(e => !currentNames.includes(e.name) && !alternatives.find(a => a.name === e.name)));
      }
    }
    return alternatives;
  };

  const filteredLibraryExercises = allExercises.filter(e =>
    !exercises.find(ex => ex.name === e.name) &&
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[96vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-b from-[#1a1a1a]/50 to-transparent backdrop-blur-sm relative">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors -ml-2 p-2 rounded-xl hover:bg-white/5"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">End</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className="font-bold text-base">{currentExercise.name}</h1>
            <p className="text-[10px] text-gray-500 text-center">{currentExerciseIndex + 1} of {exercises.length}</p>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl transition-colors ${showSettings ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Settings Dropdown */}
        {showSettings && (
          <div className="mx-5 mb-2 bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => { setShowVideo(!showVideo); setShowSettings(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              {showVideo ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-[#00ff00]" />}
              <span className="text-sm font-medium flex-1 text-left">{showVideo ? 'Hide Video' : 'Show Video'}</span>
            </button>
            <div className="h-px bg-gray-800 mx-4" />
            <button
              onClick={() => { setShowSwapModal(true); setShowSettings(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium flex-1 text-left">Swap Exercise</span>
            </button>
            <div className="h-px bg-gray-800 mx-4" />
            <button
              onClick={() => { setShowAddModal(true); setShowSettings(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium flex-1 text-left">Add Exercise</span>
            </button>
            <div className="h-px bg-gray-800 mx-4" />
            <button
              onClick={() => {
                const newMode = logMode === 'set' ? 'bulk' : 'set';
                setLogMode(newMode);
                if (newMode === 'bulk') initBulkSets();
                setShowSettings(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <List className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium flex-1 text-left">
                {logMode === 'set' ? 'Log All at Once' : 'Log Set by Set'}
              </span>
              <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                {logMode === 'set' ? 'Set by Set' : 'Bulk'}
              </span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Video Section */}
          {showVideo && currentExercise.videoId && (
            <div className="px-5 pt-3 pb-4">
              <div className="aspect-[16/9] w-full relative overflow-hidden rounded-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${currentExercise.videoId}?autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0`}
                  className="absolute inset-0 w-full h-full bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="absolute top-3 left-3 bg-yellow-400 px-2.5 py-1 rounded-lg">
                  <span className="text-black text-[11px] font-bold">Form Check</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">{currentExercise.muscleGroups}</p>
            </div>
          )}

          {/* Muscle groups label when video hidden */}
          {(!showVideo || !currentExercise.videoId) && (
            <div className="px-5 pt-3 pb-2">
              <p className="text-xs text-gray-500 text-center">{currentExercise.muscleGroups}</p>
            </div>
          )}

          <div className="px-5 pb-6 space-y-4">
            {/* Set-by-Set Mode */}
            {logMode === 'set' && (
              <>
                {/* Set tracker circles */}
                <div className="flex items-center gap-2.5 justify-center">
                  {Array.from({ length: currentExercise.sets }).map((_, index) => {
                    const setNumber = index + 1;
                    const isCompleted = completedSets.includes(setNumber);
                    const isCurrent = setNumber === currentSet;

                    return (
                      <button
                        key={setNumber}
                        onClick={() => !isCompleted && setCurrentSet(setNumber)}
                        className={`relative w-11 h-11 rounded-full font-semibold text-sm transition-all ${
                          isCompleted
                            ? 'bg-[#00ff00] text-black scale-105'
                            : isCurrent
                            ? 'bg-white text-black scale-110 ring-2 ring-white/20 ring-offset-2 ring-offset-black'
                            : 'bg-[#1a1a1a] text-gray-500 hover:bg-[#252525] hover:text-gray-300'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 mx-auto" /> : setNumber}
                      </button>
                    );
                  })}
                </div>

                {/* AI Recommendation */}
                <div className="bg-[#00ff00]/5 rounded-2xl p-3.5 border border-[#00ff00]/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#00ff00]" />
                        <span className="text-[11px] text-[#00ff00] font-semibold tracking-wide">AI RECOMMENDS</span>
                      </div>
                      <p className="text-xl font-bold">
                        {currentExercise.aiSuggestion.weight} lbs <span className="text-gray-600">&times;</span> {currentExercise.aiSuggestion.reps}
                      </p>
                    </div>
                    <button
                      onClick={handleUseAISuggestion}
                      className="px-3.5 py-2 bg-[#00ff00] text-black rounded-xl font-semibold text-xs hover:bg-[#00dd00] transition-all active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Weight & Reps Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">WEIGHT</label>
                    <div className="bg-[#1a1a1a] rounded-2xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => setWeight(Math.max(0, weight - 5))}
                          className="w-9 h-9 bg-[#252525] hover:bg-[#333333] rounded-xl flex items-center justify-center transition-all active:scale-90"
                        >
                          <span className="text-xl font-bold text-gray-400">&minus;</span>
                        </button>
                        <div className="text-center">
                          <span className="text-2xl font-bold">{weight}</span>
                          <span className="text-xs text-gray-500 ml-1">lbs</span>
                        </div>
                        <button
                          onClick={() => setWeight(weight + 5)}
                          className="w-9 h-9 bg-[#252525] hover:bg-[#333333] rounded-xl flex items-center justify-center transition-all active:scale-90"
                        >
                          <span className="text-xl font-bold text-gray-400">+</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">REPS</label>
                    <div className="bg-[#1a1a1a] rounded-2xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => setReps(Math.max(1, reps - 1))}
                          className="w-9 h-9 bg-[#252525] hover:bg-[#333333] rounded-xl flex items-center justify-center transition-all active:scale-90"
                        >
                          <span className="text-xl font-bold text-gray-400">&minus;</span>
                        </button>
                        <div className="text-center">
                          <span className="text-2xl font-bold">{reps}</span>
                        </div>
                        <button
                          onClick={() => setReps(reps + 1)}
                          className="w-9 h-9 bg-[#252525] hover:bg-[#333333] rounded-xl flex items-center justify-center transition-all active:scale-90"
                        >
                          <span className="text-xl font-bold text-gray-400">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogSet}
                  className="w-full bg-[#00ff00] text-black font-bold py-3.5 rounded-2xl text-sm hover:bg-[#00dd00] transition-all active:scale-[0.97] flex items-center justify-center gap-2 shadow-lg shadow-[#00ff00]/20"
                >
                  <Check className="w-4 h-4" />
                  Complete Set {currentSet}
                </button>
              </>
            )}

            {/* Bulk Log Mode */}
            {logMode === 'bulk' && (
              <>
                <div className="bg-[#1a1a1a] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <List className="w-4 h-4 text-[#00ff00]" />
                    <span className="text-xs font-semibold text-[#00ff00]">BULK LOG MODE</span>
                  </div>

                  <div className="space-y-2">
                    {/* Header row */}
                    <div className="grid grid-cols-[40px_1fr_1fr] gap-2 text-[10px] text-gray-500 font-medium px-1">
                      <span>SET</span>
                      <span>WEIGHT (lbs)</span>
                      <span>REPS</span>
                    </div>

                    {bulkSets.map((set, idx) => (
                      <div key={idx} className="grid grid-cols-[40px_1fr_1fr] gap-2 items-center">
                        <span className="text-sm font-semibold text-gray-400 text-center">{idx + 1}</span>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => {
                            const updated = [...bulkSets];
                            updated[idx] = { ...updated[idx], weight: parseInt(e.target.value) || 0 };
                            setBulkSets(updated);
                          }}
                          className="bg-[#252525] rounded-xl px-3 py-2.5 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-[#00ff00] transition-all"
                        />
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => {
                            const updated = [...bulkSets];
                            updated[idx] = { ...updated[idx], reps: parseInt(e.target.value) || 0 };
                            setBulkSets(updated);
                          }}
                          className="bg-[#252525] rounded-xl px-3 py-2.5 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-[#00ff00] transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleLogAllSets}
                  className="w-full bg-[#00ff00] text-black font-bold py-3.5 rounded-2xl text-sm hover:bg-[#00dd00] transition-all active:scale-[0.97] flex items-center justify-center gap-2 shadow-lg shadow-[#00ff00]/20"
                >
                  <Check className="w-4 h-4" />
                  Complete All Sets
                </button>
              </>
            )}

            {/* Prev/Next Exercise Navigation */}
            {exercises.length > 1 && (
              <div className="flex items-center justify-between pt-1 px-1">
                <button
                  onClick={handlePreviousExercise}
                  disabled={currentExerciseIndex === 0}
                  className="flex items-center gap-1 text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 transition-colors text-xs font-medium"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex gap-1">
                  {exercises.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1 h-1 rounded-full transition-all ${
                        idx === currentExerciseIndex ? 'bg-[#00ff00] w-3' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNextExercise}
                  disabled={currentExerciseIndex === exercises.length - 1}
                  className="flex items-center gap-1 text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 transition-colors text-xs font-medium"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Swap Exercise Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div>
                <h2 className="font-bold text-lg">Swap Exercise</h2>
                <p className="text-xs text-gray-500 mt-0.5">Replace {currentExercise.name}</p>
              </div>
              <button
                onClick={() => setShowSwapModal(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {getSwapAlternatives().length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No alternative exercises available</p>
              ) : (
                getSwapAlternatives().map((exercise) => (
                  <button
                    key={exercise.name}
                    onClick={() => handleSwapExercise(exercise)}
                    className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-4 flex items-center gap-3 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-[#252525] rounded-xl flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-[#00ff00]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{exercise.name}</p>
                      <p className="text-xs text-gray-500">{exercise.muscleGroups}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{exercise.sets} sets</p>
                      <p className="text-[10px] text-gray-600">{exercise.aiSuggestion.reps} reps</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="font-bold text-lg">
                {addMode === 'library' ? 'Exercise Library' : addMode === 'custom' ? 'Custom Exercise' : 'Add Exercise'}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setAddMode(null); setSearchQuery(''); }}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Mode Selection */}
              {!addMode && (
                <div className="space-y-3">
                  <button
                    onClick={() => setAddMode('library')}
                    className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-4 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-10 h-10 bg-[#00ff00]/10 rounded-xl flex items-center justify-center">
                      <Search className="w-5 h-5 text-[#00ff00]" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">From Library</p>
                      <p className="text-xs text-gray-500">Browse all exercises</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setAddMode('custom')}
                    className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-4 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-10 h-10 bg-[#00ff00]/10 rounded-xl flex items-center justify-center">
                      <Plus className="w-5 h-5 text-[#00ff00]" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Custom Exercise</p>
                      <p className="text-xs text-gray-500">Add one that's not in the library</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Library Browse */}
              {addMode === 'library' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search exercises..."
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff00] transition-colors"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    {filteredLibraryExercises.map((exercise) => (
                      <button
                        key={exercise.name}
                        onClick={() => handleAddExercise(exercise)}
                        className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-4 flex items-center gap-3 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-[#252525] rounded-xl flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-[#00ff00]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{exercise.name}</p>
                          <p className="text-xs text-gray-500">{exercise.muscleGroups}</p>
                        </div>
                        <Plus className="w-4 h-4 text-gray-500" />
                      </button>
                    ))}
                    {filteredLibraryExercises.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-6">No exercises found</p>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Exercise Form */}
              {addMode === 'custom' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">EXERCISE NAME</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Cable Lateral Raise"
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff00] transition-colors"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">SETS</label>
                      <input
                        type="number"
                        value={customSets}
                        onChange={(e) => setCustomSets(parseInt(e.target.value) || 1)}
                        min={1}
                        max={10}
                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-3 py-3 text-sm text-white text-center focus:outline-none focus:border-[#00ff00] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">WEIGHT</label>
                      <input
                        type="number"
                        value={customWeight}
                        onChange={(e) => setCustomWeight(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-3 py-3 text-sm text-white text-center focus:outline-none focus:border-[#00ff00] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">REPS</label>
                      <input
                        type="text"
                        value={customReps}
                        onChange={(e) => setCustomReps(e.target.value)}
                        placeholder="8-10"
                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-3 py-3 text-sm text-white text-center focus:outline-none focus:border-[#00ff00] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddCustomExercise}
                    disabled={!customName.trim()}
                    className="w-full bg-[#00ff00] text-black font-bold py-3.5 rounded-2xl text-sm hover:bg-[#00dd00] transition-all active:scale-[0.97] disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Exercise
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
