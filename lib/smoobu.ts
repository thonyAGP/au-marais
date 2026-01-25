const SMOOBU_BASE_URL = 'https://login.smoobu.com/api';

const getHeaders = () => ({
  'Api-Key': process.env.SMOOBU_API_KEY!,
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
});

// Channel IDs for Smoobu
// You may need to adjust this based on your Smoobu account
const CHANNEL_DIRECT_BOOKING = 1627949; // "Direct Booking" or similar - check your Smoobu dashboard

export const getAvailability = async (startDate: string, endDate: string) => {
  const apartmentId = process.env.SMOOBU_APARTMENT_ID;
  const response = await fetch(
    `${SMOOBU_BASE_URL}/rates?apartments[]=${apartmentId}&start_date=${startDate}&end_date=${endDate}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch availability');
  }

  return response.json();
};

export const checkAvailability = async (arrival: string, departure: string) => {
  const apartmentId = process.env.SMOOBU_APARTMENT_ID;
  const apiKey = process.env.SMOOBU_API_KEY;

  if (!apartmentId || !apiKey) {
    throw new Error(`Smoobu config missing: apartmentId=${!!apartmentId}, apiKey=${!!apiKey}`);
  }

  const response = await fetch(
    `${SMOOBU_BASE_URL}/availability?arrivalDate=${arrival}&departureDate=${departure}&apartments[]=${apartmentId}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Smoobu API error ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.availableApartments?.includes(Number(apartmentId)) ?? false;
};

// Create a reservation in Smoobu (blocks the dates)
export interface SmoobuReservationInput {
  arrivalDate: string; // YYYY-MM-DD
  departureDate: string; // YYYY-MM-DD
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  adults?: number;
  notice?: string;
  price?: number;
}

export interface SmoobuReservationResponse {
  id: number;
}

export const createSmoobuReservation = async (
  input: SmoobuReservationInput
): Promise<SmoobuReservationResponse> => {
  const apartmentId = process.env.SMOOBU_APARTMENT_ID;

  const body = {
    arrivalDate: input.arrivalDate,
    departureDate: input.departureDate,
    apartmentId: Number(apartmentId),
    channelId: CHANNEL_DIRECT_BOOKING,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    adults: input.adults || 2,
    notice: input.notice || 'Réservation via au-marais.fr',
    price: input.price,
  };

  const response = await fetch(`${SMOOBU_BASE_URL}/reservations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Smoobu reservation error:', errorText);
    throw new Error(`Failed to create Smoobu reservation: ${response.status}`);
  }

  return response.json();
};

// Update a reservation in Smoobu
export const updateSmoobuReservation = async (
  reservationId: number,
  updates: Partial<SmoobuReservationInput>
): Promise<void> => {
  const response = await fetch(`${SMOOBU_BASE_URL}/reservations/${reservationId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Smoobu update error:', errorText);
    throw new Error(`Failed to update Smoobu reservation: ${response.status}`);
  }
};

// Cancel/delete a reservation in Smoobu
export const cancelSmoobuReservation = async (reservationId: number): Promise<void> => {
  const response = await fetch(`${SMOOBU_BASE_URL}/reservations/${reservationId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Smoobu cancel error:', errorText);
    throw new Error(`Failed to cancel Smoobu reservation: ${response.status}`);
  }
};

// Get list of channels (to find the correct channelId)
export const getSmoobuChannels = async () => {
  const response = await fetch(`${SMOOBU_BASE_URL}/channels`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Smoobu channels');
  }

  return response.json();
};

// Guest data structure from Smoobu
export interface SmoobuGuestAddress {
  street: string | null;
  postalCode: string | null;
  city: string | null;
  country: string | null;
}

export interface SmoobuGuest {
  id: number;
  firstName: string;
  lastName: string;
  companyName: string | null;
  emails: string[];
  telephoneNumbers: string[];
  address: SmoobuGuestAddress;
  notes: string | null;
  bookings: Array<{
    id: number;
    arrival: string;
    departure: string;
  }>;
}

export interface SmoobuGuestsResponse {
  guests: SmoobuGuest[];
  pageCount: number;
  pageSize: number;
  totalItems: number;
  page: number;
}

// Get all guests with their location data (for V3 map feature)
export const getSmoobuGuests = async (page = 1): Promise<SmoobuGuestsResponse> => {
  const response = await fetch(`${SMOOBU_BASE_URL}/guests?page=${page}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Smoobu guests');
  }

  return response.json();
};

// Get a single guest by ID
export const getSmoobuGuest = async (guestId: number): Promise<SmoobuGuest> => {
  const response = await fetch(`${SMOOBU_BASE_URL}/guests/${guestId}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Smoobu guest');
  }

  return response.json();
};

// Get guests with country data (filters out guests without country)
export const getGuestsWithLocation = async (): Promise<Array<{
  name: string;
  country: string;
  city: string | null;
  stayDate: string;
}>> => {
  const guestsWithLocation: Array<{
    name: string;
    country: string;
    city: string | null;
    stayDate: string;
  }> = [];

  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await getSmoobuGuests(page);

    for (const guest of response.guests) {
      if (guest.address.country) {
        const latestBooking = guest.bookings[0]; // Most recent booking
        guestsWithLocation.push({
          name: `${guest.firstName} ${guest.lastName.charAt(0)}.`,
          country: guest.address.country,
          city: guest.address.city,
          stayDate: latestBooking?.arrival || '',
        });
      }
    }

    hasMore = page < response.pageCount;
    page++;
  }

  return guestsWithLocation;
};
