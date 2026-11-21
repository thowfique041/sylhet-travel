import type { Photo } from '@shared/types';

/** Thumbnail widths Wikimedia serves for hotlinking (tested in the browser). */
const BUCKETS = [960, 1280, 1920] as const;
const BASE = 'https://upload.wikimedia.org/wikipedia/commons';

export type PhotoLike = Photo & { url?: string };

const encode = (path: string) => path.split('/').map(encodeURIComponent).join('/');

export function originalUrl(p: PhotoLike) {
  if (p.url) return p.url;
  return `${BASE}/${encode(p.path)}`;
}

/** URL for a given target width, never larger than the source image. */
export function photoUrl(p: PhotoLike, target = 1280) {
  if (p.url) return cloudinarySized(p.url, target);
  if (!p.path) return '';
  const fits = BUCKETS.filter((b) => b <= p.w);
  if (!fits.length) return originalUrl(p);
  const w = fits.reduce((best, b) => (Math.abs(b - target) < Math.abs(best - target) ? b : best), fits[0]);
  const name = p.path.split('/').pop()!;
  return `${BASE}/thumb/${encode(p.path)}/${w}px-${encodeURIComponent(name)}`;
}

export function photoSrcSet(p: PhotoLike) {
  if (p.url) return [640, 1280, 1920].map((w) => `${cloudinarySized(p.url!, w)} ${w}w`).join(', ');
  if (!p.path) return undefined;
  const fits = BUCKETS.filter((b) => b <= p.w);
  if (!fits.length) return undefined;
  const name = p.path.split('/').pop()!;
  return fits.map((w) => `${BASE}/thumb/${encode(p.path)}/${w}px-${encodeURIComponent(name)} ${w}w`).join(', ');
}

/** Insert an automatic width + format transform for Cloudinary uploads. */
function cloudinarySized(url: string, w: number) {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`);
}

export function commonsPage(p: PhotoLike) {
  if (p.url || !p.path) return undefined;
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(p.path.split('/').pop()!)}`;
}
