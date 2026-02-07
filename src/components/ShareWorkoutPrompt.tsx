import { useState } from 'react';
import { Share, Loader2, Dumbbell, Clock, Trophy } from 'lucide-react';
import { useWorkoutPosts } from '../hooks/useWorkoutPosts';

interface ShareWorkoutPromptProps {
  workoutId: string;
  workoutSummary: {
    exerciseCount: number;
    durationMinutes: number;
    totalVolume: number;
  };
  onDone: () => void;
}

export function ShareWorkoutPrompt({ workoutId, workoutSummary, onDone }: ShareWorkoutPromptProps) {
  const { shareWorkout } = useWorkoutPosts();
  const [caption, setCaption] = useState('');
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    setError(null);
    setSharing(true);
    try {
      await shareWorkout(workoutId, caption.trim() || undefined);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share workout');
      setSharing(false);
    }
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1000) {
      return `${(vol / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return vol.toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="w-full max-w-md bg-gradient-to-b from-[#0f0f0f] to-black rounded-t-3xl shadow-2xl overflow-hidden">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-700 rounded-full" />
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-[#00ff00]/10 rounded-xl">
              <Share className="w-5 h-5 text-[#00ff00]" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Share Your Workout</h2>
              <p className="text-xs text-gray-400">Let your friends know you crushed it</p>
            </div>
          </div>

          {/* Workout Summary */}
          <div className="bg-[#0a0a0a] border border-gray-900 rounded-2xl p-4 mb-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="flex justify-center mb-1.5">
                  <Dumbbell className="w-4 h-4 text-[#00ff00]" />
                </div>
                <p className="text-lg font-bold">{workoutSummary.exerciseCount}</p>
                <p className="text-[10px] text-gray-500">Exercises</p>
              </div>
              <div className="text-center border-x border-gray-800">
                <div className="flex justify-center mb-1.5">
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-lg font-bold">{workoutSummary.durationMinutes}</p>
                <p className="text-[10px] text-gray-500">Minutes</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1.5">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-lg font-bold">{formatVolume(workoutSummary.totalVolume)}</p>
                <p className="text-[10px] text-gray-500">lbs Volume</p>
              </div>
            </div>
          </div>

          {/* Caption Input */}
          <div className="mb-5">
            <div className="relative">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, 500))}
                placeholder="Add a caption (optional)..."
                rows={3}
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#00ff00] transition-colors"
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-gray-600">
                {caption.length}/500
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 mb-4 text-center">{error}</p>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            disabled={sharing}
            className="w-full bg-[#00ff00] hover:bg-[#00dd00] text-black font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {sharing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share className="w-4 h-4" />
                Share to Feed
              </>
            )}
          </button>

          {/* Skip Button */}
          <button
            onClick={onDone}
            disabled={sharing}
            className="w-full mt-3 py-3 text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
