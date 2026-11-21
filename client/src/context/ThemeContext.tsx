import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Theme } from '@shared/types';
import { THEMES } from '@shared/seed';

export const DEFAULT_THEME = THEMES.jaflong;

interface Ctx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resetTheme: () => void;
}

const ThemeCtx = createContext<Ctx>({ theme: DEFAULT_THEME, setTheme: () => {}, resetTheme: () => {} });

function apply(t: Theme) {
  const s = document.documentElement.style;
  s.setProperty('--c-deep', t.deep);
  s.setProperty('--c-mist', t.mist);
  s.setProperty('--c-accent', t.accent);
  s.setProperty('--c-stone', t.stone);
  s.setProperty('--c-glow', t.glow);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.deep);
}

/**
 * The theme engine. Any page can hand it a destination palette; CSS registered
 * custom properties interpolate the change across the entire UI.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, set] = useState<Theme>(DEFAULT_THEME);
  const setTheme = useCallback((t: Theme) => {
    set((prev) => {
      if (prev.deep === t.deep && prev.accent === t.accent && prev.mist === t.mist) return prev;
      apply(t);
      return t;
    });
  }, []);
  const resetTheme = useCallback(() => setTheme(DEFAULT_THEME), [setTheme]);
  const value = useMemo(() => ({ theme, setTheme, resetTheme }), [theme, setTheme, resetTheme]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
