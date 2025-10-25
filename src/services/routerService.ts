export type ViewType = 'dashboard' | 'annual' | 'quarterly' | 'weekly' | 'this-week' | 'life-goals' | 'guide' | 'goals-table' | 'bucket-list' | 'weekly-huddle' | 'goal-tree';

export interface RouteConfig {
  path: string;
  view: ViewType;
  title: string;
  requiresAuth: boolean;
}

export interface DynamicRouteMatch {
  view: ViewType;
  title: string;
  requiresAuth: boolean;
  params: Record<string, string>;
}

export interface NavigationParams {
  goalType?: string;
  goalId?: string;
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    view: 'dashboard',
    title: 'Dashboard',
    requiresAuth: true
  },
  {
    path: '/dashboard',
    view: 'dashboard',
    title: 'Dashboard',
    requiresAuth: true
  },
  {
    path: '/life-goals',
    view: 'life-goals',
    title: 'Life Goals',
    requiresAuth: true
  },
  {
    path: '/annual',
    view: 'annual',
    title: 'Annual Plan',
    requiresAuth: true
  },
  {
    path: '/quarterly',
    view: 'quarterly',
    title: 'Quarterly Sprint',
    requiresAuth: true
  },
  {
    path: '/this-week',
    view: 'this-week',
    title: 'This Week',
    requiresAuth: true
  },
  {
    path: '/weekly-huddle',
    view: 'weekly-huddle',
    title: 'Weekly Command Huddle',
    requiresAuth: true
  },
  {
    path: '/weekly',
    view: 'weekly',
    title: 'Weekly Review',
    requiresAuth: true
  },
  {
    path: '/goal-tree',
    view: 'goal-tree',
    title: 'Goal Tree',
    requiresAuth: true
  },
  {
    path: '/guide',
    view: 'guide',
    title: 'User Guide',
    requiresAuth: true
  },
  {
    path: '/bucket-list',
    view: 'bucket-list',
    title: 'Bucket List',
    requiresAuth: true
  },
  {
    path: '/goals-table',
    view: 'goals-table',
    title: 'Goals Table',
    requiresAuth: true
  }
];

// Route patterns for dynamic routes
export const dynamicRoutePatterns = [
  {
    pattern: /^\/goals-table\/([^\/]+)\/([^\/]+)$/,
    view: 'goals-table' as ViewType,
    title: 'Goal Details',
    requiresAuth: true,
    params: ['goalType', 'goalId']
  }
];

class RouterService {
  private currentPath = '/';
  private currentParams: Record<string, string> = {};
  private listeners: Array<(path: string, view: ViewType, params?: Record<string, string>) => void> = [];

  constructor() {
    this.currentPath = window.location.pathname;
    this.parseCurrentRoute();
    this.setupPopstateListener();
  }

  private setupPopstateListener() {
    window.addEventListener('popstate', () => {
      this.currentPath = window.location.pathname;
      this.parseCurrentRoute();
      const route = this.getRouteByPath(this.currentPath);
      const dynamicMatch = this.matchDynamicRoute(this.currentPath);
      
      if (route) {
        this.notifyListeners(this.currentPath, route.view);
      } else if (dynamicMatch) {
        this.currentParams = dynamicMatch.params;
        this.notifyListeners(this.currentPath, dynamicMatch.view, dynamicMatch.params);
      }
    });
  }

  private parseCurrentRoute() {
    const dynamicMatch = this.matchDynamicRoute(this.currentPath);
    if (dynamicMatch) {
      this.currentParams = dynamicMatch.params;
    } else {
      this.currentParams = {};
    }
  }

  private matchDynamicRoute(path: string): DynamicRouteMatch | null {
    for (const pattern of dynamicRoutePatterns) {
      const match = path.match(pattern.pattern);
      if (match) {
        const params: Record<string, string> = {};
        pattern.params.forEach((paramName, index) => {
          params[paramName] = match[index + 1];
        });
        return {
          view: pattern.view,
          title: pattern.title,
          requiresAuth: pattern.requiresAuth,
          params
        };
      }
    }
    return null;
  }

  // Navigate to a view with URL update
  navigateTo(view: ViewType, replace = false, params?: NavigationParams) {
    let targetPath: string;
    
    if (params && view === 'goals-table' && params.goalType && params.goalId) {
      // Navigate to goal details with dynamic route
      targetPath = `/goals-table/${params.goalType}/${params.goalId}`;
      this.currentParams = { goalType: params.goalType, goalId: params.goalId };
    } else {
      // Navigate to static route
      const route = this.getRouteByView(view);
      if (!route) {
        console.warn(`No route found for view: ${view}`);
        return;
      }
      targetPath = route.path;
      this.currentParams = {};
    }

    this.currentPath = targetPath;
    
    if (replace) {
      window.history.replaceState({}, '', targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
    }

    this.notifyListeners(targetPath, view, this.currentParams);
  }

  // Get current path
  getCurrentPath(): string {
    return this.currentPath;
  }

  // Get route by path
  getRouteByPath(path: string): RouteConfig | undefined {
    return routes.find(route => route.path === path);
  }

  // Get route by view
  getRouteByView(view: ViewType): RouteConfig | undefined {
    return routes.find(route => route.view === view);
  }

  // Get initial view from current URL
  getInitialView(): ViewType {
    const route = this.getRouteByPath(window.location.pathname);
    if (route) {
      return route.view;
    }
    
    const dynamicMatch = this.matchDynamicRoute(window.location.pathname);
    if (dynamicMatch) {
      return dynamicMatch.view;
    }
    
    return 'dashboard';
  }

  // Check if current path requires authentication
  requiresAuth(path?: string): boolean {
    const targetPath = path || this.currentPath;
    const route = this.getRouteByPath(targetPath);
    return route?.requiresAuth ?? true;
  }

  // Add navigation listener
  addListener(listener: (path: string, view: ViewType, params?: Record<string, string>) => void) {
    this.listeners.push(listener);
  }

  // Remove navigation listener
  removeListener(listener: (path: string, view: ViewType, params?: Record<string, string>) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Notify all listeners of navigation change
  private notifyListeners(path: string, view: ViewType, params?: Record<string, string>) {
    this.listeners.forEach(listener => listener(path, view, params));
  }

  // Generate URL for a view
  getUrlForView(view: ViewType, params?: NavigationParams): string {
    if (params && view === 'goals-table' && params.goalType && params.goalId) {
      return `/goals-table/${params.goalType}/${params.goalId}`;
    }
    
    const route = this.getRouteByView(view);
    return route?.path || '/';
  }

  // Get current route parameters
  getCurrentParams(): Record<string, string> {
    return { ...this.currentParams };
  }

  // Check if current view matches
  isCurrentView(view: ViewType): boolean {
    const route = this.getRouteByPath(this.currentPath);
    const dynamicMatch = this.matchDynamicRoute(this.currentPath);
    
    if (route) {
      return route.view === view;
    } else if (dynamicMatch) {
      return dynamicMatch.view === view;
    }
    
    return false;
  }
}

export const routerService = new RouterService();
