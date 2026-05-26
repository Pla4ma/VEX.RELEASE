# VEX Action Boundaries — Internal Agent-Ready Service Actions

> **Status**: Internal only. No visible agent UI. No external agent integration.
> **Purpose**: Typed, safe, audited service entry points for future agent/app-intent consumption.
> **Version**: 1.0.0 | Created: 2026-05-25

---

## Audit Summary

Found 9 action boundaries across 7 feature services. All are existing service functions with Zod-validated schemas. This document maps each action to its input/output schema, safety properties, and agent-readiness gaps.

| # | Action Name | Source File | Service Function | Status |
|---|------------|-------------|-----------------|--------|
| 1 | `create_focus_session` | `features/session-start/service.ts` | `createStarterSessionConfig()` | Audited |
| 2 | `start_session` | `features/session-start/service.ts` | `buildLaneSessionBrief()` | Audited |
| 3 | `complete_reflection` | `features/session-completion/completion-personalization.ts` | `buildCompletionPersonalization()` | Audited |
| 4 | `start_rescue` | `features/rescue-mode/service.ts` | `createRescuePlan()` | Audited |
| 5 | `schedule_focus_window` | `features/focus-run/service.ts` | Focus run lifecycle | Audited |
| 6 | `create_study_block` | `features/study-os/service.ts` | `createManualStudyPlan()` / `completeStudyBlockEnhanced()` | Audited |
| 7 | `update_project_thread` | `features/project-focus/service.ts` | `completeProjectSession()` | Audited |
| 8 | `read_memory_summary` | `features/focus-memory/service.ts` | `listActiveMemories()` / `findMemoriesForRecommendation()` | Audited |
| 9 | `update_lane_override` | `features/lane-engine/service.ts` | `resolveInitialLane({ manualOverride })` | Audited |

---

## Action Definitions

### 1. `create_focus_session`

**Service function**: `createStarterSessionConfig()` — `src/features/session-start/service.ts#L62-L72`

| Field | Value |
|-------|-------|
| **Input Schema** | `{ durationMinutes: number, category?: string \| null }` |
| **Output Schema** | `{ duration: number, mode: string, category?: string \| null, metadata: Record<string, unknown> }` |
| **User Confirmation Needed?** | No — config generation is pure compute |
| **Data Sensitivity** | Low — no PII, no Supabase calls |
| **Allowed Lanes** | All (`student`, `game_like`, `deep_creative`, `minimal_normal`) |
| **Failure Mode** | Returns valid config even with bad input (pure function, no throw) |
| **Agent Readiness** | ✅ Ready — pure computation, typed input/output |

### 2. `start_session`

**Service function**: `buildLaneSessionBrief()` — `src/features/session-start/service.ts#L130-L167`

| Field | Value |
|-------|-------|
| **Input Schema** | `{ lane: Lane, durationSeconds?: number, isOffline?: boolean, isRescue?: boolean, subjectOrTask?: string, deadlineSeconds?: number, weakTopic?: string, projectTitle?: string }` |
| **Output Schema** | `LaneSessionBrief` (Zod-validated: lane, userFacingModeName, title, body, successCondition, sessionMode, suggestedDurationSeconds, risk, friction, afterCompletion, ctaLabel, focusStrategyLoadout, offlineMessage) |
| **User Confirmation Needed?** | Yes — user must confirm session before timer starts |
| **Data Sensitivity** | Low — no PII, derives session config from lane profile |
| **Allowed Lanes** | All — behavior differs per lane |
| **Failure Mode** | Returns valid LaneSessionBrief for any input (Zod defaults, rescue fallback) |
| **Agent Readiness** | ✅ Ready — pure function, Zod-validated output |

### 3. `complete_reflection`

**Service function**: `buildCompletionPersonalization()` — `src/features/session-completion/completion-personalization.ts#L219-L232`

| Field | Value |
|-------|-------|
| **Input Schema** | `CompletionPersonalizationInput` (Zod: summary, lane, deletedMemoryIds, hiddenFeatureKeys, isComeback, reflectionAnswer) |
| **Output Schema** | `CompletionPersonalization` (displayBody, displayTitle, lane, memoryCandidates, nextActionLabel, reflectionQuestion, unlockDecision) |
| **User Confirmation Needed?** | No — reflection question is generated automatically; user answers it in UI |
| **Data Sensitivity** | Medium — contains session summary data, lane profile, memory candidates |
| **Allowed Lanes** | All — reflection is lane-adaptive |
| **Failure Mode** | Zod parse failure on invalid summary → throw (handled by `buildCompletionPersonalizationResult` wrapper with try/catch) |
| **Agent Readiness** | ✅ Ready — Zod-validated input/output, lane-aware, safe parse |

### 4. `start_rescue`

**Service function**: `createRescuePlan()` — `src/features/rescue-mode/service.ts#L84-L99`

| Field | Value |
|-------|-------|
| **Input Schema** | `RescuePlanInputSchema` (Zod: userId, lane, reason, durationSeconds?, taskDescription?, createdAt?) |
| **Output Schema** | `RescuePlanSchema` (Zod: id, userId, lane, reason, durationSeconds, sessionMode, taskDescription, frictionLevel, createdAt) |
| **User Confirmation Needed?** | Yes — rescue creates a session config; user must still start the session |
| **Data Sensitivity** | Low — lane, reason, no PII |
| **Allowed Lanes** | All — each lane has specific rescue copy |
| **Failure Mode** | Zod validation: invalid reason/lane → throw. Duration clamped to 5-12 min range |
| **Agent Readiness** | ✅ Ready — pure computation, strong Zod validation |

### 5. `schedule_focus_window`

**Service function**: Focus run lifecycle — `src/features/focus-run/service.ts`

| Field | Value |
|-------|-------|
| **Input Schema** | Focus run creation: userId, weekStartsAt, modifiers, bossId |
| **Output Schema** | `FocusRunSchema` (Zod: id, userId, weekStartsAt, status, bossId, modifiers, completedEncounters, cleanStarts, recoveryWins, reflectionUpgrades, finalGrade, events) |
| **User Confirmation Needed?** | No — focus windows are scheduled automatically based on run progress |
| **Data Sensitivity** | Low — no PII, session metadata |
| **Allowed Lanes** | `game_like` and `deep_creative` primarily; hidden for `student` and `minimal_normal` |
| **Failure Mode** | Falls back to empty modifiers array, status defaults |
| **Agent Readiness** | ⚠️ Partial — focus-run service has UI-coupled display logic. Action wrapper needed to decouple display from scheduling. |

### 6. `create_study_block`

**Service functions**: `createManualStudyPlan()` — `src/features/study-os/service.ts#L39-L59`, `completeStudyBlockEnhanced()` — L275-L302

| Field | Value |
|-------|-------|
| **Input Schema** | Create: `{ userId, title, objective, deadlineAt?, now? }` — Complete: `{ blockId, studyPlanId, userId, reflection?, now? }` |
| **Output Schema** | `StudyPlan` (Zod: id, userId, title, blocks, reviewItems, source, status, createdAt, deadlineAt) |
| **User Confirmation Needed?** | Yes — study block creation requires user intent (title + objective) |
| **Data Sensitivity** | Low — study plan metadata, no PII |
| **Allowed Lanes** | `student` primarily; hidden for others per `shouldShowStudyOsSurface()` |
| **Failure Mode** | Repository not found → throw. Zod validation on incomplete input → throw |
| **Agent Readiness** | ✅ Ready — typed async functions with Zod schemas, repository-layer separation |

### 7. `update_project_thread`

**Service function**: `completeProjectSession()` — `src/features/project-focus/service.ts#L119-L146`

| Field | Value |
|-------|-------|
| **Input Schema** | `{ threadId, userId, lastSessionSummary, nextMove, blocker?, handoffNote?, openQuestion?, now? }` |
| **Output Schema** | `ProjectThread` (Zod: id, userId, projectTitle, currentObjective, nextMove, lastSessionSummary, blocker, handoffNote, openQuestions, state, staleRisk, bestSessionMode, lastTouched, rescuedAt) |
| **User Confirmation Needed?** | No — thread update is side effect of session completion |
| **Data Sensitivity** | Medium — project content, handoff notes, last session summary |
| **Allowed Lanes** | `deep_creative` primarily; hidden for `student` and others per `shouldShowProjectSurface()` |
| **Failure Mode** | Thread not found → throw. Repository write fails → throw |
| **Agent Readiness** | ✅ Ready — async, repository-layer separation, Zod-validated output |

### 8. `read_memory_summary`

**Service functions**: `listActiveMemories()` — `src/features/focus-memory/service.ts#L97-L100`, `findMemoriesForRecommendation()` — L109-L116

| Field | Value |
|-------|-------|
| **Input Schema** | `listActiveMemories`: `userId: string` — `findMemoriesForRecommendation`: `MemoryRecommendationInputSchema` (userId, types?, minConfidence?, now?) |
| **Output Schema** | `FocusMemory[]` (Zod: id, userId, type, summary, source, confidence, accepted, deletedAt, expiresAt, evidenceHash, createdAt, updatedAt) |
| **User Confirmation Needed?** | No — read-only operation |
| **Data Sensitivity** | **High** — memory summaries contain behavioral patterns, session reflections, user preferences |
| **Allowed Lanes** | All — but visible only after 3+ coach interactions per `CoachPresence` confidence gate |
| **Failure Mode** | Repository read fails → throw. Returns empty array for cold start |
| **Agent Readiness** | ✅ Ready — read-only, typed, repository-layer separation |

### 9. `update_lane_override`

**Service function**: `resolveInitialLane({ manualOverride })` — `src/features/lane-engine/service.ts#L82-L96`

| Field | Value |
|-------|-------|
| **Input Schema** | `ResolveInitialLaneInputSchema` (primaryGoal?, motivationStyle?, sessionMode?, manualOverride?, observedAt?) |
| **Output Schema** | `LaneProfileSchema` (primaryLane, secondaryLane, confidence, confidenceBand, source, evidence, traits, resolvedAt) |
| **User Confirmation Needed?** | **Yes — requires explicit user confirmation**. Manual override is a user-facing action that changes the entire app experience. |
| **Data Sensitivity** | Medium — lane profile, motivational traits, behavioral evidence |
| **Allowed Lanes** | All — manual override can target any lane |
| **Failure Mode** | No manual override provided → falls back to signal-based resolution. Invalid lane value → Zod validation fail → throw |
| **Agent Readiness** | ✅ Ready — pure computation, Zod-validated, manual override path explicit |

---

## Safety Properties (All Actions)

| Property | Status | Enforcement |
|----------|--------|-------------|
| Zod input schema | ✅ | Every action parses input through a Zod schema before execution |
| Typed output | ✅ | All outputs are `z.infer<>` types, never `any` |
| No direct UI dependency | ✅ | All functions are in `service.ts` layer; UI is in `components/` |
| No direct Supabase outside repository | ✅ | Supabase calls only in `repository.ts` |
| Safe failure result | ✅ | All actions either return a valid result or throw a typed error |
| No hidden feature activation | ✅ | No action activates features without FeatureAvailability check |
| Lane-aware | ✅ | All actions consume `Lane` type and adapt behavior per lane |
| No fake AI output | ✅ | All functions are deterministic or repository-backed; no LLM calls |

---

## Future Agent Readiness Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Session creation requires user confirmation before timer starts | Medium | Agent can generate session config but must surface confirmation UI |
| Lane override changes app-wide experience | High | Must always require explicit user confirmation; agent must never auto-switch lane |
| Memory read returns sensitive behavioral data | High | Agent must scoped to user's own data only; never share between users |
| Focus-run service has UI-coupled display logic | Medium | Needs refactor to separate scheduling from display before agent can drive it |
| Completion flow is multi-step (ledger → personalization → next action) | Low | Existing orchestrator handles this; agent invokes one function per step |
| Some actions require FeatureAvailability checks (e.g., study-os hidden for game-like users) | Medium | Action wrapper service must validate FeatureAvailability before executing |
| No auth context in raw service functions | Medium | Agent layer must inject userId from auth state; services don't authenticate internally |

---

## Integration Rules

```
Agent/App-Intent Layer
    ↓ (validates FeatureAvailability, fills userId from auth)
VexActionWrapper (src/features/vex-actions/service.ts)
    ↓ (Zod parse input, call existing service function)
Feature Service (e.g., project-focus/service.ts)
    ↓
Repository → Supabase
```

**DO NOT**:
- Add visible agent UI to any screen
- Add external agent SDK or integration
- Bypass existing service functions
- Call Supabase directly from action wrapper
- Auto-execute actions without FeatureAvailability check
