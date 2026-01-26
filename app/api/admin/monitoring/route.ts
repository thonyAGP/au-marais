import { NextRequest, NextResponse } from 'next/server';
import { listReservations } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface ResendEmail {
  id: string;
  to: string[];
  from: string;
  subject: string;
  created_at: string;
  last_event: string;
}

interface ResendResponse {
  object: string;
  data: ResendEmail[];
  has_more: boolean;
}

// Failed email events
const FAILED_EVENTS = ['bounced', 'complained', 'delivery_delayed'];

// Fetch emails from Resend API
const fetchResendEmails = async (limit: number = 50): Promise<ResendEmail[]> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Monitoring] RESEND_API_KEY not configured');
    return [];
  }

  try {
    const response = await fetch(`https://api.resend.com/emails?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error('[Monitoring] Resend API error:', response.status);
      return [];
    }

    const data: ResendResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('[Monitoring] Failed to fetch Resend emails:', error);
    return [];
  }
};

// GET /api/admin/monitoring
export async function GET(request: NextRequest) {
  // Check admin authentication
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  const adminToken = request.cookies.get('adminToken')?.value || token;

  if (!adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch data in parallel
    const [allEmails, reservationsData] = await Promise.all([
      fetchResendEmails(50),
      listReservations({ limit: 100 }),
    ]);

    // Separate failed emails from successful ones
    const failedEmails = allEmails.filter((e) => FAILED_EVENTS.includes(e.last_event));
    const successEmails = allEmails.filter((e) => !FAILED_EVENTS.includes(e.last_event)).slice(0, 20);

    // Calculate reservation stats
    const reservations = reservationsData.reservations || [];
    const stats = {
      total: reservations.length,
      pending: reservations.filter((r) => r.status === 'pending').length,
      approved: reservations.filter((r) => r.status === 'approved').length,
      paid: reservations.filter((r) => r.status === 'paid').length,
      rejected: reservations.filter((r) => r.status === 'rejected').length,
      cancelled: reservations.filter((r) => r.status === 'cancelled').length,
    };

    // Awaiting payment (approved but not paid)
    const awaitingPayment = reservations
      .filter((r) => r.status === 'approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((r) => ({
        id: r.id,
        name: `${r.firstName} ${r.lastName}`,
        email: r.email,
        status: r.status,
        total: r.total,
        depositAmount: r.depositAmount,
        createdAt: r.createdAt,
        arrivalDate: r.arrivalDate,
        stripePaymentLinkUrl: r.stripePaymentLinkUrl,
      }));

    // Recent paid reservations
    const recentPaid = reservations
      .filter((r) => r.status === 'paid')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        name: `${r.firstName} ${r.lastName}`,
        status: r.status,
        total: r.total,
        depositAmount: r.depositAmount,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        arrivalDate: r.arrivalDate,
      }));

    // Pending reservations (need action)
    const pendingReservations = reservations
      .filter((r) => r.status === 'pending')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // oldest first
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        name: `${r.firstName} ${r.lastName}`,
        status: r.status,
        total: r.total,
        createdAt: r.createdAt,
        arrivalDate: r.arrivalDate,
      }));

    return NextResponse.json({
      emails: successEmails,
      failedEmails,
      stats,
      awaitingPayment,
      recentPaid,
      pendingReservations,
      links: {
        vercel: 'https://vercel.com/thonyagps-projects/au-marais',
        vercelAnalytics: 'https://vercel.com/thonyagps-projects/au-marais/analytics',
        resend: 'https://resend.com/emails',
        stripe: 'https://dashboard.stripe.com/payments',
        smoobu: 'https://login.smoobu.com',
      },
    });
  } catch (error) {
    console.error('[Monitoring] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}
