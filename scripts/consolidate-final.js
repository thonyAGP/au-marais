// Consolidate all client data sources into one master file
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Normalize phone number for comparison
const normalizePhone = (phone) => {
  if (!phone) return null;
  return phone.replace(/[^\d\+]/g, '').replace(/^\+/, '');
};

// Normalize name for matching
const normalizeName = (name) => {
  if (!name) return '';
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z\s]/g, '')
    .trim();
};

// Calculate nights
const calculateNights = (checkin, checkout) => {
  if (!checkin || !checkout) return null;
  try {
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 && diff < 365 ? diff : null;
  } catch {
    return null;
  }
};

// Normalize price
const normalizePrice = (price) => {
  if (!price) return null;
  if (typeof price === 'number') return price;
  const num = parseFloat(price.toString().replace(/[€\s]/g, '').replace(',', '.'));
  return isNaN(num) ? null : num;
};

// Load JSON file safely
const loadJSON = (filename) => {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    return data.clients || data || [];
  } catch {
    return [];
  }
};

async function main() {
  console.log('='.repeat(70));
  console.log('   CONSOLIDATION FINALE - TOUTES LES SOURCES');
  console.log('='.repeat(70));
  console.log();

  // Load all sources
  const sources = {
    smoobu: loadJSON('smoobu-clients-complete.json'),
    emailConsolidated: loadJSON('clients-consolidated-final.json'),
    airbnbComplete: loadJSON('airbnb-clients-complete.json'),
    clientsFinal: loadJSON('clients-final.json')
  };

  console.log('Sources chargées:');
  Object.entries(sources).forEach(([name, data]) => {
    console.log(`  - ${name}: ${data.length} clients`);
  });

  // Master map: keyed by normalized name
  const masterMap = new Map();

  // Helper to merge client data
  const mergeClient = (existing, newData) => {
    // Prefer non-null values
    return {
      name: existing.name || newData.name,
      checkin: existing.checkin || newData.checkin,
      checkout: existing.checkout || newData.checkout,
      nights: existing.nights || newData.nights || calculateNights(existing.checkin || newData.checkin, existing.checkout || newData.checkout),
      guests: existing.guests || newData.guests,
      price: normalizePrice(existing.price) || normalizePrice(newData.price),
      city: existing.city || newData.city,
      country: existing.country || newData.country,
      phone: existing.phone || newData.phone || (existing.phones?.[0]) || (newData.phones?.[0]),
      email: existing.email || newData.email || (existing.emails?.[0]) || (newData.emails?.[0]),
      confirmationCode: existing.confirmationCode || newData.confirmationCode,
      channel: existing.channel || newData.channel,
      source: existing.source || newData.source,
      reviews: existing.reviews || newData.reviews,
      verified: existing.verified || newData.verified,
      notes: existing.notes || newData.notes,
      smoobuId: existing.smoobuId || newData.smoobuId
    };
  };

  // Process Smoobu first (best source for phone/price)
  console.log('\nProcessing Smoobu data...');
  for (const client of sources.smoobu) {
    if (!client.name || client.name === 'Unknown') continue;

    // Skip internal/test entries
    const nameLower = client.name.toLowerCase();
    if (nameLower.includes('renovation') || nameLower.includes('confirmer') ||
        nameLower.includes('pere de') || nameLower.includes('amie ') ||
        nameLower.includes('soeur ')) continue;

    const key = normalizeName(client.name);
    if (masterMap.has(key)) {
      masterMap.set(key, mergeClient(masterMap.get(key), client));
    } else {
      masterMap.set(key, { ...client });
    }
  }
  console.log(`  Added ${masterMap.size} clients from Smoobu`);

  // Process email-consolidated (has HomeExchange with emails/phones)
  console.log('\nProcessing email consolidated data...');
  let addedFromEmail = 0;
  for (const client of sources.emailConsolidated) {
    if (!client.name) continue;

    const key = normalizeName(client.name);
    if (masterMap.has(key)) {
      masterMap.set(key, mergeClient(masterMap.get(key), client));
    } else {
      masterMap.set(key, { ...client });
      addedFromEmail++;
    }
  }
  console.log(`  Added ${addedFromEmail} new clients from email consolidated`);

  // Process airbnb-complete (has reviews, verified status)
  console.log('\nProcessing Airbnb complete data...');
  let mergedFromAirbnb = 0;
  for (const client of sources.airbnbComplete) {
    if (!client.name) continue;

    const key = normalizeName(client.name);
    if (masterMap.has(key)) {
      masterMap.set(key, mergeClient(masterMap.get(key), client));
      mergedFromAirbnb++;
    }
  }
  console.log(`  Merged data for ${mergedFromAirbnb} existing clients`);

  // Convert to array and clean up
  let clients = [...masterMap.values()].map(c => ({
    name: c.name,
    checkin: c.checkin,
    checkout: c.checkout,
    nights: c.nights || calculateNights(c.checkin, c.checkout),
    guests: c.guests || c.adults,
    price: normalizePrice(c.price),
    city: c.city,
    country: c.country,
    phone: c.phone,
    email: c.email,
    confirmationCode: c.confirmationCode,
    channel: c.channel,
    source: c.source || 'unknown',
    reviews: c.reviews,
    verified: c.verified,
    smoobuId: c.smoobuId
  }));

  // Sort by checkin date (most recent first)
  clients.sort((a, b) => {
    const dateA = new Date(a.checkin || '1900-01-01');
    const dateB = new Date(b.checkin || '1900-01-01');
    return dateB - dateA;
  });

  // Statistics
  const stats = {
    total: clients.length,
    withCheckin: clients.filter(c => c.checkin).length,
    withCheckout: clients.filter(c => c.checkout).length,
    withNights: clients.filter(c => c.nights).length,
    withGuests: clients.filter(c => c.guests).length,
    withPrice: clients.filter(c => c.price).length,
    withPhone: clients.filter(c => c.phone).length,
    withEmail: clients.filter(c => c.email).length,
    withLocation: clients.filter(c => c.city || c.country).length,
    withCode: clients.filter(c => c.confirmationCode).length,
    totalNights: clients.reduce((sum, c) => sum + (c.nights || 0), 0),
    totalRevenue: clients.reduce((sum, c) => sum + (c.price || 0), 0),
    bySource: {},
    byCountry: {}
  };

  clients.forEach(c => {
    stats.bySource[c.source] = (stats.bySource[c.source] || 0) + 1;
    if (c.country) {
      stats.byCountry[c.country] = (stats.byCountry[c.country] || 0) + 1;
    }
  });

  // Display statistics
  console.log('\n' + '='.repeat(70));
  console.log('                    STATISTIQUES FINALES');
  console.log('='.repeat(70));
  console.log();
  console.log(`Total clients uniques:    ${stats.total}`);
  console.log();
  console.log('Données disponibles:');
  console.log(`  ✓ Check-in:             ${stats.withCheckin} (${Math.round(stats.withCheckin/stats.total*100)}%)`);
  console.log(`  ✓ Check-out:            ${stats.withCheckout} (${Math.round(stats.withCheckout/stats.total*100)}%)`);
  console.log(`  ✓ Nuits:                ${stats.withNights} (${Math.round(stats.withNights/stats.total*100)}%)`);
  console.log(`  ✓ Voyageurs:            ${stats.withGuests} (${Math.round(stats.withGuests/stats.total*100)}%)`);
  console.log(`  ✓ Prix:                 ${stats.withPrice} (${Math.round(stats.withPrice/stats.total*100)}%)`);
  console.log(`  ✓ Téléphone:            ${stats.withPhone} (${Math.round(stats.withPhone/stats.total*100)}%)`);
  console.log(`  ✓ Email:                ${stats.withEmail} (${Math.round(stats.withEmail/stats.total*100)}%)`);
  console.log(`  ✓ Localisation:         ${stats.withLocation} (${Math.round(stats.withLocation/stats.total*100)}%)`);
  console.log(`  ✓ Code confirmation:    ${stats.withCode} (${Math.round(stats.withCode/stats.total*100)}%)`);
  console.log();
  console.log(`📊 Total nuits:           ${stats.totalNights}`);
  console.log(`💰 Revenu total:          ${stats.totalRevenue.toFixed(2)} €`);
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
  console.log('                      LISTE COMPLÈTE DES CLIENTS');
  console.log('='.repeat(70));

  clients.forEach((c, i) => {
    console.log();
    console.log(`${(i + 1).toString().padStart(2)}. ${c.name.toUpperCase()} [${c.source}]`);
    if (c.checkin && c.checkout) {
      console.log(`    📅 ${c.checkin} → ${c.checkout} (${c.nights || '?'} nuits)`);
    } else if (c.checkin) {
      console.log(`    📅 ${c.checkin} (${c.nights || '?'} nuits)`);
    }
    if (c.guests) console.log(`    👥 ${c.guests} voyageurs`);
    if (c.price) console.log(`    💰 ${c.price.toFixed(2)} €`);
    if (c.city || c.country) console.log(`    📍 ${[c.city, c.country].filter(Boolean).join(', ')}`);
    if (c.phone) console.log(`    📱 ${c.phone}`);
    if (c.email) console.log(`    ✉️  ${c.email}`);
    if (c.confirmationCode && !c.confirmationCode.startsWith('SMB-')) {
      console.log(`    🔑 ${c.confirmationCode}`);
    }
    if (c.reviews) console.log(`    ⭐ ${c.reviews} avis`);
  });

  // Save final output
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      description: 'Liste consolidée finale de tous les clients Au Marais',
      sources: ['smoobu', 'email-api', 'airbnb-confirmations', 'homeexchange'],
      statistics: stats
    },
    clients
  };

  const jsonFile = path.join(DATA_DIR, 'MASTER-clients-final.json');
  fs.writeFileSync(jsonFile, JSON.stringify(output, null, 2));
  console.log(`\n\n✅ Fichier JSON: ${jsonFile}`);

  // CSV for Excel
  const csvHeader = 'Nom,Source,Canal,CheckIn,CheckOut,Nuits,Voyageurs,Prix,Pays,Ville,Téléphone,Email,Code,Avis\n';
  const csvRows = clients.map(c => [
    `"${(c.name || '').replace(/"/g, '""')}"`,
    c.source || '',
    `"${(c.channel || '').replace(/"/g, '""')}"`,
    c.checkin || '',
    c.checkout || '',
    c.nights || '',
    c.guests || '',
    c.price ? c.price.toFixed(2) : '',
    `"${(c.country || '').replace(/"/g, '""')}"`,
    `"${(c.city || '').replace(/"/g, '""')}"`,
    `"${(c.phone || '').replace(/"/g, '""')}"`,
    `"${(c.email || '').replace(/"/g, '""')}"`,
    `"${(c.confirmationCode || '').replace(/"/g, '""')}"`,
    c.reviews || ''
  ].join(',')).join('\n');

  const csvFile = path.join(DATA_DIR, 'MASTER-clients-final.csv');
  fs.writeFileSync(csvFile, csvHeader + csvRows);
  console.log(`✅ Fichier CSV:  ${csvFile}`);
}

main().catch(console.error);
