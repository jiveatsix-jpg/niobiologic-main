import React, { useState } from 'react';
import { Plus, Trash2, Settings2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Database, Zap, Target } from 'lucide-react';
import { useAeterContext } from '../context/AeterContext';

export const DataPanel: React.FC = () => {
  const {
    sections, addSection, removeSection, updateSection,
    routes, addRoute, removeRoute, updateRoute, updateDataPoint,
    uiSettings, showResources, setShowResources,
    currentSectionIndex, setCurrentSectionIndex,
    viewMode
  } = useAeterContext();

  const [expandedStream, setExpandedStream] = useState<string | null>(null);
  const [expandedSector, setExpandedSector] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState({ streams: false, sectors: false, matrix: false });

  const toggle = (key: keyof typeof collapsed) => setCollapsed(p => ({ ...p, [key]: !p[key] }));
  const isActive = (i: number) => (viewMode === 'COMPARISON' || viewMode === 'DISTRIBUTION') && i === currentSectionIndex;

  return (
    <aside className="w-[280px] h-full flex-shrink-0 bg-[#000000]/80 border-r border-[#1a1a2e] overflow-y-auto no-scrollbar backdrop-blur-md flex flex-col gap-1.5 p-2 panel-texture tactical-glow-left relative panel-scanlines">

      {/* ═══ STREAMS ═══ */}
      <div className="tactical-panel border-[#4a4a4a]/40">
        <button onClick={() => toggle('streams')} className="w-full flex items-center justify-between p-2 hover:bg-[#ffffff]/3 transition-colors">
          <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.15em] text-[#ff0055]">
            <Database className="w-4 h-4" /> STREAMS
            <span className="text-[8px] text-[#4a4a4a] font-mono">({routes.length})</span>
          </span>
          {collapsed.streams ? <ChevronDown className="w-3 h-3 text-[#4a4a4a]" /> : <ChevronUp className="w-3 h-3 text-[#4a4a4a]" />}
        </button>

        {!collapsed.streams && (
          <div className="px-2 pb-2 space-y-1">
            <label className="flex items-center gap-2 cursor-pointer p-1 border-b border-[#4a4a4a]/20 pb-2 mb-1">
              <div className={`w-3 h-3 border flex items-center justify-center ${showResources ? 'border-[#ffd700] bg-[#ffd700]' : 'border-[#4a4a4a]'}`}>
                {showResources && <div className="w-1.5 h-1.5 bg-[#000000]" />}
              </div>
              <input type="checkbox" className="hidden" checked={showResources} onChange={() => setShowResources(!showResources)} />
              <span className="text-[8px] font-bold text-[#8a8a8a] uppercase tracking-widest">SHOW RESOURCES</span>
            </label>

            {routes.map(route => {
              const pathColor = route.name === 'ALPHA' ? '#ff0055' : route.name === 'BETA' ? '#00ffcc' : route.color;
              return (
                <div key={route.id} className="bg-[#0a0a12] border border-[#4a4a4a]/40 transition-all">
                  <div className="flex items-center gap-1.5 p-1.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pathColor, boxShadow: `0 0 6px ${pathColor}` }} />
                    <input type="text" value={route.name} onChange={(e) => updateRoute(route.id, { name: e.target.value.toUpperCase() })} className="bg-transparent border-none text-[#ffffff] font-bold text-[10px] focus:outline-none min-w-0 flex-1 tracking-wider" />
                    <button onClick={() => setExpandedStream(expandedStream === route.id ? null : route.id)} className={`p-0.5 shrink-0 ${expandedStream === route.id ? 'text-[#00ffcc]' : 'text-[#4a4a4a] hover:text-[#ffffff]'}`}>
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeRoute(route.id)} className="p-0.5 text-[#ff0055]/40 hover:text-[#ff0055] shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {expandedStream === route.id && (
                    <div className="p-2 border-t border-[#4a4a4a]/30 space-y-2 bg-[#000000]/40">
                      <div className="flex items-center gap-2">
                        <input type="color" value={route.color} onChange={(e) => updateRoute(route.id, { color: e.target.value })} className="w-5 h-5 p-0 bg-transparent border-none cursor-pointer shrink-0" />
                        <input type="text" value={route.color} onChange={(e) => updateRoute(route.id, { color: e.target.value })} className="flex-1 bg-transparent border-b border-[#4a4a4a] text-[#ffffff] text-[8px] font-mono uppercase focus:outline-none" />
                      </div>
                      {showResources && (
                        <div className="flex items-center gap-2">
                          <Database className="w-3 h-3 text-[#ffd700] shrink-0" />
                          <span className="text-[8px] text-[#ffd700] font-bold shrink-0">RES</span>
                          <input type="number" value={route.resourceValue} onChange={(e) => updateRoute(route.id, { resourceValue: parseInt(e.target.value) || 0 })} className="w-16 bg-[#0a0a12] border border-[#4a4a4a] text-[#ffd700] text-[10px] font-black text-center p-0.5 focus:outline-none focus:border-[#ffd700]" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <button onClick={addRoute} className="w-full py-1.5 flex items-center justify-center gap-1 text-[9px] font-black text-[#ff0055] border border-dashed border-[#ff0055]/40 hover:border-[#ff0055] hover:bg-[#ff0055]/5 transition-all active:scale-95">
              <Plus className="w-3 h-3" /> ADD STREAM
            </button>
          </div>
        )}
      </div>

      {/* ═══ SECTORS ═══ */}
      <div className="tactical-panel border-[#4a4a4a]/40">
        <button onClick={() => toggle('sectors')} className="w-full flex items-center justify-between p-2 hover:bg-[#ffffff]/3 transition-colors">
          <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.15em] text-[#00ffcc]">
            <Zap className="w-4 h-4" /> SECTORS
            <span className="text-[8px] text-[#4a4a4a] font-mono">({sections.length})</span>
          </span>
          {collapsed.sectors ? <ChevronDown className="w-3 h-3 text-[#4a4a4a]" /> : <ChevronUp className="w-3 h-3 text-[#4a4a4a]" />}
        </button>

        {!collapsed.sectors && (
          <div className="px-2 pb-2 space-y-1">
            {(viewMode === 'COMPARISON' || viewMode === 'DISTRIBUTION') && (
              <div className="flex items-center justify-between p-1.5 bg-[#00ffcc]/5 border border-[#00ffcc]/20 mb-1">
                <button onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))} disabled={currentSectionIndex === 0} className="p-0.5 text-[#00ffcc] disabled:opacity-20 active:scale-90">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[8px] font-black text-[#00ffcc] tracking-widest">ACTIVE: {sections[currentSectionIndex]?.name}</span>
                <button onClick={() => setCurrentSectionIndex(Math.min(sections.length - 1, currentSectionIndex + 1))} disabled={currentSectionIndex === sections.length - 1} className="p-0.5 text-[#00ffcc] disabled:opacity-20 active:scale-90">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {sections.map((sec, i) => (
              <div key={`sec-${i}`} className={`bg-[#0a0a12] border transition-all ${isActive(i) ? 'border-[#00ffcc]/60 bg-[#00ffcc]/5' : 'border-[#4a4a4a]/40'}`}>
                <div className="flex items-center gap-1.5 p-1.5">
                  <input type="color" value={sec.color} onChange={(e) => updateSection(i, { color: e.target.value })} className="w-4 h-4 p-0 bg-transparent border-none cursor-pointer shrink-0" />
                  <input type="text" value={sec.name} onChange={(e) => updateSection(i, { name: e.target.value })} className="bg-transparent border-none text-[#00ffcc] font-bold text-[10px] focus:outline-none min-w-0 flex-1 tracking-wider" />
                  {(viewMode === 'COMPARISON' || viewMode === 'DISTRIBUTION') && (
                    <button onClick={() => setCurrentSectionIndex(i)} className={`p-0.5 shrink-0 ${isActive(i) ? 'text-[#00ffcc]' : 'text-[#4a4a4a] hover:text-[#00ffcc]'}`}>
                      <Target className="w-3 h-3" />
                    </button>
                  )}
                  <button onClick={() => setExpandedSector(expandedSector === i ? null : i)} className={`p-0.5 shrink-0 ${expandedSector === i ? 'text-[#00ffcc]' : 'text-[#4a4a4a] hover:text-[#ffffff]'}`}>
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeSection(i)} className="p-0.5 text-[#ff0055]/40 hover:text-[#ff0055] shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {expandedSector === i && (
                  <div className="p-2 border-t border-[#4a4a4a]/30 grid grid-cols-2 gap-2 bg-[#000000]/40 text-[9px] font-black uppercase text-[#8a8a8a]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={`w-3 h-3 border flex items-center justify-center ${sec.isAnchored ? 'border-[#00ffcc] bg-[#00ffcc]' : 'border-[#4a4a4a]'}`}>
                        {sec.isAnchored && <div className="w-1.5 h-1.5 bg-[#000000]" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={!!sec.isAnchored} onChange={(e) => updateSection(i, { isAnchored: e.target.checked })} /> ANCHOR
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={`w-3 h-3 border flex items-center justify-center ${sec.isMinimalShadow ? 'border-[#ff0055] bg-[#ff0055]' : 'border-[#4a4a4a]'}`}>
                        {sec.isMinimalShadow && <div className="w-1.5 h-1.5 bg-[#ffffff]" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={!!sec.isMinimalShadow} onChange={(e) => updateSection(i, { isMinimalShadow: e.target.checked })} /> MIN SHADOW
                    </label>
                    <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-[#4a4a4a]/20">
                      <span className="shrink-0">HEX</span>
                      <input type="text" value={sec.color} onChange={(e) => updateSection(i, { color: e.target.value })} className="w-14 bg-transparent border-b border-[#4a4a4a] text-[#ffffff] text-[8px] font-mono uppercase focus:outline-none" />
                      <span className="shrink-0 ml-1">GLOW</span>
                      <input type="color" value={sec.shadowColor} onChange={(e) => updateSection(i, { shadowColor: e.target.value })} className="w-4 h-4 bg-transparent border-none p-0 cursor-pointer shrink-0" />
                      <input type="range" min="0" max="20" value={sec.glowIntensity} onChange={(e) => updateSection(i, { glowIntensity: parseInt(e.target.value) })} className="flex-1 h-2 accent-[#00ffcc]" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button onClick={addSection} className="w-full py-1.5 flex items-center justify-center gap-1 text-[9px] font-black text-[#00ffcc] border border-dashed border-[#00ffcc]/40 hover:border-[#00ffcc] hover:bg-[#00ffcc]/5 transition-all active:scale-95">
              <Plus className="w-3 h-3" /> ADD SECTOR
            </button>
          </div>
        )}
      </div>

      {/* ═══ DATA MATRIX ═══ */}
      <div className="tactical-panel border-[#4a4a4a]/40">
        <button onClick={() => toggle('matrix')} className="w-full flex items-center justify-between p-2 hover:bg-[#ffffff]/3 transition-colors">
          <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.15em] text-[#ffd700]">
            <Database className="w-4 h-4" /> DATA MATRIX
          </span>
          {collapsed.matrix ? <ChevronDown className="w-3 h-3 text-[#4a4a4a]" /> : <ChevronUp className="w-3 h-3 text-[#4a4a4a]" />}
        </button>

        {!collapsed.matrix && (
          <div className="px-2 pb-2 space-y-2">
            {routes.map(route => {
              const pathColor = route.name === 'ALPHA' ? '#ff0055' : route.name === 'BETA' ? '#00ffcc' : route.color;
              return (
                <div key={`matrix-${route.id}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pathColor, boxShadow: `0 0 4px ${pathColor}` }} />
                    <span className="text-[9px] font-black tracking-wider" style={{ color: pathColor }}>{route.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {sections.map((sec, i) => (
                      <div key={`${route.id}-v-${i}`} className="bg-[#0a0a12]/60 p-1 border border-[#4a4a4a]/20">
                        <label className="text-[7px] font-bold block truncate uppercase tracking-tight" style={{ color: sec.color }}>{sec.name}</label>
                        <div className="flex items-center gap-0.5">
                          <input type="number" step="0.01" value={route.data[i] ?? 0} onChange={(e) => updateDataPoint(route.id, i, parseFloat(e.target.value) || 0)} className="w-full text-[10px] font-black bg-transparent border-b border-[#4a4a4a] text-[#ffffff] focus:border-[#00ffcc] focus:outline-none py-0.5" />
                          {uiSettings.showPercentage && <span className="text-[8px] text-[#00ffcc] font-bold">%</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
