import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Theme } from '@/constants/Colors';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  currentTheme: typeof Theme.light;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const systemColorScheme: ThemeMode = colorScheme === 'dark' ? 'dark' : 'light';
  const [themeMode, setThemeMode] = useState<ThemeMode>(systemColorScheme);
  const [previousSystemColorScheme, setPreviousSystemColorScheme] = useState(systemColorScheme);

  if (systemColorScheme !== previousSystemColorScheme) {
    setPreviousSystemColorScheme(systemColorScheme);
    setThemeMode(systemColorScheme);
  }

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const currentTheme = Theme[themeMode];

  return (
    <ThemeContext.Provider value={{ themeMode, currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for easy access anywhere in the app
export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProviderWrapper');
  }
  return context;
}