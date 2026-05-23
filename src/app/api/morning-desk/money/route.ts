import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getRevenueMTD } from '@/lib/db';

export const dynamic = 'force-dynamic';

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function GET() {
  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json({ configured: false, error: 'STRIPE_SECRET_KEY not set' });
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const weekAgo = now - 7 * 24 * 60 * 60;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthTs = Math.floor(startOfMonth.getTime() / 1000);

    const [activeSubs, recentCharges, disputes, manualRev] = await Promise.all([
      stripe.subscriptions.list({ status: 'active', limit: 100 }),
      stripe.charges.list({ created: { gte: weekAgo }, limit: 100 }),
      stripe.disputes.list({ created: { gte: weekAgo }, limit: 50 }),
      getRevenueMTD().catch(() => ({ total: 0, byCategory: {} }))
    ]);

    const mrr = activeSubs.data.reduce((sum, sub) => {
      const item = sub.items.data[0];
      if (!item) return sum;
      const amount = item.price.unit_amount ?? 0;
      const interval = item.price.recurring?.interval;
      if (interval === 'year') return sum + Math.round(amount / 12);
      return sum + amount;
    }, 0);

    const cashInWeek = recentCharges.data
      .filter(c => c.status === 'succeeded')
      .reduce((sum, c) => sum + c.amount, 0);

    const failedPayments = recentCharges.data.filter(c => c.status === 'failed').length;
    const disputeCount = disputes.data.length;

    // Last week's MRR approximation via canceled subs
    const canceledThisMonth = await stripe.subscriptions.list({
      status: 'canceled',
      created: { gte: monthTs },
      limit: 100,
    });
    const churnedMtd = canceledThisMonth.data.length;

    const newSubsMtd = await stripe.subscriptions.list({
      created: { gte: monthTs },
      limit: 100,
    });

    return NextResponse.json({
      configured: true,
      mrr_cents: mrr,
      mrr: `$${Math.round(mrr / 100).toLocaleString()}`,
      active_subscriptions: activeSubs.data.length,
      cash_in_week_cents: cashInWeek,
      cash_in_week: `$${Math.round(cashInWeek / 100).toLocaleString()}`,
      pipeline_mtd: `$${Math.round(manualRev.total).toLocaleString()}`,
      failed_payments: failedPayments,
      disputes: disputeCount,
      new_subs_mtd: newSubsMtd.data.length,
      churned_mtd: churnedMtd,
      as_of: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ configured: true, error: err.message }, { status: 500 });
  }
}
