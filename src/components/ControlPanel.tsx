import React, { useRef, useState } from 'react';
import { Plus, Trash2, Settings2, Columns, X, Type, Palette, Image as ImageIcon, Database, Zap, Activity, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { useAeterContext } from '../context/AeterContext';
import { ViewMode } from '../types';

export const ControlPanel: React.FC = () => {
  const { 
    sections, updateSection, removeSection, addSection,
    routes, activeTab, setActiveTab, addRoute, updateRoute, removeRoute, updateDataPoint,
    uiSettings, setUiSettings, 
    viewMode, setViewMode, 
    currentSectionIndex, setCurrentSectionIndex,
    showResources
  } = useAeterContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedSector, setExpandedSector] = useState<number | null>(null);

  const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUiSettings({ ...uiSettings, bgImage: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {(viewMode === 'DISTRIBUTION' || viewMode === 'COMPARISON') && (
        <div className="w-full tactical-panel p-2 flex items-center justify-between animate-in slide-in-from-top-4 duration-500 border-t-0 -mt-1">
          <div className="flex items-center gap-2">
            <Columns className="w-4 h-4 text-[#00ffcc]" />
            <span className="text-[10px] font-black tracking-[0.1em] text-[#ffffff]">SECTOR DOCK</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
              disabled={currentSectionIndex === 0}
              className="p-1 tactical-panel border-[#4a4a4a] text-[#8a8a8a] hover:text-[#00ffcc] disabled:opacity-20 transition-all active:scale-90"
            >
              <Zap className="w-4 h-4 rotate-180" />
            </button>
            
            <div className="flex flex-col items-center justify-center min-w-[80px]">
              <span className="text-[7px] text-[#8a8a8a] font-black uppercase tracking-widest leading-none mb-0.5">ACTIVE SECTOR</span>
              <span className="text-xs font-black text-[#00ffcc] tracking-widest leading-none truncate max-w-[120px]">{sections[currentSectionIndex]?.name}</span>
            </div>

            <button 
              onClick={() => setCurrentSectionIndex(Math.min(sections.length - 1, currentSectionIndex + 1))}
              disabled={currentSectionIndex === sections.length - 1}
              className="p-1 tactical-panel border-[#4a4a4a] text-[#8a8a8a] hover:text-[#00ffcc] disabled:opacity-20 transition-all active:scale-90"
            >
              <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="w-full space-y-2">
        <div className="flex flex-col gap-2 bg-[#0a0a12]/60 p-2 tactical-panel border-[#4a4a4a]">
          {/* TOP TABS */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setActiveTab('GLOBAL')}
              className={`industrial-tab transition-all flex items-center justify-center w-full ${activeTab === 'GLOBAL' ? 'bg-[#00ffcc] text-[#000000] border-[#00ffcc] glow-cyan' : 'text-[#8a8a8a] border-transparent hover:text-[#ffffff] hover:bg-[#ffffff]/5'}`}
            >
              GLOBAL
            </button>
            <button 
              onClick={() => setActiveTab('SECTORS')}
              className={`industrial-tab transition-all flex items-center justify-center w-full border-4 ${activeTab === 'SECTORS' ? 'border-[#00ffcc] text-[#ffffff] glow-cyan' : 'text-[#8a8a8a] border-transparent hover:text-[#ffffff] hover:bg-[#ffffff]/5'}`}
            >
              SECTORS
            </button>
          </div>
          
          <div className="w-full h-[2px] bg-[#4a4a4a]/50"></div>

          {/* STREAM TABS */}
          <div className="grid grid-cols-2 gap-3">
            {routes.map(route => (
              <button 
                key={`tab-${route.id}`}
                onClick={() => setActiveTab(route.id)}
                className={`industrial-tab transition-all flex items-center justify-center gap-3 w-full border-4 ${activeTab === route.id ? 'border-[#ff0055] text-[#ffffff] glow-amber' : 'text-[#8a8a8a] border-[#4a4a4a] hover:text-[#ffffff] hover:bg-[#ffffff]/5'}`}
              >
                <div className="w-2.5 h-2.5 shrink-0 rounded-full" style={{ backgroundColor: route.color, boxShadow: `0 0 10px ${route.color}` }}></div>
                <span className="truncate">{route.name}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={addRoute}
            className="industrial-tab text-[#00ffcc] border-4 border-[#4a4a4a] hover:border-[#00ffcc] hover:bg-[#00ffcc]/10 flex items-center justify-center gap-2 w-full"
          >
            <Plus className="w-4 h-4" /> ADD STREAM
          </button>
        </div>

        {activeTab === 'GLOBAL' && (
          <div className="tactical-panel p-2 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="industrial-header">
              <h2 className="flex items-center gap-4">
                <Settings2 className="w-6 h-6 text-[#00ffcc]" /> GLOBAL TERMINAL SETTINGS
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8a8a8a] flex items-center gap-2 uppercase">
                  <Type className="w-3 h-3" /> FONT SIZE: {uiSettings.fontSize}
                </label>
                <input type="range" min="10" max="40" value={uiSettings.fontSize} onChange={(e) => setUiSettings({ ...uiSettings, fontSize: parseInt(e.target.value) })} className="w-full accent-[#00ffcc] h-3" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8a8a8a] flex items-center gap-2 uppercase">
                  <Activity className="w-3 h-3" /> THICKNESS: {uiSettings.lineWidth}
                </label>
                <input type="range" min="1" max="8" step="1" value={uiSettings.lineWidth} onChange={(e) => setUiSettings({ ...uiSettings, lineWidth: parseInt(e.target.value) })} className="w-full accent-[#ff0055] h-3" />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="flex items-center gap-2 cursor-pointer group/check">
                  <div className={`w-3.5 h-3.5 border flex items-center justify-center ${uiSettings.showPercentage ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}>
                    {uiSettings.showPercentage && <div className="w-1.5 h-1.5 bg-[#000000]"></div>}
                  </div>
                  <input type="checkbox" className="hidden" checked={uiSettings.showPercentage} onChange={(e) => setUiSettings({ ...uiSettings, showPercentage: e.target.checked })} />
                  <span className="text-[10px] font-bold text-[#8a8a8a] uppercase tracking-widest">SHOW PERCENTAGES</span>
                </label>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-[#8a8a8a] flex items-center gap-2 uppercase">
                  <Database className="w-3 h-3" /> SCALE MODE
                </label>
                <select value={uiSettings.scaleMode} onChange={(e) => setUiSettings({ ...uiSettings, scaleMode: e.target.value as any })} className="w-full bg-[#0a0a12] border border-[#4a4a4a] text-[#00ffcc] text-[10px] p-2 font-bold focus:outline-none">
                  <option value="DYNAMIC">DYNAMIC (AUTO-RANGE)</option>
                  <option value="FIXED">FIXED (0-100%)</option>
                  <option value="DATA_ONLY">DATA ONLY (MARKERS)</option>
                </select>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-[#8a8a8a] flex items-center gap-2 uppercase">
                  <Type className="w-3 h-3" /> FONT FAMILY
                </label>
                <select value={uiSettings.fontFamily} onChange={(e) => setUiSettings({ ...uiSettings, fontFamily: e.target.value })} className="w-full bg-[#0a0a12] border border-[#4a4a4a] text-[#00ffcc] text-[10px] p-2 font-bold focus:outline-none">
                  <option value='"Courier New", monospace'>COURIER (PIXEL)</option>
                  <option value='"Press Start 2P", cursive'>PRESS START (8-BIT)</option>
                  <option value='"VT323", monospace'>VT323 (TERMINAL)</option>
                  <option value='"Silkscreen", cursive'>SILKSCREEN (MINI)</option>
                  <option value='"Pixelify Sans", sans-serif'>PIXELIFY (MODERN)</option>
                  <option value='"JetBrains Mono", monospace'>JETBRAINS (TECH)</option>
                  <option value='"Inter", sans-serif'>INTER (SANS)</option>
                  <option value='"Space Grotesk", sans-serif'>GROTESK (MODERN)</option>
                  <option value='Georgia, serif'>GEORGIA (SERIF)</option>
                </select>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-[#8a8a8a] flex items-center gap-2 uppercase mb-1">
                  <Palette className="w-3 h-3" /> GRAPH COLORS
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[8px] text-[#4a4a4a] font-bold">AXES/TXT</span>
                    <div className="flex items-center w-full bg-[#000000] border border-[#4a4a4a] p-0.5">
                      <input type="color" value={uiSettings.baseColor} onChange={(e) => setUiSettings({ ...uiSettings, baseColor: e.target.value })} className="w-3 h-3 bg-transparent border-none cursor-pointer p-0 shrink-0" />
                      <input type="text" value={uiSettings.baseColor} onChange={(e) => setUiSettings({ ...uiSettings, baseColor: e.target.value })} className="w-full bg-transparent text-center text-[#ffffff] text-[8px] font-mono focus:outline-none uppercase" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[8px] text-[#4a4a4a] font-bold">GRID</span>
                    <div className="flex items-center w-full bg-[#000000] border border-[#4a4a4a] p-0.5">
                      <input type="color" value={uiSettings.gridColor} onChange={(e) => setUiSettings({ ...uiSettings, gridColor: e.target.value })} className="w-3 h-3 bg-transparent border-none cursor-pointer p-0 shrink-0" />
                      <input type="text" value={uiSettings.gridColor} onChange={(e) => setUiSettings({ ...uiSettings, gridColor: e.target.value })} className="w-full bg-transparent text-center text-[#ffffff] text-[8px] font-mono focus:outline-none uppercase" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[8px] text-[#4a4a4a] font-bold">HUD</span>
                    <div className="flex items-center w-full bg-[#000000] border border-[#4a4a4a] p-0.5">
                      <input type="color" value={uiSettings.hudColor} onChange={(e) => setUiSettings({ ...uiSettings, hudColor: e.target.value })} className="w-3 h-3 bg-transparent border-none cursor-pointer p-0 shrink-0" />
                      <input type="text" value={uiSettings.hudColor} onChange={(e) => setUiSettings({ ...uiSettings, hudColor: e.target.value })} className="w-full bg-transparent text-center text-[#ffffff] text-[8px] font-mono focus:outline-none uppercase" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8a8a8a] flex items-center gap-2 uppercase">
                  <ImageIcon className="w-3 h-3" /> PATTERN
                </label>
                <select value={uiSettings.backgroundPattern} onChange={(e) => setUiSettings({ ...uiSettings, backgroundPattern: e.target.value as any })} className="w-full bg-[#0a0a12] border border-[#4a4a4a] text-[#00ffcc] text-[10px] p-2 font-bold focus:outline-none">
                  <option value="STANDARD">GRID</option>
                  <option value="SOLID">PURE BLACK</option>
                  <option value="SCANLINES">BIO-SCAN</option>
                  <option value="RADIAL">RADIAL</option>
                  <option value="STEALTH">STEALTH</option>
                  <option value="BLUEPRINT">PRINT</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8a8a8a] flex items-center gap-2 uppercase">
                  <ImageIcon className="w-3 h-3" /> CUSTOM BG
                </label>
                <div className="flex gap-1 h-[27px]">
                  <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-[#3a3a5e] text-[8px] font-bold border border-[#6a6a8e] hover:bg-[#4a4a6e]">SELECT</button>
                  {uiSettings.bgImage && <button onClick={() => setUiSettings({ ...uiSettings, bgImage: null })} className="px-2 bg-[#ff0055] border-[#aa0033] text-[#ffffff] hover:bg-[#cc0044]"><X className="w-3 h-3" /></button>}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleBgImageChange} className="hidden" />
              </div>
              <div className="space-y-1 col-span-2 pt-1 border-t border-[#4a4a4a]/30">
                <label className="text-[10px] font-bold text-[#8a8a8a] flex items-center gap-2 uppercase">
                   <Settings2 className="w-3 h-3" /> LABELS & AXES
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-[#4a4a4a] font-bold">GRAPH TITLE</span>
                    <div className="flex gap-2">
                      <input type="text" value={uiSettings.graphTitle || ''} onChange={(e) => setUiSettings({ ...uiSettings, graphTitle: e.target.value })} className="flex-1 bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[9px] p-1.5 font-mono focus:outline-none focus:border-[#00ffcc]" placeholder="NIOBIOLOGIC TACTICAL OVERVIEW" />
                      <input type="color" value={uiSettings.graphTitleColor || '#ffffff'} onChange={(e) => setUiSettings({ ...uiSettings, graphTitleColor: e.target.value })} className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer" title="Title Color" />
                      <input type="color" value={uiSettings.graphTitleGlow || '#00ffcc'} onChange={(e) => setUiSettings({ ...uiSettings, graphTitleGlow: e.target.value })} className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer" title="Title Glow" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] text-[#4a4a4a] font-bold">X-AXIS (HORIZ)</span>
                      <input type="text" value={uiSettings.xAxisTitle || ''} onChange={(e) => setUiSettings({ ...uiSettings, xAxisTitle: e.target.value })} className="w-full bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[9px] p-1.5 font-mono focus:outline-none focus:border-[#00ffcc]" placeholder="TIME / SECTOR" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] text-[#4a4a4a] font-bold">Y-AXIS (VERT)</span>
                      <input type="text" value={uiSettings.yAxisTitle || ''} onChange={(e) => setUiSettings({ ...uiSettings, yAxisTitle: e.target.value })} className="w-full bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[9px] p-1.5 font-mono focus:outline-none focus:border-[#00ffcc]" placeholder="MAGNITUDE" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1 col-span-2 pt-1 border-t border-[#4a4a4a]/30">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[#8a8a8a] flex items-center gap-2 uppercase">
                     <Settings2 className="w-3 h-3" /> TELEMETRY
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1 cursor-pointer group/check">
                      <div className={`w-2.5 h-2.5 border flex items-center justify-center ${uiSettings.showTelemetryTopRight !== false ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}></div>
                      <input type="checkbox" className="hidden" checked={uiSettings.showTelemetryTopRight !== false} onChange={(e) => setUiSettings({ ...uiSettings, showTelemetryTopRight: e.target.checked })} />
                      <span className="text-[8px] text-[#4a4a4a] font-bold group-hover/check:text-[#ffffff]">SHOW TR</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer group/check">
                      <div className={`w-2.5 h-2.5 border flex items-center justify-center ${uiSettings.showTelemetryBottomRight !== false ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}></div>
                      <input type="checkbox" className="hidden" checked={uiSettings.showTelemetryBottomRight !== false} onChange={(e) => setUiSettings({ ...uiSettings, showTelemetryBottomRight: e.target.checked })} />
                      <span className="text-[8px] text-[#4a4a4a] font-bold group-hover/check:text-[#ffffff]">SHOW BR</span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-[#4a4a4a] font-bold">TOP RIGHT LBL</span>
                    <input type="text" value={uiSettings.telemetryTopRightLabel || ''} onChange={(e) => setUiSettings({ ...uiSettings, telemetryTopRightLabel: e.target.value })} className="w-full bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[9px] p-1.5 font-mono focus:outline-none focus:border-[#00ffcc]" placeholder="DATA_CONFIDENCE" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-[#4a4a4a] font-bold">TOP RIGHT VAL</span>
                    <input type="text" value={uiSettings.telemetryTopRightValue || ''} onChange={(e) => setUiSettings({ ...uiSettings, telemetryTopRightValue: e.target.value })} className="w-full bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[9px] p-1.5 font-mono focus:outline-none focus:border-[#00ffcc]" placeholder="LOCAL_STORAGE" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-[#4a4a4a] font-bold">BOT RIGHT LBL</span>
                    <input type="text" value={uiSettings.telemetryBottomRightLabel || ''} onChange={(e) => setUiSettings({ ...uiSettings, telemetryBottomRightLabel: e.target.value })} className="w-full bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[9px] p-1.5 font-mono focus:outline-none focus:border-[#00ffcc]" placeholder="SYNC_STATUS" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-[#4a4a4a] font-bold">BOT RIGHT VAL</span>
                    <input type="text" value={uiSettings.telemetryBottomRightValue || ''} onChange={(e) => setUiSettings({ ...uiSettings, telemetryBottomRightValue: e.target.value })} className="w-full bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[9px] p-1.5 font-mono focus:outline-none focus:border-[#00ffcc]" placeholder="LOCAL_ONLY" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SECTORS' && (
          <div className="tactical-panel p-2 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="industrial-header">
              <h2 className="flex items-center gap-4">
                <Columns className="w-6 h-6 text-[#00ffcc]" /> TACTICAL VIEW MODES
              </h2>
            </div>
            
            <div className="flex flex-col gap-2 border-b-2 border-[#4a4a4a] pb-2">
              <div className="grid grid-cols-5 gap-1 p-1 w-full bg-[#000000]/60 border border-[#4a4a4a]/50">
                <button onClick={() => setViewMode('EVOLUTION')} className={`py-1.5 text-[10px] uppercase font-black transition-all rounded-sm ${viewMode === 'EVOLUTION' ? 'bg-[#00ffcc] text-[#000000]' : 'text-[#8a8a8a] hover:text-[#ffffff]'}`}>EVO</button>
                <button onClick={() => setViewMode('COMPARISON')} className={`py-1.5 text-[10px] uppercase font-black transition-all rounded-sm ${viewMode === 'COMPARISON' ? 'bg-[#00ffcc] text-[#000000]' : 'text-[#8a8a8a] hover:text-[#ffffff]'}`}>COMP</button>
                <button onClick={() => setViewMode('DISTRIBUTION')} className={`py-1.5 text-[10px] uppercase font-black transition-all rounded-sm ${viewMode === 'DISTRIBUTION' ? 'bg-[#00ffcc] text-[#000000]' : 'text-[#8a8a8a] hover:text-[#ffffff]'}`}>DIST</button>
                <button onClick={() => setViewMode('RADAR')} className={`py-1.5 text-[10px] uppercase font-black transition-all rounded-sm ${viewMode === 'RADAR' ? 'bg-[#00ffcc] text-[#000000]' : 'text-[#8a8a8a] hover:text-[#ffffff]'}`}>RDR</button>
                <button onClick={() => setViewMode('DATATABLE')} className={`py-1.5 text-[10px] uppercase font-black transition-all rounded-sm ${viewMode === 'DATATABLE' ? 'bg-[#00ffcc] text-[#000000]' : 'text-[#8a8a8a] hover:text-[#ffffff]'}`}>TBL</button>
              </div>
              <button onClick={addSection} className="w-full py-2 flex items-center justify-center gap-1 text-[12px] font-black text-[#00ffcc] border-2 border-[#00ffcc] border-dashed hover:bg-[#00ffcc]/10 hover:border-solid transition-all active:scale-95">
                <Plus className="w-4 h-4" /> ADD SECTOR
              </button>
              {viewMode === 'COMPARISON' && (
                <label className="flex items-center gap-2 mt-1 cursor-pointer group/check">
                  <div className={`w-3.5 h-3.5 border flex items-center justify-center ${uiSettings.showCompYAxis ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}>
                    {uiSettings.showCompYAxis && <div className="w-1.5 h-1.5 bg-[#000000]"></div>}
                  </div>
                  <input type="checkbox" className="hidden" checked={!!uiSettings.showCompYAxis} onChange={(e) => setUiSettings({ ...uiSettings, showCompYAxis: e.target.checked })} />
                  <span className="text-[10px] font-bold text-[#8a8a8a] uppercase tracking-widest group-hover/check:text-[#ffffff]">SHOW Y-AXIS (COMP MODE)</span>
                </label>
              )}
            </div>

            <div className="flex flex-col gap-1">
              {sections.map((sec, i) => (
                <div key={`sec-${i}`} className="bg-[#0a0a12] border border-[#4a4a4a] transition-all">
                  <div className="flex items-center gap-2 p-1.5">
                    <input type="color" value={sec.color} onChange={(e) => updateSection(i, { color: e.target.value })} className="w-5 h-5 p-0 bg-transparent border-none cursor-pointer shrink-0" />
                    <input type="text" value={sec.name} onChange={(e) => updateSection(i, { name: e.target.value })} className="bg-transparent border-none text-[#00ffcc] font-bold text-[12px] focus:outline-none min-w-0 w-full" />
                    <button onClick={() => setExpandedSector(expandedSector === i ? null : i)} className={`p-1 shrink-0 ${expandedSector === i ? 'text-[#00ffcc]' : 'text-[#8a8a8a] hover:text-[#ffffff]'}`}>
                      {expandedSector === i ? <ChevronUp className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
                    </button>
                    <button onClick={() => removeSection(i)} className="p-1 text-[#ff0055] hover:text-[#ffffff] shrink-0 border-l border-[#4a4a4a]/50 pl-2 ml-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {expandedSector === i && (
                    <div className="p-2 border-t border-[#4a4a4a]/50 grid grid-cols-2 gap-2 bg-[#000000]/40 text-[10px] font-black uppercase text-[#8a8a8a]">
                      <label className="flex items-center gap-2 cursor-pointer group/check">
                        <div className={`w-3.5 h-3.5 border flex items-center justify-center ${sec.isAnchored ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}>
                          {sec.isAnchored && <div className="w-1.5 h-1.5 bg-[#000000]"></div>}
                        </div>
                        <input type="checkbox" className="hidden" checked={sec.isAnchored} onChange={(e) => updateSection(i, { isAnchored: e.target.checked })} /> ANCHOR
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group/check">
                        <div className={`w-3.5 h-3.5 border flex items-center justify-center ${sec.isMinimalShadow ? 'border-[#ff0055] bg-[#ff0055]' : 'border-[#4a4a4a]'}`}>
                          {sec.isMinimalShadow && <div className="w-1.5 h-1.5 bg-[#ffffff]"></div>}
                        </div>
                        <input type="checkbox" className="hidden" checked={sec.isMinimalShadow} onChange={(e) => updateSection(i, { isMinimalShadow: e.target.checked })} /> MIN SHADOW
                      </label>
                      <div className="col-span-2 flex items-center gap-2 pt-1.5 border-t border-[#4a4a4a]/20">
                        <span className="shrink-0">HEX</span>
                        <input type="text" value={sec.color} onChange={(e) => updateSection(i, { color: e.target.value })} className="w-12 bg-transparent border-b border-[#4a4a4a] text-[#ffffff] text-[8px] font-mono uppercase focus:outline-none" />
                        <span className="shrink-0 w-8 ml-2 text-right">GLOW</span>
                        <div className="flex items-center bg-[#000000] border border-[#4a4a4a] p-0.5 shrink-0">
                          <input type="color" value={sec.shadowColor} onChange={(e) => updateSection(i, { shadowColor: e.target.value })} className="w-3 h-3 bg-transparent border-none p-0 cursor-pointer" />
                        </div>
                        <input type="range" min="0" max="20" value={sec.glowIntensity} onChange={(e) => updateSection(i, { glowIntensity: parseInt(e.target.value) })} className="w-full h-3 accent-[#00ffcc]" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {routes.map(route => activeTab === route.id && (
          <div key={`edit-pane-${route.id}`} className="tactical-panel p-2 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="industrial-header">
              <h2 className="flex items-center gap-4">
                <Database className="w-6 h-6 text-[#ff0055]" /> STREAM CONFIGURATION
              </h2>
            </div>
            
            <div className="flex flex-col gap-2 border-b border-[#4a4a4a] pb-2">
              <div className="flex items-center gap-4 w-full">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <input type="color" value={route.color} onChange={(e) => updateRoute(route.id, { color: e.target.value })} className="w-10 h-8 bg-transparent border-none cursor-pointer shrink-0 p-0" />
                  <input type="text" value={route.color} onChange={(e) => updateRoute(route.id, { color: e.target.value })} className="w-14 bg-transparent border-b border-[#4a4a4a] text-center text-[#ffffff] text-[10px] uppercase font-mono focus:outline-none" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[12px] text-[#8a8a8a] font-black tracking-widest">STREAM NAME</span>
                  <input type="text" value={route.name} onChange={(e) => updateRoute(route.id, { name: e.target.value.toUpperCase() })} className="bg-transparent border-none text-[#00ffcc] text-lg font-black focus:outline-none w-full tracking-tighter truncate" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                {showResources && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[12px] text-[#8a8a8a] font-black flex items-center gap-2 tracking-widest">
                      <Database className="w-4 h-4 text-[#ffd700]" /> RESOURCE LVL
                    </span>
                    <input type="number" value={route.resourceValue} onChange={(e) => updateRoute(route.id, { resourceValue: parseInt(e.target.value) || 0 })} className="w-32 text-xl font-black bg-[#0a0a12] border-4 border-[#4a4a4a] p-2 text-[#ffd700]" />
                  </div>
                )}
                <button onClick={() => removeRoute(route.id)} className="text-[#ff0055] hover:bg-[#ff0055]/10 p-2 tactical-panel border-[#ff0055]/50 flex items-center gap-2 text-[12px] font-black active:scale-95 transition-all">
                  <Trash2 className="w-5 h-5" /> DELETE STREAM
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
              {sections.map((sec, i) => (
                <div key={`${route.id}-p-${i}`} className="bg-[#0a0a12]/40 p-1.5 border border-[#4a4a4a]/30 flex flex-col justify-between">
                  <label className="text-[8px] font-bold block truncate uppercase tracking-tighter" style={{ color: sec.color }}>{sec.name}</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.01" value={route.data[i] ?? 0} onChange={(e) => updateDataPoint(route.id, i, parseFloat(e.target.value) || 0)} className="w-full text-xs font-black bg-transparent border-b border-[#4a4a4a] text-[#ffffff] focus:border-[#00ffcc] focus:outline-none py-0.5" />
                    {uiSettings.showPercentage && <span className="text-[10px] text-[#00ffcc] font-bold">%</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
