import { useState } from 'react';
import { TrendingUp, Sparkles, ChevronRight, Calendar, Target, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PRExplanationModal } from './PRExplanationModal';
import { SchedulePRModal } from './SchedulePRModal';
import { PRPlanModal } from './PRPlanModal';

const muscleGroups = [
  { id: 'chest', name: 'Chest' },
  { id: 'back', name: 'Back' },
  { id: 'shoulders', name: 'Shoulders' },
  { id: 'arms', name: 'Arms' },
  { id: 'legs', name: 'Legs' },
  { id: 'core', name: 'Core' },
];

const exercisesByMuscle: Record<string, Array<{name: string, currentPR: string, unit: string}>> = {
  chest: [
    { name: 'Bench Press', currentPR: '225', unit: 'lbs' },
    { name: 'Incline Press', currentPR: '185', unit: 'lbs' },
    { name: 'Dumbbell Flyes', currentPR: '70', unit: 'lbs' },
    { name: 'Cable Crossover', currentPR: '120', unit: 'lbs' },
  ],
  back: [
    { name: 'Deadlift', currentPR: '315', unit: 'lbs' },
    { name: 'Pull-ups', currentPR: '15', unit: 'reps' },
    { name: 'Barbell Row', currentPR: '185', unit: 'lbs' },
    { name: 'Lat Pulldown', currentPR: '160', unit: 'lbs' },
  ],
  shoulders: [
    { name: 'Overhead Press', currentPR: '135', unit: 'lbs' },
    { name: 'Lateral Raises', currentPR: '40', unit: 'lbs' },
    { name: 'Face Pulls', currentPR: '90', unit: 'lbs' },
  ],
  arms: [
    { name: 'Barbell Curl', currentPR: '95', unit: 'lbs' },
    { name: 'Tricep Dips', currentPR: '12', unit: 'reps' },
    { name: 'Hammer Curls', currentPR: '50', unit: 'lbs' },
  ],
  legs: [
    { name: 'Squat', currentPR: '275', unit: 'lbs' },
    { name: 'Leg Press', currentPR: '420', unit: 'lbs' },
    { name: 'Romanian Deadlift', currentPR: '225', unit: 'lbs' },
  ],
  core: [
    { name: 'Plank', currentPR: '3:45', unit: 'min' },
    { name: 'Ab Wheel', currentPR: '25', unit: 'reps' },
    { name: 'Hanging Leg Raise', currentPR: '18', unit: 'reps' },
  ],
};

const weeklyData = [
  { week: 'W1', weight: 205, volume: 4100 },
  { week: 'W2', weight: 210, volume: 4400 },
  { week: 'W3', weight: 215, volume: 4600 },
  { week: 'W4', weight: 215, volume: 4500 },
  { week: 'W5', weight: 220, volume: 4800 },
  { week: 'W6', weight: 225, volume: 5100 },
];

const monthlyData = [
  { month: 'Oct', weight: 195, volume: 16200 },
  { month: 'Nov', weight: 210, volume: 18400 },
  { month: 'Dec', weight: 215, volume: 18800 },
  { month: 'Jan', weight: 220, volume: 19600 },
  { month: 'Feb', weight: 225, volume: 20400 },
];

const yearlyData = [
  { year: '2023', weight: 185, volume: 180000 },
  { year: '2024', weight: 205, volume: 210000 },
  { year: '2025', weight: 220, volume: 238000 },
  { year: '2026', weight: 225, volume: 40800 },
];

export function ProgressPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<string>('chest');
  const [selectedExercise, setSelectedExercise] = useState<string>('Bench Press');
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('week');
  const [showPRExplanation, setShowPRExplanation] = useState(false);
  const [showSchedulePR, setShowSchedulePR] = useState(false);
  const [showPRPlan, setShowPRPlan] = useState(false);

  const currentData = timePeriod === 'week' ? weeklyData : timePeriod === 'month' ? monthlyData : yearlyData;
  const exercises = exercisesByMuscle[selectedMuscle] || [];
  const currentExercise = exercises.find(e => e.name === selectedExercise) || exercises[0];

  return (
    <div className="min-h-screen bg-black text-white pb-8">
      {/* Header */}
      <header className="px-4 pt-safe pt-8 pb-3">
        <h1 className="text-xl font-bold">Progress</h1>
      </header>

      <main className="px-4 space-y-3">
        {/* AI Prediction Card */}
        <button 
          onClick={() => setShowPRExplanation(true)}
          className="w-full bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-2xl p-4 border border-purple-500/20 hover:from-purple-900/50 hover:to-blue-900/50 transition-all text-left"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-purple-300 text-xs font-semibold">AI PREDICTION</p>
                <span className="text-purple-300 text-[10px] font-semibold">Learn More →</span>
              </div>
              <h3 className="font-bold text-base mb-1">Ready for New PR!</h3>
              <p className="text-gray-300 text-xs">Based on your progressive overload, you're ready to attempt a new bench press PR</p>
            </div>
          </div>
          
          <div className="bg-black/30 rounded-xl p-3 mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-xs">Current PR</span>
              <span className="text-white font-bold">225 lbs</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-xs">Predicted PR</span>
              <span className="text-[#00ff00] font-bold">235 lbs</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Confidence</span>
              <span className="text-purple-300 font-semibold text-sm">87%</span>
            </div>
          </div>

          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowSchedulePR(true)}
              className="flex-1 bg-white text-black font-semibold py-2 rounded-lg text-xs hover:bg-gray-100 transition-colors"
            >
              Schedule Attempt
            </button>
            <button 
              onClick={() => setShowPRPlan(true)}
              className="px-4 bg-purple-500/20 text-purple-300 font-semibold py-2 rounded-lg text-xs hover:bg-purple-500/30 transition-colors"
            >
              View Plan
            </button>
          </div>
        </button>

        {/* AI Insights */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-400">AI Insights</h3>
          
          <div className="bg-[#1a1a1a] rounded-xl p-3 flex items-start gap-3">
            <div className="p-1.5 bg-green-500/20 rounded-lg mt-0.5">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-xs mb-0.5">Volume Trending Up</p>
              <p className="text-gray-400 text-xs">Your weekly volume increased 24% this month. Keep it up!</p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-3 flex items-start gap-3">
            <div className="p-1.5 bg-blue-500/20 rounded-lg mt-0.5">
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-xs mb-0.5">Optimal Recovery Window</p>
              <p className="text-gray-400 text-xs">Your chest is fully recovered. Best time to train is tomorrow morning.</p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-3 flex items-start gap-3">
            <div className="p-1.5 bg-orange-500/20 rounded-lg mt-0.5">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-xs mb-0.5">Strength Imbalance Detected</p>
              <p className="text-gray-400 text-xs">Your left side is 8% weaker. Try unilateral exercises.</p>
            </div>
          </div>
        </div>

        {/* Muscle Groups */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-2">Muscle Groups</h3>
          <div className="grid grid-cols-3 gap-2">
            {muscleGroups.map((muscle) => {
              return (
                <button
                  key={muscle.id}
                  onClick={() => {
                    setSelectedMuscle(muscle.id);
                    setSelectedExercise(exercisesByMuscle[muscle.id][0].name);
                  }}
                  className={`rounded-xl p-4 flex items-center justify-center transition-all ${
                    selectedMuscle === muscle.id
                      ? 'bg-[#00ff00] text-black'
                      : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'
                  }`}
                >
                  <span className="text-sm font-bold">{muscle.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Exercises List */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-2">Exercises</h3>
          <div className="space-y-2">
            {exercises.map((exercise) => (
              <button
                key={exercise.name}
                onClick={() => setSelectedExercise(exercise.name)}
                className={`w-full rounded-xl p-3 flex items-center justify-between transition-all ${
                  selectedExercise === exercise.name
                    ? 'bg-[#00ff00]/10 border border-[#00ff00]/30'
                    : 'bg-[#1a1a1a] hover:bg-[#252525]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                    selectedExercise === exercise.name ? 'bg-[#00ff00] text-black' : 'bg-[#252525] text-gray-400'
                  }`}>
                    {exercise.currentPR}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-xs">{exercise.name}</p>
                    <p className="text-gray-400 text-[10px]">Current PR • {exercise.unit}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedExercise === exercise.name ? 'text-[#00ff00]' : 'text-gray-500'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Time Period Selector */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-2">Progress Chart</h3>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setTimePeriod('week')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                timePeriod === 'week'
                  ? 'bg-[#00ff00] text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimePeriod('month')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                timePeriod === 'month'
                  ? 'bg-[#00ff00] text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimePeriod('year')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                timePeriod === 'year'
                  ? 'bg-[#00ff00] text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'
              }`}
            >
              Year
            </button>
          </div>

          {/* Chart */}
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <div className="mb-3">
              <p className="text-gray-400 text-xs mb-1">{selectedExercise}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{currentExercise?.currentPR}</span>
                <span className="text-sm text-gray-500">{currentExercise?.unit}</span>
                <span className="text-[#00ff00] text-xs font-semibold ml-2">+22% ↑</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey={timePeriod === 'week' ? 'week' : timePeriod === 'month' ? 'month' : 'year'} 
                  stroke="#666"
                  style={{ fontSize: '10px' }}
                />
                <YAxis stroke="#666" style={{ fontSize: '10px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#00ff00"
                  strokeWidth={2}
                  dot={{ fill: '#00ff00', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Volume Chart */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 mt-3">
            <div className="mb-3">
              <p className="text-gray-400 text-xs mb-1">Total Volume</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">5,100</span>
                <span className="text-sm text-gray-500">lbs</span>
                <span className="text-blue-400 text-xs font-semibold ml-2">+18% ↑</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey={timePeriod === 'week' ? 'week' : timePeriod === 'month' ? 'month' : 'year'}
                  stroke="#666"
                  style={{ fontSize: '10px' }}
                />
                <YAxis stroke="#666" style={{ fontSize: '10px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="volume" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold">AI Training Recommendations</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-purple-400 rounded-full mt-1.5"></div>
              <p className="text-xs text-gray-300">Increase bench press by 2.5 lbs next session based on RPE analysis</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-purple-400 rounded-full mt-1.5"></div>
              <p className="text-xs text-gray-300">Add 1 more set to maintain progressive overload</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-purple-400 rounded-full mt-1.5"></div>
              <p className="text-xs text-gray-300">Rest 72 hours before next chest workout for optimal recovery</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showPRExplanation && <PRExplanationModal onClose={() => setShowPRExplanation(false)} />}
      {showSchedulePR && <SchedulePRModal onClose={() => setShowSchedulePR(false)} />}
      {showPRPlan && <PRPlanModal onClose={() => setShowPRPlan(false)} />}
    </div>
  );
}
