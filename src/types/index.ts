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
  showPercentage: boolean;
  scaleMode: 'DYNAMIC' | 'FIXED' | 'DATA_ONLY';
  backgroundPattern: 'STANDARD' | 'SCANLINES' | 'RADIAL' | 'STEALTH' | 'BLUEPRINT' | 'SOLID';
  xAxisTitle?: string;
  yAxisTitle?: string;
  showCompYAxis?: boolean;
  telemetryTopRightLabel?: string;
  telemetryTopRightValue?: string;
  showTelemetryTopRight?: boolean;
  telemetryBottomRightLabel?: string;
  telemetryBottomRightValue?: string;
  showTelemetryBottomRight?: boolean;
  graphTitle?: string;
  graphTitleColor?: string;
  graphTitleGlow?: string;
  visualFilter: 'NONE' | 'CRT' | 'PRINT' | 'STEALTH' | 'VINTAGE' | 'MONOCHROME';
  showSectionLabels: boolean;
}

export type ViewMode = 'EVOLUTION' | 'COMPARISON' | 'DISTRIBUTION' | 'RADAR' | 'DATATABLE';

export type AppMode = 'GRAPH';

export interface SavedGraph {
  id: string;
  name: string;
  timestamp: number;
  sections: Section[];
  routes: RouteData[];
  uiSettings: UISettings;
  appMode: AppMode | null;
  viewMode: ViewMode;
}
