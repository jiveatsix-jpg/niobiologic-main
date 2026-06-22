import React, { useRef } from 'react';
import { Download, FolderDown, FolderUp, Activity, Music, BarChart3 } from 'lucide-react';
import { useAeterContext } from '../context/AeterContext';
import { ViewMode } from '../types';
import * as htmlToImage from 'html-to-image';

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: 'EVOLUTION', label: 'EVO' },
  { id: 'COMPARISON', label: 'COMP' },
  { id: 'DISTRIBUTION', label: 'DIST' },
  { id: 'RADAR', label: 'RDR' },
  { id: 'DATATABLE', label: 'TBL' },
];

interface ActionDockProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const ActionDock: React.FC<ActionDockProps> = ({ containerRef }) => {
  const { exportData, importData, importCSV, setShowBioMonitor, appMode, setAppMode, viewMode, setViewMode } = useAeterContext();
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
    <footer className="w-full flex items-center justify-between tactical-panel px-4 py-1.5 border-t border-[#1a1a2e] bg-[#000000]/90 z-30">
      {/* Left group: Data actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1.5 flex items-center gap-1.5 text-[9px] font-bold text-[#ffd700] border border-[#ffd700]/50 hover:bg-[#ffd700]/10 transition-all active:scale-95"
          title="Import DataCube (JSON)"
        >
          <FolderUp className="w-3.5 h-3.5" /> IMPORT JSON
        </button>
        <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />

        <button
          onClick={() => csvInputRef.current?.click()}
          className="px-2.5 py-1.5 flex items-center gap-1.5 text-[9px] font-bold text-[#00ffcc] border border-[#00ffcc]/50 hover:bg-[#00ffcc]/10 transition-all active:scale-95"
          title="Import CSV data"
        >
          <FolderUp className="w-3.5 h-3.5" /> IMPORT CSV
        </button>
        <input type="file" accept=".csv" className="hidden" ref={csvInputRef} onChange={handleCSVImport} />

        <button
          onClick={exportData}
          className="px-2.5 py-1.5 flex items-center gap-1.5 text-[9px] font-bold text-[#00ffcc] border border-[#00ffcc]/50 hover:bg-[#00ffcc]/10 transition-all active:scale-95"
          title="Export DataCube (JSON)"
        >
          <FolderDown className="w-3.5 h-3.5" /> EXPORT
        </button>

        <div className="w-px h-5 bg-[#4a4a4a]/50 mx-1" />

        <button
          onClick={handleDownload}
          className="px-2.5 py-1.5 flex items-center gap-1.5 text-[9px] font-bold text-[#ffffff] bg-[#3a3a5e]/60 border border-[#6a6a8e]/50 hover:bg-[#4a4a7e] transition-all active:scale-95 capture-overlay-ui"
          title="Print Standard Graph"
        >
          <Download className="w-3.5 h-3.5" /> PRINT
        </button>

        <button
          onClick={() => setShowBioMonitor(true)}
          className="px-2.5 py-1.5 flex items-center gap-1.5 text-[9px] font-bold text-[#00ffcc] border border-[#00ffcc]/30 hover:bg-[#00ffcc]/10 transition-all active:scale-95 capture-overlay-ui"
        >
          <Activity className="w-3.5 h-3.5" /> BIO-MONITOR
        </button>
      </div>

      {/* Center: View Mode Selector — only in GRAPH mode */}
      {appMode === 'GRAPH' && (
        <div className="flex items-center gap-1 bg-[#000000]/60 border border-[#4a4a4a]/50 p-0.5">
          {VIEW_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-3 py-1 text-[9px] uppercase font-black transition-all tracking-wider ${
                viewMode === mode.id
                  ? 'bg-[#00ffcc] text-[#000000] shadow-[0_0_10px_rgba(0,255,204,0.3)]'
                  : 'text-[#8a8a8a] hover:text-[#ffffff] hover:bg-[#ffffff]/5'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      )}

      {/* Right: Mode toggle */}
      <button
        onClick={() => setAppMode(appMode === 'CHORD' ? 'GRAPH' : 'CHORD')}
        className={`px-3 py-1.5 flex items-center gap-2 text-[9px] font-bold border transition-all active:scale-95 capture-overlay-ui ${
          appMode === 'CHORD'
            ? 'text-[#ff0055] border-[#ff0055] hover:bg-[#ff0055]/10'
            : 'text-[#8a8a8a] border-[#4a4a4a] hover:text-[#ff0055] hover:border-[#ff0055]'
        }`}
        title="Switch between Graph and Chord mode"
      >
        {appMode === 'CHORD' ? <BarChart3 className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5" />}
        {appMode === 'CHORD' ? 'GRAPH MODE' : 'CHORD MODE'}
      </button>
    </footer>
  );
};
