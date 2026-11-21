import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { ArrowDown, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { Destination, Slide } from '@shared/types';
import { Photo } from '@/components/Photo';
import { useTheme } from '@/context/ThemeContext';
import { photoUrl } from '@/lib/images';
import { cx } from '@/lib/format';

const DURATION = 8000;
const EASE = [0.77, 0, 0.18, 1] as const;

interface Props {
  slides: Slide[];
  destinations: Destination[];
}

/**
 * The signature hero. Each destination enters as a full-bleed photograph that
 * wipes in from the side it is travelling from, while the whole site's palette
 * interpolates to that place's colors through the theme engine.
 */
export function Hero({ slides, destinations }: Props) {
  const reduce = useReducedMotion();
  const { setTheme } = useTheme();
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const root = useRef<HTMLElement>(null);
  const inView = useRef(true);
  const n = slides.length;
  const slide = slides[index];
  const dest = destinations.find((d) => d.slug === slide?.destinationSlug);
  const nameBn = dest?.nameBn ?? '';

  const go = useCallback(
    (next: number, d?: number) => {
      setState(([cur]) => {
        const target = ((next % n) + n) % n;
        if (target === cur) return [cur, 1];
        return [target, d ?? (target > cur ? 1 : -1)];
      });
      setProgressKey((k) => k + 1);
    },
    [n],
  );
  const next = useCallback(() => go(index + 1, 1), [go, index]);
  const prev = useCallback(() => go(index - 1, -1), [go, index]);

  // Theme follows the active slide.
  useEffect(() => {
    if (slide) setTheme(slide.theme);
  }, [slide, setTheme]);

  // Preload the next photograph so the wipe never reveals a blank frame.
  useEffect(() => {
    const nx = slides[(index + 1) % n];
    if (nx) {
      const img = new Image();
      img.src = photoUrl(nx.image, 1920);
    }
  }, [index, n, slides]);

  // Autoplay, paused on hover, focus, hidden tab, offscreen, or reduced motion.
  const running = !reduce && !paused && !userPaused && n > 1;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      if (inView.current && document.visibilityState === 'visible') next();
      else setProgressKey((k) => k + 1);
    }, DURATION);
    return () => clearTimeout(t);
  }, [running, next, progressKey]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    const key = (e: KeyboardEvent) => {
      if (!inView.current || (e.target as HTMLElement).closest('input,textarea,select,[role=dialog]')) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', key);
    return () => {
      io.disconnect();
      window.removeEventListener('keydown', key);
    };
  }, [next, prev]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) next();
    else if (info.offset.x > 60 || info.velocity.x > 400) prev();
  };

  if (!slide) return <section className="h-[100svh] bg-deep" />;

  const imageVariants = {
    enter: (d: number) => (reduce ? { opacity: 0 } : { clipPath: d > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)', zIndex: 2 }),
    center: { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, zIndex: 2, x: '0%', transition: { duration: reduce ? 0.3 : 1.35, ease: EASE } },
    exit: (d: number) => (reduce ? { opacity: 0, zIndex: 1 } : { x: d > 0 ? '-18%' : '18%', zIndex: 1, opacity: 0.6, transition: { duration: 1.35, ease: EASE } }),
  };

  const titleWords = slide.title.split(' ');

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label="Featured destinations"
      className="relative isolate overflow-hidden bg-deep text-glow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* ---------- Image stage ---------- */}
      <motion.div
        className="relative h-[68svh] min-h-[460px] w-full touch-pan-y lg:h-[100svh] lg:min-h-[680px]"
        drag={n > 1 ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={onDragEnd}
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.div key={slide.destinationSlug + index} className="absolute inset-0 overflow-hidden" custom={dir} variants={imageVariants} initial="enter" animate="center" exit="exit">
            <motion.div
              className="absolute inset-0"
              initial={reduce ? false : { scale: 1.16, x: dir > 0 ? '4%' : '-4%' }}
              animate={{ scale: 1.03, x: '0%' }}
              transition={{ duration: reduce ? 0 : DURATION / 1000 + 1.5, ease: 'easeOut' }}
            >
              <Photo photo={slide.image} width={1920} priority alt={slide.image.alt} className="h-full w-full object-cover" draggable={false} />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Overlays read the live theme so they fade with the palette */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(to_top,var(--c-deep)_0%,color-mix(in_srgb,var(--c-deep)_55%,transparent)_30%,transparent_62%)] lg:bg-[linear-gradient(100deg,color-mix(in_srgb,var(--c-deep)_88%,transparent)_0%,color-mix(in_srgb,var(--c-deep)_35%,transparent)_42%,transparent_70%),linear-gradient(to_top,color-mix(in_srgb,var(--c-deep)_80%,transparent),transparent_35%)]" />
        <div aria-hidden className="grain pointer-events-none absolute inset-0 z-[3]" />
        {/* Drifting mist bands, the subtle living background */}
        {!reduce && (
          <div aria-hidden className="pointer-events-none absolute inset-0 z-[3] overflow-hidden mix-blend-screen">
            <motion.div
              className="absolute -left-1/4 top-[18%] h-[38%] w-[90%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--c-accent)_28%,transparent),transparent)] blur-3xl"
              animate={{ x: ['0%', '22%', '0%'] }}
              transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -right-1/4 bottom-[22%] h-[30%] w-[70%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--c-glow)_18%,transparent),transparent)] blur-3xl"
              animate={{ x: ['0%', '-18%', '0%'] }}
              transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        )}

        {/* Ghosted Bangla name: the typographic layer behind the title */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[8%] z-[4] overflow-hidden lg:bottom-auto lg:top-[14%]">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.p
              key={nameBn + index}
              custom={dir}
              className="ghost-bn whitespace-nowrap pl-4 text-[clamp(7rem,30vw,25rem)] lg:pl-[38%]"
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir > 0 ? 120 : -120 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 1.6, ease: EASE, delay: 0.15 } }}
              exit={{ opacity: 0, x: dir > 0 ? -80 : 80, transition: { duration: 0.7, ease: EASE } }}
            >
              {nameBn}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Title block (overlaps image on all sizes) */}
        <div className="absolute inset-x-0 bottom-0 z-[5] lg:bottom-[15%]">
          <div className="wrap" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={slide.destinationSlug + index} exit={{ opacity: 0, y: -14, transition: { duration: 0.35 } }}>
                <motion.p
                  className="flex items-center gap-3 text-[15px] font-medium text-glow/85"
                  initial={reduce ? false : { opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.55, duration: 0.6 } }}
                >
                  <span className="h-px w-10 bg-accent" />
                  {slide.kicker}
                </motion.p>
                <h1 className="mt-3 max-w-[11ch] pb-6 text-[clamp(3.4rem,11vw,10.5rem)] font-medium leading-[0.9] lg:pb-0">
                  {titleWords.map((w, i) => (
                    <span key={i} className="inline-block overflow-hidden pb-[0.06em] pr-[0.22em] align-bottom">
                      <motion.span
                        className="inline-block"
                        initial={reduce ? false : { y: '110%' }}
                        animate={{ y: '0%', transition: { duration: 1.05, ease: EASE, delay: 0.45 + i * 0.08 } }}
                      >
                        {w}
                      </motion.span>
                    </span>
                  ))}
                </h1>
                <motion.div
                  className="hidden max-w-[44ch] lg:block"
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.85, duration: 0.7 } }}
                >
                  <p className="mt-6 text-lg leading-relaxed text-glow/85">{slide.description}</p>
                  <div className="mt-8 flex items-center gap-4">
                    <Link to={`/destinations/${slide.destinationSlug}`} className="btn-accent">
                      Explore {slide.title}
                    </Link>
                    {dest && <span className="text-sm text-glow/70">Best: {dest.bestSeason}</span>}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop thumbnail rail */}
        <div className="absolute right-[max(1.5rem,calc((100vw-1360px)/2+3rem))] top-1/2 z-[6] hidden -translate-y-1/2 flex-col gap-3 xl:flex" role="tablist" aria-label="Choose destination">
          {slides.map((s, i) => (
            <button
              key={s.destinationSlug}
              role="tab"
              aria-selected={i === index}
              aria-label={s.title}
              onClick={() => go(i)}
              className={cx('group relative flex items-center gap-4 text-right transition-opacity', i === index ? 'opacity-100' : 'opacity-55 hover:opacity-90')}
            >
              <span className={cx('text-sm font-medium transition-transform', i === index ? 'translate-x-0' : 'translate-x-2 group-hover:translate-x-0')}>{s.title}</span>
              <span className={cx('relative h-[60px] w-[88px] overflow-hidden rounded-[10px] ring-2 transition', i === index ? 'ring-accent' : 'ring-transparent')}>
                <Photo photo={s.image} width={960} sizes="88px" className="h-full w-full object-cover" />
              </span>
            </button>
          ))}
        </div>

        {/* Desktop control bar */}
        <div className="absolute inset-x-0 bottom-0 z-[6] hidden lg:block">
          <div className="wrap flex items-center gap-8 pb-8">
            <p className="tabular font-display text-2xl" aria-label={`Slide ${index + 1} of ${n}`}>
              <span className="text-accent">{String(index + 1).padStart(2, '0')}</span>
              <span className="mx-2 text-glow/40">/</span>
              <span className="text-glow/60">{String(n).padStart(2, '0')}</span>
            </p>
            <Indicators n={n} index={index} go={go} running={running} progressKey={progressKey} />
            <div className="flex items-center gap-2">
              <CtrlButton label="Previous destination" onClick={prev}>
                <ChevronLeft size={20} />
              </CtrlButton>
              <CtrlButton label={userPaused ? 'Play slideshow' : 'Pause slideshow'} onClick={() => setUserPaused((p) => !p)}>
                {userPaused ? <Play size={16} /> : <Pause size={16} />}
              </CtrlButton>
              <CtrlButton label="Next destination" onClick={next}>
                <ChevronRight size={20} />
              </CtrlButton>
            </div>
            <a href="#discover" className="ml-auto flex items-center gap-3 text-sm text-glow/75 hover:text-glow">
              Scroll to discover
              <span className="relative h-10 w-px overflow-hidden bg-glow/25">
                {!reduce && <motion.span className="absolute inset-x-0 top-0 h-1/2 bg-accent" animate={{ y: ['-100%', '200%'] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />}
              </span>
              <ArrowDown size={16} className="sr-only" />
            </a>
          </div>
        </div>
      </motion.div>

      {/* ---------- Mobile and tablet panel: redesigned, not shrunk ---------- */}
      <div className="relative z-[6] bg-deep pb-8 lg:hidden">
        <div className="wrap">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={index} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <p className="text-[16px] leading-relaxed text-glow/85">{slide.description}</p>
              {dest && <p className="mt-2 text-sm text-glow/60">Best: {dest.bestSeason}</p>}
            </motion.div>
          </AnimatePresence>
          <div className="mt-5 flex items-center gap-3">
            <Link to={`/destinations/${slide.destinationSlug}`} className="btn-accent flex-1 sm:flex-none">
              Explore {slide.title}
            </Link>
            <CtrlButton label="Previous destination" onClick={prev}>
              <ChevronLeft size={20} />
            </CtrlButton>
            <CtrlButton label="Next destination" onClick={next}>
              <ChevronRight size={20} />
            </CtrlButton>
          </div>
        </div>
        <div className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 sm:px-8" role="tablist" aria-label="Choose destination">
          {slides.map((s, i) => (
            <button
              key={s.destinationSlug}
              role="tab"
              aria-selected={i === index}
              onClick={() => go(i)}
              className={cx('relative w-[42%] shrink-0 snap-start overflow-hidden rounded-2xl text-left transition sm:w-[28%]', i === index ? 'ring-2 ring-accent' : 'opacity-70')}
            >
              <Photo photo={s.image} width={960} sizes="40vw" className="aspect-[4/3] w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-8 text-sm font-semibold text-white">{s.title}</span>
              {i === index && running && (
                <motion.span key={progressKey} className="absolute left-0 top-0 h-[3px] bg-accent" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: DURATION / 1000, ease: 'linear' }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtrlButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-glow/30 text-glow transition hover:border-accent hover:bg-accent hover:text-deep">
      {children}
    </button>
  );
}

function Indicators({ n, index, go, running, progressKey }: { n: number; index: number; go: (i: number) => void; running: boolean; progressKey: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: n }, (_, i) => (
        <button key={i} onClick={() => go(i)} aria-label={`Go to slide ${i + 1}`} className="group py-3">
          <span className={cx('relative block h-[2px] overflow-hidden rounded bg-glow/25 transition-all duration-500', i === index ? 'w-16' : 'w-6 group-hover:w-9')}>
            {i === index && (
              <motion.span
                key={progressKey}
                className="absolute inset-y-0 left-0 bg-accent"
                initial={{ width: running ? '0%' : '100%' }}
                animate={{ width: '100%' }}
                transition={{ duration: running ? DURATION / 1000 : 0, ease: 'linear' }}
              />
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
