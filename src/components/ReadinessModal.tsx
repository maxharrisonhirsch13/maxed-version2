import { X, Activity, Moon, Heart, Zap, TrendingUp, Brain } from 'lucide-react';

interface ReadinessModalProps {
  onClose: () => void;
}

export function ReadinessModal({ onClose }: ReadinessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
          <div><h3 className="font-bold text-lg">Readiness Score</h3><p className="text-xs text-gray-500 mt-0.5">How we calculate your daily readiness</p></div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="bg-gradient-to-br from-[#00ff00]/20 to-[#00ff00]/5 border border-[#00ff00]/30 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div><p className="text-xs text-gray-400 mb-1">Today's Score</p><div className="flex items-baseline gap-2"><span className="text-5xl font-bold">94</span><span className="text-xl text-gray-500">/ 100</span></div></div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00ff00] to-[#00cc00] flex items-center justify-center"><Zap className="w-10 h-10 text-black" /></div>
            </div>
            <div className="flex items-center gap-2 mb-2"><span className="text-[#00ff00] font-bold text-sm">Optimal Status</span><span className="text-xs text-gray-500">•</span><span className="text-xs text-gray-400">Ready for peak performance</span></div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-[#00ff00] rounded-full" style={{ width: '94%' }}></div></div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Brain className="w-4 h-4 text-[#00ff00]" />What This Means For You</h4>
            <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
              <p className="text-sm text-gray-300 leading-relaxed mb-3">Based on your wearables data and sleep patterns, you're in great shape for today's workout. Your body has recovered well and is primed for a challenging session.</p>
              <div className="bg-[#00ff00]/10 border border-[#00ff00]/20 rounded-xl p-3">
                <p className="text-xs font-semibold text-[#00ff00] mb-1">AI Recommendation</p>
                <p className="text-xs text-gray-400">We've adjusted your training intensity to <span className="text-white font-semibold">85-95%</span> of your max capacity. This is a perfect day to push for higher weight or increased volume on compound lifts.</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Key Factors Contributing to Your Score</h4>
            <div className="space-y-3">
              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                <div className="flex items-start gap-3"><div className="p-2 bg-blue-500/10 rounded-lg"><Moon className="w-4 h-4 text-blue-400" /></div>
                  <div className="flex-1"><div className="flex items-center justify-between mb-1"><h5 className="font-semibold text-sm">Sleep Quality</h5><span className="text-[#00ff00] text-xs font-semibold">Excellent</span></div><p className="text-xs text-gray-400 mb-2">8h 24m total • 2h 15m deep sleep</p><div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-blue-400 rounded-full" style={{ width: '92%' }}></div></div></div>
                </div>
              </div>
              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                <div className="flex items-start gap-3"><div className="p-2 bg-red-500/10 rounded-lg"><Heart className="w-4 h-4 text-red-400" /></div>
                  <div className="flex-1"><div className="flex items-center justify-between mb-1"><h5 className="font-semibold text-sm">Heart Rate Variability</h5><span className="text-[#00ff00] text-xs font-semibold">High</span></div><p className="text-xs text-gray-400 mb-2">62 ms average • +8% vs baseline</p><div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-red-400 rounded-full" style={{ width: '88%' }}></div></div></div>
                </div>
              </div>
              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                <div className="flex items-start gap-3"><div className="p-2 bg-orange-500/10 rounded-lg"><Activity className="w-4 h-4 text-orange-400" /></div>
                  <div className="flex-1"><div className="flex items-center justify-between mb-1"><h5 className="font-semibold text-sm">Recovery Status</h5><span className="text-[#00ff00] text-xs font-semibold">Recovered</span></div><p className="text-xs text-gray-400 mb-2">48h since last intense session</p><div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-orange-400 rounded-full" style={{ width: '96%' }}></div></div></div>
                </div>
              </div>
              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                <div className="flex items-start gap-3"><div className="p-2 bg-purple-500/10 rounded-lg"><TrendingUp className="w-4 h-4 text-purple-400" /></div>
                  <div className="flex-1"><div className="flex items-center justify-between mb-1"><h5 className="font-semibold text-sm">Training Load</h5><span className="text-yellow-400 text-xs font-semibold">Balanced</span></div><p className="text-xs text-gray-400 mb-2">Weekly volume optimal for growth</p><div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-purple-400 rounded-full" style={{ width: '75%' }}></div></div></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-4 border border-gray-800">
            <h4 className="font-bold text-sm mb-3">How Our Algorithm Works</h4>
            <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
              <p>Your Readiness Score is calculated using real-time data from your connected wearables, combining multiple biometric signals to give you an accurate picture of your body's current state.</p>
              <p>Our AI analyzes sleep patterns, heart rate variability, resting heart rate, recent training volume, and recovery metrics to determine your optimal training intensity for the day.</p>
              <p className="text-gray-500 pt-2 border-t border-gray-800"><span className="font-semibold text-white">Pro tip:</span> Scores below 70 suggest active recovery or lower intensity work. Scores above 85 indicate you're ready for PRs and high-intensity training.</p>
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-gray-900">
          <button onClick={onClose} className="w-full bg-[#00ff00] hover:bg-[#00dd00] text-black font-bold py-3 rounded-xl transition-colors">Got It</button>
        </div>
      </div>
    </div>
  );
}