import { Helmet } from 'react-helmet-async';

interface Props {
  title: string;
  description?: string;
  image?: string;
  path?: string;
  jsonLd?: Record<string, unknown>;
}

export function Seo({ title, description, image, path, jsonLd }: Props) {
  const full = title.includes('SYLHET') ? title : `${title} | SYLHET`;
  const url = typeof window !== 'undefined' ? `${window.location.origin}${path ?? window.location.pathname}` : undefined;
  return (
    <Helmet>
      <title>{full}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={full} />
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      {url && <link rel="canonical" href={url} />}
      {url && <meta property="og:url" content={url} />}
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
