// Trials management API endpoint
import { NextResponse } from 'next/server';
import { getTrials, updateTrialStatus, initAnalyticsTables } from '@/lib/analytics-db';

export const dynamic = 'force-dynamic';

let initialized = false;

// GET /api/analytics/trials - List trials
export async function GET(request: Request) {
  try {
    if (!initialized) {
      await initAnalyticsTables();
      initialized = true;
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const trials = await getTrials({ status, limit, offset });
    return NextResponse.json({ trials });
  } catch (error) {
    console.error('Get trials error:', error);
    return NextResponse.json({ error: 'Failed to load trials' }, { status: 500 });
  }
}

// PATCH /api/analytics/trials - Update trial status
export async function PATCH(request: Request) {
  try {
    if (!initialized) {
      await initAnalyticsTables();
      initialized = true;
    }

    // Auth check
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword && authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    await updateTrialStatus(id, status, notes);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update trial error:', error);
    return NextResponse.json({ error: 'Failed to update trial' }, { status: 500 });
  }
}
