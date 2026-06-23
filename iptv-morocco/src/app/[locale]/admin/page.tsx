'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  Shield, CheckCircle, XCircle, Eye, Clock, Edit3, Trash2, Plus, FileText,
  TrendingUp, Users, Globe, Zap, ChevronDown, ChevronUp, ExternalLink, MessageSquare
} from 'lucide-react';
import type { Article } from '@/lib/blog-types';

const PENDING_ARTICLES: Article[] = [
  {
    id: 'p1', title: 'Brazil vs Argentina: World Cup 2026 Final Preview',
    slug: 'brazil-argentina-final-preview',
    excerpt: 'A comprehensive preview of the World Cup 2026 final between South American giants Brazil and Argentina.',
    content: 'Full article content...',
    coverImage: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=400&fit=crop',
    images: [], videos: [], slideshow: [],
    author: 'AI Generated', status: 'pending_review', categoryId: 'world-cup',
    category: null, tags: ['World Cup', 'Brazil', 'Argentina', 'Final'],
    seoTitle: '', seoDescription: '', seoKeywords: '',
    readTime: 7, featured: false,
    publishedAt: null, scheduledFor: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'p2', title: 'How to Watch Premier League on Firestick: Step-by-Step Guide',
    slug: 'watch-premier-league-firestick-guide',
    excerpt: 'Complete guide to watching Premier League matches on Amazon Firestick using IPTV Pro.',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&h=400&fit=crop',
    images: [], videos: [], slideshow: [],
    author: 'AI Generated', status: 'pending_review', categoryId: 'premier-league',
    category: null, tags: ['Premier League', 'Firestick', 'IPTV', 'Guide'],
    seoTitle: '', seoDescription: '', seoKeywords: '',
    readTime: 6, featured: false,
    publishedAt: null, scheduledFor: null,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const RECENT_ARTICLES: Article[] = [];

export default function AdminDashboard() {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [pendingArticles, setPendingArticles] = useState<Article[]>(PENDING_ARTICLES);
  const [publishedArticles] = useState<Article[]>(RECENT_ARTICLES);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'generation'>('pending');

  const handleApprove = (id: string) => {
    setPendingArticles(prev => prev.filter(a => a.id !== id));
    // In production: call API to update article status to published
  };

  const handleReject = (id: string) => {
    setPendingArticles(prev => prev.filter(a => a.id !== id));
    // In production: call API to update article status to rejected
  };

  const stats = {
    pending: pendingArticles.length,
    published: publishedArticles.length,
    generatedToday: 12,
    totalArticles: pendingArticles.length + publishedArticles.length,
    totalViews: 15420,
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-xs font-medium tracking-wider uppercase">Admin Dashboard</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Content Management</h1>
              <p className="text-gray-500 text-sm mt-1">Review, approve, and manage your blog content</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/${locale}/admin/backlinks`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-white hover:bg-slate-700/50 transition-all text-sm">
                <Globe className="w-4 h-4" />
                Backlinks
              </Link>
              <Link href={`/${locale}/blog`}
                className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-white hover:bg-slate-700/50 transition-all text-sm">
                ← View Blog
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'Generated Today', value: stats.generatedToday, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Total Articles', value: stats.totalArticles, icon: FileText, color: 'text-white', bg: 'bg-white/5' },
              { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-800/30 border border-white/5 rounded-xl p-4">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
            {[
              { id: 'pending' as const, label: 'Pending Review', icon: Clock, count: stats.pending },
              { id: 'published' as const, label: 'Published', icon: CheckCircle, count: stats.published },
              { id: 'generation' as const, label: 'Generation Log', icon: Zap, count: null },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    tab.id === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Pending Review Tab */}
          {activeTab === 'pending' && (
            <>
              {pendingArticles.length === 0 ? (
                <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2">All Caught Up!</h3>
                  <p className="text-gray-500">No articles pending review. New AI-generated articles will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingArticles.map(article => (
                    <div key={article.id} className="bg-slate-800/30 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-48 h-32 md:h-auto flex-shrink-0">
                          <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-medium border border-yellow-500/20">
                                  Pending Review
                                </span>
                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {Math.round((Date.now() - new Date(article.createdAt).getTime()) / 3600000)}h ago
                                </span>
                              </div>
                              <h3 className="text-white font-bold text-base mb-1">{article.title}</h3>
                              <p className="text-gray-400 text-sm line-clamp-2 mb-3">{article.excerpt}</p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <span>By {article.author}</span>
                                <span>{article.readTime} min read</span>
                                <span>{article.tags.slice(0, 3).join(', ')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                            <button onClick={() => handleApprove(article.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-all">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve & Publish
                            </button>
                            <button onClick={() => handleReject(article.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all">
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                            <button
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-white text-xs font-medium transition-all">
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <a href={`/${locale}/blog/${article.slug}`} target="_blank"
                              className="p-2 rounded-xl bg-slate-800/50 border border-white/10 text-gray-500 hover:text-white transition-all">
                              <Eye className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Published Tab */}
          {activeTab === 'published' && (
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">No Published Articles Yet</h3>
              <p className="text-gray-500">Approve pending articles to see them here.</p>
            </div>
          )}

          {/* Generation Log Tab */}
          {activeTab === 'generation' && (
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">AI Generation Schedule</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-white text-sm">Article generated successfully</p>
                      <p className="text-gray-500 text-xs">2 hours ago • World Cup 2026 • Brazil vs Argentina Final Preview</p>
                    </div>
                  </div>
                  <span className="text-green-400 text-xs font-medium">Approved</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <div>
                      <p className="text-white text-sm">Article pending your review</p>
                      <p className="text-gray-500 text-xs">1 hour ago • Premier League • Firestick Setup Guide</p>
                    </div>
                  </div>
                  <span className="text-yellow-400 text-xs font-medium">Pending</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-white text-sm">Next generation scheduled</p>
                      <p className="text-gray-500 text-xs">~45 minutes • beIN Sports • Match Coverage</p>
                    </div>
                  </div>
                  <span className="text-blue-400 text-xs font-medium">Scheduled</span>
                </div>
              </div>
              <p className="text-gray-600 text-xs mt-4 text-center">
                20 articles generated daily • ~72 minutes between each generation
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
