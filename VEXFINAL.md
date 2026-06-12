# VEXFINAL — Pre-Release Code Quality & Release Readiness Audit

> **Generated:** June 11, 2026, 03:45 UTC  
> **Target:** VEX — Production Expo React Native App (managed workflow)  
> **Scope:** Full codebase — 4,491 `.ts`/`.tsx` files, ~398,762 lines of source code  
> **Auditor:** Thermo-Nuclear Code Quality Review + Multi-Dimensional Deep Analysis (13-phase systematic audit)  
> **Sub-Audits:** 3 parallel deep-dive sub-agents covering features, screens, and repositories  
> **Total Issues Found:** 85+ distinct issues across 14 categories  

---

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Structural & Architecture Audit](#2-structural--architecture-audit)
3. [TypeScript Strictness Audit](#3-typescript-strictness-audit)
4. [Security Audit](#4-security-audit)
5. [Performance Audit](#5-performance-audit)
6. [Error Handling Audit](#6-error-handling-audit)
7. [UI States & Accessibility Audit](#7-ui-states--accessibility-audit)
8. [Design Token & Hardcoded Value Audit](#8-design-token--hardcoded-value-audit)
9. [Realtime & Memory Leak Audit](#9-realtime--memory-leak-audit)
10. [Navigation & Deep Link Audit](#10-navigation--deep-link-audit)
11. [Testing Quality Audit](#11-testing-quality-audit)
12. [Database & Supabase Audit](#12-database--supabase-audit)
13. [AI Slop & Code Quality Issues](#13-ai-slop--code-quality-issues)
14. [Feature-by-Feature Deep Audit](#14-feature-by-feature-deep-audit)
15. [Screen-by-Screen Deep Audit](#15-screen-by-screen-deep-audit)
16. [Complete Issues Index by Severity](#16-complete-issues-index-by-severity)
17. [RELEASE PHASE — Final Release Checklist](#17-release-phase--final-release-checklist)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Overall Assessment

| Dimension | Grade | Issues Found | Status |
|-----------|-------|-------------|--------|
| Architecture Compliance | B | 12 | Screen sprawl, dual session modules, barrel file with 5 dead imports |
| TypeScript Strictness | A- | 6 | Zero `@ts-ignore`, zero `any`; `as X` casts in progression/settings repos |
| Security | A- | 4 | Strong edge function auth; settings sync swallows errors; fake userId stub |
| Performance | B | 5 | FlashList partially verified; sequential Promise.for-of in challenges/achievements |
| Error Handling | B- | 15 | 2 hard stubs (streak funeral, StreakService); 2 error swallows; 5 dead imports |
| Testing | C+ | 1 | 68 test files for 4,491 source files (~1.5% file coverage) |
| UI States | B | 12 | Hardcoded hex colors in 6+ screen components; missing accessibility labels |
| Real-time Cleanup | B | 3 | 136 subscribe() vs 18 unsubscribe(); circuit-breaker failureCount never reset |
| Design Tokens | C+ | 26 | 12 hardcoded hex colors, 14 hardcoded rgba values bypassing token system |

### 1.2 Key Metrics

- **Total source files:** 4,491 `.ts`/`.tsx`
- **Total lines of code:** ~398,762
- **Files exceeding 200-line limit:** 1 (`src/types/supabase.ts` at 5,649 lines — auto-generated, exempt)
- **`console.log` calls:** 0
- **`@ts-ignore`/`@ts-nocheck`:** 0
- **`StyleSheet.create` usage:** 0
- **`any` type in production source:** 0
- **`as X` casts without Zod validation:** 40+ across progression and settings repositories
- **Function stubs (non-functional):** 4 critical (StreakFuneral x2, StreakService.getState, Search screen fake delay)
- **Hardcoded hex/rgba values bypassing design tokens:** 26
- **Missing accessibility labels/hints:** 10
- **Dead or broken imports:** 6
- **Race conditions (non-atomic operations):** 3
- **Circuit breaker bug (failureCount never reset):** 1

### 1.3 Top 5 Critical Findings

1. **CRITICAL — Streak Funeral: Two hard-stubbed functions** (`getLastFuneralShown` returns always `null`, `setLastFuneralShown` is empty) — `src/navigation/hooks/useStreakFuneralNavigation.ts:51-55`
2. **CRITICAL — StreakService.getState() returns EMPTY_STREAK_STATE always** — funeral feature is completely non-functional — `src/streaks/StreakService.ts:33-35`
3. **CRITICAL — AchievementsScreen uses fake hardcoded userId `'current-user'`** — achievements never load real data — `src/screens/profile/AchievementsScreen.tsx:26`
4. **CRITICAL — Circuit breaker `failureCount` never reset on CLOSE transition** — causes immediate re-opening after recovery — `src/shared/hardening/circuit-breaker.ts:80-85`
5. **CRITICAL — ai-coach service barrel has 5 dead import paths** — modules `pipeline/pipeline`, `intervention/intervention-service`, `message/message-generator`, `persona/persona-manager`, `notification/reminder-scheduler`, `input/input-contract` do not exist — `src/features/ai-coach/service/service.ts:53,67,72,95-101,107,116`

---

## 2. STRUCTURAL & ARCHITECTURE AUDIT

### 2.1 Architecture Compliance Scorecard

The prescribed architecture is:
```
features/<name>/
  types.ts → schemas.ts → repository.ts → service.ts → hooks.ts → store.ts → components/
```

**Fully compliant features:** streaks, notifications, auth, achievements, ai-coach (repository layer only), companion-promise, focus-identity, focus-contract, settings, progression, onboarding, content-study, challenges, economy (except wallet-service stubs), boss, companion

**Partially compliant features:** session (dual location), ai-coach (service barrel has dead imports), economy (wallet-service, StreakInsurance are stubs)

### 2.2 Architecture Violations

#### VIOLATION 2.2.1 — Screen-Level Logic Sprawl in `src/screens/session/`
**Severity:** HIGH  
**Location:** `src/screens/session/` — 100+ files including hooks (28 files), utils (12 files), services  
**Problem:** The session screen directory contains business logic, services, and data access. Architecture dictates screens contain ONLY UI. The session module already exists at `src/session/` and `src/features/session/` — this creates a third location for session logic.  
**Fix:** (1) Audit for duplicates between `src/screens/session/`, `src/session/`, and `src/features/session/`. (2) Remove duplicates from `src/screens/session/`. (3) Move unique hooks to `src/features/session/hooks/`. (4) Move unique utils to `src/features/session/utils/`. (5) Ensure `src/screens/session/` contains only `.tsx` component files.

#### VIOLATION 2.2.2 — Dual Session Module Locations
**Severity:** MEDIUM  
**Location:** `src/session/` AND `src/features/session/`  
**Problem:** Session logic is split across two root-level directories. `src/session/` holds core engines, orchestrator, anti-cheat, integration. `src/features/session/` holds feature-layer hooks, components, repository. While this COULD be intentional (core vs. feature), there's no documentation of the split and `src/screens/session/` adds a third location.  
**Fix:** Document the split explicitly. `src/session/` = engine layer (reusable across any UI). `src/features/session/` = feature-layer only. `src/screens/session/` = UI only.

#### VIOLATION 2.2.3 — Settings Repository Error Swallowing
**Severity:** HIGH  
**File:** `src/features/settings/repository-sync.ts` — Lines 67, 76
```typescript
// Line 67 — ERROR SILENTLY DISCARDED
const { error } = await supabase.from(TABLE_PENDING_CHANGES).upsert(...);
if (error) {error;}  // <-- Does nothing. Literally evaluates 'error' and discards it.

// Line 76 — SAME PATTERN
const { error } = await supabase.from(TABLE_PENDING_CHANGES).delete(...);
if (error) {error;}  // <-- Identical copy-paste error-swallow
```
**Fix:** Wrap in `RepositoryError` throw or Sentry capture:
```typescript
if (error) { throw new RepositoryError('trackPendingChange', error); }
```

#### VIOLATION 2.2.4 — ai-coach Service Barrel Has 5 Dead Imports
**Severity:** CRITICAL  
**File:** `src/features/ai-coach/service/service.ts` — Lines 53, 67, 72, 95-101, 107, 116
```typescript
// Line 53: import from '../pipeline/pipeline' — MODULE DOES NOT EXIST
// Line 67: import from '../intervention/intervention-service' — MODULE DOES NOT EXIST
// Line 72: import from '../message/message-generator' — MODULE DOES NOT EXIST
// Lines 95-101: import from '../persona/persona-manager' — MODULE DOES NOT EXIST
// Line 107: import from '../notification/reminder-scheduler' — MODULE DOES NOT EXIST
// Line 116: import from '../input/input-contract' — MODULE DOES NOT EXIST
```
**Problem:** These imports will fail at TypeScript compilation OR at runtime (if using dynamic imports). The ai-coach service barrel is non-functional.  
**Fix:** Either implement these modules or remove the dead imports and document which ai-coach features are disabled.

#### VIOLATION 2.2.5 — Two Competing Onboarding Repository Implementations
**Severity:** HIGH  
**Location:** `src/features/onboarding/repository.ts` (Supabase-based) AND `src/features/onboarding/repository/OnboardingRepository.ts` (MMKV-based)  
**Problem:** Both export an `onboardingRepository` with the same name but different implementations. `src/features/onboarding/repository/index.ts` exports from the MMKV version. `src/features/onboarding/repository.ts` (the root file) exports from the Supabase version. There is no clear selection logic to determine which implementation is used.  
**Fix:** Consolidate into one repository implementation, or create a factory function that selects based on auth state / feature flags.

#### VIOLATION 2.2.6 — Economy Repository Destroys Existing Wallet Data
**Severity:** CRITICAL  
**File:** `src/features/economy/repository.ts` — Lines 24-31
```typescript
const { error } = await supabase.from('wallets').upsert({
    user_id: userId,
    coins: 0,    // <-- OVERWRITES existing coins to 0
    gems: 0,     // <-- OVERWRITES existing gems to 0
}, { onConflict: 'user_id' });
```
**Problem:** The upsert sets `coins: 0, gems: 0` unconditionally. If a user already has 500 coins and 50 gems, calling `getOrCreateWallet()` will reset their balances to zero. This is data-destroying behavior.  
**Fix:** Use `onConflict` with `ignore: true` to only insert if row doesn't exist, or query first and upsert with existing values.

#### VIOLATION 2.2.7 — Economy steakInsurance and wallet-service Are Complete Stubs
**Severity:** MEDIUM (per design — ARCH-04 disabled)  
**Files:** `src/features/economy/StreakInsurance.ts`, `src/features/economy/wallet-service.ts`  
**Problem:** Per the comment "ECOnomy currency is DISABLED (ARCH-04)", the wallet-service and StreakInsurance are intentionally stubbed. However, `StreakInsurance.getInsuranceStatus()` returns hardcoded `{ isInsured: false, daysRemaining: 0 }` with no comment explaining this is a stub. A developer reading the code would think the insurance system is failing.  
**Fix:** Add explicit comments explaining ARCH-04 disable status on all stub functions.

#### VIOLATION 2.2.8 — Onboarding Service Imports Zustand Hook
**Severity:** LOW  
**File:** `src/features/onboarding/service.ts` — Line 1
```typescript
import { useOnboardingStore } from './store';
```
The service layer imports a Zustand hook (the `useOnboardingStore` from `create(...)`), then calls `useOnboardingStore.getState()` throughout. This is conceptually confusing — services should not import React hooks. While `getState()` works outside of React, the import path suggests the wrong abstraction layer.  
**Fix:** Export a standalone `getOnboardingState()` function from the store file that wraps `useOnboardingStore.getState()`, and import that from the service.

#### VIOLATION 2.2.9 — Empty Type Import
**Severity:** LOW  
**File:** `src/session/integration/SessionRewardIntegration.ts` — Line 4
```typescript
import type {} from './session-reward-helpers';
```
This empty type import is either a side-effect import or a leftover from a refactoring. It does nothing and should be removed.

#### VIOLATION 2.2.10 — Features/ai-coach Uses Plain `new Error()` Instead of `RepositoryError`
**Severity:** MEDIUM  
**Files:** `src/features/ai-coach/repository/memories-core.ts` (lines 56, 80, 102), `memories-operations.ts` (lines 31, 48, 80, 101, 130)  
**Problem:** All other repository files in the codebase use `throw new RepositoryError('functionName', error)`. The ai-coach repository files use `throw new Error(...)` — a plain error without the RepositoryError wrapper. This breaks the error classification system used by the service layer.  
**Fix:** Replace all `throw new Error(...)` with `throw new RepositoryError('functionName', error)`.

#### VIOLATION 2.2.11 — Progression Repository Uses `throw error` Without Wrapping
**Severity:** MEDIUM  
**File:** `src/features/progression/repository/unified.ts` — Lines 20, 36, 50, 64, 71
```typescript
if (error) { throw error; }  // throws raw PostgrestError — not RepositoryError
```
**Fix:** Wrap with `throw new RepositoryError('functionName', error)`.

#### VIOLATION 2.2.12 — Onboarding Uses `async getItem` with Zustand's `createJSONStorage`
**Severity:** MEDIUM  
**File:** `src/features/onboarding/store.ts` — Lines 81-86
Zustand's persist middleware uses synchronous storage APIs internally. Wrapping MMKV (which is synchronous) in `async getItem/setItem/removeItem` can cause hydration race conditions where the persisted state hasn't loaded before the store is first accessed.  
**Fix:** Use the synchronous MMKV adapter from `src/persistence/MMKVStorageAdapter.ts`.

---

## 3. TYPESCRIPT STRICTNESS AUDIT

### 3.1 Positive Findings

- **Zero `any` type assertions** in production source code
- **Zero `@ts-ignore` or `@ts-nocheck` directives**  
- **Zero `console.log` calls** — all logging uses `createDebugger()`
- **Zero `StyleSheet.create` calls**
- **`tsconfig.json` strictness:** `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, `noUncheckedIndexedAccess: true`, `noImplicitReturns: true`, `noFallthroughCasesInSwitch: true`

### 3.2 Issues Found

#### ISSUE 3.2.1 — Extensive `as X` Casts in Progression Repository (40+ casts)
**Severity:** MEDIUM  
**File:** `src/features/progression/repository/unified.ts` — Lines 123-170 (dbToState), 172-191 (stateToDb), 79 (updateTrackXpFallback)

The entire `dbToState()` function casts every field with `as string`, `as number`, etc:
```typescript
function dbToState(row: Record<string, unknown>): UnifiedMasteryState {
  return {
    userId: row.user_id as string,           // line 125
    tracks: {
      DURATION: {
        level: row.duration_level as number,  // line 128
        xp: row.duration_xp as number,        // line 129
        xpToNext: calculateXpForLevel((row.duration_level as number) + 1), // line 130
        totalXp: row.duration_total_xp as number, // line 131
      },
      // ... repeated for PURITY, CONSISTENCY, COMEBACK, BOSS (each 5 fields)
    },
    overallLevel: row.overall_level as number,        // line 163
    overallRank: row.overall_rank as UnifiedMasteryState['overallRank'], // line 164
    lastUpdated: new Date(row.updated_at as string).getTime(),  // line 167
    createdAt: new Date(row.created_at as string).getTime(),     // line 168
  };
}
```
If the DB returns unexpected values (string where number expected, null where string expected), this silently passes bad data to the UI.  
**Fix:** Create a Zod schema for the DB row and `.parse()` the data:
```typescript
const MasteryTrackRowSchema = z.object({
  user_id: z.string(),
  duration_level: z.number(),
  duration_xp: z.number(),
  duration_total_xp: z.number(),
  // ... all fields
  overall_level: z.number(),
  overall_rank: z.string().optional(),
  updated_at: z.string(),
  created_at: z.string(),
});
const parsed = MasteryTrackRowSchema.parse(row);
```

#### ISSUE 3.2.2 — Settings Sync Uses `as X` Casts Without Zod Validation
**Severity:** MEDIUM  
**File:** `src/features/settings/repository-sync.ts` — Lines 36-44, 124-126
```typescript
return data ? {
    userId: data.user_id as string,
    status: data.status as 'idle' | 'syncing' | 'error' | 'conflict',
    lastSyncAttempt: data.last_sync_attempt as number,
    // ...
} : null;
```
**Fix:** Define `SyncStateRowSchema` using Zod and parse Supabase responses.

#### ISSUE 3.2.3 — Challenges Repository: `JoinedChallengeRow` is `{ [key: string]: unknown }` — Essentially `any`
**Severity:** MEDIUM  
**File:** `src/features/challenges/repository-user.ts` — Line 67-69
```typescript
interface JoinedChallengeRow {
  [key: string]: unknown;
}
```
This interface is equivalent to `any` — any access to `row.fieldName` returns `unknown` and requires a cast. This defeats TypeScript's type-checking purpose.  
**Fix:** Define a proper Zod schema for the joined challenge row shape.

#### ISSUE 3.2.4 — Underscore-Prefixed Unused Parameters
**Severity:** LOW  
**Files:** Multiple: `src/features/challenges/repository-user.ts:191` (`_source`), `src/features/challenges/repository-helpers.ts:11` (`_supabase`), `src/features/achievements/service.ts:16` (`_context?`)

Using `_variableName` for unused parameters is acceptable TypeScript convention, but is a code smell — it signals the parameter exists for an interface contract but is never used, which may indicate incomplete implementation.

#### ISSUE 3.2.5 — Onboarding Store Partialize Uses `as OnboardingStore` Cast
**Severity:** LOW  
**File:** `src/features/onboarding/store.ts` — Line 88-105
```typescript
partialize: (state) => ({...state}) as OnboardingStore
```
The partialized object cannot satisfy the full `OnboardingStore` type because it lacks action functions. The cast suppresses a TypeScript error that indicates a genuine type mismatch.  
**Fix:** Define a separate `PersistedOnboardingState` type that excludes functions, or use `pick`/`omit` utilities.

#### ISSUE 3.2.6 — Edge Function Uses `unknown` for Request Body Without Zod Parse in Catch Path
**Severity:** LOW  
**File:** `src/shared/ai/edge-function-service.ts` — Line 55
```typescript
const ctx = context as LooselyTypedContext;
```
`LooselyTypedContext` is `Record<string, unknown>`. The comment says "Context validated by Zod schemas upstream" but this is not enforced at runtime.  
**Fix:** Parse context with a Zod schema at the boundary rather than trusting callers.

---

## 4. SECURITY AUDIT

### 4.1 Positive Findings

- **4.1.1 — Edge Function JWT Verification:** `supabase/functions/_shared/auth.ts` verifies JWT with `jose@5.9.6`, checks algorithm (HS256), validates issuer, checks banned flag, verifies email confirmation, falls back to remote verification. Production-grade auth.
- **4.1.2 — Session Complete Edge Function:** Server-side validation clamps client values (max 4h duration, quality 0-100, score 0-10000), uses idempotency keys, rate-limited at 10/60s, Zod-validates request and response.
- **4.1.3 — Analytics PII Sanitization:** `src/shared/analytics/privacy.ts` blocks 26 sensitive key patterns, only allows 8 whitelisted user trait fields, truncates strings at 120 chars, detects emails/bearer tokens.
- **4.1.4 — RevenueCat Placeholder Key Detection:** `src/shared/monetization/revenuecat-service.ts:30-35` validates keys aren't placeholders with regex.
- **4.1.5 — Client-Side Rate Limiting:** Login rate-limited at 5 attempts per 60 seconds via `TokenBucketLimiter`.
- **4.1.6 — Auth Password Reset:** Never reveals whether email exists (`src/features/auth/repository-credentials.ts:125-127`).

### 4.2 Issues Found

#### ISSUE 4.2.1 — Fake Hardcoded userId `'current-user'` in AchievementsScreen
**Severity:** CRITICAL  
**File:** `src/screens/profile/AchievementsScreen.tsx` — Line 26
```typescript
const userId = 'current-user'; // <-- FAKE ID, never loads real data
```
This means the achievements screen ALWAYS shows empty/no data regardless of who is logged in. This is a release blocker — no user can see their achievements.

#### ISSUE 4.2.2 — Settings Sync Errors Silently Discarded
**Severity:** HIGH  
**File:** `src/features/settings/repository-sync.ts` — Lines 67, 76  
Already covered in 2.2.3. The `if (error) {error;}` pattern silently swallows database errors.

#### ISSUE 4.2.3 — Economy `getOrCreateWallet` Data Destruction
**Severity:** CRITICAL  
**File:** `src/features/economy/repository.ts` — Lines 24-31  
Already covered in 2.2.6. Upserting with `coins: 0, gems: 0` overwrites existing balances.

#### ISSUE 4.2.4 — Circuit Breaker Bug: Immediate Re-Open After Recovery
**Severity:** CRITICAL  
**File:** `src/shared/hardening/circuit-breaker.ts` — Lines 80-85
```typescript
private transitionTo(newState: CircuitState): void {
    this.state = newState;
    this.successCount = 0;
    this.halfOpenCalls = 0;
    // BUG: failureCount is NEVER reset on transition to CLOSED
}
```
After recovery (transitioning from HALF_OPEN to CLOSED), `failureCount` is NOT reset. If the circuit was opened at `failureCount=5` and then recovers, when it transitions back to CLOSED, the first new failure will see `failureCount=5` and immediately re-open the circuit (because `5 >= threshold`). This effectively makes the half-open mechanism unreliable — a single failure after recovery immediately re-opens the circuit.  
**Fix:** Add `this.failureCount = 0` on line 82.

---

## 5. PERFORMANCE AUDIT

### 5.1 Positive Findings

- No `Animated` from `react-native` — all animation uses Reanimated
- Debounced write utility exists (`src/utils/debounced-write.ts`)
- Token bucket limiter exists (`src/utils/token-bucket.ts`)
- Auth store uses `immer` middleware for efficient state updates
- Analytics batches events (flushAt: 20, flushInterval: 10000)

### 5.2 Issues Found

#### ISSUE 5.2.1 — Sequential `for...of` with `await` in Achievement Processing
**Severity:** HIGH  
**File:** `src/features/achievements/service.ts` — Lines 22-27
```typescript
for (const achievement of ALL_ACHIEVEMENTS.filter(...)) {
    const userAchievement = await getUserAchievement(userId, achievement.id);
    // Each iteration awaits the previous — serial DB calls
}
```
For N matched achievements (potentially dozens), each `getUserAchievement` is a separate sequential database call. This should use `Promise.all` for parallel execution.

#### ISSUE 5.2.2 — Sequential `for...of` in Challenge Processing
**Severity:** MEDIUM  
**File:** `src/features/challenges/service.ts` — Lines 99-122
```typescript
for (const detail of activeChallenges) {
    const challenge = await fetchChallengeById(detail.challengeId);
    // N sequential DB queries
}
```
**Fix:** Use `Promise.all(activeChallenges.map(detail => fetchChallengeById(detail.challengeId)))`.

#### ISSUE 5.2.3 — `ALL_ACHIEVEMENTS.filter()` Runs on Every Progress Update
**Severity:** LOW  
**File:** `src/features/achievements/service.ts` — Lines 19-21
```typescript
const matchingAchievements = ALL_ACHIEVEMENTS.filter(
    (achievement) => achievement.metadata?.trigger === eventType
);
```
If there are hundreds of achievements, this O(n) filter runs on every progress event. Should be indexed by trigger type at module load.

#### ISSUE 5.2.4 — Double Zod Parse Per Row in AI-Coach Recommendations
**Severity:** LOW  
**File:** `src/features/ai-coach/repository/recommendations.ts` — Lines 33-55
```typescript
function parseRecommendationRow(row: unknown): SessionRecommendation {
    const parsedRow = RecommendationRowSchema.parse(row);  // Parse 1
    return SessionRecommendationSchema.parse({...});        // Parse 2 — unnecessary
}
```
**Fix:** Use `.transform()` in the schema to do the mapping in one parse.

#### ISSUE 5.2.5 — O(n^2) Deduplication in Messages CRUD
**Severity:** LOW  
**File:** `src/features/ai-coach/repository/messages-crud.ts` — Lines 190-193
```typescript
.filter((v, i, a) => a.indexOf(v) === i)  // O(n^2) dedup
```
**Fix:** Use `[...new Set(array)]` for O(n) deduplication.

---

## 6. ERROR HANDLING AUDIT

### 6.1 Positive Findings

- All Supabase repository calls follow the `{ data, error }` + `if (error) throw RepositoryError` pattern
- Auth credential operations have proper try/catch with typed error returns
- Analytics service wraps all PostHog calls in try/catch
- RevenueCat service wraps all Purchases SDK calls in try/catch
- Edge functions use Zod for request/response validation with proper error responses

### 6.2 Critical Issues

#### ISSUE 6.2.1 — STUB: `getLastFuneralShown()` Returns Always `null`
**Severity:** CRITICAL  
**File:** `src/navigation/hooks/useStreakFuneralNavigation.ts` — Lines 51-55
```typescript
function getLastFuneralShown(): number | null {
    return null;  // HARD STUB — never reads from storage
}
function setLastFuneralShown(): void {} // HARD STUB — does nothing
const STREAK_FUNERAL_LAST_SHOWN_KEY = 'streak_funeral_last_shown'; // Defined but unused
```
**Impact:** Streak funeral cooldown is never enforced. Users could see the funeral on every app launch.  
**Fix:** Implement MMKV read/write for funeral timestamp persistence.

#### ISSUE 6.2.2 — STUB: `StreakService.getState()` Returns Empty State Always
**Severity:** CRITICAL  
**File:** `src/streaks/StreakService.ts` — Lines 33-35
```typescript
getState(): LegacyStreakState {
    return EMPTY_STREAK_STATE; // { currentStreak: 0, longestStreak: 0, lastStreakDiedAt: null, streakFuneralShown: false }
}
```
**Impact:** The funeral check (`shouldShowFuneral()`) always sees `state.lastStreakDiedAt === null` and returns false. The entire streak funeral feature path is dead code.  
**Fix:** Call `getOrCreateStreak()` from the real streak service to retrieve actual state.

#### ISSUE 6.2.3 — Settings Sync: Two Error-Swallowing Patterns
**Severity:** HIGH  
**File:** `src/features/settings/repository-sync.ts` — Lines 67, 76  
Already covered in 2.2.3 and 4.2.2.

#### ISSUE 6.2.4 — ai-coach Service Barrel: 5 Dead Imports
**Severity:** CRITICAL  
**File:** `src/features/ai-coach/service/service.ts` — Lines 53, 67, 72, 95-101, 107, 116  
Already covered in 2.2.4.

### 6.3 High-Priority Issues

#### ISSUE 6.3.1 — Challenges: Coin Rewards Created But Never Delivered
**Severity:** HIGH  
**File:** `src/features/challenges/service.ts` — Lines 168-175
```typescript
const coinReward = { type: 'COINS', amount: coinAmount, delivered: false, deliveredAt: null };
```
Coin rewards are calculated and included in the response, but there's no code that actually grants coins to the user's wallet. XP is handled via `getRewardService()` but coins are left undelivered.

#### ISSUE 6.3.2 — Achievements: `BOSS_DEFEAT_UNIQUE` Context Ignored
**Severity:** HIGH  
**File:** `src/features/achievements/service.ts` — Lines 170-171
```typescript
// The bossId for uniqueness tracking is passed in context but updateAchievementProgress ignores _context
```
**Impact:** Boss defeat uniqueness achievements (e.g., "Defeat 5 different bosses") cannot be tracked because the boss identity is silently discarded.

#### ISSUE 6.3.3 — Challenges: Race Condition in `addChallengeProgress`
**Severity:** HIGH  
**File:** `src/features/challenges/repository-user.ts` — Lines 187-199
```typescript
// Fetch current value → add delta → update (non-atomic, read-then-write)
```
If two concurrent calls update the same challenge progress, one overwrites the other. Should use an atomic increment (Supabase RPC or `.increment()` in the update).

#### ISSUE 6.3.4 — ai-coach Messages: Reconnect Callback Is Dead Code
**Severity:** HIGH  
**File:** `src/features/ai-coach/repository/messages-subscriptions.ts` — Lines 18-41
```typescript
// The first SUBSCRIBED case (line 18) catches ALL SUBSCRIBED events.
// The second SUBSCRIBED check (line 39) is unreachable — onReconnect() never fires.
```
**Impact:** Reconnection callbacks after temporary disconnection never execute. Real-time re-subscription silently fails.

#### ISSUE 6.3.5 — Onboarding Supabase Repository: Zod `.parse()` Error Swallowed
**Severity:** MEDIUM  
**File:** `src/features/onboarding/repository.ts` — Lines 80-91
```typescript
// z.string().uuid().parse(userId) inside try block — if throws, catch wraps it but loses Zod error details
```
**Fix:** Validate userId before entering the try block, or include Zod error details in the thrown error.

### 6.4 Medium-Priority Issues

#### ISSUE 6.4.1 — Progression: Raw Error Thrown Instead of RepositoryError
**File:** `src/features/progression/repository/unified.ts` — Lines 20, 36, 50, 64, 71  
Already covered in 2.2.11.

#### ISSUE 6.4.2 — ai-coach: Plain `new Error()` Instead of RepositoryError
**Files:** Multiple in `src/features/ai-coach/repository/`  
Already covered in 2.2.10.

#### ISSUE 6.4.3 — Challenges: Sequential Loop Processing
**File:** `src/features/challenges/service.ts` — Lines 99-122  
Already covered in 5.2.2.

#### ISSUE 6.4.4 — Achievements: Error Returned as `success: false` Instead of Thrown
**File:** `src/features/achievements/repository.ts` — Lines 29-31, 53-54
```typescript
if (error) { return null; } // Caller can't distinguish "no row" from "query error"
```
**Fix:** Throw on error, or return a typed result object with error details.

#### ISSUE 6.4.5 — Feature Health Checks: Tautological Checks
**File:** `src/features/liveops-config/feature-health-checks.ts` — Lines 65-68, 86-89
```typescript
return CONTENT_STUDY_CONSTANTS.DAILY_GENERATION_LIMIT > 0 ? 'healthy' : 'unavailable';
```
If `DAILY_GENERATION_LIMIT` is a compile-time constant, this always returns the same value. These aren't runtime health checks — they're build-time config reads. The function name `hasContentStudyConstraints` and health check registration imply runtime capability detection.

#### ISSUE 6.4.6 — Challenges: `cleanupRerollHistory` Always Returns 0
**File:** `src/features/challenges/repository-reroll.ts` — Line 80
```typescript
return 0; // Hardcoded — never returns actual count of deleted rows
```

#### ISSUE 6.4.7 — Challenges: Unused `source` Parameter
**File:** `src/features/challenges/repository-user.ts` — Lines 188-191
```typescript
// Parameter _source accepted but never used — progress source is silently discarded
```

#### ISSUE 6.4.8 — Achievements: `COINS` vs RPC Currency Disabled Mismatch
**File:** `src/features/achievements/service.ts` — Lines 168-175 (and economy)
The achievements service calculates coin rewards but the economy `wallet-service` is disabled per ARCH-04. This means achievements that award coins silently fail to deliver rewards with no user-facing error.

#### ISSUE 6.4.9 — `StreakInsurance` and `wallet-service` are non-functional stubs
**File:** `src/features/economy/StreakInsurance.ts`, `src/features/economy/wallet-service.ts`  
Per ARCH-04 disabled status. Both return error states for all operations. While this is intentional, the error messages are misleading (`DB_ERROR` when the real cause is feature disable). No in-app explanation for users that certain economy features are unavailable.

---

## 7. UI STATES & ACCESSIBILITY AUDIT

### 7.1 Positive Findings

The app has comprehensive state components:
- `src/shared/ui/state-components/` — loading, error, empty, disabled, success, skeleton, state-wrapper
- `src/shared/ui/components/` — EmptyState with presets, ErrorFallback, ScreenErrorBoundary, EnhancedSkeleton, CardSkeleton, SkeletonItem, StatusFeedback, StatusChip, StatusBanner
- `src/shared/ui/primitives/` — LoadingOverlay, ProgressIndicator, SectionLoading, Skeleton

### 7.2 Missing UI States by Screen

#### ISSUE 7.2.1 — AchievementsScreen: Fake User ID
**Severity:** CRITICAL  
**File:** `src/screens/profile/AchievementsScreen.tsx` — Line 26  
`const userId = 'current-user'` — Achievements never load for real users.

#### ISSUE 7.2.2 — ProgressScreen: Hardcoded Fallback Score + No States
**Severity:** HIGH  
**File:** `src/screens/progress/ProgressScreen.tsx` — Lines 49, 62-153
- **Line 49:** Hardcoded stub score `82` when dashboard fails to load
- **Lines 62-153:** No `isLoading`/`isPending` check — renders with stub data during loading
- **Lines 62-153:** No error state or retry button
- **Lines 86-88:** Stub text: `"Stable"`, `"Last session +6"`, `"30-day trend +14"`
- **Line 135:** Stub text: `"Level 7"`, `"450 XP to Level 8"`

#### ISSUE 7.2.3 — SearchScreen: Fake Search + No States
**Severity:** HIGH  
**File:** `src/screens/search/SearchScreen.tsx` — Lines 28-30, 44-71
- **Lines 28-30:** Fake search delay: `setTimeout(() => { setIsSearching(false); }, 800)` — never executes real query
- **Lines 44-71:** No error state with retry
- **Lines 44-71:** No empty results state

#### ISSUE 7.2.4 — MasteryScreen: Text-Only Loading State
**Severity:** HIGH  
**File:** `src/screens/profile/MasteryScreen.tsx` — Line 62
```typescript
<Text>Loading...</Text> // Plain text spinner — violates "never a spinner alone" rule
```
**Fix:** Replace with skeleton UI matching the loaded content layout.

#### ISSUE 7.2.5 — AccountSettingsScreen: No Loading/Error States
**Severity:** MEDIUM  
**File:** `src/screens/settings/AccountSettingsScreen.tsx` — Lines 23-65  
The `EmailChangeSection`, `TwoFactorSection`, and `PasswordChangeSection` child components may fetch data or perform mutations, but no loading skeleton or error boundary is visible at this screen level.

#### ISSUE 7.2.6 — PrivacySettingsScreen: Unhandled Promise
**Severity:** MEDIUM  
**File:** `src/screens/settings/PrivacySettingsScreen.tsx` — Line 53
```typescript
deleteAccountMutation.deleteAccountAsync({ userId: user.id }).then(...).catch(missing)
```
No `.catch()` handler — if the deletion fails, the user sees no error and `clearUser()` is never called.

#### ISSUE 7.2.7 — AchievementsScreen: Wrong Accessibility Hint
**Severity:** LOW  
**File:** `src/screens/profile/AchievementsScreen.tsx` — Line 121  
`accessibilityHint="Double tap to activate"` on close button. Should be `"Closes the achievement details"`.

#### ISSUE 7.2.8 — SettingsScreen: Wrong Accessibility Hint on Logout
**Severity:** LOW  
**File:** `src/screens/settings/SettingsScreen.tsx` — Line 137  
`accessibilityHint="Double tap to change setting"` — copy-pasted from toggle template. Should be `"Signs out of your VEX account"`.

#### ISSUE 7.2.9 — AccountSettingsScreen: Wrong Accessibility Labels
**Severity:** LOW  
**File:** `src/screens/settings/AccountSettingsScreen.tsx` — Lines 43, 45  
`accessibilityLabel="Account setting"` and `accessibilityHint="Double tap to change setting"` on back button. Should be `"Go back"` and `"Returns to settings"` respectively.

#### ISSUE 7.2.10 — SettingsScreen: Stub Email Placeholder
**Severity:** LOW  
**File:** `src/screens/settings/SettingsScreen.tsx` — Line 97  
`'user@example.com'` — hardcoded fallback email when user is null. Should be empty string or omitted.

#### ISSUE 7.2.11 — SettingsScreen: Hardcoded Version String
**Severity:** LOW  
**File:** `src/screens/settings/SettingsScreen.tsx` — Line 114  
`'VEX v1.0.0 (Build 100)'` — should come from build config, not hardcoded in markup.

#### ISSUE 7.2.12 — CompanionScreen: Uses `useReducedMotion()` — Correct
**Severity:** NONE (Positive)  
**File:** `src/screens/profile/CompanionScreen.tsx`  
Properly respects accessibility preferences. Has loading skeleton, empty state, error state, and success states.

---

## 8. DESIGN TOKEN & HARDCODED VALUE AUDIT

This is a dedicated section because the AGENTS.md explicitly mandates: "All colors via design tokens only — no hardcoded hex values anywhere."

### 8.1 ProfileIdentityBlock.tsx — 10 Hardcoded Values [HIGH]

| Line | Hardcoded Value | Should Be | Type |
|------|----------------|-----------|------|
| 36 | `'rgba(240, 138, 75, 0.16)'` | Design token for avatar background | rgba |
| 42 | `'rgba(240, 138, 75, 0.22)'` | Design token for avatar shadow | rgba |
| 61 | `'#22C55E'` | `vexLightGlass.semantic.success` or dedicated token | hex |
| 62 | `'#FFFFFF'` | `vexLightGlass.text.inverse` | hex |
| 76 | `'#0A1F1A'` | `vexLightGlass.text.primary` | hex |
| 87 | `'#3D5A52'` | `vexLightGlass.text.tertiary` | hex |
| 105 | `'#F08A4B'` | `vexLightGlass.semantic.fire` | hex |
| 110 | `"2.0x"` | Computed from actual multiplier state | string |
| 23-114 | Missing | All `accessibilityLabel`, `accessibilityRole`, `accessibilityHint` | a11y |

### 8.2 ProfileGlassTabs.tsx — 8 Hardcoded Values [HIGH]

| Line | Hardcoded Value | Should Be |
|------|----------------|-----------|
| 26 | `'rgba(255, 255, 255, 0.42)'` | `vexLightGlass.glass.fillSubtle` (0.52) or dedicated token |
| 27 | `'rgba(255, 255, 255, 0.88)'` | `vexLightGlass.glass.border` (0.88) |
| 33 | `'rgba(13, 76, 65, 0.16)'` | Design token for shadow |
| 49 | `'rgba(66, 207, 174, 0.22)'` | `glassMaterials.tabPill.backgroundColor` (0.18) |
| 50 | `'rgba(255, 255, 255, 0.92)'` | `vexLightGlass.glass.innerHighlight` (0.92) |
| 56 | `'rgba(18, 184, 148, 0.28)'` | Design token for active tab shadow |
| 64 | `'#0C765F'` | `vexLightGlass.mint[700]` (exact match!) |
| 64 | `'#3D5A52'` | Text token for inactive tab |

### 8.3 ProfileScreen.tsx — 6 Hardcoded Values [HIGH]

| Line | Hardcoded Value | Should Be |
|------|----------------|-----------|
| 97 | `'#DFA44A'` | `vexLightGlass.semantic.warning` (exact match!) |
| 98 | `'#F08A4B'` | Must add token — no exact match exists |
| 99 | `'#54AEEA'` | `vexLightGlass.semantic.info` (exact match!) |
| 130 | `'rgba(255, 255, 255, 0.85)'` | `vexLightGlass.glass.fillStrong` (0.84) |
| 132 | `'rgba(255, 255, 255, 0.92)'` | `vexLightGlass.glass.innerHighlight` (0.92) |
| 134 | `'rgba(16, 35, 31, 0.30)'` | `vexLightGlass.text.disabled` (0.32) |

### 8.4 MemoryConsoleScreen.tsx — 2 Theme Hook Bypasses [HIGH]

| Line | Issue |
|------|-------|
| 17 | `import { lightColors } from '@/theme/tokens/colors'` — imports static light palette instead of using `useTheme()` hook |
| 30-32 | `confidenceLabel()` uses `lightColors.semantic.*` directly — will NOT respond to dark mode |

### 8.5 Other Hardcoded Values

| File | Line | Value | Issue |
|------|------|-------|-------|
| `src/screens/settings/SettingsScreen.tsx` | 97 | `'user@example.com'` | Stub email |
| `src/screens/settings/SettingsScreen.tsx` | 114 | `'VEX v1.0.0 (Build 100)'` | Hardcoded version |
| `src/screens/progress/ProgressScreen.tsx` | 49 | `82` | Stub score |
| `src/screens/progress/ProgressScreen.tsx` | 86-88 | `"Stable"`, `"+6"`, `"+14"` | Stub copy |
| `src/screens/progress/ProgressScreen.tsx` | 135 | `"Level 7"`, `"450 XP"` | Stub progression |
| `src/features/onboarding/service.ts` | 112 | `10` (magic number for default focus duration) | Should use named constant |
| `src/features/onboarding/service.ts` | 132-134 | `4` steps, `15` seconds/step | Magic numbers |
| `src/shared/analytics/analytics-service.ts` | 174 | `'1.0.0'` fallback version | Should use `CURRENT_CONFIG.version` |
| `src/screens/profile/ProfileIdentityBlock.tsx` | 110 | `"2.0x"` | Stub multiplier |

---

## 9. REALTIME & MEMORY LEAK AUDIT

### 9.1 Event Bus Subscription Pattern

**Raw metrics:** 136 `.subscribe()` calls found vs 18 `.unsubscribe()` calls.

**Analysis:** Most subscriptions are in `useEffect` hooks where the returned cleanup function unsubscribes. The grep for "unsubscribe" misses cleanup patterns that call the return value of `subscribe()` (which is a function). However, several singletons and module-level subscriptions lack cleanup:

#### Leak Risk 9.1.1 — `session-analytics-listeners.ts` — Module-Level Subscriptions
**File:** `src/session/analytics/session-analytics-listeners.ts` — Lines 34-147  
7 subscriptions are pushed to an `unsubs` array and cleaned up when `teardown()` is called. This is correct BUT `teardown()` must be explicitly called on logout/app destruction.

#### Leak Risk 9.1.2 — `progression/analytics.ts` — Subscriptions Without Clear Cleanup Path
**File:** `src/features/progression/analytics.ts` — Lines 72, 84  
Two subscriptions (`xp:added`, `progression:level_up`). Verify cleanup on logout.

#### Leak Risk 9.1.3 — `achievements/service.ts` — 6 Subscriptions, No Unsubscribe Returned
**File:** `src/features/achievements/service.ts` — Lines 158-192  
`initializeAchievementTracking()` subscribes to 6 events but never returns or stores unsubscribe functions. Calling this function multiple times adds duplicate handlers.

#### Leak Risk 9.1.4 — `useRealtime.ts` — ActiveChannels Map May Retain Stale Entries
**File:** `src/hooks/useRealtime.ts` — Lines 58-60
```typescript
channel.unsubscribe().then(() => {
    if (!mounted) {activeChannels.delete(key);}
});
```
Only deletes from Map when component is unmounted. If component remounts quickly, old channel entries accumulate.

### 9.2 Supabase Realtime Channel Cleanup

#### Positive: Ref-Counted Notification Channels
**File:** `src/features/notifications/repository/notifications.ts` — Lines 137-195  
Excellent ref-counting pattern. Multiple components sharing the same user's notification subscription share one channel. When ref count drops to 0, the channel is unsubscribed.

#### Positive: Global `cleanupRealtime()` on Logout
**File:** `src/services/realtime.ts` — Lines 184-192  
Provides complete teardown of all channels. Verify this is called on logout.

---

## 10. NAVIGATION & DEEP LINK AUDIT

### 10.1 Typed Navigation

All navigation stacks are fully typed in `src/types/navigation.ts`:
- `RootStackParamList` — 12 routes
- `MainTabParamList` — 5 tabs  
- `AuthStackParamList` — 5 screens
- `OnboardingStackParamList` — 6 steps
- `ModalStackParamList` — 4 modals

### 10.2 Issues

#### ISSUE 10.2.1 — `StreakFuneral` Route Not in `RootStackParamList`
**Severity:** HIGH  
**File:** `src/navigation/hooks/useStreakFuneralNavigation.ts` — Line 164  
```typescript
navigationRef.navigate('StreakFuneral', streakFuneralData);
```
`'StreakFuneral'` is navigated to but is NOT defined in `RootStackParamList`. The code imports `ExtendedRootStackParams` which likely adds it, but the canonical type in `src/types/navigation.ts` doesn't include it. This is a TypeScript error waiting to surface and creates confusion about available routes.

**Fix:** Add `StreakFuneral: { previousStreak: number; diedAt: number }` to `RootStackParamList`.

#### ISSUE 10.2.2 — Verify Deep Link Registration
**Required before release:**
- `vex://` scheme registered in `app.json`/`app.config.ts`
- `vex://reset-password` mapped in linking config
- Universal links (iOS associated domains) configured
- Android intent filters for deep links

---

## 11. TESTING QUALITY AUDIT

### 11.1 Coverage Overview

| Module | Test Files | Quality |
|--------|-----------|---------|
| Session Engines | 30+ | Excellent |
| Session Orchestrator | 10+ | Good |
| Session Integration | 15+ | Good |
| Streaks | 5+ | Good |
| Date Utilities | 4 | Good |
| Content Study | 3+ | Adequate |
| Achievements | 1 | Adequate |
| Onboarding | 5 | Medium |
| Paywall | 2 | Medium |
| Profile Screens | 1 | Minimal |
| Settings | 1 | Minimal |
| Navigation | 1 | Minimal |
| Auth Flow | 0 | NONE |
| Economy | 0 | NONE |
| Boss | 0 | NONE |
| AI Coach | 0 | NONE |
| Companion Promise | 0 | NONE |
| Focus Contract | 0 | NONE |
| Personalization | 0 | NONE |

### 11.2 Test Quality Issues

#### ISSUE 11.2.1 — Tests Excluded from TypeScript Compilation
**File:** `tsconfig.json` — Lines 55-57  
Tests are in the `exclude` array, meaning type errors in test files won't surface during `tsc --noEmit`.

### 11.3 Minimum Viable Test Additions Before Release

1. **Auth flow tests:** Login success/failure, signup, password reset, session persistence
2. **Settings tests:** Privacy toggle, account deletion flow, password change
3. **Paywall tests:** Purchase flow, restore purchases, entitlement check
4. **Economy tests:** XP award, level-up, coin/gem calculation (or document ARCH-04 disable)
5. **Boss tests:** Damage calculation, defeat trigger, rewards

---

## 12. DATABASE & SUPABASE AUDIT

### 12.1 Migration Quality

43 migration files from `20250101` to `20260610`. Recent migrations show hardening focus:
- Performance indexes (`202605230001`)
- RLS hardening (`20260524`)
- Security hardening (`20260527`)
- Streak logic fix (`20260530`)
- Null idempotency key rejection (`20260603`)
- Session completion caps (`20260605`)
- Session ownership check (`20260606`)
- Search path hardening (`20260609`, `20260610`)

### 12.2 Edge Functions

**session-complete:** Production-grade — Zod validation, server-side value clamping, rate limiting, idempotency keys.  
**ai, ai-coach, content-study, season-finalize, trigger-jobs:** Present but not fully audited. Verify all deployed.

### 12.3 RLS Verification Required Before Release

Verify ALL user-data tables have RLS policies:
- `notifications` — restrict to `user_id = auth.uid()`
- `user_settings` — restrict to `user_id = auth.uid()`
- `coach_messages` — restrict to `user_id = auth.uid()`
- `coach_memories` — restrict to `user_id = auth.uid()`
- `focus_score_history` — restrict to `user_id = auth.uid()`
- `xp_history` — restrict to `user_id = auth.uid()`
- `mastery_tracks` — restrict to `user_id = auth.uid()`
- `streaks` — restrict to `user_id = auth.uid()`
- `analytics_events` — restrict to `user_id = auth.uid()`
- `wallets` — restrict to `user_id = auth.uid()`
- `session_history` — restrict to `user_id = auth.uid()`

---

## 13. AI SLOP & CODE QUALITY ISSUES

### 13.1 Identified AI-Generated Anti-Patterns

#### 13.1.1 — Copy-Paste Error Swallow in Settings Repository
**File:** `src/features/settings/repository-sync.ts` — Lines 67, 76  
The `if (error) {error;}` pattern appears twice identically. This is a classic AI-generated placeholder where the error handler was meant to be filled in later but never was.

#### 13.1.2 — Empty Type Import
**File:** `src/session/integration/SessionRewardIntegration.ts` — Line 4  
`import type {} from './session-reward-helpers'` — leftover from refactoring.

#### 13.1.3 — Over-Abstraction in Orchestrators
**Files:** `src/session/orchestrators/SessionCore.ts`, `SessionLifecycle.ts`, `SessionTimer.ts`, `SessionCompletion.ts`, `SessionRecovery.ts`  
Methods that operate on `this` (the orchestrator instance) are extracted into separate files as static functions. The orchestrator base holds all state and passes itself to these functions. This feels like over-decomposition — the methods are conceptually instance methods but live in separate files with no clear ownership boundary.

#### 13.1.4 — Dead Import Paths in ai-coach Service Barrel
**File:** `src/features/ai-coach/service/service.ts`  
6 imports to modules that don't exist. This is an AI-generated barrel that was never verified.

#### 13.1.5 — Stub Values Masquerading as Real Data
Multiple components have hardcoded values that appear to be real data but are stubs:
- `AchievementsScreen.tsx:26` — `const userId = 'current-user'`
- `ProgressScreen.tsx:49` — `const score = ... ?? 82`
- `SearchScreen.tsx:28-30` — `setTimeout(() => setIsSearching(false), 800)`
- `ProfileIdentityBlock.tsx:110` — `"2.0x"` multiplier
- `SettingsScreen.tsx:97` — `'user@example.com'`

#### 13.1.6 — Dual Repository Implementations Without Selection Logic
Two onboarding repository implementations (MMKV and Supabase) with the same exported name. No clear selection mechanism.

#### 13.1.7 — Underscore-Prefixed Parameters Used for "Unused" Pattern
`_source`, `_supabase`, `_context?` — this is a common GenAI pattern where parameters are accepted to satisfy an interface but never used, suggesting incomplete implementation.

#### 13.1.8 — Economy Repository Silently Overwrites Data
`getOrCreateWallet` upserts with `coins: 0, gems: 0` regardless of existing values. This is a critical data-integrity bug that looks like AI-generated code that didn't consider the "wallet already exists" case.

#### 13.1.9 — Circuit Breaker Bug: `failureCount` Not Reset
`shared/hardening/circuit-breaker.ts` line 80-85 — the transition method resets `successCount` and `halfOpenCalls` but forgets `failureCount`. Classic GenAI omission pattern.

---

## 14. FEATURE-BY-FEATURE DEEP AUDIT

### 14.1 Challenges Feature

**Files:** `src/features/challenges/` — 30+ files

| # | File:Line | Severity | Issue |
|---|-----------|----------|-------|
| 14.1.1 | `service.ts:30-34` | LOW | Redundant null check after Zod parse |
| 14.1.2 | `service.ts:71-74` | LOW | `Math.round` shows 0% when progress > 0 but ratio < 0.5% |
| 14.1.3 | `service.ts:99-122` | MEDIUM | Sequential `for...of` with `await` — should be `Promise.all` |
| 14.1.4 | `service.ts:168-175` | HIGH | Coin rewards calculated and returned but NEVER DELIVERED |
| 14.1.5 | `repository-user.ts:14` | LOW | Empty `import type {}` dead import |
| 14.1.6 | `repository-user.ts:86-89` | MEDIUM | `as JoinedChallengeRow` cast without runtime validation |
| 14.1.7 | `repository-user.ts:187-199` | HIGH | Race condition: fetch-then-update, not atomic |
| 14.1.8 | `repository-user.ts:191` | LOW | `_source` parameter unused |
| 14.1.9 | `repository-helpers.ts:11` | LOW | `_supabase` variable unused |
| 14.1.10 | `repository-helpers.ts:31-37` | LOW | Coin calculation logic duplicated from `helpers.ts` |
| 14.1.11 | `repository-reroll.ts:80` | MEDIUM | `cleanupRerollHistory` always returns hardcoded 0 |
| 14.1.12 | `repository-challenges.ts:36-37` | LOW | `new Date().toISOString()` mixes local time with UTC comparisons |

### 14.2 Achievements Feature

**Files:** `src/features/achievements/` — 8 files

| # | File:Line | Severity | Issue |
|---|-----------|----------|-------|
| 14.2.1 | `service.ts:16` | LOW | `_context?` parameter unused — achievement uniqueness tracking broken |
| 14.2.2 | `service.ts:19-21` | LOW | O(n) filter on every progress event — should be indexed |
| 14.2.3 | `service.ts:22-27` | HIGH | Sequential DB queries in `for...of` — should use `Promise.all` |
| 14.2.4 | `service.ts:68-72` | MEDIUM | `GREATER_THAN`, `LESS_THAN`, `CUMULATIVE` comparators don't match enum names |
| 14.2.5 | `service.ts:158-192` | MEDIUM | 6 event subscriptions with NO unsubscribe/cleanup mechanism |
| 14.2.6 | `service.ts:170-171` | HIGH | `BOSS_DEFEAT_UNIQUE` context (bossId) silently ignored |
| 14.2.7 | `repository.ts:29-31` | MEDIUM | Error swallowing — returns `null` instead of throwing |
| 14.2.8 | `repository.ts:53-54` | MEDIUM | Same error swallowing — returns `[]` on DB error |
| 14.2.9 | `repository.ts:23-24` | LOW | Hardcoded column list duplicated across queries |
| 14.2.10 | `repository.ts:153` | MEDIUM | `resetAllUserAchievements` has NO error handling |

### 14.3 Economy Feature

**Files:** `src/features/economy/` — 8+ files

| # | File:Line | Severity | Issue |
|---|-----------|----------|-------|
| 14.3.1 | `repository.ts:24-31` | CRITICAL | `getOrCreateWallet` upserts with `coins: 0, gems: 0` — OVERWRITES EXISTING BALANCES |
| 14.3.2 | `repository.ts:38-42` | LOW | `getCurrentUserId` in repository — auth concern, not data access |
| 14.3.3 | `StreakInsurance.ts:13-28` | MEDIUM | Entire service is hardcoded stub (ARCH-04 disabled) — no explanatory comments |
| 14.3.4 | `wallet-service.ts:1-47` | MEDIUM | Entire service is stub (ARCH-04 disabled) — misleading `DB_ERROR` codes |
| 14.3.5 | `service.ts:11-14` | LOW | `getBalance` only returns coins — no gem balance support |

### 14.4 AI Coach Feature

**Files:** `src/features/ai-coach/` — 50+ files across 16 subdirectories

| # | File:Line | Severity | Issue |
|---|-----------|----------|-------|
| 14.4.1 | `service/service.ts:53,67,72,95-101,107,116` | CRITICAL | 5-6 dead import paths to non-existent modules |
| 14.4.2 | `repository/memories-core.ts:56,80,102` | MEDIUM | Plain `new Error()` instead of `RepositoryError` |
| 14.4.3 | `repository/memories-operations.ts:31,48,80,101,130` | MEDIUM | Plain `new Error()` throughout |
| 14.4.4 | `repository/state.ts:40-52` | MEDIUM | Raw data mapping without Zod schema validation |
| 14.4.5 | `repository/state.ts:84-88` | LOW | RepositoryError wraps empty `new Error(...)` — no useful info |
| 14.4.6 | `repository/state.ts:90-91` | LOW | Returns input state instead of re-parsing returned DB data |
| 14.4.7 | `repository/recommendations.ts:33-55` | MEDIUM | Double Zod parse per row — unnecessary overhead |
| 14.4.8 | `repository/messages-crud.ts:93-110` | LOW | Status string matching without enum/union type |
| 14.4.9 | `repository/messages-crud.ts:144-147` | LOW | `new Date().toISOString()` for `read_at` — but field may expect timestamp number |
| 14.4.10 | `repository/messages-subscriptions.ts:18-41` | HIGH | Reconnect callback is DEAD CODE — first SUBSCRIBED case catches all |
| 14.4.11 | `repository/intervention.ts:88-91` | LOW | `startOfDay` computed in local time — may miss UTC-today interventions |
| 14.4.12 | `repository/personas.ts:16` | LOW | Hardcoded column list duplicated |

### 14.5 Onboarding Feature

**Files:** `src/features/onboarding/` — 15+ files

| # | File:Line | Severity | Issue |
|---|-----------|----------|-------|
| 14.5.1 | `service.ts:1` | LOW | Service imports Zustand hook (should import standalone getter) |
| 14.5.2 | `service.ts:92-107` | MEDIUM | Dynamic `await import('./repository')` — anti-pattern in service layer |
| 14.5.3 | `service.ts:112-123` | LOW | Magic numbers: `10` min focus duration, `4` steps, `15` sec/step |
| 14.5.4 | `repository.ts:80-91` | MEDIUM | Zod `.parse()` error details lost when caught and re-wrapped |
| 14.5.5 | `repository/index.ts:1-11` | HIGH | Exports from MMKV-based repo — BUT `repository.ts` (root) exports Supabase-based repo. Two competing implementations. |
| 14.5.6 | `store.ts:81-86` | MEDIUM | Async storage adapter with Zustand — hydration race possible |
| 14.5.7 | `store.ts:88-105` | LOW | `as OnboardingStore` unsafe cast on partialize result |
| 14.5.8 | `repository/OnboardingRepository.ts:9` | LOW | Direct MMKV import at feature level — acceptable per docs |

### 14.6 Progression Feature

**Files:** `src/features/progression/` — 15+ files

| # | File:Line | Severity | Issue |
|---|-----------|----------|-------|
| 14.6.1 | `repository/unified.ts:20,36,50` | MEDIUM | Raw `throw error` without RepositoryError wrapper |
| 14.6.2 | `repository/unified.ts:123-170` | MEDIUM | 40+ `as X` casts without Zod validation |
| 14.6.3 | `repository/unified.ts:88-121` | MEDIUM | `buildTrackXpUpdate` returns `Record<string, number>` — untyped |
| 14.6.4 | `repository/prestige.ts:70` | LOW | Inline `supabase.rpc('increment')` without error wrapping |

### 14.7 Additional Feature Issues

| # | Feature | File:Line | Severity | Issue |
|---|---------|-----------|----------|-------|
| 14.7.1 | LiveOps Config | `feature-health-checks.ts:18-23` | LOW | `hasGeminiKey` doesn't check for Gemini key — checks function name |
| 14.7.2 | LiveOps Config | `feature-health-checks.ts:65-68` | MEDIUM | Tautological check — constant comparison always yields same result |
| 14.7.3 | LiveOps Config | `premium-revenuecat-health-checks.ts:9-13` | LOW | `||` for platform key selection may pick iOS key on Android |
| 14.7.4 | LiveOps Config | `feature-access-store.ts:10` | LOW | `_degradedFeatures` starts with `premium_paywall` degraded by default |
| 14.7.5 | Monetization | `revenuecat-service.ts:80` | LOW | `appUserID: undefined` passed to Purchases.configure — should use null or omit |
| 14.7.6 | Edge AI | `edge-function-service.ts:55` | MEDIUM | `as LooselyTypedContext` cast — no runtime parsing |
| 14.7.7 | Edge AI | `edge-function-service.ts:76,97,116` | MEDIUM | Unvalidated `as ResponseType` casts on AI responses |
| 14.7.8 | API Client | `api-client.ts:53-66` | LOW | `setAuthProvider` adds new interceptor without removing old — duplicates possible |
| 14.7.9 | API Client | `api-client.ts:183-188` | LOW | Singleton `getApiClient()` never reset — stale interceptors persist across sessions |
| 14.7.10 | API Client | `api-request-handler.ts:95-96` | LOW | Body allowed on DELETE requests (should not per HTTP spec) |
| 14.7.11 | API Retry | `hardening/retry.ts:39-40` | LOW | `isRetryable` uses case-sensitive substring match — `"not_a_timeout"` matches `'timeout'` |
| 14.7.12 | API Retry | `hardening/retry.ts:34-53` | LOW | Jitter always 0-1000ms regardless of delay magnitude — should be proportional |
| 14.7.13 | Auth Store | `authStore.ts:21` | MEDIUM | `partialize` only persists `id` + `onboardingCompletedAt` — needs documentation that this is intentional |

---

## 15. SCREEN-BY-SCREEN DEEP AUDIT

### 15.1 AchievementsScreen — 1 CRITICAL + 3 issues
- **CRITICAL:** `const userId = 'current-user'` (line 26) — fake ID, never loads real achievements
- MEDIUM: Empty state doesn't show achievements header (line 83)
- LOW: Wrong `accessibilityHint` on close button (line 121)
- LOW: FlashList uses index-only `keyExtractor` (line 66-81)

### 15.2 ProgressScreen — 5 HIGH + 2 issues
- **HIGH:** Hardcoded stub score `82` when dashboard fails (line 49)
- **HIGH:** No loading state check — renders with stub data (lines 62-153)
- **HIGH:** No error state or retry (lines 62-153)
- **HIGH:** Stub text `"Stable"`, `"+6"`, `"+14"` (lines 86-88)
- **HIGH:** Stub progression `"Level 7"`, `"450 XP to Level 8"` (line 135)
- MEDIUM: Handles all four UI tabs without loading/error per tab

### 15.3 SearchScreen — 3 HIGH + 2 issues
- **HIGH:** Fake search — `setTimeout` instead of real query (lines 28-30)
- **HIGH:** No error state with retry (lines 44-71)
- **HIGH:** No empty results state (lines 44-71)
- MEDIUM: No accessibility labels on child components

### 15.4 MasteryScreen — 1 HIGH + 2 issues
- **HIGH:** Text-only loading state (line 62) — must use skeleton
- MEDIUM: Error state uses generic description — should be context-relevant
- LOW: Wrong `accessibilityHint` on close button (line 119)

### 15.5 ProfileIdentityBlock — 10 HIGH (hardcoded colors/values)
See Section 8.1 for full details.

### 15.6 ProfileGlassTabs — 8 HIGH (hardcoded colors) + accessibility
See Section 8.2 for full details.

### 15.7 ProfileScreen — 6 hardcoded colors (see Section 8.3)
See Section 8.3 for full details.

### 15.8 MemoryConsoleScreen — 2 HIGH (theme hook bypass)
See Section 8.4 for full details.

### 15.9 Settings Screens — 5 issues
- MEDIUM: `AccountSettingsScreen` no loading/error states (lines 23-65)
- MEDIUM: `PrivacySettingsScreen` unhandled promise in deletion (line 53)
- LOW: `SettingsScreen` stub email `'user@example.com'` (line 97)
- LOW: `SettingsScreen` hardcoded version string (line 114)
- LOW: Wrong accessibility hints on back button and logout button

### 15.10 CompanionScreen — 0 issues (Positive)
Handles all states: loading (skeleton), error, empty, success. Uses `useReducedMotion()`. Uses theme tokens.

### 15.11 NotificationsScreen — 0 issues (Positive)
Handles all states. Uses FlashList with `estimatedItemSize`. Uses theme tokens.

### 15.12 PaywallScreen — 0 issues (Positive)
Handles loading, error, unavailable, success states. Delegates to dedicated state components.

### 15.13 OnboardingFlowScreen — 0 significant issues
Uses `etherealText` tokens correctly. Well-structured.

---

## 16. COMPLETE ISSUES INDEX BY SEVERITY

### 16.1 CRITICAL (Must Fix Before Any Build)

| ID | File | Line(s) | Issue |
|----|------|---------|-------|
| C1 | `src/navigation/hooks/useStreakFuneralNavigation.ts` | 51-53 | `getLastFuneralShown()` always returns `null` |
| C2 | `src/navigation/hooks/useStreakFuneralNavigation.ts` | 53-55 | `setLastFuneralShown()` is empty function |
| C3 | `src/streaks/StreakService.ts` | 33-35 | `getState()` always returns EMPTY_STREAK_STATE |
| C4 | `src/screens/profile/AchievementsScreen.tsx` | 26 | Fake userId `'current-user'` — achievements never load |
| C5 | `src/shared/hardening/circuit-breaker.ts` | 80-85 | `failureCount` never reset on CLOSE transition |
| C6 | `src/features/ai-coach/service/service.ts` | 53-116 | 5-6 dead import paths |
| C7 | `src/features/economy/repository.ts` | 24-31 | `getOrCreateWallet` overwrites existing balances |

### 16.2 HIGH (Must Fix Before Release)

| ID | File | Line(s) | Issue |
|----|------|---------|-------|
| H1 | `src/features/settings/repository-sync.ts` | 67, 76 | Two error-swallowing patterns |
| H2 | `src/features/progression/repository/unified.ts` | 123-170 | 40+ `as X` casts without Zod |
| H3 | `src/features/settings/repository-sync.ts` | 36-44, 124-126 | `as X` casts without Zod |
| H4 | `src/types/navigation.ts` | 31-46 | `StreakFuneral` route not registered |
| H5 | `src/features/progression/repository/unified.ts` | 20, 36, 50 | Raw `throw error` without RepositoryError |
| H6 | `src/screens/session/` | Entire directory | Business logic in screen layer |
| H7 | `src/features/achievements/service.ts` | 22-27 | Sequential DB queries in for-of |
| H8 | `src/features/achievements/service.ts` | 170-171 | BOSS_DEFEAT_UNIQUE context ignored |
| H9 | `src/features/challenges/service.ts` | 168-175 | Coin rewards never delivered |
| H10 | `src/features/challenges/repository-user.ts` | 187-199 | Race condition: non-atomic increment |
| H11 | `src/features/ai-coach/repository/messages-subscriptions.ts` | 18-41 | Reconnect callback is dead code |
| H12 | `src/features/onboarding/repository.ts` + `repository/OnboardingRepository.ts` | All | Two competing repository implementations |
| H13 | `src/screens/progress/ProgressScreen.tsx` | 49, 62-153 | Stub score, no loading/error states |
| H14 | `src/screens/progress/ProgressScreen.tsx` | 86-88, 135 | Stub text values |
| H15 | `src/screens/search/SearchScreen.tsx` | 28-30, 44-71 | Fake search, no error/empty states |
| H16 | `src/screens/profile/MasteryScreen.tsx` | 62 | Text-only loading state |
| H17 | `src/screens/profile/ProfileIdentityBlock.tsx` | 36-110 | 10 hardcoded color values |
| H18 | `src/screens/profile/ProfileGlassTabs.tsx` | 26-64 | 8 hardcoded color values |
| H19 | `src/screens/profile/ProfileScreen.tsx` | 97-134 | 6 hardcoded color values |
| H20 | `src/screens/profile/MemoryConsoleScreen.tsx` | 17, 30-32 | Static lightColors import — bypasses dark mode |

### 16.3 MEDIUM (Strongly Recommended Before Release)

| ID | File | Line(s) | Issue |
|----|------|---------|-------|
| M1 | `src/store/authStore.ts` | 21 | Partialize strips user data — document or fix |
| M2 | `src/hooks/useRealtime.ts` | 58-60 | ActiveChannels stale entries |
| M3 | `src/session/integration/SessionRewardIntegration.ts` | 4 | Empty type import |
| M4 | `src/shared/analytics/analytics-service.ts` | 174 | Hardcoded `'1.0.0'` version fallback |
| M5 | `src/features/onboarding/store.ts` | 81-86 | Async storage with Zustand — hydration race |
| M6 | `src/features/onboarding/service.ts` | 92-107 | Dynamic import in service |
| M7 | `src/features/onboarding/repository.ts` | 80-91 | Zod error details lost on catch |
| M8 | `src/features/challenges/service.ts` | 99-122 | Sequential for-of — should use Promise.all |
| M9 | `src/features/challenges/repository-reroll.ts` | 80 | Always returns hardcoded 0 |
| M10 | `src/features/achievements/repository.ts` | 29-31, 53-54, 153 | Error swallowing / no error handling |
| M11 | `src/features/ai-coach/repository/memories-core.ts` | 56, 80, 102 | Plain Error instead of RepositoryError |
| M12 | `src/features/ai-coach/repository/memories-operations.ts` | 31, 48, 80, 101, 130 | Plain Error instead of RepositoryError |
| M13 | `src/features/ai-coach/repository/state.ts` | 40-52 | No Zod schema validation on DB rows |
| M14 | `src/features/ai-coach/repository/recommendations.ts` | 33-55 | Double Zod parse per row |
| M15 | `src/shared/ai/edge-function-service.ts` | 55, 76, 97, 116 | Unvalidated casts |
| M16 | `src/screens/settings/AccountSettingsScreen.tsx` | 23-65 | No loading/error states |
| M17 | `src/screens/settings/PrivacySettingsScreen.tsx` | 53 | Unhandled promise in deletion |
| M18 | `src/features/liveops-config/feature-health-checks.ts` | 65-68, 86-89 | Tautological health checks |
| M19 | `src/screens/session/` + `src/session/` + `src/features/session/` | All | Triple location for session logic |

### 16.4 LOW (Fix Post-Release If Time Allows)

| ID | File | Line(s) | Issue |
|----|------|---------|-------|
| L1-L20 | Multiple | Various | Unused parameters, magic numbers, minor inconsistencies (detailed above) |

---

## 17. RELEASE PHASE — FINAL RELEASE CHECKLIST

### PHASE 1: CRITICAL FIXES (Block Release)

#### C1+C2: Fix Streak Funeral Persistence
**Files:** `src/navigation/hooks/useStreakFuneralNavigation.ts`  
1. Import MMKV storage adapter  
2. `getLastFuneralShown()`: return `mmkvStorage.getNumber(key) ?? null`  
3. `setLastFuneralShown()`: `mmkvStorage.set(key, Date.now())`  
4. **Test:** Kill app mid-session; verify funeral not shown twice in 7 days  
5. **Test:** Break 7+ day streak; verify funeral shows once  

#### C3: Wire StreakService to Real Data
**File:** `src/streaks/StreakService.ts`  
1. Import `getOrCreateStreak` from `features/streaks/service.ts`  
2. `getState()` must call real streak service to retrieve actual streak data  
3. **Test:** Complete sessions; verify service reflects actual state  

#### C4: Fix AchievementsScreen userId
**File:** `src/screens/profile/AchievementsScreen.tsx`  
1. Replace `const userId = 'current-user'` with actual user ID from `useAuthStore()`  
2. **Test:** Login; verify achievements load for real user  

#### C5: Fix Circuit Breaker failureCount Reset
**File:** `src/shared/hardening/circuit-breaker.ts`  
1. Add `this.failureCount = 0` in `transitionTo` when transitioning to CLOSED  
2. **Test:** Force circuit open; verify recovery; verify new failure doesn't immediately re-open  

#### C6: Fix Dead AI Coach Imports
**File:** `src/features/ai-coach/service/service.ts`  
1. Either implement missing modules or remove dead imports  
2. **Test:** `npx tsc --noEmit` passes  

#### C7: Fix Economy Wallet Data Destruction
**File:** `src/features/economy/repository.ts`  
1. Change upsert to NOT overwrite existing balances (use `ignoreDuplicates` or query-first)  
2. **Test:** Create wallet with balance; call getOrCreateWallet; verify balance preserved  

### PHASE 2: HIGH PRIORITY FIXES (Must Fix Before Release)

#### H1: Fix Settings Sync Error Handling
**File:** `src/features/settings/repository-sync.ts`  
1. Lines 67, 76: Change `if (error) {error;}` to `if (error) { throw new RepositoryError('fn', error); }`  

#### H2: Add Zod Validation to Progression Repository
**File:** `src/features/progression/repository/unified.ts`  
1. Create Zod schemas for DB rows  
2. Replace all `as X` casts with `.parse()` calls  

#### H3: Add Zod to Settings Sync
**File:** `src/features/settings/repository-sync.ts`  
1. Create Zod schemas for Supabase response rows  

#### H4: Register StreakFuneral Route
**File:** `src/types/navigation.ts`  
1. Add `StreakFuneral: { previousStreak: number; diedAt: number }` to RootStackParamList  

#### H5: Wrap Progression Errors
**File:** `src/features/progression/repository/unified.ts`  
1. Replace all `throw error` with `throw new RepositoryError(...)`  

#### H6: Clean Screen Session Directory
**Directory:** `src/screens/session/`  
1. Audit for duplicates from `src/session/` and `src/features/session/`  
2. Remove duplicates  
3. Move unique hooks/utils to feature layer  

#### H7-H12: Achievement, Challenge, AI Coach Fixes
- Fix sequential DB queries → Promise.all (H7, H8)  
- Fix coin rewards delivery (H9)  
- Fix race condition with atomic increment (H10)  
- Fix reconnect dead code (H11)  
- Resolve dual onboarding repository (H12)  

#### H13-H20: Screen Fixes
- ProgressScreen: Replace stubs with real data + add states (H13, H14)  
- SearchScreen: Implement real search + add states (H15)  
- MasteryScreen: Skeleton UI (H16)  
- ProfileIdentityBlock, ProfileGlassTabs, ProfileScreen, MemoryConsoleScreen: Replace all hardcoded hex/rgba with design tokens (H17-H20)  

### PHASE 3: MEDIUM PRIORITY FIXES

Complete items M1-M19 from Section 16.3. Prioritize:
- M1: Document or fix auth persistence strategy
- M5: Fix onboarding Zustand hydration race
- M16-M17: Add loading/error states to settings screens
- M18: Fix tautological health checks
- M19: Resolve triple session module location

### PHASE 4: PRE-RELEASE VERIFICATION

#### V1: TypeScript
```bash
npx tsc --noEmit
```
Must produce ZERO errors.

#### V2: Lint
```bash
npm run lint
```
Zero errors and warnings.

#### V3: Tests
```bash
npm test
```
All 68 test files pass. New auth/settings/paywall tests added per Section 11.3.

#### V4: Supabase Types
```bash
npm run types:supabase
```
Verify no schema drift.

#### V5: Environment Configuration
- [ ] All `EXPO_PUBLIC_*` variables in `.env.production`
- [ ] `.env.production` in `.gitignore`
- [ ] `.env.example` with placeholder values
- [ ] Sentry DSN set for production
- [ ] PostHog key set for production
- [ ] RevenueCat iOS and Android keys set for production
- [ ] Supabase URL and anon key set for production

#### V6: App Configuration
- [ ] `app.json` / `app.config.ts`: name=VEX, slug=vex, version correct, bundle IDs correct, scheme=vex
- [ ] iOS associated domains for universal links
- [ ] Android intent filters for deep links

#### V7: RevenueCat Production
- [ ] Products, entitlements, offerings configured in RC dashboard
- [ ] Sandbox testing completed iOS + Android
- [ ] Purchase flow, restore, downgrade tested end-to-end

#### V8: Supabase Production
- [ ] All migrations applied
- [ ] RLS on all user-data tables (verify list in Section 12.3)
- [ ] Edge functions deployed
- [ ] Service role key set in secrets
- [ ] Rate limiting configured
- [ ] Backups configured, PITR enabled

#### V9: Sentry
- [ ] Initialized in production config
- [ ] Release version correct
- [ ] Source maps uploaded
- [ ] Alert rules configured

#### V10: App Store Readiness
- [ ] App icon (all sizes)
- [ ] Splash screen
- [ ] Store descriptions
- [ ] Screenshots (all device sizes)
- [ ] Privacy policy URL active
- [ ] Age rating completed
- [ ] Export compliance

#### V11: Performance
- [ ] Bundle size under ~50MB
- [ ] Cold start under 3 seconds
- [ ] Memory stable (no leaks after extended use)
- [ ] 60fps on animations

#### V12: Offline Behavior
- [ ] Airplane mode: app launches without crash
- [ ] Cached data displays correctly
- [ ] Offline banner shows
- [ ] Writes queued for sync
- [ ] Online recovery: data syncs, no conflicts

#### V13: Error States Walkthrough
- [ ] Network error → graceful screen with retry
- [ ] Auth error → redirect to login
- [ ] Supabase down → degraded mode
- [ ] RevenueCat down → premium features degrade
- [ ] Edge function timeout → retry with backoff
- [ ] App crash → Sentry captures, restart clean

#### V14: Security
- [ ] No secrets in source
- [ ] All API calls use HTTPS
- [ ] JWT tokens in expo-secure-store
- [ ] MMKV for non-sensitive only
- [ ] Analytics PII sanitization working
- [ ] Rate limiting on all auth endpoints
- [ ] RLS on all Supabase tables

#### V15: Accessibility Minimum
- [ ] VoiceOver/TalkBack reads all interactive elements
- [ ] Touch targets minimum 44x44
- [ ] Color contrast WCAG AA minimum
- [ ] `useReducedMotion()` respected

### PHASE 5: POST-RELEASE MONITORING

1. **Sentry:** Crash-free > 99%, alert on unhandled rejections, RC init failures, Supabase connection errors
2. **PostHog:** DAU, session completion rate, streak rate, paywall conversion, feature adoption, D1/D7/D30 retention, onboarding completion
3. **RevenueCat:** Active subs, MRR, churn, trial conversion
4. **Supabase:** DB usage, edge function invocations/errors, realtime connections, auth rate, RLS violations
5. **App Stores:** Crash rate < 0.1%, ANR < 0.1%, app size OK, review SLA met

### PHASE 6: FINAL SIGN-OFF

Before tagging a release build:
- [ ] ALL CRITICAL issues (C1-C7) fixed and verified
- [ ] ALL HIGH issues (H1-H20) fixed and verified  
- [ ] ALL MEDIUM issues (M1-M19) fixed or explicitly deferred
- [ ] `npx tsc --noEmit` zero errors
- [ ] All tests pass
- [ ] Environment vars configured for production
- [ ] Supabase migrations applied
- [ ] Edge functions deployed
- [ ] RevenueCat configured
- [ ] Sentry configured
- [ ] Deep links working iOS + Android
- [ ] Universal links working iOS
- [ ] Full critical path walkthrough:
  - [ ] Sign up → Onboarding → First session → Complete → Rewards
  - [ ] Login → Home → Start session → Complete → Streak update
  - [ ] Settings → Change notifications → Verify
  - [ ] Paywall → Purchase → Premium features unlock
  - [ ] Kill mid-session → Reopen → Session recovery
  - [ ] Airplane mode → Navigate → Online → Sync

---

**Generated:** June 11, 2026, ~04:00 UTC  
**Total issues found:** 85+ (7 CRITICAL, 20 HIGH, 19 MEDIUM, 20+ LOW, 6 INFO)  
**Estimated fix time (CRITICAL only):** 1-2 engineer-days  
**Estimated fix time (CRITICAL + HIGH):** 4-6 engineer-days  
**Estimated fix time (all issues):** 7-10 engineer-days  
**Audit duration:** ~3 hours deep analysis across 4,491 files  
**Recommended release window:** After completing Phase 1 + Phase 2 + Phase 3 + Phase 4 verification
