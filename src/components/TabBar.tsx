import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAeterContext } from '../context/AeterContext';

export const TabBar: React.FC = () => {
  const { docs, activeDocId, switchDoc, closeTab, addTab, renameDoc } = useAeterContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setDraftName(currentName);
  };

  const commitRename = () => {
    if (editingId) renameDoc(editingId, draftName);
    setEditingId(null);
  };

  return (
    <div className="shrink-0 flex items-center gap-1 px-2 h-9 bg-[#0c0d16]/95 border-b border-white/5 overflow-x-auto no-scrollbar z-20">
      {docs.map(doc => {
        const isActive = doc.id === activeDocId;
        return (
          <div
            key={doc.id}
            onClick={() => switchDoc(doc.id)}
            onDoubleClick={() => startRename(doc.id, doc.name)}
            title="Click para cambiar a esta pestaña · doble click para renombrarla. Cada pestaña es un gráfico completamente independiente: tiene sus propias líneas, categorías y ajustes de OPTICS."
            className={`group flex items-center gap-2 px-3 h-7 shrink-0 rounded-t-md border-t border-x cursor-pointer transition-all ${
              isActive
                ? 'bg-[#00ffcc]/10 border-[#00ffcc]/40 text-[#00ffcc]'
                : 'bg-white/[0.02] border-white/10 text-[#6e7681] hover:text-[#e6edf3] hover:bg-white/[0.05]'
            }`}
          >
            {editingId === doc.id ? (
              <input
                autoFocus
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null); }}
                onClick={e => e.stopPropagation()}
                className="w-24 bg-transparent border-b border-current text-[10px] font-bold uppercase tracking-wider focus:outline-none"
              />
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[120px]">{doc.name}</span>
            )}
            <button
              onClick={e => { e.stopPropagation(); closeTab(doc.id); }}
              title="Cierra esta pestaña y descarta su gráfico (si no lo guardaste en la biblioteca, se pierde). Si es la única abierta, se reemplaza por un gráfico en blanco."
              className="opacity-0 group-hover:opacity-100 hover:text-[#ff0055] transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
      <button
        onClick={addTab}
        title="Abre una pestaña nueva con un gráfico en blanco (líneas y categorías por defecto), totalmente independiente de las demás pestañas abiertas."
        className="flex items-center justify-center w-7 h-7 shrink-0 rounded-md text-[#6e7681] hover:text-[#00ffcc] hover:bg-white/5 transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
