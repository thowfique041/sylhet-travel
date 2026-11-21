import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useTrip } from '@/context/TripContext';
import { Seo } from '@/components/Seo';
import { Photo } from '@/components/Photo';
import { SavedTrips } from './Planner';
import { DestinationCard } from '@/components/DestinationCard';
import { useData } from '@/hooks/useData';
import type { Destination } from '@shared/types';
import { IMG } from '@shared/seed';
import { ApiError } from '@/lib/api';

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { login, register, user } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/account';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' && next === '/account' ? '/admin' : next} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const u = mode === 'login' ? await login(form.email, form.password) : await register(form.name, form.email, form.password, favorites);
      navigate(u.role === 'admin' && next === '/account' ? '/admin' : next, { replace: true });
    } catch (e2) {
      setErr((e2 as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="grid min-h-[100svh] lg:grid-cols-2">
      <Seo title={mode === 'login' ? 'Sign in' : 'Create an account'} />
      <div className="relative hidden overflow-hidden lg:block">
        <Photo photo={IMG.ratargul[3]} width={1920} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--c-deep)] to-transparent" />
        <p className="absolute bottom-12 left-12 max-w-sm font-display text-4xl text-glow">Save places, plan trips, and pick them up on any device.</p>
      </div>
      <div className="flex items-center px-5 pb-16 pt-28 sm:px-12">
        <form onSubmit={submit} className="mx-auto w-full max-w-md space-y-5">
          <h1 className="text-5xl">{mode === 'login' ? 'Welcome back' : 'Create an account'}</h1>
          <p className="text-stone">
            {mode === 'login' ? 'New here? ' : 'Already have an account? '}
            <Link to={`${mode === 'login' ? '/register' : '/login'}${params.toString() ? `?${params}` : ''}`} className="font-semibold text-deep underline decoration-accent underline-offset-4">
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </Link>
          </p>
          {mode === 'register' && (
            <label className="block">
              <span className="label">Name</span>
              <input className="field" required minLength={2} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
          )}
          <label className="block">
            <span className="label">Email</span>
            <input className="field" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input className="field" type="password" required minLength={mode === 'register' ? 8 : 1} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {mode === 'register' && <span className="mt-1 block text-sm text-stone">At least 8 characters.</span>}
          </label>
          {err && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
              {err}
            </p>
          )}
          <button className="btn-deep w-full" disabled={busy}>
            {busy ? 'Please wait' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
          {mode === 'register' && favorites.length > 0 && <p className="text-sm text-stone">Your {favorites.length} saved places will move to the new account.</p>}
        </form>
      </div>
    </section>
  );
}

export function AccountPage() {
  const { user, logout, ready } = useAuth();
  const { favorites } = useFavorites();
  const { saved, load, remove } = useTrip();
  const navigate = useNavigate();
  const { data: all = [] } = useData<Destination[]>('/destinations');
  const favs = all.filter((d) => favorites.includes(d.slug));
  if (!ready) return <div className="h-[60vh]" />;
  return (
    <section className="wrap pb-24 pt-32 lg:pt-40">
      <Seo title="My account" />
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-[clamp(2.8rem,6vw,5.5rem)] font-medium">{user ? `Hello, ${user.name.split(' ')[0]}` : 'Saved in this browser'}</h1>
          <p className="mt-3 text-stone">{user ? user.email : 'Sign in to keep your saved places and trips on every device.'}</p>
        </div>
        <div className="flex gap-3">
          {user?.role === 'admin' && (
            <Link to="/admin" className="btn-deep">
              Admin dashboard
            </Link>
          )}
          {user ? (
            <button
              className="btn-line"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Sign out
            </button>
          ) : (
            <Link to="/login" className="btn-deep">
              Sign in
            </Link>
          )}
        </div>
      </div>
      <h2 id="saved" className="mt-16 text-4xl">
        Saved places
      </h2>
      {favs.length ? (
        <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {favs.map((d) => (
            <DestinationCard key={d.slug} d={d} size="sm" />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-stone">
          Nothing saved yet. Tap the heart on any destination to keep it here. <Link to="/destinations" className="font-semibold text-deep underline">Browse destinations</Link>
        </p>
      )}
      <h2 className="mt-20 text-4xl">Trips</h2>
      <div className="mt-6 max-w-xl">
        {saved.length ? (
          <SavedTrips
            light
            saved={saved}
            onLoad={(t) => {
              load(t);
              navigate('/planner#builder');
            }}
            onRemove={remove}
          />
        ) : (
          <p className="text-stone">
            No trips yet. <Link to="/planner" className="font-semibold text-deep underline">Open the planner</Link>
          </p>
        )}
      </div>
    </section>
  );
}
