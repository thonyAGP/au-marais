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

// Fetch emails from Resend API
const fetchResendEmails = async (limit: number = 20): Promise<ResendEmail[]> => {
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
    const [emails, reservationsData] = await Promise.all([
      fetchResendEmails(30),
      listReservations({ limit: 100 }),
    ]);

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

    // Recent reservations (last 5)
    const recentReservations = reservations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
      emails,
      stats,
      recentReservations,
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
