// Check Smoobu API for messages/conversations
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SMOOBU_BASE_URL = 'https://login.smoobu.com/api';
const API_KEY = process.env.SMOOBU_API_KEY;

const headers = {
  'Api-Key': API_KEY,
  'Content-Type': 'application/json',
};

async function tryEndpoint(name, url) {
  try {
    const resp = await fetch(url, { headers });
    console.log(`${name}: ${resp.status} ${resp.statusText}`);
    if (resp.ok) {
      const data = await resp.json();
      console.log(JSON.stringify(data, null, 2).substring(0, 1500));
    }
    return resp.ok;
  } catch (e) {
    console.log(`${name}: Error - ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('   RECHERCHE API MESSAGES SMOOBU');
  console.log('='.repeat(60));
  console.log();

  // Try various message-related endpoints
  const endpoints = [
    ['Messages', `${SMOOBU_BASE_URL}/messages`],
    ['Conversations', `${SMOOBU_BASE_URL}/conversations`],
    ['Inbox', `${SMOOBU_BASE_URL}/inbox`],
    ['Communication', `${SMOOBU_BASE_URL}/communication`],
    ['Guest Messages', `${SMOOBU_BASE_URL}/guest-messages`],
  ];

  for (const [name, url] of endpoints) {
    await tryEndpoint(name, url);
    console.log();
  }

  // Check reservation with messages
  console.log('='.repeat(60));
  console.log('   DÉTAILS RÉSERVATION (avec notes/messages?)');
  console.log('='.repeat(60));
  console.log();

  // Get a recent reservation
  const resp = await fetch(`${SMOOBU_BASE_URL}/reservations?from=2025-06-01&pageSize=5`, { headers });
  const data = await resp.json();

  if (data.bookings?.length > 0) {
    const booking = data.bookings[0];
    console.log(`Réservation ${booking.id}:`);

    // Get full details
    const detailResp = await fetch(`${SMOOBU_BASE_URL}/reservations/${booking.id}`, { headers });
    const detail = await detailResp.json();

    // Show all fields that might contain messages
    console.log('\nChamps disponibles:');
    Object.keys(detail).forEach(key => {
      const val = detail[key];
      if (val && typeof val === 'string' && val.length > 0) {
        console.log(`  ${key}: "${val.substring(0, 100)}${val.length > 100 ? '...' : ''}"`);
      }
    });

    // Check for guest app messages endpoint
    if (detail.guestId) {
      console.log(`\nGuest ID: ${detail.guestId}`);
      await tryEndpoint('Guest details', `${SMOOBU_BASE_URL}/guests/${detail.guestId}`);
    }
  }

  // Check API documentation hints
  console.log('\n='.repeat(60));
  console.log('   ENDPOINTS DISPONIBLES');
  console.log('='.repeat(60));

  // Try to get API info
  await tryEndpoint('API Root', SMOOBU_BASE_URL);
  await tryEndpoint('Settings', `${SMOOBU_BASE_URL}/settings`);
  await tryEndpoint('User', `${SMOOBU_BASE_URL}/user`);
  await tryEndpoint('Me', `${SMOOBU_BASE_URL}/me`);
}

main().catch(console.error);
