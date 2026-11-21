import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Bus, ChevronLeft, ChevronRight, Clock, Lightbulb, MapPin, Plus, Route, Star, Users, Utensils, Wallet, X } from 'lucide-react';
import type { Destination, Place, Review } from '@shared/types';
import { useData } from '@/hooks/useData';
import { useTheme } from '@/context/ThemeContext';
import { useTrip } from '@/context/TripContext';
import { useAuth } from '@/context/AuthContext';
import { Photo } from '@/components/Photo';
import { Seo } from '@/components/Seo';
import { FavoriteButton } from '@/components/FavoriteButton';
import { RevealImage } from '@/components/Reveal';
import { DestinationCard } from '@/components/DestinationCard';
import { api, ApiError } from '@/lib/api';
import { photoUrl } from '@/lib/images';
import { MONTHS, cx, niceDate, range, taka } from '@/lib/format';
import NotFound from './NotFound';

const MapView = lazy(() => import('@/components/MapView'));

export default function DestinationDetail() {
  const { slug = '' } = useParams();
  const { data: d, loading, error } = useData<Destination>(`/destinations/${slug}`);
  const { data: all = [] } = useData<Destination[]>('/destinations');
  const { data: places = [] } = useData<Place[]>('/places');
  const { setTheme } = useTheme();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const coverY = useTransform(scrollY, [0, 800], ['0%', reduce ? '0%' : '18%']);
  const coverScale = useTransform(scrollY, [0, 800], [1.04, reduce ? 1.04 : 1.14]);

  useEffect(() => {
    if (d?.theme) setTheme(d.theme);
  }, [d, setTheme]);

  if (loading && !d) return <div className="h-[100svh] animate-pulse bg-deep" />;
  if (error?.status === 404 || (!loading && !d)) return <NotFound />;
  if (!d) return null;

  const nearby = all.filter((x) => d.nearby.includes(x.slug));
  const stays = places.filter((p) => p.kind === 'hotel' && p.destinationSlug === d.slug);
  const eats = places.filter((p) => p.kind === 'restaurant' && (p.destinationSlug === d.slug || !p.destinationSlug)).slice(0, 3);

  return (
    <>
      <Seo
        title={`${d.name}, ${d.district}: travel guide`}
        description={`${d.summary} Best time: ${d.bestSeason}.`}
        image={photoUrl(d.cover, 1280)}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'TouristAttraction',
          name: d.name,
          alternateName: d.nameBn,
          description: d.summary,
          image: photoUrl(d.cover, 1280),
          geo: { '@type': 'GeoCoordinates', latitude: d.lat, longitude: d.lng },
          address: { '@type': 'PostalAddress', addressLocality: d.area, addressRegion: d.district, addressCountry: 'BD' },
          ...(d.reviewCount ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: d.rating, reviewCount: d.reviewCount } } : {}),
        }}
      />

      {/* Cover */}
      <section className="relative h-[100svh] min-h-[560px] overflow-hidden bg-deep text-glow">
        <motion.div className="absolute inset-0" style={{ y: coverY, scale: coverScale }}>
          <Photo photo={d.cover} width={1920} priority className="h-full w-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--c-deep)_2%,color-mix(in_srgb,var(--c-deep)_40%,transparent)_45%,transparent_75%)]" />
        <div className="grain absolute inset-0" />
        <div className="wrap relative flex h-full flex-col justify-end pb-14">
          <Link to="/destinations" className="mb-auto mt-24 inline-flex w-fit items-center gap-1 text-sm text-glow/80 hover:text-glow">
            <ChevronLeft size={16} /> All destinations
          </Link>
          <motion.p initial={reduce ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.77, 0, 0.18, 1] }} aria-hidden className="ghost-bn text-[clamp(5rem,18vw,15rem)]">
            {d.nameBn}
          </motion.p>
          <h1 className="-mt-[0.4em] max-w-[12ch] text-[clamp(3.2rem,9vw,8.5rem)] font-medium leading-[0.92]">{d.name}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-[15px] text-glow/85">
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-accent" /> {d.area}, {d.district}
            </span>
            <span className="flex items-center gap-2">
              <Route size={16} className="text-accent" /> {d.distanceKm} km from Sylhet city
            </span>
            {!!d.reviewCount && (
              <span className="flex items-center gap-2">
                <Star size={16} className="text-accent" fill="currentColor" /> {d.rating} from {d.reviewCount} reviews
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="wrap grid gap-14 py-20 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-7">
          <p className="font-display text-[clamp(1.8rem,3.4vw,2.8rem)] leading-tight">{d.tagline}.</p>
          <div className="mt-8 space-y-6 text-[18px] leading-[1.8]">
            {d.story.map((para, i) => (
              <p key={i} className="measure text-pretty">
                {para}
              </p>
            ))}
          </div>
        </div>
        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="sticky top-28 space-y-8 rounded-[26px] bg-deep p-7 text-glow">
            <div>
              <p className="text-sm text-glow/60">Best time to visit</p>
              <p className="mt-1 text-lg">{d.bestSeason}</p>
              <MonthStrip months={d.bestMonths} />
            </div>
            <dl className="grid grid-cols-2 gap-5 border-t border-white/15 pt-6 text-sm">
              <Fact icon={Clock} label="Plan for" value={`${d.minDays} day${d.minDays > 1 ? 's' : ''} or more`} />
              <Fact icon={Wallet} label="Budget" value={['Easy on the wallet', 'Moderate', 'Higher'][d.budgetLevel - 1]} />
            </dl>
            <div className="flex flex-col gap-3">
              <AddToTrip slug={d.slug} />
              <FavoriteButton slug={d.slug} name={d.name} withLabel className="justify-center text-glow" />
            </div>
          </div>
        </aside>
      </section>

      <Gallery photos={d.gallery} />

      {/* Getting there and costs */}
      <section className="wrap grid gap-16 py-24 lg:grid-cols-2">
        <div>
          <h2 className="text-5xl">How to get there</h2>
          <ol className="mt-8 space-y-6">
            {d.howToGet.map((h, i) => (
              <li key={i} className="grid grid-cols-[auto,1fr] gap-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-accent font-display text-lg text-deep">{i + 1}</span>
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    <Bus size={16} className="text-stone" /> {h.mode}
                  </p>
                  <p className="mt-1 leading-relaxed opacity-85">{h.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <CostTable d={d} />
      </section>

      {/* Map + nearby */}
      <section className="bg-[color-mix(in_srgb,var(--c-accent)_14%,var(--c-mist))] py-24">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-5xl">On the map</h2>
            <Suspense fallback={<div className="mt-8 h-[440px] animate-pulse rounded-[22px] bg-stone/20" />}>
              <MapView
                className="mt-8 overflow-hidden rounded-[22px]"
                height={440}
                pins={[{ id: d.slug, lat: d.lat, lng: d.lng, title: d.name, sub: d.area, main: true }, ...nearby.map((n) => ({ id: n.slug, lat: n.lat, lng: n.lng, title: n.name, sub: n.area, to: `/destinations/${n.slug}` }))]}
              />
            </Suspense>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}`} target="_blank" rel="noreferrer" className="btn-deep mt-6">
              Get directions
            </a>
          </div>
          <div className="lg:col-span-5">
            <h2 className="text-5xl">Nearby</h2>
            <div className="mt-8 grid gap-10">
              {nearby.slice(0, 2).map((n) => (
                <DestinationCard key={n.slug} d={n} size="sm" sizes="(min-width:1024px) 38vw, 100vw" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stay, eat, tips */}
      <section className="wrap grid gap-16 py-24 lg:grid-cols-3">
        <div>
          <h2 className="text-4xl">Where to stay</h2>
          <ul className="mt-6 space-y-5">
            {(stays.length ? stays : places.filter((p) => p.kind === 'hotel').slice(0, 2)).map((p) => (
              <li key={p.slug} className="border-t rule pt-5">
                <p className="font-display text-2xl">{p.name}</p>
                <p className="text-sm text-stone">{p.area}</p>
                <p className="mt-2 text-[15px] opacity-85">{p.description}</p>
                <p className="mt-2 text-sm font-semibold">
                  From {taka(p.priceFrom)} {p.priceNote}
                </p>
              </li>
            ))}
          </ul>
          {!stays.length && <p className="mt-4 text-sm text-stone">Most visitors base themselves in Sylhet city for this trip.</p>}
        </div>
        <div>
          <h2 className="text-4xl">What to eat</h2>
          <ul className="mt-6 space-y-3">
            {d.foodNotes.map((f) => (
              <li key={f} className="flex gap-3">
                <Utensils size={18} className="mt-1 shrink-0 text-stone" /> {f}
              </li>
            ))}
          </ul>
          <ul className="mt-6 space-y-4">
            {eats.map((p) => (
              <li key={p.slug} className="border-t rule pt-4">
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-stone">
                  {p.specialty}, from {taka(p.priceFrom)}
                </p>
              </li>
            ))}
          </ul>
          <Link to="/food" className="mt-6 inline-block text-[15px] font-semibold underline decoration-accent decoration-2 underline-offset-4">
            Sylheti food guide
          </Link>
        </div>
        <div>
          <h2 className="text-4xl">Good to know</h2>
          <ul className="mt-6 space-y-4">
            {d.tips.map((t) => (
              <li key={t} className="flex gap-3 leading-relaxed">
                <Lightbulb size={18} className="mt-1 shrink-0 text-accent" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Reviews slug={d.slug} name={d.name} />
    </>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-glow/60">
        <Icon size={14} /> {label}
      </dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

function MonthStrip({ months }: { months: number[] }) {
  const now = new Date().getMonth() + 1;
  return (
    <div className="mt-4 grid grid-cols-12 gap-1" aria-label={`Good months: ${months.map((m) => MONTHS[m - 1]).join(', ')}`}>
      {MONTHS.map((m, i) => (
        <div key={m} className="text-center">
          <div className={cx('h-8 rounded-[4px]', months.includes(i + 1) ? 'bg-accent' : 'bg-white/12')} />
          <span className={cx('mt-1 block text-[10px]', i + 1 === now ? 'font-bold text-glow' : 'text-glow/50')}>{m[0]}</span>
        </div>
      ))}
    </div>
  );
}

function AddToTrip({ slug }: { slug: string }) {
  const { addStop, hasStop } = useTrip();
  const added = hasStop(slug);
  return added ? (
    <Link to="/planner#builder" className="btn-accent">
      In your trip. Open planner
    </Link>
  ) : (
    <button className="btn-accent" onClick={() => addStop(slug)}>
      <Plus size={18} /> Add to my trip
    </button>
  );
}

function Gallery({ photos }: { photos: Destination['gallery'] }) {
  const [open, setOpen] = useState<number | null>(null);
  const shown = photos.slice(0, 5);
  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((o) => (o === null ? o : (o + 1) % photos.length));
      if (e.key === 'ArrowLeft') setOpen((o) => (o === null ? o : (o - 1 + photos.length) % photos.length));
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, photos.length]);

  const spans = ['md:col-span-7 md:row-span-2', 'md:col-span-5', 'md:col-span-5', 'md:col-span-4', 'md:col-span-8'];
  return (
    <section className="wrap" aria-label="Gallery">
      <div className="grid auto-rows-[220px] gap-4 sm:auto-rows-[280px] md:grid-cols-12">
        {shown.map((p, i) => (
          <RevealImage key={p.path + i} delay={i * 0.06} className={cx('overflow-hidden rounded-[22px]', spans[i])}>
            <button className="group h-full w-full" onClick={() => setOpen(i)} aria-label={`Open photo: ${p.alt ?? ''}`}>
              <Photo photo={p} width={i === 0 ? 1280 : 960} sizes={i === 0 ? '58vw' : '40vw'} className="h-full w-full object-cover transition-transform duration-[1.2s] ease-cine group-hover:scale-105" />
            </button>
          </RevealImage>
        ))}
      </div>
      {photos.length > 5 && (
        <button className="btn-line mt-6" onClick={() => setOpen(5)}>
          View all {photos.length} photos
        </button>
      )}
      <AnimatePresence>
        {open !== null && (
          <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/92" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal aria-label="Photo viewer" onClick={() => setOpen(null)}>
            <motion.div key={open} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-h-[86vh] max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
              <Photo photo={photos[open]} width={1920} className="max-h-[80vh] w-auto rounded-xl object-contain" />
              <p className="mt-3 text-center text-sm text-white/75">{photos[open].alt}</p>
            </motion.div>
            <button className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white" aria-label="Close" onClick={() => setOpen(null)}>
              <X />
            </button>
            <button className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + photos.length) % photos.length); }}>
              <ChevronLeft />
            </button>
            <button className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % photos.length); }}>
              <ChevronRight />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function CostTable({ d }: { d: Destination }) {
  const [people, setPeople] = useState(2);
  // Lines priced "per boat" or for transport are shared by the group; the rest are per person.
  const shared = (label: string, note?: string) => /boat|transport/i.test(label) && !/per person/i.test(note ?? '');
  const total = useMemo(
    () =>
      d.costs.reduce(
        (acc, c) => {
          const f = shared(c.label, c.note) ? 1 / people : 1;
          return [acc[0] + c.min * f, acc[1] + c.max * f];
        },
        [0, 0],
      ),
    [d.costs, people],
  );
  return (
    <div>
      <h2 className="text-5xl">What it costs</h2>
      <p className="mt-3 text-stone">Estimated in Bangladeshi Taka for a day trip from Sylhet city. Boats and reserved transport are split across the group.</p>
      <table className="mt-8 w-full text-left text-[15px]">
        <tbody>
          {d.costs.map((c) => (
            <tr key={c.label} className="border-t rule align-top">
              <th scope="row" className="py-4 pr-4 font-medium">
                {c.label}
                {c.note && <span className="block text-sm font-normal text-stone">{c.note}</span>}
              </th>
              <td className="tabular py-4 text-right">{range(c.min, c.max)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-deep p-5 text-glow">
        <label className="flex items-center gap-3 text-sm">
          <Users size={16} /> Travelers
          <input type="number" min={1} max={30} value={people} onChange={(e) => setPeople(Math.max(1, Math.min(30, Number(e.target.value) || 1)))} className="w-16 rounded-lg bg-white/10 px-2 py-1 text-center text-glow" />
        </label>
        <p className="tabular font-display text-2xl">
          {range(total[0], total[1])} <span className="font-sans text-sm text-glow/70">per person</span>
        </p>
      </div>
    </div>
  );
}

function Reviews({ slug, name }: { slug: string; name: string }) {
  const { user } = useAuth();
  const { data, reload } = useData<{ reviews: Review[]; mine: Review | null; enabled: boolean }>(`/destinations/${slug}/reviews`);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api(`/destinations/${slug}/reviews`, { method: 'POST', json: { rating, text } });
      setMsg({ ok: true, text: 'Thanks. Your review is waiting for a moderator and will appear once approved.' });
      setText('');
      void reload();
    } catch (err) {
      setMsg({ ok: false, text: (err as ApiError).message });
    } finally {
      setBusy(false);
    }
  };

  const reviews = data?.reviews ?? [];
  return (
    <section className="border-t rule py-24" aria-labelledby="reviews-h">
      <div className="wrap grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id="reviews-h" className="text-5xl">
            Traveler reviews
          </h2>
          {data?.enabled === false ? (
            <p className="mt-4 text-stone">Reviews open once the site database is connected.</p>
          ) : user ? (
            <form onSubmit={submit} className="mt-8 space-y-4">
              {data?.mine && <p className="text-sm text-stone">You reviewed {name} before ({data.mine.status}). Sending again replaces it.</p>}
              <fieldset>
                <legend className="label">Your rating</legend>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`} aria-pressed={rating === n} className="p-1">
                      <Star size={26} className={n <= rating ? 'text-accent' : 'text-stone/50'} fill={n <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="block">
                <span className="label">Your review</span>
                <textarea value={text} onChange={(e) => setText(e.target.value)} required minLength={10} maxLength={1500} rows={5} className="field" placeholder={`When did you go to ${name}, and what should others know?`} />
              </label>
              <button className="btn-deep" disabled={busy}>
                {busy ? 'Sending' : 'Send review'}
              </button>
              {msg && (
                <p role="status" className={cx('text-sm', msg.ok ? 'text-deep' : 'text-red-700')}>
                  {msg.text}
                </p>
              )}
            </form>
          ) : (
            <p className="mt-6">
              <Link to={`/login?next=/destinations/${slug}`} className="btn-deep">
                Sign in to write a review
              </Link>
            </p>
          )}
        </div>
        <div className="lg:col-span-7">
          {reviews.length ? (
            <ul className="space-y-8">
              {reviews.map((r) => (
                <li key={r._id} className="border-b rule pb-8">
                  <div className="flex items-center gap-3">
                    <span className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={16} className={i < r.rating ? 'text-accent' : 'text-stone/40'} fill={i < r.rating ? 'currentColor' : 'none'} />
                      ))}
                    </span>
                    <span className="font-semibold">{typeof r.user === 'object' ? r.user.name : 'Traveler'}</span>
                    <span className="text-sm text-stone">{niceDate(r.createdAt)}</span>
                  </div>
                  <p className="mt-3 leading-relaxed">{r.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-stone">{data?.enabled === false ? '' : `No reviews of ${name} yet. Be the first to share how it went.`}</p>
          )}
        </div>
      </div>
    </section>
  );
}


