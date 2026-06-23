'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CalendarDays, Trophy, MapPin, Clock, Tv, ChevronRight } from 'lucide-react';
import RevealAnimation from './RevealAnimation';

type ApiMatch = {
  title: string;
  competition: string;
  date: string;
  url: string;
  thumbnail: string;
};

type Match = {
  id: string;
  title: string;
  competition: string;
  date: string;
  time: string;
  stadium: string;
  status: 'live' | 'upcoming' | 'ended';
  score?: string;
  link: string;
};

const parseMatch = (item: ApiMatch): Match => {
  const [team1, team2] = item.title.split(' vs ').map((team) => team.trim());
  const date = new Date(item.date);
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return {
    id: item.title + item.date,
    title: item.title,
    competition: item.competition || 'World Cup 2026',
    date: date.toISOString().split('T')[0],
    time,
    stadium: 'Live stream',
    status: 'live',
    score: 'Live',
    link: item.url,
  };
};

export default function LiveSportsCalendar() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const t = useTranslations('matches');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/live-matches');
        const data = await res.json();

        if (!res.ok || !data.response) {
          setError(t('api_error'));
          return;
        }

        const liveMatches = data.response
          .filter((item: ApiMatch) => item.competition?.toLowerCase().includes('world cup') || item.title.toLowerCase().includes('world cup'))
          .slice(0, 8)
          .map(parseMatch);

        setMatches(liveMatches.length ? liveMatches : []);
      } catch (err) {
        setError(t('api_error'));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [t]);

  return (
    <section id="matches" className="relative py-24 md:py-36 bg-dark-950 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-[120px] animate-morph" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealAnimation>
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-gold text-brand-400 text-xs font-medium mb-4">
              <Trophy size={12} />
              {t('title')}
            </span>
            <h2 className="text-kinetic-xl font-bold text-white mb-4">{t('live_title')}</h2>
            <p className="text-fluid-base text-dark-300">{t('live_subtitle')}</p>
          </div>
        </RevealAnimation>

        {isLoading ? (
          <div className="text-center py-20 text-dark-300">{t('loading')}</div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20 text-dark-300">{t('no_live_match')}</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {matches.map((match, index) => (
              <RevealAnimation key={match.id} delay={Math.min(index + 1, 5)}>
                <div className="glass rounded-2xl p-5 border border-white/5 hover:border-brand-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-brand-500/5 group">
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-medium">
                      <span>🏆</span>
                      {match.competition}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/20 text-[11px] font-semibold uppercase">
                      {match.status}
                    </span>
                  </div>

                  <div className="mb-3 text-center">
                    <p className="text-white font-bold text-fluid-base truncate">{match.title}</p>
                    <div className="mx-auto my-3 w-fit rounded-full bg-white/5 px-4 py-2 text-brand-300 font-semibold text-lg">
                      {match.score ?? match.time}
                    </div>
                    <p className="text-dark-400 text-sm">{match.stadium}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-dark-400 text-fluid-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={12} />
                      {match.time}
                    </span>
                    <a href={match.link} target="_blank" rel="noreferrer" className="text-brand-400 hover:text-white text-sm font-semibold">
                      {t('watch_on')} <ChevronRight size={14} />
                    </a>
                  </div>
                </div>
              </RevealAnimation>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
