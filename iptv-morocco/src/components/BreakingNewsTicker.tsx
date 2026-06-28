'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { TrendingUp, ChevronRight, Zap } from 'lucide-react';

interface BreakingItem {
  title: string;
  slug: string;
  category: string;
}

interface BreakingNewsTickerProps {
  items: BreakingItem[];
}

export default function BreakingNewsTicker({ items }: BreakingNewsTickerProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [isPaused, setIsPaused] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Auto-rotate through headlines
  useEffect(() => {
    if (isPaused || items.length <= 1) return;

    const interval = setInterval(() => {
      setVisibleIndex(prev => (prev + 1) % items.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  if (!items || items.length === 0) return null;

  const current = items[visibleIndex];

  return (
    <div
      ref={tickerRef}
      className="relative overflow-hidden bg-gradient-to-r from-brand-500/10 via-dark-900 to-brand-500/10 border-y border-brand-500/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center h-10 md:h-12">
          {/* Breaking badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/20 flex-shrink-0 mr-3">
            <Zap className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Breaking</span>
          </div>

          {/* Ticker items - sliding animation */}
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
            <Link
              href={`/${locale}/blog/${current.slug}`}
              className="inline-flex items-center gap-2 text-sm text-gray-200 hover:text-brand-400 transition-colors animate-fade-in truncate max-w-full group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 animate-pulse" />
              <span className="truncate font-medium">{current.title}</span>
              <ChevronRight className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {/* Dot indicators */}
            {items.length > 1 && (
              <div className="flex items-center gap-1 ml-auto pl-4 flex-shrink-0">
                {items.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setVisibleIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === visibleIndex
                        ? 'w-4 bg-brand-400'
                        : 'w-1.5 bg-gray-600 hover:bg-gray-400'
                    }`}
                  />
                ))}
                {items.length > 5 && (
                  <span className="text-[10px] text-gray-500 ml-1">
                    +{items.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Trending tag */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/10 flex-shrink-0 ml-3">
            <TrendingUp className="w-3 h-3 text-brand-400" />
            <span className="text-[10px] font-semibold text-brand-400">Live</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
