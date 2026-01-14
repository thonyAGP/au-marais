import { NextRequest, NextResponse } from 'next/server';
import {
  createTestimonial,
  listTestimonials,
  getPublishedTestimonials,
} from '@/lib/db';
import type { TestimonialInput } from '@/types/testimonial';

const ADMIN_SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN;

// Validate admin token
const isAdmin = (request: NextRequest): boolean => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.substring(7);
  return token === ADMIN_SESSION_TOKEN;
};

// GET /api/testimonials - List testimonials
// Public: returns only published testimonials
// Admin: returns all with optional status filter
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const admin = isAdmin(request);
  const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    if (admin) {
      // Admin: get all testimonials with filtering
      const { testimonials, total } = await listTestimonials({
        status: status || undefined,
        limit,
        offset,
      });
      return NextResponse.json({ testimonials, total });
    } else {
      // Public: only published testimonials
      const testimonials = await getPublishedTestimonials(limit);
      return NextResponse.json({ testimonials, total: testimonials.length });
    }
  } catch (error) {
    console.error('Error listing testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to list testimonials' },
      { status: 500 }
    );
  }
}

// POST /api/testimonials - Submit a new testimonial (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { text, rating, authorName, authorLocation, reservationId, language } = body;

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json(
        { error: 'Text is required (minimum 10 characters)' },
        { status: 400 }
      );
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!authorName || typeof authorName !== 'string' || authorName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Author name is required' },
        { status: 400 }
      );
    }

    const input: TestimonialInput = {
      text: text.trim(),
      rating,
      authorName: authorName.trim(),
      authorLocation: authorLocation?.trim(),
      reservationId,
      language,
    };

    const testimonial = await createTestimonial(input);

    // TODO: Send notification to admin (WhatsApp or email)

    return NextResponse.json({
      success: true,
      message: 'Testimonial submitted for review',
      testimonial: {
        id: testimonial.id,
        status: testimonial.status,
      },
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to submit testimonial' },
      { status: 500 }
    );
  }
}
