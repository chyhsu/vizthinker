import sunset from '../asset/images/20200916_174140.jpg';
import grassland from '../asset/images/IMG_3995.png';
import sea from '../asset/images/IMG_4013.png';
import defaultBg from '../asset/images/Icon.jpg';

// Default configuration values
export const DEFAULT_SETTINGS = {
  COLOR: 'rgba(0, 0, 0, 0.7)',
  BACKGROUND: '#ffffff',
  FONT_COLOR: '#ffffff',
  PROVIDER: 'google',
  OPACITY: 0.7,
} as const;

// Background options for the settings dropdown
export const BACKGROUND_OPTIONS = [
  { value: '#ffffff', label: 'White' },
  { value: '#000000', label: 'Black' },
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
] as const;

// Color parsing and conversion utilities
export const COLOR_UTILS = {
  // Helper to convert stored rgba color into hex + opacity for the UI controls
  parseRgba: (rgba: string): { hex: string; opacity: number } => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([0-9.]+)?\)/);
    if (!match) return { hex: '#000000', opacity: 1 };
    const r = Number(match[1]);
    const g = Number(match[2]);
    const b = Number(match[3]);
    const a = match[4] !== undefined ? Number(match[4]) : 1;
    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return { hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`, opacity: a };
  },

  // Utility to blend hex color with opacity
  hexToRgba: (hex: string, opacity: number): string => {
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
} as const;

// Toast notification messages
export const TOAST_MESSAGES = {
  CLEAR_SUCCESS: {
    title: "Success",
    description: "All conversation records have been cleared successfully.",
    status: "success" as const,
    duration: 3000,
    isClosable: true,
  },
  CLEAR_ERROR: {
    title: "Error",
    description: "Failed to clear conversation records. Please try again.",
    status: "error" as const,
    duration: 3000,
    isClosable: true,
  },
} as const;

// Special background values
export const SPECIAL_BACKGROUNDS = {
  PURE_BLACK: '#000000',
  PURE_WHITE: '#ffffff',
} as const;
