import { useState, useEffect } from 'react';
import { X, Dumbbell, Clock, Calendar, Activity, Trophy, Loader2, Send, Trash2, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { renderCaption } from '../utils/renderCaption';
import { useAuth } from '../context/AuthContext';
import type { FeedItem, ReactionEmoji, PostComment } from '../types';

const REACTION_EMOJIS: { key: ReactionEmoji; icon: string }[] = [
  { key: 'fire', icon: '🔥' },
  { key: 'strong', icon: '💪' },
  { key: 'cap', icon: '🧢' },
  { key: 'hundred', icon: '💯' },
  { key: 'clap', icon: '👏' },
];

interface WorkoutDetailModalProps {
  item: FeedItem;
  onClose: () => void;
  toggleReaction: (postId: string, emoji: ReactionEmoji) => void;
  addComment: (postId: string, body: string) => Promise<PostComment | null>;
  fetchComments: (postId: string) => Promise<PostComment[]>;
  deleteComment: (commentId: string, postId: string) => void;
}

export function WorkoutDetailModal({ item, onClose, toggleReaction, addComment, fetchComments, deleteComment }: WorkoutDetailModalProps) {
  const { user } = useAuth();
  const { user: postUser, workout, post } = item;
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadComments();
  }, [post.id]);

  async function loadComments() {
    setCommentsLoading(true);
    const data = await fetchComments(post.id);
    setComments(data);
    setCommentsLoading(false);
  }

  async function handleSubmitComment() {
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    const newComment = await addComment(post.id, commentText);
    if (newComment) {
      setComments(prev => [...prev, newComment]);
      setCommentText('');
    }
    setSubmittingComment(false);
  }

  function handleDeleteComment(commentId: string) {
    deleteComment(commentId, post.id);
    setComments(prev => prev.filter(c => c.id !== commentId));
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const gradients = [
    'from-purple-500 to-blue-500',
    'from-pink-500 to-orange-500',
    'from-green-500 to-teal-500',
    'from-yellow-500 to-red-500',
    'from-indigo-500 to-purple-500',
  ];

  const getGradient = (name: string) => {
    const idx = name.charCodeAt(0) % gradients.length;
    return gradients[idx];
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatWorkoutType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Compute total volume across all exercises
  const totalVolume = workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((exTotal, set) => {
      if (set.weightLbs && set.reps) {
        return exTotal + (set.weightLbs * set.reps);
      }
      return exTotal;
    }, 0);
  }, 0);

  const isCardioSet = (set: FeedItem['workout']['exercises'][0]['sets'][0]) => {
    return (set.durationMinutes !== null && set.durationMinutes !== undefined) ||
           (set.distanceMiles !== null && set.distanceMiles !== undefined);
  };

  const hasWeightSets = (exercise: FeedItem['workout']['exercises'][0]) => {
    return exercise.sets.some(s => s.weightLbs !== null || s.reps !== null);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            {postUser.avatarUrl ? (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                <ImageWithFallback src={postUser.avatarUrl} alt={postUser.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(postUser.name)} flex items-center justify-center font-bold text-xs`}>
                {getInitials(postUser.name)}
              </div>
            )}
            <div>
              <h3 className="font-bold text-sm">{postUser.name}</h3>
              {postUser.username && <p className="text-xs text-gray-500">@{postUser.username}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Workout Type Badge & Date */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1.5 bg-[#00ff00]/10 text-[#00ff00] text-xs font-bold rounded-lg">
              {formatWorkoutType(workout.workoutType)}
            </span>
            <div className="text-right">
              <p className="text-xs text-gray-400">{formatDate(workout.startedAt)}</p>
              <p className="text-[10px] text-gray-600">{formatTime(workout.startedAt)}</p>
            </div>
          </div>

          {/* Tagged users */}
          {item.taggedUsers && item.taggedUsers.length > 0 && (
            <p className="text-xs text-gray-500 mb-3">
              <span className="text-gray-600">with </span>
              {item.taggedUsers.map((t, i) => (
                <span key={t.id}>
                  <span className="text-[#00ff00]/70 font-medium">@{t.username || t.name.split(' ')[0].toLowerCase()}</span>
                  {i < item.taggedUsers.length - 1 && <span className="text-gray-600">, </span>}
                </span>
              ))}
            </p>
          )}

          {/* Post image */}
          {post.imageUrl && (
            <div className="mb-4 rounded-2xl overflow-hidden">
              <img src={post.imageUrl} alt="Post" className="w-full aspect-square object-cover" />
            </div>
          )}

          {/* Caption */}
          {post.caption && (
            <div className="bg-[#0a0a0a] border-l-2 border-[#00ff00]/40 rounded-r-xl px-4 py-3 mb-5">
              <p className="text-sm text-gray-300 italic leading-relaxed">{renderCaption(post.caption)}</p>
            </div>
          )}

          {/* Reaction bar */}
          <div className="flex items-center gap-2 mb-5">
            {REACTION_EMOJIS.map(({ key, icon }) => {
              const reaction = item.reactions.find(r => r.emoji === key);
              const count = reaction?.count ?? 0;
              const reacted = reaction?.reacted ?? false;
              return (
                <button
                  key={key}
                  onClick={() => toggleReaction(post.id, key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                    reacted
                      ? 'bg-[#00ff00]/15 border border-[#00ff00]/30'
                      : count > 0
                        ? 'bg-gray-800/50 border border-gray-700/50'
                        : 'bg-gray-800/30 border border-transparent hover:bg-gray-800/50'
                  }`}
                >
                  <span className="text-base">{icon}</span>
                  {count > 0 && <span className={`font-medium ${reacted ? 'text-[#00ff00]' : 'text-gray-400'}`}>{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Duration & Stats */}
          <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900 mb-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00ff00]/10 rounded-lg">
                  <Clock className="w-4 h-4 text-[#00ff00]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Duration</p>
                  <p className="text-sm font-bold">{workout.durationMinutes ?? '--'} min</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Exercises</p>
                  <p className="text-sm font-bold">{workout.exercises.length}</p>
                </div>
              </div>
              {totalVolume > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Volume</p>
                    <p className="text-sm font-bold">{totalVolume.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-3">
            {workout.exercises.map((exercise, idx) => {
              const exerciseVolume = exercise.sets.reduce((sum, s) => {
                if (s.weightLbs && s.reps) return sum + (s.weightLbs * s.reps);
                return sum;
              }, 0);
              const isCardio = !hasWeightSets(exercise) && exercise.sets.some(isCardioSet);

              return (
                <div key={idx} className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
                  {/* Exercise Name */}
                  <div className="flex items-center gap-2 mb-3">
                    {isCardio ? (
                      <Activity className="w-4 h-4 text-[#00ff00]" />
                    ) : (
                      <Dumbbell className="w-4 h-4 text-[#00ff00]" />
                    )}
                    <h4 className="font-bold text-sm">{exercise.exerciseName}</h4>
                  </div>

                  {/* Sets */}
                  {isCardio ? (
                    <div className="space-y-2">
                      {exercise.sets.map((set, setIdx) => (
                        <div key={setIdx} className="flex items-center justify-between text-sm bg-black/30 rounded-xl px-3 py-2.5">
                          <span className="text-gray-500 font-medium">Set {set.setNumber}</span>
                          <div className="flex items-center gap-3">
                            {set.durationMinutes !== null && set.durationMinutes !== undefined && (
                              <span className="font-semibold">{set.durationMinutes} min</span>
                            )}
                            {set.distanceMiles !== null && set.distanceMiles !== undefined && (
                              <>
                                <span className="text-gray-600">|</span>
                                <span className="font-semibold">{set.distanceMiles} mi</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {exercise.sets.map((set, setIdx) => (
                          <div key={setIdx} className="flex items-center justify-between text-sm bg-black/30 rounded-xl px-3 py-2.5">
                            <span className="text-gray-500 font-medium">Set {set.setNumber}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">
                                {set.weightLbs !== null && set.weightLbs !== undefined && set.weightLbs > 0
                                  ? `${set.weightLbs} lbs`
                                  : 'Bodyweight'}
                              </span>
                              <span className="text-gray-600">&times;</span>
                              <span className="font-semibold">{set.reps ?? '--'} reps</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {exerciseVolume > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-900/50 flex items-center justify-between text-xs">
                          <span className="text-gray-500">Exercise Volume</span>
                          <span className="text-[#00ff00] font-semibold">{exerciseVolume.toLocaleString()} lbs</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total Volume Footer */}
          {totalVolume > 0 && (
            <div className="mt-5 bg-gradient-to-r from-[#00ff00]/10 to-[#00ff00]/5 border border-[#00ff00]/20 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#00ff00]" />
                <span className="font-semibold text-sm">Total Volume</span>
              </div>
              <span className="text-lg font-bold text-[#00ff00]">{totalVolume.toLocaleString()} lbs</span>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm">Comments ({comments.length})</h3>
            </div>

            {commentsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-4 h-4 text-[#00ff00] animate-spin" />
                <span className="text-xs text-gray-400 ml-2">Loading comments...</span>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-4">No comments yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5">
                    {comment.userAvatarUrl ? (
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                        <img src={comment.userAvatarUrl} alt={comment.userName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getGradient(comment.userName)} flex items-center justify-center font-bold text-[9px] flex-shrink-0`}>
                        {getInitials(comment.userName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{comment.userName}</span>
                        {comment.userUsername && <span className="text-[10px] text-gray-600">@{comment.userUsername}</span>}
                        <span className="text-[10px] text-gray-700">{timeAgo(comment.createdAt)}</span>
                        {user && comment.userId === user.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="ml-auto p-1 text-gray-700 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{comment.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comment Input Bar */}
        <div className="p-4 border-t border-gray-900 flex items-center gap-3">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value.slice(0, 500))}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment(); } }}
            placeholder="Add a comment..."
            className="flex-1 bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00ff00] transition-colors"
          />
          <button
            onClick={handleSubmitComment}
            disabled={!commentText.trim() || submittingComment}
            className="p-2.5 bg-[#00ff00] rounded-xl text-black disabled:opacity-30 transition-opacity"
          >
            {submittingComment ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
