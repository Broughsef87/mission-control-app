/**
 * stripe-client.ts — Stripe metrics helpers for Dad Strength App
 * Requires env var: STRIPE_SECRET_KEY
 */

import Stripe from 'stripe';

let _stripe: Stripe | null = null;

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

export interface StripeMetrics {
  mrr: number;                // Monthly Recurring Revenue in cents
  activeSubscriptions: number;
  newSubscriptionsThisMonth: number;
  churnedThisMonth: number;
  recentCharges: StripeCharge[];
}

export interface StripeCharge {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  created: number;
  status: string;
}

export async function getStripeMetrics(): Promise<StripeMetrics | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthTs = Math.floor(startOfMonth.getTime() / 1000);

    // Active subscriptions
    const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
    const activeSubscriptions = subs.data.length;

    // MRR = sum of all active subscription amounts (normalized to monthly)
    const mrr = subs.data.reduce((sum, sub) => {
      const item = sub.items.data[0];
      if (!item) return sum;
      const amount = item.price.unit_amount ?? 0;
      const interval = item.price.recurring?.interval;
      if (interval === 'year') return sum + Math.round(amount / 12);
      return sum + amount;
    }, 0);

    // New subs this month
    const newSubs = await stripe.subscriptions.list({
      created: { gte: monthTs },
      limit: 100,
    });
    const newSubscriptionsThisMonth = newSubs.data.length;

    // Canceled this month
    const canceled = await stripe.subscriptions.list({
      status: 'canceled',
      limit: 100,
    });
    const churnedThisMonth = canceled.data.filter(
      s => s.canceled_at && s.canceled_at >= monthTs
    ).length;

    // Recent charges
    const charges = await stripe.charges.list({ limit: 10 });
    const recentCharges: StripeCharge[] = charges.data.map(c => ({
      id: c.id,
      amount: c.amount,
      currency: c.currency,
      description: c.description,
      created: c.created,
      status: c.status,
    }));

    return { mrr, activeSubscriptions, newSubscriptionsThisMonth, churnedThisMonth, recentCharges };
  } catch (err) {
    console.error('[Stripe] Failed to fetch metrics:', err);
    return null;
  }
}

export function formatCurrency(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
