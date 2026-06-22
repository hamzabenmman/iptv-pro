'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Tv, Monitor, HeadphonesIcon, ChevronDown, Sparkles, Trophy, Zap, Globe } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Hero() {
  const t = useTranslations('hero');
  const tWhatsapp = useTranslations('whatsapp');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const particlesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // 3D floating gold particles with enhanced physics
    const container = particlesRef.current;
    if (!container) return;

    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 3 + 1.5;
      p.className = 'absolute rounded-full';
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = `radial-gradient(circle at 30% 30%, #FFD700, #D4AF37)`;
      p.style.boxShadow = `0 0 ${size * 4}px rgba(212, 175, 55, 0.6), 0 0 ${size * 8}px rgba(212, 175, 55, 0.2)`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.opacity = `${Math.random() * 0.4 + 0.15}`;
      p.style.animation = `float3d ${Math.random() * 8 + 6}s ease-in-out infinite`;
      p.style.animationDelay = `${Math.random() * 6}s`;
      p.style.willChange = 'transform';
      container.appendChild(p);
      particles.push(p);
    }

    return () => particles.forEach(p => p.remove());
  }, []);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971000000000';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(tWhatsapp('message'))}`;

  const stats = [
    { key: 'channels', icon: Tv, value: t('stats.channels') },
    { key: 'quality', icon: Monitor, value: t('stats.quality') },
    { key: 'servers', icon: Zap, value: t('stats.servers') },
    { key: 'support', icon: HeadphonesIcon, value: t('stats.support') },
  ];

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden bg-dark-950">
      {/* Background Layers */}
      <div className="absolute inset-0 wc-grid opacity-60" />
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />

      {/* Morphing Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-brand-500/15 rounded-full blur-[120px] animate-morph" />
      <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-brand-500/10 rounded-full blur-[120px] animate-morph" style={{ animationDelay: '-3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-500/5 rounded-full blur-[150px] animate-pulse-slow" />

      {/* Trophy Line Decor */}
      <div className="absolute top-1/3 left-0 w-24 h-[1px] bg-gradient-to-r from-transparent to-brand-500/40 hidden md:block" />
      <div className="absolute top-1/3 right-0 w-24 h-[1px] bg-gradient-to-l from-transparent to-brand-500/40 hidden md:block" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 w-full">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge - Animated */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold text-brand-400 text-xs sm:text-sm font-medium mb-6 md:mb-8 border border-brand-500/20 animate-fade-in-up">
            <Trophy size={14} className="text-brand-400 animate-scale-pulse" />
            <span>{t('badge')}</span>
          </div>

          {/* Kinetic Headline */}
          <h1 className="text-kinetic-hero font-extrabold text-white leading-[1.05] mb-6 text-shadow-gold kinetic-text">
            <span className="gradient-text">{t('title')}</span>
          </h1>

          {/* Gold Divider */}
          <div className="trophy-line mb-6 animate-fade-in-scale" style={{ animationDelay: '0.15s' }} />

          {/* Subtitle */}
          <p className="text-kinetic-lg font-bold text-white/90 mb-4" style={{ animation: 'fadeInUp 0.8s 0.2s both' }}>
            {t('subtitle')}
          </p>

          {/* Description */}
          <p className="text-fluid-base text-dark-300 max-w-2xl mx-auto mb-8 md:mb-10" style={{ animation: 'fadeInUp 0.8s 0.3s both' }}>
            {t('description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 md:mb-16" style={{ animation: 'fadeInUp 0.8s 0.4s both' }}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-dark-950 rounded-xl font-bold text-fluid-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 glow-gold overflow-hidden ripple-btn"
            >
              <i className="fab fa-whatsapp text-2xl" />
              <span>{t('cta')}</span>
              <ChevronDown className="hidden sm:block w-5 h-5 group-hover:translate-x-1 transition-transform -rotate-90" />
            </a>
            <a
              href="#pricing"
              className="group flex items-center gap-2 px-8 py-4 glass-light hover:bg-white/5 text-white rounded-xl font-medium text-fluid-lg transition-all duration-300 hover:scale-105 border border-brand-500/20"
            >
              <span>{t('secondary_cta')}</span>
              <ChevronDown className={`w-5 h-5 group-hover:translate-y-1 transition-transform ${isRtl ? 'rotate-90' : ''}`} />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5" style={{ animation: 'fadeInUp 0.8s 0.5s both' }}>
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.key}
                  className="glass-gold rounded-2xl p-4 md:p-5 hover:bg-brand-500/8 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group"
                  style={{ animationDelay: `${0.5 + i * 0.1}s` }}
                >
                  <Icon className="w-6 h-6 md:w-7 md:h-7 text-brand-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-fluid-sm font-bold text-white">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-brand-500/40 animate-bounce-slow">
        <Globe size={16} />
      </div>
    </section>
  );
}
