'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import RevealAnimation from './RevealAnimation';

export default function FAQ() {
  const t = useTranslations('faq');
  const faqItems = t.raw('items') as Array<{ question: string; answer: string }>;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-24 md:py-36 bg-dark-900 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] animate-morph" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealAnimation>
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-gold text-brand-400 text-xs font-medium mb-4">
              <Sparkles size={12} />
              FAQ
            </span>
            <h2 className="text-kinetic-xl font-bold text-white mb-4">{t('title')}</h2>
            <p className="text-fluid-base text-dark-300">{t('subtitle')}</p>
          </div>
        </RevealAnimation>

        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <RevealAnimation key={index} delay={Math.min(index + 1, 5)}>
                <div
                  className={`glass rounded-2xl overflow-hidden transition-all duration-400 ${
                    isOpen ? 'border-brand-500/30 shadow-lg shadow-brand-500/5' : 'border border-white/5'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full flex items-center justify-between px-6 py-4 md:py-5 text-left transition-colors duration-200 hover:bg-white/5 ripple-btn"
                    aria-expanded={isOpen}
                  >
                    <span className="text-white font-medium text-fluid-base flex items-start gap-3">
                      <HelpCircle size={18} className={`text-brand-400 shrink-0 mt-0.5 transition-transform duration-300 ${isOpen ? 'rotate-12' : ''}`} />
                      <span>{item.question}</span>
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-dark-400 shrink-0 transition-all duration-300 ${
                        isOpen ? 'rotate-180 text-brand-400' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-400 ease-in-out ${
                      isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-4 md:pb-5">
                      <div className="pl-9 md:pl-10">
                        <p className="text-dark-300 text-fluid-sm leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealAnimation>
            );
          })}
        </div>
      </div>
    </section>
  );
}
