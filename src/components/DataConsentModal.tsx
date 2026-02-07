import { Shield, Lock, Eye, X, ChevronRight } from 'lucide-react';

interface DataConsentModalProps {
  deviceName: string;
  deviceIcon: React.ReactNode;
  dataPoints: { label: string; description: string }[];
  onApprove: () => void;
  onDecline: () => void;
}

export function DataConsentModal({ deviceName, deviceIcon, dataPoints, onApprove, onDecline }: DataConsentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[70] flex items-end sm:items-center justify-center">
      <div className="w-full max-w-md bg-gradient-to-b from-[#111] to-black rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5">
                {deviceIcon}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Connecting to</p>
                <p className="font-bold text-base">{deviceName}</p>
              </div>
            </div>
            <button
              onClick={onDecline}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Trust banner */}
          <div className="bg-[#00ff00]/5 border border-[#00ff00]/15 rounded-2xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#00ff00] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#00ff00] mb-1">Your data stays yours</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                We use industry-standard OAuth2 encryption. We never see your {deviceName} password and you can revoke access anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Data points */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">What we access</h3>
          <div className="space-y-2.5">
            {dataPoints.map((point, idx) => (
              <div key={idx} className="bg-white/[0.03] rounded-xl p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Eye className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{point.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{point.description}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-5 mb-3">How we use it</h3>
          <div className="space-y-2.5">
            <div className="bg-white/[0.03] rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-7 h-7 bg-[#00ff00]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm">1</span>
              </div>
              <div>
                <p className="text-sm font-medium">Personalize your workouts</p>
                <p className="text-xs text-gray-500 mt-0.5">Adjust intensity based on your recovery and readiness</p>
              </div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-7 h-7 bg-[#00ff00]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm">2</span>
              </div>
              <div>
                <p className="text-sm font-medium">Show readiness insights</p>
                <p className="text-xs text-gray-500 mt-0.5">Display your daily recovery score and sleep quality</p>
              </div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-7 h-7 bg-[#00ff00]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm">3</span>
              </div>
              <div>
                <p className="text-sm font-medium">Track your progress</p>
                <p className="text-xs text-gray-500 mt-0.5">Long-term trends in HRV, sleep, and training load</p>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-5 mb-3">What we never do</h3>
          <div className="bg-white/[0.03] rounded-xl p-3.5 space-y-2.5">
            {[
              'Sell or share your data with third parties',
              'Access your account settings or personal info',
              'Store your password — we use secure token exchange',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <p className="text-xs text-gray-400">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pt-4 pb-6 space-y-2.5 border-t border-white/5">
          <button
            onClick={onApprove}
            className="w-full bg-[#00ff00] text-black font-bold py-4 rounded-2xl text-sm hover:bg-[#00dd00] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Approve & Connect
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onDecline}
            className="w-full text-gray-400 font-medium py-3 rounded-2xl text-sm hover:bg-white/5 transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}

// Pre-built data point configs for each device
export const WHOOP_DATA_POINTS = [
  { label: 'Recovery Score', description: 'Daily 0–100 score based on HRV, resting heart rate, and sleep' },
  { label: 'Sleep Performance', description: 'Sleep stages, duration, and quality metrics' },
  { label: 'Strain', description: 'Daily cardiovascular load from workouts and activity' },
  { label: 'Heart Rate Variability', description: 'HRV trends to gauge nervous system recovery' },
];

export const OURA_DATA_POINTS = [
  { label: 'Readiness Score', description: 'Daily score reflecting how prepared your body is to perform' },
  { label: 'Sleep Analysis', description: 'Sleep stages, efficiency, and restfulness metrics' },
  { label: 'Activity Data', description: 'Steps, active calories, and movement tracking' },
  { label: 'Body Temperature', description: 'Nightly temperature deviations for recovery insights' },
];

export const GARMIN_DATA_POINTS = [
  { label: 'Body Battery', description: 'Energy level tracking throughout the day (0–100)' },
  { label: 'Stress Score', description: 'Heart-rate-based stress measurement' },
  { label: 'Sleep Data', description: 'Sleep stages and sleep score' },
  { label: 'Training Status', description: 'Training load, VO2 max, and recovery time' },
];
