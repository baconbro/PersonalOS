import { analyticsService } from '../services/analyticsService';

// Hook to track goal-related events
export const useGoalTracking = () => {
  const trackGoalCreated = (goalType: string, goalData?: Record<string, any>) => {
    analyticsService.trackGoalAction('created', goalType, goalData);
  };

  const trackGoalUpdated = (goalType: string, goalId: string, changes?: Record<string, any>) => {
    analyticsService.trackGoalAction('updated', goalType, { goalId, ...changes });
  };

  const trackGoalCompleted = (goalType: string, goalId: string, completionData?: Record<string, any>) => {
    analyticsService.trackGoalAction('completed', goalType, { goalId, ...completionData });
  };

  const trackGoalDeleted = (goalType: string, goalId: string) => {
    analyticsService.trackGoalAction('deleted', goalType, { goalId });
  };

  const trackWeeklyReview = (reviewData?: Record<string, any>) => {
    analyticsService.trackWeeklyReviewCompletion(reviewData);
  };

  const trackAIUsage = (feature: string, context: string, metadata?: Record<string, any>) => {
    analyticsService.trackAIInteraction(feature, context);
    if (metadata) {
      analyticsService.trackEvent('ai_feature_used', {
        feature,
        context,
        ...metadata
      });
    }
  };

  return {
    trackGoalCreated,
    trackGoalUpdated,
    trackGoalCompleted,
    trackGoalDeleted,
    trackWeeklyReview,
    trackAIUsage
  };
};
