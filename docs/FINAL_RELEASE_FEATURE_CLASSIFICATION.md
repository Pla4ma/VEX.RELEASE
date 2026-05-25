# VEX Final Release Feature Classification

Generated 2026-05-23. Updated 2026-05-25 to match source classification in code.
**Source of truth:** `src/features/liveops-config/final-release-classification.ts`
This doc generated from that source. Docs match code. Code is authoritative.

---

## A. FINAL_RELEASE_ACTIVE

Polished, production-ready, aligned with VEX identity. User-facing. Tested. Correctly gated.

| System ID | Folder | FeatureKey | minSessions | Notes |
|-----------|--------|------------|-------------|-------|
| focus_session | session | focus_session | 0 | Core session loop |
| session_start | session-start | — | 0 | Session start flow |
| session_completion | session-completion | — | 0 | Completion ledger + adaptive payoff. Does **NOT** include PostSessionStory (archived). |
| home_experience | home-experience | home_tab | 0 | Adaptive Home |
| home_spine | home-spine | home_tab | 0 | Home navigation spine |
| ai_coach_basic | ai-coach | ai_coach_basic | 0 | Coach presence + basic companion. Advanced coach (ai_coach_advanced) is progressive. |
| coach_presence | coach-presence | ai_coach_basic | 0 | Coach presence rendering |
| progression | progression | progress_view | 0 | Streak/XP/level. Always active. |
| streaks | streaks | — | 0 | Streak tracking |
| focus_contract | focus-contract | — | 0 | Session contracts |
| focus_identity | focus-identity | — | 0 | Focus score |
| personal_bests | personal-bests | — | 0 | Personal best tracking |
| session_history | session-history | — | 0 | Past session viewing |
| session_recommendation | session-recommendation | — | 0 | Next session suggestions |
| session_events | session-events | — | 0 | Session event bus (system-only, no UI) |
| learning_execution | learning-execution | — | 0 | Learning execution layer |
| notifications_system | notifications | — | 0 | Notification system |
| onboarding | onboarding | — | 0 | One-time onboarding flow (route-gated) |
| personalization | personalization | — | 0 | Motivation adaptation engine (internal, no direct UI) |
| themes_visual | themes | — | 0 | Visual themes only. ThemeShopModal is archived. |

---

## B. FINAL_RELEASE_PROGRESSIVE

Production-ready, revealed after N sessions. Inert before unlock.

| System ID | Folder | FeatureKey | minSessions | Premium | Notes |
|-----------|--------|------------|-------------|---------|-------|
| companion_detail | companion | companion_detail | 3 | No | Companion visual detail |
| challenges | challenges | challenges | 5 | No | Session challenges |
| achievements | achievements | achievements | 6 | No | Achievement system |
| boss | boss | boss_tab | 7 | No | Boss momentum (subtle for calm, visible for game-like) |
| ai_coach_advanced | ai-coach | ai_coach_advanced | 8 | **Yes** | Deep Coach Memory. Premium-gated. |
| quiz_review_mode | content-study | quiz_review_mode | 10 | **Yes** | Quiz & review. Premium-gated. |
| content_study | content-study | content_study | 12 | No | Study / Deep Work entry |
| advanced_settings | settings | advanced_settings | 12 | No | Settings & privacy |
| content_study_advanced | content-study | content_study_advanced | 18 | **Yes** | Advanced Study OS. Premium-gated. |
| premium_paywall | monetization | premium_paywall | 40 | No | Premium paywall (revenue-gated, not session-gated) |

**Correction:** `content_study` was listed under active in old docs. Actual threshold is 12 → progressive. `premium_paywall` minSessions was 5 in old map; actual threshold is 40.

---

## C. FINAL_RELEASE_INTERNAL

Required internally for progress/rewards/state. Not user-facing.

| System ID | Folder | Notes |
|-----------|--------|-------|
| reward_ledger | reward-ledger | Internal reward accounting |
| rewards_service | rewards | Reward delivery engine |
| economy_xp_ledger | economy | XP/streak ledger. User-facing wallet/shop/gems are **archived**. |
| monetization_layer | monetization | RevenueCat + paywall infrastructure. User-facing paywall is progressive. |
| feature_gate | feature-gate | Feature gate runtime |
| liveops_config | liveops-config | Feature availability + health checks |
| analytics_telemetry | analytics | Telemetry + Sentry |
| account_deletion | account-deletion | Account management |
| integration | integration | External integration layer |
| companion_promise | companion-promise | Companion promise infrastructure |

---

## D. ARCHIVED_OR_DEACTIVATED

Not part of final release. Must be fully inert at runtime. Code preserved for reference.

| System ID | Folder | FeatureKey | Notes |
|-----------|--------|------------|-------|
| shop | shop | shop | Shop UI + economy |
| inventory | inventory | inventory | Item inventory |
| wallet | wallet | — | Wallet UI |
| items | items | — | Items data (no inventory UI) |
| battle_pass | battle-pass | battle_pass | Battle pass system |
| squads | squads | squads | Social squads |
| boss_realtime | boss-realtime | boss_bounties | Community/squad boss realtime |
| spectacle | spectacle | — | Visual spectacle events |
| live_ops | live-ops | — | Live ops system |
| social | social | social_tab | Social feed |
| mastery | mastery | — | Mastery system |
| daily_mission | daily-mission | — | Daily missions |
| weekly_quests | weekly-quests | — | Weekly quests |
| retention | retention | — | Retention systems |
| emotion_retention | emotion-retention | — | Emotional retention hooks |
| monthly_report | monthly-report | — | Monthly report (deferred) |
| seasons | seasons | seasonal_features | Seasonal systems |
| session_story | session-story | — | **PostSessionStory route.** NOT session_completion narrative. |
| themes_shop | themes | — | Theme shop (same folder as themes_visual; shop is deactivated) |
| economy_user_facing | economy | economy_basic | User wallet/shop/rewards UI. XP ledger (internal) is active. |

**Resolution:** `companion_detail` is progressive only (was incorrectly listed in both active and progressive). `session_completion` does NOT include story — `session_story` is separately archived. `economy` has 2 entries: `economy_xp_ledger` (internal, active) and `economy_user_facing` (archived).

---

## E. TEST_OR_LEGACY

Test-only or historical. Cannot affect runtime.

| System ID | Folder | Notes |
|-----------|--------|-------|
| features_tests | `__tests__` | Cross-feature test directory. Test-only. |

---

## Multi-Feature Folders (Unambiguous)

These folders contain multiple classification entries. Each must be checked independently.

| Folder | Active entries | Archived entries |
|--------|---------------|------------------|
| ai-coach | `ai_coach_basic` (active) | — |
| ai-coach | `ai_coach_advanced` (progressive, premium) | — |
| content-study | `content_study` (progressive) | — |
| content-study | `quiz_review_mode` (progressive, premium) | — |
| content-study | `content_study_advanced` (progressive, premium) | — |
| economy | `economy_xp_ledger` (internal) | `economy_user_facing` (archived) |
| monetization | `monetization_layer` (internal) | — |
| monetization | `premium_paywall` (progressive) | — |
| themes | `themes_visual` (active) | `themes_shop` (archived) |

---

## Runtime Enforcement

All ARCHIVED_OR_DEACTIVATED features:
- routeAllowed = false
- homeAllowed = false
- queryAllowed = false
- subscriptionAllowed = false
- notificationAllowed = false
- completionAllowed = false
- premiumCopyAllowed = false
- appStoreCopyAllowed = false

All PROGRESSIVE features:
- Inert before minSessions threshold
- routeAllowed = true, queryAllowed = true after unlock
- Premium-gated features additionally require RevenueCat health

**Enforcement tests:** `src/features/liveops-config/__tests__/classification-enforcement.test.ts`

---

## Remaining Ambiguity: Resolved

| Issue | Old state | Resolution |
|-------|-----------|------------|
| companion_detail in active + progressive | Listed in both sections | Progressive only (minSessions=3) |
| session_completion mentions "story" | "ledger + story" | "ledger + adaptive payoff" — PostSessionStory is separately archived |
| premium_paywall minSessions mismatch | Docs said 5, config said 40 | Config is 40. Docs corrected. |
| content_study in active | Listed as active | Progressive (minSessions=12) |
| economy boundaries | Unclear what's active | 2 entries: `economy_xp_ledger` (internal) + `economy_user_facing` (archived) |
| advanced_settings in active | Listed as active in old docs | Progressive (minSessions=12) |
| ai_coach_advanced in progressive | Listed progressive, no premium note | Progressive + premiumCopyAllowed=true |

No remaining ambiguity. All systems classified. Docs match code.
