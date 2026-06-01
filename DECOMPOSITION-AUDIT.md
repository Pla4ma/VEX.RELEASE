# VEX Decomposition Audit — 119 Files

**Generated**: 2026-06-01
**Criterion**: "A split must reduce the number of concepts a reader holds in their head."

---

## SUMMARY

| Category | Count | % of 119 |
|----------|-------|----------|
| **MERGE** | 39 | 33% |
| **REVIEW** | 17 | 14% |
| **KEEP** | 63 | 53% |

**Critical issues found:**
- 4 pure barrel re-export files (0 domain logic)
- 3 near-identical duplicate file pairs
- `RepositoryError` class copy-pasted into 7+ files
- `mergeBusySlots` function duplicated in 3 calendar files
- `isQuietHours` duplicated across ai-coach and notifications
- `InsightBuilder` interface + `makeId` boilerplate duplicated across all 4 insight-builder files
- 3 files sitting at exactly 200 lines (suspicious truncation)

---

## MERGE — 39 files (line-count hacks, should be consolidated)

### Pure Barrel Re-exports (4 files) — Zero domain logic, just re-export paths

| File | Lines | Reason |
|------|-------|--------|
| `features/session-completion/completion-core.ts` | 8 | 2-line barrel re-exporting completion-performance + completion-rewards. No logic. |
| `navigation/notification-routing-core.ts` | 9 | Pure re-exports from 4 other files. Adds an import indirection with no concept reduction. |
| `features/study-os/service-helpers.ts` | 20 | Pure re-exports from service-helpers-plan + service-helpers-recall. No logic. |
| `features/ai-coach/intervention-detectors.ts` | 17 | Pure re-exports from intervention-detectors-core + intervention-detectors-situational. No logic. |

### Near-Identical Duplicates (3 files) — Duplicated types/functions under different names

| File | Lines | Reason |
|------|-------|--------|
| `shared/ui/PremiumErrorRecovery-helpers.ts` | 66 | **DUPLICATE** of premium-error-recovery-helpers.ts. Both define `RetryConfig`, `ErrorState`, `DEFAULT_RETRY_CONFIG`. Merge into one file. |
| `shared/ui/premium-error-recovery-helpers.ts` | 75 | **DUPLICATE** of PremiumErrorRecovery-helpers.ts above. Same interfaces, same constants. Delete one, keep the other. |
| `integrations/calendar/google-calendar-helpers.ts` | 79 | `mergeBusySlots` is duplicated here AND in calendar-sync-helpers.ts AND AppleCalendarAdapter.utils.ts. Keep only in calendar-sync-helpers. |

### Tiny Files With No Domain Boundary (12 files) — <35 lines, tightly coupled to parent

| File | Lines | Reason |
|------|-------|--------|
| `features/companion/components/companion-helpers.ts` | 13 | Single function `getPhaseMultiplier`. Belongs in companion service or types. |
| `features/session-completion/event-helpers.ts` | 16 | `generateEventId` + `createEventMetadata` + `getPlatform`. Generic utils, belongs in types or shared utils. |
| `features/focus-identity/FocusScoreDashboard-helpers.ts` | 19 | `formatDelta` + `formatFactorName` + `formatHistoryPoint`. 3 tiny formatters, inline into dashboard. |
| `screens/onboarding/components/onboarding-flow-helpers.ts` | 18 | Single function `getCoachCue`. Inline into onboarding flow component. |
| `features/notifications/notification-event-types-core.ts` | 24 | 3 interfaces. Merge into the main notifications types file. |
| `features/analytics/integration-helpers.ts` | 24 | `updateIntegrationState` + `getTimeOfDay`. 2 small functions, merge into integration service. |
| `services/supabase-auth-helpers.ts` | 21 | `fetchUserOnboardingStatus` + `buildUserWithOnboarding`. Tightly coupled to auth, merge into supabase auth service. |
| `session/components/states/session-backgrounded-helpers.ts` | 21 | `formatDuration` (DUPLICATE — defined in 20+ files) + `calculateProgressLoss`. Merge into session-backgrounded component. |
| `screens/home/containers/home-screen-inner-helpers.ts` | 26 | Single function `buildToast`. Inline into home-screen-inner. |
| `screens/auth/forgot-password-helpers.ts` | 32 | Single function `submitForgotPassword`. Inline into forgot-password screen. |
| `features/streaks/repository-helpers.ts` | 34 | `RepositoryError` (DUPLICATE) + `parseStreakRow`. Merge into streaks repository.ts. |
| `session/components/session-validation-feedback-helpers.ts` | 36 | `formatFieldName` + styles object. Styles belong in a .styles file, format inline. |

### Duplicate Utility Classes/Functions (5 files) — RepositoryError, isQuietHours, etc.

| File | Lines | Reason |
|------|-------|--------|
| `features/challenges/repository-helpers.ts` | 53 | `RepositoryError` (DUPLICATE, already in 7+ files) + query helper + mapper. Merge into challenges repository.ts. |
| `features/focus-identity/repository-helpers.ts` | 70 | `RepositoryError` (DUPLICATE) + `withRetry` (generic infra, already in shared/hardening). Merge into focus-identity repository.ts. |
| `features/ai-coach/services/notification-helpers.ts` | 41 | `isQuietHours` (DUPLICATE of notifications/service-helpers.ts) + `isSameCalendarDay` + `isRateLimited`. Merge unique functions, delete duplicate. |
| `integrations/calendar/calendar-sync-helpers.ts` | 106 | `mergeBusySlots` DUPLICATE (also in google-calendar-helpers.ts + AppleCalendarAdapter.utils.ts). Deduplicate, keep single source. |
| `session/analytics/session-analytics-listener-helpers.ts` | 37 | Single function `subscribeErrorEventListeners`. Merge into session-analytics-listeners.ts. |

### Insight Builder Boilerplate Duplication (4 files) — Identical interface + makeId in every file

| File | Lines | Reason |
|------|-------|--------|
| `features/memory-candidate/insight-builders/mode-notif-builders.ts` | 151 | `InsightBuilder` interface + `makeId` DUPLICATED in all 4 insight-builder files. Extract shared types to index.ts, keep only builder-specific logic. |
| `features/memory-candidate/insight-builders/rescue-project-builders.ts` | 102 | Same duplicated boilerplate as above. |
| `features/memory-candidate/insight-builders/start-session-builders.ts` | 136 | Same duplicated boilerplate as above. |
| `features/memory-candidate/insight-builders/study-general-builders.ts` | 177 | Same duplicated boilerplate as above. |

### Miscellaneous Tail Splits (10 files) — Functions that belong in their parent module

| File | Lines | Reason |
|------|-------|--------|
| `session/analytics/session-analytics-helpers.ts` | 46 | Single function `calculatePatternMetricsFromHistory`. Merge into session-analytics service. |
| `ai-coach/components/intervention-helpers.ts` | 49 | Color/icon mapping tightly coupled to intervention component. Inline. |
| `features/session-completion/completion-subsystem-helpers.ts` | 49 | `subsystemShouldRun` + `rewardAmountFor` + `runSubsystem`. Tightly coupled to completion service. |
| `session/components/states/conflict-state-helpers.ts` | 52 | `formatTime` + `computeDifferences` + `handleResolve`. All tied to conflict-state component. Inline. |
| `features/personalization/behavior-resolver-helpers.ts` | 61 | Threshold constants + signal counting utils. Merge into behavior resolver service. |
| `features/ai-coach/message-helpers.ts` | 64 | `generateAndSendMessage` + stubs (`checkIntegrationHealth`, `subscribeToCoachEvents`). Merge into ai-coach service. |
| `features/companion-promise/service-helpers.ts` | 66 | `toDateKey` + `mapSessionModeToTargetMode`. Merge into companion-promise service. |
| `features/analytics/components/export-progress-helpers.ts` | 43 | Types + config + 2 formatters for export progress. Merge into data-export-helpers.tsx or component. |
| `features/home-experience/home-experience-helpers.ts` | 87 | `resolveSpotlight`. Single function, merge into home-experience service. |
| `screens/home/hooks/home-controller-helpers.ts` | 58 | `getFocusedMinutesForToday` + `getNextUnlockFeature` + re-exports from home-emotional-helpers. Merge into home controller hook. |
| `features/focus-identity/monthly-report/report-helpers.ts` | 44 | `calculateGrade` + `generateAIInsight` (placeholder stub). Tightly coupled to report, inline. |

---

## REVIEW — 17 files (ambiguous, needs human judgment)

| File | Lines | Why Ambiguous |
|------|-------|---------------|
| `features/ai-coach/analytics-helpers.ts` | 71 | `hashUserId` + `sanitizeContext` are generic analytics utils. Could be shared utils or stay in ai-coach. |
| `features/challenges/components/near-miss-helpers.ts` | 69 | Threshold constants + messages. Domain-specific but small enough to inline. |
| `features/challenges/components/challenge-hub-helpers.ts` | 63 | Filter logic for challenge hub. Could inline but has clear single responsibility. |
| `features/rescue-mode/rescue-mode-helpers.ts` | 59 | 5 functions for rescue mode. Clear domain but could be in rescue-mode service. |
| `features/analytics/repository/storage-helpers.ts` | 80 | Circuit breaker + checksum + supabase re-export. Mix of generic infra and domain logic. |
| `shared/monetization/components/paywall-banner-helpers.ts` | 81 | Paywall trigger messages + rate limiting. Clear domain but tightly coupled to banner. |
| `session/presets/preset-manager-helpers.ts` | 82 | Preset init + build + load. Could be in preset-manager but has clear SRP. |
| `screens/boss/boss-screen-helpers.tsx` | 85 | Boss copy constants + LockedFeatureScreen re-export. Mix of concerns. |
| `session/components/session-history-helpers.ts` | 86 | `formatDuration` (DUPLICATE) + status color + format date. Formatting utils, could be shared. |
| `features/ai-coach/services/coach-memory-helpers.ts` | 87 | Memory CRUD helpers. Could be in coach-memory service but reasonable size. |
| `features/settings/settings-builders.ts` | 90 | Settings builders. Clear domain, but could be in settings service. |
| `integrations/calendar/scheduler-helpers.ts` | 92 | Gap scoring + pattern analysis. Legitimate domain but overlaps with calendar-sync. |
| `session/components/combo-meter-helpers.ts` | 96 | Tier configs + formatting. Tightly coupled to combo-meter component. |
| `features/notifications/types-core.ts` | 98 | Type definitions only. Could merge into main types file but large enough to justify separation. |
| `features/challenges/challenge-bank-helpers.ts` | 67 | Challenge template querying. Clear domain but small. |
| `ai-coach/components/coach-helpers.ts` | 103 | Welcome messages + style helpers. Could be in coach component. |
| `features/session-completion/components/grade-reveal-helpers.tsx` | 69 | Particle config + grade colors + hexToRgba. Tightly coupled to grade-reveal but could be component's own config. |

---

## KEEP — 63 files (legitimate domain splits)

### Clear Domain Separation (types, algorithms, engines)

| File | Lines | Reason |
|------|-------|--------|
| `events/types/analytics-core.ts` | 122 | Large analytics event type definitions. Legitimate types-only split. |
| `features/achievements/definitions/streak-achievements-core.ts` | 100 | Achievement data definitions. Pure data, separate from logic. |
| `features/focus-identity/score-algorithm.main.ts` | 163 | Focus score algorithm. Single responsibility, reusable. |
| `features/notifications/SmartNotificationScheduler-generators.ts` | 172 | Notification content generators. Each generator is a distinct domain concept. |
| `features/session-completion/completion-experience-core.ts` | 166 | Completion experience types + builders. Large, distinct domain. |
| `features/session-completion/offline-sync-core.ts` | 143 | Offline sync integration. Distinct concern from completion logic. |
| `features/session-completion/story-beat-builders.ts` | 185 | Story beat generation. Distinct narrative domain. |
| `features/session-completion/grading-helpers.ts` | 67 | Grading algorithm. Clear single responsibility. |
| `session/engines/timer-engine-core.ts` | 192 | Timer engine. Core engine, clear boundary. |
| `session/engines/scoring/scoring-helpers.ts` | 159 | Scoring calculations. Mathematical domain. |
| `session/integration/session-reward-helpers.ts` | 187 | Session reward logic. Integration boundary. |
| `features/companion/growth-service-core.ts` | 142 | Companion growth service. Self-contained service. |
| `features/progression/service-xp-core.ts` | 145 | XP service operations. Core progression logic. |
| `features/settings/settings-core.ts` | 121 | Settings service core. Infrastructure + domain. |
| `features/lane-engine/lane-engine-helpers.ts` | 151 | Lane engine resolution. Complex algorithm, clear domain. |
| `features/mastery/mastery-helpers.ts` | 139 | Mastery system calculations. Distinct domain. |
| `features/home-experience/surface-helpers.ts` | 181 | Surface decision orchestration. Complex routing logic. |
| `features/home-experience/lane-surface-helpers.ts` | 100 | Lane surface application. Clear sub-domain. |
| `features/home-spine/priority-builders.ts` | 111 | Home priority construction. Distinct builder domain. |
| `features/ai-coach/intervention-detectors-core.ts` | 179 | Core intervention detection algorithms. Complex domain logic. |
| `features/ai-coach/quest-generators.ts` | 198 | Quest generation logic. Distinct domain. |
| `features/ai-coach/pipeline-helpers.ts` | 133 | Pipeline normalization + validation. Clear boundary. |
| `features/ai-coach/input-builders.ts` | 90 | Input contract builders. Clear single responsibility. |
| `features/ai-coach/repository/memories-core.ts` | 109 | Memory repository operations. Core repo split. |
| `features/ai-coach/services/intervention-engine-helpers.ts` | 176 | Intervention engine condition evaluation. Complex domain. |
| `features/ai-coach/services/message-generator-helpers.ts` | 191 | Message generator with caching. Complex domain. |
| `features/ai-coach/services/post-failure-helpers.ts` | 134 | Post-failure support sequences. Distinct domain. |
| `features/ai-coach/utils/retry-core.ts` | 124 | Retry logic with backoff. Reusable infrastructure. |
| `features/ai-coach/utils/timezone-core.ts` | 77 | Timezone utilities. Reusable, single concern. |
| `features/ai-coach/behavior-signal-helpers.ts` | 69 | Signal confidence + aggregation. Distinct algorithm. |
| `features/ai-coach/ai-helpers.ts` | 160 | Coach priority + suggestion generation. Core logic. |
| `features/weekly-intelligence/insight-builders/insight-builders.ts` | 176 | Weekly insight building. Distinct domain. |
| `features/achievements/achievement-helpers.ts` | 173 | Progression guide + achievement unlock logic. Complex domain, clear boundary. |
| `features/notifications/service-helpers.ts` | 110 | Notification service utilities. Rate limiting + quiet hours. |
| `features/onboarding/store-helpers.ts` | 178 | Onboarding store logic. Complex state management. |
| `features/personalization/experience-service-helpers.ts` | 124 | Experience resolution re-exports + execution loop. |
| `features/progression/first-week-pacing/progression-helpers.ts` | 70 | First-week progression calculations. Distinct domain. |
| `features/integration/economy-feed-helpers.ts` | 125 | Economy feed logic. Integration boundary. |
| `features/integration/social-feed-helpers.ts` | 196 | Social feed logic. Integration boundary. |
| `navigation/navigation-helpers.ts` | 129 | Navigation utilities. Reusable across app. |
| `accessibility/AccessibilityAuditor-helpers.ts` | 133 | Accessibility audit issue construction. Distinct domain. |
| `shared/analytics/use-analytics-core.ts` | 200 | Analytics hook with event tracking. Core shared infrastructure. |

### Component-Adjacent Helpers (clear separation of UI from logic)

| File | Lines | Reason |
|------|-------|--------|
| `features/achievements/components/AchievementUnlockToast.main.tsx` | 200 | Self-contained animated toast component. |
| `features/home-spine/components/BossPreviewCard.indicators.tsx` | 196 | Boss preview indicator sub-components. |
| `session/components/BossDamagePreview-helpers.tsx` | 124 | Boss health bar + damage UI sub-components. |
| `session/components/QualityIndicator-helpers.tsx` | 166 | Quality grade indicator UI components. |
| `session/components/checkpoint-celebration-helpers.ts` | 113 | Particle system + celebration messages. Distinct UI concern. |
| `screens/home/hooks/home-emotional-helpers.ts` | 193 | Emotional return reason generation. Complex text generation. |
| `screens/home/containers/engaged-home-helpers.ts` | 151 | Engaged home action builders. Complex navigation logic. |
| `screens/home/containers/power-user-home-helpers.ts` | 101 | Power-user return reason config. Distinct from engaged-home. |
| `screens/home/components/home-hero-card-helpers.ts` | 100 | Hero card icon/color resolution. |
| `features/content-study/screens/study-plan-helpers.tsx` | 196 | Study plan screen components + logic. |
| `features/monthly-report/components/report-content-helpers.tsx` | 100 | Report content display components. |
| `shared/ui/primitives/LoadingOverlay.main.tsx` | 108 | Self-contained loading overlay component. |
| `shared/ui/components/enter-animation-core.ts` | 58 | Enter animation config. Reusable animation utility. |
| `shared/ui/components/micro-reward-helpers.ts` | 44 | Micro-reward config. Reusable UI config. |
| `features/ai-coach/PredictiveInterventionEngine-helpers.ts` | 200 | Predictive engine calculations. Complex algorithm. |
| `shared/monetization/revenuecat-helpers.ts` | 79 | RevenueCat display info mapping. SDK boundary. |
| `shared/monetization/revenuecat-service-helpers.ts` | 106 | RevenueCat error normalization + entitlement checks. SDK boundary. |
| `session/hooks/useStudySession.return.ts` | 167 | Hook return type construction. Complex hook decomposition. |
| `features/session-start/setup-helpers.ts` | 77 | Session setup param parsing with Zod validation. Clear input parsing domain. |
| `features/coach-presence/service-helpers.ts` | 80 | Style resolution + presence building. Clear domain boundary. |
| `features/ai-coach/services/coach-memory-helpers.ts` | 87 | Memory creation/retrieval. Acceptable if service.ts is already large. |
| `features/analytics/components/data-export-helpers.tsx` | 192 | Data export screen with UI + logic. Large but self-contained. |

---

## CROSS-CUTTING ISSUES — Action Items

### 1. RepositoryError duplication (7+ definitions)
**Files affected:** streaks/repository-helpers.ts, challenges/repository-helpers.ts, focus-identity/repository-helpers.ts, ai-coach/repository/error.ts, plus 4 others.
**Action:** Create `src/lib/repository/error-handling.ts` as single source (already exists). Delete all other definitions and import from there.

### 2. mergeBusySlots duplication (3 definitions)
**Files affected:** calendar-sync-helpers.ts, google-calendar-helpers.ts, AppleCalendarAdapter.utils.ts
**Action:** Keep in calendar-sync-helpers.ts only. Remove from others.

### 3. isQuietHours duplication (2 definitions)
**Files affected:** ai-coach/services/notification-helpers.ts, notifications/service-helpers.ts
**Action:** Keep in notifications/service-helpers.ts. Import from there in ai-coach.

### 4. InsightBuilder + makeId boilerplate (4 identical copies)
**Files affected:** All 4 insight-builder files in memory-candidate/insight-builders/
**Action:** Extract `InsightBuilder` interface and `makeId` to the existing index.ts or a shared types file.

### 5. formatDuration duplication (20+ definitions)
**Files affected:** 20+ files across session, home-spine, content-study
**Action:** Create `src/utils/format.ts` with canonical `formatDuration`. Replace all local copies.

### 6. Files at exactly 200 lines (suspicious truncation)
- `AchievementUnlockToast.main.tsx` (200)
- `PredictiveInterventionEngine-helpers.ts` (200)
- `use-analytics-core.ts` (200)

**Action:** Verify these weren't artificially truncated at the 200-line limit. If they contain more logic that was cut, restore and split by domain.
