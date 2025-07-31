/**
 * API configuration
 * Automatically select API URL based on environment
 */

export function getBaseApiUrl(): string {
  // In production, return the current server address
  if (import.meta.env.PROD) {
    return 'http://140.114.88.157:8000';
  }
  
  // Development environment
  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:8000';
  }
  
  // Default return localhost
  return 'http://127.0.0.1:8000';
}

export const API_BASE_URL = getBaseApiUrl();

// API endpoints
export const API_ENDPOINTS = {
  CHAT: `${API_BASE_URL}/chat`,
  CHAT_POSITIONS: `${API_BASE_URL}/chat/positions`,
  CHAT_RECORDS: `${API_BASE_URL}/chat/records`,
  WELCOME: `${API_BASE_URL}/welcome`,
  MARKDOWN: `${API_BASE_URL}/markdown`,
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_SIGNUP: `${API_BASE_URL}/auth/signup`,
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  SETTINGS_API_KEYS: `${API_BASE_URL}/settings/api-keys`,
  HEALTH: `${API_BASE_URL}/health`,
} as const;

// Debug info (development only)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
  console.log('Environment:', import.meta.env.MODE);
}
