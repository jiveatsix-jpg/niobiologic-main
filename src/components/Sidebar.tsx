import React, { useRef } from 'react';
import { Download, FolderDown, FolderUp, Activity, LayoutGrid } from 'lucide-react';
import { useAeterContext } from '../context/AeterContext';
import { ViewMode } from '../types';
import * as htmlToImage from 'html-to-image';

export type PanelId = 'streams' | 'sectors' | 'matrix' | 'identity' | 'optics' | 'telemetry';

export interface SidebarPanel {
  id: PanelId;
  label: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

const VIEW_MODES: { id: ViewMode; label: string; info: string }[] = [
  { id: 'EVOLUTION', label: 'EVO', info: 'Evolución: muestra cómo cambian los valores a lo largo del tiempo, como líneas.' },
  { id: 'COMPARISON', label: 'COMP', info: 'Comparación: muestra los valores lado a lado, como barras.' },
  { id: 'DISTRIBUTION', label: 'DIST', info: 'Distribución: muestra qué proporción representa cada valor sobre el total.' },
  { id: 'RADAR', label: 'RDR', info: 'Radar: compara varias variables a la vez en un gráfico circular.' },
  { id: 'DATATABLE', label: 'TBL', info: 'Tabla: muestra los datos en filas y columnas, sin gráfico.' },
];

interface SidebarProps {
  panels: SidebarPanel[];
  activePanel: PanelId | null;
  onSelectPanel: (id: PanelId) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2 px-1">
    <span className="text-[11px] font-bold tracking-[0.25em] text-[#6e7681] uppercase">{children}</span>
    <div className="flex-1 h-px bg-white/5" />
  </div>
);

const ActionButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  tone?: string;
  onClick: () => void;
  className?: string;
  title?: string;
}> = ({ label, icon, tone = 'text-[#8b949e]', onClick, className = '', title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#00ffcc]/30 active:scale-[0.98] transition-all text-left ${tone} ${className}`}
  >
    <span className="shrink-0">{icon}</span>
    <span className="text-[12px] font-semibold tracking-wider uppercase">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ panels, activePanel, onSelectPanel, containerRef }) => {
  const { exportData, importData, importCSV, setShowBioMonitor, viewMode, setViewMode } = useAeterContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importData(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importCSV(file);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const handleDownload = async () => {
    if (!containerRef.current) return;
    try {
      const blob = await htmlToImage.toBlob(containerRef.current, {
        backgroundColor: '#0a0a12',
        pixelRatio: 2,
        style: { transform: 'scale(1)', transformOrigin: 'top left', animation: 'none !important' },
        filter: (node) => {
          const exclusionClasses = ['capture-overlay-ui', 'capture-selection-ui'];
          return !exclusionClasses.some(cls => (node as HTMLElement).classList?.contains(cls));
        }
      });
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = `aeter_sync_report_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 100);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <aside className="shrink-0 w-60 border-r border-white/5 bg-[#0c0d16]/70 flex flex-col z-20 overflow-y-auto no-scrollbar">
      <div className="flex flex-col gap-5 p-3">
        {/* VIEW MODES */}
        <div className="space-y-2">
          <SectionLabel>View</SectionLabel>
          <div className="grid grid-cols-5 gap-1 p-1 rounded-md border border-white/10 bg-black/30">
            {VIEW_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                title={mode.info}
                className={`py-1.5 text-[11px] font-bold tracking-wider rounded transition-all ${
                  viewMode === mode.id
                    ? 'bg-[#00ffcc] text-[#0a0a12]'
                    : 'text-[#6e7681] hover:text-[#e6edf3] hover:bg-white/5'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* PANELS */}
        <div className="space-y-2">
          <SectionLabel>Panels</SectionLabel>
          <div className="flex flex-col gap-1">
            {panels.map(p => {
              const isOpen = activePanel === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPanel(p.id)}
                  title={`${isOpen ? 'Cierra' : 'Abre'} ${p.label}${p.description ? `: ${p.description}` : '.'}`}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md border transition-all text-left active:scale-[0.98] ${
                    isOpen
                      ? 'bg-white/[0.04]'
                      : 'bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                  style={isOpen ? { borderColor: `${p.color}55` } : { borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color, boxShadow: isOpen ? `0 0 8px ${p.color}` : 'none' }} />
                  <span
                    className="text-[12px] font-semibold tracking-wider uppercase truncate"
                    style={{ color: isOpen ? p.color : '#8b949e' }}
                  >
                    {p.label}
                  </span>
                  <span className={`ml-auto text-[11px] ${isOpen ? 'opacity-100' : 'opacity-0'}`} style={{ color: p.color }}>●</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DATA ACTIONS */}
        <div className="space-y-2">
          <SectionLabel>Data</SectionLabel>
          <div className="flex flex-col gap-1.5">
            <ActionButton
              label="Import JSON"
              icon={<FolderUp className="w-3.5 h-3.5 text-[#ffd700]" />}
              onClick={() => fileInputRef.current?.click()}
              title="Reemplaza las líneas, categorías y ajustes visuales de la pestaña activa por los de un archivo .json exportado previamente con EXPORT."
            />
            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />

            <ActionButton
              label="Import CSV"
              icon={<FolderUp className="w-3.5 h-3.5 text-[#00ffcc]" />}
              onClick={() => csvInputRef.current?.click()}
              title="Reemplaza las categorías y líneas de la pestaña activa por las de un archivo .csv (columnas = categorías, filas = líneas)."
            />
            <input type="file" accept=".csv" className="hidden" ref={csvInputRef} onChange={handleCSVImport} />

            <ActionButton
              label="Export"
              icon={<FolderDown className="w-3.5 h-3.5 text-[#00ffcc]" />}
              onClick={exportData}
              title="Descarga los datos actuales como archivo JSON."
            />

            <ActionButton
              label="Print PNG"
              icon={<Download className="w-3.5 h-3.5 text-[#e6edf3]" />}
              onClick={handleDownload}
              className="capture-overlay-ui"
              title="Guarda una captura del área de gráficos como imagen PNG."
            />

            <ActionButton
              label="Bio Monitor"
              icon={<Activity className="w-3.5 h-3.5 text-[#00ffcc]" />}
              onClick={() => setShowBioMonitor(true)}
              className="capture-overlay-ui"
              title="Abre el panel de monitoreo en vivo de las métricas."
            />
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 px-1">
          <div className="flex items-center gap-1.5 text-[#6e7681]">
            <LayoutGrid className="w-3 h-3" />
            <span className="text-[11px] font-mono tracking-wider">NIOBIOLOGIC_v3.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
