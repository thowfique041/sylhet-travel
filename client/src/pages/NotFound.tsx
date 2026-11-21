import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';

export default function NotFound() {
  return (
    <section className="wrap flex min-h-[80vh] flex-col justify-center pt-24">
      <Seo title="Page not found" />
      <p className="ghost-bn text-[clamp(6rem,20vw,14rem)]">হারিয়ে গেছেন?</p>
      <h1 className="-mt-6 text-[clamp(2.6rem,6vw,5rem)] font-medium">This path leads nowhere.</h1>
      <p className="mt-4 max-w-md text-stone">The page may have moved, or the link was mistyped. Start again from the map of destinations.</p>
      <div className="mt-8 flex gap-3">
        <Link to="/destinations" className="btn-deep">
          Browse destinations
        </Link>
        <Link to="/" className="btn-line">
          Go home
        </Link>
      </div>
    </section>
  );
}
