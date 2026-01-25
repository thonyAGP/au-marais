const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000';
const API_KEY = 'dev-api-key-change-me-in-production';
const OUTPUT_DIR = path.join(__dirname, '..', 'data');

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

// English month mapping
const MONTHS_EN = {
  'jan': '01', 'january': '01',
  'feb': '02', 'february': '02',
  'mar': '03', 'march': '03',
  'apr': '04', 'april': '04',
  'may': '05',
  'jun': '06', 'june': '06',
  'jul': '07', 'july': '07',
  'aug': '08', 'august': '08',
  'sep': '09', 'sept': '09', 'september': '09',
  'oct': '10', 'october': '10',
  'nov': '11', 'november': '11',
  'dec': '12', 'december': '12'
};

function parseFrenchDate(dateStr, defaultYear = new Date().getFullYear()) {
  if (!dateStr) return null;

  const match = dateStr.match(/(\d{1,2})\s*([a-zéûô\.]+)\s*(\d{4})?/i);
  if (!match) return null;

  const day = match[1].padStart(2, '0');
  const monthStr = match[2].replace('.', '').toLowerCase();
  const month = MONTHS_FR[monthStr] || MONTHS_EN[monthStr];
  const year = match[3] || defaultYear;

  if (!month) return null;
  return `${year}-${month}-${day}`;
}

function calculateNights(checkin, checkout) {
  if (!checkin || !checkout) return null;
  const start = new Date(checkin);
  const end = new Date(checkout);
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : null;
}

function extractPhones(text) {
  if (!text) return [];
  const phones = new Set();
  const patterns = [
    /\+\d{1,3}[\s\-]?\d{2,4}[\s\-]?\d{2,4}[\s\-]?\d{2,4}[\s\-]?\d{0,4}/g
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const m of matches) {
        const cleaned = m.replace(/[^\d\+]/g, '');
        if (cleaned.length >= 10) phones.add(cleaned);
      }
    }
  }

  return [...phones];
}

function extractEmails(text) {
  if (!text) return [];
  const emailMatch = text.match(/[\w\.\-]+@[\w\.\-]+\.[a-z]{2,}/gi);
  if (!emailMatch) return [];

  return emailMatch.filter(e =>
    !e.toLowerCase().includes('homeexchange') &&
    !e.toLowerCase().includes('au-marais') &&
    !e.toLowerCase().includes('hotmail')
  );
}

function extractPrice(text) {
  if (!text) return null;

  const patterns = [
    /(?:total|montant|paid|payé)\s*:?\s*([\d\s,\.]+)\s*(?:€|EUR)/i,
    /([\d\s,\.]+)\s*(?:€|EUR)\s*(?:total|paid|payé)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const price = parseFloat(match[1].replace(/\s/g, '').replace(',', '.'));
      if (price > 50 && price < 10000) return price;
    }
  }

  return null;
}

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

async function main() {
  console.log('='.repeat(70));
  console.log('   EXTRACTION CLIENTS HOMEEXCHANGE');
  console.log('='.repeat(70));
  console.log();

  // Fetch HomeExchange emails
  console.log('Fetching HomeExchange emails...');
  const emails = await fetchAllEmails({ from: 'homeexchange' });
  console.log(`Found ${emails.length} HomeExchange emails\n`);

  // Categorize
  const confirmations = [];
  const requests = [];
  const messages = [];

  for (const email of emails) {
    const subject = (email.subject || '').toLowerCase();

    if (subject.includes('confirmation') || subject.includes('confirmé')) {
      confirmations.push(email);
    } else if (subject.includes('demande') || subject.includes('request')) {
      requests.push(email);
    } else if (subject.includes('message')) {
      messages.push(email);
    }
  }

  console.log('Email categories:');
  console.log(`- Confirmations: ${confirmations.length}`);
  console.log(`- Requests:      ${requests.length}`);
  console.log(`- Messages:      ${messages.length}`);
  console.log();

  // Extract unique clients from confirmations
  const clients = new Map();

  console.log('Processing confirmations...');
  for (const email of confirmations) {
    const subject = email.subject || '';
    const preview = email.bodyPreview || '';
    const fullText = preview;

    // Extract name from subject patterns
    // Pattern: "HomeExchange : Confirmation de l'échange avec [Name]"
    // Pattern: "HomeExchange: Exchange confirmed with [Name]"
    let name = null;
    const namePatterns = [
      /échange avec\s+([A-Za-zÀ-ÿ\s\-]+)/i,
      /exchange with\s+([A-Za-zÀ-ÿ\s\-]+)/i,
      /(?:confirmed|confirmé).*?([A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+)?)/
    ];

    for (const pattern of namePatterns) {
      const match = subject.match(pattern);
      if (match) {
        name = match[1].trim();
        break;
      }
    }

    if (!name) {
      // Try to find in preview
      const previewMatch = preview.match(/([A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+)?)\s+(?:a confirmé|confirmed)/);
      if (previewMatch) name = previewMatch[1].trim();
    }

    if (!name) continue;

    // Extract dates
    // Pattern: "du 15 au 22 août 2025" or "15 - 22 août 2025"
    let checkin = null, checkout = null;
    const dateRangeMatch = fullText.match(/(\d{1,2})\s*(?:au|-)\s*(\d{1,2})\s+([a-zéûô]+)\s*(\d{4})?/i);
    if (dateRangeMatch) {
      const year = dateRangeMatch[4] || new Date(email.receivedAt).getFullYear();
      const monthStr = dateRangeMatch[3].toLowerCase();
      const month = MONTHS_FR[monthStr] || MONTHS_EN[monthStr];
      if (month) {
        checkin = `${year}-${month}-${dateRangeMatch[1].padStart(2, '0')}`;
        checkout = `${year}-${month}-${dateRangeMatch[2].padStart(2, '0')}`;
      }
    }

    const client = {
      name,
      checkin,
      checkout,
      nights: calculateNights(checkin, checkout),
      guests: null,
      price: null, // HomeExchange is usually free
      phones: extractPhones(fullText),
      emails: extractEmails(fullText),
      city: null,
      country: null,
      bookingDate: email.receivedAt,
      source: 'homeexchange',
      rawSubject: subject
    };

    // Extract location from preview
    const locationMatch = preview.match(/from\s+([A-Za-zÀ-ÿ\s,\-]+)/i) ||
                          preview.match(/de\s+([A-Za-zÀ-ÿ]+(?:,\s*[A-Za-zÀ-ÿ]+)?)/i);
    if (locationMatch) {
      const loc = locationMatch[1].trim();
      if (loc.includes(',')) {
        const parts = loc.split(',').map(p => p.trim());
        client.city = parts[0];
        client.country = parts[parts.length - 1];
      } else {
        client.country = loc;
      }
    }

    if (!clients.has(name) || new Date(client.bookingDate) > new Date(clients.get(name).bookingDate)) {
      clients.set(name, client);
    }

    process.stdout.write('.');
  }
  console.log();

  // Also check request emails for more info
  console.log('\nProcessing requests for additional info...');
  for (const email of requests) {
    const subject = email.subject || '';
    const preview = email.bodyPreview || '';

    // Try to extract name
    const nameMatch = subject.match(/demande.*?([A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+)?)/i) ||
                      subject.match(/request.*?([A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+)?)/i);

    if (nameMatch) {
      const name = nameMatch[1].trim();
      if (!clients.has(name)) {
        // New client from request
        const client = {
          name,
          checkin: null,
          checkout: null,
          nights: null,
          guests: null,
          price: null,
          phones: extractPhones(preview),
          emails: extractEmails(preview),
          city: null,
          country: null,
          bookingDate: email.receivedAt,
          source: 'homeexchange',
          rawSubject: subject
        };
        clients.set(name, client);
        process.stdout.write('+');
      }
    }
  }
  console.log();

  // Convert to array
  const clientList = [...clients.values()]
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  // Statistics
  const stats = {
    total: clientList.length,
    withDates: clientList.filter(c => c.checkin && c.checkout).length,
    withPhone: clientList.filter(c => c.phones.length > 0).length,
    totalNights: clientList.reduce((sum, c) => sum + (c.nights || 0), 0)
  };

  // Display
  console.log('\n' + '='.repeat(70));
  console.log('                         STATISTIQUES');
  console.log('='.repeat(70));
  console.log(`Total clients:        ${stats.total}`);
  console.log(`Avec dates:           ${stats.withDates}`);
  console.log(`Avec téléphone:       ${stats.withPhone}`);
  console.log(`Total nuits:          ${stats.totalNights}`);

  console.log('\n' + '='.repeat(70));
  console.log('                      LISTE DES CLIENTS');
  console.log('='.repeat(70));

  clientList.forEach((c, i) => {
    console.log();
    console.log(`${(i + 1).toString().padStart(2)}. ${c.name.toUpperCase()}`);
    if (c.checkin && c.checkout) {
      console.log(`    Dates:     ${c.checkin} → ${c.checkout} (${c.nights} nuits)`);
    }
    if (c.city || c.country) {
      console.log(`    Origine:   ${[c.city, c.country].filter(Boolean).join(', ')}`);
    }
    if (c.phones.length > 0) console.log(`    Tél:       ${c.phones.join(', ')}`);
    if (c.emails.length > 0) console.log(`    Email:     ${c.emails.join(', ')}`);
  });

  // Save
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'email-assistant-api',
      statistics: stats
    },
    clients: clientList
  };

  const jsonFile = path.join(OUTPUT_DIR, 'homeexchange-clients.json');
  fs.writeFileSync(jsonFile, JSON.stringify(output, null, 2));
  console.log(`\n\nFichier JSON: ${jsonFile}`);
}

main().catch(console.error);
