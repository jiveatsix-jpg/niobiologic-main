import React, { useRef } from 'react';
import { Activity, Download, Eye, EyeOff, FolderDown, FolderUp, HelpCircle } from 'lucide-react';
import { useAeterContext } from '../context/AeterContext';
import * as htmlToImage from 'html-to-image';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

export const TerminalHeader: React.FC<{ containerRef: React.RefObject<HTMLDivElement | null> }> = ({ containerRef }) => {
  const { showBioMonitor, setShowBioMonitor, showResources, setShowResources, exportData, importData, setShowTutorial, setIsPrinting } = useAeterContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importData(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = async () => {
    if (!containerRef.current) return;
    setIsPrinting(true);
    
    try {
      // 1. Generate the image as a blob/buffer
      const blob = await htmlToImage.toBlob(containerRef.current, {
        backgroundColor: '#0a0a12',
        pixelRatio: 2,
        style: { transform: 'scale(1)', transformOrigin: 'top left', animation: 'none !important' },
        filter: (node) => {
          const exclusionClasses = ['capture-overlay-ui', 'capture-selection-ui', 'pixel-tooltip'];
          return !exclusionClasses.some(cls => (node as HTMLElement).classList?.contains(cls));
        }
      });

      if (!blob) {
        setIsPrinting(false);
        return;
      }

      // 2. Open Native Save Dialog
      const filePath = await save({
        filters: [{ name: 'Image', extensions: ['png'] }],
        defaultPath: `niobiologic_report_${Date.now()}.png`
      });

      if (filePath) {
        // 3. Convert blob to Uint8Array and save
        const arrayBuffer = await blob.arrayBuffer();
        await writeFile(filePath, new Uint8Array(arrayBuffer));
      }

    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      // Add a slight delay so the user can see the 100% completion
      setTimeout(() => setIsPrinting(false), 800);
    }
  };

  return (
    <header className="text-center w-full max-w-7xl flex items-center justify-between tactical-panel p-4 px-8 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <Activity className="w-10 h-10 text-[#00ffcc]" />
        <div className="text-left">
          <h1 className="text-xl font-black tracking-[0.3em] text-[#00ffcc]">NIOBIOLOGIC TERMINAL</h1>
          <p className="text-[#8a8a8a] text-[10px] font-bold uppercase tracking-[0.4em]">Tactical Bio-Data Intelligence System v3.0</p>
          <p className="text-[#4a4a4a] text-[8px] mt-1 font-mono">AUTH: ALPHA OPERATOR // ID: SYSTEM_LOCKED // NIOBIOLOGIC_v3.0</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2 flex items-center gap-2 text-[10px] font-bold text-[#ffd700] border border-[#ffd700] hover:bg-[#ffd700]/10 transition-all active:scale-95"
          title="Import DataCube (JSON)"
        >
          <FolderUp className="w-4 h-4" />
          IMPORT CUBE
        </button>
        <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
        
        <button 
          onClick={exportData}
          className="px-3 py-2 flex items-center gap-2 text-[10px] font-bold text-[#00ffcc] border border-[#00ffcc] hover:bg-[#00ffcc]/10 transition-all active:scale-95 mr-4"
          title="Export DataCube (JSON)"
        >
          <FolderDown className="w-4 h-4" />
          EXPORT CUBE
        </button>

        <button 
          onClick={() => setShowBioMonitor(true)}
          className="px-3 py-2 flex items-center gap-2 text-[10px] font-bold text-[#00ffcc] border-4 border-[#00ffcc] hover:bg-[#00ffcc]/10 transition-all active:scale-95 capture-overlay-ui"
        >
          <Activity className="w-4 h-4" />
          ADVANCED BIO-MONITOR
        </button>
        <button 
          onClick={() => setShowResources(!showResources)}
          className={`px-3 py-2 flex items-center gap-2 text-[10px] font-bold border-4 transition-all active:scale-95 capture-overlay-ui ${showResources ? 'text-[#ffd700] border-[#ffd700]' : 'text-[#4a4a4a] border-[#4a4a4a]'}`}
        >
          {showResources ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          BIO-MONITOR
        </button>
        <button 
          onClick={handleDownload}
          className="px-3 py-2 flex items-center gap-2 text-[10px] font-bold text-[#ffffff] bg-[#3a3a5e] border-4 border-[#6a6a8e] hover:bg-[#4a4a7e] transition-all active:scale-95 capture-overlay-ui"
          title="Print Standard Graph"
        >
          <Download className="w-4 h-4" />
          PRINT GRAPH
        </button>

        <button 
          onClick={() => setShowTutorial(true)}
          className="px-3 py-2 flex items-center gap-2 text-[10px] font-bold text-[#00ffcc] border-4 border-[#00ffcc] hover:bg-[#00ffcc]/10 transition-all active:scale-95 capture-overlay-ui ml-2"
          title="Open Tutorial"
        >
          <HelpCircle className="w-4 h-4" />
          HELP
        </button>

      </div>
    </header>
  );
};
