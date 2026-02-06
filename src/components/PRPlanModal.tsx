import { X, Target, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';

interface PRPlanModalProps {
  onClose: () => void;
}

export function PRPlanModal({ onClose }: PRPlanModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
          <div><h3 className="font-bold text-lg">PR Achievement Plan</h3><p className="text-xs text-gray-500 mt-0.5">Your path to 235 lbs</p></div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#00ff00] rounded-xl flex items-center justify-center"><Target className="w-6 h-6 text-black" /></div>
              <div><p className="text-xs text-gray-400">Target PR</p><p className="text-2xl font-bold">235 <span className="text-base text-gray-400">lbs</span></p></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/30 rounded-xl p-2.5"><p className="text-[10px] text-gray-400 mb-1">Current PR</p><p className="text-sm font-bold">225 lbs</p></div>
              <div className="bg-black/30 rounded-xl p-2.5"><p className="text-[10px] text-gray-400 mb-1">Increase</p><p className="text-sm font-bold text-[#00ff00]">+10 lbs</p></div>
              <div className="bg-black/30 rounded-xl p-2.5"><p className="text-[10px] text-gray-400 mb-1">Progress</p><p className="text-sm font-bold text-purple-400">+4.4%</p></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3"><Zap className="w-4 h-4 text-orange-400" /><h4 className="font-bold text-sm">Warm-up Protocol</h4></div>
            <div className="space-y-2">
              <div className="bg-[#0a0a0a] rounded-xl p-3 border border-gray-900"><div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold">Set 1: Empty Bar</span><span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded">Neural Activation</span></div><div className="flex items-center justify-between"><span className="text-sm font-bold">45 lbs × 10 reps</span><span className="text-xs text-gray-500">Focus: Perfect form</span></div></div>
              <div className="bg-[#0a0a0a] rounded-xl p-3 border border-gray-900"><div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold">Set 2: Light</span><span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded">Blood Flow</span></div><div className="flex items-center justify-between"><span className="text-sm font-bold">95 lbs × 8 reps</span><span className="text-xs text-gray-500">Bar speed: Explosive</span></div></div>
              <div className="bg-[#0a0a0a] rounded-xl p-3 border border-gray-900"><div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold">Set 3: Moderate</span><span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded">50% of PR</span></div><div className="flex items-center justify-between"><span className="text-sm font-bold">115 lbs × 5 reps</span><span className="text-xs text-gray-500">Controlled tempo</span></div></div>
              <div className="bg-[#0a0a0a] rounded-xl p-3 border border-gray-900"><div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold">Set 4: Heavy</span><span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">70% of PR</span></div><div className="flex items-center justify-between"><span className="text-sm font-bold">165 lbs × 3 reps</span><span className="text-xs text-gray-500">CNS priming</span></div></div>
              <div className="bg-[#0a0a0a] rounded-xl p-3 border border-gray-900"><div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold">Set 5: Near-Max</span><span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">85% of PR</span></div><div className="flex items-center justify-between"><span className="text-sm font-bold">190 lbs × 2 reps</span><span className="text-xs text-gray-500">Feel the weight</span></div></div>
              <div className="bg-[#0a0a0a] rounded-xl p-3 border border-gray-900"><div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold">Set 6: Opener</span><span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">95% of PR</span></div><div className="flex items-center justify-between"><span className="text-sm font-bold">215 lbs × 1 rep</span><span className="text-xs text-gray-500">Confidence builder</span></div></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-[#00ff00]" /><h4 className="font-bold text-sm">PR Attempt Strategy</h4></div>
            <div className="bg-gradient-to-br from-[#00ff00]/10 to-green-500/10 border border-[#00ff00]/30 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3"><span className="text-sm font-bold">Main Attempt</span><span className="text-xs bg-[#00ff00]/20 text-[#00ff00] px-2 py-1 rounded font-semibold">PR WEIGHT</span></div>
              <div className="text-3xl font-bold mb-4 text-[#00ff00]">235 lbs × 1 rep</div>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-[#00ff00] mt-0.5 flex-shrink-0" /><p className="text-gray-300">Rest 5-7 minutes after opener (215 lbs)</p></div>
                <div className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-[#00ff00] mt-0.5 flex-shrink-0" /><p className="text-gray-300">Use chalk for optimal grip security</p></div>
                <div className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-[#00ff00] mt-0.5 flex-shrink-0" /><p className="text-gray-300">Engage lats before unracking for stability</p></div>
                <div className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-[#00ff00] mt-0.5 flex-shrink-0" /><p className="text-gray-300">Control descent: 2 second eccentric phase</p></div>
                <div className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-[#00ff00] mt-0.5 flex-shrink-0" /><p className="text-gray-300">Pause 1 second at chest, then explode up</p></div>
                <div className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-[#00ff00] mt-0.5 flex-shrink-0" /><p className="text-gray-300">Drive feet into ground for leg drive</p></div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-4 border border-gray-800">
            <h4 className="font-bold text-sm mb-3">If 235 lbs Feels Too Heavy</h4>
            <div className="space-y-2">
              <div className="bg-black/40 rounded-xl p-3"><div className="flex items-center justify-between mb-1"><span className="text-xs font-semibold">Conservative Attempt</span><span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">SAFE PR</span></div><p className="text-sm font-bold mb-1">230 lbs × 1 rep</p><p className="text-xs text-gray-400">Still a 5 lb PR, builds confidence</p></div>
              <p className="text-xs text-gray-500 px-3">If bar speed on 215 lbs opener feels slower than usual, drop to 230 lbs for a guaranteed PR. You can always try 235 lbs next week.</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-4 border border-blue-500/20">
            <h4 className="font-bold text-sm mb-3">Post-PR Recovery</h4>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-start gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5"></div><p>Take 7-10 days before next heavy bench session</p></div>
              <div className="flex items-start gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5"></div><p>Focus on hypertrophy work (3-4 sets of 8-12 reps)</p></div>
              <div className="flex items-start gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5"></div><p>Prioritize recovery: sleep, nutrition, active mobility</p></div>
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-gray-900">
          <button onClick={onClose} className="w-full bg-[#00ff00] hover:bg-[#00dd00] text-black font-bold py-3 rounded-xl transition-colors">Let's Do This!</button>
        </div>
      </div>
    </div>
  );
}