import React, { useRef } from 'react';
import { AeterProvider, useAeterContext } from './context/AeterContext';
import { TerminalHeader } from './components/TerminalHeader';
import { GraphCanvas } from './components/GraphCanvas';
import { ControlPanel } from './components/ControlPanel';
import { BioMonitorOverlay } from './components/BioMonitorOverlay';
import { TutorialOverlay } from './components/TutorialOverlay';
import { ModeSelector } from './components/ModeSelector';
import { ChordCanvas } from './components/ChordCanvas';
import { ChordControlPanel } from './components/ChordControlPanel';

const AppContent = () => {
  const { uiSettings, appMode } = useAeterContext();
  const containerRef = useRef<HTMLDivElement>(null);

  // Show mode selector on first launch (appMode is null)
  if (!appMode) {
    return <ModeSelector />;
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a12] text-white overflow-hidden scanline-bg grid-bg">
      {uiSettings.bgImage && <div className="fixed inset-0 bg-[#000000]/60 -z-10 bg-cover bg-center bg-no-repeat transition-all duration-500" style={{ backgroundImage: `url(${uiSettings.bgImage})` }}></div>}

      {/* LEFT SIDEBAR: CONTROLS */}
      <aside className="w-[430px] h-screen flex-shrink-0 bg-[#000000]/80 border-r-4 border-[#4a4a4a]/50 p-2 overflow-y-auto no-scrollbar shadow-[20px_0_30px_rgba(0,0,0,0.7)] z-20 backdrop-blur-md">
        {appMode === 'CHORD' ? (
          <ChordControlPanel containerRef={containerRef} />
        ) : (
          <ControlPanel />
        )}
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col h-screen relative">
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-500 -z-20 opacity-30" style={{ backgroundImage: uiSettings.bgImage ? `url(${uiSettings.bgImage})` : 'none' }}></div>

        {/* HEADER */}
        <div className="p-6 pb-0">
          <TerminalHeader containerRef={containerRef} />
        </div>

        {/* CANVAS AREA */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <div className="relative group tactical-panel p-2 bg-[#000000] shadow-[0_0_80px_rgba(0,0,0,0.9)]" ref={containerRef}>
            {appMode === 'CHORD' ? (
              <ChordCanvas />
            ) : (
              <GraphCanvas />
            )}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="text-[10px] text-[#4a4a4a] text-center border-t border-[#1a1a2e] py-4 w-full bg-[#000000]/90 font-mono tracking-widest z-10">
          NIOBIOLOGIC TACTICAL TERMINAL // BIO-DATA INTELLIGENCE SYSTEM // SECTOR ZERO COMPLIANT // NO CONNECTION DETECTED
        </footer>
      </main>

      <BioMonitorOverlay />
      <TutorialOverlay />
    </div>
  );
};

export default function App() {
  return (
    <AeterProvider>
      <AppContent />
    </AeterProvider>
  );
}
