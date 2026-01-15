import { NextResponse } from 'next/server';
import { getSmoobuGuests, getGuestsWithLocation } from '@/lib/smoobu';

// GET /api/smoobu/guests - Test endpoint to check guest location data
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'summary';

  try {
    if (mode === 'full') {
      // Get all guests with location data
      const guestsWithLocation = await getGuestsWithLocation();
      return NextResponse.json({
        success: true,
        totalWithLocation: guestsWithLocation.length,
        guests: guestsWithLocation,
      });
    }

    // Summary mode - just check first page
    const response = await getSmoobuGuests(1);

    const stats = {
      totalGuests: response.totalItems,
      pageSize: response.pageSize,
      pageCount: response.pageCount,
      sampleGuests: response.guests.slice(0, 5).map((g) => ({
        name: `${g.firstName} ${g.lastName.charAt(0)}.`,
        hasCountry: !!g.address.country,
        hasCity: !!g.address.city,
        country: g.address.country,
        city: g.address.city,
        bookingsCount: g.bookings.length,
      })),
      guestsWithCountryOnFirstPage: response.guests.filter((g) => g.address.country).length,
    };

    return NextResponse.json({
      success: true,
      message: 'Summary of first page of guests',
      stats,
    });
  } catch (error) {
    console.error('Error fetching Smoobu guests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch guests from Smoobu' },
      { status: 500 }
    );
  }
}
