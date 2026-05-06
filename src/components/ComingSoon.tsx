import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ComingSoon = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
    <div className="relative mb-8">
      <div className="w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse absolute inset-0"></div>
      <Gamepad2 className="w-24 h-24 text-primary relative z-10 animate-bounce" />
    </div>
    <h2 className="text-5xl font-heavy italic tracking-tighter text-white uppercase mb-4">Under Construction</h2>
    <p className="text-zinc-500 max-w-sm mx-auto font-medium mb-12">
      Our tech-team is currently finalizing this module for the elite tier. Check back soon for the full launch. 
      Professional tools are coming soon!
    </p>
    <Link to="/" className="glow-button-3d">
       Return to Control Center
    </Link>
  </div>
);
