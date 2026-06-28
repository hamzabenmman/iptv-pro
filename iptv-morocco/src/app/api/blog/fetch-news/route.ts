import { NextResponse } from 'next/server';
import { fetchNews, getStoredArticles } from '@/lib/blog-engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;

  try {
    // Use the unified fetchNews function that tries NewsAPI + RapidAPI + Google News + seeded
    const result = await fetchNews(category);

    return NextResponse.json({
      success: true,
      news: result.news,
      articles: result.articles,
      source: result.source,
      trending: result.trending || [],
    });
  } catch (error) {
    // Always fall back to stored articles
    const stored = getStoredArticles();
    return NextResponse.json({
      success: true,
      news: [],
      articles: stored,
      source: 'fallback',
      trending: [],
    });
  }
}
