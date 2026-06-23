'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Search, ArrowRight, Clock, Calendar, ChevronLeft, ChevronRight, TrendingUp, Sparkles, Newspaper, Filter } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Article, Category } from '@/lib/blog-types';
import { DEFAULT_CATEGORIES } from '@/lib/blog-types';

// Sample articles for initial display
const SAMPLE_ARTICLES: Article[] = [
  {
    id: '1', title: 'World Cup 2026: Morocco Shocks France in Semi-Final Thriller',
    slug: 'morocco-france-semi-final-2026',
    excerpt: 'In an astonishing display of skill and determination, Morocco defeated France 2-1 in the World Cup 2026 semi-final, becoming the first African nation to reach the final.',
    content: 'Full article content here...',
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&h=630&fit=crop',
    images: [], videos: [], slideshow: [],
    author: 'IPTV Pro News', status: 'published', categoryId: 'world-cup',
    category: { id: 'world-cup', name: 'World Cup 2026', slug: 'world-cup-2026', description: '', icon: '🏆', parentId: null, children: [], order: 0, articleCount: 0 },
    tags: ['World Cup', 'Morocco', 'France', 'Semi-Final'],
    seoTitle: '', seoDescription: '', seoKeywords: '',
    readTime: 8, featured: true,
    publishedAt: '2026-06-22T20:30:00Z', scheduledFor: null,
    createdAt: '2026-06-22T18:00:00Z', updatedAt: '2026-06-22T18:00:00Z',
  },
  {
    id: '2', title: 'Champions League 2026 Final: Everything You Need to Know',
    slug: 'champions-league-final-2026-guide',
    excerpt: 'All the details about the upcoming Champions League final, including how to watch in 4K UHD via IPTV Pro.',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200&h=630&fit=crop',
    images: [], videos: [], slideshow: [],
    author: 'IPTV Pro News', status: 'published', categoryId: 'champions-league',
    category: { id: 'champions-league', name: 'Champions League', slug: 'champions-league', description: '', icon: '⭐', parentId: 'football', children: [], order: 0, articleCount: 0 },
    tags: ['Champions League', 'Final', 'Football'],
    seoTitle: '', seoDescription: '', seoKeywords: '',
    readTime: 5, featured: true,
    publishedAt: '2026-06-21T14:00:00Z', scheduledFor: null,
    createdAt: '2026-06-21T12:00:00Z', updatedAt: '2026-06-21T12:00:00Z',
  },
  {
    id: '3', title: 'Best IPTV Settings for 4K Streaming: Complete Guide 2026',
    slug: 'best-iptv-settings-4k-streaming-2026',
    excerpt: 'Optimize your IPTV experience with these expert-recommended settings for crystal-clear 4K streaming on any device.',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&h=630&fit=crop',
    images: [], videos: [], slideshow: [],
    author: 'IPTV Pro', status: 'published', categoryId: 'setup-guides',
    category: { id: 'setup-guides', name: 'Setup Guides', slug: 'setup-guides', description: '', icon: '🔧', parentId: 'iptv', children: [], order: 0, articleCount: 0 },
    tags: ['IPTV', '4K', 'Streaming', 'Setup'],
    seoTitle: '', seoDescription: '', seoKeywords: '',
    readTime: 10, featured: false,
    publishedAt: '2026-06-20T10:00:00Z', scheduledFor: null,
    createdAt: '2026-06-20T08:00:00Z', updatedAt: '2026-06-20T08:00:00Z',
  },
  {
    id: '4', title: 'Premier League 2026-27: Top Transfers and Predictions',
    slug: 'premier-league-2026-27-transfers-predictions',
    excerpt: 'As the new Premier League season approaches, we break down the biggest transfers and predict the top 4 finish.',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=630&fit=crop',
    images: [], videos: [], slideshow: [],
    author: 'IPTV Pro News', status: 'published', categoryId: 'premier-league',
    category: { id: 'premier-league', name: 'Premier League', slug: 'premier-league', description: '', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', parentId: 'football', children: [], order: 1, articleCount: 0 },
    tags: ['Premier League', 'Transfers', 'Football'],
    seoTitle: '', seoDescription: '', seoKeywords: '',
    readTime: 6, featured: false,
    publishedAt: '2026-06-19T16:00:00Z', scheduledFor: null,
    createdAt: '2026-06-19T14:00:00Z', updatedAt: '2026-06-19T14:00:00Z',
  },
  {
    id: '5', title: 'How to Watch La Liga on IPTV: Complete Guide',
    slug: 'watch-la-liga-iptv-complete-guide',
    excerpt: 'Never miss a La Liga match again. Learn how to set up IPTV for seamless Spanish football streaming.',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1529906920574-628dc1e49f5a?w=1200&h=630&fit=crop',
    images: [], videos: [], slideshow: [],
    author: 'IPTV Pro', status: 'published', categoryId: 'la-liga',
    category: { id: 'la-liga', name: 'La Liga', slug: 'la-liga', description: '', icon: '🇪🇸', parentId: 'football', children: [], order: 2, articleCount: 0 },
    tags: ['La Liga', 'IPTV', 'Spanish Football'],
    seoTitle: '', seoDescription: '', seoKeywords: '',
    readTime: 7, featured: false,
    publishedAt: '2026-06-18T12:00:00Z', scheduledFor: null,
    createdAt: '2026-06-18T10:00:00Z', updatedAt: '2026-06-18T10:00:00Z',
  },
  {
    id: '6', title: 'Ramadan 2026: Best Arabic Series and Shows to Watch',
    slug: 'ramadan-2026-best-arabic-series',
    excerpt: 'Your complete guide to the best Ramadan 2026 series and shows available on IPTV Pro.',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1579032363873-5e1e8e8c3c1a?w=1200&h=630&fit=crop',
    images: [], videos: [], slideshow: [],
    author: 'IPTV Pro', status: 'published', categoryId: 'ramadan',
    category: { id: 'ramadan', name: 'Ramadan', slug: 'ramadan', description: '', icon: '🌙', parentId: 'entertainment', children: [], order: 1, articleCount: 0 },
    tags: ['Ramadan', 'Series', 'Arabic', 'Entertainment'],
    seoTitle: '', seoDescription: '', seoKeywords: '',
    readTime: 4, featured: false,
    publishedAt: '2026-06-17T09:00:00Z', scheduledFor: null,
    createdAt: '2026-06-17T07:00:00Z', updatedAt: '2026-06-17T07:00:00Z',
  },
];

const SAMPLE_CATEGORIES = DEFAULT_CATEGORIES;

function formatDate(dateStr: string, locale: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function BlogPage() {
  const t = useTranslations('blog');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [articles] = useState<Article[]>(SAMPLE_ARTICLES);
  const [categories] = useState<Category[]>(SAMPLE_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;

  const filteredArticles = articles.filter(a => {
    if (activeCategory && a.categoryId !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const featuredArticles = filteredArticles.filter(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);
  const totalPages = Math.ceil(regularArticles.length / articlesPerPage);
  const paginatedArticles = regularArticles.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage);

  // Flatten categories for the filter bar
  const flatCategories = categories.reduce((acc: Category[], cat) => {
    acc.push(cat);
    cat.children.forEach(child => acc.push(child));
    return acc;
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-28 pb-16 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/5 rounded-full blur-[120px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Newspaper className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm font-medium tracking-wider uppercase">{t('news_blog') || 'News & Blog'}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {t('title') || 'Sports & IPTV News'}
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              {t('subtitle') || 'Stay updated with the latest sports news, IPTV tips, and entertainment coverage'}
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="sticky top-0 z-40 py-4 bg-dark-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500`} />
              <input
                type="text"
                placeholder={t('search') || 'Search articles...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-slate-800/50 border border-white/10 rounded-xl py-2.5 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all`}
              />
            </div>
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
              <button
                onClick={() => setActiveCategory(null)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${!activeCategory ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50 border border-white/5'}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t('all') || 'All'}
              </button>
              {flatCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${activeCategory === cat.id ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50 border border-white/5'}`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && !activeCategory && !searchQuery && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-white">{t('featured') || 'Featured Stories'}</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredArticles.slice(0, 2).map((article, idx) => (
                <Link key={article.id} href={`/${locale}/blog/${article.slug}`}
                  className={`group relative overflow-hidden rounded-2xl bg-slate-900 border border-white/5 hover:border-green-500/30 transition-all duration-500 ${idx === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
                >
                  <div className={`relative ${idx === 0 ? 'h-[400px] md:h-[500px]' : 'h-[250px]'}`}>
                    <img src={article.coverImage} alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30 backdrop-blur-sm">
                        {article.category?.icon} {article.category?.name}
                      </span>
                    </div>
                  </div>
                  <div className={`p-6 ${idx === 0 ? 'absolute bottom-0 left-0 right-0' : ''}`}>
                    <h3 className={`font-bold text-white group-hover:text-green-400 transition-colors duration-300 ${idx === 0 ? 'text-2xl md:text-3xl mb-3' : 'text-lg mb-2'}`}>
                      {article.title}
                    </h3>
                    <p className={`text-gray-400 ${idx === 0 ? 'text-base mb-4 line-clamp-2' : 'text-sm mb-3 line-clamp-2'}`}>
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(article.publishedAt!, locale)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readTime} min read
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles Grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Newspaper className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-bold text-white">
              {activeCategory
                ? flatCategories.find(c => c.id === activeCategory)?.name || t('articles')
                : t('latest_articles') || 'Latest Articles'}
            </h2>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-400 text-lg">{t('no_results') || 'No articles found'}</p>
              <p className="text-gray-600 text-sm mt-2">{t('try_different') || 'Try a different search or category'}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(featuredArticles.length > 0 && !activeCategory && !searchQuery ? paginatedArticles : filteredArticles).map((article) => (
                  <Link key={article.id} href={`/${locale}/blog/${article.slug}`}
                    className="group bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-green-500/30 hover:bg-slate-900/80 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/5">
                    <div className="relative h-48 overflow-hidden">
                      <img src={article.coverImage} alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-black/50 text-green-400 text-[10px] font-medium border border-green-500/20 backdrop-blur-sm">
                          {article.category?.icon} {article.category?.name}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-white group-hover:text-green-400 transition-colors duration-300 text-base mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(article.publishedAt!, locale).split(' ').slice(0, 2).join(' ')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime}m
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('prev') || 'Previous'}</span>
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === currentPage ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50 border border-white/5'}`}>
                        {page}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm">
                    <span className="hidden sm:inline">{t('next') || 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Backlinks CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-green-500/5 via-slate-800/30 to-green-500/5 rounded-3xl border border-green-500/10 p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {t('subscribe_title') || 'Want to Write for Us?'}
            </h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              {t('subscribe_desc') || 'Submit your guest post or get a backlink from our growing sports and IPTV blog.'}
            </p>
            <Link href={`/${locale}/backlinks`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-medium text-sm transition-all hover:scale-105 shadow-lg shadow-green-500/20">
              <Sparkles className="w-4 h-4" />
              {t('submit_backlink') || 'Submit Backlink'}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
