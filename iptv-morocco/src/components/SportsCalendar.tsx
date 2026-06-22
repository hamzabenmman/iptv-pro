'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  CalendarDays, Trophy, MapPin, Clock, Sparkles,
  Tv, ChevronRight, TrendingUp
} from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import RevealAnimation from './RevealAnimation';

const filterKeys = ['all', 'world_cup', 'champions_league', 'premier_league', 'la_liga', 'bein'] as const;

type Match = {
  date: string;
  time: string;
  team1: string;
  team2: string;
  competition: string;
  stadium: string;
};

const competitionIcons: Record<string, string> = {
  world_cup: '🏆',
  champions_league: '⭐',
  premier_league: '🦁',
  la_liga: '👑',
  bein: '🎯',
};

export default function SportsCalendar() {
  const t = useTranslations('matches');
  const tNav = useTranslations('nav');
  const [activeFilter, setActiveFilter] = useState('all');

  const allMatches = t.raw('matches_list') as Match[];

  const filteredMatches = useMemo(() => {
    if (activeFilter === 'all') return allMatches;
    return allMatches.filter((m) => m.competition === activeFilter);
  }, [activeFilter, allMatches]);

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

  return (
    <section id="matches" className="relative py-24 md:py-36 bg-dark-950 overflow-hidden">
      {/* Background */}
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

        {/* Stats Counter Row */}
        <RevealAnimation delay={1}>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-gold border border-brand-500/10">
              <Trophy size={16} className="text-brand-400" />
              <span className="text-fluid-sm text-dark-300">
                <AnimatedCounter target={allMatches.length} duration={1500} className="text-brand-400 font-bold text-lg" />
                {' '}<span className="hidden sm:inline">matchs à venir</span><span className="sm:hidden">matchs</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-gold border border-brand-500/10">
              <TrendingUp size={16} className="text-brand-400" />
              <span className="text-fluid-sm text-dark-300">
                <AnimatedCounter target={5} duration={1200} className="text-brand-400 font-bold text-lg" />
                {' '}<span className="hidden sm:inline">compétitions couvertes</span><span className="sm:hidden">compétitions</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-gold border border-brand-500/10">
              <CalendarDays size={16} className="text-brand-400" />
              <span className="text-fluid-sm text-dark-300">
                <AnimatedCounter target={21} duration={1800} className="text-brand-400 font-bold text-lg" />
                {' '}<span className="hidden sm:inline">jours de couverture</span><span className="sm:hidden">jours</span>
              </span>
            </div>
          </div>
        </RevealAnimation>

        {/* Filters */}
        <RevealAnimation delay={2}>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {filterKeys.map((key) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-4 py-2.5 rounded-xl text-fluid-sm font-medium transition-all duration-300 ${
                  activeFilter === key
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-lg shadow-brand-500/10'
                    : 'glass-light text-dark-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {t(`filters.${key}`)}
              </button>
            ))}
          </div>
        </RevealAnimation>

        {/* Matches Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMatches.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <CalendarDays className="w-12 h-12 text-dark-500 mx-auto mb-3" />
              <p className="text-dark-400 text-fluid-base">Aucun match trouvé</p>
            </div>
          ) : (
            filteredMatches.map((match, index) => {
              const compIcon = competitionIcons[match.competition] || '⚽';
              return (
                <RevealAnimation key={index} delay={Math.min(index + 1, 5)}>
                  <div className="glass rounded-2xl p-5 border border-white/5 hover:border-brand-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-brand-500/5 group card-hover">
                    {/* Competition Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/8 text-brand-400 text-xs font-medium">
                        <span>{compIcon}</span>
                        <span>{t(`filters.${match.competition as (typeof filterKeys)[number]}`)}</span>
                      </span>
                      <div className="flex items-center gap-1.5 text-dark-400 text-fluid-sm">
                        <CalendarDays size={12} />
                        <span>{formatDate(match.date)}</span>
                      </div>
                    </div>

                    {/* Teams */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex-1 text-center">
                        <p className="text-white font-bold text-fluid-base truncate">{match.team1}</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10">
                        <Trophy size={12} className="text-brand-400" />
                        <span className="text-brand-400 font-bold text-sm">VS</span>
                        <Trophy size={12} className="text-brand-400" />
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-white font-bold text-fluid-base truncate">{match.team2}</p>
                      </div>
                    </div>

                    {/* Time & Stadium */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-dark-400 text-fluid-sm">
                        <Clock size={12} />
                        <span>{match.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-dark-400 text-fluid-sm truncate max-w-[140px]">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{match.stadium}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <div className="flex items-center justify-center gap-2 text-brand-400 text-fluid-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Tv size={14} />
                        <span>{t('watch_on')} IPTV Pro</span>
                        <ChevronRight size={14} />
                      </div>
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
