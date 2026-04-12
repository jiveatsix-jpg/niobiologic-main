import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { useAeterContext } from '../context/AeterContext';
import { TooltipInfo } from '../types';

export const GraphCanvas = React.memo(() => {
  const { routes, sections, currentSectionIndex, viewMode, uiSettings } = useAeterContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;
  const PADDING = 90;

  const { minVal, maxVal } = useMemo(() => {
    const allDataPoints = routes.flatMap(r => r.data);
    const dataMin = allDataPoints.length > 0 ? Math.min(...allDataPoints) : 0;
    const dataMax = allDataPoints.length > 0 ? Math.max(...allDataPoints) : 100;
    
    const range = dataMax - dataMin || 10;
    return {
      minVal: Math.floor(dataMin - range * 0.1),
      maxVal: Math.ceil(dataMax + range * 0.1)
    };
  }, [routes]);

  const signalStr = "98.4%"; // Statically placed for CRT overlay to avoid continuous context updates causing re-renders

  const getX = useCallback((index: number) => {
    const count = sections.length;
    if (count <= 1) return CANVAS_WIDTH / 2;
    return PADDING + (index * (CANVAS_WIDTH - 2 * PADDING) / (count - 1));
  }, [sections.length]);
  
  const getY = useCallback((val: number) => {
    const effectiveRange = maxVal - minVal;
    const normalized = (val - minVal) / effectiveRange;
    return (CANVAS_HEIGHT - PADDING) - (normalized * (CANVAS_HEIGHT - 2 * PADDING));
  }, [maxVal, minVal]);

  const drawLegend = useCallback((ctx: CanvasRenderingContext2D) => {
    const legendX = PADDING;
    const legendY = 30;
    ctx.textAlign = 'left';
    routes.forEach((route, i) => {
      const x = legendX + (i * 140);
      const pathColor = route.name === 'ALPHA' ? '#ff0055' : route.name === 'BETA' ? '#00ffcc' : route.color;
      ctx.fillStyle = pathColor;
      ctx.fillRect(x, legendY, 12, 12);
      ctx.fillStyle = '#ffffff';
      ctx.font = `${uiSettings.fontSize - 2}px ${uiSettings.fontFamily}`;
      ctx.fillText(route.name, x + 18, legendY + 10);
    });
  }, [routes, uiSettings]);

  const drawEvolutionMode = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = uiSettings.baseColor;
    ctx.lineWidth = uiSettings.lineWidth;
    ctx.font = `${uiSettings.fontSize}px ${uiSettings.fontFamily}`;
    ctx.fillStyle = uiSettings.baseColor;

    ctx.beginPath();
    ctx.moveTo(PADDING, PADDING / 2);
    ctx.lineTo(PADDING, CANVAS_HEIGHT - PADDING);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(PADDING, CANVAS_HEIGHT - PADDING);
    ctx.lineTo(CANVAS_WIDTH - PADDING / 2, CANVAS_HEIGHT - PADDING);
    ctx.stroke();

    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
      const val = minVal + (i * (maxVal - minVal) / tickCount);
      const y = getY(val);
      const label = Math.round(val).toString().slice(0, 8);
      ctx.fillText(label, 5, y + uiSettings.fontSize / 3);
      ctx.beginPath();
      ctx.moveTo(PADDING - 5, y);
      ctx.lineTo(PADDING, y);
      ctx.stroke();
    }

    sections.forEach((sec, i) => {
      const x = getX(i);
      ctx.save();
      ctx.translate(x, CANVAS_HEIGHT - PADDING + 15);
      ctx.rotate(Math.PI / 6);
      ctx.fillStyle = sec.color;
      ctx.shadowColor = sec.shadowColor;
      ctx.shadowBlur = sec.glowIntensity;
      ctx.fillText(sec.name.slice(0, 12), 0, 0);
      ctx.restore();
    });

    routes.forEach((route) => {
      const pathColor = route.name === 'ALPHA' ? '#ff0055' : route.name === 'BETA' ? '#00ffcc' : route.color;
      ctx.strokeStyle = pathColor;
      ctx.lineWidth = uiSettings.lineWidth;
      ctx.beginPath();
      route.data.forEach((val, i) => {
        if (i >= sections.length) return;
        const x = getX(i);
        const y = getY(val);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      route.data.forEach((val, i) => {
        if (i >= sections.length) return;
        const x = getX(i);
        const y = getY(val);
        ctx.fillStyle = pathColor;
        ctx.beginPath();
        ctx.moveTo(x, y - 6);
        ctx.lineTo(x + 6, y);
        ctx.lineTo(x, y + 6);
        ctx.lineTo(x - 6, y);
        ctx.closePath();
        ctx.fill();
      });
    });

    drawLegend(ctx);
  }, [uiSettings, minVal, maxVal, sections, routes, getX, getY, drawLegend]);

  const drawComparisonMode = useCallback((ctx: CanvasRenderingContext2D) => {
    const barWidth = 24;
    const gap = 8;
    const sectionWidth = (CANVAS_WIDTH - 2 * PADDING) / sections.length;

    sections.forEach((sec, i) => {
      const xCenter = PADDING + (i * sectionWidth) + sectionWidth / 2;
      const isSelected = i === currentSectionIndex;

      if (isSelected) {
        ctx.save();
        ctx.fillStyle = uiSettings.hudColor + '11';
        ctx.fillRect(PADDING + i * sectionWidth, PADDING, sectionWidth, CANVAS_HEIGHT - 2 * PADDING);
        ctx.strokeStyle = uiSettings.hudColor + '33';
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(PADDING + i * sectionWidth, PADDING, sectionWidth, CANVAS_HEIGHT - 2 * PADDING);
        ctx.restore();
      }
      
      routes.forEach((route, rIdx) => {
        const val = route.data[i] || 0;
        const h = (val / maxVal) * (CANVAS_HEIGHT - 2 * PADDING);
        const x = xCenter + (rIdx - (routes.length - 1) / 2) * (barWidth + gap) - barWidth / 2;
        const y = CANVAS_HEIGHT - PADDING - h;

        const pathColor = route.name === 'ALPHA' ? '#ff0055' : route.name === 'BETA' ? '#00ffcc' : route.color;
        
        ctx.save();
        ctx.fillStyle = pathColor + '44';
        ctx.strokeStyle = pathColor;
        ctx.lineWidth = uiSettings.lineWidth;
        
        ctx.fillRect(x, y, barWidth, h);
        ctx.strokeRect(x, y, barWidth, h);
        
        ctx.fillStyle = pathColor;
        ctx.fillRect(x, y - 2, barWidth, 4);
        
        ctx.shadowColor = pathColor;
        ctx.shadowBlur = isSelected ? 15 : 5;
        ctx.strokeRect(x, y, barWidth, h);
        ctx.restore();
      });

      ctx.save();
      ctx.fillStyle = isSelected ? '#ffffff' : sec.color;
      ctx.font = `bold ${isSelected ? 12 : 10}px ${uiSettings.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.shadowColor = sec.shadowColor;
      ctx.shadowBlur = isSelected ? 10 : 0;
      ctx.fillText(sec.name, xCenter, CANVAS_HEIGHT - PADDING + 25);
      ctx.restore();
    });

    drawLegend(ctx);
  }, [uiSettings, sections, routes, currentSectionIndex, maxVal, drawLegend]);

  const drawDistributionMode = useCallback((ctx: CanvasRenderingContext2D) => {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const radius = 150;
    const innerRadius = 80;

    const total = routes.reduce((sum, r) => sum + (r.data[currentSectionIndex] || 0), 0) || 1;
    let startAngle = -Math.PI / 2;

    routes.forEach(route => {
      const val = route.data[currentSectionIndex] || 0;
      const sliceAngle = (val / total) * 2 * Math.PI;
      
      if (sliceAngle > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.fillStyle = `${route.color}44`;
        ctx.fill();
        ctx.strokeStyle = route.color;
        ctx.lineWidth = uiSettings.lineWidth;
        ctx.stroke();
        ctx.restore();
        startAngle += sliceAngle;
      }
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0a12';
    ctx.fill();
    ctx.strokeStyle = uiSettings.gridColor;
    ctx.stroke();

    const sortedRoutes = [...routes].sort((a, b) => (b.data[currentSectionIndex] || 0) - (a.data[currentSectionIndex] || 0));
    const topRoute = sortedRoutes[0];
    const secondRoute = sortedRoutes[1];
    const topVal = topRoute?.data[currentSectionIndex] || 0;
    const secondVal = secondRoute?.data[currentSectionIndex] || 0;
    
    let status = "ZERO STATE";
    let statusColor = uiSettings.hudColor;

    if (total > 1) {
      const diff = topVal - secondVal;
      const diffPercentage = (diff / total) * 100;

      if (diffPercentage < 5) {
        status = "BALANCE STABLE";
        statusColor = '#00ffcc';
      } else {
        status = `${topRoute.name} DOMINANT`;
        statusColor = topRoute.color;
      }
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = statusColor;
    ctx.font = `bold 18px ${uiSettings.fontFamily}`;
    ctx.fillText(status, centerX, centerY - 10);
    
    ctx.fillStyle = '#00ffcc';
    ctx.font = `bold 12px ${uiSettings.fontFamily}`;
    ctx.fillText("SYNC: STABLE", centerX, centerY + 15);
    
    ctx.fillStyle = '#8a8a8a';
    ctx.font = `10px ${uiSettings.fontFamily}`;
    ctx.fillText(`${sections[currentSectionIndex]?.name || ''} COMPOSITION`, centerX, centerY + 30);

    drawLegend(ctx);
  }, [uiSettings, sections, routes, currentSectionIndex, drawLegend]);

  const drawRadarMode = useCallback((ctx: CanvasRenderingContext2D) => {
    if (sections.length < 3) {
      ctx.fillStyle = '#ff0055';
      ctx.textAlign = 'center';
      ctx.font = '14px monospace';
      ctx.fillText('RADAR MODE REQUIRES AT LEAST 3 SECTORS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      return;
    }

    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2 + 10;
    const maxR = Math.min(cx, cy) - 60;
    const numAxes = sections.length;
    const angleStep = (Math.PI * 2) / numAxes;

    // Draw Concentric Webs
    const levels = 5;
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 1;
    
    for (let l = 1; l <= levels; l++) {
      const r = (maxR / levels) * l;
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw Axes and Labels
    ctx.strokeStyle = '#4a4a6a';
    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + Math.cos(angle) * maxR;
      const y = cy + Math.sin(angle) * maxR;
      
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillStyle = '#8a8a8a';
      ctx.font = '10px monospace';
      const textX = cx + Math.cos(angle) * (maxR + 20);
      const textY = cy + Math.sin(angle) * (maxR + 20);
      ctx.textAlign = Math.cos(angle) > 0.1 ? 'left' : Math.cos(angle) < -0.1 ? 'right' : 'center';
      ctx.fillText(sections[i].name, textX, textY);
    }

    // Draw Data Polygons
    routes.forEach(route => {
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const val = route.data[i] || 0;
        const r = (val / 100) * maxR; // Assuming data values are 0-100 for radar
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = route.color + '40';
      ctx.fill();
      ctx.strokeStyle = route.color;
      ctx.lineWidth = uiSettings.lineWidth;
      ctx.stroke();

      for (let i = 0; i < numAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const val = route.data[i] || 0;
        const r = (val / 100) * maxR;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.strokeStyle = route.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        if (uiSettings.showLabels) { // Assuming uiSettings might have a showLabels property
          ctx.fillStyle = route.color;
          ctx.font = '9px monospace';
          ctx.fillText(val.toString(), x + 6, y - 6);
        }
      }
    });
  }, [sections, routes, uiSettings, CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Main Draw Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const drawGraphContent = (context: CanvasRenderingContext2D) => {
      const pattern = uiSettings.backgroundPattern;
      if (pattern === 'STANDARD') {
        context.strokeStyle = uiSettings.gridColor;
        context.lineWidth = 1;
        for (let x = 0; x <= CANVAS_WIDTH; x += 32) {
          context.beginPath();
          context.moveTo(x, 0);
          context.lineTo(x, CANVAS_HEIGHT);
          context.stroke();
        }
        for (let y = 0; y <= CANVAS_HEIGHT; y += 32) {
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(CANVAS_WIDTH, y);
          context.stroke();
        }
      } else if (pattern === 'SCANLINES') {
        context.strokeStyle = uiSettings.gridColor;
        context.lineWidth = 1;
        context.globalAlpha = 0.3;
        for (let y = 0; y <= CANVAS_HEIGHT; y += 4) {
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(CANVAS_WIDTH, y);
          context.stroke();
        }
        context.globalAlpha = 1.0;
      } else if (pattern === 'RADIAL') {
        context.strokeStyle = uiSettings.gridColor;
        context.lineWidth = 1;
        context.globalAlpha = 0.4;
        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2;
        for (let r = 50; r <= Math.max(CANVAS_WIDTH, CANVAS_HEIGHT); r += 50) {
          context.beginPath();
          context.arc(centerX, centerY, r, 0, Math.PI * 2);
          context.stroke();
        }
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
          context.beginPath();
          context.moveTo(centerX, centerY);
          context.lineTo(centerX + Math.cos(a) * 1000, centerY + Math.sin(a) * 1000);
          context.stroke();
        }
        context.globalAlpha = 1.0;
      } else if (pattern === 'BLUEPRINT') {
        context.fillStyle = '#001a33';
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        context.fillStyle = '#00aaff';
        context.globalAlpha = 0.2;
        for (let x = 0; x <= CANVAS_WIDTH; x += 16) {
          for (let y = 0; y <= CANVAS_HEIGHT; y += 16) {
            context.beginPath();
            context.arc(x, y, 1, 0, Math.PI * 2);
            context.fill();
          }
        }
        context.globalAlpha = 1.0;
      }
      
      switch (viewMode) {
        case 'EVOLUTION': drawEvolutionMode(context); break;
        case 'COMPARISON': drawComparisonMode(context); break;
        case 'DISTRIBUTION': drawDistributionMode(context); break;
        case 'RADAR': drawRadarMode(context); break;
      };
    };

    const drawCRTOverlay = (context: CanvasRenderingContext2D) => {
      context.save();
      context.globalAlpha = 0.05;
      context.fillStyle = '#ffffff';
      for (let i = 0; i < CANVAS_HEIGHT; i += 3) {
        context.fillRect(0, i, CANVAS_WIDTH, 1);
      }
      context.restore();
    };

    if (uiSettings.bgImage) {
      const img = new Image();
      img.src = uiSettings.bgImage;
      img.onload = () => {
        ctx.globalAlpha = 0.4;
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.globalAlpha = 1.0;
        drawGraphContent(ctx);
        drawCRTOverlay(ctx);
      };
      if (img.complete) {
        ctx.globalAlpha = 0.4;
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.globalAlpha = 1.0;
        drawGraphContent(ctx);
        drawCRTOverlay(ctx);
      }
    } else {
      drawGraphContent(ctx);
      drawCRTOverlay(ctx);
    }
  }, [routes, sections, viewMode, currentSectionIndex, uiSettings, drawEvolutionMode, drawComparisonMode, drawDistributionMode]);

  // Window Resize listener - recalculates dimensions natively but keeps logic structure intact
  const [, setWinSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setWinSize({ w: window.innerWidth, h: window.innerHeight }), 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let found: TooltipInfo | null = null;
    routes.forEach(route => {
      route.data.forEach((val, i) => {
        if (i >= sections.length) return;
        const px = getX(i);
        const py = getY(val);
        const dist = Math.sqrt((mouseX - px) ** 2 + (mouseY - py) ** 2);
        if (dist < 12) {
          found = { x: px, y: py, val, section: sections[i].name, routeName: route.name, color: route.color };
        }
      });
    });
    setTooltip(found);
  };

  return (
    <div className="relative group tactical-panel p-1 bg-[#000000]">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        className="cursor-crosshair block w-full max-w-full object-contain"
      />
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none animate-flicker">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }}></div>
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] bg-[radial-gradient(circle,transparent_60%,rgba(0,0,0,0.3)_100%)]"></div>

        {[
          { pos: '-top-2 -left-2', rotate: '0deg' },
          { pos: '-top-2 -right-2', rotate: '90deg' },
          { pos: '-bottom-2 -right-2', rotate: '180deg' },
          { pos: '-bottom-2 -left-2', rotate: '270deg' }
        ].map((corner, idx) => (
          <div key={`corner-${idx}`} className={`absolute ${corner.pos} w-12 h-12`} style={{ transform: `rotate(${corner.rotate})` }}>
            <div className="absolute top-0 left-0 w-full h-[1px] opacity-20" style={{ backgroundColor: uiSettings.hudColor }}></div>
            <div className="absolute top-0 left-0 w-[1px] h-full opacity-20" style={{ backgroundColor: uiSettings.hudColor }}></div>
            <div className="absolute top-0 left-0 w-8 h-[2px] shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: uiSettings.hudColor, boxShadow: `0 0 12px ${uiSettings.hudColor}` }}></div>
            <div className="absolute top-0 left-0 w-[2px] h-8 shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: uiSettings.hudColor, boxShadow: `0 0 12px ${uiSettings.hudColor}` }}></div>
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border border-black/20" style={{ backgroundColor: '#ffffff' }}></div>
            <div className="absolute top-4 left-0 w-1 h-[1px] opacity-50" style={{ backgroundColor: uiSettings.hudColor }}></div>
            <div className="absolute top-0 left-4 w-[1px] h-1 opacity-50" style={{ backgroundColor: uiSettings.hudColor }}></div>
          </div>
        ))}

        <div className="absolute top-4 left-16 text-[10px] font-mono tracking-[0.2em] font-bold" style={{ color: `${uiSettings.hudColor}aa` }}>
          BIO_MONITOR: <span style={{ color: '#ffffff' }}>OFF</span>
        </div>
        <div className="absolute top-4 right-16 text-[10px] font-mono tracking-[0.2em] font-bold" style={{ color: `${uiSettings.hudColor}aa` }}>
          SIGNAL_STR: <span style={{ color: '#ffffff' }}>98.4% // STABLE</span>
        </div>
        <div className="absolute bottom-4 left-16 text-[10px] font-mono tracking-[0.2em] font-bold" style={{ color: `${uiSettings.hudColor}aa` }}>
          NIOBIOLOGIC v3.0 // <span style={{ color: '#ffffff' }}>{new Date().toLocaleDateString()}</span>
        </div>
        <div className="absolute bottom-4 right-16 text-[10px] font-mono tracking-[0.2em] font-bold" style={{ color: `${uiSettings.hudColor}aa` }}>
          SYSTEM_STATUS: <span style={{ color: '#ffffff' }}>NOMINAL</span>
        </div>
        
        <div className="absolute top-1/2 left-2 w-6 h-[1px] opacity-20" style={{ backgroundColor: uiSettings.hudColor }}></div>
        <div className="absolute top-1/2 right-2 w-6 h-[1px] opacity-20" style={{ backgroundColor: uiSettings.hudColor }}></div>
        <div className="absolute left-1/2 top-2 w-[1px] h-6 opacity-20" style={{ backgroundColor: uiSettings.hudColor }}></div>
        <div className="absolute left-1/2 bottom-2 w-[1px] h-6 opacity-20" style={{ backgroundColor: uiSettings.hudColor }}></div>
      </div>
      
      {tooltip && (
        <div 
          className="absolute pixel-tooltip"
          style={{ left: tooltip.x + 15, top: tooltip.y - 40 }}
        >
          <div className="font-bold border-b border-[#00ffcc]/30 mb-1" style={{ color: tooltip.color }}>
            {tooltip.routeName}
          </div>
          <div className="text-[14px]">
            {tooltip.section}: <span style={{ color: '#ffffff' }}>{tooltip.val}</span>
          </div>
        </div>
      )}
    </div>
  );
});
