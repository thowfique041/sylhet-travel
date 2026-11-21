import mongoose, { Schema, model, type InferSchemaType } from 'mongoose';

const Mixed = Schema.Types.Mixed;

const photo = { path: String, w: Number, alt: String, credit: String, url: String };
const theme = { deep: String, mist: String, accent: String, stone: String, glow: String };

const destinationSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    nameBn: { type: String, default: '' },
    area: String,
    district: String,
    tagline: String,
    summary: String,
    story: [String],
    category: { type: String, index: true },
    experiences: [String],
    bestSeason: String,
    bestMonths: [Number],
    lat: Number,
    lng: Number,
    distanceKm: Number,
    cover: photo,
    gallery: [photo],
    theme,
    howToGet: [{ mode: String, detail: String, _id: false }],
    costs: [{ label: String, min: Number, max: Number, note: String, _id: false }],
    nearby: [String],
    tips: [String],
    foodNotes: [String],
    budgetLevel: { type: Number, default: 1 },
    minDays: { type: Number, default: 1 },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 99 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);
destinationSchema.index({ name: 'text', summary: 'text', area: 'text', tagline: 'text' });

const categorySchema = new Schema(
  { slug: { type: String, required: true, unique: true }, name: { type: String, required: true }, description: String },
  { timestamps: true },
);

const slideSchema = new Schema(
  {
    destinationSlug: { type: String, required: true },
    title: { type: String, required: true },
    kicker: String,
    description: String,
    image: photo,
    theme,
    order: { type: Number, default: 1 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const placeSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    kind: { type: String, enum: ['restaurant', 'hotel'], required: true },
    name: { type: String, required: true },
    area: String,
    destinationSlug: String,
    description: String,
    priceFrom: Number,
    priceNote: String,
    specialty: String,
    lat: Number,
    lng: Number,
  },
  { timestamps: true },
);

const postSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    excerpt: String,
    author: String,
    date: String,
    readMinutes: Number,
    cover: photo,
    body: [String],
    destinationSlug: String,
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const itinerarySchema = new Schema(
  {
    title: { type: String, required: true },
    startDate: String,
    days: { type: Number, default: 1 },
    travelers: { type: Number, default: 1 },
    stops: [{ destinationSlug: String, day: Number, note: String, _id: false }],
  },
  { timestamps: true },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    favorites: [String],
    itineraries: [itinerarySchema],
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const reviewSchema = new Schema(
  {
    destinationSlug: { type: String, required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, required: true, maxlength: 1500 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  },
  { timestamps: true },
);
reviewSchema.index({ destinationSlug: 1, user: 1 }, { unique: true });

const subscriberSchema = new Schema({ email: { type: String, required: true, unique: true, lowercase: true } }, { timestamps: true });

const pageViewSchema = new Schema({ day: { type: String, index: true }, path: String, count: { type: Number, default: 0 } });
pageViewSchema.index({ day: 1, path: 1 }, { unique: true });

const settingSchema = new Schema({ key: { type: String, unique: true }, value: Mixed });

// Reuse compiled models across hot reloads and serverless invocations.
const reuse = <T extends Schema>(name: string, schema: T) =>
  (mongoose.models[name] as mongoose.Model<InferSchemaType<T>>) ?? model(name, schema);

export const Destination = reuse('Destination', destinationSchema);
export const Category = reuse('Category', categorySchema);
export const Slide = reuse('Slide', slideSchema);
export const Place = reuse('Place', placeSchema);
export const Post = reuse('Post', postSchema);
export const User = reuse('User', userSchema);
export const Review = reuse('Review', reviewSchema);
export const Subscriber = reuse('Subscriber', subscriberSchema);
export const PageView = reuse('PageView', pageViewSchema);
export const Setting = reuse('Setting', settingSchema);
