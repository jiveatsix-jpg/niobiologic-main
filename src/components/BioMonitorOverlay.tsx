import React from 'react';
import { Activity, X, Database, Zap } from 'lucide-react';
import { useAeterContext } from '../context/AeterContext';
import { RadialAllocationMap } from './RadialAllocationMap';

export const BioMonitorOverlay: React.FC = () => {
  const { showBioMonitor, setShowBioMonitor, sections, routes, signalStr } = useAeterContext();

  if (!showBioMonitor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#0a0a12] tactical-panel flex flex-col overflow-hidden">
        <div className="industrial-header flex items-center justify-between p-4 bg-[#00ffcc]/5">
          <h2 className="flex items-center gap-4">
            <Activity className="w-6 h-6 text-[#00ffcc] animate-pulse" /> ADVANCED BIO-MONITOR
          </h2>
          <button 
            onClick={() => setShowBioMonitor(false)}
            className="p-2 text-[#8a8a8a] hover:text-[#ff0055] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="flex flex-col items-center justify-center bg-[#000000]/40 tactical-panel p-6 bio-panel-glow">
            <h3 className="text-[14px] font-bold text-[#8a8a8a] mb-6 tracking-[0.4em] uppercase">Radial Allocation Map</h3>
            <div className="w-full aspect-square max-w-md">
              <RadialAllocationMap />
            </div>
            <div className="mt-10 grid grid-cols-2 gap-8 w-full">
              <div className="space-y-3">
                <p className="text-[11px] text-[#4a4a4a] font-bold tracking-widest uppercase">Diagnostic Status</p>
                <div className="p-4 border border-[#4a4a4a] bg-[#00ffcc]/5">
                  <p className="text-[12px] text-[#00ffcc] font-mono">SIGNAL: NOMINAL</p>
                  <p className="text-[12px] text-[#00ffcc] font-mono">SYNC: {signalStr}</p>
                  <p className="text-[12px] text-[#00ffcc] font-mono">LATENCY: 12ms</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[11px] text-[#4a4a4a] font-bold tracking-widest uppercase">Sector Analysis</p>
                <div className="p-4 border border-[#4a4a4a] bg-[#ff0055]/5">
                  <p className="text-[12px] text-[#ff0055] font-mono">ACTIVE SECTORS: {sections.length}</p>
                  <p className="text-[12px] text-[#ff0055] font-mono">DATA STREAMS: {routes.length}</p>
                  <p className="text-[12px] text-[#ff0055] font-mono">INTEGRITY: 100%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-6">
              <h3 className="text-[16px] font-bold text-[#00ffcc] tracking-[0.3em] uppercase border-b border-[#00ffcc]/30 pb-3 flex items-center gap-2">
                <Database className="w-5 h-5" /> SYSTEM MANIFESTO
              </h3>
              <div className="bg-[#00ffcc]/5 p-8 border border-[#00ffcc]/20 font-mono text-[13px] leading-relaxed text-[#8a8a8a] space-y-6 bio-panel-glow">
                <p className="text-[#00ffcc] font-bold italic text-[15px]">"La tecnología no es un fin, sino un puente hacia la soberanía del pensamiento."</p>
                <p>Este sistema ha sido diseñado bajo los principios del Proyecto NioBiologic: transparencia operativa, soberanía de datos y minimalismo táctico.</p>
                <p>Cada flujo de datos ALPHA y BETA representa la pulsación de un organismo vivo. Nuestra misión es proporcionar la claridad necesaria para que la voluntad humana prevalezca sobre el ruido algorítmico.</p>
                <div className="pt-6 border-t border-[#00ffcc]/10 flex justify-between items-center">
                  <span className="text-[11px] text-[#4a4a4a]">ID: NIOBIOLOGIC_SOVEREIGNTY_PROTOCOL</span>
                  <span className="text-[11px] text-[#4a4a4a]">v3.0.0</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[16px] font-bold text-[#ff0055] tracking-[0.3em] uppercase border-b border-[#ff0055]/30 pb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" /> OPERATIONAL GUIDELINES
              </h3>
              <ul className="space-y-3 text-[12px] text-[#8a8a8a] font-mono list-none">
                <li className="flex gap-3"><span className="text-[#ff0055]">01.</span> PRIORITIZE ALPHA FLOW STABILITY DURING PEAK LOADS.</li>
                <li className="flex gap-3"><span className="text-[#ff0055]">02.</span> MAINTAIN BETA SYNCHRONIZATION WITHIN 15% THRESHOLD.</li>
                <li className="flex gap-3"><span className="text-[#ff0055]">03.</span> EXECUTE SYSTEM PURGE IF ZERO STATE IS COMPROMISED.</li>
                <li className="flex gap-3"><span className="text-[#ff0055]">04.</span> DATA SOVEREIGNTY IS NON-NEGOTIABLE.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#00ffcc]/5 border-t border-[#00ffcc]/30 text-center">
          <p className="text-[9px] text-[#00ffcc] font-mono tracking-[0.5em] animate-pulse">SYSTEM_LOCKED // NIOBIOLOGIC_v3.0 // SECURE_CONNECTION</p>
        </div>
      </div>
    </div>
  );
};
