import type { Destination, Experience, Food, Gem, Place, Post, Slide } from '@shared/types';
import { useData } from '@/hooks/useData';
import { Seo } from '@/components/Seo';
import { Hero } from '@/components/home/Hero';
import { Discover } from '@/components/home/Discover';
import { ExploreDestinations, Experiences, FoodGuide, HiddenGems, PlannerTeaser, Stories } from '@/components/home/Sections';

export default function Home() {
  const { data: slides = [] } = useData<Slide[]>('/slides');
  const { data: destinations = [] } = useData<Destination[]>('/destinations');
  const { data: experiences = [] } = useData<Experience[]>('/experiences');
  const { data: gems = [] } = useData<Gem[]>('/gems');
  const { data: foods = [] } = useData<Food[]>('/foods');
  const { data: restaurants = [] } = useData<Place[]>('/places?kind=restaurant');
  const { data: posts = [] } = useData<Post[]>('/posts');

  return (
    <>
      <Seo
        title="SYLHET | Travel guide to the hills, rivers and tea of Sylhet, Bangladesh"
        description="Plan a trip to Sylhet: Jaflong, Ratargul, Sreemangal, Bisanakandi, Lalakhal and the haors. Seasons, routes, costs and local food."
        jsonLd={{ '@context': 'https://schema.org', '@type': 'TouristDestination', name: 'Sylhet Division, Bangladesh', touristType: ['Nature', 'Adventure', 'Culture'] }}
      />
      <Hero slides={slides} destinations={destinations} />
      <Discover />
      <ExploreDestinations destinations={destinations} />
      <Experiences experiences={experiences} destinations={destinations} />
      <PlannerTeaser />
      <HiddenGems gems={gems} />
      <FoodGuide foods={foods} restaurants={restaurants.slice(0, 4)} compact />
      <Stories posts={posts} />
    </>
  );
}
