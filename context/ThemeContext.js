// context/ThemeContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  GREEN: 'green',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || THEMES.LIGHT;
    }
    return THEMES.LIGHT;
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('light', 'dark', 'green');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    if (newTheme && Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
    } else {
      const values = Object.values(THEMES);
      const currentIndex = values.indexOf(theme);
      setTheme(values[(currentIndex + 1) % values.length]);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}