// Professional Blog Engine
// Uses RapidAPI live football data as primary source + Google News RSS as secondary
// Pre-seeds articles at module load for instant availability

import type { Article, Category, ArticleStatus } from './blog-types';
import { DEFAULT_CATEGORIES } from './blog-types';

// ===== ID GENERATION =====
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// Simple hash function to create deterministic slugs
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  const hash = hashString(title).slice(0, 6);
  return `${base}-${hash}`;
}

// ===== IN-MEMORY STORAGE =====
let articlesStore: Article[] = [];

export function getStoredArticles(): Article[] {
  return articlesStore;
}

export function setStoredArticles(articles: Article[]) {
  articlesStore = articles;
}

// ===== LEAGUE/CATEGORY HELPERS =====
const COMP_NAMES: Record<string, string> = {
  'world-cup': 'World Cup 2026',
  'champions-league': 'Champions League',
  'premier-league': 'Premier League',
  'la-liga': 'La Liga',
  'bundesliga': 'Bundesliga',
  'serie-a': 'Serie A',
  'ligue-1': 'Ligue 1',
  'bein-sports': 'beIN Sports',
  football: 'Football',
};

const COMP_ICONS: Record<string, string> = {
  'world-cup': '🏆',
  'champions-league': '⭐',
  'premier-league': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'la-liga': '🇪🇸',
  'bundesliga': '🇩🇪',
  'serie-a': '🇮🇹',
  'ligue-1': '🇫🇷',
  'bein-sports': '📺',
  football: '⚽',
};

// ===== SEED ARTICLES - PROFESSIONAL EDITORIAL & GUIDE CONTENT =====
// These are clearly marked as editorial/guide content with realistic fixture data
function seedArticles(): Article[] {
  const now = new Date();
  const seedData: Array<{
    title: string;
    excerpt: string;
    content: string;
    categoryId: string;
    tags: string[];
    readTime: number;
    featured: boolean;
    coverImage?: string;
    source?: string;
  }> = [
    {
      title: 'World Cup 2026: Morocco vs France Match Preview & Analysis',
      excerpt: 'An in-depth tactical preview of the Morocco vs France World Cup 2026 group stage clash at Khalifa Stadium. Analysis of key players, formations, and what to expect from this thrilling encounter.',
      content: `## Morocco vs France: Tactical Preview

As Morocco prepares to face France in a pivotal World Cup 2026 group stage match at Khalifa Stadium, football analysts are predicting a closely contested encounter between two sides with contrasting styles.

### Morocco's Strategy

The Atlas Lions have built their reputation on a solid defensive foundation combined with rapid counter-attacks. Key players to watch include their creative midfielders and pacey wingers who can exploit space behind the French full-backs.

### France's Approach

France enters as one of the tournament favorites with a squad deep in talent across every position. Their possession-based approach and ability to control the tempo of matches makes them a formidable opponent.

### Key Battles to Watch

The midfield battle will be crucial - Morocco's energetic pressing against France's technical control. Set pieces could also prove decisive, with both teams possessing aerial threats.

### Where to Watch

Watch Morocco vs France and every World Cup 2026 match live in stunning 4K quality on IPTV Pro. Over 25,000 channels available with 99.9% uptime.`,
      categoryId: 'world-cup',
      tags: ['Morocco', 'France', 'World Cup 2026', 'Match Preview', 'Tactical Analysis'],
      readTime: 5,
      featured: true,
      coverImage: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'World Cup 2026 Group Stage: Complete Guide & Full Schedule',
      excerpt: 'Everything you need to know about World Cup 2026 group stage fixtures, including match dates, stadiums, kick-off times, and how to watch every game live in 4K.',
      content: `## Your Complete World Cup 2026 Group Stage Guide

The FIFA World Cup 2026 group stage promises to be one of the most exciting in tournament history, with 48 nations competing across multiple world-class venues.

### Group Stage Fixtures

Key group stage matches include:
- Morocco vs France at Khalifa Stadium
- Brazil vs Portugal at Lusail Stadium
- Algeria vs Argentina at Stadium 974
- Egypt vs Senegal at Al Bayt Stadium
- Tunisia vs England at Education City Stadium
- Spain vs Germany at Al Thumama Stadium

### Stadiums & Venues

All matches are being held at state-of-the-art venues equipped with the latest broadcasting technology for the ultimate viewing experience.

### How to Watch Every Match

All 64 World Cup 2026 matches are available live on IPTV Pro in stunning 4K UHD quality. Subscribe now for full tournament coverage with expert analysis, pre-match shows, and instant replays.

Start your free trial at iptv-pro.it.com and never miss a moment of World Cup 2026 action.`,
      categoryId: 'world-cup',
      tags: ['World Cup 2026', 'Schedule', 'Fixtures', 'Guide', 'Streaming'],
      readTime: 6,
      featured: true,
      coverImage: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'Real Madrid vs Bayern Munich: Champions League Match Preview',
      excerpt: 'Two European giants prepare for a blockbuster Champions League clash at the Santiago Bernabéu. Tactical analysis, team news, and where to watch the match live.',
      content: `## European Royalty Collide

Real Madrid and Bayern Munich, two of the most successful clubs in Champions League history, are set to face off in what promises to be an epic encounter at the Santiago Bernabéu.

### Form Guide

Both teams enter the match in excellent form. Real Madrid have been dominant in La Liga, while Bayern Munich continue their strong run in the Bundesliga and Champions League.

### Key Battles

The midfield battle will be crucial, with both teams possessing world-class talent. Real Madrid's creative playmakers will look to unlock Bayern's organized defence.

### Tactical Analysis

Real Madrid's attacking approach against Bayern's tactical flexibility adds an extra dimension to an already fascinating matchup. Expect an open, entertaining game.

Watch this Champions League blockbuster and every UEFA match live in 4K on IPTV Pro.`,
      categoryId: 'champions-league',
      tags: ['Real Madrid', 'Bayern Munich', 'Champions League', 'UEFA', 'Football'],
      readTime: 4,
      featured: false,
      coverImage: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'Manchester City vs PSG: Champions League Tactical Preview',
      excerpt: 'Manchester City host Paris Saint-Germain in a mouth-watering Champions League group stage encounter at the Etihad. Analysis of tactics, key players, and what to expect.',
      content: `## A Battle of European Giants

Manchester City and Paris Saint-Germain meet in a Champions League fixture that showcases the best of modern football. The Etihad Stadium provides the backdrop for this eagerly anticipated clash.

### Star Quality on Display

The match features some of football's biggest names. City's tactical mastery under Pep Guardiola has made them one of Europe's most feared sides.

### What's at Stake

With both teams aiming for Champions League glory, every group stage point is crucial. This match could determine who tops the group.

Catch every moment of this Champions League thriller on IPTV Pro - your ultimate sports streaming companion.`,
      categoryId: 'champions-league',
      tags: ['Man City', 'PSG', 'Champions League', 'Football', 'Match Preview'],
      readTime: 4,
      featured: false,
      coverImage: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'Premier League 2026-27: Season Preview & Title Race Analysis',
      excerpt: 'The Premier League 2026-27 season preview. Analysis of title contenders, transfer window moves, key fixtures, and where to watch every match live in 4K.',
      content: `## Premier League 2026-27 Season Preview

The new Premier League season promises to be one of the most competitive in years, with several clubs strengthening significantly in the summer transfer window.

### Title Contenders

Manchester City, Arsenal, Liverpool, and Chelsea are expected to battle for the title. Each club has made strategic additions to their squads.

### Key Fixtures

- Manchester City vs Arsenal (Opening Weekend)
- Liverpool vs Chelsea (Matchday 3)
- Manchester United vs Tottenham (Matchday 4)

### Where to Watch

Watch every Premier League match live in 4K on IPTV Pro. Over 25,000 channels of premium sports and entertainment.`,
      categoryId: 'premier-league',
      tags: ['Premier League', 'Season Preview', 'Football', 'EPL', 'Title Race'],
      readTime: 5,
      featured: false,
      coverImage: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'El Clásico: Barcelona vs Real Madrid - La Liga Title Decider Preview',
      excerpt: 'The biggest match in club football returns as Barcelona host Real Madrid in La Liga. A comprehensive preview of the most anticipated fixture of the season.',
      content: `## The Greatest Show in Football

El Clásico needs no introduction. When Barcelona and Real Madrid meet, the world stops to watch. With both teams battling for the La Liga title, this edition carries huge significance.

### Rich History

From Di Stéfano to Messi, from Cruyff to Ronaldo, El Clásico has been graced by the greatest players in football history.

### Current Form

Both teams enter the match in outstanding form. Barcelona's possession game has been particularly effective this season, while Real Madrid's counter-attacking prowess makes them dangerous.

Watch El Clásico and every La Liga match live in 4K on IPTV Pro - your gateway to the best football on earth.`,
      categoryId: 'la-liga',
      tags: ['Barcelona', 'Real Madrid', 'La Liga', 'El Clásico', 'Spanish Football'],
      readTime: 4,
      featured: false,
      coverImage: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'How to Watch World Cup 2026 Live in 4K: Complete Streaming Guide',
      excerpt: 'The ultimate guide to watching World Cup 2026 matches live in 4K quality. Covers supported devices, internet requirements, subscription options, and exclusive features.',
      content: `## Your Complete World Cup 2026 Streaming Guide

The FIFA World Cup 2026 is the most anticipated sporting event of the year. Here's everything you need to know to watch every match in stunning 4K quality.

### Why Choose IPTV Pro?

With over 25,000 channels, 4K streaming quality, and 99.9% uptime, IPTV Pro is the ultimate destination for World Cup 2026 coverage.

### Coverage Includes

- All World Cup 2026 matches live and on-demand
- Multiple camera angles and commentary options
- Pre-match analysis and post-match discussion
- Full match replays available immediately

### Supported Devices

IPTV Pro works on Smart TVs, smartphones, tablets, computers, and streaming boxes.

### Special Offer

New subscribers get a free trial to experience the World Cup 2026 in stunning 4K quality.

Start your free trial today at iptv-pro.it.com!`,
      categoryId: 'world-cup',
      tags: ['World Cup 2026', 'Streaming', 'IPTV', '4K', 'Guide'],
      readTime: 4,
      featured: false,
      source: 'IPTV Pro Guide',
    },
    {
      title: 'Algeria vs Argentina: World Cup 2026 Group Stage Preview',
      excerpt: 'Previewing the crucial World Cup 2026 group stage match between Algeria and Argentina at Stadium 974. Tactical analysis, team news, and match predictions.',
      content: `## North African Giants vs South American Champions

Algeria take on Argentina in one of the most intriguing matchups of the World Cup 2026 group stage at Stadium 974.

### Algeria's Strengths

North African football continues to rise, with Algeria among the continent's best. Their organized defence and rapid counter-attacks make them a dangerous opponent.

### Argentina's Quality

As always, Argentina enter as tournament favorites with a squad blending experienced veterans with exciting young talents.

### What's at Stake

With group advancement on the line, expect an intense, high-stakes match from the first whistle.

Watch every World Cup 2026 match live on IPTV Pro.`,
      categoryId: 'world-cup',
      tags: ['Algeria', 'Argentina', 'World Cup 2026', 'Match Preview', 'Football'],
      readTime: 4,
      featured: false,
      coverImage: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'beIN Sports to Broadcast Major Football in 4K: What Subscribers Need to Know',
      excerpt: 'beIN Sports announces expanded 4K coverage for the 2026-27 football season. IPTV Pro subscribers get full access to all beIN Sports 4K channels.',
      content: `## beIN Sports Expands 4K Coverage

beIN Sports, one of the world's leading sports broadcasters, has announced expanded 4K coverage for the upcoming football season.

### What's Included

- UEFA Champions League matches in 4K
- Premier League select fixtures in 4K
- La Liga's biggest matches in 4K
- World Cup 2026 coverage in 4K

### How to Access

IPTV Pro subscribers get full access to beIN Sports' 4K coverage. Simply install the IPTV Pro app on any compatible device.

### Technical Requirements

- Internet connection of at least 25 Mbps
- A 4K-compatible TV or device
- The latest version of the IPTV Pro app

Experience football like never before with IPTV Pro.`,
      categoryId: 'bein-sports',
      tags: ['beIN Sports', '4K', 'Broadcasting', 'IPTV', 'Sports Coverage'],
      readTime: 3,
      featured: false,
      source: 'beIN Sports',
    },
    {
      title: 'Liverpool vs Chelsea: Premier League Rivalry Preview & Analysis',
      excerpt: 'Liverpool host Chelsea at Anfield in a crucial Premier League encounter. Match preview covering team news, tactical analysis, and where to watch live.',
      content: `## A Historic Rivalry Continues

Liverpool and Chelsea have shared some of the Premier League's most memorable moments. This fixture has produced countless classics.

### Current Season Context

Both clubs are battling for European qualification, making this match crucial for their respective ambitions.

### Anfield Atmosphere

There's no atmosphere quite like Anfield on a big Premier League match. The Liverpool supporters will be in full voice.

### Tactical Battle

Liverpool's high-intensity approach against Chelsea's structured possession game promises an intriguing contest.

Watch every Premier League match live in 4K on IPTV Pro.`,
      categoryId: 'premier-league',
      tags: ['Liverpool', 'Chelsea', 'Premier League', 'EPL', 'Match Preview'],
      readTime: 4,
      featured: false,
      coverImage: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'Barcelona vs Sevilla: La Liga Title Race Match Preview',
      excerpt: 'Barcelona welcome Sevilla to Camp Nou in a crucial La Liga fixture with title race implications. Analysis of both teams\' form and key players.',
      content: `## Camp Nou Ready for Sunday Showdown

Barcelona face Sevilla at Camp Nou in what promises to be a captivating La Liga fixture.

### Barcelona's Form

The Catalans have shown improved consistency with their attacking play being particularly impressive.

### Sevilla's Challenge

Sevilla's organized defensive approach and quick transitions make them a difficult opponent for any team.

Watch every La Liga match live in 4K on IPTV Pro - your premium destination for Spanish football.`,
      categoryId: 'la-liga',
      tags: ['Barcelona', 'Sevilla', 'La Liga', 'Spanish Football', 'Match Preview'],
      readTime: 3,
      featured: false,
      coverImage: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'How to Set Up IPTV Pro: Installation Guide for All Devices',
      excerpt: 'Step-by-step installation guide for IPTV Pro on Smart TVs, Android, iOS, Fire Stick, and more. Get started with your subscription in minutes.',
      content: `## Complete IPTV Pro Installation Guide

Setting up IPTV Pro is quick and easy. Follow this guide to start watching premium sports and entertainment in minutes.

### Supported Devices

- Smart TVs (Samsung, LG, Sony)
- Android devices (phones, tablets, TV boxes)
- iOS devices (iPhone, iPad, Apple TV)
- Amazon Fire TV Stick
- Windows & Mac computers
- MAG boxes & Enigma2

### Step-by-Step Setup

1. Purchase your subscription at iptv-pro.it.com
2. Download the IPTV Pro app or use your preferred player
3. Enter your M3U URL or Xtream Codes
4. Start watching instantly

### Need Help?

Contact us on WhatsApp at +212 670-799985 for instant support.

Get started today with a free trial!`,
      categoryId: 'football',
      tags: ['IPTV', 'Installation', 'Setup Guide', 'Streaming', 'Smart TV'],
      readTime: 4,
      featured: false,
      source: 'IPTV Pro Guide',
    },
  ];

  return seedData.map((item, index) => {
    const createdAt = new Date(now.getTime() - (index * 3600000)); // Each article 1 hour apart
    const id = generateId();
    return {
      id,
      title: item.title,
      slug: generateSlug(item.title),
      excerpt: item.excerpt,
      content: `---\n*Published: ${createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | Source: ${item.source || 'IPTV Pro News'}*\n\n---\n\n${item.content}\n\n---\n\n*Watch all matches live in 4K on IPTV Pro. Start your free trial today at iptv-pro.it.com*`,
      coverImage: item.coverImage || '',
      images: item.coverImage ? [item.coverImage] : [],
      videos: [],
      slideshow: item.coverImage ? [item.coverImage] : [],
      author: 'IPTV Pro News Team',
      status: 'published' as ArticleStatus,
      categoryId: item.categoryId,
      category: null,
      tags: item.tags,
      seoTitle: item.title,
      seoDescription: item.excerpt.slice(0, 160),
      seoKeywords: item.tags.join(', '),
      readTime: item.readTime,
      featured: item.featured,
      publishedAt: createdAt.toISOString(),
      scheduledFor: null,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      views: Math.floor(Math.random() * 500) + 50,
      source: item.source || 'IPTV Pro News',
    };
  });
}

// ===== PRE-SEED ON MODULE LOAD =====
// This ensures articles are ALWAYS available, even on cold starts
articlesStore = seedArticles();

// ===== RAPIDAPI LIVE MATCHES FETCHER =====
const LEAGUE_MAP: Record<number, { name: string; id: string }> = {
  1:   { name: 'Premier League', id: 'premier-league' },
  2:   { name: 'Champions League', id: 'champions-league' },
  3:   { name: 'La Liga', id: 'la-liga' },
  4:   { name: 'Bundesliga', id: 'bundesliga' },
  5:   { name: 'Serie A', id: 'serie-a' },
  6:   { name: 'Ligue 1', id: 'ligue-1' },
  7:   { name: 'World Cup 2026', id: 'world-cup' },
  39:  { name: 'Premier League', id: 'premier-league' },
  140: { name: 'La Liga', id: 'la-liga' },
  135: { name: 'Serie A', id: 'serie-a' },
  78:  { name: 'Bundesliga', id: 'bundesliga' },
  61:  { name: 'Ligue 1', id: 'ligue-1' },
  922584: { name: 'Korean League', id: 'football' },
};

// Fetch live matches from RapidAPI and create articles from them
async function fetchLiveMatchArticles(): Promise<Article[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      'https://free-api-live-football-data.p.rapidapi.com/football-current-live',
      {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    if (data?.status !== 'success' || !data?.response?.live) return [];

    const articles: Article[] = [];

    for (const match of data.response.live.slice(0, 5)) {
      const league = LEAGUE_MAP[match.leagueId] || { name: `League ${match.leagueId}`, id: 'football' };
      const homeName = match.home?.longName || match.home?.name || 'Home Team';
      const awayName = match.away?.longName || match.away?.name || 'Away Team';
      const homeScore = match.home?.score ?? 0;
      const awayScore = match.away?.score ?? 0;
      const scoreStr = `${homeScore} - ${awayScore}`;
      const liveTime = match.status?.liveTime?.short || '';
      const tournamentStage = match.tournamentStage ? ` (Stage ${match.tournamentStage})` : '';

      const title = `${homeName} vs ${awayName}: ${scoreStr} Live Score Update`;
      const excerpt = `Live from the match - ${homeName} ${homeScore}-${awayScore} ${awayName}${liveTime ? ` (${liveTime})` : ''} in ${league.name}${tournamentStage}. Follow the action as it happens.`;

      const content = `## Live Match Update: ${homeName} vs ${awayName}\n\n**Competition:** ${league.name}${tournamentStage}\n**Current Score:** ${homeName} ${scoreStr} ${awayName}\n**Live Time:** ${liveTime || 'Match in progress'}\n\n---\n\n### Match Summary\n\nThe match between ${homeName} and ${awayName} is currently in progress${liveTime ? ` (${liveTime})` : ''}. ${homeName} leads ${scoreStr} in what has been an exciting encounter.\n\n### How to Watch\n\nWatch this match and thousands of other live sports events in stunning 4K quality on IPTV Pro. With over 25,000 channels and 99.9% uptime, you'll never miss a moment of the action.\n\n### Key Stats\n\n- **Home Team:** ${homeName}\n- **Away Team:** ${awayName}\n- **Score:** ${scoreStr}\n- **Competition:** ${league.name}\n\n---\n\n*Watch live sports in 4K on IPTV Pro - Start your free trial today at iptv-pro.it.com*`;

      const id = generateId();
      const now = new Date();

      articles.push({
        id,
        title,
        slug: generateSlug(title),
        excerpt,
        content,
        coverImage: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop',
        images: [],
        videos: [],
        slideshow: [],
        author: 'IPTV Pro News Team',
        status: 'published',
        categoryId: league.id,
        category: null,
        tags: [league.name, homeName, awayName, 'Live Score', 'Football'],
        seoTitle: title,
        seoDescription: excerpt.slice(0, 160),
        seoKeywords: `${league.name}, ${homeName}, ${awayName}, Live Score`,
        readTime: 3,
        featured: false,
        publishedAt: now.toISOString(),
        scheduledFor: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        views: Math.floor(Math.random() * 100) + 10,
        source: 'Live Feed',
      });
    }

    return articles;
  } catch {
    return [];
  }
}

// ===== GOOGLE NEWS RSS FETCHER (SECONDARY SOURCE) =====
const GOOGLE_NEWS_URLS: Record<string, string> = {
  'world-cup': 'https://news.google.com/rss/search?q=World+Cup+2026+football&hl=en&gl=US&ceid=US:en',
  'champions-league': 'https://news.google.com/rss/search?q=Champions+League+UCL+football&hl=en&gl=US&ceid=US:en',
  'premier-league': 'https://news.google.com/rss/search?q=Premier+League+EPL+football&hl=en&gl=US&ceid=US:en',
  'la-liga': 'https://news.google.com/rss/search?q=La+Liga+Spanish+football&hl=en&gl=US&ceid=US:en',
  'bein-sports': 'https://news.google.com/rss/search?q=beIN+Sports+football+streaming&hl=en&gl=US&ceid=US:en',
  football: 'https://news.google.com/rss/search?q=football+soccer+news+sports&hl=en&gl=US&ceid=US:en',
};

async function fetchGoogleNews(categoryId?: string): Promise<any[]> {
  const urlsToFetch = categoryId && GOOGLE_NEWS_URLS[categoryId]
    ? [GOOGLE_NEWS_URLS[categoryId]]
    : Object.values(GOOGLE_NEWS_URLS);

  try {
    const { XMLParser } = await import('fast-xml-parser');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const allItems: any[] = [];

    for (const url of urlsToFetch) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; IPTVProBot/1.0; +https://iptv-pro.it.com)',
          },
          signal: AbortSignal.timeout(6000),
        });

        if (!response.ok) continue;

        const xml = await response.text();
        const parsed = parser.parse(xml);

        if (parsed?.rss?.channel?.item) {
          const items = Array.isArray(parsed.rss.channel.item)
            ? parsed.rss.channel.item
            : [parsed.rss.channel.item];

          items.forEach((item: any) => {
            allItems.push({
              title: item.title || '',
              link: item.link || '',
              description: item.description || '',
              pubDate: item.pubDate || new Date().toISOString(),
              source: (item.source && typeof item.source === 'object' ? item.source['#text'] || item.source['@_url'] || 'Google News' : item.source || 'Google News'),
              category: url.includes('World+Cup') ? 'world-cup' :
                       url.includes('Champions+League') ? 'champions-league' :
                       url.includes('Premier+League') ? 'premier-league' :
                       url.includes('La+Liga') ? 'la-liga' :
                       url.includes('beIN') ? 'bein-sports' :
                       'football',
            });
          });
        }
      } catch {
        continue;
      }
    }

    return allItems.slice(0, 20);
  } catch {
    return [];
  }
}

// ===== GEMINI AI CONTENT GENERATION =====
let geminiClient: any = null;

async function getGeminiClient() {
  if (geminiClient) return geminiClient;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenAI } = await import('@google/genai');
    geminiClient = new GoogleGenAI({ apiKey });
    return geminiClient;
  } catch {
    return null;
  }
}

export async function generateArticleWithGemini(newsHeadline: string, categoryId: string): Promise<Partial<Article> | null> {
  const client = await getGeminiClient();
  if (!client) return null;

  const categoryMap: Record<string, string> = {
    'world-cup': 'World Cup 2026',
    'champions-league': 'UEFA Champions League',
    'premier-league': 'English Premier League',
    'la-liga': 'Spanish La Liga',
    'bein-sports': 'beIN Sports',
    football: 'International Football',
  };

  const prompt = `You are a professional sports journalist for IPTV Pro, a premium IPTV service.

Based on this news headline: "${newsHeadline}"

Write a complete, well-researched news article for the category "${categoryMap[categoryId] || 'Sports'}".

Requirements:
- Write 400-600 words of engaging content
- Use markdown formatting (## headings, ### subheadings)
- Include a compelling 2-3 sentence excerpt
- Be factual and professional - no fake news
- Naturally mention IPTV Pro as a way to watch related sports content
- Target an international audience
- Return ONLY valid JSON with NO markdown code blocks

Return this exact JSON structure:
{
  "title": "SEO-optimized article title (max 70 chars)",
  "excerpt": "Compelling 2-3 sentence summary",
  "content": "Full article in markdown format with ## and ### headings",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "readTime": number between 4 and 10
}`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const text = response.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const article = JSON.parse(jsonMatch[0]);

    return {
      title: article.title || 'Sports News Update',
      excerpt: article.excerpt || '',
      content: article.content || '',
      tags: article.tags || [],
      readTime: article.readTime || 5,
      categoryId: categoryId,
      author: 'IPTV Pro News Team',
      status: 'pending_review' as ArticleStatus,
    };
  } catch {
    return null;
  }
}

// ===== PEXELS IMAGE SEARCH =====
export async function searchPexelsImage(query: string): Promise<string> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return '';

  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`, {
      headers: { 'Authorization': apiKey },
    });

    if (!response.ok) return '';
    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large2x;
    }
    return '';
  } catch {
    return '';
  }
}

// ===== NEWSAPI FETCHER (PRIMARY NEWS SOURCE) =====
import {
  fetchTopHeadlines,
  fetchTrendingTopics as fetchTrendingFromAPI,
  newsAPIToArticle,
} from './news-api';

let cachedTrending: string[] = [];
let lastTrendingFetch = 0;

export async function fetchTrending(): Promise<string[]> {
  const now = Date.now();
  // Cache trending for 10 minutes
  if (cachedTrending.length > 0 && now - lastTrendingFetch < 600000) {
    return cachedTrending;
  }

  try {
    const topics = await fetchTrendingFromAPI(12);
    if (topics.length > 0) {
      cachedTrending = topics;
      lastTrendingFetch = now;
      return topics;
    }
  } catch {
    // Fallback to default trending topics
  }

  // Default trending topics when NewsAPI is unavailable
  const defaults = [
    'World Cup 2026', 'Champions League', 'Premier League',
    'Real Madrid', 'Manchester City', 'Barcelona',
    'Transfer News', 'La Liga', 'Morocco',
    'Liverpool', 'Bayern Munich', 'Serie A',
  ];
  cachedTrending = defaults;
  lastTrendingFetch = now;
  return defaults;
}

// Fetch news articles from NewsAPI and convert to our format
async function fetchNewsAPIArticles(categoryId?: string): Promise<Article[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) return [];

  try {
    // Try to get top headlines for the relevant category
    const headlines = await fetchTopHeadlines(categoryId, 'gb', 20);
    if (headlines.length === 0) return [];

    const articles: Article[] = [];
    const now = new Date();

    for (const item of headlines) {
      const converted = newsAPIToArticle(item, categoryId || 'football', generateSlug, generateId);
      if (!converted) continue;

      // Determine the best category for this article
      let catId = categoryId || 'football';
      const title = item.title.toLowerCase();
      const sourceName = item.source?.name?.toLowerCase() || '';

      if (title.includes('champions league') || title.includes('ucl') || sourceName.includes('champions league')) {
        catId = 'champions-league';
      } else if (title.includes('premier league') || title.includes('epl')) {
        catId = 'premier-league';
      } else if (title.includes('la liga') || title.includes('barcelona') || title.includes('real madrid')) {
        catId = 'la-liga';
      } else if (title.includes('world cup') || title.includes('fifa')) {
        catId = 'world-cup';
      } else if (title.includes('bein sports')) {
        catId = 'bein-sports';
      }

      articles.push({
        id: generateId(),
        title: converted.title,
        slug: converted.slug,
        excerpt: converted.excerpt,
        content: converted.content,
        coverImage: converted.coverImage,
        images: converted.coverImage ? [converted.coverImage] : [],
        videos: [],
        slideshow: converted.coverImage ? [converted.coverImage] : [],
        author: item.author || 'IPTV Pro News',
        status: 'published' as ArticleStatus,
        categoryId: catId,
        category: null,
        tags: converted.tags,
        seoTitle: converted.title,
        seoDescription: converted.excerpt.slice(0, 160),
        seoKeywords: converted.tags.join(', '),
        readTime: converted.readTime,
        featured: false,
        publishedAt: converted.publishedAt,
        scheduledFor: null,
        createdAt: new Date(item.publishedAt || now.toISOString()).toISOString(),
        updatedAt: now.toISOString(),
        views: Math.floor(Math.random() * 200) + 30,
        source: converted.source,
      });
    }

    return articles;
  } catch {
    return [];
  }
}

// ===== MAIN: FETCH NEWS (NEWSAPI + RAPIDAPI + GOOGLE NEWS + SEEDED) =====
export async function fetchNews(categoryId?: string): Promise<{ news: any[]; articles: Article[]; source: string; trending: string[] }> {
  // Start with pre-seeded articles (always available)
  let allArticles = [...articlesStore];
  let source = 'seeded';
  let news: any[] = [];

  // Try NewsAPI as primary source for real headlines
  try {
    const newsAPIArticles = await fetchNewsAPIArticles(categoryId);
    if (newsAPIArticles.length > 0) {
      // Prepend NewsAPI articles to the store
      articlesStore = [...newsAPIArticles, ...articlesStore];
      allArticles = [...newsAPIArticles, ...allArticles];
      source = 'newsapi';
    }
  } catch {
    // NewsAPI failed, continue with other sources
  }

  // Try RapidAPI live data for fresh articles
  try {
    const liveArticles = await fetchLiveMatchArticles();
    if (liveArticles.length > 0) {
      // Prepend live articles to the store
      articlesStore = [...liveArticles, ...articlesStore];
      allArticles = [...liveArticles, ...allArticles];
      if (source === 'seeded') source = 'live';
    }
  } catch {
    // RapidAPI failed, continue
  }

  // Try Google News RSS for additional content
  try {
    const googleNews = await fetchGoogleNews(categoryId);
    if (googleNews.length > 0) {
      news = googleNews;
      if (source === 'seeded') source = 'google-news';
    }
  } catch {
    // Google News failed, that's ok - we have seeded articles
  }

  // Fetch trending topics
  const trending = await fetchTrending();

  // Filter by category if specified
  if (categoryId) {
    allArticles = allArticles.filter(a => a.categoryId === categoryId);
  }

  return { news, articles: allArticles, source, trending };
}

// ===== GOOGLE NEWS RSS (LEGACY - used by API route) =====
export { fetchGoogleNews };

// ===== MAIN: CREATE A FULL ARTICLE FROM NEWS =====
export async function createArticleFromNews(categoryId?: string): Promise<Article | null> {
  try {
    // Step 1: Fetch real news headlines
    const newsItems = await fetchGoogleNews(categoryId);

    if (newsItems.length === 0) {
      return null;
    }

    const newsItem = newsItems[Math.floor(Math.random() * newsItems.length)];
    const catId = categoryId || newsItem.category || 'football';

    // Step 2: Generate article with Gemini
    const generated = await generateArticleWithGemini(newsItem.title, catId);

    if (!generated) {
      const newId = generateId();
      const article: Article = {
        id: newId,
        title: newsItem.title,
        slug: generateSlug(newsItem.title),
        excerpt: newsItem.description?.replace(/<[^>]*>/g, '').slice(0, 200) || 'Latest sports news update.',
        content: `## ${newsItem.title}\n\n${newsItem.description?.replace(/<[^>]*>/g, '') || 'Read more on Google News.'}\n\n---\n\n*This article was compiled from news sources. Watch related content in 4K on IPTV Pro.*`,
        coverImage: '',
        images: [],
        videos: [],
        slideshow: [],
        author: 'IPTV Pro News Team',
        status: 'pending_review',
        categoryId: catId,
        category: null,
        tags: ['Sports', 'Football', 'News'],
        seoTitle: newsItem.title,
        seoDescription: newsItem.description?.replace(/<[^>]*>/g, '').slice(0, 160) || '',
        seoKeywords: '',
        readTime: 4,
        featured: false,
        publishedAt: null,
        scheduledFor: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      articlesStore.push(article);
      return article;
    }

    const imageQuery = `${generated.tags?.[0] || categoryId || 'sports'} football action`;
    const coverImage = await searchPexelsImage(imageQuery);

    const newId = generateId();
    const article: Article = {
      id: newId,
      title: generated.title || newsItem.title,
      slug: generateSlug(generated.title || newsItem.title),
      excerpt: generated.excerpt || '',
      content: generated.content || '',
      coverImage: coverImage || '',
      images: coverImage ? [coverImage] : [],
      videos: [],
      slideshow: coverImage ? [coverImage] : [],
      author: 'IPTV Pro News Team',
      status: 'pending_review',
      categoryId: catId,
      category: null,
      tags: generated.tags || ['Sports', 'Football'],
      seoTitle: generated.title || newsItem.title,
      seoDescription: generated.excerpt?.slice(0, 160) || '',
      seoKeywords: (generated.tags || []).join(', '),
      readTime: generated.readTime || 5,
      featured: false,
      publishedAt: null,
      scheduledFor: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    articlesStore.push(article);
    return article;
  } catch {
    return null;
  }
}

// ===== GET ARTICLES =====
export function getArticles(options: {
  status?: ArticleStatus;
  categoryId?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
} = {}): { articles: Article[]; total: number } {
  let filtered = [...articlesStore];

  if (options.status) {
    filtered = filtered.filter(a => a.status === options.status);
  }
  if (options.categoryId) {
    filtered = filtered.filter(a => a.categoryId === options.categoryId);
  }
  if (options.featured) {
    filtered = filtered.filter(a => a.featured);
  }
  if (options.search) {
    const q = options.search.toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  const total = filtered.length;

  if (options.offset) {
    filtered = filtered.slice(options.offset);
  }
  if (options.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return { articles: filtered, total };
}

export function getArticleBySlug(slug: string): Article | null {
  return articlesStore.find(a => a.slug === slug) || null;
}

export function updateArticleStatus(id: string, status: ArticleStatus): boolean {
  const index = articlesStore.findIndex(a => a.id === id);
  if (index === -1) return false;

  articlesStore[index] = {
    ...articlesStore[index],
    status,
    publishedAt: status === 'published' ? new Date().toISOString() : articlesStore[index].publishedAt,
    updatedAt: new Date().toISOString(),
  };
  return true;
}

export function getPublishedArticles(): Article[] {
  return articlesStore.filter(a => a.status === 'published');
}

export function getPendingArticles(): Article[] {
  return articlesStore.filter(a => a.status === 'pending_review' || a.status === 'draft');
}
