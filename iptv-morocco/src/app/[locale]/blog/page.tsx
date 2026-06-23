'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Search, ArrowRight, Clock, Calendar, ChevronLeft, ChevronRight, TrendingUp, Sparkles, Newspaper, Globe, RefreshCw, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Article } from '@/lib/blog-types';
import { CATEGORY_ICONS, CATEGORY_NAMES } from '@/lib/blog-types';

function formatDate(dateStr: string, locale: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : locale === 'es' ? 'es-ES' : locale === 'it' ? 'it-IT' : locale === 'nl' ? 'nl-NL' : locale === 'pt' ? 'pt-PT' : locale === 'ru' ? 'ru-RU' : locale === 'tr' ? 'tr-TR' : locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}



export default function BlogPage() {
  const t = useTranslations('blog');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [articles, setArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const articlesPerPage = 9;

  const fetchArticles = useCallback(async () => {
    try {
      setError(false);
      const response = await fetch('/api/blog/fetch-news');
      const data = await response.json();
      if (data.articles && data.articles.length > 0) {
        setArticles(data.articles);
        setAllArticles(data.articles);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchArticles();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Filter articles
  const filteredArticles = allArticles.filter(a => {
    if (a.status !== 'published') return false;
    if (activeCategory && a.categoryId !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.tags?.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const featuredArticles = filteredArticles.filter(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);
  const totalPages = Math.ceil(regularArticles.length / articlesPerPage);
  const paginatedArticles = regularArticles.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage);

  const categories = Object.keys(CATEGORY_ICONS);

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-28 pb-16 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/5 rounded-full blur-[120px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Newspaper className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm font-medium tracking-wider uppercase">{t('news_blog') || 'News & Blog'}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {t('title') || 'Sports & IPTV News'}
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-6">
              {t('subtitle') || 'Real news from Google News • Enhanced by AI • Curated for you'}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                <Globe className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-xs font-medium">{t('real_news') || 'Real News'}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-xs font-medium">{t('ai_enhanced') || 'AI Enhanced'}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 text-xs font-medium">{t('curated') || 'Curated'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="sticky top-0 z-40 py-4 bg-dark-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500`} />
              <input
                type="text"
                placeholder={t('search') || 'Search articles...'}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className={`w-full bg-slate-800/50 border border-white/10 rounded-xl py-2.5 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all`}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-white transition-all text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                {t('refresh') || 'Refresh'}
              </button>
            </div>
          </div>
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mt-4 scrollbar-hide">
            <button
              onClick={() => { setActiveCategory(null); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${!activeCategory ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50 border border-white/5'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('all') || 'All'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(activeCategory === cat ? null : cat); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${activeCategory === cat ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50 border border-white/5'}`}
              >
                <span>{CATEGORY_ICONS[cat] || '📰'}</span>
                <span>{CATEGORY_NAMES[cat] || cat}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-800/50" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-800/50 rounded w-3/4" />
                    <div className="h-3 bg-slate-800/30 rounded w-full" />
                    <div className="h-3 bg-slate-800/30 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Error State */}
      {!loading && error && allArticles.length === 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
              <Globe className="w-10 h-10 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{t('unavailable') || 'News Feed Unavailable'}</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              {t('unavailable_desc') || 'Unable to fetch live news right now. Our team is working on it. Check back soon!'}
            </p>
            <button onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium text-sm hover:scale-105 transition-all shadow-lg shadow-green-500/20">
              <RefreshCw className="w-4 h-4" />
              {t('try_again') || 'Try Again'}
            </button>
          </div>
        </section>
      )}

      {/* No Results */}
      {!loading && !error && filteredArticles.length === 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-400 text-lg">{t('no_results') || 'No articles found'}</p>
            <p className="text-gray-600 text-sm mt-2">{t('try_different') || 'Try a different search or category'}</p>
          </div>
        </section>
      )}

      {/* Featured Articles */}
      {!loading && featuredArticles.length > 0 && !activeCategory && !searchQuery && (
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
                    <img
                      src={article.coverImage || 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop'}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30 backdrop-blur-sm">
                        {CATEGORY_ICONS[article.categoryId] || '📰'} {CATEGORY_NAMES[article.categoryId] || 'News'}
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
                        {article.publishedAt ? formatDate(article.publishedAt, locale) : 'Recent'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readTime} {t('min_read') || 'min read'}
                      </span>
                      {article.source && (
                        <span className="flex items-center gap-1.5 text-green-400">
                          <ExternalLink className="w-3 h-3" />
                          {article.source}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles Grid */}
      {!loading && filteredArticles.length > 0 && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Newspaper className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-white">
                {activeCategory
                  ? CATEGORY_NAMES[activeCategory] || t('articles')
                  : t('latest_articles') || 'Latest Articles'}
              </h2>
              <span className="text-gray-600 text-sm">({filteredArticles.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredArticles.length > 0 && !activeCategory && !searchQuery ? paginatedArticles : filteredArticles).map((article) => (
                <Link key={article.id} href={`/${locale}/blog/${article.slug}`}
                  className="group bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-green-500/30 hover:bg-slate-900/80 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/5">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.coverImage || 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=800&h=450&fit=crop'}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=800&h=450&fit=crop'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/50 text-green-400 text-[10px] font-medium border border-green-500/20 backdrop-blur-sm">
                        {CATEGORY_ICONS[article.categoryId] || '📰'} {CATEGORY_NAMES[article.categoryId] || 'News'}
                      </span>
                    </div>
                    {article.status === 'pending_review' && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-medium border border-yellow-500/30 backdrop-blur-sm">
                          Draft
                        </span>
                      </div>
                    )}
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
                          {article.publishedAt ? formatDate(article.publishedAt, locale).split(' ').slice(0, 2).join(' ') : timeAgo(article.createdAt)}
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
          </div>
        </section>
      )}

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
