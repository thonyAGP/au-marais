import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';
import type {
  Reservation,
  CreateReservationInput,
  UpdateReservationInput,
  ReservationPricing,
} from '@/types/reservation';
import type {
  Testimonial,
  TestimonialInput,
  TestimonialUpdateInput,
  TestimonialStatus,
  TestimonialPublic,
} from '@/types/testimonial';

const RESERVATION_PREFIX = 'reservation:';
const RESERVATIONS_LIST_KEY = 'reservations:list';

const TESTIMONIAL_PREFIX = 'testimonial:';
const TESTIMONIALS_LIST_KEY = 'testimonials:list';

// Check if Vercel KV is configured
const isKvConfigured = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
};

// Log warning only once
let kvWarningLogged = false;
const logKvWarning = () => {
  if (!kvWarningLogged && !isKvConfigured()) {
    console.warn(
      '[db] Vercel KV not configured (missing KV_REST_API_URL/KV_REST_API_TOKEN). ' +
      'Database operations will return empty results. ' +
      'This is expected in local development without KV setup.'
    );
    kvWarningLogged = true;
  }
};

// Safe KV wrapper that returns fallback values when KV is not configured
const safeKv = {
  async get<T>(key: string): Promise<T | null> {
    if (!isKvConfigured()) {
      logKvWarning();
      return null;
    }
    return kv.get<T>(key);
  },

  async set<T>(key: string, value: T): Promise<void> {
    if (!isKvConfigured()) {
      logKvWarning();
      return;
    }
    await kv.set(key, value);
  },

  async del(key: string): Promise<void> {
    if (!isKvConfigured()) {
      logKvWarning();
      return;
    }
    await kv.del(key);
  },

  async zadd(key: string, options: { score: number; member: string }): Promise<void> {
    if (!isKvConfigured()) {
      logKvWarning();
      return;
    }
    await kv.zadd(key, options);
  },

  async zrange<T extends unknown[]>(key: string, start: number, end: number, options?: { rev?: boolean }): Promise<T | null> {
    if (!isKvConfigured()) {
      logKvWarning();
      return null;
    }
    return kv.zrange<T>(key, start, end, options);
  },

  async zrem(key: string, member: string): Promise<void> {
    if (!isKvConfigured()) {
      logKvWarning();
      return;
    }
    await kv.zrem(key, member);
  },
};

// Generate a secure token for action links
const generateToken = () => uuidv4().replace(/-/g, '');

// Calculate pricing based on dates and settings
export const calculatePricing = (
  arrivalDate: string,
  departureDate: string,
  guests: number,
  settings?: {
    baseRate?: number;
    cleaningFee?: number;
    touristTaxPerNight?: number;
    weeklyDiscount?: number;
    biweeklyDiscount?: number;
    monthlyDiscount?: number;
  }
): ReservationPricing => {
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);
  const nights = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));

  const nightlyRate = settings?.baseRate || 250;
  const cleaningFee = settings?.cleaningFee || 50;
  const touristTaxPerNight = settings?.touristTaxPerNight || 2.88;

  // Calculate discount based on length of stay
  let discountPercent = 0;
  if (nights >= 28 && settings?.monthlyDiscount) {
    discountPercent = settings.monthlyDiscount;
  } else if (nights >= 14 && settings?.biweeklyDiscount) {
    discountPercent = settings.biweeklyDiscount;
  } else if (nights >= 7 && settings?.weeklyDiscount) {
    discountPercent = settings.weeklyDiscount;
  }

  const subtotal = nightlyRate * nights;
  const discount = Math.round(subtotal * (discountPercent / 100));
  const touristTax = Math.round(touristTaxPerNight * nights * guests * 100) / 100;
  const total = subtotal - discount + cleaningFee + touristTax;

  // Suggested deposit: ~30% of total, rounded to nearest 50
  const depositSuggested = Math.round((total * 0.3) / 50) * 50;

  return {
    nightlyRate,
    nights,
    subtotal,
    discount,
    discountPercent,
    cleaningFee,
    touristTax,
    total,
    depositSuggested: Math.max(depositSuggested, 100), // Minimum 100€
  };
};

// Create a new reservation
export const createReservation = async (
  input: CreateReservationInput,
  pricing: ReservationPricing
): Promise<Reservation> => {
  const id = uuidv4();
  const token = generateToken();
  const now = new Date().toISOString();

  const reservation: Reservation = {
    id,
    token,
    status: 'pending',
    ...input,
    ...pricing,
    depositAmount: pricing.depositSuggested,
    depositPaid: false,
    createdAt: now,
    updatedAt: now,
  };

  // Store the reservation
  await safeKv.set(`${RESERVATION_PREFIX}${id}`, reservation);

  // Add to the list of reservations (sorted by creation date)
  await safeKv.zadd(RESERVATIONS_LIST_KEY, {
    score: Date.now(),
    member: id,
  });

  return reservation;
};

// Get a reservation by ID
export const getReservation = async (id: string): Promise<Reservation | null> => {
  return safeKv.get<Reservation>(`${RESERVATION_PREFIX}${id}`);
};

// Get a reservation by ID and token (for secure action links)
export const getReservationByToken = async (
  id: string,
  token: string
): Promise<Reservation | null> => {
  const reservation = await getReservation(id);
  if (reservation && reservation.token === token) {
    return reservation;
  }
  return null;
};

// Update a reservation
export const updateReservation = async (
  id: string,
  updates: UpdateReservationInput
): Promise<Reservation | null> => {
  const reservation = await getReservation(id);
  if (!reservation) return null;

  // Recalculate total if pricing fields changed
  let total = reservation.total;
  if (
    updates.nightlyRate !== undefined ||
    updates.discount !== undefined ||
    updates.cleaningFee !== undefined ||
    updates.touristTax !== undefined
  ) {
    const nightlyRate = updates.nightlyRate ?? reservation.nightlyRate;
    const discount = updates.discount ?? reservation.discount;
    const cleaningFee = updates.cleaningFee ?? reservation.cleaningFee;
    const touristTax = updates.touristTax ?? reservation.touristTax;
    const subtotal = nightlyRate * reservation.nights;
    total = subtotal - discount + cleaningFee + touristTax;
  }

  const updated: Reservation = {
    ...reservation,
    ...updates,
    total: updates.total ?? total,
    updatedAt: new Date().toISOString(),
  };

  await safeKv.set(`${RESERVATION_PREFIX}${id}`, updated);
  return updated;
};

// List all reservations (newest first)
export const listReservations = async (
  options: {
    status?: Reservation['status'];
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ reservations: Reservation[]; total: number }> => {
  const { status, limit = 50, offset = 0 } = options;

  // Get all reservation IDs (newest first)
  const ids = await safeKv.zrange<string[]>(RESERVATIONS_LIST_KEY, 0, -1, { rev: true });

  if (!ids || ids.length === 0) {
    return { reservations: [], total: 0 };
  }

  // Get all reservations
  const allReservations = await Promise.all(
    ids.map((id) => getReservation(id))
  );

  // Filter out nulls and by status if specified
  let filtered = allReservations.filter(
    (r): r is Reservation => r !== null && (!status || r.status === status)
  );

  const total = filtered.length;

  // Apply pagination
  filtered = filtered.slice(offset, offset + limit);

  return { reservations: filtered, total };
};

// Delete a reservation
export const deleteReservation = async (id: string): Promise<boolean> => {
  const reservation = await getReservation(id);
  if (!reservation) return false;

  await safeKv.del(`${RESERVATION_PREFIX}${id}`);
  await safeKv.zrem(RESERVATIONS_LIST_KEY, id);

  return true;
};

// Get reservations for a date range (to check availability)
export const getReservationsForDateRange = async (
  startDate: string,
  endDate: string
): Promise<Reservation[]> => {
  const { reservations } = await listReservations();

  return reservations.filter((r) => {
    // Only consider approved or paid reservations
    if (r.status !== 'approved' && r.status !== 'paid') return false;

    // Check if date ranges overlap
    const rStart = new Date(r.arrivalDate);
    const rEnd = new Date(r.departureDate);
    const qStart = new Date(startDate);
    const qEnd = new Date(endDate);

    return rStart < qEnd && rEnd > qStart;
  });
};

// ==================== TESTIMONIALS ====================

// Create a new testimonial
export const createTestimonial = async (
  input: TestimonialInput
): Promise<Testimonial> => {
  const id = uuidv4();
  const token = generateToken();
  const now = new Date().toISOString();

  const testimonial: Testimonial = {
    id,
    token,
    status: 'pending',
    text: input.text,
    rating: input.rating,
    author: {
      name: input.authorName,
      location: input.authorLocation,
    },
    reservationId: input.reservationId,
    language: input.language,
    source: 'native',
    createdAt: now,
    updatedAt: now,
  };

  await safeKv.set(`${TESTIMONIAL_PREFIX}${id}`, testimonial);
  await safeKv.zadd(TESTIMONIALS_LIST_KEY, {
    score: Date.now(),
    member: id,
  });

  return testimonial;
};

// Get a testimonial by ID
export const getTestimonial = async (id: string): Promise<Testimonial | null> => {
  return safeKv.get<Testimonial>(`${TESTIMONIAL_PREFIX}${id}`);
};

// Get a testimonial by ID and token (for secure access)
export const getTestimonialByToken = async (
  id: string,
  token: string
): Promise<Testimonial | null> => {
  const testimonial = await getTestimonial(id);
  if (testimonial && testimonial.token === token) {
    return testimonial;
  }
  return null;
};

// Update a testimonial
export const updateTestimonial = async (
  id: string,
  updates: TestimonialUpdateInput
): Promise<Testimonial | null> => {
  const testimonial = await getTestimonial(id);
  if (!testimonial) return null;

  const now = new Date().toISOString();
  const updated: Testimonial = {
    ...testimonial,
    ...updates,
    updatedAt: now,
    // Set publishedAt when approved
    publishedAt:
      updates.status === 'approved' && !testimonial.publishedAt
        ? now
        : testimonial.publishedAt,
  };

  await safeKv.set(`${TESTIMONIAL_PREFIX}${id}`, updated);
  return updated;
};

// List testimonials
export const listTestimonials = async (
  options: {
    status?: TestimonialStatus;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ testimonials: Testimonial[]; total: number }> => {
  const { status, limit = 50, offset = 0 } = options;

  const ids = await safeKv.zrange<string[]>(TESTIMONIALS_LIST_KEY, 0, -1, { rev: true });

  if (!ids || ids.length === 0) {
    return { testimonials: [], total: 0 };
  }

  const all = await Promise.all(ids.map((id) => getTestimonial(id)));

  let filtered = all.filter(
    (t): t is Testimonial => t !== null && (!status || t.status === status)
  );

  const total = filtered.length;
  filtered = filtered.slice(offset, offset + limit);

  return { testimonials: filtered, total };
};

// Get published testimonials for public display
export const getPublishedTestimonials = async (
  limit: number = 10
): Promise<TestimonialPublic[]> => {
  const { testimonials } = await listTestimonials({ status: 'approved', limit });

  return testimonials.map((t) => ({
    id: t.id,
    text: t.text,
    rating: t.rating,
    author: t.author,
    publishedAt: t.publishedAt || t.createdAt,
    source: 'native' as const,
  }));
};

// Delete a testimonial
export const deleteTestimonial = async (id: string): Promise<boolean> => {
  const testimonial = await getTestimonial(id);
  if (!testimonial) return false;

  await safeKv.del(`${TESTIMONIAL_PREFIX}${id}`);
  await safeKv.zrem(TESTIMONIALS_LIST_KEY, id);

  return true;
};
