'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { X, Sparkles, Zap, Clock, CheckCircle, Users } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

const durations = ['24h', '48h', '3d'] as const;

export default function FreeTrialForm() {
  const t = useTranslations('trial');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', whatsapp: '', duration: '24h' });
  const [submitted, setSubmitted] = useState(false);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971000000000';

  const buildWhatsappText = () => {
    const lines = [t('whatsapp_prefix')];
    if (formData.name) lines.push(`${t('name_label')}: ${formData.name}`);
    if (formData.whatsapp) lines.push(`${t('whatsapp_label')}: ${formData.whatsapp}`);
    const durationKey = formData.duration as (typeof durations)[number];
    const durationText = t(`durations.${durationKey}`);
    lines.push(`${t('duration_label')}: ${durationText}`);
    return encodeURIComponent(lines.join('\n'));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${buildWhatsappText()}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
    }, 2500);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSubmitted(false);
  };

  return (
    <>
      {/* Floating CTA Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 md:bottom-32 right-4 md:right-6 z-40 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-dark-950 rounded-full font-bold text-sm shadow-xl shadow-brand-500/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-brand-500/40 animate-glow-pulse ripple-btn group"
        aria-label={t('cta')}
      >
        <Sparkles size={16} className="animate-scale-pulse" />
        <span className="hidden sm:inline">{t('cta')}</span>
        <span className="sm:hidden">{t('cta')}</span>
      </button>

      {/* Live Trial Counter */}
      <div className="fixed bottom-20 md:bottom-24 right-4 md:right-6 z-40">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-light border border-brand-500/10 text-fluid-sm text-dark-300 animate-fade-in-up shadow-lg shadow-black/20">
          <Users size={12} className="text-brand-400" />
          <span>
            <AnimatedCounter target={1247} duration={2000} className="text-brand-400 font-bold" />
            <span className="hidden sm:inline"> personnes ont essayé</span>
            <span className="sm:hidden"> essais</span>
          </span>
        </div>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={handleClose}
          />

          {/* Modal */}
          <div
            className={`relative w-full max-w-md glass-deep rounded-3xl border border-brand-500/10 shadow-2xl shadow-black/50 animate-fade-in-scale overflow-hidden ${
              isRtl ? 'text-right' : 'text-left'
            }`}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 rounded-xl text-dark-400 hover:text-white hover:bg-white/5 transition-all duration-200`}
            >
              <X size={18} />
            </button>

            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{t('title')}</h3>
                  <p className="text-fluid-sm text-dark-400">{t('subtitle')}</p>
                </div>
              </div>

              {/* Counter badge */}
              <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-brand-500/8 border border-brand-500/10 mb-4">
                <Users size={14} className="text-brand-400" />
                <span className="text-fluid-sm text-dark-300">
                  <AnimatedCounter target={1247} duration={2000} className="text-brand-400 font-bold" />
                  {' '}personnes ont déjà essayé aujourd&apos;hui
                </span>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent my-5" />

              {submitted ? (
                /* Success state */
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-brand-500/15 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-brand-400" />
                  </div>
                  <p className="text-white font-bold text-lg">✅ WhatsApp ouvert !</p>
                  <p className="text-dark-400 text-fluid-sm mt-2">Vérifie tes messages WhatsApp</p>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-dark-300 text-fluid-sm mb-1.5">{t('name_label')}</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('name_placeholder')}
                      required
                      className="w-full rounded-xl border border-white/10 bg-dark-950/80 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 text-fluid-sm"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-dark-300 text-fluid-sm mb-1.5">{t('whatsapp_label')}</label>
                    <div className="relative">
                      <span className={`absolute inset-y-0 ${isRtl ? 'right-4' : 'left-4'} flex items-center text-dark-400`}>
                        <i className="fab fa-whatsapp text-lg text-whatsapp" />
                      </span>
                      <input
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder={t('whatsapp_placeholder')}
                        required
                        dir="ltr"
                        className={`w-full rounded-xl border border-white/10 bg-dark-950/80 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 text-fluid-sm ${
                          isRtl ? 'pr-12' : 'pl-12'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-dark-300 text-fluid-sm mb-1.5">{t('duration_label')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {durations.map((d) => {
                        const isActive = formData.duration === d;
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, duration: d }))}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-300 text-fluid-sm ${
                              isActive
                                ? 'border-brand-500 bg-brand-500/10 text-brand-400 shadow-lg shadow-brand-500/10'
                                : 'border-white/5 bg-dark-900/50 text-dark-300 hover:border-brand-500/30 hover:text-white'
                            }`}
                          >
                            <Clock size={14} className={isActive ? 'text-brand-400' : 'text-dark-500'} />
                            <span className="font-medium">{t(`durations.${d}`)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-dark-950 rounded-xl font-bold text-fluid-sm transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-brand-500/25 ripple-btn"
                  >
                    <Zap size={16} />
                    <span>{t('submit')}</span>
                  </button>

                  {/* Guarantee */}
                  <p className="text-center text-dark-500 text-fluid-sm">{t('guarantee')}</p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
