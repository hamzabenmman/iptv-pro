import type { Viewport, Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
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
  metadataBase: new URL('https://iptv-pro.com'),
  title: {
    default: 'IPTV Pro | Best Premium IPTV Service for the Arab World',
    template: '%s | IPTV Pro',
  },
  description: 'Premium IPTV service with 25,000+ HD/4K/8K channels, sports, movies, series & live TV. Multi-language, 24/7 support, WhatsApp integration.',
  applicationName: 'IPTV Pro',
  creator: 'IPTV Pro',
  publisher: 'IPTV Pro',
  keywords: ['IPTV', 'streaming', 'TV channels', 'VOD', 'sports', 'Arabic', 'premium service'],
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ar_AE',
    alternateLocale: ['en_US', 'fr_FR', 'es_ES'],
    url: 'https://iptv-pro.com',
    siteName: 'IPTV Pro',
    title: 'IPTV Pro | Best Premium IPTV Service',
    description: 'Over 25,000 channels in HD, 4K & 8K. Exclusive sports, movies, series.',
    images: [
      {
        url: 'https://iptv-pro.com/images/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'IPTV Pro Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IPTV Pro | Premium IPTV Service',
    description: 'Best IPTV service with 25,000+ channels and 24/7 support',
    images: ['https://iptv-pro.com/images/og-image.svg'],
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
  url: 'https://iptv-pro.com',
  logo: 'https://iptv-pro.com/images/logo.svg',
  description: 'Premium IPTV service for the Arab world. Over 25,000 TV channels and VOD in HD, 4K and 8K.',
  address: { '@type': 'PostalAddress', addressCountry: 'AE' },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+971-XX-XXX-XXXX',
    contactType: 'customer service',
    availableLanguage: ['Arabic', 'English', 'French'],
  },
  sameAs: ['https://wa.me/971XXXXXXXXX'],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'IPTV Pro',
  url: 'https://iptv-pro.com',
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
