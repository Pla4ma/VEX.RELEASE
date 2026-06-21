# Dead Code Analysis Report
Generated: 2026-06-21

## Summary
- **Files analyzed**: 6 target directories (highest probability dead code)
- **Files deleted**: 134 files, ~12,474 lines removed
- **Files kept**: 2 files in `src/analytics/` (still actively imported)

## Deleted Directories (entirely dead)

### 1. `archive/` — 1 file ✅
Already excluded from tsconfig.json. Contains archived economy chest system code.

### 2. `src/accessibility/` — 51 files ✅
**Zero external imports.** No file outside this directory imports from it.
The `src/events/types/accessibility.ts` file is a separate local event types file (not related).
The `src/shared/accessibility/` directory is a separate, still-used module.

### 3. `src/animation/` — 15 files ✅
**Zero external imports.** The `EnterAnimation` component is in `src/shared/ui/components/`, not here.
The `ConfettiCelebration` component was unreferenced by any screen or feature.

### 4. `jobs/` — 28 files ✅
Server-side Trigger.dev batch jobs. `trigger.config.ts` pointed to this directory.
NOT part of the Expo app build. `tsconfig.json` excludes it.

### 5. `shared/jobs/` — 13 files ✅
Server-side-only types/schemas/constants. Only imported by `jobs/` directory.
The barrel index warns: "SERVER-SIDE ONLY — Do NOT import this module in client-side code."

## Partially Dead Directory

### 6. `src/analytics/` — 24 files deleted (out of 26 total) ✅

**2 files KEPT** (confirmed imported by 10+ external files):
| File | Imported By |
|------|------------|
| `AnalyticsService.ts` | api/validation, ErrorBoundary, streaks, notifications, challenges, retention-loop, events (10 files) |
| `hooks/useAnalytics.ts` | streaks hooks (2 files) |

**24 files deleted** (only referenced within the module, never from outside):
- `index.ts` (barrel) — barrel re-exports nothing that's used
- `ABTestingFramework.ts`, `ABTestingFramework-types.ts` — never imported
- `VEXAnalyticsInfrastructure.ts`, `VEXAnalyticsInfrastructure.types.ts` — never imported
- `ab-testing/` entire subdirectory (3 files) — only imported by ABTestingFramework.ts
- `ab-*.ts` files (7 files) — A/B testing infrastructure, never used
- `constants.ts`, `dashboard.ts`, `engagement.ts`, `monetization.ts`, `paywall.ts`, `retention.ts`, `streak.ts`, `streaks.ts`, `types.ts` — never imported externally

## Config Cleanup
- Removed `@animation/`, `@a11y/`, `@analytics/` jest module aliases (directories don't exist or aren't used)
- Removed `jest.config.jobs.js` (jobs/ deleted)
- Removed `trigger.config.ts` (jobs/ deleted)
- Cleaned dead paths from `testPathIgnorePatterns`

## Verification
- ✅ No dangling imports to any deleted files
- ✅ All remaining `src/analytics/` imports resolve correctly
- ✅ All `src/shared/accessibility/` imports still work (separate directory)
- ✅ All `src/shared/ui/components/EnterAnimation` imports still work
- ✅ Committed as `00485a7f`
