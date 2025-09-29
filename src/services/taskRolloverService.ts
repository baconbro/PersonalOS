import { performTaskRollover, getIncompleteTasksForWeek, getPreviousWeek } from '../utils/taskRollover';
import type { WeeklyTask } from '../types';

/**
 * Rollover data containing tasks to add and remove
 */
interface RolloverData {
  tasksToAdd: WeeklyTask[];
  tasksToRemove: WeeklyTask[];
}

/**
 * Task Rollover Service
 * Handles automatic rollover of incomplete tasks to the next week
 */
export class TaskRolloverService {
  private static instance: TaskRolloverService;
  private rolloverCallbacks: Array<(data: RolloverData) => void> = [];
  private isInitialized = false;

  private constructor() {}

  static getInstance(): TaskRolloverService {
    if (!TaskRolloverService.instance) {
      TaskRolloverService.instance = new TaskRolloverService();
    }
    return TaskRolloverService.instance;
  }

  /**
   * Initialize the rollover service with periodic checks
   */
  initialize(): void {
    if (this.isInitialized) return;

    // Check for rollover every hour during business hours
    const checkInterval = 60 * 60 * 1000; // 1 hour in milliseconds
    
    setInterval(() => {
      this.checkAndPerformRollover();
    }, checkInterval);

    // Also check immediately on initialization
    setTimeout(() => {
      this.checkAndPerformRollover();
    }, 5000); // Wait 5 seconds after app load

    this.isInitialized = true;
    console.log('🔄 Task Rollover Service initialized');
  }

  /**
   * Register a callback to be called when rollover tasks are created
   */
  onRollover(callback: (data: RolloverData) => void): void {
    this.rolloverCallbacks.push(callback);
  }

  /**
   * Remove a rollover callback
   */
  offRollover(callback: (data: RolloverData) => void): void {
    this.rolloverCallbacks = this.rolloverCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Manually trigger rollover check (useful for testing or manual triggers)
   */
  async checkAndPerformRollover(currentTasks?: WeeklyTask[]): Promise<void> {
    try {
      if (!currentTasks) {
        // If no tasks provided, we need to get them from the current state
        // This will be handled by the component that calls this service
        console.log('⚠️ No tasks provided to rollover service');
        return;
      }

      const { shouldRollover, rolledOverTasks } = performTaskRollover(currentTasks);

      if (shouldRollover && rolledOverTasks.length > 0) {
        console.log(`🔄 Rolling over ${rolledOverTasks.length} incomplete tasks to current week`);
        
        // Get the original incomplete tasks that need to be removed
        const previousWeek = getPreviousWeek();
        const originalIncompleteTasks = getIncompleteTasksForWeek(currentTasks, previousWeek);
        
        // Notify all registered callbacks with both tasks to add and remove
        const rolloverData: RolloverData = {
          tasksToAdd: rolledOverTasks,
          tasksToRemove: originalIncompleteTasks
        };
        
        this.rolloverCallbacks.forEach(callback => {
          try {
            callback(rolloverData);
          } catch (error) {
            console.error('Error in rollover callback:', error);
          }
        });

        // Log the rollover activity
        this.logRolloverActivity(rolledOverTasks.length);
      }
    } catch (error) {
      console.error('Error performing task rollover:', error);
    }
  }

  /**
   * Log rollover activity for user awareness
   */
  private logRolloverActivity(taskCount: number): void {
    console.log(`✅ Successfully rolled over ${taskCount} task${taskCount === 1 ? '' : 's'} to current week`);
    
    // You could extend this to show a toast notification or add to activity log
    // For now, just console log for development
  }

  /**
   * Get rollover statistics
   */
  getRolloverStats(tasks: WeeklyTask[]): {
    totalTasks: number;
    completedTasks: number;
    incompleteTasks: number;
    rolloverRate: number;
  } {
    const totalTasks = tasks.length;
    const rolloverTasks = tasks.filter(task => 
      task.id.startsWith('rollover-') || 
      task.notes?.includes('[Rolled over from previous week]')
    );
    const completedTasks = rolloverTasks.filter(task => 
      task.status === 'done' || task.completed
    ).length;
    const incompleteTasks = rolloverTasks.length - completedTasks;
    const rolloverRate = totalTasks > 0 ? (rolloverTasks.length / totalTasks) * 100 : 0;

    return {
      totalTasks: rolloverTasks.length,
      completedTasks,
      incompleteTasks,
      rolloverRate: Math.round(rolloverRate * 100) / 100
    };
  }
}

// Export singleton instance
export const taskRolloverService = TaskRolloverService.getInstance();
