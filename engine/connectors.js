/**
 * Connectors the operator opens on purpose.
 * Gmail can read a verification message for one approved place.
 * It cannot send mail, and it cannot open a second account on the same place.
 */

const fs = require('fs');
const path = require('path');
const tls = require('tls');

const PLACES = [
  { id: 'hacker_news', name: 'Hacker News', ownerId: 'RADICAL-MINION', terms: ['Hacker News', 'ycombinator'] },
  { id: 'x', name: 'X', ownerId: 'PIXEL-NEKO', terms: ['X', 'Twitter'] },
  { id: 'devto', name: 'Dev.to', ownerId: 'KITSUNE', terms: ['dev.to', 'Dev'] }
];

function clip(text, max) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  return value.length <= max ? value : value.slice(0, max - 1).trim();
}

function validAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function findProof(text) {
  const body = String(text || '');
  const linkMatch = body.match(/https?:\/\/[^\s"'<>]+/i);
  const codeMatch = body.match(/\b(\d{4,8})\b/);
  return {
    link: linkMatch ? clip(linkMatch[0], 300) : '',
    code: codeMatch ? codeMatch[1] : ''
  };
}

function imapCommand(socket, tag, command) {
  return new Promise((resolve, reject) => {
    let buf = '';
    const onData = (chunk) => {
      buf += chunk.toString('utf8');
      const done = buf.split(/\r?\n/).some((line) => line.startsWith(`${tag} `));
      if (!done) return;
      socket.off('data', onData);
      if (buf.includes(`${tag} OK`)) resolve(buf);
      else reject(new Error(clip(buf.split(/\r?\n/).filter((line) => line.startsWith(`${tag} `)).join(' '), 180) || 'Mail command failed'));
    };
    socket.on('data', onData);
    socket.write(`${tag} ${command}\r\n`);
  });
}

function readVerification(address, password, terms) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host: 'imap.gmail.com', port: 993, servername: 'imap.gmail.com' });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('The mailbox did not answer in time.'));
    }, 12000);
    socket.once('error', (err) => {
      clearTimeout(timer);
      reject(new Error('The mailbox could not be reached.'));
    });
    socket.once('data', async () => {
      try {
        const user = String(address).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const pass = String(password).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        await imapCommand(socket, 'A1', `LOGIN "${user}" "${pass}"`);
        await imapCommand(socket, 'A2', 'SELECT INBOX');
        const term = (terms && terms[0]) || 'verification';
        const found = await imapCommand(socket, 'A3', `SEARCH TEXT "${term.replace(/"/g, '')}"`);
        const ids = (found.match(/\* SEARCH(.*)/) || ['', ''])[1].trim().split(/\s+/).filter(Boolean);
        const last = ids[ids.length - 1];
        if (!last) {
          await imapCommand(socket, 'A5', 'LOGOUT');
          clearTimeout(timer);
          socket.end();
          resolve({ found: false, subject: '', link: '', code: '' });
          return;
        }
        const fetched = await new Promise((res, rej) => {
          let buf = '';
          const onData = (chunk) => {
            buf += chunk.toString('utf8');
            if (!buf.includes('A4 OK')) return;
            socket.off('data', onData);
            if (buf.includes('A4 OK')) res(buf);
            else rej(new Error('Could not read that message.'));
          };
          socket.on('data', onData);
          socket.write(`A4 FETCH ${last} (BODY.PEEK[HEADER.FIELDS (SUBJECT)] BODY.PEEK[TEXT]<0.4000>)\r\n`);
        });
        await imapCommand(socket, 'A5', 'LOGOUT');
        clearTimeout(timer);
        socket.end();
        const subject = ((fetched.match(/Subject:\s*(.+)/i) || [])[1] || '').trim();
        const proof = findProof(fetched);
        resolve({ found: true, subject: clip(subject, 140), link: proof.link, code: proof.code });
      } catch (err) {
        clearTimeout(timer);
        socket.destroy();
        const message = String(err && err.message || '');
        if (/AUTH|LOGIN|credential|invalid/i.test(message)) {
          reject(new Error('Gmail refused that app password.'));
          return;
        }
        reject(new Error(message || 'Could not read the mailbox.'));
      }
    });
  });
}

class Connectors {
  constructor(civEngine) {
    this.civ = civEngine;
    this.file = path.join(civEngine.dataDir, 'connectors.json');
    this.secretFile = path.join(civEngine.dataDir, 'connectors.secret.json');
    this.state = { gmail: { address: '', openedAt: '' }, grants: {} };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.file)) {
        const saved = JSON.parse(fs.readFileSync(this.file, 'utf8'));
        this.state.gmail = saved.gmail || this.state.gmail;
        this.state.grants = saved.grants || {};
      }
    } catch (err) {
      this.state = { gmail: { address: '', openedAt: '' }, grants: {} };
    }
  }

  save() {
    const dir = path.dirname(this.file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const pub = {
      gmail: {
        address: this.state.gmail.address || '',
        openedAt: this.state.gmail.openedAt || ''
      },
      grants: this.state.grants
    };
    fs.writeFileSync(this.file, JSON.stringify(pub, null, 2), 'utf8');
  }

  secret() {
    try {
      if (!fs.existsSync(this.secretFile)) return '';
      const saved = JSON.parse(fs.readFileSync(this.secretFile, 'utf8'));
      return saved && saved.appPassword ? String(saved.appPassword) : '';
    } catch (err) {
      return '';
    }
  }

  writeSecret(password) {
    const dir = path.dirname(this.secretFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.secretFile, JSON.stringify({ appPassword: password }), { mode: 0o600 });
    fs.chmodSync(this.secretFile, 0o600);
  }

  openGmail(input) {
    const address = String(input && input.address || '').trim();
    if (!validAddress(address)) throw new Error('Enter the Gmail address.');
    const password = String(input && input.appPassword || '');
    if (!password && !this.secret()) throw new Error('Enter a Gmail app password. It stays on this machine.');
    if (password) this.writeSecret(password);
    this.state.gmail = { address, openedAt: new Date().toISOString() };
    this.save();
    return this.snapshot();
  }

  revoke() {
    this.state = { gmail: { address: '', openedAt: '' }, grants: {} };
    this.save();
    if (fs.existsSync(this.secretFile)) fs.unlinkSync(this.secretFile);
    return this.snapshot();
  }

  grant(placeId) {
    const place = PLACES.find((item) => item.id === placeId);
    if (!place) throw new Error('That place is not on the list.');
    if (!this.state.gmail.address || !this.secret()) throw new Error('Open the Gmail connector first.');
    if (this.state.grants[place.id] && this.state.grants[place.id].status === 'approved') {
      return this.snapshot();
    }
    this.state.grants[place.id] = { status: 'approved', at: new Date().toISOString() };
    this.save();
    return this.snapshot();
  }

  async pull(placeId) {
    const place = PLACES.find((item) => item.id === placeId);
    if (!place) throw new Error('That place is not on the list.');
    const grant = this.state.grants[place.id];
    if (!grant || grant.status !== 'approved') throw new Error('Approve that place first.');
    const password = this.secret();
    if (!password || !this.state.gmail.address) throw new Error('Open the Gmail connector first.');
    const proof = await readVerification(this.state.gmail.address, password, place.terms);
    return {
      placeId: place.id,
      found: proof.found,
      subject: proof.subject,
      link: proof.link,
      code: proof.code
    };
  }

  snapshot() {
    const agents = (this.civ && this.civ.agents) || [];
    return {
      gmail: {
        open: !!(this.state.gmail.address && this.secret()),
        address: this.state.gmail.address || '',
        canRead: true,
        canSend: false
      },
      places: PLACES.map((place) => {
        const agent = agents.find((item) => item && item.id === place.ownerId);
        const grant = this.state.grants[place.id];
        return {
          id: place.id,
          name: place.name,
          ownerId: place.ownerId,
          ownerName: agent ? agent.name : place.ownerId,
          status: grant && grant.status === 'approved' ? 'approved' : 'closed'
        };
      })
    };
  }
}

module.exports = { Connectors, PLACES, findProof, validAddress };
