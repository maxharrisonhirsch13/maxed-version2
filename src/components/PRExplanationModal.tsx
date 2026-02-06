import { X, TrendingUp, Activity, Brain, Zap, Target, LineChart as LineChartIcon } from 'lucide-react';

interface PRExplanationModalProps {
  onClose: () => void;
}

export function PRExplanationModal({ onClose }: PRExplanationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
          <div><h3 className="font-bold text-lg">PR Prediction Analysis</h3><p className="text-xs text-gray-500 mt-0.5">Why you're ready for 235 lbs</p></div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-xs text-purple-300 mb-1">PREDICTED PR</p><div className="flex items-baseline gap-2"><span className="text-5xl font-bold text-[#00ff00]">235</span><span className="text-xl text-gray-400">lbs</span></div></div>
              <div className="text-right"><p className="text-xs text-gray-400 mb-1">Confidence</p><div className="text-3xl font-bold text-purple-400">87%</div></div>
            </div>
            <div className="bg-black/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-purple-400" /><span className="text-xs font-semibold text-purple-300">AI Recommendation</span></div>
              <p className="text-xs text-gray-300 leading-relaxed">Based on your training data, neuromuscular adaptation, and recovery metrics, you have a high probability of successfully completing a 235 lb bench press within the next 7-10 days.</p>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-[#00ff00]" />Key Physiological Indicators</h4>
            <div className="space-y-3">
              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                <div className="flex items-start gap-3"><div className="p-2 bg-green-500/10 rounded-lg"><TrendingUp className="w-4 h-4 text-green-400" /></div>
                  <div className="flex-1"><h5 className="font-semibold text-sm mb-1">Progressive Overload Trajectory</h5><p className="text-xs text-gray-400 mb-3">Your bench press has increased <span className="text-[#00ff00] font-semibold">22% over 6 weeks</span>, following an optimal linear progression model. This 20 lb increase from 205 to 225 lbs demonstrates consistent neuromuscular adaptation.</p>
                    <div className="bg-black/40 rounded-xl p-3"><div className="flex justify-between text-[10px] mb-1"><span className="text-gray-500">Week 1</span><span className="text-gray-500">Week 6</span></div><div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-green-500 to-[#00ff00] rounded-full" style={{ width: '100%' }}></div></div><div className="flex justify-between text-xs mt-2"><span className="text-white font-semibold">205 lbs</span><span className="text-[#00ff00] font-semibold">225 lbs</span></div></div>
                  </div>
                </div>
              </div>
              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                <div className="flex items-start gap-3"><div className="p-2 bg-blue-500/10 rounded-lg"><Activity className="w-4 h-4 text-blue-400" /></div>
                  <div className="flex-1"><h5 className="font-semibold text-sm mb-1">Volume Tolerance & Adaptation</h5><p className="text-xs text-gray-400 mb-3">Your weekly training volume increased <span className="text-blue-400 font-semibold">24% this month</span> without signs of overtraining, indicating strong work capacity and recovery ability.</p>
                    <div className="grid grid-cols-2 gap-2"><div className="bg-black/40 rounded-xl p-2"><p className="text-[10px] text-gray-500 mb-1">Current Volume</p><p className="text-sm font-bold text-blue-400">5,100 lbs</p></div><div className="bg-black/40 rounded-xl p-2"><p className="text-[10px] text-gray-500 mb-1">Monthly Increase</p><p className="text-sm font-bold text-[#00ff00]">+24%</p></div></div>
                  </div>
                </div>
              </div>
              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                <div className="flex items-start gap-3"><div className="p-2 bg-purple-500/10 rounded-lg"><Zap className="w-4 h-4 text-purple-400" /></div>
                  <div className="flex-1"><h5 className="font-semibold text-sm mb-1">Neuromuscular Efficiency</h5><p className="text-xs text-gray-400 mb-3">Analysis of your rep velocity and bar path data shows <span className="text-purple-400 font-semibold">improved motor unit recruitment</span> and inter-muscular coordination, key indicators of strength readiness.</p>
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-2.5"><div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400">Motor Pattern Optimization</span><span className="text-xs font-bold text-purple-400">92%</span></div><div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full" style={{ width: '92%' }}></div></div></div>
                  </div>
                </div>
              </div>
              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                <div className="flex items-start gap-3"><div className="p-2 bg-orange-500/10 rounded-lg"><LineChartIcon className="w-4 h-4 text-orange-400" /></div>
                  <div className="flex-1"><h5 className="font-semibold text-sm mb-1">Optimal Recovery Window</h5><p className="text-xs text-gray-400 mb-3">Your chest muscle group is fully recovered with <span className="text-orange-400 font-semibold">48 hours since last intense session</span>. Muscle protein synthesis has peaked, and glycogen stores are replenished.</p>
                    <div className="flex items-center gap-2"><div className="flex-1 bg-black/40 rounded-lg p-2"><p className="text-[10px] text-gray-500">Recovery Status</p><p className="text-xs font-bold text-[#00ff00]">100% Ready</p></div><div className="flex-1 bg-black/40 rounded-lg p-2"><p className="text-[10px] text-gray-500">Optimal Window</p><p className="text-xs font-bold text-orange-400">Next 72h</p></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-4 border border-gray-800">
            <h4 className="font-bold text-sm mb-3">Prediction Methodology</h4>
            <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
              <div><p className="text-white font-semibold mb-1">1. Epley Formula Application</p><p>Using your recent 1RM estimates from working sets (220 lbs × 3 reps), the Epley formula predicts a current max of ~233 lbs, with continued adaptation suggesting 235 lbs is achievable.</p></div>
              <div><p className="text-white font-semibold mb-1">2. Velocity-Based Training Analysis</p><p>Your bar velocity at 85% of 1RM has increased by 8% over 3 weeks, indicating improved force production and neuromuscular efficiency.</p></div>
              <div><p className="text-white font-semibold mb-1">3. Fatigue Management Score</p><p>Your accumulated fatigue index is at 23% (low-moderate range), showing you're pushing hard enough to adapt without overreaching into non-functional overload.</p></div>
              <div className="pt-3 border-t border-gray-800"><p className="text-gray-500"><span className="font-semibold text-white">Success Rate:</span> Athletes with similar progression patterns achieve predicted PRs 87% of the time within a 10-day window.</p></div>
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
