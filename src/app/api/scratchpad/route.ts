import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const scratchpadPath = path.resolve(process.cwd(), '..', 'scratchpad.md');

export async function GET() {
  try {
    if (!fs.existsSync(scratchpadPath)) {
      return NextResponse.json({ content: '' });
    }
    const content = fs.readFileSync(scratchpadPath, 'utf-8');
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read scratchpad' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    fs.writeFileSync(scratchpadPath, content || '');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save scratchpad' }, { status: 500 });
  }
}
