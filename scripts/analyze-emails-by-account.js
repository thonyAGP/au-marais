const API_URL = 'http://localhost:3000';
const API_KEY = 'dev-api-key-change-me-in-production';

async function fetchEmails(query = {}) {
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

async function main() {
  console.log('='.repeat(60));
  console.log('   ANALYSE DES EMAILS PAR COMPTE ET SOURCE');
  console.log('='.repeat(60));

  // Get accounts
  const accountsResp = await fetch(`${API_URL}/api/accounts`, {
    headers: { 'x-api-key': API_KEY }
  });
  const { data: accounts } = await accountsResp.json();

  // Get all emails
  const allEmailsResp = await fetch(`${API_URL}/api/emails?limit=1`, {
    headers: { 'x-api-key': API_KEY }
  });
  const { pagination } = await allEmailsResp.json();
  console.log(`\nTotal emails en base: ${pagination.total}`);

  // Analyze by account
  console.log('\n--- EMAILS PAR COMPTE ---');
  for (const account of accounts) {
    // Count emails for this account
    const resp = await fetch(`${API_URL}/api/emails?accountId=${account.id}&limit=1`, {
      headers: { 'x-api-key': API_KEY }
    });
    const data = await resp.json();
    const count = data.pagination?.total || 0;
    console.log(`${account.email}: ${count} emails`);
  }

  // Analyze Airbnb emails
  console.log('\n--- EMAILS AIRBNB ---');
  const airbnbEmails = await fetchEmails({ from: 'airbnb' });
  console.log(`Total: ${airbnbEmails.length}`);

  const airbnbByType = {
    confirmations: airbnbEmails.filter(e => e.subject?.toLowerCase().includes('confirmée')).length,
    conversations: airbnbEmails.filter(e => e.subject?.toLowerCase().includes('message')).length,
    receipts: airbnbEmails.filter(e => e.subject?.toLowerCase().includes('reçu')).length,
    payouts: airbnbEmails.filter(e => e.subject?.toLowerCase().includes('versement')).length,
    reviews: airbnbEmails.filter(e => e.subject?.toLowerCase().includes('commentaire') || e.subject?.toLowerCase().includes('avis')).length
  };
  console.log('  Confirmations:', airbnbByType.confirmations);
  console.log('  Conversations:', airbnbByType.conversations);
  console.log('  Reçus:', airbnbByType.receipts);
  console.log('  Versements:', airbnbByType.payouts);
  console.log('  Avis:', airbnbByType.reviews);

  // Date range for Airbnb
  if (airbnbEmails.length > 0) {
    const dates = airbnbEmails.map(e => new Date(e.receivedAt)).sort((a, b) => a - b);
    console.log(`  Période: ${dates[0].toISOString().split('T')[0]} → ${dates[dates.length-1].toISOString().split('T')[0]}`);
  }

  // Analyze HomeExchange emails
  console.log('\n--- EMAILS HOMEEXCHANGE ---');
  const heEmails = await fetchEmails({ from: 'homeexchange' });
  console.log(`Total: ${heEmails.length}`);

  if (heEmails.length > 0) {
    const dates = heEmails.map(e => new Date(e.receivedAt)).sort((a, b) => a - b);
    console.log(`  Période: ${dates[0].toISOString().split('T')[0]} → ${dates[dates.length-1].toISOString().split('T')[0]}`);
  }

  // Show some confirmation subjects to understand format
  console.log('\n--- ÉCHANTILLON CONFIRMATIONS AIRBNB ---');
  const confirmations = airbnbEmails
    .filter(e => e.subject?.toLowerCase().includes('confirmée') && e.subject?.includes('arrive'))
    .slice(0, 5);
  confirmations.forEach(e => {
    console.log(`- ${e.subject}`);
    console.log(`  Date: ${e.receivedAt}`);
  });

  // Show some HomeExchange subjects
  console.log('\n--- ÉCHANTILLON HOMEEXCHANGE ---');
  const heConfirmations = heEmails
    .filter(e => e.subject?.toLowerCase().includes('confirm'))
    .slice(0, 5);
  if (heConfirmations.length === 0) {
    console.log('Aucune confirmation trouvée');
    console.log('Autres sujets:');
    heEmails.slice(0, 5).forEach(e => console.log(`- ${e.subject}`));
  } else {
    heConfirmations.forEach(e => console.log(`- ${e.subject}`));
  }
}

main().catch(console.error);
