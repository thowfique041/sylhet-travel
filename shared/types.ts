// Shared domain types used by both the React client and the Express API.

export interface Photo {
  /** Wikimedia Commons upload path: "a/ab/File_name.jpg" */
  path: string;
  /** Original pixel width, so we never request a thumbnail larger than the source */
  w: number;
  alt?: string;
  credit?: string;
}

export interface Theme {
  /** Darkest tone: hero overlay, footer, headings on light */
  deep: string;
  /** Lightest tone: page background */
  mist: string;
  /** Signature color of the place */
  accent: string;
  /** Mid tone: borders, muted text */
  stone: string;
  /** Text color on deep backgrounds */
  glow: string;
}

export interface CostLine {
  label: string;
  min: number;
  max: number;
  note?: string;
}

export interface Destination {
  _id?: string;
  slug: string;
  name: string;
  nameBn: string;
  area: string;
  district: string;
  tagline: string;
  summary: string;
  story: string[];
  category: string;
  experiences: string[];
  bestSeason: string;
  bestMonths: number[];
  lat: number;
  lng: number;
  distanceKm: number;
  cover: Photo;
  gallery: Photo[];
  theme: Theme;
  howToGet: { mode: string; detail: string }[];
  costs: CostLine[];
  nearby: string[];
  tips: string[];
  foodNotes: string[];
  budgetLevel: 1 | 2 | 3;
  minDays: number;
  featured: boolean;
  order: number;
  rating?: number;
  reviewCount?: number;
}

export interface Category {
  _id?: string;
  slug: string;
  name: string;
  description: string;
}

export interface Slide {
  _id?: string;
  destinationSlug: string;
  title: string;
  kicker: string;
  description: string;
  image: Photo;
  theme: Theme;
  order: number;
  active: boolean;
}

export interface Place {
  _id?: string;
  slug: string;
  kind: 'restaurant' | 'hotel';
  name: string;
  area: string;
  destinationSlug?: string;
  description: string;
  priceFrom: number;
  priceNote: string;
  specialty?: string;
  lat?: number;
  lng?: number;
}

export interface Food {
  slug: string;
  name: string;
  nameBn: string;
  description: string;
  where: string;
  image?: Photo;
}

export interface Experience {
  slug: string;
  name: string;
  line: string;
  destinations: string[];
  image: Photo;
}

export interface Post {
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readMinutes: number;
  cover: Photo;
  body: string[];
  destinationSlug?: string;
  published: boolean;
}

export interface Gem {
  slug: string;
  name: string;
  area: string;
  story: string;
  image: Photo;
  lat: number;
  lng: number;
}

export interface Review {
  _id: string;
  destinationSlug: string;
  user: { _id: string; name: string } | string;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface PublicUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  favorites: string[];
  createdAt?: string;
}

export interface ItineraryStop {
  destinationSlug: string;
  day: number;
  note?: string;
}

export interface Itinerary {
  _id?: string;
  title: string;
  startDate?: string;
  days: number;
  travelers: number;
  stops: ItineraryStop[];
  /** Set by the site team after reviewing a trip saved to an account */
  status?: TripStatus;
  adminNote?: string;
  reviewedAt?: string;
  updatedAt?: string;
}

export type TripStatus = 'pending' | 'approved' | 'rejected';

export interface AdminTrip extends Itinerary {
  user: { _id: string; name: string; email: string };
}
