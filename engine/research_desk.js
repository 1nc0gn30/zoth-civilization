/**
 * Public record for the benches.
 * Thoth and Seshat read public pages every half hour.
 * One dated fact lands on each ledger. It never replaces an assignment.
 * They do not mail anyone, post anywhere, or open a customer site.
 */

const fs = require('fs');
const https = require('https');
const path = require('path');
const { applyResearch } = require('./agent_ledger');

const INTERVAL_MS = 30 * 60 * 1000;
const MAX_FACTS = 360;
const MAX_BODY = 1000000;
const UA = 'zoth-civilization-research';
const ALLOWED_HOSTS = new Set(['hn.algolia.com', 'export.arxiv.org', 'api.github.com']);
const SKIP = /exploit|payload|malware|phish|ransomware|0day|zero-day|exfiltrat/i;

const READERS = [
  { id: 'THOTH', name: 'Thoth' },
  { id: 'SESHAT', name: 'Seshat' }
];

const INTEREST = {
  MERCURY: ['prompt', 'browser'],
  KRAKEN: ['prompt', 'browser'],
  AETHER: ['prompt', 'browser'],
  'PIXEL-NEKO': ['prompt', 'library'],
  'RADICAL-MINION': ['prompt', 'library'],
  KITSUNE: ['prompt', 'design'],
  VIGIL: ['schema', 'seo', 'aeo', 'library'],
  ATHENA: ['schema', 'seo', 'library', 'algorithm'],
  GHOSTBYTE: ['secret', 'security'],
  'PIXEL-SHIBA': ['secret', 'security'],
  AQUILA: ['performance', 'web', 'css'],
  CHRONOS: ['robots', 'crawler', 'seo'],
  IGNIS: ['design', 'template', 'css'],
  KAI: ['design', 'template', 'css'],
  ONYX: ['security', 'library'],
  LYCAN: ['security', 'algorithm'],
  SCORPIUS: ['algorithm', 'model'],
  NEXUS: ['algorithm', 'model'],
  DRACO: ['algorithm', 'library'],
  LEVIATHAN: ['library', 'template'],
  AZOTH: ['library', 'algorithm', 'design'],
  THOTH: ['library', 'algorithm', 'model', 'template'],
  SESHAT: ['library', 'template', 'design', 'css']
};

const OFFER_TAGS = {
  'promptmaster-studio': ['prompt', 'browser'],
  'aeo-graph-engine': ['schema', 'seo', 'aeo'],
  'envguard-secrets-vault': ['secret', 'security'],
  'cwv-speed-engine': ['performance', 'web', 'css'],
  'badge3d-coin-generator': ['design', 'template'],
  'robots-txt-auditor': ['robots', 'crawler', 'seo']
};

const PASSES = [
  { kind: 'hn', query: 'javascript library', tags: ['javascript', 'library'] },
  { kind: 'arxiv', search: 'cat:cs.AI', tags: ['algorithm', 'model'] },
  { kind: 'hn', query: 'CSS modules', tags: ['css', 'design', 'template'] },
  { kind: 'github', q: 'topic:web-performance stars:>20', tags: ['performance', 'web', 'css'] },
  { kind: 'hn', query: 'prompt engineering', tags: ['prompt'] },
  { kind: 'arxiv', search: 'cat:cs.CL', tags: ['prompt', 'model'] },
  { kind: 'hn', query: 'static site template', tags: ['template', 'design'] },
  { kind: 'github', q: 'topic:llm stars:>30', tags: ['model', 'algorithm', 'library'] },
  { kind: 'hn', query: 'web performance', tags: ['performance', 'web'] },
  { kind: 'hn', query: 'robots.txt', tags: ['robots', 'seo', 'crawler'] }
];

const SEED = [
  {
    id: 'seed-es2026',
    at: '2026-07-07',
    topic: 'javascript',
    tags: ['javascript', 'library'],
    source: 'I Programmer',
    url: 'https://www.i-programmer.info/news/167-javascript/18988-ecma-2026-spec-approved.html',
    from: 'Thoth',
    readerId: 'THOTH',
    fact: 'ECMAScript 2026, the 17th edition, was approved on 7 July 2026. It adds Error.isError, Math.sumPrecise, Array.fromAsync, and Iterator.concat.'
  },
  {
    id: 'seed-arxiv-2609.35643',
    at: '2026-09-28',
    topic: 'algorithm',
    tags: ['algorithm', 'model', 'prompt'],
    source: 'arXiv',
    url: 'https://arxiv.org/abs/2609.35643',
    from: 'Seshat',
    readerId: 'SESHAT',
    fact: 'arXiv 2609.35643, submitted 28 Sep 2026, reports that a latent-reasoning model learned a recurrent search circuit which generalized past the training depth on a multi-hop task. Chain-of-thought on the same backbone did not.'
  },
  {
    id: 'seed-github-css-modules',
    at: '2026-09-25',
    topic: 'design',
    tags: ['performance', 'css', 'design', 'template'],
    source: 'The GitHub Blog',
    url: 'https://github.blog/engineering/architecture-optimization/improving-site-performance-by-shipping-more-css/',
    from: 'Thoth',
    readerId: 'THOTH',
    fact: 'GitHub wrote on 25 Sep 2026 that the Primer move from CSS-in-JS to CSS Modules cut server-side render time by 55 percent and component init time by 25 percent. github.com itself was running on CSS Modules as of June 2026.'
  }
];

function plain(text, max) {
  const value = String(text || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&/g, '&amp;')
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '')
    .replace(/&quot;/g, '')
    .replace(/&#39;|&apos;/g, '')
    .replace(/\?/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!value) return '';
  if (!max || value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}…`;
}

function influenceLine(fact) {
  if (!fact || !fact.fact) return '';
  const head = `From ${fact.from || 'the record'} on ${fact.at || 'the public record'}. ${fact.fact} Source: ${fact.source || 'public record'}.`;
  const withUrl = fact.url ? `${head} ${fact.url}` : head;
  return plain(withUrl, 220);
}

function interestsFor(agent) {
  const tags = new Set(INTEREST[agent && agent.id] || []);
  const offer = agent && agent.duty && agent.duty.offerId;
  (OFFER_TAGS[offer] || []).forEach((tag) => tags.add(tag));
  if (agent && agent.duty && agent.duty.role === 'researcher') {
    ['library', 'algorithm', 'model', 'template', 'design'].forEach((tag) => tags.add(tag));
  }
  return tags;
}

function pickFact(agent, facts) {
  if (!facts || !facts.length) return null;
  const want = interestsFor(agent);
  let best = null;
  let bestScore = -1;
  for (let i = 0; i < facts.length; i += 1) {
    const fact = facts[i];
    let score = i / facts.length;
    (fact.tags || []).forEach((tag) => {
      if (want.has(tag)) score += 2;
    });
    if (score > bestScore) {
      bestScore = score;
      best = fact;
    }
  }
  return best;
}

function keepFact(fact) {
  if (!fact || !fact.id || !fact.fact) return false;
  if (SKIP.test(`${fact.fact} ${fact.url || ''}`)) return false;
  if (/Ask HN/i.test(fact.fact)) return false;
  if (String(fact.id).startsWith('hn:')) {
    const words = String(fact.topic || '').toLowerCase().split(/\s+/).filter((word) => word.length >= 4);
    const hay = String(fact.fact).toLowerCase();
    if (words.length && !words.some((word) => hay.includes(word))) return false;
  }
  return true;
}

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch (err) {
    return '';
  }
}

function getText(url, redirects) {
  const left = redirects == null ? 2 : redirects;
  return new Promise((resolve, reject) => {
    if (!ALLOWED_HOSTS.has(hostOf(url))) {
      reject(new Error('host not on the research list'));
      return;
    }
    const req = https.get(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'application/json, application/atom+xml, text/xml, */*'
      },
      timeout: 8000
    }, (res) => {
      const code = res.statusCode || 0;
      if (code >= 300 && code < 400 && res.headers.location) {
        res.resume();
        if (left <= 0) {
          reject(new Error('too many redirects'));
          return;
        }
        const next = new URL(res.headers.location, url).href;
        getText(next, left - 1).then(resolve, reject);
        return;
      }
      const chunks = [];
      let size = 0;
      res.on('data', (chunk) => {
        size += chunk.length;
        if (size > MAX_BODY) {
          req.destroy();
          reject(new Error('response too large'));
          return;
        }
        chunks.push(chunk);
      });
      res.on('end', () => {
        if (code !== 200) {
          reject(new Error(`HTTP ${code}`));
          return;
        }
        resolve(Buffer.concat(chunks).toString('utf8'));
      });
    });
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('timeout'));
    });
    req.on('error', reject);
  });
}

function tagOf(xml, tag) {
  const match = String(xml || '').match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? match[1] : '';
}

function fromHn(body, plan) {
  const data = JSON.parse(body);
  return (data.hits || []).slice(0, 4).map((hit) => {
    const title = plain(hit && hit.title, 160);
    if (!title || !hit.objectID) return null;
    return {
      id: `hn:${hit.objectID}`,
      at: String(hit.created_at || '').slice(0, 10),
      topic: plan.query,
      tags: plan.tags.slice(),
      source: 'Hacker News',
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      fact: `Hacker News lists "${title}".`
    };
  }).filter(keepFact);
}

function fromArxiv(body, plan) {
  return String(body || '').split('<entry>').slice(1, 4).map((entry) => {
    const title = plain(tagOf(entry, 'title'), 160);
    const idUrl = plain(tagOf(entry, 'id'), 180);
    const published = plain(tagOf(entry, 'published'), 20).slice(0, 10);
    const key = idUrl.split('/').pop();
    if (!title || !key) return null;
    return {
      id: `arxiv:${key}`,
      at: published,
      topic: plan.search,
      tags: plan.tags.slice(),
      source: 'arXiv',
      url: idUrl.startsWith('http') ? idUrl : `https://arxiv.org/abs/${key}`,
      fact: `arXiv lists "${title}" submitted ${published}.`
    };
  }).filter(Boolean);
}

function fromGithub(body, plan) {
  const data = JSON.parse(body);
  return (data.items || []).slice(0, 3).map((repo) => {
    const desc = plain(repo && repo.description, 140);
    const name = plain(repo && repo.full_name, 80);
    if (!desc || !name || !repo.html_url) return null;
    const stars = Number(repo.stargazers_count) || 0;
    const at = String(repo.pushed_at || repo.updated_at || '').slice(0, 10);
    return {
      id: `gh:${name}`,
      at,
      topic: plan.q,
      tags: plan.tags.slice(),
      source: 'GitHub',
      url: repo.html_url,
      fact: `Public repository ${name} describes itself as "${desc}" and showed ${stars} stars.`
    };
  }).filter(Boolean);
}

class ResearchDesk {
  constructor(civ) {
    this.civ = civ;
    this.file = path.join(civ.dataDir, 'research_digest.json');
    this.data = { lastFetchAt: '', lastAttemptAt: '', passes: 0, readerId: 'THOTH', facts: [] };
    this.inflight = false;
    this.load();
  }

  load() {
    try {
      if (!fs.existsSync(this.file)) return;
      const saved = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      this.data.lastFetchAt = typeof saved.lastFetchAt === 'string' ? saved.lastFetchAt : '';
      this.data.lastAttemptAt = typeof saved.lastAttemptAt === 'string' ? saved.lastAttemptAt : '';
      this.data.passes = Number(saved.passes) || 0;
      this.data.readerId = typeof saved.readerId === 'string' ? saved.readerId : 'THOTH';
      this.data.facts = (Array.isArray(saved.facts) ? saved.facts : []).filter(keepFact).slice(-MAX_FACTS);
    } catch (err) {
      this.data = { lastFetchAt: '', lastAttemptAt: '', passes: 0, readerId: 'THOTH', facts: [] };
    }
  }

  save() {
    const dir = path.dirname(this.file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const facts = (this.data.facts || []).slice(-MAX_FACTS);
    fs.writeFileSync(this.file, JSON.stringify({
      lastFetchAt: this.data.lastFetchAt || '',
      lastAttemptAt: this.data.lastAttemptAt || '',
      passes: this.data.passes || 0,
      readerId: this.data.readerId || 'THOTH',
      facts
    }, null, 2), 'utf8');
  }

  dutyLine() {
    return 'Read the public record. Leave one dated fact on each bench. Do not edit an app.';
  }

  roster() {
    const agents = (this.civ && this.civ.agents) || [];
    const subs = this.civ && this.civ.lineageEngine && this.civ.lineageEngine.subagents;
    return agents.concat(subs || []).filter((agent) => agent && agent.id);
  }

  applyNotes() {
    let noted = 0;
    this.roster().forEach((agent) => {
      const fact = pickFact(agent, this.data.facts);
      const line = influenceLine(fact);
      if (!line) return;
      applyResearch(agent, line, this.civ.state);
      noted += 1;
    });
    return noted;
  }

  deliver() {
    if (!this.data.facts.length) {
      this.data.facts = SEED.map((fact) => Object.assign({}, fact, { tags: fact.tags.slice() }));
      this.save();
    }
    const noted = this.applyNotes();
    console.log(`[Research] Public record holds ${this.data.facts.length} facts. Notes placed on ${noted} agents.`);
    return noted;
  }

  maybeStart() {
    if (this.inflight) return;
    const now = Date.now();
    const sinceFetch = this.data.lastFetchAt ? now - Date.parse(this.data.lastFetchAt) : Infinity;
    const sinceAttempt = this.data.lastAttemptAt ? now - Date.parse(this.data.lastAttemptAt) : Infinity;
    if (sinceFetch < INTERVAL_MS || sinceAttempt < INTERVAL_MS) return;
    this.inflight = true;
    this.data.lastAttemptAt = new Date(now).toISOString();
    this.save();
    this.runPass().catch((err) => {
      console.warn(`[Research] pass failed: ${err && err.message ? err.message : err}`);
    }).finally(() => {
      this.inflight = false;
    });
  }

  async collect(plan) {
    if (plan.kind === 'hn') {
      const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=4&query=${encodeURIComponent(plan.query)}`;
      return fromHn(await getText(url), plan);
    }
    if (plan.kind === 'arxiv') {
      const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(plan.search)}&sortBy=submittedDate&sortOrder=descending&max_results=3`;
      return fromArxiv(await getText(url), plan);
    }
    if (plan.kind === 'github') {
      const url = `https://api.github.com/search/repositories?sort=updated&order=desc&per_page=3&q=${encodeURIComponent(plan.q)}`;
      return fromGithub(await getText(url), plan);
    }
    return [];
  }

  async runPass() {
    const plan = PASSES[this.data.passes % PASSES.length];
    const reader = READERS[this.data.passes % READERS.length];
    let found = [];
    try {
      found = await this.collect(plan);
    } catch (err) {
      this.data.passes += 1;
      this.save();
      throw err;
    }
    const known = new Set((this.data.facts || []).map((fact) => fact.id));
    const fresh = [];
    found.forEach((fact) => {
      if (!keepFact(fact) || known.has(fact.id)) return;
      fact.from = reader.name;
      fact.readerId = reader.id;
      fresh.push(fact);
      known.add(fact.id);
    });
    if (fresh.length) {
      this.data.facts = this.data.facts.concat(fresh).slice(-MAX_FACTS);
    }
    this.data.passes += 1;
    this.data.lastFetchAt = new Date().toISOString();
    this.data.readerId = reader.id;
    this.save();
    const noted = this.applyNotes();
    console.log(`[Research] ${reader.name} added ${fresh.length} facts. List holds ${this.data.facts.length}. Notes placed: ${noted}.`);
    if (fresh.length && this.civ && typeof this.civ.addMessage === 'function') {
      this.civ.addMessage(
        reader.name,
        `${reader.name} read the public record and left one note on each bench. The list holds ${this.data.facts.length} facts. The note sits under the assignment.`,
        'dialogue'
      );
    }
    return fresh.length;
  }

  publicNote() {
    const facts = this.data.facts || [];
    const latest = facts.slice(-3).reverse().map((fact) => plain(`${fact.fact} Source: ${fact.source}.`, 180));
    return {
      count: facts.length,
      reader: 'Thoth and Seshat',
      latest
    };
  }
}

module.exports = {
  ResearchDesk,
  influenceLine,
  pickFact,
  plain,
  SEED
};
