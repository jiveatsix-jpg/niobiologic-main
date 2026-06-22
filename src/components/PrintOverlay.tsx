import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

export const PrintOverlay: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 100;
          return prev + Math.random() * 15;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#000000]/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="tactical-panel p-8 w-full max-w-md flex flex-col items-center gap-6 border-[#00ffcc]/40 shadow-[0_0_50px_rgba(0,255,204,0.15)] relative overflow-hidden">
        {/* Scanline effect for the overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#00ffcc_2px,#00ffcc_4px)]"></div>
        
        <Activity className="w-12 h-12 text-[#00ffcc] animate-pulse" />
        
        <div className="text-center space-y-2 relative z-10">
          <h2 className="text-sm font-black tracking-[0.3em] text-[#00ffcc]">GENERATING TACTICAL REPORT</h2>
          <p className="text-[9px] text-[#8a8a8a] font-mono tracking-widest uppercase">Initializing high-density render engine...</p>
        </div>

        <div className="w-full h-4 bg-[#000000] border-2 border-[#4a4a4a] relative p-0.5 overflow-hidden">
          <div 
            className="h-full bg-[#00ffcc] shadow-[0_0_15px_#00ffcc] transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Animated shine on the progress bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>

        <div className="flex justify-between w-full text-[8px] font-mono text-[#00ffcc]/60 uppercase tracking-tighter">
          <span>{progress.toFixed(0)}% COMPLETE</span>
          <span className="animate-terminal-blink">SYSTEM_BUSY</span>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
