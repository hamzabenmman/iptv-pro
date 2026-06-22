'use client';

import { useTranslations } from 'next-intl';
import { Tv, Monitor, Server, Smartphone, HeadphonesIcon, Film, CheckCircle2, Sparkles } from 'lucide-react';
import RevealAnimation from './RevealAnimation';

const featureIcons = [Tv, Film, Server, Smartphone, HeadphonesIcon, Monitor];

export default function FeaturesSection() {
  const t = useTranslations('features');
  const features = t.raw('items') as Array<{ title: string; description: string }>;

  return (
    <section id="features" className="relative py-24 md:py-36 bg-dark-950 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand-500/5 rounded-full blur-[150px] animate-pulse-slow" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <RevealAnimation>
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-gold text-brand-400 text-xs font-medium mb-4">
              <Sparkles size={12} />
              Premium Features
            </span>
            <h2 className="text-kinetic-xl font-bold text-white mb-4">
              {t('title')}
            </h2>
            <p className="text-fluid-base text-dark-300">
              {t('subtitle')}
            </p>
          </div>
        </RevealAnimation>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature, index) => {
            const Icon = featureIcons[index % featureIcons.length];
            return (
              <RevealAnimation key={index} delay={Math.min(index + 1, 5)}>
                <div className="group glass rounded-2xl p-6 md:p-8 card-hover border border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-brand-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-brand-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-fluid-sm text-dark-300 leading-relaxed group-hover:text-dark-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </RevealAnimation>
            );
          })}
        </div>

        {/* Trust indicators */}
        <RevealAnimation delay={2}>
          <div className="mt-14 md:mt-20 flex flex-wrap items-center justify-center gap-5 md:gap-10">
            {[
              { icon: CheckCircle2, text: '+50,000 Clients Worldwide' },
              { icon: CheckCircle2, text: '99.9% Uptime' },
              { icon: CheckCircle2, text: '24/7 Premium Support' },
              { icon: CheckCircle2, text: '5min Setup' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-dark-300 text-fluid-sm hover:text-brand-400 transition-colors duration-300">
                <item.icon size={16} className="text-brand-400 shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </RevealAnimation>
      </div>
    </section>
  );
}
