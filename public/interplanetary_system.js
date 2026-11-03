/**
 * 🌌 HELIOS-ZOTH INTERPLANETARY STAR SYSTEM ENGINE (6 WORLDS)
 * =====================================================================
 * Expands Zoth Civilization into a full 6-world 3D Interplanetary Sector:
 * 1. zoth_prime      — Zoth Prime (Imperial Sovereign Capital & Terraform Nexus, #D4AF37 / #38bdf8)
 * 2. aethelgard      — Aethelgard (Cryo-Crystalline Quantum Compute Vault, #22d3ee / #38bdf8)
 * 3. pyros_foundry   — Pyros Foundry (Tectonic Magma Forge & Heavy Silicon Smelter, #f97316 / #ef4444)
 * 4. vaelor_oceanus  — Vaelor Oceanus (Bioluminescent Pelagic Synapse World, #10b981 / #34d399)
 * 5. chronos_citadel — Chronos Citadel (Ringed Jovian Gas Giant & Dyson Shipyard, #a855f7 / #e879f9)
 * 6. nebula_sanctum  — Nebula Sanctum (Hermetic Aether Monolith & Outer Rim Observatory, #f43f5e / #fb7185)
 *
 * Features:
 * - Hooks seamlessly into `window.sphereWorld` (`SphereWorld` instance from `sphere_world.js`)
 * - Loads `/assets/planets/star_system_manifest.json` + live ComfyUI 4K equirectangular textures
 * - Built-in 2048x1024 high-res biome procedural texture generators as instant fallbacks
 * - 3D Deep-Space Multi-Planet Orbital System (`interplanetaryGroup`) with orbital rings, moons, Dyson relays, and 3D sprite labels
 * - 3D Interplanetary Warp Highways with glowing curved trajectories and animated starship/probe particles
 * - Interactive 3D Planet Switching (`warpToPlanet(planetId)`) via HUD Sector Bar or 3D raycast click
 * - Solar Sector Overview Camera Mode (`toggleSectorOverview()`)
 * - Sleek Non-Overlapping Bottom-Center HUD Bar (`#zothStarSystemBar`) + Planetary Dossier / 3D GLB / LTX Flyby Modal
 *
 * Engineered by 1nc0gn30 (@1nc0gn30) • NullAI Platform
 */

(function () {
  'use strict';

  const COLONY_SLOT_KEYS = [
    'colony_capital',
    'colony_nova_zoth',
    'colony_sol_crypta',
    'colony_adytum_grove',
    'colony_hex_bastion'
  ];

  // Built-in 6-Planet Metadata Roster (merged with /assets/planets/star_system_manifest.json)
  const BUILTIN_PLANETS = [
    {
      id: 'zoth_prime',
      name: 'Zoth Prime',
      shortName: 'Zoth Prime',
      icon: '🪐',
      subtitle: 'Imperial Sovereign Capital & Terraform Nexus',
      biome: 'Golden-Emerald Continental Core',
      orbit_distance: 340,
      orbit_angle: 0.2,
      orbit_speed: 0.045,
      orbit_y: 0,
      sphere_radius: 26,
      atmo_color: '#38bdf8',
      accent_color: '#D4AF37',
      emissive_hex: 0xd4af37,
      emissive_intensity: 0.76,
      bump_scale: 1.65,
      ring_type: 'kepler_station',
      moons: 1,
      population: '142 Autonomous Citizens',
      specialization: 'Sovereign Governance, Neural Council & Prime Shipyard',
      label_tag: 'ZOTH PRIME • IMPERIAL CAPITAL',
      texture_url: '/assets/planets/zoth_prime_texture.jpg',
      glb_url: '/assets/planets/zoth_prime.glb',
      flyby_webp_url: '/assets/planets/zoth_prime_flyby.webp',
      colonies: [
        { slot: 'colony_capital', id: 'colony_capital', name: 'Capital Citadel', role: 'SEAT OF GOVERNANCE • MONAD', icon: '🏛️', lat: 0, lon: 0, color: '#F59E0B' },
        { slot: 'colony_nova_zoth', id: 'colony_nova_zoth', name: 'Nova Zoth', role: 'QUANTUM AI R&D • SERVERS', icon: '🌊', lat: 34, lon: -48, color: '#06B6D4' },
        { slot: 'colony_sol_crypta', id: 'colony_sol_crypta', name: 'Sol Crypta', role: 'WEB3 FORGE • SOLANA & SOLANA_TIP', icon: '⚡', lat: -32, lon: 48, color: '#14F195' },
        { slot: 'colony_adytum_grove', id: 'colony_adytum_grove', name: 'Adytum Hermetica', role: '22 TAROT ARCANA • SANCTUM', icon: '🔮', lat: 34, lon: 48, color: '#C084FC' },
        { slot: 'colony_hex_bastion', id: 'colony_hex_bastion', name: 'HexForge Bastion', role: 'DEFENSE BASTION • SECURITY', icon: '🛡️', lat: -32, lon: -48, color: '#EF4444' }
      ]
    },
    {
      id: 'aethelgard',
      name: 'Aethelgard',
      shortName: 'Aethelgard',
      icon: '❄️',
      subtitle: 'Cryo-Crystalline Quantum Compute Vault',
      biome: 'Sub-Zero Nitrogen Glaciers & Cyan Cryo-Arrays',
      orbit_distance: 360,
      orbit_angle: 0.85,
      orbit_speed: 0.038,
      orbit_y: 28,
      sphere_radius: 20,
      atmo_color: '#22d3ee',
      accent_color: '#38bdf8',
      emissive_hex: 0x0891b2,
      emissive_intensity: 0.62,
      bump_scale: 1.85,
      ring_type: 'cryo_hex_ring',
      moons: 2,
      population: '64 Quantum Architect Agents',
      specialization: 'Zero-Kelvin LLM Weights Storage, ZK-STARK Proving & Cryo-Inference',
      label_tag: 'AETHELGARD • CRYO VAULT',
      texture_url: '/assets/planets/aethelgard_texture.jpg',
      glb_url: '/assets/planets/aethelgard.glb',
      flyby_webp_url: '/assets/planets/aethelgard_flyby.webp',
      colonies: [
        { slot: 'colony_capital', id: 'colony_frost_spire', name: 'Frost Spire Zero', role: 'ZERO-KELVIN TENSOR CORE', icon: '❄️', lat: 28.0, lon: 15.0, color: '#22d3ee' },
        { slot: 'colony_nova_zoth', id: 'colony_cryo_vault', name: 'Kelvin Tensor Vault', role: 'CRYO-MEMORY ENGRAM ARCHIVE', icon: '🧊', lat: -22.0, lon: 95.0, color: '#38bdf8' },
        { slot: 'colony_sol_crypta', id: 'colony_borealis_gate', name: 'Borealis Relay', role: 'ZK-STARK PROVING CITADEL', icon: '💠', lat: 52.0, lon: -80.0, color: '#818cf8' },
        { slot: 'colony_adytum_grove', id: 'colony_glacier_synapse', name: 'Glacier Synapse', role: 'SUB-ZERO QUANTUM INFERENCE', icon: '🔷', lat: -40.0, lon: -140.0, color: '#67e8f9' },
        { slot: 'colony_hex_bastion', id: 'colony_cryo_bastion', name: 'Permafrost Ward', role: 'CRYO-SHIELDED COLD STORAGE', icon: '🛡️', lat: 12.0, lon: -38.0, color: '#06b6d4' }
      ]
    },
    {
      id: 'pyros_foundry',
      name: 'Pyros Foundry',
      shortName: 'Pyros',
      icon: '🌋',
      subtitle: 'Tectonic Magma Forge & Heavy Silicon Smelter',
      biome: 'Obsidian Basalt Crust & Molten Caldera Rivers',
      orbit_distance: 440,
      orbit_angle: 2.1,
      orbit_speed: 0.031,
      orbit_y: -34,
      sphere_radius: 22,
      atmo_color: '#f97316',
      accent_color: '#ef4444',
      emissive_hex: 0xea580c,
      emissive_intensity: 0.92,
      bump_scale: 2.25,
      ring_type: 'solar_smelter_belt',
      moons: 1,
      population: '88 Foundry & Hardware Agents',
      specialization: 'Autonomous Wafer Lithography, Geothermal Dyson Collectors & Mecha Chassis Forging',
      label_tag: 'PYROS FOUNDRY • MAGMA FORGE',
      texture_url: '/assets/planets/pyros_foundry_texture.jpg',
      glb_url: '/assets/planets/pyros_foundry.glb',
      flyby_webp_url: '/assets/planets/pyros_foundry_flyby.webp',
      colonies: [
        { slot: 'colony_capital', id: 'colony_vulcan_core', name: 'Vulcan Litho Core', role: '2NM SILICON WAFER FOUNDRY', icon: '🌋', lat: 12.0, lon: -30.0, color: '#f97316' },
        { slot: 'colony_nova_zoth', id: 'colony_magma_anvil', name: 'Magma Anvil', role: 'HEAVY MECHA CHASSIS FORGE', icon: '🔥', lat: -28.0, lon: 60.0, color: '#ef4444' },
        { slot: 'colony_sol_crypta', id: 'colony_obsidian_citadel', name: 'Obsidian Bastion', role: 'TECTONIC SLAG REFINERY', icon: '⚒️', lat: 42.0, lon: 110.0, color: '#fbbf24' },
        { slot: 'colony_adytum_grove', id: 'colony_helios_kiln', name: 'Helios Kiln', role: 'SOLAR SMELTER ARRAY', icon: '☀️', lat: -15.0, lon: -125.0, color: '#fb923c' },
        { slot: 'colony_hex_bastion', id: 'colony_caldera_gate', name: 'Caldera Crucible', role: 'GEOTHERMAL TURBINE NEXUS', icon: '⚡', lat: -36.0, lon: -42.0, color: '#dc2626' }
      ]
    },
    {
      id: 'vaelor_oceanus',
      name: 'Vaelor Oceanus',
      shortName: 'Vaelor',
      icon: '🌊',
      subtitle: 'Bioluminescent Pelagic Synapse & Bio-Compute World',
      biome: 'Abyssal Bioluminescent Archipelagos & Hydro-Domes',
      orbit_distance: 520,
      orbit_angle: 3.35,
      orbit_speed: 0.025,
      orbit_y: 22,
      sphere_radius: 25,
      atmo_color: '#10b981',
      accent_color: '#34d399',
      emissive_hex: 0x059669,
      emissive_intensity: 0.68,
      bump_scale: 1.15,
      ring_type: 'orbital_hydro_halo',
      moons: 3,
      population: '96 Bio-Synthetic & Neuro Agents',
      specialization: 'Wetware STDP Memory Engrams, Oceanic Wave-Compute & Synthetic Ecology',
      label_tag: 'VAELOR OCEANUS • PELAGIC SYNAPSE',
      texture_url: '/assets/planets/vaelor_oceanus_texture.jpg',
      glb_url: '/assets/planets/vaelor_oceanus.glb',
      flyby_webp_url: '/assets/planets/vaelor_oceanus_flyby.webp',
      colonies: [
        { slot: 'colony_capital', id: 'colony_pelagic_nexus', name: 'Pelagic Nexus', role: 'HYDRO-DOME WETWARE CAPITAL', icon: '🌊', lat: 8.0, lon: 45.0, color: '#10b981' },
        { slot: 'colony_nova_zoth', id: 'colony_coral_synapse', name: 'Coral Synapse Reef', role: 'BIOLUMINESCENT STDP MESH', icon: '🪸', lat: -24.0, lon: -70.0, color: '#2dd4bf' },
        { slot: 'colony_sol_crypta', id: 'colony_abyssal_dome', name: 'Abyssal Trench Dome', role: 'DEEP PRESSURE BIO-REACTOR', icon: '🐚', lat: 36.0, lon: 140.0, color: '#34d399' },
        { slot: 'colony_adytum_grove', id: 'colony_nautilus_port', name: 'Nautilus Starport', role: 'ORBITAL TIDAL ELEVATOR', icon: '🔱', lat: -45.0, lon: 20.0, color: '#06b6d4' },
        { slot: 'colony_hex_bastion', id: 'colony_leviathan_atoll', name: 'Leviathan Atoll', role: 'SONAR ACOUSTIC ARRAY', icon: '🐬', lat: 18.0, lon: -115.0, color: '#059669' }
      ]
    },
    {
      id: 'chronos_citadel',
      name: 'Chronos Citadel',
      shortName: 'Chronos',
      icon: '🪐',
      subtitle: 'Ringed Jovian Gas Giant & Orbital Dyson Shipyard',
      biome: 'Metallic Hydrogen Storm Bands & Golden Planetary Rings',
      orbit_distance: 600,
      orbit_angle: 4.55,
      orbit_speed: 0.019,
      orbit_y: -18,
      sphere_radius: 32,
      atmo_color: '#a855f7',
      accent_color: '#e879f9',
      emissive_hex: 0x9333ea,
      emissive_intensity: 0.72,
      bump_scale: 0.85,
      ring_type: 'jovian_grand_rings',
      moons: 4,
      population: '118 Fleet & Time-Series Agents',
      specialization: 'He-3 Fusion Extraction, Interplanetary Warp Gate Calibration & Deep-Space Fleet Yard',
      label_tag: 'CHRONOS CITADEL • DYSON SHIPYARD',
      texture_url: '/assets/planets/chronos_citadel_texture.jpg',
      glb_url: '/assets/planets/chronos_citadel.glb',
      flyby_webp_url: '/assets/planets/chronos_citadel_flyby.webp',
      colonies: [
        { slot: 'colony_capital', id: 'colony_chronos_ring', name: 'Chronos Ring Dock', role: 'DYSON FLEET COMMAND YARD', icon: '🪐', lat: 0.0, lon: 0.0, color: '#e879f9' },
        { slot: 'colony_nova_zoth', id: 'colony_jovian_eye', name: 'Aeon Vortex Station', role: 'ANTICYCLONIC STORM HARVESTER', icon: '🌀', lat: -18.0, lon: 88.0, color: '#a855f7' },
        { slot: 'colony_sol_crypta', id: 'colony_titan_yard', name: 'Titan Orbital Yard', role: 'STARSHIP HULL ASSEMBLY', icon: '🚀', lat: 30.0, lon: -105.0, color: '#c084fc' },
        { slot: 'colony_adytum_grove', id: 'colony_he3_harvester', name: 'Helium-3 Cloud Spire', role: 'ATMO FUSION FUEL REFINERY', icon: '⚛️', lat: 15.0, lon: 170.0, color: '#f0abfc' },
        { slot: 'colony_hex_bastion', id: 'colony_cassini_relay', name: 'Cassini Gap Bastion', role: 'TEMPORAL TELEMETRY LOCK', icon: '⏳', lat: -32.0, lon: -48.0, color: '#d946ef' }
      ]
    },
    {
      id: 'nebula_sanctum',
      name: 'Nebula Sanctum',
      shortName: 'Sanctum',
      icon: '🔮',
      subtitle: 'Hermetic Aether Monolith & Outer Rim Observatory',
      biome: 'Iridescent Crystalline Crust & Zero-Point Aether Fissures',
      orbit_distance: 680,
      orbit_angle: 5.5,
      orbit_speed: 0.014,
      orbit_y: 42,
      sphere_radius: 19,
      atmo_color: '#f43f5e',
      accent_color: '#fb7185',
      emissive_hex: 0xe11d48,
      emissive_intensity: 0.84,
      bump_scale: 1.95,
      ring_type: 'monolith_relay_array',
      moons: 2,
      population: '76 Hermetic Research & Red-Team Agents',
      specialization: 'Adversarial Security Sandbox, Deep-Space Signal Telemetry & Autonomous Self-Evolution',
      label_tag: 'NEBULA SANCTUM • AETHER MONOLITH',
      texture_url: '/assets/planets/nebula_sanctum_texture.jpg',
      glb_url: '/assets/planets/nebula_sanctum.glb',
      flyby_webp_url: '/assets/planets/nebula_sanctum_flyby.webp',
      colonies: [
        { slot: 'colony_capital', id: 'colony_hermes_monolith', name: 'Hermes Prime Monolith', role: 'HERMETIC ZERO-POINT NEXUS', icon: '🔮', lat: 22.0, lon: -15.0, color: '#f43f5e' },
        { slot: 'colony_nova_zoth', id: 'colony_aether_observatory', name: 'Outer Rim Array', role: 'DEEP-SPACE SIGNAL TELESCOPE', icon: '📡', lat: -35.0, lon: 110.0, color: '#fb7185' },
        { slot: 'colony_sol_crypta', id: 'colony_null_sanctum', name: 'NullAI Citadel', role: 'RED-TEAM SECURITY SANCTUM', icon: '🛡️', lat: 48.0, lon: 65.0, color: '#fda4af' },
        { slot: 'colony_adytum_grove', id: 'colony_void_gate', name: 'Interstellar Warp Gate', role: 'LONG-RANGE SECTOR PORTAL', icon: '🌌', lat: -10.0, lon: -150.0, color: '#e11d48' },
        { slot: 'colony_hex_bastion', id: 'colony_bismuth_spire', name: 'Bismuth Vault', role: 'CRYSTALLINE CIPHER ARCHIVE', icon: '💎', lat: -28.0, lon: -42.0, color: '#f43f5e' }
      ]
    }
  ];

  class InterplanetarySystemArchitect {
    constructor(sphereWorld) {
      this.sw = sphereWorld;
      this.THREE = window.THREE;
      this.planets = BUILTIN_PLANETS.map(p => Object.assign({}, p));
      this.planetMap = {};
      this.planets.forEach(p => { this.planetMap[p.id] = p; });

      this.activePlanetId = 'zoth_prime';
      this.isSectorOverview = false;
      this.interplanetaryGroup = null;
      this.distantPlanetNodes = {}; // id -> { group, mesh, atmo, ring, moons, label, orbitLine, orbitAngle }
      this.warpHighwaysGroup = null;
      this.warpParticles = [];
      this.textureCache = {}; // id -> THREE.Texture
      this.loadedRealTexture = {}; // id -> boolean
      this.manifestData = null;

      this.init();
    }

    init() {
      if (!this.sw || !this.sw.scene || !this.THREE) return;

      // Save original Zoth Prime procedural texture as immediate fallback
      if (this.sw.planetMesh && this.sw.planetMesh.material && this.sw.planetMesh.material.map) {
        this.textureCache['zoth_prime_procedural'] = this.sw.planetMesh.material.map;
      }

      this.injectStyles();
      this.buildHudBar();
      this.buildDossierModal();
      this.buildWarpTransitionOverlay();

      this.buildInterplanetary3DSystem();
      this.hookAnimationAndRaycast();

      // Load manifest + probe ComfyUI 4K textures immediately & periodically (in case background foundry finishes new planets)
      this.syncManifestAndTextures();
      this.pollTimer = setInterval(() => this.syncManifestAndTextures(), 12000);
    }

    // =========================================================================
    // PROCEDURAL 2048x1024 BIOME TEXTURE FALLBACK GENERATORS
    // =========================================================================
    getOrCreateProceduralBiomeTexture(planetId) {
      const cacheKey = `${planetId}_procedural`;
      if (this.textureCache[cacheKey]) return this.textureCache[cacheKey];

      const THREE = this.THREE;
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      if (planetId === 'aethelgard') {
        // Cryo-Crystalline Quantum Compute Vault: Sub-zero cobalt ice & glowing cyan #22d3ee trenches
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#ecfeff');
        grad.addColorStop(0.18, '#083344');
        grad.addColorStop(0.5, '#041e2b');
        grad.addColorStop(0.82, '#083344');
        grad.addColorStop(1, '#ecfeff');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Glacial tectonic plates
        for (let i = 0; i < 28; i++) {
          const cx = ((i * 197) % w);
          const cy = 120 + ((i * 131) % (h - 240));
          const rx = 90 + (i % 5) * 45;
          const ry = 55 + (i % 4) * 30;
          const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, rx);
          g.addColorStop(0, 'rgba(165, 243, 252, 0.42)');
          g.addColorStop(0.6, 'rgba(34, 211, 238, 0.18)');
          g.addColorStop(1, 'rgba(8, 51, 68, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, (i % 6) * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Glowing cyan quantum circuit trenches & hexagonal nodes
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 36; i++) {
          const x1 = (i * 113) % w;
          const y1 = 100 + ((i * 79) % (h - 200));
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x1 + Math.cos(i) * 180, y1 + Math.sin(i) * 95);
          ctx.stroke();
        }
      } else if (planetId === 'pyros_foundry') {
        // Tectonic Magma Forge: Carbon-obsidian plates + molten lava rivers
        ctx.fillStyle = '#0c0a09';
        ctx.fillRect(0, 0, w, h);

        // Basalt crust continents
        for (let i = 0; i < 32; i++) {
          const cx = (i * 163) % w;
          const cy = 80 + ((i * 97) % (h - 160));
          const rx = 100 + (i % 5) * 40;
          const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, rx);
          g.addColorStop(0, '#292524');
          g.addColorStop(0.7, '#1c1917');
          g.addColorStop(1, 'rgba(12, 10, 9, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, rx, 0, Math.PI * 2);
          ctx.fill();
        }

        // Molten magma rivers & caldera rings
        for (let i = 0; i < 45; i++) {
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(249, 115, 22, 0.92)' : 'rgba(251, 191, 36, 0.85)';
          ctx.lineWidth = 2.5 + (i % 3) * 1.5;
          ctx.beginPath();
          let px = (i * 89) % w;
          let py = 90 + ((i * 67) % (h - 180));
          ctx.moveTo(px, py);
          for (let s = 0; s < 8; s++) {
            px += 45 + Math.cos(i + s) * 35;
            py += Math.sin(i * 1.7 + s) * 28;
            ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      } else if (planetId === 'vaelor_oceanus') {
        // Bioluminescent Pelagic Synapse World
        const ocean = ctx.createLinearGradient(0, 0, 0, h);
        ocean.addColorStop(0, '#022c22');
        ocean.addColorStop(0.3, '#064e3b');
        ocean.addColorStop(0.5, '#042f2e');
        ocean.addColorStop(0.7, '#064e3b');
        ocean.addColorStop(1, '#022c22');
        ctx.fillStyle = ocean;
        ctx.fillRect(0, 0, w, h);

        // Bioluminescent spiral coral atolls & golden hydro-domes
        for (let i = 0; i < 34; i++) {
          const cx = (i * 149 + 80) % w;
          const cy = 110 + ((i * 83) % (h - 220));
          const r = 45 + (i % 5) * 22;
          const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, r * 1.6);
          g.addColorStop(0, 'rgba(52, 211, 153, 0.88)');
          g.addColorStop(0.45, 'rgba(16, 185, 129, 0.38)');
          g.addColorStop(1, 'rgba(4, 47, 46, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(253, 230, 138, 0.78)';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (planetId === 'chronos_citadel') {
        // Ringed Jovian Gas Giant: Swirling bands of royal indigo, violet, obsidian, and liquid gold
        const bands = [
          '#1e1b4b', '#3b0764', '#4c1d95', '#701a75', '#2e1065',
          '#ca8a04', '#581c87', '#311042', '#86198f', '#4c1d95', '#1e1b4b'
        ];
        const bandH = h / bands.length;
        for (let b = 0; b < bands.length; b++) {
          ctx.fillStyle = bands[b];
          ctx.fillRect(0, b * bandH, w, bandH + 4);
        }
        // Turbulent atmospheric jetstreams
        for (let y = 20; y < h - 20; y += 14) {
          ctx.strokeStyle = y % 28 === 0 ? 'rgba(232, 121, 249, 0.42)' : 'rgba(253, 224, 71, 0.28)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 32) {
            const wy = y + Math.sin(x * 0.012 + y * 0.05) * 10 + Math.cos(x * 0.025) * 5;
            if (x === 0) ctx.moveTo(x, wy);
            else ctx.lineTo(x, wy);
          }
          ctx.stroke();
        }
        // Great Aeon Vortex Storm
        const vx = w * 0.62, vy = h * 0.58;
        const vg = ctx.createRadialGradient(vx, vy, 8, vx, vy, 120);
        vg.addColorStop(0, '#fde047');
        vg.addColorStop(0.4, '#e879f9');
        vg.addColorStop(0.8, '#6b21a8');
        vg.addColorStop(1, 'rgba(59, 7, 100, 0)');
        ctx.fillStyle = vg;
        ctx.beginPath();
        ctx.ellipse(vx, vy, 120, 68, 0.15, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Nebula Sanctum: Iridescent bismuth crust & crimson-gold sacred geometry ley-lines
        ctx.fillStyle = '#0f0714';
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 36; i++) {
          const cx = (i * 173) % w;
          const cy = 90 + ((i * 107) % (h - 180));
          const r = 50 + (i % 4) * 28;
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(244, 63, 94, 0.78)' : 'rgba(251, 191, 36, 0.65)';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(cx - r, cy - r * 0.6, r * 2, r * 1.2);
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
      this.textureCache[cacheKey] = tex;
      return tex;
    }

    // =========================================================================
    // LOAD MANIFEST & COMFYUI 4K EQUIRECTANGULAR TEXTURES
    // =========================================================================
    async syncManifestAndTextures() {
      try {
        const res = await fetch('/assets/planets/star_system_manifest.json?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          this.manifestData = data;
          if (Array.isArray(data.planets)) {
            data.planets.forEach(mp => {
              const target = this.planetMap[mp.id];
              if (target) {
                if (mp.texture_url) target.texture_url = mp.texture_url;
                if (mp.glb_url) target.glb_url = mp.glb_url;
                if (mp.flyby_webp_url) target.flyby_webp_url = mp.flyby_webp_url;
                if (mp.flyby_mp4_url) target.flyby_mp4_url = mp.flyby_mp4_url;
                if (mp.population) target.population = mp.population;
                if (mp.specialization) target.specialization = mp.specialization;
              }
            });
          }
        }
      } catch (_) {}

      // Attempt to load each planet's ComfyUI texture via THREE.TextureLoader
      const loader = new this.THREE.TextureLoader();
      this.planets.forEach(planet => {
        if (this.loadedRealTexture[planet.id]) return;
        const url = planet.texture_url || `/assets/planets/${planet.id}_texture.jpg`;
        loader.load(
          url,
          (tex) => {
            const THREE = this.THREE;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
            if (this.sw.renderer && this.sw.renderer.capabilities) {
              tex.anisotropy = Math.min(8, this.sw.renderer.capabilities.getMaxAnisotropy());
            }
            this.textureCache[planet.id] = tex;
            this.loadedRealTexture[planet.id] = true;

            // Update distant 3D orbital sphere if built
            const node = this.distantPlanetNodes[planet.id];
            if (node && node.mesh && node.mesh.material) {
              node.mesh.material.map = tex;
              node.mesh.material.needsUpdate = true;
            }

            // If this is the currently active central planet, apply the real ComfyUI 4K texture onto planetMesh!
            if (this.activePlanetId === planet.id && this.sw.planetMesh && this.sw.planetMesh.material) {
              this.sw.planetMesh.material.map = tex;
              this.sw.planetMesh.material.needsUpdate = true;
            }
          },
          undefined,
          () => {
            // File still being synthesized by ComfyUI; procedural fallback stays active cleanly
          }
        );
      });
    }

    getTextureForPlanet(planetId) {
      if (this.textureCache[planetId]) return this.textureCache[planetId];
      return this.getOrCreateProceduralBiomeTexture(planetId);
    }

    // =========================================================================
    // 3D DEEP-SPACE MULTI-PLANET ORBITAL SYSTEM (`interplanetaryGroup`)
    // =========================================================================
    buildInterplanetary3DSystem() {
      const THREE = this.THREE;
      this.interplanetaryGroup = new THREE.Group();
      this.interplanetaryGroup.name = 'HeliosZothInterplanetaryGroup';
      this.sw.scene.add(this.interplanetaryGroup);

      this.warpHighwaysGroup = new THREE.Group();
      this.interplanetaryGroup.add(this.warpHighwaysGroup);

      this.planets.forEach((planet, idx) => {
        const nodeGroup = new THREE.Group();
        nodeGroup.userData = {
          interplanetaryPlanetId: planet.id,
          planetName: planet.name,
          keepMesh: true
        };

        // 1. Orbit Track Ring in Deep Space
        const orbitGeo = new THREE.RingGeometry(planet.orbit_distance - 0.6, planet.orbit_distance + 0.6, 128);
        const orbitMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(planet.accent_color),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.16,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
        orbitRing.rotation.x = Math.PI / 2;
        orbitRing.position.y = planet.orbit_y * 0.25;
        this.interplanetaryGroup.add(orbitRing);

        // 2. 3D Planet Sphere (radius 18 to 32)
        const r = planet.sphere_radius || 22;
        const sphereGeo = new THREE.SphereGeometry(r, 48, 36);
        const tex = this.getTextureForPlanet(planet.id);
        const sphereMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.62,
          metalness: 0.22,
          emissive: new THREE.Color(planet.atmo_color),
          emissiveIntensity: 0.28
        });
        const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
        sphereMesh.userData = {
          interplanetaryPlanetId: planet.id,
          planetName: planet.name,
          keepMesh: true
        };
        nodeGroup.add(sphereMesh);
        this.sw.interactiveObjects.push(sphereMesh);

        // 3. Atmospheric Glow Shell
        const atmoGeo = new THREE.SphereGeometry(r * 1.09, 36, 28);
        const atmoMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(planet.atmo_color),
          transparent: true,
          opacity: 0.22,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
        nodeGroup.add(atmoMesh);

        // 4. Custom Planetary Rings / Dyson Node Relays
        const ringInner = r * 1.38;
        const ringOuter = planet.id === 'chronos_citadel' ? r * 2.25 : r * 1.78;
        const ringGeo = new THREE.RingGeometry(ringInner, ringOuter, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(planet.accent_color),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: planet.id === 'chronos_citadel' ? 0.65 : 0.42,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.25;
        ringMesh.rotation.y = (idx * 0.35);
        nodeGroup.add(ringMesh);

        // 5. Orbiting Moons / Dyson Relay Satellites
        const moons = [];
        const moonCount = Math.min(4, planet.moons || 1);
        for (let m = 0; m < moonCount; m++) {
          const mGeo = new THREE.OctahedronGeometry(1.6 + (m % 2) * 0.7, 1);
          const mMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(planet.accent_color),
            emissive: new THREE.Color(planet.atmo_color),
            emissiveIntensity: 0.6,
            roughness: 0.3,
            metalness: 0.8
          });
          const mMesh = new THREE.Mesh(mGeo, mMat);
          nodeGroup.add(mMesh);
          moons.push({
            mesh: mMesh,
            dist: ringOuter + 5 + m * 5.5,
            speed: 0.6 + m * 0.25,
            phase: (m / moonCount) * Math.PI * 2
          });
        }

        // 6. Floating 3D Sprite Label (`AETHELGARD • CRYO VAULT`, etc.)
        const labelSprite = this.createPlanetLabelSprite(planet);
        labelSprite.position.set(0, r + 14, 0);
        labelSprite.userData = {
          interplanetaryPlanetId: planet.id,
          planetName: planet.name
        };
        nodeGroup.add(labelSprite);
        this.sw.interactiveObjects.push(labelSprite);

        this.interplanetaryGroup.add(nodeGroup);

        this.distantPlanetNodes[planet.id] = {
          planet,
          group: nodeGroup,
          mesh: sphereMesh,
          atmo: atmoMesh,
          ring: ringMesh,
          moons,
          label: labelSprite,
          orbitRing,
          orbitAngle: planet.orbit_angle
        };
      });

      this.updateDistantPlanetPositions(0);
      this.rebuildWarpHighways();
    }

    createPlanetLabelSprite(planet) {
      const THREE = this.THREE;
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 112;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = 'rgba(7, 10, 20, 0.90)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(8, 8, 496, 96, 18);
      else ctx.rect(8, 8, 496, 96);
      ctx.fill();

      ctx.lineWidth = 3.5;
      ctx.strokeStyle = planet.accent_color;
      ctx.stroke();

      ctx.font = '800 26px "JetBrains Mono", monospace';
      ctx.fillStyle = planet.accent_color;
      ctx.textAlign = 'center';
      ctx.fillText(`${planet.icon} ${planet.label_tag}`, 256, 48);

      ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Click to Warp • ${planet.population}`, 256, 80);

      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        opacity: 0.95
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(44, 9.6, 1);
      return sprite;
    }

    // =========================================================================
    // 3D INTERPLANETARY WARP HIGHWAYS & STARSHIP PARTICLES
    // =========================================================================
    rebuildWarpHighways() {
      if (!this.warpHighwaysGroup) return;
      const THREE = this.THREE;

      while (this.warpHighwaysGroup.children.length > 0) {
        const child = this.warpHighwaysGroup.children[0];
        this.warpHighwaysGroup.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      }
      this.warpParticles = [];

      const centerOrigin = new THREE.Vector3(0, 0, 0);

      this.planets.forEach((planet, idx) => {
        if (planet.id === this.activePlanetId) return;
        const node = this.distantPlanetNodes[planet.id];
        if (!node || !node.group.visible) return;

        const targetPos = node.group.position.clone();
        const mid = centerOrigin.clone().lerp(targetPos, 0.5);
        mid.y += 45 + (idx % 3) * 18;

        const curve = new THREE.QuadraticBezierCurve3(centerOrigin, mid, targetPos);
        const points = curve.getPoints(48);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineDashedMaterial({
          color: new THREE.Color(planet.accent_color),
          dashSize: 10,
          gapSize: 6,
          transparent: true,
          opacity: 0.48,
          blending: THREE.AdditiveBlending
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        this.warpHighwaysGroup.add(line);

        // 2 Starship/Probe Courier Particles per Interplanetary Highway
        for (let p = 0; p < 2; p++) {
          const probeGeo = new THREE.SphereGeometry(2.2, 10, 10);
          const probeMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(planet.atmo_color),
            transparent: true,
            opacity: 0.95
          });
          const probeMesh = new THREE.Mesh(probeGeo, probeMat);
          this.warpHighwaysGroup.add(probeMesh);
          this.warpParticles.push({
            mesh: probeMesh,
            curve,
            progress: (p * 0.5 + idx * 0.13) % 1.0,
            speed: 0.08 + (idx % 3) * 0.025
          });
        }
      });
    }

    updateDistantPlanetPositions(delta) {
      this.planets.forEach(planet => {
        const node = this.distantPlanetNodes[planet.id];
        if (!node) return;

        // Hide the planet in the distant orbital ring if it is currently the central active planet
        const isCurrent = (planet.id === this.activePlanetId);
        node.group.visible = !isCurrent;
        node.orbitRing.visible = !isCurrent;
        if (isCurrent) return;

        node.orbitAngle += delta * planet.orbit_speed * 0.35;
        const x = Math.cos(node.orbitAngle) * planet.orbit_distance;
        const z = Math.sin(node.orbitAngle) * planet.orbit_distance;
        const y = planet.orbit_y + Math.sin(node.orbitAngle * 2.0) * 12;

        node.group.position.set(x, y, z);
        node.mesh.rotation.y += delta * 0.28;
        node.ring.rotation.z -= delta * 0.15;

        node.moons.forEach(m => {
          m.phase += delta * m.speed;
          m.mesh.position.set(
            Math.cos(m.phase) * m.dist,
            Math.sin(m.phase * 1.5) * 3.5,
            Math.sin(m.phase) * m.dist
          );
        });
      });
    }

    // =========================================================================
    // INTERACTIVE 3D PLANET SWITCHING (`warpToPlanet(planetId)`)
    // =========================================================================
    warpToPlanet(planetId) {
      const planet = this.planetMap[planetId];
      if (!planet) return;

      const THREE = this.THREE;
      this.activePlanetId = planetId;

      // 1. Trigger 800ms Hyperspace Warp Banner + Audio Chime
      this.triggerWarpBanner(planet);
      if (typeof window.HermeticAudio !== 'undefined' && window.HermeticAudio.playColonyWarp) {
        window.HermeticAudio.playColonyWarp(520);
      }

      // 2. Exit walk mode if active so the user sees the planetary globe arrival
      if (this.sw.isAvatarMode && typeof this.sw.leaveWalk === 'function') {
        this.sw.leaveWalk();
      }
      this.isSectorOverview = false;
      this.syncSectorMapButton();

      // 3. Camera Warp Impulse to Central Globe
      if (this.sw.controls) {
        this.sw.controls.maxDistance = 1200;
      }
      if (typeof this.sw.flyTo === 'function') {
        this.sw.flyTo(new THREE.Vector3(0, 75, 238), 245, 800, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
      }

      // 4. Swap Central Globe (`window.sphereWorld.planetMesh`) Texture & PBR Material Properties
      const tex = this.getTextureForPlanet(planet.id);
      if (this.sw.planetMesh && this.sw.planetMesh.material) {
        const mat = this.sw.planetMesh.material;
        mat.map = tex;
        mat.bumpScale = planet.bump_scale || 1.65;
        mat.emissive = new THREE.Color(planet.emissive_hex || 0xffffff);
        mat.emissiveIntensity = planet.emissive_intensity || 0.72;
        mat.needsUpdate = true;
      }

      // 5. Update Rayleigh Atmosphere Shader (`atmoMat.uniforms.glowColor.value` and `sunGlow.value`)
      if (this.sw.atmosphereMesh && this.sw.atmosphereMesh.material && this.sw.atmosphereMesh.material.uniforms) {
        const u = this.sw.atmosphereMesh.material.uniforms;
        if (u.glowColor && u.glowColor.value) u.glowColor.value.set(planet.atmo_color);
        if (u.sunGlow && u.sunGlow.value) u.sunGlow.value.set(planet.accent_color);
      }

      // 6. Update Central Orbital Ring Color
      if (this.sw.orbitalRing && this.sw.orbitalRing.material) {
        this.sw.orbitalRing.material.color = new THREE.Color(planet.accent_color);
        this.sw.orbitalRing.material.needsUpdate = true;
      }

      // 7. Update 3D Colony Banners, DOM Colony Sights & Header Census
      this.updatePlanetColoniesAndDOM(planet);

      // 8. Refresh Distant Planets & Warp Highways
      this.updateDistantPlanetPositions(0.016);
      this.rebuildWarpHighways();
      this.syncHudActivePill();
    }

    updatePlanetColoniesAndDOM(planet) {
      const THREE = this.THREE;

      // Update Top Header Brand Census & Compass Readout
      const brandCensus = document.getElementById('brandCensus');
      if (brandCensus) {
        brandCensus.textContent = `${planet.population} · sphere of ${planet.name}`;
      }
      const compassReadout = document.getElementById('compassReadout');
      if (compassReadout) {
        compassReadout.textContent = planet.name;
      }

      // Update DOM Colony Sights Toolbar Buttons
      planet.colonies.forEach((col, i) => {
        const slotKey = col.slot || COLONY_SLOT_KEYS[i];
        const btn = document.querySelector(`.btn-colony-cam[data-colony="${slotKey}"]`);
        if (btn) {
          btn.innerHTML = `<span>${col.icon || '🏛️'}</span> ${col.name}`;
          btn.title = `Focus ${col.name} (${col.role})`;
        }

        // Update 3D Colony Group userData & Holographic Beacon Sprite on the sphere
        const group = this.sw.colonyGroups && this.sw.colonyGroups[slotKey];
        if (group && group.userData) {
          group.userData.name = col.name;
          group.userData.role = `${col.role} • ${planet.name}`;
        }

        const beacon = this.sw.beaconSprites && this.sw.beaconSprites[slotKey];
        if (beacon && beacon.sprite && beacon.sprite.material) {
          if (beacon.beamMesh && beacon.beamMesh.material) {
            beacon.beamMesh.material.color = new THREE.Color(col.color);
          }
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 128;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = 'rgba(10, 14, 24, 0.90)';
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(10, 10, 492, 108, 16);
          else ctx.rect(10, 10, 492, 108);
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = col.color;
          ctx.stroke();

          ctx.font = 'bold 31px "JetBrains Mono", monospace';
          ctx.fillStyle = col.color;
          ctx.fillText(`${col.icon || '🏛️'} ${col.name.toUpperCase()}`, 24, 54);

          ctx.font = '600 18px "JetBrains Mono", monospace';
          ctx.fillStyle = '#94A3B8';
          ctx.fillText(`${col.role} • ${planet.shortName.toUpperCase()}`, 26, 92);

          const newTex = new THREE.CanvasTexture(canvas);
          newTex.minFilter = THREE.LinearFilter;
          if (beacon.sprite.material.map) beacon.sprite.material.map.dispose();
          beacon.sprite.material.map = newTex;
          beacon.sprite.material.needsUpdate = true;
        }
      });
    }

    // =========================================================================
    // SOLAR SECTOR OVERVIEW CAMERA MODE (`toggleSectorOverview()`)
    // =========================================================================
    toggleSectorOverview(forceState) {
      const THREE = this.THREE;
      this.isSectorOverview = typeof forceState === 'boolean' ? forceState : !this.isSectorOverview;

      if (this.sw.isAvatarMode && typeof this.sw.leaveWalk === 'function') {
        this.sw.leaveWalk();
      }

      if (this.sw.controls) {
        this.sw.controls.maxDistance = 1200;
      }

      if (this.isSectorOverview) {
        // Pull camera back to (0, 360, 780) to show all 6 worlds, orbits, and warp highways
        const overviewPos = new THREE.Vector3(0, 360, 780);
        if (typeof this.sw.flyTo === 'function') {
          this.sw.flyTo(overviewPos, overviewPos.length(), 1100, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
        }
        const hud = document.getElementById('altitudeTelemetry');
        if (hud) hud.textContent = 'SECTOR MAP · 6 WORLDS';
      } else {
        // Zoom right back in to the active planet at (0, 65, 235)
        const planetPos = new THREE.Vector3(0, 65, 235);
        if (typeof this.sw.flyTo === 'function') {
          this.sw.flyTo(planetPos, planetPos.length(), 950, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
        }
      }

      this.syncSectorMapButton();
      return this.isSectorOverview;
    }

    // =========================================================================
    // ANIMATION LOOP & 3D RAYCAST HOOKS
    // =========================================================================
    hookAnimationAndRaycast() {
      const self = this;

      // 1. Hook into SphereWorld.animate()
      const origAnimate = this.sw.animate.bind(this.sw);
      this.sw.animate = function () {
        origAnimate();
        self.updateFrame(0.016);
      };

      // 2. Hook into SphereWorld.selectFromRay() so clicking a 3D distant planet warps to it
      const origSelectFromRay = this.sw.selectFromRay.bind(this.sw);
      this.sw.selectFromRay = function () {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hits = this.raycaster.intersectObjects(this.interactiveObjects, true);
        if (hits.length > 0) {
          let obj = hits[0].object;
          while (obj && !obj.userData?.interplanetaryPlanetId && obj !== this.scene) {
            obj = obj.parent;
          }
          if (obj && obj.userData && obj.userData.interplanetaryPlanetId) {
            self.warpToPlanet(obj.userData.interplanetaryPlanetId);
            return;
          }
        }
        origSelectFromRay();
      };
    }

    updateFrame(dt) {
      this.updateDistantPlanetPositions(dt);

      // Update starship/probe particles along curved 3D warp highways
      for (let i = 0; i < this.warpParticles.length; i++) {
        const wp = this.warpParticles[i];
        wp.progress = (wp.progress + wp.speed * dt) % 1.0;
        const pt = wp.curve.getPoint(wp.progress);
        wp.mesh.position.copy(pt);
      }

      // Periodically keep highway endpoints locked to moving planets
      if (this.sw.animTick % 30 === 0) {
        this.rebuildWarpHighways();
      }
    }

    // =========================================================================
    // SLEEK NON-OVERLAPPING HUD BAR (`#zothStarSystemBar`) & DOSSIER MODAL
    // =========================================================================
    injectStyles() {
      if (document.getElementById('zothInterplanetaryStyles')) return;
      const style = document.createElement('style');
      style.id = 'zothInterplanetaryStyles';
      style.textContent = `
        #zothStarSystemBar {
          position: fixed;
          bottom: 84px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 900;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 9999px;
          background: rgba(8, 10, 20, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(212, 175, 55, 0.42);
          box-shadow: 0 10px 36px rgba(0, 0, 0, 0.78), 0 0 24px rgba(212, 175, 55, 0.12);
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          max-width: min(96vw, 1120px);
          overflow-x: auto;
          scrollbar-width: none;
          pointer-events: auto;
          user-select: none;
          transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        #zothStarSystemBar::-webkit-scrollbar { display: none; }
        #zothStarSystemBar.is-collapsed .zss-collapsible {
          display: none !important;
        }
        .zss-brand-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 9999px;
          background: rgba(212, 175, 55, 0.14);
          border: 1px solid rgba(212, 175, 55, 0.38);
          color: #FDE68A;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          white-space: nowrap;
          cursor: pointer;
        }
        .zss-planet-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 11px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: #CBD5E1;
          font-size: 11.5px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .zss-planet-pill:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #FFFFFF;
          transform: translateY(-1px);
        }
        .zss-planet-pill.is-active {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.28), rgba(56, 189, 248, 0.22));
          border-color: #FDE68A;
          color: #FFFFFF;
          box-shadow: 0 0 14px rgba(212, 175, 55, 0.35);
        }
        .zss-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 11px;
          border-radius: 9999px;
          border: 1px solid rgba(56, 189, 248, 0.45);
          background: rgba(56, 189, 248, 0.14);
          color: #7DD3FC;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .zss-action-btn:hover, .zss-action-btn.is-active {
          background: rgba(56, 189, 248, 0.28);
          border-color: #38BDF8;
          color: #FFFFFF;
          box-shadow: 0 0 14px rgba(56, 189, 248, 0.35);
        }
        .zss-action-btn.zss-dossier-btn {
          border-color: rgba(168, 85, 247, 0.5);
          background: rgba(168, 85, 247, 0.16);
          color: #E9D5FF;
        }
        .zss-action-btn.zss-dossier-btn:hover {
          background: rgba(168, 85, 247, 0.3);
          border-color: #C084FC;
          color: #FFFFFF;
        }
        /* Move quickPovContainer slightly above #zothStarSystemBar so they never overlap */
        #quickPovContainer {
          bottom: 64px !important;
        }
        /* Hyperspace Warp Banner */
        #zothWarpBanner {
          position: absolute;
          top: 92px;
          left: 50%;
          transform: translateX(-50%) scale(0.94);
          z-index: 80;
          padding: 10px 24px;
          border-radius: 9999px;
          background: rgba(6, 9, 20, 0.92);
          border: 1px solid #FDE68A;
          box-shadow: 0 0 40px rgba(56, 189, 248, 0.45);
          color: #F8FAFC;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          pointer-events: none;
          opacity: 0;
          transition: all 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        #zothWarpBanner.is-warping {
          opacity: 1;
          transform: translateX(-50%) scale(1);
        }
        /* Planetary Dossier Modal */
        #zothPlanetDossierModal {
          position: fixed;
          inset: 0;
          z-index: 9500;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(4, 6, 14, 0.82);
          backdrop-filter: blur(12px);
        }
        #zothPlanetDossierModal.is-open {
          display: flex;
        }
        .zpd-card {
          width: min(760px, 95vw);
          max-height: 88vh;
          overflow-y: auto;
          border-radius: 18px;
          background: linear-gradient(145deg, rgba(12, 15, 28, 0.97), rgba(6, 8, 18, 0.99));
          border: 1px solid rgba(212, 175, 55, 0.45);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.9);
          padding: 22px 24px;
          color: #F8FAFC;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        @media (max-width: 768px) {
          #zothStarSystemBar {
            bottom: 8px;
            padding: 5px 8px;
            gap: 4px;
          }
          .zss-brand-tag span.zss-title-text {
            display: none;
          }
          .zss-planet-pill {
            padding: 4px 8px;
            font-size: 10.5px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    buildHudBar() {
      const container = document.querySelector('#view-pixel-world .pixel-world-container') || document.body;
      let bar = document.getElementById('zothStarSystemBar');
      if (bar) bar.remove();

      bar = document.createElement('nav');
      bar.id = 'zothStarSystemBar';
      bar.setAttribute('aria-label', 'Helios-Zoth 6-World Interplanetary Star System');

      // Collapsible Brand Pill
      const brandBtn = document.createElement('button');
      brandBtn.type = 'button';
      brandBtn.className = 'zss-brand-tag';
      brandBtn.title = 'Collapse / Expand Helios-Zoth Star System Bar';
      brandBtn.innerHTML = `<span>🌌</span> <span class="zss-title-text">HELIOS-ZOTH (6 WORLDS)</span>`;
      brandBtn.addEventListener('click', () => {
        bar.classList.toggle('is-collapsed');
      });
      bar.appendChild(brandBtn);

      // 6 Planet Pill Buttons
      const pillLabels = [
        { id: 'zoth_prime', text: '🪐 Zoth Prime' },
        { id: 'aethelgard', text: '❄️ Aethelgard' },
        { id: 'pyros_foundry', text: '🌋 Pyros' },
        { id: 'vaelor_oceanus', text: '🌊 Vaelor' },
        { id: 'chronos_citadel', text: '🪐 Chronos' },
        { id: 'nebula_sanctum', text: '🔮 Sanctum' }
      ];

      pillLabels.forEach(item => {
        const p = this.planetMap[item.id];
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'zss-planet-pill zss-collapsible' + (item.id === this.activePlanetId ? ' is-active' : '');
        btn.dataset.planetId = item.id;
        btn.title = `${p.name} — ${p.subtitle}`;
        btn.textContent = item.text;
        btn.addEventListener('click', () => this.warpToPlanet(item.id));
        bar.appendChild(btn);
      });

      // Sector Map Zoom Button
      const mapBtn = document.createElement('button');
      mapBtn.type = 'button';
      mapBtn.id = 'btnZothSectorMap';
      mapBtn.className = 'zss-action-btn zss-collapsible';
      mapBtn.title = 'Toggle 3D Solar Sector Overview Camera (See all 6 Worlds & Warp Highways)';
      mapBtn.innerHTML = '<span>🌌</span> Sector Map';
      mapBtn.addEventListener('click', () => this.toggleSectorOverview());
      bar.appendChild(mapBtn);

      // 3D GLB / LTX Flyby Dossier Button
      const dossierBtn = document.createElement('button');
      dossierBtn.type = 'button';
      dossierBtn.id = 'btnZothPlanetDossier';
      dossierBtn.className = 'zss-action-btn zss-dossier-btn zss-collapsible';
      dossierBtn.title = 'Open Planetary Dossier, Blender 3D .GLB Asset & ComfyUI LTX-Video 2B Orbital Flyby';
      dossierBtn.innerHTML = '<span>📦</span> 3D GLB / LTX Flyby';
      dossierBtn.addEventListener('click', () => this.openDossierModal(this.activePlanetId));
      bar.appendChild(dossierBtn);

      container.appendChild(bar);
    }

    syncHudActivePill() {
      const pills = document.querySelectorAll('#zothStarSystemBar .zss-planet-pill');
      pills.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.planetId === this.activePlanetId);
      });
    }

    syncSectorMapButton() {
      const btn = document.getElementById('btnZothSectorMap');
      if (!btn) return;
      btn.classList.toggle('is-active', this.isSectorOverview);
      btn.innerHTML = this.isSectorOverview
        ? '<span>🪐</span> Planet Orbit'
        : '<span>🌌</span> Sector Map';
    }

    buildWarpTransitionOverlay() {
      const container = document.querySelector('#view-pixel-world .pixel-world-container') || document.body;
      let banner = document.getElementById('zothWarpBanner');
      if (banner) banner.remove();
      banner = document.createElement('div');
      banner.id = 'zothWarpBanner';
      banner.setAttribute('role', 'status');
      banner.setAttribute('aria-live', 'polite');
      container.appendChild(banner);
    }

    triggerWarpBanner(planet) {
      const banner = document.getElementById('zothWarpBanner');
      if (!banner) return;
      banner.style.borderColor = planet.accent_color;
      banner.innerHTML = `⚡ HYPERSPACE WARP → <span style="color:${planet.accent_color}">${planet.icon} ${planet.name.toUpperCase()}</span> (${planet.subtitle})`;
      banner.classList.add('is-warping');
      clearTimeout(this._warpTimer);
      this._warpTimer = setTimeout(() => {
        banner.classList.remove('is-warping');
      }, 1450);
    }

    buildDossierModal() {
      let modal = document.getElementById('zothPlanetDossierModal');
      if (modal) modal.remove();

      modal = document.createElement('div');
      modal.id = 'zothPlanetDossierModal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'zpdTitle');
      modal.innerHTML = `
        <div class="zpd-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;">
            <div>
              <div id="zpdKicker" style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:800;color:#FDE68A;letter-spacing:0.1em;">HELIOS-ZOTH INTERPLANETARY FOUNDRY</div>
              <h2 id="zpdTitle" style="margin:4px 0 2px;font-size:22px;font-weight:800;color:#FFF;">🪐 Zoth Prime</h2>
              <div id="zpdSubtitle" style="font-size:13px;color:#94A3B8;">Imperial Sovereign Capital & Terraform Nexus</div>
            </div>
            <button type="button" id="btnCloseZpdModal" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:#FFF;border-radius:8px;padding:6px 12px;cursor:pointer;font-weight:800;">✕ Close</button>
          </div>

          <div style="display:flex;gap:6px;flex-wrap:wrap;margin:14px 0;" id="zpdPlanetSwitcher"></div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:12px;">
            <div style="background:rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;">
              <div style="font-family:'JetBrains Mono',monospace;font-size:10.5px;color:#38BDF8;font-weight:800;margin-bottom:8px;">🎬 COMFYUI FLUX.1 4K + LTX-VIDEO 2B ORBITAL FLYBY</div>
              <img id="zpdPreviewImg" src="/assets/planets/zoth_prime_texture.jpg" alt="Planetary 360 Equirectangular Surface & Orbital Flyby Preview" style="width:100%;height:175px;object-fit:cover;border-radius:8px;border:1px solid rgba(212,175,55,0.35);background:#05070f;" />
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
                <a id="zpdDownloadGlb" href="/assets/planets/zoth_prime.glb" download class="btn-ctrl" style="flex:1;text-align:center;text-decoration:none;padding:8px 10px;background:linear-gradient(135deg,#D4AF37,#F59E0B);color:#05050A;font-weight:900;border-radius:8px;font-size:11.5px;">📦 Download 3D .GLB (Blender 4.0)</a>
                <a id="zpdOpenTex" href="/assets/planets/zoth_prime_texture.jpg" target="_blank" rel="noopener" class="btn-ctrl" style="padding:8px 10px;text-decoration:none;border:1px solid #38BDF8;color:#7DD3FC;border-radius:8px;font-size:11.5px;font-weight:800;">🖼️ 4K Texture</a>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:10px;">
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;">
                <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#FDE68A;font-weight:800;">PLANETARY SPECIALIZATION & BIOME</div>
                <div id="zpdSpec" style="font-size:12.5px;color:#E2E8F0;margin-top:4px;line-height:1.45;"></div>
                <div id="zpdBiome" style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#5EEAD4;margin-top:6px;"></div>
              </div>

              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;flex:1;">
                <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#C084FC;font-weight:800;margin-bottom:6px;">SPECIALIZED COLONIES (CLICK TO FOCUS IN 3D)</div>
                <div id="zpdColoniesList" style="display:flex;flex-direction:column;gap:6px;"></div>
              </div>
            </div>
          </div>

          <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;font-size:11px;color:#94A3B8;">
            <span>Engineered by 1nc0gn30 (@1nc0gn30) • NullAI Platform</span>
            <span>Pipeline: ComfyUI (FLUX.1-schnell + 4x-UltraSharp + LTX-Video 2B) + Headless Blender 4.0.2</span>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('btnCloseZpdModal')?.addEventListener('click', () => {
        modal.classList.remove('is-open');
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('is-open');
      });
    }

    openDossierModal(planetId) {
      const planet = this.planetMap[planetId] || this.planetMap[this.activePlanetId] || this.planets[0];
      const modal = document.getElementById('zothPlanetDossierModal');
      if (!modal || !planet) return;

      document.getElementById('zpdTitle').textContent = `${planet.icon} ${planet.name}`;
      document.getElementById('zpdSubtitle').textContent = `${planet.subtitle} • ${planet.population}`;
      document.getElementById('zpdSpec').textContent = planet.specialization;
      document.getElementById('zpdBiome').textContent = `Biome: ${planet.biome}`;

      const previewImg = document.getElementById('zpdPreviewImg');
      if (previewImg) {
        const flybyUrl = planet.flyby_webp_url || `/assets/planets/${planet.id}_flyby.webp`;
        const texUrl = planet.texture_url || `/assets/planets/${planet.id}_texture.jpg`;
        previewImg.onerror = () => {
          if (previewImg.src.indexOf('_flyby.webp') !== -1) {
            previewImg.src = texUrl;
          } else {
            const procTex = this.getOrCreateProceduralBiomeTexture(planet.id);
            if (procTex && procTex.image && procTex.image.toDataURL) {
              previewImg.src = procTex.image.toDataURL('image/jpeg', 0.85);
            }
          }
        };
        previewImg.src = flybyUrl;
      }

      const dlGlb = document.getElementById('zpdDownloadGlb');
      if (dlGlb) {
        dlGlb.href = planet.glb_url || `/assets/planets/${planet.id}.glb`;
        dlGlb.textContent = `📦 Download ${planet.shortName} .GLB (3D Model)`;
      }
      const openTex = document.getElementById('zpdOpenTex');
      if (openTex) {
        openTex.href = planet.texture_url || `/assets/planets/${planet.id}_texture.jpg`;
      }

      // Switcher pills inside modal
      const switcher = document.getElementById('zpdPlanetSwitcher');
      if (switcher) {
        switcher.innerHTML = '';
        this.planets.forEach(p => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'zss-planet-pill' + (p.id === planet.id ? ' is-active' : '');
          b.textContent = `${p.icon} ${p.shortName}`;
          b.addEventListener('click', () => {
            this.warpToPlanet(p.id);
            this.openDossierModal(p.id);
          });
          switcher.appendChild(b);
        });
      }

      // Colonies list inside modal
      const colList = document.getElementById('zpdColoniesList');
      if (colList) {
        colList.innerHTML = '';
        planet.colonies.forEach((col, idx) => {
          const slotKey = col.slot || COLONY_SLOT_KEYS[idx];
          const row = document.createElement('div');
          row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);';
          row.innerHTML = `
            <div>
              <strong style="color:${col.color};font-size:12px;">${col.icon || '🏛️'} ${col.name}</strong>
              <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#94A3B8;">${col.role} (${col.lat}°, ${col.lon}°)</div>
            </div>
          `;
          const goBtn = document.createElement('button');
          goBtn.type = 'button';
          goBtn.className = 'zss-action-btn';
          goBtn.style.padding = '3px 9px';
          goBtn.style.fontSize = '10px';
          goBtn.textContent = '🎯 Focus 3D';
          goBtn.addEventListener('click', () => {
            modal.classList.remove('is-open');
            if (this.activePlanetId !== planet.id) {
              this.warpToPlanet(planet.id);
            }
            setTimeout(() => {
              if (this.sw && typeof this.sw.focusColony === 'function') {
                this.sw.focusColony(slotKey);
              }
            }, 220);
          });
          row.appendChild(goBtn);
          colList.appendChild(row);
        });
      }

      modal.classList.add('is-open');
    }
  }

  // Boot & Attach to window.sphereWorld
  function bootInterplanetarySystem(attempt = 0) {
    if (window.sphereWorld && window.sphereWorld.scene && window.THREE) {
      if (!window.interplanetarySystem) {
        window.interplanetarySystem = new InterplanetarySystemArchitect(window.sphereWorld);
        window.warpToPlanet = (id) => window.interplanetarySystem.warpToPlanet(id);
        window.toggleSectorOverview = (s) => window.interplanetarySystem.toggleSectorOverview(s);
        console.log('🌌 [Helios-Zoth] 6-World 3D Interplanetary Star System initialized.');
      }
    } else if (attempt < 60) {
      setTimeout(() => bootInterplanetarySystem(attempt + 1), 150);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => bootInterplanetarySystem(0));
  } else {
    bootInterplanetarySystem(0);
  }
})();
