'use client';

import { useState, useEffect } from 'react';
import initialStatus from '@/lib/agent-status.json';

interface AgentStatus {
  status: 'active' | 'idle';
  task: string;
  location: string;
}

const agentNameMap: { [key: string]: string } = {
  'devroux': 'Devroux',
  'isaac': 'Isaac',
  'charles': 'Charles',
  'max': 'Max',
  'gabriel': 'Gabriel',
  'ollie': 'Ollie',
  'silas': 'Silas'
};

export default function AgentVitals() {
  const [agentStatus, setAgentStatus] = useState<Record<string, AgentStatus>>(initialStatus as Record<string, AgentStatus>);

  // Placeholder for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, you would fetch from an API endpoint
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 h-full">
      <h2 className="text-lg font-semibold text-white mb-4">Agent Vitals</h2>
      <div className="space-y-3">
        {Object.entries(agentStatus).map(([id, status]) => (
          <div key={id} className="flex items-center justify-between bg-black/30 p-2 rounded-md">
            <div className="flex items-center">
              <span className={`h-2 w-2 rounded-full mr-3 ${status.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              <span className="font-semibold text-sm text-indigo-400">{agentNameMap[id] || 'Unknown'}</span>
            </div>
            <span className="text-xs text-gray-400 truncate max-w-[150px]">{status.task}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
