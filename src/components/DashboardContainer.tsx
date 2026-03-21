'use client';

import React, { useState, useEffect } from 'react';
import AgentHeatmap from './AgentHeatmap';
import BurnMeter from './BurnMeter';
import ExternalRadar from './ExternalRadar';
import StoryEngine from './StoryEngine';
import MetricsSidebar from './MetricsSidebar';

export default function DashboardContainer() {
  const [data, setData] = useState<{ projects: any[]; actions: any[]; tokens: any[]; status: any[] }>({
    projects: [],
    actions: [],
    tokens: [],
    status: []
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [projectsRes, pulseRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/pulse')
      ]);
      const projects = await projectsRes.json();
      const pulse = await pulseRes.json();
      
      setData({
        projects: Array.isArray(projects) ? projects : [],
        actions: pulse.actions || [],
        tokens: pulse.tokens || [],
        status: pulse.status || []
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-forge-orange/20 border-t-forge-orange rounded-full animate-spin"></div>
          <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Initializing War Room...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Left Column: Projects & Narrative */}
      <div className="lg:col-span-8 space-y-8">
        {/* Active Projects Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Active <span className="text-forge-orange">Projects</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Live Pulse Active</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {data.projects.map((project: any) => (
              <div key={project.id} className="bg-forge-panel/40 border border-white/5 rounded-sm p-6 backdrop-blur-sm group hover:border-forge-orange/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-mono text-forge-orange bg-forge-orange/10 px-2 py-0.5 rounded-full border border-forge-orange/20 uppercase">
                    {project.status}
                  </span>
                  <span className="text-gray-700 font-mono text-[10px]">P{project.priority}</span>
                </div>
                <h4 className="text-xl font-bold mb-2 group-hover:text-forge-orange transition-colors">{project.name}</h4>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                  <button className="text-[9px] font-bold text-white uppercase tracking-widest hover:text-forge-orange transition-colors">Details →</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Narrative & Timeline */}
        <StoryEngine />
      </div>

      {/* Right Column: Tracking Tools */}
      <div className="lg:col-span-4 space-y-8">
        <BurnMeter logs={data.tokens} />
        <AgentHeatmap actions={data.actions} />
        <ExternalRadar statuses={data.status} />
        <MetricsSidebar />
      </div>
    </div>
  );
}
