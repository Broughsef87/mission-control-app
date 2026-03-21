import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Correctly locate the .openclaw/workspace/memory directory relative to this process
    const workspaceRoot = path.resolve(process.cwd(), '..'); 
    const memoryDir = path.join(workspaceRoot, 'memory');

    console.log('Scanning memory dir:', memoryDir);

    if (!fs.existsSync(memoryDir)) {
      return NextResponse.json({ error: 'Memory directory not found', path: memoryDir }, { status: 404 });
    }

    const files = fs.readdirSync(memoryDir)
      .filter(file => file.endsWith('.md'))
      .sort((a, b) => b.localeCompare(a)) // Newest first
      .slice(0, 5); // Last 5 days

    const events: any[] = [];

    for (const file of files) {
      const content = fs.readFileSync(path.join(memoryDir, file), 'utf-8');
      const lines = content.split('\n');
      const fileDate = file.replace('.md', '');

      lines.forEach((line, index) => {
        // Regex for various log formats
        // 1. [Tue 2026-03-03 15:25 MST] message
        // 2. System: [2026-03-03 15:20:24 MST] message
        
        let timestamp = null;
        let content = line;
        let type = 'log';

        const match1 = line.match(/^\[\w{3}\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s+\w+\]\s+(.*)/);
        const match2 = line.match(/^System:\s+\[(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+\w+\]\s+(.*)/);
        const match3 = line.match(/^\[(\d{2}:\d{2})\]\s+(.*)/); // Fallback for simple time

        if (match1) {
          timestamp = `${match1[1]}T${match1[2]}:00`;
          content = match1[3];
          type = 'user'; // Often user prompts
        } else if (match2) {
          timestamp = `${match2[1]}T${match2[2]}`;
          content = match2[3];
          type = 'system';
        } else if (match3) {
           timestamp = `${fileDate}T${match3[1]}:00`;
           content = match3[2];
           type = 'agent';
        }

        if (timestamp) {
          events.push({
            id: `${file}-${index}`,
            timestamp,
            content: content.trim(),
            type
          });
        }
      });
    }

    // Sort descending
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ events });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity', details: String(error) }, { status: 500 });
  }
}
