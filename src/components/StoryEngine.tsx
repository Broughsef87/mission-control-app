'use client';

import { BookOpen, Sparkles, MessageSquare } from 'lucide-react';

export default function StoryEngine() {
  return (
    <div className="bg-[#1a1d24] border border-[#2f333e] rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <BookOpen size={16} className="text-purple-400" />
          Story Engine
        </h3>
        <Sparkles size={14} className="text-purple-400 animate-pulse" />
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-[#23262f] rounded-lg border border-purple-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <MessageSquare size={40} className="text-purple-400" />
          </div>
          <p className="text-xs text-purple-200 font-medium mb-2 uppercase tracking-tighter">Current Narrative</p>
          <p className="text-sm text-gray-300 italic leading-relaxed">
            "The transition to SQLite is more than a technical migration; it's the foundation for our autonomous future. Every entry in the ledger is a step toward complete self-reliance."
          </p>
          <div className="mt-4 flex gap-2">
            <button className="px-3 py-1.5 rounded-md bg-purple-600/20 text-purple-400 text-[10px] font-bold border border-purple-600/30 hover:bg-purple-600/30 transition-colors">
              REGENERATE
            </button>
            <button className="px-3 py-1.5 rounded-md bg-transparent text-gray-500 text-[10px] font-bold border border-[#2f333e] hover:text-gray-300 transition-colors">
              ARCHIVE
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Story Threads</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 rounded-full bg-[#14161b] text-gray-400 text-[10px] border border-[#2f333e]">#TheMigration</span>
            <span className="px-2 py-1 rounded-full bg-[#14161b] text-gray-400 text-[10px] border border-[#2f333e]">#ShadowFrontend</span>
            <span className="px-2 py-1 rounded-full bg-[#14161b] text-gray-400 text-[10px] border border-[#2f333e]">#ForgeOS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
