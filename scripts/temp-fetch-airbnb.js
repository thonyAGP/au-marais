const API_URL = 'http://localhost:3000';
const API_KEY = 'dev-api-key-change-me-in-production';

async function fetchAllAirbnbEmails() {
  const allEmails = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const resp = await fetch(`${API_URL}/api/emails?from=airbnb&limit=${limit}&offset=${offset}`, {
      headers: { 'x-api-key': API_KEY }
    });
    const data = await resp.json();
    if (!data.success || !data.data || data.data.length === 0) break;
    allEmails.push(...data.data);
    console.log(`Fetched ${allEmails.length} emails...`);
    if (!data.pagination?.hasMore) break;
    offset += limit;
  }

  return allEmails;
}

async function main() {
  console.log('='.repeat(70));
  console.log('   ANALYSE EMAILS AIRBNB DISPONIBLES');
  console.log('='.repeat(70));
  console.log();

  const emails = await fetchAllAirbnbEmails();
  console.log(`\nTotal Airbnb emails: ${emails.length}`);

  // Categorize emails
  const categories = {
    confirmations: [],
    conversations: [],
    receipts: [],
    payouts: [],
    reviews: [],
    other: []
  };

  for (const email of emails) {
    const subject = (email.subject || '').toLowerCase();

    if (subject.includes('confirmée') && subject.includes('arrive')) {
      categories.confirmations.push(email);
    } else if (subject.includes('message') || subject.includes('conversation')) {
      categories.conversations.push(email);
    } else if (subject.includes('reçu') || subject.includes('receipt')) {
      categories.receipts.push(email);
    } else if (subject.includes('versement') || subject.includes('payout')) {
      categories.payouts.push(email);
    } else if (subject.includes('avis') || subject.includes('review') || subject.includes('évaluation')) {
      categories.reviews.push(email);
    } else {
      categories.other.push(email);
    }
  }

  console.log('\n--- RÉPARTITION PAR TYPE ---');
  console.log(`Confirmations:  ${categories.confirmations.length}`);
  console.log(`Conversations:  ${categories.conversations.length}`);
  console.log(`Reçus:          ${categories.receipts.length}`);
  console.log(`Versements:     ${categories.payouts.length}`);
  console.log(`Avis:           ${categories.reviews.length}`);
  console.log(`Autres:         ${categories.other.length}`);

  // Extract unique guests from confirmations
  console.log('\n--- CONFIRMATIONS DÉTECTÉES ---');
  const guests = new Map(); // name -> email info

  for (const email of categories.confirmations) {
    const match = email.subject.match(/confirmée\s*:\s*([A-Za-zÀ-ÿ\s\-]+?)\s+arrive/i);
    if (match) {
      const name = match[1].trim();
      if (!guests.has(name)) {
        guests.set(name, {
          name,
          emailId: email.id,
          subject: email.subject,
          receivedAt: email.receivedAt,
          bodyPreview: email.bodyPreview
        });
      }
    }
  }

  console.log(`\nClients uniques dans confirmations: ${guests.size}`);
  console.log('\nListe:');
  [...guests.values()].sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))
    .forEach((g, i) => console.log(`${i + 1}. ${g.name} (${g.receivedAt.substring(0, 10)})`));

  // Show sample of "other" emails to understand what we're missing
  console.log('\n--- ÉCHANTILLON "AUTRES" EMAILS ---');
  categories.other.slice(0, 10).forEach(e => console.log(`- ${e.subject}`));
}

main().catch(console.error);
