'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Shield, CheckCircle, XCircle, Eye, Clock, Edit3, Trash2, FileText,
  TrendingUp, Globe, Zap, ChevronDown, ChevronUp, ExternalLink, RefreshCw,
  Lock, LogIn, AlertTriangle
} from 'lucide-react';
import type { Article } from '@/lib/blog-types';
import { CATEGORY_ICONS, CATEGORY_NAMES } from './constants';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'generation'>('pending');

  // Check if already authenticated via session
  useEffect(() => {
    const authed = sessionStorage.getItem('admin_authenticated');
    const savedPassword = sessionStorage.getItem('admin_password');
    if (authed === 'true' && savedPassword) {
      setIsAuthenticated(true);
      setPassword(savedPassword);
    } else {
      setLoading(false);
    }
  }, []);

  // Load articles when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    loadArticles();
  }, [isAuthenticated]);

  const loadArticles = async () => {
    try {
      const response = await fetch('/api/blog/articles');
      const data = await response.json();
      if (data.articles) {
        setPendingArticles(data.articles.filter((a: Article) => a.status === 'pending_review' || a.status === 'draft'));
        setPublishedArticles(data.articles.filter((a: Article) => a.status === 'published'));
      }
    } catch {
      showMessage('error', 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch('/api/blog/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_password', password);
        showMessage('success', 'Welcome to the Admin Dashboard!');
      } else {
        setLoginError('Invalid password. Please try again.');
      }
    } catch {
      setLoginError('Connection error. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch('/api/blog/articles', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify({ id, status: 'published' }),
      });

      if (response.ok) {
        setPendingArticles(prev => prev.filter(a => a.id !== id));
        showMessage('success', 'Article published successfully!');
        await loadArticles();
      } else {
        showMessage('error', 'Failed to approve article');
      }
    } catch {
      showMessage('error', 'Failed to approve article');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch('/api/blog/articles', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify({ id, status: 'rejected' }),
      });

      if (response.ok) {
        setPendingArticles(prev => prev.filter(a => a.id !== id));
        showMessage('success', 'Article rejected.');
        await loadArticles();
      } else {
        showMessage('error', 'Failed to reject article');
      }
    } catch {
      showMessage('error', 'Failed to reject article');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateArticle = async () => {
    setActionLoading('generate');
    try {
      const response = await fetch('/api/blog/generate', {
        headers: { 'Authorization': `Bearer ${password}` },
      });
      const data = await response.json();

      if (data.success) {
        showMessage('success', 'New article generated from real news! Review it below.');
        await loadArticles();
      } else {
        showMessage('error', data.error || 'Failed to generate article');
      }
    } catch {
      showMessage('error', 'Failed to generate article. Check your API keys.');
    } finally {
      setActionLoading(null);
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4 border border-green-500/20">
              <Lock className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 md:p-8 space-y-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                placeholder="Enter admin password"
                className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-sm"
                autoFocus
              />
              {loginError && (
                <p className="flex items-center gap-1.5 text-red-400 text-xs mt-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {loginError}
                </p>
              )}
            </div>
            <button type="submit" disabled={!password || loggingIn}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-bold text-sm transition-all hover:scale-[1.02] shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
              {loggingIn ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loggingIn ? 'Verifying...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href={`/${locale}/blog`} className="text-gray-500 hover:text-green-400 text-sm transition-colors">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Stats
  const stats = {
    pending: pendingArticles.length,
    published: publishedArticles.length,
    total: pendingArticles.length + publishedArticles.length,
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
              <h1 className="text-2xl md:text-3xl font-bold text-white">{t('title') || 'Content Management'}</h1>
              <p className="text-gray-500 text-sm mt-1">{t('subtitle') || 'Review, approve, and manage your blog content'}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleGenerateArticle} disabled={actionLoading === 'generate'}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 shadow-lg shadow-green-500/20">
                {actionLoading === 'generate' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Generate Article
              </button>
              <button onClick={loadArticles}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-white transition-all text-sm">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button onClick={() => { setIsAuthenticated(false); sessionStorage.removeItem('admin_authenticated'); sessionStorage.removeItem('admin_password'); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-red-400 transition-all text-sm">
                <LogIn className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Notification */}
          {message && (
            <div className={`mb-6 px-5 py-3 rounded-xl flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: t('pending') || 'Pending Review', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              { label: t('published') || 'Published', value: stats.published, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: t('total_articles') || 'Total Articles', value: stats.total, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
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
              { id: 'pending' as const, label: t('pending') || 'Pending Review', icon: Clock, count: stats.pending },
              { id: 'published' as const, label: t('published') || 'Published', icon: CheckCircle, count: stats.published },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    tab.id === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-gray-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading articles...</p>
            </div>
          )}

          {/* Pending Review Tab */}
          {!loading && activeTab === 'pending' && (
            <>
              {pendingArticles.length === 0 ? (
                <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2">{t('all_caught_up') || 'All Caught Up!'}</h3>
                  <p className="text-gray-500 mb-4">{t('no_pending') || 'No articles pending review'}</p>
                  <button onClick={handleGenerateArticle} disabled={actionLoading === 'generate'}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium transition-all hover:scale-105 disabled:opacity-50">
                    <Zap className="w-4 h-4" />
                    Generate New Article
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingArticles.map(article => (
                    <div key={article.id} className="bg-slate-800/30 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-48 h-32 md:h-auto flex-shrink-0">
                          <img
                            src={article.coverImage || 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=800&h=450&fit=crop'}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=800&h=450&fit=crop'; }}
                          />
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
                                  {timeAgo(article.createdAt)}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  {CATEGORY_ICONS[article.categoryId] || '📰'} {CATEGORY_NAMES[article.categoryId] || 'News'}
                                </span>
                              </div>
                              <h3 className="text-white font-bold text-base mb-1">{article.title}</h3>
                              <p className="text-gray-400 text-sm line-clamp-2 mb-3">{article.excerpt}</p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <span>By {article.author}</span>
                                <span>{article.readTime} min read</span>
                                {article.tags && <span>{article.tags.slice(0, 3).join(', ')}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                            <button onClick={() => handleApprove(article.id)} disabled={actionLoading === article.id}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-all disabled:opacity-50">
                              {actionLoading === article.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              {actionLoading === article.id ? 'Publishing...' : (t('approve') || 'Approve & Publish')}
                            </button>
                            <button onClick={() => handleReject(article.id)} disabled={actionLoading === article.id}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all disabled:opacity-50">
                              <XCircle className="w-3.5 h-3.5" />
                              {t('reject') || 'Reject'}
                            </button>
                            <Link href={`/${locale}/blog/${article.slug}`} target="_blank"
                              className="p-2 rounded-xl bg-slate-800/50 border border-white/10 text-gray-500 hover:text-white transition-all">
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
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
          {!loading && activeTab === 'published' && (
            <>
              {publishedArticles.length === 0 ? (
                <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2">{t('no_published') || 'No Published Articles Yet'}</h3>
                  <p className="text-gray-500">Approve pending articles to see them here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {publishedArticles.map(article => (
                    <div key={article.id} className="flex items-center justify-between p-4 bg-slate-800/30 border border-white/5 rounded-xl hover:border-green-500/20 transition-all">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                          <img
                            src={article.coverImage || 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=150&h=150&fit=crop'}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=150&h=150&fit=crop'; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-white font-medium text-sm truncate">{article.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>{article.readTime} min read</span>
                            <span>{CATEGORY_ICONS[article.categoryId] || '📰'} {CATEGORY_NAMES[article.categoryId] || 'News'}</span>
                            <span>Views: {article.views || 0}</span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/${locale}/blog/${article.slug}`} target="_blank"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/50 text-gray-400 hover:text-white text-xs transition-all">
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
