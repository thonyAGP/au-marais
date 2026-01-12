import { NextRequest, NextResponse } from 'next/server';
import {
  getReservation,
  getReservationByToken,
  updateReservation,
  deleteReservation,
} from '@/lib/db';
import {
  sendReservationApprovedEmail,
  sendReservationRejectedEmail,
  sendPaymentConfirmedEmail,
} from '@/lib/email';
import { createSmoobuReservation, cancelSmoobuReservation } from '@/lib/smoobu';
import type { UpdateReservationInput } from '@/types/reservation';
import Stripe from 'stripe';

// Initialize Stripe lazily to avoid build errors when API key is not set
let stripeInstance: Stripe | null = null;

const getStripe = (): Stripe => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    });
  }
  return stripeInstance;
};

// GET /api/reservations/[id] - Get a single reservation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    let reservation;

    if (token) {
      // Access via secure token (from action links)
      reservation = await getReservationByToken(id, token);
    } else {
      // Admin access (check auth)
      const adminToken = request.cookies.get('adminToken')?.value;
      if (!adminToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      reservation = await getReservation(id);
    }

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error getting reservation:', error);
    return NextResponse.json(
      { error: 'Failed to get reservation' },
      { status: 500 }
    );
  }
}

// PUT /api/reservations/[id] - Update a reservation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const body: UpdateReservationInput & { action?: string; rejectionReason?: string } = await request.json();

    // Verify access
    let reservation;
    if (token) {
      reservation = await getReservationByToken(id, token);
    } else {
      const adminToken = request.cookies.get('adminToken')?.value;
      if (!adminToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      reservation = await getReservation(id);
    }

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Handle special actions
    if (body.action === 'approve') {
      // Create Smoobu reservation to block dates
      let smoobuId: number | undefined;
      try {
        const smoobuResult = await createSmoobuReservation({
          arrivalDate: reservation.arrivalDate,
          departureDate: reservation.departureDate,
          firstName: reservation.firstName,
          lastName: reservation.lastName,
          email: reservation.email,
          phone: reservation.phone,
          adults: reservation.guests,
          price: reservation.total,
          notice: `Réservation #${reservation.id} via au-marais.fr`,
        });
        smoobuId = smoobuResult.id;
      } catch (smoobuError) {
        console.error('Failed to create Smoobu reservation:', smoobuError);
        // Continue anyway - we can create it manually later
      }

      // Create Stripe Payment Link for deposit
      let paymentLink: Stripe.PaymentLink | null = null;
      try {
        if (process.env.STRIPE_SECRET_KEY) {
          const stripe = getStripe();
          // First create a product
          const product = await stripe.products.create({
            name: `Caution - Séjour Au Marais`,
            description: `${reservation.arrivalDate} au ${reservation.departureDate}`,
          });

          // Create a price
          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(reservation.depositAmount * 100), // Convert to cents
            currency: 'eur',
          });

          // Create Payment Link
          paymentLink = await stripe.paymentLinks.create({
            line_items: [{ price: price.id, quantity: 1 }],
            metadata: {
              reservationId: reservation.id,
              type: 'deposit',
            },
            after_completion: {
              type: 'redirect',
              redirect: {
                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://au-marais.fr'}/reservation/confirmed?id=${reservation.id}`,
              },
            },
          });
        }
      } catch (stripeError) {
        console.error('Failed to create Stripe payment link:', stripeError);
        // Continue - admin can send payment link manually
      }

      // Update reservation
      const depositAmount = body.depositAmount || reservation.depositAmount;
      const updated = await updateReservation(id, {
        status: 'approved',
        depositAmount,
        smoobuReservationId: smoobuId,
        stripePaymentLinkId: paymentLink?.id,
        stripePaymentLinkUrl: paymentLink?.url,
      });

      // Send approval email with payment link
      try {
        if (paymentLink?.url) {
          await sendReservationApprovedEmail(updated!, paymentLink.url);
        }
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      return NextResponse.json({
        success: true,
        reservation: updated,
        paymentLink: paymentLink?.url,
      });
    }

    if (body.action === 'reject') {
      // Cancel Smoobu reservation if exists
      if (reservation.smoobuReservationId) {
        try {
          await cancelSmoobuReservation(reservation.smoobuReservationId);
        } catch (smoobuError) {
          console.error('Failed to cancel Smoobu reservation:', smoobuError);
        }
      }

      // Update reservation
      const updated = await updateReservation(id, {
        status: 'rejected',
        rejectionReason: body.rejectionReason,
      });

      // Send rejection email
      try {
        await sendReservationRejectedEmail(updated!, body.rejectionReason);
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }

      return NextResponse.json({
        success: true,
        reservation: updated,
      });
    }

    if (body.action === 'mark_paid') {
      const updated = await updateReservation(id, {
        status: 'paid',
        depositPaid: true,
      });

      // Send payment confirmation email
      try {
        await sendPaymentConfirmedEmail(updated!);
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError);
      }

      return NextResponse.json({
        success: true,
        reservation: updated,
      });
    }

    // Regular update
    const updated = await updateReservation(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to update reservation' },
      { status: 500 }
    );
  }
}

// DELETE /api/reservations/[id] - Delete a reservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Admin only
    const adminToken = request.cookies.get('adminToken')?.value;
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reservation = await getReservation(id);
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Cancel Smoobu reservation if exists
    if (reservation.smoobuReservationId) {
      try {
        await cancelSmoobuReservation(reservation.smoobuReservationId);
      } catch (smoobuError) {
        console.error('Failed to cancel Smoobu reservation:', smoobuError);
      }
    }

    await deleteReservation(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      { error: 'Failed to delete reservation' },
      { status: 500 }
    );
  }
}
