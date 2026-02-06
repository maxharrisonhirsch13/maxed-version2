import { X, Sparkles, Calendar, Trophy, Shuffle, Zap, Clock, SkipForward, Edit3, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { ActiveWorkoutPage } from './ActiveWorkoutPage';

interface WorkoutStartPageProps {
  onClose: () => void;
  muscleGroup?: string;
}

interface CelebrityWorkout {
  id: number;
  name: string;
  celebrity: string;
  exercises: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Celebrity workouts organized by muscle group
const celebrityWorkoutsByGroup: Record<string, CelebrityWorkout[]> = {
  Chest: [
    { id: 101, name: "Arnold's Classic Chest Blast", celebrity: 'Arnold Schwarzenegger', exercises: 6, difficulty: 'Advanced' },
    { id: 102, name: "The Rock's Chest Day", celebrity: 'Dwayne Johnson', exercises: 7, difficulty: 'Advanced' },
    { id: 103, name: "Hemsworth's Chest & Power", celebrity: 'Chris Hemsworth', exercises: 5, difficulty: 'Intermediate' },
  ],
  Back: [
    { id: 201, name: "Ronnie Coleman's Back Width", celebrity: 'Ronnie Coleman', exercises: 7, difficulty: 'Advanced' },
    { id: 202, name: "Arnold's Back Double", celebrity: 'Arnold Schwarzenegger', exercises: 6, difficulty: 'Advanced' },
    { id: 203, name: "CBum's Classic Back", celebrity: 'Chris Bumstead', exercises: 6, difficulty: 'Advanced' },
  ],
  Shoulders: [
    { id: 301, name: "Arnold's Boulder Shoulders", celebrity: 'Arnold Schwarzenegger', exercises: 6, difficulty: 'Advanced' },
    { id: 302, name: "The Rock's Shoulder Blitz", celebrity: 'Dwayne Johnson', exercises: 8, difficulty: 'Advanced' },
    { id: 303, name: "CBum's Classic Delts", celebrity: 'Chris Bumstead', exercises: 5, difficulty: 'Advanced' },
  ],
  Biceps: [
    { id: 401, name: "Arnold's 21s Arm Superset", celebrity: 'Arnold Schwarzenegger', exercises: 5, difficulty: 'Advanced' },
    { id: 402, name: "CBum's Bicep Pump", celebrity: 'Chris Bumstead', exercises: 4, difficulty: 'Intermediate' },
  ],
  Triceps: [
    { id: 501, name: "Larry Wheels' Tricep Blowout", celebrity: 'Larry Wheels', exercises: 5, difficulty: 'Advanced' },
    { id: 502, name: "The Rock's Tricep Finisher", celebrity: 'Dwayne Johnson', exercises: 4, difficulty: 'Advanced' },
  ],
  Arms: [
    { id: 601, name: "Arnold's 21s Arm Day", celebrity: 'Arnold Schwarzenegger', exercises: 6, difficulty: 'Advanced' },
    { id: 602, name: "CBum's Arm Pump", celebrity: 'Chris Bumstead', exercises: 8, difficulty: 'Intermediate' },
    { id: 603, name: "Larry Wheels' Arm Superset", celebrity: 'Larry Wheels', exercises: 6, difficulty: 'Advanced' },
  ],
  Legs: [
    { id: 701, name: "Tom Platz's Leg Destroyer", celebrity: 'Tom Platz', exercises: 6, difficulty: 'Advanced' },
    { id: 702, name: "Ronnie Coleman's Leg Day", celebrity: 'Ronnie Coleman', exercises: 7, difficulty: 'Advanced' },
    { id: 703, name: "The Rock's Leg Workout", celebrity: 'Dwayne Johnson', exercises: 8, difficulty: 'Advanced' },
  ],
  Core: [
    { id: 801, name: "Bruce Lee's Core Routine", celebrity: 'Bruce Lee', exercises: 6, difficulty: 'Intermediate' },
    { id: 802, name: "The Rock's Ab Finisher", celebrity: 'Dwayne Johnson', exercises: 4, difficulty: 'Intermediate' },
  ],
  Push: [
    { id: 901, name: "Arnold's Push Power", celebrity: 'Arnold Schwarzenegger', exercises: 8, difficulty: 'Advanced' },
    { id: 902, name: "Hemsworth's Push Day", celebrity: 'Chris Hemsworth', exercises: 6, difficulty: 'Intermediate' },
    { id: 903, name: "CBum's Push Routine", celebrity: 'Chris Bumstead', exercises: 7, difficulty: 'Advanced' },
  ],
  Pull: [
    { id: 1001, name: "Ronnie Coleman's Pull Routine", celebrity: 'Ronnie Coleman', exercises: 7, difficulty: 'Advanced' },
    { id: 1002, name: "Dorian Yates' Blood & Guts Pull", celebrity: 'Dorian Yates', exercises: 5, difficulty: 'Advanced' },
    { id: 1003, name: "CBum's Pull Day", celebrity: 'Chris Bumstead', exercises: 6, difficulty: 'Advanced' },
  ],
  'Upper Body': [
    { id: 1101, name: "Arnold's Upper Body Classic", celebrity: 'Arnold Schwarzenegger', exercises: 8, difficulty: 'Advanced' },
    { id: 1102, name: "The Rock's Upper Body Power", celebrity: 'Dwayne Johnson', exercises: 7, difficulty: 'Advanced' },
  ],
  'Lower Body': [
    { id: 1201, name: "Tom Platz's Leg Destroyer", celebrity: 'Tom Platz', exercises: 6, difficulty: 'Advanced' },
    { id: 1202, name: "Ronnie Coleman's Leg Day", celebrity: 'Ronnie Coleman', exercises: 7, difficulty: 'Advanced' },
  ],
  'Full Body': [
    { id: 1301, name: "The Rock's Full Body Circuit", celebrity: 'Dwayne Johnson', exercises: 10, difficulty: 'Advanced' },
    { id: 1302, name: "Hemsworth's Total Body", celebrity: 'Chris Hemsworth', exercises: 8, difficulty: 'Intermediate' },
  ],
};

// Match celebrity workouts to a muscle group string using keywords
function getCelebrityWorkouts(muscleGroup?: string): CelebrityWorkout[] {
  if (!muscleGroup) return celebrityWorkoutsByGroup['Full Body'];
  const lower = muscleGroup.toLowerCase();

  // Direct match first
  for (const key of Object.keys(celebrityWorkoutsByGroup)) {
    if (lower === key.toLowerCase()) return celebrityWorkoutsByGroup[key];
  }

  // Keyword matching for compound names like "Chest & Back", "Shoulders & Arms", "Push (Chest, ...)"
  const keywordMap: Record<string, string> = {
    'chest': 'Chest', 'back': 'Back', 'shoulders': 'Shoulders', 'shoulder': 'Shoulders',
    'biceps': 'Biceps', 'bicep': 'Biceps', 'triceps': 'Triceps', 'tricep': 'Triceps',
    'arms': 'Arms', 'arm': 'Arms', 'legs': 'Legs', 'leg': 'Legs',
    'quads': 'Legs', 'hamstrings': 'Legs', 'glutes': 'Legs', 'calves': 'Legs',
    'core': 'Core', 'abs': 'Core',
    'push': 'Push', 'pull': 'Pull',
    'upper': 'Upper Body', 'lower': 'Lower Body', 'full': 'Full Body',
  };

  const matched = new Set<string>();
  for (const [keyword, group] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) matched.add(group);
  }

  // Collect workouts from all matched groups, dedup by id
  const results: CelebrityWorkout[] = [];
  const seenIds = new Set<number>();
  for (const group of matched) {
    for (const w of celebrityWorkoutsByGroup[group] || []) {
      if (!seenIds.has(w.id)) {
        seenIds.add(w.id);
        results.push(w);
      }
    }
  }

  // If compound match found lots, limit to 3
  if (results.length > 0) return results.slice(0, 3);

  return celebrityWorkoutsByGroup['Full Body'];
}

function getWorkoutTemplates(muscleGroup?: string) {
  return [
    { type: 'ai', title: 'AI-Powered', subtitle: 'Personalized to your history and goals', icon: Sparkles, isRecommended: true },
    { type: 'standard', title: `Standard ${muscleGroup || 'Workout'}`, subtitle: '6 exercises', icon: Calendar, isRecommended: false },
  ];
}

const quickOptions = [
  { id: 1, title: 'Fewer Sets', subtitle: '3 sets each', icon: Zap },
  { id: 2, title: 'Quick Version', subtitle: '30 min', icon: Clock },
  { id: 3, title: 'Skip Today', subtitle: 'Mark rest', icon: SkipForward },
  { id: 4, title: 'Custom Build', subtitle: 'Describe workout', icon: Edit3 },
];

export function WorkoutStartPage({ onClose, muscleGroup }: WorkoutStartPageProps) {
  const [activeWorkout, setActiveWorkout] = useState(false);
  const matchedCelebrityWorkouts = getCelebrityWorkouts(muscleGroup);

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
          {getWorkoutTemplates(muscleGroup).map((template) => {
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
            {matchedCelebrityWorkouts.map((workout) => (
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
          <p className="text-xs text-gray-500 mt-2 ml-1">{matchedCelebrityWorkouts.length} celebrity workout{matchedCelebrityWorkouts.length !== 1 ? 's' : ''} available</p>
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

        <button className="w-full bg-[#00ff00] text-black font-bold py-4 rounded-2xl text-base hover:bg-[#00dd00] transition-all active:scale-[0.98]" onClick={() => setActiveWorkout(true)}>Start Workout</button>
      </div>
    </div>
  );
}
