// Analytics tracking API endpoint
import { NextResponse } from 'next/server';
import { trackEvent, createTrial, type FreeTrial } from '@/lib/analytics-db';

export const dynamic = 'force-dynamic';

// POST /api/analytics/track - Track an event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_type, page, visitor_id, session_id, referrer, user_agent, device, browser, metadata } = body;

    if (!event_type || !page || !visitor_id) {
      return NextResponse.json({ error: 'event_type, page, and visitor_id are required' }, { status: 400 });
    }

    await trackEvent({
      event_type,
      page,
      visitor_id,
      session_id: session_id || '',
      referrer: referrer || request.headers.get('referer') || '',
      user_agent: user_agent || request.headers.get('user-agent') || '',
      device: device || '',
      browser: browser || '',
      country: '',
      metadata: metadata || {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track error:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}

// POST with trial data
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { name, whatsapp, duration, source, visitor_id } = body;

    if (!whatsapp) {
      return NextResponse.json({ error: 'whatsapp number is required' }, { status: 400 });
    }

    // Create trial record
    const trial = await createTrial({
      name: name || '',
      whatsapp,
      duration: duration || '24h',
      source: source || 'website',
      visitor_id: visitor_id || '',
    });

    // Also track as event
    await trackEvent({
      event_type: 'trial_submit',
      page: '/',
      visitor_id: visitor_id || `trial_${whatsapp}`,
      session_id: '',
      metadata: { name, whatsapp, duration, source },
    });

    return NextResponse.json({ success: true, trial });
  } catch (error) {
    console.error('Trial submit error:', error);
    return NextResponse.json({ error: 'Failed to submit trial' }, { status: 500 });
  }
}
