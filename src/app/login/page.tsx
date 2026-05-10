"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ForgeLogo from '@/components/ForgeLogo';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  function handleEnter(e: React.FormEvent) {
    e.preventDefault();
    const redirect = params.get('redirect');
    const dest = redirect && !redirect.startsWith('/api') ? redirect : '/';
    router.push(dest);
  }

  return (
    <form onSubmit={handleEnter} className="space-y-4">
      <button
        type="submit"
        className="forge-button"
      >
        Enter The Foundry →
      </button>
      <p className="text-center text-[9px] font-mono uppercase tracking-widest" style={{ color: '#4A4840' }}>
        Local access — no credentials required
      </p>
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
              The Foundry
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
