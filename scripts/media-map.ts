// Snapshot the Cloudinary media map at build time, so the first paint already uses Cloudinary URLs.
import { mkdirSync, writeFileSync } from 'node:fs';

const site = (process.env.SITE_URL || 'https://sylhet-travel-ten.vercel.app').replace(/\/$/, '');
const out = new URL('../client/src/generated/media-map.json', import.meta.url);
mkdirSync(new URL('.', out), { recursive: true });
let map: Record<string, unknown> = {};
try {
  const r = await fetch(`${site}/api/media`, { signal: AbortSignal.timeout(8000) });
  if (r.ok) map = await r.json();
} catch {
  /* offline build: the client fetches the map at runtime instead */
}
writeFileSync(out, JSON.stringify(map));
console.log(`media map: ${Object.keys(map).length} photos`);
