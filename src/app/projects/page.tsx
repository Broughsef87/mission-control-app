"use client";

import React from 'react';
import { LayoutGrid, List, Search, ExternalLink, CheckCircle2, Clock } from 'lucide-react';

const ProjectsPage = () => {
  const projects = [
    { name: 'Dad Strength App', client: 'Internal', budget: 'N/A', deadine: '2026-04-01', status: 'In Progress', accentClass: 'bg-brand-gold' },
    { name: 'Forge OS Website', client: 'Internal', budget: 'N/A', deadine: '2026-03-14', status: 'Completed', accentClass: 'bg-green-500' },
    { name: 'Client A: Automation', client: 'Forge Agency', budget: '$4.5k', deadine: '2026-03-25', status: 'In Review', accentClass: 'bg-blue-400' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-brand-warm-gray pb-6">
        <div>
          <h1 className="forge-heading text-3xl">
            Project <span className="text-brand-gold">Pipeline</span>
          </h1>
          <p className="text-xs font-mono text-brand-medium-gray uppercase tracking-widest mt-1">
            Task Management & Revenue Tracking // Forge OS Agency
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border border-brand-warm-gray hover:border-brand-gold text-brand-medium-gray hover:text-brand-ink transition-all">
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button className="p-2 border border-brand-warm-gray hover:border-brand-gold text-brand-medium-gray hover:text-brand-ink transition-all">
            <List className="w-4 h-4" />
          </button>
          <button className="bg-brand-charcoal hover:bg-brand-ink text-white font-black uppercase text-[10px] px-6 py-2 tracking-widest transition-all italic ml-4">
            New Project +
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-brand-medium-gray border-b border-brand-warm-gray pb-6">
        <button className="text-brand-gold border-b border-brand-gold pb-6 -mb-[25px]">All Projects</button>
        <button className="hover:text-brand-ink transition-colors">Internal</button>
        <button className="hover:text-brand-ink transition-colors">Client Work</button>
        <button className="hover:text-brand-ink transition-colors">Archived</button>
        <div className="flex-1" />
        <div className="relative">
          <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-brand-medium-gray" />
          <input
            type="text"
            placeholder="Search Registry..."
            className="bg-white border border-brand-warm-gray pl-9 pr-4 py-2 text-[10px] focus:outline-none focus:border-brand-gold w-64 uppercase tracking-tighter text-brand-ink"
          />
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {projects.map((project) => (
          <div key={project.name} className="bg-white border border-brand-warm-gray p-6 hover:border-brand-gold/60 transition-all group cursor-pointer relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-2 h-full ${project.accentClass}`} />

            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-[9px] font-mono text-brand-medium-gray uppercase mb-1 tracking-widest">{project.client}</div>
                <h3 className="text-xl font-black text-brand-ink uppercase tracking-tighter group-hover:text-brand-gold transition-colors">
                  {project.name}
                </h3>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-[10px] font-mono border-b border-brand-warm-gray pb-2">
                <span className="text-brand-medium-gray uppercase flex items-center gap-2"><Clock className="w-3 h-3" /> Deadline</span>
                <span className="text-brand-ink">{project.deadine}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono border-b border-brand-warm-gray pb-2">
                <span className="text-brand-medium-gray uppercase flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Status</span>
                <span className={`font-bold ${project.status === 'Completed' ? 'text-green-600' : 'text-brand-gold'}`}>{project.status}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-lg font-black text-brand-ink italic">{project.budget}</div>
              <button className="p-2 border border-brand-warm-gray hover:bg-brand-gold hover:text-white hover:border-brand-gold transition-all">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
