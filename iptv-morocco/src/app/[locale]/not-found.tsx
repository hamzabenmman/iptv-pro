'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Home, Newspaper, Search, ArrowLeft, ExternalLink,
  Trophy, Zap, Compass
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RevealAnimation from '@/components/RevealAnimation';
import { updateSEOMeta } from '@/lib/seo-client';

export default function NotFoundPage() {
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === 'ar';
  const [searchQuery, setSearchQuery] = useState('');

  // Update SEO for 404 page
  useEffect(() => {
    updateSEOMeta({
      title: '404 - Page Not Found | IPTV Pro',
      description: 'The page you are looking for does not exist or has been moved. Browse our blog or return home.',
      type: 'website',
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/blog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* Main 404 Section */}
      <section className="relative pt-32 pb-20 min-h-screen flex items-center justify-center">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/3 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />

        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-16 h-16 rounded-2xl bg-brand-500/5 border border-brand-500/10 animate-pulse hidden md:block" />
        <div className="absolute bottom-20 left-20 w-12 h-12 rounded-full bg-brand-500/5 border border-brand-500/10 animate-pulse [animation-delay:1s] hidden md:block" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <RevealAnimation direction="scale">
              {/* Large 404 */}
              <div className="relative mb-8">
                <h1 className="text-[140px] md:text-[200px] font-bold leading-none gradient-text opacity-80 select-none">
                  404
                </h1>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center backdrop-blur-sm mt-8 md:mt-12">
                    <Compass className="w-10 h-10 md:w-14 md:h-14 text-brand-400 animate-pulse" />
                  </div>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Page Not Found
              </h2>

              <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto mb-3">
                The page you&apos;re looking for doesn&apos;t seem to exist.
              </p>
              <p className="text-gray-500 text-sm mb-10 max-w-md mx-auto">
                It might have been moved, deleted, or the URL might be incorrect.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-md mx-auto mb-10">
                <div className="relative">
                  <Search className={`absolute ${isRtl ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500`} />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full bg-dark-800/80 border border-white/10 rounded-2xl py-4 ${isRtl ? 'pr-14 pl-6' : 'pl-14 pr-6'} text-white text-base placeholder-gray-600 focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all`}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-brand-500 to-yellow-600 text-dark-950 rounded-xl font-bold text-xs hover:opacity-90 transition-all"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Navigation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                <Link
                  href={`/${locale}`}
                  className="group p-5 rounded-2xl bg-dark-800/30 border border-white/5 hover:border-brand-500/20 hover:bg-dark-800/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Home className="w-5 h-5 text-brand-400" />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1">Home</h3>
                  <p className="text-gray-500 text-xs">Back to the main page</p>
                </Link>

                <Link
                  href={`/${locale}/blog`}
                  className="group p-5 rounded-2xl bg-dark-800/30 border border-white/5 hover:border-brand-500/20 hover:bg-dark-800/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Newspaper className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1">Blog</h3>
                  <p className="text-gray-500 text-xs">Read latest articles</p>
                </Link>

                <a
                  href="https://wa.me/212670799985"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-5 rounded-2xl bg-dark-800/30 border border-white/5 hover:border-green-500/20 hover:bg-dark-800/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1">Support</h3>
                  <p className="text-gray-500 text-xs">Contact us on WhatsApp</p>
                </a>
              </div>

              {/* Back to blog link */}
              <Link
                href={`/${locale}/blog`}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-brand-400 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>
            </RevealAnimation>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
