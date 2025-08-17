// Debug script to test life goal deletion persistence
// const fs = require('fs');

// Simulate the localStorage structure
const testState = {
  lifeGoals: [
    { id: '1', title: 'Test Goal 1', category: 'Career' },
    { id: '2', title: 'Test Goal 2', category: 'Health' },
    { id: '3', title: 'Test Goal 3', category: 'Finance' }
  ],
  annualGoals: [],
  quarterlyGoals: [],
  weeklyTasks: [],
  weeklyReviews: [],
  activityLogs: [],
  currentYear: 2025,
  currentQuarter: 3
};

console.log('Initial state:');
console.log('Life goals:', testState.lifeGoals.map(g => g.title));

// Simulate deletion
const goalIdToDelete = '2';
const updatedState = {
  ...testState,
  lifeGoals: testState.lifeGoals.filter(goal => goal.id !== goalIdToDelete)
};

console.log('\nAfter deletion:');
console.log('Life goals:', updatedState.lifeGoals.map(g => g.title));

// Test if the filter works correctly
console.log('\nFilter test passed:', updatedState.lifeGoals.length === 2);
console.log('Goal 2 removed:', !updatedState.lifeGoals.find(g => g.id === '2'));
