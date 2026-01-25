const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Load all data sources
function loadJSON(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (fs.existsSync(filepath)) {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  }
  return null;
}

// Clean location string (remove truncation artifacts)
function cleanLocation(loc) {
  if (!loc) return null;
  return loc
    .replace(/\s*(Env|Bon|Message|Envoy).*$/i, '')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

// Normalize country names
function normalizeCountry(country) {
  if (!country) return null;
  const cleaned = cleanLocation(country);
  const map = {
    'FL': 'United States',
    'NC': 'United States',
    'IL': 'United States',
    'NJ': 'United States',
    'KY': 'United States',
    'DF': 'Brazil',
    'Pennsylvanie': 'United States',
    'FL\n\nBon': 'United States',
    'New Zealand\n\nEnv': 'New Zealand',
    'Netherlands\n\nEnv': 'Netherlands',
  };
  return map[cleaned] || cleaned;
}

function main() {
  console.log('='.repeat(70));
  console.log('           FUSION DE TOUTES LES SOURCES DE DONNEES');
  console.log('='.repeat(70));
  console.log();

  const clients = new Map();

  // 1. Load Airbnb confirmations (most recent and complete)
  const confirmations = loadJSON('airbnb-confirmations.json');
  if (confirmations?.clients) {
    console.log(`Loading airbnb-confirmations.json: ${confirmations.clients.length} clients`);
    for (const c of confirmations.clients) {
      const key = c.name?.toLowerCase();
      if (key) {
        clients.set(key, {
          name: c.name,
          city: cleanLocation(c.city),
          country: normalizeCountry(c.country),
          fullLocation: cleanLocation(c.fullLocation),
          checkin: c.checkin,
          reviews: c.reviews,
          verified: c.verified,
          bookingDate: c.bookingDate,
          source: 'airbnb'
        });
      }
    }
  }

  // 2. Load existing airbnb-guests.json (has prices)
  const airbnbGuests = loadJSON('airbnb-guests.json');
  if (airbnbGuests) {
    console.log(`Loading airbnb-guests.json: ${airbnbGuests.length} clients`);
    for (const g of airbnbGuests) {
      const key = g.name?.toLowerCase();
      if (key && clients.has(key)) {
        const existing = clients.get(key);
        // Add price info
        if (g.price) existing.price = g.price;
        if (g.nights) existing.nights = g.nights;
        if (g.confirmationCode) existing.confirmationCode = g.confirmationCode;
      } else if (key) {
        // New client from this source
        let city = null, country = null;
        if (g.location) {
          const parts = g.location.split(',').map(p => p.trim());
          if (parts.length >= 2) {
            city = parts[0];
            country = normalizeCountry(parts[parts.length - 1]);
          } else {
            country = normalizeCountry(g.location);
          }
        }
        clients.set(key, {
          name: g.name,
          city,
          country,
          fullLocation: g.location,
          checkin: g.checkin,
          nights: g.nights,
          price: g.price,
          confirmationCode: g.confirmationCode,
          source: 'airbnb'
        });
      }
    }
  }

  // 3. Load all-reservations.json (has HomeExchange with email/phone)
  const allRes = loadJSON('all-reservations.json');
  if (allRes) {
    console.log(`Loading all-reservations.json: ${allRes.length} clients`);
    for (const r of allRes) {
      const key = r.name?.toLowerCase();
      if (key && !clients.has(key)) {
        clients.set(key, {
          name: r.name,
          city: r.city,
          country: normalizeCountry(r.country),
          fullLocation: r.fullLocation,
          checkin: r.checkin,
          checkout: r.checkout,
          nights: r.nights,
          guests: r.guests,
          price: r.totalPaid,
          email: r.email,
          phone: r.phone,
          confirmationCode: r.confirmationCode,
          source: r.source
        });
      } else if (key) {
        // Merge additional data
        const existing = clients.get(key);
        if (r.email && !existing.email) existing.email = r.email;
        if (r.phone && !existing.phone) existing.phone = r.phone;
        if (r.guests && !existing.guests) existing.guests = r.guests;
        if (r.checkout && !existing.checkout) existing.checkout = r.checkout;
      }
    }
  }

  // Convert to array and sort
  const clientList = Array.from(clients.values())
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  // Statistics
  const airbnbClients = clientList.filter(c => c.source === 'airbnb');
  const heClients = clientList.filter(c => c.source === 'homeexchange');
  const withLocation = clientList.filter(c => c.country);
  const withEmail = clientList.filter(c => c.email);
  const withPhone = clientList.filter(c => c.phone);

  // Country distribution
  const countries = {};
  clientList.forEach(c => {
    if (c.country) {
      countries[c.country] = (countries[c.country] || 0) + 1;
    }
  });

  console.log();
  console.log('='.repeat(70));
  console.log('                    STATISTIQUES FINALES');
  console.log('='.repeat(70));
  console.log();
  console.log(`Total clients uniques:   ${clientList.length}`);
  console.log(`  - Airbnb:              ${airbnbClients.length}`);
  console.log(`  - HomeExchange:        ${heClients.length}`);
  console.log(`Avec localisation:       ${withLocation.length}`);
  console.log(`Avec email:              ${withEmail.length}`);
  console.log(`Avec téléphone:          ${withPhone.length}`);
  console.log();

  console.log('PAYS D\'ORIGINE:');
  console.log('-'.repeat(40));
  Object.entries(countries)
    .sort((a, b) => b[1] - a[1])
    .forEach(([c, n]) => console.log(`  ${c}: ${n}`));

  console.log();
  console.log('='.repeat(70));
  console.log('                    LISTE COMPLETE DES CLIENTS');
  console.log('='.repeat(70));

  clientList.forEach((c, i) => {
    console.log();
    console.log(`${String(i + 1).padStart(2)}. ${(c.name || 'N/A').toUpperCase()}`);
    console.log(`    Source: ${c.source}`);
    if (c.fullLocation) console.log(`    Origine: ${c.fullLocation}`);
    else if (c.country) console.log(`    Pays: ${c.country}`);
    if (c.checkin) console.log(`    Check-in: ${c.checkin}`);
    if (c.nights) console.log(`    Nuits: ${c.nights}`);
    if (c.guests) console.log(`    Voyageurs: ${c.guests}`);
    if (c.price && c.price !== '0') console.log(`    Prix: ${c.price} EUR`);
    if (c.reviews) console.log(`    Avis: ${c.reviews} commentaires`);
    if (c.email) console.log(`    Email: ${c.email}`);
    if (c.phone) console.log(`    Tél: ${c.phone}`);
    if (c.confirmationCode) console.log(`    Code: ${c.confirmationCode}`);
  });

  // Save final merged data
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalClients: clientList.length,
      airbnbClients: airbnbClients.length,
      homeExchangeClients: heClients.length,
      withLocation: withLocation.length,
      withEmail: withEmail.length,
      withPhone: withPhone.length
    },
    countrySummary: countries,
    clients: clientList
  };

  const outputFile = path.join(DATA_DIR, 'all-clients-merged.json');
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log();
  console.log('='.repeat(70));
  console.log(`\nFichier JSON: ${outputFile}`);

  // CSV export
  const csvFile = path.join(DATA_DIR, 'all-clients-merged.csv');
  const csvHeader = 'Nom,Ville,Pays,Source,CheckIn,Checkout,Nuits,Voyageurs,Prix,Avis,Email,Téléphone,Code\n';
  const csvRows = clientList.map(c =>
    [
      c.name || '',
      c.city || '',
      c.country || '',
      c.source || '',
      c.checkin || '',
      c.checkout || '',
      c.nights || '',
      c.guests || '',
      c.price || '',
      c.reviews || '',
      c.email || '',
      c.phone || '',
      c.confirmationCode || ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  fs.writeFileSync(csvFile, csvHeader + csvRows);
  console.log(`Fichier CSV: ${csvFile}`);
}

main();
