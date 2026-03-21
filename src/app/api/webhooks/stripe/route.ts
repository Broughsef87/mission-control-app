import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createNotification } from '@/lib/db';

export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(request: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 200 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription;
      const amount = sub.items.data[0]?.price?.unit_amount ?? 0;
      await createNotification({
        type: 'success',
        title: 'New Subscriber',
        body: `Dad Strength App — new subscription at $${(amount / 100).toFixed(2)}/mo`,
        source: 'stripe',
      });
      break;
    }
    case 'customer.subscription.deleted': {
      await createNotification({
        type: 'warning',
        title: 'Subscription Canceled',
        body: 'Dad Strength App — subscriber canceled their plan',
        source: 'stripe',
      });
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const amount = (invoice.amount_paid ?? 0) / 100;
      await createNotification({
        type: 'success',
        title: `Payment Received — $${amount.toFixed(2)}`,
        body: `Invoice paid: ${invoice.number ?? invoice.id}`,
        source: 'stripe',
      });
      break;
    }
    case 'invoice.payment_failed': {
      await createNotification({
        type: 'error',
        title: 'Payment Failed',
        body: 'Dad Strength App — an invoice payment failed',
        source: 'stripe',
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
