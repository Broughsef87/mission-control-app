'use client';
import Image from 'next/image';
import agents from '@/lib/agents.json';
import initialStatusRaw from '@/lib/agent-status.json';
const initialStatus = initialStatusRaw as Record<string, { location: string; status: string }>;

const stationMap: Record<string, { top: string; left: string; name: string }> = {
  'Command Center': { top: '20%', left: '50%', name: 'Command Center' },
  'Engineering Bay': { top: '60%', left: '20%', name: 'Engineering Bay' },
  'Content Studio': { top: '60%', left: '80%', name: 'Content Studio' },
  'Ready Room': { top: '85%', left: '50%', name: 'Ready Room' },
};

export default function AnimatedOffice() {
  return (
    <div className="relative w-full aspect-[16/9] bg-brand-ivory rounded-lg border border-brand-warm-gray overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(163,153,144,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(163,153,144,0.25) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      {/* Stations */}
      {Object.values(stationMap).map(station => (
        <div key={station.name}
             className="absolute -translate-x-1/2 -translate-y-1/2"
             style={{ top: station.top, left: station.left }}>
          <div className="relative px-3 py-1 bg-white border border-brand-warm-gray rounded shadow-sm">
            <span className="font-display text-xs uppercase text-brand-slate">{station.name}</span>
          </div>
        </div>
      ))}

      {/* Agents */}
      {agents.map(agent => {
        const status = initialStatus[agent.id] || { location: 'Ready Room', status: 'idle' };
        const station = stationMap[status.location] || stationMap['Ready Room'];
        const offsetIndex = agents.filter(a => (initialStatus[a.id] || { location: 'Ready Room' }).location === status.location).indexOf(agent);
        const offsetX = (offsetIndex % 3) * 45 - 45;
        const offsetY = Math.floor(offsetIndex / 3) * 45 - 22;

        return (
          <div key={agent.id}
               className="absolute transition-all duration-1000 ease-in-out z-10"
               style={{
                 top: `calc(${station.top} + ${offsetY}px)`,
                 left: `calc(${station.left} + ${offsetX}px)`,
                 transform: 'translate(-50%, -50%)'
               }}>
            <Image
              src={agent.avatar}
              alt={agent.name}
              width={40}
              height={40}
              className={`rounded-full border-2 ${status.status === 'active' ? 'border-brand-gold' : 'border-brand-warm-gray'} shadow`}
              unoptimized
            />
          </div>
        );
      })}
    </div>
  );
}
