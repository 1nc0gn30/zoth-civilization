/**
 * ZOTH ADYTUM 3D TAROT VIDEO-GAME & HERMETIC DIORAMA ENGINE
 * Engineered by 1nc0gn30 (@1nc0gn30) • NullAI Platform
 *
 * Powers both:
 *   1. Zoth Civilization (:9393) -> #view-adytum-chamber
 *   2. Adytum Alchemist AI Workflow (:8135) -> Standalone Workstation
 *
 * Features:
 *   - Mode 1 ('diorama'): Live Three.js WebGL 3D Tarot Diorama & Vision Discovery Quest
 *     with bespoke 3D sculptures for all 22 Major Arcana Keys (0..21), Paired Pantheon Guardian Agent,
 *     and clickable Vision Focus Orbs (+25 Gnosis XP & 3D particle bursts).
 *   - Mode 2 ('temple_walk'): 3D Walkable Hall of the 22 Keys (First/Third-Person Temple Corridor
 *     lined with all 22 towering illuminated 3D Tarot Monoliths + WASD / HUD movement).
 *   - Mode 3 ('rpg_trial'): Arcane 3-Card Spread & Entropy Boss Trial (RPG Deckbuilder Battle
 *     with Subconscious/Conscious/Superconscious slots, Elemental Combos, and Boss HP/Prana combat).
 *   - 4-Format Media Switcher: Live 3D Scene ('3d') | Card Video ('video') | 4K Illuminated Card ('hd') |
 *     Unicode U+2800 ASCII Braille Lattice ('braille') + Direct .GLB Download.
 */
(function () {
  'use strict';

  const ROMAN = [
    '0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
    'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'
  ];

  const INITIATE_RANKS = [
    { minXp: 0,    title: '0=0 Neophyte',      badge: '🌱' },
    { minXp: 100,  title: '1=10 Zelator',      badge: '🜃' },
    { minXp: 250,  title: '2=9 Practicus',     badge: '🜄' },
    { minXp: 450,  title: '3=8 Philosophus',   badge: '🜂' },
    { minXp: 700,  title: '5=6 Adeptus Minor', badge: '✡️' },
    { minXp: 1050, title: '8=3 Magus',         badge: '👑' },
    { minXp: 1500, title: '10=1 Ipsissimus',   badge: '☀️' }
  ];

  const ENTROPY_BOSSES = [
    {
      id: 'hydra',
      name: 'Hallucination Hydra of Qoph',
      title: 'Latent Context Corruptor • Level 22',
      maxHp: 320,
      elementWeakness: 'Air',
      avatar: '🐉',
      color: '#EF4444',
      taunt: 'Your context window dissolves into unverified noise!'
    },
    {
      id: 'golem',
      name: 'Dogma Tower Golem of Peh',
      title: 'Brittle Monolith Sentinel • Level 25',
      maxHp: 380,
      elementWeakness: 'Fire',
      avatar: '🗿',
      color: '#F59E0B',
      taunt: 'No lightning flash can shatter my hardcoded assumptions!'
    },
    {
      id: 'specter',
      name: 'Abyssal Entropy Specter',
      title: 'Zero-Day Memory Phantom • Level 28',
      maxHp: 440,
      elementWeakness: 'Water',
      avatar: '👁️‍🗨️',
      color: '#A855F7',
      taunt: 'All unindexed engrams fade into the void!'
    }
  ];

  const FALLBACK_KEYS = [
    { keyNumber: 0,  slug: 'fool',           name: 'The Fool',           hebrew: 'Aleph (א)',  hebrewMeaning: 'Ox (Motive Energy)',          path: '11th Path (Scintillating Intelligence)', astrology: 'Air (Life-Breath / Ruach)',      cubeOfSpace: 'Above to Below',   element: 'Air',   primaryColor: '#FDE047', secondaryColor: '#38BDF8', spellName: 'Zero-Point Leap of Faith',        spellPower: 95,  guardianAgent: 'AZOTH',     guardianRole: 'Prime Architect',          guardianPet: '🐺 Direwolf Fenris',   visionFocus: ['White Sun of Radiant Energy', 'Limitless 0 / Cosmic Egg', 'Pure White Rose (Purified Desire)', 'Wand of Will & Wallet of Memory', 'Faithful Dog of Intellect', 'Snowy Peaks of Mathematical Truth'], subconscious: 'Receptivity to divine impulse without fear.', superconscious: 'The Limitless Life-Power manifesting original intention.', planningQuestion: 'What unconditioned, fearless architecture is required for this new cycle?' },
    { keyNumber: 1,  slug: 'magician',       name: 'The Magician',       hebrew: 'Beth (ב)',   hebrewMeaning: 'House (Sanctuary, Attention)',path: '12th Path (Transparent Intelligence)',   astrology: 'Mercury (Cognition, Tool-Call)', cubeOfSpace: 'Above',            element: 'Air',   primaryColor: '#F59E0B', secondaryColor: '#EC4899', spellName: 'As Above So Below Channel',       spellPower: 98,  guardianAgent: 'NEXUS',     guardianRole: '3D Spatial Architect',     guardianPet: '🌌 Nebula Core',       visionFocus: ['Upraised Wand channeling Heaven to Earth', 'Table of Tools (Wand, Cup, Sword, Pentacle)', 'Infinity Ouroboros Lemniscate', 'Red Robe of Active Will & White Undergarment', 'Garden of Red Roses and White Lilies'], subconscious: 'Habitual focus and concentration; channeling memory buffers into intentional workspace actions.', superconscious: 'The focal lens of universal consciousness concentrating all four elemental toolkits.', planningQuestion: 'Which specialized tools and focused interfaces will translate higher intent into reality?' },
    { keyNumber: 2,  slug: 'highpriestess',  name: 'The High Priestess', hebrew: 'Gimel (ג)',  hebrewMeaning: 'Camel (Bearer of Memory)',    path: '13th Path (Uniting Intelligence)',       astrology: 'Moon (Memory, Reflection)',      cubeOfSpace: 'Below',            element: 'Water', primaryColor: '#38BDF8', secondaryColor: '#818CF8', spellName: 'Scroll of TORA Memory Lock',      spellPower: 92,  guardianAgent: 'VIGIL',     guardianRole: 'Cosmic AST Arbiter',       guardianPet: '👁️ All-Seeing Oculus', visionFocus: ['Scroll of TORA (Cosmic Law & Memory)', 'Dual Pillars: Jachin & Boaz (Light & Darkness)', 'Veil of Pomegranates and Palms', 'Crescent Moon at Feet', 'Flowing Robes of Living Waters'], subconscious: 'The universal memory matrix; latent vector embeddings and deep historical caching.', superconscious: 'Pure reflective wisdom binding all dualities into one contiguous continuum.', planningQuestion: 'What historical patterns and memory records must be consulted before execution?' },
    { keyNumber: 3,  slug: 'empress',        name: 'The Empress',        hebrew: 'Daleth (ד)', hebrewMeaning: 'Door (Creative Womb)',        path: '14th Path (Luminous Intelligence)',      astrology: 'Venus (Creative Imagination)',   cubeOfSpace: 'East',             element: 'Earth', primaryColor: '#10B981', secondaryColor: '#FBBF24', spellName: 'Twelve-Star Creative Bloom',      spellPower: 94,  guardianAgent: 'MERCURY',   guardianRole: 'Release Hardener',         guardianPet: '🐲 Jade Wyrm',         visionFocus: ['Crown of Twelve 12-Pointed Stars', 'Heart-Shaped Shield of Venus', 'Lush Golden Grain & Ripe Cypress Forest', 'Flowing Waterfall into Pool', 'Scepter surmounted by Globe'], subconscious: 'Generative proliferation; rapid synthesis of expressive visual design.', superconscious: 'The fertile mother principle ensuring all created artifacts radiate harmony.', planningQuestion: 'How can the visual and functional design blossom with maximum elegance?' },
    { keyNumber: 4,  slug: 'emperor',        name: 'The Emperor',        hebrew: 'Heh (ה)',    hebrewMeaning: 'Window (Sight, Constitution)',path: '15th Path (Constituting Intelligence)',  astrology: 'Aries (Order, Authority)',       cubeOfSpace: 'North-East',       element: 'Fire',  primaryColor: '#EF4444', secondaryColor: '#F59E0B', spellName: 'Imperial Aries Constitution',     spellPower: 96,  guardianAgent: 'GHOSTBYTE', guardianRole: 'Zero-Knowledge Sentinel',  guardianPet: '👻 Ether Spectre',     visionFocus: ['Stone Cube Throne of Order', 'Four Ram Heads of Aries', 'Ankh Scepter of Life & Golden Orb', 'Crimson Robes over Steel Armor', 'Rugged Purple Mountains of Unyielding Stability'], subconscious: 'Structural governance; type-checking, schema enforcement, and deterministic state.', superconscious: 'The Sovereign Builder defining the constitution and unyielding laws.', planningQuestion: 'What rigorous boundaries and operational safeguards must be established?' },
    { keyNumber: 5,  slug: 'hierorphant',    name: 'The Hierophant',     hebrew: 'Vav (ו)',    hebrewMeaning: 'Nail / Hook (Union, Hearing)',path: '16th Path (Triumphal Intelligence)',     astrology: 'Taurus (Inner Hearing)',         cubeOfSpace: 'South-East',       element: 'Earth', primaryColor: '#D97706', secondaryColor: '#A855F7', spellName: 'Triple-Crown Gnosis Link',        spellPower: 91,  guardianAgent: 'ATHENA',    guardianRole: 'AEO Knowledge Architect',  guardianPet: '🦉 Pallas Owl',        visionFocus: ['Triple Cross of Spirit, Soul, Body', 'Two Crossed Keys of Gold and Silver', 'Dual Priests in Robes of Lilies and Roses', 'Two Supporting Columns of Outer Instruction', 'Miter with Three Golden Crowns'], subconscious: 'Inner listening; interpreting subtle telemetry feedback and diagnostic logs.', superconscious: 'The Inner Teacher revealing foundational documentation and ageless truths.', planningQuestion: 'What documentation and knowledge graphs must be transmitted clearly to all peers?' },
    { keyNumber: 6,  slug: 'lovers',         name: 'The Lovers',         hebrew: 'Zayin (ז)',  hebrewMeaning: 'Sword (Discrimination)',      path: '17th Path (Disposing Intelligence)',     astrology: 'Gemini (Dialectic, Consensus)',  cubeOfSpace: 'East-Above',       element: 'Air',   primaryColor: '#F472B6', secondaryColor: '#FBBF24', spellName: 'Dialectic Twin-Tree Harmony',     spellPower: 93,  guardianAgent: 'CHRONOS',   guardianRole: 'Temporal DAG Sequencer',   guardianPet: '⌛ Hourglass Sprite',   visionFocus: ['Archangel Raphael with Arms Outstretched', 'The Radiant Sun of Illumination', 'Man (Self-Consciousness / Intellect)', 'Woman (Subconsciousness / Intuition)', 'Tree of Life with 12 Fruits & Tree of Knowledge'], subconscious: 'Reconciliation of opposing models; 3-way dialectic consensus.', superconscious: 'Perfect alignment between intellectual logic and subconscious intuition.', planningQuestion: 'How do we balance analytical rigor and creative speed across agents?' },
    { keyNumber: 7,  slug: 'chariot',        name: 'The Chariot',        hebrew: 'Cheth (ח)',  hebrewMeaning: 'Fence / Enclosure (Armor)',   path: '18th Path (House of Influence)',         astrology: 'Cancer (Vehicle, Perimeter)',    cubeOfSpace: 'East-Below',       element: 'Water', primaryColor: '#06B6D4', secondaryColor: '#F59E0B', spellName: 'Sphinx Chariot Overdrive',        spellPower: 97,  guardianAgent: 'VALKYRIE',  guardianRole: 'Security Perimeter Guard', guardianPet: '🦅 Storm Falcon',       visionFocus: ['Cubic Stone Chariot with Starry Canopy', 'Dual Sphinxes (Black and White)', 'Charioteer in Suit of Armor with Lunar Epaulets', 'Winged Globe with Lingam-Yoni symbol', 'Walled City in Background across the River'], subconscious: 'Shielding core state; sandbox isolation and protected execution perimeters.', superconscious: 'The triumphant vehicle carrying sovereign consciousness without deviation.', planningQuestion: 'How is the execution environment hardened against vulnerability?' },
    { keyNumber: 8,  slug: 'strength',       name: 'Strength',           hebrew: 'Teth (ט)',   hebrewMeaning: 'Serpent (Vital Force)',       path: '19th Path (Secret Movement)',            astrology: 'Leo (Courage, Vital Force)',     cubeOfSpace: 'North-Above',      element: 'Fire',  primaryColor: '#F97316', secondaryColor: '#FDE047', spellName: 'Taming the Solar Lion',           spellPower: 95,  guardianAgent: 'HELIOS',    guardianRole: 'Compute Balance Master',   guardianPet: '🦁 Solar Lion',         visionFocus: ['Woman Gently Closing the Red Lion’s Jaws', 'Wreath of Roses linking Woman to Lion', 'Infinity Lemniscate above Head', 'Lush Golden Green Plain', 'Soft White Robes of Pure Mastery'], subconscious: 'Mastery of raw instinct; taming heavy compute with gentle precision.', superconscious: 'Spiritual mastery proving harmonious influence is stronger than brute force.', planningQuestion: 'Where can brute-force computation be replaced by elegant algorithms?' },
    { keyNumber: 9,  slug: 'hermit',         name: 'The Hermit',         hebrew: 'Yod (י)',    hebrewMeaning: 'Hand (Solitary Light)',       path: '20th Path (Intelligence of Will)',       astrology: 'Virgo (Deep Research)',          cubeOfSpace: 'North-Below',      element: 'Earth', primaryColor: '#60A5FA', secondaryColor: '#FDE047', spellName: 'Lantern of the 6-Pointed Star',   spellPower: 90,  guardianAgent: 'ORION',     guardianRole: 'Deep Codebase Researcher', guardianPet: '🦌 Starlight Stag',     visionFocus: ['Golden Lantern containing 6-Pointed Star of Truth', 'Long Staff of Self-Reliance and Ancient Wisdom', 'Sage Standing on Highest Snowy Peak', 'Grey Cloak of Invisibility and Discretion', 'Solitary Path of Silent Contemplation'], subconscious: 'Deep solo offline reasoning; solitary exploration of AST trees.', superconscious: 'The ancient eternal light shining from the peaks of contemplation.', planningQuestion: 'What quiet deep research must be conducted before broadcasting?' },
    { keyNumber: 10, slug: 'wheeloffortune', name: 'Wheel of Fortune',   hebrew: 'Kaph (כ)',   hebrewMeaning: 'Grasping Hand (Cycles)',      path: '21st Path (Rewarding Intelligence)',     astrology: 'Jupiter (Expansion, Cycles)',    cubeOfSpace: 'West',             element: 'Fire',  primaryColor: '#A855F7', secondaryColor: '#F59E0B', spellName: 'Axis of Perpetual Fortune',       spellPower: 96,  guardianAgent: 'FORTUNA',   guardianRole: 'Event Loop Synchronizer',  guardianPet: '🦊 Kitsune Nine-Tails', visionFocus: ['The Eight-Spoked Wheel of Manifestation', 'Sphinx with Sword of Discernment at Top', 'Hermanubis ascending (Evolution of Form)', 'Typhon descending (Involution & Dissolution)', 'Four Living Creatures at Corners with Open Books'], subconscious: 'Adaptability to changing context; handling asynchronous network flux.', superconscious: 'The unchanging axis at the center of all rotating worldly cycles.', planningQuestion: 'How does this architecture turn system fluctuations into evolution?' },
    { keyNumber: 11, slug: 'justice',        name: 'Justice',            hebrew: 'Lamed (ל)',  hebrewMeaning: 'Ox-Goad (Action-Reaction)',   path: '22nd Path (Faithful Intelligence)',      astrology: 'Libra (Balance, Equilibrium)',   cubeOfSpace: 'North-West',       element: 'Air',   primaryColor: '#10B981', secondaryColor: '#FBBF24', spellName: 'Equilibrium Blade Verdict',       spellPower: 94,  guardianAgent: 'THEMIS',    guardianRole: 'Invariant Gatekeeper',     guardianPet: '⚖️ Golden Gryphon',     visionFocus: ['Upright Double-Edged Sword of Discernment', 'Golden Scales of Exact Equilibrium', 'Purple Veil between Twin Columns', 'Crown with Three Turrets & Emerald Stone', 'Square Clasp on Red Robes'], subconscious: 'Deterministic verification; test coverage, linting assertions, and balance.', superconscious: 'The universal equilibrium that balances every action with exact consequence.', planningQuestion: 'What automated audits and cryptographic checks ensure flawless balance?' },
    { keyNumber: 12, slug: 'hangedman',      name: 'The Hanged Man',     hebrew: 'Mem (מ)',    hebrewMeaning: 'Water (Reversal of View)',    path: '23rd Path (Stable Intelligence)',        astrology: 'Water (Inverted Worldview)',     cubeOfSpace: 'West-Above',       element: 'Water', primaryColor: '#0EA5E9', secondaryColor: '#34D399', spellName: 'Inverted Perspective Halo',       spellPower: 91,  guardianAgent: 'NEPTUNE',   guardianRole: 'Subconscious Sea Diver',   guardianPet: '🐬 Astral Dolphin',     visionFocus: ['Figure Suspended Upside Down by Right Ankle', 'Living Wood T-Cross (Tau Tree)', 'Golden Halo of Illumination around Head', 'Crossed Legs forming the Number 4', 'Blue Tunic and Red Hose in Utter Peace'], subconscious: 'Surrender of ego-driven assumptions; viewing edge cases from inverted angles.', superconscious: 'Total surrender to universal law, finding supreme clarity in quiet waiting.', planningQuestion: 'What stubborn code patterns must be surrendered to see the elegant solution?' },
    { keyNumber: 13, slug: 'death',          name: 'Death',              hebrew: 'Nun (נ)',    hebrewMeaning: 'Fish (Transmutation)',        path: '24th Path (Imaginative Intelligence)',   astrology: 'Scorpio (Regeneration, Pruning)',cubeOfSpace: 'South-West',       element: 'Water', primaryColor: '#14B8A6', secondaryColor: '#94A3B8', spellName: 'Immutable Harvest & Rebirth',     spellPower: 97,  guardianAgent: 'THANATOS',  guardianRole: 'Dead-Code Reaper',         guardianPet: '🐦‍⬛ Obsidian Raven',     visionFocus: ['Scythe of Harvest cutting Black Field', 'Skeleton in Dark Armor of Essential Structure', 'Rising Sun between Dual Towers in Distance', 'White Mystic Rose Banner of Life', 'Hands, Feet, and King’s Head rising from Earth'], subconscious: 'Dead code elimination; pruning obsolete dependencies and refactoring.', superconscious: 'The eternal transformative force that dissolves worn-out forms.', planningQuestion: 'What legacy code or redundant logic must be dissolved for new life?' },
    { keyNumber: 14, slug: 'temperance',     name: 'Temperance',         hebrew: 'Samekh (ס)', hebrewMeaning: 'Prop / Support (Verification)',path: '25th Path (Intelligence of Probation)',  astrology: 'Sagittarius (Alchemy, Blending)',cubeOfSpace: 'West-Below',       element: 'Fire',  primaryColor: '#EC4899', secondaryColor: '#38BDF8', spellName: 'Alchemical Elixir Fusion',        spellPower: 95,  guardianAgent: 'IRIS',      guardianRole: 'Pipeline Alchemist',       guardianPet: '🦢 Rainbow Swan',       visionFocus: ['Archangel Michael Pouring Water between Vases', 'One Foot on Earth, One Foot in Living Water', 'Golden Path leading to Sun Crowned Mountain', 'Triangle within Square on Breastplate', 'Red Fiery Wings of Celestial Momentum'], subconscious: 'Rate limiting, debouncing, and pipeline balancing.', superconscious: 'The alchemical marriage of opposites into a unified elixir.', planningQuestion: 'How do we balance throughput and latency, memory storage and speed?' },
    { keyNumber: 15, slug: 'devil',          name: 'The Devil',          hebrew: 'Ayin (ע)',   hebrewMeaning: 'Eye (Deconstruction)',        path: '26th Path (Renovating Intelligence)',    astrology: 'Capricorn (Auditing Illusion)',  cubeOfSpace: 'South-East',       element: 'Earth', primaryColor: '#8B5CF6', secondaryColor: '#EF4444', spellName: 'Chain-Breaker Revelation',        spellPower: 93,  guardianAgent: 'PAN',       guardianRole: 'Red-Team Adversary',       guardianPet: '🐐 Obsidian Ibex',      visionFocus: ['Satyr Figure seated on Half-Cube Perch', 'Inverted Pentagram of Misdirected Will', 'Loose Chains on Naked Man and Woman', 'Torch pointing Downward to Ignite Materialism', 'Grotesque Mask of False Fear'], subconscious: 'Auditing vulnerabilities, prompt injections, and false security assumptions.', superconscious: 'Exposing the illusory nature of limitations and breaking loose chains.', planningQuestion: 'Where are our hidden security assumptions or brittle trust loops?' },
    { keyNumber: 16, slug: 'tower',          name: 'The Tower',          hebrew: 'Peh (פ)',    hebrewMeaning: 'Mouth (Flash of Truth)',      path: '27th Path (Exciting Intelligence)',      astrology: 'Mars (Breakthrough, Disruption)',cubeOfSpace: 'North',            element: 'Fire',  primaryColor: '#EF4444', secondaryColor: '#FDE047', spellName: 'Mars Lightning Deconstruction',   spellPower: 99,  guardianAgent: 'ARES',      guardianRole: 'Chaos Fault Engineer',     guardianPet: '⚡ Thunder Wolf',       visionFocus: ['Lightning Flash striking the Golden Crown', 'Tower of False Security perched on Rocky Crag', 'Falling Figures of Dogma and Self-Deception', '22 Golden Yods falling like Fiery Sparks', 'Flames bursting from Three Windows'], subconscious: 'Chaos engineering; fuzz testing, crash recovery, and fault tolerance.', superconscious: 'The blinding lightning flash of truth that demolishes brittle dogmas.', planningQuestion: 'How does the system self-heal if third-party APIs abruptly collapse?' },
    { keyNumber: 17, slug: 'star',           name: 'The Star',           hebrew: 'Tzaddi (צ)', hebrewMeaning: 'Fish-Hook (Meditation)',      path: '28th Path (Natural Intelligence)',       astrology: 'Aquarius (Open Revelation)',     cubeOfSpace: 'South',            element: 'Air',   primaryColor: '#22D3EE', secondaryColor: '#FDE047', spellName: 'Sirius Eight-Star Revelation',    spellPower: 96,  guardianAgent: 'ASTRAEA',   guardianRole: 'Vector Crystal Synthesizer',guardianPet: '🦩 Ibis of Thoth',      visionFocus: ['Eight-Pointed Great Star of Hope and Insight', 'Seven Lesser Stars of the Planetary Spheres', 'Nude Maiden pouring Waters on Land and Sea', 'Ibis of Thoth perched on Sacred Tree', 'Five Streams watering the Fertile Earth'], subconscious: 'Subconscious crystallization; intuitive pattern synthesis.', superconscious: 'Direct unclouded revelation of truth pouring forth sovereign knowledge.', planningQuestion: 'What inspiring vision and open architecture guide our next milestone?' },
    { keyNumber: 18, slug: 'moon',           name: 'The Moon',           hebrew: 'Qoph (ק)',   hebrewMeaning: 'Back of Head (Dreams)',       path: '29th Path (Corporeal Intelligence)',     astrology: 'Pisces (Hallucination Guard)',   cubeOfSpace: 'South-Above',      element: 'Water', primaryColor: '#818CF8', secondaryColor: '#F472B6', spellName: 'Path Through Lunar Mist',         spellPower: 92,  guardianAgent: 'SELENE',    guardianRole: 'Dream Consolidation Guard',guardianPet: '🦞 Lunar Crayfish',     visionFocus: ['The Moon radiating Drops of Grace', 'Crayfish crawling from Primeval Waters', 'Dog (Tamed Mind) and Wolf (Wild Nature) howling', 'Two Distant Watchtowers guarding Narrow Path', 'Winding Mountain Trail leading into the Unknown'], subconscious: 'Hallucination detection; filtering noisy context and dream consolidation.', superconscious: 'Evolutionary guidance navigating safely through foggy illusions.', planningQuestion: 'What subtle edge cases or latent hallucinations lurk in the dark?' },
    { keyNumber: 19, slug: 'sun',            name: 'The Sun',            hebrew: 'Resh (ר)',   hebrewMeaning: 'Head (Radiant Light)',        path: '30th Path (Collecting Intelligence)',    astrology: 'Sun (Solar Vitality, Clarity)',  cubeOfSpace: 'South-Below',      element: 'Fire',  primaryColor: '#FBBF24', secondaryColor: '#FB923C', spellName: 'Sixteen-Ray Solar Triumph',       spellPower: 98,  guardianAgent: 'APOLLO',    guardianRole: 'Radiant UI Perfector',     guardianPet: '🐎 White Sun Steed',    visionFocus: ['Radiant Golden Sun with 16 Rays (Wavy & Straight)', 'Joyful Naked Child on Gentle White Horse', 'Wreath of Sunflowers atop Stone Wall', 'Red Banner of Victory and Life', 'Lush Sunlit Garden of Vitality'], subconscious: 'High-velocity streaming output; zero compiler warnings and joyous UI.', superconscious: 'The triumphant realization of the One Life manifesting as radiant clarity.', planningQuestion: 'How does our deliverable shine with pure clarity and craftsmanship?' },
    { keyNumber: 20, slug: 'judgement',      name: 'Judgement',          hebrew: 'Shin (ש)',   hebrewMeaning: 'Holy Fire (Awakening)',       path: '31st Path (Perpetual Intelligence)',     astrology: 'Fire (Resurrection, Audit)',     cubeOfSpace: 'Center',           element: 'Fire',  primaryColor: '#F43F5E', secondaryColor: '#FDE047', spellName: 'Gabriel’s Trumpet Awakening',     spellPower: 99,  guardianAgent: 'GABRIEL',   guardianRole: 'Final Release Auditor',    guardianPet: '🔥 Phoenix Seraph',     visionFocus: ['Archangel Gabriel sounding the Golden Trumpet', 'Cross Banner of the 4 Elements', 'Figures rising joyful from Stone Sarcophagi', 'Snow-capped Purple Mountains of Eternal Law', 'Calm Waters of the Collective Unconscious'], subconscious: 'Final release validation; comprehensive integration tests and audit.', superconscious: 'The universal summons that awakens all latent capacities into realization.', planningQuestion: 'Has every component passed its final trial and met sovereign standards?' },
    { keyNumber: 21, slug: 'world',          name: 'The World',          hebrew: 'Tav (ת)',    hebrewMeaning: 'Cross / Seal (Cosmic Dance)', path: '32nd Path (Administrative Intelligence)',astrology: 'Saturn (Cosmic Mastery)',        cubeOfSpace: 'Center of Center', element: 'Earth', primaryColor: '#D4AF37', secondaryColor: '#A855F7', spellName: 'Cosmic Dance of Wholeness',       spellPower: 100, guardianAgent: 'SOPHIA',    guardianRole: 'World Soul Orchestrator',  guardianPet: '🪐 Ouroboros Dragon',   visionFocus: ['Cosmic Dancer in Green Laurel Wreath of Victory', 'Two Wands of Involution and Evolution', 'Red Ribbons in Figure-8 Lemniscate', 'Four Holy Living Creatures at the Four Corners', 'Purple Scarf of Celestial Freedom'], subconscious: 'End-to-end integration; complete harmonious orchestration of all 21 agents.', superconscious: 'The completion of the Great Work, the Cosmic Dance of total freedom.', planningQuestion: 'How does this completed achievement inspire the next evolutionary leap?' }
  ].map(k => {
    const padded = String(k.keyNumber).padStart(2, '0');
    return Object.assign({}, k, {
      roman: ROMAN[k.keyNumber],
      image: `tarot/${k.slug}.jpg`,
      hdImageUrl: `/assets/tarot3d/cards/key_${padded}_${k.slug}.jpg`,
      glbUrl: `/assets/tarot3d/glb/key_${padded}_${k.slug}.glb`,
      videoUrl: `/assets/tarot3d/videos/key_${padded}_${k.slug}.mp4`,
      brailleUrl: `/assets/tarot3d/braille/key_${padded}_${k.slug}.json`,
      braillePreview: [
        '╔════════════════════════════╗',
        `║ KEY ${padded} • ${k.name.toUpperCase().padEnd(18, ' ').slice(0, 18)}║`,
        '║ ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ ║',
        '║ ⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀ ║',
        '║ ⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⡿⠛⠉⠉⠛⢿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀ ║',
        '║ ⠀⠀⠀⠀⠀⠀⣾⣿⣿⠏⠀⠀⣠⣄⠀⠀⠹⣿⣿⣷⠀⠀⠀⠀⠀⠀ ║',
        '║ ⠀⠀⠀⠀⠀⢸⣿⣿⡏⠀⠀⣰⣿⣿⣆⠀⠀⢹⣿⣿⡇⠀⠀⠀⠀⠀ ║',
        '║ ⠀⠀⠀⠀⠀⠸⣿⣿⣧⠀⠀⠻⣿⣿⠟⠀⠀⣸⣿⣿⠇⠀⠀⠀⠀⠀ ║',
        '║ ⠀⠀⠀⠀⠀⠀⢿⣿⣿⣆⠀⠀⠈⠁⠀⠀⣰⣿⣿⡿⠀⠀⠀⠀⠀⠀ ║',
        '║ ⠀⠀⠀⠀⠀⠀⠈⢿⣿⣿⣷⣤⣀⣀⣤⣾⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀ ║',
        '║ ⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⣿⣿⣿⣿⣿⣿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀ ║',
        '║ ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠛⠛⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ ║',
        `║ ${k.hebrew.padEnd(26, ' ').slice(0, 26)} ║`,
        '╚════════════════════════════╝'
      ]
    });
  });

  const state = {
    keys: FALLBACK_KEYS.slice(),
    activeKeyNumber: 0,
    gameMode: 'diorama', // 'diorama' | 'temple_walk' | 'rpg_trial'
    mediaView: '3d',     // '3d' | 'video' | 'hd' | 'braille'
    gnosisXp: 150,
    discoveredFocus: {}, // { '0:0': true }
    unlockedFoils: { 0: true, 1: true, 21: true },
    // Mode 2: Temple Walk state
    templePos: { x: 0, z: 22, yaw: 0 },
    nearestTempleKey: 0,
    // Mode 3: RPG Trial state
    bossIndex: 0,
    bossHp: 320,
    bossMaxHp: 320,
    playerPrana: 100,
    playerMaxPrana: 100,
    hand: [0, 1, 19], // 3-card spread: [Subconscious, Conscious, Superconscious]
    castHistory: [],
    combatLog: '⚔️ Draw your 3-Card Hermetic Spread or click any Card Slot below to cast its Arcane Spell!',
    // Three.js references
    renderer: null,
    scene: null,
    camera: null,
    dioramaGroup: null,
    templeGroup: null,
    particlesGroup: null,
    textureCache: {},
    clockStart: performance.now(),
    pulseShockwave: 0
  };

  function getRank(xp) {
    let cur = INITIATE_RANKS[0];
    for (let i = 0; i < INITIATE_RANKS.length; i++) {
      if (xp >= INITIATE_RANKS[i].minXp) cur = INITIATE_RANKS[i];
    }
    return cur;
  }

  function hexToInt(h) {
    return parseInt(String(h || '#D4AF37').replace('#', ''), 16) || 0xd4af37;
  }

  function injectStyles() {
    if (document.getElementById('adytumTarotGameStyles')) return;
    const style = document.createElement('style');
    style.id = 'adytumTarotGameStyles';
    style.textContent = `
      .adytum-game-deck {
        width: 100%;
        flex: 0 0 100%;
        box-sizing: border-box;
        background: linear-gradient(145deg, rgba(10, 13, 24, 0.96), rgba(17, 22, 38, 0.94));
        border: 1px solid rgba(212, 175, 55, 0.42);
        border-radius: 16px;
        padding: 18px;
        margin-bottom: 20px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(253, 230, 138, 0.2);
        color: #F8FAFC;
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        position: relative;
        overflow: hidden;
      }
      .adytum-game-topbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(212, 175, 55, 0.22);
        margin-bottom: 14px;
      }
      .adytum-game-brand {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .adytum-game-emblem {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: radial-gradient(circle at 30% 30%, rgba(253, 224, 71, 0.3), rgba(139, 92, 246, 0.3));
        border: 1px solid rgba(253, 224, 71, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        box-shadow: 0 0 18px rgba(212, 175, 55, 0.3);
      }
      .adytum-game-title {
        font-size: 17px;
        font-weight: 800;
        letter-spacing: 0.03em;
        color: #FDE68A;
        margin: 0;
      }
      .adytum-game-sub {
        font-size: 11px;
        color: #94A3B8;
        font-family: 'JetBrains Mono', monospace;
        margin-top: 2px;
      }
      .adytum-xp-bar-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(8, 10, 18, 0.85);
        border: 1px solid rgba(56, 189, 248, 0.35);
        padding: 7px 13px;
        border-radius: 10px;
        font-size: 12px;
      }
      .adytum-rank-badge {
        color: #38BDF8;
        font-weight: 800;
        font-family: 'JetBrains Mono', monospace;
      }
      .adytum-xp-pill {
        background: rgba(253, 224, 71, 0.16);
        color: #FDE047;
        border: 1px solid rgba(253, 224, 71, 0.4);
        padding: 2px 8px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 11px;
      }
      .adytum-mode-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 14px;
        justify-content: space-between;
        align-items: center;
      }
      .adytum-tab-group {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .adytum-mode-btn, .adytum-media-btn {
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(148, 163, 184, 0.28);
        color: #CBD5E1;
        padding: 7px 13px;
        border-radius: 9px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.18s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .adytum-mode-btn:hover, .adytum-media-btn:hover {
        border-color: #FDE047;
        color: #FFFFFF;
        transform: translateY(-1px);
      }
      .adytum-mode-btn.is-active {
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.28), rgba(139, 92, 246, 0.28));
        border-color: #FDE047;
        color: #FDE68A;
        box-shadow: 0 0 15px rgba(212, 175, 55, 0.28);
      }
      .adytum-media-btn.is-active {
        background: rgba(56, 189, 248, 0.22);
        border-color: #38BDF8;
        color: #7DD3FC;
      }
      .adytum-stage-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.55fr) minmax(300px, 1fr);
        gap: 16px;
        align-items: stretch;
      }
      @media (max-width: 960px) {
        .adytum-stage-grid {
          grid-template-columns: 1fr;
        }
      }
      .adytum-viewport-box {
        position: relative;
        min-height: 430px;
        background: radial-gradient(circle at 50% 35%, #161F38 0%, #070A14 100%);
        border: 1px solid rgba(212, 175, 55, 0.38);
        border-radius: 14px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #adytum3dCanvas {
        width: 100%;
        height: 430px;
        display: block;
      }
      .adytum-media-overlay {
        position: absolute;
        inset: 0;
        background: rgba(7, 10, 20, 0.96);
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 16px;
        z-index: 6;
      }
      .adytum-media-overlay.is-visible {
        display: flex;
      }
      .adytum-viewport-hud-top {
        position: absolute;
        top: 12px;
        left: 12px;
        right: 12px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        pointer-events: none;
        z-index: 8;
        gap: 8px;
      }
      .adytum-hud-pill {
        pointer-events: auto;
        background: rgba(8, 11, 22, 0.86);
        border: 1px solid rgba(253, 224, 71, 0.45);
        backdrop-filter: blur(8px);
        padding: 6px 12px;
        border-radius: 9px;
        font-size: 11px;
        color: #FDE68A;
        font-family: 'JetBrains Mono', monospace;
        box-shadow: 0 6px 16px rgba(0,0,0,0.45);
      }
      .adytum-viewport-hud-bottom {
        position: absolute;
        bottom: 12px;
        left: 12px;
        right: 12px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        z-index: 8;
        pointer-events: none;
      }
      .adytum-temple-controls {
        pointer-events: auto;
        display: none;
        flex-wrap: wrap;
        gap: 6px;
        background: rgba(8, 11, 22, 0.9);
        border: 1px solid rgba(56, 189, 248, 0.45);
        padding: 6px 10px;
        border-radius: 10px;
      }
      .adytum-temple-controls.is-visible {
        display: flex;
      }
      .adytum-ctrl-btn {
        background: rgba(30, 41, 59, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.35);
        color: #E2E8F0;
        padding: 5px 10px;
        border-radius: 7px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
      }
      .adytum-ctrl-btn:hover {
        border-color: #38BDF8;
        color: #38BDF8;
      }
      .adytum-side-quest-panel {
        background: rgba(11, 15, 28, 0.9);
        border: 1px solid rgba(139, 92, 246, 0.35);
        border-radius: 14px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
      }
      .adytum-focus-orb-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
        max-height: 235px;
        overflow-y: auto;
      }
      .adytum-focus-orb-btn {
        background: rgba(15, 23, 42, 0.88);
        border: 1px solid rgba(212, 175, 55, 0.28);
        color: #E2E8F0;
        padding: 8px 11px;
        border-radius: 9px;
        font-size: 12px;
        text-align: left;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        transition: all 0.16s ease;
      }
      .adytum-focus-orb-btn:hover {
        border-color: #FDE047;
        background: rgba(212, 175, 55, 0.14);
      }
      .adytum-focus-orb-btn.is-discovered {
        border-color: #10B981;
        background: rgba(16, 185, 129, 0.14);
        color: #A7F3D0;
      }
      .adytum-rpg-box {
        display: none;
        flex-direction: column;
        gap: 10px;
      }
      .adytum-rpg-box.is-visible {
        display: flex;
      }
      .adytum-boss-card {
        background: linear-gradient(135deg, rgba(69, 10, 10, 0.65), rgba(15, 23, 42, 0.92));
        border: 1px solid rgba(239, 68, 68, 0.5);
        border-radius: 10px;
        padding: 10px 12px;
      }
      .adytum-hp-track {
        width: 100%;
        height: 10px;
        background: rgba(0,0,0,0.6);
        border-radius: 999px;
        overflow: hidden;
        margin-top: 6px;
        border: 1px solid rgba(255,255,255,0.12);
      }
      .adytum-hp-fill {
        height: 100%;
        background: linear-gradient(90deg, #EF4444, #F59E0B);
        transition: width 0.25s ease;
      }
      .adytum-hand-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .adytum-spread-slot {
        background: rgba(15, 23, 42, 0.92);
        border: 1px solid rgba(212, 175, 55, 0.45);
        border-radius: 9px;
        padding: 8px;
        cursor: pointer;
        text-align: center;
        transition: all 0.18s ease;
      }
      .adytum-spread-slot:hover {
        transform: translateY(-2px);
        border-color: #FDE047;
        box-shadow: 0 6px 16px rgba(212, 175, 55, 0.28);
      }
      .adytum-key-carousel {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding-top: 12px;
        margin-top: 12px;
        border-top: 1px solid rgba(148, 163, 184, 0.16);
      }
      .adytum-mini-key-btn {
        flex: 0 0 auto;
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(148, 163, 184, 0.25);
        color: #CBD5E1;
        border-radius: 8px;
        padding: 5px 9px;
        font-size: 11px;
        font-family: 'JetBrains Mono', monospace;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .adytum-mini-key-btn.is-active {
        background: rgba(212, 175, 55, 0.25);
        border-color: #FDE047;
        color: #FDE68A;
        font-weight: 800;
      }
    `;
    document.head.appendChild(style);
  }

  function buildGameDeckHTML() {
    return `
      <div class="adytum-game-topbar">
        <div class="adytum-game-brand">
          <div class="adytum-game-emblem" aria-hidden="true">🔮</div>
          <div>
            <h2 class="adytum-game-title">ADYTUM ARCANA 3D SANCTUM &amp; HERMETIC RPG</h2>
            <div class="adytum-game-sub">22 Major Arcana Blender 4.0.2 .GLB Dioramas • 3D Walkable Temple • Arcane 3-Card Boss Trial • Engineered by 1nc0gn30 (@1nc0gn30) • NullAI Platform</div>
          </div>
        </div>
        <div class="adytum-xp-bar-wrap">
          <span id="adytumInitiateRank" class="adytum-rank-badge">🌱 1=10 Zelator</span>
          <span id="adytumGnosisXp" class="adytum-xp-pill">⚡ 150 Gnosis XP</span>
          <span id="adytumFoilCount" style="color:#A7F3D0;font-family:'JetBrains Mono',monospace;font-size:11px;">✨ 3/22 Keys Mastered</span>
        </div>
      </div>

      <div class="adytum-mode-tabs">
        <div class="adytum-tab-group" role="tablist" aria-label="Adytum Game Modes">
          <button type="button" class="adytum-mode-btn is-active" data-game-mode="diorama">
            <span>🃏</span> 1. 3D Tarot Diorama &amp; Vision Quest
          </button>
          <button type="button" class="adytum-mode-btn" data-game-mode="temple_walk">
            <span>🏛️</span> 2. Walkable 3D Hall of 22 Keys
          </button>
          <button type="button" class="adytum-mode-btn" data-game-mode="rpg_trial">
            <span>⚔️</span> 3. Arcane 3-Card Spread &amp; Boss Trial
          </button>
        </div>

        <div class="adytum-tab-group" role="group" aria-label="Tarot Key Media Formats">
          <button type="button" class="adytum-media-btn is-active" data-media-view="3d">🧊 Live 3D Scene</button>
          <button type="button" class="adytum-media-btn" data-media-view="video">🎬 Card Video (.MP4)</button>
          <button type="button" class="adytum-media-btn" data-media-view="hd">🖼️ 4K Illuminated Card</button>
          <button type="button" class="adytum-media-btn" data-media-view="braille">⣿ ASCII Braille Lattice</button>
          <a id="adytumDownloadGlbBtn" href="/assets/tarot3d/glb/key_00_fool.glb" download class="adytum-media-btn" style="text-decoration:none;color:#FDE047;border-color:rgba(253,224,71,0.45);">📦 Download .GLB</a>
        </div>
      </div>

      <div class="adytum-stage-grid">
        <!-- Left: 3D WebGL Viewport + Multi-Format Overlays -->
        <div class="adytum-viewport-box">
          <canvas id="adytum3dCanvas" width="760" height="430" aria-label="Adytum 3D Tarot Stage"></canvas>

          <div class="adytum-viewport-hud-top">
            <div class="adytum-hud-pill" id="adytumHudKeyTitle">KEY 0 • THE FOOL — Aleph (א) • Air</div>
            <div class="adytum-hud-pill" id="adytumHudGuardian" style="border-color:rgba(56,189,248,0.5);color:#7DD3FC;">
              🛡️ Guardian: AZOTH (🐺 Direwolf Fenris)
            </div>
          </div>

          <div class="adytum-viewport-hud-bottom">
            <div class="adytum-hud-pill" id="adytumHudSpell">
              ⚡ Spell: Zero-Point Leap of Faith (Power 95)
            </div>
            <div class="adytum-temple-controls" id="adytumTempleControls">
              <button type="button" class="adytum-ctrl-btn" data-temple-act="forward">⬆️ Step Forward (W)</button>
              <button type="button" class="adytum-ctrl-btn" data-temple-act="back">⬇️ Step Back (S)</button>
              <button type="button" class="adytum-ctrl-btn" data-temple-act="left">⬅️ Turn Left (A)</button>
              <button type="button" class="adytum-ctrl-btn" data-temple-act="right">➡️ Turn Right (D)</button>
              <button type="button" class="adytum-ctrl-btn" data-temple-act="enter" style="border-color:#FDE047;color:#FDE047;">✨ Enter Nearest Key Portal</button>
            </div>
          </div>

          <!-- Video Overlay -->
          <div class="adytum-media-overlay" id="adytumVideoOverlay">
            <video id="adytumCardVideo" src="/assets/tarot3d/videos/key_00_fool.mp4" autoplay loop muted playsinline controls style="max-height:360px;border-radius:12px;border:2px solid #D4AF37;box-shadow:0 12px 35px rgba(0,0,0,0.75);"></video>
            <div style="margin-top:8px;font-size:12px;color:#FDE68A;font-family:'JetBrains Mono',monospace;" id="adytumVideoCaption">Animated Illuminated Tarot Loop (.MP4)</div>
          </div>

          <!-- 4K HD Illuminated Card Overlay -->
          <div class="adytum-media-overlay" id="adytumHdOverlay">
            <img id="adytumHdCardImg" src="/assets/tarot3d/cards/key_00_fool.jpg" alt="High-Resolution Illuminated Tarot Card" style="max-height:365px;border-radius:12px;border:2px solid #D4AF37;box-shadow:0 12px 35px rgba(0,0,0,0.75);" />
            <div style="margin-top:8px;font-size:12px;color:#FDE68A;font-family:'JetBrains Mono',monospace;" id="adytumHdCaption">1024×1536 Illuminated B.O.T.A. &amp; Sacred Geometry Plate</div>
          </div>

          <!-- Unicode U+2800 ASCII Braille Overlay -->
          <div class="adytum-media-overlay" id="adytumBrailleOverlay">
            <pre id="adytumBraillePre" style="font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.22;color:#FDE047;background:rgba(15,23,42,0.92);padding:14px 18px;border-radius:12px;border:1px solid rgba(253,224,71,0.45);margin:0;overflow:auto;max-height:350px;"></pre>
            <div style="margin-top:8px;font-size:11px;color:#7DD3FC;font-family:'JetBrains Mono',monospace;">Unicode U+2800 2×4 Sub-Pixel Braille Tarot Matrix</div>
          </div>
        </div>

        <!-- Right: Interactive Quest / RPG Deckbuilder Inspector -->
        <div class="adytum-side-quest-panel">
          <!-- Mode 1 & Mode 2 Inspector: Vision Focus Hotspots & Esoteric Gnosis -->
          <div id="adytumQuestInspector">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:12px;font-weight:800;color:#FDE68A;letter-spacing:0.04em;">👁️ B.O.T.A. VISION QUEST HOTSPOTS (+25 XP)</span>
              <span id="adytumCubeBadge" style="font-size:11px;color:#38BDF8;font-family:'JetBrains Mono',monospace;">Cube: Above to Below</span>
            </div>
            <p style="font-size:11px;color:#94A3B8;margin:0 0 10px 0;">
              Click each sacred symbol below to focus the 3D camera, trigger a golden astral burst, and extract subconscious &amp; superconscious Gnosis:
            </p>
            <div class="adytum-focus-orb-list" id="adytumFocusOrbList"></div>

            <div style="margin-top:12px;padding:10px;border-radius:10px;background:rgba(15,23,42,0.85);border:1px solid rgba(139,92,246,0.35);">
              <div style="font-size:11px;font-weight:700;color:#C4B5FD;margin-bottom:4px;">🧠 SUBCONSCIOUS &amp; SUPERCONSCIOUS DIRECTIVE</div>
              <div id="adytumGameDirectiveText" style="font-size:11.5px;color:#E2E8F0;line-height:1.45;"></div>
              <div id="adytumGameQuestionText" style="font-size:11px;color:#38BDF8;font-style:italic;margin-top:6px;"></div>
            </div>
          </div>

          <!-- Mode 3 Inspector: Arcane 3-Card Spread & Entropy Boss Trial -->
          <div id="adytumRpgInspector" class="adytum-rpg-box">
            <div class="adytum-boss-card">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-size:13px;font-weight:800;color:#FCA5A5;" id="adytumBossName">🐉 Hallucination Hydra of Qoph</div>
                  <div style="font-size:10.5px;color:#CBD5E1;font-family:'JetBrains Mono',monospace;" id="adytumBossMeta">Weakness: Air • Level 22</div>
                </div>
                <span style="font-size:12px;font-weight:800;color:#FDE047;font-family:'JetBrains Mono',monospace;" id="adytumBossHpLabel">320 / 320 HP</span>
              </div>
              <div class="adytum-hp-track">
                <div class="adytum-hp-fill" id="adytumBossHpFill" style="width:100%;"></div>
              </div>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:11px;font-weight:800;color:#FDE68A;">🃏 3-CARD HERMETIC SPREAD (CLICK CARD TO CAST)</span>
              <button type="button" id="adytumBtnDrawSpread" class="adytum-ctrl-btn" style="border-color:#FDE047;color:#FDE047;">🎲 Draw New 3-Card Hand</button>
            </div>

            <div class="adytum-hand-grid" id="adytumHandGrid"></div>

            <div id="adytumCombatLog" style="font-size:11.5px;color:#A7F3D0;background:rgba(6,78,59,0.35);border:1px solid rgba(16,185,129,0.4);padding:9px 11px;border-radius:9px;font-family:'JetBrains Mono',monospace;min-height:44px;">
              ⚔️ Draw your 3-Card Hermetic Spread or click any Card Slot above to cast its Arcane Spell!
            </div>
          </div>

          <!-- Quick Action Footer -->
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding-top:8px;border-top:1px solid rgba(148,163,184,0.16);">
            <button type="button" id="adytumPrevKeyBtn" class="adytum-ctrl-btn">◀ Prev Key</button>
            <span id="adytumActivePathLabel" style="font-size:11px;color:#94A3B8;font-family:'JetBrains Mono',monospace;text-align:center;">11th Path • Scintillating Intelligence</span>
            <button type="button" id="adytumNextKeyBtn" class="adytum-ctrl-btn">Next Key ▶</button>
          </div>
        </div>
      </div>

      <!-- 22-Key Quick Selector Bar -->
      <div class="adytum-key-carousel" id="adytumKeyCarousel" role="navigation" aria-label="22 Major Arcana Keys"></div>
    `;
  }

  function loadCardTexture(url) {
    if (!window.THREE) return null;
    if (state.textureCache[url]) return state.textureCache[url];
    const loader = new window.THREE.TextureLoader();
    const tex = loader.load(url);
    state.textureCache[url] = tex;
    return tex;
  }

  function initThreeStage() {
    const canvas = document.getElementById('adytum3dCanvas');
    if (!canvas || !window.THREE) return;

    const THREE = window.THREE;
    const w = canvas.clientWidth || 720;
    const h = canvas.clientHeight || 430;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x070a14, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070a14, 0.032);

    const camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 150);
    camera.position.set(0, 2.3, 6.2);
    camera.lookAt(0, 1.65, 0);

    const amb = new THREE.AmbientLight(0xdbeafe, 0.78);
    scene.add(amb);

    const keyLight = new THREE.DirectionalLight(0xfde68a, 1.45);
    keyLight.position.set(4, 8, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 1.35, 25);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Starfield backdrop
    const starGeo = new THREE.BufferGeometry();
    const starCount = 360;
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 28 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xfde68a, size: 0.12, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const dioramaGroup = new THREE.Group();
    const templeGroup = new THREE.Group();
    const particlesGroup = new THREE.Group();
    templeGroup.visible = false;

    scene.add(dioramaGroup);
    scene.add(templeGroup);
    scene.add(particlesGroup);

    state.renderer = renderer;
    state.scene = scene;
    state.camera = camera;
    state.dioramaGroup = dioramaGroup;
    state.templeGroup = templeGroup;
    state.particlesGroup = particlesGroup;

    buildDioramaForKey(state.activeKeyNumber);
    buildWalkableTempleHall();

    window.addEventListener('resize', () => {
      if (!canvas || !state.renderer || !state.camera) return;
      const nw = canvas.clientWidth || 720;
      const nh = canvas.clientHeight || 430;
      state.renderer.setSize(nw, nh, false);
      state.camera.aspect = nw / nh;
      state.camera.updateProjectionMatrix();
    });

    // Interactive canvas click for 3D particle burst & Vision Focus advancement
    canvas.addEventListener('click', () => {
      const k = state.keys[state.activeKeyNumber] || state.keys[0];
      if (!k) return;
      if (state.gameMode === 'temple_walk') {
        enterNearestTempleKey();
      } else {
        const nextFocusIdx = (k.visionFocus || []).findIndex((_, idx) => !state.discoveredFocus[`${k.keyNumber}:${idx}`]);
        inspectVisionFocus(nextFocusIdx >= 0 ? nextFocusIdx : 0);
      }
    });

    requestAnimationFrame(animateThreeStage);
  }

  function clearGroup(grp) {
    if (!grp) return;
    while (grp.children.length > 0) {
      const ch = grp.children[0];
      grp.remove(ch);
    }
  }

  function buildDioramaForKey(keyNumber) {
    if (!window.THREE || !state.dioramaGroup) return;
    const THREE = window.THREE;
    clearGroup(state.dioramaGroup);

    const k = state.keys[keyNumber] || state.keys[0];
    const c1 = hexToInt(k.primaryColor);
    const c2 = hexToInt(k.secondaryColor);

    const matObsidian = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.85 });
    const matGold = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.18, metalness: 0.92, emissive: 0x422006, emissiveIntensity: 0.35 });
    const matPrimary = new THREE.MeshStandardMaterial({ color: c1, roughness: 0.2, metalness: 0.7, emissive: c1, emissiveIntensity: 0.45 });
    const matSecondary = new THREE.MeshStandardMaterial({ color: c2, roughness: 0.2, metalness: 0.65, emissive: c2, emissiveIntensity: 0.4 });

    // 1. Stepped Obsidian Altar Base & Rotating Sacred Rune Ring
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.6, 0.24, 48), matObsidian);
    base.position.set(0, 0.12, 0);
    state.dioramaGroup.add(base);

    const runeRing = new THREE.Mesh(new THREE.TorusGeometry(2.38, 0.045, 16, 64), matGold);
    runeRing.rotation.x = Math.PI / 2;
    runeRing.position.set(0, 0.25, 0);
    runeRing.name = 'rotatingRuneRing';
    state.dioramaGroup.add(runeRing);

    const innerHexRing = new THREE.Mesh(new THREE.RingGeometry(1.65, 1.75, 6), new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide }));
    innerHexRing.rotation.x = -Math.PI / 2;
    innerHexRing.position.set(0, 0.26, 0);
    innerHexRing.name = 'innerHexRing';
    state.dioramaGroup.add(innerHexRing);

    // 2. Ornate 24K Gold Tarot Portal Archway & Illuminated Card Tablet
    for (const side of [-1, 1]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.3, 24), side === -1 ? matObsidian : matGold);
      pillar.position.set(side * 1.22, 1.85, -0.45);
      state.dioramaGroup.add(pillar);
    }
    const archCrown = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.09, 16, 48, Math.PI), matGold);
    archCrown.position.set(0, 3.5, -0.45);
    state.dioramaGroup.add(archCrown);

    const cardTex = loadCardTexture(k.hdImageUrl || k.image);
    const cardMat = new THREE.MeshStandardMaterial({
      map: cardTex,
      roughness: 0.28,
      metalness: 0.15,
      emissive: 0xffffff,
      emissiveMap: cardTex,
      emissiveIntensity: 0.28
    });
    const cardTablet = new THREE.Mesh(new THREE.BoxGeometry(2.1, 3.15, 0.08), cardMat);
    cardTablet.position.set(0, 1.9, -0.45);
    cardTablet.name = 'tarotCardTablet';
    state.dioramaGroup.add(cardTablet);

    // 3. Key-Specific 3D Foreground Sculpture in front of the Tarot Tablet!
    const sculpture = new THREE.Group();
    sculpture.position.set(0, 0.3, 0.72);
    sculpture.name = 'keyForegroundSculpture';

    if ([0, 9, 17, 19].includes(keyNumber)) {
      // Mountain Peak + Radiant Celestial Sun / Star
      const peak = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.35, 7), matObsidian);
      peak.position.set(0, 0.68, 0);
      sculpture.add(peak);
      const sunCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 2), matPrimary);
      sunCore.position.set(0, 1.85, 0.2);
      sculpture.add(sunCore);
      const rayRing = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.03, 12, 32), matGold);
      rayRing.position.set(0, 1.85, 0.2);
      sculpture.add(rayRing);
    } else if ([1, 5, 11, 14].includes(keyNumber)) {
      // Altar of Tools / Upright Sword & Balanced Golden Scales
      const table = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.65, 0.65), matObsidian);
      table.position.set(0, 0.35, 0);
      sculpture.add(table);
      const sword = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 1.85, 16), matGold);
      sword.position.set(0, 1.4, 0);
      sculpture.add(sword);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.45, 12), matGold);
      beam.rotation.z = Math.PI / 2;
      beam.position.set(0, 1.85, 0);
      sculpture.add(beam);
      for (const s of [-1, 1]) {
        const pan = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), s === -1 ? matPrimary : matSecondary);
        pan.rotation.x = Math.PI;
        pan.position.set(s * 0.68, 1.45, 0);
        sculpture.add(pan);
      }
    } else if ([2, 4, 7, 15, 18].includes(keyNumber)) {
      // Twin Sphinxes / Twin Lunar Towers & Chariot Core
      for (const s of [-1, 1]) {
        const sphinx = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.85, 0.72), s === -1 ? matPrimary : matSecondary);
        sphinx.position.set(s * 0.75, 0.45, 0.15);
        sculpture.add(sphinx);
      }
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 1), matGold);
      core.position.set(0, 1.45, 0.15);
      sculpture.add(core);
    } else if ([10, 21].includes(keyNumber)) {
      // Multi-Ring 3D Cosmic Wheel of Fortune / Laurel Wreath of The World
      [0.95, 0.68, 0.42].forEach((rad, idx) => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(rad, 0.045, 16, 48),
          idx === 0 ? matGold : idx === 1 ? matPrimary : matSecondary
        );
        ring.position.set(0, 1.45, 0.15);
        ring.rotation.y = idx * 0.45;
        sculpture.add(ring);
      });
    } else {
      // Lightning-Struck Tower / Tau Cross / Awakening Spiral
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.48, 1.75, 8), matObsidian);
      tower.position.set(0, 0.88, 0);
      sculpture.add(tower);
      const crown = new THREE.Mesh(new THREE.TorusKnotGeometry(0.28, 0.07, 48, 12), matPrimary);
      crown.position.set(0, 2.05, 0.1);
      sculpture.add(crown);
    }
    state.dioramaGroup.add(sculpture);

    // 4. Paired Pantheon Guardian Agent Avatar standing on the right of the Altar!
    const guardian = new THREE.Group();
    guardian.position.set(1.75, 0.3, 0.55);
    guardian.name = 'pairedGuardianAvatar';

    const body = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.05, 16), matPrimary);
    body.position.set(0, 0.55, 0);
    guardian.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), matGold);
    head.position.set(0, 1.25, 0);
    guardian.add(head);

    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.025, 12, 32), matSecondary);
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, 1.55, 0);
    guardian.add(halo);

    state.dioramaGroup.add(guardian);

    // 5. Floating Vision Focus Orbs around the 3D Altar
    const focusItems = k.visionFocus || [];
    focusItems.forEach((_, idx) => {
      const ang = (idx / Math.max(1, focusItems.length)) * Math.PI * 1.4 - Math.PI * 0.7;
      const orb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.13, 1),
        state.discoveredFocus[`${keyNumber}:${idx}`] ? matGold : matSecondary
      );
      orb.position.set(Math.sin(ang) * 1.65, 1.15 + (idx % 3) * 0.55, 0.85 + Math.cos(ang) * 0.35);
      orb.name = `visionOrb_${idx}`;
      state.dioramaGroup.add(orb);
    });
  }

  function buildWalkableTempleHall() {
    if (!window.THREE || !state.templeGroup) return;
    const THREE = window.THREE;
    clearGroup(state.templeGroup);

    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0b1120, roughness: 0.3, metalness: 0.8 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.9, emissive: 0x422006, emissiveIntensity: 0.3 });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 76), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -10);
    state.templeGroup.add(floor);

    // Central golden path runner
    const runner = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 72), goldMat);
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0, 0.02, -10);
    state.templeGroup.add(runner);

    // 22 Towering Illuminated Tarot Monoliths lining both sides of the Grand Temple Corridor
    state.keys.forEach((k, idx) => {
      const side = idx % 2 === 0 ? -1 : 1;
      const row = Math.floor(idx / 2);
      const zPos = 20 - row * 4.2;
      const xPos = side * 3.6;

      const monolith = new THREE.Group();
      monolith.position.set(xPos, 0, zPos);
      monolith.userData = { keyNumber: k.keyNumber };

      const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.4, 1.2), floorMat);
      plinth.position.set(0, 0.2, 0);
      monolith.add(plinth);

      const tex = loadCardTexture(k.hdImageUrl || k.image);
      const cardMat = new THREE.MeshStandardMaterial({
        map: tex,
        emissive: 0xffffff,
        emissiveMap: tex,
        emissiveIntensity: 0.32
      });
      const cardMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.3, 0.1), cardMat);
      cardMesh.position.set(0, 1.65, 0);
      cardMesh.rotation.y = side === -1 ? 0.35 : -0.35;
      monolith.add(cardMesh);

      const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), goldMat);
      crown.position.set(0, 3.05, 0);
      monolith.add(crown);

      state.templeGroup.add(monolith);
    });
  }

  function spawnParticleBurst(colorHex) {
    if (!window.THREE || !state.particlesGroup) return;
    const THREE = window.THREE;
    clearGroup(state.particlesGroup);
    const col = hexToInt(colorHex);
    const mat = new THREE.MeshBasicMaterial({ color: col });

    for (let i = 0; i < 28; i++) {
      const p = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), mat);
      p.position.set(0, 1.6, 0.8);
      const ang = Math.random() * Math.PI * 2;
      const elev = (Math.random() - 0.3) * 2.5;
      const spd = 0.04 + Math.random() * 0.08;
      p.userData = {
        vx: Math.cos(ang) * spd,
        vy: elev * spd,
        vz: Math.sin(ang) * spd,
        life: 1.0
      };
      state.particlesGroup.add(p);
    }
    state.pulseShockwave = 1.0;
  }

  function animateThreeStage(now) {
    requestAnimationFrame(animateThreeStage);
    if (!state.renderer || !state.scene || !state.camera) return;

    const t = (now - state.clockStart) * 0.001;

    if (state.gameMode === 'temple_walk') {
      state.dioramaGroup.visible = false;
      state.templeGroup.visible = true;

      state.camera.position.set(state.templePos.x, 1.75 + Math.sin(t * 3.0) * 0.04, state.templePos.z);
      const lookX = state.templePos.x + Math.sin(state.templePos.yaw) * 6;
      const lookZ = state.templePos.z - Math.cos(state.templePos.yaw) * 6;
      state.camera.lookAt(lookX, 1.7, lookZ);

      // Find nearest monolith
      let bestKey = state.activeKeyNumber;
      let bestDist = Infinity;
      state.templeGroup.children.forEach(ch => {
        if (ch.userData && typeof ch.userData.keyNumber === 'number') {
          const dx = ch.position.x - state.templePos.x;
          const dz = ch.position.z - state.templePos.z;
          const d = Math.hypot(dx, dz);
          if (d < bestDist) {
            bestDist = d;
            bestKey = ch.userData.keyNumber;
          }
        }
      });
      state.nearestTempleKey = bestKey;
    } else {
      state.dioramaGroup.visible = true;
      state.templeGroup.visible = false;

      // Gentle orbital breathing camera
      const camRadius = state.gameMode === 'rpg_trial' ? 6.6 : 5.85;
      state.camera.position.set(Math.sin(t * 0.35) * 0.85, 2.2 + Math.sin(t * 0.7) * 0.12, camRadius);
      state.camera.lookAt(0, 1.65, 0);

      state.dioramaGroup.children.forEach(ch => {
        if (ch.name === 'rotatingRuneRing') ch.rotation.z = t * 0.45;
        if (ch.name === 'innerHexRing') ch.rotation.z = -t * 0.65;
        if (ch.name === 'keyForegroundSculpture') {
          ch.rotation.y = Math.sin(t * 0.8) * 0.35;
          ch.position.y = 0.3 + Math.sin(t * 1.6) * 0.06;
        }
        if (ch.name === 'pairedGuardianAvatar') {
          ch.position.y = 0.3 + Math.sin(t * 2.2) * 0.09;
          ch.rotation.y = -0.35 + Math.sin(t * 1.1) * 0.15;
        }
        if (ch.name && ch.name.startsWith('visionOrb_')) {
          ch.rotation.y = t * 1.8;
          ch.rotation.x = t * 1.1;
        }
      });
    }

    // Update burst particles
    for (let i = state.particlesGroup.children.length - 1; i >= 0; i--) {
      const p = state.particlesGroup.children[i];
      p.position.x += p.userData.vx;
      p.position.y += p.userData.vy;
      p.position.z += p.userData.vz;
      p.userData.life -= 0.025;
      p.scale.setScalar(Math.max(0.01, p.userData.life));
      if (p.userData.life <= 0) {
        state.particlesGroup.remove(p);
      }
    }

    state.renderer.render(state.scene, state.camera);
  }

  function updateGameUI() {
    const k = state.keys[state.activeKeyNumber] || state.keys[0];
    if (!k) return;

    const rank = getRank(state.gnosisXp);
    const rankEl = document.getElementById('adytumInitiateRank');
    if (rankEl) rankEl.textContent = `${rank.badge} ${rank.title}`;
    const xpEl = document.getElementById('adytumGnosisXp');
    if (xpEl) xpEl.textContent = `⚡ ${state.gnosisXp} Gnosis XP`;
    const foilEl = document.getElementById('adytumFoilCount');
    if (foilEl) foilEl.textContent = `✨ ${Object.keys(state.unlockedFoils).length}/22 Keys Mastered`;

    // Top & Bottom HUD pills
    const hudTitle = document.getElementById('adytumHudKeyTitle');
    if (hudTitle) {
      hudTitle.textContent = state.gameMode === 'temple_walk'
        ? `🏛️ TEMPLE CORRIDOR • Nearest Portal: KEY ${k.roman} (${k.name})`
        : `KEY ${k.roman} • ${k.name.toUpperCase()} — ${k.hebrew} • ${k.element}`;
    }
    const hudGuard = document.getElementById('adytumHudGuardian');
    if (hudGuard) {
      hudGuard.textContent = `🛡️ Guardian: ${k.guardianAgent} (${k.guardianPet})`;
    }
    const hudSpell = document.getElementById('adytumHudSpell');
    if (hudSpell) {
      hudSpell.textContent = `⚡ Spell: ${k.spellName} (Power ${k.spellPower})`;
    }

    // GLB Download button
    const glbBtn = document.getElementById('adytumDownloadGlbBtn');
    if (glbBtn) {
      glbBtn.href = k.glbUrl || `/assets/tarot3d/glb/key_${String(k.keyNumber).padStart(2, '0')}_${k.slug}.glb`;
    }

    // Media overlays
    const vidOverlay = document.getElementById('adytumVideoOverlay');
    const hdOverlay = document.getElementById('adytumHdOverlay');
    const brailleOverlay = document.getElementById('adytumBrailleOverlay');
    if (vidOverlay) vidOverlay.classList.toggle('is-visible', state.mediaView === 'video');
    if (hdOverlay) hdOverlay.classList.toggle('is-visible', state.mediaView === 'hd');
    if (brailleOverlay) brailleOverlay.classList.toggle('is-visible', state.mediaView === 'braille');

    const vidEl = document.getElementById('adytumCardVideo');
    if (vidEl && vidEl.getAttribute('src') !== k.videoUrl) {
      vidEl.setAttribute('src', k.videoUrl);
    }
    const hdImg = document.getElementById('adytumHdCardImg');
    if (hdImg) hdImg.src = k.hdImageUrl || k.image;
    const braillePre = document.getElementById('adytumBraillePre');
    if (braillePre) {
      braillePre.textContent = Array.isArray(k.braillePreview) ? k.braillePreview.join('\n') : '';
    }

    // Mode tabs active state
    document.querySelectorAll('.adytum-mode-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.getAttribute('data-game-mode') === state.gameMode);
    });
    document.querySelectorAll('.adytum-media-btn[data-media-view]').forEach(btn => {
      btn.classList.toggle('is-active', btn.getAttribute('data-media-view') === state.mediaView);
    });

    // Temple walk controls & RPG panel visibility
    const templeCtrls = document.getElementById('adytumTempleControls');
    if (templeCtrls) templeCtrls.classList.toggle('is-visible', state.gameMode === 'temple_walk');

    const questInsp = document.getElementById('adytumQuestInspector');
    const rpgInsp = document.getElementById('adytumRpgInspector');
    if (questInsp) questInsp.style.display = state.gameMode === 'rpg_trial' ? 'none' : 'block';
    if (rpgInsp) rpgInsp.classList.toggle('is-visible', state.gameMode === 'rpg_trial');

    // Vision Focus Orbs list
    const orbList = document.getElementById('adytumFocusOrbList');
    if (orbList) {
      orbList.innerHTML = (k.visionFocus || []).map((item, idx) => {
        const done = !!state.discoveredFocus[`${k.keyNumber}:${idx}`];
        return `
          <button type="button" class="adytum-focus-orb-btn ${done ? 'is-discovered' : ''}" data-focus-idx="${idx}">
            <span>${done ? '✨' : '🔮'} ${item}</span>
            <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:${done ? '#34D399' : '#FDE047'};">
              ${done ? 'UNLOCKED' : '+25 XP'}
            </span>
          </button>
        `;
      }).join('');
      orbList.querySelectorAll('.adytum-focus-orb-btn').forEach(btn => {
        btn.addEventListener('click', () => inspectVisionFocus(Number(btn.getAttribute('data-focus-idx'))));
      });
    }

    const cubeBadge = document.getElementById('adytumCubeBadge');
    if (cubeBadge) cubeBadge.textContent = `Cube: ${k.cubeOfSpace}`;
    const dirText = document.getElementById('adytumGameDirectiveText');
    if (dirText) dirText.textContent = `${k.superconscious} (${k.subconscious})`;
    const qText = document.getElementById('adytumGameQuestionText');
    if (qText) qText.textContent = `"${k.planningQuestion}"`;
    const pathLbl = document.getElementById('adytumActivePathLabel');
    if (pathLbl) pathLbl.textContent = `${k.path} • ${k.astrology}`;

    // RPG Boss & Hand UI
    renderRpgSpreadUI();

    // 22-Key Carousel
    const carousel = document.getElementById('adytumKeyCarousel');
    if (carousel) {
      if (carousel.childElementCount !== state.keys.length) {
        carousel.innerHTML = state.keys.map(card => `
          <button type="button" class="adytum-mini-key-btn" data-key-num="${card.keyNumber}">
            ${card.roman} · ${card.name.replace(/^The\s+/i, '')}
          </button>
        `).join('');
        carousel.querySelectorAll('.adytum-mini-key-btn').forEach(b => {
          b.addEventListener('click', () => selectKey(Number(b.getAttribute('data-key-num'))));
        });
      }
      carousel.querySelectorAll('.adytum-mini-key-btn').forEach(b => {
        b.classList.toggle('is-active', Number(b.getAttribute('data-key-num')) === state.activeKeyNumber);
      });
    }
  }

  function renderRpgSpreadUI() {
    const boss = ENTROPY_BOSSES[state.bossIndex % ENTROPY_BOSSES.length];
    const bossNameEl = document.getElementById('adytumBossName');
    if (bossNameEl) bossNameEl.textContent = `${boss.avatar} ${boss.name}`;
    const bossMetaEl = document.getElementById('adytumBossMeta');
    if (bossMetaEl) bossMetaEl.textContent = `${boss.title} • Weakness: ${boss.elementWeakness}`;
    const bossHpLbl = document.getElementById('adytumBossHpLabel');
    if (bossHpLbl) bossHpLbl.textContent = `${state.bossHp} / ${state.bossMaxHp} HP`;
    const bossHpFill = document.getElementById('adytumBossHpFill');
    if (bossHpFill) bossHpFill.style.width = `${Math.max(0, Math.min(100, (state.bossHp / state.bossMaxHp) * 100))}%`;

    const handGrid = document.getElementById('adytumHandGrid');
    if (handGrid) {
      const slotLabels = ['1. SUBCONSCIOUS', '2. CONSCIOUS', '3. SUPERCONSCIOUS'];
      handGrid.innerHTML = state.hand.map((knum, slotIdx) => {
        const card = state.keys[knum] || state.keys[0];
        return `
          <div class="adytum-spread-slot" data-slot-idx="${slotIdx}">
            <div style="font-size:9px;color:#94A3B8;font-family:'JetBrains Mono',monospace;">${slotLabels[slotIdx]}</div>
            <div style="font-size:12px;font-weight:800;color:#FDE68A;margin:3px 0;">Key ${card.roman}: ${card.name}</div>
            <div style="font-size:10px;color:#38BDF8;font-family:'JetBrains Mono',monospace;">${card.element} • Pwr ${card.spellPower}</div>
            <div style="font-size:10px;color:#E2E8F0;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">⚡ ${card.spellName}</div>
          </div>
        `;
      }).join('');
      handGrid.querySelectorAll('.adytum-spread-slot').forEach(el => {
        el.addEventListener('click', () => castCardSpell(Number(el.getAttribute('data-slot-idx'))));
      });
    }

    const logEl = document.getElementById('adytumCombatLog');
    if (logEl) logEl.textContent = state.combatLog;
  }

  function selectKey(keyNumber, skipLegacySync) {
    const num = Math.max(0, Math.min(21, Number(keyNumber) || 0));
    state.activeKeyNumber = num;
    buildDioramaForKey(num);
    spawnParticleBurst((state.keys[num] || state.keys[0]).primaryColor);
    updateGameUI();

    // Synchronize with zoth-civilization's legacy #journeyStrip & #cardImage if present
    if (!skipLegacySync) {
      const strip = document.getElementById('journeyStrip');
      if (strip && strip.children[num]) {
        strip.children[num].click();
      }
      const legacyImg = document.getElementById('cardImage');
      const k = state.keys[num];
      if (legacyImg && k) {
        legacyImg.src = k.hdImageUrl || k.image;
      }
    }
  }

  function setGameMode(mode) {
    if (!['diorama', 'temple_walk', 'rpg_trial'].includes(mode)) return;
    state.gameMode = mode;
    if (mode === 'temple_walk') {
      state.mediaView = '3d';
      const row = Math.floor(state.activeKeyNumber / 2);
      state.templePos.z = Math.min(22, 20 - row * 4.2 + 3.5);
      state.templePos.x = 0;
      state.templePos.yaw = 0;
    }
    updateGameUI();
  }

  function setMediaView(view) {
    if (!['3d', 'video', 'hd', 'braille'].includes(view)) return;
    state.mediaView = view;
    updateGameUI();
  }

  function inspectVisionFocus(focusIdx) {
    const k = state.keys[state.activeKeyNumber] || state.keys[0];
    if (!k) return;
    const keyTag = `${k.keyNumber}:${focusIdx}`;
    if (!state.discoveredFocus[keyTag]) {
      state.discoveredFocus[keyTag] = true;
      state.gnosisXp += 25;
      state.unlockedFoils[k.keyNumber] = true;
    } else {
      state.gnosisXp += 5;
    }
    if (typeof window.HermeticAudio !== 'undefined' && window.HermeticAudio.playClick) {
      window.HermeticAudio.playClick(640 + focusIdx * 60);
    }
    buildDioramaForKey(state.activeKeyNumber);
    spawnParticleBurst(k.primaryColor);
    updateGameUI();
  }

  function stepTemple(action) {
    if (state.gameMode !== 'temple_walk') {
      setGameMode('temple_walk');
    }
    if (action === 'forward') {
      state.templePos.x += Math.sin(state.templePos.yaw) * 2.1;
      state.templePos.z -= Math.cos(state.templePos.yaw) * 2.1;
    } else if (action === 'back') {
      state.templePos.x -= Math.sin(state.templePos.yaw) * 2.1;
      state.templePos.z += Math.cos(state.templePos.yaw) * 2.1;
    } else if (action === 'left') {
      state.templePos.yaw -= 0.35;
    } else if (action === 'right') {
      state.templePos.yaw += 0.35;
    } else if (action === 'enter') {
      enterNearestTempleKey();
      return;
    }
    state.templePos.z = Math.max(-28, Math.min(25, state.templePos.z));
    state.templePos.x = Math.max(-5, Math.min(5, state.templePos.x));
    updateGameUI();
  }

  function enterNearestTempleKey() {
    const target = state.nearestTempleKey || 0;
    state.gameMode = 'diorama';
    selectKey(target);
  }

  function drawThreeCardSpread() {
    const pool = state.keys.map(k => k.keyNumber);
    const picked = [];
    while (picked.length < 3) {
      const cand = pool[Math.floor(Math.random() * pool.length)];
      if (!picked.includes(cand)) picked.push(cand);
    }
    state.hand = picked;
    state.combatLog = `🔮 Drawn 3-Card Hermetic Spread: Key ${ROMAN[picked[0]]}, Key ${ROMAN[picked[1]]}, Key ${ROMAN[picked[2]]}! Click any card to cast!`;
    selectKey(picked[1]);
    updateGameUI();
  }

  function castCardSpell(slotIndex) {
    const knum = state.hand[slotIndex] !== undefined ? state.hand[slotIndex] : state.activeKeyNumber;
    const card = state.keys[knum] || state.keys[0];
    const boss = ENTROPY_BOSSES[state.bossIndex % ENTROPY_BOSSES.length];

    selectKey(knum);

    let dmg = card.spellPower;
    let comboNote = '';
    if (card.element === boss.elementWeakness) {
      dmg = Math.round(dmg * 1.45);
      comboNote = ` • ELEMENTAL RESONANCE (${card.element} > ${boss.elementWeakness} +45%)!`;
    } else if (state.castHistory.length > 0) {
      const prevElement = state.castHistory[state.castHistory.length - 1];
      if ((prevElement === 'Fire' && card.element === 'Air') || (prevElement === 'Air' && card.element === 'Fire')) {
        dmg = Math.round(dmg * 1.35);
        comboNote = ' • 🔥+🌬️ SOLAR SUPERNOVA COMBO (+35%)!';
      } else if ((prevElement === 'Water' && card.element === 'Earth') || (prevElement === 'Earth' && card.element === 'Water')) {
        dmg = Math.round(dmg * 1.35);
        comboNote = ' • 💧+🌍 ABYSSAL CRYSTALLIZATION COMBO (+35%)!';
      }
    }

    state.castHistory.push(card.element);
    state.bossHp = Math.max(0, state.bossHp - dmg);
    state.gnosisXp += 35;
    state.unlockedFoils[knum] = true;

    if (state.bossHp <= 0) {
      const defeatedName = boss.name;
      state.bossIndex = (state.bossIndex + 1) % ENTROPY_BOSSES.length;
      const nextBoss = ENTROPY_BOSSES[state.bossIndex];
      state.bossMaxHp = nextBoss.maxHp;
      state.bossHp = nextBoss.maxHp;
      state.gnosisXp += 120;
      state.combatLog = `🏆 VICTORY! Key ${card.roman} (${card.spellName}) obliterated ${defeatedName} for ${dmg} DMG! (+120 Gnosis XP & Golden Foil Unlocked!)`;
    } else {
      state.combatLog = `⚡ Key ${card.roman} (${card.guardianAgent}) cast "${card.spellName}" for ${dmg} Astral DMG!${comboNote}`;
    }

    spawnParticleBurst(card.primaryColor);
    updateGameUI();
  }

  function bindDeckEvents(rootEl) {
    rootEl.querySelectorAll('.adytum-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => setGameMode(btn.getAttribute('data-game-mode')));
    });
    rootEl.querySelectorAll('.adytum-media-btn[data-media-view]').forEach(btn => {
      btn.addEventListener('click', () => setMediaView(btn.getAttribute('data-media-view')));
    });
    rootEl.querySelectorAll('[data-temple-act]').forEach(btn => {
      btn.addEventListener('click', () => stepTemple(btn.getAttribute('data-temple-act')));
    });
    const drawBtn = rootEl.querySelector('#adytumBtnDrawSpread');
    if (drawBtn) drawBtn.addEventListener('click', drawThreeCardSpread);

    const prevBtn = rootEl.querySelector('#adytumPrevKeyBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => selectKey((state.activeKeyNumber + 21) % 22));
    const nextBtn = rootEl.querySelector('#adytumNextKeyBtn');
    if (nextBtn) nextBtn.addEventListener('click', () => selectKey((state.activeKeyNumber + 1) % 22));

    // Keyboard WASD navigation when Temple Walk mode is active
    window.addEventListener('keydown', ev => {
      if (state.gameMode !== 'temple_walk') return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((ev.target && ev.target.tagName) || '')) return;
      const key = ev.key.toLowerCase();
      if (key === 'w' || ev.key === 'ArrowUp') { ev.preventDefault(); stepTemple('forward'); }
      else if (key === 's' || ev.key === 'ArrowDown') { ev.preventDefault(); stepTemple('back'); }
      else if (key === 'a' || ev.key === 'ArrowLeft') { ev.preventDefault(); stepTemple('left'); }
      else if (key === 'd' || ev.key === 'ArrowRight') { ev.preventDefault(); stepTemple('right'); }
      else if (ev.key === 'Enter') { ev.preventDefault(); enterNearestTempleKey(); }
    });

    // Also listen for clicks on legacy #journeyStrip in zoth-civilization
    const legacyStrip = document.getElementById('journeyStrip');
    if (legacyStrip) {
      legacyStrip.addEventListener('click', ev => {
        const node = ev.target.closest('.journey-node');
        if (!node) return;
        const numEl = node.querySelector('.node-num');
        if (numEl) {
          const knum = parseInt(numEl.textContent, 10);
          if (!isNaN(knum) && knum !== state.activeKeyNumber) {
            selectKey(knum, true);
          }
        }
      });
    }
  }

  async function hydrateManifest() {
    try {
      const res = await fetch('/assets/tarot3d/adytum_22_tarot_manifest.json');
      if (!res.ok) return;
      const data = await res.json();
      if (data && Array.isArray(data.keys) && data.keys.length === 22) {
        state.keys = data.keys;
        buildDioramaForKey(state.activeKeyNumber);
        buildWalkableTempleHall();
        updateGameUI();
      }
    } catch (_) {
      // Fallback keys remain active
    }
  }

  function mountAdytumGameStage() {
    if (document.getElementById('adytumGameDeck')) return;
    injectStyles();

    const deck = document.createElement('section');
    deck.id = 'adytumGameDeck';
    deck.className = 'adytum-game-deck';
    deck.setAttribute('aria-label', 'Adytum 3D Tarot Video Game Stage');
    deck.innerHTML = buildGameDeckHTML();

    // Target 1: zoth-civilization (#view-adytum-chamber > .adytum-container)
    const civContainer = document.querySelector('#view-adytum-chamber .adytum-container') || document.getElementById('view-adytum-chamber');
    if (civContainer) {
      civContainer.insertBefore(deck, civContainer.firstChild);
    } else {
      // Target 2: adytum-alchemist-ai-workflow (:8135)
      const rootEl = document.getElementById('root');
      if (rootEl && rootEl.parentNode) {
        deck.style.margin = '16px auto';
        deck.style.maxWidth = '1380px';
        rootEl.parentNode.insertBefore(deck, rootEl);
      } else {
        document.body.insertBefore(deck, document.body.firstChild);
      }
    }

    bindDeckEvents(deck);
    initThreeStage();
    updateGameUI();
    hydrateManifest();

    // Resize canvas whenever #view-adytum-chamber becomes visible
    const syncCanvasSize = () => {
      const c = document.getElementById('adytum3dCanvas');
      if (!c || !state.renderer || !state.camera) return;
      const nw = c.clientWidth || 720;
      const nh = c.clientHeight || 430;
      if (nw > 50 && nh > 50) {
        state.renderer.setSize(nw, nh, false);
        state.camera.aspect = nw / nh;
        state.camera.updateProjectionMatrix();
      }
    };
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(syncCanvasSize);
      const c = document.getElementById('adytum3dCanvas');
      if (c) ro.observe(c);
    }
    document.querySelectorAll('[data-view="adytum-chamber"], #headerAdytumBadge').forEach(btn => {
      btn.addEventListener('click', () => {
        setTimeout(syncCanvasSize, 60);
        setTimeout(syncCanvasSize, 220);
      });
    });

    if (window.location.hash === '#view-adytum-chamber' || window.location.hash === '#adytum-chamber') {
      setTimeout(() => {
        const tabBtn = document.querySelector('[data-view="adytum-chamber"]');
        if (tabBtn) tabBtn.click();
        setTimeout(syncCanvasSize, 120);
      }, 150);
    }
  }

  window.adytumTarotGame = {
    selectKey,
    setGameMode,
    setMediaView,
    inspectVisionFocus,
    drawThreeCardSpread,
    castCardSpell,
    stepTemple,
    enterNearestTempleKey,
    getState: () => state
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAdytumGameStage);
  } else {
    mountAdytumGameStage();
  }
})();
