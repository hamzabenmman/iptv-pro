'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, ShieldCheck, Send, MessageCircle } from 'lucide-react';
import RevealAnimation from './RevealAnimation';

export default function ContactSection() {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971000000000';
  const buildWhatsappText = () => {
    const lines = [t('whatsapp_prompt')];
    if (formData.name) lines.push(`${t('name_label')}: ${formData.name}`);
    if (formData.email) lines.push(`${t('email_label')}: ${formData.email}`);
    if (formData.message) lines.push(`${t('message_label')}: ${formData.message}`);
    return encodeURIComponent(lines.join('\n'));
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${buildWhatsappText()}`;

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setStatus(t('submitted'));
  };

  return (
    <section id="contact" className="relative py-24 md:py-36 bg-dark-900 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-brand-500/10 blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealAnimation>
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-gold text-brand-400 text-xs font-medium mb-4">
              <MessageCircle size={12} />
              {t('headline')}
            </span>
            <h2 className="text-kinetic-xl font-bold text-white mb-4">{t('title')}</h2>
            <p className="text-fluid-base text-dark-300">{t('subtitle')}</p>
          </div>
        </RevealAnimation>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <RevealAnimation direction="left">
            <div className="glass rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-black/15 border border-white/5">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-white">
                  <Mail className="w-6 h-6 text-brand-400" />
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-brand-400">{t('form_label')}</p>
                    <p className="text-lg font-semibold">{t('form_help')}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-dark-300 text-sm">{t('name_label')}</span>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('name_placeholder')}
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-dark-950/80 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
                      />
                    </label>
                    <label className="block">
                      <span className="text-dark-300 text-sm">{t('email_label')}</span>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('email_placeholder')}
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-dark-950/80 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-dark-300 text-sm">{t('message_label')}</span>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t('message_placeholder')}
                      rows={5}
                      className="mt-2 w-full rounded-[2rem] border border-white/10 bg-dark-950/80 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
                    />
                  </label>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-7 py-3.5 text-sm font-semibold text-dark-950 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-brand-500/25"
                    >
                      <Send className="w-4 h-4" />
                      {t('button')}
                    </button>
                    <p className="text-sm text-dark-400">{t('form_note')}</p>
                  </div>

                  {status && <p className="text-sm text-brand-400">{status}</p>}
                </form>
              </div>
            </div>
          </RevealAnimation>

          <RevealAnimation direction="right">
            <div className="h-full rounded-[2rem] border border-white/5 bg-dark-950/70 p-8 md:p-10 glass">
              <div className="space-y-6">
                <div className="rounded-3xl border border-brand-500/10 bg-brand-500/5 p-6">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-brand-400" />
                    <span className="text-sm font-semibold text-white">{t('trust_title')}</span>
                  </div>
                  <p className="mt-3 text-dark-300 text-sm leading-relaxed">{t('trust_description')}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6 text-brand-400" />
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-brand-400">{t('cta_title')}</p>
                      <p className="text-lg font-semibold text-white">{t('cta_description')}</p>
                    </div>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-semibold text-dark-950 transition-all duration-300 hover:brightness-110"
                  >
                    <MessageCircle className="w-4 h-4 text-dark-950" />
                    {t('whatsapp_button')}
                  </a>
                </div>
              </div>
            </div>
          </RevealAnimation>
        </div>
      </div>
    </section>
  );
}
