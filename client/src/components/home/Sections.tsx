import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Destination, Experience, Food, Gem, Place, Post } from '@shared/types';
import { DestinationCard } from '@/components/DestinationCard';
import { Photo } from '@/components/Photo';
import { RevealImage, RevealText } from '@/components/Reveal';
import { cx, niceDate, taka } from '@/lib/format';

/* ------------------------------------------------------------------ */
/* C. Explore destinations: an asymmetric, three-tempo layout          */
/* ------------------------------------------------------------------ */
export function ExploreDestinations({ destinations }: { destinations: Destination[] }) {
  const [lead, second, ...rest] = destinations;
  if (!lead) return null;
  return (
    <section className="py-24 lg:py-32" aria-labelledby="explore-h">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-6 border-b rule pb-10 md:flex-row md:items-end">
          <RevealText as="h2" text="Nine places to begin" className="text-[clamp(2.6rem,6vw,5.5rem)] font-medium" />
          <div className="max-w-sm">
            <p className="text-stone">From the stone rivers of the border to the haors of Sunamganj. Each one changes completely with the season, so the best months are on every card.</p>
            <Link to="/destinations" className="btn-deep mt-5">
              See all with map and filters
            </Link>
          </div>
        </div>
        <span id="explore-h" className="sr-only">
          Explore destinations
        </span>
        <div className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-12">
          <DestinationCard d={lead} size="lg" className="md:col-span-7" sizes="(min-width:768px) 58vw, 100vw" />
          {second && <DestinationCard d={second} className="md:col-span-5 md:mt-32" sizes="(min-width:768px) 40vw, 100vw" />}
          {rest.map((d, i) => (
            <DestinationCard key={d.slug} d={d} size="sm" className={cx('md:col-span-4', i % 3 === 1 && 'md:mt-16')} sizes="(min-width:768px) 33vw, 100vw" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* D. Experiences: list on the left drives a single large photograph   */
/* ------------------------------------------------------------------ */
export function Experiences({ experiences, destinations }: { experiences: Experience[]; destinations: Destination[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const exp = experiences[active];
  const linked = useMemo(() => destinations.filter((d) => exp?.destinations.includes(d.slug)), [exp, destinations]);
  if (!exp) return null;
  return (
    <section className="bg-deep py-24 text-glow lg:py-32" aria-labelledby="exp-h">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id="exp-h" className="text-[clamp(2.4rem,5vw,4.5rem)] font-medium">
            What will you do here?
          </h2>
          <ul className="mt-10 border-t border-white/15" role="tablist" aria-label="Experiences">
            {experiences.map((e, i) => (
              <li key={e.slug} className="border-b border-white/15">
                <button
                  role="tab"
                  aria-selected={i === active}
                  aria-controls="exp-panel"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="group flex w-full items-baseline justify-between gap-6 py-5 text-left"
                >
                  <span className={cx('font-display text-[clamp(1.6rem,2.6vw,2.4rem)] transition-[color,transform] duration-500', i === active ? 'translate-x-3 text-accent' : 'text-glow/70 group-hover:text-glow')}>{e.name}</span>
                  <span className="hidden text-sm text-glow/50 sm:block">{e.destinations.length} places</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div id="exp-panel" role="tabpanel" className="lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] lg:aspect-[5/4]">
            <AnimatePresence initial={false}>
              <motion.div
                key={exp.slug}
                className="absolute inset-0"
                initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 0 100%)' }}
                animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0 0 0 0%)' }}
                exit={{ opacity: 0.999 }}
                transition={{ duration: 0.9, ease: [0.77, 0, 0.18, 1] }}
              >
                <Photo photo={exp.image} width={1280} sizes="(min-width:1024px) 55vw, 100vw" className="h-full w-full object-cover" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 to-transparent p-6 pt-24 sm:p-8">
              <p className="max-w-md text-lg text-white">{exp.line}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {linked.map((d) => (
                  <Link key={d.slug} to={`/destinations/${d.slug}`} className="chip border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white hover:text-black">
                    {d.name}
                  </Link>
                ))}
                <Link to={`/destinations?experience=${exp.slug}`} className="chip border-accent bg-accent text-deep">
                  Show all
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* E. Travel planner teaser: answers immediately, then hands off       */
/* ------------------------------------------------------------------ */
const BUDGETS = [
  { v: 'low', label: 'Under ৳5,000' },
  { v: 'mid', label: '৳5,000 to ৳15,000' },
  { v: 'high', label: 'Above ৳15,000' },
];
const TYPES = [
  { v: 'nature', label: 'Nature' },
  { v: 'adventure', label: 'Adventure' },
  { v: 'relaxed', label: 'Slow and relaxed' },
  { v: 'culture', label: 'Culture and food' },
];

export function PlannerTeaser() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState('mid');
  const [days, setDays] = useState(3);
  const [type, setType] = useState('nature');
  const [group, setGroup] = useState('friends');
  return (
    <section className="py-24 lg:py-32" aria-labelledby="plan-h">
      <div className="wrap grid items-start gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <RevealText as="h2" text="Tell us how you travel." className="text-[clamp(2.4rem,5vw,4.5rem)] font-medium" />
          <p id="plan-h" className="mt-5 max-w-md text-stone">
            Budget, days and the kind of trip you want. The planner ranks places for the month you go, then builds the days, the route and a cost estimate you can save.
          </p>
        </div>
        <form
          className="grid gap-8 rounded-[28px] border rule bg-white/50 p-6 sm:p-10 lg:col-span-7"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/planner?budget=${budget}&days=${days}&type=${type}&group=${group}`);
          }}
        >
          <fieldset>
            <legend className="label">Budget per person</legend>
            <div className="flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <button type="button" key={b.v} className="chip" aria-pressed={budget === b.v} onClick={() => setBudget(b.v)}>
                  {b.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="days" className="label">
              Days in Sylhet: <span className="tabular">{days}</span>
            </label>
            <input id="days" type="range" min={1} max={10} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full accent-[var(--c-deep)]" />
          </div>
          <fieldset>
            <legend className="label">Kind of trip</legend>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button type="button" key={t.v} className="chip" aria-pressed={type === t.v} onClick={() => setType(t.v)}>
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="label">Who is going</legend>
            <div className="flex flex-wrap gap-2">
              {['solo', 'couple', 'family', 'friends'].map((g) => (
                <button type="button" key={g} className="chip capitalize" aria-pressed={group === g} onClick={() => setGroup(g)}>
                  {g}
                </button>
              ))}
            </div>
          </fieldset>
          <button className="btn-deep justify-self-start">Show my matches</button>
        </form>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* F. Hidden gems: alternating editorial story blocks                  */
/* ------------------------------------------------------------------ */
export function HiddenGems({ gems }: { gems: Gem[] }) {
  return (
    <section className="border-t rule py-24 lg:py-32" aria-labelledby="gems-h">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 id="gems-h" className="text-[clamp(2.4rem,5vw,4.5rem)] font-medium lg:col-span-6">
            Off the usual road
          </h2>
          <p className="max-w-md self-end text-stone lg:col-span-5 lg:col-start-8">Places most itineraries pass on the way to somewhere else. Each is a short detour from a main destination.</p>
        </div>
        <div className="mt-16 space-y-24">
          {gems.map((g, i) => (
            <article key={g.slug} className="grid items-center gap-8 lg:grid-cols-12">
              <RevealImage className={cx('overflow-hidden rounded-[26px] lg:col-span-7', i % 2 === 1 && 'lg:order-2 lg:col-start-6')}>
                <Photo photo={g.image} width={1280} sizes="(min-width:1024px) 58vw, 100vw" className="aspect-[16/10] w-full object-cover" />
              </RevealImage>
              <div className={cx('lg:col-span-4', i % 2 ? 'lg:order-1 lg:col-start-1' : 'lg:col-start-9')}>
                <p className="text-sm font-medium text-stone">{g.area}</p>
                <h3 className="mt-2 text-4xl sm:text-5xl">{g.name}</h3>
                <p className="mt-5 text-pretty text-[17px] leading-[1.75]">{g.story}</p>
                <a href={`https://www.openstreetmap.org/?mlat=${g.lat}&mlon=${g.lng}#map=13/${g.lat}/${g.lng}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex text-[15px] font-semibold underline decoration-accent decoration-2 underline-offset-4">
                  Open on the map
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* G. Local food guide                                                 */
/* ------------------------------------------------------------------ */
export function FoodGuide({ foods, restaurants, compact }: { foods: Food[]; restaurants: Place[]; compact?: boolean }) {
  return (
    <section className="bg-[color-mix(in_srgb,var(--c-accent)_16%,var(--c-mist))] py-24 lg:py-32" aria-labelledby="food-h">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 id="food-h" className="text-[clamp(2.4rem,5vw,4.5rem)] font-medium">
            The Sylheti table
          </h2>
          {compact && (
            <Link to="/food" className="btn-line">
              Full food guide
            </Link>
          )}
        </div>
        <div className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {(compact ? foods.slice(0, 3) : foods).map((f) => (
            <article key={f.slug} className="w-[80%] shrink-0 snap-start sm:w-[46%] lg:w-auto">
              <div className="relative overflow-hidden rounded-[22px]">
                <Photo photo={f.image} width={960} sizes="(min-width:1024px) 30vw, 80vw" className="aspect-[4/3] w-full object-cover" />
                <span className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 font-bn text-lg text-white backdrop-blur">{f.nameBn}</span>
              </div>
              <h3 className="mt-5 text-3xl">{f.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed opacity-85">{f.description}</p>
              <p className="mt-3 text-sm text-stone">Try it at {f.where}</p>
            </article>
          ))}
        </div>
        <div className="mt-16">
          <h3 className="font-sans text-lg font-semibold">Where locals eat</h3>
          <ul className="mt-4 divide-y divide-[color-mix(in_srgb,var(--c-stone)_35%,transparent)] border-y rule">
            {restaurants.map((r) => (
              <li key={r.slug} className="grid gap-1 py-5 sm:grid-cols-12 sm:items-baseline sm:gap-6">
                <p className="font-display text-2xl sm:col-span-4">{r.name}</p>
                <p className="text-[15px] opacity-85 sm:col-span-5">{r.description}</p>
                <p className="text-sm text-stone sm:col-span-3 sm:text-right">
                  {r.area}, from {taka(r.priceFrom)} {r.priceNote}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* H. Travel stories                                                   */
/* ------------------------------------------------------------------ */
export function Stories({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;
  if (!lead) return null;
  return (
    <section className="py-24 lg:py-32" aria-labelledby="stories-h">
      <div className="wrap">
        <div className="flex items-end justify-between gap-6">
          <h2 id="stories-h" className="text-[clamp(2.4rem,5vw,4.5rem)] font-medium">
            Field notes
          </h2>
          <Link to="/stories" className="text-[15px] font-semibold underline decoration-accent decoration-2 underline-offset-4">
            All stories
          </Link>
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <Link to={`/stories/${lead.slug}`} className="group lg:col-span-7">
            <div className="overflow-hidden rounded-[26px]">
              <Photo photo={lead.cover} width={1280} sizes="(min-width:1024px) 58vw, 100vw" className="aspect-[16/10] w-full object-cover transition-transform duration-[1.4s] ease-cine group-hover:scale-105" />
            </div>
            <p className="mt-5 text-sm text-stone">
              {niceDate(lead.date)}, {lead.readMinutes} min read
            </p>
            <h3 className="mt-2 text-4xl group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4 sm:text-5xl">{lead.title}</h3>
            <p className="mt-3 max-w-xl opacity-85">{lead.excerpt}</p>
          </Link>
          <div className="grid gap-10 lg:col-span-5">
            {rest.map((p) => (
              <Link key={p.slug} to={`/stories/${p.slug}`} className="group grid grid-cols-5 gap-5">
                <div className="col-span-2 overflow-hidden rounded-[18px]">
                  <Photo photo={p.cover} width={960} sizes="20vw" className="aspect-square h-full w-full object-cover transition-transform duration-[1.4s] ease-cine group-hover:scale-105" />
                </div>
                <div className="col-span-3">
                  <p className="text-sm text-stone">{p.readMinutes} min read</p>
                  <h3 className="mt-1 text-2xl group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4 sm:text-3xl">{p.title}</h3>
                  <p className="mt-2 text-[15px] opacity-80">{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
