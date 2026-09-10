import React, { useState } from 'react';
import * as htmlToImage from 'html-to-image';
import GIF from 'gif.js';
import gifWorkerUrl from 'gif.js/dist/gif.worker.js?url';
import { Camera, Trash2, Download, X, Clapperboard } from 'lucide-react';
import { useAeterContext } from '../context/AeterContext';

interface GifStudioOverlayProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const CAPTURE_OPTS = {
  backgroundColor: '#0a0a12',
  pixelRatio: 1,
  style: { transform: 'scale(1)', transformOrigin: 'top left', animation: 'none !important' },
  filter: (node: HTMLElement) => {
    const exclusionClasses = ['capture-overlay-ui', 'capture-selection-ui'];
    return !exclusionClasses.some(cls => node.classList?.contains(cls));
  },
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export const GifStudioOverlay: React.FC<GifStudioOverlayProps> = ({ containerRef }) => {
  const {
    showGifStudio, setShowGifStudio,
    gifFrames, addGifFrame, removeGifFrame, updateGifFrameDuration, clearGifFrames,
    gifDefaultDuration, setGifDefaultDuration,
  } = useAeterContext();
  const [capturing, setCapturing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  if (!showGifStudio) return null;

  const captureFrame = async () => {
    if (!containerRef.current) return;
    setCapturing(true);
    try {
      const dataUrl = await htmlToImage.toPng(containerRef.current, CAPTURE_OPTS);
      addGifFrame(dataUrl);
    } catch (err) {
      console.error('Frame capture failed:', err);
      alert('No se pudo capturar el fotograma.');
    } finally {
      setCapturing(false);
    }
  };

  const exportGif = async () => {
    if (gifFrames.length === 0 || exporting) return;
    setExporting(true);
    setExportProgress(0);
    try {
      const images = await Promise.all(gifFrames.map(f => loadImage(f.dataUrl)));
      const width = Math.max(...images.map(img => img.width));
      const height = Math.max(...images.map(img => img.height));

      const gif = new GIF({ workers: 2, quality: 10, width, height, workerScript: gifWorkerUrl, background: '#0a0a12' });

      images.forEach((img, i) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#0a0a12';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
        gif.addFrame(canvas, { delay: gifFrames[i].duration, copy: true });
      });

      gif.on('progress', (p: number) => setExportProgress(Math.round(p * 100)));
      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = `niobiologic_${Date.now()}.gif`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 100);
        setExporting(false);
        setExportProgress(0);
      });
      gif.render();
    } catch (err) {
      console.error('GIF export failed:', err);
      alert('No se pudo exportar el GIF.');
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[85vh] bg-[#0c0d16] border border-white/10 rounded-lg shadow-2xl shadow-black/60 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#ff8800]/30 bg-[#ff8800]/5 shrink-0">
          <h2 className="flex items-center gap-3">
            <Clapperboard className="w-5 h-5 text-[#ff8800]" />
            <span className="text-sm font-black tracking-[0.3em] text-[#ff8800]">GIF STUDIO</span>
          </h2>
          <button onClick={() => setShowGifStudio(false)} className="p-2 text-[#8a8a8a] hover:text-[#ff0055] transition-colors" title="Cierra el estudio de GIF">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-3 border-b border-white/5 bg-black/30 shrink-0">
          <button
            onClick={captureFrame}
            disabled={capturing}
            title="Captura cómo se ve el gráfico ahora mismo y lo agrega como el siguiente fotograma del GIF"
            className="px-4 py-2 flex items-center gap-2 text-[11px] font-black text-[#ff8800] border border-[#ff8800]/60 hover:bg-[#ff8800]/10 active:scale-95 transition-all disabled:opacity-40"
          >
            <Camera className="w-3.5 h-3.5" /> {capturing ? 'CAPTURANDO...' : 'CAPTURAR FOTOGRAMA'}
          </button>
          <label className="flex items-center gap-2 text-[10px] text-[#8a8a8a] font-mono" title="Duración que se usa para cada fotograma nuevo que captures (los ya capturados no cambian)">
            DURACIÓN POR DEFECTO
            <input
              type="number" min={50} step={50}
              value={gifDefaultDuration}
              onChange={e => setGifDefaultDuration(Math.max(50, parseInt(e.target.value) || 500))}
              className="w-20 bg-[#0a0a12] border border-[#4a4a4a] text-[#ffffff] text-[11px] p-1 font-mono focus:outline-none"
            />
            ms
          </label>
          <div className="ml-auto flex items-center gap-2">
            {gifFrames.length > 0 && (
              <button onClick={clearGifFrames} title="Borra todos los fotogramas capturados" className="px-3 py-2 flex items-center gap-1.5 text-[10px] font-bold text-[#ff0055]/70 hover:text-[#ff0055] transition-all">
                <Trash2 className="w-3.5 h-3.5" /> LIMPIAR TODO
              </button>
            )}
            <button
              onClick={exportGif}
              disabled={gifFrames.length === 0 || exporting}
              title="Arma el GIF animado con todos los fotogramas capturados, en orden, y lo descarga"
              className="px-4 py-2 flex items-center gap-2 text-[11px] font-black text-[#00ffcc] border border-[#00ffcc]/60 hover:bg-[#00ffcc]/10 active:scale-95 transition-all disabled:opacity-30"
            >
              <Download className="w-3.5 h-3.5" /> {exporting ? `EXPORTANDO ${exportProgress}%` : 'EXPORTAR GIF'}
            </button>
          </div>
        </div>

        {/* Frames */}
        <div className="flex-1 overflow-y-auto p-4">
          {gifFrames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#4a4a4a] text-center px-6">
              <Camera className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-[11px] font-mono tracking-widest">SIN FOTOGRAMAS</p>
              <p className="text-[9px] font-mono mt-2 max-w-xs">
                Armá el gráfico como quieras que se vea primero y capturá el fotograma. Cambiá los valores (o mostrá/ocultá líneas y categorías con el ícono del ojo) y capturá el siguiente. Repetí hasta tener toda la secuencia, y exportá.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {gifFrames.map((frame, i) => (
                <div key={frame.id} className="bg-black/60 border border-[#4a4a4a]/40 overflow-hidden">
                  <div className="relative">
                    <img src={frame.dataUrl} alt={`Fotograma ${i + 1}`} className="w-full aspect-video object-contain bg-black" />
                    <span className="absolute top-1 left-1 bg-black/80 text-[#ff8800] text-[9px] font-black px-1.5 py-0.5">#{i + 1}</span>
                    <button
                      onClick={() => removeGifFrame(frame.id)}
                      title="Elimina este fotograma de la secuencia"
                      className="absolute top-1 right-1 bg-black/80 text-[#ff0055]/70 hover:text-[#ff0055] p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="p-1.5 flex items-center gap-1">
                    <input
                      type="number" min={20} step={20}
                      value={frame.duration}
                      onChange={e => updateGifFrameDuration(frame.id, Math.max(20, parseInt(e.target.value) || 20))}
                      title="Cuánto tiempo (en milisegundos) se queda este fotograma en pantalla dentro del GIF"
                      className="w-full bg-[#0a0a12] border border-[#4a4a4a] text-[#ffffff] text-[10px] p-1 font-mono text-center focus:outline-none"
                    />
                    <span className="text-[9px] text-[#4a4a4a]">ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#ff8800]/5 border-t border-[#ff8800]/20 text-center shrink-0">
          <p className="text-[8px] text-[#ff8800] font-mono tracking-[0.4em]">{gifFrames.length} FOTOGRAMAS CAPTURADOS</p>
        </div>
      </div>
    </div>
  );
};
