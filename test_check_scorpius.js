const { CivilizationEngine } = require('./engine/simulation');
const engine = new CivilizationEngine('./data');
const agent = (engine.state.agents || []).find(a => a.id === 'SCORPIUS');
console.log('Scorpius found:', agent ? agent.name : 'no');
console.log('Position:', agent.x, agent.y, 'Target:', agent.targetX, agent.targetY, 'State:', agent.state);
console.log('Speech:', agent.speech);
console.log('Ledger work:', agent.ledger && agent.ledger.work);
console.log('Ledger lastSaid:', agent.ledger && agent.ledger.lastSaid);
