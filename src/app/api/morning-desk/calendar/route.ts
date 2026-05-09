import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Google Calendar integration pending (requires OAuth setup).
// Returns scaffold response with mock data until connected.
export async function GET() {
  const configured = !!process.env.GOOGLE_CALENDAR_TOKEN;

  if (!configured) {
    return NextResponse.json({
      configured: false,
      events: [],
      message: 'Google Calendar integration pending. Set GOOGLE_CALENDAR_TOKEN to connect.',
    });
  }

  // Real integration goes here when token is available
  return NextResponse.json({
    configured: true,
    events: [],
    message: 'Calendar connected but fetch not yet implemented.',
  });
}
