import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { useAeterContext } from '../context/AeterContext';
import { TooltipInfo } from '../types';
import { lttbIndices } from '../utils/lttb';

const LTTB_THRESHOLD = 150;

export const GraphCanvas = React.memo(() => {
  const { routes: rawRoutes, sections: rawSections, currentSectionIndex, setCurrentSectionIndex, viewMode, uiSettings } = useAeterContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  const { routes, sections } = useMemo(() => {
    if (rawSections.length <= LTTB_THRESHOLD) return { routes: rawRoutes, sections: rawSections };
    const reference = rawSections.map((_, i) =>
      rawRoutes.reduce((sum, r) => sum + (r.data[i] || 0), 0)
    );
    const idxs = lttbIndices(reference, LTTB_THRESHOLD);
    return {
      sections: idxs.map(i => rawSections[i]),
      routes: rawRoutes.map(r => ({ ...r, data: idxs.map(i => r.data[i] ?? 0) })),
    };
  }, [rawRoutes, rawSections]);

  const CANVAS_WIDTH = 700;
  const CANVAS_HEIGHT = 500;
  const PADDING = 140;

  const { minVal, maxVal } = useMemo(() => {
    const allDataPoints = routes.flatMap(r => r.data);
    const dataMin = allDataPoints.length > 0 ? Math.min(...allDataPoints) : 0;
    const dataMax = allDataPoints.length > 0 ? Math.max(...allDataPoints) : 100;
    
    if (uiSettings.scaleMode === 'FIXED') {
      return { minVal: 0, maxVal: 100 };
    }

    return {
      minVal: 0,
      maxVal: dataMax
    };
  }, [routes, uiSettings.scaleMode]);

  const signalStr = "98.4%"; // Statically placed for CRT overlay to avoid continuous context updates causing re-renders

  const getX = useCallback((index: number) => {
    const count = sections.length;
    if (count <= 1) return CANVAS_WIDTH / 2;
    return PADDING + (index * (CANVAS_WIDTH - 2 * PADDING) / (count - 1));
  }, [sections.length, PADDING, CANVAS_WIDTH]);
  
  const getY = useCallback((val: number) => {
    const effectiveRange = maxVal - minVal;
    const normalized = (val - minVal) / effectiveRange;
    return (CANVAS_HEIGHT - PADDING) - (normalized * (CANVAS_HEIGHT - 2 * PADDING));
  }, [maxVal, minVal]);

  const drawLegend = useCallback((ctx: CanvasRenderingContext2D) => {
    let currentX = PADDING;
    let currentY = 85; // Moved down to make room for the graph title
    const itemGap = 25;
    const iconSize = 10;
    const textOffset = 15;
    const lineHeight = 18;
    const maxWidth = CANVAS_WIDTH - PADDING;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    routes.forEach((route) => {
      const pathColor = route.name === 'ALPHA' ? '#ff0055' : route.name === 'BETA' ? '#00ffcc' : route.color;
      ctx.font = `${uiSettings.fontSize - 4}px ${uiSettings.fontFamily}`;
      const textWidth = ctx.measureText(route.name).width;
      const totalItemWidth = textOffset + textWidth + itemGap;

      // Wrap to next line if needed
      if (currentX + totalItemWidth > maxWidth) {
        currentX = PADDING;
        currentY += lineHeight;
      }

      // Draw color indicator
      ctx.fillStyle = pathColor;
      ctx.shadowBlur = 5;
      ctx.shadowColor = pathColor;
      ctx.fillRect(currentX, currentY - iconSize/2, iconSize, iconSize);
      ctx.shadowBlur = 0;
      
      // Draw text
      ctx.fillStyle = uiSettings.baseColor;
      ctx.globalAlpha = 0.9;
      ctx.fillText(route.name, currentX + textOffset, currentY);
      ctx.globalAlpha = 1.0;
      
      currentX += totalItemWidth;
    });
  }, [routes, uiSettings, CANVAS_WIDTH]);

  const drawEvolutionMode = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = uiSettings.baseColor;
    ctx.lineWidth = uiSettings.lineWidth;
    ctx.font = `${uiSettings.fontSize}px ${uiSettings.fontFamily}`;
    ctx.fillStyle = uiSettings.baseColor;

    ctx.beginPath();
    ctx.moveTo(PADDING, PADDING - 25);
    ctx.lineTo(PADDING, CANVAS_HEIGHT - PADDING);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(PADDING, CANVAS_HEIGHT - PADDING);
    ctx.lineTo(CANVAS_WIDTH - PADDING / 2, CANVAS_HEIGHT - PADDING);
    ctx.stroke();

    if (uiSettings.scaleMode === 'DATA_ONLY') {
      const uniqueVals = Array.from(new Set(routes.flatMap(r => r.data)))
        .filter(v => v !== undefined && v !== null)
        .sort((a, b) => a - b);
      
      uniqueVals.forEach(val => {
        const y = getY(val);
        const label = val.toFixed(2) + (uiSettings.showPercentage ? '%' : '');
        ctx.textAlign = 'right';
        ctx.fillText(label, PADDING - 15, y + uiSettings.fontSize / 3);
        ctx.beginPath();
        ctx.moveTo(PADDING - 5, y);
        ctx.lineTo(PADDING, y);
        ctx.stroke();
      });
    } else {
      const tickCount = 5;
      for (let i = 0; i <= tickCount; i++) {
        const val = minVal + (i * (maxVal - minVal) / tickCount);
        const y = getY(val);
        const label = val.toFixed(2) + (uiSettings.showPercentage ? '%' : '');
        ctx.textAlign = 'right';
        ctx.fillText(label, PADDING - 15, y + uiSettings.fontSize / 3);
        ctx.beginPath();
        ctx.moveTo(PADDING - 5, y);
        ctx.lineTo(PADDING, y);
        ctx.stroke();
      }
    }

    if (uiSettings.showSectionLabels) {
      sections.forEach((sec, i) => {
        const x = getX(i);
        ctx.save();
        ctx.translate(x, CANVAS_HEIGHT - PADDING + 30);
        ctx.rotate(Math.PI / 6);
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = sec.shadowColor;
        ctx.shadowBlur = Math.max(sec.glowIntensity, 8);
        ctx.globalAlpha = 1.0;
        ctx.fillText(sec.name, 0, 0);
        ctx.restore();
      });
    }

    routes.forEach((route) => {
      const pathColor = route.name === 'ALPHA' ? '#ff0055' : route.name === 'BETA' ? '#00ffcc' : route.color;
      
      // 1. Draw Area Gradient under the line
      ctx.save();
      const areaGradient = ctx.createLinearGradient(0, PADDING, 0, CANVAS_HEIGHT - PADDING);
      areaGradient.addColorStop(0, pathColor + '33'); // Very subtle at top
      areaGradient.addColorStop(1, pathColor + '00'); // Fades to zero
      ctx.fillStyle = areaGradient;
      ctx.beginPath();
      route.data.forEach((val, i) => {
        if (i >= sections.length) return;
        const x = getX(i);
        const y = getY(val);
        if (i === 0) ctx.moveTo(x, CANVAS_HEIGHT - PADDING);
        ctx.lineTo(x, y);
        if (i === route.data.length - 1 || i === sections.length - 1) ctx.lineTo(x, CANVAS_HEIGHT - PADDING);
      });
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 2. Draw Glow Layer (Outer glow)
      ctx.save();
      ctx.strokeStyle = pathColor;
      ctx.lineWidth = uiSettings.lineWidth + 2;
      ctx.globalAlpha = 0.2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = pathColor;
      ctx.beginPath();
      route.data.forEach((val, i) => {
        if (i >= sections.length) return;
        const x = getX(i);
        const y = getY(val);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();

      // 3. Main Tactical Line
      ctx.save();
      ctx.strokeStyle = pathColor;
      ctx.lineWidth = uiSettings.lineWidth;
      ctx.shadowBlur = 4;
      ctx.shadowColor = pathColor;
      ctx.beginPath();
      route.data.forEach((val, i) => {
        if (i >= sections.length) return;
        const x = getX(i);
        const y = getY(val);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();

      // 4. Tactical Data Markers (Diamonds with inner glow)
      route.data.forEach((val, i) => {
        if (i >= sections.length) return;
        const x = getX(i);
        const y = getY(val);
        
        ctx.save();
        ctx.fillStyle = pathColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = pathColor;
        
        // Outer diamond
        ctx.beginPath();
        ctx.moveTo(x, y - 6);
        ctx.lineTo(x + 6, y);
        ctx.lineTo(x, y + 6);
        ctx.lineTo(x - 6, y);
        ctx.closePath();
        ctx.fill();
        
        // Inner detail (highlight)
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Tactical Ring (very subtle)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
      });
    });

    // 5. Tooltip Axis Tracking
    if (tooltip && viewMode === 'EVOLUTION') {
      const y = getY(tooltip.val);
      ctx.save();
      
      // Dashed projection line
      ctx.strokeStyle = tooltip.color;
      ctx.setLineDash([4, 4]);
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PADDING, y);
      ctx.lineTo(tooltip.x, y);
      ctx.stroke();
      
      // Value highlight on the axis
      ctx.globalAlpha = 1.0;
      ctx.setLineDash([]);
      ctx.font = `bold ${uiSettings.fontSize}px ${uiSettings.fontFamily}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const label = tooltip.val.toFixed(2) + (uiSettings.showPercentage ? '%' : '');
      
      // Precise measurement for the box
      const labelWidth = ctx.measureText(label).width;
      const boxPaddingH = 8;
      const boxPaddingV = 6;
      const boxWidth = labelWidth + boxPaddingH * 2;
      const boxHeight = uiSettings.fontSize + boxPaddingV * 2;
      
      // Ensure box doesn't bleed out of the left canvas edge
      const boxX = Math.max(4, PADDING - boxWidth - 15);
      const boxY = y - boxHeight / 2;

      // Draw the tactical readout box
      ctx.fillStyle = '#000000';
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.strokeStyle = tooltip.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
      
      // Text centered perfectly in the box
      ctx.fillStyle = tooltip.color;
      ctx.fillText(label, PADDING - 22, y);
      
      // Refined axis indicator (connected to the box)
      ctx.beginPath();
      ctx.moveTo(PADDING, y);
      ctx.lineTo(PADDING - 15, y - 5);
      ctx.lineTo(PADDING - 15, y + 5);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }

    // 6. Axis Titles at the ends of the lines
    ctx.save();
    ctx.fillStyle = uiSettings.baseColor;
    ctx.globalAlpha = 0.8;
    ctx.font = `bold ${uiSettings.fontSize - 6}px ${uiSettings.fontFamily}`;
    
    if (uiSettings.yAxisTitle) {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(uiSettings.yAxisTitle.toUpperCase(), PADDING - 10, PADDING - 25 + 6);
    }

    if (uiSettings.xAxisTitle) {
      const words = uiSettings.xAxisTitle.toUpperCase().split(' ');
      const maxLabelWidth = 150; // Further increased to allow even more space before wrapping
      let lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + " " + words[i];
        if (ctx.measureText(testLine).width > maxLabelWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      lines.forEach((line, i) => {
        ctx.fillText(line, CANVAS_WIDTH - PADDING / 2 + 10, (CANVAS_HEIGHT - PADDING) + (i * 12));
      });
    }

    // 7. Tactical Axis Arrows (Stealth Apex Style)
    ctx.fillStyle = uiSettings.baseColor;
    ctx.shadowBlur = 8;
    ctx.shadowColor = uiSettings.baseColor;
    ctx.globalAlpha = 0.9;
    
    // Y-Axis Arrow (Vertical Stealth)
    ctx.beginPath();
    ctx.moveTo(PADDING, PADDING - 25); // Tip
    ctx.lineTo(PADDING - 6, PADDING - 25 + 14); // Left wing
    ctx.lineTo(PADDING, PADDING - 25 + 10); // Back notch
    ctx.lineTo(PADDING + 6, PADDING - 25 + 14); // Right wing
    ctx.closePath();
    ctx.fill();
    
    // X-Axis Arrow (Horizontal Stealth)
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH - PADDING / 2, CANVAS_HEIGHT - PADDING); // Tip
    ctx.lineTo(CANVAS_WIDTH - PADDING / 2 - 14, CANVAS_HEIGHT - PADDING - 6); // Top wing
    ctx.lineTo(CANVAS_WIDTH - PADDING / 2 - 10, CANVAS_HEIGHT - PADDING); // Back notch
    ctx.lineTo(CANVAS_WIDTH - PADDING / 2 - 14, CANVAS_HEIGHT - PADDING + 6); // Bottom wing
    ctx.closePath();
    ctx.fill();
    
    ctx.shadowBlur = 0; // Reset shadow for next draws

    ctx.restore();

    drawLegend(ctx);
  }, [uiSettings, minVal, maxVal, sections, routes, getX, getY, drawLegend, tooltip, viewMode]);

  const drawComparisonMode = useCallback((ctx: CanvasRenderingContext2D) => {
    const barWidth = 24;
    const gap = 8;
    const sectionWidth = (CANVAS_WIDTH - 2 * PADDING) / sections.length;

    if (uiSettings.showCompYAxis) {
      ctx.save();
      ctx.strokeStyle = uiSettings.baseColor;
      ctx.lineWidth = uiSettings.lineWidth;
      ctx.font = `${uiSettings.fontSize}px ${uiSettings.fontFamily}`;
      ctx.fillStyle = uiSettings.baseColor;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(PADDING, PADDING - 25);
      ctx.lineTo(PADDING, CANVAS_HEIGHT - PADDING);
      ctx.stroke();

      // Horizontal base line
      ctx.beginPath();
      ctx.moveTo(PADDING, CANVAS_HEIGHT - PADDING);
      ctx.lineTo(CANVAS_WIDTH - PADDING / 2, CANVAS_HEIGHT - PADDING);
      ctx.stroke();

      // Y-axis labels
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const steps = 5;
      for (let i = 0; i <= steps; i++) {
        const val = minVal + (maxVal - minVal) * (i / steps);
        const y = getY(val);
        ctx.fillText(val.toFixed(2), PADDING - 20, y);
        ctx.beginPath();
        ctx.moveTo(PADDING - 15, y);
        ctx.lineTo(PADDING - 5, y);
        ctx.stroke();
      }
      
      // Y-Axis Arrow (Vertical Stealth)
      ctx.fillStyle = uiSettings.baseColor;
      ctx.shadowBlur = 8;
      ctx.shadowColor = uiSettings.baseColor;
      ctx.beginPath();
      ctx.moveTo(PADDING, PADDING - 25); // Tip
      ctx.lineTo(PADDING - 6, PADDING - 25 + 14); // Left wing
      ctx.lineTo(PADDING, PADDING - 25 + 10); // Back notch
      ctx.lineTo(PADDING + 6, PADDING - 25 + 14); // Right wing
      ctx.closePath();
      ctx.fill();
      
      if (uiSettings.yAxisTitle) {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText(uiSettings.yAxisTitle.toUpperCase(), PADDING - 10, PADDING - 25 + 6);
      }
      ctx.restore();
    }

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

      if (uiSettings.showSectionLabels) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${isSelected ? 11 : 9}px ${uiSettings.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.shadowColor = isSelected ? '#ffffff' : sec.shadowColor;
        ctx.shadowBlur = isSelected ? 10 : 4;
        ctx.globalAlpha = 1.0;
        ctx.fillText(sec.name, xCenter, CANVAS_HEIGHT - PADDING + 25);
        ctx.restore();
      }
    });

    drawLegend(ctx);
  }, [uiSettings, sections, routes, currentSectionIndex, maxVal, minVal, getY, drawLegend]);

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
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 11px ${uiSettings.fontFamily}`;
    ctx.shadowColor = sections[currentSectionIndex]?.color || '#00ffcc';
    ctx.shadowBlur = 5;
    ctx.fillText(`${sections[currentSectionIndex]?.name || ''} COMPOSITION`, centerX, centerY + 30);
    ctx.shadowBlur = 0;

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
    const cy = CANVAS_HEIGHT / 2 + 30;
    const maxR = Math.min(cx, cy) - 80;
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

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold 11px ${uiSettings.fontFamily}`;
      ctx.shadowColor = sections[i].color;
      ctx.shadowBlur = 5;
      const textX = cx + Math.cos(angle) * (maxR + 25);
      const textY = cy + Math.sin(angle) * (maxR + 25);
      ctx.textAlign = Math.cos(angle) > 0.1 ? 'left' : Math.cos(angle) < -0.1 ? 'right' : 'center';
      ctx.fillText(sections[i].name, textX, textY);
      ctx.shadowBlur = 0;
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
          const label = val.toFixed(2) + (uiSettings.showPercentage ? '%' : '');
          ctx.fillText(label, x + 6, y - 6);
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
    // Initial fill handled inside drawGraphContent to avoid double-fill or color mismatch
    
    const drawGraphContent = (context: CanvasRenderingContext2D) => {
      const pattern = uiSettings.backgroundPattern;

      if (pattern === 'SOLID') {
        context.fillStyle = '#000000';
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        context.fillStyle = '#0a0a12';
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Background Gradient for depth
        const bgGradient = context.createRadialGradient(
          CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
          CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Math.max(CANVAS_WIDTH, CANVAS_HEIGHT) / 1.2
        );
        bgGradient.addColorStop(0, '#0d0d18');
        bgGradient.addColorStop(1, '#050508');
        context.fillStyle = bgGradient;
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      if (pattern === 'STANDARD') {
        // Fine sub-grid
        context.strokeStyle = uiSettings.gridColor;
        context.globalAlpha = 0.05;
        context.lineWidth = 0.5;
        for (let x = 0; x <= CANVAS_WIDTH; x += 16) {
          context.beginPath();
          context.moveTo(x, 0);
          context.lineTo(x, CANVAS_HEIGHT);
          context.stroke();
        }
        for (let y = 0; y <= CANVAS_HEIGHT; y += 16) {
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(CANVAS_WIDTH, y);
          context.stroke();
        }

        // Main tactical grid
        context.globalAlpha = 0.15;
        context.lineWidth = 1;
        for (let x = 0; x <= CANVAS_WIDTH; x += 64) {
          context.beginPath();
          context.moveTo(x, 0);
          context.lineTo(x, CANVAS_HEIGHT);
          context.stroke();
          
          // Add little coordinate markers
          context.globalAlpha = 0.3;
          context.fillStyle = uiSettings.gridColor;
          context.font = '6px monospace';
          context.fillText(`X:${x}`, x + 2, 8);
          context.globalAlpha = 0.15;
        }
        for (let y = 0; y <= CANVAS_HEIGHT; y += 64) {
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(CANVAS_WIDTH, y);
          context.stroke();
          
          context.globalAlpha = 0.3;
          context.fillText(`Y:${y}`, 2, y + 8);
          context.globalAlpha = 0.15;
        }
        context.globalAlpha = 1.0;
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
      
      // Horizontal Scanlines
      context.globalAlpha = 0.03;
      context.fillStyle = '#ffffff';
      for (let i = 0; i < CANVAS_HEIGHT; i += 3) {
        context.fillRect(0, i, CANVAS_WIDTH, 1);
      }
      
      // Vertical Pixels (subtle mesh)
      context.globalAlpha = 0.02;
      for (let i = 0; i < CANVAS_WIDTH; i += 3) {
        context.fillRect(i, 0, 1, CANVAS_HEIGHT);
      }

      // Vignette effect
      const vignette = context.createRadialGradient(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH / 4,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH / 1.5
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
      context.fillStyle = vignette;
      context.globalAlpha = 1.0;
      context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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
  }, [routes, sections, viewMode, currentSectionIndex, uiSettings, drawEvolutionMode, drawComparisonMode, drawDistributionMode, tooltip]);

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

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (viewMode !== 'COMPARISON' && viewMode !== 'DISTRIBUTION') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate proper coordinates taking scaling into account
    const scaleX = canvas.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    
    const sectionWidth = (CANVAS_WIDTH - 2 * PADDING) / sections.length;
    for (let i = 0; i < sections.length; i++) {
      const startX = PADDING + i * sectionWidth;
      const endX = startX + sectionWidth;
      if (mouseX >= startX && mouseX <= endX) {
        setCurrentSectionIndex(i);
        break;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

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
    <div className="relative group tactical-panel crt-screen p-1 bg-[#000000] overflow-hidden" data-pattern={uiSettings.backgroundPattern}>
      <div className="absolute inset-0 pointer-events-none z-30 opacity-[0.03] animate-scanline bg-gradient-to-b from-transparent via-white to-transparent h-40"></div>
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={() => setTooltip(null)}
        className="cursor-crosshair block w-full max-w-full object-contain"
      />
      
      {uiSettings.backgroundPattern !== 'SOLID' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none animate-flicker">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }}></div>
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] bg-[radial-gradient(circle,transparent_60%,rgba(0,0,0,0.3)_100%)]"></div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">

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

            <div className="absolute top-4 left-0 w-1 h-[1px] opacity-50" style={{ backgroundColor: uiSettings.hudColor }}></div>
            <div className="absolute top-0 left-4 w-[1px] h-1 opacity-50" style={{ backgroundColor: uiSettings.hudColor }}></div>
          </div>
        ))}

        {uiSettings.graphTitle && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[15px] tracking-[0.1em] font-bold underline decoration-2 underline-offset-4" style={{ fontFamily: uiSettings.fontFamily, color: uiSettings.graphTitleColor || '#ffffff', textShadow: `0 0 10px ${uiSettings.graphTitleGlow || uiSettings.hudColor}` }}>
            {uiSettings.graphTitle}
          </div>
        )}
        {uiSettings.showTelemetryTopRight !== false && (
          <div className="absolute top-2 right-6 flex items-center gap-2 text-[9px] tracking-[0.2em] font-bold" style={{ fontFamily: uiSettings.fontFamily, color: `${uiSettings.hudColor}aa` }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: uiSettings.hudColor, boxShadow: `0 0 5px ${uiSettings.hudColor}` }}></div>
            <div>
              {uiSettings.telemetryTopRightLabel}: <span style={{ color: '#ffffff' }}>{uiSettings.telemetryTopRightValue}</span>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-6 text-[13px] tracking-[0.2em] font-bold" style={{ fontFamily: uiSettings.fontFamily, color: `${uiSettings.hudColor}aa` }}>
          NIOBIOLOGIC v3.0 // <span style={{ color: '#ffffff' }}>{new Date().toLocaleDateString()}</span>
        </div>
        {uiSettings.showTelemetryBottomRight !== false && (
          <div className="absolute bottom-2 right-6 flex items-center gap-2 text-[9px] tracking-[0.2em] font-bold" style={{ fontFamily: uiSettings.fontFamily, color: `${uiSettings.hudColor}aa` }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: uiSettings.hudColor, boxShadow: `0 0 5px ${uiSettings.hudColor}` }}></div>
            <div>
              {uiSettings.telemetryBottomRightLabel}: <span style={{ color: '#ffffff' }}>{uiSettings.telemetryBottomRightValue}</span>
            </div>
          </div>
        )}
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
            {tooltip.section}: <span style={{ color: '#ffffff' }}>{tooltip.val.toFixed(2)}{uiSettings.showPercentage ? '%' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
});
