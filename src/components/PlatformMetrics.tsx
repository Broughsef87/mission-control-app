"use client";

import React, { useEffect, useState } from 'react';
import { Youtube, CreditCard, Users, TrendingUp, ExternalLink } from 'lucide-react';
import { formatCount } from '@/lib/youtube';

interface YouTubeData {
  subscriberCount?: string;
  viewCount?: string;
  videoCount?: string;
  configured?: boolean;
  recentVideos?: Array<{ title: string; viewCount: string; publishedAt: string }>;
}

interface StripeData {
  mrr?: number;
  activeSubscriptions?: number;
  newSubscriptionsThisMonth?: number;
  churnedThisMonth?: number;
  configured?: boolean;
}

interface SkoolData {
  members: number;
  newThisWeek: number;
}

export default function PlatformMetrics() {
  const [youtube, setYoutube] = useState<YouTubeData | null>(null);
  const [stripe, setStripe] = useState<StripeData | null>(null);
  const [skool] = useState<SkoolData>({ members: 0, newThisWeek: 0 }); // Manual until Skool has API
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ytRes, strRes] = await Promise.allSettled([
        fetch('/api/metrics/youtube').then(r => r.json()),
        fetch('/api/metrics/stripe').then(r => r.json()),
      ]);
      if (ytRes.status === 'fulfilled') setYoutube(ytRes.value);
      if (strRes.status === 'fulfilled') setStripe(strRes.value);
      setLoading(false);
    }
    load();
  }, []);

  const mrrFormatted = stripe?.mrr != null
    ? `$${Math.round(stripe.mrr / 100).toLocaleString()}`
    : '—';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="forge-heading text-lg">Platform Metrics</h2>
        <span className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest">
          {loading ? 'Loading...' : 'Live'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* YouTube */}
        <div className="forge-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-red-50 rounded-xl">
              <Youtube className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-slate">YouTube</span>
          </div>
          {youtube?.configured === false ? (
            <p className="text-[9px] font-mono text-brand-medium-gray italic">Add YOUTUBE_API_KEY to enable</p>
          ) : (
            <div className="space-y-2">
              <div>
                <div className="text-2xl font-black text-brand-ink">
                  {youtube ? formatCount(youtube.subscriberCount ?? '0') : '—'}
                </div>
                <div className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-wide">Subscribers</div>
              </div>
              <div className="flex gap-4 pt-1 border-t border-brand-warm-gray">
                <div>
                  <div className="text-sm font-bold text-brand-charcoal">
                    {youtube ? formatCount(youtube.viewCount ?? '0') : '—'}
                  </div>
                  <div className="text-[8px] font-mono text-brand-medium-gray uppercase">Total Views</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-charcoal">{youtube?.videoCount ?? '—'}</div>
                  <div className="text-[8px] font-mono text-brand-medium-gray uppercase">Videos</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dad Strength App (Stripe) */}
        <div className="forge-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-brand-gold/10 rounded-xl">
              <CreditCard className="w-4 h-4 text-brand-gold" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-slate">Dad Strength</span>
          </div>
          {stripe?.configured === false ? (
            <p className="text-[9px] font-mono text-brand-medium-gray italic">Add STRIPE_SECRET_KEY to enable</p>
          ) : (
            <div className="space-y-2">
              <div>
                <div className="text-2xl font-black text-brand-ink">{mrrFormatted}</div>
                <div className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-wide">MRR</div>
              </div>
              <div className="flex gap-4 pt-1 border-t border-brand-warm-gray">
                <div>
                  <div className="text-sm font-bold text-brand-charcoal">{stripe?.activeSubscriptions ?? '—'}</div>
                  <div className="text-[8px] font-mono text-brand-medium-gray uppercase">Active Subs</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-green-600">+{stripe?.newSubscriptionsThisMonth ?? '—'}</div>
                  <div className="text-[8px] font-mono text-brand-medium-gray uppercase">New MTD</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Skool */}
        <div className="forge-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-green-50 rounded-xl">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-slate">Skool</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-black text-brand-ink">
                {skool.members > 0 ? skool.members.toLocaleString() : '—'}
              </div>
              <div className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-wide">Members</div>
            </div>
            <div className="flex gap-4 pt-1 border-t border-brand-warm-gray">
              <div>
                <div className="text-sm font-bold text-green-600">+{skool.newThisWeek}</div>
                <div className="text-[8px] font-mono text-brand-medium-gray uppercase">This Week</div>
              </div>
            </div>
            <p className="text-[8px] font-mono text-brand-medium-gray/60 italic">Update manually in Settings</p>
          </div>
        </div>
      </div>

      {/* Recent YouTube Videos */}
      {youtube?.recentVideos && youtube.recentVideos.length > 0 && (
        <div className="forge-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3 h-3 text-brand-gold" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate">Recent Videos</h3>
          </div>
          <div className="space-y-2">
            {youtube.recentVideos.slice(0, 3).map((v, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-brand-warm-gray/50 last:border-0">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3 h-3 text-brand-medium-gray shrink-0" />
                  <p className="text-[10px] font-bold text-brand-ink uppercase tracking-tight truncate max-w-[220px]">{v.title}</p>
                </div>
                <span className="text-[9px] font-mono text-brand-gold shrink-0">{formatCount(v.viewCount)} views</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
