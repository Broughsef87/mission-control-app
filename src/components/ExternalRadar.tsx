import React from 'react';

interface ExternalStatus {
  id: string;
  service: string;
  status: string;
  message: string | null;
  timestamp: string;
}

export default function ExternalRadar({ statuses }: { statuses: ExternalStatus[] }) {
  const services = [
    { name: 'Vercel', icon: '▲' },
    { name: 'YouTube', icon: '▶' },
    { name: 'GitHub', icon: '' },
    { name: 'Supabase', icon: '⚡' }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'success':
        return 'text-ab-green';
      case 'failed':
      case 'error':
        return 'text-forge-red';
      case 'pending':
        return 'text-forge-orange';
      default:
        return 'text-ab-muted';
    }
  };

  return (
    <div className="bg-forge-panel/40 border border-white/5 rounded-sm p-6 backdrop-blur-sm relative overflow-hidden group hover:border-ab-blue/30 transition-all">
      <div className="absolute top-0 right-0 p-3 font-mono text-[9px] text-ab-muted tracking-widest uppercase">The Radar // external</div>
      <h3 className="text-lg font-bold mb-6 tracking-tight flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-ab-blue animate-pulse"></span>
        External Radar
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {services.map(service => {
          const latestStatus = statuses.find(s => s.service.toLowerCase() === service.name.toLowerCase());
          return (
            <div key={service.name} className="border border-ab-border bg-ab-surface-2 p-4 rounded-sm hover:border-ab-border-bright transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-lg opacity-40">{service.icon}</span>
                <span className={`text-[8px] font-bold uppercase tracking-widest ${latestStatus ? getStatusColor(latestStatus.status) : 'text-ab-muted'}`}>
                  {latestStatus?.status || 'OFFLINE'}
                </span>
              </div>
              <div className="text-[10px] font-bold text-ab-text uppercase tracking-tighter mb-1">{service.name}</div>
              <div className="text-[8px] text-ab-muted font-mono truncate">
                {latestStatus?.message || 'Awaiting signal...'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


