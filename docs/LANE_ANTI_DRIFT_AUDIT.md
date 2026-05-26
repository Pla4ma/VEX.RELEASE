# Lane Anti-Drift Audit

> **Phase 1 finding.** Every location outside `lane-engine/` that infers lane directly from raw signals.
> Generated: 2026-05-25

---

## Audit Summary

| Category | Count | Description |
|----------|-------|-------------|
| **A - Allowed presentation branch** | 12 | Style/visual tone mapping — not lane inference |
| **B - Should consume LaneProfile** | 18 | Currently branching on raw signals where LaneProfile would be correct |
| **C - Legacy/stale logic** | 0 | No dead code found in active source |
| **D - Test-only** | 1 | Test file with raw signal usage |

---

## Full Audit Table

### B - Should consume LaneProfile

| # | File | Line(s) | Pattern | Recommendation |
|---|------|---------|---------|----------------|
| B1 | `home-experience/lane-surface-helpers.ts` | 15-21 | `isStudyCueUser()` checks `motivationStyle === 'study_focused' \|\| 'student'` | Replace with `laneProfile.primaryLane === 'student'` when available; fallback to `canonicalLane` |
| B2 | `home-experience/lane-surface-helpers.ts` | 38-46 | `isGameLike`/`isDeepCreative`/`isMinimal` fallback to raw `motivationStyle`, `primaryGoal`, `gamificationIntensity` when canonicalLane absent | Already has `canonicalLane` check first — **partial migration in progress**. Remove fallback branch in Phase 2. |
| B3 | `home-experience/home-surface-decision.ts` | 57 | `isCalmUser = p.motivationStyle === 'calm'` | Should read `laneProfile.primaryLane === 'minimal_normal'` |
| B4 | `home-experience/home-surface-decision.ts` | 104-107 | `isStudyUser` checks `motivationStyle === 'study_focused' \|\| 'student' \|\| primaryGoal === 'study' \|\| 'learning'` | Should read `laneProfile.primaryLane === 'student'` |
| B5 | `home-experience/home-surface-decision.ts` | 119 | `p.motivationStyle === 'friendly'` for companion thread | Should consume `laneProfile.traits.wantsPlay` for companion intensity |
| B6 | `home-experience/surface-helpers.ts` | 17-20 | `isStudyCueUser()` identical copy of B1 | Same fix as B1 |
| B7 | `home-experience/surface-helpers.ts` | 73-75 | `isGameLikeUser` checks `motivationStyle === 'game_like' \|\| 'intense' \|\| gamificationIntensity === 'strong'` | Should consume `laneProfile.primaryLane === 'game_like'` |
| B8 | `home-experience/surface-helpers.ts` | 86, 131 | `isCalmUser` checks `motivationStyle === 'calm'` | Should consume `laneProfile.primaryLane === 'minimal_normal'` |
| B9 | `home-experience/surface-helpers.ts` | 106, 148, 152 | `p.motivationStyle === 'friendly' \|\| 'coach_led'` | Should consume `laneProfile.traits.wantsPlay` |
| B10 | `boss/display-policy.ts` | 66-68 | `isCalm`/`isGameLike`/`isIntense` branches on raw `motivationStyle` | Should accept `LaneProfile` and branch on `primaryLane` + `traits` |
| B11 | `boss/display-policy.ts` | 196, 221 | `useBossDisplayPolicy` reads `explicitMotivationStyle` from onboarding store | Should read `LaneProfile` from lane-engine hook |
| B12 | `coach-presence/copy-service.ts` | 63, 70, 120 | `ctx.primaryGoal === 'study' \|\| 'learning'` | Should consume `LaneProfile.primaryLane === 'student'` for lane-aware intent |
| B13 | `coach-presence/service.ts` | 80-82 | `input.motivationStyle === 'STUDY_FOCUSED'` → maps to `primaryGoal: 'study'` | Should accept `LaneProfile` and derive goal from lane traits |
| B14 | `content-study/content-study-visibility.ts` | 42-44 | `isStudyFocused = motivationStyle === 'study_focused' \|\| 'student'` | Should consume `LaneProfile.primaryLane === 'student'` |
| B15 | `content-study/content-study-visibility.ts` | 43-44 | `isStudyGoal = primaryGoal === 'STUDY' \|\| 'study'` | Should consume `laneProfile.primaryLane === 'student'` |
| B16 | `monetization/personalized-premium.ts` | 51, 60, 69 | `input.lane === 'student' \|\| 'game_like' \|\| 'deep_creative' \|\| 'minimal_normal'` | **Already correctly consumes lane!** But also branches on `primaryGoal` at line 51 — should use lane only |
| B17 | `learning-execution/service.ts` | 124-127 | `parsed.persona === 'creative' \|\| 'student' \|\| 'learning'` | This is `LearningExecutionPersona`, not lane. Acceptable as separate domain concept, but check if it should consume `LaneProfile` for default. |
| B18 | `personalization/hooks.ts` | 85-88 | `gamificationIntensity` derived from `input.style` (motivationStyle) | Should read from `LaneProfile.traits.wantsPlay` — gamification intensity is a lane trait, not a style derivation |

### A - Allowed presentation branch

| # | File | Line(s) | Pattern | Why allowed |
|---|------|---------|---------|-------------|
| A1 | `coach-presence/copy-service.ts` | 39-55 | `TONE_MAP`, `MOOD_MAP` keyed by `CoachPresenceMotivationStyle` | **Presentation tone mapping** — maps style → visual mood, not lane inference. Acceptable. |
| A2 | `coach-presence/copy-service.ts` | 57-59 | `styleMessage()` maps style → copy string | **Presentation copy** — lane-specific verbiage, not lane inference. Acceptable. |
| A3 | `coach-presence/copy-service.ts` | 97-103 | `buildDayZeroMessage()` per-style messages | **Presentation copy** — welcome messages, not lane decisions. Acceptable. |
| A4 | `coach-presence/copy-service.ts` | 124-131 | `buildPatternMessage()` per-style patterns | **Presentation copy** — pattern messages, not lane decisions. Acceptable. |
| A5 | `coach-presence/copy-service.ts` | 135-141 | `buildActiveMessage()` checks `motivationStyle === 'CALM'` for quiet mode | **Presentation behavior** — quiet mode suppression is a UX decision, not lane inference. Acceptable. |
| A6 | `coach-presence/service.ts` | 160-170 | `toneMap` per-style intensity/personality | **Presentation tone** — style → tone mapping. Acceptable. |
| A7 | `coach-presence/service.ts` | 176-187 | `getVisualState()` per-style companion reaction | **Presentation visual** — style → visual mapping. Acceptable. |
| A8 | `monetization/personalized-premium.ts` | 99-110 | `getPersonalizedHeadline()` per-lane headlines | **Already consumes lane** — uses `input.lane` directly. Presentation copy based on known lane. Acceptable. |
| A9 | `monetization/personalized-premium.ts` | 113-136 | `getPersonalizedBody()` per-lane body copy | **Already consumes lane** — presentation copy. Acceptable. |
| A10 | `session-start/service.ts` | 115-119 | `laneBriefCopy()` maps `Lane` → session brief | **Already consumes Lane type** — presentation mapping. Acceptable. |
| A11 | `personalization/first-week-lane-copy.ts` | 6-27 | `DAY_0` per-lane copy | **Already consumes Lane key** — presentation copy. Acceptable. |
| A12 | `personalization/first-week-lane-copy.ts` | 29-34 | `PATH` per-lane explanation | **Already consumes Lane key** — presentation copy. Acceptable. |

### C - Legacy/stale logic

| # | File | Notes |
|---|------|-------|
| — | None found in active source | `archive/` directory contains dead code but is excluded from audit |

### D - Test-only

| # | File | Line(s) | Pattern |
|---|------|---------|---------|
| D1 | `boss/__tests__/display-policy.test.ts` | 14-246 | Tests use raw `motivationStyle` values | **Test-only** — tests supply raw signals to exercise the display policy. Acceptable as test code. |

---

## Hard Rule

```
NO NEW PRODUCT SYSTEM MAY INFER LANE DIRECTLY.

Allowed sources of lane truth:
  1. LaneProfile (from lane-engine/service.ts)
  2. LaneMechanicPolicy (from lane-engine/policy.ts)
  3. LanePresentationPolicy (from lane-engine/presentation.ts)
  4. Tests for lane-engine
  5. Temporary migration adapters (marked with // MIGRATION_ADAPTER)

Everything else:
  - Consumes LaneProfile.primaryLane, .confidence, .traits
  - NEVER branches on raw motivationStyle, primaryGoal, gamificationIntensity
    to make lane-dependent product decisions
```

---

## Approved Exceptions

| # | System | Exception | Expires |
|---|--------|-----------|---------|
| E1 | CoachPresence TONE_MAP/MOOD_MAP | Style → visual/tone mapping (presentation only) | Never — presentation branches are allowed |
| E2 | CoachPresence copy templates | Per-style message strings | Never — copy is presentation |
| E3 | Lane-engine tests | Must test raw signal → lane mapping | Never — testing the engine |
| E4 | `lane-surface-helpers.ts` fallback | `canonicalLane` unavailable → falls back to raw signals | Phase 2 — once all callers supply LaneProfile |

---

## Remaining Drift Risks

| Risk | Severity | Description |
|------|----------|-------------|
| R1 | HIGH | `home-surface-decision.ts` has 8+ direct `motivationStyle`/`primaryGoal` branches (B3-B9) that duplicate lane-engine logic |
| R2 | HIGH | `surface-helpers.ts` duplicates `lane-surface-helpers.ts` pattern (B6-B9) — two files doing same anti-pattern |
| R3 | MEDIUM | `boss/display-policy.ts` reads `explicitMotivationStyle` from Zustand store instead of consuming LaneProfile (B10-B11) |
| R4 | MEDIUM | `coach-presence/service.ts` derives `primaryGoal` from `motivationStyle` (B13) instead of reading from LaneProfile |
| R5 | MEDIUM | `personalization/hooks.ts` derives `gamificationIntensity` from raw style (B18) — should read `LaneProfile.traits.wantsPlay` |
| R6 | LOW | `content-study-visibility.ts` has raw signal checks (B14-B15) — low impact since content study is lane-gated anyway |
| R7 | LOW | `learning-execution/service.ts` uses separate persona model (B17) — different domain concept, but worth reviewing for drift |
