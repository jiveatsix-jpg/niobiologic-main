import React, { useState } from 'react';
import { useAeterContext } from '../context/AeterContext';
import { BookOpen, Save, Trash2, Play, X, Clock, BarChart3, Activity } from 'lucide-react';

export const LibraryOverlay: React.FC = () => {
  const { savedGraphs, saveGraph, loadGraph, deleteGraph, showLibrary, setShowLibrary, sections, routes, uiSettings, viewMode, appMode } = useAeterContext();
  const [graphName, setGraphName] = useState('');
  const [saving, setSaving] = useState(false);

  if (!showLibrary) return null;

  const handleSave = () => {
    const name = graphName.trim() || `GRAPH_${savedGraphs.length + 1}`;
    saveGraph(name);
    setGraphName('');
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth()+1).toString().padStart(2, '0')}.${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[85vh] bg-[#0a0a12] tactical-panel flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#ffd700]/30 bg-[#ffd700]/5">
          <h2 className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#ffd700]" />
            <span className="text-sm font-black tracking-[0.3em] text-[#ffd700]">GRAPH LIBRARY</span>
            <span className="text-[9px] text-[#4a4a4a] font-mono">v1.0</span>
          </h2>
          <button onClick={() => setShowLibrary(false)} className="p-2 text-[#8a8a8a] hover:text-[#ff0055] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Save Current Section */}
          <div className="bg-[#000000]/60 border border-[#ffd700]/20 p-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={graphName}
                onChange={e => setGraphName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="GRAPH NAME..."
                className="flex-1 bg-[#0a0a12] border border-[#4a4a4a] text-[#ffffff] text-[11px] p-2 font-mono focus:outline-none focus:border-[#ffd700] uppercase tracking-wider"
              />
              <button
                onClick={handleSave}
                className="px-4 py-2 flex items-center gap-2 text-[10px] font-black text-[#ffd700] border border-[#ffd700]/60 hover:bg-[#ffd700]/10 active:scale-95 transition-all"
              >
                {saving ? (
                  <><Activity className="w-3.5 h-3.5 animate-pulse" /> SAVED</>
                ) : (
                  <><Save className="w-3.5 h-3.5" /> SAVE CURRENT</>
                )}
              </button>
            </div>
            <div className="mt-2 text-[8px] text-[#4a4a4a] font-mono">
              {sections.length} SECTORS · {routes.length} STREAMS · MODE: {appMode || 'NONE'} · VIEW: {viewMode}
            </div>
          </div>

          {/* Library Entries */}
          {savedGraphs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#4a4a4a]">
              <BookOpen className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-[11px] font-mono tracking-widest">LIBRARY EMPTY</p>
              <p className="text-[9px] font-mono mt-2">Save your first graph above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedGraphs.map(graph => (
                <div key={graph.id} className="bg-[#000000]/80 border border-[#4a4a4a]/40 hover:border-[#ffd700]/40 transition-all group">
                  <div className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[11px] font-black tracking-wider text-[#ffd700] truncate">{graph.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-[8px] text-[#4a4a4a] font-mono">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(graph.timestamp)}</span>
                          <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {graph.sections.length}x{graph.routes.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mini route preview */}
                    <div className="mt-2 flex gap-1">
                      {graph.routes.map((r, i) => (
                        <div key={i} className="flex items-center gap-1 bg-[#0a0a12] border border-[#4a4a4a]/30 px-1.5 py-0.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.color }} />
                          <span className="text-[7px] text-[#8a8a8a] font-mono truncate max-w-[60px]">{r.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex border-t border-[#4a4a4a]/30">
                    <button
                      onClick={() => { loadGraph(graph.id); setShowLibrary(false); }}
                      className="flex-1 py-2 flex items-center justify-center gap-1.5 text-[9px] font-bold text-[#00ffcc] hover:bg-[#00ffcc]/10 transition-all active:scale-95"
                    >
                      <Play className="w-3 h-3" /> LOAD
                    </button>
                    <div className="w-px bg-[#4a4a4a]/30" />
                    <button
                      onClick={() => deleteGraph(graph.id)}
                      className="flex-1 py-2 flex items-center justify-center gap-1.5 text-[9px] font-bold text-[#ff0055]/60 hover:text-[#ff0055] hover:bg-[#ff0055]/10 transition-all active:scale-95"
                    >
                      <Trash2 className="w-3 h-3" /> DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#ffd700]/5 border-t border-[#ffd700]/20 text-center">
          <p className="text-[8px] text-[#ffd700] font-mono tracking-[0.4em]">{savedGraphs.length} GRAPHS IN LIBRARY</p>
        </div>
      </div>
    </div>
  );
};
