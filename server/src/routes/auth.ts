import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { User } from '../models/index.js';
import { HttpError, requireAuth, requireDb, signToken } from '../middleware/auth.js';

export const auth = Router();

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

const toPublic = (u: { _id: unknown; name: string; email: string; role: string; favorites?: string[]; createdAt?: Date }) => ({
  _id: String(u._id),
  name: u.name,
  email: u.email,
  role: u.role,
  favorites: u.favorites ?? [],
  createdAt: u.createdAt,
});

auth.post('/register', limiter, requireDb, async (req, res) => {
  const body = z
    .object({
      name: z.string().trim().min(2, 'Name needs at least 2 characters.').max(60),
      email: z.string().trim().email('Enter a valid email address.'),
      password: z.string().min(8, 'Password needs at least 8 characters.').max(100),
      favorites: z.array(z.string()).max(50).optional(),
    })
    .parse(req.body);
  if (await User.exists({ email: body.email.toLowerCase() })) throw new HttpError(409, 'An account with this email already exists. Sign in instead.');
  const user = await User.create({
    name: body.name,
    email: body.email,
    password: await bcrypt.hash(body.password, 12),
    favorites: body.favorites ?? [],
  });
  const token = signToken({ sub: String(user._id), role: user.role as 'user', name: user.name });
  res.status(201).json({ token, user: toPublic(user) });
});

auth.post('/login', limiter, requireDb, async (req, res) => {
  const body = z.object({ email: z.string().trim().email('Enter a valid email address.'), password: z.string().min(1, 'Enter your password.') }).parse(req.body);
  const user = await User.findOne({ email: body.email.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(body.password, user.password))) throw new HttpError(401, 'Email or password is incorrect.');
  if (!user.active) throw new HttpError(403, 'This account has been suspended.');
  const token = signToken({ sub: String(user._id), role: user.role as 'user' | 'admin', name: user.name });
  res.json({ token, user: toPublic(user) });
});

auth.get('/me', requireAuth, requireDb, async (req, res) => {
  const user = await User.findById(req.auth!.sub).lean();
  if (!user) throw new HttpError(401, 'Your session has ended. Sign in again.');
  res.json(toPublic(user));
});

export { toPublic };
