'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Agent Definitions with Colors and Positions (Grid Coordinates: x, y)
const AGENTS = [
  { id: 'devroux', name: 'Devroux', role: 'Ops / Commander', color: 'bg-blue-500', pos: { x: 4, y: 3 }, avatar: '🤖' },
  { id: 'isaac', name: 'Isaac', role: 'Researcher', color: 'bg-green-500', pos: { x: 1, y: 1 }, avatar: '🔍' },
  { id: 'charles', name: 'Charles', role: 'Producer', color: 'bg-purple-500', pos: { x: 1, y: 5 }, avatar: '🎬' },
  { id: 'max', name: 'Max', role: 'Engineer', color: 'bg-amber-500', pos: { x: 7, y: 1 }, avatar: '💻' },
  { id: 'gabriel', name: 'Gabriel', role: 'Watchdog', color: 'bg-red-500', pos: { x: 8, y: 6 }, avatar: '🛡️' },
  { id: 'ollie', name: 'Ollie', role: 'Socials', color: 'bg-pink-500', pos: { x: 7, y: 5 }, avatar: '🐦' },
  { id: 'leo', name: 'Leo', role: 'Product', color: 'bg-teal-500', pos: { x: 2, y: 3 }, avatar: '💰' },
  { id: 'oscar', name: 'Oscar', role: 'Jr Engineer', color: 'bg-cyan-500', pos: { x: 6, y: 1 }, avatar: '👷' },
];

export default function OfficeMap() {
  const [activeAgents, setActiveAgents] = useState<string[]>([]);

  // Simulate active state fetching (Replace with API call later)
  useEffect(() => {
    const fetchStatus = async () => {
      // For now, mock it. In real implementation, fetch from /api/agents
      // const res = await fetch('/api/agents');
      // const data = await res.json();
      // setActiveAgents(data.active);
      
      // Mock: Randomly toggle activity to demonstrate UI
      const randomAgent = AGENTS[Math.floor(Math.random() * AGENTS.length)].id;
      setActiveAgents(prev => {
         if (prev.includes(randomAgent)) return prev.filter(id => id !== randomAgent);
         return [...prev, randomAgent];
      });
    };

    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-[#111] p-8 flex items-center justify-center relative overflow-hidden rounded-xl border border-[#333] shadow-2xl">
      {/* Grid Floor Pattern */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* The Office Floorplan */}
      <div className="relative w-[800px] h-[500px] bg-[#1a1a1a] rounded-lg border-4 border-[#444] shadow-[0_0_50px_rgba(0,0,0,0.5)] grid grid-cols-9 grid-rows-7 gap-2 p-4">
        
        {/* Desks (Static Props) */}
        {AGENTS.map(agent => (
           <div key={`desk-${agent.id}`} 
                className="absolute w-16 h-10 bg-[#3a3a3a] border-t-4 border-[#555] rounded-sm shadow-md flex items-center justify-center"
                style={{ 
                  left: `${agent.pos.x * 11.11}%`, 
                  top: `${agent.pos.y * 14.28}%`,
                  transform: 'translate(-50%, -50%)'
                }}>
                <div className="w-8 h-6 bg-[#111] rounded-sm border border-[#444] relative top-[-10px] shadow-[0_0_5px_rgba(100,200,255,0.1)]"></div>
           </div>
        ))}

        {/* Meeting Table (Center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 bg-[#2a2a2a] rounded-full border-4 border-[#444] flex items-center justify-center">
            <span className="text-[#444] text-xs font-mono tracking-widest">WAR ROOM</span>
        </div>

        {/* Agents (Dynamic) */}
        {AGENTS.map(agent => {
          const isActive = activeAgents.includes(agent.id);
          
          return (
            <motion.div
              key={agent.id}
              className="absolute z-10 flex flex-col items-center"
              initial={{ x: 0, y: 0 }}
              animate={{
                // If active, stay at desk (or move to screen). If idle, maybe wander (future feature).
                // For now, let's just pulsate or show status.
                left: `${agent.pos.x * 11.11}%`, 
                top: `${agent.pos.y * 14.28 + 2}%`, // Slightly below desk
              }}
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              {/* Status Bubble */}
              {isActive && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: -20 }}
                  className="absolute -top-8 bg-[#222] text-white text-[9px] px-2 py-1 rounded border border-[#444] whitespace-nowrap z-20"
                >
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
                  Working...
                </motion.div>
              )}

              {/* The Agent Avatar (Pixel Art Style) */}
              <div className={`w-8 h-8 ${agent.color} rounded-sm shadow-[0_4px_0_rgba(0,0,0,0.3)] flex items-center justify-center text-sm border-2 border-white/20 relative group cursor-pointer transition-transform hover:scale-110`}>
                {agent.avatar}
                
                {/* Thinking Particles (if active) */}
                {isActive && (
                   <span className="absolute -top-1 -right-1 flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                   </span>
                )}
              </div>

              {/* Name Tag */}
              <span className={`mt-1 text-[9px] font-bold px-1 rounded bg-black/50 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {agent.name}
              </span>
            </motion.div>
          );
        })}

      </div>
      
      <div className="absolute bottom-6 left-6 text-gray-500 text-xs font-mono">
        MISSION CONTROL // OFFICE VIEW
      </div>
    </div>
  );
}
