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
        return 'text-green-500';
      case 'failed':
      case 'error':
        return 'text-forge-red';
      case 'pending':
        return 'text-forge-orange';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-forge-panel/40 border border-white/5 rounded-sm p-6 backdrop-blur-sm relative overflow-hidden group hover:border-blue-500/30 transition-all">
      <div className="absolute top-0 right-0 p-3 font-mono text-[9px] text-gray-700 tracking-widest uppercase">The Radar // external</div>
      <h3 className="text-lg font-bold mb-6 tracking-tight flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        External Radar
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {services.map(service => {
          const latestStatus = statuses.find(s => s.service.toLowerCase() === service.name.toLowerCase());
          return (
            <div key={service.name} className="border border-white/5 bg-white/5 p-4 rounded-sm hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-lg opacity-40">{service.icon}</span>
                <span className={`text-[8px] font-bold uppercase tracking-widest ${latestStatus ? getStatusColor(latestStatus.status) : 'text-gray-600'}`}>
                  {latestStatus?.status || 'OFFLINE'}
                </span>
              </div>
              <div className="text-[10px] font-bold text-white uppercase tracking-tighter mb-1">{service.name}</div>
              <div className="text-[8px] text-gray-500 font-mono truncate">
                {latestStatus?.message || 'Awaiting signal...'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
