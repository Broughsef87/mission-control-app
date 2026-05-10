'use client';

import { useState, useEffect } from 'react';
import { Terminal, CheckCircle2, Circle, AlertCircle, ExternalLink, Activity } from 'lucide-react';

interface Task {
  id: string;
  content: string;
  completed: boolean;
  agent: string | null;
}

interface Project {
  id: string;
  name: string;
  status: string;
  description: string | null;
  priority: number;
  updatedAt: string;
  tasks: Task[];
}

export default function ProjectStatus() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' });
      const data = await res.json();
      setProjects(data.projects || []);
      setIsLoading(false);
    } catch (e) {
      console.error('Failed to fetch projects', e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 10000); // Polling for "Live Pulse"
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="forge-panel animate-pulse">
        <div className="h-4 w-32 bg-ab-border-bright rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-ab-surface-2 rounded-lg"></div>
          <div className="h-20 bg-ab-surface-2 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="forge-panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ab-text uppercase tracking-wider flex items-center gap-2">
          <Activity size={16} className="text-ab-green animate-pulse" />
          Live Pulse: Projects
        </h3>
        <span className="text-[10px] font-mono text-ab-muted">LIVE</span>
      </div>

      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project.id} className="group relative bg-ab-surface-2 rounded-lg p-3 hover:bg-ab-border transition-colors border border-transparent hover:border-ab-border-bright">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-ab-body flex items-center gap-2">
                  {project.name}
                  {project.status === 'Active' && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ab-green opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-ab-green"></span>
                    </span>
                  )}
                </h4>
                <p className="text-xs text-ab-body mt-1">{project.description}</p>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] border ${
                  project.status === 'Active' ? 'bg-ab-green/10 text-ab-green border-ab-green/20' : 
                  project.status === 'Development' ? 'bg-ab-gold/10 text-ab-gold border-ab-gold/20' :
                  'bg-ab-blue/10 text-ab-blue border-ab-blue/20'
                }`}>
                  {project.status}
                </span>
                {project.priority > 1 && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-ab-red/10 text-ab-red border border-ab-red/20">
                    High Priority
                  </span>
                )}
              </div>
              
              <div className="flex -space-x-2">
                {Array.from(new Set(project.tasks.map(t => t.agent).filter(Boolean))).map((agent) => (
                  <div 
                    key={agent}
                    className="w-6 h-6 rounded-full border-2 border-ab-surface bg-ab-blue flex items-center justify-center text-[8px] font-bold text-ab-text"
                    title={agent!}
                  >
                    {agent?.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {projects.length === 0 && (
          <p className="text-xs text-ab-muted text-center py-4 italic">No active projects found.</p>
        )}
      </div>
    </div>
  );
}

