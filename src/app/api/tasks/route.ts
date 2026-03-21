import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const tasksFile = path.resolve(process.cwd(), '..', 'TASKS.md');

export async function GET() {
  if (!fs.existsSync(tasksFile)) {
    // Initialize if missing
    fs.writeFileSync(tasksFile, '# Mission Tasks\n\n');
    return NextResponse.json({ tasks: [] });
  }
  
  const content = fs.readFileSync(tasksFile, 'utf-8');
  // Simple parser: lines starting with "- [ ]" are pending, "- [x]" are done
  const tasks = content.split('\n')
    .filter(line => line.trim().startsWith('- ['))
    .map((line, i) => {
      const checked = line.includes('- [x]');
      const text = line.replace(/- \[[ x]\] /, '').trim();
      return { id: i, text, checked };
    });

  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 });

    const newTask = `- [ ] ${text}\n`;
    
    // Append to file
    fs.appendFileSync(tasksFile, newTask);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save task' }, { status: 500 });
  }
}
