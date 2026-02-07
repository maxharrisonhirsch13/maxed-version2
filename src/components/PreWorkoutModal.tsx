import { useState, useEffect } from 'react';
import { MapPin, Home, Navigation, Users, ChevronRight, X, Loader2, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNearbyGyms, NearbyGym } from '../hooks/useNearbyGyms';

interface PreWorkoutModalProps {
  onClose: () => void;
  onStart: (location: string) => void;
  muscleGroup: string;
}

export function PreWorkoutModal({ onClose, onStart, muscleGroup }: PreWorkoutModalProps) {
  const { profile } = useAuth();
  const isHomeGym = profile?.isHomeGym;
  const defaultGymName = profile?.gym || (isHomeGym ? 'Home Gym' : 'Gym');

  const [selectedLocation, setSelectedLocation] = useState(defaultGymName);
  const [showAlternateGyms, setShowAlternateGyms] = useState(false);
  const [alertFriends, setAlertFriends] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const { gyms: nearbyGyms, loading: gymsLoading } = useNearbyGyms(userLat, userLng);

  const handleDifferentGym = () => {
    setShowAlternateGyms(true);
    if (!userLat) {
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          setGettingLocation(false);
        },
        () => setGettingLocation(false),
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSelectNearbyGym = (gym: NearbyGym) => {
    setSelectedLocation(gym.name);
    setShowAlternateGyms(false);
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/50">
          <h2 className="font-bold text-lg">Ready to Train?</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Workout Info */}
          <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-4 py-3">
            <div className="w-10 h-10 bg-[#00ff00] rounded-xl flex items-center justify-center">
              <span className="text-black font-bold text-sm">{muscleGroup.charAt(0)}</span>
            </div>
            <div>
              <p className="font-bold text-sm">{muscleGroup}</p>
              <p className="text-xs text-gray-500">Today's workout</p>
            </div>
          </div>

          {/* Training Location */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-2.5 font-medium tracking-wide">TRAINING LOCATION</label>

            {!showAlternateGyms ? (
              <div className="space-y-2">
                {/* Default location */}
                <div className="flex items-center gap-3 bg-[#00ff00]/5 border border-[#00ff00]/30 rounded-xl px-4 py-3.5">
                  {isHomeGym ? (
                    <Home className="w-5 h-5 text-[#00ff00] shrink-0" />
                  ) : (
                    <MapPin className="w-5 h-5 text-[#00ff00] shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{selectedLocation}</p>
                    {profile?.gymAddress && !isHomeGym && selectedLocation === defaultGymName && (
                      <p className="text-[10px] text-gray-500 truncate">{profile.gymAddress}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-[#00ff00] font-bold bg-[#00ff00]/10 px-2 py-0.5 rounded-full shrink-0">
                    {selectedLocation === defaultGymName ? 'DEFAULT' : 'SELECTED'}
                  </span>
                </div>

                {/* Change location options */}
                <div className="flex gap-2">
                  {/* Show opposite of default (home vs gym) */}
                  {isHomeGym && profile?.gymPlaceId ? (
                    <button
                      onClick={() => setSelectedLocation(profile?.gym || 'My Gym')}
                      className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                        selectedLocation !== defaultGymName && selectedLocation !== 'Home Gym'
                          ? 'border-gray-700 bg-[#1a1a1a]'
                          : 'border-gray-800 bg-[#0f0f0f] hover:bg-[#1a1a1a]'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-300">My Gym</span>
                    </button>
                  ) : !isHomeGym ? (
                    <button
                      onClick={() => setSelectedLocation('Home Gym')}
                      className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                        selectedLocation === 'Home Gym'
                          ? 'border-[#00ff00]/30 bg-[#00ff00]/5'
                          : 'border-gray-800 bg-[#0f0f0f] hover:bg-[#1a1a1a]'
                      }`}
                    >
                      <Home className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-300">Home</span>
                    </button>
                  ) : null}
                  <button
                    onClick={handleDifferentGym}
                    className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-800 bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all"
                  >
                    <Navigation className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-300">Different Gym</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Nearby Gyms List */
              <div className="space-y-2">
                <button
                  onClick={() => setShowAlternateGyms(false)}
                  className="text-xs text-[#00ff00] font-medium mb-1"
                >
                  &larr; Back to default
                </button>
                {gettingLocation || gymsLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8">
                    <Loader2 className="w-5 h-5 text-[#00ff00] animate-spin" />
                    <span className="text-sm text-gray-400">
                      {gettingLocation ? 'Getting your location...' : 'Finding nearby gyms...'}
                    </span>
                  </div>
                ) : nearbyGyms.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No gyms found nearby</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 scrollbar-hide">
                    {nearbyGyms.slice(0, 8).map((gym) => (
                      <button
                        key={gym.placeId}
                        onClick={() => handleSelectNearbyGym(gym)}
                        className="w-full flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#252525] rounded-xl px-4 py-3 transition-colors text-left"
                      >
                        <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{gym.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{gym.address}</p>
                        </div>
                        {gym.rating && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-[10px] text-gray-400">{gym.rating}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Alert Friends */}
          <div>
            <button
              onClick={() => setAlertFriends(!alertFriends)}
              className="w-full flex items-center justify-between bg-[#1a1a1a] rounded-xl px-4 py-3.5 hover:bg-[#1f1f1f] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <p className="text-sm font-medium">Alert friends</p>
                  <p className="text-[10px] text-gray-500">Let your crew know you're training</p>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${alertFriends ? 'bg-[#00ff00] justify-end' : 'bg-gray-700 justify-start'}`}>
                <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </div>
            </button>
          </div>

          {/* Start Button */}
          <button
            onClick={() => onStart(selectedLocation)}
            className="w-full bg-[#00ff00] text-black font-bold py-4 rounded-2xl text-base hover:bg-[#00dd00] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-[#00ff00]/20"
          >
            Let's Go
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
