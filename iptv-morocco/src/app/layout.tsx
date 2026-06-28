import type { Viewport, Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700', '800', '900'],
  display: 'swap',
  variable: '--font-tajawal',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0c0a08',
  colorScheme: 'dark light',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://iptv-pro.it.com'),
  title: {
    default: 'IPTV Pro | Best Premium IPTV Service for the Arab World',
    template: '%s | IPTV Pro',
  },
  description: 'Premium IPTV service with 25,000+ HD/4K/8K channels, sports, movies, series & live TV. Multi-language, 24/7 support on WhatsApp. Subscribe now!',
  applicationName: 'IPTV Pro',
  creator: 'IPTV Pro',
  publisher: 'IPTV Pro',
  keywords: ['IPTV', 'IPTV subscription', 'best IPTV service', 'premium IPTV', '4K IPTV', '8K IPTV', 'beIN Sports', 'World Cup 2026', 'live sports streaming', 'Arabic channels', 'VOD streaming', 'Firestick IPTV', 'Smart TV IPTV', 'anti-freeze IPTV', 'no buffering IPTV', 'stable IPTV', 'IPTV free trial', 'IPTV Morocco', 'IPTV Arab world', 'streaming service', 'TV channels', 'sports', 'Arabic', 'premium service'],
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ar_AE',
    alternateLocale: ['en_US', 'fr_FR', 'es_ES'],
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://iptv-pro.it.com',
    siteName: 'IPTV Pro',
    title: 'IPTV Pro | Best Premium IPTV Service',
    description: 'Over 25,000 channels in HD, 4K & 8K. Exclusive sports, movies, series.',
    images: [
      {
        url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://iptv-pro.it.com') + '/images/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'IPTV Pro Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IPTV Pro | Premium IPTV Service',
    description: 'Best IPTV service with 25,000+ channels and 24/7 support',      images: [(process.env.NEXT_PUBLIC_SITE_URL || 'https://iptv-pro.it.com') + '/images/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// JSON-LD Schemas - International brand
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'IPTV Pro',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://iptv-pro.it.com',
  logo: (process.env.NEXT_PUBLIC_SITE_URL || 'https://iptv-pro.it.com') + '/images/logo.svg',
  description: 'Premium IPTV service for worldwide audiences. Over 25,000 TV channels and VOD in HD, 4K and 8K. Ultra-fast servers, anti-freeze technology, 24/7 support.',
  address: { '@type': 'PostalAddress', addressCountry: 'MA' },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+212-670-799985',
    contactType: 'customer service',
    availableLanguage: ['Arabic', 'English', 'French', 'Spanish', 'German', 'Turkish', 'Portuguese', 'Italian', 'Dutch', 'Russian', 'Chinese', 'Japanese'],
  },
  sameAs: [
    'https://wa.me/212670799985',
  ],
  foundingDate: '2024',
  isicV4: '6010',
  naics: '515210',
  knowsAbout: ['IPTV', 'Streaming', 'Live TV', 'Sports Broadcasting', 'Digital Entertainment'],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'IPTV Pro',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://iptv-pro.it.com',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'ما هي خدمة IPTV؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'IPTV هي خدمة بث تلفزيوني عبر الإنترنت. تتيح لك مشاهدة آلاف القنوات التلفزيونية والأفلام والمسلسلات عبر اتصال الإنترنت الخاص بك دون الحاجة إلى طبق استقبال أو كابل.',
      },
    },
    {
      '@type': 'Question',
      name: 'كيف يمكنني الاشتراك؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'كل ما عليك فعله هو التواصل معنا عبر واتساب على الرقم الظاهر في الموقع. سنقوم بتجهيز حسابك في أقل من 5 دقائق.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما هي الأجهزة التي تدعم الخدمة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'خدمتنا تعمل على جميع الأجهزة: التلفزيونات الذكية، الهواتف، الكمبيوتر، الأجهزة اللوحية، MAG، و Enigma 2.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل يوجد ضمان لاسترجاع الأموال؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، نوفر ضمان استرجاع الأموال بالكامل خلال 7 أيام إذا لم تكن راضياً عن الخدمة.',
      },
    },
  ],
};

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'IPTV Pro Subscription',
  description: 'Premium IPTV subscription with 25,000+ channels in HD, 4K and 8K. Includes live TV, sports, movies, series, and VOD.',
  brand: {
    '@type': 'Brand',
    name: 'IPTV Pro',
  },
  offers: [
    {
      '@type': 'Offer',
      name: '1 Month Plan',
      price: '9.99',
      priceCurrency: 'USD',
      priceValidUntil: '2026-12-31',
      description: 'One month access to 25,000+ channels in HD quality',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: '3 Months Plan',
      price: '19.99',
      priceCurrency: 'USD',
      priceValidUntil: '2026-12-31',
      description: 'Three months access with HD & 4K quality, 2 devices',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: '1 Year Plan',
      price: '49.99',
      priceCurrency: 'USD',
      priceValidUntil: '2026-12-31',
      description: 'Full year access with 4K & 8K quality, 5 devices, VIP support',
      availability: 'https://schema.org/InStock',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    bestRating: '5',
    ratingCount: '50000',
    reviewCount: '50000',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${inter.variable} ${tajawal.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        {/* Google Search Console verification */}
        <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
        {/* Preconnect to important origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-dark-950">
        {children}
      </body>
    </html>
  );
}
