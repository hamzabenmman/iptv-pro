'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { CheckCircle, XCircle, Eye, Clock, ExternalLink, Shield } from 'lucide-react';

type Backlink = {
  id: string;
  url: string;
  domain: string;
  anchorText: string;
  description: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
};

const SAMPLE_BACKLINKS: Backlink[] = [];

export default function BacklinksPage() {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [form, setForm] = useState({ url: '', domain: '', anchorText: '', description: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [backlinks] = useState<Backlink[]>(SAMPLE_BACKLINKS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In production: call API to submit backlink for review
    setTimeout(() => {
      setSubmitted(false);
      setForm({ url: '', domain: '', anchorText: '', description: '', email: '' });
    }, 3000);
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch { return ''; }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4 border border-green-500/20">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Submit Your Backlink
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              We accept quality backlinks from relevant websites. All submissions are reviewed manually to ensure the highest quality standards.
            </p>
          </div>

          {/* Guidelines */}
          <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4">Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Relevant Content</p>
                  <p className="text-gray-500 text-xs">Sports, entertainment, or technology websites</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Quality Domain</p>
                  <p className="text-gray-500 text-xs">Good domain authority and traffic</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">No Spam</p>
                  <p className="text-gray-500 text-xs">Links from spam or low-quality sites will be rejected</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">No Irrelevant Links</p>
                  <p className="text-gray-500 text-xs">Casino, gambling, or adult sites will be rejected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Form */}
          {submitted ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Backlink Submitted!</h3>
              <p className="text-gray-400">Our team will review your submission and get back to you.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 md:p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 font-medium">Website URL *</label>
                  <input name="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value, domain: extractDomain(e.target.value) })}
                    placeholder="https://example.com"
                    className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-sm"
                    required />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 font-medium">Domain *</label>
                  <input name="domain" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}
                    placeholder="example.com"
                    className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-sm"
                    required />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 font-medium">Anchor Text</label>
                <input name="anchorText" value={form.anchorText} onChange={(e) => setForm({ ...form, anchorText: e.target.value })}
                  placeholder="Best IPTV Service 2026"
                  className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-sm" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 font-medium">Description</label>
                <textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Tell us about your website and why you want a backlink..."
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 font-medium">Your Email (optional)</label>
                <input name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-sm" />
              </div>
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-bold text-sm transition-all hover:scale-[1.02] shadow-lg shadow-green-500/30">
                <ExternalLink className="w-4 h-4" />
                Submit for Review
              </button>
              <p className="text-center text-gray-600 text-xs">
                All submissions are manually reviewed. Approved backlinks will be dofollow.
              </p>
            </form>
          )}

          {/* Previously Approved */}
          {backlinks.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-bold text-white mb-4">Approved Backlinks</h2>
              <div className="space-y-3">
                {backlinks.filter(b => b.status === 'approved').map(b => (
                  <a key={b.id} href={b.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-slate-800/30 border border-white/5 rounded-xl hover:border-green-500/20 transition-all group">
                    <div>
                      <p className="text-white text-sm group-hover:text-green-400 transition-colors">{b.domain}</p>
                      {b.anchorText && <p className="text-gray-500 text-xs mt-0.5">{b.anchorText}</p>}
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Back to home */}
          <div className="text-center mt-8">
            <Link href={`/${locale}/blog`} className="text-gray-500 hover:text-green-400 text-sm transition-colors">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
