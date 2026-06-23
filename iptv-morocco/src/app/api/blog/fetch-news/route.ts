import { NextResponse } from 'next/server';
import { fetchGoogleNews, seedFallbackArticles, getStoredArticles } from '@/lib/blog-engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;

  try {
    // Seed fallback articles if needed
    seedFallbackArticles();

    // Try to fetch real news
    const newsItems = await fetchGoogleNews(category);

    // Also return stored articles
    const storedArticles = getStoredArticles();

    return NextResponse.json({
      success: true,
      news: newsItems.slice(0, 20),
      articles: storedArticles,
      source: newsItems.length > 0 ? 'google-news' : 'fallback',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      news: [],
      articles: getStoredArticles(),
      source: 'fallback',
      error: 'Failed to fetch news',
    });
  }
}
