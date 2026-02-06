import { X, Sparkles, Calendar, Trophy, Shuffle, Zap, Clock, SkipForward, Edit3, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { ActiveWorkoutPage } from './ActiveWorkoutPage';

interface WorkoutStartPageProps {
  onClose: () => void;
  muscleGroup?: string;
}

const workoutTemplates = [
  { type: 'ai', title: 'AI-Powered', subtitle: 'Personalized to your history and goals', icon: Sparkles, isRecommended: true },
  { type: 'standard', title: 'Standard Shoulders/Arms', subtitle: '6 exercises', icon: Calendar, isRecommended: false },
];

const celebrityWorkouts = [
  { id: 1, name: "Arnold's Shoulders & Arms", celebrity: 'Arnold Schwarzenegger', exercises: 6, difficulty: 'Advanced' },
  { id: 2, name: "Dwayne's Boulder Shoulders", celebrity: 'Dwayne Johnson', exercises: 8, difficulty: 'Advanced' },
];

const quickOptions = [
  { id: 1, title: 'Fewer Sets', subtitle: '3 sets each', icon: Zap },
  { id: 2, title: 'Quick Version', subtitle: '30 min', icon: Clock },
  { id: 3, title: 'Skip Today', subtitle: 'Mark rest', icon: SkipForward },
  { id: 4, title: 'Custom Build', subtitle: 'Describe workout', icon: Edit3 },
];

const thisWeekSchedule = [
  { day: 'Mon', workout: 'Push', completed: true, isToday: false },
  { day: 'Tue', workout: 'Pull', completed: true, isToday: false },
  { day: 'Wed', workout: 'Legs', completed: true, isToday: false },
  { day: 'Thu', workout: 'Shoulders', completed: false, isToday: true },
  { day: 'Fri', workout: 'Arms', completed: false, isToday: false },
  { day: 'Sat', workout: 'Back', completed: false, isToday: false },
  { day: 'Sun', workout: 'Rest', completed: false, isToday: false },
];

export function WorkoutStartPage({ onClose, muscleGroup }: WorkoutStartPageProps) {
  const [activeWorkout, setActiveWorkout] = useState(false);

  if (activeWorkout) {
    return <ActiveWorkoutPage onClose={onClose} muscleGroup={muscleGroup} />;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-y-auto pb-8">
      <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-gray-800 px-4 py-4 flex items-center justify-between z-10">
        <h1 className="text-xl font-bold">{muscleGroup}</h1>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="space-y-3">
          {workoutTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <button key={template.type} onClick={() => setActiveWorkout(true)} className={`w-full rounded-2xl p-4 flex items-center gap-4 transition-all hover:scale-[1.02] ${template.isRecommended ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-[#00ff00]/30' : 'bg-[#1a1a1a] hover:bg-[#252525]'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${template.isRecommended ? 'bg-[#00ff00]' : 'bg-[#252525]'}`}>
                  <Icon className={`w-6 h-6 ${template.isRecommended ? 'text-black' : 'text-white'}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold">{template.title}</h3>
                    {template.isRecommended && (<span className="px-2 py-0.5 bg-[#00ff00] text-black text-[10px] font-bold rounded-full">RECOMMENDED</span>)}
                  </div>
                  <p className="text-sm text-gray-400">{template.subtitle}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            );
          })}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-400">Celebrity Workouts</h2>
            <button className="flex items-center gap-1.5 text-[#00ff00] text-sm font-semibold hover:opacity-80 transition-opacity"><Shuffle className="w-4 h-4" /><span>Shuffle</span></button>
          </div>
          <div className="space-y-2">
            {celebrityWorkouts.map((workout) => (
              <button key={workout.id} onClick={() => setActiveWorkout(true)} className="w-full bg-[#1a1a1a] rounded-xl p-4 flex items-center gap-4 hover:bg-[#252525] transition-all hover:scale-[1.01]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center"><Trophy className="w-6 h-6 text-white" /></div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-sm mb-1">{workout.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{workout.celebrity}</span><span>•</span><span>{workout.exercises} exercises</span><span>•</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${workout.difficulty === 'Advanced' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{workout.difficulty}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-1">2 celebrity workouts available</p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-400 mb-3">Quick Options</h2>
          <div className="grid grid-cols-2 gap-2">
            {quickOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button key={option.id} className="bg-[#1a1a1a] rounded-xl p-4 flex flex-col items-start hover:bg-[#252525] transition-all hover:scale-[1.02]">
                  <Icon className="w-5 h-5 text-[#00ff00] mb-2" />
                  <h3 className="font-bold text-sm mb-0.5">{option.title}</h3>
                  <p className="text-xs text-gray-400">{option.subtitle}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-400 mb-3">This Week</h2>
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <div className="flex gap-2">
              {thisWeekSchedule.map((day) => (
                <div key={day.day} className="flex-1">
                  <div className={`rounded-lg p-2.5 text-center mb-1.5 ${day.completed ? 'bg-[#00ff00] text-black' : day.isToday ? 'bg-white text-black' : day.workout === 'Rest' ? 'bg-gray-800 text-gray-500' : 'bg-[#252525] text-gray-400'}`}>
                    <p className="text-[10px] font-bold mb-1">{day.day}</p>
                    <p className="text-[9px] opacity-80">{day.workout.slice(0, 4)}</p>
                  </div>
                  {day.completed && (<div className="text-center"><span className="text-[#00ff00] text-xs">✓</span></div>)}
                  {day.isToday && (<div className="text-center"><div className="w-1.5 h-1.5 bg-white rounded-full mx-auto"></div></div>)}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-2"><span className="text-gray-400">Weekly Progress</span><span className="font-semibold text-[#00ff00]">3/6 completed</span></div>
              <div className="w-full bg-[#252525] rounded-full h-2"><div className="bg-gradient-to-r from-[#00ff00] to-emerald-500 h-2 rounded-full transition-all" style={{ width: '50%' }}></div></div>
            </div>
          </div>
        </div>

        <button className="w-full bg-[#00ff00] text-black font-bold py-4 rounded-2xl text-base hover:bg-[#00dd00] transition-all active:scale-[0.98]" onClick={() => setActiveWorkout(true)}>Start Workout</button>
      </div>
    </div>
  );
}
