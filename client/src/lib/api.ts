import * as seed from '@shared/seed';

const TOKEN_KEY = 'sylhet.token';

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t: string | null) => {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = tokenStore.get();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let body = init.body;
  if (init.json !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(init.json);
  }
  let res: Response;
  try {
    res = await fetch(`/api${path}`, { ...init, headers, body });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (data as { error?: string }).error ?? `Request failed (${res.status})`, (data as { code?: string }).code);
  return data as T;
}

/**
 * Read-only fallbacks so the public guide still renders when the API is
 * unreachable (for example during local frontend-only development).
 */
const FALLBACK: Record<string, unknown> = {
  '/slides': seed.SLIDES,
  '/destinations': seed.DESTINATIONS,
  '/categories': seed.CATEGORIES,
  '/places': seed.PLACES,
  '/posts': seed.POSTS,
  '/experiences': seed.EXPERIENCES,
  '/foods': seed.FOODS,
  '/gems': seed.GEMS,
};

export function fallbackFor(path: string): unknown {
  const [base, query = ''] = path.split('?');
  const q = new URLSearchParams(query);
  if (base === '/places' && (q.get('kind') || q.get('destination'))) {
    return seed.PLACES.filter((p) => (!q.get('kind') || p.kind === q.get('kind')) && (!q.get('destination') || p.destinationSlug === q.get('destination')));
  }
  if (FALLBACK[base]) return FALLBACK[base];
  const d = base.match(/^\/destinations\/([^/]+)$/);
  if (d) return seed.DESTINATIONS.find((x) => x.slug === d[1]);
  const p = base.match(/^\/posts\/([^/]+)$/);
  if (p) return seed.POSTS.find((x) => x.slug === p[1]);
  return undefined;
}
