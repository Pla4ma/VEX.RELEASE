# VEX App — Production Tasks.md
> **For Windsurf AI** · Every task is atomic, verifiable, and non-negotiable.
> Generated after deep codebase + analysis review on May 4, 2026.
> Stack: Expo SDK 54 · TypeScript strict · Supabase · TanStack Query v5 · Zustand · Reanimated 3 · MMKV · Zod

---

## HOW TO READ THIS FILE

- Tasks are grouped into **Phases** (P0 → P9), ordered by dependency.
- Each task has a **WHY** (product rationale), **WHAT** (exact files/changes), and **VERIFY** (acceptance criteria).
- Never mark a task ✅ until every VERIFY item passes.
- Never skip a task to get to the "interesting" ones. Order matters.
- If a VERIFY says "zero TypeScript errors", that means `npx tsc --noEmit` passes clean.
- If a VERIFY says "tests pass", that means `jest --testPathPattern=<feature>` exits 0.
- File size hard limit: **200 lines**. If you write past it, stop and split first.
- No `any`, no `@ts-ignore`, no `TODO` as implementation, no logic in JSX, no `FlatList`, no hardcoded colors.

---

## PHASE 0 — CODEBASE HYGIENE & ANTI-SLOP FOUNDATION
> *Nothing else can be built safely until this is clean.*

### P0-01 · TypeScript Strict Pass — Eliminate All Errors
**WHY:** `npx tsc --noEmit` likely produces errors due to partial implementations across 37 active features. These are load-bearing bugs.
**WHAT:**
1. Run `npx tsc --noEmit 2>&1 | tee /tmp/ts-errors.log`. Count the errors.
2. Fix all errors in this priority order:
   - `src/features/focus-identity/` — main identity spine, must be clean first
   - `src/features/session/` and `src/features/session-completion/` — critical flow
   - `src/features/home-spine/` — entry point for every user
   - `src/features/ai-coach/` — has multiple hook files that may have type drift
   - `src/features/progression/` — service-enhanced-*.ts files likely have type issues
   - All remaining features alphabetically
3. Fix rules:
   - Replace `any` with proper generic or inferred types
   - Replace `as X` casts with validated parse boundaries + comment explaining why
   - Add missing return types to all `async function` declarations
   - Resolve all `noUncheckedIndexedAccess` violations by null-checking array access
4. Do NOT suppress errors with `@ts-ignore` or `@ts-expect-error` without a written comment explaining why the proper fix is architecturally blocked.
**VERIFY:**
- [ ] `npx tsc --noEmit` exits with code 0 and zero output
- [ ] `node scripts/check-no-ts-nocheck.js` exits with code 0
- [ ] No new `any` types introduced (grep: `grep -r ": any" src/ --include="*.ts" --include="*.tsx"` returns zero results)

---

### P0-02 · Lint Pass — Zero ESLint Errors
**WHY:** Lint errors indicate structural violations that cause runtime bugs.
**WHAT:**
1. Run `npm run lint 2>&1 | tee /tmp/lint-errors.log`
2. Fix all errors (not warnings). Focus areas:
   - Unused imports and variables
   - React hooks rules violations
   - Missing dependency arrays in `useEffect` / `useCallback` / `useMemo`
   - Any `console.log` calls (replace with Sentry breadcrumbs or remove)
3. Do not use `// eslint-disable` to silence errors without comment.
**VERIFY:**
- [ ] `npm run lint` exits 0 with zero errors
- [ ] `grep -r "console.log\|console.error\|console.warn" src/ --include="*.ts" --include="*.tsx"` returns zero results (Sentry is the logging layer)

---

### P0-03 · Dead Code Audit — Remove or Archive Unused Exports
**WHY:** Features that were partially implemented and then superseded still export dead code that confuses Windsurf and bloats the bundle.
**WHAT:**
1. Audit `src/features/` for files that are never imported anywhere:
   ```bash
   # Find files with no imports pointing to them
   find src/features -name "*.ts" -o -name "*.tsx" | while read f; do
     base=$(basename "$f" | sed 's/\.[^.]*$//');
     if ! grep -r "$base" src/ --include="*.ts" --include="*.tsx" -l | grep -v "$f" | grep -q .; then
       echo "ORPHAN: $f";
     fi;
   done
   ```
2. For each orphan file:
   - If it's a legitimate feature still needed: add it to the integration map in its `service.ts`
   - If it's superseded by a newer file: move to `archive/` with a `DEPRECATED.md` explaining what replaced it
   - If it was never supposed to be built: delete it
3. Files that should be checked specifically:
   - `src/features/economy/EmergencyGemSinks.ts` — confirm this is either feature-flagged or archived (analysis flagged as dark pattern risk)
   - `src/features/economy/TradingSystem.ts` — confirmed archive candidate per analysis
   - `src/features/boss/BossBountySystem.ts` — ensure it's feature-flagged, not live
   - `src/features/boss/WeeklyRaidSystem.ts` — ensure feature-flagged
   - `src/features/boss/SquadBossSystem.ts` — ensure feature-flagged
   - `src/features/streaks/streak-insurance.ts` — confirm this monetizes recovery not fear (see P5 for details)
**VERIFY:**
- [ ] Zero orphan files in `src/features/` (re-run the bash audit above)
- [ ] `EmergencyGemSinks.ts` is either behind a `FEATURE_FLAGS.EMERGENCY_GEM_SINKS = false` flag or moved to archive
- [ ] `TradingSystem.ts` is in archive
- [ ] TypeScript still passes after deletions

---

### P0-04 · File Size Enforcement — Split All Files Over 200 Lines
**WHY:** The `.windsurfrules` hard limit exists. Oversize files mean mixed responsibilities and untestable code.
**WHAT:**
1. Find all violations:
   ```bash
   find src/ -name "*.ts" -o -name "*.tsx" | while read f; do
     lines=$(wc -l < "$f");
     if [ "$lines" -gt 200 ]; then echo "$lines $f"; fi;
   done | sort -rn
   ```
2. Split each file. Rules for splitting:
   - Types → `types.ts`
   - Zod schemas → `schemas.ts`
   - Business logic → `service.ts` or sub-services with descriptive names
   - Supabase queries → `repository.ts`
   - Hooks → `hooks.ts`
   - Component internals → sub-components in `components/`
3. Known large files likely needing splits (verify current state):
   - `src/features/ai-coach/CoachMemory.ts`
   - `src/features/ai-coach/PersonalQuestGenerator.ts`
   - `src/features/ai-coach/PredictiveInterventionEngine.ts`
   - `src/features/progression/service-enhanced.ts`
   - `src/features/boss/AdaptiveDifficultyEngine.ts`
   - `src/features/focus-identity/FocusIdentityEngine.ts`
   - Any component file touching 200 lines
**VERIFY:**
- [ ] Zero files over 200 lines in `src/` (re-run the bash audit above)
- [ ] TypeScript still passes after all splits
- [ ] Tests still pass after all splits

---

### P0-05 · Dependency Audit — Confirm All Imports Resolve
**WHY:** Features added during the transformation phases may import from paths that don't exist yet, causing runtime crashes.
**WHAT:**
1. Run Metro bundler dry-run: `npx expo export --platform ios --output-dir /tmp/expo-export-test 2>&1 | grep -i "error\|cannot find\|module not found"` (or equivalent)
2. For every import resolution error: either create the missing file or fix the import path
3. Ensure all `@/` path aliases resolve correctly per `tsconfig.json` paths
4. Specifically verify these aliased features exist and export correctly:
   - `@/events` → `src/events/index.ts`
   - `@/utils/debug` → exists
   - `@/session/types` → `src/features/session/types.ts`
   - `@/features/boss/schemas` → `src/features/boss/schemas.ts`
**VERIFY:**
- [ ] Metro bundler resolves all imports without errors
- [ ] `npx tsc --noEmit` still clean
- [ ] App starts on simulator without any "module not found" red screens

---

## PHASE 1 — FOCUS IDENTITY ENGINE (THE SPINE)
> *This is the main identity system. Everything else in the app should reference or feed into it.*
> *The analysis is correct: Focus Score is the right main spine. Do not archive it — deepen it.*

### P1-01 · Focus Identity Engine — Complete Repository Layer
**WHY:** `FocusIdentityEngine.ts` uses `MMKVStorageAdapter` for local storage but has no Supabase persistence layer. Score is lost on reinstall and cannot be synced to monthly reports.
**WHAT:**
Create `src/features/focus-identity/repository.ts` (if incomplete — audit first):
```typescript
// Dependencies: Supabase client, focus_identity_scores table
// Consumers: FocusIdentityEngine, MonthlyReport, FocusScoreDashboard
```
Required functions (each must have explicit async return types + Zod validation of DB response):
- `fetchFocusScore(userId: string): Promise<FocusScoreRecord | null>`
- `upsertFocusScore(userId: string, score: FocusScoreRecord): Promise<void>`
- `fetchScoreHistory(userId: string, days: number): Promise<FocusScoreHistoryPoint[]>`
- `fetchMonthlyReportData(userId: string, year: number, month: number): Promise<MonthlyReportData | null>`
- `saveMonthlyReportData(userId: string, data: MonthlyReportData): Promise<void>`

Add Supabase table migration (document in `docs/brain/domain-model.md`):
```sql
-- focus_identity_scores
CREATE TABLE focus_identity_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  score numeric(5,1) NOT NULL DEFAULT 550,
  consistency_score numeric(4,1) NOT NULL DEFAULT 0,
  streak_stability_score numeric(4,1) NOT NULL DEFAULT 0,
  session_quality_score numeric(4,1) NOT NULL DEFAULT 0,
  diversity_score numeric(4,1) NOT NULL DEFAULT 0,
  recency_score numeric(4,1) NOT NULL DEFAULT 0,
  sessions_this_month integer NOT NULL DEFAULT 0,
  last_calculated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE focus_identity_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own score" ON focus_identity_scores
  USING (auth.uid() = user_id);
```
**VERIFY:**
- [ ] `repository.ts` exists with all 5 functions
- [ ] Each function validates its DB response with Zod `.parse()`
- [ ] Each function reports errors to Sentry in the catch block
- [ ] `src/features/focus-identity/__tests__/repository.test.ts` exists and tests: fetch success, fetch empty (no row), upsert creates + updates, error path with Sentry call
- [ ] TypeScript clean

---

### P1-02 · Focus Identity Engine — Wire Session Completion → Score Update
**WHY:** The engine exists but it's not confirmed to be called on every session completion. This is the most critical integration in the app — without it, the whole identity spine is meaningless.
**WHAT:**
1. In `src/features/focus-identity/integration.ts` (create if missing), add:
   ```typescript
   // Dependencies: session:completed event, FocusIdentityEngine, repository
   // Consumers: AppProviders bootstrap
   export function initializeFocusIdentityIntegration(): () => void
   ```
   This function:
   - Subscribes to `session:completed` on the EventBus
   - Calls `FocusIdentityEngine.recordSession(sessionSummary)` 
   - Persists the updated score via repository
   - Emits `focus-identity:score_updated` event with `{ userId, previousScore, newScore, delta, factors }`
   - Handles errors without crashing (Sentry capture + graceful fallback)

2. Register `initializeFocusIdentityIntegration()` in `src/app/bootstrap.ts`

3. Confirm `FocusIdentityEngine.recordSession()` correctly uses the 5-factor weighting:
   - CONSISTENCY (35%) — based on `session.completedAt` vs daily goal
   - STREAK_STABILITY (30%) — based on current streak length + history
   - SESSION_QUALITY (15%) — based on `session.purityScore` + grade
   - DIVERSITY (10%) — based on session mode variety over last 30 days
   - RECENCY (10%) — recency-weighted completion rate

4. Session grade → Focus Score contribution mapping:
   ```
   S-grade: +12 to +15 points (base 12 + quality bonus)
   A-grade: +8 to +11 points
   B-grade: +5 to +7 points
   C-grade: +2 to +4 points
   D-grade: +0 to +1 points (barely passing, still shows improvement)
   ABANDONED: -25 to -50 points (harsh — creates intentionality)
   MISSED_DAY: -15 to -35 points (based on streak state)
   ```

**VERIFY:**
- [ ] Complete a mock session → `focus-identity:score_updated` event fires with correct delta
- [ ] Score persists to Supabase (check repo test)
- [ ] Score is recalculated correctly for each grade (unit test: `FocusIdentityEngine.test.ts` covers all grade cases)
- [ ] `bootstrap.ts` calls `initializeFocusIdentityIntegration()`
- [ ] TypeScript clean

---

### P1-03 · Focus Score Dashboard — Complete All UI States
**WHY:** `FocusScoreDashboard.tsx` exists but likely lacks all required states per `.windsurfrules`.
**WHAT:**
Audit `src/features/focus-identity/FocusScoreDashboard.tsx` and `src/features/focus-identity/components/`:

Required states (create missing components — each sub-component ≤200 lines):
1. **Loading state**: `FocusScoreDashboardSkeleton.tsx` — animated skeleton matching the full dashboard layout (score circle, factor bars, trend graph). Use Reanimated 3 shimmer. No spinner.
2. **Empty state**: `FocusScoreDashboardEmpty.tsx` — for users with 0 sessions. Show the score at 550 with "Complete your first session to begin building your Focus Identity." CTA to start session.
3. **Error state**: `FocusScoreDashboardError.tsx` — error message + "Try Again" button that calls the retry function from the hook.
4. **Success/Full state** (already exists but audit): 
   - Large score display (300-850) with animated count-up on load
   - Score band label prominently displayed ("Disciplined", "Elite", etc.)
   - Percentile: "You're in the top X% of VEX users"
   - 5 factor breakdown bars with labels and percentages
   - 30-day trend sparkline (simple line, no over-engineering)
   - "What changed" section: last session's impact on score
   - Monthly report CTA (premium gate if not subscribed)

5. **Compact widget variant**: `FocusScoreWidget.tsx` for home screen — score number, band label, small trend arrow (up/down). Max 60 lines.

All components:
- Use design system tokens only (`shared/design/tokens.ts`)
- All interactive elements have `accessibilityLabel` and `accessibilityRole`
- Minimum 44×44pt touch targets
**VERIFY:**
- [ ] Dashboard renders loading skeleton before data loads
- [ ] Dashboard renders empty state for userId with 0 sessions
- [ ] Dashboard renders error state + retry when fetch fails
- [ ] Dashboard renders full state with all 5 factor bars
- [ ] `FocusScoreWidget.tsx` exists and renders in <3 lines of JSX from HomeScreen
- [ ] `src/features/focus-identity/__tests__/FocusScoreDashboard.test.tsx` covers all 4 states
- [ ] No hardcoded colors or sizes
- [ ] TypeScript clean

---

### P1-04 · Session Grading System — Formalize and Expose
**WHY:** Session grading (S/A/B/C/D) is referenced throughout the codebase but may not be formally extracted as a standalone, testable service.
**WHAT:**
1. Create `src/features/session-completion/grading-service.ts`:
   ```typescript
   // Dependencies: session completion data
   // Consumers: session-completion service, focus-identity integration, session-story
   export type SessionGrade = 'S' | 'A' | 'B' | 'C' | 'D';
   
   export interface GradingInput {
     durationCompletedSeconds: number;
     targetDurationSeconds: number;
     pauseCount: number;
     backgroundTimeSeconds: number;
     purityScore: number; // 0-100
     focusInterruptions: number;
     mode: SessionMode;
     timeOfDay: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
     isInPeakWindow: boolean;
   }
   
   export interface GradingResult {
     grade: SessionGrade;
     gradeLabel: string; // "Deep Focus", "Strong Session", etc.
     gradeScore: number; // 0-100 numeric equivalent
     breakdown: {
       completionFactor: number;  // Did user finish?
       purityFactor: number;      // Purity score contribution
       disciplineFactor: number;  // Pause/interruption penalty
       bonusFactor: number;       // Peak window + no-pause bonus
     };
     focusScoreImpact: number; // Pre-calculated delta for FocusIdentityEngine
     flavorText: string; // "Clean finish. No pauses." etc.
   }
   
   export function calculateSessionGrade(input: GradingInput): GradingResult
   ```

2. Grade thresholds:
   ```
   S: completionFactor=100% + purityScore≥90 + pauseCount=0
   A: completionFactor≥90% + purityScore≥75
   B: completionFactor≥75% + purityScore≥50
   C: completionFactor≥50% + purityScore≥25
   D: completionFactor<50% OR purityScore<25 (but session marked complete)
   ```

3. Wire `calculateSessionGrade()` into `src/features/session-completion/service.ts` so every `buildCompletionLedger()` call includes the grade.

4. Expose `grade` in `CompletionLedger` type and `SessionCompletionNavigationParams` so the PostSessionStoryScreen can display it.
**VERIFY:**
- [ ] `grading-service.ts` exists with `calculateSessionGrade()` 
- [ ] `src/features/session-completion/__tests__/grading-service.test.ts` covers: S grade (perfect session), D grade (barely finished), all intermediate grades, mode-specific adjustments, peak window bonus
- [ ] `CompletionLedger` includes `grade: SessionGrade`
- [ ] PostSessionStoryScreen displays the grade
- [ ] TypeScript clean

---

### P1-05 · Home Screen — Wire Focus Score Widget
**WHY:** The home screen's `GreetingHeader` shows level and streak but not the most important identity number: Focus Score.
**WHAT:**
1. Add `FocusScoreWidget` (from P1-03) to `HomeScreen.tsx` between `GreetingHeader` and the primary rail.
2. The widget must:
   - Pull score from `useFocusScore(userId)` hook
   - Show loading skeleton while loading
   - Be tappable → navigate to `FocusIdentityDashboard` screen
   - Show subtle up/down arrow based on last session's delta
3. Register `FocusIdentityDashboard` route in `navigation/types.ts` and add to `RootStackScreens.tsx`:
   ```typescript
   // In ExtendedRootStackParams:
   FocusIdentityDashboard: undefined;
   ```
4. Create `src/screens/focus-identity/FocusIdentityDashboardScreen.tsx` — wraps `FocusScoreDashboard` with nav header.
**VERIFY:**
- [ ] Home screen renders FocusScoreWidget for authenticated users
- [ ] Tapping widget navigates to FocusIdentityDashboardScreen
- [ ] Widget shows skeleton during load, score when loaded
- [ ] Route is typed in `ExtendedRootStackParams`
- [ ] TypeScript clean

---

## PHASE 2 — DAILY MISSION SYSTEM (THE DAILY HOOK)
> *Users must always know "what should I do right now". This collapses all competing priorities into one clear action.*

### P2-01 · Daily Mission Service — Build the Priority Engine
**WHY:** The home-spine `priority-service.ts` exists but the Phase Audit Report flagged it as having no persistence layer, no loading states, and no tests. This is the core of D1/D7 retention.
**WHAT:**
1. Audit `src/features/home-spine/priority-service.ts` current state.
2. Complete `src/features/home-spine/repository.ts` (create if missing):
   ```typescript
   // Dependencies: Supabase daily_missions table
   // Consumers: priority-service, HomeScreen
   ```
   Functions needed:
   - `fetchTodaysMission(userId: string): Promise<DailyMission | null>`
   - `upsertTodaysMission(userId: string, mission: DailyMission): Promise<void>`
   - `markMissionCompleted(userId: string, missionId: string): Promise<void>`
   - `fetchMissionHistory(userId: string, days: number): Promise<DailyMission[]>`

3. Mission priority logic in `priority-service.ts` (one mission per day, chosen by situation):
   ```
   Priority order (highest wins):
   1. COMEBACK_QUEST — user missed 3+ days, comeback quest active
   2. STREAK_CRITICAL — streak at risk (< 4 hours remaining)
   3. BOSS_NEAR_DEFEAT — active boss with ≤ 20% HP remaining
   4. NEW_USER — user has < 3 total sessions (first-week onboarding arc)
   5. SQUAD_GOAL_CLOSE — squad ≥ 80% of weekly goal, user hasn't contributed today
   6. STREAK_PROTECTION — streak at risk (< 12 hours remaining)
   7. WEEKLY_BOSS — weekly boss exists and is active
   8. DEFAULT — "Build your Focus Score" with AI-suggested duration/mode
   ```

4. Daily mission structure:
   ```typescript
   interface DailyMission {
     id: string;
     userId: string;
     date: string; // YYYY-MM-DD
     type: MissionType;
     title: string;
     description: string;
     ctaLabel: string;
     targetDurationSeconds: number;
     targetMode: SessionMode | null;
     completedAt: string | null;
     expiresAt: string; // midnight local time
     urgencyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
   }
   ```

5. Generate mission once per day (not on every screen view) — check `fetchTodaysMission()` first, generate only if null or date mismatch.

6. Emit `home:daily_mission_generated` event when new mission is created.
**VERIFY:**
- [ ] `repository.ts` exists with 4 functions
- [ ] `priority-service.ts` correctly picks mission by priority order
- [ ] Mission is persisted to Supabase (not regenerated on every app open)
- [ ] `src/features/home-spine/__tests__/priority-service.test.ts` covers all 8 priority cases
- [ ] `src/features/home-spine/__tests__/repository.test.ts` covers CRUD operations
- [ ] TypeScript clean

---

### P2-02 · Daily Mission — Home Screen UI
**WHY:** The home screen shows many competing items. The daily mission needs to be the unmissable centerpiece.
**WHAT:**
1. Create `src/features/home-spine/components/DailyMissionCard.tsx` (≤200 lines):
   - Visually dominant card — this is the most important element on the screen
   - Shows mission title, description, urgency indicator, CTA button
   - HIGH urgency: red accent, pulsing border (Reanimated 3)
   - MEDIUM urgency: orange accent
   - LOW urgency: default card style
   - Shows timer countdown if urgency is HIGH (streak expires in X hours)
   - "See Details" chevron that expands inline OR navigates to detail
   - Completed state: strikethrough + celebration micro-animation

2. Create `DailyMissionCardSkeleton.tsx`, `DailyMissionCardEmpty.tsx` (no mission = rare, show "Rest day — great for reflection"), `DailyMissionCardError.tsx`.

3. Wire into `src/screens/home/components/HomeContent.tsx` as the first content element after the greeting header.

4. Tapping the CTA should navigate to `SessionStack/SessionSetup` with the mission's `targetDurationSeconds` and `targetMode` pre-filled as params.

5. On session completion, check if completed session satisfies the daily mission → call `markMissionCompleted()`.
**VERIFY:**
- [ ] `DailyMissionCard` renders all 3 urgency styles correctly
- [ ] Tapping CTA pre-fills session setup with mission params
- [ ] Mission shows as completed after qualifying session
- [ ] HIGH urgency card has visible pulsing animation
- [ ] All 4 states (loading, empty, error, success) render
- [ ] Component is ≤200 lines (split if needed)
- [ ] TypeScript clean

---

### P2-03 · Daily Mission — Tomorrow Preview
**WHY:** `tomorrowPreviewService.ts` exists. It needs to be surfaced on the completion screen AND home screen to create anticipation.
**WHAT:**
1. Audit `src/features/home-spine/tomorrowPreviewService.ts` — ensure it:
   - Calculates what tomorrow's mission will likely be (based on current state)
   - Returns a `TomorrowPreview` object: `{ previewTitle, previewDescription, expectedReward, reasonToReturn }`

2. Surface in `src/features/session-story/screens/PostSessionStoryScreen.tsx`:
   - After the session result summary, add a "Tomorrow" section
   - Shows: "Tomorrow's mission: [preview]" with the reward teaser
   - This is the last thing the user sees before leaving the app

3. Surface on home screen (HomeContent bottom section):
   - "Come back tomorrow" card — small, below daily mission
   - Shows tomorrow's preview + what reward is waiting

4. Ensure `TomorrowPreview` is generated server-side via `jobs/notifications/weekly-report.ts` pattern — not just client-side.
**VERIFY:**
- [ ] PostSessionStoryScreen shows tomorrow preview
- [ ] Home screen shows "tomorrow" section for users who already completed today's mission
- [ ] `TomorrowPreview` has loading/empty/error states
- [ ] `src/features/home-spine/__tests__/tomorrowPreviewService.test.ts` exists
- [ ] TypeScript clean

---

## PHASE 3 — SESSION COMPLETION CEREMONY (THE EMOTIONAL PEAK)
> *The post-session moment is the most important in the app. It must tell a story, not dump stats.*

### P3-01 · Post-Session Story Screen — Full Implementation
**WHY:** `PostSessionStoryScreen.tsx` exists but the session story system (SessionStoryEngine, StoryBeatCalculator) needs to produce emotionally resonant output — not a stats dump. This screen determines whether users come back tomorrow.
**WHAT:**
1. Audit `src/features/session-story/SessionStoryEngine.ts` and `StoryBeatCalculator.ts`.
2. Ensure `StoryBeatCalculator.ts` produces story beats in this narrative order:
   ```
   Beat 1: THE RESULT (2-3 seconds)
   → Grade reveal with animation (S/A/B/C/D letter, color-coded)
   → "25 minutes. Grade A." — simple, declarative
   
   Beat 2: THE IDENTITY IMPACT (2-3 seconds)
   → Focus Score delta: "+8 points → Now 634 (Strong)"
   → If crossed a band: "You just reached DISCIPLINED" — celebratory
   
   Beat 3: THE PROGRESSION (1-2 seconds)
   → XP earned, level progress bar tick
   → Boss damage if boss active: "22 damage dealt. Boss at 18% HP."
   → Streak update: "7-day streak. Creature grew."
   
   Beat 4: THE RETURN HOOK (2-3 seconds)
   → Tomorrow preview (from P2-03)
   → One specific reason to come back: "One more session defeats the boss"
   
   Beat 5: THE CTA
   → "Go Home" button → HomeScreen
   → "One More" button → SessionSetup (pre-filled with recommended mode)
   ```

3. Animate beats sequentially using Reanimated 3 (fade-in-up each beat, staggered 400ms).

4. The screen must receive data via navigation params (`PostSessionStory` route) — params include: `sessionId`, `grade`, `focusScoreDelta`, `xpEarned`, `streakDay`, `bossContext`, `tomorrowPreview`.

5. Create `src/features/session-story/screens/PostSessionStoryScreen.tsx` loading state: brief 1-second "Calculating your results..." with skeleton while StoryBeatCalculator runs.

6. Grade-specific flavor text examples (sample — create 5 per grade):
   ```
   S: "Flawless. No pauses. Your best work."
   A: "Strong focus. Clean execution."
   B: "Solid session. You showed up."
   C: "You finished. That matters more than the grade."
   D: "A hard session. The discipline to finish anyway counts."
   ```
**VERIFY:**
- [ ] Story beats play in correct sequence with staggered animation
- [ ] Grade letter is prominently displayed with correct color
- [ ] Focus Score delta is shown with animated count
- [ ] Boss damage beat appears only when boss is active
- [ ] "One More" button pre-fills session with recommended mode
- [ ] Screen has loading/error states
- [ ] `src/features/session-story/__tests/SessionStoryEngine.test.ts` covers beat calculation for each grade
- [ ] TypeScript clean

---

### P3-02 · Completion Ceremony — Reward Staging (Not Dump)
**WHY:** The Phase Audit identified "reward dump" as a major product problem. Users get +8 rewards at once → nothing feels special. This task fixes that.
**WHAT:**
1. Audit `src/features/rewards/service.ts` and the completion reward pipeline.
2. Implement reward staging in the PostSessionStoryScreen:
   - **Primary reward** (shown prominently in Beat 3): the single most meaningful reward (Focus Score delta or level-up if it occurred)
   - **Secondary rewards** (shown as a tray that slides up after Beat 3): XP, coins, streak update
   - **Bonus rewards** (shown separately if triggered): chest, achievement badge, cosmetic — only one per session max
   - Rule: no more than 3 distinct reward elements shown simultaneously
3. Update `CompletionLedger` in `src/features/session-completion/schemas.ts`:
   ```typescript
   interface CompletionLedger {
     // existing fields...
     grade: SessionGrade; // from P1-04
     primaryReward: PrimaryReward; // Focus Score delta OR level-up
     secondaryRewards: SecondaryReward[]; // XP, coins, streak (max 3)
     bonusReward: BonusReward | null; // chest/badge/cosmetic (at most 1)
   }
   ```
4. If user earned a chest, defer its opening to a separate modal AFTER the story screen, not during.
**VERIFY:**
- [ ] PostSessionStoryScreen never shows more than 3 rewards at once
- [ ] Chest opening happens in separate modal after story screen
- [ ] Level-up (if it occurred) gets its own celebration beat (existing `LevelUpCelebration.tsx`)
- [ ] `CompletionLedger` schema updated and all consumers compile
- [ ] TypeScript clean

---

## PHASE 4 — STREAK CREATURE (THE EMOTIONAL ANCHOR)
> *The companion/creature is confirmed as one of the best retention systems. It needs personality and real stakes.*

### P4-01 · Companion Personality Engine — Validate and Complete
**WHY:** `CompanionPersonalityEngine.ts` was confirmed complete in the BONUS audit, but the creature's personality traits (morning owl, night owl, etc.) must be saved persistently and reflected in its visual state.
**WHAT:**
1. Audit `src/features/companion/CompanionPersonalityEngine.ts` — verify it stores personality type.
2. Personality must be determined from session history and PERSISTED (not recalculated every time):
   ```typescript
   type CreaturePersonality =
     | 'EARLY_BIRD'       // >60% sessions before noon
     | 'NIGHT_OWL'        // >60% sessions after 8pm
     | 'MARATHON_RUNNER'  // avg session >45 min
     | 'SPRINTER'         // avg session <20 min, high completion
     | 'DISCIPLINED'      // zero-pause session rate >50%
     | 'SOCIAL'           // >20% squad sessions
     | 'EXPLORER'         // used 4+ different session modes
     | 'CONSISTENT'       // 7+ day streak at least once
   ```
3. Personality must update weekly (not every session).
4. The personality must affect the companion's displayed name suffix on ProfileScreen:
   - EARLY_BIRD: "[Name] the Early Bird"
   - NIGHT_OWL: "[Name] the Night Owl"
   - etc.

5. Creature evolution stages must be fully defined with clear unlock conditions:
   ```typescript
   const EVOLUTION_STAGES = [
     { stage: 0, name: 'Egg',      requirement: 0,   description: 'Just starting' },
     { stage: 1, name: 'Hatchling',requirement: 3,   description: '3-day streak' },
     { stage: 2, name: 'Juvenile', requirement: 7,   description: '7-day streak' },
     { stage: 3, name: 'Adult',    requirement: 14,  description: '14-day streak' },
     { stage: 4, name: 'Guardian', requirement: 30,  description: '30-day streak' },
     { stage: 5, name: 'Mythic',   requirement: 100, description: '100-day streak' },
   ];
   ```
6. When creature evolves: full-screen celebration moment in `PostSessionStoryScreen` (Beat 3 addition).

7. Streak break: creature becomes "wounded" (visual indicator) but does NOT die. Comeback quest heals it.
**VERIFY:**
- [ ] Personality is calculated from session history and saved to Supabase
- [ ] Personality updates weekly (job or on-login check)
- [ ] Evolution stages are defined and creature advances correctly
- [ ] Creature evolution triggers celebration in PostSessionStoryScreen
- [ ] Streak break → creature wounded (not dead) visual state
- [ ] `src/features/companion/__tests__/CompanionPersonalityEngine.test.ts` covers personality calculation for each type
- [ ] TypeScript clean

---

### P4-02 · Streak Funeral Screen — Rename to Streak Recovery Screen
**WHY:** `StreakFuneralScreen.tsx` exists. The name "funeral" is demotivating. The analysis correctly identifies that apps that punish failure lose users. Rebrand as recovery, not death.
**WHAT:**
1. Rename `src/screens/streaks/StreakFuneralScreen.tsx` → `src/screens/streaks/StreakRecoveryScreen.tsx`
2. Update all references in navigation types and navigators
3. Rewrite the screen content:
   - **Remove**: any shame-based language, skull imagery, "you failed" framing
   - **Add**: 
     - Wounded creature animation (sad but alive)
     - "Your streak broke. But your creature survived."
     - "Comeback Quest unlocked — complete 3 sessions to restore full health"
     - Progress indicator: 0/3 comeback sessions
     - "Begin Comeback" CTA → SessionSetup with RECOVERY mode pre-filled
4. Emit `streak:recovery_started` event when user taps "Begin Comeback"
**VERIFY:**
- [ ] File renamed, all navigation references updated
- [ ] Screen shows wounded creature (not dead/funeral imagery)
- [ ] Comeback Quest progress is shown (0/3)
- [ ] "Begin Comeback" CTA works
- [ ] TypeScript and navigation types clean

---

### P4-03 · Comeback Quest System — Full Implementation
**WHY:** `ComebackQuestSystem.ts` exists but `PHASE_AUDIT_REPORT.md` flagged it as partial. This is high-ROI retention: handling failure gracefully is how apps keep real humans.
**WHAT:**
1. Audit `src/features/streaks/ComebackQuestSystem.ts` — verify it has:
   - `initiateComebackQuest(userId: string, brokenStreakLength: number): Promise<ComebackQuest>`
   - `recordComebackSession(userId: string, questId: string, sessionId: string): Promise<ComebackProgress>`
   - `completeComebackQuest(userId: string, questId: string): Promise<ComebackReward>`

2. Comeback Quest requirements (adjust based on broken streak length):
   ```
   Streak 1-6 days broken:   2 sessions to complete comeback
   Streak 7-29 days broken:  3 sessions to complete comeback
   Streak 30+ days broken:   3 sessions + 1 must be 25+ min
   ```

3. Comeback Quest reward (NOT a streak restore — that's the fear monetization the analysis warned against):
   ```
   Reward: Phoenix Badge (permanent achievement)
   Reward: +50 Focus Score recovery bonus
   Reward: Creature healed to full
   Reward: "Resilient" title unlocked
   NOT: Streak restored to previous length (that devalues streaks)
   NOTE: A new streak starts fresh — but the comeback shows on the profile
   ```

4. Wire comeback quest display to home screen (DailyMissionCard type: `COMEBACK_QUEST` — highest priority per P2-01).

5. Ensure `src/features/streaks/__tests__/ComebackQuestSystem.test.ts` covers:
   - Quest initiation on streak break
   - Progress tracking (1/3, 2/3, 3/3)
   - Quest completion with correct rewards
   - Repeat comebacks (second streak break after first comeback)
**VERIFY:**
- [ ] Streak break auto-initiates comeback quest
- [ ] Comeback quest appears as highest-priority daily mission on HomeScreen
- [ ] Completing 3 sessions completes the quest
- [ ] Phoenix Badge is granted (check achievements feature)
- [ ] Creature heals on quest completion (event fired, companion responds)
- [ ] Tests pass
- [ ] TypeScript clean

---

## PHASE 5 — BOSS SYSTEM (SESSION-TO-SESSION MOTIVATION)
> *Bosses are the "one more session" hook. Keep them metaphorical, not an RPG simulator.*
> *Analysis was WRONG to suggest fully archiving bosses — they're strong. But they need simplification.*

### P5-01 · Boss System — Establish Clear Feature Flag Hierarchy
**WHY:** The boss feature has 7+ subsystems (BossBountySystem, BossPrimeTimeSystem, SquadBossSystem, WeeklyRaidSystem, BossSpawnScheduler, AdaptiveDifficultyEngine, CriticalHitSystem). Not all should be active for new users.
**WHAT:**
1. In `src/constants/features.ts`, ensure these flags exist with correct defaults:
   ```typescript
   BOSS_CORE: true,              // Solo boss, damage from sessions — always on
   BOSS_ADAPTIVE_DIFFICULTY: true, // Difficulty adjusts to user level — on
   BOSS_PRIME_TIME: false,       // Prime-time event bosses — feature flag off by default
   BOSS_SQUAD: false,            // Cooperative squad boss — off by default  
   BOSS_WEEKLY_RAID: false,      // Weekly raid system — off by default
   BOSS_BOUNTY: false,           // Bounty system — off by default
   BOSS_CRITICAL_HIT: false,     // Critical hit system — off by default
   ```

2. Wrap each non-core system with the feature flag in its initialization code.

3. Ensure BOSS_CORE behavior is:
   - One active solo boss per user at a time
   - Boss takes damage equal to: `focusedMinutes × purityMultiplier × streakBonus`
   - `purityMultiplier`: 1.0 (S-grade) → 0.4 (D-grade)
   - `streakBonus`: 1.0 + (streakDays × 0.01) capped at 1.5
   - Boss has HP of 100 (medium) or 200 (hard) — no more complex HP systems until BOSS_ADAPTIVE is deeply tested
   - When boss HP hits 0: defeated. Loot is granted. New boss spawns from roster.

4. Boss metaphor names (already good in the codebase — verify these exist):
   - The Scroll Beast (phone distraction)
   - The Deadline Wraith (avoidance)
   - The Chaos Hydra (multitasking)
   - The Burnout Giant (overwork)
   - The Doubt Phantom (self-doubt)
**VERIFY:**
- [ ] `BOSS_CORE: true` and all other flags false in development `.env`
- [ ] All non-core boss systems are gated by their feature flags
- [ ] Damage formula produces correct output for test cases (unit test)
- [ ] Boss metaphor names are used in BossScreen UI
- [ ] TypeScript clean

---

### P5-02 · Boss Screen — Complete All UI States
**WHY:** `BossScreen.tsx` exists in navigation but may not have all required states.
**WHAT:**
Create `src/screens/boss/BossScreen.tsx` with full states (audit first, add missing):
1. **Active boss state**: 
   - Boss art/illustration (SVG or existing assets)
   - HP bar (animated, red/orange gradient)
   - HP remaining label: "247 HP remaining"
   - Last session's damage: "+22 damage from your last session"
   - "How to deal more damage" — expandable info: focus longer + higher grade = more damage
   - Active boss name + metaphor subtitle
   - Estimated sessions to defeat: "~3 more sessions"
   
2. **No active boss state**: "Boss defeated! New challenger spawns when you complete your next session." with CTA to start session.

3. **Boss defeated state** (transition screen): Full-screen celebration, loot display, new boss tease.

4. **Loading state**: skeleton matching the boss card layout.

5. **Error state**: error + retry.

6. HP percentage shown prominently in `HomePrimaryRail` or `HomeSecondaryRail` so users see boss progress without navigating away — shows "🔥 22% HP left" as a teaser card.
**VERIFY:**
- [ ] BossScreen renders active boss with HP bar
- [ ] BossScreen renders "no boss" state
- [ ] Boss HP visible from HomeScreen as a teaser element
- [ ] Boss defeat triggers celebration + loot reveal
- [ ] All 4 states render
- [ ] TypeScript clean

---

### P5-03 · Streak Insurance — Audit for Hostile Monetization
**WHY:** The analysis specifically flagged streak insurance as a dark-pattern risk. This task ensures it's ethical.
**WHAT:**
1. Audit `src/features/economy/StreakInsurance.ts` and `src/features/streaks/streak-insurance.ts`.
2. Apply these ethical rules:
   - Streak insurance must be purchased BEFORE the streak breaks (pro-active, not reactive)
   - It should feel like "preparation" not "punishment avoidance"
   - Insurance can be earned for free through 7-day engagement milestones (don't ONLY sell it)
   - Max 1 insurance activation per 30 days (prevents it becoming "buy unlimited saves")
   - When insurance activates: show the user "Your insurance protected your streak. New insurance unlocks in X days."
3. Remove or archive `src/features/economy/EmergencyGemSinks.ts` if it contains "pay to save your streak mid-break" mechanics. Replace with the comeback quest flow from P4-03.
4. Remove or archive the `StreakWager` mechanics (found in `archive/economy-dark-patterns/`). These are already archived — ensure they're NOT referenced from active code.
**VERIFY:**
- [ ] `grep -r "StreakWager\|WagerSheet\|streak.*wager" src/` returns zero results
- [ ] Streak insurance is purchase-before-break only (no "pay to restore after break")
- [ ] Insurance can be earned free via 7-day milestone
- [ ] `EmergencyGemSinks.ts` is either archived or behind a disabled feature flag
- [ ] TypeScript clean

---

## PHASE 6 — AI COACH (THE DIFFERENTIATION LAYER)
> *The AI coach must feel personal and intelligent. Generic motivational fluff = users ignore it.*

### P6-01 · AI Coach — Consolidate Duplicate Hook Files
**WHY:** `src/features/ai-coach/` has: `hooks.ts`, `hooks-enhanced.ts`, `hooks-offline.ts`, `hooks-realtime.ts`. This is hook soup. Consumers don't know which to use.
**WHAT:**
1. Audit what each hook file exports:
   - `hooks.ts` — primary hooks
   - `hooks-enhanced.ts` — enhanced variants
   - `hooks-offline.ts` — offline-aware variants
   - `hooks-realtime.ts` — realtime subscription hooks
2. Consolidate into a clear structure:
   - `hooks/use-coach-recommendation.ts` — primary recommendation hook
   - `hooks/use-coach-intervention.ts` — active intervention hook
   - `hooks/use-coach-memory.ts` — coach memory/history hook
   - `hooks/use-personal-quest.ts` — personal quest hook
   - `hooks/index.ts` — re-exports
3. Delete the old `hooks-*.ts` files after migration. Update all consumers.
4. Each consolidated hook must handle:
   - Loading state
   - Error state with retry
   - Offline degraded state (return last known recommendation from MMKV cache)
**VERIFY:**
- [ ] Old `hooks-enhanced.ts`, `hooks-offline.ts`, `hooks-realtime.ts` are deleted
- [ ] All consumers updated to import from `hooks/` subdirectory
- [ ] Each hook has loading/error/offline states
- [ ] TypeScript clean

---

### P6-02 · AI Coach — Personal Message Quality Standards
**WHY:** The analysis is correct — generic messages ("You're doing great!") are ignored. Specific, data-driven messages are retained. This task enforces quality.
**WHAT:**
1. Audit `src/features/ai-coach/message-generator.ts` — find all message templates.
2. Apply this rule to every message: **it must reference at least one specific data point from the user's session history.**
3. Message templates that must exist (replace generic ones):
   ```
   // Peak window message:
   "Your last 4 A-grade sessions were at 8-9 PM. Tonight at 8 is your best window."
   
   // Streak risk message:
   "Your 12-day streak ends in 4 hours. A 10-minute Recovery session counts."
   
   // Boss message:
   "3 sessions away from defeating the Deadline Wraith. A 20-minute session deals ~15 damage."
   
   // Comeback message:
   "You completed a comeback quest in February. You can do it again. Session 1 of 3."
   
   // Improvement message:
   "Your average grade went from C last week to B this week. You're improving."
   
   // Pattern warning:
   "You've abandoned 3 sessions on Mondays this month. Consider a shorter Monday target."
   ```
4. Audit `src/features/ai-coach/context-snapshot.ts` — ensure it provides the data needed for these messages:
   - Last N sessions with grades
   - Peak focus hours (calculated from history)
   - Streak state
   - Boss HP
   - Comeback quest state
5. `PersonalQuestGenerator.ts` must generate quests that reference user's actual patterns:
   ```
   Bad: "Complete 3 sessions this week"
   Good: "Beat your Tuesday record — 47 minutes. Complete one 50-minute session."
   ```
**VERIFY:**
- [ ] Every message template in `message-generator.ts` has at least one `{dataPoint}` interpolation
- [ ] `context-snapshot.ts` provides peak focus hours, grade history, streak state, boss HP
- [ ] `PersonalQuestGenerator.ts` generates pattern-specific quests
- [ ] `src/features/ai-coach/__tests__/message-generator.test.ts` verifies messages include user data
- [ ] TypeScript clean

---

### P6-03 · AI Coach — Next Best Action Integration
**WHY:** `src/features/progression/next-best-action.ts` exists alongside the coach. They may be duplicating logic. Consolidate.
**WHAT:**
1. The AI coach should own the "Next Best Action" recommendation.
2. `next-best-action.ts` should be the output layer that formats the coach's recommendation for the home screen.
3. Ensure the chain is:
   ```
   CoachMemory (user history) 
   → CoachRecommendationService (recommendation engine)
   → PersonalQuestGenerator (quest framing)
   → next-best-action.ts (home screen output format)
   → HomeScreen → DailyMissionCard
   ```
4. Remove any duplicate recommendation logic in `HomeRecommendationEngine.ts` if it overlaps with coach logic.
5. Emit `coach:next_best_action_served` event with recommendation type and source for analytics.
**VERIFY:**
- [ ] Clear linear flow from coach memory → home screen recommendation
- [ ] No duplicate recommendation engines
- [ ] `coach:next_best_action_served` event fires every time recommendation is shown
- [ ] TypeScript clean

---

## PHASE 7 — PROGRESSION & ECONOMY (REWARDS THAT MEAN SOMETHING)
> *Trim reward inflation. Make each reward feel earned. Keep all systems but make them hierarchical.*

### P7-01 · Economy — Consolidate Currencies
**WHY:** The app has XP, coins, gems, focus points, energy, boosts, shields. Too many. The analysis correctly identifies this as "reward inflation."
**WHAT:**
1. Audit `src/features/economy/types.ts` for all currency types.
2. The canonical currency structure going forward:
   ```
   XP        — progression currency, not spendable, gates levels
   Coins     — earned soft currency, spendable in shop for cosmetics
   Gems      — premium hard currency, bought or earned rarely
   FocusScore— identity metric, never spendable
   ```
3. Remove/merge "Focus Points" if they're a fourth soft currency doing the same job as coins. If they exist, either:
   - Alias them to coins (1:1 migration)
   - Or deprecate with migration path in `CurrencyTypes-v2.ts` (check if this file exists)
4. Remove energy from the standard session loop if it creates "can't play" friction. Energy should only exist in squad context if needed.
5. Audit `src/features/economy/session-rewards.ts` — ensure it only grants: XP + coins (always) + gems (rare, event-based) + Focus Score delta (via integration).
6. Update `CompletionLedger` to reflect the simplified currency structure.
**VERIFY:**
- [ ] `grep -rn "focusPoints\|focus_points\|FocusPoints" src/` returns zero or only legacy migration code
- [ ] Session completion grants max 2 currencies (XP + coins)
- [ ] Gems are only granted by: achievements, premium events, and purchase — not every session
- [ ] `src/features/economy/__tests__/session-rewards.test.ts` verifies correct currencies granted
- [ ] TypeScript clean

---

### P7-02 · Focus Tower — Persistence and Bonuses
**WHY:** `FocusTower.ts` has the schema and tier config but the Phase Audit flagged missing persistence layer.
**WHAT:**
1. Create `src/features/progression/focus-tower-repository.ts`:
   ```typescript
   // Dependencies: Supabase focus_towers table
   // Consumers: focus-tower.ts service, ProgressionScreen
   export async function fetchFocusTower(userId: string): Promise<FocusTower | null>
   export async function upsertFocusTower(userId: string, tower: FocusTower): Promise<void>
   export async function addTowerBlock(userId: string, block: TowerBlock): Promise<void>
   export async function fetchTowerBlocks(userId: string): Promise<TowerBlock[]>
   ```

2. Wire into session completion: every completed session adds 1 block to the tower. Block type cycles through tier bonuses.

3. Tower milestones should emit events that unlock permanent bonuses:
   - Block 10 (Tier 1 complete): +2% XP on all future sessions (persistent buff stored in progression)
   - Block 20 (Tier 2 complete): streak grace period +1 hour
   - Block 30 (Tier 3 complete): +5% boss damage
   - etc. per `TIER_CONFIG`

4. Create `src/screens/profile/FocusTowerScreen.tsx` — visual tower with all blocks, current tier, next milestone. All 4 states (loading/empty/error/success).
**VERIFY:**
- [ ] Tower block added to DB after every session completion
- [ ] Tier bonuses correctly stored in user progression record
- [ ] `FocusTowerScreen.tsx` renders tower with all blocks and milestone markers
- [ ] `src/features/progression/__tests__/focus-tower.test.ts` covers: add block, tier completion, bonus application
- [ ] TypeScript clean

---

### P7-03 · Battle Pass → Season Journey Migration
**WHY:** `GAMIFICATION_MIGRATION_GUIDE.md` documents the Battle Pass → Season Journey migration. This may be incomplete.
**WHAT:**
1. Audit current state of `src/features/battle-pass/` vs the Season Journey target.
2. If still using the old battle-pass structure, complete the migration:
   - Reduce tiers from 100+ to 20-30 named milestones
   - Remove separate free/premium tracks (one track for everyone)
   - Premium subscribers get cosmetic rewards at each milestone (not content gates)
   - Season milestones are named: "Established a Routine", "First 10-Day Streak", "Defeated Your First Boss", etc.
3. Season Journey should feed into Focus Score (reaching milestone X grants identity recognition, not just items).
4. Ensure the Season Journey route in navigation works: `BattlePass` route now renders `SeasonJourneyScreen`.
**VERIFY:**
- [ ] Season Journey has 20-30 milestones (not 100+)
- [ ] No separate premium content track (premium = cosmetic variant of same milestone)
- [ ] `SeasonJourneyScreen` renders milestone list with progress
- [ ] TypeScript clean

---

### P7-04 · Chest System — Limit and Make Special
**WHY:** Variable rewards (chests) are good for engagement. But if every session drops a chest, they become noise.
**WHAT:**
1. Audit `src/features/rewards/chest-engine.ts` and `VariableRewardEngine.ts`.
2. Apply the rule: chest drops are variable, not guaranteed. Drop rate:
   ```
   Standard session completion: 15% chance of chest
   S-grade session: 30% chance
   Streak milestone: 100% guaranteed chest (special streak chest)
   Boss defeat: 100% guaranteed boss chest (larger loot table)
   Weekly goal completion: 100% guaranteed chest
   ```
3. Chest opening must happen in a dedicated `ChestOpeningModal.tsx` — not inline in the story screen.
4. ChestOpeningModal shows the reveal animation only when user taps "Open Chest". It's not auto-opened. User can defer ("Save for later" adds to inventory).
5. Loot table for standard chest: cosmetic item (70%), bonus coins (20%), gem (10%).
**VERIFY:**
- [ ] Standard session chest drop rate is ~15% (not 100%)
- [ ] Milestone/boss chests still guaranteed (check unit tests)
- [ ] Chest opening is in separate modal
- [ ] "Save for later" adds chest to inventory
- [ ] `src/features/rewards/__tests__/chest-engine.test.ts` covers drop rates
- [ ] TypeScript clean

---

## PHASE 8 — SQUADS & SOCIAL (ACCOUNTABILITY, NOT COMPETITION)
> *Analysis is correct: build accountability, not a social network. Keep squads, simplify the social layer.*

### P8-01 · Squads — Simplified Squad System Feature Completion
**WHY:** `SimplifiedSquadSystem.ts` exists but the full squad flow (create, invite, join, weekly goal, activity feed) must be verified end-to-end.
**WHAT:**
1. Audit `src/features/squads/SimplifiedSquadSystem.ts` and `src/features/squads/service.ts`.
2. Required squad flow:
   - Create squad: name + invite code (max 8 members)
   - Join squad: via invite code or deep link
   - Weekly shared goal: total minutes of focus from all members
   - Squad activity feed: simple list — "[Name] completed 25 minutes · 2h ago" (no likes, no comments)
   - Squad streak: consecutive weeks the squad hit their goal
   - Help request: member can tap "I need encouragement" → other members get a push notification
3. Ensure `SquadStreakService.ts` is wired and updates squad streak weekly.
4. `HelpRequestSystem.ts` must:
   - Send push notification to all squad members when help requested
   - Show help request in squad activity feed
   - Complete when the requesting member starts a session
5. Create `src/features/squads/components/SquadHomeCard.tsx` — compact squad status card for home screen secondary rail. Shows: squad name, weekly progress bar (X/Y minutes), squad streak, one recent activity line.
**VERIFY:**
- [ ] Create → invite → join flow works end-to-end
- [ ] Weekly goal progress visible in `SquadHomeCard`
- [ ] Help request sends push notification (unit test with mock)
- [ ] Squad streak increments on weekly goal completion
- [ ] `src/features/squads/__tests__/SimplifiedSquadSystem.test.ts` covers: create, join, goal update, help request, streak increment
- [ ] TypeScript clean

---

### P8-02 · Social — Archive Competitive Features Behind Flags
**WHY:** The analysis recommends archiving Duels, Rankings, Feed, and Squad Wars. But they're wired into navigation. They should be feature-flagged off, not deleted, to preserve the work.
**WHAT:**
1. Add feature flags if not present:
   ```typescript
   SOCIAL_FEED: false,
   DUELS: false,
   RANKINGS: false,
   SQUAD_WARS: false,
   RIVALS: false,
   ```
2. Gate the navigation routes with these flags:
   - `Duels` route: rendered only if `DUELS` flag is true
   - `Feed` route: rendered only if `SOCIAL_FEED` flag is true
   - `Rankings` route: rendered only if `RANKINGS` flag is true
   - `SquadWars` route: rendered only if `SQUAD_WARS` flag is true
   - `Rivals` route: rendered only if `RIVALS` flag is true
3. Remove nav tabs or menu items that lead to disabled routes.
4. These features stay in codebase, just hidden until the app has enough users to make them meaningful.
**VERIFY:**
- [ ] All 5 competitive features are behind disabled feature flags
- [ ] No navigation item in the tab bar or menu leads to a disabled route
- [ ] App builds and navigates without errors with all flags off
- [ ] TypeScript clean

---

## PHASE 9 — MONETIZATION, ONBOARDING, AND PRODUCTION READINESS
> *Premium must sell growth, not fear. Onboarding must establish identity fast.*

### P9-01 · Onboarding — Establish Focus Identity from Session 1
**WHY:** Current onboarding screens (WelcomeScreen, GoalScreen, FocusTimeScreen, NameScreen) may not establish the Focus Score identity promise. Users need to understand the core loop before completing onboarding.
**WHAT:**
1. Audit current onboarding flow in `src/features/onboarding/components/`.
2. Required onboarding arc (5 screens max):
   ```
   Screen 1: IDENTITY PROMISE
   "Every focus session makes you stronger. 
    You'll build a Focus Score from 300 to 850.
    Let's start."
   → Big animated Focus Score display starting at 550 (their starting score)
   
   Screen 2: NAME + GOAL
   "What should we call you?" (name input)
   "What are you focusing on?" (Study / Work / Creative / Other)
   
   Screen 3: CREATURE REVEAL
   "Your companion hatches when you focus."
   → Creature egg animation. Tap to "hatch" it (they tap, egg cracks, creature appears)
   → "It grows with your streaks. Let's get started."
   
   Screen 4: FIRST FOCUS
   "Complete your first session to raise your score."
   → Pre-set 10-minute session (Recovery mode) — low pressure first win
   → "Your companion is waiting." CTA
   
   Screen 5: (After first session completes) RESULT
   → Their Focus Score updated: "550 → 555"
   → "Your journey begins. Score: 555."
   → Navigate to HomeScreen
   ```
3. Ensure onboarding completion is persisted via `hasCompletedOnboarding` flag (already exists in navigation logic — verify it).
4. Skip to HomeScreen if already onboarded (already implemented — verify).
**VERIFY:**
- [ ] 5-screen max onboarding flow
- [ ] Creature hatch animation plays on Screen 3
- [ ] First session is pre-configured as 10-minute Recovery
- [ ] Focus Score updates after first session
- [ ] Onboarding completion flag correctly gates navigation
- [ ] `src/features/onboarding/__tests__/` has tests for completion flow
- [ ] TypeScript clean

---

### P9-02 · Paywall / Premium — Audit and Ensure Ethical Structure
**WHY:** Premium must not sell fear. The `PaywallScreen.tsx` and `VipPaywallScreen.tsx` must offer growth features only.
**WHAT:**
1. Audit `src/screens/paywall/PaywallScreen.tsx` — document every premium feature shown.
2. Approved premium features (keep/add):
   - ✅ Full AI Coach (free users get 3 suggestions/week, premium = unlimited)
   - ✅ Monthly Focus Report (free users get summary, premium = full breakdown)
   - ✅ Advanced analytics + pattern insights
   - ✅ Premium cosmetic creature skins
   - ✅ Season Journey premium cosmetic track
   - ✅ Squad advanced insights
   - ✅ Unlimited personal quests
3. Features that must NOT be on the paywall (remove if present):
   - ❌ "Restore your streak" (fear monetization)
   - ❌ "Save your progress" (fear monetization)
   - ❌ Boss retry (fear monetization)
   - ❌ Emergency gem purchase during session (dark pattern)
4. Ensure RevenueCat integration in `src/shared/monetization/revenuecat-service.ts` correctly gates features via `entitlements.ts`.
5. Ensure free users still have a compelling experience (they shouldn't feel constantly blocked).
**VERIFY:**
- [ ] Paywall only shows growth features (no fear-based offers)
- [ ] Free tier has: unlimited basic sessions, basic AI suggestions (3/week), streak system, boss battles, basic companion
- [ ] Premium tier has: full AI coach, monthly reports, premium cosmetics, advanced analytics
- [ ] `src/shared/monetization/__tests__/entitlements.test.ts` covers free vs premium feature gating
- [ ] TypeScript clean

---

### P9-03 · Monthly Focus Report — Premium Feature Completion
**WHY:** `BONUS_PHASE_AUDIT_COMPLETE.md` confirms this is implemented. But verify it's production-ready with real data and correct premium gating.
**WHAT:**
1. Verify `src/features/focus-identity/components/MonthlyFocusReport.tsx` renders with real Supabase data.
2. Report must include:
   - Focus Score: start of month → end of month (delta + trend)
   - Best focus hour (peak window analytics)
   - Sessions completed
   - Strongest pattern (e.g., "Evening sessions")
   - Weakest pattern (e.g., "Weekend consistency")
   - Next goal: "Reach [next band] score"
   - Streak achievements this month
3. For free users: show a blurred/preview version with "Upgrade to see your full report" CTA.
4. Report is generated by `jobs/notifications/weekly-report.ts` job — verify this triggers monthly (add `monthly-report` job if only weekly exists).
5. Add "Share report" functionality — generates a shareable image card (even basic text-on-gradient is fine for MVP).
**VERIFY:**
- [ ] Monthly report renders with real Supabase data (test with populated account)
- [ ] Free users see preview (blurred sections) with upgrade CTA
- [ ] Premium users see full report
- [ ] Share functionality works (or is feature-flagged for later)
- [ ] `src/features/focus-identity/__tests__/MonthlyFocusReport.test.tsx` covers all states
- [ ] TypeScript clean

---

### P9-04 · Notifications — Smart, Not Noisy
**WHY:** The app has a notification scheduler but with too many systems generating notifications (streak risk, boss timer, prime-time events, AI coach, daily login, social, comeback, battle pass). This creates notification fatigue.
**WHAT:**
1. Audit `src/features/ai-coach/reminder-scheduler.ts` and `jobs/notifications/`.
2. Enforce notification budget: max **2 notifications per day per user**. Priority order:
   ```
   1. Streak critical (< 2 hours remaining) — always sends, max 1/day
   2. AI Coach next best action — smart timing, 1/day at detected peak window
   [All other notification types are SUPPRESSED if either of the above is sent today]
   3. Boss near defeat (sends only if no streak notification today)
   4. Squad help request (sends only if no notifications sent today)
   5. Daily mission reminder (sends only if nothing sent today, 1-per-day max)
   ```
3. "Quiet hours" respect: never send between 10 PM - 7 AM local time.
4. Implement notification dedup tracking in MMKV: track last notification type and time per user.
5. Remove any notifications that fire on: daily login, random engagement prompts, generic "come back" messages.
**VERIFY:**
- [ ] Max 2 notifications per user per day (enforced in scheduler)
- [ ] Quiet hours respected (test: 11 PM → no notification)
- [ ] `src/features/ai-coach/__tests__/reminder-scheduler.test.ts` covers budget enforcement
- [ ] No notification for "daily login bonus" or generic re-engagement
- [ ] TypeScript clean

---

### P9-05 · Analytics — Verify Key Events Fire
**WHY:** The app has `VEXAnalyticsInfrastructure.ts` and PostHog integration. The core funnel events must fire correctly to enable product analytics.
**WHAT:**
Verify these events fire at the correct moments (add if missing):
```
vex_session_started       → Session start, with: mode, duration_target, userId
vex_session_completed     → Session complete, with: grade, duration_actual, focus_score_delta
vex_session_abandoned     → Session abandoned, with: duration_at_abandon, reason
vex_streak_milestone      → Streak N days, with: streak_length
vex_streak_broken         → Streak broken, with: broken_length
vex_comeback_started      → Comeback quest started
vex_comeback_completed    → Comeback quest finished
vex_boss_defeated         → Boss defeated, with: boss_name, total_sessions_to_defeat
vex_focus_score_changed   → Score update, with: previous, new, delta, grade_that_caused_it
vex_daily_mission_shown   → Mission shown, with: type, urgency_level
vex_daily_mission_completed → Mission completed
vex_squad_session_contributed → Squad session, with: squad_id, minutes
vex_paywall_viewed        → Paywall seen, with: source_screen
vex_premium_purchased     → Purchase, with: product_id, revenue
vex_onboarding_completed  → Onboarding done, with: first_session_grade
```
Each event must use the `AnalyticsService.track()` method — not direct PostHog calls.
**VERIFY:**
- [ ] All events in list above exist in `src/events/types/` or analytics service
- [ ] Each event fires in the correct location (grep to verify)
- [ ] No PII in any event payload
- [ ] TypeScript clean

---

### P9-06 · Error Boundaries — Every Screen is Wrapped
**WHY:** `ErrorBoundary.tsx` exists. But if screens don't have error boundaries, a runtime error in one feature crashes the whole app.
**WHAT:**
1. Audit every screen in `src/screens/` and `src/features/*/screens/` — verify each is wrapped in an ErrorBoundary or `ScreenErrorBoundary`.
2. `ScreenErrorBoundary` should show: feature name in error message + "Reload" button that resets the boundary.
3. The `HomeScreen` specifically must NEVER crash the app — it must degrade gracefully if any sub-component fails.
4. Add error boundary to:
   - `HomeScreen` (wraps entire screen content)
   - `PostSessionStoryScreen` (wraps story beats — if story fails, show plain completion summary)
   - `FocusIdentityDashboardScreen`
   - `BossScreen`
   - `SquadRouteHub`
**VERIFY:**
- [ ] Throw a test error in `HomeContent` → screen shows error UI, doesn't crash app
- [ ] Throw a test error in `PostSessionStoryScreen` → shows plain completion fallback
- [ ] `src/shared/ui/components/__tests__/ScreenErrorBoundary.test.tsx` covers recovery behavior
- [ ] TypeScript clean

---

### P9-07 · Offline Queue — Verify Session Completion is Queued
**WHY:** If a user completes a session offline, the completion must be queued and synced when connectivity returns. Loss of session data is catastrophic for user trust.
**WHAT:**
1. Audit `src/features/economy/offline-queue.ts` — verify it handles:
   - Session completion writes
   - Focus Score updates
   - Streak updates
   - XP/coin grants
2. If session data is lost due to network failure, the offline queue must replay it within 10 seconds of connectivity being restored (via NetInfo listener).
3. Add optimistic UI: show session as completed in the app immediately, even before server confirmation.
4. If an offline session fails to sync after 3 retries: show banner "1 session is pending sync" that resolves when successful.
5. Test: complete session in airplane mode → enable WiFi → verify DB row exists within 10 seconds.
**VERIFY:**
- [ ] Offline session completion is queued in MMKV
- [ ] Queue replays on connectivity restored
- [ ] Optimistic UI shows session as completed immediately
- [ ] "Pending sync" banner appears for stuck queue items
- [ ] `src/features/economy/__tests__/offline-queue.test.ts` covers: queue, replay, retry, permanent failure
- [ ] TypeScript clean

---

### P9-08 · Performance — Critical Path Optimization
**WHY:** App startup time and home screen load time directly impact D1 retention.
**WHAT:**
1. Run `npm run perf:audit` and document current metrics.
2. Required targets:
   - App cold start to interactive HomeScreen: **< 2.5 seconds**
   - Session start to timer running: **< 500ms**
   - PostSessionStoryScreen first beat render: **< 300ms after completion**
3. Optimizations to make:
   - Use `getComponent` lazy loading in `RootStackScreens.tsx` (already implemented — verify all screens use it)
   - Prefetch focus score and daily mission on app foreground (not on screen mount)
   - Cache home screen data in MMKV for 5-minute TTL — show cached data immediately, then refresh
   - All FlashList components must have `estimatedItemSize` set
   - No images fetched without `expo-image` with proper caching headers
4. Remove any unused listeners or intervals that run in the background.
**VERIFY:**
- [ ] Cold start to interactive HomeScreen ≤ 2.5 seconds (measure 5 times, take median)
- [ ] Session start ≤ 500ms
- [ ] No console warnings about missing `estimatedItemSize` on FlashList
- [ ] TypeScript clean

---

### P9-09 · Pre-Flight Checklist — Production Readiness Gate
**WHY:** Nothing ships until this checklist passes.
**WHAT:**
Run and pass ALL of these, in order:
```bash
# 1. TypeScript
npx tsc --noEmit
# Expected: 0 errors

# 2. No ts-nocheck
node scripts/check-no-ts-nocheck.js
# Expected: 0 violations

# 3. Lint
npm run lint
# Expected: 0 errors

# 4. Tests
npm test -- --coverage
# Expected: > 80% coverage on service layer files, all tests pass

# 5. File size
find src/ -name "*.ts" -o -name "*.tsx" | while read f; do
  lines=$(wc -l < "$f"); 
  if [ "$lines" -gt 200 ]; then echo "OVERSIZE: $lines $f"; fi;
done
# Expected: 0 results

# 6. No console.log
grep -r "console\." src/ --include="*.ts" --include="*.tsx"
# Expected: 0 results

# 7. No any type
grep -rn ": any\b\|<any>" src/ --include="*.ts" --include="*.tsx"
# Expected: 0 results

# 8. No hardcoded colors (hex or rgb)
grep -rn "#[0-9A-Fa-f]\{3,6\}\|rgb(" src/ --include="*.tsx"
# Expected: 0 results (all colors from design tokens)

# 9. Preflight script
npx ts-node scripts/preflight-check.ts
# Expected: 0 failures

# 10. Dead code / orphan files
# Run orphan file detection from P0-03
# Expected: 0 orphans

# 11. Integration audit
node scripts/integration-audit.js
# Expected: All systems connected to 2+ other systems

# 12. Archive check
grep -r "from.*archive/" src/ --include="*.ts" --include="*.tsx"
# Expected: 0 results (no imports from archived code)
```
**VERIFY:**
- [ ] ALL 12 checks pass with zero failures
- [ ] App runs on iOS simulator without crash
- [ ] App runs on Android emulator without crash
- [ ] First-time onboarding flow completes end-to-end
- [ ] Session start → complete → story screen → home works end-to-end
- [ ] Focus Score updates correctly after test session

---

## APPENDIX A — WHAT NOT TO ARCHIVE
> *The analysis over-recommends archiving. Here's what to KEEP and deepen:*

| Feature | Keep? | Rationale |
|---------|-------|-----------|
| Boss system | ✅ Keep (simplify) | Best "one more session" hook. Just feature-flag the complex subsystems. |
| Battle Pass | ✅ Keep (migrate to Season Journey) | Good seasonal layer. Just reduce tiers and remove dual tracks. |
| Streak creature / companion | ✅ Deepen | Most emotional retention system in the app. |
| Achievements | ✅ Keep | Free progression signal. Don't over-reward but keep them. |
| Challenges | ✅ Keep | Good medium-term engagement. Gate behind daily mission completion. |
| Mastery system | ✅ Keep | Skill paths (Deep Worker, Sprinter, etc.) create identity attachment. |
| Focus Tower | ✅ Keep | Long-term investment mechanic. Critical for churn prevention. |
| Content Study feature | ✅ Keep (in archive — unblock when ready) | Actually differentiated. Reconnect when session grading is perfect. |
| Squads | ✅ Keep + simplify | Accountability mechanic. Highest-ROI social feature. |
| Social Feed | ❌ Feature-flag off | Not worth moderation cost yet. Re-enable at 10k+ users. |
| Duels | ❌ Feature-flag off | Too competitive for early user base. |
| Rankings | ❌ Feature-flag off | Needs critical mass to feel alive. |
| Squad Wars | ❌ Feature-flag off | Too complex. Simplify squads first. |
| Rivals | ❌ Feature-flag off | "Past You" rival (P1 suggestion) is better first. |
| Trading System | ❌ Archive | Economy abuse risk. Bring back only if item economy becomes robust. |
| Emergency Gem Sinks | ❌ Archive or flag off | Dark pattern confirmed. |
| Streak Wager | ❌ Already archived — keep archived | Dark pattern. |
| AR/VR, Blockchain, Nanotech | ❌ Already archived — keep archived | Not part of the product fantasy. |

---

## APPENDIX B — SYSTEM INTEGRATION MAP
> *Every system must be wired to at least 2 others. Reference when building.*

```
session              → focus-identity, progression, streaks, boss, rewards, analytics, session-story
session-completion   → session-story, focus-identity, rewards, progression, daily-mission, companion
focus-identity       → home-spine, session-completion, monthly-report, ai-coach
home-spine           → daily-mission, focus-identity, ai-coach, streaks, boss, squads
ai-coach             → session, streaks, focus-identity, notifications, home-spine, personal-quests
streaks              → companion, comeback-quest, focus-identity, notifications, boss
boss                 → session, progression, rewards, squads (when enabled)
companion            → streaks, session-completion, focus-identity
rewards              → progression, economy, inventory, session-completion
economy              → rewards, shop, progression, offline-queue
squads               → social, notifications, challenges, weekly-goal
progression          → focus-tower, season-journey, rewards, achievements
auth                 → user-profile, analytics, onboarding, notifications
notifications        → ai-coach, streaks, squads, daily-mission
```

---

## APPENDIX C — DECISION LOG (Analysis Agreements & Disagreements)

| Analysis Claim | Agreement | Decision |
|----------------|-----------|----------|
| "App is 4.3/10 — too many unranked systems" | ✅ Agree | Hierarchy implemented via Focus Score spine + Daily Mission priority engine |
| "Archive boss system" | ❌ Disagree | Boss system is kept — feature-flagged subsystems, core boss kept live |
| "Archive battle pass" | ⚠️ Partial | Migrated to Season Journey (simplified), not archived |
| "Archive social feed/duels/rankings" | ✅ Agree | Feature-flagged off, not deleted |
| "Archive trading" | ✅ Agree | Already in archive, stays there |
| "Focus Score as main spine" | ✅ Strongly agree | Implemented as P1 (Phase 1 priority) |
| "Streak creature is strong" | ✅ Agree | Deepened in Phase 4 |
| "Comeback quests over punishing failures" | ✅ Agree | Implemented in P4-03 |
| "Generic AI messages are useless" | ✅ Agree | P6-02 enforces specific data-driven messages |
| "Too many currencies" | ✅ Agree | Consolidated to XP + Coins + Gems in P7-01 |
| "Content study (PDF/YouTube) should be archived" | ❌ Disagree | It's already in archive — but it's differentiated. Flag it for re-activation |
| "Emergency gem sinks are dark patterns" | ✅ Agree | Archived/disabled in P5-03 |
| "Squads over social network" | ✅ Agree | P8-01 deepens squads, P8-02 flags off competitive social |

---

*End of Tasks.md — 9 phases, ~60 atomic tasks, full production readiness path.*
*Every VERIFY block is a binary pass/fail gate. If it fails, the task is not done.*
