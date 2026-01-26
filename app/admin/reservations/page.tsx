'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container, DevModeBanner } from '@/components/ui';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Users,
  Mail,
  Phone,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { useAdminAuth } from '../AdminAuthContext';
import { AdminLogin } from '../AdminLogin';
import { AdminHeader } from '../AdminHeader';
import type { Reservation } from '@/types/reservation';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-800', icon: Clock },
  approved: { label: 'Approuvée', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  rejected: { label: 'Refusée', color: 'bg-red-100 text-red-800', icon: XCircle },
  paid: { label: 'Payée', color: 'bg-green-100 text-green-800', icon: CreditCard },
  cancelled: { label: 'Annulée', color: 'bg-stone-100 text-stone-600', icon: XCircle },
};

export default function AdminReservationsPage() {
  const { isAuthenticated, isLoading, token } = useAdminAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadReservations = useCallback(async () => {
    if (!token) return;
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/reservations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadReservations();
    }
  }, [isAuthenticated, token, loadReservations]);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'mark_paid', extraData?: Record<string, unknown>) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ action, ...extraData }),
      });

      if (response.ok) {
        loadReservations();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filteredReservations = statusFilter === 'all'
    ? reservations
    : reservations.filter((r) => r.status === statusFilter);

  const sortedReservations = [...filteredReservations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
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
    return <AdminLogin title="Réservations" subtitle="Au Marais - Administration" />;
  }

  return (
    <div className="min-h-screen bg-cream">
      <DevModeBanner />
      <AdminHeader />

      <div className="py-8">
        <Container size="lg">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-gold" />
              <div>
                <h1 className="font-serif text-2xl text-text">Réservations</h1>
                <p className="text-text-muted text-sm">
                  {reservations.length} demande{reservations.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => loadReservations()}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-text-muted hover:text-text hover:bg-cream transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-stone-200">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm text-text-muted">Filtrer par statut :</span>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'pending', 'approved', 'paid', 'rejected', 'cancelled'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-gold text-white'
                        : 'bg-cream text-text-muted hover:bg-stone-200'
                    }`}
                  >
                    {status === 'all' ? 'Toutes' : statusConfig[status].label}
                    {status !== 'all' && (
                      <span className="ml-1.5 opacity-70">
                        ({reservations.filter((r) => r.status === status).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reservations List */}
          {sortedReservations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-stone-200">
              <Calendar className="h-12 w-12 text-stone-300 mx-auto mb-4" />
              <p className="text-text-muted">Aucune réservation trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onAction={handleAction}
                  formatDate={formatDate}
                  formatDateTime={formatDateTime}
                />
              ))}
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}

interface ReservationCardProps {
  reservation: Reservation;
  onAction: (id: string, action: 'approve' | 'reject' | 'mark_paid', extraData?: Record<string, unknown>) => Promise<void>;
  formatDate: (date: string) => string;
  formatDateTime: (date: string) => string;
}

function ReservationCard({ reservation, onAction, formatDate, formatDateTime }: ReservationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [depositAmount, setDepositAmount] = useState(Math.round(reservation.total * 0.3));
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const status = statusConfig[reservation.status];
  const StatusIcon = status.icon;

  const handleActionClick = async (action: 'approve' | 'reject' | 'mark_paid') => {
    setActionLoading(action);
    const extraData: Record<string, unknown> = {};
    if (action === 'approve') extraData.depositAmount = depositAmount;
    if (action === 'reject') extraData.rejectionReason = rejectionReason;
    await onAction(reservation.id, action, extraData);
    setActionLoading(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-stone-200">
      {/* Header - Always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-cream/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${status.color}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </div>
            <div>
              <p className="font-medium text-text">
                {reservation.firstName} {reservation.lastName}
              </p>
              <p className="text-sm text-text-muted">
                {formatDate(reservation.arrivalDate)} → {formatDate(reservation.departureDate)}
                <span className="mx-2">•</span>
                {reservation.nights} nuit{reservation.nights > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-text">{reservation.total}€</p>
              <p className="text-xs text-text-muted">
                Reçue {formatDateTime(reservation.createdAt)}
              </p>
            </div>
            <Link
              href={`/admin/reservations/${reservation.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gold hover:text-gold-dark hover:bg-gold/10 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
              Détails
            </Link>
            <ChevronDown
              className={`h-5 w-5 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-stone-200 p-4 bg-cream/30">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="font-medium text-text text-sm uppercase tracking-wide">Contact</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-text-muted" />
                  <a href={`mailto:${reservation.email}`} className="text-gold hover:text-gold-dark hover:underline">
                    {reservation.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-text-muted" />
                  <a href={`tel:${reservation.phone}`} className="text-gold hover:text-gold-dark hover:underline">
                    {reservation.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-text">
                  <Users className="h-4 w-4 text-text-muted" />
                  <span>{reservation.guests} voyageur{reservation.guests > 1 ? 's' : ''}</span>
                </div>
              </div>
              {reservation.message && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-stone-200">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-text-muted mt-0.5" />
                    <p className="text-sm text-text-muted">{reservation.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-text text-sm uppercase tracking-wide">Tarification</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">{reservation.nightlyRate}€ x {reservation.nights} nuits</span>
                  <span className="text-text">{reservation.subtotal}€</span>
                </div>
                {reservation.discount && reservation.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction longue durée</span>
                    <span>-{reservation.discount}€</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted">Frais de ménage</span>
                  <span className="text-text">{reservation.cleaningFee}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Taxe de séjour</span>
                  <span className="text-text">{reservation.touristTax}€</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-stone-200">
                  <span className="text-text">Total</span>
                  <span className="text-gold">{reservation.total}€</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-stone-200">
            {reservation.status === 'pending' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Montant acompte (€)
                    </label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Motif de refus (optionnel)
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Dates non disponibles..."
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleActionClick('approve')}
                    disabled={actionLoading !== null}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {actionLoading === 'approve' ? 'Validation...' : 'Valider et envoyer lien paiement'}
                  </button>
                  <button
                    onClick={() => handleActionClick('reject')}
                    disabled={actionLoading !== null}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    {actionLoading === 'reject' ? 'Refus...' : 'Refuser'}
                  </button>
                </div>
              </div>
            )}

            {reservation.status === 'approved' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-800">En attente du paiement</p>
                    <p className="text-xs text-blue-600">Acompte: {reservation.depositAmount}€</p>
                  </div>
                  {reservation.stripePaymentLinkUrl && (
                    <a
                      href={reservation.stripePaymentLinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Lien Stripe
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleActionClick('mark_paid')}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4" />
                  {actionLoading === 'mark_paid' ? 'Confirmation...' : 'Marquer comme payée manuellement'}
                </button>
              </div>
            )}

            {reservation.status === 'paid' && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Réservation confirmée</p>
                    <p className="text-xs text-green-600">
                      Acompte de {reservation.depositAmount}€ reçu
                      {reservation.smoobuReservationId && ' • Dates bloquées sur Smoobu'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {reservation.status === 'rejected' && reservation.rejectionReason && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <span className="font-medium">Motif :</span> {reservation.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
