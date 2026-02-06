import { ArrowLeft, Check, Link2, Activity, Heart, Watch, Bike, Zap, Moon, TrendingUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWhoopStatus } from '../hooks/useWhoopStatus';
import { supabase } from '../lib/supabase';

interface IntegrationsPageProps {
  onBack: () => void;
}

interface IntegrationApp {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  dataTypes: string[];
  connected: boolean;
}

export function IntegrationsPage({ onBack }: IntegrationsPageProps) {
  const { user } = useAuth();
  const { connected: whoopConnected, loading: whoopLoading, refetch: refetchWhoop } = useWhoopStatus();
  const [whoopConnecting, setWhoopConnecting] = useState(false);
  const [whoopDisconnecting, setWhoopDisconnecting] = useState(false);

  const [apps, setApps] = useState<IntegrationApp[]>([
    { id: 'apple-health', name: 'Apple Health', description: 'Sync workouts, heart rate, and activity data', icon: <Heart className="w-6 h-6" />, color: 'from-red-500 to-pink-500', dataTypes: ['Heart Rate', 'Steps', 'Calories', 'Sleep', 'Workouts'], connected: true },
    { id: 'strava', name: 'Strava', description: 'Share your workouts with the Strava community', icon: <Bike className="w-6 h-6" />, color: 'from-orange-500 to-red-500', dataTypes: ['Running', 'Cycling', 'Activities'], connected: true },
    { id: 'fitbit', name: 'Fitbit', description: 'Import heart rate and activity tracking', icon: <Activity className="w-6 h-6" />, color: 'from-blue-400 to-cyan-400', dataTypes: ['Heart Rate', 'Steps', 'Sleep', 'Active Minutes'], connected: false },
    { id: 'garmin', name: 'Garmin Connect', description: 'Sync activities and training data', icon: <Watch className="w-6 h-6" />, color: 'from-blue-600 to-blue-800', dataTypes: ['Workouts', 'Heart Rate', 'VO2 Max', 'Training Load'], connected: false },
    { id: 'myfitnesspal', name: 'MyFitnessPal', description: 'Connect nutrition with your workouts', icon: <TrendingUp className="w-6 h-6" />, color: 'from-blue-500 to-indigo-600', dataTypes: ['Calories', 'Macros', 'Weight', 'Nutrition'], connected: true },
    { id: 'oura', name: 'Oura Ring', description: 'Track sleep quality and readiness', icon: <Moon className="w-6 h-6" />, color: 'from-purple-600 to-indigo-700', dataTypes: ['Sleep', 'Readiness', 'HRV', 'Body Temperature'], connected: false }
  ]);

  const handleToggleConnection = (appId: string) => {
    setApps(apps.map(app => app.id === appId ? { ...app, connected: !app.connected } : app));
  };

  const handleWhoopConnect = async () => {
    if (!user) return;
    setWhoopConnecting(true);
    try {
      const res = await fetch(`/api/whoop-auth?userId=${user.id}`);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Failed to start WHOOP OAuth:', err);
    }
    setWhoopConnecting(false);
  };

  const handleWhoopDisconnect = async () => {
    const { session } = (await supabase.auth.getSession()).data;
    if (!session) return;
    setWhoopDisconnecting(true);
    try {
      await fetch('/api/whoop-disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      await refetchWhoop();
    } catch (err) {
      console.error('Failed to disconnect WHOOP:', err);
    }
    setWhoopDisconnecting(false);
  };

  const connectedCount = apps.filter(app => app.connected).length + (whoopConnected ? 1 : 0);

  // Build the WHOOP card separately
  const whoopApp = {
    id: 'whoop',
    name: 'WHOOP',
    description: 'Track recovery and strain metrics',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-gray-700 to-gray-900',
    dataTypes: ['Recovery', 'Strain', 'HRV', 'Sleep Performance'],
    connected: whoopConnected,
  };

  // All apps for rendering: connected first, then available
  const connectedApps = [...apps.filter(app => app.connected), ...(whoopConnected ? [whoopApp] : [])];
  const availableApps = [...apps.filter(app => !app.connected), ...(!whoopConnected ? [whoopApp] : [])];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="sticky top-0 bg-black/90 backdrop-blur-lg border-b border-gray-900 z-10">
        <div className="px-5 py-4 flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl transition-colors -ml-2"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex-1"><h1 className="font-bold text-lg">App Integrations</h1><p className="text-xs text-gray-500">{connectedCount} connected</p></div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="bg-gradient-to-br from-[#00ff00]/10 to-[#00ff00]/5 rounded-2xl p-4 border border-[#00ff00]/20 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#00ff00]/10 rounded-xl mt-0.5"><Link2 className="w-4 h-4 text-[#00ff00]" /></div>
            <div className="flex-1"><h3 className="font-bold text-sm mb-1">Sync Your Fitness Data</h3><p className="text-xs text-gray-400 leading-relaxed">Connect your favorite fitness apps to automatically sync workouts, track health metrics, and get personalized insights based on your complete fitness profile.</p></div>
          </div>
        </div>

        {connectedApps.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Connected ({connectedApps.length})</h2>
            <div className="space-y-3">
              {connectedApps.map((app) => (
                <IntegrationCard
                  key={app.id}
                  app={app}
                  onToggle={app.id === 'whoop' ? handleWhoopDisconnect : () => handleToggleConnection(app.id)}
                  isLoading={app.id === 'whoop' && (whoopDisconnecting || whoopLoading)}
                />
              ))}
            </div>
          </div>
        )}

        {availableApps.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Available Integrations</h2>
            <div className="space-y-3">
              {availableApps.map((app) => (
                <IntegrationCard
                  key={app.id}
                  app={app}
                  onToggle={app.id === 'whoop' ? handleWhoopConnect : () => handleToggleConnection(app.id)}
                  isLoading={app.id === 'whoop' && (whoopConnecting || whoopLoading)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface IntegrationCardProps {
  app: {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    dataTypes: string[];
    connected: boolean;
  };
  onToggle: () => void;
  isLoading?: boolean;
}

function IntegrationCard({ app, onToggle, isLoading }: IntegrationCardProps) {
  return (
    <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-900">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${app.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>{app.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm">{app.name}</h3>
            {app.connected && (<div className="flex items-center gap-1 bg-[#00ff00]/10 px-2 py-0.5 rounded-full"><Check className="w-3 h-3 text-[#00ff00]" /><span className="text-[10px] font-medium text-[#00ff00]">Connected</span></div>)}
          </div>
          <p className="text-xs text-gray-400 mb-3">{app.description}</p>
          {app.connected && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {app.dataTypes.map((type, idx) => (<span key={idx} className="text-[10px] bg-black/50 text-gray-400 px-2 py-1 rounded-lg">{type}</span>))}
            </div>
          )}
          <button
            onClick={onToggle}
            disabled={isLoading}
            className={`w-full font-medium py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 ${
              app.connected ? 'bg-[#1a1a1a] hover:bg-[#252525] text-gray-300' : 'bg-[#00ff00] hover:bg-[#00dd00] text-black'
            } ${isLoading ? 'opacity-50' : ''}`}
          >
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            {app.connected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  );
}
