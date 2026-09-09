import React, { useRef, useState, useEffect } from 'react';
import { AeterProvider, useAeterContext } from './context/AeterContext';
import { FloatingPanel } from './components/FloatingPanel';
import { GraphCanvas } from './components/GraphCanvas';
import { DataTableView } from './components/DataTableView';
import { BioMonitorOverlay } from './components/BioMonitorOverlay';
import { TutorialOverlay } from './components/TutorialOverlay';
import { InfoTooltip } from './components/InfoTooltip';
import { ModeSelector } from './components/ModeSelector';
import { Sidebar, PanelId as SidebarPanelId, SidebarPanel } from './components/Sidebar';
import { Database, Zap, Grid3X3, Type, Palette, Activity, HelpCircle, Square, BookOpen } from 'lucide-react';
import { StreamsContent, SectorsContent, MatrixContent, IdentityContent, OpticsContent, TelemetryContent } from './components/PanelContents';
import { PrintOverlay } from './components/PrintOverlay';
import { LibraryOverlay } from './components/LibraryOverlay';

type PanelId = SidebarPanelId;

const PANELS: SidebarPanel[] = [
  { id: 'streams', label: 'STREAMS', icon: <Database className="w-4 h-4" />, color: '#ff0055' },
  { id: 'sectors', label: 'SECTORS', icon: <Zap className="w-4 h-4" />, color: '#00ffcc' },
  { id: 'matrix', label: 'DATA MATRIX', icon: <Grid3X3 className="w-4 h-4" />, color: '#ffd700' },
  { id: 'identity', label: 'IDENTITY', icon: <Type className="w-4 h-4" />, color: '#ffd700' },
  { id: 'optics', label: 'OPTICS', icon: <Palette className="w-4 h-4" />, color: '#00ffcc' },
  { id: 'telemetry', label: 'TELEMETRY', icon: <Activity className="w-4 h-4" />, color: '#8a8a8a' },
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
  const { uiSettings, appMode, viewMode, setShowTutorial, isPrinting, setShowLibrary } = useAeterContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [openPanels, setOpenPanels] = useState<Set<PanelId>>(new Set());
  const [showFrame, setShowFrame] = useState(true);
  const [infoModeOn, setInfoModeOn] = useState(() => localStorage.getItem('niobiologic_infoMode') === 'true');
  useEffect(() => {
    localStorage.setItem('niobiologic_infoMode', String(infoModeOn));
  }, [infoModeOn]);

  const togglePanel = (id: PanelId) => {
    setOpenPanels(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (!appMode) return <ModeSelector />;

  return (
    <div className={`h-screen flex flex-col bg-[#0a0a12] text-[#c9d1d9] overflow-hidden grid-bg filter-${(uiSettings.visualFilter || 'NONE').toLowerCase()}`}>
      {uiSettings.bgImage && <div className="fixed inset-0 bg-[#000000]/70 -z-10 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${uiSettings.bgImage})` }} />}

      {/* TOP BAR — slim */}
      <header className="shrink-0 flex items-center justify-between px-4 h-12 bg-[#0c0d16]/95 border-b border-white/5 z-30">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-[#00ffcc]" />
          <h1 className="text-[11px] font-bold tracking-[0.3em] text-[#e6edf3]">NIOBIOLOGIC</h1>
          <span className="text-[9px] text-[#6e7681] font-mono tracking-wider">v3.0</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowFrame(!showFrame)}
            className={`p-2 rounded-md border transition-all ${showFrame ? 'text-[#00ffcc] border-[#00ffcc]/40 bg-[#00ffcc]/5' : 'text-[#6e7681] border-white/10 hover:border-white/25'}`}
            title="Toggle frame"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowTutorial(true)}
            className="p-2 rounded-md border border-white/10 text-[#6e7681] hover:text-[#00ffcc] hover:border-[#00ffcc]/40 hover:bg-[#00ffcc]/5 transition-all"
            title="Help"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowLibrary(true)}
            className="p-2 rounded-md border border-white/10 text-[#6e7681] hover:text-[#ffd700] hover:border-[#ffd700]/40 hover:bg-[#ffd700]/5 transition-all"
            title="Graph Library"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setInfoModeOn(v => !v)}
            className={`p-2 rounded-md border transition-all ${infoModeOn ? 'text-[#00ffcc] border-[#00ffcc]/40 bg-[#00ffcc]/5' : 'text-[#6e7681] border-white/10 hover:border-white/25'}`}
            title="Activar/desactivar cuadros de información al pasar el mouse"
            aria-pressed={infoModeOn}
          >
            <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold">i</span>
          </button>
        </div>
      </header>

      <InfoTooltip active={infoModeOn} />

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR — consolidated controls */}
        <Sidebar
          panels={PANELS}
          openPanels={openPanels}
          onTogglePanel={togglePanel}
          containerRef={containerRef}
        />

        {/* CANVAS — full area (export box unchanged) */}
        <main className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
          <div className={`relative w-full max-w-5xl ${showFrame ? 'tactical-panel p-2 bg-[#000000] shadow-[0_0_60px_rgba(0,0,0,0.9)]' : ''} ${viewMode === 'DATATABLE' ? 'h-full' : 'h-fit'}`}>
            <div ref={containerRef} className={`w-full relative ${viewMode === 'DATATABLE' ? 'h-full' : 'h-fit'}`}>
              {viewMode === 'DATATABLE' ? <DataTableView /> : <GraphCanvas />}
            </div>
          </div>

          {/* FLOATING PANELS */}
          {PANELS.map(p => {
            const Content = CONTENT_MAP[p.id];
            return (
              <FloatingPanel key={p.id} id={p.id} title={p.label} icon={p.icon} color={p.color}
                isOpen={openPanels.has(p.id)} onToggle={() => togglePanel(p.id)} side={p.id === 'streams' || p.id === 'sectors' || p.id === 'matrix' ? 'left' : 'right'} width={280}
              >
                <Content />
              </FloatingPanel>
            );
          })}
        </main>
      </div>

      {/* OVERLAYS */}
      <BioMonitorOverlay />
      <TutorialOverlay />
      <PrintOverlay isVisible={isPrinting} />
      <LibraryOverlay />
    </div>
  );
};

export default function App() {
  return <AeterProvider><AppContent /></AeterProvider>;
}
