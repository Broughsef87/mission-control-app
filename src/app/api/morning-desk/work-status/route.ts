import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Linear integration pending for full issue-level data.
// For now: derives work status from the projects table + agent_logs.
export async function GET() {
  try {
    const projects = await getProjects();

    const inProgress = (projects as any[]).filter(p => p.status === 'In Progress');
    const blocked = (projects as any[]).filter(p => p.status === 'Blocked');
    const overdue = (projects as any[]).filter(p => {
      if (!p.deadline) return false;
      return new Date(p.deadline) < new Date() && p.status !== 'Done';
    });

    const byProject = inProgress.slice(0, 8).map(p => ({
      id: p.id,
      name: p.name,
      client: p.client ?? 'Internal',
      status: p.status,
      deadline: p.deadline ?? null,
      updated_at: p.updated_at,
    }));

    return NextResponse.json({
      configured: true,
      linear_connected: false,
      in_progress_count: inProgress.length,
      blocked_count: blocked.length,
      overdue_count: overdue.length,
      by_project: byProject,
      stale_note: inProgress.filter(p => {
        if (!p.updated_at) return false;
        const daysSince = (Date.now() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince > 7;
      }).map(p => p.name),
      as_of: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
