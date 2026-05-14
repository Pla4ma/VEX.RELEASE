# VEX 11/10 AI-IDE Implementation Plan

> This document is written for Windsurf or any AI IDE implementing VEX.
> It is not a human brainstorming roadmap.
> Last updated: May 5, 2026.
> Launch target: App Store submission by May 30, 2026.
> Phase 0 status: COMPLETE. Do not reopen Phase 0. Do not create new cleanup debt.

---

## Prime Directive

VEX wins by shipping one world-class loop:

`Open app -> see one best action -> start focus fast -> complete session -> see proof of growth -> know what to do next.`

The app becomes 11/10 through ruthless coherence, not through feature count.

Every implementation decision must protect these outcomes:

1. The user always knows what to do now.
2. A completed session visibly changes Focus Score, streak, companion, rewards, and next mission.
3. Progress is never lost, including offline.
4. Every screen feels complete in loading, empty, error, offline, disabled, and success states.
5. Premium sells insight, personalization, and cosmetics, never fear.
6. Disabled or weak systems are invisible at launch.
7. The codebase stays clean enough that no second Phase 0 is needed.

If a task conflicts with this directive, stop and revise the task before coding.

---

## Non-Negotiable Stack

- Expo SDK 54 managed workflow.
- TypeScript 5.x strict mode.
- TanStack Query v5 for server state only.
- Zustand for persistent client state only.
- Zod schemas as source of truth.
- React Navigation v6 with typed route params.
- Reanimated 3 only for animations.
- Supabase for Postgres, Auth, Realtime, and Storage.
- MMKV for non-sensitive fast storage only.
- SecureStore through the existing SecureStorage wrapper for secrets only.
- Sentry for unexpected errors.
- RevenueCat through `src/shared/monetization/` only.
- Design tokens from `src/theme/tokens/` only.

No new libraries without explicit owner approval.

---

## AI IDE Operating Protocol

Windsurf must follow this protocol for every task in this file.

### Before Editing

1. Read the task fully.
2. Read `AGENTS.md`.
3. Read only the relevant feature files.
4. Identify the exact files that will be edited.
5. Identify the exact tests that must be added or changed.
6. Confirm every target file can stay under 200 lines after the edit.
7. If a file would exceed 200 lines, split it before adding behavior.
8. Write down the expected data flow:
   `Component -> Hook -> Service -> Repository -> Supabase`.

### During Editing

1. Make the smallest complete change that satisfies the task.
2. Do not repair unrelated issues.
3. Do not move logic into JSX.
4. Do not add placeholder implementations.
5. Do not add "temporary" `any`, casts, suppressions, or console calls.
6. Do not introduce new global patterns.
7. Do not duplicate business logic across features.
8. Validate all external data with Zod.
9. Emit events for cross-system integration instead of direct cross-feature orchestration.

### After Editing

1. Run the task-specific tests.
2. Run `npm run typecheck -- --pretty false`.
3. Run targeted lint if available, otherwise run `npm run lint`.
4. Re-run file-size audit for edited files.
5. Grep edited files for banned patterns.
6. Update the task checkbox only if every verification item passes.
7. Add a short verification note to `VERIFICATION_REPORT.md` for the changed feature.

### Stop Conditions

Stop immediately and do not continue coding if:

- A required file is missing and architecture is unclear.
- A task requires a schema migration but Supabase types cannot be regenerated.
- A file would exceed 200 lines and no clean split is obvious.
- The change would require a new library.
- A feature cannot meet loading, empty, error, offline, and success states.
- A task would expose a disabled feature to users.
- A TypeScript or lint error appears outside the edited scope and blocks verification.

When stopped, write a blocker note in the task, including files inspected and the smallest safe next step.

---

## Regression Firewall

Phase 0 is complete. The rest of this plan must not create Phase 0 again.

Every task has a regression budget of zero for:

- TypeScript errors.
- Lint errors.
- `any`.
- `@ts-ignore`, `@ts-nocheck`, or unexplained `@ts-expect-error`.
- `console.*`.
- `FlatList`.
- `StyleSheet.create`.
- raw `fetch()`.
- `AsyncStorage`.
- hardcoded colors, spacing, font sizes, or radii in components.
- Supabase queries outside repository files.
- business logic inside JSX.
- new files above 200 lines.
- dead navigation to disabled features.
- user-visible happy-path-only UI.

Required edited-file audit:

```bash
rg "console\.|: any\b|<any>|@ts-ignore|@ts-nocheck|@ts-expect-error" <edited-files>
rg "StyleSheet\.create|FlatList|AsyncStorage|fetch\(" <edited-files>
rg "#[0-9A-Fa-f]{3,8}|rgb\(" <edited-files>
```

Expected result: no unacceptable matches.

---

## Mandatory Phase Workflow

Windsurf must execute each phase as a sequence of task packets, not as one giant edit.

For each phase:

1. Create a phase scratch note in the current chat or local notes, not in source unless asked.
2. List all phase tasks.
3. Pick the first unchecked task only.
4. Complete the task packet template for that task.
5. Edit only the files needed for that task.
6. Add or update tests for that task.
7. Run targeted verification.
8. Run edited-file regression audits.
9. Update `VERIFICATION_REPORT.md`.
10. Mark the task complete only when verification passes.
11. Move to the next task.

Batching rule:

- One task packet per implementation pass.
- Never implement two unrelated features in the same pass.
- Never mix UI polish, service logic, repository changes, and navigation changes unless the task explicitly requires the full vertical slice.
- If a task touches more than eight source files, stop and split it into smaller task packets.

Phase exit rule:

- A phase is not complete because all code was written.
- A phase is complete only when the exit gate passes and `VERIFICATION_REPORT.md` has evidence.

---

## Windows Verification Command Cookbook

The repo is on Windows. Prefer `rg` and PowerShell commands that work in this workspace.

Typecheck:

```powershell
npm run typecheck -- --pretty false
```

Lint:

```powershell
npm run lint
```

Targeted tests:

```powershell
npm test -- <test-file-or-pattern>
```

Vitest-style targeted tests when the suite uses Vitest imports:

```powershell
npx vitest run <test-file>
```

Edited-file banned pattern audit:

```powershell
rg "console\.|: any\b|<any>|@ts-ignore|@ts-nocheck|@ts-expect-error" <edited-files>
rg "StyleSheet\.create|FlatList|AsyncStorage|fetch\(" <edited-files>
rg "#[0-9A-Fa-f]{3,8}|rgb\(" <edited-files>
```

Edited-file line count audit:

```powershell
Get-Item <edited-files> | ForEach-Object {
  $lineCount = (Get-Content -LiteralPath $_.FullName).Count
  if ($lineCount -gt 200) { "$lineCount $($_.FullName)" }
}
```

Feature-wide file size audit:

```powershell
Get-ChildItem -Path src/features/<feature-name> -Recurse -Include *.ts,*.tsx | ForEach-Object {
  $lineCount = (Get-Content -LiteralPath $_.FullName).Count
  if ($lineCount -gt 200) { "$lineCount $($_.FullName)" }
}
```

Find Supabase calls outside repository files:

```powershell
rg "supabase\.(from|rpc|channel|storage)" src --glob "!**/repository.ts" --glob "!**/repository/**"
```

Find direct component queries:

```powershell
rg "useQuery\(|useMutation\(" src/screens src/features --glob "*.tsx"
```

This command can produce valid matches in hooks or container components. Each match must be reviewed. Data-driven screen components should consume feature hooks rather than define query calls inline.

Find disabled feature routes:

```powershell
rg "Social|Duels|Rankings|SquadWars|Rivals|Trading|EmergencyGem" src/navigation src/screens src/features src/constants
```

Final launch audit commands are listed again in Phase 10.

---

## Task Completion Contract

No task is complete until all of these are true:

- Implementation exists across every required layer.
- Tests cover success and failure paths.
- Offline/degraded behavior is implemented where relevant.
- Sentry captures unexpected errors outside components.
- User-facing errors are shown where relevant.
- Mutations invalidate related queries on success.
- Mutations use optimistic update and rollback where the user cares.
- Every UI state is rendered.
- Feature integrates with at least two other systems.
- `VERIFICATION_REPORT.md` is updated.
- Required commands pass.

Do not mark `[x]` because code "looks right".
Only mark `[x]` when verification has run.

---

## 14-Category Verification Matrix

Every shipped feature must be verified against:

1. domain models
2. validation
3. service logic
4. repository and persistence
5. event emission and handling
6. analytics hooks
7. UI implementation
8. loading states
9. empty states
10. error states
11. retry and degraded states
12. edge case handling
13. tests
14. integration with at least two other systems

Each phase must update `VERIFICATION_REPORT.md` with this table:

```md
## <Feature Name>

| Category | Status | Evidence |
|---|---|---|
| Domain models | PASS/FAIL | files/tests |
| Validation | PASS/FAIL | files/tests |
| Service logic | PASS/FAIL | files/tests |
| Repository and persistence | PASS/FAIL | files/tests |
| Event emission and handling | PASS/FAIL | files/tests |
| Analytics hooks | PASS/FAIL | files/tests |
| UI implementation | PASS/FAIL | files/tests |
| Loading states | PASS/FAIL | files/tests |
| Empty states | PASS/FAIL | files/tests |
| Error states | PASS/FAIL | files/tests |
| Retry and degraded states | PASS/FAIL | files/tests |
| Edge case handling | PASS/FAIL | files/tests |
| Tests | PASS/FAIL | command output summary |
| Integration with 2+ systems | PASS/FAIL | systems listed |
```

---

## 11/10 Product Standard

The launch app must feel:

- fast: session start is immediate
- obvious: Home has one best action
- alive: companion reacts to progress
- fair: rewards are earned and explainable
- durable: offline progress is safe
- personal: AI coach references real behavior
- polished: every state is designed
- ethical: premium does not exploit fear
- trustworthy: privacy, purchases, and errors are handled cleanly

The app is not 11/10 if:

- Home looks like a pile of unrelated systems.
- A completed session does not visibly affect the app.
- AI coach gives generic advice.
- Offline completion can lose progress.
- Disabled social features appear empty.
- Premium copy pressures users during failure.
- Any screen only handles success state.
- Any feature ships without tests.

---

## Phase 0 - Completed Foundation

Status: COMPLETE.

Do not redo Phase 0.
Do not add Phase 0 tasks.
Do not use Phase 0 as a dumping ground for regressions.

Phase 0 is treated as a locked baseline:

- TypeScript strict baseline is clean.
- Lint baseline is clean.
- Suppression baseline is clean.
- Import baseline is clean.
- File-size baseline is clean.
- Dead-code baseline is clean.

Allowed Phase 0-related action:

- If a later task breaks a Phase 0 guarantee, fix that regression inside the same later task before marking it complete.

Not allowed:

- "Clean up later."
- "Add TODO."
- "Temporary any."
- "Suppress for now."
- "Move fast and fix types after."

---

## Phase 1 - Launch Spine: Session Completion Must Be Perfect

Goal: Turn one completed focus session into validated, persistent, visible progress.

This phase is mandatory. Do not work on AI coach, paywall polish, social, boss, or cosmetics until Phase 1 is green.

### P1-01 - Completion Ledger Contract

WHY:
Every downstream system depends on a single trustworthy record of what happened.

READ FIRST:

- `src/features/session-completion/`
- `src/session/`
- `src/screens/session/`
- `src/events/types/session.ts`
- `docs/brain/product-logic.md`

IMPLEMENT:

1. Create or harden a completion ledger schema in `src/features/session-completion/schemas.ts`.
2. Ledger fields must include:
   - ledger id
   - idempotency key
   - session id
   - user id
   - mode
   - target duration seconds
   - completed duration seconds
   - effective focused seconds
   - pause count
   - interruption count
   - strict mode flag
   - started at
   - completed at
   - timezone
   - grade
   - grade score
   - quality score
   - Focus Score delta
   - XP delta
   - streak result
   - companion reaction id
   - reward ids
   - daily mission result
   - offline sync status
   - created at
3. Keep ledger construction in `service.ts` or a service submodule.
4. Keep persistence in `repository.ts`.
5. Validate repository responses with Zod.
6. Emit exactly one `session:completed` event per idempotency key.

VERIFY:

- [x] Ledger schema rejects missing required fields.
- [x] Ledger service creates a valid ledger for a normal completed session.
- [x] Ledger service creates a valid pending ledger offline.
- [x] Duplicate idempotency key does not duplicate ledger or downstream events.
- [x] Repository tests cover success, conflict, invalid response, and Supabase error.
- [x] Service tests cover success, offline, partial dependency failure, and duplicate replay.
- [x] `session:completed` fires exactly once per ledger idempotency key.
- [x] `npm run typecheck -- --pretty false` passes.

### P1-02 - Session Grading Engine

WHY:
The grade is the emotional receipt. It must be deterministic, fair, and reused everywhere.

READ FIRST:

- `src/features/session-completion/`
- `src/session/engines/`
- `src/session/validation/`
- `docs/brain/product-logic.md`

IMPLEMENT:

1. Put grading logic in `src/features/session-completion/grading-service.ts` or a service submodule.
2. Do not calculate grades in components, hooks, repositories, or story screens.
3. Use a Zod input schema for grading input.
4. Output:
   - grade: `S | A | B | C | D`
   - grade score from 0 to 100
   - grade label
   - factor breakdown
   - Focus Score impact recommendation
   - XP quality multiplier
   - user-facing reason
5. Grade factors:
   - completion ratio
   - effective focus time
   - pause count
   - interruption count
   - strict mode
   - session mode
   - background time
6. Recovery sessions must be judged against their intended recovery goal, not against deep-work expectations.
7. Abandoned sessions must use a separate abandonment result, not fake a completed grade.

VERIFY:

- [x] Tests cover S, A, B, C, D.
- [x] Tests cover recovery mode.
- [x] Tests cover strict mode.
- [x] Tests cover abandoned session path.
- [x] Tests cover pause-heavy but completed session.
- [x] Tests cover short intentional session.
- [x] Focus Score and story consume this result instead of recalculating.

### P1-03 - Completion Orchestrator

WHY:
Completing a session touches many systems. The orchestration must be explicit, idempotent, and resilient.

READ FIRST:

- `src/session/integration/`
- `src/features/session-completion/service.ts`
- `src/features/economy/offline-queue.ts`
- `src/events/`

IMPLEMENT:

Completion order:

1. Validate session completion input.
2. Build completion ledger.
3. Persist ledger or enqueue offline.
4. Emit `session:completed`.
5. Update Focus Score.
6. Update streak.
7. Award XP.
8. Create rewards.
9. Update companion.
10. Update daily mission.
11. Track analytics.
12. Return post-session story view model.

Rules:

- Each downstream system must be idempotent.
- One subsystem failure must not lose the ledger.
- If a noncritical subsystem fails, story shows a degraded state.
- If persistence fails offline, queue the ledger before showing success.

VERIFY:

- [x] Normal completion updates all core systems.
- [x] Offline completion queues ledger and shows pending state.
- [x] Reward failure does not erase session completion.
- [x] Focus Score failure is captured and retried or marked degraded.
- [x] Duplicate replay does not duplicate rewards, XP, streak, or analytics.
- [x] Tests cover each failure path.

### P1-04 - Post-Session Story View Model

WHY:
The story screen should render a prepared result, not perform business logic.

READ FIRST:

- `src/screens/session/SessionCompleteScreen.tsx`
- `src/screens/session/components/`
- `src/features/session-story/` if present

IMPLEMENT:

Create a service-level story view model containing:

- grade card data
- Focus Score delta card data
- XP and level progress data
- streak state data
- companion reaction data
- reward reveal data
- daily mission completion data
- next action CTA
- degraded section warnings

The screen must only render this view model through hooks.

VERIFY:

- [x] No business calculations in story JSX.
- [x] Story loading state is a skeleton matching final layout.
- [x] Story empty fallback handles missing ledger.
- [x] Story error state has retry.
- [x] Story offline state shows pending sync.
- [x] Story degraded state still lets user return Home.
- [x] Reduced motion is respected.
- [x] All controls have accessibility label, role, and hint.

### P1-05 - Home Return Sync

WHY:
After completion, Home must immediately show the new truth.

READ FIRST:

- `src/screens/home/`
- `src/features/home-spine/`
- `src/api/QueryProvider.tsx`

IMPLEMENT:

1. Define completion-related query keys in one place.
2. On completion success, invalidate or optimistically update:
   - active session
   - session history
   - Focus Score
   - streak
   - progression
   - rewards
   - companion
   - daily mission
3. On offline completion, show optimistic state with pending-sync banner.
4. On sync success, clear pending state.
5. On sync failure after retries, keep progress visible and show repair CTA.

VERIFY:

- [x] Complete session -> story -> Home shows updated score, streak, mission, and companion.
- [x] Complete offline -> Home shows pending-sync banner.
- [x] Reconnect -> pending banner clears.
- [x] Query invalidation tests pass.
- [x] Optimistic rollback tests pass.

PHASE 1 EXIT GATE:

- [x] End-to-end test: start session -> complete -> story -> Home.
- [x] Offline end-to-end test passes.
- [x] No edited file over 200 lines.
- [x] `npm run typecheck -- --pretty false` passes.
- [x] Targeted tests pass.
- [x] Verification report updated.

---

## Phase 2 - Focus Identity: The Main Product Spine

Goal: Focus Score becomes the primary identity system and the user's daily reason to return.

### P2-01 - Focus Identity Domain Model

WHY:
AI IDEs create drift when domain shape is vague. The score model needs one source of truth.

READ FIRST:

- `src/features/focus-identity/`
- `src/events/types/focus-identity.ts`
- `src/types/supabase.ts`

IMPLEMENT:

Schemas:

- `FocusScoreRecordSchema`
- `FocusScoreFactorsSchema`
- `FocusScoreHistoryPointSchema`
- `FocusScoreUpdateInputSchema`
- `FocusScoreUpdateResultSchema`
- `MonthlyFocusReportSummarySchema`

Types:

- Infer all schema-backed types with `z.infer<>`.
- Keep domain-only types in `types.ts`.
- Do not mirror schema types manually.

VERIFY:

- [x] Schema tests cover valid, invalid, edge, and corrupt persisted data.
- [x] No hand-written duplicate schema types.
- [x] Factor weights sum to exactly 100 percent in tests.
- [x] Score range is enforced at 300 to 850.

### P2-02 - Focus Identity Repository

WHY:
Focus Score must survive reinstall and support reports, analytics, and coach recommendations.

IMPLEMENT:

Repository functions:

- `fetchCurrentFocusScore(userId)`
- `upsertCurrentFocusScore(userId, score)`
- `appendFocusScoreHistory(event)`
- `fetchFocusScoreHistory(userId, days)`
- `fetchMonthlyFocusReportInput(userId, month)`

Rules:

- All Supabase queries live here.
- All responses are parsed with Zod.
- Supabase errors throw typed repository errors.
- RLS protects user-owned records.
- Schema migrations must be followed by `npm run types:supabase`.

VERIFY:

- [x] Repository tests cover success, empty, invalid shape, Supabase error, and conflict.
- [x] RLS policy exists for user-owned score data.
- [x] Supabase types regenerated after schema change.
- [x] No Focus Score Supabase query exists outside repository.

### P2-03 - Focus Score Algorithm

WHY:
The score must be explainable enough to trust and stable enough to feel meaningful.

IMPLEMENT:

Use this five-factor model:

- Consistency: 35 percent.
- Streak stability: 25 percent.
- Session quality: 20 percent.
- Intentional difficulty: 10 percent.
- Recency: 10 percent.

Rules:

- New users start at 550.
- Score floor is 300.
- Score ceiling is 850.
- First session should create visible movement.
- S-grade sessions create strong positive movement.
- Recovery sessions can improve consistency but cannot farm elite scores.
- Missed days reduce score gradually.
- Comeback sessions soften recent losses.
- Abandoned committed sessions reduce score.
- Every update includes explanation strings and factor deltas.

VERIFY:

- [x] Tests cover first session.
- [x] Tests cover score floor and ceiling.
- [x] Tests cover each grade.
- [x] Tests cover missed day.
- [x] Tests cover comeback.
- [x] Tests cover recovery farming prevention.
- [x] Tests cover abandoned session.
- [x] Explanation output names top positive and top negative factor.

### P2-04 - Focus Identity Integration

WHY:
The score is useless if it is not updated from real events.

IMPLEMENT:

1. Subscribe to `session:completed`.
2. Update Focus Score from ledger data.
3. Persist current score.
4. Append history event.
5. Emit `focus-identity:score_updated`.
6. Invalidate Focus Score queries.
7. Track `vex_focus_score_changed`.

VERIFY:

- [x] Session completion updates Focus Score.
- [x] History row is appended.
- [x] Event fires once.
- [x] Analytics contains no PII.
- [x] Failure is captured by Sentry and does not crash completion flow.

### P2-05 - Focus Score Dashboard

WHY:
The dashboard is where users understand why they are improving.

IMPLEMENT:

Dashboard sections:

- hero score and band
- last session delta
- 30-day trend
- five factor bars
- strongest pattern
- weakest pattern
- "what changed" section
- next score target
- monthly report CTA

Required states:

- loading skeleton
- empty zero-session state
- error with retry
- offline degraded banner
- stale-data refetching state
- success

VERIFY:

- [x] Component tests cover all states.
- [x] Trend handles 0, 1, 2, and 30 data points.
- [x] CTA routes are typed.
- [x] No hardcoded styles.
- [x] Reduced motion respected.

### P2-06 - Home Focus Widget

WHY:
The main identity number must be visible every day.

IMPLEMENT:

Widget shows:

- current score
- band
- delta since last session
- one sentence reason
- tap target to dashboard

VERIFY:

- [x] Widget appears above secondary rails.
- [x] Widget updates after session completion.
- [x] Widget handles loading, empty, error, offline, and success.
- [x] Tapping navigates through typed route.

PHASE 2 EXIT GATE:

- [x] Focus Score changes after test session.
- [x] Focus Score survives reinstall with same user.
- [x] Dashboard and widget render all states.
- [x] All Focus Identity tests pass.
- [x] Typecheck passes.
- [x] Verification report updated.

---

## Phase 3 - Home Command Center

Goal: Home gives exactly one best action and hides everything that is not ready.

### P3-01 - Home Information Architecture

WHY:
A cluttered Home screen makes the app feel unfinished.

IMPLEMENT:

Home order:

1. identity greeting
2. Focus Score widget
3. one daily mission card
4. primary session start control
5. companion status
6. streak/progress strip
7. secondary optional rail

Rules:

- One primary CTA above the fold.
- No disabled feature cards.
- No empty social surfaces.
- No generic marketing explanation.
- Stale data must be labeled.
- Offline mode must be visible and calm.

VERIFY:

- [x] First viewport shows score, mission, and start action.
- [x] Disabled routes are invisible.
- [x] Home section failure does not crash screen.
- [x] Home has loading, empty, error, offline, stale, and success states.

### P3-02 - Daily Mission Priority Engine

WHY:
The app must decide what matters so the user does not have to.

IMPLEMENT:

Mission priority:

1. first session for new user
2. pending sync repair
3. streak critical
4. comeback quest
5. active daily mission
6. boss near defeat if boss enabled
7. companion care
8. AI coach next action
9. squad weekly goal if squads enabled
10. default recommended focus session

Mission payload:

- id
- type
- priority
- title
- reason
- CTA label
- CTA route/action
- target system
- expires at
- analytics payload

VERIFY:

- [x] Exactly one primary mission appears.
- [x] Priority tests cover every branch.
- [x] Mission persistence works.
- [x] Completion listens to `session:completed`.
- [x] Mission analytics fires shown, started, completed, dismissed.

### P3-03 - Recommended Session Engine

WHY:
Starting focus must feel effortless and personal.

IMPLEMENT:

Recommendation inputs:

- user goal
- recent session length
- recent grade
- time of day
- streak urgency
- recovery status
- daily mission

Output:

- duration
- mode
- reason
- fallback if data missing

Rules:

- One tap starts recommendation.
- Advanced setup remains secondary.
- Start action is disabled with reason if blocked.
- Haptic goes through `src/utils/haptics.ts`.

VERIFY:

- [x] New users get a safe starter recommendation.
- [x] Returning users get history-aware recommendation.
- [x] Streak-critical users get recovery-friendly option.
- [x] Session starts within 500ms median.
- [x] Tests cover sparse data and conflicting signals.

### P3-04 - Home Feature Visibility Gate

WHY:
AI IDEs often leave dead links. Launch cannot expose unfinished systems.

IMPLEMENT:

Create or harden feature visibility rules:

- disabled feature has no tab
- disabled feature has no Home card
- disabled feature has no settings entry unless explicitly needed
- disabled feature deep link routes to safe fallback
- disabled feature analytics does not fire

VERIFY:

- [x] Social feed hidden when flag false.
- [x] Duels hidden when flag false.
- [x] Rankings hidden when flag false.
- [x] Squad wars hidden when flag false.
- [x] Trading hidden or archived.
- [x] Emergency gem sinks hidden or archived.
- [x] App works with all optional flags false.

PHASE 3 EXIT GATE:

- [x] Home communicates one best action.
- [x] All disabled feature routes are unreachable.
- [x] Recommended session starts in one tap.
- [x] Home tests pass.
- [x] Typecheck passes.
- [x] Verification report updated.

---

## Phase 4 - Onboarding And First Session Magic

Goal: A new user reaches a meaningful first win fast.

### P4-01 - Five-Screen Maximum Onboarding

WHY:
Long onboarding kills activation.

IMPLEMENT:

Onboarding must be five screens or fewer:

1. identity promise: Focus Score starts at 550
2. name and goal
3. companion reveal
4. first session setup
5. first result after completion

Rules:

- No marketing-only screen.
- No permission prompt before value is explained.
- No feature tour of disabled systems.
- No generic "all-in-one productivity" copy.
- Form screens use `KeyboardAvoidingView` and `ScrollView`.

VERIFY:

- [x] New user can start first session within 90 seconds.
- [x] Existing onboarded user skips onboarding.
- [x] Onboarding state persists.
- [x] Accessibility labels exist for every control.
- [x] Tests cover completion and skip paths.

### P4-02 - Starter Session

WHY:
The first session should be easy enough to complete and meaningful enough to matter.

IMPLEMENT:

Starter session:

- 10 minutes by default
- Recovery or Starter mode
- clear expectation
- companion waiting state
- Focus Score preview
- no advanced choices blocking start

VERIFY:

- [x] Starter session begins from onboarding.
- [x] Completion updates Focus Score.
- [x] First result screen shows score movement.
- [x] Abandoning starter session has supportive recovery path.

### P4-03 - First Result Moment

WHY:
The first completion is where the user decides if VEX is real.

IMPLEMENT:

First result must show:

- grade
- Focus Score before and after
- companion reaction
- first XP progress
- streak seed
- next mission

VERIFY:

- [x] First result screen renders without historical data.
- [x] Missing optional systems do not break first result.
- [x] User lands on Home with updated state.

PHASE 4 EXIT GATE:

- [x] Fresh install activation flow passes end to end.
- [x] Onboarding tests pass.
- [x] No disabled features shown in onboarding.
- [x] Typecheck passes.
- [x] Verification report updated.

---

## Phase 5 - Emotional Retention Systems

Goal: Retention comes from attachment, mastery, and recovery.

### P5-01 - Companion Growth

WHY:
The companion makes progress feel alive.

IMPLEMENT:

Companion reacts to:

- session completion
- grade
- streak maintained
- comeback completed
- Focus Score band changed
- daily mission completed

Rules:

- Basic companion growth is free.
- Premium cosmetics are optional.
- Companion state is persisted.
- Offline updates are optimistic and retryable.

VERIFY:

- [x] Companion changes after session completion.
- [x] Companion has empty, loading, error, offline, and success states.
- [x] Tests cover growth thresholds.
- [x] No premium gate blocks basic growth.

### P5-02 - Streaks Without Shame

WHY:
Streaks should motivate without making users feel trapped.

IMPLEMENT:

Rules:

- qualifying session uses timezone-aware calendar logic
- streak risk creates one clear action
- broken streak creates comeback quest
- streak shields are earned, not panic-sold
- no emergency gem prompt
- no paywall copy about saving failure

VERIFY:

- [x] Timezone tests cover boundary cases.
- [x] Active, at-risk, grace, broken, and comeback states tested.
- [x] Paywall contains no fear streak rescue.
- [x] Streak integrates with companion, Focus Score, notifications, and mission.

### P5-03 - Comeback Quest

WHY:
The app should recover users after missed days instead of punishing them.

IMPLEMENT:

Trigger:

- 2 or more missed days
- user returns after streak break
- repeated failed session attempts

Quest:

- small recovery session
- supportive copy
- Focus Score partial recovery
- XP bonus
- companion encouragement
- next mission reset

VERIFY:

- [x] Comeback outranks normal daily mission.
- [x] Comeback completion updates Focus Score, XP, companion, and analytics.
- [x] Tests cover trigger, completion, expiration, and repeat misses.
- [x] Copy has no shame language.

### P5-04 - Monthly Focus Report

WHY:
Premium should sell insight that feels real.

IMPLEMENT:

Report includes:

- month start score
- month end score
- score delta
- best focus window
- strongest pattern
- weakest pattern
- session count
- total focused time
- best grade
- next month target
- AI coach insight if available

Free users:

- get a useful summary
- see premium preview for deeper sections

Premium users:

- get full report

VERIFY:

- [x] Report uses real persisted data.
- [x] Empty month state is handled.
- [x] Free preview is useful and ethical.
- [x] Premium gate uses monetization layer only.
- [x] Tests cover free, premium, empty, loading, error, and offline.

PHASE 5 EXIT GATE:

- [x] Companion, streak, comeback, and report integrate with session completion.
- [x] No fear monetization exists.
- [x] Tests pass.
- [x] Typecheck passes.
- [x] Verification report updated.

---

## Phase 6 - Rewards, Progression, And Economy Integrity

Goal: Rewards feel clean, earned, and impossible to duplicate.

### P6-01 - Reward Ledger

WHY:
Duplicate or missing rewards destroy trust.

IMPLEMENT:

Reward ledger states:

- pending
- delivered
- failed
- expired

Rules:

- every reward has idempotency key
- creation and delivery are separate
- failed delivery is retryable
- offline delivery is queued
- UI distinguishes pending from delivered

VERIFY:

- [x] Duplicate event replay does not duplicate reward.
- [x] Failed delivery captured by Sentry.
- [x] Retry succeeds.
- [x] Tests cover success, duplicate, failure, retry, and offline.

### P6-02 - XP And Level Pacing

WHY:
Progression should be motivating without becoming noise.

IMPLEMENT:

First week arc:

- session 1: Focus Score movement and companion reaction
- session 2: streak explanation
- session 3: first meaningful reward
- session 5: AI coach pattern insight
- session 7: weekly milestone

Rules:

- early progress is visible
- long-term systems unlock gradually
- no more than one new concept introduced after a session

VERIFY:

- [x] First 7-session progression path is tested or documented.
- [x] Level thresholds are deterministic.
- [x] Reward amounts are balanced and not excessive.
- [x] UI explains unlocks clearly.

### P6-03 - Currency And Monetization Boundaries

WHY:
Too many currencies and dark sinks make the app feel cheap.

Launch currencies:

- XP for progression
- Coins for earned soft rewards
- Gems only through compliant purchase flows

Banned:

- trading
- emergency gem sinks
- paid streak rescue
- paid boss retry panic
- hidden exchange rates
- purchase prompts during failure states

VERIFY:

- [x] Trading disabled or archived.
- [x] Emergency gem sinks disabled or archived.
- [x] Purchases go through `src/shared/monetization/`.
- [x] Wallet transactions are ledgered.
- [x] Entitlement tests cover free, premium, expired, restore, and purchase failure.

PHASE 6 EXIT GATE:

- [x] Reward ledger is idempotent.
- [x] Economy has no dark pattern sinks.
- [x] Monetization layer owns purchases.
- [x] Tests pass.
- [x] Typecheck passes.
- [x] Verification report updated.

---

## Phase 7 - AI Coach That Feels Real

Goal: AI coach uses real behavior or stays quiet.

### P7-01 - Coach Input Contract

WHY:
AI slop starts with vague inputs.

IMPLEMENT:

Coach may use:

- recent session grades
- preferred session lengths
- completion times
- missed days
- Focus Score factors
- streak state
- mission history
- user goal category
- notification preferences
- premium status

Coach must not use:

- raw private notes unless user explicitly provided them for coaching
- secrets
- unnecessary PII
- unvalidated storage data

VERIFY:

- [x] Coach input schema exists.
- [x] Missing data produces fallback insight.
- [x] PII is excluded from Sentry and analytics.
- [x] Tests cover empty, sparse, strong-pattern, weak-pattern, and offline inputs.

### P7-02 - Message Quality Gate

WHY:
Generic messages make the feature feel fake.

Every coach message must include at least two:

- observed behavior
- specific recommendation
- timing suggestion
- reason
- next action
- confidence level

Reject:

- "Keep going."
- "You are doing great."
- "Try focusing more."
- "Come back today."

Allow:

- "Your strongest sessions this week started after 8 PM. Try a 25-minute Recovery session tonight to protect your streak without overreaching."

VERIFY:

- [x] Message generator rejects generic templates.
- [x] Tests snapshot accepted and rejected messages.
- [x] Coach messages link to one concrete action when possible.
- [x] Free tier limits are enforced without breaking core app.

### P7-03 - Coach Integration

WHY:
Coach should support the core loop, not become another dashboard.

IMPLEMENT:

Coach integrates with:

- daily mission
- session recommendation
- streak risk
- comeback quest
- monthly report
- notifications

Rules:

- Home shows coach only when it is the best action or useful context.
- Coach cannot override streak critical or pending sync.
- Coach suggestions must be actionable.

VERIFY:

- [x] Coach suggestion can become daily mission.
- [x] Coach respects priority engine.
- [x] Coach does not show generic empty panel.
- [x] Analytics tracks shown, accepted, dismissed.

### P7-04 - Notification Budget

WHY:
Noisy notifications get apps deleted.

IMPLEMENT:

Rules:

- maximum 2 notifications per user per day
- quiet hours 10 PM to 7 AM local time
- opt-out respected
- priority:
  1. streak critical
  2. pending sync
  3. AI coach next best action
  4. daily mission reminder
  5. squad help if squads enabled
- suppress generic login reminders

VERIFY:

- [x] Tests cover budget, priority, quiet hours, opt-out, and duplicate suppression.
- [x] Notification copy is specific.
- [x] No notification fires from disabled features.

PHASE 7 EXIT GATE:

- [x] Coach messages pass quality tests.
- [x] Coach integrates with mission and recommendations.
- [x] Notification budget is enforced.
- [x] Typecheck passes.
- [x] Verification report updated.

---

## Phase 8 - Optional Systems: Ship Only If Alive

Goal: Bosses, challenges, and squads only launch if they improve the core loop.

### P8-01 - Feature Flag Matrix

WHY:
Dead features make users distrust the app.

Launch enabled by default:

- sessions
- session grading
- Focus Score
- daily mission
- companion
- streaks
- comeback quest
- basic rewards
- XP progression
- AI coach basics
- paywall
- settings

Launch optional:

- basic solo boss
- basic challenges
- squads accountability
- monthly report

Launch disabled:

- social feed
- duels
- rankings
- squad wars
- rivals
- trading
- emergency gem sinks
- complex crafting
- AR or experimental features

VERIFY:

- [x] Flags default correctly.
- [x] Disabled routes hidden from navigation.
- [x] Disabled routes hidden from Home.
- [x] Disabled deep links fall back safely.
- [x] App works with optional flags false.

### P8-02 - Basic Solo Boss

WHY:
Bosses are useful only if they create one-more-session motivation without complexity.

Launch scope:

- one active solo boss
- deterministic damage from completed sessions
- persistent health
- defeat reward
- timeout consolation
- no paid retry
- no raids
- no squad war dependency

VERIFY:

- [x] Damage calculation tested.
- [x] Boss updates from `session:completed`.
- [x] Defeat reward ledgered.
- [x] Timeout has no fear monetization.
- [x] Boss hides if unstable.

### P8-03 - Basic Challenges

WHY:
Challenges add variety only if they remain simple.

Launch scope:

- daily challenge
- weekly challenge
- one CTA per challenge
- progress from sessions
- reward ledger integration
- no social dependency

VERIFY:

- [x] Challenge progress updates from sessions.
- [x] Completion creates ledgered reward.
- [x] Empty state has one CTA.
- [x] Tests cover expiration, completion, claim, and duplicate claim.

### P8-04 - Squads Accountability

WHY:
Squads can work at low scale only as private accountability.

Launch scope:

- create squad
- join by invite
- weekly shared focus goal
- member contribution list
- supportive notification

Banned at launch:

- global feed
- rankings
- wars
- duels
- public discovery

VERIFY:

- [x] Two-person squad works.
- [x] Empty state invites user to create or join.
- [x] Sessions contribute to weekly goal.
- [x] No global population required.

PHASE 8 EXIT GATE:

- [x] Optional systems either green or disabled.
- [x] No dead navigation.
- [x] No empty social surfaces.
- [x] Tests pass for enabled optional systems.
- [x] Typecheck passes.
- [x] Verification report updated.

---

## Phase 9 - Production Hardening

Goal: VEX survives real networks, crashes, accessibility needs, and App Review.

External references checked May 5, 2026:

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines
- Apple App Store submission overview: https://developer.apple.com/app-store/submitting/
- Apple App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/

### P9-01 - Offline Sync Reliability

WHY:
Losing a focus session is unforgivable.

Offline queue supports:

- session completion
- Focus Score update
- streak update
- XP grant
- reward delivery
- mission completion
- companion state

Rules:

- queue entries use schemas
- idempotency keys required
- processing ordered by creation time
- reconnect starts sync within 10 seconds
- permanent failure shows persistent repair banner

VERIFY:

- [ ] Airplane mode completion shows local progress.
- [ ] Reconnect syncs within 10 seconds.
- [ ] Duplicate replay does not duplicate effects.
- [ ] Corrupt queue data is handled safely.
- [ ] Tests cover enqueue, replay, retry, permanent failure, and corrupt data.

### P9-02 - Error Boundaries

WHY:
One broken widget should not crash the app.

Wrap:

- Home
- onboarding
- session setup
- active session
- post-session story
- Focus dashboard
- paywall
- settings

Fallbacks:

- Home section failure: compact retry section.
- Session failure: active session recovery.
- Story failure: plain completion summary.
- Paywall failure: restore purchases and support path.

VERIFY:

- [ ] Injected render error does not crash.
- [ ] Sentry captures feature tag.
- [ ] User can retry.
- [ ] Tests cover reset behavior.

### P9-03 - Accessibility And Motion

WHY:
Polish includes users with accessibility settings.

Audit:

- labels
- roles
- hints
- 44 by 44 touch targets
- reduced motion
- dynamic text
- light and dark mode contrast
- form keyboard handling

VERIFY:

- [ ] Onboarding accessible.
- [ ] Home accessible.
- [ ] Session flow accessible.
- [ ] Story accessible.
- [ ] Paywall accessible.
- [ ] Dynamic text does not clip.
- [ ] Reduced motion path tested.

### P9-04 - Performance Gate

Targets:

- cold start to interactive Home: under 2.5 seconds median
- Home primary CTA visible: under 1.5 seconds median
- session start to timer running: under 500ms median
- story first content after ledger ready: under 300ms median

Fix common issues:

- `ScrollView` plus `.map(...)` lists
- missing FlashList `estimatedItemSize`
- missing query `staleTime`
- uncleaned realtime subscriptions
- heavy work on Home render
- uncached images
- background intervals

VERIFY:

- [ ] `npm run perf:audit` passes.
- [ ] Median targets pass across 5 runs.
- [ ] No list warnings.
- [ ] No avoidable network calls on re-render.

### P9-05 - Privacy And Security

WHY:
Trust and App Review depend on accurate data handling.

IMPLEMENT:

Data inventory:

- auth identifiers
- profile fields
- session behavior
- Focus Score
- analytics events
- purchase status
- notification token
- device diagnostics

Rules:

- secrets never in source
- auth tokens in SecureStorage wrapper only
- MMKV only for non-sensitive data
- privacy labels match real collection
- account deletion works
- data export works or is disabled
- no PII in Sentry
- no PII in analytics unless required and disclosed

VERIFY:

- [ ] Privacy inventory documented.
- [ ] Account deletion verified.
- [ ] Export verified or disabled.
- [ ] No secrets found.
- [ ] Analytics privacy tests pass.
- [ ] App Store privacy answers prepared.

### P9-06 - Paywall And RevenueCat

WHY:
Bad monetization can cause rejection and user distrust.

Approved premium:

- unlimited AI coach
- monthly Focus Report
- advanced analytics
- premium companion cosmetics
- cosmetic season track
- extra personal quests
- squad insights if squads enabled

Banned:

- paid streak rescue
- paid boss retry panic
- emergency gem prompts
- "save your progress" paywall
- blocking basic sessions
- blocking basic companion growth

VERIFY:

- [ ] Paywall copy sells growth and insight.
- [ ] Restore purchases works.
- [ ] Purchase failure has user-facing error.
- [ ] Expired entitlement falls back cleanly.
- [ ] Free tier remains useful.
- [ ] RevenueCat access only through shared monetization layer.

### P9-07 - App Store Submission Pack

Prepare:

- app name
- subtitle
- description
- keywords
- support URL
- privacy policy URL
- screenshots
- review notes
- demo account if needed
- IAP review notes
- notification permission explanation
- age rating answers
- privacy nutrition label answers

VERIFY:

- [ ] Metadata drafted.
- [ ] Privacy policy URL ready.
- [ ] Reviewer can complete onboarding and a session.
- [ ] Review notes explain subscriptions, login, offline mode, and notifications.
- [ ] Screenshots show real core loop.

PHASE 9 EXIT GATE:

- [ ] Offline sync proven.
- [ ] Error boundaries proven.
- [ ] Accessibility pass complete.
- [ ] Performance targets met.
- [ ] Privacy and monetization ready.
- [ ] App Store pack ready.
- [ ] Typecheck passes.
- [ ] Tests pass.
- [ ] Verification report updated.

---

## Phase 10 - Final Launch Gate

Goal: Make the release decision with evidence, not vibes.

### P10-01 - Required Commands

Run in order:

```bash
npm run typecheck -- --pretty false
node scripts/check-no-ts-nocheck.js
npm run lint
npm test -- --coverage
npm run perf:audit
npx expo export --platform ios --output-dir dist/ios-export-test
```

Run audits:

```bash
rg "console\." src
rg ": any\b|<any>" src
rg "@ts-ignore|@ts-nocheck|@ts-expect-error" src
rg "StyleSheet\.create|FlatList|AsyncStorage|fetch\(" src
rg "#[0-9A-Fa-f]{3,8}|rgb\(" src --glob "*.tsx"
rg "from .*archive|from '../archive|from \"../archive" src
```

VERIFY:

- [ ] Typecheck passes.
- [ ] No suppressions.
- [ ] Lint passes.
- [ ] Tests pass.
- [ ] Coverage acceptable for service layers.
- [ ] Performance audit passes.
- [ ] iOS export passes.
- [ ] Banned pattern audits are clean.

### P10-02 - Manual End-To-End Flows

VERIFY:

- [ ] Fresh install -> onboarding -> first session -> first result -> Home.
- [ ] Returning user -> Home -> recommended session -> completion -> story -> Home.
- [ ] Offline completion -> reconnect -> sync.
- [ ] App background during active session -> return -> timer correct.
- [ ] App kill during active session -> reopen -> recovery correct.
- [ ] Supabase outage -> degraded state.
- [ ] Paywall -> sandbox purchase -> entitlement active.
- [ ] Restore purchase.
- [ ] Expired entitlement fallback.
- [ ] Account deletion.
- [ ] Dark mode.
- [ ] Reduced motion.
- [ ] Large text.
- [ ] Notification permission prompt after value explanation.

### P10-03 - Release Decision Rules

Ship if all are green:

- core session loop
- Focus Score
- Home mission
- companion
- streak/comeback
- offline sync
- paywall/RevenueCat
- privacy/App Store pack
- no disabled feature reachable
- required commands

Cut first if not green:

1. squads
2. boss
3. challenges
4. monthly report
5. advanced analytics
6. cosmetics

Never cut:

- session start
- session completion
- completion ledger
- Focus Score
- Home mission
- offline sync
- error states
- paywall restore purchase if subscriptions are live

VERIFY:

- [ ] Release decision recorded in `VERIFICATION_REPORT.md`.
- [ ] Disabled systems listed with flags.
- [ ] Remaining launch scope is coherent.

---

## Launch Feature Matrix

| System | Launch Decision | Quality Bar |
|---|---|---|
| Session start | Must ship | One tap from Home, under 500ms median. |
| Session completion | Must ship | Ledgered, idempotent, offline-safe. |
| Session grading | Must ship | Deterministic, tested, reused by all systems. |
| Focus Score | Must ship | Persistent, explainable, visible on Home. |
| Home mission | Must ship | Exactly one best action. |
| Companion | Must ship | Reacts to real progress, basic growth free. |
| Streaks | Must ship | Supportive, timezone-aware, no shame copy. |
| Comeback quest | Must ship | Recovery path after missed days. |
| Rewards | Must ship | Ledgered and idempotent. |
| XP/levels | Must ship | Clear early pacing. |
| AI coach | Ship if quality gate passes | Specific, data-backed, actionable. |
| Notifications | Ship if budget enforced | Max 2/day, quiet hours, opt-out. |
| Paywall | Ship if RevenueCat verified | Growth and insight only. |
| Monthly report | Optional | Real data or disable. |
| Basic boss | Optional | Simple solo loop or disable. |
| Challenges | Optional | Basic daily/weekly only or disable. |
| Squads | Optional | Private accountability only or disable. |
| Social feed | Disable | Needs population and moderation. |
| Duels | Disable | Needs balance and population. |
| Rankings | Disable | Empty leaderboard risk. |
| Squad wars | Disable | Too complex before launch. |
| Rivals | Disable | Use past-self comparison later. |
| Trading | Archive | Abuse risk. |
| Emergency gem sinks | Archive | Dark pattern risk. |
| Complex crafting | Disable | Not core enough for launch. |
| AR/experimental | Archive | Product distraction. |

---

## Windsurf Task Packet Template

Every implementation task should be converted into this packet before coding:

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

If Windsurf cannot fill this packet, it is not ready to code.

---

## Copy System

VEX voice:

- direct
- specific
- supportive
- evidence-backed
- never shame-based
- never manipulative

Approved patterns:

- "Clean finish. No pauses. Focus Score +9."
- "Your evening sessions are strongest. Try 25 minutes after 8 PM."
- "Your streak is at risk. A 10-minute Recovery session keeps the chain alive."
- "One session is saved offline. It will sync when you are back online."
- "You missed a few days. Start small and rebuild momentum."

Banned patterns:

- "Do not lose everything."
- "Buy now to save your progress."
- "Your streak will die."
- "No items found."
- "Something went wrong."
- "Unlock success with premium."
- "Last chance."

Every empty state must include:

- what happened
- why it is okay
- one next action

Every error state must include:

- human-readable problem
- retry or fallback
- no technical stack trace

---

## Design And UI Standards For AI IDE

Rules:

- Use existing primitives before creating new UI.
- Use tokens from `src/theme/tokens/`.
- No magic numbers.
- No hardcoded hex.
- No nested cards.
- No decorative feature cards that do not perform an action.
- No spinner-only loading for data-driven screens.
- Skeleton must match loaded layout.
- Empty states need one CTA.
- Error states use shared error components where available.
- Offline state must be visible.
- Buttons need labels, roles, and hints.
- Touch targets at least 44 by 44.
- Reanimated 3 only.
- `useReducedMotion()` must gate nonessential animation.
- FlashList only for lists, with measured `estimatedItemSize`.

Screen quality checklist:

- [ ] first viewport makes purpose obvious
- [ ] one primary action
- [ ] no clipped text
- [ ] no overlapping UI
- [ ] dark mode works
- [ ] large text works
- [ ] offline visible
- [ ] loading skeleton
- [ ] empty state
- [ ] error state
- [ ] success state
- [ ] disabled state
- [ ] accessibility labels
- [ ] reduced motion

---

## Data And Event Contracts

Core events:

- `session:started`
- `session:completed`
- `session:abandoned`
- `focus-identity:score_updated`
- `streak:updated`
- `comeback:started`
- `comeback:completed`
- `companion:state_changed`
- `reward:created`
- `reward:delivered`
- `daily-mission:shown`
- `daily-mission:completed`
- `coach:suggestion_shown`
- `coach:suggestion_accepted`
- `purchase:started`
- `purchase:completed`
- `purchase:failed`

Core analytics:

- `vex_onboarding_started`
- `vex_onboarding_completed`
- `vex_session_started`
- `vex_session_completed`
- `vex_session_abandoned`
- `vex_focus_score_changed`
- `vex_daily_mission_shown`
- `vex_daily_mission_completed`
- `vex_streak_at_risk`
- `vex_streak_broken`
- `vex_comeback_started`
- `vex_comeback_completed`
- `vex_reward_delivered`
- `vex_coach_suggestion_accepted`
- `vex_paywall_viewed`
- `vex_premium_purchased`
- `vex_purchase_failed`

Rules:

- No PII in event payloads unless explicitly required and disclosed.
- Events should carry ids, types, timestamps, and numeric metrics.
- Components do not directly call PostHog or Sentry except through approved wrappers where existing architecture allows.
- Analytics follows existing `AnalyticsService` patterns.

---

## Anti-Slop Review Checklist

Before any AI-generated task is accepted, inspect for:

- [ ] New `any`.
- [ ] Hidden casts.
- [ ] Business logic inside components.
- [ ] Supabase call outside repository.
- [ ] Hook containing repository query directly.
- [ ] Component using `useQuery` directly.
- [ ] Missing error state.
- [ ] Missing empty state.
- [ ] Missing offline state.
- [ ] Spinner-only loading.
- [ ] Missing tests.
- [ ] Fake stub that returns null, empty array, or hardcoded success.
- [ ] Dead route or dead CTA.
- [ ] Feature flag ignored.
- [ ] New file over 200 lines.
- [ ] Design token violation.
- [ ] Console logging.
- [ ] Sentry PII.
- [ ] Purchase outside monetization layer.

If any item is found, the task is not complete.

---

## Final Standard

The May 30 build should feel smaller, sharper, and more complete than a feature-heavy 7/10 app.

The launch build is an 11/10 only if:

1. first session feels meaningful
2. Focus Score is visible and explainable
3. Home always gives one best action
4. companion and streak make progress emotional
5. AI coach is specific and useful
6. offline progress is safe
7. premium is ethical
8. disabled systems are invisible
9. App Store readiness is complete
10. the codebase remains clean enough that Phase 0 never needs to happen again

Any task that risks those standards must be cut, scoped down, or feature-flagged off.
