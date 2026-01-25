// Fetch emails via IMAP (access ALL emails, not just recent ones)
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const EMAIL = 'au-marais@hotmail.com';
const PASSWORD = '1234567890.+';

// Outlook IMAP settings
const imapConfig = {
  user: EMAIL,
  password: PASSWORD,
  host: 'outlook.office365.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

const extractAirbnb = (text) => {
  const name = text.match(/([A-Za-zÀ-ÿ\-]+)\s+arrive\s+le/i);
  const loc = text.match(/Identité vérifiée[^·]*·[^\n]*\n\s*([A-Za-zÀ-ÿ\-,\s]+?)(?:\n|Envoyez)/i)
    || text.match(/(\d+)\s*commentaires?\s*\n\s*([A-Za-zÀ-ÿ\-,\s]+?)(?:\n|Envoyez)/i);

  const checkinMatch = text.match(/Arrivée\n\n([a-zéû]+\.?\s+\d{1,2}\s+[a-zéûô]+\.?\s+\d{4})\n\n(\d{1,2}:\d{2})/i)
    || text.match(/Arrivée\n+([a-zéû]+\.?\s+\d{1,2}\s+[a-zéûô]+\.?\s+\d{4})/i);
  const checkoutMatch = text.match(/Départ\n\n([a-zéû]+\.?\s+\d{1,2}\s+[a-zéûô]+\.?\s+\d{4})\n\n(\d{1,2}:\d{2})/i)
    || text.match(/Départ\n+([a-zéû]+\.?\s+\d{1,2}\s+[a-zéûô]+\.?\s+\d{4})/i);

  let checkin = null, checkinTime = null;
  if (checkinMatch) {
    checkin = checkinMatch[1].trim();
    checkinTime = checkinMatch[2] || null;
  }

  let checkout = null, checkoutTime = null;
  if (checkoutMatch) {
    checkout = checkoutMatch[1].trim();
    checkoutTime = checkoutMatch[2] || null;
  }

  const guests = text.match(/(\d+)\s*adultes?/i) || text.match(/Voyageurs\n(\d+)/i);
  const nights = text.match(/(\d+)\s*nuits?/i);
  const total = text.match(/Total\s*\(?EUR\)?\s*\n?\s*([\d\s,\.]+)\s*€/i);
  const earnings = text.match(/Vous gagnez\s*\n?\s*([\d\s,\.]+)\s*€/i);
  const cleaning = text.match(/Frais de ménage\s*\n?\s*([\d,\.]+)\s*€/i);
  const taxes = text.match(/Taxes de séjour\s*\n?\s*([\d,\.]+)\s*€/i);
  const code = text.match(/Code de confirmation\s*\n?\s*([A-Z0-9]+)/i);

  const locText = loc ? (loc[2] || loc[1]) : null;
  let city = null, country = null;
  if (locText && locText.includes(',')) {
    const parts = locText.split(',').map(p => p.trim());
    city = parts[0];
    country = parts[parts.length - 1];
  } else if (locText) {
    country = locText.trim();
  }

  return {
    name: name ? name[1].trim() : null,
    city,
    country,
    fullLocation: locText ? locText.trim() : null,
    checkin,
    checkinTime,
    checkout,
    checkoutTime,
    guests: guests ? parseInt(guests[1]) : null,
    nights: nights ? parseInt(nights[1]) : null,
    totalPaid: total ? total[1].replace(/\s/g, '') : null,
    hostEarnings: earnings ? earnings[1].replace(/\s/g, '') : null,
    cleaningFee: cleaning ? cleaning[1] : null,
    taxes: taxes ? taxes[1] : null,
    confirmationCode: code ? code[1] : null,
    source: 'airbnb'
  };
};

const allReservations = [];
const processedCodes = new Set();

const processEmails = () => {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig);

    imap.once('ready', () => {
      console.log('Connected to IMAP');

      imap.openBox('INBOX', true, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        console.log(`Mailbox has ${box.messages.total} messages`);

        // Search for Airbnb confirmation emails
        imap.search([['FROM', 'airbnb'], ['SUBJECT', 'réservation']], (err, uids) => {
          if (err) {
            reject(err);
            return;
          }

          console.log(`Found ${uids.length} Airbnb emails`);

          if (uids.length === 0) {
            imap.end();
            resolve();
            return;
          }

          let processed = 0;
          const fetch = imap.fetch(uids, { bodies: '' });

          fetch.on('message', (msg, seqno) => {
            msg.on('body', (stream) => {
              simpleParser(stream, (err, parsed) => {
                if (err) return;

                const text = parsed.text || '';
                const date = parsed.date ? parsed.date.toISOString() : null;

                const info = extractAirbnb(text);
                info.bookingDate = date;

                if (info.name && info.confirmationCode && !processedCodes.has(info.confirmationCode)) {
                  processedCodes.add(info.confirmationCode);
                  allReservations.push(info);
                  console.log(`[${++processed}] ${info.name} | ${info.city || '?'}, ${info.country || '?'}`);
                }
              });
            });
          });

          fetch.once('end', () => {
            console.log('\nDone processing emails');
            imap.end();
            resolve();
          });

          fetch.once('error', (err) => {
            console.error('Fetch error:', err);
            imap.end();
            reject(err);
          });
        });
      });
    });

    imap.once('error', (err) => {
      console.error('IMAP error:', err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('IMAP connection ended');
    });

    imap.connect();
  });
};

(async () => {
  try {
    console.log('Connecting to Outlook via IMAP...\n');
    await processEmails();

    // Save results
    const outputPath = path.join(__dirname, '..', 'data', 'imap-reservations.json');
    fs.writeFileSync(outputPath, JSON.stringify(allReservations, null, 2));
    console.log(`\nSaved ${allReservations.length} reservations to: ${outputPath}`);

    // Summary
    const countries = {};
    allReservations.filter(r => r.country).forEach(r => {
      countries[r.country] = (countries[r.country] || 0) + 1;
    });
    console.log('\nCountries:');
    Object.entries(countries).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => {
      console.log(`  ${c}: ${n}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
})();
