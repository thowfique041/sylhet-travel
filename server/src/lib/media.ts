import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryEnabled, env } from './env.js';
import { Destination, Post, Setting, Slide } from '../models/index.js';
import { DESTINATIONS, EXPERIENCES, FOODS, GEMS, IMG, POSTS } from '../../../shared/seed.js';
import type { Photo } from '../../../shared/types.js';

/**
 * Media library on Cloudinary.
 * Every photo is identified by its Wikimedia Commons path (kept for credits).
 * Once copied to Cloudinary, a map path -> Cloudinary URL is stored in Mongo,
 * and every API response swaps in the Cloudinary URL automatically.
 */
export type MediaMap = Record<string, { url: string; w: number }>;
const KEY = 'mediaMap';

let cache: { map: MediaMap; at: number } | null = null;

export async function getMediaMap(): Promise<MediaMap> {
  if (cache && Date.now() - cache.at < 60_000) return cache.map;
  const doc = await Setting.findOne({ key: KEY }).lean();
  const map = ((doc?.value as MediaMap) ?? {}) as MediaMap;
  cache = { map, at: Date.now() };
  return map;
}

/** Deep-walk a response and attach Cloudinary URLs to any photo already migrated. */
export function applyMedia<T>(value: T, map: MediaMap): T {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => applyMedia(v, map)) as T;
  const o = value as Record<string, unknown>;
  if (typeof o.path === 'string' && typeof o.w === 'number' && !o.url && map[o.path]) {
    return { ...o, url: map[o.path].url, w: map[o.path].w } as T;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) out[k] = v && typeof v === 'object' ? applyMedia(v, map) : v;
  return out as T;
}

const encode = (p: string) => p.split('/').map(encodeURIComponent).join('/');

/** Wikimedia source at most 1920px wide, so uploads stay light. */
function sourceUrl(p: Photo) {
  const base = 'https://upload.wikimedia.org/wikipedia/commons';
  if (p.w <= 1920) return `${base}/${encode(p.path)}`;
  const name = p.path.split('/').pop()!;
  return `${base}/thumb/${encode(p.path)}/1920px-${encodeURIComponent(name)}`;
}

const publicId = (path: string) =>
  path
    .split('/')
    .pop()!
    .replace(/\.[a-z]+$/i, '')
    .normalize('NFKD')
    .replace(/[^\w-]+/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 80) || 'photo';

/** Every Commons photo the site uses: bundled content plus anything in the database. */
export async function allPhotos(): Promise<Photo[]> {
  const list: Photo[] = [
    ...DESTINATIONS.flatMap((d) => [d.cover, ...d.gallery]),
    ...Object.values(IMG.misc),
    ...EXPERIENCES.map((e) => e.image),
    ...FOODS.flatMap((f) => (f.image ? [f.image] : [])),
    ...GEMS.map((g) => g.image),
    ...POSTS.map((p) => p.cover),
  ];
  const [dests, slides, posts] = await Promise.all([Destination.find().lean(), Slide.find().lean(), Post.find().lean()]);
  for (const d of dests) list.push(...([d.cover, ...(d.gallery ?? [])] as Photo[]));
  for (const s of slides) if (s.image) list.push(s.image as Photo);
  for (const p of posts) if (p.cover) list.push(p.cover as Photo);
  const seen = new Map<string, Photo>();
  for (const p of list) if (p?.path && !(p as Photo & { url?: string }).url && !seen.has(p.path)) seen.set(p.path, p);
  return [...seen.values()];
}

export async function mediaStatus() {
  const [map, photos] = await Promise.all([getMediaMap(), allPhotos()]);
  const migrated = photos.filter((p) => map[p.path]).length;
  return { enabled: cloudinaryEnabled(), total: photos.length, migrated, remaining: photos.length - migrated };
}

/** Copy the next few photos to Cloudinary. Called repeatedly until nothing remains. */
export async function migrateBatch(size = 6) {
  if (!cloudinaryEnabled()) throw new Error('Cloudinary is not configured.');
  cloudinary.config({ cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET, secure: true });
  cache = null;
  const map = { ...(await getMediaMap()) };
  const pending = (await allPhotos()).filter((p) => !map[p.path]).slice(0, size);
  const errors: { path: string; error: string }[] = [];
  await Promise.all(
    pending.map(async (p) => {
      try {
        const r = await cloudinary.uploader.upload(sourceUrl(p), {
          folder: 'sylhet',
          public_id: publicId(p.path),
          overwrite: false,
          unique_filename: false,
          resource_type: 'image',
          context: { alt: p.alt ?? '', source: `https://commons.wikimedia.org/wiki/File:${p.path.split('/').pop()}` },
        });
        map[p.path] = { url: r.secure_url, w: r.width };
      } catch (e) {
        const err = e as { message?: string; error?: { message?: string } };
        errors.push({ path: p.path, error: err.error?.message ?? err.message ?? 'upload failed' });
      }
    }),
  );
  await Setting.updateOne({ key: KEY }, { $set: { value: map } }, { upsert: true });
  cache = { map, at: Date.now() };
  const status = await mediaStatus();
  return { uploaded: pending.length - errors.length, errors, ...status };
}
