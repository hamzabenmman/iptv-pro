// Analytics database layer - tracks visitors, trials, and conversions
// Uses Neon serverless Postgres, falls back to in-memory when no DB

// ===== Types =====
export interface AnalyticsEvent {
  id: string;
  event_type: 'pageview' | 'click' | 'trial_submit' | 'trial_convert' | 'chat_start' | 'whatsapp_click' | 'scroll_depth' | 'conversion';
  page: string;
  visitor_id: string;
  session_id: string;
  referrer?: string;
  user_agent?: string;
  country?: string;
  device?: string;
  browser?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface FreeTrial {
  id: string;
  name: string;
  whatsapp: string;
  duration: string;
  status: 'pending' | 'contacted' | 'converted' | 'expired' | 'cancelled';
  source: string;
  visitor_id?: string;
  notes?: string;
  assigned_to?: string;
  contacted_at?: string;
  converted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesLead {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  source: string;
  status: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  plan_interest?: string;
  value?: number;
  notes?: string;
  assigned_to?: string;
  last_contacted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalVisitors: number;
  todayVisitors: number;
  totalTrials: number;
  todayTrials: number;
  convertedTrials: number;
  conversionRate: number;
  totalLeads: number;
  wonLeads: number;
  totalRevenue: number;
  weeklyVisitors: { date: string; count: number }[];
  topPages: { page: string; views: number }[];
  topSources: { source: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  recentTrials: FreeTrial[];
  recentLeads: SalesLead[];
  trialsByStatus: { status: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
}

// ===== In-memory fallback =====
let memoryEvents: AnalyticsEvent[] = [];
let memoryTrials: FreeTrial[] = [];
let memoryLeads: SalesLead[] = [];
let memoryIdCounter = 0;

function generateId(): string {
  memoryIdCounter++;
  return `analytics_${Date.now()}_${memoryIdCounter}`;
}

// ===== DB Connection =====
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sql: any = null;
let _sqlReady = false;

async function getSql(): Promise<((strings: TemplateStringsArray, ...values: unknown[]) => Promise<any[]>) | null> {
  if (!process.env.DATABASE_URL) return null;
  if (_sqlReady) return _sql;
  try {
    const mod = await import('@neondatabase/serverless');
    _sql = mod.neon(process.env.DATABASE_URL!);
    _sqlReady = true;
    return _sql;
  } catch {
    return null;
  }
}

// ===== Schema Init =====
export async function initAnalyticsTables(): Promise<void> {
  const sql = await getSql();
  if (!sql) return;

  try {
    await sql`CREATE TABLE IF NOT EXISTS analytics_events (id TEXT PRIMARY KEY, event_type TEXT NOT NULL DEFAULT 'pageview', page TEXT NOT NULL DEFAULT '/', visitor_id TEXT NOT NULL, session_id TEXT NOT NULL DEFAULT '', referrer TEXT DEFAULT '', user_agent TEXT DEFAULT '', country TEXT DEFAULT '', device TEXT DEFAULT '', browser TEXT DEFAULT '', metadata JSONB DEFAULT '{}', created_at TIMESTAMP DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS free_trials (id TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT '', whatsapp TEXT NOT NULL, duration TEXT DEFAULT '24h', status TEXT DEFAULT 'pending', source TEXT DEFAULT 'website', visitor_id TEXT DEFAULT '', notes TEXT DEFAULT '', assigned_to TEXT DEFAULT '', contacted_at TIMESTAMP, converted_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS sales_leads (id TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT '', whatsapp TEXT NOT NULL DEFAULT '', email TEXT DEFAULT '', source TEXT DEFAULT 'website', status TEXT DEFAULT 'new', plan_interest TEXT DEFAULT '', value NUMERIC DEFAULT 0, notes TEXT DEFAULT '', assigned_to TEXT DEFAULT '', last_contacted_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_created ON analytics_events(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_visitor ON analytics_events(visitor_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_trials_status ON free_trials(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_trials_created ON free_trials(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_status ON sales_leads(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_created ON sales_leads(created_at)`;
  } catch (e) {
    console.error('Failed to init analytics tables:', e);
  }
}

// ===== Events =====
export async function trackEvent(event: Omit<AnalyticsEvent, 'id' | 'created_at'>): Promise<void> {
  const sql = await getSql();
  const now = new Date().toISOString();

  if (!sql) {
    memoryEvents.push({ ...event, id: generateId(), created_at: now });
    if (memoryEvents.length > 10000) memoryEvents = memoryEvents.slice(-10000);
    return;
  }

  try {
    await sql`INSERT INTO analytics_events (id, event_type, page, visitor_id, session_id, referrer, user_agent, country, device, browser, metadata) VALUES (${generateId()}, ${event.event_type}, ${event.page}, ${event.visitor_id}, ${event.session_id}, ${event.referrer || ''}, ${event.user_agent || ''}, ${event.country || ''}, ${event.device || ''}, ${event.browser || ''}, ${JSON.stringify(event.metadata || {})})`;
  } catch (e) {
    console.error('trackEvent error:', e);
    memoryEvents.push({ ...event, id: generateId(), created_at: now });
  }
}

export async function getEvents(options: {
  type?: string; page?: string; visitor_id?: string; since?: string; limit?: number;
} = {}): Promise<AnalyticsEvent[]> {
  const sql = await getSql();

  if (!sql) {
    let filtered = [...memoryEvents];
    if (options.type) filtered = filtered.filter(e => e.event_type === options.type);
    if (options.page) filtered = filtered.filter(e => e.page === options.page);
    if (options.visitor_id) filtered = filtered.filter(e => e.visitor_id === options.visitor_id);
    if (options.since) filtered = filtered.filter(e => e.created_at >= options.since!);
    return filtered.slice(-(options.limit || 100)).reverse();
  }

  try {
    const results: any[] = await sql`SELECT * FROM analytics_events WHERE 1=1 ORDER BY created_at DESC LIMIT ${options.limit || 100}`;
    return results.map((r: any) => ({
      ...r,
      created_at: r.created_at?.toISOString?.() || r.created_at || new Date().toISOString(),
    }));
  } catch (e) {
    console.error('getEvents error:', e);
    return [];
  }
}

// ===== Free Trials =====
export async function createTrial(data: {
  name: string; whatsapp: string; duration: string; source?: string; visitor_id?: string;
}): Promise<FreeTrial> {
  const sql = await getSql();
  const id = generateId();
  const now = new Date().toISOString();

  if (!sql) {
    const trial: FreeTrial = {
      id, name: data.name, whatsapp: data.whatsapp, duration: data.duration,
      status: 'pending', source: data.source || 'website', visitor_id: data.visitor_id || '',
      notes: '', assigned_to: '', created_at: now, updated_at: now,
    };
    memoryTrials.unshift(trial);
    return trial;
  }

  try {
    const results: any[] = await sql`INSERT INTO free_trials (id, name, whatsapp, duration, status, source, visitor_id) VALUES (${id}, ${data.name}, ${data.whatsapp}, ${data.duration}, 'pending', ${data.source || 'website'}, ${data.visitor_id || ''}) RETURNING *`;
    return mapTrial(results[0]);
  } catch (e) {
    console.error('createTrial error:', e);
    const trial: FreeTrial = {
      id, name: data.name, whatsapp: data.whatsapp, duration: data.duration,
      status: 'pending', source: data.source || 'website', visitor_id: data.visitor_id || '',
      notes: '', assigned_to: '', created_at: now, updated_at: now,
    };
    memoryTrials.unshift(trial);
    return trial;
  }
}

export async function getTrials(options: {
  status?: string; limit?: number; offset?: number;
} = {}): Promise<FreeTrial[]> {
  const sql = await getSql();

  if (!sql) {
    let filtered = [...memoryTrials];
    if (options.status) filtered = filtered.filter(t => t.status === options.status);
    return filtered.slice(options.offset || 0, (options.offset || 0) + (options.limit || 100));
  }

  try {
    const results: any[] = await sql`SELECT * FROM free_trials WHERE 1=1 ORDER BY created_at DESC LIMIT ${options.limit || 50} OFFSET ${options.offset || 0}`;
    return results.map(mapTrial);
  } catch (e) {
    console.error('getTrials error:', e);
    return [];
  }
}

export async function updateTrialStatus(id: string, status: FreeTrial['status'], notes?: string): Promise<void> {
  const sql = await getSql();
  const now = new Date().toISOString();

  if (!sql) {
    const trial = memoryTrials.find(t => t.id === id);
    if (trial) {
      trial.status = status;
      trial.updated_at = now;
      if (notes) trial.notes = notes;
      if (status === 'contacted') trial.contacted_at = now;
      if (status === 'converted') trial.converted_at = now;
    }
    return;
  }

  try {
    if (status === 'contacted') {
      await sql`UPDATE free_trials SET status = ${status}, contacted_at = NOW(), updated_at = NOW(), notes = COALESCE(${notes || ''}, notes) WHERE id = ${id}`;
    } else if (status === 'converted') {
      await sql`UPDATE free_trials SET status = ${status}, converted_at = NOW(), updated_at = NOW(), notes = COALESCE(${notes || ''}, notes) WHERE id = ${id}`;
    } else if (notes) {
      await sql`UPDATE free_trials SET status = ${status}, updated_at = NOW(), notes = ${notes} WHERE id = ${id}`;
    } else {
      await sql`UPDATE free_trials SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
    }
  } catch (e) {
    console.error('updateTrialStatus error:', e);
  }
}

// ===== Sales Leads =====
export async function createLead(data: {
  name: string; whatsapp: string; email?: string; source?: string; plan_interest?: string; value?: number;
}): Promise<SalesLead> {
  const sql = await getSql();
  const id = generateId();
  const now = new Date().toISOString();

  if (!sql) {
    const lead: SalesLead = {
      id, name: data.name, whatsapp: data.whatsapp, email: data.email || '',
      source: data.source || 'manual', status: 'new', plan_interest: data.plan_interest || '',
      value: data.value || 0, notes: '', assigned_to: '', created_at: now, updated_at: now,
    };
    memoryLeads.unshift(lead);
    return lead;
  }

  try {
    const results: any[] = await sql`INSERT INTO sales_leads (id, name, whatsapp, email, source, status, plan_interest, value) VALUES (${id}, ${data.name}, ${data.whatsapp}, ${data.email || ''}, ${data.source || 'manual'}, 'new', ${data.plan_interest || ''}, ${data.value || 0}) RETURNING *`;
    return mapLead(results[0]);
  } catch (e) {
    console.error('createLead error:', e);
    const lead: SalesLead = {
      id, name: data.name, whatsapp: data.whatsapp, email: data.email || '',
      source: data.source || 'manual', status: 'new', plan_interest: data.plan_interest || '',
      value: data.value || 0, notes: '', assigned_to: '', created_at: now, updated_at: now,
    };
    memoryLeads.unshift(lead);
    return lead;
  }
}

export async function getLeads(options: {
  status?: string; limit?: number; offset?: number;
} = {}): Promise<SalesLead[]> {
  const sql = await getSql();

  if (!sql) {
    let filtered = [...memoryLeads];
    if (options.status) filtered = filtered.filter(l => l.status === options.status);
    return filtered.slice(options.offset || 0, (options.offset || 0) + (options.limit || 100));
  }

  try {
    const results: any[] = await sql`SELECT * FROM sales_leads WHERE 1=1 ORDER BY created_at DESC LIMIT ${options.limit || 50} OFFSET ${options.offset || 0}`;
    return results.map(mapLead);
  } catch (e) {
    console.error('getLeads error:', e);
    return [];
  }
}

export async function updateLeadStatus(id: string, status: SalesLead['status'], notes?: string): Promise<void> {
  const sql = await getSql();

  if (!sql) {
    const lead = memoryLeads.find(l => l.id === id);
    if (lead) {
      lead.status = status;
      lead.updated_at = new Date().toISOString();
      if (notes) lead.notes = notes;
    }
    return;
  }

  try {
    if (notes) {
      await sql`UPDATE sales_leads SET status = ${status}, updated_at = NOW(), notes = ${notes} WHERE id = ${id}`;
    } else {
      await sql`UPDATE sales_leads SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
    }
  } catch (e) {
    console.error('updateLeadStatus error:', e);
  }
}

// ===== Dashboard Aggregation =====
export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const sql = await getSql();

  // Helper to safely get first row's count from a query result
  async function queryCount(queryFn: () => Promise<any[]>): Promise<number> {
    try {
      const rows = await queryFn();
      return Number(rows[0]?.count || 0);
    } catch {
      return 0;
    }
  }

  if (!sql) {
    // In-memory aggregation
    const todayEvents = memoryEvents.filter(e => e.created_at >= todayStart);
    const todayTrials = memoryTrials.filter(t => t.created_at >= todayStart);
    const converted = memoryTrials.filter(t => t.status === 'converted');
    const wonLeads = memoryLeads.filter(l => l.status === 'won');

    const weeklyVisitors: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dayStr = d.toISOString().split('T')[0];
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
      const count = memoryEvents.filter(e => e.event_type === 'pageview' && e.created_at >= dayStart && e.created_at < dayEnd).length;
      weeklyVisitors.push({ date: dayStr, count });
    }

    const pageCounts: Record<string, number> = {};
    memoryEvents.filter(e => e.event_type === 'pageview').forEach(e => {
      pageCounts[e.page] = (pageCounts[e.page] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }));

    const deviceCounts: Record<string, number> = {};
    memoryEvents.forEach(e => {
      const d = e.device || 'unknown';
      deviceCounts[d] = (deviceCounts[d] || 0) + 1;
    });
    const deviceBreakdown = Object.entries(deviceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([device, count]) => ({ device, count }));

    const totalRevenue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);
    const totalTrialsCount = memoryTrials.length;
    const conversionRate = totalTrialsCount > 0 ? Math.round((converted.length / totalTrialsCount) * 100) : 0;

    return {
      totalVisitors: memoryEvents.filter(e => e.event_type === 'pageview').length,
      todayVisitors: todayEvents.filter(e => e.event_type === 'pageview').length,
      totalTrials: totalTrialsCount,
      todayTrials: todayTrials.length,
      convertedTrials: converted.length,
      conversionRate,
      totalLeads: memoryLeads.length,
      wonLeads: wonLeads.length,
      totalRevenue,
      weeklyVisitors,
      topPages,
      topSources: [],
      deviceBreakdown,
      recentTrials: memoryTrials.slice(0, 5),
      recentLeads: memoryLeads.slice(0, 5),
      trialsByStatus: [
        { status: 'pending', count: memoryTrials.filter(t => t.status === 'pending').length },
        { status: 'contacted', count: memoryTrials.filter(t => t.status === 'contacted').length },
        { status: 'converted', count: converted.length },
        { status: 'expired', count: memoryTrials.filter(t => t.status === 'expired').length },
      ],
      leadsByStatus: [
        { status: 'new', count: memoryLeads.filter(l => l.status === 'new').length },
        { status: 'qualified', count: memoryLeads.filter(l => l.status === 'qualified').length },
        { status: 'won', count: wonLeads.length },
        { status: 'lost', count: memoryLeads.filter(l => l.status === 'lost').length },
      ],
    };
  }

  try {
    // Count queries
    const totalPageviewCount = await queryCount(() => sql`SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'pageview'`);
    const todayPageviewCount = await queryCount(() => sql`SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'pageview' AND created_at >= ${todayStart}`);
    const totalTrialsNum = await queryCount(() => sql`SELECT COUNT(*) as count FROM free_trials`);
    const todayTrialsNum = await queryCount(() => sql`SELECT COUNT(*) as count FROM free_trials WHERE created_at >= ${todayStart}`);
    const convertedNum = await queryCount(() => sql`SELECT COUNT(*) as count FROM free_trials WHERE status = 'converted'`);
    const totalLeadsNum = await queryCount(() => sql`SELECT COUNT(*) as count FROM sales_leads`);
    const wonLeadsNum = await queryCount(() => sql`SELECT COUNT(*) as count FROM sales_leads WHERE status = 'won'`);
    const totalRevenue = await queryCount(() => sql`SELECT COALESCE(SUM(value), 0) as count FROM sales_leads WHERE status = 'won'`);

    const conversionRate = totalTrialsNum > 0 ? Math.round((convertedNum / totalTrialsNum) * 100) : 0;

    // Weekly visitors
    const weeklyVisitors: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dayStr = d.toISOString().split('T')[0];
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
      const count = await queryCount(() => sql`SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'pageview' AND created_at >= ${dayStart} AND created_at < ${dayEnd}`);
      weeklyVisitors.push({ date: dayStr, count });
    }

    // Top pages
    const topPages: { page: string; views: number }[] = [];
    try {
      const rows: any[] = await sql`SELECT page, COUNT(*) as views FROM analytics_events WHERE event_type = 'pageview' AND created_at >= ${weekAgo} GROUP BY page ORDER BY views DESC LIMIT 10`;
      for (const r of rows) topPages.push({ page: r.page, views: Number(r.views) });
    } catch { /* empty */ }

    // Top sources
    const topSources: { source: string; count: number }[] = [];
    try {
      const rows: any[] = await sql`SELECT referrer as source, COUNT(*) as count FROM analytics_events WHERE referrer != '' AND referrer IS NOT NULL AND created_at >= ${weekAgo} GROUP BY referrer ORDER BY count DESC LIMIT 10`;
      for (const r of rows) topSources.push({ source: r.source, count: Number(r.count) });
    } catch { /* empty */ }

    // Device breakdown
    const deviceBreakdown: { device: string; count: number }[] = [];
    try {
      const rows: any[] = await sql`SELECT device, COUNT(*) as count FROM analytics_events WHERE created_at >= ${weekAgo} GROUP BY device ORDER BY count DESC`;
      for (const r of rows) deviceBreakdown.push({ device: r.device || 'unknown', count: Number(r.count) });
    } catch { /* empty */ }

    // Recent trials and leads
    let recentTrials: FreeTrial[] = [];
    try {
      const rows: any[] = await sql`SELECT * FROM free_trials ORDER BY created_at DESC LIMIT 5`;
      recentTrials = rows.map(mapTrial);
    } catch { /* empty */ }

    let recentLeads: SalesLead[] = [];
    try {
      const rows: any[] = await sql`SELECT * FROM sales_leads ORDER BY created_at DESC LIMIT 5`;
      recentLeads = rows.map(mapLead);
    } catch { /* empty */ }

    // Status breakdowns
    const trialsByStatus: { status: string; count: number }[] = [];
    try {
      const rows: any[] = await sql`SELECT status, COUNT(*) as count FROM free_trials GROUP BY status`;
      for (const r of rows) trialsByStatus.push({ status: r.status, count: Number(r.count) });
    } catch { /* empty */ }

    const leadsByStatus: { status: string; count: number }[] = [];
    try {
      const rows: any[] = await sql`SELECT status, COUNT(*) as count FROM sales_leads GROUP BY status`;
      for (const r of rows) leadsByStatus.push({ status: r.status, count: Number(r.count) });
    } catch { /* empty */ }

    return {
      totalVisitors: totalPageviewCount,
      todayVisitors: todayPageviewCount,
      totalTrials: totalTrialsNum,
      todayTrials: todayTrialsNum,
      convertedTrials: convertedNum,
      conversionRate,
      totalLeads: totalLeadsNum,
      wonLeads: wonLeadsNum,
      totalRevenue,
      weeklyVisitors,
      topPages,
      topSources,
      deviceBreakdown,
      recentTrials,
      recentLeads,
      trialsByStatus,
      leadsByStatus,
    };
  } catch (e) {
    console.error('getDashboardStats error:', e);
    return {
      totalVisitors: 0, todayVisitors: 0, totalTrials: 0, todayTrials: 0,
      convertedTrials: 0, conversionRate: 0, totalLeads: 0, wonLeads: 0, totalRevenue: 0,
      weeklyVisitors: [], topPages: [], topSources: [], deviceBreakdown: [],
      recentTrials: [], recentLeads: [], trialsByStatus: [], leadsByStatus: [],
    };
  }
}

// ===== Mappers =====
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTrial(row: any): FreeTrial {
  return {
    id: row.id,
    name: row.name || '',
    whatsapp: row.whatsapp || '',
    duration: row.duration || '24h',
    status: row.status || 'pending',
    source: row.source || 'website',
    visitor_id: row.visitor_id || '',
    notes: row.notes || '',
    assigned_to: row.assigned_to || '',
    contacted_at: row.contacted_at?.toISOString?.() || row.contacted_at || undefined,
    converted_at: row.converted_at?.toISOString?.() || row.converted_at || undefined,
    created_at: row.created_at?.toISOString?.() || row.created_at || new Date().toISOString(),
    updated_at: row.updated_at?.toISOString?.() || row.updated_at || new Date().toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLead(row: any): SalesLead {
  return {
    id: row.id,
    name: row.name || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    source: row.source || 'manual',
    status: row.status || 'new',
    plan_interest: row.plan_interest || '',
    value: Number(row.value) || 0,
    notes: row.notes || '',
    assigned_to: row.assigned_to || '',
    last_contacted_at: row.last_contacted_at?.toISOString?.() || row.last_contacted_at || undefined,
    created_at: row.created_at?.toISOString?.() || row.created_at || new Date().toISOString(),
    updated_at: row.updated_at?.toISOString?.() || row.updated_at || new Date().toISOString(),
  };
}
