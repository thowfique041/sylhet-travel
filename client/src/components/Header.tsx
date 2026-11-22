import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Heart, LayoutDashboard, LogOut, Menu, Search, User, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { SearchOverlay } from './SearchOverlay';
import { cx } from '@/lib/format';

const NAV = [
  { to: '/destinations', label: 'Destinations' },
  { to: '/planner', label: 'Plan a trip' },
  { to: '/food', label: 'Food' },
  { to: '/stories', label: 'Stories' },
];

export function Header() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => {
    logout();
    setMenu(false);
    navigate('/');
  };
  const { favorites } = useFavorites();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const overHero = pathname === '/' || /^\/destinations\/[^/]+$/.test(pathname);
  const solid = scrolled || !overHero;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !(e.target as HTMLElement).closest('input,textarea,select')) {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-glow focus:px-4 focus:py-2">
        Skip to content
      </a>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,color,box-shadow,backdrop-filter] duration-500',
          solid ? 'bg-[color-mix(in_srgb,var(--c-mist)_86%,transparent)] text-deep shadow-[0_1px_0_color-mix(in_srgb,var(--c-stone)_30%,transparent)] backdrop-blur-md' : 'text-glow',
        )}
      >
        <div className="wrap flex h-16 items-center gap-6 lg:h-20">
          <Link to="/" className="mr-auto flex items-baseline gap-2" aria-label="SYLHET home">
            <span className="font-display text-[26px] font-semibold tracking-[0.18em] lg:text-[30px]">SYLHET</span>
            <span className="hidden font-bn text-sm opacity-70 sm:inline">সিলেট</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => cx('relative text-[15px] font-medium transition-opacity hover:opacity-100', isActive ? 'opacity-100' : 'opacity-75')}>
                {({ isActive }) => (
                  <>
                    {n.label}
                    {isActive && <motion.span layoutId="nav-underline" className="absolute -bottom-1.5 left-0 right-0 h-[2px] rounded bg-accent" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" onClick={() => setSearch(true)} aria-label="Search destinations">
              <Search size={19} />
            </button>
            <Link to="/account#saved" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" aria-label={`Saved places (${favorites.length})`}>
              <Heart size={19} />
              {favorites.length > 0 && (
                <span className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-deep">{favorites.length}</span>
              )}
            </Link>
            {user ? (
              <UserMenu name={user.name} isAdmin={user.role === 'admin'} onSignOut={signOut} />
            ) : (
              <Link to="/login" className="hidden h-10 items-center gap-2 rounded-full px-3 text-[15px] font-medium hover:bg-white/10 sm:flex">
                <User size={18} />
                <span>Sign in</span>
              </Link>
            )}
            <button className="grid h-10 w-10 place-items-center rounded-full md:hidden" onClick={() => setMenu(true)} aria-label="Open menu" aria-expanded={menu}>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-deep text-glow md:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.18, 1] }}
            role="dialog"
            aria-modal
            aria-label="Menu"
          >
            <div className="wrap flex h-16 items-center justify-between">
              <span className="font-display text-[26px] font-semibold tracking-[0.18em]">SYLHET</span>
              <button className="grid h-10 w-10 place-items-center" onClick={() => setMenu(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <nav className="wrap mt-6 flex flex-col gap-1" aria-label="Mobile">
              {[{ to: '/', label: 'Home' }, ...NAV, { to: user ? '/account' : '/login', label: user ? 'My account' : 'Sign in' }, ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : [])].map((n, i) => (
                <motion.div key={n.to} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}>
                  <Link to={n.to} className="block py-2 font-display text-5xl">
                    {n.label}
                  </Link>
                </motion.div>
              ))}
              {user && (
                <motion.button initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} onClick={signOut} className="mt-4 flex items-center gap-3 py-2 text-left text-xl text-glow/75">
                  <LogOut size={20} /> Sign out
                </motion.button>
              )}
            </nav>
            <p className="wrap mt-auto pb-10 font-bn text-lg opacity-60">পাহাড়, নদী আর চায়ের দেশ</p>
          </motion.div>
        )}
      </AnimatePresence>
      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </>
  );
}

function UserMenu({ name, isAdmin, onSignOut }: { name: string; isAdmin: boolean; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);
  const item = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] hover:bg-black/5';
  return (
    <div ref={ref} className="relative hidden sm:block">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" className="flex h-10 items-center gap-2 rounded-full px-3 text-[15px] font-medium hover:bg-white/10">
        <User size={18} />
        <span>{name.split(' ')[0]}</span>
        <ChevronDown size={15} className={cx('transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 w-56 rounded-2xl border rule bg-mist p-2 text-deep shadow-xl"
          >
            <Link role="menuitem" to="/account" className={item}>
              <User size={17} /> My account
            </Link>
            {isAdmin && (
              <Link role="menuitem" to="/admin" className={item}>
                <LayoutDashboard size={17} /> Admin dashboard
              </Link>
            )}
            <div className="my-1 border-t rule" />
            <button role="menuitem" onClick={onSignOut} className={cx(item, 'text-red-700')}>
              <LogOut size={17} /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
