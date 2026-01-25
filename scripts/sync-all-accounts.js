const API_URL = 'http://localhost:3000';
const API_KEY = 'dev-api-key-change-me-in-production';

async function syncAccount(accountId, email) {
  console.log(`\nSyncing ${email}...`);

  try {
    const resp = await fetch(`${API_URL}/api/sync/${accountId}`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fullSync: true })
    });

    const data = await resp.json();

    if (data.success) {
      console.log(`  ✅ Success: ${data.data?.emailsProcessed || 0} emails processed`);
      return { success: true, emails: data.data?.emailsProcessed || 0 };
    } else {
      console.log(`  ❌ Error: ${data.error?.message || 'Unknown error'}`);
      return { success: false, error: data.error?.message };
    }
  } catch (e) {
    console.log(`  ❌ Exception: ${e.message}`);
    return { success: false, error: e.message };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('   SYNCHRONISATION DE TOUS LES COMPTES EMAIL');
  console.log('='.repeat(60));

  // Get all accounts
  const resp = await fetch(`${API_URL}/api/accounts`, {
    headers: { 'x-api-key': API_KEY }
  });
  const { data: accounts } = await resp.json();

  console.log(`\nFound ${accounts.length} accounts to sync`);

  const results = [];

  for (const account of accounts) {
    if (!account.hasValidToken) {
      console.log(`\n⚠️  Skipping ${account.email} - invalid token`);
      continue;
    }

    const result = await syncAccount(account.id, account.email);
    results.push({ email: account.email, ...result });

    // Wait a bit between syncs to avoid rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('   RÉSUMÉ');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalEmails = successful.reduce((sum, r) => sum + (r.emails || 0), 0);

  console.log(`\nComptes synchronisés: ${successful.length}/${results.length}`);
  console.log(`Total emails traités: ${totalEmails}`);

  if (failed.length > 0) {
    console.log('\nÉchecs:');
    failed.forEach(f => console.log(`  - ${f.email}: ${f.error}`));
  }

  // Check total emails in database
  const emailsResp = await fetch(`${API_URL}/api/emails?limit=1`, {
    headers: { 'x-api-key': API_KEY }
  });
  const emailsData = await emailsResp.json();
  console.log(`\nTotal emails en base: ${emailsData.pagination?.total || 'N/A'}`);
}

main().catch(console.error);
