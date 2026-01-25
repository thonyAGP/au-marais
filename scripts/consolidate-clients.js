const fs = require('fs');
const path = require('path');

// Load all data sources
const allReservations = JSON.parse(fs.readFileSync('data/all-reservations.json', 'utf8'));
const airbnbGuests = JSON.parse(fs.readFileSync('data/airbnb-guests.json', 'utf8'));
const guestsLocations = JSON.parse(fs.readFileSync('data/guests-locations.json', 'utf8'));

// Create consolidated client list
const clients = new Map();

// Add from all-reservations.json (most detailed)
allReservations.forEach(r => {
  const key = r.confirmationCode || r.name;
  clients.set(key, {
    name: r.name,
    city: r.city,
    country: r.country,
    fullLocation: r.fullLocation,
    checkin: r.checkin,
    checkout: r.checkout,
    guests: r.guests,
    nights: r.nights,
    totalPaid: r.totalPaid,
    hostEarnings: r.hostEarnings,
    cleaningFee: r.cleaningFee,
    taxes: r.taxes,
    confirmationCode: r.confirmationCode,
    email: r.email || null,
    phone: r.phone || null,
    source: r.source
  });
});

// Add from airbnb-guests.json (has prices and locations)
airbnbGuests.forEach(g => {
  const key = g.confirmationCode;
  if (!clients.has(key)) {
    // Parse location
    let city = null, country = null;
    if (g.location) {
      const parts = g.location.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        city = parts[0];
        country = parts[parts.length - 1];
      } else {
        country = g.location;
      }
    }

    clients.set(key, {
      name: g.name,
      city,
      country,
      fullLocation: g.location,
      checkin: g.checkin,
      checkout: g.checkout,
      guests: g.guests,
      nights: g.nights,
      totalPaid: g.price,
      hostEarnings: null,
      cleaningFee: null,
      taxes: null,
      confirmationCode: g.confirmationCode,
      email: null,
      phone: null,
      source: 'airbnb'
    });
  }
});

// Convert to array and sort by name
const clientsList = Array.from(clients.values())
  .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

// Summary stats
const airbnbClients = clientsList.filter(c => c.source === 'airbnb');
const heClients = clientsList.filter(c => c.source === 'homeexchange');
const withEmail = clientsList.filter(c => c.email);
const withPhone = clientsList.filter(c => c.phone);
const withLocation = clientsList.filter(c => c.country);

// Country distribution
const countries = {};
clientsList.forEach(c => {
  if (c.country) {
    // Normalize country names
    let country = c.country;
    if (['FL', 'NC'].includes(country)) country = 'United States';
    if (country === 'DF') country = 'Brazil';
    countries[country] = (countries[country] || 0) + 1;
  }
});

// Calculate total revenue (Airbnb only)
const totalRevenue = airbnbClients
  .filter(c => c.totalPaid)
  .reduce((sum, c) => {
    const val = String(c.totalPaid).replace(/\s/g, '').replace(',', '.');
    return sum + (parseFloat(val) || 0);
  }, 0);

const totalNights = clientsList
  .filter(c => c.nights)
  .reduce((sum, c) => sum + c.nights, 0);

console.log('='.repeat(70));
console.log('                    LISTE CONSOLIDEE DES CLIENTS');
console.log('='.repeat(70));
console.log();
console.log('STATISTIQUES:');
console.log('-'.repeat(40));
console.log(`Total clients uniques:  ${clientsList.length}`);
console.log(`  - Airbnb:             ${airbnbClients.length}`);
console.log(`  - HomeExchange:       ${heClients.length}`);
console.log(`Avec email:             ${withEmail.length}`);
console.log(`Avec telephone:         ${withPhone.length}`);
console.log(`Avec localisation:      ${withLocation.length}`);
console.log();
console.log(`Total nuits reservees:  ${totalNights}`);
console.log(`Revenus Airbnb:         ${totalRevenue.toFixed(2)} EUR`);
console.log();

console.log("PAYS D'ORIGINE:");
console.log('-'.repeat(40));
Object.entries(countries)
  .sort((a, b) => b[1] - a[1])
  .forEach(([c, n]) => console.log(`  - ${c}: ${n}`));

console.log();
console.log('='.repeat(70));
console.log('                         DETAILS CLIENTS');
console.log('='.repeat(70));

// Print clients with all details
clientsList.forEach((c, i) => {
  console.log();
  console.log(`${i + 1}. ${(c.name || 'N/A').toUpperCase()}`);
  console.log(`   Source: ${c.source}`);
  if (c.fullLocation || c.country) console.log(`   Origine: ${c.fullLocation || c.country}`);
  if (c.checkin) console.log(`   Check-in: ${c.checkin}`);
  if (c.checkout) console.log(`   Check-out: ${c.checkout}`);
  if (c.nights) console.log(`   Nuits: ${c.nights}`);
  if (c.guests) console.log(`   Voyageurs: ${c.guests}`);
  if (c.totalPaid && c.totalPaid !== '0') console.log(`   Prix total: ${c.totalPaid} EUR`);
  if (c.hostEarnings && c.hostEarnings !== '0') console.log(`   Gains hote: ${c.hostEarnings} EUR`);
  if (c.taxes) console.log(`   Taxes: ${c.taxes} EUR`);
  if (c.email) console.log(`   Email: ${c.email}`);
  if (c.phone) console.log(`   Tel: ${c.phone}`);
  if (c.confirmationCode) console.log(`   Code: ${c.confirmationCode}`);
});

console.log();
console.log('='.repeat(70));

// Save consolidated JSON
const output = {
  metadata: {
    generatedAt: new Date().toISOString(),
    totalClients: clientsList.length,
    airbnbClients: airbnbClients.length,
    homeExchangeClients: heClients.length,
    withEmail: withEmail.length,
    withPhone: withPhone.length,
    totalNights: totalNights,
    totalRevenue: totalRevenue.toFixed(2)
  },
  countrySummary: countries,
  clients: clientsList
};

fs.writeFileSync('data/consolidated-clients.json', JSON.stringify(output, null, 2));
console.log();
console.log('Fichier sauvegarde: data/consolidated-clients.json');

// Save CSV for Excel
const csvRows = ['Nom,Ville,Pays,CheckIn,CheckOut,Nuits,Voyageurs,PrixTotal,GainsHote,Taxes,Email,Telephone,Code,Source'];
clientsList.forEach(c => {
  csvRows.push([
    c.name || '',
    c.city || '',
    c.country || '',
    c.checkin || '',
    c.checkout || '',
    c.nights || '',
    c.guests || '',
    c.totalPaid || '',
    c.hostEarnings || '',
    c.taxes || '',
    c.email || '',
    c.phone || '',
    c.confirmationCode || '',
    c.source || ''
  ].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','));
});
fs.writeFileSync('data/consolidated-clients.csv', csvRows.join('\n'));
console.log('Fichier CSV: data/consolidated-clients.csv');
