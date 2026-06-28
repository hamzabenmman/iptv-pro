// AI Sports Chatbot - Human-like Conversations with Smart Service Links
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ===== SPORTS QUIZ ENGINE =====
interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUIZZES: Record<string, QuizQuestion[]> = {
  'world-cup': [
    { question: 'Which country has won the most FIFA World Cup titles?', options: ['Brazil', 'Germany', 'Italy', 'Argentina'], correct: 0, explanation: 'Brazil has won 5 World Cup titles (1958, 1962, 1970, 1994, 2002) — more than any other nation!' },
    { question: 'Who scored the most goals in World Cup history?', options: ['Miroslav Klose', 'Ronaldo Nazario', 'Pele', 'Lionel Messi'], correct: 0, explanation: 'Miroslav Klose holds the record with 16 World Cup goals, surpassing Ronaldo\u2019s 15 in 2014.' },
    { question: 'In which year was the first FIFA World Cup held?', options: ['1928', '1930', '1934', '1926'], correct: 1, explanation: 'The first FIFA World Cup was held in 1930 in Uruguay, who also won the tournament.' },
    { question: 'Which African nation reached the World Cup semi-finals for the first time?', options: ['Nigeria', 'Senegal', 'Morocco', 'Ghana'], correct: 2, explanation: 'Morocco made history at the 2022 World Cup by becoming the first African nation to reach the semi-finals.' },
    { question: 'Which stadium is hosting the 2026 World Cup final?', options: ['Lusail Stadium', 'MetLife Stadium', 'Khalifa Stadium', 'SoFi Stadium'], correct: 1, explanation: 'The 2026 World Cup final will be held at MetLife Stadium in New Jersey, USA.' },
  ],
  'champions-league': [
    { question: 'Which club has won the most Champions League titles?', options: ['AC Milan', 'Bayern Munich', 'Real Madrid', 'Liverpool'], correct: 2, explanation: 'Real Madrid holds the record with 15 Champions League titles.' },
    { question: 'Who is the all-time top scorer in Champions League history?', options: ['Lionel Messi', 'Cristiano Ronaldo', 'Robert Lewandowski', 'Karim Benzema'], correct: 1, explanation: 'Cristiano Ronaldo is the all-time top scorer with 140 Champions League goals.' },
    { question: 'Which player has won the most Champions League titles?', options: ['Paolo Maldini', 'Cristiano Ronaldo', 'Paco Gento', 'Alfredo Di Stefano'], correct: 2, explanation: 'Paco Gento won 6 European Cups with Real Madrid from 1956 to 1966.' },
  ],
  'premier-league': [
    { question: 'Which club has won the most Premier League titles?', options: ['Manchester United', 'Manchester City', 'Chelsea', 'Arsenal'], correct: 0, explanation: 'Manchester United have won 13 Premier League titles.' },
    { question: 'Who holds the record for most Premier League goals?', options: ['Wayne Rooney', 'Alan Shearer', 'Harry Kane', 'Thierry Henry'], correct: 1, explanation: 'Alan Shearer holds the record with 260 Premier League goals.' },
    { question: 'Which manager has won the most Premier League titles?', options: ['Sir Alex Ferguson', 'Pep Guardiola', 'Jose Mourinho', 'Arsene Wenger'], correct: 0, explanation: 'Sir Alex Ferguson won 13 Premier League titles with Manchester United.' },
  ],
  'la-liga': [
    { question: 'Which two clubs are known as El Clasico rivals?', options: ['Atletico vs Sevilla', 'Real Madrid vs Barcelona', 'Barcelona vs Valencia', 'Real Madrid vs Atletico'], correct: 1, explanation: 'El Clasico refers to Real Madrid vs Barcelona, the biggest rivalry in Spanish football.' },
    { question: 'Who is La Liga all-time top scorer?', options: ['Cristiano Ronaldo', 'Raul Gonzalez', 'Telmo Zarra', 'Lionel Messi'], correct: 3, explanation: 'Lionel Messi is La Liga all-time top scorer with 474 goals for Barcelona.' },
  ],
  football: [
    { question: 'Which country invented modern football (soccer)?', options: ['Brazil', 'Italy', 'England', 'Germany'], correct: 2, explanation: 'Modern football was codified in England in 1863.' },
    { question: 'Who is known as The King of Football?', options: ['Diego Maradona', 'Pele', 'Johan Cruyff', 'Zinedine Zidane'], correct: 1, explanation: 'Pele is known as The King of Football, winning three World Cups with Brazil.' },
  ],
};

const ALL_QUESTIONS = Object.values(QUIZZES).flat();

function getRandomQuiz(count: number = 1): QuizQuestion[] {
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function detectQuizIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes('quiz') || lower.includes('trivia') || lower.includes('test me') ||
         lower.includes('challenge') || lower.includes('question') || lower.includes('ask me') ||
         lower === 'another one' || lower === 'another' || lower === 'next';
}

function detectCategory(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes('world cup') || lower.includes('wc')) return 'world-cup';
  if (lower.includes('champions league') || lower.includes('ucl')) return 'champions-league';
  if (lower.includes('premier league') || lower.includes('epl') || lower.includes('premier')) return 'premier-league';
  if (lower.includes('la liga') || lower.includes('laliga') || lower.includes('clasico')) return 'la-liga';
  return null;
}

// ===== SITE LINK BUILDER =====
function siteLink(locale: string, path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iptv-pro.it.com';
  if (path.startsWith('http')) return path;
  return `${baseUrl}/${locale}${path}`;
}

function whatsappLink(): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '212670799985';
  return `https://wa.me/${number}`;
}

// ===== SERVICE INTENT DETECTION & LINK GENERATION =====
interface ServiceLink {
  topic: string;
  text: string;
  url: string;
}

function detectServiceLinks(text: string, locale: string): { intro: string; links: ServiceLink[] } {
  const lower = text.toLowerCase();

  const allLinks: { keywords: string[]; topic: string; text: string; path: string }[] = [
    { keywords: ['price', 'pricing', 'cost', 'subscription', 'plan', 'monthly', 'yearly', 'pay', 'payment'], topic: 'pricing', text: '\uD83D\uDCB0 View IPTV Pro Plans & Pricing', path: '/#pricing' },
    { keywords: ['feature', 'channel', 'stream', 'quality', 'hd', '4k', 'sport', 'what do you offer'], topic: 'features', text: '\u2728 Explore Premium Features', path: '/#features' },
    { keywords: ['install', 'setup', 'guide', 'device', 'smart tv', 'firestick', 'android', 'iphone', 'how to'], topic: 'guide', text: '\uD83D\uDCD6 Installation Guides by Device', path: '/#guide' },
    { keywords: ['faq', 'question', 'help', 'tutorial', 'how does', 'what is'], topic: 'faq', text: '\u2753 Frequently Asked Questions', path: '/#faq' },
    { keywords: ['contact', 'support', 'help', 'assistance', 'talk', 'agent', 'human'], topic: 'contact', text: '\uD83D\uDCE9 Contact & Support', path: '/#contact' },
    { keywords: ['trial', 'free', 'try', 'sample', 'test'], topic: 'trial', text: '\uD83C\uDF81 Claim Your Free Trial', path: '/#free-trial' },
    { keywords: ['blog', 'article', 'news', 'guide', 'tip', 'morocco', 'world cup', 'match', 'update'], topic: 'blog', text: '\uD83D\uDCF0 Read Latest Sports & IPTV News', path: '/blog' },
    { keywords: ['match', 'live', 'score', 'fixture', 'calendar', 'game', 'sport', 'football'], topic: 'matches', text: '\u26BD Live Matches & Sports Calendar', path: '/matches' },
    { keywords: ['whatsapp', 'message', 'chat', 'call'], topic: 'whatsapp', text: '\uD83D\uDCAC Chat on WhatsApp', path: '' },
  ];

  const matched: ServiceLink[] = [];
  for (const item of allLinks) {
    if (item.keywords.some(k => lower.includes(k))) {
      if (item.topic === 'whatsapp') {
        matched.push({ topic: item.topic, text: item.text, url: whatsappLink() });
      } else {
        matched.push({ topic: item.topic, text: item.text, url: siteLink(locale, item.path) });
      }
    }
  }

  // Deduplicate by topic
  const unique = matched.filter((v, i, a) => a.findIndex(t => t.topic === v.topic) === i);

  let intro = '';
  if (unique.length > 0) {
    intro = `\n\nHere's what might help:\n`;
  }

  return { intro, links: unique.slice(0, 4) };
}

// ===== CONVERSATIONAL RESPONSE GENERATOR =====
async function generateGeminiReply(
  userText: string,
  conversationHistory: string,
  locale: string
): Promise<{ reply: string; suggestions: string[] }> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const whatsapp = whatsappLink();
  const homeLink = siteLink(locale, '');
  const blogLink = siteLink(locale, '/blog');
  const matchesLink = siteLink(locale, '/matches');

  // Link-rich knowledge prompt
  const systemInfo = `
ABOUT IPTV PRO:
- **Website:** ${homeLink}
- **Pricing:** Starts at $9.99/month (save up to 58% with annual)
- **WhatsApp:** ${whatsapp} (24/7 support)
- **Free Trial:** Available — ask about it!
- **Channels:** 25,000+ HD/4K/8K live channels
- **Sports:** World Cup 2026, Champions League, Premier League, La Liga, beIN Sports, all major leagues
- **Devices:** Smart TVs, Android, iOS, Fire Stick, PC/Mac, MAG, Enigma2
- **Blog:** ${blogLink}
- **Live Matches:** ${matchesLink}
`;

  const knowledgeBase = `
IMPORTANT LINKS TO SHARE WHEN RELEVANT:
- Pricing & plans: ${siteLink(locale, '/#pricing')}
- Features overview: ${siteLink(locale, '/#features')}
- Installation guides by device: ${siteLink(locale, '/#guide')}
- FAQ: ${siteLink(locale, '/#faq')}
- Contact & support: ${siteLink(locale, '/#contact')}
- Blog with sports news & IPTV tips: ${blogLink}
- Live matches & sports calendar: ${matchesLink}
- Free trial: ${siteLink(locale, '/#free-trial')}
- WhatsApp support: ${whatsapp}
`;

  if (!apiKey) {
    // Fallback conversational responses when no Gemini key is set
    const lower = userText.toLowerCase();

    if (lower.includes('price') || lower.includes('cost') || lower.includes('subscription') || lower.includes('plan')) {
      return {
        reply: `Great question! Our IPTV plans are designed to fit every budget:\n\n\u2022 **Monthly** — $9.99/month, full access\n\u2022 **3 Months** — $19.99 (save 33%)\n\u2022 **Yearly** — $49.99 (save 58% — best value!)\n\nAll plans include 25,000+ channels in HD/4K/8K, 24/7 support, and free updates. Ready to get started? We also offer a **free trial** so you can test the service risk-free!`,
        suggestions: ['\uD83D\uDCB0 Compare plans', '\uD83C\uDF81 Free trial details', '\u2705 Features included', '\uD83D\uDCAC Contact WhatsApp'],
      };
    }

    if (lower.includes('trial') || lower.includes('free') || (lower.includes('try') && !lower.includes('try again'))) {
      return {
        reply: `Absolutely! We offer a **free trial** so you can experience IPTV Pro before committing. Here's what you get:\n\n\u2022 Access to all 25,000+ channels\n\u2022 HD/4K/8K streaming quality\n\u2022 Full sports package (World Cup, UCL, Premier League, beIN Sports)\n\u2022 Works on all devices\n\nIt only takes a minute to start — just tap the free trial link and we'll get you set up!`,
        suggestions: ['\uD83D\uDCB0 View plans', '\uD83D\uDCD6 How to install', '\u26BD Live sports info', '\uD83D\uDCAC WhatsApp now'],
      };
    }

    if (lower.includes('install') || lower.includes('setup') || lower.includes('device') || lower.includes('how to')) {
      return {
        reply: `Setting up IPTV Pro is super easy! Here's the quick guide:\n\n1\ufe0f\u20e3 **Choose your device** — Smart TV, Fire Stick, Android, iPhone, PC/Mac, or MAG\n2\ufe0f\u20e3 **Download the app** or configure via the setup steps\n3\ufe0f\u20e3 **Enter your credentials** (we'll provide these)\n4\ufe0f\u20e3 **Start watching** — instant access to 25,000+ channels!\n\nWe have step-by-step guides for every device. Need personal help? Our support team is available 24/7!`,
        suggestions: ['\uD83D\uDCF1 Android setup', '\uD83D\uDDA5\ufe0f Smart TV guide', '\uD83D\uDD25 Fire Stick guide', '\uD83D\uDCAC WhatsApp support'],
      };
    }

    if (lower.includes('match') || lower.includes('score') || lower.includes('live') || lower.includes('game') || lower.includes('sport')) {
      return {
        reply: `We've got you covered for live sports! \u26BD\n\nYou can check all **live matches and fixtures** on our sports calendar. With IPTV Pro, you get access to:\n\n\u2022 World Cup 2026 qualifying & finals\n\u2022 Champions League & Europa League\n\u2022 Premier League, La Liga, Serie A\n\u2022 beIN Sports, Sky Sports, ESPN\n\u2022 All major leagues & tournaments\n\nWant to watch live on your device? We can help you set up in minutes!`,
        suggestions: ['\u26BD Live matches now', '\uD83C\uDFC6 World Cup 2026', '\uD83D\uDCF0 Latest sports news', '\uD83D\uDCB0 View plans'],
      };
    }

    if (lower.includes('morocco') || lower.includes('atlas') || lower.includes('maghreb') || lower.includes('botola')) {
      return {
        reply: `Morocco's football scene is thriving! \uD83C\uDDF2\uD83C\uDDE6\n\n\u2022 **Atlas Lions** — made history reaching the 2022 World Cup semi-finals\n\u2022 **Botola Pro** — Morocco's top division with Wydad, Raja, FAR Rabat\n\u2022 **World Cup 2026** — Morocco will compete in the expanded 48-team tournament\n\nWith IPTV Pro, watch all Moroccan matches, Botola Pro, CAF Champions League, and beIN Sports coverage!`,
        suggestions: ['\u26BD Morocco matches live', '\uD83C\uDFC6 Botola Pro info', '\uD83C\uDFF3\ufe0f\u200D\uD83C\uDF08 World Cup 2026', '\uD83D\uDCAC Free trial'],
      };
    }

    if (lower.includes('feature') || lower.includes('channel') || lower.includes('what do you') || lower.includes('offer')) {
      return {
        reply: `Here's what makes IPTV Pro the best choice: \u2728\n\n\u2022 **25,000+ channels** in HD/4K/8K quality\n\u2022 **All sports** — World Cup, Champions League, Premier League, beIN Sports\n\u2022 **Movies & series** — Latest releases and classics\n\u2022 **99.9% uptime** with ultra-fast servers\n\u2022 **24/7 support** via WhatsApp\n\u2022 **Works on every device** — TV, phone, tablet, PC\n\u2022 **Anti-freeze technology** for buffer-free streaming\n\nReady to try? Grab your free trial! \uD83C\uDF81`,
        suggestions: ['\uD83D\uDCB0 View pricing', '\uD83D\uDCD6 Setup guide', '\u26BD Sports channels', '\uD83D\uDCAC WhatsApp chat'],
      };
    }

    if (lower.includes('blog') || lower.includes('article') || lower.includes('news') || lower.includes('read')) {
      return {
        reply: `Check out our blog for the latest sports news, IPTV tips, and World Cup updates! \uD83D\uDCF0\n\nWe cover:\n\u2022 World Cup 2026 qualifying & previews\n\u2022 Champions League analysis\n\u2022 Premier League & La Liga updates\n\u2022 IPTV setup guides & tips\n\u2022 Moroccan football & Botola Pro\n\nNew articles added regularly!`,
        suggestions: ['\uD83D\uDCF0 Latest articles', '\uD83C\uDFC6 World Cup news', '\u26BD Match reports', '\uD83D\uDCB0 IPTV Pro plans'],
      };
    }

    return {
      reply: `Hey there! \uD83D\uDC4B I'm your IPTV Pro sports assistant. I can help you with:\n\n\u2022 \u26BD **Live scores & sports updates**\n\u2022 \uD83C\uDFC6 **Football quizzes & trivia**\n\u2022 \uD83D\uDCB0 **IPTV subscription info** (plans, features, pricing)\n\u2022 \uD83D\uDCD6 **Installation guides** for any device\n\u2022 \uD83C\uDFF3\ufe0f\u200D\uD83C\uDF08 **World Cup 2026 news**\n\u2022 \uD83C\uDDF2\uD83C\uDDE6 **Moroccan football updates**\n\nWhat would you like to know about? Feel free to ask me anything!`,
      suggestions: ['\uD83D\uDCB0 What are your prices?', '\u26BD Show me live matches', '\uD83C\uDF81 Free trial info', '\uD83C\uDFC6 Football quiz!'],
    };
  }

  // --- Gemini-powered responses ---
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const client = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are an enthusiastic, human-like AI sports assistant for **IPTV Pro** — a premium IPTV service.

${systemInfo}

${knowledgeBase}

CONVERSATION STYLE:
- **Sound natural and warm**, like a knowledgeable friend who loves sports and tech
- Keep responses **concise** (2-4 short paragraphs max)
- Use emojis naturally for energy (\u26BD\uD83C\uDFC6\uD83D\uDD25\u2728)
- **Vary your sentence structure** — don't sound repetitive or robotic
- If someone seems unsure, offer to help with a specific next step
- **Do NOT include links/URLs in your response text** — the system will append them automatically
- Just answer naturally; the relevant links will be shown separately
- **Never sound like a script** — adapt to each user's tone and questions
- If they mention a specific sport, team, or league, show genuine enthusiasm
- When appropriate, ask an engaging follow-up question to keep the conversation flowing
- **Important:** Do NOT include quiz questions in your response text. If the user wants a quiz, just say you'll prepare one.

CONVERSATION HISTORY (recent messages, newest first):
${conversationHistory || "This is a new conversation."}

The user's message is: "${userText}"

Respond naturally like a human sports expert who also happens to know everything about IPTV Pro.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: systemPrompt,
      config: { temperature: 0.85, maxOutputTokens: 1024 },
    });

    const replyText = response.text?.trim() || '';

    if (replyText) {
      // Generate context-aware suggestions based on the conversation
      const suggestions = generateContextSuggestions(userText, locale);
      return { reply: replyText, suggestions };
    }
  } catch (err) {
    console.error('Gemini chat error:', err);
  }

  // Fallback
  return {
    reply: `Hey there! \uD83D\uDC4B I'm here to help with anything about IPTV Pro or sports. Ask me about pricing, live matches, installation, or even challenge me to a football quiz!`,
    suggestions: ['\uD83D\uDCB0 Pricing & plans', '\u26BD Live matches', '\uD83D\uDCD6 How to install', '\uD83C\uDFC6 Football quiz'],
  };
}

function generateContextSuggestions(text: string, locale: string): string[] {
  const lower = text.toLowerCase();

  if (lower.includes('price') || lower.includes('cost') || lower.includes('subscription') || lower.includes('plan') || lower.includes('pay')) {
    return ['\uD83D\uDCB0 Compare plans', '\uD83C\uDF81 Free trial', '\u2728 All features', '\uD83D\uDCAC WhatsApp us'];
  }
  if (lower.includes('trial') || lower.includes('free') || lower.includes('try')) {
    return ['\uD83D\uDCB0 View plans', '\uD83D\uDCD6 Setup guide', '\u26BD Sports channels', '\uD83D\uDCAC WhatsApp chat'];
  }
  if (lower.includes('install') || lower.includes('setup') || lower.includes('device') || lower.includes('how to') || lower.includes('guide')) {
    return ['\uD83D\uDCF1 Android setup', '\uD83D\uDDA5\ufe0f Smart TV', '\uD83D\uDD25 Fire Stick', '\uD83D\uDCAC WhatsApp help'];
  }
  if (lower.includes('match') || lower.includes('score') || lower.includes('live') || lower.includes('game') || lower.includes('sport') || lower.includes('football') || lower.includes('soccer')) {
    return ['\u26BD Live matches now', '\uD83C\uDFC6 World Cup 2026', '\uD83D\uDCF0 Latest news', '\uD83C\uDF81 Free trial'];
  }
  if (lower.includes('channel') || lower.includes('feature') || lower.includes('what do you') || lower.includes('offer') || lower.includes('include')) {
    return ['\uD83D\uDCB0 View plans', '\u26BD Sports package', '\uD83D\uDCD6 Device setup', '\uD83D\uDCAC WhatsApp us'];
  }
  if (lower.includes('morocco') || lower.includes('atlas') || lower.includes('botola') || lower.includes('maghreb') || lower.includes('casablanca') || lower.includes('rabat')) {
    return ['\u26BD Morocco matches', '\uD83C\uDFC6 World Cup 2026', '\uD83D\uDCF0 Morocco blog', '\uD83C\uDF81 Free trial'];
  }
  if (lower.includes('blog') || lower.includes('article') || lower.includes('news') || lower.includes('read')) {
    return ['\uD83D\uDCF0 Latest articles', '\uD83C\uDFC6 World Cup news', '\u26BD Match reports', '\uD83D\uDCB0 IPTV plans'];
  }
  if (lower.includes('quiz') || lower.includes('trivia') || lower.includes('challenge') || lower.includes('question')) {
    return ['\uD83C\uDFC6 Another quiz!', '\uD83C\uDFC6 World Cup quiz', '\u26BD Football quiz', '\uD83D\uDCB0 About IPTV Pro'];
  }

  return ['\uD83D\uDCB0 Pricing & plans', '\u26BD Live matches', '\uD83C\uDF81 Free trial', '\uD83C\uDFC6 Football quiz!'];
}

// ===== API HANDLER =====
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, name, history, locale } = body || {};

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Message text is required.' }, { status: 400 });
    }

    const userText = text.trim();
    if (!userText) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    const userLocale = typeof locale === 'string' && locale.length === 2 ? locale : 'en';

    // Build conversation history
    const historyList: { role: string; content: string }[] = [];
    if (history && Array.isArray(history)) {
      historyList.push(...history.slice(-8));
    }
    const conversationHistory = historyList
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    // Generate AI response
    const { reply: aiReply, suggestions: aiSuggestions } = await generateGeminiReply(userText, conversationHistory, userLocale);

    // Check if user wants a quiz
    const wantsQuiz = detectQuizIntent(userText);
    let reply = aiReply;
    let quiz: QuizQuestion | null = null;

    if (wantsQuiz) {
      const category = detectCategory(userText);
      const quizPool = category ? QUIZZES[category] : null;
      const quizzes = quizPool
        ? [quizPool[Math.floor(Math.random() * quizPool.length)]]
        : getRandomQuiz(1);
      quiz = quizzes[0] || null;

      if (quiz) {
        reply = `I've got a great question for you! \uD83C\uDFC6\n\n**${quiz.question}**\n\nSelect your answer below!`;
      }
    }

    // Detect service links to include
    const { intro, links } = detectServiceLinks(userText, userLocale);

    // Append service links to reply (unless it's a quiz)
    if (links.length > 0 && !wantsQuiz) {
      reply += intro + links.map(l => `\u2022 **${l.text}** — ${l.url}`).join('\n');
    }

    // Get suggestions
    const suggestions = wantsQuiz
      ? ['Another quiz! \uD83C\uDFC6', 'Try World Cup quiz', 'Show me live matches \u26BD', 'Tell me about IPTV Pro \uD83D\uDCB0']
      : aiSuggestions;

    return NextResponse.json({
      reply,
      suggestions: suggestions.slice(0, 4),
      quiz,
      links: links.length > 0 ? links : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      reply: 'Sorry, I had a little glitch there! \uD83D\uDE05 Mind trying again? Or you can reach us directly on WhatsApp anytime.',
      suggestions: ['Try again', 'Contact WhatsApp', 'Back to home'],
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  }
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iptv-pro.it.com';
  return NextResponse.json({
    welcome: true,
    message: 'Hey there! \uD83D\uDC4B I\'m your IPTV Pro AI assistant. Ask me about pricing, live sports, setup guides, or challenge me to a quiz!',
    suggestions: ['\uD83D\uDCB0 What are your prices?', '\u26BD Show me live matches', '\uD83D\uDCD6 How to install', '\uD83C\uDFC6 Give me a football quiz!'],
    timestamp: new Date().toISOString(),
  });
}
