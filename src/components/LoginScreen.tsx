import { Sparkles, Users, TrendingUp, Zap } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-between px-6 py-12 overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00ff00]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#00ff00]/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Top spacer */}
      <div />

      {/* Main content */}
      <div className="flex flex-col items-center relative z-10">
        {/* Logo */}
        <div className="w-28 h-28 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-[#00ff00]/30">
          <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 38V18L16 10L22 18V38H18V24H14V38H10Z" fill="black"/>
            <path d="M26 38V18L32 10L38 18V38H34V24H30V38H26Z" fill="black"/>
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold text-center mb-4 tracking-tight">Maxed</h1>
        <p className="text-lg text-center font-medium mb-2 text-white/90">
          Train smarter. Lift heavier. Together.
        </p>
        <p className="text-gray-500 text-center text-sm max-w-xs mb-10">
          Your AI-powered training partner that learns your body, predicts your PRs, and keeps you connected with your gym crew.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-gray-800 rounded-full px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00ff00]" />
            <span className="text-xs font-medium text-gray-300">AI-Powered Plans</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-gray-800 rounded-full px-3 py-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#00ff00]" />
            <span className="text-xs font-medium text-gray-300">PR Predictions</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-gray-800 rounded-full px-3 py-1.5">
            <Users className="w-3.5 h-3.5 text-[#00ff00]" />
            <span className="text-xs font-medium text-gray-300">Social Training</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-gray-800 rounded-full px-3 py-1.5">
            <Zap className="w-3.5 h-3.5 text-[#00ff00]" />
            <span className="text-xs font-medium text-gray-300">Real-Time Coaching</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm space-y-3 relative z-10">
        <button
          onClick={onLogin}
          className="w-full bg-[#00ff00] text-black font-bold py-4 rounded-2xl text-base hover:bg-[#00dd00] transition-all active:scale-[0.98] shadow-lg shadow-[#00ff00]/20"
        >
          Get Started
        </button>

        <button
          onClick={onLogin}
          className="w-full bg-[#1a1a1a] text-white font-bold py-4 rounded-2xl text-base hover:bg-[#252525] transition-all active:scale-[0.98] border border-gray-800"
        >
          I Already Have an Account
        </button>

        <p className="text-xs text-gray-600 text-center pt-4">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
