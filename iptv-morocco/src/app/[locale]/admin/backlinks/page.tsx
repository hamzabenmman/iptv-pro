'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Shield, CheckCircle, XCircle, ExternalLink, Search, ArrowUpDown, Globe } from 'lucide-react';

type Backlink = {
  id: string; url: string; domain: string; anchorText: string; description: string; email: string;
  status: 'pending' | 'approved' | 'rejected'; isDofollow: boolean; pageScore: number; submittedAt: string;
};

const MOCK_BACKLINKS: Backlink[] = [];

export default function AdminBacklinksPage() {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [backlinks, setBacklinks] = useState<Backlink[]>(MOCK_BACKLINKS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const filtered = backlinks.filter(b => filter === 'all' || b.status === filter);

  const handleApprove = (id: string) => {
    setBacklinks(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' as const } : b));
  };
  const handleReject = (id: string) => {
    setBacklinks(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected' as const } : b));
  };

  const stats = {
    total: backlinks.length,
    pending: backlinks.filter(b => b.status === 'pending').length,
    approved: backlinks.filter(b => b.status === 'approved').length,
    rejected: backlinks.filter(b => b.status === 'rejected').length,
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-xs font-medium tracking-wider uppercase">Admin</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Backlink Moderation</h1>
              <p className="text-gray-500 text-sm mt-1">Review and manage incoming backlink requests</p>
            </div>
            <Link href={`/${locale}/blog`}
              className="px-4 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-gray-400 hover:text-white text-sm transition-all">
              ← Back to Blog
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, color: 'text-white' },
              { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
              { label: 'Approved', value: stats.approved, color: 'text-green-400' },
              { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-800/30 border border-white/5 rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {(['pending', 'all', 'approved', 'rejected'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all capitalize whitespace-nowrap ${
                  filter === f ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-800/50 text-gray-400 hover:text-white border border-white/5'
                }`}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>

          {/* Backlinks Table */}
          {filtered.length === 0 ? (
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">All Clear</h3>
              <p className="text-gray-500">No {filter} backlinks to review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(bl => (
                <div key={bl.id} className="bg-slate-800/30 border border-white/5 rounded-xl p-4 md:p-5 hover:border-white/10 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <a href={bl.url} target="_blank" rel="noopener noreferrer"
                          className="text-white font-medium hover:text-green-400 transition-colors truncate">
                          {bl.domain}
                        </a>
                        {bl.isDofollow && (
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-medium border border-green-500/20">
                            dofollow
                          </span>
                        )}
                      </div>
                      {bl.anchorText && <p className="text-gray-400 text-sm truncate">Anchor: &ldquo;{bl.anchorText}&rdquo;</p>}
                      {bl.description && <p className="text-gray-500 text-xs mt-1 line-clamp-1">{bl.description}</p>}
                      <p className="text-gray-600 text-[10px] mt-1.5">
                        Submitted: {new Date(bl.submittedAt).toLocaleDateString()}
                        {bl.email && ` • ${bl.email}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {bl.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(bl.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-all">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button onClick={() => handleReject(bl.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all">
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      {bl.status === 'approved' && (
                        <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 text-green-400 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approved
                        </span>
                      )}
                      {bl.status === 'rejected' && (
                        <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" />
                          Rejected
                        </span>
                      )}
                      <a href={bl.url} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-800/50 border border-white/10 text-gray-500 hover:text-white transition-all">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
