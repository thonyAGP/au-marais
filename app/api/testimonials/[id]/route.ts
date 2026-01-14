import { NextRequest, NextResponse } from 'next/server';
import {
  getTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '@/lib/db';
import type { TestimonialUpdateInput } from '@/types/testimonial';

const ADMIN_SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN;

// Validate admin token
const isAdmin = (request: NextRequest): boolean => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.substring(7);
  return token === ADMIN_SESSION_TOKEN;
};

// GET /api/testimonials/[id] - Get a single testimonial (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const testimonial = await getTestimonial(id);

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ testimonial });
  } catch (error) {
    console.error('Error getting testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to get testimonial' },
      { status: 500 }
    );
  }
}

// PUT /api/testimonials/[id] - Update/moderate a testimonial (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, adminNotes, rejectionReason } = body;

    const testimonial = await getTestimonial(id);
    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    let updates: TestimonialUpdateInput = {};

    switch (action) {
      case 'approve':
        updates = { status: 'approved', adminNotes };
        break;

      case 'reject':
        if (!rejectionReason) {
          return NextResponse.json(
            { error: 'Rejection reason is required' },
            { status: 400 }
          );
        }
        updates = { status: 'rejected', rejectionReason, adminNotes };
        break;

      case 'update':
        // Allow updating admin notes without changing status
        updates = { adminNotes };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: approve, reject, or update' },
          { status: 400 }
        );
    }

    const updated = await updateTestimonial(id, updates);

    return NextResponse.json({
      success: true,
      testimonial: updated,
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

// DELETE /api/testimonials/[id] - Delete a testimonial (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const deleted = await deleteTestimonial(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
