'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Container } from '@/components/ui';
import {
  Lock,
  Calendar,
  CheckCircle,
  XCircle,
  CreditCard,
  Users,
  Mail,
  Phone,
  MessageSquare,
  ExternalLink,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  RefreshCw,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import type { Reservation } from '@/types/reservation';

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-800', icon: Clock },
  approved: { label: 'Approuvée', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  rejected: { label: 'Refusée', color: 'bg-red-100 text-red-800', icon: XCircle },
  paid: { label: 'Payée', color: 'bg-green-100 text-green-800', icon: CreditCard },
  cancelled: { label: 'Annulée', color: 'bg-stone-100 text-stone-600', icon: XCircle },
};

type AccessMode = 'loading' | 'token' | 'authenticated' | 'login_required';

export default function ReservationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const token = searchParams.get('token');

  const [accessMode, setAccessMode] = useState<AccessMode>('loading');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');

  // Check access mode and load reservation
  useEffect(() => {
    const checkAccess = async () => {
      // First try token-based access
      if (token) {
        try {
          const res = await fetch(`/api/reservations/${id}?token=${token}`);
          if (res.ok) {
            const data = await res.json();
            setReservation(data);
            setDepositAmount(data.depositAmount || Math.round(data.total * 0.3));
            setAccessMode('token');
            return;
          }
        } catch {
          // Token invalid, try other methods
        }
      }

      // Then try session-based auth
      const adminToken = sessionStorage.getItem('adminToken');
      if (adminToken) {
        try {
          const authRes = await fetch('/api/auth', {
            headers: { Authorization: `Bearer ${adminToken}` },
          });
          if (authRes.ok) {
            const res = await fetch(`/api/reservations/${id}`, {
              headers: { Authorization: `Bearer ${adminToken}` },
              credentials: 'include',
            });
            if (res.ok) {
              const data = await res.json();
              setReservation(data);
              setDepositAmount(data.depositAmount || Math.round(data.total * 0.3));
              setAccessMode('authenticated');
              return;
            }
          }
        } catch {
          // Auth failed
        }
      }

      // No valid access method
      if (token) {
        setError('Lien invalide ou expiré');
      }
      setAccessMode('login_required');
    };

    checkAccess();
  }, [id, token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        sessionStorage.setItem('adminToken', data.token);
        document.cookie = `adminToken=${data.token}; path=/; max-age=86400`;

        // Load reservation with new token
        const res = await fetch(`/api/reservations/${id}`, {
          headers: { Authorization: `Bearer ${data.token}` },
          credentials: 'include',
        });

        if (res.ok) {
          const reservationData = await res.json();
          setReservation(reservationData);
          setDepositAmount(reservationData.depositAmount || Math.round(reservationData.total * 0.3));
          setAccessMode('authenticated');
        } else {
          setLoginError('Réservation non trouvée');
        }
      } else {
        setLoginError(data.error || 'Mot de passe incorrect');
      }
    } catch {
      setLoginError('Erreur de connexion');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAction = useCallback(async (action: 'approve' | 'reject' | 'mark_paid' | 'resend_payment') => {
    setActionLoading(action);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let url = `/api/reservations/${id}`;

      // Use token or session auth
      if (accessMode === 'token' && token) {
        url += `?token=${token}`;
      } else {
        const adminToken = sessionStorage.getItem('adminToken');
        if (adminToken) {
          headers['Authorization'] = `Bearer ${adminToken}`;
        }
      }

      const body: Record<string, unknown> = { action };
      if (action === 'approve') body.depositAmount = depositAmount;
      if (action === 'reject') body.rejectionReason = rejectionReason;

      const res = await fetch(url, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setReservation(data.reservation);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Erreur lors de l\'action');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setActionLoading(null);
    }
  }, [id, token, accessMode, depositAmount, rejectionReason]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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

  // Loading state
  if (accessMode === 'loading') {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  // Login required
  if (accessMode === 'login_required') {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
              <Lock className="h-8 w-8 text-gold" />
            </div>
            <h1 className="font-serif text-2xl text-stone-900">Accès réservation</h1>
            <p className="text-stone-500 text-sm mt-2">Au Marais - Administration</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
                Mot de passe administrateur
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                placeholder="Entrez le mot de passe"
                required
              />
            </div>

            {loginError && (
              <p className="text-red-500 text-sm text-center">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full px-4 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50"
            >
              {loginLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // No reservation found
  if (!reservation) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-stone-900 mb-2">Réservation non trouvée</h1>
          <p className="text-stone-500 mb-6">Cette réservation n&apos;existe pas ou a été supprimée.</p>
          <Link href="/admin/reservations" className="text-gold hover:underline">
            Voir toutes les réservations
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[reservation.status];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-stone-100 py-8">
      <Container size="md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/admin/reservations"
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Toutes les réservations
          </Link>
          {accessMode === 'token' && (
            <span className="text-xs text-stone-500 bg-stone-200 px-2 py-1 rounded">
              Accès via lien sécurisé
            </span>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Status Header */}
          <div className={`p-6 ${reservation.status === 'paid' ? 'bg-green-600' : reservation.status === 'rejected' ? 'bg-red-600' : 'bg-gold'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <StatusIcon className="h-6 w-6" />
                <div>
                  <h1 className="text-xl font-serif">{reservation.firstName} {reservation.lastName}</h1>
                  <p className="text-white/80 text-sm">Réservation #{reservation.id.slice(0, 8)}</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${status.color}`}>
                {status.label}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Error display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Stay Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="font-medium text-stone-700 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Séjour
                </h2>
                <div className="bg-stone-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Arrivée</span>
                    <span className="font-medium">{formatDate(reservation.arrivalDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Départ</span>
                    <span className="font-medium">{formatDate(reservation.departureDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Durée</span>
                    <span className="font-medium">{reservation.nights} nuit{reservation.nights > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Voyageurs</span>
                    <span className="font-medium">{reservation.guests} personne{reservation.guests > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-medium text-stone-700 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contact
                </h2>
                <div className="bg-stone-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-stone-400" />
                    <a href={`mailto:${reservation.email}`} className="text-gold hover:underline">
                      {reservation.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-stone-400" />
                    <a href={`tel:${reservation.phone}`} className="text-gold hover:underline">
                      {reservation.phone}
                    </a>
                  </div>
                  <p className="text-xs text-stone-400">
                    Demande reçue le {formatDateTime(reservation.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Message */}
            {reservation.message && (
              <div className="space-y-2">
                <h2 className="font-medium text-stone-700 text-sm uppercase tracking-wide flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Message du client
                </h2>
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-stone-600 italic">&ldquo;{reservation.message}&rdquo;</p>
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="space-y-2">
              <h2 className="font-medium text-stone-700 text-sm uppercase tracking-wide flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Tarification
              </h2>
              <div className="bg-stone-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">{reservation.nightlyRate}€ × {reservation.nights} nuits</span>
                  <span>{reservation.subtotal}€</span>
                </div>
                {reservation.discount && reservation.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction longue durée</span>
                    <span>-{reservation.discount}€</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Frais de ménage</span>
                  <span>{reservation.cleaningFee}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Taxe de séjour</span>
                  <span>{reservation.touristTax}€</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-stone-200 text-lg">
                  <span>Total</span>
                  <span className="text-gold">{reservation.total}€</span>
                </div>
                {reservation.depositAmount > 0 && (
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-stone-500">Caution demandée</span>
                    <span>{reservation.depositAmount}€</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-stone-200 pt-6">
              {reservation.status === 'pending' && (
                <div className="space-y-4">
                  <h2 className="font-medium text-stone-700 text-sm uppercase tracking-wide">Actions</h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1">
                        Montant de la caution (€)
                      </label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                        min={0}
                        step={10}
                      />
                      <p className="text-xs text-stone-400 mt-1">
                        Suggestion: {Math.round(reservation.total * 0.3)}€ (~30%)
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1">
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
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading !== null}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {actionLoading === 'approve' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      )}
                      Valider et envoyer lien paiement
                    </button>
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading !== null}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {actionLoading === 'reject' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                      Refuser
                    </button>
                  </div>
                </div>
              )}

              {reservation.status === 'approved' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-800">En attente du paiement</p>
                        <p className="text-sm text-blue-600">Caution: {reservation.depositAmount}€</p>
                      </div>
                      {reservation.stripePaymentLinkUrl && (
                        <a
                          href={reservation.stripePaymentLinkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Voir lien Stripe
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction('resend_payment')}
                      disabled={actionLoading !== null}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {actionLoading === 'resend_payment' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                      Renvoyer le lien de paiement
                    </button>
                    <button
                      onClick={() => handleAction('mark_paid')}
                      disabled={actionLoading !== null}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50 font-medium"
                    >
                      {actionLoading === 'mark_paid' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <CreditCard className="h-5 w-5" />
                      )}
                      Marquer payée
                    </button>
                  </div>
                </div>
              )}

              {reservation.status === 'paid' && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Réservation confirmée</p>
                      <p className="text-sm text-green-600">
                        Caution de {reservation.depositAmount}€ reçue
                        {reservation.smoobuReservationId && ' • Dates bloquées sur Smoobu'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {reservation.status === 'rejected' && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-6 w-6 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">Réservation refusée</p>
                      {reservation.rejectionReason && (
                        <p className="text-sm text-red-600">Motif: {reservation.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Smoobu Info */}
            {reservation.smoobuReservationId && (
              <div className="text-xs text-stone-400 flex items-center gap-2">
                <RefreshCw className="h-3 w-3" />
                Smoobu ID: {reservation.smoobuReservationId}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
