// Database utility for blog - uses Neon serverless Postgres directly
// Falls back gracefully when no DATABASE_URL is set (mock mode for demo)

import type { Article, Category, Backlink, ArticleStatus, BacklinkStatus } from './blog-types';
import { DEFAULT_CATEGORIES } from './blog-types';

const isDbAvailable = !!process.env.DATABASE_URL;

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// ===== NEON POSTGRES CLIENT =====
let sql: any = null;

async function getDb() {
  if (!isDbAvailable) return null;
  if (sql) return sql;
  try {
    const { neon } = await import('@neondatabase/serverless');
    sql = neon(process.env.DATABASE_URL!);
    return sql;
  } catch (e) {
    console.warn('Failed to initialize Neon database:', e);
    return null;
  }
}

// Initialize tables
export async function initDatabase() {
  const db = await getDb();
  if (!db) return;

  try {
    await db`CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      description TEXT, icon TEXT, parent_id TEXT, "order" INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
    )`;
    await db`CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      excerpt TEXT, content TEXT NOT NULL, cover_image TEXT,
      images TEXT[] DEFAULT '{}', videos TEXT[] DEFAULT '{}', slideshow TEXT[] DEFAULT '{}',
      author TEXT DEFAULT 'IPTV Pro News', status TEXT DEFAULT 'draft',
      category_id TEXT REFERENCES categories(id), tags TEXT[] DEFAULT '{}',
      seo_title TEXT, seo_description TEXT, seo_keywords TEXT,
      read_time INTEGER DEFAULT 5, featured BOOLEAN DEFAULT false,
      published_at TIMESTAMP, scheduled_for TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
    )`;
    await db`CREATE TABLE IF NOT EXISTS backlinks (
      id TEXT PRIMARY KEY, url TEXT NOT NULL, domain TEXT NOT NULL,
      anchor_text TEXT, description TEXT, email TEXT,
      status TEXT DEFAULT 'pending', is_dofollow BOOLEAN DEFAULT true,
      page_score INTEGER, notes TEXT, submitted_at TIMESTAMP DEFAULT NOW(),
      reviewed_at TIMESTAMP, reviewed_by TEXT,
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
    )`;
    await db`CREATE TABLE IF NOT EXISTS generation_logs (
      id TEXT PRIMARY KEY, article_id TEXT, status TEXT NOT NULL,
      source TEXT, error TEXT, generated_at TIMESTAMP DEFAULT NOW()
    )`;
  } catch (e) {
    console.error('Failed to init database tables:', e);
  }
}

// ===== ARTICLES =====
export async function getArticles(options: {
  status?: ArticleStatus; categoryId?: string; featured?: boolean;
  limit?: number; offset?: number; search?: string;
} = {}): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    let query = db`SELECT * FROM articles WHERE 1=1`;
    if (options.status) query = db`${query} AND status = ${options.status}`;
    if (options.categoryId) query = db`${query} AND category_id = ${options.categoryId}`;
    if (options.featured) query = db`${query} AND featured = true`;
    if (options.search) query = db`${query} AND (title ILIKE ${'%' + options.search + '%'} OR excerpt ILIKE ${'%' + options.search + '%'})`;
    query = db`${query} ORDER BY created_at DESC`;
    if (options.limit) query = db`${query} LIMIT ${options.limit}`;
    if (options.offset) query = db`${query} OFFSET ${options.offset}`;
    const results = await query;
    return results.map(mapArticle);
  } catch (e) { console.error('getArticles error:', e); return []; }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const results = await db`SELECT * FROM articles WHERE slug = ${slug} LIMIT 1`;
    return results[0] ? mapArticle(results[0]) : null;
  } catch (e) { console.error('getArticleBySlug error:', e); return null; }
}

export async function createArticle(data: Partial<Article>): Promise<Article | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const id = data.id || generateId();
    const slug = data.slug || id;
    await db`
      INSERT INTO articles (id, title, slug, excerpt, content, cover_image, images, videos, slideshow, author, status, category_id, tags, seo_title, seo_description, seo_keywords, read_time, featured, published_at, scheduled_for)
      VALUES (${id}, ${data.title || ''}, ${slug}, ${data.excerpt || ''}, ${data.content || ''}, ${data.coverImage || ''}, ${data.images || []}, ${data.videos || []}, ${data.slideshow || []}, ${data.author || 'IPTV Pro News'}, ${data.status || 'draft'}, ${data.categoryId || null}, ${data.tags || []}, ${data.seoTitle || ''}, ${data.seoDescription || ''}, ${data.seoKeywords || ''}, ${data.readTime || 5}, ${data.featured || false}, ${data.publishedAt || null}, ${data.scheduledFor || null})
    `;
    return getArticleBySlug(slug);
  } catch (e) { console.error('createArticle error:', e); return null; }
}

export async function updateArticleStatus(id: string, status: ArticleStatus): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    if (status === 'published') {
      await db`UPDATE articles SET status = ${status}, published_at = NOW(), updated_at = NOW() WHERE id = ${id}`;
    } else {
      await db`UPDATE articles SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
    }
  } catch (e) { console.error('updateArticleStatus error:', e); }
}

export async function getPendingArticles(): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    const results = await db`SELECT * FROM articles WHERE status = 'pending_review' OR status = 'draft' ORDER BY created_at DESC`;
    return results.map(mapArticle);
  } catch (e) { console.error('getPendingArticles error:', e); return []; }
}

function mapArticle(row: any): Article {
  return {
    id: row.id, title: row.title, slug: row.slug,
    excerpt: row.excerpt || '', content: row.content,
    coverImage: row.cover_image || '', images: row.images || [], videos: row.videos || [],
    slideshow: row.slideshow || [], author: row.author || 'IPTV Pro News',
    status: row.status || 'draft', categoryId: row.category_id,
    category: null, tags: row.tags || [],
    seoTitle: row.seo_title || '', seoDescription: row.seo_description || '',
    seoKeywords: row.seo_keywords || '', readTime: row.read_time || 5,
    featured: row.featured || false,
    publishedAt: row.published_at ? row.published_at.toISOString() : null,
    scheduledFor: row.scheduled_for ? row.scheduled_for.toISOString() : null,
    createdAt: row.created_at ? row.created_at.toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? row.updated_at.toISOString() : new Date().toISOString(),
  };
}

// ===== CATEGORIES =====
export async function getCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) return DEFAULT_CATEGORIES;
  try {
    const results = await db`SELECT * FROM categories ORDER BY "order" ASC`;
    if (results.length === 0) return DEFAULT_CATEGORIES;
    const categoryMap = new Map<string, any>();
    results.forEach((c: any) => categoryMap.set(c.id, {
      id: c.id, name: c.name, slug: c.slug, description: c.description || '',
      icon: c.icon || '', parentId: c.parent_id, children: [], order: c.order || 0,
    }));
    const roots: Category[] = [];
    results.forEach((c: any) => {
      const cat = categoryMap.get(c.id);
      if (c.parent_id && categoryMap.has(c.parent_id)) {
        categoryMap.get(c.parent_id).children.push(cat);
      } else roots.push(cat);
    });
    return roots;
  } catch (e) { console.error('getCategories error:', e); return DEFAULT_CATEGORIES; }
}

// ===== BACKLINKS =====
export async function submitBacklink(data: { url: string; domain: string; anchorText?: string; description?: string; email?: string }): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db`
      INSERT INTO backlinks (id, url, domain, anchor_text, description, email, status)
      VALUES (${generateId()}, ${data.url}, ${data.domain}, ${data.anchorText || ''}, ${data.description || ''}, ${data.email || ''}, 'pending')
    `;
  } catch (e) { console.error('submitBacklink error:', e); }
}

export async function getPendingBacklinks(): Promise<Backlink[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    const results = await db`SELECT * FROM backlinks WHERE status = 'pending' ORDER BY submitted_at DESC`;
    return results.map(mapBacklink);
  } catch (e) { console.error('getPendingBacklinks error:', e); return []; }
}

export async function updateBacklinkStatus(id: string, status: BacklinkStatus): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db`UPDATE backlinks SET status = ${status}, reviewed_at = NOW(), updated_at = NOW() WHERE id = ${id}`;
  } catch (e) { console.error('updateBacklinkStatus error:', e); }
}

function mapBacklink(row: any): Backlink {
  return {
    id: row.id, url: row.url, domain: row.domain,
    anchorText: row.anchor_text || '', description: row.description || '',
    email: row.email || '', status: row.status || 'pending',
    isDofollow: row.is_dofollow !== false, pageScore: row.page_score || 0,
    notes: row.notes || '', submittedAt: row.submitted_at ? row.submitted_at.toISOString() : new Date().toISOString(),
  };
}

// ===== GENERATION LOG =====
export async function logGeneration(articleId: string | null, status: string, source?: string, error?: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db`
      INSERT INTO generation_logs (id, article_id, status, source, error)
      VALUES (${generateId()}, ${articleId}, ${status}, ${source || ''}, ${error || ''})
    `;
  } catch (e) { console.error('logGeneration error:', e); }
}
