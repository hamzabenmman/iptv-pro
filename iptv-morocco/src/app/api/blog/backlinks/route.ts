import { NextResponse } from 'next/server';

const SPAM_DOMAINS = [
  'casino', 'poker', 'gambling', 'xxx', 'adult', 'sex', 'loan',
  'crypto', 'bitcoin', 'forex', 'cialis', 'viagra',
];

function isSpam(url: string): { spam: boolean; reason?: string } {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    for (const spam of SPAM_DOMAINS) {
      if (domain.includes(spam)) {
        return { spam: true, reason: `Domain associated with ${spam} content` };
      }
    }
    return { spam: false };
  } catch {
    return { spam: true, reason: 'Invalid URL' };
  }
}

function calculateScore(url: string, description: string): number {
  let score = 50; // base score
  
  // Length bonuses
  if (description.length > 50) score += 10;
  if (description.length > 100) score += 10;
  
  // URL quality
  try {
    const domain = new URL(url).hostname;
    if (domain.endsWith('.edu') || domain.endsWith('.gov')) score += 20;
    if (domain.endsWith('.org')) score += 10;
    if (!domain.includes('-')) score += 5; // shorter domains usually better
    if (domain.split('.').length >= 2) score += 5; // has TLD
  } catch { score -= 20; }

  return Math.min(100, Math.max(0, score));
}

// POST /api/blog/backlinks - Submit a new backlink
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, domain, anchorText, description, email } = body;

    if (!url || !domain) {
      return NextResponse.json({ error: 'URL and domain are required' }, { status: 400 });
    }

    // Check for spam
    const spamCheck = isSpam(url);
    if (spamCheck.spam) {
      return NextResponse.json({
        error: 'Submission rejected',
        reason: spamCheck.reason,
        spam: true,
      }, { status: 400 });
    }

    // Calculate quality score
    const score = calculateScore(url, description || '');

    // In production: save to database
    // await submitBacklink({ url, domain, anchorText, description, email });

    return NextResponse.json({
      success: true,
      message: 'Backlink submitted for review. We will review it shortly.',
      qualityScore: score,
      needsReview: score < 70, // Flag low-quality submissions for review
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit backlink' }, { status: 500 });
  }
}

// GET /api/blog/backlinks?status=pending
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'approved';

  try {
    // In production: get from database
    // const backlinks = status === 'all' ? await getAllBacklinks() : await getPendingBacklinks();
    return NextResponse.json({ backlinks: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch backlinks' }, { status: 500 });
  }
}

// PATCH /api/blog/backlinks - Moderate backlink
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    
    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    // In production: update database
    // await updateBacklinkStatus(id, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update backlink' }, { status: 500 });
  }
}
