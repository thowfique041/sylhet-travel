import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import type { Destination, Post } from '@shared/types';
import { useData } from '@/hooks/useData';
import { Photo } from './Photo';

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { data: dests = [] } = useData<Destination[]>(open ? '/destinations' : null);
  const { data: posts = [] } = useData<Post[]>(open ? '/posts' : null);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    const d = dests
      .filter((x) => !t || [x.name, x.nameBn, x.area, x.district, x.tagline, x.summary, ...x.experiences].join(' ').toLowerCase().includes(t))
      .map((x) => ({ key: x.slug, title: x.name, sub: `${x.area}, ${x.district}`, to: `/destinations/${x.slug}`, photo: x.cover, kind: 'Destination' }));
    const p = t
      ? posts.filter((x) => [x.title, x.excerpt].join(' ').toLowerCase().includes(t)).map((x) => ({ key: x.slug, title: x.title, sub: x.excerpt, to: `/stories/${x.slug}`, photo: x.cover, kind: 'Story' }))
      : [];
    return [...d, ...p].slice(0, 8);
  }, [q, dests, posts]);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      setTimeout(() => input.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal
            aria-label="Search"
            className="mx-auto mt-[10vh] w-[min(720px,92vw)] overflow-hidden rounded-3xl bg-mist text-deep shadow-2xl"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(results.length - 1, a + 1));
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              }
              if (e.key === 'Enter' && results[active]) go(results[active].to);
            }}
          >
            <div className="flex items-center gap-3 border-b rule px-5">
              <Search size={20} className="text-stone" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                placeholder="Search rivers, forests, tea, stories"
                className="h-16 flex-1 bg-transparent text-lg outline-none placeholder:text-stone"
                aria-label="Search"
              />
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5" aria-label="Close search">
                <X size={18} />
              </button>
            </div>
            <ul className="max-h-[60vh] overflow-y-auto p-2" role="listbox">
              {results.map((r, i) => (
                <li key={r.kind + r.key} role="option" aria-selected={i === active}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r.to)}
                    className={`flex w-full items-center gap-4 rounded-2xl p-2.5 text-left transition ${i === active ? 'bg-deep text-glow' : ''}`}
                  >
                    <Photo photo={r.photo} width={960} sizes="64px" className="h-14 w-20 shrink-0 rounded-xl object-cover" />
                    <span className="min-w-0">
                      <span className="block font-semibold">{r.title}</span>
                      <span className="block truncate text-sm opacity-70">
                        {r.kind}: {r.sub}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {!results.length && <li className="p-6 text-center text-stone">No places match "{q}". Try a river, a forest or an area like Gowainghat.</li>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
