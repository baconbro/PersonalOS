import { useState, useEffect, useCallback } from 'react';
import { routerService } from '../services/routerService';
import type { ViewType, NavigationParams } from '../services/routerService';
import { analyticsService } from '../services/analyticsService';

export const useRouter = () => {
  const [currentView, setCurrentView] = useState<ViewType>(routerService.getInitialView());
  const [currentPath, setCurrentPath] = useState(routerService.getCurrentPath());
  const [currentParams, setCurrentParams] = useState<Record<string, string>>(routerService.getCurrentParams());

  useEffect(() => {
    const handleNavigation = (path: string, view: ViewType, params?: Record<string, string>) => {
      setCurrentPath(path);
      setCurrentView(view);
      setCurrentParams(params || {});
      
      // Track page view in analytics with additional context
      analyticsService.trackPageView(view, {
        path,
        timestamp: Date.now(),
        params: params || {},
        goal_id: params?.goalId,
        goal_type: params?.goalType
      });
    };

    routerService.addListener(handleNavigation);

    return () => {
      routerService.removeListener(handleNavigation);
    };
  }, []);

  const navigateTo = useCallback((view: ViewType, replace = false, params?: NavigationParams) => {
    routerService.navigateTo(view, replace, params);
  }, []);

  const getUrlForView = useCallback((view: ViewType, params?: NavigationParams) => {
    return routerService.getUrlForView(view, params);
  }, []);

  const isCurrentView = useCallback((view: ViewType) => {
    return routerService.isCurrentView(view);
  }, [currentView]);

  return {
    currentView,
    currentPath,
    currentParams,
    navigateTo,
    getUrlForView,
    isCurrentView
  };
};
