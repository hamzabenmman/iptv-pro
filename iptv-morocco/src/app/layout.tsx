import type { Viewport, Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import { SITE_CONFIG } from '@/lib/seo-config';
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
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.defaultTitle,
    description: SITE_CONFIG.defaultDescription,
    images: [
      {
        url: '/images/og-image.svg',
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.defaultDescription,
    images: ['/images/og-image.svg'],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.svg' },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Category-specific FAQ questions for schema
const faqQuestions = [
  {
    name: '\u0645\u0627 \u0647\u064a \u062e\u062f\u0645\u0629 IPTV\u061f',
    answer: 'IPTV \u0647\u064a \u062e\u062f\u0645\u0629 \u0628\u062b \u062a\u0644\u0641\u0638\u064a \u0645\u0639 \u0627\u0644\u0625\u0646\u062a\u0631\u0646\u062a. \u062a\u062a\u064a\u062d \u0644\u0643 \u0645\u0634\u0627\u0647\u062f\u0629 \u0622\u0644\u0627\u0626 \u0627\u0644\u0642\u0646\u0648\u0627\u062a \u0627\u0644\u062a\u0641\u0644\u0632\u064a\u0648\u0646\u064a\u0629.',
  },
  {
    name: 'How do I subscribe to IPTV Pro?',
    answer: 'Contact us on WhatsApp and we will set up your account in under 5 minutes.',
  },
  {
    name: 'What devices are supported?',
    answer: 'Smart TVs, Android, iOS, Fire TV Stick, Windows, Mac, MAG boxes, and Enigma2.',
  },
  {
    name: 'Is there a money-back guarantee?',
    answer: 'Yes, we offer a full 7-day money-back guarantee.',
  },
  {
    name: 'Do you offer beIN Sports channels?',
    answer: 'Yes, full beIN Sports coverage for World Cup 2026, Champions League, and more.',
  },
  {
    name: 'How many channels do you have?',
    answer: 'Over 25,000 channels in HD, 4K, and 8K quality.',
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = SITE_CONFIG.url || 'https://iptv-pro.it.com';

  return (
    <html className={`${inter.variable} ${tajawal.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />

        {/* JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE_CONFIG.name,
              url: baseUrl,
              logo: `${baseUrl}/images/logo.svg`,
              description: SITE_CONFIG.defaultDescription,
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: SITE_CONFIG.business.telephone,
                contactType: 'customer service',
              },
            }).replace(/</g, '\\u003c'),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE_CONFIG.name,
              url: baseUrl,
              description: SITE_CONFIG.defaultDescription,
            }).replace(/</g, '\\u003c'),
          }}
        />
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
      </head>
      <body className="font-sans antialiased bg-dark-950">
        {children}
      </body>
    </html>
  );
}
