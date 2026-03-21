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
      const res = await fetch('/api/projects');
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
      <div className="bg-[#1a1d24] border border-[#2f333e] rounded-xl p-5 shadow-sm animate-pulse">
        <div className="h-4 w-32 bg-[#2f333e] rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-[#23262f] rounded-lg"></div>
          <div className="h-20 bg-[#23262f] rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1d24] border border-[#2f333e] rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <Activity size={16} className="text-green-400 animate-pulse" />
          Live Pulse: Projects
        </h3>
        <span className="text-[10px] font-mono text-gray-500">LIVE</span>
      </div>

      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project.id} className="group relative bg-[#23262f] rounded-lg p-3 hover:bg-[#2a2d36] transition-colors border border-transparent hover:border-[#3e414b]">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-white flex items-center gap-2">
                  {project.name}
                  {project.status === 'Active' && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                </h4>
                <p className="text-xs text-gray-400 mt-1">{project.description}</p>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] border ${
                  project.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                  project.status === 'Development' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {project.status}
                </span>
                {project.priority > 1 && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-500 border border-red-500/20">
                    High Priority
                  </span>
                )}
              </div>
              
              <div className="flex -space-x-2">
                {Array.from(new Set(project.tasks.map(t => t.agent).filter(Boolean))).map((agent) => (
                  <div 
                    key={agent}
                    className="w-6 h-6 rounded-full border-2 border-[#23262f] bg-indigo-500 flex items-center justify-center text-[8px] font-bold text-white shadow-sm" 
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
          <p className="text-xs text-gray-500 text-center py-4 italic">No active projects found.</p>
        )}
      </div>
    </div>
  );
}
