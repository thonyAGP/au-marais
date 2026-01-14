import { NextResponse } from 'next/server';
import guestsData from '@/data/guests-locations.json';

export async function GET() {
  // Return pre-computed data from JSON file
  // In future, this could be computed dynamically from Smoobu API
  return NextResponse.json({
    guests: guestsData.guests,
    countrySummary: guestsData.countrySummary,
    metadata: guestsData.metadata,
  });
}
