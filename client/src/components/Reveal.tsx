import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

/**
 * Image reveal: a mask that opens upward once the element scrolls into view.
 * Used sparingly, on photographs only, so motion stays meaningful.
 */
export function RevealImage({ children, className, delay = 0, ...rest }: HTMLMotionProps<'div'> & { delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 1.1, ease: [0.77, 0, 0.18, 1], delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Line-by-line text reveal for section headlines. */
export function RevealText({ text, className, as: Tag = 'h2' }: { text: string; className?: string; as?: 'h1' | 'h2' | 'h3' | 'p' }) {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: '105%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.9, ease: [0.77, 0, 0.18, 1], delay: i * 0.045 }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
