'use client';

import { useEffect, useState } from 'react';
import { Clock, Terminal, MessageSquare, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

interface ActivityEvent {
  id: string;
  timestamp: string; // ISO string
  content: string;
  type: 'system' | 'user' | 'agent';
}

export default function Timeline() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/activity')
      .then(res => res.json())
      .then(data => {
        if (data.events) setEvents(data.events);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div className="p-8 text-ab-muted animate-pulse">Loading mission logs...</div>;

  // Group by Date
  const grouped: Record<string, ActivityEvent[]> = {};
  events.forEach(event => {
    const dateKey = event.timestamp.split('T')[0];
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(event);
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6 text-ab-blue" />
        <span>Mission Timeline</span>
      </h1>

      <div className="space-y-8 relative border-l border-ab-border ml-3">
        {Object.keys(grouped).sort().reverse().map(date => (
          <div key={date} className="relative pl-8">
            <span className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-ab-border-bright border-2 border-ab-base" />
            <h2 className="text-sm font-medium text-ab-body mb-4 uppercase tracking-wider">
              {isToday(parseISO(date)) ? 'Today' : isYesterday(parseISO(date)) ? 'Yesterday' : format(parseISO(date), 'MMM d, yyyy')}
            </h2>
            
            <div className="space-y-3">
              {grouped[date].map((event, i) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-ab-surface-2 border border-ab-border rounded-lg p-3 hover:border-ab-border-bright transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-ab-muted mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          event.type === 'system' ? 'bg-orange-500' : 
                          event.type === 'user' ? 'bg-ab-blue' : 'bg-ab-green'
                        }`} />
                        <span className="font-mono">{format(parseISO(event.timestamp), 'HH:mm')}</span>
                        <span className="uppercase text-[10px] tracking-wide border border-ab-border px-1 rounded text-ab-muted">{event.type}</span>
                      </div>
                      <p className="text-sm text-ab-body font-mono whitespace-pre-wrap break-words leading-relaxed">
                        {event.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
