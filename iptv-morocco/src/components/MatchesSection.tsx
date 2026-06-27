'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Trophy, CalendarDays, Clock, MapPin, Tv, ChevronRight,
  Filter, Sparkles, TrendingUp, Timer
} from 'lucide-react';
import RevealAnimation from './RevealAnimation';

type Match = {
  id: string;
  date: string;
  time: string;
  team1: string;
  team2: string;
  competition: string;
  competitionId: string;
  stadium: string;
  status: 'live' | 'upcoming' | 'ended';
  score?: { team1: number; team2: number };
};

type Competition = {
  id: string;
  name: string;
  icon: string;
  count: number;
};

const COMPETITION_COLORS: Record<string, string> = {
  'world-cup': 'from-amber-500 to-yellow-600',
  'champions-league': 'from-blue-500 to-indigo-600',
  'premier-league': 'from-red-500 to-rose-600',
  'la-liga': 'from-orange-500 to-red-500',
};



function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function MatchesSection() {
  const t = useTranslations('matches');
  const [matches, setMatches] = useState<Match[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [activeCompetition, setActiveCompetition] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Refresh countdown every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getCountdown = (dateStr: string, timeStr: string): string => {
    const matchTime = new Date(dateStr + 'T' + timeStr).getTime();
    const diff = matchTime - now;
    if (diff <= 0) return 'Starting soon';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/matches');
        const data = await res.json();
        if (data.matches) {
          setMatches(data.matches);
          setCompetitions(data.competitions || []);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const filtered = useMemo(() => {
    let list = [...matches];
    if (activeCompetition !== 'all') {
      list = list.filter(m => m.competitionId === activeCompetition);
    }
    // Sort: live first, then upcoming, then ended
    return list.sort((a, b) => {
      const order = { live: 0, upcoming: 1, ended: 2 };
      const aOrder = order[a.status] ?? 3;
      const bOrder = order[b.status] ?? 3;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime();
    });
  }, [matches, activeCompetition]);

  const liveMatches = filtered.filter(m => m.status === 'live');
  const upcomingMatches = filtered.filter(m => m.status === 'upcoming');
  const endedMatches = filtered.filter(m => m.status === 'ended');
  const hasLiveMatches = liveMatches.length > 0;

  return (
    <section id="matches" className="relative py-24 md:py-36 bg-dark-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 wc-grid opacity-20" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <RevealAnimation>
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-4">
              <Trophy className="w-3.5 h-3.5" />
              {t('title') || 'Sports Calendar'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {t('live_title') || 'Live Matches & Schedule'}
            </h2>
            <p className="text-gray-400 text-base">
              {t('live_subtitle') || 'Real-time scores, upcoming fixtures across all major leagues'}
            </p>
          </div>
        </RevealAnimation>

        {/* Competition Filters */}
        <RevealAnimation delay={1}>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button
              onClick={() => setActiveCompetition('all')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                activeCompetition === 'all'
                  ? 'bg-brand-500 text-dark-950 shadow-lg shadow-brand-500/25'
                  : 'bg-dark-800/50 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {t('filters.all') || 'All'} ({matches.length})
            </button>
            {competitions.map(comp => (
              <button
                key={comp.id}
                onClick={() => setActiveCompetition(comp.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  activeCompetition === comp.id
                    ? 'bg-brand-500 text-dark-950 shadow-lg shadow-brand-500/25'
                    : 'bg-dark-800/50 text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                <span>{comp.icon}</span>
                {comp.name} ({comp.count})
              </button>
            ))}
          </div>
        </RevealAnimation>

        {/* Loading */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-dark-800/50 border border-white/5 rounded-2xl p-5 shimmer-premium h-48" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-12">
            <CalendarDays className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">{t('api_error') || 'Unable to load matches right now.'}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Live Match Alert */}
            {hasLiveMatches && (
              <RevealAnimation delay={2}>
                <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 text-xs font-bold uppercase tracking-wider">LIVE NOW</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {liveMatches.map((match, i) => (
                      <div key={match.id} className="flex items-center justify-between bg-dark-800/50 rounded-xl px-5 py-4 border border-red-500/10">
                        <div className="flex-1 text-center">
                          <p className="text-white font-bold text-sm truncate">{match.team1}</p>
                        </div>
                        <div className="mx-4 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 min-w-[80px] text-center">
                          <span className="text-red-400 font-bold text-lg">{match.score?.team1 ?? '?'} - {match.score?.team2 ?? '?'}</span>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="text-white font-bold text-sm truncate">{match.team2}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealAnimation>
            )}

            {/* No matches */}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <CalendarDays className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">{t('no_live_match') || 'No matches available'}</p>
                <p className="text-gray-600 text-sm mt-2">Check back soon for upcoming fixtures</p>
              </div>
            )}

            {/* Upcoming matches grid */}
            {upcomingMatches.length > 0 && (
              <div>
                {!hasLiveMatches && (
                  <RevealAnimation delay={2}>
                    <div className="flex items-center gap-3 mb-6">
                      <TrendingUp className="w-5 h-5 text-brand-400" />
                      <h3 className="text-lg font-bold text-white">Upcoming Matches</h3>
                      <div className="flex-1 trophy-line max-w-[150px]" />
                    </div>
                  </RevealAnimation>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(hasLiveMatches ? upcomingMatches : [...upcomingMatches, ...endedMatches.slice(0, 4)]).map((match, index) => {
                    const comp = competitions.find(c => c.id === match.competitionId);
                    const gradient = COMPETITION_COLORS[match.competitionId] || 'from-brand-500 to-yellow-600';
                    const countdown = getCountdown(match.date, match.time);

                    return (
                      <RevealAnimation key={match.id} delay={Math.min(index + 1, 5)}>
                        <div className="group relative bg-dark-800/30 border border-white/5 rounded-2xl p-5 hover:border-brand-500/20 transition-all duration-500 card-hover overflow-hidden">
                          {/* Top gradient line */}
                          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-60`} />

                          <div className="flex items-center justify-between mb-3 gap-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 text-[10px] font-semibold">
                              <span>{comp?.icon || '⚽'}</span>
                              {match.competition}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                              match.status === 'live'
                                ? 'bg-red-500/15 text-red-300 border border-red-500/20'
                                : match.status === 'ended'
                                ? 'bg-dark-700 text-gray-300 border border-white/10'
                                : 'bg-green-500/10 text-green-400 border border-green-500/20'
                            }`}>
                              {match.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                              {match.status === 'live' ? 'LIVE' : match.status === 'ended' ? 'FT' : formatDate(match.date)}
                            </span>
                          </div>

                          <div className="mb-3 text-center">
                            <p className="text-white font-bold text-sm truncate">{match.team1}</p>
                            <div className="mx-auto my-3 w-fit rounded-xl bg-dark-800/80 border border-white/5 px-5 py-2.5">
                              {match.score ? (
                                <span className="text-brand-400 font-bold text-xl">
                                  {match.score.team1} - {match.score.team2}
                                </span>
                              ) : (
                                <span className="text-gray-400 font-medium text-sm">{match.time}</span>
                              )}
                            </div>
                            <p className="text-white font-bold text-sm truncate">{match.team2}</p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-white/5 text-gray-500 text-xs">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {match.time}
                            </span>
                            <span className="flex items-center gap-1.5 truncate max-w-[130px]">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {match.stadium}
                            </span>
                          </div>

                          {/* Countdown for upcoming matches */}
                          {match.status === 'upcoming' && (
                            <div className="mt-3 flex items-center justify-center gap-1.5 text-brand-400 text-[10px] font-semibold">
                              <Timer className="w-3 h-3" />
                              Starts in {countdown}
                            </div>
                          )}

                          {/* Hover CTA */}
                          <div className="mt-3 flex items-center justify-center gap-1.5 text-brand-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <Tv className="w-3.5 h-3.5" />
                            <span>Watch on IPTV Pro</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </RevealAnimation>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats bar */}
            <RevealAnimation delay={4}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/5 border border-brand-500/10">
                  <Trophy className="w-4 h-4 text-brand-400" />
                  <span className="text-gray-400 text-sm">
                    <strong className="text-brand-400">{matches.length}</strong> matches
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/5 border border-green-500/10">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-sm">
                    <strong className="text-green-400">{competitions.length}</strong> competitions
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <CalendarDays className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-sm">
                    <strong className="text-blue-400">{upcomingMatches.length}</strong> upcoming
                  </span>
                </div>
              </div>
            </RevealAnimation>
          </>
        )}
      </div>
    </section>
  );
}
