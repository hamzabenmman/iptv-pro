import type { Viewport, Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  metadataBase: new URL(SITE_CONFIG.url || 'https://iptv-pro.it.com'),
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
  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },
  referrer: 'origin-when-cross-origin',
  
  // Open Graph
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

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.defaultDescription,
    images: [fullUrl(SITE_CONFIG.ogImage)],
    creator: `@${SITE_CONFIG.name.replace(/\s+/g, '')}`,
  },

  // Icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#D4AF37',
      },
    ],
  },

  // Apple Web App
  appleWebApp: {
    capable: true,
    title: SITE_CONFIG.name,
    statusBarStyle: 'black-translucent',
  },

  // Robots
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

  // Verification
  verification: {
    google: SITE_CONFIG.googleVerification,
    // Add other verification codes as needed
  },

};

// Category-specific FAQ questions for schema
const faqQuestions = [
  {
    name: 'ما هي خدمة IPTV؟',
    answer: 'IPTV هي خدمة بث تلفزيوني عبر الإنترنت. تتيح لك مشاهدة آلاف القنوات التلفزيونية والأفلام والمسلسلات عبر اتصال الإنترنت الخاص بك دون الحاجة إلى طبق استقبال أو كابل.',
  },
  {
    name: 'How do I subscribe to IPTV Pro?',
    answer: 'Simply contact us on WhatsApp and we will set up your account in under 5 minutes. Choose from our 1-month, 3-month, or 1-year plans.',
  },
  {
    name: 'What devices are supported?',
    answer: 'Our service works on all devices: Smart TVs (Samsung, LG, Sony), Android phones and TV boxes, iOS devices, Amazon Fire TV Stick, Windows & Mac computers, MAG boxes, and Enigma2 devices.',
  },
  {
    name: 'Is there a money-back guarantee?',
    answer: 'Yes, we offer a full 7-day money-back guarantee if you are not satisfied with our service.',
  },
  {
    name: 'Do you offer beIN Sports channels?',
    answer: 'Yes, we offer full beIN Sports coverage including beIN Sports 4K channels for World Cup 2026, Champions League, and all major football events.',
  },
  {
    name: 'How many channels do you have?',
    answer: 'We offer over 25,000 channels in HD, 4K, and 8K quality including sports, movies, news, entertainment, and kids channels from around the world.',
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${inter.variable} ${tajawal.variable}`}>
      <head>
        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        {/* Preconnect to important origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://newsapi.org" />
        <link rel="dns-prefetch" href="https://newsapi.org" />
        <link rel="preconnect" href="https://free-api-live-football-data.p.rapidapi.com" />
        <link rel="dns-prefetch" href="https://free-api-live-football-data.p.rapidapi.com" />

        {/* JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationSchema() }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: websiteSchema() }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: productSchema() }}
        />

        {/* Fallback FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqQuestions.map(q => ({
                '@type': 'Question',
                name: q.name,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: q.answer,
                },
              })),
            }).replace(/</g, '\\u003c'),
          }}
        />

        {/* DNS Prefetch for faster navigation */}
        <link rel="dns-prefetch" href="//iptv-pro.it.com" />
      </head>
      <body className="font-sans antialiased bg-dark-950">
        {children}
        {/* Preload critical resources */}
        <link rel="preload" href={SITE_CONFIG.ogImage} as="image" />
      </body>
    </html>
  );
}
