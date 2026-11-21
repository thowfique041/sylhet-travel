import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { PublicUser } from '@shared/types';
import { api, tokenStore } from '@/lib/api';

interface Ctx {
  user: PublicUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
  register: (name: string, email: string, password: string, favorites?: string[]) => Promise<PublicUser>;
  logout: () => void;
  setUser: (u: PublicUser | null) => void;
}

const AuthCtx = createContext<Ctx>(null as unknown as Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!tokenStore.get()) {
      setReady(true);
      return;
    }
    api<PublicUser>('/auth/me')
      .then(setUser)
      .catch(() => tokenStore.set(null))
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<{ token: string; user: PublicUser }>('/auth/login', { method: 'POST', json: { email, password } });
    tokenStore.set(r.token);
    setUser(r.user);
    return r.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, favorites?: string[]) => {
    const r = await api<{ token: string; user: PublicUser }>('/auth/register', { method: 'POST', json: { name, email, password, favorites } });
    tokenStore.set(r.token);
    setUser(r.user);
    return r.user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, login, register, logout, setUser }), [user, ready, login, register, logout]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
