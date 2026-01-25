const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000';
const API_KEY = 'dev-api-key-change-me-in-production';
const OUTPUT_DIR = path.join(__dirname, '..', 'data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// French month mapping
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

// Parse French date string to ISO date
function parseFrenchDate(dateStr, defaultYear = new Date().getFullYear()) {
  if (!dateStr) return null;

  // Format: "20 févr. 2025" or "20 févr" or "6 mars"
  const match = dateStr.match(/(\d{1,2})\s*([a-zéûô\.]+)\s*(\d{4})?/i);
  if (!match) return null;

  const day = match[1].padStart(2, '0');
  const monthStr = match[2].replace('.', '').toLowerCase();
  const month = MONTHS_FR[monthStr];
  const year = match[3] || defaultYear;

  if (!month) return null;
  return `${year}-${month}-${day}`;
}

// Parse date range like "6–14 mars" or "16–19 avr."
function parseDateRange(text, defaultYear = new Date().getFullYear()) {
  // Pattern: "6–14 mars" or "6-14 mars" or "du 6 au 14 mars"
  const rangeMatch = text.match(/(\d{1,2})\s*[–\-]\s*(\d{1,2})\s+([a-zéûô\.]+)/i);
  if (rangeMatch) {
    const startDay = rangeMatch[1].padStart(2, '0');
    const endDay = rangeMatch[2].padStart(2, '0');
    const monthStr = rangeMatch[3].replace('.', '').toLowerCase();
    const month = MONTHS_FR[monthStr];
    if (month) {
      return {
        checkin: `${defaultYear}-${month}-${startDay}`,
        checkout: `${defaultYear}-${month}-${endDay}`
      };
    }
  }

  // Pattern: "du 6 mars au 14 mars"
  const fullMatch = text.match(/(\d{1,2})\s*([a-zéûô\.]+)\s*(?:au|->|→)\s*(\d{1,2})\s*([a-zéûô\.]+)/i);
  if (fullMatch) {
    const checkin = parseFrenchDate(`${fullMatch[1]} ${fullMatch[2]}`, defaultYear);
    const checkout = parseFrenchDate(`${fullMatch[3]} ${fullMatch[4]}`, defaultYear);
    if (checkin && checkout) {
      return { checkin, checkout };
    }
  }

  return null;
}

// Calculate nights between two dates
function calculateNights(checkin, checkout) {
  if (!checkin || !checkout) return null;
  const start = new Date(checkin);
  const end = new Date(checkout);
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : null;
}

// Extract phone numbers from text
function extractPhones(text) {
  if (!text) return [];

  const phones = new Set();
  const patterns = [
    /\+\d{1,3}[\s\-]?\d{2,4}[\s\-]?\d{2,4}[\s\-]?\d{2,4}[\s\-]?\d{0,4}/g,
    /(?:téléphone|phone|tel|tél|whatsapp|numéro)\s*:?\s*([\d\s\-\+\(\)]{10,})/gi
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const m of matches) {
        const cleaned = m.replace(/[^\d\+]/g, '');
        if (cleaned.length >= 10) {
          phones.add(cleaned);
        }
      }
    }
  }

  return [...phones];
}

// Extract email addresses from text
function extractEmails(text) {
  if (!text) return [];

  const emailMatch = text.match(/[\w\.\-]+@[\w\.\-]+\.[a-z]{2,}/gi);
  if (!emailMatch) return [];

  // Filter out Airbnb and host emails
  return emailMatch.filter(e =>
    !e.toLowerCase().includes('airbnb') &&
    !e.toLowerCase().includes('au-marais') &&
    !e.toLowerCase().includes('hotmail.com')
  );
}

// Extract price from text
function extractPrice(text) {
  if (!text) return null;

  const patterns = [
    /total\s*:?\s*([\d\s,\.]+)\s*€/i,
    /montant\s*:?\s*([\d\s,\.]+)\s*€/i,
    /([\d\s,\.]+)\s*€\s*EUR/i,
    /versement.*?([\d\s,\.]+)\s*€/i,
    /vous avez reçu.*?([\d\s,\.]+)\s*€/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const price = parseFloat(match[1].replace(/\s/g, '').replace(',', '.'));
      if (price > 50 && price < 10000) { // Reasonable price range
        return price;
      }
    }
  }

  return null;
}

// Extract number of guests
function extractGuests(text) {
  if (!text) return null;

  const match = text.match(/(\d+)\s*(?:voyageurs?|adultes?|personnes?|clients?|guests?)/i);
  return match ? parseInt(match[1], 10) : null;
}

// Extract confirmation code
function extractConfirmationCode(text) {
  if (!text) return null;

  const patterns = [
    /code de confirmation\s*:?\s*([A-Z0-9]{8,12})/i,
    /confirmation\s*:?\s*([A-Z0-9]{8,12})/i,
    /\b(HM[A-Z0-9]{6,10})\b/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Parse location from text
function parseLocation(text) {
  if (!text) return { city: null, country: null };

  // Pattern for "City, Country" or just "Country"
  const patterns = [
    /commentaires?\s*[\r\n]+([A-Za-zÀ-ÿ\s,\-]+?)[\r\n]+(?:Envoy|Message|Votre)/i,
    /vérifiée\s*[\r\n]+([A-Za-zÀ-ÿ\s,\-]+?)[\r\n]+(?:Envoy|Message)/i,
    /identité vérifiée[^\r\n]*[\r\n]+([A-Za-zÀ-ÿ\s,\-]+?)[\r\n]/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const location = match[1].trim();
      if (location.includes(',')) {
        const parts = location.split(',').map(p => p.trim());
        return { city: parts[0], country: parts[parts.length - 1] };
      }
      return { city: null, country: location };
    }
  }

  return { city: null, country: null };
}

// Fetch all emails from API with pagination
async function fetchAllEmails(query = {}) {
  const allEmails = [];
  let offset = 0;
  const limit = 100;

  const queryStr = Object.entries(query)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

  while (true) {
    const url = `${API_URL}/api/emails?${queryStr}&limit=${limit}&offset=${offset}`;
    const resp = await fetch(url, {
      headers: { 'x-api-key': API_KEY }
    });
    const data = await resp.json();

    if (!data.success || !data.data || data.data.length === 0) break;
    allEmails.push(...data.data);

    if (!data.pagination?.hasMore) break;
    offset += limit;
  }

  return allEmails;
}

// Fetch detailed email body
async function fetchEmailDetail(emailId) {
  try {
    const resp = await fetch(`${API_URL}/api/emails/${emailId}`, {
      headers: { 'x-api-key': API_KEY }
    });
    const data = await resp.json();
    return data.success ? data.data : null;
  } catch (e) {
    return null;
  }
}

// Parse confirmation email subject
function parseConfirmationSubject(subject) {
  const result = {};

  // Extract name: "Réservation confirmée : [Name] arrive le [date]"
  const nameMatch = subject.match(/confirmée\s*:\s*([A-Za-zÀ-ÿ\s\-]+?)\s+arrive/i);
  if (nameMatch) result.name = nameMatch[1].trim();

  // Extract check-in date from subject
  const dateMatch = subject.match(/arrive le\s+(\d+\s*[a-zéûô\.]+)/i);
  if (dateMatch) result.checkinRaw = dateMatch[1].trim();

  return result;
}

// Parse reservation subject for dates
function parseReservationSubject(subject) {
  // "Objet : Réservation pour Au Marais - appartement à Paris, 6–14 mars"
  const yearMatch = new Date().getFullYear();

  return parseDateRange(subject, yearMatch);
}

async function main() {
  console.log('='.repeat(70));
  console.log('   EXTRACTION COMPLÈTE CLIENTS AIRBNB');
  console.log('='.repeat(70));
  console.log();

  // Fetch all Airbnb emails
  console.log('Fetching Airbnb emails...');
  const airbnbEmails = await fetchAllEmails({ from: 'airbnb' });
  console.log(`Found ${airbnbEmails.length} Airbnb emails\n`);

  // Categorize emails
  const confirmations = [];
  const reservations = [];
  const conversations = [];
  const payouts = [];

  for (const email of airbnbEmails) {
    const subject = (email.subject || '').toLowerCase();

    if (subject.includes('confirmée') && subject.includes('arrive')) {
      confirmations.push(email);
    } else if (subject.includes('réservation pour au marais')) {
      reservations.push(email);
    } else if (subject.includes('message') || subject.includes('conversation')) {
      conversations.push(email);
    } else if (subject.includes('versement') || subject.includes('reçu')) {
      payouts.push(email);
    }
  }

  console.log('Email categories:');
  console.log(`- Confirmations:  ${confirmations.length}`);
  console.log(`- Reservations:   ${reservations.length}`);
  console.log(`- Conversations:  ${conversations.length}`);
  console.log(`- Payouts:        ${payouts.length}`);
  console.log();

  // Process confirmations to extract client data
  const clients = new Map(); // name -> client data

  console.log('Processing confirmations...');
  for (const email of confirmations) {
    const parsed = parseConfirmationSubject(email.subject);
    if (!parsed.name) continue;

    const name = parsed.name;

    // Get detailed email body
    const detail = await fetchEmailDetail(email.id);
    const fullText = [
      email.bodyPreview || '',
      detail?.bodyText || '',
      detail?.bodyHtml?.replace(/<[^>]+>/g, ' ') || ''
    ].join(' ');

    // Extract all info
    const location = parseLocation(fullText);
    const checkinDate = parseFrenchDate(parsed.checkinRaw, new Date(email.receivedAt).getFullYear());

    const client = {
      name,
      checkin: checkinDate,
      checkout: null,
      nights: null,
      guests: extractGuests(fullText),
      price: extractPrice(fullText),
      confirmationCode: extractConfirmationCode(fullText),
      phones: extractPhones(fullText),
      emails: extractEmails(fullText),
      city: location.city,
      country: location.country,
      reviews: null,
      verified: fullText.toLowerCase().includes('identité vérifiée'),
      bookingDate: email.receivedAt,
      source: 'airbnb',
      rawSubject: email.subject
    };

    // Extract reviews count
    const reviewsMatch = fullText.match(/(\d+)\s*commentaires?/i);
    if (reviewsMatch) client.reviews = parseInt(reviewsMatch[1], 10);

    if (!clients.has(name) || new Date(client.bookingDate) > new Date(clients.get(name).bookingDate)) {
      clients.set(name, client);
    }

    process.stdout.write('.');
  }
  console.log();

  // Try to find checkout dates from reservation emails
  console.log('\nEnriching with reservation emails...');
  for (const email of reservations) {
    const dates = parseReservationSubject(email.subject);
    if (!dates) continue;

    // Find matching client by date
    for (const [name, client] of clients) {
      if (client.checkin === dates.checkin ||
          (client.checkin && dates.checkin && client.checkin.substring(5) === dates.checkin.substring(5))) {
        client.checkout = dates.checkout;
        client.nights = calculateNights(dates.checkin, dates.checkout);
        process.stdout.write('+');
        break;
      }
    }
  }
  console.log();

  // Try to find prices from payout emails
  console.log('\nEnriching with payout emails...');
  for (const email of payouts) {
    const detail = await fetchEmailDetail(email.id);
    const fullText = [email.bodyPreview || '', detail?.bodyText || ''].join(' ');
    const price = extractPrice(fullText);

    if (price) {
      // Try to match by date proximity
      const payoutDate = new Date(email.receivedAt);
      for (const [name, client] of clients) {
        if (!client.price && client.checkin) {
          const checkinDate = new Date(client.checkin);
          const daysDiff = Math.abs((payoutDate - checkinDate) / (1000 * 60 * 60 * 24));
          if (daysDiff < 14) { // Within 2 weeks
            client.price = price;
            client.priceSource = 'payout';
            process.stdout.write('$');
            break;
          }
        }
      }
    }
  }
  console.log();

  // Try to find phones from conversations
  console.log('\nSearching conversations for phones...');
  for (const email of conversations) {
    const fullText = email.bodyPreview || '';
    const phones = extractPhones(fullText);

    if (phones.length > 0) {
      // Try to match by sender or date
      for (const [name, client] of clients) {
        if (client.phones.length === 0) {
          // Check if conversation is around same time
          const convDate = new Date(email.receivedAt);
          const bookingDate = new Date(client.bookingDate);
          const daysDiff = Math.abs((convDate - bookingDate) / (1000 * 60 * 60 * 24));
          if (daysDiff < 30) {
            client.phones = phones;
            process.stdout.write('☎');
            break;
          }
        }
      }
    }
  }
  console.log();

  // Convert to array and sort
  const clientList = [...clients.values()]
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  // Calculate statistics
  const stats = {
    total: clientList.length,
    withPrice: clientList.filter(c => c.price).length,
    withPhone: clientList.filter(c => c.phones.length > 0).length,
    withEmail: clientList.filter(c => c.emails.length > 0).length,
    withDates: clientList.filter(c => c.checkin && c.checkout).length,
    withGuests: clientList.filter(c => c.guests).length,
    totalRevenue: clientList.reduce((sum, c) => sum + (c.price || 0), 0),
    totalNights: clientList.reduce((sum, c) => sum + (c.nights || 0), 0),
    countries: {}
  };

  clientList.forEach(c => {
    if (c.country) {
      stats.countries[c.country] = (stats.countries[c.country] || 0) + 1;
    }
  });

  // Display results
  console.log('\n' + '='.repeat(70));
  console.log('                         STATISTIQUES');
  console.log('='.repeat(70));
  console.log();
  console.log(`Total clients:           ${stats.total}`);
  console.log(`Avec prix:               ${stats.withPrice}`);
  console.log(`Avec téléphone:          ${stats.withPhone}`);
  console.log(`Avec email:              ${stats.withEmail}`);
  console.log(`Avec dates complètes:    ${stats.withDates}`);
  console.log(`Avec nb voyageurs:       ${stats.withGuests}`);
  console.log();
  console.log(`Revenu total:            ${stats.totalRevenue.toFixed(2)} €`);
  console.log(`Total nuits:             ${stats.totalNights}`);
  console.log();

  if (Object.keys(stats.countries).length > 0) {
    console.log('PAYS D\'ORIGINE:');
    console.log('-'.repeat(40));
    Object.entries(stats.countries)
      .sort((a, b) => b[1] - a[1])
      .forEach(([c, n]) => console.log(`  - ${c}: ${n}`));
  }

  // Display client list
  console.log('\n' + '='.repeat(70));
  console.log('                      LISTE DES CLIENTS');
  console.log('='.repeat(70));

  clientList.forEach((c, i) => {
    console.log();
    console.log(`${(i + 1).toString().padStart(2)}. ${c.name.toUpperCase()}`);
    if (c.checkin) {
      const dates = c.checkout ? `${c.checkin} → ${c.checkout}` : c.checkin;
      const nights = c.nights ? ` (${c.nights} nuits)` : '';
      console.log(`    Dates:     ${dates}${nights}`);
    }
    if (c.guests) console.log(`    Voyageurs: ${c.guests}`);
    if (c.price) console.log(`    Prix:      ${c.price.toFixed(2)} €`);
    if (c.city || c.country) console.log(`    Origine:   ${[c.city, c.country].filter(Boolean).join(', ')}`);
    if (c.phones.length > 0) console.log(`    Tél:       ${c.phones.join(', ')}`);
    if (c.emails.length > 0) console.log(`    Email:     ${c.emails.join(', ')}`);
    if (c.confirmationCode) console.log(`    Code:      ${c.confirmationCode}`);
    if (c.reviews) console.log(`    Avis:      ${c.reviews} commentaires`);
  });

  // Save results
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'email-assistant-api',
      statistics: stats
    },
    clients: clientList
  };

  const jsonFile = path.join(OUTPUT_DIR, 'airbnb-clients-complete.json');
  fs.writeFileSync(jsonFile, JSON.stringify(output, null, 2));
  console.log(`\n\nFichier JSON: ${jsonFile}`);

  // Save CSV
  const csvHeader = 'Nom,CheckIn,CheckOut,Nuits,Voyageurs,Prix,Pays,Ville,Téléphone,Email,Code,Avis,Vérifié,DateRéservation\n';
  const csvRows = clientList.map(c => [
    `"${c.name}"`,
    c.checkin || '',
    c.checkout || '',
    c.nights || '',
    c.guests || '',
    c.price || '',
    `"${c.country || ''}"`,
    `"${c.city || ''}"`,
    `"${c.phones.join('; ')}"`,
    `"${c.emails.join('; ')}"`,
    c.confirmationCode || '',
    c.reviews || '',
    c.verified ? 'Oui' : 'Non',
    c.bookingDate
  ].join(',')).join('\n');

  const csvFile = path.join(OUTPUT_DIR, 'airbnb-clients-complete.csv');
  fs.writeFileSync(csvFile, csvHeader + csvRows);
  console.log(`Fichier CSV:  ${csvFile}`);
}

main().catch(console.error);
