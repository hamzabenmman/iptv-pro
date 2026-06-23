'use client';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { X, Sparkles, Zap, Clock, CheckCircle, Users } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

const durations = ['6h', '12h', '1d'] as const;

export default function FreeTrialForm() {
  const t = useTranslations('trial');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', whatsapp: '', duration: '24h' });
  const [submitted, setSubmitted] = useState(false);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '212XXXXXXXXX';

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
      {/* FLOATING BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 md:bottom-32 right-4 md:right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-full font-bold text-sm shadow-2xl shadow-green-500/40 transition-all duration-300 hover:scale-110 animate-pulse"
        aria-label={t('cta')}
      >
        <Sparkles size={16} className="animate-spin" />
        <span className="hidden sm:inline">{t('cta')}</span>
        <span className="sm:hidden">{t('cta')}</span>
      </button>

      {/* COUNTER */}
      <div className="fixed bottom-20 md:bottom-24 right-4 md:right-6 z-50">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-green-500/20 text-xs text-gray-400 shadow-lg backdrop-blur-sm">
          <Users size={12} className="text-green-400" />
          <span>
            <AnimatedCounter target={1247} duration={2000} className="text-green-400 font-bold" />
            <span className="hidden sm:inline"> {t('people_tried')}</span>
            <span className="sm:hidden"> {t('trials')}</span>
          </span>
        </div>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
          <div className={`relative w-full max-w-md bg-slate-900 rounded-3xl border border-green-500/10 shadow-2xl shadow-black/50 overflow-hidden ${isRtl ? 'text-right' : 'text-left'}`}>
            <button onClick={handleClose} className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all`}>
              <X size={18} />
            </button>
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{t('title')}</h3>
                  <p className="text-xs text-gray-500">{t('subtitle')}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                <Users size={14} className="text-green-400" />
                <span className="text-xs text-gray-400">
                  <AnimatedCounter target={1247} duration={2000} className="text-green-400 font-bold" /> {t('people_tried_today')}
                </span>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent my-5" />

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-white font-bold text-lg">✅ {t('whatsapp_opened')}</p>
                  <p className="text-gray-500 text-xs mt-2">{t('check_whatsapp')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">{t('name_label')}</label>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder={t('name_placeholder')} required
                      className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-sm" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">{t('whatsapp_label')}</label>
                    <div className="relative">
                      <span className={`absolute inset-y-0 ${isRtl ? 'right-4' : 'left-4'} flex items-center`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/>
                          <path d="M9 10a.5.5 0 0 0 0 1"/><path d="M12 10a.5.5 0 0 0 0 1"/><path d="M15 10a.5.5 0 0 0 0 1"/>
                        </svg>
                      </span>
                      <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder={t('whatsapp_placeholder')} required dir="ltr"
                        className={`w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-sm ${isRtl ? 'pr-12' : 'pl-12'}`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">{t('duration_label')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {durations.map((d) => {
                        const isActive = formData.duration === d;
                        return (
                          <button key={d} type="button" onClick={() => setFormData(prev => ({ ...prev, duration: d }))}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-sm ${isActive ? 'border-green-500 bg-green-500/10 text-green-400 shadow-lg' : 'border-white/10 bg-slate-800/50 text-gray-500 hover:border-green-500/30 hover:text-white'}`}>
                            <Clock size={14} className={isActive ? 'text-green-400' : 'text-gray-600'} />
                            <span className="font-medium">{t(`durations.${d}`)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-bold text-sm transition-all hover:scale-[1.02] shadow-lg shadow-green-500/30">
                    <Zap size={16} />
                    <span>{t('submit')}</span>
                  </button>
                  <p className="text-center text-gray-600 text-xs">{t('guarantee')}</p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}