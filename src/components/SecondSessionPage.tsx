import { X, Dumbbell, Heart, ChevronRight } from 'lucide-react';

interface SecondSessionPageProps {
  onClose: () => void;
  onSelectType: (type: 'strength' | 'cardio') => void;
}

export function SecondSessionPage({ onClose, onSelectType }: SecondSessionPageProps) {
  return (
    <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Add Second Session</h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">What type of session would you like to add?</p>

        <div className="space-y-3">
          <button
            onClick={() => onSelectType('strength')}
            className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-6 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-xl flex items-center justify-center">
                <Dumbbell className="w-7 h-7 text-black" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg mb-1">Strength Training</h3>
                <p className="text-sm text-gray-400">Add a second lifting session</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </button>

          <button
            onClick={() => onSelectType('cardio')}
            className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-6 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg mb-1">Cardio Session</h3>
                <p className="text-sm text-gray-400">Add a cardio workout</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="mt-6 bg-gradient-to-br from-[#00ff00]/10 to-[#00cc00]/5 border border-[#00ff00]/20 rounded-xl p-4">
          <p className="text-sm text-gray-300">
            <span className="text-[#00ff00] font-semibold">Note:</span> Adding a second session
            will be tracked separately in your daily activity log.
          </p>
        </div>
      </div>
    </div>
  );
}
