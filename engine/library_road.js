/**
 * The Library roadmap.
 * It arms once, on process start, and the keepers fill data/library_catalog.json.
 * Cards name a real book. They do not copy it.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ROAD_FILE = path.join(ROOT, 'data', 'library_roadmap.json');
const CATALOG_FILE = path.join(ROOT, 'data', 'library_catalog.json');

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return fallback;
  }
}

function readRoad() {
  return readJson(ROAD_FILE, { phases: [], keepers: [], rules: [] });
}

function readCatalog() {
  const catalog = readJson(CATALOG_FILE, { sections: [], volumes: [] });
  if (!Array.isArray(catalog.volumes)) catalog.volumes = [];
  if (!Array.isArray(catalog.sections)) catalog.sections = [];
  return catalog;
}

function countSection(catalog, sectionId) {
  return catalog.volumes.filter((volume) => volume && volume.section === sectionId).length;
}

function phaseFor(catalog, road) {
  const phases = Array.isArray(road && road.phases) ? road.phases : [];
  for (let i = 0; i < phases.length; i += 1) {
    const phase = phases[i];
    if (countSection(catalog, phase.id) < Number(phase.target || 0)) return phase;
  }
  return null;
}

function syncLibraryPhase(state) {
  if (!state || !state.libraryRoad) return { phase: null, changed: false };
  const road = readRoad();
  const phase = phaseFor(readCatalog(), road);
  const nextId = phase ? phase.id : 'complete';
  const prev = state.libraryRoad.phase;
  state.libraryRoad.active = !!phase;
  state.libraryRoad.phase = nextId;
  state.libraryRoad.title = phase ? phase.title : 'The shelves are stocked';
  return { phase, changed: !!prev && prev !== nextId };
}

function libraryBrief(state) {
  const road = readRoad();
  const phase = phaseFor(readCatalog(), road);
  if (state && state.libraryRoad) syncLibraryPhase(state);
  const rules = Array.isArray(road.rules) ? road.rules.join(' ') : '';
  if (!phase) return `The Library shelves have met their counts. ${rules}`;
  return [
    `Build The Library in data/library_catalog.json. Phase: ${phase.title}.`,
    phase.task,
    'Append JSON objects on the volumes array. Fields: volume, author, year, section, tradition, rights, note.',
    `section is "${phase.id}".`,
    rules
  ].filter(Boolean).join(' ');
}

function libraryBuilding() {
  return {
    id: 'library_of_zoth',
    name: 'The Library',
    type: 'library',
    category: 'Shelves',
    level: 1,
    x: 70,
    y: 90,
    width: 78,
    height: 64,
    color: '#C4B5FD',
    accent: '#FDE68A',
    icon: '📚',
    repo: '/opt/zoth-civilization',
    desc: 'Stoic, strategy, scripture, and metaphysical shelves. A card names the book. It does not copy the pages.',
    stats: {
      keepers: 'Athena, Draco, Chronos',
      sections: 4,
      opens: 'next civilization start'
    }
  };
}

function armLibraryRoad(engine) {
  if (!engine || !engine.state) return null;
  const road = readRoad();
  const catalog = readCatalog();
  const phase = phaseFor(catalog, road);
  const already = engine.state.libraryRoad && engine.state.libraryRoad.armedAt;
  engine.state.libraryRoad = {
    active: !!phase,
    phase: phase ? phase.id : 'complete',
    title: phase ? phase.title : 'The shelves are stocked',
    armedAt: already || new Date().toISOString(),
    keepers: road.keepers || ['ATHENA', 'DRACO', 'CHRONOS'],
    catalog: 'data/library_catalog.json'
  };
  if (!Array.isArray(engine.buildings)) engine.buildings = [];
  if (!engine.buildings.some((building) => building && building.id === 'library_of_zoth')) {
    engine.buildings.push(libraryBuilding());
  }
  if (!already && typeof engine.addMessage === 'function') {
    const names = 'Athena, Draco, and Chronos';
    const line = phase
      ? `The Library roadmap is open. ${names} start with the ${phase.title} shelf.`
      : `The Library roadmap is open. The seeded shelves already meet their counts.`;
    engine.addMessage('LIBRARY', line, 'announcement');
  }
  if (typeof engine.saveState === 'function') engine.saveState();
  return engine.state.libraryRoad;
}

function libraryStatus() {
  const road = readRoad();
  const catalog = readCatalog();
  const phase = phaseFor(catalog, road);
  const blurbs = {};
  catalog.sections.forEach((section) => {
    if (section && section.id) blurbs[section.id] = section.blurb || '';
  });
  const phases = Array.isArray(road.phases) ? road.phases : [];
  const sections = phases.map((item) => ({
    id: item.id,
    title: item.title,
    target: Number(item.target || 0),
    count: countSection(catalog, item.id),
    task: item.task || '',
    blurb: blurbs[item.id] || ''
  }));
  return {
    name: road.name || 'The Library',
    keepers: Array.isArray(road.keepers) ? road.keepers : [],
    rules: Array.isArray(road.rules) ? road.rules : [],
    active: !!phase,
    phase: phase ? phase.id : 'complete',
    title: phase ? phase.title : 'The shelves are stocked',
    sections,
    volumes: catalog.volumes
  };
}

module.exports = {
  ROAD_FILE,
  CATALOG_FILE,
  readRoad,
  readCatalog,
  phaseFor,
  syncLibraryPhase,
  libraryBrief,
  libraryStatus,
  armLibraryRoad
};
