export interface RouteData {
  id: string;
  name: string;
  color: string;
  data: number[];
  resourceValue: number;
}

export interface Section {
  name: string;
  color: string;
  shadowColor: string;
  glowIntensity: number;
  isAnchored?: boolean;
  isMinimalShadow?: boolean;
}

export interface TooltipInfo {
  x: number;
  y: number;
  val: number;
  section: string;
  routeName: string;
  color: string;
}

export interface UISettings {
  fontSize: number;
  fontFamily: string;
  baseColor: string;
  gridColor: string;
  hudColor: string;
  bgImage: string | null;
  lineWidth: number;
  backgroundPattern: 'STANDARD' | 'SCANLINES' | 'RADIAL' | 'STEALTH' | 'BLUEPRINT';
}

export type ViewMode = 'EVOLUTION' | 'COMPARISON' | 'DISTRIBUTION' | 'RADAR';

export type AppMode = 'GRAPH' | 'CHORD';

export type StringState = 'open' | 'muted' | 'played';

export interface StringConfig {
  state: StringState; // open = ○, muted = ✕, played = dot
  fret: number;       // 0-based fret number on the fretboard (1 = first fret)
  finger: number;     // Finger index shown in dot (1-4)
}

export interface ChordSettings {
  chordName: string;
  startFret: number;         // Fret number shown at top-left of diagram
  numFrets: number;          // How many frets to render (4-7)
  strings: StringConfig[];   // 6 strings, index 0 = low E, index 5 = high e
  // Style
  dotColor: string;
  labelColor: string;
  stringColor: string;
  fretColor: string;
  bgColor: string;
  woodColor: string;
  showFingerNumbers: boolean;
}
