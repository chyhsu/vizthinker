import React, { createContext, useContext, useState } from 'react';

// Types ----------------------------------------------------
interface SettingsContextProps {
  backgroundImage: string;
  chatNodeColor: string;
  fontColor: string;
  setFontColor: (color: string) => void;
  setBackgroundImage: (url: string) => void;
  setChatNodeColor: (color: string) => void;
}

// Context --------------------------------------------------
const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default values replicate the current hard-coded styling
  const [backgroundImage, setBackgroundImage] = useState<string>('grid');
  const [chatNodeColor, setChatNodeColor] = useState<string>('rgba(1, 3, 7, 0.2)');
  const [fontColor, setFontColor] = useState<string>('#ffffff');


  return (
    <SettingsContext.Provider
      value={{
        backgroundImage,
        chatNodeColor,
        fontColor,
        setBackgroundImage,
        setChatNodeColor,
        setFontColor,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextProps => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
};
