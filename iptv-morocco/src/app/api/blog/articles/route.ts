import { NextResponse } from 'next/server';

const CRON_SECRET = process.env.CRON_SECRET;

function isAuthorized(request: Request) {
  const auth = request.headers.get('authorization');
  return !CRON_SECRET || auth === `Bearer ${CRON_SECRET}`;
}

// GET /api/blog/articles?status=published&category=world-cup&limit=10&offset=0
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const categoryId = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // In production: query database
    // const articles = await getPublishedArticles({ categoryId, limit, offset });

    return NextResponse.json({ articles: [], total: 0 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

// POST /api/blog/articles - Create new article (from AI generation or manual)
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    // In production: save to database
    // const article = await createArticle(body);
    return NextResponse.json({ success: true, article: body });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}

// PATCH /api/blog/articles - Update article status
export async function PATCH(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, ...updates } = await request.json();
    // In production: update article in database
    // await updateArticleStatus(id, status);
    // if (Object.keys(updates).length) await updateArticle(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

// DELETE /api/blog/articles/:id
export async function DELETE(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    // In production: delete from database
    // await deleteArticle(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
