import { Router } from 'express';
import { connectDB, hasDatabase } from '../lib/db.js';
import { Category, Destination, PageView, Place, Post, Slide, Subscriber } from '../models/index.js';
import { CATEGORIES, DESTINATIONS, EXPERIENCES, FOODS, GEMS, PLACES, POSTS, SLIDES } from '../../../shared/seed.js';
import { HttpError, requireDb } from '../middleware/auth.js';
import { z } from 'zod';

export const content = Router();

/** Serve from MongoDB when it is configured, otherwise from the bundled seed content. */
async function live() {
  if (!hasDatabase()) return false;
  await connectDB();
  return true;
}

function filterDestinations<T extends { name: string; summary: string; area: string; category: string; experiences: string[]; bestMonths: number[]; tagline: string }>(
  list: T[],
  q: { q?: string; category?: string; experience?: string; month?: string },
) {
  const term = q.q?.trim().toLowerCase();
  return list.filter((d) => {
    if (term && ![d.name, d.summary, d.area, d.tagline].some((s) => s?.toLowerCase().includes(term))) return false;
    if (q.category && d.category !== q.category) return false;
    if (q.experience && !d.experiences.includes(q.experience)) return false;
    if (q.month && !d.bestMonths.includes(Number(q.month))) return false;
    return true;
  });
}

content.get('/health', async (_req, res) => {
  let db: 'connected' | 'not-configured' | 'error' = 'not-configured';
  if (hasDatabase()) {
    try {
      await connectDB();
      db = 'connected';
    } catch {
      db = 'error';
    }
  }
  res.json({ ok: true, db, time: new Date().toISOString() });
});

content.get('/destinations', async (req, res) => {
  const q = req.query as Record<string, string>;
  const list = (await live()) ? await Destination.find().sort({ order: 1 }).lean() : DESTINATIONS;
  res.json(filterDestinations(list as typeof DESTINATIONS, q));
});

content.get('/destinations/:slug', async (req, res) => {
  const d = (await live())
    ? await Destination.findOne({ slug: req.params.slug }).lean()
    : DESTINATIONS.find((x) => x.slug === req.params.slug);
  if (!d) throw new HttpError(404, 'We could not find that destination.');
  res.json(d);
});

content.get('/categories', async (_req, res) => {
  res.json((await live()) ? await Category.find().sort({ name: 1 }).lean() : CATEGORIES);
});

content.get('/slides', async (_req, res) => {
  res.json((await live()) ? await Slide.find({ active: true }).sort({ order: 1 }).lean() : SLIDES);
});

content.get('/places', async (req, res) => {
  const { kind, destination } = req.query as Record<string, string>;
  const all = (await live()) ? await Place.find().lean() : PLACES;
  res.json((all as typeof PLACES).filter((p) => (!kind || p.kind === kind) && (!destination || p.destinationSlug === destination)));
});

content.get('/posts', async (_req, res) => {
  res.json((await live()) ? await Post.find({ published: true }).sort({ date: -1 }).lean() : POSTS);
});

content.get('/posts/:slug', async (req, res) => {
  const post = (await live()) ? await Post.findOne({ slug: req.params.slug, published: true }).lean() : POSTS.find((p) => p.slug === req.params.slug);
  if (!post) throw new HttpError(404, 'We could not find that story.');
  res.json(post);
});

// Editorial collections that live in code: experiences, food guide and hidden gems.
content.get('/experiences', (_req, res) => res.json(EXPERIENCES));
content.get('/foods', (_req, res) => res.json(FOODS));
content.get('/gems', (_req, res) => res.json(GEMS));

content.post('/newsletter', requireDb, async (req, res) => {
  const { email } = z.object({ email: z.string().email('Enter a valid email address.') }).parse(req.body);
  await Subscriber.updateOne({ email: email.toLowerCase() }, { $setOnInsert: { email } }, { upsert: true });
  res.status(201).json({ ok: true });
});

content.post('/track', async (req, res) => {
  if (!hasDatabase()) return res.status(204).end();
  const path = String(req.body?.path ?? '/').slice(0, 120);
  const day = new Date().toISOString().slice(0, 10);
  await connectDB();
  await PageView.updateOne({ day, path }, { $inc: { count: 1 } }, { upsert: true });
  res.status(204).end();
});
