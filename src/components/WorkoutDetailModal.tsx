import { X, Dumbbell, Clock, Calendar, Activity } from 'lucide-react';

interface WorkoutLog {
  date: string;
  startTime: string;
  duration: number;
  workoutType: string;
  exercises: {
    name: string;
    sets: { weight: number; reps: number; }[];
    cardioData?: { duration: number; distance?: number; speed?: number; incline?: number; calories?: number; };
  }[];
}

interface WorkoutDetailModalProps {
  workout: WorkoutLog;
  onClose: () => void;
}

export function WorkoutDetailModal({ workout, onClose }: WorkoutDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
          <div><h3 className="font-bold text-lg">{workout.workoutType}</h3><p className="text-xs text-gray-500 mt-0.5">{workout.date}</p></div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900 mb-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3"><div className="p-2 bg-[#00ff00]/10 rounded-lg"><Clock className="w-4 h-4 text-[#00ff00]" /></div><div><p className="text-[10px] text-gray-500">Duration</p><p className="text-sm font-bold">{workout.duration} min</p></div></div>
              <div className="flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg"><Calendar className="w-4 h-4 text-blue-400" /></div><div><p className="text-[10px] text-gray-500">Start Time</p><p className="text-sm font-bold">{workout.startTime}</p></div></div>
            </div>
          </div>
          <div className="space-y-3">
            {workout.exercises.map((exercise, idx) => (
              <div key={idx} className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                <div className="flex items-center gap-2 mb-3">{exercise.cardioData ? (<Activity className="w-4 h-4 text-[#00ff00]" />) : (<Dumbbell className="w-4 h-4 text-[#00ff00]" />)}<h4 className="font-bold text-sm">{exercise.name}</h4></div>
                {exercise.cardioData ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/30 rounded-xl px-3 py-2.5"><p className="text-[10px] text-gray-500 mb-1">Duration</p><p className="text-sm font-bold">{exercise.cardioData.duration} min</p></div>
                      {exercise.cardioData.distance && (<div className="bg-black/30 rounded-xl px-3 py-2.5"><p className="text-[10px] text-gray-500 mb-1">Distance</p><p className="text-sm font-bold">{exercise.cardioData.distance} mi</p></div>)}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {exercise.cardioData.speed !== undefined && (<div className="bg-black/30 rounded-xl px-3 py-2.5"><p className="text-[10px] text-gray-500 mb-1">Speed</p><p className="text-sm font-bold">{exercise.cardioData.speed} mph</p></div>)}
                      {exercise.cardioData.incline !== undefined && (<div className="bg-black/30 rounded-xl px-3 py-2.5"><p className="text-[10px] text-gray-500 mb-1">Incline</p><p className="text-sm font-bold">{exercise.cardioData.incline}%</p></div>)}
                    </div>
                    {exercise.cardioData.calories && (<div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl px-3 py-2.5"><p className="text-[10px] text-gray-400 mb-1">Calories Burned</p><p className="text-sm font-bold text-orange-400">{exercise.cardioData.calories} cal</p></div>)}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {exercise.sets.map((set, setIdx) => (
                        <div key={setIdx} className="flex items-center justify-between text-sm bg-black/30 rounded-xl px-3 py-2.5">
                          <span className="text-gray-500 font-medium">Set {setIdx + 1}</span>
                          <div className="flex items-center gap-3"><span className="font-semibold">{set.weight > 0 ? `${set.weight} lbs` : 'Bodyweight'}</span><span className="text-gray-600">×</span><span className="font-semibold">{set.reps} reps</span></div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-900/50 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Total Volume</span>
                      <span className="text-[#00ff00] font-semibold">{exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0).toLocaleString()} lbs</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-5 border-t border-gray-900">
          <button onClick={onClose} className="w-full bg-[#00ff00] hover:bg-[#00dd00] text-black font-bold py-3 rounded-xl transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}