'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Bookmark, ThumbsUp,
  ChevronLeft, ChevronRight, Image as ImageIcon, ExternalLink, Globe,
  Sparkles, TrendingUp, Hash, List, ChevronUp, Copy, Check,
  MessageCircle, Trophy
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RevealAnimation from '@/components/RevealAnimation';
import { updateSEOMeta, resetSEOMeta } from '@/lib/seo-client';
import { newsArticleSchema, blogPostingSchema, breadcrumbSchema } from '@/lib/json-ld';
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

// Extract headings for table of contents
function extractTOC(content: string): { level: number; text: string; id: string }[] {
  const headings: { level: number; text: string; id: string }[] = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (match) {
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      headings.push({ level: match[1].length, text, id });
    }
  }
  return headings;
}

function renderContent(content: string) {
  const lines = content.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('## ')) {
      const text = line.replace('## ', '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return <h2 key={i} id={id} className="text-2xl md:text-3xl font-bold text-white mt-12 mb-5 scroll-mt-24">{text}</h2>;
    }
    if (line.startsWith('### ')) {
      const text = line.replace('### ', '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return <h3 key={i} id={id} className="text-xl font-bold text-white mt-10 mb-4 scroll-mt-24">{text}</h3>;
    }
    if (line.startsWith('> ')) {
      return (
        <blockquote key={i} className="relative border-l-4 border-brand-500 bg-brand-500/5 rounded-r-xl px-6 py-5 my-8 text-gray-300 italic text-lg">
          <span className="absolute -top-2 -left-2 text-4xl text-brand-500/30">&ldquo;</span>
          {line.replace('> ', '')}
        </blockquote>
      );
    }
    if (line.startsWith('- ')) {
      // Check if previous line was also a list item
      const prevLine = lines[i - 1];
      const isFirst = !prevLine || !prevLine.startsWith('- ');
      return (
        <li key={i} className={`text-gray-300 ml-6 mb-1.5 ${isFirst ? 'mt-2' : ''}`} style={{ listStyleType: 'disc' }}>
          {line.replace('- ', '')}
        </li>
      );
    }
    if (line.startsWith('---')) {
      return <div key={i} className="wc-divider my-10" />;
    }
    if (line.trim() === '') {
      return <div key={i} className="h-3" />;
    }
    const rendered = line
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-gray-200">$1</em>');
    return <p key={i} className="text-gray-300 leading-relaxed mb-5 text-base md:text-lg" dangerouslySetInnerHTML={{ __html: rendered }} />;
  });
}

const FALLBACK_COVER = 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop';

export default function ArticlePage() {
  const params = useParams();
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
  const [copied, setCopied] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const slug = params.slug as string;

  // Update SEO meta tags dynamically when article loads
  useEffect(() => {
    if (article) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iptv-pro.it.com';
      updateSEOMeta({
        title: `${article.title} | IPTV Pro Blog`,
        description: article.excerpt || article.seoDescription || 'Read the latest sports news and analysis on IPTV Pro.',
        image: article.coverImage ? (article.coverImage.startsWith('http') ? article.coverImage : `${siteUrl}${article.coverImage}`) : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        siteName: 'IPTV Pro',
        type: 'article',
      });
    } else if (!loading) {
      resetSEOMeta();
    }
  }, [article, loading]);

  useEffect(() => {
    async function loadArticle() {
      try {
        const response = await fetch(`/api/blog/articles`);
        const data = await response.json();
        if (data.articles) {
          const found = data.articles.find((a: Article) => a.slug === slug);
          if (found) {
            setArticle(found);
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

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tocItems = useMemo(() => article ? extractTOC(article.content) : [], [article]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (platform?: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article?.title || '');

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${title}%20${url}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    } else {
      await handleCopyLink();
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-dark-800 animate-pulse mx-auto mb-4 shimmer-premium" />
          <p className="text-gray-400">Loading article...</p>
        </div>
      </main>
    );
  }

  if (notFound || !article) {
    return (
      <main className="min-h-screen bg-dark-950">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <RevealAnimation direction="scale">
            <div className="w-24 h-24 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-12 h-12 text-gray-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Article Not Found</h1>
            <p className="text-gray-400 mb-8">The article you are looking for does not exist or has been removed.</p>
            <Link href={`/${locale}/blog`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-500 to-yellow-600 text-dark-950 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-brand-500/25">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </RevealAnimation>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-dark-950">
        <div
          className="h-full bg-gradient-to-r from-brand-500 via-yellow-400 to-brand-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <Navbar />

      {/* ===== BACK BUTTON ===== */}
      <div className="container mx-auto px-4 pt-24 pb-4">
        <Link href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800/50 border border-white/5 text-gray-400 hover:text-brand-400 hover:border-brand-500/20 transition-all text-sm group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>
      </div>

      {/* ===== HERO SECTION ===== */}
      <div className="relative h-[350px] md:h-[550px] overflow-hidden">
        <img
          src={article.coverImage || FALLBACK_COVER}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-dark-950/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto max-w-4xl">
            <RevealAnimation direction="up">
              {/* Tags row */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1.5 rounded-full bg-dark-950/60 text-brand-400 text-xs font-semibold border border-brand-500/20 backdrop-blur-sm">
                  {CATEGORY_ICONS[article.categoryId] || '📰'} {CATEGORY_NAMES[article.categoryId] || 'News'}
                </span>
                {article.tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="px-3 py-1.5 rounded-full bg-dark-950/40 text-gray-400 text-xs border border-white/5 backdrop-blur-sm flex items-center gap-1">
                    <Hash className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 text-shadow-white">
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
                <span className="text-gray-500">by <span className="text-gray-300">{article.author}</span></span>
                <span className="flex items-center gap-1.5 text-brand-400">
                  <Globe className="w-3.5 h-3.5" />
                  {article.source || 'IPTV Pro News'}
                </span>
              </div>
            </RevealAnimation>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8">
            {/* Main Article */}
            <article className="prose prose-invert max-w-none">
              {/* TOC Button (mobile) */}
              {tocItems.length > 0 && (
                <div className="lg:hidden mb-6">
                  <button
                    onClick={() => setShowTOC(!showTOC)}
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-white/5 text-gray-400 hover:text-brand-400 transition-all text-sm"
                  >
                    <List className="w-4 h-4" />
                    Table of Contents
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${showTOC ? 'rotate-90' : ''}`} />
                  </button>
                  {showTOC && (
                    <div className="mt-2 p-3 rounded-xl bg-dark-800/30 border border-white/5 space-y-1">
                      {tocItems.map((item, i) => (
                        <a key={i} href={`#${item.id}`}
                          className={`block px-3 py-2 rounded-lg text-sm transition-all hover:bg-brand-500/10 hover:text-brand-400 ${item.level === 3 ? 'ml-4' : ''} text-gray-400`}>
                          {item.text}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* JSON-LD Schema */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: article.categoryId === 'football' || article.categoryId === 'champions-league' || article.categoryId === 'premier-league' || article.categoryId === 'la-liga'
                    ? newsArticleSchema(article, locale)
                    : blogPostingSchema(article, locale),
                }}
              />
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: breadcrumbSchema([
                    { name: 'Home', url: `/${locale}` },
                    { name: 'Blog', url: `/${locale}/blog` },
                    { name: article.title, url: `/${locale}/blog/${article.slug}` },
                  ]),
                }}
              />

              {/* Content */}
              <div className="bg-dark-800/20 border border-white/5 rounded-2xl p-6 md:p-10">
                {/* Excerpt */}
                {article.excerpt && (
                  <div className="mb-8 pb-8 border-b border-white/5">
                    <p className="text-gray-300 text-lg md:text-xl leading-relaxed font-medium italic">
                      &ldquo;{article.excerpt}&rdquo;
                    </p>
                  </div>
                )}

                {renderContent(article.content)}

                {/* Image Gallery */}
                {article.images && article.images.length > 0 && (
                  <div className="mt-12 mb-8">
                    <RevealAnimation direction="up">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-brand-400" />
                        Photo Gallery
                      </h3>
                      <div className="relative rounded-2xl overflow-hidden bg-dark-800/50 glow-warm">
                        <img
                          src={article.images[imageIndex]}
                          alt={`Gallery image ${imageIndex + 1}`}
                          className="w-full h-[350px] md:h-[500px] object-cover transition-opacity duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
                        />
                        {article.images.length > 1 && (
                          <>
                            <button onClick={() => setImageIndex(i => (i - 1 + article.images.length) % article.images.length)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-dark-950/60 hover:bg-dark-950/80 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10">
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => setImageIndex(i => (i + 1) % article.images.length)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-dark-950/60 hover:bg-dark-950/80 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10">
                              <ChevronRight className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                              {article.images.map((_, i) => (
                                <button key={i} onClick={() => setImageIndex(i)}
                                  className={`h-2 rounded-full transition-all ${i === imageIndex ? 'bg-brand-400 w-8' : 'bg-white/30 hover:bg-white/50 w-2'}`} />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </RevealAnimation>
                  </div>
                )}

                {/* Slideshow */}
                {article.slideshow && article.slideshow.length > 0 && (
                  <div className="mt-8 mb-8">
                    <RevealAnimation direction="up" delay={1}>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-brand-400" />
                        Slideshow
                      </h3>
                      <div className="relative rounded-2xl overflow-hidden bg-dark-800/50 glow-warm">
                        <img
                          src={article.slideshow[slideIndex]}
                          alt={`Slide ${slideIndex + 1}`}
                          className="w-full h-[350px] md:h-[500px] object-cover transition-opacity duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/40 to-transparent" />
                        <button onClick={() => setSlideIndex(i => (i - 1 + article.slideshow.length) % article.slideshow.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-dark-950/60 hover:bg-dark-950/80 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => setSlideIndex(i => (i + 1) % article.slideshow.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-dark-950/60 hover:bg-dark-950/80 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {article.slideshow.map((_, i) => (
                            <button key={i} onClick={() => setSlideIndex(i)}
                              className={`h-2.5 rounded-full transition-all ${i === slideIndex ? 'bg-brand-400 scale-110 w-10' : 'bg-white/30 hover:bg-white/50 w-2.5'}`} />
                          ))}
                        </div>
                      </div>
                    </RevealAnimation>
                  </div>
                )}
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <RevealAnimation direction="up">
                  <div className="flex flex-wrap gap-2 mt-8">
                    {article.tags.map(tag => (
                      <span key={tag}
                        className="px-4 py-2 rounded-full bg-dark-800/50 text-gray-400 text-xs hover:text-brand-400 hover:bg-brand-500/10 border border-white/5 transition-all cursor-default flex items-center gap-1.5">
                        <Hash className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </RevealAnimation>
              )}

              {/* ===== SHARE & ACTIONS ===== */}
              <RevealAnimation direction="up" delay={1}>
                <div className="flex flex-wrap items-center justify-between gap-4 mt-8 p-5 rounded-2xl bg-dark-800/30 border border-white/5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setLiked(!liked)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm ${
                        liked ? 'bg-brand-500/20 text-brand-400 border-brand-500/20' : 'bg-dark-800/50 text-gray-400 hover:text-brand-400 hover:bg-dark-700/50 border border-white/5'
                      }`}>
                      <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-brand-400' : ''}`} />
                      <span>{liked ? 'Liked' : 'Like'}</span>
                    </button>
                    <button onClick={() => setBookmarked(!bookmarked)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm ${
                        bookmarked ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' : 'bg-dark-800/50 text-gray-400 hover:text-white hover:bg-dark-700/50 border border-white/5'
                      }`}>
                      <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-yellow-400' : ''}`} />
                      <span>{bookmarked ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Share buttons */}
                    <button onClick={() => handleShare('whatsapp')}
                      className="p-2.5 rounded-xl bg-dark-800/50 border border-white/5 text-gray-400 hover:text-green-400 hover:border-green-500/20 transition-all"
                      title="Share on WhatsApp">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </button>
                    <button onClick={() => handleShare('twitter')}
                      className="p-2.5 rounded-xl bg-dark-800/50 border border-white/5 text-gray-400 hover:text-blue-400 hover:border-blue-500/20 transition-all"
                      title="Share on Twitter/X">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </button>
                    <button onClick={() => handleShare('facebook')}
                      className="p-2.5 rounded-xl bg-dark-800/50 border border-white/5 text-gray-400 hover:text-blue-600 hover:border-blue-600/20 transition-all"
                      title="Share on Facebook">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </button>
                    <button onClick={() => handleShare()}
                      className="relative p-2.5 rounded-xl bg-dark-800/50 border border-white/5 text-gray-400 hover:text-brand-400 hover:border-brand-500/20 transition-all"
                      title="Copy link">
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {copied && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-green-500 text-white text-xs whitespace-nowrap animate-fade-in">
                          Link copied!
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </RevealAnimation>

              {/* ===== CTA SECTION ===== */}
              <RevealAnimation direction="up" delay={2}>
                <div className="mt-10 bg-gradient-to-r from-brand-500/5 via-dark-800/30 to-yellow-500/5 rounded-2xl border border-brand-500/10 p-8 md:p-10 text-center glow-warm">
                  <Trophy className="w-10 h-10 text-brand-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Never Miss a Match</h3>
                  <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                    Watch every match in stunning 4K UHD with zero buffering on IPTV Pro.
                    Over 25,000 channels available.
                  </p>
                  <Link href={`/${locale}`}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-500 to-yellow-600 hover:from-brand-400 hover:to-yellow-500 text-dark-950 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-brand-500/25">
                    Get IPTV Pro Now
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </RevealAnimation>
            </article>

            {/* ===== SIDEBAR ===== */}
            <aside className="hidden lg:block space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Category Card */}
                <RevealAnimation direction="right" delay={1}>
                  <div className="bg-dark-800/30 border border-white/5 rounded-2xl p-6 text-center glow-warm">
                    <div className="text-5xl mb-3">{CATEGORY_ICONS[article.categoryId] || '📰'}</div>
                    <h4 className="text-white font-bold text-sm">{CATEGORY_NAMES[article.categoryId] || 'News'}</h4>
                    <p className="text-gray-500 text-xs mt-1">Category</p>
                    <div className="wc-divider my-4" />
                    <Link href={`/${locale}/blog`}
                      className="text-brand-400 text-xs font-medium hover:underline">
                      Browse all articles →
                    </Link>
                  </div>
                </RevealAnimation>

                {/* Article Info */}
                <RevealAnimation direction="right" delay={2}>
                  <div className="bg-dark-800/30 border border-white/5 rounded-2xl p-5 space-y-3">
                    <h5 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Article Info</h5>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Author</span>
                      <span className="text-white font-medium">{article.author}</span>
                    </div>
                    <div className="wc-divider my-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Reading Time</span>
                      <span className="text-white font-medium">{article.readTime} min</span>
                    </div>
                    <div className="wc-divider my-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Published</span>
                      <span className="text-white font-medium">
                        {article.publishedAt ? formatDate(article.publishedAt, locale).split(',').slice(0, 2).join(',') : 'Recent'}
                      </span>
                    </div>
                    {article.source && (
                      <>
                        <div className="wc-divider my-2" />
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Source</span>
                          <span className="text-brand-400 font-medium">{article.source}</span>
                        </div>
                      </>
                    )}
                  </div>
                </RevealAnimation>

                {/* Table of Contents (Desktop) */}
                {tocItems.length > 0 && (
                  <RevealAnimation direction="right" delay={3}>
                    <div className="bg-dark-800/30 border border-white/5 rounded-2xl p-5">
                      <h5 className="text-white text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                        <List className="w-3.5 h-3.5 text-brand-400" />
                        In this article
                      </h5>
                      <div className="space-y-1">
                        {tocItems.map((item, i) => (
                          <a key={i} href={`#${item.id}`}
                            className={`block px-3 py-2 rounded-lg text-xs transition-all hover:bg-brand-500/10 hover:text-brand-400 ${
                              item.level === 3 ? 'ml-4' : ''
                            } text-gray-400`}>
                            {item.text}
                          </a>
                        ))}
                      </div>
                    </div>
                  </RevealAnimation>
                )}

                {/* Related in Sidebar */}
                {relatedArticles.slice(0, 2).map((related, i) => (
                  <RevealAnimation key={related.id} direction="right" delay={(i + 4) as 1|2|3|4|5}>
                    <Link href={`/${locale}/blog/${related.slug}`}
                      className="block bg-dark-800/30 border border-white/5 rounded-2xl overflow-hidden hover:border-brand-500/20 transition-all group">
                      <img
                        src={related.coverImage || FALLBACK_COVER}
                        alt={related.title}
                        className="w-full h-24 object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
                      />
                      <div className="p-3">
                        <h4 className="text-white text-xs font-bold group-hover:text-brand-400 transition-colors line-clamp-2">
                          {related.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                          <Clock className="w-3 h-3" />
                          {related.readTime}m read
                        </div>
                      </div>
                    </Link>
                  </RevealAnimation>
                ))}
              </div>
            </aside>
          </div>

          {/* ===== RELATED ARTICLES ===== */}
          {relatedArticles.length > 0 && (
            <div className="mt-16 mb-8">
              <RevealAnimation direction="up">
                <div className="flex items-center gap-3 mb-8">
                  <MessageCircle className="w-5 h-5 text-brand-400" />
                  <h2 className="text-2xl font-bold text-white">Related Articles</h2>
                  <div className="flex-1 trophy-line max-w-[200px]" />
                </div>
              </RevealAnimation>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((related, i) => (
                  <RevealAnimation key={related.id} direction="up" delay={(i + 1) as 0|1|2|3|4|5}>
                    <Link href={`/${locale}/blog/${related.slug}`}
                      className="group bg-dark-800/30 border border-brand-500/5 rounded-2xl overflow-hidden hover:border-brand-500/20 hover:bg-dark-800/60 transition-all duration-500 card-hover">
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={related.coverImage || FALLBACK_COVER}
                          alt={related.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
                        />
                      </div>
                      <div className="p-4">
                        <span className="text-xs text-brand-400 font-semibold">
                          {CATEGORY_ICONS[related.categoryId] || '📰'} {CATEGORY_NAMES[related.categoryId] || 'News'}
                        </span>
                        <h3 className="text-white font-bold text-sm mt-2 group-hover:text-brand-400 transition-colors line-clamp-2">
                          {related.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {related.readTime} min read
                        </div>
                      </div>
                    </Link>
                  </RevealAnimation>
                ))}
              </div>
            </div>
          )}

          {/* ===== AUTHOR SECTION ===== */}
          <RevealAnimation direction="up" delay={2}>
            <div className="mt-12 p-6 md:p-8 rounded-2xl bg-dark-800/20 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-yellow-600 flex items-center justify-center text-dark-950 font-bold text-lg flex-shrink-0">
                  {article.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{article.author}</h4>
                  <p className="text-gray-500 text-xs mt-1">Sports journalist covering the latest football news, match analysis, and IPTV streaming insights.</p>
                </div>
              </div>
            </div>
          </RevealAnimation>

          {/* Back to top */}
          <div className="text-center mt-12">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-800/50 border border-white/5 text-gray-400 hover:text-brand-400 hover:border-brand-500/20 transition-all text-sm"
            >
              <ChevronUp className="w-4 h-4" />
              Back to top
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
