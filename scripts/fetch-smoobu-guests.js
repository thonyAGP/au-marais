// Fetch all guests from Smoobu API
const fs = require('fs');
const path = require('path');

// Load .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SMOOBU_BASE_URL = 'https://login.smoobu.com/api';
const API_KEY = process.env.SMOOBU_API_KEY;

if (!API_KEY) {
  console.error('SMOOBU_API_KEY not found in .env.local');
  process.exit(1);
}

const headers = {
  'Api-Key': API_KEY,
  'Content-Type': 'application/json',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

const fetchAllGuests = async () => {
  console.log('Fetching guests from Smoobu API...\n');

  const allGuests = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    console.log(`Page ${page}...`);

    const response = await fetch(`${SMOOBU_BASE_URL}/guests?page=${page}`, { headers });

    if (!response.ok) {
      console.error('API Error:', response.status, await response.text());
      break;
    }

    const data = await response.json();
    console.log(`  Found ${data.guests?.length || 0} guests (total: ${data.totalItems})`);

    if (data.guests) {
      allGuests.push(...data.guests);
    }

    hasMore = page < (data.pageCount || 1);
    page++;

    await sleep(500); // Rate limiting
  }

  return allGuests;
};

const fetchReservationDetails = async (reservationId) => {
  const response = await fetch(`${SMOOBU_BASE_URL}/reservations/${reservationId}`, { headers });
  if (!response.ok) return null;
  return response.json();
};

const fetchAllReservations = async () => {
  console.log('\nFetching reservations from Smoobu API...\n');

  const allReservations = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    console.log(`Page ${page}...`);

    // Get reservations from 2020 to now
    const response = await fetch(
      `${SMOOBU_BASE_URL}/reservations?page=${page}&pageSize=100&from=2020-01-01`,
      { headers }
    );

    if (!response.ok) {
      console.error('API Error:', response.status, await response.text());
      break;
    }

    const data = await response.json();
    console.log(`  Found ${data.bookings?.length || 0} reservations (total: ${data.totalItems})`);

    if (data.bookings) {
      allReservations.push(...data.bookings);
    }

    hasMore = page < (data.pageCount || 1);
    page++;

    await sleep(500);
  }

  return allReservations;
};

(async () => {
  try {
    // Fetch guests
    const guests = await fetchAllGuests();
    console.log(`\nTotal guests: ${guests.length}`);

    // Fetch reservations
    const reservations = await fetchAllReservations();
    console.log(`\nTotal reservations: ${reservations.length}`);

    // Transform to our format
    const output = reservations.map(r => ({
      name: r.guestName || `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Unknown',
      city: r.address?.city || null,
      country: r.address?.country || r.channel?.name || null,
      checkin: r.arrival,
      checkout: r.departure,
      guests: r.adults || null,
      nights: null,
      totalPaid: r.price ? r.price.toString() : '0',
      hostEarnings: r.price ? r.price.toString() : '0',
      cleaningFee: null,
      taxes: null,
      confirmationCode: r.reference || `SMB-${r.id}`,
      email: r.email || null,
      phone: r.phone || null,
      channel: r.channel?.name || 'Unknown',
      source: (r.channel?.name || '').toLowerCase().includes('airbnb') ? 'airbnb' :
              (r.channel?.name || '').toLowerCase().includes('homeexchange') ? 'homeexchange' :
              'smoobu'
    }));

    // Save to file
    const outputPath = path.join(__dirname, '..', 'data', 'smoobu-reservations.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\nSaved to: ${outputPath}`);

    // Summary
    console.log('\n=== SUMMARY ===');
    const countries = {};
    output.forEach(r => {
      if (r.country) {
        countries[r.country] = (countries[r.country] || 0) + 1;
      }
    });
    console.log('Countries:');
    Object.entries(countries).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => {
      console.log(`  ${c}: ${n}`);
    });

    // Also save guests with location
    const guestsWithLocation = guests
      .filter(g => g.address?.country)
      .map(g => ({
        name: `${g.firstName} ${g.lastName}`,
        city: g.address.city,
        country: g.address.country,
        email: g.emails?.[0] || null,
        phone: g.telephoneNumbers?.[0] || null,
        bookings: g.bookings?.length || 0
      }));

    const guestsPath = path.join(__dirname, '..', 'data', 'smoobu-guests.json');
    fs.writeFileSync(guestsPath, JSON.stringify(guestsWithLocation, null, 2));
    console.log(`\nGuests with location: ${guestsWithLocation.length}`);
    console.log(`Saved to: ${guestsPath}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
})();
