import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseCheckinContent } from '@/lib/parseCheckin';

const CHECKINS_DIR =
  process.env.CHECKINS_DIR ??
  path.join('C:', 'Users', 'broug', '.openclaw', 'workspace', 'memory', 'checkins');

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

    // Build markdown in the EOD format the parser understands
    const lines: string[] = [
      `# Check-in: ${date}`,
      '',
      `## 4. First Move Tomorrow`,
    ];

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
      lines.push('', '## Notes', `- ${notes}`);
    }

    const content = lines.join('\n') + '\n';
    fs.mkdirSync(CHECKINS_DIR, { recursive: true });
    fs.writeFileSync(path.join(CHECKINS_DIR, `${date}.md`), content, 'utf-8');

    return NextResponse.json({ ok: true, date });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];
    const filePath = path.join(CHECKINS_DIR, `${date}.md`);
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : null;
    const parsed = content ? parseCheckinContent(content, date) : null;
    return NextResponse.json({ date, content, exists: !!content, parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
