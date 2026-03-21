import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import projectsJson from '@/lib/projects.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error || !data || data.length === 0) {
      // Fall back to static JSON if Supabase has no data yet
      return NextResponse.json(projectsJson);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(projectsJson);
  }
}
