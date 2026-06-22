import React, { useRef, useState } from 'react';
import { AeterProvider, useAeterContext } from './context/AeterContext';
import { FloatingPanel } from './components/FloatingPanel';
import { GraphCanvas } from './components/GraphCanvas';
import { ChordCanvas } from './components/ChordCanvas';
import { ChordControlPanel } from './components/ChordControlPanel';
import { DataTableView } from './components/DataTableView';
import { BioMonitorOverlay } from './components/BioMonitorOverlay';
import { TutorialOverlay } from './components/TutorialOverlay';
import { ModeSelector } from './components/ModeSelector';
import { ActionDock } from './components/ActionDock';
import { Database, Zap, Grid3X3, Type, Palette, Activity, HelpCircle, Square } from 'lucide-react';
import { StreamsContent, SectorsContent, MatrixContent, IdentityContent, OpticsContent, TelemetryContent } from './components/PanelContents';
import { PrintOverlay } from './components/PrintOverlay';

type PanelId = 'streams' | 'sectors' | 'matrix' | 'identity' | 'optics' | 'telemetry';

const PANELS: { id: PanelId; label: string; icon: React.ReactNode; color: string; side: 'left' | 'right' }[] = [
  { id: 'streams', label: 'STREAMS', icon: <Database className="w-4 h-4" />, color: '#ff0055', side: 'left' },
  { id: 'sectors', label: 'SECTORS', icon: <Zap className="w-4 h-4" />, color: '#00ffcc', side: 'left' },
  { id: 'matrix', label: 'DATA MATRIX', icon: <Grid3X3 className="w-4 h-4" />, color: '#ffd700', side: 'left' },
  { id: 'identity', label: 'IDENTITY', icon: <Type className="w-4 h-4" />, color: '#ffd700', side: 'right' },
  { id: 'optics', label: 'OPTICS', icon: <Palette className="w-4 h-4" />, color: '#00ffcc', side: 'right' },
  { id: 'telemetry', label: 'TELEMETRY', icon: <Activity className="w-4 h-4" />, color: '#8a8a8a', side: 'right' },
];

const CONTENT_MAP: Record<PanelId, React.FC> = {
  streams: StreamsContent,
  sectors: SectorsContent,
  matrix: MatrixContent,
  identity: IdentityContent,
  optics: OpticsContent,
  telemetry: TelemetryContent,
};

const AppContent = () => {
  const { uiSettings, appMode, viewMode, setShowTutorial, isPrinting } = useAeterContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [openPanels, setOpenPanels] = useState<Set<PanelId>>(new Set());
  const [showFrame, setShowFrame] = useState(true);

  const togglePanel = (id: PanelId) => {
    setOpenPanels(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (!appMode) return <ModeSelector />;

  const leftPanels = PANELS.filter(p => p.side === 'left');
  const rightPanels = PANELS.filter(p => p.side === 'right');

  return (
    <div className={`h-screen flex flex-col bg-[#0a0a12] text-white overflow-hidden scanline-bg grid-bg filter-${(uiSettings.visualFilter || 'NONE').toLowerCase()}`}>
      {uiSettings.bgImage && <div className="fixed inset-0 bg-[#000000]/60 -z-10 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${uiSettings.bgImage})` }} />}

      {/* TOP BAR — minimal */}
      <header className="w-full flex items-center justify-between px-4 py-1.5 bg-[#000000]/70 border-b border-[#1a1a2e] z-30 dot-matrix tactical-panel">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-[#00ffcc]" />
          <h1 className="text-xs font-black tracking-[0.3em] text-[#00ffcc]">NIOBIOLOGIC</h1>
          <span className="text-[7px] text-[#4a4a4a] font-mono tracking-wider">v3.0</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFrame(!showFrame)} className={`p-1.5 border transition-all ${showFrame ? 'text-[#00ffcc] border-[#00ffcc]/40' : 'text-[#4a4a4a] border-[#4a4a4a]/30'}`} title="Toggle frame">
            <Square className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setShowTutorial(true)} className="p-1.5 text-[#00ffcc] border border-[#00ffcc]/30 hover:bg-[#00ffcc]/10">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* MAIN AREA */}
      <div className="flex-1 flex relative overflow-hidden">

        {/* LEFT TOOLBAR — floating buttons */}
        {appMode === 'GRAPH' && (
          <div className="absolute left-3 top-3 z-30 flex flex-col gap-2">
            {leftPanels.map(p => (
              <button key={p.id} onClick={() => togglePanel(p.id)}
                className={`p-2.5 flex items-center gap-2 text-[8px] font-black tracking-wider border transition-all active:scale-95 backdrop-blur-sm ${
                  openPanels.has(p.id) ? `bg-[${p.color}]/10 border-[${p.color}]/60` : 'bg-[#000000]/70 border-[#4a4a4a]/40 hover:border-[#ffffff]/30'
                }`}
                style={openPanels.has(p.id) ? { color: p.color, borderColor: p.color } : { color: '#8a8a8a' }}
                title={p.label}
              >
                {p.icon} <span className="hidden xl:inline">{p.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* RIGHT TOOLBAR — floating buttons */}
        {appMode === 'GRAPH' && (
          <div className="absolute right-3 top-3 z-30 flex flex-col gap-2">
            {rightPanels.map(p => (
              <button key={p.id} onClick={() => togglePanel(p.id)}
                className={`p-2.5 flex items-center gap-2 text-[8px] font-black tracking-wider border transition-all active:scale-95 backdrop-blur-sm ${
                  openPanels.has(p.id) ? `bg-[${p.color}]/10` : 'bg-[#000000]/70 border-[#4a4a4a]/40 hover:border-[#ffffff]/30'
                }`}
                style={openPanels.has(p.id) ? { color: p.color, borderColor: p.color } : { color: '#8a8a8a' }}
                title={p.label}
              >
                <span className="hidden xl:inline">{p.label}</span> {p.icon}
              </button>
            ))}
          </div>
        )}

        {/* CHORD sidebar */}
        {appMode === 'CHORD' && (
          <aside className="w-[280px] h-full flex-shrink-0 bg-[#000000]/80 border-r border-[#1a1a2e] overflow-y-auto no-scrollbar p-2">
            <ChordControlPanel containerRef={containerRef} />
          </aside>
        )}

        {/* CANVAS — full area */}
        <main className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <div className={`relative w-full max-w-5xl ${showFrame ? 'tactical-panel p-2 bg-[#000000] shadow-[0_0_60px_rgba(0,0,0,0.9)]' : ''} ${viewMode === 'DATATABLE' || appMode === 'CHORD' ? 'h-full' : 'h-fit'}`}>
            <div ref={containerRef} className={`w-full relative ${viewMode === 'DATATABLE' || appMode === 'CHORD' ? 'h-full' : 'h-fit'}`}>
              {appMode === 'CHORD' ? <ChordCanvas /> : viewMode === 'DATATABLE' ? <DataTableView /> : <GraphCanvas />}
            </div>
          </div>
        </main>

        {/* FLOATING PANELS */}
        {PANELS.map(p => {
          const Content = CONTENT_MAP[p.id];
          return (
            <FloatingPanel key={p.id} id={p.id} title={p.label} icon={p.icon} color={p.color}
              isOpen={openPanels.has(p.id)} onToggle={() => togglePanel(p.id)} side={p.side} width={280}
            >
              <Content />
            </FloatingPanel>
          );
        })}
      </div>

      {/* ACTION DOCK */}
      <ActionDock containerRef={containerRef} />
      <BioMonitorOverlay />
      <TutorialOverlay />
      <PrintOverlay isVisible={isPrinting} />
    </div>
  );
};

export default function App() {
  return <AeterProvider><AppContent /></AeterProvider>;
}
