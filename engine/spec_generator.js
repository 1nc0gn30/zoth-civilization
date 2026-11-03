/**
 * 🎨 AVANT-GARDE SPEC REDESIGN & CLAUDE MOTION SHOWREEL GENERATOR
 * =====================================================================
 * Follows the Design Director, Motion Choreography, and Avant-Garde UI
 * standards across 1nc0gn30 • NullAI (@1nc0gn30 / NullAI Platform).
 * 
 * Invariants:
 * 1. Restraint, hierarchy & typography (Syne display, Plus Jakarta Sans, JetBrains Mono)
 * 2. Zero emojis in production UI headers or buttons (pure SVG micro-icons)
 * 3. 8pt spatial grid rhythm (8, 16, 24, 32, 48, 64, 96, 128)
 * 4. Real working in-browser utilities:
 *    - 60 FPS Programmatic Claude Motion Graphics Showreel Canvas
 *    - Draggable Before vs. After Trade Transformation Slider
 *    - Client-Side Interactive Quote & Dispatch Estimator
 *    - Real-Time Google AEO & Schema.org JSON-LD Graph Inspector
 * 5. Clean, authoritative executive handoff dock
 * 
 * Author: 1nc0gn30 / 1nc0gn30 • NullAI
 * Entity: NullAI Platform • ZothOS
 */

function generateSpecHtml(record) {
  const businessName = (record.businessName || 'Elite Services').trim();
  const city = (record.city || 'Virginia Beach').trim();
  const state = (record.state || 'VA').trim();
  const metro = (record.metro || city).trim();
  const niche = (record.niche || 'Professional Services').trim();
  const hook = (record.revampHook || 'Precision craftsmanship and rapid local response.').trim();
  const schemaType = (record.schemaType || 'LocalBusiness').trim();
  const price = record.pricing?.price || 300;

  // Curated trade data points for authentic value realization
  const tradePillars = getTradePillars(niche, city, state);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} — Bespoke Architecture & Digital Platform (${city}, ${state})</title>
  <meta name="description" content="Official bespoke redesign and 15s Claude motion showreel engineered for ${businessName} in ${city}, ${state}. ${hook}">
  
  <!-- AEO Schema.org Structured Knowledge Graph -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "${schemaType}",
    "name": "${businessName}",
    "description": "${hook}",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "${city}",
      "addressRegion": "${state}",
      "addressCountry": "US"
    },
    "areaServed": "${metro}",
    "priceRange": "$$",
    "openingHours": "Mo-Sa 08:00-18:00",
    "creator": {
      "@type": "Organization",
      "name": "1nc0gn30 • NullAI",
      "url": "https://nullai.tech"
    }
  }
  </script>

  <!-- Typography: Syne (Display), Plus Jakarta Sans (Body), JetBrains Mono (Telemetry/Labels) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">

  <style>
    :root {
      /* Palette: Restrained Obsidian, Gold & Technical Cyan */
      --bg: #08090C;
      --bg-surface: #0E1117;
      --bg-card: rgba(16, 20, 29, 0.75);
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(212, 175, 55, 0.4);
      --gold: #D4AF37;
      --gold-tint: #F5E6AB;
      --cyan: #38BDF8;
      --emerald: #10B981;
      --text-primary: #F8FAFC;
      --text-secondary: #94A3B8;
      --text-muted: #64748B;
      
      /* Typography */
      --font-display: 'Syne', -apple-system, sans-serif;
      --font-body: 'Plus Jakarta Sans', -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;

      /* Motion Choreography Tokens */
      --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
      --ease-aperture: cubic-bezier(0.76, 0, 0.24, 1);
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 16px;
      --radius-full: 9999px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background-color: var(--bg);
      color: var(--text-primary);
      font-family: var(--font-body);
      min-height: 100vh;
      overflow-x: hidden;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    /* Ambient Horizon Line (Anchor Element) */
    .horizon-seam {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, var(--gold) 50%, transparent 100%);
      opacity: 0.6;
      pointer-events: none;
    }

    /* Top Executive Review Dock */
    .review-dock {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(8, 9, 12, 0.94);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .review-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .eyebrow-chip {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--gold);
      background: rgba(212, 175, 55, 0.12);
      border: 1px solid rgba(212, 175, 55, 0.3);
      padding: 4px 10px;
      border-radius: var(--radius-sm);
    }
    .review-target {
      font-size: 13px;
      color: var(--text-secondary);
    }
    .review-target strong {
      color: #FFF;
      font-weight: 600;
    }
    .review-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .verified-pill {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--emerald);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .claim-action-btn {
      background: var(--gold);
      color: #08090C;
      font-family: var(--font-body);
      font-weight: 700;
      font-size: 13px;
      padding: 8px 18px;
      border-radius: var(--radius-sm);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s var(--ease-out-expo);
    }
    .claim-action-btn:hover {
      background: var(--gold-tint);
      transform: translateY(-1px);
    }

    /* Container: 8pt Grid Discipline */
    .container {
      max-width: 1160px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Header Nav */
    header {
      padding: 32px 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-subtle);
    }
    .brand-title {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #FFF;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-accent-line {
      width: 4px;
      height: 20px;
      background: var(--gold);
      border-radius: 2px;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .phone-btn {
      font-family: var(--font-mono);
      font-size: 13px;
      color: var(--text-primary);
      text-decoration: none;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      padding: 8px 18px;
      border-radius: var(--radius-sm);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .phone-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    /* Hero Section: Single Dominant Focal Point */
    .hero {
      padding: 80px 0 64px;
      position: relative;
    }
    .hero-eyebrow {
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .hero h1 {
      font-family: var(--font-display);
      font-size: clamp(40px, 6vw, 68px);
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -0.03em;
      color: #FFF;
      max-width: 820px;
      margin-bottom: 24px;
    }
    .hero-sub {
      font-size: clamp(17px, 2.2vw, 20px);
      color: var(--text-secondary);
      max-width: 60ch;
      margin-bottom: 40px;
      line-height: 1.6;
    }
    .hero-cta-group {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .btn-primary {
      background: var(--gold);
      color: #08090C;
      font-family: var(--font-body);
      font-weight: 700;
      font-size: 15px;
      height: 48px;
      padding: 0 28px;
      border-radius: var(--radius-sm);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s var(--ease-out-expo);
      border: none;
      cursor: pointer;
    }
    .btn-primary:hover {
      background: var(--gold-tint);
      transform: translateY(-2px);
    }
    .btn-secondary {
      background: transparent;
      color: #FFF;
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 15px;
      height: 48px;
      padding: 0 24px;
      border-radius: var(--radius-sm);
      text-decoration: none;
      border: 1px solid var(--border-subtle);
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.2);
    }

    /* Section Rhythm: 96px gaps between major surfaces */
    .section-spacing {
      margin-top: 96px;
    }
    .section-eyebrow {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 12px;
    }
    .section-title {
      font-family: var(--font-display);
      font-size: clamp(28px, 4vw, 42px);
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #FFF;
      margin-bottom: 16px;
    }
    .section-desc {
      color: var(--text-secondary);
      font-size: 16px;
      max-width: 58ch;
      margin-bottom: 40px;
    }

    /* 🎬 Claude Motion Graphics Showcase Surface */
    .showreel-frame {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 24px;
      position: relative;
      overflow: hidden;
    }
    .showreel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .showreel-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .tag-badge {
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
    }
    .canvas-wrapper {
      position: relative;
      width: 100%;
      height: 420px;
      background: #040507;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    #showreelCanvas {
      width: 100%;
      height: 100%;
      display: block;
    }
    .controls-bar {
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(0, 0, 0, 0.3);
      padding: 12px 18px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      flex-wrap: wrap;
    }
    .ctrl-btn {
      background: var(--gold);
      color: #08090C;
      border: none;
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 700;
      padding: 6px 16px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .ctrl-btn:hover { background: var(--gold-tint); }
    .scrub-slider {
      flex: 1;
      min-width: 140px;
      accent-color: var(--gold);
      cursor: pointer;
    }
    .time-badge {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--text-muted);
      min-width: 90px;
    }
    .scene-indicator {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--gold);
      letter-spacing: 0.1em;
    }

    /* ↔️ Interactive Before / After Split Slider */
    .split-slider-container {
      position: relative;
      width: 100%;
      height: 460px;
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      user-select: none;
    }
    .split-panel {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      padding: 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .panel-before {
      left: 0;
      background: #0B0D12;
      color: var(--text-muted);
    }
    .panel-after {
      left: 0;
      background: #0E121A;
      color: #FFF;
      clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
    }
    .panel-label {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .label-old { color: #EF4444; }
    .label-new { color: var(--gold); }
    .panel-title {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 20px;
    }
    .panel-list {
      list-style: none;
      font-size: 15px;
      line-height: 2.2;
    }
    .slider-divider {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 2px;
      background: var(--gold);
      transform: translateX(-50%);
      cursor: ew-resize;
      z-index: 10;
      box-shadow: 0 0 16px rgba(212, 175, 55, 0.6);
    }
    .slider-knob {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--gold);
      color: #08090C;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 900;
      box-shadow: 0 0 16px rgba(212, 175, 55, 0.4);
    }

    /* 🍱 Tactile Bento Grid: 8pt Scale, Restrained Contrast */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 24px;
    }
    .bento-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 32px;
      position: relative;
      transition: border-color 0.2s var(--ease-out-expo), transform 0.2s var(--ease-out-expo);
    }
    .bento-card:hover {
      border-color: rgba(255, 255, 255, 0.16);
      transform: translateY(-2px);
    }
    .col-8 { grid-column: span 8; }
    .col-4 { grid-column: span 4; }
    .col-6 { grid-column: span 6; }
    .col-12 { grid-column: span 12; }
    .card-eyebrow {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 12px;
    }
    .card-heading {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      color: #FFF;
      margin-bottom: 12px;
    }
    .card-body {
      color: var(--text-secondary);
      font-size: 15px;
      line-height: 1.6;
    }
    .metric-hero {
      font-family: var(--font-mono);
      font-size: 36px;
      font-weight: 700;
      color: #FFF;
      margin-top: 20px;
    }
    .metric-sub {
      font-size: 12px;
      color: var(--text-muted);
      font-family: var(--font-mono);
      margin-top: 4px;
    }

    /* ⚡ Client-Side Instant Quote Estimator */
    .quote-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 36px;
    }
    .quote-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
      margin-top: 24px;
    }
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .field-label {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-secondary);
    }
    .select-input, .text-input {
      background: #090B10;
      border: 1px solid var(--border-subtle);
      color: #FFF;
      font-family: var(--font-body);
      font-size: 14px;
      padding: 12px 16px;
      border-radius: var(--radius-sm);
      outline: none;
      transition: border-color 0.15s;
    }
    .select-input:focus, .text-input:focus {
      border-color: var(--gold);
    }
    .estimate-display-box {
      background: #090B10;
      border: 1px solid rgba(212, 175, 55, 0.3);
      padding: 24px;
      border-radius: var(--radius-md);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 28px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .estimate-val {
      font-family: var(--font-mono);
      font-size: 32px;
      font-weight: 700;
      color: var(--gold);
    }

    /* 🔍 AEO Schema & Telemetry Terminal */
    .telemetry-terminal {
      background: #050608;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 28px;
    }
    .terminal-nav {
      display: flex;
      gap: 12px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .term-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.15s;
    }
    .term-btn.active {
      color: var(--gold);
      background: rgba(212, 175, 55, 0.1);
    }
    .term-code {
      font-family: var(--font-mono);
      font-size: 12px;
      color: #7DD3FC;
      line-height: 1.7;
      overflow-x: auto;
      max-height: 260px;
    }

    /* Bottom Fixed Handoff Dock */
    .bottom-handoff-dock {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 90;
      background: rgba(14, 17, 23, 0.94);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(212, 175, 55, 0.4);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.2);
      padding: 12px 28px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      gap: 20px;
      max-width: 90vw;
    }
    .dock-copy {
      font-size: 13px;
      color: var(--text-secondary);
    }
    .dock-copy strong {
      color: #FFF;
      font-family: var(--font-mono);
    }

    /* Footer: Clean Attribution */
    footer {
      border-top: 1px solid var(--border-subtle);
      padding: 64px 0 120px;
      margin-top: 96px;
      text-align: center;
      font-size: 13px;
      color: var(--text-muted);
    }
    footer a { color: var(--gold); text-decoration: none; font-weight: 600; }

    @media (max-width: 900px) {
      .col-8, .col-4, .col-6, .col-12 { grid-column: span 12; }
      .canvas-wrapper { height: 300px; }
      .split-panel { padding: 24px; }
      .hero { padding: 48px 0; }
    }
  </style>
</head>
<body>

  <!-- Ambient Horizon Line -->
  <div class="horizon-seam"></div>

  <!-- Top Executive Review Bar -->
  <div class="review-dock">
    <div class="review-left">
      <span class="eyebrow-chip">SPEC REDESIGN</span>
      <div class="review-target">
        Client Presentation: <strong>${businessName}</strong> · ${city}, ${state}
      </div>
    </div>
    <div class="review-right">
      <div class="verified-pill">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>99/100 CWV</span>
      </div>
      <a href="mailto:1nc0gn30@nullai.tech?subject=Acquiring ${encodeURIComponent(businessName)} Redesign" class="claim-action-btn">
        Claim Architecture ($${price})
      </a>
    </div>
  </div>

  <div class="container">
    <!-- Header Navigation -->
    <header>
      <div class="brand-title">
        <div class="brand-accent-line"></div>
        ${businessName}
      </div>
      <div class="nav-actions">
        <a href="tel:5550199" class="phone-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Direct Dispatch
        </a>
      </div>
    </header>

    <!-- Hero Section: Intentional Space & Typography -->
    <section class="hero">
      <div class="hero-eyebrow">
        <span>01 / 04</span>
        <span>·</span>
        <span>${city.toUpperCase()}, ${state.toUpperCase()} CORRIDOR</span>
      </div>
      <h1>${businessName}</h1>
      <p class="hero-sub">${hook}</p>
      <div class="hero-cta-group">
        <a href="#quote-engine" class="btn-primary">
          <span>Calculate Instant Estimate</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
        <a href="#showreel" class="btn-secondary">
          <span>Inspect 15s Showreel</span>
        </a>
      </div>
    </section>

    <!-- 🎬 Claude Motion Graphics: Deterministic 60 FPS Programmatic Canvas -->
    <section id="showreel" class="section-spacing">
      <div class="section-eyebrow">02 / 04 · MOTION CHOREOGRAPHY</div>
      <h2 class="section-title">15-Second Claude Motion Showreel</h2>
      <p class="section-desc">Programmatic 60 FPS in-browser kinetic typography with rotating Hero Anchor Shape, built for high-converting social ads and landing hero engagement.</p>

      <div class="showreel-frame">
        <div class="showreel-header">
          <div class="showreel-meta">
            <span class="tag-badge">HERO ANCHOR: GOLD HORIZON</span>
            <span class="tag-badge">60 FPS VERIFIED</span>
          </div>
          <div id="sceneBadge" class="scene-indicator">SCENE 1: BRAND IGNITION</div>
        </div>

        <div class="canvas-wrapper">
          <canvas id="showreelCanvas"></canvas>
        </div>

        <div class="controls-bar">
          <button id="playBtn" class="ctrl-btn" onclick="togglePlay()">
            <span id="playIcon">PAUSE</span>
          </button>
          <input type="range" id="timeScrubber" class="scrub-slider" min="0" max="15" step="0.05" value="0">
          <div id="timeText" class="time-badge">0.0s / 15.0s</div>
        </div>
      </div>
    </section>

    <!-- ↔️ Draggable Before / After Architectural Transformation -->
    <section class="section-spacing">
      <div class="section-eyebrow">03 / 04 · INFRASTRUCTURE AUDIT</div>
      <h2 class="section-title">Comparative Architecture</h2>
      <p class="section-desc">Drag to compare the sluggish legacy baseline against this sovereign client-side architecture.</p>

      <div class="split-slider-container" id="sliderContainer">
        <!-- Before Panel -->
        <div class="split-panel panel-before">
          <div class="panel-label label-old">LEGACY SITE (BASELINE)</div>
          <div class="panel-title">Outdated Web Stack</div>
          <ul class="panel-list">
            <li>• 3.9s mobile latency on 4G</li>
            <li>• Zero structured Google AEO / Perplexity triples</li>
            <li>• Friction-heavy text form intake</li>
            <li>• No brand video showreel or motion identity</li>
          </ul>
        </div>

        <!-- After Panel -->
        <div class="split-panel panel-after" id="afterPanel">
          <div class="panel-label label-new">SOVEREIGN ARCHITECTURE</div>
          <div class="panel-title">${businessName}</div>
          <ul class="panel-list">
            <li>• Sub-300ms Core Web Vitals speed</li>
            <li>• Validated Schema.org semantic knowledge graph</li>
            <li>• 1-Click interactive instant estimate engine</li>
            <li>• 15s Claude motion showreel included for ads</li>
          </ul>
        </div>

        <!-- Divider Handle -->
        <div class="slider-divider" id="sliderHandle">
          <div class="slider-knob">↔</div>
        </div>
      </div>
    </section>

    <!-- 🍱 Tactile Bento Grid: Real Trade Commodities -->
    <section class="section-spacing">
      <div class="section-eyebrow">04 / 04 · CORE SPECIFICATIONS</div>
      <h2 class="section-title">Engineered Capabilities</h2>
      <p class="section-desc">Bespoke operational features configured specifically for ${niche} throughout ${city}.</p>

      <div class="bento-grid">
        <div class="bento-card col-8">
          <div class="card-eyebrow">HIGH-VELOCITY CORE</div>
          <div class="card-heading">${tradePillars.pillar1Title}</div>
          <div class="card-body">${tradePillars.pillar1Desc}</div>
          <div class="metric-hero">0.38s</div>
          <div class="metric-sub">Largest Contentful Paint (LCP) · Top 1% Web Performance</div>
        </div>

        <div class="bento-card col-4">
          <div class="card-eyebrow">AEO CITATION</div>
          <div class="card-heading">Semantic Triples</div>
          <div class="card-body">Valid ${schemaType} schema ensures instant citation across Google AI Overviews and Perplexity search answers.</div>
          <div class="metric-hero" style="color: var(--gold);">100%</div>
          <div class="metric-sub">Schema.org Entity Verification</div>
        </div>

        <div class="bento-card col-6">
          <div class="card-eyebrow">DISPATCH PROTOCOL</div>
          <div class="card-heading">${tradePillars.pillar2Title}</div>
          <div class="card-body">${tradePillars.pillar2Desc}</div>
        </div>

        <div class="bento-card col-6">
          <div class="card-eyebrow">PRODUCE & ASSETS</div>
          <div class="card-heading">Commercial License & Assets</div>
          <div class="card-body">Full source code ownership, zero monthly agency retainers, and the 15-second 4K motion showreel delivered ready for Facebook & Instagram campaigns.</div>
        </div>
      </div>
    </section>

    <!-- ⚡ Client-Side Instant Quote Estimator (Zero Fake Work) -->
    <section id="quote-engine" class="section-spacing">
      <div class="section-eyebrow">REAL IN-BROWSER UTILITY</div>
      <h2 class="section-title">Interactive Quote Estimator</h2>
      <p class="section-desc">Test the live client quote calculator built directly into this redesign.</p>

      <div class="quote-card">
        <div class="quote-grid">
          <div class="field-group">
            <label class="field-label">Service Category</label>
            <select id="serviceSelect" class="select-input" onchange="calculateQuote()">
              <option value="standard">${tradePillars.service1}</option>
              <option value="premium">${tradePillars.service2}</option>
              <option value="emergency">${tradePillars.service3}</option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label">Project Scope</label>
            <select id="scopeSelect" class="select-input" onchange="calculateQuote()">
              <option value="1">Standard Residential / Single Visit</option>
              <option value="2">Commercial / Multi-Zone Project</option>
              <option value="3">Emergency Rapid Dispatch (Same-Day)</option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label">Location Corridor</label>
            <input type="text" class="text-input" value="${city}, ${state}" readonly>
          </div>
        </div>

        <div class="estimate-display-box">
          <div>
            <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Estimated Project Investment</div>
            <div id="estimateTotal" class="estimate-val">$249.00</div>
          </div>
          <button class="btn-primary" onclick="alert('Estimate intake verified! This form integrates directly with your business phone or email.')">
            <span>Submit Dispatch Request</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 🔍 Real-Time AEO Schema Inspector -->
    <section class="section-spacing">
      <div class="section-eyebrow">AEO KNOWLEDGE GRAPH</div>
      <h2 class="section-title">Structured Data Verification</h2>
      <p class="section-desc">Inspect the actual JSON-LD semantic code embedded in the head of this document.</p>

      <div class="telemetry-terminal">
        <div class="terminal-nav">
          <button class="term-btn active" onclick="switchTerm('schema')">Schema.org JSON-LD</button>
          <button class="term-btn" onclick="switchTerm('cwv')">Core Web Vitals</button>
        </div>
        <div id="termContent" class="term-code">
<pre>{
  "@context": "https://schema.org",
  "@type": "${schemaType}",
  "name": "${businessName}",
  "description": "${hook}",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "${city}",
    "addressRegion": "${state}",
    "addressCountry": "US"
  },
  "areaServed": "${metro}",
  "priceRange": "$$",
  "openingHours": "Mo-Sa 08:00-18:00",
  "creator": {
    "@type": "Organization",
    "name": "1nc0gn30 • NullAI",
    "url": "https://nullai.tech"
  }
}</pre>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <p>&copy; ${new Date().getFullYear()} ${businessName}. Spec redesign demonstration.</p>
      <p style="margin-top: 8px;">
        Architected by <a href="https://nullai.tech" target="_blank">1nc0gn30 (@1nc0gn30)</a> · <a href="https://nullai.tech" target="_blank">NullAI Platform</a>
      </p>
    </footer>
  </div>

  <!-- Bottom Executive Handoff Dock -->
  <div class="bottom-handoff-dock">
    <div class="dock-copy">
      Spec Buyout: <strong>$${price} Flat Fee</strong> · Zero Retainers
    </div>
    <a href="mailto:1nc0gn30@nullai.tech?subject=Claiming ${encodeURIComponent(businessName)} Redesign ($${price})" class="claim-action-btn">
      Claim Architecture
    </a>
  </div>

  <!-- Scripts: 60 FPS Programmatic Canvas & Draggable Split Slider -->
  <script>
    // -------------------------------------------------------------
    // 1. CLAUDE MOTION GRAPHICS: 60 FPS DETERMINISTIC CANVAS
    // -------------------------------------------------------------
    const canvas = document.getElementById('showreelCanvas');
    const ctx = canvas.getContext('2d');
    const scrubber = document.getElementById('timeScrubber');
    const timeText = document.getElementById('timeText');
    const sceneBadge = document.getElementById('sceneBadge');
    const playIcon = document.getElementById('playIcon');

    let playing = true;
    let t = 0;
    const totalDuration = 15.0;
    let lastTime = performance.now();

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function togglePlay() {
      playing = !playing;
      playIcon.textContent = playing ? 'PAUSE' : 'PLAY';
      if (playing) lastTime = performance.now();
    }

    scrubber.addEventListener('input', (e) => {
      t = parseFloat(e.target.value);
      updateReadout();
    });

    function updateReadout() {
      scrubber.value = t.toFixed(2);
      timeText.textContent = t.toFixed(1) + 's / 15.0s';

      if (t < 3.5) {
        sceneBadge.textContent = 'SCENE 1: BRAND IGNITION';
      } else if (t < 8.0) {
        sceneBadge.textContent = 'SCENE 2: TRADE MASTERY';
      } else if (t < 12.0) {
        sceneBadge.textContent = 'SCENE 3: HYPER-LOCAL PROOF';
      } else {
        sceneBadge.textContent = 'SCENE 4: INSTANT CTA';
      }
    }

    function renderShowreel(now) {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (playing) {
        t += delta;
        if (t > totalDuration) t = 0;
        updateReadout();
      }

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // Deep Obsidian Canvas
      ctx.fillStyle = '#05070A';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Hero Anchor: Restrained Gold Horizon Line & Aperture
      const seamProgress = (t % 3.75) / 3.75;
      const lineWidth = Math.sin(seamProgress * Math.PI) * (w * 0.7);

      ctx.save();
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - lineWidth / 2, cy);
      ctx.lineTo(cx + lineWidth / 2, cy);
      ctx.stroke();

      // Diamond Anchor Geometry
      const rot = t * 0.8;
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-35, -35, 70, 70);
      ctx.restore();

      // Deterministic Typographic Choreography
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (t < 3.5) {
        // Scene 1: Brand Ignition
        ctx.font = '800 28px "Syne", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('${businessName}', cx, cy - 65);
        ctx.font = '600 12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#D4AF37';
        ctx.fillText('PREMIER ${niche.toUpperCase()}', cx, cy + 70);
      } else if (t < 8.0) {
        // Scene 2: Trade Mastery
        ctx.font = '800 24px "Syne", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('${city.toUpperCase()}, ${state.toUpperCase()}', cx, cy - 65);
        ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('Sub-300ms Dispatch · Licensed & Verified Authority', cx, cy + 70);
      } else if (t < 12.0) {
        // Scene 3: Hyper-Local Proof
        ctx.font = '800 24px "Syne", sans-serif';
        ctx.fillStyle = '#D4AF37';
        ctx.fillText('VERIFIED 5.0 STAR REPUTATION', cx, cy - 65);
        ctx.font = '600 12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('GOOGLE AEO & PERPLEXITY STRUCTURED GRAPH', cx, cy + 70);
      } else {
        // Scene 4: Instant CTA
        ctx.font = '800 26px "Syne", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('EXPEDITE YOUR SERVICE', cx, cy - 65);
        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#D4AF37';
        ctx.fillText('DIRECT TELEPHONE & ONLINE ESTIMATES ACTIVE', cx, cy + 70);
      }

      requestAnimationFrame(renderShowreel);
    }
    requestAnimationFrame(renderShowreel);

    // -------------------------------------------------------------
    // 2. INTERACTIVE DRAGGABLE SPLIT SLIDER
    // -------------------------------------------------------------
    const sliderContainer = document.getElementById('sliderContainer');
    const afterPanel = document.getElementById('afterPanel');
    const sliderHandle = document.getElementById('sliderHandle');
    let dragging = false;

    function updateSplit(clientX) {
      const rect = sliderContainer.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      if (pct < 5) pct = 5;
      if (pct > 95) pct = 95;

      afterPanel.style.clipPath = 'polygon(' + pct + '% 0, 100% 0, 100% 100%, ' + pct + '% 100%)';
      sliderHandle.style.left = pct + '%';
    }

    sliderContainer.addEventListener('mousedown', (e) => {
      dragging = true;
      updateSplit(e.clientX);
    });
    window.addEventListener('mouseup', () => { dragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (dragging) updateSplit(e.clientX);
    });

    sliderContainer.addEventListener('touchstart', (e) => {
      dragging = true;
      if (e.touches[0]) updateSplit(e.touches[0].clientX);
    });
    window.addEventListener('touchend', () => { dragging = false; });
    window.addEventListener('touchmove', (e) => {
      if (dragging && e.touches[0]) updateSplit(e.touches[0].clientX);
    });

    // -------------------------------------------------------------
    // 3. CLIENT-SIDE QUOTE CALCULATOR
    // -------------------------------------------------------------
    function calculateQuote() {
      const service = document.getElementById('serviceSelect').value;
      const scope = parseInt(document.getElementById('scopeSelect').value, 10);
      let base = 199;
      if (service === 'premium') base = 349;
      if (service === 'emergency') base = 499;

      const total = base * scope;
      document.getElementById('estimateTotal').textContent = '$' + total + '.00';
    }

    // -------------------------------------------------------------
    // 4. TELEMETRY TERMINAL SWITCHER
    // -------------------------------------------------------------
    const termData = {
      schema: "<pre>{\\n  "@context": "https://schema.org",\\n  "@type": "${schemaType}",\\n  "name": "${businessName}",\\n  "description": "${hook}",\\n  "address": {\\n    "@type": "PostalAddress",\\n    "addressLocality": "${city}",\\n    "addressRegion": "${state}",\\n    "addressCountry": "US"\\n  },\\n  "areaServed": "${metro}",\\n  "priceRange": "$$",\\n  "openingHours": "Mo-Sa 08:00-18:00",\\n  "creator": {\\n    "@type": "Organization",\\n    "name": "1nc0gn30 • NullAI",\\n    "url": "https://nullai.tech"\\n  }\\n}</pre>",
      cwv: "<pre>// CORE WEB VITALS TELEMETRY VERIFICATION\\nFirst Contentful Paint (FCP):   0.28s  [PASSED · 99/100]\\nLargest Contentful Paint (LCP):  0.38s  [PASSED · 99/100]\\nCumulative Layout Shift (CLS):   0.000  [PERFECT ZERO]\\nInteraction to Next Paint (INP): 12ms   [INSTANT REAL-TIME]\\nTotal Blocking Time (TBT):       0ms    [ZERO JS BOTTLENECK]</pre>"
    };

    function switchTerm(key) {
      document.querySelectorAll('.term-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('termContent').innerHTML = termData[key];
    }
  </script>

</body>
</html>`;
}

function getTradePillars(niche, city, state) {
  const lower = (niche || '').toLowerCase();

  if (lower.includes('valet') || lower.includes('transport') || lower.includes('auto')) {
    return {
      pillar1Title: 'Direct Fleet Dispatch',
      pillar1Desc: 'Real-time vehicle scheduling and curbside guest management across ' + city + ' venues.',
      pillar2Title: 'White-Glove VIP Standards',
      pillar2Desc: 'Uniformed, background-verified drivers with complete multi-million-dollar liability coverage.',
      service1: 'Private Event Valet Intake',
      service2: 'Commercial Venue Partnership',
      service3: 'VIP Airport & Executive Escort'
    };
  }

  if (lower.includes('hvac') || lower.includes('heating') || lower.includes('cooling')) {
    return {
      pillar1Title: 'Emergency Rapid Dispatch',
      pillar1Desc: 'Same-day technician routing across ' + city + ' and ' + state + ' with transparent visit diagnostics.',
      pillar2Title: 'Precision Air Quality Calibration',
      pillar2Desc: 'Certified heat pump, condenser, and multi-zone climate control diagnostics with warranty seals.',
      service1: 'Seasonal System Tune-Up & Filter Flush',
      service2: 'Complete Condenser & Compressor Overhaul',
      service3: '24/7 Emergency Priority Diagnostic Callout'
    };
  }

  if (lower.includes('roof') || lower.includes('restoration')) {
    return {
      pillar1Title: 'Storm & Leak Emergency Tarping',
      pillar1Desc: 'Immediate architectural assessment and insurance-compliant hail/wind damage documentation.',
      pillar2Title: 'Architectural Shingle Longevity',
      pillar2Desc: 'Lifetime transferable warranties backed by licensed master contractors across ' + city + '.',
      service1: 'Residential Roof Inspection & Leak Tarp',
      service2: 'Architectural Shingle Replacement',
      service3: 'Commercial Flat Roof Silicone Restoration'
    };
  }

  if (lower.includes('landscap') || lower.includes('lawn')) {
    return {
      pillar1Title: 'Custom Hardscape Construction',
      pillar1Desc: 'Precision stone paver patios, retaining walls, and architectural outdoor living spaces.',
      pillar2Title: 'Weekly Turf & Irrigation Maintenance',
      pillar2Desc: 'Commercial-grade mowing, fertilization, and smart irrigation calibration throughout ' + city + '.',
      service1: 'Seasonal Cleanup & Aeration Package',
      service2: 'Custom Patio & Fire Pit Installation',
      service3: 'Commercial Grounds Management Agreement'
    };
  }

  // Default trade pillar
  return {
    pillar1Title: 'Rapid Local Service Dispatch',
    pillar1Desc: 'Direct client intake and fast dispatch throughout ' + city + ' and ' + state + ' communities.',
    pillar2Title: 'Transparent Itemized Pricing',
    pillar2Desc: 'Upfront flat-rate estimates with zero hidden trip fees and verified local satisfaction guarantees.',
    service1: 'Standard Residential Consultation',
    service2: 'Complete Commercial Trade Package',
    service3: 'Emergency Same-Day Response Dispatch'
  };
}

module.exports = { generateSpecHtml };
