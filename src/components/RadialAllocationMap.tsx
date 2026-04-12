import React from 'react';
import { useAeterContext } from '../context/AeterContext';

export const RadialAllocationMap: React.FC = () => {
  const { sections, routes, uiSettings } = useAeterContext();
  const size = 500;
  const center = size / 2;
  const innerRadius = 80;
  const outerRadius = 180;
  
  const sliceAngle = sections.length > 0 ? (2 * Math.PI) / sections.length : 0;
  
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 animate-in fade-in duration-500">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-[0_0_15px_rgba(0,255,204,0.2)]">
        <text 
          x={center} 
          y={center} 
          textAnchor="middle" 
          dominantBaseline="middle" 
          className="fill-[#00ffcc] font-mono text-[14px] tracking-[0.2em] animate-terminal-blink"
        >
          SYNC: STABLE
        </text>
        
        {sections.map((sec, i) => {
          const startAngle = i * sliceAngle - Math.PI / 2;
          
          const labelAngle = startAngle + sliceAngle / 2;
          const labelRadius = outerRadius + 45;
          const lx = center + labelRadius * Math.cos(labelAngle);
          const ly = center + labelRadius * Math.sin(labelAngle);
          
          return (
            <g key={`radial-sec-${i}`}>
              {routes.map((route, rIdx) => {
                const val = route.data[i] || 0;
                const ringWidth = routes.length > 0 ? (outerRadius - innerRadius) / routes.length : 0;
                const rStart = innerRadius + (rIdx * ringWidth) + 2;
                const rEnd = innerRadius + ((rIdx + 1) * ringWidth) - 2;
                
                const valAngle = sliceAngle * (val / 100);
                const arcEndAngle = startAngle + valAngle;
                
                const x1 = center + rStart * Math.cos(startAngle);
                const y1 = center + rStart * Math.sin(startAngle);
                const x2 = center + rEnd * Math.cos(startAngle);
                const y2 = center + rEnd * Math.sin(startAngle);
                const x3 = center + rEnd * Math.cos(arcEndAngle);
                const y3 = center + rEnd * Math.sin(arcEndAngle);
                const x4 = center + rStart * Math.cos(arcEndAngle);
                const y4 = center + rStart * Math.sin(arcEndAngle);
                
                const largeArcFlag = valAngle > Math.PI ? 1 : 0;
                
                const pathData = `
                  M ${x1} ${y1}
                  L ${x2} ${y2}
                  A ${rEnd} ${rEnd} 0 ${largeArcFlag} 1 ${x3} ${y3}
                  L ${x4} ${y4}
                  A ${rStart} ${rStart} 0 ${largeArcFlag} 0 ${x1} ${y1}
                  Z
                `;
                
                const pathColor = route.name === 'ALPHA' ? '#ff0055' : route.name === 'BETA' ? '#00ffcc' : route.color;
                
                return (
                  <path 
                    key={`route-${route.id}-sec-${i}`}
                    d={pathData}
                    fill={pathColor}
                    fillOpacity={0.4}
                    stroke={pathColor}
                    strokeWidth={uiSettings.lineWidth}
                    className="transition-all duration-700 hover:fill-opacity-100 cursor-pointer"
                    style={{ filter: `drop-shadow(0 0 8px ${pathColor})` }}
                  >
                    <title>{route.name} | {sec.name}: {val}%</title>
                  </path>
                );
              })}
              
              <line 
                x1={center + (innerRadius - 10) * Math.cos(startAngle)}
                y1={center + (innerRadius - 10) * Math.sin(startAngle)}
                x2={center + (outerRadius + 20) * Math.cos(startAngle)}
                y2={center + (outerRadius + 20) * Math.sin(startAngle)}
                stroke={uiSettings.gridColor}
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.5}
              />
              
              <text 
                x={lx} 
                y={ly} 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="fill-[#8a8a8a] font-mono text-[12px] tracking-widest font-bold"
              >
                {sec.name}
              </text>
            </g>
          );
        })}
        
        <circle cx={center} cy={center} r={innerRadius - 15} fill="none" stroke={uiSettings.gridColor} strokeWidth={1} strokeDasharray="2 2" opacity={0.3} />
        <circle cx={center} cy={center} r={innerRadius} fill="none" stroke={uiSettings.gridColor} strokeWidth={1} opacity={0.5} />
        <circle cx={center} cy={center} r={outerRadius} fill="none" stroke={uiSettings.gridColor} strokeWidth={1} opacity={0.5} />
        <circle cx={center} cy={center} r={outerRadius + 30} fill="none" stroke={uiSettings.gridColor} strokeWidth={1} strokeDasharray="10 5" opacity={0.2} />
      </svg>
    </div>
  );
};
