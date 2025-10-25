// Page title management utility for LifePeak
// Provides context-aware page titles based on current view

type ViewType = 'dashboard' | 'annual' | 'quarterly' | 'weekly' | 'this-week' | 'life-goals' | 'guide' | 'goals-table' | 'bucket-list' | 'weekly-huddle' | 'goal-tree';

interface PageTitleConfig {
  title: string;
  description?: string;
}

/**
 * Page title configurations for each view
 */
const PAGE_TITLES: Record<ViewType, PageTitleConfig> = {
  'dashboard': {
    title: 'Dashboard',
    description: 'Overview of your goals and progress'
  },
  'life-goals': {
    title: 'Life Goals',
    description: 'Your long-term vision and life architecture'
  },
  'annual': {
    title: 'Annual Plan',
    description: 'This year\'s strategic objectives'
  },
  'quarterly': {
    title: 'Quarterly Sprint',
    description: 'Current quarter\'s OKRs and focus areas'
  },
  'this-week': {
    title: 'This Week',
    description: 'Your weekly priorities and tasks'
  },
  'weekly-huddle': {
    title: 'Weekly Command Huddle',
    description: 'Review, reflect, and plan your week'
  },
  'weekly': {
    title: 'Weekly Review',
    description: 'Reflect and plan for continuous improvement'
  },
  'goal-tree': {
    title: 'Goal Tree',
    description: 'Complete hierarchy of your goals and tasks'
  },
  'guide': {
    title: 'User Guide',
    description: 'Learn how to use LifePeak effectively'
  },
  'bucket-list': {
    title: 'Bucket List',
    description: 'Dreams, experiences, and things to accomplish'
  },
  'goals-table': {
    title: 'Goals Table',
    description: 'Professional table view of all your goals'
  }
};

/**
 * Base application name
 */
const APP_NAME = 'LifePeak';

/**
 * Updates the document title based on the current view
 * Optionally accepts context for dynamic titles
 */
export function updatePageTitle(view: ViewType, context?: {
  quarter?: number;
  year?: number;
  userName?: string;
  taskCount?: number;
  goalCount?: number;
}): void {
  const config = PAGE_TITLES[view];
  if (!config) {
    document.title = APP_NAME;
    return;
  }

  let title = config.title;

  // Add dynamic context to specific views
  if (context) {
    switch (view) {
      case 'quarterly':
        if (context.quarter && context.year) {
          title = `Q${context.quarter} ${context.year} Sprint`;
        }
        break;
      case 'annual':
        if (context.year) {
          title = `${context.year} Annual Plan`;
        }
        break;
      case 'this-week':
        if (context.taskCount !== undefined) {
          title = `This Week (${context.taskCount} tasks)`;
        }
        break;
      case 'dashboard':
        if (context.userName) {
          title = `Welcome, ${context.userName}`;
        }
        break;
    }
  }

  document.title = `${title} - ${APP_NAME}`;
}

/**
 * Gets the page title configuration for a view
 */
export function getPageConfig(view: ViewType): PageTitleConfig | null {
  return PAGE_TITLES[view] || null;
}

/**
 * Gets a formatted page title without updating the document
 */
export function getPageTitle(view: ViewType): string {
  const config = PAGE_TITLES[view];
  return config ? `${config.title} - ${APP_NAME}` : APP_NAME;
}

/**
 * Sets a custom page title (useful for dynamic content)
 */
export function setCustomPageTitle(title: string, subtitle?: string): void {
  if (subtitle) {
    document.title = `${title} - ${subtitle} - ${APP_NAME}`;
  } else {
    document.title = `${title} - ${APP_NAME}`;
  }
}

/**
 * Resets to the default application title
 */
export function resetPageTitle(): void {
  document.title = APP_NAME;
}
