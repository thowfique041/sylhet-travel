import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, fallbackFor } from '@/lib/api';

const cache = new Map<string, unknown>();

export function invalidate(prefix = '') {
  for (const k of [...cache.keys()]) if (k.startsWith(prefix)) cache.delete(k);
}

/** Small cached GET hook. Public content falls back to bundled data if the API is down. */
export function useData<T>(path: string | null) {
  // Public content renders at once from the bundled copy, then refreshes from the API.
  const [data, setData] = useState<T | undefined>(() => (path ? ((cache.get(path) ?? fallbackFor(path)) as T | undefined) : undefined));
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(!data && !!path);

  const load = useCallback(async () => {
    if (!path) return;
    setLoading((l) => l);
    try {
      const d = await api<T>(path);
      cache.set(path, d);
      setData(d);
      setError(null);
    } catch (e) {
      const fb = (e as ApiError).status === 0 || (e as ApiError).status >= 500 ? (fallbackFor(path) as T | undefined) : undefined;
      if (fb !== undefined) {
        setData(fb);
        setError(null);
      } else setError(e as ApiError);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (!path) return;
    const hit = cache.get(path) as T | undefined;
    if (hit) {
      setData(hit);
      setLoading(false);
    } else {
      const fb = fallbackFor(path) as T | undefined;
      if (fb !== undefined) {
        setData(fb);
        setLoading(false);
      }
      void load();
    }
  }, [path, load]);

  return { data, error, loading, reload: load };
}
