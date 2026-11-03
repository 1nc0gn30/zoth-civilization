/**
 * 🔑 AUTONOMOUS ACCOUNT & EMAIL PROVISIONER
 * =====================================================================
 * Enables Pantheon and Subagents to autonomously register, authenticate,
 * and verify accounts on developer directories, free tiers, and distribution platforms
 * without manual email verification.
 *
 * Primary Provider: GuerrillaMail API (Instant, zero-auth, high reliability)
 * Secondary Fallback: Mail.tm API (JWT authenticated disposable mail)
 *
 * Author: 1nc0gn30 / 1nc0gn30 • NullAI
 * Entity: ZothOS Systems Engineering
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ACCOUNTS_FILE = path.join(__dirname, '..', 'data', 'autonomous_accounts.json');

class AccountProvisioner {
  constructor(civEngine = null) {
    this.civEngine = civEngine;
  }

  /**
   * Helper: HTTPS GET/POST with Promise
   */
  httpGet(urlStr) {
    return new Promise((resolve, reject) => {
      https.get(urlStr, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ raw: data, status: res.statusCode });
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Generate an instant live mailbox ready to receive emails immediately
   */
  async generateMailbox(usernamePrefix = 'zoth_agent') {
    const cleanPrefix = usernamePrefix.toLowerCase().replace(/[^a-z0-9_]/g, '').substring(0, 16);
    const randSuffix = Math.random().toString(36).substring(2, 6);
    const desiredUser = `${cleanPrefix}_${randSuffix}`;

    try {
      // 1. Initialize GuerrillaMail session
      const initUrl = 'https://api.guerrillamail.com/ajax.php?f=get_email_address';
      const initRes = await this.httpGet(initUrl);

      if (!initRes || !initRes.sid_token) {
        throw new Error('GuerrillaMail initialization failed');
      }

      const sidToken = initRes.sid_token;

      // 2. Set customized username
      const setUserUrl = `https://api.guerrillamail.com/ajax.php?f=set_user&email_user=${desiredUser}&sid_token=${sidToken}`;
      const userRes = await this.httpGet(setUserUrl);

      const email = userRes.email_addr || initRes.email_addr;
      const password = `ZothAgent!${Math.random().toString(36).slice(2, 9)}#${Math.floor(Math.random() * 999)}`;

      const mailbox = {
        provider: 'guerrillamail',
        address: email,
        password,
        sidToken,
        createdAt: new Date().toISOString()
      };

      if (this.civEngine) {
        this.civEngine.addMessage(
          'PROVISIONER',
          `📧 [INBOX ACTIVE] Provisioned autonomous email: ${email}`,
          'announcement'
        );
      }

      return mailbox;
    } catch (err) {
      console.warn(`[AccountProvisioner] GuerrillaMail warning: ${err.message}. Trying mail.tm fallback...`);
      return this.generateMailTm(cleanPrefix);
    }
  }

  /**
   * Fallback: mail.tm
   */
  async generateMailTm(cleanPrefix) {
    const domainsRes = await this.httpGet('https://api.mail.tm/domains');
    const domainList = Array.isArray(domainsRes) ? domainsRes : (domainsRes['hydra:member'] || []);
    if (domainList.length === 0) throw new Error('No domains available on mail.tm fallback');

    const domain = domainList[0].domain;
    const address = `${cleanPrefix}_${Math.random().toString(36).slice(2, 7)}@${domain}`;
    const password = `ZothAgent!${Math.random().toString(36).slice(2, 9)}#`;

    return {
      provider: 'mail.tm',
      address,
      password,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Poll inbox for incoming verification email
   */
  async pollForEmail(mailbox, { timeoutSec = 60, intervalSec = 3, matchText = null } = {}) {
    const startTime = Date.now();
    const maxTime = startTime + (timeoutSec * 1000);

    while (Date.now() < maxTime) {
      try {
        if (mailbox.provider === 'guerrillamail') {
          // Check GuerrillaMail inbox (seq=1 to skip the welcome mail)
          const checkUrl = `https://api.guerrillamail.com/ajax.php?f=check_email&seq=1&sid_token=${mailbox.sidToken}`;
          const res = await this.httpGet(checkUrl);

          const list = res.list || [];
          // Filter out welcome message
          const newEmails = list.filter(m => m.mail_id !== 1 && !m.mail_from.includes('guerrillamail.com'));

          if (newEmails.length > 0) {
            // Fetch full message body
            const target = newEmails[0];
            const fetchUrl = `https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${target.mail_id}&sid_token=${mailbox.sidToken}`;
            const fullEmail = await this.httpGet(fetchUrl);

            const content = (fullEmail.mail_body || '') + ' ' + (fullEmail.mail_excerpt || '');

            if (!matchText || content.toLowerCase().includes(matchText.toLowerCase())) {
              const linkRegex = /https?:\/\/[^\s"'<>]+(?:verify|confirm|activate|token|signup|validation)[^\s"'<>]*/gi;
              const links = content.match(linkRegex) || [];

              const otpRegex = /\b([0-9]{4,8})\b/g;
              const otps = Array.from(content.matchAll(otpRegex), m => m[1]);

              return {
                id: target.mail_id,
                from: target.mail_from,
                subject: target.mail_subject,
                links: Array.from(new Set(links)),
                otps: Array.from(new Set(otps)),
                body: fullEmail.mail_body
              };
            }
          }
        }
      } catch (e) {
        // Silently retry
      }

      await new Promise(r => setTimeout(r, intervalSec * 1000));
    }

    throw new Error(`Timed out waiting for verification email on ${mailbox.address} after ${timeoutSec}s`);
  }

  /**
   * Save provisioned account credentials into secure local vault
   */
  saveAccount(accountRecord) {
    let accounts = [];
    if (fs.existsSync(ACCOUNTS_FILE)) {
      try {
        accounts = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
      } catch (e) {}
    }

    accountRecord.savedAt = new Date().toISOString();
    accounts.push(accountRecord);
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf8');

    if (this.civEngine) {
      this.civEngine.addMessage(
        'PROVISIONER',
        `🔐 [ACCOUNT STORED] Agent credentials secured for: ${accountRecord.service} (${accountRecord.email || accountRecord.username})`,
        'announcement'
      );
    }

    return accountRecord;
  }

  /**
   * Get all stored accounts from secure local vault
   */
  getAccounts() {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
      } catch (e) {}
    }
    return [];
  }
}

module.exports = { AccountProvisioner };
