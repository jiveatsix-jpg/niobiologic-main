import React, { useRef } from 'react';
import { Plus, Trash2, Settings2, ChevronLeft, ChevronRight, Database, Target, Image as ImageIcon, X, Eye, EyeOff } from 'lucide-react';
import { useAeterContext } from '../context/AeterContext';
import { useState } from 'react';

/* ═══ STREAMS ═══ */
export const StreamsContent: React.FC = () => {
  const { routes, addRoute, removeRoute, updateRoute, showResources, setShowResources } = useAeterContext();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <label className="flex items-center gap-2 cursor-pointer p-1 border-b border-[#4a4a4a]/20 pb-2">
        <div className={`w-3 h-3 border flex items-center justify-center ${showResources ? 'border-[#ffd700] bg-[#ffd700]' : 'border-[#4a4a4a]'}`}>
          {showResources && <div className="w-1.5 h-1.5 bg-[#000000]" />}
        </div>
        <input type="checkbox" className="hidden" checked={showResources} onChange={() => setShowResources(!showResources)} />
        <span className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-widest">SHOW RESOURCES</span>
      </label>
      {routes.map(route => (
        <div key={route.id} className={`bg-[#0a0a12] border border-[#4a4a4a]/40 ${route.hidden ? 'opacity-40' : ''}`}>
          <div className="flex items-center gap-1.5 p-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: route.color, boxShadow: `0 0 6px ${route.color}` }} />
            <input type="text" value={route.name} onChange={e => updateRoute(route.id, { name: e.target.value.toUpperCase() })} className="bg-transparent border-none text-[#ffffff] font-bold text-[13px] focus:outline-none min-w-0 flex-1 tracking-wider" />
            <button onClick={() => updateRoute(route.id, { hidden: !route.hidden })} title={route.hidden ? 'Muestra esta línea en el gráfico' : 'Oculta esta línea del gráfico (útil para armar capturas de un GIF paso a paso)'} className={`p-0.5 shrink-0 ${route.hidden ? 'text-[#4a4a4a]' : 'text-[#00ffcc]'}`}>{route.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
            <button onClick={() => setExpanded(expanded === route.id ? null : route.id)} title={expanded === route.id ? 'Cierra los ajustes de color y recurso de esta línea' : 'Abre los ajustes de color y recurso de esta línea'} className={`p-0.5 shrink-0 ${expanded === route.id ? 'text-[#00ffcc]' : 'text-[#4a4a4a]'}`}><Settings2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => removeRoute(route.id)} title="Elimina esta línea y todos sus valores" className="p-0.5 text-[#ff0055]/40 hover:text-[#ff0055] shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
          {expanded === route.id && (
            <div className="p-2 border-t border-[#4a4a4a]/30 space-y-2 bg-[#000000]/40">
              <div className="flex items-center gap-2">
                <input type="color" value={route.color} onChange={e => updateRoute(route.id, { color: e.target.value })} className="w-5 h-5 p-0 bg-transparent border-none cursor-pointer shrink-0" />
                <input type="text" value={route.color} onChange={e => updateRoute(route.id, { color: e.target.value })} className="flex-1 bg-transparent border-b border-[#4a4a4a] text-[#ffffff] text-[11px] font-mono uppercase focus:outline-none" />
              </div>
              {showResources && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#ffd700] font-bold">RES</span>
                  <input type="number" value={route.resourceValue} onChange={e => updateRoute(route.id, { resourceValue: parseInt(e.target.value) || 0 })} className="w-16 bg-[#0a0a12] border border-[#4a4a4a] text-[#ffd700] text-[13px] font-black text-center p-0.5 focus:outline-none" />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      <button onClick={addRoute} title="Agrega una nueva línea de datos al gráfico" className="w-full py-1.5 flex items-center justify-center gap-1 text-[12px] font-black text-[#ff0055] border border-dashed border-[#ff0055]/40 hover:border-[#ff0055] hover:bg-[#ff0055]/5 active:scale-95">
        <Plus className="w-3 h-3" /> ADD STREAM
      </button>
    </>
  );
};

/* ═══ SECTORS ═══ */
export const SectorsContent: React.FC = () => {
  const { sections, addSection, removeSection, updateSection, currentSectionIndex, setCurrentSectionIndex, viewMode } = useAeterContext();
  const [expanded, setExpanded] = useState<number | null>(null);
  const isActive = (i: number) => (viewMode === 'COMPARISON' || viewMode === 'DISTRIBUTION') && i === currentSectionIndex;

  return (
    <>
      {(viewMode === 'COMPARISON' || viewMode === 'DISTRIBUTION') && (
        <div className="flex items-center justify-between p-1.5 bg-[#00ffcc]/5 border border-[#00ffcc]/20">
          <button onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))} disabled={currentSectionIndex === 0} title="Muestra la categoría anterior del eje X" className="p-0.5 text-[#00ffcc] disabled:opacity-20"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <span className="text-[11px] font-black text-[#00ffcc] tracking-widest">ACTIVE: {sections[currentSectionIndex]?.name}</span>
          <button onClick={() => setCurrentSectionIndex(Math.min(sections.length - 1, currentSectionIndex + 1))} disabled={currentSectionIndex === sections.length - 1} title="Muestra la categoría siguiente del eje X" className="p-0.5 text-[#00ffcc] disabled:opacity-20"><ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
      )}
      {sections.map((sec, i) => (
        <div key={`sec-${i}`} className={`bg-[#0a0a12] border transition-all ${isActive(i) ? 'border-[#00ffcc]/60 bg-[#00ffcc]/5' : 'border-[#4a4a4a]/40'} ${sec.hidden ? 'opacity-40' : ''}`}>
          <div className="flex items-center gap-1.5 p-1.5">
            <input type="color" value={sec.color} onChange={e => updateSection(i, { color: e.target.value })} className="w-4 h-4 p-0 bg-transparent border-none cursor-pointer shrink-0" />
            <input type="text" value={sec.color} onChange={e => updateSection(i, { color: e.target.value })} className="w-12 bg-transparent border-none text-[#ffffff] font-mono text-[11px] focus:outline-none uppercase" />
            <input type="text" value={sec.name} onChange={e => updateSection(i, { name: e.target.value })} className="bg-transparent border-none text-[#00ffcc] font-bold text-[13px] focus:outline-none min-w-0 flex-1 tracking-wider" />
            <button onClick={() => updateSection(i, { hidden: !sec.hidden })} title={sec.hidden ? 'Muestra esta categoría en el gráfico' : 'Oculta esta categoría del gráfico (útil para armar capturas de un GIF paso a paso)'} className={`p-0.5 shrink-0 ${sec.hidden ? 'text-[#4a4a4a]' : 'text-[#00ffcc]'}`}>{sec.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
            {(viewMode === 'COMPARISON' || viewMode === 'DISTRIBUTION') && <button onClick={() => setCurrentSectionIndex(i)} title="Marca esta categoría como la activa en la vista actual" className={`p-0.5 shrink-0 ${isActive(i) ? 'text-[#00ffcc]' : 'text-[#4a4a4a]'}`}><Target className="w-3 h-3" /></button>}
            <button onClick={() => setExpanded(expanded === i ? null : i)} title={expanded === i ? 'Cierra los ajustes de anclaje y brillo de esta categoría' : 'Abre los ajustes de anclaje y brillo de esta categoría'} className={`p-0.5 shrink-0 ${expanded === i ? 'text-[#00ffcc]' : 'text-[#4a4a4a]'}`}><Settings2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => removeSection(i)} title="Elimina esta categoría del eje X en todas las líneas" className="p-0.5 text-[#ff0055]/40 hover:text-[#ff0055] shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
          {expanded === i && (
            <div className="p-2 border-t border-[#4a4a4a]/30 grid grid-cols-2 gap-2 bg-[#000000]/40 text-[12px] font-black uppercase text-[#8a8a8a]">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-3 h-3 border flex items-center justify-center ${sec.isAnchored ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}>{sec.isAnchored && <div className="w-1.5 h-1.5 bg-[#000000]" />}</div>
                <input type="checkbox" className="hidden" checked={!!sec.isAnchored} onChange={e => updateSection(i, { isAnchored: e.target.checked })} /> ANCHOR
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-3 h-3 border flex items-center justify-center ${sec.isMinimalShadow ? 'border-[#ff0055] bg-[#ff0055]' : 'border-[#4a4a4a]'}`}>{sec.isMinimalShadow && <div className="w-1.5 h-1.5 bg-[#ffffff]" />}</div>
                <input type="checkbox" className="hidden" checked={!!sec.isMinimalShadow} onChange={e => updateSection(i, { isMinimalShadow: e.target.checked })} /> MIN SHADOW
              </label>
              <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-[#4a4a4a]/20">
                <span className="shrink-0">GLOW</span>
                <input type="color" value={sec.shadowColor} onChange={e => updateSection(i, { shadowColor: e.target.value })} className="w-4 h-4 bg-transparent border-none p-0 cursor-pointer shrink-0" />
                <input type="range" min="0" max="20" value={sec.glowIntensity} onChange={e => updateSection(i, { glowIntensity: parseInt(e.target.value) })} className="flex-1 h-2 accent-[#00ffcc]" />
              </div>
            </div>
          )}
        </div>
      ))}
      <button onClick={addSection} title="Agrega una nueva categoría al eje X, sumando una columna a todas las líneas" className="w-full py-1.5 flex items-center justify-center gap-1 text-[12px] font-black text-[#00ffcc] border border-dashed border-[#00ffcc]/40 hover:border-[#00ffcc] hover:bg-[#00ffcc]/5 active:scale-95">
        <Plus className="w-3 h-3" /> ADD SECTOR
      </button>
    </>
  );
};

/* ═══ DATA MATRIX ═══ */
export const MatrixContent: React.FC = () => {
  const { routes, sections, updateDataPoint, updateRoute, uiSettings } = useAeterContext();

  // Pastes a block copied from Excel/Sheets (or any tab/comma/newline-separated text)
  // starting at the cell that received the paste, filling rows across routes and
  // columns across sections — like pasting into a spreadsheet.
  const handleMatrixPaste = (e: React.ClipboardEvent<HTMLInputElement>, routeIdx: number, sectionIdx: number) => {
    const text = e.clipboardData.getData('text');
    if (!/[\t\n,]/.test(text)) return; // single value: let the browser paste normally
    e.preventDefault();
    const rows = text.trim().split(/\r?\n/).map(row => row.split(/[\t,]/).map(v => parseFloat(v.trim())));
    rows.forEach((row, rOffset) => {
      const targetRoute = routes[routeIdx + rOffset];
      if (!targetRoute) return;
      row.forEach((val, cOffset) => {
        const targetSection = sectionIdx + cOffset;
        if (targetSection >= sections.length || isNaN(val)) return;
        updateDataPoint(targetRoute.id, targetSection, val);
      });
    });
  };

  return (
    <>
      <div className="text-[9px] text-[#4a4a4a] leading-snug pb-1 border-b border-[#4a4a4a]/20">
        TIP: pegá un bloque de valores copiado de Excel/Sheets en cualquier celda para llenar toda la grilla de una.
      </div>
      {routes.map((route, routeIdx) => (
        <div key={`matrix-${route.id}`}>
          <div className="flex items-center gap-1 mb-1">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: route.color, boxShadow: `0 0 4px ${route.color}` }} />
            <span className="text-[12px] font-black tracking-wider truncate min-w-0 flex-1" style={{ color: route.color }}>{route.name}</span>
            <input type="text" value={route.unitSymbol || ''} onChange={e => updateRoute(route.id, { unitSymbol: e.target.value })} maxLength={3} placeholder="UNIT" className="w-11 shrink-0 bg-[#0a0a12] border border-[#4a4a4a] text-[#ffffff] text-[10px] font-mono text-center p-0.5 focus:outline-none focus:border-[#00ffcc]" title="Símbolo de unidad ($, €, %, kg...)" />
            <select value={route.unitPosition || 'suffix'} onChange={e => updateRoute(route.id, { unitPosition: e.target.value as 'prefix' | 'suffix' })} className="w-12 shrink-0 bg-[#0a0a12] border border-[#4a4a4a] text-[#8a8a8a] text-[9px] font-mono p-0.5 focus:outline-none" title="Posición del símbolo">
              <option value="prefix">PRE</option>
              <option value="suffix">SUF</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {sections.map((sec, i) => (
              <div key={`${route.id}-v-${i}`} className="bg-[#0a0a12]/60 p-1 border border-[#4a4a4a]/20">
                <label className="text-[10px] font-bold block truncate uppercase tracking-tight" style={{ color: sec.color }}>{sec.name}</label>
                <input type="number" step="0.01" value={route.data[i] ?? 0} onChange={e => updateDataPoint(route.id, i, parseFloat(e.target.value) || 0)} onPaste={e => handleMatrixPaste(e, routeIdx, i)} title="Pegá un bloque de valores acá para llenar varias celdas de una" className="w-full text-[13px] font-black bg-transparent border-b border-[#4a4a4a] text-[#ffffff] focus:border-[#00ffcc] focus:outline-none py-0.5" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

/* ═══ IDENTITY ═══ */
export const IdentityContent: React.FC = () => {
  const { uiSettings, setUiSettings } = useAeterContext();
  return (
    <>
      <div className="space-y-1">
        <span className="text-[11px] text-[#4a4a4a] font-bold">GRAPH TITLE</span>
        <div className="flex gap-1">
          <input type="text" value={uiSettings.graphTitle || ''} onChange={e => setUiSettings({ ...uiSettings, graphTitle: e.target.value })} className="flex-1 bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[12px] p-1.5 font-mono focus:outline-none focus:border-[#ffd700]" placeholder="TACTICAL OVERVIEW" />
          <input type="color" value={uiSettings.graphTitleColor || '#ffffff'} onChange={e => setUiSettings({ ...uiSettings, graphTitleColor: e.target.value })} className="w-6 h-7 p-0 border-0 bg-transparent cursor-pointer" title="Color" />
          <input type="color" value={uiSettings.graphTitleGlow || '#00ffcc'} onChange={e => setUiSettings({ ...uiSettings, graphTitleGlow: e.target.value })} className="w-6 h-7 p-0 border-0 bg-transparent cursor-pointer" title="Glow" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <span className="text-[11px] text-[#4a4a4a] font-bold">X-AXIS</span>
          <input type="text" value={uiSettings.xAxisTitle || ''} onChange={e => setUiSettings({ ...uiSettings, xAxisTitle: e.target.value })} className="w-full bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[12px] p-1.5 font-mono focus:outline-none focus:border-[#ffd700]" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-[#4a4a4a] font-bold">Y-AXIS</span>
          <input type="text" value={uiSettings.yAxisTitle || ''} onChange={e => setUiSettings({ ...uiSettings, yAxisTitle: e.target.value })} className="w-full bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[12px] p-1.5 font-mono focus:outline-none focus:border-[#ffd700]" />
        </div>
      </div>
      <div className="pt-2 border-t border-[#4a4a4a]/20">
        <span className="text-[11px] text-[#4a4a4a] font-bold uppercase tracking-wider">Axes Color</span>
        <div className="flex items-center gap-2 mt-1 bg-[#000000] border border-[#4a4a4a] p-1">
          <input type="color" value={uiSettings.baseColor} onChange={e => setUiSettings({ ...uiSettings, baseColor: e.target.value })} className="w-6 h-6 bg-transparent border-none cursor-pointer p-0" />
          <input type="text" value={uiSettings.baseColor} onChange={e => setUiSettings({ ...uiSettings, baseColor: e.target.value })} className="flex-1 bg-transparent text-[#ffffff] text-[13px] font-mono focus:outline-none uppercase" />
        </div>
      </div>
    </>
  );
};

/* ═══ OPTICS ═══ */
export const OpticsContent: React.FC = () => {
  const { uiSettings, setUiSettings, viewMode } = useAeterContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const handleBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const r = new FileReader(); r.onload = ev => setUiSettings({ ...uiSettings, bgImage: ev.target?.result as string }); r.readAsDataURL(file); }
  };
  return (
    <>
      <div className="space-y-1"><span className="text-[11px] text-[#4a4a4a] font-bold">SCALE</span>
        <select value={uiSettings.scaleMode} onChange={e => setUiSettings({ ...uiSettings, scaleMode: e.target.value as any })} className="w-full bg-[#0a0a12] border border-[#4a4a4a] text-[#00ffcc] text-[12px] p-1.5 font-bold focus:outline-none">
          <option value="DYNAMIC">DYNAMIC (AUTO)</option><option value="FIXED">FIXED (0-100%)</option><option value="DATA_ONLY">DATA ONLY</option>
        </select>
      </div>
      <div className="space-y-1"><span className="text-[11px] text-[#4a4a4a] font-bold uppercase tracking-widest">Visual Filter</span>
        <select value={uiSettings.visualFilter} onChange={e => setUiSettings({ ...uiSettings, visualFilter: e.target.value as any })} className="w-full bg-[#0a0a12] border border-[#4a4a4a] text-[#ffd700] text-[12px] p-1.5 font-bold focus:outline-none">
          <option value="NONE">NONE (CLEAN DARK)</option>
          <option value="CRT">CRT (SCANLINES)</option>
          <option value="PRINT">PRINT (BLUEPRINT)</option>
          <option value="STEALTH">STEALTH (AMBER)</option>
          <option value="VINTAGE">VINTAGE (SEPIA)</option>
          <option value="MONOCHROME">MONOCHROME (GREEN)</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1"><span className="text-[11px] text-[#4a4a4a] font-bold">PATTERN</span>
          <select value={uiSettings.backgroundPattern} onChange={e => setUiSettings({ ...uiSettings, backgroundPattern: e.target.value as any })} className="w-full bg-[#0a0a12] border border-[#4a4a4a] text-[#00ffcc] text-[11px] p-1.5 font-bold focus:outline-none">
            <option value="STANDARD">GRID</option><option value="SOLID">BLACK</option><option value="SCANLINES">SCAN</option><option value="RADIAL">RADIAL</option><option value="STEALTH">STEALTH</option><option value="BLUEPRINT">PRINT</option>
          </select>
        </div>
        <div className="space-y-1"><span className="text-[11px] text-[#4a4a4a] font-bold">FONT</span>
          <select value={uiSettings.fontFamily} onChange={e => setUiSettings({ ...uiSettings, fontFamily: e.target.value })} className="w-full bg-[#0a0a12] border border-[#4a4a4a] text-[#00ffcc] text-[11px] p-1.5 font-bold focus:outline-none">
            <option value='"Courier New", monospace'>COURIER</option><option value='"Press Start 2P", cursive'>PRESS START</option><option value='"VT323", monospace'>VT323</option><option value='"Silkscreen", cursive'>SILKSCREEN</option><option value='"Pixelify Sans", sans-serif'>PIXELIFY</option><option value='"Chakra Petch", sans-serif'>CHAKRA</option><option value='"Goldman", cursive'>GOLDMAN</option><option value='"DotGothic16", sans-serif'>MATRIX</option><option value='"JetBrains Mono", monospace'>JETBRAINS</option><option value='"Inter", sans-serif'>INTER</option><option value='"Space Grotesk", sans-serif'>GROTESK</option><option value='Georgia, serif'>GEORGIA</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-0.5"><span className="text-[11px] text-[#4a4a4a] font-bold">SIZE: {uiSettings.fontSize}</span><input type="range" min="10" max="40" value={uiSettings.fontSize} onChange={e => setUiSettings({ ...uiSettings, fontSize: parseInt(e.target.value) })} className="w-full accent-[#00ffcc] h-2" /></div>
        <div className="space-y-0.5"><span className="text-[11px] text-[#4a4a4a] font-bold">LINE: {uiSettings.lineWidth}</span><input type="range" min="1" max="8" value={uiSettings.lineWidth} onChange={e => setUiSettings({ ...uiSettings, lineWidth: parseInt(e.target.value) })} className="w-full accent-[#ff0055] h-2" /></div>
      </div>
      <div className="space-y-1"><span className="text-[11px] text-[#4a4a4a] font-bold">COLORS</span>
        <div className="grid grid-cols-2 gap-1">
          {([['GRID','gridColor'],['HUD','hudColor']] as const).map(([label, key]) => (
            <div key={key} className="flex flex-col gap-0.5 items-center">
              <span className="text-[10px] text-[#4a4a4a] font-bold">{label}</span>
              <div className="flex items-center w-full bg-[#000000] border border-[#4a4a4a] p-0.5">
                <input type="color" value={uiSettings[key]} onChange={e => setUiSettings({ ...uiSettings, [key]: e.target.value })} className="w-3 h-3 bg-transparent border-none cursor-pointer p-0 shrink-0" />
                <input type="text" value={uiSettings[key]} onChange={e => setUiSettings({ ...uiSettings, [key]: e.target.value })} className="w-full bg-transparent text-center text-[#ffffff] text-[10px] font-mono focus:outline-none uppercase" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1 pt-1 border-t border-[#4a4a4a]/20">
        {viewMode === 'COMPARISON' && <label className="flex items-center gap-2 cursor-pointer"><div className={`w-3 h-3 border flex items-center justify-center ${uiSettings.showCompYAxis ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}>{uiSettings.showCompYAxis && <div className="w-1.5 h-1.5 bg-[#000000]" />}</div><input type="checkbox" className="hidden" checked={!!uiSettings.showCompYAxis} onChange={e => setUiSettings({ ...uiSettings, showCompYAxis: e.target.checked })} /><span className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-widest">Y-AXIS (COMP)</span></label>}
        <label className="flex items-center gap-2 cursor-pointer"><div className={`w-3 h-3 border flex items-center justify-center ${uiSettings.showSectionLabels ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}>{uiSettings.showSectionLabels && <div className="w-1.5 h-1.5 bg-[#000000]" />}</div><input type="checkbox" className="hidden" checked={uiSettings.showSectionLabels} onChange={e => setUiSettings({ ...uiSettings, showSectionLabels: e.target.checked })} /><span className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-widest">SECTION LABELS</span></label>
        <label className="flex items-center gap-2 cursor-pointer"><div className={`w-3 h-3 border flex items-center justify-center ${uiSettings.showAreaTexture ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}>{uiSettings.showAreaTexture && <div className="w-1.5 h-1.5 bg-[#000000]" />}</div><input type="checkbox" className="hidden" checked={!!uiSettings.showAreaTexture} onChange={e => setUiSettings({ ...uiSettings, showAreaTexture: e.target.checked })} /><span className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-widest">AREA TEXTURE</span></label>
        <label className="flex items-center gap-2 cursor-pointer"><div className={`w-3 h-3 border flex items-center justify-center ${uiSettings.showPointValues ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}>{uiSettings.showPointValues && <div className="w-1.5 h-1.5 bg-[#000000]" />}</div><input type="checkbox" className="hidden" checked={!!uiSettings.showPointValues} onChange={e => setUiSettings({ ...uiSettings, showPointValues: e.target.checked })} /><span className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-widest">SHOW VALUES</span></label>
      </div>
      <div className="flex gap-1 pt-1 border-t border-[#4a4a4a]/20">
        <button onClick={() => fileRef.current?.click()} title="Elegí una imagen de fondo para el gráfico" className="flex-1 py-1 bg-[#3a3a5e]/40 text-[11px] font-bold border border-[#6a6a8e]/30 hover:bg-[#4a4a6e] flex items-center justify-center gap-1"><ImageIcon className="w-3 h-3" /> BG IMAGE</button>
        {uiSettings.bgImage && <button onClick={() => setUiSettings({ ...uiSettings, bgImage: null })} title="Quita la imagen de fondo" className="px-2 bg-[#ff0055]/80 text-[#ffffff]"><X className="w-3 h-3" /></button>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleBg} className="hidden" />
    </>
  );
};

/* ═══ TELEMETRY ═══ */
export const TelemetryContent: React.FC = () => {
  const { uiSettings, setUiSettings } = useAeterContext();
  return (
    <>
      <div className="space-y-1">
        <label className="flex items-center gap-2 cursor-pointer"><div className={`w-3 h-3 border flex items-center justify-center ${uiSettings.showTelemetryTopRight !== false ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}>{uiSettings.showTelemetryTopRight !== false && <div className="w-1.5 h-1.5 bg-[#000000]" />}</div><input type="checkbox" className="hidden" checked={uiSettings.showTelemetryTopRight !== false} onChange={e => setUiSettings({ ...uiSettings, showTelemetryTopRight: e.target.checked })} /><span className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-widest">TOP RIGHT</span></label>
        <div className="grid grid-cols-2 gap-1">
          <input type="text" value={uiSettings.telemetryTopRightLabel || ''} onChange={e => setUiSettings({ ...uiSettings, telemetryTopRightLabel: e.target.value })} className="bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[11px] p-1 font-mono focus:outline-none" placeholder="LABEL" />
          <input type="text" value={uiSettings.telemetryTopRightValue || ''} onChange={e => setUiSettings({ ...uiSettings, telemetryTopRightValue: e.target.value })} className="bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[11px] p-1 font-mono focus:outline-none" placeholder="VALUE" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="flex items-center gap-2 cursor-pointer"><div className={`w-3 h-3 border flex items-center justify-center ${uiSettings.showTelemetryBottomRight !== false ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}>{uiSettings.showTelemetryBottomRight !== false && <div className="w-1.5 h-1.5 bg-[#000000]" />}</div><input type="checkbox" className="hidden" checked={uiSettings.showTelemetryBottomRight !== false} onChange={e => setUiSettings({ ...uiSettings, showTelemetryBottomRight: e.target.checked })} /><span className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-widest">BOTTOM RIGHT</span></label>
        <div className="grid grid-cols-2 gap-1">
          <input type="text" value={uiSettings.telemetryBottomRightLabel || ''} onChange={e => setUiSettings({ ...uiSettings, telemetryBottomRightLabel: e.target.value })} className="bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[11px] p-1 font-mono focus:outline-none" placeholder="LABEL" />
          <input type="text" value={uiSettings.telemetryBottomRightValue || ''} onChange={e => setUiSettings({ ...uiSettings, telemetryBottomRightValue: e.target.value })} className="bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-[11px] p-1 font-mono focus:outline-none" placeholder="VALUE" />
        </div>
      </div>
    </>
  );
};
