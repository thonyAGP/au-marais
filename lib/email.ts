import { Resend } from 'resend';
import type { Reservation } from '@/types/reservation';

// Initialize Resend lazily to avoid build errors when API key is not set
let resendInstance: Resend | null = null;

const getResend = (): Resend => {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
};

// Environment detection
const isProduction = process.env.VERCEL_ENV === 'production';

// Email configuration based on environment
// In preview/dev: use Resend test domain (can only send to account owner email)
// In production: use verified domain
const FROM_EMAIL = isProduction
  ? (process.env.EMAIL_FROM || 'Au Marais <reservation@au-marais.fr>')
  : 'Au Marais Test <onboarding@resend.dev>';

const ADMIN_EMAIL = isProduction
  ? (process.env.ADMIN_EMAIL || 'au-marais@hotmail.com')
  : (process.env.ADMIN_EMAIL_TEST || process.env.ADMIN_EMAIL || 'au-marais@hotmail.com');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://au-marais.fr';

// Format date for display
const formatDate = (dateStr: string, locale: string = 'fr'): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

// Email template: Reservation received (to client)
export const sendReservationReceivedEmail = async (reservation: Reservation) => {
  const { locale } = reservation;
  const isFr = locale === 'fr';

  const subject = isFr
    ? 'Votre demande de réservation - Au Marais'
    : 'Your reservation request - Au Marais';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #C9A962; }
        .logo { font-family: Georgia, serif; font-size: 28px; color: #333; }
        .logo span { color: #C9A962; }
        .content { padding: 30px 0; }
        .details { background: #f9f7f4; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .details-row:last-child { border-bottom: none; }
        .total { font-size: 18px; font-weight: bold; color: #C9A962; }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Au <span>Marais</span></div>
        </div>
        <div class="content">
          <h2>${isFr ? 'Bonjour' : 'Hello'} ${reservation.firstName},</h2>
          <p>${isFr
            ? 'Nous avons bien reçu votre demande de réservation. Nous vous répondrons dans les plus brefs délais (généralement sous 24h).'
            : 'We have received your reservation request. We will respond as soon as possible (usually within 24 hours).'
          }</p>

          <div class="details">
            <h3>${isFr ? 'Récapitulatif de votre demande' : 'Your request summary'}</h3>
            <div class="details-row">
              <span>${isFr ? 'Arrivée' : 'Check-in'}</span>
              <strong>${formatDate(reservation.arrivalDate, locale)}</strong>
            </div>
            <div class="details-row">
              <span>${isFr ? 'Départ' : 'Check-out'}</span>
              <strong>${formatDate(reservation.departureDate, locale)}</strong>
            </div>
            <div class="details-row">
              <span>${isFr ? 'Voyageurs' : 'Guests'}</span>
              <strong>${reservation.guests}</strong>
            </div>
            <div class="details-row">
              <span>${isFr ? 'Durée' : 'Duration'}</span>
              <strong>${reservation.nights} ${isFr ? 'nuits' : 'nights'}</strong>
            </div>
            <div class="details-row total">
              <span>${isFr ? 'Total estimé' : 'Estimated total'}</span>
              <strong>${formatCurrency(reservation.total)}</strong>
            </div>
          </div>

          <p>${isFr
            ? 'Si vous avez des questions, n\'hésitez pas à nous contacter via WhatsApp.'
            : 'If you have any questions, feel free to contact us via WhatsApp.'
          }</p>

          <p>${isFr ? 'À bientôt,' : 'See you soon,'}<br>
          <strong>${isFr ? 'L\'équipe Au Marais' : 'The Au Marais team'}</strong></p>
        </div>
        <div class="footer">
          <p>Au Marais - Paris 4ème<br>
          <a href="https://au-marais.fr">au-marais.fr</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: reservation.email,
    subject,
    html,
  });
};

// Email template: Reservation approved (to client) with payment link
export const sendReservationApprovedEmail = async (
  reservation: Reservation,
  paymentLinkUrl: string
) => {
  const { locale } = reservation;
  const isFr = locale === 'fr';

  const subject = isFr
    ? 'Réservation confirmée - Au Marais'
    : 'Reservation confirmed - Au Marais';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #C9A962; }
        .logo { font-family: Georgia, serif; font-size: 28px; color: #333; }
        .logo span { color: #C9A962; }
        .content { padding: 30px 0; }
        .highlight { background: #f0f9e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4CAF50; margin: 20px 0; }
        .details { background: #f9f7f4; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .details-row:last-child { border-bottom: none; }
        .total { font-size: 18px; font-weight: bold; color: #C9A962; }
        .btn { display: inline-block; background: #C9A962; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
        .btn:hover { background: #b8994d; }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Au <span>Marais</span></div>
        </div>
        <div class="content">
          <div class="highlight">
            <h2 style="margin: 0; color: #4CAF50;">${isFr ? '🎉 Votre réservation est confirmée !' : '🎉 Your reservation is confirmed!'}</h2>
          </div>

          <p>${isFr ? 'Bonjour' : 'Hello'} ${reservation.firstName},</p>
          <p>${isFr
            ? 'Excellente nouvelle ! Nous avons le plaisir de confirmer votre réservation.'
            : 'Great news! We are pleased to confirm your reservation.'
          }</p>

          <div class="details">
            <h3>${isFr ? 'Détails de votre séjour' : 'Your stay details'}</h3>
            <div class="details-row">
              <span>${isFr ? 'Arrivée' : 'Check-in'}</span>
              <strong>${formatDate(reservation.arrivalDate, locale)}</strong>
            </div>
            <div class="details-row">
              <span>${isFr ? 'Départ' : 'Check-out'}</span>
              <strong>${formatDate(reservation.departureDate, locale)}</strong>
            </div>
            <div class="details-row">
              <span>${isFr ? 'Voyageurs' : 'Guests'}</span>
              <strong>${reservation.guests}</strong>
            </div>
            <div class="details-row total">
              <span>${isFr ? 'Total' : 'Total'}</span>
              <strong>${formatCurrency(reservation.total)}</strong>
            </div>
          </div>

          <h3>${isFr ? 'Prochaine étape : Caution' : 'Next step: Deposit'}</h3>
          <p>${isFr
            ? `Pour finaliser votre réservation, nous vous demandons de verser une caution de <strong>${formatCurrency(reservation.depositAmount)}</strong>. Cette caution vous sera intégralement restituée après votre séjour.`
            : `To finalize your reservation, we ask for a deposit of <strong>${formatCurrency(reservation.depositAmount)}</strong>. This deposit will be fully refunded after your stay.`
          }</p>

          <p style="text-align: center;">
            <a href="${paymentLinkUrl}" class="btn">${isFr ? 'Payer la caution' : 'Pay deposit'}</a>
          </p>

          <p style="font-size: 14px; color: #666;">${isFr
            ? 'Ce lien de paiement est sécurisé via Stripe. Vous recevrez une confirmation dès que le paiement sera effectué.'
            : 'This payment link is secured via Stripe. You will receive a confirmation once the payment is completed.'
          }</p>

          <p>${isFr ? 'À très bientôt,' : 'See you very soon,'}<br>
          <strong>${isFr ? 'L\'équipe Au Marais' : 'The Au Marais team'}</strong></p>
        </div>
        <div class="footer">
          <p>Au Marais - Paris 4ème<br>
          <a href="https://au-marais.fr">au-marais.fr</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: reservation.email,
    subject,
    html,
  });
};

// Email template: Reservation rejected (to client)
export const sendReservationRejectedEmail = async (
  reservation: Reservation,
  reason?: string
) => {
  const { locale } = reservation;
  const isFr = locale === 'fr';

  const subject = isFr
    ? 'Concernant votre demande de réservation - Au Marais'
    : 'Regarding your reservation request - Au Marais';

  const defaultReason = isFr
    ? 'Les dates demandées ne sont malheureusement plus disponibles.'
    : 'Unfortunately, the requested dates are no longer available.';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #C9A962; }
        .logo { font-family: Georgia, serif; font-size: 28px; color: #333; }
        .logo span { color: #C9A962; }
        .content { padding: 30px 0; }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Au <span>Marais</span></div>
        </div>
        <div class="content">
          <p>${isFr ? 'Bonjour' : 'Hello'} ${reservation.firstName},</p>
          <p>${isFr
            ? 'Nous vous remercions pour votre intérêt pour notre appartement.'
            : 'Thank you for your interest in our apartment.'
          }</p>
          <p>${reason || defaultReason}</p>
          <p>${isFr
            ? 'N\'hésitez pas à consulter notre calendrier pour d\'autres dates disponibles.'
            : 'Feel free to check our calendar for other available dates.'
          }</p>
          <p>${isFr ? 'Cordialement,' : 'Best regards,'}<br>
          <strong>${isFr ? 'L\'équipe Au Marais' : 'The Au Marais team'}</strong></p>
        </div>
        <div class="footer">
          <p>Au Marais - Paris 4ème<br>
          <a href="https://au-marais.fr">au-marais.fr</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: reservation.email,
    subject,
    html,
  });
};

// Email template: Payment confirmed (to client)
export const sendPaymentConfirmedEmail = async (reservation: Reservation) => {
  const { locale } = reservation;
  const isFr = locale === 'fr';

  const subject = isFr
    ? 'Paiement reçu - Votre séjour Au Marais'
    : 'Payment received - Your stay at Au Marais';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #C9A962; }
        .logo { font-family: Georgia, serif; font-size: 28px; color: #333; }
        .logo span { color: #C9A962; }
        .content { padding: 30px 0; }
        .highlight { background: #f0f9e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4CAF50; margin: 20px 0; }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Au <span>Marais</span></div>
        </div>
        <div class="content">
          <div class="highlight">
            <h2 style="margin: 0; color: #4CAF50;">${isFr ? '✅ Paiement confirmé !' : '✅ Payment confirmed!'}</h2>
          </div>
          <p>${isFr ? 'Bonjour' : 'Hello'} ${reservation.firstName},</p>
          <p>${isFr
            ? `Nous avons bien reçu votre caution de ${formatCurrency(reservation.depositAmount)}. Votre réservation est maintenant complète !`
            : `We have received your deposit of ${formatCurrency(reservation.depositAmount)}. Your reservation is now complete!`
          }</p>
          <p>${isFr
            ? 'Vous recevrez les informations d\'accès à l\'appartement quelques jours avant votre arrivée.'
            : 'You will receive the apartment access information a few days before your arrival.'
          }</p>
          <p>${isFr ? 'Nous avons hâte de vous accueillir !' : 'We look forward to welcoming you!'}</p>
          <p>${isFr ? 'À très bientôt,' : 'See you very soon,'}<br>
          <strong>${isFr ? 'L\'équipe Au Marais' : 'The Au Marais team'}</strong></p>
        </div>
        <div class="footer">
          <p>Au Marais - Paris 4ème<br>
          <a href="https://au-marais.fr">au-marais.fr</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: reservation.email,
    subject,
    html,
  });
};

// Email template: New reservation notification (to admin)
export const sendAdminNotificationEmail = async (reservation: Reservation) => {
  const actionBaseUrl = `${SITE_URL}/r/${reservation.id}`;

  const subject = `🏠 Nouvelle demande - ${reservation.firstName} ${reservation.lastName} (${reservation.nights} nuits)`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #C9A962; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .row:last-child { border-bottom: none; }
        .actions { margin-top: 20px; }
        .btn { display: inline-block; padding: 12px 24px; margin: 5px; text-decoration: none; border-radius: 4px; font-weight: bold; }
        .btn-approve { background: #4CAF50; color: white; }
        .btn-reject { background: #f44336; color: white; }
        .btn-edit { background: #2196F3; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">🏠 Nouvelle demande de réservation</h2>
        </div>
        <div class="content">
          <div class="details">
            <h3 style="margin-top: 0;">👤 Client</h3>
            <div class="row">
              <span>Nom</span>
              <strong>${reservation.firstName} ${reservation.lastName}</strong>
            </div>
            <div class="row">
              <span>Email</span>
              <strong><a href="mailto:${reservation.email}">${reservation.email}</a></strong>
            </div>
            <div class="row">
              <span>Téléphone</span>
              <strong><a href="tel:${reservation.phone}">${reservation.phone}</a></strong>
            </div>
          </div>

          <div class="details">
            <h3 style="margin-top: 0;">📅 Séjour</h3>
            <div class="row">
              <span>Arrivée</span>
              <strong>${formatDate(reservation.arrivalDate, 'fr')}</strong>
            </div>
            <div class="row">
              <span>Départ</span>
              <strong>${formatDate(reservation.departureDate, 'fr')}</strong>
            </div>
            <div class="row">
              <span>Durée</span>
              <strong>${reservation.nights} nuits</strong>
            </div>
            <div class="row">
              <span>Voyageurs</span>
              <strong>${reservation.guests} personnes</strong>
            </div>
          </div>

          <div class="details">
            <h3 style="margin-top: 0;">💰 Tarification</h3>
            <div class="row">
              <span>${reservation.nights} nuits × ${reservation.nightlyRate}€</span>
              <strong>${reservation.subtotal}€</strong>
            </div>
            ${reservation.discount ? `
            <div class="row" style="color: #4CAF50;">
              <span>Réduction longue durée</span>
              <strong>-${reservation.discount}€</strong>
            </div>
            ` : ''}
            <div class="row">
              <span>Frais de ménage</span>
              <strong>${reservation.cleaningFee}€</strong>
            </div>
            <div class="row">
              <span>Taxe de séjour</span>
              <strong>${reservation.touristTax}€</strong>
            </div>
            <div class="row" style="font-size: 18px; color: #C9A962;">
              <span>Total</span>
              <strong>${formatCurrency(reservation.total)}</strong>
            </div>
            <div class="row">
              <span>Dépôt suggéré (~30%)</span>
              <strong>${reservation.depositAmount}€</strong>
            </div>
          </div>

          ${reservation.message ? `
          <div class="details">
            <h3 style="margin-top: 0;">💬 Message</h3>
            <p style="margin: 0;">${reservation.message}</p>
          </div>
          ` : ''}

          <div class="actions" style="text-align: center;">
            <a href="${actionBaseUrl}/approve?token=${reservation.token}" class="btn btn-approve">✅ Valider</a>
            <a href="${actionBaseUrl}/reject?token=${reservation.token}" class="btn btn-reject">❌ Refuser</a>
            <a href="${SITE_URL}/admin/reservations" class="btn btn-edit">📋 Voir dans Admin</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject,
    html,
  });
};

// Generate WhatsApp notification message for admin
export const generateWhatsAppAdminMessage = (reservation: Reservation): string => {
  const actionBaseUrl = `${SITE_URL}/r/${reservation.id}`;

  return `🏠 *Nouvelle demande de réservation!*

👤 ${reservation.firstName} ${reservation.lastName}
📧 ${reservation.email}
📱 ${reservation.phone}

📅 ${reservation.arrivalDate} → ${reservation.departureDate} (${reservation.nights} nuits)
👥 ${reservation.guests} personnes
💰 Prix: ${reservation.total}€

💳 Dépôt suggéré: ${reservation.depositAmount}€

✅ VALIDER: ${actionBaseUrl}/approve?token=${reservation.token}
❌ REFUSER: ${actionBaseUrl}/reject?token=${reservation.token}
✏️ MODIFIER: ${actionBaseUrl}/edit?token=${reservation.token}`;
};

// Generate WhatsApp URL to send message
export const getWhatsAppUrl = (phoneNumber: string, message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  // Remove any non-digit characters from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

// Email template: Payment failed notification (to admin)
export const sendPaymentFailedAdminEmail = async (
  reservation: Reservation,
  errorDetails: {
    errorMessage?: string;
    errorType?: string;
    declineCode?: string;
    stripeSessionId?: string;
  }
) => {
  const subject = `⚠️ Échec de paiement - ${reservation.firstName} ${reservation.lastName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .row:last-child { border-bottom: none; }
        .error-box { background: #ffebee; border: 1px solid #f44336; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .btn { display: inline-block; padding: 12px 24px; margin: 5px; text-decoration: none; border-radius: 4px; font-weight: bold; }
        .btn-primary { background: #C9A962; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">⚠️ Échec de paiement</h2>
        </div>
        <div class="content">
          <p>Un paiement a échoué pour la réservation suivante :</p>

          <div class="details">
            <h3 style="margin-top: 0;">👤 Client</h3>
            <div class="row">
              <span>Nom</span>
              <strong>${reservation.firstName} ${reservation.lastName}</strong>
            </div>
            <div class="row">
              <span>Email</span>
              <strong><a href="mailto:${reservation.email}">${reservation.email}</a></strong>
            </div>
            <div class="row">
              <span>Téléphone</span>
              <strong><a href="tel:${reservation.phone}">${reservation.phone}</a></strong>
            </div>
          </div>

          <div class="details">
            <h3 style="margin-top: 0;">📅 Séjour</h3>
            <div class="row">
              <span>Dates</span>
              <strong>${formatDate(reservation.arrivalDate, 'fr')} → ${formatDate(reservation.departureDate, 'fr')}</strong>
            </div>
            <div class="row">
              <span>Caution demandée</span>
              <strong>${formatCurrency(reservation.depositAmount)}</strong>
            </div>
          </div>

          <div class="error-box">
            <h3 style="margin-top: 0; color: #f44336;">🚫 Détails de l'erreur</h3>
            ${errorDetails.errorMessage ? `<p><strong>Message :</strong> ${errorDetails.errorMessage}</p>` : ''}
            ${errorDetails.errorType ? `<p><strong>Type :</strong> ${errorDetails.errorType}</p>` : ''}
            ${errorDetails.declineCode ? `<p><strong>Code de refus :</strong> ${errorDetails.declineCode}</p>` : ''}
            ${errorDetails.stripeSessionId ? `<p><strong>Session Stripe :</strong> ${errorDetails.stripeSessionId}</p>` : ''}
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <p>Vous pouvez contacter le client pour lui proposer un nouveau lien de paiement :</p>
            <a href="${SITE_URL}/admin/reservations" class="btn btn-primary">📋 Voir dans Admin</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject,
    html,
  });
};
