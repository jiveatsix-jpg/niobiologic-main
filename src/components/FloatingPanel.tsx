import React, { useState, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';

interface FloatingPanelProps {
  id: string;
  title: string;
  icon: ReactNode;
  color: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  side?: 'left' | 'right';
  width?: number;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  title, icon, color, children, isOpen, onToggle, side = 'left', width = 300
}) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position?.x ?? rect.left,
      origY: position?.y ?? rect.top,
    };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      });
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  if (!isOpen) return null;

  const posStyle: React.CSSProperties = position
    ? { position: 'fixed', left: position.x, top: position.y }
    : {
        position: 'fixed',
        top: '60px',
        ...(side === 'left' ? { left: '16px' } : { right: '16px' }),
      };

  return (
    <div
      className="z-40 shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ ...posStyle, width }}
    >
      <div className="tactical-panel panel-texture relative overflow-hidden">
        {/* Header — draggable */}
        <div
          onMouseDown={handleMouseDown}
          className="flex items-center justify-between p-2 cursor-grab active:cursor-grabbing select-none border-b-2"
          style={{ borderColor: `${color}40` }}
        >
          <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.15em]" style={{ color }}>
            {icon} {title}
          </span>
          <button onClick={onToggle} className="p-1 text-[#4a4a4a] hover:text-[#ff0055] transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto no-scrollbar p-2 space-y-2 panel-scanlines relative">
          {children}
        </div>
      </div>
    </div>
  );
};
