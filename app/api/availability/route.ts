import { NextRequest, NextResponse } from 'next/server';
import { getAvailability } from '@/lib/smoobu';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json(
      { error: 'Missing required parameters: start, end' },
      { status: 400 }
    );
  }

  try {
    const data = await getAvailability(start, end);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Smoobu API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
