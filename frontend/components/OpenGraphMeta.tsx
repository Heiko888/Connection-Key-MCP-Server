import Head from 'next/head';

interface OpenGraphMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
}

export default function OpenGraphMeta({
  title = 'Kosmische Verbindungen - Human Design & Astrologie',
  description = 'Entdecke dein einzigartiges Human Design Chart, planetare Transits und kosmische Verbindungen. Deine Reise zur Selbsterkenntnis beginnt hier.',
  image = '/og-image.png',
  url,
  type = 'website',
  siteName = 'Kosmische Verbindungen',
  locale = 'de_DE'
}: OpenGraphMetaProps) {
  const fullUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const fullImageUrl = image.startsWith('http') 
    ? image 
    : `${process.env.NEXT_PUBLIC_APP_URL}${image}`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="German" />
      <meta name="author" content="Kosmische Verbindungen" />
      <link rel="canonical" href={fullUrl} />
    </Head>
  );
}

