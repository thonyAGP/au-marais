import { NextRequest, NextResponse } from 'next/server';
import { getReservationByConfirmationToken } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  try {
    const reservation = await getReservationByConfirmationToken(token);

    if (!reservation) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    // Return only safe fields for public display
    return NextResponse.json({
      id: reservation.id,
      firstName: reservation.firstName,
      arrivalDate: reservation.arrivalDate,
      departureDate: reservation.departureDate,
      nights: reservation.nights,
      guests: reservation.guests,
      total: reservation.total,
      depositAmount: reservation.depositAmount,
      depositPaid: reservation.depositPaid,
      status: reservation.status,
    });
  } catch (error) {
    console.error('Error getting reservation by confirmation token:', error);
    return NextResponse.json(
      { error: 'Failed to get reservation' },
      { status: 500 }
    );
  }
}
