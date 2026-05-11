import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const REVIEWS_DIR = process.env.REVIEWS_DIR ?? '';

interface ReviewMeta {
  filename: string;
  date: string;
  title: string;
  snippet: string;
  blockers: string[];
}

function extractMeta(filename: string, content: string): ReviewMeta {
  const lines = content.split('\n');
  const titleLine = lines.find(l => l.startsWith('# ')) ?? '';
  const title = titleLine.replace(/^#\s+/, '').trim() || filename.replace(/\.md$/, '');

  // Extract date from filename (YYYY-MM-DD prefix) or first line
  const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : '';

  // Find blocker lines: lines starting with - or * containing "blocked", "blocker", "stuck"
  const blockers = lines
    .filter(l => /blocker|blocked|stuck|risk/i.test(l) && /^[-*]/.test(l.trim()))
    .map(l => l.replace(/^[-*]\s+/, '').trim())
    .slice(0, 3);

  // Snippet: first non-heading, non-empty paragraph
  const snippet = lines
    .filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('---'))
    .slice(0, 2)
    .join(' ')
    .slice(0, 180);

  return { filename, date, title, snippet, blockers };
}

export async function GET() {
  if (!REVIEWS_DIR) {
    return NextResponse.json({ configured: false, reviews: [], message: 'REVIEWS_DIR not set' });
  }

  try {
    if (!fs.existsSync(REVIEWS_DIR)) {
      return NextResponse.json({ configured: true, reviews: [], message: 'Reviews directory not found' });
    }

    const files = fs.readdirSync(REVIEWS_DIR)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, 12);

    const reviews: ReviewMeta[] = files.map(filename => {
      const content = fs.readFileSync(path.join(REVIEWS_DIR, filename), 'utf-8');
      return extractMeta(filename, content);
    });

    return NextResponse.json({ configured: true, reviews });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
