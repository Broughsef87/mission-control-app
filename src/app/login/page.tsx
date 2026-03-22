"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import ForgeLogo from '@/components/ForgeLogo';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sb, setSb] = useState<SupabaseClient | null>(null);
  const router = useRouter();
  const params = useSearchParams();

  // Fetch Supabase config from API route (runtime env vars — always reliable)
  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(({ url, key }) => {
        if (url && key) setSb(createClient(url, key));
      });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!sb) { setError('Configuration loading — please try again.'); return; }
    setLoading(true);
    setError('');

    const { error: err } = await sb.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const redirect = params.get('redirect');
    // Don't redirect back to an API route
    const dest = redirect && !redirect.startsWith('/api') ? redirect : '/';
    router.push(dest);
    router.refresh();
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#7A7870' }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="you@forge.com"
          style={{ backgroundColor: '#2C2A26', color: '#E8E4DC', borderColor: '#3E3C38', caretColor: '#D4D0C8' }}
          className="w-full border rounded-lg p-3 text-sm focus:outline-none transition-colors font-mono tracking-tight placeholder:text-[#5A5850]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#7A7870' }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          style={{ backgroundColor: '#2C2A26', color: '#E8E4DC', borderColor: '#3E3C38', caretColor: '#D4D0C8' }}
          className="w-full border rounded-lg p-3 text-sm focus:outline-none transition-colors font-mono placeholder:text-[#5A5850]"
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg text-[11px] font-mono uppercase" style={{ backgroundColor: '#2A1A18', border: '1px solid #8A4A42', color: '#A86058' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !sb}
        className="forge-button disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Authenticating...' : !sb ? 'Loading...' : 'Enter Mission Control →'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-forge-grid flex items-center justify-center p-6">
      <div data-reveal="0" className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <ForgeLogo className="w-12 h-12" />
          <div>
            <div className="forge-heading text-2xl" style={{ color: '#E8E4DC' }}>Forge OS</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em]" style={{ color: '#7A7870' }}>
              Mission Control
            </div>
          </div>
        </div>

        <div className="forge-panel space-y-6">
          <div>
            <h1 className="forge-heading text-xl mb-1" style={{ color: '#E8E4DC' }}>Executive Access</h1>
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#7A7870' }}>
              Authenticate to continue
            </p>
          </div>

          <Suspense fallback={<div className="h-40" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-[10px] font-mono uppercase tracking-widest mt-6" style={{ color: '#6A6860' }}>
          Forge OS // Executive Terminal v2.4.0
        </p>
      </div>
    </div>
  );
}
