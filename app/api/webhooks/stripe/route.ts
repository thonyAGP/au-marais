import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getReservation, updateReservation } from '@/lib/db';
import { sendPaymentConfirmedEmail, sendPaymentFailedAdminEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

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

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutExpired(session);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailed(paymentIntent);
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

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const reservationId = session.metadata?.reservationId;

  if (!reservationId) {
    console.log('Stripe webhook: checkout.session.expired without reservationId');
    return;
  }

  console.log(`Checkout session expired for reservation ${reservationId}`);

  try {
    const reservation = await getReservation(reservationId);

    if (!reservation) {
      console.error(`Stripe webhook: Reservation not found for expired session: ${reservationId}`);
      return;
    }

    // Only notify if reservation is still in approved status (waiting for payment)
    if (reservation.status !== 'approved') {
      console.log(`Reservation ${reservationId} not in approved status, skipping expired notification`);
      return;
    }

    // Send notification to admin
    try {
      await sendPaymentFailedAdminEmail(reservation, {
        errorMessage: 'La session de paiement a expiré sans paiement',
        errorType: 'checkout_expired',
        stripeSessionId: session.id,
      });
      console.log(`Expired session notification sent for reservation ${reservationId}`);
    } catch (emailError) {
      console.error(`Failed to send expired session notification for ${reservationId}:`, emailError);
    }
  } catch (error) {
    console.error(`Error handling expired session for reservation ${reservationId}:`, error);
    // Don't throw - this is not critical
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const reservationId = paymentIntent.metadata?.reservationId;

  if (!reservationId) {
    console.log('Stripe webhook: payment_intent.payment_failed without reservationId');
    return;
  }

  console.log(`Payment failed for reservation ${reservationId}`);

  // Extract error details
  const lastError = paymentIntent.last_payment_error;
  const errorDetails = {
    errorMessage: lastError?.message || 'Paiement refusé',
    errorType: lastError?.type || 'unknown',
    declineCode: lastError?.decline_code || undefined,
  };

  console.log(`Payment failure details for ${reservationId}:`, errorDetails);

  try {
    const reservation = await getReservation(reservationId);

    if (!reservation) {
      console.error(`Stripe webhook: Reservation not found for failed payment: ${reservationId}`);
      return;
    }

    // Only notify if reservation is still in approved status
    if (reservation.status !== 'approved') {
      console.log(`Reservation ${reservationId} not in approved status, skipping failure notification`);
      return;
    }

    // Send notification to admin
    try {
      await sendPaymentFailedAdminEmail(reservation, errorDetails);
      console.log(`Payment failure notification sent for reservation ${reservationId}`);
    } catch (emailError) {
      console.error(`Failed to send payment failure notification for ${reservationId}:`, emailError);
    }
  } catch (error) {
    console.error(`Error handling payment failure for reservation ${reservationId}:`, error);
    // Don't throw - notification failure is not critical
  }
}
