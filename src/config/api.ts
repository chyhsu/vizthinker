/**
 * API配置文件
 * 根據環境設定API基礎URL
 */

// 根據環境決定API基礎URL
const getApiBaseUrl = (): string => {
  // 優先使用環境變量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 如果是開發環境，使用localhost
  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:8000';
  }
  
  // 生產環境使用服務器IP
  return 'http://140.114.88.157:8000';
};

export const API_BASE_URL = getApiBaseUrl();

// API端點
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

// 調試信息（僅在開發環境）
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
  console.log('Environment:', import.meta.env.MODE);
} 