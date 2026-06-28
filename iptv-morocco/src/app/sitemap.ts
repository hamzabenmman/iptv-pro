import { MetadataRoute } from 'next';
import { SITE_CONFIG, fullUrl } from '@/lib/seo-config';
import { getStoredArticles } from '@/lib/blog-engine';

// Supported locales
const locales = ['ar', 'fr', 'en', 'es', 'de', 'it', 'pt', 'nl', 'ru', 'zh', 'tr', 'ja'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // ===== STATIC PAGES =====
  // Each page needs entries for every locale
  const staticRoutes = [
    { path: '', priority: 1.0, changefreq: 'weekly' as const },
    { path: 'blog', priority: 0.9, changefreq: 'daily' as const },
    { path: 'matches', priority: 0.8, changefreq: 'hourly' as const },
    { path: 'backlinks', priority: 0.3, changefreq: 'monthly' as const },
  ];

  for (const locale of locales) {
    for (const route of staticRoutes) {
      const url = locale === 'ar'
        ? fullUrl(route.path ? `/${route.path}` : '')
        : fullUrl(`/${locale}${route.path ? `/${route.path}` : ''}`);

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: route.changefreq,
        priority: route.priority,
      });
    }
  }

  // ===== BLOG ARTICLES =====
  try {
    const articles = getStoredArticles();
    const publishedArticles = articles.filter(a => a.status === 'published');

    for (const article of publishedArticles) {
      for (const locale of locales) {
        const url = fullUrl(`/${locale}/blog/${article.slug}`);
        entries.push({
          url,
          lastModified: new Date(article.updatedAt || article.createdAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  } catch {
    // Blog articles not available, skip
  }

  // ===== LOCALE-SPECIFIC HOME PAGES (already covered above) =====

  return entries;
}
