import { NextRequest, NextResponse } from 'next/server';
import { upsertCheckin, getCheckinByDate } from '@/lib/db';
import { parseCheckinContent } from '@/lib/parseCheckin';

// Optional: also write to local disk for OpenClaw agent compatibility.
// Only runs if the path is accessible (i.e. running locally, not on Vercel).
function tryWriteToDisk(date: string, content: string) {
  try {
    // Dynamic require so Next.js doesn't choke on fs in the edge runtime
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    const dir =
      process.env.CHECKINS_DIR ??
      path.join('C:', 'Users', 'broug', '.openclaw', 'workspace', 'memory', 'checkins');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${date}.md`), content, 'utf-8');
  } catch {
    // Silently ignore — Vercel doesn't have access to the local filesystem
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, priorities, blocker, numbers, notes } = body as {
      date: string;
      priorities: string[];
      blocker?: string;
      numbers?: Record<string, string>;
      notes?: string;
    };

    if (!date || !priorities?.length) {
      return NextResponse.json({ error: 'date and priorities are required' }, { status: 400 });
    }

    // Build markdown in the EOD format OpenClaw agents understand
    const lines: string[] = [`# Check-in: ${date}`, '', `## 4. First Move Tomorrow`];
    priorities.filter(Boolean).forEach(p => lines.push(`- ${p}`));

    if (blocker) {
      lines.push('', '## 2. Blocked / Unfinished', `- ${blocker}`);
    }

    if (numbers && Object.keys(numbers).length > 0) {
      lines.push('', '## 5. Numbers / Updates');
      for (const [key, val] of Object.entries(numbers)) {
        if (val) lines.push(`- **${key}:** ${val}`);
      }
    }

    if (notes) {
      lines.push('', '## Notes', notes);
    }

    const content = lines.join('\n') + '\n';

    // Primary store: Supabase
    const row = await upsertCheckin({
      date,
      priorities: priorities.filter(Boolean),
      blocker: blocker || undefined,
      numbers: numbers ?? {},
      notes: notes || undefined,
      content,
    });

    // Side-effect: also write to local disk if accessible
    tryWriteToDisk(date, content);

    return NextResponse.json({ ok: true, date, id: row.id });
  } catch (e: any) {
    console.error('[checkin POST]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];

    const row = await getCheckinByDate(date);

    if (!row) {
      return NextResponse.json({ date, exists: false, content: null, parsed: null });
    }

    // Re-parse the stored markdown so callers get the full Checkin shape
    const parsed = row.content ? parseCheckinContent(row.content, date) : {
      date,
      found: true,
      format: 'supabase' as const,
      priorities: row.priorities ?? [],
      blocker: row.blocker ?? '',
      notes: row.notes ? [row.notes] : [],
      kpi: Object.entries(row.numbers ?? {}).map(([key, value]) => ({ key, value: String(value) })),
      completed: [],
      wins: [],
      decisions: [],
      revenueNote: '',
      commitments: [],
    };

    return NextResponse.json({ date, exists: true, content: row.content, parsed, row });
  } catch (e: any) {
    console.error('[checkin GET]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
