import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const LINEAR_API = 'https://api.linear.app/graphql';

async function fetchRecentDeliverables(meetingId: string) {
  const key = process.env.LINEAR_API_KEY?.trim();
  if (!key) return { status: 'not_configured', items: [] };

  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const res = await fetch(LINEAR_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: key },
    body: JSON.stringify({
      query: `
        query MeetingPrepDeliverables($since: NullableDateComparator) {
          completedYesterday: issues(
            filter: { completedAt: $since }
            first: 20
            orderBy: updatedAt
          ) {
            nodes {
              id
              title
              completedAt
              team { name }
              assignee { name }
              url
            }
          }
        }
      `,
      variables: { since: { gte: since } },
    }),
  });

  if (!res.ok) return { status: 'error', items: [] };
  const json = await res.json();
  if (json.errors?.length) return { status: 'error', items: [] };

  const nodes = json.data?.completedYesterday?.nodes ?? [];
  return {
    status: 'ok',
    items: nodes.map((n: any) => ({
      id: n.id,
      title: n.title,
      completedAt: n.completedAt,
      team: n.team?.name ?? null,
      assignee: n.assignee?.name ?? null,
      url: n.url ?? null,
    })),
  };
}

// Placeholder — Slack integration to be added when Slack OAuth is configured
async function fetchOutstandingAsks(_meetingId: string) {
  return {
    status: 'placeholder',
    source: 'slack',
    note: 'Slack integration not yet configured. Add SLACK_BOT_TOKEN to enable thread fetching.',
    items: [],
  };
}

// Placeholder — Gmail integration to be added when Gmail OAuth is configured
async function fetchOpenThreads(_meetingId: string) {
  return {
    status: 'placeholder',
    source: 'gmail',
    note: 'Gmail integration not yet configured. Add GOOGLE_GMAIL_REFRESH_TOKEN to enable thread fetching.',
    items: [],
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const { meetingId } = await params;

  const [deliverables, asks, threads] = await Promise.allSettled([
    fetchRecentDeliverables(meetingId),
    fetchOutstandingAsks(meetingId),
    fetchOpenThreads(meetingId),
  ]);

  function val<T>(r: PromiseSettledResult<T>): T | { status: 'error'; items: [] } {
    return r.status === 'fulfilled' ? r.value : { status: 'error', items: [] };
  }

  return NextResponse.json({
    meetingId,
    generatedAt: new Date().toISOString(),
    recentDeliverables: val(deliverables),
    outstandingAsks: val(asks),
    openThreads: val(threads),
  });
}
