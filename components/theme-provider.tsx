'use client';

import {createContext, useContext, useLayoutEffect, useState, type ReactNode} from 'react';

type Theme = 'light' | 'dark';
const storageKey = 'classcode-theme';
const ThemeContext = createContext({theme: 'dark' as Theme, toggleTheme: () => {}});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({children}: {children: ReactNode}) {
  const [theme, setTheme] = useState<Theme>('dark');

  function applyTheme(next: Theme) {
    document.documentElement.dataset.theme = next;
    setTheme(next);
  }

  useLayoutEffect(() => {
    try {
      applyTheme(localStorage.getItem(storageKey) === 'light' ? 'light' : 'dark');
    } catch {
      applyTheme('dark');
    }
    function syncTheme(event: StorageEvent) {
      if (event.key === storageKey) applyTheme(event.newValue === 'light' ? 'light' : 'dark');
    }
    window.addEventListener('storage', syncTheme);
    return () => window.removeEventListener('storage', syncTheme);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(storageKey, next); } catch {}
  }

  return <ThemeContext.Provider value={{theme, toggleTheme}}>{children}</ThemeContext.Provider>;
}
