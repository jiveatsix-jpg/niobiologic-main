import React, { useEffect, useRef, useState } from 'react';

/**
 * Cuadro flotante que, cuando `active` es true, muestra el `title` o
 * `aria-label` del elemento bajo el cursor. Reutiliza los textos que ya
 * existen en toda la app en vez de duplicar contenido.
 */
export const InfoTooltip: React.FC<{ active: boolean }> = ({ active }) => {
  const [text, setText] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);
  const currentEl = useRef<Element | null>(null);

  useEffect(() => {
    if (!active) {
      setText(null);
      currentEl.current = null;
      return;
    }

    const onMove = (e: MouseEvent) => {
      const target = (e.target as Element)?.closest('[title], [aria-label]');
      if (!target) {
        if (currentEl.current) { currentEl.current = null; setText(null); }
        return;
      }
      if (target !== currentEl.current) {
        currentEl.current = target;
        setText(target.getAttribute('title') || target.getAttribute('aria-label'));
      }
      setPos({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, [active]);

  if (!active || !text) return null;

  const pad = 14;
  let left = pos.x + pad;
  let top = pos.y + pad;
  const rect = boxRef.current?.getBoundingClientRect();
  if (rect) {
    if (left + rect.width > window.innerWidth) left = pos.x - rect.width - pad;
    if (top + rect.height > window.innerHeight) top = pos.y - rect.height - pad;
  }

  return (
    <div
      ref={boxRef}
      className="fixed z-[999] max-w-[260px] p-2.5 rounded-md border border-[#00ffcc]/50 bg-[#0c0d16]/95 text-[#e6edf3] text-[11px] leading-relaxed font-mono pointer-events-none shadow-lg"
      style={{ left: Math.max(4, left), top: Math.max(4, top) }}
    >
      {text}
    </div>
  );
};
