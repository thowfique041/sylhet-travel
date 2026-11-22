import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, Database, LogOut, Image as ImageIcon, Layers, MapPinned, MessageSquare, Store, Users } from 'lucide-react';
import type { Category, Destination } from '@shared/types';
import { THEMES } from '@shared/seed';
import { useAuth } from '@/context/AuthContext';
import { Seo } from '@/components/Seo';
import { Photo } from '@/components/Photo';
import { api, ApiError } from '@/lib/api';
import { invalidate } from '@/hooks/useData';
import { cx, niceDate } from '@/lib/format';
import { ResourceManager } from './ResourceManager';
import type { Field } from './fields';

const EXP = ['adventure', 'tea', 'river', 'waterfalls', 'photography', 'food', 'culture'].map((v) => ({ value: v, label: v }));

const NAV = [
  { to: '', label: 'Overview', icon: BarChart3 },
  { to: 'slider', label: 'Homepage slider', icon: ImageIcon },
  { to: 'destinations', label: 'Destinations', icon: MapPinned },
  { to: 'categories', label: 'Categories', icon: Layers },
  { to: 'places', label: 'Restaurants and hotels', icon: Store },
  { to: 'posts', label: 'Stories', icon: BookOpen },
  { to: 'reviews', label: 'Reviews', icon: MessageSquare },
  { to: 'users', label: 'Users', icon: Users },
];

export default function Admin() {
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  const [db, setDb] = useState<string>('checking');
  const [cats, setCats] = useState<Category[]>([]);
  const [dests, setDests] = useState<Destination[]>([]);

  useEffect(() => {
    api<{ db: string }>('/health').then((h) => setDb(h.db)).catch(() => setDb('error'));
    api<Category[]>('/categories').then(setCats).catch(() => {});
    api<Destination[]>('/destinations').then(setDests).catch(() => {});
  }, []);

  if (!ready) return <div className="h-[60vh]" />;
  if (!user) return <Navigate to="/login?next=/admin" replace />;
  if (user.role !== 'admin')
    return (
      <section className="wrap pt-40">
        <h1 className="text-5xl">Admins only</h1>
        <p className="mt-3 text-stone">Your account does not have admin access. Ask an existing admin to promote you from the Users page.</p>
      </section>
    );

  const catOpts = cats.map((c) => ({ value: c.slug, label: c.name }));
  const destOpts = dests.map((d) => ({ value: d.slug, label: d.name }));

  const destFields: Field[] = [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'slug', label: 'URL slug', type: 'text', help: 'Lowercase with dashes, used in /destinations/slug', required: true },
    { key: 'nameBn', label: 'Name in Bangla', type: 'text' },
    { key: 'area', label: 'Upazila or area', type: 'text' },
    { key: 'district', label: 'District', type: 'text' },
    { key: 'tagline', label: 'Tagline', type: 'text' },
    { key: 'summary', label: 'Short description', type: 'textarea' },
    { key: 'story', label: 'Travel story paragraphs', type: 'lines', help: 'One paragraph per line' },
    { key: 'category', label: 'Category', type: 'select', options: catOpts },
    { key: 'experiences', label: 'Experiences', type: 'multi', options: EXP },
    { key: 'bestSeason', label: 'Best season (text)', type: 'text' },
    { key: 'bestMonths', label: 'Best months', type: 'months' },
    { key: 'lat', label: 'Latitude', type: 'number' },
    { key: 'lng', label: 'Longitude', type: 'number' },
    { key: 'distanceKm', label: 'Distance from Sylhet city (km)', type: 'number' },
    { key: 'cover', label: 'Cover photo', type: 'photo' },
    { key: 'gallery', label: 'Gallery', type: 'photos' },
    { key: 'theme', label: 'Destination theme colors', type: 'theme' },
    { key: 'howToGet', label: 'How to get there', type: 'pairs', keys: ['mode', 'detail'] },
    { key: 'costs', label: 'Estimated costs (BDT)', type: 'pairs', keys: ['label', 'min', 'max', 'note'], numeric: ['min', 'max'] },
    { key: 'nearby', label: 'Nearby destinations', type: 'multi', options: destOpts },
    { key: 'tips', label: 'Travel tips', type: 'lines' },
    { key: 'foodNotes', label: 'Food notes', type: 'lines' },
    { key: 'budgetLevel', label: 'Budget level (1 low, 3 high)', type: 'number' },
    { key: 'minDays', label: 'Minimum days', type: 'number' },
    { key: 'featured', label: 'Featured', type: 'bool' },
    { key: 'order', label: 'Display order', type: 'number' },
  ];

  return (
    <div className="wrap pb-24 pt-28">
      <Seo title="Admin dashboard" />
      {db !== 'connected' && db !== 'checking' && (
        <div className="mb-8 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <Database className="shrink-0" />
          <p className="text-sm">
            The database is {db === 'error' ? 'not reachable' : 'not configured'}, so changes cannot be saved. Set <code>MONGODB_URI</code> in the server environment and redeploy. Content is seeded automatically on first connection.
          </p>
        </div>
      )}
      <div className="grid gap-10 lg:grid-cols-[230px,1fr]">
        <nav className="no-scrollbar flex gap-1 overflow-x-auto lg:sticky lg:top-28 lg:flex-col lg:self-start" aria-label="Admin">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => cx('flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition', isActive ? 'bg-deep text-glow' : 'hover:bg-black/5')}>
              <Icon size={17} /> {label}
            </NavLink>
          ))}
          <Link to="/" className="mt-4 hidden px-3 text-sm text-stone hover:text-deep lg:block">
            View the site
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-red-700 hover:bg-red-50 lg:mt-2"
          >
            <LogOut size={17} /> Sign out
          </button>
        </nav>
        <main className="min-w-0">
          <Routes>
            <Route index element={<Overview />} />
            <Route
              path="slider"
              element={
                <ResourceManager
                  resource="slides"
                  title="Homepage slides"
                  publicPaths={['/slides']}
                  quickToggle={{ key: 'active', label: 'Visible' }}
                  defaults={{ destinationSlug: '', title: '', kicker: '', description: '', image: { path: '', w: 1920 }, theme: THEMES.jaflong, order: 9, active: true }}
                  columns={[
                    { key: 'image', label: 'Image', render: (d) => <Photo photo={d.image as never} width={960} className="h-12 w-20 rounded-lg object-cover" /> },
                    { key: 'title', label: 'Title' },
                    { key: 'theme', label: 'Theme', render: (d) => <Swatches t={d.theme as Record<string, string>} /> },
                    { key: 'order', label: 'Order' },
                  ]}
                  fields={[
                    { key: 'destinationSlug', label: 'Destination', type: 'select', options: destOpts },
                    { key: 'title', label: 'Title', type: 'text', required: true },
                    { key: 'kicker', label: 'Location line', type: 'text', help: 'For example: Gowainghat, Sylhet' },
                    { key: 'description', label: 'Description', type: 'textarea' },
                    { key: 'image', label: 'Slide image', type: 'photo' },
                    { key: 'theme', label: 'Slide theme colors', type: 'theme' },
                    { key: 'order', label: 'Order', type: 'number' },
                    { key: 'active', label: 'Visible on homepage', type: 'bool' },
                  ]}
                  prepare={(d) => {
                    // Fill gaps from the chosen destination so a slide is never half empty.
                    const dest = dests.find((x) => x.slug === d.destinationSlug);
                    if (!dest) return d;
                    const img = d.image as { path?: string; url?: string } | undefined;
                    return {
                      ...d,
                      title: d.title || dest.name,
                      kicker: d.kicker || `${dest.area}, ${dest.district}`,
                      description: d.description || dest.summary,
                      image: img?.path || img?.url ? d.image : dest.cover,
                    };
                  }}
                />
              }
            />
            <Route
              path="destinations"
              element={
                <ResourceManager
                  resource="destinations"
                  title="Destinations"
                  publicPaths={['/destinations']}
                  quickToggle={{ key: 'featured', label: 'Featured' }}
                  defaults={{ name: '', slug: '', nameBn: '', area: '', district: 'Sylhet', tagline: '', summary: '', story: [], category: '', experiences: [], bestSeason: '', bestMonths: [], lat: 24.9, lng: 91.87, distanceKm: 0, cover: { path: '', w: 1920 }, gallery: [], theme: THEMES.jaflong, howToGet: [], costs: [], nearby: [], tips: [], foodNotes: [], budgetLevel: 1, minDays: 1, featured: false, order: 99 }}
                  columns={[
                    { key: 'cover', label: 'Cover', render: (d) => <Photo photo={d.cover as never} width={960} className="h-12 w-20 rounded-lg object-cover" /> },
                    { key: 'name', label: 'Name', render: (d) => <Link className="font-semibold hover:underline" to={`/destinations/${d.slug}`}>{String(d.name)}</Link> },
                    { key: 'district', label: 'District' },
                    { key: 'theme', label: 'Theme', render: (d) => <Swatches t={d.theme as Record<string, string>} /> },
                    { key: 'rating', label: 'Rating', render: (d) => (d.reviewCount ? `${d.rating} (${d.reviewCount})` : 'None') },
                  ]}
                  fields={destFields}
                />
              }
            />
            <Route
              path="categories"
              element={
                <ResourceManager
                  resource="categories"
                  title="Categories"
                  publicPaths={['/categories']}
                  defaults={{ slug: '', name: '', description: '' }}
                  columns={[{ key: 'name', label: 'Name' }, { key: 'slug', label: 'Slug' }, { key: 'description', label: 'Description' }]}
                  fields={[
                    { key: 'name', label: 'Name', type: 'text', required: true },
                    { key: 'slug', label: 'Slug', type: 'text', required: true },
                    { key: 'description', label: 'Description', type: 'textarea' },
                  ]}
                />
              }
            />
            <Route
              path="places"
              element={
                <ResourceManager
                  resource="places"
                  title="Restaurants and hotels"
                  publicPaths={['/places']}
                  defaults={{ slug: '', kind: 'restaurant', name: '', area: '', description: '', priceFrom: 0, priceNote: 'per person', specialty: '' }}
                  columns={[{ key: 'name', label: 'Name' }, { key: 'kind', label: 'Type' }, { key: 'area', label: 'Area' }, { key: 'priceFrom', label: 'From (BDT)' }]}
                  fields={[
                    { key: 'kind', label: 'Type', type: 'select', options: [{ value: 'restaurant', label: 'Restaurant' }, { value: 'hotel', label: 'Hotel or stay' }] },
                    { key: 'name', label: 'Name', type: 'text', required: true },
                    { key: 'slug', label: 'Slug', type: 'text', required: true },
                    { key: 'area', label: 'Area', type: 'text' },
                    { key: 'destinationSlug', label: 'Near destination', type: 'select', options: destOpts },
                    { key: 'description', label: 'Description', type: 'textarea' },
                    { key: 'specialty', label: 'Specialty', type: 'text' },
                    { key: 'priceFrom', label: 'Price from (BDT)', type: 'number' },
                    { key: 'priceNote', label: 'Price note', type: 'text', help: 'per person, per night' },
                    { key: 'lat', label: 'Latitude', type: 'number' },
                    { key: 'lng', label: 'Longitude', type: 'number' },
                  ]}
                />
              }
            />
            <Route
              path="posts"
              element={
                <ResourceManager
                  resource="posts"
                  title="Stories"
                  publicPaths={['/posts']}
                  quickToggle={{ key: 'published', label: 'Published' }}
                  defaults={{ slug: '', title: '', excerpt: '', author: 'SYLHET editors', date: new Date().toISOString().slice(0, 10), readMinutes: 4, cover: { path: '', w: 1920 }, body: [], published: true }}
                  columns={[
                    { key: 'cover', label: 'Cover', render: (d) => <Photo photo={d.cover as never} width={960} className="h-12 w-20 rounded-lg object-cover" /> },
                    { key: 'title', label: 'Title' },
                    { key: 'date', label: 'Date' },
                  ]}
                  fields={[
                    { key: 'title', label: 'Title', type: 'text', required: true },
                    { key: 'slug', label: 'Slug', type: 'text', required: true },
                    { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
                    { key: 'author', label: 'Author', type: 'text' },
                    { key: 'date', label: 'Date', type: 'date' },
                    { key: 'readMinutes', label: 'Reading time (minutes)', type: 'number' },
                    { key: 'cover', label: 'Cover photo', type: 'photo' },
                    { key: 'body', label: 'Body paragraphs', type: 'lines', help: 'One paragraph per line' },
                    { key: 'destinationSlug', label: 'Related destination', type: 'select', options: destOpts },
                    { key: 'published', label: 'Published', type: 'bool' },
                  ]}
                />
              }
            />
            <Route path="reviews" element={<ReviewsAdmin />} />
            <Route path="users" element={<UsersAdmin selfId={user._id} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Swatches({ t }: { t?: Record<string, string> }) {
  if (!t) return null;
  return (
    <span className="flex">
      {['deep', 'accent', 'mist'].map((k) => (
        <span key={k} title={`${k} ${t[k]}`} className="-ml-1 h-6 w-6 rounded-full border-2 border-white first:ml-0" style={{ background: t[k] }} />
      ))}
    </span>
  );
}

interface Stats {
  destinations: number;
  users: number;
  pendingReviews: number;
  approvedReviews: number;
  subscribers: number;
  posts: number;
  places: number;
  topFavorites: { _id: string; n: number }[];
  views: { _id: string; n: number }[];
  topPages: { _id: string; n: number }[];
}

function Overview() {
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api<Stats>('/admin/stats').then(setS).catch((e: ApiError) => setErr(e.message));
  }, []);
  if (err) return <p className="rounded-xl bg-red-50 p-4 text-red-800">{err}</p>;
  if (!s) return <p className="text-stone">Loading statistics</p>;
  const max = Math.max(1, ...s.views.map((v) => v.n));
  const total = s.views.reduce((a, v) => a + v.n, 0);
  return (
    <div className="space-y-10">
      <h2 className="text-4xl">Overview</h2>
      <MediaPanel />
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Page views, 30 days', total],
          ['Registered users', s.users],
          ['Reviews waiting', s.pendingReviews],
          ['Newsletter subscribers', s.subscribers],
          ['Destinations', s.destinations],
          ['Approved reviews', s.approvedReviews],
          ['Stories', s.posts],
          ['Restaurants and hotels', s.places],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-2xl border rule bg-white/60 p-5">
            <dt className="text-sm text-stone">{k}</dt>
            <dd className="tabular mt-1 font-display text-4xl">{Number(v).toLocaleString()}</dd>
          </div>
        ))}
      </dl>
      <div className="rounded-2xl border rule bg-white/60 p-6">
        <h3 className="font-sans text-lg font-semibold">Daily page views</h3>
        {s.views.length ? (
          <div className="mt-6 flex h-48 items-end gap-1" role="img" aria-label={`Page views over the last ${s.views.length} days, peak ${max}`}>
            {s.views.map((v) => (
              <div key={v._id} className="group relative flex-1">
                <div className="rounded-t bg-deep transition group-hover:bg-accent" style={{ height: `${(v.n / max) * 176}px` }} />
                <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-deep px-2 py-0.5 text-xs text-glow group-hover:block">
                  {niceDate(v._id)}: {v.n}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-stone">No visits recorded yet. Views are counted as people browse the public site.</p>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border rule bg-white/60 p-6">
          <h3 className="font-sans text-lg font-semibold">Most saved destinations</h3>
          <ol className="mt-4 space-y-2">
            {s.topFavorites.map((f) => (
              <li key={f._id} className="flex justify-between">
                <span>{f._id}</span>
                <span className="tabular">{f.n}</span>
              </li>
            ))}
            {!s.topFavorites.length && <li className="text-stone">No saves yet.</li>}
          </ol>
        </div>
        <div className="rounded-2xl border rule bg-white/60 p-6">
          <h3 className="font-sans text-lg font-semibold">Top pages</h3>
          <ol className="mt-4 space-y-2">
            {s.topPages.map((p) => (
              <li key={p._id} className="flex justify-between gap-4">
                <span className="truncate">{p._id}</span>
                <span className="tabular">{p.n}</span>
              </li>
            ))}
            {!s.topPages.length && <li className="text-stone">No data yet.</li>}
          </ol>
        </div>
      </div>
    </div>
  );
}

interface AdminReview {
  _id: string;
  destinationSlug: string;
  rating: number;
  text: string;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
}

function ReviewsAdmin() {
  const [status, setStatus] = useState('pending');
  const [list, setList] = useState<AdminReview[]>([]);
  const [err, setErr] = useState('');
  const load = () => api<AdminReview[]>(`/admin/reviews?status=${status}`).then(setList).catch((e: ApiError) => setErr(e.message));
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  const act = async (id: string, s: string | null) => {
    try {
      if (s) await api(`/admin/reviews/${id}`, { method: 'PATCH', json: { status: s } });
      else if (window.confirm('Delete this review permanently?')) await api(`/admin/reviews/${id}`, { method: 'DELETE' });
      invalidate('/destinations');
      await load();
    } catch (e) {
      setErr((e as ApiError).message);
    }
  };
  return (
    <div>
      <h2 className="text-4xl">Reviews</h2>
      <div className="mt-6 flex gap-2">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button key={s} className="chip capitalize" aria-pressed={status === s} onClick={() => setStatus(s)}>
            {s}
          </button>
        ))}
      </div>
      {err && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{err}</p>}
      <ul className="mt-6 space-y-4">
        {list.map((r) => (
          <li key={r._id} className="rounded-2xl border rule bg-white/60 p-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="font-semibold">{r.user?.name ?? 'Deleted user'}</span>
              <span className="text-stone">{r.user?.email}</span>
              <Link to={`/destinations/${r.destinationSlug}`} className="underline">
                {r.destinationSlug}
              </Link>
              <span>{'★'.repeat(r.rating)}</span>
              <span className="text-stone">{niceDate(r.createdAt)}</span>
            </div>
            <p className="mt-3">{r.text}</p>
            <div className="mt-4 flex gap-2">
              {r.status !== 'approved' && (
                <button className="btn-deep py-2 text-sm" onClick={() => act(r._id, 'approved')}>
                  Approve
                </button>
              )}
              {r.status !== 'rejected' && (
                <button className="btn-line py-2 text-sm" onClick={() => act(r._id, 'rejected')}>
                  Reject
                </button>
              )}
              <button className="px-3 text-sm font-semibold text-red-700" onClick={() => act(r._id, null)}>
                Delete
              </button>
            </div>
          </li>
        ))}
        {!list.length && <li className="text-stone">No {status} reviews.</li>}
      </ul>
    </div>
  );
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  favorites: string[];
  createdAt: string;
}

function UsersAdmin({ selfId }: { selfId: string }) {
  const [list, setList] = useState<AdminUser[]>([]);
  const [err, setErr] = useState('');
  const load = () => api<AdminUser[]>('/admin/users').then(setList).catch((e: ApiError) => setErr(e.message));
  useEffect(() => {
    void load();
  }, []);
  const patch = async (id: string, body: object) => {
    try {
      await api(`/admin/users/${id}`, { method: 'PATCH', json: body });
      await load();
    } catch (e) {
      setErr((e as ApiError).message);
    }
  };
  const del = async (u: AdminUser) => {
    if (!window.confirm(`Delete ${u.email} and their reviews? This cannot be undone.`)) return;
    try {
      await api(`/admin/users/${u._id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setErr((e as ApiError).message);
    }
  };
  return (
    <div>
      <h2 className="text-4xl">Users</h2>
      {err && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{err}</p>}
      <div className="mt-6 overflow-x-auto rounded-2xl border rule bg-white/60">
        <table className="w-full min-w-[640px] text-left text-[15px]">
          <thead className="text-sm text-stone">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Saved</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u._id} className="border-t rule">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{niceDate(u.createdAt)}</td>
                <td className="px-4 py-3">{u.favorites?.length ?? 0}</td>
                <td className="px-4 py-3">
                  <select className="rounded-lg border rule bg-transparent px-2 py-1" value={u.role} disabled={u._id === selfId} onChange={(e) => patch(u._id, { role: e.target.value })} aria-label={`Role for ${u.email}`}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button className={`chip ${u.active ? '' : 'border-red-700 text-red-700'}`} disabled={u._id === selfId} onClick={() => patch(u._id, { active: !u.active })}>
                    {u.active ? 'Active' : 'Suspended'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  {u._id !== selfId && (
                    <button className="text-sm font-semibold text-red-700" onClick={() => del(u)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface MediaState {
  enabled: boolean;
  total: number;
  migrated: number;
  remaining: number;
  errors?: { path: string; error: string }[];
}

/** Copies every site photo into the Cloudinary media library, a batch at a time. */
function MediaPanel() {
  const [m, setM] = useState<MediaState | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    api<MediaState>('/admin/media').then(setM).catch((e: ApiError) => setErr(e.message));
  }, []);
  const run = async () => {
    setBusy(true);
    setErr('');
    const failed: string[] = [];
    try {
      const pending = await api<{ path: string; source: string; publicId: string }[]>('/admin/media/pending');
      for (const p of pending) {
        try {
          // The browser downloads from Wikimedia, then uploads straight to Cloudinary with a server signature.
          const img = await fetch(p.source);
          if (!img.ok) throw new Error(`download ${img.status}`);
          const blob = await img.blob();
          const sig = await api<{ cloudName: string; apiKey: string; timestamp: number; signature: string; folder: string; public_id: string }>('/admin/media/sign', { method: 'POST', json: { publicId: p.publicId } });
          const fd = new FormData();
          fd.append('file', blob);
          fd.append('api_key', sig.apiKey);
          fd.append('timestamp', String(sig.timestamp));
          fd.append('signature', sig.signature);
          fd.append('folder', sig.folder);
          fd.append('public_id', sig.public_id);
          const up = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: 'POST', body: fd });
          const out = await up.json();
          if (!up.ok) throw new Error(out?.error?.message ?? `upload ${up.status}`);
          await api('/admin/media/record', { method: 'POST', json: { path: p.path, url: out.secure_url, w: out.width } });
          setM((s) => (s ? { ...s, migrated: s.migrated + 1, remaining: s.remaining - 1 } : s));
        } catch (e) {
          failed.push(`${p.path.split('/').pop()}: ${(e as Error).message}`);
        }
        await new Promise((r) => setTimeout(r, 400));
      }
      if (failed.length) setErr(`${failed.length} photo(s) could not be moved. Run again to retry. First error: ${failed[0]}`);
      setM(await api<MediaState>('/admin/media'));
      invalidate('/');
    } catch (e) {
      setErr((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  };
  if (!m) return err ? <p className="text-sm text-red-700">{err}</p> : null;
  const pct = m.total ? Math.round((m.migrated / m.total) * 100) : 0;
  return (
    <div className="rounded-2xl border rule bg-white/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-sans text-lg font-semibold">Photos on Cloudinary</h3>
          <p className="text-sm text-stone">
            {m.enabled ? `${m.migrated} of ${m.total} photos are served from your Cloudinary media library.` : 'Cloudinary is not configured on the server.'}
          </p>
        </div>
        {m.enabled && m.remaining > 0 && (
          <button className="btn-deep" onClick={run} disabled={busy}>
            {busy ? 'Moving photos' : `Move ${m.remaining} photos to Cloudinary`}
          </button>
        )}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/10">
        <div className="h-full bg-deep transition-all" style={{ width: `${pct}%` }} />
      </div>
      {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
    </div>
  );
}
