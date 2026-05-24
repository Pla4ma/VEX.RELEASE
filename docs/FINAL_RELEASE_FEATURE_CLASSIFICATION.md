# VEX Final Release Feature Classification

Generated 2026-05-23. Every feature in src/ classified by final release status.
This is the single source of truth for what ships, what's gated, and what's dead.

## A. FINAL_RELEASE_ACTIVE

Polished, production-ready, aligned with VEX identity. User-facing. Tested. Correctly gated.

| Feature | Location | Notes |
|---------|----------|-------|
| focus_session | features/session/, features/session-start/, screens/session/ | Core session loop |
| home_tab | screens/home/, features/home-spine/, features/home-experience/ | Adaptive Home |
| focus_tab | screens/focus/ (mapped via MainTabRoute) | Focus tab |
| profile_tab | screens/profile/ | Profile tab |
| progress_view | screens/progress/, features/progression/ (basic) | Streak/XP/level |
| ai_coach_basic | features/ai-coach/, features/coach-presence/ | Coach presence + companion |
| companion_detail | features/companion/, features/companion-promise/ | Visual coach |
| content_study | features/content-study/ | Study/Deep Work entry |
| advanced_settings | screens/settings/, features/settings/ | Settings & privacy |
| onboarding | screens/onboarding/, features/onboarding/ | Personalization onboarding |
| personalization | features/personalization/ | Motivation adaptation |
| session_completion | features/session-completion/ | Completion ledger + story |
| streaks | features/streaks/ | Streak tracking |
| notifications | features/notifications/ | Notification system |
| economy_basic | features/economy/ (XP/streak only) | Basic XP + streak rewards |
| focus_identity | features/focus-identity/ | Focus score |
| focus_contract | features/focus-contract/ | Session contracts |
| personal_bests | features/personal-bests/ | Personal best tracking |
| monetization | features/monetization/ (streak shield only) | Premium monetization |
| achievements | features/achievements/ | Achievement system |
| session_story | features/session-story/ | Post-session story |

## B. INTERNAL_CORE_REQUIRED

Required internally for progress/rewards/state. Not user-facing.

| Feature | Location | Notes |
|---------|----------|-------|
| reward_ledger | features/reward-ledger/ | Internal reward accounting |
| reward_service | features/rewards/service.ts | Reward delivery engine |
| event_bus | events/ | Internal event system |
| feature_flags | feature-flags/ | Feature flag engine |
| feature_access | features/liveops-config/feature-access.ts | Feature availability |
| persistence | persistence/ | Storage abstraction |
| supabase | supabase/ | DB client |
| api | api/ | API client |

## C. PROGRESSIVELY_UNLOCKED_ACTIVE

Production-ready, revealed later. Inert before unlock via FeatureAvailability.

| Feature | Location | Min Sessions | Notes |
|---------|----------|-------------|-------|
| boss_tab | features/boss/, screens/boss/ | 7 | Subtle for calm; visible for game-like |
| challenges | features/challenges/ | 5 | Session challenges |
| ai_coach_advanced | features/ai-coach/ | 8 | Deep Coach Memory (premium) |
| content_study_advanced | features/content-study/ | 18 | Advanced Study OS (premium) |
| quiz_review_mode | features/content-study/ | 10 | Quiz/review (premium) |
| premium_paywall | screens/paywall/ | 40 | Premium paywall (revenue gate) |

## D. ARCHIVED_OR_DEACTIVATED

Not part of final release. Must be fully inert at runtime. Code preserved for reference.

| Feature | Location | Status | Notes |
|---------|----------|--------|-------|
| shop | features/shop/ | disabled_beta | Shop UI + economy |
| inventory | features/inventory/ | disabled_beta | Item inventory |
| wallet | features/wallet/ | disabled_beta | Wallet UI |
| battle_pass | features/battle-pass/ | disabled_beta | Battle pass system |
| squads | features/squads/ | disabled_beta | Social squads |
| rivals | screens/RivalsScreen.tsx | disabled_beta | Rivals system |
| guild | (routed as Guild) | disabled_beta | Guild screen |
| leaderboard | (routed as Leaderboard) | disabled_beta | Leaderboards |
| wagers | features/economy/components/ | disabled_beta | Wager system |
| economy_advanced | features/economy/ (advanced) | disabled_beta | Full economy |
| gems_prominent | features/economy/ (premium currency) | disabled_beta | Premium currency |
| premium_chests | features/rewards/components/chest-reveal.tsx | disabled_beta | Chest rewards |
| seasonal_features | features/seasons/ | disabled_beta | Seasonal systems |
| streak_insurance | features/economy/StreakInsurance.ts | disabled_beta | Shop-based insurance |
| social_tab | features/social/, screens/social/ | disabled_beta | Social feed |
| community_boss | features/boss/SquadBossSystem.ts | disabled_beta | Community/squad boss |
| daily_login_rewards | features/rewards/daily-login-*.ts | disabled_beta | Daily login rewards |
| variable_rewards | features/rewards/variable-reward-*.ts | disabled_beta | Variable reward chests |
| streak_creature | features/retention/streak-creature-*.ts | disabled_beta | Creature system |
| near_miss | features/retention/near-miss-*.ts | disabled_beta | Near miss hooks |
| comeback_quest | features/streaks/comeback/ | disabled_beta | Comeback quest system |
| session_stakes | features/session/session-stakes.ts | disabled_beta | Session wagering |
| themes_shop | features/themes/ThemeShopModal.tsx | disabled_beta | Theme shop |
| mastery | features/mastery/ | disabled_beta | Mastery system |
| daily_mission | features/daily-mission/ | disabled_beta | Daily missions |
| weekly_quests | features/weekly-quests/ | disabled_beta | Weekly quests |
| retention | features/retention/ | disabled_beta | Retention systems |
| integration/social | features/integration/social-feed.ts | disabled_beta | Social integration |
| integration/economy | features/integration/economy-feed.ts | disabled_beta | Economy integration |

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
- FEATURE_RELEASE_STATES set to `disabled_beta`
- Listed in `DISABLED_FEATURES` array
- PUBLIC_V1_FEATURE_MAP status set to `hidden`

All PROGRESSIVELY_UNLOCKED features must pass:
- `isFeatureAvailableForQueries()` before any query/subscription
- `isFeatureAvailableForNavigation()` before any route entry
- Must be inert before minimum session threshold
