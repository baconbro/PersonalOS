import type { AppState, CheckIn } from '../types';

// Discrete RL actions (subset mapped to requirements)
export type RLAction =
  | 'SUGGEST_TASK'
  | 'PRIORITIZE_PILLAR'
  | 'SUGGEST_TIME_BLOCK'
  | 'SUGGEST_REST'
  | 'SUGGEST_LOW_EFFORT'
  | 'SUGGEST_SOCIAL'
  | 'PROMPT_REFLECTION'
  | 'INITIATE_WEEKLY_REVIEW';

export interface RLEventLog {
  id: string;
  timestamp: Date;
  stateKey: string;
  features: number[];
  action: RLAction;
  reward: number;
  qBefore?: number;
  qAfter?: number;
  epsilon: number; // retained for backward compat (same as epsilonAfter)
  epsilonBefore?: number;
  epsilonAfter?: number;
  explore?: boolean; // true if action chosen via exploration
  rewardComponents?: {
    dKR: number;
    tasks: number;
    wellbeing: number;
    burnout: number;
    w1: number; w2: number; w3: number; w4: number;
    total: number;
  };
  prevStateKey?: string;
  prevAction?: RLAction;
  nextMax?: number;
  qTop?: Array<{ action: RLAction; q: number }>; // top Q entries for current state
  stepIndex?: number;
  dtMs?: number;
  featuresDetail?: Array<{ label: string; raw: number; norm: number }>;
  alpha?: number; // learning rate used
  gamma?: number; // discount used
  saved?: boolean;
  error?: string;
  note?: string;
}

interface QTable {
  [stateKey: string]: { [action in RLAction]?: number };
}

interface RLEngineConfig {
  alpha: number; // learning rate
  gamma: number; // discount factor
  epsilon: number; // exploration rate
  epsilonMin: number;
  epsilonDecay: number; // multiplicative decay
  w1: number; // ΔKR_Progress weight
  w2: number; // Tasks_Completed weight
  w3: number; // Wellbeing_Score weight
  w4: number; // Burnout_Penalty weight
  verbose?: boolean; // dev console tracing
}

const DEV_ONLY = import.meta.env.MODE !== 'production';
const STORAGE_KEY = 'rl-engine-data';

type Listener = (log: RLEventLog) => void;

interface Totals {
  krProgressAvg: number;
  tasksCompletedWeek: number;
  wellbeing: number;
  burnoutSignals: number;
}

class RLEngine {
  private q: QTable = {};
  private config: RLEngineConfig = {
    alpha: 0.3,
    gamma: 0.9,
    epsilon: 0.2,
    epsilonMin: 0.02,
    epsilonDecay: 0.995,
    w1: 3.0,
    w2: 1.0,
    w3: 1.5,
  w4: 2.0,
  verbose: true,
  };
  private lastSnapshot: {
    stateKey: string;
    features: number[];
    action: RLAction | null;
    totals: Totals;
  } | null = null;
  private listeners: Listener[] = [];
  private getStateFn: (() => AppState) | null = null;
  private buffer: RLEventLog[] = [];
  private readonly maxBuffer = 300;
  private stepCounter = 0;
  private lastStepAt: number | null = null;

  init(getState: () => AppState) {
    if (!DEV_ONLY) return; // Only run in dev
    this.getStateFn = getState;
    this.load();
  if (this.config.verbose) console.debug('[RL] init (dev only). epsilon=', this.config.epsilon);
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(log: RLEventLog) {
    if (!DEV_ONLY) return;
    // add to ring buffer
    this.buffer.unshift(log);
    if (this.buffer.length > this.maxBuffer) this.buffer.pop();
    if (this.config.verbose) {
      console.groupCollapsed('[RL] step', log.id);
      console.log('time', log.timestamp.toISOString());
      console.log('stateKey', log.stateKey);
      console.log('features', log.features);
      console.log('action', log.action);
      console.log('reward', log.reward);
      console.log('qBefore', log.qBefore, 'qAfter', log.qAfter);
      console.log('epsilon', log.epsilon);
      if (log.note) console.log('note', log.note);
      console.groupEnd();
    }
    for (const l of this.listeners) l(log);
  }

  getRecentLogs(): RLEventLog[] {
    return [...this.buffer];
  }

  clearLogs() {
    this.buffer = [];
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.q = parsed.q || {};
        this.config = { ...this.config, ...(parsed.config || {}) };
      }
    } catch {}
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ q: this.q, config: this.config }));
    } catch {}
  }

  private allActions: RLAction[] = [
    'SUGGEST_TASK',
    'PRIORITIZE_PILLAR',
    'SUGGEST_TIME_BLOCK',
    'SUGGEST_REST',
    'SUGGEST_LOW_EFFORT',
    'SUGGEST_SOCIAL',
    'PROMPT_REFLECTION',
    'INITIATE_WEEKLY_REVIEW',
  ];

  // Build a compact state feature vector and a discrete key
  private buildFeatures(state: AppState): { key: string; vec: number[]; totals: Totals } {
    // KR progress avg & velocity proxy
    const krList = state.quarterlyGoals.flatMap(q => q.keyResults || []);
    const krProgressAvg = krList.length ? krList.reduce((s, kr) => s + (kr.currentValue / Math.max(kr.targetValue || 1, 1)), 0) / krList.length : 0;
    // Velocity (very rough): difference vs previous stored avg in last snapshot
    const prevAvg = this.lastSnapshot?.totals.krProgressAvg ?? krProgressAvg;
    const krVelocity = krProgressAvg - prevAvg; // could be negative

    // Tasks completed this week
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const tasksCompletedWeek = state.weeklyTasks.filter(t => t.completed && new Date(t.weekOf) >= weekAgo).length;

    // Task density: tasks scheduled this week
    const taskDensity = state.weeklyTasks.filter(t => new Date(t.weekOf) >= weekAgo).length / 10; // normalize ~0..1

    // Energy & focus from recent check-in
    const lastCheckIn: CheckIn | undefined = state.checkIns[0];
    const energy = lastCheckIn ? lastCheckIn.energyLevel / 5 : 0.5;
    const focus = lastCheckIn ? lastCheckIn.focusLevel / 5 : 0.5;
    const wellbeing = (energy + focus) / 2;

    // Burnout signals proxy: low energy/focus or too many tasks (>20) over week
    const burnoutSignals = Math.max(0, (1 - wellbeing) * 0.6 + Math.min(1, state.weeklyTasks.filter(t => new Date(t.weekOf) >= weekAgo).length / 20) * 0.4);

    // Planning consistency: weekly reviews last 4 weeks
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const reviewsCount = state.weeklyReviews.filter(r => new Date(r.weekOf) >= fourWeeksAgo).length;
    const planningConsistency = Math.min(1, reviewsCount / 4);

    const vec = [
      this.clip01(krProgressAvg),
      this.clip01((krVelocity + 0.1) / 0.2), // map ~[-0.1,0.1] to [0,1]
      this.clip01(tasksCompletedWeek / 10),
      this.clip01(taskDensity),
      this.clip01(wellbeing),
      this.clip01(burnoutSignals),
      this.clip01(planningConsistency),
    ];

    // Discretize to buckets for key
    const buckets = vec.map(v => Math.round(v * 4)); // 0..4 buckets
    const key = buckets.join('|');
    return { key, vec, totals: { krProgressAvg, tasksCompletedWeek, wellbeing, burnoutSignals } };
  }

  private clip01(x: number) { return Math.max(0, Math.min(1, x)); }

  private chooseAction(stateKey: string): { action: RLAction; qVal: number; explore: boolean; epsilonBefore: number } {
    const qRow = (this.q[stateKey] ||= {});
    // Epsilon-greedy
    const epsilonBefore = this.config.epsilon;
    if (Math.random() < this.config.epsilon) {
      const action = this.allActions[Math.floor(Math.random() * this.allActions.length)];
      if (this.config.verbose) console.debug('[RL] explore action', action, 'state', stateKey);
      return { action, qVal: qRow[action] ?? 0, explore: true, epsilonBefore };
    }
    let best: RLAction = this.allActions[0];
    let bestQ = -Infinity;
    for (const a of this.allActions) {
      const val = qRow[a] ?? 0;
      if (val > bestQ) { bestQ = val; best = a; }
    }
    if (this.config.verbose) console.debug('[RL] exploit action', best, 'q', bestQ === -Infinity ? 0 : bestQ, 'state', stateKey);
    return { action: best, qVal: bestQ === -Infinity ? 0 : bestQ, explore: false, epsilonBefore };
  }

  // reward computation inlined in step() to also expose components in logs

  // One training step: observe, choose, (optionally) update using prior snapshot
  step(): void {
    if (!DEV_ONLY || !this.getStateFn) return;
    const app = this.getStateFn();
    const { key, vec, totals } = this.buildFeatures(app);
  if (this.config.verbose) console.debug('[RL] step begin. stateKey=', key);

    let reward = 0;
    let qBefore: number | undefined;
    let qAfter: number | undefined;
    let usedAction: RLAction;
    const stepIndex = ++this.stepCounter;
    const nowTs = Date.now();
    const dtMs = this.lastStepAt ? (nowTs - this.lastStepAt) : undefined;

    const { action, qVal, explore, epsilonBefore } = this.chooseAction(key);
    usedAction = action;
    qBefore = qVal;
    // Build features detail for logging (reconstruct from app + lastSnapshot)
    const lastAvg = this.lastSnapshot?.totals.krProgressAvg ?? totals.krProgressAvg;
    const krVelocity = totals.krProgressAvg - lastAvg;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const tasksScheduled = app.weeklyTasks.filter(t => new Date(t.weekOf) >= weekAgo).length;
    const taskDensity = tasksScheduled / 10;
    const planningConsistencyRaw = (() => {
      const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
      const reviewsCount = app.weeklyReviews.filter(r => new Date(r.weekOf) >= fourWeeksAgo).length;
      return Math.min(1, reviewsCount / 4);
    })();
    const featuresDetail = [
      { label: 'KR progress avg', raw: totals.krProgressAvg, norm: this.clip01(totals.krProgressAvg) },
      { label: 'KR velocity', raw: krVelocity, norm: this.clip01((krVelocity + 0.1) / 0.2) },
      { label: 'Tasks completed (7d)', raw: totals.tasksCompletedWeek, norm: this.clip01(totals.tasksCompletedWeek / 10) },
      { label: 'Task density (7d)', raw: tasksScheduled, norm: this.clip01(taskDensity) },
      { label: 'Wellbeing', raw: totals.wellbeing, norm: this.clip01(totals.wellbeing) },
      { label: 'Burnout proxy', raw: totals.burnoutSignals, norm: this.clip01(totals.burnoutSignals) },
      { label: 'Planning consistency (4w)', raw: planningConsistencyRaw, norm: this.clip01(planningConsistencyRaw) },
    ];

    // If we have a previous (state, action), update Q with reward from transition
    if (this.lastSnapshot && this.lastSnapshot.action) {
      const prev = this.lastSnapshot;
      // compute reward + components
      const dKR = totals.krProgressAvg - prev.totals.krProgressAvg;
      const dTasks = totals.tasksCompletedWeek - prev.totals.tasksCompletedWeek;
      const wellbeing = totals.wellbeing;
      const burnout = totals.burnoutSignals;
      reward = this.config.w1 * dKR + this.config.w2 * dTasks + this.config.w3 * wellbeing - this.config.w4 * burnout;
      // Q-learning update
      const prevRow = (this.q[prev.stateKey] ||= {});
      const prevAction = prev.action as RLAction; // non-null due to guard
      const prevQ = prevRow[prevAction] ?? 0;
      const nextMax = Math.max(...this.allActions.map(a => (this.q[key]?.[a] ?? 0)));
      const updated = prevQ + this.config.alpha * (reward + this.config.gamma * nextMax - prevQ);
      prevRow[prevAction] = updated;
      qAfter = updated;
  let saved = true; let error: string | undefined;
  try { this.save(); } catch (e: any) { saved = false; error = e?.message || 'save failed'; }
      // Decay epsilon
      this.config.epsilon = Math.max(this.config.epsilonMin, this.config.epsilon * this.config.epsilonDecay);
  if (this.config.verbose) console.debug('[RL] update Q', { prevState: prev.stateKey, prevAction, prevQ, nextMax, updated, reward, epsilon: this.config.epsilon });
      const epsilonAfter = this.config.epsilon;

      // compute top Q for current state
      const row = (this.q[key] ||= {});
      const qTop = this.allActions
        .map(a => ({ action: a, q: row[a] ?? 0 }))
        .sort((a,b) => b.q - a.q)
        .slice(0, 3);

      this.lastSnapshot = { stateKey: key, features: vec, action: usedAction, totals };

      const log: RLEventLog = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        stateKey: key,
        features: vec,
        action: usedAction,
        reward,
        qBefore,
        qAfter,
        epsilon: epsilonAfter,
        epsilonBefore,
        epsilonAfter,
        explore,
        rewardComponents: { dKR, tasks: dTasks, wellbeing, burnout, w1: this.config.w1, w2: this.config.w2, w3: this.config.w3, w4: this.config.w4, total: reward },
        prevStateKey: prev.stateKey,
        prevAction: prevAction,
        nextMax,
        qTop,
        stepIndex,
        dtMs,
  featuresDetail,
  alpha: this.config.alpha,
  gamma: this.config.gamma,
  saved,
  error,
      };
      this.emit(log);
      this.lastStepAt = nowTs;
      return;
    }

    // First step: no update yet, just snapshot and log context
    this.lastSnapshot = { stateKey: key, features: vec, action: usedAction, totals };
    const row = (this.q[key] ||= {});
    const qTop = this.allActions
      .map(a => ({ action: a, q: row[a] ?? 0 }))
      .sort((a,b) => b.q - a.q)
      .slice(0, 3);
    const epsilonAfter = this.config.epsilon; // unchanged on first step
    const log: RLEventLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      stateKey: key,
      features: vec,
      action: usedAction,
      reward: 0,
      qBefore,
      qAfter,
      epsilon: epsilonAfter,
      epsilonBefore,
      epsilonAfter,
      explore,
      qTop,
      stepIndex,
      dtMs,
      featuresDetail,
      alpha: this.config.alpha,
      gamma: this.config.gamma,
      note: 'initial snapshot (no Q update this step)'
    };
    this.emit(log);
    this.lastStepAt = nowTs;
  }

  // Utilities for dev UI
  setVerbose(v: boolean) { this.config.verbose = v; this.save(); }
  resetQTable() { this.q = {}; this.save(); }
  exportData() { return { q: this.q, config: this.config }; }
  getQSummary(topN = 10) {
    const states = Object.keys(this.q);
    let totalEntries = 0;
    const pairs: Array<{ stateKey: string; action: RLAction; q: number }> = [];
    for (const sk of states) {
      const row = this.q[sk] || {};
      for (const a of this.allActions) {
        const q = row[a];
        if (q !== undefined) { totalEntries++; pairs.push({ stateKey: sk, action: a, q }); }
      }
    }
    const values = pairs.map(p => p.q).sort((a,b)=>a-b);
    const mean = values.length ? values.reduce((s,v)=>s+v,0)/values.length : 0;
    const p50 = values.length ? values[Math.floor(0.5*(values.length-1))] : 0;
    const p90 = values.length ? values[Math.floor(0.9*(values.length-1))] : 0;
    const max = values.length ? values[values.length-1] : 0;
    const top = [...pairs].sort((a,b)=>b.q-a.q).slice(0, topN);
    return { uniqueStates: states.length, totalEntries, top, stats: { mean, p50, p90, max } };
  }
}

export const rlEngine = new RLEngine();
