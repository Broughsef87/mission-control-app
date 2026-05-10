import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const LINEAR_API = 'https://api.linear.app/graphql';

async function linearQuery(query: string, variables?: Record<string, unknown>) {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) throw new Error('LINEAR_API_KEY not set');

  const res = await fetch(LINEAR_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey, // Linear accepts bare API key (no "Bearer")
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`Linear API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
}

const WORK_STATUS_QUERY = `
  query FoundryWorkStatus($yesterday: DateTimeComparatorInput) {
    inProgress: issues(
      filter: { state: { type: { in: ["started"] } } }
      first: 50
      orderBy: updatedAt
    ) {
      nodes {
        id
        title
        state { name type }
        team { name }
        dueDate
        updatedAt
        assignee { name }
      }
    }
    blocked: issues(
      filter: { state: { name: { containsIgnoreCase: "blocked" } } }
      first: 20
    ) {
      nodes {
        id
        title
        team { name }
        updatedAt
      }
    }
    shippedYesterday: issues(
      filter: { completedAt: $yesterday }
      first: 30
    ) {
      nodes {
        id
        title
        completedAt
        team { name }
      }
    }
  }
`;

export async function GET() {
  if (!process.env.LINEAR_API_KEY) {
    return NextResponse.json({
      configured: false,
      linear_connected: false,
      error: 'LINEAR_API_KEY not set',
      in_progress_count: 0,
      blocked_count: 0,
      overdue_count: 0,
      by_project: [],
      stale_note: [],
      shipped_yesterday: [],
      as_of: new Date().toISOString(),
    });
  }

  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const data = await linearQuery(WORK_STATUS_QUERY, {
      yesterday: { gte: yesterday },
    });

    const inProgressIssues = data.inProgress?.nodes ?? [];
    const blockedIssues    = data.blocked?.nodes ?? [];
    const shipped          = data.shippedYesterday?.nodes ?? [];

    const now = new Date();
    const overdue = inProgressIssues.filter((i: any) => {
      if (!i.dueDate) return false;
      return new Date(i.dueDate) < now;
    });

    const stale = inProgressIssues.filter((i: any) => {
      if (!i.updatedAt) return false;
      const daysSince = (now.getTime() - new Date(i.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 7;
    }).map((i: any) => i.title);

    const byProject = inProgressIssues.slice(0, 10).map((i: any) => ({
      id:         i.id,
      name:       i.title,
      client:     i.team?.name ?? 'No team',
      status:     i.state?.name ?? 'In Progress',
      deadline:   i.dueDate ?? null,
      updated_at: i.updatedAt,
      assignee:   i.assignee?.name ?? null,
    }));

    return NextResponse.json({
      configured: true,
      linear_connected: true,
      in_progress_count: inProgressIssues.length,
      blocked_count: blockedIssues.length,
      overdue_count: overdue.length,
      by_project: byProject,
      stale_note: stale,
      shipped_yesterday: shipped.map((i: any) => ({ id: i.id, name: i.title, team: i.team?.name })),
      as_of: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ configured: true, linear_connected: false, error: err.message }, { status: 500 });
  }
}
