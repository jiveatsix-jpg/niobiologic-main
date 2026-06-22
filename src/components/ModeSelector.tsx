import React from 'react';
import { Activity } from 'lucide-react';
import { useAeterContext } from '../context/AeterContext';

export const ModeSelector: React.FC = () => {
  const { setAppMode } = useAeterContext();

  return (
    <div className="fixed inset-0 bg-[#0a0a12] flex items-center justify-center z-50 scanline-bg grid-bg">
      <div className="flex flex-col items-center gap-10 max-w-2xl w-full px-8">

        <div className="text-center">
          <h1 className="text-3xl font-black tracking-[0.4em] text-[#00ffcc] mb-2">
            NIOBIOLOGIC TERMINAL
          </h1>
          <p className="text-[#8a8a8a] text-[11px] font-bold uppercase tracking-[0.5em]">
            Tactical Bio-Data Intelligence System v3.0
          </p>
          <p className="text-[#4a4a4a] text-[9px] mt-2 font-mono tracking-widest">
            AUTH: ALPHA OPERATOR // SYSTEM_LOCKED
          </p>
        </div>

        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ffcc]/40 to-transparent" />

        <button
          onClick={() => setAppMode('GRAPH')}
          className="group flex flex-col items-center gap-5 p-8 bg-[#000000]/60 border-4 border-[#4a4a4a] hover:border-[#00ffcc] hover:bg-[#00ffcc]/5 transition-all duration-300 active:scale-95 w-full max-w-md"
        >
          <Activity className="w-16 h-16 text-[#4a4a4a] group-hover:text-[#00ffcc] transition-colors duration-300" />
          <div className="text-center">
            <div className="text-[14px] font-black tracking-[0.3em] text-[#ffffff] group-hover:text-[#00ffcc] transition-colors mb-2">
              GRAPH MODE
            </div>
            <div className="text-[9px] text-[#4a4a4a] group-hover:text-[#8a8a8a] font-bold uppercase tracking-widest transition-colors">
              Line · Bar · Radar · Distribution
            </div>
          </div>
          <div className="w-full h-[2px] bg-[#4a4a4a] group-hover:bg-[#00ffcc] transition-colors duration-300" />
          <span className="text-[10px] font-black tracking-[0.4em] text-[#4a4a4a] group-hover:text-[#00ffcc] transition-colors">
            TACTICAL DATA
          </span>
        </button>

        <div className="text-[8px] text-[#2a2a3e] font-mono tracking-[0.3em] text-center">
          NIOBIOLOGIC_v3.0
        </div>
      </div>
    </div>
  );
};
