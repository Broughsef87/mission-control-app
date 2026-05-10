import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Exchanges a Google OAuth refresh token for a short-lived access token.
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token ?? null;
}

interface GCalEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end:   { dateTime?: string; date?: string };
  attendees?: { email: string; displayName?: string }[];
  htmlLink?: string;
  source: 'personal' | 'workspace';
}

// Fetch today's events for a single access token.
async function fetchTodayEvents(accessToken: string, source: 'personal' | 'workspace'): Promise<GCalEvent[]> {
  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.set('timeMin', timeMin);
  url.searchParams.set('timeMax', timeMax);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', '20');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return (data.items ?? []).map((item: any) => ({ ...item, source }));
}

export async function GET() {
  const personalRefresh  = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN_PERSONAL;
  const workspaceRefresh = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN_WORKSPACE;
  const clientId         = process.env.GOOGLE_CLIENT_ID;
  const clientSecret     = process.env.GOOGLE_CLIENT_SECRET;

  if (!personalRefresh && !workspaceRefresh) {
    return NextResponse.json({
      configured: false,
      events: [],
      message: 'Set GOOGLE_CALENDAR_REFRESH_TOKEN_PERSONAL and/or GOOGLE_CALENDAR_REFRESH_TOKEN_WORKSPACE to connect.',
    });
  }

  if (!clientId || !clientSecret) {
    return NextResponse.json({
      configured: false,
      events: [],
      message: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (OAuth app credentials).',
    });
  }

  // Exchange both refresh tokens in parallel
  const [personalToken, workspaceToken] = await Promise.all([
    personalRefresh  ? refreshAccessToken(personalRefresh)  : Promise.resolve(null),
    workspaceRefresh ? refreshAccessToken(workspaceRefresh) : Promise.resolve(null),
  ]);

  // Fetch events from each calendar in parallel
  const [personalEvents, workspaceEvents] = await Promise.all([
    personalToken  ? fetchTodayEvents(personalToken,  'personal')  : Promise.resolve([]),
    workspaceToken ? fetchTodayEvents(workspaceToken, 'workspace') : Promise.resolve([]),
  ]);

  // Merge, deduplicate by id, sort by start time
  const seen = new Set<string>();
  const merged = [...personalEvents, ...workspaceEvents]
    .filter(ev => {
      if (seen.has(ev.id)) return false;
      seen.add(ev.id);
      return true;
    })
    .sort((a, b) => {
      const at = a.start.dateTime ?? a.start.date ?? '';
      const bt = b.start.dateTime ?? b.start.date ?? '';
      return at.localeCompare(bt);
    })
    .map(ev => ({
      id:        ev.id,
      summary:   ev.summary ?? '(No title)',
      start:     ev.start.dateTime ?? ev.start.date ?? '',
      end:       ev.end.dateTime   ?? ev.end.date   ?? '',
      attendees: (ev.attendees ?? []).map((a: any) => a.displayName ?? a.email),
      source:    ev.source,
    }));

  return NextResponse.json({
    configured: true,
    personal_connected:  !!personalToken,
    workspace_connected: !!workspaceToken,
    events: merged,
    as_of: new Date().toISOString(),
  });
}
