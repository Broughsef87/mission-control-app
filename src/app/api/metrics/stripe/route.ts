import { NextResponse } from 'next/server';
import { getStripeMetrics } from '@/lib/stripe-client';
import { upsertMetric } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = await getStripeMetrics();

    if (!metrics) {
      return NextResponse.json({
        error: 'Stripe not configured. Set STRIPE_SECRET_KEY.',
        configured: false,
      }, { status: 200 });
    }

    // Cache in Supabase
    await Promise.allSettled([
      upsertMetric('stripe', 'mrr_cents', String(metrics.mrr)),
      upsertMetric('stripe', 'active_subscriptions', String(metrics.activeSubscriptions)),
      upsertMetric('stripe', 'new_subs_mtd', String(metrics.newSubscriptionsThisMonth)),
      upsertMetric('stripe', 'churned_mtd', String(metrics.churnedThisMonth)),
    ]);

    return NextResponse.json({ ...metrics, configured: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
