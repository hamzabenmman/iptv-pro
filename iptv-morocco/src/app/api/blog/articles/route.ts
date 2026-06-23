import { NextResponse } from 'next/server';
import { updateArticleStatus, getPendingArticles, getPublishedArticles, getStoredArticles, seedFallbackArticles } from '@/lib/blog-engine';

export const dynamic = 'force-dynamic';

function isAdmin(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return true; // No password set = open access
  return authHeader === `Bearer ${adminPassword}`;
}

// GET /api/blog/articles - List articles
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  seedFallbackArticles();

  if (status === 'pending') {
    return NextResponse.json({ articles: getPendingArticles() });
  }
  if (status === 'published') {
    return NextResponse.json({ articles: getPublishedArticles() });
  }

  return NextResponse.json({ articles: getStoredArticles() });
}

// PATCH /api/blog/articles - Update article status (approve/reject)
export async function PATCH(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Article ID and status are required' }, { status: 400 });
    }

    const success = updateArticleStatus(id, status);
    if (!success) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: status === 'published'
        ? 'Article published successfully!'
        : status === 'rejected'
        ? 'Article rejected.'
        : 'Article updated.',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}
