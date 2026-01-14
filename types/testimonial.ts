// Testimonial types for V2 Guestbook - Native testimonials collection

export type TestimonialStatus = 'pending' | 'approved' | 'rejected';

export interface TestimonialAuthor {
  name: string;
  location?: string; // City, Country
}

export interface Testimonial {
  id: string;
  token: string; // Secure token for public access
  status: TestimonialStatus;

  // Content
  text: string;
  rating: number; // 1-5 stars
  author: TestimonialAuthor;

  // Optional link to reservation
  reservationId?: string;

  // Timestamps
  createdAt: string; // ISO 8601
  publishedAt?: string; // When approved
  updatedAt?: string;

  // Admin
  adminNotes?: string;
  rejectionReason?: string;

  // Metadata
  language?: string; // Language of submission
  source: 'native'; // Always 'native' for V2 testimonials
}

export interface TestimonialInput {
  text: string;
  rating: number;
  authorName: string;
  authorLocation?: string;
  reservationId?: string;
  language?: string;
}

export interface TestimonialUpdateInput {
  status?: TestimonialStatus;
  adminNotes?: string;
  rejectionReason?: string;
}

// For API responses
export interface TestimonialPublic {
  id: string;
  text: string;
  rating: number;
  author: TestimonialAuthor;
  publishedAt: string;
  source: 'native';
}

// For admin listing
export interface TestimonialWithMeta extends Testimonial {
  reservationDetails?: {
    checkIn: string;
    checkOut: string;
    clientEmail: string;
  };
}
