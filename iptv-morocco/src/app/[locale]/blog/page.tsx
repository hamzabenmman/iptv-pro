'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import {
  Search, ArrowRight, Clock, Calendar, ChevronLeft, ChevronRight,
  TrendingUp, Sparkles, Newspaper, Globe, RefreshCw,
  Trophy, Eye, Star, Filter
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RevealAnimation from '@/components/RevealAnimation';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import TrendingTopics from '@/components/TrendingTopics';
import type { Article } from '@/lib/blog-types';
import { CATEGORY_ICONS, CATEGORY_NAMES } from '@/lib/blog-types';

function formatDate(dateStr: string, locale: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(
    locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' :
    locale === 'es' ? 'es-ES' : locale === 'it' ? 'it-IT' : locale === 'nl' ? 'nl-NL' :
    locale === 'pt' ? 'pt-PT' : locale === 'ru' ? 'ru-RU' : locale === 'tr' ? 'tr-TR' :
    locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
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

// Shimmer skeleton component
function SkeletonCard() {
  return (
    <div className="bg-dark-800/50 border border-brand-500/5 rounded-2xl overflow-hidden shimmer-premium">
      <div className="h-48 bg-dark-700/50" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-dark-700/30 rounded w-3/4" />
        <div className="h-3 bg-dark-700/20 rounded w-full" />
        <div className="h-3 bg-dark-700/20 rounded w-2/3" />
      </div>
    </div>
  );
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
  const [activeTrendingTopic, setActiveTrendingTopic] = useState<string | null>(null);
  const [trending, setTrending] = useState<string[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [breakingNews, setBreakingNews] = useState<{ title: string; slug: string; category: string }[]>([]);
  const articlesPerPage = 9;

  const fetchArticles = useCallback(async () => {
    try {
      setError(false);
      const response = await fetch('/api/blog/fetch-news');
      const data = await response.json();
      if (data.articles && data.articles.length > 0) {
        setArticles(data.articles);
        setAllArticles(data.articles);

        // Set breaking news (top 8 articles for ticker)
        const breaking = data.articles.slice(0, 8).map((a: Article) => ({
          title: a.title,
          slug: a.slug,
          category: a.categoryId,
        }));
        setBreakingNews(breaking);

        // Set trending topics from API or extract from articles
        if (data.trending && data.trending.length > 0) {
          setTrending(data.trending);
        } else {
          // Extract trending from article tags
          const tagCount = new Map<string, number>();
          data.articles.forEach((a: Article) => {
            a.tags?.forEach((t: string) => {
              tagCount.set(t, (tagCount.get(t) || 0) + 1);
            });
          });
          const sorted = [...tagCount.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag]) => tag);
          setTrending(sorted.length > 0 ? sorted : ['World Cup 2026', 'Champions League', 'Premier League', 'La Liga', 'Football']);
        }
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setTrendingLoading(false);
    }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setActiveCategory(null);
    setActiveTrendingTopic(null);
    setSearchQuery('');
    await fetchArticles();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleTrendingClick = (topic: string) => {
    if (activeTrendingTopic?.toLowerCase() === topic.toLowerCase()) {
      setActiveTrendingTopic(null);
    } else {
      setActiveTrendingTopic(topic);
      setActiveCategory(null);
      setSearchQuery('');
    }
    setCurrentPage(1);
  };

  const filteredArticles = allArticles.filter(a => {
    if (a.status !== 'published') return false;
    if (activeCategory && a.categoryId !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.tags?.some(t => t.toLowerCase().includes(q));
    }
    // Filter by trending topic if selected
    if (activeTrendingTopic) {
      const q = activeTrendingTopic.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.tags?.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  // Deduplicate by slug to avoid showing same news twice
  const uniqueArticles = filteredArticles.filter((a, i, arr) => arr.findIndex(x => x.slug === a.slug) === i);
  const featuredArticles = uniqueArticles.filter(a => a.featured);
  const regularArticles = uniqueArticles.filter(a => !a.featured);
  const totalPages = Math.ceil(regularArticles.length / articlesPerPage);
  const paginatedArticles = regularArticles.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage);

  const categories = Object.keys(CATEGORY_ICONS);

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      {/* ===== BREAKING NEWS TICKER ===== */}
      <div className="pt-20">
        <BreakingNewsTicker items={breakingNews} />
      </div>

      <section className="relative pt-12 pb-20 md:pb-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-brand-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <RevealAnimation direction="up">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 inline-flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-brand-400" />
                  <span className="text-brand-400 text-xs font-semibold tracking-widest uppercase">
                    {t('news_blog') || 'News & Blog'}
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {t('title') || 'Sports & IPTV News'}
              </h1>

              <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
                {t('subtitle') || 'Real news from NewsAPI + Google News • AI Enhanced • Curated for you'}
              </p>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                {[
                  { icon: Globe, label: t('real_news') || 'Real News', color: 'text-brand-400', border: 'border-brand-500/20', bg: 'bg-brand-500/10' },
                  { icon: TrendingUp, label: t('curated') || 'Live Updates', color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/10' },
                  { icon: Sparkles, label: t('ai_enhanced') || 'AI Enhanced', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10' },
                ].map((badge, i) => (
                  <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full ${badge.bg} ${badge.border} border`}>
                    <badge.icon className={`w-4 h-4 ${badge.color}`} />
                    <span className={`${badge.color} text-xs font-semibold`}>{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealAnimation>
        </div>
      </section>

      {/* ===== TRENDING TOPICS BAR ===== */}
      <div className="container mx-auto px-4 mb-4">
        <RevealAnimation direction="up" delay={0}>
          <TrendingTopics
            topics={trending}
            onTopicClick={handleTrendingClick}
            activeTopic={activeTrendingTopic}
            loading={trendingLoading}
          />
        </RevealAnimation>
      </div>

      {/* ===== SEARCH & FILTER BAR ===== */}
      <div className="sticky top-0 z-40 py-4 bg-dark-950/80 backdrop-blur-xl border-b border-brand-500/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500`} />
              <input
                type="text"
                placeholder={t('search') || 'Search articles...'}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className={`w-full bg-dark-800/50 border border-white/5 rounded-xl py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all`}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-dark-800/50 border border-white/5 text-gray-400 hover:text-brand-400 hover:border-brand-500/20 transition-all text-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                {t('refresh') || 'Refresh'}
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <RevealAnimation direction="up" delay={1}>
            <div className="flex gap-2 overflow-x-auto pb-2 mt-4 scrollbar-hide">
              <button
                onClick={() => { setActiveCategory(null); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                  !activeCategory
                    ? 'bg-brand-500 text-dark-950 shadow-lg shadow-brand-500/25'
                    : 'bg-dark-800/50 text-gray-400 hover:text-white hover:bg-dark-700/50 border border-white/5'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                {t('all') || 'All'}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(activeCategory === cat ? null : cat); setCurrentPage(1); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-brand-500 text-dark-950 shadow-lg shadow-brand-500/25'
                      : 'bg-dark-800/50 text-gray-400 hover:text-white hover:bg-dark-700/50 border border-white/5'
                  }`}
                >
                  <span>{CATEGORY_ICONS[cat] || '📰'}</span>
                  <span>{CATEGORY_NAMES[cat] || cat}</span>
                </button>
              ))}
            </div>
          </RevealAnimation>
        </div>
      </div>

      {/* ===== LOADING STATE ===== */}
      {loading && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ===== ERROR STATE ===== */}
      {!loading && error && uniqueArticles.length === 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <RevealAnimation direction="scale">
              <div className="w-24 h-24 rounded-2xl bg-brand-500/5 flex items-center justify-center mx-auto mb-6 border border-brand-500/10">
                <Globe className="w-12 h-12 text-brand-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">{t('unavailable') || 'News Feed Unavailable'}</h2>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                {t('unavailable_desc') || 'Unable to fetch live news right now. Our team is working on it. Check back soon!'}
              </p>
              <button onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-500 to-yellow-600 text-dark-950 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-brand-500/25">
                <RefreshCw className="w-4 h-4" />
                {t('try_again') || 'Try Again'}
              </button>
            </RevealAnimation>
          </div>
        </section>
      )}

      {/* ===== NO RESULTS ===== */}
      {!loading && !error && uniqueArticles.length === 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <RevealAnimation direction="scale">
              <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400 text-lg">{t('no_results') || 'No articles found'}</p>
              <p className="text-gray-600 text-sm mt-2">{t('try_different') || 'Try a different search or category'}</p>
            </RevealAnimation>
          </div>
        </section>
      )}

      {/* ===== FEATURED ARTICLES ===== */}
      {!loading && featuredArticles.length > 0 && !activeCategory && !searchQuery && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <RevealAnimation direction="up">
              <div className="flex items-center gap-3 mb-8">
                <Trophy className="w-5 h-5 text-brand-400" />
                <h2 className="text-xl font-bold text-white">{t('featured') || 'Featured Stories'}</h2>
                <div className="flex-1 trophy-line max-w-[200px]" />
              </div>
            </RevealAnimation>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredArticles.slice(0, 2).map((article, idx) => (
                <RevealAnimation key={article.id} direction={idx === 0 ? 'up' : 'up'} delay={idx === 0 ? 1 : 2}>
                  <Link href={`/${locale}/blog/${article.slug}`}
                    className={`group relative overflow-hidden rounded-2xl bg-dark-800/50 border border-brand-500/5 hover:border-brand-500/30 transition-all duration-500 card-hover ${idx === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
                  >
                    <div className={`relative ${idx === 0 ? 'h-[400px] md:h-[520px]' : 'h-[280px]'} overflow-hidden`}>
                      <img
                        src={article.coverImage || 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop'}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-dark-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Category badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1.5 rounded-full bg-dark-950/60 text-brand-400 text-xs font-semibold border border-brand-500/20 backdrop-blur-sm">
                          {CATEGORY_ICONS[article.categoryId] || '📰'} {CATEGORY_NAMES[article.categoryId] || 'News'}
                        </span>
                      </div>

                      {/* Gradient overlay for text */}
                      <div className={`absolute bottom-0 left-0 right-0 p-6 md:p-8 ${idx === 0 ? 'pb-8' : 'pb-6'}`}>
                        <h3 className={`font-bold text-white group-hover:text-brand-400 transition-colors duration-300 ${
                          idx === 0 ? 'text-2xl md:text-4xl mb-4' : 'text-xl mb-2'
                        } leading-tight`}>
                          {article.title}
                        </h3>
                        {idx === 0 && (
                          <p className="text-gray-300 text-base mb-4 line-clamp-2 max-w-2xl">{article.excerpt}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {article.publishedAt ? formatDate(article.publishedAt, locale) : 'Recent'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {article.readTime} {t('min_read') || 'min read'}
                          </span>
                          {article.views !== undefined && (
                            <span className="flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              {article.views}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </RevealAnimation>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== ARTICLES GRID ===== */}
      {!loading && uniqueArticles.length > 0 && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <RevealAnimation direction="up">
              <div className="flex items-center gap-3 mb-8">
                <Newspaper className="w-5 h-5 text-brand-400" />
                <h2 className="text-xl font-bold text-white">
                  {activeCategory
                    ? `${CATEGORY_ICONS[activeCategory] || ''} ${CATEGORY_NAMES[activeCategory] || t('articles')}`
                    : t('latest_articles') || 'Latest Articles'}
                </h2>
                <div className="flex-1 trophy-line max-w-[200px]" />
                <span className="text-gray-600 text-sm font-medium">({uniqueArticles.length})</span>
              </div>
            </RevealAnimation>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredArticles.length > 0 && !activeCategory && !searchQuery ? paginatedArticles : uniqueArticles).map((article, i) => (
                <RevealAnimation key={article.id} direction="up" delay={(i % 3) as 0|1|2|3|4|5}>
                  <Link href={`/${locale}/blog/${article.slug}`}
                    className="group bg-dark-800/30 border border-brand-500/5 rounded-2xl overflow-hidden hover:border-brand-500/20 hover:bg-dark-800/60 transition-all duration-500 glow-warm card-hover"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.coverImage || 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=800&h=450&fit=crop'}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=800&h=450&fit=crop'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-800 via-transparent to-transparent opacity-60" />

                      {/* Category tag */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-2.5 py-1 rounded-full bg-dark-950/60 text-brand-400 text-[10px] font-semibold border border-brand-500/20 backdrop-blur-sm">
                          {CATEGORY_ICONS[article.categoryId] || '📰'} {CATEGORY_NAMES[article.categoryId] || 'News'}
                        </span>
                      </div>

                      {/* Reading time badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full bg-dark-950/60 text-gray-300 text-[10px] font-medium border border-white/10 backdrop-blur-sm flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}m
                        </span>
                      </div>

                      {/* Source badge */}
                      {article.source && article.source !== 'IPTV Pro News' && (
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2 py-0.5 rounded-full bg-dark-950/50 text-[9px] text-brand-400/80 border border-brand-500/10 backdrop-blur-sm font-medium">
                            {article.source}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-white group-hover:text-brand-400 transition-colors duration-300 text-base mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {article.publishedAt ? formatDate(article.publishedAt, locale).split(' ').slice(0, 2).join(' ') : timeAgo(article.createdAt)}
                          </span>
                          {article.views !== undefined && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.views}
                            </span>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-brand-400 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300" />
                      </div>

                      {/* Hover shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                    </div>
                  </Link>
                </RevealAnimation>
              ))}
            </div>

            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
              <RevealAnimation direction="up" delay={3}>
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-800/50 border border-white/5 text-gray-400 hover:text-brand-400 hover:border-brand-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('prev') || 'Previous'}</span>
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                          page === currentPage
                            ? 'bg-brand-500 text-dark-950 shadow-lg shadow-brand-500/25 scale-110'
                            : 'bg-dark-800/50 text-gray-400 hover:text-white hover:bg-dark-700/50 border border-white/5'
                        }`}>
                        {page}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-800/50 border border-white/5 text-gray-400 hover:text-brand-400 hover:border-brand-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm">
                    <span className="hidden sm:inline">{t('next') || 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </RevealAnimation>
            )}
          </div>
        </section>
      )}

      {/* ===== BACKLINKS CTA ===== */}
      {!loading && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <RevealAnimation direction="up">
              <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-brand-500/5 via-dark-800/30 to-brand-500/5 rounded-3xl border border-brand-500/10 p-8 md:p-12 glow-warm">
                <Sparkles className="w-10 h-10 text-brand-400 mx-auto mb-4" />
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {t('subscribe_title') || 'Want to Write for Us?'}
                </h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                  {t('subscribe_desc') || 'Submit your guest post or get a backlink from our growing sports and IPTV blog.'}
                </p>
                <Link href={`/${locale}/backlinks`}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-500 to-yellow-600 hover:from-brand-400 hover:to-yellow-500 text-dark-950 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-brand-500/25">
                  <Star className="w-4 h-4" />
                  {t('submit_backlink') || 'Submit Backlink'}
                </Link>
              </div>
            </RevealAnimation>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
