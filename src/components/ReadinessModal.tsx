import { X, Activity, Moon, Heart, Zap, TrendingUp, Brain, Link2, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useWhoopData } from '../hooks/useWhoopData';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { useAuth } from '../context/AuthContext';
import { useAICoach } from '../hooks/useAICoach';

interface ReadinessModalProps {
  onClose: () => void;
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function getScoreColor(score: number): string {
  if (score >= 67) return '#00ff00';
  if (score >= 34) return '#facc15';
  return '#ef4444';
}

function getScoreLabel(score: number): { label: string; detail: string } {
  if (score >= 67) return { label: 'Optimal Status', detail: 'Ready for peak performance' };
  if (score >= 34) return { label: 'Moderate', detail: 'Consider lighter intensity' };
  return { label: 'Low Recovery', detail: 'Active recovery recommended' };
}

function getRating(value: number, thresholds: [number, number]): string {
  if (value >= thresholds[1]) return 'Excellent';
  if (value >= thresholds[0]) return 'Good';
  return 'Low';
}

export function ReadinessModal({ onClose }: ReadinessModalProps) {
  const { data: whoop } = useWhoopData();
  const { profile } = useAuth();
  const { workouts } = useWorkoutHistory({ limit: 10 });
  const { readiness, readinessLoading, fetchReadiness } = useAICoach();
  const hasData = whoop?.connected && (whoop.recovery || whoop.sleep || whoop.strain);

  // Fetch AI readiness when data is available
  useEffect(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentWorkouts = workouts
      .filter(w => new Date(w.startedAt) >= sevenDaysAgo)
      .map(w => ({
        date: w.startedAt.split('T')[0],
        type: w.workoutType,
        durationMinutes: w.durationMinutes || 0,
      }));

    fetchReadiness({
      whoopData: whoop ? {
        recovery: whoop.recovery,
        sleep: whoop.sleep ? {
          qualityDuration: whoop.sleep.qualityDuration,
          deepSleepDuration: whoop.sleep.deepSleepDuration,
          sleepScore: whoop.sleep.sleepScore,
        } : null,
        strain: whoop.strain ? { score: whoop.strain.score, kilojoules: whoop.strain.kilojoules } : null,
      } : { recovery: null, sleep: null, strain: null },
      recentWorkouts,
      userProfile: {
        experience: profile?.experience || null,
        goal: profile?.goal || null,
      },
    });
  }, [whoop?.connected, workouts.length]);

  // Use AI score if available, otherwise fall back to WHOOP raw score
  const score = readiness?.readinessScore ?? whoop?.recovery?.score ?? null;
  const scoreColor = score != null ? getScoreColor(score) : '#00ff00';
  const scoreInfo = score != null ? getScoreLabel(score) : { label: 'No Data', detail: 'Connect a wearable for insights' };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
          <div><h3 className="font-bold text-lg">Readiness Score</h3><p className="text-xs text-gray-500 mt-0.5">How we calculate your daily readiness</p></div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Score Hero */}
          <div className="rounded-2xl p-5 border" style={{ background: `linear-gradient(135deg, ${scoreColor}20, ${scoreColor}08)`, borderColor: `${scoreColor}30` }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Today's Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{score ?? '—'}</span>
                  {score != null && <span className="text-xl text-gray-500">/ 100</span>}
                </div>
              </div>
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${scoreColor}, ${scoreColor}cc)` }}>
                <Zap className="w-10 h-10 text-black" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-sm" style={{ color: scoreColor }}>{scoreInfo.label}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">{scoreInfo.detail}</span>
            </div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${score ?? 0}%`, backgroundColor: scoreColor }}></div>
            </div>
          </div>

          {/* WHOOP not connected banner */}
          {!whoop?.connected && (
            <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900 flex items-start gap-3">
              <div className="p-2 bg-[#00ff00]/10 rounded-lg"><Link2 className="w-4 h-4 text-[#00ff00]" /></div>
              <div>
                <h5 className="font-semibold text-sm mb-1">Connect WHOOP for Real-Time Metrics</h5>
                <p className="text-xs text-gray-400">Link your WHOOP band in Integrations to see live recovery, HRV, sleep quality, and strain data here.</p>
              </div>
            </div>
          )}

          {/* AI Insight */}
          <div>
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Brain className="w-4 h-4 text-[#00ff00]" />What This Means For You</h4>
            <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                {readinessLoading
                  ? "Analyzing your biometric data and training history..."
                  : readiness?.coachingText
                    ? readiness.coachingText
                    : hasData && score != null
                      ? score >= 67
                        ? "Based on your data, you're in great shape for today's workout. Your body has recovered well and is primed for a challenging session."
                        : score >= 34
                          ? "Your recovery is moderate today. Consider reducing intensity or focusing on technique-based work rather than max effort."
                          : "Your body needs more recovery. Consider active rest like walking or yoga, and prioritize sleep tonight."
                      : "Connect your WHOOP to get personalized training recommendations based on your recovery data."}
              </p>
              <div className="border rounded-xl p-3" style={{ background: `${scoreColor}10`, borderColor: `${scoreColor}20` }}>
                <p className="text-xs font-semibold mb-1 flex items-center gap-1.5" style={{ color: scoreColor }}>
                  AI Recommendation
                  {readinessLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                </p>
                <p className="text-xs text-gray-400">
                  {readiness
                    ? <>We recommend training at <span className="text-white font-semibold">{readiness.intensityRecommendation}</span> intensity today. {readiness.recommendation}</>
                    : hasData && score != null
                      ? score >= 67
                        ? <>We've adjusted your training intensity to <span className="text-white font-semibold">85-95%</span> of your max capacity. This is a perfect day to push for higher weight or increased volume on compound lifts.</>
                        : score >= 34
                          ? <>We recommend training at <span className="text-white font-semibold">60-75%</span> intensity today. Focus on form and moderate volume.</>
                          : <>We recommend <span className="text-white font-semibold">active recovery</span> today — light cardio, mobility work, or stretching.</>
                      : <>Connect WHOOP to unlock AI-powered intensity recommendations tailored to your daily recovery.</>}
                </p>
              </div>
            </div>
          </div>

          {/* Key Factors */}
          <div>
            <h4 className="font-bold text-sm mb-3">Key Factors Contributing to Your Score</h4>
            <div className="space-y-3">
              {/* Sleep */}
              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                <div className="flex items-start gap-3"><div className="p-2 bg-blue-500/10 rounded-lg"><Moon className="w-4 h-4 text-blue-400" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-semibold text-sm">Sleep Quality</h5>
                      <span className="text-xs font-semibold" style={{ color: whoop?.sleep?.sleepScore != null ? getScoreColor(whoop.sleep.sleepScore) : '#6b7280' }}>
                        {whoop?.sleep?.sleepScore != null ? getRating(whoop.sleep.sleepScore, [50, 75]) : '—'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {whoop?.sleep
                        ? `${formatDuration(whoop.sleep.qualityDuration)} total • ${formatDuration(whoop.sleep.deepSleepDuration)} deep sleep`
                        : 'No sleep data available'}
                    </p>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${whoop?.sleep?.sleepScore ?? 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* HRV */}
              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                <div className="flex items-start gap-3"><div className="p-2 bg-red-500/10 rounded-lg"><Heart className="w-4 h-4 text-red-400" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-semibold text-sm">Heart Rate Variability</h5>
                      <span className="text-xs font-semibold" style={{ color: whoop?.recovery?.hrv != null ? getScoreColor(Math.min(whoop.recovery.hrv, 100)) : '#6b7280' }}>
                        {whoop?.recovery?.hrv != null ? getRating(whoop.recovery.hrv, [40, 65]) : '—'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {whoop?.recovery?.hrv != null ? `${whoop.recovery.hrv} ms` : 'No HRV data available'}
                    </p>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min((whoop?.recovery?.hrv ?? 0) / 1.2, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recovery / Resting HR */}
              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                <div className="flex items-start gap-3"><div className="p-2 bg-orange-500/10 rounded-lg"><Activity className="w-4 h-4 text-orange-400" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-semibold text-sm">Recovery Status</h5>
                      <span className="text-xs font-semibold" style={{ color: score != null ? getScoreColor(score) : '#6b7280' }}>
                        {score != null ? (score >= 67 ? 'Recovered' : score >= 34 ? 'Recovering' : 'Strained') : '—'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {whoop?.recovery?.restingHeartRate != null ? `Resting HR: ${whoop.recovery.restingHeartRate} bpm` : 'No recovery data available'}
                    </p>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: `${score ?? 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strain / Training Load */}
              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                <div className="flex items-start gap-3"><div className="p-2 bg-purple-500/10 rounded-lg"><TrendingUp className="w-4 h-4 text-purple-400" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-semibold text-sm">Training Load</h5>
                      <span className="text-xs font-semibold" style={{ color: whoop?.strain ? (whoop.strain.score <= 14 ? '#facc15' : '#ef4444') : '#6b7280' }}>
                        {whoop?.strain ? (whoop.strain.score <= 10 ? 'Light' : whoop.strain.score <= 14 ? 'Balanced' : 'Overreaching') : '—'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {whoop?.strain
                        ? `Strain: ${whoop.strain.score} / 21 • ${Math.round(whoop.strain.kilojoules)} kJ burned`
                        : 'No strain data available'}
                    </p>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full" style={{ width: `${whoop?.strain ? Math.round((whoop.strain.score / 21) * 100) : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Algorithm Explainer */}
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
