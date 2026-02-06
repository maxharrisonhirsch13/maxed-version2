import { useState } from 'react';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';

interface SchedulePRModalProps {
  onClose: () => void;
}

export function SchedulePRModal({ onClose }: SchedulePRModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const suggestedDates = [
    { date: '2026-02-05', day: 'Thu', label: 'Feb 5', optimal: true, readiness: 94 },
    { date: '2026-02-06', day: 'Fri', label: 'Feb 6', optimal: true, readiness: 96 },
    { date: '2026-02-07', day: 'Sat', label: 'Feb 7', optimal: false, readiness: 89 },
    { date: '2026-02-08', day: 'Sun', label: 'Feb 8', optimal: false, readiness: 85 },
  ];

  const suggestedTimes = [
    { time: '09:00', label: '9:00 AM', optimal: true, reason: 'Peak testosterone levels' },
    { time: '10:00', label: '10:00 AM', optimal: true, reason: 'Optimal body temperature' },
    { time: '17:00', label: '5:00 PM', optimal: true, reason: 'Peak muscle performance' },
    { time: '18:00', label: '6:00 PM', optimal: false, reason: 'Good recovery state' },
  ];

  const handleSchedule = () => { if (selectedDate && selectedTime) { console.log('PR attempt scheduled for:', selectedDate, selectedTime); onClose(); } };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
          <div><h3 className="font-bold text-lg">Schedule PR Attempt</h3><p className="text-xs text-gray-500 mt-0.5">235 lbs Bench Press</p></div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="bg-gradient-to-r from-[#00ff00]/10 to-green-500/10 border border-[#00ff00]/30 rounded-2xl p-4">
            <div className="flex items-start gap-3"><div className="p-2 bg-[#00ff00]/20 rounded-lg"><AlertCircle className="w-4 h-4 text-[#00ff00]" /></div>
              <div><h4 className="font-semibold text-sm mb-1 text-[#00ff00]">Optimal PR Window</h4><p className="text-xs text-gray-300">Based on your recovery and training cycle, the next 72 hours represent your ideal window for attempting this PR.</p></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3"><Calendar className="w-4 h-4 text-gray-400" /><h4 className="font-bold text-sm">Select Date</h4></div>
            <div className="grid grid-cols-2 gap-2">
              {suggestedDates.map((item) => (
                <button key={item.date} onClick={() => setSelectedDate(item.date)} className={`rounded-xl p-4 border-2 transition-all ${selectedDate === item.date ? 'border-[#00ff00] bg-[#00ff00]/10' : item.optimal ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/50' : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'}`}>
                  <div className="flex items-start justify-between mb-2"><div><p className="text-xs text-gray-400">{item.day}</p><p className="font-bold">{item.label}</p></div>{item.optimal && (<span className="text-[8px] bg-[#00ff00]/20 text-[#00ff00] px-1.5 py-0.5 rounded font-semibold">OPTIMAL</span>)}</div>
                  <div className="flex items-center justify-between"><span className="text-[10px] text-gray-500">Readiness</span><span className={`text-xs font-bold ${item.readiness >= 90 ? 'text-[#00ff00]' : 'text-yellow-400'}`}>{item.readiness}%</span></div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-gray-400" /><h4 className="font-bold text-sm">Select Time</h4></div>
            <div className="space-y-2">
              {suggestedTimes.map((item) => (
                <button key={item.time} onClick={() => setSelectedTime(item.time)} className={`w-full rounded-xl p-4 border-2 transition-all text-left ${selectedTime === item.time ? 'border-[#00ff00] bg-[#00ff00]/10' : item.optimal ? 'border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50' : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'}`}>
                  <div className="flex items-center justify-between mb-1"><span className="font-bold text-sm">{item.label}</span>{item.optimal && (<span className="text-[8px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-semibold">PEAK TIME</span>)}</div>
                  <p className="text-xs text-gray-400">{item.reason}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-4 border border-gray-800">
            <h4 className="font-bold text-sm mb-3">Pre-Attempt Recommendations</h4>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-start gap-2"><div className="w-1 h-1 bg-[#00ff00] rounded-full mt-1.5"></div><p>Get 8+ hours of quality sleep the night before</p></div>
              <div className="flex items-start gap-2"><div className="w-1 h-1 bg-[#00ff00] rounded-full mt-1.5"></div><p>Consume 200-300mg caffeine 45 minutes before lift</p></div>
              <div className="flex items-start gap-2"><div className="w-1 h-1 bg-[#00ff00] rounded-full mt-1.5"></div><p>Complete thorough warmup with focus on rotator cuff</p></div>
              <div className="flex items-start gap-2"><div className="w-1 h-1 bg-[#00ff00] rounded-full mt-1.5"></div><p>Use competition-style pause at chest for PR attempt</p></div>
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-gray-900 space-y-2">
          <button onClick={handleSchedule} disabled={!selectedDate || !selectedTime} className={`w-full font-bold py-3 rounded-xl transition-colors ${selectedDate && selectedTime ? 'bg-[#00ff00] hover:bg-[#00dd00] text-black' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}>{selectedDate && selectedTime ? 'Confirm PR Attempt' : 'Select Date & Time'}</button>
          <button onClick={onClose} className="w-full bg-transparent border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 font-semibold py-3 rounded-xl transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}