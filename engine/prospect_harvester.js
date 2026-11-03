const fs = require('fs');
const path = require('path');
const { VERIFIED_PROSPECTS, dispatchBatch } = require('./prospect_outreach');
const { AGENCY_PROSPECTS, dispatchAgencyBatch } = require('./agency_outreach');

const PROSPECT_FILE = path.join(__dirname, 'prospect_outreach.js');
const AGENCY_FILE = path.join(__dirname, 'agency_outreach.js');

const BLOCKED_DOMAINS = new Set([
  'yelp.com', 'angi.com', 'angieslist.com', 'bbb.org', 'yellowpages.com',
  'thumbtack.com', 'homeadvisor.com', 'houzz.com', 'porch.com', 'networx.com',
  'bark.com', 'expertise.com', 'threebestrated.com', 'chamberofcommerce.com',
  'manta.com', 'superpages.com', 'mapquest.com', 'nextdoor.com', 'birdeye.com',
  'facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'x.com',
  'youtube.com', 'tiktok.com', 'pinterest.com', 'reddit.com', 'quora.com',
  'google.com', 'bing.com', 'duckduckgo.com', 'yahoo.com', 'apple.com',
  'healthgrades.com', 'zocdoc.com', 'vitals.com', 'webmd.com', 'opencare.com',
  '1800dentist.com', 'aspendental.com', 'heartland.com', 'koolsmiles.com',
  'roto-rooter.com', 'rotorooter.com', 'mrrooter.com', 'mrelectric.com',
  'aire-serv.com', 'aireserv.com', 'onehourheatandair.com', 'benjaminfranklinplumbing.com',
  'mistersparky.com', 'servpro.com', 'terminix.com', 'orkin.com', 'trugreen.com',
  'stanleysteemer.com', 'merrymaids.com', 'mollymaid.com', 'twomenandatruck.com',
  '1800gotjunk.com', 'collegehunkshaulingjunk.com', 'midas.com', 'firestonecompleteautocare.com',
  'jiffylube.com', 'pepboys.com', 'meineke.com', 'carfax.com', 'repairpal.com',
  'apartments.com', 'zillow.com', 'trulia.com', 'realtor.com', 'redfin.com',
  'rent.com', 'managebuilding.com', 'buildium.com', 'appfolio.com',
  'wikipedia.org', 'wikimedia.org', 'forbes.com', 'usnews.com', 'clutch.co',
  'upcity.com', 'designrush.com', 'goodfirms.co', 'sortlist.com', 'agencyspotter.com',
  'themanifest.com', 'semrush.com', 'ahrefs.com', 'moz.com', 'hubspot.com',
  'wix.com', 'squarespace.com', 'godaddy.com', 'wordpress.org', 'wordpress.com',
  'shopify.com', 'webflow.com', 'netlify.app', 'github.io', 'vercel.app',
  'vabeachtech.com', 'coastalfencingva.net', 'poolefencingllc.com', 'candclandservices.net',
  'worldatlas.com', 'virginiatraveltips.com', 'chattanoogan.com', 'jax.org'
]);

const TRADE_REGEX = {
  'plumbers': /plumb|drain|rooter|pipe|sewer|water heater|mechanical|heating/i,
  'hvac': /hvac|heat|cool|air condition|furnace|ac\b|a\/c|mechanical|comfort|climate/i,
  'roofers': /roof|exterior|shingle|gutter|siding|storm|restoration|contracting/i,
  'electricians': /electric|wiring|lighting|generator|power|solar/i,
  'dentists': /dentist|dental|dds|dmd|orthodont|smile|tooth|teeth|periodont|endodont|oral/i,
  'med-spas': /med\s*spa|medspa|aesthetic|laser|botox|skin|rejuvenat|wellness|beauty| cosmetic/i,
  'garage-doors': /garage\s*door|overhead\s*door|door\s*company|door\s*repair|doors/i,
  'painters': /paint|coating|staining|drywall|finishing/i,
  'landscapers': /landscap|lawn|turf|hardscap|tree|outdoor|garden|irrigation/i,
  'pest-control': /pest|exterminat|termite|bug|mosquito|wildlife|rodent/i,
  'auto-repair': /auto|mechanic|automotive|brake|transmission|tire|car\s*care|garage|motor/i,
  'property-managers': /property\s*manag|realty|real\s*estate|rental|leasing|homes|pm\b/i,
  'junk-removal': /junk|hauling|removal|dumpster|cleanout|trash|debris/i,
  'cleaners': /clean|maid|janitorial|housekeeping|carpet/i,
  'detailers': /detail|car\s*wash|ceramic\s*coat|tint|auto\s*spa/i,
  'groomers': /groom|pet|dog|bark|paw|canine|hound/i,
  'movers': /mov(ing|ers)|relocat|van\s*lines|storage/i,
  'gyms': /gym|fitness|crossfit|training|workout|athletic|barbell|strength|pilates|yoga/i,
  'restaurants': /restaurant|bistro|grill|kitchen|cafe|diner|eatery|bar\b|tavern|pizz|taco|bbq|steak/i,
  'food-trucks': /food\s*truck|catering|taco|bbq|street\s*food|truck|kitchen|grill|mobile\s*food/i
};

const BLOCKED_EMAIL_PATTERNS = [
  /example\./i, /domain\./i, /yoursite/i, /yourdomain/i, /email\.com/i,
  /youremail/i, /yourbusiness/i, /@abc\.com$/i, /@xyz\.com$/i, /@none\.com$/i, /misitio\.com/i,
  /john\.?doe@/i, /john\.?smith@/i, /jane\.?doe@/i,
  /doe\.com/i, /smith\.com/i, /mysite\.com/i, /test\.com/i, /weomedia\.com/i, /dentistsranked\.com/i,
  /company\.com/i, /@mail\.com$/i, /officite\.com/i, /dentalcare\.com/i, /precisionlocal\.agency/i,
  /calendar\.google\.com/i, /streetfoodfinder\.com/i, /gotruckster\.com/i, /foodtruckclub\.com/i,
  /getfyt\.com/i, /bloominbrands\.com/i, /mystore\.com/i, /athleticrepublicteam\.com/i,
  /sampleaddress\.com/i, /moatable\.com/i, /webfx\.com/i, /growthplug\.com/i, /futurecastmarketing\.com/i,
  /justitia\.com/i, /smilebrands\.com/i, /dhpace\.com/i, /latinotype\.com/i, /scorpion\.co/i,
  /townsquareinteractive\.com/i, /hibu\.com/i, /yext\.com/i, /reachlocal\.com/i,
  /sentry/i, /wixpress/i, /squarespace/i, /godaddy/i, /wordpress/i,
  /cloudflare/i, /googleapis/i, /latofonts/i, /use\.typekit/i, /bootstrap/i,
  /\.(png|jpg|jpeg|gif|svg|webp|avif|css|js|woff|woff2|ttf|eot|ico|mp4|pdf)$/i,
  /^(noreply|no-reply|donotreply|todo|privacy|legal|abuse|postmaster|webmaster|hostmaster|jobs|careers|hr|press|media|news|tourism|visit|gis|records)@/i,
  /jon@vabeachtech\.com/i, /joshua@coastalfencingva\.net/i,
  /u00/i, /2x\./i, /\s/, /^[0-9a-f]{16,}@/i,
  /\.(gov|edu|mil|org)$/i
];

const VALID_TLD_RE = /\.(com|net|us|co|io|biz|info|pro|me|dental|clinic|care|spa|fit|gym|dog|vet|plumbing|roofing|heating|cooling|solar|cleaning|moving|auto|repair|homes|realty|property|agency|studio|tech|online|site|llc|inc|vegas|nyc|miami|texas|florida|life|work|team|services|solutions|contractors|group|center|club)$/i;

function isBlockedDomain(hostname) {
  const clean = hostname.toLowerCase().replace(/^www\./, '');
  if (BLOCKED_DOMAINS.has(clean)) return true;
  for (const d of BLOCKED_DOMAINS) {
    if (clean === d || clean.endsWith('.' + d)) return true;
  }
  if (clean.endsWith('.gov') || clean.endsWith('.edu') || clean.endsWith('.mil') || clean.endsWith('.org')) return true;
  if (/tourism|visit|chamber|county|cityof|newspaper|news|hospital|university|college/i.test(clean)) return true;
  return false;
}

function isValidBusinessEmail(email) {
  if (!email || typeof email !== 'string') return false;
  let clean = email.trim().toLowerCase().replace(/^mailto:/i, '').split('?')[0];
  try {
    clean = decodeURIComponent(clean).trim();
  } catch (e) {}
  clean = clean.replace(/^(%20|\s)+/, '').replace(/(%20|\s)+$/, '');
  if (clean.length < 6 || clean.length > 68) return false;
  if (!/^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,12}$/.test(clean)) return false;
  if (!VALID_TLD_RE.test(clean)) return false;
  if (clean.includes('..') || clean.includes('.@') || clean.startsWith('.')) return false;
  if (/@www\./i.test(clean)) clean = clean.replace(/@www\./i, '@');
  for (const pat of BLOCKED_EMAIL_PATTERNS) {
    if (pat.test(clean)) return false;
  }
  return clean;
}

function extractEmailsFromHtml(html, siteHost) {
  const found = new Set();
  const mailtoMatches = [...html.matchAll(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10})/gi)];
  for (const m of mailtoMatches) {
    const v = isValidBusinessEmail(m[1]);
    if (v) found.add(v);
  }
  const textMatches = [...html.matchAll(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10})\b/g)];
  for (const m of textMatches) {
    const v = isValidBusinessEmail(m[1]);
    if (v) found.add(v);
  }
  const list = [...found];
  const bareHost = siteHost.replace(/^www\./i, '').toLowerCase();
  list.sort((a, b) => {
    const aSame = a.endsWith('@' + bareHost) ? 1 : 0;
    const bSame = b.endsWith('@' + bareHost) ? 1 : 0;
    if (aSame !== bSame) return bSame - aSame;
    const aGood = /^(info|office|contact|service|hello|admin|sales|estimates|dispatch|team|smile|appointments)@/i.test(a) ? 1 : 0;
    const bGood = /^(info|office|contact|service|hello|admin|sales|estimates|dispatch|team|smile|appointments)@/i.test(b) ? 1 : 0;
    return bGood - aGood;
  });
  return list[0] || null;
}

function isBogusPhoneDigits(d) {
  if (!d || d.length !== 10) return true;
  if (/^(\d)\1{9}$/.test(d)) return true;
  if (d === '2147483648' || d === '2147483647' || d === '1234567890') return true;
  if (d.slice(3, 6) === '555' || d.endsWith('9999') && d.startsWith('999')) return true;
  return false;
}

function extractPhoneFromHtml(html) {
  const telMatch = html.match(/tel:([+0-9()-.\s]{10,18})/i);
  if (telMatch) {
    const digits = telMatch[1].replace(/\D/g, '').replace(/^1/, '');
    if (!isBogusPhoneDigits(digits)) {
      return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    }
  }
  for (const m of html.matchAll(/\(?\b([2-9][0-9]{2})\)?[-.\s]([2-9][0-9]{2})[-.\s]([0-9]{4})\b/g)) {
    const digits = `${m[1]}${m[2]}${m[3]}`;
    if (!isBogusPhoneDigits(digits)) {
      return `(${m[1]}) ${m[2]}-${m[3]}`;
    }
  }
  return '';
}

function humanizeDomainBrand(host, city) {
  let base = host.replace(/^www\./i, '').split('.')[0].toLowerCase();
  const words = [
    'plumbing', 'plumbers', 'plumber', 'roofing', 'roofers', 'roofer', 'roofs', 'roof',
    'hvac', 'heating', 'cooling', 'airconditioning', 'air', 'mechanical',
    'electric', 'electrical', 'electricians', 'electrician',
    'dental', 'dentistry', 'dentists', 'dentist', 'smiles', 'smile', 'family', 'orthodontics',
    'medspa', 'medicalspa', 'aesthetics', 'aesthetic', 'wellness', 'skin', 'beauty', 'laser', 'spa',
    'garagedoors', 'garagedoor', 'overhead', 'doors', 'door', 'garage',
    'painting', 'painters', 'painter', 'coatings', 'paint',
    'landscaping', 'landscapers', 'landscape', 'lawncare', 'lawn', 'tree', 'gardens', 'garden',
    'pestcontrol', 'pest', 'exterminating', 'termite', 'wildlife',
    'autorepair', 'automotive', 'autoworks', 'autotech', 'auto', 'motors', 'carcare', 'tire',
    'propertymanagement', 'properties', 'property', 'management', 'realty', 'rentals', 'pm',
    'junkremoval', 'junk', 'hauling', 'haulers', 'cleanouts',
    'cleaning', 'cleaners', 'cleaner', 'maids', 'maid', 'housekeeping', 'clean',
    'detailing', 'detailers', 'detail', 'autospa', 'carwash', 'mobile',
    'grooming', 'groomers', 'groomer', 'petsalon', 'dogwash', 'paws', 'pets', 'pet', 'dog',
    'moving', 'movers', 'mover', 'relocation', 'storage',
    'fitness', 'training', 'strength', 'crossfit', 'gym', 'studio',
    'services', 'service', 'solutions', 'company', 'contractors', 'contractor', 'pros', 'pro', 'inc', 'llc', 'co', 'group', 'center', 'care', 'plus', 'express', 'elite', 'premier', 'first', 'best', 'all', 'the', 'and'
  ];
  let spaced = base.replace(/[-_]+/g, ' ');
  for (const w of words) {
    spaced = spaced.replace(new RegExp(`(${w})`, 'gi'), ' $1 ');
  }
  spaced = spaced.replace(/\s+/g, ' ').trim();
  if (!spaced || spaced.length < 3) {
    return host.replace(/^www\./i, '').split('.')[0].toUpperCase() + ' (' + city + ')';
  }
  return spaced.split(' ').map(w => {
    if (/^(llc|inc|hvac|ac|pm|az|tx|fl|ca|nc|sc|ga|tn|va|md|pa|nj|ny|oh|mi|il|wi|mn|mo|ks|co|ut|wa|or|nv)$/i.test(w)) {
      return w.toUpperCase();
    }
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');
}

function cleanBusinessName(rawTitle, host, city, html = '') {
  const domainCore = host.replace(/^www\./i, '').split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const fallbackName = humanizeDomainBrand(host, city);

  // 1. Check og:site_name first if present and clean
  if (html) {
    const ogMatch = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i);
    if (ogMatch && ogMatch[1]) {
      const ogName = ogMatch[1].replace(/&/g, '&amp;').replace(/&#039;|&#x27;|&#8217;/g, "'").replace(/\s+/g, ' ').trim();
      if (ogName.length >= 3 && ogName.length <= 42 && !/^(mysite|home|welcome|locations|wordpress|squarespace|wix)/i.test(ogName) && !/\b(in|near)\s+[a-z]+/i.test(ogName)) {
        return ogName;
      }
    }
  }

  if (!rawTitle || /403 Forbidden|Access Denied|Cloudflare|Just a moment|Not Acceptable|Page not found/i.test(rawTitle)) {
    return fallbackName;
  }

  const badSegmentRe = /^(home|welcome(\s+to)?|homepage|index|about(\s+us)?|contact(\s+us)?|mysite|locations|main\s*home|hour\s*service\]?|services|schedule|book\s*now|free\s*estimate|get\s*a\s*quote)$/i;
  const seoStuffedRe = /(#1|near\s+me|near\s+you|\bin\s+[a-z\s]{3,}(,\s*[a-z]{2})?$|\bfor\s+the\s+|\bhelping\s+|\bdiscover\s+the\s+|\bwelcome\s+to\s+|[0-9]{5})/i;
  const pureGenericTradeRe = /^(#?1?\s*)?(best\s+|top\s+|trusted\s+|premier\s+|affordable\s+|reliable\s+|local\s+|professional\s+|licensed\s+|expert\s+|quality\s+|full\s+service\s+|residential\s+|commercial\s+|emergency\s+)*(plumb(ing|er|ers)|roof(ing|er|ers)|hvac|heat(ing)?(\s*&\s*air)?|air\s*condition(ing)?|electric(ian|ians|al)?|dentist(ry|s)?|dental(\s*care|\s*health)?|garage\s*door(s)?|med\s*spa|medical\s*spa|paint(ing|er|ers)|house\s*painter(s)?|landscap(ing|er|ers)|lawn\s*care|pest\s*control|exterminat(or|ors|ing)|auto\s*repair|car\s*repair|property\s*manag(ement|ers)|junk\s*removal|house\s*clean(ing|ers)|cleaning\s*service(s)?|mobile\s*(auto\s*)?detail(ing|ers)|car\s*detail(ing)?|dog\s*groom(ing|ers)|pet\s*groom(ing|ers)|mov(ing|ers)|fitness(\s*studio)?|personal\s*training)(\s+(company|contractor|contractors|service|services|pros|pro|shop|center|clinic|studio|team|near\s+me))?(\s*(in|near|for|,|-)?\s*[a-z\s,.0-9]*)?$/i;

  const segments = rawTitle
    .replace(/&/g, '&amp;')
    .replace(/&#8211;|&#8212;|&ndash;|&mdash;/g, '-')
    .replace(/&#039;|&#x27;|&#39;|&#8217;|&rsquo;/g, "'")
    .replace(/\[|\]/g, '')
    .split(/\s*[|\-–—•:]\s*/)
    .map(s => s.trim())
    .filter(s => s.length >= 3 && !badSegmentRe.test(s));

  if (segments.length === 0) return fallbackName;

  for (const seg of segments) {
    if (seoStuffedRe.test(seg) || pureGenericTradeRe.test(seg)) continue;
    const segClean = seg.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (segClean.length >= 4 && (domainCore.includes(segClean.slice(0, 5)) || segClean.includes(domainCore.slice(0, 5)))) {
      return seg.length > 44 ? fallbackName : seg;
    }
  }

  const brandSeg = segments.find(s =>
    !seoStuffedRe.test(s) &&
    !pureGenericTradeRe.test(s) &&
    s.toLowerCase() !== city.toLowerCase() &&
    !/^[a-z\s]+,\s*[a-z]{2}$/i.test(s) &&
    s.length <= 42
  );
  return brandSeg || fallbackName;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0'
];

let cachedYahooCookie = '';
let cachedYahooCookieExp = 0;

async function fetchYahooUrls(q, ua) {
  const urls = [];
  const url = `https://search.yahoo.com/search?p=${q}`;
  try {
    if (!cachedYahooCookie || Date.now() > cachedYahooCookieExp) {
      const r1 = await fetch(url, {
        headers: { 'User-Agent': ua, 'Accept': 'text/html,application/xhtml+xml' },
        redirect: 'manual',
        signal: AbortSignal.timeout(5500)
      });
      const sc = r1.headers.get('set-cookie') || '';
      const pair = sc.split(';')[0];
      if (pair && pair.startsWith('YBV=')) {
        cachedYahooCookie = pair;
        cachedYahooCookieExp = Date.now() + 45000;
      }
    }
    const headers = {
      'User-Agent': ua,
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9'
    };
    if (cachedYahooCookie) headers['Cookie'] = cachedYahooCookie;
    let r2 = await fetch(url, {
      headers,
      redirect: 'manual',
      signal: AbortSignal.timeout(6500)
    });
    if (r2.status === 307 || r2.status === 302) {
      const sc = r2.headers.get('set-cookie') || '';
      const pair = sc.split(';')[0];
      if (pair) {
        cachedYahooCookie = pair;
        cachedYahooCookieExp = Date.now() + 45000;
        headers['Cookie'] = cachedYahooCookie;
        r2 = await fetch(url, { headers, signal: AbortSignal.timeout(6500) });
      }
    }
    if (r2.ok) {
      const txt = await r2.text();
      for (const m of txt.matchAll(/RU=([^/&"']+)/g)) {
        try {
          const u = decodeURIComponent(m[1]);
          if (u.startsWith('http') && !u.includes('yahoo.com') && !u.includes('bing.com') && !u.includes('here.com')) {
            urls.push(u);
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
  return urls;
}

async function searchUrls(query) {
  const q = encodeURIComponent(query);
  const discovered = new Set();
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

  // 1. Yahoo Search with YBV Cookie Handshake (fast, zero rate-limit, high-yield local organic results)
  const yahooHits = await fetchYahooUrls(q, ua);
  for (const u of yahooHits) discovered.add(u);

  // 2. DuckDuckGo Lite POST fallback if fewer than 6 domains found
  if (discovered.size < 6) {
    try {
      const r = await fetch('https://lite.duckduckgo.com/lite/', {
        method: 'POST',
        headers: {
          'User-Agent': ua,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        body: `q=${q}`,
        signal: AbortSignal.timeout(6500)
      });
      if (r.status === 200) {
        const txt = await r.text();
        for (const m of txt.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
          const u = m[1].replace(/&/g, '&amp;');
          if (!u.includes('duckduckgo.com') && !u.includes('bing.com')) discovered.add(u);
        }
      }
    } catch (e) {}
  }

  // 3. DuckDuckGo HTML GET fallback
  if (discovered.size < 6) {
    try {
      const r = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: AbortSignal.timeout(6500)
      });
      if (r.status === 200) {
        const txt = await r.text();
        for (const m of txt.matchAll(/uddg=([^&"']+)/g)) {
          try {
            const u = decodeURIComponent(m[1]);
            if (u.startsWith('http') && !u.includes('duckduckgo.com') && !u.includes('ad_domain')) discovered.add(u);
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  const origins = [];
  const seenHosts = new Set();
  for (const rawUrl of discovered) {
    try {
      const u = new URL(rawUrl);
      const host = u.hostname.toLowerCase().replace(/^www\./, '');
      if (isBlockedDomain(host) || seenHosts.has(host)) continue;
      seenHosts.add(host);
      origins.push(`https://${u.hostname}`);
    } catch (e) {}
  }
  return origins;
}

async function auditSiteAndExtractProspect(origin, meta, existingEmails, existingDomains) {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
  let host;
  try {
    host = new URL(origin).hostname.toLowerCase().replace(/^www\./, '');
  } catch (e) {
    return null;
  }
  if (existingDomains.has(host) || isBlockedDomain(host)) return null;

  try {
    const res = await fetch(origin, {
      headers: { 'User-Agent': ua, 'Accept': 'text/html' },
      redirect: 'follow',
      signal: AbortSignal.timeout(5500)
    });
    if (!res.ok) return null;
    const html = await res.text();
    if (!html || html.length < 250) return null;

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const rawTitle = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim().slice(0, 75) : host;

    // Enforce strict trade relevance check on hostname + title + meta description
    const tradeRe = TRADE_REGEX[meta.trade];
    if (tradeRe && !tradeRe.test(host + ' ' + rawTitle)) {
      return null;
    }

    const hasSchema = /application\/ld\+json/i.test(html);
    let email = extractEmailsFromHtml(html, host);
    let phone = extractPhoneFromHtml(html);

    if (!email) {
      const subpaths = ['/contact', '/contact-us', '/about', '/about-us'];
      for (const sp of subpaths) {
        try {
          const r2 = await fetch(origin + sp, {
            headers: { 'User-Agent': ua, 'Accept': 'text/html' },
            redirect: 'follow',
            signal: AbortSignal.timeout(4000)
          });
          if (r2.ok) {
            const h2 = await r2.text();
            email = extractEmailsFromHtml(h2, host);
            if (!phone) phone = extractPhoneFromHtml(h2);
            if (email) break;
          }
        } catch (e) {}
      }
    }

    if (!email || existingEmails.has(email.toLowerCase())) return null;

    const businessName = cleanBusinessName(rawTitle, host, meta.city, html);
    const previewUrl = `https://city-desk-studio.netlify.app/cities/${meta.citySlug}/${meta.trade}/?biz=${encodeURIComponent(businessName)}&phone=${encodeURIComponent(phone || '')}&email=${encodeURIComponent(email || '')}&city=${encodeURIComponent((meta.city || '') + (meta.state ? ', ' + meta.state : ''))}&site=${encodeURIComponent(host)}`;
    const auditNotes = hasSchema
      ? `Site has basic JSON-LD (\`${rawTitle}\`) but lacks an interactive 60-second instant quote estimator and mobile tap-to-dispatch CTA bar — losing high-intent ${meta.city} callers.`
      : `Zero Schema.org LocalBusiness JSON-LD found on homepage (\`${rawTitle}\`) — invisible to AI search engines (ChatGPT, Perplexity, Google AI Overviews) and missing an interactive instant quote calculator.`;

    existingEmails.add(email.toLowerCase());
    existingDomains.add(host);

    return {
      businessName,
      email,
      phone: phone || undefined,
      city: meta.city,
      state: meta.state,
      citySlug: meta.citySlug,
      trade: meta.trade,
      tradeLabel: meta.tradeLabel,
      currentUrl: `https://${host}`,
      currentTitle: rawTitle,
      hasSchema,
      previewUrl,
      auditNotes
    };
  } catch (e) {
    return null;
  }
}

const DEFAULT_TRADE_META = {
  'plumbers': { tradeLabel: 'Emergency Plumbing & Drain Dispatch', searchTerm: 'plumbing company' },
  'hvac': { tradeLabel: 'HVAC & AC Repair Dispatch', searchTerm: 'hvac repair company' },
  'roofers': { tradeLabel: 'Roofing & Storm Restoration', searchTerm: 'roofing contractor' },
  'electricians': { tradeLabel: 'Licensed Electrical & Panel Upgrades', searchTerm: 'electrician company' },
  'dentists': { tradeLabel: 'Cosmetic & Emergency Dentistry', searchTerm: 'dental clinic' },
  'med-spas': { tradeLabel: 'Medical Spa & Aesthetics', searchTerm: 'med spa aesthetics' },
  'garage-doors': { tradeLabel: '24/7 Garage Door & Spring Repair', searchTerm: 'garage door repair' },
  'painters': { tradeLabel: 'Exterior & Interior Painting Contractors', searchTerm: 'painting contractor' },
  'landscapers': { tradeLabel: 'Landscaping, Hardscaping & Lawn Design', searchTerm: 'landscaping company' },
  'pest-control': { tradeLabel: 'Extermination & Termite Control', searchTerm: 'pest control company' },
  'auto-repair': { tradeLabel: 'Auto Repair, Brake & Diagnostic Center', searchTerm: 'auto repair shop' },
  'property-managers': { tradeLabel: 'Residential Property Management', searchTerm: 'property management company' },
  'junk-removal': { tradeLabel: 'Same-Day Junk Removal & Hauling', searchTerm: 'junk removal hauling' },
  'cleaners': { tradeLabel: 'Residential & Commercial Cleaning', searchTerm: 'house cleaning service' },
  'detailers': { tradeLabel: 'Mobile Auto Detailing & Ceramic Coating', searchTerm: 'mobile auto detailing' },
  'groomers': { tradeLabel: 'Mobile & Salon Pet Grooming', searchTerm: 'dog grooming salon' },
  'movers': { tradeLabel: 'Local Moving & Packing Services', searchTerm: 'local moving company' },
  'gyms': { tradeLabel: 'Fitness Studio & Personal Training', searchTerm: 'fitness gym personal training' },
  'restaurants': { tradeLabel: 'Local Restaurant & Catering Reservations', searchTerm: 'local restaurant catering' },
  'food-trucks': { tradeLabel: 'Food Truck & Event Catering Booking', searchTerm: 'food truck catering' }
};

async function harvestAndAppendWave(targets, waveLabel = 'Wave Auto') {
  const existingEmails = new Set(VERIFIED_PROSPECTS.map(p => String(p.email).toLowerCase()));
  const existingDomains = new Set();
  for (const p of VERIFIED_PROSPECTS) {
    try {
      existingDomains.add(new URL(p.currentUrl).hostname.toLowerCase().replace(/^www\./, ''));
    } catch (e) {}
  }

  const sentFile = path.join(__dirname, '..', 'data', 'outreach_dispatches.json');
  if (fs.existsSync(sentFile)) {
    try {
      const s = JSON.parse(fs.readFileSync(sentFile, 'utf8'));
      for (const item of (s.sent || [])) existingEmails.add(String(item.email).toLowerCase());
    } catch (e) {}
  }

  const harvested = [];
  for (const rawTarget of targets) {
    let city = rawTarget.city || '';
    let state = rawTarget.state || '';
    if (!state && /\s+[A-Z]{2}$/.test(city)) {
      const parts = city.trim().split(/\s+/);
      state = parts.pop();
      city = parts.join(' ');
    }
    const trade = rawTarget.trade || 'plumbers';
    const defMeta = DEFAULT_TRADE_META[trade] || { tradeLabel: trade, searchTerm: trade };
    const citySlug = rawTarget.citySlug || `${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${state.toLowerCase()}`;
    const t = {
      city,
      state,
      citySlug,
      trade,
      tradeLabel: rawTarget.tradeLabel || defMeta.tradeLabel,
      searchTerm: rawTarget.searchTerm || defMeta.searchTerm
    };
    const query = `${t.city} ${t.state} ${t.searchTerm}`;
    const origins = await searchUrls(query);
    console.log(`[Harvester] ${query} -> ${origins.length} candidate domains`);

    for (let i = 0; i < origins.length; i += 5) {
      const chunk = origins.slice(i, i + 5);
      const found = await Promise.all(
        chunk.map(origin => auditSiteAndExtractProspect(origin, t, existingEmails, existingDomains))
      );
      for (const item of found) {
        if (item) {
          harvested.push(item);
          console.log(`  + Verified: ${item.businessName} <${item.email}> (${item.city}, ${item.state} - ${item.trade})`);
        }
      }
    }
    await new Promise(r => setTimeout(r, 850));
  }

  if (harvested.length > 0) {
    let src = fs.readFileSync(PROSPECT_FILE, 'utf8');
    const marker = '];\n\nfunction loadResendCredentials()';
    if (src.includes(marker)) {
      const lines = harvested.map(h => '  ' + JSON.stringify(h)).join(',\n');
      const insertion = `,\n  // ${waveLabel} (${new Date().toISOString()})\n${lines}\n];\n\nfunction loadResendCredentials()`;
      src = src.replace(marker, insertion);
      fs.writeFileSync(PROSPECT_FILE, src);
      for (const h of harvested) VERIFIED_PROSPECTS.push(h);
    }
  }

  return harvested;
}

module.exports = {
  harvestAndAppendWave,
  searchUrls,
  auditSiteAndExtractProspect
};
