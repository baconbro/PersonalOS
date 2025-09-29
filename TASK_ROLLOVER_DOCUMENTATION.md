# Task Rollover System Documentation

## Overview

The Task Rollover System automatically transfers incomplete tasks from one week to the next, ensuring that unfinished work doesn't fall through the cracks. This system helps maintain continuity in weekly planning and execution.

## Features

### Automatic Rollover
- **When**: Monday mornings between 6:00 AM and 10:00 AM
- **What**: Tasks with status 'todo' or 'in-progress' that are not completed
- **How**: Creates new task instances for the current week while preserving original status

### Manual Rollover
- Users can manually trigger rollover checks at any time
- Useful for testing or immediate rollover needs
- Available through dashboard prompts and settings page

### Smart Detection
- Prevents duplicate rollovers for the same week
- Only rolls over genuinely incomplete tasks
- Preserves task status to maintain progress context

## Implementation Details

### Core Components

1. **TaskRolloverService** (`/src/services/taskRolloverService.ts`)
   - Singleton service managing rollover operations
   - Periodic background checks every hour
   - Callback system for UI updates

2. **Rollover Utilities** (`/src/utils/taskRollover.ts`)
   - Core rollover logic and date calculations
   - Week-based task filtering
   - Rollover eligibility checking

3. **UI Components**
   - `TaskRolloverStatus`: Shows rollover prompts and statistics
   - `TaskRolloverSettings`: Admin interface for configuration and testing

### Data Flow

```
1. Service checks conditions (Monday morning 6-10 AM)
2. Identifies incomplete tasks from previous week
3. Creates rolled-over task copies with new IDs
4. Updates weekOf date to current week
5. Preserves status and adds rollover notation
6. Dispatches ADD_WEEKLY_TASK actions
7. Logs SYSTEM_ROLLOVER activity
```

### Task Transformation

When a task is rolled over:
- **New ID**: `rollover-{originalId}-{timestamp}`
- **Week Date**: Updated to current week start (Monday)
- **Status**: Preserved (todo/in-progress)
- **Actual Hours**: Reset to 0
- **Roadblocks**: Cleared for fresh start
- **Notes**: Appended with "[Rolled over from previous week]"

## User Experience

### Dashboard Integration
- Automatic prompts when incomplete tasks are detected
- One-click rollover buttons
- Visual statistics showing rollover success rates
- Non-intrusive presentation in dashboard view

### Settings & Control
- Toggle automatic rollover on/off
- Manual rollover triggers
- Testing tools for validation
- Comprehensive statistics and analytics

### Activity Tracking
- All rollovers logged as SYSTEM_ROLLOVER activities
- Timestamps and task counts recorded
- Manual vs automatic triggers differentiated

## Configuration

### Settings Storage
- User preferences stored in localStorage
- Key: `taskRolloverSettings`
- Default: automatic rollover enabled

### Timing Configuration
- Monday morning window: 6:00 AM - 10:00 AM
- Check interval: every hour during business hours
- Configurable through service parameters

## Testing

### Manual Testing
1. Create incomplete tasks for previous week
2. Navigate to TaskRolloverSettings page
3. Click "Test Rollover" button
4. Verify tasks are duplicated with proper transformations

### Browser Console Testing
```javascript
// Create test tasks
const testTasks = window.createTestTasks();

// Test rollover logic
window.testRollover();
```

### Automated Testing
- Unit tests for rollover utilities
- Integration tests for service functionality
- UI component testing for user interactions

## Troubleshooting

### Common Issues

1. **Rollover not triggering**
   - Check if current time is within Monday 6-10 AM window
   - Verify automatic rollover is enabled in settings
   - Ensure incomplete tasks exist from previous week

2. **Duplicate rollovers**
   - System prevents duplicates using rollover indicators
   - Check task IDs for "rollover-" prefix
   - Verify notes contain rollover notation

3. **Tasks not preserving status**
   - Confirm status field exists on original tasks
   - Check task migration logic in AppContext
   - Verify rollover transformation preserves status

### Debug Information
- Console logs prefixed with 🔄 for rollover operations
- Activity logs with SYSTEM_ROLLOVER type
- Service initialization logs with 🔄 prefix

## Performance Considerations

- Rollover checks run hourly, not continuously
- Minimal impact on app startup and performance
- Efficient date-based task filtering
- Background Firebase sync doesn't block UI

## Future Enhancements

1. **Smart Rollover**
   - AI-powered task priority adjustment
   - Context-aware rollover suggestions
   - Adaptive timing based on user patterns

2. **Rollover Rules**
   - Custom rollover conditions
   - Category-based rollover settings
   - Priority-based rollover filtering

3. **Analytics Dashboard**
   - Rollover success rate trends
   - Most frequently rolled over task types
   - Weekly completion pattern analysis

## Security & Privacy

- All rollover logic runs client-side
- No external API calls for rollover operations
- User settings stored locally only
- Firebase sync maintains data consistency

## Browser Compatibility

- Modern browsers with ES6+ support
- Date-fns library for reliable date calculations
- LocalStorage for settings persistence
- No external dependencies for core functionality
