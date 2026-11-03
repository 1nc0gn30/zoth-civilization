/**
 * ZOTH CIVILIZATION — IN-WORLD GUIDE
 * Walks the surface at a walking pace, stops, and holds a real conversation.
 * WASD, arrows, Space, or a mouse look takes the wheel. P hands it back.
 */

(function () {
  'use strict';

  if (window.streamPilot) return;

  const PROMPTS = {
    AZOTH: 'What is the one piece of the studio you want finished before the day turns?',
    NEXUS: 'Which part of the spatial work is still out of alignment?',
    VIGIL: 'What did the last pass through the code actually change?',
    MERCURY: 'Is the PromptMaster release harness still green, and what is the next check?',
    GHOSTBYTE: 'What secret path would you refuse to let an agent touch?',
    ATHENA: 'Which page should a stranger be able to cite without guessing?',
    CHRONOS: 'What is the next step that has to happen before the one after it?',
    DRACO: 'Where do the two accounts of this work still disagree?',
    IGNIS: 'What is the one rough edge you would finish if you had a single pass?',
    KAI: 'What did you inspect, and what is still wrong?',
    LYCAN: 'What would you block before it ever reached a visitor?',
    ONYX: 'What is the sharpest risk sitting in the live apps right now?',
    SCORPIUS: 'What gate is still open that should already be shut?',
    KITSUNE: 'Where does the page still feel clumsy under a thumb?',
    LEVIATHAN: 'What do you still remember from the last thing that worked?',
    AQUILA: 'What is the shortest path from a visitor to a finished page?',
    KRAKEN: 'What signal from outside the walls is worth answering?',
    AETHER: 'Who is out of step with the rest of the court?',
    PIXELNEKO: 'Which tool on the bench is the one people actually pick up?',
    'PIXEL-NEKO': 'Which tool on the bench is the one people actually pick up?',
    RADICALMINION: 'What small loop can you finish without waiting on anyone?',
    'RADICAL-MINION': 'What small loop can you finish without waiting on anyone?',
    PIXELSHIBA: 'What key are you keeping, and who is allowed to ask for it?',
    'PIXEL-SHIBA': 'What key are you keeping, and who is allowed to ask for it?'
  };

  class StreamPilot {
    constructor() {
      this.enabled = false;
      this.state = 'APPROACH';
      this.targetAgentId = 'AZOTH';
      this.stateTimer = performance.now();
      this.walkStartTime = performance.now();
      this.lastFrameTime = performance.now();
      this.roster = [
        'AZOTH', 'MERCURY', 'ATHENA', 'VIGIL', 'KAI', 'IGNIS', 'KITSUNE',
        'LEVIATHAN', 'GHOSTBYTE', 'CHRONOS', 'DRACO', 'NEXUS', 'AQUILA',
        'LYCAN', 'ONYX', 'SCORPIUS', 'KRAKEN', 'AETHER'
      ];
      this.rosterIndex = 0;
      this.talkToken = 0;
      this.baseSpeed = 9.2;
      this.init();
    }

    init() {
      this.bindHands();
      this.waitForSphereWorld();
    }

    typing(e) {
      const t = e && e.target;
      if (!t) return false;
      const tag = t.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable;
    }

    bindHands() {
      window.addEventListener('keydown', (e) => {
        if (this.typing(e)) return;
        const k = e.key.toLowerCase();
        if (k === 'p' && !e.repeat && !e.metaKey && !e.ctrlKey && !e.altKey) {
          const sw = window.sphereWorld;
          if (!sw) return;
          e.preventDefault();
          if (this.enabled) this.releaseToPlayer();
          else this.takeWheel();
          return;
        }
        if (!this.enabled) return;
        const driving = k === 'w' || k === 'a' || k === 's' || k === 'd'
          || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight'
          || e.key === ' ';
        if (driving) this.releaseToPlayer(e);
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.enabled) return;
        const sw = window.sphereWorld;
        if (!sw || !sw.isAvatarMode || !sw.renderer) return;
        if (document.pointerLockElement !== sw.renderer.domElement) return;
        if (Math.abs(e.movementX) > 5 || Math.abs(e.movementY) > 5) this.releaseToPlayer();
      });
    }

    waitForSphereWorld() {
      const check = () => {
        if (window.sphereWorld && window.sphereWorld.scene && window.sphereWorld.camera) {
          setTimeout(() => this.start(), 800);
        } else {
          setTimeout(check, 300);
        }
      };
      check();
    }

    start() {
      const sw = window.sphereWorld;
      if (!sw) return;
      if (sw.avatar && sw.avatar.walkSpeed) this.baseSpeed = sw.avatar.walkSpeed;
      this.pickNextAgent();
      const chip = document.getElementById('btnPilotGuide');
      if (chip) chip.addEventListener('click', () => {
        if (this.enabled) this.releaseToPlayer();
        else this.takeWheel();
      });
      fetch('/api/talk/warm', { method: 'POST' }).catch(() => {});
      const autoPilotParam = new URLSearchParams(window.location.search).get('pilot') === '1';
      if (autoPilotParam) {
        this.takeWheel();
      } else {
        this.enabled = false;
        this.paintChip();
      }
      this.lastFrameTime = performance.now();
      requestAnimationFrame(() => this.loop());
    }

    paintChip() {
      const chip = document.getElementById('btnPilotGuide');
      if (!chip) return;
      chip.classList.toggle('is-on', this.enabled);
      chip.setAttribute('aria-pressed', this.enabled ? 'true' : 'false');
      chip.textContent = this.enabled ? 'Guide on · P' : 'You have the wheel · P';
      chip.title = this.enabled
        ? 'The guide walks up and talks. WASD, the mouse, or P takes the wheel.'
        : 'You are walking. P hands the walk back to the guide.';
    }

    takeWheel() {
      const sw = window.sphereWorld;
      this.enabled = true;
      this.talkToken += 1;
      if (sw && !sw.isAvatarMode) sw.enterAvatarMode();
      if (sw) {
        sw.liveConversation = true;
        if (typeof sw.syncLiveTalkButton === 'function') sw.syncLiveTalkButton();
      }
      this.state = 'APPROACH';
      this.walkStartTime = performance.now();
      this.stateTimer = performance.now();
      this.paintChip();
    }

    releaseToPlayer(e) {
      const sw = window.sphereWorld;
      this.enabled = false;
      this.talkToken += 1;
      if (sw && sw.avatar) {
        if (sw.avatar.walkSpeed) sw.avatar.walkSpeed = this.baseSpeed;
        const keys = sw.avatar.keys;
        if (keys) {
          keys.forward = false;
          keys.backward = false;
          keys.left = false;
          keys.right = false;
          keys.sprint = false;
          if (e) {
            const k = e.key.toLowerCase();
            if (k === 'w' || e.key === 'ArrowUp') keys.forward = true;
            if (k === 's' || e.key === 'ArrowDown') keys.backward = true;
            if (k === 'a' || e.key === 'ArrowLeft') keys.left = true;
            if (k === 'd' || e.key === 'ArrowRight') keys.right = true;
          }
        }
      }
      this.paintChip();
    }

    promptFor(agent) {
      if (!agent) return 'What work are you carrying right now?';
      return PROMPTS[agent.id] || `${agent.name || 'Friend'}, what work are you carrying right now?`;
    }

    pickNextAgent() {
      const sw = window.sphereWorld;
      if (!sw) return;
      this.talkToken += 1;
      if (typeof sw.closeDialogue === 'function') sw.closeDialogue();
      const candidateId = this.roster[this.rosterIndex % this.roster.length];
      this.rosterIndex += 1;
      this.targetAgentId = candidateId;
      this.state = 'APPROACH';
      this.stateTimer = performance.now();
      this.walkStartTime = performance.now();
      const ent = sw.entityById(candidateId);
      if (sw.avatar && ent && sw.avatar.position.distanceTo(ent.position) > 70) {
        sw.walkToAgent(candidateId);
        if (typeof sw.closeDialogue === 'function') sw.closeDialogue();
        if (typeof sw.closeEncounter === 'function') sw.closeEncounter();
        this.walkStartTime = performance.now();
      }
    }

    steerToward(sw, ent, dt) {
      const avatar = sw.avatar;
      const normal = avatar.normal.clone().normalize();
      const toTarget = ent.position.clone().sub(avatar.position);
      toTarget.addScaledVector(normal, -toTarget.dot(normal));
      if (toTarget.lengthSq() < 1e-4) return 0;
      toTarget.normalize();
      const currentFwd = avatar.forward.clone().normalize();
      const cross = new THREE.Vector3().crossVectors(currentFwd, toTarget);
      const dot = Math.max(-1, Math.min(1, currentFwd.dot(toTarget)));
      const turnAngle = Math.atan2(cross.dot(normal), dot);
      const maxTurn = 1.15 * dt;
      const applied = Math.max(-maxTurn, Math.min(maxTurn, turnAngle));
      avatar.forward = sw.rotateForward(avatar.forward, normal, applied);
      return Math.abs(turnAngle);
    }

    easePitch(sw, dt) {
      const avatar = sw.avatar;
      const goal = 0.36;
      avatar.pitch += (goal - avatar.pitch) * Math.min(1, dt * 2.4);
    }

    async conduct(agent) {
      const sw = window.sphereWorld;
      if (!sw || !agent) return;
      const token = this.talkToken;
      if (typeof sw.closeEncounter === 'function') sw.closeEncounter();
      const line = this.promptFor(agent);
      sw.openDialogue(agent);
      const prompt = document.getElementById('avatarDialoguePrompt');
      if (prompt) prompt.value = line;
      this.state = 'LISTEN';
      this.stateTimer = performance.now();
      try {
        await sw.sendDialogue();
      } catch (err) {
        // The dialogue box already shows the failure.
      }
      if (token !== this.talkToken) return;
      this.state = 'LISTEN';
      this.stateTimer = performance.now();
    }

    voiceBusy(sw) {
      const wv = sw.walkVoice;
      if (!wv) return false;
      return !!(wv.busy || wv.playing || (wv.queue && wv.queue.length));
    }

    loop() {
      const now = performance.now();
      const dt = Math.min((now - this.lastFrameTime) / 1000, 0.05);
      this.lastFrameTime = now;
      if (this.enabled && window.sphereWorld) this.update(dt, now);
      requestAnimationFrame(() => this.loop());
    }

    update(dt, now) {
      const sw = window.sphereWorld;
      if (!sw || !sw.avatar || !sw.isAvatarMode) return;
      const ent = sw.entityById(this.targetAgentId);
      if (!ent) {
        this.pickNextAgent();
        return;
      }
      const dist = sw.avatar.position.distanceTo(ent.position);
      this.easePitch(sw, dt);

      if (this.state === 'APPROACH') {
        this.steerToward(sw, ent, dt);
        const settled = (now - this.walkStartTime) > 900;
        const close = dist <= 6.4 && settled;
        sw.avatar.walkSpeed = dist > 16 ? 6.4 : 3.8;
        sw.avatar.keys.forward = !close;
        sw.avatar.keys.backward = false;
        sw.avatar.keys.left = false;
        sw.avatar.keys.right = false;
        sw.avatar.keys.sprint = false;
        if (close) {
          sw.avatar.keys.forward = false;
          this.state = 'ASK';
          this.stateTimer = now;
          const agent = sw.agentRecord(this.targetAgentId) || ent.userData.agent;
          this.conduct(agent);
        } else if (now - this.stateTimer > 28000) {
          sw.avatar.keys.forward = false;
          this.state = 'ASK';
          const agent = sw.agentRecord(this.targetAgentId) || ent.userData.agent;
          this.conduct(agent);
        }
        return;
      }

      this.steerToward(sw, ent, dt);
      sw.avatar.keys.forward = false;
      sw.avatar.keys.sprint = false;
      const elapsed = now - this.stateTimer;
      const talking = sw.dialogueSending || this.voiceBusy(sw);
      if (this.state === 'LISTEN' && elapsed > 5200 && !talking) {
        if (typeof sw.endLiveVisit === 'function') sw.endLiveVisit(true, true);
        this.pickNextAgent();
      } else if (elapsed > 18000) {
        if (typeof sw.endLiveVisit === 'function') sw.endLiveVisit(true, true);
        this.pickNextAgent();
      }
    }

    handleCommand(cmd) {
      if (!cmd || !cmd.action) return;
      const sw = window.sphereWorld;
      if (cmd.action === 'pause') {
        this.releaseToPlayer();
        return;
      }
      if (cmd.action === 'resume' || cmd.action === 'auto_patrol') {
        this.takeWheel();
        return;
      }
      if (cmd.action === 'walk_to' && cmd.agentId && sw) {
        this.targetAgentId = String(cmd.agentId).toUpperCase();
        this.takeWheel();
        sw.walkToAgent(this.targetAgentId);
        this.state = 'APPROACH';
        this.walkStartTime = performance.now();
        this.stateTimer = performance.now();
      }
    }
  }

  window.StreamPilot = StreamPilot;
  window.streamPilot = new StreamPilot();
})();
