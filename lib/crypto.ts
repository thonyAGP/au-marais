import crypto from 'crypto';

const CONFIRMATION_SECRET = process.env.CONFIRMATION_TOKEN_SECRET || process.env.STRIPE_WEBHOOK_SECRET || 'default-secret-change-in-production';

export const generateConfirmationToken = (reservationId: string): string => {
  const timestamp = Date.now().toString(36);
  const data = `${reservationId}:${timestamp}`;
  const hash = crypto
    .createHmac('sha256', CONFIRMATION_SECRET)
    .update(data)
    .digest('hex')
    .slice(0, 32);
  return `${timestamp}.${hash}`;
};

export const verifyConfirmationToken = (
  token: string,
  reservationId: string,
  maxAgeMs: number = 7 * 24 * 60 * 60 * 1000 // 7 days default
): boolean => {
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestamp, hash] = parts;
  const tokenTime = parseInt(timestamp, 36);

  if (isNaN(tokenTime)) return false;
  if (Date.now() - tokenTime > maxAgeMs) return false;

  const data = `${reservationId}:${timestamp}`;
  const expectedHash = crypto
    .createHmac('sha256', CONFIRMATION_SECRET)
    .update(data)
    .digest('hex')
    .slice(0, 32);

  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(expectedHash)
  );
};

export const extractReservationIdFromToken = (token: string): string | null => {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  return null;
};
