'use client';

import { useTranslations } from 'next-intl';
import { Users, Zap, AlarmClock } from 'lucide-react';
import { useState, useEffect } from 'react';
import RevealAnimation from './RevealAnimation';

export default function ScarcityTimer() {
  const t = useTranslations('scarcity');
  const tWhatsapp = useTranslations('whatsapp');

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [remainingSpots, setRemainingSpots] = useState(27);

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    targetDate.setHours(23, 59, 59, 0);

    const calculateTimeLeft = () => {
      const diff = targetDate.getTime() - new Date().getTime();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    const spotTimer = setInterval(() => {
      setRemainingSpots((prev) =>
        prev <= 5 ? prev : Math.max(0, prev - Math.floor(Math.random() * 3 + 1))
      );
    }, Math.random() * 60000 + 30000);

    return () => { clearInterval(timer); clearInterval(spotTimer); };
  }, []);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971000000000';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(tWhatsapp('message'))}`;

  const timeBoxes = [
    { label: t('days'), value: timeLeft.days },
    { label: t('hours'), value: timeLeft.hours },
    { label: t('minutes'), value: timeLeft.minutes },
    { label: t('seconds'), value: timeLeft.seconds },
  ];

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-r from-dark-900 via-dark-950 to-dark-900 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-transparent to-brand-500/5 animate-pulse-slow" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <RevealAnimation>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand-500/10 flex items-center justify-center animate-scale-pulse">
                <AlarmClock className="w-8 h-8 md:w-10 md:h-10 text-brand-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping" />
            </div>
          </div>
        </RevealAnimation>

        <RevealAnimation delay={1}>
          <h2 className="text-kinetic-xl font-extrabold text-white mb-3">{t('title')}</h2>
          <p className="text-fluid-lg text-brand-400 font-bold mb-8">{t('subtitle')}</p>
        </RevealAnimation>

        <RevealAnimation delay={2}>
          <div className="flex items-center justify-center gap-3 mb-8">
            <Users className="w-5 h-5 text-brand-400" />
            <span className="text-fluid-base text-dark-200">
              {t('remaining')}{' '}
              <span className="text-brand-400 font-bold text-2xl md:text-3xl count-up">{remainingSpots}</span>{' '}
              {t('spots')}
            </span>
          </div>
        </RevealAnimation>

        <RevealAnimation delay={3}>
          <p className="text-dark-300 text-fluid-sm mb-4">{t('timer_title')}</p>
          <div className="flex justify-center gap-3 md:gap-4 mb-6">
            {timeBoxes.map((box, i) => (
              <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-16 h-16 md:w-20 md:h-20 glass-gold rounded-2xl flex items-center justify-center border border-brand-500/10 glow-gold">
                  <span className="text-2xl md:text-3xl font-bold gradient-text count-up">
                    {String(box.value).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-dark-400 text-fluid-sm mt-2">{box.label}</p>
              </div>
            ))}
          </div>
        </RevealAnimation>

        <RevealAnimation delay={4}>
          <div className="max-w-md mx-auto mb-8">
            <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-1000"
                style={{ width: `${remainingSpots * 2}%` }}
              />
            </div>
          </div>
        </RevealAnimation>

        <RevealAnimation delay={5}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-dark-950 rounded-xl font-bold text-fluid-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-brand-500/25 animate-glow-pulse ripple-btn"
          >
            <Zap className="w-5 h-5" />
            <span>{t('cta')}</span>
          </a>
        </RevealAnimation>
      </div>
    </section>
  );
}
