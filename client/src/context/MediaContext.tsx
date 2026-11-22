import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type MediaMap = Record<string, { url: string; w: number }>;
const Ctx = createContext<MediaMap>({});

/** Loads the Cloudinary media map once, so every photo on the site is served from Cloudinary. */
export function MediaProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<MediaMap>({});
  useEffect(() => {
    fetch('/api/media')
      .then((r) => (r.ok ? r.json() : {}))
      .then(setMap)
      .catch(() => {});
  }, []);
  return <Ctx.Provider value={map}>{children}</Ctx.Provider>;
}

export const useMedia = () => useContext(Ctx);
