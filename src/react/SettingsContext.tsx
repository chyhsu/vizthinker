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
  // Default values replicate the current hard-coded styling
  const [backgroundImage, setBackgroundImage] = useState<string>('grid');
  const [chatNodeColor, setChatNodeColor] = useState<string>('rgba(1, 3, 7, 0.2)');
  const [fontColor, setFontColor] = useState<string>('#ffffff');
  const [provider, setProvider] = useState<Provider>('google');


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
