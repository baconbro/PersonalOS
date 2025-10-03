# Analytics and URL Routing Implementation

This document describes the new analytics tracking and URL routing system implemented in PersonalOS.

## Overview

The app now includes:
1. **Firebase Analytics** - Track user interactions and page views
2. **URL Routing** - Each page has a unique URL for better navigation and analytics
3. **Analytics Service** - Centralized tracking of user actions

## URL Structure

Each page in the app now has a dedicated URL:

### Static Routes
- `/` or `/dashboard` - Main dashboard
- `/life-goals` - Life goals management
- `/annual` - Annual planning
- `/quarterly` - Quarterly sprint planning
- `/this-week` - Current week tasks
- `/weekly` - Weekly review
- `/guide` - User guide
- `/goals-table` - Goals table view
- `/welcome` - Landing page
- `/login` - Authentication page

### Dynamic Routes
- `/goals-table/{goalType}/{goalId}` - Individual goal details
  - Example: `/goals-table/life/my-career-goal`
  - Example: `/goals-table/annual/fitness-2024`
  - Example: `/goals-table/quarterly/q3-revenue-target`
  - Example: `/goals-table/weekly/weekly-review-prep`

## Analytics Tracking

### Page Views
Every page navigation is automatically tracked with:
- Page name
- URL path
- Timestamp
- User context (new vs returning)

### Events Tracked
1. **Goal Actions**
   - Goal creation, updates, completion, deletion
   - Goal type and metadata

2. **User Engagement**
   - Feature usage duration
   - Component interactions

3. **AI Interactions**
   - Chatbot usage
   - AI suggestions acceptance
   - Context and interaction type

4. **Weekly Reviews**
   - Completion tracking
   - Review quality metrics

### Implementation

#### Analytics Service (`src/services/analyticsService.ts`)
Centralized service for all analytics tracking:

```typescript
// Track page views
analyticsService.trackPageView('dashboard', { additionalData });

// Track goal actions
analyticsService.trackGoalAction('created', 'life-goal', { goalData });

// Track user engagement
analyticsService.trackEngagement('weekly-review', duration);
```

#### Router Service (`src/services/routerService.ts`)
Manages URL routing and navigation:

```typescript
// Navigate to a page
routerService.navigateTo('dashboard');

// Get URL for a view
const url = routerService.getUrlForView('life-goals');
```

#### useRouter Hook (`src/hooks/useRouter.ts`)
React hook for components to use routing:

```typescript
const { currentView, navigateTo, getUrlForView } = useRouter();
```

#### useGoalTracking Hook (`src/hooks/useGoalTracking.ts`)
Convenient hook for tracking goal-related actions:

```typescript
const { trackGoalCreated, trackWeeklyReview } = useGoalTracking();
```

## Firebase Configuration

To enable analytics, ensure your Firebase config includes `measurementId`:

```typescript
const firebaseConfig = {
  // ... other config
  measurementId: "G-XXXXXXXXXX" // Your Analytics measurement ID
};
```

Analytics will be automatically initialized if:
1. Firebase is properly configured
2. `measurementId` is provided
3. Analytics is supported in the environment

## Benefits

1. **Better User Insights**: Track how users interact with different features
2. **Performance Monitoring**: Understand which pages are most/least used
3. **Feature Adoption**: Monitor adoption of new features
4. **User Journey**: Understand user flow through the application
5. **SEO-Friendly URLs**: Each page has a meaningful URL
6. **Bookmarkable Pages**: Users can bookmark specific sections
7. **Better Navigation**: Browser back/forward buttons work correctly

## Usage Examples

### Tracking Goal Creation
```typescript
// In a goal creation component
const { trackGoalCreated } = useGoalTracking();

const handleCreateGoal = (goalData) => {
  // ... create goal logic
  trackGoalCreated('life-goal', {
    category: goalData.category,
    priority: goalData.priority
  });
};
```

### Navigation with Analytics
```typescript
// Navigation automatically tracks page views
const { navigateTo } = useRouter();

// Navigate to static pages
const handleViewChange = () => {
  navigateTo('quarterly'); // Automatically tracked
};

// Navigate to goal details with parameters
const handleGoalView = (goalId: string, goalType: string) => {
  navigateTo('goals-table', false, { goalType, goalId });
  // Automatically tracks with goal context
};
```

### Goal Detail URL Examples
```typescript
// Navigate to specific goals programmatically
navigateTo('goals-table', false, { 
  goalType: 'life', 
  goalId: 'career-advancement' 
});
// Results in URL: /goals-table/life/career-advancement

// Users can bookmark and share these URLs:
// - /goals-table/annual/health-goals-2024
// - /goals-table/quarterly/revenue-q4
// - /goals-table/weekly/team-standup-prep
```

### Custom Event Tracking
```typescript
// Track custom events
analyticsService.trackEvent('feature_used', {
  feature_name: 'ai_chatbot',
  context: 'goal_planning',
  duration_ms: 15000
});
```

## Privacy Considerations

- Analytics tracking respects user privacy
- Only functional analytics data is collected
- No personally identifiable information is tracked without consent
- Users can see analytics status in browser developer tools

## Development vs Production

- In development mode, analytics events are logged to console
- In production, events are sent to Firebase Analytics
- Error handling prevents analytics failures from affecting app functionality

## Monitoring

Check the browser console for analytics status:
- `📊 Firebase Analytics initialized successfully`
- `📊 Analytics: Page view tracked - [page_name]`
- `📊 Analytics: Event tracked - [event_name]`

This implementation provides comprehensive analytics tracking while maintaining clean, navigable URLs for each page of the PersonalOS application.
