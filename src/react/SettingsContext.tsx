import React, { createContext, useContext, useState } from 'react';

// Types ----------------------------------------------------
type Provider = 'google' | 'ollama' | 'openai' | 'x' | 'anthropic';

interface SettingsContextProps {
  backgroundImage: string;
  chatNodeColor: string;
  fontColor: string;
  provider: Provider;
  setFontColor: (color: string) => void;
  setBackgroundImage: (url: string) => void;
  setChatNodeColor: (color: string) => void;
  setProvider: (provider: Provider) => void;
}

// Context --------------------------------------------------
const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialise from localStorage (fallback to defaults)
  const [backgroundImage, setBackgroundImage] = useState<string>(() => {
    return localStorage.getItem('viz_bg') ?? '#ffffff';
  });
  const [chatNodeColor, setChatNodeColor] = useState<string>(() => {
    return localStorage.getItem('viz_node_color') ?? 'rgba(0, 0, 0, 0.7)';
  });
  const [fontColor, setFontColor] = useState<string>(() => {
    return localStorage.getItem('viz_font_color') ?? '#ffffff';
  });
  const [provider, setProvider] = useState<Provider>(() => {
    return (localStorage.getItem('viz_provider') as Provider) ?? 'google';
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

  React.useEffect(() => {
    localStorage.setItem('viz_provider', provider);
  }, [provider]);

  return (
    <SettingsContext.Provider
      value={{
        backgroundImage,
        chatNodeColor,
        fontColor,
        provider,
        setBackgroundImage,
        setChatNodeColor,
        setFontColor,
        setProvider,
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
