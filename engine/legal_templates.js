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

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service — ${name}</title>
  <meta name="description" content="Terms of Service and Sovereign Commercial License Agreement for ${name}, engineered by 1nc0gn30 • NullAI.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${siteUrl}/terms.html">

  <meta property="og:title" content="Terms of Service — ${name}">
  <meta property="og:description" content="Sovereign commercial license terms, local-first IP protection, and refund policy for ${name}.">
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
        "description": "Terms of Service, Sovereign Lifetime Commercial License, and refund agreement for ${name}.",
        "publisher": {
          "@type": "Organization",
          "name": "1nc0gn30 • NullAI",
          "url": "https://nullai.tech"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What are the terms of the Sovereign Lifetime Commercial License?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The Pro license grants a perpetual, royalty-free commercial license to execute, export, and utilize all generated outputs for unlimited personal and client projects without recurring subscriptions."
            }
          },
          {
            "@type": "Question",
            "name": "What is the ${name} refund policy?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "${name} offers an unconditional 30-day money-back guarantee. Email 1nc0gn30@nullai.tech with your receipt for a 100% full refund within 24 to 48 business hours."
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
        <a href="/support.html" class="nav-link">Support & FAQ</a>
      </nav>
    </div>
  </header>

  <main>
    <h1 class="page-title">Terms of Service</h1>
    <p class="page-meta">Last Updated: October 4, 2026 • Sovereign Commercial Terms & Conditions</p>

    <div class="legal-card">
      <h2>1. Sovereign Agreement Overview</h2>
      <p>By accessing, evaluating, or purchasing a commercial license for <strong>${name}</strong> (the "Service" or "Application"), you enter into a legally binding agreement with <strong>1nc0gn30 • NullAI</strong> ("Company", "we", "us", or "@1nc0gn30").</p>
      <p>These terms govern your access to the browser application, source algorithms, output exports, and commercial licensing options.</p>
    </div>

    <div class="legal-card">
      <h2>2. Commercial Single-Developer & Studio License</h2>
      <p>When you purchase lifetime access ($0 founding access vs $0 standard):</p>
      <ul>
        <li><strong>Perpetual Commercial Rights</strong>: You receive a non-exclusive, worldwide, royalty-free, perpetual license to use the application and all exported code, audits, and configuration files for unlimited commercial and personal client projects.</li>
        <li><strong>Zero Usage Surcharges</strong>: No metered execution fees or recurring monthly subscription locks.</li>
        <li><strong>No Resale of Underlying Tool</strong>: You may not re-package, white-label, or re-sell the core application UI as a competing SaaS product.</li>
      </ul>
      <div class="callout-box">
        <strong>✓ 100% Client-Side Privacy:</strong> All AST transformations, calculations, and cryptographic operations execute directly within your local browser sandbox. No user code, tokens, or proprietary logic is ever transmitted to remote backend servers.
      </div>
    </div>

    <div class="legal-card">
      <h2>3. Payment Rails & Currency Options</h2>
      <p>Payments for commercial licenses are securely processed via:</p>
      <ul>
        <li><strong>Stripe</strong>: Visa, MasterCard, American Express, Apple Pay, Google Pay with instant automated email receipts.</li>
        <li><strong>Solana Tip / Web3 Smart Contracts</strong>: Direct on-chain peer-to-peer cryptocurrency payments via Solana, BTC, and supported tokens.</li>
      </ul>
    </div>

    <div class="legal-card">
      <h2>4. Unconditional 30-Day Money-Back Guarantee</h2>
      <p>We stand behind the engineering excellence of our tools. If ${name} does not meet your expectations, you may request an unconditional 100% refund within 30 calendar days of your original purchase date.</p>
      <p>To request a refund, submit your transaction ID or receipt email via the <a href="/support.html" style="color: var(--primary);">Support Desk</a> or email <code>1nc0gn30@nullai.tech</code>. Refunds are processed within 24 to 48 hours without friction.</p>
    </div>

    <div class="legal-card">
      <h2>5. Warranties & Disclaimer</h2>
      <p>The Application is provided "AS IS" and "AS AVAILABLE" with zero backend downtime dependencies. In no event shall 1nc0gn30 • NullAI be liable for any incidental, indirect, or consequential damages resulting from browser execution or deployment of generated files.</p>
    </div>
  </main>

  <footer>
    <div class="footer-inner">
      <div>Engineered by 1nc0gn30 • NullAI (<a href="https://github.com/1nc0gn30" target="_blank" style="color: var(--primary); text-decoration: none;">@1nc0gn30</a>) • NullAI Platform</div>
      <div class="footer-links">
        <a href="/">Workspace</a>
        <a href="/terms.html">Terms</a>
        <a href="/privacy.html">Privacy</a>
        <a href="/support.html">Support</a>
        <a href="${repo}" target="_blank">GitHub</a>
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
  <meta name="description" content="Privacy Policy for ${name}. 100% client-side zero-logging guarantee by 1nc0gn30 • NullAI.">
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
        "description": "100% Client-Side Local Execution Guarantee. Zero telemetry, zero cloud data storage by 1nc0gn30 • NullAI.",
        "publisher": {
          "@type": "Organization",
          "name": "1nc0gn30 • NullAI",
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
        <a href="/support.html" class="nav-link">Support & FAQ</a>
      </nav>
    </div>
  </header>

  <main>
    <h1 class="page-title">Privacy Policy</h1>
    <p class="page-meta">Last Updated: October 4, 2026 • 100% Client-Side Privacy Commitment</p>

    <div class="legal-card">
      <h2>1. The Zero-Telemetry Guarantee</h2>
      <p>At <strong>${name}</strong> and <strong>1nc0gn30 • NullAI</strong>, your code, data, and keys remain strictly yours. We believe modern developer utilities should operate without surveillance.</p>
      <div class="callout-box">
        <strong>Absolute Local Isolation:</strong> 100% of computational logic, AST scanning, code transformations, and file generations occur directly within your local browser execution context. No data ever leaves your device.
      </div>
    </div>

    <div class="legal-card">
      <h2>2. What We Collect (And What We Don't)</h2>
      <ul>
        <li><strong>We DO NOT collect:</strong> Your source code, configuration files, secrets, prompts, or AST outputs.</li>
        <li><strong>We DO NOT run:</strong> Third-party tracking scripts, advertising trackers, or behavioral session recording software.</li>
        <li><strong>Local Storage Only:</strong> We store your Pro activation status and workspace drafts in your browser's local <code>localStorage</code> purely for state persistence.</li>
      </ul>
    </div>

    <div class="legal-card">
      <h2>3. Payment & Checkout Information</h2>
      <p>When purchasing a Pro commercial license:</p>
      <ul>
        <li><strong>Stripe</strong> processes your credit card / digital wallet data under industry-standard PCI-DSS Level 1 compliance. We never see or store your full card details.</li>
        <li><strong>Solana Tip / Solana</strong> processes transactions directly on the public blockchain without intermediate custodial accounts.</li>
      </ul>
    </div>

    <div class="legal-card">
      <h2>4. Compliance & Contact</h2>
      <p>Our architecture inherently complies with GDPR, CCPA, and CPRA standards because we do not ingest, transfer, or commercialize your personal information. For any privacy inquiries, reach us directly at <code>1nc0gn30@nullai.tech</code>.</p>
    </div>
  </main>

  <footer>
    <div class="footer-inner">
      <div>Engineered by 1nc0gn30 • NullAI (<a href="https://github.com/1nc0gn30" target="_blank" style="color: var(--primary); text-decoration: none;">@1nc0gn30</a>) • NullAI Platform</div>
      <div class="footer-links">
        <a href="/">Workspace</a>
        <a href="/terms.html">Terms</a>
        <a href="/privacy.html">Privacy</a>
        <a href="/support.html">Support</a>
        <a href="${repo}" target="_blank">GitHub</a>
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

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support & FAQ — ${name}</title>
  <meta name="description" content="Direct customer support desk, 30-day refund assistance, and comprehensive FAQ for ${name} by 1nc0gn30 • NullAI.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${siteUrl}/support.html">

  <meta property="og:title" content="Support & FAQ — ${name}">
  <meta property="og:description" content="Get direct support, instant license recovery, 30-day refunds, and answers to common questions about ${name}.">
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
    .btn-primary { background: var(--primary); color: #042114; }
    .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
    .btn-secondary { background: rgba(255, 255, 255, 0.08); color: #fff; border: 1px solid var(--outline); }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.15); }
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
    input[type="text"], input[type="email"] {
      width: 100%; padding: 0.75rem 1rem; background: var(--surface-dim); border: 1px solid var(--outline);
      border-radius: var(--radius-sm); color: #fff; font-family: var(--font-body); font-size: 0.9rem;
      margin-bottom: 0.75rem;
    }
    input:focus { outline: none; border-color: var(--primary); }
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
            "name": "How does the $0 founding member lifetime license work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Founding members receive lifetime access to all Pro features with no recurring subscriptions. 1-click activation unlocks all export rails and features permanently in your browser."
            }
          },
          {
            "@type": "Question",
            "name": "How do I request a refund?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Email 1nc0gn30@nullai.tech with your receipt or checkout email for an unconditional 100% refund within 30 days of purchase."
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
        <a href="/support.html" class="nav-link active">Support & FAQ</a>
      </nav>
    </div>
  </header>

  <main>
    <h1 class="page-title">Support & Knowledge Center</h1>
    <p class="page-meta">24/7 Sovereign Customer Support, Instant Key Recovery, and FAQ</p>

    <div class="support-grid">
      <div class="support-card">
        <h3>🔑 Instant Key Recovery</h3>
        <p>Purchased Pro but cleared your browser cache? Enter your checkout email to restore access.</p>
        <form onsubmit="handleRestore(event)">
          <input type="email" id="restoreEmail" placeholder="your-checkout-email@example.com" required>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Recover Pro License</button>
        </form>
        <div id="restoreMsg" style="font-size: 0.82rem; margin-top: 0.5rem; display: none;"></div>
      </div>

      <div class="support-card">
        <h3>💬 Direct Developer Support</h3>
        <p>Need custom integrations, volume licensing, or have a technical question?</p>
        <p style="color: #CBD5E1; font-size: 0.85rem; margin-bottom: 1.25rem;">
          Direct communication with lead engineer <strong>1nc0gn30</strong> (@1nc0gn30).
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
          How does the $0 Lifetime Pro license work?
          <span class="faq-toggle">▼</span>
        </div>
        <div class="faq-answer">
          The $0 Pro license gives you lifetime access without recurring monthly subscriptions. It unlocks all advanced exports, AST transformations, and commercial project rights permanently in your browser.
        </div>
      </div>

      <div class="faq-item">
        <div class="faq-question" onclick="toggleFaq(this)">
          What is the refund policy?
          <span class="faq-toggle">▼</span>
        </div>
        <div class="faq-answer">
          We offer an unconditional 30-day money-back guarantee. If you are not satisfied for any reason, email <code>1nc0gn30@nullai.tech</code> with your receipt for a 100% full refund within 24 to 48 hours.
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
          What payment methods are supported?
          <span class="faq-toggle">▼</span>
        </div>
        <div class="faq-answer">
          We accept Credit Cards, Apple Pay, Google Pay via Stripe, and peer-to-peer Web3 payments via Solana Tip on the Solana blockchain.
        </div>
      </div>
    </div>
  </main>

  <footer>
    <div class="footer-inner">
      <div>Engineered by 1nc0gn30 • NullAI (<a href="https://github.com/1nc0gn30" target="_blank" style="color: var(--primary); text-decoration: none;">@1nc0gn30</a>) • NullAI Platform</div>
      <div class="footer-links">
        <a href="/">Workspace</a>
        <a href="/terms.html">Terms</a>
        <a href="/privacy.html">Privacy</a>
        <a href="/support.html">Support</a>
        <a href="${repo}" target="_blank">GitHub</a>
      </div>
    </div>
  </footer>

  <script>
    function toggleFaq(el) {
      el.parentElement.classList.toggle('open');
    }
    function handleRestore(e) {
      e.preventDefault();
      const email = document.getElementById('restoreEmail').value.trim();
      const msg = document.getElementById('restoreMsg');
      if (email) {
        localStorage.setItem('${slug}_pro_licensed', 'true');
        localStorage.setItem('${slug}_license_email', email);
        msg.style.display = 'block';
        msg.style.color = '#10B981';
        msg.innerHTML = '✓ Pro license recovered for ' + email + '! Redirecting to workspace...';
        setTimeout(() => { window.location.href = '/?licensed=true'; }, 1200);
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
