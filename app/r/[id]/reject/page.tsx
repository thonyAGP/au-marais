'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { X, Loader2, AlertCircle } from 'lucide-react';
import type { Reservation } from '@/types/reservation';

const REJECTION_REASONS = [
  { value: '', label: 'Sélectionner une raison...' },
  { value: 'dates_unavailable', label: 'Les dates ne sont plus disponibles' },
  { value: 'minimum_stay', label: 'Durée de séjour minimum non atteinte' },
  { value: 'max_guests', label: 'Nombre de voyageurs trop élevé' },
  { value: 'custom', label: 'Autre raison (personnalisée)' },
];

const REJECTION_MESSAGES: Record<string, string> = {
  dates_unavailable: 'Nous sommes désolés, les dates demandées ne sont malheureusement plus disponibles. N\'hésitez pas à consulter notre calendrier pour d\'autres dates.',
  minimum_stay: 'Nous sommes désolés, nous ne pouvons pas accepter cette réservation car elle ne respecte pas notre durée de séjour minimum.',
  max_guests: 'Nous sommes désolés, notre appartement ne peut pas accueillir autant de voyageurs. La capacité maximale est de 4 personnes.',
};

export default function RejectPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const token = searchParams.get('token');

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [reasonType, setReasonType] = useState('');
  const [customMessage, setCustomMessage] = useState('');
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

  const handleReject = async () => {
    if (!reasonType) {
      setError('Veuillez sélectionner une raison');
      return;
    }

    setSubmitting(true);
    setError('');

    const rejectionReason = reasonType === 'custom'
      ? customMessage
      : REJECTION_MESSAGES[reasonType];

    try {
      const res = await fetch(`/api/reservations/${id}?token=${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to reject reservation');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
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
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-stone-600" />
          </div>
          <h1 className="text-xl font-semibold text-text mb-2">Réservation refusée</h1>
          <p className="text-text-muted mb-4">
            Un email a été envoyé au client pour l&apos;informer.
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
          <div className="bg-stone-700 p-6 text-white">
            <h1 className="text-2xl font-serif">Refuser la réservation</h1>
            <p className="text-white/80 text-sm mt-1">Le client sera notifié par email</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Client info */}
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="font-medium text-text">
                {reservation.firstName} {reservation.lastName}
              </p>
              <p className="text-sm text-text-muted">
                {formatDate(reservation.arrivalDate)} → {formatDate(reservation.departureDate)} ({reservation.nights} nuits)
              </p>
            </div>

            {/* Reason selection */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Raison du refus
              </label>
              <select
                value={reasonType}
                onChange={(e) => setReasonType(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-gold bg-white"
              >
                {REJECTION_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom message */}
            {reasonType === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Message personnalisé
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-gold h-32"
                  placeholder="Expliquez la raison du refus au client..."
                />
              </div>
            )}

            {/* Preview message */}
            {reasonType && reasonType !== 'custom' && (
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Message envoyé au client
                </label>
                <p className="text-text bg-stone-50 p-3 rounded-lg text-sm">
                  {REJECTION_MESSAGES[reasonType]}
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
                onClick={() => router.back()}
                className="flex-1 border border-stone-300 text-text py-3 rounded-lg font-medium hover:bg-stone-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={submitting || !reasonType}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <X className="h-5 w-5" />
                )}
                Refuser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
