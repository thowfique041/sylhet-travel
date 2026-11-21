// Manually (re)seed the database: `npm run seed` (add --reset to wipe content collections first).
import mongoose from 'mongoose';
import { connectDB, seedIfEmpty } from './lib/db.js';
import { Category, Destination, Place, Post, Slide } from './models/index.js';

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI first.');
  process.exit(1);
}
await connectDB();
if (process.argv.includes('--reset')) {
  await Promise.all([Category, Destination, Place, Post, Slide].map((M) => (M as mongoose.Model<unknown>).deleteMany({})));
  console.log('Cleared content collections');
}
await seedIfEmpty();
await mongoose.disconnect();
console.log('Done');
