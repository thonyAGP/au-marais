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
} from 'lucide-react';
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
  status: string;
  total: number;
  createdAt: string;
  arrivalDate: string;
}

interface MonitoringData {
  emails: ResendEmail[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    paid: number;
    rejected: number;
    cancelled: number;
  };
  recentReservations: ReservationSummary[];
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

const reservationStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-amber-500' },
  approved: { label: 'Approuvée', color: 'bg-blue-500' },
  paid: { label: 'Payée', color: 'bg-green-500' },
  rejected: { label: 'Refusée', color: 'bg-red-500' },
  cancelled: { label: 'Annulée', color: 'bg-stone-400' },
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

  return (
    <div className="min-h-screen bg-cream">
      <DevModeBanner />
      <AdminHeader />

      <div className="py-8">
        <Container size="lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
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

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-stone-200 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ExternalLink className="h-5 w-5 text-gold" />
              <h2 className="font-serif text-xl text-text">Accès rapides</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <a
                href={data?.links.vercelAnalytics || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-stone-900 to-stone-700 text-white rounded-lg hover:from-stone-800 hover:to-stone-600 transition-all"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="font-medium">Vercel Analytics</span>
              </a>
              <a
                href={data?.links.resend || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-500 hover:to-purple-500 transition-all"
              >
                <Mail className="h-5 w-5" />
                <span className="font-medium">Resend</span>
              </a>
              <a
                href={data?.links.stripe || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-500 hover:to-blue-500 transition-all"
              >
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Stripe</span>
              </a>
              <a
                href={data?.links.smoobu || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-500 hover:to-emerald-500 transition-all"
              >
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Smoobu</span>
              </a>
              <a
                href={data?.links.vercel || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-stone-600 to-stone-500 text-white rounded-lg hover:from-stone-500 hover:to-stone-400 transition-all"
              >
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Vercel Projet</span>
              </a>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Reservation Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-stone-200">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-gold" />
                <h2 className="font-serif text-xl text-text">Réservations</h2>
              </div>

              {data?.stats && (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-amber-600">{data.stats.pending}</div>
                      <div className="text-xs text-amber-700">En attente</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">{data.stats.approved}</div>
                      <div className="text-xs text-blue-700">Approuvées</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">{data.stats.paid}</div>
                      <div className="text-xs text-green-700">Payées</div>
                    </div>
                  </div>

                  {/* Recent Reservations */}
                  <h3 className="text-sm font-medium text-text-muted mb-3">Dernières demandes</h3>
                  <div className="space-y-2">
                    {data.recentReservations.length === 0 ? (
                      <p className="text-text-muted text-sm text-center py-4">Aucune réservation</p>
                    ) : (
                      data.recentReservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          className="flex items-center justify-between p-3 bg-cream/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                reservationStatusConfig[reservation.status]?.color || 'bg-stone-400'
                              }`}
                            />
                            <div>
                              <p className="text-sm font-medium text-text">{reservation.name}</p>
                              <p className="text-xs text-text-muted">
                                {formatShortDate(reservation.arrivalDate)} • {reservation.total}€
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-text-muted">
                            {formatDate(reservation.createdAt)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Email Logs */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-stone-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gold" />
                  <h2 className="font-serif text-xl text-text">Emails récents</h2>
                </div>
                <a
                  href={data?.links.resend || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gold hover:text-gold-dark flex items-center gap-1"
                >
                  Voir tout <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {!data?.emails || data.emails.length === 0 ? (
                  <p className="text-text-muted text-sm text-center py-8">
                    Aucun email récent ou API non configurée
                  </p>
                ) : (
                  data.emails.map((email) => {
                    const status = eventStatusConfig[email.last_event] || {
                      label: email.last_event,
                      color: 'text-stone-600 bg-stone-50',
                      icon: Mail,
                    };
                    const StatusIcon = status.icon;

                    return (
                      <div
                        key={email.id}
                        className="p-3 bg-cream/50 rounded-lg hover:bg-cream transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text truncate">
                              {email.subject || '(Sans sujet)'}
                            </p>
                            <p className="text-xs text-text-muted truncate">
                              → {email.to.join(', ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${status.color}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                          {formatDate(email.created_at)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
