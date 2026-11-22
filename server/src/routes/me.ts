import { Router } from 'express';
import { z } from 'zod';
import { Destination, Review, User } from '../models/index.js';
import { HttpError, optionalAuth, requireAuth, requireDb } from '../middleware/auth.js';
import { hasDatabase, connectDB } from '../lib/db.js';


export const me = Router();

// ---------- Favorites ----------
me.put('/me/favorites/:slug', requireAuth, requireDb, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.auth!.sub, { $addToSet: { favorites: req.params.slug } }, { returnDocument: 'after' }).lean();
  res.json(user?.favorites ?? []);
});

me.delete('/me/favorites/:slug', requireAuth, requireDb, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.auth!.sub, { $pull: { favorites: req.params.slug } }, { returnDocument: 'after' }).lean();
  res.json(user?.favorites ?? []);
});

me.post('/me/favorites/merge', requireAuth, requireDb, async (req, res) => {
  const slugs = z.array(z.string()).max(50).parse(req.body?.slugs ?? []);
  const user = await User.findByIdAndUpdate(req.auth!.sub, { $addToSet: { favorites: { $each: slugs } } }, { returnDocument: 'after' }).lean();
  res.json(user?.favorites ?? []);
});

// ---------- Itineraries ----------
const itineraryInput = z.object({
  title: z.string().trim().min(1, 'Give the trip a name.').max(80),
  startDate: z.string().optional(),
  days: z.number().int().min(1).max(30),
  travelers: z.number().int().min(1).max(50),
  stops: z.array(z.object({ destinationSlug: z.string(), day: z.number().int().min(1).max(30), note: z.string().max(200).optional() })).max(60),
});

me.get('/me/itineraries', requireAuth, requireDb, async (req, res) => {
  const user = await User.findById(req.auth!.sub).lean();
  res.json(user?.itineraries ?? []);
});

me.post('/me/itineraries', requireAuth, requireDb, async (req, res) => {
  const data = itineraryInput.parse(req.body);
  const user = await User.findById(req.auth!.sub);
  if (!user) throw new HttpError(401, 'Sign in again.');
  if (user.itineraries.length >= 20) throw new HttpError(400, 'You can keep up to 20 trips. Delete one to add another.');
  user.itineraries.push(data);
  await user.save();
  res.status(201).json(user.itineraries[user.itineraries.length - 1]);
});

me.put('/me/itineraries/:id', requireAuth, requireDb, async (req, res) => {
  const data = itineraryInput.parse(req.body);
  const user = await User.findById(req.auth!.sub);
  const it = user?.itineraries.id(String(req.params.id));
  if (!user || !it) throw new HttpError(404, 'Trip not found.');
  // Any change by the traveler sends the trip back to the team for another look.
  it.set({ ...data, status: 'pending' });
  await user.save();
  res.json(it);
});

me.delete('/me/itineraries/:id', requireAuth, requireDb, async (req, res) => {
  const user = await User.findById(req.auth!.sub);
  const it = user?.itineraries.id(String(req.params.id));
  if (!user || !it) throw new HttpError(404, 'Trip not found.');
  it.deleteOne();
  await user.save();
  res.status(204).end();
});

// ---------- Reviews ----------
me.get('/destinations/:slug/reviews', optionalAuth, async (req, res) => {
  if (!hasDatabase()) return res.json({ reviews: [], mine: null, enabled: false });
  await connectDB();
  const reviews = await Review.find({ destinationSlug: req.params.slug, status: 'approved' })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('user', 'name')
    .lean();
  const mine = req.auth ? await Review.findOne({ destinationSlug: req.params.slug, user: req.auth.sub }).lean() : null;
  res.json({ reviews, mine, enabled: true });
});

me.post('/destinations/:slug/reviews', requireAuth, requireDb, async (req, res) => {
  const body = z
    .object({ rating: z.number().int().min(1).max(5), text: z.string().trim().min(10, 'Write at least 10 characters.').max(1500) })
    .parse(req.body);
  if (!(await Destination.exists({ slug: req.params.slug }))) throw new HttpError(404, 'Destination not found.');
  const review = await Review.findOneAndUpdate(
    { destinationSlug: req.params.slug, user: req.auth!.sub },
    { ...body, status: 'pending' },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );
  res.status(201).json(review);
});

/** Recompute the cached rating on a destination after moderation. */
export async function refreshRating(slug: string) {
  const [agg] = await Review.aggregate([
    { $match: { destinationSlug: slug, status: 'approved' } },
    { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } },
  ]);
  await Destination.updateOne({ slug }, { rating: agg ? Math.round(agg.avg * 10) / 10 : 0, reviewCount: agg?.n ?? 0 });
}
