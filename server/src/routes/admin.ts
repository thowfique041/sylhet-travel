import { Router, type Request } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';
import type { Model } from 'mongoose';
import { Category, Destination, PageView, Place, Post, Review, Slide, Subscriber, User } from '../models/index.js';
import { HttpError, requireAdmin, requireDb } from '../middleware/auth.js';
import { cloudinaryEnabled, env } from '../lib/env.js';
import { refreshRating } from './me.js';
import { applyMedia, getMediaMap, mediaStatus, migrateBatch, pendingPhotos, recordUpload, resetPaths, signUpload } from '../lib/media.js';

export const admin = Router();
admin.use('/admin', requireAdmin, requireDb);

const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and dashes only.');
const photo = z.object({ path: z.string().optional().default(''), w: z.number().optional().default(1920), alt: z.string().optional(), url: z.string().url().optional().or(z.literal('')) });
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex color like #1e2a33.');
const theme = z.object({ deep: hex, mist: hex, accent: hex, stone: hex, glow: hex });

const schemas = {
  destinations: z.object({
    slug, name: z.string().min(2), nameBn: z.string().optional().default(''), area: z.string().default(''), district: z.string().default(''),
    tagline: z.string().default(''), summary: z.string().default(''), story: z.array(z.string()).default([]),
    category: z.string().default(''), experiences: z.array(z.string()).default([]),
    bestSeason: z.string().default(''), bestMonths: z.array(z.number().int().min(1).max(12)).default([]),
    lat: z.number(), lng: z.number(), distanceKm: z.number().default(0),
    cover: photo, gallery: z.array(photo).default([]), theme,
    howToGet: z.array(z.object({ mode: z.string(), detail: z.string() })).default([]),
    costs: z.array(z.object({ label: z.string(), min: z.number(), max: z.number(), note: z.string().optional() })).default([]),
    nearby: z.array(z.string()).default([]), tips: z.array(z.string()).default([]), foodNotes: z.array(z.string()).default([]),
    budgetLevel: z.number().int().min(1).max(3).default(1), minDays: z.number().int().min(1).default(1),
    featured: z.boolean().default(false), order: z.number().default(99),
  }),
  categories: z.object({ slug, name: z.string().min(2), description: z.string().default('') }),
  slides: z.object({
    destinationSlug: slug, title: z.string().min(1), kicker: z.string().default(''), description: z.string().default(''),
    image: photo, theme, order: z.number().default(1), active: z.boolean().default(true),
  }),
  places: z.object({
    slug, kind: z.enum(['restaurant', 'hotel']), name: z.string().min(2), area: z.string().default(''), destinationSlug: z.string().optional(),
    description: z.string().default(''), priceFrom: z.number().default(0), priceNote: z.string().default(''), specialty: z.string().optional(),
    lat: z.number().optional(), lng: z.number().optional(),
  }),
  posts: z.object({
    slug, title: z.string().min(2), excerpt: z.string().default(''), author: z.string().default('SYLHET editors'),
    date: z.string().default(() => new Date().toISOString().slice(0, 10)), readMinutes: z.number().default(3),
    cover: photo, body: z.array(z.string()).default([]), destinationSlug: z.string().optional(), published: z.boolean().default(true),
  }),
} as const;

const models: Record<keyof typeof schemas, Model<any>> = {
  destinations: Destination, categories: Category, slides: Slide, places: Place, posts: Post,
};

// Generic CRUD for the content collections.
for (const key of Object.keys(schemas) as (keyof typeof schemas)[]) {
  const M = models[key];
  const S = schemas[key];
  admin.get(`/admin/${key}`, async (_req, res) => res.json(applyMedia(await M.find().sort({ order: 1, createdAt: -1 }).lean(), await getMediaMap())));
  admin.post(`/admin/${key}`, async (req, res) => {
    const doc = await M.create(S.parse(req.body));
    res.status(201).json(doc);
  });
  admin.put(`/admin/${key}/:id`, async (req, res) => {
    const doc = await M.findByIdAndUpdate(req.params.id, S.parse(req.body), { returnDocument: 'after', runValidators: true });
    if (!doc) throw new HttpError(404, 'Item not found.');
    res.json(doc);
  });
  admin.patch(`/admin/${key}/:id`, async (req, res) => {
    const doc = await M.findByIdAndUpdate(req.params.id, (S as z.ZodObject<any>).partial().parse(req.body), { returnDocument: 'after' });
    if (!doc) throw new HttpError(404, 'Item not found.');
    res.json(doc);
  });
  admin.delete(`/admin/${key}/:id`, async (req, res) => {
    const doc = await M.findByIdAndDelete(req.params.id);
    if (!doc) throw new HttpError(404, 'Item not found.');
    res.status(204).end();
  });
}

// ---------- Users ----------
admin.get('/admin/users', async (_req, res) => {
  res.json(await User.find().sort({ createdAt: -1 }).select('name email role active favorites createdAt').lean());
});
admin.patch('/admin/users/:id', async (req: Request, res) => {
  const body = z.object({ role: z.enum(['user', 'admin']).optional(), active: z.boolean().optional() }).parse(req.body);
  if (req.params.id === req.auth!.sub && (body.role === 'user' || body.active === false)) {
    throw new HttpError(400, 'You cannot remove your own admin access.');
  }
  const user = await User.findByIdAndUpdate(req.params.id, body, { returnDocument: 'after' }).select('name email role active createdAt').lean();
  if (!user) throw new HttpError(404, 'User not found.');
  res.json(user);
});
admin.delete('/admin/users/:id', async (req: Request, res) => {
  if (req.params.id === req.auth!.sub) throw new HttpError(400, 'You cannot delete your own account here.');
  const slugs: string[] = await Review.distinct('destinationSlug', { user: req.params.id });
  await Review.deleteMany({ user: req.params.id });
  await User.findByIdAndDelete(req.params.id);
  await Promise.all(slugs.map((s) => refreshRating(s)));
  res.status(204).end();
});

// ---------- Review moderation ----------
admin.get('/admin/reviews', async (req, res) => {
  const status = z.enum(['pending', 'approved', 'rejected']).optional().parse(req.query.status || undefined);
  res.json(await Review.find(status ? { status } : {}).sort({ createdAt: -1 }).limit(200).populate('user', 'name email').lean());
});
admin.patch('/admin/reviews/:id', async (req, res) => {
  const { status } = z.object({ status: z.enum(['pending', 'approved', 'rejected']) }).parse(req.body);
  const review = await Review.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
  if (!review) throw new HttpError(404, 'Review not found.');
  await refreshRating(review.destinationSlug);
  res.json(review);
});
admin.delete('/admin/reviews/:id', async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (review) await refreshRating(review.destinationSlug);
  res.status(204).end();
});

// ---------- Statistics ----------
admin.get('/admin/stats', async (_req, res) => {
  const since = new Date(Date.now() - 29 * 864e5).toISOString().slice(0, 10);
  const [destinations, users, pending, approved, subscribers, posts, places, favAgg, views] = await Promise.all([
    Destination.countDocuments(), User.countDocuments(), Review.countDocuments({ status: 'pending' }),
    Review.countDocuments({ status: 'approved' }), Subscriber.countDocuments(), Post.countDocuments(), Place.countDocuments(),
    User.aggregate([{ $unwind: '$favorites' }, { $group: { _id: '$favorites', n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 6 }]),
    PageView.aggregate([{ $match: { day: { $gte: since } } }, { $group: { _id: '$day', n: { $sum: '$count' } } }, { $sort: { _id: 1 } }]),
  ]);
  const [tripAgg] = await User.aggregate([
    { $unwind: '$itineraries' },
    { $group: { _id: null, total: { $sum: 1 }, pending: { $sum: { $cond: [{ $eq: [{ $ifNull: ['$itineraries.status', 'pending'] }, 'pending'] }, 1, 0] } } } },
  ]);
  const topPlanned = await User.aggregate([
    { $unwind: '$itineraries' },
    { $unwind: '$itineraries.stops' },
    { $group: { _id: '$itineraries.stops.destinationSlug', n: { $sum: 1 } } },
    { $sort: { n: -1 } },
    { $limit: 6 },
  ]);
  const topPages = await PageView.aggregate([{ $match: { day: { $gte: since } } }, { $group: { _id: '$path', n: { $sum: '$count' } } }, { $sort: { n: -1 } }, { $limit: 8 }]);
  res.json({ trips: tripAgg?.total ?? 0, pendingTrips: tripAgg?.pending ?? 0, topPlanned, destinations, users, pendingReviews: pending, approvedReviews: approved, subscribers, posts, places, topFavorites: favAgg, views, topPages });
});

// ---------- Image upload (Cloudinary) ----------
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
admin.post('/admin/upload', upload.single('file'), async (req, res) => {
  if (!cloudinaryEnabled()) throw new HttpError(503, 'Image uploads need Cloudinary. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.');
  if (!req.file) throw new HttpError(400, 'Choose an image to upload.');
  if (!/^image\/(jpeg|png|webp|avif)$/.test(req.file.mimetype)) throw new HttpError(400, 'Upload a JPG, PNG, WebP or AVIF image.');
  cloudinary.config({ cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET });
  const result = await new Promise<{ secure_url: string; width: number }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'sylhet', resource_type: 'image' }, (err, out) => (err || !out ? reject(err) : resolve(out as never)))
      .end(req.file!.buffer);
  });
  res.status(201).json({ url: result.secure_url, w: result.width });
});

// ---------- Media library (Cloudinary) ----------
admin.get('/admin/media', async (_req, res) => res.json(await mediaStatus()));
admin.post('/admin/media/migrate', async (_req, res) => {
  if (!cloudinaryEnabled()) throw new HttpError(503, 'Cloudinary is not configured on the server.');
  res.json(await migrateBatch(6));
});
admin.get('/admin/media/pending', async (_req, res) => res.json(await pendingPhotos()));
admin.post('/admin/media/sign', (req, res) => {
  if (!cloudinaryEnabled()) throw new HttpError(503, 'Cloudinary is not configured on the server.');
  const { publicId } = z.object({ publicId: z.string().regex(/^[\w-]{1,80}$/) }).parse(req.body);
  res.json(signUpload(publicId));
});
admin.post('/admin/media/reset', async (req, res) => {
  const { paths } = z.object({ paths: z.array(z.string().min(3)).min(1).max(100) }).parse(req.body);
  await resetPaths(paths);
  res.json(await mediaStatus());
});
admin.post('/admin/media/record', async (req, res) => {
  const b = z.object({ path: z.string().min(3), url: z.string().url().startsWith('https://res.cloudinary.com/'), w: z.number().int().positive() }).parse(req.body);
  await recordUpload(b.path, b.url, b.w);
  res.json({ ok: true });
});

// ---------- Trip plans ----------
admin.get('/admin/trips', async (req, res) => {
  const status = z.enum(['pending', 'approved', 'rejected']).optional().parse(req.query.status || undefined);
  const trips = await User.aggregate([
    { $unwind: '$itineraries' },
    ...(status ? [{ $match: { 'itineraries.status': status } }] : []),
    { $sort: { 'itineraries.updatedAt': -1 } },
    { $limit: 300 },
    {
      $project: {
        _id: '$itineraries._id',
        title: '$itineraries.title',
        startDate: '$itineraries.startDate',
        days: '$itineraries.days',
        travelers: '$itineraries.travelers',
        stops: '$itineraries.stops',
        status: { $ifNull: ['$itineraries.status', 'pending'] },
        adminNote: '$itineraries.adminNote',
        reviewedAt: '$itineraries.reviewedAt',
        updatedAt: '$itineraries.updatedAt',
        user: { _id: '$_id', name: '$name', email: '$email' },
      },
    },
  ]);
  res.json(trips);
});

admin.patch('/admin/trips/:userId/:tripId', async (req: Request, res) => {
  const body = z
    .object({ status: z.enum(['pending', 'approved', 'rejected']).optional(), adminNote: z.string().trim().max(1500).optional() })
    .refine((b) => b.status !== undefined || b.adminNote !== undefined, 'Choose a decision or write a suggestion.')
    .parse(req.body);
  const user = await User.findById(req.params.userId);
  const trip = user?.itineraries.id(String(req.params.tripId));
  if (!user || !trip) throw new HttpError(404, 'Trip not found.');
  if (body.status) trip.status = body.status;
  if (body.adminNote !== undefined) trip.adminNote = body.adminNote;
  trip.reviewedAt = new Date();
  await user.save();
  res.json(trip);
});
