import { useState, useEffect } from 'react';
import { RouteData, Section, UISettings, ViewMode, TooltipInfo, AppMode, SavedGraph, GraphDoc, GifFrame } from '../types';
import { parseCSV } from '../utils/csv';

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
  showSectionLabels: true,
  showAreaTexture: false,
  showPointValues: false
};

const newDocId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const createDefaultDoc = (name: string): GraphDoc => ({
  id: newDocId(),
  name,
  sections: JSON.parse(JSON.stringify(INITIAL_SECTIONS)),
  routes: JSON.parse(JSON.stringify(INITIAL_ROUTES)),
  uiSettings: JSON.parse(JSON.stringify(INITIAL_UI_SETTINGS)),
  viewMode: 'EVOLUTION',
  currentSectionIndex: 0,
});

function loadInitialDocs(): GraphDoc[] {
  const saved = localStorage.getItem('aeter_docs');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // fall through to legacy migration / defaults
    }
  }

  // Migrate the pre-tabs single-graph storage into a single doc, so existing work isn't lost.
  const legacySections = localStorage.getItem('aeter_sections');
  const legacyRoutes = localStorage.getItem('aeter_routes');
  const legacyUi = localStorage.getItem('aeter_uisettings');
  if (legacySections || legacyRoutes || legacyUi) {
    return [{
      id: newDocId(),
      name: 'GRAPH 1',
      sections: legacySections ? JSON.parse(legacySections) : INITIAL_SECTIONS,
      routes: legacyRoutes ? JSON.parse(legacyRoutes) : INITIAL_ROUTES,
      uiSettings: legacyUi ? { ...INITIAL_UI_SETTINGS, ...JSON.parse(legacyUi) } : INITIAL_UI_SETTINGS,
      viewMode: 'EVOLUTION',
      currentSectionIndex: 0,
    }];
  }

  return [createDefaultDoc('GRAPH 1')];
}

export function useAeterData() {
  const [docs, setDocs] = useState<GraphDoc[]>(loadInitialDocs);
  const [activeDocId, setActiveDocId] = useState<string>(() => docs[0].id);

  const activeDoc = docs.find(d => d.id === activeDocId) ?? docs[0];
  const { sections, routes, uiSettings, viewMode, currentSectionIndex } = activeDoc;

  // Applies an update to whichever doc is active right now — using the functional setDocs
  // form so several calls in the same tick (e.g. a spreadsheet-style paste) all land instead
  // of each one clobbering the last based on a stale `docs` snapshot.
  const updateActiveDoc = (updater: (doc: GraphDoc) => GraphDoc) => {
    setDocs(prev => prev.map(d => d.id === activeDocId ? updater(d) : d));
  };

  const setSections = (next: Section[]) => updateActiveDoc(d => ({ ...d, sections: next }));
  const setRoutes = (next: RouteData[] | ((prev: RouteData[]) => RouteData[])) =>
    updateActiveDoc(d => ({ ...d, routes: typeof next === 'function' ? (next as (prev: RouteData[]) => RouteData[])(d.routes) : next }));
  const setUiSettings = (next: UISettings) => updateActiveDoc(d => ({ ...d, uiSettings: next }));
  const setViewMode = (next: ViewMode) => updateActiveDoc(d => ({ ...d, viewMode: next }));
  const setCurrentSectionIndex = (next: number) => updateActiveDoc(d => ({ ...d, currentSectionIndex: next }));

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

  // GIF Studio — capture the graph area as a frame, tweak each one's duration, export as a GIF.
  const [gifFrames, setGifFrames] = useState<GifFrame[]>([]);
  const [showGifStudio, setShowGifStudio] = useState(false);
  const [gifDefaultDuration, setGifDefaultDuration] = useState(500);

  const addGifFrame = (dataUrl: string, duration?: number) => {
    setGifFrames(prev => [...prev, { id: newDocId(), dataUrl, duration: duration ?? gifDefaultDuration }]);
  };
  const removeGifFrame = (id: string) => setGifFrames(prev => prev.filter(f => f.id !== id));
  const updateGifFrameDuration = (id: string, duration: number) => setGifFrames(prev => prev.map(f => f.id === id ? { ...f, duration } : f));
  const clearGifFrames = () => setGifFrames([]);

  // Persistence
  useEffect(() => {
    localStorage.setItem('aeter_docs', JSON.stringify(docs));
  }, [docs]);

  useEffect(() => {
    if (appMode) localStorage.setItem('aeter_app_mode', appMode);
  }, [appMode]);

  useEffect(() => {
    localStorage.setItem('aeter_library', JSON.stringify(savedGraphs));
  }, [savedGraphs]);

  // Tabs — several graphs open at once, each with its own live-editable state
  const addTab = () => {
    const doc = createDefaultDoc(`GRAPH ${docs.length + 1}`);
    setDocs(prev => [...prev, doc]);
    setActiveDocId(doc.id);
  };

  const closeTab = (id: string) => {
    setDocs(prev => {
      const idx = prev.findIndex(d => d.id === id);
      if (idx === -1) return prev;
      const next = prev.filter(d => d.id !== id);
      if (next.length === 0) {
        const fresh = createDefaultDoc('GRAPH 1');
        setActiveDocId(fresh.id);
        return [fresh];
      }
      if (id === activeDocId) {
        const neighbor = next[Math.max(0, idx - 1)];
        setActiveDocId(neighbor.id);
      }
      return next;
    });
  };

  const switchDoc = (id: string) => {
    if (docs.some(d => d.id === id)) setActiveDocId(id);
  };

  const renameDoc = (id: string, name: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, name: name.toUpperCase() || d.name } : d));
  };

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

  // Loading a library entry opens it as a new tab, alongside whatever is already open.
  const loadGraph = (id: string) => {
    const graph = savedGraphs.find(g => g.id === id);
    if (!graph) return;
    const doc: GraphDoc = {
      id: newDocId(),
      name: graph.name,
      sections: JSON.parse(JSON.stringify(graph.sections)),
      routes: JSON.parse(JSON.stringify(graph.routes)),
      uiSettings: JSON.parse(JSON.stringify(graph.uiSettings)),
      viewMode: graph.viewMode,
      currentSectionIndex: 0,
    };
    setDocs(prev => [...prev, doc]);
    setActiveDocId(doc.id);
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
    setRoutes(prev => prev.map(r => {
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
    docs, activeDocId, addTab, closeTab, switchDoc, renameDoc,
    gifFrames, addGifFrame, removeGifFrame, updateGifFrameDuration, clearGifFrames,
    showGifStudio, setShowGifStudio, gifDefaultDuration, setGifDefaultDuration,
  };
}
