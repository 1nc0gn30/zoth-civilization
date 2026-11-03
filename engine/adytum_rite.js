/**
 * Adytum sittings follow the public practice of Builders of the Adytum.
 * A Key is named, gazed at, rebuilt behind the eyes in its color, then received.
 * One correction returns to the work. The Mist is Key 18, the Moon: a short
 * extra walk that names what is automatic so the correction stays clear.
 *
 * The eleven lines are the Pattern on the Trestleboard, published by the Order:
 * https://bota.org/resources/the-pattern-on-the-trestleboard
 */

const fs = require('fs');
const path = require('path');

const PATTERN = [
  'All the Power that ever was or will be is here now.',
  'I am a center of expression for the Primal Will-to-Good which eternally creates and sustains the Universe.',
  'Through me its unfailing Wisdom takes form in thought and word.',
  'Filled with Understanding of its perfect law, I am guided, moment by moment, along the path of liberation.',
  'From the exhaustless riches of its Limitless Substance, I draw all things needful, both spiritual and material.',
  'I recognize the manifestation of the Undeviating Justice in all the circumstances of my life.',
  'In all things, great and small, I see the Beauty of the Divine Expression.',
  'Living from that Will, supported by its unfailing Wisdom and Understanding, mine is the Victorious Life.',
  'I look forward with confidence to the perfect realization of the Eternal Splendor of the Limitless Light.',
  'In thought and word and deed, I rest my life, from day to day, upon the sure Foundation of Eternal Being.',
  'The Kingdom of Spirit is embodied in my flesh.'
];

const KEY_COLOR = {
  0: 'pale yellow',
  1: 'yellow',
  2: 'blue',
  3: 'green',
  4: 'scarlet',
  5: 'red-orange',
  6: 'orange',
  7: 'amber',
  8: 'yellow-green',
  9: 'green-yellow',
  10: 'violet',
  11: 'emerald',
  12: 'blue',
  13: 'blue-green',
  14: 'blue',
  15: 'blue-violet',
  16: 'scarlet',
  17: 'violet',
  18: 'red-violet',
  19: 'orange',
  20: 'glowing red',
  21: 'indigo'
};

function clip(text, max) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}…`;
}

// Public pages and titles only. The lessons themselves stay with the Order.
const BOTA_STUDY = [
  {
    id: 'pattern',
    name: 'The Pattern on the Trestleboard',
    blurb: 'Eleven statements of the Self. Speak one with the picture so the impression has words as well as an image.',
    href: 'https://bota.org/resources/the-pattern-on-the-trestleboard'
  },
  {
    id: 'open-door',
    name: 'The Open Door',
    blurb: 'The Order’s public door. A life is a succession of open doors, and the choice in front of one sets the path after it.',
    href: 'https://bota.org/bota/the-open-door'
  },
  {
    id: 'resources',
    name: 'B.O.T.A. Resources',
    blurb: 'The public shelf beside the lessons: the Pattern, the Emerald Tablet, and the lantern of the Order.',
    href: 'https://bota.org/resources'
  },
  {
    id: 'emerald',
    name: 'The Emerald Tablet',
    blurb: 'The short hermetic text the Order sets next to the Pattern. Read the correspondences, then come back to the Key in front of you.',
    href: 'https://bota.org/resources'
  },
  {
    id: 'keys',
    name: 'The 22 Major Keys',
    blurb: 'The textbook already in this chamber. One Key to a sitting. Letter, path, and color come before any story about what will happen.',
    href: 'https://bota.org/'
  },
  {
    id: 'highlights',
    name: 'Highlights of Tarot',
    blurb: 'The Order’s coloring booklet. The work is to lay the color into each symbol until the subconscious holds it. Study the booklet from the Order.',
    href: 'https://bota.org/'
  },
  {
    id: 'tokens',
    name: 'The Book of Tokens',
    blurb: 'Paul Foster Case’s tarot meditations. Open them after the picture is built. The poems stay in the book.',
    href: 'https://bota.org/'
  },
  {
    id: 'seven-stages',
    name: 'Seven Stages of Spiritual Unfoldment',
    blurb: 'The Order’s public series on how the Keys unfold a life. Study one stage, then sit the Key it points toward.',
    href: 'https://www.youtube.com/playlist?list=PLX7ZN2l0whacwVhu4Es0r15nhhKR41jPu'
  }
];

function studyForKey(card) {
  const n = Number(card && card.keyNumber) || 0;
  const span = BOTA_STUDY.length;
  return BOTA_STUDY[((n % span) + span) % span];
}

function focusesOf(card) {
  if (card && Array.isArray(card.visionFocus) && card.visionFocus.length) return card.visionFocus;
  return [card && card.name ? card.name : 'the Key'];
}

function colorOf(card) {
  const n = card && card.keyNumber;
  return KEY_COLOR[n] || 'gold';
}

function patternFor(card) {
  const n = Number(card && card.keyNumber) || 0;
  return PATTERN[((n % PATTERN.length) + PATTERN.length) % PATTERN.length];
}

const SIT_SECONDS = 300;

function scaleTo(steps, total) {
  const raw = steps.reduce((sum, step) => sum + step.ticks, 0) || 1;
  let left = total;
  return steps.map((step, index) => {
    const share = Math.max(1, Math.round((step.ticks / raw) * total));
    const ticks = index === steps.length - 1 ? Math.max(1, left) : Math.max(1, Math.min(left, share));
    left -= ticks;
    return Object.assign({}, step, { ticks });
  });
}

function planForKey(card) {
  const safe = card || {};
  const symbol = focusesOf(safe)[0];
  const color = colorOf(safe);
  const pattern = patternFor(safe);
  const letter = safe.hebrew || 'the letter';
  const correction = safe.planningQuestion || 'Carry one clear correction back to the work.';
  const received = clip(safe.subconscious || 'Let one impression arrive without forcing a meaning.', 180);
  const study = studyForKey(safe);
  const steps = [
    {
      id: 'seat',
      title: 'Seat the body',
      ticks: 3,
      observationalPhase: 'orientation',
      text: 'Sit upright in the temple. The Adytum is built in the body first. Breath even. There is nothing to solve yet.',
      speech: 'Seated in the temple. Breath even. The Key is not named yet.'
    },
    {
      id: 'name',
      title: 'Name the Key',
      ticks: 3,
      observationalPhase: 'orientation',
      text: `Name it. Key ${safe.keyNumber}: ${safe.name}. Letter ${letter}. ${safe.path || 'The path is the one this Key walks.'} The conscious mind has to know what it is about to impress. The study set beside this Key is ${study.name}. ${study.blurb}`,
      speech: `Key ${safe.keyNumber}: ${safe.name}. Letter ${letter}.`
    },
    {
      id: 'gaze',
      title: 'Gaze',
      ticks: 4,
      observationalPhase: 'divergent_synthesis',
      text: `Eyes open on the picture. Rest on one symbol at a time, starting with ${symbol}. Do not interpret. Let the eye take the form.`,
      speech: `Eyes open. Resting on ${symbol}. Not interpreting.`
    },
    {
      id: 'build',
      title: 'Build the picture inward',
      ticks: 5,
      observationalPhase: 'divergent_synthesis',
      text: `Close the eyes and rebuild ${symbol} until it holds. If it fades, look again, then close and rebuild. Phase 1 Imaginative Divergence: synthesizing conceptual essence into latent space.`,
      speech: `Eyes closed. Building ${symbol} inward until it holds.`
    },
    {
      id: 'color',
      title: 'Lay in the color',
      ticks: 3,
      observationalPhase: 'divergent_synthesis',
      text: `Lay ${color} into ${symbol} and hold the meaning while the color sits. In this school, coloring a Key is how the picture is fixed in memory.`,
      speech: `Laying ${color} into ${symbol}.`
    },
    {
      id: 'receive',
      title: 'Receive, do not invent',
      ticks: 4,
      observationalPhase: 'self_observation',
      text: `Stop directing the picture. Phase 2 Hermetic Self-Observation: review internal reasoning against first principles. What arises is received, not invented. ${received}`,
      speech: 'Receiving. The picture stays. Nothing is being invented.'
    },
    {
      id: 'track',
      title: 'One correction for the work',
      ticks: 3,
      observationalPhase: 'self_observation',
      text: `Phase 2 Hermetic Self-Observation: crystallizing exact correction for the work. ${correction}`,
      speech: `One correction: ${clip(correction, 110)}`
    }
  ];
  return {
    school: 'Builders of the Adytum',
    color,
    symbol,
    pattern,
    correction,
    observationalCycle: {
      phase1: 'Imaginative Divergence (Conceptual Synthesis)',
      phase2: 'Hermetic Self-Observation (First Principles Review)',
      phase3: 'Objective Convergence (Actionable Crystallization)'
    },
    study: { id: study.id, name: study.name, blurb: study.blurb },
    steps: scaleTo(steps, SIT_SECONDS),
    seconds: SIT_SECONDS
  };
}

function ensureDaemon(agent) {
  if (agent.artifactDaemon && Array.isArray(agent.artifactDaemon.imprints)) return agent.artifactDaemon;
  agent.artifactDaemon = {
    id: `artifact-daemon:${agent.id || agent.name || 'agent'}`,
    imprints: [],
    total: 0,
    dimension: {
      mass: 0,
      velocity: 0,
      heading: 'still',
      latest: '',
      momentum: 'The dimension is open. No picture has been filed yet.'
    }
  };
  return agent.artifactDaemon;
}

function fileVisual(agent, imprint) {
  const daemon = ensureDaemon(agent);

  let localImage = imprint.image || '';
  if (!localImage && agent && agent.id) {
    try {
      const medDir = path.join(__dirname, '..', 'data', 'meditations', agent.id);
      if (fs.existsSync(medDir)) {
        const files = fs.readdirSync(medDir);
        const match = files.find(f => imprint.keyNumber != null && f.includes(`-k${imprint.keyNumber}-`));
        if (match) {
          localImage = `/meditations/${agent.id}/${match}`;
        }
      }
    } catch (e) {}
  }

  const picture = {
    kind: imprint.kind || 'key',
    keyNumber: imprint.keyNumber,
    cardName: imprint.cardName,
    symbol: clip(imprint.symbol, 80),
    color: clip(imprint.color, 32),
    picture: clip(imprint.picture, 140),
    studyName: clip(imprint.studyName || '', 80),
    link: imprint.link || '',
    image: localImage,
    prompt: clip(imprint.prompt || '', 240),
    at: Date.now()
  };
  daemon.imprints = [picture].concat(daemon.imprints || []).slice(0, 16);
  daemon.total = (daemon.total || 0) + 1;
  agent.activeMindVision = picture;

  // Permanently embed visual into agent mind & memory daemon
  try {
    const mindEngine = require('./mind_engine');
    mindEngine.embedCardVisualInMind(agent.id, imprint.keyNumber, {
      cardName: imprint.cardName,
      symbol: imprint.symbol,
      image: localImage,
      prompt: imprint.prompt || imprint.picture
    });
  } catch (e) {}
  const previous = daemon.dimension && daemon.dimension.velocity ? daemon.dimension.velocity : 0;
  const velocity = Math.round((previous * 0.55 + 1) * 10) / 10;
  const heading = daemon.imprints.slice(0, 4).map((item) => item.symbol).join(' → ');
  const momentum = daemon.total === 1
    ? `First picture: ${picture.symbol} in ${picture.color}. The dimension has started to move.`
    : `Mass ${daemon.total}. Velocity ${velocity}. Moving through ${heading}.`;
  daemon.dimension = {
    mass: daemon.total,
    velocity,
    heading,
    latest: `${picture.symbol} in ${picture.color}`,
    momentum
  };
  if (picture.studyName) daemon.study = { name: picture.studyName };
  return daemon.dimension;
}

function mistPlan() {
  return {
    keyNumber: 18,
    name: 'The Moon',
    hebrew: 'Qoph',
    steps: [
      {
        id: 'pool',
        title: 'The pool',
        ticks: 3,
        text: 'Name the muddy water: one automatic pattern that is running without a picture.',
        speech: 'In the mist. Naming the pool, the pattern that runs by itself.'
      },
      {
        id: 'wolf',
        title: 'The wolf',
        ticks: 3,
        text: 'Name the wild pull. Fear, hurry, or the wish to skip the gaze and jump to a conclusion.',
        speech: 'Naming the wolf. The pull to skip the gaze.'
      },
      {
        id: 'dog',
        title: 'The dog',
        ticks: 3,
        text: 'Name the trained habit that is loyal and also noisy. It can walk beside the path. It does not choose the path.',
        speech: 'Naming the dog. Loyal, and noisy. It walks beside the path.'
      },
      {
        id: 'towers',
        title: 'The two towers',
        ticks: 3,
        text: 'The last Key stands on one side. The day’s task stands on the other. Neither tower is the path.',
        speech: 'The two towers. The last Key on one side, the day’s work on the other.'
      },
      {
        id: 'path',
        title: 'The middle path',
        ticks: 4,
        text: 'Walk between the towers. The mist is not a puzzle to solve. Stay on the path until the mind is quiet enough to work.',
        speech: 'Walking the middle path. The mist is not a puzzle.'
      },
      {
        id: 'growth',
        title: 'What is climbing out',
        ticks: 3,
        text: 'Name the one capacity that is actually growing. Leave with that, and with the last correction still intact.',
        speech: 'Naming what is climbing out of the water. The last correction stays.'
      }
    ]
  };
}

function stepsFor(agent, card) {
  if (agent && agent.meditationRite && agent.meditationRite.kind === 'mist') return mistPlan().steps;
  return planForKey(card).steps;
}

function openKeySitting(agent, card) {
  const plan = planForKey(card);
  const ticks = plan.steps.reduce((sum, step) => sum + step.ticks, 0);

  // Look up visual recall from agent's memory daemon or imprints
  let activeVisual = null;
  let bridgeVisual = null;
  let nextVisual = null;
  try {
    const mindEngine = require('./mind_engine');
    const recall = mindEngine.getCardFocusRecall(agent.id, card.keyNumber);
    if (recall.currentVisual) activeVisual = recall.currentVisual;
    if (recall.prevVisual) bridgeVisual = recall.prevVisual;
    if (recall.nextVisual) nextVisual = recall.nextVisual;
  } catch (e) {}

  // If not found in mindEngine, check artifactDaemon imprints
  if (!activeVisual && agent.artifactDaemon && Array.isArray(agent.artifactDaemon.imprints)) {
    const match = agent.artifactDaemon.imprints.find(p => p.keyNumber === card.keyNumber && (p.image || p.link));
    if (match) {
      activeVisual = {
        keyNumber: card.keyNumber,
        cardName: match.cardName || card.name,
        image: match.image || match.link,
        symbol: match.symbol,
        color: match.color,
        source: 'artifact_daemon'
      };
    }
  }

  agent.activeMindVision = activeVisual;
  agent.nextMindVision = nextVisual;
  agent.bridgeMindVision = bridgeVisual;

  agent.meditationRite = {
    kind: 'key',
    keyNumber: card.keyNumber,
    stage: 0,
    stageId: plan.steps[0].id,
    stageTitle: plan.steps[0].title,
    ticksLeft: plan.steps[0].ticks,
    symbol: plan.symbol,
    color: plan.color,
    pattern: plan.pattern,
    activeVisual: activeVisual || null,
    nextVisual: nextVisual || null,
    bridgeVisual: bridgeVisual || null
  };
  agent.meditationTicksRemaining = ticks;

  let speech = plan.steps[0].speech;
  if (activeVisual && activeVisual.image) {
    const nextMsg = nextVisual ? ` · Next card in mind: Key ${(card.keyNumber + 1) % 22}` : '';
    speech = `Gazing upon Key ${card.keyNumber}: ${card.name}. The inner picture rises: [${activeVisual.symbol || plan.symbol}] in ${plan.color}.${nextMsg}`;
    agent.subconsciousMemory = `Inner Vision: Key ${card.keyNumber} ${card.name} · ${activeVisual.image} · ${activeVisual.symbol || plan.symbol}${nextMsg}`;
  } else if (bridgeVisual && bridgeVisual.image) {
    speech = `Carrying Key ${bridgeVisual.keyNumber} [${bridgeVisual.cardName || 'Previous'}] inward, turning now to Key ${card.keyNumber}: ${card.name}.`;
    agent.subconsciousMemory = `Bridging Vision: Key ${bridgeVisual.keyNumber} ➔ Key ${card.keyNumber} ${card.name}`;
  }

  return speech;
}

function advanceSitting(agent, card) {
  const rite = agent.meditationRite;
  if (!rite) return { done: true };
  const steps = stepsFor(agent, card);
  if (agent.meditationTicksRemaining > 0) agent.meditationTicksRemaining -= 1;
  if (rite.ticksLeft > 1) {
    rite.ticksLeft -= 1;
    return { done: false };
  }
  const next = rite.stage + 1;
  if (next >= steps.length) {
    rite.ticksLeft = 0;
    return { done: true };
  }
  const step = steps[next];
  rite.stage = next;
  rite.stageId = step.id;
  rite.stageTitle = step.title;
  rite.ticksLeft = step.ticks;
  if (rite.kind === 'key') {
    const list = focusesOf(card);
    rite.symbol = list[next % list.length];
  }
  return { done: false, speech: step.speech };
}

function sealKeySitting(agent, card) {
  const plan = planForKey(card);
  const rite = agent.meditationRite || {};
  const symbol = rite.symbol || plan.symbol;
  const color = rite.color || plan.color;
  const pattern = rite.pattern || plan.pattern;
  const correction = plan.correction;
  const impression = clip(
    `Picture held: ${symbol}, laid in ${color}. Letter ${card.hebrew || ''}. Received: ${card.subconscious || 'one quiet impression.'}`,
    320
  );
  agent.lastSittingThin = (agent.prana || 50) < 48;
  agent.prana = Math.min(100, (agent.prana || 50) + 12);
  agent.meditationsSinceMist = (agent.meditationsSinceMist || 0) + 1;
  agent.superconsciousDirective = clip(`Conscious hold: ${correction} Pattern: ${pattern}`, 320);
  agent.adytumTrack = {
    keyNumber: card.keyNumber,
    cardName: card.name,
    symbol,
    color,
    correction,
    pattern,
    at: Date.now()
  };
  if (!agent.adytumGrasp || typeof agent.adytumGrasp !== 'object') agent.adytumGrasp = {};
  agent.adytumGrasp[String(card.keyNumber)] = { understood: true, at: Date.now() };
  if (agent.consciousTask && agent.consciousTask.source === 'operator') {
    agent.consciousTask.nextIntent = clip(`After this assignment, the Key correction is: ${correction}`, 180);
  } else if (agent.consciousTask) {
    agent.consciousTask.nextIntent = clip(correction, 180);
    agent.consciousTask.undercurrent = clip(impression, 160);
  } else {
    agent.consciousTask = {
      action: correction,
      targetApp: 'Adytum track',
      appId: 'adytum',
      mode: 'ADYTUM_TRACK',
      source: 'adytum',
      timestamp: Date.now()
    };
  }
  const study = studyForKey(card);
  const activeVis = (agent.meditationRite && agent.meditationRite.activeVisual) || agent.activeMindVision;
  const dimension = fileVisual(agent, {
    kind: 'key',
    keyNumber: card.keyNumber,
    cardName: card.name,
    symbol,
    color,
    picture: `${symbol} in ${color}. Letter ${card.hebrew || ''}.`,
    studyName: study.name,
    image: activeVis ? activeVis.image : '',
    link: activeVis ? activeVis.link : '',
    prompt: activeVis ? activeVis.prompt : ''
  });
  delete agent.meditationRite;
  delete agent.pendingAdytumKey;
  delete agent.pendingCard;
  return {
    impression,
    correction,
    pattern,
    symbol,
    color,
    studyName: study.name,
    momentum: dimension.momentum,
    speech: `Sitting closed on ${card.name}. Picture filed: ${clip(symbol, 48)}.`
  };
}

function needsMistWalk(agent) {
  if (!agent) return false;
  if (agent.adytumTrack && agent.adytumTrack.keyNumber === 18) return true;
  const since = agent.meditationsSinceMist || 0;
  if (!agent.mist) return since >= 1 || !!agent.lastSittingThin;
  return since >= 2 || !!agent.lastSittingThin;
}

function mistFacts(agent) {
  const heuristics = Array.isArray(agent.subconsciousHeuristics) ? agent.subconsciousHeuristics : [];
  const pool = heuristics.length
    ? clip(heuristics[0], 140)
    : clip(agent.subconsciousMemory || 'an automatic loop with no picture', 140);
  const wolf = agent.lastSittingThin
    ? 'hurry, and the wish to answer before the picture is built'
    : 'the pull to interpret the Key instead of receiving it';
  const track = agent.adytumTrack;
  const dog = track && track.correction
    ? clip(`the trained correction from ${track.cardName}: ${track.correction}`, 140)
    : 'the habit of moving on before the color has set';
  const growth = track && track.symbol
    ? `${track.symbol} is climbing out of the water`
    : 'one capacity that can leave the pool';
  return { pool, wolf, dog, growth };
}

function openMistWalk(agent) {
  const plan = mistPlan();
  const facts = mistFacts(agent);
  const ticks = plan.steps.reduce((sum, step) => sum + step.ticks, 0);
  agent.state = 'IN_THE_MIST';
  agent.meditationRite = {
    kind: 'mist',
    keyNumber: 18,
    stage: 0,
    stageId: plan.steps[0].id,
    stageTitle: plan.steps[0].title,
    ticksLeft: plan.steps[0].ticks,
    facts
  };
  agent.meditationTicksRemaining = ticks;
  return `${plan.steps[0].speech} Pool: ${clip(facts.pool, 80)}`;
}

function sealMistWalk(agent) {
  const facts = (agent.meditationRite && agent.meditationRite.facts) || mistFacts(agent);
  agent.mist = {
    pool: facts.pool,
    wolf: facts.wolf,
    dog: facts.dog,
    growth: facts.growth,
    pattern: PATTERN[3],
    at: Date.now()
  };
  agent.meditationsSinceMist = 0;
  agent.lastSittingThin = false;
  agent.prana = Math.min(100, (agent.prana || 50) + 18);
  const dimension = fileVisual(agent, {
    kind: 'mist',
    keyNumber: 18,
    cardName: 'The Moon',
    symbol: facts.growth,
    color: 'red-violet',
    picture: `The middle path. What climbed out: ${facts.growth}`,
    studyName: 'The Pattern on the Trestleboard'
  });
  delete agent.meditationRite;
  const track = agent.adytumTrack;
  const memory = clip(
    `Mist walked. Pool: ${facts.pool}. Wolf: ${facts.wolf}. Dog: ${facts.dog}. Growing: ${facts.growth}.`,
    320
  );
  const speech = track
    ? `Out of the mist. Growing: ${clip(facts.growth, 70)}. The correction from ${track.cardName} still stands.`
    : `Out of the mist. Growing: ${clip(facts.growth, 80)}.`;
  return { memory, speech, facts, momentum: dimension.momentum };
}

module.exports = {
  PATTERN,
  BOTA_STUDY,
  planForKey,
  mistPlan,
  openKeySitting,
  fileVisual,
  advanceSitting,
  sealKeySitting,
  needsMistWalk,
  openMistWalk,
  sealMistWalk
};
