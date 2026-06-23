import { NextResponse } from 'next/server';
import { createArticleFromNews } from '@/lib/blog-engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  // Verify authorization (cron secret or admin password)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const isAuthorized = !cronSecret || authHeader === `Bearer ${cronSecret}` || authHeader === `Bearer ${adminPassword}`;

  if (cronSecret && !isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;

  try {
    const article = await createArticleFromNews(category);

    if (!article) {
      return NextResponse.json({ error: 'Failed to generate article' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      article,
      message: 'Article generated from real news and saved as draft. Pending admin review.',
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
