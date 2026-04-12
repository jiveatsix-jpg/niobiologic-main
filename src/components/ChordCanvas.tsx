import React, { useRef, useEffect, useCallback } from 'react';
import { useAeterContext } from '../context/AeterContext';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

export const ChordCanvas = React.memo(React.forwardRef<HTMLDivElement>((_, ref) => {
  const { chordSettings, uiSettings, updateStringConfig } = useAeterContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    const NUM_STRINGS = 6;
    const LEFT_MARGIN = 160;
    const RIGHT_MARGIN = 60;
    const TOP_MARGIN = 120;
    const boardWidth = CANVAS_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;
    const stringSpacing = boardWidth / (NUM_STRINGS - 1);
    const fretSpacing = (CANVAS_HEIGHT - TOP_MARGIN - 60) / chordSettings.numFrets;

    const s = Math.round((canvasX - LEFT_MARGIN) / stringSpacing);
    if (s < 0 || s >= NUM_STRINGS) return;

    const currentStr = chordSettings.strings[s];

    // Indicator area (above nut)
    if (canvasY < TOP_MARGIN - 10) {
      const newState = currentStr.state === 'open' ? 'muted' : 'open';
      updateStringConfig(s, { state: newState });
    } 
    // Fretboard area
    else if (canvasY >= TOP_MARGIN - 10 && canvasY <= CANVAS_HEIGHT - 40) {
      const f = Math.ceil((canvasY - TOP_MARGIN) / fretSpacing) + chordSettings.startFret - 1;
      
      if (currentStr.state === 'played' && currentStr.fret === f) {
        // Toggle off
        updateStringConfig(s, { state: 'open' });
      } else {
        // Set point
        updateStringConfig(s, { state: 'played', fret: f });
      }
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const {
      chordName, startFret, numFrets, strings,
      dotColor, labelColor, stringColor, fretColor, bgColor, woodColor, showFingerNumbers,
    } = chordSettings;

    const NUM_STRINGS = 6;
    const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];

    // Layout constants
    const LEFT_MARGIN = 160;
    const RIGHT_MARGIN = 60;
    const TOP_MARGIN = 120;
    const BOTTOM_MARGIN = 60;

    const boardWidth = CANVAS_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;
    const boardHeight = CANVAS_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;

    const stringSpacing = boardWidth / (NUM_STRINGS - 1);
    const fretSpacing = boardHeight / numFrets;

    // ── Background ──────────────────────────────────────────────
    ctx.fillStyle = '#101026';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Fretboard background (Retro pixel beige)
    ctx.fillStyle = '#fdf2cf';
    ctx.fillRect(LEFT_MARGIN, TOP_MARGIN, boardWidth, boardHeight);

    // Horizontal scanlines for the fretboard
    ctx.save();
    ctx.strokeStyle = '#e8d8a8';
    ctx.lineWidth = 1;
    for (let y = TOP_MARGIN; y <= TOP_MARGIN + boardHeight; y += 4) {
      ctx.beginPath();
      ctx.moveTo(LEFT_MARGIN, y);
      ctx.lineTo(LEFT_MARGIN + boardWidth, y);
      ctx.stroke();
    }
    ctx.restore();

    // Thick borders for the fretboard
    ctx.strokeStyle = '#30304a';
    ctx.lineWidth = 4;
    ctx.strokeRect(LEFT_MARGIN - 2, TOP_MARGIN - 2, boardWidth + 4, boardHeight + 4);

    // ── Nut (top thick bar if startFret === 1) ───────────────────
    if (startFret === 1) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(LEFT_MARGIN - 4, TOP_MARGIN - 4, boardWidth + 8, 8);
      ctx.strokeStyle = '#30304a';
      ctx.lineWidth = 2;
      ctx.strokeRect(LEFT_MARGIN - 4, TOP_MARGIN - 4, boardWidth + 8, 8);
    }

    // ── Fret wires ──────────────────────────────────────────────
    for (let f = 1; f <= numFrets; f++) {
      const y = TOP_MARGIN + f * fretSpacing;
      ctx.strokeStyle = '#30304a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(LEFT_MARGIN, y);
      ctx.lineTo(LEFT_MARGIN + boardWidth, y);
      ctx.stroke();

      // fret highlight
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(LEFT_MARGIN, y - 1);
      ctx.lineTo(LEFT_MARGIN + boardWidth, y - 1);
      ctx.stroke();
    }

    // ── String lines ─────────────────────────────────────────────
    for (let s = 0; s < NUM_STRINGS; s++) {
      const x = LEFT_MARGIN + s * stringSpacing;
      ctx.strokeStyle = '#30304a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, TOP_MARGIN);
      ctx.lineTo(x, TOP_MARGIN + boardHeight);
      ctx.stroke();
    }

    // ── Chord Name ───────────────────────────────────────────────
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 48px ${uiSettings.fontFamily}`;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 15;
    ctx.fillText(chordName, CANVAS_WIDTH / 2, 70);
    ctx.shadowBlur = 0;

    // Metadata labels (Voicing, Fret)
    ctx.fillStyle = '#8a8a8a';
    ctx.font = `8px ${uiSettings.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText("VOICING: 1", LEFT_MARGIN, TOP_MARGIN - 40);
    ctx.textAlign = 'right';
    const fretSuffix = startFret === 1 ? 'st' : startFret === 2 ? 'nd' : startFret === 3 ? 'rd' : 'th';
    ctx.fillText(`FRET: ${startFret}${fretSuffix}`, LEFT_MARGIN + boardWidth, TOP_MARGIN - 40);

    // Starting fret label (if > 1)
    if (startFret > 1) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold 14px ${uiSettings.fontFamily}`;
      ctx.fillText(`${startFret}`, LEFT_MARGIN - 15, TOP_MARGIN + fretSpacing / 2 + 5);
    }

    // ── String labels (bottom) ────────────────────────────────────
    for (let s = 0; s < NUM_STRINGS; s++) {
      const x = LEFT_MARGIN + s * stringSpacing;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#4a4a4a';
      ctx.font = `bold 10px ${uiSettings.fontFamily}`;
      ctx.fillText(STRING_LABELS[s], x, TOP_MARGIN + boardHeight + 25);
    }

    // ── Open / Muted indicators (above nut) ───────────────────────
    const INDICATOR_Y = TOP_MARGIN - 26;
    const INDICATOR_R = 9;

    for (let s = 0; s < NUM_STRINGS; s++) {
      const x = LEFT_MARGIN + s * stringSpacing;
      const strCfg = strings[s];

      // Red LED style indicator background
      const grad = ctx.createRadialGradient(x, INDICATOR_Y, 2, x, INDICATOR_Y, INDICATOR_R);
      grad.addColorStop(0, '#ff3030');
      grad.addColorStop(0.7, '#800000');
      grad.addColorStop(1, '#101010');

      ctx.beginPath();
      ctx.arc(x, INDICATOR_Y, INDICATOR_R, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (strCfg.state === 'open') {
        // glowing center
        ctx.save();
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ff6060';
        ctx.beginPath();
        ctx.arc(x, INDICATOR_Y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (strCfg.state === 'muted') {
        // central black dot
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x, INDICATOR_Y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── Finger dots ────────────────────────────────────────────────
    const DOT_RADIUS = Math.min(stringSpacing, fretSpacing) * 0.34;

    for (let s = 0; s < NUM_STRINGS; s++) {
      const strCfg = strings[s];
      if (strCfg.state !== 'played') continue;

      const fretPos = strCfg.fret - startFret + 1;
      if (fretPos < 1 || fretPos > numFrets) continue;

      const x = LEFT_MARGIN + s * stringSpacing;
      const y = TOP_MARGIN + (fretPos - 0.5) * fretSpacing;

      // Dot fill with blue-to-purple gradient
      const dotGrad = ctx.createLinearGradient(x, y - DOT_RADIUS, x, y + DOT_RADIUS);
      dotGrad.addColorStop(0, '#00e5ff');
      dotGrad.addColorStop(1, '#7b1fa2');

      ctx.beginPath();
      ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = dotGrad;
      ctx.fill();

      // Thick black border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Neon cyan glow outline
      ctx.save();
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Finger number inside dot
      if (showFingerNumbers && strCfg.finger > 0) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = labelColor;
        ctx.font = `bold ${Math.round(DOT_RADIUS * 0.9)}px ${uiSettings.fontFamily}`;
        ctx.fillText(strCfg.finger.toString(), x, y);
        ctx.textBaseline = 'alphabetic';
      }
    }

    // ── CRT overlay ───────────────────────────────────────────────
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < CANVAS_HEIGHT; i += 3) {
      ctx.fillRect(0, i, CANVAS_WIDTH, 1);
    }
    ctx.restore();

  }, [chordSettings]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <div className="relative group p-6 bg-[#0a0a1f] rounded-[40px] border-[4px] border-[#30304a] shadow-[0_0_40px_rgba(48,48,74,0.5)] overflow-hidden" ref={ref}>
      {/* Container scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }} />

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleCanvasClick}
        className="block w-full max-w-full object-contain relative z-10 cursor-crosshair"
      />

      {/* Retro HUD elements */}
      <div className="absolute top-8 left-8 text-[#00e5ff] font-bold opacity-30 text-[10px] tracking-widest uppercase">
        NIOBIOLOGIC // CHORD_OS
      </div>

      <div className="absolute top-1/2 -right-4 -translate-y-1/2 flex flex-col gap-4 opacity-50">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-8 h-8 border-2 border-[#00e5ff] rounded-lg flex items-center justify-center text-[10px] text-[#00e5ff]">
            {i}
          </div>
        ))}
      </div>

      <div className="absolute bottom-10 left-12 right-12 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="text-[8px] text-[#8a88a0] uppercase tracking-tighter">Scale Info</div>
          <div className="text-[12px] text-white font-mono uppercase tracking-widest font-bold">FA MA_O // MAJOR</div>
        </div>

        <div className="relative group/strum pointer-events-auto cursor-pointer">
          <div className="px-6 py-2 bg-[#0a0a1f] border-[3px] border-[#00e5ff] rounded-xl text-[#00e5ff] font-bold text-lg tracking-widest shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:scale-105 transition-transform">
            STRUM
          </div>
          <div className="absolute -inset-1 border border-[#00e5ff] opacity-20 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Nut LEDs (decorative) */}
      <div className="absolute top-[125px] left-[135px] w-4 h-4 bg-red-600 rounded-full shadow-[0_0_10px_red] animate-pulse" />
      <div className="absolute bottom-[65px] left-[135px] w-4 h-4 bg-red-600 rounded-full shadow-[0_0_10px_red] animate-pulse" />
    </div>
  );
}));

ChordCanvas.displayName = 'ChordCanvas';

// Utility: lighten a hex color by amt (0-255)
function lightenHex(hex: string, amt: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amt);
  const g = Math.min(255, ((num >> 8) & 0xff) + amt);
  const b = Math.min(255, (num & 0xff) + amt);
  return `rgb(${r},${g},${b})`;
}
