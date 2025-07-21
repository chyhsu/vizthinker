import sunset from '../asset/images/20200916_174140.jpg';
import grassland from '../asset/images/IMG_3995.png';
import sea from '../asset/images/IMG_4013.png';
import defaultBg from '../asset/images/Icon.jpg';

// Default configuration values
export const DEFAULT_SETTINGS = {
  COLOR: 'rgba(0, 0, 0, 0.7)',
  BACKGROUND: '#ffffff',
  FONT_COLOR: '#ffffff',
  PROVIDER: 'ollama',
  OPACITY: 0.7,
  PROVIDER_MODELS: {
    google: 'gemini-1.5-flash-latest',
    openai: 'gpt-4o',
    anthropic: 'claude-3-5-sonnet-20240620',
    x: 'grok-1',
    ollama: 'gemma3n:latest'
  }
} as const;

// Background options for the settings dropdown
export const BACKGROUND_OPTIONS = [
  { value: '#ffffff', label: 'Pure White' },
  { value: '#000000', label: 'Pure Black' },
  { value: sunset, label: 'Sunset' },
  { value: grassland, label: 'Grassland' },
  { value: sea, label: 'Sea' },
  { value: defaultBg, label: 'Default' },
] as const;

// AI Provider options for the settings dropdown
export const PROVIDER_OPTIONS = [
  { value: 'google', label: 'Google' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'ollama', label: 'Ollama' },
] as const;

// Model options for each provider
export const MODEL_OPTIONS = {
  google: [
    { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro' },
  ],
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  anthropic: [
    { value: 'claude-3-5-sonnet-20240620', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
  ],
  x: [
    { value: 'grok-1', label: 'Grok-1' },
  ],
  ollama: [
    { value: 'gemma2:latest', label: 'Gemma 2' },
    { value: 'gemma3n:latest', label: 'Gemma 3n' },
    { value: 'llama3.2:latest', label: 'Llama 3.2' },
    { value: 'llama3:latest', label: 'Llama 3' },
  ],
} as const;

// API Key configuration for each provider
export const API_KEY_CONFIG = {
  google: {
    label: 'Google Gemini API Key',
    placeholder: 'Enter your Google Gemini API key',
    helpText: 'Get your API key from Google AI Studio',
    helpUrl: 'https://makersuite.google.com/app/apikey',
  },
  openai: {
    label: 'OpenAI API Key',
    placeholder: 'Enter your OpenAI API key (sk-...)',
    helpText: 'Get your API key from OpenAI platform',
    helpUrl: 'https://platform.openai.com/api-keys',
  },
  anthropic: {
    label: 'Anthropic Claude API Key',
    placeholder: 'Enter your Anthropic API key',
    helpText: 'Get your API key from Anthropic Console',
    helpUrl: 'https://console.anthropic.com/',
  },
  x: {
    label: 'X (Grok) API Key',
    placeholder: 'Enter your X API key',
    helpText: 'Get your API key from X Developer Platform',
    helpUrl: 'https://developer.x.ai/',
  },
} as const;

// Special backgrounds
export const SPECIAL_BACKGROUNDS = {
  PURE_BLACK: '#000000',
  PURE_WHITE: '#ffffff',
} as const;

// Color utilities
export const COLOR_UTILS = {
  parseRgba: (rgba: string) => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      const [, r, g, b, a = '1'] = match;
      return {
        hex: `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`,
        opacity: parseFloat(a),
      };
    }
    // Fallback for hex colors
    return {
      hex: rgba.startsWith('#') ? rgba : '#000000',
      opacity: 0.7,
    };
  },
  hexToRgba: (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
} as const;

// Toast messages
export const TOAST_MESSAGES = {
  CLEAR_SUCCESS: {
    title: "Success",
    description: "All conversation records have been cleared",
    status: "success" as const,
    duration: 3000,
    isClosable: true,
  },
  CLEAR_ERROR: {
    title: "Error",
    description: "Failed to clear conversation records",
    status: "error" as const,
    duration: 3000,
    isClosable: true,
  },
  API_KEY_SAVED: {
    title: "API Key Saved",
    description: "Your API key has been saved securely",
    status: "success" as const,
    duration: 3000,
    isClosable: true,
  },
  SETTINGS_SAVED: {
    title: "Settings Saved",
    description: "Your settings have been applied successfully",
    status: "success" as const,
    duration: 3000,
    isClosable: true,
  },
} as const;

// API Key utilities
export const API_KEY_UTILS = {
  maskApiKey: (key: string) => {
    if (!key || key.length < 8) return key;
    return key.slice(0, 4) + '•'.repeat(Math.min(20, key.length - 8)) + key.slice(-4);
  },
  validateApiKey: (provider: string, key: string) => {
    if (!key) return false;
    
    switch (provider) {
      case 'openai':
        return key.startsWith('sk-') && key.length > 20;
      case 'google':
        return key.length > 20; // Google API keys are typically 39 characters
      case 'anthropic':
        return key.startsWith('sk-ant-') && key.length > 20;
      case 'x':
        return key.length > 10; // Basic validation for X API keys
      case 'ollama':
        return true; // Ollama doesn't require API keys
      default:
        return key.length > 5; // Basic fallback validation
    }
  },
  getProviderLabel: (provider: string) => {
    const config = API_KEY_CONFIG[provider as keyof typeof API_KEY_CONFIG];
    return config?.label || provider;
  },
} as const;
