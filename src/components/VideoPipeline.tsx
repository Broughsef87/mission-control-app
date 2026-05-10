'use client';
import { useState, useEffect } from 'react';
import videosData from '@/lib/videos.json';

interface Video {
  id: string;
  title: string;
  status: 'Scripting' | 'Recording' | 'Editing' | 'Published';
  stage: number;
}

const stageClasses = [
  'bg-ab-border', // Pre-production
  'bg-ab-blue', // Scripting
  'bg-ab-gold', // Recording
  'bg-purple-600', // Editing
  'bg-ab-green', // Published
];

export default function VideoPipeline() {
  const [videos, setVideos] = useState<Video[]>(videosData as unknown as Video[]);

  // Placeholder for real-time updates
  useEffect(() => {
    // In a real app, you would fetch this data
  }, []);

  return (
    <div className="bg-ab-surface rounded-lg p-4">
      <h2 className="text-lg font-semibold text-ab-text mb-4">Video Pipeline</h2>
      <div className="space-y-4">
        {videos.map((video) => (
          <div key={video.id} className="bg-black/30 p-3 rounded-md">
            <h3 className="text-sm font-semibold text-ab-blue truncate mb-2">{video.title}</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between text-xs text-ab-body">
                <div>Status</div>
                <div className="text-right">
                  <span>{video.status}</span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-ab-border">
                <div style={{ width: `${(video.stage / 4) * 100}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-ab-body justify-center ${stageClasses[video.stage]}`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
