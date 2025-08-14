// Types and interfaces for Personal OS

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
}

export interface AnnualGoal extends Goal {
  type: 'annual';
  year: number;
  lifeGoalId?: string; // Optional reference to life goal
  quarterlyGoals: string[]; // References to quarterly goal IDs
}

export interface QuarterlyGoal extends Goal {
  type: 'quarterly';
  quarter: 1 | 2 | 3 | 4;
  year: number;
  annualGoalId: string;
  keyResults: KeyResult[];
  weeklyTasks: string[]; // References to weekly task IDs
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
  currentYear: number;
  currentQuarter: 1 | 2 | 3 | 4;
  loading?: boolean;
}
