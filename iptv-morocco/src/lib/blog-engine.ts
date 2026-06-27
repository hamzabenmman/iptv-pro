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
      return null; // No real news available — no fake articles
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
  return articlesStore.find(a => a.slug === slug) || null;
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


