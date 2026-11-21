import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

const KEY = 'sylhet.favorites';

interface Ctx {
  favorites: string[];
  isFavorite: (slug: string) => boolean;
  toggle: (slug: string) => Promise<void>;
}

const FavCtx = createContext<Ctx>(null as unknown as Ctx);

const readLocal = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
};
const writeLocal = (v: string[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* ignore */
  }
};

/**
 * Favorites work signed out (saved in this browser) and move to the account
 * once the visitor signs in, merging anything saved before.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, setUser } = useAuth();
  const [local, setLocal] = useState<string[]>(readLocal);

  useEffect(() => {
    if (!user) return;
    const pending = readLocal().filter((s) => !user.favorites.includes(s));
    if (!pending.length) return;
    api<string[]>('/me/favorites/merge', { method: 'POST', json: { slugs: pending } })
      .then((favorites) => {
        setUser({ ...user, favorites });
        writeLocal([]);
        setLocal([]);
      })
      .catch(() => {});
  }, [user, setUser]);

  const favorites = user ? user.favorites : local;

  const toggle = useCallback(
    async (slug: string) => {
      const has = favorites.includes(slug);
      if (!user) {
        const next = has ? local.filter((s) => s !== slug) : [...local, slug];
        setLocal(next);
        writeLocal(next);
        return;
      }
      const optimistic = has ? user.favorites.filter((s) => s !== slug) : [...user.favorites, slug];
      setUser({ ...user, favorites: optimistic });
      try {
        const fav = await api<string[]>(`/me/favorites/${slug}`, { method: has ? 'DELETE' : 'PUT' });
        setUser({ ...user, favorites: fav });
      } catch {
        setUser(user);
      }
    },
    [favorites, user, local, setUser],
  );

  const value = useMemo(() => ({ favorites, isFavorite: (s: string) => favorites.includes(s), toggle }), [favorites, toggle]);
  return <FavCtx.Provider value={value}>{children}</FavCtx.Provider>;
}

export const useFavorites = () => useContext(FavCtx);
