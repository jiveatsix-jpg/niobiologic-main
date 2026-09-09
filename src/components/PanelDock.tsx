import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface PanelDockProps {
  title: string;
  icon: ReactNode;
  color: string;
  onClose: () => void;
  children: ReactNode;
}

export const PanelDock: React.FC<PanelDockProps> = ({ title, icon, color, onClose, children }) => (
  <div className="shrink-0 w-72 border-r border-white/5 bg-[#0d0e1a]/95 flex flex-col z-20 overflow-hidden">
    <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10 shrink-0">
      <span className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em]" style={{ color }}>
        {icon} {title}
      </span>
      <button onClick={onClose} className="p-1 rounded text-[#6e7681] hover:text-[#ff0055] hover:bg-white/5 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
    <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
      {children}
    </div>
  </div>
);
