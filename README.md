# SYLHET: a cinematic travel guide to Sylhet, Bangladesh

A MERN + TypeScript travel discovery platform for Sylhet division: Jaflong, Ratargul, Sreemangal, Bisanakandi, Lalakhal, Madhabkunda, Tanguar Haor, Hakaluki Haor and the SUST campus.

The signature feature is the homepage hero: each destination wipes in from the side it is travelling from, and the whole site's palette (backgrounds, overlays, accents, text) interpolates to that place's colors through a CSS `@property` theme engine. Admins can change slides, images, text and theme colors from the dashboard without touching code.

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, GSAP ScrollTrigger, React Router, Lucide, React Leaflet (OpenStreetMap) |
| Backend | Node.js, Express 5, MongoDB with Mongoose, JWT auth, Zod validation, Helmet, rate limiting |
| Media | Wikimedia Commons photographs (real, freely licensed); Cloudinary for admin uploads |
| Hosting | Vercel (static client + one serverless function for the API) |

## Project structure

```
api/index.ts            Vercel serverless entry, wraps the Express app
server/src/
  app.ts                Express app, routing, error handling
  index.ts              Local server (npm run dev:api)
  lib/db.ts             Cached Mongo connection, auto-seed, first admin
  models/               Mongoose schemas
  routes/               content, auth, me (favorites, trips, reviews), admin (CRUD, users, stats, upload)
  middleware/auth.ts    JWT, role checks, database guard
shared/
  types.ts              Types shared by client and server
  seed.ts               Destinations, themes, slides, food, stories, hidden gems
client/src/
  context/ThemeContext  The theme engine
  components/home/Hero  The cinematic location slider
  pages/                Home, Destinations, DestinationDetail, Planner, Food, Stories, Auth, Account
  admin/                Admin dashboard (generic resource manager + reviews, users, stats)
  lib/planner.ts        Ranking, itinerary building, duration and budget estimates
```

## Running locally

```bash
npm install
cp .env.example .env      # fill MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev               # API on :5000, web on :5173 (proxied)
```

Without `MONGODB_URI` the API runs in read-only mode and serves the bundled content, so the public site still works. Accounts, reviews, newsletter and the admin dashboard switch on as soon as a database is connected. On first connection the database is seeded automatically and the admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` is created.

Useful scripts: `npm run typecheck`, `npm run build`, `npm run seed` (`-- --reset` to reseed content).

## Environment variables

See `.env.example`. On Vercel set them in Project Settings, Environment Variables:

- `MONGODB_URI` (MongoDB Atlas free cluster; allow access from `0.0.0.0/0` for Vercel)
- `JWT_SECRET` (long random string)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (first admin)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (optional, for uploads)

## Features

- Cinematic hero with directional wipe, Ken Burns drift, ghosted Bangla place names, autoplay with progress, keyboard, swipe, pause, and a redesigned mobile layout
- Destination theme engine shared by every page
- Search (press `/` anywhere), category, activity and month filters, grid or map view
- Destination pages: cover parallax, gallery with lightbox, story, map with nearby places, directions, cost table with group split, best months, stays, food, tips, moderated reviews, JSON-LD for SEO
- Favorites that work signed out and merge into the account on sign-in
- Trip planner: ranks places for your month, budget, style and group, builds a day-by-day itinerary, computes duration and budget, saves trips
- Admin: slider, destinations (including theme colors and featured flag), categories, restaurants and hotels, stories, review moderation, users, statistics
- Reduced-motion support throughout, keyboard focus states, lazy-loaded responsive images

## Photo credits

All photographs are hotlinked from Wikimedia Commons and credited on `/credits`, with a link to each file page showing the author and license.
