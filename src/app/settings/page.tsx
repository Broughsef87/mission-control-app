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
      <div className="flex justify-between items-end border-b border-brand-warm-gray pb-6">
        <div>
          <h1 className="forge-heading text-3xl">
            System <span className="text-brand-gold">Settings</span>
          </h1>
          <p className="text-xs font-mono text-brand-medium-gray uppercase tracking-widest mt-1">
            Global Configuration // Mission Control 2.0
          </p>
        </div>
        <button className="bg-brand-charcoal hover:bg-brand-ink text-white font-black uppercase text-[10px] px-8 py-2 tracking-widest transition-all italic flex items-center gap-2">
          <Save className="w-3 h-3" /> Save Changes
        </button>
      </div>

      <div className="flex gap-10">
        {/* Settings Nav */}
        <div className="w-64 space-y-1">
          {sections.map((section) => (
            <button
              key={section.name}
              className={`w-full flex items-center gap-4 px-4 py-3 border transition-all uppercase tracking-widest font-black text-[10px] ${
                section.active
                  ? 'bg-brand-gold/10 border-brand-gold/30 text-brand-ink italic'
                  : 'bg-white border-brand-warm-gray text-brand-medium-gray hover:text-brand-ink hover:border-brand-medium-gray'
              }`}
            >
              <section.icon className={`w-4 h-4 ${section.active ? 'text-brand-gold' : ''}`} />
              {section.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-8 max-w-2xl">
          <div className="bg-white border border-brand-warm-gray p-8 space-y-8">
            <div className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-medium-gray italic">User Profile</h2>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">Full Name</label>
                  <input type="text" defaultValue="Andrew" className="w-full bg-brand-parchment border border-brand-warm-gray p-3 text-[11px] text-brand-ink focus:outline-none focus:border-brand-gold uppercase font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">Callsign</label>
                  <input type="text" defaultValue="The Architect" className="w-full bg-brand-parchment border border-brand-warm-gray p-3 text-[11px] text-brand-ink focus:outline-none focus:border-brand-gold uppercase font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">Bio / Mission Statement</label>
                <textarea rows={3} defaultValue="Producing value 24/7. Building the autonomous future." className="w-full bg-brand-parchment border border-brand-warm-gray p-3 text-[11px] text-brand-ink focus:outline-none focus:border-brand-gold uppercase font-bold resize-none" />
              </div>
            </div>

            <div className="pt-8 border-t border-brand-warm-gray space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-medium-gray italic">System Vitals</h2>

              <div className="flex items-center justify-between p-4 bg-brand-parchment border border-brand-warm-gray group hover:border-brand-gold/40 transition-all">
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
                  <span className="text-[8px] font-mono text-green-600 uppercase font-black">Connected</span>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-brand-parchment border border-brand-warm-gray group hover:border-brand-gold/40 transition-all">
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

          <div className="p-6 bg-red-50 border border-red-200 flex justify-between items-center group hover:bg-red-100 transition-all">
            <div>
              <div className="text-[10px] font-black text-red-600 uppercase tracking-widest">Emergency Reset</div>
              <div className="text-[8px] font-mono text-red-400 uppercase mt-1">Wipe local cache and force re-authentication</div>
            </div>
            <button className="bg-white border border-red-300 text-red-600 text-[10px] font-black uppercase px-6 py-2 tracking-widest hover:bg-red-600 hover:text-white transition-all">
              Initiate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
