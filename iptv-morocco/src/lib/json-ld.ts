// ===== JSON-LD Structured Data Generators =====
// Generates type-safe JSON-LD schemas for all page types

import { SITE_CONFIG, fullUrl } from './seo-config';
import type { Article } from './blog-types';

function safeJson(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
}

// Organization Schema
export function organizationSchema() {
  const { business, url, name, logo, socialLinks, whatsapp } = SITE_CONFIG;
  return safeJson({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: name,
    url: url,
    logo: fullUrl(logo),
    description: SITE_CONFIG.defaultDescription,
    foundingDate: business.foundingDate,
    address: {
      '@type': 'PostalAddress',
      addressCountry: business.addressCountry,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: business.telephone,
      contactType: 'customer service',
      availableLanguage: business.availableLanguages,
    },
    sameAs: [socialLinks.whatsapp],
    knowsAbout: ['IPTV', 'Streaming', 'Live TV', 'Sports Broadcasting', 'Digital Entertainment'],
  });
}

// Website Schema
export function websiteSchema() {
  return safeJson({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.defaultDescription,
    inLanguage: ['en', 'fr', 'ar', 'es', 'de', 'it', 'pt', 'nl', 'ru', 'tr', 'zh', 'ja'],
  });
}

// Product Schema (for pricing page)
export function productSchema() {
  const { product, url, name, logo } = SITE_CONFIG;
  return safeJson({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: { '@type': 'Brand', name: name },
    logo: fullUrl(logo),
    url: url,
    offers: product.offers.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      price: offer.price.toString(),
      priceCurrency: offer.currency,
      priceValidUntil: '2026-12-31',
      description: offer.description,
      availability: 'https://schema.org/InStock',
      url: url,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating.value,
      bestRating: '5',
      ratingCount: product.rating.count,
      reviewCount: product.rating.count,
    },
  });
}

// FAQ Schema
export function faqSchema(questions: { name: string; answer: string }[]) {
  return safeJson({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.name,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  });
}

// BreadcrumbList Schema
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return safeJson({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: fullUrl(item.url),
    })),
  });
}

// NewsArticle Schema (for blog articles)
export function newsArticleSchema(article: Article, locale: string) {
  const articleUrl = fullUrl(`/${locale}/blog/${article.slug}`);
  return safeJson({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || article.seoDescription || '',
    image: article.coverImage ? [fullUrl(article.coverImage)] : [fullUrl(SITE_CONFIG.ogImage)],
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    author: {
      '@type': 'Person',
      name: article.author || SITE_CONFIG.blog.publisher,
      url: SITE_CONFIG.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: fullUrl(SITE_CONFIG.logo),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    url: articleUrl,
    articleSection: article.categoryId || 'Sports',
    keywords: article.tags?.join(', ') || '',
    wordCount: article.content?.split(/\s+/).length || 0,
    inLanguage: locale,
  });
}

// BlogPosting Schema (for guides and editorial content)
export function blogPostingSchema(article: Article, locale: string) {
  const articleUrl = fullUrl(`/${locale}/blog/${article.slug}`);
  return safeJson({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt || article.seoDescription || '',
    image: article.coverImage ? [fullUrl(article.coverImage)] : [fullUrl(SITE_CONFIG.ogImage)],
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    author: {
      '@type': 'Person',
      name: article.author || SITE_CONFIG.blog.publisher,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: fullUrl(SITE_CONFIG.logo),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    url: articleUrl,
    articleSection: article.categoryId || 'Sports',
    keywords: article.tags?.join(', ') || '',
    wordCount: article.content?.split(/\s+/).length || 0,
    inLanguage: locale,
  });
}

// SportsEvent Schema (for live matches)
export function sportsEventSchema(match: {
  name: string;
  date: string;
  location?: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
}) {
  return safeJson({
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: match.name,
    startDate: match.date,
    location: match.location ? {
      '@type': 'Place',
      name: match.location,
    } : undefined,
    homeTeam: {
      '@type': 'SportsTeam',
      name: match.homeTeam,
    },
    awayTeam: {
      '@type': 'SportsTeam',
      name: match.awayTeam,
    },
    competition: {
      '@type': 'SportsOrganization',
      name: match.league,
    },
  });
}

// LocalBusiness Schema (for contact page)
export function localBusinessSchema() {
  return safeJson({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: fullUrl(SITE_CONFIG.logo),
    image: fullUrl(SITE_CONFIG.ogImage),
    description: SITE_CONFIG.defaultDescription,
    telephone: SITE_CONFIG.business.telephone,
    priceRange: SITE_CONFIG.business.priceRange,
    address: {
      '@type': 'PostalAddress',
      addressCountry: SITE_CONFIG.business.addressCountry,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_CONFIG.business.telephone,
      contactType: 'customer service',
      availableLanguage: SITE_CONFIG.business.availableLanguages,
    },
  });
}
