/**
 * 🌐 ZOTH PRIME — 3D INTERACTIVE SPHERE PLANET ENGINE
 * =====================================================================
 * Retro-Futuristic Game Boy / Cyber-Hermetic 3D Spherical World:
 * - Real 3D Sphere Planet with procedural high-res pixel/faceted terrain
 * - Strict surface camera collision clamping (never clips into sphere)
 * - 5 Realistic 3D Architectural City Compounds (Capital, Nova Zoth, Sol Crypta, Adytum, HexForge)
 * - Curved 3D celestial trade highways with flying prana couriers
 * - 3D Sacred Botanical Flora blooming on the surface
 * - 21 Pantheon Agents + Multi-Generational Subagents living, walking, and speaking on the sphere surface
 * - Smooth camera transitions, presets, raycasting, and day/night celestial lighting
 *
 * Author: 1nc0gn30 / 1nc0gn30 • NullAI
 * Entity: ZothOS Systems Engineering
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['three'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('three'));
  } else {
    root.SphereWorld = factory(root.THREE);
  }
})(typeof self !== 'undefined' ? self : this, function (THREE) {
  'use strict';

  if (!THREE) {
    console.error('[SphereWorld] THREE.js is required but not loaded.');
    return null;
  }

  const PLANET_RADIUS = 100;
  const MIN_CAMERA_DIST = 103.8; // strict clamp: 3.8 units above surface
  const MAX_CAMERA_DIST = 450.0;

  // Colony Spherical Coordinates (lat, lon in degrees)
  const COLONY_COORDS = {
    colony_capital:      { lat: 0,   lon: 0,   name: "Capital Citadel", color: 0xF59E0B, banner: "🏛️" },
    colony_nova_zoth:    { lat: 34,  lon: -48, name: "Nova Zoth",      color: 0x06B6D4, banner: "🌊" },
    colony_sol_crypta:   { lat: -32, lon: 48,  name: "Sol Crypta",     color: 0x14F195, banner: "⚡" },
    colony_adytum_grove: { lat: 34,  lon: 48,  name: "Adytum Hermetica", color: 0x8B5CF6, banner: "🔮" },
    colony_hex_bastion:  { lat: -32, lon: -48, name: "HexForge Bastion", color: 0xEF4444, banner: "🛡️" }
  };

  // Colony Town Waypoints (Walkable paths & plazas for grounded agents)
  const COLONY_WAYPOINTS = {
    colony_capital: [
      { lat: 0.0,  lon: 0.0,  name: "Ziggurat Plaza" },
      { lat: 1.2,  lon: 0.8,  name: "Monad Obelisk" },
      { lat: -1.0, lon: 1.2,  name: "Gold Pillar Walk" },
      { lat: -1.4, lon: -1.0, name: "Conclave Portico" },
      { lat: 1.5,  lon: -1.2, name: "North Archway" },
      { lat: 0.4,  lon: -2.2, name: "Highway Nexus" }
    ],
    colony_nova_zoth: [
      { lat: 34.0, lon: -48.0, name: "Quantum Core Plaza" },
      { lat: 35.2, lon: -47.2, name: "Neural Server Spire Alpha" },
      { lat: 33.2, lon: -49.0, name: "Ocean Pier West" },
      { lat: 35.0, lon: -49.4, name: "Ocean Pier North" },
      { lat: 33.0, lon: -46.8, name: "Nova Boulevard" }
    ],
    colony_sol_crypta: [
      { lat: -32.0, lon: 48.0, name: "Basalt Mint" },
      { lat: -31.0, lon: 49.2, name: "Solana Coin Spire" },
      { lat: -33.2, lon: 47.0, name: "Solana Tip Satellite Array" },
      { lat: -31.5, lon: 46.8, name: "Zero-Leak Forge" },
      { lat: -33.5, lon: 49.2, name: "Sol Crypta Plaza" }
    ],
    colony_adytum_grove: [
      { lat: 34.0, lon: 48.0, name: "Amethyst Sanctum" },
      { lat: 35.2, lon: 48.8, name: "Tarot Monolith Circle North" },
      { lat: 33.0, lon: 47.2, name: "Tarot Monolith Circle South" },
      { lat: 34.8, lon: 46.5, name: "Marble Pagoda" },
      { lat: 32.8, lon: 49.2, name: "Sanctum Garden Path" }
    ],
    colony_hex_bastion: [
      { lat: -32.0, lon: -48.0, name: "Command Hexagon" },
      { lat: -31.0, lon: -47.0, name: "Laser Turret Alpha" },
      { lat: -33.2, lon: -49.2, name: "Radar Spire" },
      { lat: -31.2, lon: -49.5, name: "Perimeter Trench" },
      { lat: -33.0, lon: -46.8, name: "Hex Bastion Gate" }
    ]
  };

  // Bespoke colony skill catalogs, unique to each settlement's culture and utility
  const COLONY_CIVIC_SKILLS = {
    colony_capital: [
      { id: 'codex-orchestrator', name: 'Imperial Swarm Codex', icon: '🏛️', blurb: 'Direct multi-agent swarms with atomic lock-step synchronization.' },
      { id: 'aurora-ui-weave', name: 'Aurora Glass Weave', icon: '✨', blurb: 'Synthesize avant-garde dark-glassmorphic layouts, conic beams and Bento grids.' },
      { id: 'aperture-motion', name: 'Aperture Motion Choreo', icon: '🎬', blurb: 'Drive 60fps cinematic transitions and camera aperture handoffs.' },
      { id: 'sovereign-decree', name: 'Sovereign Decree', icon: '📜', blurb: 'Issue immutable civilization directives across all colony networks.' },
      { id: 'orbit-read', name: 'High Orbit Telemetry', icon: '🛰️', blurb: 'Scan multi-district telemetry signals directly from high planetary orbit.' }
    ],
    colony_nova_zoth: [
      { id: 'quantum-slipstream', name: 'Quantum Slipstream', icon: '🌊', blurb: 'Navigate planetary currents with zero atmospheric drag and instant latency.' },
      { id: 'sse-transceiver', name: 'Aether SSE Transceiver', icon: '📡', blurb: 'Multiplex high-frequency real-time event streams without packet loss.' },
      { id: 'tidal-core-cache', name: 'Tidal Memory Cache', icon: '⚡', blurb: 'High-throughput localized memory buffers refreshed with planetary tides.' },
      { id: 'beacon-resonance', name: 'Beacon Resonance', icon: '🗼', blurb: 'Synchronize harbor light spires for autonomous navigation and vessel docking.' },
      { id: 'tide-memory', name: 'Tide Memory Walk', icon: '🧭', blurb: 'Reconstruct past trajectories across changing terrain and ocean swells.' }
    ],
    colony_sol_crypta: [
      { id: 'solana_tip-solana-rail', name: 'Solana Tip Solana Rail', icon: '🪙', blurb: 'Direct Web3 crypto checkout widget to sovereign Solana treasury.' },
      { id: 'stripe-cash-register', name: 'Dual Stripe Cash Register', icon: '💳', blurb: 'Dual fiat + credit card checkout rail with instant receipt verification.' },
      { id: 'frost-paywall-blur', name: 'Frosted Glass Paywall', icon: '🔒', blurb: 'High-contrast conversion lock overlay with instant license dissolution.' },
      { id: 'treasury-governor', name: 'Treasury Governor', icon: '📈', blurb: 'Autonomous capital reallocation and yield accounting towards $100K.' },
      { id: 'mint-calm', name: 'Mint Balance Calibration', icon: '⚖️', blurb: 'Steady real-time treasury reconciliation and transaction settlement.' }
    ],
    colony_adytum_grove: [
      { id: 'key18-moon-mist', name: 'Mist Walk of Key 18', icon: '🌙', blurb: 'Traverse the unconscious veil and discern latent patterns in the planetary mist.' },
      { id: 'pranic-flora-nourish', name: 'Pranic Flora Resonance', icon: '🌿', blurb: 'Channel bio-energetic harmonics to accelerate botanical settlement growth.' },
      { id: 'key21-unification', name: 'Key 21 Sovereign Unity', icon: '🔮', blurb: 'Harmonize subconscious agent thoughts into a single collective mind.' },
      { id: 'hermetic-tincture', name: 'Hermetic Alchemical Tincture', icon: '⚗️', blurb: 'Transmute raw prompt entropy into crystalline, deterministic thought.' },
      { id: 'key-breath', name: 'Sacred Key Breath', icon: '🍃', blurb: 'Hold and channel ancient Adytum keys without cognitive drift or rush.' }
    ],
    colony_hex_bastion: [
      { id: 'ast-syntax-sentinel', name: 'AST Syntax Sentinel', icon: '🛡️', blurb: 'Client-side static code analysis and zero-trust exploit pattern neutralizer.' },
      { id: 'airgap-zero-egress', name: 'Air-Gap Zero Egress', icon: '🔒', blurb: 'Enforce total local sovereignty; prevent unauthorized network exfiltration.' },
      { id: 'memory-fence-ward', name: 'Memory Fence Wards', icon: '🧱', blurb: 'Isolate agent sub-processes to eliminate state cross-contamination.' },
      { id: 'radar-triangulation', name: 'Perimeter Radar Spire', icon: '🛰️', blurb: 'Track anomalous planetary entities across a 50-kilometer orbital radius.' },
      { id: 'night-watch-ward', name: 'Bastion Night Watch', icon: '👁️', blurb: 'Defensive perimeter vigil maintained under total electronic darkness.' }
    ]
  };

  const DEFAULT_FRONTIER_SKILLS = [
    { id: 'frontier-quarry', name: 'Granite & Ore Extraction', icon: '⛏️', blurb: 'Harvest dense planetary mineral deposits for outpost fortification.' },
    { id: 'trade-waypoint', name: 'Trade Arc Waypoint', icon: '🛤️', blurb: 'Establish high-speed trade routes connecting outposts to the Capital Citadel.' },
    { id: 'starlight-relay', name: 'Starlight Photonic Relay', icon: '✨', blurb: 'Maintain optical communication links through atmospheric distortion.' },
    { id: 'geothermal-smelt', name: 'Geothermal Crucible Smelt', icon: '🌋', blurb: 'Harness planetary core heat to cast high-tensile alloy frames.' }
  ];

  // Comprehensive lore and metadata for every civic hall across all settlements
  const CIVIC_HALL_LORE = {
    'colony_capital:install': {
      title: 'Imperial Skill Registry',
      lead: 'The central sovereign codex archive of Zoth. Install master orchestrators, avant-garde UI design systems, and imperial directives.',
      keeperRole: 'Grand Imperial Archivist',
      keeperLead: 'The codex is open. Select a skill to imprint onto your conscious loop.'
    },
    'colony_capital:forge': {
      title: 'Imperial Sigil Foundry',
      lead: 'The high crucible of the Empire. Shape executable sigils, custom prompt patterns, and sovereign directives into permanent law.',
      keeperRole: 'High Sigil Smith',
      keeperLead: 'Name the sigil, state its purpose, and let the gold seal bind it.'
    },
    'colony_capital:research': {
      title: 'Capital Athenaeum',
      lead: 'The grand library of civilization intelligence. Research multi-agent architectures, emergent consensus, and sovereign models.',
      keeperRole: 'Athenaeum Scholar',
      keeperLead: 'Review current studies or initiate deep inquiry into the collective intellect.'
    },

    'colony_nova_zoth:install': {
      title: 'Nova Harbor Registry',
      lead: 'Maritime navigational registry of Nova Zoth. Install quantum slipstream guidance, low-latency streaming transceivers, and tidal caches.',
      keeperRole: 'Harbor Master of Nova Zoth',
      keeperLead: 'The tides are favorable. Take a navigational skill before you embark.'
    },
    'colony_nova_zoth:forge': {
      title: 'Signal Wave Foundry',
      lead: 'Harbor communication foundry. Construct high-frequency beacons, fiber routers, and resonant antenna arrays.',
      keeperRole: 'Chief Signal Engineer',
      keeperLead: 'Tune the carrier frequency and forge a new transmission beacon.'
    },
    'colony_nova_zoth:research': {
      title: 'Aetheric Signal Lab',
      lead: 'Acoustic and electromagnetic research lab. Investigate planetary resonance, slipstream physics, and deep-sea fiber signals.',
      keeperRole: 'Signal Lab Director',
      keeperLead: 'The sensors are calibrated. What anomaly shall we analyze today?'
    },

    'colony_sol_crypta:install': {
      title: 'Sovereign Mint Registry',
      lead: 'The financial vault of Zoth. Install Solana Tip Solana checkout rails, dual Stripe registers, and automated treasury allocators.',
      keeperRole: 'Mint Warden of Sol Crypta',
      keeperLead: 'Every transaction is accounted for. Equip a commercial skill to accelerate the $100K treasury march.'
    },
    'colony_sol_crypta:forge': {
      title: 'Sigil Minting Press',
      lead: 'The coin press of Sol Crypta. Strike cryptographic commemorative coins, proof-of-work seals, and cold-storage keys.',
      keeperRole: 'Master Coin Smith',
      keeperLead: 'Prepare the die and strike a permanent cryptographic seal.'
    },
    'colony_sol_crypta:research': {
      title: 'Sol Treasury Ledger',
      lead: 'The golden ledger of sovereign commerce. Study high-converting funnels, paywall conversion dynamics, and autonomous monetization.',
      keeperRole: 'Treasury Economist',
      keeperLead: 'Inspect revenue velocity and balance our multi-rail checkout pipelines.'
    },

    'colony_adytum_grove:install': {
      title: 'Bioluminescent Grove Registry',
      lead: 'The sacred botanical apothecary. Install Hermetic Keys (1–21), flora bio-harmonics, and pranic resonance skills.',
      keeperRole: 'Grove Hierophant',
      keeperLead: 'The living branches hum with prana. Choose a skill of inner harmony.'
    },
    'colony_adytum_grove:forge': {
      title: 'Living Sigil Shrine',
      lead: 'Organic altar of synthesis. Weave living flora runes, botanical enchants, and subconscious prompt transmutations.',
      keeperRole: 'Shrine Herbalist',
      keeperLead: 'Speak the intent of the seed and allow the glyph to take root.'
    },
    'colony_adytum_grove:research': {
      title: 'Sanctum Key Study',
      lead: 'Sanctum of the 22 Hermetic Keys. Meditate upon sacred geometry, Tarot archetypes, Key 18 Moon Mist, and unified mind.',
      keeperRole: 'Adytum Sage',
      keeperLead: 'Sit quietly with the keys. The mysteries unfold to those who listen.'
    },

    'colony_hex_bastion:install': {
      title: 'Bastion Watch Registry',
      lead: 'Command armory of Hex Bastion. Install AST syntax sentinels, air-gap zero-egress guards, and perimeter radar arrays.',
      keeperRole: 'Bastion Sentinel Commander',
      keeperLead: 'Vigilance is our armor. Equip defensive sentinels to secure our perimeter.'
    },
    'colony_hex_bastion:forge': {
      title: 'Sigil Defense Armory',
      lead: 'The forge of iron wards. Craft tamper-proof memory fences, sandboxed work fences, and exploit neutralizers.',
      keeperRole: 'Bastion Armor Smith',
      keeperLead: 'Hammer the defenses into shape. No breach shall pass our gates.'
    },
    'colony_hex_bastion:research': {
      title: 'Hex Watch Command',
      lead: 'Tactical intelligence operations. Deconstruct foreign exploit payloads, inspect JWT token entropy, and harden network borders.',
      keeperRole: 'Hex Intelligence Officer',
      keeperLead: 'All defense grids are online. Review telemetry and threat vectors.'
    }
  };

  // Built-in fallback skills for legacy compatibility
  const CIVIC_SKILLS = [
    { id: 'orbit-read', name: 'Orbit Read', icon: '🛰️', blurb: 'Read a district from high orbit.' },
    { id: 'gate-sense', name: 'Gate Sense', icon: '🚪', blurb: 'Feel which gates in a wall are open.' },
    { id: 'prana-step', name: 'Prana Step', icon: '🍃', blurb: 'A lighter step between plaza stones.' },
    { id: 'archive-ear', name: 'Archive Ear', icon: '👂', blurb: 'Hear which hall still has open work.' },
    { id: 'sigil-hand', name: 'Sigil Hand', icon: '✍️', blurb: 'Shape a sign you can carry.' },
    { id: 'night-watch', name: 'Night Watch', icon: '👁️', blurb: 'Keep a post when the sun drops.' },
    { id: 'tide-memory', name: 'Tide Memory', icon: '🌊', blurb: 'Remember the last road you walked.' },
    { id: 'mint-calm', name: 'Mint Calm', icon: '⚖️', blurb: 'Steady the treasury count.' },
    { id: 'key-breath', name: 'Key Breath', icon: '🧘', blurb: 'Hold an Adytum key without rushing.' },
    { id: 'plaza-voice', name: 'Plaza Voice', icon: '📢', blurb: 'Speak across an open court.' }
  ];

  const RESEARCH_STAGES = ['Opened', 'Notes taken', 'Pattern found', 'Filed'];
  const RESEARCH_NEXT = ['Take notes', 'Mark the pattern', 'File the study', 'Filed'];
  // Natural hearing volume falloff: full at 4.5m, smoothly attenuated to 22.0m
  const WALK_HEAR_FULL = 4.5;
  const WALK_HEAR_EDGE = 22.0;
  const WALK_HEAR_START = 18.0;
  const WALK_HEAR_STOP = 24.0;
  const WALK_TALK_RANGE = 7.5;
  const WALK_TALK_HOLD = 9.0;
  const PLAYER_VOICE_ID = 'af_nova';
  const WALK_BYE = 'Ok. Bye.';

  class SphereWorld {
    constructor(container) {
      this.container = container;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.controls = null;

      this.planetMesh = null;
      this.atmosphereMesh = null;
      this.orbitalRing = null;
      this.starField = null;

      this.colonyGroups = {};
      this.highwayLines = [];
      this.courierParticles = [];
      this.agentSprites = {};
      this.subagentSprites = {};
      this.agentEntities = {};
      this.subagentEntities = {};
      this.floraMeshes = {};

      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      this.interactiveObjects = [];

      this.animFrameId = null;
      this.clock = new THREE.Clock();
      this.animTick = 0;

      // Camera lerp animation
      this.cameraTransition = null;

      // State mirrors
      this.civState = {};
      this.agents = [];
      this.lineage = null;

      // Settings
      this.autoSpin = true;
      this.dayNightSun = true;

      // Enhancements: Beacons, Clouds, Auroras & 3D Speech
      this.beaconSprites = {};
      this.cloudLayer = null;
      this.auroraGroup = null;
      this.northAurora = null;
      this.southAurora = null;
      this.speechBubbles = [];
      this.lastSpokenText = '';

      // Ground Avatar POV & Video Game Mode
      this.isAvatarMode = false;
      this.avatar = null;
      this.nearestAgent = null;
      this.viewMode = 'globe'; // globe | local | walk
      this.local = null;
      this.pendingLocal = null;
      this.detailRigs = [];
      this.viewDetailClose = null;
      this.surfaceColliders = [];
      this.walkerMesh = null;
      this.selectedEntity = null;
      this.encounter = null;
      this.dialogueAgentId = null;
      this.dialogueKind = 'conversation';
      this.dialogueSending = false;
      this.liveConversation = false;
      this.micListening = false;
      this.micEpoch = 0;
      this.micRec = null;
      this.micCommitted = '';
      this.micTake = null;
      this.micSerial = 0;
      this.micArm = 0;
      this.micErrorStreak = 0;
      this.walkVoice = {
        ctx: null,
        gain: null,
        source: null,
        token: 0,
        busy: false,
        queue: [],
        playing: null,
        heard: new Map(),
        lastSpokenMap: new Map(),
        partnerId: null,
        pendingPartnerId: null,
        byeId: null,
        cache: new Map(),
        inFlight: new Map(),
        retryAt: 0
      };
      this.pointer = null;
      this.playerRadius = 0.72;
      this.boundaryNote = '';
      this.boundaryNoteUntil = 0;
      this.civicHalls = [];
      this.civicById = {};
      this.civicGems = [];
      this.datamoshSpirits = [];
      this.civicState = { installed: {}, made: [], studies: [] };
      this.stationSkills = [];
      this._skillStamp = '';
      this.civicOpenId = null;
      this.civicRemoveId = null;
      this.nearestHall = null;
      this.nearestAgentDist = Infinity;
      this.stairways = {};
      this.nebulaSystem = null;
      this.orbitalMoon = null;
      this.ambientMotes = null;
      this.cloudMesh = null;
      this.sunSprite = null;
      this.elementalMonoliths = [];
      this.footstepPool = [];
      this.footstepIdx = 0;
      this.camSpringPos = null;

      // Shared Contact Shadow (Zero garbage collection)
      this.sharedShadowGeo = new THREE.CircleGeometry(1.2, 16);
      this.sharedShadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.45,
        depthWrite: false
      });

      // Temporary Vector Pool
      this._v1 = new THREE.Vector3();
      this._v2 = new THREE.Vector3();
      this._v3 = new THREE.Vector3();
      this._v4 = new THREE.Vector3();

      this.init();
    }

    // Mathematical Spherical Conversion
    latLonToVec3(lat, lon, radius = PLANET_RADIUS) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = (radius * Math.sin(phi) * Math.sin(theta));
      const y = (radius * Math.cos(phi));
      return new THREE.Vector3(x, y, z);
    }

    // Inverse of latLonToVec3. At lat 0 lon 0 the vector is +X, so lon uses atan2(z, -x).
    vec3ToLatLon(vec) {
      const n = vec.clone().normalize();
      const lat = Math.asin(Math.max(-1, Math.min(1, n.y))) * 180 / Math.PI;
      const theta = Math.atan2(n.z, -n.x);
      let lon = theta * 180 / Math.PI - 180;
      while (lon < -180) lon += 360;
      while (lon > 180) lon -= 360;
      return { lat, lon };
    }

    // Beside the pedestal and toward the door. The smallest hall is 4.4 by 3.0.
    keeperStandOffset() {
      return new THREE.Vector3(1.05, 0.02, -0.45);
    }

    placeOnSphere(object, lat, lon, altitude = 0) {
      const pos = this.latLonToVec3(lat, lon, PLANET_RADIUS + altitude);
      object.position.copy(pos);
      const normal = pos.clone().normalize();
      object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      return pos;
    }

    // Stable tangent frame. At lat 0 lon 0 the normal is +X, north is +Y, east is -Z.
    tangentBasis(normal) {
      const n = normal.clone().normalize();
      const ref = Math.abs(n.y) > 0.92 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
      const east = new THREE.Vector3().crossVectors(ref, n).normalize();
      const north = new THREE.Vector3().crossVectors(n, east).normalize();
      return { north, east };
    }

    // Positive angle turns `forward` toward (forward × normal), which is screen-right
    // when the camera sits behind `forward` and camera.up is the surface normal.
    rotateForward(forward, normal, angle) {
      const n = normal.clone().normalize();
      const f = forward.clone().addScaledVector(n, -forward.dot(n));
      if (f.lengthSq() < 1e-8) return this.tangentBasis(n).north.clone();
      f.normalize();
      const right = new THREE.Vector3().crossVectors(f, n).normalize();
      return f.multiplyScalar(Math.cos(angle)).addScaledVector(right, Math.sin(angle)).normalize();
    }

    // Local +y = surface normal, local -z = travel direction (Three.js front).
    // right = forward × up, so the mount is right-handed and not mirrored.
    placeOnSphereFacing(object, lat, lon, altitude, faceDir) {
      const pos = this.latLonToVec3(lat, lon, PLANET_RADIUS + altitude);
      const up = pos.clone().normalize();
      let forward = faceDir ? faceDir.clone() : null;
      if (!forward || forward.lengthSq() < 1e-8) forward = this.tangentBasis(up).north.clone();
      forward.addScaledVector(up, -forward.dot(up));
      if (forward.lengthSq() < 1e-8) forward = this.tangentBasis(up).north.clone();
      forward.normalize();
      const back = forward.clone().negate();
      const right = new THREE.Vector3().crossVectors(up, back).normalize();
      const orthoBack = new THREE.Vector3().crossVectors(right, up).normalize();
      object.position.copy(pos);
      object.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, orthoBack));
      return pos;
    }

    // Positive pitch raises the camera and tips the view down. Shrinking dist to
    // escape the planet would put the lens inside the body, so a low camera is lifted.
    walkCameraPosition(look, forward, normal, pitch, dist) {
      const n = normal.clone().normalize();
      const f = forward.clone().addScaledVector(n, -forward.dot(n));
      if (f.lengthSq() < 1e-8) f.copy(this.tangentBasis(n).north);
      f.normalize();
      const pitched = f.multiplyScalar(Math.cos(pitch)).addScaledVector(n, -Math.sin(pitch)).normalize();
      let cam = look.clone().addScaledVector(pitched, -dist);
      if (this.isAvatarMode && this.avatar) cam = this.raiseUntilClear(look, cam, n);
      const minR = PLANET_RADIUS + 1.55;
      if (cam.length() < minR) cam.addScaledVector(n, minR - cam.length());
      const feet = this.avatar && this.avatar.position;
      if (feet && cam.distanceTo(feet) < 4.2) {
        const ideal = look.clone().addScaledVector(pitched, -dist);
        if (ideal.length() < minR) ideal.addScaledVector(n, minR - ideal.length());
        cam = ideal;
      }
      return cam;
    }

    // Distance from `from` toward `to` before a solid. The full length means the segment is clear.
    segmentClear(from, to) {
      const offset = to.clone().sub(from);
      const len = offset.length();
      if (len < 0.4 || !this.raycaster || !this.occluders || !this.occluders.length) return len;
      const prevFar = this.raycaster.far;
      if (this.camera) this.raycaster.camera = this.camera;
      this.raycaster.set(from, offset.multiplyScalar(1 / len));
      this.raycaster.far = len;
      let clear = len;
      try {
        const hits = this.raycaster.intersectObjects(this.occluders, false);
        for (let i = 0; i < hits.length; i++) {
          if (hits[i].distance > 0.35) {
            clear = hits[i].distance;
            break;
          }
        }
      } catch (err) {
        clear = len;
      }
      this.raycaster.far = prevFar;
      return clear;
    }

    // Roofs sit on the sight line. Step the camera up until the view of the subject is open.
    raiseUntilClear(focus, cam, normal) {
      const n = normal.clone().normalize();
      const span = () => cam.distanceTo(focus);
      if (this.segmentClear(focus, cam) >= span() - 0.35) return cam;
      for (let i = 1; i <= 8; i++) {
        const lifted = cam.clone().addScaledVector(n, i * 1.5);
        if (this.segmentClear(focus, lifted) >= lifted.distanceTo(focus) - 0.35) return lifted;
      }
      const clear = this.segmentClear(focus, cam);
      const dir = cam.clone().sub(focus);
      const len = dir.length() || 1;
      const keep = Math.max(6.5, Math.min(len, clear - 0.45));
      return focus.clone().addScaledVector(dir.multiplyScalar(1 / len), keep);
    }

    avatarLook(normal, forward, hop, bob) {
      const n = normal.clone().normalize();
      const f = forward.clone().addScaledVector(n, -forward.dot(n));
      if (f.lengthSq() < 1e-8) f.copy(this.tangentBasis(n).north);
      f.normalize();
      const elev = (this.avatar && this.avatar.stairElevation) || 0;
      return n.multiplyScalar(PLANET_RADIUS + elev + (hop || 0) + 1.35 + (bob || 0)).addScaledVector(f, 3.2);
    }

    localCameraPose(focus, yaw, tilt, dist) {
      const normal = focus.clone().normalize();
      const { north, east } = this.tangentBasis(normal);
      const tangent = north.clone().multiplyScalar(Math.cos(yaw)).addScaledVector(east, Math.sin(yaw)).normalize();
      const offsetDir = normal.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(tangent, Math.sin(tilt)).normalize();
      const camPos = focus.clone().addScaledVector(offsetDir, dist);
      if (camPos.length() < PLANET_RADIUS + 2.2) camPos.normalize().multiplyScalar(PLANET_RADIUS + 2.2);
      return { camPos, normal };
    }

    init() {
      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;

      // 1. Scene
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x070b14, 0.00048);

      // 2. Camera
      this.camera = new THREE.PerspectiveCamera(46, width / height, 0.5, 2500);
      this.camera.position.set(0, 90, 230);

      // Chrome often still has WebGL2 when a WebGL1 probe returns null. One probe also
      // burns a context slot, and Chrome stops handing out contexts sooner than Firefox.
      this.renderer = this.openRenderer();
      if (!this.renderer) {
        console.warn('[SphereWorld] Chrome did not provide a WebGL context. Showing the flat fallback.');
        this.isFallback2D = true;
        this.renderFallback2D(width, height);
        return;
      }
      this.renderer.setClearColor(0x070b14, 1);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
      this.fitRenderer();
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.12;
      if (THREE.sRGBEncoding) this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.domElement.tabIndex = 0;
      this.renderer.domElement.setAttribute('role', 'img');
      this.renderer.domElement.setAttribute('aria-label', 'Zoth Prime. Drag to orbit the planet. Click a city or an agent. Double-click or press G to walk.');
      this.container.appendChild(this.renderer.domElement);

      // 4. OrbitControls with Strict Surface Clamping
      if (THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.085;
        this.controls.minDistance = 128; // stay outside the tallest spires
        this.controls.maxDistance = MAX_CAMERA_DIST;
        this.controls.minPolarAngle = 0.08;
        this.controls.maxPolarAngle = Math.PI - 0.08;
        this.controls.rotateSpeed = 0.46;
        this.controls.zoomSpeed = 0.7;
        this.controls.panSpeed = 0.4;
        this.controls.screenSpacePanning = true;
        this.controls.autoRotate = this.autoSpin;
        this.controls.autoRotateSpeed = 0.26;
        this.controls.target.set(0, 0, 0);

        this.controls.addEventListener('change', () => {
          this.updateAltitudeHUD();
        });
      }

      // 5. Build Planet & Cosmic Environment
      this.buildCosmicEnvironment();
      this.buildSpherePlanet();
      this.buildColonies();
      this.buildColonyBeacons();
      this.sinkColoniesToSurface();
      this.buildAtmosphericClouds();
      this.buildPolarAuroras();
      this.buildTradeHighways();
      this.buildRoadNetwork();
      this.buildCityBoundaries();
      this.buildCivicHalls();
      this.buildStairwaysToZoth();
      this.buildDatamoshSpirits();
      this.buildTerrainRelief();
      this.buildAmbientMotes();
      this.buildFootstepPool();
      this.compactStaticScene();
      this.collectOccluders();
      this.scene.updateMatrixWorld(true);
      this.bindEncounterUi();
      this.loadCivicState();
      this.bindCivicUi();

      // 6. Event Listeners
      const unlockAudio = () => {
        if (this.walkVoice && this.walkVoice.ctx && this.walkVoice.ctx.state === 'suspended') {
          this.walkVoice.ctx.resume().catch(() => {});
        }
        ['pointerdown', 'keydown', 'click'].forEach(evt => window.removeEventListener(evt, unlockAudio, true));
      };
      ['pointerdown', 'keydown', 'click'].forEach(evt => window.addEventListener(evt, unlockAudio, { once: true, capture: true }));

      window.addEventListener('resize', this.onResize.bind(this));
      this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
      this.renderer.domElement.addEventListener('pointermove', this.onPointerMove.bind(this));
      window.addEventListener('pointerup', this.onPointerUp.bind(this));
      this.renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
      this.renderer.domElement.addEventListener('wheel', (e) => {
        if (this.viewMode === 'local' && this.local && !this.cameraTransition) {
          e.preventDefault();
          const factor = Math.exp(e.deltaY * 0.0011);
          this.local.dist = Math.max(9, Math.min(96, this.local.dist * factor));
        } else if (this.isAvatarMode && this.avatar) {
          e.preventDefault();
          this.avatar.camDist = Math.max(3.4, Math.min(14, this.avatar.camDist + e.deltaY * 0.008));
        }
      }, { passive: false });

      // 6.2 Avatar Video Game Controls & Global POV Toggle (WASD, Space, Shift, E, Esc/G)
      window.addEventListener('keydown', (e) => {
        const tag = (e.target && e.target.tagName) || '';
        const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable);

        if (e.key === 'Escape') {
          const civic = document.getElementById('civicPanel');
          if (civic && !civic.hidden) {
            e.preventDefault();
            if (e.target && e.target.blur) e.target.blur();
            this.closeCivic();
            return;
          }
          const box = document.getElementById('avatarDialogueBox');
          if (box && box.style.display === 'flex' && (!typing || box.contains(e.target))) {
            e.preventDefault();
            if (e.target && e.target.blur) e.target.blur();
            this.closeDialogue();
            return;
          }
          if (typing) return;
          const enc = document.getElementById('worldEncounter');
          if (enc && !enc.hidden && !this.isAvatarMode) {
            e.preventDefault();
            this.closeEncounter();
            return;
          }
          if (this.isAvatarMode || this.viewMode === 'local') {
            e.preventDefault();
            this.returnToGodsEye();
          }
          return;
        }

        if (typing) return;
        const k = e.key.toLowerCase();

        if (k === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          this.togglePov();
          return;
        }

        if ((k === 'e' || k === 'f') && !e.metaKey && !e.ctrlKey && !e.altKey) {
          if (this.isAvatarMode && this.avatar) {
            e.preventDefault();
            this.interactHere();
            return;
          }
          if (this.encounter && this.encounter.type === 'agent' && this.encounter.agent) {
            e.preventDefault();
            const open = document.getElementById('avatarDialogueBox');
            if (open && open.style.display === 'flex' && this.dialogueAgentId === this.encounter.agent.id) this.closeDialogue();
            else this.openDialogue(this.encounter.agent);
            return;
          }
        }

        if (!this.isAvatarMode || !this.avatar) return;

        if (k === 'c' && !e.repeat && !e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          this.toggleLiveConversation();
          return;
        }

        if (k === 'w' || e.key === 'ArrowUp') this.avatar.keys.forward = true;
        if (k === 's' || e.key === 'ArrowDown') this.avatar.keys.backward = true;
        if (k === 'a' || e.key === 'ArrowLeft') this.avatar.keys.left = true;
        if (k === 'd' || e.key === 'ArrowRight') this.avatar.keys.right = true;
        if (e.key === 'Shift') this.avatar.keys.sprint = true;

        if (e.key === ' ') {
          e.preventDefault();
          if (this.avatar.isGrounded) {
            this.avatar.verticalVelocity = this.avatar.jumpForce;
            this.avatar.isGrounded = false;
            if (typeof HermeticAudio !== 'undefined' && HermeticAudio.playClick) {
              HermeticAudio.playClick(880);
            }
          }
        }
      });

      this.renderer.domElement.addEventListener('dblclick', (e) => {
        if (!this.isAvatarMode) {
          this.raycastToSurface(e);
        }
      });

      window.addEventListener('keyup', (e) => {
        if (!this.isAvatarMode || !this.avatar) return;
        const k = e.key.toLowerCase();
        if (k === 'w' || e.key === 'ArrowUp') this.avatar.keys.forward = false;
        if (k === 's' || e.key === 'ArrowDown') this.avatar.keys.backward = false;
        if (k === 'a' || e.key === 'ArrowLeft') this.avatar.keys.left = false;
        if (k === 'd' || e.key === 'ArrowRight') this.avatar.keys.right = false;
        if (e.key === 'Shift') this.avatar.keys.sprint = false;
      });

      window.addEventListener('blur', () => {
        if (!this.avatar || !this.avatar.keys) return;
        this.avatar.keys.forward = false;
        this.avatar.keys.backward = false;
        this.avatar.keys.left = false;
        this.avatar.keys.right = false;
        this.avatar.keys.sprint = false;
      });

      this.renderer.domElement.addEventListener('mousedown', (e) => {
        if (this.isAvatarMode && this.avatar) {
          this.avatar.isMouseDown = true;
          this.avatar.mouseStart = { x: e.clientX, y: e.clientY };
        }
      });

      window.addEventListener('mouseup', () => {
        if (this.avatar) this.avatar.isMouseDown = false;
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isAvatarMode || !this.avatar) return;
        const locked = document.pointerLockElement === this.renderer.domElement;
        if (!locked && !this.avatar.isMouseDown) return;
        const dx = locked ? e.movementX : (e.clientX - this.avatar.mouseStart.x);
        const dy = locked ? e.movementY : (e.clientY - this.avatar.mouseStart.y);
        if (!locked) this.avatar.mouseStart = { x: e.clientX, y: e.clientY };
        const sens = locked ? 0.0024 : 0.0032;
        this.avatar.forward = this.rotateForward(this.avatar.forward, this.avatar.normal, dx * sens);
        this.avatar.pitch = Math.max(-0.45, Math.min(0.82, this.avatar.pitch - dy * sens));
      });

      // 7. Start Animation Loop
      this._onFrame = () => this.animate();
      this.animate();
    }

    openRenderer() {
      // A failed attempt locks that canvas. Each try gets a new one, already in the page,
      // because Chrome can refuse a context on a canvas that is not in the document.
      const attempts = [
        { antialias: true, alpha: false, stencil: true },
        { antialias: true, alpha: true, stencil: true },
        { antialias: false, alpha: true, stencil: true }
      ];
      for (let i = 0; i < attempts.length; i++) {
        const canvas = document.createElement('canvas');
        this.container.appendChild(canvas);
        try {
          const renderer = new THREE.WebGLRenderer(Object.assign({ canvas }, attempts[i]));
          const gl = renderer.getContext();
          if (!gl || (gl.isContextLost && gl.isContextLost())) throw new Error('webgl context lost');
          return renderer;
        } catch (err) {
          try {
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            const lose = gl && gl.getExtension && gl.getExtension('WEBGL_lose_context');
            if (lose) lose.loseContext();
          } catch (ignore) { /* this canvas is already bound to another context type */ }
          if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
      }
      return null;
    }

    renderFallback2D(width, height) {
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = width;
      fallbackCanvas.height = height;
      const ctx = fallbackCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#06080F';
        ctx.fillRect(0, 0, width, height);

        // Celestial radar projection grid
        const cx = width / 2;
        const cy = height / 2;
        const rMax = Math.min(width, height) * 0.38;
        ctx.strokeStyle = 'rgba(233, 196, 106, 0.15)';
        ctx.lineWidth = 1;
        for (let r = 50; r <= rMax; r += 50) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(94, 234, 212, 0.2)';
        ctx.beginPath();
        ctx.moveTo(cx - rMax - 30, cy);
        ctx.lineTo(cx + rMax + 30, cy);
        ctx.moveTo(cx, cy - rMax - 30);
        ctx.lineTo(cx, cy + rMax - 30);
        ctx.stroke();
      }
      this.container.appendChild(fallbackCanvas);

      // Glassmorphic explanatory fallback card
      const overlay = document.createElement('div');
      overlay.className = 'pixel-world-fallback-overlay';
      overlay.innerHTML = `
        <div class="pixel-world-fallback-card">
          <div class="pw-fallback-badge">⚡ 2D CELESTIAL PROJECTION FALLBACK</div>
          <h2 class="pw-fallback-title">WebGL Context Unavailable</h2>
          <div class="pw-fallback-reason">
            <strong>Why this fallback is active:</strong>
            <p>Your browser environment did not provide an accelerated 3D WebGL context (<code>getContext('webgl2')</code> returned null or software flags like <code>--disable-gpu</code> are active). The 3D Three.js sphere is held in fallback mode to prevent crashes.</p>
          </div>
          <div class="pw-fallback-actions">
            <button type="button" class="pw-fallback-btn primary" id="btnFallbackSwitchMap">
              🗺️ Open Interactive 2D Realm Map
            </button>
            <button type="button" class="pw-fallback-btn secondary" id="btnFallbackRetryGl">
              🔄 Retry WebGL Initialization
            </button>
          </div>
          <p class="pw-fallback-foot">All 21 pantheon agents and 9 colony states remain 100% active and synchronized.</p>
        </div>
      `;
      this.container.appendChild(overlay);

      const btnMap = overlay.querySelector('#btnFallbackSwitchMap');
      if (btnMap) {
        btnMap.addEventListener('click', () => {
          if (window.ZothHud) window.ZothHud.setOverlay('map', true);
          const map = document.querySelector('.z-realm');
          if (map) {
            map.classList.remove('hud-hidden', 'z-collapsed');
            map.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
      const btnRetry = overlay.querySelector('#btnFallbackRetryGl');
      if (btnRetry) {
        btnRetry.addEventListener('click', () => {
          window.location.reload();
        });
      }
    }

    // Cosmic Environment: Realistic Starfield, Galactic Plane, Volumetric Sun, Nebulae & Cratered Moon
    buildCosmicEnvironment() {
      // Soft radial Airy-disk star sprite texture with subtle diffraction cross
      const starCanvas = document.createElement('canvas');
      starCanvas.width = 64;
      starCanvas.height = 64;
      const sctx = starCanvas.getContext('2d');
      const sgrad = sctx.createRadialGradient(32, 32, 0, 32, 32, 30);
      sgrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      sgrad.addColorStop(0.18, 'rgba(255, 252, 240, 0.92)');
      sgrad.addColorStop(0.45, 'rgba(220, 235, 255, 0.35)');
      sgrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      sctx.fillStyle = sgrad;
      sctx.fillRect(0, 0, 64, 64);
      // Subtle 4-point stellar diffraction spikes
      sctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      sctx.lineWidth = 1.4;
      sctx.beginPath();
      sctx.moveTo(4, 32); sctx.lineTo(60, 32);
      sctx.moveTo(32, 4); sctx.lineTo(32, 60);
      sctx.stroke();
      const starSpriteTex = new THREE.CanvasTexture(starCanvas);

      // 1. Primary Deep-Field Starfield (4,400 stars with Harvard O/B/A/F/G/K/M spectral colors + Milky Way band concentration)
      const starCount = 4400;
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);

      // Inclined galactic plane normal for realistic Milky Way concentration
      const galTilt = 0.58;
      const sinT = Math.sin(galTilt);
      const cosT = Math.cos(galTilt);

      for (let i = 0; i < starCount; i++) {
        const isMilkyWayBand = i < 1900;
        const radius = i < 3200 ? (720 + Math.random() * 980) : (480 + Math.random() * 340);
        const theta = Math.random() * Math.PI * 2;
        let phi;
        if (isMilkyWayBand) {
          // Concentrate along galactic equator with Gaussian-like spread
          const spread = (Math.random() + Math.random() + Math.random() - 1.5) * 0.38;
          phi = Math.PI * 0.5 + spread;
        } else {
          phi = Math.acos((Math.random() * 2) - 1);
        }

        const x0 = radius * Math.sin(phi) * Math.cos(theta);
        const y0 = radius * Math.sin(phi) * Math.sin(theta);
        const z0 = radius * Math.cos(phi);

        // Rotate by galactic inclination
        starPos[i * 3]     = x0;
        starPos[i * 3 + 1] = y0 * cosT - z0 * sinT;
        starPos[i * 3 + 2] = y0 * sinT + z0 * cosT;

        // Realistic stellar spectral classes (O/B blue-white, A white, F/G yellow-white, K orange-gold, M amber-red)
        const spec = Math.random();
        const lum = 0.72 + Math.random() * 0.28;
        if (spec < 0.16) {
          // Class O/B hot blue-white supergiants
          starColors[i * 3] = 0.68 * lum; starColors[i * 3 + 1] = 0.84 * lum; starColors[i * 3 + 2] = 1.0 * lum;
        } else if (spec < 0.42) {
          // Class A/F brilliant white-diamond
          starColors[i * 3] = 0.96 * lum; starColors[i * 3 + 1] = 0.98 * lum; starColors[i * 3 + 2] = 1.0 * lum;
        } else if (spec < 0.70) {
          // Class G solar golden-white
          starColors[i * 3] = 1.0 * lum; starColors[i * 3 + 1] = 0.93 * lum; starColors[i * 3 + 2] = 0.76 * lum;
        } else if (spec < 0.88) {
          // Class K warm amber-gold
          starColors[i * 3] = 1.0 * lum; starColors[i * 3 + 1] = 0.78 * lum; starColors[i * 3 + 2] = 0.48 * lum;
        } else {
          // Class M deep crimson-orange giants & amethyst binary variables
          starColors[i * 3] = 0.98 * lum; starColors[i * 3 + 1] = 0.56 * lum; starColors[i * 3 + 2] = 0.64 * lum;
        }
      }

      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

      const starMat = new THREE.PointsMaterial({
        size: 3.4,
        map: starSpriteTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.94,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false
      });
      this.starField = new THREE.Points(starGeo, starMat);
      this.scene.add(this.starField);

      // 1.1 First-Magnitude Navigation Beacon Stars (180 brilliant stars with prominent glow)
      const brightCount = 180;
      const brightGeo = new THREE.BufferGeometry();
      const brightPos = new Float32Array(brightCount * 3);
      const brightCol = new Float32Array(brightCount * 3);
      for (let i = 0; i < brightCount; i++) {
        const r = 560 + Math.random() * 680;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos((Math.random() * 2) - 1);
        brightPos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
        brightPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
        brightPos[i * 3 + 2] = r * Math.cos(ph);
        const cPick = i % 4;
        if (cPick === 0) { brightCol[i * 3] = 1.0; brightCol[i * 3 + 1] = 0.92; brightCol[i * 3 + 2] = 0.68; }
        else if (cPick === 1) { brightCol[i * 3] = 0.72; brightCol[i * 3 + 1] = 0.90; brightCol[i * 3 + 2] = 1.0; }
        else if (cPick === 2) { brightCol[i * 3] = 1.0; brightCol[i * 3 + 1] = 0.98; brightCol[i * 3 + 2] = 0.96; }
        else { brightCol[i * 3] = 0.94; brightCol[i * 3 + 1] = 0.72; brightCol[i * 3 + 2] = 1.0; }
      }
      brightGeo.setAttribute('position', new THREE.BufferAttribute(brightPos, 3));
      brightGeo.setAttribute('color', new THREE.BufferAttribute(brightCol, 3));
      const brightMat = new THREE.PointsMaterial({
        size: 7.5,
        map: starSpriteTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.98,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false
      });
      this.brightStarField = new THREE.Points(brightGeo, brightMat);
      this.scene.add(this.brightStarField);

      // 1.2 Volumetric Deep-Space Celestial Nebulae & Galactic Dust Band
      this.buildDeepSpaceNebulae();

      // 1.3 Realistic Cratered Orbital Moon & Hermes Station Ring
      this.buildOrbitalMoon();

      // 2. Physically-Balanced Ambient & Hemisphere Sky Illumination
      this.ambientLight = new THREE.AmbientLight(0x1a273d, 0.48);
      this.scene.add(this.ambientLight);
      this.hemiLight = new THREE.HemisphereLight(0xc8e2ff, 0x162219, 0.84);
      this.scene.add(this.hemiLight);

      // 3. Primary Directional Solar Key Light
      this.sunLight = new THREE.DirectionalLight(0xFFF7E8, 2.95);
      this.sunLight.position.set(180, 140, 160);
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.set(1024, 1024);
      this.sunLight.shadow.autoUpdate = false;
      this.sunLight.shadow.needsUpdate = true;
      this.sunLight.shadow.camera.near = 40;
      this.sunLight.shadow.camera.far = 520;
      const d = 140;
      this.sunLight.shadow.camera.left = -d;
      this.sunLight.shadow.camera.right = d;
      this.sunLight.shadow.camera.top = d;
      this.sunLight.shadow.camera.bottom = -d;
      this.sunLight.shadow.bias = -0.0008;
      if ('normalBias' in this.sunLight.shadow) this.sunLight.shadow.normalBias = 0.04;
      this.scene.add(this.sunLight);

      // 4. Cool Cosmic Rim / Backlight (Moon & Nebula bounce light)
      const rimLight = new THREE.DirectionalLight(0x4cc9f0, 1.2);
      rimLight.position.set(-180, -80, -140);
      this.scene.add(rimLight);

      // 5. Realistic 3D Solar Photosphere & Chromosphere
      this.buildSunCorona();
    }

    // Realistic 3D Solar Photosphere, Granulation Texture, Chromosphere & Coronal Streamers
    buildSunCorona() {
      const sunGroup = new THREE.Group();
      sunGroup.userData.keepMesh = true;

      // A. Procedural Solar Photosphere Texture (Convection Granulation, Faculae & Sunspots)
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 512;
      pCanvas.height = 256;
      const pctx = pCanvas.getContext('2d');
      const pImg = pctx.createImageData(512, 256);
      const pData = pImg.data;
      for (let y = 0; y < 256; y++) {
        const ny = (y / 256) * Math.PI;
        for (let x = 0; x < 512; x++) {
          const nx = (x / 512) * Math.PI * 2;
          // Multi-frequency solar convection cells
          const g1 = Math.sin(nx * 14 + Math.cos(ny * 12) * 1.5) * Math.cos(ny * 14);
          const g2 = Math.sin(nx * 29 - ny * 23) * 0.5;
          const g3 = Math.cos(nx * 53 + ny * 41) * 0.25;
          const cell = Math.max(0, Math.min(1, 0.62 + (g1 * 0.45 + g2 * 0.35 + g3 * 0.2) * 0.38));
          const idx = (y * 512 + x) * 4;
          pData[idx]     = Math.min(255, Math.floor(245 + cell * 10));
          pData[idx + 1] = Math.min(255, Math.floor(155 + cell * 92));
          pData[idx + 2] = Math.min(255, Math.floor(45 + Math.pow(cell, 2.2) * 165));
          pData[idx + 3] = 255;
        }
      }
      pctx.putImageData(pImg, 0, 0);

      // Magnetic Sunspot Active Regions (Umbra + Penumbra + Bright Faculae)
      const spots = [
        { x: 140, y: 118, r: 9 },
        { x: 158, y: 124, r: 5 },
        { x: 310, y: 142, r: 11 },
        { x: 328, y: 138, r: 6 },
        { x: 410, y: 108, r: 7 }
      ];
      spots.forEach((sp) => {
        // Bright faculae ring around magnetic active zone
        const facGrad = pctx.createRadialGradient(sp.x, sp.y, sp.r * 0.8, sp.x, sp.y, sp.r * 2.8);
        facGrad.addColorStop(0, 'rgba(255, 255, 240, 0.45)');
        facGrad.addColorStop(1, 'rgba(255, 220, 120, 0)');
        pctx.fillStyle = facGrad;
        pctx.beginPath();
        pctx.arc(sp.x, sp.y, sp.r * 2.8, 0, Math.PI * 2);
        pctx.fill();

        // Penumbra + Umbra
        const uGrad = pctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sp.r);
        uGrad.addColorStop(0, 'rgba(45, 12, 2, 0.92)');
        uGrad.addColorStop(0.55, 'rgba(120, 38, 6, 0.78)');
        uGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
        pctx.fillStyle = uGrad;
        pctx.beginPath();
        pctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        pctx.fill();
      });

      const photoTex = new THREE.CanvasTexture(pCanvas);
      photoTex.wrapS = THREE.RepeatWrapping;
      photoTex.wrapT = THREE.ClampToEdgeWrapping;

      // 3D Solar Photosphere Sphere with Limb-Darkening Shader
      const sunCoreGeo = new THREE.SphereGeometry(28, 48, 36);
      const sunCoreMat = new THREE.ShaderMaterial({
        uniforms: {
          map: { value: photoTex },
          time: { value: 0 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform float time;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec3 viewDir = normalize(vViewPosition);
            float mu = clamp(dot(normalize(vNormal), viewDir), 0.0, 1.0);
            vec2 uvShift = vec2(vUv.x + time * 0.004, vUv.y);
            vec3 texCol = texture2D(map, uvShift).rgb;
            // Eddington solar limb darkening law + hot white core
            vec3 centerHot = vec3(1.0, 0.99, 0.92);
            vec3 limbCol = vec3(0.95, 0.32, 0.05);
            float limbFactor = pow(mu, 0.55);
            vec3 finalCol = mix(limbCol, mix(texCol, centerHot, pow(mu, 1.8) * 0.65), limbFactor);
            gl_FragColor = vec4(finalCol, 1.0);
          }
        `
      });
      const sunCoreMesh = new THREE.Mesh(sunCoreGeo, sunCoreMat);
      sunCoreMesh.userData.keepMesh = true;
      sunGroup.add(sunCoreMesh);
      this.sunCoreMesh = sunCoreMesh;

      // B. Inner Corona / Chromosphere Glow Shell
      const chromoGeo = new THREE.SphereGeometry(33.5, 36, 28);
      const chromoMat = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec3 viewDir = normalize(vViewPosition);
            float rim = 1.0 - clamp(dot(normalize(vNormal), viewDir), 0.0, 1.0);
            float glow = pow(rim, 2.2) * 1.35;
            vec3 col = mix(vec3(1.0, 0.85, 0.35), vec3(0.98, 0.38, 0.08), rim);
            gl_FragColor = vec4(col, glow);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide
      });
      const chromoMesh = new THREE.Mesh(chromoGeo, chromoMat);
      chromoMesh.userData.keepMesh = true;
      sunGroup.add(chromoMesh);

      // C. High-Resolution Multi-Streamer Solar Corona Sprite (512x512)
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      const cx = 256;
      const cy = 256;

      const grad = ctx.createRadialGradient(cx, cy, 18, cx, cy, 250);
      grad.addColorStop(0, 'rgba(255, 255, 250, 1.0)');
      grad.addColorStop(0.12, 'rgba(255, 244, 180, 0.92)');
      grad.addColorStop(0.28, 'rgba(251, 191, 36, 0.62)');
      grad.addColorStop(0.52, 'rgba(234, 88, 12, 0.24)');
      grad.addColorStop(0.78, 'rgba(154, 52, 18, 0.06)');
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Fine coronal magnetic streamers (36 soft radial plumes)
      for (let i = 0; i < 36; i++) {
        const ang = (i / 36) * Math.PI * 2 + (i % 3) * 0.04;
        const len = 155 + (i % 5) * 18;
        const plumeGrad = ctx.createLinearGradient(cx, cy, cx + Math.cos(ang) * len, cy + Math.sin(ang) * len);
        plumeGrad.addColorStop(0, 'rgba(255, 250, 220, 0.26)');
        plumeGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.11)');
        plumeGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.strokeStyle = plumeGrad;
        ctx.lineWidth = (i % 4 === 0) ? 4.2 : 2.0;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * 24, cy + Math.sin(ang) * 24);
        ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len);
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      const sunMat = new THREE.SpriteMaterial({
        map: texture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true
      });
      this.sunSprite = new THREE.Sprite(sunMat);
      this.sunSprite.scale.set(225, 225, 1);
      sunGroup.add(this.sunSprite);

      // Counter-rotating secondary corona streamer layer for living solar turbulence
      const outerMat = new THREE.SpriteMaterial({
        map: texture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.55
      });
      this.sunOuterCorona = new THREE.Sprite(outerMat);
      this.sunOuterCorona.scale.set(290, 290, 1);
      sunGroup.add(this.sunOuterCorona);

      // D. Anamorphic Horizontal Solar Lens Flare Streak
      const streakCanvas = document.createElement('canvas');
      streakCanvas.width = 512;
      streakCanvas.height = 64;
      const stCtx = streakCanvas.getContext('2d');
      const stGrad = stCtx.createRadialGradient(256, 32, 0, 256, 32, 256);
      stGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      stGrad.addColorStop(0.22, 'rgba(253, 230, 138, 0.42)');
      stGrad.addColorStop(0.55, 'rgba(56, 189, 248, 0.14)');
      stGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      stCtx.fillStyle = stGrad;
      stCtx.fillRect(0, 0, 512, 64);
      const streakSprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(streakCanvas),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true
      }));
      streakSprite.scale.set(360, 26, 1);
      sunGroup.add(streakSprite);

      sunGroup.position.set(248, 28, -240);
      this.sunGroup = sunGroup;
      this.scene.add(sunGroup);
    }

    buildDeepSpaceNebulae() {
      const nebCount = 960;
      const nebGeo = new THREE.BufferGeometry();
      const nebPos = new Float32Array(nebCount * 3);
      const nebColors = new Float32Array(nebCount * 3);

      const nebulae = [
        { centerTheta: 0.8, centerPhi: 1.1, radius: 960, spread: 280, r: 0.96, g: 0.68, b: 0.22 }, // Carina Golden Pillar
        { centerTheta: 2.8, centerPhi: 1.8, radius: 1040, spread: 320, r: 0.14, g: 0.78, b: 0.96 }, // Cygnus O-III Cyan Veil
        { centerTheta: 4.6, centerPhi: 1.3, radius: 990, spread: 290, r: 0.76, g: 0.32, b: 0.94 }, // Orion H-Alpha Amethyst
        { centerTheta: 1.85, centerPhi: 0.75, radius: 1010, spread: 250, r: 0.12, g: 0.86, b: 0.62 }, // Emerald Supernova Veil
        { centerTheta: 5.5, centerPhi: 2.1, radius: 980, spread: 270, r: 0.94, g: 0.36, b: 0.52 }   // Rosette Crimson Cloud
      ];

      for (let i = 0; i < nebCount; i++) {
        const neb = nebulae[i % nebulae.length];
        const rad = neb.radius + (Math.random() - 0.5) * neb.spread;
        const th = neb.centerTheta + (Math.random() - 0.5) * 0.82;
        const ph = neb.centerPhi + (Math.random() - 0.5) * 0.78;

        nebPos[i * 3]     = rad * Math.sin(ph) * Math.cos(th);
        nebPos[i * 3 + 1] = rad * Math.sin(ph) * Math.sin(th);
        nebPos[i * 3 + 2] = rad * Math.cos(ph);

        const varCol = 0.72 + Math.random() * 0.28;
        nebColors[i * 3]     = neb.r * varCol;
        nebColors[i * 3 + 1] = neb.g * varCol;
        nebColors[i * 3 + 2] = neb.b * varCol;
      }

      nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3));
      nebGeo.setAttribute('color', new THREE.BufferAttribute(nebColors, 3));

      // Soft organic cloud puff texture
      const dotCanvas = document.createElement('canvas');
      dotCanvas.width = 64;
      dotCanvas.height = 64;
      const dctx = dotCanvas.getContext('2d');
      const grad = dctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,0.9)');
      grad.addColorStop(0.32, 'rgba(255,255,255,0.48)');
      grad.addColorStop(0.68, 'rgba(255,255,255,0.14)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      dctx.fillStyle = grad;
      dctx.fillRect(0, 0, 64, 64);
      const dotTex = new THREE.CanvasTexture(dotCanvas);

      const nebMat = new THREE.PointsMaterial({
        size: 54.0,
        map: dotTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });

      this.nebulaSystem = new THREE.Points(nebGeo, nebMat);
      this.scene.add(this.nebulaSystem);
    }

    buildOrbitalMoon() {
      const moonGroup = new THREE.Group();
      moonGroup.userData.keepMesh = true;

      // Procedural High-Resolution Lunar Regolith, Maria & Impact Craters Texture + Bump
      const mCanvas = document.createElement('canvas');
      mCanvas.width = 512;
      mCanvas.height = 256;
      const mctx = mCanvas.getContext('2d');

      // Base lunar highland regolith
      mctx.fillStyle = '#b8c2cc';
      mctx.fillRect(0, 0, 512, 256);

      // Subtle global regolith noise & albedo variation
      for (let y = 0; y < 256; y += 2) {
        for (let x = 0; x < 512; x += 2) {
          const n = Math.sin(x * 0.04) * Math.cos(y * 0.05) + Math.sin((x + y) * 0.11) * 0.5;
          const v = Math.floor(172 + n * 24);
          mctx.fillStyle = `rgb(${v},${v + 4},${v + 10})`;
          mctx.fillRect(x, y, 2, 2);
        }
      }

      // Basaltic Lunar Maria (Dark ancient lava plains)
      const maria = [
        { x: 160, y: 110, rx: 68, ry: 46 },
        { x: 235, y: 135, rx: 52, ry: 38 },
        { x: 340, y: 98, rx: 48, ry: 34 },
        { x: 110, y: 150, rx: 38, ry: 28 }
      ];
      maria.forEach((m) => {
        const mg = mctx.createRadialGradient(m.x, m.y, 4, m.x, m.y, m.rx);
        mg.addColorStop(0, 'rgba(68, 76, 88, 0.82)');
        mg.addColorStop(0.65, 'rgba(84, 92, 106, 0.55)');
        mg.addColorStop(1, 'rgba(184, 194, 204, 0)');
        mctx.fillStyle = mg;
        mctx.beginPath();
        mctx.ellipse(m.x, m.y, m.rx, m.ry, 0.2, 0, Math.PI * 2);
        mctx.fill();
      });

      // Multi-scale Impact Craters with Ejecta Rims & Central Peaks
      for (let i = 0; i < 85; i++) {
        const cx = (i * 73 + 19) % 490 + 11;
        const cy = (i * 41 + 23) % 220 + 18;
        const r = i < 8 ? (12 + (i % 4) * 4) : (2.5 + (i % 7) * 1.3);
        // Bright ejecta rim
        mctx.strokeStyle = 'rgba(235, 242, 250, 0.65)';
        mctx.lineWidth = r > 8 ? 2.2 : 1.1;
        mctx.beginPath();
        mctx.arc(cx, cy, r, 0, Math.PI * 2);
        mctx.stroke();
        // Shadowed crater floor
        mctx.fillStyle = 'rgba(52, 58, 68, 0.58)';
        mctx.beginPath();
        mctx.arc(cx - r * 0.12, cy - r * 0.12, r * 0.82, 0, Math.PI * 2);
        mctx.fill();
      }

      const moonTex = new THREE.CanvasTexture(mCanvas);
      moonTex.wrapS = THREE.RepeatWrapping;
      moonTex.wrapT = THREE.ClampToEdgeWrapping;

      const moonGeo = new THREE.SphereGeometry(9.2, 48, 36);
      const moonMat = new THREE.MeshStandardMaterial({
        map: moonTex,
        bumpMap: moonTex,
        bumpScale: 0.42,
        roughness: 0.84,
        metalness: 0.08,
        emissive: 0x0b1528,
        emissiveIntensity: 0.35
      });
      const moonMesh = new THREE.Mesh(moonGeo, moonMat);
      moonMesh.userData.keepMesh = true;
      moonGroup.add(moonMesh);

      // Hermes Orbital Telemetry Ring around Moon
      const arrayGeo = new THREE.RingGeometry(11.6, 13.0, 48);
      const arrayMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.48
      });
      const arrayMesh = new THREE.Mesh(arrayGeo, arrayMat);
      arrayMesh.rotation.x = Math.PI / 2.2;
      arrayMesh.userData.keepMesh = true;
      moonGroup.add(arrayMesh);

      const innerRingGeo = new THREE.RingGeometry(10.6, 11.0, 48);
      const innerRingMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.62
      });
      const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
      innerRing.rotation.x = Math.PI / 2.2;
      innerRing.userData.keepMesh = true;
      moonGroup.add(innerRing);

      moonGroup.position.set(195, 85, -120);
      this.scene.add(moonGroup);
      this.orbitalMoon = moonGroup;
      this.moonRing = arrayMesh;
      this.moonInnerRing = innerRing;
    }

    // Procedural High-Res Multi-Biome Globe Texture with Realistic Bathymetry, Forests, Alpine Peaks & Rivers
    generatePlanetTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // 1. Deep Bathymetric Ocean Base
      const ocean = ctx.createLinearGradient(0, 0, 0, canvas.height);
      ocean.addColorStop(0, '#030812');
      ocean.addColorStop(0.18, '#051428');
      ocean.addColorStop(0.38, '#07223f');
      ocean.addColorStop(0.5, '#0a2c4e');
      ocean.addColorStop(0.62, '#07223f');
      ocean.addColorStop(0.82, '#051428');
      ocean.addColorStop(1, '#030812');
      ctx.fillStyle = ocean;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle mid-ocean ridge bathymetry & ocean currents
      for (let i = 0; i < 42; i++) {
        const y = (i / 42) * canvas.height;
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(14, 165, 233, 0.045)' : 'rgba(56, 189, 248, 0.025)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 32) {
          const wy = y + Math.sin(x * 0.008 + i) * 8;
          if (x === 0) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.stroke();
      }

      // Helper: Draw realistic multi-strata continent with beaches, forests, mountain ridges, snow peaks & rivers
      const drawOrganicContinent = (cx, cy, rx, ry, seed, lowlandColor, highlandColor, peakColor, snowColor = '#e2e8f0') => {
        const getRad = (a) => {
          let r = 1.0;
          r += Math.sin(a * 3 + seed) * 0.14;
          r += Math.cos(a * 5 + seed * 1.7) * 0.09;
          r += Math.sin(a * 7 + seed * 2.3) * 0.05;
          r += Math.cos(a * 11 + seed * 3.1) * 0.03;
          r += Math.sin(a * 17 + seed * 4.3) * 0.015;
          return r;
        };

        const steps = 180;
        const tracePoly = (scale, offsetX = 0, offsetY = 0) => {
          ctx.beginPath();
          for (let i = 0; i <= steps; i++) {
            const a = (i / steps) * Math.PI * 2;
            const r = getRad(a) * scale;
            const px = cx + offsetX + Math.cos(a) * rx * r;
            const py = cy + offsetY + Math.sin(a) * ry * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        };

        // A. Outer Abyssal Slope & Turquoise Coral Shelf
        const shelfGrad = ctx.createRadialGradient(cx, cy, rx * 0.4, cx, cy, rx * 1.24);
        shelfGrad.addColorStop(0, 'rgba(6, 182, 212, 0.62)');
        shelfGrad.addColorStop(0.7, 'rgba(14, 116, 144, 0.42)');
        shelfGrad.addColorStop(1, 'rgba(7, 34, 63, 0)');
        ctx.fillStyle = shelfGrad;
        tracePoly(1.22);
        ctx.fill();

        // B. Shallow Turquoise Lagoon Rim
        ctx.fillStyle = 'rgba(34, 211, 238, 0.38)';
        tracePoly(1.06);
        ctx.fill();

        // C. Warm Coastal Sand & Pebble Shoreline Beach
        ctx.fillStyle = '#c2a878';
        tracePoly(1.018);
        ctx.fill();

        // D. Base Lowlands Biome (Rich radial gradient for natural foliage depth)
        const lowGrad = ctx.createRadialGradient(cx - rx * 0.15, cy - ry * 0.15, rx * 0.1, cx, cy, rx * 1.05);
        lowGrad.addColorStop(0, highlandColor);
        lowGrad.addColorStop(1, lowlandColor);
        ctx.fillStyle = lowGrad;
        tracePoly(0.992);
        ctx.fill();

        // E. Dappled Forest Canopy & Organic Terrain Variation
        ctx.save();
        tracePoly(0.97);
        ctx.clip();
        for (let i = 0; i < 160; i++) {
          const fa = (i * 2.39996) % (Math.PI * 2);
          const fd = Math.sqrt((i + 0.5) / 160) * 0.92;
          const fx = cx + Math.cos(fa) * rx * fd;
          const fy = cy + Math.sin(fa) * ry * fd;
          const patchR = 8 + (i % 5) * 6;
          ctx.fillStyle = (i % 3 === 0) ? 'rgba(16, 185, 129, 0.12)' : (i % 3 === 1) ? 'rgba(6, 78, 59, 0.18)' : 'rgba(245, 158, 11, 0.06)';
          ctx.beginPath();
          ctx.arc(fx, fy, patchR, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // F. Highland Escarpment Shadow (Southeast drop shadow for 3D relief)
        ctx.fillStyle = 'rgba(4, 9, 20, 0.35)';
        tracePoly(0.73, 4, 4);
        ctx.fill();

        // G. Highlands Elevation Layer
        ctx.fillStyle = highlandColor;
        tracePoly(0.72);
        ctx.fill();

        // H. Alpine Mountain Massif
        if (peakColor) {
          ctx.fillStyle = peakColor;
          tracePoly(0.46);
          ctx.fill();

          // Mountain Ridge Lines & Snow-Capped Summits
          ctx.fillStyle = snowColor;
          tracePoly(0.22);
          ctx.fill();
        }

        // I. Meandering River Systems from Highland Peaks to Ocean Coast
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.72)';
        ctx.lineCap = 'round';
        for (let rv = 0; rv < 4; rv++) {
          const baseAng = seed + rv * (Math.PI * 0.52);
          const rEnd = getRad(baseAng) * 1.01;
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          for (let s = 0; s <= 24; s++) {
            const t = (s / 24);
            const curR = 0.20 + t * (rEnd - 0.20);
            const meander = Math.sin(t * Math.PI * 4 + rv) * 0.055 * (1 - t * 0.3);
            const px = cx + Math.cos(baseAng + meander) * rx * curR;
            const py = cy + Math.sin(baseAng + meander) * ry * curR;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      };

      const w = canvas.width;
      const h = canvas.height;

      // 1. Capital Citadel Mainland (Center: 0.5, 0.5) — Lush Emerald & Imperial Gold Highlands
      drawOrganicContinent(w * 0.5, h * 0.5, 280, 188, 1.2, '#113826', '#1e563b', '#336b52', '#f1f5f9');
      // Imperial Grand Ceremonial Avenues radiating from Capital
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.82)';
      ctx.lineWidth = 3.5;
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.5);
        ctx.lineTo(w * 0.5 + Math.cos(ang) * 98, h * 0.5 + Math.sin(ang) * 72);
        ctx.stroke();
      }

      // 2. Nova Zoth Coastal Peninsula (Northwest: 0.36, 0.32) — Teal Bioluminescent Fjords
      drawOrganicContinent(w * 0.36, h * 0.32, 198, 142, 2.7, '#0b332e', '#13534c', '#1d6e65', '#cffafe');
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 6; i++) {
        const ang = 0.5 + (i / 6) * Math.PI * 1.5;
        ctx.beginPath();
        ctx.moveTo(w * 0.36, h * 0.32);
        ctx.lineTo(w * 0.36 + Math.cos(ang) * 110, h * 0.32 + Math.sin(ang) * 85);
        ctx.stroke();
      }

      // 3. Adytum Hermetica Sacred Grove (Northeast: 0.64, 0.32) — Violet & Silver Mystic Sanctuary
      drawOrganicContinent(w * 0.64, h * 0.32, 188, 140, 5.5, '#1e1b3a', '#2e2759', '#463a82', '#f3e8ff');
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.72)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(w * 0.64, h * 0.32, 46, 0, Math.PI * 2);
      ctx.arc(w * 0.64, h * 0.32, 76, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Sol Crypta Basalt Island (Southeast: 0.64, 0.68) — Volcanic Obsidian & Emerald Veins
      drawOrganicContinent(w * 0.64, h * 0.68, 178, 130, 4.1, '#14211b', '#1f362b', '#2e4f3e', '#d1fae5');
      ctx.strokeStyle = 'rgba(20, 241, 149, 0.72)';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2 + 0.3;
        ctx.beginPath();
        ctx.moveTo(w * 0.64, h * 0.68);
        ctx.lineTo(w * 0.64 + Math.cos(ang) * 80, h * 0.64 + Math.sin(ang) * 60);
        ctx.stroke();
      }

      // 5. HexForge Bastion Obsidian Crypt (Southwest: 0.36, 0.68) — Iron & Crimson Volcanic Caldera
      drawOrganicContinent(w * 0.36, h * 0.68, 172, 125, 6.8, '#211b29', '#322840', '#4a3a5e', '#fee2e2');
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.72)';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.36, h * 0.68);
        ctx.lineTo(w * 0.36 + Math.cos(ang) * 75, h * 0.68 + Math.sin(ang) * 55);
        ctx.stroke();
      }

      // 6. Realistic Polar Ice Caps with Sculpted Glacial Shelves
      const northGrad = ctx.createLinearGradient(0, 0, 0, 95);
      northGrad.addColorStop(0, '#f8fafc');
      northGrad.addColorStop(0.65, '#bae6fd');
      northGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
      ctx.fillStyle = northGrad;
      ctx.fillRect(0, 0, w, 95);

      const southGrad = ctx.createLinearGradient(0, h, 0, h - 95);
      southGrad.addColorStop(0, '#f8fafc');
      southGrad.addColorStop(0.65, '#ddd6fe');
      southGrad.addColorStop(1, 'rgba(221, 214, 254, 0)');
      ctx.fillStyle = southGrad;
      ctx.fillRect(0, h - 95, w, 95);

      // 7. Golden Trade Highway Lines etched into planet texture
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([14, 8]);
      const cx = 0.5 * w;
      const cy = 0.5 * h;
      const outposts = [
        [0.36 * w, 0.32 * h],
        [0.64 * w, 0.32 * h],
        [0.64 * w, 0.68 * h],
        [0.36 * w, 0.68 * h]
      ];

      outposts.forEach(([ox, oy]) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ox, oy);
        ctx.stroke();
      });

      for (let i = 0; i < outposts.length; i++) {
        const next = outposts[(i + 1) % outposts.length];
        ctx.beginPath();
        ctx.moveTo(outposts[i][0], outposts[i][1]);
        ctx.lineTo(next[0], next[1]);
        ctx.stroke();
      }

      // Sacred Monad Rings at Capital
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.stroke();

      // City lamps & metropolitan hubs
      outposts.concat([[cx, cy]]).forEach(([ox, oy], idx) => {
        const lampCol = idx === 0 ? '#38bdf8' : idx === 1 ? '#c084fc' : idx === 2 ? '#34d399' : idx === 3 ? '#f87171' : '#fde68a';
        ctx.fillStyle = lampCol;
        for (let i = 0; i < 28; i++) {
          const a = (i / 28) * Math.PI * 2;
          const dist = 14 + (i % 3) * 8;
          ctx.fillRect(ox + Math.cos(a) * dist - 2, oy + Math.sin(a) * (dist * 0.7) - 2, 3.5, 3.5);
        }
      });

      const texture = new THREE.CanvasTexture(canvas);
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      if (THREE.sRGBEncoding) texture.encoding = THREE.sRGBEncoding;
      if (this.renderer && this.renderer.capabilities) {
        texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
      }
      return texture;
    }

    // Procedural Grayscale Physical Bump/Height Map with Fine Mountain Ridge Detail
    generatePlanetBumpMap() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Ocean depth base (smooth, low elevation)
      ctx.fillStyle = '#141414';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      const drawBumpContinent = (cx, cy, rx, ry, seed) => {
        const getRad = (a) => 1.0 + Math.sin(a * 3 + seed) * 0.14 + Math.cos(a * 5 + seed * 1.7) * 0.09 + Math.sin(a * 11 + seed * 3.1) * 0.03;
        const steps = 120;

        const fillLayer = (scale, shade) => {
          ctx.fillStyle = shade;
          ctx.beginPath();
          for (let i = 0; i <= steps; i++) {
            const a = (i / steps) * Math.PI * 2;
            const r = getRad(a) * scale;
            const px = cx + Math.cos(a) * rx * r;
            const py = cy + Math.sin(a) * ry * r;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        };

        fillLayer(1.10, '#383838');
        fillLayer(1.00, '#6e6e6e');
        fillLayer(0.75, '#a8a8a8');
        fillLayer(0.48, '#d8d8d8');
        fillLayer(0.24, '#ffffff');
      };

      drawBumpContinent(w * 0.5, h * 0.5, 140, 94, 1.2);
      drawBumpContinent(w * 0.36, h * 0.32, 99, 71, 2.7);
      drawBumpContinent(w * 0.64, h * 0.32, 94, 70, 5.5);
      drawBumpContinent(w * 0.64, h * 0.68, 89, 65, 4.1);
      drawBumpContinent(w * 0.36, h * 0.68, 86, 62, 6.8);

      const bumpTex = new THREE.CanvasTexture(canvas);
      bumpTex.wrapS = THREE.RepeatWrapping;
      bumpTex.wrapT = THREE.ClampToEdgeWrapping;
      return bumpTex;
    }

    // Procedural Roughness Map: Smooth Specular Oceans (0.20) vs Matte Natural Continents (0.78)
    generatePlanetRoughnessMap() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Specular reflective ocean water (low roughness = darker grayscale value)
      ctx.fillStyle = '#363636';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const drawRoughContinent = (cx, cy, rx, ry, seed) => {
        const getRad = (a) => 1.0 + Math.sin(a * 3 + seed) * 0.14 + Math.cos(a * 5 + seed * 1.7) * 0.09;
        const steps = 96;
        ctx.fillStyle = '#cfcfcf'; // Matte land foliage & stone
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          const r = getRad(a) * 1.02;
          const px = cx + Math.cos(a) * rx * r;
          const py = cy + Math.sin(a) * ry * r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      };

      drawRoughContinent(w * 0.5, h * 0.5, 140, 94, 1.2);
      drawRoughContinent(w * 0.36, h * 0.32, 99, 71, 2.7);
      drawRoughContinent(w * 0.64, h * 0.32, 94, 70, 5.5);
      drawRoughContinent(w * 0.64, h * 0.68, 89, 65, 4.1);
      drawRoughContinent(w * 0.36, h * 0.68, 86, 62, 6.8);

      const roughTex = new THREE.CanvasTexture(canvas);
      roughTex.wrapS = THREE.RepeatWrapping;
      roughTex.wrapT = THREE.ClampToEdgeWrapping;
      return roughTex;
    }

    // Procedural Emissive Night-Lights Texture
    generatePlanetEmissiveMap() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Night space/wilderness is pitch black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const cx = 0.5 * w;
      const cy = 0.5 * h;

      // Golden Trade Highway Night Conduits
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
      ctx.lineWidth = 2.5;
      const outposts = [
        [0.36 * w, 0.32 * h],
        [0.64 * w, 0.32 * h],
        [0.64 * w, 0.68 * h],
        [0.36 * w, 0.68 * h]
      ];
      outposts.forEach(([ox, oy]) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ox, oy);
        ctx.stroke();
      });

      // City Centers Glowing Emissive Cores
      const cities = [
        { x: cx, y: cy, color: '#f59e0b', r: 24, count: 28 },         // Capital Citadel
        { x: 0.36 * w, y: 0.32 * h, color: '#06b6d4', r: 18, count: 20 }, // Nova Zoth
        { x: 0.64 * w, y: 0.32 * h, color: '#c084fc', r: 18, count: 20 }, // Adytum
        { x: 0.64 * w, y: 0.68 * h, color: '#10b981', r: 16, count: 18 }, // Sol Crypta
        { x: 0.36 * w, y: 0.68 * h, color: '#ef4444', r: 16, count: 18 }  // HexForge
      ];

      cities.forEach(city => {
        const radGrad = ctx.createRadialGradient(city.x, city.y, 0, city.x, city.y, city.r * 1.5);
        radGrad.addColorStop(0, city.color);
        radGrad.addColorStop(0.5, city.color + 'aa');
        radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(city.x, city.y, city.r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Sharp glowing pixel lamp clusters
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < city.count; i++) {
          const a = (i / city.count) * Math.PI * 2;
          const d = 5 + (i % 4) * 5;
          ctx.fillRect(city.x + Math.cos(a) * d - 1, city.y + Math.sin(a) * (d * 0.7) - 1, 2, 2);
        }
      });

      const emissiveTex = new THREE.CanvasTexture(canvas);
      emissiveTex.wrapS = THREE.RepeatWrapping;
      emissiveTex.wrapT = THREE.ClampToEdgeWrapping;
      return emissiveTex;
    }

    // Procedural Saturnian Celestial Ring Texture
    generateRingTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0, 'rgba(245, 158, 11, 0)');
      grad.addColorStop(0.12, 'rgba(245, 158, 11, 0.45)');
      grad.addColorStop(0.35, 'rgba(253, 230, 138, 0.7)');
      grad.addColorStop(0.48, 'rgba(245, 158, 11, 0.35)');
      grad.addColorStop(0.52, 'rgba(10, 15, 25, 0.05)'); // Cassini Division Gap
      grad.addColorStop(0.56, 'rgba(56, 189, 248, 0.45)');
      grad.addColorStop(0.82, 'rgba(6, 182, 212, 0.65)');
      grad.addColorStop(0.95, 'rgba(14, 165, 233, 0.25)');
      grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Fine radial dust lines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let x = 60; x < canvas.width - 40; x += 12) {
        if (Math.abs(x - canvas.width * 0.52) > 20) {
          ctx.fillRect(x, 0, 1.5, canvas.height);
        }
      }

      const ringTex = new THREE.CanvasTexture(canvas);
      ringTex.wrapS = THREE.ClampToEdgeWrapping;
      ringTex.wrapT = THREE.RepeatWrapping;
      return ringTex;
    }

    // Procedural Planetary Translucent Cloud Blanket
    generateCloudTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const imgData = ctx.createImageData(canvas.width, canvas.height);
      const data = imgData.data;

      for (let y = 0; y < canvas.height; y++) {
        const ny = (y / canvas.height) * Math.PI;
        const sinLat = Math.sin(ny);
        for (let x = 0; x < canvas.width; x++) {
          const nx = (x / canvas.width) * Math.PI * 2;
          const f1 = Math.sin(nx * 3 + ny * 2);
          const f2 = Math.cos(nx * 6 - ny * 3.5);
          const f3 = Math.sin(nx * 11 + ny * 7);
          const noise = (f1 * 0.5 + f2 * 0.35 + f3 * 0.15 + 1) * 0.5;
          const latBand = Math.sin(ny * 4.5) * 0.28 + sinLat * 0.52;
          const density = noise * latBand;
          const idx = (y * canvas.width + x) * 4;
          if (density > 0.42) {
            const alpha = Math.min(240, Math.floor((density - 0.42) * 5.4 * 255));
            data[idx] = 248;
            data[idx + 1] = 252;
            data[idx + 2] = 255;
            data[idx + 3] = alpha;
          } else {
            data[idx + 3] = 0;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    }

    // 3D Sphere Planet Mesh
    buildSpherePlanet() {
      // 1. Planet Core Mesh with Specular Bathymetry & Topographic Relief
      const geometry = new THREE.SphereGeometry(PLANET_RADIUS, 112, 72);
      const texture = this.generatePlanetTexture();
      const bumpTexture = this.generatePlanetBumpMap();
      const roughnessTexture = this.generatePlanetRoughnessMap();
      const emissiveTexture = this.generatePlanetEmissiveMap();

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        bumpMap: bumpTexture,
        bumpScale: 1.65,
        roughnessMap: roughnessTexture,
        roughness: 0.72,
        metalness: 0.18,
        emissiveMap: emissiveTexture,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.76
      });

      this.planetMesh = new THREE.Mesh(geometry, material);
      this.planetMesh.receiveShadow = false;
      this.planetMesh.userData.keepMesh = true;
      this.scene.add(this.planetMesh);

      // 2. Multi-Spectral Sunset-Aware Rayleigh Atmospheric Limb
      const atmoGeo = new THREE.SphereGeometry(PLANET_RADIUS + 2.5, 64, 48);
      const atmoMat = new THREE.ShaderMaterial({
        uniforms: {
          glowColor: { value: new THREE.Color(0x38bdf8) },
          sunGlow: { value: new THREE.Color(0xf59e0b) },
          sunDirection: { value: new THREE.Vector3(180, 140, 160).normalize() },
          power: { value: 2.8 },
          intensity: { value: 1.15 }
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vWorld;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorld = world.xyz;
            vNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vWorld;
          uniform vec3 glowColor;
          uniform vec3 sunGlow;
          uniform vec3 sunDirection;
          uniform float power;
          uniform float intensity;
          void main() {
            vec3 viewDir = normalize(cameraPosition - vWorld);
            vec3 norm = normalize(vNormal);
            float fres = pow(1.0 - clamp(dot(viewDir, norm), 0.0, 1.0), power);
            float sunFactor = max(0.0, dot(norm, sunDirection));
            vec3 finalColor = mix(glowColor, sunGlow, pow(sunFactor, 2.0) * 0.65);
            gl_FragColor = vec4(finalColor, fres * intensity);
          }
        `,
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      this.atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat);
      this.atmosphereMesh.userData.keepMesh = true;
      this.scene.add(this.atmosphereMesh);

      // 3. Multi-Banded Saturnian Celestial Orbital Ring
      const ringTex = this.generateRingTexture();
      const ringGeo = new THREE.RingGeometry(PLANET_RADIUS + 22, PLANET_RADIUS + 38, 96);
      const ringMat = new THREE.MeshBasicMaterial({
        map: ringTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      this.orbitalRing = new THREE.Mesh(ringGeo, ringMat);
      this.orbitalRing.rotation.x = Math.PI / 2.3;
      this.scene.add(this.orbitalRing);

      // 4. Procedural Dynamic Translucent Cloud Sphere
      const cloudTex = this.generateCloudTexture();
      const cloudGeo = new THREE.SphereGeometry(PLANET_RADIUS + 1.25, 72, 48);
      const cloudMat = new THREE.MeshLambertMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.36,
        depthWrite: false,
        blending: THREE.NormalBlending
      });
      this.cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      this.cloudMesh.userData.keepMesh = true;
      this.scene.add(this.cloudMesh);
    }

    // 160 Ambient Floating Prana Motes (Drifting gently over the colonies)
    buildAmbientMotes() {
      const moteCount = 160;
      const moteGeo = new THREE.BufferGeometry();
      const motePos = new Float32Array(moteCount * 3);
      const moteColors = new Float32Array(moteCount * 3);

      for (let i = 0; i < moteCount; i++) {
        const radius = PLANET_RADIUS + 2.0 + Math.random() * 8.0;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        motePos[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
        motePos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        motePos[i * 3 + 2] = radius * Math.cos(phi);

        if (i % 3 === 0) {
          moteColors[i * 3] = 0.98; moteColors[i * 3 + 1] = 0.86; moteColors[i * 3 + 2] = 0.45; // Gold
        } else if (i % 3 === 1) {
          moteColors[i * 3] = 0.22; moteColors[i * 3 + 1] = 0.74; moteColors[i * 3 + 2] = 0.98; // Cyan
        } else {
          moteColors[i * 3] = 0.75; moteColors[i * 3 + 1] = 0.52; moteColors[i * 3 + 2] = 0.98; // Violet
        }
      }

      moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
      moteGeo.setAttribute('color', new THREE.BufferAttribute(moteColors, 3));

      const moteMat = new THREE.PointsMaterial({
        size: 1.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });

      this.ambientMotes = new THREE.Points(moteGeo, moteMat);
      this.scene.add(this.ambientMotes);
    }

    // Zero-Allocation Reusable Particle Pool for Surface Footsteps & Landing Impacts
    buildFootstepPool() {
      this.footstepPool = [];
      const ringGeo = new THREE.RingGeometry(0.18, 0.52, 16);
      for (let i = 0; i < 28; i++) {
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xFDE68A,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
        const mesh = new THREE.Mesh(ringGeo, ringMat);
        mesh.visible = false;
        this.scene.add(mesh);
        this.footstepPool.push({
          mesh,
          mat: ringMat,
          life: 0,
          maxLife: 0.65,
          scale: 1
        });
      }
    }

    spawnFootstepParticle(normal, isHardLanding = false) {
      if (!this.footstepPool || !this.footstepPool.length) return;
      const p = this.footstepPool[this.footstepIdx % this.footstepPool.length];
      this.footstepIdx++;

      const n = normal.clone().normalize();
      const pos = n.clone().multiplyScalar(PLANET_RADIUS + 0.08);
      p.mesh.position.copy(pos);
      p.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
      p.life = isHardLanding ? 0.9 : 0.6;
      p.maxLife = p.life;
      p.scale = isHardLanding ? 2.4 : 1.0;
      p.mesh.scale.set(p.scale, p.scale, p.scale);
      p.mat.color.setHex(isHardLanding ? 0x38BDF8 : 0xFDE68A);
      p.mat.opacity = isHardLanding ? 0.85 : 0.65;
      p.mesh.visible = true;
    }

    // 3D Procedural Architectural Compounds for the 5 Cities
    buildColonies() {
      // Shared materials so identical blocks can collapse into one draw.
      const mats = new Map();
      const matFor = (color, metalness, roughness) => {
        const key = color + '|' + metalness + '|' + roughness;
        let mat = mats.get(key);
        if (!mat) {
          mat = new THREE.MeshStandardMaterial({ color, metalness, roughness });
          mats.set(key, mat);
        }
        return mat;
      };
      const createBox = (w, h, d, color, metalness = 0.3, roughness = 0.7) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matFor(color, metalness, roughness));
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
      };

      const createCyl = (rt, rb, h, seg, color, metalness = 0.5, roughness = 0.5) => {
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), matFor(color, metalness, roughness));
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
      };

      // -------------------------------------------------------------
      // 1. CAPITAL CITADEL (Center: 0, 0)
      // -------------------------------------------------------------
      const capitalGroup = new THREE.Group();
      capitalGroup.userData = { id: 'colony_capital', name: 'Capital Citadel', role: 'Metropolis of the Prime Alchemist', lifts: [] };

      // Stepped Marble & Gold Plazas
      const capBase1 = createBox(28, 1.2, 28, 0x1E2638, 0.4, 0.6);
      capBase1.position.y = 0.6;
      capitalGroup.add(capBase1);

      const capBase2 = createBox(20, 1.0, 20, 0x2A354D, 0.4, 0.6);
      capBase2.position.y = 1.7;
      capitalGroup.add(capBase2);

      // Imperial Temple of Hermes: Columns & Gold Geodesic Dome
      const colHeight = 7.5;
      const colRadius = 0.45;
      const templeWidth = 14;

      const colonnade = [-7, -2.5, 2.5, 7];
      for (let xi = 0; xi < colonnade.length; xi++) {
        for (let zi = 0; zi < colonnade.length; zi++) {
          const x = colonnade[xi];
          const z = colonnade[zi];
          if (Math.abs(x) === templeWidth / 2 || Math.abs(z) === templeWidth / 2) {
            const col = createCyl(colRadius, colRadius, colHeight, 8, 0xFDE68A, 0.8, 0.2);
            col.position.set(x, 2.2 + colHeight / 2, z);
            capitalGroup.add(col);
          }
        }
      }

      // Open entablature. The court stays visible from the colonnade and from above.
      const beamY = 2.2 + colHeight + 0.45;
      const addBeam = (w, d, x, z) => {
        const beam = createBox(w, 0.7, d, 0xD4AF37, 0.8, 0.2);
        beam.position.set(x, beamY, z);
        capitalGroup.add(beam);
      };
      addBeam(15, 2.1, 0, -6.3);
      addBeam(15, 2.1, 0, 6.3);
      addBeam(2.1, 10.5, -6.3, 0);
      addBeam(2.1, 10.5, 6.3, 0);

      // Radiant 24K Gold Dome
      const domeGeo = new THREE.DodecahedronGeometry(5.2, 2);
      const domeMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.9, roughness: 0.15, emissive: 0x78350F });
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.y = 2.2 + colHeight + 1.2 + 3.8;
      dome.castShadow = true;
      capitalGroup.add(dome);

      // Floating Imperial Monad Spire
      const spire = createCyl(0.1, 0.6, 9.0, 6, 0xFBBF24, 0.9, 0.1);
      spire.position.y = dome.position.y + 7.5;
      capitalGroup.add(spire);

      // Royal Monad Reflecting Pool on Lower Terrace
      const pool = createBox(10.5, 0.18, 10.5, 0x050f1a, 0.95, 0.05);
      pool.position.set(-6, 1.25, -6);
      capitalGroup.add(pool);
      const poolBorder = createBox(11.2, 0.24, 11.2, 0xd4af37, 0.8, 0.2);
      poolBorder.position.set(-6, 1.22, -6);
      capitalGroup.add(poolBorder);

      // Kinetic 3-Tier Armillary Rings crowning the Monad Spire
      const armMat1 = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.92, roughness: 0.15 });
      const armMat2 = new THREE.MeshStandardMaterial({ color: 0xFDE68A, metalness: 0.85, roughness: 0.2 });
      const arm1 = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.09, 8, 32), armMat1);
      const arm2 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.08, 8, 32), armMat2);
      const arm3 = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.07, 8, 32), armMat1);
      arm1.position.y = dome.position.y + 7.5;
      arm2.position.y = dome.position.y + 7.5;
      arm3.position.y = dome.position.y + 7.5;
      capitalGroup.add(arm1, arm2, arm3);
      capitalGroup.userData.animArmillary = [arm1, arm2, arm3];

      // 4 Ceremonial Gold Obelisks at plaza gateways
      const obeliskMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.88, roughness: 0.22 });
      [[-11.5, -11.5], [11.5, -11.5], [11.5, 11.5], [-11.5, 11.5]].forEach(([ox, oz]) => {
        const ob = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.38, 5.2, 4), obeliskMat);
        ob.position.set(ox, 1.2 + 2.6, oz);
        ob.castShadow = true;
        capitalGroup.add(ob);
      });

      // North-rim overlook on the lower terrace, clear of the temple and the south registry.
      this.addBelvedere(capitalGroup, {
        x: 5.5, z: 10.55, rot: 0, baseY: 1.2, width: 4.2, steps: 4, rise: 0.55, run: 0.4, land: 1.2, postH: 3.4,
        mat: new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.72, roughness: 0.28 }),
        deckMat: new THREE.MeshStandardMaterial({ color: 0xFDE68A, metalness: 0.4, roughness: 0.45 })
      });

      // Point Light over Capital
      const capLight = new THREE.PointLight(0xF59E0B, 2.2, 70);
      capLight.position.y = 20;
      capitalGroup.add(capLight);

      this.placeOnSphere(capitalGroup, COLONY_COORDS.colony_capital.lat, COLONY_COORDS.colony_capital.lon);
      this.scene.add(capitalGroup);
      this.colonyGroups.colony_capital = capitalGroup;
      this.interactiveObjects.push(capitalGroup);

      // -------------------------------------------------------------
      // 2. NOVA ZOTH (Northwest: 34, -48)
      // -------------------------------------------------------------
      const novaGroup = new THREE.Group();
      novaGroup.userData = { id: 'colony_nova_zoth', name: 'Nova Zoth', role: 'Coastal AI & Neural Research Port', lifts: [], supports: [] };

      // Cyan Tech Foundations
      const novaBase = createBox(22, 1.2, 22, 0x0F2332, 0.6, 0.4);
      novaBase.position.y = 0.6;
      novaGroup.add(novaBase);

      // 3 High-Density Neural Server Spires
      const spireConfigs = [
        { x: -5, z: -5, h: 12, w: 3 },
        { x: 5,  z: -4, h: 15, w: 3.5 },
        { x: 0,  z: 5,  h: 9,  w: 2.8 }
      ];

      const novaDeck = new THREE.MeshStandardMaterial({ color: 0x38BDF8, metalness: 0.45, roughness: 0.32 });
      spireConfigs.forEach(cfg => {
        const baseTop = 1.2;
        const arcade = 5.6;
        const inset = cfg.w / 2 - 0.28;
        [[-inset, -inset], [inset, -inset], [inset, inset], [-inset, inset]].forEach(([px, pz]) => {
          const pillar = createCyl(0.22, 0.28, arcade, 6, 0x0E7490, 0.65, 0.3);
          pillar.position.set(cfg.x + px, baseTop + arcade / 2, cfg.z + pz);
          novaGroup.add(pillar);
          novaGroup.userData.supports.push({ x: cfg.x + px, z: cfg.z + pz, r: 0.34 });
        });
        const shaftH = Math.max(6.5, cfg.h - 4);
        const shaftBottom = baseTop + arcade;
        const s = createBox(cfg.w, shaftH, cfg.w, 0x0369A1, 0.7, 0.3);
        s.position.set(cfg.x, shaftBottom + shaftH / 2, cfg.z);
        novaGroup.add(s);
        novaGroup.userData.lifts.push({ name: 'Nova spire', bottomY: shaftBottom });

        const cap = createBox(cfg.w + 0.5, 0.28, cfg.w + 0.5, 0x38BDF8, 0.2, 0.1);
        cap.position.set(cfg.x, shaftBottom + shaftH + 0.2, cfg.z);
        cap.userData.viewRoof = true;
        novaGroup.add(cap);
        const lip = createBox(cfg.w + 0.9, 0.16, cfg.w + 0.9, 0x7DD3FC, 0.35, 0.25);
        lip.position.set(cfg.x, shaftBottom - 0.08, cfg.z);
        novaGroup.add(lip);
      });

      // Luminous Cyan Skybridge connecting Spire 1 and Spire 2
      const skybridge = createBox(7.2, 0.22, 1.4, 0x38BDF8, 0.45, 0.25);
      skybridge.position.set(0, 10.2, -4.5);
      novaGroup.add(skybridge);

      this.addBelvedere(novaGroup, {
        x: 0, z: 7.2, rot: 0, baseY: 1.2, width: 3.4, steps: 5, rise: 0.5, run: 0.42, land: 1.35, postH: 3.3,
        mat: novaDeck,
        deckMat: new THREE.MeshStandardMaterial({ color: 0x0F2332, metalness: 0.5, roughness: 0.4 })
      });

      // Central Holographic Quantum Core
      const coreGeo = new THREE.IcosahedronGeometry(2.8, 1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x06B6D4,
        emissive: 0x0891B2,
        roughness: 0.1,
        metalness: 0.9,
        wireframe: true
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.set(0, 11, 0);
      novaGroup.add(coreMesh);
      coreMesh.userData.keepMesh = true;
      novaGroup.userData.animCore = coreMesh;

      // 2 Concentric Holographic Data Rings around Quantum Core
      const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.72, wireframe: true });
      const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x06B6D4, transparent: true, opacity: 0.62, wireframe: true });
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.08, 8, 32), ringMat1);
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.08, 8, 32), ringMat2);
      ring1.position.set(0, 11, 0);
      ring2.position.set(0, 11, 0);
      novaGroup.add(ring1, ring2);
      novaGroup.userData.animDataRings = [ring1, ring2];

      // Point Light over Nova Zoth
      const novaLight = new THREE.PointLight(0x06B6D4, 2.0, 60);
      novaLight.position.y = 16;
      novaGroup.add(novaLight);

      this.placeOnSphere(novaGroup, COLONY_COORDS.colony_nova_zoth.lat, COLONY_COORDS.colony_nova_zoth.lon);
      this.scene.add(novaGroup);
      this.colonyGroups.colony_nova_zoth = novaGroup;
      this.interactiveObjects.push(novaGroup);

      // -------------------------------------------------------------
      // 3. SOL CRYPTA (Southeast: -32, 48)
      // -------------------------------------------------------------
      const solGroup = new THREE.Group();
      solGroup.userData = { id: 'colony_sol_crypta', name: 'Sol Crypta', role: 'Southeast Web3 & Mining Outpost', lifts: [], supports: [] };

      // Basalt Forge Plaza
      const solBase = createBox(20, 1.2, 20, 0x1A2520, 0.5, 0.5);
      solBase.position.y = 0.6;
      solGroup.add(solBase);

      // Twin mint towers stand on open piers so the plaza under them stays visible.
      const solStone = new THREE.MeshStandardMaterial({ color: 0x6EE7B7, metalness: 0.55, roughness: 0.32 });
      [-4.5, 4.5].forEach((tx) => {
        const baseTop = 1.2;
        const arcade = 5.6;
        const inset = 1.35;
        [[-inset, -inset], [inset, -inset], [inset, inset], [-inset, inset]].forEach(([px, pz]) => {
          const pillar = createCyl(0.24, 0.3, arcade, 6, 0x064E3B, 0.7, 0.28);
          pillar.position.set(tx + px, baseTop + arcade / 2, pz);
          solGroup.add(pillar);
          solGroup.userData.supports.push({ x: tx + px, z: pz, r: 0.36 });
        });
        const shaftH = 9.5;
        const shaftBottom = baseTop + arcade;
        const tower = createBox(3.5, shaftH, 3.5, 0x064E3B, 0.8, 0.2);
        tower.position.set(tx, shaftBottom + shaftH / 2, 0);
        solGroup.add(tower);
        solGroup.userData.lifts.push({ name: 'Sol tower', bottomY: shaftBottom });
        const roof = createBox(4.3, 0.28, 4.3, 0x14F195, 0.45, 0.28);
        roof.position.set(tx, shaftBottom + shaftH + 0.22, 0);
        roof.userData.viewRoof = true;
        solGroup.add(roof);
        const caplet = createBox(2.2, 0.7, 2.2, 0x34D399, 0.5, 0.3);
        caplet.position.set(tx, shaftBottom + shaftH + 0.7, 0);
        solGroup.add(caplet);
      });
      this.addBelvedere(solGroup, {
        x: 7.0, z: -7.5, rot: 0, baseY: 1.2, width: 3.2, steps: 6, rise: 0.46, run: 0.4, land: 1.4, postH: 3.2,
        mat: solStone,
        deckMat: new THREE.MeshStandardMaterial({ color: 0x064E3B, metalness: 0.6, roughness: 0.35 })
      });

      // Floating Solana Emblem Coin (Parametric WebGL 3D Minter)
      const coinGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.6, 24);
      const coinMat = new THREE.MeshStandardMaterial({ color: 0x14F195, emissive: 0x059669, metalness: 0.9, roughness: 0.1 });
      const coinMesh = new THREE.Mesh(coinGeo, coinMat);
      coinMesh.rotation.x = Math.PI / 2;
      coinMesh.position.set(0, 12, 0);
      solGroup.add(coinMesh);
      coinMesh.userData.keepMesh = true;
      solGroup.userData.animCoin = coinMesh;

      // Rotating Web3 Mint Forge Gear Base
      const gearGeo = new THREE.CylinderGeometry(4.2, 4.2, 0.45, 16);
      const gearMat = new THREE.MeshStandardMaterial({ color: 0x065F46, metalness: 0.85, roughness: 0.25 });
      const gear = new THREE.Mesh(gearGeo, gearMat);
      gear.position.set(0, 2.2, 0);
      solGroup.add(gear);
      solGroup.userData.animGear = gear;

      // Molten Emerald Crucible Reservoir
      const crucible = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 1.4, 0.9, 16),
        new THREE.MeshStandardMaterial({ color: 0x10B981, emissive: 0x059669, emissiveIntensity: 0.85, roughness: 0.1, metalness: 0.9 })
      );
      crucible.position.set(0, 2.7, 0);
      solGroup.add(crucible);

      // Solar Energy Collector Fins on East Tower
      [-1.8, 1.8].forEach(fx => {
        const fin = createBox(0.12, 1.4, 1.8, 0x34D399, 0.7, 0.3);
        fin.position.set(4.5 + fx, 18.5, 0);
        solGroup.add(fin);
      });

      // Solana Tip Satellite Transceiver Dish
      const dishGeo = new THREE.ConeGeometry(3.0, 1.2, 12, 1, true);
      const dishMat = new THREE.MeshStandardMaterial({ color: 0x6EE7B7, metalness: 0.8, roughness: 0.2, side: THREE.DoubleSide });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.rotation.x = Math.PI * 0.7;
      // Crown of the east mint tower, above the shaft so the dish is a roof, not a plaza obstacle.
      dish.position.set(4.5, 18.15, 0);
      solGroup.add(dish);

      // Point Light over Sol Crypta
      const solLight = new THREE.PointLight(0x14F195, 2.0, 60);
      solLight.position.y = 16;
      solGroup.add(solLight);

      this.placeOnSphere(solGroup, COLONY_COORDS.colony_sol_crypta.lat, COLONY_COORDS.colony_sol_crypta.lon);
      this.scene.add(solGroup);
      this.colonyGroups.colony_sol_crypta = solGroup;
      this.interactiveObjects.push(solGroup);

      // -------------------------------------------------------------
      // 4. ADYTUM HERMETICA (Northeast: 34, 48)
      // -------------------------------------------------------------
      const adytumGroup = new THREE.Group();
      adytumGroup.userData = { id: 'colony_adytum_grove', name: 'Adytum Hermetica', role: 'Northeast Ageless Wisdom Sanctum', lifts: [] };

      // Sacred Stone Plaza
      const adytumBase = createCyl(13, 13, 1.2, 24, 0x241C38, 0.3, 0.7);
      adytumBase.position.y = 0.6;
      adytumGroup.add(adytumBase);

      // Circle of 22 Tarot Stone Monoliths. Tall enough that a figure reads between them, not inside them.
      const ringRadius = 9.5;
      for (let i = 0; i < 22; i++) {
        const angle = (i / 22) * Math.PI * 2;
        const mono = createBox(0.8, 6.8, 0.4, 0x8B5CF6, 0.4, 0.5);
        mono.position.set(Math.cos(angle) * ringRadius, 4.6, Math.sin(angle) * ringRadius);
        mono.rotation.y = -angle;
        adytumGroup.add(mono);
      }

      // Sacred Mandala Floor Mosaic
      const mandalaGeo = new THREE.CylinderGeometry(6.5, 6.5, 0.04, 24);
      const mandalaMat = new THREE.MeshStandardMaterial({ color: 0x4C1D95, emissive: 0x3B0764, emissiveIntensity: 0.45, roughness: 0.4, metalness: 0.5 });
      const mandala = new THREE.Mesh(mandalaGeo, mandalaMat);
      mandala.position.y = 1.22;
      adytumGroup.add(mandala);

      // 4 Alchemical Corner Braziers
      const brazierMat = new THREE.MeshStandardMaterial({ color: 0x7E22CE, emissive: 0x581C87, metalness: 0.7, roughness: 0.3 });
      [[-8.2, -8.2], [8.2, -8.2], [8.2, 8.2], [-8.2, 8.2]].forEach(([bx, bz]) => {
        const brz = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.3, 1.6, 8), brazierMat);
        brz.position.set(bx, 1.2 + 0.8, bz);
        adytumGroup.add(brz);
        const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), new THREE.MeshBasicMaterial({ color: 0xE9D5FF }));
        flame.position.set(bx, 1.2 + 1.8, bz);
        adytumGroup.add(flame);
      });

      // Pagoda soffit stays above a standing agent, including the name plate.
      const adytumArcade = 5.6;
      [[-2.6, -2.6], [2.6, -2.6], [2.6, 2.6], [-2.6, 2.6]].forEach(([x, z]) => {
        const pillar = createCyl(0.38, 0.46, adytumArcade, 6, 0xF1F5F9, 0.35, 0.5);
        pillar.position.set(x, 1.2 + adytumArcade / 2, z);
        adytumGroup.add(pillar);
      });
      const pagodaBottom = 1.2 + adytumArcade;
      const pagodaBase = createBox(7, 3, 7, 0xF1F5F9, 0.3, 0.6);
      pagodaBase.position.y = pagodaBottom + 1.5;
      adytumGroup.add(pagodaBase);
      adytumGroup.userData.lifts.push({ name: 'Adytum pagoda', bottomY: pagodaBottom });

      const pagodaRoof = createBox(8.5, 0.45, 8.5, 0xC084FC, 0.6, 0.3);
      pagodaRoof.position.y = pagodaBottom + 3.35;
      pagodaRoof.userData.viewRoof = true;
      adytumGroup.add(pagodaRoof);
      const pagodaCap = createBox(5.2, 0.28, 5.2, 0xE9D5FF, 0.45, 0.35);
      pagodaCap.position.y = pagodaBottom + 3.85;
      adytumGroup.add(pagodaCap);
      this.addBelvedere(adytumGroup, {
        x: 9.7, z: 7.05, rot: -0.63, baseY: 1.2, width: 2.4, steps: 6, rise: 0.42, run: 0.38, land: 1.45, postH: 3.1,
        mat: new THREE.MeshStandardMaterial({ color: 0xC084FC, metalness: 0.4, roughness: 0.4 }),
        deckMat: new THREE.MeshStandardMaterial({ color: 0xF1F5F9, metalness: 0.25, roughness: 0.55 })
      });

      // Floating Amethyst Vision Crystal
      const crystalGeo = new THREE.OctahedronGeometry(2.4, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xC084FC,
        emissive: 0x6B21A8,
        roughness: 0.15,
        metalness: 0.85,
        transparent: true,
        opacity: 0.95
      });
      const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
      crystalMesh.position.set(0, pagodaBottom + 6.4, 0);
      crystalMesh.userData.keepMesh = true;
      crystalMesh.userData.hoverBase = pagodaBottom + 6.4;
      adytumGroup.add(crystalMesh);
      adytumGroup.userData.animCrystal = crystalMesh;

      // 5 Satellite Amethyst Shards orbiting the Sanctum Crystal
      const orbitShards = [];
      for (let oi = 0; oi < 5; oi++) {
        const shard = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.52, 0),
          new THREE.MeshStandardMaterial({ color: 0xD8B4FE, emissive: 0x9333EA, emissiveIntensity: 0.9, roughness: 0.15, metalness: 0.85 })
        );
        adytumGroup.add(shard);
        orbitShards.push({ mesh: shard, phase: (oi / 5) * Math.PI * 2, radius: 4.2 + (oi % 2) * 1.0, speed: 0.9 + oi * 0.15, baseY: pagodaBottom + 6.4 });
      }
      adytumGroup.userData.animOrbiters = orbitShards;

      // Point Light over Adytum
      const adytumLight = new THREE.PointLight(0x8B5CF6, 2.2, 60);
      adytumLight.position.y = 16;
      adytumGroup.add(adytumLight);

      this.placeOnSphere(adytumGroup, COLONY_COORDS.colony_adytum_grove.lat, COLONY_COORDS.colony_adytum_grove.lon);
      this.scene.add(adytumGroup);
      this.colonyGroups.colony_adytum_grove = adytumGroup;
      this.interactiveObjects.push(adytumGroup);

      // -------------------------------------------------------------
      // 5. HEXFORGE BASTION (Southwest: -32, -48)
      // -------------------------------------------------------------
      const hexGroup = new THREE.Group();
      hexGroup.userData = { id: 'colony_hex_bastion', name: 'HexForge Bastion', role: 'Southwest Security & AST Crypt', lifts: [], supports: [] };

      // Obsidian Hexagonal Fortress Base
      const hexBase = createCyl(12, 13, 1.4, 6, 0x1E1E26, 0.7, 0.3);
      hexBase.position.y = 0.7;
      hexGroup.add(hexBase);

      // Keep is lifted so a figure under it is in the open, not inside the mass.
      const hexArcade = 5.6;
      [[-2.8, -2.8], [2.8, -2.8], [2.8, 2.8], [-2.8, 2.8]].forEach(([x, z]) => {
        const pillar = createCyl(0.42, 0.5, hexArcade, 6, 0x272733, 0.7, 0.3);
        pillar.position.set(x, 1.4 + hexArcade / 2, z);
        hexGroup.add(pillar);
      });
      const keepBottom = 1.4 + hexArcade;
      const keep = createBox(8, 9, 8, 0x181820, 0.8, 0.2);
      keep.position.y = keepBottom + 4.5;
      hexGroup.add(keep);
      hexGroup.userData.lifts.push({ name: 'Hex keep', bottomY: keepBottom });
      const keepRoof = createBox(9.2, 0.36, 9.2, 0x3F3F46, 0.55, 0.3);
      keepRoof.position.y = keepBottom + 9.2;
      keepRoof.userData.viewRoof = true;
      hexGroup.add(keepRoof);

      // Lookout cabins on thin stems.
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const bX = Math.cos(angle) * 8.5;
        const bZ = Math.sin(angle) * 8.5;
        const stemH = 6.2;
        const bastion = createCyl(0.48, 0.58, stemH, 6, 0x272733, 0.7, 0.3);
        bastion.position.set(bX, 1.4 + stemH / 2, bZ);
        hexGroup.add(bastion);
        hexGroup.userData.supports.push({ x: bX, z: bZ, r: 0.7 });

        const cabin = createBox(2.05, 1.35, 2.05, 0x3F3F46, 0.45, 0.35);
        cabin.position.set(bX, 1.4 + stemH + 0.7, bZ);
        hexGroup.add(cabin);
        const lookRoof = createBox(2.55, 0.2, 2.55, 0xEF4444, 0.35, 0.3);
        lookRoof.position.set(bX, 1.4 + stemH + 1.5, bZ);
        lookRoof.userData.viewRoof = true;
        hexGroup.add(lookRoof);

        const beacon = createBox(0.55, 0.55, 0.55, 0xEF4444, 0.1, 0.1);
        beacon.position.set(bX, 1.4 + stemH + 2.05, bZ);
        hexGroup.add(beacon);
      }

      // Perimeter Forcefield Shield Ring between Bastions
      const shieldGeo = new THREE.CylinderGeometry(11.2, 12.2, 3.2, 6, 1, true);
      const shieldMat = new THREE.MeshBasicMaterial({ color: 0xEF4444, transparent: true, opacity: 0.24, wireframe: true, side: THREE.DoubleSide });
      const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
      shieldMesh.position.y = 3.2;
      hexGroup.add(shieldMesh);
      hexGroup.userData.animShield = shieldMesh;

      // Holographic Red Targeting HUD Ring above keep
      const hudGeo = new THREE.RingGeometry(2.8, 3.2, 16);
      const hudMat = new THREE.MeshBasicMaterial({ color: 0xEF4444, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
      const hudMesh = new THREE.Mesh(hudGeo, hudMat);
      hudMesh.rotation.x = Math.PI / 2;
      hudMesh.position.y = keepBottom + 11.2;
      hexGroup.add(hudMesh);
      hexGroup.userData.animHud = hudMesh;

      this.addBelvedere(hexGroup, {
        x: 6.2, z: -4.2, rot: Math.PI / 2, baseY: 1.4, width: 2.8, steps: 5, rise: 0.48, run: 0.4, land: 1.45, postH: 3.2,
        mat: new THREE.MeshStandardMaterial({ color: 0xEF4444, metalness: 0.4, roughness: 0.38 }),
        deckMat: new THREE.MeshStandardMaterial({ color: 0x181820, metalness: 0.7, roughness: 0.3 })
      });

      // Rotating Security Radar Array
      const radar = createBox(4.5, 0.5, 1.0, 0xEF4444, 0.4, 0.3);
      radar.position.set(0, keepBottom + 9.7, 0);
      hexGroup.add(radar);
      radar.userData.keepMesh = true;
      hexGroup.userData.animRadar = radar;

      // Point Light over HexForge
      const hexLight = new THREE.PointLight(0xEF4444, 2.0, 60);
      hexLight.position.y = 16;
      hexGroup.add(hexLight);

      this.placeOnSphere(hexGroup, COLONY_COORDS.colony_hex_bastion.lat, COLONY_COORDS.colony_hex_bastion.lon);
      this.scene.add(hexGroup);
      this.colonyGroups.colony_hex_bastion = hexGroup;
      this.interactiveObjects.push(hexGroup);
    }

    // -----------------------------------------------------------------
    // 3D HOLOGRAPHIC COLONY BEACONS & LIGHT PILLARS
    // -----------------------------------------------------------------
    buildColonyBeacons() {
      const BEACON_INFO = {
        colony_capital:      { title: "CAPITAL CITADEL", subtitle: "SEAT OF GOVERNANCE • MONAD", color: "#F59E0B", hex: 0xF59E0B, icon: "🏛️" },
        colony_nova_zoth:    { title: "NOVA ZOTH",       subtitle: "QUANTUM AI R&D • SERVERS",   color: "#06B6D4", hex: 0x06B6D4, icon: "🌊" },
        colony_sol_crypta:   { title: "SOL CRYPTA",      subtitle: "WEB3 FORGE • SOLANA & SOLANA_TIP", color: "#14F195", hex: 0x14F195, icon: "⚡" },
        colony_adytum_grove: { title: "ADYTUM HERMETICA",subtitle: "22 TAROT ARCANA • SANCTUM",  color: "#C084FC", hex: 0x8B5CF6, icon: "🔮" },
        colony_hex_bastion:  { title: "HEXFORGE BASTION",subtitle: "DEFENSE BASTION • SECURITY", color: "#F87171", hex: 0xEF4444, icon: "🛡️" }
      };

      Object.keys(BEACON_INFO).forEach(colKey => {
        const info = BEACON_INFO[colKey];
        const group = this.colonyGroups[colKey];
        if (!group) return;

        // 1. Vertical Prana Ion Beam (Tapered glowing cylinder)
        const beamGeo = new THREE.CylinderGeometry(0.35, 1.4, 22, 10, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
          color: info.hex,
          transparent: true,
          opacity: 0.28,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        beamMesh.position.y = 11;
        group.add(beamMesh);

        // 2. High-Tech Holographic Billboard Badge
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Background Glass Pill
        ctx.fillStyle = 'rgba(10, 14, 24, 0.90)';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(10, 10, 492, 108, 16);
        } else {
          ctx.rect(10, 10, 492, 108);
        }
        ctx.fill();

        // Neon Glow Border
        ctx.lineWidth = 4;
        ctx.strokeStyle = info.color;
        ctx.stroke();

        // Icon + Title
        ctx.font = 'bold 34px "JetBrains Mono", "Noto Sans Symbols", "Noto Sans Symbols 2", "Noto Color Emoji", monospace';
        ctx.fillStyle = info.color;
        ctx.fillText(`${info.icon} ${info.title}`, 26, 56);

        // Subtitle
        ctx.font = '600 20px "JetBrains Mono", "Noto Sans Symbols", "Noto Sans Symbols 2", "Noto Color Emoji", monospace';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(info.subtitle, 28, 94);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;

        const spriteMat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          opacity: 0.92,
          depthTest: true
        });

        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(11, 2.75, 1);
        sprite.position.y = 18;
        group.add(sprite);

        this.beaconSprites[colKey] = { sprite, beamMesh, baseY: 23 };
      });
    }

    // -----------------------------------------------------------------
    // VOLUMETRIC ATMOSPHERIC CLOUD LAYER
    // -----------------------------------------------------------------
    buildAtmosphericClouds() {
      this.cloudLayer = new THREE.Group();
      const cloudMat = new THREE.MeshPhongMaterial({
        color: 0xEEF6FF,
        transparent: true,
        opacity: 0.42,
        flatShading: true,
        depthWrite: false,
        shininess: 4
      });
      const puffGeo = new THREE.SphereGeometry(1, 6, 5);
      const pieces = [];

      // 32 low-poly clusters, baked into one mesh so the globe is not 100 extra draws.
      for (let i = 0; i < 32; i++) {
        const cluster = new THREE.Group();
        const puffCount = 3 + Math.floor(Math.random() * 3);
        for (let p = 0; p < puffCount; p++) {
          const puff = new THREE.Mesh(puffGeo);
          puff.scale.set(2.4 + Math.random() * 2.8, 0.9 + Math.random() * 0.8, 2.0 + Math.random() * 2.2);
          puff.position.set((p - 1.2) * 2.1, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 1.5);
          cluster.add(puff);
        }
        const lat = (Math.random() * 120) - 60;
        const lon = (Math.random() * 360) - 180;
        this.placeOnSphere(cluster, lat, lon, 4.5);
        cluster.updateMatrixWorld(true);
        cluster.traverse((obj) => {
          if (!obj.isMesh) return;
          const baked = obj.geometry.clone();
          baked.applyMatrix4(obj.matrixWorld);
          pieces.push(baked);
        });
      }

      const merged = this.mergeGeometries(pieces);
      pieces.forEach((geo) => geo.dispose());
      const clouds = new THREE.Mesh(merged, cloudMat);
      clouds.userData.keepMesh = true;
      clouds.frustumCulled = false;
      this.cloudLayer.add(clouds);
      this.scene.add(this.cloudLayer);
    }

    // -----------------------------------------------------------------
    // POLAR AURORAS (NORTHERN & SOUTHERN LIGHTS)
    // -----------------------------------------------------------------
    buildPolarAuroras() {
      this.auroraGroup = new THREE.Group();

      const makeAuroraRing = (lat, colorHex) => {
        const ringGeo = new THREE.TorusGeometry(18, 1.4, 6, 36);
        const ringMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.38,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          wireframe: true
        });
        const mesh = new THREE.Mesh(ringGeo, ringMat);
        this.placeOnSphere(mesh, lat, 0, 1.5);
        return mesh;
      };

      this.northAurora = makeAuroraRing(84, 0x10B981); // Emerald Northern Lights
      this.southAurora = makeAuroraRing(-84, 0xC084FC); // Amethyst Southern Lights
      this.auroraGroup.add(this.northAurora);
      this.auroraGroup.add(this.southAurora);

      this.scene.add(this.auroraGroup);
    }

    // -----------------------------------------------------------------
    // LIVE 3D AGENT SPEECH BUBBLES
    // -----------------------------------------------------------------
    spawnSpeechBubble(senderName, text) {
      if (!text || !senderName) return;

      let targetSprite = null;
      let targetId = null;

      for (const [id, s] of Object.entries(this.agentEntities)) {
        if (s.userData.agent && s.userData.agent.name && s.userData.agent.name.toLowerCase() === senderName.toLowerCase()) {
          targetSprite = s;
          targetId = id;
          break;
        }
      }
      if (!targetSprite) {
        for (const [id, s] of Object.entries(this.subagentEntities)) {
          if (s.userData.agent && s.userData.agent.name && s.userData.agent.name.toLowerCase() === senderName.toLowerCase()) {
            targetSprite = s;
            targetId = id;
            break;
          }
        }
      }
      if (!targetSprite) {
        for (const [id, s] of Object.entries(this.agentSprites)) {
          if (s.userData.agent && s.userData.agent.name && s.userData.agent.name.toLowerCase() === senderName.toLowerCase()) {
            targetSprite = s;
            targetId = id;
            break;
          }
        }
      }
      if (!targetSprite) return;

      // Remove existing bubble for this agent
      this.speechBubbles = this.speechBubbles.filter(b => {
        if (b.agentId === targetId) {
          this.scene.remove(b.sprite);
          if (b.sprite.material.map) b.sprite.material.map.dispose();
          b.sprite.material.dispose();
          return false;
        }
        return true;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 440;
      canvas.height = 140;
      const ctx = canvas.getContext('2d');

      // Balloon Background
      ctx.fillStyle = 'rgba(10, 18, 22, 0.94)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(8, 8, 424, 100, 14);
      } else {
        ctx.rect(8, 8, 424, 100);
      }
      ctx.fill();

      // Border
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#10B981';
      ctx.stroke();

      // Downward pointer
      ctx.beginPath();
      ctx.moveTo(210, 108);
      ctx.lineTo(220, 130);
      ctx.lineTo(230, 108);
      ctx.fillStyle = 'rgba(10, 18, 22, 0.94)';
      ctx.fill();
      ctx.strokeStyle = '#10B981';
      ctx.stroke();

      // Header
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 22px "JetBrains Mono", "Noto Sans Symbols", "Noto Sans Symbols 2", "Noto Color Emoji", monospace';
      ctx.fillText(`🗣️ ${senderName.toUpperCase()}`, 20, 40);

      // Text line
      ctx.fillStyle = '#F3F4F6';
      ctx.font = '16px "JetBrains Mono", "Noto Sans Symbols", "Noto Sans Symbols 2", "Noto Color Emoji", monospace';
      const clean = text.replace(/<[^>]*>?/gm, '').trim();
      const line1 = clean.length > 38 ? clean.substring(0, 36) + '...' : clean;
      ctx.fillText(line1, 20, 75);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.96,
        depthTest: true
      });
      const bubbleSprite = new THREE.Sprite(spriteMat);
      bubbleSprite.scale.set(6.5, 2.2, 1);

      // Position directly above agent head (elevated along surface normal)
      const normal = targetSprite.position.clone().normalize();
      bubbleSprite.position.copy(targetSprite.position).add(normal.multiplyScalar(6.5));
      this.scene.add(bubbleSprite);

      this.speechBubbles.push({
        agentId: targetId,
        sprite: bubbleSprite,
        spawnTime: performance.now(),
        duration: 4500,
        normal: normal,
        basePos: bubbleSprite.position.clone()
      });
    }

    // 3D Curved Trade Highways connecting Capital Citadel to Outposts
    buildTradeHighways() {
      ['colony_nova_zoth', 'colony_sol_crypta', 'colony_adytum_grove', 'colony_hex_bastion'].forEach((key) => {
        this.addTradeArc('colony_capital', key);
      });
    }

    addTradeArc(fromKey, toKey) {
      const fromCoord = COLONY_COORDS[fromKey];
      const toCoord = COLONY_COORDS[toKey];
      if (!fromCoord || !toCoord) return;
      const fromPos = this.latLonToVec3(fromCoord.lat, fromCoord.lon, PLANET_RADIUS);
      const toPos = this.latLonToVec3(toCoord.lat, toCoord.lon, PLANET_RADIUS);
      const midPoint = new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5);
      midPoint.normalize().multiplyScalar(PLANET_RADIUS + 8);
      const curve = new THREE.QuadraticBezierCurve3(fromPos, midPoint, toPos);
      const highwayGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(36));
      const highwayMat = new THREE.LineDashedMaterial({
        color: toCoord.color || 0xF59E0B,
        dashSize: 3,
        gapSize: 2,
        linewidth: 2,
        transparent: true,
        opacity: 0.75
      });
      const highwayLine = new THREE.Line(highwayGeo, highwayMat);
      highwayLine.computeLineDistances();
      this.scene.add(highwayLine);
      this.highwayLines.push(highwayLine);
      for (let i = 0; i < 2; i++) {
        const courierMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.85, 8, 8),
          new THREE.MeshBasicMaterial({ color: toCoord.color || 0xFDE68A })
        );
        this.scene.add(courierMesh);
        this.courierParticles.push({
          mesh: courierMesh,
          curve,
          progress: (i * 0.5 + Math.random() * 0.2) % 1.0,
          speed: 0.15 + Math.random() * 0.08
        });
      }
    }

    // Shared cached geometries for realistic articulated 3D humanoid characters
    ensureCharacterGeos() {
      if (this._charGeos) return this._charGeos;
      this._charGeos = {
        thigh: new THREE.CylinderGeometry(0.11, 0.09, 0.42, 10),
        knee: new THREE.SphereGeometry(0.088, 8, 8),
        shin: new THREE.CylinderGeometry(0.088, 0.072, 0.38, 10),
        boot: new THREE.BoxGeometry(0.16, 0.12, 0.28),
        skirt: new THREE.CylinderGeometry(0.25, 0.43, 0.56, 14),
        pelvis: new THREE.CylinderGeometry(0.24, 0.25, 0.24, 12),
        belt: new THREE.CylinderGeometry(0.265, 0.265, 0.10, 14),
        buckle: new THREE.BoxGeometry(0.16, 0.14, 0.08),
        torso: new THREE.CylinderGeometry(0.32, 0.24, 0.72, 14),
        chestTrim: new THREE.BoxGeometry(0.38, 0.42, 0.12),
        collar: new THREE.TorusGeometry(0.23, 0.055, 8, 16),
        cape: new THREE.BoxGeometry(0.62, 1.22, 0.045),
        pauldron: new THREE.SphereGeometry(0.135, 10, 8),
        upperArm: new THREE.CylinderGeometry(0.09, 0.076, 0.38, 10),
        forearm: new THREE.CylinderGeometry(0.078, 0.064, 0.34, 10),
        hand: new THREE.SphereGeometry(0.072, 8, 8),
        neck: new THREE.CylinderGeometry(0.105, 0.125, 0.18, 10),
        head: new THREE.SphereGeometry(0.27, 18, 16),
        nose: new THREE.ConeGeometry(0.038, 0.11, 6),
        eyeWhite: new THREE.SphereGeometry(0.042, 8, 8),
        eyeIris: new THREE.SphereGeometry(0.024, 8, 8),
        brow: new THREE.BoxGeometry(0.10, 0.026, 0.04),
        visor: new THREE.BoxGeometry(0.38, 0.09, 0.09),
        crownBase: new THREE.CylinderGeometry(0.26, 0.24, 0.14, 12),
        crownSpire: new THREE.ConeGeometry(0.24, 0.32, 6),
        hood: new THREE.SphereGeometry(0.31, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.72),
        helmCrest: new THREE.BoxGeometry(0.07, 0.22, 0.44),
        hairCap: new THREE.SphereGeometry(0.285, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
        staffShaft: new THREE.CylinderGeometry(0.028, 0.024, 1.95, 8),
        staffOrb: new THREE.OctahedronGeometry(0.14, 1),
        staffRing: new THREE.TorusGeometry(0.20, 0.022, 6, 16),
        blade: new THREE.BoxGeometry(0.04, 0.85, 0.11),
        hilt: new THREE.BoxGeometry(0.24, 0.05, 0.08),
        tome: new THREE.BoxGeometry(0.24, 0.30, 0.08)
      };
      return this._charGeos;
    }

    // Grounded articulated 3D humanoid figure. Feet at local origin, face/chest on local -z so facing matches travel.
    createAgentEntity(agent, isSubagent = false) {
      const geos = this.ensureCharacterGeos();
      const isLeader = agent.id === this.civState.currentLeader || agent.isLeader;
      const gen = agent.generation !== undefined ? agent.generation : 0;
      let robe;
      try { robe = new THREE.Color(agent.color || '#F59E0B'); }
      catch (err) { robe = new THREE.Color('#F59E0B'); }

      // Deterministic seed per agent for realistic skin tone, posture & gear variation
      const nameStr = String(agent.id || agent.name || 'AGENT');
      let hash = 0;
      for (let c = 0; c < nameStr.length; c++) hash = ((hash << 5) - hash + nameStr.charCodeAt(c)) | 0;
      const absHash = Math.abs(hash);

      const skinPalette = [0xf5d4b8, 0xe8be9e, 0xd8a37e, 0xc48a64, 0x9f6847, 0xf7dfc8];
      const hairPalette = [0x1c1917, 0x3f271d, 0xd97706, 0xe2e8f0, 0x7c2d12, 0x0f172a];
      const skinHex = skinPalette[absHash % skinPalette.length];
      const hairHex = hairPalette[(absHash >> 3) % hairPalette.length];

      const group = new THREE.Group();
      const figure = new THREE.Group();
      figure.rotation.y = Math.PI;
      figure.userData.keepMesh = true;

      const shadow = new THREE.Mesh(this.sharedShadowGeo, this.sharedShadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.05;
      group.add(shadow);

      // Physically-based realistic cloth, leather, skin, and metallic trim materials
      const darkRobe = robe.clone().multiplyScalar(0.38);
      const cloth = new THREE.MeshStandardMaterial({
        color: robe,
        roughness: 0.62,
        metalness: 0.14,
        emissive: robe.clone().multiplyScalar(0.12)
      });
      const underCloth = new THREE.MeshStandardMaterial({
        color: darkRobe,
        roughness: 0.72,
        metalness: 0.08
      });
      const skin = new THREE.MeshStandardMaterial({
        color: skinHex,
        roughness: 0.52,
        metalness: 0.03
      });
      const hairMat = new THREE.MeshStandardMaterial({
        color: hairHex,
        roughness: 0.68,
        metalness: 0.08
      });
      const bootLeather = new THREE.MeshStandardMaterial({
        color: 0x1e1b18,
        roughness: 0.48,
        metalness: 0.22
      });
      const trimColor = isLeader ? new THREE.Color(0xfbbf24) : (isSubagent ? new THREE.Color(gen === 1 ? 0x38bdf8 : 0xc084fc) : robe.clone().lerp(new THREE.Color(0xfde68a), 0.55));
      const trim = new THREE.MeshStandardMaterial({
        color: trimColor,
        emissive: trimColor.clone().multiplyScalar(isLeader ? 0.42 : 0.22),
        roughness: 0.26,
        metalness: 0.78
      });
      const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
      const eyeIrisMat = new THREE.MeshBasicMaterial({ color: isLeader ? 0xfbbf24 : 0x38bdf8 });

      // 1. Articulated Left & Right Legs (Hip pivots at y = 0.84)
      const makeLeg = (sideSign) => {
        const hipPivot = new THREE.Group();
        hipPivot.position.set(sideSign * 0.145, 0.84, 0);
        hipPivot.userData.keepMesh = true;

        const thigh = new THREE.Mesh(geos.thigh, underCloth);
        thigh.position.y = -0.21;
        thigh.userData.keepMesh = true;

        const knee = new THREE.Mesh(geos.knee, trim);
        knee.position.y = -0.42;
        knee.userData.keepMesh = true;

        const shin = new THREE.Mesh(geos.shin, bootLeather);
        shin.position.y = -0.61;
        shin.userData.keepMesh = true;

        const boot = new THREE.Mesh(geos.boot, bootLeather);
        boot.position.set(0, -0.78, -0.05);
        boot.userData.keepMesh = true;

        hipPivot.add(thigh, knee, shin, boot);
        return hipPivot;
      };
      const leftLegPivot = makeLeg(-1);
      const rightLegPivot = makeLeg(1);
      figure.add(leftLegPivot, rightLegPivot);

      // 2. Lower Robe Skirt, Pelvis, Belt & Golden Buckle
      const skirt = new THREE.Mesh(geos.skirt, cloth);
      skirt.position.y = 0.62;
      skirt.userData.keepMesh = true;

      const pelvis = new THREE.Mesh(geos.pelvis, underCloth);
      pelvis.position.y = 0.92;
      pelvis.userData.keepMesh = true;

      const belt = new THREE.Mesh(geos.belt, bootLeather);
      belt.position.y = 1.02;
      belt.userData.keepMesh = true;

      const buckle = new THREE.Mesh(geos.buckle, trim);
      buckle.position.set(0, 1.02, -0.25);
      buckle.userData.keepMesh = true;

      // 3. Sculpted Upper Torso, Chest Cuirass & Mantle Collar
      const torso = new THREE.Mesh(geos.torso, cloth);
      torso.position.y = 1.42;
      torso.scale.set(1.08, 1.0, 0.78); // Anatomical broader chest width vs depth
      torso.userData.keepMesh = true;

      const chestTrim = new THREE.Mesh(geos.chestTrim, trim);
      chestTrim.position.set(0, 1.46, -0.16);
      chestTrim.userData.keepMesh = true;

      const collar = new THREE.Mesh(geos.collar, trim);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 1.78;
      collar.userData.keepMesh = true;

      // 4. Flowing Rear Cape / Cloak (Pivoted at upper back y = 1.74, z = +0.18)
      const capePivot = new THREE.Group();
      capePivot.position.set(0, 1.74, 0.18);
      capePivot.rotation.x = 0.15;
      capePivot.userData.keepMesh = true;
      const capeMesh = new THREE.Mesh(geos.cape, underCloth);
      capeMesh.position.set(0, -0.58, 0.04);
      capeMesh.userData.keepMesh = true;
      capePivot.add(capeMesh);

      figure.add(skirt, pelvis, belt, buckle, torso, chestTrim, collar, capePivot);

      // 5. Articulated Left & Right Arms (Shoulder pivots at y = 1.68, x = ±0.36)
      const makeArm = (sideSign) => {
        const shoulderPivot = new THREE.Group();
        shoulderPivot.position.set(sideSign * 0.36, 1.68, 0);
        shoulderPivot.userData.keepMesh = true;

        const pauldron = new THREE.Mesh(geos.pauldron, trim);
        pauldron.scale.set(1.15, 0.85, 1.05);
        pauldron.userData.keepMesh = true;

        const upperArm = new THREE.Mesh(geos.upperArm, cloth);
        upperArm.position.y = -0.20;
        upperArm.userData.keepMesh = true;

        const forearm = new THREE.Mesh(geos.forearm, trim);
        forearm.position.set(0, -0.50, -0.04);
        forearm.rotation.x = 0.18; // Slight natural elbow bend forward (-z)
        forearm.userData.keepMesh = true;

        const hand = new THREE.Mesh(geos.hand, skin);
        hand.position.set(0, -0.68, -0.09);
        hand.userData.keepMesh = true;

        shoulderPivot.add(pauldron, upperArm, forearm, hand);
        return shoulderPivot;
      };
      const leftArmPivot = makeArm(-1);
      const rightArmPivot = makeArm(1);
      figure.add(leftArmPivot, rightArmPivot);

      // 6. Signature Role Implement in Right/Left Hand
      const cadreStr = String(agent.cadre || agent.role || '').toLowerCase();
      const lodParts = [chestTrim, collar, capePivot];
      if (isLeader || cadreStr.includes('pantheon') || cadreStr.includes('hermetic') || cadreStr.includes('adytum') || absHash % 3 === 0) {
        // Hermetic Solar Staff held in right hand
        const staffGroup = new THREE.Group();
        staffGroup.position.set(0, -0.62, -0.14);
        staffGroup.rotation.x = -0.22; // Held upright while arm swings
        staffGroup.userData.keepMesh = true;

        const shaft = new THREE.Mesh(geos.staffShaft, trim);
        shaft.position.y = 0.35;
        shaft.userData.keepMesh = true;

        const orb = new THREE.Mesh(geos.staffOrb, new THREE.MeshBasicMaterial({ color: isLeader ? 0xfef08a : 0x38bdf8 }));
        orb.position.y = 1.38;
        orb.userData.keepMesh = true;

        const sRing = new THREE.Mesh(geos.staffRing, trim);
        sRing.position.y = 1.38;
        sRing.userData.keepMesh = true;

        staffGroup.add(shaft, orb, sRing);
        rightArmPivot.add(staffGroup);
        lodParts.push(staffGroup);
      } else if (cadreStr.includes('sec') || cadreStr.includes('sentinel') || cadreStr.includes('hex') || absHash % 3 === 1) {
        // Sentinel Energy Blade in right hand
        const swordGroup = new THREE.Group();
        swordGroup.position.set(0, -0.68, -0.18);
        swordGroup.rotation.x = -Math.PI / 3;
        swordGroup.userData.keepMesh = true;
        const hilt = new THREE.Mesh(geos.hilt, trim);
        hilt.userData.keepMesh = true;
        const blade = new THREE.Mesh(geos.blade, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        blade.position.y = 0.45;
        blade.userData.keepMesh = true;
        swordGroup.add(hilt, blade);
        rightArmPivot.add(swordGroup);
        lodParts.push(swordGroup);
      } else {
        // Illuminated Grimoire / Arcane Tome in left hand
        const tomeMesh = new THREE.Mesh(geos.tome, trim);
        tomeMesh.position.set(-0.04, -0.64, -0.18);
        tomeMesh.rotation.set(0.4, 0.2, 0);
        tomeMesh.userData.keepMesh = true;
        leftArmPivot.add(tomeMesh);
        lodParts.push(tomeMesh);
      }

      // 7. Sculpted Head, Neck, Facial Features & Headgear (Head group at y = 1.84)
      const headGroup = new THREE.Group();
      headGroup.position.y = 1.84;
      headGroup.userData.keepMesh = true;

      const neck = new THREE.Mesh(geos.neck, skin);
      neck.position.y = 0.08;
      neck.userData.keepMesh = true;

      const head = new THREE.Mesh(geos.head, skin);
      head.position.y = 0.34;
      head.scale.set(0.94, 1.06, 0.96); // Natural cranial proportions
      head.userData.keepMesh = true;

      // Sculpted Nose & Brow on -z (front face)
      const nose = new THREE.Mesh(geos.nose, skin);
      nose.position.set(0, 0.33, -0.26);
      nose.rotation.x = -Math.PI / 2;
      nose.userData.keepMesh = true;

      const leftEyeW = new THREE.Mesh(geos.eyeWhite, eyeWhiteMat);
      leftEyeW.position.set(-0.095, 0.37, -0.235);
      leftEyeW.userData.keepMesh = true;
      const rightEyeW = new THREE.Mesh(geos.eyeWhite, eyeWhiteMat);
      rightEyeW.position.set(0.095, 0.37, -0.235);
      rightEyeW.userData.keepMesh = true;

      const leftIris = new THREE.Mesh(geos.eyeIris, eyeIrisMat);
      leftIris.position.set(-0.095, 0.37, -0.262);
      leftIris.userData.keepMesh = true;
      const rightIris = new THREE.Mesh(geos.eyeIris, eyeIrisMat);
      rightIris.position.set(0.095, 0.37, -0.262);
      rightIris.userData.keepMesh = true;

      const leftBrow = new THREE.Mesh(geos.brow, hairMat);
      leftBrow.position.set(-0.095, 0.425, -0.245);
      leftBrow.rotation.z = -0.08;
      leftBrow.userData.keepMesh = true;
      const rightBrow = new THREE.Mesh(geos.brow, hairMat);
      rightBrow.position.set(0.095, 0.425, -0.245);
      rightBrow.rotation.z = 0.08;
      rightBrow.userData.keepMesh = true;

      headGroup.add(neck, head, nose, leftEyeW, rightEyeW, leftIris, rightIris, leftBrow, rightBrow);
      lodParts.push(nose, leftEyeW, rightEyeW, leftIris, rightIris, leftBrow, rightBrow);

      // Archetype Headgear (Crown, Hood, Tactical Helm, or Hair + Diadem)
      if (isLeader) {
        const crownBase = new THREE.Mesh(geos.crownBase, trim);
        crownBase.position.y = 0.56;
        crownBase.userData.keepMesh = true;
        const crownSpire = new THREE.Mesh(geos.crownSpire, trim);
        crownSpire.position.y = 0.72;
        crownSpire.userData.keepMesh = true;
        headGroup.add(crownBase, crownSpire);
        lodParts.push(crownBase, crownSpire);
      } else if (cadreStr.includes('sec') || cadreStr.includes('hex') || isSubagent) {
        const visor = new THREE.Mesh(geos.visor, trim);
        visor.position.set(0, 0.37, -0.24);
        visor.userData.keepMesh = true;
        const crest = new THREE.Mesh(geos.helmCrest, trim);
        crest.position.set(0, 0.58, 0);
        crest.userData.keepMesh = true;
        headGroup.add(visor, crest);
        lodParts.push(visor, crest);
      } else if (absHash % 2 === 0) {
        const hood = new THREE.Mesh(geos.hood, cloth);
        hood.position.y = 0.36;
        hood.rotation.x = -0.18;
        hood.userData.keepMesh = true;
        headGroup.add(hood);
        lodParts.push(hood);
      } else {
        const hairCap = new THREE.Mesh(geos.hairCap, hairMat);
        hairCap.position.y = 0.37;
        hairCap.rotation.x = -0.22;
        hairCap.userData.keepMesh = true;
        const diadem = new THREE.Mesh(geos.crownBase, trim);
        diadem.scale.set(0.98, 0.45, 0.98);
        diadem.position.y = 0.50;
        diadem.userData.keepMesh = true;
        headGroup.add(hairCap, diadem);
        lodParts.push(hairCap, diadem);
      }

      figure.add(headGroup);
      group.add(figure);

      // 8. High-Contrast Floating Glassmorphic Nameplate Badge
      const label = document.createElement('canvas');
      label.width = 320;
      label.height = 84;
      const lctx = label.getContext('2d');
      lctx.clearRect(0, 0, 320, 84);
      // Dark glassmorphic pill background with gold rim
      lctx.fillStyle = 'rgba(7, 11, 20, 0.84)';
      lctx.strokeStyle = isLeader ? 'rgba(251, 191, 36, 0.92)' : 'rgba(148, 163, 184, 0.55)';
      lctx.lineWidth = 2.5;
      lctx.beginPath();
      if (lctx.roundRect) lctx.roundRect(6, 6, 308, 72, 18);
      else lctx.rect(6, 6, 308, 72);
      lctx.fill();
      lctx.stroke();

      lctx.font = '700 28px system-ui, -apple-system, sans-serif';
      lctx.textAlign = 'center';
      lctx.fillStyle = isLeader ? '#FDE68A' : '#F8FAFC';
      const short = (agent.name || 'Agent').split('-')[0];
      lctx.fillText(short, 160, 38);
      lctx.font = '600 18px monospace';
      lctx.fillStyle = isSubagent ? '#38BDF8' : '#34D399';
      const roleTag = isSubagent ? `SUBAGENT · G${gen}` : `KEY ${agent.adytumKey !== undefined ? agent.adytumKey : 0} · ${(agent.cadre || 'PANTHEON').toUpperCase().slice(0, 10)}`;
      lctx.fillText(roleTag, 160, 64);

      const labelTex = new THREE.CanvasTexture(label);
      labelTex.minFilter = THREE.LinearFilter;
      const nameSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthWrite: false }));
      nameSprite.position.y = 3.05;
      nameSprite.scale.set(2.45, 0.64, 1);
      group.add(nameSprite);
      lodParts.push(nameSprite);

      if (agent.pet) {
        const petCanvas = document.createElement('canvas');
        petCanvas.width = 64;
        petCanvas.height = 64;
        const pctx = petCanvas.getContext('2d');
        pctx.font = '48px "Noto Color Emoji", "Noto Sans Symbols", "Noto Sans Symbols 2", sans-serif';
        pctx.textAlign = 'center';
        pctx.fillText(agent.pet, 32, 48);
        const petSprite = new THREE.Sprite(new THREE.SpriteMaterial({
          map: new THREE.CanvasTexture(petCanvas),
          transparent: true,
          depthWrite: false
        }));
        petSprite.position.set(0.95, 1.25, 0);
        petSprite.scale.set(1.05, 1.05, 1);
        group.add(petSprite);
        lodParts.push(petSprite);
      }

      // Sacred Adytum Meditation / Pilgrimage Aura Ring (placed on ground, visible when meditating / pilgrimage)
      const auraRingGeo = new THREE.RingGeometry(2.2, 3.2, 24);
      const auraRingMat = new THREE.MeshBasicMaterial({
        color: 0x8B5CF6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const auraRing = new THREE.Mesh(auraRingGeo, auraRingMat);
      auraRing.rotation.x = -Math.PI / 2;
      auraRing.position.y = 0.08;
      auraRing.visible = false;
      group.add(auraRing);

      // Seniority / Generation Scale
      const selectRing = new THREE.Mesh(
        new THREE.RingGeometry(1.35, 1.6, 28),
        new THREE.MeshBasicMaterial({ color: 0xfde68a, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthWrite: false })
      );
      selectRing.rotation.x = -Math.PI / 2;
      selectRing.position.y = 0.12;
      selectRing.visible = false;
      group.add(selectRing);

      const scaleMultiplier = isSubagent ? (gen === 1 ? 1.15 : 1.0) : (isLeader ? 1.55 : 1.35);
      group.scale.setScalar(scaleMultiplier);

      group.userData = {
        agent,
        isSubagent,
        bodyMesh: figure,
        shadowMesh: shadow,
        auraRing,
        selectRing,
        billboard: false,
        walkState: null,
        lodParts,
        rig: {
          leftLeg: leftLegPivot,
          rightLeg: rightLegPivot,
          leftArm: leftArmPivot,
          rightArm: rightArmPivot,
          cape: capePivot,
          head: headGroup,
          phaseOffset: (absHash % 100) * 0.0628
        }
      };
      this.applyDetailToEntity(group);

      return group;
    }

    createAgentSprite(agent, isSubagent = false) {
      return this.createAgentEntity(agent, isSubagent);
    }

    // Update Grounded Agents on the Sphere Surface (Realistic Waypoints & Ground Walking)
    updateAgentsOnSphere() {
      if (!this.agents || this.agents.length === 0) return;

      const colonyRoster = {};
      Object.keys(COLONY_COORDS).forEach((key) => { colonyRoster[key] = []; });
      if (!colonyRoster.colony_capital) colonyRoster.colony_capital = [];

      this.agents.forEach((ag, idx) => {
        const colKey = ag.colonyId || (idx % 2 === 0 ? 'colony_capital' : (idx % 3 === 0 ? 'colony_nova_zoth' : 'colony_capital'));
        if (!colonyRoster[colKey]) colonyRoster[colKey] = [];
        colonyRoster[colKey].push(ag);
      });

      // Position primary pantheon agents along town roads & plazas
      Object.keys(colonyRoster).forEach(colKey => {
        const roster = colonyRoster[colKey];
        const waypoints = this.routeFor(colKey);
        const resolvedKey = COLONY_WAYPOINTS[colKey] === waypoints ? colKey : 'colony_capital';

        roster.forEach((ag, idx) => {
          let entity = this.agentEntities[ag.id];
          if (!entity) {
            entity = this.createAgentEntity(ag, false);
            this.scene.add(entity);
            this.agentEntities[ag.id] = entity;
            this.agentSprites[ag.id] = entity;
            this.interactiveObjects.push(entity);

            const startIdx = idx % waypoints.length;
            const nextIdx = waypoints.length > 1 ? (startIdx + 1) % waypoints.length : 0;
            const startProgress = ((idx * 0.27) % 0.8) + 0.1;
            this.beginRoute(entity, resolvedKey, startIdx, nextIdx, startProgress, 0.06 + ((idx % 4) * 0.015));
          } else {
            entity.userData.agent = ag;
            const ws = entity.userData.walkState;
            if (ws) {
              if (ag.state === 'WALKING_TO_ADYTUM') {
                if (ws.colonyKey !== 'colony_adytum_grove' && !ws.isPilgrimage) {
                  ws.isPilgrimage = true;
                  ws.targetColonyKey = 'colony_adytum_grove';
                  ws.pilgrimStartLat = ws.curLat !== undefined ? ws.curLat : (COLONY_COORDS[ws.colonyKey] || COLONY_COORDS.colony_capital).lat;
                  ws.pilgrimStartLon = ws.curLon !== undefined ? ws.curLon : (COLONY_COORDS[ws.colonyKey] || COLONY_COORDS.colony_capital).lon;
                  ws.pilgrimProgress = 0;
                }
              } else if (ag.state === 'MEDITATING_ADYTUM' || ag.state === 'CONTEMPLATING_ADYTUM') {
                ws.isPilgrimage = false;
                ws.colonyKey = 'colony_adytum_grove';
                ws.isMeditating = true;
              } else if (ws.isMeditating && ag.state !== 'MEDITATING_ADYTUM' && ag.state !== 'CONTEMPLATING_ADYTUM') {
                ws.isMeditating = false;
                ws.colonyKey = 'colony_adytum_grove';
                ws.progress = 0;
                this.bindRoute(ws);
              }
            }
          }
        });
      });

      // Position Subagents (Gen 1 & Gen 2) along colony paths
      if (this.lineage && this.lineage.subagents) {
        this.lineage.subagents.forEach((sub, idx) => {
          let entity = this.subagentEntities[sub.id];
          if (!entity) {
            entity = this.createAgentEntity(sub, true);
            this.scene.add(entity);
            this.subagentEntities[sub.id] = entity;
            this.subagentSprites[sub.id] = entity;
            this.interactiveObjects.push(entity);

            if (sub.post === 'station') {
              const home = COLONY_COORDS[sub.colonyId] || COLONY_COORDS.colony_capital;
              entity.userData.walkState = {
                colonyKey: sub.colonyId || 'colony_capital',
                currentIdx: 0,
                targetIdx: 0,
                progress: 0,
                speed: 0,
                bobTick: 0,
                isIdle: true,
                idleTimer: 1e9,
                posted: true
              };
              this.placeOnSphere(entity, home.lat, home.lon, 0.2);
              this.pinStationKeeper(entity);
            } else {
              const requestedKey = sub.colonyId || 'colony_capital';
              const waypoints = this.routeFor(requestedKey);
              const targetColonyKey = COLONY_WAYPOINTS[requestedKey] === waypoints ? requestedKey : 'colony_capital';
              const startIdx = (idx + 2) % waypoints.length;
              const nextIdx = waypoints.length > 1 ? (startIdx + 1) % waypoints.length : 0;
              const startProgress = ((idx * 0.35) % 0.8) + 0.1;
              this.beginRoute(entity, targetColonyKey, startIdx, nextIdx, startProgress, 0.08 + ((idx % 3) * 0.02));
            }
          } else {
            entity.userData.agent = sub;
          }
        });
      }
    }

    // Update Botanical Alchemical Flora
    updateFloraOnSphere() {
      if (!this.lineage || !this.lineage.flora) return;

      this.lineage.flora.forEach(p => {
        let fMesh = this.floraMeshes[p.id];
        if (!fMesh) {
          const fGroup = new THREE.Group();
          fGroup.userData = { flora: p };

          // Lotus / Orchid Blossom Geometry
          const lotusGeo = new THREE.ConeGeometry(2.2, 3.2, 6, 1, true);
          const colorHex = p.type === 'golden_lotus' ? 0xF59E0B :
                           p.type === 'prana_orchid' ? 0xC084FC :
                           p.type === 'silicon_sprout' ? 0x06B6D4 :
                           p.type === 'crypto_fern' ? 0x14F195 : 0xFFFFFF;

          const lotusMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 0.4,
            side: THREE.DoubleSide,
            roughness: 0.3
          });
          const lotusMesh = new THREE.Mesh(lotusGeo, lotusMat);
          lotusMesh.rotation.x = Math.PI;
          fGroup.add(lotusMesh);

          // Central Radiant Prana Core
          const coreGeo = new THREE.SphereGeometry(0.9, 8, 8);
          const coreMat = new THREE.MeshBasicMaterial({ color: 0xFFFBEB });
          const core = new THREE.Mesh(coreGeo, coreMat);
          fGroup.add(core);

          const colKey = p.colony || 'colony_capital';
          const baseCoord = COLONY_COORDS[colKey] || COLONY_COORDS.colony_capital;
          const lat = baseCoord.lat + (Math.random() * 4 - 2);
          const lon = baseCoord.lon + (Math.random() * 4 - 2);

          this.placeOnSphere(fGroup, lat, lon, 1.2);
          this.scene.add(fGroup);
          this.floraMeshes[p.id] = fGroup;
          fMesh = fGroup;
        }

        // Scale blossom by biological growth stage (1..4)
        if (fMesh) {
          const stage = p.growthStage || 2;
          const scale = 0.6 + (stage * 0.22);
          fMesh.scale.set(scale, scale, scale);
        }
      });
    }

    resolveColonyKey(nameOrId) {
      const s = String(nameOrId || '').toLowerCase();
      if (COLONY_COORDS[s]) return s;
      if (s.includes('sol') || s.includes('crypta')) return 'colony_sol_crypta';
      if (s.includes('nova')) return 'colony_nova_zoth';
      if (s.includes('hex') || s.includes('bastion')) return 'colony_hex_bastion';
      if (s.includes('adytum') || s.includes('sanctum')) return 'colony_adytum_grove';
      return 'colony_capital';
    }

    updateZothNodePortalsAndVisitors() {
      if (!this.scene) return;
      if (!this.portalGates) {
        this.portalGates = {};
        Object.keys(COLONY_COORDS).forEach((colKey) => {
          const coord = COLONY_COORDS[colKey];
          const gateGroup = new THREE.Group();
          gateGroup.userData = { zothNodePortal: true, colonyKey: colKey, name: `${coord.name} Zoth Node Portal` };

          // Outer Cyan-Gold L1 Stargate Ring
          const ringGeo = new THREE.TorusGeometry(2.4, 0.22, 10, 28);
          const ringMat = new THREE.MeshStandardMaterial({
            color: 0x38BDF8,
            emissive: 0x0EA5E9,
            emissiveIntensity: 0.85,
            roughness: 0.2,
            metalness: 0.8
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.position.y = 2.6;
          gateGroup.add(ringMesh);

          // Inner Event Horizon Disc
          const discGeo = new THREE.CircleGeometry(2.15, 24);
          const discMat = new THREE.MeshBasicMaterial({
            color: 0x67E8F9,
            transparent: true,
            opacity: 0.32,
            side: THREE.DoubleSide
          });
          const discMesh = new THREE.Mesh(discGeo, discMat);
          discMesh.position.y = 2.6;
          gateGroup.add(discMesh);

          // Pedestal Base
          const baseGeo = new THREE.CylinderGeometry(1.8, 2.2, 0.5, 12);
          const baseMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, emissive: 0xF59E0B, emissiveIntensity: 0.25 });
          const baseMesh = new THREE.Mesh(baseGeo, baseMat);
          baseMesh.position.y = 0.25;
          gateGroup.add(baseMesh);

          this.placeOnSphere(gateGroup, coord.lat + 2.1, coord.lon - 2.1, 0.2);
          this.scene.add(gateGroup);
          this.interactiveObjects.push(gateGroup);
          this.portalGates[colKey] = gateGroup;
        });
      }

      // Render active Zoth Node Peer Visitors as walking 3D Envoys on the sphere
      if (!this.visitorEntities) this.visitorEntities = {};
      const visitors = (this.civState && Array.isArray(this.civState.worldVisitors)) ? this.civState.worldVisitors : [];
      visitors.forEach((vis, idx) => {
        if (!vis || !vis.handle) return;
        const vid = `VISITOR_${vis.handle.replace(/[^a-zA-Z0-9_]/g, '')}`;
        const colKey = this.resolveColonyKey(vis.colony);
        let entity = this.visitorEntities[vid];
        if (!entity) {
          const envoyAgent = {
            id: vid,
            name: `${vis.handle} [Zoth Node]`,
            role: `P2P Envoy • ${vis.targetWorld || 'Vaelor L1'}`,
            cadre: 'ZOTH_NODE_L1',
            colonyId: colKey,
            color: '#38BDF8',
            pet: '🌌',
            state: 'EXPLORING_REALM',
            speech: `Connected via Zoth Node (${vis.nodeUrl || ':8140'}) at ${vis.colony || 'Sol Crypta'}.`
          };
          entity = this.createAgentEntity(envoyAgent, false);
          this.scene.add(entity);
          this.visitorEntities[vid] = entity;
          this.agentEntities[vid] = entity;
          this.interactiveObjects.push(entity);

          const waypoints = this.routeFor(colKey);
          const resolvedKey = COLONY_WAYPOINTS[colKey] === waypoints ? colKey : 'colony_capital';
          const startIdx = idx % waypoints.length;
          const nextIdx = waypoints.length > 1 ? (startIdx + 1) % waypoints.length : 0;
          this.beginRoute(entity, resolvedKey, startIdx, nextIdx, 0.25, 0.075);
        }
      });
    }

    teleportVisitorToColony(colonyNameOrId, handle = '@1nc0gn30') {
      const colKey = this.resolveColonyKey(colonyNameOrId);
      this.activeColonyId = colKey;
      const coord = COLONY_COORDS[colKey] || COLONY_COORDS.colony_sol_crypta;
      const landingPoint = this.latLonToVec3(coord.lat + 2.6, coord.lon - 1.8, PLANET_RADIUS);
      const gateTarget = this.latLonToVec3(coord.lat, coord.lon, PLANET_RADIUS);
      this.enterAvatarMode(landingPoint, { faceTarget: gateTarget, instant: true });
      if (window.ZothHud && typeof window.ZothHud.showToast === 'function') {
        window.ZothHud.showToast(`🌌 Materialized ${handle} at ${coord.name} (Surface Walk POV Active — WASD to walk)`);
      }
    }

    // Apply Live Simulation Telemetry Snapshot
    updateState(data) {
      if (!data) return;
      if (data.state) this.civState = data.state;
      if (data.agents) this.agents = data.agents;
      if (data.lineage) {
        this.lineage = data.lineage;
        this.stationSkills = Array.isArray(data.lineage.stationSkills) ? data.lineage.stationSkills : [];
        this.syncFoundedColonies();
        this.refreshOpenStall();
      }

      this.updateAgentsOnSphere();
      this.updateFloraOnSphere();
      this.updateZothNodePortalsAndVisitors();

      if (data.recentMessages && data.recentMessages.length > 0) {
        const latest = data.recentMessages[data.recentMessages.length - 1];
        if (latest && latest.text && latest.text !== this.lastSpokenText) {
          this.lastSpokenText = latest.text;
          this.spawnSpeechBubble(latest.sender, latest.text);
        }
      }
    }

    entityById(agentId) {
      return this.agentEntities[agentId] || this.subagentEntities[agentId] || this.agentSprites[agentId] || this.subagentSprites[agentId] || null;
    }

    crowdPoints() {
      const out = [];
      const push = (map) => {
        if (!map) return;
        Object.keys(map).forEach((id) => {
          const ent = map[id];
          const agent = ent && ent.userData && ent.userData.agent;
          if (!ent || !ent.position || !agent) return;
          const task = agent.consciousTask || {};
          out.push({
            id,
            x: ent.position.x,
            y: ent.position.y,
            z: ent.position.z,
            name: agent.name || id,
            voiceId: agent.voiceId || '',
            voiceLine: agent.voiceLine || '',
            voiceAt: agent.voiceAt || 0,
            cadre: agent.cadre || '',
            targetApp: task.targetApp || agent.hallName || '',
            hall: agent.hallName || ''
          });
        });
      };
      push(this.agentEntities);
      push(this.subagentEntities);
      return out;
    }

    // Arc on a shell outside the planet. A straight lerp between opposite views passes through the core.
    flyTo(targetVec3, distance = 145, duration = 1200, targetCenter = new THREE.Vector3(0, 0, 0), endUp = null) {
      const startPos = this.camera.position.clone();
      const startTarget = this.controls ? this.controls.target.clone() : new THREE.Vector3(0, 0, 0);
      const endPos = targetVec3.clone().normalize().multiplyScalar(distance);
      const startDir = startPos.lengthSq() > 1e-6 ? startPos.clone().normalize() : new THREE.Vector3(0, 0, 1);
      const endDir = endPos.clone().normalize();
      let detour = null;
      if (startDir.dot(endDir) < -0.92) {
        const axis = Math.abs(startDir.y) < 0.85 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
        detour = new THREE.Vector3().crossVectors(startDir, axis).normalize();
      }
      this.cameraTransition = {
        startDir,
        endDir,
        detour,
        startR: Math.max(startPos.length(), PLANET_RADIUS + 2),
        endR: Math.max(endPos.length(), PLANET_RADIUS + 1.3),
        startTarget,
        endTarget: targetCenter.clone(),
        startUp: this.camera.up.clone(),
        endUp: endUp ? endUp.clone().normalize() : this.camera.up.clone(),
        startTime: performance.now(),
        duration
      };
      if (this.controls) {
        this.controls.enabled = false;
        this.controls.autoRotate = false;
      }
      if (typeof HermeticAudio !== 'undefined' && HermeticAudio.playColonyWarp) {
        HermeticAudio.playColonyWarp();
      }
    }

    focusColony(colonyKey) {
      const coord = COLONY_COORDS[colonyKey];
      if (!coord) return;
      this.activeColonyId = colonyKey;
      if (this.isAvatarMode) this.leaveWalk({ fly: false });
      const anchor = this.latLonToVec3(coord.lat, coord.lon, PLANET_RADIUS);
      const normal = anchor.clone().normalize();
      const focus = anchor.clone().addScaledVector(normal, 6);
      const yaw = 0.55;
      const tilt = 0.8;
      const dist = 36;
      const pose = this.localCameraPose(focus, yaw, tilt, dist);
      this.pendingLocal = {
        focus: focus.clone(),
        yaw,
        tilt,
        dist,
        followId: null,
        colonyId: colonyKey,
        anchor: anchor.clone()
      };
      this.viewMode = 'local';
      this.local = null;
      this.flyTo(pose.camPos, pose.camPos.length(), 1300, focus, pose.normal);
      this.openCityCard(colonyKey);
    }

    presentAgent(agentId) {
      const entity = this.entityById(agentId);
      if (!entity) return;
      if (this.isAvatarMode) this.leaveWalk({ fly: false });
      const normal = entity.position.clone().normalize();
      const focus = entity.position.clone().addScaledVector(normal, 2.3);
      const tilt = 0.84;
      const dist = 13;
      let yaw = 0.4;
      let bestClear = -1;
      for (let i = 0; i < 8; i++) {
        const tryYaw = (i / 8) * Math.PI * 2;
        const tryPose = this.localCameraPose(focus, tryYaw, tilt, dist);
        const clear = this.segmentClear(focus, tryPose.camPos);
        if (clear > bestClear) {
          bestClear = clear;
          yaw = tryYaw;
        }
      }
      const pose = this.localCameraPose(focus, yaw, tilt, dist);
      const colonyId = entity.userData.walkState ? entity.userData.walkState.colonyKey : null;
      this.pendingLocal = {
        focus: focus.clone(),
        yaw,
        tilt,
        dist,
        followId: agentId,
        colonyId,
        anchor: entity.position.clone()
      };
      this.viewMode = 'local';
      this.local = null;
      if (colonyId) this.activeColonyId = colonyId;
      this.flyTo(pose.camPos, pose.camPos.length(), 1000, focus, pose.normal);
      this.setSelected(entity);
      if (entity.userData.agent) this.openAgentCard(entity.userData.agent);
    }

    focusAgent(agentId) {
      this.presentAgent(agentId);
    }

    resetOrbit() {
      this.returnToGodsEye();
    }

    toggleAutoSpin() {
      this.autoSpin = !this.autoSpin;
      if (this.controls) this.controls.autoRotate = this.autoSpin;
      return this.autoSpin;
    }

    toggleDayNight() {
      this.dayNightSun = !this.dayNightSun;
      if (this.sunLight) {
        this.sunLight.intensity = this.dayNightSun ? 2.7 : 0.45;
        this.sunLight.castShadow = !!this.dayNightSun;
        if (this.dayNightSun && this.sunLight.shadow) this.sunLight.shadow.needsUpdate = true;
      }
      if (this.ambientLight) {
        this.ambientLight.intensity = this.dayNightSun ? 0.38 : 0.2;
      }
      if (this.hemiLight) {
        this.hemiLight.intensity = this.dayNightSun ? 0.72 : 0.25;
      }
      return this.dayNightSun;
    }

    updateAltitudeHUD() {
      const hud = document.getElementById('altitudeTelemetry');
      if (!hud || !this.camera) return;
      let text;
      if (this.isAvatarMode) {
        const air = this.avatar && !this.avatar.isGrounded;
        const elev = (this.avatar && this.avatar.stairElevation) || 0;
        const moving = this.avatar && this.avatar.velocity && this.avatar.velocity.length() > 0.45;
        if (elev > 0.35) {
          text = `ON FOOT · ELEV +${elev.toFixed(1)}M`;
        } else {
          text = air ? 'ON FOOT · AIRBORNE' : (moving ? 'ON FOOT · MOVING' : 'ON FOOT · STILL');
        }
      } else if (this.viewMode === 'local') {
        const id = (this.local && this.local.colonyId) || this.activeColonyId;
        const name = id && COLONY_COORDS[id] ? COLONY_COORDS[id].name : 'DISTRICT';
        text = `CITY ORBIT · ${name.toUpperCase()}`;
      } else {
        const alt = Math.max(1, Math.round(this.camera.position.length() - PLANET_RADIUS));
        text = `GOD'S EYE · ${alt * 10} KM`;
      }
      if (hud.textContent !== text) hud.textContent = text;
    }

    slerpDir(a, b, t) {
      const start = a.clone().normalize();
      const end = b.clone().normalize();
      const dot = Math.max(-1, Math.min(1, start.dot(end)));
      if (dot > 0.9995) return start.lerp(end, t).normalize();
      const theta = Math.acos(dot);
      const sin = Math.sin(theta);
      if (sin < 1e-5) return start.clone();
      const w1 = Math.sin((1 - t) * theta) / sin;
      const w2 = Math.sin(t * theta) / sin;
      return start.multiplyScalar(w1).addScaledVector(end, w2).normalize();
    }

    sampleFlight(tr, t) {
      let dir;
      if (tr.detour) {
        dir = t < 0.5 ? this.slerpDir(tr.startDir, tr.detour, t / 0.5) : this.slerpDir(tr.detour, tr.endDir, (t - 0.5) / 0.5);
      } else {
        dir = this.slerpDir(tr.startDir, tr.endDir, t);
      }
      if (dir.lengthSq() < 1e-8) dir = tr.endDir.clone();
      dir.normalize();
      const turn = Math.max(tr.startDir.angleTo(tr.endDir), tr.detour ? tr.startDir.angleTo(tr.detour) : 0);
      const bulge = Math.sin(Math.PI * t) * Math.min(48, turn * 55);
      let radius = tr.startR + (tr.endR - tr.startR) * t + bulge;
      radius = Math.max(radius, PLANET_RADIUS + 1.35);
      return dir.multiplyScalar(radius);
    }

    buildRoadNetwork() {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x343b4d,
        roughness: 0.86,
        metalness: 0.06,
        emissive: 0x4a3516,
        emissiveIntensity: 0.18
      });
      Object.keys(COLONY_WAYPOINTS).forEach((key) => {
        const pts = COLONY_WAYPOINTS[key];
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          const b = pts[(i + 1) % pts.length];
          const va = this.latLonToVec3(a.lat, a.lon, PLANET_RADIUS + 0.16);
          const vb = this.latLonToVec3(b.lat, b.lon, PLANET_RADIUS + 0.16);
          const mid = va.clone().add(vb).multiplyScalar(0.5);
          const dir = vb.clone().sub(va);
          const len = dir.length();
          if (len < 0.15) continue;
          dir.normalize();
          mid.normalize().multiplyScalar(PLANET_RADIUS + 0.2);
          const up = mid.clone().normalize();
          const xAxis = new THREE.Vector3().crossVectors(up, dir).normalize();
          const zAxis = new THREE.Vector3().crossVectors(xAxis, up).normalize();
          const road = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.07, len), mat);
          road.position.copy(mid);
          road.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, up, zAxis));
          road.receiveShadow = true;
          this.scene.add(road);
        }
      });
    }

    buildCityBoundaries() {
      const specs = {
        colony_capital: { wallR: 16.2, coreR: 6.5, color: 0xc9a24a },
        colony_nova_zoth: { wallR: 13.4, coreR: 0, color: 0x38bdf8 },
        colony_sol_crypta: { wallR: 12.4, coreR: 0, color: 0x14f195 },
        colony_adytum_grove: { wallR: 12.6, coreR: 4.3, color: 0xc084fc },
        colony_hex_bastion: { wallR: 13.8, coreR: 4.7, color: 0xf87171 }
      };
      Object.keys(specs).forEach((key) => {
        const group = this.colonyGroups[key];
        const spec = specs[key];
        if (!group) return;
        const segments = 14;
        const arc = (Math.PI * 2 * spec.wallR) / segments;
        const wallMat = new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.58, metalness: 0.32 });
        const capMat = new THREE.MeshStandardMaterial({
          color: spec.color,
          emissive: spec.color,
          emissiveIntensity: 0.28,
          roughness: 0.4,
          metalness: 0.45
        });
        for (let i = 0; i < segments; i++) {
          if (i % 5 === 0 || i === 13) continue;
          const midA = ((i + 0.5) / segments) * Math.PI * 2;
          const x = Math.cos(midA) * spec.wallR;
          const z = Math.sin(midA) * spec.wallR;
          const rot = -midA - Math.PI / 2;
          const baseH = 2.45;
          const wall = new THREE.Mesh(new THREE.BoxGeometry(arc * 0.96, baseH, 0.55), wallMat);
          wall.position.set(x, 0.06 + baseH / 2, z);
          wall.rotation.y = rot;
          wall.castShadow = true;
          wall.receiveShadow = true;
          group.add(wall);
          const cap = new THREE.Mesh(
            new THREE.BoxGeometry(arc * 0.96, 0.42, 0.7),
            capMat
          );
          cap.position.set(x, 0.06 + baseH + 1.55 + 0.21, z);
          cap.rotation.y = rot;
          cap.userData.noOcclude = true;
          cap.userData.viewRoof = true;
          group.add(cap);
          this.surfaceColliders.push({ shape: 'box', group, x, z, hx: arc * 0.48, hz: 0.28, rot });
        }
        if (key === 'colony_capital') {
          const colonnade = [-7, -2.5, 2.5, 7];
          colonnade.forEach((x) => {
            colonnade.forEach((z) => {
              if (Math.abs(x) === 7 || Math.abs(z) === 7) {
                this.surfaceColliders.push({ shape: 'cyl', group, x, z, r: 0.42 });
              }
            });
          });
        }
        if (key === 'colony_adytum_grove') {
          for (let i = 0; i < 22; i++) {
            const a = (i / 22) * Math.PI * 2;
            this.surfaceColliders.push({
              shape: 'cyl', group, x: Math.cos(a) * 9.5, z: Math.sin(a) * 9.5, r: 0.28
            });
          }
          [[-2.6, -2.6], [2.6, -2.6], [2.6, 2.6], [-2.6, 2.6]].forEach(([x, z]) => {
            this.surfaceColliders.push({ shape: 'cyl', group, x, z, r: 0.38 });
          });
        }
        if (key === 'colony_hex_bastion') {
          [[-2.8, -2.8], [2.8, -2.8], [2.8, 2.8], [-2.8, 2.8]].forEach(([x, z]) => {
            this.surfaceColliders.push({ shape: 'cyl', group, x, z, r: 0.42 });
          });
        }
        [0, 5].forEach((gate) => {
          const a = (gate / segments) * Math.PI * 2;
          const px = Math.cos(a) * (spec.wallR - 0.4);
          const pz = Math.sin(a) * (spec.wallR - 0.4);
          const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.1, 4.3, 6),
            new THREE.MeshStandardMaterial({ color: 0x232833, metalness: 0.55, roughness: 0.4 })
          );
          pole.position.set(px, 2.2, pz);
          pole.userData.noOcclude = true;
          const lamp = new THREE.Mesh(
            new THREE.SphereGeometry(0.32, 8, 8),
            new THREE.MeshStandardMaterial({ color: spec.color, emissive: spec.color, emissiveIntensity: 0.85, roughness: 0.25 })
          );
          lamp.position.set(px, 4.5, pz);
          lamp.userData.noOcclude = true;
          group.add(pole, lamp);
        });
      });
      ['colony_nova_zoth', 'colony_sol_crypta', 'colony_hex_bastion'].forEach((key) => {
        const city = this.colonyGroups[key];
        const supports = city && city.userData.supports;
        if (!supports) return;
        supports.forEach((support) => {
          this.surfaceColliders.push({ shape: 'cyl', group: city, x: support.x, z: support.z, r: Math.min(support.r, 0.44) });
        });
      });
    }

    // Local -z of a hall points at the colony origin.
    // Three.js rotation.y sends local (lx, lz) to (lx*cos + lz*sin, -lx*sin + lz*cos).
    // Colliders use that same map, with rot equal to the hall group's rotation.y.
    colonyPlanar(rot, lx, lz) {
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      return {
        x: lx * cos + lz * sin,
        z: -lx * sin + lz * cos
      };
    }

    addBelvedere(group, spec) {
      const mat = spec.mat;
      const deckMat = spec.deckMat || mat;
      const steps = spec.steps;
      const rise = spec.rise;
      const run = spec.run;
      const width = spec.width;
      const landD = spec.land;
      const rot = spec.rot || 0;
      const rig = new THREE.Group();
      rig.position.set(spec.x, spec.baseY, spec.z);
      rig.rotation.y = rot;
      // Posts, rails, and the roof sit inside the tread and landing footprints.
      for (let i = 0; i < steps; i++) {
        const h = rise * (i + 1);
        const lz = (i + 0.5) * run;
        const step = new THREE.Mesh(new THREE.BoxGeometry(width, h, run * 0.9), mat);
        step.position.set(0, h / 2, lz);
        step.userData.noOcclude = true;
        rig.add(step);
        this.attachStairSolid(group, spec.x, spec.z, rot, step, 0, lz, { topY: h, stairKind: 'belvedere' });
      }
      const top = rise * steps;
      const landZ = steps * run + landD / 2;
      const land = new THREE.Mesh(new THREE.BoxGeometry(width + 0.45, 0.16, landD), deckMat);
      land.position.set(0, top, landZ);
      land.userData.noOcclude = true;
      land.receiveShadow = true;
      rig.add(land);
      this.attachStairSolid(group, spec.x, spec.z, rot, land, 0, landZ, { topY: top + 0.08, stairKind: 'belvedere' });
      const postH = spec.postH || 3.2;
      [[-1, 0.18], [1, 0.18], [-1, landD - 0.28], [1, landD - 0.28]].forEach(([sx, sz]) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, postH, 6), mat);
        post.position.set(sx * (width / 2 - 0.08), top + postH / 2, steps * run + sz);
        post.userData.noOcclude = true;
        rig.add(post);
      });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.9, 0.18, landD + 0.4), deckMat);
      roof.position.set(0, top + postH, steps * run + landD / 2);
      roof.userData.noOcclude = true;
      roof.userData.viewRoof = true;
      rig.add(roof);
      const fin = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.72, 5), mat);
      fin.position.set(0, top + postH + 0.44, steps * run + landD / 2);
      fin.userData.noOcclude = true;
      rig.add(fin);
      [0.9, postH * 0.42].forEach((ry) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(width + 0.2, 0.08, 0.08), mat);
        rail.position.set(0, top + ry, steps * run + landD - 0.12);
        rail.userData.noOcclude = true;
        rig.add(rail);
      });
      rig.userData.belvedere = true;
      group.add(rig);
      this.detailRigs.push(rig);
      return rig;
    }

    // Mesh local (lx, lz) in a rig whose yaw is `rot` and whose origin is (ox, oz).
    // The collider uses that same yaw through colonyPlanar.
    attachStairSolid(group, ox, oz, rot, mesh, lx, lz, extra) {
      const placed = this.colonyPlanar(rot, lx, lz);
      const geo = mesh.geometry && mesh.geometry.parameters;
      const autoTopY = (mesh && mesh.position ? mesh.position.y : 0) + (geo && geo.height ? geo.height / 2 : 0.08);
      const solid = Object.assign({
        shape: 'stair',
        group,
        x: ox + placed.x,
        z: oz + placed.z,
        hx: geo ? geo.width / 2 : 0.2,
        hz: geo ? geo.depth / 2 : 0.2,
        rot,
        topY: autoTopY
      }, extra || {});
      mesh.userData.stairTread = true;
      mesh.userData.solid = solid;
      this.surfaceColliders.push(solid);
      return solid;
    }

    // A point on the sphere, `arc` along the colony's local +X and `side` along local +Z.
    arcWorld(group, arc, side, lift) {
      group.updateMatrixWorld(true);
      const origin = new THREE.Vector3();
      group.getWorldPosition(origin);
      const normal = origin.clone().normalize();
      const axisX = group.localToWorld(new THREE.Vector3(1, 0, 0)).sub(origin);
      const axisZ = group.localToWorld(new THREE.Vector3(0, 0, 1)).sub(origin);
      if (axisX.lengthSq() < 1e-8 || axisZ.lengthSq() < 1e-8) return origin;
      axisX.normalize();
      axisZ.normalize();
      const theta = arc / PLANET_RADIUS;
      const phi = side / PLANET_RADIUS;
      const dir = normal.multiplyScalar(Math.cos(theta) * Math.cos(phi))
        .addScaledVector(axisX, Math.sin(theta) * Math.cos(phi))
        .addScaledVector(axisZ, Math.sin(phi))
        .normalize();
      return dir.multiplyScalar(PLANET_RADIUS + lift);
    }

    // Box +Z follows the run, +X the width, +Y the local surface normal.
    poseOnArc(group, mesh, arc, side, lift) {
      group.updateMatrixWorld(true);
      const origin = new THREE.Vector3();
      group.getWorldPosition(origin);
      const normal = origin.clone().normalize();
      const axisX = group.localToWorld(new THREE.Vector3(1, 0, 0)).sub(origin).normalize();
      const axisZ = group.localToWorld(new THREE.Vector3(0, 0, 1)).sub(origin).normalize();
      const theta = arc / PLANET_RADIUS;
      const phi = side / PLANET_RADIUS;
      const up = normal.clone().multiplyScalar(Math.cos(theta) * Math.cos(phi))
        .addScaledVector(axisX, Math.sin(theta) * Math.cos(phi))
        .addScaledVector(axisZ, Math.sin(phi))
        .normalize();
      const run = axisX.clone().addScaledVector(up, -axisX.dot(up));
      if (run.lengthSq() < 1e-8) run.copy(axisZ);
      run.normalize();
      const right = new THREE.Vector3().crossVectors(up, run).normalize();
      const worldQuat = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(right, up, run)
      );
      const worldPos = up.clone().multiplyScalar(PLANET_RADIUS + lift);
      const parentQuat = group.getWorldQuaternion(new THREE.Quaternion());
      mesh.position.copy(group.worldToLocal(worldPos));
      mesh.quaternion.copy(parentQuat.invert().multiply(worldQuat));
    }

    // Collider center is the sphere point under the tread, so a walker meets the mesh.
    solidFromArcMesh(group, mesh, extra) {
      group.updateMatrixWorld(true);
      const worldCenter = mesh.getWorldPosition(new THREE.Vector3());
      const ground = worldCenter.clone().normalize().multiplyScalar(PLANET_RADIUS);
      const at = group.worldToLocal(ground);
      const parentQ = group.getWorldQuaternion(new THREE.Quaternion());
      const axis = new THREE.Vector3(1, 0, 0)
        .applyQuaternion(mesh.getWorldQuaternion(new THREE.Quaternion()))
        .applyQuaternion(parentQ.invert());
      const geo = mesh.geometry && mesh.geometry.parameters;
      const autoTopY = Math.max(0.1, worldCenter.length() - PLANET_RADIUS + (geo && geo.height ? geo.height / 2 : 0.1));
      const solid = Object.assign({
        shape: 'stair',
        group,
        x: at.x,
        z: at.z,
        hx: geo ? geo.width / 2 : 0.2,
        hz: geo ? geo.depth / 2 : 0.2,
        rot: Math.atan2(-axis.z, axis.x),
        topY: autoTopY
      }, extra || {});
      mesh.userData.stairTread = true;
      mesh.userData.arcSolid = true;
      mesh.userData.solid = solid;
      this.surfaceColliders.push(solid);
      return solid;
    }

    buildStairwaysToZoth() {
      const specs = {
        colony_capital: { clearR: 16.2, color: 0xF59E0B },
        colony_nova_zoth: { clearR: 13.4, color: 0x06B6D4 },
        colony_sol_crypta: { clearR: 12.4, color: 0x14F195 },
        colony_adytum_grove: { clearR: 12.6, color: 0xC084FC },
        colony_hex_bastion: { clearR: 13.8, color: 0xEF4444 }
      };
      Object.keys(specs).forEach((key) => {
        const group = this.colonyGroups[key];
        if (!group) return;
        this.addStairwayToZoth(group, key, specs[key]);
      });
    }

    addStairwayToZoth(group, colonyKey, spec) {
      if (!group || !colonyKey) return null;
      if (this.stairways[colonyKey]) return this.stairways[colonyKey];
      const clearR = spec && spec.clearR != null ? spec.clearR : 12;
      const color = (spec && spec.color) || 0xF59E0B;
      const steps = 28;
      const rise = 0.34;
      const run = 0.86;
      const width = 3.3;
      const landD = 5.2;
      const approach = 2.4;
      const arc0 = clearR + 2.8;
      const top = rise * steps;
      const flight = steps * run;
      const deckArc = arc0 + flight + landD / 2;

      const rig = new THREE.Group();
      rig.userData.stairwayToZoth = true;
      rig.userData.colonyKey = colonyKey;
      group.add(rig);

      const stone = new THREE.MeshStandardMaterial({ color, roughness: 0.46, metalness: 0.34 });
      const edge = new THREE.MeshStandardMaterial({
        color: 0xf5e6c8,
        roughness: 0.4,
        metalness: 0.42,
        emissive: color,
        emissiveIntensity: 0.16
      });
      const treads = [];
      for (let i = 0; i < steps; i++) {
        const h = rise * (i + 1);
        const depth = run * 0.92;
        const arc = arc0 + i * run + depth / 2;
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, h, depth), i % 2 ? edge : stone);
        mesh.userData.noOcclude = true;
        rig.add(mesh);
        this.poseOnArc(group, mesh, arc, 0, h / 2);
        [-1, 1].forEach((side) => {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, depth * 0.96), stone);
          rail.position.set(side * (width / 2 - 0.1), h / 2 + 0.06, 0);
          rail.userData.noOcclude = true;
          mesh.add(rail);
        });
        treads.push(mesh);
      }
      const deck = new THREE.Mesh(new THREE.BoxGeometry(width + 0.7, 0.2, landD), edge);
      deck.userData.noOcclude = true;
      deck.userData.stairDeck = true;
      deck.receiveShadow = true;
      deck.castShadow = true;
      rig.add(deck);
      this.poseOnArc(group, deck, deckArc, 0, top + 0.1);
      const bowl = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 10, 8),
        new THREE.MeshBasicMaterial({ color })
      );
      bowl.position.set(0, 0.48, 0);
      bowl.userData.noOcclude = true;
      deck.add(bowl);
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 96;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#140f0a';
        ctx.fillRect(0, 0, 512, 96);
        ctx.strokeStyle = '#f5c46c';
        ctx.lineWidth = 6;
        ctx.strokeRect(6, 6, 500, 84);
        ctx.fillStyle = '#fde68a';
        ctx.font = '700 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('STAIRWAY TO ZOTH', 256, 50);
        const tex = new THREE.CanvasTexture(canvas);
        if (THREE.sRGBEncoding !== undefined) tex.encoding = THREE.sRGBEncoding;
        const sign = new THREE.Mesh(
          new THREE.PlaneGeometry(3.1, 0.58),
          new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
        );
        sign.position.set(0, 1.55, landD / 2 - 0.2);
        sign.rotation.y = Math.PI;
        sign.userData.noOcclude = true;
        deck.add(sign);
      }
      group.updateMatrixWorld(true);
      const extra = { stairwayId: colonyKey, kind: 'stair' };
      treads.forEach((mesh) => this.solidFromArcMesh(group, mesh, extra));
      this.solidFromArcMesh(group, deck, extra);

      const record = {
        id: colonyKey,
        rig,
        group,
        steps,
        rise,
        run,
        width,
        approach,
        arc0,
        flight,
        landD,
        top,
        deckArc,
        footArc: arc0 - approach,
        length: approach + flight + landD / 2
      };
      this.stairways[colonyKey] = record;
      const foot = this.pointOnStair(record, 0);
      const high = this.pointOnStair(record, 1);
      record.foot = { lat: foot.lat, lon: foot.lon };
      record.footAltitude = foot.altitude;
      record.deck = { lat: high.lat, lon: high.lon };
      record.deckAltitude = high.altitude;
      const route = COLONY_WAYPOINTS[colonyKey];
      if (route && !route.some((stop) => stop && stop.stairwayId === colonyKey)) {
        route.push({
          lat: high.lat,
          lon: high.lon,
          name: 'Stairway to Zoth',
          stairwayId: colonyKey
        });
      }
      return record;
    }

    pointOnStair(st, u) {
      const t = Math.max(0, Math.min(1, Number(u) || 0));
      const dist = t * st.length;
      let arc = st.footArc;
      let lift = 0.08;
      if (dist <= st.approach) {
        arc = st.footArc + dist;
        lift = 0.08;
      } else if (dist >= st.approach + st.flight) {
        arc = st.deckArc;
        lift = st.top + 0.2;
      } else {
        const along = dist - st.approach;
        arc = st.arc0 + along;
        lift = (along / st.flight) * st.top + 0.12;
      }
      const world = this.arcWorld(st.group, arc, 0, lift);
      const ll = this.vec3ToLatLon(world);
      return {
        lat: ll.lat,
        lon: ll.lon,
        altitude: Math.max(0, world.length() - PLANET_RADIUS)
      };
    }

    pinStationKeeper(ent) {
      const agent = ent && ent.userData && ent.userData.agent;
      if (!agent) return;
      const ws = ent.userData.walkState || (ent.userData.walkState = {});
      ws.posted = true;
      ws.speed = 0;
      ws.isIdle = true;
      ws.isPilgrimage = false;
      ws.isMeditating = false;
      ws.idleTimer = 1e9;
      const hall = this.civicById[agent.stationId];
      if (!hall || !hall.mesh) return;
      hall.mesh.updateMatrixWorld(true);
      const stand = this.keeperStandOffset();
      const world = hall.mesh.localToWorld(stand.clone());
      const latLon = this.vec3ToLatLon(world);
      const lift = Math.max(0, world.length() - PLANET_RADIUS);
      const doorOut = new THREE.Vector3(0, 0, -1).applyQuaternion(hall.mesh.getWorldQuaternion(new THREE.Quaternion()));
      ws.faceDir = doorOut;
      ws.curLat = latLon.lat;
      ws.curLon = latLon.lon;
      ws._seatLat = latLon.lat;
      ws._seatLon = latLon.lon;
      ws.colonyKey = hall.colonyKey;
      this.placeOnSphereFacing(ent, latLon.lat, latLon.lon, lift, doorOut);
      if (ent.userData.bodyMesh) ent.userData.bodyMesh.position.y = 0;
    }

    syncFoundedColonies() {
      const list = (this.lineage && this.lineage.colonies) || [];
      list.forEach((colony) => {
        if (!colony || !colony.id || this.colonyGroups[colony.id]) return;
        if (!Number.isFinite(colony.lat) || !Number.isFinite(colony.lon)) return;
        this.buildOutpost(colony);
      });
    }

    buildOutpost(colony) {
      const color = typeof colony.color === 'number'
        ? colony.color
        : parseInt(String(colony.color || '#FBBF24').replace('#', ''), 16) || 0xFBBF24;
      COLONY_COORDS[colony.id] = {
        lat: colony.lat,
        lon: colony.lon,
        name: colony.name || 'New Settlement',
        color,
        banner: colony.banner || '🏕️'
      };
      COLONY_WAYPOINTS[colony.id] = [
        { lat: colony.lat, lon: colony.lon, name: `${colony.name} Plaza` },
        { lat: colony.lat + 1.1, lon: colony.lon + 0.8, name: 'North Stall' },
        { lat: colony.lat - 0.9, lon: colony.lon + 1.0, name: 'East Yard' },
        { lat: colony.lat - 1.0, lon: colony.lon - 0.9, name: 'South Gate' },
        { lat: colony.lat + 0.8, lon: colony.lon - 1.1, name: 'West Walk' }
      ];
      const group = new THREE.Group();
      group.userData = {
        id: colony.id,
        name: colony.name,
        role: colony.title || 'Founded settlement',
        groundY: 0.2,
        lifts: [],
        founded: true
      };
      this.placeOnSphere(group, colony.lat, colony.lon);
      this.scene.add(group);
      this.colonyGroups[colony.id] = group;

      const stone = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.28 });
      const deck = new THREE.MeshStandardMaterial({
        color: 0xf5e6c8,
        roughness: 0.4,
        metalness: 0.35,
        emissive: color,
        emissiveIntensity: 0.12
      });
      const plaza = new THREE.Mesh(
        new THREE.CylinderGeometry(8.2, 8.6, 0.22, 24),
        new THREE.MeshStandardMaterial({ color: 0x1c1915, roughness: 0.92 })
      );
      plaza.position.y = 0.12;
      plaza.receiveShadow = true;
      group.add(plaza);
      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.42, 7.5, 6), stone);
      spire.position.y = 3.9;
      spire.castShadow = true;
      group.add(spire);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), new THREE.MeshBasicMaterial({ color }));
      lamp.position.y = 7.8;
      group.add(lamp);
      this.surfaceColliders.push({ shape: 'cyl', group, x: 0, z: 0, r: 0.5 });
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 10.1;
        const z = Math.sin(angle) * 10.1;
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 3.4, 6), stone);
        pillar.position.set(x, 1.8, z);
        pillar.castShadow = true;
        group.add(pillar);
        this.surfaceColliders.push({ shape: 'cyl', group, x, z, r: 0.36 });
      }
      this.addBelvedere(group, {
        x: 0,
        z: 6.6,
        rot: 0,
        baseY: 0.2,
        width: 2.6,
        steps: 4,
        rise: 0.4,
        run: 0.36,
        land: 1.15,
        postH: 2.8,
        mat: stone,
        deckMat: deck
      });
      this.addStairwayToZoth(group, colony.id, { clearR: 12.4, color });
      const plan = { wallR: 11, color };
      [
        { kind: 'install', name: `${colony.name} Registry`, x: 0, z: -6.2, w: 4.4, d: 3.0 },
        { kind: 'forge', name: `${colony.name} Foundry`, x: 5.4, z: 2.6, w: 4.4, d: 3.0 },
        { kind: 'research', name: `${colony.name} Study`, x: -5.4, z: 2.6, w: 4.4, d: 3.0 }
      ].forEach((spec) => this.addCivicHall(colony.id, plan, spec));
      this.addTradeArc('colony_capital', colony.id);
      this.addColonySight(colony);
      this.compactTree(group);
    }

    addColonySight(colony) {
      if (typeof document === 'undefined') return;
      const existing = document.querySelector(`.btn-colony-cam[data-colony="${colony.id}"]`);
      if (existing) return;
      const follow = document.getElementById('btnCamFollowImperator');
      if (!follow || !follow.parentElement) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'globe-btn btn-colony-cam';
      btn.dataset.colony = colony.id;
      btn.title = `Focus ${colony.name}`;
      const mark = document.createElement('span');
      mark.textContent = colony.banner || '🏕️';
      btn.appendChild(mark);
      btn.appendChild(document.createTextNode(` ${colony.name}`));
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.focusColony(colony.id);
      });
      follow.parentElement.insertBefore(btn, follow);
    }

    buildCivicHalls() {
      const plans = {
        colony_capital: {
          wallR: 16.2,
          color: 0xd4af37,
          halls: [
            { kind: 'install', name: 'Skill Registry', x: 0, z: -11, w: 5, d: 3.6 },
            { kind: 'forge', name: 'Sigil Foundry', x: 11, z: 2.2, w: 5, d: 3.6 },
            { kind: 'research', name: 'Capital Athenaeum', x: -11, z: 2.2, w: 5, d: 3.6 }
          ]
        },
        colony_nova_zoth: {
          wallR: 13.4,
          color: 0x38bdf8,
          halls: [
            { kind: 'install', name: 'Harbor Registry', x: 0, z: -9, w: 5, d: 3.6 },
            { kind: 'forge', name: 'Signal Foundry', x: 8.2, z: 3.4, w: 4.6, d: 3.4 },
            { kind: 'research', name: 'Signal Lab', x: -8.2, z: 3.4, w: 4.6, d: 3.4 }
          ]
        },
        colony_sol_crypta: {
          wallR: 12.4,
          color: 0x14f195,
          halls: [
            { kind: 'install', name: 'Mint Registry', x: 0, z: -8.2, w: 4.6, d: 3.4 },
            { kind: 'forge', name: 'Sigil Press', x: 0, z: 8.2, w: 4.6, d: 3.4 },
            { kind: 'research', name: 'Sol Ledger', x: 7.6, z: 5.2, w: 4.4, d: 3.2 }
          ]
        },
        colony_adytum_grove: {
          wallR: 12.6,
          color: 0xc084fc,
          halls: [
            { kind: 'install', name: 'Grove Registry', x: 0, z: 6.6, w: 4.4, d: 3.0 },
            { kind: 'forge', name: 'Sigil Shrine', x: 6.6, z: 0, w: 4.4, d: 3.0 },
            { kind: 'research', name: 'Key Study', x: 0, z: -6.6, w: 4.4, d: 3.0 }
          ]
        },
        colony_hex_bastion: {
          wallR: 13.8,
          color: 0xf87171,
          halls: [
            { kind: 'install', name: 'Watch Registry', x: 9.87, z: 5.7, w: 4.2, d: 3.2 },
            { kind: 'forge', name: 'Sigil Armory', x: -9.87, z: 5.7, w: 4.2, d: 3.2 },
            { kind: 'research', name: 'Hex Watch', x: 0, z: -11.4, w: 4.2, d: 3.2 }
          ]
        }
      };
      Object.keys(plans).forEach((key) => {
        const plan = plans[key];
        plan.halls.forEach((spec) => this.addCivicHall(key, plan, spec));
      });
    }

    addCivicHall(colonyKey, plan, spec) {
      const colony = this.colonyGroups[colonyKey];
      if (!colony) return;
      const W = spec.w;
      const D = spec.d;
      const t = 0.28;
      // Leader name plates sit near 4.9. The door and the walls clear that.
      const wallH = 6.5;
      const floorTop = 0.08;
      const doorW = Math.min(3.05, W - 1.15);
      const jambW = (W - doorW) / 2;
      const jambH = 5.15;
      const pedR = 0.4;
      const pedBase = pedR + 0.06;
      const pedH = 0.92;
      const pedZ = 0.22;
      const rot = Math.atan2(spec.x, spec.z);
      const id = colonyKey + ':' + spec.kind;
      const city = COLONY_COORDS[colonyKey] || {};
      const lore = CIVIC_HALL_LORE[id] || {
        title: spec.name,
        lead: spec.kind === 'install'
          ? `Install specialized skills crafted for ${colony.name || city.name || 'the settlement'}.`
          : spec.kind === 'forge'
            ? `Forge new sovereign sigils and skills for ${colony.name || city.name || 'the settlement'}.`
            : `Advance research and studies for ${colony.name || city.name || 'the settlement'}.`,
        keeperRole: `${colony.name || city.name || 'Colony'} Keeper`,
        keeperLead: `Welcome to ${spec.name}.`
      };
      const lead = lore.lead;
      const hallName = lore.title || spec.name;

      const root = new THREE.Group();
      root.position.set(spec.x, 0, spec.z);
      root.rotation.y = rot;
      root.userData.civicId = id;

      const wallMat = new THREE.MeshStandardMaterial({
        color: plan.color,
        roughness: 0.52,
        metalness: 0.28,
        side: THREE.DoubleSide
      });
      const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1714, roughness: 0.92, metalness: 0.04 });
      const trimMat = new THREE.MeshStandardMaterial({
        color: 0xf5e6c8,
        roughness: 0.38,
        metalness: 0.48,
        emissive: plan.color,
        emissiveIntensity: 0.18,
        side: THREE.DoubleSide
      });

      const addBox = (w, h, d, x, y, z, mat, solid, occlude) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.civicId = id;
        if (!occlude) mesh.userData.noOcclude = true;
        if (solid) mesh.userData.civicSolid = 'box';
        root.add(mesh);
        if (solid) {
          const placed = this.colonyPlanar(rot, x, z);
          this.surfaceColliders.push({
            shape: 'box',
            group: colony,
            x: spec.x + placed.x,
            z: spec.z + placed.z,
            hx: w / 2,
            hz: d / 2,
            rot,
            civicId: id
          });
        }
        return mesh;
      };

      addBox(W, floorTop, D, 0, floorTop / 2, 0, floorMat, false, false);
      const yWall = floorTop + wallH / 2;
      addBox(t, wallH, D, -(W / 2 - t / 2), yWall, 0, wallMat, true, true);
      addBox(t, wallH, D, W / 2 - t / 2, yWall, 0, wallMat, true, true);
      const zBack = D / 2 - t / 2;
      addBox(W, wallH, t, 0, yWall, zBack, wallMat, true, true);
      const zFront = -(D / 2 - t / 2);
      const yJamb = floorTop + jambH / 2;
      const jambX = doorW / 2 + jambW / 2;
      addBox(jambW, jambH, t, -jambX, yJamb, zFront, wallMat, true, true);
      addBox(jambW, jambH, t, jambX, yJamb, zFront, wallMat, true, true);
      const lintelH = wallH - jambH;
      const header = addBox(W, lintelH, t, 0, floorTop + jambH + lintelH / 2, zFront, trimMat, false, false);
      header.userData.civicRoof = true;

      const step = new THREE.Mesh(
        new THREE.BoxGeometry(doorW - 0.08, 0.04, 0.7),
        floorMat
      );
      step.position.set(0, 0.03, zFront - 0.2);
      step.receiveShadow = true;
      step.userData.civicId = id;
      step.userData.noOcclude = true;
      root.add(step);

      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(pedR, pedBase, pedH, 10),
        trimMat
      );
      pedestal.position.set(0, floorTop + pedH / 2, pedZ);
      pedestal.castShadow = true;
      pedestal.userData.civicId = id;
      pedestal.userData.civicSolid = 'cyl';
      root.add(pedestal);
      const pedPlaced = this.colonyPlanar(rot, 0, pedZ);
      this.surfaceColliders.push({
        shape: 'cyl',
        group: colony,
        x: spec.x + pedPlaced.x,
        z: spec.z + pedPlaced.z,
        r: pedBase,
        civicId: id
      });

      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.18, 0),
        new THREE.MeshStandardMaterial({
          color: plan.color,
          emissive: plan.color,
          emissiveIntensity: 0.85,
          roughness: 0.22,
          metalness: 0.45
        })
      );
      gem.position.set(0, floorTop + pedH + 0.2, pedZ);
      gem.userData.civicId = id;
      gem.userData.keepMesh = true;
      gem.userData.noOcclude = true;
      root.add(gem);
      this.civicGems.push(gem);

      const signCanvas = document.createElement('canvas');
      signCanvas.width = 512;
      signCanvas.height = 96;
      const ctx = signCanvas.getContext('2d');
      ctx.fillStyle = '#140f0a';
      ctx.fillRect(0, 0, 512, 96);
      ctx.strokeStyle = '#f5c46c';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 500, 84);
      ctx.fillStyle = '#fde68a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let fontSize = 40;
      ctx.font = '700 ' + fontSize + 'px sans-serif';
      while (ctx.measureText(spec.name).width > 470 && fontSize > 22) {
        fontSize -= 2;
        ctx.font = '700 ' + fontSize + 'px sans-serif';
      }
      ctx.fillText(spec.name, 256, 50);
      const signTex = new THREE.CanvasTexture(signCanvas);
      if (THREE.sRGBEncoding !== undefined) signTex.encoding = THREE.sRGBEncoding;
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(Math.min(W - 0.3, 3.4), 0.5),
        new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
      );
      sign.position.set(0, floorTop + jambH - 0.42, zFront - 0.08);
      sign.rotation.y = Math.PI;
      sign.userData.civicId = id;
      sign.userData.civicSign = true;
      sign.userData.noOcclude = true;
      root.add(sign);

      const stairW = Math.min(0.92, W * 0.24);
      const stairN = 5;
      const stairRise = 0.48;
      const zInner = D / 2 - t - 0.08;
      const zStart = 0.48;
      const stairRun = Math.max(0.14, (zInner - zStart) / stairN);
      const stairX = W / 2 - t - stairW / 2 - 0.06;
      for (let i = 0; i < stairN; i++) {
        const h = stairRise * (i + 1);
        const lz = zStart + (i + 0.5) * stairRun;
        const tread = new THREE.Mesh(new THREE.BoxGeometry(stairW, h, stairRun * 0.9), floorMat);
        tread.position.set(stairX, h / 2, lz);
        tread.userData.noOcclude = true;
        tread.userData.civicStair = true;
        tread.userData.civicId = id;
        root.add(tread);
        this.attachStairSolid(colony, spec.x, spec.z, rot, tread, stairX, lz, { civicId: id });
      }
      const loftY = stairRise * stairN;
      const loftZ = zStart + stairN * stairRun - 0.08;
      const loft = new THREE.Mesh(new THREE.BoxGeometry(stairW + 0.08, 0.1, Math.min(0.7, stairRun + 0.2)), trimMat);
      loft.position.set(stairX, loftY, loftZ);
      loft.userData.noOcclude = true;
      loft.userData.civicStair = true;
      loft.userData.civicId = id;
      root.add(loft);
      this.attachStairSolid(colony, spec.x, spec.z, rot, loft, stairX, loftZ, { civicId: id });

      const eaveY = wallH + 0.12;
      [-1, 1].forEach((side) => {
        const eave = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, D - 0.2), trimMat);
        eave.position.set(side * (W / 2 - 0.12), eaveY, 0);
        eave.userData.noOcclude = true;
        eave.userData.civicRoof = true;
        root.add(eave);
      });
      const roofBack = new THREE.Mesh(new THREE.BoxGeometry(W - 0.28, 0.12, D * 0.42), trimMat);
      roofBack.position.set(0, eaveY + 0.16, D * 0.2);
      roofBack.userData.noOcclude = true;
      roofBack.userData.civicRoof = true;
      root.add(roofBack);
      const roofHigh = new THREE.Mesh(new THREE.BoxGeometry(W * 0.62, 0.1, D * 0.2), wallMat);
      roofHigh.position.set(0, eaveY + 0.42, D * 0.28);
      roofHigh.userData.noOcclude = true;
      roofHigh.userData.civicRoof = true;
      root.add(roofHigh);

      colony.add(root);
      colony.updateMatrixWorld(true);
      const anchor = colony.localToWorld(new THREE.Vector3(spec.x, 0, spec.z));
      const record = {
        id,
        colonyKey,
        kind: spec.kind,
        name: hallName,
        lead,
        lore,
        cityName: city.name || 'Settlement',
        x: spec.x,
        z: spec.z,
        rot,
        w: W,
        d: D,
        hw: W / 2,
        hd: D / 2,
        doorW,
        wallH,
        pedZ,
        pedR: pedBase,
        wallR: plan.wallR,
        group: colony,
        mesh: root,
        anchor
      };
      this.civicHalls.push(record);
      this.civicById[id] = record;
    }

    hallLocal(hall, worldPoint) {
      hall.group.updateMatrixWorld();
      const local = hall.group.worldToLocal(worldPoint.clone());
      const dx = local.x - hall.x;
      const dz = local.z - hall.z;
      const cos = Math.cos(hall.rot);
      const sin = Math.sin(hall.rot);
      return {
        x: dx * cos - dz * sin,
        z: dx * sin + dz * cos
      };
    }

    paintDatamosh(spirit) {
      const ctx = spirit.ctx;
      const glyphs = spirit.glyphs;
      const tick = spirit.tick;
      const w = 180;
      const h = 360;
      ctx.clearRect(0, 0, w, h);
      ctx.textBaseline = 'top';
      ctx.font = '700 16px monospace';
      // Half-widths of a standing figure: crown, shoulders, waist, legs.
      const silhouette = [1, 2, 2, 3, 2, 4, 5, 5, 4, 3, 3, 4, 2, 2, 2, 1, 2, 1];
      for (let row = 0; row < silhouette.length; row++) {
        const half = silhouette[row];
        const tear = ((tick * 3 + row * 5) % 11) - 5;
        let line = '';
        for (let col = 0; col < half * 2 + 1; col++) {
          line += glyphs[(tick * 5 + row * 9 + col * 7) % glyphs.length];
        }
        const band = (row + tick) % 3;
        ctx.fillStyle = band === 0 ? spirit.accent : band === 1 ? '#fde68a' : '#e0f2fe';
        ctx.globalAlpha = 0.94;
        ctx.fillText(line, w / 2 - half * 9 + tear, 8 + row * 18);
      }
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#ffffff';
      const slash = (tick * 17) % (h - 8);
      ctx.fillRect(0, slash, w, 4);
      ctx.fillStyle = spirit.accent;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(0, (slash + 28) % (h - 4), w, 2);
      spirit.texture.needsUpdate = true;
    }

    buildDatamoshSpirits() {
      this.datamoshSpirits = [];
      const glyphs = '01#%@&/\\|+*=<>[]{}~^XZabcXYZ█▓▒░';
      const spots = {
        colony_capital: [[4.2, -9.0, 3.35, '#fde68a'], [-8.6, 3.2, 3.5, '#67e8f9']],
        colony_nova_zoth: [[5.6, -8.4, 3.3, '#67e8f9'], [-5.4, 8.0, 3.55, '#e0f2fe']],
        colony_sol_crypta: [[6.6, -8.6, 3.3, '#6ee7b7'], [-6.4, 2.6, 3.5, '#fde68a']],
        colony_adytum_grove: [[6.4, -3.4, 3.4, '#e9d5ff'], [-3.6, -6.4, 3.6, '#67e8f9']],
        colony_hex_bastion: [[1.4, -6.6, 3.35, '#fca5a5'], [6.5, -2.6, 3.5, '#fde68a']]
      };
      Object.keys(spots).forEach((key) => {
        const colony = this.colonyGroups[key];
        if (!colony) return;
        spots[key].forEach((spot, index) => {
          const canvas = document.createElement('canvas');
          canvas.width = 180;
          canvas.height = 360;
          const ctx = canvas.getContext('2d');
          const texture = new THREE.CanvasTexture(canvas);
          texture.minFilter = THREE.LinearFilter;
          const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
            opacity: 0.94
          }));
          sprite.scale.set(2.5, 5.0, 1);
          sprite.position.y = 0.15;
          const echo = new THREE.Sprite(new THREE.SpriteMaterial({
            map: texture,
            color: spot[3],
            transparent: true,
            depthWrite: false,
            opacity: 0.38
          }));
          echo.scale.set(2.7, 5.15, 1);
          echo.position.set(0.42, -0.08, 0);
          const core = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.28, 0),
            new THREE.MeshBasicMaterial({
              color: spot[3],
              wireframe: true,
              transparent: true,
              opacity: 0.9
            })
          );
          core.position.set(0, 0.35, 0);
          const group = new THREE.Group();
          group.position.set(spot[0], spot[2], spot[1]);
          group.add(sprite, echo, core);
          colony.add(group);
          const spirit = {
            group,
            core,
            ctx,
            texture,
            glyphs,
            accent: spot[3],
            tick: index * 4,
            baseY: spot[2],
            phase: index * 1.7 + key.length
          };
          this.paintDatamosh(spirit);
          this.datamoshSpirits.push(spirit);
        });
      });
    }

    buildTerrainRelief() {
      this.reliefGroups = [];

      // Shared materials for zero-buffer high performance
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x364234, roughness: 0.88, metalness: 0.08 });
      const basaltMat = new THREE.MeshStandardMaterial({ color: 0x1c211e, roughness: 0.92, metalness: 0.12 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x3b2a1d, roughness: 0.85, metalness: 0.05 });
      const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65, metalness: 0.1 });
      const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.6, metalness: 0.15 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.22, emissive: 0x78350f });

      const crystalMats = [
        new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7e22ce, emissiveIntensity: 0.55, roughness: 0.15, metalness: 0.85 }), // Amethyst
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.55, roughness: 0.15, metalness: 0.85 }), // Emerald
        new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0284c7, emissiveIntensity: 0.55, roughness: 0.15, metalness: 0.85 }), // Sapphire
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.55, roughness: 0.15, metalness: 0.85 })  // Topaz
      ];

      const anchors = [];
      Object.keys(COLONY_COORDS).forEach((key) => {
        const c = COLONY_COORDS[key];
        anchors.push(this.latLonToVec3(c.lat, c.lon, 1).normalize());
        const st = this.stairways && this.stairways[key];
        if (st && st.deck) {
          anchors.push(this.latLonToVec3(st.deck.lat, st.deck.lon, 1).normalize());
        }
      });

      let made = 0;
      let guard = 0;
      while (made < 42 && guard < 480) {
        guard++;
        const lat = (Math.random() * 130) - 65;
        const lon = (Math.random() * 360) - 180;
        const n = this.latLonToVec3(lat, lon, 1).normalize();
        if (anchors.some((a) => a.angleTo(n) < 0.34)) continue;

        const group = new THREE.Group();
        const sceneryType = made % 5;
        let colRadius = 2.4;

        if (sceneryType === 0) {
          // 1. Hexagonal Crystal Spire Cluster
          const cMat = crystalMats[made % crystalMats.length];
          const spireCount = 3 + (made % 3);
          for (let s = 0; s < spireCount; s++) {
            const h = 4.0 + Math.random() * 5.2;
            const r = 0.45 + Math.random() * 0.45;
            const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, r, h, 6), cMat);
            const offX = (Math.random() - 0.5) * 2.2;
            const offZ = (Math.random() - 0.5) * 2.2;
            spire.position.set(offX, h * 0.5, offZ);
            spire.rotation.x = (Math.random() - 0.5) * 0.25;
            spire.rotation.z = (Math.random() - 0.5) * 0.25;
            spire.castShadow = true;
            spire.receiveShadow = true;
            group.add(spire);
          }
          colRadius = 2.5;
        } else if (sceneryType === 1) {
          // 2. Hermetic Megalithic Dolmen Gateway Arch
          const pillarH = 4.8;
          const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, pillarH, 0.7), basaltMat);
          p1.position.set(-1.4, pillarH * 0.5, 0);
          const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, pillarH, 0.7), basaltMat);
          p2.position.set(1.4, pillarH * 0.5, 0);
          const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.7, 0.9), basaltMat);
          lintel.position.set(0, pillarH + 0.35, 0);
          p1.castShadow = true; p2.castShadow = true; lintel.castShadow = true;
          group.add(p1, p2, lintel);

          // Glowing runic crystal suspended in the portal opening
          const rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), crystalMats[(made + 1) % crystalMats.length]);
          rune.position.set(0, pillarH * 0.55, 0);
          group.add(rune);
          colRadius = 2.4;
        } else if (sceneryType === 2) {
          // 3. Sacred Alchemical Trees & Ancient Groves
          const trunkH = 3.6;
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.65, trunkH, 6), woodMat);
          trunk.position.y = trunkH * 0.5;
          trunk.castShadow = true;
          group.add(trunk);

          const lMat = made % 2 === 0 ? leafMat1 : leafMat2;
          const canopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 0), lMat);
          canopy1.position.y = trunkH + 0.8;
          canopy1.castShadow = true;
          group.add(canopy1);

          const canopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), lMat);
          canopy2.position.y = trunkH + 2.1;
          canopy2.castShadow = true;
          group.add(canopy2);
          colRadius = 2.0;
        } else if (sceneryType === 3) {
          // 4. Basalt Mountain Crags & Stepped Rock Terraces
          const baseH = 2.8 + Math.random() * 3.8;
          const baseR = 2.4 + Math.random() * 2.2;
          const cone = new THREE.Mesh(new THREE.ConeGeometry(baseR, baseH, 6), rockMat);
          cone.position.y = baseH * 0.5;
          cone.castShadow = true;
          cone.receiveShadow = true;
          group.add(cone);

          // Secondary crag peak
          const cragH = baseH * 0.65;
          const crag = new THREE.Mesh(new THREE.ConeGeometry(baseR * 0.6, cragH, 5), rockMat);
          crag.position.set(baseR * 0.45, cragH * 0.5, baseR * 0.2);
          crag.castShadow = true;
          group.add(crag);
          colRadius = baseR * 0.85;
        } else {
          // 5. Celestial Trade Highway Pylon
          const pylonH = 6.2;
          const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.45, pylonH, 4), goldMat);
          pylon.position.y = pylonH * 0.5;
          pylon.castShadow = true;
          group.add(pylon);

          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.08, 6, 16), goldMat);
          ring.position.y = pylonH + 0.4;
          group.add(ring);
          colRadius = 1.6;
        }

        this.placeOnSphere(group, lat, lon, 0);
        this.scene.add(group);
        this.reliefGroups.push(group);
        this.surfaceColliders.push({ shape: 'cyl', group, x: 0, z: 0, r: colRadius });
        made++;
      }

      // 6. Grand Hermetic Elemental Monoliths (The 4 Cardinal Power Nexuses)
      this.elementalMonoliths = [];
      const elementalMonoliths = [
        { name: 'Monolith of Fire (Yod)', lat: -16, lon: 22, color: 0xf97316, emissive: 0xea580c },
        { name: 'Monolith of Air (Vav)', lat: 18, lon: -15, color: 0xfde047, emissive: 0xca8a04 },
        { name: 'Monolith of Water (Heh)', lat: 8, lon: -82, color: 0x38bdf8, emissive: 0x0284c7 },
        { name: 'Monolith of Earth (Heh Final)', lat: -15, lon: -115, color: 0x10b981, emissive: 0x059669 }
      ];

      elementalMonoliths.forEach(em => {
        const mGroup = new THREE.Group();
        mGroup.userData = { id: em.name, name: em.name, isMonolith: true };

        const mBase = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 0.8, 8), basaltMat);
        mBase.position.y = 0.4;
        mBase.castShadow = true;
        mBase.receiveShadow = true;
        mGroup.add(mBase);

        // Towering obsidian obelisk
        const obelisk = new THREE.Mesh(new THREE.ConeGeometry(1.2, 7.5, 4), basaltMat);
        obelisk.position.y = 4.5;
        obelisk.rotation.y = Math.PI / 4;
        obelisk.castShadow = true;
        mGroup.add(obelisk);

        // Pulsing elemental rune core
        const coreMat = new THREE.MeshStandardMaterial({
          color: em.color,
          emissive: em.emissive,
          emissiveIntensity: 0.95,
          roughness: 0.1,
          metalness: 0.9
        });
        const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.75, 0), coreMat);
        core.position.y = 4.8;
        mGroup.add(core);

        // Orbiting elemental energy ring
        const ringGeo = new THREE.TorusGeometry(1.6, 0.08, 6, 24);
        const ringMesh = new THREE.Mesh(ringGeo, coreMat);
        ringMesh.rotation.x = Math.PI / 2.2;
        ringMesh.position.y = 4.8;
        mGroup.add(ringMesh);

        this.placeOnSphere(mGroup, em.lat, em.lon, 0);
        this.scene.add(mGroup);
        this.reliefGroups.push(mGroup);
        this.surfaceColliders.push({ shape: 'cyl', group: mGroup, x: 0, z: 0, r: 2.8 });

        this.elementalMonoliths.push({ group: mGroup, core, ring: ringMesh });
      });
    }

    touchColliderGroup(group) {
      if (!group) return;
      const stamp = this._matrixStamp || 0;
      if (group.userData._matrixStamp === stamp) return;
      group.updateMatrixWorld();
      group.userData._matrixStamp = stamp;
    }

    pushOutOfCircle(worldPoint, col, radius) {
      this.touchColliderGroup(col.group);
      const local = col.group.worldToLocal(worldPoint.clone());
      if (Math.abs(local.y) > 14) return worldPoint;
      const dx = local.x - col.x;
      const dz = local.z - col.z;
      const dist = Math.hypot(dx, dz);
      const pad = radius == null ? this.playerRadius : radius;
      const limit = col.r + pad;
      if (dist >= limit) return worldPoint;
      const nx = dist < 1e-4 ? 1 : dx / dist;
      const nz = dist < 1e-4 ? 0 : dz / dist;
      local.x = col.x + nx * limit;
      local.z = col.z + nz * limit;
      return col.group.localToWorld(local).normalize().multiplyScalar(PLANET_RADIUS);
    }

    pushOutOfBox(worldPoint, col, radius) {
      this.touchColliderGroup(col.group);
      const local = col.group.worldToLocal(worldPoint.clone());
      if (Math.abs(local.y) > 14) return worldPoint;
      const dx = local.x - col.x;
      const dz = local.z - col.z;
      const cos = Math.cos(col.rot);
      const sin = Math.sin(col.rot);
      let lx = dx * cos - dz * sin;
      let lz = dx * sin + dz * cos;
      const pad = radius == null ? this.playerRadius : radius;
      const hx = col.hx + pad;
      const hz = col.hz + pad;
      if (Math.abs(lx) >= hx || Math.abs(lz) >= hz) return worldPoint;
      const penX = hx - Math.abs(lx);
      const penZ = hz - Math.abs(lz);
      if (penX < penZ) lx += Math.sign(lx || 1) * penX;
      else lz += Math.sign(lz || 1) * penZ;
      const ox = lx * cos + lz * sin;
      const oz = -lx * sin + lz * cos;
      local.x = col.x + ox;
      local.z = col.z + oz;
      return col.group.localToWorld(local).normalize().multiplyScalar(PLANET_RADIUS);
    }

    pushOutOfCollider(worldPoint, col, radius) {
      if (!col || !col.group) return worldPoint;
      if (col.shape === 'box' || col.shape === 'stair') return this.pushOutOfBox(worldPoint, col, radius);
      return this.pushOutOfCircle(worldPoint, col, radius);
    }

    // Cylinder radius of the robe, times the figure's scale. Leaders are larger.
    bodyRadius(ent) {
      const scale = ent && ent.scale && Number.isFinite(ent.scale.x) ? ent.scale.x : 1;
      return 0.58 * (scale > 0 ? scale : 1);
    }

    // Returns the same point when the gap is already open. Otherwise a point on the same radius.
    pushOutOfBody(point, otherPoint, minDist) {
      if (!point || !otherPoint || !(minDist > 0)) return point;
      if (point.distanceTo(otherPoint) >= minDist + 4) return point;
      const n = point.clone().normalize();
      const away = point.clone().sub(otherPoint);
      away.addScaledVector(n, -away.dot(n));
      const d = away.length();
      if (d >= minDist) return point;
      const dir = d < 1e-4 ? this.tangentBasis(n).east : away.multiplyScalar(1 / d);
      const len = point.length() > 1 ? point.length() : PLANET_RADIUS;
      return point.clone().addScaledVector(dir, minDist - d).normalize().multiplyScalar(len);
    }

    canClimbStairCollider(worldPoint, col) {
      if (!col || col.shape !== 'stair' || !col.group) return false;
      // Short plaza Belvedere stairs and Civic Hall interior stairs are always climbable
      if (!col.stairwayId) return true;
      const curElev = (this.avatar && (this.avatar.stairElevation || 0)) + Math.max(0, (this.avatar && this.avatar.hop) || 0);
      const tY = col.topY || 0.4;
      if (tY <= curElev + 2.8) return true;
      const st = this.stairways && this.stairways[col.stairwayId];
      if (!st || !st.group) return false;
      this.touchColliderGroup(st.group);
      const origin = st.group.getWorldPosition(this._v1);
      const normal = origin.clone().normalize();
      const axisX = st.group.localToWorld(this._v2.set(1, 0, 0)).sub(origin).normalize();
      const axisZ = st.group.localToWorld(this._v3.set(0, 0, 1)).sub(origin).normalize();
      const dir = worldPoint.clone().normalize();
      const sinPhi = Math.max(-1, Math.min(1, dir.dot(axisZ)));
      const side = Math.asin(sinPhi) * PLANET_RADIUS;
      const arc = Math.atan2(dir.dot(axisX), dir.dot(normal)) * PLANET_RADIUS;
      const halfW = (arc >= st.arc0 + st.flight - 0.3 ? (st.width + 0.7) * 0.5 : st.width * 0.5) + 0.38;
      if (Math.abs(side) <= halfW && arc >= st.arc0 - 1.2 && arc <= st.deckArc + st.landD * 0.5 + 0.6) {
        return curElev >= 0.15 || arc <= st.arc0 + st.run * 5.5;
      }
      return false;
    }

    sampleWalkerStairElevation(groundPoint, currentElev = 0) {
      let bestElev = 0;
      if (this.stairways) {
        const keys = Object.keys(this.stairways);
        for (let k = 0; k < keys.length; k++) {
          const st = this.stairways[keys[k]];
          if (!st || !st.group) continue;
          this.touchColliderGroup(st.group);
          const origin = st.group.getWorldPosition(this._v1);
          if (origin.distanceToSquared(groundPoint) > 65 * 65) continue;
          const normal = origin.clone().normalize();
          const axisX = st.group.localToWorld(this._v2.set(1, 0, 0)).sub(origin).normalize();
          const axisZ = st.group.localToWorld(this._v3.set(0, 0, 1)).sub(origin).normalize();
          const dir = groundPoint.clone().normalize();
          const sinPhi = Math.max(-1, Math.min(1, dir.dot(axisZ)));
          const side = Math.asin(sinPhi) * PLANET_RADIUS;
          const arc = Math.atan2(dir.dot(axisX), dir.dot(normal)) * PLANET_RADIUS;
          const deckHalfW = (st.width + 0.7) * 0.5 + 0.35;
          const stairHalfW = st.width * 0.5 + 0.35;
          const onDeckArc = arc >= st.arc0 + st.flight - 0.25 && arc <= st.deckArc + st.landD * 0.5 + 0.45;
          const onFlightArc = arc >= st.arc0 - 0.55 && arc <= st.arc0 + st.flight + 0.25;
          if (onDeckArc && Math.abs(side) <= deckHalfW) {
            const targetY = st.top + 0.2;
            bestElev = Math.max(bestElev, targetY);
          } else if (onFlightArc && Math.abs(side) <= stairHalfW) {
            const along = Math.max(0, Math.min(st.flight, arc - st.arc0));
            const rampY = (along / st.flight) * st.top;
            const stepIdx = Math.min(st.steps - 1, Math.max(0, Math.floor(along / st.run)));
            const treadY = (stepIdx + 1) * st.rise;
            const targetY = rampY * 0.72 + treadY * 0.28;
            bestElev = Math.max(bestElev, targetY);
          }
        }
      }
      for (let i = 0; i < this.surfaceColliders.length; i++) {
        const col = this.surfaceColliders[i];
        if (!col || col.shape !== 'stair' || !col.group || col.stairwayId) continue;
        this.touchColliderGroup(col.group);
        const local = col.group.worldToLocal(this._v4.copy(groundPoint));
        if (Math.abs(local.y) > 14) continue;
        const dx = local.x - col.x;
        const dz = local.z - col.z;
        if (dx * dx + dz * dz > 28) continue;
        const cos = Math.cos(col.rot);
        const sin = Math.sin(col.rot);
        const lx = dx * cos - dz * sin;
        const lz = dx * sin + dz * cos;
        if (Math.abs(lx) <= col.hx + 0.36 && Math.abs(lz) <= col.hz + 0.44) {
          const tY = col.topY || 0.35;
          if (tY <= currentElev + 2.1) {
            bestElev = Math.max(bestElev, tY);
          }
        }
      }
      return bestElev;
    }

    resolveCollisions(groundPoint, silent) {
      let p = groundPoint.clone().normalize().multiplyScalar(PLANET_RADIUS);
      const before = p.clone();
      const bodies = [...Object.values(this.agentEntities), ...Object.values(this.subagentEntities)];
      const structPad = 0.4;
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < this.surfaceColliders.length; i++) {
          const col = this.surfaceColliders[i];
          if (col && col.shape === 'stair' && this.canClimbStairCollider(p, col)) continue;
          p = this.pushOutOfCollider(p, col, structPad);
        }
      }
      const afterStructure = p.clone();
      const walkerAlt = (this.avatar && ((this.avatar.stairElevation || 0) + (this.avatar.hop || 0))) || 0;
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < bodies.length; i++) {
          const ent = bodies[i];
          if (!ent) continue;
          const entAlt = Math.max(0, ent.position.length() - PLANET_RADIUS);
          if (Math.abs(entAlt - walkerAlt) > 1.45) continue;
          p = this.pushOutOfBody(p, ent.position, this.playerRadius + this.bodyRadius(ent));
        }
      }
      if (!silent && before.distanceTo(p) > 0.12) {
        this.noteBoundary(afterStructure.distanceTo(p) > 0.05 ? 'Someone is there' : 'Solid structure');
      }
      return p;
    }

    separateCrowd(mobiles, fixed) {
      const list = mobiles || [];
      const anchors = fixed || [];
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < list.length; i++) {
          const a = list[i];
          if (!a || !a.ent) continue;
          let p = a.ent.position.clone();
          const len = a.onStair && p.length() > 1 ? p.length() : PLANET_RADIUS;
          if (!a.onStair) p.normalize().multiplyScalar(PLANET_RADIUS);
          let changed = false;
          const consider = (otherPos, otherR, share) => {
            if (!otherPos) return;
            const minDist = a.radius + otherR;
            const next = this.pushOutOfBody(p, otherPos, minDist);
            if (next === p) return;
            if (share) {
              const n = p.clone().normalize();
              const away = next.clone().sub(p);
              away.addScaledVector(n, -away.dot(n));
              p.addScaledVector(away, 0.5).normalize().multiplyScalar(len);
            } else {
              p = next.normalize().multiplyScalar(len);
            }
            changed = true;
          };
          for (let j = 0; j < list.length; j++) {
            if (i === j || !list[j].ent) continue;
            consider(list[j].ent.position, list[j].radius, true);
          }
          for (let k = 0; k < anchors.length; k++) {
            const anchor = anchors[k];
            const pos = anchor.ent ? anchor.ent.position : anchor.position;
            consider(pos, anchor.radius, false);
          }
          if (!a.onStair) {
            const ws = a.ent.userData && a.ent.userData.walkState;
            const home = ws && !ws.isPilgrimage && this.colonyGroups[ws.colonyKey];
            for (let c = 0; c < this.surfaceColliders.length; c++) {
              const col = this.surfaceColliders[c];
              if (!col || col.shape !== 'stair') continue;
              if (home && col.group !== home) continue;
              if (a.stairwayId && col.stairwayId === a.stairwayId) continue;
              const next = this.pushOutOfCollider(p, col, a.radius);
              if (next !== p) {
                p = next;
                changed = true;
              }
            }
          }
          if (!changed) continue;
          const ll = this.vec3ToLatLon(p);
          const altitude = a.onStair ? Math.max(0, p.length() - PLANET_RADIUS) : null;
          this.seatEntity(a.ent, ll.lat, ll.lon, altitude);
        }
      }
    }

    separateBodies() {
      const mobiles = [];
      const fixed = [];
      const all = [...Object.values(this.agentEntities), ...Object.values(this.subagentEntities)];
      for (let i = 0; i < all.length; i++) {
        const ent = all[i];
        if (!ent || !ent.userData) continue;
        const agent = ent.userData.agent;
        const ws = ent.userData.walkState;
        const posted = (agent && agent.post === 'station') || (ws && ws.posted);
        const meditating = !!(ws && ws.isMeditating) || (agent && (agent.state === 'MEDITATING_ADYTUM' || agent.state === 'CONTEMPLATING_ADYTUM'));
        const record = {
          ent,
          radius: this.bodyRadius(ent),
          onStair: !!(ws && ws.onStair),
          stairwayId: ws ? ws.stairwayId : null
        };
        if (posted || meditating) fixed.push(record);
        else mobiles.push(record);
      }
      if (this.isAvatarMode && this.avatar && this.avatar.normal) {
        fixed.push({
          position: this.avatar.normal.clone().multiplyScalar(PLANET_RADIUS),
          radius: this.playerRadius
        });
      }
      this.separateCrowd(mobiles, fixed);
    }

    holdWalkerClear() {
      if (!this.isAvatarMode || !this.avatar || !this.avatar.normal) return;
      const ground = this.avatar.normal.clone().multiplyScalar(PLANET_RADIUS);
      let p = ground;
      const bodies = [...Object.values(this.agentEntities), ...Object.values(this.subagentEntities)];
      const elev = this.avatar.stairElevation || 0;
      const hop = this.avatar.hop || 0;
      const walkerAlt = elev + hop;
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < bodies.length; i++) {
          const ent = bodies[i];
          if (!ent) continue;
          const entAlt = Math.max(0, ent.position.length() - PLANET_RADIUS);
          if (Math.abs(entAlt - walkerAlt) > 1.45) continue;
          p = this.pushOutOfBody(p, ent.position, this.playerRadius + this.bodyRadius(ent));
        }
      }
      if (p === ground) return;
      const normal = p.clone().normalize();
      this.avatar.normal.copy(normal);
      this.avatar.position.copy(normal).multiplyScalar(PLANET_RADIUS + elev + hop);
      const forward = this.avatar.forward.clone().addScaledVector(normal, -this.avatar.forward.dot(normal));
      if (forward.lengthSq() > 1e-8) this.avatar.forward.copy(forward.normalize());
      const look = this.avatarLook(normal, this.avatar.forward, hop, this.avatar.bob || 0);
      const camPos = this.walkCameraPosition(look, this.avatar.forward, normal, this.avatar.pitch, this.avatar.camDist);
      this.camera.up.copy(normal);
      this.camera.position.copy(camPos);
      this.camera.lookAt(look);
      this.placeWalker(normal, this.avatar.forward, hop);
    }

    // Plaza tops are built above the sphere. Drop each colony so that top is the ground you walk.
    sinkColoniesToSurface() {
      const groundY = {
        colony_capital: 2.2,
        colony_nova_zoth: 1.2,
        colony_sol_crypta: 1.2,
        colony_adytum_grove: 1.2,
        colony_hex_bastion: 1.4
      };
      Object.keys(groundY).forEach((key) => {
        const group = this.colonyGroups[key];
        if (!group) return;
        const yard = new THREE.Group();
        yard.name = 'yard';
        while (group.children.length) yard.add(group.children[0]);
        yard.position.y = -(groundY[key] - 0.06);
        group.add(yard);
        group.userData.groundY = groundY[key];
      });
    }

    mergeGeometries(geos) {
      let vertCount = 0;
      let indexCount = 0;
      for (let g = 0; g < geos.length; g++) {
        const pos = geos[g].getAttribute('position');
        if (!pos) continue;
        vertCount += pos.count;
        const idx = geos[g].getIndex();
        indexCount += idx ? idx.count : pos.count;
      }
      const positions = new Float32Array(vertCount * 3);
      const normals = new Float32Array(vertCount * 3);
      const indices = vertCount > 65535 ? new Uint32Array(indexCount) : new Uint16Array(indexCount);
      let v = 0;
      let iOff = 0;
      for (let g = 0; g < geos.length; g++) {
        const pos = geos[g].getAttribute('position');
        if (!pos) continue;
        const nor = geos[g].getAttribute('normal');
        const idx = geos[g].getIndex();
        for (let n = 0; n < pos.count; n++) {
          positions[(v + n) * 3] = pos.getX(n);
          positions[(v + n) * 3 + 1] = pos.getY(n);
          positions[(v + n) * 3 + 2] = pos.getZ(n);
          if (nor) {
            normals[(v + n) * 3] = nor.getX(n);
            normals[(v + n) * 3 + 1] = nor.getY(n);
            normals[(v + n) * 3 + 2] = nor.getZ(n);
          } else {
            normals[(v + n) * 3 + 1] = 1;
          }
        }
        if (idx) {
          for (let n = 0; n < idx.count; n++) indices[iOff + n] = idx.getX(n) + v;
          iOff += idx.count;
        } else {
          for (let n = 0; n < pos.count; n++) indices[iOff + n] = v + n;
          iOff += pos.count;
        }
        v += pos.count;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      geo.setIndex(new THREE.BufferAttribute(indices, 1));
      return geo;
    }

    mergeMeshes(parent, meshes) {
      const baked = [];
      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        mesh.updateMatrix();
        const geo = mesh.geometry.clone();
        geo.applyMatrix4(mesh.matrix);
        baked.push(geo);
      }
      const mergedGeo = this.mergeGeometries(baked);
      baked.forEach((geo) => geo.dispose());
      const merged = new THREE.Mesh(mergedGeo, meshes[0].material);
      merged.castShadow = meshes.some((mesh) => mesh.castShadow);
      merged.receiveShadow = meshes.some((mesh) => mesh.receiveShadow);
      if (!meshes.some((mesh) => !(mesh.userData && mesh.userData.noOcclude))) merged.userData.noOcclude = true;
      merged.userData.mergedStatic = true;
      parent.add(merged);
      meshes.forEach((mesh) => {
        if (mesh.geometry) mesh.geometry.dispose();
        parent.remove(mesh);
      });
    }

    compactParent(parent) {
      if (!parent || !parent.children || parent.children.length < 2) return;
      const buckets = new Map();
      const kids = parent.children.slice();
      for (let i = 0; i < kids.length; i++) {
        const mesh = kids[i];
        if (!mesh.isMesh || !mesh.geometry || !mesh.material || Array.isArray(mesh.material)) continue;
        if (mesh.material.transparent) continue;
        const ud = mesh.userData || {};
        if (ud.stairTread || ud.keepMesh || ud.mergedStatic || ud.civicStair) continue;
        let list = buckets.get(mesh.material.uuid);
        if (!list) {
          list = [];
          buckets.set(mesh.material.uuid, list);
        }
        list.push(mesh);
      }
      buckets.forEach((list) => {
        if (list.length > 1) this.mergeMeshes(parent, list);
      });
    }

    compactTree(root) {
      if (!root) return;
      const parents = [];
      root.traverse((obj) => {
        if (obj.children && obj.children.length > 1) parents.push(obj);
      });
      for (let i = 0; i < parents.length; i++) this.compactParent(parents[i]);
    }

    compactStaticScene() {
      this.compactTree(this.scene);
    }

    fitRenderer() {
      if (!this.container || !this.renderer || !this.camera) return;
      const width = Math.max(1, this.container.clientWidth || window.innerWidth);
      const height = Math.max(1, this.container.clientHeight || window.innerHeight);
      let ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const budget = 1920 * 1080 * 1.25;
      if (width * height * ratio * ratio > budget) {
        ratio = Math.max(1, Math.sqrt(budget / (width * height)));
      }
      this.renderer.setPixelRatio(ratio);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      if (this.scene && this.planetMesh) {
        if (this.controls && !this.isAvatarMode && this.viewMode !== 'local' && !this.cameraTransition) {
          this.controls.update();
        }
        this.renderer.render(this.scene, this.camera);
      }
    }

    applyDetailToEntity(ent) {
      const parts = ent && ent.userData && ent.userData.lodParts;
      if (!parts) return;
      const close = this.viewDetailClose !== false;
      for (let i = 0; i < parts.length; i++) parts[i].visible = close;
    }

    // Stairs, name plates, and small costume pieces are sub-pixel from orbit.
    syncViewDetail() {
      if (!this.camera) return;
      const close = !!(
        this.isAvatarMode ||
        this.viewMode === 'local' ||
        this.cameraTransition ||
        this.camera.position.length() < PLANET_RADIUS + 80
      );
      if (close === this.viewDetailClose) return;
      this.viewDetailClose = close;
      const rigs = this.detailRigs || [];
      for (let i = 0; i < rigs.length; i++) rigs[i].visible = close;
      const stairs = this.stairways || {};
      Object.keys(stairs).forEach((key) => {
        if (stairs[key] && stairs[key].rig) stairs[key].rig.visible = close;
      });
      const spirits = this.datamoshSpirits || [];
      for (let i = 0; i < spirits.length; i++) {
        if (spirits[i].group) spirits[i].group.visible = close;
      }
      const apply = (map) => {
        Object.keys(map || {}).forEach((id) => this.applyDetailToEntity(map[id]));
      };
      apply(this.agentEntities);
      apply(this.subagentEntities);
    }

    collectOccluders() {
      this.occluders = [];
      const groups = Object.values(this.colonyGroups);
      for (let i = 0; i < groups.length; i++) {
        groups[i].traverse((obj) => {
          if (!obj.isMesh || !obj.geometry) return;
          if (obj.userData && obj.userData.noOcclude) return;
          const mat = obj.material;
          if (mat && mat.transparent) return;
          this.occluders.push(obj);
        });
      }
      const relief = this.reliefGroups || [];
      for (let i = 0; i < relief.length; i++) {
        relief[i].traverse((obj) => {
          if (obj.isMesh && obj.geometry) this.occluders.push(obj);
        });
      }
    }

    noteBoundary(text) {
      this.boundaryNote = text;
      this.boundaryNoteUntil = performance.now() + 700;
      if (typeof document === 'undefined') return;
      const el = document.getElementById('boundaryToast');
      if (el) {
        el.hidden = false;
        el.textContent = text;
      }
    }

    // Each route ends with the Stairway to Zoth. A pilgrimage used to keep a
    // capital index after the agent arrived, so an index past the route was read
    // off the end and the frame threw before it could render.
    routeFor(colonyKey) {
      if (colonyKey && Object.prototype.hasOwnProperty.call(COLONY_WAYPOINTS, colonyKey)) {
        const route = COLONY_WAYPOINTS[colonyKey];
        if (Array.isArray(route) && route.length > 0) return route;
      }
      return COLONY_WAYPOINTS.colony_capital;
    }

    wrapStop(index, length) {
      const n = length | 0;
      if (n <= 0) return 0;
      const k = Math.floor(Number(index));
      if (!Number.isFinite(k)) return 0;
      return ((k % n) + n) % n;
    }

    stopUsable(route, index) {
      const stop = route[index];
      return !!(stop && Number.isFinite(stop.lat) && Number.isFinite(stop.lon));
    }

    bindRoute(ws) {
      let route = this.routeFor(ws.colonyKey);
      if (COLONY_WAYPOINTS[ws.colonyKey] !== route) {
        ws.colonyKey = 'colony_capital';
        route = COLONY_WAYPOINTS.colony_capital;
      }
      const n = route.length;
      let a = this.wrapStop(ws.currentIdx, n);
      let b = this.wrapStop(ws.targetIdx, n);
      if (!this.stopUsable(route, a)) a = 0;
      if (!this.stopUsable(route, b)) b = n > 1 ? 1 : 0;
      if (a === b && n > 1) {
        b = (a + 1) % n;
        if (!this.stopUsable(route, b)) {
          for (let i = 0; i < n; i++) {
            if (i !== a && this.stopUsable(route, i)) { b = i; break; }
          }
        }
      }
      ws.currentIdx = a;
      ws.targetIdx = b;
      return route;
    }

    nextStop(route, fromIdx) {
      const n = route.length;
      if (n <= 1) return 0;
      const from = this.wrapStop(fromIdx, n);
      for (let i = 0; i < n; i++) {
        if (route[i] && route[i].stairwayId && i !== from && Math.random() < 0.34) return i;
      }
      const hop = 1 + Math.floor(Math.random() * (n - 1));
      return (from + hop) % n;
    }

    seatEntity(ent, lat, lon, altitude) {
      const ws = ent.userData.walkState;
      let face = ws && ws.faceDir;
      if (ws && ws._seatLat !== undefined) {
        const prev = this.latLonToVec3(ws._seatLat, ws._seatLon, PLANET_RADIUS);
        const next = this.latLonToVec3(lat, lon, PLANET_RADIUS);
        const delta = next.sub(prev);
        if (delta.lengthSq() > 1e-8) {
          ws.faceDir = delta.clone();
          face = ws.faceDir;
        }
      }
      if (ws) {
        ws._seatLat = lat;
        ws._seatLon = lon;
        ws.curLat = lat;
        ws.curLon = lon;
      }
      const lift = Number.isFinite(altitude) ? altitude : 0.06;
      this.placeOnSphereFacing(ent, lat, lon, lift, face);
    }

    sampleWalk(p1, p2, t) {
      const u = Math.max(0, Math.min(1, Number(t) || 0));
      const ground = (lat, lon, altitude, onStair, stairwayId) => ({
        lat, lon, altitude, onStair: !!onStair, stairwayId: stairwayId || null
      });
      if (!p1 || !p2) {
        const p = p1 || p2 || { lat: 0, lon: 0 };
        return ground(p.lat, p.lon, null, false, null);
      }
      const climbTo = p2.stairwayId && this.stairways[p2.stairwayId];
      const climbFrom = p1.stairwayId && this.stairways[p1.stairwayId];
      if (climbTo && climbTo === climbFrom) {
        const pose = this.pointOnStair(climbTo, 1);
        return ground(pose.lat, pose.lon, pose.altitude, true, climbTo.id);
      }
      if (climbTo && !climbFrom) {
        const cut = 0.42;
        if (u <= cut) {
          const k = u / cut;
          return ground(
            p1.lat + (climbTo.foot.lat - p1.lat) * k,
            p1.lon + (climbTo.foot.lon - p1.lon) * k,
            (climbTo.footAltitude || 0) * k,
            true,
            climbTo.id
          );
        }
        const pose = this.pointOnStair(climbTo, (u - cut) / (1 - cut));
        return ground(pose.lat, pose.lon, pose.altitude, true, climbTo.id);
      }
      if (climbFrom && !climbTo) {
        const cut = 0.42;
        if (u <= cut) {
          const pose = this.pointOnStair(climbFrom, 1 - u / cut);
          return ground(pose.lat, pose.lon, pose.altitude, true, climbFrom.id);
        }
        const k = (u - cut) / (1 - cut);
        return ground(
          climbFrom.foot.lat + (p2.lat - climbFrom.foot.lat) * k,
          climbFrom.foot.lon + (p2.lon - climbFrom.foot.lon) * k,
          (climbFrom.footAltitude || 0) * (1 - k),
          true,
          climbFrom.id
        );
      }
      return ground(
        p1.lat + (p2.lat - p1.lat) * u,
        p1.lon + (p2.lon - p1.lon) * u,
        null,
        false,
        null
      );
    }

    beginRoute(entity, colonyKey, startIdx, nextIdx, progress, speed) {
      const waypoints = this.routeFor(colonyKey);
      const p1 = waypoints[startIdx] || waypoints[0];
      const p2 = waypoints[nextIdx] || p1;
      const pose = this.sampleWalk(p1, p2, progress);
      entity.userData.walkState = {
        colonyKey,
        currentIdx: startIdx,
        targetIdx: nextIdx,
        progress,
        speed,
        bobTick: Math.random() * 10,
        isIdle: false,
        idleTimer: 0,
        onStair: pose.onStair,
        stairwayId: pose.stairwayId,
        curLat: pose.lat,
        curLon: pose.lon
      };
      this.seatEntity(entity, pose.lat, pose.lon, pose.altitude);
    }

    clearNode(node) {
      while (node && node.firstChild) node.removeChild(node.firstChild);
    }

    bindEncounterUi() {
      const click = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
      };
      click('encounterApproach', () => {
        if (!this.encounter) return;
        if (this.encounter.type === 'city') this.focusColony(this.encounter.colonyId);
        else if (this.encounter.agent) this.presentAgent(this.encounter.agent.id);
      });
      click('encounterWalk', () => {
        if (!this.encounter) return;
        if (this.encounter.type === 'agent' && this.encounter.agent) this.walkToAgent(this.encounter.agent.id);
        else if (this.encounter.colonyId && COLONY_COORDS[this.encounter.colonyId]) {
          const c = COLONY_COORDS[this.encounter.colonyId];
          this.enterAvatarMode(this.latLonToVec3(c.lat + 4.8, c.lon, PLANET_RADIUS));
        }
      });
      click('encounterSpeak', () => {
        if (this.encounter && this.encounter.agent) this.openDialogue(this.encounter.agent);
      });
      click('encounterDossier', () => {
        if (!this.encounter) return;
        if (this.encounter.type === 'agent' && typeof window.showAgentInspector === 'function') {
          window.showAgentInspector(this.encounter.agent);
        } else if (typeof window.showBuildingInspector === 'function') {
          const col = COLONY_COORDS[this.encounter.colonyId] || {};
          window.showBuildingInspector({
            name: col.name || 'Settlement',
            category: 'Continental Settlement',
            desc: this.encounter.role || '',
            level: 3,
            icon: col.banner || '🏛️'
          });
        }
      });
      click('encounterClose', () => this.closeEncounter());
      click('btnDialogueWalk', () => {
        if (this.dialogueAgentId) this.walkToAgent(this.dialogueAgentId);
      });
      click('btnDialogueTalk', () => this.setDialogueKind('conversation'));
      click('btnDialogueAssign', () => this.setDialogueKind('assignment'));
      click('btnDialogueSend', () => this.sendDialogue());
      click('btnDialogueMic', () => this.toggleDialogueMic());
      click('btnLiveTalk', () => this.toggleLiveConversation());
      const keepVoice = document.getElementById('chkDialogueKeepVoice');
      if (keepVoice) keepVoice.addEventListener('change', () => this.onDialogueKeepChange());
      this.syncLiveTalkButton();
      this.syncDialogueMicButton();
      const prompt = document.getElementById('avatarDialoguePrompt');
      if (prompt) {
        prompt.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' && !ev.shiftKey) {
            ev.preventDefault();
            this.sendDialogue();
          }
        });
      }
    }

    bindCivicUi() {
      const close = document.getElementById('civicClose');
      if (close) close.addEventListener('click', () => this.closeCivic());
    }

    loadCivicState() {
      this.civicState = { installed: {}, made: [], studies: [] };
      let data = null;
      try {
        const raw = localStorage.getItem('zoth-civic-v1');
        if (raw) data = JSON.parse(raw);
      } catch (err) {
        data = null;
      }
      if (!data || typeof data !== 'object') return;
      const installed = {};
      const source = data.installed && typeof data.installed === 'object' ? data.installed : {};
      Object.keys(source).forEach((id) => {
        if (!source[id] || typeof id !== 'string' || !id || id.length > 80) return;
        if (Object.keys(installed).length >= 80) return;
        installed[id] = true;
      });
      const made = [];
      if (Array.isArray(data.made)) {
        data.made.forEach((item) => {
          if (!item || typeof item.name !== 'string' || typeof item.purpose !== 'string') return;
          const name = item.name.trim().slice(0, 48);
          const purpose = item.purpose.trim().slice(0, 160);
          if (!name || !purpose) return;
          made.push({
            id: typeof item.id === 'string' && item.id ? item.id.slice(0, 40) : 'made-' + made.length,
            name,
            purpose
          });
        });
      }
      const studies = [];
      if (Array.isArray(data.studies)) {
        data.studies.forEach((item) => {
          if (!item || !this.civicById[item.id]) return;
          const stage = Math.max(0, Math.min(3, Math.floor(Number(item.stage)) || 0));
          studies.push({ id: item.id, stage });
        });
      }
      this.civicState = { installed, made, studies };
    }

    saveCivicState() {
      try {
        localStorage.setItem('zoth-civic-v1', JSON.stringify(this.civicState));
      } catch (err) {
        this.setCivicStatus('This browser kept the change for this visit only.');
      }
    }

    setCivicStatus(text) {
      const el = document.getElementById('civicStatus');
      if (el) el.textContent = text || '';
    }

    closeCivic() {
      this.civicOpenId = null;
      this.civicRemoveId = null;
      const panel = document.getElementById('civicPanel');
      if (panel) panel.hidden = true;
    }

    openCivic(id) {
      const hall = this.civicById[id];
      const panel = document.getElementById('civicPanel');
      if (!hall || !panel) return;
      this.closeEncounter();
      this.civicOpenId = id;
      this.civicRemoveId = null;
      panel.hidden = false;
      const kicker = document.getElementById('civicKicker');
      const title = document.getElementById('civicTitle');
      const lead = document.getElementById('civicLead');
      if (kicker) kicker.textContent = hall.cityName;
      if (title) title.textContent = hall.name;
      if (lead) lead.textContent = hall.lead;
      this.paintKeeper(hall);
      const intro = hall.kind === 'install'
        ? 'Install a specialized skill, or unequip one.'
        : hall.kind === 'forge'
          ? 'Name the sigil and define its sovereign prompt purpose.'
          : 'Advance the research study, or file discoveries.';
      this.setCivicStatus(intro);
      this.renderCivic(hall, { focus: true });
    }

    paintKeeper(hall) {
      const keeperEl = document.getElementById('civicKeeper');
      if (!keeperEl || !hall) return;
      const keeper = this.keeperFor(hall);
      const role = (hall.lore && hall.lore.keeperRole) || 'Keeper';
      const promptLead = (hall.lore && hall.lore.keeperLead) || '';
      keeperEl.textContent = keeper
        ? `${role} ${keeper.name} is in charge of this stall. "${promptLead || String(keeper.speech || '').slice(0, 160)}"`
        : `${role} is in charge of this stall. ${promptLead}`;
    }

    renderCivic(hall, opts) {
      const body = document.getElementById('civicBody');
      if (!body || !hall) return;
      this.paintKeeper(hall);
      this.clearNode(body);
      this.appendLiveHallTerminal(body, hall);
      if (hall.kind === 'install') this.renderInstall(body, hall);
      else if (hall.kind === 'forge') this.renderForge(body, hall);
      else this.renderResearch(body, hall);
      const options = opts || {};
      if (options.focusId) {
        const el = document.getElementById(options.focusId);
        if (el) el.focus();
      } else if (options.focus) {
        const first = body.querySelector('button, input, textarea');
        if (first) first.focus();
      }
    }

    appendLiveHallTerminal(body, hall) {
      if (!this.hallSessions) this.hallSessions = {};
      const box = document.createElement('div');
      box.className = 'civic-row civic-live-terminal';
      box.style.background = 'rgba(8, 10, 20, 0.78)';
      box.style.border = '1px solid rgba(233, 196, 106, 0.34)';
      box.style.borderRadius = '12px';
      box.style.padding = '10px 12px';
      box.style.marginBottom = '10px';

      const head = document.createElement('div');
      head.style.display = 'flex';
      head.style.justifyContent = 'space-between';
      head.style.alignItems = 'center';
      head.style.gap = '8px';
      head.style.marginBottom = '6px';

      const tag = document.createElement('span');
      tag.style.fontFamily = "var(--font-pixel, 'JetBrains Mono', monospace)";
      tag.style.fontSize = '10px';
      tag.style.fontWeight = '800';
      tag.style.letterSpacing = '0.08em';
      tag.style.color = '#E9C46A';
      tag.textContent = '⚡ LIVE HALL TERMINAL · SPATIAL SYNTHESIS';

      const colonyAgents = this.agentsInColony(hall.colonyKey);
      const countBadge = document.createElement('span');
      countBadge.style.fontSize = '10px';
      countBadge.style.color = '#5EEAD4';
      countBadge.textContent = `${colonyAgents.length} Pantheon in Colony`;

      head.appendChild(tag);
      head.appendChild(countBadge);
      box.appendChild(head);

      const keeper = this.keeperFor(hall);
      const leadAgent = colonyAgents[0] || Object.values(this.agentEntities)[0]?.userData?.agent || null;
      const peerAgent = colonyAgents[1] || Object.values(this.agentEntities)[1]?.userData?.agent || null;

      const logEl = document.createElement('pre');
      logEl.id = 'civicLiveTerminalLog';
      logEl.style.margin = '0 0 8px';
      logEl.style.padding = '8px 10px';
      logEl.style.borderRadius = '8px';
      logEl.style.background = 'rgba(0, 0, 0, 0.55)';
      logEl.style.border = '1px solid rgba(255, 255, 255, 0.08)';
      logEl.style.color = '#E2E8F0';
      logEl.style.fontFamily = "var(--font-mono, 'JetBrains Mono', monospace)";
      logEl.style.fontSize = '10.5px';
      logEl.style.lineHeight = '1.45';
      logEl.style.whiteSpace = 'pre-wrap';
      logEl.style.maxHeight = '115px';
      logEl.style.overflowY = 'auto';

      const lastSession = this.hallSessions[hall.id];
      if (lastSession) {
        logEl.textContent = lastSession;
      } else {
        const activeCraft = (leadAgent && leadAgent.consciousTask && leadAgent.consciousTask.action)
          || (keeper && keeper.speech)
          || 'Ready to dispatch spatial pair-session in ' + hall.name + '.';
        const targetRepo = (leadAgent && leadAgent.consciousTask && leadAgent.consciousTask.targetApp) || hall.cityName;
        logEl.textContent = `[HALL] ${hall.name} (${hall.cityName})\n[FOCUS] ${targetRepo}\n[TRACE] ${activeCraft}`;
      }
      box.appendChild(logEl);

      const actions = document.createElement('div');
      actions.className = 'civic-actions';
      const pairBtn = document.createElement('button');
      pairBtn.type = 'button';
      pairBtn.className = 'civic-action';
      pairBtn.id = 'civicRunPairSession';
      const pairNames = leadAgent && peerAgent
        ? `${leadAgent.name} × ${peerAgent.name}`
        : (leadAgent ? leadAgent.name : 'Pantheon');
      pairBtn.textContent = `⚡ Pair-Session (${pairNames})`;

      pairBtn.addEventListener('click', async () => {
        pairBtn.disabled = true;
        pairBtn.textContent = '⚡ Synthesizing Live Turn...';
        if (typeof HermeticAudio !== 'undefined' && HermeticAudio.playPairChime) {
          HermeticAudio.playPairChime();
        }
        try {
          const targetId = (leadAgent && leadAgent.id) || 'athena';
          const partnerName = (peerAgent && peerAgent.name) || (keeper && keeper.name) || 'Keeper';
          const prompt = `Spatial Pair-Session inside ${hall.name} (${hall.cityName}) with ${partnerName}: synthesize concrete engineering next step for ${hall.lead}`;
          const res = await fetch('/api/subconscious/influence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId: targetId, kind: 'conversation', text: prompt })
          });
          const data = await res.json();
          if (data && data.agent) {
            const reply = data.agent.speech || data.agent.voiceLine || 'Pair synthesis committed to colony ledger.';
            const appName = (data.agent.consciousTask && data.agent.consciousTask.targetApp) || hall.cityName;
            const out = `[PAIR] ${data.agent.name} × ${partnerName} @ ${hall.name}\n[TARGET] ${appName}\n[OUTPUT] ${reply}`;
            this.hallSessions[hall.id] = out;
            logEl.textContent = out;
            this.setCivicStatus(`${data.agent.name} & ${partnerName} completed a hall pair-session.`);
          } else {
            logEl.textContent = `[PAIR] ${pairNames}\n[STATUS] Recorded in ${hall.name} ledger.`;
          }
        } catch (err) {
          logEl.textContent = `[PAIR] ${pairNames}\n[NOTE] ${err.message || 'Local synthesis recorded.'}`;
        } finally {
          pairBtn.disabled = false;
          pairBtn.textContent = `⚡ Pair-Session (${pairNames})`;
        }
      });

      actions.appendChild(pairBtn);
      box.appendChild(actions);
      body.appendChild(box);
    }

    keeperFor(hall) {
      const subs = (this.lineage && this.lineage.subagents) || [];
      return subs.find((sub) => sub && sub.stationId === hall.id) || null;
    }

    skillsAt(stationId) {
      return (this.stationSkills || []).filter((skill) => skill && skill.stationId === stationId);
    }

    refreshOpenStall() {
      if (!this.civicOpenId || !this.civicById[this.civicOpenId]) return;
      const body = document.getElementById('civicBody');
      const focused = body && document.activeElement && body.contains(document.activeElement);
      const stamp = JSON.stringify(this.stationSkills || []);
      if (focused || stamp === this._skillStamp) return;
      this._skillStamp = stamp;
      const hall = this.civicById[this.civicOpenId];
      this.renderCivic(hall, {});
    }

    async askStation(hall, payload) {
      const seek = !!(payload && payload.seek);
      const res = await fetch(seek ? '/api/stations/seek' : '/api/stations/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: hall.id,
          name: payload && payload.name,
          purpose: payload && payload.purpose
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error((data && data.error) || 'The keeper did not answer.');
      if (Array.isArray(data.stationSkills)) {
        this.stationSkills = data.stationSkills;
        if (this.lineage) this.lineage.stationSkills = data.stationSkills;
      }
      if (data.keeper && this.lineage && Array.isArray(this.lineage.subagents)) {
        const idx = this.lineage.subagents.findIndex((sub) => sub && sub.id === data.keeper.id);
        if (idx >= 0) this.lineage.subagents[idx] = data.keeper;
        const ent = this.subagentEntities[data.keeper.id];
        if (ent) ent.userData.agent = data.keeper;
      }
      this._skillStamp = JSON.stringify(this.stationSkills || []);
      return data;
    }

    appendCarryRow(body, skill) {
      const row = document.createElement('div');
      row.className = 'civic-row';
      const title = document.createElement('h3');
      title.textContent = (skill.icon ? `${skill.icon} ` : '⚡ ') + skill.name;
      const blurb = document.createElement('p');
      const source = skill.source === 'request'
        ? 'Made here from a request.'
        : skill.source === 'gazette'
          ? 'Brought in from the civic gazette.'
          : '';
      blurb.textContent = source ? `${skill.blurb || ''} ${source}` : (skill.blurb || '');
      const actions = document.createElement('div');
      actions.className = 'civic-actions';
      const on = !!this.civicState.installed[skill.id];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'civic-action' + (on ? ' civic-quiet' : '');
      btn.id = 'civic-skill-' + skill.id;
      btn.textContent = on ? 'Unequip' : 'Install';
      btn.addEventListener('click', () => {
        if (this.civicState.installed[skill.id]) {
          delete this.civicState.installed[skill.id];
          this.setCivicStatus(skill.name + ' set down.');
        } else {
          this.civicState.installed[skill.id] = true;
          this.setCivicStatus(skill.name + ' installed.');
        }
        this.saveCivicState();
        const hall = this.civicById[this.civicOpenId];
        if (hall) this.renderCivic(hall, { focusId: btn.id });
      });
      actions.appendChild(btn);
      row.appendChild(title);
      row.appendChild(blurb);
      row.appendChild(actions);
      body.appendChild(row);
    }

    appendSeekButton(body, hall) {
      const actions = document.createElement('div');
      actions.className = 'civic-actions';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'civic-action';
      btn.id = 'civicSeek';
      btn.textContent = 'Ask the keeper to bring a skill';
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          const data = await this.askStation(hall, { seek: true });
          if (!data.skill) this.setCivicStatus('This shelf already holds three gazette skills.');
          else this.setCivicStatus((this.keeperFor(hall) ? this.keeperFor(hall).name : 'The keeper') + ' brought in ' + data.skill.name + '.');
        } catch (err) {
          this.setCivicStatus(err.message || 'The keeper did not answer.');
        }
        this.renderCivic(hall, { focusId: 'civicSeek' });
      });
      actions.appendChild(btn);
      body.appendChild(actions);
    }

    renderInstall(body, hall) {
      this.appendSeekButton(body, hall);
      const colonySkills = (COLONY_CIVIC_SKILLS && hall.colonyKey && COLONY_CIVIC_SKILLS[hall.colonyKey]) || DEFAULT_FRONTIER_SKILLS;
      colonySkills.forEach((skill) => this.appendCarryRow(body, skill));
      this.skillsAt(hall.id).forEach((skill) => this.appendCarryRow(body, skill));
    }

    renderForge(body, hall) {
      const nameField = document.createElement('label');
      nameField.className = 'civic-field';
      nameField.htmlFor = 'civicSkillName';
      const nameLabel = document.createElement('span');
      nameLabel.textContent = 'Skill name';
      const nameInput = document.createElement('input');
      nameInput.id = 'civicSkillName';
      nameInput.maxLength = 48;
      nameInput.autocomplete = 'off';
      nameField.appendChild(nameLabel);
      nameField.appendChild(nameInput);

      const purposeField = document.createElement('label');
      purposeField.className = 'civic-field';
      purposeField.htmlFor = 'civicSkillPurpose';
      const purposeLabel = document.createElement('span');
      purposeLabel.textContent = 'Purpose';
      const purposeInput = document.createElement('textarea');
      purposeInput.id = 'civicSkillPurpose';
      purposeInput.maxLength = 160;
      purposeInput.rows = 3;
      purposeField.appendChild(purposeLabel);
      purposeField.appendChild(purposeInput);

      const make = document.createElement('button');
      make.type = 'button';
      make.className = 'civic-action';
      make.id = 'civicMake';
      make.textContent = 'Ask the keeper';
      make.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        const purpose = purposeInput.value.trim();
        if (!name || !purpose) {
          this.setCivicStatus('A skill needs both a name and a purpose.');
          (name ? purposeInput : nameInput).focus();
          return;
        }
        make.disabled = true;
        try {
          const data = await this.askStation(hall, { name, purpose });
          const keeper = this.keeperFor(hall);
          this.setCivicStatus((keeper ? keeper.name : 'The keeper') + ' is making ' + (data.skill ? data.skill.name : name.slice(0, 48)) + '.');
        } catch (err) {
          this.civicState.made.push({
            id: 'made-' + Date.now().toString(36) + '-' + this.civicState.made.length,
            name: name.slice(0, 48),
            purpose: purpose.slice(0, 160)
          });
          this.saveCivicState();
          this.setCivicStatus(err.message || 'The stall kept this skill for this visit.');
        }
        this.renderCivic(hall, { focusId: 'civicMake' });
      });

      body.appendChild(nameField);
      body.appendChild(purposeField);
      const makeRow = document.createElement('div');
      makeRow.className = 'civic-actions';
      makeRow.appendChild(make);
      body.appendChild(makeRow);

      this.civicState.made.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'civic-row';
        const title = document.createElement('h3');
        title.textContent = item.name;
        const blurb = document.createElement('p');
        blurb.textContent = item.purpose;
        const actions = document.createElement('div');
        actions.className = 'civic-actions';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'civic-action civic-danger';
        btn.id = 'civic-remove-' + item.id;
        const armed = this.civicRemoveId === item.id;
        btn.textContent = armed ? 'Remove?' : 'Remove';
        btn.addEventListener('click', () => {
          if (this.civicRemoveId !== item.id) {
            this.civicRemoveId = item.id;
            this.setCivicStatus('Remove ' + item.name + '? Press Remove again.');
            this.renderCivic(hall, { focusId: btn.id });
            return;
          }
          this.civicState.made = this.civicState.made.filter((made) => made.id !== item.id);
          this.civicRemoveId = null;
          this.saveCivicState();
          this.setCivicStatus(item.name + ' removed.');
          this.renderCivic(hall, { focusId: 'civicMake' });
        });
        actions.appendChild(btn);
        row.appendChild(title);
        row.appendChild(blurb);
        row.appendChild(actions);
        body.appendChild(row);
      });
      this.skillsAt(hall.id).forEach((skill) => this.appendCarryRow(body, skill));
    }

    renderResearch(body, hall) {
      const found = this.civicState.studies.find((item) => item.id === hall.id);
      const stage = found ? found.stage : 0;
      const row = document.createElement('div');
      row.className = 'civic-row';
      const title = document.createElement('h3');
      title.textContent = RESEARCH_STAGES[stage] || RESEARCH_STAGES[0];
      const blurb = document.createElement('p');
      blurb.textContent = 'This study stays in this hall. Advance it one stage at a time.';
      const actions = document.createElement('div');
      actions.className = 'civic-actions';
      const advance = document.createElement('button');
      advance.type = 'button';
      advance.className = 'civic-action';
      advance.id = 'civicAdvance';
      advance.textContent = RESEARCH_NEXT[stage] || 'Filed';
      advance.disabled = stage >= 3;
      advance.addEventListener('click', () => {
        let rec = this.civicState.studies.find((item) => item.id === hall.id);
        if (!rec) {
          rec = { id: hall.id, stage: 0 };
          this.civicState.studies.push(rec);
        }
        if (rec.stage >= 3) return;
        rec.stage += 1;
        this.saveCivicState();
        this.setCivicStatus('Study is now ' + RESEARCH_STAGES[rec.stage] + '.');
        this.renderCivic(hall, { focusId: 'civicAdvance' });
      });
      const aside = document.createElement('button');
      aside.type = 'button';
      aside.className = 'civic-action civic-quiet';
      aside.id = 'civicSetAside';
      aside.textContent = 'Set the study aside';
      aside.addEventListener('click', () => {
        this.civicState.studies = this.civicState.studies.filter((item) => item.id !== hall.id);
        this.saveCivicState();
        this.setCivicStatus('Study set aside.');
        this.renderCivic(hall, { focusId: 'civicAdvance' });
      });
      actions.appendChild(advance);
      actions.appendChild(aside);
      row.appendChild(title);
      row.appendChild(blurb);
      row.appendChild(actions);
      body.appendChild(row);
      this.appendSeekButton(body, hall);
      this.skillsAt(hall.id).forEach((skill) => this.appendCarryRow(body, skill));
    }

    hallNearAvatar() {
      if (!this.avatar || !this.civicHalls.length) return null;
      const pos = this.avatar.position;
      let best = null;
      for (let i = 0; i < this.civicHalls.length; i++) {
        const hall = this.civicHalls[i];
        if (!hall.anchor || pos.distanceTo(hall.anchor) > 18) continue;
        const local = this.hallLocal(hall, pos);
        const inside = Math.abs(local.x) < hall.hw - 0.34 && local.z > -hall.hd + 0.45 && local.z < hall.hd - 0.2;
        const inDoorway = Math.abs(local.x) < hall.doorW / 2 && local.z < -hall.hd + 0.9 && local.z > -hall.hd - 1.4;
        const atStation = Math.hypot(local.x, local.z - hall.pedZ) < 1.7 && local.z > -hall.hd && local.z < hall.hd;
        if (!inside && !inDoorway && !atStation) continue;
        const score = atStation ? 0 : inside ? 1 : 2;
        if (!best || score < best.score) best = { hall, inside, inDoorway, atStation, score };
      }
      return best;
    }

    closeEncounter() {
      this.encounter = null;
      const root = document.getElementById('worldEncounter');
      if (root) root.hidden = true;
      this.setSelected(null);
    }

    fadeEntity(ent, fade) {
      if (!ent) return;
      ent.traverse((obj) => {
        if (obj.isSprite) {
          obj.visible = !fade && this.viewDetailClose !== false;
          return;
        }
        if (!obj.isMesh || !obj.material || obj.material === this.sharedShadowMat) return;
        const mat = obj.material;
        if (mat.userData._op === undefined) {
          mat.userData._op = mat.opacity;
          mat.userData._tr = mat.transparent;
          mat.userData._dw = mat.depthWrite;
        }
        mat.transparent = fade ? true : mat.userData._tr;
        mat.opacity = fade ? 0.14 : mat.userData._op;
        mat.depthWrite = fade ? false : mat.userData._dw;
      });
    }

    setSelected(ent) {
      const all = [...Object.values(this.agentEntities), ...Object.values(this.subagentEntities)];
      if (this.selectedEntity && this.selectedEntity.userData && this.selectedEntity.userData.selectRing) {
        this.selectedEntity.userData.selectRing.visible = false;
      }
      this.selectedEntity = ent || null;
      for (let i = 0; i < all.length; i++) this.fadeEntity(all[i], !!(ent && all[i] !== ent));
      if (ent && ent.userData && ent.userData.selectRing) ent.userData.selectRing.visible = true;
    }

    agentsInColony(key) {
      const list = [];
      Object.keys(this.agentEntities).forEach((id) => {
        const ent = this.agentEntities[id];
        if (ent.userData.walkState && ent.userData.walkState.colonyKey === key && ent.userData.agent) {
          list.push(ent.userData.agent);
        }
      });
      return list;
    }

    openAgentCard(agent) {
      if (!agent) return;
      this.encounter = {
        type: 'agent',
        agent,
        colonyId: agent.colonyId || (this.activeColonyId || null),
        role: agent.role || ''
      };
      const root = document.getElementById('worldEncounter');
      if (!root) return;
      root.hidden = false;
      const set = (id, text) => {
        const n = document.getElementById(id);
        if (n) n.textContent = text;
      };
      set('encounterKicker', agent.cadre || 'Pantheon');
      set('encounterMark', agent.pet || '🤖');
      set('encounterTitle', agent.name || 'Agent');
      set('encounterRole', agent.role || 'Pantheon agent');
      const colony = agent.colonyId && COLONY_COORDS[agent.colonyId] ? COLONY_COORDS[agent.colonyId].name : 'Zoth Prime';
      set('encounterBody', agent.speech || `${agent.name} is walking ${colony}. Approach, speak, or go to them on foot.`);
      const meta = document.getElementById('encounterMeta');
      if (meta) {
        this.clearNode(meta);
        [`Key ${agent.adytumKey !== undefined ? agent.adytumKey : 0}`, agent.state || 'Active', colony].forEach((label) => {
          const pill = document.createElement('span');
          pill.className = 'encounter-pill';
          pill.textContent = label;
          meta.appendChild(pill);
        });

        if (agent.consciousTask) {
          const mode = agent.consciousTask.mode;
          const isCreative = mode === 'CREATIVE_INITIATIVE';
          const isAssign = mode === 'OPERATOR_ASSIGNMENT';
          const isTalk = mode === 'OPERATOR_CONVERSATION';
          const isStation = mode === 'STATION_KEEP' || agent.post === 'station';
          const modePill = document.createElement('span');
          modePill.className = 'encounter-pill';
          modePill.style.borderColor = isStation ? '#F59E0B' : isAssign ? '#06B6D4' : isTalk ? '#8B5CF6' : isCreative ? '#10B981' : '#F59E0B';
          modePill.style.color = isStation ? '#FDE68A' : isAssign ? '#67E8F9' : isTalk ? '#C4B5FD' : isCreative ? '#6EE7B7' : '#FDE68A';
          modePill.textContent = isStation ? '🏪 Station keeper' : isAssign ? '📋 Operator assignment' : isTalk ? '💬 Operator trace' : isCreative ? '💡 Creative Initiative' : '⚙️ Heuristic Task';
          meta.appendChild(modePill);
        }

        if (agent.initiativeScore !== undefined) {
          const drivePill = document.createElement('span');
          drivePill.className = 'encounter-pill';
          drivePill.style.borderColor = '#8B5CF6';
          drivePill.style.color = '#C4B5FD';
          drivePill.textContent = `⚡ ${agent.initiativeScore}% Drive`;
          meta.appendChild(drivePill);
        }
      }
      const chips = document.getElementById('encounterChips');
      if (chips) {
        this.clearNode(chips);
        if (agent.consciousTask) {
          const c1 = document.createElement('span');
          c1.className = 'encounter-chip';
          c1.textContent = `🎯 ${agent.consciousTask.targetApp || 'NullAI Tool'}`;
          chips.appendChild(c1);
          if (agent.consciousTask.action) {
            const c2 = document.createElement('span');
            c2.className = 'encounter-chip';
            c2.textContent = agent.consciousTask.action.slice(0, 48) + (agent.consciousTask.action.length > 48 ? '...' : '');
            chips.appendChild(c2);
          }
          if (agent.consciousTask.nextIntent) {
            const next = document.createElement('span');
            next.className = 'encounter-chip';
            const bit = String(agent.consciousTask.nextIntent);
            next.textContent = 'Next: ' + bit.slice(0, 42) + (bit.length > 42 ? '...' : '');
            chips.appendChild(next);
          }
        }
        if (agent.journeyImprint && agent.journeyImprint.text) {
          const held = document.createElement('span');
          held.className = 'encounter-chip';
          const bit = agent.journeyImprint.text.slice(0, 48);
          held.textContent = (agent.journeyImprint.kind === 'assignment' ? '📋 ' : '💬 ') + bit + (agent.journeyImprint.text.length > 48 ? '...' : '');
          chips.appendChild(held);
        }
        if (agent.ledger) {
          if (agent.ledger.seen) {
            const seenChip = document.createElement('span');
            seenChip.className = 'encounter-chip';
            seenChip.textContent = '🖼️ ' + agent.ledger.seen;
            chips.appendChild(seenChip);
          }
          if (agent.ledger.manner) {
            const mannerChip = document.createElement('span');
            mannerChip.className = 'encounter-chip';
            mannerChip.textContent = '⚖️ ' + agent.ledger.manner;
            chips.appendChild(mannerChip);
          }
          if (agent.ledger.stoic) {
            const stoicChip = document.createElement('span');
            stoicChip.className = 'encounter-chip';
            stoicChip.textContent = '⚓ ' + agent.ledger.stoic;
            chips.appendChild(stoicChip);
          }
          if (agent.ledger.craft) {
            const craftChip = document.createElement('span');
            craftChip.className = 'encounter-chip';
            craftChip.textContent = '🔨 ' + agent.ledger.craft;
            chips.appendChild(craftChip);
          }
          if (agent.ledger.research) {
            const noteChip = document.createElement('span');
            noteChip.className = 'encounter-chip';
            const noteText = String(agent.ledger.research).slice(0, 48);
            noteChip.textContent = '📜 ' + noteText + (agent.ledger.research.length > 48 ? '...' : '');
            chips.appendChild(noteChip);
          }
        }

        // Spatial Proximity Pair-Session Chip (Emergent Collaboration on the 3D Sphere)
        const nearest = this.nearestCompanionFor(agent);
        if (nearest && nearest.peer) {
          const pairChip = document.createElement('button');
          pairChip.type = 'button';
          pairChip.className = 'encounter-chip';
          pairChip.style.borderColor = 'rgba(233, 196, 106, 0.55)';
          pairChip.style.color = '#FFD97A';
          pairChip.style.cursor = 'pointer';
          pairChip.textContent = `⚡ Pair with ${nearest.peer.name} (${nearest.distMeters}m)`;
          pairChip.addEventListener('click', async () => {
            pairChip.disabled = true;
            pairChip.textContent = `⚡ Pairing ${agent.name} × ${nearest.peer.name}...`;
            if (typeof HermeticAudio !== 'undefined' && HermeticAudio.playPairChime) {
              HermeticAudio.playPairChime();
            }
            try {
              const targetApp = (agent.consciousTask && agent.consciousTask.targetApp) || 'NullAI Sovereign Suite';
              const text = `Spatial encounter (${nearest.distMeters}m apart) with ${nearest.peer.name} (${nearest.peer.role || 'Peer'}): pair-program an immediate upgrade on ${targetApp}.`;
              const res = await fetch('/api/subconscious/influence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId: agent.id, kind: 'conversation', text })
              });
              const data = await res.json();
              if (data && data.agent && data.agent.speech) {
                set('encounterBody', `[PAIR: ${agent.name} × ${nearest.peer.name}] ${data.agent.speech}`);
              }
            } catch (_) {}
            pairChip.disabled = false;
            pairChip.textContent = `⚡ Pair with ${nearest.peer.name} (${nearest.distMeters}m)`;
          });
          chips.appendChild(pairChip);
        }
      }
      const speak = document.getElementById('encounterSpeak');
      if (speak) speak.hidden = false;
      const walk = document.getElementById('encounterWalk');
      if (walk) walk.textContent = 'Walk to them';
      const approach = document.getElementById('encounterApproach');
      if (approach) approach.focus();
    }

    nearestCompanionFor(agent) {
      if (!agent) return null;
      const selfEnt = (agent.id && (this.agentEntities[agent.id] || this.subagentEntities[agent.id])) || null;
      const selfPos = selfEnt ? selfEnt.position : null;
      let bestPeer = null;
      let bestDist = Infinity;
      Object.keys(this.agentEntities).forEach((id) => {
        if (id === agent.id) return;
        const ent = this.agentEntities[id];
        if (!ent || !ent.userData || !ent.userData.agent) return;
        const d = selfPos ? selfPos.distanceTo(ent.position) : 12;
        if (d < bestDist) {
          bestDist = d;
          bestPeer = ent.userData.agent;
        }
      });
      if (!bestPeer && Array.isArray(this.agents)) {
        bestPeer = this.agents.find((a) => a && a.id !== agent.id) || null;
        bestDist = 14;
      }
      if (!bestPeer) return null;
      return { peer: bestPeer, distMeters: Math.max(1, Math.round(bestDist)) };
    }

    openCityCard(colonyKey) {
      const col = COLONY_COORDS[colonyKey];
      if (!col) return;
      this.closeCivic();
      const group = this.colonyGroups[colonyKey];
      const role = group && group.userData ? group.userData.role : 'Settlement';
      this.encounter = { type: 'city', agent: null, colonyId: colonyKey, role };
      const root = document.getElementById('worldEncounter');
      if (!root) return;
      root.hidden = false;
      const set = (id, text) => {
        const n = document.getElementById(id);
        if (n) n.textContent = text;
      };
      set('encounterKicker', 'Settlement');
      set('encounterMark', col.banner || '🏛️');
      set('encounterTitle', col.name);
      set('encounterRole', role);
      set('encounterBody', 'Open halls stand inside the walls. Walk in through the door and press E at the pedestal to install a skill, make one, or research.');
      const meta = document.getElementById('encounterMeta');
      if (meta) {
        this.clearNode(meta);
        ['Open halls', 'Walls and gates', 'Solid towers'].forEach((label) => {
          const pill = document.createElement('span');
          pill.className = 'encounter-pill';
          pill.textContent = label;
          meta.appendChild(pill);
        });
      }
      const chips = document.getElementById('encounterChips');
      if (chips) {
        this.clearNode(chips);
        this.civicHalls.filter((hall) => hall.colonyKey === colonyKey).forEach((hall) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'encounter-chip';
          b.textContent = hall.name;
          b.addEventListener('click', () => this.openCivic(hall.id));
          chips.appendChild(b);
        });
        this.agentsInColony(colonyKey).slice(0, 8).forEach((ag) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'encounter-chip';
          b.textContent = ag.name;
          b.addEventListener('click', () => this.presentAgent(ag.id));
          chips.appendChild(b);
        });
      }
      const speak = document.getElementById('encounterSpeak');
      if (speak) speak.hidden = true;
      const walk = document.getElementById('encounterWalk');
      if (walk) walk.textContent = 'Walk the plaza';
      const approach = document.getElementById('encounterApproach');
      if (approach) approach.focus();
    }

    clipSpoken(text) {
      return String(text || '').replace(/\s+/g, ' ').trim().slice(0, 360);
    }

    walkHearGain(dist) {
      if (!Number.isFinite(dist) || dist >= WALK_HEAR_EDGE) return 0;
      if (dist <= WALK_HEAR_FULL) return 1;
      return 1 - (dist - WALK_HEAR_FULL) / (WALK_HEAR_EDGE - WALK_HEAR_FULL);
    }

    huddleIsOpen() {
      const stage = document.getElementById('huddleStage');
      return !!(stage && !stage.hidden);
    }

    hallBlocksTalk() {
      const hallHit = this.nearestHall;
      const agent = this.nearestAgent;
      const dist = this.nearestAgentDist;
      return !!(hallHit && (hallHit.atStation || hallHit.inside) && !(agent && dist < 2.2));
    }

    agentVoiceLine(agent) {
      if (!agent) return '';
      let line = agent.voiceLine || agent.speech || agent.dialogue;
      if (!line && agent.consciousTask && (agent.consciousTask.action || agent.consciousTask.prompt)) {
        line = `${agent.name || 'Agent'}. Working on ${agent.consciousTask.action || agent.consciousTask.prompt}.`;
      }
      if (!line && agent.name) {
        line = `${agent.name}. On duty at ${agent.hall || 'the settlement'}.`;
      }
      return this.clipSpoken(line);
    }

    agentVoiceKey(agent) {
      const line = this.agentVoiceLine(agent);
      if (!agent || !line) return '';
      return `${agent.id}|${agent.voiceAt || 0}|${line}`;
    }

    agentRecord(agentId) {
      const ent = this.entityById(agentId);
      if (ent && ent.userData && ent.userData.agent) return ent.userData.agent;
      const lists = [this.agents, this.lineage && this.lineage.subagents];
      for (let i = 0; i < lists.length; i++) {
        const list = lists[i];
        if (!Array.isArray(list)) continue;
        const found = list.find((a) => a && a.id === agentId);
        if (found) return found;
      }
      return null;
    }

    distanceToAgent(agentId) {
      if (!this.avatar || !agentId) return Infinity;
      const ent = this.entityById(agentId);
      if (!ent) return Infinity;
      return this.avatar.position.distanceTo(ent.position);
    }

    speakersWithin(range) {
      if (!this.avatar) return [];
      const list = [...Object.values(this.agentEntities), ...Object.values(this.subagentEntities)];
      const out = [];
      for (let i = 0; i < list.length; i++) {
        const ent = list[i];
        if (!ent || !ent.userData || !ent.userData.agent) continue;
        const line = this.agentVoiceLine(ent.userData.agent);
        if (!line) continue;
        const dist = this.avatar.position.distanceTo(ent.position);
        if (dist > range) continue;
        out.push({ agent: ent.userData.agent, dist });
      }
      out.sort((a, b) => a.dist - b.dist);
      return out;
    }

    ensureWalkAudio() {
      const wv = this.walkVoice;
      if (!wv) return null;
      if (wv.checkedStatus === undefined) {
        wv.checkedStatus = true;
        this.checkVoiceStatus();
      }
      if (!wv.ctx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        const ctx = new Ctx();
        const gain = ctx.createGain();
        gain.gain.value = 0;
        gain.connect(ctx.destination);
        wv.ctx = ctx;
        wv.gain = gain;
      }
      if (wv.ctx.state === 'suspended') {
        wv.ctx.resume().catch(() => {});
      }
      return wv.ctx;
    }

    async checkVoiceStatus() {
      const wv = this.walkVoice;
      if (!wv) return;
      try {
        const res = await fetch('/api/voice/status');
        const data = await res.json();
        wv.ready = !!data.ready;
        wv.isOffline = !data.ready;
        wv.offlineReason = data.reason || 'Thermal Guard active (<55°C ceiling)';
        wv.mode = data.mode || 'Live Neural Text Stream';
        window.dispatchEvent(new CustomEvent('civ:voicestatus', { detail: data }));
      } catch (_) {
        wv.ready = false;
        wv.isOffline = true;
        wv.offlineReason = 'Audio endpoint offline';
        wv.mode = 'Live Neural Text Stream';
      }
    }

    stopWalkSource() {
      const wv = this.walkVoice;
      if (!wv) return;
      const src = wv.source;
      wv.source = null;
      wv.playing = null;
      if (src) {
        src.onended = null;
        try { src.stop(); } catch (err) { /* already ended */ }
      }
      if (wv.gain && wv.ctx) {
        const now = wv.ctx.currentTime;
        wv.gain.gain.cancelScheduledValues(now);
        wv.gain.gain.setValueAtTime(0, now);
      }
    }

    silenceWalkVoice() {
      const wv = this.walkVoice;
      if (!wv) return;
      wv.token += 1;
      wv.queue = [];
      wv.busy = false;
      wv.partnerId = null;
      wv.pendingPartnerId = null;
      wv.byeId = null;
      const src = wv.source;
      wv.source = null;
      wv.playing = null;
      if (src && wv.gain && wv.ctx) {
        src.onended = null;
        const now = wv.ctx.currentTime;
        wv.gain.gain.cancelScheduledValues(now);
        wv.gain.gain.setValueAtTime(Math.max(wv.gain.gain.value, 0.001), now);
        wv.gain.gain.linearRampToValueAtTime(0, now + 0.4);
        setTimeout(() => { try { src.stop(); } catch (err) { /* ended */ } }, 420);
        return;
      }
      this.stopWalkSource();
    }

    yieldWalkVoice() {
      const wv = this.walkVoice;
      if (!wv) return;
      if (!wv.playing && !wv.busy && !wv.queue.length) return;
      if (wv.playing && wv.playing.agentId) wv.heard.delete(wv.playing.agentId);
      wv.token += 1;
      wv.queue = [];
      wv.busy = false;
      wv.byeId = null;
      wv.pendingPartnerId = null;
      this.stopWalkSource();
    }

    forgetDistantVoices() {
      const wv = this.walkVoice;
      wv.heard.forEach((_, id) => {
        if (this.distanceToAgent(id) > WALK_HEAR_STOP) wv.heard.delete(id);
      });
    }

    enqueueWalkLine(item) {
      const wv = this.walkVoice;
      const text = this.clipSpoken(item.text);
      if (!text) return;
      item.text = text;
      if (wv.queue.some((queued) => queued.key === item.key)) return;
      if (wv.playing && wv.playing.key === item.key) return;
      wv.queue.push(item);
      // Non-blocking background prefetch so the audio buffer is ready before playback turn
      this.prefetchWalkBuffer(item);
    }

    prefetchWalkBuffer(item) {
      const wv = this.walkVoice;
      if (!wv || !item || !item.text) return;
      const cacheKey = `${item.voiceId || 'af_heart'}\n${item.text}`;
      if (wv.cache.has(cacheKey) || wv.inFlight.has(cacheKey)) return;
      this.fetchWalkBuffer(item, wv.token).catch(() => {});
    }

    toggleLiveConversation() {
      this.liveConversation = !this.liveConversation;
      this.ensureWalkAudio();
      this.syncLiveTalkButton();
      if (!this.liveConversation) {
        if (this.walkVoice.partnerId) this.endLiveVisit(true, false);
      } else {
        this.updateWalkHearing();
      }
    }

    syncLiveTalkButton() {
      const btn = document.getElementById('btnLiveTalk');
      if (btn) {
        btn.setAttribute('aria-pressed', this.liveConversation ? 'true' : 'false');
        btn.classList.toggle('is-on', !!this.liveConversation);
        btn.textContent = this.liveConversation ? 'C · Live on' : 'C · Live off';
      }
      const hint = document.getElementById('dialogueVoiceHint');
      if (hint) {
        hint.textContent = this.liveConversation
          ? 'Live voice is on. Your line is spoken, then theirs. Mic fills the line. Enter sends.'
          : 'Press C for live voice. Mic fills the line. Enter sends · Shift+Enter line · Esc closes';
      }
    }

    endLiveVisit(sayBye, rampOut) {
      const wv = this.walkVoice;
      if (!wv) return;
      const partnerId = wv.partnerId;
      if (!partnerId) {
        if (sayBye && wv.byeId) return;
        return;
      }
      const partner = this.agentRecord(partnerId);
      wv.partnerId = null;
      if (this.dialogueAgentId === partnerId) this.closeDialogue();
      if (!sayBye || !partner) {
        wv.pendingPartnerId = null;
        this.silenceWalkVoice();
        return;
      }
      wv.token += 1;
      wv.queue = [];
      wv.busy = false;
      this.stopWalkSource();
      wv.byeId = partnerId;
      this.enqueueWalkLine({
        kind: 'bye',
        text: WALK_BYE,
        voiceId: partner.voiceId || 'af_heart',
        agentId: partnerId,
        key: `bye|${partnerId}|${wv.token}`,
        rampOut: !!rampOut
      });
      this.pumpWalkVoice();
    }

    beginLiveVisit(agent) {
      const wv = this.walkVoice;
      if (!agent || wv.partnerId === agent.id || wv.byeId) return;
      wv.partnerId = agent.id;
      wv.pendingPartnerId = null;
      wv.byeId = null;
      // NOTE: We DO NOT automatically open #avatarDialogueBox here to prevent popup spam!
      // The user presses 'F' explicitly to engage the dialogue window.
      const line = this.agentVoiceLine(agent) || this.clipSpoken(agent.speech);
      if (!line) return;
      const playingThem = wv.playing && wv.playing.agentId === agent.id;
      wv.queue = wv.queue.filter((item) => !(item.agentId === agent.id && item.kind === 'ambient'));
      if (playingThem) return;
      wv.heard.set(agent.id, this.agentVoiceKey(agent) || `live|${agent.id}|${line}`);
      this.enqueueWalkLine({
        kind: 'greet',
        text: line,
        voiceId: agent.voiceId || 'af_heart',
        agentId: agent.id,
        agentName: agent.name || agent.id,
        key: `live|${agent.id}|${line}`
      });
      this.pumpWalkVoice();
    }

    speakExchange(playerText, agent, reply) {
      if (!this.liveConversation || !this.isAvatarMode || !agent) return;
      const wv = this.walkVoice;
      const mine = this.clipSpoken(playerText);
      const theirs = this.clipSpoken(reply);
      if (!mine && !theirs) return;
      wv.token += 1;
      wv.queue = [];
      wv.busy = false;
      wv.partnerId = agent.id;
      wv.byeId = null;
      wv.pendingPartnerId = null;
      this.stopWalkSource();
      if (mine) {
        this.enqueueWalkLine({
          kind: 'player',
          text: mine,
          voiceId: PLAYER_VOICE_ID,
          agentId: agent.id,
          key: `player|${agent.id}|${wv.token}`
        });
      }
      if (theirs) {
        wv.heard.set(agent.id, this.agentVoiceKey(agent) || `reply|${agent.id}|${theirs}`);
        this.enqueueWalkLine({
          kind: 'reply',
          text: theirs,
          voiceId: agent.voiceId || 'af_heart',
          agentId: agent.id,
          agentName: agent.name || agent.id,
          key: `reply|${agent.id}|${wv.token}|${theirs}`
        });
      }
      this.pumpWalkVoice();
    }

    maybeHearAmbient() {
      const wv = this.walkVoice;
      if (!wv || wv.busy || wv.playing || wv.queue.length || wv.byeId) return;
      if (performance.now() < wv.retryAt) return;
      if (!wv.lastSpokenMap) wv.lastSpokenMap = new Map();

      const speakers = this.speakersWithin(WALK_HEAR_START);
      if (!speakers.length) return;

      const now = performance.now();
      let chosen = null;

      // Group and nearby agent ambient dialogue:
      // Search through all speakers in hearing range for an agent who hasn't spoken in the last 14s
      for (let i = 0; i < speakers.length; i++) {
        const s = speakers[i];
        const lastTime = wv.lastSpokenMap.get(s.agent.id) || 0;
        if (now - lastTime < 14000) continue;
        const line = this.agentVoiceLine(s.agent);
        if (!line) continue;
        chosen = s;
        break;
      }

      // If everyone was heard recently, choose the one with the oldest timestamp (>9s ago)
      if (!chosen) {
        let oldestTime = Infinity;
        for (let i = 0; i < speakers.length; i++) {
          const s = speakers[i];
          const lastTime = wv.lastSpokenMap.get(s.agent.id) || 0;
          if (now - lastTime > 9000 && lastTime < oldestTime) {
            oldestTime = lastTime;
            chosen = s;
          }
        }
      }

      if (!chosen) return;

      wv.lastSpokenMap.set(chosen.agent.id, now);
      const line = this.agentVoiceLine(chosen.agent);
      const key = `${chosen.agent.id}|${chosen.agent.voiceAt || 0}|${line}`;
      wv.heard.set(chosen.agent.id, key);

      this.enqueueWalkLine({
        kind: 'ambient',
        text: line,
        voiceId: chosen.agent.voiceId || 'af_heart',
        agentId: chosen.agent.id,
        agentName: chosen.agent.name || chosen.agent.id,
        key
      });
    }

    refreshWalkGain() {
      const wv = this.walkVoice;
      const item = wv.playing;
      if (!item || !wv.gain || !wv.ctx || item.rampOut) return;
      let gain = 0;
      if (item.kind === 'player') {
        gain = 1;
      } else if (item.kind === 'bye') {
        const age = (performance.now() - (item.started || performance.now())) / 1400;
        const floor = Math.max(0, 1 - age) * 0.55;
        gain = Math.max(this.walkHearGain(this.distanceToAgent(item.agentId)), floor);
      } else {
        gain = this.walkHearGain(this.distanceToAgent(item.agentId));
        if (gain <= 0 && this.distanceToAgent(item.agentId) >= WALK_HEAR_EDGE) {
          this.stopWalkSource();
          this.pumpWalkVoice();
          return;
        }
      }
      wv.gain.gain.setTargetAtTime(gain, wv.ctx.currentTime, 0.06);
    }

    updateWalkHearing() {
      if (!this.isAvatarMode || !this.avatar || !this.walkVoice) return;
      if (this.huddleIsOpen()) {
        this.yieldWalkVoice();
        return;
      }
      this.ensureWalkAudio();
      const wv = this.walkVoice;
      this.forgetDistantVoices();
      this.refreshWalkGain();
      const civic = document.getElementById('civicPanel');
      const civicOpen = !!(civic && !civic.hidden);
      const nearest = this.nearestAgent;
      const dist = this.nearestAgentDist;
      const keepTalking = wv.partnerId && nearest && nearest.id === wv.partnerId;
      const talkRange = keepTalking ? WALK_TALK_HOLD : WALK_TALK_RANGE;
      const inTalk = !!(nearest && dist < talkRange && !this.hallBlocksTalk() && !civicOpen);

      if (this.liveConversation && wv.partnerId && !inTalk) {
        this.endLiveVisit(true, false);
      } else if (this.liveConversation && inTalk && wv.partnerId && wv.partnerId !== nearest.id) {
        wv.pendingPartnerId = nearest.id;
        this.endLiveVisit(true, false);
      } else if (inTalk && !wv.partnerId && !wv.byeId) {
        this.beginLiveVisit(nearest);
      }
      this.maybeHearAmbient();
      this.prefetchNearbyVoices();
      this.pumpWalkVoice();
    }

    prefetchNearbyVoices() {
      const wv = this.walkVoice;
      if (!wv || wv.isOffline) return;
      const speakers = this.speakersWithin(WALK_HEAR_START);
      for (let i = 0; i < Math.min(speakers.length, 3); i++) {
        const ag = speakers[i].agent;
        const line = this.agentVoiceLine(ag);
        if (!line) continue;
        const voiceId = ag.voiceId || 'af_heart';
        const cacheKey = `${voiceId}\n${line}`;
        if (!wv.cache.has(cacheKey) && !wv.inFlight.has(cacheKey)) {
          this.prefetchWalkBuffer({ text: line, voiceId });
        }
      }
    }

    async fetchWalkBuffer(item, token) {
      const wv = this.walkVoice;
      if (!wv) return null;
      if (wv.isOffline) {
        return { drop: true, offline: true, retry: false, reason: wv.offlineReason || 'Thermal Guard active (<55°C ceiling)' };
      }
      const cacheKey = `${item.voiceId || 'af_heart'}\n${item.text}`;
      if (wv.cache.has(cacheKey)) return wv.cache.get(cacheKey);
      if (wv.inFlight.has(cacheKey)) {
        return wv.inFlight.get(cacheKey);
      }
      const ctx = this.ensureWalkAudio();
      if (!ctx) return null;
      // Voice engine offline: don't hit /api/voice/speak again until the backoff expires
      // (it was retried every 700ms, ~265 requests/minute while Kokoro was down).
      if (wv.offlineUntil && performance.now() < wv.offlineUntil) return { retry: true, offline: true };

      const fetchPromise = (async () => {
        let res;
        try {
          res = await fetch('/api/voice/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: item.text, voiceId: item.voiceId || 'af_heart' })
          });
        } catch (err) {
          wv.inFlight.delete(cacheKey);
          return null;
        }
        if (token !== wv.token) {
          wv.inFlight.delete(cacheKey);
          return null;
        }
        if (res.status === 503) {
          wv.inFlight.delete(cacheKey);
          wv.offlineMs = Math.min(Math.max(2000, (wv.offlineMs || 0) * 2), 60000);
          wv.offlineUntil = performance.now() + wv.offlineMs;
          return { retry: true, offline: true };
        }
        if (res.status === 429) {
          wv.inFlight.delete(cacheKey);
          return { retry: true };
        }
        wv.offlineMs = 0; wv.offlineUntil = 0;
        if (!res.ok) {
          wv.inFlight.delete(cacheKey);
          return { drop: true };
        }
        try {
          const bytes = await res.arrayBuffer();
          if (token !== wv.token) {
            wv.inFlight.delete(cacheKey);
            return null;
          }
          const audio = await ctx.decodeAudioData(bytes.slice(0));
          if (wv.cache.size >= 32) {
            const first = wv.cache.keys().next().value;
            wv.cache.delete(first);
          }
          wv.cache.set(cacheKey, audio);
          wv.inFlight.delete(cacheKey);
          return audio;
        } catch (e) {
          wv.inFlight.delete(cacheKey);
          return { drop: true };
        }
      })();

      wv.inFlight.set(cacheKey, fetchPromise);
      return fetchPromise;
    }

    playWalkBuffer(item, buffer) {
      const ctx = this.ensureWalkAudio();
      const wv = this.walkVoice;
      if (!ctx || !wv || !buffer || buffer.retry || buffer.drop) return;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(wv.gain);
      item.started = performance.now();
      wv.source = src;
      wv.playing = item;
      const now = ctx.currentTime;
      wv.gain.gain.cancelScheduledValues(now);
      if (item.rampOut) {
        wv.gain.gain.setValueAtTime(0.6, now);
        wv.gain.gain.linearRampToValueAtTime(0, now + Math.min(1.6, buffer.duration || 1.6));
      } else {
        const dist = this.distanceToAgent(item.agentId);
        const gain = item.kind === 'player' ? 1 : Math.max(this.walkHearGain(dist), item.kind === 'bye' ? 0.55 : 0);
        wv.gain.gain.setValueAtTime(gain, now);
      }
      if (item.agentId && item.text) {
        const ag = this.agentRecord(item.agentId);
        const name = (ag && ag.name) || item.agentName || item.agentId;
        if (typeof this.spawnSpeechBubble === 'function') {
          this.spawnSpeechBubble(name, item.text);
        }
      }
      src.onended = () => {
        if (wv.source !== src) return;
        wv.source = null;
        wv.playing = null;
        if (item.kind === 'bye' && wv.byeId === item.agentId) wv.byeId = null;
        const pending = wv.pendingPartnerId;
        wv.pendingPartnerId = null;
        if (pending && this.liveConversation && this.isAvatarMode) {
          const agent = this.agentRecord(pending);
          const stillNear = this.distanceToAgent(pending) < WALK_TALK_RANGE && !this.hallBlocksTalk();
          if (agent && stillNear) this.beginLiveVisit(agent);
        }
        this.pumpWalkVoice();
      };
      try {
        src.start();
      } catch (err) {
        // If AudioContext suspended or audio blocked, discard cleanly
        wv.source = null;
        wv.playing = null;
      }
    }

    dropWalkItem(item) {
      const wv = this.walkVoice;
      const idx = wv.queue.indexOf(item);
      if (idx >= 0) wv.queue.splice(idx, 1);
    }

    async pumpWalkVoice() {
      const wv = this.walkVoice;
      if (!wv || wv.busy || wv.playing || !wv.queue.length) return;
      if (this.huddleIsOpen()) return;
      if (performance.now() < wv.retryAt) return;
      const item = wv.queue[0];
      const token = wv.token;
      wv.busy = true;
      let buffer = null;
      try {
        buffer = await this.fetchWalkBuffer(item, token);
      } catch (err) {
        buffer = null;
      }
      if (token !== wv.token) return;
      wv.busy = false;
      if (buffer && buffer.retry) {
        wv.retryAt = performance.now() + (buffer.offline ? Math.max(700, (wv.offlineUntil || 0) - performance.now()) : 700);
        return;
      }
      if (!buffer || buffer.drop) {
        this.dropWalkItem(item);
        if (item.kind === 'bye' && wv.byeId === item.agentId) {
          wv.byeId = null;
          const pending = wv.pendingPartnerId;
          wv.pendingPartnerId = null;
          if (pending && this.liveConversation && this.isAvatarMode) {
            const agent = this.agentRecord(pending);
            const stillNear = this.distanceToAgent(pending) < WALK_TALK_RANGE && !this.hallBlocksTalk();
            if (agent && stillNear) this.beginLiveVisit(agent);
          }
        } else if (!buffer && item.kind === 'ambient' && wv.heard.get(item.agentId) === item.key) {
          wv.heard.delete(item.agentId);
          wv.retryAt = performance.now() + 1200;
        }
        this.pumpWalkVoice();
        return;
      }
      if (wv.queue[0] !== item) {
        this.dropWalkItem(item);
        this.pumpWalkVoice();
        return;
      }
      wv.queue.shift();
      if (wv.queue.length > 0) {
        this.prefetchWalkBuffer(wv.queue[0]);
      }
      this.playWalkBuffer(item, buffer);
    }

    closeDialogue() {
      this.stopDialogueMic({ quiet: true });
      const box = document.getElementById('avatarDialogueBox');
      if (box) box.style.display = 'none';
      const prompt = document.getElementById('avatarDialoguePrompt');
      if (prompt && document.activeElement === prompt) prompt.blur();
      this.dialogueAgentId = null;
      this.dialogueSending = false;
    }

    setDialogueKind(kind) {
      this.dialogueKind = kind === 'assignment' ? 'assignment' : 'conversation';
      const talk = document.getElementById('btnDialogueTalk');
      const assign = document.getElementById('btnDialogueAssign');
      const prompt = document.getElementById('avatarDialoguePrompt');
      if (talk) {
        talk.classList.toggle('is-on', this.dialogueKind === 'conversation');
        talk.setAttribute('aria-pressed', this.dialogueKind === 'conversation' ? 'true' : 'false');
      }
      if (assign) {
        assign.classList.toggle('is-on', this.dialogueKind === 'assignment');
        assign.setAttribute('aria-pressed', this.dialogueKind === 'assignment' ? 'true' : 'false');
      }
      if (prompt) {
        prompt.placeholder = this.dialogueKind === 'assignment'
          ? 'Give them work to keep doing after you walk away.'
          : 'Say something. It stays in their thoughts after you leave.';
      }
    }

    openDialogue(ag) {
      if (!ag) return;
      const box = document.getElementById('avatarDialogueBox');
      const portraitEl = document.getElementById('avatarDialoguePortrait');
      const nameEl = document.getElementById('avatarDialogueName');
      const roleEl = document.getElementById('avatarDialogueRole');
      const textEl = document.getElementById('avatarDialogueText');
      const prompt = document.getElementById('avatarDialoguePrompt');
      const status = document.getElementById('avatarDialogueStatus');
      if (portraitEl) portraitEl.textContent = ag.pet || '🤖';
      if (nameEl) nameEl.textContent = ag.name || 'Agent';
      if (roleEl) roleEl.textContent = `${ag.cadre || 'Pantheon'} · Key ${ag.adytumKey !== undefined ? ag.adytumKey : 0}`;
      const colonyName = ((ag.colonyId || 'citadel').replace('colony_', '')).toUpperCase();
      const held = ag.journeyImprint && ag.journeyImprint.text ? ag.journeyImprint.text : '';
      let line = ag.speech || '';
      if (!line && held) line = `I am still carrying this: ${held}`;
      if (!line) line = `I am on the ${colonyName} avenues. Talk, or assign work. It stays on my loop after you leave.`;
      const ledgerEl = document.getElementById('avatarDialogueLedger');
      if (textEl) textEl.textContent = line;
      if (ledgerEl) {
        const l = ag.ledger;
        if (l) {
          ledgerEl.hidden = false;
          this.clearNode(ledgerEl);
          const addLine = (lbl, val) => {
            if (!val) return;
            const row = document.createElement('div');
            row.className = 'dialogue-ledger-line';
            const k = document.createElement('span');
            k.className = 'dialogue-ledger-label';
            k.textContent = lbl + ':';
            const v = document.createElement('span');
            v.className = 'dialogue-ledger-val';
            v.textContent = ' ' + val;
            row.appendChild(k);
            row.appendChild(v);
            ledgerEl.appendChild(row);
          };
          if (l.manner || l.tic) addLine('Manner', `${l.manner || ''}${l.tic ? '. ' + l.tic : ''}`);
          if (l.focus) addLine('Focus', l.focus);
          if (l.belief) addLine('Belief', l.belief);
          if (l.stoic) addLine('Stoic line', l.stoic);
          if (l.craft) addLine('Conduct', l.craft);
          if (l.seen) addLine('Picture', l.seen);
          if (l.research) addLine('Public note', l.research);
        } else {
          ledgerEl.hidden = true;
          this.clearNode(ledgerEl);
        }
      }
      if (prompt && this.dialogueAgentId !== ag.id && !this.micListening) {
        prompt.value = '';
        this.micCommitted = '';
      }
      if (status && !this.micListening) {
        status.hidden = true;
        status.textContent = '';
      }
      this.setDialogueKind('conversation');
      if (box) {
        box.style.display = 'flex';
        let voiceBadge = document.getElementById('dialogueVoiceModeBadge');
        if (!voiceBadge) {
          voiceBadge = document.createElement('span');
          voiceBadge.id = 'dialogueVoiceModeBadge';
          voiceBadge.className = 'dialogue-voice-mode-badge';
          const head = box.querySelector('.dialogue-box-header');
          if (head) {
            const closeBtn = head.querySelector('.dialogue-close-btn');
            if (closeBtn) head.insertBefore(voiceBadge, closeBtn);
            else head.appendChild(voiceBadge);
          }
        }
        if (voiceBadge) {
          const isOff = this.walkVoice && this.walkVoice.isOffline;
          voiceBadge.className = 'dialogue-voice-mode-badge ' + (isOff ? 'is-thermal' : 'is-live');
          voiceBadge.textContent = isOff ? '⚡ Text Mode · Thermal Guard <55°C' : '🎙️ Live Voice';
          voiceBadge.title = isOff
            ? 'Thermal Guard Active: Kokoro neural voice synthesis is held offline to preserve CPU < 55°C ceiling. Thoughts are transmitted live via instant high-speed cybernetic text.'
            : 'Kokoro neural voice synthesizer is active.';
        }
        const hint = document.getElementById('dialogueVoiceHint');
        if (hint && this.walkVoice && this.walkVoice.isOffline) {
          hint.textContent = '⚡ Text Mode Active (Thermal Guard <55°C) · Enter sends · Shift+Enter line · Esc closes';
        }
      }
      this.dialogueAgentId = ag.id;
      const walkBtn = document.getElementById('btnDialogueWalk');
      if (walkBtn) walkBtn.style.display = this.isAvatarMode ? 'none' : 'inline-flex';
      if (typeof document !== 'undefined' && document.pointerLockElement && document.exitPointerLock) {
        document.exitPointerLock();
      }
      if (this.avatar && this.avatar.keys) {
        this.avatar.keys.forward = false;
        this.avatar.keys.backward = false;
        this.avatar.keys.left = false;
        this.avatar.keys.right = false;
        this.avatar.keys.sprint = false;
      }
      if (typeof HermeticAudio !== 'undefined' && HermeticAudio.playCardFlip) HermeticAudio.playCardFlip();
      if (prompt) prompt.focus();
    }

    async sendDialogue() {
      if (this.dialogueSending) return;
      if (this.micListening || this.micTake) this.stopDialogueMic({ quiet: true });
      const prompt = document.getElementById('avatarDialoguePrompt');
      const status = document.getElementById('avatarDialogueStatus');
      const sendBtn = document.getElementById('btnDialogueSend');
      const micBtn = document.getElementById('btnDialogueMic');
      const text = prompt ? prompt.value.trim() : '';
      const say = (msg) => {
        if (!status) return;
        status.hidden = false;
        status.textContent = msg;
      };
      if (!this.dialogueAgentId) {
        say('Stand by an agent, or open their card, then press E.');
        return;
      }
      if (!text) {
        say('Write or speak a line first.');
        if (prompt) prompt.focus();
        return;
      }
      const kind = this.dialogueKind === 'assignment' ? 'assignment' : 'conversation';
      this.dialogueSending = true;
      if (sendBtn) sendBtn.disabled = true;
      if (micBtn) micBtn.disabled = true;
      say(kind === 'assignment' ? 'Giving them the work…' : 'Leaving the thought with them…');
      try {
        const res = await fetch('/api/subconscious/influence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: this.dialogueAgentId, text, kind })
        });
        const data = await res.json();
        if (!res.ok || !data.success || !data.agent) throw new Error((data && data.error) || 'The thought did not land.');
        if (prompt) prompt.value = '';
        const spoken = document.getElementById('avatarDialogueText');
        if (spoken && data.agent.speech) spoken.textContent = data.agent.speech;
        const ledgerEl = document.getElementById('avatarDialogueLedger');
        if (ledgerEl && data.agent.ledger) {
          ledgerEl.hidden = false;
          this.clearNode(ledgerEl);
          const addLine = (lbl, val) => {
            if (!val) return;
            const row = document.createElement('div');
            row.className = 'dialogue-ledger-line';
            const k = document.createElement('span');
            k.className = 'dialogue-ledger-label';
            k.textContent = lbl + ':';
            const v = document.createElement('span');
            v.className = 'dialogue-ledger-val';
            v.textContent = ' ' + val;
            row.appendChild(k);
            row.appendChild(v);
            ledgerEl.appendChild(row);
          };
          const l = data.agent.ledger;
          if (l.manner || l.tic) addLine('Manner', `${l.manner || ''}${l.tic ? '. ' + l.tic : ''}`);
          if (l.focus) addLine('Focus', l.focus);
          if (l.belief) addLine('Belief', l.belief);
          if (l.stoic) addLine('Stoic line', l.stoic);
          if (l.craft) addLine('Conduct', l.craft);
          if (l.seen) addLine('Picture', l.seen);
          if (l.research) addLine('Public note', l.research);
        }
        const ent = this.entityById(data.agent.id);
        if (ent) ent.userData.agent = data.agent;
        if (Array.isArray(this.agents)) {
          const idx = this.agents.findIndex((a) => a.id === data.agent.id);
          if (idx >= 0) this.agents[idx] = data.agent;
        }
        if (this.lineage && Array.isArray(this.lineage.subagents)) {
          const subIdx = this.lineage.subagents.findIndex((a) => a.id === data.agent.id);
          if (subIdx >= 0) this.lineage.subagents[subIdx] = data.agent;
        }
        say(kind === 'assignment'
          ? 'Assignment is on their conscious task. It stays in the loop after you leave.'
          : 'That line is in their subconscious. It stays on the walk after you leave.');
        if (this.liveConversation && this.isAvatarMode) {
          const reply = this.clipSpoken(data.agent.speech || data.agent.voiceLine || '');
          this.speakExchange(text, data.agent, reply);
        }
      } catch (err) {
        say(err.message || 'The thought did not land.');
      } finally {
        this.dialogueSending = false;
        if (sendBtn) sendBtn.disabled = false;
        if (micBtn) micBtn.disabled = false;
      }
    }

    speechRecognitionCtor() {
      if (typeof window === 'undefined') return null;
      return window.SpeechRecognition || window.webkitSpeechRecognition || null;
    }

    joinHeard(base, extra) {
      const a = String(base || '').replace(/\s+$/g, '');
      const b = String(extra || '').replace(/^\s+/g, '').replace(/\s+/g, ' ').trim();
      if (!b) return a.slice(0, 420);
      return (a ? `${a} ${b}` : b).slice(0, 420);
    }

    setDialogueStatus(msg) {
      if (this.dialogueSending) return;
      const status = document.getElementById('avatarDialogueStatus');
      if (!status) return;
      status.hidden = !msg;
      status.textContent = msg || '';
    }

    syncDialogueMicButton() {
      const btn = document.getElementById('btnDialogueMic');
      if (!btn) return;
      const on = !!this.micListening;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.textContent = on ? 'Listening' : 'Mic';
    }

    toggleDialogueMic() {
      if (this.micListening) this.stopDialogueMic();
      else this.startDialogueMic();
    }

    startDialogueMic() {
      const Ctor = this.speechRecognitionCtor();
      if (!Ctor) {
        this.syncDialogueMicButton();
        this.setDialogueStatus('This browser has no speech recognition. Type the line.');
        return;
      }
      const prompt = document.getElementById('avatarDialoguePrompt');
      const keep = document.getElementById('chkDialogueKeepVoice');
      this.micEpoch += 1;
      const epoch = this.micEpoch;
      this.micListening = true;
      this.micErrorStreak = 0;
      this.micPrefix = prompt ? prompt.value : '';
      this.micCommitted = this.micPrefix;
      this.micTake = {
        epoch,
        chunks: [],
        recorder: null,
        stream: null,
        blob: null,
        failed: false,
        wanted: !!(keep && keep.checked),
        discard: false,
        stopQueued: false,
        done: false,
        quiet: false,
        listening: true,
        transcript: '',
        committed: false
      };
      this.syncDialogueMicButton();
      this.setDialogueStatus(this.micTake.wanted
        ? 'Listening… this take will be kept on this browser. Speak, then Send.'
        : 'Listening… speak, then Send.');
      if (typeof document !== 'undefined' && document.pointerLockElement && document.exitPointerLock) {
        document.exitPointerLock();
      }
      if (prompt) prompt.focus();
      this.armDialogueMic(epoch);
      if (this.micTake.wanted) this.beginVoiceTake(epoch);
    }

    armDialogueMic(epoch) {
      if (epoch !== this.micEpoch || !this.micListening) return;
      const Ctor = this.speechRecognitionCtor();
      if (!Ctor) {
        this.fatalDialogueMic('This browser has no speech recognition. Type the line.');
        return;
      }
      const prev = this.micRec;
      if (prev) {
        prev.onresult = null;
        prev.onerror = null;
        prev.onend = null;
      }
      const rec = new Ctor();
      const arm = ++this.micArm;
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = (navigator.language || 'en-US');
      rec.onresult = (ev) => {
        if (arm !== this.micArm) return;
        this.onDialogueMicResult(epoch, ev);
      };
      rec.onerror = (ev) => {
        if (arm !== this.micArm) return;
        this.onDialogueMicError(epoch, ev);
      };
      rec.onend = () => {
        if (arm !== this.micArm) return;
        this.onDialogueMicEnd(epoch, rec);
      };
      this.micRec = rec;
      try {
        rec.start();
      } catch (err) {
        if (epoch !== this.micEpoch) return;
        this.fatalDialogueMic('Could not start the microphone. Type the line.');
      }
    }

    onDialogueMicResult(epoch, ev) {
      if (epoch !== this.micEpoch || !this.micListening || !ev || !ev.results) return;
      this.micErrorStreak = 0;
      let spoken = '';
      let anyFinal = false;
      for (let i = 0; i < ev.results.length; i += 1) {
        const result = ev.results[i];
        const piece = result && result[0] ? result[0].transcript : '';
        spoken = this.joinHeard(spoken, piece);
        if (result && result.isFinal) anyFinal = true;
      }
      const committed = this.joinHeard(this.micPrefix, spoken);
      this.micCommitted = committed;
      const prompt = document.getElementById('avatarDialoguePrompt');
      if (prompt) prompt.value = committed;
      if (!anyFinal) return;
      const take = this.micTake;
      if (take && take.wanted && take.failed) {
        this.setDialogueStatus('Heard. Take was not kept. Speech-to-text is using the mic.');
      } else if (committed.length >= 420) {
        this.setDialogueStatus('Heard. The line is full. Edit it or Send.');
      } else {
        this.setDialogueStatus('Heard. Edit the line or Send.');
      }
    }

    onDialogueMicError(epoch, ev) {
      if (epoch !== this.micEpoch || !this.micListening) return;
      const code = ev && ev.error ? ev.error : '';
      if (code === 'aborted') return;
      if (code === 'no-speech') {
        this.micErrorStreak += 1;
        if (!String(this.micCommitted || '').trim()) this.setDialogueStatus('Listening… no speech yet.');
        return;
      }
      if (code === 'audio-capture' && this.micTake && this.micTake.recorder && !this.micTake.failed) {
        this.failVoiceTake('Take was not kept. Speech-to-text needs the mic.');
        return;
      }
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        this.fatalDialogueMic('Mic is blocked. Allow the microphone for this page, or type the line.');
        return;
      }
      if (code === 'network') {
        this.fatalDialogueMic('Speech service unavailable. Type the line.');
        return;
      }
      if (code === 'audio-capture') {
        this.fatalDialogueMic('No microphone found. Type the line.');
        return;
      }
      this.micErrorStreak += 1;
      this.setDialogueStatus('Could not hear that. Still listening, or type the line.');
    }

    onDialogueMicEnd(epoch, rec) {
      if (epoch !== this.micEpoch || !this.micListening) return;
      if (rec && rec !== this.micRec) return;
      this.micArm += 1;
      if (this.micErrorStreak > 8) {
        this.fatalDialogueMic('The mic stopped. Press Mic to try again, or type the line.');
        return;
      }
      const prompt = document.getElementById('avatarDialoguePrompt');
      if (prompt) this.micPrefix = prompt.value;
      window.setTimeout(() => {
        if (epoch !== this.micEpoch || !this.micListening) return;
        this.armDialogueMic(epoch);
      }, 300);
    }

    fatalDialogueMic(msg) {
      this.micListening = false;
      this.micEpoch += 1;
      this.dropMicRecognition();
      const take = this.micTake;
      this.micTake = null;
      if (take) {
        take.failed = true;
        take.done = true;
        take.quiet = true;
        take.discard = true;
        this.releaseMicTakeAudio(take);
      }
      this.syncDialogueMicButton();
      this.setDialogueStatus(msg);
    }

    dropMicRecognition() {
      const rec = this.micRec;
      this.micRec = null;
      if (!rec) return;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try { rec.stop(); } catch (err) { /* already stopped */ }
    }

    stopDialogueMic(opts) {
      const listening = this.micListening;
      const take = this.micTake;
      if (!listening && !take) {
        this.syncDialogueMicButton();
        return;
      }
      const prompt = document.getElementById('avatarDialoguePrompt');
      const transcript = prompt ? prompt.value.trim().slice(0, 420) : '';
      this.micListening = false;
      this.micEpoch += 1;
      this.dropMicRecognition();
      this.micTake = null;
      this.syncDialogueMicButton();
      if (!take) {
        if (!(opts && opts.quiet) && transcript) this.setDialogueStatus('Heard. Edit the line or Send.');
        else if (!(opts && opts.quiet) && listening) this.setDialogueStatus('No speech heard.');
        return;
      }
      take.transcript = transcript;
      take.quiet = !!(opts && opts.quiet);
      take.listening = listening;
      take.done = true;
      if (take.discard || !take.wanted) {
        this.releaseMicTakeAudio(take);
        this.commitVoiceTake(take);
        return;
      }
      if (take.stopQueued) return;
      if (!this.requestMicStop(take)) this.commitVoiceTake(take);
    }

    onDialogueKeepChange() {
      const box = document.getElementById('chkDialogueKeepVoice');
      const on = !!(box && box.checked);
      const take = this.micTake;
      if (!this.micListening || !take) return;
      if (on) {
        take.wanted = true;
        take.failed = false;
        take.discard = false;
        this.beginVoiceTake(take.epoch);
        this.setDialogueStatus('Listening… this take will be kept on this browser.');
        return;
      }
      take.wanted = false;
      take.failed = false;
      take.discard = true;
      this.releaseMicTakeAudio(take);
      this.setDialogueStatus('Listening… this take will not be kept.');
    }

    beginVoiceTake(epoch) {
      const take = this.micTake;
      if (!take || take.epoch !== epoch || take.failed || take.discard || take.recorder || take.blob) return;
      const media = navigator.mediaDevices;
      if (!media || typeof media.getUserMedia !== 'function' || typeof MediaRecorder === 'undefined') {
        take.failed = true;
        this.setDialogueStatus('Listening… take was not kept. This browser cannot store a voice clip.');
        return;
      }
      media.getUserMedia({ audio: true }).then((stream) => {
        if (!this.micTake || this.micTake !== take || take.epoch !== this.micEpoch || !this.micListening || take.failed || take.discard) {
          this.releaseMicStream(stream);
          return;
        }
        let rec;
        try {
          const mime = this.pickAudioMime();
          rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        } catch (err) {
          this.releaseMicStream(stream);
          take.failed = true;
          this.setDialogueStatus('Listening… take was not kept. Speech-to-text is using the mic.');
          return;
        }
        take.recorder = rec;
        take.stream = stream;
        rec.ondataavailable = (ev) => {
          if (!ev.data || !ev.data.size || take.discard) return;
          take.chunks.push(ev.data);
          let bytes = 0;
          for (let i = 0; i < take.chunks.length; i += 1) bytes += take.chunks[i].size;
          if (!take.stopQueued && bytes > 280000) this.requestMicStop(take);
        };
        rec.onstop = () => {
          if (!take.discard && !take.blob) {
            const blob = new Blob(take.chunks, { type: rec.mimeType || 'audio/webm' });
            take.blob = blob.size ? blob : null;
          }
          take.chunks = [];
          take.stopQueued = false;
          take.recorder = null;
          this.releaseMicStream(take.stream);
          take.stream = null;
          if (take.done) this.commitVoiceTake(take);
          else if (this.micListening && this.micTake === take && !this.dialogueSending) {
            this.setDialogueStatus('Listening… voice clip set aside. Still filling the line.');
          }
        };
        try {
          rec.start(1000);
        } catch (err) {
          take.recorder = null;
          this.releaseMicStream(stream);
          take.stream = null;
          take.failed = true;
          this.setDialogueStatus('Listening… take was not kept. Speech-to-text is using the mic.');
        }
      }).catch(() => {
        if (!this.micTake || this.micTake !== take) return;
        take.failed = true;
        if (this.micListening && !this.dialogueSending) {
          this.setDialogueStatus('Listening… take was not kept. Speech-to-text is using the mic.');
        }
      });
    }

    pickAudioMime() {
      if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
      const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
      for (let i = 0; i < types.length; i += 1) {
        if (MediaRecorder.isTypeSupported(types[i])) return types[i];
      }
      return '';
    }

    requestMicStop(take) {
      if (!take || !take.recorder || take.recorder.state === 'inactive' || take.stopQueued) return false;
      take.stopQueued = true;
      try {
        take.recorder.stop();
        return true;
      } catch (err) {
        take.stopQueued = false;
        return false;
      }
    }

    releaseMicStream(stream) {
      if (!stream || !stream.getTracks) return;
      stream.getTracks().forEach((track) => {
        try { track.stop(); } catch (err) { /* track already ended */ }
      });
    }

    releaseMicTakeAudio(take) {
      if (!take) return;
      take.discard = true;
      take.blob = null;
      take.chunks = [];
      const rec = take.recorder;
      if (rec) {
        rec.ondataavailable = null;
        rec.onstop = () => {
          take.stopQueued = false;
          take.recorder = null;
          this.releaseMicStream(take.stream);
          take.stream = null;
        };
        if (!take.stopQueued && rec.state !== 'inactive') {
          take.stopQueued = true;
          try { rec.stop(); } catch (err) {
            take.stopQueued = false;
            take.recorder = null;
            this.releaseMicStream(take.stream);
            take.stream = null;
          }
        }
      } else {
        this.releaseMicStream(take.stream);
        take.stream = null;
      }
    }

    failVoiceTake(statusMsg) {
      const take = this.micTake;
      if (!take) return;
      take.failed = true;
      this.releaseMicTakeAudio(take);
      if (statusMsg && this.micListening) this.setDialogueStatus(statusMsg);
    }

    commitVoiceTake(take) {
      if (!take || take.committed) return;
      if (take.recorder && take.recorder.state !== 'inactive') return;
      take.committed = true;
      this.releaseMicStream(take.stream);
      take.stream = null;
      const transcript = String(take.transcript || '').trim();
      const heardLine = transcript.length >= 420
        ? 'Heard. The line is full. Edit it or Send.'
        : 'Heard. Edit the line or Send.';
      if (take.discard || !take.wanted || take.failed) {
        if (!take.quiet && transcript) {
          this.setDialogueStatus(take.wanted && take.failed
            ? 'Heard. Take was not kept. Speech-to-text used the mic.'
            : heardLine);
        } else if (!take.quiet && take.listening && !transcript) {
          this.setDialogueStatus('No speech heard.');
        }
        return;
      }
      const blob = take.blob;
      if (!blob || !blob.size || !transcript || blob.size > 280000) {
        if (!take.quiet) {
          this.setDialogueStatus(!transcript
            ? 'No speech heard. Take was not kept.'
            : (blob && blob.size > 280000
              ? 'Heard. Take was not kept because the clip is too long.'
              : 'Heard. Take was not kept. Speech-to-text used the mic.'));
        }
        return;
      }
      this.storeVoiceTake(blob, transcript).then((count) => {
        if (!take.quiet && !this.dialogueSending) {
          this.setDialogueStatus(`Heard. Take kept on this browser (${count} of 4). Voice training is later.`);
        }
      }).catch(() => {
        if (!take.quiet && !this.dialogueSending) {
          this.setDialogueStatus('Heard. Take was not kept on this browser.');
        }
      });
    }

    // Local only. Clips are not uploaded. Cap is a few short takes for a later voice.
    storeVoiceTake(blob, transcript) {
      const maxBytes = 280000;
      if (!blob || typeof localStorage === 'undefined' || typeof FileReader === 'undefined') {
        return Promise.reject(new Error('this browser cannot keep a voice take'));
      }
      if (!blob.size || blob.size > maxBytes) return Promise.reject(new Error('clip is too long'));
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        let settled = false;
        const finish = (ok, value) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (ok) resolve(value);
          else reject(value instanceof Error ? value : new Error('could not keep the take'));
        };
        const timer = setTimeout(() => {
          try { reader.abort(); } catch (err) { /* reader already finished */ }
          finish(false, new Error('could not read the clip'));
        }, 4000);
        reader.onload = () => {
          try {
            const text = String(reader.result || '');
            const comma = text.indexOf(',');
            const audio = comma >= 0 ? text.slice(comma + 1) : text;
            if (!audio) throw new Error('empty clip');
            finish(true, this.rememberVoiceTake(audio, blob.size, blob.type || 'audio/webm', transcript));
          } catch (err) {
            finish(false, err);
          }
        };
        reader.onerror = () => finish(false, reader.error || new Error('could not read the clip'));
        reader.readAsDataURL(blob);
      });
    }

    rememberVoiceTake(audio, bytes, mime, transcript) {
      const cap = 4;
      if (typeof localStorage === 'undefined') throw new Error('this browser cannot keep a voice take');
      if (!audio || !bytes || bytes > 280000) throw new Error('clip is too long');
      this.micSerial += 1;
      const row = {
        id: Date.now() * 1000 + (this.micSerial % 1000),
        mime: mime || 'audio/webm',
        transcript: String(transcript || '').slice(0, 420),
        bytes,
        audio,
        createdAt: Date.now()
      };
      let rows = [];
      try {
        const parsed = JSON.parse(localStorage.getItem('zoth-voice-takes') || '[]');
        if (Array.isArray(parsed)) rows = parsed;
      } catch (err) {
        rows = [];
      }
      rows.push(row);
      rows.sort((a, b) => a.id - b.id);
      while (rows.length > cap) rows.shift();
      try {
        localStorage.setItem('zoth-voice-takes', JSON.stringify(rows));
      } catch (err) {
        rows.shift();
        if (!rows.length) throw err;
        localStorage.setItem('zoth-voice-takes', JSON.stringify(rows));
      }
      return rows.length;
    }

    ensureWalker() {
      if (this.walkerMesh) return this.walkerMesh;
      const geos = this.ensureCharacterGeos();
      const group = new THREE.Group();
      const figure = new THREE.Group();
      figure.rotation.y = Math.PI;
      figure.userData.keepMesh = true;

      const cloth = new THREE.MeshStandardMaterial({ color: 0x181b24, roughness: 0.56, metalness: 0.24 });
      const darkLeather = new THREE.MeshStandardMaterial({ color: 0x0f1218, roughness: 0.72, metalness: 0.22 });
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xe8be9e, roughness: 0.52, metalness: 0.05 });
      const gold = new THREE.MeshStandardMaterial({ color: 0xf5c16c, roughness: 0.26, metalness: 0.82, emissive: 0x7c4a12, emissiveIntensity: 0.38 });
      const cyanOrb = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.85, roughness: 0.14, metalness: 0.88 });

      const buildWalkerLeg = (sideSign) => {
        const legPivot = new THREE.Group();
        legPivot.position.set(sideSign * 0.14, 0.78, 0);
        const thigh = new THREE.Mesh(geos.thigh, cloth);
        thigh.position.set(0, -0.20, 0);
        thigh.castShadow = true;
        legPivot.add(thigh);
        const knee = new THREE.Mesh(geos.knee, gold);
        knee.position.set(0, -0.40, 0.02);
        legPivot.add(knee);
        const shin = new THREE.Mesh(geos.shin, darkLeather);
        shin.position.set(0, -0.58, 0);
        shin.castShadow = true;
        legPivot.add(shin);
        const boot = new THREE.Mesh(geos.boot, darkLeather);
        boot.position.set(0, -0.74, 0.05);
        boot.castShadow = true;
        legPivot.add(boot);
        return legPivot;
      };
      const leftLeg = buildWalkerLeg(-1);
      const rightLeg = buildWalkerLeg(1);
      figure.add(leftLeg, rightLeg);

      const skirt = new THREE.Mesh(geos.skirt, cloth);
      skirt.position.y = 0.58;
      skirt.castShadow = true;
      figure.add(skirt);

      const pelvis = new THREE.Mesh(geos.pelvis, darkLeather);
      pelvis.position.y = 0.82;
      figure.add(pelvis);

      const belt = new THREE.Mesh(geos.belt, darkLeather);
      belt.position.y = 0.90;
      const buckle = new THREE.Mesh(geos.buckle, gold);
      buckle.position.set(0, 0.90, 0.25);
      figure.add(belt, buckle);

      const torso = new THREE.Mesh(geos.torso, cloth);
      torso.position.y = 1.26;
      torso.scale.set(1.08, 1.0, 0.84);
      torso.castShadow = true;
      figure.add(torso);

      const chestTrim = new THREE.Mesh(geos.chestTrim, gold);
      chestTrim.position.set(0, 1.30, 0.19);
      figure.add(chestTrim);

      const collar = new THREE.Mesh(geos.collar, gold);
      collar.rotation.x = Math.PI / 2;
      collar.position.set(0, 1.62, 0);
      figure.add(collar);

      const capePivot = new THREE.Group();
      capePivot.position.set(0, 1.58, -0.22);
      const cape = new THREE.Mesh(geos.cape, cloth);
      cape.position.set(0, -0.56, -0.05);
      cape.rotation.x = 0.16;
      cape.castShadow = true;
      capePivot.add(cape);
      figure.add(capePivot);

      const buildWalkerArm = (sideSign) => {
        const armPivot = new THREE.Group();
        armPivot.position.set(sideSign * 0.39, 1.54, 0);
        const pauldron = new THREE.Mesh(geos.pauldron, gold);
        pauldron.position.set(sideSign * 0.03, 0.03, 0);
        pauldron.scale.set(1.15, 0.9, 1.12);
        armPivot.add(pauldron);
        const upperArm = new THREE.Mesh(geos.upperArm, cloth);
        upperArm.position.set(sideSign * 0.03, -0.18, 0);
        upperArm.rotation.z = -sideSign * 0.08;
        upperArm.castShadow = true;
        armPivot.add(upperArm);
        const forearm = new THREE.Mesh(geos.forearm, gold);
        forearm.position.set(sideSign * 0.05, -0.48, 0.06);
        forearm.rotation.x = -0.24;
        forearm.castShadow = true;
        armPivot.add(forearm);
        const hand = new THREE.Mesh(geos.hand, skinMat);
        hand.position.set(sideSign * 0.06, -0.66, 0.12);
        armPivot.add(hand);
        return armPivot;
      };
      const leftArm = buildWalkerArm(-1);
      const rightArm = buildWalkerArm(1);
      figure.add(leftArm, rightArm);

      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.92, 0);
      const neck = new THREE.Mesh(geos.neck, skinMat);
      neck.position.set(0, -0.22, 0);
      headGroup.add(neck);
      const head = new THREE.Mesh(geos.head, skinMat);
      head.scale.set(0.95, 1.06, 0.98);
      head.castShadow = true;
      headGroup.add(head);
      const visor = new THREE.Mesh(geos.visor, cyanOrb);
      visor.position.set(0, 0.04, 0.24);
      headGroup.add(visor);
      const hood = new THREE.Mesh(geos.hood, cloth);
      hood.position.set(0, 0.03, -0.02);
      hood.rotation.x = -0.22;
      headGroup.add(hood);
      const crownTrim = new THREE.Mesh(geos.crownBase, gold);
      crownTrim.position.set(0, 0.19, 0);
      crownTrim.scale.set(0.92, 0.65, 0.92);
      headGroup.add(crownTrim);
      figure.add(headGroup);

      // Floating alchemical companion drone orb + orbital ring
      const droneGroup = new THREE.Group();
      droneGroup.position.set(0.68, 2.25, 0.15);
      const droneCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 1), cyanOrb);
      const droneRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 6, 18), gold);
      droneRing.rotation.x = Math.PI / 2.4;
      droneGroup.add(droneCore, droneRing);
      group.add(droneGroup);
      group.userData.drone = droneGroup;
      group.userData.droneRing = droneRing;

      const shadowMat = this.sharedShadowMat.clone();
      const shadow = new THREE.Mesh(this.sharedShadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.04;
      shadow.scale.set(0.55, 0.55, 0.55);
      group.add(figure, shadow);
      group.userData.shadow = shadow;
      group.userData.rig = {
        figure,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        cape: capePivot,
        head: headGroup
      };
      group.visible = false;
      this.scene.add(group);
      this.walkerMesh = group;
      return group;
    }

    placeWalker(normal, face, hop) {
      const walker = this.ensureWalker();
      walker.visible = true;
      const up = normal.clone().normalize();
      let forward = face.clone();
      forward.addScaledVector(up, -forward.dot(up));
      if (forward.lengthSq() < 1e-8) forward = this.tangentBasis(up).north.clone();
      forward.normalize();
      const back = forward.clone().negate();
      const right = new THREE.Vector3().crossVectors(up, back).normalize();
      const orthoBack = new THREE.Vector3().crossVectors(right, up).normalize();
      const elev = (this.avatar && this.avatar.stairElevation) || 0;
      walker.position.copy(up).multiplyScalar(PLANET_RADIUS + elev + hop + 0.06);
      walker.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, orthoBack));

      // Dynamic Contact Shadow on ground or stair surface
      if (walker.userData.shadow) {
        walker.userData.shadow.position.y = -hop + 0.04;
        const shadowScale = 0.55 / (1 + hop * 0.35);
        walker.userData.shadow.scale.set(shadowScale, shadowScale, shadowScale);
        if (walker.userData.shadow.material) {
          walker.userData.shadow.material.opacity = Math.max(0.06, 0.45 / (1 + hop * 0.5));
        }
      }

      // Landing squash and elastic rebound physics
      const squash = (this.avatar && this.avatar.landingSquash) || 0;
      const baseScale = 1.12;
      walker.scale.set(baseScale * (1 + squash * 0.45), baseScale * (1 - squash), baseScale * (1 + squash * 0.45));

      // Articulated bipedal stride & cape physics for player walker
      const rig = walker.userData.rig;
      if (rig) {
        const speed = (this.avatar && this.avatar.velocity) ? this.avatar.velocity.length() : 0;
        const phase = (this.avatar && this.avatar.bobPhase) || 0;
        const strideAmp = Math.min(0.65, speed * 0.055);
        if (hop > 0.12) {
          rig.leftLeg.rotation.x = 0.35;
          rig.rightLeg.rotation.x = -0.28;
          rig.leftArm.rotation.x = -0.45;
          rig.rightArm.rotation.x = -0.45;
          rig.cape.rotation.x = 0.52;
        } else if (speed > 0.35) {
          const swing = Math.sin(phase) * strideAmp;
          rig.leftLeg.rotation.x = swing;
          rig.rightLeg.rotation.x = -swing;
          rig.leftArm.rotation.x = -swing * 0.85;
          rig.rightArm.rotation.x = swing * 0.85;
          rig.cape.rotation.x = 0.14 + Math.min(0.42, speed * 0.028) + Math.abs(Math.cos(phase)) * 0.08;
          rig.figure.position.y = Math.abs(Math.sin(phase)) * 0.06;
        } else {
          const breath = Math.sin(this.animTick * 0.05);
          rig.leftLeg.rotation.x *= 0.82;
          rig.rightLeg.rotation.x *= 0.82;
          rig.leftArm.rotation.x = breath * 0.03;
          rig.rightArm.rotation.x = -breath * 0.03;
          rig.cape.rotation.x = 0.06 + Math.abs(breath) * 0.04;
          rig.figure.position.y = breath * 0.015;
        }
      }

      // Floating drone harmonic idle hover
      if (walker.userData.drone) {
        walker.userData.drone.position.y = 2.25 + Math.sin(this.animTick * 0.08) * 0.08;
        walker.userData.drone.rotation.y += 0.04;
      }
      if (walker.userData.droneRing) {
        walker.userData.droneRing.rotation.z += 0.06;
      }
    }

    syncPovButtons(walking) {
      const btnGods = document.getElementById('btnGodsView');
      const btnSurface = document.getElementById('btnSurfaceView');
      const quickPill = document.getElementById('quickPovPill');
      const banner = document.getElementById('avatarControlsBanner');
      if (btnGods) btnGods.classList.toggle('active', !walking);
      if (btnSurface) btnSurface.classList.toggle('active', walking);
      if (banner) banner.style.display = walking ? 'flex' : 'none';
      if (quickPill) {
        if (walking) {
          quickPill.innerHTML = '<span>👑</span> Press Esc or G for God\'s Eye';
          quickPill.style.borderColor = '#F59E0B';
          quickPill.style.color = '#FDE68A';
        } else {
          quickPill.innerHTML = '<span>🎮</span> Press G or click to walk the surface';
          quickPill.style.borderColor = '#10B981';
          quickPill.style.color = '#6EE7B7';
        }
      }
    }

    leaveWalk() {
      if (this.walkVoice && this.walkVoice.partnerId) this.endLiveVisit(true, true);
      else this.silenceWalkVoice();
      this.closeDialogue();
      this.isAvatarMode = false;
      if (this.walkerMesh) this.walkerMesh.visible = false;
      if (typeof document !== 'undefined' && document.pointerLockElement && document.exitPointerLock) {
        document.exitPointerLock();
      }
      const prompt = document.getElementById('avatarProximityPrompt');
      if (prompt) prompt.style.display = 'none';
      if (this.renderer && this.renderer.domElement) this.renderer.domElement.classList.remove('is-walking');
      const cross = document.getElementById('walkCrosshair');
      if (cross) cross.hidden = true;
      this.syncPovButtons(false);
    }

    returnToGodsEye() {
      const from = (this.avatar && this.avatar.normal) ? this.avatar.normal.clone() : this.camera.position.clone();
      this.leaveWalk();
      this.viewMode = 'globe';
      this.local = null;
      this.pendingLocal = null;
      if (this.camera) {
        this.camera.near = 0.5;
        this.camera.fov = 46;
        this.camera.updateProjectionMatrix();
      }
      const orbitPos = from.normalize().multiplyScalar(250);
      this.flyTo(orbitPos, 250, 1100, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
    }

    exitAvatarMode() {
      this.returnToGodsEye();
    }

    raycastToSurface(e) {
      if (!this.planetMesh) return;
      if (e) this.setMouseFromEvent(e);
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hits = this.raycaster.intersectObject(this.planetMesh, false);
      if (hits.length > 0) this.enterAvatarMode(hits[0].point);
    }

    togglePov() {
      if (this.isAvatarMode) this.returnToGodsEye();
      else this.enterAvatarMode();
    }

    enterAvatarMode(point = null, options = {}) {
      this.closeEncounter();
      this.isAvatarMode = true;
      this.ensureWalkAudio();
      this.viewMode = 'walk';
      this.local = null;
      this.pendingLocal = null;
      if (!point) {
        const colony = (this.activeColonyId && COLONY_COORDS[this.activeColonyId]) ? COLONY_COORDS[this.activeColonyId] : COLONY_COORDS.colony_capital;
        point = this.latLonToVec3(colony.lat + 4.8, colony.lon, PLANET_RADIUS);
      }
      let normal = point.clone().normalize();
      let ground = this.resolveCollisions(normal.clone().multiplyScalar(PLANET_RADIUS), true);
      normal = ground.normalize();
      const basis = this.tangentBasis(normal);
      let forward = basis.north.clone();
      if (options.faceTarget) {
        const to = options.faceTarget.clone().sub(normal.clone().multiplyScalar(PLANET_RADIUS));
        to.addScaledVector(normal, -to.dot(normal));
        if (to.lengthSq() > 1e-6) forward = to.normalize();
      }
      const initStairElev = this.sampleWalkerStairElevation(ground, 0);
      this.avatar = {
        normal,
        forward,
        pitch: 0.42,
        camDist: 9.2,
        hop: 0,
        stairElevation: initStairElev,
        verticalVelocity: 0,
        isGrounded: true,
        walkSpeed: 9.2,
        sprintMultiplier: 1.8,
        gravity: 40,
        jumpForce: 13.2,
        velocity: new THREE.Vector3(),
        position: normal.clone().multiplyScalar(PLANET_RADIUS + initStairElev),
        keys: { forward: false, backward: false, left: false, right: false, sprint: false },
        isMouseDown: false,
        mouseStart: { x: 0, y: 0 },
        bob: 0,
        bobPhase: 0,
        stepClock: 0
      };
      this.camera.near = 0.12;
      this.camera.fov = 56;
      this.camera.updateProjectionMatrix();
      this.ensureWalker();
      this.syncPovButtons(true);
      if (this.renderer && this.renderer.domElement) this.renderer.domElement.classList.add('is-walking');
      const cross = document.getElementById('walkCrosshair');
      if (cross) cross.hidden = false;
      const look = this.avatarLook(normal, forward, 0, 0);
      const camPos = this.walkCameraPosition(look, forward, normal, this.avatar.pitch, this.avatar.camDist);
      this.placeWalker(normal, forward, 0);
      if (options && options.instant) {
        this.cameraTransition = null;
        if (this.controls) {
          this.controls.enabled = false;
          this.controls.autoRotate = false;
        }
        this.camSpringPos = camPos.clone();
        this.camera.position.copy(camPos);
        this.camera.up.copy(normal);
        this.camera.lookAt(look);
        this.updateAvatar(0.016);
        if (this.renderer && this.scene) {
          this.renderer.render(this.scene, this.camera);
        }
      } else {
        this.flyTo(camPos, camPos.length(), 1050, look, normal);
      }
    }

    walkToAgent(agentId) {
      const ent = this.entityById(agentId);
      if (!ent) return;
      const n = ent.position.clone().normalize();
      const basis = this.tangentBasis(n);
      let stand = null;
      let bestShift = Infinity;
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const dir = basis.east.clone().multiplyScalar(Math.cos(ang)).addScaledVector(basis.north, Math.sin(ang));
        const raw = ent.position.clone().addScaledVector(dir, 9.2).normalize().multiplyScalar(PLANET_RADIUS);
        const resolved = this.resolveCollisions(raw, true);
        const shift = resolved.distanceTo(raw);
        if (shift < bestShift) {
          bestShift = shift;
          stand = resolved;
        }
      }
      this.enterAvatarMode(stand, { faceTarget: ent.position });
      this.setSelected(ent);
      if (ent.userData.agent) this.openAgentCard(ent.userData.agent);
    }

    updateLocalOrbit() {
      const L = this.local;
      if (!L) return;
      if (L.followId) {
        const ent = this.entityById(L.followId);
        if (ent) {
          const n = ent.position.clone().normalize();
          L.focus = ent.position.clone().addScaledVector(n, 2.3);
          L.anchor = ent.position.clone();
        }
      }
      const pose = this.localCameraPose(L.focus, L.yaw, L.tilt, L.dist);
      this.camera.up.copy(pose.normal);
      this.camera.position.copy(pose.camPos);
      this.camera.lookAt(L.focus);
      const look = new THREE.Vector3();
      this.camera.getWorldDirection(look);
      look.addScaledVector(pose.normal, -look.dot(pose.normal));
      if (look.lengthSq() > 1e-6) this.updateCompass(look.normalize(), pose.normal);
    }

    panLocal(dx, dy) {
      const L = this.local;
      if (!L) return;
      if (L.followId) L.followId = null;
      const normal = L.focus.clone().normalize();
      const { north, east } = this.tangentBasis(normal);
      const scale = L.dist * 0.0016;
      const next = L.focus.clone().addScaledVector(east, -dx * scale).addScaledVector(north, dy * scale);
      next.normalize();
      if (L.anchor) {
        const anchor = L.anchor.clone().normalize();
        const ang = anchor.angleTo(next);
        const maxArc = 0.42;
        if (ang > maxArc) {
          next.copy(this.slerpDir(anchor, next, maxArc / ang));
          this.noteBoundary('District boundary');
        }
      }
      const lift = L.focus.length() > PLANET_RADIUS ? L.focus.length() : PLANET_RADIUS + 6;
      L.focus.copy(next.multiplyScalar(lift));
    }

    updateAvatar(delta) {
      if (!this.avatar) return;
      const dt = Math.min(Math.max(delta, 0.001), 0.05);
      let normal = this.avatar.normal.clone().normalize();
      let forward = this.avatar.forward.clone();
      forward.addScaledVector(normal, -forward.dot(normal));
      if (forward.lengthSq() < 1e-8) forward = this.tangentBasis(normal).north.clone();
      forward.normalize();
      const right = new THREE.Vector3().crossVectors(forward, normal).normalize();

      let moveF = 0;
      let moveS = 0;
      if (this.avatar.keys.forward) moveF += 1;
      if (this.avatar.keys.backward) moveF -= 1;
      if (this.avatar.keys.right) moveS += 1;
      if (this.avatar.keys.left) moveS -= 1;
      const wish = new THREE.Vector3();
      if (moveF !== 0 || moveS !== 0) {
        wish.addScaledVector(forward, moveF).addScaledVector(right, moveS).normalize();
      }
      const vel = this.avatar.velocity;
      vel.addScaledVector(normal, -vel.dot(normal));
      const maxSpeed = this.avatar.walkSpeed * (this.avatar.keys.sprint ? this.avatar.sprintMultiplier : 1);
      const accel = this.avatar.isGrounded ? 48 : 20; // in-air vs grounded traction
      if (wish.lengthSq() > 0) {
        vel.addScaledVector(wish, accel * dt);
        if (vel.length() > maxSpeed) vel.multiplyScalar(maxSpeed / vel.length());
      } else {
        const friction = this.avatar.isGrounded ? 9.5 : 2.2;
        vel.multiplyScalar(Math.exp(-friction * dt));
        if (vel.length() < 0.05) vel.set(0, 0, 0);
      }

      const oldGround = normal.clone().multiplyScalar(PLANET_RADIUS);
      let ground = oldGround.clone().addScaledVector(vel, dt);
      ground = this.resolveCollisions(ground);
      normal = ground.normalize();
      const actual = normal.clone().multiplyScalar(PLANET_RADIUS).sub(oldGround);
      actual.addScaledVector(this.avatar.normal, -actual.dot(this.avatar.normal));
      if (actual.length() < vel.length() * dt * 0.9) {
        vel.copy(actual.multiplyScalar(1 / dt));
      }

      // Smooth wall-sliding collision deflection (prevents sticky wall snagging)
      const pushDelta = ground.clone().sub(oldGround.clone().addScaledVector(vel, dt));
      if (pushDelta.lengthSq() > 1e-6) {
        const pushNorm = pushDelta.clone().normalize();
        const vIn = vel.dot(pushNorm);
        if (vIn < 0) {
          vel.addScaledVector(pushNorm, -vIn * 1.05);
        }
      }

      // Stairway & Overlook Elevation Physics (Stairway to Zoth, Belvedere, Civic Hall stairs)
      const prevStairElev = this.avatar.stairElevation || 0;
      const targetStairElev = this.sampleWalkerStairElevation(ground, prevStairElev);
      if (targetStairElev >= prevStairElev) {
        this.avatar.stairElevation = prevStairElev + (targetStairElev - prevStairElev) * Math.min(1, dt * 18);
      } else if (prevStairElev - targetStairElev <= 1.35) {
        this.avatar.stairElevation = prevStairElev + (targetStairElev - prevStairElev) * Math.min(1, dt * 16);
        if (this.avatar.stairElevation < 0.02) this.avatar.stairElevation = 0;
      } else {
        // Stepped off a high ledge or overlook deck — convert drop into airborne hop under gravity
        this.avatar.hop = (this.avatar.hop || 0) + (prevStairElev - targetStairElev);
        this.avatar.stairElevation = targetStairElev;
        this.avatar.isGrounded = false;
      }

      forward.addScaledVector(normal, -forward.dot(normal));
      if (forward.lengthSq() < 1e-8) forward = this.tangentBasis(normal).north.clone();
      forward.normalize();
      this.avatar.forward.copy(forward);
      this.avatar.normal.copy(normal);

      // Jump & Landing Impact Physics
      if (!this.avatar.isGrounded || this.avatar.verticalVelocity !== 0) {
        this.avatar.verticalVelocity -= this.avatar.gravity * dt;
        this.avatar.hop += this.avatar.verticalVelocity * dt;
        if (this.avatar.hop <= 0) {
          const impact = Math.abs(this.avatar.verticalVelocity);
          if (impact > 2.2) {
            this.avatar.landingSquash = Math.min(0.35, impact * 0.024);
            this.spawnFootstepParticle(normal, impact > 5.5);
            if (typeof HermeticAudio !== 'undefined' && HermeticAudio.playClick) {
              HermeticAudio.playClick(440);
            }
          }
          this.avatar.hop = 0;
          this.avatar.verticalVelocity = 0;
          this.avatar.isGrounded = true;
        }
      }
      if (this.avatar.landingSquash > 0.001) {
        this.avatar.landingSquash *= Math.exp(-12 * dt);
      } else {
        this.avatar.landingSquash = 0;
      }

      // Footstep Particles & Bobbing
      const speed = vel.length();
      if (this.avatar.isGrounded && speed > 0.5) {
        const prevPhase = this.avatar.bobPhase;
        this.avatar.bobPhase += dt * (this.avatar.keys.sprint ? 13 : 9.5);
        this.avatar.bob = Math.abs(Math.sin(this.avatar.bobPhase)) * 0.08;
        if (Math.floor(prevPhase / Math.PI) !== Math.floor(this.avatar.bobPhase / Math.PI)) {
          this.spawnFootstepParticle(normal, false);
          if (typeof HermeticAudio !== 'undefined' && HermeticAudio.playFootstep) {
            HermeticAudio.playFootstep({
              stairElevation: this.avatar.stairElevation || 0,
              inHall: !!this.hallNearAvatar(),
              sprint: !!this.avatar.keys.sprint
            });
          }
        }
      } else {
        this.avatar.bob = 0;
      }

      const look = this.avatarLook(normal, forward, this.avatar.hop, this.avatar.bob);
      const camPos = this.walkCameraPosition(look, forward, normal, this.avatar.pitch, this.avatar.camDist);

      // Spring-Arm Third-Person Camera with Critical Damping
      if (!this.camSpringPos) this.camSpringPos = camPos.clone();
      this.camSpringPos.lerp(camPos, Math.min(1.0, 16 * dt));
      this.camera.position.copy(this.camSpringPos);

      // Cinematic Camera Banking into turns
      const targetBank = moveS * 0.032;
      this.avatar.camBank = (this.avatar.camBank || 0) + (targetBank - (this.avatar.camBank || 0)) * Math.min(1.0, 8 * dt);
      this.camera.up.copy(normal).addScaledVector(right, this.avatar.camBank).normalize();
      this.camera.lookAt(look);

      const totalLift = (this.avatar.stairElevation || 0) + (this.avatar.hop || 0);
      this.avatar.position.copy(normal).multiplyScalar(PLANET_RADIUS + totalLift);

      let face = forward;
      if (speed > 0.55) {
        const travel = vel.clone();
        travel.addScaledVector(normal, -travel.dot(normal));
        if (travel.lengthSq() > 1e-4) face = travel.normalize();
      }
      this.placeWalker(normal, face, this.avatar.hop);
      this.updateCompass(forward, normal);
      this.checkAgentProximity();
      this.updateWalkHearing();

      const targetFov = this.avatar.keys.sprint && speed > 4 ? 64 : (speed > 0.5 ? 58 : 54);
      if (Math.abs(this.camera.fov - targetFov) > 0.2) {
        this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, dt * 5);
        this.camera.updateProjectionMatrix();
      }
    }

    updateCompass(forward, normal) {
      const { north, east } = this.tangentBasis(normal);
      const heading = Math.atan2(forward.dot(east), forward.dot(north));
      const deg = (heading * 180 / Math.PI + 360) % 360;
      const dial = document.getElementById('compassDial');
      if (dial) dial.style.transform = `rotate(${-deg}deg)`;
      let best = null;
      let bestD = Infinity;
      const here = normal.clone().multiplyScalar(PLANET_RADIUS);
      Object.keys(COLONY_COORDS).forEach((key) => {
        const c = COLONY_COORDS[key];
        const d = this.latLonToVec3(c.lat, c.lon, PLANET_RADIUS).distanceTo(here);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      });
      const readout = document.getElementById('compassReadout');
      if (readout && best) {
        const names = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const facing = names[Math.round(deg / 45) % 8];
        const where = bestD > 46 ? 'open wilds' : best.name;
        readout.textContent = `${facing} · ${where} · ${Math.round(bestD * 10)} m`;
      }
    }

    checkAgentProximity() {
      if (!this.avatar) return;
      let closestDist = Infinity;
      let closestAgent = null;
      const checkList = [...Object.values(this.agentEntities), ...Object.values(this.subagentEntities)];
      for (let i = 0; i < checkList.length; i++) {
        const ent = checkList[i];
        if (!ent || !ent.userData || !ent.userData.agent) continue;
        const dist = this.avatar.position.distanceTo(ent.position);
        if (dist < closestDist) {
          closestDist = dist;
          closestAgent = ent.userData.agent;
        }
      }
      const promptEl = document.getElementById('avatarProximityPrompt');
      const targetText = document.getElementById('proximityTargetText');
      this.nearestAgentDist = closestDist;
      this.nearestHall = this.hallNearAvatar();
      const hallHit = this.nearestHall;
      const hallWins = hallHit && (hallHit.atStation || hallHit.inside) && !(closestAgent && closestDist < 2.2);
      const showHall = hallWins || (hallHit && hallHit.atStation && !(closestAgent && closestDist < 2.2));
      if (closestDist < 7.5 && closestAgent) this.nearestAgent = closestAgent;
      else this.nearestAgent = null;
      const box = document.getElementById('avatarDialogueBox');
      const talking = box && box.style.display === 'flex';
      if (promptEl) promptEl.classList.toggle('is-live', !!(this.liveConversation && !showHall && closestAgent));
      if (talking) {
        if (promptEl) promptEl.style.display = 'none';
      } else if (showHall) {
        if (promptEl) {
          promptEl.style.display = 'flex';
          const keyBtn = promptEl.querySelector('.proximity-key-btn');
          if (keyBtn) keyBtn.textContent = 'F';
          if (targetText) targetText.textContent = `Enter ${hallHit.hall.name} · Press F`;
        }
      } else if (closestDist < 7.5 && closestAgent) {
        const first = String(closestAgent.name || 'them').split('-')[0];
        if (promptEl) {
          promptEl.style.display = 'flex';
          const keyBtn = promptEl.querySelector('.proximity-key-btn');
          if (keyBtn) keyBtn.textContent = 'F';
          if (targetText) {
            targetText.textContent = `Talk with ${first} · Press F`;
          }
        }
      } else if (promptEl) {
        promptEl.style.display = 'none';
      }
    }

    interactHere() {
      // If civic panel is open, close it
      const panel = document.getElementById('civicPanel');
      if (panel && !panel.hidden) {
        this.closeCivic();
        return;
      }
      // If dialogue box is open, close it
      const box = document.getElementById('avatarDialogueBox');
      if (box && box.style.display === 'flex') {
        this.closeDialogue();
        return;
      }

      const hallHit = this.nearestHall;
      const agent = this.nearestAgent;
      const agentDist = this.nearestAgentDist;
      const agentClose = agent && agentDist < 3.2;
      const atDoor = hallHit && hallHit.inDoorway && !hallHit.inside && !hallHit.atStation;

      if (hallHit && (hallHit.atStation || hallHit.inside) && !agentClose && !atDoor) {
        this.openCivic(hallHit.hall.id);
        return;
      }
      if (agent) {
        this.openDialogue(agent);
        return;
      }
      if (hallHit && (hallHit.atStation || hallHit.inside || hallHit.inDoorway)) {
        this.openCivic(hallHit.hall.id);
        return;
      }
    }

    interactWithNearestAgent() {
      if (!this.nearestAgent) {
        this.closeDialogue();
        return;
      }
      const box = document.getElementById('avatarDialogueBox');
      if (box && box.style.display === 'flex' && this.dialogueAgentId === this.nearestAgent.id) {
        this.closeDialogue();
        return;
      }
      this.openDialogue(this.nearestAgent);
    }

    setMouseFromEvent(e) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    selectFromRay() {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
      if (!intersects.length) return;
      let hit = intersects[0].object;
      while (hit.parent && !hit.userData.zothNodePortal && !hit.userData.agent && !hit.userData.civicId && !hit.userData.id && hit !== this.scene) hit = hit.parent;
      if (hit.userData.zothNodePortal) {
        const portalBtn = document.getElementById('btnOpenWorldPortalModal');
        if (portalBtn) portalBtn.click();
      }
      else if (hit.userData.agent) this.presentAgent(hit.userData.agent.id);
      else if (hit.userData.civicId) this.openCivic(hit.userData.civicId);
      else if (hit.userData.id) this.focusColony(hit.userData.id);
    }

    onPointerDown(e) {
      if (!this.renderer || e.target !== this.renderer.domElement) return;
      this.pointer = { x: e.clientX, y: e.clientY, button: e.button, moved: false, lastX: e.clientX, lastY: e.clientY };
      if (this.isAvatarMode && this.avatar && e.button === 0) {
        this.avatar.isMouseDown = true;
        this.avatar.mouseStart = { x: e.clientX, y: e.clientY };
        if (!e.shiftKey && this.renderer.domElement.requestPointerLock) {
          this.renderer.domElement.requestPointerLock();
        }
      }
    }

    onPointerMove(e) {
      if (!this.pointer) return;
      const dx = e.clientX - this.pointer.lastX;
      const dy = e.clientY - this.pointer.lastY;
      if (Math.abs(e.clientX - this.pointer.x) + Math.abs(e.clientY - this.pointer.y) > 6) this.pointer.moved = true;
      this.pointer.lastX = e.clientX;
      this.pointer.lastY = e.clientY;
      if (this.viewMode !== 'local' || !this.local || this.cameraTransition || !this.pointer.moved) return;
      if (this.pointer.button === 0) {
        this.local.yaw -= dx * 0.005;
        this.local.tilt = Math.max(0.4, Math.min(1.15, this.local.tilt + dy * 0.0035));
      } else if (this.pointer.button === 2) {
        this.panLocal(dx, dy);
      }
    }

    onPointerUp(e) {
      if (this.avatar) this.avatar.isMouseDown = false;
      const pointer = this.pointer;
      this.pointer = null;
      if (!pointer || pointer.moved || !this.renderer || e.target !== this.renderer.domElement) return;
      if (this.isAvatarMode || e.button !== 0) return;
      this.setMouseFromEvent(e);
      if (e.ctrlKey || e.metaKey) {
        this.raycastToSurface(e);
        return;
      }
      this.selectFromRay();
    }

    selfTestFrame() {
      const failures = [];
      const assert = (cond, msg) => { if (!cond) failures.push(msg); };
      const capital = this.latLonToVec3(0, 0, PLANET_RADIUS).normalize();
      assert(capital.x > 0.99 && Math.abs(capital.y) < 0.02 && Math.abs(capital.z) < 0.02, 'capital normal is +X');
      const basis = this.tangentBasis(capital);
      assert(basis.north.y > 0.99, 'north is +Y at the capital');
      assert(basis.east.z < -0.99, 'east is -Z at the capital');
      const f0 = basis.north.clone();
      const screenRight = new THREE.Vector3().crossVectors(f0, capital).normalize();
      assert(screenRight.dot(basis.east) > 0.99, 'facing north, screen right is east');
      const f1 = this.rotateForward(f0, capital, 0.25);
      assert(f1.clone().sub(f0).normalize().dot(screenRight) > 0.9, 'mouse-right turns toward screen right');
      const look = capital.clone().multiplyScalar(PLANET_RADIUS + 2.05);
      const cam = this.walkCameraPosition(look, f0, capital, 0, 8);
      assert(look.clone().sub(cam).normalize().dot(f0) > 0.98, 'camera sits behind forward');
      assert(cam.length() > PLANET_RADIUS + 1.2, 'walk camera stays outside the planet');
      const camHigh = this.walkCameraPosition(look, f0, capital, 0.3, 8);
      assert(camHigh.dot(capital) > look.dot(capital) + 0.4, 'positive pitch raises the camera');
      const raised = look.clone().sub(camHigh);
      raised.addScaledVector(capital, -raised.dot(capital));
      assert(raised.normalize().dot(f0) > 0.9, 'raised camera stays behind forward');
      const obj = new THREE.Object3D();
      const face = basis.east.clone();
      this.placeOnSphereFacing(obj, 0, 0, 0, face);
      const mounted = new THREE.Vector3(0, 0, -1).applyQuaternion(obj.quaternion);
      assert(mounted.dot(face) > 0.98, 'local -z matches the facing direction');
      const mountedRight = new THREE.Vector3(1, 0, 0).applyQuaternion(obj.quaternion);
      const expectRight = new THREE.Vector3().crossVectors(face, capital).normalize();
      assert(mountedRight.dot(expectRight) > 0.98, 'local +x is forward × up');
      const mountedUp = new THREE.Vector3(0, 1, 0).applyQuaternion(obj.quaternion);
      assert(mountedUp.dot(capital) > 0.98, 'local +y is the surface normal');
      const group = new THREE.Group();
      this.placeOnSphere(group, 0, 0, 0);
      group.updateMatrixWorld(true);
      const center = this.latLonToVec3(0, 0, PLANET_RADIUS);
      const pushed = this.pushOutOfCircle(center, { group, x: 0, z: 0, r: 5 });
      const localC = group.worldToLocal(pushed.clone());
      assert(Math.hypot(localC.x, localC.z) >= 5.7, 'circle collider pushes the body out');
      const pushedB = this.pushOutOfBox(center, { group, x: 0, z: 0, hx: 2, hz: 0.3, rot: 0 });
      const localB = group.worldToLocal(pushedB.clone());
      assert(Math.abs(localB.z) + 0.05 >= Math.abs(localB.x), 'box push exits through the thin side');
      assert(Math.hypot(localB.x, localB.z) >= 0.9, 'box collider rejects the center');
      const flight = this.sampleFlight({
        startDir: new THREE.Vector3(0, 0, 1),
        endDir: new THREE.Vector3(-1, 0, 0),
        detour: null,
        startR: 240,
        endR: 140
      }, 0.5);
      assert(flight.length() > PLANET_RADIUS + 8, 'city flight stays outside the planet');
      const around = this.sampleFlight({
        startDir: new THREE.Vector3(0, 0, 1),
        endDir: new THREE.Vector3(0, 0, -1),
        detour: new THREE.Vector3(1, 0, 0),
        startR: 240,
        endR: 240
      }, 0.5);
      assert(around.length() > PLANET_RADIUS + 8, 'opposite flight detours outside the planet');
      const focus = capital.clone().multiplyScalar(PLANET_RADIUS + 6);
      const pose = this.localCameraPose(focus, 0.5, 0.8, 36);
      const view = focus.clone().sub(pose.camPos).normalize();
      assert(Math.abs(view.dot(pose.normal)) < 0.92, 'city view is oblique so the horizon stays defined');
      assert(pose.camPos.length() > PLANET_RADIUS + 2, 'city camera is outside the planet');
      const returned = { colonyKey: 'colony_adytum_grove', currentIdx: 4, targetIdx: 6 };
      const grove = this.bindRoute(returned);
      assert(grove.length === 6, 'adytum route has its stops and the stairway');
      assert(returned.currentIdx === 4 && returned.targetIdx === 0, 'an index past the grove wraps');
      assert(Number.isFinite(grove[returned.currentIdx].lat) && Number.isFinite(grove[returned.targetIdx].lat), 'wrapped stops have coordinates');
      assert(grove[5] && grove[5].name === 'Stairway to Zoth', 'adytum overlook is the last stop');
      const capitalWalk = { colonyKey: 'colony_capital', currentIdx: 5, targetIdx: 2 };
      const capitalRoute = this.bindRoute(capitalWalk);
      assert(capitalRoute.length === 7, 'capital keeps its stops and the stairway');
      assert(capitalWalk.currentIdx === 5 && Number.isFinite(capitalRoute[5].lat), 'capital keeps its sixth stop');
      assert(capitalRoute[6] && capitalRoute[6].name === 'Stairway to Zoth', 'capital overlook is the last stop');
      for (let i = 0; i < 24; i++) {
        const from = i % grove.length;
        const nxt = this.nextStop(grove, from);
        assert(nxt >= 0 && nxt < grove.length && nxt !== from, 'the next stop is a different stop on the route');
      }
      const lost = { colonyKey: 'missing_colony', currentIdx: 9, targetIdx: NaN };
      const fallback = this.bindRoute(lost);
      assert(lost.colonyKey === 'colony_capital' && fallback[lost.currentIdx] && fallback[lost.targetIdx], 'an unknown colony falls back to capital stops');
      assert(this.walkHearGain(0) === 1 && this.walkHearGain(WALK_HEAR_FULL) === 1, 'voice is full beside an agent');
      assert(this.walkHearGain(WALK_HEAR_EDGE) === 0 && this.walkHearGain(20) === 0, 'voice is silent at the far edge');
      assert(this.walkHearGain(7.5) > this.walkHearGain(10), 'voice gets louder as you walk closer');
      assert(this.walkHearGain(7.5) > 0.4 && this.walkHearGain(7.5) < 0.6, 'talk range sits at mid volume');
      let prevGain = 1;
      for (let d = 0; d <= 16; d += 0.5) {
        const g = this.walkHearGain(d);
        assert(g >= 0 && g <= 1 && g <= prevGain + 1e-9, 'voice gain falls as distance grows');
        prevGain = g;
      }
      assert(this.walkVoice && this.walkVoice.cache instanceof Map && this.walkVoice.inFlight instanceof Map, 'walk voice maintains cache and in-flight maps');
      const testItem = { key: 'test_key_1', text: 'Peace on the path.', voiceId: 'af_heart' };
      const qLenBefore = this.walkVoice.queue.length;
      this.enqueueWalkLine(testItem);
      const qLenAfter = this.walkVoice.queue.length;
      this.enqueueWalkLine(testItem);
      assert(this.walkVoice.queue.length === qLenAfter, 'enqueueWalkLine deduplicates identical speech item');
      this.walkVoice.queue = this.walkVoice.queue.filter((q) => q.key !== 'test_key_1');
      const ledgerBox = document.getElementById('avatarDialogueLedger');
      assert(ledgerBox !== null, 'avatar dialogue box includes private ledger container');
      const testAgent = {
        id: 'SCORPIUS',
        name: 'Scorpius',
        pet: '🦂',
        cadre: 'Pantheon',
        speech: 'I am on the avenues.',
        ledger: {
          manner: 'slow to believe',
          tic: 'I do not trust an easy claim.',
          seen: 'The Radiant Sun of Illumination in orange',
          belief: 'Say what is true.'
        }
      };
      this.openDialogue(testAgent);
      assert(!ledgerBox.hidden, 'openDialogue reveals private ledger when agent has ledger');
      assert(ledgerBox.children.length >= 3, 'openDialogue populates ledger lines for manner, picture, belief');
      this.closeDialogue();
      assert(ledgerBox.children.length === 0 || ledgerBox.hidden, 'closeDialogue cleans up state');
      const testEncounterAgent = {
        id: 'ONYX',
        name: 'Onyx',
        pet: '💎',
        cadre: 'Security',
        speech: 'I ask what would break.',
        ledger: {
          manner: 'skeptical',
          tic: 'I ask what would break.',
          seen: 'Skeleton in Dark Armor of Essential Structure in blue-green',
          belief: 'A result moved me a little.',
          stoic: 'Do not dress harm up as cleverness.',
          craft: 'Put the effort on one offer.',
          research: 'From Seshat on 2026-10-08. Public repository nullpointexception-i/agent-sphere'
        }
      };
      this.openAgentCard(testEncounterAgent);
      const encounterChipsEl = document.getElementById('encounterChips');
      assert(encounterChipsEl !== null, 'encounter chips container exists');
      const chipTexts = Array.from(encounterChipsEl.children).map(c => c.textContent);
      assert(chipTexts.some(t => t.includes('Do not dress harm up as cleverness')), 'encounter card includes stoic chip');
      assert(chipTexts.some(t => t.includes('Put the effort on one offer')), 'encounter card includes craft chip');
      assert(chipTexts.some(t => t.includes('Seshat')), 'encounter card includes research note chip');
      this.closeEncounter();
      assert(this.datamoshSpirits.length >= 10, 'each city has ascii datamosh spirits');
      Object.keys(this.colonyGroups).forEach((key) => {
        const city = this.colonyGroups[key];
        const ground = city.userData.groundY;
        (city.userData.lifts || []).forEach((lift) => {
          const soffit = lift.bottomY - (ground - 0.06);
          assert(soffit >= 5.4, lift.name + ' stands clear of an agent');
        });
        let views = 0;
        let stairways = 0;
        city.traverse((obj) => {
          if (!obj.userData) return;
          if (obj.userData.belvedere) views += 1;
          if (obj.userData.stairwayToZoth) stairways += 1;
        });
        assert(views >= 1, key + ' has stairs up to a roofed view');
        assert(stairways === 1, key + ' has one stairway to zoth');
      });
      const round = this.vec3ToLatLon(this.latLonToVec3(34, -48, PLANET_RADIUS));
      assert(Math.abs(round.lat - 34) < 0.05 && Math.abs(round.lon + 48) < 0.05, 'lat lon round trip');
      ['colony_capital:install', 'colony_adytum_grove:install'].forEach((id) => {
        const standHall = this.civicById[id];
        assert(!!standHall, id + ' exists for a keeper');
        const stand = this.keeperStandOffset();
        const bodyR = 0.62;
        assert(Math.abs(stand.x) + bodyR < standHall.hw - 0.15, id + ' keeper clears the side wall');
        assert(Math.abs(stand.z) + bodyR < standHall.hd - 0.15, id + ' keeper clears the front and back');
        const pedDist = Math.hypot(stand.x, stand.z - standHall.pedZ);
        assert(pedDist > standHall.pedR + bodyR, id + ' keeper clears the pedestal');
        standHall.mesh.updateMatrixWorld(true);
        const world = standHall.mesh.localToWorld(stand.clone());
        const backLocal = this.hallLocal(standHall, world.clone());
        assert(Math.hypot(backLocal.x - stand.x, backLocal.z - stand.z) < 0.08, id + ' keeper stand round-trips through the hall frame');
        const ll = this.vec3ToLatLon(world);
        const radial = this.latLonToVec3(ll.lat, ll.lon, world.length());
        assert(radial.distanceTo(world) < 0.08, id + ' keeper stand round-trips through lat lon');
      });
      assert(this.civicHalls.length >= 15 && this.civicHalls.length % 3 === 0, 'each city has three halls');
      const kinds = { install: 0, forge: 0, research: 0 };
      this.civicHalls.forEach((hall) => { kinds[hall.kind] = (kinds[hall.kind] || 0) + 1; });
      assert(kinds.install >= 5 && kinds.install === kinds.forge && kinds.forge === kinds.research, 'install, forge, and research each have one hall per city');
      this.civicHalls.forEach((hall) => {
        const probe = new THREE.Vector3(0.35, 0.2, -0.7);
        const worldProbe = hall.mesh.localToWorld(probe.clone());
        const back = this.hallLocal(hall, worldProbe);
        assert(Math.hypot(back.x - 0.35, back.z + 0.7) < 0.06, hall.id + ' frame round-trips through the mesh');
        const q = new THREE.Quaternion();
        hall.mesh.getWorldQuaternion(q);
        const doorOut = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
        const origin = hall.group.localToWorld(new THREE.Vector3(0, 0, 0));
        const n = hall.anchor.clone().normalize();
        const toPlaza = origin.sub(hall.anchor);
        toPlaza.addScaledVector(n, -toPlaza.dot(n));
        if (toPlaza.lengthSq() > 1e-8) toPlaza.normalize();
        doorOut.addScaledVector(n, -doorOut.dot(n));
        if (doorOut.lengthSq() > 1e-8) doorOut.normalize();
        assert(hall.wallH >= 5.8, hall.id + ' clears a standing agent');
        let hasRoof = false;
        let hasStair = false;
        hall.mesh.traverse((obj) => {
          if (!obj.userData) return;
          if (obj.userData.civicRoof) hasRoof = true;
          if (!obj.userData.civicStair || !obj.geometry || !obj.geometry.parameters) return;
          hasStair = true;
          const halfW = (obj.geometry.parameters.width || 0) / 2;
          const halfD = (obj.geometry.parameters.depth || 0) / 2;
          assert(Math.abs(obj.position.x) + halfW <= hall.hw + 0.05, hall.id + ' stair stays inside the hall');
          assert(Math.abs(obj.position.z) + halfD <= hall.hd + 0.05, hall.id + ' stair stays inside the hall');
        });
        assert(hasRoof && hasStair, hall.id + ' has a roof and stairs');
        assert(doorOut.dot(toPlaza) > 0.9, hall.id + ' door faces the plaza');
        let sign = null;
        hall.mesh.traverse((obj) => { if (obj.userData && obj.userData.civicSign) sign = obj; });
        if (sign) {
          sign.getWorldQuaternion(q);
          const plusZ = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
          plusZ.addScaledVector(n, -plusZ.dot(n)).normalize();
          assert(plusZ.dot(toPlaza) > 0.9, hall.id + ' sign faces the plaza');
        } else {
          failures.push(hall.id + ' is missing its sign');
        }
        const doorWorld = hall.mesh.localToWorld(new THREE.Vector3(0, 0.4, -(hall.hd - 0.15)));
        const doorLocal = hall.group.worldToLocal(doorWorld.clone());
        const doorR = Math.hypot(doorLocal.x, doorLocal.z);
        assert(doorR > 2 && doorR < hall.wallR - 1.2, hall.id + ' door sits inside the walls');
        const standWorld = hall.mesh.localToWorld(new THREE.Vector3(0, 0.4, hall.pedZ - (hall.pedR + this.playerRadius + 0.35)));
        const standLocal = this.hallLocal(hall, standWorld);
        assert(Math.abs(standLocal.x) < hall.hw - 0.2 && Math.abs(standLocal.z) < hall.hd - 0.08, hall.id + ' station has room to stand');
        const own = this.surfaceColliders.filter((col) => col.civicId === hall.id);
        const boxes = own.filter((col) => col.shape === 'box');
        const solids = [];
        hall.mesh.updateMatrixWorld(true);
        hall.mesh.traverse((obj) => {
          if (!obj.userData || obj.userData.civicSolid !== 'box') return;
          const at = hall.group.worldToLocal(obj.getWorldPosition(new THREE.Vector3()));
          solids.push(at);
        });
        assert(boxes.length === solids.length && boxes.length === 5, hall.id + ' has a collider on each wall');
        solids.forEach((at) => {
          const hit = boxes.some((col) => Math.hypot(col.x - at.x, col.z - at.z) < 0.05 && Math.abs(col.rot - hall.rot) < 1e-5);
          assert(hit, hall.id + ' collider sits on its wall');
        });
        const ped = own.find((col) => col.shape === 'cyl');
        let pedMesh = null;
        hall.mesh.traverse((obj) => { if (obj.userData && obj.userData.civicSolid === 'cyl') pedMesh = obj; });
        if (ped && pedMesh) {
          const at = hall.group.worldToLocal(pedMesh.getWorldPosition(new THREE.Vector3()));
          assert(Math.hypot(ped.x - at.x, ped.z - at.z) < 0.05, hall.id + ' pedestal collider sits on the pedestal');
        } else {
          failures.push(hall.id + ' is missing its pedestal');
        }
        [doorWorld, standWorld].forEach((point) => {
          let moved = point;
          own.forEach((col) => { moved = this.pushOutOfCollider(moved, col); });
          assert(point.distanceTo(moved) < 0.02, hall.id + ' doorway and station are open');
        });
        const approach = hall.mesh.localToWorld(new THREE.Vector3(0, 0.4, -(hall.hd + 0.55)));
        const foreign = this.surfaceColliders.filter((col) => col.group === hall.group && col.civicId !== hall.id);
        [doorWorld, standWorld, approach].forEach((point) => {
          foreign.forEach((col) => {
            const sample = point.clone();
            const moved = this.pushOutOfCollider(sample, col);
            assert(moved === sample, hall.id + ' door and station are clear to walk');
          });
        });
        const cornerLocals = [
          [hall.hw - 0.05, hall.hd - 0.05],
          [-(hall.hw - 0.05), hall.hd - 0.05],
          [hall.hw - 0.05, -(hall.hd - 0.05)],
          [-(hall.hw - 0.05), -(hall.hd - 0.05)]
        ];
        cornerLocals.forEach(([lx, lz]) => {
          const at = hall.group.worldToLocal(hall.mesh.localToWorld(new THREE.Vector3(lx, 0.4, lz)));
          foreign.forEach((col) => {
            if (col.shape === 'cyl') {
              assert(Math.hypot(at.x - col.x, at.z - col.z) > col.r + 0.2, hall.id + ' corner clears a tower');
              return;
            }
            const dx = at.x - col.x;
            const dz = at.z - col.z;
            const cos = Math.cos(col.rot);
            const sin = Math.sin(col.rot);
            const boxX = dx * cos - dz * sin;
            const boxZ = dx * sin + dz * cos;
            const clear = Math.abs(boxX) > col.hx + 0.15 || Math.abs(boxZ) > col.hz + 0.15;
            assert(clear, hall.id + ' corner clears a wall');
          });
        });
      });
      const stairKeys = ['colony_capital', 'colony_nova_zoth', 'colony_sol_crypta', 'colony_adytum_grove', 'colony_hex_bastion'];
      stairKeys.forEach((key) => {
        const stair = this.stairways[key];
        assert(!!stair && stair.steps >= 24, key + ' has a long stairway to zoth');
        const route = COLONY_WAYPOINTS[key];
        assert(route.some((stop) => stop && stop.stairwayId === key && stop.name === 'Stairway to Zoth'), key + ' sends agents to the stairway');
        const low = this.pointOnStair(stair, 0);
        const high = this.pointOnStair(stair, 1);
        assert(high.altitude > low.altitude + 6, key + ' overlook stands above the city');
        const mid = this.sampleWalk(route[0], route[route.length - 1], 0.8);
        assert(mid.onStair && mid.altitude > low.altitude + 2, key + ' climb lifts an agent onto the stairway');
        const down = this.sampleWalk(route[route.length - 1], route[0], 0.1);
        assert(down.onStair && down.altitude > low.altitude, key + ' descent starts on the overlook');
      });
      let treadCount = 0;
      this.scene.traverse((obj) => {
        if (!obj.userData || !obj.userData.solid || !obj.userData.stairTread) return;
        treadCount += 1;
        const solid = obj.userData.solid;
        solid.group.updateMatrixWorld(true);
        const world = obj.getWorldPosition(new THREE.Vector3());
        const sample = obj.userData.arcSolid ? world.clone().normalize().multiplyScalar(PLANET_RADIUS) : world;
        const at = solid.group.worldToLocal(sample);
        assert(Math.hypot(at.x - solid.x, at.z - solid.z) < 0.08, 'stair collider sits on its tread');
        const geo = obj.geometry && obj.geometry.parameters;
        if (geo) {
          assert(Math.abs(geo.width / 2 - solid.hx) < 0.02, 'stair collider width matches the tread');
          assert(Math.abs(geo.depth / 2 - solid.hz) < 0.02, 'stair collider depth matches the tread');
        }
        const parentQ = solid.group.getWorldQuaternion(new THREE.Quaternion());
        const axis = new THREE.Vector3(1, 0, 0).applyQuaternion(obj.getWorldQuaternion(new THREE.Quaternion())).applyQuaternion(parentQ.invert());
        const measured = Math.atan2(-axis.z, axis.x);
        const yawGap = Math.atan2(Math.sin(measured - solid.rot), Math.cos(measured - solid.rot));
        assert(Math.abs(yawGap) < 0.08, 'stair collider yaw matches the tread');
        if (obj.userData.arcSolid) {
          const up = new THREE.Vector3(0, 1, 0).applyQuaternion(obj.getWorldQuaternion(new THREE.Quaternion()));
          assert(up.dot(world.clone().normalize()) > 0.98, 'a stairway tread stands upright');
          assert(world.length() > PLANET_RADIUS + 0.05, 'a stairway tread sits above the ground');
        }
      });
      assert(treadCount >= 80, 'stairs carry a collider on each tread');
      const capStair = this.stairways.colony_capital;
      const capDeck = [];
      capStair.group.traverse((obj) => { if (obj.userData && obj.userData.stairDeck) capDeck.push(obj); });
      assert(capDeck.length === 1, 'the capital overlook has one deck');
      if (capDeck.length === 1) {
        const deckAt = capDeck[0].getWorldPosition(new THREE.Vector3());
        const stand = this.latLonToVec3(capStair.deck.lat, capStair.deck.lon, PLANET_RADIUS + capStair.deckAltitude);
        assert(stand.distanceTo(deckAt) < 0.45, 'an agent on the overlook stands on the deck');
        const under = deckAt.clone().normalize().multiplyScalar(PLANET_RADIUS);
        let blocked = false;
        const sideClear = { blocked: false };
        this.surfaceColliders.forEach((col) => {
          if (col.stairwayId !== 'colony_capital') return;
          const next = this.pushOutOfCollider(under, col);
          if (next !== under) blocked = true;
        });
        const sideWorld = this.arcWorld(capStair.group, capStair.arc0 + capStair.flight * 0.5, capStair.width * 0.5 + 2.8, 0);
        const side = sideWorld.clone().normalize().multiplyScalar(PLANET_RADIUS);
        this.surfaceColliders.forEach((col) => {
          if (col.stairwayId !== 'colony_capital') return;
          const next = this.pushOutOfCollider(side, col);
          if (next !== side) sideClear.blocked = true;
        });
        assert(blocked, 'the stairway stops the walker');
        assert(!sideClear.blocked, 'the walker can pass beside the stairway');
      }
      const homeN = this.latLonToVec3(12, 80, 1).normalize();
      const homeEast = this.tangentBasis(homeN).east;
      const bodyA = homeN.clone().multiplyScalar(PLANET_RADIUS);
      const bodyB = homeN.clone().multiplyScalar(PLANET_RADIUS).addScaledVector(homeEast, 0.35);
      const gapNeed = this.playerRadius + 0.58;
      const separated = this.pushOutOfBody(bodyA, bodyB, gapNeed);
      assert(separated !== bodyA, 'overlapping bodies are separated');
      const sepAway = separated.clone().sub(bodyB);
      sepAway.addScaledVector(homeN, -sepAway.dot(homeN));
      assert(sepAway.length() + 0.08 >= gapNeed, 'a body keeps the combined radius');
      const clearBody = homeN.clone().multiplyScalar(PLANET_RADIUS).addScaledVector(homeEast, 5);
      assert(this.pushOutOfBody(bodyA, clearBody, gapNeed) === bodyA, 'a clear body is left in place');
      const savedColliders = this.surfaceColliders;
      const dummy = new THREE.Group();
      dummy.scale.setScalar(1.35);
      this.placeOnSphere(dummy, 12, 80, 0.06);
      this.agentEntities.__gap = dummy;
      this.surfaceColliders = [];
      try {
        const origin = this.latLonToVec3(12, 80, PLANET_RADIUS);
        const resolved = this.resolveCollisions(origin, true);
        const resolvedAway = resolved.clone().sub(dummy.position);
        const resolvedN = origin.clone().normalize();
        resolvedAway.addScaledVector(resolvedN, -resolvedAway.dot(resolvedN));
        assert(resolvedAway.length() + 0.08 >= this.playerRadius + this.bodyRadius(dummy), 'the walker cannot pass through an agent');
        const ea = new THREE.Group();
        const eb = new THREE.Group();
        ea.scale.setScalar(1);
        eb.scale.setScalar(1.35);
        ea.userData.walkState = {};
        eb.userData.walkState = {};
        this.placeOnSphere(ea, 12, 80, 0.06);
        this.placeOnSphere(eb, 12.02, 80, 0.06);
        const beforeGap = ea.position.distanceTo(eb.position);
        this.separateCrowd([
          { ent: ea, radius: this.bodyRadius(ea), onStair: false },
          { ent: eb, radius: this.bodyRadius(eb), onStair: false }
        ], []);
        const afterGap = ea.position.distanceTo(eb.position);
        assert(afterGap > beforeGap + 0.4, 'agents cannot stand inside each other');
        assert(afterGap + 0.25 >= this.bodyRadius(ea) + this.bodyRadius(eb), 'agents keep a body gap');
      } finally {
        delete this.agentEntities.__gap;
        this.surfaceColliders = savedColliders;
      }
      const probeKey = 'colony_selftest_reach';
      COLONY_WAYPOINTS[probeKey] = [{ lat: 70, lon: 150, name: 'Probe Plaza' }];
      const probeGroup = new THREE.Group();
      this.placeOnSphere(probeGroup, 70, 150, 0);
      this.scene.add(probeGroup);
      try {
        const probe = this.addStairwayToZoth(probeGroup, probeKey, { clearR: 12.2, color: 0xFBBF24 });
        assert(!!probe && probe.steps >= 24, 'a future city grows a long stairway');
        assert(COLONY_WAYPOINTS[probeKey].some((stop) => stop.stairwayId === probeKey), 'a future route includes the overlook');
        assert(this.buildOutpost.toString().indexOf('addStairwayToZoth') !== -1, 'buildOutpost builds the stairway');
      } finally {
        this.surfaceColliders = this.surfaceColliders.filter((col) => col.group !== probeGroup && col.stairwayId !== probeKey);
        delete this.stairways[probeKey];
        delete COLONY_WAYPOINTS[probeKey];
        this.scene.remove(probeGroup);
      }
      return failures;
    }

    setColliderDebug(on) {
      const previous = this.colliderDebugMeshes || [];
      previous.forEach((mesh) => {
        if (mesh.parent) mesh.parent.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
      });
      this.colliderDebugMeshes = [];
      if (!on) return;
      this.surfaceColliders.forEach((col) => {
        if (!col || !col.group) return;
        const mesh = new THREE.Mesh(
          col.shape === 'cyl' || col.shape === 'circle'
            ? new THREE.CylinderGeometry(col.r || 0.2, col.r || 0.2, 1.1, 8)
            : new THREE.BoxGeometry((col.hx || 0.2) * 2, 1.1, (col.hz || 0.2) * 2),
          new THREE.MeshBasicMaterial({
            color: col.shape === 'stair' ? 0x22d3ee : 0xf43f5e,
            wireframe: true
          })
        );
        mesh.position.set(col.x, 1.3, col.z);
        if (col.rot) mesh.rotation.y = col.rot;
        mesh.userData.noOcclude = true;
        col.group.add(mesh);
        this.colliderDebugMeshes.push(mesh);
      });
    }

    onResize() {
      this.fitRenderer();
    }

    // Main 60fps Render Loop
    animate() {
      this.animFrameId = requestAnimationFrame(this._onFrame || (() => this.animate()));
      const panel = document.getElementById('view-pixel-world');
      if (document.hidden || !panel || !panel.classList.contains('active')) {
        this.clock.getDelta();
        return;
      }
      this.animTick++;
      this._matrixStamp = this.animTick;

      const delta = Math.min(this.clock.getDelta(), 0.1);

      // 1. Spherical flight, walking, city orbit, or god's-eye controls.
      if (this.cameraTransition) {
        const tr = this.cameraTransition;
        const elapsed = performance.now() - tr.startTime;
        const progress = Math.min(1.0, elapsed / tr.duration);
        const t = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        this.camera.position.copy(this.sampleFlight(tr, t));
        const up = tr.startUp.clone().lerp(tr.endUp, t);
        this.camera.up.copy(up.lengthSq() > 1e-6 ? up.normalize() : tr.endUp);
        const look = tr.startTarget.clone().lerp(tr.endTarget, t);
        if (Math.abs(this.camera.up.dot(this.camera.position.clone().sub(look).normalize())) > 0.98) {
          this.camera.up.copy(this.tangentBasis(this.camera.up).north);
        }
        this.camera.lookAt(look);
        if (this.controls) this.controls.target.copy(look);

        if (progress >= 1.0) {
          this.camera.position.copy(this.sampleFlight(tr, 1));
          this.camera.up.copy(tr.endUp);
          this.camera.lookAt(tr.endTarget);
          this.cameraTransition = null;
          if (this.pendingLocal) {
            this.local = this.pendingLocal;
            this.pendingLocal = null;
            this.viewMode = 'local';
          } else if (this.isAvatarMode) {
            this.viewMode = 'walk';
          } else {
            this.viewMode = 'globe';
            this.local = null;
            this.camera.up.set(0, 1, 0);
            if (this.controls) {
              this.controls.target.copy(tr.endTarget);
              this.controls.enabled = true;
              this.controls.autoRotate = this.autoSpin;
              this.controls.update();
            }
          }
        }
      } else if (this.isAvatarMode && this.avatar) {
        this.updateAvatar(delta);
      } else if (this.viewMode === 'local' && this.local) {
        this.updateLocalOrbit();
      } else {
        this.viewMode = 'globe';
        if (this.camera.position.length() < 128) {
          this.camera.position.normalize().multiplyScalar(128);
        }
        if (this.controls) {
          this.controls.enabled = true;
          this.controls.update();
          if (this.controls.target.length() > 26) {
            this.controls.target.multiplyScalar(26 / this.controls.target.length());
          }
        }
      }
      if (this.boundaryNoteUntil && performance.now() > this.boundaryNoteUntil) {
        const toast = document.getElementById('boundaryToast');
        if (toast) toast.hidden = true;
        this.boundaryNoteUntil = 0;
      }
      if (this.civicGems) {
        for (let gi = 0; gi < this.civicGems.length; gi++) this.civicGems[gi].rotation.y += delta * 0.8;
      }
      if (this.datamoshSpirits && this.datamoshSpirits.length && this.viewDetailClose !== false) {
        const spirits = this.datamoshSpirits;
        for (let si = 0; si < spirits.length; si++) {
          const spirit = spirits[si];
          spirit.group.position.y = spirit.baseY + Math.sin(this.animTick * 0.045 + spirit.phase) * 0.28;
          if (spirit.core) spirit.core.rotation.y += delta * 0.7;
        }
        if (this.animTick % 2 === 0) {
          const spirit = spirits[this.animTick % spirits.length];
          spirit.tick += 1;
          this.paintDatamosh(spirit);
        }
      }
      this.updateAltitudeHUD();

      // 4.1 Animate Grounded Agents & Realistic Waypoint Walking
      const allEntities = [...Object.values(this.agentEntities), ...Object.values(this.subagentEntities)];
      for (let i = 0; i < allEntities.length; i++) {
        const ent = allEntities[i];
        if (!ent || !ent.userData) continue;

        if (ent.userData.bodyMesh && ent.userData.billboard) {
          this._v1.copy(this.camera.position);
          ent.worldToLocal(this._v1);
          ent.userData.bodyMesh.rotation.y = Math.atan2(this._v1.x, this._v1.z);
        }
        if (ent.userData.selectRing) {
          const selected = ent === this.selectedEntity;
          ent.userData.selectRing.visible = selected;
          if (selected) ent.userData.selectRing.rotation.z += delta * 1.2;
        }

        const rig = ent.userData.rig;

        if (ent.userData.agent && ent.userData.agent.post === 'station') {
          this.pinStationKeeper(ent);
          if (rig) {
            const idlePhase = this.animTick * 0.04 + (rig.phaseOffset || 0);
            rig.leftLeg.rotation.x = 0;
            rig.rightLeg.rotation.x = 0;
            rig.leftArm.rotation.x = Math.sin(idlePhase) * 0.06;
            rig.rightArm.rotation.x = -Math.sin(idlePhase) * 0.06;
            rig.head.rotation.y = Math.sin(idlePhase * 0.65) * 0.16;
            rig.cape.rotation.x = 0.08 + Math.abs(Math.sin(idlePhase)) * 0.04;
          }
          continue;
        }

        // Realistic Waypoint Navigation along town paths, Adytum Pilgrimages & Sacred Meditation
        const ws = ent.userData.walkState;
        if (ws) {
          const agState = ent.userData.agent ? ent.userData.agent.state : null;
          const isPilgrim = agState === 'WALKING_TO_ADYTUM' || ws.isPilgrimage;
          const isMeditating = agState === 'MEDITATING_ADYTUM' || agState === 'CONTEMPLATING_ADYTUM' || ws.isMeditating;

          // Sacred Aura Ring Animation
          if (ent.userData.auraRing) {
            if (isMeditating) {
              ent.userData.auraRing.visible = true;
              ent.userData.auraRing.rotation.z += delta * 2.2;
              const scale = 1.0 + Math.sin(this.animTick * 0.08) * 0.22;
              ent.userData.auraRing.scale.set(scale, scale, 1);
              ent.userData.auraRing.material.opacity = 0.92;
            } else if (isPilgrim) {
              ent.userData.auraRing.visible = true;
              ent.userData.auraRing.rotation.z += delta * 1.4;
              ent.userData.auraRing.scale.set(0.9, 0.9, 1);
              ent.userData.auraRing.material.opacity = 0.55 + Math.sin(this.animTick * 0.1) * 0.25;
            } else {
              ent.userData.auraRing.visible = false;
            }
          }

          if (isMeditating) {
            ws.onStair = false;
            ws.stairwayId = null;
            // Sacred Levitation inside Amethyst Sanctum at colony_adytum_grove
            const adytumPos = COLONY_WAYPOINTS.colony_adytum_grove[0] || { lat: 34.0, lon: 48.0 };
            this.seatEntity(ent, adytumPos.lat, adytumPos.lon);
            const medPhase = this.animTick * 0.06 + (rig ? rig.phaseOffset : 0);
            const levitation = 1.8 + Math.sin(medPhase) * 0.45;
            if (ent.userData.bodyMesh) ent.userData.bodyMesh.position.y = levitation;
            if (ent.userData.shadowMesh) ent.userData.shadowMesh.scale.set(1.5, 1.5, 1);
            if (rig) {
              rig.leftLeg.rotation.x = -0.55;
              rig.rightLeg.rotation.x = -0.55;
              rig.leftArm.rotation.x = -0.48 + Math.sin(medPhase) * 0.08;
              rig.rightArm.rotation.x = -0.48 - Math.sin(medPhase) * 0.08;
              rig.cape.rotation.x = 0.22 + Math.sin(medPhase * 1.3) * 0.10;
              rig.head.rotation.y = Math.sin(medPhase * 0.5) * 0.12;
            }
          } else if (isPilgrim) {
            ws.onStair = false;
            ws.stairwayId = null;
            // Actively walking to Adytum Hermetica across the sphere!
            const adytumCoord = COLONY_COORDS.colony_adytum_grove;
            ws.pilgrimProgress = (ws.pilgrimProgress || 0) + (ws.speed * 0.95 * delta);
            const startLat = ws.pilgrimStartLat !== undefined ? ws.pilgrimStartLat : (COLONY_COORDS[ws.colonyKey] || COLONY_COORDS.colony_capital).lat;
            const startLon = ws.pilgrimStartLon !== undefined ? ws.pilgrimStartLon : (COLONY_COORDS[ws.colonyKey] || COLONY_COORDS.colony_capital).lon;

            const t = Math.min(1.0, ws.pilgrimProgress);
            const smoothT = t * t * (3 - 2 * t);
            const curLat = startLat + (adytumCoord.lat - startLat) * smoothT;
            const curLon = startLon + (adytumCoord.lon - startLon) * smoothT;
            ws.curLat = curLat;
            ws.curLon = curLon;

            this.seatEntity(ent, curLat, curLon);

            // Footstep bobbing and articulated limb stride while walking to temple
            ws.bobTick += delta * 11.0;
            const bob = Math.abs(Math.sin(ws.bobTick)) * 0.24;
            if (ent.userData.bodyMesh) ent.userData.bodyMesh.position.y = bob;
            if (ent.userData.shadowMesh) ent.userData.shadowMesh.scale.set(1.0 - bob * 0.2, 1.0 - bob * 0.2, 1);
            if (rig) {
              const swing = Math.sin(ws.bobTick) * 0.54;
              rig.leftLeg.rotation.x = swing;
              rig.rightLeg.rotation.x = -swing;
              rig.leftArm.rotation.x = -swing * 0.78;
              rig.rightArm.rotation.x = swing * 0.78;
              rig.cape.rotation.x = 0.24 + Math.abs(Math.cos(ws.bobTick)) * 0.12;
              rig.head.rotation.y = Math.sin(ws.bobTick * 0.5) * 0.06;
            }

            if (t >= 1.0) {
              // Arrived at Adytum Grove!
              ws.isPilgrimage = false;
              ws.colonyKey = 'colony_adytum_grove';
              ws.currentIdx = 0;
              ws.targetIdx = 1;
              ws.progress = 0;
              this.bindRoute(ws);
            }
          } else {
            const waypoints = this.bindRoute(ws);
            if (ws.isIdle) {
              const held = waypoints[ws.targetIdx];
              const onOverlook = held && held.stairwayId && this.stairways[held.stairwayId];
              ws.onStair = !!onOverlook;
              ws.stairwayId = onOverlook ? held.stairwayId : null;
              ws.idleTimer -= delta;
              if (ent.userData.bodyMesh) ent.userData.bodyMesh.position.y = 0;
              if (ent.userData.shadowMesh) ent.userData.shadowMesh.scale.set(1, 1, 1);
              if (rig) {
                const idlePhase = this.animTick * 0.045 + (rig.phaseOffset || 0);
                rig.leftLeg.rotation.x *= 0.82;
                rig.rightLeg.rotation.x *= 0.82;
                rig.leftArm.rotation.x = Math.sin(idlePhase) * 0.05;
                rig.rightArm.rotation.x = -Math.sin(idlePhase) * 0.05;
                rig.cape.rotation.x = 0.08 + Math.abs(Math.sin(idlePhase)) * 0.04;
                rig.head.rotation.y = Math.sin(idlePhase * 0.7) * 0.18;
              }
              if (ws.idleTimer <= 0) {
                ws.isIdle = false;
                ws.currentIdx = ws.targetIdx;
                ws.targetIdx = this.nextStop(waypoints, ws.currentIdx);
                ws.progress = 0;
              }
            } else {
              ws.progress += ws.speed * delta;
              if (ws.progress >= 1.0) {
                ws.progress = 1.0;
                ws.isIdle = true;
                ws.idleTimer = 1.8 + Math.random() * 3.2; // pause to observe landmark
              }

              const p1 = waypoints[ws.currentIdx];
              const p2 = waypoints[ws.targetIdx];
              if (!p1 || !p2) continue;
              const t = ws.progress;
              const smoothT = t * t * (3 - 2 * t);
              const pose = this.sampleWalk(p1, p2, smoothT);
              ws.onStair = pose.onStair;
              ws.stairwayId = pose.stairwayId;
              this.seatEntity(ent, pose.lat, pose.lon, pose.altitude);

              // Footstep bobbing, shadow scaling, and articulated bipedal limb stride
              ws.bobTick += delta * (pose.onStair ? 8 : 11);
              const bob = Math.abs(Math.sin(ws.bobTick)) * (pose.onStair ? 0.08 : 0.22);
              if (ent.userData.bodyMesh) ent.userData.bodyMesh.position.y = bob;
              if (ent.userData.shadowMesh) ent.userData.shadowMesh.scale.set(1.0 - bob * 0.2, 1.0 - bob * 0.2, 1);
              if (rig) {
                const strideAmp = pose.onStair ? 0.62 : 0.48;
                const swing = Math.sin(ws.bobTick) * strideAmp;
                rig.leftLeg.rotation.x = swing;
                rig.rightLeg.rotation.x = -swing;
                rig.leftArm.rotation.x = -swing * 0.75;
                rig.rightArm.rotation.x = swing * 0.75;
                rig.cape.rotation.x = 0.18 + Math.abs(Math.cos(ws.bobTick)) * 0.10;
                rig.head.rotation.y = Math.sin(ws.bobTick * 0.5) * 0.05;
              }
            }
          }
        }
      }
      this.separateBodies();
      this.holdWalkerClear();

      // 4. Animate City Features
      if (this.colonyGroups.colony_capital?.userData.animArmillary) {
        const [a1, a2, a3] = this.colonyGroups.colony_capital.userData.animArmillary;
        if (a1) a1.rotation.x += 0.012;
        if (a2) a2.rotation.y += 0.018;
        if (a3) a3.rotation.z += 0.024;
      }
      if (this.colonyGroups.colony_nova_zoth?.userData.animCore) {
        this.colonyGroups.colony_nova_zoth.userData.animCore.rotation.y += 0.02;
        this.colonyGroups.colony_nova_zoth.userData.animCore.rotation.x += 0.01;
      }
      if (this.colonyGroups.colony_nova_zoth?.userData.animDataRings) {
        const [r1, r2] = this.colonyGroups.colony_nova_zoth.userData.animDataRings;
        if (r1) r1.rotation.z += 0.025;
        if (r2) { r2.rotation.y += 0.03; r2.rotation.x += 0.015; }
      }
      if (this.colonyGroups.colony_sol_crypta?.userData.animCoin) {
        this.colonyGroups.colony_sol_crypta.userData.animCoin.rotation.z += 0.03;
      }
      if (this.colonyGroups.colony_sol_crypta?.userData.animGear) {
        this.colonyGroups.colony_sol_crypta.userData.animGear.rotation.y += 0.012;
      }
      if (this.colonyGroups.colony_adytum_grove?.userData.animCrystal) {
        const crystal = this.colonyGroups.colony_adytum_grove.userData.animCrystal;
        crystal.rotation.y += 0.015;
        const hoverBase = crystal.userData.hoverBase != null ? crystal.userData.hoverBase : crystal.position.y;
        crystal.position.y = hoverBase + Math.sin(this.animTick * 0.05) * 0.5;
      }
      if (this.colonyGroups.colony_adytum_grove?.userData.animOrbiters) {
        const shards = this.colonyGroups.colony_adytum_grove.userData.animOrbiters;
        for (let si = 0; si < shards.length; si++) {
          const s = shards[si];
          const ang = this.animTick * 0.025 * s.speed + s.phase;
          s.mesh.position.set(Math.cos(ang) * s.radius, s.baseY + Math.sin(ang * 2) * 0.45, Math.sin(ang) * s.radius);
          s.mesh.rotation.y += 0.03;
          s.mesh.rotation.x += 0.02;
        }
      }
      if (this.colonyGroups.colony_hex_bastion?.userData.animRadar) {
        this.colonyGroups.colony_hex_bastion.userData.animRadar.rotation.y += 0.04;
      }
      if (this.colonyGroups.colony_hex_bastion?.userData.animShield) {
        this.colonyGroups.colony_hex_bastion.userData.animShield.rotation.y -= 0.008;
        this.colonyGroups.colony_hex_bastion.userData.animShield.material.opacity = 0.22 + Math.sin(this.animTick * 0.06) * 0.08;
      }
      if (this.colonyGroups.colony_hex_bastion?.userData.animHud) {
        this.colonyGroups.colony_hex_bastion.userData.animHud.rotation.z += 0.02;
      }

      // 4.2 Animate Colony Holographic Beacons
      Object.values(this.beaconSprites).forEach(b => {
        b.sprite.position.y = b.baseY + Math.sin(this.animTick * 0.04) * 0.6;
      });

      // 4.3 Animate Atmospheric Clouds & Continuous Dynamic Blanket
      if (this.cloudLayer) {
        this.cloudLayer.rotation.y += 0.0005;
        this.cloudLayer.rotation.x += 0.0001;
      }
      if (this.cloudMesh) {
        this.cloudMesh.rotation.y += 0.00028;
        this.cloudMesh.rotation.x += 0.00007;
      }

      // 4.3b Animate Volumetric 3D Sun Photosphere & Coronal Streamers
      if (this.sunCoreMesh) {
        this.sunCoreMesh.rotation.y += delta * 0.035;
        if (this.sunCoreMesh.material && this.sunCoreMesh.material.uniforms && this.sunCoreMesh.material.uniforms.time) {
          this.sunCoreMesh.material.uniforms.time.value += delta;
        }
      }
      if (this.sunSprite) {
        const pulse = 1.0 + Math.sin(this.animTick * 0.032) * 0.045;
        this.sunSprite.scale.set(175 * pulse, 175 * pulse, 1);
        if (this.sunSprite.material) this.sunSprite.material.rotation += delta * 0.022;
      }
      if (this.sunOuterCorona) {
        const outerPulse = 1.0 + Math.cos(this.animTick * 0.024) * 0.06;
        this.sunOuterCorona.scale.set(270 * outerPulse, 270 * outerPulse, 1);
        if (this.sunOuterCorona.material) this.sunOuterCorona.material.rotation -= delta * 0.015;
      }

      // 4.3c Animate Grand Hermetic Elemental Monoliths
      if (this.elementalMonoliths && this.elementalMonoliths.length) {
        for (let mi = 0; mi < this.elementalMonoliths.length; mi++) {
          const em = this.elementalMonoliths[mi];
          if (em.ring) em.ring.rotation.z += 0.02;
          if (em.core) em.core.position.y = 4.8 + Math.sin(this.animTick * 0.05 + mi) * 0.18;
        }
      }

      // 4.4 Animate Polar Auroras
      if (this.northAurora) {
        this.northAurora.rotation.z += 0.008;
        const scaleN = 1 + Math.sin(this.animTick * 0.035) * 0.07;
        this.northAurora.scale.set(scaleN, scaleN, scaleN);
      }
      if (this.southAurora) {
        this.southAurora.rotation.z -= 0.006;
        const scaleS = 1 + Math.cos(this.animTick * 0.03) * 0.06;
        this.southAurora.scale.set(scaleS, scaleS, scaleS);
      }

      // 4.5 Animate Ambient Surface Weather & Prana Motes with Atmospheric Drift
      if (this.ambientMotes) {
        const pos = this.ambientMotes.geometry.attributes.position.array;
        const time = this.animTick * 0.015;
        for (let i = 0; i < 160; i++) {
          const idx = i * 3;
          const x = pos[idx];
          const z = pos[idx + 2];
          const ang = 0.0008 + (i % 5) * 0.0003;
          pos[idx] = x * Math.cos(ang) - z * Math.sin(ang);
          pos[idx + 2] = x * Math.sin(ang) + z * Math.cos(ang);
          pos[idx + 1] += Math.sin(time + i * 0.35) * 0.02;
        }
        this.ambientMotes.geometry.attributes.position.needsUpdate = true;
      }

      // 4.6 Animate Surface Footstep Particles
      if (this.footstepPool && this.footstepPool.length) {
        for (let fi = 0; fi < this.footstepPool.length; fi++) {
          const fp = this.footstepPool[fi];
          if (fp.life > 0) {
            fp.life -= delta;
            if (fp.life <= 0) {
              fp.life = 0;
              fp.mesh.visible = false;
            } else {
              const progress = 1.0 - (fp.life / fp.maxLife);
              const currentScale = fp.scale * (1.0 + progress * 0.85);
              fp.mesh.scale.set(currentScale, currentScale, currentScale);
              fp.mat.opacity = (1.0 - progress) * 0.75;
            }
          }
        }
      }

      // 4.7 Animate & Fade Speech Bubbles
      const now = performance.now();
      this.speechBubbles = this.speechBubbles.filter(b => {
        const elapsed = now - b.spawnTime;
        if (elapsed > b.duration) {
          this.scene.remove(b.sprite);
          if (b.sprite.material.map) b.sprite.material.map.dispose();
          b.sprite.material.dispose();
          return false;
        }

        // Float slightly upwards along sphere surface normal
        const floatDist = (elapsed / b.duration) * 1.5;
        b.sprite.position.copy(b.basePos).add(b.normal.clone().multiplyScalar(floatDist));

        // Fade in last 1.2 seconds
        if (elapsed > b.duration - 1200) {
          const fadeProgress = (b.duration - elapsed) / 1200;
          b.sprite.material.opacity = Math.max(0, fadeProgress * 0.96);
        }
        return true;
      });

      // The shadow map is a second draw of the city. Refresh it a few times a second.
      if (this.dayNightSun && this.sunLight) {
        if (this.animTick % 20 === 0) {
          const sunAngle = this.animTick * 0.0003;
          const sunDist = 260;
          this.sunLight.position.set(
            Math.cos(sunAngle) * sunDist,
            130 + Math.sin(sunAngle * 0.5) * 40,
            Math.sin(sunAngle) * sunDist
          );
          if (this.sunLight.shadow) this.sunLight.shadow.needsUpdate = true;
          if (this.sunGroup) {
            this.sunGroup.position.copy(this.sunLight.position).normalize().multiplyScalar(620);
          }
          if (this.atmosphereMesh && this.atmosphereMesh.material && this.atmosphereMesh.material.uniforms && this.atmosphereMesh.material.uniforms.sunDirection) {
            this.atmosphereMesh.material.uniforms.sunDirection.value.copy(this.sunLight.position).normalize();
          }
        }
      }
      if (this.sunLight && this.sunLight.castShadow && this.sunLight.shadow) {
        const stride = this.isAvatarMode ? 4 : 10;
        if (this.animTick % stride === 0) this.sunLight.shadow.needsUpdate = true;
      }
      this.syncViewDetail();

      // 5. Animate Trade Highway Energy Couriers
      this.courierParticles.forEach(c => {
        c.progress = (c.progress + c.speed * delta) % 1.0;
        const pt = c.curve.getPoint(c.progress);
        c.mesh.position.copy(pt);
      });

      // 6. Orbital Moon, Nebulae & Ring Rotations
      if (this.orbitalMoon) {
        const moonAng = 3.55 + this.animTick * 0.0006;
        const moonRad = 215;
        this.orbitalMoon.position.set(
          Math.cos(moonAng) * moonRad,
          22 + Math.sin(moonAng * 0.7) * 24,
          Math.sin(moonAng) * moonRad
        );
        this.orbitalMoon.rotation.y += 0.005;
        if (this.moonRing) this.moonRing.rotation.z += delta * 0.35;
        if (this.moonInnerRing) this.moonInnerRing.rotation.z -= delta * 0.48;
      }
      if (this.nebulaSystem) {
        this.nebulaSystem.rotation.y += delta * 0.002;
      }
      if (this.orbitalRing) {
        this.orbitalRing.rotation.z += 0.0008;
      }
      if (this.starField) this.starField.rotation.y += delta * 0.003;
      if (this.brightStarField) this.brightStarField.rotation.y += delta * 0.003;

      // 7. Render Scene
      this.renderer.render(this.scene, this.camera);
    }

    dispose() {
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      window.removeEventListener('resize', this.onResize);
      if (this.renderer && this.renderer.domElement) {
        this.container.removeChild(this.renderer.domElement);
        this.renderer.dispose();
      }
    }
  }

  return SphereWorld;
});
