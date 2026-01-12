'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import type { Reservation } from '@/types/reservation';

export default function ApprovePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const token = searchParams.get('token');

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const res = await fetch(`/api/reservations/${id}?token=${token}`);
        if (!res.ok) {
          throw new Error('Reservation not found or invalid token');
        }
        const data = await res.json();
        setReservation(data);
        setDepositAmount(data.depositAmount);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reservation');
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchReservation();
    } else {
      setError('Missing reservation ID or token');
      setLoading(false);
    }
  }, [id, token]);

  const handleApprove = async () => {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/reservations/${id}?token=${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          depositAmount,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to approve reservation');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (error && !reservation) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-text mb-2">Erreur</h1>
          <p className="text-text-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-text mb-2">Réservation validée !</h1>
          <p className="text-text-muted mb-4">
            Les dates ont été bloquées dans Smoobu et un email avec le lien de paiement
            a été envoyé au client.
          </p>
          <button
            onClick={() => router.push('/admin/reservations')}
            className="text-gold hover:underline"
          >
            Voir toutes les réservations
          </button>
        </div>
      </div>
    );
  }

  if (!reservation) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gold p-6 text-white">
            <h1 className="text-2xl font-serif">Valider la réservation</h1>
            <p className="text-white/80 text-sm mt-1">Vérifiez les détails avant de confirmer</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Client info */}
            <div>
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
                Client
              </h2>
              <p className="text-lg font-medium text-text">
                {reservation.firstName} {reservation.lastName}
              </p>
              <p className="text-text-muted">{reservation.email}</p>
              <p className="text-text-muted">{reservation.phone}</p>
            </div>

            {/* Stay details */}
            <div className="bg-cream-dark rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-text-muted">Dates</span>
                <span className="font-medium text-text">
                  {formatDate(reservation.arrivalDate)} → {formatDate(reservation.departureDate)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-text-muted">Durée</span>
                <span className="font-medium text-text">{reservation.nights} nuits</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-text-muted">Voyageurs</span>
                <span className="font-medium text-text">{reservation.guests} personnes</span>
              </div>
              <div className="border-t border-stone-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-text font-medium">Total</span>
                  <span className="text-xl font-bold text-gold">{reservation.total}€</span>
                </div>
              </div>
            </div>

            {/* Deposit amount */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Montant de la caution
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="flex-1 px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-gold"
                  min={0}
                  step={10}
                />
                <span className="text-text-muted">€</span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Suggestion: {reservation.depositAmount}€ (~30% du total)
              </p>
            </div>

            {/* Message if any */}
            {reservation.message && (
              <div>
                <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-2">
                  Message du client
                </h2>
                <p className="text-text bg-stone-50 p-3 rounded-lg italic">
                  &ldquo;{reservation.message}&rdquo;
                </p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Check className="h-5 w-5" />
                )}
                Valider la réservation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
