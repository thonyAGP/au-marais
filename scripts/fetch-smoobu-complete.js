// Fetch all reservations with FULL details from Smoobu API
const fs = require('fs');
const path = require('path');

// Load .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SMOOBU_BASE_URL = 'https://login.smoobu.com/api';
const API_KEY = process.env.SMOOBU_API_KEY;
const APARTMENT_ID = process.env.SMOOBU_APARTMENT_ID;

if (!API_KEY) {
  console.error('SMOOBU_API_KEY not found in .env.local');
  process.exit(1);
}

const headers = {
  'Api-Key': API_KEY,
  'Content-Type': 'application/json',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Fetch single reservation with full details
const fetchReservationDetail = async (reservationId) => {
  try {
    const response = await fetch(`${SMOOBU_BASE_URL}/reservations/${reservationId}`, { headers });
    if (!response.ok) {
      console.error(`  Error fetching ${reservationId}: ${response.status}`);
      return null;
    }
    return response.json();
  } catch (e) {
    console.error(`  Exception fetching ${reservationId}: ${e.message}`);
    return null;
  }
};

// Fetch all reservations (basic list)
const fetchAllReservations = async () => {
  console.log('Fetching reservations list from Smoobu...\n');

  const allReservations = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    console.log(`Page ${page}...`);

    // Get reservations from 2020 to now for the specific apartment
    const url = `${SMOOBU_BASE_URL}/reservations?page=${page}&pageSize=100&from=2020-01-01&apartments[]=${APARTMENT_ID}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.error('API Error:', response.status, await response.text());
      break;
    }

    const data = await response.json();
    console.log(`  Found ${data.bookings?.length || 0} reservations`);

    if (data.bookings) {
      allReservations.push(...data.bookings);
    }

    hasMore = page < (data.pageCount || 1);
    page++;

    await sleep(300);
  }

  return allReservations;
};

// Calculate nights
const calculateNights = (checkin, checkout) => {
  if (!checkin || !checkout) return null;
  const start = new Date(checkin);
  const end = new Date(checkout);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
};

(async () => {
  try {
    console.log('='.repeat(70));
    console.log('   EXTRACTION COMPLÈTE SMOOBU');
    console.log('='.repeat(70));
    console.log();

    // Fetch basic list
    const reservationsList = await fetchAllReservations();
    console.log(`\nTotal reservations found: ${reservationsList.length}`);

    // Filter only Au Marais apartment and non-blocked
    const validReservations = reservationsList.filter(r => {
      const channel = (r.channel?.name || '').toLowerCase();
      return !channel.includes('blocked');
    });
    console.log(`Valid reservations (non-blocked): ${validReservations.length}`);

    // Fetch detailed info for each reservation
    console.log('\nFetching detailed info for each reservation...');
    const detailedReservations = [];

    for (let i = 0; i < validReservations.length; i++) {
      const basic = validReservations[i];
      process.stdout.write(`\r  ${i + 1}/${validReservations.length} - ${basic.id}`);

      const detail = await fetchReservationDetail(basic.id);
      await sleep(200); // Rate limiting

      if (detail) {
        detailedReservations.push({
          id: detail.id,
          basic,
          detail
        });
      }
    }
    console.log('\n');

    // Transform to our format
    const clients = detailedReservations.map(({ basic, detail }) => {
      const guestName = detail['guest-name'] || detail.guestName ||
                       (detail.firstName && detail.lastName ? `${detail.firstName} ${detail.lastName}` : null) ||
                       basic.guestName ||
                       (basic.firstName && basic.lastName ? `${basic.firstName} ${basic.lastName}` : null) ||
                       'Unknown';

      const channel = (detail.channel?.name || basic.channel?.name || '').toLowerCase();
      let source = 'smoobu';
      if (channel.includes('airbnb')) source = 'airbnb';
      else if (channel.includes('homeexchange') || channel.includes('home exchange')) source = 'homeexchange';
      else if (channel.includes('abritel') || channel.includes('homeaway') || channel.includes('vrbo')) source = 'abritel';
      else if (channel.includes('direct')) source = 'direct';
      else if (channel.includes('booking.com')) source = 'booking';

      return {
        name: guestName,
        checkin: detail.arrival || basic.arrival,
        checkout: detail.departure || basic.departure,
        nights: calculateNights(detail.arrival || basic.arrival, detail.departure || basic.departure),
        guests: detail.adults || detail.children ? (detail.adults || 0) + (detail.children || 0) : null,
        adults: detail.adults || null,
        children: detail.children || null,
        price: detail.price || basic.price || null,
        commission: detail.commission || null,
        hostPayout: detail.hostPayout || null,
        email: detail.email || basic.email || null,
        phone: detail.phone || basic.phone || null,
        city: detail.address?.city || null,
        country: detail.address?.country || null,
        street: detail.address?.street || null,
        postalCode: detail.address?.postalCode || null,
        confirmationCode: detail['reference-number'] || detail.reference || basic.reference || `SMB-${detail.id}`,
        channel: detail.channel?.name || basic.channel?.name || 'Unknown',
        source,
        notes: detail.notice || detail.notes || null,
        createdAt: detail['created-at'] || detail.createdAt || null,
        smoobuId: detail.id
      };
    });

    // Filter out Unknown names and sort by date
    const validClients = clients
      .filter(c => c.name !== 'Unknown' && c.name.trim() !== '')
      .sort((a, b) => new Date(b.checkin) - new Date(a.checkin));

    // Statistics
    const stats = {
      total: validClients.length,
      withEmail: validClients.filter(c => c.email).length,
      withPhone: validClients.filter(c => c.phone).length,
      withPrice: validClients.filter(c => c.price).length,
      withLocation: validClients.filter(c => c.country || c.city).length,
      bySource: {},
      byCountry: {},
      totalRevenue: validClients.reduce((sum, c) => sum + (parseFloat(c.price) || 0), 0),
      totalNights: validClients.reduce((sum, c) => sum + (c.nights || 0), 0)
    };

    validClients.forEach(c => {
      stats.bySource[c.source] = (stats.bySource[c.source] || 0) + 1;
      if (c.country) {
        stats.byCountry[c.country] = (stats.byCountry[c.country] || 0) + 1;
      }
    });

    // Display results
    console.log('='.repeat(70));
    console.log('                         STATISTIQUES');
    console.log('='.repeat(70));
    console.log();
    console.log(`Total clients:           ${stats.total}`);
    console.log(`Avec email:              ${stats.withEmail} (${Math.round(stats.withEmail/stats.total*100)}%)`);
    console.log(`Avec téléphone:          ${stats.withPhone} (${Math.round(stats.withPhone/stats.total*100)}%)`);
    console.log(`Avec prix:               ${stats.withPrice} (${Math.round(stats.withPrice/stats.total*100)}%)`);
    console.log(`Avec localisation:       ${stats.withLocation} (${Math.round(stats.withLocation/stats.total*100)}%)`);
    console.log();
    console.log(`Total nuits:             ${stats.totalNights}`);
    console.log(`Revenu total:            ${stats.totalRevenue.toFixed(2)} €`);
    console.log();

    console.log('PAR SOURCE:');
    Object.entries(stats.bySource)
      .sort((a, b) => b[1] - a[1])
      .forEach(([s, n]) => console.log(`  - ${s}: ${n}`));

    if (Object.keys(stats.byCountry).length > 0) {
      console.log('\nPAR PAYS:');
      Object.entries(stats.byCountry)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .forEach(([c, n]) => console.log(`  - ${c}: ${n}`));
    }

    // Display client list
    console.log('\n' + '='.repeat(70));
    console.log('                      LISTE DES CLIENTS');
    console.log('='.repeat(70));

    validClients.slice(0, 30).forEach((c, i) => {
      console.log();
      console.log(`${(i + 1).toString().padStart(2)}. ${c.name.toUpperCase()} [${c.source}]`);
      if (c.checkin && c.checkout) {
        console.log(`    📅 ${c.checkin} → ${c.checkout} (${c.nights} nuits)`);
      }
      if (c.guests) console.log(`    👥 ${c.guests} voyageurs`);
      if (c.price) console.log(`    💰 ${parseFloat(c.price).toFixed(2)} €`);
      if (c.city || c.country) console.log(`    📍 ${[c.city, c.country].filter(Boolean).join(', ')}`);
      if (c.phone) console.log(`    📱 ${c.phone}`);
      if (c.email) console.log(`    ✉️  ${c.email}`);
      if (c.confirmationCode && !c.confirmationCode.startsWith('SMB-')) {
        console.log(`    🔑 ${c.confirmationCode}`);
      }
    });

    if (validClients.length > 30) {
      console.log(`\n... et ${validClients.length - 30} autres clients`);
    }

    // Save results
    const output = {
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'smoobu-api',
        statistics: stats
      },
      clients: validClients
    };

    const jsonFile = path.join(__dirname, '..', 'data', 'smoobu-clients-complete.json');
    fs.writeFileSync(jsonFile, JSON.stringify(output, null, 2));
    console.log(`\n\n✅ Fichier JSON: ${jsonFile}`);

    // CSV
    const csvHeader = 'Nom,Source,CheckIn,CheckOut,Nuits,Voyageurs,Prix,Pays,Ville,Téléphone,Email,Code\n';
    const csvRows = validClients.map(c => [
      `"${c.name}"`,
      c.source,
      c.checkin || '',
      c.checkout || '',
      c.nights || '',
      c.guests || '',
      c.price || '',
      `"${c.country || ''}"`,
      `"${c.city || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      c.confirmationCode || ''
    ].join(',')).join('\n');

    const csvFile = path.join(__dirname, '..', 'data', 'smoobu-clients-complete.csv');
    fs.writeFileSync(csvFile, csvHeader + csvRows);
    console.log(`✅ Fichier CSV:  ${csvFile}`);

  } catch (error) {
    console.error('Error:', error);
  }
})();
