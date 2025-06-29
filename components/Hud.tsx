import React from 'react';
import { User } from '../types';

interface HudProps {
  user: User;
  onLogout: () => void;
}

const Hud: React.FC<HudProps> = ({ user, onLogout }) => {
  return (
    <div className="font-mono text-sm sm:text-base border border-sky-500/50 bg-black/30 p-2 px-4 flex flex-wrap items-center gap-x-4 gap-y-2 justify-center sm:justify-start hud-corners">
        <div className="flex items-center gap-2">
            <span className="text-sky-400/70">USER:</span>
            <span className="font-bold text-sky-300">{user.username}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sky-400/70">STATUS:</span>
            <span className={`font-bold ${user.status === 'Operational' ? 'text-green-400 animate-pulse' : 'text-yellow-400'}`}>{user.status}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sky-400/70">CREDITS:</span>
            <span className="font-bold text-yellow-400">¥{user.credits.toLocaleString()}</span>
        </div>
        <button onClick={onLogout} className="text-red-400/80 hover:text-red-300 hover:underline font-bold transition-colors text-xs sm:text-sm ml-2">
            [LOGOUT]
        </button>
    </div>
  );
};

export default Hud;