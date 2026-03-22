"use client";

import React, { useState, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import ForgeLogo from '@/components/ForgeLogo';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const redirect = params.get('redirect') ?? '/';
    router.push(redirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">
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
        <label className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">
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
        <div className="p-3 rounded-lg text-[11px] font-mono uppercase" style={{ backgroundColor: '#2A1A18', borderColor: '#8A4A42', border: '1px solid', color: '#A86058' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="forge-button disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Authenticating...' : 'Enter Mission Control →'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-forge-grid flex items-center justify-center p-6">
      <div data-reveal="0" className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <ForgeLogo className="w-12 h-12" />
          <div>
            <div className="forge-heading text-2xl">Forge OS</div>
            <div className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-[0.25em]">
              Mission Control
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="forge-panel space-y-6">
          <div>
            <h1 className="forge-heading text-xl mb-1">Executive Access</h1>
            <p className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">
              Authenticate to continue
            </p>
          </div>

          <Suspense fallback={<div className="h-40" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest mt-6">
          Forge OS // Executive Terminal v2.4.0
        </p>
      </div>
    </div>
  );
}
