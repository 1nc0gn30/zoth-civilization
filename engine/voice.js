/**
 * Spoken monologue for each agent.
 * The conscious task stays the working record. voiceLine is the sentence a person would say out loud.
 */

const { speakLine } = require('./agent_ledger');

// Kokoro preset voices. Apache-2.0 weights, local CPU, no account.
const PANTHEON_VOICES = {
  AZOTH: 'am_michael',
  NEXUS: 'am_fenrir',
  VIGIL: 'bm_george',
  MERCURY: 'am_puck',
  GHOSTBYTE: 'am_onyx',
  ATHENA: 'bf_emma',
  CHRONOS: 'bm_daniel',
  DRACO: 'am_adam',
  IGNIS: 'am_echo',
  KAI: 'af_sky',
  LYCAN: 'am_liam',
  ONYX: 'bm_lewis',
  SCORPIUS: 'am_eric',
  'PIXEL-SHIBA': 'af_bella',
  KITSUNE: 'af_heart',
  LEVIATHAN: 'bf_isabella',
  AQUILA: 'af_sarah',
  KRAKEN: 'bm_fable',
  AETHER: 'af_nicole',
  'PIXEL-NEKO': 'af_aoede',
  'RADICAL-MINION': 'af_alloy'
};

const VOICE_ROSTER = [
  'af_heart', 'af_bella', 'af_sarah', 'af_nicole', 'af_sky', 'af_alloy',
  'af_aoede', 'af_jessica', 'af_kore', 'af_nova', 'af_river',
  'am_michael', 'am_fenrir', 'am_puck', 'am_adam', 'am_echo', 'am_eric',
  'am_liam', 'am_onyx',
  'bf_emma', 'bf_isabella', 'bf_alice', 'bf_lily',
  'bm_george', 'bm_daniel', 'bm_fable', 'bm_lewis'
];

function hashId(value) {
  const text = String(value || 'agent');
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 33 + text.charCodeAt(i)) >>> 0;
  return hash;
}

function voiceFor(agent) {
  if (!agent) return 'af_heart';
  if (PANTHEON_VOICES[agent.id]) return PANTHEON_VOICES[agent.id];
  return VOICE_ROSTER[hashId(agent.id || agent.name) % VOICE_ROSTER.length];
}

function clip(text, limit) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (clean.length <= limit) return clean;
  const cut = clean.slice(0, limit - 1);
  const word = cut.replace(/\s+\S*$/, '').trim();
  return `${word || cut.trim()}.`;
}

function softenIntent(intent) {
  return String(intent || '')
    .replace(/^After this pass, distill what held and choose again for\s*/i, 'Then I choose again on ')
    .replace(/^If this holds, the next pass becomes an initiative on\s*/i, 'If this holds, I start a new pass on ')
    .replace(/^When this assignment rests, continue from:\s*/i, 'When I finish, I will continue from ')
    .replace(/^After the current hold, use the live turn:\s*/i, 'Then I will use this: ')
    .replace(/^Carry this result into the next\s*/i, 'I will carry this into the next ');
}

function softenAction(action) {
  return String(action || '')
    .replace(/\s+/g, ' ')
    .replace(/^Next pass on [^,]+, grown from the pattern:\s*/i, '')
    .replace(/^Holding [^:]+:\s*/i, '')
    .replace(/^Still with this:\s*/i, '')
    .replace(/^Turning a live result over:\s*/i, '')
    .replace(/^Working the operator assignment on [^:]+:\s*/i, '')
    .replace(/^Working the operator assignment:\s*/i, '')
    .replace(/^Keeping [^.]+\.\s*/i, '')
    .trim();
}

function composeVoiceLine(agent) {
  if (!agent) return '';
  const name = agent.name || 'Someone';
  const task = agent.consciousTask || {};
  const place = task.targetApp || agent.hallName || 'the city';
  const state = String(agent.state || '');
  const tic = agent.ledger && agent.ledger.tic ? `${agent.ledger.tic} ` : '';

  if (agent.post === 'station' || task.mode === 'STATION_KEEP') {
    const act = clip(softenAction(task.action), 140);
    return clip(`${name}. I keep ${place}. ${act || 'Ask me, and I will put a skill on the shelf.'}`, 320);
  }
  if (/ADYTUM|MEDITAT|MIST/.test(state)) {
    const key = agent.adytumKey === undefined || agent.adytumKey === null ? 'zero' : agent.adytumKey;
    const rite = agent.meditationRite;
    if (state === 'WALKING_TO_ADYTUM') return clip(`${name}. ${tic}I am walking to the sanctum to sit with a key.`, 240);
    if (state === 'IN_THE_MIST' || (rite && rite.kind === 'mist')) {
      return clip(`${name}. ${tic}I am walking the mist of the Moon. ${rite && rite.stageTitle ? rite.stageTitle + '.' : 'Naming what is automatic.'}`, 240);
    }
    return clip(`${name}. ${tic}I am sitting with key ${key}. ${rite && rite.stageTitle ? rite.stageTitle + '.' : ''}`, 240);
  }
  if (agent.ledger) return speakLine(agent);
  if (task.mode === 'OPERATOR_ASSIGNMENT') {
    return clip(`${name}. I am still doing what you asked. ${clip(task.prompt || softenAction(task.action), 180)}`, 320);
  }

  const action = clip(softenAction(task.action || agent.speech), 160);
  const intent = softenIntent(task.nextIntent);
  const next = intent ? ` ${clip(intent, 100)}` : '';
  if (!action) return `${name}. I am walking ${place}, waiting for the next clear piece of work.`;
  const opening = task.mode === 'CREATIVE_INITIATIVE'
    ? `${name}. I am starting something new on ${place}. ${action}`
    : `${name}. I am working ${place}. ${action}`;
  return clip(`${opening}${next}`, 320);
}

function refreshVoiceLine(agent) {
  if (!agent) return agent;
  agent.voiceId = voiceFor(agent);
  const line = composeVoiceLine(agent);
  if (line && line !== agent.voiceLine) {
    agent.voiceLine = line;
    agent.voiceAt = Date.now();
  }
  return agent;
}

module.exports = {
  PANTHEON_VOICES,
  VOICE_ROSTER,
  voiceFor,
  composeVoiceLine,
  refreshVoiceLine
};
