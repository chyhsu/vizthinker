import React, { createContext, useContext, useState } from 'react';

// Types ----------------------------------------------------
type Provider = 'google' | 'ollama' | 'openai' | 'x' | 'anthropic';

interface ApiKeys {
  google: string;
  openai: string;
  anthropic: string;
  x: string;
}

interface ProviderModels {
  google: string;
  openai: string;
  anthropic: string;
  x: string;
  ollama: string;
}

interface SettingsContextProps {
  backgroundImage: string;
  chatNodeColor: string;
  fontColor: string;
  provider: Provider;
  apiKeys: ApiKeys;
  providerModels: ProviderModels;
  setFontColor: (color: string) => void;
  setBackgroundImage: (url: string) => void;
  setChatNodeColor: (color: string) => void;
  setProvider: (provider: Provider) => void;
  setApiKey: (provider: keyof ApiKeys, key: string) => void;
  setApiKeys: (keys: Partial<ApiKeys>) => void;
  setProviderModel: (provider: keyof ProviderModels, model: string) => void;
  setProviderModels: (models: Partial<ProviderModels>) => void;
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
    return (localStorage.getItem('viz_provider') as Provider) ?? 'ollama';
  });
  const [apiKeys, setApiKeysState] = useState<ApiKeys>(() => {
    try {
      const stored = localStorage.getItem('viz_api_keys');
      return stored ? JSON.parse(stored) : {
        google: '',
        openai: '',
        anthropic: '',
        x: ''
      };
    } catch {
      return {
        google: '',
        openai: '',
        anthropic: '',
        x: ''
      };
    }
  });
  const [providerModels, setProviderModelsState] = useState<ProviderModels>(() => {
    try {
      const stored = localStorage.getItem('viz_provider_models');
      return stored ? JSON.parse(stored) : {
        google: 'gemini-1.5-flash',
        openai: 'gpt-4o',
        anthropic: 'claude-3-5-sonnet-20241022',
        x: 'grok-beta',
        ollama: 'gemma3n:latest'
      };
    } catch {
      return {
        google: 'gemini-1.5-flash',
        openai: 'gpt-4o',
        anthropic: 'claude-3-5-sonnet-20241022',
        x: 'grok-beta',
        ollama: 'gemma3n:latest'
      };
    }
  });

  // Helper function to set individual API key
  const setApiKey = (provider: keyof ApiKeys, key: string) => {
    setApiKeysState(prev => ({
      ...prev,
      [provider]: key
    }));
  };

  // Helper function to set multiple API keys
  const updateApiKeys = (keys: Partial<ApiKeys>) => {
    setApiKeysState(prev => ({
      ...prev,
      ...keys
    }));
  };

  // Helper function to set individual provider model
  const setProviderModel = (provider: keyof ProviderModels, model: string) => {
    setProviderModelsState(prev => ({
      ...prev,
      [provider]: model
    }));
  };

  // Helper function to set multiple provider models
  const updateProviderModels = (models: Partial<ProviderModels>) => {
    setProviderModelsState(prev => ({
      ...prev,
      ...models
    }));
  };

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

  React.useEffect(() => {
    localStorage.setItem('viz_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  React.useEffect(() => {
    localStorage.setItem('viz_provider_models', JSON.stringify(providerModels));
  }, [providerModels]);

  return (
    <SettingsContext.Provider
      value={{
        backgroundImage,
        chatNodeColor,
        fontColor,
        provider,
        apiKeys,
        providerModels,
        setBackgroundImage,
        setChatNodeColor,
        setFontColor,
        setProvider,
        setApiKey,
        setApiKeys: updateApiKeys,
        setProviderModel,
        setProviderModels: updateProviderModels,
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
