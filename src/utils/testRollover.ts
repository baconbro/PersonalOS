import { startOfWeek, subWeeks } from 'date-fns';
import type { WeeklyTask } from '../types';

/**
 * Utility to create test data for rollover functionality
 */

export function createTestTasksForRollover(): WeeklyTask[] {
  const currentWeek = new Date();
  const lastWeek = subWeeks(currentWeek, 1);
  const lastWeekStart = startOfWeek(lastWeek, { weekStartsOn: 1 });

  return [
    // Incomplete task from last week - should be rolled over
    {
      id: 'test-incomplete-1',
      title: 'Review quarterly goals',
      description: 'Complete analysis of Q4 objectives',
      quarterlyGoalId: '',
      priority: 'high',
      estimatedHours: 2,
      actualHours: 0.5,
      completed: false,
      status: 'in-progress',
      weekOf: lastWeekStart,
      roadblocks: ['Need more data'],
      notes: 'Started but need to finish'
    },
    
    // Another incomplete task from last week
    {
      id: 'test-incomplete-2',
      title: 'Prepare presentation slides',
      description: 'Create slides for team meeting',
      quarterlyGoalId: '',
      priority: 'medium',
      estimatedHours: 3,
      actualHours: 0,
      completed: false,
      status: 'todo',
      weekOf: lastWeekStart,
      roadblocks: [],
      notes: 'Need to start this'
    },
    
    // Completed task from last week - should NOT be rolled over
    {
      id: 'test-completed-1',
      title: 'Send monthly report',
      description: 'Complete and send monthly status report',
      quarterlyGoalId: '',
      priority: 'high',
      estimatedHours: 1,
      actualHours: 1.5,
      completed: true,
      status: 'done',
      weekOf: lastWeekStart,
      roadblocks: [],
      notes: 'Completed on Friday'
    }
  ];
}

/**
 * Test function to manually trigger rollover (for development/testing)
 */
export function testRolloverFunctionality() {
  const testTasks = createTestTasksForRollover();
  console.log('🧪 Test tasks created:', testTasks);
  
  // Import and test rollover functions
  import('../utils/taskRollover').then(({ performTaskRollover }) => {
    const result = performTaskRollover(testTasks, new Date());
    console.log('🔄 Rollover test result:', result);
    
    if (result.shouldRollover) {
      console.log(`✅ ${result.rolledOverTasks.length} tasks would be rolled over:`);
      result.rolledOverTasks.forEach(task => {
        console.log(`  - "${task.title}" (${task.status})`);
      });
    } else {
      console.log('ℹ️ No rollover needed at this time');
    }
  });
}

/**
 * Demo function to add test tasks to the current app state
 * Call this from browser console: window.addTestTasksToApp()
 */
export function addTestTasksToCurrentWeek() {
  const testTasks = createTestTasksForRollover();
  console.log('🧪 Adding test tasks to current app state...');
  
  // This will be replaced by actual dispatch when called from a component
  return testTasks;
}

// Add to window for easy testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testRollover = testRolloverFunctionality;
  (window as any).createTestTasks = createTestTasksForRollover;
  (window as any).addTestTasks = addTestTasksToCurrentWeek;
  
  // Add a helper message
  console.log(`
🔄 Task Rollover Testing Utilities Available:
• window.testRollover() - Test rollover logic
• window.createTestTasks() - Generate test tasks
• window.addTestTasks() - Add test tasks to app

For full testing, use the TaskRolloverSettings page in the app.
  `);
}
