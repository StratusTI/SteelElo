'use client';

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Theme = 'light' | 'dark';

interface UserPreferences {
  theme: Theme;
  smoothCursor: boolean;
}

interface ThemeContextType {
  theme: Theme;
  smoothCursor: boolean;
  setTheme: (theme: Theme) => void;
  setSmoothCursor: (enabled: boolean) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'nexo-user-preferences';

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  smoothCursor: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getStoredPreferences(): UserPreferences {
  if (typeof window === 'undefined') return defaultPreferences;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        theme:
          parsed.theme === 'light' || parsed.theme === 'dark'
            ? parsed.theme
            : 'dark',
        smoothCursor:
          typeof parsed.smoothCursor === 'boolean'
            ? parsed.smoothCursor
            : false,
      };
    }
  } catch {
    // Ignore parsing errors
  }

  return defaultPreferences;
}

function storePreferences(preferences: UserPreferences): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Ignore storage errors
  }
}

function applyThemeToDOM(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}

function applySmoothCursorToDOM(enabled: boolean): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (enabled) {
    root.classList.add('smooth-cursor');
  } else {
    root.classList.remove('smooth-cursor');
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [preferences, setPreferences] =
    useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    const stored = getStoredPreferences();
    setPreferences(stored);
    applyThemeToDOM(stored.theme);
    applySmoothCursorToDOM(stored.smoothCursor);
    setMounted(true);
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, theme };
      storePreferences(newPrefs);
      applyThemeToDOM(theme);
      return newPrefs;
    });
  }, []);

  const setSmoothCursor = useCallback((enabled: boolean) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, smoothCursor: enabled };
      storePreferences(newPrefs);
      applySmoothCursorToDOM(enabled);
      return newPrefs;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(preferences.theme === 'dark' ? 'light' : 'dark');
  }, [preferences.theme, setTheme]);

  // Memoizar o value para evitar re-renders desnecessários
  const value = useMemo(
    () => ({
      theme: preferences.theme,
      smoothCursor: preferences.smoothCursor,
      setTheme,
      setSmoothCursor,
      toggleTheme,
    }),
    [
      preferences.theme,
      preferences.smoothCursor,
      setTheme,
      setSmoothCursor,
      toggleTheme,
    ],
  );

  // Value estático para antes do mount (SSR)
  const unmountedValue = useMemo(
    () => ({
      theme: 'dark' as Theme,
      smoothCursor: false,
      setTheme: () => {},
      setSmoothCursor: () => {},
      toggleTheme: () => {},
    }),
    [],
  );

  if (!mounted) {
    return (
      <ThemeContext.Provider value={unmountedValue}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
