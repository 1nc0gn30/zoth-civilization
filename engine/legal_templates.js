/**
 * ⚖️ Sovereign Legal & Support Page Generator for Micro-SaaS
 * =====================================================================
 * Generates fully responsive, dark-glassmorphic, AEO/Schema.org compliant
 * terms.html, privacy.html, and support.html for any incubated tool.
 *
 * Author: 1nc0gn30 / 1nc0gn30 (@1nc0gn30)
 * Entity: ZothOS Systems Engineering • NullAI Platform
 */

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

function getCommonStyles() {
  return `
    :root {
      --bg: #07090E;
      --surface: #0E121B;
      --surface-dim: #090C14;
      --surface-bright: #151B28;
      --outline: #222938;
      --outline-light: rgba(99, 102, 241, 0.2);
      --primary: #10B981;
      --primary-rgb: 16, 185, 129;
      --accent: #6366F1;
      --accent-rgb: 99, 102, 241;
      --on-surface: #F8FAFC;
      --on-surface-variant: #94A3B8;
      --font-brand: 'Syne', sans-serif;
      --font-tech: 'Space Grotesk', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;
      --font-mono: 'Fira Code', monospace;
      --radius-lg: 16px;
      --radius-md: 10px;
      --radius-sm: 6px;
      --transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background: var(--bg);
      color: var(--on-surface);
      font-family: var(--font-body);
      min-height: 100vh;
      line-height: 1.6;
      overflow-x: hidden;
      width: 100%;
    }
    .aurora-container {
      position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
    }
    .aurora-blob-1 {
      position: absolute; top: -10%; left: 15%; width: 50vw; height: 50vw;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
      filter: blur(80px);
    }
    .aurora-blob-2 {
      position: absolute; bottom: 10%; right: 10%; width: 45vw; height: 45vw;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%);
      filter: blur(90px);
    }
    header {
      position: sticky; top: 0; z-index: 50;
      background: rgba(7, 9, 14, 0.85); backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--outline); padding: 0.85rem 1.5rem;
    }
    .header-inner {
      max-width: 1080px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;
    }
    .brand {
      display: flex; align-items: center; gap: 10px; text-decoration: none; color: #fff;
    }
    .brand-logo {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      background: linear-gradient(135deg, #10B981, #6366F1);
      display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; color: #fff;
    }
    .brand-title {
      font-family: var(--font-brand); font-size: 1.05rem; font-weight: 700; letter-spacing: -0.02em;
    }
    .nav-links {
      display: flex; gap: 1rem; align-items: center;
    }
    .nav-link {
      font-size: 0.85rem; color: var(--on-surface-variant); text-decoration: none;
      padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); transition: var(--transition);
    }
    .nav-link:hover, .nav-link.active {
      color: #fff; background: rgba(255, 255, 255, 0.05);
    }
    main {
      position: relative; z-index: 10; max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem 5rem;
    }
    .page-title {
      font-family: var(--font-brand); font-size: 2.25rem; font-weight: 800;
      letter-spacing: -0.03em; margin-bottom: 0.5rem; color: #fff;
    }
    .page-meta {
      font-size: 0.85rem; color: var(--on-surface-variant); margin-bottom: 2.5rem;
    }
    .legal-card {
      background: var(--surface); border: 1px solid var(--outline);
      border-radius: var(--radius-md); padding: 1.75rem; margin-bottom: 1.75rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    h2 {
      font-family: var(--font-tech); font-size: 1.25rem; font-weight: 700;
      color: #F1F5F9; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;
    }
    p, li {
      font-size: 0.9rem; color: #CBD5E1; margin-bottom: 0.75rem; line-height: 1.65;
    }
    ul { padding-left: 1.4rem; margin-bottom: 0.75rem; }
    .callout-box {
      background: rgba(16, 185, 129, 0.08); border-left: 3px solid var(--primary);
      padding: 1rem 1.25rem; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      margin: 1rem 0; font-size: 0.85rem; color: #D1FAE5;
    }
    .callout-warn {
      background: rgba(239, 68, 68, 0.08); border-left: 3px solid #EF4444;
      padding: 1rem 1.25rem; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      margin: 1rem 0; font-size: 0.85rem; color: #FEE2E2;
    }
    footer {
      border-top: 1px solid var(--outline); padding: 2rem 1.5rem;
      background: var(--surface-dim); font-size: 0.82rem; color: var(--on-surface-variant); text-align: center;
    }
    .footer-inner {
      max-width: 1080px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;
    }
    .footer-links a {
      color: var(--on-surface-variant); text-decoration: none; margin-left: 1rem; transition: var(--transition);
    }
    .footer-links a:hover { color: #fff; }
    @media (max-width: 768px) {
      .page-title { font-size: 1.85rem; }
      .legal-card { padding: 1.25rem; }
      .footer-inner { flex-direction: column; text-align: center; }
      .footer-links a { margin: 0 0.5rem; }
    }
  `;
}

function renderTermsHtml(opts) {
  const name = escapeHtml(opts.appName || 'Sovereign Developer App');
  const slug = escapeHtml(opts.slug || 'app');
  const repo = escapeHtml(opts.repoUrl || `https://github.com/1nc0gn30/${slug}`);
  const siteUrl = `https://${slug}.netlify.app`;
  const coffeeUrl = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  const solanaAddress = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service — ${name}</title>
  <meta name="description" content="Open-Access Terms of Service for ${name}, engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${siteUrl}/terms.html">

  <meta property="og:title" content="Terms of Service — ${name}">
  <meta property="og:description" content="100% free, open-access usage terms and local-first privacy commitment for ${name}.">
  <meta property="og:url" content="${siteUrl}/terms.html">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@1nc0gn30">
  <meta name="twitter:creator" content="@1nc0gn30">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">

  <style>${getCommonStyles()}</style>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "Terms of Service — ${name}",
        "url": "${siteUrl}/terms.html",
        "description": "100% free & open-access terms of service for ${name}.",
        "publisher": {
          "@type": "Organization",
          "name": "Neal Frazier Tech • NullAI",
          "url": "https://nullai.tech"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is ${name} free for personal and commercial projects?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. ${name} is 100% free, open-access, and unlocked by default for unlimited personal and commercial use with zero subscriptions or feature gates."
            }
          },
          {
            "@type": "Question",
            "name": "How can I support development of ${name}?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Optional community tips are welcomed via Stripe Buy Us a Coffee (${coffeeUrl}) or Solana tip (${solanaAddress})."
            }
          }
        ]
      }
    ]
  }
  </script>
</head>
<body>
  <div class="aurora-container">
    <div class="aurora-blob-1"></div>
    <div class="aurora-blob-2"></div>
  </div>

  <header>
    <div class="header-inner">
      <a href="/" class="brand">
        <div class="brand-logo">⚡</div>
        <div class="brand-title">${name}</div>
      </a>
      <nav class="nav-links">
        <a href="/" class="nav-link">← Workspace</a>
        <a href="/terms.html" class="nav-link active">Terms</a>
        <a href="/privacy.html" class="nav-link">Privacy</a>
        <a href="/support.html" class="nav-link">Support &amp; FAQ</a>
      </nav>
    </div>
  </header>

  <main>
    <h1 class="page-title">Terms of Service</h1>
    <p class="page-meta">100% Free &amp; Open-Access Utility • Zero Subscriptions</p>

    <div class="legal-card">
      <h2>1. Open-Access Agreement Overview</h2>
      <p>By accessing or using <strong>${name}</strong> (the "Application"), you agree to these open-access terms with <strong>Neal Frazier Tech • NullAI</strong> ("@1nc0gn30").</p>
      <p>Every feature, export, and utility in ${name} is 100% free and unlocked by default with no account or key required.</p>
    </div>

    <div class="legal-card">
      <h2>2. Personal &amp; Commercial Usage Rights</h2>
      <ul>
        <li><strong>Unrestricted Use</strong>: You may use the application and all generated outputs for unlimited personal, educational, and commercial projects with zero royalties or recurring fees.</li>
        <li><strong>Zero Usage Surcharges</strong>: No metered execution fees, seat limits, or subscription locks.</li>
      </ul>
      <div class="callout-box">
        <strong>✓ 100% Client-Side Privacy:</strong> All transformations, calculations, and operations execute directly within your local browser sandbox. No user code, tokens, or proprietary logic is ever transmitted to remote backend servers.
      </div>
    </div>

    <div class="legal-card">
      <h2>3. Voluntary Community Support</h2>
      <p>Optional tips support ongoing open-source engineering:</p>
      <ul>
        <li><strong>Stripe Buy Us a Coffee</strong>: <a href="${coffeeUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--primary);">${coffeeUrl}</a></li>
        <li><strong>Solana Tip Address</strong>: <code>${solanaAddress}</code></li>
      </ul>
    </div>

    <div class="legal-card">
      <h2>4. Warranties &amp; Disclaimer</h2>
      <p>The Application is provided "AS IS" and "AS AVAILABLE" with zero backend downtime dependencies. In no event shall Neal Frazier Tech • NullAI be liable for any incidental, indirect, or consequential damages resulting from browser execution or deployment of generated files.</p>
    </div>
  </main>

  <footer>
    <div class="footer-inner">
      <div>Engineered by Neal Frazier Tech (<a href="https://github.com/1nc0gn30" target="_blank" rel="noopener" style="color: var(--primary); text-decoration: none;">@1nc0gn30</a>) • NullAI Platform</div>
      <div class="footer-links">
        <a href="/">Workspace</a>
        <a href="/terms.html">Terms</a>
        <a href="/privacy.html">Privacy</a>
        <a href="/support.html">Support</a>
        <a href="${repo}" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

function renderPrivacyHtml(opts) {
  const name = escapeHtml(opts.appName || 'Sovereign Developer App');
  const slug = escapeHtml(opts.slug || 'app');
  const repo = escapeHtml(opts.repoUrl || `https://github.com/1nc0gn30/${slug}`);
  const siteUrl = `https://${slug}.netlify.app`;

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy — ${name}</title>
  <meta name="description" content="Privacy Policy for ${name}. 100% client-side zero-logging guarantee by Neal Frazier Tech (@1nc0gn30) • NullAI Platform.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${siteUrl}/privacy.html">

  <meta property="og:title" content="Privacy Policy — ${name}">
  <meta property="og:description" content="100% Client-Side Local Execution Guarantee. Zero telemetry, zero server-side logging, zero selling of user data.">
  <meta property="og:url" content="${siteUrl}/privacy.html">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@1nc0gn30">
  <meta name="twitter:creator" content="@1nc0gn30">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">

  <style>${getCommonStyles()}</style>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "Privacy Policy — ${name}",
        "url": "${siteUrl}/privacy.html",
        "description": "100% Client-Side Local Execution Guarantee. Zero telemetry, zero cloud data storage by Neal Frazier Tech • NullAI.",
        "publisher": {
          "@type": "Organization",
          "name": "Neal Frazier Tech • NullAI",
          "url": "https://nullai.tech"
        }
      }
    ]
  }
  </script>
</head>
<body>
  <div class="aurora-container">
    <div class="aurora-blob-1"></div>
    <div class="aurora-blob-2"></div>
  </div>

  <header>
    <div class="header-inner">
      <a href="/" class="brand">
        <div class="brand-logo">⚡</div>
        <div class="brand-title">${name}</div>
      </a>
      <nav class="nav-links">
        <a href="/" class="nav-link">← Workspace</a>
        <a href="/terms.html" class="nav-link">Terms</a>
        <a href="/privacy.html" class="nav-link active">Privacy</a>
        <a href="/support.html" class="nav-link">Support &amp; FAQ</a>
      </nav>
    </div>
  </header>

  <main>
    <h1 class="page-title">Privacy Policy</h1>
    <p class="page-meta">100% Client-Side Privacy Commitment • Zero Telemetry</p>

    <div class="legal-card">
      <h2>1. The Zero-Telemetry Guarantee</h2>
      <p>At <strong>${name}</strong> and <strong>Neal Frazier Tech • NullAI</strong>, your code, data, and keys remain strictly yours. Developer utilities should operate without surveillance.</p>
      <div class="callout-box">
        <strong>Absolute Local Isolation:</strong> 100% of computational logic, AST scanning, code transformations, and file generations occur directly within your local browser execution context. No data ever leaves your device.
      </div>
    </div>

    <div class="legal-card">
      <h2>2. What We Collect (And What We Don't)</h2>
      <ul>
        <li><strong>We DO NOT collect:</strong> Your source code, configuration files, secrets, prompts, or AST outputs.</li>
        <li><strong>We DO NOT run:</strong> Third-party tracking scripts, advertising trackers, or behavioral session recording software.</li>
        <li><strong>Local Storage Only:</strong> Optional workspace preferences and drafts are stored strictly in your browser's local <code>localStorage</code>.</li>
      </ul>
    </div>

    <div class="legal-card">
      <h2>3. Voluntary Support Contributions</h2>
      <p>If you choose to leave an optional tip:</p>
      <ul>
        <li><strong>Stripe Buy Us a Coffee</strong> processes card/wallet tips under PCI-DSS Level 1 compliance. We never see or store your payment details.</li>
        <li><strong>Solana Tip</strong> processes transactions directly on the public Solana blockchain without intermediate custodial accounts.</li>
      </ul>
    </div>

    <div class="legal-card">
      <h2>4. Compliance &amp; Contact</h2>
      <p>Our architecture inherently complies with GDPR, CCPA, and CPRA standards because we do not ingest, transfer, or commercialize your personal information. For privacy inquiries, reach us at <code>1nc0gn30@nullai.tech</code>.</p>
    </div>
  </main>

  <footer>
    <div class="footer-inner">
      <div>Engineered by Neal Frazier Tech (<a href="https://github.com/1nc0gn30" target="_blank" rel="noopener" style="color: var(--primary); text-decoration: none;">@1nc0gn30</a>) • NullAI Platform</div>
      <div class="footer-links">
        <a href="/">Workspace</a>
        <a href="/terms.html">Terms</a>
        <a href="/privacy.html">Privacy</a>
        <a href="/support.html">Support</a>
        <a href="${repo}" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

function renderSupportHtml(opts) {
  const name = escapeHtml(opts.appName || 'Sovereign Developer App');
  const slug = escapeHtml(opts.slug || 'app');
  const repo = escapeHtml(opts.repoUrl || `https://github.com/1nc0gn30/${slug}`);
  const siteUrl = `https://${slug}.netlify.app`;
  const coffeeUrl = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  const solanaAddress = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support &amp; FAQ — ${name}</title>
  <meta name="description" content="Direct developer support desk, open-access FAQ, and voluntary community support for ${name} by Neal Frazier Tech (@1nc0gn30) • NullAI Platform.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${siteUrl}/support.html">

  <meta property="og:title" content="Support &amp; FAQ — ${name}">
  <meta property="og:description" content="Direct developer support and answers to common questions about ${name} (100% free & open-access).">
  <meta property="og:url" content="${siteUrl}/support.html">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@1nc0gn30">
  <meta name="twitter:creator" content="@1nc0gn30">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">

  <style>
    ${getCommonStyles()}
    .support-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;
    }
    .support-card {
      background: var(--surface); border: 1px solid var(--outline);
      border-radius: var(--radius-md); padding: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .support-card h3 {
      font-family: var(--font-tech); font-size: 1.15rem; color: #fff; margin-bottom: 0.5rem;
    }
    .support-card p { font-size: 0.88rem; color: var(--on-surface-variant); margin-bottom: 1rem; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 0.65rem 1.25rem; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600;
      text-decoration: none; cursor: pointer; transition: var(--transition); border: none;
    }
    .btn-primary { background: #D4AF37; color: #08080B; }
    .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-secondary { background: rgba(255, 255, 255, 0.08); color: #fff; border: 1px solid var(--outline); }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.15); }
    .btn-solana { background: rgba(20, 241, 149, 0.15); color: #14F195; border: 1px solid rgba(20, 241, 149, 0.45); }
    .btn-solana:hover { background: rgba(20, 241, 149, 0.25); }
    .faq-item {
      border: 1px solid var(--outline); border-radius: var(--radius-sm);
      margin-bottom: 0.85rem; background: var(--surface-bright); overflow: hidden;
    }
    .faq-question {
      padding: 1.15rem 1.25rem; font-family: var(--font-tech); font-size: 0.98rem; font-weight: 600;
      color: #fff; cursor: pointer; display: flex; justify-content: space-between; align-items: center;
      user-select: none;
    }
    .faq-question:hover { background: rgba(255, 255, 255, 0.03); }
    .faq-answer {
      padding: 0 1.25rem 1.15rem; font-size: 0.88rem; color: #CBD5E1; line-height: 1.6; display: none;
    }
    .faq-item.open .faq-answer { display: block; }
    .faq-item.open .faq-toggle { transform: rotate(180deg); }
    .faq-toggle { transition: transform 0.2s ease; color: var(--primary); font-size: 1.1rem; }
    @media (max-width: 768px) {
      .support-grid { grid-template-columns: 1fr; }
    }
  </style>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is ${name} 100% free and open-access?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Every tool, export, and feature in ${name} is 100% free and unlocked by default with zero subscriptions or feature locks."
            }
          },
          {
            "@type": "Question",
            "name": "How can I support ongoing development?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Optional community tips are welcomed via Stripe Buy Us a Coffee (${coffeeUrl}) or Solana tip (${solanaAddress})."
            }
          },
          {
            "@type": "Question",
            "name": "Is my data stored or sent to remote servers?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Zero data is sent to cloud servers. All transformations, calculations, and AST processing execute 100% locally in your web browser."
            }
          }
        ]
      }
    ]
  }
  </script>
</head>
<body>
  <div class="aurora-container">
    <div class="aurora-blob-1"></div>
    <div class="aurora-blob-2"></div>
  </div>

  <header>
    <div class="header-inner">
      <a href="/" class="brand">
        <div class="brand-logo">⚡</div>
        <div class="brand-title">${name}</div>
      </a>
      <nav class="nav-links">
        <a href="/" class="nav-link">← Workspace</a>
        <a href="/terms.html" class="nav-link">Terms</a>
        <a href="/privacy.html" class="nav-link">Privacy</a>
        <a href="/support.html" class="nav-link active">Support &amp; FAQ</a>
      </nav>
    </div>
  </header>

  <main>
    <h1 class="page-title">Support &amp; Knowledge Center</h1>
    <p class="page-meta">100% Free &amp; Open-Access Utility • Direct Developer Support &amp; FAQ</p>

    <div class="support-grid">
      <div class="support-card">
        <h3>☕ Support Open-Access Tools</h3>
        <p>${name} is 100% free with zero paywalls. If it saves you time, consider leaving a voluntary tip to fund ongoing development.</p>
        <div style="display: flex; flex-direction: column; gap: 0.65rem;">
          <a href="${coffeeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width: 100%;">
            ☕ Buy Us a Coffee (Stripe)
          </a>
          <button type="button" onclick="copySolanaWallet(this)" class="btn btn-solana" style="width: 100%;">
            ◎ Copy Solana Tip (GG2eQb…dXoK)
          </button>
        </div>
      </div>

      <div class="support-card">
        <h3>💬 Direct Developer Support</h3>
        <p>Have a technical question, bug report, or feature request?</p>
        <p style="color: #CBD5E1; font-size: 0.85rem; margin-bottom: 1.25rem;">
          Direct communication with <strong>Neal Frazier Tech</strong> (@1nc0gn30).
        </p>
        <a href="mailto:1nc0gn30@nullai.tech?subject=${encodeURIComponent(name + ' Support Request')}" class="btn btn-secondary" style="width: 100%;">
          Email 1nc0gn30@nullai.tech
        </a>
      </div>
    </div>

    <div class="legal-card">
      <h2>Frequently Asked Questions</h2>
      <div class="faq-item open">
        <div class="faq-question" onclick="toggleFaq(this)">
          Is ${name} 100% free and unlocked?
          <span class="faq-toggle">▼</span>
        </div>
        <div class="faq-answer">
          Yes. Every tool, export, and workstation feature is 100% free and unlocked by default with zero subscriptions, accounts, or activation keys required.
        </div>
      </div>

      <div class="faq-item">
        <div class="faq-question" onclick="toggleFaq(this)">
          Does ${name} transmit my code or data to external servers?
          <span class="faq-toggle">▼</span>
        </div>
        <div class="faq-answer">
          No. 100% of data parsing and code generation takes place client-side in your browser sandbox. We do not store or transmit your code, secrets, or configurations.
        </div>
      </div>

      <div class="faq-item">
        <div class="faq-question" onclick="toggleFaq(this)">
          How can I support ongoing open-source development?
          <span class="faq-toggle">▼</span>
        </div>
        <div class="faq-answer">
          Voluntary tips are welcomed via <a href="${coffeeUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--primary);">Stripe Buy Us a Coffee</a> or Solana Tip (<code>${solanaAddress}</code>).
        </div>
      </div>
    </div>
  </main>

  <footer>
    <div class="footer-inner">
      <div>Engineered by Neal Frazier Tech (<a href="https://github.com/1nc0gn30" target="_blank" rel="noopener" style="color: var(--primary); text-decoration: none;">@1nc0gn30</a>) • NullAI Platform</div>
      <div class="footer-links">
        <a href="/">Workspace</a>
        <a href="/terms.html">Terms</a>
        <a href="/privacy.html">Privacy</a>
        <a href="/support.html">Support</a>
        <a href="${repo}" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>
  </footer>

  <script>
    function toggleFaq(el) {
      el.parentElement.classList.toggle('open');
    }
    function copySolanaWallet(btn) {
      const addr = '${solanaAddress}';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(addr).then(() => {
          const orig = btn.textContent;
          btn.textContent = '✓ Copied GG2eQb…dXoK!';
          setTimeout(() => { btn.textContent = orig; }, 2200);
        }).catch(() => {});
      }
    }
  </script>
</body>
</html>`;
}

module.exports = {
  renderTermsHtml,
  renderPrivacyHtml,
  renderSupportHtml
};
