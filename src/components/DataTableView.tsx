import React from 'react';
import { useAeterContext } from '../context/AeterContext';

export const DataTableView: React.FC = () => {
  const { routes, sections, uiSettings } = useAeterContext();

  return (
    <div className="w-full h-full p-6 overflow-y-auto no-scrollbar text-[#00ffcc]" style={{ color: uiSettings.baseColor, fontFamily: '"Press Start 2P", cursive' }}>
      <div className="mb-6 pb-4 border-b-4" style={{ borderColor: `${uiSettings.baseColor}40` }}>
        <h2 className="text-xl lg:text-2xl font-black tracking-widest uppercase leading-loose">DATA STREAM MATRICES</h2>
      </div>

      <div className="space-y-12">
        {routes.map((route) => (
          <div key={`table-${route.id}`} className="flex flex-col border-4 border-[#4a4a4a] bg-[#000000]/80 backdrop-blur-sm p-5">
            <div className="flex items-center gap-4 mb-4 border-b-2 pb-3 border-[#4a4a4a]/50">
              <div 
                className="w-4 h-4 shadow-[0_0_12px_currentColor]" 
                style={{ backgroundColor: route.color, color: route.color }}
              ></div>
              <h3 className="text-sm lg:text-base tracking-[0.1em] uppercase leading-relaxed" style={{ color: route.color }}>
                {route.name}
              </h3>
              <div className="ml-auto text-[10px] lg:text-xs text-[#8a8a8a] tracking-widest leading-loose">
                RESOURCE LVL: <span className="text-[#ffffff]">{route.resourceValue}</span>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse mt-2">
                <thead>
                  <tr>
                    <th className="py-4 px-4 border-b-4 border-[#4a4a4a] text-[#8a8a8a] uppercase tracking-widest text-[10px] lg:text-xs leading-loose">SECTOR</th>
                    <th className="py-4 px-4 border-b-4 border-[#4a4a4a] text-[#8a8a8a] text-right uppercase tracking-widest text-[10px] lg:text-xs leading-loose">VALUE</th>
                    <th className="py-4 px-4 border-b-4 border-[#4a4a4a] text-[#8a8a8a] text-right uppercase tracking-widest text-[10px] lg:text-xs leading-loose">PERCENTAGE</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((sec, i) => {
                    const val = route.data[i] || 0;
                    return (
                      <tr key={`row-${route.id}-${i}`} className="hover:bg-[#ffffff]/5 transition-colors group">
                        <td className="py-3 px-4 border-b-2 border-[#4a4a4a]/30 uppercase tracking-wider text-[10px] lg:text-xs leading-loose" style={{ color: sec.color }}>
                          {sec.name}
                        </td>
                        <td className="py-3 px-4 border-b-2 border-[#4a4a4a]/30 text-right text-[#ffffff] font-bold text-[10px] lg:text-xs leading-loose">
                          {val.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 border-b-2 border-[#4a4a4a]/30 text-right text-[#ffffff]/60 group-hover:text-[#00ffcc] text-[10px] lg:text-xs leading-loose">
                          {val.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
