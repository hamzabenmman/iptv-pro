'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Tv, Smartphone, Monitor, Tablet, Radio, Youtube,
  CheckCircle, Sparkles, ChevronRight, HeadphonesIcon
} from 'lucide-react';
import RevealAnimation from './RevealAnimation';

const devices = [
  { key: 'android_tv', icon: Tv },
  { key: 'smart_tv', icon: Monitor },
  { key: 'iphone', icon: Tablet },
  { key: 'android', icon: Smartphone },
  { key: 'pc', icon: Monitor },
  { key: 'firestick', icon: Radio },
] as const;

export default function InstallationGuide() {
  const t = useTranslations('guide');
  const tNav = useTranslations('nav');
  const tWhatsapp = useTranslations('whatsapp');
  const [activeDevice, setActiveDevice] = useState(0);

  const steps = t.raw('steps') as Array<{ title: string; desc: string }>;

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971000000000';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(tWhatsapp('message'))}`;

  const DeviceIcon = devices[activeDevice].icon;

  return (
    <section id="guide" className="relative py-24 md:py-36 bg-dark-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealAnimation>
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-gold text-brand-400 text-xs font-medium mb-4">
              <Youtube size={12} />
              {tNav('guide')}
            </span>
            <h2 className="text-kinetic-xl font-bold text-white mb-4">{t('title')}</h2>
            <p className="text-fluid-base text-dark-300">{t('subtitle')}</p>
          </div>
        </RevealAnimation>

        {/* Device Tabs */}
        <RevealAnimation delay={1}>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {devices.map((device, index) => {
              const Icon = device.icon;
              const isActive = activeDevice === index;
              return (
                <button
                  key={device.key}
                  onClick={() => setActiveDevice(index)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 text-fluid-sm font-medium ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-lg shadow-brand-500/10'
                      : 'glass-light text-dark-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-brand-400' : 'text-dark-400'} />
                  <span>{t(`tabs.${device.key}`)}</span>
                </button>
              );
            })}
          </div>
        </RevealAnimation>

        {/* Steps */}
        <div className="max-w-3xl mx-auto">
          <RevealAnimation delay={2}>
            <div className="glass rounded-3xl p-6 md:p-8 border border-white/5">
              {/* Device Header */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center animate-float-3d">
                  <DeviceIcon className="w-7 h-7 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white">
                    {t(`tabs.${devices[activeDevice].key}`)}
                  </h3>
                  <p className="text-fluid-sm text-dark-400">{steps.length} étapes simples</p>
                </div>
              </div>

              {/* Step List */}
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex gap-4 group"
                    style={{ animation: `fadeInUp 0.6s ${0.3 + index * 0.1}s both` }}
                  >
                    {/* Step Number */}
                    <div className="relative flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-dark-950 font-bold text-sm shadow-lg shadow-brand-500/20 shrink-0">
                        {index + 1}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-[1px] flex-1 min-h-[24px] bg-gradient-to-b from-brand-500/30 to-transparent mt-1" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 pb-6 group-last:pb-0">
                      <h4 className="text-white font-semibold text-fluid-base mb-1.5 group-hover:text-brand-400 transition-colors duration-300">
                        {step.title}
                      </h4>
                      <p className="text-dark-400 text-fluid-sm leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    <CheckCircle size={16} className="text-brand-500/30 mt-2 shrink-0 group-hover:text-brand-400 transition-all duration-300" />
                  </div>
                ))}
              </div>
            </div>
          </RevealAnimation>

          {/* Need Help */}
          <RevealAnimation delay={4} className="mt-6">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl glass-gold border border-brand-500/10 text-white font-medium text-fluid-base transition-all duration-300 hover:bg-brand-500/10 hover:scale-[1.01] group"
            >
              <HeadphonesIcon size={18} className="text-brand-400 group-hover:animate-bounce-slow" />
              <span>{t('need_help')}</span>
              <ChevronRight size={16} className="text-brand-400 group-hover:translate-x-1 transition-transform" />
            </a>
          </RevealAnimation>
        </div>
      </div>
    </section>
  );
}
