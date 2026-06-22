'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Star, Shield, Quote, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import RevealAnimation from './RevealAnimation';

export default function Testimonials() {
  const t = useTranslations('testimonials');
  const locale = useLocale();
  const testimonials = t.raw('items') as Array<{
    name: string; location: string; rating: number; text: string; verified: boolean;
  }>;

  const [currentPage, setCurrentPage] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemsPerPage = 2;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  const displayedTestimonials = testimonials.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Start / restart auto-scroll
  const restartAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000);
  }, [totalPages]);

  useEffect(() => {
    restartAutoScroll();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [restartAutoScroll]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    restartAutoScroll();
  }, [restartAutoScroll]);

  return (
    <section id="testimonials" className="relative py-24 md:py-36 bg-dark-950 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-[120px] animate-morph" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealAnimation>
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-gold text-brand-400 text-xs font-medium mb-4">
              <Sparkles size={12} />
              {t('subtitle')}
            </span>
            <h2 className="text-kinetic-xl font-bold text-white mb-4">{t('title')}</h2>
          </div>
        </RevealAnimation>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6 max-w-4xl mx-auto">
          {displayedTestimonials.map((testimonial, index) => (
            <RevealAnimation key={currentPage * itemsPerPage + index} delay={index + 1} direction={index % 2 === 0 ? 'left' : 'right'}>
              <div className="testimonial-card glass rounded-2xl p-6 md:p-8 border border-white/5 h-full flex flex-col animate-fade-in">
                <Quote className="w-8 h-8 md:w-10 md:h-10 text-brand-500/20 mb-4" />

                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`transition-all duration-300 ${
                        i < testimonial.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-dark-600'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-fluid-sm text-dark-200 leading-relaxed mb-6 italic flex-1">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-dark-950 font-bold text-sm shadow-lg shadow-brand-500/20">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-fluid-sm">{testimonial.name}</p>
                      <p className="text-dark-400 text-fluid-sm">{testimonial.location}</p>
                    </div>
                  </div>
                  {testimonial.verified && (
                    <div className="flex items-center gap-1.5 text-brand-400 text-fluid-sm bg-brand-500/8 px-3 py-1 rounded-full">
                      <Shield size={12} />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </RevealAnimation>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => goToPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-2.5 rounded-xl glass-light text-dark-300 hover:text-brand-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === currentPage ? 'w-8 bg-brand-500 shadow-lg shadow-brand-500/30' : 'w-2 bg-dark-600 hover:bg-dark-400'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => goToPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-2.5 rounded-xl glass-light text-dark-300 hover:text-brand-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
