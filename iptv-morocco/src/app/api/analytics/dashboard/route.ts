// Dashboard stats API endpoint
import { NextResponse } from 'next/server';
import { getDashboardStats, initAnalyticsTables } from '@/lib/analytics-db';

export const dynamic = 'force-dynamic';

// Initialize tables on first request
let initialized = false;

// GET /api/analytics/dashboard - Get dashboard stats
export async function GET(request: Request) {
  try {
    if (!initialized) {
      await initAnalyticsTables();
      initialized = true;
    }

    // Basic auth check
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword && authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
