import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'student_mgmt_jwt_token';

const API_BASE_URL = (process.env as Record<string, string | undefined>).EXPO_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let inMemoryToken: string | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

export const setStoredToken = async (token: string | null) => {
  inMemoryToken = token;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (token) {
          window.localStorage.setItem(TOKEN_KEY, token);
        } else {
          window.localStorage.removeItem(TOKEN_KEY);
        }
      }
      return;
    }
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (err) {
    console.warn('Token storage error (fallback to memory):', err);
  }
};

export const getStoredToken = async (): Promise<string | null> => {
  if (inMemoryToken) return inMemoryToken;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = window.localStorage.getItem(TOKEN_KEY);
        inMemoryToken = token;
        return token;
      }
      return null;
    }
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    inMemoryToken = token;
    return token;
  } catch (err) {
    console.warn('Token read error:', err);
    return null;
  }
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      await setStoredToken(null);
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);
