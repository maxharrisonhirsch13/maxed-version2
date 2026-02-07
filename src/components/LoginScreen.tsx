import { useState } from 'react';
import { Sparkles, Users, TrendingUp, Zap, ChevronRight, ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const { signUp, signIn } = useAuth();
  const [step, setStep] = useState<'splash' | 'signup' | 'login'>('splash');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);

    if (error) {
      setError(error.message);
    }
    // On success, AuthContext auto-updates session → App.tsx re-renders past login
  };

  const handleSignIn = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      setError(error.message);
    }
  };

  // Splash screen (default)
  if (step === 'splash') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-between px-6 py-12 overflow-hidden relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00ff00]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#00ff00]/3 rounded-full blur-[100px] pointer-events-none" />

        <div />

        <div className="flex flex-col items-center relative z-10">
          <div className="w-28 h-28 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-[#00ff00]/30">
            <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 38V18L16 10L22 18V38H18V24H14V38H10Z" fill="black"/>
              <path d="M26 38V18L32 10L38 18V38H34V24H30V38H26Z" fill="black"/>
            </svg>
          </div>

          <h1 className="text-6xl font-bold text-center mb-4 tracking-tight">Maxed</h1>
          <p className="text-lg text-center font-medium mb-2 text-white/90">
            Train smarter. Lift heavier. Together.
          </p>
          <p className="text-gray-500 text-center text-sm max-w-xs mb-10">
            Your AI-powered training partner that learns your body, predicts your PRs, and keeps you connected with your gym crew.
          </p>

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

        <div className="w-full max-w-sm space-y-3 relative z-10">
          <button
            onClick={() => setStep('signup')}
            className="w-full bg-[#00ff00] text-black font-bold py-4 rounded-2xl text-base hover:bg-[#00dd00] transition-all active:scale-[0.98] shadow-lg shadow-[#00ff00]/20"
          >
            Get Started
          </button>

          <button
            onClick={() => setStep('login')}
            className="w-full bg-[#1a1a1a] text-white font-bold py-4 rounded-2xl text-base hover:bg-[#252525] transition-all active:scale-[0.98] border border-gray-800"
          >
            I Already Have an Account
          </button>

          <p className="text-xs text-gray-600 text-center pt-4">
            By continuing, you agree to our{' '}
            <a href="/terms.html" target="_blank" className="text-gray-400 underline hover:text-white">Terms</a>
            {' '}&{' '}
            <a href="/privacy.html" target="_blank" className="text-gray-400 underline hover:text-white">Privacy Policy</a>
          </p>
        </div>
      </div>
    );
  }

  // Sign Up / Login form
  const isSignUp = step === 'signup';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-6 py-8 overflow-hidden relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00ff00]/5 rounded-full blur-[120px] pointer-events-none" />

      <button
        onClick={() => { setStep('splash'); setError(''); setEmail(''); setPassword(''); setConfirmPassword(''); }}
        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors mb-8 -ml-1 relative z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#00ff00]/20">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 38V18L16 10L22 18V38H18V24H14V38H10Z" fill="black"/>
            <path d="M26 38V18L32 10L38 18V38H34V24H30V38H26Z" fill="black"/>
          </svg>
        </div>

        <h2 className="text-2xl font-bold mb-2">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="text-gray-400 text-sm mb-8">
          {isSignUp ? 'Enter your email to get started' : 'Sign in to your account'}
        </p>

        <div className="w-full space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">EMAIL</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff00] transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'At least 6 characters' : 'Enter your password'}
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl pl-11 pr-11 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff00] transition-colors"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (signup only) */}
          {isSignUp && (
            <div>
              <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">CONFIRM PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff00] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={isSignUp ? handleSignUp : handleSignIn}
            disabled={loading}
            className="w-full bg-[#00ff00] text-black font-bold py-4 rounded-2xl text-base hover:bg-[#00dd00] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#00ff00]/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Switch between signup/login */}
          <p className="text-center text-sm text-gray-500 pt-2">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setStep(isSignUp ? 'login' : 'signup'); setError(''); }}
              className="text-[#00ff00] font-medium hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
