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
      icon: <Zap size={14} className="text-yellow-400" />
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
      icon: <RefreshCw size={14} className="text-blue-400" />
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
    <div className="bg-[#1a1d24] border border-[#2f333e] rounded-xl p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <Calendar size={16} className="text-indigo-400" />
          Agent Schedule
        </h3>
        <span className="text-xs text-gray-500">MST (Denver)</span>
      </div>

      <div className="space-y-4 flex-1 overflow-auto pr-2">
        {events.map((event, idx) => (
          <div key={idx} className="flex gap-4 group">
            {/* Time Column */}
            <div className="w-16 flex-shrink-0 text-right">
              <span className="text-xs font-mono text-gray-400 block">{event.time}</span>
            </div>

            {/* Timeline Line */}
            <div className="relative flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-[#2f333e] group-hover:bg-indigo-500 transition-colors z-10"></div>
              {idx !== events.length - 1 && (
                <div className="w-0.5 h-full bg-[#2f333e] absolute top-2"></div>
              )}
            </div>

            {/* Content */}
            <div className="pb-4 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                  {event.icon}
                  {event.title}
                </h4>
                {event.time !== 'Every 30m' && (
                  <button 
                    onClick={() => addToGoogleCalendar(event.title, event.desc, event.time)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#2f333e] rounded-md text-gray-400 hover:text-indigo-400"
                    title="Add to Google Calendar"
                  >
                    <CalendarPlus size={14} />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{event.desc}</p>
            </div>
          </div>
        ))}
        
        {/* Placeholder for dynamic events */}
        <div className="text-center pt-2 border-t border-[#2f333e]/50 mt-2">
          <p className="text-[10px] text-gray-600 italic">
            Automations run via OpenClaw Heartbeat
          </p>
        </div>
      </div>
    </div>
  );
}
