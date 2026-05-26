# VEX Product Spine

> **Frozen product truth.** Every system decision traces back to this document.
> Version: 1.0.0 | Last updated: 2026-05-25

---

## Product Identity

| Element | Value |
|---------|-------|
| **Primary promise** | VEX is the productivity app that changes based on how you work. |
| **Secondary promise** | VEX learns how I focus and unlocks the right productivity system for me. |
| **Marketing face** | Personalized productivity first, lanes second. |
| **Lane model** | Four internal lanes, not four separate apps. Moderate differentiation. |

## Lane Names

| User-facing | Internal | Description |
|-------------|----------|-------------|
| Study | `student` | Structured learning, deadlines, review loops |
| Run | `game_like` | Boss-driven, modifiers, mastery achievements |
| Project | `deep_creative` | Flow windows, continuity memory, next moves |
| Clean | `minimal_normal` | Today strip, clean sessions, quiet progress |

## Lane Lifecycle

```
Onboarding → Lane Engine resolves initial profile →
  User confirms (can change anytime) →
    Lane Engine re-evaluates after 3+ sessions →
      Manual override always wins
```

## Locked Design Decisions

| # | Decision | Constraint |
|---|----------|------------|
| D1 | Day 0 max surfaces: 6 | Enforced by `enforceDay0SurfacePolicy` |
| D2 | Student Day 0: tiny Study OS preview only, no import/upload | Enforced by `content-study-visibility` |
| D3 | XP: internal universal ledger, surfaced differently by lane | No visible XP-first UI |
| D4 | Companion: visual face of Coach, not separate pet economy | No companion economy systems |
| D5 | Rescue: visible after avoidance signal or detection, not always on Home | Event-driven, not static |
| D6 | Memory Console: visible after 3 sessions | `CoachPresence` confidence gate |
| D7 | Premium: durable personalized value only | No coins, gems, shop, wagers, paid recovery |
| D8 | Agent readiness: internal service APIs only, no visible agent gimmick | No "Ask VEX" surface |
| D9 | First-session completion as retention gate | 7-day optimization window |
| D10 | Gamification: subtle everywhere, full RPG only for Game-like users | `LaneMechanicPolicy.blockedMechanics` enforces |

---

## Decision Systems

### 1. Lane Engine

**File**: `src/features/lane-engine/service.ts`
**Entry points**: `resolveInitialLane()`, `resolveBehaviorLane()`, `mergeLaneProfiles()`, `shouldReconsiderLane()`

**Resolves**:

| Output | Type | Description |
|--------|------|-------------|
| `primaryLane` | `Lane` | Recommended lane |
| `secondaryLane` | `Lane \| null` | Second-closest lane if scores close |
| `confidence` | `number` (0-1) | Signal strength |
| `confidenceBand` | `'low' \| 'medium' \| 'high'` | Binned confidence |
| `source` | `'onboarding' \| 'behavior' \| 'manual_override' \| 'fallback'` | Provenance |
| `traits` | `LaneTraits` | Needs/wants vector (structure, play, continuity, quiet) |
| `evidence` | `LaneEvidence[]` | Weighted signals that produced this profile |

**Allowed mechanics**: Via `getLaneMechanicPolicy(profile)` → `preferredMechanics` + `blockedMechanics`
**Tone**: Via `getLanePresentationPolicy({ lane, reducedMotion })` → animation, copy tone, density, visual feeling
**Unlock cadence**: Implicit — behavior re-evaluates after 3+ sessions; `shouldReconsiderLane()` triggers lane change prompt

**Scoring weights** (`scoring.ts`):

| Input | student | game_like | deep_creative | minimal_normal |
|-------|---------|-----------|---------------|----------------|
| goal=study/learning | +0.55 | 0 | +0.10 | 0 |
| goal=creative | 0 | 0 | +0.55 | +0.05 |
| goal=work/focus | +0.10 | 0 | +0.25 | +0.25 |
| goal=personal | 0 | +0.05 | +0.10 | +0.35 |
| style=study_focused | +0.60 | 0 | +0.15 | 0 |
| style=game_like/intense | 0 | +0.60 | 0 | 0 |
| style=calm | 0 | -0.20 | +0.05 | +0.50 |
| style=coach_led/friendly | +0.15 | +0.05 | +0.15 | +0.20 |
| studyUsageRatio≥0.35 | +0.35 | 0 | +0.10 | 0 |
| deepCreativeUsageRatio≥0.35 | 0 | 0 | +0.40 | 0 |
| bossEngagement=high | 0 | +0.35 | 0 | -0.20 |
| bossDismissals≥3 | 0 | -0.35 | 0 | +0.25 |

---

### 2. FeatureAvailability

**File**: `src/features/liveops-config/` (remote config) + `src/features/home-experience/surface-decision-schemas.ts` (local gate)

**Decides**:

| Gate | Mechanism | Example |
|------|-----------|---------|
| `canRender` | Remote feature flag `isUnlocked` | Boss tab hidden if `boss_tab.isUnlocked === false` |
| `canRoute` | `routeGates` in `VexExperience` | Boss route blocked until 1+ session |
| `canQuery` | Repository-level checks | Supabase queries gated by `canQuery` |
| `canSubscribe` | Real-time channel gating | No subscription if feature unavailable |
| `canNotify` | `allowedNotificationTypes` in `VexExperience` | Study notifications only if study available |
| `canAppearInCompletion` | `completionSequence` in `VexExperience` | Boss effect only if boss visible |

---

### 3. FirstWeek

**File**: `src/features/personalization/first-week-lane-copy.ts`, `first-week-schemas.ts`

**Decides**:

| Stage | Pacing |
|-------|--------|
| `DAY_0_NOT_STARTED` | Lane-specific starter message, 6 surfaces max, no unsolicited notifications |
| `DAY_1_2_EARLY` | Second session encouragement, boss remains subtle |
| `DAY_3_5_CADENCE` | Pattern messages, weekly quest eligible |
| `DAY_5_PATH_FORMING` | Lane path explanation, experiment suggestion |
| `DAY_7_DEEPER_MODE` | Weekly intelligence, premium soft tease eligible |

**Consumes**: `LaneProfile` via `resolveLaneCopy(stage, laneProfile, fallbackMessage)` — the canonical API.
**Also consumes**: Raw `Lane` for `resolveFirstWeekExperiment(lane, stage)` — lane-specific copy.

---

### 4. HomeSurfaceDecision

**File**: `src/features/home-experience/home-surface-decision.ts`
**Entry point**: `decideHomeSurfaces(input)` → `HomeSurfaceMap`

**Decides**: Which of ~22 surface keys are visible, and at what prominence level:

| Level | Meaning |
|-------|---------|
| `hidden` | Not rendered, no query, no subscription |
| `tiny_tease` | Small hint, no full interaction |
| `secondary` | Visible but not dominant |
| `primary` | Main CTA |
| `spotlight` | Hero surface |
| `blocked` | Visible as unavailable |

**Current behavior**: Uses both `LaneProfile` (via `parsed.laneProfile?.primaryLane`) AND fallback `motivationStyle`/`primaryGoal`/`gamificationIntensity` checks. **Transitional — Phase 2 moves to LaneProfile-only.**

---

### 5. SessionStart

**File**: `src/features/session-start/service.ts`
**Entry point**: `buildLaneSessionBrief({ lane, durationSeconds, isOffline, isRescue })` → `LaneSessionBrief`

**Decides**:

| Lane | Session Mode | CTA | Focus Strategy |
|------|-------------|-----|----------------|
| `student` | `STUDY` | "Start study block" | Phone away, one tab, notes open |
| `game_like` | `SPRINT` | "Start encounter" | Phone away, one tab, notes open |
| `deep_creative` | `CREATIVE` | "Resume project block" | Phone away, one tab, notes open |
| `minimal_normal` | `LIGHT_FOCUS` | "Start clean session" | Phone away, one tab, notes open |

**Consumes**: Raw `Lane` type directly. Should consume `LaneProfile` to also read confidence and traits for richer setup.

---

### 6. Completion

**File**: `src/session/engines/CompletionEngine.ts`
**Entry point**: `createCompletionEngine()` → session completion pipeline

**Decides**:

| Output | Source |
|--------|--------|
| `memoryCandidates` | Session data → Coach memory store |
| `reflection` | `coach-presence/service.ts` → `buildCompletionCoachPresence()` |
| `nextAction` | `coach-presence/copy-service.ts` → `resolveIntent()` + `resolveActionLabel()` |
| `laneEvidenceUpdate` | `lane-engine` re-evaluation trigger (behavior signals) |

**Consumes**: `CoachPresenceMotivationStyle` (derived from personalization). Should consume `LaneProfile` for lane-specific completion copy.

---

### 7. CoachPresence

**File**: `src/features/coach-presence/service.ts`, `copy-service.ts`
**Entry points**: `buildCoachPresence()`, `buildCompletionCoachPresence()`, `getCoachPresenceMessage()`

**Decides**:

| Output | Mechanism |
|--------|-----------|
| `message` | Lane/style-aware copy (96 char max) |
| `tone` | `calm \| warm \| direct \| playful \| sharp \| studious` |
| `visualMood` | `steady \| focused \| celebrating \| recovering \| ready` |
| `safeIntent` | `START_SESSION \| START_STUDY_SESSION \| REVIEW_PROGRESS \| TAKE_BREAK \| ...` |
| `displayMode` | `quiet \| welcome \| reflection \| pattern \| intervention` |
| `shouldShow` | Boolean gate |

**Current behavior**: Uses `CoachPresenceMotivationStyle` enum directly for tone/mood/style mapping. **Allowed as presentation branch (Category A).** Phase 2 should add FocusProfile consumption for richer context-awareness.

---

## Architecture Rule (Hard)

```
┌─────────────────────────────────────────────────────┐
│                  LANE ENGINE                         │
│  (src/features/lane-engine/service.ts)              │
│                                                     │
│  Input: primaryGoal, motivationStyle, sessionMode,  │
│         studyUsageRatio, bossEngagement, etc.        │
│  Output: LaneProfile { primaryLane, confidence, ... }│
└──────────────┬──────────────────────────────────────┘
               │ LaneProfile
               ▼
┌──────────────────────────────────────────────────────┐
│              ALL OTHER SYSTEMS                        │
│                                                      │
│  Home, SessionStart, Completion, CoachPresence,      │
│  NotificationPolicy, FirstWeek, FeatureAvailability,  │
│  Boss Display, Content Study, Monetization            │
│                                                      │
│  RULE: Consume LaneProfile, NEVER infer lane directly │
└──────────────────────────────────────────────────────┘
```

**Only the lane-engine may:**
- Compare `motivationStyle`, `primaryGoal`, `sessionMode` to determine lane
- Map raw signals to LaneProfile

**Everything else:**
- Reads `LaneProfile.primaryLane`, `.confidence`, `.traits`
- Reads `LaneMechanicPolicy.preferredMechanics`, `.blockedMechanics`
- Reads `LanePresentationPolicy` for visual/tone decisions
- NEVER branches on raw `motivationStyle`, `primaryGoal`, `gamificationIntensity` outside presentation tone mapping

**Approved exceptions**:
1. **Presentation tone maps** (CoachPresence TONE_MAP, MOOD_MAP) — these are style→visual mappings, not lane inference
2. **Lane-engine tests** — by definition test lane inference
3. **Migration adapters** — temporary, explicitly marked with `// MIGRATION_ADAPTER: remove when X consumes LaneProfile`

---

## Surface Inventory (Day 0-7)

| Surface Key | Day 0 | Day 1-2 | Day 3-5 | Day 6+ |
|-------------|-------|---------|---------|--------|
| `start_session` | primary | primary | primary | primary |
| `coach_presence` | tiny_tease | secondary | secondary | secondary |
| `progress_proof` | hidden | secondary | secondary | secondary |
| `focus_score` | hidden | tiny_tease | secondary | secondary |
| `progress_detail` | hidden | hidden | secondary | secondary |
| `study_layer` | tiny_tease* | secondary* | secondary* | secondary* |
| `companion_thread` | tiny_tease† | hidden | tiny_tease | tiny_tease |
| `boss_teaser` | hidden‡ | hidden | tiny_tease | tiny_tease |
| `boss_compact` | hidden | hidden | hidden | secondary§ |
| `boss_full_cta` | blocked | hidden | hidden | hidden |
| `challenge_teaser` | hidden | hidden | tiny_tease | tiny_tease |
| `unlock_strip` | tiny_tease | secondary | hidden | hidden |
| `premium_tease` | hidden | hidden | hidden | tiny_tease¶ |
| `weekly_quest` | hidden | hidden | hidden | secondary# |
| `study_os` | hidden* | tiny_tease* | secondary* | secondary* |
| `run_board` | hidden§ | tiny_tease§ | secondary§ | secondary§ |
| `project_thread` | hidden♢ | tiny_tease♢ | secondary♢ | secondary♢ |
| `today_strip` | hidden□ | tiny_tease□ | secondary□ | secondary□ |
| `rescue_cta` | tiny_tease | secondary | secondary | secondary |
| `memory_insight` | hidden | hidden | hidden | tiny_tease** |
| `weekly_intelligence` | hidden | hidden | hidden | tiny_tease¶ |
| `focus_window` | hidden | hidden | hidden | secondary♢ |

\* Study lane users only
† Friendly motivation style only
‡ Unless first-week boss set or game-like user
§ Game-like lane users only
¶ Premium available + 5+ sessions
\# 10+ sessions
♢ Deep creative lane users only
□ Minimal normal lane users only
** 3+ coach interactions

---

## Migration Roadmap

| Phase | Status | Scope |
|-------|--------|-------|
| **Phase 0** | ✅ Current | Product spine doc, anti-drift audit, hard rule, tests |
| **Phase 1** | 🔜 | Migrate Home to pure LaneProfile consumption |
| **Phase 2** | 🔜 | Migrate SessionStart, Completion, CoachPresence |
| **Phase 3** | 🔜 | Migrate Boss, ContentStudy, Monetization |
| **Phase 4** | 🔜 | Remove migration adapters, enforce at CI level |
