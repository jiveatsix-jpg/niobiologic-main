import React, { useRef, useState } from 'react';
import { Type, Palette, Settings2, Image as ImageIcon, Activity, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useAeterContext } from '../context/AeterContext';

export const FormPanel: React.FC = () => {
  const { uiSettings, setUiSettings, viewMode } = useAeterContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [collapsed, setCollapsed] = useState({ identity: false, optics: false, telemetry: true });

  const toggle = (key: keyof typeof collapsed) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

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
    <aside className="w-[260px] h-full flex-shrink-0 bg-[#000000]/80 border-l border-[#1a1a2e] overflow-y-auto no-scrollbar backdrop-blur-md flex flex-col gap-1.5 p-2 panel-texture tactical-glow-right relative panel-scanlines">

      {/* ═══ IDENTITY ═══ */}
      <div className="tactical-panel border-[#4a4a4a]/40">
        <button onClick={() => toggle('identity')} className="w-full flex items-center justify-between p-2 hover:bg-[#ffffff]/3 transition-colors">
          <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.15em] text-[#ffd700]">
            <Type className="w-4 h-4" /> IDENTITY
          </span>
          {collapsed.identity ? <ChevronDown className="w-3 h-3 text-[#4a4a4a]" /> : <ChevronUp className="w-3 h-3 text-[#4a4a4a]" />}
        </button>

        {!collapsed.identity && (
          <div className="px-2 pb-2 space-y-2">
            {/* Graph Title */}
            <div className="space-y-1">
              <span className="text-[8px] text-[#4a4a4a] font-bold">GRAPH TITLE</span>
              <div className="flex gap-1">
                <input type="text" value={uiSettings.graphTitle || ''} onChange={(e) => setUiSettings({ ...uiSettings, graphTitle: e.target.value })} className="flex-1 bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[9px] p-1.5 font-mono focus:outline-none focus:border-[#ffd700]" placeholder="TACTICAL OVERVIEW" />
                <input type="color" value={uiSettings.graphTitleColor || '#ffffff'} onChange={(e) => setUiSettings({ ...uiSettings, graphTitleColor: e.target.value })} className="w-6 h-7 p-0 border-0 bg-transparent cursor-pointer" title="Color" />
                <input type="color" value={uiSettings.graphTitleGlow || '#00ffcc'} onChange={(e) => setUiSettings({ ...uiSettings, graphTitleGlow: e.target.value })} className="w-6 h-7 p-0 border-0 bg-transparent cursor-pointer" title="Glow" />
              </div>
            </div>

            {/* Axes */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[8px] text-[#4a4a4a] font-bold">X-AXIS</span>
                <input type="text" value={uiSettings.xAxisTitle || ''} onChange={(e) => setUiSettings({ ...uiSettings, xAxisTitle: e.target.value })} className="w-full bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[9px] p-1.5 font-mono focus:outline-none focus:border-[#ffd700]" placeholder="TIME" />
              </div>
              <div className="space-y-1">
                <span className="text-[8px] text-[#4a4a4a] font-bold">Y-AXIS</span>
                <input type="text" value={uiSettings.yAxisTitle || ''} onChange={(e) => setUiSettings({ ...uiSettings, yAxisTitle: e.target.value })} className="w-full bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[9px] p-1.5 font-mono focus:outline-none focus:border-[#ffd700]" placeholder="VALUE" />
              </div>
            </div>

            {/* Axes Color — Moved from Optics for better UX */}
            <div className="pt-2 border-t border-[#4a4a4a]/20">
              <span className="text-[8px] text-[#4a4a4a] font-bold uppercase tracking-wider">Axes Color</span>
              <div className="flex items-center gap-2 mt-1 bg-[#000000] border border-[#4a4a4a] p-1">
                <input type="color" value={uiSettings.baseColor} onChange={(e) => setUiSettings({ ...uiSettings, baseColor: e.target.value })} className="w-6 h-6 bg-transparent border-none cursor-pointer p-0" />
                <input type="text" value={uiSettings.baseColor} onChange={(e) => setUiSettings({ ...uiSettings, baseColor: e.target.value })} className="flex-1 bg-transparent text-[#ffffff] text-[10px] font-mono focus:outline-none uppercase" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ OPTICS ═══ */}
      <div className="tactical-panel border-[#4a4a4a]/40">
        <button onClick={() => toggle('optics')} className="w-full flex items-center justify-between p-2 hover:bg-[#ffffff]/3 transition-colors">
          <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.15em] text-[#00ffcc]">
            <Palette className="w-4 h-4" /> OPTICS
          </span>
          {collapsed.optics ? <ChevronDown className="w-3 h-3 text-[#4a4a4a]" /> : <ChevronUp className="w-3 h-3 text-[#4a4a4a]" />}
        </button>

        {!collapsed.optics && (
          <div className="px-2 pb-2 space-y-2">
            {/* Selects */}
            <div className="space-y-1">
              <span className="text-[8px] text-[#4a4a4a] font-bold">SCALE</span>
              <select value={uiSettings.scaleMode} onChange={(e) => setUiSettings({ ...uiSettings, scaleMode: e.target.value as any })} className="w-full bg-[#0a0a12] border border-[#4a4a4a] text-[#00ffcc] text-[9px] p-1.5 font-bold focus:outline-none">
                <option value="DYNAMIC">DYNAMIC (AUTO)</option>
                <option value="FIXED">FIXED (0-100%)</option>
                <option value="DATA_ONLY">DATA ONLY</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[8px] text-[#4a4a4a] font-bold">PATTERN</span>
                <select value={uiSettings.backgroundPattern} onChange={(e) => setUiSettings({ ...uiSettings, backgroundPattern: e.target.value as any })} className="w-full bg-[#0a0a12] border border-[#4a4a4a] text-[#00ffcc] text-[8px] p-1.5 font-bold focus:outline-none">
                  <option value="STANDARD">GRID</option>
                  <option value="SOLID">BLACK</option>
                  <option value="SCANLINES">SCAN</option>
                  <option value="RADIAL">RADIAL</option>
                  <option value="STEALTH">STEALTH</option>
                  <option value="BLUEPRINT">PRINT</option>
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] text-[#4a4a4a] font-bold">FONT</span>
                <select value={uiSettings.fontFamily} onChange={(e) => setUiSettings({ ...uiSettings, fontFamily: e.target.value })} className="w-full bg-[#0a0a12] border border-[#4a4a4a] text-[#00ffcc] text-[8px] p-1.5 font-bold focus:outline-none">
                  <option value='"Courier New", monospace'>COURIER</option>
                  <option value='"Press Start 2P", cursive'>PRESS START</option>
                  <option value='"VT323", monospace'>VT323</option>
                  <option value='"Silkscreen", cursive'>SILKSCREEN</option>
                  <option value='"Pixelify Sans", sans-serif'>PIXELIFY</option>
                  <option value='"Chakra Petch", sans-serif'>CHAKRA</option>
                  <option value='"Goldman", cursive'>GOLDMAN</option>
                  <option value='"DotGothic16", sans-serif'>MATRIX</option>
                  <option value='"JetBrains Mono", monospace'>JETBRAINS</option>
                  <option value='"Inter", sans-serif'>INTER</option>
                  <option value='"Space Grotesk", sans-serif'>GROTESK</option>
                  <option value='Georgia, serif'>GEORGIA</option>
                </select>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <span className="text-[8px] text-[#4a4a4a] font-bold">SIZE: {uiSettings.fontSize}</span>
                <input type="range" min="10" max="40" value={uiSettings.fontSize} onChange={(e) => setUiSettings({ ...uiSettings, fontSize: parseInt(e.target.value) })} className="w-full accent-[#00ffcc] h-2" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] text-[#4a4a4a] font-bold">LINE: {uiSettings.lineWidth}</span>
                <input type="range" min="1" max="8" step="1" value={uiSettings.lineWidth} onChange={(e) => setUiSettings({ ...uiSettings, lineWidth: parseInt(e.target.value) })} className="w-full accent-[#ff0055] h-2" />
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-1">
              <span className="text-[8px] text-[#4a4a4a] font-bold">COLORS</span>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { label: 'GRID', key: 'gridColor' as const },
                  { label: 'HUD', key: 'hudColor' as const },
                ].map(({ label, key }) => (
                  <div key={key} className="flex flex-col gap-0.5 items-center">
                    <span className="text-[7px] text-[#4a4a4a] font-bold">{label}</span>
                    <div className="flex items-center w-full bg-[#000000] border border-[#4a4a4a] p-0.5">
                      <input type="color" value={uiSettings[key]} onChange={(e) => setUiSettings({ ...uiSettings, [key]: e.target.value })} className="w-3 h-3 bg-transparent border-none cursor-pointer p-0 shrink-0" />
                      <input type="text" value={uiSettings[key]} onChange={(e) => setUiSettings({ ...uiSettings, [key]: e.target.value })} className="w-full bg-transparent text-center text-[#ffffff] text-[7px] font-mono focus:outline-none uppercase" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-1 pt-1 border-t border-[#4a4a4a]/20">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-3 h-3 border flex items-center justify-center ${uiSettings.showPercentage ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}>
                  {uiSettings.showPercentage && <div className="w-1.5 h-1.5 bg-[#000000]" />}
                </div>
                <input type="checkbox" className="hidden" checked={uiSettings.showPercentage} onChange={(e) => setUiSettings({ ...uiSettings, showPercentage: e.target.checked })} />
                <span className="text-[8px] font-bold text-[#8a8a8a] uppercase tracking-widest">PERCENTAGES</span>
              </label>
              {viewMode === 'COMPARISON' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-3 h-3 border flex items-center justify-center ${uiSettings.showCompYAxis ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}>
                    {uiSettings.showCompYAxis && <div className="w-1.5 h-1.5 bg-[#000000]" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={!!uiSettings.showCompYAxis} onChange={(e) => setUiSettings({ ...uiSettings, showCompYAxis: e.target.checked })} />
                  <span className="text-[8px] font-bold text-[#8a8a8a] uppercase tracking-widest">Y-AXIS (COMP)</span>
                </label>
              )}
            </div>

            {/* BG Image */}
            <div className="flex gap-1 pt-1 border-t border-[#4a4a4a]/20">
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-1 bg-[#3a3a5e]/40 text-[8px] font-bold border border-[#6a6a8e]/30 hover:bg-[#4a4a6e] flex items-center justify-center gap-1">
                <ImageIcon className="w-3 h-3" /> BG IMAGE
              </button>
              {uiSettings.bgImage && <button onClick={() => setUiSettings({ ...uiSettings, bgImage: null })} className="px-2 bg-[#ff0055]/80 text-[#ffffff] hover:bg-[#cc0044]"><X className="w-3 h-3" /></button>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleBgImageChange} className="hidden" />
          </div>
        )}
      </div>

      {/* ═══ TELEMETRY ═══ */}
      <div className="tactical-panel border-[#4a4a4a]/40">
        <button onClick={() => toggle('telemetry')} className="w-full flex items-center justify-between p-2 hover:bg-[#ffffff]/3 transition-colors">
          <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.15em] text-[#8a8a8a]">
            <Activity className="w-4 h-4" /> TELEMETRY
          </span>
          {collapsed.telemetry ? <ChevronDown className="w-3 h-3 text-[#4a4a4a]" /> : <ChevronUp className="w-3 h-3 text-[#4a4a4a]" />}
        </button>

        {!collapsed.telemetry && (
          <div className="px-2 pb-2 space-y-2">
            {/* Top Right */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-3 h-3 border flex items-center justify-center ${uiSettings.showTelemetryTopRight !== false ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}>
                  {uiSettings.showTelemetryTopRight !== false && <div className="w-1.5 h-1.5 bg-[#000000]" />}
                </div>
                <input type="checkbox" className="hidden" checked={uiSettings.showTelemetryTopRight !== false} onChange={(e) => setUiSettings({ ...uiSettings, showTelemetryTopRight: e.target.checked })} />
                <span className="text-[8px] font-bold text-[#8a8a8a] uppercase tracking-widest">TOP RIGHT</span>
              </label>
              <div className="grid grid-cols-2 gap-1">
                <input type="text" value={uiSettings.telemetryTopRightLabel || ''} onChange={(e) => setUiSettings({ ...uiSettings, telemetryTopRightLabel: e.target.value })} className="bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[8px] p-1 font-mono focus:outline-none focus:border-[#00ffcc]" placeholder="LABEL" />
                <input type="text" value={uiSettings.telemetryTopRightValue || ''} onChange={(e) => setUiSettings({ ...uiSettings, telemetryTopRightValue: e.target.value })} className="bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[8px] p-1 font-mono focus:outline-none focus:border-[#00ffcc]" placeholder="VALUE" />
              </div>
            </div>

            {/* Bottom Right */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-3 h-3 border flex items-center justify-center ${uiSettings.showTelemetryBottomRight !== false ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}>
                  {uiSettings.showTelemetryBottomRight !== false && <div className="w-1.5 h-1.5 bg-[#000000]" />}
                </div>
                <input type="checkbox" className="hidden" checked={uiSettings.showTelemetryBottomRight !== false} onChange={(e) => setUiSettings({ ...uiSettings, showTelemetryBottomRight: e.target.checked })} />
                <span className="text-[8px] font-bold text-[#8a8a8a] uppercase tracking-widest">BOTTOM RIGHT</span>
              </label>
              <div className="grid grid-cols-2 gap-1">
                <input type="text" value={uiSettings.telemetryBottomRightLabel || ''} onChange={(e) => setUiSettings({ ...uiSettings, telemetryBottomRightLabel: e.target.value })} className="bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[8px] p-1 font-mono focus:outline-none focus:border-[#00ffcc]" placeholder="LABEL" />
                <input type="text" value={uiSettings.telemetryBottomRightValue || ''} onChange={(e) => setUiSettings({ ...uiSettings, telemetryBottomRightValue: e.target.value })} className="bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[8px] p-1 font-mono focus:outline-none focus:border-[#00ffcc]" placeholder="VALUE" />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
