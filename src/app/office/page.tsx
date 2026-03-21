"use client";

import React from 'react';
import { Mail, Calendar, CheckSquare, Clock, ArrowUpRight, Search, FileText } from 'lucide-react';

const OfficePage = () => {
  const tasks = [
    { title: 'Approve Forge OS Landing Page Copy', time: '09:00 AM', priority: 'High', type: 'Review' },
    { title: 'Update TODO.md for Autonomous Content', time: '11:30 AM', priority: 'Medium', type: 'Dev' },
    { title: 'Check B2B Agency Leads', time: '02:00 PM', priority: 'High', type: 'Sales' },
  ];

  const comms = [
    { from: 'Lisa', subject: 'Agency Pitch Deck Draft', time: '10m ago', unread: true },
    { from: 'System', subject: 'Overnight Sprint Report', time: '7h ago', unread: false },
    { from: 'GitHub', subject: 'Deployment Successful: Forge-OS', time: '12h ago', unread: false },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-brand-warm-gray pb-6">
        <div>
          <h1 className="forge-heading text-3xl">
            Virtual <span className="text-brand-gold">Office</span>
          </h1>
          <p className="text-xs font-mono text-brand-medium-gray uppercase tracking-widest mt-1">
            Communication & Administration // Forge OS Headquarters
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-brand-medium-gray" />
            <input
              type="text"
              placeholder="Search Archives..."
              className="bg-white border border-brand-warm-gray pl-9 pr-4 py-2 text-[10px] focus:outline-none focus:border-brand-gold w-48 uppercase tracking-tighter text-brand-ink"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inbox / Comms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-slate flex items-center gap-3">
              <Mail className="w-3 h-3 text-brand-gold" /> Neural Inbox
            </h2>
            <button className="text-[8px] font-mono text-brand-medium-gray uppercase hover:text-brand-ink transition-colors tracking-widest">Mark All Read</button>
          </div>

          <div className="space-y-3">
            {comms.map((msg, i) => (
              <div key={i} className={`p-4 border flex items-center justify-between hover:border-brand-gold/40 transition-all cursor-pointer group ${msg.unread ? 'bg-brand-gold/5 border-brand-gold/20' : 'bg-white border-brand-warm-gray'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-1 h-8 ${msg.unread ? 'bg-brand-gold' : 'bg-brand-warm-gray group-hover:bg-brand-medium-gray'}`} />
                  <div>
                    <div className="text-[9px] font-mono text-brand-medium-gray uppercase mb-1">{msg.from} <span className="mx-2 opacity-30">//</span> {msg.time}</div>
                    <div className={`text-sm font-bold uppercase tracking-tight ${msg.unread ? 'text-brand-ink' : 'text-brand-slate'}`}>{msg.subject}</div>
                  </div>
                </div>
                <button className="p-2 text-brand-medium-gray group-hover:text-brand-gold transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-8 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-slate flex items-center gap-3">
              <CheckSquare className="w-3 h-3 text-brand-gold" /> Task Queue
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white border border-brand-warm-gray group hover:border-brand-gold/40 transition-all">
                  <div className={`text-[8px] font-black uppercase px-2 py-1 italic tracking-widest ${task.priority === 'High' ? 'bg-brand-gold text-white' : 'border border-brand-warm-gray text-brand-medium-gray'}`}>
                    {task.priority}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-brand-ink uppercase tracking-tight group-hover:text-brand-gold transition-colors">{task.title}</div>
                    <div className="text-[9px] font-mono text-brand-medium-gray uppercase mt-1">{task.type} <span className="mx-2 opacity-30">|</span> {task.time}</div>
                  </div>
                  <input type="checkbox" className="w-4 h-4 border-brand-warm-gray accent-brand-gold" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar / Schedule */}
        <div className="space-y-6">
          <div className="bg-white border border-brand-warm-gray p-6 space-y-8 relative overflow-hidden">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-slate flex items-center gap-3">
              <Calendar className="w-3 h-3 text-brand-gold" /> Schedule
            </h2>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="text-lg font-black text-brand-ink italic">15</div>
                  <div className="text-[8px] font-mono text-brand-gold uppercase tracking-widest font-bold">MAR</div>
                </div>
                <div className="flex-1 border-l border-brand-warm-gray pl-4">
                  <div className="text-[10px] font-black text-brand-ink uppercase tracking-widest mb-1">Sunday Sprint</div>
                  <div className="text-[8px] font-mono text-brand-medium-gray uppercase italic">08:00 AM - 12:00 PM</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-[8px] font-black uppercase text-brand-medium-gray tracking-widest italic border-b border-brand-warm-gray pb-2 flex justify-between items-center">
                  Up Next
                  <Clock className="w-3 h-3" />
                </div>
                <div className="text-[10px] font-bold text-brand-slate uppercase tracking-tight">Weekly Review & Planning</div>
                <div className="text-[10px] font-bold text-brand-medium-gray uppercase tracking-tight opacity-70">Content Production: Video 01</div>
                <div className="text-[10px] font-bold text-brand-gold/70 uppercase tracking-tight opacity-60">App Deployment Test</div>
              </div>
            </div>

            <button className="w-full bg-brand-parchment border border-brand-warm-gray hover:border-brand-gold text-brand-ink font-black uppercase text-[10px] py-3 tracking-widest transition-all italic mt-4">
              Open Full Calendar
            </button>
          </div>

          <div className="bg-white border border-brand-warm-gray p-6 flex items-center justify-between group cursor-pointer hover:border-brand-gold/40 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-brand-parchment border border-brand-warm-gray text-brand-gold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-ink uppercase tracking-tight group-hover:text-brand-gold transition-colors">Forge OS Assets</div>
                <div className="text-[8px] font-mono text-brand-medium-gray uppercase">24 files • 1.2 GB</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-brand-medium-gray group-hover:text-brand-gold" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficePage;
