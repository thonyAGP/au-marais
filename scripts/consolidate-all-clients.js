const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// French month mapping for parsing
const MONTHS_FR = {
  'janv': '01', 'jan': '01', 'janvier': '01',
  'févr': '02', 'fév': '02', 'février': '02', 'fevr': '02',
  'mars': '03', 'mar': '03',
  'avr': '04', 'avril': '04',
  'mai': '05',
  'juin': '06', 'jun': '06',
  'juil': '07', 'juillet': '07', 'jul': '07',
  'août': '08', 'aout': '08', 'aoû': '08',
  'sept': '09', 'sep': '09', 'septembre': '09',
  'oct': '10', 'octobre': '10',
  'nov': '11', 'novembre': '11',
  'déc': '12', 'dec': '12', 'décembre': '12'
};

// Parse French date to ISO format
function normalizeDateToISO(dateStr, referenceYear = null) {
  if (!dateStr) return null;

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  // "20 février 2026" or "20 févr. 2026" or "20 févr."
  const match = dateStr.match(/(\d{1,2})\s*([a-zéûô\.]+)\s*(\d{4})?/i);
  if (!match) return null;

  const day = match[1].padStart(2, '0');
  const monthStr = match[2].replace('.', '').toLowerCase();
  const month = MONTHS_FR[monthStr];

  if (!month) return null;

  // Determine year
  let year = match[3];
  if (!year) {
    // Use reference year or current year
    year = referenceYear || new Date().getFullYear();
  }

  return `${year}-${month}-${day}`;
}

// Calculate nights between dates
function calculateNights(checkin, checkout) {
  if (!checkin || !checkout) return null;
  try {
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 && diff < 365 ? diff : null;
  } catch {
    return null;
  }
}

// Parse price string to number
function normalizePrice(priceStr) {
  if (!priceStr) return null;
  if (typeof priceStr === 'number') return priceStr;

  // "978,15" or "978.15" or "978,15 €"
  const cleaned = priceStr.toString().replace(/[€\s]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Merge client data from multiple sources
function mergeClients(clients1, clients2) {
  const merged = new Map();

  // Add first set
  for (const client of clients1) {
    const key = client.name.toLowerCase().trim();
    merged.set(key, { ...client });
  }

  // Merge second set
  for (const client of clients2) {
    const key = client.name.toLowerCase().trim();
    if (merged.has(key)) {
      // Merge data, preferring non-null values
      const existing = merged.get(key);
      for (const [field, value] of Object.entries(client)) {
        if (value !== null && value !== undefined && value !== '') {
          if (!existing[field] || existing[field] === null) {
            existing[field] = value;
          }
        }
      }
    } else {
      merged.set(key, { ...client });
    }
  }

  return [...merged.values()];
}

async function main() {
  console.log('='.repeat(70));
  console.log('   CONSOLIDATION FINALE DES CLIENTS');
  console.log('='.repeat(70));
  console.log();

  // Load all data sources
  const sources = [];

  // 1. Previous final extraction (has good HomeExchange data)
  const clientsFinalPath = path.join(DATA_DIR, 'clients-final.json');
  if (fs.existsSync(clientsFinalPath)) {
    const data = JSON.parse(fs.readFileSync(clientsFinalPath, 'utf-8'));
    console.log(`Loaded clients-final.json: ${data.clients.length} clients`);
    sources.push(...data.clients);
  }

  // 2. New Airbnb extraction (has better dates and codes)
  const airbnbPath = path.join(DATA_DIR, 'airbnb-clients-complete.json');
  if (fs.existsSync(airbnbPath)) {
    const data = JSON.parse(fs.readFileSync(airbnbPath, 'utf-8'));
    console.log(`Loaded airbnb-clients-complete.json: ${data.clients.length} clients`);
    sources.push(...data.clients);
  }

  // 3. Old Airbnb confirmations
  const airbnbConfPath = path.join(DATA_DIR, 'airbnb-confirmations.json');
  if (fs.existsSync(airbnbConfPath)) {
    const data = JSON.parse(fs.readFileSync(airbnbConfPath, 'utf-8'));
    console.log(`Loaded airbnb-confirmations.json: ${data.clients.length} clients`);
    sources.push(...data.clients);
  }

  console.log(`\nTotal records from all sources: ${sources.length}`);

  // Deduplicate and merge by name
  const clientMap = new Map();

  for (const client of sources) {
    const name = client.name?.trim();
    if (!name) continue;

    const key = name.toLowerCase();

    if (clientMap.has(key)) {
      // Merge with existing
      const existing = clientMap.get(key);

      // Merge arrays (phones, emails)
      if (client.phones?.length) {
        existing.phones = [...new Set([...(existing.phones || []), ...client.phones])];
      }
      if (client.emails?.length) {
        existing.emails = [...new Set([...(existing.emails || []), ...client.emails])];
      }

      // Merge scalar fields (prefer non-null)
      const fields = ['checkin', 'checkout', 'nights', 'guests', 'price',
                      'city', 'country', 'confirmationCode', 'email', 'phone',
                      'reviews', 'verified', 'bookingDate', 'fullLocation'];

      for (const field of fields) {
        const newVal = client[field];
        const oldVal = existing[field];

        if (newVal !== null && newVal !== undefined && newVal !== '') {
          // For dates, prefer ISO format
          if (field === 'checkin' || field === 'checkout') {
            const newISO = normalizeDateToISO(newVal);
            const oldISO = normalizeDateToISO(oldVal);
            if (newISO && (!oldISO || newISO > oldISO)) {
              existing[field] = newISO;
            } else if (!existing[field]) {
              existing[field] = newVal;
            }
          } else if (!oldVal || oldVal === null) {
            existing[field] = newVal;
          }
        }
      }
    } else {
      // New client
      clientMap.set(key, {
        name,
        checkin: client.checkin || null,
        checkout: client.checkout || null,
        nights: client.nights || null,
        guests: client.guests || null,
        price: normalizePrice(client.price),
        city: client.city || null,
        country: client.country || null,
        phones: client.phones || (client.phone ? [client.phone] : []),
        emails: client.emails || (client.email ? [client.email] : []),
        confirmationCode: client.confirmationCode || null,
        reviews: client.reviews || null,
        verified: client.verified || false,
        bookingDate: client.bookingDate || null,
        source: client.source || 'unknown'
      });
    }
  }

  // Convert to array and normalize
  let clients = [...clientMap.values()];

  // Normalize all dates and calculate nights
  for (const client of clients) {
    // Normalize dates to ISO
    if (client.checkin && !/^\d{4}-\d{2}-\d{2}$/.test(client.checkin)) {
      const year = client.bookingDate ? new Date(client.bookingDate).getFullYear() : 2025;
      client.checkin = normalizeDateToISO(client.checkin, year);
    }
    if (client.checkout && !/^\d{4}-\d{2}-\d{2}$/.test(client.checkout)) {
      const year = client.bookingDate ? new Date(client.bookingDate).getFullYear() : 2025;
      client.checkout = normalizeDateToISO(client.checkout, year);
    }

    // Calculate nights if missing
    if (!client.nights && client.checkin && client.checkout) {
      client.nights = calculateNights(client.checkin, client.checkout);
    }

    // Merge phone arrays with single phone field
    if (client.phone && !client.phones.includes(client.phone)) {
      client.phones.unshift(client.phone);
    }
    delete client.phone;

    // Merge email arrays with single email field
    if (client.email && !client.emails.includes(client.email)) {
      client.emails.unshift(client.email);
    }
    delete client.email;

    // Clean up fullLocation
    if (!client.city && !client.country && client.fullLocation) {
      if (client.fullLocation.includes(',')) {
        const parts = client.fullLocation.split(',').map(p => p.trim());
        client.city = parts[0];
        client.country = parts[parts.length - 1];
      } else {
        client.country = client.fullLocation;
      }
    }
    delete client.fullLocation;
  }

  // Sort by most recent first (booking date or checkin date)
  clients.sort((a, b) => {
    const dateA = a.bookingDate || a.checkin || '1900-01-01';
    const dateB = b.bookingDate || b.checkin || '1900-01-01';
    return new Date(dateB) - new Date(dateA);
  });

  // Calculate statistics
  const stats = {
    total: clients.length,
    airbnb: clients.filter(c => c.source === 'airbnb').length,
    homeexchange: clients.filter(c => c.source === 'homeexchange').length,
    withCheckin: clients.filter(c => c.checkin).length,
    withCheckout: clients.filter(c => c.checkout).length,
    withNights: clients.filter(c => c.nights).length,
    withGuests: clients.filter(c => c.guests).length,
    withPrice: clients.filter(c => c.price).length,
    withPhone: clients.filter(c => c.phones?.length > 0).length,
    withEmail: clients.filter(c => c.emails?.length > 0).length,
    withLocation: clients.filter(c => c.city || c.country).length,
    withCode: clients.filter(c => c.confirmationCode).length,
    totalNights: clients.reduce((sum, c) => sum + (c.nights || 0), 0),
    totalRevenue: clients.reduce((sum, c) => sum + (c.price || 0), 0),
    countries: {}
  };

  clients.forEach(c => {
    if (c.country) {
      stats.countries[c.country] = (stats.countries[c.country] || 0) + 1;
    }
  });

  // Display results
  console.log('\n' + '='.repeat(70));
  console.log('                         STATISTIQUES');
  console.log('='.repeat(70));
  console.log();
  console.log(`Total clients uniques:    ${stats.total}`);
  console.log(`  - Airbnb:               ${stats.airbnb}`);
  console.log(`  - HomeExchange:         ${stats.homeexchange}`);
  console.log();
  console.log(`Données disponibles:`);
  console.log(`  - Check-in:             ${stats.withCheckin} (${Math.round(stats.withCheckin/stats.total*100)}%)`);
  console.log(`  - Check-out:            ${stats.withCheckout} (${Math.round(stats.withCheckout/stats.total*100)}%)`);
  console.log(`  - Nuits:                ${stats.withNights} (${Math.round(stats.withNights/stats.total*100)}%)`);
  console.log(`  - Voyageurs:            ${stats.withGuests} (${Math.round(stats.withGuests/stats.total*100)}%)`);
  console.log(`  - Prix:                 ${stats.withPrice} (${Math.round(stats.withPrice/stats.total*100)}%)`);
  console.log(`  - Téléphone:            ${stats.withPhone} (${Math.round(stats.withPhone/stats.total*100)}%)`);
  console.log(`  - Email:                ${stats.withEmail} (${Math.round(stats.withEmail/stats.total*100)}%)`);
  console.log(`  - Localisation:         ${stats.withLocation} (${Math.round(stats.withLocation/stats.total*100)}%)`);
  console.log(`  - Code confirmation:    ${stats.withCode} (${Math.round(stats.withCode/stats.total*100)}%)`);
  console.log();
  console.log(`Total nuits:              ${stats.totalNights}`);
  console.log(`Revenu total:             ${stats.totalRevenue.toFixed(2)} €`);

  if (Object.keys(stats.countries).length > 0) {
    console.log('\nPays d\'origine:');
    console.log('-'.repeat(40));
    Object.entries(stats.countries)
      .sort((a, b) => b[1] - a[1])
      .forEach(([country, count]) => console.log(`  ${country}: ${count}`));
  }

  // Display detailed list
  console.log('\n' + '='.repeat(70));
  console.log('                      LISTE COMPLÈTE DES CLIENTS');
  console.log('='.repeat(70));

  clients.forEach((c, i) => {
    console.log();
    console.log(`${(i + 1).toString().padStart(2)}. ${c.name.toUpperCase()} [${c.source}]`);

    if (c.checkin || c.checkout) {
      const dates = [c.checkin, c.checkout].filter(Boolean).join(' → ');
      const nights = c.nights ? ` (${c.nights} nuits)` : '';
      console.log(`    📅 Dates:     ${dates}${nights}`);
    }

    if (c.guests) console.log(`    👥 Voyageurs: ${c.guests}`);
    if (c.price) console.log(`    💰 Prix:      ${c.price.toFixed(2)} €`);
    if (c.city || c.country) console.log(`    📍 Origine:   ${[c.city, c.country].filter(Boolean).join(', ')}`);
    if (c.phones?.length) console.log(`    📱 Tél:       ${c.phones.join(', ')}`);
    if (c.emails?.length) console.log(`    ✉️  Email:     ${c.emails.join(', ')}`);
    if (c.confirmationCode) console.log(`    🔑 Code:      ${c.confirmationCode}`);
    if (c.reviews) console.log(`    ⭐ Avis:      ${c.reviews} commentaires`);
  });

  // Save final consolidated file
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      description: 'Liste consolidée de tous les clients Au Marais (Airbnb + HomeExchange)',
      statistics: stats
    },
    clients
  };

  const jsonFile = path.join(DATA_DIR, 'clients-consolidated-final.json');
  fs.writeFileSync(jsonFile, JSON.stringify(output, null, 2));
  console.log(`\n\n✅ Fichier JSON: ${jsonFile}`);

  // Save CSV for easy viewing in Excel
  const csvHeader = 'Nom,Source,CheckIn,CheckOut,Nuits,Voyageurs,Prix,Ville,Pays,Téléphone,Email,Code,Avis\n';
  const csvRows = clients.map(c => [
    `"${c.name}"`,
    c.source,
    c.checkin || '',
    c.checkout || '',
    c.nights || '',
    c.guests || '',
    c.price ? c.price.toFixed(2) : '',
    `"${c.city || ''}"`,
    `"${c.country || ''}"`,
    `"${c.phones?.join('; ') || ''}"`,
    `"${c.emails?.join('; ') || ''}"`,
    c.confirmationCode || '',
    c.reviews || ''
  ].join(',')).join('\n');

  const csvFile = path.join(DATA_DIR, 'clients-consolidated-final.csv');
  fs.writeFileSync(csvFile, csvHeader + csvRows);
  console.log(`✅ Fichier CSV:  ${csvFile}`);
}

main().catch(console.error);
