# PLAN: De-minify & Split VEX Codebase to ≤200 Lines Per File

## CONTEXT

VEX app at `C:\Users\jonat\CascadeProjects\vex-app-old`. Prettier has already been run across all source files. After formatting, **436 files exceed the 200-line limit** mandated in `AGENTS.md`. This plan documents exactly how to split each oversized file, organized by category and priority. No scripts are used — every split must be manual with typecheck verification after each file.

## PRE-REQUISITES (ALREADY DONE)

- `npx prettier --write "src/**/*.ts" "src/**/*.tsx"` — de-minification complete
- All files are now readable, multi-line TypeScript/TSX
- TypeScript 6.0.3 with strict mode

## ABSOLUTE RULES FOR THE AI AGENT

1. **Typecheck after EVERY file split**: `npx tsc --noEmit`. If errors, fix before moving on.
2. **Never use scripts for extraction.** All splits are manual copy/paste. This prevents the 2,620-error disaster.
3. **Export EVERYTHING needed.** When extracting to a new file, add `export` to all types/interfaces/functions that other files import. Check with `git grep "from.*OldFileName"` before extracting.
4. **Never change function signatures.** Only move code — no refactoring, no renaming, no "improvements".
5. **Keep original file as re-export barrel.** The original file should re-export from the new files so no other file's imports break.
6. **Run `npx tsc --noEmit` every 3-5 files.** Not optional. Catches breakage fast.
7. **Commit after every 10 successful splits.** Easy rollback if something goes wrong.

## CATEGORY OVERVIEW

| Category | Count | Strategy |
|----------|-------|----------|
| **Type Catalogs** (>80% types) | 21 | EXEMPT — these are pure type declaration files. 200-line rule is for logic, not data. |
| **validation/ files** | 6 | Extract each validator function to its own file |
| **Settings screens** | 6 | Extract sub-components (sections, rows, toggles) |
| **Profile screens** | 4 | Extract sections to sibling components |
| **ai-coach services** | 6 | Extract types, message generators, persona templates |
| **session-completion events** | 2 | Extract event type definitions |
| **Large components (>400 lines)** | ~25 | Extract sub-components, hooks, styles |
| **Large classes/services (>400 lines)** | ~15 | Extract helper methods, config, types |
| **Medium files (200-400 lines)** | ~290 | Split only if functional boundary exists; otherwise leave |

## EXEMPT FILES — DO NOT SPLIT

These are pure type/constant catalogs where splitting would HARM readability:

- `src/types/supabase.ts` (5,623 lines) — Auto-generated Supabase types. NEVER manually edit.
- `src/features/notifications/notification-event-types.ts` (595 lines) — Pure event type definitions
- `src/features/session-completion/completion-event-types.ts` (553 lines) — Pure event type definitions
- `src/features/session-start/types.ts` (520 lines) — Pure type definitions
- `src/features/session-start/types-types.ts` (519 lines) — Duplicate of above, delete this
- `src/events/event-definitions.ts` (470 lines) — Pure event definitions
- `src/features/ai-coach/types.ts` (396 lines) — Pure type definitions
- `src/features/notifications/types.ts` (378 lines) — Pure type definitions
- `src/features/content-study/types/index.ts` (297 lines) — Type aggregator
- `src/theme/types.ts` (252 lines) — Pure type definitions
- `src/types/models.ts` (252 lines) — Pure type definitions
- `src/events/types/session.ts` (322 lines) — Pure event types
- `src/events/types/analytics.ts` (245 lines) — Pure event types
- `src/navigation/types.ts` (208 lines) — Route param types
- `src/features/settings/types.ts` (206 lines) — Pure type definitions
- `src/features/session-completion/completion-core.ts` (203 lines) — Pure type definitions
- `src/features/session-completion/completion-experience.ts` (212 lines) — Pure type definitions
- `src/features/session-completion/completion-event-types-types.ts` (552 lines) — Delete this (duplicate)
- `src/features/notifications/notification-event-types-types.ts` (593 lines) — Delete this (duplicate)
- `src/events/event-definitions-types.ts` (468 lines) — Delete this (duplicate)
- `src/features/content-study/analytics-types.ts` (244 lines) — Delete this (duplicate)
- `src/features/session-start/types-types.ts` (519 lines) — Delete this (duplicate)

The `-types.ts` duplicates are artifacts from a failed script attempt. **Delete all `*-types.ts` files that end in `-types-types.ts`** (double suffix means the script ran twice on the same file).

## PHASE 1: CLEANUP — DELETE DUPLICATE FILES

Before any splitting, delete these files that are duplicate artifacts:

```
src/features/notifications/notification-event-types-types.ts  ← DELETE
src/features/session-completion/completion-event-types-types.ts ← DELETE
src/features/session-start/types-types.ts                       ← DELETE
src/events/event-definitions-types.ts                           ← DELETE
src/features/content-study/analytics-types.ts                   ← DELETE
```

**Verification after cleanup:**
```
npx tsc --noEmit
```
Must return 0 new errors. The original files with same exports still exist.

## PHASE 2: SESSION-START TYPES — DELETE DUPLICATE

`src/features/session-start/types.ts` (519 lines) and `src/features/session-start/types-types.ts` (519 lines) are identical. Delete `types-types.ts`. Verify no imports reference `types-types`:

```
git grep "types-types" src/
```
If any file imports from `types-types`, update to import from `types` instead.

## PHASE 3: VALIDATION FILES (6 files, highest impact)

All validation files are in `src/validation/`. They consist of many independent validator functions. Extract each function family to its own file.

### 3.1: `validation/performanceValidation.ts` (705 lines → target: each split ≤200)

This file has ~13 exported validation functions. Split by domain:

**New file: `validation/performance-metrics-validation.ts`**
Extract these functions (they validate performance metric types):
- `validateMetricName()`
- `validateMetricValue()`
- `validateMetricConfig()`
- `validatePerformanceMetrics()`

**New file: `validation/performance-threshold-validation.ts`**
Extract these functions:
- `validateThreshold()`
- `validateThresholdConfig()`
- `validateThresholdAlert()`

**New file: `validation/performance-report-validation.ts`**
Extract these functions:
- `validatePerformanceReport()`
- `validatePerformanceQuery()`
- `validatePerformanceFilter()`

**Original file `validation/performanceValidation.ts`** becomes a re-export barrel:
```typescript
export { validateMetricName, validateMetricValue, validateMetricConfig, validatePerformanceMetrics } from "./performance-metrics-validation";
export { validateThreshold, validateThresholdConfig, validateThresholdAlert } from "./performance-threshold-validation";
export { validatePerformanceReport, validatePerformanceQuery, validatePerformanceFilter } from "./performance-report-validation";
```

**Step-by-step for each extraction:**
1. Create new file with imports copied from original
2. Copy the target functions to new file
3. Add `export` to each function (if not already exported)
4. Delete those functions from original
5. Add re-export line to original
6. Run `npx tsc --noEmit`
7. Check for `Cannot find module` errors — if found, update imports in consuming files

### 3.2: `validation/businessValidation.ts` (701 lines)

Split similarly:

**New file: `validation/session-validation.ts`** — session-related validators
**New file: `validation/reward-validation.ts`** — reward economy validators  
**New file: `validation/user-progress-validation.ts`** — progress tracking validators
**Original**: barrel re-exporting all three

### 3.3: `validation/securityValidation.ts` (670 lines)

**New file: `validation/xss-validation.ts`** — XSS protection validators
**New file: `validation/sql-injection-validation.ts`** — SQL injection validators  
**New file: `validation/csrf-validation.ts`** — CSRF protection validators
**Original**: barrel re-exporting all three

### 3.4: `validation/dataValidation.ts` (606 lines)

Extract by data type family:
**New file: `validation/string-validation.ts`**
**New file: `validation/number-validation.ts`**
**New file: `validation/date-validation.ts`**
**New file: `validation/array-validation.ts`**
**New file: `validation/object-validation.ts`**
**Original**: barrel

### 3.5: `validation/formValidation.ts` (565 lines)

**New file: `validation/field-validation.ts`** — individual field validators
**New file: `validation/form-state-validation.ts`** — form state machine validators
**New file: `validation/form-submission-validation.ts`** — submission validation
**Original**: barrel

### 3.6: `validation/apiValidation.ts` (541 lines)

**New file: `validation/request-validation.ts`**
**New file: `validation/response-validation.ts`**
**New file: `validation/schema-validation.ts`**
**Original**: barrel

### 3.7: `validation/authValidation.ts` (459 lines) and `validation/userValidation.ts` (382 lines)

These are under 500 lines and have good internal cohesion. Leave them alone.

## PHASE 4: ACCESSIBILITY — ONE FILE (661 lines)

### 4.1: `accessibility/AccessibilityAuditor.ts` (661 lines)

This file has:
- Types/interfaces (lines ~1-75): `AccessibilityIssue`, `AccessibilityAuditResult`, `ComponentAccessibilityConfig`, `AccessibilityRule`, `AuditElement`
- WCAG_GUIDELINES constant (~30 lines)
- `AccessibilityAuditor` class (~530 lines) — the check methods + report generation

**New file: `accessibility/auditor-types.ts`**
Move all interfaces and types from lines 1-75:
```typescript
export interface AccessibilityIssue { ... }
export interface AccessibilityAuditResult { ... }
export interface ComponentAccessibilityConfig { ... }
export interface AccessibilityRule { ... }
export interface AuditElement { ... }
// + supporting types (AuditElementProps, AuditElementType, StyleValue)
```

**New file: `accessibility/wcag-guidelines.ts`**
```typescript
export const WCAG_GUIDELINES: Record<string, string> = { ... };
```

**New file: `accessibility/auditor-report.ts`**
Extract the report generation logic:
- `createAuditResult()` method
- `createPassingResult()` method
- `generateReport()` method
- `getComponentDisplayName()`, `getElementName()` helpers

**Original file `AccessibilityAuditor.ts`**: Imports from above, keeps only the `AccessibilityAuditor` class with check methods. Should be ~350 lines.

**IMPORTANT check before extracting:**
```
git grep "AccessibilityAuditor" src/
git grep "WCAG_GUIDELINES" src/
git grep "AccessibilityIssue" src/
```
If any other file imports these, they must continue to be exportable. The barrel pattern handles this.

## PHASE 5: FOCUS-IDENTITY — ONE FILE (955 lines)

### 5.1: `features/focus-identity/FocusIdentityEngine.ts` (955 lines)

This is the WORST offender. Contains THREE distinct things:
1. `FOCUS_SCORE_CONFIG` constant (~80 lines) — BANDS, FACTOR_WEIGHTS, SCORE_CHANGES
2. `IDENTITY_STATEMENTS` constant (~40 lines) — copy text per band
3. `FocusIdentityEngine` class (~400 lines) — factor calculators, score computation
4. `FocusIdentityService` class (~270 lines) — persistence, profile CRUD, score updates
5. Type definitions and Zod schemas (~165 lines) — in the file's header

**New file: `features/focus-identity/focus-score-config.ts`**
```typescript
import { launchColors } from "@theme/tokens/launch-colors";

export const FOCUS_SCORE_CONFIG = {
  MIN_SCORE: 300,
  MAX_SCORE: 850,
  INITIAL_SCORE: 550,
  BANDS: [
    { min: 800, max: 850, label: "Legendary", title: "Focus Virtuoso", color: launchColors.hex_ffd700, percentile: 99 },
    { min: 740, max: 799, label: "Elite", title: "Elite Performer", color: launchColors.hex_c0c0c0, percentile: 95 },
    { min: 670, max: 739, label: "Exceptional", title: "Exceptional Focus", color: launchColors.hex_cd7f32, percentile: 85 },
    { min: 580, max: 669, label: "Strong", title: "Strong Focus", color: launchColors.hex_4caf50, percentile: 70 },
    { min: 500, max: 579, label: "Good", title: "Good Focus", color: launchColors.hex_8bc34a, percentile: 50 },
    { min: 420, max: 499, label: "Fair", title: "Developing Focus", color: launchColors.hex_ffc107, percentile: 30 },
    { min: 300, max: 419, label: "Building", title: "Building Habits", color: launchColors.hex_ff9800, percentile: 10 },
  ] as const,
  FACTOR_WEIGHTS: { CONSISTENCY: 0.35, STREAK_STABILITY: 0.3, SESSION_QUALITY: 0.15, DIVERSITY: 0.1, RECENCY: 0.1 },
  SCORE_CHANGES: {
    SESSION_COMPLETE: { base: 5, max: 25 },
    STREAK_MILESTONE: { base: 20, max: 50 },
    MISSED_DAY: { base: -15, max: -35 },
    STREAK_BREAK: { base: -30, max: -80 },
    SESSION_ABANDON: { base: -25, max: -50 },
    PERFECT_SESSION: { base: 31, max: 50 },
  },
  RECOVERY_WINDOW_DAYS: 90,
  RECOVERY_BONUS_MULTIPLIER: 1.5,
} as const;

export const IDENTITY_STATEMENTS: Record<(typeof FOCUS_SCORE_CONFIG.BANDS)[number]["label"], string[]> = {
  Legendary: ["You are a Focus Virtuoso...", "Focus isn't just what you do...", "You're in the top 1%..."],
  Elite: ["You are an Elite Performer...", "Your focus habits are exceptional...", "You're among the most disciplined..."],
  Exceptional: ["You have Exceptional Focus...", "Your consistency is paying off...", "You're in the top 15%..."],
  Strong: ["You have Strong Focus...", "You're becoming the kind of person...", "Your momentum is building..."],
  Good: ["You have Good Focus...", "You're building the habits...", "Keep showing up..."],
  Fair: ["You're Developing Focus...", "Progress, not perfection...", "Your potential is there..."],
  Building: ["You're Building Habits...", "Everyone starts somewhere...", "Focus is a muscle..."],
};
```
This file has zero imports beyond `launchColors`, zero logic. Pure data. Can be created first with 0 risk.

**New file: `features/focus-identity/focus-identity-service.ts`**
Move the entire `FocusIdentityService` class (approx lines 580-835 of original).

This class needs:
```typescript
import { MMKVStorageAdapter } from "../../persistence/MMKVStorageAdapter";
import { eventBus } from "../../events";
import { FOCUS_SCORE_CONFIG, IDENTITY_STATEMENTS } from "./focus-score-config";
import { FocusIdentityEngine, FocusIdentityProfileSchema, type FocusIdentityProfile } from "./FocusIdentityEngine";
```
Must export: `FocusIdentityService` class, and `FocusIdentityProfileSchema` (since service uses it).

**Original file: FocusIdentityEngine.ts**
Replace config with import:
```typescript
import { FOCUS_SCORE_CONFIG, IDENTITY_STATEMENTS } from "./focus-score-config";
```
Remove the service class. Add export of `FocusIdentityProfileSchema` (change `const` to `export const`).

**Update `features/focus-identity/index.ts`:**
```typescript
// Before:
export { FocusIdentityEngine, FocusIdentityService, FOCUS_SCORE_CONFIG } from "./FocusIdentityEngine";

// After:
export { FocusIdentityEngine } from "./FocusIdentityEngine";
export { FocusIdentityService } from "./focus-identity-service";
export { FOCUS_SCORE_CONFIG, IDENTITY_STATEMENTS } from "./focus-score-config";
```

**Verification after this split:**
```
npx tsc --noEmit
```
Check for errors in `focus-identity/` files. Any `Cannot find module` means an index file or import path needs updating.

## PHASE 6: AI-COACH — FIVE FILES

### 6.1: `features/ai-coach/services/CoachRecommendationService.ts` (877 lines)

This is a PERSONA-BASED COACH system. Structure:
- Types (~50 lines): `CoachRecommendationType`, `UrgencyLevel`, `CoachRecommendation`, `CoachPersona`, etc.
- Helper functions (~600 lines): `generateProtectStreakMessage()`, `generateStudyBehindMessage()`, etc. — each returns a message PER persona (mentor, trainer, peer, professor)
- Main `CoachRecommendationService` class (~200 lines)

**New file: `features/ai-coach/services/coach-persona-types.ts`**
Extract all type definitions. Should be ~50 lines.

**New file: `features/ai-coach/services/coach-persona-messages.ts`**
Extract ALL the message generation helper functions. Each function generates persona-specific messages. These are pure data-transform functions with zero side effects. Should be ~400 lines (multiple 100-line functions). Can live in one file since they're all the same concern.

**Original file: CoachRecommendationService.ts**
Keep only the `CoachRecommendationService` class and its direct methods. Import types from `coach-persona-types.ts`, import message helpers from `coach-persona-messages.ts`. Should be ~200 lines.

### 6.2: `features/ai-coach/PredictiveInterventionEngine.ts` (707 lines)

AI-driven intervention engine. Structure:
- Types for intervention configs
- Detection logic
- Evaluation logic
- Intervention triggering

**New file: `features/ai-coach/intervention-types.ts`** — all type definitions
**New file: `features/ai-coach/intervention-detectors.ts`** — detection functions (already partially split in codebase, may exist)
**Original**: InterventionEngine class with orchestration logic
**Check existing**: `features/ai-coach/intervention-detectors-core.ts` and `features/ai-coach/intervention-detectors-situational.ts` may already exist. If they do, verify they're properly exported.

### 6.3: `features/ai-coach/session-analyzer.ts` (567 lines)

Session analysis engine. Extract:
**New file: `features/ai-coach/session-analyzer-types.ts`** — types
**New file: `features/ai-coach/session-metrics.ts`** — metric computation functions
**Original**: analysis orchestration

### 6.4: `features/ai-coach/schemas.ts` (536 lines)

Zod schemas for all AI coach data. This is already on the exempt list as a type catalog. **DO NOT SPLIT.** Zod schemas are a logical unit.

### 6.5: `features/ai-coach/services/intervention-engine.ts` (422 lines)

Already close to manageable. Extract types only:
**New file: `features/ai-coach/services/intervention-engine-types.ts`**

### 6.6: `features/ai-coach/services/message-generator.ts` (414 lines)

Extract types to `features/ai-coach/services/message-generator-types.ts`.

## PHASE 7: SETTINGS — SIX FILES (SCREENS + SERVICE)

Settings screens are large because they render many form fields inline. Extract each form section to a sub-component.

### 7.1: `features/settings/service.ts` (847 lines)

CRUD service for all settings. Contains:
- Circuit breaker setup
- Cache configuration  
- Sync conflict resolution
- Individual CRUD operations per settings category

**New file: `features/settings/settings-sync.ts`**
Extract sync-related logic: `syncCircuitBreaker`, `syncCache`, `resolveConflicts()`, `syncSettings()`, `pushChanges()`. Should be ~200 lines.

**New file: `features/settings/settings-crud.ts`**
Extract per-category CRUD: `updateNotificationSettings()`, `updateAppearanceSettings()`, `updatePrivacySettings()`, `updateDataControlSettings()`, `updateCoachSettings()`. Should be ~200 lines.

**Original file**: imports both, keeps only initialization, getSettings, and exportAll. Should be ~200 lines.

### 7.2: `features/settings/components/SettingsScreen.tsx` (702 lines)

Settings main screen. Extract sections:

**New file: `features/settings/components/SettingsSection.tsx`** — reusable section wrapper (title, description, divider)
**New file: `features/settings/components/SettingsAccountSection.tsx`** — account settings rows
**New file: `features/settings/components/SettingsNotificationsSection.tsx`** — notification settings rows
**New file: `features/settings/components/SettingsAppearanceSection.tsx`** — appearance settings rows
**Original**: composes all sections, handles navigation. Should be ~150 lines.

### 7.3: `screens/settings/CoachSettingsScreen.tsx` (577 lines)

Coach preference screen. Extract:
**New file: `screens/settings/CoachPersonaSelector.tsx`** — persona selection UI
**New file: `screens/settings/CoachFrequencySelector.tsx`** — notification frequency UI
**New file: `screens/settings/CoachToneSelector.tsx`** — tone/style preference UI
**Original**: composes all selectors. Should be ~150 lines.

### 7.4: `screens/settings/AppearanceSettingsScreen.tsx` (551 lines)

Extract theme picker, font size control, color scheme toggle to sub-components:
**New file: `screens/settings/ThemePicker.tsx`**
**New file: `screens/settings/FontSizeControl.tsx`**
**New file: `screens/settings/ColorSchemeToggle.tsx`**

### 7.5: `screens/settings/SettingsScreen.tsx` (512 lines)

Extract sections similarly (reuse SettingsSection from features/settings if possible).

### 7.6: `screens/settings/AccountSettingsScreen.tsx` (498 lines)

Extract sub-sections: email change, password change, delete account.

## PHASE 8: PROFILE SCREENS — FOUR FILES

### 8.1: `screens/profile/ProfileScreen.tsx` (861 lines)

Profile screen with tabs/sections. Extract:
**New file: `screens/profile/ProfileHeader.tsx`** — avatar, name, level badge, stats bar
**New file: `screens/profile/ProfileStatsSection.tsx`** — session stats, focus score
**New file: `screens/profile/ProfileAchievementsPreview.tsx`** — achievements carousel
**New file: `screens/profile/ProfileCompanionWidget.tsx`** — companion preview card
**New file: `screens/profile/ProfileSettingsRow.tsx`** — settings/preferences quick actions
**Original**: composes all sections. Should be ~150 lines.

### 8.2: `screens/profile/MasteryScreen.tsx` (717 lines)

Mastery/rank screen. Extract:
**New file: `screens/profile/MasteryHeader.tsx`** — rank badge, progress to next rank
**New file: `screens/profile/TechniqueGrid.tsx`** — technique cards grid
**New file: `screens/profile/MasteryHistoryChart.tsx`** — progress chart
**Original**: composes all. Should be ~150 lines.

### 8.3: `screens/profile/AchievementsScreen.tsx` (622 lines)

Extract:
**New file: `screens/profile/AchievementCategorySection.tsx`** — category header + grid
**New file: `screens/profile/AchievementDetailSheet.tsx`** — detail bottom sheet (may already exist in features/achievements/)
**Original**: composes. Should be ~150 lines.

### 8.4: `features/focus-identity/components/MonthlyFocusReport.tsx` (517 lines)

Extract:
**New file: `features/focus-identity/components/MonthlyReportHeader.tsx`** — month selector, score summary
**New file: `features/focus-identity/components/MonthlyReportChart.tsx`** — score history chart
**New file: `features/focus-identity/components/MonthlyReportInsights.tsx`** — insights list
**Original**: composes all. Should be ~150 lines.

## PHASE 9: OTHER LARGE COMPONENTS (>450 lines, any file)

Apply the same pattern: identify logical UI sections → extract each to sibling `*.tsx` file → original becomes composition-only.

### Screen-level components:
- `screens/session/ActiveSessionScreen.tsx` (262 lines)
- `screens/notifications/NotificationsScreen.tsx` (285 lines)
- `screens/search/SearchScreen.tsx` (382 lines)
- `screens/onboarding/OnboardingFlowScreen.tsx` (294 lines)
- `screens/ComebackScreen.tsx` (210 lines)
- `screens/home/containers/PowerUserHomeContainer.tsx` (355 lines)
- `screens/home/containers/EngagedHomeContainer.tsx` (351 lines)
- `features/content-study/screens/StudyPlanScreen.tsx` (646 lines)
- `features/content-study/screens/StudyLibraryScreen.tsx` (468 lines)
- `features/content-study/screens/ContentReviewScreen.tsx` (414 lines)
- `features/analytics/components/DataExportScreen.tsx` (628 lines)
- `features/analytics/components/AnalyticsDashboard.tsx` (576 lines)
- `features/ai-coach/components/CoachScreen.tsx` (462 lines)
- `features/home-spine/components/BossPreviewCard.tsx` (547 lines)
- `features/streaks/components/StreakGamblePrompt.tsx` (512 lines)
- `features/session-start/components/LiveFocusingWidget.tsx` (482 lines)

### Shared UI components:
- `shared/ui/state-components.tsx` (466 lines) — THIS is a state machine UI. Carefully extract each state view to separate file.
- `shared/ui/components/Toast.tsx` (465 lines)
- `shared/ui/components/StatusFeedback.tsx` (455 lines)
- `shared/ui/components/TabBar.tsx` (442 lines)
- `shared/ui/components/DataList.tsx` (441 lines)
- `shared/ui/components/InteractiveCard.tsx` (439 lines)
- `shared/ui/components/DataListFlashList.tsx` (424 lines)

## PHASE 10: OTHER LARGE CLASSES/SERVICES

For class/service files, extract:
1. Types/interfaces to `*-types.ts`
2. Configuration constants to `*-config.ts`
3. Large private methods that are self-contained helpers
4. Keep the main class in the original file with only orchestration

Target files:
- `features/ai-coach/services/CoachRecommendationService.ts` (877 lines) — covered in Phase 6
- `features/settings/service.ts` (847 lines) — covered in Phase 7
- `accessibility/AccessibilityAuditor.ts` (661 lines) — covered in Phase 4
- `features/focus-identity/FocusIdentityEngine.ts` (955 lines) — covered in Phase 5
- `features/analytics/repository.ts` (564 lines)
- `features/challenges/challenge-bank-expansion.ts` (558 lines)
- `features/progression/unified-mastery.ts` (575 lines)
- `features/notifications/SmartNotificationScheduler.ts` (538 lines)
- `performance/PerformanceGate.ts` (463 lines)
- `features/challenges/service.ts` (471 lines)
- `features/companion/service.ts` (423 lines)
- `api/client.ts` (403 lines)
- `features/ai-coach/services/behavior-analytics.ts` (397 lines)
- `features/content-study/analytics.ts` (475 lines)
- `features/streaks/StreakEvolutionSystem.ts` (485 lines)
- `features/settings/validation.ts` (447 lines)
- `features/progression/utils/validation.ts` (445 lines)

For each: extract types first, then large helper methods.

## PHASE 11: FUNCTION FILES (200-400 lines, logical splits only)

These files are 200-400 lines. Only split if there's a clear functional boundary:

Examples of files to NOT split (single concern, good cohesion):
- `features/streaks/service.ts` (345 lines) — single service, all methods related
- `features/progression/schemas.ts` (210 lines) — single schema file
- `features/session-completion/hooks/useSessionCompleteController.ts` (308 lines) — single hook
- `features/ai-coach/events.ts` (365 lines) — event definitions

Examples of files to split (multiple concerns):
- `features/settings/events.ts` (204 lines) — if it contains both event types AND event handlers
- `features/content-study/validation.ts` (332 lines) — if it has unrelated validator families
- `features/ai-coach/PersonalQuestGenerator.ts` (393 lines) — if quest generation logic + types are mixed

## VERIFICATION CHECKLIST (MANDATORY AFTER COMPLETION)

### 1. TypeScript Compilation
```bash
npx tsc --noEmit
```
Must return **0 errors**. If any errors exist, fix BEFORE claiming done.

### 2. ESLint
```bash
npx eslint src --ext .ts,.tsx
```
Must return **0 errors**. Warnings are acceptable if pre-existing.

### 3. File Size Audit
```bash
# Count files >200 lines (excluding exempt files)
```
Must be **0** for non-exempt files. Exempt files:
- `src/types/supabase.ts` (auto-generated)
- `src/features/notifications/notification-event-types.ts`
- `src/features/session-completion/completion-event-types.ts`
- `src/features/session-start/types.ts`
- `src/events/event-definitions.ts`
- `src/features/ai-coach/types.ts`
- `src/features/notifications/types.ts`
- `src/features/content-study/types/index.ts`
- `src/theme/types.ts`
- `src/types/models.ts`
- `src/events/types/session.ts`
- `src/events/types/analytics.ts`
- `src/navigation/types.ts`
- `src/features/settings/types.ts`
- `src/features/ai-coach/schemas.ts`
- `src/features/session-completion/completion-core.ts`
- `src/features/session-completion/completion-experience.ts`
- `src/features/session-completion/schemas.ts`
- `src/features/progression/schemas.ts`

### 4. Import Integrity
```bash
# Verify no broken imports
git grep "from.*-types-types" src/     # Should return nothing
git grep "Cannot find module"          # Run after typecheck
```

### 5. Git Status
```bash
git status
git diff --stat
```
All changes should be ONLY:
- New files created (extracted types, configs, sub-components)
- Original files modified (imports updated, code removed)
- `index.ts` files updated (re-exports)
- Potentially `tsconfig.json` (if new exclude patterns needed)
- NEVER: deletions of production code without replacement

### 6. Test Verification
```bash
npx jest --passWithNoTests --no-coverage
```
May have pre-existing failures. The count of FAILING tests should NOT increase from baseline. If new failures appear, fix them immediately.

## EXECUTION ORDER (DO NOT DEVIATE)

```
Phase 1 (Cleanup):   Delete -types.ts duplicates         → typecheck → commit
Phase 2 (Types):     Delete types-types.ts                → typecheck → commit
Phase 3 (Validation): Split 6 files                      → typecheck → commit
Phase 4 (Accessibility): Split Auditor                   → typecheck → commit
Phase 5 (FocusIdentity): Split Engine + Service          → typecheck → commit
Phase 6 (ai-coach):   Split 5 files                      → typecheck → commit
Phase 7 (Settings):   Split 6 files                      → typecheck → commit
Phase 8 (Profile):    Split 4 files                      → typecheck → commit
Phase 9 (Components): Split 15+ large components         → typecheck → commit
Phase 10 (Classes):   Split 15+ large services           → typecheck → commit
Phase 11 (Functions): Split 30+ medium files if needed   → typecheck → commit
Final Verification:   Run ALL checks                     → DONE
```

**Typecheck after EVERY file split. Commit after EVERY phase. Test after EVERY 3 phases.**

## GOTCHAS & COMMON MISTAKES TO AVOID

1. **DON'T move code that uses `this`.** Instance methods that reference `this.privateField` must stay in the class file. Only extract pure functions and static helpers.

2. **DON'T break React hooks order.** If a component has `useEffect` that depends on state from `useState`, those must stay in the same component. Extract only JSX rendering sections.

3. **DON'T forget `as const` on config objects.** If you move a config that was `as const`, copy the `as const`. Without it, TypeScript widens types and downstream code breaks.

4. **DON'T export types with `export default`.** Always use named exports for types so re-export barrels work.

5. **DON'T create circular imports.** If FileA imports from FileB, FileB cannot import from FileA. Always extract types/configs to a third file that both import from.

6. **CHECK the barrel index.** Every feature has an `index.ts`. If it re-exports from the file you're splitting, update the barrel to point to the new files.

7. **CHECK test files.** Test files often import directly from source files, not barrels. Run `git grep "from.*OldFileName"` before and after each split. Update test imports.

8. **React component context.** Components that use `useContext()` depend on provider hierarchy. Don't extract context consumers to separate files if the context provider setup would become unclear.

## EXPECTED OUTCOME

After all phases complete:
- **0 type errors** (`npx tsc --noEmit`)
- **0 ESLint errors** (`npx eslint src --ext .ts,.tsx`)
- **0 non-exempt files >200 lines**
- **All imports resolve correctly**
- **No test regression** (same or fewer failures than baseline)
- **~80-120 new files created** (types, configs, sub-components)
- **No logic changed** — only moved code with imports updated
