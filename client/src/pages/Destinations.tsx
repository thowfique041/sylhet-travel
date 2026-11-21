import { lazy, Suspense, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, Map as MapIcon, Search, X } from 'lucide-react';
import type { Category, Destination, Experience } from '@shared/types';
import { useData } from '@/hooks/useData';
import { Seo } from '@/components/Seo';
import { DestinationCard } from '@/components/DestinationCard';
import { MONTHS, cx } from '@/lib/format';

const MapView = lazy(() => import('@/components/MapView'));

export default function Destinations() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const experience = params.get('experience') ?? '';
  const month = params.get('month') ?? '';
  const view = params.get('view') === 'map' ? 'map' : 'grid';

  const { data: all = [], loading } = useData<Destination[]>('/destinations');
  const { data: categories = [] } = useData<Category[]>('/categories');
  const { data: experiences = [] } = useData<Experience[]>('/experiences');

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return all.filter((d) => {
      if (t && ![d.name, d.nameBn, d.area, d.district, d.summary, d.tagline].join(' ').toLowerCase().includes(t)) return false;
      if (category && d.category !== category) return false;
      if (experience && !d.experiences.includes(experience)) return false;
      if (month && !d.bestMonths.includes(Number(month))) return false;
      return true;
    });
  }, [all, q, category, experience, month]);

  const activeFilters = [category, experience, month, q].filter(Boolean).length;

  return (
    <>
      <Seo title="Destinations in Sylhet" description="Every destination in Sylhet division with the best season, how to get there and what it costs. Filter by category, activity and month." />
      <section className="wrap pb-10 pt-32 lg:pt-40">
        <h1 className="text-[clamp(3rem,8vw,7rem)] font-medium">Destinations</h1>
        <p className="mt-4 max-w-xl text-lg text-stone">Search by name or area, or narrow by the kind of place, the activity, and the month you plan to travel.</p>

        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          <label className="relative lg:col-span-5">
            <span className="sr-only">Search destinations</span>
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
            <input value={q} onChange={(e) => set('q', e.target.value)} placeholder="Search Jaflong, tea, Gowainghat" className="field pl-11" />
          </label>
          <select aria-label="Category" value={category} onChange={(e) => set('category', e.target.value)} className="field lg:col-span-3">
            <option value="">All kinds of place</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select aria-label="Month of travel" value={month} onChange={(e) => set('month', e.target.value)} className="field lg:col-span-2">
            <option value="">Any month</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                Good in {m}
              </option>
            ))}
          </select>
          <div className="flex rounded-xl border rule p-1 lg:col-span-2" role="group" aria-label="View">
            {(['grid', 'map'] as const).map((v) => (
              <button key={v} onClick={() => set('view', v === 'grid' ? '' : 'map')} aria-pressed={view === v} className={cx('flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold capitalize transition', view === v && 'bg-deep text-glow')}>
                {v === 'grid' ? <LayoutGrid size={16} /> : <MapIcon size={16} />} {v}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {experiences.map((e) => (
            <button key={e.slug} className="chip" aria-pressed={experience === e.slug} onClick={() => set('experience', experience === e.slug ? '' : e.slug)}>
              {e.name}
            </button>
          ))}
          {activeFilters > 0 && (
            <button className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-stone hover:text-deep" onClick={() => setParams({}, { replace: true })}>
              <X size={15} /> Clear filters
            </button>
          )}
        </div>
        <p className="mt-6 text-sm text-stone" role="status">
          {loading ? 'Loading destinations' : `${list.length} of ${all.length} destinations`}
        </p>
      </section>

      <section className="wrap pb-28">
        {view === 'map' ? (
          <Suspense fallback={<div className="h-[560px] animate-pulse rounded-[22px] bg-stone/20" />}>
            <MapView height={620} className="overflow-hidden rounded-[22px]" pins={list.map((d) => ({ id: d.slug, lat: d.lat, lng: d.lng, title: d.name, sub: `${d.area}, ${d.district}`, to: `/destinations/${d.slug}` }))} />
          </Suspense>
        ) : list.length ? (
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((d, i) => (
              <DestinationCard key={d.slug} d={d} size="sm" className={cx(i % 3 === 1 && 'lg:mt-14')} />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="rounded-[22px] border rule p-12 text-center">
              <p className="font-display text-3xl">Nothing matches all of those filters.</p>
              <p className="mt-2 text-stone">Try another month, or clear a filter to see more places.</p>
              <button className="btn-deep mt-6" onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </button>
            </div>
          )
        )}
      </section>
    </>
  );
}
