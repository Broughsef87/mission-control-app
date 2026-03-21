import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import os from 'os';

export async function POST(req: Request) {
  try {
    const { filePath } = await req.json();

    if (!filePath) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    const platform = os.platform();
    let command = '';

    if (platform === 'win32') {
      command = `start "" "${filePath}"`;
    } else if (platform === 'darwin') {
      command = `open "${filePath}"`;
    } else {
      command = `xdg-open "${filePath}"`;
    }

    exec(command, (error) => {
      if (error) {
        console.error(`Error opening file: ${error.message}`);
      }
    });

    return NextResponse.json({ success: true, message: 'Opened file locally' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to open file' }, { status: 500 });
  }
}