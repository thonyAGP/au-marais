const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000';
const API_KEY = 'dev-api-key-change-me-in-production';
const OUTPUT_DIR = path.join(__dirname, '..', 'data');

// Parse confirmation email (basic info)
function parseConfirmationEmail(email) {
  const subject = email.subject || '';
  const preview = email.bodyPreview || '';

  // Extract name from subject: "Réservation confirmée : [Name] arrive le [date]"
  const nameMatch = subject.match(/confirmée\s*:\s*([A-Za-zÀ-ÿ\s\-]+?)\s+arrive/i);
  const name = nameMatch ? nameMatch[1].trim() : null;

  // Extract check-in date from subject
  const dateMatch = subject.match(/arrive le\s+(\d+\s*[a-zéûô\.]+)/i);
  const checkin = dateMatch ? dateMatch[1].trim() : null;

  // Extract location from preview
  const locationMatch = preview.match(/commentaires?\s*[\r\n]+([A-Za-zÀ-ÿ\s,\-]+?)[\r\n]+(?:Envoy|Message|Votre)/i) ||
                        preview.match(/vérifiée\s*[\r\n]+([A-Za-zÀ-ÿ\s,\-]+?)[\r\n]+(?:Envoy|Message)/i) ||
                        preview.match(/commentaires?\s*[\r\n]+([A-Za-zÀ-ÿ\s,\-]+?)$/i);

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

  const reviewsMatch = preview.match(/(\d+)\s*commentaires?/i);
  const reviews = reviewsMatch ? parseInt(reviewsMatch[1], 10) : null;
  const verified = preview.includes('Identité vérifiée');

  if (!name) return null;

  return {
    name,
    city,
    country,
    fullLocation,
    checkin,
    reviews,
    verified,
    bookingDate: email.receivedAt,
    emailId: email.id,
    source: 'airbnb-confirmation'
  };
}

// Parse detailed email body for more info
function parseEmailBody(bodyHtml, bodyText) {
  const text = bodyText || bodyHtml || '';
  const result = {};

  // Extract confirmation code
  const codeMatch = text.match(/code de confirmation\s*:?\s*([A-Z0-9]{10,12})/i) ||
                    text.match(/confirmation\s*:?\s*([A-Z0-9]{10,12})/i) ||
                    text.match(/\b(HM[A-Z0-9]{8,10})\b/);
  if (codeMatch) result.confirmationCode = codeMatch[1];

  // Extract dates - format: "jeu. 20 févr. 2025 -> dim. 23 févr. 2025"
  const datesMatch = text.match(/(\d{1,2}\s+[a-zéûô]+\.?\s+\d{4})\s*[-–>]+\s*(\d{1,2}\s+[a-zéûô]+\.?\s+\d{4})/i);
  if (datesMatch) {
    result.checkinFull = datesMatch[1].trim();
    result.checkoutFull = datesMatch[2].trim();
  }

  // Extract number of nights
  const nightsMatch = text.match(/(\d+)\s*nuits?/i);
  if (nightsMatch) result.nights = parseInt(nightsMatch[1], 10);

  // Extract number of guests
  const guestsMatch = text.match(/(\d+)\s*(?:voyageurs?|clients?|guests?)/i);
  if (guestsMatch) result.guests = parseInt(guestsMatch[1], 10);

  // Extract price - multiple patterns
  const pricePatterns = [
    /total\s*:?\s*([\d\s,\.]+)\s*€/i,
    /montant\s*:?\s*([\d\s,\.]+)\s*€/i,
    /([\d\s,\.]+)\s*€\s*EUR/i,
    /versement.*?([\d\s,\.]+)\s*€/i
  ];
  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.price = match[1].replace(/\s/g, '').replace(',', '.');
      break;
    }
  }

  // Extract phone numbers from text
  const phonePatterns = [
    /\+\d{1,3}[\s\-]?\d{2,4}[\s\-]?\d{2,4}[\s\-]?\d{2,4}[\s\-]?\d{0,4}/g,
    /(?:téléphone|phone|tel|tél)\s*:?\s*([\d\s\-\+\(\)]+)/gi
  ];
  const phones = [];
  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(m => {
        const cleaned = m.replace(/[^\d\+]/g, '');
        if (cleaned.length >= 10 && !phones.includes(cleaned)) {
          phones.push(cleaned);
        }
      });
    }
  }
  if (phones.length > 0) result.phones = phones;

  // Extract email addresses
  const emailMatch = text.match(/[\w\.\-]+@[\w\.\-]+\.[a-z]{2,}/gi);
  if (emailMatch) {
    const validEmails = emailMatch.filter(e =>
      !e.includes('airbnb') && !e.includes('hotmail') && !e.includes('au-marais')
    );
    if (validEmails.length > 0) result.guestEmail = validEmails[0];
  }

  return result;
}

// Extract phone from conversation emails
function extractPhoneFromConversation(preview) {
  const phonePatterns = [
    /\+\d{1,3}[\s\-]?\d{2,4}[\s\-]?\d{2,4}[\s\-]?\d{2,4}[\s\-]?\d{0,4}/g,
    /(?:mon numéro|my number|téléphone|phone|whatsapp)\s*(?:est|is|:)?\s*([\d\s\-\+\(\)]+)/gi
  ];

  for (const pattern of phonePatterns) {
    const matches = preview.match(pattern);
    if (matches) {
      for (const m of matches) {
        const cleaned = m.replace(/[^\d\+]/g, '');
        if (cleaned.length >= 10) return cleaned;
      }
    }
  }
  return null;
}

async function fetchConfirmationEmails() {
  const allEmails = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const url = `${API_URL}/api/emails?subject=confirm%C3%A9e&from=airbnb&limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      headers: { 'x-api-key': API_KEY }
    });
    const data = await response.json();

    if (!data.success || !data.data || data.data.length === 0) break;

    // Filter only Airbnb confirmation emails
    const airbnbConfirmations = data.data.filter(e =>
      e.fromAddress?.includes('airbnb') &&
      e.subject?.includes('arrive')
    );

    allEmails.push(...airbnbConfirmations);

    if (!data.pagination?.hasMore) break;
    offset += limit;
  }

  return allEmails;
}

async function main() {
  console.log('='.repeat(70));
  console.log('   EXTRACTION CONFIRMATIONS AIRBNB - EMAIL ASSISTANT API');
  console.log('='.repeat(70));
  console.log();

  const emails = await fetchConfirmationEmails();
  console.log(`Found ${emails.length} Airbnb confirmation emails\n`);

  const reservations = [];
  const seenNames = new Set();

  for (const email of emails) {
    const parsed = parseConfirmationEmail(email);
    if (parsed && !seenNames.has(parsed.name)) {
      seenNames.add(parsed.name);
      reservations.push(parsed);
    }
  }

  // Sort by booking date
  reservations.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  // Statistics
  const withLocation = reservations.filter(r => r.fullLocation);
  const countries = {};
  reservations.forEach(r => {
    if (r.country) {
      countries[r.country] = (countries[r.country] || 0) + 1;
    }
  });

  console.log('='.repeat(70));
  console.log('                         STATISTIQUES');
  console.log('='.repeat(70));
  console.log();
  console.log(`Total clients uniques:   ${reservations.length}`);
  console.log(`Avec localisation:       ${withLocation.length}`);
  console.log(`Identité vérifiée:       ${reservations.filter(r => r.verified).length}`);
  console.log();

  console.log('PAYS D\'ORIGINE:');
  console.log('-'.repeat(40));
  Object.entries(countries)
    .sort((a, b) => b[1] - a[1])
    .forEach(([c, n]) => console.log(`  - ${c}: ${n}`));

  console.log();
  console.log('='.repeat(70));
  console.log('                      LISTE DES CLIENTS');
  console.log('='.repeat(70));

  reservations.forEach((r, i) => {
    console.log();
    console.log(`${i + 1}. ${r.name.toUpperCase()}`);
    if (r.fullLocation) console.log(`   Origine: ${r.fullLocation}`);
    if (r.checkin) console.log(`   Check-in: ${r.checkin}`);
    if (r.reviews) console.log(`   Avis: ${r.reviews} commentaires`);
    if (r.verified) console.log(`   Identité vérifiée`);
  });

  // Save results
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalClients: reservations.length,
      withLocation: withLocation.length,
      source: 'email-assistant-api-confirmations'
    },
    countrySummary: countries,
    clients: reservations
  };

  const outputFile = path.join(OUTPUT_DIR, 'airbnb-confirmations.json');
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log();
  console.log(`\nFichier sauvegardé: ${outputFile}`);

  // Also save CSV
  const csvFile = path.join(OUTPUT_DIR, 'airbnb-confirmations.csv');
  const csvHeader = 'Nom,Ville,Pays,CheckIn,Avis,Vérifié,Date Réservation\n';
  const csvRows = reservations.map(r =>
    `"${r.name}","${r.city || ''}","${r.country || ''}","${r.checkin || ''}","${r.reviews || ''}","${r.verified ? 'Oui' : 'Non'}","${r.bookingDate}"`
  ).join('\n');
  fs.writeFileSync(csvFile, csvHeader + csvRows);
  console.log(`Fichier CSV: ${csvFile}`);
}

main().catch(console.error);
