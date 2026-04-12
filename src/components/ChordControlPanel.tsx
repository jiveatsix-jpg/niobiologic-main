import React, { useRef } from 'react';
import { Music, RotateCcw, Download, Palette, Settings2 } from 'lucide-react';
import { useAeterContext } from '../context/AeterContext';
import { StringState } from '../types';
import * as htmlToImage from 'html-to-image';

const STRING_LABELS = ['Low E', 'A', 'D', 'G', 'B', 'High e'];

interface ChordControlPanelProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const ChordControlPanel: React.FC<ChordControlPanelProps> = ({ containerRef }) => {
  const { chordSettings, setChordSettings, updateStringConfig } = useAeterContext();

  const DEFAULT_CHORD = {
    chordName: 'F',
    startFret: 1,
    numFrets: 4,
    strings: [
      { state: 'played' as StringState, fret: 1, finger: 1 },
      { state: 'played' as StringState, fret: 1, finger: 1 },
      { state: 'played' as StringState, fret: 2, finger: 2 },
      { state: 'played' as StringState, fret: 3, finger: 4 },
      { state: 'played' as StringState, fret: 3, finger: 3 },
      { state: 'played' as StringState, fret: 1, finger: 1 },
    ],
    dotColor: '#00ffcc',
    labelColor: '#000000',
    stringColor: '#4a4a4a',
    fretColor: '#4a4a4a',
    bgColor: '#0a0a12',
    woodColor: '#1a1a2e',
    showFingerNumbers: true,
  };

  const cycleState = (current: StringState): StringState => {
    if (current === 'played') return 'open';
    if (current === 'open') return 'muted';
    return 'played';
  };

  const stateLabel = (s: StringState) => {
    if (s === 'open') return '○';
    if (s === 'muted') return '✕';
    return '●';
  };

  const stateColor = (s: StringState) => {
    if (s === 'open') return 'text-[#00ffcc] border-[#00ffcc]';
    if (s === 'muted') return 'text-[#ff0055] border-[#ff0055]';
    return 'text-[#ffffff] border-[#8a8a8a]';
  };

  const handleExport = async () => {
    if (!containerRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(containerRef.current, {
        backgroundColor: '#0a0a12',
        pixelRatio: 2,
        style: { transform: 'scale(1)', transformOrigin: 'top left', animation: 'none !important' },
        filter: (node) => {
          const exclusionClasses = ['capture-overlay-ui'];
          return !exclusionClasses.some(cls => (node as HTMLElement).classList?.contains(cls));
        }
      });
      const link = document.createElement('a');
      link.download = `chord_${chordSettings.chordName}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Chord export failed:', err);
    }
  };

  return (
    <div className="w-full space-y-2">

      {/* Header */}
      <div className="tactical-panel p-2 space-y-2">
        <div className="industrial-header">
          <h2 className="flex items-center gap-4">
            <Music className="w-6 h-6 text-[#ff0055]" /> CHORD EDITOR
          </h2>
        </div>

        {/* Chord Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#8a8a8a] uppercase tracking-widest">Chord Name</label>
          <input
            type="text"
            value={chordSettings.chordName}
            onChange={e => setChordSettings({ ...chordSettings, chordName: e.target.value })}
            className="w-full bg-[#0a0a12] border-2 border-[#ff0055]/50 text-[#ffffff] text-2xl font-black text-center p-2 focus:outline-none focus:border-[#ff0055] tracking-widest"
            maxLength={12}
          />
        </div>

        {/* Fretboard Config */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8a8a] uppercase tracking-widest">Start Fret</label>
            <input
              type="number"
              min={1}
              max={20}
              value={chordSettings.startFret}
              onChange={e => setChordSettings({ ...chordSettings, startFret: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full bg-[#0a0a12] border border-[#4a4a4a] text-[#ff0055] text-lg font-black text-center p-1.5 focus:outline-none focus:border-[#ff0055]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8a8a] uppercase tracking-widest">Num Frets</label>
            <input
              type="number"
              min={3}
              max={7}
              value={chordSettings.numFrets}
              onChange={e => setChordSettings({ ...chordSettings, numFrets: Math.min(7, Math.max(3, parseInt(e.target.value) || 4)) })}
              className="w-full bg-[#0a0a12] border border-[#4a4a4a] text-[#ff0055] text-lg font-black text-center p-1.5 focus:outline-none focus:border-[#ff0055]"
            />
          </div>
        </div>
      </div>

      {/* String Configuration */}
      <div className="tactical-panel p-2 space-y-2">
        <div className="industrial-header">
          <h2 className="flex items-center gap-4">
            <Settings2 className="w-5 h-5 text-[#ff0055]" /> STRING CONFIG
          </h2>
        </div>

        <div className="text-[8px] font-bold text-[#4a4a4a] grid grid-cols-[80px_1fr_1fr_1fr] gap-1 px-1 uppercase tracking-widest">
          <span>STRING</span>
          <span className="text-center">STATE</span>
          <span className="text-center">FRET</span>
          <span className="text-center">FINGER</span>
        </div>

        {chordSettings.strings.map((str, i) => (
          <div key={i} className="grid grid-cols-[80px_1fr_1fr_1fr] gap-1 items-center bg-[#0a0a12]/60 p-1.5 border border-[#4a4a4a]/30">
            <span className="text-[10px] font-bold text-[#8a8a8a] uppercase">{STRING_LABELS[i]}</span>

            {/* State toggle */}
            <button
              onClick={() => updateStringConfig(i, { state: cycleState(str.state) })}
              className={`text-sm font-black border py-1 transition-all ${stateColor(str.state)} hover:opacity-80 active:scale-95`}
            >
              {stateLabel(str.state)}
            </button>

            {/* Fret number (only relevant when played) */}
            <input
              type="number"
              min={chordSettings.startFret}
              max={chordSettings.startFret + chordSettings.numFrets - 1}
              value={str.fret}
              disabled={str.state !== 'played'}
              onChange={e => updateStringConfig(i, { fret: parseInt(e.target.value) || chordSettings.startFret })}
              className="w-full bg-[#000000] border border-[#4a4a4a] text-[#ffffff] text-center text-sm font-black p-1 focus:outline-none focus:border-[#ff0055] disabled:opacity-25 disabled:cursor-not-allowed"
            />

            {/* Finger number */}
            <input
              type="number"
              min={0}
              max={4}
              value={str.finger}
              disabled={str.state !== 'played'}
              onChange={e => updateStringConfig(i, { finger: Math.min(4, Math.max(0, parseInt(e.target.value) || 0)) })}
              className="w-full bg-[#000000] border border-[#4a4a4a] text-[#ff0055] text-center text-sm font-black p-1 focus:outline-none focus:border-[#ff0055] disabled:opacity-25 disabled:cursor-not-allowed"
            />
          </div>
        ))}

        {/* Show finger numbers toggle */}
        <label className="flex items-center gap-3 cursor-pointer p-1">
          <div
            onClick={() => setChordSettings({ ...chordSettings, showFingerNumbers: !chordSettings.showFingerNumbers })}
            className={`w-4 h-4 border-2 flex items-center justify-center transition-all ${chordSettings.showFingerNumbers ? 'border-[#ff0055] bg-[#ff0055]' : 'border-[#4a4a4a]'}`}
          >
            {chordSettings.showFingerNumbers && <div className="w-1.5 h-1.5 bg-[#000000]" />}
          </div>
          <span className="text-[10px] font-bold text-[#8a8a8a] uppercase tracking-widest">Show Finger Numbers</span>
        </label>
      </div>

      {/* Style */}
      <div className="tactical-panel p-2 space-y-2">
        <div className="industrial-header">
          <h2 className="flex items-center gap-4">
            <Palette className="w-5 h-5 text-[#ff0055]" /> STYLE
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'DOT', key: 'dotColor' as const },
            { label: 'LABEL', key: 'labelColor' as const },
            { label: 'STRING', key: 'stringColor' as const },
            { label: 'FRET', key: 'fretColor' as const },
            { label: 'BOARD', key: 'bgColor' as const },
            { label: 'WOOD', key: 'woodColor' as const },
          ].map(({ label, key }) => (
            <div key={key} className="flex flex-col gap-1 items-center">
              <span className="text-[8px] text-[#4a4a4a] font-bold">{label}</span>
              <div className="flex items-center w-full bg-[#000000] border border-[#4a4a4a] p-0.5">
                <input
                  type="color"
                  value={chordSettings[key] as string}
                  onChange={e => setChordSettings({ ...chordSettings, [key]: e.target.value })}
                  className="w-4 h-4 bg-transparent border-none cursor-pointer p-0 shrink-0"
                />
                <input
                  type="text"
                  value={chordSettings[key] as string}
                  onChange={e => setChordSettings({ ...chordSettings, [key]: e.target.value })}
                  className="w-full bg-transparent text-center text-[#ffffff] text-[7px] font-mono focus:outline-none uppercase"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 capture-overlay-ui">
        <button
          onClick={() => setChordSettings(DEFAULT_CHORD)}
          className="flex items-center justify-center gap-2 py-2.5 text-[10px] font-black text-[#8a8a8a] border-2 border-[#4a4a4a] hover:border-[#ffffff]/30 hover:text-[#ffffff] transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" /> RESET
        </button>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 py-2.5 text-[10px] font-black text-[#ffffff] bg-[#ff0055] border-2 border-[#ff0055] hover:bg-[#cc0044] transition-all active:scale-95"
        >
          <Download className="w-4 h-4" /> EXPORT PNG
        </button>
      </div>
    </div>
  );
};
