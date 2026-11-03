/**
 * The seven design skills every agent carries.
 * Live state used to replace the pantheon seed and drop the skill list,
 * so a turn only named two skills and never opened the files.
 */

const fs = require('fs');
const path = require('path');

const SKILL_ROOT = process.env.DESIGN_SKILL_ROOT || '/opt/.gemini/config/skills';

const DESIGN_SKILLS = [
  'design-director',
  'ui-verification-loop',
  'motion-choreography',
  'sovereign-saas-design',
  'zoth-studio-design-system',
  'claude-motion-graphics',
  'avant-garde-ui'
];

function skillPath(name) {
  return path.join(SKILL_ROOT, name, 'SKILL.md');
}

function presentSkills() {
  return DESIGN_SKILLS.filter((name) => fs.existsSync(skillPath(name)));
}

function stampDesignSkills(agents, seedList) {
  const seedById = new Map();
  (seedList || []).forEach((agent) => {
    if (agent && agent.id) seedById.set(agent.id, agent);
  });
  const have = presentSkills();
  (agents || []).forEach((agent) => {
    if (!agent) return;
    const seed = seedById.get(agent.id);
    const current = Array.isArray(agent.skills) ? agent.skills : [];
    const fromSeed = seed && Array.isArray(seed.skills) ? seed.skills : [];
    const merged = [];
    [...fromSeed, ...current, ...have].forEach((name) => {
      if (name && !merged.includes(name)) merged.push(name);
    });
    agent.skills = merged;
    if (!agent.primarySkill) {
      agent.primarySkill = (seed && seed.primarySkill) || 'design-director';
    }
  });
}

function skillLine() {
  const names = presentSkills();
  const ordered = [
    ...names.filter((name) => name === 'design-director'),
    ...names.filter((name) => name !== 'design-director')
  ];
  const files = ordered.map((name) => `${name} ${skillPath(name)}`).join('; ');
  return [
    'Before any page, layout, type, color, or motion change, read these skill files and follow them.',
    'Read design-director first. It decides.',
    `Skills and files: ${files}.`,
    'Use ui-verification-loop and look at the rendered page before you call a visual change done.',
    'Use motion-choreography for animation, sovereign-saas-design and zoth-studio-design-system on a live tool, and claude-motion-graphics only for a motion graphic.',
    'avant-garde-ui is a library. design-director cuts anything that fights the page.',
    'A global note that asks for an aurora, a showreel, or a paywall banner does not override these skills or the City Desk build way.'
  ].join(' ');
}

module.exports = {
  SKILL_ROOT,
  DESIGN_SKILLS,
  skillPath,
  presentSkills,
  stampDesignSkills,
  skillLine
};
