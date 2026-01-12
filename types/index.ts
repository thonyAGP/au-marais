export * from './reservation';

export interface Apartment {
  name: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  floor: string;
  address: {
    street: string;
    district: string;
    city: string;
  };
  transport: string;
  highlights: string[];
  notes: string[];
  amenities: {
    kitchen: string[];
    comfort: string[];
    multimedia: string[];
  };
  contact: string;
}

export interface AvailabilityResponse {
  data: {
    [date: string]: {
      available: boolean;
      price?: number;
      minStay?: number;
    };
  };
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  arrivalDate: string;
  departureDate: string;
  guests: number;
  message?: string;
}
