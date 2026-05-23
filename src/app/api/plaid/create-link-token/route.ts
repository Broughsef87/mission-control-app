import { NextResponse } from 'next/server';
import { CountryCode, LinkTokenCreateRequest, Products } from 'plaid';
import { getPlaid } from '@/lib/plaid';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const plaid = getPlaid();
  if (!plaid) {
    return NextResponse.json(
      { error: 'PLAID_CLIENT_ID / PLAID_SECRET not set' },
      { status: 500 }
    );
  }

  try {
    const payload: LinkTokenCreateRequest = {
      client_name: 'Mission Control',
      language: 'en',
      country_codes: [CountryCode.Us],
      user: { client_user_id: 'andrew' },
      products: [Products.Transactions],
    };
    // Required for OAuth institutions (Chase). Must match a URI registered
    // in the Plaid dashboard. Sandbox's "First Platypus Bank" doesn't need it.
    if (process.env.PLAID_REDIRECT_URI) {
      payload.redirect_uri = process.env.PLAID_REDIRECT_URI;
    }
    const res = await plaid.linkTokenCreate(payload);
    return NextResponse.json({
      link_token: res.data.link_token,
      expiration: res.data.expiration,
    });
  } catch (err: any) {
    const msg = err?.response?.data?.error_message || err?.message || 'unknown';
    return NextResponse.json({ error: `Plaid linkTokenCreate failed: ${msg}` }, { status: 500 });
  }
}
