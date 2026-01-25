const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000';
const API_KEY = 'dev-api-key-change-me-in-production';
const OUTPUT_DIR = path.join(__dirname, '..', 'data');

// Regex patterns for Airbnb email extraction
const extractAirbnbInfo = (bodyPreview, subject, receivedAt) => {
  const text = bodyPreview || '';

  // Extract guest name from subject or body
  const subjectMatch = subject?.match(/Réservation.*?(\d+)[–-](\d+)\s*([a-zéûô]+\.?)/i);
  const nameFromBody = text.match(/^([A-Za-zÀ-ÿ\-]+)\s*\n*Responsable/m);

  // Extract dates from subject
  const datesMatch = subject?.match(/(\d+)[–-](\d+)\s*([a-zéûô]+\.?)/i);

  // Extract location from body
  const locationMatch = text.match(/vient de\s+([A-Za-zÀ-ÿ\-,\s]+?)(?:\.|et|,|\n)/i) ||
                        text.match(/from\s+([A-Za-zÀ-ÿ\-,\s]+?)(?:\.|and|,|\n)/i);

  // Extract phone
  const phoneMatch = text.match(/(?:téléphone|phone|tel)[^\d]*(\+?[\d\s\-]+)/i) ||
                     text.match(/(\+\d{2}\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{2})/);

  // Extract confirmation code
  const codeMatch = text.match(/(?:code|confirmation)[^\w]*([A-Z0-9]{10,})/i) ||
                    subject?.match(/HM[A-Z0-9]{8,}/i);

  let city = null, country = null, fullLocation = null;
  if (locationMatch) {
    fullLocation = locationMatch[1].trim();
    if (fullLocation.includes(',')) {
      const parts = fullLocation.split(',').map(p => p.trim());
      city = parts[0];
      country = parts[parts.length - 1];
    } else {
      country = fullLocation;
    }
  }

  return {
    name: nameFromBody ? nameFromBody[1].trim() : null,
    city,
    country,
    fullLocation,
    checkin: datesMatch ? `${datesMatch[1]} ${datesMatch[3]}` : null,
    checkout: datesMatch ? `${datesMatch[2]} ${datesMatch[3]}` : null,
    phone: phoneMatch ? phoneMatch[1].replace(/\s+/g, '') : null,
    confirmationCode: codeMatch ? codeMatch[1] || codeMatch[0] : null,
    bookingDate: receivedAt,
    source: 'airbnb-email-api',
    subject
  };
};

async function fetchEmails(from, limit = 100, offset = 0) {
  const url = `${API_URL}/api/emails?from=${encodeURIComponent(from)}&limit=${limit}&offset=${offset}`;
  const response = await fetch(url, {
    headers: { 'x-api-key': API_KEY }
  });
  const data = await response.json();
  return data;
}

async function fetchEmailDetail(id) {
  const url = `${API_URL}/api/emails/${id}`;
  const response = await fetch(url, {
    headers: { 'x-api-key': API_KEY }
  });
  const data = await response.json();
  return data.data;
}

async function main() {
  console.log('='.repeat(60));
  console.log('    EXTRACTION RESERVATIONS AIRBNB VIA EMAIL ASSISTANT API');
  console.log('='.repeat(60));
  console.log();

  const allReservations = [];
  const processedCodes = new Set();
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  // Fetch all Airbnb emails
  while (hasMore) {
    console.log(`Fetching emails ${offset}-${offset + limit}...`);

    const result = await fetchEmails('airbnb', limit, offset);

    if (!result.success || !result.data || result.data.length === 0) {
      hasMore = false;
      break;
    }

    for (const email of result.data) {
      // Skip non-reservation emails
      if (!email.subject?.includes('Réservation') && !email.subject?.includes('Reservation')) {
        continue;
      }

      // Get full email content if bodyPreview is short
      let bodyText = email.bodyPreview;
      if (bodyText && bodyText.length > 50) {
        // Use bodyPreview for now, could fetch full content if needed
      }

      const info = extractAirbnbInfo(bodyText, email.subject, email.receivedAt);

      if (info.name) {
        const key = info.confirmationCode || `${info.name}-${info.checkin}`;
        if (!processedCodes.has(key)) {
          processedCodes.add(key);
          info.emailId = email.id;
          allReservations.push(info);
        }
      }
    }

    hasMore = result.pagination?.hasMore ?? (result.data.length >= limit);
    offset += limit;
  }

  console.log();
  console.log('='.repeat(60));
  console.log(`  RESULTAT: ${allReservations.length} reservations extraites`);
  console.log('='.repeat(60));

  // Show results
  allReservations.forEach((r, i) => {
    console.log();
    console.log(`${i + 1}. ${(r.name || 'Unknown').toUpperCase()}`);
    if (r.fullLocation) console.log(`   Origine: ${r.fullLocation}`);
    if (r.checkin) console.log(`   Dates: ${r.checkin} - ${r.checkout || '?'}`);
    if (r.phone) console.log(`   Tel: ${r.phone}`);
    if (r.confirmationCode) console.log(`   Code: ${r.confirmationCode}`);
  });

  // Save results
  const outputFile = path.join(OUTPUT_DIR, 'airbnb-from-email-api.json');
  fs.writeFileSync(outputFile, JSON.stringify(allReservations, null, 2));
  console.log();
  console.log(`Fichier sauvegarde: ${outputFile}`);

  // Country stats
  const countries = {};
  allReservations.forEach(r => {
    if (r.country) {
      countries[r.country] = (countries[r.country] || 0) + 1;
    }
  });

  if (Object.keys(countries).length > 0) {
    console.log();
    console.log('Pays:');
    Object.entries(countries)
      .sort((a, b) => b[1] - a[1])
      .forEach(([c, n]) => console.log(`  - ${c}: ${n}`));
  }
}

main().catch(console.error);
