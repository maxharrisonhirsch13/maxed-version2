import { useState } from 'react';
import { Share, Loader2, Dumbbell, Clock, Trophy, UserPlus, X } from 'lucide-react';
import { useWorkoutPosts } from '../hooks/useWorkoutPosts';
import { useFriendships } from '../hooks/useFriendships';

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
  const { friends } = useFriendships();
  const [caption, setCaption] = useState('');
  const [taggedIds, setTaggedIds] = useState<string[]>([]);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    setError(null);
    setSharing(true);
    try {
      await shareWorkout(workoutId, caption.trim() || undefined, taggedIds.length > 0 ? taggedIds : undefined);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share workout');
      setSharing(false);
    }
  };

  const toggleTag = (userId: string) => {
    setTaggedIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const removeTag = (userId: string) => {
    setTaggedIds(prev => prev.filter(id => id !== userId));
  };

  const taggedFriends = friends.filter(f => taggedIds.includes(f.userId));
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const gradients = ['from-purple-500 to-blue-500', 'from-pink-500 to-orange-500', 'from-green-500 to-teal-500', 'from-yellow-500 to-red-500', 'from-indigo-500 to-purple-500'];
  const getGradient = (name: string) => gradients[name.charCodeAt(0) % gradients.length];

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

          {/* Tag Friends */}
          {friends.length > 0 && (
            <div className="mb-4">
              {/* Tagged friends chips */}
              {taggedFriends.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {taggedFriends.map(f => (
                    <button
                      key={f.userId}
                      onClick={() => removeTag(f.userId)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-[#00ff00]/10 border border-[#00ff00]/20 rounded-full text-xs group"
                    >
                      <span className="text-[#00ff00] font-medium">@{f.username || f.name.split(' ')[0].toLowerCase()}</span>
                      <X className="w-3 h-3 text-gray-500 group-hover:text-white" />
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowTagPicker(!showTagPicker)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {taggedIds.length > 0 ? 'Tag more friends' : 'Tag friends'}
              </button>

              {/* Friend picker dropdown */}
              {showTagPicker && (
                <div className="mt-2 bg-[#111] border border-gray-800 rounded-xl max-h-36 overflow-y-auto">
                  {friends.map(friend => {
                    const isTagged = taggedIds.includes(friend.userId);
                    return (
                      <button
                        key={friend.userId}
                        onClick={() => toggleTag(friend.userId)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${isTagged ? 'bg-[#00ff00]/5' : 'hover:bg-[#1a1a1a]'}`}
                      >
                        {friend.avatarUrl ? (
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                            <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getGradient(friend.name)} flex items-center justify-center font-bold text-[10px] flex-shrink-0`}>
                            {getInitials(friend.name)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{friend.name}</p>
                          {friend.username && <p className="text-[10px] text-gray-500 truncate">@{friend.username}</p>}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isTagged ? 'border-[#00ff00] bg-[#00ff00]' : 'border-gray-600'}`}>
                          {isTagged && <span className="text-black text-[10px] font-bold">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

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
