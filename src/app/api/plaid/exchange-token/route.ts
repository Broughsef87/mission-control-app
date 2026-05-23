import { NextRequest, NextResponse } from 'next/server';
import { getPlaid } from '@/lib/plaid';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface ExchangeBody {
  public_token?: string;
  metadata?: {
    institution?: { institution_id?: string; name?: string };
  };
}

export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const plaid = getPlaid();
  if (!plaid) {
    return NextResponse.json(
      { error: 'PLAID_CLIENT_ID / PLAID_SECRET not set' },
      { status: 500 }
    );
  }

  let body: ExchangeBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.public_token) {
    return NextResponse.json({ error: 'Missing public_token' }, { status: 400 });
  }

  try {
    const exchange = await plaid.itemPublicTokenExchange({ public_token: body.public_token });
    const accessToken = exchange.data.access_token;
    const itemId = exchange.data.item_id;

    const accountsRes = await plaid.accountsGet({ access_token: accessToken });
    const accounts = accountsRes.data.accounts.map((a) => ({
      account_id: a.account_id,
      name: a.name,
      official_name: a.official_name,
      type: a.type,
      subtype: a.subtype,
      mask: a.mask,
    }));

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('plaid_items')
      .upsert(
        {
          item_id: itemId,
          access_token: accessToken,
          institution_id: body.metadata?.institution?.institution_id ?? null,
          institution_name: body.metadata?.institution?.name ?? null,
          accounts,
          status: 'active',
        },
        { onConflict: 'item_id' }
      );

    if (error) {
      return NextResponse.json({ error: `Supabase upsert failed: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      item_id: itemId,
      institution_name: body.metadata?.institution?.name ?? null,
      account_count: accounts.length,
      accounts: accounts.map((a) => ({ name: a.name, mask: a.mask, type: a.type, subtype: a.subtype })),
    });
  } catch (err: any) {
    const msg = err?.response?.data?.error_message || err?.message || 'unknown';
    return NextResponse.json({ error: `Plaid exchange failed: ${msg}` }, { status: 500 });
  }
}
