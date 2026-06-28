// NewsAPI.org Integration Service
// Fetches real headlines from NewsAPI.org (free tier: 100 req/day)
// Falls back gracefully if no API key or API is unreachable

export interface NewsAPIArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
  code?: string;
  message?: string;
}

// Map our category IDs to NewsAPI categories
const CATEGORY_MAP: Record<string, string> = {
  'world-cup': 'sports',
  'champions-league': 'sports',
  'premier-league': 'sports',
  'la-liga': 'sports',
  'bundesliga': 'sports',
  'serie-a': 'sports',
  'ligue-1': 'sports',
  'bein-sports': 'entertainment',
  football: 'sports',
};

// Country codes for NewsAPI (where most sports news comes from)
const COUNTRY_SOURCES: Record<string, string> = {
  world: 'gb',
  'world-cup': 'gb',
  'premier-league': 'gb',
  'la-liga': 'es',
  'bundesliga': 'de',
  'serie-a': 'it',
  'ligue-1': 'fr',
};

// Keywords to search for when fetching sports news
const SPORTS_KEYWORDS: Record<string, string[]> = {
  'world-cup': ['World Cup 2026', 'FIFA World Cup', 'football world cup'],
  'champions-league': ['Champions League', 'UCL', 'UEFA Champions League'],
  'premier-league': ['Premier League', 'EPL', 'English Premier League'],
  'la-liga': ['La Liga', 'Spanish La Liga', 'Barcelona Real Madrid'],
  football: ['football', 'soccer', 'sports news', 'transfer news'],
  'bein-sports': ['beIN Sports', 'sports broadcasting', 'live sport'],
};

function getApiKey(): string | null {
  return process.env.NEWSAPI_KEY || null;
}

// Fetch top headlines by category
export async function fetchTopHeadlines(
  category?: string,
  country: string = 'gb',
  pageSize: number = 20
): Promise<NewsAPIArticle[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      apiKey,
      pageSize: pageSize.toString(),
      sortBy: 'popularity',
    });

    if (category && CATEGORY_MAP[category]) {
      params.set('category', CATEGORY_MAP[category]);
    }

    // Use country-specific source if available
    const sourceCountry = category && COUNTRY_SOURCES[category]
      ? COUNTRY_SOURCES[category]
      : country;
    params.set('country', sourceCountry);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?${params.toString()}`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!response.ok) return [];

    const data: NewsAPIResponse = await response.json();
    return data.articles || [];
  } catch {
    return [];
  }
}

// Search for news articles with keyword queries (The Guardian style fallback)
export async function searchNews(
  query: string,
  pageSize: number = 20,
  sortBy: 'relevancy' | 'popularity' | 'publishedAt' = 'publishedAt'
): Promise<NewsAPIArticle[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      apiKey,
      q: query,
      pageSize: pageSize.toString(),
      sortBy,
      language: 'en',
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `https://newsapi.org/v2/everything?${params.toString()}`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!response.ok) return [];

    const data: NewsAPIResponse = await response.json();
    return data.articles || [];
  } catch {
    return [];
  }
}

// Fetch trending topics by extracting keywords from top headlines
export async function fetchTrendingTopics(limit: number = 10): Promise<string[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  try {
    // Only fetch sports category to save API quota (100 req/day on free tier)
    const allHeadlines: string[] = [];
    const params = new URLSearchParams({
      apiKey,
      category: 'sports',
      country: 'gb',
      pageSize: '20',
      sortBy: 'popularity',
    });

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?${params.toString()}`,
        { signal: controller.signal }
      );

      clearTimeout(timeout);

      if (response.ok) {
        const data: NewsAPIResponse = await response.json();
        if (data.articles) {
          data.articles.forEach(a => {
            const text = `${a.title} ${a.description || ''}`;
            const words = text
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, '')
              .split(/\s+/)
              .filter(w => w.length > 4 && !['this', 'that', 'with', 'from', 'have', 'been', 'will', 'what', 'when', 'where', 'which', 'their', 'there', 'about', 'would', 'could', 'should', 'after', 'still', 'being', 'other', 'after', 'before', 'between'].includes(w));
            allHeadlines.push(...words);
          });
        }
      }
    } catch {
      // API call failed, will return defaults later
    }

    // Count word frequency and return top results
    const wordCount = new Map<string, number>();
    allHeadlines.forEach(w => {
      wordCount.set(w, (wordCount.get(w) || 0) + 1);
    });

    // Filter out common sports/generic words
    const stopWords = ['football', 'sports', 'news', 'says', 'latest', 'world', 'match', 'game', 'team', 'player', 'season', 'first', 'year', 'time', 'just', 'like', 'make', 'new'];
    const sorted = [...wordCount.entries()]
      .filter(([word]) => !stopWords.includes(word))
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

    return sorted.length > 0 ? sorted : [
      'World Cup 2026', 'Champions League', 'Premier League',
      'Manchester City', 'Real Madrid', 'Barcelona',
    ];
  } catch {
    return [];
  }
}

// Convert NewsAPI article to our blog format
export function newsAPIToArticle(
  item: NewsAPIArticle,
  categoryId: string = 'football',
  generateSlug: (title: string) => string,
  generateId: () => string
): {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  source: string;
  publishedAt: string;
  tags: string[];
  readTime: number;
} | null {
  if (!item.title || item.title === '[Removed]') return null;

  const title = item.title;
  const excerpt = item.description || 'Read the full article for more details.';
  const sourceName = item.source?.name || 'News Source';
  const imageUrl = item.urlToImage || '';
  const publishedAt = item.publishedAt || new Date().toISOString();

  // Estimate read time based on content length
  const contentText = item.content || item.description || '';
  const wordCount = contentText.split(/\s+/).length;
  const readTime = Math.max(2, Math.ceil(wordCount / 200));

  // Generate tags from title & source
  const tags = [
    sourceName,
    ...title
      .split(/\s+/)
      .filter(w => w.length > 4)
      .slice(0, 3)
      .map(w => w.replace(/[^a-zA-Z0-9]/g, '')),
  ].filter(Boolean);

  return {
    title,
    slug: generateSlug(title),
    excerpt,
    content: `## ${title}\n\n${item.description || ''}\n\n${item.content ? item.content.replace(/\[\+\d+ chars\]/, '') : ''}\n\n---\n\n*Source: ${sourceName} | Read the full article at [${sourceName}](${item.url})*\n\n---\n\n*Stay updated with the latest sports news. Watch live matches in 4K on IPTV Pro.*`,
    coverImage: imageUrl,
    source: sourceName,
    publishedAt,
    tags: tags.slice(0, 5),
    readTime,
  };
}

// Get a list of trending topics by extracting most common terms
export { getApiKey };
