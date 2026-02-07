import { X, Dumbbell, Clock, Calendar, Activity, Trophy } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import type { FeedItem } from '../types';

interface WorkoutDetailModalProps {
  item: FeedItem;
  onClose: () => void;
}

export function WorkoutDetailModal({ item, onClose }: WorkoutDetailModalProps) {
  const { user, workout, post } = item;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const gradients = [
    'from-purple-500 to-blue-500',
    'from-pink-500 to-orange-500',
    'from-green-500 to-teal-500',
    'from-yellow-500 to-red-500',
    'from-indigo-500 to-purple-500',
  ];

  const getGradient = (name: string) => {
    const idx = name.charCodeAt(0) % gradients.length;
    return gradients[idx];
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatWorkoutType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  // Compute total volume across all exercises
  const totalVolume = workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((exTotal, set) => {
      if (set.weightLbs && set.reps) {
        return exTotal + (set.weightLbs * set.reps);
      }
      return exTotal;
    }, 0);
  }, 0);

  const isCardioSet = (set: FeedItem['workout']['exercises'][0]['sets'][0]) => {
    return (set.durationMinutes !== null && set.durationMinutes !== undefined) ||
           (set.distanceMiles !== null && set.distanceMiles !== undefined);
  };

  const hasWeightSets = (exercise: FeedItem['workout']['exercises'][0]) => {
    return exercise.sets.some(s => s.weightLbs !== null || s.reps !== null);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            {user.avatarUrl ? (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                <ImageWithFallback src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(user.name)} flex items-center justify-center font-bold text-xs`}>
                {getInitials(user.name)}
              </div>
            )}
            <div>
              <h3 className="font-bold text-sm">{user.name}</h3>
              {user.username && <p className="text-xs text-gray-500">@{user.username}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Workout Type Badge & Date */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1.5 bg-[#00ff00]/10 text-[#00ff00] text-xs font-bold rounded-lg">
              {formatWorkoutType(workout.workoutType)}
            </span>
            <div className="text-right">
              <p className="text-xs text-gray-400">{formatDate(workout.startedAt)}</p>
              <p className="text-[10px] text-gray-600">{formatTime(workout.startedAt)}</p>
            </div>
          </div>

          {/* Caption */}
          {post.caption && (
            <div className="bg-[#0a0a0a] border-l-2 border-[#00ff00]/40 rounded-r-xl px-4 py-3 mb-5">
              <p className="text-sm text-gray-300 italic leading-relaxed">{post.caption}</p>
            </div>
          )}

          {/* Duration & Stats */}
          <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900 mb-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00ff00]/10 rounded-lg">
                  <Clock className="w-4 h-4 text-[#00ff00]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Duration</p>
                  <p className="text-sm font-bold">{workout.durationMinutes ?? '--'} min</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Exercises</p>
                  <p className="text-sm font-bold">{workout.exercises.length}</p>
                </div>
              </div>
              {totalVolume > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Volume</p>
                    <p className="text-sm font-bold">{totalVolume.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-3">
            {workout.exercises.map((exercise, idx) => {
              const exerciseVolume = exercise.sets.reduce((sum, s) => {
                if (s.weightLbs && s.reps) return sum + (s.weightLbs * s.reps);
                return sum;
              }, 0);
              const isCardio = !hasWeightSets(exercise) && exercise.sets.some(isCardioSet);

              return (
                <div key={idx} className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                  {/* Exercise Name */}
                  <div className="flex items-center gap-2 mb-3">
                    {isCardio ? (
                      <Activity className="w-4 h-4 text-[#00ff00]" />
                    ) : (
                      <Dumbbell className="w-4 h-4 text-[#00ff00]" />
                    )}
                    <h4 className="font-bold text-sm">{exercise.exerciseName}</h4>
                  </div>

                  {/* Sets */}
                  {isCardio ? (
                    <div className="space-y-2">
                      {exercise.sets.map((set, setIdx) => (
                        <div key={setIdx} className="flex items-center justify-between text-sm bg-black/30 rounded-xl px-3 py-2.5">
                          <span className="text-gray-500 font-medium">Set {set.setNumber}</span>
                          <div className="flex items-center gap-3">
                            {set.durationMinutes !== null && set.durationMinutes !== undefined && (
                              <span className="font-semibold">{set.durationMinutes} min</span>
                            )}
                            {set.distanceMiles !== null && set.distanceMiles !== undefined && (
                              <>
                                <span className="text-gray-600">|</span>
                                <span className="font-semibold">{set.distanceMiles} mi</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {exercise.sets.map((set, setIdx) => (
                          <div key={setIdx} className="flex items-center justify-between text-sm bg-black/30 rounded-xl px-3 py-2.5">
                            <span className="text-gray-500 font-medium">Set {set.setNumber}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">
                                {set.weightLbs !== null && set.weightLbs !== undefined && set.weightLbs > 0
                                  ? `${set.weightLbs} lbs`
                                  : 'Bodyweight'}
                              </span>
                              <span className="text-gray-600">&times;</span>
                              <span className="font-semibold">{set.reps ?? '--'} reps</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {exerciseVolume > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-900/50 flex items-center justify-between text-xs">
                          <span className="text-gray-500">Exercise Volume</span>
                          <span className="text-[#00ff00] font-semibold">{exerciseVolume.toLocaleString()} lbs</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total Volume Footer */}
          {totalVolume > 0 && (
            <div className="mt-5 bg-gradient-to-r from-[#00ff00]/10 to-[#00ff00]/5 border border-[#00ff00]/20 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#00ff00]" />
                <span className="font-semibold text-sm">Total Volume</span>
              </div>
              <span className="text-lg font-bold text-[#00ff00]">{totalVolume.toLocaleString()} lbs</span>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="p-5 border-t border-gray-900">
          <button
            onClick={onClose}
            className="w-full bg-[#00ff00] hover:bg-[#00dd00] text-black font-bold py-3 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
