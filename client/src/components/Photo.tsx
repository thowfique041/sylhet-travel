import { useState, type ImgHTMLAttributes } from 'react';
import { originalUrl, photoSrcSet, photoUrl, type PhotoLike } from '@/lib/images';
import { cx } from '@/lib/format';

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  photo?: PhotoLike;
  /** Ideal rendered width in CSS px; picks the right thumbnail */
  width?: number;
  sizes?: string;
  priority?: boolean;
}

/**
 * Responsive, lazy image for Commons or Cloudinary photos. If a thumbnail ever
 * fails, it retries with the original file, then falls back to a themed tone
 * so a broken-image icon never shows.
 */
export function Photo({ photo, width = 1280, sizes = '100vw', priority, className, alt, ...rest }: Props) {
  const [stage, setStage] = useState(0);
  const [loaded, setLoaded] = useState(false);
  if (!photo || stage > 1 || (!photo.path && !photo.url)) {
    return <div aria-hidden className={cx('bg-[linear-gradient(135deg,var(--c-deep),var(--c-stone))]', className)} />;
  }
  const src = stage === 0 ? photoUrl(photo, width) : originalUrl(photo);
  return (
    <img
      src={src}
      srcSet={stage === 0 ? photoSrcSet(photo) : undefined}
      sizes={sizes}
      alt={alt ?? photo.alt ?? ''}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      // @ts-expect-error fetchpriority is valid HTML but not yet in React 18 types
      fetchpriority={priority ? 'high' : undefined}
      onLoad={() => setLoaded(true)}
      onError={() => setStage((s) => s + 1)}
      className={cx('transition-opacity duration-700', loaded ? 'opacity-100' : 'opacity-0', className)}
      {...rest}
    />
  );
}
