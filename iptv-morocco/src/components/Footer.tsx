'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Trophy, Shield } from 'lucide-react';
import RevealAnimation from './RevealAnimation';

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations('footer');
  const tWhatsapp = useTranslations('whatsapp');

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971000000000';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(tWhatsapp('message'))}`;

  const paymentMethods = ['fab fa-cc-visa', 'fab fa-cc-mastercard', 'fab fa-cc-paypal', 'fab fa-cc-amex', 'fab fa-bitcoin'];

  return (
    <>
      {/* Sticky Mobile WhatsApp */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 glass-deep border-t border-brand-500/10">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-dark-950 rounded-xl font-bold text-fluid-sm transition-all duration-300 shadow-lg shadow-brand-500/25 ripple-btn"
        >
          <i className="fab fa-whatsapp text-xl" />
          <span>{tWhatsapp('button')}</span>
        </a>
      </div>

      {/* Floating WhatsApp Desktop */}
      <div className="hidden md:block whatsapp-float">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-dark-950 rounded-full font-bold text-fluid-sm shadow-xl shadow-brand-500/30 transition-all duration-300 hover:scale-105 pulse-ring-gold ripple-btn"
        >
          <i className="fab fa-whatsapp text-xl" />
          <span>{tWhatsapp('button')}</span>
        </a>
      </div>

      <footer className="relative pt-20 pb-28 md:pb-16 bg-dark-950 border-t border-brand-500/10">
        <div className="absolute inset-0 wc-pattern opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealAnimation>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-bold text-dark-950 text-sm shadow-lg shadow-brand-500/20">
                    P
                  </div>
                  <span className="text-lg font-bold text-white tracking-tight">
                    IPTV <span className="gradient-text">Pro</span>
                  </span>
                </div>
                <p className="text-dark-400 text-fluid-sm leading-relaxed">
                  {t('accepted_payments')}
                </p>
                <div className="flex items-center gap-2 mt-4 text-brand-500/40">
                  <Trophy size={14} />
                  <span className="text-fluid-sm">Premium IPTV Service</span>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-fluid-base">Quick Links</h4>
                <ul className="space-y-2">
                  {['Features', 'Pricing', 'Matches', 'Reviews', 'Blog', 'FAQ'].map((link) => {
                    const isPage = link === 'Matches' || link === 'Blog';
                    const href = isPage
                      ? `/${locale}/${link.toLowerCase()}`
                      : `#${link.toLowerCase()}`;
                    return (
                      <li key={link}>
                        <a
                          href={href}
                          className="text-dark-400 hover:text-brand-400 text-fluid-sm transition-colors duration-200 inline-flex items-center gap-1.5 group"
                        >
                          <span className="w-1 h-1 rounded-full bg-brand-500/0 group-hover:bg-brand-500 transition-all duration-200" />
                          {link}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Payment Methods */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-fluid-base">{t('payment_methods')}</h4>
                <div className="flex flex-wrap gap-2.5">
                  {paymentMethods.map((method, i) => (
                    <div
                      key={i}
                      className="w-11 h-8 rounded-xl glass-gold flex items-center justify-center text-dark-300 hover:text-brand-400 hover:bg-brand-500/10 transition-all duration-300 hover:scale-110"
                    >
                      <i className={`${method} text-lg`} />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4 text-dark-500 text-fluid-sm">
                  <Shield size={12} />
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </RevealAnimation>

          <RevealAnimation delay={2}>
            <div className="wc-divider mb-6" />
            <p className="text-center text-dark-500 text-fluid-sm">
              {t('rights')}
            </p>
          </RevealAnimation>
        </div>
      </footer>
    </>
  );
}
