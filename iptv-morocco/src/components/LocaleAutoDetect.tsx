'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

const SUPPORTED_LOCALES = [
  'ar', 'fr', 'en', 'es', 'de', 'it', 'pt', 'nl', 'ru', 'zh', 'tr',
];

export default function LocaleAutoDetect() {
  const router = useRouter();
  const currentLocale = useLocale();

  useEffect(() => {
    // Check if user has a saved locale preference
    const savedLocale = typeof window !== 'undefined' ? localStorage.getItem('NEXT_LOCALE') : null;
    if (savedLocale) return; // User has preference, don't auto-detect

    // Get browser language
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    
    // Check if browser language is supported
    const isSupported = SUPPORTED_LOCALES.includes(browserLang);
    
    // If browser language is different from current locale and is supported, redirect
    if (isSupported && browserLang !== currentLocale) {
      const newPath = browserLang === 'ar' ? '/' : `/${browserLang}`;
      router.push(newPath);
    }
  }, [currentLocale, router]);

  return null;
}
