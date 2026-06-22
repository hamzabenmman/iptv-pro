'use client';

import { useEffect } from 'react';

export default function HtmlLangSetter({
  locale,
  isRtl,
}: {
  locale: string;
  isRtl: boolean;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [locale, isRtl]);

  return null;
}
