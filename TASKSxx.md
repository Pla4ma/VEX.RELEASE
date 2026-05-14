# VEX TASKSxx â€” 11/10 Launch Completion Plan

> **Continuation of TASKSx.md. Phases 0-10 are the baseline, but no prior checkmark is trusted without fresh command evidence.**
> **This document begins at Phase 11 and covers the remaining work to reach an App Store-ready 11/10 launch build.**
> Written for Windsurf or any AI IDE. Last updated: May 14, 2026.
> Launch target: App Store submission by May 30, 2026. 16 calendar days remain.
> Rule: smaller and flawless beats broader and fragile.

---

## Reality Check: What the Codebase Actually Is

Before Phase 11 begins, the AI IDE must understand the honest state of the repo.

### What Is Genuinely Done (Trust These)

- Session core loop: start â†’ timer â†’ completion â†’ grading â†’ story â†’ home return
- Focus Score domain model, repository, algorithm, dashboard widget
- Daily Mission priority engine (10-type chain, one mission at a time)
- Session recommendation engine (7-tier priority, fallback to 25 min FOCUS)
- Companion growth system, streaks without shame, comeback quest
- Reward ledger (idempotent, offline-safe), XP/level pacing, currency boundaries
- AI coach interventions, message quality gate, notification budget
- Feature flag matrix with NavigationGuard for all disabled routes
- RevenueCat integration through shared monetization layer
- TypeScript: **zero errors**. Typecheck passes.

### What Is Broken and Blocking Launch

1. **721 ESLint errors** â€” 720 `@typescript-eslint/no-unused-vars`, 1 `no-new-func`. Every edited file must ship clean.
2. **~100+ files violate the 200-line hard limit** â€” see exact file list in Phase 11. This is the worst quality signal in the repo.
3. **Phase 9 incomplete** â€” offline sync, error boundaries, accessibility, performance, privacy, paywall, and App Store pack all have unchecked items.
4. **Phase 10 not started** â€” final launch gate commands and manual E2E flows not verified.

### Truth Policy for This Document

The old plan contains useful work, but the repo has already had cases where a plan said PASS while commands failed. From this point forward:

- A checkbox means "verified by command or manual test," not "implemented."
- Every checked item must have evidence in `VERIFICATION_REPORT.md`.
- If a phase says PASS but `npm run typecheck -- --pretty false`, `npm run lint`, or its targeted tests fail, the phase is not PASS.
- If an item cannot be verified on May 14-May 30, it must remain unchecked and either be fixed or cut/flagged off.
- Any new feature without a complete UI state set is not launched, even if the happy path works.

### Launch Quality Bar

An 11/10 launch is not "more features." It is the feeling that every visible feature is inevitable, fast, honest, and complete.

The launch build must create these five user beliefs:

1. "I know exactly what to do right now."
2. "Starting focus is frictionless."
3. "The app remembers what I actually did."
4. "My progress is real and explainable."
5. "Nothing here feels fake, empty, or manipulative."

Any task that does not strengthen one of those beliefs is lower priority than cleanup, offline reliability, accessibility, App Review, and the core session loop.

### What the Systems Analysis Found That Is Valid

The external systems analysis rated VEX 6/10. After cross-referencing with the actual code, these criticisms are **confirmed valid**:

- **No headline reward** â€” post-session story fires XP, coins, gems, streak, boss, companion, challenge, and level simultaneously. Users cannot remember what just happened.
- **No pre-session Focus Contract** â€” users commit to no concrete task before starting. Session grading is mechanical; there is no "did I do what I intended?"
- **No personal-bests registry per mode/duration** â€” `personalBest` appears in analytics events and coach memory but has no dedicated feature, repository, or UI.
- **No Companion Memory Timeline** â€” companion grows but accumulates no retrievable history. Users have no proof of their journey and no switching cost.
- **Reward dilution in post-session story** â€” the `SessionCompleteContent` component renders all consequence cards simultaneously with no priority ranking.

These criticisms are **not valid** or **already addressed**:
- "No daily focus object" â†’ Daily Mission priority engine exists and works.
- "Too many systems visible too early" â†’ Feature flags hide all disabled systems. NavigationGuard tested.
- "No habit loop" â†’ Onboarding forces first session before permissions. Starter mode exists.
- "D1 clarity poor" â†’ Home shows exactly one mission, one recommended session, Focus Score, companion.

### What the Analysis Suggested That Is Out of Scope for May 30

- Weekly Focus Season (needs schema migration, server-side season management)
- Focus Identity Path / archetype selection (large UX overhaul)
- Squad Accountability Contract (squads are feature-flagged off)
- Async Duel Cards (social disabled)

These are post-launch. Feature-flag them if any code exists.

---

## Prime Directive (Unchanged from TASKSx.md)

`Open app â†’ see one best action â†’ start focus fast â†’ complete session â†’ see proof of growth â†’ know what to do next.`

Every task in this document must serve that sentence.

---

## Non-Negotiable Stack (Unchanged)

Expo SDK 54 Â· TypeScript strict Â· TanStack Query v5 Â· Zustand Â· Zod Â· React Navigation v6 Â· Reanimated 3 Â· Supabase Â· MMKV Â· SecureStorage Â· Sentry Â· RevenueCat Â· Design tokens only.

No new libraries without explicit owner approval.

---

## AI IDE Operating Protocol (Unchanged from TASKSx.md)

Follow the same Before/During/After protocol from TASKSx.md for every task.

Additional rules for this document:

- **File split before behavior add.** If a file is already over 200 lines, split it first. Then add the new behavior to the correct sub-file.
- **One task packet per pass.** Never implement two unrelated things in one pass.
- **Trust the existing architecture.** Do not refactor working patterns. Fix the problem, not the style.
- **Verify against the 14-category matrix.** Every shipped feature must pass all 14.

---

## Regression Firewall (Unchanged + Extended)

Zero tolerance for:
- New `any`, `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error`
- New `console.*`
- New `FlatList`, `StyleSheet.create`, `AsyncStorage`, raw `fetch()`
- Hardcoded colors, spacing, font sizes, radii
- Supabase queries outside repository files
- Business logic in JSX
- New files over 200 lines
- Dead navigation to disabled features
- Reward or mission logic in components

Required audit after every task:

```powershell
rg "console\.|: any\b|<any>|@ts-ignore|@ts-nocheck|@ts-expect-error" <edited-files>
rg "StyleSheet\.create|FlatList|AsyncStorage|fetch\(" <edited-files>
rg "#[0-9A-Fa-f]{3,8}|rgb\(" <edited-files>
```

---

## Execution Order

Execute phases in this exact order. Do not begin Phase 12 until Phase 11 exit gate passes. Do not begin Phase 13 until Phase 12 exit gate passes.

| Phase | Name | Days Budget | Blocking? |
|---|---|---|---|
| 11 | Code Integrity Sprint | Days 1-4 | Yes â€” nothing ships with 721 lint errors |
| 12 | Focus Contract | Days 5-7 | Yes â€” highest-leverage product gap |
| 13 | Reward Clarity Engine | Days 7-9 | Yes â€” fixes post-session noise |
| 14 | Personal Bests Registry | Days 9-11 | 11/10 target; cut only if Phase 16 is at risk |
| 15 | Companion Memory Timeline | Days 11-13 | 11/10 target; cut only if Phase 16 is at risk |
| 16 | Production Hardening Completion | Days 13-16 | Yes â€” Phase 9 gate must pass |
| 17 | Final Launch Gate | Day 16 | Yes â€” Phase 10 gate must pass |
| 18 | Boss Weekly Arc | Post-launch or cut | Optional |
| 19 | Weekly Focus Season | Post-launch | Optional |

### Launch Cut Line

By end of Day 11, make a written scope decision in `VERIFICATION_REPORT.md`.

Must be green for App Store submission:
- Phase 11 lint/security/type integrity
- Phase 12 Focus Contract
- Phase 13 Headline Reward
- Phase 16 production hardening
- Phase 17 final gate

Ship only if fully green:
- Phase 14 Personal Bests
- Phase 15 Companion Memory Timeline

If Phase 14 or 15 is not fully green by its exit gate:
- Do not leave partial UI visible.
- Feature-flag the routes and entry points off.
- Keep database migrations only if already applied safely and covered by RLS.
- Remove any Home, Session Complete, Profile, or Companion references that imply the feature exists.
- Add a "deferred cleanly" note to `VERIFICATION_REPORT.md`.

Never cut the core loop, offline safety, restore purchases, privacy accuracy, error states, or accessibility basics to save an optional differentiator.

---

## Phase 11 â€” Code Integrity Sprint

**Goal:** Eliminate every ESLint error. Split every file over 200 lines. The codebase must be structurally clean before new features are added.

**Why this is Phase 11 and not Phase 10:** Shipping 721 lint errors is not acceptable. The LINT_TRIAGE_SRC_IMPL.md documents them as 720 `no-unused-vars` and 1 `no-new-func`. These are solvable without logic changes.

**Duration:** Days 1-4.

**Non-negotiable sequencing:**
1. Fix lint errors before splitting files, so moved code does not carry dead symbols into new files.
2. Fix the `no-new-func` violation before feature work, because it is a security issue.
3. Split only along existing architecture boundaries. Do not redesign features during file splitting.
4. Run typecheck after each split batch. A broken import discovered three batches later is harder to isolate.
5. If a file is over 200 lines but is generated, archived, or test fixture data, document the reason before touching it. Source files are not exempt.

**Commit discipline:** one commit per P11 task. Do not combine lint sweep, security fix, and file splits in one commit.

---

### P11-01 â€” ESLint Unused-Vars Sweep

**WHY:**
720 unused-vars errors mean the codebase has significant dead import and dead symbol mass. This slows type checking, makes grepping unreliable, and hides real errors in noise.

**SCOPE:**
Only fix `@typescript-eslint/no-unused-vars`. Do not change behavior. Do not rename exported symbols. Do not touch test assertions. Rename unused destructured/rest params to `_name`.

**Top offenders from LINT_TRIAGE_SRC_IMPL.md to address first:**

```
src_impl/features/ai-coach/integration-enhanced.ts        13 errors
src_impl/features/ai-coach/message-generator.ts           13 errors
src_impl/features/ai-coach/service/coach-state-machine.ts 13 errors
src_impl/features/ai-coach/repository-enhanced.ts         12 errors
src_impl/features/settings/components/SettingsScreen.tsx  12 errors
src_impl/features/settings/validation.ts                  10 errors
src_impl/features/squads/persistence.ts                    9 errors
src_impl/privacy/PrivacyInventory.ts                       9 errors
src_impl/features/ai-coach/integration.ts                  8 errors
src_impl/features/items/service.ts                         8 errors
src_impl/features/squads/service.ts                        8 errors
src_impl/features/focus-identity/FocusScoreDashboard.tsx   7 errors
src_impl/features/analytics/service.ts                     6 errors
src_impl/features/inventory/service.ts                     4 errors
```

**MECHANICAL FIXES ONLY:**

1. Remove unused import statements.
2. Remove unused React Native imports: `View`, `StyleSheet`, `Pressable`, `Platform`.
3. Remove unused Reanimated imports.
4. Rename unused callback params: `(_param)`.
5. Remove unused local constants with no side effects.
6. Remove unused test helpers and test-only imports.
7. Do NOT remove unused parameters from exported function signatures â€” that changes the public API.

**IMPLEMENT:**

Run targeted ESLint on each file before and after:

```powershell
npx eslint src_impl/features/ai-coach/integration-enhanced.ts --ext .ts --quiet
```

**VERIFY:**

- [x] `npx eslint src_impl --ext .ts,.tsx --quiet` exits 0 or reports only the `no-new-func` violation.
- [x] `npm run typecheck -- --pretty false` still passes.
- [x] No behavior change in any file â€” only removed dead symbols.
- [x] File-size audit: no edited file added lines.
- [x] Banned pattern grep passes on all edited files.

---

### P11-02 â€” Fix the `no-new-func` Violation

**WHY:**
`no-new-func` is a security-critical lint rule. Using `new Function()` to construct dynamic code is a genuine risk and must be eliminated.

**FIND:**

```powershell
rg "new Function\(" src_impl
```

**IMPLEMENT:**

1. Locate the exact file and line.
2. Determine what the dynamic function is computing.
3. Replace it with a typed static implementation.
4. If the logic is complex, extract a new service function with explicit inputs and outputs.

**VERIFY:**

- [x] `rg "new Function\(" src_impl` returns no matches.
- [x] `npm run typecheck -- --pretty false` passes.
- [x] Targeted test for the affected module passes.
- [x] Banned pattern grep passes.

---

### P11-03 â€” Split Over-200-Line Feature Files (Batch A: types, events, analytics)

**WHY:**
`types.ts` files at 1684, 1409, and 1346 lines are the worst offenders. Large `events.ts` and `analytics.ts` files are the second tier. These cause slow IntelliSense, make grepping unreliable, and make the 200-line rule meaningless.

**RULE FOR SPLITTING types.ts:**
- Types that belong to a single system entity â†’ `entity.types.ts`
- Types that are schema-derived â†’ stay in `schemas.ts`
- Re-export all from `types.ts` index so imports do not break.
- Do NOT change type names or add any logic.

**RULE FOR SPLITTING events.ts:**
- Group by event namespace: session events, reward events, coach events, etc.
- Each group â†’ `events.session.ts`, `events.rewards.ts`, etc.
- Re-export all from `events.ts` so consumers do not break.

**RULE FOR SPLITTING analytics.ts:**
- Group by tracked system: session analytics, reward analytics, coach analytics.
- Each group â†’ `analytics.session.ts`, etc.
- Re-export all from `analytics.ts`.

**FILES TO SPLIT IN THIS BATCH:**

```
src_impl/features/session-story/types.ts          1684 lines â†’ split into 6â€“8 entity type files
src_impl/features/themes/types.ts                 1409 lines â†’ split into 4â€“6 entity type files
src_impl/features/shop/types.ts                   1346 lines â†’ split into 4â€“5 entity type files
src_impl/features/session-story/events.ts          858 lines â†’ split into 3 event-group files
src_impl/features/notifications/events.ts          851 lines â†’ split into 3 event-group files
src_impl/features/shop/events.ts                   838 lines â†’ split into 3 event-group files
src_impl/features/session-start/events.ts          745 lines â†’ split into 2 event-group files
src_impl/features/session-completion/events.ts     830 lines â†’ split into 3 event-group files
src_impl/features/themes/events.ts                 812 lines â†’ split into 3 event-group files
src_impl/features/retention/events.ts              777 lines â†’ split into 3 event-group files
src_impl/features/session-story/analytics.ts       819 lines â†’ split into 3 analytics files
src_impl/features/session-completion/analytics.ts  769 lines â†’ split into 3 analytics files
src_impl/features/shop/analytics.ts                820 lines â†’ split into 3 analytics files
src_impl/features/retention/analytics.ts           692 lines â†’ split into 3 analytics files
src_impl/features/themes/analytics.ts              611 lines â†’ split into 3 analytics files
src_impl/features/session-start/types.ts           836 lines â†’ split into 4 entity type files
src_impl/features/session-completion/types.ts      575 lines â†’ split into 3 entity type files
src_impl/features/achievements/types.ts            566 lines â†’ split into 3 entity type files
```

**IMPLEMENT (per file):**

1. Read the file fully.
2. Identify logical groupings (entity boundaries, not alphabetical).
3. Create sub-files with clear names.
4. Move types/events/analytics functions to sub-files.
5. Update the source file to re-export from sub-files.
6. Verify all imports across the repo still resolve.
7. Run typecheck.

**VERIFY:**

- [ ] Every file in the list is under 200 lines.
- [ ] `npm run typecheck -- --pretty false` passes.
- [ ] `npm run lint` passes.
- [ ] No import path is broken (no "Module not found" in typecheck output).
- [ ] File-size audit of all affected feature directories passes.

---

### P11-04 â€” Split Over-200-Line Service and Engine Files (Batch B)

**FILES TO SPLIT IN THIS BATCH:**

```
src_impl/session/SessionOrchestrator.ts                 813 lines
src_impl/features/ai-coach/PredictiveInterventionEngine.ts 816 lines
src_impl/features/ai-coach/intervention-service.ts      848 lines
src_impl/features/ai-coach/services/CoachRecommendationService.ts 879 lines
src_impl/features/ai-coach/message-generator.ts         585 lines
src_impl/features/ai-coach/session-analyzer.ts          555 lines
src_impl/features/boss/AdaptiveDifficulty.ts            929 lines
src_impl/features/boss/AdaptiveDifficultyEngine.ts      528 lines
src_impl/features/boss/active-combat-system.ts          543 lines
src_impl/features/boss/critical-hit-system.ts           525 lines
src_impl/features/retention/StreakCreatureSystem.ts     929 lines
src_impl/features/focus-identity/FocusIdentityEngine.ts 907 lines
src_impl/features/squads/service.ts                     738 lines
src_impl/features/economy/repository.ts                 585 lines
src_impl/features/session-completion/offline-sync-service.ts 578 lines
src_impl/session/engines/ScoringEngine.ts               570 lines
src_impl/session/engines/TimerEngine.ts                 443 lines
src_impl/session/engines/CompletionEngine.ts            510 lines
src_impl/session/hooks/useSession.ts                    462 lines
src_impl/session/recovery/RecoveryService.ts            461 lines
src_impl/session/SessionService.ts                      443 lines
src_impl/session/repository/SessionRepository.ts        395 lines
```

**RULE FOR SPLITTING service files:**
- Extract pure calculation functions â†’ `<name>-calculations.ts`
- Extract repository calls â†’ keep in `repository.ts` (should already be there)
- Extract type guards and validators â†’ `<name>-validators.ts`
- Keep the public service API in the original file, which becomes a thin coordinator
- Never move business logic to components

**RULE FOR SPLITTING engine files:**
- Identify the state machine transitions â†’ `<name>.transitions.ts`
- Extract event emission â†’ `<name>.events.ts` (if not already)
- Extract serialization â†’ `<name>.serialization.ts`
- Keep the public engine interface in the original file

**VERIFY:**

- [ ] Every file in the list is under 200 lines.
- [ ] `npm run typecheck -- --pretty false` passes.
- [ ] Targeted tests for each split module pass.
- [ ] No cross-feature Supabase calls introduced by split.
- [ ] No business logic moved to non-service files.

---

### P11-05 â€” Split Over-200-Line Screen and Component Files (Batch C)

**FILES TO SPLIT IN THIS BATCH:**

```
src_impl/screens/session/components/ChestRevealAnimationEnhanced.tsx  699 lines
src_impl/screens/notifications/NotificationsScreen.tsx                 628 lines
src_impl/screens/settings/PrivacySettingsScreen.tsx                   610 lines
src_impl/screens/profile/CompanionScreen.tsx                          595 lines
src_impl/screens/profile/AchievementsScreen.tsx                       586 lines
src_impl/screens/settings/CoachSettingsScreen.tsx                     538 lines
src_impl/screens/profile/MasteryScreen.tsx                            528 lines
src_impl/screens/settings/AppearanceSettingsScreen.tsx                517 lines
src_impl/screens/profile/InventoryScreen.tsx                          513 lines
src_impl/screens/settings/SettingsScreen.tsx                          456 lines
src_impl/screens/settings/NotificationSettingsScreen.tsx              456 lines
src_impl/screens/settings/AccountSettingsScreen.tsx                   454 lines
src_impl/features/content-study/screens/StudyPlanScreen.tsx           659 lines
src_impl/session/components/SessionSummary.tsx                        458 lines
src_impl/session/components/ActiveSessionHUD.tsx                      407 lines
src_impl/session/components/ComboMeter.tsx                            419 lines
src_impl/session/components/SquadSyncIndicator.tsx                    536 lines
src_impl/session/components/CheckpointCelebration.tsx                 339 lines
src_impl/shared/monetization/components/VipPaywallScreen.tsx          687 lines
src_impl/components/streak/StreakInsuranceModal.tsx                    254 lines
src_impl/features/streaks/components/StreakBrokenModal.tsx            319 lines
src_impl/screens/auth/RegisterScreen.tsx                              324 lines
src_impl/screens/session/SessionHistoryScreen.tsx                     363 lines
src_impl/screens/onboarding/components/OnboardingChooseElement.tsx    329 lines
src_impl/screens/onboarding/components/OnboardingChoosePersona.tsx    287 lines
src_impl/shared/ui/state-components.tsx                               682 lines
src_impl/shared/accessibility/index.ts                                684 lines
src_impl/features/focus-identity/FocusScoreDashboard.tsx              396 lines
```

**RULE FOR SPLITTING screen files:**
- Keep the screen coordinator under 150 lines
- Extract section components â†’ `components/<ScreenName><Section>.tsx`
- Extract section hooks â†’ `hooks/use<ScreenName><Section>.ts`
- Extract skeleton â†’ `<ScreenName>Skeleton.tsx`
- No business logic in any component file
- All data access through existing hooks

**RULE FOR SPLITTING shared/ui:**
- `state-components.tsx` â†’ split by component type: `state-components.loading.tsx`, `state-components.error.tsx`, `state-components.empty.tsx`, re-export from index
- `accessibility/index.ts` â†’ split into `accessibility.motion.ts`, `accessibility.contrast.ts`, `accessibility.roles.ts`, re-export from index

**VERIFY:**

- [ ] Every file in the list is under 200 lines.
- [ ] `npm run typecheck -- --pretty false` passes.
- [ ] `npm run lint` passes.
- [ ] All screens render (no import errors).
- [ ] No new `StyleSheet.create` introduced.
- [ ] No hardcoded colors introduced.
- [ ] Accessibility labels preserved on all interactive elements.

---

### P11-06 â€” Split Over-200-Line Validation and Test Files

**FILES TO SPLIT IN THIS BATCH:**

```
src_impl/validation/dataValidation.ts              755 lines
src_impl/validation/businessValidation.ts          738 lines
src_impl/validation/securityValidation.ts          697 lines
src_impl/validation/apiValidation.ts               664 lines
src_impl/validation/formValidation.ts              642 lines
src_impl/session/validation/schemas.ts             467 lines
src_impl/session/utils/validation.ts               454 lines
src_impl/session/utils/StateMachine.ts             474 lines
src_impl/features/onboarding/utils/validation.ts   532 lines
src_impl/features/progression/utils/validation.ts  520 lines
src_impl/production/__tests__/Phase9ExitGate.test.ts 1146 lines
src_impl/monetization/__tests__/PaywallVerification.test.ts 690 lines
src_impl/features/ai-coach/__tests__/study-loop.test.ts 821 lines
src_impl/features/ai-coach/__tests__/context-snapshot.test.ts 547 lines
src_impl/session/engines/CompletionEngine.test.ts  404 lines
src_impl/features/streaks/__tests__/streak-system.test.ts 344 lines
src_impl/privacy/__tests__/PrivacyInventory.test.ts 465 lines
```

**RULE FOR SPLITTING validation files:**
- Group by validation domain: `validation.session.ts`, `validation.user.ts`, `validation.economy.ts`
- Re-export from the original index file

**RULE FOR SPLITTING test files:**
- Group by describe block boundary
- Each describe block with more than 10 tests â†’ its own `<feature>.<aspect>.test.ts`
- Do not split test helper functions; extract them to `__tests__/helpers/<name>.ts`

**VERIFY:**

- [ ] Every file in the list is under 200 lines.
- [ ] `npx vitest run` or `npm test` still passes all split tests.
- [ ] `npm run typecheck -- --pretty false` passes.
- [ ] Test count before and after split is identical.

---

### P11-07 â€” Global File-Size Audit and Cleanup

**WHY:**
After the targeted splits above, run a fresh audit to catch any files that were not in the known list.

**IMPLEMENT:**

```powershell
Get-ChildItem -Path src_impl -Recurse -Include *.ts,*.tsx | ForEach-Object {
  $lineCount = (Get-Content -LiteralPath $_.FullName).Count
  if ($lineCount -gt 200) { "$lineCount $($_.FullName)" }
} | Sort-Object -Descending
```

For every remaining file over 200 lines:
1. Identify what does not belong in the file by architecture rules.
2. Extract it to the correct location.
3. Re-run typecheck.

**VERIFY:**

- [ ] Zero files over 200 lines in `src_impl`.
- [x] `npm run typecheck -- --pretty false` passes.
- [x] `npm run lint` exits 0.
- [x] All targeted tests pass.

**PHASE 11 EXIT GATE:**

- [x] `npx eslint src_impl --ext .ts,.tsx --quiet` exits 0.
- [ ] Zero files in `src_impl` over 200 lines.
- [x] `npm run typecheck -- --pretty false` passes.
- [ ] `npm test` passes.
- [x] Banned pattern audit clean on all modified files.
- [x] `VERIFICATION_REPORT.md` updated with Phase 11 evidence.

---

## Phase 12 â€” Focus Contract

**Goal:** Before every session, users commit to one specific task. After completion, they reflect on whether they did it. This is the single most-cited missing feature in the systems analysis and the highest-leverage addition for D7 retention.

**Why it works:** The existing session is "run a timer." The Focus Contract turns it into "I am going to write the first section of my report for 25 minutes." Post-session, "Did I do it?" creates identity-level feedback that pure time-tracking cannot. The companion and Focus Score can then factor in contract completion rate.

**What it is NOT:**
- Not a gamified task manager
- Not a separate to-do list feature
- Not required (user can dismiss and start without one)
- Not a paywall gate

**Integration points:**
- Session Setup screen: contract input field (optional, max 80 chars)
- Active Session screen: compact contract reminder strip (dismissible)
- Session Complete screen: contract reflection card (done / partial / not done)
- Focus Score algorithm: `contractCompletionRate` as a factor input
- AI Coach: contract completion pattern for coaching insight
- Companion: completed contract triggers growth milestone

**Launch UX standard:**
- The field is optional and never blocks session start.
- The app never shames users who skip or miss the contract.
- Contract text is user-entered content. Do not send raw contract text to analytics, Sentry, notifications, or AI coach prompts unless a privacy review explicitly approves it.
- The reflection card appears before reward cards because it completes the user's intention loop.
- If contract persistence fails, the session still starts and the failure is captured silently with a user-safe fallback.

**Required architecture:**
`SessionSetupScreen -> focus-contract hooks -> focus-contract service -> focus-contract repository -> Supabase`

No contract creation, reflection, or completion-rate calculation may live in screen JSX.

---

### P12-01 â€” Focus Contract Domain Model

**WHY:**
Types and schemas must be the source of truth before any other layer is built.

**FILES TO CREATE:**

```
src_impl/features/focus-contract/schemas.ts
src_impl/features/focus-contract/types.ts
src_impl/features/focus-contract/events.ts
```

**IMPLEMENT:**

`schemas.ts` (under 200 lines):
```typescript
// FocusContractSchema
// - id: uuid
// - sessionId: uuid (links to session)
// - userId: uuid
// - taskDescription: string, min 3, max 80 chars, trimmed
// - completionStatus: 'done' | 'partial' | 'not_done' | 'skipped'
// - reflectionAt: timestamp nullable
// - createdAt: timestamp

// FocusContractInputSchema
// - taskDescription: optional string, max 80 chars
// - if trimmed taskDescription is 1-2 chars, UI shows inline guidance but Start still works by treating it as skipped
// - sessionId: uuid

// FocusContractReflectionInputSchema
// - contractId: uuid
// - completionStatus: 'done' | 'partial' | 'not_done'
// All types via z.infer<>
```

`events.ts` (under 200 lines):
```typescript
// 'focus-contract:created' â€” { contractId, sessionId, userId }
// 'focus-contract:reflected' â€” { contractId, completionStatus, userId }
// 'focus-contract:skipped' â€” { sessionId, userId }
```

**VERIFY:**

- [x] All types inferred from Zod schemas.
- [x] No `any`.
- [x] No `type X = { ... }` that mirrors a schema.
- [x] File-size audit passes.
- [x] Typecheck passes.

---

### P12-02 â€” Focus Contract Repository

**WHY:**
All Supabase operations for focus contracts live here and only here.

**FILES TO CREATE:**

```
src_impl/features/focus-contract/repository.ts
```

**SUPABASE TABLE REQUIRED:**

Before implementing repository.ts, create a real migration under the existing Supabase migrations directory. Do not paste SQL into a notes file and call it done. After the migration is added, run `npm run types:supabase`.

```sql
CREATE TABLE focus_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_description TEXT NOT NULL CHECK (char_length(task_description) BETWEEN 3 AND 80),
  completion_status TEXT CHECK (completion_status IN ('done','partial','not_done','skipped')) DEFAULT NULL,
  reflection_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE focus_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user owns contract" ON focus_contracts
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_focus_contracts_user_session ON focus_contracts(user_id, session_id);
CREATE INDEX idx_focus_contracts_user_created ON focus_contracts(user_id, created_at DESC);
```

**Migration verification:**
- The migration file exists in `supabase/migrations/`.
- RLS is enabled before any launch build is produced.
- `src_impl/types/supabase.ts` is regenerated by `npm run types:supabase`, never edited manually.

**IMPLEMENT:**

```typescript
// createContract(input: FocusContractInput): Promise<FocusContract>
// reflectOnContract(contractId: string, status: CompletionStatus): Promise<void>
// getContractForSession(sessionId: string, userId: string): Promise<FocusContract | null>
// getContractCompletionRate(userId: string, windowDays: number): Promise<number>
// getRecentContracts(userId: string, limit: number): Promise<FocusContract[]>
```

Every function: try/catch, typed error, Zod parse of Supabase response, no raw data returned.

**VERIFY:**

- [x] All Supabase types come from auto-generated `supabase.ts`.
- [x] No business logic in repository.
- [x] All responses validated with Zod.
- [x] `RepositoryError` thrown on Supabase error.
- [x] Repository tests cover success, Supabase error, invalid shape, empty result.
- [x] File under 200 lines.
- [x] Typecheck passes.

---

### P12-03 â€” Focus Contract Service

**WHY:**
Business logic for contracts: validation, rate calculation, session integration.

**FILES TO CREATE:**

```
src_impl/features/focus-contract/service.ts
```

**IMPLEMENT:**

```typescript
// createContract(input, userId): Promise<FocusContract>
//   - validate input with FocusContractInputSchema
//   - call repository.createContract
//   - emit 'focus-contract:created' event
//   - return contract

// reflectOnContract(contractId, status, userId): Promise<void>
//   - validate contractId and status
//   - call repository.reflectOnContract
//   - emit 'focus-contract:reflected' event
//   - if status === 'done': emit companion milestone event

// skipContract(sessionId, userId): Promise<void>
//   - emit 'focus-contract:skipped' event (no DB write needed)

// getCompletionRate(userId, windowDays): Promise<number>
//   - calls repository.getContractCompletionRate
//   - returns 0.0â€“1.0
//   - used by Focus Score integration

// getContractForSession(sessionId, userId): Promise<FocusContract | null>
```

**VERIFY:**

- [x] No Supabase calls in service.ts.
- [x] All inputs validated with Zod.
- [x] Events emitted on all state transitions.
- [x] Tests cover: create with task, skip, reflect done, reflect partial, reflect not_done.
- [x] File under 200 lines.
- [x] Typecheck passes.

---

### P12-04 â€” Focus Contract Hooks

**WHY:**
React hooks that wire TanStack Query to the service for UI consumption.

**FILES TO CREATE:**

```
src_impl/features/focus-contract/hooks.ts
```

**IMPLEMENT:**

```typescript
// useContractForSession(sessionId: string | null)
//   returns: { contract, isPending, isError, error, refetch }

// useCreateContract()
//   returns: mutation with { mutateAsync, isPending, isError }
//   on success: invalidate ['focus-contract', sessionId]
//   on error: Sentry.captureException + toast

// useReflectOnContract()
//   returns: mutation with optimistic update
//   on success: invalidate ['focus-contract', sessionId], ['focus-score', userId]
//   on error: rollback + Sentry + toast

// useContractCompletionRate(userId: string | null, windowDays: number)
//   returns: { rate, isPending, isError }
```

**VERIFY:**

- [x] No TanStack Query calls in components (hooks only).
- [x] Optimistic update and rollback implemented on `useReflectOnContract`.
- [x] All mutations invalidate related queries on success.
- [x] All mutations capture Sentry on error.
- [x] All mutations show user-facing error toast.
- [x] File under 200 lines.
- [x] Typecheck passes.

---

### P12-05 â€” Session Setup: Contract Input Field

**WHY:**
The optional contract field must appear on Session Setup before the session starts. It must be dismissible. It must not block session start.

**FILES TO EDIT:**

```
src_impl/screens/session/components/SessionSetupHeader.tsx
src_impl/screens/session/SessionSetupScreen.tsx
```

**IMPLEMENT:**

In `SessionSetupHeader.tsx` or a new `SessionContractInput.tsx` component:
- Text input field: placeholder "What will you focus on? (optional)"
- Max 80 characters, no newlines
- Character counter: shown at 60+ chars
- If the trimmed value is 1-2 characters, show inline copy "Add a little more detail, or start without a contract." Starting the session still works and treats the contract as skipped.
- `accessibilityLabel="Focus contract â€” optional task description"`
- `accessibilityHint="Describe the specific task you will work on during this session"`
- Minimum touch target 44Ã—44
- Clear button when text is present
- onChangeText stored in local `useState`
- Passed up to screen via `onContractChange` prop

In `SessionSetupScreen.tsx`:
- Store contract text in local state
- Pass to session start params when `onStartSession` fires
- If empty or whitespace, pass null â€” do not create a contract

**VERIFY:**

- [x] Field appears above the Start button.
- [x] Field is optional â€” user can start without filling it.
- [x] 1-2 character input does not block session start; it is treated as skipped unless the user adds detail.
- [x] Character limit is enforced.
- [x] VoiceOver announces label and hint.
- [x] Dark mode renders correctly with design tokens only.
- [x] File under 200 lines after edit (split if needed).
- [x] Typecheck passes.

---

### P12-06 â€” Active Session: Contract Reminder Strip

**WHY:**
Users should see their commitment during the session without it being intrusive.

**FILES TO CREATE:**

```
src_impl/screens/session/components/SessionContractReminder.tsx
```

**IMPLEMENT:**

- Renders only if `contract !== null`
- Single line of text: contract task description
- Dismissible (X button, persists dismissal in local state)
- Positioned at top of active session screen below header
- Semi-transparent background using design token
- Minimum touch target for dismiss button
- `accessibilityLabel` on dismiss button
- On dismiss: fires `haptic.impactLight()`

In `ActiveSessionScreen.tsx`: render `<SessionContractReminder contract={contract} />` if contract exists. Read contract from session params or from `useContractForSession`.

**VERIFY:**

- [x] Strip only appears when contract was set.
- [x] Strip is dismissible.
- [x] Strip does not block timer or controls.
- [x] Dark mode correct.
- [x] Reduced motion: no animation on strip.
- [x] File under 200 lines.
- [x] Typecheck passes.

---

### P12-07 â€” Session Complete: Contract Reflection Card

**WHY:**
This is the highest-retention moment: "Did I do what I said I would?" Post-session reflection turns a mechanical timer into an identity event.

**FILES TO CREATE:**

```
src_impl/screens/session/components/SessionContractReflectionCard.tsx
```

**FILES TO EDIT:**

```
src_impl/screens/session/components/SessionCompleteContent.tsx
src_impl/screens/session/components/SessionCompleteNextSteps.tsx
```

**IMPLEMENT:**

`SessionContractReflectionCard.tsx`:
- Props: `contract: FocusContract | null`, `onReflect: (status: CompletionStatus) => void`, `isPending: boolean`
- Renders nothing if `contract === null`
- Title: "Did you do it?"
- Task description in a styled quote block
- Three buttons: "Done âœ“" | "Partial â†—" | "Not this time â†’"
- Each button has `accessibilityLabel` and `accessibilityRole="button"`
- On selection: optimistic UI update, call `onReflect(status)`, haptic feedback
- Loading state: buttons disabled with `isPending`
- VEX voice copy: no shame on "Not this time" â€” "That happens. Next session, try again."

In `SessionCompleteContent.tsx`:
- Render `<SessionContractReflectionCard>` as the first consequence card â€” above grade, XP, streak
- Wire to `useReflectOnContract` mutation
- Read contract from `useContractForSession(sessionId)`

**VERIFY:**

- [x] Card renders only when session had a contract.
- [x] Three reflection states all work.
- [x] Optimistic update fires immediately.
- [x] Mutation invalidates focus-score on success.
- [x] No shame copy on partial or not_done.
- [x] Companion milestone event fires on 'done' reflection.
- [x] Accessibility labels on all three buttons.
- [x] Raw contract text is not included in analytics, Sentry breadcrumbs, or push notification payloads.
- [x] File under 200 lines.
- [x] Typecheck passes.

---

### P12-08 â€” Focus Score: Contract Completion Rate Integration

**WHY:**
Contract completion rate should influence Focus Score as a behavioral quality signal. Users who consistently achieve what they set out to do have better focus discipline, regardless of purity score.

**FILES TO EDIT:**

```
src_impl/features/focus-identity/score-algorithm.ts
src_impl/features/focus-identity/repository-focus-score.ts
```

**IMPLEMENT:**

In `score-algorithm.ts`:
- Add `contractCompletionRate` as a factor: weight 8% (take from `sessionVariety` or distribute from minor factors)
- `contractCompletionRate` input: 0.0â€“1.0 from `service.getCompletionRate(userId, 14)`
- Factor only applies when user has completed 3+ contracts (skip for new users)
- Factor floors at 0.5 for users with 0 contracts (neutral, not penalizing)

In `repository-focus-score.ts`:
- Add `contract_completion_rate` column read from `focus_contracts` aggregate in the history query
- Or compute via a separate call to `focus-contract` repository

**VERIFY:**

- [x] Factor weight sum remains 100%.
- [x] Score range remains 300â€“850.
- [x] New users with 0 contracts are not penalized.
- [x] Tests cover: user with all done, user with all not_done, user with no contracts.
- [x] File under 200 lines.
- [x] Typecheck passes.

---

### P12-09 â€” Analytics for Focus Contract

**WHY:**
Contract analytics are critical for understanding whether the feature drives retention. Coach can use this data.

**FILES TO CREATE:**

```
src_impl/features/focus-contract/analytics.ts
```

**IMPLEMENT:**

```typescript
// trackContractCreated(userId, sessionId, hasTask: boolean): void
// trackContractReflected(userId, status: CompletionStatus, sessionDuration: number): void
// trackContractSkipped(userId, sessionId): void
// trackContractCompletionRate(userId, rate: number, window: number): void
```

All functions: Sentry breadcrumb + `AnalyticsService.track()`. No PII in payloads. Only IDs and behavioral signals.

**VERIFY:**

- [x] No PII in event payloads.
- [x] All events are defined in the core analytics events list.
- [x] File under 200 lines.
- [x] Typecheck passes.

---

### P12-10 â€” Tests for Focus Contract

**FILES TO CREATE:**

```
src_impl/features/focus-contract/__tests__/service.test.ts
src_impl/features/focus-contract/__tests__/repository.test.ts
```

**IMPLEMENT:**

`service.test.ts`:
- createContract with valid task â†’ success
- createContract with empty task â†’ validation error
- createContract with 81-char task â†’ validation error
- reflectOnContract done â†’ event emitted, companion milestone emitted
- reflectOnContract partial â†’ event emitted, no companion milestone
- reflectOnContract not_done â†’ event emitted, supportive copy not shaming
- skipContract â†’ skip event emitted, no DB write
- getCompletionRate with all done â†’ 1.0
- getCompletionRate with no contracts â†’ 0.5 (neutral floor)

`repository.test.ts`:
- createContract â†’ Supabase insert succeeds
- createContract â†’ Supabase error â†’ throws RepositoryError
- getContractForSession â†’ found â†’ returns parsed FocusContract
- getContractForSession â†’ not found â†’ returns null
- getContractForSession â†’ invalid Supabase shape â†’ throws

**VERIFY:**

- [x] All tests pass.
- [x] No `any` in test files.
- [x] Test files under 200 lines (split if needed).
- [x] `npm run typecheck -- --pretty false` passes.
- [x] Verification report updated.

**PHASE 12 EXIT GATE:**

- [x] `focus_contracts` table exists in Supabase with RLS.
- [x] `npm run types:supabase` completed after schema change.
- [x] Session Setup shows contract field.
- [x] Active Session shows contract reminder strip.
- [x] Session Complete shows reflection card as first consequence card.
- [x] Focus Score algorithm includes contract completion rate.
- [x] AI coach has access to completion rate signal.
- [x] Analytics contains only `hasTask`, status, counts, rates, and ids; no raw task descriptions.
- [x] Contract failure does not block session start or completion.
- [x] All Focus Contract tests pass.
- [x] Zero over-200-line files in `focus-contract` feature.
- [x] `npm run typecheck -- --pretty false` passes.
- [x] `npm run lint` passes.
- [x] Verification report updated.

---

## Phase 13 â€” Reward Clarity Engine

**Goal:** Post-session, one headline reward is announced. All others are secondary. Users leave knowing what just changed, not overwhelmed by simultaneous XP + coins + gems + streak + boss + companion + level.

**Why this is critical:** The systems analysis correctly identifies reward dilution as a major D7 risk. When everything rewards equally, nothing is memorable. The session complete screen currently renders `SessionCompleteRewardsSection`, `StreamConsequenceCard`, `BossImpactCard`, `ChallengeImpactCard`, `CompanionGrowthSection`, and `SessionProgressionCard` in no priority order.

**Launch UX standard:**
- Exactly one reward is visually dominant.
- Secondary consequences are still visible, but compact and scan-friendly.
- The headline is selected by deterministic service logic, not animation timing or component order.
- The headline must be explainable in one sentence.
- If a new optional system is disabled, it cannot win headline priority.

**Required architecture:**
`CompletionOrchestrator -> SessionConsequences -> selectHeadlineReward service -> post-session hook/view model -> SessionHeadlineReward component`

No headline selection logic may live in `SessionCompleteContent.tsx`.

---

### P13-01 â€” Headline Reward Priority Schema

**FILES TO CREATE:**

```
src_impl/features/session-completion/headline-reward.schemas.ts
src_impl/features/session-completion/headline-reward.types.ts
```

**IMPLEMENT:**

```typescript
// HeadlineRewardTypeSchema: z.enum([
//   'streak_saved',        // priority 1 â€” streak was at critical risk and session saved it
//   'streak_milestone',    // priority 2 â€” streak hit a milestone (7, 14, 30, 100 days)
//   'companion_evolved',   // priority 3 â€” companion crossed an evolution threshold
//   'boss_defeated',       // priority 4 â€” boss health reached zero
//   'level_up',            // priority 5 â€” user gained a level
//   'challenge_complete',  // priority 6 â€” a daily or weekly challenge was completed
//   'personal_best',       // priority 7 â€” best purity score for this mode+duration
//   'comeback_complete',   // priority 8 â€” comeback quest finished
//   'contract_done',       // priority 9 â€” focus contract marked done
//   'xp_earned',           // priority 10 â€” default, always present
// ])

// HeadlineRewardSchema: {
//   type: HeadlineRewardType
//   title: string
//   body: string
//   iconName: string  (from design system icon set)
//   value: string     (e.g. "+240 XP", "Day 7 streak", "Level 12")
// }
```

**VERIFY:**

- [x] All types via `z.infer<>`.
- [x] File under 200 lines.
- [x] Typecheck passes.

---

### P13-02 â€” Headline Reward Selector Service

**FILES TO CREATE:**

```
src_impl/features/session-completion/headline-reward.service.ts
```

**IMPLEMENT:**

```typescript
// selectHeadlineReward(consequences: SessionConsequences): HeadlineReward

// Input: SessionConsequences object (already computed by completion orchestrator)
// Logic:
//   1. Check streak_saved: streak was critical (â‰¤4h) before session, is now safe
//   2. Check streak_milestone: newStreak in [7, 14, 30, 100]
//   3. Check companion_evolved: companion crossed phase threshold
//   4. Check boss_defeated: boss.currentHealth <= 0
//   5. Check level_up: newLevel > previousLevel
//   6. Check challenge_complete: challenge marked complete this session
//   7. Check personal_best: isPB flag from grading result
//   8. Check comeback_complete: comebackQuest.isComplete
//   9. Check contract_done: contractStatus === 'done'
//   10. Default to xp_earned with actual XP amount
//   Return the first match (highest priority wins)
```

This function is pure â€” no side effects, no async, no Supabase calls. Fully testable.

**VERIFY:**

- [ ] Function is pure (no side effects).
- [ ] Tests cover all 10 priority branches.
- [ ] Tests cover multiple simultaneous triggers (streak_saved wins over level_up).
- [ ] File under 200 lines.
- [ ] Typecheck passes.

---

### P13-03 â€” Headline Reward UI Component

**FILES TO CREATE:**

```
src_impl/screens/session/components/SessionHeadlineReward.tsx
```

**IMPLEMENT:**

- Props: `headline: HeadlineReward`
- Large, centered display at top of Session Complete content
- Title in display typography
- Value in accent color from design tokens
- Body in secondary text
- Enter animation with `withSpring` (check `useReducedMotion()`)
- `accessibilityRole="header"`, `accessibilityLabel={headline.title + ': ' + headline.value}`
- No hardcoded colors, spacing, or font sizes

**FILES TO EDIT:**

```
src_impl/screens/session/components/SessionCompleteContent.tsx
```

In `SessionCompleteContent.tsx`:
- Compute headline from `selectHeadlineReward(consequences)` in the hook layer (not in JSX)
- Render `<SessionHeadlineReward headline={headline} />` as the first visible element
- All other reward cards rendered below, in smaller format, as "Also happened" section
- The XP + coins + gems summary remains visible but in a compact secondary row

**VERIFY:**

- [ ] Headline renders as first element.
- [ ] Secondary rewards render below in compact format.
- [ ] Reduced motion respected.
- [ ] Accessibility label present.
- [ ] No business logic in component.
- [ ] File under 200 lines.
- [ ] Typecheck passes.

---

### P13-04 â€” Reward Clarity Hook Wiring

**FILES TO EDIT:**

```
src_impl/features/session-completion/hooks.ts
```

**IMPLEMENT:**

In `usePostSessionStoryViewModel` or a new `useSessionHeadline` hook:
- Call `selectHeadlineReward(consequences)` after consequences are computed
- Return `headline` as part of the view model
- Do not put the selection logic in the component

**VERIFY:**

- [ ] `selectHeadlineReward` is called in hook, not in component.
- [ ] Result is part of the view model object.
- [ ] Tests cover hook returning correct headline for different consequence states.
- [ ] File under 200 lines.
- [ ] Typecheck passes.

---

### P13-05 â€” Tests for Reward Clarity

**FILES TO CREATE:**

```
src_impl/features/session-completion/__tests__/headline-reward.test.ts
```

**IMPLEMENT:**

- streak_saved triggers correctly when streak was critical
- streak_milestone fires for each milestone value
- companion_evolved fires when evolution flag is set
- boss_defeated fires when health is zero
- level_up fires when level increased
- challenge_complete fires when challenge is in completed list
- personal_best fires when isPB is true in grading
- xp_earned is always the fallback
- Priority: streak_saved beats level_up when both present
- Priority: streak_milestone beats challenge_complete when both present

**VERIFY:**

- [ ] All tests pass.
- [ ] File under 200 lines.
- [ ] Typecheck passes.
- [ ] Verification report updated.

**PHASE 13 EXIT GATE:**

- [ ] Post-session screen shows one headline reward prominently.
- [ ] Secondary rewards visible below in compact format.
- [ ] No reward is hidden â€” users still see XP, coins, streak, companion.
- [ ] Headline selection logic is in service, not component.
- [ ] Disabled optional systems cannot appear as headline rewards.
- [ ] Screenshot evidence added to `VERIFICATION_REPORT.md` for normal completion, streak save, and personal best.
- [ ] Tests for priority selection pass.
- [ ] `npm run typecheck -- --pretty false` passes.
- [ ] Verification report updated.

---

## Phase 14 â€” Personal Bests Registry

**Goal:** Track and surface a user's best purity score, best grade, and best completion for every session mode + duration combination. Show "beat your best" before a session. Announce a personal best as a headline reward on the session complete screen.

**Why this matters:** The systems analysis notes that VEX needs "skill expression" without forcing longer sessions. Personal bests per mode/duration create a mastery path for every session length. A 15-minute Sprint has its own personal best that is not diminished by a 60-minute Deep Work session.

**Ship condition:** Phase 14 is an 11/10 differentiator, not a reason to miss the May 30 submission. It ships only if the full vertical slice is green by the Phase 14 exit gate. If not green, remove all visible UI and keep the plan for v1.1.

**Launch UX standard:**
- First-time users see encouragement, never a zero or empty leaderboard.
- Personal bests compare the user to their own history only.
- A personal best never requires a longer session than the user's selected duration.
- A failed personal-best check never blocks session completion.

**Required architecture:**
`Session Setup hook -> personal-bests service -> repository -> Supabase`
`CompletionOrchestrator -> personal-bests service -> SessionConsequences.isPB -> Headline Reward`

---

### P14-01 â€” Personal Bests Domain Model

**FILES TO CREATE:**

```
src_impl/features/personal-bests/schemas.ts
src_impl/features/personal-bests/types.ts
```

**IMPLEMENT:**

```typescript
// PersonalBestKeySchema: {
//   userId: uuid
//   sessionMode: SessionMode  (FOCUS, SPRINT, DEEP_WORK, STUDY, CREATIVE, RECOVERY)
//   durationBucket: '10' | '15' | '25' | '45' | '60+'  (duration rounded to nearest bucket)
// }

// PersonalBestSchema: {
//   id: uuid
//   ...PersonalBestKey
//   bestPurityScore: number 0â€“100
//   bestGrade: SessionGrade
//   totalSessions: number
//   achievedAt: timestamp
//   updatedAt: timestamp
// }

// PersonalBestComparisonSchema: {
//   current: PersonalBest | null
//   isNewRecord: boolean
//   previousBest: number | null  (previous purity score)
//   margin: number | null        (by how much the record was broken)
// }
```

**VERIFY:**

- [x] All types via `z.infer<>`.
- [x] Duration buckets cover all valid session lengths.
- [x] File under 200 lines.
- [x] Typecheck passes.

---

### P14-02 â€” Personal Bests Repository

**SUPABASE TABLE REQUIRED:**

Create this as a real migration in `supabase/migrations/`, then run `npm run types:supabase`.

```sql
CREATE TABLE personal_bests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_mode TEXT NOT NULL,
  duration_bucket TEXT NOT NULL,
  best_purity_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  best_grade TEXT NOT NULL DEFAULT 'D',
  total_sessions INTEGER NOT NULL DEFAULT 1,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, session_mode, duration_bucket)
);

ALTER TABLE personal_bests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user owns personal bests" ON personal_bests
  FOR ALL USING (auth.uid() = user_id);
```

**FILES TO CREATE:**

```
src_impl/features/personal-bests/repository.ts
```

**IMPLEMENT:**

```typescript
// getPersonalBest(userId, mode, durationBucket): Promise<PersonalBest | null>
// upsertPersonalBest(record: PersonalBest): Promise<PersonalBest>
//   (upsert: update if better, insert if first time)
// getUserPersonalBests(userId): Promise<PersonalBest[]>
//   (all records for all modes/durations for profile display)
```

**VERIFY:**

- [x] Upsert only updates when new purity > existing purity.
- [x] All Supabase types from auto-generated file.
- [x] All responses Zod-parsed.
- [x] Tests cover: first record, new record better, new record worse (no update), Supabase error.
- [x] File under 200 lines.
- [x] Typecheck passes.

---

### P14-03 â€” Personal Bests Service

**FILES TO CREATE:**

```
src_impl/features/personal-bests/service.ts
```

**IMPLEMENT:**

```typescript
// checkAndUpdatePersonalBest(
//   userId, mode, duration, purityScore, grade
// ): Promise<PersonalBestComparison>
//   - resolve duration bucket
//   - fetch current best
//   - if purityScore > currentBest.bestPurityScore â†’ upsert, mark isNewRecord=true
//   - return comparison object for headline reward system

// getDurationBucket(durationSeconds: number): DurationBucket
//   10min: 0â€“749s, 15min: 750â€“1199s, 25min: 1200â€“2099s, 45min: 2100â€“3299s, 60+: 3300+

// getBestPreview(userId, mode, duration): Promise<PersonalBest | null>
//   called before session setup to show "Your best: 87 purity" preview
```

**VERIFY:**

- [x] Duration bucket logic tested for boundary values.
- [x] No Supabase calls in service.
- [x] Comparison object correctly populated.
- [x] Personal best comparison integrates with `selectHeadlineReward` (isPB flag passed through).
- [x] File under 200 lines.
- [x] Typecheck passes.

---

### P14-04 â€” Personal Bests in Session Setup

**FILES TO EDIT:**

```
src_impl/screens/session/components/SessionSetupHeader.tsx
```

**IMPLEMENT:**

- After user selects mode and duration, fetch personal best preview
- Display: "Your best: [X] purity Â· [Grade]" in small secondary text
- If no personal best: "First time at this length. Focus clean."
- Loading: skeleton text placeholder
- Error: silent (do not block session setup)
- Data from `usePersonalBestPreview(userId, mode, duration)` hook

**VERIFY:**

- [x] Preview appears after mode and duration are both selected.
- [x] Loading state is a skeleton, not a spinner.
- [x] Error is silent (no error state shown, just nothing).
- [x] No first-time user is shown a zero-score intimidation.
- [x] VEX-voiced copy on first session: encouraging, not intimidating.
- [x] File under 200 lines.
- [x] Typecheck passes.

---

### P14-05 â€” Personal Bests in Session Completion

**FILES TO EDIT:**

```
src_impl/features/session-completion/service.ts
src_impl/features/session-completion/completion-orchestrator.ts
```

**IMPLEMENT:**

In the completion orchestrator, after grading:
- Call `personalBestsService.checkAndUpdatePersonalBest(userId, mode, duration, purityScore, grade)`
- If `comparison.isNewRecord === true`, set `isPB = true` in the session consequences
- Pass `isPB` flag to the headline reward selector

**VERIFY:**

- [x] Personal best check runs as part of completion orchestrator.
- [x] Failure of PB check does not block completion (wrapped in try/catch, failure logged to Sentry).
- [x] isPB flag correctly passed to headline reward selector.
- [x] Personal best announced as headline reward (priority 7) when achieved.
- [x] File under 200 lines.
- [x] Typecheck passes.

---

### P14-06 â€” Personal Bests on Profile Screen

**FILES TO CREATE:**

```
src_impl/screens/profile/components/PersonalBestsGrid.tsx
```

**FILES TO EDIT:**

```
src_impl/screens/profile/ProfileScreen.tsx
```

**IMPLEMENT:**

`PersonalBestsGrid.tsx`:
- FlashList with `estimatedItemSize={88}`
- One card per mode/duration combination that has at least one session
- Card: mode name, duration label, purity score, grade badge, date achieved
- Empty state: "Complete a session to set your first personal best."
- Loading state: skeleton cards matching card layout
- Error state: `<ErrorState>` with retry

**VERIFY:**

- [x] FlashList used with measured estimatedItemSize.
- [x] All three states present: loading, empty, error, success.
- [x] No hardcoded colors or spacing.
- [x] Accessibility labels on each card.
- [x] File under 200 lines.
- [x] Typecheck passes.

**PHASE 14 EXIT GATE:**

- [x] `personal_bests` table exists with RLS.
- [x] `npm run types:supabase` completed.
- [x] Session setup shows personal best preview.
- [x] Session complete announces personal best as headline reward when achieved.
- [x] Profile screen shows personal bests grid.
- [x] All three UI states (loading, empty, error) present.
- [x] Tests for service, repository, bucket calculation pass.
- [x] `npm run typecheck -- --pretty false` passes.
- [x] Verification report updated.
- [x] If any item above is not green by the cut line, all Personal Bests UI entry points are feature-flagged off.

---

## Phase 15 â€” Companion Memory Timeline

**Goal:** After key milestones, the companion records a memory â€” a short, specific, dated entry that proves the user's journey. First S-grade. First 7-day streak. Hardest comeback. Longest deep work. These memories are viewable on the companion screen and create an emotional switching cost.

**Why this matters:** The systems analysis identifies "no dominant long-term identity object" as the #1 critical failure. The companion exists but accumulates nothing retrievable. A Memory Timeline turns the companion from a pet into a personal achievement diary. At Day 90, users return to see their journey, not just to earn more XP.

**Ship condition:** Phase 15 ships only if memory creation, deduplication, timeline rendering, copy quality, and failure isolation are all green. A half-empty timeline is worse than no timeline.

**Launch UX standard:**
- Memories are rare and meaningful, not spam after every session.
- Memory copy references specific user behavior.
- The timeline is read-only at launch; no social sharing or editing.
- Memory creation failure never blocks session completion.
- The companion remains useful even if the timeline is feature-flagged off.

**Required architecture:**
`CompletionOrchestrator -> companion memory service -> companion memory repository -> Supabase`
`CompanionScreen -> useCompanionMemories hook -> service -> repository -> Supabase`

---

### P15-01 â€” Companion Memory Domain Model

**FILES TO CREATE:**

```
src_impl/features/companion/memory-schemas.ts
src_impl/features/companion/memory-types.ts
src_impl/features/companion/memory-events.ts
```

**IMPLEMENT:**

```typescript
// CompanionMemoryTypeSchema: z.enum([
//   'first_session',
//   'first_s_grade',
//   'first_7_day_streak',
//   'first_30_day_streak',
//   'first_comeback',
//   'first_deep_work',   // first 45+ min session
//   'first_clean_sprint', // first sprint with 100% purity
//   'boss_first_defeat',
//   'companion_first_evolution',
//   'companion_second_evolution',
//   'contract_streak',   // completed 7 contracts in a row
//   'personal_best_broken', // broke a personal best they previously set
//   'hardest_comeback',  // came back from longest gap so far
//   'milestone_custom',  // for future extension
// ])

// CompanionMemorySchema: {
//   id: uuid
//   userId: uuid
//   type: CompanionMemoryType
//   title: string          // e.g. "First S-Grade"
//   body: string           // e.g. "You nailed a 25-minute deep work session with zero pauses. This is when things clicked."
//   sessionId: uuid | null
//   sessionDate: date
//   grade: SessionGrade | null
//   purityScore: number | null
//   streakDay: number | null
//   createdAt: timestamp
// }
```

**VERIFY:**

- [x] All types via `z.infer<>`.
- [x] File under 200 lines.
- [x] Typecheck passes.

---

### P15-02 â€” Companion Memory Repository

**SUPABASE TABLE REQUIRED:**

Create this as a real migration in `supabase/migrations/`, then run `npm run types:supabase`.

```sql
CREATE TABLE companion_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  grade TEXT DEFAULT NULL,
  purity_score NUMERIC(5,2) DEFAULT NULL,
  streak_day INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, type)  -- one memory per type per user (first occurrences)
);

ALTER TABLE companion_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user owns memories" ON companion_memories
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_companion_memories_user ON companion_memories(user_id, created_at DESC);
```

**FILES TO CREATE:**

```
src_impl/features/companion/memory-repository.ts
```

**IMPLEMENT:**

```typescript
// createMemory(memory: Omit<CompanionMemory, 'id' | 'createdAt'>): Promise<CompanionMemory>
//   ignore conflict (UNIQUE constraint means only first occurrence saved)

// getMemories(userId: string): Promise<CompanionMemory[]>
//   ordered by created_at DESC, limit 50

// hasMemory(userId: string, type: CompanionMemoryType): Promise<boolean>
//   check UNIQUE constraint without insert
```

**VERIFY:**

- [x] Conflict on duplicate type is handled gracefully (ignore, not throw).
- [x] All Supabase types from auto-generated file.
- [x] Tests cover: first memory, duplicate (no error), fetch, Supabase error.
- [x] File under 200 lines.
- [x] Typecheck passes.

---

### P15-03 â€” Companion Memory Service

**FILES TO CREATE:**

```
src_impl/features/companion/memory-service.ts
```

**IMPLEMENT:**

```typescript
// maybeCreateMemory(
//   userId, type, sessionId, context: MemoryContext
// ): Promise<CompanionMemory | null>
//   - check hasMemory first (cheap read)
//   - if already exists, return null (UNIQUE constraint safety net)
//   - generate title and body using VEX-voiced copy from memory-copy.ts
//   - call repository.createMemory
//   - emit 'companion:memory_created' event
//   - return created memory or null

// checkAndRecordSessionMemories(
//   userId, session, grade, purityScore, streak, isPB
// ): Promise<CompanionMemory[]>
//   Orchestrates all checks:
//   - first_session: sessionCount === 1
//   - first_s_grade: grade === 'S' and no prior S-grade memory
//   - first_7_day_streak: streak.currentStreak === 7
//   - first_30_day_streak: streak.currentStreak === 30
//   - first_deep_work: mode === DEEP_WORK and duration >= 2700 (45min)
//   - first_clean_sprint: mode === SPRINT and purityScore === 100
//   - personal_best_broken: isPB and session count > 3
//   etc.
//   Returns all new memories created in this session
```

**FILES TO CREATE:**

```
src_impl/features/companion/memory-copy.ts
```

VEX-voiced copy for each memory type. Direct, specific, supportive. Examples:

- `first_s_grade`: title "First Perfect Session", body "Zero pauses. Clean finish. You showed yourself what full focus feels like. Your companion remembers this."
- `first_7_day_streak`: title "7 Days Straight", body "One week without breaking the chain. This is where habits actually form."
- `first_comeback`: title "You Came Back", body "After missing days, you returned instead of quitting. That matters more than the streak number."
- No generic copy. No "Great job!" No exclamation point spam.

**VERIFY:**

- [x] All memory types have copy in `memory-copy.ts`.
- [x] Copy file has no logic â€” only data.
- [x] No shame copy for any type.
- [x] `checkAndRecordSessionMemories` called from session completion orchestrator.
- [x] Tests cover: first S-grade creates memory, second S-grade does not, all trigger conditions.
- [x] Files under 200 lines.
- [x] Typecheck passes.

---

### P15-04 â€” Companion Screen: Memory Timeline

**FILES TO EDIT:**

```
src_impl/screens/profile/CompanionScreen.tsx
```

**FILES TO CREATE:**

```
src_impl/screens/profile/components/CompanionMemoryTimeline.tsx
src_impl/screens/profile/components/CompanionMemoryCard.tsx
```

**IMPLEMENT:**

`CompanionMemoryTimeline.tsx`:
- Props: `memories: CompanionMemory[]`, `isPending: boolean`, `isError: boolean`, `onRetry: () => void`
- FlashList with `estimatedItemSize={120}`
- Section header: "Your Story"
- Loading: skeleton cards matching layout
- Empty: "Your companion will start remembering your milestones here. Complete your first session."
- Error: `<ErrorState>` with retry
- Ordered newest first

`CompanionMemoryCard.tsx`:
- Date in small text (formatted: "May 13")
- Title in body bold
- Body in secondary text, 2â€“3 lines max
- Grade badge if applicable
- No interaction needed â€” this is a read-only journal

In `CompanionScreen.tsx`:
- Add `<CompanionMemoryTimeline>` below companion stats section
- Hook: `useCompanionMemories(userId)`

**VERIFY:**

- [x] FlashList used with correct estimatedItemSize.
- [x] All three states present.
- [x] No hardcoded colors.
- [x] Memory cards are read-only (no tappable behavior unless explicitly designed).
- [x] First-use empty state has VEX-voiced copy.
- [x] Accessibility labels on card containers.
- [x] Files under 200 lines.
- [x] Typecheck passes.

---

### P15-05 â€” Companion Memory in Session Completion Orchestrator

**FILES TO EDIT:**

```
src_impl/features/session-completion/completion-orchestrator.ts
```

**IMPLEMENT:**

After all other consequence systems have run:
- Call `companionMemoryService.checkAndRecordSessionMemories(...)`
- Wrap in try/catch â€” memory failure must not crash completion
- If new memories created, include the most emotionally significant one in the consequences object
- The headline reward system can surface `companion_first_evolution` as priority 3

**VERIFY:**

- [x] Memory service call is non-blocking (failure caught and logged to Sentry).
- [x] New memories passed through consequences correctly.
- [x] Session completion flow not slowed by memory check (should be fast â€” one read, one write max).
- [x] File under 200 lines after edit (split if needed).
- [x] Typecheck passes.

**PHASE 15 EXIT GATE:**

- [x] `companion_memories` table exists with RLS.
- [x] `npm run types:supabase` completed.
- [x] Session completion creates memories for all trigger conditions.
- [x] Companion screen shows Memory Timeline with all states.
- [x] Memory copy is VEX-voiced, specific, non-generic, non-shaming.
- [x] Failure of memory creation does not crash session completion.
- [x] Tests for service and repository pass.
- [x] `npm run typecheck -- --pretty false` passes.
- [x] Verification report updated.
- [x] If any item above is not green by the cut line, all Memory Timeline UI entry points are feature-flagged off.

---

## Phase 16 â€” Production Hardening Completion

**Goal:** Complete every unchecked item from Phase 9 of TASKSx.md. These items are verified per VERIFICATION_REPORT.md as incomplete. The app cannot ship without them.

---

### P16-01 â€” Offline Sync Reliability (P9-01 Unchecked Items)

**WHY:**
The following P9-01 checkboxes are unchecked:

```
- [ ] Airplane mode completion shows local progress.
- [ ] Reconnect syncs within 10 seconds.
- [ ] Duplicate replay does not duplicate effects.
- [ ] Corrupt queue data is handled safely.
- [ ] Tests cover enqueue, replay, retry, permanent failure, and corrupt data.
```

**INSPECT FIRST:**

```
src_impl/features/session-completion/offline-sync-service.ts
src_impl/features/session-completion/offline-sync-integration.ts
```

**IMPLEMENT:**

For each unchecked item, locate the existing implementation and identify the gap. The offline-sync-service.ts is 578 lines (over limit â€” must be split first in Phase 11). After splitting:

1. **Airplane mode completion shows local progress:**
   - Verify: when offline, SessionCompleteScreen shows completion result from local ledger state, not from Supabase query
   - Verify: offline banner is visible
   - If not: wire `completionSync.isOffline` flag through to UI correctly

2. **Reconnect syncs within 10 seconds:**
   - Verify: `useNetInfo()` triggers re-sync attempt when `isConnected` changes to `true`
   - If not: add `useEffect` in offline-sync-integration that triggers sync on reconnect

3. **Duplicate replay does not duplicate effects:**
   - Verify: idempotency key check prevents double XP, double streak update, double reward
   - If not: ensure completion-orchestrator reads from ledger state before firing downstream events

4. **Corrupt queue data handled safely:**
   - Verify: MMKV queue entries are Zod-parsed before processing; parse failure â†’ entry discarded + Sentry

5. **Tests:**
   - Write missing tests for: enqueue while offline, replay on reconnect, duplicate key rejection, corrupt queue entry discarded

**VERIFY:**

- [ ] Airplane mode test passes manually.
- [ ] Sync-on-reconnect confirmed in test.
- [ ] Duplicate replay test passes.
- [ ] Corrupt queue test passes.
- [ ] All tests pass.
- [ ] `npm run typecheck -- --pretty false` passes.

---

### P16-02 â€” Error Boundaries (P9-02 Unchecked Items)

**WHY:**
The following P9-02 checkboxes are unchecked:

```
- [ ] Injected render error does not crash.
- [ ] Sentry captures feature tag.
- [ ] User can retry.
- [ ] Tests cover reset behavior.
```

**INSPECT FIRST:**

```
src_impl/shared/ui/components/ScreenErrorBoundary.tsx
```

**IMPLEMENT:**

1. **Injected render error does not crash:**
   - Add a test that mounts a component wrapped in `ScreenErrorBoundary`, throws from render, confirms fallback UI shown instead of crash

2. **Sentry captures feature tag:**
   - Verify `ScreenErrorBoundary` calls `Sentry.captureException(error, { tags: { feature: featureTag } })`
   - If not: add `featureTag` prop and Sentry call

3. **User can retry:**
   - Verify fallback UI shows a "Try again" button that calls `this.setState({ hasError: false })`
   - If not: add retry button to error boundary fallback render

4. **Tests cover reset behavior:**
   - Write test: error thrown â†’ fallback shown â†’ retry clicked â†’ error cleared â†’ children re-mounted

**VERIFY:**

- [ ] Error boundary test passes.
- [ ] Sentry call verified in test.
- [ ] Retry clears error state.
- [ ] Reset behavior test passes.
- [ ] `npm run typecheck -- --pretty false` passes.

---

### P16-03 â€” Accessibility and Motion (P9-03 Unchecked Items)

**WHY:**
The following P9-03 checkboxes are unchecked:

```
- [ ] Onboarding accessible.
- [ ] Home accessible.
- [ ] Session flow accessible.
- [ ] Story accessible.
- [ ] Paywall accessible.
- [ ] Dynamic text does not clip.
- [ ] Reduced motion path tested.
```

**IMPLEMENT FOR EACH SCREEN:**

Run the following audit for each listed screen:

```typescript
// For every interactive element, verify:
// - accessibilityLabel: non-empty, describes action
// - accessibilityRole: button | link | header | image | text
// - accessibilityHint: present when action is non-obvious
// - minimum touch target: 44Ã—44 via src/utils/touchTarget.ts
// - not relying solely on color to convey meaning
```

**For dynamic text clipping:**
- Every Text component must use `adjustsFontSizeToFit={false}` unless font scaling is explicitly supported
- Verify: increase device font to "Larger Accessibility Size" â€” no text clips, no overlap

**For reduced motion:**
- Every animation must be gated: `const { isReducedMotion } = useReducedMotion()`
- If `isReducedMotion` is true: skip spring/timing animations, use instant transitions
- Write test: mock `useReducedMotion` returning true â†’ verify no Reanimated animation values change

**VERIFY:**

- [ ] All five screens have accessibility labels on interactive elements.
- [ ] All touch targets are â‰¥44Ã—44.
- [ ] Dynamic text does not clip at largest system font.
- [ ] Reduced motion test passes (animation skipped when enabled).
- [ ] `npm run typecheck -- --pretty false` passes.

---

### P16-04 â€” Performance Gate (P9-04 Unchecked Items)

**WHY:**
The following P9-04 checkboxes are unchecked:

```
- [ ] `npm run perf:audit` passes.
- [ ] Median targets pass across 5 runs.
- [ ] No list warnings.
- [ ] No avoidable network calls on re-render.
```

**TARGETS (from TASKSx.md):**
- Cold start to interactive Home: <2.5 seconds median
- Home primary CTA visible: <1.5 seconds median
- Session start to timer running: <500ms median
- Post-session story first content: <300ms median

**IMPLEMENT:**

1. Run `npm run perf:audit` and identify specific bottlenecks.
2. Fix common issues per TASKSx.md:
   - Any remaining `ScrollView + .map()` lists â†’ convert to FlashList
   - Missing `staleTime` on queries â†’ add 30s minimum for stable data
   - Uncleaned realtime subscriptions â†’ audit all `useEffect` cleanup functions
   - Heavy work on Home render â†’ move to background with `useEffect`
   - Missing FlashList `estimatedItemSize` â†’ measure and set exactly

3. For `staleTime` audit:
```powershell
rg "useQuery\(" src_impl --include="*.ts" --include="*.tsx" | rg -v "staleTime"
```
Every `useQuery` without `staleTime` is a potential unnecessary network call.

4. For FlashList `estimatedItemSize`:
```powershell
rg "FlashList" src_impl --include="*.tsx" | rg -v "estimatedItemSize"
```
Every FlashList without `estimatedItemSize` will warn in Metro.

**VERIFY:**

- [ ] `npm run perf:audit` passes.
- [ ] 5-run median measurements documented.
- [ ] No FlashList without `estimatedItemSize`.
- [ ] No `ScrollView + .map()` list in data-driven screens.
- [ ] No realtime subscriptions without cleanup.
- [ ] No avoidable network calls on re-render (checked via DevTools).

---

### P16-05 â€” Privacy and Security (P9-05 Unchecked Items)

**WHY:**
The following P9-05 checkboxes are unchecked:

```
- [ ] Privacy inventory documented.
- [ ] Account deletion verified.
- [ ] Export verified or disabled.
- [ ] No secrets found.
- [ ] Analytics privacy tests pass.
- [ ] App Store privacy answers prepared.
```

**IMPLEMENT:**

1. **Privacy inventory:**
   Create `src_impl/privacy/PrivacyInventory.ts` (if not complete â€” existing file is 552 lines, must be split first in Phase 11). Document: auth identifiers, profile fields, session behavior, Focus Score, analytics events, purchase status, notification token, device diagnostics.

2. **Account deletion:**
   - Verify the delete flow in `AccountSettingsScreen.tsx` calls a service that:
     a. Deletes user from Supabase auth
     b. Triggers cascade deletes via RLS and foreign keys
     c. Signs user out of RevenueCat
     d. Clears MMKV storage
     e. Clears SecureStorage
   - If any step is missing, implement it.

3. **Export disabled:**
   - If data export is not fully implemented, hide the export option behind a feature flag or remove it from the UI.
   - Do NOT show a "Export Data" button that fails silently.

4. **No secrets found:**
```powershell
rg "SUPABASE_ANON_KEY|REVENUECAT_API_KEY|SENTRY_DSN|api_key|secret" src_impl --include="*.ts" --include="*.tsx"
```
   Any hardcoded secret is a blocker. Verify all secrets are in `.env.local` only.

5. **Analytics privacy:**
   - Verify `AnalyticsService.track()` strips PII from payloads.
   - No `email`, `name`, `phone`, `address` in any event payload.
   - Write test: mock analytics track â†’ verify event payload has no PII fields.

6. **App Store privacy answers:**
   - Document collection categories: name/email (auth), usage data (sessions), purchases.
   - Prepare answers for the App Store privacy nutrition label.

**VERIFY:**

- [ ] Privacy inventory documented.
- [ ] Account deletion removes all user data.
- [ ] Export disabled or verified working.
- [ ] No secrets in source files.
- [ ] Analytics privacy test passes.
- [ ] App Store privacy answers drafted.

---

### P16-06 â€” Paywall and RevenueCat (P9-06 Unchecked Items)

**WHY:**
The following P9-06 checkboxes are unchecked:

```
- [ ] Paywall copy sells growth and insight.
- [ ] Restore purchases works.
- [ ] Purchase failure has user-facing error.
- [ ] Expired entitlement falls back cleanly.
- [ ] Free tier remains useful.
- [ ] RevenueCat access only through shared monetization layer.
```

**CRITICAL ISSUE â€” VIP Paywall Copy:**

The current `VipPaywallScreen.tsx` lists these benefits:
- "Daily Gem Drop â€” 10 gems/day"
- "2x Mystery Chests â€” Double drops"

Per the app's own design principles (TASKSx.md P9-06 banned list): "emergency gem prompts" and economy dark patterns are banned. Daily gem drops that create logging-in-for-gems behavior is a mild form of this. **The paywall must sell insight, growth, and personalization â€” not currency.**

**IMPLEMENT:**

1. **Rewrite paywall copy** to match approved premium (from TASKSx.md):
   - Unlimited AI coach conversations
   - Monthly Focus Report with trend insights
   - Advanced analytics (best focus windows, session patterns)
   - Premium companion cosmetics (elements, visual themes)
   - Cosmetic season track access
   - Extra personal quests
   Remove: Daily Gem Drop, 2x Mystery Chests framing (reframe as cosmetic unlocks if kept)

2. **Restore purchases:**
   - Verify `usePremiumStatus()` calls RevenueCat restore on mount if no active entitlement
   - Add explicit "Restore Purchases" button in paywall and settings
   - Test: mock RevenueCat restore â†’ entitlement active â†’ paywall dismisses

3. **Purchase failure:**
   - Verify purchase error surfaces as user-facing toast: "Purchase didn't go through. Your card was not charged."
   - No silent failure.

4. **Expired entitlement:**
   - Verify premium features degrade cleanly when entitlement expires
   - AI coach: reverts to free tier limits
   - Monthly report: shows free summary only
   - No crash or error screen on expiry

5. **RevenueCat access:**
```powershell
rg "Purchases\.|RevenueCat" src_impl --include="*.ts" --include="*.tsx" | rg -v "shared/monetization"
```
   Any match outside `shared/monetization` is a violation.

**VERIFY:**

- [ ] Paywall copy sells growth and insight, not currency.
- [ ] No "Daily Gem Drop" or per-day currency incentive in paywall.
- [ ] Restore purchases works.
- [ ] Purchase failure has user-facing error toast.
- [ ] Expired entitlement falls back cleanly without crash.
- [ ] RevenueCat called only through `shared/monetization`.
- [ ] `npm run typecheck -- --pretty false` passes.

---

### P16-07 â€” App Store Submission Pack (P9-07 Unchecked Items)

**WHY:**
The following P9-07 checkboxes are unchecked:

```
- [ ] Metadata drafted.
- [ ] Privacy policy URL ready.
- [ ] Reviewer can complete onboarding and a session.
- [ ] Review notes explain subscriptions, login, offline mode, and notifications.
- [ ] Screenshots show real core loop.
```

**OFFICIAL APPLE CHECKS RE-VERIFIED MAY 14, 2026:**
- Apple says iOS/iPadOS apps uploaded to App Store Connect starting April 28, 2026 must be built with the iOS & iPadOS 26 SDK or later.
- App privacy details are required for new apps and updates and must include data collected by third-party partners/SDKs.
- A publicly accessible privacy policy URL is required.
- App Store Connect can now show Accessibility Nutrition Label information, including support for VoiceOver, Voice Control, Larger Text, and related features.
- App submissions require metadata, a selected build, and final submission through App Store Connect's review flow.

Sources to re-check before submission:
- https://developer.apple.com/app-store/submitting/
- https://developer.apple.com/app-store/app-privacy-details/
- https://developer.apple.com/appstore/resources/approval/guidelines.html
- https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app

**CREATE FILE:**

```
APP_STORE_PACK.md
```

**IMPLEMENT (document, not code):**

```markdown
# VEX App Store Submission Pack

## App Name
VEX â€” Focus & Flow

## Subtitle (30 chars max)
Timed focus with real insight

## Description (4000 chars max)
[Draft a 3-paragraph description: paragraph 1 = core value proposition,
 paragraph 2 = what happens in a session, paragraph 3 = what you build over time]

## Keywords (100 chars max)
focus timer, productivity, pomodoro, streak, study, flow state, habit tracker

## Support URL
https://[domain]/support

## Privacy Policy URL
https://[domain]/privacy

## Review Notes for App Reviewers
- Demo account: [email] / [password] (pre-loaded with 5 sessions of history)
- Subscription: 7-day free trial, then $X/month. Use sandbox test account.
- Offline mode: disable wifi during session â€” session completes and syncs on reconnect.
- Notifications: granted after first session value shown, not on launch.
- No user-generated content. No social features enabled at launch.
- Build requirement: production iOS build created with iOS & iPadOS 26 SDK or later.

## Age Rating
4+ (no violence, no mature content, no social networking at launch)

## Privacy Nutrition Label
Data Used to Track You: None
Data Linked to You: Purchases, Usage Data (session history), Identifiers (user ID)
Data Not Linked to You: Diagnostics (Sentry crash reports)
Third-party SDKs reviewed: Sentry, PostHog, RevenueCat, Supabase, Expo Notifications

## Accessibility Nutrition Label
VoiceOver: Supported
Larger Text: Supported after Phase 16 accessibility verification
Reduced Motion: Supported after Phase 16 reduced-motion verification
Voice Control: Verify manually before submission

## Screenshots Required
1. Home screen showing Focus Score + Daily Mission + companion
2. Session setup with contract input
3. Active session timer in progress
4. Session complete with headline reward
5. Companion screen with memory timeline
6. Paywall (if subscriptions enabled)
```

**VERIFY:**

- [ ] `APP_STORE_PACK.md` exists and is complete.
- [ ] Reviewer demo account exists in Supabase.
- [ ] Privacy policy URL is live.
- [ ] Production iOS build confirms iOS & iPadOS 26 SDK or later.
- [ ] Privacy details include third-party SDK data practices.
- [ ] Accessibility metadata prepared for App Store Connect.
- [ ] All screenshot targets identified.

**PHASE 16 EXIT GATE:**

- [ ] Offline sync unchecked items resolved.
- [ ] Error boundary unchecked items resolved.
- [ ] Accessibility unchecked items resolved.
- [ ] Performance targets met.
- [ ] Privacy and security unchecked items resolved.
- [ ] Paywall copy rewritten (no dark pattern currency incentives).
- [ ] App Store pack drafted.
- [ ] `npm run typecheck -- --pretty false` passes.
- [ ] `npm test` passes.
- [ ] Verification report updated with Phase 16 evidence.

---

## Phase 17 â€” Final Launch Gate

**Goal:** Run every P10 verification command. Make the release decision with evidence.

---

### P17-01 â€” Required Commands (P10-01)

Run in order. Do not proceed to P17-02 until all pass:

```bash
npm run typecheck -- --pretty false
node scripts/check-no-ts-nocheck.js
npm run lint
npm test -- --coverage
npm run perf:audit
npx expo export --platform ios --output-dir dist/ios-export-test
npx expo-doctor
eas build --platform ios --profile production --non-interactive
```

Banned pattern audits:

```bash
rg "console\." src_impl
rg ": any\b|<any>" src_impl
rg "@ts-ignore|@ts-nocheck|@ts-expect-error" src_impl
rg "StyleSheet\.create|FlatList(?!.*estimatedItemSize)|AsyncStorage|fetch\(" src_impl
rg "#[0-9A-Fa-f]{3,8}|rgb\(" src_impl --glob "*.tsx"
rg "from .*archive|from '../archive|from \"../archive" src_impl
```

**VERIFY:**

- [ ] Typecheck passes.
- [ ] No suppressions.
- [ ] Lint exits 0.
- [ ] Tests pass.
- [ ] Coverage â‰¥80% on all service layers.
- [ ] Performance audit passes.
- [ ] iOS export passes.
- [ ] Expo Doctor passes or every warning is documented with a launch-safe reason.
- [ ] Production EAS iOS build succeeds and uses the required current Apple SDK.
- [ ] All banned pattern audits are clean.

---

### P17-02 â€” Manual End-To-End Flows (P10-02)

For each flow, confirm manually on a physical device (iOS preferred):

**Core flows:**
- [ ] Fresh install â†’ onboarding (5 screens max) â†’ first session â†’ first result â†’ Home.
- [ ] Returning user â†’ Home shows Daily Mission + recommended session â†’ session with focus contract â†’ completion with headline reward â†’ story â†’ Home shows updated Focus Score.
- [ ] Offline completion â†’ reconnect â†’ sync confirmed within 10 seconds.
- [ ] App background during active session (15+ seconds) â†’ return â†’ timer correct.
- [ ] App kill during active session â†’ reopen â†’ recovery flow shown.
- [ ] Supabase outage simulation â†’ degraded state shown, no crash.

**Premium flows:**
- [ ] Paywall viewed â†’ sandbox purchase â†’ entitlement active â†’ premium feature accessible.
- [ ] Restore purchase â†’ entitlement restored.
- [ ] Expired entitlement â†’ fallback without crash.

**New feature flows (Phases 12â€“15):**
- [ ] Session setup with focus contract â†’ active session shows reminder strip â†’ complete â†’ reflection card shown first.
- [ ] Session complete with personal best â†’ personal best announced as headline reward.
- [ ] Companion screen â†’ memory timeline shows correct memories in order.
- [ ] Session complete shows one headline reward prominently + secondary rewards below.

**Accessibility flows:**
- [ ] VoiceOver on: navigate Home â†’ start session â†’ complete session without VoiceOver errors.
- [ ] Reduced motion on: session complete screen plays no spring animations.
- [ ] Large text: no clipping on Home, session setup, session complete.

**Dark mode:**
- [ ] All screens correct in dark mode â€” no hardcoded colors visible.

**VERIFY:**

- [ ] All flows confirmed manually.
- [ ] Results documented in `VERIFICATION_REPORT.md`.

---

### P17-03 â€” Release Decision (P10-03)

**MUST SHIP (green required):**

| System | Status |
|---|---|
| Session core loop | [ ] |
| Focus Score | [ ] |
| Home Daily Mission | [ ] |
| Focus Contract | [ ] |
| Streak / Comeback | [ ] |
| Headline Reward | [ ] |
| Offline sync | [ ] |
| Paywall / RevenueCat | [ ] |
| Privacy / App Store pack | [ ] |
| No disabled feature reachable | [ ] |
| All required commands pass | [ ] |

**11/10 DIFFERENTIATORS (ship only if green, otherwise feature-flag off):**

| System | Status | Cut action if not green |
|---|---|---|
| Personal Bests | [ ] | Hide setup preview, profile grid, headline reward branch |
| Companion Memory Timeline | [ ] | Hide timeline, memory hooks, and memory headline references |

**CUT IF NOT GREEN (do not block launch):**

1. Squads
2. Boss
3. Challenges
4. Monthly report
5. Advanced analytics
6. Battle pass
7. Cosmetics shop
8. Inventory / crafting
9. Weekly Season (post-launch)
10. Focus Identity Path / archetype (post-launch)

**NEVER CUT:**

- Session start
- Session completion + ledger
- Focus Score
- Focus Contract
- Home mission
- Offline sync
- Error states
- Paywall restore purchases (if subscriptions live)

**VERIFY:**

- [ ] Release decision documented in `VERIFICATION_REPORT.md`.
- [ ] Disabled systems listed with their feature flags.
- [ ] Remaining launch scope is coherent and testable by a first-time user.

**PHASE 17 EXIT GATE:**

- [ ] All required commands pass.
- [ ] All manual E2E flows confirmed.
- [ ] Release decision documented.
- [ ] Disabled features confirmed invisible.
- [ ] `VERIFICATION_REPORT.md` fully updated.
- [ ] App Store pack ready for submission.

---

## Phase 18 â€” Boss as Weekly Arc (Optional â€” Ship If Alive)

**Ship condition:** Basic Solo Boss is already gated behind `FEATURE_FLAGS.BASIC_SOLO_BOSS`. This phase only proceeds if the boss system is stable and the team decides to ship it. If not stable by Day 13, leave boss disabled.

**Goal:** Transform the boss from a generic health bar into a 3-phase weekly arc. Each week has a new boss. Each phase requires a different session behavior: clean sprint, deep work, comeback or recovery. Completing all 3 phases defeats the boss.

---

### P18-01 â€” Weekly Boss Arc Schema

**FILES TO CREATE OR EDIT:**

```
src_impl/features/boss/boss-arc.schemas.ts
src_impl/features/boss/boss-arc.types.ts
```

**IMPLEMENT:**

```typescript
// BossArcPhaseSchema: z.enum(['sprint_phase', 'deep_work_phase', 'recovery_phase'])

// BossArcPhaseRequirementSchema: {
//   phase: BossArcPhase
//   requiredMode: SessionMode
//   requiredMinDuration: number  (seconds)
//   requiredMinPurity: number    (0-100)
//   description: string
//   victoryCondition: string
// }

// WeeklyBossArcSchema: {
//   id: uuid
//   weekStartDate: date
//   weekEndDate: date
//   bossName: string
//   bossDescription: string
//   phases: BossArcPhaseRequirement[]  (exactly 3)
//   currentPhaseIndex: number  (0, 1, 2)
//   isDefeated: boolean
//   expiresAt: timestamp
// }
```

**VERIFY:**

- [ ] Schemas under 200 lines.
- [ ] Typecheck passes.

---

### P18-02 â€” Weekly Boss Arc Service

**FILES TO CREATE:**

```
src_impl/features/boss/boss-arc.service.ts
```

**IMPLEMENT:**

```typescript
// getCurrentArc(userId): Promise<WeeklyBossArc | null>
//   - returns this week's arc (Monâ€“Sun UTC)
//   - creates a new arc if none exists for this week

// advanceArc(userId, session, grade): Promise<ArcAdvanceResult>
//   - checks if session satisfies current phase requirement
//   - if yes: advance to next phase (or mark defeated if phase 2 complete)
//   - emit 'boss:arc_phase_advanced' or 'boss:arc_defeated'
//   - return result with phase description and next requirement

// generateWeeklyArc(weekStartDate: Date): WeeklyBossArc
//   - deterministic from date (same week = same boss for all users)
//   - rotates through a pre-defined boss roster
```

**VERIFY:**

- [ ] Arc generated deterministically per week.
- [ ] Advancing arc only when session satisfies phase requirement.
- [ ] Defeated arc triggers 'boss:arc_defeated' event once.
- [ ] Tests cover each phase requirement type.
- [ ] File under 200 lines.
- [ ] Typecheck passes.

**P18 is only marked complete if:**
- [ ] FEATURE_FLAGS.BASIC_SOLO_BOSS is enabled.
- [ ] Boss arc renders on Home as secondary rail item.
- [ ] All 3 phase types can be satisfied by real session types.
- [ ] Defeating the boss gives a reward that feeds the headline reward system.

---

## Phase 19 â€” Weekly Focus Season (Optional â€” Post-Launch)

**Ship condition:** This phase is explicitly post-launch. Do not implement before May 30. Feature-flag it off. Document the design for next sprint.

**Why it is post-launch:**
- Requires server-side season management (start/end dates, rotation schedule)
- Requires a schema migration with season tables
- Requires notification triggers at week boundaries
- Content (missions per season, boss per season) needs editorial curation

**Design brief (to be implemented in v1.1):**

Every week: one theme, 3 weekly missions, one boss arc, one companion memory opportunity, one shareable session summary card.

Weekly shareable summary (the "Wordle card" for VEX):
- Season week number, total focused minutes, best purity score, streak maintained/broken, companion growth
- Share payload: "Week 12 of VEX: 4.2 hours of deep focus. Personal best in Sprint. Streak: 23 days."
- Deep link: "Can you beat this?" â†’ app download or session start

**Defer all implementation to post-launch sprint.**

---

## Windsurf Task Packet Template (Unchanged)

```md
## Task: <name>

Goal:
<one sentence>

Files to read first:
- <file>
- <file>

Files allowed to edit:
- <file>
- <file>

Files forbidden to edit:
- unrelated features
- generated Supabase types except through `npm run types:supabase`

Architecture:
- Component:
- Hook:
- Service:
- Repository:
- Events:
- Analytics:
- Tests:

Implementation steps:
1.
2.
3.

Verification:
- [ ] targeted test command
- [ ] typecheck
- [ ] lint or targeted lint
- [ ] banned pattern grep
- [ ] file-size check
- [ ] verification report updated

Stop if:
- <specific blocker>
```

---

## Copy System (Addendum for New Features)

**Focus Contract copy:**
- Pre-session placeholder: "What will you focus on? (optional)"
- Reflection done: "That's focus. Your companion noticed."
- Reflection partial: "Partial is honest. Keep showing up."
- Reflection not_done: "That happens. Next session, try again."
- Skipped: (no copy â€” just start the session)

**Personal Bests copy:**
- First time at this length: "First time at this length. Focus clean."
- Has a record: "Your best: [X] purity Â· [Grade]"
- New record: "New personal best. [X] purity in [mode]."
- Broken by margin: "New personal best by [margin] points."

**Companion Memory copy:**
- All copy in `src_impl/features/companion/memory-copy.ts`
- Each type has a title (â‰¤30 chars) and body (â‰¤120 chars)
- No "!" in any memory body. No generic praise.
- Every memory references something specific about what the user did.

**Headline Reward copy:**
- streak_saved: "Streak saved. [N] days and counting."
- streak_milestone: "[N]-day streak. This is where habits form."
- companion_evolved: "Your companion remembers your progress."
- boss_defeated: "Boss defeated. Your focus did that."
- level_up: "Level [N]. You earned this."
- challenge_complete: "Challenge cleared. Locked in."
- personal_best: "Personal best. [X] purity in [mode]."
- comeback_complete: "Comeback complete. You came back."
- contract_done: "You did what you said you would."
- xp_earned: "+[N] XP. Session complete."

---

## Data Flow Reference (Addendum)

**Focus Contract Flow:**
```
SessionSetupScreen â†’ useCreateContract() â†’ FocusContractService â†’ FocusContractRepository â†’ Supabase
ActiveSessionScreen â†’ useContractForSession() â†’ local state
SessionCompleteScreen â†’ useReflectOnContract() â†’ FocusContractService â†’ FocusContractRepository â†’ Supabase
                                              â†˜ emit 'focus-contract:reflected'
                                              â†˜ FocusScoreIntegration.contractCompletionRate
                                              â†˜ CompanionService.milestone if 'done'
```

**Personal Bests Flow:**
```
CompletionOrchestrator â†’ PersonalBestsService.checkAndUpdate() â†’ PersonalBestsRepository â†’ Supabase
                     â†˜ PersonalBestComparison.isNewRecord â†’ SessionConsequences.isPB
SessionHeadlineReward â† selectHeadlineReward(consequences)
SessionSetupScreen â†’ usePersonalBestPreview() â†’ PersonalBestsService â†’ PersonalBestsRepository â†’ Supabase
```

**Companion Memory Flow:**
```
CompletionOrchestrator â†’ CompanionMemoryService.checkAndRecord() â†’ CompanionMemoryRepository â†’ Supabase
CompanionScreen â†’ useCompanionMemories() â†’ CompanionMemoryService â†’ CompanionMemoryRepository â†’ Supabase
                                                                  â†˜ render CompanionMemoryTimeline
```

**Headline Reward Flow:**
```
CompletionOrchestrator â†’ SessionConsequences (all flags: isPB, isStreakSaved, isMilestone, etc.)
hooks.ts â†’ selectHeadlineReward(consequences) â†’ HeadlineReward
SessionCompleteContent â† headline prop
SessionHeadlineReward â† renders headline prominently
```

---

## Anti-Slop Review Checklist (Addendum for Phases 12â€“15)

Before any generated task is accepted, additionally verify:

- [ ] Focus contract field does not block session start.
- [ ] Reflection card renders only when contract exists.
- [ ] Headline reward is from service, not computed in JSX.
- [ ] Personal bests repository upserts only on improvement (not every session).
- [ ] Companion memories are deduplicated per type (UNIQUE constraint + `hasMemory` check).
- [ ] Memory body copy is specific â€” not generic praise.
- [ ] Memory Timeline empty state encourages first session, does not shame.
- [ ] All new Supabase tables have RLS policies.
- [ ] `npm run types:supabase` was run after every schema change.
- [ ] No feature in Phases 12â€“15 is callable from a disabled route.

---

## Final Standard

The May 30 build ships when:

1. Phase 11 exit gate passes â€” zero lint errors, zero files over 200 lines.
2. Phase 12 exit gate passes â€” Focus Contract live.
3. Phase 13 exit gate passes â€” Headline Reward live.
4. Phase 16 exit gate passes â€” all Phase 9 items verified.
5. Phase 17 exit gate passes â€” all manual E2E flows confirmed.
6. Phase 14 ships only if the full exit gate passes; otherwise it is invisible.
7. Phase 15 ships only if the full exit gate passes; otherwise it is invisible.

The app ships with fewer features than it could. It ships with every shipped feature working completely across all states: loading, empty, error, offline, optimistic, and success.

Users who open VEX on launch day will:
- Know exactly what to do today (Daily Mission).
- Start a session in under two taps.
- Commit to a specific task (Focus Contract).
- See their companion and streak react to what they did.
- Know what the most important thing that just happened was (Headline Reward).
- See proof of their journey building over time if Personal Bests and Memory Timeline are green; otherwise they see no partial promise.

That is the launch definition of 11/10: not maximal scope, but maximal trust. The app feels premium because every visible promise is kept.

---

*This document is for Windsurf or any AI IDE. It is not a brainstorming artifact.*
*Do not interpret it as aspirational. Treat every task as a literal specification.*
*The launch date is May 30, 2026. Execute Phase 11 first. Today is May 14, 2026.*
