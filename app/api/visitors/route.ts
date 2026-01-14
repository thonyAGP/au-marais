import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'guests-locations.json');

    if (!fs.existsSync(dataPath)) {
      // Return demo data if file doesn't exist
      return NextResponse.json({
        guests: [],
        countrySummary: {},
        metadata: { totalGuests: 0, guestsWithLocation: 0 }
      });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load visitor data' },
      { status: 500 }
    );
  }
}
