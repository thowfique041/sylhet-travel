import { Link } from 'react-router-dom';
import { CalendarDays, MapPin } from 'lucide-react';
import type { Destination } from '@shared/types';
import { Photo } from './Photo';
import { FavoriteButton } from './FavoriteButton';
import { cx } from '@/lib/format';

interface Props {
  d: Destination;
  size?: 'lg' | 'md' | 'sm';
  className?: string;
  sizes?: string;
}

/** Editorial destination card: photograph on top, text set below like a magazine caption. */
export function DestinationCard({ d, size = 'md', className, sizes = '(min-width:1024px) 33vw, 100vw' }: Props) {
  const aspect = size === 'lg' ? 'aspect-[4/5] sm:aspect-[5/6]' : size === 'sm' ? 'aspect-[4/3]' : 'aspect-[4/5]';
  return (
    <article className={cx('group relative', className)}>
      <Link to={`/destinations/${d.slug}`} className="block" aria-label={`Explore ${d.name}`}>
        <div className={cx('relative overflow-hidden rounded-[22px] bg-deep', aspect)}>
          <Photo photo={d.cover} width={size === 'lg' ? 1280 : 960} sizes={sizes} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-cine group-hover:scale-[1.06]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
          <span
            aria-hidden
            className="absolute bottom-4 left-5 font-bn text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-none text-white/90 transition-transform duration-700 ease-cine group-hover:-translate-y-1"
          >
            {d.nameBn}
          </span>
          <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-700 ease-cine group-hover:scale-x-100" style={{ background: d.theme.accent }} />
        </div>
      </Link>
      <FavoriteButton slug={d.slug} name={d.name} className="absolute right-4 top-4" />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className={cx('leading-tight', size === 'lg' ? 'text-4xl' : 'text-3xl')}>
            <Link to={`/destinations/${d.slug}`} className="hover:underline hover:decoration-accent hover:decoration-2 hover:underline-offset-4">
              {d.name}
            </Link>
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-stone">
            <MapPin size={14} /> {d.area}, {d.district}
          </p>
        </div>
      </div>
      <p className="mt-3 text-pretty text-[15px] leading-relaxed opacity-85">{d.summary}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm">
          <CalendarDays size={15} className="text-stone" /> {d.bestSeason}
        </p>
        <Link to={`/destinations/${d.slug}`} className="chip hover:bg-deep hover:text-glow">
          Explore
        </Link>
      </div>
    </article>
  );
}
