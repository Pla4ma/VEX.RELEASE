# VEXMAX — ULTIMATE PRE-RELEASE CODE AUDIT

> **Date:** June 17, 2026
> **App:** VEX — Focus & Productivity Companion (Expo React Native)
> **Branch:** main (worktree dirty from extensive fixes)
> **TypeScript:** 0 errors (`npx tsc --noEmit` clean) ✅
> **Purpose:** Complete pre-release code audit for Hermes overnight execution
> **Method:** Thermo-nuclear code quality review + 40+ live code searches + security audit + web research for 2026 best practices
> **NOTES:** This document is exclusively about code quality, security, performance, and release readiness. Product decisions (features, UX, copy, design) are handled by the human. Archived features listed in `docs/ARCHIVED_FEATURES_DO_NOT_REVIVE.md` must NOT be revived under any circumstances.

---

## TABLE OF CONTENTS

1. [EXECUTIVE SUMMARY](#1-executive-summary)
2. [TYPESCRIPT & TYPE SAFETY](#2-typescript--type-safety)
3. [SECURITY AUDIT](#3-security-audit)
4. [ARCHITECTURE & ARCHITECTURE VIOLATIONS](#4-architecture--architecture-violations)
5. [FILE SIZE & DECOMPOSITION](#5-file-size--decomposition)
6. [BANNED PATTERN AUDIT](#6-banned-pattern-audit)
7. [NAVIGATION TYPE SAFETY](#7-navigation-type-safety)
8. [PERFORMANCE AUDIT](#8-performance-audit)
9. [STATE MANAGEMENT AUDIT](#9-state-management-audit)
10. [ERROR HANDLING AUDIT](#10-error-handling-audit)
11. [TESTING COVERAGE & QUALITY](#11-testing-coverage--quality)
12. [ACCESSIBILITY AUDIT](#12-accessibility-audit)
13. [DESIGN TOKEN COMPLIANCE](#13-design-token-compliance)
14. [EVENT SYSTEM AUDIT](#14-event-system-audit)
15. [FEATURE GATE & BLOAT FIREWALL](#15-feature-gate--bloat-firewall)
16. [EDGE FUNCTIONS AUDIT](#16-edge-functions-audit)
17. [BUILD & EXPO PIPELINE](#17-build--expo-pipeline)
18. [DEPENDENCY AUDIT](#18-dependency-audit)
19. [AI SLOP & DEAD CODE](#19-ai-slop--dead-code)
20. [HARDCODED VALUES & MAGIC NUMBERS](#20-hardcoded-values--magic-numbers)
21. [SUBSCRIPTION & MEMORY LEAK AUDIT](#21-subscription--memory-leak-audit)
22. [SUPABASE RLS & MIGRATION AUDIT](#22-supabase-rls--migration-audit)
23. [2026 PRODUCTION BEST PRACTICES](#23-2026-production-best-practices)
24. [RELEASE PHASE — CRITICAL BLOCKERS](#24-release-phase--critical-blockers)
25. [RELEASE PHASE — HIGH PRIORITY](#25-release-phase--high-priority)
26. [RELEASE PHASE — MEDIUM PRIORITY](#26-release-phase--medium-priority)
27. [RELEASE PHASE — LOW PRIORITY (POST-LAUNCH)](#27-release-phase--low-priority-post-launch)
28. [PRE-LAUNCH CHECKLIST](#28-pre-launch-checklist)
29. [PHASED EXECUTION PLAN FOR HERMES](#29-phased-execution-plan-for-hermes)
30. [APPENDIX: COMPLETE FINDINGS TABLE](#30-appendix-complete-findings-table)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Current State

| Metric | Value | Status |
|--------|-------|--------|
| TypeScript errors | **0** | ✅ CLEAN |
| Source files (non-test) | ~3,266 | — |
| Test files | ~1,440 (44.1%) | Good |
| Files with `any` type | **2** (active source) | ⚠️ Must fix |
| `@ts-ignore` / `@ts-nocheck` | **0** | ✅ PERFECT |
| `console.log` in active source | **0** | ✅ PERFECT |
| `Animated` from react-native | **0** | ✅ PERFECT |
| `FlatList` (should be FlashList) | **0** (only in a11y checks) | ✅ PERFECT |
| `StyleSheet.create` | **0** | ✅ PERFECT |
| `raw fetch()` outside API client | **1** | ⚠️ Must fix |
| String literal `navigation.navigate('X')` | **~99** | 🔴 HIGH |
| Files ≥200 lines (non-test, non-generated) | **~20** | 🔴 HIGH |
| Files exactly 200 lines (truncation) | **12** | 🔴 HIGH — AI slop |
| Supabase queries outside repository | **~6** (actual violations) | 🟡 MEDIUM |
| Edge function monoliths | **3** (882, 500, 390 lines) | 🔴 HIGH |
| Event system `[key: string]: unknown` | **1** (decorative typing) | 🟡 MEDIUM |
| `Record<string, unknown>` casts | **100+** | 🔴 HIGH |
| Version-suffixed files (-enhanced, -v2, -legacy) | **28+** | 🔴 HIGH |
| Feature folders missing mandatory files | **36** | 🟡 MEDIUM |
| Archive directory size | **780 files, 24 dirs** | 🟡 MEDIUM |
| ESLint warnings (zero-signal tool) | **~18,340** | 🔴 HIGH |
| Security: edge function email bypass | **1 critical** | 🔴 CRITICAL |
| Security: economy RPCs unauditable | **3** | 🔴 CRITICAL |
| Security: npm audit advisories | **43** | 🔴 HIGH |

### 1.2 What's Working Well

- **Zero `@ts-ignore`/`@ts-nocheck`** — strict policy perfectly enforced
- **Zero `console.log`** in active source — proper logging discipline
- **Zero `AsyncStorage`** — using MMKV and SecureStorage correctly
- **Zero `StyleSheet.create`** — using theme tokens correctly
- **Zero `Animated` from react-native** — all Reanimated 4.3.1
- **Zero `FlatList`** — all FlashList with estimatedItemSize
- **`npx tsc --noEmit` passes with 0 errors** — type safety baseline achieved
- **Supabase uses SecureStorage adapter** with `detectSessionInUrl: false`
- **Sentry replay has `maskAllText: true, maskAllImages: true`** — privacy hardened
- **Certificate pinning configured** for supabase.co, api.revenuecat.com, sentry.io
- **App Privacy manifest complete** — iOS NSPrivacyAccessedAPITypes declared
- **Feature gate system** — clean feature management for archived features
- **330 files with Zod schemas** — strong runtime validation
- **368 files with Reanimated** — proper animation library
- **487 files with accessibility labels** — good coverage
- **483 files using theme system** — consistent theming
- **184 files with Sentry integration** — strong observability

### 1.3 Top 10 Immediate Actions

| # | Finding | Priority | Effort |
|---|---------|----------|--------|
| 1 | Fix edge function JWT email verification bypass | CRITICAL | 30 min |
| 2 | Audit/fix economy RPCs (grant_currency, atomic_spend_currency, atomic_add_currency) | CRITICAL | 4 hrs |
| 3 | Fix 2 `any` types + 2 `as any` casts | CRITICAL | 30 min |
| 4 | Fix 1 `raw fetch()` — route through API client | HIGH | 15 min |
| 5 | Verify 12 files at exactly 200 lines are NOT truncated | HIGH | 2 hrs |
| 6 | Replace 99+ string literal navigation with typed routes | HIGH | 4 hrs |
| 7 | Replace `useNavigation<any>()` with typed navigation | HIGH | 5 min |
| 8 | Decompose the 3 edge function monoliths | HIGH | 8 hrs |
| 9 | Fix `[key: string]: unknown` in EventChannels | MEDIUM | 2 hrs |
| 10 | Delete 28+ version-suffixed files (-enhanced, -v2, -legacy) | MEDIUM | 2 hrs |

---

## 2. TYPESCRIPT & TYPE SAFETY

### 2.1 Current Status: 0 TypeScript Errors ✅

The codebase has been successfully cleaned up. `npx tsc --noEmit` passes with zero errors. This was achieved through extensive fixes documented in the git log.

### 2.2 `any` Type Usage — FIX BEFORE RELEASE

**2 files with `any` type in active source:**

**FINDING 2.2.1 — `useNavigation<any>()`**
- **File:** `src/screens/onboarding/hooks/useOnboardingFlow.ts:23`
- **Code:** `const navigation = useNavigation<any>();`
- **Severity:** 🔴 CRITICAL — defeats type safety on navigation
- **Fix:** Replace with `useNavigation<NavigationProp<RootStackParamList>>()` or the project's typed navigation hook
- **Effort:** 5 min

**FINDING 2.2.2 — Double `as any` cast in NotificationBadge**
- **File:** `src/features/notifications/components/NotificationBadge.tsx:15`
- **Code:** `refetch: () => Promise.resolve({ data: 0 } as any), ... isEnabled: true, promise: Promise.resolve({ data: 0 } as any), ...} as UseQueryResult<number>`
- **Severity:** 🟡 MEDIUM — stub query return with double cast escape hatch
- **Fix:** Create a proper stub helper function with correct types, or use a typed mock factory
- **Effort:** 10 min

### 2.3 Unsafe Null Assertions (`!.`)

**~55 occurrences** of `!.` remain in active source. Each is a potential runtime crash.

**Key files (sampled from audit):**
- `src/persistence/StorageManager.ts` — 7 `!.` on `this.active`
- `src/persistence/MMKVStorageAdapter.ts` — 2 `!.` on `mmkvStorage`
- `src/session/utils/session-lifecycle-validators.ts` — 3 `!.` on `result.data`
- `src/session/orchestrators/SessionTimer.ts` — 4 `!.` on `orch.timerEngine` and `orch.session`
- `src/features/focus-identity/session-factors.ts` — 2 `!.` on array access
- `src/features/focus-identity/focus-identity-monthly-report.ts` — 2 `!.` on array access
- `src/features/session-completion/post-session-story-view-model.ts` — 5 `!.` on `input.personalBest`

**FIX:**
```typescript
// WRONG
return this.active!.getItem(key);

// CORRECT
if (!this.active) throw new StorageError('Storage not initialized');
return this.active.getItem(key);
```

**Effort:** 2-4 hours
**Priority:** 🟡 MEDIUM (not crash-causing if invariants hold at runtime)

### 2.4 `Record<string, unknown>` Pervasive Usage

**100+ files** use `Record<string, unknown>` as a type escape hatch. This defeats TypeScript's strict mode.

**Key locations:**
- All home containers: `useQuery` results cast to `Record<string, unknown>`
- Event system: `EventChannels` extends `[key: string]: unknown`
- Navigation helpers: route params cast to `as object`
- Home controller stubs: `as unknown as UseQueryResult`
- Analytics service: event payloads as `Record<string, unknown>`
- Session service: `metadata?: Record<string, unknown>`

**FIX:** Define typed interfaces for each data boundary. Replace `Record<string, unknown>` with Zod-inferred types.

**Effort:** 8-16 hours
**Priority:** 🟡 MEDIUM (code smell, not runtime crash)

### 2.5 `as X` Casts Beyond Zod Boundaries

**Multiple unsafe casts** found in navigation helpers:
- `src/navigation/navigation-helpers.ts` — 6 functions cast `route as string` and `params as object`
- `src/navigation/openFeature.ts:75` — `navigation.navigate(targetRoute as string, targetParams as object)`

**FIX:** Use proper type narrowing instead of casts. Define explicit navigation type helpers.

**Effort:** 1 hour
**Priority:** 🟡 MEDIUM

---

## 3. SECURITY AUDIT

### 3.1 🔴 CRITICAL: Edge Function JWT Email Verification Bypass

**File:** `supabase/functions/_shared/auth.ts:94`
**Finding:** The local JWT verification path at line 94 treats EVERY valid JWT as email-verified:

```typescript
// LINE 94 — LOCAL PATH (fast, bypasses Supabase):
emailVerified: !isAnonymous,  // <-- WRONG: only checks is_anonymous, NOT email_confirmed_at
```

The remote fallback (line 132) CORRECTLY checks `email_confirmed_at`:

```typescript
// LINE 132 — REMOTE PATH (correct):
if (!rawUser.email_confirmed_at) {
  return { ok: false, response: jsonResponse({ error: 'Email not verified' }, 403, request) };
}
```

**Impact:** If Supabase issues a JWT before email confirmation, edge functions using the local JWT path will accept unverified accounts. Any edge function that has `SUPABASE_JWT_SECRET` set will use the fast path and skip email verification.

**Fix Options:**
1. **(Recommended)** Always use the remote `/auth/v1/user` path for functions that require verified email. Remove `SUPABASE_JWT_SECRET` env var from those functions.
2. **(Alternative)** Add `email_confirmed_at` parsing to the local JWT verification (may not be present in Supabase JWT claims).
3. **(Defense-in-depth)** Add explicit email verification check in each sensitive endpoint.

**Effort:** 30 min
**Priority:** 🔴 CRITICAL — P0 stop-ship blocker

### 3.2 🔴 CRITICAL: Economy RPCs Unauditable

**Files:**
- `src/features/economy/repository.ts:55` — `atomic_spend_currency`
- `src/features/economy/repository.ts:75` — `grant_currency`
- `src/features/economy/repository.ts:95` — `atomic_add_currency`

**Finding:** Client code calls these RPCs directly, but NO matching migration files were found in `supabase/migrations/` that define them. If these RPCs exist in production but aren't versioned, they are unauditable. If they don't exist, economy flows fail at runtime.

**Critical questions:**
- Do these RPCs enforce `auth.uid() = p_user_id`?
- Can users mint/spend currency for arbitrary accounts?
- Are allowed sources/sinks constrained?

**Fix:**
1. Find or create migration files for these RPCs
2. Enforce `auth.uid() = p_user_id` inside each function
3. Constrain allowed sources/sinks
4. Revoke execute from `anon` role
5. Add comprehensive tests

**Effort:** 4 hours
**Priority:** 🔴 CRITICAL — P0 stop-ship blocker

### 3.3 🔴 HIGH: Sentry Replay Privacy

**File:** `src/config/sentry.ts`

**Status:** Now properly hardened after recent fix:
- `maskAllText: true` ✅
- `maskAllImages: true` ✅
- `sendDefaultPii: false` ✅

**Remaining concern:** Verify replay masking works correctly on coach/completion/study screens. Test replay payloads to confirm no sensitive data leaks.

**Effort:** 1 hour (testing)
**Priority:** 🔴 HIGH

### 3.4 🔴 HIGH: npm Audit Vulnerabilities

**43 advisories** reported by `npm audit`:
- **1 HIGH:** `form-data` CRLF injection (GHSA-hmw2-7cc7-3qxx)
- **41 MODERATE:** Various dev/tooling chains
- **1 LOW**

**Fix:** Run `npm audit fix` and verify no breaking changes. For unfixable advisories, document risk acceptance.

**Effort:** 30 min
**Priority:** 🔴 HIGH

### 3.5 🟡 MEDIUM: Expired TLS Certificate Pins

**File:** `app.json`

The certificate pinning configuration has verified pins dated:
- Supabase: verified 2026-06-05
- RevenueCat: verified 2026-06-09
- Sentry: verified 2026-06-09

**Fix:** Re-verify all pins before release against live cert chains. Any cert rotation between verification and release will brick the app.

**Effort:** 30 min
**Priority:** 🔴 HIGH (pre-launch gate)

### 3.6 🟡 MEDIUM: Analytics Export Signed URL TTL

**File:** `src/features/analytics/repository/storage-upload.ts:63`

Signed URLs valid for **7 days** — potentially too long for user-sensitive export data.

**Fix:** Shorten TTL to 1 hour or 24 hours unless product explicitly needs week-long links.

**Effort:** 5 min
**Priority:** 🟡 MEDIUM

### 3.7 🟡 MEDIUM: Content Study Prompt Injection Surface

**Files:**
- `supabase/functions/content-study/handlers.ts:20`
- `supabase/functions/content-study/extractors.ts:118`

User-controlled title/content flows directly into LLM prompts and generated study artifacts. Good prompt-injection wording and size caps exist, but risk remains.

**Fix:** Keep strict schema validation, provenance labeling, and NEVER let generated output trigger actions without user confirmation.

**Effort:** Already partially mitigated. Monitor post-launch.
**Priority:** 🟡 MEDIUM

### 3.8 ✅ GOOD: Security Wins

- **Supabase client uses SecureStorage** adapter — `src/config/supabase.ts:23`
- **`detectSessionInUrl: false`** — prevents token leakage in URL
- **Certificate pinning** configured for all 3 external services
- **App Privacy manifest** complete with NSPrivacyAccessedAPITypes
- **Edge functions verify JWT** before service-role Supabase access
- **Session completion** forces `p_user_id = auth.user.id`, rate-limits, and clamps scores
- **Migrations** add idempotency keys and ownership checks
- **CORS** restricted to `vex.app` and subdomains in production
- **RLS hardening** applied in recent migration sweep (June 2026)
- **No secrets** found in client code (all EXPO_PUBLIC_ prefixed)

---

## 4. ARCHITECTURE & ARCHITECTURE VIOLATIONS

### 4.1 🔴 CRITICAL: Three Parallel Mode Systems

**Files:**
- `src/session/modes.ts`
- `src/session/modes-v2.ts`
- `src/session/modes-enhanced.ts` (273 lines)

**Problem:** Three files claiming to define session modes. No reader can determine which is canonical. If `modes-enhanced.ts` is the truth, `modes.ts` and `modes-v2.ts` must be deleted.

**Same pattern across codebase:** 28+ files with `-enhanced`, `-v2`, `-legacy` naming in active `src/`.

**Code-Judo Fix:**
1. Identify canonical version of each duplicated file
2. Update all imports to point to canonical version
3. Delete all version-suffixed files
4. Run `npx tsc --noEmit` to verify

**Effort:** 2 hours
**Priority:** 🔴 CRITICAL

### 4.2 🔴 HIGH: ai-coach Directory Schizophrenia

**162 files** — 3× larger than any other feature, 5× larger than core session.

```text
src/features/ai-coach/service.ts          (root file)
src/features/ai-coach/service/            (singular directory)
src/features/ai-coach/services/           (PLURAL directory)
src/features/ai-coach/hooks.ts            (root file)
src/features/ai-coach/hooks/              (directory)
```

**Six locations for service/hook logic.** A reader cannot determine the correct home.

**Fix:**
1. Merge all service logic into a single `service.ts` or `service/` directory
2. Merge all hook logic into a single `hooks.ts` or `hooks/` directory
3. Delete redundant directories

**Effort:** 4 hours
**Priority:** 🔴 HIGH

### 4.3 🔴 HIGH: Home Container Query Duplication

**Files:**
- `src/screens/home/containers/EngagedHomeContainer.tsx` (149 lines)
- `src/screens/home/containers/PowerUserHomeContainer.tsx` (149 lines)
- `src/screens/home/containers/NewUserHomeContainer.tsx` (199 lines)
- `src/screens/home/containers/ActivatingHomeContainer.tsx` (105 lines)

**Problem:** Every container imports `useQuery` from `@tanstack/react-query` and calls `coachRepository` directly. Policy explicitly forbids this. The recommendation query pattern is duplicated with `as Record<string, unknown>` casts.

**Fix:**
1. Extract shared query logic into `src/features/ai-coach/hooks.ts`
2. Have containers consume the hook instead of using useQuery directly
3. Define typed view-models to replace `as Record<string, unknown>` casts

**Effort:** 3 hours
**Priority:** 🔴 HIGH

### 4.4 🔴 HIGH: Session Orchestration — Two Parallel Systems

**Files:**
- `src/session/orchestrators/SessionOrchestrator.ts` (271 lines)
- `src/session/services/SessionLifecycleService.ts` (398 lines)

**Problem:** Both manage session lifecycle in different paradigms. The orchestrator is class-based with engine injection. The lifecycle service is a separate class with its own config, event emission, and validation. Both CREATE sessions, manage state transitions, and emit events. These two creation paths WILL diverge.

**Fix:**
1. Pick one canonical session creation path
2. Merge or delete the other
3. All consumers should use the single canonical path

**Effort:** 4 hours
**Priority:** 🔴 HIGH

### 4.5 🟡 MEDIUM: SessionService — 255-line Thin Wrapper

**File:** `src/session/services/SessionService.ts` (255 lines)

**Problem:** Proxies orchestrator methods without adding meaningful abstraction. Holds `userId`, creates the orchestrator, and fronts every method with one-line delegations. This is a pass-through wrapper.

**Fix:** Merge SessionService into the orchestrator or make the orchestrator the sole public API. Delete the middleman.

**Effort:** 1 hour
**Priority:** 🟡 MEDIUM

### 4.6 🟡 MEDIUM: 36 Feature Folders Missing Mandatory Architecture Files

**Violations:**
| Feature | Missing Files |
|---------|--------------|
| `economy` | hooks, repository, schemas, events, analytics, types (6/7) |
| `themes` | hooks, repository, schemas, events, analytics, types (6/7) |
| `rewards` | hooks, repository, events, analytics, types (5/7) |
| `liveops-config` | service, hooks, repository, schemas, events, analytics, types (7/7) |
| `integration` | service, hooks, repository, schemas, events, types (6/7) |
| `feature-gate` | service, repository, schemas, events, types (5/7) |
| `session` | hooks, repository, events, analytics (4/7) |

**Fix:** Create thin placeholder files for missing mandatory files, even if they just re-export. Enforce architecture contract.

**Effort:** 2 hours
**Priority:** 🟡 MEDIUM

### 4.7 🟡 MEDIUM: navigation-helpers.ts — 303 Lines, 6 Cast-to-String Pattern Factories

**File:** `src/navigation/navigation-helpers.ts` (303 lines)

**Problem:** Every navigator function casts routes to string (`route as string`) and params to object (`params as object`), with comments claiming "Safe" due to generic constraints. The `navigateToRootScreen` function says: *"Safe: widen route to string to bypass React Navigation's overload resolution limitation"*.

This is not safe. If the generic constraint is wrong, the cast silently swallows the error.

**Fix:**
1. Use React Navigation's typed `navigate` with proper generic constraints
2. Remove all `as string` and `as object` casts
3. Decompose the 303-line file into smaller focused helpers

**Effort:** 2 hours
**Priority:** 🟡 MEDIUM

### 4.8 Supabase Queries Outside Repository

**~6 actual violations** found (many flagged results are in `repository.ts` files, which is correct):

**Files with Supabase queries not in canonical repository:**
- `src/features/challenges/session-challenges-integration.ts` — event subscriptions using supabase
- `src/features/settings/repository-sync.ts` — has `repository` in name but uses `from()` directly without Zod parsing
- `src/features/progression/repository.ts:32` — uses `.single()` without error handling

**FIX:** Ensure all Supabase queries route through canonical `repository.ts` files with Zod validation.

**Effort:** 2 hours
**Priority:** 🟡 MEDIUM

---

## 5. FILE SIZE & DECOMPOSITION

### 5.1 🔴 HIGH: 12 Files at Exactly 200 Lines — Truncation Candidates

These files have EXACTLY 200 lines, which strongly suggests they were truncated by an AI coding assistant with a 200-line output limit:

1. `src/shared/analytics/use-analytics-core.ts` — 200 lines
2. `src/session/integration/coach-handlers.ts` — 200 lines
3. `src/screens/settings/NotificationScheduleSection.tsx` — 200 lines
4. `src/persistence/SecureStorage.ts` — 200 lines
5. `src/features/progression/components/xp-progress-bar.tsx` — 200 lines
6. `src/features/notifications/repository/notifications.ts` — 200 lines
7. `src/features/ai-coach/schemas/enums.ts` — 200 lines
8. `src/features/ai-coach/repository/messages-crud.ts` — 200 lines
9. `src/features/ai-coach/intervention/PredictiveInterventionEngine-helpers.ts` — 200 lines
10. `src/features/ai-coach/components/DailyQuestCard.tsx` — 200 lines
11. `src/features/ai-coach/coach-state-types.ts` — 200 lines
12. `src/features/content-study/repository.ts` — (was 203, now split — verify completeness)

**FIX for each file:**
1. Open the file
2. Go to the last 10 lines
3. Verify the code is COMPLETE — no missing closing braces, no truncated expressions, no incomplete function bodies
4. If incomplete, complete the code
5. If complete, verify file is properly structured

**Effort:** 2 hours
**Priority:** 🔴 HIGH — incomplete files will cause runtime crashes

### 5.2 🟡 MEDIUM: 20+ Files Over 200 Lines

While the 200-line limit has been partially enforced, several files remain over limit:

| Lines | File | Area |
|-------|------|------|
| 296 | `src/screens/onboarding/OnboardingFlowScreen.tsx` | Onboarding |
| 273 | `src/animation/confetti/Particle.tsx` | Animation |
| 262 | `src/features/session-start/components/ModeSelector.tsx` | Session |
| 208 | `src/features/progression/components/xp-progress-bar.tsx` | Progression |
| 206 | `src/screens/home/containers/ActivatingHomeContainer.tsx` | Home |
| 199 | `src/screens/home/containers/NewUserHomeContainer.tsx` | Home |
| 199 | `src/features/ai-coach/coach-state-types.ts` | AI Coach |

**FIX:** Decompose each file into focused modules. Each should have a single responsibility.

**Effort:** 4 hours
**Priority:** 🟡 MEDIUM

### 5.3 🔴 HIGH: Edge Function Monoliths

| Function | Lines | Issue |
|----------|-------|-------|
| `supabase/functions/content-study/index.ts` | 882 | Monolith |
| `supabase/functions/ai/index.ts` | 500 | Monolith |
| `supabase/functions/ai-coach/index.ts` | 390 | Monolith |

Each function crams auth, validation, rate-limiting, provider calls, parsing, persistence, and response mapping into a single file. Edge function regressions have maximum blast-radius.

**Fix:**
Split each into:
- `auth.ts` — JWT verification
- `validation.ts` — Zod schema validation
- `routing.ts` — request routing/dispatch
- `handlers/` — one handler per endpoint
- `response.ts` — response formatting

**Effort:** 8 hours
**Priority:** 🔴 HIGH

---

## 6. BANNED PATTERN AUDIT

### 6.1 ✅ `@ts-ignore` / `@ts-nocheck` — PERFECT
**0 occurrences** in active source. ✅

### 6.2 ✅ `console.log` in Active Source — PERFECT
**0 occurrences** in active source. ✅
- 11 uses in `/scripts/` (acceptable — build scripts)
- 1 use in `supabase/functions/_shared/rate-limit.ts` (acceptable — edge function logging)

### 6.3 ✅ `Animated` from `react-native` — PERFECT
**0 occurrences** in active source. ✅
- 148+ files import `Animated` from `react-native-reanimated` correctly

### 6.4 ✅ `FlatList` — PERFECT
**0 occurrences** in active source. ✅
- Only found in `src/accessibility/checks-types.ts` as a check target

### 6.5 ✅ `StyleSheet.create` — PERFECT
**0 occurrences** in active source. ✅

### 6.6 ⚠️ `raw fetch()` — 1 Violation

**File:** `src/api/api-request-handler.ts:99`
**Code:** `let response = await fetch(url, fetchConfig);`

**Context:** This is in the API request handler, which is the project's API client wrapper. This may be intentional — the API client uses fetch internally.

**Verdict:** ALLOWED if this is the canonical API client's internal fetch. Verify this is the ONLY fetch in the app and it uses proper headers/auth.

**Effort:** 5 min (verify)
**Priority:** ⚠️ Verify only

### 6.7 ⚠️ `// TODO` / `// FIXME` / `// HACK`

**0 occurrences** found. ✅ — Previous audit showed 12+, now cleaned up.

### 6.8 `any` Type — 2 Violations (see Section 2.2)

---

## 7. NAVIGATION TYPE SAFETY

### 7.1 🔴 HIGH: 99+ String Literal Navigation Calls

**Every `navigation.navigate('SomeString')` bypasses type safety.** The typed routes exist in the project but aren't being used consistently.

**Files with the most occurrences:**
- `src/screens/home/hooks/useHomeNavigationActions.ts` — 5 calls
- `src/screens/home/hooks/useNewUserHomeModel.ts` — 4 calls
- `src/screens/home/hooks/useEngagedNavigation.ts` — 4 calls
- `src/screens/home/hooks/useActivatingNavigation.ts` — 2 calls
- `src/screens/home/hooks/power-user-home-navigation.ts` — 3 calls
- `src/screens/session/hooks/useStartSessionFlow.ts` — 1 call
- `src/screens/session/hooks/useActiveSessionHandlers.ts` — 1 call
- `src/screens/session/SessionHistoryScreen.tsx` — 2 calls
- `src/screens/settings/SettingsScreen.tsx` — 8 calls
- `src/screens/profile/ProfileScreen.tsx` — 6 calls
- `src/screens/progress/ProgressScreen.tsx` — 7 calls
- `src/navigation/notification-navigator.ts` — 6 calls
- `src/navigation/notification-routing-types.ts` — 2 calls
- `src/navigation/navigation-helpers.ts` — 4 calls
- Many screen components with 1-3 calls each

**FIX:**
```typescript
// WRONG
navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} });
navigation.navigate('AICoach');
navigation.navigate('Main', { screen: 'Progress' });

// CORRECT (use typed routes)
navigation.navigate(RootStackRoutes.SessionStack, { 
  screen: SessionStackRoutes.SessionSetup, 
  params: {} 
});
// OR use the typed navigation hooks from src/navigation/
```

**Effort:** 4 hours
**Priority:** 🔴 HIGH

---

## 8. PERFORMANCE AUDIT

### 8.1 Inline Styles — Widespread Issue

**2,297+ `style={{}}` occurrences** — each creates a new object on every render. These are tracked by the React Doctor and performance audit tools.

**Fix:** Extract to module-level constants for static styles. For dynamic styles, use `useMemo` or `useAnimatedStyle`.

**Effort:** 8-16 hours (progressive, not all need immediate fixing)
**Priority:** 🟡 MEDIUM

### 8.2 Dimensions.get Usage

**6 files use `Dimensions.get('window')`** — these don't update on orientation change:

1. `src/components/MobileOptimizedContainer.helpers.ts:7`
2. `src/theme/responsive.ts:4`
3. `src/session/components/ComboMeter.styles.ts:5`
4. `src/screens/session/components/session-consequence-types.ts:3`
5. `src/features/analytics/components/AnalyticsDashboard.styles.ts:6`
6. `src/features/home-spine/components/weekly-calendar-types.ts:3`

**Fix:** Replace with `useWindowDimensions()` hook from react-native for reactive dimensions.

**Effort:** 30 min
**Priority:** 🟡 MEDIUM

### 8.3 useEffect Count

**364 useEffect calls** across the codebase. Many are legitimate, but some are:
- Fake event handlers (should be callbacks)
- State synchronization (should be derived with useMemo)
- Chain state updates (causes cascading re-renders)

**React Doctor identified:**
- 67 `no-event-handler` warnings
- 29 `no-derived-state` warnings
- 9 `no-chain-state-updates` warnings

**Fix:** Audit each useEffect in critical paths (session, home, coach) and convert to useMemo/callbacks where appropriate.

**Effort:** 4-8 hours
**Priority:** 🟡 MEDIUM

### 8.4 FlashList estimatedItemSize

**Requirement:** All FlashList components must set `estimatedItemSize` to the actual measured item height.

**Fix:** Audit all FlashList usages and verify `estimatedItemSize` is set correctly.

**Effort:** 1 hour
**Priority:** 🟡 MEDIUM

### 8.5 Image Optimization

**Multiple components use raw `<Image>`** instead of `expo-image` (which provides caching, blurhash, and progressive loading).

**Fix:** Replace `<Image>` with `<Image>` from `expo-image` where available. `expo-image` is already in package.json.

**Effort:** 2 hours
**Priority:** 🟢 LOW

---

## 9. STATE MANAGEMENT AUDIT

### 9.1 State Architecture — Correctly Followed

| Layer | Tool | Usage | Status |
|-------|------|-------|--------|
| Server state | TanStack Query v5 | 88 files | ✅ Correct |
| Global client | Zustand | 14 files | ✅ Correct |
| Local UI | useState | Throughout | ✅ Correct |
| Persistent | MMKV | 163 files | ✅ Correct |
| Sensitive | SecureStorage | 17 files | ✅ Correct |

### 9.2 Onboarding Profile — Local-Only (Lost on Reinstall)

**Finding:** Onboarding profile (goals, persona, motivation style, focus duration) is stored ONLY in MMKV via Zustand. On app reinstall or device switch, this data is LOST.

**Impact:** Coach can't recall user preferences after reinstall. Personalization resets.

**Fix:** Add `onboarding_profiles` Supabase table and sync on completion and login.

**Effort:** 2 hours
**Priority:** 🔴 HIGH (v1 blocker — "VEX remembers you" claim)

### 9.3 Behavior Signals — Local-Only (14-Day Window)

**Finding:** Behavior signals stored ONLY in MMKV with 14-day window and 100-signal cap. Long-term trend analysis impossible after 2 weeks.

**Fix:** Add `behavior_signals` Supabase table, batch-sync daily with dedup. Deferred to post-launch.

**Effort:** 4 hours
**Priority:** 🟢 LOW (post-launch)

### 9.4 Companion Profile — Local-Only

**Finding:** Companion persona/preferences lost on reinstall.

**Fix:** Mirror to `companion_profiles` Supabase table.

**Effort:** 1 hour
**Priority:** 🟡 MEDIUM

### 9.5 Legacy StreakService / ProgressionService

**Files:**
- `src/features/streaks/service.ts`
- `src/features/progression/service.ts`

Return hardcoded `EMPTY_STATE` / `DEFAULT_STATE`. These appear unused (feature versions use real Supabase repos). Safe to remove in cleanup phase.

**Effort:** 15 min (verify and remove)
**Priority:** 🟢 LOW

---

## 10. ERROR HANDLING AUDIT

### 10.1 Async Without try/catch — Widespread

**198+ async functions** found across the codebase. Not all need try/catch, but many are missing error handling.

**Key areas needing audit:**
- `src/features/ai-coach/` — 29+ async functions in hooks, service, repository
- `src/session/` — session lifecycle, completion, recovery
- `src/screens/` — screen-level async operations
- `src/api/` — API client (already has error handling)
- `src/features/integration/` — economy-feed, social-feed

**Fix:** Every async function that interacts with external systems (Supabase, network, file system) must have:
- try/catch with typed error
- Sentry.captureException() for unexpected errors
- User-facing error state
- Retry available for network operations

**Effort:** 8-16 hours
**Priority:** 🟡 MEDIUM

### 10.2 Error Boundary Coverage

**Status:** `src/errors/ErrorBoundary.tsx` exists. `src/errors/ErrorFallback.tsx` exists.

**Verify:** All screen-level components wrapped in ErrorBoundary. Root component uses RootCrashBoundary.

**Effort:** 30 min (audit)
**Priority:** 🔴 HIGH

---

## 11. TESTING COVERAGE & QUALITY

### 11.1 Test Ratio

| Metric | Count |
|--------|-------|
| Source files | ~3,266 |
| Test files | ~1,440 |
| Test ratio | 44.1% |

**Status:** 44.1% test file ratio is good but not comprehensive.

### 11.2 Critical Test Gaps

**Known failing test files** (from verified-audit-status.md):
1. `src/features/monthly-report/__tests__/monthly-report-service.test.ts` — uses `e` outside catch scope
2. `src/accessibility/__tests__/AccessibilityEnhancer.test.ts` — 8 failing tests from API/contract mismatch
3. `src/features/economy/__tests__/economy-service.test.ts` — mock targets wrong module path

**Fix:**
1. Run `npx jest --config jest.config.js` to get current test status
2. Fix all failing tests
3. Target 80%+ line coverage for critical paths (auth, session, streaks, progression)

**Effort:** 4 hours
**Priority:** 🔴 HIGH

### 11.3 E2E Test Verification

**Status:** `e2e/` directory exists with:
- `e2e/onboarding.spec.ts`
- `e2e/flows/auth-flow.test.ts`
- `e2e/flows/complete-session-flow.test.ts`
- `e2e/flows/purchase-flow.test.ts`

**Fix:** Run E2E tests and verify they cover critical user flows.

**Effort:** 1 hour
**Priority:** 🔴 HIGH

---

## 12. ACCESSIBILITY AUDIT

### 12.1 Accessibility Label Coverage

**487 files use accessibility labels** — good coverage. ✅

### 12.2 Remaining Gaps

**Pressable components without accessibility labels** (from audit):
- `src/screens/plan/components/PlanProjectsView.tsx`
- `src/screens/plan/components/PlanStudyView.tsx`
- `src/screens/profile/components/MasteryCard.tsx`
- `src/screens/profile/components/ProfileGlassTabs.tsx`

**Fix:** Add `accessibilityLabel`, `accessibilityRole`, and `accessibilityHint` to all interactive elements.

**Effort:** 30 min
**Priority:** 🟡 MEDIUM

### 12.3 Touch Target Sizes

**Status:** `src/utils/touchTarget.ts` exists for minimum 44×44 point touch targets.

**Verify:** Audit all Pressable/TouchableOpacity components for minimum touch target size.

**Effort:** 1 hour
**Priority:** 🟡 MEDIUM

### 12.4 Reduced Motion

**Status:** `useReducedMotion()` from Reanimated is used in animation components.

**Verify:** All animations check `useReducedMotion()` before playing.

**Effort:** 30 min
**Priority:** 🟡 MEDIUM

---

## 13. DESIGN TOKEN COMPLIANCE

### 13.1 Theme System Usage

**483 files use theme system** — strong compliance. ✅
**246 files use `lightColors`** — correct token reference. ✅

### 13.2 Hardcoded Hex Colors in Glass/SVG Components

**Remaining after recent fixes:**

**Glass design system files with hardcoded hex colors:**
- `src/components/glass/FocusModeOrb.tsx` — inline hex in SVG gradients
- `src/components/glass/GlassProgressBar.tsx:26-28` — `start: '#DFA44A', mid: '#E8B85F', end: '#F1C575'`
- `src/components/glass/GlassSurface.tsx:41` — `topBarColor = '#42CFAE'`
- `src/components/glass/GlassTextureOverlay.tsx` — inline hex in SVG gradients
- `src/components/glass/LiquidGlassBackdrop.tsx` — inline hex in SVG gradients
- `src/components/glass/LiquidGlassSphere.tsx` — inline hex in SVG circles
- `src/components/glass/LiquidGlassSphere.defs.tsx` — inline hex in SVG gradients
- `src/components/glass/LiquidGlassObject.*.tsx` (6 files) — inline hex in SVG
- `src/components/glass/WaterRippleBackground.tsx` — inline hex in SVG strokes
- `src/shared/ui/liquid-glass/SessionGlyphs.tsx` — inline hex in SVG
- `src/shared/ui/liquid-glass/FocusCrystalAsset.tsx:23-24` — `accent = tone === 'amber' ? '#FF8B2A' : '#12BFA0'`

**Verdict:** Glass design system uses hex colors intrinsically for SVG gradients and visual effects. These are DESIGN-SYSTEM-level colors, not hardcoded theme violations. They should be defined as glass design tokens in `src/theme/tokens/glass.ts` rather than inline.

**Fix:** Extract all glass hex colors to `src/theme/tokens/glassColors.ts` and reference by name.

**Effort:** 2 hours
**Priority:** 🟢 LOW (visual consistency, not functional)

### 13.3 Hardcoded Colors in Adaptive Icon

**File:** `app.json` — `"backgroundColor": "#F8FFFC"` for Android adaptive icon
**File:** `app.json` — `"backgroundColor": "#F8FFFC"` for splash screen

**Fix:** These are build configuration values, not runtime theme tokens. Acceptable.

---

## 14. EVENT SYSTEM AUDIT

### 14.1 🔴 HIGH: Unbounded Event System

**File:** `src/events/types/index.ts:171`

**Problem:** `[key: string]: unknown` in EventChannels defeats TypeScript's exhaustiveness checking for the ENTIRE event system. Any string key with any payload is accepted. The 51-domain typing is effectively decorative.

**Additionally:** 51 event type files exist, including events for DEACTIVATED features:
- `emotion-retention.ts` (82 lines — feature folder doesn't exist)
- `neuroplasticity.ts` (40 lines — archived)
- `battle-pass.ts` (28 lines — deactivated)
- `productivity.ts` (162 lines — not active)
- `guild.ts`, `duel.ts`, `leaderboard.ts`, `cosmetics.ts`, `shop.ts` — all archived

**Fix:**
1. Remove `[key: string]: unknown` from EventChannels
2. Delete event type files for deactivated/archived features
3. Verify all consumers of typed events still compile

**Effort:** 2 hours
**Priority:** 🔴 HIGH

### 14.2 Event Files for Non-Existent Features

**Files to delete:**
- `src/events/types/emotion-retention.ts` (82 lines)
- `src/events/types/neuroplasticity.ts` (40 lines)
- `src/events/types/battle-pass.ts` (28 lines)
- `src/events/types/guild.ts`
- `src/events/types/duel.ts`
- `src/events/types/leaderboard.ts`
- `src/events/types/cosmetics.ts`
- `src/events/types/shop.ts`
- `src/events/types/productivity.ts` (162 lines — verify if still needed)

**Effort:** 30 min
**Priority:** 🟡 MEDIUM

---

## 15. FEATURE GATE & BLOAT FIREWALL

### 15.1 Liveops-Config: 45 Files for Feature Gates

The system that **decides** whether features are active is larger than many features themselves.

**Files:**
- `feature-availability.ts` (165 lines)
- `feature-access-config.ts` (163 lines)
- `feature-health-checks.ts` (159 lines)
- `feature-access.ts` (158 lines)
- `feature-health.ts` (143 lines)
- `final-release-classification.ts` (134 lines)
- `final-release-feature-map.ts` (129 lines)

Plus test files: `progressive-unlock-contract.test.ts` (501 lines), `runtime-inert.test.ts` (270 lines).

**Code-Judo Fix:** Replace with a single JSON config + a validator. The current system has more lines of feature-gate code than several feature implementations combined.

**Effort:** 4 hours
**Priority:** 🟡 MEDIUM

### 15.2 Bloat Firewall Verification

**From `docs/FINAL_RELEASE_BLOAT_FIREWALL.md`:**

Verify all 14 gates for ARCHIVED_OR_DEACTIVATED features:
1. Must not register routes ✅
2. Must not render Home cards ✅
3. Must not show notification filters ✅
4. Must not appear in session completion cards ✅
5. Must not appear in premium copy ✅
6. Must not appear in App Store metadata ✅
7. Must not run active queries (no useQuery, no supabase calls) — VERIFY
8. Must not subscribe to EventBus or Supabase realtime channels — VERIFY
9. Must not mutate session rewards — VERIFY
10. Must not affect loading state — VERIFY
11. Must not appear in onboarding ✅
12. Must not appear in active session UI — VERIFY
13. Must not appear in completion sequence — VERIFY
14. Must not appear in Coach recommendations — VERIFY

**Fix:** Run bloat firewall audit commands from the bloat firewall doc.

**Effort:** 1 hour
**Priority:** 🔴 HIGH

---

## 16. EDGE FUNCTIONS AUDIT

### 16.1 Critical Security Issue (see Section 3.1)

Edge function local JWT verification bypasses email verification. 🔴 CRITICAL

### 16.2 Monolith Decomposition (see Section 5.3)

Three edge functions need decomposition. 🔴 HIGH

### 16.3 Search Path Hardening Drift

**File:** `supabase/migrations/202606160002_security_advisor_sweep.sql:56`

The June 16 advisor sweep changed many functions from `set search_path = ''` (hardened) to `set search_path = public, pg_temp` (weaker). This reintroduces avoidable function/table resolution risk in privileged functions.

**Fix:** Keep empty search paths and schema-qualify all referenced objects.

**Effort:** 1 hour
**Priority:** 🔴 HIGH

### 16.4 Content Study Prompt Injection (see Section 3.7)

Mitigated but risk remains. Monitor post-launch.

---

## 17. BUILD & EXPO PIPELINE

### 17.1 Build Configuration

**File:** `eas.json`

**Profiles defined:**
- `development` — development client, internal distribution ✅
- `development-device` — extends development ✅
- `development-simulator` — iOS simulator ✅
- `preview` — internal distribution, staging ✅
- `production` — auto increment, large resource class ✅

### 17.2 Pre-Launch Build Verification

**Actions required:**
1. Run `eas build --platform ios --profile production` — verify build succeeds
2. Run `eas build --platform android --profile production` — verify build succeeds
3. Verify iOS bundle identifier: `com.jonathan.vex` ✅ (in app.json)
4. Verify Android package name: `com.jonathan.vex` ✅ (in app.json)
5. Verify app icons and splash screens exist in `assets/`
6. Verify push notification certificates are valid
7. Test on physical iOS device
8. Test on physical Android device

**Effort:** 2 hours (build time + testing)
**Priority:** 🔴 HIGH (pre-launch gate)

### 17.3 OTA Updates Configuration

**File:** `app.json`
- `updates.enabled: true` ✅
- `updates.checkAutomatically: "ON_LOAD"` ✅
- `updates.fallbackToCacheTimeout: 30000` ✅
- `runtimeVersion.policy: "appVersion"` ✅

### 17.4 Privacy URLs

**File:** `app.json`
- Privacy Policy: `https://pla4ma.github.io/VEX.RELEASE/privacy`
- Support URL: `https://pla4ma.github.io/VEX.RELEASE/support`
- Terms of Service: `https://pla4ma.github.io/VEX.RELEASE/terms`

**Verify:** All three URLs are live and accessible before submission.

**Effort:** 5 min
**Priority:** 🔴 HIGH (app review rejection risk)

### 17.5 App Privacy Manifest

**File:** `app.json`

Privacy manifest is complete with:
- NSPrivacyTracking: false ✅
- NSPrivacyCollectedDataTypes: 6 types declared ✅
- NSPrivacyAccessedAPITypes: 4 categories with reasons ✅

**Verify:** Data collection labels match Apple's requirements. No undeclared data collection.

**Effort:** 15 min
**Priority:** 🔴 HIGH

---

## 18. DEPENDENCY AUDIT

### 18.1 Runtime Dependencies (44)

| Package | Version | Status |
|---------|---------|--------|
| expo | ~56.0.11 | ✅ Current |
| react | 19.2.3 | ✅ Current |
| react-native | 0.85.3 | ✅ Current |
| @supabase/supabase-js | ^2.103.3 | ✅ Current |
| @tanstack/react-query | ^5.52.0 | ✅ Current |
| zustand | ^4.5.0 | ⚠️ Major v5 available |
| zod | ^3.22.4 | ✅ Current |
| react-native-reanimated | 4.3.1 | ✅ Current |
| @sentry/react-native | ^8.13.0 | ✅ Current |
| react-native-purchases | ^10.0.1 | ✅ Current |
| @shopify/flash-list | 2.0.2 | ✅ Current |
| @shopify/react-native-skia | ^2.6.4 | ⚠️ Heavy package |
| @rive-app/react-native | ^0.4.11 | ⚠️ Heavy package |
| immer | ^10.0.3 | ✅ Current |
| posthog-react-native | ^4.42.1 | ✅ Current |

### 18.2 Heavy Dependencies

- `@shopify/react-native-skia` — GPU rendering library, adds significant bundle size
- `@rive-app/react-native` — Rive animation runtime, adds significant bundle size

**Recommendation:** Verify tree-shaking is working. Consider lazy-loading if not used on first screen.

### 18.3 npm Audit Vulnerabilities

**43 advisories** (see Section 3.4). Run `npm audit fix` before release.

### 18.4 Version Upgrades to Consider

- `zustand` v4.5.0 → v5.x (major update available)

**Risk:** Zustand v5 may have breaking API changes. Test thoroughly before upgrading.

---

## 19. AI SLOP & DEAD CODE

### 19.1 12 Truncated Files (see Section 5.1)

12 files at exactly 200 lines need verification they are NOT truncated.

### 19.2 28+ Version-Suffixed Files

```
src/session/modes-enhanced.ts
src/features/ai-coach/integration-enhanced.ts
src/features/ai-coach/repository-enhanced.ts
src/features/ai-coach/hooks-enhanced.ts
src/features/progression/service-enhanced.ts (+ 8 sub-files)
src/features/streaks/schemas-enhanced.ts
...and 15+ more
```

**Fix:** Identify canonical versions, update imports, delete version-suffixed files.

### 19.3 170 Barrel Files

Barrel files (`index.ts`/`index.tsx`) can cause:
- Bundle size issues (importing everything)
- Circular dependency risks
- Slower TypeScript compilation

**Fix:** Audit barrel files. Remove unnecessary re-exports. Use direct imports where possible.

**Effort:** 2 hours
**Priority:** 🟢 LOW

### 19.4 Archive Directory: 780 Files

**Directory:** `archive/` — 780 files across 24 subdirectories

**Problem:** Archive files are included in grep, lint, and typecheck runs, polluting every tool. Many archive files are enormous (1,000+ lines).

**Fix:** Exclude archive from typecheck and lint. Add `archive/` to `.eslintignore` and verify tsconfig excludes it (currently does: `"exclude": ["archive"]`).

**Effort:** 15 min
**Priority:** 🟢 LOW

### 19.5 9,364 Total Exports

**Large API surface.** Many exports may be unused.

**Fix:** Audit exports. Remove unused exports. Use `export type` for type-only exports.

**Effort:** 2 hours
**Priority:** 🟢 LOW

---

## 20. HARDCODED VALUES & MAGIC NUMBERS

### 20.1 Magic Numbers

**1,184+ magic numbers** (1000, 60000, 86400000, 3600000) found across codebase.

**Fix:** Extract to named constants:
```typescript
const ONE_SECOND_MS = 1000;
const ONE_MINUTE_MS = 60_000;
const ONE_HOUR_MS = 3_600_000;
const ONE_DAY_MS = 86_400_000;
```

**Effort:** 4 hours (progressive)
**Priority:** 🟢 LOW

### 20.2 AntiCheat Engine Magic Numbers

**File:** `src/session/antiCheat/AntiCheatEngine.ts` (419 lines)

Hardcoded threshold values in a THRESHOLDS object. No extraction by concern, no strategy pattern for different validation types. The engine grows linearly with each new check.

**Fix:** Decompose into `TimeManipulationDetector`, `BehaviorAnomalyDetector`, `FocusQualityAnalyzer` — each <100 lines.

**Effort:** 2 hours
**Priority:** 🟡 MEDIUM

---

## 21. SUBSCRIPTION & MEMORY LEAK AUDIT

### 21.1 Supabase Realtime Subscriptions

**Status:** ✅ All `.subscribe()` calls in hooks/components have corresponding `unsubscribe()` in useEffect cleanup. The false alarm from the previous audit has been verified — all cleanup is in place.

**Key files verified:**
- `src/hooks/useRealtime.ts` — proper cleanup ✅
- `src/api/QueryProvider.tsx` — netInfo.subscribe with cleanup ✅
- `src/session/hooks/useSession.ts` — all 6 subscribe calls have cleanup ✅
- `src/features/streaks/hooks/useStreakRisk.ts` — both subscribe calls have cleanup ✅
- `src/features/settings/events.ts` — both subscribe calls have cleanup ✅

### 21.2 EventBus Subscriptions

**Status:** ✅ All EventBus subscriptions in React components/hooks have cleanup via `unsubscribe()` in useEffect return.

**Files with EventBus subscriptions that were flagged but actually have cleanup:**
- `src/features/integration/economy-feed.ts` — cleanup in useEffect return ✅
- `src/features/integration/social-feed.ts` — cleanup in useEffect return ✅
- `src/features/achievements/achievement-tracking-init.ts` — pushes unsubs to array ✅
- `src/features/companion/events.ts` — cleanup via returned unsub ✅

### 21.3 Memory Leak Risk: Large Map Growth

**Potential concern:** Some Zustand stores and EventBus listeners may accumulate entries without cleanup.

**Fix:** Audit Zustand stores and EventBus for unbounded growth. Add TTL or size limits where needed.

**Effort:** 1 hour
**Priority:** 🟡 MEDIUM

---

## 22. SUPABASE RLS & MIGRATION AUDIT

### 22.1 Recent RLS Hardening

**Migratons applied June 16, 2026:**
- `202606160001_auth_session_policy_hardening.sql` ✅
- `202606160002_security_advisor_sweep.sql` — ⚠️ regression (see Section 16.3)
- `202606160003_rpc_and_orphan_rls_hardening.sql` ✅
- `202606160004_policy_guard_and_public_execute_revoke.sql` ✅
- `202606160005_revoke_authenticated_definer_rpc.sql` ✅
- `202606160006_cover_unindexed_foreign_keys.sql` ✅
- `202606160007_reduce_permissive_policy_overlap.sql` ✅
- `202606160008_cleanup_fk_indexes.sql` ✅
- `202606160009_optimize_auth_rls_initplan.sql` ✅
- `202606160010_optimize_rate_limit_rls.sql` ✅

### 22.2 Search Path Hardening Regression

**File:** `supabase/migrations/202606160002_security_advisor_sweep.sql:56`

Changed functions from `set search_path = ''` to `set search_path = public, pg_temp` — WEAKER.

**Fix:** `202606160011_revert_search_path_hardening.sql` was created but may not have been applied. Verify and apply if needed.

### 22.3 Economy RPCs Undefined in Migrations (see Section 3.2)

`grant_currency`, `atomic_spend_currency`, `atomic_add_currency` called from client but no migration defines them.

### 22.4 Unindexed Foreign Keys

**File:** `202606160006_cover_unindexed_foreign_keys.sql` — applied ✅

### 22.5 Missing `onboarding_profiles` Table

**No migration exists for `onboarding_profiles`.** This is needed for onboarding profile persistence (see Section 9.2).

**Fix:** Create migration with:
- `user_id` (FK to auth.users)
- `profile_data` (JSONB — Zod-validated)
- `created_at`, `updated_at`
- RLS policy: user can only access own profile

**Effort:** 30 min
**Priority:** 🔴 HIGH

---

## 23. 2026 PRODUCTION BEST PRACTICES

### 23.1 Security Hardening (from 2026 research)

| Practice | Status | Action |
|----------|--------|--------|
| Secrets in server-side only | ✅ | All keys use EXPO_PUBLIC_ prefix |
| Platform-native secure storage | ✅ | expo-secure-store + SecureStorage |
| HTTPS enforced | ✅ | Via certificate pinning plugin |
| PKCE for OAuth | ⚠️ | Verify PKCE is explicitly enabled |
| Input validation | ✅ | Zod schemas throughout |
| Dependency monitoring | ⚠️ | Run `npm audit fix` |
| ProGuard/R8 (Android) | ⚠️ | Verify in eas build config |
| Strip symbols (iOS) | ⚠️ | Verify in eas build config |
| Root/jailbreak detection | ❌ | Not implemented |
| Screenshot obfuscation | ✅ | Via Sentry replay masking |

### 23.2 App Store Submission Readiness

| Requirement | Status | Action |
|-------------|--------|--------|
| Privacy policy URL live | ⚠️ | Verify URL is accessible |
| Account deletion flow | ⚠️ | Verify `delete_current_user` RPC works end-to-end |
| Demo credentials | ❌ | Provide in submission notes |
| Accurate screenshots | ⚠️ | Verify screenshots match current UI |
| In-app purchases use store billing | ✅ | RevenueCat configured |
| No external payment links | ⚠️ | Verify no web payment links |
| Permissions with context | ⚠️ | Verify in-app context before system prompt |
| AI feature disclosure | ⚠️ | Disclose AI coach in app description |

### 23.3 React Native 2026-Specific Checks

| Check | Status |
|-------|--------|
| New Architecture enabled | ✅ (newArchEnabled: true) |
| Hermes engine (Android) | ✅ (default in Expo SDK 56) |
| Flipper disabled for production | ✅ (removed in SDK 56) |
| Expo SDK 56 | ✅ |
| React 19.2.3 | ✅ |
| TypeScript 6.0.3 | ✅ |

---

## 24. RELEASE PHASE — CRITICAL BLOCKERS

**These MUST be fixed before release. No exceptions. P0 stop-ship.**

### BLOCKER-1: Edge Function JWT Email Verification Bypass
- **File:** `supabase/functions/_shared/auth.ts:94`
- **Fix:** Always use remote `/auth/v1/user` for email-verified functions, or add explicit email verification check
- **Effort:** 30 min
- **Verification:** Test with unverified email account — must be rejected

### BLOCKER-2: Economy RPCs Unauditable
- **Files:** `src/features/economy/repository.ts:55,75,95`
- **Fix:** Find/create migrations, enforce `auth.uid() = p_user_id`, constrain sources/sinks, revoke anon execute
- **Effort:** 4 hours
- **Verification:** Test that user A cannot mint/spend currency for user B

### BLOCKER-3: Search Path Hardening Regression
- **File:** `supabase/migrations/202606160002_security_advisor_sweep.sql:56`
- **Fix:** Revert to `set search_path = ''` on SECURITY DEFINER functions
- **Effort:** 1 hour
- **Verification:** Run Supabase security advisor — no search path warnings

### BLOCKER-4: 12 Truncated Files Verification
- **12 files at exactly 200 lines**
- **Fix:** Verify each file is complete (no missing closing braces, no truncated expressions)
- **Effort:** 2 hours
- **Verification:** Each file must pass visual review of last 20 lines + compile without errors

### BLOCKER-5: Economy RPC Migration Files
- **Missing:** Migration files for `grant_currency`, `atomic_spend_currency`, `atomic_add_currency`
- **Fix:** Create migration with proper RLS enforcement
- **Effort:** 2 hours
- **Verification:** RPCs appear in Supabase dashboard with correct permissions

### BLOCKER-6: npm Audit Vulnerabilities
- **43 advisories (1 HIGH)**
- **Fix:** Run `npm audit fix`, test for breaking changes
- **Effort:** 30 min
- **Verification:** `npm audit` shows 0 HIGH/CRITICAL

### BLOCKER-7: Onboarding Profile Lost on Reinstall
- **Impact:** "VEX remembers you" claim is false
- **Fix:** Create `onboarding_profiles` table, sync on completion
- **Effort:** 2 hours
- **Verification:** Reinstall app and verify onboarding profile is restored on login

---

## 25. RELEASE PHASE — HIGH PRIORITY

**These should be fixed before release. P1 strong recommendation.**

### HIGH-1: 99+ String Literal Navigation
- **99+ `navigation.navigate('X')` calls**
- **Fix:** Replace with typed routes
- **Effort:** 4 hours
- **Verification:** No string literals in `navigation.navigate()` calls (grep check)

### HIGH-2: 2 `any` Types + 2 `as any` Casts
- **Files:** `useOnboardingFlow.ts`, `NotificationBadge.tsx`
- **Fix:** Replace with proper types
- **Effort:** 15 min

### HIGH-3: Error Boundary Coverage Audit
- **Verify all screen-level components wrapped in ErrorBoundary**
- **Effort:** 30 min

### HIGH-4: Test Suite Verification
- **Run `npx jest` and fix all failing tests**
- **Effort:** 4 hours
- **Verification:** All tests pass

### HIGH-5: Bloat Firewall Audit
- **Verify all 14 gates for archived features**
- **Effort:** 1 hour

### HIGH-6: Build Verification
- **Run `eas build --platform all --profile production`**
- **Effort:** 2 hours
- **Verification:** Build succeeds for both platforms

### HIGH-7: Privacy URL Verification
- **Verify privacy policy, support, terms URLs are live**
- **Effort:** 5 min

### HIGH-8: 28+ Version-Suffixed Files
- **Delete -enhanced, -v2, -legacy files; keep canonical versions**
- **Effort:** 2 hours
- **Verification:** `npx tsc --noEmit` still passes

### HIGH-9: 3 Edge Function Monoliths
- **Decompose content-study (882 lines), ai (500 lines), ai-coach (390 lines)**
- **Effort:** 8 hours
- **Verification:** Edge functions deploy and work correctly

### HIGH-10: Sentry Replay Privacy Test
- **Test replay payloads for sensitive data leakage**
- **Effort:** 1 hour

---

## 26. RELEASE PHASE — MEDIUM PRIORITY

**P2 — fix soon after release if not possible pre-launch.**

### MEDIUM-1: `[key: string]: unknown` in EventChannels
- **File:** `src/events/types/index.ts:171`
- **Effort:** 2 hours

### MEDIUM-2: Event Type Files for Non-Existent Features
- **Delete event types for archived features**
- **Effort:** 30 min

### MEDIUM-3: `Record<string, unknown>` Replacements
- **100+ files with cast-heavy typing**
- **Effort:** 8 hours

### MEDIUM-4: 364 useEffect Optimization
- **Audit for fake event handlers, derived state, chain updates**
- **Effort:** 4 hours

### MEDIUM-5: Dimensions.get Replacement
- **6 files with non-reactive dimensions**
- **Effort:** 30 min

### MEDIUM-6: Event System Cleanup
- **Remove event types for archived features**
- **Effort:** 30 min

### MEDIUM-7: Liveops-Config Simplification
- **Replace 45-file system with single JSON config**
- **Effort:** 4 hours

### MEDIUM-8: ai-coach Directory Consolidation
- **Merge service/ + services/ + service.ts into single canonical location**
- **Effort:** 4 hours

### MEDIUM-9: Session Orchestration Deduplication
- **Pick one canonical session creation path**
- **Effort:** 4 hours

### MEDIUM-10: Home Container Query Extraction
- **Extract shared query logic to ai-coach/hooks.ts**
- **Effort:** 3 hours

---

## 27. RELEASE PHASE — LOW PRIORITY (POST-LAUNCH)

**P3 — can be done after launch.**

### LOW-1: Inline Styles Extraction
- **2,297+ `style={{}}` occurrences**
- **Effort:** 8-16 hours

### LOW-2: Magic Numbers Extraction
- **1,184+ magic numbers**
- **Effort:** 4 hours

### LOW-3: Barrel File Audit
- **170 barrel files**
- **Effort:** 2 hours

### LOW-4: Unused Export Removal
- **9,364 total exports**
- **Effort:** 2 hours

### LOW-5: Glass Design Token Extraction
- **Extract hardcoded hex colors from glass components to design tokens**
- **Effort:** 2 hours

### LOW-6: expo-image Migration
- **Replace raw `<Image>` with `expo-image`**
- **Effort:** 2 hours

### LOW-7: Legacy Service Removal
- **Remove unused StreakService/ProgressionService stubs**
- **Effort:** 15 min

### LOW-8: Archive Exclusion
- **Exclude archive from tooling pipelines**
- **Effort:** 15 min

### LOW-9: Behavior Signal Supabase Sync
- **Add `behavior_signals` table, batch-sync daily**
- **Effort:** 4 hours

### LOW-10: Zustand v5 Upgrade
- **Upgrade zustand from v4 to v5**
- **Effort:** 2 hours

---

## 28. PRE-LAUNCH CHECKLIST

### Code Quality
- [ ] `npx tsc --noEmit` passes (0 errors) ✅ Confirmed
- [ ] 2 `any` types fixed
- [ ] 2 `as any` casts fixed
- [ ] 1 `raw fetch()` verified or routed through API client
- [ ] 12 truncated files verified complete
- [ ] 28+ version-suffixed files deleted

### Security
- [ ] Edge function JWT email verification fixed
- [ ] Economy RPCs migrated and audited
- [ ] Search path hardening regression fixed
- [ ] npm audit: 0 HIGH/CRITICAL
- [ ] TLS certificate pins re-verified
- [ ] Demo credentials ready for app review

### Architecture
- [ ] 99+ string literal navigation replaced with typed routes
- [ ] 3 edge function monoliths decomposed
- [ ] `[key: string]: unknown` removed from EventChannels
- [ ] Onboarding profile Supabase table created
- [ ] 36 feature folders have mandatory files (or justified exceptions)

### Testing
- [ ] All tests pass (`npx jest`)
- [ ] E2E tests cover critical flows
- [ ] Tested on physical iOS device
- [ ] Tested on physical Android device
- [ ] Offline scenarios tested
- [ ] Push notifications tested

### Build & Deploy
- [ ] `eas build --platform ios --profile production` succeeds
- [ ] `eas build --platform android --profile production` succeeds
- [ ] Privacy policy URL live and accessible
- [ ] Support URL live and accessible
- [ ] Terms of Service URL live and accessible
- [ ] App icons and splash screens verified
- [ ] Push notification certificates valid

### App Review
- [ ] App Privacy manifest accurate
- [ ] Data Safety labels accurate (Google Play)
- [ ] Demo credentials in submission notes
- [ ] No external payment links
- [ ] AI features disclosed in description
- [ ] Screenshots match current UI

### Monitoring
- [ ] Sentry DSN configured for production
- [ ] Sentry replay privacy verified
- [ ] PostHog configured
- [ ] RevenueCat configured
- [ ] Crash rate < 1% target set

---

## 29. PHASED EXECUTION PLAN FOR HERMES

### Phase 0: Critical Security (1 day)

**Execute these first, in order:**

1. **Fix edge function JWT email verification bypass**
   - Read `supabase/functions/_shared/auth.ts`
   - Remove `SUPABASE_JWT_SECRET` from functions requiring verified email OR add explicit check
   - Test with unverified email

2. **Audit and fix economy RPCs**
   - Search for migration files for `grant_currency`, `atomic_spend_currency`, `atomic_add_currency`
   - If missing, create migrations with `auth.uid() = p_user_id` enforcement
   - Revoke execute from anon role

3. **Fix search path hardening regression**
   - Read `supabase/migrations/202606160002_security_advisor_sweep.sql`
   - Verify `202606160011_revert_search_path_hardening.sql` is applied
   - If not, apply it

4. **Run npm audit fix**
   - `npm audit fix`
   - Test app startup

### Phase 1: Type Safety & Banned Patterns (1 day)

5. **Fix 2 `any` types and 2 `as any` casts**
   - `src/screens/onboarding/hooks/useOnboardingFlow.ts:23` → typed navigation
   - `src/features/notifications/components/NotificationBadge.tsx:15` → typed stub

6. **Verify 12 truncated files**
   - Open each of the 12 files at exactly 200 lines
   - Read last 20 lines of each
   - Verify no missing closing braces, incomplete expressions

7. **Fix 1 raw fetch()**
   - `src/api/api-request-handler.ts:99` — verify this is the canonical API client's internal fetch
   - If not, route through API client

8. **Delete 28+ version-suffixed files**
   - Identify canonical version of each file
   - Update all imports
   - Delete version-suffixed duplicates
   - Run `npx tsc --noEmit`

### Phase 2: Navigation & Architecture (1 day)

9. **Replace 99+ string literal navigation**
   - Systematically replace `navigation.navigate('X')` with typed routes
   - Start with `src/navigation/navigation-helpers.ts` (high impact)
   - Then `src/screens/home/hooks/` files
   - Then remaining screens

10. **Create onboarding_profiles table**
    - Write Supabase migration
    - Add repository functions
    - Sync on login and onboarding completion

11. **Run bloat firewall audit**
    - Execute audit commands from `docs/FINAL_RELEASE_BLOAT_FIREWALL.md`
    - Verify all 14 gates for archived features

### Phase 3: Testing & Build (1 day)

12. **Run test suite and fix failures**
    - `npx jest --config jest.config.js`
    - Fix failing tests
    - Verify coverage on critical paths

13. **Run builds**
    - `eas build --platform ios --profile production`
    - `eas build --platform android --profile production`
    - Fix any build errors

14. **Verify app store requirements**
    - Check privacy URLs are live
    - Verify app privacy manifest
    - Prepare demo credentials
    - Verify screenshots

### Phase 4: Edge Functions (1 day)

15. **Decompose 3 edge function monoliths**
    - Split `content-study/index.ts` (882 lines)
    - Split `ai/index.ts` (500 lines)
    - Split `ai-coach/index.ts` (390 lines)
    - Each split into: auth.ts, validation.ts, routing.ts, handlers/, response.ts

### Phase 5: Post-Launch Cleanup (Ongoing)

16. **Medium priority items** (see Section 26)
17. **Low priority items** (see Section 27)

---

## 30. APPENDIX: COMPLETE FINDINGS TABLE

| # | Finding | Section | Priority | Effort |
|---|---------|---------|----------|--------|
| 1 | Edge function JWT email verification bypass | 3.1 | 🔴 CRITICAL | 30 min |
| 2 | Economy RPCs unauditable | 3.2 | 🔴 CRITICAL | 4 hrs |
| 3 | Search path hardening regression | 16.3 | 🔴 HIGH | 1 hr |
| 4 | 12 truncated files (200 lines) | 5.1 | 🔴 HIGH | 2 hrs |
| 5 | npm audit: 43 advisories | 3.4 | 🔴 HIGH | 30 min |
| 6 | TLS certificate pins re-verification | 3.5 | 🔴 HIGH | 30 min |
| 7 | Onboarding profile local-only | 9.2 | 🔴 HIGH | 2 hrs |
| 8 | Bloat firewall audit | 15.2 | 🔴 HIGH | 1 hr |
| 9 | Build verification | 17.2 | 🔴 HIGH | 2 hrs |
| 10 | Privacy URL verification | 17.4 | 🔴 HIGH | 5 min |
| 11 | 99+ string literal navigation | 7.1 | 🔴 HIGH | 4 hrs |
| 12 | 2 `any` types + 2 `as any` casts | 2.2 | 🔴 HIGH | 15 min |
| 13 | 3 edge function monoliths | 5.3 | 🔴 HIGH | 8 hrs |
| 14 | Error boundary coverage audit | 10.2 | 🔴 HIGH | 30 min |
| 15 | Test suite verification | 11.2 | 🔴 HIGH | 4 hrs |
| 16 | Sentry replay privacy test | 3.3 | 🔴 HIGH | 1 hr |
| 17 | Three parallel mode systems | 4.1 | 🔴 HIGH | 2 hrs |
| 18 | 28+ version-suffixed files | 19.2 | 🔴 HIGH | 2 hrs |
| 19 | Home container query duplication | 4.3 | 🔴 HIGH | 3 hrs |
| 20 | Event system `[key: string]: unknown` | 14.1 | 🔴 HIGH | 2 hrs |
| 21 | `[key: string]: unknown` in EventChannels | 14.1 | 🟡 MEDIUM | 2 hrs |
| 22 | Event types for non-existent features | 14.2 | 🟡 MEDIUM | 30 min |
| 23 | `Record<string, unknown>` replacements | 2.4 | 🟡 MEDIUM | 8 hrs |
| 24 | 36 feature folders missing files | 4.6 | 🟡 MEDIUM | 2 hrs |
| 25 | navigation-helpers.ts 303 lines | 4.7 | 🟡 MEDIUM | 2 hrs |
| 26 | ai-coach directory schizophrenia | 4.2 | 🟡 MEDIUM | 4 hrs |
| 27 | Session orchestration duplication | 4.4 | 🟡 MEDIUM | 4 hrs |
| 28 | SessionService thin wrapper | 4.5 | 🟡 MEDIUM | 1 hr |
| 29 | 364 useEffect optimization | 8.3 | 🟡 MEDIUM | 4 hrs |
| 30 | Dimensions.get replacement | 8.2 | 🟡 MEDIUM | 30 min |
| 31 | Liveops-config simplification | 15.1 | 🟡 MEDIUM | 4 hrs |
| 32 | Companion profile local-only | 9.4 | 🟡 MEDIUM | 1 hr |
| 33 | Content study prompt injection | 3.7 | 🟡 MEDIUM | Monitor |
| 34 | Analytics export signed URL TTL | 3.6 | 🟡 MEDIUM | 5 min |
| 35 | Accessibility label gaps | 12.2 | 🟡 MEDIUM | 30 min |
| 36 | Touch target size audit | 12.3 | 🟡 MEDIUM | 1 hr |
| 37 | Reduced motion verification | 12.4 | 🟡 MEDIUM | 30 min |
| 38 | FlashList estimatedItemSize audit | 8.4 | 🟡 MEDIUM | 1 hr |
| 39 | AntiCheat engine decomposition | 20.2 | 🟡 MEDIUM | 2 hrs |
| 40 | Memory leak: map growth | 21.3 | 🟡 MEDIUM | 1 hr |
| 41 | 55 unsafe null assertions | 2.3 | 🟡 MEDIUM | 2 hrs |
| 42 | Supabase queries outside repository | 4.8 | 🟡 MEDIUM | 2 hrs |
| 43 | 2,297 inline styles | 8.1 | 🟢 LOW | 8 hrs |
| 44 | 1,184 magic numbers | 20.1 | 🟢 LOW | 4 hrs |
| 45 | 170 barrel files audit | 19.3 | 🟢 LOW | 2 hrs |
| 46 | Unused export removal | 19.5 | 🟢 LOW | 2 hrs |
| 47 | Glass design token extraction | 13.2 | 🟢 LOW | 2 hrs |
| 48 | expo-image migration | 8.5 | 🟢 LOW | 2 hrs |
| 49 | Legacy service stub removal | 9.5 | 🟢 LOW | 15 min |
| 50 | Archive exclusion from tooling | 19.4 | 🟢 LOW | 15 min |
| 51 | Behavior signal Supabase sync | 9.3 | 🟢 LOW | 4 hrs |
| 52 | Zustand v5 upgrade | 18.4 | 🟢 LOW | 2 hrs |
| 53 | Image optimization (expo-image) | 8.5 | 🟢 LOW | 2 hrs |

---

**END OF VEXMAX — ULTIMATE PRE-RELEASE CODE AUDIT**

**Total findings: 53**
**Critical blockers: 2** (P0 — must fix before release)
**High priority: 18** (P1 — should fix before release)
**Medium priority: 19** (P2 — can fix after release)
**Low priority: 14** (P3 — post-launch cleanup)

**Estimated total effort for P0+P1: ~41 hours**
**Estimated total effort for all: ~120 hours**

**Recommended approach:** Execute Phase 0 (Critical Security, 5.5 hours) → Phase 1 (Type Safety, 3 hours) → Phase 2 (Navigation & Architecture, 9 hours) → Phase 3 (Testing & Build, 7 hours) → RELEASE → Phase 4 (Edge Functions, 8 hours) → Phase 5 (Ongoing cleanup)

**REMEMBER:** DO NOT revive archived features. DO NOT add new features. DO NOT change product decisions. This document is CODE QUALITY ONLY. Product decisions are handled by the human.
