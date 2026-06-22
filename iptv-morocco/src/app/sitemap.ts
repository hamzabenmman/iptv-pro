import { MetadataRoute } from 'next';

const locales = [
  'ar', 'fr', 'en', 'es', 'de', 'it', 'pt', 'nl', 'ru', 'zh',
  'ja', 'ko', 'tr', 'pl', 'sv', 'da', 'fi', 'cs', 'hu', 'ro',
  'el', 'he', 'hi', 'th', 'vi', 'ms', 'id', 'fil', 'uk',
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iptv-pro.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [''];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    for (const locale of locales) {
      // Arabic (ar) is the default locale, served at root
      const url = locale === 'ar'
        ? `${siteUrl}${page}`
        : `${siteUrl}/${locale}${page}`;

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [
              l,
              l === 'ar'
                ? `${siteUrl}${page}`
                : `${siteUrl}/${l}${page}`,
            ])
          ),
        },
      });
    }
  }

  return sitemapEntries;
}
