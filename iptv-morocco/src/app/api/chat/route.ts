import { NextResponse } from 'next/server';

const buildReply = (text: string, name?: string, inviteCode?: string) => {
  const normalized = text.toLowerCase();

  if (normalized.includes('price') || normalized.includes('tarif') || normalized.includes('price')) {
    return `Our packages start from $9.99/month with full World Cup coverage.`;
  }

  if (normalized.includes('subscribe') || normalized.includes('inscription') || normalized.includes('اشتراك')) {
    return `Perfect! Just send us your WhatsApp and we'll help you subscribe in less than 5 minutes.`;
  }

  if (normalized.includes('live') || normalized.includes('score') || normalized.includes('match')) {
    return `Yes, live World Cup matches are available now. Use the invite code ${inviteCode ?? 'N/A'} to unlock the best IPTV plan.`;
  }

  if (normalized.includes('hello') || normalized.includes('hi') || normalized.includes('bonjour') || normalized.includes('سلام')) {
    return `Hello${name ? ` ${name}` : ''}! I'm here to help with IPTV and World Cup channels.`;
  }

  return `Thanks for your message${name ? `, ${name}` : ''}. A specialist will respond shortly with the best IPTV option.`;
};

export async function POST(request: Request) {
  const body = await request.json();
  const { text, name, inviteCode } = body || {};

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'Message text is required.' }, { status: 400 });
  }

  const reply = buildReply(text, name, inviteCode);
  const response = {
    reply,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}

export async function GET(request: Request) {
  const welcome = 'Welcome to IPTV Pro chat! Use the invite button to register your session and start chatting instantly.';
  return NextResponse.json({ welcome, timestamp: new Date().toISOString() });
}
