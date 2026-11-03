/**
 * Serve the City Desk site under /desk without starting a second host.
 * Root-absolute links in the static HTML are rewritten so the pages
 * stay inside this mount. The files on disk are left as they are.
 */

const fs = require('fs');
const path = require('path');

const DESK_ROOT = path.resolve(__dirname, '..', '..', 'city-desk', 'site');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function rewriteDesk(ext, text) {
  if (ext === '.html' || ext === '.htm') {
    let out = text
      .replace(/(href|src|action)="\/(?!\/|desk\/)/g, '$1="/desk/')
      .replace(/(href|src|action)='\/(?!\/|desk\/)/g, "$1='/desk/");

    if (!out.includes('property="og:image"')) {
      const metaInjection = [
        '<meta property="og:image" content="https://civilization.nullai.tech/tarot/strength.png">',
        '<meta name="twitter:image" content="https://civilization.nullai.tech/tarot/strength.png">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<script type="application/ld+json">',
        JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "City Desk Trade Storefront",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "offers": { "@type": "Offer", "price": "800", "priceCurrency": "USD" },
              "creator": { "@type": "Person", "name": "1nc0gn30" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is included in this City Desk trade storefront?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "One studio, one trade, one city per page with honest verified pricing, clear service paths, and complete handoff documentation."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Are there any recurring retainers or fake claims?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "None. The owner receives full code ownership with zero ongoing retainers, no fake reviews, and no ranking promises."
                  }
                }
              ]
            }
          ]
        }),
        '</script>'
      ].join('\n');
      out = out.replace('</head>', `${metaInjection}\n</head>`);
    }
    return out;
  }
  if (ext === '.xml') {
    return text.replace(/<loc>\//g, '<loc>/desk/');
  }
  return text;
}

function resolveDesk(urlPath) {
  if (typeof urlPath !== 'string' || !urlPath || urlPath.includes('\0')) return { error: 400 };
  if (urlPath !== '/desk' && !urlPath.startsWith('/desk/')) return { error: 404 };
  let rel = urlPath === '/desk' ? '/' : urlPath.slice('/desk'.length);
  if (!rel.startsWith('/')) rel = `/${rel}`;
  if (rel.startsWith('/desk/')) rel = rel.slice('/desk'.length);
  if (rel === '/desk') rel = '/';
  try {
    rel = decodeURIComponent(rel);
  } catch (err) {
    return { error: 400 };
  }
  if (rel.includes('\0') || rel.includes('\\') || rel.split('/').includes('..')) return { error: 403 };
  if (rel === '/desk/style.css' || rel === '/style.css') {
    const cssPath = path.resolve(DESK_ROOT, 'style.css');
    if (fs.existsSync(cssPath)) {
      return { file: cssPath, ext: '.css' };
    }
  }
  if (rel === '/HANDOFF-BOISE.md') {
    const handoffPath = path.resolve(__dirname, '..', 'HANDOFF-BOISE.md');
    if (fs.existsSync(handoffPath)) {
      return { file: handoffPath, ext: '.md' };
    }
  }
  if (rel === '/HANDOFF-NORFOLK.md') {
    const handoffPath = path.resolve(__dirname, '..', 'HANDOFF-NORFOLK.md');
    if (fs.existsSync(handoffPath)) {
      return { file: handoffPath, ext: '.md' };
    }
  }
  if (rel === '/cities/norfolk-va/aeo' || rel === '/cities/norfolk-va/aeo/' || rel === '/cities/norfolk-va/aeo/index.html') {
    const norfolkPath = path.resolve(__dirname, '..', 'public', 'cities', 'norfolk-va', 'aeo', 'index.html');
    if (fs.existsSync(norfolkPath)) {
      return { file: norfolkPath, ext: '.html' };
    }
  }
  const boiseMatch = rel.match(/^\/cities\/boise-id\/(hvac|plumbers|painters)(\/|\/index\.html)?$/);
  if (boiseMatch) {
    const trade = boiseMatch[1];
    const boisePath = path.resolve(__dirname, '..', 'public', 'cities', 'boise-id', trade, 'index.html');
    if (fs.existsSync(boisePath)) {
      return { file: boisePath, ext: '.html' };
    }
  }
  const joined = path.resolve(DESK_ROOT, rel.replace(/^\/+/, ''));
  if (joined !== DESK_ROOT && !joined.startsWith(DESK_ROOT + path.sep)) return { error: 403 };
  let file = joined;
  let isDir = false;
  try {
    isDir = fs.existsSync(joined) && fs.statSync(joined).isDirectory();
  } catch (err) {
    return { error: 404 };
  }
  if (rel === '/' || rel.endsWith('/') || isDir) file = path.join(rel === '/' ? DESK_ROOT : joined, 'index.html');
  try {
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return { error: 404 };
  } catch (err) {
    return { error: 404 };
  }
  const resolved = path.resolve(file);
  if (resolved !== DESK_ROOT && !resolved.startsWith(DESK_ROOT + path.sep)) return { error: 403 };
  return { file: resolved, ext: path.extname(resolved).toLowerCase() };
}

function serveCityDesk(req, res, pathname) {
  if (pathname !== '/desk' && !pathname.startsWith('/desk/')) return false;
  const hit = resolveDesk(pathname);
  if (hit.error) {
    const message = hit.error === 404 ? '404 Not Found' : hit.error === 403 ? 'Forbidden' : 'Bad Request';
    res.writeHead(hit.error, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(message);
    return true;
  }
  let body = fs.readFileSync(hit.file);
  if (hit.ext === '.html' || hit.ext === '.htm' || hit.ext === '.xml') {
    body = Buffer.from(rewriteDesk(hit.ext, body.toString('utf8')), 'utf8');
  }
  res.writeHead(200, {
    'Content-Type': MIME[hit.ext] || 'application/octet-stream',
    'Content-Length': body.length,
    'Cache-Control': 'no-cache'
  });
  res.end(body);
  return true;
}

module.exports = { serveCityDesk, resolveDesk, rewriteDesk, DESK_ROOT };
