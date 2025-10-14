# Copilot Instructions for Personal OS

## Project Overview
Personal OS is a React TypeScript strategic goal management system implementing a three-tier planning framework: Life Goals → Annual Plans → Quarterly OKRs → Weekly Tasks. Built with Vite, Firebase, and shadcn/ui components.

## Architecture & Data Flow

### State Management Pattern
- **Centralized State**: `src/context/AppContext.tsx` manages ALL app state via reducer pattern
- **Firebase Sync**: `FirebaseService` syncs to Firestore at `users/{userId}/{collection}`
- **localStorage Fallback**: `LocalStorageService` provides offline capability
- **Cascading Updates**: Changes propagate up the hierarchy automatically via `progressCalculation.ts`
  - Weekly task completion → updates quarterly goal progress
  - Quarterly goal updates → recalculates annual goal progress  
  - Annual goal changes → updates parent life goal progress

### Key Data Types (`src/types/index.ts`)
```typescript
LifeGoal → AnnualGoal → QuarterlyGoal → WeeklyTask
// Each child has parentId references: lifeGoalId, annualGoalId, etc.
// Progress flows upward through the hierarchy
```

## Critical Patterns

### Security (ALL user inputs MUST follow this)
Always use these utilities from `src/utils/security.ts`:
```typescript
import { validateGoalTitle, validateGoalDescription, sanitizeText } from '../utils/security';

// BEFORE saving ANY user input:
const titleValidation = validateGoalTitle(title);
if (!titleValidation.valid) {
  setTitleError(titleValidation.error);
  return;
}
const sanitizedTitle = sanitizeText(title); // Always sanitize before storage
```
See `QuarterlySprint.tsx` lines 174-212 for reference implementation.

### Routing System
- Custom `routerService.ts` handles client-side routing (NO react-router)
- Use `useRouter()` hook for navigation: `navigateTo('dashboard', false, { goalId })`
- Update `PAGE_TITLES` in `pageTitle.ts` when adding new views
- Analytics auto-tracked on all route changes

### UI Components
- Use Radix UI primitives from `src/components/ui/` (Dialog, Card, Button, etc.)
- Import from `./ui/component-name` NOT from npm
- Apply Ocean Palette colors from `src/styles/colors.ts`:
  ```typescript
  import { oceanPalette } from '../styles/colors';
  // Use oceanPalette.primary, oceanPalette.chart.deepBlue, etc.
  ```

### Firebase Integration
- Auth required for all data operations
- Data structure: `users/{userId}/lifeGoals`, `/annualGoals`, etc.
- Always convert Firestore Timestamps to Date objects (see `firebaseService.ts:21-32`)
- Security rules limit users to their own `userId` path only

## Development Workflows

### Running the App
```bash
npm run dev              # Dev server at localhost:5173
npm run build           # Production build
npm run firebase:deploy # Build + deploy to Firebase Hosting
```

### Adding a New Goal Type Feature
1. Add type definition to `src/types/index.ts`
2. Add reducer actions to `AppContext.tsx`
3. Create component in `src/components/`
4. Add route in `routerService.ts`
5. Update Firebase service methods
6. Apply security validation & sanitization
7. Test progress calculation cascades

### Task Rollover System
- **Automatic**: Mondays 6-10 AM via `taskRolloverService.ts`
- **Manual**: User-triggered via "Check Rollover" button
- Only rolls over incomplete tasks (`status: 'todo' | 'in-progress'`)
- Logs all rollovers as `SYSTEM_ROLLOVER` activity type
- See `TASK_ROLLOVER_DOCUMENTATION.md` for full details

## Common Gotchas

1. **Date Handling**: Firebase returns Timestamps, always convert with `.toDate()`
2. **Dispatch Returns**: Context dispatch is sync, but Firebase write is async
3. **Progress Calc**: Call `updateLifeGoalFromAnnualProgress()` after annual goal changes
4. **Form Resets**: Always reset validation errors when closing dialogs
5. **Rich Text**: Use `RichTextEditor` component, NOT raw textareas for descriptions
6. **Analytics**: Import from `services/analyticsService`, events auto-tracked on navigation
7. **Toasts**: Use `toastService.show()` for user feedback, NOT alert()

## File Organization
```
src/
  components/     # All React components (200+ LOC each)
  context/        # AppContext + AuthContext
  hooks/          # useRouter, usePageTitle, etc.
  lib/            # firebase.ts, firebaseService.ts, localStorageService.ts
  services/       # routerService, analyticsService, notificationService, etc.
  styles/         # colors.ts (Ocean Palette)
  types/          # All TypeScript interfaces
  utils/          # security.ts, progressCalculation.ts, exportImport.ts, etc.
```

## Current Sprint Focus (Oct 2025)
- OKR system with Key Results tracking (see `QuarterlySprint.tsx` for pattern)
- Rich text editing capabilities (TipTap integration)
- Activity logging and audit trails
- Cross-quarter navigation (prev/next quarter browsing)
