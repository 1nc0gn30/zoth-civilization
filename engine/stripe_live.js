/**
 * Live Stripe Telemetry & Checkout Funnel Engine for Zoth Civilization
 * Connects directly to Stripe API v1 using STRIPE_SECRET_KEY in .env.sovereign.
 * Tracks real-time balance, historical gross volume, live checkout sessions,
 * open/paid client invoices, and active payment link conversion readiness.
 */

const fs = require('fs');
const path = require('path');

const os = require('os');
const VAULT_ENV_PATH = path.join(os.homedir(), '.config', 'zoth-vault', 'stripe.env');
const ENV_PATH = path.join(__dirname, '..', '.env.sovereign');
const TREASURY_FILE = path.join(__dirname, '..', 'data', 'treasury_config.json');
const STRIPE_LINKS_FILE = path.join(__dirname, '..', 'data', 'stripe_links.json');

function loadStripeKey() {
  if (process.env.STRIPE_PAYMENT_LINK_API_KEY) return process.env.STRIPE_PAYMENT_LINK_API_KEY.trim();
  if (process.env.STRIPE_SECRET_KEY) return process.env.STRIPE_SECRET_KEY.trim();
  const bashrc = path.join(os.homedir(), '.bashrc');
  for (const candidate of [VAULT_ENV_PATH, bashrc, ENV_PATH]) {
    if (fs.existsSync(candidate)) {
      const raw = fs.readFileSync(candidate, 'utf8');
      const m = raw.match(/^(?:export\s+)?(?:STRIPE_PAYMENT_LINK_API_KEY|STRIPE_SECRET_KEY)=([^\r\n#]+)/m);
      if (m) {
        const k = m[1].trim().replace(/^["']|["']$/g, '');
        if (k) {
          process.env.STRIPE_SECRET_KEY = k;
          return k;
        }
      }
    }
  }
  return null;
}

async function stripeGet(endpoint) {
  const key = loadStripeKey();
  if (!key) throw new Error('STRIPE_SECRET_KEY missing from .env.sovereign');
  const res = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${key}`
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data && data.error && data.error.message) || `Stripe HTTP ${res.status}`);
  }
  return data;
}

async function fetchLiveStripeTelemetry() {
  const [bal, charges, sessions] = await Promise.all([
    stripeGet('/balance'),
    stripeGet('/charges?limit=100'),
    stripeGet('/checkout/sessions?limit=100')
  ]);

  let linksMap = {};
  try {
    linksMap = JSON.parse(fs.readFileSync(STRIPE_LINKS_FILE, 'utf8'));
  } catch (e) {}

  const plinkToApp = {};
  for (const [slug, info] of Object.entries(linksMap)) {
    if (info && info.paymentLinkId) {
      plinkToApp[info.paymentLinkId] = { slug, amountUSD: info.amountUSD, appUrl: info.appUrl, url: info.paymentLink };
    }
  }

  const availCents = (bal.available || []).reduce((s, x) => s + (x.amount || 0), 0);
  const pendCents = (bal.pending || []).reduce((s, x) => s + (x.amount || 0), 0);
  const availableUsd = +(availCents / 100).toFixed(2);
  const pendingUsd = +(pendCents / 100).toFixed(2);

  // Baseline before this campaign (11 historical charges, $1,755.00 historical gross, $0.17 balance)
  const BASELINE_GROSS_USD = 1755.00;
  const BASELINE_CHARGES_COUNT = 11;
  const TARGET_NEW_REVENUE_USD = 1000.00;
  const STRETCH_TARGET_USD = 10000.00;
  const DEADLINE_ISO = '2026-10-23T23:59:59-04:00'; // Friday 6-day deadline
  const PHANTOM_SOL_WALLET = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';

  let solBalance = 0;
  let solUsdEstimate = 0;
  try {
    const solRes = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [PHANTOM_SOL_WALLET] })
    });
    const solJson = await solRes.json();
    if (solJson && solJson.result && typeof solJson.result.value === 'number') {
      solBalance = +(solJson.result.value / 1e9).toFixed(6);
      solUsdEstimate = +(solBalance * 180).toFixed(2);
    }
  } catch (e) {}

  const succeededCharges = (charges.data || []).filter((c) => c.paid && c.status === 'succeeded');
  const totalGrossUsd = +(succeededCharges.reduce((s, c) => s + (c.amount || 0), 0) / 100).toFixed(2);
  const stripeNewRevenueUsd = +Math.max(0, totalGrossUsd - BASELINE_GROSS_USD).toFixed(2);
  const newRevenueUsd = +(stripeNewRevenueUsd + solUsdEstimate).toFixed(2);
  const newSalesCount = Math.max(0, succeededCharges.length - BASELINE_CHARGES_COUNT);

  const recentCharges = succeededCharges.slice(0, 15).map((c) => ({
    id: c.id,
    amountUsd: +(c.amount / 100).toFixed(2),
    currency: c.currency,
    description: c.description || 'Stripe Payment',
    customerEmail: (c.billing_details && c.billing_details.email) || null,
    receiptUrl: c.receipt_url || null,
    createdAt: new Date(c.created * 1000).toISOString()
  }));

  const rawSessions = sessions.data || [];
  const openSessionsAll = rawSessions.filter((s) => s.status === 'open');
  const openValueUsd = +(openSessionsAll.reduce((acc, s) => acc + ((s.amount_total || 0) / 100), 0)).toFixed(2);
  const recentSessions = rawSessions.slice(0, 30).map((s) => {
    const appMeta = (s.payment_link && plinkToApp[s.payment_link]) || null;
    return {
      id: s.id,
      status: s.status,
      paymentStatus: s.payment_status,
      amountUsd: +((s.amount_total || 0) / 100).toFixed(2),
      paymentLinkId: s.payment_link || null,
      appSlug: appMeta ? appMeta.slug : (s.payment_link || 'direct-checkout'),
      appUrl: appMeta ? appMeta.appUrl : null,
      customerEmail: (s.customer_details && s.customer_details.email) || s.customer_email || null,
      customFields: s.custom_fields || [],
      successUrl: s.success_url || null,
      createdAt: new Date(s.created * 1000).toISOString()
    };
  });

  const hoursRemaining = +Math.max(0, (new Date(DEADLINE_ISO).getTime() - Date.now()) / 3600000).toFixed(1);

  const telemetry = {
    syncedAt: new Date().toISOString(),
    campaignGoal: {
      deadlineIso: DEADLINE_ISO,
      deadlineLabel: 'Friday, Oct 23, 2026 (6-Day Sprint)',
      hoursRemaining,
      targetNewRevenueUsd: TARGET_NEW_REVENUE_USD,
      stretchTargetUsd: STRETCH_TARGET_USD,
      stripeNewRevenueUsd,
      phantomSolWallet: PHANTOM_SOL_WALLET,
      phantomSolBalance: solBalance,
      phantomSolUsd: solUsdEstimate,
      newRevenueUsd,
      newSalesCount,
      remainingToGoalUsd: +Math.max(0, TARGET_NEW_REVENUE_USD - newRevenueUsd).toFixed(2),
      remainingToStretchUsd: +Math.max(0, STRETCH_TARGET_USD - newRevenueUsd).toFixed(2),
      percentComplete: +((newRevenueUsd / TARGET_NEW_REVENUE_USD) * 100).toFixed(2)
    },
    balance: {
      availableUsd,
      pendingUsd,
      phantomSolBalance: solBalance,
      phantomSolUsd: solUsdEstimate,
      totalBalanceUsd: +(availableUsd + pendingUsd + solUsdEstimate).toFixed(2)
    },
    charges: {
      succeededCount: succeededCharges.length,
      totalGrossUsd,
      newRevenueUsd,
      recent: recentCharges
    },
    checkoutSessions: {
      totalInitiated: rawSessions.length,
      completedCount: rawSessions.filter((s) => s.payment_status === 'paid').length,
      openCount: openSessionsAll.length,
      openValueUsd,
      recent: recentSessions
    },
    catalogLinks: linksMap
  };

  try {
    if (fs.existsSync(TREASURY_FILE)) {
      const t = JSON.parse(fs.readFileSync(TREASURY_FILE, 'utf8'));
      t.stripeAvailableUsd = availableUsd;
      t.stripePendingUsd = pendingUsd;
      t.stripeHistoricalGrossUsd = totalGrossUsd;
      t.stripeNewRevenueUsd = newRevenueUsd;
      t.stripeSucceededCount = succeededCharges.length;
      t.stripeCheckoutSessionsCount = rawSessions.length;
      t.lastStripeSyncAt = telemetry.syncedAt;
      fs.writeFileSync(TREASURY_FILE, JSON.stringify(t, null, 2));
    }
  } catch (e) {}

  return telemetry;
}

module.exports = {
  fetchLiveStripeTelemetry,
  loadStripeKey
};
