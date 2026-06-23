'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowLeft, Clock, Calendar, Share2, Bookmark, ThumbsUp, MessageCircle,
  ChevronLeft, ChevronRight, Play, Image as ImageIcon, ExternalLink, Twitter, Facebook, Linkedin, Link as LinkIcon
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Article } from '@/lib/blog-types';

// Sample article for the demo
const SAMPLE_ARTICLE: Article = {
  id: '1', title: 'World Cup 2026: Morocco Shocks France in Semi-Final Thriller',
  slug: 'morocco-france-semi-final-2026',
  excerpt: 'In an astonishing display of skill and determination, Morocco defeated France 2-1 in the World Cup 2026 semi-final, becoming the first African nation to reach the final.',
  content: `
## Historic Victory for African Football

In what will be remembered as one of the greatest upsets in World Cup history, **Morocco defeated France 2-1** in the semi-final of the 2026 FIFA World Cup at Lusail Stadium. The Atlas Lions made history by becoming the first African nation ever to reach a World Cup final.

### First Half Dominance

Morocco came out with incredible intensity from the first whistle. The Moroccan midfield, led by their captain, controlled the tempo of the game from the opening minutes. In the 23rd minute, a brilliant through ball split the French defense, and Morocco's star striker slotted home with clinical precision to make it **1-0**.

> "This is not just a victory for Morocco, but for the entire African continent. We have shown that African football belongs on the biggest stage." — Morocco Coach

The Moroccan fans, who made up the vast majority of the 88,000 crowd, created an electric atmosphere that visibly unsettled the French team.

### Second Half Drama

France came out stronger in the second half, pushing forward in search of an equalizer. Their efforts paid off in the 56th minute when a well-worked corner kick resulted in a headed goal to make it **1-1**.

Just when it seemed the game was heading to extra time, Morocco struck again. A lightning-fast counter-attack in the 83rd minute caught the French defense off guard, and Morocco's winger finished brilliantly from a tight angle.

### What This Means

- Morocco becomes the **first African nation** to reach a World Cup final
- They will face either Brazil or Argentina in the final
- The victory cements Morocco's status as a rising force in world football
- FIFA has already noted the historic nature of this achievement for African football

### How to Watch

All World Cup 2026 matches are available in stunning **4K UHD** on IPTV Pro. Subscribe now to catch the final and every moment of the tournament in crystal-clear quality with zero buffering.

---

*Stay tuned for more World Cup 2026 coverage, only on IPTV Pro News.*
  `,
  coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&h=630&fit=crop',
  images: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=500&fit=crop',
  ],
  videos: [],
  slideshow: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&h=700&fit=crop',
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200&h=700&fit=crop',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=700&fit=crop',
  ],
  author: 'IPTV Pro News', status: 'published', categoryId: 'world-cup',
  category: { id: 'world-cup', name: 'World Cup 2026', slug: 'world-cup-2026', description: '', icon: '🏆', parentId: null, children: [], order: 0, articleCount: 0 },
  tags: ['World Cup', 'Morocco', 'France', 'Semi-Final', 'Football', '2026'],
  seoTitle: 'World Cup 2026: Morocco Makes History Against France | IPTV Pro',
  seoDescription: 'Morocco defeats France 2-1 in World Cup 2026 semi-final, becoming first African nation to reach the final. Full match report and analysis.',
  seoKeywords: 'World Cup 2026, Morocco France, Semi-final, Football, IPTV',
  readTime: 8, featured: true,
  publishedAt: '2026-06-22T20:30:00Z', scheduledFor: null,
  createdAt: '2026-06-22T18:00:00Z', updatedAt: '2026-06-22T18:00:00Z',
};

const RELATED_ARTICLES = [
  {
    id: '2', title: 'Champions League 2026 Final: Everything You Need to Know',
    slug: 'champions-league-final-2026-guide',
    excerpt: 'All the details about the upcoming Champions League final.',
    coverImage: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&h=400&fit=crop',
    readTime: 5, publishedAt: '2026-06-21T14:00:00Z',
    category: { name: 'Champions League', slug: 'champions-league', icon: '⭐' },
  },
  {
    id: '4', title: 'Premier League 2026-27: Top Transfers and Predictions',
    slug: 'premier-league-2026-27-transfers-predictions',
    excerpt: 'Breaking down the biggest transfers and top 4 predictions.',
    coverImage: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop',
    readTime: 6, publishedAt: '2026-06-19T16:00:00Z',
    category: { name: 'Premier League', slug: 'premier-league', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  },
  {
    id: '3', title: 'Best IPTV Settings for 4K Streaming: Complete Guide 2026',
    slug: 'best-iptv-settings-4k-streaming-2026',
    excerpt: 'Optimize your IPTV experience for crystal-clear 4K.',
    coverImage: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&h=400&fit=crop',
    readTime: 10, publishedAt: '2026-06-20T10:00:00Z',
    category: { name: 'Setup Guides', slug: 'setup-guides', icon: '🔧' },
  },
];

function formatDate(dateStr: string, locale: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [article] = useState<Article>(SAMPLE_ARTICLE);
  const [imageIndex, setImageIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Markdown to HTML (simple conversion)
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4">{line.replace('## ', '')}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-white mt-8 mb-3">{line.replace('### ', '')}</h3>;
      if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-green-500 bg-green-500/5 rounded-r-xl px-6 py-4 my-6 text-gray-300 italic text-lg">{line.replace('> ', '')}</blockquote>;
      if (line.startsWith('- ')) return <li key={i} className="text-gray-300 ml-6 mb-1 list-disc">{line.replace('- ', '')}</li>;
      if (line.startsWith('---')) return <hr key={i} className="my-8 border-white/10" />;
      if (line.trim() === '') return <br key={i} />;
      // Bold text
      const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
      return <p key={i} className="text-gray-300 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: rendered }} />;
    });
  };

  if (!article) {
    return (
      <main className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">{'Loading...'}</p>
        </div>
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
        <img src={article.coverImage} alt={article.title}
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30 backdrop-blur-sm">
                {article.category?.icon} {article.category?.name}
              </span>
              {article.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-slate-800/60 text-gray-400 text-xs border border-white/10 backdrop-blur-sm">
                  #{tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(article.publishedAt!, locale)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {article.readTime} min read
              </span>
              <span className="text-gray-500">By {article.author}</span>
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
                {article.images.length > 0 && (
                  <div className="mt-10 mb-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-green-400" />
                      Photo Gallery
                    </h3>
                    <div className="relative rounded-2xl overflow-hidden bg-slate-800/50">
                      <img src={article.images[imageIndex]} alt={`Gallery image ${imageIndex + 1}`}
                        className="w-full h-[350px] md:h-[450px] object-cover transition-opacity duration-500" />
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
                    <p className="text-center text-gray-500 text-sm mt-2">
                      Image {imageIndex + 1} of {article.images.length}
                    </p>
                  </div>
                )}

                {/* Slideshow */}
                {article.slideshow.length > 0 && (
                  <div className="mt-8 mb-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Play className="w-5 h-5 text-green-400" />
                      Slideshow
                    </h3>
                    <div className="relative rounded-2xl overflow-hidden bg-slate-800/50">
                      <img src={article.slideshow[slideIndex]} alt={`Slide ${slideIndex + 1}`}
                        className="w-full h-[350px] md:h-[450px] object-cover transition-opacity duration-500" />
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
              <div className="flex flex-wrap gap-2 mt-8">
                {article.tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 rounded-full bg-slate-800/50 text-gray-400 text-xs hover:text-green-400 hover:bg-green-500/10 border border-white/5 transition-all cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>

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
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 mr-2">Share:</span>
                  <button className="w-8 h-8 rounded-full bg-slate-800/50 border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-400/30 transition-all">
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-slate-800/50 border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-600/30 transition-all">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-slate-800/50 border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500/30 transition-all">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-slate-800/50 border border-white/10 flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-400/30 transition-all">
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-10 bg-gradient-to-r from-green-500/10 via-slate-800/30 to-emerald-500/10 rounded-2xl border border-green-500/20 p-6 md:p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  Never Miss a Match
                </h3>
                <p className="text-gray-400 mb-4 max-w-lg mx-auto">
                  Watch every World Cup 2026 match in stunning 4K UHD with zero buffering on IPTV Pro.
                </p>
                <a href={`/${locale}`} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-medium text-sm transition-all hover:scale-105 shadow-lg shadow-green-500/20">
                  Get IPTV Pro Now
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Category Info */}
                <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-5 text-center">
                  <div className="text-4xl mb-3">{article.category?.icon}</div>
                  <h4 className="text-white font-bold text-sm">{article.category?.name}</h4>
                  <p className="text-gray-500 text-xs mt-1">Category</p>
                </div>

                {/* Table of Contents */}
                <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-5">
                  <h4 className="text-white font-bold text-sm mb-3">Table of Contents</h4>
                  <nav className="space-y-2 text-xs">
                    <a href="#read" className="block text-gray-400 hover:text-green-400 transition-colors">Historic Victory</a>
                    <a href="#read" className="block text-gray-400 hover:text-green-400 transition-colors">First Half Dominance</a>
                    <a href="#read" className="block text-gray-400 hover:text-green-400 transition-colors">Second Half Drama</a>
                    <a href="#read" className="block text-gray-400 hover:text-green-400 transition-colors">What This Means</a>
                  </nav>
                </div>

                {/* Related Quick Links */}
                {RELATED_ARTICLES.slice(0, 2).map(article => (
                  <Link key={article.id} href={`/${locale}/blog/${article.slug}`}
                    className="block bg-slate-800/30 border border-white/5 rounded-2xl overflow-hidden hover:border-green-500/30 transition-all group">
                    <img src={article.coverImage} alt={article.title} className="w-full h-24 object-cover" />
                    <div className="p-3">
                      <h4 className="text-white text-xs font-bold group-hover:text-green-400 transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                        <Clock className="w-3 h-3" />
                        {article.readTime}m read
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          </div>

          {/* Related Articles */}
          <div className="mt-16 mb-8">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-green-400" />
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {RELATED_ARTICLES.map(article => (
                <Link key={article.id} href={`/${locale}/blog/${article.slug}`}
                  className="group bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-green-500/30 hover:bg-slate-900/80 transition-all duration-500">
                  <div className="relative h-40 overflow-hidden">
                    <img src={article.coverImage} alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-green-400">{article.category?.icon} {article.category?.name}</span>
                    <h3 className="text-white font-bold text-sm mt-2 group-hover:text-green-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {article.readTime} min read
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
