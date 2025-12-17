import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

const THEME_KEY = '@henteklar_theme';

// Lyse farger (standard)
const lightColors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  accent: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#E85A4F',
    400: '#dc4035',
    500: '#c92d22',
    600: '#a62119',
    700: '#8a1d17',
    800: '#721c18',
    900: '#5f1d1a',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  amber: {
    100: '#fef3c7',
    700: '#b45309',
  },
  white: '#ffffff',
  background: '#fafafa',
  card: '#ffffff',
  text: '#262626',
  textSecondary: '#737373',
  border: '#e5e5e5',
};

// Mørke farger
const darkColors = {
  primary: {
    50: '#1e3a5f',
    100: '#1e4a7a',
    200: '#2563a0',
    300: '#3b82c6',
    400: '#60a5fa',
    500: '#93c5fd',
    600: '#bfdbfe',
    700: '#dbeafe',
    800: '#eff6ff',
    900: '#f8fafc',
  },
  accent: {
    50: '#4a1515',
    100: '#5f1d1a',
    200: '#721c18',
    300: '#E85A4F',
    400: '#ef6b61',
    500: '#f87171',
    600: '#fca5a5',
    700: '#fecaca',
    800: '#fee2e2',
    900: '#fef2f2',
  },
  success: {
    50: '#14332d',
    100: '#166534',
    200: '#15803d',
    300: '#16a34a',
    400: '#22c55e',
    500: '#4ade80',
    600: '#86efac',
    700: '#bbf7d0',
    800: '#dcfce7',
    900: '#f0fdf4',
  },
  neutral: {
    50: '#171717',
    100: '#262626',
    200: '#404040',
    300: '#525252',
    400: '#737373',
    500: '#a3a3a3',
    600: '#d4d4d4',
    700: '#e5e5e5',
    800: '#f5f5f5',
    900: '#fafafa',
  },
  red: {
    50: '#450a0a',
    100: '#7f1d1d',
    500: '#ef4444',
    600: '#f87171',
    700: '#fca5a5',
  },
  amber: {
    100: '#78350f',
    700: '#fcd34d',
  },
  white: '#1a1a1a',
  background: '#0a0a0a',
  card: '#1a1a1a',
  text: '#f5f5f5',
  textSecondary: '#a3a3a3',
  border: '#404040',
};

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
  const [isLoading, setIsLoading] = useState(true);

  // Last inn lagret tema ved oppstart
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error('Feil ved lasting av tema:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (mode) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Feil ved lagring av tema:', error);
    }
  };

  // Bestem faktisk tema basert på modus
  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  // Toggle mellom lys og mørk modus
  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setTheme(newMode);
  };

  const colors = isDark ? darkColors : lightColors;

  const value = {
    themeMode,
    setTheme,
    toggleTheme,
    isDark,
    colors,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme må brukes innenfor ThemeProvider');
  }
  return context;
}

export { lightColors, darkColors };
