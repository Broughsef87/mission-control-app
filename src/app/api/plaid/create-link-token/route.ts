import { NextResponse } from 'next/server';
import { CountryCode, Products } from 'plaid';
import { getPlaid } from '@/lib/plaid';

export const dynamic = 'force-dynamic';

export async function POST() {
  const plaid = getPlaid();
  if (!plaid) {
    return NextResponse.json(
      { error: 'PLAID_CLIENT_ID / PLAID_SECRET not set' },
      { status: 500 }
    );
  }

  try {
    const res = await plaid.linkTokenCreate({
      client_name: 'Mission Control',
      language: 'en',
      country_codes: [CountryCode.Us],
      user: { client_user_id: 'andrew' },
      products: [Products.Transactions],
    });
    return NextResponse.json({
      link_token: res.data.link_token,
      expiration: res.data.expiration,
    });
  } catch (err: any) {
    const msg = err?.response?.data?.error_message || err?.message || 'unknown';
    return NextResponse.json({ error: `Plaid linkTokenCreate failed: ${msg}` }, { status: 500 });
  }
}
