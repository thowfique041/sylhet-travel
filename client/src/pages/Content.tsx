import { Link, useParams } from 'react-router-dom';
import type { Destination, Food as FoodT, Place, Post } from '@shared/types';
import { useData } from '@/hooks/useData';
import { Seo } from '@/components/Seo';
import { Photo } from '@/components/Photo';
import { FoodGuide } from '@/components/home/Sections';
import { DestinationCard } from '@/components/DestinationCard';
import { DESTINATIONS, EXPERIENCES, FOODS, GEMS, IMG, POSTS } from '@shared/seed';
import { commonsPage, photoUrl } from '@/lib/images';
import { niceDate, taka } from '@/lib/format';
import NotFound from './NotFound';

export function FoodPage() {
  const { data: foods = [] } = useData<FoodT[]>('/foods');
  const { data: restaurants = [] } = useData<Place[]>('/places?kind=restaurant');
  const { data: hotels = [] } = useData<Place[]>('/places?kind=hotel');
  return (
    <>
      <Seo title="Sylheti food and where to eat" description="Akhni, satkora beef, seven-layer tea and the restaurants in Sylhet where locals eat." />
      <section className="wrap pb-12 pt-32 lg:pt-40">
        <p className="font-bn text-2xl text-stone">সিলেটি খাবার</p>
        <h1 className="mt-2 max-w-4xl text-[clamp(3rem,8vw,7rem)] font-medium">Food guide</h1>
        <p className="mt-4 max-w-xl text-lg text-stone">The kitchen of Sylhet uses citrus rind, fermented fish and a lot of patience. Here is what to order and where.</p>
      </section>
      <FoodGuide foods={foods} restaurants={restaurants} />
      <section className="wrap py-24">
        <h2 className="text-5xl">Places to stay</h2>
        <ul className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {hotels.map((h) => (
            <li key={h.slug} className="border-t rule pt-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-display text-2xl">{h.name}</p>
                <p className="tabular shrink-0 text-sm font-semibold">
                  from {taka(h.priceFrom)} {h.priceNote}
                </p>
              </div>
              <p className="text-sm text-stone">{h.area}</p>
              <p className="mt-2 text-[15px] opacity-85">{h.description}</p>
              {h.destinationSlug && (
                <Link to={`/destinations/${h.destinationSlug}`} className="mt-2 inline-block text-sm font-semibold underline decoration-accent underline-offset-4">
                  Near {DESTINATIONS.find((d) => d.slug === h.destinationSlug)?.name ?? 'destination'}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function StoriesPage() {
  const { data: posts = [] } = useData<Post[]>('/posts');
  return (
    <>
      <Seo title="Travel stories from Sylhet" description="Field notes and routes from the hills, rivers and tea gardens of Sylhet." />
      <section className="wrap pb-24 pt-32 lg:pt-40">
        <h1 className="text-[clamp(3rem,8vw,7rem)] font-medium">Stories</h1>
        <div className="mt-14 grid gap-x-10 gap-y-16 md:grid-cols-2">
          {posts.map((p, i) => (
            <Link key={p.slug} to={`/stories/${p.slug}`} className={`group ${i === 0 ? 'md:col-span-2' : ''}`}>
              <div className="overflow-hidden rounded-[26px]">
                <Photo photo={p.cover} width={i === 0 ? 1920 : 1280} sizes={i === 0 ? '100vw' : '50vw'} className={`w-full object-cover transition-transform duration-[1.4s] ease-cine group-hover:scale-105 ${i === 0 ? 'aspect-[21/9]' : 'aspect-[16/10]'}`} />
              </div>
              <p className="mt-5 text-sm text-stone">
                {niceDate(p.date)}, {p.readMinutes} min read
              </p>
              <h2 className="mt-2 text-4xl group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4 sm:text-5xl">{p.title}</h2>
              <p className="mt-3 max-w-2xl opacity-85">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export function StoryPage() {
  const { slug = '' } = useParams();
  const { data: p, error, loading } = useData<Post>(`/posts/${slug}`);
  const { data: dest } = useData<Destination>(p?.destinationSlug ? `/destinations/${p.destinationSlug}` : null);
  if (loading && !p) return <div className="h-[70vh]" />;
  if (error || !p) return <NotFound />;
  return (
    <article>
      <Seo title={p.title} description={p.excerpt} image={photoUrl(p.cover, 1280)} jsonLd={{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, datePublished: p.date, author: { '@type': 'Organization', name: p.author }, image: photoUrl(p.cover, 1280) }} />
      <header className="wrap pb-10 pt-32 lg:pt-40">
        <Link to="/stories" className="text-sm text-stone hover:text-deep">
          All stories
        </Link>
        <h1 className="mt-4 max-w-5xl text-[clamp(2.8rem,7vw,6.5rem)] font-medium">{p.title}</h1>
        <p className="mt-5 text-stone">
          {p.author}, {niceDate(p.date)}, {p.readMinutes} min read
        </p>
      </header>
      <div className="wrap">
        <Photo photo={p.cover} width={1920} priority className="aspect-[21/10] w-full rounded-[26px] object-cover" />
      </div>
      <div className="wrap grid gap-12 py-16 lg:grid-cols-12">
        <div className="space-y-6 font-display text-[21px] leading-[1.75] lg:col-span-7 lg:col-start-2">
          <p className="text-[26px] leading-snug">{p.excerpt}</p>
          {p.body.map((b, i) => (
            <p key={i} className="measure">
              {b}
            </p>
          ))}
        </div>
        {dest && (
          <aside className="lg:col-span-3 lg:col-start-10">
            <p className="mb-4 text-sm text-stone">Go there</p>
            <DestinationCard d={dest} size="sm" sizes="25vw" />
          </aside>
        )}
      </div>
    </article>
  );
}

export function CreditsPage() {
  const all = [
    ...DESTINATIONS.flatMap((d) => d.gallery),
    ...Object.values(IMG.misc),
    ...EXPERIENCES.map((e) => e.image),
    ...FOODS.map((f) => f.image!).filter(Boolean),
    ...GEMS.map((g) => g.image),
    ...POSTS.map((p) => p.cover),
  ];
  const unique = [...new Map(all.map((p) => [p.path, p])).values()];
  return (
    <>
      <Seo title="Photo credits" description="Photographs on SYLHET come from Wikimedia Commons contributors." />
      <section className="wrap pb-24 pt-32 lg:pt-40">
        <h1 className="text-[clamp(3rem,7vw,6rem)] font-medium">Photo credits</h1>
        <p className="mt-4 max-w-2xl text-lg text-stone">
          Every photograph on this site is a real image of Sylhet division by a Wikimedia Commons contributor, used under its free license (mostly CC BY-SA). Open any file page to see the author and the exact license.
        </p>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {unique.map((p) => (
            <li key={p.path}>
              <a href={commonsPage(p)} target="_blank" rel="noreferrer" className="group block">
                <Photo photo={p} width={960} sizes="25vw" className="aspect-[4/3] w-full rounded-xl object-cover" />
                <p className="mt-2 text-sm group-hover:underline">{p.alt}</p>
                <p className="truncate text-xs text-stone">{decodeURIComponent(p.path.split('/').pop()!)}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
