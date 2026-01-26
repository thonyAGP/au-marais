'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container, DevModeBanner } from '@/components/ui';
import {
  Activity,
  Mail,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  BarChart3,
  Send,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Hourglass,
} from 'lucide-react';
import Link from 'next/link';
import { useAdminAuth } from '../AdminAuthContext';
import { AdminLogin } from '../AdminLogin';
import { AdminHeader } from '../AdminHeader';

interface ResendEmail {
  id: string;
  to: string[];
  from: string;
  subject: string;
  created_at: string;
  last_event: string;
}

interface ReservationSummary {
  id: string;
  name: string;
  email?: string;
  status: string;
  total: number;
  depositAmount?: number;
  createdAt: string;
  updatedAt?: string;
  arrivalDate: string;
  stripePaymentLinkUrl?: string;
}

interface MonitoringData {
  emails: ResendEmail[];
  failedEmails: ResendEmail[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    paid: number;
    rejected: number;
    cancelled: number;
  };
  awaitingPayment: ReservationSummary[];
  recentPaid: ReservationSummary[];
  pendingReservations: ReservationSummary[];
  links: {
    vercel: string;
    vercelAnalytics: string;
    resend: string;
    stripe: string;
    smoobu: string;
  };
}

const eventStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  delivered: { label: 'Livré', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  sent: { label: 'Envoyé', color: 'text-blue-600 bg-blue-50', icon: Send },
  opened: { label: 'Ouvert', color: 'text-purple-600 bg-purple-50', icon: Mail },
  clicked: { label: 'Cliqué', color: 'text-indigo-600 bg-indigo-50', icon: ExternalLink },
  bounced: { label: 'Rebond', color: 'text-red-600 bg-red-50', icon: XCircle },
  complained: { label: 'Spam', color: 'text-orange-600 bg-orange-50', icon: XCircle },
  delivery_delayed: { label: 'Retardé', color: 'text-amber-600 bg-amber-50', icon: Clock },
};

export default function AdminMonitoringPage() {
  const { isAuthenticated, isLoading, token } = useAdminAuth();
  const [data, setData] = useState<MonitoringData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/monitoring', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        setError('Erreur lors du chargement des données');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadData();
    }
  }, [isAuthenticated, token, loadData]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <DevModeBanner />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-text-muted">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin title="Monitoring" subtitle="Au Marais - Administration" />;
  }

  const hasAlerts = (data?.failedEmails?.length || 0) > 0 || (data?.stats?.pending || 0) > 0;

  return (
    <div className="min-h-screen bg-cream">
      <DevModeBanner />
      <AdminHeader />

      <div className="py-8">
        <Container size="lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-gold" />
              <div>
                <h1 className="font-serif text-2xl text-text">Monitoring</h1>
                <p className="text-text-muted text-sm">Vue d'ensemble de l'activité</p>
              </div>
            </div>
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-text-muted hover:text-text hover:bg-cream transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
              {error}
            </div>
          )}

          {/* Alerts Section */}
          {hasAlerts && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h2 className="font-medium text-amber-800">Actions requises</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                {(data?.stats?.pending || 0) > 0 && (
                  <Link
                    href="/admin/reservations"
                    className="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{data?.stats.pending}</span> réservation(s) en attente
                  </Link>
                )}
                {(data?.failedEmails?.length || 0) > 0 && (
                  <a
                    href={data?.links.resend || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">{data?.failedEmails.length}</span> email(s) en échec
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-stone-200 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="h-4 w-4 text-gold" />
              <h2 className="font-medium text-text">Accès rapides</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <a
                href={data?.links.vercelAnalytics || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors text-sm"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </a>
              <a
                href={data?.links.resend || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors text-sm"
              >
                <Mail className="h-4 w-4" />
                <span>Resend</span>
              </a>
              <a
                href={data?.links.stripe || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm"
              >
                <CreditCard className="h-4 w-4" />
                <span>Stripe</span>
              </a>
              <a
                href={data?.links.smoobu || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors text-sm"
              >
                <Calendar className="h-4 w-4" />
                <span>Smoobu</span>
              </a>
              <a
                href={data?.links.vercel || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-500 transition-colors text-sm"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Vercel</span>
              </a>
            </div>
          </div>

          {/* Stats Bar */}
          {data?.stats && (
            <div className="grid grid-cols-5 gap-3 mb-6">
              <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
                <div className="text-2xl font-bold text-amber-600">{data.stats.pending}</div>
                <div className="text-xs text-amber-700">En attente</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{data.stats.approved}</div>
                <div className="text-xs text-blue-700">À payer</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                <div className="text-2xl font-bold text-green-600">{data.stats.paid}</div>
                <div className="text-xs text-green-700">Payées</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
                <div className="text-2xl font-bold text-red-600">{data.stats.rejected}</div>
                <div className="text-xs text-red-700">Refusées</div>
              </div>
              <div className="bg-stone-50 rounded-lg p-3 text-center border border-stone-200">
                <div className="text-2xl font-bold text-stone-600">{data.stats.total}</div>
                <div className="text-xs text-stone-600">Total</div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column: Emails */}
            <div className="space-y-6">
              {/* Failed Emails */}
              {data?.failedEmails && data.failedEmails.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4 border border-red-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <h2 className="font-medium text-red-700">Emails en échec</h2>
                    </div>
                    <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                      {data.failedEmails.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {data.failedEmails.map((email) => {
                      const status = eventStatusConfig[email.last_event] || {
                        label: email.last_event,
                        color: 'text-red-600 bg-red-50',
                        icon: XCircle,
                      };
                      const StatusIcon = status.icon;
                      return (
                        <div key={email.id} className="p-2 bg-red-50 rounded-lg text-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-red-800 truncate">{email.subject || '(Sans sujet)'}</p>
                              <p className="text-xs text-red-600 truncate">→ {email.to.join(', ')}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </span>
                          </div>
                          <p className="text-xs text-red-500 mt-1">{formatDate(email.created_at)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Emails */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-gold" />
                    <h2 className="font-medium text-text">Emails récents</h2>
                  </div>
                  <a
                    href={data?.links.resend || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gold hover:text-gold-dark flex items-center gap-1"
                  >
                    Tout voir <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="space-y-2 max-h-[350px] overflow-y-auto">
                  {!data?.emails || data.emails.length === 0 ? (
                    <p className="text-text-muted text-sm text-center py-6">Aucun email récent</p>
                  ) : (
                    data.emails.map((email) => {
                      const status = eventStatusConfig[email.last_event] || {
                        label: email.last_event,
                        color: 'text-stone-600 bg-stone-50',
                        icon: Mail,
                      };
                      const StatusIcon = status.icon;
                      return (
                        <div key={email.id} className="p-2 bg-cream/50 rounded-lg hover:bg-cream transition-colors text-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-text truncate">{email.subject || '(Sans sujet)'}</p>
                              <p className="text-xs text-text-muted truncate">→ {email.to.join(', ')}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mt-1">{formatDate(email.created_at)}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Reservations */}
            <div className="space-y-6">
              {/* Awaiting Payment */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Hourglass className="h-5 w-5 text-blue-500" />
                    <h2 className="font-medium text-blue-700">En attente de paiement</h2>
                  </div>
                  <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                    {data?.awaitingPayment?.length || 0}
                  </span>
                </div>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {!data?.awaitingPayment || data.awaitingPayment.length === 0 ? (
                    <p className="text-text-muted text-sm text-center py-4">Aucune réservation en attente de paiement</p>
                  ) : (
                    data.awaitingPayment.map((reservation) => (
                      <div key={reservation.id} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-text">{reservation.name}</p>
                            <p className="text-xs text-text-muted">
                              {formatShortDate(reservation.arrivalDate)} • Acompte: {reservation.depositAmount}€
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {reservation.stripePaymentLinkUrl && (
                              <a
                                href={reservation.stripePaymentLinkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <CreditCard className="h-3 w-3" />
                                Lien
                              </a>
                            )}
                            <Link
                              href={`/admin/reservations/${reservation.id}`}
                              className="text-xs text-gold hover:text-gold-dark"
                            >
                              Voir
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Paid */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h2 className="font-medium text-green-700">Dernières réservations payées</h2>
                  </div>
                  <Link
                    href="/admin/reservations"
                    className="text-xs text-gold hover:text-gold-dark flex items-center gap-1"
                  >
                    Tout voir <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {!data?.recentPaid || data.recentPaid.length === 0 ? (
                    <p className="text-text-muted text-sm text-center py-4">Aucune réservation payée</p>
                  ) : (
                    data.recentPaid.map((reservation) => (
                      <div key={reservation.id} className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-text">{reservation.name}</p>
                            <p className="text-xs text-text-muted">
                              {formatShortDate(reservation.arrivalDate)} • {reservation.total}€
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-green-600 font-medium">
                              Payé {reservation.depositAmount}€
                            </p>
                            <Link
                              href={`/admin/reservations/${reservation.id}`}
                              className="text-xs text-gold hover:text-gold-dark"
                            >
                              Détails
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
