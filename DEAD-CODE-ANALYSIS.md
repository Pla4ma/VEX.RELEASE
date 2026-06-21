# Dead Code Analysis Report
Generated: 2026-06-21

## Summary
- **Files analyzed**: 6 target directories
- **Files confirmed dead**: 89 files (source) + 29 files (tests) = 118 total
- **Files kept (still in use)**: 3 files in `src/analytics/`

## Deleted Directories (entirely dead)

### 1. `archive/` — 1 file
Already excluded from tsconfig.json. Contains archived economy system code.

### 2. `src/accessibility/` — 51 files
**Zero external imports.** No file in the codebase imports from `src/accessibility/`.
The only "accessibility" references outside are:
- `src/shared/accessibility/` (separate directory, different module)
- React Native `accessibilityLabel`/`accessibilityRole` props (standard RN, not this module)

### 3. `src/animation/` — 15 files
**Zero external imports.** No file imports from `src/animation/` outside the module.
Jest config has `@animation/` alias but it's never used.

### 4. `jobs/` — 28 files (27 source + 1 test)
Server-side Trigger.dev batch jobs. `trigger.config.ts` in repo root points here.
NOT part of the Expo app build. tsconfig.json excludes it.
Referenced by `shared/jobs/` which is also dead from app perspective.

### 5. `shared/jobs/` — 13 files
Server-side-only types/schemas/constants. Only imported by `jobs/`.
The barrel index itself warns: "SERVER-SIDE ONLY — Do NOT import this module in client-side Expo/React Native code."

## Partially Dead Directories

### 6. `src/analytics/` — 24 dead files (out of 26 total)
**2 files are LIVE** (imported by 8+ files externally):
- `AnalyticsService.ts` — used by api/validation, ErrorBoundary, streaks, notifications, challenges, retention-loop, events
- `hooks/useAnalytics.ts` — used by 2 streak hooks

**24 files are DEAD** (only referenced within the module, not from outside):
- `index.ts` (barrel), all ABTestingFramework files, VEXAnalyticsInfrastructure files,
  ab-*, constants, dashboard, engagement, monetization, paywall, retention, streak,
  streaks, types, and the entire `ab-testing/` subdirectory

## Files NOT deleted (still in use)

- `src/analytics/AnalyticsService.ts` — used by 8+ external files
- `src/analytics/hooks/useAnalytics.ts` — used by 2 external files
- All `__tests__/` and `__mocks__/` directories (per instructions)
