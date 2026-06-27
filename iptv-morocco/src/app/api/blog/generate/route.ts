import { NextResponse } from 'next/server';
import { createArticleFromNews } from '@/lib/blog-engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const CATEGORIES = [
  'world-cup',
  'champions-league',
  'premier-league',
  'la-liga',
  'bein-sports',
  'football',
];

export async function GET(request: Request) {
  // Verify authorization (supporting cron jobs + manual calls)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';

  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get('secret');

  const isAuthorized =
    !cronSecret ||
    isVercelCron ||
    secretParam === cronSecret ||
    authHeader === `Bearer ${cronSecret}` ||
    authHeader === `Bearer ${adminPassword}`;

  if (cronSecret && !isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const category = searchParams.get('category') || undefined;
  const count = Math.min(parseInt(searchParams.get('count') || '1'), 5);

  try {
    const results = [];
    const usedCategories = new Set<string>();

    for (let i = 0; i < count; i++) {
      // Pick a different category each time for variety
      let cat = category;
      if (!cat) {
        const available = CATEGORIES.filter(c => !usedCategories.has(c));
        cat = available.length > 0
          ? available[Math.floor(Math.random() * available.length)]
          : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      }
      usedCategories.add(cat);

      const article = await createArticleFromNews(cat);
      if (article) {
        results.push(article);
      }

      // Small delay between generations to avoid rate limits
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ error: 'Failed to generate any articles' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      articles: results,
      count: results.length,
      message: `${results.length} article(s) generated from real news and saved as draft. Pending admin review.`,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
