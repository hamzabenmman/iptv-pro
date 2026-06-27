export type ArticleStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published';
export type BacklinkStatus = 'pending' | 'approved' | 'rejected';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  images: string[];
  videos: string[];
  slideshow: string[];
  author: string;
  status: ArticleStatus;
  categoryId: string;
  category: Category | null;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  readTime: number;
  featured: boolean;
  publishedAt: string | null;
  scheduledFor: string | null;
  views?: number;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  parentId: string | null;
  children: Category[];
  order: number;
  articleCount?: number;
}

export interface Backlink {
  id: string;
  url: string;
  domain: string;
  anchorText: string;
  description: string;
  email: string;
  status: BacklinkStatus;
  isDofollow: boolean;
  pageScore: number;
  notes: string;
  submittedAt: string;
}

// Category display constants
export const CATEGORY_ICONS: Record<string, string> = {
  'world-cup': '🏆',
  'champions-league': '⭐',
  'premier-league': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'la-liga': '🇪🇸',
  'bein-sports': '📺',
  football: '⚽',
  'wc-morocco': '🇲🇦',
  'wc-fixtures': '📅',
};

export const CATEGORY_NAMES: Record<string, string> = {
  'world-cup': 'World Cup 2026',
  'champions-league': 'Champions League',
  'premier-league': 'Premier League',
  'la-liga': 'La Liga',
  'bein-sports': 'beIN Sports',
  football: 'Football',
  'wc-morocco': 'Morocco',
  'wc-fixtures': 'Fixtures & Results',
};

// Default categories structure
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'world-cup',
    name: 'World Cup 2026',
    slug: 'world-cup-2026',
    description: 'Latest news and updates about the FIFA World Cup 2026',
    icon: '🏆',
    parentId: null,
    children: [
      { id: 'wc-morocco', name: 'Morocco', slug: 'morocco', description: 'Morocco national team updates', icon: '🇲🇦', parentId: 'world-cup', children: [], order: 0, articleCount: 0 },
      { id: 'wc-fixtures', name: 'Fixtures & Results', slug: 'fixtures-results', description: 'Match schedules and scores', icon: '📅', parentId: 'world-cup', children: [], order: 1, articleCount: 0 },
    ],
    order: 0,
    articleCount: 0,
  },
  {
    id: 'football',
    name: 'Football',
    slug: 'football',
    description: 'Football news from top leagues worldwide',
    icon: '⚽',
    parentId: null,
    children: [
      { id: 'champions-league', name: 'Champions League', slug: 'champions-league', description: 'UEFA Champions League news', icon: '⭐', parentId: 'football', children: [], order: 0, articleCount: 0 },
      { id: 'premier-league', name: 'Premier League', slug: 'premier-league', description: 'English Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', parentId: 'football', children: [], order: 1, articleCount: 0 },
      { id: 'la-liga', name: 'La Liga', slug: 'la-liga', description: 'Spanish La Liga', icon: '🇪🇸', parentId: 'football', children: [], order: 2, articleCount: 0 },
      { id: 'bein-sports', name: 'beIN Sports', slug: 'bein-sports', description: 'beIN Sports coverage and schedules', icon: '📺', parentId: 'football', children: [], order: 3, articleCount: 0 },
    ],
    order: 1,
    articleCount: 0,
  },
];
