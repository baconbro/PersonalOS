import { getAnalytics, logEvent, setCurrentScreen, setUserId } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';
import app, { isFirebaseConfigured } from '../lib/firebase';

class AnalyticsService {
  private analytics: Analytics | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!isFirebaseConfigured) {
      console.warn('⚠️ Firebase Analytics not initialized - Firebase config missing');
      return;
    }

    try {
      this.analytics = getAnalytics(app);
      this.isInitialized = true;
      console.log('📊 Firebase Analytics initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Analytics:', error);
    }
  }

  // Track page views with custom parameters
  trackPageView(pageName: string, additionalParams?: Record<string, any>) {
    if (!this.isInitialized || !this.analytics) return;

    try {
      // Set the current screen name
      setCurrentScreen(this.analytics, pageName);

      // Log a custom page_view event with additional context
      logEvent(this.analytics, 'page_view', {
        page_title: this.getPageTitle(pageName),
        page_location: window.location.href,
        page_path: window.location.pathname,
        screen_name: pageName,
        ...additionalParams
      });

      console.log(`📊 Analytics: Page view tracked - ${pageName}`);
    } catch (error) {
      console.error('❌ Failed to track page view:', error);
    }
  }

  // Track user actions
  trackEvent(eventName: string, parameters?: Record<string, any>) {
    if (!this.isInitialized || !this.analytics) return;

    try {
      logEvent(this.analytics, eventName, {
        timestamp: Date.now(),
        ...parameters
      });

      console.log(`📊 Analytics: Event tracked - ${eventName}`, parameters);
    } catch (error) {
      console.error('❌ Failed to track event:', error);
    }
  }

  // Track goal-related actions
  trackGoalAction(action: string, goalType: string, additionalData?: Record<string, any>) {
    this.trackEvent('goal_action', {
      action,
      goal_type: goalType,
      ...additionalData
    });
  }

  // Track goal detail views
  trackGoalDetailView(goalId: string, goalType: string, additionalData?: Record<string, any>) {
    this.trackEvent('goal_detail_viewed', {
      goal_id: goalId,
      goal_type: goalType,
      view_source: 'goals_table',
      ...additionalData
    });
  }

  // Track user engagement
  trackEngagement(feature: string, duration?: number) {
    this.trackEvent('user_engagement', {
      feature,
      engagement_time_msec: duration || 0
    });
  }

  // Track weekly review completion
  trackWeeklyReviewCompletion(reviewData?: Record<string, any>) {
    this.trackEvent('weekly_review_completed', {
      completion_time: Date.now(),
      ...reviewData
    });
  }

  // Track AI interactions
  trackAIInteraction(interactionType: string, context: string) {
    this.trackEvent('ai_interaction', {
      interaction_type: interactionType,
      context,
      timestamp: Date.now()
    });
  }



  // Set user properties for better analytics
  setUserProperties(userId: string, properties?: Record<string, any>) {
    if (!this.isInitialized || !this.analytics) return;

    try {
      setUserId(this.analytics, userId);
      
      if (properties) {
        // Log user properties as custom events since setUserProperties isn't directly available
        this.trackEvent('user_properties_updated', properties);
      }

      console.log('📊 Analytics: User properties set');
    } catch (error) {
      console.error('❌ Failed to set user properties:', error);
    }
  }

  // Helper to get readable page titles
  private getPageTitle(pageName: string): string {
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard - Personal OS',
      'life-goals': 'Life Goals - Personal OS',
      'annual': 'Annual Plan - Personal OS',
      'quarterly': 'Quarterly Sprint - Personal OS',
      'this-week': 'This Week - Personal OS',
      'weekly': 'Weekly Review - Personal OS',
      'guide': 'User Guide - Personal OS',
      'goals-table': 'Goals Table - Personal OS',
      'welcome': 'Welcome - Personal OS',
      'login': 'Login - Personal OS'
    };

    return titles[pageName] || `${pageName} - Personal OS`;
  }

  // Check if analytics is available
  isAvailable(): boolean {
    return this.isInitialized && this.analytics !== null;
  }
}

export const analyticsService = new AnalyticsService();
