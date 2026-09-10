import React, { useRef, useState, useEffect } from 'react';
import { AeterProvider, useAeterContext } from './context/AeterContext';
import { PanelDock } from './components/PanelDock';
import { GraphCanvas } from './components/GraphCanvas';
import { DataTableView } from './components/DataTableView';
import { BioMonitorOverlay } from './components/BioMonitorOverlay';
import { TutorialOverlay } from './components/TutorialOverlay';
import { InfoTooltip } from './components/InfoTooltip';
import { ModeSelector } from './components/ModeSelector';
import { Sidebar, PanelId as SidebarPanelId, SidebarPanel } from './components/Sidebar';
import { TabBar } from './components/TabBar';
import { Database, Zap, Grid3X3, Type, Palette, Activity, HelpCircle, Square, BookOpen } from 'lucide-react';
import { StreamsContent, SectorsContent, MatrixContent, IdentityContent, OpticsContent, TelemetryContent } from './components/PanelContents';
import { PrintOverlay } from './components/PrintOverlay';
import { LibraryOverlay } from './components/LibraryOverlay';
import { GifStudioOverlay } from './components/GifStudioOverlay';

type PanelId = SidebarPanelId;

const PANELS: SidebarPanel[] = [
  { id: 'streams', label: 'MOMENTO', icon: <Database className="w-4 h-4" />, color: '#ff0055', description: 'define las líneas de datos del gráfico — nombre, color y valor de recurso de cada una, y permite agregar o borrar líneas.' },
  { id: 'sectors', label: 'EJE X', icon: <Zap className="w-4 h-4" />, color: '#00ffcc', description: 'define las categorías del eje X — nombre, color y brillo de cada una, y permite agregar o borrar categorías.' },
  { id: 'matrix', label: 'MAGNITUDES', icon: <Grid3X3 className="w-4 h-4" />, color: '#ffd700', description: 'donde cargás los valores numéricos de cada línea por categoría, y el símbolo de unidad ($, €, %...). Se puede pegar un bloque copiado de Excel/Sheets para llenar varias celdas de una.' },
  { id: 'identity', label: 'IDENTITY', icon: <Type className="w-4 h-4" />, color: '#ffd700', description: 'configura el título del gráfico y los nombres de los ejes X e Y, con sus colores.' },
  { id: 'optics', label: 'OPTICS', icon: <Palette className="w-4 h-4" />, color: '#00ffcc', description: 'ajusta la estética visual — escala, filtro visual, patrón de fondo, fuente, colores, texturas de área y si se muestran los valores sobre cada punto.' },
  { id: 'telemetry', label: 'TELEMETRY', icon: <Activity className="w-4 h-4" />, color: '#8a8a8a', description: 'configura los indicadores de estado (etiqueta y valor) que aparecen en las esquinas superior e inferior derecha del gráfico.' },
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
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [showFrame, setShowFrame] = useState(true);
  const [infoModeOn, setInfoModeOn] = useState(() => localStorage.getItem('niobiologic_infoMode') === 'true');
  useEffect(() => {
    localStorage.setItem('niobiologic_infoMode', String(infoModeOn));
  }, [infoModeOn]);

  const selectPanel = (id: PanelId) => {
    setActivePanel(prev => prev === id ? null : id);
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
          <button
            onClick={() => setShowLibrary(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#ffd700]/50 bg-[#ffd700]/10 text-[#ffd700] hover:bg-[#ffd700]/20 hover:border-[#ffd700] transition-all"
            title="Abre la biblioteca de gráficos guardados: podés guardar el gráfico de la pestaña activa con un nombre, y volver a cargar cualquier guardado anterior — al cargarlo se abre como una pestaña nueva, sin pisar lo que ya tenías abierto."
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black tracking-wider">BIBLIOTECA</span>
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowFrame(!showFrame)}
            className={`p-2 rounded-md border transition-all ${showFrame ? 'text-[#00ffcc] border-[#00ffcc]/40 bg-[#00ffcc]/5' : 'text-[#6e7681] border-white/10 hover:border-white/25'}`}
            title="Muestra u oculta el marco decorativo alrededor del gráfico, dejando solo el lienzo limpio — útil antes de exportar una captura sin bordes."
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowTutorial(true)}
            className="p-2 rounded-md border border-white/10 text-[#6e7681] hover:text-[#00ffcc] hover:border-[#00ffcc]/40 hover:bg-[#00ffcc]/5 transition-all"
            title="Vuelve a mostrar el tutorial guiado paso a paso de la aplicación, el mismo que aparece la primera vez que la abrís."
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setInfoModeOn(v => !v)}
            className={`p-2 rounded-md border transition-all ${infoModeOn ? 'text-[#00ffcc] border-[#00ffcc]/40 bg-[#00ffcc]/5' : 'text-[#6e7681] border-white/10 hover:border-white/25'}`}
            title="Activa el modo información: mientras esté prendido, al pasar el mouse por cualquier botón o control aparece un cuadro explicando qué hace."
            aria-pressed={infoModeOn}
          >
            <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold">i</span>
          </button>
        </div>
      </header>

      <InfoTooltip active={infoModeOn} />

      <TabBar />

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR — consolidated controls */}
        <Sidebar
          panels={PANELS}
          activePanel={activePanel}
          onSelectPanel={selectPanel}
          containerRef={containerRef}
        />

        {/* DOCKED TAB CONTENT — replaces the active tab's floating panel */}
        {activePanel && (() => {
          const p = PANELS.find(pp => pp.id === activePanel)!;
          const Content = CONTENT_MAP[p.id];
          return (
            <PanelDock title={p.label} icon={p.icon} color={p.color} onClose={() => setActivePanel(null)}>
              <Content />
            </PanelDock>
          );
        })()}

        {/* CANVAS — full area (export box unchanged) */}
        <main className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
          <div className={`relative w-full max-w-5xl ${showFrame ? 'tactical-panel p-2 bg-[#000000] shadow-[0_0_60px_rgba(0,0,0,0.9)]' : ''} ${viewMode === 'DATATABLE' ? 'h-full' : 'h-fit'}`}>
            <div ref={containerRef} className={`w-full relative ${viewMode === 'DATATABLE' ? 'h-full' : 'h-fit'}`}>
              {viewMode === 'DATATABLE' ? <DataTableView /> : <GraphCanvas />}
            </div>
          </div>
        </main>
      </div>

      {/* OVERLAYS */}
      <BioMonitorOverlay />
      <TutorialOverlay />
      <PrintOverlay isVisible={isPrinting} />
      <LibraryOverlay />
      <GifStudioOverlay containerRef={containerRef} />
    </div>
  );
};

export default function App() {
  return <AeterProvider><AppContent /></AeterProvider>;
}
