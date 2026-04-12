import { useState, useEffect } from 'react';
import { RouteData, Section, UISettings, ViewMode, TooltipInfo, AppMode, ChordSettings, StringConfig } from '../types';

const INITIAL_SECTIONS: Section[] = [
  { name: 'SEC-1', color: '#00ffcc', shadowColor: '#00ffcc', glowIntensity: 4, isAnchored: true, isMinimalShadow: false },
  { name: 'SEC-2', color: '#00ffcc', shadowColor: '#00ffcc', glowIntensity: 4, isAnchored: true, isMinimalShadow: false },
  { name: 'SEC-3', color: '#00ffcc', shadowColor: '#00ffcc', glowIntensity: 4, isAnchored: true, isMinimalShadow: false },
  { name: 'SEC-4', color: '#00ffcc', shadowColor: '#00ffcc', glowIntensity: 4, isAnchored: true, isMinimalShadow: false },
  { name: 'SEC-5', color: '#00ffcc', shadowColor: '#00ffcc', glowIntensity: 4, isAnchored: true, isMinimalShadow: false }
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
  backgroundPattern: 'STANDARD'
};

const DEFAULT_F_CHORD: ChordSettings = {
  chordName: 'F',
  startFret: 1,
  numFrets: 4,
  strings: [
    { state: 'played', fret: 1, finger: 1 }, // Low E
    { state: 'played', fret: 1, finger: 1 }, // A
    { state: 'played', fret: 2, finger: 2 }, // D
    { state: 'played', fret: 3, finger: 4 }, // G
    { state: 'played', fret: 3, finger: 3 }, // B
    { state: 'played', fret: 1, finger: 1 }, // High e
  ],
  dotColor: '#00ffcc',
  labelColor: '#000000',
  stringColor: '#4a4a4a',
  fretColor: '#4a4a4a',
  bgColor: '#0a0a12',
  woodColor: '#1a1a2e',
  showFingerNumbers: true,
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
    return saved ? JSON.parse(saved) : INITIAL_UI_SETTINGS;
  });

  const [viewMode, setViewMode] = useState<ViewMode>('EVOLUTION');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showBioMonitor, setShowBioMonitor] = useState(false);
  const [showResources, setShowResources] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    const saved = localStorage.getItem('aeter_has_seen_tutorial');
    return !saved;
  });

  const [appMode, setAppMode] = useState<AppMode | null>(() => {
    const saved = localStorage.getItem('aeter_app_mode');
    return (saved as AppMode) || null;
  });

  const [chordSettings, setChordSettings] = useState<ChordSettings>(() => {
    const saved = localStorage.getItem('aeter_chord_settings');
    return saved ? JSON.parse(saved) : DEFAULT_F_CHORD;
  });

  const completeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('aeter_has_seen_tutorial', 'true');
  };

  const [activeTab, setActiveTab] = useState<string>('GLOBAL');

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
    localStorage.setItem('aeter_chord_settings', JSON.stringify(chordSettings));
  }, [chordSettings]);

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

  const updateStringConfig = (stringIndex: number, updates: Partial<StringConfig>) => {
    setChordSettings(prev => {
      const newStrings = [...prev.strings];
      newStrings[stringIndex] = { ...newStrings[stringIndex], ...updates };
      return { ...prev, strings: newStrings };
    });
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
    exportData, importData,
    appMode, setAppMode,
    chordSettings, setChordSettings, updateStringConfig,
  };
}
