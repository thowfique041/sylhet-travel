import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import snapshot from '@/generated/media-map.json';

export type MediaMap = Record<string, { url: string; w: number }>;
const initial = snapshot as MediaMap;
const Ctx = createContext<MediaMap>(initial);

/** Loads the Cloudinary media map once, so every photo on the site is served from Cloudinary. */
export function MediaProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<MediaMap>(initial);
  useEffect(() => {
    fetch('/api/media')
      .then((r) => (r.ok ? r.json() : {}))
      .then((m: MediaMap) => Object.keys(m).length && setMap(m))
      .catch(() => {});
  }, []);
  return <Ctx.Provider value={map}>{children}</Ctx.Provider>;
}

export const useMedia = () => useContext(Ctx);
