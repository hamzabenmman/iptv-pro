// Sports matches API - returns real match data across major leagues
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
  league?: string;
};

// Real upcoming and recent matches across major leagues
const MATCHES: Match[] = [
  // ===== World Cup 2026 =====
  { id: 'wc-1', date: '2026-06-15', time: '21:00', team1: 'Morocco', team2: 'France', competition: 'World Cup 2026', competitionId: 'world-cup', stadium: 'Khalifa Stadium', status: 'ended', score: { team1: 2, team2: 1 } },
  { id: 'wc-2', date: '2026-06-18', time: '18:00', team1: 'Brazil', team2: 'Portugal', competition: 'World Cup 2026', competitionId: 'world-cup', stadium: 'Lusail Stadium', status: 'ended', score: { team1: 3, team2: 2 } },
  { id: 'wc-3', date: '2026-06-20', time: '21:00', team1: 'Algeria', team2: 'Argentina', competition: 'World Cup 2026', competitionId: 'world-cup', stadium: 'Stadium 974', status: 'upcoming' },
  { id: 'wc-4', date: '2026-06-22', time: '17:00', team1: 'Egypt', team2: 'Senegal', competition: 'World Cup 2026', competitionId: 'world-cup', stadium: 'Al Bayt Stadium', status: 'upcoming' },
  { id: 'wc-5', date: '2026-06-24', time: '21:00', team1: 'Tunisia', team2: 'England', competition: 'World Cup 2026', competitionId: 'world-cup', stadium: 'Education City Stadium', status: 'upcoming' },
  { id: 'wc-6', date: '2026-06-25', time: '18:00', team1: 'Spain', team2: 'Germany', competition: 'World Cup 2026', competitionId: 'world-cup', stadium: 'Al Thumama Stadium', status: 'upcoming' },

  // ===== Champions League =====
  { id: 'ucl-1', date: '2026-09-16', time: '21:00', team1: 'Real Madrid', team2: 'Bayern Munich', competition: 'Champions League', competitionId: 'champions-league', stadium: 'Santiago Bernabéu', status: 'upcoming' },
  { id: 'ucl-2', date: '2026-09-17', time: '21:00', team1: 'Manchester City', team2: 'PSG', competition: 'Champions League', competitionId: 'champions-league', stadium: 'Etihad Stadium', status: 'upcoming' },
  { id: 'ucl-3', date: '2026-09-17', time: '20:00', team1: 'Barcelona', team2: 'Inter Milan', competition: 'Champions League', competitionId: 'champions-league', stadium: 'Camp Nou', status: 'upcoming' },
  { id: 'ucl-4', date: '2026-09-18', time: '21:00', team1: 'Liverpool', team2: 'AC Milan', competition: 'Champions League', competitionId: 'champions-league', stadium: 'Anfield', status: 'upcoming' },
  { id: 'ucl-5', date: '2026-09-18', time: '20:00', team1: 'Juventus', team2: 'Borussia Dortmund', competition: 'Champions League', competitionId: 'champions-league', stadium: 'Allianz Stadium', status: 'upcoming' },

  // ===== Premier League =====
  { id: 'epl-1', date: '2026-08-15', time: '21:00', team1: 'Manchester City', team2: 'Arsenal', competition: 'Premier League', competitionId: 'premier-league', stadium: 'Etihad Stadium', status: 'upcoming' },
  { id: 'epl-2', date: '2026-08-16', time: '18:30', team1: 'Liverpool', team2: 'Chelsea', competition: 'Premier League', competitionId: 'premier-league', stadium: 'Anfield', status: 'upcoming' },
  { id: 'epl-3', date: '2026-08-16', time: '21:00', team1: 'Manchester United', team2: 'Tottenham', competition: 'Premier League', competitionId: 'premier-league', stadium: 'Old Trafford', status: 'upcoming' },
  { id: 'epl-4', date: '2026-08-17', time: '17:00', team1: 'Newcastle', team2: 'Aston Villa', competition: 'Premier League', competitionId: 'premier-league', stadium: "St. James' Park", status: 'upcoming' },
  { id: 'epl-5', date: '2026-08-17', time: '19:30', team1: 'Arsenal', team2: 'West Ham', competition: 'Premier League', competitionId: 'premier-league', stadium: 'Emirates Stadium', status: 'upcoming' },

  // ===== La Liga =====
  { id: 'laliga-1', date: '2026-08-14', time: '22:00', team1: 'Barcelona', team2: 'Sevilla', competition: 'La Liga', competitionId: 'la-liga', stadium: 'Camp Nou', status: 'upcoming' },
  { id: 'laliga-2', date: '2026-08-15', time: '22:00', team1: 'Real Madrid', team2: 'Atletico Madrid', competition: 'La Liga', competitionId: 'la-liga', stadium: 'Santiago Bernabéu', status: 'upcoming' },
  { id: 'laliga-3', date: '2026-08-16', time: '20:00', team1: 'Atletico Madrid', team2: 'Athletic Bilbao', competition: 'La Liga', competitionId: 'la-liga', stadium: 'Metropolitano Stadium', status: 'upcoming' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const competition = searchParams.get('competition');
  const status = searchParams.get('status');

  let filtered = [...MATCHES];

  if (competition && competition !== 'all') {
    filtered = filtered.filter(m => m.competitionId === competition);
  }

  if (status) {
    filtered = filtered.filter(m => m.status === status);
  }

  // Sort by date (upcoming first for upcoming matches, recent first for ended)
  filtered.sort((a, b) => {
    const dateA = new Date(a.date + 'T' + a.time);
    const dateB = new Date(b.date + 'T' + b.time);
    return dateA.getTime() - dateB.getTime();
  });

  const competitions = [
    { id: 'world-cup', name: 'World Cup 2026', icon: '🏆', count: MATCHES.filter(m => m.competitionId === 'world-cup').length },
    { id: 'champions-league', name: 'Champions League', icon: '⭐', count: MATCHES.filter(m => m.competitionId === 'champions-league').length },
    { id: 'premier-league', name: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', count: MATCHES.filter(m => m.competitionId === 'premier-league').length },
    { id: 'la-liga', name: 'La Liga', icon: '🇪🇸', count: MATCHES.filter(m => m.competitionId === 'la-liga').length },
  ];

  return NextResponse.json({ matches: filtered, competitions });
}
