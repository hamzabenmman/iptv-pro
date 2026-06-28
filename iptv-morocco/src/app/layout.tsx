import type { Viewport, Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import { SITE_CONFIG, fullUrl } from '@/lib/seo-config';
import {
  organizationSchema,
  websiteSchema,
  productSchema,
} from '@/lib/json-ld';
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
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0c0a08' },
    { media: '(prefers-color-scheme: light)', color: '#f8f7f5' },
  ],
  colorScheme: 'dark light',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.defaultTitle,
    template: SITE_CONFIG.titleTemplate,
  },
  description: SITE_CONFIG.defaultDescription,
  applicationName: SITE_CONFIG.name,
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  generator: 'Next.js',
  keywords: [
    'IPTV', 'IPTV subscription', 'best IPTV service', 'premium IPTV',
    '4K IPTV', '8K IPTV', 'beIN Sports', 'World Cup 2026',
    'live sports streaming', 'Arabic channels', 'VOD streaming',
    'Firestick IPTV', 'Smart TV IPTV', 'anti-freeze IPTV',
    'no buffering IPTV', 'stable IPTV', 'IPTV free trial',
    'IPTV Morocco', 'IPTV Arab world', 'streaming service',
    'TV channels', 'sports', 'premium service',
  ],
  authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.url }],
  formatDetection: { telephone: true, email: true, address: false },
  referrer: 'origin-when-cross-origin',

  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    alternateLocale: SITE_CONFIG.alternateLocales,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.defaultTitle,
    description: SITE_CONFIG.defaultDescription,
    images: [
      {
        url: fullUrl(SITE_CONFIG.ogImage),
        width: SITE_CONFIG.ogImageWidth,
        height: SITE_CONFIG.ogImageHeight,
        alt: SITE_CONFIG.name,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.defaultDescription,
    images: [fullUrl(SITE_CONFIG.ogImage)],
    creator: `@${SITE_CONFIG.name.replace(/\s+/g, '')}`,
  },

  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#D4AF37' },
    ],
  },

  appleWebApp: {
    capable: true,
    title: SITE_CONFIG.name,
    statusBarStyle: 'black-translucent',
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true, follow: true, noimageindex: false,
      'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1,
    },
  },
};

const faqQuestions = [
  { name: 'What is IPTV service?', answer: 'IPTV is a TV streaming service over the internet with thousands of channels, movies, and series.' },
  { name: 'How do I subscribe to IPTV Pro?', answer: 'Contact us on WhatsApp and we will set up your account in under 5 minutes.' },
  { name: 'What devices are supported?', answer: 'Smart TVs, Android, iOS, Fire TV Stick, Windows, Mac, MAG, and Enigma2 devices.' },
  { name: 'Is there a money-back guarantee?', answer: 'Yes, we offer a full 7-day money-back guarantee.' },
  { name: 'Do you offer beIN Sports channels?', answer: 'Yes, full beIN Sports coverage for World Cup 2026, Champions League, and more.' },
  { name: 'How many channels do you have?', answer: 'Over 25,000 channels in HD, 4K, and 8K quality.' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${inter.variable} ${tajawal.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://newsapi.org" />
        <link rel="dns-prefetch" href="https://newsapi.org" />
        <link rel="preconnect" href="https://free-api-live-football-data.p.rapidapi.com" />
        <link rel="dns-prefetch" href="https://free-api-live-football-data.p.rapidapi.com" />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationSchema() }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteSchema() }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productSchema() }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqQuestions.map(q => ({ '@type': 'Question', name: q.name, acceptedAnswer: { '@type': 'Answer', text: q.answer } })) }).replace(/</g, '\\u003c') }} />

        <link rel="dns-prefetch" href={`//${new URL(SITE_CONFIG.url).host}`} />
      </head>
      <body className="font-sans antialiased bg-dark-950">
        {children}
      </body>
    </html>
  );
}
