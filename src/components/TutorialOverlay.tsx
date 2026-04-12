import React, { useState } from 'react';
import { useAeterContext } from '../context/AeterContext';
import { ChevronRight, ChevronLeft, Target, Activity, Settings, Save, X } from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    title: "MÓDULO DE ENTRENAMIENTO",
    subtitle: "INICIANDO SECUENCIA DE APRENDIZAJE",
    icon: <Target className="w-12 h-12 text-[#00ffcc] mb-4" />,
    content: "Bienvenido al Terminal NioBiologic. Este sistema táctico te permite visualizar y gestionar bio-datos en tiempo real. Este breve tutorial te guiará por las funciones principales del escáner."
  },
  {
    title: "PANEL DE CONTROL",
    subtitle: "SISTEMA IZQUIERDO",
    icon: <Settings className="w-12 h-12 text-[#ff0055] mb-4" />,
    content: "En la barra lateral izquierda encontrarás el Panel de Control. Desde aquí puedes modificar la interfaz, gestionar las Rutas (datos) y configurar las Secciones (ejes del radar). Prueba a añadir diferentes colores y ajustar la intensidad de brillo."
  },
  {
    title: "VISUALIZACIÓN MULTI-MODO",
    subtitle: "ÁREA TÁCTICA CENTRAL",
    icon: <Activity className="w-12 h-12 text-[#ffd700] mb-4" />,
    content: "Las rutas que configures se mostrarán en el centro del terminal. Puedes cambiar entre diferentes modos de vista (Evolución, Radar, Malla de Datos) usando las pestañas del panel de control para un análisis más profundo."
  },
  {
    title: "GESTIÓN DE DATOS Y BIO-MONITOR",
    subtitle: "SISTEMAS EXTREMOS",
    icon: <Save className="w-12 h-12 text-[#0088ff] mb-4" />,
    content: "En la cabecera superior tienes botones para Importar/Exportar tu configuración actual (DATACUBE) y acceder al Bio-Monitor Avanzado. Imprime tus gráficos generados para tus informes tácticos."
  }
];

export const TutorialOverlay: React.FC = () => {
  const { showTutorial, completeTutorial } = useAeterContext();
  const [currentStep, setCurrentStep] = useState(0);

  if (!showTutorial) return null;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm capture-overlay-ui">
      {/* Scanning line effect */}
      <div className="absolute inset-0 pointer-events-none border-b-2 border-[#00ffcc]/20 shadow-[0_0_20px_rgba(0,255,204,0.1)] animate-[scan_4s_ease-in-out_infinite]" />
      
      <div className="relative w-full max-w-2xl bg-[#0a0a12] border-2 border-[#00ffcc]/30 shadow-[0_0_50px_rgba(0,255,204,0.2)] p-1">
        
        {/* Decorative Corners */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[#00ffcc]" />
        <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-[#00ffcc]" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-[#00ffcc]" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[#00ffcc]" />

        <div className="bg-[#000000] p-8 relative overflow-hidden flex flex-col items-center text-center min-h-[400px]">
          
          <button 
            onClick={completeTutorial}
            className="absolute top-4 right-4 text-[#4a4a4a] hover:text-[#ff0055] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute top-4 left-4 text-[10px] text-[#00ffcc] font-mono tracking-widest">
            SEC_TUTORIAL // STEP {currentStep + 1}_0{TUTORIAL_STEPS.length}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center mt-6">
            <div className="animate-pulse">
              {step.icon}
            </div>
            <h2 className="text-2xl font-black tracking-[0.2em] text-white mb-2 font-mono">
              {step.title}
            </h2>
            <h3 className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#00ffcc] mb-8">
              {step.subtitle}
            </h3>
            
            <p className="text-sm text-[#a0a0b0] leading-relaxed max-w-lg font-mono">
              {step.content}
            </p>
          </div>

          <div className="w-full flex items-center justify-between mt-8 border-t border-[#1a1a2e] pt-6">
            
            <div className="flex gap-2">
              {TUTORIAL_STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 transition-all duration-300 ${i === currentStep ? 'w-8 bg-[#00ffcc] shadow-[0_0_10px_#00ffcc]' : 'w-4 bg-[#1a1a2e]'}`} 
                />
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`px-4 py-2 flex items-center gap-2 text-[10px] font-bold border-2 transition-all ${
                  currentStep === 0 
                  ? 'border-[#1a1a2e] text-[#4a4a4a] cursor-not-allowed' 
                  : 'border-[#00ffcc]/30 text-[#00ffcc] hover:bg-[#00ffcc]/10 hover:border-[#00ffcc] active:scale-95'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                ATRÁS
              </button>
              
              <button
                onClick={handleNext}
                className={`px-6 py-2 flex items-center gap-2 text-[10px] font-bold border-2 active:scale-95 transition-all ${
                  currentStep === TUTORIAL_STEPS.length - 1
                  ? 'bg-[#00ffcc]/10 border-[#00ffcc] text-[#00ffcc] shadow-[0_0_15px_rgba(0,255,204,0.3)] hover:bg-[#00ffcc]/20'
                  : 'border-[#00ffcc] text-[#00ffcc] hover:bg-[#00ffcc]/10 shadow-[0_0_10px_rgba(0,255,204,0.1)]'
                }`}
              >
                {currentStep === TUTORIAL_STEPS.length - 1 ? 'INICIAR SISTEMA' : 'SIGUIENTE'}
                {currentStep !== TUTORIAL_STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
