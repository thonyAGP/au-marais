import { NextRequest, NextResponse } from 'next/server';
import {
  createReservation,
  calculatePricing,
  listReservations,
} from '@/lib/db';
import {
  sendReservationReceivedEmail,
  sendAdminNotificationEmail,
} from '@/lib/email';
import { checkAvailability } from '@/lib/smoobu';
import type { CreateReservationInput } from '@/types/reservation';

// Force runtime evaluation (not build-time) to read env vars correctly
export const dynamic = 'force-dynamic';

// Read settings from file (same as existing admin)
const getSettings = async () => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
    const data = await fs.readFile(settingsPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
};

// POST /api/reservations - Create a new reservation request
export async function POST(request: NextRequest) {
  try {
    const body: CreateReservationInput = await request.json();

    // Validate required fields
    const required = ['firstName', 'lastName', 'email', 'phone', 'arrivalDate', 'departureDate', 'guests'];
    for (const field of required) {
      if (!body[field as keyof CreateReservationInput]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate dates
    const arrival = new Date(body.arrivalDate);
    const departure = new Date(body.departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (arrival < today) {
      return NextResponse.json(
        { error: 'Arrival date cannot be in the past' },
        { status: 400 }
      );
    }

    if (departure <= arrival) {
      return NextResponse.json(
        { error: 'Departure date must be after arrival date' },
        { status: 400 }
      );
    }

    // Check availability in Smoobu
    const isAvailable = await checkAvailability(body.arrivalDate, body.departureDate);
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Selected dates are not available' },
        { status: 409 }
      );
    }

    // Get settings for pricing
    const settings = await getSettings();
    const pricing = calculatePricing(
      body.arrivalDate,
      body.departureDate,
      body.guests,
      {
        baseRate: 120, // Base rate
        cleaningFee: settings?.airbnb?.cleaningFee || 50,
        touristTaxPerNight: settings?.airbnb?.touristTax || 2.88,
        weeklyDiscount: settings?.discounts?.weekly || 10,
        biweeklyDiscount: settings?.discounts?.biweekly || 15,
        monthlyDiscount: settings?.discounts?.monthly || 20,
      }
    );

    // Create the reservation
    const reservation = await createReservation(body, pricing);

    // Send confirmation email to client
    try {
      await sendReservationReceivedEmail(reservation);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to admin
    try {
      await sendAdminNotificationEmail(reservation);
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        status: reservation.status,
        total: reservation.total,
        nights: reservation.nights,
      },
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create reservation', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET /api/reservations - List all reservations (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Simple token check (same as existing admin)
    const adminToken = request.cookies.get('adminToken')?.value || token;
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled' | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await listReservations({
      status: status || undefined,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing reservations:', error);
    return NextResponse.json(
      { error: 'Failed to list reservations' },
      { status: 500 }
    );
  }
}
