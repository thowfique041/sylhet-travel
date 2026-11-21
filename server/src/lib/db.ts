import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from './env.js';
import { Category, Destination, Place, Post, Slide, User } from '../models/index.js';
import { CATEGORIES, DESTINATIONS, PLACES, POSTS, SLIDES } from '../../../shared/seed.js';

/**
 * Serverless-friendly connection cache. On Vercel each function instance
 * reuses the same connection between invocations.
 */
const g = globalThis as unknown as { __mongo?: Promise<typeof mongoose> | null; __seeded?: boolean };

export function hasDatabase() {
  return Boolean(env.MONGODB_URI);
}

export function isConnected() {
  return mongoose.connection.readyState === 1;
}

export async function connectDB() {
  if (!hasDatabase()) return null;
  if (!g.__mongo) {
    mongoose.set('strictQuery', true);
    g.__mongo = mongoose
      .connect(env.MONGODB_URI!, { serverSelectionTimeoutMS: 8000, maxPoolSize: 5 })
      .catch((err) => {
        g.__mongo = null;
        throw err;
      });
  }
  const conn = await g.__mongo;
  if (!g.__seeded) {
    g.__seeded = true;
    await seedIfEmpty();
  }
  return conn;
}

/** Fill an empty database with the bundled Sylhet content and create the first admin. */
export async function seedIfEmpty() {
  if ((await Destination.estimatedDocumentCount()) === 0) {
    // Plain seed objects; cast because Mongoose types expect timestamp fields.
    await Category.insertMany(CATEGORIES as never[]);
    await Destination.insertMany(DESTINATIONS as never[]);
    await Slide.insertMany(SLIDES as never[]);
    await Place.insertMany(PLACES as never[]);
    await Post.insertMany(POSTS as never[]);
    console.log('[db] seeded Sylhet content');
  }
  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    const email = env.ADMIN_EMAIL.toLowerCase();
    const existing = await User.findOne({ email } as never);
    if (!existing) {
      await User.create({ name: 'Admin', email, password: await bcrypt.hash(env.ADMIN_PASSWORD, 12), role: 'admin' });
      console.log(`[db] created admin ${email}`);
    } else if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
    }
  }
}
