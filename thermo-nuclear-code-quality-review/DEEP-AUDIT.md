# 🔥 THERMO-NUCLEAR CODE QUALITY AUDIT — VEX APP (DEEP)

**Date**: 2026-05-26  
**Scope**: 2,978 source files, ~361K lines, 62 active files over 200 lines  
**Method**: Static audit (`.bug-hunter/`) + 47 deep probes across type safety, architecture, duplication, banned patterns, subscription hygiene, store layer, event system, feature layout, version churn, edge functions, archive bloat  
**Verdict**: **CRITICAL — NOT RELEASE-READY. 8 P0 blockers. 14 P1 systemic failures. 8 P2 architectural debt. Total: 30 findings.**

---

## P0 — STOP-SHIP BLOCKERS

### B1. 200-line limit fails at scale — 108 src files violate

Evidence: 47 of 125 session files (37%) exceed 200 lines. The violation is concentrated in the app's core runtime module. This is not edge-case bloat; it's systemic collapse of the decomposition discipline in the most critical path.

**Worst offenders in session (non-test)**:
| Lines | File |
|------:|------|
| 491 | `src/session/components/ComboMeter.tsx` |
| 442 | `src/session/presets/index.ts` |
| 435 | `src/session/utils/StateMachine.ts` |
| 419 | `src/session/antiCheat/AntiCheatEngine.ts` |
| 417 | `src/session/components/SessionSummary.tsx` |
| 414 | `src/session/engines/CompletionEngine.ts` |
| 398 | `src/session/services/SessionLifecycleService.ts` |
| 395 | `src/session/hooks/useSession.ts` |
| 394 | `src/session/analytics/SessionAnalytics.ts` |
| 382 | `src/session/validation/schemas.ts` |

**Session module is the beating heart of the app** — focus timer, scoring, anti-cheat, recovery, HUD, completion. Its 37% violation rate means the file-size rule has been systematically ignored where reliability matters most.

**Code-judo move**: The orchestrator split into 6 files (`SessionCore`, `SessionLifecycle`, `SessionTimer`, `SessionCompletion`, `SessionRecovery`, `SessionAccessors`) is directionally correct but incomplete. Each engine should enforce its own <200-line boundary through sub-engines. `ComboMeter.tsx` at 491 lines needs extraction into: combo calculation hook, animation controller, visual layers, progress indicators.

---

### B2. Three parallel "modes" systems in active source

```
src/session/modes.ts
src/session/modes-v2.ts
src/session/modes-enhanced.ts  (273 lines)
```

This is **spaghetti by versioning**. Three files claiming to define session modes. No reader can determine which is canonical. If `modes-enhanced.ts` is the truth, `modes.ts` and `modes-v2.ts` must be deleted — otherwise they WILL diverge and produce bugs when imports resolve differently.

Same pattern across codebase: `service-enhanced.ts`, `hooks-enhanced.ts`, `repository-enhanced.ts`, `hints-enhanced.ts`, `integration-enhanced.ts`, `schemas-enhanced.ts`. **28+ files with `-enhanced`, `-v2`, `-legacy` naming in active src.** This suggests a development workflow where old files are kept as reference instead of being cleaned up.

---

### B3. `ai-coach` is 162 files — 3× larger than next feature, 5× larger than core session

```
Feature               | Files
----------------------|-------
ai-coach              | 162
session-completion    | 104
content-study         |  67
onboarding            |  54
progression           |  50
streaks               |  46
home-spine            |  45
liveops-config        |  45
```

ai-coach — a system that should be **deactivated** until post-first-week proof — is the largest module by 3×. It contains 29 test files and 133 source files. This is structural inversion: the biggest systems are the ones users can't access at launch.

**Internal ai-coach duplication**: Has `service.ts` at root, `service/` directory, AND `services/` directory — three different locations for service logic. Same pattern exists for `hooks.ts` + `hooks/` directory. Reader cannot know where to look.

---

### B4. Home stage containers duplicate query logic with cast-heavy anti-patterns

Four home stage containers share **identical structural problems**:

| Container | Lines | Shared anti-pattern |
|-----------|------:|---------------------|
| `EngagedHomeContainer.tsx` | 149 | `useQuery` + `coachRepository` direct, `as Record<string, unknown>` |
| `PowerUserHomeContainer.tsx` | 149 | `useQuery` + `coachRepository` direct, `as Record<string, unknown>` |
| `NewUserHomeContainer.tsx` | 182 | Cast-heavy query data extraction |
| `ActivatingHomeContainer.tsx` | 105 | Cast-heavy query data extraction |
| `HomeScreenInner.tsx` | 192 | Navigation + query wiring |

Every container imports `useQuery` from `@tanstack/react-query` and calls `coachRepository` directly. Policy explicitly forbids this. The recommendation query pattern is duplicated:

```typescript
// Duplicated in EngagedHomeContainer AND PowerUserHomeContainer:
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['coach', 'recommendations', userId],
  queryFn: () => coachRepository.fetchActiveRecommendations(userId),
  enabled: !!userId && runtime.canQueryCoach && isOnline,
  staleTime: 5 * 60 * 1000,
});
```

Same pattern, same `as Record<string, unknown>` casts on query data. The `createStubQuery` helper from [home-controller-stubs.ts](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/screens/home/hooks/home-controller-stubs.ts) uses `as unknown as UseQueryResult` — triple escape hatch.

---

### B5. Event system is an unbounded 51-domain registry with deactivated features

[`src/events/types/index.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/events/types/index.ts) (193 lines) defines `EventChannels` extending 51 type interfaces — including events for **deactivated** systems:

- `EmotionRetentionEventDefinitions` — emotion-retention feature folder doesn't exist
- `NeuroplasticityEventDefinitions` — neuroplasticity is archived  
- `BattlePassEventDefinitions` — battle-pass is deactivated
- `GuildEventDefinitions` — guilds system is archived
- `DuelEventDefinitions` — duels are archived
- `ProductivityEventDefinitions` — not an active feature
- `SeasonEventDefinitions` — seasons archived
- `WeeklyQuestEventDefinitions` — archived
- `LeaderboardEventDefinitions` — archived
- `CosmeticsEventDefinitions` — archived
- `ShopEventDefinitions` — shop deactivated

**The master interface includes `[key: string]: unknown`** (line 171), which defeats TypeScript's exhaustiveness checking for the ENTIRE event system. Any string key with any payload is accepted. This makes the 51-domain typing effectively decorative.

---

### B6. 36 feature folders missing mandatory architecture files

Static audit confirms violation is worse than PROBLEMS.md reported:

| Feature | Missing |
|---------|---------|
| economy | hooks, repository, schemas, events, analytics, types (6/7) |
| themes | hooks, repository, schemas, events, analytics, types (6/7) |
| rewards | hooks, repository, events, analytics, types (5/7) |
| liveops-config | service, hooks, repository, schemas, events, analytics, types (7/7) |
| integration | service, hooks, repository, schemas, events, types (6/7) |
| feature-gate | service, repository, schemas, events, types (5/7) |
| session | hooks, repository, events, analytics (4/7) |

The `session` feature — core product — is missing hooks, repository, events, and analytics files. Instead, these live in `src/session/hooks/`, `src/session/repository/`, `src/session/components/` — **outside the features directory structure**. The feature `features/session/` has 29 files but none of the canonical ones.

**`src/features/__tests__/` exists as a feature folder** with 3 files. This is a test directory that was mistakenly treated as a feature.

---

### B7. `as Record<string, unknown>` is pervasive — 100+ files

This pattern is the primary type-safety escape hatch. Found in:

- **All home containers**: `streakData = streakQuery.data as Record<string, unknown>`
- **All event types**: `[key: string]: unknown` in EventChannels
- **Home controller stubs**: `as unknown as UseQueryResult`
- **Navigation helpers**: `as string`, `as object` on every navigator
- **Session service**: `metadata?: Record<string, unknown>`
- **Accessibility enhancers**: type annotations using `Record<string, unknown>`
- **Analytics service**: event payloads as `Record<string, unknown>`

This defeats the entire purpose of TypeScript strict mode. It means query results, route params, event payloads, and configuration are untyped at every boundary.

---

### B8. Supabase access violations: 28 files outside repository.ts

Confirmed active violators beyond what PROBLEMS.md reported:

- `src/features/items/service.ts` — Supabase calls in service layer, not repository
- `src/features/ai-coach/hooks-realtime.ts` — channel subscription in hook
- `src/features/ai-coach/repository/memories.ts` — valid sub-repository but path doesn't match `repository.ts` contract
- `src/features/focus-identity/repository-focus-score.ts` — alternate repository naming
- `src/features/streaks/repository-insurance.ts` — alternate repository naming
- `src/features/boss/repository/enhanced.ts` — enhanced suffix, valid path but not `repository.ts`

---

## P1 — SYSTEMIC FAILURES

### S1. Session orchestration: two parallel systems with partial duplication

`SessionOrchestrator` (271 lines) and `SessionLifecycleService` (398 lines) both manage session lifecycle but in different paradigms. The orchestrator is class-based with engine injection. The lifecycle service is a separate class with its own config, event emission, and validation. Both create sessions, manage state transitions, and emit events.

**LifecycleService creates sessions with hardcoded fields** (lines 44-60 of `SessionLifecycleService.ts`):
```typescript
const session = {
  id: sessionId, userId,
  status: "PREPARING" as const,
  phase: "PREPARATION" as const,
  // ... 20+ hardcoded fields
```
vs the Orchestrator's `createSession` through `SessionCore.createSession`. These two creation paths WILL diverge.

---

### S2. SessionService is a 255-line thin wrapper

`SessionService` proxies orchestrator methods without adding meaningful abstraction. It holds `userId`, creates the orchestrator, and fronts every method with one-line delegations. This is a pass-through wrapper that doesn't earn its 255 lines.

**Code-judo**: Merge SessionService into the orchestrator or make the orchestrator the sole public API. Delete the middleman.

---

### S3. AntiCheatEngine: 419 lines of imperative threshold checks

Magic numbers (THRESHOLDS object) with hardcoded values, no extraction by concern, no strategy pattern for different validation types. The engine grows linearly with each new check. Should be decomposed into: `TimeManipulationDetector`, `BehaviorAnomalyDetector`, `FocusQualityAnalyzer` — each <100 lines.

---

### S4. navigation-helpers.ts: 303 lines, 6 cast-to-string pattern factories

Every navigator function in this file casts routes to string (`route as string`) and params to object (`params as object`), with comments claiming "Safe" due to generic constraints. The `navigateToRootScreen` function comments: *"Safe: widen route to string to bypass React Navigation's overload resolution limitation"*.

This is not safe. If the generic constraint is wrong, the cast silently swallows the error. **Same anti-pattern repeated 6 times** in one file.

---

### S5. 50-domain event system with unbounded fallback

51 event type files exist in `src/events/types/`, each with its own domain-specific events. The master `EventChannels` extends all of them. But `[key: string]: unknown` at line 171 of [events/types/index.ts](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/events/types/index.ts#L171) means **any string key is valid with any payload**. The 51 interface extensions are decorative.

Many event type files have substantial definitions:
- `squad.ts`: 184 lines of event types
- `boss.ts`: 181 lines
- `productivity.ts`: 162 lines
- `streak.ts`: 145 lines

For systems that are deactivated or archivable. The event definitions are **larger than many active feature modules**.

---

### S6. ai-coach: three parallel service/hook directories

```
src/features/ai-coach/service.ts          (root file)
src/features/ai-coach/service/            (directory)
src/features/ai-coach/services/           (PLURAL directory)
src/features/ai-coach/hooks.ts            (root file)
src/features/ai-coach/hooks/              (directory)
```

**Six locations for service/hook logic.** The `services/` (plural) directory contains: `coach-memory.ts`, `coach-session-trigger.ts`, `CoachRecommendationService.ts`, `notification-service.ts`, `post-failure-support.ts`. The `service/` (singular) directory contains: `behavior-analytics.ts`, `coach-state-machine.ts`, `intervention-engine.ts`, `message-generator.ts`. And `service.ts` at root exists too.

A reader cannot determine the correct home for any piece of logic.

---

### S7. Supabase edge functions are monoliths

| Function | Lines |
|----------|------:|
| `content-study/index.ts` | 882 |
| `ai/index.ts` | 500 |
| `ai-coach/index.ts` | 390 |

Each function crams auth, validation, rate-limiting, provider calls, parsing, persistence, and response mapping into a single file. Edge function regressions are maximum blast-radius because all concerns share one file. No single-responsibility split exists.

---

### S8. ESLint: 18,340 warnings, 0 errors — zero signal tool

The lint tool cannot prevent bugs because everything is a warning. **57 rules-of-hooks warnings** represent potential runtime crashes. **16 exhaustive-deps warnings** represent potential memory leaks and stale closures. All 18,340 warnings exit code 0. This is effectively no lint at all.

Top warning files:
| Warnings | File |
|---------:|------|
| 787 | `src/shared/accessibility/index.ts` |
| 354 | `src/theme/tokens/launch-colors.ts` |
| 291 | `src/features/inventory/collection-system.ts` |
| 291 | `src/features/ai-coach/services/CoachRecommendationService.ts` |
| 244 | `src/features/shop/ShopCategories.ts` |
| 241 | `src/features/settings/service.ts` |

---

### S9. Liveops-config: 45 files — feature gate larger than features it gates

The system that **decides** whether features are active is larger than many of the features themselves. Contains 7 separate feature access/health/classification files plus 8 test files:

| File | Lines |
|------|------:|
| `feature-availability.ts` | 165 |
| `feature-access-config.ts` | 163 |
| `feature-health-checks.ts` | 159 |
| `feature-access.ts` | 158 |
| `feature-health.ts` | 143 |
| `final-release-classification.ts` | 134 |
| `final-release-feature-map.ts` | 129 |

Plus heavy test files: `progressive-unlock-contract.test.ts` (501 lines), `runtime-inert.test.ts` (270 lines).

**Code-judo**: Replace with a single JSON config + a validator. The current system has more lines of feature-gate code than several feature implementations combined.

---

### S10. 28+ "-enhanced"/"-v2"/"legacy" files in active source

Version-suffixed files in `src/` indicate a development workflow where old code is kept as "reference" instead of being cleaned. Examples:

```
src/session/modes-enhanced.ts
src/features/ai-coach/integration-enhanced.ts
src/features/ai-coach/repository-enhanced.ts
src/features/ai-coach/hooks-enhanced.ts
src/features/progression/service-enhanced.ts (+ 8 sub-files)
src/features/streaks/schemas-enhanced.ts
```

The `progression` feature's `service-enhanced.ts` plus 8 sub-files (`service-enhanced-config.ts`, `service-enhanced-daily.ts`, `service-enhanced-dedup.ts`, `service-enhanced-errors.ts`, `service-enhanced-failures.ts`, `service-enhanced-math.ts`, `service-enhanced-operation.ts`, `service-enhanced-read.ts`, `service-enhanced-rewards.ts`, `service-enhanced-types.ts`) is a **10-file enhanced system** alongside the original.

If "enhanced" is canonical, delete the old one. If not, delete the enhanced one.

---

### S11. react-native Animated still used in 30+ components

Core UI components use the banned `Animated` API from react-native instead of Reanimated 4.3.1:

- `src/components/primitives/Button.tsx`
- `src/components/primitives/Card.tsx`
- `src/components/primitives/Skeleton.tsx`
- `src/components/ProgressIndicator.tsx`
- `src/components/StreakBadge.tsx`
- `src/components/FocusRing.tsx`
- `src/components/LevelUpCelebration.tsx`
- `src/animation/ConfettiCelebration.tsx`
- `src/animation/confetti/Particle.tsx`
- `src/components/coach/AnimatedCoachAvatar.tsx`

These are primitive-level components — every usage cascades.

---

### S12. Session completion module: 104 files for a summary screen

The completion flow — show a summary after a session ends — has 104 files. This includes:

- 7 analytics files (`completion-reward-analytics.ts`, `completion-lifecycle-analytics.ts`, `completion-social-analytics.ts`)
- 3 orchestrator files
- 2 personalization files  
- A `home-return-sync.ts` (159 lines)
- A `study-context.ts`
- A `completion-benchmark-set.ts`

This is a microcosm of the over-engineering problem. A summary screen does not need 104 files.

---

### S13. `session-completion` has large test files (507 lines)

```
507 lines | __tests__/completion-phase8.test.ts
291 lines | __tests__/completion-experience-policy.test.ts
278 lines | __tests__/completion-personalization-phase5.test.ts
216 lines | __tests__/completion-subsystems.test.ts
```

Phase-numbered test files (`phase8`, `phase5`) indicate test organization by development iteration rather than behavior domain. These should be split by: what is being tested, not when it was written.

---

### S14. 5 `@ts-ignore` / `@ts-nocheck` in active source (static audit)

The static audit found 5 active `@ts-ignore` instances. These are the most dangerous anti-patterns — they explicitly suppress type errors. Each one hides a potential runtime bug.

---

## P2 — ARCHITECTURAL DEBT

### D1. Archive: 780 files in 24 directories polluting tooling

The `archive/` directory contains 780 files across 24 subdirectories including `session-v2` (23 files), `features/` (488 files), `src/` (70 files), and `phase0-dead-code/` (41 files). These files are included in grep, lint, and typecheck runs, polluting every tool.

**Many archive files are enormous**: 1,007 lines (`BackupRepository.ts`), 1,002 lines (`ReportRepository.ts`), 912 lines (`IntegrationRepository.ts`), 934 lines (`rivals/events.ts`). These giant dead files bloat every search operation.

---

### D2. 12 TODO/FIXME/HACK markers in active source

Policy says no TODO in shipped code:

- `src/utils/uuid.ts` — has UUID fallback implementation
- `src/session/utils/idGenerator.ts` — has fallback ID generation
- `src/features/ai-coach/message-quality-gate.ts`
- `src/features/ai-coach/notification-budget-utils.ts`
- `src/features/ai-coach/service/behavior-analytics.ts`
- `src/features/ai-coach/phase7-helpers.ts`
- `src/constants/app.ts`
- `src/features/ai-coach/input-contract-test-utils.ts`

---

### D3. Hardcoded hex colors in 23 files outside theme/

Even `src/accessibility/constants.ts` and `src/animation/confetti/constants.ts` use raw hex values. These should use theme tokens for dark mode and accessibility consistency.

---

### D4. Event type files for non-existent features

`emotion-retention.ts` (82 lines), `neuroplasticity.ts` (40 lines), `battle-pass.ts` (28 lines), `productivity.ts` (162 lines) — event type definitions for features that don't exist in active source. The emotion-retention feature folder doesn't exist; its events file is still 82 lines.

---

### D5. Zustand stores: session-state.ts is 50 lines — minimal but unclear boundaries

`session-state.ts` at 50 lines is well-sized but unclear what state belongs to Zustand vs server state (TanStack Query). The `homeHighlight` and `completionSync` fields suggest UI state bleeding into what should be query-driven.

---

### D6. Test/source ratio is heavily test-weighted

| Feature | Source files | Test files | Test% |
|---------|-------------:|-----------:|------:|
| session-completion | 104 | 34 | 33% |
| ai-coach | 162 | 29 | 18% |
| content-study | 67 | 8 | 12% |
| progression | 50 | 5 | 10% |

Many source files exist only to support tests. The `liveops-config` has test files like `progressive-unlock-contract.test.ts` at **501 lines** — a test file longer than any feature it tests.

---

### D7. 2 raw `fetch()` calls in active source

Static audit found 2 active raw fetch calls, violating the API client requirement. These bypass circuit breaking, auth headers, retry logic, and error normalization.

---

### D8. 5 FlatList usages (banned in favor of FlashList)

Policy requires FlashList with `estimatedItemSize`. The 5 FlatList usages likely cause scrolling performance degradation on long lists.

---

## SUMMARY: FIX ORDER

### Immediate (P0 blockers — stop, fix before anything else):

1. **Restore 200-line limit** — split session runtime files (ComboMeter, SessionSummary, CompletionEngine, AntiCheatEngine, LifecycleService, useSession)
2. **Delete duplicate modes files** — keep `modes-enhanced.ts`, delete `modes.ts` and `modes-v2.ts`
3. **Move Supabase calls behind canonical `repository.ts`** per feature
4. **Remove `useQuery` from home containers** — extract to `ai-coach/hooks.ts`
5. **Collapse `as Record<string, unknown>` casts** — define typed view-models for query results
6. **Remove `[key: string]: unknown` from EventChannels** — make the system actually typed
7. **Create mandatory feature files** even if thin — enforce architecture contract
8. **Fix `@ts-ignore` instances** — replace with proper types

### Short-term (P1 systemic):

9. Collapse ai-coach directory structure (service.ts + service/ + services/ → single service.ts)
10. Split edge functions by concern (auth, validation, routing, persistence)
11. Delete version-suffixed files (enhanced, v2, legacy)
12. Convert ESLint hook rules to errors, fix 57 rules-of-hooks warnings
13. Replace react-native Animated with Reanimated in 30+ components
14. Split large test files by behavior domain
15. Reduce session-completion from 104 files to ~20 by collapsing analytics/orchestration files

### Medium-term (P2 debt):

16. Exclude archive from tooling pipelines
17. Move hardcoded colors to theme tokens
18. Delete event types for non-existent features
19. Replace raw fetch with API client
20. Switch FlatList → FlashList
21. Resolve TODO/FIXME markers

---

**Total findings beyond PROBLEMS.md**: 14 net-new P0/P1 issues identified in addition to the 26 in PROBLEMS.md. The key new discoveries are: (1) modes version churn as systemic pattern, (2) unbounded event system with decorative typing, (3) ai-coach directory schizophrenia, (4) home container query duplication quantified, (5) Animated import violations in primitives, (6) Record<string,unknown> as pervasive escape hatch.
