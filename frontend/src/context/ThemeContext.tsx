import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, ThemeMode } from '../types';

const THEME_STORAGE_KEY = '@student_mgmt_theme_mode';

const lightPalette: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  border: '#E2E8F0',
  badge: '#E0E7FF',
  badgeText: '#3730A3',
  error: '#EF4444',
  success: '#10B981',
  card: '#FFFFFF',
  accent: '#F59E0B',
};

const darkPalette: ThemeColors = {
  background: '#0B0F19',
  surface: '#151C2C',
  surfaceElevated: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#6366F1',
  primaryLight: '#262F4A',
  border: '#273349',
  badge: '#312E81',
  badgeText: '#C7D2FE',
  error: '#F87171',
  success: '#34D399',
  card: '#151C2C',
  accent: '#FBBF24',
};

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setMode(savedTheme);
        }
      } catch (err) {
        console.error('Failed to restore theme preference:', err);
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const nextMode: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setMode(nextMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch (err) {
      console.error('Failed to persist theme preference:', err);
    }
  };

  const colors = useMemo(() => (mode === 'light' ? lightPalette : darkPalette), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, isDark: mode === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
