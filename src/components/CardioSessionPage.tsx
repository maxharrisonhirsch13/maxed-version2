import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Square, Check, Loader2, Heart, Flame, Zap, TrendingUp, Activity, ChevronDown, ChevronUp, Clock, ClipboardList } from 'lucide-react';
import { useWorkouts } from '../hooks/useWorkouts';

interface CardioSessionPageProps {
  onClose: () => void;
  goal: string;
  details: any;
}

const goalIcons: Record<string, any> = {
  'fat-burn': Flame,
  'hiit': Zap,
  'endurance': TrendingUp,
  'recovery': Activity,
  'liss': Heart,
};

const goalColors: Record<string, string> = {
  'fat-burn': 'from-orange-500 to-red-500',
  'hiit': 'from-yellow-500 to-orange-500',
  'endurance': 'from-blue-500 to-cyan-500',
  'recovery': 'from-green-500 to-emerald-500',
  'liss': 'from-purple-500 to-pink-500',
};

const goalNames: Record<string, string> = {
  'fat-burn': 'Fat Burn',
  'hiit': 'HIIT',
  'endurance': 'Endurance',
  'recovery': 'Active Recovery',
  'liss': 'LISS',
};

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function CardioSessionPage({ onClose, goal, details }: CardioSessionPageProps) {
  const { saveWorkout, saving } = useWorkouts();
  const startedAt = useRef(new Date().toISOString());
  const [mode, setMode] = useState<'live' | 'log'>('live');
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showProtocol, setShowProtocol] = useState(false);

  // Shared metrics
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);

  // Log mode metrics
  const [logHours, setLogHours] = useState(0);
  const [logMinutes, setLogMinutes] = useState(30);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const Icon = goalIcons[goal] || Heart;
  const color = goalColors[goal] || 'from-gray-500 to-gray-600';
  const equipmentName = details?.equipment
    ? details.equipment.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : '';

  // Timer
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const handleStartPause = () => {
    if (!running && elapsed === 0) {
      startedAt.current = new Date().toISOString();
    }
    setRunning(!running);
  };

  const handleStop = () => {
    setRunning(false);
    if (elapsed > 0) {
      setShowEndConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSave = async (durationMinutes: number) => {
    try {
      await saveWorkout({
        workoutType: `Cardio — ${goalNames[goal] || goal}`,
        startedAt: startedAt.current,
        durationMinutes,
        exercises: [{
          exerciseName: equipmentName || goalNames[goal] || 'Cardio',
          sortOrder: 0,
          sets: [{
            setNumber: 1,
            durationMinutes,
            distanceMiles: distance > 0 ? distance : undefined,
            caloriesBurned: calories > 0 ? calories : undefined,
          }],
        }],
      });
      onClose();
    } catch (err) {
      console.error('Failed to save cardio:', err);
      onClose();
    }
  };

  const handleFinishLive = () => handleSave(Math.max(1, Math.round(elapsed / 60)));
  const handleFinishLog = () => handleSave(logHours * 60 + logMinutes);

  // Build protocol summary from details
  const protocolItems: { label: string; value: string }[] = [];
  if (details) {
    if (details.warmup?.duration) protocolItems.push({ label: 'Warmup', value: details.warmup.duration });
    if (details.main?.duration) protocolItems.push({ label: 'Main Set', value: details.main.duration });
    if (details.intervals) protocolItems.push({ label: 'Intervals', value: details.intervals });
    if (details.totalTime) protocolItems.push({ label: 'Total Time', value: details.totalTime });
    if (details.cooldown?.duration) protocolItems.push({ label: 'Cooldown', value: details.cooldown.duration });
    if (details.duration && !details.main) protocolItems.push({ label: 'Duration', value: details.duration });
    if (details.targetHR) protocolItems.push({ label: 'Target HR', value: details.targetHR });
    if (details.intensity) protocolItems.push({ label: 'Intensity', value: details.intensity });
  }

  // Shared metrics UI
  const metricsSection = (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-[#1a1a1a] rounded-2xl p-4">
        <label className="block text-[10px] text-gray-500 font-medium tracking-wider mb-2">DISTANCE (mi)</label>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setDistance(Math.max(0, +(distance - 0.1).toFixed(1)))}
            className="w-9 h-9 bg-[#252525] hover:bg-[#333] rounded-xl flex items-center justify-center transition-all active:scale-90"
          >
            <span className="text-xl font-bold text-gray-400">&minus;</span>
          </button>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(Math.max(0, parseFloat(e.target.value) || 0))}
            step="0.1"
            className="w-16 bg-transparent text-2xl font-bold text-center focus:outline-none"
          />
          <button
            onClick={() => setDistance(+(distance + 0.1).toFixed(1))}
            className="w-9 h-9 bg-[#252525] hover:bg-[#333] rounded-xl flex items-center justify-center transition-all active:scale-90"
          >
            <span className="text-xl font-bold text-gray-400">+</span>
          </button>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl p-4">
        <label className="block text-[10px] text-gray-500 font-medium tracking-wider mb-2">CALORIES</label>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCalories(Math.max(0, calories - 10))}
            className="w-9 h-9 bg-[#252525] hover:bg-[#333] rounded-xl flex items-center justify-center transition-all active:scale-90"
          >
            <span className="text-xl font-bold text-gray-400">&minus;</span>
          </button>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-16 bg-transparent text-2xl font-bold text-center focus:outline-none"
          />
          <button
            onClick={() => setCalories(calories + 10)}
            className="w-9 h-9 bg-[#252525] hover:bg-[#333] rounded-xl flex items-center justify-center transition-all active:scale-90"
          >
            <span className="text-xl font-bold text-gray-400">+</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Protocol collapsible
  const protocolSection = protocolItems.length > 0 && (
    <button
      onClick={() => setShowProtocol(!showProtocol)}
      className="w-full bg-[#1a1a1a] rounded-2xl p-4 mb-4 text-left"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#00ff00]">WORKOUT PROTOCOL</span>
        {showProtocol ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </div>
      {showProtocol && (
        <div className="mt-3 space-y-2">
          {protocolItems.map((item, i) => (
            <div key={i} className="flex items-start justify-between text-sm">
              <span className="text-gray-400">{item.label}</span>
              <span className="font-medium text-right max-w-[60%]">{item.value}</span>
            </div>
          ))}
          {details?.tips && (
            <div className="mt-3 pt-3 border-t border-gray-800">
              <p className="text-[10px] text-[#00ff00] font-semibold mb-1">TIPS</p>
              {details.tips.map((tip: string, i: number) => (
                <p key={i} className="text-xs text-gray-400">• {tip}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pt-6 pb-3">
        <button
          onClick={() => { if (running) { handleStop(); } else if (elapsed > 0) { setShowEndConfirm(true); } else { onClose(); } }}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-base">{goalNames[goal] || 'Cardio'}</h1>
          {equipmentName && <p className="text-[10px] text-gray-500">{equipmentName}</p>}
        </div>
        <div className="w-10" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {/* Goal Banner */}
        <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 mb-4`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{goalNames[goal] || 'Cardio'}</h2>
              <p className="text-white/70 text-sm">{equipmentName}</p>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { if (!running) setMode('live'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              mode === 'live'
                ? 'bg-[#00ff00] text-black'
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'
            }`}
          >
            <Clock className="w-4 h-4" />
            Live Timer
          </button>
          <button
            onClick={() => { if (!running) setMode('log'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              mode === 'log'
                ? 'bg-[#00ff00] text-black'
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Log After
          </button>
        </div>

        {/* Live Timer Mode */}
        {mode === 'live' && (
          <>
            <div className="bg-[#1a1a1a] rounded-2xl p-6 mb-4 text-center">
              <p className="text-[10px] text-gray-500 font-medium tracking-wider mb-2">ELAPSED TIME</p>
              <p className="text-6xl font-bold font-mono tracking-tight mb-4"
                 style={{ color: running ? '#00ff00' : 'white' }}
              >
                {formatTime(elapsed)}
              </p>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleStartPause}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                    running
                      ? 'bg-yellow-500 hover:bg-yellow-400'
                      : 'bg-[#00ff00] hover:bg-[#00dd00]'
                  }`}
                >
                  {running ? (
                    <Pause className="w-7 h-7 text-black" />
                  ) : (
                    <Play className="w-7 h-7 text-black ml-1" />
                  )}
                </button>

                {elapsed > 0 && (
                  <button
                    onClick={handleStop}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-all active:scale-90"
                  >
                    <Square className="w-6 h-6 text-white fill-white" />
                  </button>
                )}
              </div>
            </div>

            {metricsSection}
            {protocolSection}
          </>
        )}

        {/* Log After Mode */}
        {mode === 'log' && (
          <>
            <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-4">
              <p className="text-[10px] text-gray-500 font-medium tracking-wider mb-4">DURATION</p>
              <div className="flex items-center justify-center gap-4">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setLogHours(Math.min(5, logHours + 1))}
                    className="w-10 h-10 bg-[#252525] hover:bg-[#333] rounded-xl flex items-center justify-center transition-all active:scale-90 mb-2"
                  >
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  </button>
                  <span className="text-4xl font-bold font-mono w-14 text-center">{logHours}</span>
                  <p className="text-[10px] text-gray-500 mt-1">hr</p>
                  <button
                    onClick={() => setLogHours(Math.max(0, logHours - 1))}
                    className="w-10 h-10 bg-[#252525] hover:bg-[#333] rounded-xl flex items-center justify-center transition-all active:scale-90 mt-2"
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <span className="text-3xl font-bold text-gray-600 pb-4">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setLogMinutes(Math.min(59, logMinutes + 5))}
                    className="w-10 h-10 bg-[#252525] hover:bg-[#333] rounded-xl flex items-center justify-center transition-all active:scale-90 mb-2"
                  >
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  </button>
                  <span className="text-4xl font-bold font-mono w-14 text-center">{logMinutes.toString().padStart(2, '0')}</span>
                  <p className="text-[10px] text-gray-500 mt-1">min</p>
                  <button
                    onClick={() => setLogMinutes(Math.max(0, logMinutes - 5))}
                    className="w-10 h-10 bg-[#252525] hover:bg-[#333] rounded-xl flex items-center justify-center transition-all active:scale-90 mt-2"
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {metricsSection}
            {protocolSection}

            <button
              onClick={handleFinishLog}
              disabled={saving || (logHours === 0 && logMinutes === 0)}
              className="w-full bg-[#00ff00] text-black font-bold py-4 rounded-2xl text-sm hover:bg-[#00dd00] transition-all active:scale-[0.97] disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-[#00ff00]/20"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Session'}
            </button>
          </>
        )}
      </div>

      {/* End Confirm Modal (live mode) */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1a1a1a] rounded-3xl p-6 text-center">
            <div className="w-16 h-16 bg-[#00ff00] rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-black" />
            </div>
            <h2 className="font-bold text-xl mb-2">Session Complete!</h2>
            <div className="space-y-1 mb-6">
              <p className="text-gray-400 text-sm">{formatTime(elapsed)} • {goalNames[goal] || 'Cardio'}</p>
              {distance > 0 && <p className="text-gray-400 text-sm">{distance} miles</p>}
              {calories > 0 && <p className="text-gray-400 text-sm">{calories} cal burned</p>}
            </div>
            <div className="space-y-2">
              <button
                onClick={handleFinishLive}
                disabled={saving}
                className="w-full bg-[#00ff00] text-black font-bold py-3.5 rounded-2xl text-sm hover:bg-[#00dd00] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Session'}
              </button>
              <button
                onClick={onClose}
                className="w-full text-red-400 font-medium py-3 rounded-2xl text-sm hover:bg-red-500/10 transition-colors"
              >
                Discard & Exit
              </button>
              <button
                onClick={() => { setShowEndConfirm(false); setRunning(true); }}
                className="w-full text-gray-400 font-medium py-3 rounded-2xl text-sm hover:bg-white/5 transition-colors"
              >
                Continue Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
