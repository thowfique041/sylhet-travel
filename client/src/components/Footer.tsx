import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

type IconProps = { size?: number };
const Facebook = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M14 8.5V6.8c0-.8.5-1 1-1h2.5V2h-3.4C10.6 2 10 4.6 10 6.3v2.2H7.5V12H10v10h4V12h3l.5-3.5H14z" /></svg>
);
const Instagram = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
);
const Youtube = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9l5.8 3.1-5.8 3.1z" /></svg>
);
import { api, ApiError } from '@/lib/api';

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL || 'hello@sylhet.travel';

export function Footer() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<{ kind: 'idle' | 'busy' | 'ok' | 'err'; msg?: string }>({ kind: 'idle' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ kind: 'busy' });
    try {
      await api('/newsletter', { method: 'POST', json: { email } });
      setState({ kind: 'ok', msg: 'Subscribed. The next season guide will arrive in your inbox.' });
      setEmail('');
    } catch (err) {
      setState({ kind: 'err', msg: (err as ApiError).message });
    }
  };

  return (
    <footer className="relative overflow-hidden bg-deep text-glow">
      <div className="wrap grid gap-14 py-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="font-bn text-6xl font-bold leading-none text-accent/90 sm:text-7xl">সিলেট</p>
          <h2 className="mt-6 max-w-md text-4xl sm:text-5xl">A season guide, four times a year.</h2>
          <p className="mt-4 max-w-md opacity-75">When the haors fill, when Lalakhal turns blue, when the tea is in flush. One email per season, nothing else.</p>
          <form onSubmit={submit} className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="nl" className="sr-only">
              Email address
            </label>
            <input
              id="nl"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 flex-1 rounded-full border border-white/25 bg-white/10 px-5 text-glow outline-none placeholder:text-white/50 focus:border-accent"
            />
            <button className="btn-accent h-12" disabled={state.kind === 'busy'}>
              {state.kind === 'busy' ? 'Subscribing' : 'Subscribe'}
            </button>
          </form>
          {state.msg && (
            <p role="status" className={`mt-3 text-sm ${state.kind === 'err' ? 'text-red-300' : 'text-accent'}`}>
              {state.msg}
            </p>
          )}
        </div>

        <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7 lg:pl-10">
          <div>
            <h3 className="font-sans text-sm font-semibold opacity-60">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {[
                ['/destinations', 'All destinations'],
                ['/destinations?category=wetlands', 'Haors and wetlands'],
                ['/destinations?category=tea-country', 'Tea country'],
                ['/planner', 'Trip planner'],
                ['/food', 'Food guide'],
                ['/stories', 'Travel stories'],
              ].map(([to, l]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-accent">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-sans text-sm font-semibold opacity-60">Contact</h3>
            <ul className="mt-4 space-y-3 text-[15px]">
              <li className="flex gap-2.5">
                <MapPin size={18} className="mt-0.5 shrink-0 text-accent" /> Zindabazar, Sylhet 3100, Bangladesh
              </li>
              <li className="flex gap-2.5">
                <Mail size={18} className="mt-0.5 shrink-0 text-accent" />
                <a href={`mailto:${CONTACT}`} className="hover:text-accent">
                  {CONTACT}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Phone size={18} className="mt-0.5 shrink-0 text-accent" /> National emergency: 999
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-sans text-sm font-semibold opacity-60">Follow</h3>
            <div className="mt-4 flex gap-2">
              {[
                [Facebook, import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com/hashtag/sylhet', 'Facebook'],
                [Instagram, import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/explore/tags/sylhet/', 'Instagram'],
                [Youtube, import.meta.env.VITE_YOUTUBE_URL || 'https://www.youtube.com/results?search_query=sylhet+travel', 'YouTube'],
              ].map(([Icon, href, label]) => {
                const I = Icon as typeof Facebook;
                return (
                  <a key={label as string} href={href as string} target="_blank" rel="noreferrer" aria-label={label as string} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 hover:border-accent hover:text-accent">
                    <I size={18} />
                  </a>
                );
              })}
            </div>
            <ul className="mt-8 space-y-2.5 text-[15px]">
              <li>
                <Link to="/credits" className="hover:text-accent">
                  Photo credits
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-accent">
                  Saved places
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="wrap flex flex-col gap-2 border-t border-white/10 py-6 text-sm opacity-60 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} SYLHET travel guide. Prices are estimates and change with the season.</p>
        <p>Photographs from Wikimedia Commons contributors, used under their licenses.</p>
      </div>
    </footer>
  );
}
