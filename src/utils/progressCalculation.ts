import type { LifeGoal, AnnualGoal } from '../types';

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
