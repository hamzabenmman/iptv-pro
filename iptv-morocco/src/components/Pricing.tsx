'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Check, Star, Sparkles, Zap } from 'lucide-react';
import RevealAnimation from './RevealAnimation';

export default function Pricing() {
  const t = useTranslations('pricing');
  const tWhatsapp = useTranslations('whatsapp');
  const locale = useLocale();
  const plans = t.raw('plans') as Array<{
    name: string; price: string; currency: string; period: string;
    original_price: string; features: string[];
  }>;

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971000000000';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(tWhatsapp('message'))}`;

  return (
    <section id="pricing" className="relative py-24 md:py-36 bg-dark-900 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealAnimation>
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-gold text-brand-400 text-xs font-medium mb-4">
              <Zap size={12} />
              {t('best_value')}
            </span>
            <h2 className="text-kinetic-xl font-bold text-white mb-4">{t('title')}</h2>
            <p className="text-fluid-base text-dark-300">{t('subtitle')}</p>
          </div>
        </RevealAnimation>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const isPopular = index === 1;
            const isBestValue = index === 2;
            const savings = plan.original_price && plan.price
              ? Math.round((1 - parseFloat(plan.price) / parseFloat(plan.original_price)) * 100)
              : 0;

            return (
              <RevealAnimation key={index} delay={index + 1} direction={index === 0 ? 'left' : index === 2 ? 'right' : 'scale'}>
                <div
                  className={`relative glass rounded-3xl p-6 md:p-8 card-hover flex flex-col transition-all duration-500 ${
                    isPopular
                      ? 'gradient-border scale-[1.02] md:scale-110 z-10'
                      : 'border border-white/5'
                  }`}
                >
                  {/* Badges */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-brand-400 to-brand-600 text-dark-950 text-xs font-bold rounded-full flex items-center gap-1 shadow-lg shadow-brand-500/30 animate-scale-pulse">
                      <Star size={12} fill="currentColor" />
                      {t('popular')}
                    </div>
                  )}
                  {isBestValue && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-brand-400 to-brand-600 text-dark-950 text-xs font-bold rounded-full flex items-center gap-1 shadow-lg shadow-brand-500/30">
                      <Sparkles size={12} />
                      {t('best_value')}
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-white mb-2 mt-2">{plan.name}</h3>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-extrabold text-white">
                        {plan.price}
                      </span>
                      <span className="text-dark-300 text-sm font-medium">{plan.currency}</span>
                    </div>
                    {plan.original_price && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-dark-500 line-through text-sm">{plan.original_price} {plan.currency}</span>
                        {savings > 0 && (
                          <span className="text-brand-400 text-xs font-bold bg-brand-500/10 px-2 py-0.5 rounded-full">
                            -{savings}%
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-dark-400 text-xs mt-1">{plan.period}</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-fluid-sm text-dark-200">
                        <Check size={16} className="text-brand-400 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block text-center py-3.5 px-6 rounded-xl font-bold text-fluid-sm transition-all duration-300 hover:scale-105 ripple-btn ${
                      isPopular
                        ? 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-dark-950 shadow-lg shadow-brand-500/25'
                        : 'glass-light hover:bg-white/10 text-white border border-white/10 hover:border-brand-500/30'
                    }`}
                  >
                    <i className="fab fa-whatsapp mr-2" />
                    {tWhatsapp('button')}
                  </a>
                </div>
              </RevealAnimation>
            );
          })}
        </div>
      </div>
    </section>
  );
}
