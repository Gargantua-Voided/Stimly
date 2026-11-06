import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 text-slate-950 font-semibold px-3.5 py-2 text-xs shadow-xl backdrop-blur-md border border-amber-400">
      <WifiOff className="w-4 h-4 animate-pulse text-slate-950" />
      <span>Offline Mode — Running locally from IndexedDB</span>
    </div>
  );
};
