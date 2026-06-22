'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'it', name: 'Italiano', dir: 'ltr' },
  { code: 'pt', name: 'Português', dir: 'ltr' },
  { code: 'nl', name: 'Nederlands', dir: 'ltr' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'zh', name: '中文', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr' },
];

export default function Navbar() {
  const t = useTranslations('nav');
  const tLanguage = useTranslations('language');
  const tWhatsapp = useTranslations('whatsapp');
  const locale = useLocale();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsMenuOpen(false); setIsLangOpen(false); }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const currentLang = languages.find(l => l.code === locale) || languages[0];
  const isRtl = locale === 'ar';

  const navItems = [
    { key: 'features', href: '#features' },
    { key: 'pricing', href: '#pricing' },
    { key: 'testimonials', href: '#testimonials' },
    { key: 'faq', href: '#faq' },
  ];

  // Sync cookie with current locale on mount so refresh respects it
  useEffect(() => {
    const cookie = `NEXT_LOCALE=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    document.cookie = cookie;
    try { localStorage.setItem('NEXT_LOCALE', locale); } catch {}
  }, [locale]);

  const handleLanguageChange = useCallback((code: string) => {
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    try { localStorage.setItem('NEXT_LOCALE', code); } catch {}
    const newPath = code === 'ar' ? '/' : `/${code}`;
    router.push(newPath);
    setIsLangOpen(false);
  }, [router]);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971000000000';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(tWhatsapp('message'))}`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass-deep shadow-lg shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-bold text-dark-950 text-sm md:text-base transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-brand-500/30 trophy-glow">
              P
            </div>
            <span className="text-lg md:text-xl font-bold text-white tracking-tight">
              IPTV <span className="gradient-text">Pro</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="relative px-4 py-2 text-dark-300 hover:text-brand-400 transition-all duration-300 text-sm font-medium rounded-lg hover:bg-brand-500/5 group ripple-btn"
              >
                {t(item.key as any)}
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-brand-400 to-brand-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-light text-dark-200 hover:text-brand-400 hover:bg-white/5 transition-all duration-300 text-sm border border-brand-500/10"
                aria-label={tLanguage('label')}
              >
                <Globe size={15} />
                <span className="hidden sm:inline">{currentLang.name}</span>
                <ChevronDown
                  size={11}
                  className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                  <div
                    className={`absolute top-full mt-2 ${
                      isRtl ? 'left-0' : 'right-0'
                    } z-50 w-44 glass-deep border border-brand-500/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 animate-fade-in-scale`}
                  >
                    <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all duration-200 flex items-center gap-2.5 ${
                            lang.code === locale
                              ? 'text-brand-400 bg-brand-500/10 font-medium'
                              : 'text-dark-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                              lang.code === locale
                                ? 'bg-brand-500 text-dark-950 scale-110'
                                : 'bg-dark-700 text-dark-400'
                            }`}
                          >
                            {lang.code === locale ? '✓' : ''}
                          </span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Desktop WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-dark-950 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-brand-500/25 pulse-ring-gold ripple-btn"
            >
              <i className="fab fa-whatsapp text-lg" />
              <span>{tWhatsapp('button')}</span>
            </a>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl glass-light text-dark-300 hover:text-brand-400 hover:bg-white/5 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} className="animate-fade-in" /> : <Menu size={20} className="animate-fade-in" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-400 overflow-hidden ${
          isMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="glass-deep border-t border-brand-500/10 mx-4 mb-4 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
          <div className="p-3 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-dark-200 hover:text-brand-400 hover:bg-white/5 transition-all duration-200 text-sm font-medium"
              >
                {t(item.key as any)}
              </a>
            ))}
            <div className="h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent my-2" />
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-dark-950 rounded-xl font-bold text-sm transition-all duration-300"
            >
              <i className="fab fa-whatsapp text-lg" />
              <span>{tWhatsapp('button')}</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
