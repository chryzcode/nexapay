'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { toggleTheme } from '@/app/actions/theme';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Get initial theme from cookies
    const theme = document.cookie
      .split('; ')
      .find((row) => row.startsWith('theme='))
      ?.split('=')[1] || 'light';
    
    setIsDarkMode(theme === 'dark');
    setIsInitialized(true);
  }, []);

  const handleToggleTheme = async () => {
    const { theme } = await toggleTheme();
    setIsDarkMode(theme === 'dark');
  };

  // Don't render children until theme is initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme: handleToggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 