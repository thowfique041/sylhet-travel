import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';
import Home from '@/pages/Home';

const Destinations = lazy(() => import('@/pages/Destinations'));
const DestinationDetail = lazy(() => import('@/pages/DestinationDetail'));
const Planner = lazy(() => import('@/pages/Planner'));
const Content = () => import('@/pages/Content');
const FoodPage = lazy(() => Content().then((m) => ({ default: m.FoodPage })));
const StoriesPage = lazy(() => Content().then((m) => ({ default: m.StoriesPage })));
const StoryPage = lazy(() => Content().then((m) => ({ default: m.StoryPage })));
const CreditsPage = lazy(() => Content().then((m) => ({ default: m.CreditsPage })));
const Auth = () => import('@/pages/Auth');
const Login = lazy(() => Auth().then((m) => ({ default: () => <m.AuthPage mode="login" /> })));
const Register = lazy(() => Auth().then((m) => ({ default: () => <m.AuthPage mode="register" /> })));
const Account = lazy(() => Auth().then((m) => ({ default: m.AccountPage })));
const Admin = lazy(() => import('@/admin/Admin'));
const NotFound = lazy(() => import('@/pages/NotFound'));

/** Pages that set their own palette; everything else returns to the default theme. */
const themed = (p: string) => p === '/' || /^\/destinations\/[^/]+$/.test(p);

export default function App() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const { resetTheme } = useTheme();
  const key = location.pathname.startsWith('/admin') ? '/admin' : location.pathname;

  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    if (!themed(location.pathname)) resetTheme();
    if (!location.pathname.startsWith('/admin')) void api('/track', { method: 'POST', json: { path: location.pathname } }).catch(() => {});
  }, [location.pathname, location.hash, resetTheme]);

  useEffect(() => {
    if (!location.hash) return;
    const t = setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 350);
    return () => clearTimeout(t);
  }, [location.hash, location.pathname]);

  return (
    <>
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main"
          key={key}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          className="min-h-[70vh]"
        >
          <Suspense fallback={<div className="min-h-[100svh]" />}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/destinations/:slug" element={<DestinationDetail />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/food" element={<FoodPage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/stories/:slug" element={<StoryPage />} />
              <Route path="/credits" element={<CreditsPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Account />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>
      {!location.pathname.startsWith('/admin') && <Footer />}
    </>
  );
}
