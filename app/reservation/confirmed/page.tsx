'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Loader2, AlertCircle, Home, Calendar, Mail, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface ReservationData {
  id: string;
  firstName: string;
  arrivalDate: string;
  departureDate: string;
  nights: number;
  guests: number;
  total: number;
  depositAmount: number;
  depositPaid: boolean;
  status: string;
}

function PaymentConfirmedContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const legacyId = searchParams.get('id'); // Support old links temporarily

  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservation = async () => {
      // No token and no legacy ID = invalid access
      if (!token && !legacyId) {
        setError('invalid');
        setLoading(false);
        return;
      }

      try {
        let res;
        if (token) {
          // Secure access via confirmation token
          res = await fetch(`/api/reservations/by-confirmation-token?token=${encodeURIComponent(token)}`);
        } else if (legacyId) {
          // Legacy access (will fail with 401 but show generic success)
          res = await fetch(`/api/reservations/${legacyId}`);
        }

        if (res && res.ok) {
          const data = await res.json();
          setReservation(data);
        } else if (res && res.status === 404) {
          setError('not_found');
        } else if (res && res.status === 401 && legacyId) {
          // Legacy link without proper auth - show generic success
          setReservation(null);
        } else {
          setError('invalid');
        }
      } catch {
        // Network error - show generic success
        setReservation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [token, legacyId]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  // Invalid or expired token
  if (error === 'invalid' || error === 'not_found') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden border border-red-500/20">
            <div className="pt-12 pb-6 text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-500/30">
                <ShieldAlert className="h-10 w-10 text-red-500" />
              </div>
              <h1 className="text-3xl font-serif text-white mb-2">
                Lien invalide
              </h1>
              <p className="text-gray-400">
                Ce lien de confirmation n&apos;est pas valide ou a expiré.
              </p>
            </div>

            <div className="px-8 pb-8 space-y-6">
              <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm">
                <p>
                  Si vous avez effectué un paiement et que vous voyez ce message,
                  ne vous inquiétez pas. Votre paiement a été enregistré.
                  Vous recevrez un email de confirmation.
                </p>
              </div>

              <div className="bg-[#0A0A0A] rounded-xl p-4 text-center text-gray-400 text-sm">
                <p>Besoin d&apos;aide ? Contactez-nous via WhatsApp.</p>
              </div>

              <Link
                href="/fr"
                className="flex items-center justify-center gap-2 w-full bg-[#D4AF37] text-[#0A0A0A] py-4 rounded-xl font-medium hover:bg-[#C9A962] transition-colors"
              >
                <Home className="h-5 w-5" />
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden border border-[#D4AF37]/20">
          {/* Success Icon */}
          <div className="pt-12 pb-6 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/30">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-serif text-white mb-2">
              Paiement confirmé !
            </h1>
            <p className="text-gray-400">
              Merci pour votre confiance
            </p>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 space-y-6">
            {/* Main message */}
            <div className="bg-[#0A0A0A] rounded-xl p-6 text-center">
              <p className="text-gray-300 leading-relaxed">
                Votre caution a bien été reçue. Votre réservation est maintenant <strong className="text-[#D4AF37]">complète</strong>.
              </p>
            </div>

            {/* Reservation details if available */}
            {reservation && (
              <div className="bg-[#0A0A0A] rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Récapitulatif
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="h-5 w-5 text-[#D4AF37]" />
                    <div>
                      <p className="text-sm text-gray-500">Arrivée</p>
                      <p>{formatDate(reservation.arrivalDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="h-5 w-5 text-[#D4AF37]" />
                    <div>
                      <p className="text-sm text-gray-500">Départ</p>
                      <p>{formatDate(reservation.departureDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next steps */}
            <div className="bg-[#D4AF37]/10 rounded-xl p-6 border border-[#D4AF37]/20">
              <h2 className="text-[#D4AF37] font-medium mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Prochaines étapes
              </h2>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Un email de confirmation vous a été envoyé</li>
                <li>• Les informations d&apos;accès vous seront communiquées quelques jours avant votre arrivée</li>
                <li>• La caution vous sera restituée après votre séjour</li>
              </ul>
            </div>

            {/* Warning if no details available */}
            {!reservation && !error && (
              <div className="bg-yellow-500/10 text-yellow-400 p-4 rounded-xl text-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p>
                  Si vous n&apos;avez pas reçu d&apos;email de confirmation, veuillez nous contacter.
                </p>
              </div>
            )}

            {/* Back to home */}
            <Link
              href="/fr"
              className="flex items-center justify-center gap-2 w-full bg-[#D4AF37] text-[#0A0A0A] py-4 rounded-xl font-medium hover:bg-[#C9A962] transition-colors"
            >
              <Home className="h-5 w-5" />
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-gray-600 text-sm mt-8">
          Au Marais — Paris 4ème
        </p>
      </div>
    </div>
  );
}

export default function PaymentConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        </div>
      }
    >
      <PaymentConfirmedContent />
    </Suspense>
  );
}
