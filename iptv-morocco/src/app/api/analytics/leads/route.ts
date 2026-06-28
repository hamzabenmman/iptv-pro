// Leads management API endpoint
import { NextResponse } from 'next/server';
import { getLeads, createLead, updateLeadStatus, initAnalyticsTables } from '@/lib/analytics-db';

export const dynamic = 'force-dynamic';

let initialized = false;

// GET /api/analytics/leads - List leads
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

    const leads = await getLeads({ status, limit, offset });
    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Get leads error:', error);
    return NextResponse.json({ error: 'Failed to load leads' }, { status: 500 });
  }
}

// POST /api/analytics/leads - Create a lead
export async function POST(request: Request) {
  try {
    if (!initialized) {
      await initAnalyticsTables();
      initialized = true;
    }

    const body = await request.json();
    const { name, whatsapp, email, source, plan_interest, value } = body;

    if (!name || !whatsapp) {
      return NextResponse.json({ error: 'name and whatsapp are required' }, { status: 400 });
    }

    const lead = await createLead({ name, whatsapp, email, source, plan_interest, value });
    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}

// PATCH /api/analytics/leads - Update lead status
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

    await updateLeadStatus(id, status, notes);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update lead error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
