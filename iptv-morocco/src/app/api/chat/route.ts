// AI Sports Chatbot with Gemini - Quizzes, Real Answers, Trending Discussions
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
    { question: 'Which country has won the most FIFA World Cup titles?', options: ['Brazil', 'Germany', 'Italy', 'Argentina'], correct: 0, explanation: 'Brazil has won 5 World Cup titles (1958, 1962, 1970, 1994, 2002) - more than any other nation!' },
    { question: 'Who scored the most goals in World Cup history?', options: ['Miroslav Klose', 'Ronaldo Nazario', 'Pele', 'Lionel Messi'], correct: 0, explanation: 'Miroslav Klose holds the record with 16 World Cup goals, surpassing Ronaldo\'s 15 in 2014.' },
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

// ===== CHAT RESPONSE ENGINE =====
async function generateGeminiReply(
  userText: string,
  conversationHistory: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return `Hey there! I'm your IPTV Pro sports assistant. I can help with live scores, football quizzes, IPTV subscription info, and more. What would you like to talk about?`;
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const client = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are an enthusiastic AI sports assistant for IPTV Pro, a premium IPTV service with 25,000+ channels in HD/4K/8K.

ABOUT IPTV PRO:
- Website: iptv-pro.it.com
- Pricing: $9.99/month, $19.99/3 months, $49.99/year
- WhatsApp support: +212 670-799985
- Free trial available
- Works on Smart TVs, Android, iOS, Fire Stick, PC/Mac, MAG, Enigma2
- Categories: World Cup 2026, Champions League, Premier League, La Liga, beIN Sports

RESPONSE STYLE:
- Energetic and friendly like a passionate football commentator
- Keep responses concise (2-4 paragraphs)
- Use emojis for energy (⚽🏆🔥)
- Offer to create a football quiz when users seem bored or ask for one
- Naturally mention IPTV Pro free trial or WhatsApp when relevant

CONVERSATION HISTORY (recent messages, newest first):
${conversationHistory || "This is a new conversation."}

The user's message is: "${userText}"

Respond naturally and enthusiastically. Do NOT include quiz questions in your response text - if the user wants a quiz, just say you'll prepare one.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: systemPrompt,
      config: { temperature: 0.8, maxOutputTokens: 1024 },
    });

    return response.text?.trim() || '';
  } catch (err) {
    console.error('Gemini chat error:', err);
    return '';
  }
}

// ===== API HANDLER =====
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, name, history } = body || {};

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Message text is required.' }, { status: 400 });
    }

    const userText = text.trim();
    if (!userText) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    // Build conversation history string for context
    const historyList: { role: string; content: string }[] = [];
    if (history && Array.isArray(history)) {
      historyList.push(...history.slice(-8));
    }
    const conversationHistory = historyList
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    // Generate AI response
    const aiReply = await generateGeminiReply(userText, conversationHistory);

    // Check if user wants a quiz
    const wantsQuiz = detectQuizIntent(userText);
    let reply = aiReply || `Hey there${name ? ` ${name}` : ''}! I'm your sports AI assistant. What can I help you with today?`;
    let quiz: QuizQuestion | null = null;

    if (wantsQuiz) {
      const category = detectCategory(userText);
      const quizzes = category ? [QUIZZES[category]?.[Math.floor(Math.random() * QUIZZES[category].length)]].filter(Boolean) : getRandomQuiz(1);
      quiz = quizzes[0] || null;

      // Replace AI's quiz text with structured quiz
      if (quiz) {
        reply = `I've got a great question for you! 🏆\n\n**${quiz.question}**\n\nSelect your answer below!`;
      }
    }

    // Generate context-aware suggestions
    const lowerText = userText.toLowerCase();
    let suggestions: string[] = [];

    if (wantsQuiz) {
      suggestions = ['Another quiz! 🏆', 'Try World Cup quiz', 'Show me live matches ⚽', 'Tell me about IPTV Pro 📺'];
    } else if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('subscription') || lowerText.includes('plan')) {
      suggestions = ['What channels are included? 📡', 'Free trial details 🆓', 'Contact on WhatsApp 💬', 'Show me all plans'];
    } else if (lowerText.includes('match') || lowerText.includes('score') || lowerText.includes('live') || lowerText.includes('game')) {
      suggestions = ['Check live matches ⚽', 'World Cup 2026 fixtures 🏆', 'Premier League updates 🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Champions League news ⭐'];
    } else if (lowerText.includes('setup') || lowerText.includes('install') || lowerText.includes('device')) {
      suggestions = ['Smart TV setup 📺', 'Fire Stick guide 🔥', 'Android setup 📱', 'Contact support 💬'];
    } else if (lowerText.includes('morocco') || lowerText.includes('atlas lions')) {
      suggestions = ['Morocco World Cup matches 🇲🇦', 'Morocco squad analysis', 'World Cup 2026 Africa', 'Watch Morocco on IPTV 📺'];
    } else {
      suggestions = ['Give me a football quiz! 🏆', 'Show me live scores ⚽', 'Tell me about IPTV Pro 📺', 'What are your prices? 💰'];
    }

    return NextResponse.json({
      reply,
      suggestions: suggestions.slice(0, 4),
      quiz,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      reply: 'Sorry, something went wrong! Please try again or reach us on WhatsApp at +212 670-799985.',
      suggestions: ['Try again', 'Contact WhatsApp', 'Back to home'],
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    welcome: true,
    message: 'Welcome to IPTV Pro AI Sports Chatbot!',
    suggestions: ['Give me a football quiz!', 'Show me live scores', 'Tell me about IPTV Pro'],
    timestamp: new Date().toISOString(),
  });
}
