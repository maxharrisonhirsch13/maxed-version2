interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-24 h-24 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-[28px] flex items-center justify-center mb-6 shadow-2xl shadow-[#00ff00]/20">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 38V18L16 10L22 18V38H18V24H14V38H10Z" fill="white"/>
            <path d="M26 38V18L32 10L38 18V38H34V24H30V38H26Z" fill="white"/>
          </svg>
        </div>

        <h1 className="text-5xl font-bold text-center mb-3">Maxed</h1>
        <p className="text-gray-400 text-center text-base font-medium mb-2">
          AI-powered strength training
        </p>
        <p className="text-gray-500 text-center text-sm">
          Intelligent progress tracking. Real results.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3 mt-8">
        <button
          onClick={onLogin}
          className="w-full bg-white text-black font-bold py-4 rounded-2xl text-base hover:bg-gray-100 transition-all active:scale-[0.98] shadow-lg"
        >
          Create Account
        </button>

        <button
          onClick={onLogin}
          className="w-full bg-[#1a1a1a] text-white font-bold py-4 rounded-2xl text-base hover:bg-[#252525] transition-all active:scale-[0.98] border border-gray-800"
        >
          Sign In
        </button>
      </div>

      <div className="absolute bottom-8 text-center">
        <p className="text-xs text-gray-600">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
