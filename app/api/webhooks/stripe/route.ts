import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getReservation, updateReservation } from '@/lib/db';
import { sendPaymentConfirmedEmail } from '@/lib/email';

// Initialize Stripe
const getStripe = (): Stripe => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  });
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Stripe webhook: Missing signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Stripe webhook: STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Stripe webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment intent succeeded: ${paymentIntent.id}`);
      // Payment Links use checkout.session.completed, but log this for debugging
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const reservationId = session.metadata?.reservationId;

  if (!reservationId) {
    console.error('Stripe webhook: No reservationId in session metadata', {
      sessionId: session.id,
      metadata: session.metadata,
    });
    return;
  }

  console.log(`Processing payment for reservation ${reservationId}`);

  try {
    // Get the reservation
    const reservation = await getReservation(reservationId);

    if (!reservation) {
      console.error(`Stripe webhook: Reservation not found: ${reservationId}`);
      return;
    }

    // Check if already paid (idempotency)
    if (reservation.status === 'paid' && reservation.depositPaid) {
      console.log(`Reservation ${reservationId} already marked as paid`);
      return;
    }

    // Update reservation status
    const updated = await updateReservation(reservationId, {
      status: 'paid',
      depositPaid: true,
      stripePaymentIntentId: session.payment_intent as string,
    });

    console.log(`Reservation ${reservationId} marked as paid`);

    // Send confirmation email
    if (updated) {
      try {
        await sendPaymentConfirmedEmail(updated);
        console.log(`Payment confirmation email sent for reservation ${reservationId}`);
      } catch (emailError) {
        console.error(`Failed to send payment confirmation email for ${reservationId}:`, emailError);
        // Don't fail the webhook - payment is confirmed, email is secondary
      }
    }
  } catch (error) {
    console.error(`Error processing payment for reservation ${reservationId}:`, error);
    throw error; // Re-throw to return 500 and trigger Stripe retry
  }
}
