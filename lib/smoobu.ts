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
  const response = await fetch(
    `${SMOOBU_BASE_URL}/availability?arrivalDate=${arrival}&departureDate=${departure}&apartments[]=${apartmentId}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    throw new Error('Failed to check availability');
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
