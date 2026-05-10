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
    <div className="bg-ab-surface rounded-lg p-4 h-full">
      <h2 className="text-lg font-semibold text-ab-text mb-4">Agent Vitals</h2>
      <div className="space-y-3">
        {Object.entries(agentStatus).map(([id, status]) => (
          <div key={id} className="flex items-center justify-between bg-black/30 p-2 rounded-md">
            <div className="flex items-center">
              <span className={`h-2 w-2 rounded-full mr-3 ${status.status === 'active' ? 'bg-ab-green' : 'bg-ab-muted'}`}></span>
              <span className="font-semibold text-sm text-ab-blue">{agentNameMap[id] || 'Unknown'}</span>
            </div>
            <span className="text-xs text-ab-body truncate max-w-[150px]">{status.task}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
