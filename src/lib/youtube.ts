/**
 * youtube.ts — YouTube Data API v3 helpers
 * Requires env vars: YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID
 */

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeStats {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  recentVideos: YouTubeVideo[];
}

export interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  thumbnailUrl: string;
}

export async function getChannelStats(): Promise<YouTubeStats | null> {
  if (!API_KEY || !CHANNEL_ID) return null;

  try {
    // Channel statistics
    const statsRes = await fetch(
      `${BASE}/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`,
      { next: { revalidate: 3600 } } // cache 1 hour
    );
    const statsJson = await statsRes.json();
    const stats = statsJson.items?.[0]?.statistics;

    // Recent uploads playlist
    const channelRes = await fetch(
      `${BASE}/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`,
      { next: { revalidate: 3600 } }
    );
    const channelJson = await channelRes.json();
    const uploadsId = channelJson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    let recentVideos: YouTubeVideo[] = [];
    if (uploadsId) {
      const playlistRes = await fetch(
        `${BASE}/playlistItems?part=snippet&playlistId=${uploadsId}&maxResults=5&key=${API_KEY}`,
        { next: { revalidate: 3600 } }
      );
      const playlistJson = await playlistRes.json();
      const videoIds = (playlistJson.items ?? [])
        .map((item: any) => item.snippet.resourceId.videoId)
        .join(',');

      if (videoIds) {
        const videosRes = await fetch(
          `${BASE}/videos?part=statistics,snippet&id=${videoIds}&key=${API_KEY}`,
          { next: { revalidate: 3600 } }
        );
        const videosJson = await videosRes.json();
        recentVideos = (videosJson.items ?? []).map((v: any) => ({
          id: v.id,
          title: v.snippet.title,
          publishedAt: v.snippet.publishedAt,
          viewCount: v.statistics.viewCount ?? '0',
          likeCount: v.statistics.likeCount ?? '0',
          thumbnailUrl: v.snippet.thumbnails?.medium?.url ?? '',
        }));
      }
    }

    return {
      subscriberCount: stats?.subscriberCount ?? '0',
      viewCount: stats?.viewCount ?? '0',
      videoCount: stats?.videoCount ?? '0',
      recentVideos,
    };
  } catch (err) {
    console.error('[YouTube] Failed to fetch stats:', err);
    return null;
  }
}

export function formatCount(n: string | number): string {
  const num = Number(n);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}
