import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Itinerary } from '@shared/types';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

const KEY = 'sylhet.trip.draft';
const SAVED = 'sylhet.trips';

export const emptyTrip = (): Itinerary => ({ title: 'My Sylhet trip', days: 3, travelers: 2, stops: [], startDate: '' });

interface Ctx {
  draft: Itinerary;
  setDraft: (t: Itinerary | ((t: Itinerary) => Itinerary)) => void;
  addStop: (slug: string) => void;
  hasStop: (slug: string) => boolean;
  saved: Itinerary[];
  save: () => Promise<Itinerary>;
  remove: (id: string) => Promise<void>;
  load: (t: Itinerary) => void;
}

const TripCtx = createContext<Ctx>(null as unknown as Ctx);

const read = <T,>(k: string, fb: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fb;
  } catch {
    return fb;
  }
};
const write = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* ignore */
  }
};

/** Itinerary builder state: a working draft plus saved trips (account or browser). */
export function TripProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [draft, setDraftState] = useState<Itinerary>(() => read(KEY, emptyTrip()));
  const [saved, setSaved] = useState<Itinerary[]>(() => read(SAVED, [] as Itinerary[]));

  useEffect(() => {
    if (user) api<Itinerary[]>('/me/itineraries').then(setSaved).catch(() => {});
    else setSaved(read(SAVED, [] as Itinerary[]));
  }, [user]);

  const setDraft = useCallback((t: Itinerary | ((t: Itinerary) => Itinerary)) => {
    setDraftState((prev) => {
      const next = typeof t === 'function' ? t(prev) : t;
      write(KEY, next);
      return next;
    });
  }, []);

  const addStop = useCallback(
    (slug: string) =>
      setDraft((t) => {
        if (t.stops.some((s) => s.destinationSlug === slug)) return t;
        const day = Math.min(t.days, (t.stops.at(-1)?.day ?? 0) + 1 || 1);
        return { ...t, stops: [...t.stops, { destinationSlug: slug, day: Math.max(1, day) }] };
      }),
    [setDraft],
  );

  const save = useCallback(async () => {
    if (user) {
      const isUpdate = draft._id && saved.some((s) => s._id === draft._id);
      const body = { title: draft.title, startDate: draft.startDate, days: draft.days, travelers: draft.travelers, stops: draft.stops };
      const out = await api<Itinerary>(isUpdate ? `/me/itineraries/${draft._id}` : '/me/itineraries', { method: isUpdate ? 'PUT' : 'POST', json: body });
      setSaved((s) => (isUpdate ? s.map((x) => (x._id === out._id ? out : x)) : [...s, out]));
      setDraft(out);
      return out;
    }
    const out = { ...draft, _id: draft._id ?? `local-${Date.now()}` };
    const next = saved.some((s) => s._id === out._id) ? saved.map((s) => (s._id === out._id ? out : s)) : [...saved, out];
    setSaved(next);
    write(SAVED, next);
    setDraft(out);
    return out;
  }, [user, draft, saved, setDraft]);

  const remove = useCallback(
    async (id: string) => {
      if (user && !id.startsWith('local-')) await api(`/me/itineraries/${id}`, { method: 'DELETE' });
      const next = saved.filter((s) => s._id !== id);
      setSaved(next);
      if (!user) write(SAVED, next);
    },
    [user, saved],
  );

  const value = useMemo(
    () => ({ draft, setDraft, addStop, hasStop: (s: string) => draft.stops.some((x) => x.destinationSlug === s), saved, save, remove, load: (t: Itinerary) => setDraft(t) }),
    [draft, setDraft, addStop, saved, save, remove],
  );
  return <TripCtx.Provider value={value}>{children}</TripCtx.Provider>;
}

export const useTrip = () => useContext(TripCtx);
