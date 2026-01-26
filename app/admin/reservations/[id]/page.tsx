'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
  Edit3,
  Save,
  X,
} from 'lucide-react';
import Link from 'next/link';
import type { Reservation } from '@/types/reservation';
import { DevModeBanner } from '@/components/ui';
import { useAdminAuth } from '../../AdminAuthContext';

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
  const id = params.id as string;
  const urlToken = searchParams.get('token');

  // Use shared auth context
  const { isAuthenticated, isLoading: authLoading, token: authToken, login: contextLogin } = useAdminAuth();

  const [accessMode, setAccessMode] = useState<AccessMode>('loading');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Editable pricing fields
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [editedNightlyRate, setEditedNightlyRate] = useState(0);
  const [editedCleaningFee, setEditedCleaningFee] = useState(0);
  const [editedTouristTax, setEditedTouristTax] = useState(0);
  const [editedDiscount, setEditedDiscount] = useState(0);
  const [useCustomTotal, setUseCustomTotal] = useState(false);
  const [customTotal, setCustomTotal] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);

  // Admin notes and messages
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalMessage, setApprovalMessage] = useState('');

  // Initialize editable fields when reservation loads
  useEffect(() => {
    if (reservation) {
      setEditedNightlyRate(reservation.nightlyRate);
      setEditedCleaningFee(reservation.cleaningFee);
      setEditedTouristTax(reservation.touristTax);
      setEditedDiscount(reservation.discount || 0);
      setDepositAmount(reservation.depositAmount || Math.round(reservation.total * 0.3));
      setCustomTotal(reservation.total);
      setAdminNotes(reservation.adminNotes || '');
    }
  }, [reservation]);

  // Calculate total based on edited values
  const calculatedTotal = (editedNightlyRate * (reservation?.nights || 0)) - editedDiscount + editedCleaningFee + editedTouristTax;
  const displayTotal = useCustomTotal ? customTotal : calculatedTotal;

  // Check access mode and load reservation
  useEffect(() => {
    // Wait for auth context to finish loading
    if (authLoading) return;

    const checkAccess = async () => {
      // First try URL token-based access (for quick action links)
      if (urlToken) {
        try {
          const res = await fetch(`/api/reservations/${id}?token=${urlToken}`);
          if (res.ok) {
            const data = await res.json();
            setReservation(data);
            setAccessMode('token');
            return;
          }
        } catch {
          // Token invalid, try other methods
        }
      }

      // Then try context-based auth (shared session)
      if (isAuthenticated && authToken) {
        try {
          const res = await fetch(`/api/reservations/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            setReservation(data);
            setAccessMode('authenticated');
            return;
          }
        } catch {
          // Auth failed
        }
      }

      // No valid access method
      if (urlToken) {
        setError('Lien invalide ou expiré');
      }
      setAccessMode('login_required');
    };

    checkAccess();
  }, [id, urlToken, authLoading, isAuthenticated, authToken]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const result = await contextLogin(password);

      if (result.success) {
        // Context will update isAuthenticated, which triggers the useEffect to load reservation
        // No need to manually load here - the effect will handle it
      } else {
        setLoginError(result.error || 'Mot de passe incorrect');
      }
    } catch {
      setLoginError('Erreur de connexion');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSavePricing = async () => {
    setActionLoading('save_pricing');
    setError('');
    setSuccessMessage('');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let url = `/api/reservations/${id}`;

      if (accessMode === 'token' && urlToken) {
        url += `?token=${urlToken}`;
      } else if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const body: Record<string, unknown> = {
        nightlyRate: editedNightlyRate,
        cleaningFee: editedCleaningFee,
        touristTax: editedTouristTax,
        discount: editedDiscount,
        depositAmount,
        adminNotes,
      };

      if (useCustomTotal) {
        body.total = customTotal;
      }

      const res = await fetch(url, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setReservation(data);
        setIsEditingPricing(false);
        setSuccessMessage('Tarification mise à jour');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Erreur lors de la sauvegarde');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = useCallback(async (action: 'approve' | 'reject' | 'mark_paid' | 'resend_payment') => {
    setActionLoading(action);
    setError('');
    setSuccessMessage('');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let url = `/api/reservations/${id}`;

      if (accessMode === 'token' && urlToken) {
        url += `?token=${urlToken}`;
      } else if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const body: Record<string, unknown> = { action };
      if (action === 'approve') {
        body.depositAmount = depositAmount;
        body.adminNotes = adminNotes || approvalMessage || 'Réservation approuvée';
        // Save any pricing changes before approving
        body.nightlyRate = editedNightlyRate;
        body.cleaningFee = editedCleaningFee;
        body.touristTax = editedTouristTax;
        body.discount = editedDiscount;
        if (useCustomTotal) {
          body.total = customTotal;
        }
      }
      if (action === 'reject') {
        body.rejectionReason = rejectionReason || 'Les dates demandées ne sont plus disponibles.';
        body.adminNotes = adminNotes || rejectionReason;
      }
      if (action === 'mark_paid') {
        body.adminNotes = adminNotes || 'Paiement confirmé manuellement';
      }

      const res = await fetch(url, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setReservation(data.reservation);
        const messages: Record<string, string> = {
          approve: 'Réservation approuvée ! Email envoyé au client.',
          reject: 'Réservation refusée. Email envoyé au client.',
          mark_paid: 'Réservation marquée comme payée.',
          resend_payment: 'Lien de paiement renvoyé par email.',
        };
        setSuccessMessage(messages[action]);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Erreur lors de l\'action');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setActionLoading(null);
    }
  }, [id, urlToken, authToken, accessMode, depositAmount, adminNotes, rejectionReason, approvalMessage, editedNightlyRate, editedCleaningFee, editedTouristTax, editedDiscount, useCustomTotal, customTotal]);

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
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <DevModeBanner />
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  // Login required
  if (accessMode === 'login_required') {
    return (
      <div className="min-h-screen bg-cream">
        <DevModeBanner />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md border border-stone-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
                <Lock className="h-8 w-8 text-gold" />
              </div>
              <h1 className="font-serif text-2xl text-text">Accès réservation</h1>
              <p className="text-text-muted text-sm mt-2">Au Marais - Administration</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
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
      </div>
    );
  }

  // No reservation found
  if (!reservation) {
    return (
      <div className="min-h-screen bg-cream">
        <DevModeBanner />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center border border-stone-200">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-serif text-text mb-2">Réservation non trouvée</h1>
            <p className="text-text-muted mb-6">Cette réservation n&apos;existe pas ou a été supprimée.</p>
            <Link href="/admin/reservations" className="text-gold hover:underline">
              Voir toutes les réservations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = statusConfig[reservation.status];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-cream">
      <DevModeBanner />

      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/reservations"
              className="flex items-center gap-2 text-text-muted hover:text-text transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Retour aux réservations</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="font-serif text-xl text-text">Au <span className="text-gold">Marais</span></span>
              {accessMode === 'token' && (
                <span className="text-xs text-text-muted bg-stone-100 px-2 py-1 rounded">
                  Accès sécurisé
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-stone-200">
          {/* Status Header */}
          <div className={`p-6 ${
            reservation.status === 'paid' ? 'bg-green-600' :
            reservation.status === 'rejected' ? 'bg-red-600' :
            reservation.status === 'approved' ? 'bg-blue-600' :
            'bg-gold'
          }`}>
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

          <div className="p-6 space-y-8">
            {/* Stay Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="font-medium text-text text-sm uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gold" />
                  Séjour
                </h2>
                <div className="bg-cream rounded-lg p-4 space-y-3 border border-stone-200">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Arrivée</span>
                    <span className="font-medium text-text">{formatDate(reservation.arrivalDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Départ</span>
                    <span className="font-medium text-text">{formatDate(reservation.departureDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Durée</span>
                    <span className="font-medium text-text">{reservation.nights} nuit{reservation.nights > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Voyageurs</span>
                    <span className="font-medium text-text">{reservation.guests} personne{reservation.guests > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-medium text-text text-sm uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4 text-gold" />
                  Contact
                </h2>
                <div className="bg-cream rounded-lg p-4 space-y-3 border border-stone-200">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-text-muted" />
                    <a href={`mailto:${reservation.email}`} className="text-gold hover:underline">
                      {reservation.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-text-muted" />
                    <a href={`tel:${reservation.phone}`} className="text-gold hover:underline">
                      {reservation.phone}
                    </a>
                  </div>
                  <p className="text-xs text-text-muted pt-2 border-t border-stone-200">
                    Demande reçue le {formatDateTime(reservation.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Message */}
            {reservation.message && (
              <div className="space-y-2">
                <h2 className="font-medium text-text text-sm uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gold" />
                  Message du client
                </h2>
                <div className="bg-cream rounded-lg p-4 border border-stone-200">
                  <p className="text-text italic">&ldquo;{reservation.message}&rdquo;</p>
                </div>
              </div>
            )}

            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-text text-sm uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gold" />
                  Tarification
                </h2>
                {reservation.status === 'pending' && !isEditingPricing && (
                  <button
                    onClick={() => setIsEditingPricing(true)}
                    className="flex items-center gap-1 text-sm text-gold hover:text-gold-dark transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Modifier
                  </button>
                )}
                {isEditingPricing && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsEditingPricing(false);
                        // Reset to original values
                        setEditedNightlyRate(reservation.nightlyRate);
                        setEditedCleaningFee(reservation.cleaningFee);
                        setEditedTouristTax(reservation.touristTax);
                        setEditedDiscount(reservation.discount || 0);
                        setUseCustomTotal(false);
                      }}
                      className="flex items-center gap-1 text-sm text-text-muted hover:text-text transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Annuler
                    </button>
                    <button
                      onClick={handleSavePricing}
                      disabled={actionLoading === 'save_pricing'}
                      className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'save_pricing' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Sauvegarder
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-cream rounded-lg p-4 border border-stone-200">
                {isEditingPricing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">
                          Prix par nuit (€)
                        </label>
                        <input
                          type="number"
                          value={editedNightlyRate}
                          onChange={(e) => setEditedNightlyRate(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">
                          Réduction (€)
                        </label>
                        <input
                          type="number"
                          value={editedDiscount}
                          onChange={(e) => setEditedDiscount(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">
                          Frais de ménage (€)
                        </label>
                        <input
                          type="number"
                          value={editedCleaningFee}
                          onChange={(e) => setEditedCleaningFee(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">
                          Taxe de séjour (€)
                        </label>
                        <input
                          type="number"
                          value={editedTouristTax}
                          onChange={(e) => setEditedTouristTax(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                          min={0}
                          step={0.01}
                        />
                      </div>
                    </div>

                    <div className="border-t border-stone-200 pt-4">
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          id="useCustomTotal"
                          checked={useCustomTotal}
                          onChange={(e) => setUseCustomTotal(e.target.checked)}
                          className="rounded border-stone-300 text-gold focus:ring-gold"
                        />
                        <label htmlFor="useCustomTotal" className="text-sm text-text">
                          Utiliser un prix total personnalisé
                        </label>
                      </div>

                      {useCustomTotal ? (
                        <div>
                          <label className="block text-xs font-medium text-text-muted mb-1">
                            Prix total personnalisé (€)
                          </label>
                          <input
                            type="number"
                            value={customTotal}
                            onChange={(e) => setCustomTotal(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                            min={0}
                          />
                        </div>
                      ) : (
                        <div className="text-sm text-text-muted">
                          Total calculé : <span className="font-semibold text-gold">{calculatedTotal.toFixed(2)}€</span>
                          <span className="text-xs ml-2">
                            ({editedNightlyRate}€ × {reservation.nights} nuits - {editedDiscount}€ + {editedCleaningFee}€ + {editedTouristTax}€)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">{reservation.nightlyRate}€ × {reservation.nights} nuits</span>
                      <span className="text-text">{reservation.subtotal}€</span>
                    </div>
                    {reservation.discount && reservation.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Réduction</span>
                        <span>-{reservation.discount}€</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Frais de ménage</span>
                      <span className="text-text">{reservation.cleaningFee}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Taxe de séjour</span>
                      <span className="text-text">{reservation.touristTax}€</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-stone-200 text-lg">
                      <span className="text-text">Total</span>
                      <span className="text-gold">{reservation.total}€</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Deposit Amount */}
            {(reservation.status === 'pending' || reservation.status === 'approved') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text">
                  Montant de l&apos;acompte (€)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-40 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                    min={0}
                    step={10}
                  />
                  <span className="text-sm text-text-muted">
                    Suggestion : {Math.round((useCustomTotal ? customTotal : calculatedTotal) * 0.3)}€ (~30%)
                  </span>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">
                Notes administrateur
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Notes internes (non visibles par le client)..."
                rows={3}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-gold focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="border-t border-stone-200 pt-6">
              {reservation.status === 'pending' && (
                <div className="space-y-6">
                  {/* Approval Section */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="font-medium text-green-800 mb-3">Valider la réservation</h3>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-green-700 mb-1">
                        Message personnalisé (optionnel)
                      </label>
                      <input
                        type="text"
                        value={approvalMessage}
                        onChange={(e) => setApprovalMessage(e.target.value)}
                        placeholder="Ex: Nous avons hâte de vous accueillir !"
                        className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading !== null}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {actionLoading === 'approve' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      )}
                      Valider et envoyer le lien de paiement ({depositAmount}€)
                    </button>
                  </div>

                  {/* Rejection Section */}
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h3 className="font-medium text-red-800 mb-3">Refuser la réservation</h3>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-red-700 mb-1">
                        Motif du refus
                      </label>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Ex: Les dates demandées ne sont plus disponibles."
                        className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading !== null}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {actionLoading === 'reject' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                      Refuser la réservation
                    </button>
                  </div>
                </div>
              )}

              {reservation.status === 'approved' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-800">En attente du paiement</p>
                        <p className="text-sm text-blue-600">Acompte demandé : {reservation.depositAmount}€</p>
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
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Réservation confirmée</p>
                      <p className="text-sm text-green-600">
                        Acompte de {reservation.depositAmount}€ reçu
                        {reservation.smoobuReservationId && ' • Dates bloquées sur Smoobu'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {reservation.status === 'rejected' && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-6 w-6 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">Réservation refusée</p>
                      {reservation.rejectionReason && (
                        <p className="text-sm text-red-600">Motif : {reservation.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Technical Info */}
            {(reservation.smoobuReservationId || reservation.stripePaymentIntentId) && (
              <div className="text-xs text-text-muted pt-4 border-t border-stone-200 space-y-1">
                {reservation.smoobuReservationId && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-3 w-3" />
                    Smoobu ID: {reservation.smoobuReservationId}
                  </div>
                )}
                {reservation.stripePaymentIntentId && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3" />
                    Stripe: {reservation.stripePaymentIntentId}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
