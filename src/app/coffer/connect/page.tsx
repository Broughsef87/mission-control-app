'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink, PlaidLinkOnSuccessMetadata } from 'react-plaid-link';

interface ExchangeResult {
  ok: true;
  item_id: string;
  institution_name: string | null;
  account_count: number;
  accounts: { name: string; mask: string | null; type: string; subtype: string | null }[];
}

const TOKEN_KEY = 'coffer_plaid_link_token';

export default function CofferConnectPage() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [receivedRedirectUri, setReceivedRedirectUri] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<'idle' | 'loading-token' | 'token-ready' | 'exchanging' | 'connected' | 'error'>('loading-token');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExchangeResult | null>(null);

  // OAuth resumption: if Chase redirected back, we need the ORIGINAL link_token
  // from localStorage + window.location.href as receivedRedirectUri. Otherwise
  // Plaid's onSuccess never fires after the OAuth handoff.
  useEffect(() => {
    const url = new URL(window.location.href);
    const isOAuthRedirect = url.searchParams.has('oauth_state_id');

    if (isOAuthRedirect) {
      const stored = window.localStorage.getItem(TOKEN_KEY);
      if (!stored) {
        setError('OAuth redirect detected but no stored link token. Start the connect flow again.');
        setStatus('error');
        return;
      }
      setLinkToken(stored);
      setReceivedRedirectUri(window.location.href);
      setStatus('token-ready');
      return;
    }

    setStatus('loading-token');
    fetch('/api/plaid/create-link-token', { method: 'POST' })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
        window.localStorage.setItem(TOKEN_KEY, data.link_token);
        setLinkToken(data.link_token);
        setStatus('token-ready');
      })
      .catch((e) => {
        setError(e.message);
        setStatus('error');
      });
  }, []);

  const onSuccess = useCallback(async (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => {
    setStatus('exchanging');
    try {
      const r = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token, metadata }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      window.localStorage.removeItem(TOKEN_KEY);
      setResult(data);
      setStatus('connected');
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    receivedRedirectUri,
    onSuccess,
  });

  // After OAuth redirect, Plaid Link auto-resumes once it's ready — open()
  // surfaces any pending state to finish the flow.
  useEffect(() => {
    if (receivedRedirectUri && ready) open();
  }, [receivedRedirectUri, ready, open]);

  return (
    <main style={{ padding: '2rem', maxWidth: '640px', margin: '0 auto', fontFamily: 'var(--font-sans, system-ui)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Coffer — Connect a bank</h1>
      <p style={{ color: 'var(--ab-muted, #6A7888)', marginBottom: '2rem', fontSize: '0.875rem' }}>
        Single Plaid item per bank login. Use this for Chase business (checking + cards on the same login).
      </p>

      {status === 'loading-token' && <p>Requesting Plaid link token…</p>}

      {status === 'token-ready' && !receivedRedirectUri && (
        <button
          onClick={() => open()}
          disabled={!ready}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            background: 'var(--ab-gold, #E8A320)',
            color: 'var(--ab-base, #05070C)',
            border: 'none',
            borderRadius: '6px',
            cursor: ready ? 'pointer' : 'not-allowed',
            opacity: ready ? 1 : 0.5,
          }}
        >
          Connect Chase
        </button>
      )}

      {status === 'token-ready' && receivedRedirectUri && (
        <p>Resuming Plaid OAuth flow…</p>
      )}

      {status === 'exchanging' && <p>Exchanging public token + storing access credentials…</p>}

      {status === 'connected' && result && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid var(--ab-green, #28CD41)', borderRadius: '6px' }}>
          <p style={{ fontWeight: 600, color: 'var(--ab-green, #28CD41)', marginBottom: '0.5rem' }}>
            ✓ Connected to {result.institution_name || 'institution'}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--ab-muted, #6A7888)', marginBottom: '0.75rem' }}>
            item_id: <code>{result.item_id}</code>
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{result.account_count} account(s) linked:</p>
          <ul style={{ fontSize: '0.8125rem', paddingLeft: '1.25rem' }}>
            {result.accounts.map((a, i) => (
              <li key={i}>
                {a.name} {a.mask ? `(•••${a.mask})` : ''} — {a.type}/{a.subtype}
              </li>
            ))}
          </ul>
        </div>
      )}

      {status === 'error' && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid var(--ab-red, #DC2626)', borderRadius: '6px' }}>
          <p style={{ color: 'var(--ab-red, #DC2626)', fontWeight: 600 }}>Error</p>
          <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>{error}</p>
        </div>
      )}
    </main>
  );
}
