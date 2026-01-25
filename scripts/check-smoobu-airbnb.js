// Check what Airbnb data is available through Smoobu
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SMOOBU_BASE_URL = 'https://login.smoobu.com/api';
const API_KEY = process.env.SMOOBU_API_KEY;

const headers = {
  'Api-Key': API_KEY,
  'Content-Type': 'application/json',
};

async function main() {
  console.log('='.repeat(60));
  console.log('   ANALYSE DONNÉES AIRBNB VIA SMOOBU');
  console.log('='.repeat(60));
  console.log();

  // 1. Check channels connected
  console.log('1. Canaux connectés:');
  try {
    const channelsResp = await fetch(`${SMOOBU_BASE_URL}/channels`, { headers });
    if (channelsResp.ok) {
      const channels = await channelsResp.json();
      if (channels.channels) {
        channels.channels.forEach(c => {
          console.log(`   - ${c.name} (ID: ${c.id})`);
        });
      }
    } else {
      console.log(`   Endpoint non disponible (${channelsResp.status})`);
    }
  } catch (e) {
    console.log(`   Erreur: ${e.message}`);
  }

  // 2. Get a sample Airbnb reservation with full details
  console.log('\n2. Exemple de réservation Airbnb détaillée:');

  const reservationsResp = await fetch(
    `${SMOOBU_BASE_URL}/reservations?from=2025-01-01&pageSize=100`,
    { headers }
  );
  const reservations = await reservationsResp.json();

  // Find an Airbnb reservation
  const airbnbBooking = reservations.bookings?.find(b =>
    b.channel?.name?.toLowerCase().includes('airbnb')
  );

  if (airbnbBooking) {
    console.log(`   Trouvé: ID ${airbnbBooking.id}`);

    // Get full details
    const detailResp = await fetch(
      `${SMOOBU_BASE_URL}/reservations/${airbnbBooking.id}`,
      { headers }
    );
    const detail = await detailResp.json();

    console.log('\n   Données disponibles:');
    console.log(JSON.stringify(detail, null, 2));
  }

  // 3. Check guest endpoint for an Airbnb guest
  console.log('\n3. Données guest Smoobu:');

  const guestsResp = await fetch(`${SMOOBU_BASE_URL}/guests?page=1`, { headers });
  const guests = await guestsResp.json();

  if (guests.guests?.length > 0) {
    const sampleGuest = guests.guests[0];
    console.log('   Exemple de guest:');
    console.log(JSON.stringify(sampleGuest, null, 2));
  }

  // 4. Check what fields are available
  console.log('\n4. Champs disponibles dans les réservations Airbnb:');

  const airbnbReservations = reservations.bookings?.filter(b =>
    b.channel?.name?.toLowerCase().includes('airbnb')
  ) || [];

  console.log(`   Total réservations Airbnb: ${airbnbReservations.length}`);

  // Analyze what data we have
  const stats = {
    withPhone: 0,
    withEmail: 0,
    withAddress: 0,
    withGuestName: 0
  };

  for (const booking of airbnbReservations.slice(0, 10)) {
    const detail = await fetch(
      `${SMOOBU_BASE_URL}/reservations/${booking.id}`,
      { headers }
    ).then(r => r.json());

    if (detail.phone) stats.withPhone++;
    if (detail.email) stats.withEmail++;
    if (detail.address?.city || detail.address?.country) stats.withAddress++;
    if (detail.guestName || detail.firstName) stats.withGuestName++;

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n   Sur 10 réservations Airbnb:`);
  console.log(`   - Avec téléphone: ${stats.withPhone}`);
  console.log(`   - Avec email: ${stats.withEmail}`);
  console.log(`   - Avec adresse: ${stats.withAddress}`);
  console.log(`   - Avec nom: ${stats.withGuestName}`);
}

main().catch(console.error);
