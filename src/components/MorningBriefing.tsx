"use client";

import React, { useEffect, useState } from 'react';
import { RefreshCw, Radio } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Briefing {
  id: string;
  content: string;
  created_at: string;
}

export default function MorningBriefing() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  async function load() {
    const res = await fetch('/api/briefing').catch(() => null);
    if (!res?.ok) { setLoading(false); return; }
    const data = await res.json();
    setBriefing(data);
    setLoading(false);
  }

  async function regenerate() {
    setRegenerating(true);
    const res = await fetch('/api/briefing', { method: 'POST' }).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      setBriefing(data);
    }
    setRegenerating(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="forge-panel relative overflow-hidden">
      {/* Gold accent bar */}
      <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-brand-gold to-brand-gold-light rounded-l-2xl" />
      <div className="pl-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-brand-gold" />
            <h2 className="forge-heading text-base">Morning Briefing</h2>
          </div>
          <div className="flex items-center gap-3">
            {briefing && (
              <span className="text-[9px] font-mono text-brand-medium-gray uppercase">
                {formatDistanceToNow(new Date(briefing.created_at), { addSuffix: true })}
              </span>
            )}
            <button
              onClick={regenerate}
              disabled={regenerating}
              className="p-1.5 border border-brand-warm-gray rounded-lg hover:border-brand-gold text-brand-medium-gray hover:text-brand-gold transition-all"
              title="Regenerate briefing"
            >
              <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-3 bg-brand-warm-gray rounded animate-pulse" style={{ width: `${70 + i * 10}%` }} />
            ))}
          </div>
        ) : briefing ? (
          <p className="text-sm text-brand-slate leading-relaxed font-sans italic">
            &ldquo;{briefing.content}&rdquo;
          </p>
        ) : (
          <p className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">
            No briefing available. Connect Supabase to enable.
          </p>
        )}
      </div>
    </div>
  );
}
