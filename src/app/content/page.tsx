"use client";

import React, { useState } from 'react';
import { Youtube, Plus, MessageSquare, List, CheckCircle2, MoreVertical, Layout, Kanban } from 'lucide-react';

const ContentStudio = () => {
  const [activeTab, setActiveTab] = useState('kanban');

  const channels = [
    { name: 'YouTube', icon: Youtube, colorClass: 'text-red-500', count: 4 },
    { name: 'Forge OS Blog', icon: Layout, colorClass: 'text-brand-gold', count: 2 },
    { name: 'X/Twitter', icon: MessageSquare, colorClass: 'text-blue-500', count: 12 },
    { name: 'Skool', icon: List, colorClass: 'text-green-600', count: 8 },
  ];

  const kanbanColumns = [
    {
      id: 'backlog',
      name: 'Backlog',
      tasks: [
        { id: 1, title: 'B2B AI Agency Pivot Reveal', channel: 'YouTube', priority: 'High', type: 'Video' },
        { id: 2, title: 'The "Nap-Squeeze" Framework', channel: 'YouTube', priority: 'Medium', type: 'Short' },
      ]
    },
    {
      id: 'scripting',
      name: 'Scripting',
      tasks: [
        { id: 3, title: 'How I Built My Autonomous CoS', channel: 'Forge OS Blog', priority: 'High', type: 'Article' },
      ]
    },
    {
      id: 'production',
      name: 'Production',
      tasks: [
        { id: 4, title: 'Dad Strength: Day 01', channel: 'YouTube', priority: 'Critical', type: 'Video' },
      ]
    },
    {
      id: 'done',
      name: 'Published',
      tasks: [
        { id: 5, title: 'Forge OS Launch Post', channel: 'X/Twitter', priority: 'Low', type: 'Thread' },
      ]
    }
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div data-reveal="0" className="flex justify-between items-end border-b border-brand-warm-gray pb-8">
        <div>
          <h1 className="forge-heading text-3xl">
            Content <span className="text-brand-gold">Pipeline</span>
          </h1>
          <p className="text-xs font-mono text-brand-medium-gray uppercase tracking-widest mt-1">
            Multimedia Production Hub // Forge OS Media
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-brand-warm-gray rounded-lg hover:border-brand-gold text-brand-ink font-black uppercase text-[10px] px-6 py-2 tracking-widest transition-all">
            Search Hub
          </button>
          <button className="bg-brand-charcoal hover:bg-brand-ink text-white font-black uppercase text-[10px] px-6 py-2 rounded-lg tracking-widest transition-all italic">
            New Project +
          </button>
        </div>
      </div>

      {/* Channel Hub */}
      <div data-reveal="1" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {channels.map((channel) => {
          const Icon = channel.icon;
          return (
            <div key={channel.name} className="bg-white border border-brand-warm-gray rounded-2xl p-4 hover:border-brand-gold/40 transition-all cursor-pointer group relative overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="w-12 h-12 text-brand-ink" />
              </div>
              <div className="flex flex-col gap-1 relative z-10">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3 h-3 ${channel.colorClass}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-slate">
                    {channel.name}
                  </span>
                </div>
                <div className="text-2xl font-black text-brand-ink">{channel.count}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div data-reveal="2" className="space-y-6">
        {/* View Switcher */}
        <div className="flex justify-between items-center border-b border-brand-warm-gray pb-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === 'kanban' ? 'text-brand-gold' : 'text-brand-medium-gray hover:text-brand-slate'
              }`}
            >
              <Kanban className="w-3 h-3" />
              Kanban Board
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === 'list' ? 'text-brand-gold' : 'text-brand-medium-gray hover:text-brand-slate'
              }`}
            >
              <List className="w-3 h-3" />
              List View
            </button>
          </div>
          <div className="text-[10px] font-mono text-brand-medium-gray uppercase italic">
            // Drag to reorder active
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
          {kanbanColumns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-slate">
                  {column.name} <span className="text-brand-gold ml-1">({column.tasks.length})</span>
                </h3>
                <MoreVertical className="w-3 h-3 text-brand-medium-gray" />
              </div>

              <div className="space-y-4">
                {column.tasks.map((task) => (
                  <div key={task.id} className="bg-white border border-brand-warm-gray rounded-xl p-5 hover:border-brand-gold/50 transition-all cursor-move group relative" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div className="absolute top-0 left-0 w-[2px] h-0 group-hover:h-full bg-brand-gold transition-all duration-300" />
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 border ${
                        task.priority === 'Critical' ? 'border-red-300 text-red-600 bg-red-50' :
                        task.priority === 'High' ? 'border-brand-gold/40 text-brand-gold bg-brand-gold/5' :
                        'border-brand-warm-gray text-brand-medium-gray'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-[8px] font-mono text-brand-medium-gray uppercase italic">{task.type}</span>
                    </div>
                    <h4 className="text-sm font-black text-brand-ink group-hover:text-brand-gold transition-colors mb-4 leading-tight uppercase tracking-tighter">
                      {task.title}
                    </h4>
                    <div className="flex justify-between items-center pt-4 border-t border-brand-warm-gray">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                        <span className="text-[9px] font-mono text-brand-slate uppercase tracking-tighter font-bold">{task.channel}</span>
                      </div>
                      <div className="flex -space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-brand-ivory border border-brand-warm-gray flex items-center justify-center text-[7px] text-brand-slate font-bold">C</div>
                        <div className="w-5 h-5 rounded-full bg-brand-gold border border-white flex items-center justify-center text-[7px] text-white font-black">I</div>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full py-3 border border-dashed border-brand-warm-gray hover:border-brand-gold/50 text-brand-medium-gray hover:text-brand-gold transition-all text-[10px] font-black uppercase tracking-widest">
                  + Add Item
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentStudio;
