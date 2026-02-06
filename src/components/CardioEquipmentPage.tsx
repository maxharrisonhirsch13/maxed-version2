import { X, ChevronRight, MapPin, Bike, Footprints, Waves, Gauge, Mountain } from 'lucide-react';
import { useState } from 'react';

interface CardioEquipmentPageProps {
  goal: string;
  goalName: string;
  onClose: () => void;
  onBack: () => void;
  onSelectEquipment: (equipment: string, settings: any) => void;
}

export function CardioEquipmentPage({ goal, goalName, onClose, onBack, onSelectEquipment }: CardioEquipmentPageProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  const equipmentOptions = [
    { id: 'treadmill', name: 'Treadmill', icon: Gauge, color: 'from-red-500 to-orange-500' },
    { id: 'outdoor-run', name: 'Outdoor Run', icon: MapPin, color: 'from-blue-500 to-cyan-500' },
    { id: 'bike', name: 'Stationary Bike', icon: Bike, color: 'from-green-500 to-emerald-500' },
    { id: 'rower', name: 'Rowing Machine', icon: Waves, color: 'from-purple-500 to-pink-500' },
    { id: 'elliptical', name: 'Elliptical', icon: Footprints, color: 'from-yellow-500 to-orange-500' },
    { id: 'stair-climber', name: 'Stair Climber', icon: Mountain, color: 'from-indigo-500 to-purple-500' },
  ];

  const getEquipmentSettings = (equipmentId: string) => {
    const settings: any = { goal: goalName, equipment: equipmentId };
    switch (goal) {
      case 'fat-burn':
        switch (equipmentId) {
          case 'treadmill': return { ...settings, warmup: { duration: '5 min', speed: '2.5-3.0 mph', incline: '0-3%' }, main: { duration: '30 min', speed: '3.0 mph', incline: '12%' }, cooldown: { duration: '5 min', speed: '2.5 mph', incline: '0%' }, tips: ['The viral "12-3-30" protocol', 'Steep incline burns maximum calories', 'Keep steady pace - don\'t hold handrails'] };
          case 'outdoor-run': return { ...settings, warmup: { duration: '5 min', pace: 'Easy (12-13 min/mile)' }, main: { duration: '30-45 min', pace: 'Moderate (10-11 min/mile)' }, cooldown: { duration: '5 min', pace: 'Easy walk' }, tips: ['Find a flat route', 'Breathe rhythmically', 'Maintain conversation pace'] };
          case 'bike': return { ...settings, warmup: { duration: '5 min', resistance: 'Level 3-4', rpm: '60-70' }, main: { duration: '30-45 min', resistance: 'Level 5-7', rpm: '70-80' }, cooldown: { duration: '5 min', resistance: 'Level 2', rpm: '60' }, tips: ['Keep cadence steady', 'Adjust seat height properly', 'Engage core'] };
          case 'rower': return { ...settings, warmup: { duration: '5 min', pace: '2:20-2:30/500m', strokeRate: '18-20 spm' }, main: { duration: '20-30 min', pace: '2:00-2:15/500m', strokeRate: '20-24 spm' }, cooldown: { duration: '5 min', pace: '2:30+/500m', strokeRate: '16-18 spm' }, tips: ['Drive with legs first', 'Keep core engaged', 'Smooth stroke rhythm'] };
          case 'elliptical': return { ...settings, warmup: { duration: '5 min', resistance: 'Level 3-4', incline: '0-5' }, main: { duration: '30-45 min', resistance: 'Level 5-8', incline: '5-10' }, cooldown: { duration: '5 min', resistance: 'Level 2', incline: '0' }, tips: ['Use full range of motion', 'Maintain upright posture', 'Vary incline/resistance'] };
          case 'stair-climber': return { ...settings, warmup: { duration: '5 min', speed: '30-40 steps/min' }, main: { duration: '20-30 min', speed: '50-70 steps/min' }, cooldown: { duration: '5 min', speed: '30 steps/min' }, tips: ['Light grip on handles', 'Full foot on step', 'Keep shoulders back'] };
        }
        break;
      case 'hiit':
        switch (equipmentId) {
          case 'treadmill': return { ...settings, warmup: { duration: '5 min', speed: '3.5 mph', incline: '0%' }, intervals: '10 rounds: 30s sprint (8-10 mph) / 90s walk (3 mph)', totalTime: '20-25 min', cooldown: { duration: '5 min', speed: '2.5 mph', incline: '0%' }, tips: ['Maximum effort on sprints', 'Fully recover during rest', 'Hold handrails for safety'] };
          case 'outdoor-run': return { ...settings, warmup: { duration: '5 min', pace: 'Easy jog' }, intervals: '8-10 rounds: 30s sprint / 90s recovery jog', totalTime: '20-25 min', cooldown: { duration: '5 min', pace: 'Easy walk' }, tips: ['Find a flat area or track', 'All-out effort on sprints', 'Breathe deeply during recovery'] };
          case 'bike': return { ...settings, warmup: { duration: '5 min', resistance: 'Level 4', rpm: '70-80' }, intervals: '10 rounds: 30s max effort (Level 12-15, 100+ RPM) / 90s easy (Level 3-4, 60 RPM)', totalTime: '20-25 min', cooldown: { duration: '5 min', resistance: 'Level 2', rpm: '60' }, tips: ['Maximum resistance on intervals', 'Stay seated', 'Control breathing'] };
          case 'rower': return { ...settings, warmup: { duration: '5 min', pace: '2:15/500m', strokeRate: '20 spm' }, intervals: '8 rounds: 30s max effort (1:30-1:40/500m, 30+ spm) / 90s recovery (2:30/500m, 18 spm)', totalTime: '18-22 min', cooldown: { duration: '5 min', pace: '2:30+/500m', strokeRate: '16 spm' }, tips: ['Explosive leg drive', 'Quick recovery phase', 'Monitor power output'] };
          case 'elliptical': return { ...settings, warmup: { duration: '5 min', resistance: 'Level 4', incline: '0' }, intervals: '10 rounds: 30s max effort (Level 15, high incline) / 90s recovery (Level 3)', totalTime: '20-25 min', cooldown: { duration: '5 min', resistance: 'Level 2', incline: '0' }, tips: ['Maximum speed and resistance on intervals', 'Use arms actively', 'Stay balanced'] };
          case 'stair-climber': return { ...settings, warmup: { duration: '5 min', speed: '40 steps/min' }, intervals: '8 rounds: 30s sprint (100-120 steps/min) / 90s recovery (40 steps/min)', totalTime: '18-22 min', cooldown: { duration: '5 min', speed: '30 steps/min' }, tips: ['Double steps on sprints', 'Light touch on rails', 'Push through legs'] };
        }
        break;
      case 'endurance':
        switch (equipmentId) {
          case 'treadmill': return { ...settings, warmup: { duration: '10 min', speed: '4.0 mph', incline: '0%' }, main: { duration: '45-75 min', speed: '5.5-6.5 mph', incline: '1-2%' }, cooldown: { duration: '10 min', speed: '3.0 mph', incline: '0%' }, tips: ['Steady conversational pace', 'Target 70-80% max HR', 'Hydrate every 15 min'] };
          case 'outdoor-run': return { ...settings, warmup: { duration: '10 min', pace: 'Easy (11-12 min/mile)' }, main: { duration: '45-90 min', pace: 'Moderate (9-10 min/mile)' }, cooldown: { duration: '10 min', pace: 'Easy walk' }, tips: ['Find scenic route', 'Negative split option', 'Bring water/fuel if 60+ min'] };
          case 'bike': return { ...settings, warmup: { duration: '10 min', resistance: 'Level 4-5', rpm: '70-75' }, main: { duration: '60-90 min', resistance: 'Level 6-9', rpm: '75-85' }, cooldown: { duration: '10 min', resistance: 'Level 2-3', rpm: '60' }, tips: ['Maintain consistent cadence', 'Vary resistance slightly', 'Stay fueled for long rides'] };
          case 'rower': return { ...settings, warmup: { duration: '10 min', pace: '2:15/500m', strokeRate: '20 spm' }, main: { duration: '45-60 min', pace: '2:00-2:10/500m', strokeRate: '22-24 spm' }, cooldown: { duration: '10 min', pace: '2:30/500m', strokeRate: '18 spm' }, tips: ['Focus on technique', 'Break into 10-min segments', 'Monitor split times'] };
          case 'elliptical': return { ...settings, warmup: { duration: '10 min', resistance: 'Level 4-5', incline: '0-5' }, main: { duration: '45-75 min', resistance: 'Level 7-10', incline: '5-10' }, cooldown: { duration: '10 min', resistance: 'Level 2-3', incline: '0' }, tips: ['Vary incline every 10 min', 'Maintain steady rhythm', 'Engage upper body'] };
          case 'stair-climber': return { ...settings, warmup: { duration: '10 min', speed: '40-50 steps/min' }, main: { duration: '30-45 min', speed: '60-80 steps/min' }, cooldown: { duration: '10 min', speed: '30-40 steps/min' }, tips: ['Minimal handrail use', 'Upright posture', 'Steady breathing pattern'] };
        }
        break;
      case 'recovery':
        switch (equipmentId) {
          case 'treadmill': return { ...settings, duration: '20-30 min', speed: '2.5-3.5 mph', incline: '0-1%', tips: ['Very easy pace', 'Focus on breathing', 'No heart rate elevation'] };
          case 'outdoor-run': return { ...settings, duration: '20-30 min', pace: 'Easy walk (15-20 min/mile)', tips: ['Gentle movement only', 'Enjoy surroundings', 'Light stretching after'] };
          case 'bike': return { ...settings, duration: '20-30 min', resistance: 'Level 1-3', rpm: '50-65', tips: ['Very low resistance', 'Gentle pedaling', 'Focus on recovery'] };
          case 'rower': return { ...settings, duration: '15-20 min', pace: '2:40+/500m', strokeRate: '14-18 spm', tips: ['Light strokes only', 'Focus on form', 'No power output'] };
          case 'elliptical': return { ...settings, duration: '20-30 min', resistance: 'Level 1-3', incline: '0', tips: ['Minimal resistance', 'Smooth movements', 'Low intensity'] };
          case 'stair-climber': return { ...settings, duration: '15-20 min', speed: '25-35 steps/min', tips: ['Very slow pace', 'Light movement', 'Focus on mobility'] };
        }
        break;
      case 'liss':
        switch (equipmentId) {
          case 'treadmill': return { ...settings, warmup: { duration: '5 min', speed: '2.5 mph', incline: '0%' }, main: { duration: '30-50 min', speed: '3.5-4.5 mph', incline: '0-2%' }, cooldown: { duration: '5 min', speed: '2.0 mph', incline: '0%' }, tips: ['Conversational pace', 'Target 50-65% max HR', 'Stay consistent'] };
          case 'outdoor-run': return { ...settings, warmup: { duration: '5 min', pace: 'Easy walk' }, main: { duration: '30-50 min', pace: 'Light jog (11-13 min/mile)' }, cooldown: { duration: '5 min', pace: 'Easy walk' }, tips: ['Easy, sustainable pace', 'Should feel relaxed', 'Breathe naturally'] };
          case 'bike': return { ...settings, warmup: { duration: '5 min', resistance: 'Level 2-3', rpm: '60-70' }, main: { duration: '30-50 min', resistance: 'Level 4-6', rpm: '70-80' }, cooldown: { duration: '5 min', resistance: 'Level 2', rpm: '60' }, tips: ['Comfortable resistance', 'Steady cadence', 'Minimal effort'] };
          case 'rower': return { ...settings, warmup: { duration: '5 min', pace: '2:30/500m', strokeRate: '18 spm' }, main: { duration: '30-40 min', pace: '2:15-2:25/500m', strokeRate: '20-22 spm' }, cooldown: { duration: '5 min', pace: '2:40/500m', strokeRate: '16 spm' }, tips: ['Relaxed stroke rate', 'Focus on form', 'Sustainable effort'] };
          case 'elliptical': return { ...settings, warmup: { duration: '5 min', resistance: 'Level 2-3', incline: '0' }, main: { duration: '30-50 min', resistance: 'Level 4-6', incline: '0-5' }, cooldown: { duration: '5 min', resistance: 'Level 2', incline: '0' }, tips: ['Low to moderate intensity', 'Smooth rhythm', 'Can watch TV/listen to podcast'] };
          case 'stair-climber': return { ...settings, warmup: { duration: '5 min', speed: '30 steps/min' }, main: { duration: '25-40 min', speed: '45-60 steps/min' }, cooldown: { duration: '5 min', speed: '25 steps/min' }, tips: ['Steady, easy pace', 'Light handrail touch', 'Should feel sustainable'] };
        }
        break;
    }
    return settings;
  };

  const selectedEquipmentData = equipmentOptions.find(e => e.id === selectedEquipment);
  const equipmentSettings = selectedEquipment ? getEquipmentSettings(selectedEquipment) : null;

  const handleContinue = () => {
    if (selectedEquipment && equipmentSettings) {
      onSelectEquipment(selectedEquipment, equipmentSettings);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Choose Equipment</h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!selectedEquipment && (
          <>
            <button onClick={onBack} className="text-[#00ff00] text-sm mb-4 flex items-center gap-1">← Back</button>
            <p className="text-gray-400 text-sm mb-6">What equipment will you use for your <span className="text-white font-semibold">{goalName}</span> session?</p>
            <div className="space-y-3">
              {equipmentOptions.map((equipment) => {
                const Icon = equipment.icon;
                return (
                  <button key={equipment.id} onClick={() => setSelectedEquipment(equipment.id)} className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-5 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${equipment.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold">{equipment.name}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {selectedEquipment && selectedEquipmentData && equipmentSettings && (
          <div className="space-y-4">
            <button onClick={() => setSelectedEquipment(null)} className="text-[#00ff00] text-sm mb-2 flex items-center gap-1">← Back</button>
            <div className={`bg-gradient-to-br ${selectedEquipmentData.color} rounded-2xl p-6 text-white`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <selectedEquipmentData.icon className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedEquipmentData.name}</h2>
                  <p className="text-white/80 text-sm">{goalName}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-lg mb-3">Workout Protocol</h3>
              {goal === 'hiit' ? (
                <div className="space-y-3">
                  <div className="bg-[#252525] rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">WARMUP</p>
                    <p className="font-semibold">{equipmentSettings.warmup.duration}</p>
                    <p className="text-sm text-gray-400 mt-1">{Object.entries(equipmentSettings.warmup).filter(([key]) => key !== 'duration').map(([key, value]) => `${value}`).join(' • ')}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <p className="text-xs text-yellow-400 mb-2 font-semibold">INTERVAL PROTOCOL</p>
                    <p className="font-semibold text-sm">{equipmentSettings.intervals}</p>
                    <p className="text-xs text-gray-400 mt-2">Total Time: {equipmentSettings.totalTime}</p>
                  </div>
                  <div className="bg-[#252525] rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">COOLDOWN</p>
                    <p className="font-semibold">{equipmentSettings.cooldown.duration}</p>
                    <p className="text-sm text-gray-400 mt-1">{Object.entries(equipmentSettings.cooldown).filter(([key]) => key !== 'duration').map(([key, value]) => `${value}`).join(' • ')}</p>
                  </div>
                </div>
              ) : goal === 'recovery' ? (
                <div className="space-y-3">
                  <div className="bg-[#252525] rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Duration</span>
                      <span className="font-semibold">{equipmentSettings.duration}</span>
                    </div>
                    {Object.entries(equipmentSettings).filter(([key]) => !['goal', 'equipment', 'duration', 'tips'].includes(key)).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-400 capitalize">{key.replace('-', ' ')}</span>
                        <span className="font-semibold">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {equipmentSettings.warmup && (
                    <div className="bg-[#252525] rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">WARMUP</p>
                      <p className="font-semibold">{equipmentSettings.warmup.duration}</p>
                      <p className="text-sm text-gray-400 mt-1">{Object.entries(equipmentSettings.warmup).filter(([key]) => key !== 'duration').map(([key, value]) => `${value}`).join(' • ')}</p>
                    </div>
                  )}
                  {equipmentSettings.main && (
                    <div className="bg-gradient-to-br from-[#00ff00]/10 to-[#00cc00]/5 border border-[#00ff00]/20 rounded-xl p-4">
                      <p className="text-xs text-[#00ff00] mb-2 font-semibold">MAIN SET</p>
                      <p className="font-semibold">{equipmentSettings.main.duration}</p>
                      <p className="text-sm text-gray-400 mt-1">{Object.entries(equipmentSettings.main).filter(([key]) => key !== 'duration').map(([key, value]) => `${value}`).join(' • ')}</p>
                    </div>
                  )}
                  {equipmentSettings.cooldown && (
                    <div className="bg-[#252525] rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">COOLDOWN</p>
                      <p className="font-semibold">{equipmentSettings.cooldown.duration}</p>
                      <p className="text-sm text-gray-400 mt-1">{Object.entries(equipmentSettings.cooldown).filter(([key]) => key !== 'duration').map(([key, value]) => `${value}`).join(' • ')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {equipmentSettings.tips && (
              <div className="bg-gradient-to-br from-[#00ff00]/10 to-[#00cc00]/5 border border-[#00ff00]/20 rounded-xl p-4">
                <p className="text-[#00ff00] font-semibold text-sm mb-2">Pro Tips</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  {equipmentSettings.tips.map((tip: string, index: number) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {selectedEquipment && (
          <button onClick={handleContinue} className="fixed bottom-6 left-4 right-4 bg-[#00ff00] text-black font-bold py-4 rounded-xl hover:bg-[#00cc00] transition-colors">
            Start Session
          </button>
        )}
      </div>
    </div>
  );
}
