import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import HtmlLangSetter from '@/components/HtmlLangSetter';
import ScrollProgressBar from '@/components/ScrollProgressBar';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    authors: [{ name: 'IPTV Pro' }],
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale: locale === 'ar' ? 'ar_AE' : locale === 'fr' ? 'fr_FR' : 'en_US',
      siteName: 'IPTV Pro',
      images: [
        {
          url: '/images/og-image.svg',
          width: 1200,
          height: 630,
          alt: 'IPTV Pro - Premium IPTV Service',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/images/og-image.svg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `https://iptv-pro.com`,
      languages: {
        'ar': 'https://iptv-pro.com',
        'fr': 'https://iptv-pro.com/fr',
        'en': 'https://iptv-pro.com/en',
        'es': 'https://iptv-pro.com/es',
        'de': 'https://iptv-pro.com/de',
        'it': 'https://iptv-pro.com/it',
        'pt': 'https://iptv-pro.com/pt',
        'nl': 'https://iptv-pro.com/nl',
        'ru': 'https://iptv-pro.com/ru',
        'zh': 'https://iptv-pro.com/zh',
        'tr': 'https://iptv-pro.com/tr',
      },
    },
    other: {
      'google-site-verification': 'your-google-site-verification-code',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;
  const messages = await getMessages();
  const isRtl = locale === 'ar' || locale === 'he' || locale === 'fa' || locale === 'ur';

  return (
    <>
      <ScrollProgressBar />
      <HtmlLangSetter locale={locale} isRtl={isRtl} />
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </>
  );
}
