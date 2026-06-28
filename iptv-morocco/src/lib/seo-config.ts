// ===== CENTRAL SEO CONFIGURATION =====
// Update this file to change SEO settings sitewide

export const SITE_CONFIG = {
  name: 'IPTV Pro',
  tagline: 'Best Premium IPTV Service',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://iptv-pro.it.com',
  locale: 'en_US',
  alternateLocales: ['ar_AE', 'fr_FR', 'es_ES', 'de_DE', 'it_IT', 'pt_PT', 'nl_NL', 'ru_RU', 'tr_TR', 'zh_CN', 'ja_JP'] as string[],
  defaultTitle: 'IPTV Pro | Best Premium IPTV Service for the Arab World',
  defaultDescription: 'Premium IPTV service with 25,000+ HD/4K/8K channels, sports, movies, series & live TV. Multi-language, 24/7 support on WhatsApp. Subscribe now!',
  titleTemplate: '%s | IPTV Pro',
  
  // Logo & Images (place your files in public/images/)
  logo: '/images/logo.svg',
  logoWidth: 120,
  logoHeight: 60,
  ogImage: '/images/og-image.svg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  favicon: '/favicon.ico',
  
  // Contact
  whatsapp: '+212670799985',
  whatsappUrl: 'https://wa.me/212670799985',
  email: 'support@iptv-pro.it.com',
  
  // Social
  socialLinks: {
    whatsapp: 'https://wa.me/212670799985',
  },
  
  // Google Search Console (update with your verification code)
  googleVerification: 'YOUR_VERIFICATION_CODE',
  
  // Business Info
  business: {
    type: 'Organization',
    foundingDate: '2024',
    addressCountry: 'MA',
    telephone: '+212-670-799985',
    availableLanguages: ['Arabic', 'English', 'French', 'Spanish', 'German', 'Turkish', 'Portuguese', 'Italian', 'Dutch', 'Russian', 'Chinese', 'Japanese'],
    priceRange: '$$',
  },
  
  // Product Info
  product: {
    name: 'IPTV Pro Subscription',
    description: 'Premium IPTV subscription with 25,000+ channels in HD, 4K and 8K',
    offers: [
      { name: '1 Month Plan', price: 9.99, currency: 'USD', description: 'One month access to 25,000+ channels in HD quality' },
      { name: '3 Months Plan', price: 19.99, currency: 'USD', description: 'Three months access with HD & 4K quality, 2 devices' },
      { name: '1 Year Plan', price: 49.99, currency: 'USD', description: 'Full year access with 4K & 8K quality, 5 devices, VIP support' },
    ],
    rating: { value: '4.9', count: '50000' },
  },
  
  // Blog
  blog: {
    titlePrefix: '',
    titleSuffix: ' | IPTV Pro Blog',
    defaultImage: '/images/og-image.svg',
    publisher: 'IPTV Pro News Team',
  },
};

// Type helper so consumers still see readonly behavior
export type SiteConfig = typeof SITE_CONFIG;

// Helper: Get full URL for a path
export function fullUrl(path: string): string {
  const base = SITE_CONFIG.url.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

// Helper: Get locale code for SEO (maps our locale codes to proper formats)
export function seoLocale(locale: string): string {
  const map: Record<string, string> = {
    ar: 'ar_AE',
    fr: 'fr_FR',
    en: 'en_US',
    es: 'es_ES',
    de: 'de_DE',
    it: 'it_IT',
    pt: 'pt_PT',
    nl: 'nl_NL',
    ru: 'ru_RU',
    zh: 'zh_CN',
    tr: 'tr_TR',
    ja: 'ja_JP',
  };
  return map[locale] || 'en_US';
}

// Helper: Generate page title
export function pageTitle(title: string, template?: string): string {
  return template 
    ? template.replace('%s', title)
    : `${title} | ${SITE_CONFIG.name}`;
}

// Helper: Truncate text for meta descriptions
export function truncate(text: string, maxLength: number = 155): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
