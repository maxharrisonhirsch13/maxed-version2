import { useState } from 'react';
import { X, Settings, Sparkles, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ActiveWorkoutPageProps {
  onClose: () => void;
  muscleGroup?: string;
}

const exercisesByMuscleGroup: Record<string, Array<{
  id: number;
  name: string;
  muscleGroups: string;
  videoId: string;
  sets: number;
  aiSuggestion: { weight: number; reps: string };
}>> = {
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

export function ActiveWorkoutPage({ onClose, muscleGroup }: ActiveWorkoutPageProps) {
  const exerciseData = (muscleGroup && exercisesByMuscleGroup[muscleGroup]) || defaultExercises;
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState(exerciseData[0].aiSuggestion.weight);
  const [reps, setReps] = useState(8);
  const [completedSets, setCompletedSets] = useState<number[]>([]);

  const currentExercise = exerciseData[currentExerciseIndex];

  const handleLogSet = () => {
    setCompletedSets([...completedSets, currentSet]);
    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
    } else if (currentExerciseIndex < exerciseData.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setCompletedSets([]);
      setWeight(exerciseData[currentExerciseIndex + 1].aiSuggestion.weight);
      setReps(8);
    }
  };

  const handleUseAISuggestion = () => {
    setWeight(currentExercise.aiSuggestion.weight);
    const repRange = currentExercise.aiSuggestion.reps.split('-');
    setReps(parseInt(repRange[0]));
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setCurrentSet(1);
      setCompletedSets([]);
      setWeight(exerciseData[currentExerciseIndex - 1].aiSuggestion.weight);
      setReps(8);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exerciseData.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setCompletedSets([]);
      setWeight(exerciseData[currentExerciseIndex + 1].aiSuggestion.weight);
      setReps(8);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[96vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-b from-[#1a1a1a]/50 to-transparent backdrop-blur-sm">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors -ml-2 p-2 rounded-xl hover:bg-white/5"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">End</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className="font-bold text-base">{currentExercise.name}</h1>
            <p className="text-[10px] text-gray-500 text-center">{currentExerciseIndex + 1} of {exerciseData.length}</p>
          </div>

          <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
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

          <div className="px-5 pb-6 space-y-4">
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

            <div className="bg-[#00ff00]/5 rounded-2xl p-3.5 border border-[#00ff00]/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00ff00]" />
                    <span className="text-[11px] text-[#00ff00] font-semibold tracking-wide">AI RECOMMENDS</span>
                  </div>
                  <p className="text-xl font-bold">
                    {currentExercise.aiSuggestion.weight} lbs <span className="text-gray-600">×</span> {currentExercise.aiSuggestion.reps}
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">WEIGHT</label>
                <div className="bg-[#1a1a1a] rounded-2xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => setWeight(Math.max(0, weight - 5))}
                      className="w-9 h-9 bg-[#252525] hover:bg-[#333333] rounded-xl flex items-center justify-center transition-all active:scale-90"
                    >
                      <span className="text-xl font-bold text-gray-400">−</span>
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
                      <span className="text-xl font-bold text-gray-400">−</span>
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

            {exerciseData.length > 1 && (
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
                  {exerciseData.map((_, idx) => (
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
                  disabled={currentExerciseIndex === exerciseData.length - 1}
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
    </div>
  );
}
