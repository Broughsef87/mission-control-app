'use client';

import { useEffect, useState } from 'react';
import { Cpu, Server, Clock, Activity, HardDrive, Laptop } from 'lucide-react';

interface SystemStats {
  memory: {
    total: number;
    free: number;
    used: number;
    usage: number; // percentage
  };
  cpu: {
    model: string;
    cores: number;
  };
  uptime: number;
}

export default function SystemMonitor() {
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    const fetchStats = () => {
      fetch('/api/system', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
            if(data.memory) setStats(data);
        })
        .catch(console.error);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  if (!stats) return (
    <div className="bg-ab-surface-2 border border-ab-border rounded-lg p-6 animate-pulse h-48">
        <div className="h-4 bg-ab-border rounded w-1/3 mb-4"></div>
        <div className="h-2 bg-ab-border rounded w-full mb-2"></div>
        <div className="h-2 bg-ab-border rounded w-full mb-2"></div>
    </div>
  );

  const uptimeHours = Math.floor(stats.uptime / 3600);
  const uptimeDays = Math.floor(uptimeHours / 24);

  return (
    <div className="bg-ab-surface-2 border border-ab-border rounded-lg p-6 hover:border-ab-border-bright transition-colors">
      <h3 className="text-xs font-semibold text-ab-muted mb-6 flex items-center gap-2 uppercase tracking-widest">
        <Activity size={14} className="text-ab-blue" />
        System Status
      </h3>

      <div className="space-y-6">
        {/* CPU */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-ab-body font-medium">
            <span className="flex items-center gap-2"><Cpu size={14} className="text-ab-muted"/> CPU Load</span>
            <span className="text-ab-body font-mono">{stats.cpu.cores} Cores</span>
          </div>
          <div className="h-1.5 w-full bg-ab-surface-2 rounded-full overflow-hidden border border-ab-border">
             {/* Fake load animation since accurate load requires more intrusive access */}
             <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[60%] animate-pulse"></div> 
          </div>
           <p className="text-[10px] text-ab-muted truncate font-mono mt-1 opacity-70">{stats.cpu.model}</p>
        </div>

        {/* Memory */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-ab-body font-medium">
             <span className="flex items-center gap-2"><Server size={14} className="text-ab-muted"/> RAM Usage</span>
             <span className="text-ab-body font-mono">{stats.memory.usage}%</span>
          </div>
          <div className="h-1.5 w-full bg-ab-surface-2 rounded-full overflow-hidden border border-ab-border">
             <div 
               className="h-full bg-ab-blue transition-all duration-500 ease-out" 
               style={{ width: `${stats.memory.usage}%` }}
             ></div>
          </div>
          <div className="flex justify-between text-[10px] text-ab-muted font-mono mt-1 opacity-70">
             <span>{(stats.memory.used / 1024 / 1024 / 1024).toFixed(1)}GB USED</span>
             <span>{(stats.memory.total / 1024 / 1024 / 1024).toFixed(1)}GB TOTAL</span>
          </div>
        </div>
        
         {/* Uptime */}
        <div className="pt-4 border-t border-ab-border flex items-center justify-between mt-2">
           <div className="flex items-center gap-2 text-xs text-ab-muted uppercase tracking-wider font-semibold">
              <Clock size={12} />
              <span>Uptime</span>
           </div>
           <span className="text-xs font-mono text-ab-body bg-ab-surface-2 px-2 py-1 rounded border border-ab-border">
              {uptimeDays}d {uptimeHours % 24}h {Math.floor((stats.uptime % 3600) / 60)}m
           </span>
        </div>
      </div>
    </div>
  );
}
