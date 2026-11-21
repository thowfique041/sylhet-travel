import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Photo } from '@/components/Photo';
import { RevealImage, RevealText } from '@/components/Reveal';
import { IMG } from '@shared/seed';

const FACTS = [
  { k: '4', v: 'districts', d: 'Sylhet, Moulvibazar, Sunamganj and Habiganj make up the division.' },
  { k: '130+', v: 'tea estates', d: 'Most of the country’s tea gardens are on these hills.' },
  { k: '400+', v: 'haors and beels', d: 'Tanguar is a Ramsar site; Hakaluki is the largest haor of all.' },
];

/** Discover Sylhet: asymmetric editorial spread with GSAP parallax on the photographs. */
export function Discover() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (cancelled || !ref.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
          const speed = Number(el.dataset.speed);
          gsap.fromTo(el, { yPercent: -speed }, { yPercent: speed, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      }, ref);
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduce]);

  return (
    <section id="discover" ref={ref} className="relative overflow-hidden py-24 lg:py-36">
      <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-6 lg:pt-10">
          <p className="font-bn text-2xl text-stone">সিলেট বিভাগ</p>
          <RevealText text="Sylhet is a country of water that comes down from the hills." className="mt-4 text-[clamp(2.6rem,5.5vw,5rem)] font-medium" />
          <div className="mt-10 grid gap-6 text-[17px] leading-[1.75] sm:grid-cols-2">
            <p className="measure">
              In the far north-east of Bangladesh, the Khasi and Jaintia hills of Meghalaya stand along the border. Some of the wettest places on earth are a short way up the slope, and every river that runs out of them reaches Sylhet first: clear, cold, and full of stone.
            </p>
            <p className="measure">
              South of the city the land folds into low tea hills. West of it, the haors fill each monsoon into inland seas. In between are the shrines of Hazrat Shah Jalal and Shah Paran, Khasia and Manipuri villages, and a kitchen of its own.
            </p>
          </div>
          <dl className="mt-14 grid gap-8 border-t rule pt-8 sm:grid-cols-3">
            {FACTS.map((f) => (
              <div key={f.v}>
                <dt className="font-display text-5xl text-deep">
                  {f.k}
                  <span className="ml-2 font-sans text-base font-semibold">{f.v}</span>
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-stone">{f.d}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Asymmetric image grid */}
        <div className="relative grid grid-cols-6 grid-rows-[repeat(6,minmax(0,1fr))] gap-4 lg:col-span-6 lg:h-[880px]">
          <RevealImage className="col-span-4 row-span-4 h-[340px] overflow-hidden rounded-[26px] sm:h-[460px] lg:h-auto">
            <div data-speed="8" className="h-[116%] w-full">
              <Photo photo={IMG.sreemangal[3]} width={1280} sizes="(min-width:1024px) 34vw, 66vw" className="h-full w-full object-cover" />
            </div>
          </RevealImage>
          <RevealImage delay={0.15} className="col-span-2 row-span-3 mt-16 h-[220px] overflow-hidden rounded-[20px] sm:h-[300px] lg:mt-24 lg:h-auto">
            <div data-speed="14" className="h-[124%] w-full">
              <Photo photo={IMG.tanguar[2]} width={960} sizes="(min-width:1024px) 17vw, 33vw" className="h-full w-full object-cover" />
            </div>
          </RevealImage>
          <RevealImage delay={0.1} className="col-span-3 col-start-2 row-span-2 h-[200px] overflow-hidden rounded-[20px] sm:h-[260px] lg:h-auto">
            <div data-speed="12" className="h-[124%] w-full">
              <Photo photo={IMG.misc.keaneDay} width={960} sizes="(min-width:1024px) 25vw, 50vw" className="h-full w-full object-cover" />
            </div>
          </RevealImage>
          <figure className="col-span-2 row-span-2 self-end text-sm text-stone">
            <p className="font-display text-xl italic text-deep">Keane Bridge, 1936.</p>
            <p className="mt-1">The steel bridge over the Surma, still the front door of the city.</p>
          </figure>
        </div>
      </div>
    </section>
  );
}
