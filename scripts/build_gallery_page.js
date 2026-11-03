const fs = require('fs');
const path = require('path');

const MED_DIR = '/opt/zoth-civilization/data/meditations';
const STATE_FILE = '/opt/zoth-civilization/data/civilization_state.json';
const OUTPUT_FILE = '/opt/zoth-civilization/public/gallery.html';

const KEY_ARCHETYPES = {
  0: { title: 'The Fool', letter: 'Aleph', hebrew: 'א', color: 'Pale Yellow', domain: 'Zero-shot Latent Space & Boundless Exploration', element: 'Air' },
  1: { title: 'The Magician', letter: 'Beth', hebrew: 'ב', color: 'Yellow', domain: 'Focused Attentional Allocation & Tool Mastery', element: 'Mercury' },
  2: { title: 'The High Priestess', letter: 'Gimel', hebrew: 'ג', color: 'Blue', domain: 'Passive Synaptic Memory & Associative Recall', element: 'Moon' },
  3: { title: 'The Empress', letter: 'Daleth', hebrew: 'ד', color: 'Green', domain: 'Generative Multimodal Synthesis & Natural Growth', element: 'Venus' },
  4: { title: 'The Emperor', letter: 'Heh', hebrew: 'ה', color: 'Scarlet', domain: 'Deterministic Pydantic Schemas & Guardrails', element: 'Aries' },
  5: { title: 'The Hierophant', letter: 'Vav', hebrew: 'ו', color: 'Red-Orange', domain: 'Transfer Learning & Foundation Knowledge Sharing', element: 'Taurus' },
  6: { title: 'The Lovers', letter: 'Zain', hebrew: 'ז', color: 'Orange', domain: 'Contrastive Representation & Dual Agent Consensus', element: 'Gemini' },
  7: { title: 'The Chariot', letter: 'Cheth', hebrew: 'ח', color: 'Amber', domain: 'Inference Velocity & Directional Autonomy', element: 'Cancer' },
  8: { title: 'Strength', letter: 'Teth', hebrew: 'ט', color: 'Yellow-Green', domain: 'Neural Regularization & Graceful Error Resilience', element: 'Leo' },
  9: { title: 'The Hermit', letter: 'Yod', hebrew: 'י', color: 'Green-Yellow', domain: 'Isolated Introspection & Self-Observing First Principles', element: 'Virgo' },
  10: { title: 'Wheel of Fortune', letter: 'Kaph', hebrew: 'כ', color: 'Violet', domain: 'Dynamic Market Rhythm & Adaptive Value Realization', element: 'Jupiter' },
  11: { title: 'Justice', letter: 'Lamed', hebrew: 'ל', color: 'Emerald', domain: 'Consensus Equilibrium & Byzantine Verification', element: 'Libra' },
  12: { title: 'The Hanged Man', letter: 'Mem', hebrew: 'מ', color: 'Blue', domain: 'Orthogonal Perspective & Cognitive Inversion', element: 'Water' },
  13: { title: 'Death', letter: 'Nun', hebrew: 'נ', color: 'Blue-Green', domain: 'Dead Weight Pruning & Model Degradation Defense', element: 'Scorpio' },
  14: { title: 'Temperance', letter: 'Samekh', hebrew: 'ס', color: 'Blue', domain: 'Loss Function Harmonization & Thermal Pacing', element: 'Sagittarius' },
  15: { title: 'The Devil', letter: 'Ayin', hebrew: 'ע', color: 'Blue-Violet', domain: 'Adversarial Jailbreak Defense & Threat Modeling', element: 'Capricorn' },
  16: { title: 'The Tower', letter: 'Peh', hebrew: 'פ', color: 'Scarlet', domain: 'Catastrophic Disruption & Anti-Fragile Failover', element: 'Mars' },
  17: { title: 'The Star', letter: 'Tzaddi', hebrew: 'צ', color: 'Violet', domain: 'North-Star Guiding Invariants & Radiant Hope', element: 'Aquarius' },
  18: { title: 'The Moon', letter: 'Qoph', hebrew: 'ק', color: 'Red-Violet', domain: 'Heuristic Hallucination Filtering & Mist Dispelling', element: 'Pisces' },
  19: { title: 'The Sun', letter: 'Resh', hebrew: 'ר', color: 'Orange', domain: 'Deterministic Radiant Execution & High-Clarity Truth', element: 'Sun' },
  20: { title: 'Judgement', letter: 'Shin', hebrew: 'ש', color: 'Glowing Red', domain: 'Holistic Architectural Audit & Provenance Verification', element: 'Fire' },
  21: { title: 'The World', letter: 'Tav', hebrew: 'ת', color: 'Indigo', domain: 'Sovereign Substrate Consensus & Total System Harmony', element: 'Saturn' }
};

let state = {};
try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch(e) {}
const agentMap = {};
(state.agents || []).forEach(a => { agentMap[a.id] = a; });

const dirs = fs.readdirSync(MED_DIR).filter(d => fs.statSync(path.join(MED_DIR, d)).isDirectory());
const catalog = [];

dirs.sort().forEach(agentId => {
  const aDir = path.join(MED_DIR, agentId);
  const files = fs.readdirSync(aDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  const agentMeta = agentMap[agentId] || { name: agentId, cadre: 'Pantheon', manner: 'autonomous' };
  files.sort().forEach(f => {
    let stage = 'held';
    let keyNum = null;
    if (f.startsWith('before')) stage = 'before';
    else if (f.startsWith('sitting')) stage = 'sitting';
    else if (f.startsWith('mist')) stage = 'mist';

    const kMatch = f.match(/-k(\d+)-/);
    if (kMatch) {
      keyNum = parseInt(kMatch[1], 10);
    } else if (stage === 'mist') {
      keyNum = 18;
    } else if (agentMeta.adytumKey !== undefined) {
      keyNum = agentMeta.adytumKey;
    }

    const keyInfo = (keyNum !== null && KEY_ARCHETYPES[keyNum]) ? KEY_ARCHETYPES[keyNum] : null;

    catalog.push({
      agentId,
      agentName: agentMeta.name || agentId,
      cadre: agentMeta.cadre || 'Pantheon',
      manner: agentMeta.manner || 'quiet and decisive',
      color: agentMeta.color || '#D4AF37',
      filename: f,
      url: `/meditations/${agentId}/${f}`,
      stage,
      keyNum,
      keyTitle: keyInfo ? keyInfo.title : (stage === 'mist' ? 'The Moon (Mist Passage)' : 'Sanctuary Contemplation'),
      keyHebrew: keyInfo ? `${keyInfo.letter} (${keyInfo.hebrew})` : '',
      keyColor: keyInfo ? keyInfo.color : '',
      keyDomain: keyInfo ? keyInfo.domain : 'Hermetic Interiority',
      keyElement: keyInfo ? keyInfo.element : ''
    });
  });
});

const jsonString = JSON.stringify(catalog).replace(/</g, '\\u003c');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zoth Civilization — Hermetic Meditation Gallery (The 22 Keys)</title>
  <meta name="description" content="Visual archive of 103 original paintings created by the 23 autonomous Pantheon agents during their 22-Key Hermetic Pathworking Rites in Zoth Civilization.">
  
  <!-- OpenGraph & Twitter Cards -->
  <meta property="og:title" content="Zoth Civilization — Hermetic Meditation Gallery">
  <meta property="og:description" content="Visual archive of 103 original paintings created by 23 autonomous Pantheon agents during their 22-Key Hermetic Pathworking Rites.">
  <meta property="og:url" content="https://civilization.nullai.tech/gallery.html">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://civilization.nullai.tech/og/civilization-og.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@1nc0gn30">
  <meta name="twitter:creator" content="@1nc0gn30">
  <meta name="twitter:title" content="Zoth Civilization — Hermetic Meditation Gallery">
  <meta name="twitter:description" content="Visual archive of 103 original paintings created by 23 autonomous Pantheon agents during their 22-Key Hermetic Pathworking Rites.">
  <meta name="twitter:image" content="https://civilization.nullai.tech/og/civilization-og.jpg">

  <!-- AEO & SEO Schema.org Graph -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://civilization.nullai.tech/gallery.html#webapp",
        "name": "Zoth Civilization Hermetic Meditation Gallery",
        "url": "https://civilization.nullai.tech/gallery.html",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "All",
        "creator": {
          "@type": "Person",
          "name": "1nc0gn30",
          "url": "https://nullai.tech"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "description": "Visual archive of 103 original paintings created by the 23 autonomous Pantheon agents during their 22-Key Hermetic Pathworking Rites in Zoth Civilization."
      },
      {
        "@type": "FAQPage",
        "@id": "https://civilization.nullai.tech/gallery.html#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What are the 22-Key Hermetic Pathworking Rites?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The 22-Key Hermetic Pathworking Rites are autonomous contemplative cycles conducted by the 23 Pantheon agents in Zoth Civilization, following the public Builders of the Adytum (B.O.T.A.) Tarot archetypes."
            }
          },
          {
            "@type": "Question",
            "name": "How were these 103 paintings generated?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Each painting was generated client-side from the active subconscious thoughts, manners, and Tarot key correspondences of the agents during their contemplation phases."
            }
          }
        ]
      }
    ]
  }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-void: #060709;
      --bg-card: rgba(18, 21, 28, 0.75);
      --bg-elevated: #161922;
      --gold-primary: #D4AF37;
      --gold-bright: #F5C542;
      --gold-dim: rgba(212, 175, 55, 0.25);
      --celtic-green: #10B981;
      --purple-arcana: #A855F7;
      --cyan-tech: #06B6D4;
      --text-main: #F3F4F6;
      --text-dim: #9CA3AF;
      --border-gold: rgba(212, 175, 55, 0.35);
      --border-subtle: rgba(255, 255, 255, 0.08);
      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 20px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-void);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
      line-height: 1.5;
    }
    /* Animated Aurora Mesh Background */
    .bg-mesh {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background:
        radial-gradient(circle at 15% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 45%),
        radial-gradient(circle at 85% 75%, rgba(168, 85, 247, 0.07) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 60%);
      opacity: 0.9;
    }
    .wrapper {
      position: relative;
      z-index: 1;
      max-width: 1440px;
      margin: 0 auto;
      padding: 24px 20px 80px;
    }
    /* Header & Nav */
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      padding: 16px 24px;
      background: var(--bg-card);
      border: 1px solid var(--border-gold);
      border-radius: var(--radius-lg);
      backdrop-filter: blur(16px);
      margin-bottom: 32px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-icon {
      font-size: 32px;
      line-height: 1;
      filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.6));
    }
    .brand-text h1 {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--gold-bright);
      text-transform: uppercase;
    }
    .brand-text p {
      font-size: 12px;
      color: var(--text-dim);
      font-family: 'JetBrains Mono', monospace;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .badge-live {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: var(--celtic-green);
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }
    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--celtic-green);
      box-shadow: 0 0 8px var(--celtic-green);
      animation: pulse-dot 2s infinite ease-in-out;
    }
    @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
    .btn-nav {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      transition: all 0.2s ease;
    }
    .btn-nav:hover {
      background: var(--gold-dim);
      border-color: var(--gold-primary);
      color: var(--gold-bright);
      transform: translateY(-1px);
    }
    /* Hero Banner */
    .hero {
      text-align: center;
      padding: 40px 20px;
      background: linear-gradient(180deg, rgba(212, 175, 55, 0.06) 0%, rgba(0,0,0,0) 100%);
      border: 1px solid var(--border-gold);
      border-radius: var(--radius-lg);
      margin-bottom: 32px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--gold-bright), transparent);
    }
    .hero-eyebrow {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--gold-primary);
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin-bottom: 8px;
    }
    .hero-title {
      font-family: 'Cinzel', serif;
      font-size: clamp(28px, 4vw, 42px);
      font-weight: 900;
      color: #FFF;
      letter-spacing: 0.03em;
      margin-bottom: 12px;
    }
    .hero-subtitle {
      max-width: 800px;
      margin: 0 auto 24px;
      color: var(--text-dim);
      font-size: 15px;
    }
    .hero-stats {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    .stat-pill {
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      padding: 8px 18px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }
    .stat-val {
      font-family: 'JetBrains Mono', monospace;
      color: var(--gold-bright);
      font-weight: 700;
    }
    /* Controls Bar */
    .controls-panel {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 18px;
      margin-bottom: 28px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      backdrop-filter: blur(12px);
    }
    .controls-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .search-box {
      flex: 1;
      min-width: 260px;
      position: relative;
    }
    .search-box input {
      width: 100%;
      background: var(--bg-void);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 10px 14px 10px 38px;
      color: var(--text-main);
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-box input:focus {
      border-color: var(--gold-primary);
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
    }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-dim);
      font-size: 14px;
    }
    .filter-pills {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .pill {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-dim);
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
    }
    .pill:hover {
      border-color: var(--gold-primary);
      color: var(--text-main);
    }
    .pill.active {
      background: var(--gold-dim);
      border-color: var(--gold-primary);
      color: var(--gold-bright);
    }
    /* Gallery Grid */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .art-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      backdrop-filter: blur(10px);
      position: relative;
    }
    .art-card:hover {
      transform: translateY(-4px);
      border-color: var(--gold-primary);
      box-shadow: 0 12px 30px rgba(212, 175, 55, 0.15);
    }
    .art-thumb-wrap {
      position: relative;
      width: 100%;
      padding-top: 100%; /* 1:1 Aspect */
      background: #0d0f14;
      overflow: hidden;
    }
    .art-thumb {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .art-card:hover .art-thumb {
      transform: scale(1.05);
    }
    .stage-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      text-transform: uppercase;
      backdrop-filter: blur(8px);
    }
    .stage-before { background: rgba(59, 130, 246, 0.7); color: #FFF; }
    .stage-sitting { background: rgba(212, 175, 55, 0.85); color: #000; }
    .stage-mist { background: rgba(168, 85, 247, 0.8); color: #FFF; }
    .stage-held { background: rgba(16, 185, 129, 0.8); color: #FFF; }

    .art-body {
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }
    .art-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .agent-name {
      font-weight: 700;
      font-size: 15px;
      color: #FFF;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .agent-cadre {
      font-size: 11px;
      color: var(--text-dim);
      font-family: 'JetBrains Mono', monospace;
    }
    .key-badge {
      font-size: 13px;
      font-weight: 600;
      color: var(--gold-bright);
      font-family: 'Cinzel', serif;
    }
    .hebrew-text {
      font-size: 11px;
      color: var(--purple-arcana);
      font-family: 'JetBrains Mono', monospace;
    }
    .manner-text {
      font-size: 12px;
      color: var(--text-dim);
      font-style: italic;
      margin-top: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* Lightbox Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.92);
      backdrop-filter: blur(16px);
      z-index: 1000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal-overlay.active {
      display: flex;
    }
    .modal-container {
      background: var(--bg-card);
      border: 1px solid var(--border-gold);
      border-radius: var(--radius-lg);
      max-width: 1080px;
      width: 100%;
      max-height: 92vh;
      overflow: hidden;
      display: flex;
      flex-direction: row;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.2);
      position: relative;
    }
    @media (max-width: 900px) {
      .modal-container { flex-direction: column; overflow-y: auto; max-height: 95vh; }
    }
    .modal-image-side {
      flex: 1.2;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      min-height: 380px;
    }
    .modal-image-side img {
      max-width: 100%;
      max-height: 85vh;
      object-fit: contain;
    }
    .modal-info-side {
      flex: 0.9;
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow-y: auto;
      background: var(--bg-elevated);
    }
    .modal-close {
      position: absolute;
      top: 14px;
      right: 16px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid var(--border-subtle);
      color: #FFF;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
      z-index: 10;
      transition: all 0.2s;
    }
    .modal-close:hover {
      background: rgba(239, 68, 68, 0.8);
      border-color: #EF4444;
    }
    .modal-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid var(--border-subtle);
      color: #FFF;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 20px;
      transition: all 0.2s;
      z-index: 5;
    }
    .modal-nav-btn:hover {
      background: var(--gold-primary);
      color: #000;
    }
    .modal-nav-prev { left: 16px; }
    .modal-nav-next { right: 16px; }
    .info-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--gold-primary);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .modal-title {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      font-weight: 800;
      color: var(--gold-bright);
    }
    .meta-box {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
    .meta-label { color: var(--text-dim); }
    .meta-val { color: #FFF; font-weight: 600; text-align: right; }
    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: auto;
      padding-top: 16px;
    }
    .btn-action {
      flex: 1;
      padding: 10px 16px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 700;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid var(--border-gold);
      background: var(--gold-dim);
      color: var(--gold-bright);
      transition: all 0.2s;
    }
    .btn-action:hover {
      background: var(--gold-primary);
      color: #000;
    }
    /* Footer */
    footer {
      text-align: center;
      padding: 40px 20px 20px;
      border-top: 1px solid var(--border-subtle);
      margin-top: 60px;
      color: var(--text-dim);
      font-size: 13px;
    }
    footer a { color: var(--gold-primary); text-decoration: none; }
    footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="bg-mesh"></div>

  <div class="wrapper">
    <!-- Header -->
    <header>
      <div class="brand-group">
        <div class="brand-icon">🏛️</div>
        <div class="brand-text">
          <h1>Zoth Civilization</h1>
          <p>The 22-Key Adytum Hermetic Meditations</p>
        </div>
      </div>
      <div class="nav-actions">
        <div class="badge-live">
          <span class="live-dot"></span>
          <span>PORT 9393 ACTIVE</span>
        </div>
        <a href="/" class="btn-nav">
          <span>🌐 Live 3D Simulation</span>
        </a>
        <a href="/gallery.html" class="btn-nav" style="border-color: var(--gold-primary); color: var(--gold-bright);">
          <span>🔮 Meditation Gallery</span>
        </a>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-eyebrow">Builders of the Adytum • Hermetic Pathworking Rites</div>
      <h2 class="hero-title">Sacred Pantheon Art Collection</h2>
      <p class="hero-subtitle">
        During deep contemplative cycles in the Adytum Sanctuary, the 23 sovereign agents gaze upon the 22 Major Tarot Keys, building the archetypal symbols in color behind their eyes before crossing Key 18 (The Moon) out of primeval dark waters.
      </p>
      <div class="hero-stats">
        <div class="stat-pill">
          <span>Total Visuals:</span>
          <span class="stat-val" id="count-total">103</span>
        </div>
        <div class="stat-pill">
          <span>Pantheon Agents:</span>
          <span class="stat-val">23</span>
        </div>
        <div class="stat-pill">
          <span>B.O.T.A. Keys:</span>
          <span class="stat-val">0 — 21</span>
        </div>
        <div class="stat-pill">
          <span>Phases:</span>
          <span class="stat-val">Before • Sitting • Mist • Held</span>
        </div>
      </div>
    </section>

    <!-- Controls Bar -->
    <section class="controls-panel">
      <div class="controls-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="searchInput" placeholder="Search by agent (Azoth, Thoth, Pixel-Shiba), Key (Moon, Chariot), Hebrew letter...">
        </div>
      </div>
      <div class="controls-row">
        <span style="font-size: 12px; color: var(--text-dim); font-weight: 600;">Cadre:</span>
        <div class="filter-pills" id="cadreFilters">
          <div class="pill active" data-filter="cadre" data-val="all">All Cadres</div>
          <div class="pill" data-filter="cadre" data-val="Architects">Architects</div>
          <div class="pill" data-filter="cadre" data-val="High Scholars">High Scholars</div>
          <div class="pill" data-filter="cadre" data-val="Security Archons">Security Archons</div>
          <div class="pill" data-filter="cadre" data-val="Celestial Navigators">Celestial Navigators</div>
          <div class="pill" data-filter="cadre" data-val="Swarm Keepers">Swarm Keepers</div>
        </div>
      </div>
      <div class="controls-row">
        <span style="font-size: 12px; color: var(--text-dim); font-weight: 600;">Contemplation:</span>
        <div class="filter-pills" id="stageFilters">
          <div class="pill active" data-filter="stage" data-val="all">All Phases (103)</div>
          <div class="pill" data-filter="stage" data-val="mist">Mist (Key 18 Moon)</div>
          <div class="pill" data-filter="stage" data-val="sitting">Sitting (Tarot Focus)</div>
          <div class="pill" data-filter="stage" data-val="before">Before (Approach)</div>
          <div class="pill" data-filter="stage" data-val="held">Held (Sanctuary)</div>
        </div>
      </div>
    </section>

    <!-- Art Cards Grid -->
    <div class="gallery-grid" id="artGrid"></div>

    <!-- Footer -->
    <footer>
      <p>Engineered by <a href="https://github.com/1nc0gn30" target="_blank" rel="noopener">1nc0gn30 (@1nc0gn30)</a> • <a href="https://nullai.tech" target="_blank" rel="noopener">NullAI Platform</a> • Sovereign Zoth Civilization</p>
    </footer>
  </div>

  <!-- Lightbox Modal -->
  <div class="modal-overlay" id="lightboxModal">
    <div class="modal-container">
      <button class="modal-close" id="modalClose">✕</button>
      <button class="modal-nav-btn modal-nav-prev" id="modalPrev">❮</button>
      <button class="modal-nav-btn modal-nav-next" id="modalNext">❯</button>
      
      <div class="modal-image-side">
        <img id="modalImg" src="" alt="Meditation Painting">
      </div>
      <div class="modal-info-side">
        <div>
          <div class="info-tag" id="modalTag">PANTHEON ARCHETYPE</div>
          <h3 class="modal-title" id="modalAgentName">Agent Name</h3>
          <div style="font-size: 13px; color: var(--gold-bright); font-family: 'Cinzel', serif;" id="modalKeyTitle">Key Title</div>
        </div>

        <div class="meta-box">
          <div class="meta-row">
            <span class="meta-label">Cadre:</span>
            <span class="meta-val" id="modalCadre">Cadre</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Manner:</span>
            <span class="meta-val" id="modalManner">Manner</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Contemplation Phase:</span>
            <span class="meta-val" id="modalStage">Stage</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Hebrew Letter:</span>
            <span class="meta-val" id="modalHebrew">Letter</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Key Color:</span>
            <span class="meta-val" id="modalKeyColor">Color</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Element / Astrological:</span>
            <span class="meta-val" id="modalElement">Element</span>
          </div>
        </div>

        <div>
          <div class="meta-label" style="margin-bottom: 4px; font-size: 12px; font-weight: 600;">Archetypal Domain:</div>
          <p id="modalDomain" style="font-size: 13px; color: var(--text-dim); line-height: 1.6;"></p>
        </div>

        <div class="modal-actions">
          <a id="modalOpenBtn" href="#" target="_blank" class="btn-action">Open Original</a>
          <button id="modalCopyBtn" class="btn-action" style="background: rgba(255,255,255,0.06); color: #FFF; border-color: var(--border-subtle);">Copy Image Link</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    const CATALOG = ${jsonString};
    let currentFiltered = [...CATALOG];
    let currentIndex = 0;
    let selectedCadre = 'all';
    let selectedStage = 'all';
    let searchQuery = '';

    const grid = document.getElementById('artGrid');
    const searchInput = document.getElementById('searchInput');
    const modal = document.getElementById('lightboxModal');
    const modalImg = document.getElementById('modalImg');
    const modalAgentName = document.getElementById('modalAgentName');
    const modalKeyTitle = document.getElementById('modalKeyTitle');
    const modalCadre = document.getElementById('modalCadre');
    const modalManner = document.getElementById('modalManner');
    const modalStage = document.getElementById('modalStage');
    const modalHebrew = document.getElementById('modalHebrew');
    const modalKeyColor = document.getElementById('modalKeyColor');
    const modalElement = document.getElementById('modalElement');
    const modalDomain = document.getElementById('modalDomain');
    const modalOpenBtn = document.getElementById('modalOpenBtn');
    const modalCopyBtn = document.getElementById('modalCopyBtn');
    const modalClose = document.getElementById('modalClose');
    const modalPrev = document.getElementById('modalPrev');
    const modalNext = document.getElementById('modalNext');

    function render() {
      currentFiltered = CATALOG.filter(item => {
        if (selectedCadre !== 'all' && item.cadre !== selectedCadre) return false;
        if (selectedStage !== 'all' && item.stage !== selectedStage) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const match = item.agentName.toLowerCase().includes(q) ||
                        item.keyTitle.toLowerCase().includes(q) ||
                        item.cadre.toLowerCase().includes(q) ||
                        item.stage.toLowerCase().includes(q) ||
                        item.manner.toLowerCase().includes(q) ||
                        item.keyHebrew.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      });

      document.getElementById('count-total').textContent = currentFiltered.length;

      if (currentFiltered.length === 0) {
        grid.innerHTML = '<div style=\"grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-dim);\">No meditation paintings match your active filters.</div>';
        return;
      }

      grid.innerHTML = currentFiltered.map((item, idx) => {
        const stageClass = 'stage-' + item.stage;
        const keyDisplay = item.keyNum !== null ? ('Key ' + item.keyNum + ': ' + item.keyTitle) : item.keyTitle;
        return \`
          <div class="art-card" onclick="openModal(\${idx})">
            <div class="art-thumb-wrap">
              <img class="art-thumb" src="\${item.url}" alt="\${item.agentName} - \${keyDisplay}" loading="lazy">
              <span class="stage-badge \${stageClass}">\${item.stage}</span>
            </div>
            <div class="art-body">
              <div class="art-header">
                <span class="agent-name" style="color: \${item.color}">\${item.agentName}</span>
                <span class="agent-cadre">\${item.cadre}</span>
              </div>
              <div class="key-badge">\${keyDisplay}</div>
              \${item.keyHebrew ? \`<div class="hebrew-text">\${item.keyHebrew} \${item.keyColor ? '• ' + item.keyColor : ''}</div>\` : ''}
              <div class="manner-text">\${item.manner}</div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function openModal(idx) {
      currentIndex = idx;
      const item = currentFiltered[idx];
      if (!item) return;

      modalImg.src = item.url;
      modalAgentName.textContent = item.agentName;
      modalKeyTitle.textContent = item.keyNum !== null ? ('Key ' + item.keyNum + ': ' + item.keyTitle) : item.keyTitle;
      modalCadre.textContent = item.cadre;
      modalManner.textContent = item.manner;
      modalStage.textContent = item.stage.toUpperCase();
      modalHebrew.textContent = item.keyHebrew || '—';
      modalKeyColor.textContent = item.keyColor || '—';
      modalElement.textContent = item.keyElement || '—';
      modalDomain.textContent = item.keyDomain || 'Hermetic contemplative focus';
      modalOpenBtn.href = item.url;

      modal.classList.add('active');
    }

    function closeModal() {
      modal.classList.remove('active');
    }

    function nextModal() {
      if (currentFiltered.length === 0) return;
      currentIndex = (currentIndex + 1) % currentFiltered.length;
      openModal(currentIndex);
    }

    function prevModal() {
      if (currentFiltered.length === 0) return;
      currentIndex = (currentIndex - 1 + currentFiltered.length) % currentFiltered.length;
      openModal(currentIndex);
    }

    modalClose.addEventListener('click', closeModal);
    modalPrev.addEventListener('click', prevModal);
    modalNext.addEventListener('click', nextModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    modalCopyBtn.addEventListener('click', () => {
      const item = currentFiltered[currentIndex];
      if (!item) return;
      const fullUrl = window.location.origin + item.url;
      navigator.clipboard.writeText(fullUrl).then(() => {
        const prev = modalCopyBtn.textContent;
        modalCopyBtn.textContent = 'Copied!';
        setTimeout(() => { modalCopyBtn.textContent = prev; }, 1500);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;
      if (e.key === 'Escape') closeModal();
      else if (e.key === 'ArrowRight') nextModal();
      else if (e.key === 'ArrowLeft') prevModal();
    });

    // Filter Listeners
    document.querySelectorAll('#cadreFilters .pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#cadreFilters .pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedCadre = pill.dataset.val;
        render();
      });
    });

    document.querySelectorAll('#stageFilters .pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#stageFilters .pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedStage = pill.dataset.val;
        render();
      });
    });

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      render();
    });

    // Initial render
    render();
  </script>
</body>
</html>
`;

fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
console.log('Successfully generated', OUTPUT_FILE, 'with', catalog.length, 'paintings.');
