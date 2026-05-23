"use client";

import React from 'react';
import { User, Bell, Shield, Github, Zap, Sliders, Monitor, Save, Database } from 'lucide-react';

const SettingsPage = () => {
  const sections = [
    { name: 'Profile', icon: User, active: true },
    { name: 'Appearance', icon: Monitor, active: false },
    { name: 'Notifications', icon: Bell, active: false },
    { name: 'Security', icon: Shield, active: false },
    { name: 'Integrations', icon: Github, active: false },
    { name: 'Advanced', icon: Sliders, active: false },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div data-reveal="0" className="flex justify-between items-end border-b border-brand-warm-gray pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="forge-heading text-3xl">
              System <span className="text-brand-gold">Settings</span>
            </h1>
            <span className="text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border border-ab-gold/40 text-ab-gold bg-[rgba(232,163,32,0.08)] rounded">WIP</span>
          </div>
          <p className="text-xs font-mono text-brand-medium-gray uppercase tracking-widest mt-1">
            Global Configuration // The Foundry 2.0
          </p>
        </div>
        <button className="bg-brand-charcoal hover:bg-brand-ink text-ab-body font-black uppercase text-[10px] px-8 py-2 rounded-lg tracking-widest transition-all italic flex items-center gap-2 focus:outline-none">
          <Save className="w-3 h-3" /> Save Changes
        </button>
      </div>

      <div data-reveal="1" className="flex gap-10">
        {/* Settings Nav */}
        <div className="w-64 space-y-1">
          {sections.map((section) => (
            <button
              key={section.name}
              className={`w-full flex items-center gap-4 px-4 py-3 border rounded-xl transition-all uppercase tracking-widest font-black text-[10px] focus:outline-none ${
                section.active
                  ? 'bg-[#E8A320]/10 border-[#E8A320]/30 text-[#EAEAEA] italic'
                  : 'bg-[#0A0D14] border-[#1A2130] text-[#6A7888] hover:text-[#B8C0CC] hover:border-[#6A7888]'
              }`}
            >
              <section.icon className={`w-4 h-4 ${section.active ? 'text-brand-gold' : ''}`} />
              {section.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-8 max-w-2xl">
          <div className="forge-panel p-8 space-y-8">
            <div className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-medium-gray italic">User Profile</h2>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">Full Name</label>
                  <input type="text" defaultValue="Andrew" className="forge-input uppercase font-bold text-[11px]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">Callsign</label>
                  <input type="text" defaultValue="" placeholder="Optional" className="forge-input uppercase font-bold text-[11px]" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">Bio / Mission Statement</label>
                <textarea rows={3} defaultValue="Producing value 24/7. Building the autonomous future." className="forge-input uppercase font-bold text-[11px] resize-none" />
              </div>
            </div>

            <div className="pt-8 border-t border-brand-warm-gray space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-medium-gray italic">System Vitals</h2>

              <div className="forge-panel flex items-center justify-between p-4 group hover:border-brand-gold/40 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-brand-ink uppercase tracking-tight">Supabase Synchronization</div>
                    <div className="text-[8px] font-mono text-brand-medium-gray uppercase">Last Sync: 2 minutes ago</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[8px] font-mono text-ab-green uppercase font-black">Connected</span>
                  <div className="w-2 h-2 rounded-full bg-ab-green" />
                </div>
              </div>

              <div className="forge-panel flex items-center justify-between p-4 group hover:border-brand-gold/40 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-brand-ink uppercase tracking-tight">Vercel Deployment Pipeline</div>
                    <div className="text-[8px] font-mono text-brand-medium-gray uppercase">Endpoint: forge-os-website.vercel.app</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[8px] font-mono text-brand-gold uppercase font-black">Ready</span>
                  <div className="w-2 h-2 rounded-full bg-brand-gold" />
                </div>
              </div>
            </div>
          </div>

          <div className="forge-panel p-6 border-ab-red/20 flex justify-between items-center group hover:border-ab-red/40 transition-all">
            <div>
              <div className="text-[10px] font-black text-ab-red uppercase tracking-widest">Emergency Reset</div>
              <div className="text-[8px] font-mono text-ab-red uppercase mt-1">Wipe local cache and force re-authentication</div>
            </div>
            <button className="bg-[#0F1520] border border-[#DC2626]/40 rounded-lg text-[#DC2626] text-[10px] font-black uppercase px-6 py-2 tracking-widest hover:bg-[#DC2626] hover:text-[#0A0D14] transition-all focus:outline-none">
              Initiate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;


