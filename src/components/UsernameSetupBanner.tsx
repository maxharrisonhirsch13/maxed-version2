import { useState } from 'react';
import { AtSign, Check, Loader2, X } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';

export function UsernameSetupBanner() {
  const { updateUsername } = useProfile();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleClaim = async () => {
    setError(null);
    setSaving(true);
    try {
      await updateUsername(username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set username');
    } finally {
      setSaving(false);
    }
  };

  const isValid = /^[a-z0-9_]{3,20}$/.test(username.toLowerCase());

  return (
    <div className="bg-gradient-to-r from-[#00ff00]/10 to-[#00ff00]/5 border border-[#00ff00]/20 rounded-2xl p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AtSign className="w-5 h-5 text-[#00ff00]" />
          <div>
            <h3 className="font-bold text-sm">Claim your username</h3>
            <p className="text-xs text-gray-400">Required to connect with friends</p>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="p-1 hover:bg-white/5 rounded-lg">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')); setError(null); }}
            placeholder="username"
            maxLength={20}
            className="w-full bg-black/50 border border-gray-800 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#00ff00] transition-colors"
          />
        </div>
        <button
          onClick={handleClaim}
          disabled={!isValid || saving}
          className="px-4 py-2.5 bg-[#00ff00] text-black font-bold rounded-xl text-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Claim
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      {username.length > 0 && username.length < 3 && <p className="text-xs text-gray-500 mt-2">Must be at least 3 characters</p>}
    </div>
  );
}
