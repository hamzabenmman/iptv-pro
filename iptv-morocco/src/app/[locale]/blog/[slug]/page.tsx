'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowLeft, Clock, Calendar, Share2, Bookmark, ThumbsUp, MessageCircle,
  ChevronLeft, ChevronRight, Play, Image as ImageIcon, ExternalLink, Globe,
  Sparkles, TrendingUp, RefreshCw
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Article } from '@/lib/blog-types';
import { CATEGORY_ICONS, CATEGORY_NAMES } from '@/lib/blog-types';

// Categories imported from '@/lib/blog-types'

function formatDate(dateStr: string, locale: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : locale === 'es' ? 'es-ES' : locale === 'it' ? 'it-IT' : locale === 'nl' ? 'nl-NL' : locale === 'pt' ? 'pt-PT' : locale === 'ru' ? 'ru-RU' : locale === 'tr' ? 'tr-TR' : locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function renderContent(content: string) {
  const lines = content.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4">{line.replace('## ', '')}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-white mt-8 mb-3">{line.replace('### ', '')}</h3>;
    if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-green-500 bg-green-500/5 rounded-r-xl px-6 py-4 my-6 text-gray-300 italic text-lg">{line.replace('> ', '')}</blockquote>;
    if (line.startsWith('- ')) return <li key={i} className="text-gray-300 ml-6 mb-1 list-disc">{line.replace('- ', '')}</li>;
    if (line.startsWith('---')) return <hr key={i} className="my-8 border-white/10" />;
    if (line.trim() === '') return <br key={i} />;
    const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
    return <p key={i} className="text-gray-300 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: rendered }} />;
  });
}

const FALLBACK_COVER = 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const slug = params.slug as string;

  useEffect(() => {
    async function loadArticle() {
      try {
        const response = await fetch(`/api/blog/articles`);
        const data = await response.json();

        if (data.articles) {
          const found = data.articles.find((a: Article) => a.slug === slug);
          if (found) {
            setArticle(found);
            // Get related articles (same category)
            const related = data.articles
              .filter((a: Article) => a.categoryId === found.categoryId && a.slug !== slug && a.status === 'published')
              .slice(0, 3);
            setRelatedArticles(related);
          } else {
            setNotFound(true);
          }
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: article?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading article...</p>
        </div>
      </main>
    );
  }

  if (notFound || !article) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-10 h-10 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Article Not Found</h1>
          <p className="text-gray-400 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium text-sm hover:scale-105 transition-all">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-24 pb-4">
        <Link href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-white hover:bg-slate-700/50 transition-all text-sm group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[500px] overflow-hidden">
        <img
          src={article.coverImage || FALLBACK_COVER}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30 backdrop-blur-sm">
                {CATEGORY_ICONS[article.categoryId] || '📰'} {CATEGORY_NAMES[article.categoryId] || 'News'}
              </span>
              {article.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-slate-800/60 text-gray-400 text-xs border border-white/10 backdrop-blur-sm">
                  #{tag}
                </span>
              ))}
              {article.status === 'pending_review' && (
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium border border-yellow-500/30 backdrop-blur-sm">
                  Pending Review
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {article.publishedAt ? formatDate(article.publishedAt, locale) : 'Recent'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {article.readTime} min read
              </span>
              <span className="text-gray-500">By {article.author}</span>
              <span className="flex items-center gap-1.5 text-green-400">
                <Globe className="w-3 h-3" />
                {article.source || 'IPTV Pro News'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-8">
            {/* Main Content */}
            <article className="prose prose-invert max-w-none">
              <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 md:p-10">
                {renderContent(article.content)}

                {/* Image Gallery */}
                {article.images && article.images.length > 0 && (
                  <div className="mt-10 mb-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-green-400" />
                      Photo Gallery
                    </h3>
                    <div className="relative rounded-2xl overflow-hidden bg-slate-800/50">
                      <img
                        src={article.images[imageIndex]}
                        alt={`Gallery image ${imageIndex + 1}`}
                        className="w-full h-[350px] md:h-[450px] object-cover transition-opacity duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
                      />
                      {article.images.length > 1 && (
                        <>
                          <button onClick={() => setImageIndex(i => (i - 1 + article.images.length) % article.images.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all">
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button onClick={() => setImageIndex(i => (i + 1) % article.images.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                            {article.images.map((_, i) => (
                              <button key={i} onClick={() => setImageIndex(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === imageIndex ? 'bg-green-400 w-6' : 'bg-white/40 hover:bg-white/60'}`} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Slideshow */}
                {article.slideshow && article.slideshow.length > 0 && (
                  <div className="mt-8 mb-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Play className="w-5 h-5 text-green-400" />
                      Slideshow
                    </h3>
                    <div className="relative rounded-2xl overflow-hidden bg-slate-800/50">
                      <img
                        src={article.slideshow[slideIndex]}
                        alt={`Slide ${slideIndex + 1}`}
                        className="w-full h-[350px] md:h-[450px] object-cover transition-opacity duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <button onClick={() => setSlideIndex(i => (i - 1 + article.slideshow.length) % article.slideshow.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={() => setSlideIndex(i => (i + 1) % article.slideshow.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {article.slideshow.map((_, i) => (
                          <button key={i} onClick={() => setSlideIndex(i)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${i === slideIndex ? 'bg-green-400 scale-110 w-8' : 'bg-white/30 hover:bg-white/50'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8">
                  {article.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-full bg-slate-800/50 text-gray-400 text-xs hover:text-green-400 hover:bg-green-500/10 border border-white/5 transition-all cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Share & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-8 p-4 rounded-2xl bg-slate-800/30 border border-white/5">
                <div className="flex items-center gap-3">
                  <button onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm ${liked ? 'bg-green-500/20 text-green-400' : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50 border border-white/5'}`}>
                    <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-green-400' : ''}`} />
                    <span>{liked ? 'Liked' : 'Like'}</span>
                  </button>
                  <button onClick={() => setBookmarked(!bookmarked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm ${bookmarked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50 border border-white/5'}`}>
                    <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-yellow-400' : ''}`} />
                    <span>{bookmarked ? 'Saved' : 'Save'}</span>
                  </button>
                  <button onClick={handleShare}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50 border border-white/5 transition-all text-sm">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                    {showShare && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-green-500 text-white text-xs whitespace-nowrap">
                        Link copied!
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-10 bg-gradient-to-r from-green-500/10 via-slate-800/30 to-emerald-500/10 rounded-2xl border border-green-500/20 p-6 md:p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  {article.categoryId?.includes('world-cup') || article.categoryId?.includes('champions') || article.categoryId?.includes('premier') || article.categoryId?.includes('la-liga')
                    ? 'Never Miss a Match'
                    : 'Get the Best IPTV Experience'}
                </h3>
                <p className="text-gray-400 mb-4 max-w-lg mx-auto">
                  {article.categoryId?.includes('world-cup') || article.categoryId?.includes('champions') || article.categoryId?.includes('premier') || article.categoryId?.includes('la-liga')
                    ? 'Watch every match in stunning 4K UHD with zero buffering on IPTV Pro.'
                    : 'Stream 25,000+ channels in 4K & 8K. Ultra-fast servers, 24/7 support.'}
                </p>
                <Link href={`/${locale}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-medium text-sm transition-all hover:scale-105 shadow-lg shadow-green-500/20">
                  {article.categoryId?.includes('setup') || article.categoryId?.includes('device') ? 'Get IPTV Pro Now' : 'Get IPTV Pro Now'}
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Category Info */}
                <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-5 text-center">
                  <div className="text-4xl mb-3">{CATEGORY_ICONS[article.categoryId] || '📰'}</div>
                  <h4 className="text-white font-bold text-sm">{CATEGORY_NAMES[article.categoryId] || 'News'}</h4>
                  <p className="text-gray-500 text-xs mt-1">Category</p>
                </div>

                {/* Article Info */}
                <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Author</span>
                    <span className="text-white">{article.author}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Reading Time</span>
                    <span className="text-white">{article.readTime} min</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Published</span>
                    <span className="text-white">{article.publishedAt ? formatDate(article.publishedAt, locale).split(',').slice(0, 2).join(',') : 'Recent'}</span>
                  </div>
                  {article.source && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Source</span>
                      <span className="text-green-400">{article.source}</span>
                    </div>
                  )}
                </div>

                {/* Related Quick Links */}
                {relatedArticles.slice(0, 2).map(related => (
                  <Link key={related.id} href={`/${locale}/blog/${related.slug}`}
                    className="block bg-slate-800/30 border border-white/5 rounded-2xl overflow-hidden hover:border-green-500/30 transition-all group">
                    <img
                      src={related.coverImage || FALLBACK_COVER}
                      alt={related.title}
                      className="w-full h-24 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
                    />
                    <div className="p-3">
                      <h4 className="text-white text-xs font-bold group-hover:text-green-400 transition-colors line-clamp-2">
                        {related.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                        <Clock className="w-3 h-3" />
                        {related.readTime}m read
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-16 mb-8">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-400" />
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map(related => (
                  <Link key={related.id} href={`/${locale}/blog/${related.slug}`}
                    className="group bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-green-500/30 hover:bg-slate-900/80 transition-all duration-500">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={related.coverImage || FALLBACK_COVER}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-green-400">{CATEGORY_ICONS[related.categoryId] || '📰'} {CATEGORY_NAMES[related.categoryId] || 'News'}</span>
                      <h3 className="text-white font-bold text-sm mt-2 group-hover:text-green-400 transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {related.readTime} min read
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
