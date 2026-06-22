import { useState, useEffect } from 'react';
import { RouteData, Section, UISettings, ViewMode, TooltipInfo, AppMode, SavedGraph } from '../types';

const INITIAL_SECTIONS: Section[] = [
  { name: 'CORTEX', color: '#00ffcc', shadowColor: '#00ffcc', glowIntensity: 4, isAnchored: true, isMinimalShadow: false },
  { name: 'NUCLEUS', color: '#ffd700', shadowColor: '#ffd700', glowIntensity: 4, isAnchored: true, isMinimalShadow: false },
  { name: 'STROMATA', color: '#ff0055', shadowColor: '#ff0055', glowIntensity: 4, isAnchored: true, isMinimalShadow: false },
  { name: 'AXON', color: '#0088ff', shadowColor: '#0088ff', glowIntensity: 4, isAnchored: true, isMinimalShadow: false },
  { name: 'SYNAPSE', color: '#8800ff', shadowColor: '#8800ff', glowIntensity: 4, isAnchored: true, isMinimalShadow: false }
];

const INITIAL_ROUTES: RouteData[] = [
  { id: '1', name: 'ALPHA', color: '#ff0055', data: [20, 45, 30, 80, 60], resourceValue: 65 },
  { id: '2', name: 'BETA', color: '#00ffcc', data: [40, 20, 70, 50, 90], resourceValue: 40 }
];

const INITIAL_UI_SETTINGS: UISettings = {
  fontSize: 16,
  fontFamily: '"Press Start 2P", cursive',
  baseColor: '#8a8a8a',
  gridColor: '#1a1a2e',
  hudColor: '#00ffcc',
  bgImage: null,
  lineWidth: 2,
  showPercentage: false,
  scaleMode: 'DYNAMIC',
  backgroundPattern: 'STANDARD',
  xAxisTitle: 'TIME / SECTOR',
  yAxisTitle: 'MAGNITUDE / VALUE',
  showCompYAxis: false,
  telemetryTopRightLabel: 'DATA_CONFIDENCE',
  telemetryTopRightValue: 'LOCAL_STORAGE',
  showTelemetryTopRight: true,
  telemetryBottomRightLabel: 'SYNC_STATUS',
  telemetryBottomRightValue: 'LOCAL_ONLY // NO_CLOUD',
  showTelemetryBottomRight: true,
  graphTitle: '',
  graphTitleColor: '#ffffff',
  graphTitleGlow: '#00ffcc',
  visualFilter: 'NONE',
  showSectionLabels: true
};

export function useAeterData() {
  const [sections, setSections] = useState<Section[]>(() => {
    const saved = localStorage.getItem('aeter_sections');
    return saved ? JSON.parse(saved) : INITIAL_SECTIONS;
  });

  const [routes, setRoutes] = useState<RouteData[]>(() => {
    const saved = localStorage.getItem('aeter_routes');
    return saved ? JSON.parse(saved) : INITIAL_ROUTES;
  });

  const [uiSettings, setUiSettings] = useState<UISettings>(() => {
    const saved = localStorage.getItem('aeter_uisettings');
    return saved ? { ...INITIAL_UI_SETTINGS, ...JSON.parse(saved) } : INITIAL_UI_SETTINGS;
  });

  const [viewMode, setViewMode] = useState<ViewMode>('EVOLUTION');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showBioMonitor, setShowBioMonitor] = useState(false);
  const [showResources, setShowResources] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    const saved = localStorage.getItem('aeter_has_seen_tutorial');
    return !saved;
  });

  const [appMode, setAppMode] = useState<AppMode | null>(() => {
    const saved = localStorage.getItem('aeter_app_mode');
    if (saved === 'CHORD') return 'GRAPH';
    return (saved as AppMode) || null;
  });

  const completeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('aeter_has_seen_tutorial', 'true');
  };

  const [activeTab, setActiveTab] = useState<string>('GLOBAL');

  const [savedGraphs, setSavedGraphs] = useState<SavedGraph[]>(() => {
    const saved = localStorage.getItem('aeter_library');
    return saved ? JSON.parse(saved) : [];
  });
  const [showLibrary, setShowLibrary] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('aeter_sections', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('aeter_routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('aeter_uisettings', JSON.stringify(uiSettings));
  }, [uiSettings]);

  useEffect(() => {
    if (appMode) localStorage.setItem('aeter_app_mode', appMode);
  }, [appMode]);

  useEffect(() => {
    localStorage.setItem('aeter_library', JSON.stringify(savedGraphs));
  }, [savedGraphs]);

  const saveGraph = (name: string) => {
    const graph: SavedGraph = {
      id: Date.now().toString(),
      name: name.toUpperCase() || `GRAPH_${savedGraphs.length + 1}`,
      timestamp: Date.now(),
      sections: JSON.parse(JSON.stringify(sections)),
      routes: JSON.parse(JSON.stringify(routes)),
      uiSettings: JSON.parse(JSON.stringify(uiSettings)),
      appMode,
      viewMode,
    };
    setSavedGraphs(prev => [graph, ...prev]);
  };

  const loadGraph = (id: string) => {
    const graph = savedGraphs.find(g => g.id === id);
    if (!graph) return;
    setSections(graph.sections);
    setRoutes(graph.routes);
    setUiSettings(graph.uiSettings);
    setViewMode(graph.viewMode);
    setAppMode('GRAPH');
  };

  const deleteGraph = (id: string) => {
    setSavedGraphs(prev => prev.filter(g => g.id !== id));
  };

  // Actions
  const addRoute = () => {
    const id = Date.now().toString();
    const colors = ['#ff0055', '#00ffcc', '#ffd700', '#ff8800', '#8800ff', '#0088ff', '#ffffff'];
    const color = colors[routes.length % colors.length];
    const newRoute: RouteData = {
      id,
      name: `RT-${routes.length + 1}`,
      color,
      data: new Array(sections.length).fill(50),
      resourceValue: 50
    };
    setRoutes([...routes, newRoute]);
  };

  const removeRoute = (id: string) => {
    setRoutes(routes.filter(r => r.id !== id));
    if (activeTab === id) setActiveTab('GLOBAL');
  };

  const updateRoute = (id: string, updates: Partial<RouteData>) => {
    setRoutes(routes.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const updateDataPoint = (routeId: string, pointIndex: number, val: number) => {
    setRoutes(routes.map(r => {
      if (r.id === routeId) {
        const newData = [...r.data];
        newData[pointIndex] = val;
        return { ...r, data: newData };
      }
      return r;
    }));
  };

  const addSection = () => {
    const newSecName = `SEC-${sections.length + 1}`;
    setSections([...sections, { name: newSecName, color: '#00ffcc', shadowColor: '#00ffcc', glowIntensity: 4 }]);
    setRoutes(routes.map(r => ({
      ...r,
      data: [...r.data, 50]
    })));
  };

  const removeSection = (index: number) => {
    if (sections.length <= 1) return;
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
    setRoutes(routes.map(r => ({
      ...r,
      data: r.data.filter((_, i) => i !== index)
    })));
    if (currentSectionIndex >= newSections.length) {
      setCurrentSectionIndex(newSections.length - 1);
    }
  };

  const updateSection = (index: number, updates: Partial<Section>) => {
    const newSections = [...sections];
    let updatedSec = { ...newSections[index], ...updates };
    
    if (updates.name) updatedSec.name = updates.name.toUpperCase();
    
    if (updatedSec.isAnchored) {
      if (updates.color !== undefined) {
        updatedSec.shadowColor = updates.color;
      } else if (updates.shadowColor !== undefined) {
        updatedSec.color = updates.shadowColor;
      } else if (updates.isAnchored === true) {
        updatedSec.shadowColor = updatedSec.color;
      }
    }
    
    newSections[index] = updatedSec;
    setSections(newSections);
  };

  const exportData = () => {
    const dataObj = { sections, routes, uiSettings };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `aeter_datacube_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const parsed = JSON.parse(result);
          if (parsed.sections && parsed.routes && parsed.uiSettings) {
            setSections(parsed.sections);
            setRoutes(parsed.routes);
            setUiSettings(parsed.uiSettings);
          } else {
            alert("DATACUBE CORRUPTED: Invalid format structure.");
          }
        }
      } catch (error) {
         alert("DATACUBE CORRUPTED: JSON Parsing Error.");
      }
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string): { sections: Section[]; routes: RouteData[] } => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row.');

    const parseRow = (line: string): string[] => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuotes = !inQuotes; continue; }
        if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue; }
        current += ch;
      }
      values.push(current.trim());
      return values;
    };

    const headers = parseRow(lines[0]);
    const routeNames = headers.slice(1).map(h => h.toUpperCase().replace(/[^A-Z0-9_]/g, '_') || `RT-UNKNOWN`);
    const routeColors = ['#ff0055', '#00ffcc', '#ffd700', '#ff8800', '#8800ff', '#0088ff', '#ffffff', '#ff4488', '#44ff88', '#4488ff'];
    const newRoutes: RouteData[] = routeNames.map((name, i) => ({
      id: `csv-${i}`,
      name,
      color: routeColors[i % routeColors.length],
      data: [] as number[],
      resourceValue: 50,
    }));

    const newSections: Section[] = [];
    const defaultColors = ['#00ffcc', '#ffd700', '#ff0055', '#0088ff', '#8800ff'];

    for (let ri = 1; ri < lines.length; ri++) {
      const cells = parseRow(lines[ri]);
      const secName = cells[0]?.toUpperCase() || `ROW-${ri}`;
      newSections.push({
        name: secName,
        color: defaultColors[(ri - 1) % defaultColors.length],
        shadowColor: defaultColors[(ri - 1) % defaultColors.length],
        glowIntensity: 4,
      });
      for (let ci = 0; ci < newRoutes.length; ci++) {
        const val = parseFloat(cells[ci + 1]);
        newRoutes[ci].data.push(isNaN(val) ? 0 : val);
      }
    }

    return { sections: newSections, routes: newRoutes };
  };

  const importCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const { sections: csvSections, routes: csvRoutes } = parseCSV(result);
          setSections(csvSections);
          setRoutes(csvRoutes);
        }
      } catch (error) {
        alert(`CSV PARSE ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
  };

  return {
    sections, setSections, addSection, removeSection, updateSection,
    routes, setRoutes, addRoute, removeRoute, updateRoute, updateDataPoint,
    uiSettings, setUiSettings,
    viewMode, setViewMode,
    currentSectionIndex, setCurrentSectionIndex,
    showBioMonitor, setShowBioMonitor,
    showResources, setShowResources,
    tooltip, setTooltip,
    activeTab, setActiveTab,
    showTutorial, setShowTutorial, completeTutorial,
    isPrinting, setIsPrinting,
    exportData, importData,
    importCSV,
    appMode, setAppMode,
    savedGraphs, saveGraph, loadGraph, deleteGraph,
    showLibrary, setShowLibrary,
  };
}
