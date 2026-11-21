import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowDown, ArrowUp, Check, Plus, Save, Trash2, Wand2 } from 'lucide-react';
import type { Destination, Experience, Itinerary } from '@shared/types';
import { useData } from '@/hooks/useData';
import { useTrip, emptyTrip } from '@/context/TripContext';
import { useAuth } from '@/context/AuthContext';
import { Seo } from '@/components/Seo';
import { Photo } from '@/components/Photo';
import { autoPlan, estimate, minimumDays, rank, type Budget, type Group, type TripType } from '@/lib/planner';
import { MONTHS, addDays, cx, niceDate, range, taka } from '@/lib/format';
import { ApiError } from '@/lib/api';

const BUDGETS: { v: Budget; label: string }[] = [
  { v: 'low', label: 'Under ৳5,000' },
  { v: 'mid', label: '৳5,000 to ৳15,000' },
  { v: 'high', label: 'Above ৳15,000' },
];
const TYPES: { v: TripType; label: string }[] = [
  { v: 'nature', label: 'Nature' },
  { v: 'adventure', label: 'Adventure' },
  { v: 'relaxed', label: 'Slow and relaxed' },
  { v: 'culture', label: 'Culture and food' },
];
const GROUPS: Group[] = ['solo', 'couple', 'family', 'friends'];

export default function Planner() {
  const [params] = useSearchParams();
  const { data: all = [] } = useData<Destination[]>('/destinations');
  const { data: experiences = [] } = useData<Experience[]>('/experiences');
  const { draft, setDraft, saved, save, remove, load } = useTrip();
  const { user } = useAuth();

  const [budget, setBudget] = useState<Budget>((params.get('budget') as Budget) || 'mid');
  const [type, setType] = useState<TripType>((params.get('type') as TripType) || 'nature');
  const [group, setGroup] = useState<Group>((params.get('group') as Group) || 'friends');
  const [month, setMonth] = useState(() => (draft.startDate ? new Date(draft.startDate).getMonth() + 1 : new Date().getMonth() + 1));
  const [activities, setActivities] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const d = Number(params.get('days'));
    if (d) setDraft((t) => ({ ...t, days: Math.min(14, Math.max(1, d)) }));
    const g = params.get('group');
    if (g) setDraft((t) => ({ ...t, travelers: g === 'solo' ? 1 : g === 'couple' ? 2 : g === 'family' ? 4 : 4 }));
  }, [params, setDraft]);

  useEffect(() => {
    if (draft.startDate) setMonth(new Date(draft.startDate).getMonth() + 1);
  }, [draft.startDate]);

  const matches = useMemo(() => rank(all, { budget, days: draft.days, type, group, month, activities }), [all, budget, draft.days, type, group, month, activities]);
  const est = useMemo(() => estimate(draft, all, budget), [draft, all, budget]);
  const need = useMemo(() => minimumDays(draft, all), [draft, all]);
  const inTrip = (slug: string) => draft.stops.some((s) => s.destinationSlug === slug);

  const toggleStop = (slug: string) =>
    setDraft((t) => (inTrip(slug) ? { ...t, stops: t.stops.filter((s) => s.destinationSlug !== slug) } : { ...t, stops: [...t.stops, { destinationSlug: slug, day: Math.min(t.days, (t.stops.at(-1)?.day ?? 0) + 1) || 1 }] }));

  const auto = () => {
    const top = matches.filter((m) => !m.warn).slice(0, Math.max(2, draft.days + 1)).map((m) => m.d);
    const pool = top.length ? top : matches.slice(0, 3).map((m) => m.d);
    const { stops, dropped } = autoPlan(pool, draft.days);
    setDraft((t) => ({ ...t, stops }));
    setNotice({ ok: true, text: `Planned ${stops.length} places over ${draft.days} days${dropped.length ? `. Left out ${dropped.map((d) => d.name).join(', ')} to keep the pace realistic` : ''}.` });
    document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth' });
  };

  const doSave = async () => {
    try {
      await save();
      setNotice({ ok: true, text: user ? 'Trip saved to your account.' : 'Trip saved in this browser. Sign in to keep it on every device.' });
    } catch (e) {
      setNotice({ ok: false, text: (e as ApiError).message });
    }
  };

  const move = (idx: number, delta: number) =>
    setDraft((t) => {
      const stops = [...t.stops];
      const j = idx + delta;
      if (j < 0 || j >= stops.length) return t;
      [stops[idx], stops[j]] = [stops[j], stops[idx]];
      return { ...t, stops };
    });

  const end = draft.startDate ? addDays(draft.startDate, draft.days - 1) : '';

  return (
    <>
      <Seo title="Trip planner" description="Find the right Sylhet destinations for your budget, days and travel style, then build an itinerary with a cost estimate." />
      <section className="wrap pb-16 pt-32 lg:pt-40">
        <h1 className="max-w-4xl text-[clamp(3rem,8vw,7rem)] font-medium">Plan a trip</h1>
        <p className="mt-4 max-w-xl text-lg text-stone">Set your budget, dates and style. Places are ranked for the month you travel, with honest notes when something is out of season.</p>
      </section>

      <section className="wrap grid gap-12 pb-24 lg:grid-cols-12">
        {/* Controls */}
        <div className="space-y-8 lg:col-span-4">
          <fieldset>
            <legend className="label">Budget per person</legend>
            <div className="flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <button key={b.v} type="button" className="chip" aria-pressed={budget === b.v} onClick={() => setBudget(b.v)}>
                  {b.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="grid grid-cols-2 gap-4">
            <label>
              <span className="label">Start date</span>
              <input type="date" className="field" value={draft.startDate ?? ''} onChange={(e) => setDraft((t) => ({ ...t, startDate: e.target.value }))} />
            </label>
            <label>
              <span className="label">Or month</span>
              <select className="field" value={month} onChange={(e) => setMonth(Number(e.target.value))} disabled={!!draft.startDate}>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Days</span>
              <input type="number" min={1} max={14} className="field" value={draft.days} onChange={(e) => setDraft((t) => ({ ...t, days: Math.min(14, Math.max(1, Number(e.target.value) || 1)), stops: t.stops.map((s) => ({ ...s, day: Math.min(s.day, Math.max(1, Number(e.target.value) || 1)) })) }))} />
            </label>
            <label>
              <span className="label">Travelers</span>
              <input type="number" min={1} max={30} className="field" value={draft.travelers} onChange={(e) => setDraft((t) => ({ ...t, travelers: Math.min(30, Math.max(1, Number(e.target.value) || 1)) }))} />
            </label>
          </div>
          <fieldset>
            <legend className="label">Kind of trip</legend>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button key={t.v} type="button" className="chip" aria-pressed={type === t.v} onClick={() => setType(t.v)}>
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="label">Group</legend>
            <div className="flex flex-wrap gap-2">
              {GROUPS.map((g) => (
                <button key={g} type="button" className="chip capitalize" aria-pressed={group === g} onClick={() => setGroup(g)}>
                  {g}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="label">Activities you want</legend>
            <div className="flex flex-wrap gap-2">
              {experiences.map((e) => (
                <button key={e.slug} type="button" className="chip" aria-pressed={activities.includes(e.slug)} onClick={() => setActivities((a) => (a.includes(e.slug) ? a.filter((x) => x !== e.slug) : [...a, e.slug]))}>
                  {e.name}
                </button>
              ))}
            </div>
          </fieldset>
          <button className="btn-deep w-full" onClick={auto}>
            <Wand2 size={18} /> Build my itinerary
          </button>
        </div>

        {/* Ranked matches */}
        <div className="lg:col-span-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-4xl">Best matches for {MONTHS[month - 1]}</h2>
            <p className="text-sm text-stone">{draft.stops.length} in your trip</p>
          </div>
          <ol className="mt-6 divide-y divide-[color-mix(in_srgb,var(--c-stone)_30%,transparent)] border-y rule">
            {matches.map((m, i) => (
              <motion.li layout key={m.d.slug} className="grid grid-cols-[72px,1fr,auto] items-center gap-4 py-4 sm:grid-cols-[110px,1fr,auto] sm:gap-6">
                <Link to={`/destinations/${m.d.slug}`} className="overflow-hidden rounded-xl">
                  <Photo photo={m.d.cover} width={960} sizes="110px" className="aspect-[4/3] w-full object-cover" />
                </Link>
                <div className="min-w-0">
                  <p className="text-sm text-stone">
                    <span className="tabular">{i + 1}.</span> {m.d.area}, {m.d.district}
                  </p>
                  <Link to={`/destinations/${m.d.slug}`} className="font-display text-2xl hover:underline sm:text-3xl">
                    {m.d.name}
                  </Link>
                  <p className="mt-1 text-sm">
                    {m.reasons.slice(0, 2).join('. ')}
                    {m.warn && (
                      <span className="mt-1 flex items-center gap-1.5 text-[color-mix(in_srgb,#b45309_80%,var(--c-deep))]">
                        <AlertTriangle size={14} /> {m.warn}
                      </span>
                    )}
                  </p>
                </div>
                <button onClick={() => toggleStop(m.d.slug)} aria-pressed={inTrip(m.d.slug)} className={cx('chip shrink-0', inTrip(m.d.slug) && 'border-deep bg-deep text-glow')}>
                  {inTrip(m.d.slug) ? <Check size={15} /> : <Plus size={15} />} <span className="hidden sm:inline">{inTrip(m.d.slug) ? 'Added' : 'Add'}</span>
                </button>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Itinerary builder */}
      <section id="builder" className="bg-deep py-24 text-glow">
        <div className="wrap">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <label htmlFor="trip-title" className="text-sm text-glow/60">
                Itinerary
              </label>
              <input id="trip-title" value={draft.title} onChange={(e) => setDraft((t) => ({ ...t, title: e.target.value }))} className="block w-full bg-transparent font-display text-[clamp(2.4rem,5vw,4.5rem)] outline-none focus:underline focus:decoration-accent" />
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-accent" onClick={doSave} disabled={!draft.stops.length}>
                <Save size={17} /> Save trip
              </button>
              <button className="btn-line" onClick={() => setDraft(emptyTrip())}>
                Start over
              </button>
            </div>
          </div>
          <AnimatePresence>
            {notice && (
              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" className={cx('mt-4 text-sm', notice.ok ? 'text-accent' : 'text-red-300')}>
                {notice.text}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mt-12 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              {draft.stops.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-white/25 p-10 text-center">
                  <p className="font-display text-3xl">Your trip is empty.</p>
                  <p className="mt-2 text-glow/70">Add places from the list above, or let the planner build the days for you.</p>
                  <button className="btn-accent mt-6" onClick={auto}>
                    <Wand2 size={17} /> Build my itinerary
                  </button>
                </div>
              ) : (
                <ol className="space-y-8">
                  {Array.from({ length: draft.days }, (_, i) => i + 1).map((day) => {
                    const stops = draft.stops.map((s, idx) => ({ s, idx })).filter((x) => x.s.day === day);
                    return (
                      <li key={day} className="grid gap-4 sm:grid-cols-[150px,1fr]">
                        <div>
                          <p className="font-display text-3xl">Day {day}</p>
                          {draft.startDate && <p className="text-sm text-glow/60">{niceDate(addDays(draft.startDate, day - 1))}</p>}
                        </div>
                        <div className="space-y-3">
                          {stops.length ? (
                            stops.map(({ s, idx }) => {
                              const d = all.find((x) => x.slug === s.destinationSlug);
                              if (!d) return null;
                              return (
                                <motion.div layout key={s.destinationSlug} className="flex items-center gap-4 rounded-2xl bg-white/[0.06] p-3">
                                  <Photo photo={d.cover} width={960} sizes="80px" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                                  <div className="min-w-0 flex-1">
                                    <Link to={`/destinations/${d.slug}`} className="font-semibold hover:text-accent">
                                      {d.name}
                                    </Link>
                                    <input
                                      value={s.note ?? ''}
                                      onChange={(e) => setDraft((t) => ({ ...t, stops: t.stops.map((x, j) => (j === idx ? { ...x, note: e.target.value.slice(0, 200) } : x)) }))}
                                      placeholder="Add a note"
                                      aria-label={`Note for ${d.name}`}
                                      className="mt-0.5 block w-full bg-transparent text-sm text-glow/75 outline-none placeholder:text-glow/40"
                                    />
                                  </div>
                                  <select
                                    aria-label={`Day for ${d.name}`}
                                    value={s.day}
                                    onChange={(e) => setDraft((t) => ({ ...t, stops: t.stops.map((x, j) => (j === idx ? { ...x, day: Number(e.target.value) } : x)) }))}
                                    className="rounded-lg bg-white/10 px-2 py-1.5 text-sm"
                                  >
                                    {Array.from({ length: draft.days }, (_, k) => (
                                      <option key={k} value={k + 1} className="text-black">
                                        Day {k + 1}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="hidden flex-col sm:flex">
                                    <button aria-label="Move up" onClick={() => move(idx, -1)} className="p-1 opacity-70 hover:opacity-100">
                                      <ArrowUp size={15} />
                                    </button>
                                    <button aria-label="Move down" onClick={() => move(idx, 1)} className="p-1 opacity-70 hover:opacity-100">
                                      <ArrowDown size={15} />
                                    </button>
                                  </div>
                                  <button aria-label={`Remove ${d.name}`} onClick={() => setDraft((t) => ({ ...t, stops: t.stops.filter((_, j) => j !== idx) }))} className="p-2 opacity-70 hover:text-red-300 hover:opacity-100">
                                    <Trash2 size={17} />
                                  </button>
                                </motion.div>
                              );
                            })
                          ) : (
                            <p className="rounded-2xl border border-dashed border-white/15 p-4 text-sm text-glow/55">Free day. Rest in Sylhet city, visit the Shah Jalal Dargah, or walk the Surma riverfront.</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            <aside className="space-y-6 lg:col-span-4">
              <div className="rounded-[22px] bg-white/[0.06] p-6">
                <h3 className="font-sans text-lg font-semibold">Trip duration</h3>
                <dl className="mt-4 space-y-2 text-[15px]">
                  <Row k="Days planned" v={`${draft.days} days, ${Math.max(0, draft.days - 1)} nights`} />
                  {draft.startDate && <Row k="Dates" v={`${niceDate(draft.startDate)} to ${niceDate(end)}`} />}
                  <Row k="Minimum for these stops" v={`${need} day${need > 1 ? 's' : ''}`} />
                </dl>
                {need > draft.days && (
                  <p className="mt-3 flex gap-2 text-sm text-amber-200">
                    <AlertTriangle size={16} className="shrink-0" /> These places need about {need} days. Add days or remove a stop.
                  </p>
                )}
              </div>
              <div className="rounded-[22px] bg-white/[0.06] p-6">
                <h3 className="font-sans text-lg font-semibold">Estimated budget</h3>
                <ul className="mt-4 space-y-2 text-[15px]">
                  {est.lines.map((l) => (
                    <li key={l.label} className="flex justify-between gap-4">
                      <span className="text-glow/75">{l.label}</span>
                      <span className="tabular">{range(l.min, l.max)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 border-t border-white/15 pt-4">
                  <p className="text-sm text-glow/60">Per person</p>
                  <p className="tabular font-display text-3xl text-accent">{range(est.perPerson[0], est.perPerson[1])}</p>
                  <p className="mt-2 text-sm text-glow/60">
                    Group of {draft.travelers}: <span className="tabular">{taka(est.group[0])} to {taka(est.group[1])}</span>
                  </p>
                </div>
                <p className="mt-4 text-xs text-glow/50">Excludes travel to Sylhet. Stay and food follow your budget choice.</p>
              </div>
              {saved.length > 0 && <SavedTrips saved={saved} onLoad={load} onRemove={remove} />}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-glow/70">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}

export function SavedTrips({ saved, onLoad, onRemove, light }: { saved: Itinerary[]; onLoad: (t: Itinerary) => void; onRemove: (id: string) => Promise<void>; light?: boolean }) {
  return (
    <div className={cx('rounded-[22px] p-6', light ? 'border rule' : 'bg-white/[0.06]')}>
      <h3 className="font-sans text-lg font-semibold">Saved trips</h3>
      <ul className="mt-3 space-y-2">
        {saved.map((t) => (
          <li key={t._id} className="flex items-center justify-between gap-3">
            <button onClick={() => onLoad(t)} className="min-w-0 text-left hover:text-accent">
              <span className="block truncate font-medium">{t.title}</span>
              <span className="text-sm opacity-60">
                {t.days} days, {t.stops.length} places
              </span>
            </button>
            <button aria-label={`Delete ${t.title}`} onClick={() => void onRemove(t._id!)} className="p-2 opacity-60 hover:text-red-400 hover:opacity-100">
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
