# VEX Final Release Feature Classification

Generated 2026-05-23. Every feature in src/ classified by final release status.
This is the single source of truth for what ships, what's gated, and what's dead.

## A. FINAL_RELEASE_ACTIVE

Polished, production-ready, aligned with VEX identity. User-facing. Tested. Correctly gated.

| Feature | Location | FeatureKey | Notes |
|---------|----------|------------|-------|
| focus_session | features/session/, features/session-start/, screens/session/ | focus_session | Core session loop |
| home_tab | screens/home/, features/home-spine/, features/home-experience/ | home_tab | Adaptive Home |
| focus_tab | screens/focus/ (mapped via MainTabRoute) | focus_tab | Focus tab |
| profile_tab | screens/profile/ | profile_tab | Profile tab |
| progress_view | screens/progress/, features/progression/ (basic) | progress_view | Streak/XP/level |
| ai_coach_basic | features/ai-coach/, features/coach-presence/ | ai_coach_basic | Coach presence + companion |
| companion_detail | features/companion/, features/companion-promise/ | companion_detail | Visual coach |
| content_study | features/content-study/ | content_study | Study/Deep Work entry |
| advanced_settings | screens/settings/, features/settings/ | advanced_settings | Settings & privacy |
| onboarding | screens/onboarding/, features/onboarding/ | — (route-gated) | Personalization onboarding |
| personalization | features/personalization/ | — (internal) | Motivation adaptation |
| session_completion | features/session-completion/ | — (core) | Completion ledger + story |
| streaks | features/streaks/ | — (core) | Streak tracking |
| notifications | features/notifications/ | — (system) | Notification system |
| focus_identity | features/focus-identity/ | — (core) | Focus score |
| focus_contract | features/focus-contract/ | — (core) | Session contracts |
| personal_bests | features/personal-bests/ | — (core) | Personal best tracking |
| session_history | features/session-history/ | — (core) | Past session viewing |
| session_recommendation | features/session-recommendation/ | — (core) | Next session suggestions |
| learning_execution | features/learning-execution/ | — (core) | Learning execution layer |
| session_events | features/session-events/ | — (system) | Session event bus |

## B. INTERNAL_CORE_REQUIRED

Required internally for progress/rewards/state. Not user-facing.

| Feature | Location | Notes |
|---------|----------|-------|
| reward_ledger | features/reward-ledger/ | Internal reward accounting |
| reward_service | features/rewards/ (service.ts only) | Reward delivery engine |
| economy_internal | features/economy/ (XP ledger only) | XP/streak ledger, no user wallet |
| monetization | features/monetization/ | RevenueCat + paywall layer |
| event_bus | events/ | Internal event system |
| feature_flags | feature-flags/ | Feature flag engine |
| feature_access | features/liveops-config/ | Feature availability |
| feature_gate | features/feature-gate/ | Feature gate runtime |
| analytics | features/analytics/ | Telemetry + Sentry |
| account_deletion | features/account-deletion/ | Account management |
| integration | features/integration/ | External integration layer |
| persistence | src/persistence/ | Storage abstraction |
| supabase | src/supabase/ | DB client |
| api | src/api/ | API client |

## C. PROGRESSIVELY_UNLOCKED_ACTIVE

Production-ready, revealed later. Inert before unlock via FeatureAvailability.

| Feature | Location | FeatureKey | Min Sessions | Notes |
|---------|----------|------------|-------------|-------|
| boss_tab | features/boss/, screens/boss/ | boss_tab | 7 | Subtle for calm; visible for game-like |
| challenges | features/challenges/ | challenges | 5 | Session challenges |
| ai_coach_advanced | features/ai-coach/ | ai_coach_advanced | 8 | Deep Coach Memory (premium) |
| content_study_advanced | features/content-study/ | content_study_advanced | 18 | Advanced Study OS (premium) |
| quiz_review_mode | features/content-study/ | quiz_review_mode | 10 | Quiz/review (premium) |
| achievements | features/achievements/ | achievements | 3 | Achievement system |
| companion_detail | features/companion/ | companion_detail | 3 | Companion visual detail |
| premium_paywall | screens/paywall/ | premium_paywall | 40 | Premium paywall (revenue gate) |
| themes_visual | features/themes/ (visual only) | — (no key) | — | Visual themes, no shop |

## D. ARCHIVED_OR_DEACTIVATED

Not part of final release. Must be fully inert at runtime. Code preserved for reference.

| Feature | Location | Status | Notes |
|---------|----------|--------|-------|
| shop | features/shop/ | final_release_deactivated | Shop UI + economy |
| inventory | features/inventory/ | final_release_deactivated | Item inventory |
| wallet | features/wallet/ | final_release_deactivated | Wallet UI |
| items | features/items/ | final_release_deactivated | Items data |
| battle_pass | features/battle-pass/ | final_release_deactivated | Battle pass system |
| squads | features/squads/ | final_release_deactivated | Social squads |
| rivals | (no separate folder, in feature map) | final_release_deactivated | Rivals system |
| guild | (routed as Guild) | final_release_deactivated | Guild screen |
| leaderboard | (no separate folder, in feature map) | final_release_deactivated | Leaderboards |
| wagers | (no separate folder, in feature map) | final_release_deactivated | Wager system |
| gems_prominent | (no separate folder, in feature map) | final_release_deactivated | Premium currency |
| seasonal_features | features/seasons/ | final_release_deactivated | Seasonal systems |
| boss_realtime | features/boss-realtime/ | final_release_deactivated | Community/squad boss realtime |
| spectacle | features/spectacle/ | final_release_deactivated | Visual spectacle events |
| live_ops | features/live-ops/ | final_release_deactivated | Live ops system |
| social | features/social/ | final_release_deactivated | Social feed |
| mastery | features/mastery/ | final_release_deactivated | Mastery system |
| daily_mission | features/daily-mission/ | final_release_deactivated | Daily missions |
| weekly_quests | features/weekly-quests/ | final_release_deactivated | Weekly quests |
| retention | features/retention/ | final_release_deactivated | Retention systems |
| emotion_retention | features/emotion-retention/ | final_release_deactivated | Emotional retention hooks |
| monthly_report | features/monthly-report/ | final_release_deactivated | Monthly report (deferred) |
| themes_shop | features/themes/ThemeShopModal.tsx | final_release_deactivated | Theme shop (visual themes OK) |

## E. UNRESOLVED — RESOLVED

All features now classified. No NEEDS_DECISION items remain.

| Folder | Classification | Rationale |
|--------|---------------|-----------|
| learning-execution | FINAL_RELEASE_ACTIVE | Core learning execution layer |
| session-events | FINAL_RELEASE_ACTIVE | Session event bus (system) |
| session-history | FINAL_RELEASE_ACTIVE | Past session viewing |
| session-recommendation | FINAL_RELEASE_ACTIVE | Next session suggestions |
| themes | FINAL_RELEASE_ACTIVE (visual) / ARCHIVED (shop) | Visual themes active, shop hidden |
| account-deletion | INTERNAL_CORE_REQUIRED | Account management |
| analytics | INTERNAL_CORE_REQUIRED | Telemetry + Sentry |
| feature-gate | INTERNAL_CORE_REQUIRED | Feature gate runtime |
| integration | INTERNAL_CORE_REQUIRED | External integration layer |
| boss-realtime | ARCHIVED_OR_DEACTIVATED | Community/squad boss |
| emotion-retention | ARCHIVED_OR_DEACTIVATED | Emotional retention hooks |
| items | ARCHIVED_OR_DEACTIVATED | Items data (no inventory UI) |
| live-ops | ARCHIVED_OR_DEACTIVATED | Live ops system |
| monthly-report | ARCHIVED_OR_DEACTIVATED | Monthly report (deferred) |
| spectacle | ARCHIVED_OR_DEACTIVATED | Visual spectacle events |

## E. TEST_OR_LEGACY_ONLY

Test-only or historical. Cannot affect runtime.

| Feature | Location | Notes |
|---------|----------|-------|
| archive | archive/ | Archived code |
| docs/archive | docs/archive/ | Historical docs |
| __tests__ in archived features | Test files for archived features | Keep for reference |

> **Note:** `src_impl_archive/` was deleted 2026-05-23 after verification confirmed
> no runtime, build, test, or config dependency. Source migration from `src_impl`
> to `src/` is complete.

## Runtime Enforcement

All ARCHIVED_OR_DEACTIVATED features have:
- FEATURE_THRESHOLDS set to `Number.POSITIVE_INFINITY` in feature-access-config.ts
- FEATURE_RELEASE_STATES set to `final_release_deactivated`
- Listed in `DISABLED_FEATURES` array
- FINAL_RELEASE_FEATURE_MAP status set to `hidden`

All PROGRESSIVELY_UNLOCKED features must pass:
- `isFeatureAvailableForQueries()` before any query/subscription
- `isFeatureAvailableForNavigation()` before any route entry
- Must be inert before minimum session threshold
