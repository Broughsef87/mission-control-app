import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const videosFile = path.join(process.cwd(), 'videos.json');

interface VideoProject {
  id: string;
  title: string;
  status: 'idea' | 'scripting' | 'filming' | 'editing' | 'published';
  notes: string;
  createdAt: string;
  filePath?: string;
}

function getVideos(): VideoProject[] {
  if (!fs.existsSync(videosFile)) {
    return [];
  }
  const data = fs.readFileSync(videosFile, 'utf-8');
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveVideos(videos: VideoProject[]) {
  fs.writeFileSync(videosFile, JSON.stringify(videos, null, 2));
}

export async function GET() {
  const projects = getVideos();
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let projects = getVideos();

    if (body.action === 'create') {
      const newProject: VideoProject = {
        id: Date.now().toString(),
        title: body.title,
        status: body.status || 'idea',
        notes: '',
        createdAt: new Date().toISOString(),
        filePath: body.filePath || ''
      };
      projects.push(newProject);
    } else if (body.action === 'update') {
      projects = projects.map(p => p.id === body.id ? { ...p, ...body } : p);
    } else if (body.action === 'delete') {
      projects = projects.filter(p => p.id !== body.id);
    }

    saveVideos(projects);
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update videos' }, { status: 500 });
  }
}
