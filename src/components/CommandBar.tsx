import React from 'react';
import { Activity, HelpCircle } from 'lucide-react';
import { useAeterContext } from '../context/AeterContext';

export const CommandBar: React.FC = () => {
  const { setShowTutorial, appMode } = useAeterContext();

  return (
    <header className="w-full flex items-center justify-between tactical-panel p-2 px-6 backdrop-blur-sm border-b border-[#1a1a2e] bg-[#000000]/90 z-30 dot-matrix">
      {/* Identity */}
      <div className="flex items-center gap-3 shrink-0">
        <Activity className="w-7 h-7 text-[#00ffcc]" />
        <div className="text-left">
          <h1 className="text-sm font-black tracking-[0.3em] text-[#00ffcc] leading-none">NIOBIOLOGIC</h1>
          <p className="text-[#4a4a4a] text-[7px] font-bold uppercase tracking-[0.3em] mt-0.5">TACTICAL TERMINAL v3.0</p>
        </div>
      </div>

      {/* Center status */}
      {appMode === 'CHORD' && (
        <div className="text-[10px] font-black text-[#ff0055] tracking-[0.3em] uppercase">
          ♫ CHORD EDITOR
        </div>
      )}

      {appMode === 'GRAPH' && (
        <div className="text-[8px] font-mono text-[#4a4a4a] tracking-[0.2em]">
          AUTH: ALPHA OPERATOR // SYSTEM_LOCKED // NIOBIOLOGIC_v3.0
        </div>
      )}

      {/* Help */}
      <button
        onClick={() => setShowTutorial(true)}
        className="p-2 text-[#00ffcc] border border-[#00ffcc]/30 hover:bg-[#00ffcc]/10 transition-all active:scale-95"
        title="Open Tutorial"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </header>
  );
};
