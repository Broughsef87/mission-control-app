import { NextResponse } from 'next/server';
import { getChannelStats } from '@/lib/youtube';
import { upsertMetric } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getChannelStats();

    if (!stats) {
      return NextResponse.json({
        error: 'YouTube API not configured. Set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID.',
        configured: false,
      }, { status: 200 });
    }

    // Cache metrics in Supabase for the briefing and overview
    await Promise.allSettled([
      upsertMetric('youtube', 'subscribers', stats.subscriberCount),
      upsertMetric('youtube', 'total_views', stats.viewCount),
      upsertMetric('youtube', 'video_count', stats.videoCount),
    ]);

    return NextResponse.json({ ...stats, configured: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
