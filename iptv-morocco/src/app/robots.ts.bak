import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',         // Hide API routes
          '/admin/',       // Hide admin panel
          '/_next/',       // Hide Next.js internals
          '/404',          // Don't index 404 page
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',     // Block AI crawlers
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
