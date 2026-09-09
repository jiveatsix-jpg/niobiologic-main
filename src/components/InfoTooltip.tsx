import React, { useEffect, useRef, useState } from 'react';

interface InfoContent {
  label: string;
  text: string;
}

function readInfo(el: Element): InfoContent | null {
  const text = el.getAttribute('title') || el.getAttribute('aria-label');
  if (!text) return null;
  const label = (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40);
  return { label, text };
}

/**
 * Cuadro flotante que, cuando `active` es true, muestra el `title` o
 * `aria-label` del elemento bajo el cursor. Reutiliza los textos que ya
 * existen en toda la app en vez de duplicar contenido. Mismo estilo
 * (`.pixel-tooltip`) que el tooltip de los gráficos: borde sólido, sombra
 * dura y alto contraste, en vez de un cuadro difuminado y apagado.
 */
export const InfoTooltip: React.FC<{ active: boolean }> = ({ active }) => {
  const [info, setInfo] = useState<InfoContent | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);
  const currentEl = useRef<Element | null>(null);

  useEffect(() => {
    if (!active) {
      setInfo(null);
      currentEl.current = null;
      return;
    }

    const onMove = (e: MouseEvent) => {
      const target = (e.target as Element)?.closest('[title], [aria-label]');
      if (!target) {
        if (currentEl.current) { currentEl.current = null; setInfo(null); }
        return;
      }
      if (target !== currentEl.current) {
        currentEl.current = target;
        setInfo(readInfo(target));
      }
      setPos({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, [active]);

  if (!active || !info) return null;

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
      className="fixed z-[999] pixel-tooltip max-w-[260px]"
      style={{ left: Math.max(4, left), top: Math.max(4, top) }}
    >
      {info.label && (
        <div className="font-bold border-b border-[#00ffcc]/30 mb-1" style={{ color: '#ff0055' }}>
          {info.label}
        </div>
      )}
      <div className="text-[13px] leading-relaxed">{info.text}</div>
    </div>
  );
};
