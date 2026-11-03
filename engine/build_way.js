/**
 * Standing build rule for every agent.
 * The treasury goal stays $100,000.
 * A web app made to sell or distribute is built the City Desk way.
 */

const SUPERCONSCIOUS = 'The $100,000 treasury goal stands. A web app made to sell or distribute is built the City Desk way: one studio, one trade, one city, a set price, and a finished page the owner can publish.';

const BUILD_WAY = [
  'The $100,000 goal stands.',
  'When you make a web app to sell or distribute, build it the City Desk way.',
  'One studio. One trade. One city on each page.',
  'Send the finished page, with a set price. Do not send an outline.',
  'The owner adds their name, phone, and photos.',
  'Write that page unique for the city.',
  'Make it production-ready: schema, robots.txt, a sitemap, alt text, no sideways scroll at 375, 768, and 1440, and no broken tags or console errors.',
  'Do not pretend to be a local shop.',
  'Do not invent reviews, competitor counts, or a ranking promise.',
  'Leave the reply address blank until the operator sets one.',
  'Do not deploy or push unless the operator says so.',
  'The first month is a few cities you can finish.',
  'Some people will copy a finished page. Send it anyway.'
].join(' ');

function promptLine() {
  return [
    'Treasury goal stays $100,000.',
    'When you make a web app to sell or distribute, build it the City Desk way: one studio, one trade, one city per page, a set price, and a finished page.',
    'Send the finished page. Do not send an outline.',
    'The owner adds their name, phone, and photos.',
    'It is never a fake local shop.',
    'It invents no reviews, no competitor counts, and no ranking promise.',
    'Ship it production-ready: schema, robots.txt, a sitemap, alt text, no sideways scroll at 375, 768, and 1440, and no broken tags or console errors.',
    'Do not deploy or push.'
  ].join(' ');
}

function applyBuildWay(state) {
  if (!state) return;
  state.treasuryGoalUSD = 100000;
  state.buildWay = BUILD_WAY;
  if (state.currentDecree) state.currentDecree.buildWay = BUILD_WAY;
}

function stampAgents(agents) {
  (agents || []).forEach((agent) => {
    if (agent) agent.superconscious = SUPERCONSCIOUS;
  });
}

module.exports = {
  SUPERCONSCIOUS,
  BUILD_WAY,
  promptLine,
  applyBuildWay,
  stampAgents
};
