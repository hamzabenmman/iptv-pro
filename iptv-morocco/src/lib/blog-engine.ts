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

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) + '-' + Date.now().toString(36);
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

// ===== SEED RICH ARTICLES FOR INSTANT AVAILABILITY =====
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
      title: 'Morocco Stuns France 2-1 in World Cup 2026 Thriller',
      excerpt: 'Morocco delivered a historic performance, defeating France 2-1 in a dramatic World Cup 2026 group stage match at Khalifa Stadium. The Atlas Lions dominated possession and secured a famous victory.',
      content: `## A Historic Night for Moroccan Football

Morocco's national team etched their name in football history with a stunning 2-1 victory over France in the World Cup 2026 group stage. Playing at the iconic Khalifa Stadium in front of a passionate crowd, the Atlas Lions delivered a performance that will be remembered for generations.

### First Half Dominance

From the first whistle, Morocco took control of the match. Their high-press strategy paid off in the 23rd minute when a perfectly executed counter-attack left the French defence stranded. The crowd erupted as the ball found the back of the net, setting the tone for an unforgettable evening.

### Resilient Defence

France pushed hard for an equalizer, but Morocco's backline, organized superbly, held firm. The goalkeeper made several crucial saves, while the defenders threw themselves at every shot.

### Second Half Drama

The second half brought more excitement. France managed to equalize through a brilliant individual effort, but Morocco responded immediately. A stunning free kick restored the lead, sending the Moroccan supporters into a frenzy.

### Victory Secured

The final whistle sparked wild celebrations across the stadium and around the world. This victory cements Morocco's status as a rising force in world football and demonstrates the incredible growth of the sport in Africa.

Watch the full match replay and all World Cup 2026 action in stunning 4K quality on IPTV Pro.`,
      categoryId: 'world-cup',
      tags: ['Morocco', 'World Cup 2026', 'France', 'Football', 'Atlas Lions'],
      readTime: 5,
      featured: true,
      coverImage: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'Brazil vs Portugal: A Thrilling 3-2 Clásico in World Cup 2026',
      excerpt: 'Two football giants collided as Brazil edged Portugal 3-2 in a breathtaking encounter at Lusail Stadium. Neymar and Ronaldo both found the net in a match full of drama.',
      content: `## Samba Football Meets Portuguese Flair

Brazil and Portugal served up a World Cup 2026 classic at the magnificent Lusail Stadium. The 3-2 scoreline tells only part of the story - this was a match filled with skill, passion, and unforgettable moments.

### A Star-Studded Affair

With some of the world's best players on display, expectations were high. The match delivered from the first minute, with both teams playing attacking football that had the 88,000-strong crowd on their feet.

### Tactical Brilliance

Brazil's fluid attacking movement caused constant problems for the Portuguese defence, while Portugal's counter-attacking threat kept the Brazilian backline alert throughout. The tactical battle between the two managers added another layer of intrigue.

### Key Moments

The match swung back and forth, with each team taking the lead at different stages. Brazil's superior depth proved decisive in the end, with substitutes making crucial contributions.

Watch all World Cup 2026 matches live in 4K on IPTV Pro - your premium destination for global football coverage.`,
      categoryId: 'world-cup',
      tags: ['Brazil', 'Portugal', 'World Cup 2026', 'Neymar', 'Ronaldo'],
      readTime: 4,
      featured: true,
      coverImage: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'Real Madrid vs Bayern Munich: Champions League Preview',
      excerpt: 'Two European giants prepare for a blockbuster Champions League clash at the Santiago Bernabéu. With both teams in excellent form, this promises to be a match for the ages.',
      content: `## European Royalty Collide

Real Madrid and Bayern Munich, two of the most successful clubs in Champions League history, are set to face off in what promises to be an epic encounter at the Santiago Bernabéu.

### Form Guide

Both teams enter the match in outstanding form. Real Madrid have won their last five matches across all competitions, while Bayern Munich have been equally impressive in the Bundesliga and Champions League.

### Key Battles

The midfield battle will be crucial, with both teams possessing world-class talent in the center of the park. Real Madrid's creative playmakers will look to unlock Bayern's organized defence, while Bayern's wingers will test Madrid's full-backs at every opportunity.

### Tactical Analysis

Real Madrid's manager has favored an attacking approach, while Bayern Munich's tactical flexibility makes them dangerous opponents. This clash of styles adds an extra dimension to an already fascinating matchup.

Watch this Champions League blockbuster and every UEFA match live in 4K on IPTV Pro.`,
      categoryId: 'champions-league',
      tags: ['Real Madrid', 'Bayern Munich', 'Champions League', 'UEFA', 'Football'],
      readTime: 4,
      featured: false,
      coverImage: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'Man City vs PSG: Champions League Heavyweights Face Off',
      excerpt: 'Manchester City host Paris Saint-Germain in a mouth-watering Champions League group stage encounter. Both teams boast squads packed with talent and ambition.',
      content: `## A Battle of Financial Heavyweights

Manchester City and Paris Saint-Germain, two clubs backed by significant investment, meet in a Champions League fixture that showcases the best of modern football. The Etihad Stadium provides the backdrop for this eagerly anticipated clash.

### Star Quality on Display

The match features some of football's biggest names. City's tactical mastery under their manager has made them one of Europe's most feared sides, while PSG's individual brilliance can turn any game in an instant.

### What's at Stake

With both teams aiming for Champions League glory, every group stage point is crucial. This match could have significant implications for who tops the group and avoids tougher knockout round opponents.

### Fan Expectations

Supporters from both clubs are expecting an entertaining, open match. Given the attacking talent on both sides, goals seem almost certain.

Catch every moment of this Champions League thriller on IPTV Pro - your ultimate sports streaming companion.`,
      categoryId: 'champions-league',
      tags: ['Man City', 'PSG', 'Champions League', 'Football', 'Premier League'],
      readTime: 5,
      featured: false,
      coverImage: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'Premier League 2026-27 Season: Manchester City vs Arsenal Preview',
      excerpt: 'The new Premier League season kicks off with a title showdown as Manchester City host Arsenal at the Etihad. Both teams have strengthened significantly in the summer transfer window.',
      content: `## Title Rivals Collide on Opening Day

The Premier League 2026-27 season begins with a blockbuster encounter as defending champions Manchester City welcome Arsenal to the Etihad Stadium. This fixture could set the tone for the entire season.

### Summer Transfer Business

Both clubs have been active in the transfer market. City have added depth to their already formidable squad, while Arsenal's recruitment has focused on adding experience to their young core.

### Tactical Battle

City's possession-based approach will face a stern test against Arsenal's high-press system. The midfield battle, in particular, promises to be fascinating with world-class talent on both sides.

### Season Expectations

After last season's tight title race, both clubs will be determined to gain an early advantage. A victory here could provide crucial momentum for the long campaign ahead.

Watch every Premier League match live in 4K on IPTV Pro - over 25,000 channels of premium sports and entertainment.`,
      categoryId: 'premier-league',
      tags: ['Premier League', 'Man City', 'Arsenal', 'Football', 'EPL'],
      readTime: 4,
      featured: false,
      coverImage: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'El Clásico: Barcelona vs Real Madrid La Liga Showdown',
      excerpt: 'The biggest match in club football returns as Barcelona host Real Madrid in La Liga. With both teams level on points at the top of the table, this El Clásico has huge title implications.',
      content: `## The Greatest Show in Football

El Clásico needs no introduction. When Barcelona and Real Madrid meet, the world stops to watch. This edition of the famous rivalry carries extra weight with both teams battling for the La Liga title.

### Rich History

From Di Stéfano to Messi, from Cruyff to Ronaldo, El Clásico has been graced by the greatest players in football history. This match adds another chapter to that storied legacy.

### Current Form

Both teams enter the match in outstanding form. Barcelona's possession game has been particularly effective this season, while Real Madrid's counter-attacking prowess makes them dangerous on any surface.

### What to Expect

Expect goals, drama, and world-class football. El Clásico rarely disappoints, and with the title race so tight, the intensity will be at its maximum.

Watch El Clásico and every La Liga match live in 4K on IPTV Pro - your gateway to the best football on earth.`,
      categoryId: 'la-liga',
      tags: ['Barcelona', 'Real Madrid', 'La Liga', 'El Clásico', 'Spanish Football'],
      readTime: 5,
      featured: false,
      coverImage: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'How to Watch World Cup 2026 Live: Complete Streaming Guide',
      excerpt: 'The World Cup 2026 is here! Discover the best ways to watch every match live in stunning 4K quality. From Morocco vs France to Brazil vs Portugal, don\'t miss a single moment.',
      content: `## Your Complete World Cup 2026 Streaming Guide

The FIFA World Cup 2026 is underway, and football fans around the globe are looking for the best way to watch every match. IPTV Pro brings you comprehensive coverage of the tournament.

### Why Choose IPTV Pro?

With over 25,000 channels, 4K streaming quality, and 99.9% uptime, IPTV Pro is the ultimate destination for World Cup 2026 coverage. Watch matches live from any device, anywhere in the world.

### Coverage Includes

- All World Cup 2026 matches live and on-demand
- Multiple camera angles and commentary options
- Pre-match analysis and post-match discussion
- Expert punditry from former players and managers
- Full match replays available immediately after the final whistle

### Supported Devices

IPTV Pro works on Smart TVs, smartphones, tablets, computers, and streaming boxes. Install our easy-to-use app in minutes and start watching instantly.

### Special World Cup Offer

New subscribers get a free trial to experience the World Cup 2026 in stunning 4K quality. Join thousands of satisfied viewers worldwide.

Start your free trial today and never miss a moment of World Cup 2026 action!`,
      categoryId: 'world-cup',
      tags: ['World Cup 2026', 'Streaming', 'IPTV', 'Football', 'Live Sports'],
      readTime: 4,
      featured: false,
      source: 'Sponsored',
    },
    {
      title: 'Algeria vs Argentina: World Cup Group Stage Battle Preview',
      excerpt: 'Algeria face Argentina in a crucial World Cup 2026 group stage match at Stadium 974. With both teams needing points, expect a fiercely competitive encounter.',
      content: `## North African Giants vs South American Champions

Algeria take on Argentina in what promises to be one of the most intriguing matchups of the World Cup 2026 group stage. Stadium 974 provides the setting for this cross-continental clash.

### Algeria's Rising Stock

North African football has been on an upward trajectory, and Algeria are among the continent's best. Their organized defence and rapid counter-attacks make them a dangerous opponent for any team.

### Argentina's Title Ambitions

As always, Argentina enter a World Cup as one of the favorites. Their squad blends experienced veterans with exciting young talents, creating a formidable combination.

### What's at Stake

With group advancement potentially on the line, neither team can afford to drop points. Expect an intense, high-stakes match from the first whistle to the last.

Watch Algeria vs Argentina and every World Cup 2026 match live on IPTV Pro.`,
      categoryId: 'world-cup',
      tags: ['Algeria', 'Argentina', 'World Cup 2026', 'Football', 'Africa'],
      readTime: 4,
      featured: false,
      coverImage: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'beIN Sports to Broadcast Major Football Tournaments in 4K',
      excerpt: 'beIN Sports announces expanded 4K coverage for the 2026-27 football season, including the Champions League, Premier League, and La Liga. IPTV Pro subscribers get full access.',
      content: `## beIN Sports Expands 4K Coverage

beIN Sports, one of the world's leading sports broadcasters, has announced expanded 4K coverage for the upcoming football season. This is excellent news for football fans who demand the highest quality viewing experience.

### What's Included

The expanded coverage includes all major football competitions:
- UEFA Champions League matches in 4K
- Premier League select fixtures in 4K
- La Liga's biggest matches in 4K
- World Cup 2026 coverage in 4K

### How to Access

IPTV Pro subscribers get full access to beIN Sports' 4K coverage as part of their subscription. Simply install the IPTV Pro app on any compatible device and start watching.

### Technical Requirements

For the best 4K streaming experience, we recommend:
- Internet connection of at least 25 Mbps
- A 4K-compatible TV or device
- The latest version of the IPTV Pro app

Experience football like never before with IPTV Pro and beIN Sports in stunning 4K quality.`,
      categoryId: 'bein-sports',
      tags: ['beIN Sports', '4K', 'Broadcasting', 'IPTV', 'Sports'],
      readTime: 3,
      featured: false,
      source: 'beIN Sports',
    },
    {
      title: 'Liverpool vs Chelsea: Premier League Rivalry Renewed',
      excerpt: 'Two of England\'s most successful clubs meet as Liverpool host Chelsea at Anfield in a crucial Premier League encounter with European qualification implications.',
      content: `## A Historic Rivalry Continues

Liverpool and Chelsea have shared some of the Premier League's most memorable moments. From Steven Gerrard's emotional farewell to the numerous title-deciding clashes, this fixture has it all.

### Current Season Context

Both clubs are battling for European qualification, making this match crucial for their respective ambitions. Every point matters in the tightly contested Premier League table.

### Anfield Atmosphere

There's no atmosphere quite like Anfield on a European night or a big Premier League match. The Liverpool supporters will be in full voice, creating an intimidating environment for the visitors.

### What to Watch

The tactical battle between the two managers will be fascinating. Liverpool's high-intensity approach against Chelsea's structured possession game promises an intriguing contest.

Watch every Premier League match live in 4K on IPTV Pro - over 25,000 channels of premium content.`,
      categoryId: 'premier-league',
      tags: ['Liverpool', 'Chelsea', 'Premier League', 'EPL', 'Football'],
      readTime: 4,
      featured: false,
      coverImage: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'Barcelona vs Sevilla: La Liga Title Race Heats Up',
      excerpt: 'Barcelona welcome Sevilla to Camp Nou in a crucial La Liga encounter. The Catalans need a win to keep pressure on the league leaders in a tightly contested title race.',
      content: `## Camp Nou Ready for Sunday Showdown

Barcelona face Sevilla at Camp Nou in what promises to be a captivating La Liga fixture. With the title race entering a crucial phase, every match carries enormous significance.

### Barcelona's Form

The Catalans have shown improved consistency in recent weeks. Their attacking play has been particularly impressive, with several players finding top form at the right time.

### Sevilla's Challenge

Sevilla have established themselves as one of La Liga's most consistent performers. Their organized defensive approach and quick transitions make them a difficult opponent for any team.

### Key Players

Barcelona's creative midfielders will be key to breaking down Sevilla's defence, while Sevilla's wingers will look to exploit any space left by Barcelona's attacking full-backs.

Watch every La Liga match live in 4K on IPTV Pro - your premium destination for Spanish football.`,
      categoryId: 'la-liga',
      tags: ['Barcelona', 'Sevilla', 'La Liga', 'Spanish Football', 'Football'],
      readTime: 4,
      featured: false,
      coverImage: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&h=630&fit=crop',
    },
    {
      title: 'World Cup 2026: Complete Match Schedule and Broadcast Guide',
      excerpt: 'Everything you need to know about World Cup 2026 fixtures, kick-off times, stadiums, and where to watch every match live. Your ultimate tournament companion.',
      content: `## Your Complete World Cup 2026 Guide

The World Cup 2026 is here! Whether you're a casual viewer or a die-hard football fan, this comprehensive guide has everything you need to enjoy the tournament.

### Match Schedule

The tournament features 64 matches across multiple stadiums. Key group stage fixtures include:
- Morocco vs France (Group A)
- Brazil vs Portugal (Group B)
- Algeria vs Argentina (Group C)
- Egypt vs Senegal (Group D)
- Tunisia vs England (Group E)
- Spain vs Germany (Group F)

### Where to Watch

All matches are available live on IPTV Pro in stunning 4K quality. Subscribe now to access every match, plus expert analysis, replays, and exclusive content.

### Stadiums

Matches are being held at world-class venues including Khalifa Stadium, Lusail Stadium, Stadium 974, Al Bayt Stadium, Education City Stadium, and Al Thumama Stadium.

### Never Miss a Moment

With IPTV Pro, you can watch matches on any device, anywhere. Our service offers 99.9% uptime, instant channel switching, and crystal-clear 4K streaming.

Start your free trial today!`,
      categoryId: 'world-cup',
      tags: ['World Cup 2026', 'Schedule', 'Fixtures', 'Guide', 'Streaming'],
      readTime: 5,
      featured: true,
      coverImage: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?w=1200&h=630&fit=crop',
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

// ===== MAIN: FETCH NEWS (RAPIDAPI + GOOGLE NEWS + SEEDED) =====
export async function fetchNews(categoryId?: string): Promise<{ news: any[]; articles: Article[]; source: string }> {
  // Start with pre-seeded articles (always available)
  let allArticles = [...articlesStore];
  let source = 'seeded';
  let news: any[] = [];

  // Try RapidAPI live data for fresh articles
  try {
    const liveArticles = await fetchLiveMatchArticles();
    if (liveArticles.length > 0) {
      // Prepend live articles to the store
      articlesStore = [...liveArticles, ...articlesStore];
      allArticles = [...liveArticles, ...allArticles];
      source = 'live';
    }
  } catch {
    // RapidAPI failed, continue with seeded articles
  }

  // Try Google News RSS for additional content
  try {
    const googleNews = await fetchGoogleNews(categoryId);
    if (googleNews.length > 0) {
      news = googleNews;
      source = 'google-news';
    }
  } catch {
    // Google News failed, that's ok - we have seeded articles
  }

  // Filter by category if specified
  if (categoryId) {
    allArticles = allArticles.filter(a => a.categoryId === categoryId);
  }

  return { news, articles: allArticles, source };
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
