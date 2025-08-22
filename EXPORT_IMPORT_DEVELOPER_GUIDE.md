# Personal OS Export / Import Developer Guide

This document explains the data backup/restore functionality: schema, validation, and merge/replace behavior.

## Bundle Format

- File type: JSON
- Root type: ExportBundle
- Versioned for forward migration

```
{
  "version": 1,
  "exportedAt": "2025-08-22T10:00:00.000Z",
  "data": { AppState }
}
```

Notes:
- Dates are serialized as ISO strings by JSON.stringify.
- During import we revive these back to Date instances.

## AppState Schema (subset)

- lifeGoals: LifeGoal[]
- annualGoals: AnnualGoal[]
- quarterlyGoals: QuarterlyGoal[]
- weeklyTasks: WeeklyTask[] (status is required; normalized if absent)
- weeklyReviews: WeeklyReviewData[]
- activityLogs: ActivityLog[]
- checkIns: CheckIn[]
- currentYear: number
- currentQuarter: 1|2|3|4

Object-level date fields revived:
- LifeGoal/AnnualGoal/QuarterlyGoal: createdAt, targetDate
- WeeklyTask: weekOf, createdAt, targetDate
- WeeklyReviewData: weekOf
- ActivityLog: timestamp
- CheckIn: timestamp

## Validation & Normalization

- validateExportBundle: ensures version===1, has exportedAt, data block exists
- toNormalizedState: revives Date fields and applies defaults
  - WeeklyTask.status: defaults to 'done' if completed else 'todo'
  - WeeklyTask.completed: synchronized with status
  - currentYear/currentQuarter: default to now if missing

## Merge Strategy

- Replace: incoming arrays overwrite existing arrays
- Merge: deduplicate by id, incoming items win on collision

Implementation: mergeById maps by id across arrays and returns combined list.

## UI Integration

- Settings → Data Export & Import section
- Export: createExportBundle(state) → downloadJson()
- Import: read file, JSON.parse, validateExportBundle, toNormalizedState, preview counts, then Apply Import
- Apply Import:
  - merged = mergeStates(existing, incoming, 'merge'|'replace')
  - LocalStorageService.save(merged)
  - dispatch({ type: 'LOAD_STATE', payload: merged })
  - Activity log recorded

## Firebase Considerations

- Export/Import currently operates on local AppState (localStorage). Firestore sync remains independent and will follow normal flows when entities get edited later.
- If you want import to push into Firestore immediately, wire through AppContext enhancedDispatch per-entity operations. That’s a larger change and is intentionally out of scope here.

## Error Handling

- Invalid JSON or version mismatch surfaces as an error banner in the import preview.
- We do not mutate state until Apply Import is clicked.

## Future Extensions

- Add CSV exporters for specific flat datasets
- Add entity-level selective import
- Support legacy versions with a migration pipeline

## File Locations

- Logic: src/utils/exportImport.ts
- UI: src/components/NotificationSettings.tsx (Data Export & Import section)
- Docs: EXPORT_IMPORT_DEVELOPER_GUIDE.md

```text
Contract (import):
- Input: File (application/json)
- Output: AppState applied to store
- Errors: Version mismatch, invalid shape, bad date strings
- Success: UI state refreshed, localStorage updated, activity logged
```
