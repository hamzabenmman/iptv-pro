'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Shield, CheckCircle, XCircle, Eye, Clock, Edit3, Trash2, FileText,
  TrendingUp, Globe, Zap, ChevronDown, ChevronUp, ExternalLink, RefreshCw,
  Lock, LogIn, AlertTriangle, Users, BarChart3, Target, DollarSign,
  Smartphone, Monitor, Tablet, MessageSquare, ArrowUpRight, ArrowDownRight,
  PieChart, Activity, UserPlus, Phone, Mail, Tag, Plus, Search,
  ChevronRight, LayoutDashboard, Newspaper, LinkIcon, Settings
} from 'lucide-react';
import type { Article } from '@/lib/blog-types';
import { CATEGORY_ICONS, CATEGORY_NAMES } from './constants';

// ===== Types =====
interface DashboardStats {
  totalVisitors: number;
  todayVisitors: number;
  totalTrials: number;
  todayTrials: number;
  convertedTrials: number;
  conversionRate: number;
  totalLeads: number;
  wonLeads: number;
  totalRevenue: number;
  weeklyVisitors: { date: string; count: number }[];
  topPages: { page: string; views: number }[];
  topSources: { source: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  recentTrials: FreeTrial[];
  recentLeads: SalesLead[];
  trialsByStatus: { status: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
}

interface FreeTrial {
  id: string;
  name: string;
  whatsapp: string;
  duration: string;
  status: string;
  source: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface SalesLead {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  source: string;
  status: string;
  plan_interest: string;
  value: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

type AdminTab = 'dashboard' | 'trials' | 'leads' | 'articles' | 'backlinks';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${amount}`;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  contacted: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  converted: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  expired: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  new: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  qualified: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  proposal: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  negotiation: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  won: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  lost: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  published: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  draft: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  pending_review: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
};

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Trials state
  const [trials, setTrials] = useState<FreeTrial[]>([]);
  const [trialFilter, setTrialFilter] = useState('all');
  const [trialLoading, setTrialLoading] = useState(false);

  // Leads state
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [leadFilter, setLeadFilter] = useState('all');
  const [leadLoading, setLeadLoading] = useState(false);

  // Articles state
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
  const [articleLoading, setArticleLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New lead modal
  const [showNewLead, setShowNewLead] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', whatsapp: '', email: '', plan_interest: '', value: '' });

  // ===== Auth =====
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

  useEffect(() => {
    if (!isAuthenticated) return;
    loadDashboard();
  }, [isAuthenticated]);

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
      } else {
        setLoginError('Invalid password. Please try again.');
      }
    } catch {
      setLoginError('Connection error. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_password');
  };

  // ===== Data Loading =====
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, trialsRes, leadsRes] = await Promise.all([
        fetch('/api/analytics/dashboard', { headers: { Authorization: `Bearer ${password}` } }),
        fetch('/api/analytics/trials?limit=50', { headers: { Authorization: `Bearer ${password}` } }),
        fetch('/api/analytics/leads?limit=50', { headers: { Authorization: `Bearer ${password}` } }),
      ]);
      const statsData = await statsRes.json();
      const trialsData = await trialsRes.json();
      const leadsData = await leadsRes.json();
      setStats(statsData);
      setTrials(trialsData.trials || []);
      setLeads(leadsData.leads || []);
    } catch {
      showMessage('error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    setArticleLoading(true);
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
      setArticleLoading(false);
    }
  };

  const handleApproveArticle = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch('/api/blog/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
        body: JSON.stringify({ id, status: 'published' }),
      });
      if (response.ok) {
        setPendingArticles(prev => prev.filter(a => a.id !== id));
        showMessage('success', 'Article published!');
      }
    } catch {
      showMessage('error', 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectArticle = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch('/api/blog/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
        body: JSON.stringify({ id, status: 'rejected' }),
      });
      if (response.ok) {
        setPendingArticles(prev => prev.filter(a => a.id !== id));
        showMessage('success', 'Article rejected.');
      }
    } catch {
      showMessage('error', 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateTrialStatus = async (id: string, status: string) => {
    setTrialLoading(true);
    try {
      const response = await fetch('/api/analytics/trials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
        body: JSON.stringify({ id, status }),
      });
      if (response.ok) {
        setTrials(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        showMessage('success', `Trial marked as ${status}`);
      }
    } catch {
      showMessage('error', 'Failed to update trial');
    } finally {
      setTrialLoading(false);
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: string) => {
    setLeadLoading(true);
    try {
      const response = await fetch('/api/analytics/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
        body: JSON.stringify({ id, status }),
      });
      if (response.ok) {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
        showMessage('success', `Lead marked as ${status}`);
      }
    } catch {
      showMessage('error', 'Failed to update lead');
    } finally {
      setLeadLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/analytics/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
        body: JSON.stringify({
          ...newLead,
          value: parseFloat(newLead.value) || 0,
          source: 'manual',
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(prev => [data.lead, ...prev]);
        setShowNewLead(false);
        setNewLead({ name: '', whatsapp: '', email: '', plan_interest: '', value: '' });
        showMessage('success', 'Lead created!');
      }
    } catch {
      showMessage('error', 'Failed to create lead');
    }
  };

  // ===== Login Screen =====
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4 border border-green-500/20">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 md:p-8 space-y-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5 font-medium">Password</label>
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                placeholder="Enter admin password"
                className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-sm" autoFocus />
              {loginError && (
                <p className="flex items-center gap-1.5 text-red-400 text-xs mt-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> {loginError}
                </p>
              )}
            </div>
            <button type="submit" disabled={!password || loggingIn}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-bold text-sm transition-all hover:scale-[1.02] shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
              {loggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loggingIn ? 'Verifying...' : 'Sign In'}
            </button>
          </form>
          <div className="text-center mt-6">
            <Link href={`/${locale}`} className="text-gray-500 hover:text-green-400 text-sm transition-colors">← Back to Site</Link>
          </div>
        </div>
      </main>
    );
  }

  // ===== Main Dashboard =====
  return (
    <main className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-6">
        {/* Sidebar + Content Layout */}
        <div className="flex gap-6 max-w-[1600px] mx-auto">

          {/* Sidebar Navigation */}
          <aside className="hidden lg:flex flex-col w-64 flex-shrink-0">
            <div className="sticky top-6">
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-sm">IPTV Pro</h2>
                  <p className="text-gray-500 text-[10px]">Admin Panel</p>
                </div>
              </div>

              <nav className="space-y-1">
                {[
                  { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard', badge: null },
                  { id: 'trials' as const, icon: Zap, label: 'Free Trials', badge: trials.filter(t => t.status === 'pending').length || null },
                  { id: 'leads' as const, icon: Target, label: 'Sales Leads', badge: leads.filter(l => l.status === 'new').length || null },
                  { id: 'articles' as const, icon: Newspaper, label: 'Articles', badge: pendingArticles.length || null },
                ].map(item => (
                  <button key={item.id} onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'articles') loadArticles();
                    if (item.id === 'trials' || item.id === 'leads') loadDashboard();
                  }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}>
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">{item.badge}</span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-white/5">
                <Link href={`/${locale}/admin/backlinks`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  <LinkIcon className="w-4 h-4" />
                  <span>Backlinks</span>
                </Link>
                <button onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all mt-1">
                  <LogIn className="w-4 h-4 rotate-180" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile Header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-dark-950/95 backdrop-blur-lg border-b border-white/5 px-4 py-3">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-white font-bold text-sm">Admin</span>
              </div>
              <div className="flex gap-1 overflow-x-auto">
                {(['dashboard', 'trials', 'leads', 'articles'] as AdminTab[]).map(tab => (
                  <button key={tab} onClick={() => {
                    setActiveTab(tab);
                    if (tab === 'articles') loadArticles();
                    if (tab === 'trials' || tab === 'leads') loadDashboard();
                  }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${
                      activeTab === tab ? 'bg-green-500/10 text-green-400' : 'text-gray-500'
                    }`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 pt-16 lg:pt-0">
            {/* Notification */}
            {message && (
              <div className={`mb-4 px-5 py-3 rounded-xl flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {message.text}
              </div>
            )}

            {/* ===== DASHBOARD TAB ===== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Overview of your IPTV Pro business</p>
                  </div>
                  <button onClick={loadDashboard} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-white text-sm transition-all">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-16">
                    <RefreshCw className="w-8 h-8 text-gray-500 animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Loading dashboard...</p>
                  </div>
                ) : stats && (
                  <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Visitors', value: stats.totalVisitors, sub: `+${stats.todayVisitors} today`, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: 'up' },
                        { label: 'Free Trials', value: stats.totalTrials, sub: `${stats.convertedTrials} converted`, icon: Zap, color: 'text-green-400', bg: 'bg-green-500/10', trend: 'up' },
                        { label: 'Conversion Rate', value: `${stats.conversionRate}%`, sub: 'trial → paid', icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: stats.conversionRate > 20 ? 'up' : 'down' },
                        { label: 'Revenue', value: formatCurrency(stats.totalRevenue), sub: `${stats.wonLeads} deals won`, icon: DollarSign, color: 'text-yellow-400', bg: 'bg-yellow-500/10', trend: 'up' },
                      ].map(kpi => (
                        <div key={kpi.label} className="bg-slate-800/30 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                            </div>
                            {kpi.trend === 'up' ? (
                              <ArrowUpRight className="w-4 h-4 text-green-400" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                          <p className="text-2xl font-bold text-white">{kpi.value}</p>
                          <p className="text-gray-500 text-xs mt-1">{kpi.label}</p>
                          <p className={`text-xs mt-1 ${kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>{kpi.sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Weekly Visitors Chart */}
                      <div className="lg:col-span-2 bg-slate-800/30 border border-white/5 rounded-2xl p-5">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-blue-400" />
                          Weekly Visitors
                        </h3>
                        <div className="flex items-end gap-2 h-40">
                          {stats.weeklyVisitors.map((day, i) => {
                            const maxCount = Math.max(...stats.weeklyVisitors.map(d => d.count), 1);
                            const height = (day.count / maxCount) * 100;
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[10px] text-gray-500">{day.count}</span>
                                <div className="w-full rounded-t-md bg-gradient-to-t from-blue-500/30 to-blue-400/60 transition-all hover:from-blue-500/50 hover:to-blue-400/80"
                                  style={{ height: `${Math.max(height, 4)}%` }} />
                                <span className="text-[10px] text-gray-500">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Device Breakdown */}
                      <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-5">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                          <PieChart className="w-4 h-4 text-purple-400" />
                          Devices
                        </h3>
                        <div className="space-y-3">
                          {stats.deviceBreakdown.length === 0 ? (
                            <p className="text-gray-500 text-xs text-center py-4">No data yet</p>
                          ) : stats.deviceBreakdown.map((d, i) => {
                            const total = stats.deviceBreakdown.reduce((s, x) => s + x.count, 0) || 1;
                            const pct = Math.round((d.count / total) * 100);
                            const icons: Record<string, typeof Monitor> = { desktop: Monitor, mobile: Smartphone, tablet: Tablet };
                            const Icon = icons[d.device] || Monitor;
                            return (
                              <div key={i} className="flex items-center gap-3">
                                <Icon className="w-4 h-4 text-gray-400" />
                                <div className="flex-1">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-300 capitalize">{d.device || 'Unknown'}</span>
                                    <span className="text-gray-500">{pct}%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Tables Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Top Pages */}
                      <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-5">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-green-400" />
                          Top Pages (7d)
                        </h3>
                        <div className="space-y-2">
                          {stats.topPages.length === 0 ? (
                            <p className="text-gray-500 text-xs text-center py-4">No data yet</p>
                          ) : stats.topPages.slice(0, 8).map((p, i) => (
                            <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                              <span className="text-gray-300 text-xs truncate flex-1">{p.page}</span>
                              <span className="text-gray-500 text-xs ml-4">{p.views}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Trial Status */}
                      <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-5">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-yellow-400" />
                          Funnel Overview
                        </h3>
                        <div className="space-y-3">
                          {[
                            { label: 'Total Visitors', value: stats.totalVisitors, color: 'from-blue-500 to-blue-400', pct: 100 },
                            { label: 'Free Trials Started', value: stats.totalTrials, color: 'from-green-500 to-green-400', pct: stats.totalVisitors > 0 ? Math.round((stats.totalTrials / stats.totalVisitors) * 100) : 0 },
                            { label: 'Trials Converted', value: stats.convertedTrials, color: 'from-yellow-500 to-yellow-400', pct: stats.totalTrials > 0 ? Math.round((stats.convertedTrials / stats.totalTrials) * 100) : 0 },
                            { label: 'Deals Won', value: stats.wonLeads, color: 'from-emerald-500 to-emerald-400', pct: stats.convertedTrials > 0 ? Math.round((stats.wonLeads / stats.convertedTrials) * 100) : 0 },
                          ].map((step, i) => (
                            <div key={i}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-300">{step.label}</span>
                                <span className="text-gray-500">{step.value} ({step.pct}%)</span>
                              </div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${step.color} rounded-full transition-all`} style={{ width: `${step.pct}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Recent Trials */}
                      <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-white font-bold text-sm flex items-center gap-2">
                            <Zap className="w-4 h-4 text-green-400" />
                            Recent Trials
                          </h3>
                          <button onClick={() => setActiveTab('trials')} className="text-green-400 text-xs hover:text-green-300">View all →</button>
                        </div>
                        {stats.recentTrials.length === 0 ? (
                          <p className="text-gray-500 text-xs text-center py-4">No trials yet</p>
                        ) : (
                          <div className="space-y-2">
                            {stats.recentTrials.map(trial => {
                              const sc = STATUS_COLORS[trial.status] || STATUS_COLORS.pending;
                              return (
                                <div key={trial.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                  <div className="min-w-0">
                                    <p className="text-white text-xs font-medium truncate">{trial.name || trial.whatsapp}</p>
                                    <p className="text-gray-500 text-[10px]">{trial.duration} · {timeAgo(trial.created_at)}</p>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text} border ${sc.border} capitalize`}>
                                    {trial.status}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Recent Leads */}
                      <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-white font-bold text-sm flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-400" />
                            Recent Leads
                          </h3>
                          <button onClick={() => setActiveTab('leads')} className="text-purple-400 text-xs hover:text-purple-300">View all →</button>
                        </div>
                        {stats.recentLeads.length === 0 ? (
                          <p className="text-gray-500 text-xs text-center py-4">No leads yet</p>
                        ) : (
                          <div className="space-y-2">
                            {stats.recentLeads.map(lead => {
                              const sc = STATUS_COLORS[lead.status] || STATUS_COLORS.new;
                              return (
                                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                  <div className="min-w-0">
                                    <p className="text-white text-xs font-medium truncate">{lead.name}</p>
                                    <p className="text-gray-500 text-[10px]">{lead.plan_interest || lead.source} · {timeAgo(lead.created_at)}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {lead.value > 0 && <span className="text-green-400 text-[10px] font-bold">{formatCurrency(lead.value)}</span>}
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text} border ${sc.border} capitalize`}>
                                      {lead.status}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ===== TRIALS TAB ===== */}
            {activeTab === 'trials' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Free Trials</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage trial signups and track conversions</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setActiveTab('dashboard'); loadDashboard(); }}
                      className="px-4 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-white text-sm transition-all">
                      ← Back
                    </button>
                  </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 overflow-x-auto">
                  {['all', 'pending', 'contacted', 'converted', 'expired'].map(f => (
                    <button key={f} onClick={() => setTrialFilter(f)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition-all capitalize whitespace-nowrap ${
                        trialFilter === f ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-800/50 text-gray-400 hover:text-white border border-white/5'
                      }`}>
                      {f} ({f === 'all' ? trials.length : trials.filter(t => t.status === f).length})
                    </button>
                  ))}
                </div>

                {/* Trials List */}
                <div className="space-y-3">
                  {trials.filter(t => trialFilter === 'all' || t.status === trialFilter).length === 0 ? (
                    <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center">
                      <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-white font-bold text-lg mb-2">No Trials Yet</h3>
                      <p className="text-gray-500">Trial signups will appear here when users submit the free trial form.</p>
                    </div>
                  ) : trials.filter(t => trialFilter === 'all' || t.status === trialFilter).map(trial => {
                    const sc = STATUS_COLORS[trial.status] || STATUS_COLORS.pending;
                    return (
                      <div key={trial.id} className="bg-slate-800/30 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <UserPlus className="w-4 h-4 text-gray-400" />
                              <span className="text-white font-bold text-sm">{trial.name || 'Anonymous'}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text} border ${sc.border} capitalize`}>
                                {trial.status}
                              </span>
                              <span className="text-gray-500 text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {timeAgo(trial.created_at)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {trial.whatsapp}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Duration: {trial.duration}</span>
                              <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Source: {trial.source}</span>
                            </div>
                            {trial.notes && <p className="text-gray-500 text-xs mt-2">{trial.notes}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <a href={`https://wa.me/${trial.whatsapp}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-all">
                              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                            {trial.status === 'pending' && (
                              <>
                                <button onClick={() => handleUpdateTrialStatus(trial.id, 'contacted')} disabled={trialLoading}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-medium transition-all">
                                  Contacted
                                </button>
                                <button onClick={() => handleUpdateTrialStatus(trial.id, 'converted')} disabled={trialLoading}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-all">
                                  <CheckCircle className="w-3.5 h-3.5" /> Convert
                                </button>
                                <button onClick={() => handleUpdateTrialStatus(trial.id, 'expired')} disabled={trialLoading}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all">
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {trial.status === 'contacted' && (
                              <button onClick={() => handleUpdateTrialStatus(trial.id, 'converted')} disabled={trialLoading}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-all">
                                <CheckCircle className="w-3.5 h-3.5" /> Convert
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== LEADS TAB ===== */}
            {activeTab === 'leads' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Sales Leads</h1>
                    <p className="text-gray-500 text-sm mt-1">Track and manage potential customers</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowNewLead(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium transition-all hover:scale-105 shadow-lg shadow-green-500/20">
                      <Plus className="w-4 h-4" /> Add Lead
                    </button>
                    <button onClick={() => { setActiveTab('dashboard'); loadDashboard(); }}
                      className="px-4 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-white text-sm transition-all">
                      ← Back
                    </button>
                  </div>
                </div>

                {/* Lead Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {['new', 'qualified', 'won', 'lost'].map(status => {
                    const count = leads.filter(l => l.status === status).length;
                    const sc = STATUS_COLORS[status];
                    return (
                      <div key={status} className="bg-slate-800/30 border border-white/5 rounded-xl p-4 text-center">
                        <p className={`text-2xl font-bold ${sc.text}`}>{count}</p>
                        <p className="text-gray-500 text-xs mt-1 capitalize">{status}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 overflow-x-auto">
                  {['all', 'new', 'qualified', 'proposal', 'won', 'lost'].map(f => (
                    <button key={f} onClick={() => setLeadFilter(f)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition-all capitalize whitespace-nowrap ${
                        leadFilter === f ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-800/50 text-gray-400 hover:text-white border border-white/5'
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>

                {/* Leads List */}
                <div className="space-y-3">
                  {leads.filter(l => leadFilter === 'all' || l.status === leadFilter).length === 0 ? (
                    <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center">
                      <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-white font-bold text-lg mb-2">No Leads Yet</h3>
                      <p className="text-gray-500">Add leads manually or convert free trials into sales leads.</p>
                    </div>
                  ) : leads.filter(l => leadFilter === 'all' || l.status === leadFilter).map(lead => {
                    const sc = STATUS_COLORS[lead.status] || STATUS_COLORS.new;
                    return (
                      <div key={lead.id} className="bg-slate-800/30 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-4 h-4 text-purple-400" />
                              <span className="text-white font-bold text-sm">{lead.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text} border ${sc.border} capitalize`}>
                                {lead.status}
                              </span>
                              {lead.value > 0 && (
                                <span className="text-green-400 text-xs font-bold">{formatCurrency(lead.value)}</span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.whatsapp}</span>
                              {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.email}</span>}
                              <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {lead.source}</span>
                              {lead.plan_interest && <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {lead.plan_interest}</span>}
                              <span className="text-gray-500">{timeAgo(lead.created_at)}</span>
                            </div>
                            {lead.notes && <p className="text-gray-500 text-xs mt-2">{lead.notes}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-all">
                              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                            {lead.status === 'new' && (
                              <button onClick={() => handleUpdateLeadStatus(lead.id, 'qualified')} disabled={leadLoading}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 text-xs font-medium transition-all">
                                Qualify
                              </button>
                            )}
                            {lead.status === 'qualified' && (
                              <button onClick={() => handleUpdateLeadStatus(lead.id, 'proposal')} disabled={leadLoading}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 text-xs font-medium transition-all">
                                Propose
                              </button>
                            )}
                            {lead.status === 'proposal' && (
                              <button onClick={() => handleUpdateLeadStatus(lead.id, 'won')} disabled={leadLoading}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-all">
                                <CheckCircle className="w-3.5 h-3.5" /> Won!
                              </button>
                            )}
                            <button onClick={() => handleUpdateLeadStatus(lead.id, 'lost')} disabled={leadLoading}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all">
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* New Lead Modal */}
                {showNewLead && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowNewLead(false)} />
                    <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-white/10 shadow-2xl p-6">
                      <h3 className="text-white font-bold text-lg mb-4">Add New Lead</h3>
                      <form onSubmit={handleCreateLead} className="space-y-4">
                        <div>
                          <label className="block text-gray-400 text-xs mb-1.5">Name *</label>
                          <input value={newLead.name} onChange={e => setNewLead(p => ({ ...p, name: e.target.value }))} required
                            className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-white outline-none focus:border-green-400 text-sm" placeholder="Customer name" />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-xs mb-1.5">WhatsApp *</label>
                          <input value={newLead.whatsapp} onChange={e => setNewLead(p => ({ ...p, whatsapp: e.target.value }))} required
                            className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-white outline-none focus:border-green-400 text-sm" placeholder="+212 6XX XXX XXX" />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-xs mb-1.5">Email</label>
                          <input value={newLead.email} onChange={e => setNewLead(p => ({ ...p, email: e.target.value }))}
                            className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-white outline-none focus:border-green-400 text-sm" placeholder="email@example.com" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-400 text-xs mb-1.5">Plan Interest</label>
                            <select value={newLead.plan_interest} onChange={e => setNewLead(p => ({ ...p, plan_interest: e.target.value }))}
                              className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-white outline-none focus:border-green-400 text-sm">
                              <option value="">Select plan</option>
                              <option value="Monthly">Monthly $9.99</option>
                              <option value="3 Months">3 Months $19.99</option>
                              <option value="Yearly">Yearly $49.99</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-400 text-xs mb-1.5">Value ($)</label>
                            <input type="number" value={newLead.value} onChange={e => setNewLead(p => ({ ...p, value: e.target.value }))}
                              className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-white outline-none focus:border-green-400 text-sm" placeholder="0" />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => setShowNewLead(false)}
                            className="flex-1 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-white text-sm font-medium transition-all">
                            Cancel
                          </button>
                          <button type="submit"
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold transition-all hover:scale-[1.02]">
                            Create Lead
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== ARTICLES TAB ===== */}
            {activeTab === 'articles' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Articles</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage blog content</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={loadArticles} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-white text-sm transition-all">
                      <RefreshCw className={`w-4 h-4 ${articleLoading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <button onClick={() => { setActiveTab('dashboard'); loadDashboard(); }}
                      className="px-4 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-white text-sm transition-all">
                      ← Back
                    </button>
                  </div>
                </div>

                {/* Article Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/30 border border-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-400">{pendingArticles.length}</p>
                    <p className="text-gray-500 text-xs mt-1">Pending Review</p>
                  </div>
                  <div className="bg-slate-800/30 border border-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-400">{publishedArticles.length}</p>
                    <p className="text-gray-500 text-xs mt-1">Published</p>
                  </div>
                </div>

                {/* Pending Articles */}
                {pendingArticles.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold text-sm mb-3">Pending Review</h3>
                    <div className="space-y-3">
                      {pendingArticles.map(article => (
                        <div key={article.id} className="bg-slate-800/30 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                          <div className="flex items-start gap-4">
                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                              <img src={article.coverImage || 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=200'} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-medium border border-yellow-500/20">Pending</span>
                                <span className="text-gray-500 text-xs">{CATEGORY_ICONS[article.categoryId] || '📰'} {CATEGORY_NAMES[article.categoryId] || 'News'}</span>
                                <span className="text-gray-500 text-xs">{timeAgo(article.createdAt)}</span>
                              </div>
                              <h4 className="text-white font-bold text-sm mb-1">{article.title}</h4>
                              <p className="text-gray-400 text-xs line-clamp-2">{article.excerpt}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                            <button onClick={() => handleApproveArticle(article.id)} disabled={actionLoading === article.id}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-all disabled:opacity-50">
                              {actionLoading === article.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              Publish
                            </button>
                            <button onClick={() => handleRejectArticle(article.id)} disabled={actionLoading === article.id}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all disabled:opacity-50">
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                            <Link href={`/${locale}/blog/${article.slug}`} target="_blank"
                              className="p-2 rounded-xl bg-slate-800/50 border border-white/10 text-gray-500 hover:text-white transition-all">
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Published Articles */}
                {publishedArticles.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold text-sm mb-3">Published ({publishedArticles.length})</h3>
                    <div className="space-y-2">
                      {publishedArticles.map(article => (
                        <div key={article.id} className="flex items-center justify-between p-4 bg-slate-800/30 border border-white/5 rounded-xl hover:border-green-500/20 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                              <img src={article.coverImage || 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=100'} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-white font-medium text-sm truncate">{article.title}</h4>
                              <p className="text-gray-500 text-xs">{article.readTime} min · {article.views || 0} views</p>
                            </div>
                          </div>
                          <Link href={`/${locale}/blog/${article.slug}`} target="_blank"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/50 text-gray-400 hover:text-white text-xs transition-all">
                            View <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!articleLoading && pendingArticles.length === 0 && publishedArticles.length === 0 && (
                  <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-white font-bold text-lg mb-2">No Articles Yet</h3>
                    <p className="text-gray-500">Click "Refresh" to load articles from the blog.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
