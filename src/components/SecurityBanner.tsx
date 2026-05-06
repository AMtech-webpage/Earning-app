import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const SecurityBanner = () => (
  <div className="bg-blue-950/40 border-y border-red-500/20 py-3 px-6 relative overflow-hidden group">
    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.05)_10px,rgba(239,68,68,0.05)_20px)] animate-[pulse_3s_infinite]"></div>
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-3 relative z-10">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">D-Gamers Security Active</span>
      </div>
      <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider text-center">
        🔒 D-Gamers Security: VPN, Proxy, and Emulator detection is active. Accounts using these will be permanently banned and balances cleared.
      </p>
    </div>
  </div>
);
