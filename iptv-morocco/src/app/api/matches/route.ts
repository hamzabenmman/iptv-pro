// Sports matches API - fetches real live scores from Free API Live Football Data
// Falls back to hardcoded data when API is unavailable
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

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
  liveClock?: string;
};

// Cache for live API data to avoid hitting rate limits on every request
let liveCache: { data: Match[]; timestamp: number } | null = null;
const CACHE_TTL = 30_000; // 30 seconds

// Hardcoded fixtures for upcoming and recent matches across major leagues
const FIXTURES: Match[] = [
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

// Known league ID mapping (from the API provider)
const LEAGUE_MAP: Record<number, { name: string; id: string; country: string }> = {
  1:   { name: 'Premier League', id: 'premier-league', country: 'England' },
  2:   { name: 'Champions League', id: 'champions-league', country: 'Europe' },
  3:   { name: 'La Liga', id: 'la-liga', country: 'Spain' },
  4:   { name: 'Bundesliga', id: 'bundesliga', country: 'Germany' },
  5:   { name: 'Serie A', id: 'serie-a', country: 'Italy' },
  6:   { name: 'Ligue 1', id: 'ligue-1', country: 'France' },
  7:   { name: 'World Cup', id: 'world-cup', country: 'International' },
  39:  { name: 'Premier League', id: 'premier-league', country: 'England' },
  140: { name: 'La Liga', id: 'la-liga', country: 'Spain' },
  135: { name: 'Serie A', id: 'serie-a', country: 'Italy' },
  78:  { name: 'Bundesliga', id: 'bundesliga', country: 'Germany' },
  61:  { name: 'Ligue 1', id: 'ligue-1', country: 'France' },
  203: { name: 'Norway 1st Division', id: 'other', country: 'Norway' },
  216: { name: 'Iceland Premier League', id: 'other', country: 'Iceland' },
};

function parseApiTime(timeStr: string): { date: string; time: string } {
  // Format: "DD.MM.YYYY HH:mm"
  const [day, month, year, hour, minute] = timeStr.split(/[. :]/);
  return {
    date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
    time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`,
  };
}

async function fetchLiveMatches(): Promise<Match[]> {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) return [];

  // Check cache
  if (liveCache && Date.now() - liveCache.timestamp < CACHE_TTL) {
    return liveCache.data;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(
      'https://free-api-live-football-data.p.rapidapi.com/football-current-live',
      {
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[Matches API] Live fetch failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (data?.status !== 'success' || !data?.response?.live) {
      return [];
    }

    const liveMatches: Match[] = data.response.live.map((m: any) => {
      const { date, time } = parseApiTime(m.time);
      const league = LEAGUE_MAP[m.leagueId] || { name: `League ${m.leagueId}`, id: 'other', country: '' };
      const short = m.status?.liveTime?.short || '';
      const isOngoing = m.status?.ongoing === true;
      const isFinished = m.status?.finished === true;
      const isCancelled = m.status?.cancelled === true;

      return {
        id: `live-${m.id}`,
        date,
        time,
        team1: m.home?.longName || m.home?.name || 'Home',
        team2: m.away?.longName || m.away?.name || 'Away',
        competition: league.country ? `${league.name} (${league.country})` : league.name,
        competitionId: league.id,
        stadium: 'Live Match',
        status: isCancelled ? 'ended' : isFinished ? 'ended' : isOngoing ? 'live' : 'upcoming',
        score: { team1: m.home?.score ?? 0, team2: m.away?.score ?? 0 },
        liveClock: short,
      };
    });

    // Update cache
    liveCache = { data: liveMatches, timestamp: Date.now() };

    return liveMatches;
  } catch (err) {
    console.warn('[Matches API] Error fetching live matches:', err);
    return [];
  }
}

function getCompetitions(matches: Match[]) {
  const compMap = new Map<string, { id: string; name: string; icon: string; count: number }>();

  const COMP_ICONS: Record<string, string> = {
    'world-cup': '🏆',
    'champions-league': '⭐',
    'premier-league': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'la-liga': '🇪🇸',
    'bundesliga': '🇩🇪',
    'serie-a': '🇮🇹',
    'ligue-1': '🇫🇷',
    'other': '⚽',
  };

  const COMP_NAMES: Record<string, string> = {
    'world-cup': 'World Cup 2026',
    'champions-league': 'Champions League',
    'premier-league': 'Premier League',
    'la-liga': 'La Liga',
    'bundesliga': 'Bundesliga',
    'serie-a': 'Serie A',
    'ligue-1': 'Ligue 1',
  };

  // Keep defined competitions first, add others after
  const definedIds = ['world-cup', 'champions-league', 'premier-league', 'la-liga', 'bundesliga', 'serie-a', 'ligue-1'];

  // Start with defined order
  for (const id of definedIds) {
    const count = matches.filter(m => m.competitionId === id).length;
    if (count > 0) {
      compMap.set(id, {
        id,
        name: COMP_NAMES[id] || id,
        icon: COMP_ICONS[id] || '⚽',
        count,
      });
    }
  }

  // Add any other competitions
  matches.forEach(m => {
    if (!compMap.has(m.competitionId)) {
      compMap.set(m.competitionId, {
        id: m.competitionId,
        name: m.competition,
        icon: '⚽',
        count: 1,
      });
    } else {
      const existing = compMap.get(m.competitionId)!;
      existing.count = matches.filter(mm => mm.competitionId === m.competitionId).length;
    }
  });

  return Array.from(compMap.values());
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const competition = searchParams.get('competition');
  const status = searchParams.get('status');

  // Fetch live matches from API in parallel with starting our response
  const liveMatches = await fetchLiveMatches();

  // Combine: live matches first, then add hardcoded fixtures (skip any that are already live)
  const liveIds = new Set(liveMatches.map(m => `${m.team1}-${m.team2}-${m.date}`));
  const fixtures = liveMatches.length > 0
    ? FIXTURES.filter(f => !liveIds.has(`${f.team1}-${f.team2}-${f.date}`))
    : FIXTURES;

  let allMatches = [...liveMatches, ...fixtures];

  // Apply filters
  if (competition && competition !== 'all') {
    allMatches = allMatches.filter(m => m.competitionId === competition);
  }

  if (status) {
    allMatches = allMatches.filter(m => m.status === status);
  }

  // Sort: live first, then upcoming, then ended
  allMatches.sort((a, b) => {
    const order = { live: 0, upcoming: 1, ended: 2 };
    const aOrder = order[a.status] ?? 3;
    const bOrder = order[b.status] ?? 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime();
  });

  const competitions = getCompetitions(allMatches);

  return NextResponse.json({
    matches: allMatches,
    competitions,
    meta: {
      liveCount: liveMatches.length,
      totalCount: allMatches.length,
      source: liveMatches.length > 0 ? 'live' : 'fixtures',
      updatedAt: new Date().toISOString(),
    },
  });
}
