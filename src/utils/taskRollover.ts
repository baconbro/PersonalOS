import { startOfWeek, endOfWeek, addWeeks, isWithinInterval } from 'date-fns';
import type { WeeklyTask } from '../types';

/**
 * Utility functions for automatic task rollover
 */

/**
 * Get tasks for a specific week
 */
export function getTasksForWeek(tasks: WeeklyTask[], weekDate: Date): WeeklyTask[] {
  const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });
  
  return tasks.filter(task =>
    isWithinInterval(task.weekOf, { start: weekStart, end: weekEnd })
  );
}

/**
 * Get incomplete tasks from a specific week
 */
export function getIncompleteTasksForWeek(tasks: WeeklyTask[], weekDate: Date): WeeklyTask[] {
  const weekTasks = getTasksForWeek(tasks, weekDate);
  
  return weekTasks.filter(task => {
    const status = task.status || (task.completed ? 'done' : 'todo');
    return status !== 'done' && !task.completed;
  });
}

/**
 * Create rolled over tasks for the next week
 */
export function createRolledOverTasks(incompleteTasks: WeeklyTask[], nextWeekDate: Date): WeeklyTask[] {
  const nextWeekStart = startOfWeek(nextWeekDate, { weekStartsOn: 1 });
  
  return incompleteTasks.map(task => ({
    ...task,
    id: `rollover-${task.id}-${Date.now()}`, // New unique ID
    weekOf: nextWeekStart, // Move to next week
    actualHours: 0, // Reset actual hours
    roadblocks: [], // Clear roadblocks for fresh start
    notes: task.notes ? `${task.notes}\n\n[Rolled over from previous week]` : '[Rolled over from previous week]',
    // Keep the same status to preserve progress state
    // status and completed remain the same
  }));
}

/**
 * Check if automatic rollover should happen for a given week
 * Returns true if it's Monday and there are incomplete tasks from the previous week
 */
export function shouldPerformRollover(currentDate: Date = new Date()): boolean {
  const dayOfWeek = currentDate.getDay();
  const hour = currentDate.getHours();
  
  // Perform rollover on Monday morning (day 1) between 6 AM and 10 AM
  return dayOfWeek === 1 && hour >= 6 && hour <= 10;
}

/**
 * Get the previous week date
 */
export function getPreviousWeek(currentDate: Date = new Date()): Date {
  return addWeeks(currentDate, -1);
}

/**
 * Check if rollover has already been performed for the current week
 * This prevents duplicate rollovers by checking if any tasks exist with rollover indicators
 */
export function hasRolloverBeenPerformed(tasks: WeeklyTask[], currentWeekDate: Date): boolean {
  const currentWeekTasks = getTasksForWeek(tasks, currentWeekDate);
  
  // Check if any tasks have rollover indicators in their ID or notes
  return currentWeekTasks.some(task => 
    task.id.startsWith('rollover-') || 
    task.notes?.includes('[Rolled over from previous week]')
  );
}

/**
 * Main rollover function that handles the complete rollover process (automatic rollover)
 */
export function performTaskRollover(
  allTasks: WeeklyTask[], 
  currentDate: Date = new Date()
): { shouldRollover: boolean; rolledOverTasks: WeeklyTask[] } {
  // Check if rollover should happen
  if (!shouldPerformRollover(currentDate)) {
    return { shouldRollover: false, rolledOverTasks: [] };
  }
  
  // Check if rollover has already been performed this week
  if (hasRolloverBeenPerformed(allTasks, currentDate)) {
    return { shouldRollover: false, rolledOverTasks: [] };
  }
  
  // Get incomplete tasks from previous week
  const previousWeek = getPreviousWeek(currentDate);
  const incompleteTasks = getIncompleteTasksForWeek(allTasks, previousWeek);
  
  // If no incomplete tasks, no rollover needed
  if (incompleteTasks.length === 0) {
    return { shouldRollover: false, rolledOverTasks: [] };
  }
  
  // Create rolled over tasks
  const rolledOverTasks = createRolledOverTasks(incompleteTasks, currentDate);
  
  return { shouldRollover: true, rolledOverTasks };
}

/**
 * Manual rollover function that bypasses timing restrictions
 */
export function performManualTaskRollover(
  allTasks: WeeklyTask[], 
  currentDate: Date = new Date()
): { shouldRollover: boolean; rolledOverTasks: WeeklyTask[] } {
  console.log('performManualTaskRollover: Starting manual rollover');
  
  // Check if rollover has already been performed this week
  if (hasRolloverBeenPerformed(allTasks, currentDate)) {
    console.log('performManualTaskRollover: Rollover already performed this week');
    return { shouldRollover: false, rolledOverTasks: [] };
  }
  
  // Get incomplete tasks from previous week
  const previousWeek = getPreviousWeek(currentDate);
  console.log('performManualTaskRollover: Previous week date:', previousWeek);
  
  const incompleteTasks = getIncompleteTasksForWeek(allTasks, previousWeek);
  console.log('performManualTaskRollover: Found incomplete tasks:', incompleteTasks.length);
  
  // If no incomplete tasks, no rollover needed
  if (incompleteTasks.length === 0) {
    console.log('performManualTaskRollover: No incomplete tasks found');
    return { shouldRollover: false, rolledOverTasks: [] };
  }
  
  // Create rolled over tasks
  const rolledOverTasks = createRolledOverTasks(incompleteTasks, currentDate);
  console.log('performManualTaskRollover: Created rolled over tasks:', rolledOverTasks.length);
  
  return { shouldRollover: true, rolledOverTasks };
}
