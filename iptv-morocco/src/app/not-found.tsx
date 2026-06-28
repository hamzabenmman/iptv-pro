'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootNotFound() {
  const router = useRouter();

  useEffect(() => {
    // Detect user's preferred language and redirect to locale 404
    const lang = navigator.language || 'en';
    const locale = lang.startsWith('ar') ? 'ar' : lang.startsWith('fr') ? 'fr' : 'en';
    router.replace(`/${locale}/404`);
  }, [router]);

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/5 border border-brand-500/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-2xl font-bold gradient-text">P</span>
        </div>
        <p className="text-gray-400 text-sm">Redirecting...</p>
      </div>
    </div>
  );
}
