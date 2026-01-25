const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const EMAIL = 'au-marais@hotmail.com';
const PASSWORD = '1234567890.+';
const OUTPUT = path.join(__dirname, '..', 'data', 'all-reservations.json');

// Ensure data dir exists
const dataDir = path.dirname(OUTPUT);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const allReservations = [];
const processedCodes = new Set();

const extractAirbnb = (text, date) => {
  const name = text.match(/([A-Za-zÀ-ÿ\-]+)\s+arrive\s+le/i);
  const loc = text.match(/Identité vérifiée[^·]*·[^\n]*\n\s*([A-Za-zÀ-ÿ\-,\s]+?)(?:\n|Envoyez)/i)
    || text.match(/(\d+)\s*commentaires?\s*\n\s*([A-Za-zÀ-ÿ\-,\s]+?)(?:\n|Envoyez)/i);

  // Date format in email:
  // Arrivée
  //
  // ven. 1 mai 2026
  //
  // 15:00
  const checkinMatch = text.match(/Arrivée\n\n([a-zéû]+\.?\s+\d{1,2}\s+[a-zéûô]+\.?\s+\d{4})\n\n(\d{1,2}:\d{2})/i)
    || text.match(/Arrivée\n+([a-zéû]+\.?\s+\d{1,2}\s+[a-zéûô]+\.?\s+\d{4})/i);
  const checkoutMatch = text.match(/Départ\n\n([a-zéû]+\.?\s+\d{1,2}\s+[a-zéûô]+\.?\s+\d{4})\n\n(\d{1,2}:\d{2})/i)
    || text.match(/Départ\n+([a-zéû]+\.?\s+\d{1,2}\s+[a-zéûô]+\.?\s+\d{4})/i);

  // Parse dates
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
    bookingDate: date,
    source: 'airbnb'
  };
};

const extractHE = (text, date) => {
  // Check for finalized exchange at our address
  const isFinalized = text.includes('vient de finaliser') || text.includes('a finalisé') ||
                      text.includes('est confirmé') || text.includes('finalized');
  const isOurPlace = text.includes('33 Rue François Miron') || text.includes('François Miron');

  if (!isFinalized || !isOurPlace) return null;

  // Extract guest name - "échange avec [Name] est confirmé" or "[Name] vient de finaliser"
  const nameMatch = text.match(/échange avec\s+([A-Za-zÀ-ÿ]+)\s+est confirmé/i)
    || text.match(/([A-Za-zÀ-ÿ]+)\s+vient de finaliser/i)
    || text.match(/exchange with\s+([A-Za-zÀ-ÿ]+)/i);

  if (!nameMatch) return null;
  const name = nameMatch[1].trim();

  // Dates: "du mercredi 7 janvier 2026 au mardi 13 janvier 2026"
  const dateMatch = text.match(/du\s+[a-zéû]+\s+(\d{1,2})\s+([a-zéûô]+)\s+(\d{4})\s+au\s+[a-zéû]+\s+(\d{1,2})\s+([a-zéûô]+)\s+(\d{4})/i);

  // Guests: "Nombre d'invité·e·s : 5" (note the special middle dot character)
  const guestsMatch = text.match(/invit[ée·es]+\s*:\s*(\d+)/i)
    || text.match(/Nombre d'invit[^\d]*(\d+)/i);

  // Email with emoji: "📧 Email : xxx@email.com"
  const emailMatch = text.match(/📧?\s*Email\s*:\s*([^\s\n]+@[^\s\n]+)/i)
    || text.match(/E-mail\s*:\s*([^\s\n]+@[^\s\n]+)/i);

  // Phone with emoji: "📞 Téléphone : +34654225349"
  const phoneMatch = text.match(/📞?\s*T[ée]l[ée]phone\s*:\s*([+\d\s\-()]+)/i);

  let checkin = null, checkout = null;
  if (dateMatch) {
    checkin = `${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]}`;
    checkout = `${dateMatch[4]} ${dateMatch[5]} ${dateMatch[6]}`;
  }

  // Calculate nights if we have dates
  let nights = null;
  if (dateMatch) {
    const d1 = parseInt(dateMatch[1]);
    const d2 = parseInt(dateMatch[4]);
    // Simple approximation if same month
    if (dateMatch[2] === dateMatch[5]) {
      nights = d2 - d1;
    }
  }

  return {
    name,
    city: null,
    country: null,
    fullLocation: null,
    checkin,
    checkout,
    guests: guestsMatch ? parseInt(guestsMatch[1]) : null,
    nights,
    totalPaid: '0',
    hostEarnings: '0',
    cleaningFee: null,
    taxes: null,
    confirmationCode: 'HE-' + name + '-' + Date.now().toString(36),
    email: emailMatch ? emailMatch[1].trim() : null,
    phone: phoneMatch ? phoneMatch[1].trim() : null,
    bookingDate: date,
    source: 'homeexchange'
  };
};

const sleep = ms => new Promise(r => setTimeout(r, ms));
const save = () => {
  fs.writeFileSync(OUTPUT, JSON.stringify(allReservations, null, 2));
  console.log('   Saved:', allReservations.length);
};

(async () => {
  console.log('EXTRACTION PLAYWRIGHT\n');
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    // Login
    console.log('Login...');
    await page.goto('https://login.live.com/');
    await sleep(2000);
    await page.fill('input[type="email"]', EMAIL);
    await page.getByText('Suivant').click();
    await sleep(3000);

    // Try to click "Utilisez votre mot de passe" if visible
    try {
      const pwdOption = page.getByText('Utilisez votre mot de passe');
      if (await pwdOption.isVisible({ timeout: 3000 })) {
        await pwdOption.click();
        await sleep(2000);
      }
    } catch(e) {
      console.log('  Password option not shown, continuing...');
    }

    // Wait for password field and fill it
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.fill('input[type="password"]', PASSWORD);
    await sleep(500);

    // Click submit
    const submitBtn = page.getByRole('button', { name: /Suivant|Se connecter|Sign in/i });
    await submitBtn.click();
    await sleep(5000);

    try {
      const yesBtn = page.getByRole('button', { name: 'Oui' });
      if (await yesBtn.isVisible({ timeout: 3000 })) {
        await yesBtn.click();
        await sleep(2000);
      }
    } catch(e) {}

    // Wait for any post-login redirects to complete
    console.log('Waiting for login to complete...');
    await sleep(8000);

    // Navigate to Outlook with retries
    console.log('Outlook...');
    let outlookLoaded = false;
    for (let attempt = 0; attempt < 3 && !outlookLoaded; attempt++) {
      try {
        await page.goto('https://outlook.live.com/mail/0/', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await sleep(10000);

        // Check if we're on Outlook
        if (page.url().includes('outlook.live.com/mail')) {
          outlookLoaded = true;
          console.log('  Outlook loaded!');
        } else {
          console.log('  Attempt', attempt + 1, '- redirected to:', page.url().substring(0, 60));
          await sleep(5000);
        }
      } catch (e) {
        console.log('  Attempt', attempt + 1, '- error:', e.message.substring(0, 40));
        await sleep(5000);
      }
    }

    if (!outlookLoaded) {
      console.log('Trying direct navigation...');
      await page.goto('https://outlook.live.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(10000);
    }

    // AIRBNB - aggressive scroll to load ALL emails
    console.log('\n=== AIRBNB ===');

    // Search for confirmation emails
    await page.waitForSelector('input[aria-label*="Rechercher"], input[placeholder*="Rechercher"], input[aria-label*="Search"]', { timeout: 60000 });
    const searchBox = page.locator('input[aria-label*="Rechercher"], input[placeholder*="Rechercher"], input[aria-label*="Search"]').first();
    await searchBox.click();
    await sleep(500);
    // Simple search for all Airbnb emails
    await searchBox.fill('from:airbnb');
    await page.keyboard.press('Enter');
    await sleep(8000);

    // Get the email list container
    const emailListSelector = 'div[role="option"], div[role="listbox"] div[data-convid]';

    // Count initial emails
    let count = await page.locator(emailListSelector).count();
    console.log('Initial count:', count, 'emails');

    // AGGRESSIVE SCROLL - scroll until no more emails load
    let previousCount = 0;
    let noNewEmailsCount = 0;
    const maxNoNewEmails = 8; // More attempts to ensure all loaded

    console.log('Scrolling to load all emails...');
    while (noNewEmailsCount < maxNoNewEmails) {
      previousCount = count;

      // Scroll down using multiple methods
      try {
        const lastEmail = page.locator(emailListSelector).last();
        if (await lastEmail.count() > 0) {
          await lastEmail.scrollIntoViewIfNeeded();
        }
      } catch (e) {}
      await sleep(2000);

      // Try scrolling the container
      await page.evaluate(() => {
        const lists = document.querySelectorAll('[role="listbox"], [role="list"]');
        lists.forEach(l => l.scrollTop = l.scrollHeight);
      });
      await sleep(2000);

      count = await page.locator(emailListSelector).count();

      if (count > previousCount) {
        console.log('  Loaded:', count, 'emails (+' + (count - previousCount) + ')');
        noNewEmailsCount = 0; // Reset counter
      } else {
        noNewEmailsCount++;
        console.log('  Still at', count, '- attempt', noNewEmailsCount + '/' + maxNoNewEmails);
      }
    }

    // Final recount
    await sleep(3000);
    count = await page.locator(emailListSelector).count();
    console.log('\nFinal email count:', count);
    console.log('Processing emails...\n');

    let totalAirbnbEmails = 0;

    for (let i = 0; i < count; i++) {
      try {
        process.stdout.write('\r[' + (i + 1) + '/' + count + '] ');

        // Scroll to and click email
        const emailItem = page.locator(emailListSelector).nth(i);
        await emailItem.scrollIntoViewIfNeeded();
        await emailItem.click();
        await sleep(1200);

        let date = null;
        try {
          date = await page.locator('span[title*="202"]').first().getAttribute('title');
        } catch(e) {}

        const body = await page.evaluate(() => {
          const doc = document.querySelector('div[role="document"]');
          return doc ? doc.innerText : '';
        });

        // DEBUG: Save first email body
        if (totalAirbnbEmails === 0 && i === 0) {
          const debugPath = path.join(__dirname, '..', 'data', 'debug-airbnb-email.txt');
          fs.writeFileSync(debugPath, body);
        }

        const info = extractAirbnb(body, date);
        if (info.name && info.confirmationCode && !processedCodes.has(info.confirmationCode)) {
          processedCodes.add(info.confirmationCode);
          allReservations.push(info);
          totalAirbnbEmails++;
          console.log('OK:', info.name, '|', info.checkin || '?', '|', info.country || '?');
          save();
        }
      } catch(e) {
        console.log('Error:', e.message.substring(0, 30));
      }
    }

    console.log('\n=== AIRBNB COMPLETE ===');
    console.log('Total Airbnb emails extracted:', totalAirbnbEmails);

    // HOMEEXCHANGE
    console.log('\n=== HOMEEXCHANGE ===');
    await page.goto('https://outlook.live.com/mail/0/inbox');
    await sleep(5000);

    await page.waitForSelector('input[aria-label*="Rechercher"], input[placeholder*="Rechercher"], input[aria-label*="Search"]', { timeout: 30000 });
    const searchBox2 = page.locator('input[aria-label*="Rechercher"], input[placeholder*="Rechercher"], input[aria-label*="Search"]').first();
    await searchBox2.click();
    await sleep(500);
    // Search HomeExchange for finalized exchanges at our address
    await searchBox2.fill('from:homeexchange finalisé "33 rue françois miron"');
    await page.keyboard.press('Enter');
    await sleep(5000);

    // Scroll to load all emails
    let prevCount = 0;
    count = await page.locator('div[role="option"]').count();
    console.log('Initial:', count, 'emails');

    while (count > prevCount) {
      prevCount = count;
      // Scroll down in the email list
      await page.locator('div[role="option"]').last().scrollIntoViewIfNeeded();
      await sleep(2000);
      count = await page.locator('div[role="option"]').count();
      if (count > prevCount) {
        console.log('  Loaded more:', count);
      }
    }
    console.log('Total HomeExchange emails:', count, '\n');

    for (let i = 0; i < count; i++) {
      try {
        console.log('[' + (i + 1) + '/' + count + ']');
        await page.locator('div[role="option"]').nth(i).scrollIntoViewIfNeeded();
        await page.locator('div[role="option"]').nth(i).click();
        await sleep(2000);

        let date = null;
        try {
          date = await page.locator('span[title*="202"]').first().getAttribute('title');
        } catch(e) {}

        const body = await page.evaluate(() => {
          const doc = document.querySelector('div[role="document"]');
          return doc ? doc.innerText : '';
        });

        // DEBUG: Save first HomeExchange email body
        if (i === 0) {
          const debugPath = path.join(__dirname, '..', 'data', 'debug-homeexchange-email.txt');
          fs.writeFileSync(debugPath, body);
          console.log('   DEBUG: Saved HomeExchange email to', debugPath);
        }

        const info = extractHE(body, date);
        if (info && info.name) {
          const key = info.name + '-' + info.checkin;
          if (!processedCodes.has(key)) {
            processedCodes.add(key);
            allReservations.push(info);
            console.log('   OK:', info.name, '|', info.email || 'no email', '|', info.phone || 'no phone');
            save();
          } else {
            console.log('   Skip: duplicate');
          }
        } else {
          console.log('   Skip: not a finalized incoming exchange');
        }
      } catch(e) {
        console.log('   Error:', e.message.substring(0, 40));
      }
    }

    // Summary
    console.log('\n=== SUMMARY ===');
    console.log('Total:', allReservations.length);

    const airbnb = allReservations.filter(r => r.source === 'airbnb').length;
    const he = allReservations.filter(r => r.source === 'homeexchange').length;
    console.log('Airbnb:', airbnb, '| HomeExchange:', he);

    const earnings = allReservations
      .filter(r => r.hostEarnings && r.source === 'airbnb')
      .reduce((s, r) => s + parseFloat(r.hostEarnings.replace(',', '.')), 0);
    console.log('Total earnings:', earnings.toFixed(2), 'EUR');

    const nights = allReservations
      .filter(r => r.nights)
      .reduce((s, r) => s + r.nights, 0);
    console.log('Total nights:', nights);

    // Countries
    const countries = {};
    allReservations.filter(r => r.country).forEach(r => {
      countries[r.country] = (countries[r.country] || 0) + 1;
    });
    console.log('\nCountries:');
    Object.entries(countries).sort((a,b) => b[1] - a[1]).forEach(([c, n]) => {
      console.log('  ', c + ':', n);
    });

    save();

    // CSV with all fields
    const csvPath = OUTPUT.replace('.json', '.csv');
    const csv = 'Name,City,Country,CheckIn,CheckInTime,CheckOut,CheckOutTime,Guests,Nights,TotalPaid,HostEarnings,CleaningFee,Taxes,Code,Email,Phone,BookingDate,Source\n' +
      allReservations.map(r =>
        '"' + (r.name||'') + '","' + (r.city||'') + '","' + (r.country||'') + '","' +
        (r.checkin||'') + '","' + (r.checkinTime||'') + '","' + (r.checkout||'') + '","' +
        (r.checkoutTime||'') + '","' + (r.guests||'') + '","' + (r.nights||'') + '","' +
        (r.totalPaid||'') + '","' + (r.hostEarnings||'') + '","' + (r.cleaningFee||'') + '","' +
        (r.taxes||'') + '","' + (r.confirmationCode||'') + '","' + (r.email||'') + '","' +
        (r.phone||'') + '","' + (r.bookingDate||'') + '","' + (r.source||'') + '"'
      ).join('\n');
    fs.writeFileSync(csvPath, csv);
    console.log('\nCSV saved:', csvPath);

    console.log('\nDone! Closing in 3s...');
    await sleep(3000);

  } catch (error) {
    console.error('Error:', error.message);
    if (allReservations.length > 0) save();
    await sleep(5000);
  } finally {
    await browser.close();
  }
})();
