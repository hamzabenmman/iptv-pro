// Professional Blog Engine
// Uses Google News RSS for real news + Google Gemini for content generation + Pexels for images

import type { Article, Category, ArticleStatus } from './blog-types';
import { DEFAULT_CATEGORIES } from './blog-types';

// ===== ID GENERATION =====
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) + '-' + Date.now().toString(36);
}

// ===== IN-MEMORY STORAGE (falls back when no DB) =====
let articlesStore: Article[] = [];

export function getStoredArticles(): Article[] {
  return articlesStore;
}

export function setStoredArticles(articles: Article[]) {
  articlesStore = articles;
}

// ===== GOOGLE NEWS RSS FETCHER =====
const GOOGLE_NEWS_URLS: Record<string, string> = {
  'world-cup': 'https://news.google.com/rss/search?q=World+Cup+2026+football&hl=en&gl=US&ceid=US:en',
  'champions-league': 'https://news.google.com/rss/search?q=Champions+League+UCL+football&hl=en&gl=US&ceid=US:en',
  'premier-league': 'https://news.google.com/rss/search?q=Premier+League+EPL+football&hl=en&gl=US&ceid=US:en',
  'la-liga': 'https://news.google.com/rss/search?q=La+Liga+Spanish+football&hl=en&gl=US&ceid=US:en',
  'bein-sports': 'https://news.google.com/rss/search?q=beIN+Sports+football+streaming&hl=en&gl=US&ceid=US:en',
  football: 'https://news.google.com/rss/search?q=football+soccer+news+sports&hl=en&gl=US&ceid=US:en',
};

const FALLBACK_ARTICLES: Article[] = [
  {
    id: 'fallback-1',
    title: 'World Cup 2026: Complete Guide to Watching Every Match in 4K',
    slug: 'world-cup-2026-watch-guide',
    excerpt: 'Everything you need to know about watching the FIFA World Cup 2026 in stunning 4K quality with IPTV Pro.',
    content: `## World Cup 2026: Your Ultimate Viewing Guide

The FIFA World Cup 2026 is set to be the most exciting tournament yet, with matches across North America. Here's how you can watch every match in crystal-clear 4K quality.

### How to Watch

With IPTV Pro, you get access to every World Cup match live in 4K UHD. Our anti-freeze technology ensures zero buffering, so you never miss a moment of the action.

### Key Matches

- Group Stage: June 8 - July 3
- Round of 16: July 4-7
- Quarter-Finals: July 9-10
- Semi-Finals: July 13-14
- Final: July 18

### Why Choose IPTV Pro?

- **Ultra-Fast Servers**: Global network ensures smooth streaming
- **4K & 8K Quality**: The best viewing experience available
- **24/7 Support**: We're here whenever you need us
- **All Devices**: Watch on Smart TV, phone, tablet, or computer`,
    coverImage: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop',
    images: [],
    videos: [],
    slideshow: [],
    author: 'IPTV Pro Sports',
    status: 'published',
    categoryId: 'world-cup',
    category: DEFAULT_CATEGORIES[0],
    tags: ['World Cup 2026', 'FIFA', '4K Streaming', 'Football', 'IPTV'],
    seoTitle: 'World Cup 2026 Viewing Guide | IPTV Pro',
    seoDescription: 'Complete guide to watching the FIFA World Cup 2026 in 4K with IPTV Pro. All matches, zero buffering, any device.',
    seoKeywords: 'World Cup 2026, FIFA, 4K streaming, watch football, IPTV',
    readTime: 6,
    featured: true,
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    scheduledFor: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'fallback-2',
    title: 'Champions League 2026: Ultimate Guide to Watch Every Match Live',
    slug: 'champions-league-2026-watch-guide',
    excerpt: 'Don\'t miss a moment of the Champions League. Stream every match in 4K with IPTV Pro.',
    content: `## Champions League 2026: Complete Viewing Guide

The UEFA Champions League 2026 promises to be one of the most competitive seasons yet. Here's your complete guide to watching every match live.

### Match Schedule

- Group Stage Matchdays: September - December
- Round of 16: February - March
- Quarter-Finals: April
- Semi-Finals: May
- Final: June 2027

### Top Teams to Watch

- Real Madrid
- Manchester City
- Bayern Munich
- PSG
- Barcelona

### Stream in 4K

IPTV Pro brings you every Champions League match in stunning 4K UHD. Our dedicated sports servers ensure you get the best quality with zero buffering.`,
    coverImage: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?w=1200&h=630&fit=crop',
    images: [],
    videos: [],
    slideshow: [],
    author: 'IPTV Pro Sports',
    status: 'published',
    categoryId: 'champions-league',
    category: DEFAULT_CATEGORIES[0].children[0],
    tags: ['Champions League', 'UCL', 'Football', '4K Streaming', 'IPTV'],
    seoTitle: 'Champions League 2026 Viewing Guide | IPTV Pro',
    seoDescription: 'Watch every Champions League match live in 4K with IPTV Pro. Complete schedule and streaming guide.',
    seoKeywords: 'Champions League, UCL, football streaming, 4K sports',
    readTime: 5,
    featured: true,
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    scheduledFor: null,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'fallback-3',
    title: 'How to Watch Premier League on IPTV: Complete Setup Guide',
    slug: 'premier-league-iptv-setup-guide',
    excerpt: 'Step-by-step guide to watching Premier League matches on your favorite devices with IPTV Pro.',
    content: `## Premier League on IPTV: Complete Setup Guide

The Premier League is the most-watched football league in the world. Here's how to set up IPTV Pro to watch every match.

### Step 1: Subscribe
Contact us on WhatsApp to get your IPTV Pro subscription. We'll set up your account in minutes.

### Step 2: Install the App
Download IPTV Smarters, TiviMate, or any compatible IPTV player on your device.

### Step 3: Login
Enter the credentials we send you via WhatsApp. The app will load all available channels.

### Step 4: Enjoy
Browse the sports section, find Premier League channels, and start watching in 4K!

### Premier League Channels Available
- Sky Sports Premier League
- BT Sport 1 & 2
- beIN Sports Premier League
- NBC Sports`,
    coverImage: 'https://images.pexels.com/photos/47337/pexels-photo-47337.jpeg?w=1200&h=630&fit=crop',
    images: [],
    videos: [],
    slideshow: [],
    author: 'IPTV Pro Tech',
    status: 'published',
    categoryId: 'premier-league',
    category: DEFAULT_CATEGORIES[1].children[1],
    tags: ['Premier League', 'EPL', 'IPTV Setup', 'Football Streaming', 'Guide'],
    seoTitle: 'Watch Premier League on IPTV | Setup Guide | IPTV Pro',
    seoDescription: 'Complete step-by-step guide to watching Premier League matches on IPTV Pro. Easy setup on any device.',
    seoKeywords: 'Premier League, EPL, IPTV setup, football streaming',
    readTime: 7,
    featured: false,
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    scheduledFor: null,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'fallback-4',
    title: 'Best IPTV Settings for 4K Streaming: Expert Guide 2026',
    slug: 'best-iptv-4k-settings-2026',
    excerpt: 'Optimize your IPTV experience with expert-recommended settings for crystal-clear 4K streaming on any device.',
    content: `## Best IPTV Settings for 4K Streaming

Getting the best 4K streaming experience requires the right settings. Here's our expert guide.

### Internet Speed Requirements
- 4K Streaming: 25 Mbps minimum
- 8K Streaming: 50 Mbps minimum
- Stable connection recommended (use Ethernet when possible)

### Recommended Apps
1. **IPTV Smarters**: Best overall experience
2. **TiviMate**: Excellent for Android TV
3. **GSE IPTV**: Great for iOS devices

### Video Settings
- Buffer Size: Large (for stable streaming)
- Decoder: Hardware decoding
- Audio: Passthrough (for surround sound)
- Aspect Ratio: Original

### Troubleshooting
- Clear cache regularly
- Use a wired connection
- Restart your router weekly
- Contact support if issues persist`,
    coverImage: 'https://images.pexels.com/photos/572688/pexels-photo-572688.jpeg?w=1200&h=630&fit=crop',
    images: [],
    videos: [],
    slideshow: [],
    author: 'IPTV Pro Tech',
    status: 'published',
    categoryId: 'setup-guides',
    category: DEFAULT_CATEGORIES[1].children[0],
    tags: ['IPTV Settings', '4K Streaming', 'Setup Guide', 'Optimization'],
    seoTitle: 'Best IPTV Settings for 4K Streaming | IPTV Pro Guide',
    seoDescription: 'Expert guide to optimizing your IPTV settings for the best 4K streaming experience. Speed requirements, app recommendations, and more.',
    seoKeywords: 'IPTV settings, 4K streaming, buffer settings, IPTV optimization',
    readTime: 8,
    featured: false,
    publishedAt: new Date(Date.now() - 345600000).toISOString(),
    scheduledFor: null,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: 'fallback-5',
    title: 'La Liga 2026-27 Season Preview: Teams, Transfers & How to Watch',
    slug: 'la-liga-2026-27-season-preview',
    excerpt: 'Everything you need to know about the upcoming La Liga season, including top transfers and how to watch on IPTV.',
    content: `## La Liga 2026-27: Season Preview

The new La Liga season promises excitement, drama, and world-class football. Here's your complete preview.

### Top Teams
- **Real Madrid**: Defending champions with a strong squad
- **Barcelona**: Rebuilding under new management
- **Atletico Madrid**: Always a threat
- **Sevilla**: Europa League specialists

### Key Transfers
Several major moves are expected this summer. Stay tuned for the latest updates.

### How to Watch
All La Liga matches are available on IPTV Pro in stunning 4K quality. Subscribe now to never miss a match.`,
    coverImage: 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?w=1200&h=630&fit=crop',
    images: [],
    videos: [],
    slideshow: [],
    author: 'IPTV Pro Sports',
    status: 'published',
    categoryId: 'la-liga',
    category: DEFAULT_CATEGORIES[1].children[2],
    tags: ['La Liga', 'Spanish Football', '2026-27', 'Season Preview', 'IPTV'],
    seoTitle: 'La Liga 2026-27 Season Preview | IPTV Pro',
    seoDescription: 'Complete preview of the La Liga 2026-27 season. Teams, transfers, and how to watch every match in 4K.',
    seoKeywords: 'La Liga, Spanish football, season preview, football streaming',
    readTime: 5,
    featured: false,
    publishedAt: new Date(Date.now() - 432000000).toISOString(),
    scheduledFor: null,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    updatedAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 'fallback-6',
    title: 'beIN Sports Channels Complete Guide: What\'s Included in Your IPTV Subscription',
    slug: 'bein-sports-channels-guide-iptv',
    excerpt: 'Complete guide to all beIN Sports channels available on IPTV Pro, including World Cup, Champions League, and more.',
    content: `## beIN Sports Channels Guide

beIN Sports is the premier sports broadcaster in the Middle East and North Africa. Here's what you get with IPTV Pro.

### beIN Sports Channels
- **beIN Sports 1**: Premier League, La Liga
- **beIN Sports 2**: Champions League, Europa League
- **beIN Sports 3**: World Cup 2026, International Football
- **beIN Sports 4**: Tennis, Motorsports
- **beIN Sports 5**: Basketball, Handball
- **beIN Sports 6**: MMA, Wrestling

### Exclusive Content
- FIFA World Cup 2026
- UEFA Champions League
- Premier League
- La Liga
- Ligue 1
- And much more!

### HD & 4K Quality
All beIN Sports channels are available in HD and selected matches in 4K UHD.`,
    coverImage: 'https://images.pexels.com/photos/97552/pexels-photo-97552.jpeg?w=1200&h=630&fit=crop',
    images: [],
    videos: [],
    slideshow: [],
    author: 'IPTV Pro Sports',
    status: 'published',
    categoryId: 'bein-sports',
    category: DEFAULT_CATEGORIES[1].children[3],
    tags: ['beIN Sports', 'Sports Channels', 'IPTV', 'Football', 'World Cup'],
    seoTitle: 'beIN Sports Channels Guide | IPTV Pro Subscription',
    seoDescription: 'Complete guide to all beIN Sports channels on IPTV Pro. World Cup, Champions League, Premier League and more in 4K.',
    seoKeywords: 'beIN Sports, sports channels, IPTV, football streaming',
    readTime: 6,
    featured: false,
    publishedAt: new Date(Date.now() - 518400000).toISOString(),
    scheduledFor: null,
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    updatedAt: new Date(Date.now() - 518400000).toISOString(),
  },
];

// ===== GOOGLE NEWS RSS FETCH =====
export async function fetchGoogleNews(categoryId?: string): Promise<any[]> {
  const urlsToFetch = categoryId && GOOGLE_NEWS_URLS[categoryId]
    ? [GOOGLE_NEWS_URLS[categoryId]]
    : Object.values(GOOGLE_NEWS_URLS);

  try {
    const { XMLParser } = await import('fast-xml-parser');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const allItems: any[] = [];

    for (const url of urlsToFetch) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; IPTVProBot/1.0; +https://iptv-morocco.vercel.app)',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) continue;

        const xml = await response.text();
        const parsed = parser.parse(xml);

        if (parsed?.rss?.channel?.item) {
          const items = Array.isArray(parsed.rss.channel.item)
            ? parsed.rss.channel.item
            : [parsed.rss.channel.item];

          items.forEach((item: any) => {
            allItems.push({
              title: item.title || '',
              link: item.link || '',
              description: item.description || '',
              pubDate: item.pubDate || new Date().toISOString(),
              source: (item.source && typeof item.source === 'object' ? item.source['#text'] || item.source['@_url'] || 'Google News' : item.source || 'Google News'),
              category: url.includes('World+Cup') ? 'world-cup' :
                       url.includes('Champions+League') ? 'champions-league' :
                       url.includes('Premier+League') ? 'premier-league' :
                       url.includes('La+Liga') ? 'la-liga' :
                       url.includes('beIN') ? 'bein-sports' :
                       'football',
            });
          });
        }
      } catch {
        continue; // Skip failed URLs
      }
    }

    return allItems.slice(0, 30);
  } catch {
    return [];
  }
}

// ===== GEMINI AI CONTENT GENERATION =====
let geminiClient: any = null;

async function getGeminiClient() {
  if (geminiClient) return geminiClient;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenAI } = await import('@google/genai');
    geminiClient = new GoogleGenAI({ apiKey });
    return geminiClient;
  } catch {
    return null;
  }
}

export async function generateArticleWithGemini(newsHeadline: string, categoryId: string): Promise<Partial<Article> | null> {
  const client = await getGeminiClient();
  if (!client) return null;

  const categoryMap: Record<string, string> = {
    'world-cup': 'World Cup 2026',
    'champions-league': 'UEFA Champions League',
    'premier-league': 'English Premier League',
    'la-liga': 'Spanish La Liga',
    'bein-sports': 'beIN Sports',
    football: 'International Football',
  };

  const prompt = `You are a professional sports journalist for IPTV Pro, a premium IPTV service.

Based on this news headline: "${newsHeadline}"

Write a complete, well-researched news article for the category "${categoryMap[categoryId] || 'Sports'}".

Requirements:
- Write 400-600 words of engaging content
- Use markdown formatting (## headings, ### subheadings)
- Include a compelling 2-3 sentence excerpt
- Be factual and professional - no fake news
- Naturally mention IPTV Pro as a way to watch related sports content
- Target an international audience
- Return ONLY valid JSON with NO markdown code blocks

Return this exact JSON structure:
{
  "title": "SEO-optimized article title (max 70 chars)",
  "excerpt": "Compelling 2-3 sentence summary",
  "content": "Full article in markdown format with ## and ### headings",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "readTime": number between 4 and 10
}`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const text = response.text;
    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const article = JSON.parse(jsonMatch[0]);

    return {
      title: article.title || 'Sports News Update',
      excerpt: article.excerpt || '',
      content: article.content || '',
      tags: article.tags || [],
      readTime: article.readTime || 5,
      categoryId: categoryId,
      author: 'IPTV Pro News Team',
      status: 'pending_review' as ArticleStatus,
    };
  } catch {
    return null;
  }
}

// ===== PEXELS IMAGE SEARCH =====
export async function searchPexelsImage(query: string): Promise<string> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return '';

  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`, {
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) return '';

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large2x;
    }
    return '';
  } catch {
    return '';
  }
}

// ===== MAIN: CREATE A FULL ARTICLE FROM NEWS =====
export async function createArticleFromNews(categoryId?: string): Promise<Article | null> {
  try {
    // Step 1: Fetch real news headlines
    const newsItems = await fetchGoogleNews(categoryId);

    if (newsItems.length === 0) {
      // Use fallback article
      const fallback = FALLBACK_ARTICLES[Math.floor(Math.random() * FALLBACK_ARTICLES.length)];
      const newId = generateId();
      const article: Article = {
        ...fallback,
        id: newId,
        slug: generateSlug(fallback.title),
        status: 'pending_review',
        publishedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      articlesStore.push(article);
      return article;
    }

    // Step 2: Pick a random news item
    const newsItem = newsItems[Math.floor(Math.random() * newsItems.length)];
    const catId = categoryId || newsItem.category || 'football';

    // Step 3: Generate article with Gemini
    const generated = await generateArticleWithGemini(newsItem.title, catId);

    if (!generated) {
      // Fallback: create a simple article from the news headline
      const newId = generateId();
      const article: Article = {
        id: newId,
        title: newsItem.title,
        slug: generateSlug(newsItem.title),
        excerpt: newsItem.description?.replace(/<[^>]*>/g, '').slice(0, 200) || 'Latest sports news update.',
        content: `## ${newsItem.title}\n\n${newsItem.description?.replace(/<[^>]*>/g, '') || 'Read more on Google News.'}\n\n---\n\n*This article was compiled from news sources. Watch related content in 4K on IPTV Pro.*`,
        coverImage: '',
        images: [],
        videos: [],
        slideshow: [],
        author: 'IPTV Pro News Team',
        status: 'pending_review',
        categoryId: catId,
        category: null,
        tags: ['Sports', 'Football', 'News'],
        seoTitle: newsItem.title,
        seoDescription: newsItem.description?.replace(/<[^>]*>/g, '').slice(0, 160) || '',
        seoKeywords: '',
        readTime: 4,
        featured: false,
        publishedAt: null,
        scheduledFor: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      articlesStore.push(article);
      return article;
    }

    // Step 4: Search for a cover image with Pexels
    const imageQuery = `${generated.tags?.[0] || categoryId || 'sports'} football action`;
    const coverImage = await searchPexelsImage(imageQuery);

    // Step 5: Create the full article
    const newId = generateId();
    const article: Article = {
      id: newId,
      title: generated.title || newsItem.title,
      slug: generateSlug(generated.title || newsItem.title),
      excerpt: generated.excerpt || '',
      content: generated.content || '',
      coverImage: coverImage || '',
      images: coverImage ? [coverImage] : [],
      videos: [],
      slideshow: coverImage ? [coverImage] : [],
      author: 'IPTV Pro News Team',
      status: 'pending_review',
      categoryId: catId,
      category: null,
      tags: generated.tags || ['Sports', 'Football'],
      seoTitle: generated.title || newsItem.title,
      seoDescription: generated.excerpt?.slice(0, 160) || '',
      seoKeywords: (generated.tags || []).join(', '),
      readTime: generated.readTime || 5,
      featured: false,
      publishedAt: null,
      scheduledFor: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    articlesStore.push(article);
    return article;
  } catch {
    return null;
  }
}

// ===== GET ARTICLES =====
export function getArticles(options: {
  status?: ArticleStatus;
  categoryId?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
} = {}): { articles: Article[]; total: number } {
  let filtered = [...articlesStore];

  if (options.status) {
    filtered = filtered.filter(a => a.status === options.status);
  }
  if (options.categoryId) {
    filtered = filtered.filter(a => a.categoryId === options.categoryId);
  }
  if (options.featured) {
    filtered = filtered.filter(a => a.featured);
  }
  if (options.search) {
    const q = options.search.toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  const total = filtered.length;

  if (options.offset) {
    filtered = filtered.slice(options.offset);
  }
  if (options.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return { articles: filtered, total };
}

export function getArticleBySlug(slug: string): Article | null {
  // Check stored articles first
  const stored = articlesStore.find(a => a.slug === slug);
  if (stored) return stored;

  // Check fallback articles
  const fallback = FALLBACK_ARTICLES.find(a => a.slug === slug);
  if (fallback) return { ...fallback, id: generateId() };

  return null;
}

export function updateArticleStatus(id: string, status: ArticleStatus): boolean {
  const index = articlesStore.findIndex(a => a.id === id);
  if (index === -1) return false;

  articlesStore[index] = {
    ...articlesStore[index],
    status,
    publishedAt: status === 'published' ? new Date().toISOString() : articlesStore[index].publishedAt,
    updatedAt: new Date().toISOString(),
  };
  return true;
}

export function getPublishedArticles(): Article[] {
  return articlesStore.filter(a => a.status === 'published');
}

export function getPendingArticles(): Article[] {
  return articlesStore.filter(a => a.status === 'pending_review' || a.status === 'draft');
}

// ===== SEED FALLBACK ARTICLES =====
export function seedFallbackArticles() {
  if (articlesStore.length === 0) {
    articlesStore = FALLBACK_ARTICLES.map(a => ({
      ...a,
      id: generateId(),
      createdAt: new Date(Date.now() - Math.random() * 864000000).toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}
