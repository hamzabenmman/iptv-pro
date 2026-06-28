// Client-side SEO utility
// Use this in 'use client' components to dynamically update meta tags

interface SEOMeta {
  title: string;
  description: string;
  image?: string;
  url?: string;
  siteName?: string;
  type?: string;
}

function setMetaTag(name: string, content: string, property: boolean = false) {
  const attr = property ? 'property' : 'name';
  let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function updateSEOMeta(meta: SEOMeta) {
  // Title
  document.title = meta.title;

  // Standard meta tags
  setMetaTag('description', meta.description);

  // Open Graph
  setMetaTag('og:title', meta.title, true);
  setMetaTag('og:description', meta.description, true);
  if (meta.image) setMetaTag('og:image', meta.image, true);
  if (meta.url) setMetaTag('og:url', meta.url, true);
  if (meta.siteName) setMetaTag('og:site_name', meta.siteName, true);
  setMetaTag('og:type', meta.type || 'article', true);

  // Twitter
  setMetaTag('twitter:title', meta.title);
  setMetaTag('twitter:description', meta.description);
  if (meta.image) setMetaTag('twitter:image', meta.image);

  // Article specific
  if (meta.type === 'article') {
    setMetaTag('article:published_time', new Date().toISOString(), true);
  }
}

export function resetSEOMeta() {
  // Reset to default site meta (will be overwritten by page metadata anyway)
  // This prevents stale meta from previous page
  document.title = 'IPTV Pro | Best Premium IPTV Service';
  setMetaTag('description', 'Premium IPTV service with 25,000+ HD/4K/8K channels, sports, movies, series & live TV.');
  setMetaTag('og:title', 'IPTV Pro | Best Premium IPTV Service', true);
  setMetaTag('og:description', 'Premium IPTV service with 25,000+ HD/4K/8K channels, sports, movies, series & live TV.', true);
  setMetaTag('twitter:title', 'IPTV Pro | Premium IPTV Service');
  setMetaTag('twitter:description', 'Best IPTV service with 25,000+ channels and 24/7 support');
}
