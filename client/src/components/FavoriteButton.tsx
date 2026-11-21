import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFavorites } from '@/context/FavoritesContext';
import { cx } from '@/lib/format';

export function FavoriteButton({ slug, name, className, withLabel }: { slug: string; name: string; className?: string; withLabel?: boolean }) {
  const { isFavorite, toggle } = useFavorites();
  const on = isFavorite(slug);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(slug);
      }}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from saved places` : `Save ${name}`}
      className={cx(
        'inline-flex items-center gap-2 rounded-full transition',
        withLabel ? 'btn-line' : 'h-10 w-10 justify-center bg-black/30 text-white backdrop-blur hover:bg-black/50',
        className,
      )}
    >
      <motion.span key={String(on)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
        <Heart size={18} fill={on ? 'currentColor' : 'none'} className={on ? 'text-accent' : undefined} />
      </motion.span>
      {withLabel && <span>{on ? 'Saved' : 'Save place'}</span>}
    </button>
  );
}
