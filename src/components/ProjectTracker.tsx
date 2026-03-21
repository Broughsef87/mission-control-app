'use client';
import { useState, useEffect } from 'react';
import projectsData from '@/lib/projects.json';

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  lastUpdate: string;
}

const priorityColorMap = {
  HIGH: 'border-red-500',
  MEDIUM: 'border-yellow-500',
  LOW: 'border-green-500',
};

export default function ProjectTracker() {
  const [projects, setProjects] = useState<Project[]>(projectsData as Project[]);

  // Placeholder for real-time updates
  useEffect(() => {
    // In a real app, you would fetch this data
  }, []);

  return (
    <div className="bg-gray-900/50 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Project Tracker</h2>
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className={`bg-black/30 p-4 rounded-md border-l-4 ${priorityColorMap[project.priority]}`}>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-indigo-400">{project.name}</h3>
              <span className="text-xs font-mono bg-gray-700 px-2 py-1 rounded">{project.status}</span>
            </div>
            <p className="text-sm text-gray-400 mb-2">{project.description}</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
