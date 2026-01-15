const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const path = require('path');

// Configuration
const IMAP_CONFIG = {
  user: 'au-marais@hotmail.com',
  password: 'zxotcrmnyrahcjgy',
  host: 'imap-mail.outlook.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'all-reservations.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const allReservations = [];
const processedCodes = new Set();

// ========== EXTRACTION FUNCTIONS ==========

const extractAirbnbInfo = (text, emailDate) => {
  const clean = text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ');

  const nameMatch = text.match(/([A-Za-zÀ-ÿ\-]+)\s+arrive\s+le\s+(\d+\s*[a-zéûô]+\.?)/i);
  const locationMatch = text.match(/Identité vérifiée[^·]*·[^\n]*[\n\s]+([A-Za-zÀ-ÿ\-,\s]+?)(?:\n|Envoyez)/i)
    || text.match(/(\d+)\s*commentaires?\s*[\n\s]+([A-Za-zÀ-ÿ\-,\s]+?)(?:\n|Envoyez)/i);

  const checkinMatch = text.match(/Arrivée[\n\s]+([a-z]+\.?\s*\d+\s*[a-zéûô]+\.?)[\n\s]*(\d{1,2}:\d{2})?/i);
  const checkoutMatch = text.match(/Départ[\n\s]+([a-z]+\.?\s*\d+\s*[a-zéûô]+\.?)[\n\s]*(\d{1,2}:\d{2})?/i);
  const guestsMatch = text.match(/Voyageurs[\n\s]+(\d+)\s*(adultes?|voyageurs?)/i) || text.match(/(\d+)\s*adultes?/i);
  const nightsMatch = text.match(/(\d+)\s*nuits?/i);
  const totalMatch = text.match(/Total\s*\(?EUR\)?\s*[\n\s]*([\d\s,\.]+)\s*€/i);
  const hostEarningsMatch = text.match(/Vous gagnez\s*[\n\s]*([\d\s,\.]+)\s*€/i);
  const cleaningFeeMatch = text.match(/Frais de ménage\s*[\n\s]*([\d,\.]+)\s*€/i);
  const serviceFeeMatch = text.match(/Frais de service hôte[^\n]*[\n\s]*-?([\d,\.]+)\s*€/i);
  const taxesMatch = text.match(/Taxes de séjour\s*[\n\s]*([\d,\.]+)\s*€/i);
  const codeMatch = text.match(/Code de confirmation\s*[\n\s]*([A-Z0-9]+)/i);
  const reviewsMatch = text.match(/(\d+)\s*commentaires?/i);
  const pricePerNightMatch = text.match(/([\d,\.]+)\s*€\s*x\s*\d+\s*nuits?/i);

  let city = null, country = null, fullLocation = null;
  const locText = locationMatch ? (locationMatch[2] || locationMatch[1]) : null;
  if (locText) {
    fullLocation = locText.trim();
    if (fullLocation.includes(',')) {
      const parts = fullLocation.split(',').map(p => p.trim());
      city = parts[0];
      country = parts[parts.length - 1];
    } else {
      country = fullLocation;
    }
  }

  return {
    name: nameMatch ? nameMatch[1].trim() : null,
    city, country, fullLocation,
    checkin: checkinMatch ? checkinMatch[1].trim() : (nameMatch ? nameMatch[2].trim() : null),
    checkinTime: checkinMatch && checkinMatch[2] ? checkinMatch[2].trim() : null,
    checkout: checkoutMatch ? checkoutMatch[1].trim() : null,
    checkoutTime: checkoutMatch && checkoutMatch[2] ? checkoutMatch[2].trim() : null,
    guests: guestsMatch ? parseInt(guestsMatch[1], 10) : null,
    nights: nightsMatch ? parseInt(nightsMatch[1], 10) : null,
    pricePerNight: pricePerNightMatch ? pricePerNightMatch[1].trim() : null,
    totalPaid: totalMatch ? totalMatch[1].trim().replace(/\s/g, '') : null,
    hostEarnings: hostEarningsMatch ? hostEarningsMatch[1].trim().replace(/\s/g, '') : null,
    cleaningFee: cleaningFeeMatch ? cleaningFeeMatch[1].trim() : null,
    serviceFee: serviceFeeMatch ? serviceFeeMatch[1].trim() : null,
    taxes: taxesMatch ? taxesMatch[1].trim() : null,
    confirmationCode: codeMatch ? codeMatch[1].trim() : null,
    guestReviews: reviewsMatch ? parseInt(reviewsMatch[1], 10) : null,
    bookingDate: emailDate,
    source: 'airbnb'
  };
};

const extractHomeExchangeInfo = (text, emailDate) => {
  // Check if this is someone coming TO us (not us going somewhere)
  const isIncoming = text.includes('séjournera chez vous') ||
                     text.includes('will stay at your place') ||
                     text.includes('va séjourner chez vous') ||
                     text.includes('staying at your home');

  if (!isIncoming) return null;

  const nameMatch = text.match(/échange avec\s+([A-Za-zÀ-ÿ\s\-]+?)\s+est confirmé/i)
    || text.match(/([A-Za-zÀ-ÿ\s\-]+?)\s+(?:will stay|va séjourner|séjournera)/i);

  const dateMatch = text.match(/(\d{1,2})\s*([a-zéûô]+\.?)\s*(?:au|to|-)\s*(\d{1,2})\s*([a-zéûô]+\.?)\s*(\d{4})?/i);
  const guestsMatch = text.match(/(\d+)\s*(?:voyageurs?|guests?|personnes?|adultes?)/i);
  const locationMatch = text.match(/(?:from|de|vient de)\s+([A-Za-zÀ-ÿ\-,\s]+?)(?:\n|\.)/i);

  let city = null, country = null, fullLocation = null;
  if (locationMatch && locationMatch[1]) {
    fullLocation = locationMatch[1].trim();
    if (fullLocation.includes(',')) {
      const parts = fullLocation.split(',').map(p => p.trim());
      city = parts[0];
      country = parts[parts.length - 1];
    } else {
      country = fullLocation;
    }
  }

  const name = nameMatch ? nameMatch[1].trim().replace(/\s+/g, ' ') : null;
  if (!name) return null;

  return {
    name,
    city, country, fullLocation,
    checkin: dateMatch ? `${dateMatch[1]} ${dateMatch[2]}` : null,
    checkout: dateMatch ? `${dateMatch[3]} ${dateMatch[4]}` : null,
    guests: guestsMatch ? parseInt(guestsMatch[1], 10) : null,
    nights: null,
    totalPaid: '0',
    hostEarnings: '0',
    cleaningFee: null,
    taxes: null,
    confirmationCode: `HE-${name.replace(/\s/g, '-')}-${Date.now().toString(36)}`,
    guestReviews: null,
    bookingDate: emailDate,
    source: 'homeexchange'
  };
};

// ========== IMAP FUNCTIONS ==========

const searchEmails = (imap, criteria) => {
  return new Promise((resolve, reject) => {
    imap.search(criteria, (err, results) => {
      if (err) reject(err);
      else resolve(results || []);
    });
  });
};

const fetchEmail = (imap, uid) => {
  return new Promise((resolve, reject) => {
    const fetch = imap.fetch([uid], { bodies: '' });

    fetch.on('message', (msg) => {
      let buffer = '';

      msg.on('body', (stream) => {
        stream.on('data', (chunk) => {
          buffer += chunk.toString('utf8');
        });
      });

      msg.once('end', async () => {
        try {
          const parsed = await simpleParser(buffer);
          resolve({
            date: parsed.date,
            subject: parsed.subject,
            from: parsed.from?.text,
            text: parsed.text || '',
            html: parsed.html || ''
          });
        } catch (e) {
          reject(e);
        }
      });
    });

    fetch.once('error', reject);
    fetch.once('end', () => {});
  });
};

const processMailbox = async (imap, searchCriteria, extractor, sourceName) => {
  console.log(`\n🔍 Searching: ${JSON.stringify(searchCriteria)}`);

  const uids = await searchEmails(imap, searchCriteria);
  console.log(`📋 Found ${uids.length} emails`);

  let added = 0;

  for (let i = 0; i < uids.length; i++) {
    try {
      process.stdout.write(`\r   📧 Processing ${i + 1}/${uids.length}...`);

      const email = await fetchEmail(imap, uids[i]);
      const text = email.text || email.html?.replace(/<[^>]+>/g, ' ') || '';
      const emailDate = email.date ? email.date.toISOString() : null;

      const info = extractor(text, emailDate);

      if (info && info.name) {
        const key = info.confirmationCode || `${info.name}-${info.checkin}`;
        if (!processedCodes.has(key)) {
          processedCodes.add(key);
          allReservations.push(info);
          added++;
        }
      }
    } catch (err) {
      // Skip errors silently
    }
  }

  console.log(`\n   ✅ Added ${added} new reservations`);
  return added;
};

// ========== MAIN ==========

const main = async () => {
  console.log('🚀 IMAP EMAIL EXTRACTION\n');
  console.log(`📂 Output: ${OUTPUT_FILE}\n`);

  const imap = new Imap(IMAP_CONFIG);

  return new Promise((resolve, reject) => {
    imap.once('ready', async () => {
      try {
        console.log('✅ Connected to Outlook\n');

        // Open INBOX
        await new Promise((res, rej) => {
          imap.openBox('INBOX', true, (err) => {
            if (err) rej(err);
            else res();
          });
        });

        // ========== AIRBNB ==========
        console.log('═'.repeat(60));
        console.log('📧 AIRBNB RESERVATIONS');
        console.log('═'.repeat(60));

        // Search Airbnb confirmation emails
        await processMailbox(imap,
          [['FROM', 'airbnb'], ['SUBJECT', 'confirmée']],
          extractAirbnbInfo,
          'airbnb'
        );

        await processMailbox(imap,
          [['FROM', 'airbnb'], ['SUBJECT', 'confirmed']],
          extractAirbnbInfo,
          'airbnb'
        );

        // ========== HOMEEXCHANGE ==========
        console.log('\n' + '═'.repeat(60));
        console.log('🏠 HOMEEXCHANGE RESERVATIONS');
        console.log('═'.repeat(60));

        await processMailbox(imap,
          [['FROM', 'homeexchange']],
          extractHomeExchangeInfo,
          'homeexchange'
        );

        // ========== SUMMARY ==========
        console.log('\n\n' + '═'.repeat(60));
        console.log('📊 EXTRACTION COMPLETE');
        console.log('═'.repeat(60));

        const airbnbCount = allReservations.filter(r => r.source === 'airbnb').length;
        const heCount = allReservations.filter(r => r.source === 'homeexchange').length;

        console.log(`\n📈 Total: ${allReservations.length} reservations`);
        console.log(`   • Airbnb: ${airbnbCount}`);
        console.log(`   • HomeExchange: ${heCount}`);

        // Countries
        const countries = {};
        allReservations.filter(r => r.country).forEach(r => {
          countries[r.country] = (countries[r.country] || 0) + 1;
        });

        console.log('\n🌍 Countries:');
        Object.entries(countries)
          .sort((a, b) => b[1] - a[1])
          .forEach(([c, n]) => console.log(`   • ${c}: ${n}`));

        // Financials
        const totalEarnings = allReservations
          .filter(r => r.hostEarnings && r.source === 'airbnb')
          .reduce((sum, r) => sum + parseFloat(r.hostEarnings.replace(',', '.')), 0);

        const totalNights = allReservations
          .filter(r => r.nights)
          .reduce((sum, r) => sum + r.nights, 0);

        const totalTaxes = allReservations
          .filter(r => r.taxes && r.source === 'airbnb')
          .reduce((sum, r) => sum + parseFloat(r.taxes.replace(',', '.')), 0);

        console.log(`\n💰 Total Airbnb host earnings: ${totalEarnings.toFixed(2)}€`);
        console.log(`🏨 Total nights: ${totalNights}`);
        console.log(`📊 Total taxes collected: ${totalTaxes.toFixed(2)}€`);

        // Save JSON
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allReservations, null, 2));
        console.log(`\n💾 JSON saved: ${OUTPUT_FILE}`);

        // Save CSV
        const csvPath = path.join(DATA_DIR, 'all-reservations.csv');
        const csv = 'Name,City,Country,CheckIn,CheckOut,Guests,Nights,PricePerNight,TotalPaid,HostEarnings,CleaningFee,ServiceFee,Taxes,ConfirmationCode,GuestReviews,BookingDate,Source\n' +
          allReservations.map(r =>
            `"${r.name||''}","${r.city||''}","${r.country||''}","${r.checkin||''}","${r.checkout||''}","${r.guests||''}","${r.nights||''}","${r.pricePerNight||''}","${r.totalPaid||''}","${r.hostEarnings||''}","${r.cleaningFee||''}","${r.serviceFee||''}","${r.taxes||''}","${r.confirmationCode||''}","${r.guestReviews||''}","${r.bookingDate||''}","${r.source||''}"`
          ).join('\n');
        fs.writeFileSync(csvPath, csv);
        console.log(`💾 CSV saved: ${csvPath}`);

        console.log('\n✅ Done!');

        imap.end();
        resolve();

      } catch (error) {
        console.error('❌ Error:', error.message);
        imap.end();
        reject(error);
      }
    });

    imap.once('error', (err) => {
      console.error('❌ IMAP Error:', err.message);
      reject(err);
    });

    imap.once('end', () => {
      console.log('\n📪 Connection closed');
    });

    console.log('🔌 Connecting to Outlook...');
    imap.connect();
  });
};

main().catch(console.error);
