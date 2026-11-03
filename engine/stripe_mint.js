/**
 * 🪙 SOVEREIGN MINT & PAYMENT ENGINE (Solana Tip, Solana, Stripe)
 * =====================================================================
 * Autonomous Monetization Engine for Zoth Civilization.
 * Enables agents to create:
 * 1. Solana Tip Web3 payment widgets directly into Solana & BTC Taproot targets.
 * 2. Autonomous Stripe Payment Links via Stripe REST API (Zero external npm deps).
 * 3. Netlify serverless checkout blueprints.
 *
 * Author: 1nc0gn30 / 1nc0gn30 • NullAI
 * Public Solana: GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK
 * Public BTC Taproot: bc1p2dr247zklh8pnffak0ew7m82u2w8gx25ys28x7aavr95z674ydzsfw500t
 */

const https = require('https');
const querystring = require('querystring');

const path = require('path');
const fs = require('fs');

const SOLANA_RECEIVER = "GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK";
const BTC_RECEIVER = "bc1p2dr247zklh8pnffak0ew7m82u2w8gx25ys28x7aavr95z674ydzsfw500t";

class SovereignPaymentEngine {
  constructor() {
    this.solanaReceiver = SOLANA_RECEIVER;
    this.btcReceiver = BTC_RECEIVER;
    this.stripeKey = this._loadStripeKey();
  }

  _loadStripeKey() {
    if (process.env.STRIPE_PAYMENT_LINK_API_KEY) return process.env.STRIPE_PAYMENT_LINK_API_KEY.trim();
    if (process.env.STRIPE_SECRET_KEY) return process.env.STRIPE_SECRET_KEY.trim();
    const os = require('os');
    const vaultPath = path.join(os.homedir(), '.config', 'zoth-vault', 'stripe.env');
    const bashrcPath = path.join(os.homedir(), '.bashrc');
    const envPath = path.join(__dirname, '..', '.env.sovereign');
    for (const candidate of [vaultPath, bashrcPath, envPath]) {
      if (fs.existsSync(candidate)) {
        try {
          const content = fs.readFileSync(candidate, 'utf8');
          const m = content.match(/^(?:export\s+)?(?:STRIPE_PAYMENT_LINK_API_KEY|STRIPE_SECRET_KEY)=([^\r\n#]+)/m);
          if (m) {
            const k = m[1].trim().replace(/^["']|["']$/g, '');
            if (k) {
              process.env.STRIPE_SECRET_KEY = k;
              return k;
            }
          }
        } catch(e) {}
      }
    }
    return null;
  }

  setStripeKey(key) {
    if (key && (key.startsWith('sk_') || key.startsWith('rk_'))) {
      this.stripeKey = key;
      process.env.STRIPE_SECRET_KEY = key;
      return true;
    }
    return false;
  }

  async fetchBalance() {
    if (!this.stripeKey) {
      return { availableUSD: 0, pendingUSD: 0, totalUSD: 0, livemode: false };
    }
    try {
      const json = await this._stripeGet('/v1/balance');
      const available = (json.available || []).reduce((acc, c) => acc + (c.currency === 'usd' ? c.amount : 0), 0) / 100;
      const pending = (json.pending || []).reduce((acc, c) => acc + (c.currency === 'usd' ? c.amount : 0), 0) / 100;
      return {
        availableUSD: available,
        pendingUSD: pending,
        totalUSD: available + pending,
        livemode: Boolean(json.livemode)
      };
    } catch(err) {
      return { availableUSD: 0, pendingUSD: 0, totalUSD: 0, livemode: false };
    }
  }

  /**
   * Generates a Solana Tip Web3 checkout snippet for Netlify static / web3 apps.
   * Settles peer-to-peer into the sovereign wallet without middleman accounts.
   */
  generateSolanaTipSnippet({ productName, priceUSD, integration = "428790dd-7ad1-407c-8ecf-c048c77a4cb8" }) {
    return {
      protocol: "Solana Tip Web3 P2P",
      productName,
      priceUSD,
      integrationId: integration,
      targetWallet: this.solanaReceiver,
      scriptTag: ``,
      buttonHtml: `
<button id="solana_tip-pay-btn" class="solana_tip-btn" style="background: linear-gradient(135deg, #14F195, #9945FF); color: #000; font-weight: bold; padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; box-shadow: 0 0 15px rgba(20,241,149,0.3);">
  ⚡ Pay with Crypto (SOL / USDC) via Solana Tip
</button>
<script>
  document.getElementById('solana_tip-pay-btn').addEventListener('click', () => {
    if (typeof SolanaTipWidgets !== 'undefined') {
      SolanaTipWidgets.Payment({
        integration: '${integration}'
      });
    } else {
      window.open('solana:GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK', '_blank');
    }
  });
</script>
      `.trim()
    };
  }

  /**
   * Autonomously creates a Stripe Payment Link via Stripe REST API.
   * Uses Node standard library https module (Zero external dependencies).
   */
  async createStripePaymentLink({ name, amountCents = 1900, description = "Sovereign Micro-SaaS Access" }) {
    if (!this.stripeKey) {
      // Return simulated link if no live key in environment
      const mockId = 'plink_' + Math.random().toString(36).substring(2, 10);
      return {
        success: true,
        mode: "SIMULATED_TEST",
        paymentUrl: `https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X${mockId}`,
        name,
        amountUSD: (amountCents / 100).toFixed(2),
        note: "Stripe key not configured in .env. Set STRIPE_SECRET_KEY to enable live checkout link generation."
      };
    }

    try {
      // 1. Create Product
      const product = await this._stripePost('/v1/products', {
        name,
        description
      });

      // 2. Create Price
      const price = await this._stripePost('/v1/prices', {
        product: product.id,
        unit_amount: amountCents,
        currency: 'usd'
      });

      // 3. Create Payment Link
      const paymentLink = await this._stripePost('/v1/payment_links', {
        'line_items[0][price]': price.id,
        'line_items[0][quantity]': 1
      });

      return {
        success: true,
        mode: this.stripeKey.startsWith('sk_live_') ? "LIVE_PRODUCTION" : "TEST_MODE",
        paymentUrl: paymentLink.url,
        productId: product.id,
        priceId: price.id,
        name,
        amountUSD: (amountCents / 100).toFixed(2)
      };
    } catch (err) {
      console.error('[StripeMint] Error creating payment link:', err.message);
      return {
        success: false,
        error: err.message
      };
    }
  }

  _stripePost(path, data) {
    return new Promise((resolve, reject) => {
      const postData = querystring.stringify(data);
      const options = {
        hostname: 'api.stripe.com',
        port: 443,
        path,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, res => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.error ? parsed.error.message : body));
            }
          } catch (e) {
            reject(new Error(`Failed to parse Stripe response: ${body}`));
          }
        });
      });

      req.on('error', err => reject(err));
      req.write(postData);
      req.end();
    });
  }

  _stripeGet(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.stripe.com',
        port: 443,
        path,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.stripeKey}`,
          'User-Agent': 'ZothCivilization/1.0'
        }
      };

      const req = https.request(options, res => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.error ? parsed.error.message : body));
            }
          } catch (e) {
            reject(new Error(`Failed to parse Stripe response: ${body}`));
          }
        });
      });

      req.on('error', err => reject(err));
      req.end();
    });
  }
}

module.exports = { SovereignPaymentEngine };
