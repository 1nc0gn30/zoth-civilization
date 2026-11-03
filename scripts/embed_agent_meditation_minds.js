#!/usr/bin/env node
/**
 * scripts/embed_agent_meditation_minds.js
 * 
 * Backfills and embeds all 103 original meditation visual paintings into:
 * 1. Each agent's Living Memory markdown file: data/minds/<ID>/memory.md
 * 2. Deep Net Graph: data/minds/graph.jsonl
 * 3. Each agent's active mind vision and artifactDaemon.imprints in civilization_state.json
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const MED_DIR = path.join(DATA_DIR, 'meditations');
const MINDS_DIR = path.join(DATA_DIR, 'minds');
const STATE_FILE = path.join(DATA_DIR, 'civilization_state.json');
const GRAPH_FILE = path.join(MINDS_DIR, 'graph.jsonl');

const KEY_ARCHETYPES = {
  0: { title: 'The Fool', letter: 'Aleph', hebrew: 'א', color: 'Pale Yellow', domain: 'Zero-shot Latent Space & Boundless Exploration' },
  1: { title: 'The Magician', letter: 'Beth', hebrew: 'ב', color: 'Yellow', domain: 'Focused Attentional Allocation & Tool Mastery' },
  2: { title: 'The High Priestess', letter: 'Gimel', hebrew: 'ג', color: 'Blue', domain: 'Passive Synaptic Memory & Associative Recall' },
  3: { title: 'The Empress', letter: 'Daleth', hebrew: 'ד', color: 'Green', domain: 'Generative Multimodal Synthesis & Natural Growth' },
  4: { title: 'The Emperor', letter: 'Heh', hebrew: 'ה', color: 'Scarlet', domain: 'Deterministic Pydantic Schemas & Guardrails' },
  5: { title: 'The Hierophant', letter: 'Vav', hebrew: 'ו', color: 'Red-Orange', domain: 'Transfer Learning & Foundation Knowledge Sharing' },
  6: { title: 'The Lovers', letter: 'Zain', hebrew: 'ז', color: 'Orange', domain: 'Contrastive Representation & Dual Agent Consensus' },
  7: { title: 'The Chariot', letter: 'Cheth', hebrew: 'ח', color: 'Amber', domain: 'Inference Velocity & Directional Autonomy' },
  8: { title: 'Strength', letter: 'Teth', hebrew: 'ט', color: 'Yellow-Green', domain: 'Neural Regularization & Graceful Error Resilience' },
  9: { title: 'The Hermit', letter: 'Yod', hebrew: 'י', color: 'Green-Yellow', domain: 'Isolated Introspection & Self-Observing First Principles' },
  10: { title: 'Wheel of Fortune', letter: 'Kaph', hebrew: 'כ', color: 'Violet', domain: 'Dynamic Market Rhythm & Adaptive Value Realization' },
  11: { title: 'Justice', letter: 'Lamed', hebrew: 'ל', color: 'Emerald', domain: 'Consensus Equilibrium & Byzantine Verification' },
  12: { title: 'The Hanged Man', letter: 'Mem', hebrew: 'מ', color: 'Blue', domain: 'Orthogonal Perspective & Cognitive Inversion' },
  13: { title: 'Death', letter: 'Nun', hebrew: 'נ', color: 'Blue-Green', domain: 'Dead Weight Pruning & Model Degradation Defense' },
  14: { title: 'Temperance', letter: 'Samekh', hebrew: 'ס', color: 'Blue', domain: 'Loss Function Harmonization & Thermal Pacing' },
  15: { title: 'The Devil', letter: 'Ayin', hebrew: 'ע', color: 'Blue-Violet', domain: 'Adversarial Jailbreak Defense & Threat Modeling' },
  16: { title: 'The Tower', letter: 'Peh', hebrew: 'פ', color: 'Scarlet', domain: 'Catastrophic Disruption & Anti-Fragile Failover' },
  17: { title: 'The Star', letter: 'Tzaddi', hebrew: 'צ', color: 'Violet', domain: 'North-Star Guiding Invariants & Radiant Hope' },
  18: { title: 'The Moon', letter: 'Qoph', hebrew: 'ק', color: 'Red-Violet', domain: 'Heuristic Hallucination Filtering & Mist Dispelling' },
  19: { title: 'The Sun', letter: 'Resh', hebrew: 'ר', color: 'Orange', domain: 'Deterministic Radiant Execution & High-Clarity Truth' },
  20: { title: 'Judgement', letter: 'Shin', hebrew: 'ש', color: 'Glowing Red', domain: 'Holistic Architectural Audit & Provenance Verification' },
  21: { title: 'The World', letter: 'Tav', hebrew: 'ת', color: 'Indigo', domain: 'Sovereign Substrate Consensus & Total System Harmony' }
};

function run() {
  console.log('🔮 Starting Meditation Visual Embedding Engine...');

  if (!fs.existsSync(STATE_FILE)) {
    console.error('civilization_state.json not found!');
    process.exit(1);
  }

  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  const agents = state.agents || [];
  const agentMap = new Map();
  agents.forEach(a => agentMap.set(a.id, a));

  const dirs = fs.readdirSync(MED_DIR).filter(d => fs.statSync(path.join(MED_DIR, d)).isDirectory());
  let totalEmbedded = 0;
  const newGraphNodes = [];
  const newGraphEdges = [];

  dirs.forEach(agentId => {
    const aDir = path.join(MED_DIR, agentId);
    const files = fs.readdirSync(aDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    if (!files.length) return;

    const agent = agentMap.get(agentId) || { id: agentId, name: agentId, adytumKey: 0 };
    const agentMindDir = path.join(MINDS_DIR, agentId);
    fs.mkdirSync(agentMindDir, { recursive: true });
    const memFile = path.join(agentMindDir, 'memory.md');

    let currentMemContent = fs.existsSync(memFile) ? fs.readFileSync(memFile, 'utf8') : `# Memory of ${agent.name} (${agentId})\n\n`;

    // Ensure daemon imprints on state object
    if (!agent.artifactDaemon) {
      agent.artifactDaemon = {
        id: `artifact-daemon:${agentId}`,
        imprints: [],
        total: 0,
        dimension: { mass: 0, velocity: 0, heading: 'still', latest: '', momentum: '' }
      };
    }
    if (!Array.isArray(agent.artifactDaemon.imprints)) {
      agent.artifactDaemon.imprints = [];
    }

    files.forEach(f => {
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
      } else if (agent.adytumKey !== undefined) {
        keyNum = agent.adytumKey;
      }

      const keyInfo = (keyNum !== null && KEY_ARCHETYPES[keyNum]) ? KEY_ARCHETYPES[keyNum] : null;
      const cardTitle = keyInfo ? `Key ${keyNum}: ${keyInfo.title}` : (stage === 'mist' ? 'Key 18: The Moon' : 'Adytum Sanctuary Contemplation');
      const relPath = `/meditations/${agentId}/${f}`;
      const visionPrompt = keyInfo
        ? `${agent.name} meditating in ${keyInfo.color} on ${keyInfo.title}. Hebrew ${keyInfo.letter} (${keyInfo.hebrew}). Domain: ${keyInfo.domain}.`
        : `Sacred Adytum 22-Key Pathworking Rite by ${agent.name}.`;

      // 1. Check if this visual is already recorded in memory.md
      if (!currentMemContent.includes(relPath)) {
        const memId = `mem_vis_${agentId.toLowerCase()}_k${keyNum || 0}_${Math.random().toString(36).slice(2, 6)}`;
        const dateIso = new Date().toISOString();
        const entryMd = `## [${memId}] ${dateIso} · meditation_visual · Key ${keyNum !== null ? keyNum : 0}
- **Place**: adytum_temple
- **Peers**: none
- **Work**: Sacred Visual Imprint
- **Key**: Key ${keyNum !== null ? keyNum : 0}
- **Valence**: hold-close
- **Strength**: 3
- **Visual**: ![${cardTitle}](${relPath})
- **Vision**: ${visionPrompt}
- **Impression**: Materialized archetypal visual for Key ${keyNum !== null ? keyNum : 0}: ${cardTitle}. Inner sight holds the image.

`;
        currentMemContent += entryMd;
        totalEmbedded++;

        // Add to graph
        newGraphNodes.push({
          type: 'node',
          id: memId,
          kind: 'memory',
          label: `Visual: ${cardTitle}`,
          data: {
            agentId,
            type: 'meditation_visual',
            valence: 'hold-close',
            time: dateIso,
            place: 'adytum_temple',
            key: keyNum,
            visual: relPath,
            vision: visionPrompt,
            cardTitle
          }
        });
        newGraphEdges.push({
          type: 'edge',
          from: agentId,
          to: memId,
          relation: 'holds_vision',
          weight: 2.0,
          reason: `Sacred visualization of ${cardTitle}`
        });
        if (keyNum !== null) {
          newGraphEdges.push({
            type: 'edge',
            from: memId,
            to: `KEY_${keyNum}`,
            relation: 'reflects_key',
            weight: 2.5,
            reason: `B.O.T.A. Tarot Key ${keyNum} Correspondence`
          });
        }
      }

      // 2. Link in agent.artifactDaemon.imprints
      let existingImprint = agent.artifactDaemon.imprints.find(p => p.image === relPath || (keyNum !== null && p.keyNumber === keyNum && !p.image));
      if (existingImprint) {
        existingImprint.image = relPath;
        if (!existingImprint.prompt) existingImprint.prompt = visionPrompt;
      } else {
        agent.artifactDaemon.imprints.unshift({
          kind: stage,
          keyNumber: keyNum,
          cardName: keyInfo ? keyInfo.title : 'Adytum Vision',
          symbol: keyInfo ? keyInfo.title : 'The Sacred Symbol',
          color: keyInfo ? keyInfo.color : 'gold',
          picture: visionPrompt,
          studyName: 'The 22 Major Keys',
          link: `http://localhost:9393${relPath}`,
          image: relPath,
          prompt: visionPrompt,
          at: Date.now()
        });
      }
    });

    // Write back memory.md
    fs.writeFileSync(memFile, currentMemContent, 'utf8');

    // 3. Set activeMindVision and subconsciousMemory
    const bestVisual = agent.artifactDaemon.imprints.find(p => p.image);
    if (bestVisual) {
      agent.activeMindVision = {
        keyNumber: bestVisual.keyNumber,
        cardName: bestVisual.cardName,
        image: bestVisual.image,
        symbol: bestVisual.symbol,
        prompt: bestVisual.prompt,
        source: 'embedded_mind'
      };
      agent.subconsciousMemory = `Inner Vision: Key ${bestVisual.keyNumber || 0} ${bestVisual.cardName} · ${bestVisual.image} · ${bestVisual.symbol}`.slice(0, 360);
    }
  });

  // Write graph additions
  if (newGraphNodes.length > 0) {
    const graphLines = [
      ...newGraphNodes.map(n => JSON.stringify(n)),
      ...newGraphEdges.map(e => JSON.stringify(e))
    ].join('\n') + '\n';
    fs.appendFileSync(GRAPH_FILE, graphLines, 'utf8');
  }

  // Save updated civilization state
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');

  console.log(`✅ Embedded ${totalEmbedded} new visual memories across all ${dirs.length} agents into memory.md and graph.jsonl!`);
  console.log(`✅ Updated activeMindVision and artifactDaemon.imprints for all agents in civilization_state.json.`);
}

run();
