import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextData {
  theme: Theme;
  toggleTheme: () => void;
  colors: {
    background: string;
    text: string;
    primary: string;
    card: string;
    border: string;
    muted: string;
    success: string;
    danger: string;
  };
}

const lightColors = {
  background: '#F6F7FB',
  text: '#111827',
  primary: '#C2410C',
  card: '#FFFFFF',
  border: '#DDE2EA',
  muted: '#667085',
  success: '#0F766E',
  danger: '#B42318',
};

const darkColors = {
  background: '#111827',
  text: '#F9FAFB',
  primary: '#FB923C',
  card: '#1F2937',
  border: '#374151',
  muted: '#CBD5E1',
  success: '#2DD4BF',
  danger: '#F87171',
};

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    async function loadTheme() {
      const savedTheme = await AsyncStorage.getItem('@theme');
      if (savedTheme) {
        setTheme(savedTheme as Theme);
      }
    }
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('@theme', newTheme);
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
