import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getCollection } from '@/lib/mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || WEBHOOK_SECRET.includes('placeholder')) {
      console.log('Webhook: No signature or placeholder secret, skipping verification');
      return NextResponse.json({ received: true, mock: true });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const ordersCollection = await getCollection('orders');
      
      const updateResult = await ordersCollection.updateOne(
        { stripe_session_id: session.id },
        {
          $set: {
            status: 'paid',
            customer_email: session.customer_email || session.customer_details?.email,
            paid_at: new Date(),
            payment_status: session.payment_status,
            amount_total: session.amount_total,
            currency: session.currency,
            line_items_detail: lineItems.data.map(item => ({
              description: item.description,
              quantity: item.quantity,
              amount_total: item.amount_total,
              price_id: item.price?.id,
            })),
          },
        },
        { upsert: true }
      );

      if (updateResult.modifiedCount > 0 || updateResult.upsertedCount > 0) {
        console.log('Order marked as PAID:', session.id);
      } else {
        console.warn('Order not found for session:', session.id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed', details: error.message }, { status: 500 });
  }
}