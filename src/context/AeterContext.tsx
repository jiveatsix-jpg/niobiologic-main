import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAeterData } from '../hooks/useAeterData';

type AeterContextType = ReturnType<typeof useAeterData> & {
  signalStr: string;
};

const AeterContext = createContext<AeterContextType | undefined>(undefined);

export const AeterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const data = useAeterData();
  const [signalStr, setSignalStr] = useState<string>("98.4%");

  useEffect(() => {
    const interval = setInterval(() => {
      const val = (98 + Math.random() * 1.5).toFixed(1);
      setSignalStr(`${val}%`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AeterContext.Provider value={{ ...data, signalStr }}>
      {children}
    </AeterContext.Provider>
  );
};

export const useAeterContext = () => {
  const context = useContext(AeterContext);
  if (context === undefined) {
    throw new Error('useAeterContext must be used within an AeterProvider');
  }
  return context;
};
