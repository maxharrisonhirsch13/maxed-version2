import { X, Heart, MapPin, Bike, Footprints, Waves, Mountain, CircleDot, Gauge } from 'lucide-react';
import { useState } from 'react';

interface CardioSetupPageProps {
  onClose: () => void;
  onSelectCardio: (goal: string, details: any) => void;
}

export function CardioSetupPage({ onClose, onSelectCardio }: CardioSetupPageProps) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const activities = [
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

  const handleStart = () => {
    if (!selectedActivity) return;
    const activity = activities.find(a => a.id === selectedActivity);
    onSelectCardio('quick', { equipment: selectedActivity, activityName: activity?.name || selectedActivity });
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Cardio Session</h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <p className="text-gray-400 text-sm mb-6">What are you doing today?</p>
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = activity.icon;
            const isSelected = selectedActivity === activity.id;
            return (
              <button
                key={activity.id}
                onClick={() => setSelectedActivity(activity.id)}
                className={`w-full rounded-2xl p-5 flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-gradient-to-br ' + activity.color + ' text-white'
                    : 'bg-[#1a1a1a] hover:bg-[#252525] text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${isSelected ? 'bg-white/20' : 'bg-gradient-to-br ' + activity.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold">{activity.name}</h3>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedActivity && (
          <button onClick={handleStart} className="fixed bottom-6 left-4 right-4 bg-[#00ff00] text-black font-bold py-4 rounded-xl hover:bg-[#00cc00] transition-colors">
            Start Session
          </button>
        )}
      </div>
    </div>
  );
}
