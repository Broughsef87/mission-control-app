'use client';
import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ListTodo, CalendarPlus } from 'lucide-react';

export default function TaskList({ refreshTrigger }: { refreshTrigger: number }) {
  const [tasks, setTasks] = useState<{ id: number, text: string, checked: boolean }[]>([]);

  useEffect(() => {
    fetch('/api/tasks').then(res => res.json()).then(data => {
        if (data.tasks) setTasks(data.tasks);
    });
  }, [refreshTrigger]);

  const addToGoogleCalendar = (text: string) => {
    // Make it a generic 30-min task starting now
    const today = new Date();
    const startDate = today.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDateObj = new Date(today.getTime() + 30 * 60000);
    const endDate = endDateObj.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${startDate}/${endDate}&details=Task+from+Mission+Control`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#14161b] border border-[#282a36] rounded-lg p-6 max-h-[400px] overflow-auto hover:border-gray-700 transition-colors shadow-lg">
      <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-widest flex items-center gap-2">
        <ListTodo size={14} className="text-yellow-400" />
        Pending Objectives
      </h3>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start justify-between p-3 bg-[#0f1115] rounded border border-[#1f2128] hover:border-gray-600 transition-colors group">
             <div className="flex items-start gap-3 flex-1 pr-4">
               <button className="text-gray-600 hover:text-green-500 mt-0.5 transition-colors">
                 {task.checked ? <CheckCircle2 size={16} /> : <Circle size={16} />}
               </button>
               <span className={`text-sm leading-relaxed ${task.checked ? 'line-through text-gray-600' : 'text-gray-300'}`}>
                 {task.text}
               </span>
             </div>
             <button 
                onClick={() => addToGoogleCalendar(task.text)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-[#2f333e] rounded-md text-gray-400 hover:text-indigo-400 shrink-0"
                title="Schedule in Google Calendar"
              >
                <CalendarPlus size={16} />
             </button>
          </div>
        ))}
        {tasks.length === 0 && (
           <div className="flex flex-col items-center justify-center py-10 text-gray-700 border border-dashed border-[#1f2128] rounded">
             <ListTodo size={24} className="mb-2 opacity-20" />
             <p className="text-xs italic">All systems nominal. No pending tasks.</p>
           </div>
        )}
      </div>
    </div>
  );
}
