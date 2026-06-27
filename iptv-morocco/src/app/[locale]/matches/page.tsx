'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import {
  Trophy, CalendarDays, Clock, MapPin, Tv, ChevronRight, ChevronLeft,
  Filter, Sparkles, TrendingUp, Timer, ArrowLeft, List, Grid3X3,
  Search, ChevronDown, Eye, Star, Info
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RevealAnimation from '@/components/RevealAnimation';

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

const COMPETITION_CONFIG: Record<string, { name: string; icon: string; gradient: string; bgClass: string }> = {
  'world-cup': {
    name: 'World Cup 2026',
    icon: '🏆',
    gradient: 'from-amber-500 to-yellow-600',
    bgClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400'
  },
  'champions-league': {
    name: 'Champions League',
    icon: '⭐',
    gradient: 'from-blue-500 to-indigo-600',
    bgClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
  },
  'premier-league': {
    name: 'Premier League',
    icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    gradient: 'from-red-500 to-rose-600',
    bgClass: 'bg-red-500/10 border-red-500/20 text-red-400'
  },
  'la-liga': {
    name: 'La Liga',
    icon: '🇪🇸',
    gradient: 'from-orange-500 to-red-500',
    bgClass: 'bg-orange-500/10 border-orange-500/20 text-orange-400'
  },
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return days;
}

function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7); // "2026-06"
}

function getShortDate(dateStr: string): number {
  return parseInt(dateStr.split('-')[2], 10);
}

function getMatchTime(dateStr: string, timeStr: string): Date {
  return new Date(dateStr + 'T' + timeStr);
}

export default function MatchesPage() {
  const t = useTranslations('matches');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [matches, setMatches] = useState<Match[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCompetition, setActiveCompetition] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [calendarMonth, setCalendarMonth] = useState(6); // June 2026
  const [calendarYear, setCalendarYear] = useState(2026);
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
    return list.sort((a, b) => {
      const order = { live: 0, upcoming: 1, ended: 2 };
      const aOrder = order[a.status] ?? 3;
      const bOrder = order[b.status] ?? 3;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return getMatchTime(a.date, a.time).getTime() - getMatchTime(b.date, b.time).getTime();
    });
  }, [matches, activeCompetition]);

  const liveMatches = filtered.filter(m => m.status === 'live');
  const upcomingMatches = filtered.filter(m => m.status === 'upcoming');
  const endedMatches = filtered.filter(m => m.status === 'ended');
  const hasLiveMatches = liveMatches.length > 0;

  // Calendar helpers
  const calendarDays = getMonthDays(calendarYear, calendarMonth);
  const matchesThisMonth = filtered.filter(m => getMonthKey(m.date) === `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}`);

  // Group list view by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Match[]> = {};
    filtered.forEach(m => {
      if (!groups[m.date]) groups[m.date] = [];
      groups[m.date].push(m);
    });
    return Object.entries(groups).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
  }, [filtered]);

  const navigateMonth = (direction: number) => {
    let newMonth = calendarMonth + direction;
    let newYear = calendarYear;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    if (newMonth < 0) { newMonth = 11; newYear--; }
    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  };

  const totalStats = useMemo(() => {
    return {
      total: matches.length,
      live: liveMatches.length,
      upcoming: upcomingMatches.length,
      ended: endedMatches.length,
      competitions: competitions.length,
    };
  }, [matches, liveMatches, upcomingMatches, endedMatches, competitions]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 wc-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-[160px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealAnimation>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-5">
                <Trophy className="w-4 h-4" />
                {t('title') || 'Sports Calendar'}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                {t('title') || 'Sports Calendar'}
              </h1>
              <p className="text-dark-300 text-lg max-w-2xl mx-auto">
                {t('subtitle') || 'Track every match across all major leagues — live scores, upcoming fixtures, and full calendar view'}
              </p>
            </div>
          </RevealAnimation>

          {/* Stats Banner */}
          <RevealAnimation delay={1}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500/5 border border-brand-500/10">
                <Trophy className="w-4 h-4 text-brand-400" />
                <span className="text-dark-300 text-sm"><strong className="text-white">{totalStats.total}</strong> matches</span>
              </div>
              {totalStats.live > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm"><strong className="text-red-400">{totalStats.live}</strong> live</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/5 border border-green-500/10">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-dark-300 text-sm"><strong className="text-green-400">{totalStats.upcoming}</strong> upcoming</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <CalendarDays className="w-4 h-4 text-blue-400" />
                <span className="text-dark-300 text-sm"><strong className="text-blue-400">{totalStats.competitions}</strong> leagues</span>
              </div>
            </div>
          </RevealAnimation>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls Bar */}
          <RevealAnimation delay={2}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 rounded-2xl bg-dark-800/30 border border-white/5">
              {/* Competition Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCompetition('all')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                    activeCompetition === 'all'
                      ? 'bg-brand-500 text-dark-950 shadow-lg shadow-brand-500/25'
                      : 'bg-dark-800/50 text-gray-400 hover:text-white border border-white/5 hover:border-brand-500/20'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  All ({matches.length})
                </button>
                {competitions.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => setActiveCompetition(comp.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                      activeCompetition === comp.id
                        ? 'bg-brand-500 text-dark-950 shadow-lg shadow-brand-500/25'
                        : 'bg-dark-800/50 text-gray-400 hover:text-white border border-white/5 hover:border-brand-500/20'
                    }`}
                  >
                    <span>{comp.icon}</span>
                    {comp.name} ({comp.count})
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-dark-800/80 border border-white/5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-brand-500/15 text-brand-400'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    viewMode === 'calendar'
                      ? 'bg-brand-500/15 text-brand-400'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  Calendar
                </button>
              </div>
            </div>
          </RevealAnimation>

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-dark-800/30 border border-white/5 rounded-2xl p-6 shimmer-premium h-24" />
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5 border border-red-500/20">
                <Info className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Unable to Load Matches</h3>
              <p className="text-dark-400 mb-6">{t('api_error') || 'Unable to load matches right now.'}</p>
              <button
                onClick={() => { setLoading(true); setError(false); fetch('/api/matches').then(r => r.json()).then(d => {
                  setMatches(d.matches || []);
                  setCompetitions(d.competitions || []);
                  setError(false);
                }).catch(() => setError(true)).finally(() => setLoading(false)); }}
                className="px-5 py-2.5 bg-brand-500 text-dark-950 rounded-xl font-bold text-sm hover:bg-brand-400 transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              {/* Live Matches Alert */}
              {hasLiveMatches && (
                <RevealAnimation delay={3}>
                  <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/20">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                      </span>
                      <span className="text-red-400 text-sm font-bold uppercase tracking-wider">LIVE NOW</span>
                    </div>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {liveMatches.map(match => (
                        <div key={match.id} className="flex items-center justify-between bg-dark-800/60 rounded-xl px-5 py-4 border border-red-500/10">
                          <div className="flex-1 text-center">
                            <p className="text-white font-bold text-sm truncate">{match.team1}</p>
                          </div>
                          <div className="mx-4 px-5 py-2 rounded-xl bg-red-500/20 border border-red-500/30 min-w-[90px] text-center">
                            <span className="text-red-400 font-bold text-xl tabular-nums">
                              {match.score?.team1 ?? '?'} - {match.score?.team2 ?? '?'}
                            </span>
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

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <CalendarDays className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Matches Found</h3>
                  <p className="text-dark-400">Try selecting a different competition filter</p>
                </div>
              )}

              {/* ===== LIST VIEW ===== */}
              {viewMode === 'list' && filtered.length > 0 && (
                <div className="space-y-6">
                  {groupedByDate.map(([date, dateMatches]) => {
                    const isToday = new Date(date + 'T00:00:00').toDateString() === new Date().toDateString();
                    return (
                      <RevealAnimation key={date}>
                        <div className="mb-6">
                          {/* Date Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
                              isToday
                                ? 'bg-brand-500 text-dark-950'
                                : 'bg-dark-800/50 text-white border border-white/5'
                            }`}>
                              {formatDate(date)}
                            </div>
                            <div className="flex-1 trophy-line max-w-[200px]" />
                            <div className="text-dark-500 text-xs">
                              {dateMatches.filter(m => m.status === 'live').length > 0 && (
                                <span className="text-red-400 font-semibold mr-3">
                                  {dateMatches.filter(m => m.status === 'live').length} live
                                </span>
                              )}
                              <span>{dateMatches.length} match{dateMatches.length > 1 ? 'es' : ''}</span>
                            </div>
                          </div>

                          {/* Match Cards */}
                          <div className="space-y-3">
                            {dateMatches.map((match, idx) => {
                              const config = COMPETITION_CONFIG[match.competitionId] || { gradient: 'from-brand-500 to-yellow-600', icon: '⚽', name: match.competition, bgClass: 'bg-brand-500/10 border-brand-500/20 text-brand-400' };
                              const countdown = getCountdown(match.date, match.time);
                              return (
                                <div
                                  key={match.id}
                                  className={`group relative bg-dark-800/20 border border-white/5 rounded-2xl p-4 md:p-5 hover:border-brand-500/20 transition-all duration-500 card-hover ${
                                    match.status === 'live' ? 'border-red-500/20 bg-red-500/5' : ''
                                  }`}
                                >
                                  {/* Top gradient line */}
                                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} opacity-40 group-hover:opacity-80 transition-opacity duration-500 rounded-t-2xl`} />

                                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Competition Badge */}
                                    <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold ${config.bgClass} min-w-[120px]`}>
                                      <span>{config.icon}</span>
                                      {config.name}
                                    </div>

                                    {/* Teams & Score */}
                                    <div className="flex-1 flex items-center justify-center md:justify-start gap-3 md:gap-6">
                                      <div className={`flex-1 md:flex-none text-right md:text-right ${isRtl ? 'order-3' : ''}`}>
                                        <p className={`font-bold truncate ${match.status === 'live' ? 'text-white text-base' : 'text-white text-sm'}`}>
                                          {match.team1}
                                        </p>
                                      </div>

                                      <div className={`px-5 py-2 rounded-xl text-center min-w-[90px] ${
                                        match.score
                                          ? 'bg-brand-500/10 border border-brand-500/20'
                                          : 'bg-dark-800/80 border border-white/5'
                                      }`}>
                                        {match.score ? (
                                          <span className="text-brand-400 font-bold text-lg tabular-nums">
                                            {match.score.team1} - {match.score.team2}
                                          </span>
                                        ) : (
                                          <span className="text-dark-200 font-medium text-sm">{match.time}</span>
                                        )}
                                      </div>

                                      <div className={`flex-1 md:flex-none text-left md:text-left ${isRtl ? 'order-1' : ''}`}>
                                        <p className={`font-bold truncate ${match.status === 'live' ? 'text-white text-base' : 'text-white text-sm'}`}>
                                          {match.team2}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Status & Countdown */}
                                    <div className="flex md:flex-col items-center md:items-end gap-2 md:gap-1 md:min-w-[110px]">
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                        match.status === 'live'
                                          ? 'bg-red-500/15 text-red-300 border border-red-500/20'
                                          : match.status === 'ended'
                                          ? 'bg-dark-700 text-dark-300 border border-white/10'
                                          : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                      }`}>
                                        {match.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                                        {match.status === 'live' ? 'LIVE' : match.status === 'ended' ? 'FT' : formatDate(match.date)}
                                      </span>
                                      {match.status === 'upcoming' && (
                                        <span className="text-[10px] text-brand-400 font-semibold flex items-center gap-1">
                                          <Timer className="w-3 h-3" />
                                          {countdown}
                                        </span>
                                      )}
                                    </div>

                                    {/* Stadium */}
                                    <div className="hidden xl:flex items-center gap-1.5 text-dark-500 text-xs min-w-[150px]">
                                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                                      <span className="truncate">{match.stadium}</span>
                                    </div>

                                    {/* Watch CTA */}
                                    <div className="flex items-center gap-1.5 text-brand-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 md:min-w-[100px]">
                                      <Tv className="w-3.5 h-3.5" />
                                      <span className="hidden md:inline">Watch</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                  </div>

                                  {/* Mobile: Stadium + Competition row */}
                                  <div className="md:hidden flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                    <span className="flex items-center gap-1.5 text-dark-500 text-[10px]">
                                      <MapPin className="w-3 h-3" />
                                      {match.stadium}
                                    </span>
                                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${config.bgClass}`}>
                                      <span>{config.icon}</span>
                                      {config.name}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </RevealAnimation>
                    );
                  })}
                </div>
              )}

              {/* ===== CALENDAR VIEW ===== */}
              {viewMode === 'calendar' && filtered.length > 0 && (
                <RevealAnimation delay={3}>
                  <div className="bg-dark-800/20 border border-white/5 rounded-3xl overflow-hidden">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between p-5 md:p-6 bg-dark-800/40 border-b border-white/5">
                      <button
                        onClick={() => navigateMonth(-1)}
                        className="w-10 h-10 rounded-xl bg-dark-800/60 border border-white/5 flex items-center justify-center text-dark-300 hover:text-brand-400 hover:border-brand-500/20 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h3 className="text-lg font-bold text-white">
                        {MONTH_NAMES[calendarMonth]} {calendarYear}
                      </h3>
                      <button
                        onClick={() => navigateMonth(1)}
                        className="w-10 h-10 rounded-xl bg-dark-800/60 border border-white/5 flex items-center justify-center text-dark-300 hover:text-brand-400 hover:border-brand-500/20 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 border-b border-white/5">
                      {DAY_NAMES.map(day => (
                        <div key={day} className="p-3 text-center text-dark-500 text-xs font-semibold uppercase tracking-wider">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7">
                      {calendarDays.map((day, idx) => {
                        if (day === null) {
                          return <div key={`empty-${idx}`} className="min-h-[100px] md:min-h-[140px] p-2 bg-dark-900/20 border-b border-r border-white/5" />;
                        }

                        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayMatches = matchesThisMonth.filter(m => getShortDate(m.date) === day);
                        const isToday = new Date().toDateString() === new Date(dateStr + 'T00:00:00').toDateString();

                        return (
                          <div
                            key={idx}
                            className={`min-h-[100px] md:min-h-[140px] p-1.5 md:p-2 border-b border-r border-white/5 hover:bg-brand-500/5 transition-all cursor-pointer relative ${
                              isToday ? 'bg-brand-500/10' : ''
                            }`}
                          >
                            {/* Day Number */}
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold mb-1 ${
                              isToday
                                ? 'bg-brand-500 text-dark-950'
                                : 'text-dark-300'
                            }`}>
                              {day}
                            </div>

                            {/* Match indicators */}
                            <div className="space-y-0.5">
                              {dayMatches.slice(0, 3).map(match => {
                                const config = COMPETITION_CONFIG[match.competitionId];
                                return (
                                  <div key={match.id} className={`text-[9px] md:text-[10px] leading-tight px-1.5 py-0.5 rounded truncate ${
                                    match.status === 'live'
                                      ? 'bg-red-500/20 text-red-300 font-semibold'
                                      : match.status === 'ended'
                                      ? 'bg-dark-700/50 text-dark-400'
                                      : 'bg-green-500/10 text-green-400'
                                  }`}>
                                    <span className="hidden md:inline">{config?.icon} </span>
                                    {match.team1} vs {match.team2}
                                  </div>
                                );
                              })}
                              {dayMatches.length > 3 && (
                                <div className="text-[9px] text-brand-400 font-semibold text-center">
                                  +{dayMatches.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Calendar Legend */}
                    <div className="flex flex-wrap items-center gap-4 p-4 md:p-5 bg-dark-800/40 border-t border-white/5">
                      <span className="text-dark-500 text-xs">Legend:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-dark-400 text-xs">Live</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        <span className="text-dark-400 text-xs">Upcoming</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-dark-600" />
                        <span className="text-dark-400 text-xs">Ended</span>
                      </div>
                      <div className="flex items-center gap-1.5 ms-4">
                        <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-[9px] font-bold text-dark-950">15</div>
                        <span className="text-dark-400 text-xs">Today</span>
                      </div>
                    </div>
                  </div>
                </RevealAnimation>
              )}
            </>
          )}
        </div>
      </section>

      {/* Back to Home */}
      <div className="relative pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link
              href={`/${locale === 'ar' ? '' : locale}`}
              className="inline-flex items-center gap-2 text-dark-400 hover:text-brand-400 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
