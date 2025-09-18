import type { LifeGoal, AnnualGoal, QuarterlyGoal } from '../types';

/**
 * Calculate life goal progress based on connected annual goals
 * @param lifeGoalId - The ID of the life goal
 * @param annualGoals - Array of all annual goals
 * @returns Progress percentage (0-100)
 */
export function calculateLifeGoalProgress(lifeGoalId: string, annualGoals: AnnualGoal[]): number {
  const relatedAnnualGoals = annualGoals.filter(goal => goal.lifeGoalId === lifeGoalId);
  
  if (relatedAnnualGoals.length === 0) {
    return 0; // No annual goals connected, so no progress
  }
  
  // Calculate average progress of all connected annual goals
  const totalProgress = relatedAnnualGoals.reduce((sum, goal) => sum + goal.progress, 0);
  return Math.round(totalProgress / relatedAnnualGoals.length);
}

/**
 * Get status based on progress percentage
 * @param progress - Progress percentage (0-100)
 * @returns Goal status
 */
export function getStatusFromProgress(progress: number): 'not-started' | 'in-progress' | 'completed' {
  if (progress === 100) return 'completed';
  if (progress > 0) return 'in-progress';
  return 'not-started';
}

/**
 * Update life goal progress and status based on annual goals
 * @param lifeGoal - The life goal to update
 * @param annualGoals - Array of all annual goals
 * @returns Updated life goal or null if no update needed
 */
export function updateLifeGoalFromAnnualProgress(lifeGoal: LifeGoal, annualGoals: AnnualGoal[]): LifeGoal | null {
  const calculatedProgress = calculateLifeGoalProgress(lifeGoal.id, annualGoals);
  
  // Only update if progress has changed
  if (lifeGoal.progress !== calculatedProgress) {
    const updatedStatus = getStatusFromProgress(calculatedProgress);
    
    return {
      ...lifeGoal,
      progress: calculatedProgress,
      status: updatedStatus
    };
  }
  
  return null; // No update needed
}

/**
 * Get annual goals related to a specific life goal
 * @param lifeGoalId - The ID of the life goal
 * @param annualGoals - Array of all annual goals
 * @returns Array of related annual goals
 */
export function getRelatedAnnualGoals(lifeGoalId: string, annualGoals: AnnualGoal[]): AnnualGoal[] {
  return annualGoals.filter(goal => goal.lifeGoalId === lifeGoalId);
}

/**
 * Calculate progress for an annual goal based on its quarterly goals
 * @param annualGoalId - The ID of the annual goal
 * @param quarterlyGoals - Array of all quarterly goals
 * @returns Calculated progress percentage (0-100)
 */
export function calculateAnnualGoalProgress(annualGoalId: string, quarterlyGoals: QuarterlyGoal[]): number {
  const relatedQuarterly = getRelatedQuarterlyGoals(annualGoalId, quarterlyGoals);
  
  if (relatedQuarterly.length === 0) {
    return 0; // No quarterly goals, so 0% progress
  }
  
  const totalProgress = relatedQuarterly.reduce((sum, goal) => sum + goal.progress, 0);
  return Math.round(totalProgress / relatedQuarterly.length);
}

/**
 * Update annual goal progress and status based on quarterly goals
 * @param annualGoal - The annual goal to update
 * @param quarterlyGoals - Array of all quarterly goals
 * @returns Updated annual goal or null if no update needed
 */
export function updateAnnualGoalFromQuarterlyProgress(annualGoal: AnnualGoal, quarterlyGoals: QuarterlyGoal[]): AnnualGoal | null {
  const calculatedProgress = calculateAnnualGoalProgress(annualGoal.id, quarterlyGoals);
  
  // Only update if progress has changed
  if (annualGoal.progress !== calculatedProgress) {
    const updatedStatus = getStatusFromProgress(calculatedProgress);
    
    return {
      ...annualGoal,
      progress: calculatedProgress,
      status: updatedStatus
    };
  }
  
  return null; // No update needed
}

/**
 * Get quarterly goals related to a specific annual goal
 * @param annualGoalId - The ID of the annual goal
 * @param quarterlyGoals - Array of all quarterly goals
 * @returns Array of related quarterly goals
 */
export function getRelatedQuarterlyGoals(annualGoalId: string, quarterlyGoals: QuarterlyGoal[]): QuarterlyGoal[] {
  return quarterlyGoals.filter(goal => goal.annualGoalId === annualGoalId);
}
