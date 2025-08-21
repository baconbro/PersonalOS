// Types and interfaces for Personal OS

export type ActivityType = 
  | 'LIFE_GOAL_CREATED'
  | 'LIFE_GOAL_UPDATED'
  | 'LIFE_GOAL_DELETED'
  | 'QUARTERLY_GOAL_CREATED'
  | 'QUARTERLY_GOAL_UPDATED'
  | 'QUARTERLY_GOAL_DELETED'
  | 'QUARTERLY_GOAL_COMPLETED'
  | 'WEEKLY_TASK_CREATED'
  | 'WEEKLY_TASK_UPDATED'
  | 'WEEKLY_TASK_COMPLETED'
  | 'WEEKLY_TASK_DELETED'
  | 'WEEKLY_REVIEW_COMPLETED'
  | 'WEEKLY_HUDDLE_COMPLETED'
  | 'KEY_RESULT_UPDATED'
  | 'GOLDEN_THREAD_CREATED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'CHECK_IN_LOGGED';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  entityId?: string; // ID of the item that was modified
  entityType?: 'life_goal' | 'quarterly_goal' | 'weekly_task' | 'weekly_review' | 'check_in';
  metadata?: Record<string, any>; // Additional context data
}

export interface CheckIn {
  id: string;
  timestamp: Date;
  energyLevel: number; // 1-5 scale
  focusLevel: number; // 1-5 scale
  mood: string; // Emoji representation
  notes?: string; // Optional notes
}

export type LifeGoalCategory = 
  | 'Creativity & Passion'
  | 'Mind'
  | 'Career'
  | 'Finance'
  | 'Health'
  | 'Relationships'
  | 'Spirit'
  | 'Community'
  | 'Travel'
  | 'Giving Back'
  | 'Other';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  createdAt: Date;
  targetDate: Date;
  progress: number; // 0-100
}

export interface LifeGoal extends Goal {
  type: 'life';
  category: LifeGoalCategory;
  timeframe: 'five-year' | 'ten-year' | 'lifetime';
  annualGoals: string[]; // References to annual goal IDs
  vision: string; // Long-term vision statement
  customId?: string; // Optional custom ID from document data
}

export interface AnnualGoal extends Goal {
  type: 'annual';
  year: number;
  lifeGoalId?: string; // Optional reference to life goal
  quarterlyGoals: string[]; // References to quarterly goal IDs
  customId?: string; // Optional custom ID from document data
}

export interface QuarterlyGoal extends Goal {
  type: 'quarterly';
  quarter: 1 | 2 | 3 | 4;
  year: number;
  annualGoalId: string;
  keyResults: KeyResult[];
  weeklyTasks: string[]; // References to weekly task IDs
  customId?: string; // Optional custom ID from document data
}

export interface KeyResult {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  completed: boolean;
}

export interface WeeklyTask {
  id: string;
  title: string;
  description: string;
  quarterlyGoalId: string;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  actualHours?: number;
  completed: boolean;
  status: 'todo' | 'in-progress' | 'done'; // Required for Kanban board
  weekOf: Date;
  roadblocks: string[];
  notes: string;
  customId?: string; // Optional custom ID from document data
}

export interface WeeklyReviewData {
  id: string;
  weekOf: Date;
  completedTasks: string[];
  roadblocks: string[];
  learnings: string[];
  nextWeekPriorities: string[];
  lastWeekGoals: string[];
  lastWeekResults: string[];
  strategicCheckIn: string;
  overallProgress: number; // 0-100
  energyLevel: 1 | 2 | 3 | 4 | 5;
  customId?: string; // Optional custom ID from document data
  satisfaction: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

export interface DashboardStats {
  totalAnnualGoals: number;
  completedAnnualGoals: number;
  activeQuarterlyGoals: number;
  weeklyTasksCompleted: number;
  overallProgress: number;
  currentStreak: number;
  lastReviewDate: Date | null;
}

export interface AppState {
  lifeGoals: LifeGoal[];
  annualGoals: AnnualGoal[];
  quarterlyGoals: QuarterlyGoal[];
  weeklyTasks: WeeklyTask[];
  weeklyReviews: WeeklyReviewData[];
  activityLogs: ActivityLog[];
  checkIns: CheckIn[];
  currentYear: number;
  currentQuarter: 1 | 2 | 3 | 4;
  loading?: boolean;
}
