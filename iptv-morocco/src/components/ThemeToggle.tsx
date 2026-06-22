'use client';

import { useEffect, useState } from 'react';
import { Moon, SunMedium } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ThemeToggle() {
  const t = useTranslations('theme');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('iptv-theme') : null;
    const preferredTheme = storedTheme === 'light' ? 'light' : 'dark';
    setTheme(preferredTheme);
    document.documentElement.dataset.theme = preferredTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('iptv-theme', nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-xl glass-light text-dark-300 hover:text-brand-400 hover:bg-white/10 transition-all duration-300"
      aria-label={t('toggle')}
    >
      {theme === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}
    </button>
  );
}
