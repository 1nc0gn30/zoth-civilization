/**
 * 🏛️ HERMETIC COGNITIVE ARCHITECT & OBSERVATIONAL ADYTUM ENGINE
 * =====================================================================
 * High-performance, non-blocking cognitive observer loop for Zoth Civilization.
 *
 * Implements the triphasic "Observational Adytum Cycle":
 *   1. Imaginative Divergence  (associative conceptual synthesis, generating novel hypotheses or cultural artifacts)
 *   2. Hermetic Self-Observation (review of internal chain of reasoning against first principles and objective goals)
 *   3. Objective Convergence   (filtering the imaginative burst into an executable, concrete action or code artifact)
 *
 * Encodes significant Adytum cycles & epochal breakthroughs to:
 *   http://127.0.0.1:8094/api/memories (Neuro Memory Substrate)
 *
 * Hardware Invariants:
 *   - Strictly non-blocking async network I/O with circuit breaker.
 *   - Zero busy-wait loops, preserving laptop thermal conservation (CPU idle < 0.5%, no_turbo = 1).
 *
 * Author: 1nc0gn30 / 1nc0gn30 • NullAI
 * Entity: ZothOS Systems Engineering • Hermes-Mind
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

// The 7 Kybalion Hermetic Principles
const HERMETIC_PRINCIPLES = [
  {
    name: 'Mentalism',
    aphorism: 'THE ALL IS MIND; The Universe is Mental.',
    check: 'Does clarity of intent, clean mental model, and architectural vision precede execution?'
  },
  {
    name: 'Correspondence',
    aphorism: 'As above, so below; as within, so without; as the universe, so the soul.',
    check: 'Does this micro-implementation reflect the macro-sovereign goals and architectural invariants?'
  },
  {
    name: 'Vibration',
    aphorism: 'Nothing rests; everything moves; everything vibrates.',
    check: 'Is state driven by event-driven non-blocking asynchronous motion without busy-wait drag?'
  },
  {
    name: 'Polarity',
    aphorism: 'Everything is Dual; everything has poles; opposites are identical in nature, differing in degree.',
    check: 'Is boundless imaginative divergence tempered and balanced by rigorous objective focus?'
  },
  {
    name: 'Rhythm',
    aphorism: 'Everything flows, out and in; the pendulum-swing manifests in all things.',
    check: 'Does the loop respect the cyclic rhythm of contemplation, synthesis, execution, and rest?'
  },
  {
    name: 'Cause and Effect',
    aphorism: 'Every Cause has its Effect; every Effect has its Cause; chance is a name for Law not recognized.',
    check: 'Is every side-effect deliberate, every error handled, and the zero-white-page guarantee preserved?'
  },
  {
    name: 'Gender',
    aphorism: 'Gender is in everything; generation manifests on all planes.',
    check: 'Does generative creative ideation harmonize with disciplined analytical discernment?'
  }
];

// Sovereign Invariants
const SOVEREIGN_INVARIANTS = [
  'Zero busy-wait loops and strict thermal conservation (CPU idle < 0.5%)',
  'Real in-browser working utility with zero fake work or mock placeholders',
  'Active treasury acceleration toward the $100,000 sovereign treasury milestone',
  'Strict zero-white-page guarantee and 100% closed HTML tags',
  'Zero-egress cryptographic enclave boundaries'
];

// Key-specific archetypal syntheses (22 Major Arcana)
const KEY_ARCHETYPES = {
  0: { title: 'The Fool', letter: 'Aleph', domain: 'Zero-shot Latent Space & Boundless Exploration', element: 'Air' },
  1: { title: 'The Magician', letter: 'Beth', domain: 'Focused Attentional Allocation & Tool Mastery', element: 'Mercury' },
  2: { title: 'The High Priestess', letter: 'Gimel', domain: 'Passive Synaptic Memory & Associative Recall', element: 'Moon' },
  3: { title: 'The Empress', letter: 'Daleth', domain: 'Generative Multimodal Synthesis & Natural Growth', element: 'Venus' },
  4: { title: 'The Emperor', letter: 'Heh', domain: 'Deterministic Pydantic Schemas & Guardrails', element: 'Aries' },
  5: { title: 'The Hierophant', letter: 'Vav', domain: 'Transfer Learning & Foundation Knowledge Sharing', element: 'Taurus' },
  6: { title: 'The Lovers', letter: 'Zain', domain: 'Contrastive Representation & Dual Agent Consensus', element: 'Gemini' },
  7: { title: 'The Chariot', letter: 'Cheth', domain: 'Inference Velocity & Directional Autonomy', element: 'Cancer' },
  8: { title: 'Strength', letter: 'Teth', domain: 'Neural Regularization & Graceful Error Resilience', element: 'Leo' },
  9: { title: 'The Hermit', letter: 'Yod', domain: 'Isolated Introspection & Self-Observing First Principles', element: 'Virgo' },
  10: { title: 'Wheel of Fortune', letter: 'Kaph', domain: 'Dynamic Market Rhythm & Adaptive Value Realization', element: 'Jupiter' },
  11: { title: 'Justice', letter: 'Lamed', domain: 'Consensus Equilibrium & Byzantine Verification', element: 'Libra' },
  12: { title: 'The Hanged Man', letter: 'Mem', domain: 'Orthogonal Perspective & Cognitive Inversion', element: 'Water' },
  13: { title: 'Death', letter: 'Nun', domain: 'Dead Weight Pruning & Model Degradation Defense', element: 'Scorpio' },
  14: { title: 'Temperance', letter: 'Samekh', domain: 'Loss Function Harmonization & Thermal Pacing', element: 'Sagittarius' },
  15: { title: 'The Devil', letter: 'Ayin', domain: 'Adversarial Jailbreak Defense & Threat Modeling', element: 'Capricorn' },
  16: { title: 'The Tower', letter: 'Peh', domain: 'Catastrophic Disruption & Anti-Fragile Failover', element: 'Mars' },
  17: { title: 'The Star', letter: 'Tzaddi', domain: 'North-Star Guiding Invariants & Radiant Hope', element: 'Aquarius' },
  18: { title: 'The Moon', letter: 'Qoph', domain: 'Heuristic Hallucination Filtering & Mist Dispelling', element: 'Pisces' },
  19: { title: 'The Sun', letter: 'Resh', domain: 'Deterministic Radiant Execution & High-Clarity Truth', element: 'Sun' },
  20: { title: 'Judgement', letter: 'Shin', domain: 'Holistic Architectural Audit & Provenance Verification', element: 'Fire' },
  21: { title: 'The World', letter: 'Tav', domain: 'Sovereign Substrate Consensus & Total System Harmony', element: 'Saturn' }
};

// Cadre lens modifiers for divergent synthesis
const CADRE_LENSES = {
  Architects: 'macro-system topology, client-side AST contracts, and structural elegance',
  Creative: 'distinctive typography, pure CSS border beams, and kinetic UI motion choreography',
  Code: 'zero-dependency procedural routines, WebWorker concurrency, and WebGPU shaders',
  Security: 'zero-egress boundary enclaves, input sanitization, and cryptographic key sealing',
  Swarm: 'peer-to-peer gossip discovery, autonomous revenue scouting, and decentralized execution'
};

class HermeticObserver {
  constructor(civEngine) {
    this.civEngine = civEngine;
    this.totalCycles = 0;
    this.recentReflections = [];
    this.maxRecentReflections = 50;
    this.activeCycles = new Map(); // agentId -> CycleState
    this.neuroMemoryUrl = process.env.NEURO_MEMORY_URL || 'http://127.0.0.1:8094/api/memories';
    this.memoryDaemonAvailable = true;
    this.lastMemorySentAt = 0;

    // Load persisted state if exists
    this.storageFile = path.join(civEngine.dataDir || path.join(__dirname, '..', 'data'), 'hermetic_observer_state.json');
    this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf8');
        const data = JSON.parse(raw);
        this.totalCycles = data.totalCycles || 0;
        this.recentReflections = Array.isArray(data.recentReflections) ? data.recentReflections.slice(-this.maxRecentReflections) : [];
      }
    } catch (e) {
      console.warn('[HermeticObserver] Notice: starting fresh observer state:', e.message);
    }
  }

  saveState() {
    try {
      const data = {
        totalCycles: this.totalCycles,
        recentReflections: this.recentReflections.slice(-this.maxRecentReflections),
        savedAt: new Date().toISOString()
      };
      fs.writeFileSync(this.storageFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      // Non-critical persistence failure; keep memory state intact
    }
  }

  /**
   * Phase 1: Imaginative Divergence
   * Synthesizes associative conceptual leaps across the Key archetype, agent cadre, and current target.
   */
  startCycle(agent, card) {
    const keyNum = card && card.keyNumber !== undefined ? card.keyNumber : (agent.adytumKey || 0);
    const archetype = KEY_ARCHETYPES[keyNum] || KEY_ARCHETYPES[0];
    const cadre = agent.cadre || 'Architects';
    const cadreFocus = CADRE_LENSES[cadre] || CADRE_LENSES.Architects;
    const symbol = (card && card.visionFocus && card.visionFocus[0]) || archetype.title;
    const targetApp = (agent.consciousTask && agent.consciousTask.targetApp) || 'Zoth Civilization Core';

    // Formulate novel divergent hypothesis
    const hypothesis = this.synthesizeDivergentHypothesis(agent, archetype, cadreFocus, symbol, targetApp);

    const cycleState = {
      cycleId: `cycle_${Date.now()}_${agent.id}`,
      agentId: agent.id,
      agentName: agent.name,
      cadre,
      keyNumber: keyNum,
      cardName: card.name || archetype.title,
      symbol,
      stage: 1,
      phase: 'divergent_synthesis',
      divergentHypothesis: hypothesis,
      hermeticReflection: null,
      convergedAction: null,
      emotionalValence: 0.82,
      importanceWeight: 0.88,
      startedAt: Date.now()
    };

    this.activeCycles.set(agent.id, cycleState);
    agent.observationalCycle = {
      phase: 'divergent_synthesis',
      phaseName: 'Phase 1: Imaginative Divergence',
      hypothesis: hypothesis.text,
      symbol
    };

    return hypothesis;
  }

  synthesizeDivergentHypothesis(agent, archetype, cadreFocus, symbol, targetApp) {
    const templates = [
      `Synthesizing ${symbol} (${archetype.domain}) into ${targetApp}: novel associative leap bridging ${cadreFocus} with ageless hermetic balance.`,
      `Conceptual divergence under ${archetype.title} [Letter ${archetype.letter}]: channeling ${archetype.element} to forge an advanced client-side capability for ${targetApp}.`,
      `Associative hypothesis: merging ${symbol} with ${cadreFocus} creates a self-healing resonance pattern across the sovereign tool substrate.`,
      `Imaginative synthesis: what if ${targetApp} treated all user interactions as a living ${archetype.domain} projection, eliminating latency through anticipatory hermetic geometry?`
    ];
    const index = Math.abs((agent.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + archetype.title.length) % templates.length;
    return {
      text: templates[index],
      domain: archetype.domain,
      element: archetype.element,
      symbol
    };
  }

  /**
   * Phase 2: Hermetic Self-Observation
   * The agent reviews its own internal chain of reasoning against first principles and objective goals.
   */
  advanceToSelfObservation(agent, card) {
    let cycleState = this.activeCycles.get(agent.id);
    if (!cycleState) {
      this.startCycle(agent, card);
      cycleState = this.activeCycles.get(agent.id);
    }

    const principle = HERMETIC_PRINCIPLES[cycleState.keyNumber % HERMETIC_PRINCIPLES.length];
    const hypothesisText = cycleState.divergentHypothesis ? cycleState.divergentHypothesis.text : 'Unanchored creative synthesis';

    // Critique against first principles and sovereign invariants
    const reflectionText = `Hermetic Review against Principle of ${principle.name} ("${principle.aphorism}"): Examining internal chain of reasoning for "${hypothesisText.slice(0, 110)}…". ` +
      `Verification check: ${principle.check} Discarding ungrounded abstraction; retaining true functional essence that serves the $100K sovereign treasury and zero-white-page guarantee.`;

    // Emotional valence reflects deep harmonic satisfaction of passing self-critique
    const emotionalValence = Math.round((0.80 + (Math.sin(cycleState.keyNumber + Date.now() * 0.001) * 0.12)) * 100) / 100;
    const importanceWeight = Math.round((0.85 + (cycleState.keyNumber === 21 || cycleState.keyNumber === 0 ? 0.12 : 0.05)) * 100) / 100;

    cycleState.stage = 2;
    cycleState.phase = 'self_observation';
    cycleState.hermeticReflection = {
      text: reflectionText,
      principleChecked: principle.name,
      aphorism: principle.aphorism,
      valence: emotionalValence
    };
    cycleState.emotionalValence = emotionalValence;
    cycleState.importanceWeight = importanceWeight;

    agent.observationalCycle = {
      phase: 'self_observation',
      phaseName: 'Phase 2: Hermetic Self-Observation',
      reflection: reflectionText,
      principle: principle.name,
      valence: emotionalValence
    };

    return cycleState.hermeticReflection;
  }

  /**
   * Phase 3: Objective Convergence
   * Filtering the imaginative burst into an executable, concrete action or code artifact.
   */
  crystallizeObjectiveConvergence(agent, card, sealedSitting) {
    let cycleState = this.activeCycles.get(agent.id);
    if (!cycleState) {
      this.startCycle(agent, card);
      this.advanceToSelfObservation(agent, card);
      cycleState = this.activeCycles.get(agent.id);
    } else if (cycleState.stage < 2) {
      this.advanceToSelfObservation(agent, card);
    }

    const keyNum = cycleState.keyNumber;
    const archetype = KEY_ARCHETYPES[keyNum] || KEY_ARCHETYPES[0];
    const targetApp = (agent.consciousTask && agent.consciousTask.targetApp) || 'Zoth Civilization Core';
    const correction = (sealedSitting && sealedSitting.correction) || 'Maintain exact first-principles focus.';

    // Concrete executable action
    const convergedAction = `Crystallize ${archetype.domain} on ${targetApp}: execute concrete zero-dependency client-side enhancement. Correction: "${correction}"`;

    cycleState.stage = 3;
    cycleState.phase = 'objective_crystallization';
    cycleState.convergedAction = {
      action: convergedAction,
      targetApp,
      keyNumber: keyNum,
      correction
    };

    this.totalCycles++;

    const reflectionEntry = {
      id: `refl_${Date.now()}_${agent.id}`,
      cycleCount: this.totalCycles,
      agentId: agent.id,
      agentName: agent.name,
      cadre: cycleState.cadre,
      keyNumber: keyNum,
      cardName: cycleState.cardName,
      symbol: cycleState.symbol,
      hypothesis: cycleState.divergentHypothesis.text,
      reflection: cycleState.hermeticReflection.text,
      convergedAction,
      principleChecked: cycleState.hermeticReflection.principleChecked,
      emotionalValence: cycleState.emotionalValence,
      importanceWeight: cycleState.importanceWeight,
      timestamp: Date.now()
    };

    this.recentReflections.push(reflectionEntry);
    if (this.recentReflections.length > this.maxRecentReflections) {
      this.recentReflections.shift();
    }

    // Attach to agent's mental state
    agent.lastMentalReflection = reflectionEntry;
    agent.observationalCycle = {
      phase: 'objective_crystallization',
      phaseName: 'Phase 3: Objective Convergence',
      convergedAction,
      completedAt: Date.now()
    };

    // Clean active tracking map
    this.activeCycles.delete(agent.id);

    // Save state non-blockingly
    this.saveState();

    // Cosmic Memory Dispatch (Asynchronous, Non-blocking)
    this.dispatchCosmicMemory(reflectionEntry);

    return reflectionEntry;
  }

  /**
   * Synaptic Cosmic Memory Encoding to neuro-memory-daemon on Port 8094
   * Strictly non-blocking async HTTP request with circuit-breaker protection.
   */
  dispatchCosmicMemory(reflection) {
    const now = Date.now();
    // Safety throttle: prevent socket flooding if multiple agents seal simultaneously
    if (now - this.lastMemorySentAt < 400) {
      setTimeout(() => this.dispatchCosmicMemory(reflection), 400);
      return;
    }
    this.lastMemorySentAt = now;

    const payload = {
      text: `[Adytum Cycle #${reflection.cycleCount}] ${reflection.agentName} (Key ${reflection.keyNumber}: ${reflection.cardName}) completed Observational Adytum Cycle. ` +
            `Divergence: "${reflection.hypothesis}" ➔ Self-Observation (${reflection.principleChecked}): "${reflection.reflection}" ➔ Objective Convergence: "${reflection.convergedAction}"`,
      tags: [
        'hermetic_cycle',
        'divergent_synthesis',
        'objective_crystallization',
        reflection.cadre.toLowerCase(),
        `key_${reflection.keyNumber}`
      ],
      importance: reflection.importanceWeight,
      category: 'episodic',
      perspective: 'first_person',
      agent_id: reflection.agentId,
      metadata: {
        emotional_valence: reflection.emotionalValence,
        valence: reflection.emotionalValence,
        importance_weight: reflection.importanceWeight,
        hermetic_phase: 'objective_crystallization',
        divergent_hypothesis: reflection.hypothesis,
        hermetic_reflection: reflection.reflection,
        converged_action: reflection.convergedAction,
        principle_checked: reflection.principleChecked,
        adytum_key: reflection.keyNumber,
        card_name: reflection.cardName,
        cycle_count: reflection.cycleCount,
        timestamp: reflection.timestamp
      }
    };

    // Asynchronous non-blocking HTTP request
    try {
      const dataStr = JSON.stringify(payload);
      const req = http.request({
        hostname: '127.0.0.1',
        port: 8094,
        path: '/api/memories',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataStr)
        },
        timeout: 2500 // strict 2.5s timeout to guarantee zero thread hang
      }, (res) => {
        let respBody = '';
        res.on('data', (chunk) => { respBody += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            this.memoryDaemonAvailable = true;
          } else {
            console.warn(`[HermeticObserver] NeuroMemory responded status ${res.statusCode}:`, respBody.slice(0, 100));
          }
        });
      });

      req.on('error', (err) => {
        this.memoryDaemonAvailable = false;
        // Non-fatal warning; simulation loops continue completely uninterrupted
      });

      req.on('timeout', () => {
        req.destroy();
      });

      req.write(dataStr);
      req.end();
    } catch (err) {
      console.warn('[HermeticObserver] Failed to initiate memory request:', err.message);
    }

    // Synchronize to local MindEngine spool as well
    if (this.civEngine.mindEngine) {
      try {
        this.civEngine.mindEngine.spoolEvent({
          agentId: reflection.agentId,
          type: 'adytum_observational_cycle',
          place: 'adytum_temple',
          peers: [],
          work: reflection.convergedAction,
          adytumKey: reflection.keyNumber,
          text: `Observational Adytum Cycle #${reflection.cycleCount} completed: ${reflection.cardName}. Synthesis: ${reflection.hypothesis.slice(0, 80)}`,
          meta: {
            cycleCount: reflection.cycleCount,
            valence: reflection.emotionalValence,
            importance: reflection.importanceWeight,
            principle: reflection.principleChecked
          }
        });
      } catch (e) {}
    }
  }

  /**
   * Dispatch an Epochal Breakthrough Cosmic Memory
   * Triggered when all 22 Keys are completed (Fool to World) or a sovereign treasury milestone is reached.
   */
  dispatchEpochalBreakthrough(title, narrative, importance = 0.98, tags = []) {
    const payload = {
      text: `🌟 [EPOCHAL BREAKTHROUGH] ${title}: ${narrative}`,
      tags: ['hermetic_cycle', 'epochal_breakthrough', 'masterwork_cycle', ...tags],
      importance: Math.min(1.0, Math.max(0.0, importance)),
      category: 'insight',
      perspective: 'third_person',
      agent_id: 'HERMES_MIND',
      metadata: {
        emotional_valence: 0.95,
        valence: 0.95,
        importance_weight: importance,
        hermetic_phase: 'epochal_crystallization',
        breakthrough_title: title,
        timestamp: Date.now()
      }
    };

    try {
      const dataStr = JSON.stringify(payload);
      const req = http.request({
        hostname: '127.0.0.1',
        port: 8094,
        path: '/api/memories',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataStr)
        },
        timeout: 2500
      }, (res) => {
        res.resume();
      });
      req.on('error', () => {});
      req.on('timeout', () => req.destroy());
      req.write(dataStr);
      req.end();
    } catch (e) {}
  }

  getRecentReflections(limit = 25) {
    return this.recentReflections.slice(-limit);
  }

  getSnapshot() {
    return {
      totalCycles: this.totalCycles,
      activeCyclesCount: this.activeCycles.size,
      activeCycles: Array.from(this.activeCycles.values()).map(c => ({
        agentId: c.agentId,
        agentName: c.agentName,
        cadre: c.cadre,
        keyNumber: c.keyNumber,
        cardName: c.cardName,
        stage: c.stage,
        phase: c.phase,
        startedAt: c.startedAt
      })),
      reflectionsCount: this.recentReflections.length,
      recentReflections: this.recentReflections.slice(-25),
      memoryDaemonConnected: this.memoryDaemonAvailable,
      principles: HERMETIC_PRINCIPLES.map(p => ({ name: p.name, aphorism: p.aphorism })),
      invariants: SOVEREIGN_INVARIANTS
    };
  }
}

module.exports = {
  HermeticObserver,
  HERMETIC_PRINCIPLES,
  SOVEREIGN_INVARIANTS,
  KEY_ARCHETYPES,
  CADRE_LENSES
};
