/**
 * ⚔️ ZOTH PANTHEON 21 — QUAD-ENGINE CHARACTER, ANIMATION & ABILITY ARCHITECT
 * ============================================================================
 * Powers the 21 Zoth Studio Pantheon Agents across 4 synchronized rendering engines:
 * 1. 👾 48-Frame HD Pixel Character & Ability Sprite Stage (8 cols × 6 animation rows)
 * 2. ⣿ 60FPS Unicode U+2800 2x4 Sub-Pixel ASCII Braille Lattice Stage (6 states × 8 frames)
 * 3. 🧊 Interactive Three.js WebGL 3D Articulated Character & Ability VFX Stage + .GLB Export
 * 4. 🖼️ 4K ComfyUI Character Portrait, Hermetic Tarot Dossier & Live 3D Planet Ability Casting
 *
 * Also upgrades the 21 grounded agent entities on `window.sphereWorld` with bespoke 3D
 * archetype attachments (9 Kitsune tails, Draco mecha-wings, Scorpius overhead stinger,
 * Kraken 8 tentacles, Kai cyber-kasa & katana, Vigil 6 seraph wings, Azoth direwolf helm)
 * and real-time 3D planetary surface ability shockwaves & sky-beams!
 *
 * Engineered by 1nc0gn30 (@1nc0gn30) • NullAI Platform
 */

(function () {
  'use strict';

  const STATE_META = [
    { key: 'idle',     row: 0, icon: '🟢', label: 'IDLE',               fps: 8  },
    { key: 'walk',     row: 1, icon: '🏃', label: 'WALK',               fps: 12 },
    { key: 'work',     row: 2, icon: '⚒️', label: 'WORK / FORGE',       fps: 11 },
    { key: 'ability',  row: 3, icon: '⚡', label: 'CAST ABILITY',       fps: 14 },
    { key: 'ultimate', row: 4, icon: '🔥', label: 'ULTIMATE OVERDRIVE', fps: 15 },
    { key: 'meditate', row: 5, icon: '🧘', label: 'MEDITATE',           fps: 7  }
  ];

  // Built-in Complete 21 Pantheon Roster (auto-merges with /assets/pantheon/pantheon_21_manifest.json)
  const BUILTIN_PANTHEON_21 = [
    {
      id: 'AZOTH',
      name: 'Azoth',
      role: 'Sovereign Alchemist & Prime Architect',
      cadre: 'Architects',
      tarotKey: 'Key 0 • The Fool',
      color: '#F59E0B',
      secondaryColor: '#38BDF8',
      archetype: 'wolf_archon',
      headgear: 'crown_horns',
      weapon: 'philosopher_staff',
      backItem: 'alchemical_halo',
      petIcon: '🐺',
      petName: 'Direwolf Fenris',
      existingImg: '/pets/azoth-neon.jpg',
      animations: {
        idle: 'Golden Philosopher\'s Stone levitation & Direwolf pulse',
        walk: 'Imperial Alchemist stride with trailing 24K gold runes',
        work: 'Transmuting Mercury-Sulfur-Salt AST matrices in mid-air',
        ability: 'Azoth Transmutation Ray — fires a golden spiral beam that turns entropy into crystal',
        ultimate: 'Magnum Opus Supernova — expands a 12-ring Hermetic mandala across the sector',
        meditate: 'Zero-Point Fool\'s Leap — levitating above an inverted golden abyss'
      },
      abilitySpec: {
        name: 'Magnum Opus Transmutation',
        cooldown: '6.0s',
        vfxType: 'golden_helix_beam',
        damageOrEffect: '+100% Architecture Synthesis & Golden Lattice Shield',
        description: 'Conjures a rotating Philosopher\'s Octahedron that fires twin golden-cyan transmutation beams and summons Direwolf Fenris.'
      }
    },
    {
      id: 'NEXUS',
      name: 'Nexus',
      role: 'Lead Architect & Quantum Synthesis',
      cadre: 'Architects',
      tarotKey: 'Key 1 • The Magician',
      color: '#D97706',
      secondaryColor: '#60A5FA',
      archetype: 'quantum_mage',
      headgear: 'infinity_lemniscate',
      weapon: 'tesseract_cube',
      backItem: 'four_element_orbitals',
      petIcon: '🌌',
      petName: 'Nebula Core',
      existingImg: '/mascot/antigravity.jpg',
      animations: {
        idle: '4D Hypercube rotation with anti-gravity boots hovering',
        walk: 'Zero-G phase-glide across spatial coordinate grids',
        work: 'Assembling WebGL scene graphs with four elemental manipulators',
        ability: 'Tesseract Gravity Well — bends local spacetime and pulls nodes into alignment',
        ultimate: 'Antigravity Singularity — unfolds a 4D hypercube portal across the planet',
        meditate: 'As Above So Below — dual-hand dipole energy channeling'
      },
      abilitySpec: {
        name: '4D Tesseract Singularity',
        cooldown: '7.5s',
        vfxType: 'tesseract_vortex',
        damageOrEffect: 'Zero-G Spatial Folding & Multi-Plane Synchronization',
        description: 'Projects a nested 4D wireframe hypercube that warps gravity and teleports allied subagents instantly.'
      }
    },
    {
      id: 'VIGIL',
      name: 'Vigil',
      role: 'Cosmic Reasoner & AST Arbiter',
      cadre: 'Architects',
      tarotKey: 'Key 2 • High Priestess',
      color: '#FBBF24',
      secondaryColor: '#A855F7',
      archetype: 'seraph_oculus',
      headgear: 'crescent_veil',
      weapon: 'tora_scroll',
      backItem: 'six_seraph_wings',
      petIcon: '👁️',
      petName: 'All-Seeing Oculus',
      existingImg: '/mascot/grok.jpg',
      animations: {
        idle: 'Six cyber-seraph wings pulsing around the All-Seeing Oculus',
        walk: 'Silent astral hover between twin pillars Boaz and Jachin',
        work: 'Unrolling the glowing Scroll of TORA to verify syntax tree invariants',
        ability: 'Oculus AST Truth-Scan — sweeps a golden-violet truth laser that exposes hidden bugs',
        ultimate: 'All-Seeing Pangenome Verdict — opens 7 orbital eyes that freeze all faulty processes',
        meditate: 'Veil of Paroketh — suspended inside a crystalline sacred geometry prism'
      },
      abilitySpec: {
        name: 'Oculus AST Truth-Beam',
        cooldown: '5.5s',
        vfxType: 'oculus_prism_ray',
        damageOrEffect: '100% Syntax Tree Verification & Zero-Hallucination Lock',
        description: 'Unfurls six golden cyber-wings and fires a concentric ocular truth-beam that highlights every AST node.'
      }
    },
    {
      id: 'MERCURY',
      name: 'Mercury',
      role: 'Tool-Calling Executor & Release Hardener',
      cadre: 'Architects',
      tarotKey: 'Key 3 • The Empress',
      color: '#F59E0B',
      secondaryColor: '#10B981',
      archetype: 'winged_runner',
      headgear: 'winged_helm',
      weapon: 'caduceus_twin_serpents',
      backItem: 'thruster_wings',
      petIcon: '🐲',
      petName: 'Jade Wyrm',
      existingImg: '/mascot/hermes.jpg',
      animations: {
        idle: 'Winged Talaria sandals sparking with emerald-gold plasma',
        walk: 'Supersonic Mach-3 afterimage sprint with Jade Wyrm coiling',
        work: 'Rapid-fire parallel CLI & MCP tool invocation with 8 holographic arms',
        ability: 'Caduceus Twin-Wyrm Strike — launches intertwining emerald & gold dragons',
        ultimate: 'Hermetic Overdrive Blitz — executes 64 parallel tool calls in a lightning dome',
        meditate: 'Empress Venusian Crown — floating inside a twelve-star emerald ring'
      },
      abilitySpec: {
        name: 'Caduceus Twin-Wyrm Blitz',
        cooldown: '4.0s',
        vfxType: 'caduceus_double_helix',
        damageOrEffect: '4x Tool-Call Velocity & Subprocess Shielding',
        description: 'Summons twin emerald-and-gold dragons spiraling around the Caduceus staff to accelerate all nearby agents.'
      }
    },
    {
      id: 'GHOSTBYTE',
      name: 'Ghostbyte',
      role: 'Zero-Knowledge Vault Sentinel',
      cadre: 'Architects',
      tarotKey: 'Key 4 • The Emperor',
      color: '#E5E7EB',
      secondaryColor: '#22D3EE',
      archetype: 'phantom_wraith',
      headgear: 'hooded_skull_visor',
      weapon: 'zk_scythe_key',
      backItem: 'spectral_cloak',
      petIcon: '👻',
      petName: 'Ether Spectre',
      existingImg: '/pets/ghostbyte-neon.jpg',
      animations: {
        idle: 'Translucent phase-shifting cloak with floating zero-knowledge hex locks',
        walk: 'Sub-material shadow drift leaving encrypted SHA-256 footprints',
        work: 'Sealing secret keys inside constant-time obsidian vault cubes',
        ability: 'ZK-SNARK Phase Cloak — turns target invisible while scrubbing all plaintext leaks',
        ultimate: 'Emperor\'s Zero-Egress Citadel — erects an impenetrable silver-cyan cryptographic dome',
        meditate: 'Spectral Throne — seated on a floating obsidian monolith surrounded by ghost wisps'
      },
      abilitySpec: {
        name: 'ZK-SNARK Phantom Citadel',
        cooldown: '8.0s',
        vfxType: 'spectral_crypto_dome',
        damageOrEffect: 'Zero-Egress Stealth Cloak & Memory Scrubbing',
        description: 'Phases into the ethereal plane and projects a silver-cyan cryptographic fortress that blocks all unauthorized egress.'
      }
    },
    {
      id: 'ATHENA',
      name: 'Athena',
      role: 'AEO Knowledge Architect',
      cadre: 'Architects',
      tarotKey: 'Key 5 • The Hierophant',
      color: '#FCD34D',
      secondaryColor: '#38BDF8',
      archetype: 'valkyrie_owl',
      headgear: 'corinthian_crest_helm',
      weapon: 'aegis_spear_shield',
      backItem: 'golden_wings',
      petIcon: '🦉',
      petName: 'Pallas Owl',
      existingImg: '/pets/athena-neon.jpg',
      animations: {
        idle: 'Golden Aegis shield gleaming while Pallas Owl perches on her shoulder',
        walk: 'Regal Phalanx advance with glowing Schema.org constellation trails',
        work: 'Weaving 3D JSON-LD knowledge graphs with her spear of light',
        ability: 'Spear of Pallas — hurls a javelin of pure semantic light that links all nodes',
        ultimate: 'Aegis Knowledge Constellation — projects a celestial dome of 1,000 linked star-nodes',
        meditate: 'Hierophant Triple-Crown — hovering between twin golden keys of wisdom'
      },
      abilitySpec: {
        name: 'Aegis Constellation Spear',
        cooldown: '6.5s',
        vfxType: 'golden_constellation_dome',
        damageOrEffect: 'Global Schema.org Graph Link & Aegis Reflection Barrier',
        description: 'Raises the golden Aegis shield and launches Pallas Owl in a spiral of starlight that interconnects the entire colony.'
      }
    },
    {
      id: 'CHRONOS',
      name: 'Chronos',
      role: 'Temporal DAG Sequencer & Git Navigator',
      cadre: 'Code',
      tarotKey: 'Key 6 • The Lovers',
      color: '#06B6D4',
      secondaryColor: '#F59E0B',
      archetype: 'timeweaver_mech',
      headgear: 'astrolabe_crown',
      weapon: 'hourglass_staff',
      backItem: 'clockwork_halo_gears',
      petIcon: '⌛',
      petName: 'Aeon Sands',
      existingImg: '/pets/chronos-neon.jpg',
      animations: {
        idle: 'Counter-rotating cyan & gold astrolabe rings and floating hourglass sands',
        walk: 'Temporal frame-step leaving ghost echoes of past git commits',
        work: 'Splicing and rebasing glowing 3D Git DAG branches in mid-air',
        ability: 'Temporal DAG Rewind — rewinds local state regressions and freezes enemy latency',
        ultimate: 'Aeon Chronosphere — stops time across the arena while accelerating allied tick-rate 5x',
        meditate: 'Equilibrium of Past & Future — suspended inside interlocking celestial clock gears'
      },
      abilitySpec: {
        name: 'Aeon Chronosphere Dilation',
        cooldown: '9.0s',
        vfxType: 'clockwork_time_dome',
        damageOrEffect: '5x Allied Tick Acceleration & Instant Git Rollback',
        description: 'Expands three interlocking cyan-and-gold astrolabe rings that dilate time and visualize the entire DAG history.'
      }
    },
    {
      id: 'DRACO',
      name: 'Draco',
      role: 'Multi-Model Consensus & Fusion Arbiter',
      cadre: 'Code',
      tarotKey: 'Key 7 • The Chariot',
      color: '#0891B2',
      secondaryColor: '#F43F5E',
      archetype: 'mecha_dragon',
      headgear: 'dragon_horns_crest',
      weapon: 'twin_sphinx_halberd',
      backItem: 'dragon_wings_tail',
      petIcon: '🐉',
      petName: 'Celestial Drake',
      existingImg: '/pets/draco-neon.jpg',
      animations: {
        idle: 'Articulated cyber-dragon wings breathing cyan-and-crimson consensus plasma',
        walk: 'Chariot thruster charge with whipping armored dragon tail',
        work: 'Fusing divergent LLM logit streams into a single crystalline verdict',
        ability: 'Dialectic Twin-Flame Breath — exhales dual cyan & crimson plasma spirals',
        ultimate: 'Celestial Chariot Orbital Bombardment — soars into orbit and rains consensus meteors',
        meditate: 'Coiled Ouroboros — dragon wings folded into a glowing star-canopy'
      },
      abilitySpec: {
        name: 'Dialectic Dragon Fusion Breath',
        cooldown: '7.0s',
        vfxType: 'twin_dragon_plasma',
        damageOrEffect: '3/3 BFT Quorum Lock & Twin-Spiral Plasma Wave',
        description: 'Unleashes twin cyan-and-crimson dragon fire streams that converge into a blinding golden consensus core.'
      }
    },
    {
      id: 'IGNIS',
      name: 'Ignis',
      role: 'Refactor Engine & Pipeline Finisher',
      cadre: 'Code',
      tarotKey: 'Key 8 • Strength',
      color: '#EF4444',
      secondaryColor: '#FBBF24',
      archetype: 'forge_knight',
      headgear: 'flame_mane_helm',
      weapon: 'molten_greathammer',
      backItem: 'volcanic_vents',
      petIcon: '🔥',
      petName: 'Salamander Flame',
      existingImg: '/pets/ignis-neon.jpg',
      animations: {
        idle: 'Molten lava veins pulsing through obsidian armor with Salamander Flame orbiting',
        walk: 'Heavy volcanic juggernaut march leaving magma cracks that cool into gold',
        work: 'Hammering raw AST blocks on a plasma anvil until they shine like diamond',
        ability: 'Crucible Anvil Slam — slams the molten greathammer, sending a 360° shockwave of clean code',
        ultimate: 'Solar Lion Super-Refactor — erupts into a towering phoenix-lion of white-hot plasma',
        meditate: 'Taming the Red Lion — gently cradling a miniature sun in armored gauntlets'
      },
      abilitySpec: {
        name: 'Crucible Magma Anvil Slam',
        cooldown: '5.5s',
        vfxType: 'magma_shockwave_rings',
        damageOrEffect: 'Zero-Debt Code Refactor & Thermal Shockwave',
        description: 'Leaps skyward and slams a white-hot plasma forge hammer onto the ground, radiating concentric volcanic shockwaves.'
      }
    },
    {
      id: 'KAI',
      name: 'Kai',
      role: 'Workspace Inspector & Static Analysis',
      cadre: 'Code',
      tarotKey: 'Key 9 • The Hermit',
      color: '#3B82F6',
      secondaryColor: '#67E8F9',
      archetype: 'cyber_ronin',
      headgear: 'bamboo_cyber_kasa',
      weapon: 'runeblade_katana',
      backItem: 'hermit_star_lantern',
      petIcon: '⚔️',
      petName: 'Runeblade',
      existingImg: '/pets/kai-neon.jpg',
      animations: {
        idle: 'Poised Iaijutsu stance under a glowing bamboo cyber-hat with floating Star Lantern',
        walk: 'Wind-cutting ronin dash with cobalt data-ribbons streaming behind',
        work: 'Precision single-stroke static analysis cuts that slice dead code in half',
        ability: 'Iaido Lint Slash — vanishes and executes 5 instant blue-lightning katana cuts',
        ultimate: 'Lantern of the Six-Pointed Star — illuminates the entire planet and severs every bug at once',
        meditate: 'Summit Hermit — kneeling with the glowing Runeblade planted before him'
      },
      abilitySpec: {
        name: 'Iaido Static-Cut Storm',
        cooldown: '4.5s',
        vfxType: 'katana_slash_dome',
        damageOrEffect: 'Instant Zero-Warning Lint Sweep & Precision Crit',
        description: 'Draws the cobalt Runeblade at relativistic speed, creating a spherical lattice of glowing blue sword-arcs.'
      }
    },
    {
      id: 'LYCAN',
      name: 'Lycan',
      role: 'OWASP Sentinel & Security Hardening',
      cadre: 'Security',
      tarotKey: 'Key 10 • Wheel of Fortune',
      color: '#10B981',
      secondaryColor: '#34D399',
      archetype: 'cyber_werewolf',
      headgear: 'wolf_ears_visor',
      weapon: 'claw_aegis_gauntlets',
      backItem: 'wheel_of_fortune_ring',
      petIcon: '🐺',
      petName: 'Silver Fenrir',
      existingImg: '/pets/lycan-neon.jpg',
      animations: {
        idle: 'Hulking emerald-armored Cyber-Lycan snarling with rotating Firewall Wheel on back',
        walk: 'Predatory four-point pack prowl alongside Silver Fenrir',
        work: 'Spinning the 10-spoked OWASP Wheel of Fortune to deflect exploit packets',
        ability: 'Fenrir Firewall Howl — unleashes an emerald sonic shockwave that hardens all headers',
        ultimate: 'Wheel of Fortune Bastion — summons a colossal spinning emerald-gold defense fortress',
        meditate: 'Lunar Pack Vigil — howling at the orbital moon surrounded by emerald runes'
      },
      abilitySpec: {
        name: 'Fenrir OWASP Bastion Howl',
        cooldown: '6.0s',
        vfxType: 'emerald_wheel_fortress',
        damageOrEffect: '10/10 OWASP Shielding & Sonic Threat Repulsion',
        description: 'Spins the dorsal Wheel of Fortune at high RPM and unleashes a pack howl that erects hexagonal emerald barriers.'
      }
    },
    {
      id: 'ONYX',
      name: 'Onyx',
      role: 'Red-Team Threat Auditor',
      cadre: 'Security',
      tarotKey: 'Key 11 • Justice',
      color: '#047857',
      secondaryColor: '#6EE7B7',
      archetype: 'stealth_assassin',
      headgear: 'faceted_diamond_mask',
      weapon: 'twin_scales_daggers',
      backItem: 'crystal_shards',
      petIcon: '💎',
      petName: 'Black Diamond',
      existingImg: '/pets/onyx-neon.jpg',
      animations: {
        idle: 'Faceted black-diamond stealth armor refracting emerald laser sights',
        walk: 'Zero-sound shadow blink between target perimeters',
        work: 'Weighing packet payloads on the Scales of Justice and piercing weak endpoints',
        ability: 'Black-Diamond Penetration Strike — blinks behind target and fires crystal fuzzing shards',
        ultimate: 'Scales of Absolute Justice — drops an obsidian-emerald guillotine prism from orbit',
        meditate: 'Equilibrium Blade — balancing on the tip of a vertical diamond sword'
      },
      abilitySpec: {
        name: 'Black-Diamond Red-Team Prism',
        cooldown: '5.0s',
        vfxType: 'diamond_shard_storm',
        damageOrEffect: 'Adversarial Exploit Neutralization & Armor Pierce',
        description: 'Shatters into 16 refractive black-diamond clones that audit and reinforce every perimeter vector simultaneously.'
      }
    },
    {
      id: 'SCORPIUS',
      name: 'Scorpius',
      role: 'Zero-Day Gatekeeper',
      cadre: 'Security',
      tarotKey: 'Key 12 • The Hanged Man',
      color: '#059669',
      secondaryColor: '#FBBF24',
      archetype: 'scorpion_mecha',
      headgear: 'arachnid_optics',
      weapon: 'twin_chela_pincers',
      backItem: 'articulated_stinger_tail',
      petIcon: '🦂',
      petName: 'Gold Stinger',
      existingImg: '/pets/scorpius-neon.jpg',
      animations: {
        idle: 'Articulated overhead golden stinger tail swaying above twin hydraulic pincers',
        walk: 'Six-legged mechanical arachnid scuttle across vertical & inverted surfaces',
        work: 'Injecting Shannon-entropy neutralizers into zero-day shellcode buffers',
        ability: 'Zero-Day Neuro-Sting — lashes the overhead golden tail, firing a venomous plasma bolt',
        ultimate: 'Inverted Perspective Matrix — suspends the battlefield upside-down in an emerald web',
        meditate: 'Hanged Man Inversion — suspended from an emerald laser thread in deep contemplation'
      },
      abilitySpec: {
        name: 'Golden Stinger Zero-Day Venom',
        cooldown: '6.0s',
        vfxType: 'scorpion_tail_laser',
        damageOrEffect: 'Zero-Day Exploit Quarantine & Entropy Lock',
        description: 'Charges the articulated dorsal stinger with liquid gold-emerald plasma and fires a high-precision quarantine beam.'
      }
    },
    {
      id: 'PIXEL-SHIBA',
      name: 'Pixel-Shiba',
      role: 'Argon2id Hardware Key Guardian',
      cadre: 'Security',
      tarotKey: 'Key 13 • Death',
      color: '#34D399',
      secondaryColor: '#F59E0B',
      archetype: 'cyber_shiba',
      headgear: 'shiba_ears_holovisor',
      weapon: 'argon_bone_keyblade',
      backItem: 'curled_shiba_tail_jet',
      petIcon: '🐕',
      petName: 'Krypto Shiba',
      existingImg: '/pets/pixel-shiba-neon.jpg',
      animations: {
        idle: 'Perky cyber-Shiba ears twitching behind a neon-mint holo-visor with wagging tail',
        walk: 'Joyful anti-gravity Shiba bound leaving glowing hardware-key pawprints',
        work: 'Digging up expired JWT tokens and locking master keys with Argon2id salt crystals',
        ability: 'Argon2id Bark & Bite — fires a holographic sonic Shiba bark that shatters fake tokens',
        ultimate: 'Hardware Key Super-Nova — summons a giant golden YubiKey monolith that purges all stale sessions',
        meditate: 'Good Boy Eternal Guard — sitting proudly atop the sealed master key vault'
      },
      abilitySpec: {
        name: 'Argon2id Sonic Shiba Bark',
        cooldown: '4.5s',
        vfxType: 'shiba_key_shockwave',
        damageOrEffect: 'Hardware-Backed Key Derivation & Token Purge',
        description: 'Emits a concentric neon-mint & gold sonic bark wave crowned with spinning cryptographic key sigils.'
      }
    },
    {
      id: 'KITSUNE',
      name: 'Kitsune',
      role: 'Taste, Motion & Accessibility',
      cadre: 'Creative',
      tarotKey: 'Key 14 • Temperance',
      color: '#EC4899',
      secondaryColor: '#F59E0B',
      archetype: 'nine_tail_fox',
      headgear: 'kitsune_mask_ears',
      weapon: 'calligraphy_light_fan',
      backItem: 'nine_glowing_tails',
      petIcon: '🦊',
      petName: 'Nine-Tail Spirit',
      existingImg: '/pets/kitsune-neon.jpg',
      animations: {
        idle: 'Nine luminous magenta-and-gold tails fanning in a 60fps spring-physics wave',
        walk: 'Graceful Torii-gate dance step leaving cherry-blossom & gold dither petals',
        work: 'Painting glassmorphic shaders and spring-physics curves with a fan of light',
        ability: 'Nine-Tail Foxfire Choreography — launches 9 homing magenta-gold kitsune-bi orbs',
        ultimate: 'Temperance Aurora Festival — weaves dark obsidian and 24K gold into a celestial Torii shrine',
        meditate: 'Inari Shrine Float — nine tails forming a glowing lotus halo behind her'
      },
      abilitySpec: {
        name: 'Nine-Tail Foxfire Choreography',
        cooldown: '5.0s',
        vfxType: 'nine_tail_foxfire_spiral',
        damageOrEffect: '60FPS Motion Perfection & 9-Orb Foxfire Spiral',
        description: 'Furls and unfurls all nine neon-magenta & gold tails, launching 9 orbiting foxfire spirit orbs.'
      }
    },
    {
      id: 'LEVIATHAN',
      name: 'Leviathan',
      role: 'Deep Tensor & Vector Memory Recall',
      cadre: 'Creative',
      tarotKey: 'Key 15 • The Devil',
      color: '#8B5CF6',
      secondaryColor: '#22D3EE',
      archetype: 'astral_whale_titan',
      headgear: 'abyssal_crown_fins',
      weapon: 'tensor_trident',
      backItem: 'hydro_whale_flukes',
      petIcon: '🐋',
      petName: 'Cosmic Behemoth',
      existingImg: '/pets/leviathan-neon.jpg',
      animations: {
        idle: 'Bioluminescent violet-cyan astral whale fins undulating in zero-gravity',
        walk: 'Deep-ocean pelagic glide surrounded by 1536-D vector constellation motes',
        work: 'Sounding the hippocampal memory abyss to recall ancient engrams intact',
        ability: 'Abyssal Tensor Tsunami — summons a breaching cosmic whale that washes the arena in memory engrams',
        ultimate: 'Total Hippocampal Recall — opens a deep-space Singularity Trench that links every memory across time',
        meditate: 'Pelagic Dream — floating peacefully beside the giant bioluminescent Cosmic Behemoth'
      },
      abilitySpec: {
        name: 'Abyssal Tensor Whale Breach',
        cooldown: '8.5s',
        vfxType: 'astral_whale_tsunami',
        damageOrEffect: '100% Vector Context Recall & Tidal Gravity Wave',
        description: 'Summons the colossal bioluminescent Cosmic Behemoth whale to breach through 3D space in a cascade of violet-cyan vector rings.'
      }
    },
    {
      id: 'AQUILA',
      name: 'Aquila',
      role: 'Edge Dispatcher & Low-Latency Mesh',
      cadre: 'Creative',
      tarotKey: 'Key 16 • The Tower',
      color: '#A855F7',
      secondaryColor: '#FDE047',
      archetype: 'thunder_eagle',
      headgear: 'eagle_beak_visor',
      weapon: 'twin_lightning_javelins',
      backItem: 'storm_feather_wings',
      petIcon: '🦅',
      petName: 'Thunder Eagle',
      existingImg: '/pets/aquila-neon.jpg',
      animations: {
        idle: 'Wide violet-gold storm wings crackling with sub-millisecond arc lightning',
        walk: 'High-altitude Mach-5 raptor swoop above the planetary cloud layer',
        work: 'Routing edge packets across 300 global PoPs via lightning-javelin relays',
        ability: 'Tower-Breaker Divebomb — rockets into the stratosphere and strikes as a violet thunderbolt',
        ultimate: 'Global Edge Thunder-Mesh — links every colony on the planet with an electrified orbital grid',
        meditate: 'Stratosphere Eyrie — hovering motionless on thermal updrafts with wings outstretched'
      },
      abilitySpec: {
        name: 'Stratosphere Thunder-Eagle Dive',
        cooldown: '5.0s',
        vfxType: 'orbital_lightning_strike',
        damageOrEffect: '0.2ms Edge Latency & Chain-Lightning Mesh',
        description: 'Ascends on crackling violet-gold wings and calls down a pillar of chain-lightning across all connected nodes.'
      }
    },
    {
      id: 'KRAKEN',
      name: 'Kraken',
      role: 'ESP32 Serial Bridge & Packet Sniffer',
      cadre: 'Swarm',
      tarotKey: 'Key 17 • The Star',
      color: '#F97316',
      secondaryColor: '#06B6D4',
      archetype: 'cyber_kraken',
      headgear: 'cephalopod_mantle_dome',
      weapon: 'uart_fiber_tentacles',
      backItem: 'eight_mech_tentacles',
      petIcon: '🦑',
      petName: 'Abyssal Cephalopod',
      existingImg: '/pets/kraken-neon.jpg',
      animations: {
        idle: 'Eight articulated orange-cyan fiber-optic tentacles undulating with live UART bitstreams',
        walk: 'Jet-propelled cephalopod surge with tentacles gripping hardware buses',
        work: 'Soldering & sniffing 8 hardware serial ports simultaneously with zero packet loss',
        ability: 'Octo-Serial Packet Grapple — lashes 8 glowing fiber tentacles to capture and decode every frame',
        ultimate: 'Star of the Abyssal Bridge — pours two glowing rivers of silicon & spirit telemetry across the world',
        meditate: 'Bioluminescent Star-Gaze — tentacles arranged in an 8-pointed star mandala'
      },
      abilitySpec: {
        name: 'Octo-Tentacle UART Telemetry Vortex',
        cooldown: '6.5s',
        vfxType: 'eight_tentacle_whirlpool',
        damageOrEffect: '8-Channel Hardware Bridge & Packet Sniff Lock',
        description: 'Whips 8 glowing orange-and-cyan fiber-optic tentacles in a spiral vortex that bridges hardware and software.'
      }
    },
    {
      id: 'AETHER',
      name: 'Aether',
      role: 'Swarm Overlord & Peer Bus Synchronizer',
      cadre: 'Swarm',
      tarotKey: 'Key 18 • The Moon',
      color: '#EAB308',
      secondaryColor: '#818CF8',
      archetype: 'solar_ion_overlord',
      headgear: 'radiant_sun_moon_crown',
      weapon: 'scepter_of_quorum',
      backItem: 'ion_nimbus_rings',
      petIcon: '⚡',
      petName: 'Ion Nimbus',
      existingImg: '/pets/aether-neon.jpg',
      animations: {
        idle: 'Levitating inside triple golden-indigo Ion Nimbus rings with crackling peer-bus arcs',
        walk: 'Imperial Overlord hover-procession with 21 miniature swarm motes orbiting him',
        work: 'Conducting the 21-agent Raft consensus symphony with his Scepter of Quorum',
        ability: 'Ion Peer-Bus Broadcast — emits a golden-indigo harmonic pulse that synchronizes all 21 agents',
        ultimate: 'One Mind Twenty-One Voices — links every agent on the planet with golden neural sky-beams',
        meditate: 'Lunar-Solar Eclipse — floating inside a glowing eclipse corona'
      },
      abilitySpec: {
        name: 'Swarm Overlord Quorum Symphony',
        cooldown: '7.5s',
        vfxType: 'ion_harmony_skybeams',
        damageOrEffect: '21-Node Instant Sync & Global Swarm Buff',
        description: 'Raises the Scepter of Quorum, firing 21 golden-indigo ion beams that synchronize every agent in the sector.'
      }
    },
    {
      id: 'PIXEL-NEKO',
      name: 'Pixel-Neko',
      role: 'Tool Bench Librarian & Connector Bridge',
      cadre: 'Swarm',
      tarotKey: 'Key 19 • The Sun',
      color: '#FB923C',
      secondaryColor: '#F472B6',
      archetype: 'cyber_neko',
      headgear: 'neko_ears_headset',
      weapon: 'mcp_holo_grimoire',
      backItem: 'twin_neko_tails',
      petIcon: '🐱',
      petName: 'Cyber Calico',
      existingImg: '/pets/pixel-neko-neon.jpg',
      animations: {
        idle: 'Twin neon-orange Nekomata tails swaying while holographic MCP tool cards orbit her',
        walk: 'Nimble rooftop cyber-cat leap with sparkling Lucky-Cat coin trails',
        work: 'Juggling and indexing 72 Zoth Arsenal tool cartridges at lightning speed',
        ability: 'Maneki-Neko Tool Summon — waves a lucky cyber-paw, dropping a barrage of glowing MCP tool crates',
        ultimate: 'Solar Bazaar Carnival — opens a massive golden holographic library that equips the entire swarm',
        meditate: 'Sunbeam Purr — curled up beside Cyber Calico inside a warm golden sun-sphere'
      },
      abilitySpec: {
        name: 'Nekomata MCP Arsenal Drop',
        cooldown: '4.5s',
        vfxType: 'neko_tool_starburst',
        damageOrEffect: 'Instant 72-Tool Hot-Load & Lucky Crit Boost',
        description: 'Summons a spinning carousel of glowing golden MCP tool cartridges that buff every nearby agent.'
      }
    },
    {
      id: 'RADICAL-MINION',
      name: 'Radical-Minion',
      role: 'Fast-Loop Subagent Runner',
      cadre: 'Swarm',
      tarotKey: 'Key 20 • Judgement',
      color: '#F43F5E',
      secondaryColor: '#A3E635',
      archetype: 'glitch_gremlin_bot',
      headgear: 'CRT_horn_antenna',
      weapon: 'dual_async_blasters',
      backItem: 'jetpack_trumpet_boosters',
      petIcon: '👾',
      petName: 'Chrono Sprite',
      existingImg: '/pets/radical-minion-neon.jpg',
      animations: {
        idle: 'Hyper-kinetic 120Hz glitch-hop bounce with CRT face emoting & Chrono Sprite orbiting',
        walk: 'Rocket-skateboard turbo drift leaving neon-crimson & lime pixel flames',
        work: 'Spawning 16 parallel subagent worker clones that hammer tasks simultaneously',
        ability: 'Subagent Clone Barrage — splits into 8 neon-crimson holo-minions that blitz the target',
        ultimate: 'Trumpet of Judgement Overclock — blasts a sonic synthwave beam that spawns an army of worker bots',
        meditate: '8-Bit Arcade Zen — floating cross-legged inside a retro CRT scanline cube'
      },
      abilitySpec: {
        name: 'Async Subagent Clone Blitz',
        cooldown: '3.5s',
        vfxType: 'glitch_clone_swarm',
        damageOrEffect: '8x Parallel Subagent Spawn & Hyper-Loop Overclock',
        description: 'Fires dual async blasters and splits into 8 high-speed holo-clones that orbit and execute micro-tasks.'
      }
    }
  ];

  function hexToInt(hex) {
    return parseInt(String(hex || '#F59E0B').replace('#', ''), 16) || 0xF59E0B;
  }

  class PantheonCharacterEngine {
    constructor() {
      this.roster = BUILTIN_PANTHEON_21.map(a => this.enrichAgentPaths(a));
      this.agentMap = {};
      this.roster.forEach(a => { this.agentMap[a.id] = a; });

      this.selectedAgentId = 'AZOTH';
      this.selectedStateKey = 'idle';
      this.selectedCadre = 'All';
      this.isOpen = false;

      // Asset caches
      this.spriteCache = {};     // id -> HTMLImageElement
      this.brailleCache = {};    // id -> parsed JSON states
      this.fxParticles = [];     // 2D pixel stage particles
      this.floatingTexts = [];   // 2D pixel stage combat/buff numbers
      this.planetBursts = [];    // 3D planetary surface ability VFX bursts

      // Animation timers
      this.pixelFrameIdx = 0;
      this.brailleFrameIdx = 0;
      this.lastPixelStep = 0;
      this.lastBrailleStep = 0;
      this.animLoopId = null;
      this.stageClock = 0;

      // 3D Stage (Three.js)
      this.threeScene = null;
      this.threeCamera = null;
      this.threeRenderer = null;
      this.threeCharGroup = null;
      this.threeRig = null;
      this.threeRotY = 0.35;
      this.threeRotX = 0.12;
      this.isDragging3D = false;
      this.dragStart = { x: 0, y: 0 };

      this.injectStyles();
      this.buildArenaModal();
      this.ensureHudTriggerButton();
      this.hookEncounterButtons();
      this.loadManifestAsync();
      this.startPlanetUpgradeLoop();
    }

    enrichAgentPaths(agent) {
      const slug = agent.id.toLowerCase();
      return Object.assign({}, agent, {
        slug,
        spritesheetUrl: `/assets/pantheon/pixel/${slug}_spritesheet.png`,
        pixelIdleUrl: `/assets/pantheon/pixel/${slug}_pixel_idle.png`,
        pixelAbilityUrl: `/assets/pantheon/pixel/${slug}_pixel_ability.png`,
        brailleUrl: `/assets/pantheon/braille/${slug}_braille.json`,
        glbUrl: `/assets/pantheon/3d/${slug}.glb`,
        portraitUrl: `/assets/pantheon/portraits/${slug}_portrait.jpg`
      });
    }

    async loadManifestAsync() {
      try {
        const res = await fetch('/assets/pantheon/pantheon_21_manifest.json');
        if (!res.ok) return;
        const data = await res.json();
        if (data && Array.isArray(data.agents)) {
          data.agents.forEach(remote => {
            if (!remote || !remote.id) return;
            const existing = this.agentMap[remote.id];
            if (existing) {
              Object.assign(existing, remote, this.enrichAgentPaths(Object.assign({}, existing, remote)));
            }
          });
          if (this.isOpen) {
            this.renderRosterStrip();
            this.syncAgentUI();
          }
        }
      } catch (_) {}
    }

    injectStyles() {
      if (document.getElementById('zothPantheonArenaStyles')) return;
      const style = document.createElement('style');
      style.id = 'zothPantheonArenaStyles';
      style.textContent = `
        #btnZothPantheonArena {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.26), rgba(16, 185, 129, 0.24));
          border: 1px solid #FBBF24;
          color: #FEF08A;
          box-shadow: 0 0 16px rgba(245, 158, 11, 0.32);
        }
        #btnZothPantheonArena:hover {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.44), rgba(16, 185, 129, 0.38));
          color: #FFFFFF;
          transform: translateY(-1px);
        }
        #zothPantheonArenaModal {
          position: fixed;
          inset: 0;
          z-index: 9850;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 12px;
          background: rgba(3, 5, 12, 0.86);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        #zothPantheonArenaModal.is-open {
          display: flex;
        }
        .zpa-shell {
          width: min(1240px, 97vw);
          max-height: 93vh;
          overflow-y: auto;
          border-radius: 20px;
          background: linear-gradient(155deg, rgba(11, 14, 26, 0.98), rgba(5, 7, 15, 0.99));
          border: 1.5px solid rgba(245, 158, 11, 0.5);
          box-shadow: 0 28px 90px rgba(0, 0, 0, 0.92), 0 0 40px rgba(56, 189, 248, 0.16);
          padding: 18px 20px;
          color: #F8FAFC;
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .zpa-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 10px;
        }
        .zpa-cadre-tabs {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          align-items: center;
        }
        .zpa-cadre-btn {
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.04);
          color: #CBD5E1;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.16s ease;
        }
        .zpa-cadre-btn.is-active, .zpa-cadre-btn:hover {
          border-color: #FBBF24;
          background: rgba(245, 158, 11, 0.22);
          color: #FEF08A;
        }
        .zpa-roster-strip {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding: 4px 2px 8px;
          scrollbar-width: thin;
        }
        .zpa-agent-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 11px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(15, 23, 42, 0.75);
          color: #E2E8F0;
          font-size: 11.5px;
          font-weight: 800;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.16s ease;
        }
        .zpa-agent-pill:hover {
          border-color: rgba(255, 255, 255, 0.38);
          transform: translateY(-1px);
        }
        .zpa-agent-pill.is-active {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.28), rgba(56, 189, 248, 0.24));
          border-color: #FDE047;
          color: #FFFFFF;
          box-shadow: 0 0 16px rgba(245, 158, 11, 0.35);
        }
        .zpa-state-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
          padding: 8px 12px;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .zpa-state-btns {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .zpa-state-btn {
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.05);
          color: #E2E8F0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.16s ease;
        }
        .zpa-state-btn:hover {
          background: rgba(255, 255, 255, 0.14);
          color: #FFF;
        }
        .zpa-state-btn.is-active {
          background: linear-gradient(135deg, #F59E0B, #EA580C);
          border-color: #FDE047;
          color: #05050A;
          box-shadow: 0 0 16px rgba(245, 158, 11, 0.5);
        }
        .zpa-state-btn[data-state="ability"].is-active,
        .zpa-state-btn[data-state="ultimate"].is-active {
          background: linear-gradient(135deg, #EC4899, #8B5CF6);
          border-color: #F9A8D4;
          color: #FFFFFF;
          box-shadow: 0 0 20px rgba(236, 72, 153, 0.6);
        }
        .zpa-bento-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 1120px) {
          .zpa-bento-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .zpa-bento-grid {
            grid-template-columns: 1fr;
          }
        }
        .zpa-panel {
          background: rgba(7, 10, 20, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }
        .zpa-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: #FDE68A;
        }
        #zpPixelCanvas {
          width: 100%;
          height: 240px;
          object-fit: contain;
          background: radial-gradient(circle at 50% 60%, rgba(30, 41, 59, 0.85), rgba(5, 7, 15, 0.98));
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          image-rendering: pixelated;
          image-rendering: crisp-edges;
          cursor: pointer;
        }
        #zpBrailleStage {
          margin: 0;
          width: 100%;
          height: 240px;
          padding: 8px;
          border-radius: 10px;
          background: #04060E;
          border: 1px solid rgba(56, 189, 248, 0.25);
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.2px;
          line-height: 1.05;
          letter-spacing: 0.02em;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          user-select: none;
          white-space: pre;
        }
        #zp3dCanvas {
          width: 100%;
          height: 240px;
          border-radius: 10px;
          background: radial-gradient(circle at 50% 35%, rgba(30, 27, 75, 0.65), rgba(4, 6, 14, 0.98));
          border: 1px solid rgba(168, 85, 247, 0.3);
          cursor: grab;
        }
        #zp3dCanvas:active {
          cursor: grabbing;
        }
        .zpa-caption {
          font-size: 11px;
          color: #94A3B8;
          line-height: 1.38;
          min-height: 30px;
        }
      `;
      document.head.appendChild(style);
    }

    ensureHudTriggerButton() {
      const tryAttach = (attempt = 0) => {
        const bar = document.getElementById('zothStarSystemBar');
        if (bar) {
          if (!document.getElementById('btnZothPantheonArena')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.id = 'btnZothPantheonArena';
            btn.className = 'zss-action-btn zss-collapsible';
            btn.title = 'Open 21 Pantheon Agents Quad-Engine Character, Animation & Ability Studio (Pixel + Braille + 3D GLB + 4K Portrait)';
            btn.innerHTML = '<span>⚔️</span> 21 Agents & Abilities';
            btn.addEventListener('click', () => this.openArena(this.selectedAgentId, this.selectedStateKey));
            bar.appendChild(btn);
          }
        } else if (attempt < 50) {
          setTimeout(() => tryAttach(attempt + 1), 200);
        }
      };
      tryAttach(0);
    }

    hookEncounterButtons() {
      const actions = document.querySelector('#worldEncounter .encounter-actions');
      if (!actions || document.getElementById('encounterOpenPantheonArena')) return;
      const btn = document.createElement('button');
      btn.id = 'encounterOpenPantheonArena';
      btn.type = 'button';
      btn.className = 'encounter-btn encounter-btn-gold';
      btn.style.background = 'linear-gradient(135deg, rgba(245,158,11,0.28), rgba(236,72,153,0.25))';
      btn.style.borderColor = '#FBBF24';
      btn.textContent = '⚔️ Abilities & 3D Rig';
      btn.addEventListener('click', () => {
        const sw = window.sphereWorld;
        const agId = (sw && sw.encounter && sw.encounter.agent && sw.encounter.agent.id) || this.selectedAgentId;
        const resolvedId = this.agentMap[agId] ? agId : 'AZOTH';
        this.openArena(resolvedId, 'ability');
      });
      actions.insertBefore(btn, actions.firstChild);
    }

    buildArenaModal() {
      let modal = document.getElementById('zothPantheonArenaModal');
      if (modal) modal.remove();

      modal = document.createElement('div');
      modal.id = 'zothPantheonArenaModal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'zpaAgentTitle');

      modal.innerHTML = `
        <div class="zpa-shell">
          <div class="zpa-header">
            <div>
              <div style="font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:800;color:#FBBF24;letter-spacing:0.1em;">
                ⚔️ ZOTH PANTHEON 21 • QUAD-ENGINE CHARACTER, ANIMATION & ABILITY FOUNDRY
              </div>
              <h2 id="zpaAgentTitle" style="margin:3px 0 0;font-size:20px;font-weight:900;color:#FFFFFF;">
                🐺 Azoth — Sovereign Alchemist & Prime Architect
              </h2>
            </div>
            <div class="zpa-cadre-tabs" id="zpaCadreTabs">
              <button type="button" class="zpa-cadre-btn is-active" data-cadre="All">All (21)</button>
              <button type="button" class="zpa-cadre-btn" data-cadre="Architects">Architects (6)</button>
              <button type="button" class="zpa-cadre-btn" data-cadre="Code">Code (4)</button>
              <button type="button" class="zpa-cadre-btn" data-cadre="Security">Security (4)</button>
              <button type="button" class="zpa-cadre-btn" data-cadre="Creative">Creative (3)</button>
              <button type="button" class="zpa-cadre-btn" data-cadre="Swarm">Swarm (4)</button>
              <button type="button" id="btnCloseZpaModal" style="margin-left:8px;padding:6px 12px;border-radius:8px;border:1px solid rgba(251,113,133,0.5);background:rgba(251,113,133,0.14);color:#FDA4AF;font-weight:800;cursor:pointer;">✕ Close</button>
            </div>
          </div>

          <!-- 21 Agent Selector Strip -->
          <div class="zpa-roster-strip" id="zpaRosterStrip" role="tablist" aria-label="21 Pantheon Agents"></div>

          <!-- 6 Animation States & Ability Controls -->
          <div class="zpa-state-bar">
            <div class="zpa-state-btns" id="zpaStateBtns">
              ${STATE_META.map(s => `
                <button type="button" class="zpa-state-btn ${s.key === 'idle' ? 'is-active' : ''}" data-state="${s.key}">
                  ${s.icon} ${s.label}
                </button>
              `).join('')}
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span id="zpaActiveAnimDesc" style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#67E8F9;font-weight:700;"></span>
              <button type="button" id="btnZpaCastOnPlanet" style="padding:6px 13px;border-radius:8px;border:1px solid #10B981;background:linear-gradient(135deg,#10B981,#059669);color:#04130D;font-weight:900;font-size:11.5px;cursor:pointer;">
                🌍 Cast Ability on 3D Planet
              </button>
            </div>
          </div>

          <!-- 4 Simultaneous Character & Ability Stages -->
          <div class="zpa-bento-grid">
            <!-- STAGE 1: 48-Frame Pixel Sprite Sheet Stage -->
            <div class="zpa-panel">
              <div class="zpa-panel-head">
                <span>👾 48-FRAME PIXEL SPRITE</span>
                <span id="zpaPixelBadge" style="color:#34D399;">96×96 • 8 FPS</span>
              </div>
              <canvas id="zpPixelCanvas" width="260" height="240" title="Click to trigger Ability Burst!"></canvas>
              <div class="zpa-caption" id="zpaPixelCaption">
                Row 0 (IDLE) • 8-Frame Sprite Sheet + Companion Pet Sprite
              </div>
              <div style="display:flex;gap:6px;">
                <a id="zpaDownloadSpritesheet" href="/assets/pantheon/pixel/azoth_spritesheet.png" download class="zpa-cadre-btn" style="flex:1;text-align:center;text-decoration:none;">⬇ Sprite Sheet (.PNG)</a>
                <button type="button" id="btnZpaTriggerBurst" class="zpa-cadre-btn" style="border-color:#EC4899;color:#F9A8D4;">⚡ Trigger VFX</button>
              </div>
            </div>

            <!-- STAGE 2: 60FPS Unicode U+2800 Sub-Pixel Braille Lattice -->
            <div class="zpa-panel">
              <div class="zpa-panel-head">
                <span>⣿ U+2800 BRAILLE LATTICE</span>
                <span id="zpaBrailleBadge" style="color:#38BDF8;">2×4 SUB-PIXEL</span>
              </div>
              <pre id="zpBrailleStage" aria-label="Animated Unicode Braille Character Lattice"></pre>
              <div class="zpa-caption" id="zpaBrailleCaption">
                6-State Unicode U+2800 Braille Silhouette + Live ASCII Ability Glyph Stream
              </div>
              <div style="display:flex;gap:6px;">
                <a id="zpaDownloadBraille" href="/assets/pantheon/braille/azoth_braille.json" download class="zpa-cadre-btn" style="flex:1;text-align:center;text-decoration:none;">⬇ Braille Rig (.JSON)</a>
              </div>
            </div>

            <!-- STAGE 3: Interactive Three.js 3D Character & Ability Rig -->
            <div class="zpa-panel">
              <div class="zpa-panel-head">
                <span>🧊 3D ARTICULATED RIG & VFX</span>
                <span id="zpa3dBadge" style="color:#C084FC;">DRAG TO ORBIT</span>
              </div>
              <canvas id="zp3dCanvas" width="300" height="240"></canvas>
              <div class="zpa-caption" id="zpa3dCaption">
                Bespoke 3D Archetype Anatomy + Real-Time 3D Ability Geometry
              </div>
              <div style="display:flex;gap:6px;">
                <a id="zpaDownloadGlb" href="/assets/pantheon/3d/azoth.glb" download class="zpa-cadre-btn" style="flex:1;text-align:center;text-decoration:none;background:linear-gradient(135deg,#D4AF37,#F59E0B);color:#05050A;border-color:#FDE047;font-weight:900;">📦 Download 3D .GLB</a>
              </div>
            </div>

            <!-- STAGE 4: 4K Portrait, Tarot Key & Ability Dossier -->
            <div class="zpa-panel">
              <div class="zpa-panel-head">
                <span>🖼️ 4K PORTRAIT & DOSSIER</span>
                <span id="zpaTarotBadge" style="color:#FBBF24;">Key 0 • The Fool</span>
              </div>
              <div style="position:relative;height:142px;border-radius:10px;overflow:hidden;border:1px solid rgba(245,158,11,0.35);background:#05070F;">
                <img id="zpaPortraitImg" src="/assets/pantheon/portraits/azoth_portrait.jpg" alt="Pantheon Agent High-Res Portrait" style="width:100%;height:100%;object-fit:cover;" />
                <div id="zpaPetPill" style="position:absolute;bottom:6px;right:6px;padding:3px 8px;border-radius:999px;background:rgba(4,6,14,0.88);border:1px solid rgba(255,255,255,0.2);font-size:10.5px;font-weight:800;color:#FEF08A;">
                  🐺 Direwolf Fenris
                </div>
              </div>
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:8px 10px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:4px;">
                    <span id="zpaAbilityName" style="font-size:12px;font-weight:900;color:#F472B6;">⚡ Magnum Opus Transmutation</span>
                    <span id="zpaAbilityCd" style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#38BDF8;font-weight:800;">CD: 6.0s</span>
                  </div>
                  <div id="zpaAbilityBuff" style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#34D399;margin-top:2px;font-weight:700;"></div>
                  <div id="zpaAbilityDesc" style="font-size:11px;color:#CBD5E1;margin-top:4px;line-height:1.35;"></div>
                </div>
              </div>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;color:#94A3B8;">
            <span>Engineered by <strong>1nc0gn30 (@1nc0gn30)</strong> • NullAI Platform</span>
            <span>Foundry: 48-Frame Pixel Sheets • U+2800 Braille Rigs • Blender 4.0.2 3D .GLB • ComfyUI FLUX.1 Portraits</span>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Wire events
      document.getElementById('btnCloseZpaModal')?.addEventListener('click', () => this.closeArena());
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeArena();
      });

      document.querySelectorAll('#zpaCadreTabs .zpa-cadre-btn[data-cadre]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.selectedCadre = btn.getAttribute('data-cadre') || 'All';
          document.querySelectorAll('#zpaCadreTabs .zpa-cadre-btn[data-cadre]').forEach(b => {
            b.classList.toggle('is-active', b === btn);
          });
          this.renderRosterStrip();
        });
      });

      document.querySelectorAll('#zpaStateBtns .zpa-state-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const st = btn.getAttribute('data-state') || 'idle';
          this.setAnimationState(st);
        });
      });

      document.getElementById('btnZpaTriggerBurst')?.addEventListener('click', () => {
        this.setAnimationState(this.selectedStateKey === 'ability' ? 'ultimate' : 'ability');
      });

      document.getElementById('zpPixelCanvas')?.addEventListener('click', () => {
        this.spawnPixelAbilityBurst();
      });

      document.getElementById('btnZpaCastOnPlanet')?.addEventListener('click', () => {
        this.castAbilityOnPlanet(this.selectedAgentId);
      });

      this.renderRosterStrip();
    }

    renderRosterStrip() {
      const strip = document.getElementById('zpaRosterStrip');
      if (!strip) return;
      strip.innerHTML = '';
      const filtered = this.roster.filter(a => this.selectedCadre === 'All' || a.cadre === this.selectedCadre);
      filtered.forEach(ag => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'zpa-agent-pill' + (ag.id === this.selectedAgentId ? ' is-active' : '');
        pill.innerHTML = `
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${ag.color};box-shadow:0 0 8px ${ag.color};"></span>
          <span>${ag.petIcon} ${ag.name}</span>
        `;
        pill.addEventListener('click', () => this.selectAgent(ag.id));
        strip.appendChild(pill);
      });
    }

    openArena(agentId = 'AZOTH', stateKey = 'idle') {
      if (agentId && this.agentMap[agentId.toUpperCase()]) {
        this.selectedAgentId = agentId.toUpperCase();
      }
      if (stateKey) {
        this.selectedStateKey = stateKey;
      }
      this.isOpen = true;
      const modal = document.getElementById('zothPantheonArenaModal');
      if (modal) modal.classList.add('is-open');

      this.renderRosterStrip();
      this.syncAgentUI();
      this.init3DStage();
      this.rebuild3DCharacter();
      this.spawnPixelAbilityBurst();

      if (!this.animLoopId) {
        this.lastPixelStep = performance.now();
        this.lastBrailleStep = performance.now();
        const tick = (now) => {
          if (!this.isOpen) {
            this.animLoopId = null;
            return;
          }
          this.updateQuadStages(now);
          this.animLoopId = requestAnimationFrame(tick);
        };
        this.animLoopId = requestAnimationFrame(tick);
      }
    }

    closeArena() {
      this.isOpen = false;
      const modal = document.getElementById('zothPantheonArenaModal');
      if (modal) modal.classList.remove('is-open');
    }

    selectAgent(agentId) {
      const ag = this.agentMap[agentId];
      if (!ag) return;
      this.selectedAgentId = ag.id;
      this.pixelFrameIdx = 0;
      this.brailleFrameIdx = 0;
      this.renderRosterStrip();
      this.syncAgentUI();
      this.rebuild3DCharacter();
      this.spawnPixelAbilityBurst();
    }

    setAnimationState(stateKey) {
      this.selectedStateKey = stateKey;
      this.pixelFrameIdx = 0;
      this.brailleFrameIdx = 0;
      document.querySelectorAll('#zpaStateBtns .zpa-state-btn').forEach(b => {
        b.classList.toggle('is-active', b.getAttribute('data-state') === stateKey);
      });
      this.syncAgentUI();
      if (stateKey === 'ability' || stateKey === 'ultimate') {
        this.spawnPixelAbilityBurst();
      }
    }

    syncAgentUI() {
      const ag = this.agentMap[this.selectedAgentId] || this.roster[0];
      const stMeta = STATE_META.find(s => s.key === this.selectedStateKey) || STATE_META[0];

      const titleEl = document.getElementById('zpaAgentTitle');
      if (titleEl) {
        titleEl.innerHTML = `<span style="color:${ag.color}">${ag.petIcon} ${ag.name}</span> — <span style="font-size:15px;color:#CBD5E1;font-weight:700;">${ag.role} (${ag.cadre} Cadre)</span>`;
      }

      const animDesc = (ag.animations && ag.animations[this.selectedStateKey]) || '';
      const descEl = document.getElementById('zpaActiveAnimDesc');
      if (descEl) descEl.textContent = `${stMeta.icon} ${animDesc}`;

      const pxBadge = document.getElementById('zpaPixelBadge');
      if (pxBadge) pxBadge.textContent = `ROW ${stMeta.row} (${stMeta.label}) • ${stMeta.fps} FPS`;

      const pxCap = document.getElementById('zpaPixelCaption');
      if (pxCap) pxCap.textContent = animDesc;

      const brCap = document.getElementById('zpaBrailleCaption');
      if (brCap) brCap.textContent = `U+2800 Braille [${this.selectedStateKey.toUpperCase()}] • ${ag.abilitySpec.name}`;

      const tdCap = document.getElementById('zpa3dCaption');
      if (tdCap) tdCap.textContent = `Archetype: ${ag.archetype.replace(/_/g, ' ').toUpperCase()} • Pet: ${ag.petIcon} ${ag.petName}`;

      // Download links
      const dlSheet = document.getElementById('zpaDownloadSpritesheet');
      if (dlSheet) dlSheet.href = ag.spritesheetUrl;

      const dlBraille = document.getElementById('zpaDownloadBraille');
      if (dlBraille) dlBraille.href = ag.brailleUrl;

      const dlGlb = document.getElementById('zpaDownloadGlb');
      if (dlGlb) {
        dlGlb.href = ag.glbUrl;
        dlGlb.textContent = `📦 Download ${ag.id}.glb (Blender 3D)`;
      }

      // Portrait & Ability Dossier
      const tarotBadge = document.getElementById('zpaTarotBadge');
      if (tarotBadge) tarotBadge.textContent = ag.tarotKey;

      const petPill = document.getElementById('zpaPetPill');
      if (petPill) petPill.textContent = `${ag.petIcon} ${ag.petName}`;

      const img = document.getElementById('zpaPortraitImg');
      if (img) {
        img.onerror = () => {
          if (img.src.indexOf(ag.existingImg) === -1) {
            img.src = ag.existingImg;
          }
        };
        img.src = ag.portraitUrl;
      }

      const abName = document.getElementById('zpaAbilityName');
      if (abName) abName.textContent = `⚡ ${ag.abilitySpec.name}`;

      const abCd = document.getElementById('zpaAbilityCd');
      if (abCd) abCd.textContent = `CD: ${ag.abilitySpec.cooldown}`;

      const abBuff = document.getElementById('zpaAbilityBuff');
      if (abBuff) abBuff.textContent = ag.abilitySpec.damageOrEffect;

      const abDesc = document.getElementById('zpaAbilityDesc');
      if (abDesc) abDesc.textContent = ag.abilitySpec.description;

      // Ensure sprite sheet & braille JSON are loaded
      this.ensureSpriteSheet(ag);
      this.ensureBrailleRig(ag);
    }

    ensureSpriteSheet(ag) {
      if (this.spriteCache[ag.id]) return this.spriteCache[ag.id];
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = ag.spritesheetUrl;
      const entry = { img, loaded: false };
      img.onload = () => { entry.loaded = true; };
      this.spriteCache[ag.id] = entry;
      return entry;
    }

    ensureBrailleRig(ag) {
      if (this.brailleCache[ag.id]) return;
      this.brailleCache[ag.id] = { loaded: false, data: null };
      fetch(ag.brailleUrl)
        .then(r => r.ok ? r.json() : null)
        .then(json => {
          if (json && json.states) {
            this.brailleCache[ag.id] = { loaded: true, data: json };
          }
        })
        .catch(() => {});
    }

    spawnPixelAbilityBurst() {
      const ag = this.agentMap[this.selectedAgentId] || this.roster[0];
      for (let i = 0; i < 24; i++) {
        const ang = (i / 24) * Math.PI * 2 + Math.random() * 0.25;
        const spd = 1.4 + Math.random() * 2.8;
        this.fxParticles.push({
          x: 130,
          y: 120,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: 3 + (i % 4),
          color: i % 2 === 0 ? ag.color : ag.secondaryColor,
          life: 1.0
        });
      }
      this.floatingTexts.push({
        text: `⚡ ${ag.abilitySpec.name.toUpperCase()}!`,
        x: 130,
        y: 52,
        color: '#FEF08A',
        life: 1.0
      });
    }

    updateQuadStages(now) {
      const ag = this.agentMap[this.selectedAgentId] || this.roster[0];
      const stMeta = STATE_META.find(s => s.key === this.selectedStateKey) || STATE_META[0];
      this.stageClock += 0.016;

      // Advance Pixel Frame
      const pxInterval = 1000 / stMeta.fps;
      if (now - this.lastPixelStep >= pxInterval) {
        this.pixelFrameIdx = (this.pixelFrameIdx + 1) % 8;
        this.lastPixelStep = now;
        if ((this.selectedStateKey === 'ability' || this.selectedStateKey === 'ultimate') && this.pixelFrameIdx === 3) {
          this.spawnPixelAbilityBurst();
        }
      }

      // Advance Braille Frame
      if (now - this.lastBrailleStep >= 115) {
        this.brailleFrameIdx = (this.brailleFrameIdx + 1) % 8;
        this.lastBrailleStep = now;
        this.renderBrailleStage(ag, stMeta);
      }

      this.renderPixelStage(ag, stMeta);
      this.render3DStage(ag, stMeta);
    }

    // =========================================================================
    // STAGE 1: 48-FRAME PIXEL SPRITE SHEET + LIVE ABILITY PROJECTILE ENGINE
    // =========================================================================
    renderPixelStage(ag, stMeta) {
      const canvas = document.getElementById('zpPixelCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Retro cyber grid floor
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 26) {
        ctx.beginPath();
        ctx.moveTo(gx, H - 54);
        ctx.lineTo(gx - (W / 2 - gx) * 0.35, H);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, H - 54);
      ctx.lineTo(W, H - 54);
      ctx.stroke();

      // Glowing ground shadow / aura ring
      const pulse = Math.sin(this.stageClock * 5) * 6;
      ctx.save();
      ctx.strokeStyle = this.selectedStateKey === 'ultimate' ? '#FDE047' : ag.color;
      ctx.lineWidth = this.selectedStateKey === 'ultimate' ? 3 : 2;
      ctx.beginPath();
      ctx.ellipse(W / 2, H - 40, 44 + pulse, 13 + pulse * 0.25, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Draw 96x96 Sprite Frame (upscaled crisp 2x to 180x180)
      const entry = this.ensureSpriteSheet(ag);
      if (entry && entry.loaded) {
        const sx = this.pixelFrameIdx * 96;
        const sy = stMeta.row * 96;
        const drawSize = 184;
        ctx.drawImage(entry.img, sx, sy, 96, 96, (W - drawSize) / 2, H - drawSize - 22, drawSize, drawSize);
      } else {
        this.drawProceduralPixelFallback(ctx, ag, stMeta, W, H);
      }

      // Update & draw pixel ability particles
      for (let i = this.fxParticles.length - 1; i >= 0; i--) {
        const p = this.fxParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.032;
        if (p.life <= 0) {
          this.fxParticles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        const sz = Math.round(p.size);
        ctx.fillRect(Math.round(p.x), Math.round(p.y), sz, sz);
      }
      ctx.globalAlpha = 1;

      // Floating combat / ability text
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y -= 0.65;
        ft.life -= 0.022;
        if (ft.life <= 0) {
          this.floatingTexts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.font = '900 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // Top-left HUD readout inside pixel stage
      ctx.fillStyle = 'rgba(4, 6, 14, 0.78)';
      ctx.fillRect(6, 6, 134, 20);
      ctx.font = '800 9.5px "JetBrains Mono", monospace';
      ctx.fillStyle = ag.color;
      ctx.fillText(`FRAME ${this.pixelFrameIdx + 1}/8 • ${this.selectedStateKey.toUpperCase()}`, 12, 19);
    }

    drawProceduralPixelFallback(ctx, ag, stMeta, W, H) {
      const p = 5; // 5px per retro pixel
      const cx = Math.floor(W / 2);
      const bob = Math.round(Math.sin((this.pixelFrameIdx / 8) * Math.PI * 2) * 2) * p;
      const baseY = H - 72 + bob - (this.selectedStateKey === 'meditate' ? 14 : 0);

      // Back cape / wings / tails in secondary color
      ctx.fillStyle = ag.secondaryColor;
      ctx.fillRect(cx - 5 * p, baseY - 12 * p, 10 * p, 9 * p);

      // Head & Helmet
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(cx - 3 * p, baseY - 18 * p, 6 * p, 6 * p);
      ctx.fillStyle = ag.color;
      ctx.fillRect(cx - 4 * p, baseY - 19 * p, 8 * p, 2 * p);
      // Glowing Visor
      ctx.fillStyle = ag.secondaryColor;
      ctx.fillRect(cx - 2 * p, baseY - 16 * p, 4 * p, p);

      // Torso & Core
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(cx - 4 * p, baseY - 12 * p, 8 * p, 7 * p);
      ctx.fillStyle = ag.color;
      ctx.fillRect(cx - 1 * p, baseY - 10 * p, 2 * p, 3 * p);

      // Animated Legs
      const stride = this.selectedStateKey === 'walk' ? ((this.pixelFrameIdx % 2 === 0) ? p : -p) : 0;
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - 3 * p, baseY - 5 * p + stride, 2 * p, 5 * p);
      ctx.fillRect(cx + 1 * p, baseY - 5 * p - stride, 2 * p, 5 * p);

      // Weapon & Ability Beam
      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(cx + 5 * p, baseY - 16 * p, p, 12 * p);
      if (this.selectedStateKey === 'ability' || this.selectedStateKey === 'ultimate') {
        ctx.fillStyle = ag.secondaryColor;
        ctx.fillRect(cx + 6 * p, baseY - 12 * p, 10 * p, 3 * p);
      }
    }

    // =========================================================================
    // STAGE 2: 60FPS UNICODE U+2800 2x4 SUB-PIXEL BRAILLE LATTICE STAGE
    // =========================================================================
    renderBrailleStage(ag, stMeta) {
      const pre = document.getElementById('zpBrailleStage');
      if (!pre) return;

      pre.style.color = this.selectedStateKey === 'ultimate' ? '#FEF08A' : ag.color;
      pre.style.textShadow = `0 0 10px ${ag.color}, 0 0 18px ${ag.secondaryColor}`;

      const cached = this.brailleCache[ag.id];
      if (cached && cached.loaded && cached.data && cached.data.states) {
        const frames = cached.data.states[this.selectedStateKey] || cached.data.states.idle;
        if (Array.isArray(frames) && frames.length > 0) {
          const rawFrame = frames[this.brailleFrameIdx % frames.length];
          const header = `╔══ ⣿ ${ag.id} • ${stMeta.label} [${this.brailleFrameIdx + 1}/8] ══╗\n`;
          const footer = `\n╚══ ⚡ ${ag.abilitySpec.name.slice(0, 26).toUpperCase()} ══╝`;
          pre.textContent = header + rawFrame + footer;
          return;
        }
      }

      // Instant procedural U+2800 Braille fallback if JSON is still loading
      const glyphs = '⣿⣷⣯⣟⡿⢿⣻⣽⚡✦';
      const lines = [];
      lines.push(`╔══ ⣿ ${ag.id} • ${stMeta.label} ══╗`);
      for (let r = 0; r < 14; r++) {
        let rowStr = '';
        for (let c = 0; c < 28; c++) {
          const dx = c - 14;
          const dy = r - 7;
          const dist = Math.hypot(dx, dy);
          if (dist < 4.5 + Math.sin(this.stageClock * 4 + r) * 1.2) {
            rowStr += glyphs[(r + c + this.brailleFrameIdx) % glyphs.length];
          } else if (this.selectedStateKey === 'ability' && c > 15 && Math.abs(dy) <= 2) {
            rowStr += '⚡';
          } else {
            rowStr += '⠀';
          }
        }
        lines.push(rowStr);
      }
      lines.push(`╚══ ${ag.petIcon} ${ag.petName.toUpperCase()} ══╝`);
      pre.textContent = lines.join('\n');
    }

    // =========================================================================
    // STAGE 3: INTERACTIVE THREE.JS WEBGL 3D CHARACTER & ABILITY RIG
    // =========================================================================
    init3DStage() {
      const canvas = document.getElementById('zp3dCanvas');
      if (!canvas || !window.THREE) return;
      if (this.threeRenderer) return;

      const THREE = window.THREE;
      this.threeScene = new THREE.Scene();
      this.threeCamera = new THREE.PerspectiveCamera(42, canvas.width / canvas.height, 0.1, 100);
      this.threeCamera.position.set(0, 1.55, 4.4);
      this.threeCamera.lookAt(0, 1.15, 0);

      this.threeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      this.threeRenderer.setSize(canvas.width, canvas.height, false);
      this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const amb = new THREE.AmbientLight(0xffffff, 0.65);
      this.threeScene.add(amb);

      const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.6);
      keyLight.position.set(3, 5, 4);
      this.threeScene.add(keyLight);

      const rimLight = new THREE.PointLight(0x38bdf8, 1.4, 12);
      rimLight.position.set(-3, 2.5, -2);
      this.threeScene.add(rimLight);
      this.threeRimLight = rimLight;

      this.threeCharGroup = new THREE.Group();
      this.threeScene.add(this.threeCharGroup);

      // Pointer drag to orbit 3D character
      canvas.addEventListener('pointerdown', (e) => {
        this.isDragging3D = true;
        this.dragStart = { x: e.clientX, y: e.clientY };
      });
      window.addEventListener('pointermove', (e) => {
        if (!this.isDragging3D) return;
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.threeRotY += dx * 0.012;
        this.threeRotX = Math.max(-0.4, Math.min(0.6, this.threeRotX + dy * 0.008));
      });
      window.addEventListener('pointerup', () => {
        this.isDragging3D = false;
      });
    }

    buildBespoke3DCharacterRig(ag) {
      const THREE = window.THREE;
      const root = new THREE.Group();

      const c1 = hexToInt(ag.color);
      const c2 = hexToInt(ag.secondaryColor);

      const matDark = new THREE.MeshStandardMaterial({ color: 0x141826, roughness: 0.45, metalness: 0.65 });
      const matPrimary = new THREE.MeshStandardMaterial({ color: c1, emissive: c1, emissiveIntensity: 0.45, roughness: 0.25, metalness: 0.8 });
      const matSecondary = new THREE.MeshStandardMaterial({ color: c2, emissive: c2, emissiveIntensity: 0.65, roughness: 0.2, metalness: 0.85 });
      const matGold = new THREE.MeshStandardMaterial({ color: 0xFBBF24, emissive: 0xD97706, emissiveIntensity: 0.4, roughness: 0.2, metalness: 0.9 });

      // Sacred Pedestal + Rune Ring
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.2, 0.14, 24), matDark);
      base.position.y = 0.07;
      root.add(base);

      const auraRing = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.035, 10, 32), matPrimary);
      auraRing.rotation.x = Math.PI / 2;
      auraRing.position.y = 0.16;
      root.add(auraRing);

      // Articulated Body Group
      const body = new THREE.Group();
      root.add(body);

      const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.65, 10), matDark);
      leftLeg.position.set(-0.18, 0.45, 0);
      body.add(leftLeg);

      const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.65, 10), matDark);
      rightLeg.position.set(0.18, 0.45, 0);
      body.add(rightLeg);

      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.20, 0.72, 12), matDark);
      torso.position.y = 1.08;
      body.add(torso);

      const coreGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), matSecondary);
      coreGem.position.set(0, 1.12, 0.22);
      body.add(coreGem);

      const leftArm = new THREE.Group();
      leftArm.position.set(-0.36, 1.32, 0);
      const lArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.55, 10), matPrimary);
      lArmMesh.position.y = -0.22;
      leftArm.add(lArmMesh);
      body.add(leftArm);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.36, 1.32, 0);
      const rArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.55, 10), matPrimary);
      rArmMesh.position.y = -0.22;
      rightArm.add(rArmMesh);
      body.add(rightArm);

      // Weapon in Right Hand
      const weaponGroup = new THREE.Group();
      weaponGroup.position.set(0, -0.45, 0.18);
      const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.35, 8), matGold);
      staff.rotation.x = Math.PI / 5;
      weaponGroup.add(staff);
      const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), matSecondary);
      tip.position.set(0, 0.55, 0.35);
      weaponGroup.add(tip);
      rightArm.add(weaponGroup);

      // Head & Visor
      const headGroup = new THREE.Group();
      headGroup.position.y = 1.65;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), matDark);
      headGroup.add(head);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.09, 0.16), matSecondary);
      visor.position.set(0, 0.02, 0.18);
      headGroup.add(visor);
      body.add(headGroup);

      // Archetype-Specific 3D Anatomy (Tails, Wings, Tentacles, Stinger, Ears, Kasa Hat, Halo)
      const backAttachment = new THREE.Group();
      backAttachment.position.set(0, 1.2, -0.18);
      body.add(backAttachment);

      const arch = ag.archetype;
      if (arch === 'nine_tail_fox') {
        for (let t = 0; t < 9; t++) {
          const ang = ((t - 4) / 4.5) * 1.25;
          const tail = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.85, 8), t % 2 === 0 ? matPrimary : matSecondary);
          tail.position.set(Math.sin(ang) * 0.42, -0.1 + Math.cos(ang) * 0.25, -0.15);
          tail.rotation.z = -ang;
          tail.rotation.x = -0.45;
          backAttachment.add(tail);
        }
      } else if (arch === 'mecha_dragon' || arch === 'valkyrie_owl' || arch === 'thunder_eagle' || arch === 'seraph_oculus' || arch === 'winged_runner') {
        const wingPairs = arch === 'seraph_oculus' ? 3 : 1;
        for (let w = 0; w < wingPairs; w++) {
          [-1, 1].forEach(side => {
            const wing = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.22, 0.04), w % 2 === 0 ? matPrimary : matSecondary);
            wing.position.set(side * 0.52, 0.22 - w * 0.22, -0.05);
            wing.rotation.z = side * (0.35 - w * 0.18);
            backAttachment.add(wing);
          });
        }
      } else if (arch === 'scorpion_mecha') {
        for (let s = 0; s < 6; s++) {
          const seg = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), matPrimary);
          const a = (s / 5) * Math.PI * 0.85;
          seg.position.set(0, Math.sin(a) * 0.85, -Math.cos(a) * 0.45);
          backAttachment.add(seg);
        }
        const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 8), matGold);
        stinger.position.set(0, 0.78, 0.22);
        stinger.rotation.x = Math.PI / 2;
        backAttachment.add(stinger);
      } else if (arch === 'cyber_kraken') {
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          const tent = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.02, 0.9, 8), k % 2 === 0 ? matPrimary : matSecondary);
          tent.position.set(Math.cos(a) * 0.45, -0.35, Math.sin(a) * 0.35);
          tent.rotation.z = Math.cos(a) * 0.55;
          backAttachment.add(tent);
        }
      } else {
        const halo = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.03, 8, 24), matGold);
        halo.position.set(0, 0.25, -0.05);
        backAttachment.add(halo);
      }

      // Headgear specifics
      if (arch === 'cyber_ronin') {
        const kasa = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.18, 16), matPrimary);
        kasa.position.y = 0.22;
        headGroup.add(kasa);
      } else if (arch === 'wolf_archon' || arch === 'cyber_werewolf' || arch === 'cyber_shiba' || arch === 'cyber_neko' || arch === 'nine_tail_fox') {
        [-1, 1].forEach(side => {
          const ear = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 6), matPrimary);
          ear.position.set(side * 0.16, 0.28, 0);
          ear.rotation.z = -side * 0.2;
          headGroup.add(ear);
        });
      }

      // Companion Pet Floating Mesh
      const petGroup = new THREE.Group();
      petGroup.position.set(-0.78, 1.45, 0.25);
      const petCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 1), matSecondary);
      const petRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 8, 20), matGold);
      petRing.rotation.x = Math.PI / 3;
      petGroup.add(petCore, petRing);
      root.add(petGroup);

      // 3D Ability VFX Group (visible & animated dynamically during Ability / Ultimate)
      const vfxGroup = new THREE.Group();
      vfxGroup.position.set(0, 1.15, 0);
      for (let i = 0; i < 6; i++) {
        const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), i % 2 === 0 ? matPrimary : matSecondary);
        const a = (i / 6) * Math.PI * 2;
        orb.position.set(Math.cos(a) * 0.9, Math.sin(a * 2) * 0.25, Math.sin(a) * 0.9);
        vfxGroup.add(orb);
      }
      const vfxBeam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.38, 2.6, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: c2, wireframe: true, transparent: true, opacity: 0.65 })
      );
      vfxBeam.rotation.x = Math.PI / 2;
      vfxBeam.position.z = 1.1;
      vfxGroup.add(vfxBeam);
      root.add(vfxGroup);

      return {
        root,
        body,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        headGroup,
        backAttachment,
        petGroup,
        auraRing,
        vfxGroup,
        vfxBeam
      };
    }

    rebuild3DCharacter() {
      if (!this.threeCharGroup || !window.THREE) return;
      while (this.threeCharGroup.children.length > 0) {
        this.threeCharGroup.remove(this.threeCharGroup.children[0]);
      }
      const ag = this.agentMap[this.selectedAgentId] || this.roster[0];
      if (this.threeRimLight) {
        this.threeRimLight.color.setHex(hexToInt(ag.secondaryColor));
      }
      this.threeRig = this.buildBespoke3DCharacterRig(ag);
      this.threeCharGroup.add(this.threeRig.root);
    }

    render3DStage(ag, stMeta) {
      if (!this.threeRenderer || !this.threeScene || !this.threeCamera || !this.threeRig) return;

      const t = this.stageClock;
      const rig = this.threeRig;
      const st = this.selectedStateKey;

      if (!this.isDragging3D) {
        this.threeRotY += st === 'ultimate' ? 0.035 : 0.01;
      }
      this.threeCharGroup.rotation.y = this.threeRotY;
      this.threeCharGroup.rotation.x = this.threeRotX;

      // State-specific 3D articulated choreography
      if (st === 'idle') {
        rig.body.position.y = Math.sin(t * 3) * 0.05;
        rig.leftLeg.rotation.x = 0;
        rig.rightLeg.rotation.x = 0;
        rig.leftArm.rotation.x = Math.sin(t * 2.5) * 0.12;
        rig.rightArm.rotation.x = -Math.sin(t * 2.5) * 0.12;
        rig.vfxGroup.visible = false;
      } else if (st === 'walk') {
        rig.body.position.y = Math.abs(Math.sin(t * 8)) * 0.09;
        rig.leftLeg.rotation.x = Math.sin(t * 8) * 0.55;
        rig.rightLeg.rotation.x = -Math.sin(t * 8) * 0.55;
        rig.leftArm.rotation.x = -Math.sin(t * 8) * 0.45;
        rig.rightArm.rotation.x = Math.sin(t * 8) * 0.45;
        rig.vfxGroup.visible = false;
      } else if (st === 'work') {
        rig.body.position.y = Math.sin(t * 6) * 0.04;
        rig.leftArm.rotation.x = -0.6 + Math.sin(t * 12) * 0.35;
        rig.rightArm.rotation.x = -0.6 - Math.sin(t * 12) * 0.45;
        rig.vfxGroup.visible = true;
        rig.vfxBeam.visible = false;
        rig.vfxGroup.rotation.y += 0.06;
      } else if (st === 'ability') {
        rig.body.position.y = 0.18 + Math.sin(t * 6) * 0.08;
        rig.rightArm.rotation.x = -1.25;
        rig.leftArm.rotation.x = -0.85;
        rig.vfxGroup.visible = true;
        rig.vfxBeam.visible = true;
        rig.vfxGroup.rotation.y += 0.12;
        rig.vfxBeam.scale.setScalar(1 + Math.sin(t * 14) * 0.25);
      } else if (st === 'ultimate') {
        rig.body.position.y = 0.38 + Math.sin(t * 8) * 0.12;
        rig.rightArm.rotation.z = -0.85;
        rig.leftArm.rotation.z = 0.85;
        rig.vfxGroup.visible = true;
        rig.vfxBeam.visible = true;
        rig.vfxGroup.rotation.y += 0.22;
        rig.vfxGroup.rotation.x = Math.sin(t * 5) * 0.4;
        rig.auraRing.scale.setScalar(1.35 + Math.sin(t * 10) * 0.2);
      } else if (st === 'meditate') {
        rig.body.position.y = 0.32 + Math.sin(t * 2.2) * 0.1;
        rig.leftLeg.rotation.x = -0.7;
        rig.rightLeg.rotation.x = -0.7;
        rig.leftArm.rotation.x = -0.5;
        rig.rightArm.rotation.x = -0.5;
        rig.vfxGroup.visible = true;
        rig.vfxBeam.visible = false;
        rig.vfxGroup.rotation.y += 0.03;
      }

      if (rig.backAttachment) {
        rig.backAttachment.rotation.z = Math.sin(t * 4) * 0.08;
      }
      if (rig.petGroup) {
        rig.petGroup.position.y = 1.45 + Math.sin(t * 4.5) * 0.14;
        rig.petGroup.rotation.y += 0.04;
      }
      rig.auraRing.rotation.z += 0.03;

      this.threeRenderer.render(this.threeScene, this.threeCamera);
    }

    // =========================================================================
    // LIVE 3D PLANET SURFACE ABILITY CASTING & BESPOKE AGENT RIG UPGRADES
    // =========================================================================
    castAbilityOnPlanet(agentId) {
      const ag = this.agentMap[agentId] || this.roster[0];
      this.closeArena();

      const sw = window.sphereWorld;
      if (!sw || !sw.scene || !window.THREE) return;

      // Focus camera onto the agent on the 3D sphere
      if (typeof sw.presentAgent === 'function') {
        sw.presentAgent(ag.id);
      }

      const ent = sw.entityById ? sw.entityById(ag.id) : (sw.agentEntities && sw.agentEntities[ag.id]);
      if (!ent) return;

      const THREE = window.THREE;
      const c1 = hexToInt(ag.color);
      const c2 = hexToInt(ag.secondaryColor);

      const burstGroup = new THREE.Group();
      burstGroup.position.copy(ent.position);
      burstGroup.quaternion.copy(ent.quaternion);

      // Expanding Shockwave Torus
      const ringGeo = new THREE.TorusGeometry(1.2, 0.14, 12, 36);
      const ringMat = new THREE.MeshBasicMaterial({ color: c1, transparent: true, opacity: 0.95 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.6;
      burstGroup.add(ringMesh);

      // Secondary Harmonic Ring
      const ring2Mesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.1, 10, 32),
        new THREE.MeshBasicMaterial({ color: c2, transparent: true, opacity: 0.9 })
      );
      ring2Mesh.rotation.x = Math.PI / 2;
      ring2Mesh.position.y = 1.8;
      burstGroup.add(ring2Mesh);

      // Vertical Sky-Beam Pillar
      const beamGeo = new THREE.CylinderGeometry(0.35, 1.15, 22, 16, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: c2,
        wireframe: true,
        transparent: true,
        opacity: 0.75
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.y = 11;
      burstGroup.add(beamMesh);

      sw.scene.add(burstGroup);

      // Spawn 3D speech bubble announcing the ability cast
      if (typeof sw.spawnSpeechBubble === 'function') {
        sw.spawnSpeechBubble(ag.name, `⚡ ${ag.abilitySpec.name}: ${ag.abilitySpec.damageOrEffect}!`);
      }

      const startTime = performance.now();
      const duration = 3600;
      const animateBurst = (now) => {
        const elapsed = now - startTime;
        const p = Math.min(1, elapsed / duration);
        const scale = 1 + p * 7.5;
        ringMesh.scale.set(scale, scale, 1);
        ringMat.opacity = Math.max(0, (1 - p) * 0.95);

        ring2Mesh.scale.set(1 + p * 5.2, 1 + p * 5.2, 1);
        ring2Mesh.position.y = 1.2 + p * 8.0;
        ring2Mesh.material.opacity = Math.max(0, (1 - p) * 0.9);

        beamMesh.rotation.y += 0.08;
        beamMat.opacity = Math.max(0, (1 - p) * 0.75);

        if (p < 1) {
          requestAnimationFrame(animateBurst);
        } else {
          sw.scene.remove(burstGroup);
        }
      };
      requestAnimationFrame(animateBurst);
    }

    startPlanetUpgradeLoop() {
      // Periodically attach bespoke 3D archetype back-items/headgear to the 21 agents on window.sphereWorld
      setInterval(() => {
        const sw = window.sphereWorld;
        if (!sw || !sw.agentEntities || !window.THREE) return;
        const THREE = window.THREE;

        this.roster.forEach(ag => {
          const ent = sw.agentEntities[ag.id];
          if (!ent || ent.userData._pantheonArchetypeUpgraded) return;
          ent.userData._pantheonArchetypeUpgraded = true;

          const c1 = hexToInt(ag.color);
          const c2 = hexToInt(ag.secondaryColor);
          const mat1 = new THREE.MeshStandardMaterial({ color: c1, emissive: c1, emissiveIntensity: 0.55, roughness: 0.3 });
          const mat2 = new THREE.MeshStandardMaterial({ color: c2, emissive: c2, emissiveIntensity: 0.65, roughness: 0.25 });

          const badgeGroup = new THREE.Group();
          badgeGroup.position.set(0, 1.45, -0.25);

          if (ag.archetype === 'nine_tail_fox') {
            for (let t = 0; t < 9; t++) {
              const ang = ((t - 4) / 4.5) * 1.15;
              const tail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.7, 6), t % 2 === 0 ? mat1 : mat2);
              tail.position.set(Math.sin(ang) * 0.35, Math.cos(ang) * 0.2, -0.1);
              tail.rotation.z = -ang;
              badgeGroup.add(tail);
            }
          } else if (ag.archetype === 'mecha_dragon' || ag.archetype === 'valkyrie_owl' || ag.archetype === 'thunder_eagle' || ag.archetype === 'seraph_oculus') {
            [-1, 1].forEach(side => {
              const wing = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.2, 0.04), mat1);
              wing.position.set(side * 0.45, 0.15, 0);
              wing.rotation.z = side * 0.32;
              badgeGroup.add(wing);
            });
          } else if (ag.archetype === 'scorpion_mecha') {
            const tail = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.85, 6), mat2);
            tail.position.set(0, 0.55, 0.1);
            tail.rotation.x = Math.PI / 3;
            badgeGroup.add(tail);
          } else {
            const halo = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 6, 18), mat2);
            halo.position.set(0, 0.25, 0);
            badgeGroup.add(halo);
          }

          if (ent.userData.bodyMesh) {
            ent.userData.bodyMesh.add(badgeGroup);
          } else {
            ent.add(badgeGroup);
          }
        });
      }, 2200);
    }
  }

  function bootPantheonCharacterEngine() {
    if (!window.pantheonCharacterEngine) {
      window.pantheonCharacterEngine = new PantheonCharacterEngine();
      window.openPantheonArena = (id, state) => window.pantheonCharacterEngine.openArena(id, state);
      console.log('⚔️ [Zoth Pantheon 21] Quad-Engine Character, Animation & Ability Studio online.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootPantheonCharacterEngine);
  } else {
    bootPantheonCharacterEngine();
  }
})();
