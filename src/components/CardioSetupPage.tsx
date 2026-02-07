import { X, Heart, Flame, Zap, TrendingUp, Activity, Sparkles, ChevronRight, Dumbbell, MapPin, Bike, Footprints, Waves, Mountain, CircleDot, Gauge } from 'lucide-react';
import { useState } from 'react';
import { CardioEquipmentPage } from './CardioEquipmentPage';

interface CardioSetupPageProps {
  onClose: () => void;
  onSelectCardio: (goal: string, details: any) => void;
}

export function CardioSetupPage({ onClose, onSelectCardio }: CardioSetupPageProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const customActivities = [
    { id: 'outdoor-run', name: 'Outdoor Run', icon: MapPin, color: 'from-blue-500 to-cyan-500' },
    { id: 'walk', name: 'Walk', icon: Footprints, color: 'from-green-500 to-emerald-500' },
    { id: 'treadmill', name: 'Treadmill', icon: Gauge, color: 'from-red-500 to-orange-500' },
    { id: 'bike', name: 'Bike Ride', icon: Bike, color: 'from-yellow-500 to-orange-500' },
    { id: 'swim', name: 'Swim', icon: Waves, color: 'from-cyan-500 to-blue-500' },
    { id: 'hike', name: 'Hike', icon: Mountain, color: 'from-emerald-500 to-green-600' },
    { id: 'elliptical', name: 'Elliptical', icon: CircleDot, color: 'from-purple-500 to-pink-500' },
    { id: 'stair-climber', name: 'Stair Climber', icon: Mountain, color: 'from-indigo-500 to-purple-500' },
    { id: 'rower', name: 'Rowing Machine', icon: Waves, color: 'from-orange-500 to-red-500' },
  ];

  const cardioGoals = [
    { id: 'fat-burn', name: 'Fat Burn', icon: Flame, description: 'Moderate intensity, longer duration', color: 'from-orange-500 to-red-500', details: { targetHR: '60-70% max HR', duration: '30-60 minutes', intensity: 'Moderate', examples: 'Jogging, cycling, elliptical' } },
    { id: 'hiit', name: 'HIIT', icon: Zap, description: 'High intensity interval training', color: 'from-yellow-500 to-orange-500', details: { targetHR: '85-95% max HR', duration: '20-30 minutes', intensity: 'Very High', examples: 'Sprints, burpees, jump rope' } },
    { id: 'endurance', name: 'Endurance', icon: TrendingUp, description: 'Build cardiovascular stamina', color: 'from-blue-500 to-cyan-500', details: { targetHR: '70-80% max HR', duration: '45-90 minutes', intensity: 'Moderate-High', examples: 'Long runs, cycling, swimming' } },
    { id: 'recovery', name: 'Active Recovery', icon: Activity, description: 'Light movement for recovery', color: 'from-green-500 to-emerald-500', details: { targetHR: '50-60% max HR', duration: '20-40 minutes', intensity: 'Low', examples: 'Walking, light yoga, stretching' } },
    { id: 'liss', name: 'LISS', icon: Heart, description: 'Low intensity steady state', color: 'from-purple-500 to-pink-500', details: { targetHR: '50-65% max HR', duration: '30-60 minutes', intensity: 'Low-Moderate', examples: 'Walking, light bike, easy swim' } }
  ];

  const selectedGoalData = cardioGoals.find(g => g.id === selectedGoal);

  const handleContinue = () => { setShowEquipment(true); };

  if (showEquipment && selectedGoal && selectedGoalData) {
    return (
      <CardioEquipmentPage goal={selectedGoal} goalName={selectedGoalData.name} onClose={onClose} onBack={() => setShowEquipment(false)}
        onSelectEquipment={(equipment, settings) => { onSelectCardio(selectedGoal, { ...selectedGoalData.details, equipment, settings }); }} />
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Cardio Session</h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>

        {!showAI && !selectedGoal && !showCustom && (
          <>
            <p className="text-gray-400 text-sm mb-6">What's your cardio goal today?</p>
            <div className="space-y-3 mb-4">
              {cardioGoals.map((goal) => {
                const Icon = goal.icon;
                return (
                  <button key={goal.id} onClick={() => setSelectedGoal(goal.id)} className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-5 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${goal.color} rounded-xl flex items-center justify-center`}><Icon className="w-6 h-6 text-white" /></div>
                      <div className="text-left"><h3 className="font-bold mb-1">{goal.name}</h3><p className="text-sm text-gray-400">{goal.description}</p></div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowCustom(true)} className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-5 flex items-center justify-between transition-colors mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center"><Dumbbell className="w-6 h-6 text-white" /></div>
                <div className="text-left"><h3 className="font-bold mb-1">Custom</h3><p className="text-sm text-gray-400">Just pick an activity and start tracking</p></div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button onClick={() => setShowAI(true)} className="w-full bg-gradient-to-br from-[#00ff00]/10 to-[#00cc00]/5 border border-[#00ff00]/20 hover:border-[#00ff00]/40 rounded-2xl p-5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00ff00] rounded-xl flex items-center justify-center"><Sparkles className="w-6 h-6 text-black" /></div>
                <div className="text-left"><h3 className="font-bold mb-1">Ask AI</h3><p className="text-sm text-gray-400">Get personalized cardio recommendation</p></div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#00ff00]" />
            </button>
          </>
        )}

        {selectedGoal && selectedGoalData && !showAI && (
          <div className="space-y-4">
            <button onClick={() => setSelectedGoal(null)} className="text-[#00ff00] text-sm mb-2 flex items-center gap-1">← Back</button>
            <div className={`bg-gradient-to-br ${selectedGoalData.color} rounded-2xl p-6 text-white`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"><selectedGoalData.icon className="w-7 h-7" /></div>
                <div><h2 className="text-2xl font-bold">{selectedGoalData.name}</h2><p className="text-white/80 text-sm">{selectedGoalData.description}</p></div>
              </div>
            </div>
            <div className="bg-[#1a1a1a] rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-lg mb-3">Workout Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800"><span className="text-gray-400">Target Heart Rate</span><span className="font-semibold">{selectedGoalData.details.targetHR}</span></div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-800"><span className="text-gray-400">Duration</span><span className="font-semibold">{selectedGoalData.details.duration}</span></div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-800"><span className="text-gray-400">Intensity</span><span className="font-semibold">{selectedGoalData.details.intensity}</span></div>
                <div className="flex items-start justify-between"><span className="text-gray-400">Examples</span><span className="font-semibold text-right">{selectedGoalData.details.examples}</span></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#00ff00]/10 to-[#00cc00]/5 border border-[#00ff00]/20 rounded-xl p-4">
              <p className="text-sm text-gray-300"><span className="text-[#00ff00] font-semibold">Pro Tip:</span> Monitor your heart rate throughout the session and adjust intensity to stay within your target zone.</p>
            </div>
          </div>
        )}

        {showAI && (
          <div className="space-y-4">
            <button onClick={() => setShowAI(false)} className="text-[#00ff00] text-sm mb-2 flex items-center gap-1">← Back</button>
            <div className="bg-gradient-to-br from-[#00ff00]/10 to-[#00cc00]/5 border border-[#00ff00]/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#00ff00] rounded-xl flex items-center justify-center"><Sparkles className="w-6 h-6 text-black" /></div>
                <h3 className="text-xl font-bold">AI Cardio Recommendation</h3>
              </div>
              <p className="text-gray-300 mb-4">Based on your readiness score, recent training load, and recovery status, I recommend a <span className="text-[#00ff00] font-semibold">20-minute HIIT session</span> today.</p>
              <div className="bg-black/30 rounded-xl p-4 space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm"><span className="text-gray-400">Your Readiness</span><span className="text-[#00ff00] font-semibold">94/100</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-gray-400">Last Cardio</span><span className="text-white font-semibold">2 days ago</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-gray-400">Recommended Type</span><span className="text-white font-semibold">HIIT</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-gray-400">Target Duration</span><span className="text-white font-semibold">20-25 minutes</span></div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
                <h4 className="font-semibold mb-2 text-yellow-400">Suggested Protocol</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 5 min warmup (light jog)</li>
                  <li>• 8 rounds: 30s sprint / 90s walk</li>
                  <li>• 5 min cooldown (walking)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {showCustom && (
          <div className="space-y-3">
            <button onClick={() => { setShowCustom(false); setSelectedActivity(null); }} className="text-[#00ff00] text-sm mb-4 flex items-center gap-1">← Back</button>
            <p className="text-gray-400 text-sm mb-4">Pick an activity</p>
            {customActivities.map((activity) => {
              const Icon = activity.icon;
              const isSelected = selectedActivity === activity.id;
              return (
                <button key={activity.id} onClick={() => setSelectedActivity(activity.id)} className={`w-full rounded-2xl p-5 flex items-center justify-between transition-colors ${isSelected ? 'bg-gradient-to-br ' + activity.color + ' text-white' : 'bg-[#1a1a1a] hover:bg-[#252525] text-white'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${isSelected ? 'bg-white/20' : 'bg-gradient-to-br ' + activity.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold">{activity.name}</h3>
                  </div>
                  {isSelected && (<div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"><span className="text-white text-sm">✓</span></div>)}
                </button>
              );
            })}
          </div>
        )}

        {showCustom && selectedActivity && (
          <button onClick={() => {
            const activity = customActivities.find(a => a.id === selectedActivity);
            onSelectCardio('quick', { equipment: selectedActivity, activityName: activity?.name || selectedActivity });
          }} className="fixed bottom-6 left-4 right-4 bg-[#00ff00] text-black font-bold py-4 rounded-xl hover:bg-[#00cc00] transition-colors">Start Session</button>
        )}

        {(selectedGoal || showAI) && (
          <button onClick={handleContinue} className="fixed bottom-6 left-4 right-4 bg-[#00ff00] text-black font-bold py-4 rounded-xl hover:bg-[#00cc00] transition-colors">Continue</button>
        )}
      </div>
    </div>
  );
}
