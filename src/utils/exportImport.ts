import type { AppState, LifeGoal, AnnualGoal, QuarterlyGoal, WeeklyTask, WeeklyReviewData, ActivityLog, CheckIn } from '../types';

// Versioned export bundle to allow future migrations
export interface ExportBundle {
  version: 1;
  exportedAt: string; // ISO date string
  data: AppState;
}

// Prepare a clean, serializable snapshot of AppState
export function createExportBundle(state: AppState): ExportBundle {
  // JSON.stringify will turn Dates into ISO strings automatically
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: state,
  };
}

// Parse ISO date strings back into Date instances
function reviveDates<T extends Record<string, any>>(obj: T, dateKeys: string[]): T {
  const out: any = { ...obj };
  for (const key of dateKeys) {
    if (out[key] && typeof out[key] === 'string') {
      const d = new Date(out[key]);
      if (!isNaN(d.getTime())) out[key] = d;
    }
  }
  return out;
}

function normalizeWeeklyTask(task: any): WeeklyTask {
  const revived = reviveDates(task, ['weekOf', 'createdAt', 'targetDate']);
  const status = revived.status || (revived.completed ? 'done' : 'todo');
  return { ...revived, status, completed: status === 'done' || !!revived.completed } as WeeklyTask;
}

function normalizeLifeGoal(goal: any): LifeGoal {
  return reviveDates(goal, ['createdAt', 'targetDate']);
}

function normalizeAnnualGoal(goal: any): AnnualGoal {
  return reviveDates(goal, ['createdAt', 'targetDate']);
}

function normalizeQuarterlyGoal(goal: any): QuarterlyGoal {
  return reviveDates(goal, ['createdAt', 'targetDate']);
}

function normalizeWeeklyReview(review: any): WeeklyReviewData {
  return reviveDates(review, ['weekOf']);
}

function normalizeActivityLog(log: any): ActivityLog {
  return reviveDates(log, ['timestamp']);
}

function normalizeCheckIn(checkIn: any): CheckIn {
  return reviveDates(checkIn, ['timestamp']);
}

// Validate a rough shape of the bundle; throw on invalid
export function validateExportBundle(maybe: any): asserts maybe is ExportBundle {
  if (!maybe || typeof maybe !== 'object') throw new Error('Invalid file: not an object');
  if (maybe.version !== 1) throw new Error('Unsupported export version');
  if (!maybe.exportedAt || typeof maybe.exportedAt !== 'string') throw new Error('Missing exportedAt');
  if (!maybe.data || typeof maybe.data !== 'object') throw new Error('Missing data block');
}

// Convert raw bundle into a normalized AppState (dates revived, defaults applied)
export function toNormalizedState(bundle: ExportBundle): AppState {
  const data = bundle.data as any;
  return {
    lifeGoals: (data.lifeGoals || []).map(normalizeLifeGoal),
    annualGoals: (data.annualGoals || []).map(normalizeAnnualGoal),
    quarterlyGoals: (data.quarterlyGoals || []).map(normalizeQuarterlyGoal),
    weeklyTasks: (data.weeklyTasks || []).map(normalizeWeeklyTask),
    weeklyReviews: (data.weeklyReviews || []).map(normalizeWeeklyReview),
    activityLogs: (data.activityLogs || []).map(normalizeActivityLog),
    checkIns: (data.checkIns || []).map(normalizeCheckIn),
    currentYear: typeof data.currentYear === 'number' ? data.currentYear : new Date().getFullYear(),
    currentQuarter: [1,2,3,4].includes(data.currentQuarter) ? data.currentQuarter : (Math.ceil((new Date().getMonth() + 1) / 3) as 1|2|3|4),
  } as AppState;
}

// Merge arrays by item.id; imported items win by default
function mergeById<T extends { id: string }>(existing: T[], incoming: T[], strategy: 'merge' | 'replace'): T[] {
  if (strategy === 'replace') return [...incoming];
  const map = new Map<string, T>();
  for (const e of existing) map.set(e.id, e);
  for (const inc of incoming) map.set(inc.id, inc);
  return Array.from(map.values());
}

// Build a merged AppState given existing and imported states
export function mergeStates(existing: AppState, incoming: AppState, strategy: 'merge' | 'replace'): AppState {
  return {
    lifeGoals: mergeById(existing.lifeGoals, incoming.lifeGoals, strategy),
    annualGoals: mergeById(existing.annualGoals, incoming.annualGoals, strategy),
    quarterlyGoals: mergeById(existing.quarterlyGoals, incoming.quarterlyGoals, strategy),
    weeklyTasks: mergeById(existing.weeklyTasks, incoming.weeklyTasks, strategy),
    weeklyReviews: mergeById(existing.weeklyReviews, incoming.weeklyReviews, strategy),
    activityLogs: mergeById(existing.activityLogs, incoming.activityLogs, strategy),
    checkIns: mergeById(existing.checkIns, incoming.checkIns, strategy),
    currentYear: incoming.currentYear ?? existing.currentYear,
    currentQuarter: incoming.currentQuarter ?? existing.currentQuarter,
  };
}

export function downloadJson(filename: string, content: object) {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
