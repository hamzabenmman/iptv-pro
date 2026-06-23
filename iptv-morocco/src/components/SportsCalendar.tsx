'use client';

import { useTranslations } from 'next-intl';
import {
  CalendarDays, Trophy, MapPin, Clock,
  Tv, ChevronRight, TrendingUp
} from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import RevealAnimation from './RevealAnimation';

type Match = {
  date: string;
  time: string;
  team1: string;
  team2: string;
  competition: string;
  stadium: string;
  status?: 'live' | 'upcoming' | 'ended';
  score?: {
    team1: number;
    team2: number;
  };
};

const competitionIcons: Record<string, string> = {
  world_cup: '🏆',
};

export default function SportsCalendar() {
  const t = useTranslations('matches');
  const tNav = useTranslations('nav');

  const allMatches = (t.raw('matches_list') as Match[]).filter((match) => match.competition === 'world_cup');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return t('today');
    if (isTomorrow) return t('tomorrow');

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getStatusLabel = (match: Match) => {
    if (match.status === 'live') return t('status_live');
    if (match.status === 'ended') return t('status_ended');
    return t('status_upcoming');
  };

  const getScoreLabel = (match: Match) => {
    if (!match.score) return null;
    return `${match.score.team1} - ${match.score.team2}`;
  };

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
              {tNav('matches')}
            </span>
            <h2 className="text-kinetic-xl font-bold text-white mb-4">{t('title')}</h2>
            <p className="text-fluid-base text-dark-300">{t('subtitle')}</p>
          </div>
        </RevealAnimation>

        <RevealAnimation delay={1}>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-gold border border-brand-500/10">
              <Trophy size={16} className="text-brand-400" />
              <span className="text-fluid-sm text-dark-300">
                <AnimatedCounter target={allMatches.length} duration={1500} className="text-brand-400 font-bold text-lg" />
                {' '}<span className="hidden sm:inline">World Cup matches</span><span className="sm:hidden">Matches</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-gold border border-brand-500/10">
              <TrendingUp size={16} className="text-brand-400" />
              <span className="text-fluid-sm text-dark-300">
                <AnimatedCounter target={1} duration={1200} className="text-brand-400 font-bold text-lg" />
                {' '}<span className="hidden sm:inline">Major event</span><span className="sm:hidden">Event</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-gold border border-brand-500/10">
              <CalendarDays size={16} className="text-brand-400" />
              <span className="text-fluid-sm text-dark-300">
                <AnimatedCounter target={7} duration={1800} className="text-brand-400 font-bold text-lg" />
                {' '}<span className="hidden sm:inline">Days to follow</span><span className="sm:hidden">Days</span>
              </span>
            </div>
          </div>
        </RevealAnimation>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allMatches.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <CalendarDays className="w-12 h-12 text-dark-500 mx-auto mb-3" />
              <p className="text-dark-400 text-fluid-base">No World Cup matches found</p>
            </div>
          ) : (
            allMatches.map((match, index) => {
              const compIcon = competitionIcons[match.competition] || '⚽';
              const statusLabel = getStatusLabel(match);
              const scoreLabel = getScoreLabel(match);

              return (
                <RevealAnimation key={index} delay={Math.min(index + 1, 5)}>
                  <div className="glass rounded-2xl p-5 border border-white/5 hover:border-brand-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-brand-500/5 group">
                    <div className="flex items-center justify-between mb-3 gap-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-medium">
                        <span>{compIcon}</span>
                        World Cup 2026
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold uppercase ${
                        match.status === 'live'
                          ? 'bg-red-500/15 text-red-300 border border-red-500/20'
                          : match.status === 'ended'
                          ? 'bg-dark-700 text-dark-100 border border-white/10'
                          : 'bg-brand-500/10 text-brand-300 border border-brand-500/20'
                      }`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="mb-3 text-center">
                      <p className="text-white font-bold text-fluid-base truncate">{match.team1}</p>
                      <div className="mx-auto my-3 w-fit rounded-full bg-white/5 px-4 py-2 text-brand-300 font-semibold text-lg">
                        {scoreLabel ?? match.time}
                      </div>
                      <p className="text-white font-bold text-fluid-base truncate">{match.team2}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-dark-400 text-fluid-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={12} />
                        {match.time}
                      </span>
                      <span className="inline-flex items-center gap-1.5 truncate max-w-[140px]">
                        <MapPin size={12} className="shrink-0" />
                        {match.stadium}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2 text-brand-400 text-fluid-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Tv size={14} />
                      <span>{t('watch_on')} IPTV Pro</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </RevealAnimation>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
