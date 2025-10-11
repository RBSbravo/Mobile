import React, { createContext, useState, useContext, useMemo } from 'react';
import { lightTheme, darkTheme } from '../theme';

export const ThemeContext = createContext({
  theme: lightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved theme preference
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedTheme = localStorage.getItem('mito-theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
    }
    // Default to system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Save theme preference
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('mito-theme', newTheme ? 'dark' : 'light');
    }
  };

  const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, dark: isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}; 