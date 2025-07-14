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
    // Initialise from localStorage (fallback to defaults)
  const [backgroundImage, setBackgroundImage] = useState<string>(() => {
    return localStorage.getItem('viz_bg') ?? 'default';
  });
  const [chatNodeColor, setChatNodeColor] = useState<string>(() => {
    return localStorage.getItem('viz_node_color') ?? 'rgba(1, 3, 7, 0.2)';
  });
  const [fontColor, setFontColor] = useState<string>(() => {
    return localStorage.getItem('viz_font_color') ?? '#000000';
  });


  // Persist to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('viz_bg', backgroundImage);
  }, [backgroundImage]);

  React.useEffect(() => {
    localStorage.setItem('viz_node_color', chatNodeColor);
  }, [chatNodeColor]);

  React.useEffect(() => {
    localStorage.setItem('viz_font_color', fontColor);
  }, [fontColor]);

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
