'use client';

import { Clock, Calendar, RefreshCw, Zap, CalendarPlus } from 'lucide-react';
import { addDays, format, parse } from 'date-fns';

export default function SystemCalendar() {
  const events = [
    { 
      time: '08:00', 
      title: 'Daily Briefing', 
      type: 'report', 
      desc: 'Junior Researcher (Flash) scans trends',
      icon: <Zap size={14} className="text-ab-gold" />
    },
    { 
      time: '08:15', 
      title: 'Content Pipeline', 
      type: 'producer', 
      desc: 'The Producer (Gemini Pro) drafts script outline',
      icon: <Zap size={14} className="text-orange-400" />
    },
    { 
      time: 'Every 30m', 
      title: 'System Heartbeat', 
      type: 'system', 
      desc: 'Check emails, calendar, alerts',
      icon: <RefreshCw size={14} className="text-ab-blue" />
    },
  ];

  const addToGoogleCalendar = (title: string, desc: string, timeStr: string) => {
    // If "Every 30m", we won't add a specific time
    if (timeStr === 'Every 30m') return;
    
    // Parse time to get today's date + time
    const today = new Date();
    const timeParts = timeStr.split(':');
    today.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0);
    
    // Google Calendar format: YYYYMMDDTHHmmssZ
    const startDate = today.toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    // End time is 15 mins later
    const endDateObj = new Date(today.getTime() + 15 * 60000);
    const endDate = endDateObj.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(desc)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="forge-panel h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ab-text uppercase tracking-wider flex items-center gap-2">
          <Calendar size={16} className="text-ab-blue" />
          Agent Schedule
        </h3>
        <span className="text-xs text-ab-muted">MST (Denver)</span>
      </div>

      <div className="space-y-4 flex-1 overflow-auto pr-2">
        {events.map((event, idx) => (
          <div key={idx} className="flex gap-4 group">
            {/* Time Column */}
            <div className="w-16 flex-shrink-0 text-right">
              <span className="text-xs font-mono text-ab-body block">{event.time}</span>
            </div>

            {/* Timeline Line */}
            <div className="relative flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-ab-border-bright group-hover:bg-ab-blue transition-colors z-10"></div>
              {idx !== events.length - 1 && (
                <div className="w-0.5 h-full bg-ab-border-bright absolute top-2"></div>
              )}
            </div>

            {/* Content */}
            <div className="pb-4 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-ab-body flex items-center gap-2">
                  {event.icon}
                  {event.title}
                </h4>
                {event.time !== 'Every 30m' && (
                  <button 
                    onClick={() => addToGoogleCalendar(event.title, event.desc, event.time)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-ab-border rounded-md text-ab-body hover:text-ab-blue"
                    title="Add to Google Calendar"
                  >
                    <CalendarPlus size={14} />
                  </button>
                )}
              </div>
              <p className="text-xs text-ab-muted mt-0.5">{event.desc}</p>
            </div>
          </div>
        ))}
        
        {/* Placeholder for dynamic events */}
        <div className="text-center pt-2 border-t border-ab-border/50 mt-2">
          <p className="text-[10px] text-ab-muted italic">
            Automations run via OpenClaw Heartbeat
          </p>
        </div>
      </div>
    </div>
  );
}

