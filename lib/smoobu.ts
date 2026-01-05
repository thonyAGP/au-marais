const SMOOBU_BASE_URL = 'https://login.smoobu.com/api';

const getHeaders = () => ({
  'Api-Key': process.env.SMOOBU_API_KEY!,
  'Content-Type': 'application/json',
});

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
