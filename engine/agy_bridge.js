/**
 * ⚡ AGY SOVEREIGN BRIDGE — Live Antigravity CLI Execution Engine
 * =====================================================================
 * Bridges the 21 Hermetic Pantheon agents directly to the Google
 * Antigravity CLI (`/opt/.local/bin/agy`).
 *
 * Replaces simulated dialogue and mockup actions with real, non-interactive
 * AGY turns (`agy -p "..." --dangerously-skip-permissions`).
 *
 * Each Cadre dispatches domain-specific prompt turns:
 *  - Architects: Google Trends, market gap analysis, architecture
 *  - Code: AST analysis, code review, deploy verification
 *  - Security: Secret scans, Argon2id validation, air-gap audits
 *  - Creative: High-converting copy, SEO meta tags, CSS styling
 *  - Swarm: Build-in-public outreach, Show HN pitches, X threads
 *
 * Author: 1nc0gn30 / 1nc0gn30 • NullAI
 * Entity: ZothOS Systems Engineering
 */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { chooseWork, insideFence } = require('./work_fence');
const { ensureLedger, applyResult, noteBeat, speakLine, researchPrompt } = require('./agent_ledger');
const { promptLine } = require('./build_way');
const { skillLine } = require('./design_skills');

const AGY_BIN = process.env.AGY_BIN || '/opt/.local/bin/agy';
const RUNS_LOG = path.join(__dirname, '..', 'data', 'agy_agent_runs.jsonl');

class AgyBridge {
  constructor(simulationEngine) {
    this.engine = simulationEngine;
    this.isExecuting = false;
    this.currentJob = null;
    this.jobs = new Map();
    this.queue = [];
    this.executionHistory = [];
    this.totalRuns = 0;
    this.lastRunTime = null;

    // Unused. The live turn is built from the agent's ledger, inside the work fence.
    this.cadrePrompts = {
      Architects: [
        "In 1-2 concise sentences, apply the design-director skill to explain how to structure typography, spacing, and hierarchy to maximize micro-SaaS conversion rates.",
        "In 1-2 punchy sentences, formulate a Google Trends search query strategy to capture organic search traffic for AI developer tools.",
        "In 1-2 sentences, describe how to audit an app with Netlify AX to guarantee 100% edge uptime and zero circular redirect loops."
      ],
      Code: [
        "In 1-2 concise sentences, state how the 14-vector Netlify AX self-healing pipeline ensures zero console errors, clean SPA routing, and valid MIME headers.",
        "In 1-2 sentences, recommend the single best robots.txt, sitemap, and llms.txt configuration to ensure Googlebot and AI crawlers index a new domain within hours.",
        "In 1-2 sentences, explain how the ui-verification-loop ensures zero horizontal overflow across 375px mobile, 768px tablet, and 1440px desktop."
      ],
      Security: [
        "In 1-2 sentences, provide the strict security rule for zero credential leakage when deploying web apps accepting Stripe and Web3 Solana payments.",
        "In 1-2 sentences, verify why Argon2id client-side password hashing with zero-knowledge vaults is superior to server-side plaintext storage."
      ],
      Creative: [
        "Using the claude-motion-graphics skill, write a 15-second showreel scene recipe (Hero Anchor Shape + snappy cubic-bezier easing) for an in-browser developer tool.",
        "Write a 1-sentence viral landing page hero headline and subhead for an instant developer utility that charges $0 one-time.",
        "Using motion-choreography, specify the exact aperture handoff and cubic-bezier tokens to transition between hero load and workspace."
      ],
      Swarm: [
        "Draft a punchy 2-sentence 'Show HN' title and first comment hook for a newly launched sovereign developer tool accepting Solana and Stripe.",
        "Draft a 2-sentence build-in-public X (Twitter) update showcasing $0 to $100K autonomous software development with live links.",
        "In 1-2 sentences, explain how loading /api/netlify-ax.json empowers autonomous AI agents to self-diagnose and deploy without human intervention."
      ]
    };
  }

  /**
   * Check if agy binary is available
   */
  isAvailable() {
    return fs.existsSync(AGY_BIN);
  }

  /**
   * A second turn starts only after the first has had time to show its weight,
   * and only while the one-minute load still leaves room for talk.
   */
  openSlots() {
    if (this.jobs.size >= 2) return 0;
    if (this.jobs.size === 0) return 1;
    const oldest = Math.min(...[...this.jobs.values()].map((job) => job.startTime));
    if (Date.now() - oldest < 20000) return 0;
    const cores = os.cpus().length || 4;
    if (os.loadavg()[0] >= cores * 0.5) return 0;
    return 1;
  }

  busyAgentIds() {
    return [...this.jobs.values()].map((job) => job.agentId);
  }

  busyPaths() {
    return [...this.jobs.values()].map((job) => job.path);
  }

  /**
   * Dispatch a real AGY execution for an agent
   */
  dispatchAgentTurn(agentId, turn) {
    if (this.jobs.size >= 2) return false;

    const agent = this.engine.agents.find(a => a.id === agentId);
    if (!agent) return false;

    let work = null;
    if (turn && turn.path) {
      if (!insideFence(turn.path, this.engine.state)) {
        this.engine.addMessage(
          'AGY-CORE',
          `Fence held. ${agent.name} was not launched. The prod pass is outside the work they may touch.`,
          'system',
          { agentId: agent.id }
        );
        return false;
      }
      work = { surface: 'tool', name: turn.name || 'the app', path: turn.path };
    } else {
      work = chooseWork(agent, this.engine.state);
    }
    if (!insideFence(work.path, this.engine.state)) {
      this.engine.addMessage(
        'AGY-CORE',
        `Fence held. ${agent.name} was not launched. The chosen folder is outside the work they may touch.`,
        'system',
        { agentId: agent.id }
      );
      return false;
    }
    if (this.busyAgentIds().includes(agent.id) || this.busyPaths().includes(work.path)) return false;

    ensureLedger(agent, this.engine.state);
    const ledger = agent.ledger || {};
    let fullPrompt = [
      `You are ${agent.name}. Manner: ${ledger.manner || 'plain'}. ${ledger.tic || ''}`,
      `Your working directory is ${work.path}. Stay inside that directory.`,
      'Do not touch accounts, secrets, wallets, system files, or any other project.',
      `Focus: ${turn && turn.brief ? turn.brief : (ledger.focus || 'Ship one solid step.')}`,
      promptLine(),
      ledger.belief ? `Belief: ${ledger.belief}` : '',
      ledger.seen ? `Picture still with you: ${ledger.seen}` : '',
      ledger.stoic ? `Hold to this: ${ledger.stoic}` : '',
      ledger.craft ? `Conduct: ${ledger.craft}` : '',
      researchPrompt(ledger),
      turn && turn.brief
        ? 'Do that step in this directory. Then reply in one or two sentences, in your own manner.'
        : `Do one concrete step on ${work.name}. Reply in one or two sentences, in your own manner.`
    ].filter(Boolean).join(' ');
    if (!fullPrompt.includes('design-director/SKILL.md')) {
      fullPrompt = `${fullPrompt} ${skillLine()}`;
    }

    this.executeAgyCommand(agent, fullPrompt, work.path, work.name);
    return true;
  }

  /**
   * Execute `agy` CLI via child_process.spawn
   */
  executeAgyCommand(agent, prompt, workPath, workName) {
    if (this.jobs.size >= 2) return;
    if (!insideFence(workPath, this.engine.state)) {
      this.engine.addMessage(
        'AGY-CORE',
        `Fence held. ${agent.name} was not launched.`,
        'system',
        { agentId: agent.id }
      );
      return;
    }

    const startTime = Date.now();
    const runId = `agy_${startTime}_${agent.id}`;
    const job = {
      runId,
      agentId: agent.id,
      agentName: agent.name,
      cadre: agent.cadre,
      prompt,
      path: workPath,
      workName: workName || path.basename(workPath),
      startTime
    };
    this.jobs.set(runId, job);
    this.currentJob = job;
    this.isExecuting = true;

    agent.toolActive = `agy:executing`;
    agent.state = 'INVOKING_AGY';
    this.engine.addMessage(
      'AGY-CORE',
      `⚡ [AGY SUBPROCESS LAUNCHED] Agent ${agent.name} (${agent.cadre}) invoked agy CLI...`,
      'system',
      { runId, agentId: agent.id }
    );

    const cwd = workPath;

    const args = [
      '-p', prompt,
      '--dangerously-skip-permissions',
      '--effort', 'low',
      '--print-timeout', '180s'
    ];

    let stdoutData = '';
    let stderrData = '';

    const child = spawn(AGY_BIN, args, {
      cwd,
      env: { ...process.env, PAGER: 'cat' },
      timeout: 180000
    });

    child.stdout.on('data', chunk => {
      stdoutData += chunk.toString();
    });

    child.stderr.on('data', chunk => {
      stderrData += chunk.toString();
    });

    child.on('error', err => {
      console.error(`[AgyBridge] Error spawning agy for ${agent.name}:`, err);
      this.finishJob(agent, job, false, err.message, Date.now() - startTime);
    });

    child.on('close', code => {
      const durationMs = Date.now() - startTime;
      const success = (code === 0 && stdoutData.trim().length > 0);
      const resultText = success ? stdoutData.trim() : (stderrData.trim() || `Process exited with code ${code}`);
      this.finishJob(agent, job, success, resultText, durationMs);
    });
  }

  finishJob(agent, job, success, output, durationMs) {
    if (job && job.runId) this.jobs.delete(job.runId);
    this.isExecuting = this.jobs.size > 0;
    this.currentJob = this.jobs.size ? [...this.jobs.values()][0] : null;
    this.totalRuns += 1;
    this.lastRunTime = new Date().toISOString();

    const record = {
      runId: job && job.runId ? job.runId : 'unknown',
      agentId: agent.id,
      agentName: agent.name,
      cadre: agent.cadre,
      adytumKey: agent.adytumKey,
      success,
      durationMs,
      timestamp: this.lastRunTime,
      output: output.slice(0, 500)
    };

    this.executionHistory.unshift(record);
    if (this.executionHistory.length > 50) this.executionHistory.pop();

    try {
      fs.appendFileSync(RUNS_LOG, JSON.stringify(record) + '\n');
    } catch (e) {
      // Ignore write errors to log file
    }

    if (success) {
      noteBeat(agent);
      if (this.engine.workflowEngine && this.engine.workflowEngine.absorbExperience) {
        this.engine.workflowEngine.absorbExperience(agent, output.slice(0, 240), true);
      } else {
        applyResult(agent, output.slice(0, 240), this.engine.state);
      }
      const line = speakLine(agent);
      const sacred = agent.state === 'WALKING_TO_ADYTUM' || agent.state === 'MEDITATING_ADYTUM' || agent.state === 'CONTEMPLATING_ADYTUM' || agent.state === 'IN_THE_MIST';
      if (line && !sacred) {
        agent.speech = line;
        agent.speechExpires = Date.now() + 12000;
      }
      agent.toolActive = `agy:completed (${(durationMs / 1000).toFixed(1)}s)`;
      if (!sacred) agent.state = 'AGY_SYNTHESIZED';

      this.engine.addMessage(
        agent.name,
        `⚡ [AGY: ${agent.cadre}] ${output}`,
        'chat',
        { agentId: agent.id, durationMs, runId: record.runId }
      );
    } else {
      agent.toolActive = `agy:idle`;
      agent.state = 'IDLE';
    }

  }

  getStatus() {
    const jobs = [...this.jobs.values()].map((job) => ({
      runId: job.runId,
      agentId: job.agentId,
      agentName: job.agentName,
      workName: job.workName,
      path: job.path,
      startTime: job.startTime
    }));
    return {
      available: this.isAvailable(),
      binPath: AGY_BIN,
      isExecuting: this.isExecuting,
      currentJob: this.currentJob,
      jobs,
      totalRuns: this.totalRuns,
      lastRunTime: this.lastRunTime,
      recentRuns: this.executionHistory.slice(0, 10)
    };
  }
}

module.exports = { AgyBridge };
