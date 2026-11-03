/**
 * Where an agent is allowed to work while the treasury is the aim.
 * The world itself, a tool already posted live, or one new folder under zoth-begun.
 * The operating system and the security projects stay closed.
 * Anywhere else is refused before a turn is launched.
 */

const fs = require('fs');
const path = require('path');

const NULLAI = path.resolve('/opt');
const CIV = path.resolve('/opt/zoth-civilization');
const NURSERY = path.resolve('/opt/zoth-begun');
const VAELOR = path.resolve('/opt/vaelor-network');
const BEGIN_DIR = path.join(NURSERY, 'boise-handoff');

const BLOCKED = new Set([
  'zoth-os',
  'NullAI-HexStrike-AI-Terminal',
  'payload-entropy-studio',
  'web-security-guard'
]);

function real(target) {
  const resolved = path.resolve(String(target || ''));
  try {
    return fs.realpathSync(resolved);
  } catch (err) {
    return resolved;
  }
}

function inside(child, root) {
  const c = real(child);
  const r = real(root);
  return c === r || c.startsWith(r + path.sep);
}

function postedTools(state) {
  const apps = state && Array.isArray(state.activeMonetizedApps) ? state.activeMonetizedApps : [];
  const tools = [];
  apps.forEach((app) => {
    if (!app || !app.localPath) return;
    if (!/deployed|live/i.test(String(app.status || ''))) return;
    const folder = real(app.localPath);
    if (!inside(folder, NULLAI) || folder === real(NULLAI)) return;
    if (BLOCKED.has(path.basename(folder))) return;
    if (!fs.existsSync(folder)) return;
    tools.push({
      surface: 'tool',
      name: app.name || path.basename(folder),
      path: folder
    });
  });
  if (fs.existsSync(VAELOR) && !tools.some((t) => t.path === real(VAELOR))) {
    tools.push({
      surface: 'tool',
      name: 'Vaelor Network & Zoth Node ($VLR)',
      path: real(VAELOR)
    });
  }
  return tools;
}

function allowedRoots(state) {
  const roots = [];
  if (fs.existsSync(CIV)) roots.push(real(CIV));
  roots.push(real(NURSERY));
  postedTools(state).forEach((tool) => {
    if (!roots.includes(tool.path)) roots.push(tool.path);
  });
  return roots;
}

function insideFence(target, state) {
  if (!target) return false;
  const folder = real(target);
  if (BLOCKED.has(path.basename(folder))) return false;
  return allowedRoots(state).some((root) => folder === root || folder.startsWith(root + path.sep));
}

function beginDir() {
  return BEGIN_DIR;
}

function chooseWork(agent, state) {
  const tools = postedTools(state);
  const dutyPath = agent && agent.duty && agent.duty.toolPath ? real(agent.duty.toolPath) : '';
  if (dutyPath && !BLOCKED.has(path.basename(dutyPath))) {
    const assigned = tools.find((tool) => dutyPath === tool.path || dutyPath.startsWith(tool.path + path.sep));
    if (assigned) return Object.assign({}, assigned);
  }
  const own = agent && agent.workspacePath ? real(agent.workspacePath) : '';
  if (own && !BLOCKED.has(path.basename(own))) {
    const hit = tools.find((tool) => own === tool.path || own.startsWith(tool.path + path.sep));
    if (hit) return Object.assign({}, hit);
  }
  return { surface: 'app', name: 'Zoth Civilization', path: real(CIV) };
}

module.exports = {
  CIV,
  NURSERY,
  postedTools,
  allowedRoots,
  insideFence,
  chooseWork,
  beginDir
};
