// Generates client/public/sitemap.xml from the seed content before each build.
import { writeFileSync } from 'node:fs';
import { DESTINATIONS, POSTS } from '../shared/seed.js';

const site = (process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://sylhet-travel.vercel.app')).replace(/\/$/, '');
const paths = ['/', '/destinations', '/planner', '/food', '/stories', ...DESTINATIONS.map((d) => `/destinations/${d.slug}`), ...POSTS.map((p) => `/stories/${p.slug}`)];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${site}${p}</loc></url>`).join('\n')}\n</urlset>\n`;
writeFileSync(new URL('../client/public/sitemap.xml', import.meta.url), xml);
console.log(`sitemap: ${paths.length} urls for ${site}`);
