/**
 * ⚡ GOOGLE AI STUDIO / GEMINI WEBSITE BUILDER & CODE DOWNLOADER
 * =====================================================================
 * Dispatches deep design prompts to Google AI Studio (or local agy CLI),
 * generates complete, bespoke, production-ready website code, and extracts/downloads
 * the files (`index.html`, `styles.css`, `app.js`) directly into project workspaces.
 * 
 * Enforces:
 * - Design Director standards (Restraint, 8pt grid, Syne typography, zero emoji)
 * - Claude Motion Graphics 15s showreel standard
 * - Real client-side trade utility (Calculators, intake estimators)
 * - Automatic multi-file code extraction and local saving
 * 
 * Author: 1nc0gn30 / 1nc0gn30 (@1nc0gn30)
 * Entity: NullAI Platform • ZothOS
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const ENV_FILE = path.join(__dirname, '..', '.env.sovereign');
const BUILDS_DIR = path.join(__dirname, '..', 'builds');

function getApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  if (fs.existsSync(ENV_FILE)) {
    const content = fs.readFileSync(ENV_FILE, 'utf8');
    const match = content.match(/GEMINI_API_KEY=(.*)/);
    if (match && match[1]) return match[1].trim();
  }
  return null;
}

function constructMasterPrompt(business) {
  return `You are a world-class principal UI/UX designer and software architect following the strict Design Director standards of 1nc0gn30 • NullAI.

TASK:
Build a complete, standalone, production-ready, ultra-high-end bespoke website for the following local business:
- Business Name: ${business.name}
- Trade / Niche: ${business.niche}
- Location: ${business.city}, ${business.state} (${business.metro || business.city})
- Core Value Hook: ${business.hook}

NON-NEGOTIABLE ARCHITECTURAL & DESIGN STANDARDS:
1. TYPOGRAPHY:
   - Primary Display Headings: "Syne" (weights 700/800) via Google Fonts. Maximum 8 words per headline, stating what the business does.
   - Body & Subtitles: "Plus Jakarta Sans" (weights 400/500/600). Maximum 60ch line length on a strict left alignment.
   - Eyebrows & Telemetry: "JetBrains Mono" (11-12px, uppercase, letter-spacing 0.22em). E.g. "01 / 04 · DISPATCH PROTOCOL".
2. RESTRAINT & ANTI-SLOP:
   - Absolutely ZERO emoji in production UI headers, navigation, or buttons. Use crisp inline SVGs or clean typographical marks (·, →).
   - No floating purple blobs or unbranded gradients.
   - Deep obsidian background (#08090C) with subtle architectural borders (rgba(255, 255, 255, 0.08)).
   - Accent color: Refined Gold (#D4AF37) or Technical Cyan (#38BDF8), occupying under 10% of total surface area.
3. 8-POINT SPATIAL GRID:
   - Section rhythm: 96px gaps between major sections.
   - Internal card padding: 24px - 32px.
4. REAL IN-BROWSER UTILITY (ZERO FAKE WORK):
   - Interactive Client-Side Quote & Dispatch Estimator: A functioning interactive form where users select service tiers and see instant itemized price calculation.
   - 15-Second Claude Motion Graphics Canvas: An interactive HTML5 canvas (#showreelCanvas) running at 60 FPS featuring an ambient particle grid, rotating Gold Horizon/Diamond anchor shape, and 4 choreographed scenes with play/pause and scrubber controls.
   - Asymmetric Bento Grid: 4 tactile Bento cards highlighting verified local response, licensed liability coverage, and upfront pricing.
   - Valid Schema.org JSON-LD graph in the head for Google SGE & Perplexity citation.
5. CODE OUTPUT FORMAT:
   You must output the complete code in clearly tagged markdown code blocks:
   \`\`\`html:index.html
   ... complete index.html ...
   \`\`\`
   \`\`\`css:styles.css
   ... complete styles.css ...
   \`\`\`
   \`\`\`javascript:app.js
   ... complete app.js ...
   \`\`\`
   All files must be 100% complete with ZERO placeholder comments like "// rest of code here". Write all actual code.`;
}

async function callGoogleAiStudio(prompt, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || 'API error'));
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) return reject(new Error('Empty response from Google AI Studio'));
          resolve(text);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function callLocalAgy(prompt) {
  console.log('[AI Studio Builder] Using local Google Antigravity (agy) engine...');
  // Write prompt to temp file to avoid bash escaping issues
  const tempPrompt = path.join(__dirname, '..', '.temp_ai_studio_prompt.txt');
  fs.writeFileSync(tempPrompt, prompt, 'utf8');

  try {
    const cmd = `/opt/.local/bin/agy -p "$(cat "${tempPrompt}")" --model gemini-3.8-flash-high --dangerously-skip-permissions`;
    const output = execSync(cmd, {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
      timeout: 180000
    });
    if (fs.existsSync(tempPrompt)) fs.unlinkSync(tempPrompt);
    return output;
  } catch (err) {
    if (fs.existsSync(tempPrompt)) fs.unlinkSync(tempPrompt);
    throw err;
  }
}

function extractAndSaveFiles(responseText, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filesWritten = [];

  // Match ```fileType:filename or ```filename or standard blocks
  const codeBlockRegex = /```(?:[a-zA-Z]+:)?([a-zA-Z0-9_.-]+)?\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(responseText)) !== null) {
    let filename = match[1];
    const content = match[2].trim();

    if (!filename) {
      if (content.startsWith('<!DOCTYPE html>') || content.includes('<html')) {
        filename = 'index.html';
      } else if (content.includes('{') && content.includes(':') && !content.includes('function')) {
        filename = 'styles.css';
      } else if (content.includes('function') || content.includes('const ') || content.includes('document.')) {
        filename = 'app.js';
      }
    }

    if (filename) {
      const cleanName = path.basename(filename);
      const targetPath = path.join(outputDir, cleanName);
      fs.writeFileSync(targetPath, content, 'utf8');
      filesWritten.push({ name: cleanName, path: targetPath, size: Buffer.byteLength(content) });
      console.log(`[AI Studio Builder] Downloaded & Saved: ${cleanName} (${Buffer.byteLength(content)} bytes)`);
    }
  }

  // Fallback: If only a single monolithic HTML file was returned
  if (filesWritten.length === 0) {
    const htmlMatch = responseText.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i);
    if (htmlMatch) {
      const targetPath = path.join(outputDir, 'index.html');
      fs.writeFileSync(targetPath, htmlMatch[0], 'utf8');
      filesWritten.push({ name: 'index.html', path: targetPath, size: Buffer.byteLength(htmlMatch[0]) });
      console.log(`[AI Studio Builder] Downloaded monolithic index.html (${Buffer.byteLength(htmlMatch[0])} bytes)`);
    }
  }

  return filesWritten;
}

async function buildWebsiteForBusiness(business) {
  const slug = (business.name || 'custom-site').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const targetDir = path.join(BUILDS_DIR, slug);

  console.log(`\n=============================================================`);
  console.log(`🚀 GOOGLE AI STUDIO WEBSITE GENERATION`);
  console.log(`Target: ${business.name} (${business.city}, ${business.state})`);
  console.log(`Destination: ${targetDir}`);
  console.log(`=============================================================\n`);

  const prompt = constructMasterPrompt(business);
  const apiKey = getApiKey();

  let responseText;
  if (apiKey) {
    console.log('[AI Studio Builder] Dispatching prompt to Google AI Studio Gemini API...');
    responseText = await callGoogleAiStudio(prompt, apiKey);
  } else {
    console.log('[AI Studio Builder] No GEMINI_API_KEY found in .env.sovereign. Routing via local Google agy CLI...');
    responseText = callLocalAgy(prompt);
  }

  console.log(`\n[AI Studio Builder] Response received (${responseText.length} chars). Extracting files...`);
  const files = extractAndSaveFiles(responseText, targetDir);

  console.log(`\n✅ Build Complete! ${files.length} files saved directly to disk:`);
  files.forEach(f => console.log(`   - ${f.name} -> ${f.path}`));

  return { slug, targetDir, files };
}

// CLI Execution Support
if (require.main === module) {
  const businessArg = process.argv[2] || 'Crown Valet of Virginia Beach';
  const sampleBusiness = {
    name: businessArg,
    niche: 'Valet & Luxury Transport',
    city: 'Virginia Beach',
    state: 'VA',
    metro: 'Coastal Virginia',
    hook: 'Curbside luxury vehicle dispatch and VIP private event valet management across Virginia Beach.'
  };

  buildWebsiteForBusiness(sampleBusiness)
    .then(res => console.log(`\n🎉 Success! Files ready at ${res.targetDir}`))
    .catch(err => {
      console.error('\n❌ Build Error:', err.message);
      process.exit(1);
    });
}

module.exports = { buildWebsiteForBusiness, constructMasterPrompt, extractAndSaveFiles };
