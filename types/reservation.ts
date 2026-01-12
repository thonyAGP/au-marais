export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';

export interface Reservation {
  id: string;
  token: string; // Token unique pour les liens d'action (securite)
  status: ReservationStatus;

  // Client info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Sejour
  arrivalDate: string; // YYYY-MM-DD
  departureDate: string; // YYYY-MM-DD
  guests: number;
  message?: string;

  // Prix
  nightlyRate: number;
  nights: number;
  subtotal: number;
  discount: number;
  discountPercent: number;
  cleaningFee: number;
  touristTax: number;
  total: number;

  // Depot
  depositAmount: number;
  depositPaid: boolean;
  stripePaymentLinkId?: string;
  stripePaymentLinkUrl?: string;
  stripePaymentIntentId?: string;

  // Smoobu
  smoobuReservationId?: number;

  // Meta
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  rejectionReason?: string;

  // Locale pour les emails
  locale: string;
}

export interface CreateReservationInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  arrivalDate: string;
  departureDate: string;
  guests: number;
  message?: string;
  locale: string;
}

export interface UpdateReservationInput {
  status?: ReservationStatus;
  nightlyRate?: number;
  discount?: number;
  discountPercent?: number;
  cleaningFee?: number;
  touristTax?: number;
  total?: number;
  depositAmount?: number;
  depositPaid?: boolean;
  stripePaymentLinkId?: string;
  stripePaymentLinkUrl?: string;
  stripePaymentIntentId?: string;
  smoobuReservationId?: number;
  adminNotes?: string;
  rejectionReason?: string;
}

export interface ReservationPricing {
  nightlyRate: number;
  nights: number;
  subtotal: number;
  discount: number;
  discountPercent: number;
  cleaningFee: number;
  touristTax: number;
  total: number;
  depositSuggested: number;
}
