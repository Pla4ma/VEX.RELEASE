# VEX 11/10 Launch Plan

**Target App Store submission:** May 30, 2026  
**Plan date:** May 18, 2026  
**Days available:** 12  
**Scope:** Production launch plan only. This document is the source of truth for what gets fixed, improved, cut, verified, and submitted.

> A checkbox is not complete until proof is recorded in `VERIFICATION_REPORT.md`.
> Any agent working this plan must follow `AGENTS.md`, keep files under 200 lines, avoid banned patterns, and run the required verification gates.

---

## 0. Executive Decision

VEX does not become an 11/10 app by adding more features. It becomes an 11/10 app by making the existing strongest systems feel inevitable, polished, reliable, and emotionally connected.

The current product appears closer to a 7/10 because its best systems are fragmented:

- Session grading exists, but it does not always feel like a meaningful story.
- Companion memory exists, but it is not consistently visible at the right moment.
- Tomorrow preview exists, but it is not framed as a promise the user can keep.
- Progression systems exist, but too many compete for attention.
- Launch infrastructure is not yet proven end to end.

The launch version must focus on one core promise:

```text
Open VEX -> see the one thing that matters -> start focus fast ->
finish -> feel seen by the companion -> know exactly what tomorrow is for.
```

Everything in this plan either strengthens that loop, proves the app is production-safe, or removes something that weakens trust.

---

## 1. Definition of 11/10

VEX is 11/10 when a first-week user can say all five statements are true:

1. "When I open the app, I know exactly what to do."
2. "Starting a session is fast, calm, and never confusing."
3. "Finishing a session feels meaningful, not like a generic timer result."
4. "The companion remembers what I did and makes returning feel personal."
5. "The app feels complete, stable, polished, and honest."

This means the launch bar is not "more screens." The launch bar is:

- Zero broken entry points.
- Zero placeholder copy.
- Zero fake success paths.
- Zero TypeScript errors.
- Zero banned production patterns.
- Zero known App Store blockers.
- One unforgettable retention loop.

### 1.1 The 11/10 Quality Bar

Every launch-critical screen must pass all of these bars:

| Area | 7/10 behavior | 11/10 behavior |
|---|---|---|
| Home | Shows many useful cards | Shows one obvious next action and makes the user want to start |
| Session setup | Lets user configure a timer | Gets user into the right session in three taps or fewer |
| Active session | Timer works | Timer feels calm, stable, intentional, accessible, and resilient |
| Completion | Shows stats | Tells the user what happened, why it mattered, and what comes next |
| Companion | Has messages | Remembers real behavior and reacts at the right time |
| Offline | Does not fully break | Clearly degrades, queues work, and syncs exactly once |
| Paywall | Offers premium | Appears at a relevant moment with honest, specific value |
| Error handling | Avoids crashes sometimes | Gives recovery paths, records unexpected failures, and never strands the user |
| Accessibility | Mostly tappable | VoiceOver, reduced motion, touch targets, labels, hints, and contrast are verified |
| App Store readiness | Builds eventually | Production build, submit path, privacy, IAP, metadata, and TestFlight are proven |

### 1.2 Product Must Feel Like This

VEX should feel:

- Calm, not noisy.
- Personal, not fake-personalized.
- Premium, not flashy.
- Strict about quality, not cluttered with half-built systems.
- Emotionally warm, but never guilt-based.
- Fast to start, satisfying to finish, obvious to return to.

### 1.3 Launch Must Not Feel Like This

Any of these are launch blockers:

- User opens home and has to decide between five competing gamified prompts.
- User finishes a session and sees generic copy.
- Companion says something that could have been shown to any user.
- A feature card leads to an empty, broken, placeholder, or fake-data screen.
- A paywall blocks the emotional payoff of a completed session.
- Offline completion can duplicate rewards.
- Restore purchases fails silently.
- App Review can reject the build for privacy, IAP, or broken login/session behavior.

---

## 2. Non-Negotiable Engineering Rules

These rules override convenience:

- Edit real implementation files in `src_impl/`, not mirrored shells in `src/`, unless the app root requires it.
- Feature flow must stay: Component -> Hook -> Service -> Repository -> Supabase.
- No Supabase query in a component, screen, or hook.
- No business logic in JSX.
- No new libraries without explicit approval.
- No `any`, `as any`, `z.any()`, `@ts-ignore`, `@ts-nocheck`, or `console.log`.
- No `StyleSheet.create`, `FlatList`, `AsyncStorage`, raw `fetch()`, hardcoded colors, or hardcoded spacing/font/radius values.
- Use Reanimated 3 only for animation.
- Use FlashList for lists with correct `estimatedItemSize`.
- Use design tokens from `src/theme/tokens/` for all UI values.
- All async paths need typed errors, user-facing fallback, retry where appropriate, and Sentry capture for unexpected failures.
- Every data-driven UI must include loading skeleton, error state, empty state, offline state, and success state.
- Every new or changed service needs tests.
- Run `npx tsc --noEmit` before declaring any implementation phase complete.

---

## 3. Product Principles for Launch

### 3.1 One Primary Action

The home screen must have one primary CTA. Secondary systems can exist, but they cannot compete with the main action.

Priority order:

1. Save a critically endangered streak.
2. Keep an active companion promise.
3. Recover from a missed promise.
4. Start the recommended session.
5. Complete a nearly finished daily challenge.
6. Continue a boss encounter.
7. Start a default focus session.

### 3.2 The Companion Is the Product Differentiator

The companion must not feel decorative. It must:

- Remember the last meaningful session.
- React to a kept or missed promise.
- Give one emotionally specific message after completion.
- Avoid guilt, shame, manipulation, or fake urgency.

### 3.3 Session Completion Must Feel Premium

After a session, users should see:

- Grade.
- What improved.
- What the companion noticed.
- What tomorrow is for.
- One next action.

No generic "good job" screen is acceptable for launch.

### 3.4 Progression Must Be Earned

Progression systems should not overwhelm new users. Battle pass, boss, shop, squads, challenges, focus score, personal bests, and analytics must be staged and prioritized.

Rule: if a surface does not help the user start or return in the first week, it is secondary.

### 3.5 Trust Beats Growth Tricks

Paywall copy must be specific and honest. VEX can sell protection, insight, and continuity. It must not sell fear, guilt, or fake scarcity.

### 3.6 The First 60 Seconds Decide the App

The first minute after onboarding must be designed as a conversion-quality product moment:

- The user sees one recommended first session.
- The companion explains the session in one short sentence.
- The first CTA starts a session, not a tour.
- Any optional customization is secondary.
- No shop, battle pass, boss, squad, or analytics prompt appears before the first completed session.

Acceptance standard:

- Fresh user reaches a useful session start path within 60 seconds.
- Fresh user can start first session in three taps or fewer after landing on home.
- No feature shown in the first minute depends on historical data the user does not have.

### 3.7 The First Completion Must Be Memorable

The first completed session must produce a clear emotional payoff:

- "You focused for X minutes."
- "Your grade is Y because of Z."
- "Your companion noticed [specific fact]."
- "Tomorrow, come back for [specific promise]."
- "Start again" or "Set tomorrow's promise" is the only next action.

Acceptance standard:

- A user who completed one session understands what the app thinks they accomplished.
- The companion message uses real session facts.
- A companion promise is created or intentionally skipped with a documented reason.

### 3.8 Day Two Is the Retention Moment

The Day Two open is more important than most long-term systems. VEX must recognize whether the user is keeping, missing, or recovering a promise.

Acceptance standard:

- Day Two home has a companion-led message tied to yesterday.
- The primary CTA starts the promised or recovery session.
- Missing a promise never uses shame copy.
- Keeping a promise creates visible acknowledgment in completion story.

### 3.9 Premium Visual Quality Rules

Every launch-critical UI change must meet these visual rules:

- No cramped text.
- No text clipping on small iPhone screens.
- No overlapping cards, labels, or buttons.
- No inconsistent radius, shadow, spacing, or color usage.
- No spinner-only loading state for data-driven content.
- No one-note color palette in new or heavily revised screens.
- No card inside another card.
- No decorative UI that competes with the primary action.

Verification requires screenshots for:

- iPhone SE or smallest supported viewport.
- Standard iPhone viewport.
- Large iPhone viewport.
- Dark mode.
- Offline state.
- Loading or skeleton state.
- Error state.

---

## 4. Launch Timeline

### May 18-19: Stabilize the Foundation

- EAS auth proof.
- Supabase migrations applied or explicitly blocked.
- TypeScript errors fixed.
- Banned patterns measured and triaged.
- Minified files expanded before editing.

### May 20-22: Build the Core Retention Loop

- Companion Promise feature.
- Home single next action.
- Session completion story.
- Focus contract reflection.

### May 23-24: Make It Feel Premium

- Companion memory in post-session story.
- Personal best celebration if clean.
- Focus score real data wiring if clean.
- Paywall moment copy sharpened.
- Home visual noise reduced.

### May 25-26: Production Hardening

- Offline completion and dedupe.
- Sentry coverage.
- Accessibility pass.
- Restore purchases.
- Deep links.
- Physical device QA.

### May 27: Release Candidate Build

- Full typecheck, lint, tests.
- Production iOS build.
- Submit to TestFlight.
- TestFlight install and smoke test.

### May 28-29: Final Fix Window

- Fix only release blockers.
- Cut unfinished P2 work.
- Re-run full launch gate.
- Final App Store metadata and screenshots.

### May 30: Submit

- Submit only if the launch gate passes.
- Delay if any P0 blocker remains.

---

## 4.1 Phase Execution Protocol

Every phase must be executed in this order:

1. Read the phase goal and 11/10 outcome.
2. Record the current state with commands, screenshots, or notes.
3. Identify blockers before writing code.
4. Fix P0/P1 issues first.
5. Hide or cut unfinished P2 surfaces early, not at the end.
6. Implement only within the phase scope.
7. Add or update tests for changed services and logic.
8. Run phase verification commands.
9. Perform manual/device QA required by the phase.
10. Append a verification packet to `VERIFICATION_REPORT.md`.
11. Mark the phase PASS, FAIL, or PARTIAL.

Rules:

- Do not start the next phase if the current phase has a P0 failure.
- Do not keep building on top of an unverified data model.
- Do not polish UI before TypeScript and architecture blockers are known.
- Do not show a feature just because code exists.
- Do not mark a phase PASS without fresh evidence.

## 4.2 Daily Launch Standup Format

At the end of each day until May 30, record:

```markdown
## Daily Launch Check - YYYY-MM-DD

**Days until submission:** N
**Ship confidence:** GREEN | YELLOW | RED

### Completed today
- item

### Blockers
- blocker, owner, next action

### Cut decisions
- feature, reason

### Verification added
- command/device/evidence

### Tomorrow's critical path
1. item
2. item
3. item
```

Ship confidence:

- GREEN: no open P0, P1 on track, release pipeline proven.
- YELLOW: no open P0, but P1 or verification risk exists.
- RED: any open P0, unknown release pipeline, or core flow failure.

---

## 5. Current Audit Findings

### 5.1 Architecture Reality

- Canonical implementation appears to be `src_impl/`.
- `src/` mirrors or re-exports many files and should not be treated as the source of truth.
- Some source files are compressed/minified and must be expanded before review or edits.
- Most feature architecture appears aligned with the required layering, but violations must be scanned again before launch.

### 5.2 Known File Size Risks

Any file over 200 lines must be split before being edited. Current known risks include:

| File | Last known line count | Required action |
|---|---:|---|
| `src_impl/performance/PerformanceGate.ts` | 463 | Split metrics, thresholds, reporter, and gate coordinator |
| `src_impl/store/index.ts` | 440 | Split each Zustand slice into focused files |
| `src_impl/features/economy/anti-duplication/hooks.ts` | 400 | Split daily login, reward claim, and duplicate guard hooks |
| `src_impl/screens/social/SocialScreen.tsx` | 276 | Extract squad card, feed, and empty/error states |
| `src_impl/screens/session/ActiveSessionScreen.tsx` | 244 | Reduce to screen coordinator; move sections to components |
| `src_impl/navigation/components/VexTabBar.tsx` | 229 | Extract tab item and badge logic |
| `src_impl/navigation/notification-routing-core.ts` | 204 | Extract route map and permission guard |
| `src_impl/features/session-completion/completion-orchestrator.ts` | 208 | Extract invalidation and side effects |
| `src_impl/features/session-completion/hooks/useSessionCompleteController.ts` | 202 | Extract animation and navigation helpers |

Verification command:

```powershell
Get-ChildItem -Path src_impl -Recurse -Include *.ts,*.tsx |
  Where-Object {
    ($_.FullName -notmatch "\\__tests__\\") -and
    ($_.FullName -notmatch "\\types\\supabase\.ts$") -and
    ((Get-Content $_.FullName | Measure-Object -Line).Lines -gt 200)
  } |
  ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    "$lines $($_.FullName)"
  }
```

Exit gate: no production file over 200 lines except generated Supabase types.

### 5.3 Known Banned Pattern Risks

Run these before and after implementation:

```powershell
rg "console\.|: any\b|as any\b|<any>|z\.any\(\)|@ts-ignore|@ts-nocheck|@ts-expect-error" src_impl -g "*.ts" -g "*.tsx" | rg -v "__tests__|supabase.ts"
rg "StyleSheet\.create|FlatList[^A-Za-z]|AsyncStorage|raw fetch\(" src_impl -g "*.ts" -g "*.tsx" | rg -v "__tests__"
rg "#[0-9A-Fa-f]{3,8}|rgb\(" src_impl -g "*.ts" -g "*.tsx" | rg -v "__tests__|supabase.ts"
rg "DynamicRecord|DynamicValue|DynamicItem" src_impl -g "*.ts" -g "*.tsx" | rg -v "__tests__"
```

Exit gate: zero matches or documented false positives that are not production code.

### 5.4 Known Launch Blockers

| Blocker | Severity | Required resolution |
|---|---|---|
| EAS auth not proven | P0 | `npx eas-cli whoami` succeeds with production account |
| Production iOS build not proven | P0 | EAS production build completes and appears in App Store Connect |
| Remote Supabase schema not verified | P0 | migrations applied, RLS smoke tested, types regenerated |
| TypeScript not proven clean | P0 | `npx tsc --noEmit` exits zero |
| Offline dedupe not proven | P0 | offline session sync creates exactly one completion and one reward set |
| Restore purchases not proven | P0 | TestFlight sandbox restore succeeds and failure path is user-facing |

---

## 6. Feature Cut Rules

### Must Ship

- Session setup -> active session -> completion -> story.
- Companion Promise loop.
- Home single next action.
- Companion memory or promise state on home.
- Focus contract creation and reflection if contract entry is visible.
- Offline session completion with dedupe.
- Paywall and restore purchases.
- Sentry unexpected error capture.

### Ship Only If Fully Done

- Personal best celebration.
- Focus Score dashboard.
- Boss home card.
- Battle pass home card.
- Monthly report.
- Squad/social surfaces.
- Advanced AI coach insights.

### Cut Immediately If Unfinished by May 27

Cut means hide the entry point, disable the feature flag, remove copy implying the feature exists, and record it in `VERIFICATION_REPORT.md`.

- Monthly Focus Report.
- Rival system.
- Focus Tower decay or restore mechanics.
- Boss card on home.
- Battle pass on home.
- Any P2 celebration that only handles happy path.
- Any screen with placeholder text, broken empty state, or fake data.

### 6.1 Feature Visibility Matrix

Every visible feature must be assigned one status before release:

| Status | Meaning | App behavior |
|---|---|---|
| `SHIP` | Fully implemented, tested, verified, accessible | Visible to users |
| `HIDE` | Useful but not verified enough for launch | Entry points removed or feature flag off |
| `DELETE_LATER` | Not launch relevant and creates noise | Hidden now, cleanup can happen after launch |
| `BLOCKER` | Broken and affects core flow | Must be fixed before submission |

Required launch decision table:

| Surface | Required status by May 27 | Notes |
|---|---|---|
| Home hero | `SHIP` | One primary CTA |
| Session setup | `SHIP` | Three taps or fewer from home |
| Active session | `SHIP` | Offline and reduced motion verified |
| Completion story | `SHIP` | Grade, companion, promise, next action |
| Companion Promise | `SHIP` | Launch-defining |
| Focus contract | `SHIP` if visible, otherwise `HIDE` | No half-visible contract flow |
| Paywall | `SHIP` | Restore purchases required |
| Personal bests | `SHIP` or `HIDE` | No fake celebration |
| Focus Score | `SHIP` or `HIDE` | New user empty state required |
| Boss | `SHIP` below fold or `HIDE` | Never compete with promise |
| Battle pass | `HIDE` from home | Can remain in tab if verified |
| Squad/social | `SHIP` only if fully verified, otherwise `HIDE` | No broken social promise |
| Monthly report | `HIDE` unless complete | Not launch-critical |

### 6.2 The No Trash Rule

Before release, every visible screen must be reviewed for "trash stuff":

- Placeholder copy.
- Fake zero states.
- Empty arrays pretending to be real data.
- "Coming soon" panels.
- Dead buttons.
- Debug labels.
- Generic error messages.
- Generic companion copy.
- Competing CTAs.
- Unclear icons without labels or accessibility hints.
- Data that appears stale without explanation.
- Gamification surfaces shown before the user understands the habit loop.

If any item is found, either fix it or hide the surface. Do not ship around it.

### 6.3 Scope Control Rule

No new major system can be added after May 24. From May 25 onward:

- Fix blockers.
- Improve copy.
- Hide unfinished surfaces.
- Verify flows.
- Prepare App Store submission.

Do not start new features during the final hardening window.

---

## 7. Phase 0 - Release Infrastructure Proof

**Priority:** P0  
**Owner:** Release engineer  
**Deadline:** May 19  
**Goal:** Prove the app can actually be built and submitted.

### Phase 0 11/10 Outcome

The app cannot be called launch-ready until the release pipeline feels boring. A perfect product still fails if the team cannot produce, submit, and install the real production build.

By the end of this phase:

- Anyone can identify the exact Expo account, bundle ID, build profile, and submitted build.
- The production iOS build path has been tested before the final submission window.
- App Store Connect processing is proven, not assumed.
- Privacy manifest and entitlement issues are found early, not on May 30.
- The release owner has a written recovery path for build failure.

### Phase 0 Deep Work

- [ ] Create a release identity table in `VERIFICATION_REPORT.md`:
  - Expo account.
  - Apple team.
  - Bundle identifier.
  - EAS project ID.
  - Supabase project ref.
  - RevenueCat project/app.
  - Sentry project.
  - PostHog project if used.
- [ ] Confirm there is exactly one production app target. If staging/dev targets exist, record how they differ.
- [ ] Confirm environment variables required for production builds are documented and present in EAS secrets.
- [ ] Confirm push notification entitlements are production-ready.
- [ ] Confirm the app can be installed from TestFlight on a physical iPhone.
- [ ] Confirm the submitted binary points at the correct production Supabase and RevenueCat configuration.

### Phase 0 "Perfect App" Bar

The build pipeline should not depend on tribal knowledge. If a different engineer had to submit the app tomorrow, this phase should give them enough proof to do it without guessing.

Blockers to eliminate:

- Unknown Expo owner.
- Missing EAS token.
- Wrong Apple team.
- Wrong bundle ID.
- Development push entitlement in production.
- Missing EAS secrets.
- App Store Connect build not visible.
- Privacy manifest uncertainty.

### P0-01 Set EAS Auth

- [ ] Obtain `EXPO_TOKEN` from the Expo account owner.
- [ ] Set it in the shell:

```powershell
$env:EXPO_TOKEN = "your_token_here"
```

- [ ] Verify:

```powershell
npx eas-cli whoami
```

Exit gate: command prints the expected Expo account.

### P0-02 Validate Production Build Profile

- [ ] Inspect `eas.json`.
- [ ] Confirm the production profile uses the expected bundle identifier, credentials, and distribution settings.
- [ ] Confirm iOS push entitlement resolves to production, not development.

```powershell
Get-Content .\eas.json | ConvertFrom-Json
npx expo config --type introspect
```

Exit gate: production config is correct and recorded in `VERIFICATION_REPORT.md`.

### P0-03 Build and Submit Proof

- [ ] Run:

```powershell
npx eas-cli build --platform ios --profile production --non-interactive
```

- [ ] Record EAS build URL.
- [ ] If build succeeds, submit:

```powershell
npx eas-cli submit --platform ios --latest --non-interactive
```

Exit gate: build appears in App Store Connect or the blocker is documented with the exact EAS error.

### P0-04 Privacy Manifest Proof

- [ ] Verify `ios.privacyManifests` in app config.
- [ ] Confirm tracking fields match actual behavior.
- [ ] Confirm App Store Connect does not reject the processed build for privacy manifest issues.

Exit gate: no privacy manifest rejection.

### Phase 0 Verification Packet

This phase cannot pass from screenshots alone. It needs command output and external service proof.

Required evidence:

| Evidence | Required proof |
|---|---|
| Expo account | `npx eas-cli whoami` output with account name |
| Production config | saved output summary from `npx expo config --type introspect` |
| EAS build | EAS build URL, build ID, status, profile name |
| App Store Connect | screenshot or note showing build processing/available |
| Privacy manifest | config excerpt plus App Store Connect rejection check |

Commands to record:

```powershell
npx eas-cli whoami
npx expo config --type introspect
npx eas-cli build:list --platform ios --limit 5
```

PASS requires:

- EAS auth works.
- Production config is correct.
- At least one production iOS build has been attempted and the result is known.
- Any build failure has an exact error and owner.

FAIL if:

- `EXPO_TOKEN` is missing.
- EAS account is wrong.
- Production build profile is unknown.
- App Store Connect build path is unproven by May 27.

---

## 8. Phase 1 - Database, Types, and RLS

**Priority:** P0  
**Deadline:** May 19  
**Goal:** Prove production data structures match the code.

### Phase 1 11/10 Outcome

Every user-facing feature must be backed by real, secure, typed data. The app cannot feel premium if it silently falls back to missing tables, fake zeros, stale local state, or unsafe policies.

By the end of this phase:

- Every launch-critical table exists in the remote project.
- Every repository query has matching generated TypeScript types.
- Every user-owned table has RLS proof.
- The app can safely create, read, update, and sync core session data.
- Missing schema is treated as a blocker, not a runtime surprise.

### Phase 1 Deep Work

- [ ] Build a repository-to-table map:
  - repository file.
  - table(s) referenced.
  - migration file.
  - RLS policy names.
  - Zod schema file.
  - user ownership column.
- [ ] Identify tables used by launch-critical flows:
  - onboarding/auth.
  - session setup.
  - active session.
  - session completion.
  - rewards/wallet.
  - streaks.
  - companion memory.
  - companion promise.
  - focus contract.
  - purchases.
  - push tokens/reminders.
- [ ] Confirm each launch-critical table has:
  - primary key.
  - `user_id` or clear ownership relation.
  - `created_at`.
  - `updated_at` if mutable.
  - indexes for common queries.
  - RLS enabled.
  - policies for select/insert/update/delete as needed.
- [ ] Confirm Zod schemas match actual remote column nullability.
- [ ] Confirm no repository returns raw Supabase rows without parsing.
- [ ] Confirm no feature relies on a table that exists only locally.

### Phase 1 Data Quality Bar

For an 11/10 app, data should be:

- Correct: session, reward, promise, and streak state must agree.
- Durable: completing a session cannot be lost silently.
- Deduped: retries and reconnects cannot double-award.
- Private: one user cannot read another user's rows.
- Typed: schema drift is caught by TypeScript and Zod, not users.

### Phase 1 Anti-Regression Checks

- [ ] Delete network connection during a write and confirm no corrupt partial state.
- [ ] Retry a completion write and confirm dedupe ledger prevents duplicates.
- [ ] Query with a second test user and confirm isolation.
- [ ] Run app with a newly created user and confirm empty states are real.
- [ ] Run app with an existing heavy user and confirm queries do not time out.

### P1-01 Confirm Migration Coverage

- [ ] List migrations:

```powershell
Get-ChildItem supabase\migrations -Filter *.sql | Sort-Object Name
```

- [ ] Confirm every repository-referenced table has migration coverage or exists in the remote schema.
- [ ] If any repository references a table with no migration and no remote table, create the migration before shipping the feature.

Exit gate: no launch-critical repository points to a missing table.

### P1-02 Apply Remote Migrations

- [ ] Link Supabase CLI:

```powershell
npx supabase link --project-ref <project-ref>
```

- [ ] Push migrations:

```powershell
npx supabase db push
```

- [ ] If Docker/local reset is unavailable, use remote dashboard SQL editor and apply migrations in timestamp order.

Exit gate: remote schema is updated without errors.

### P1-03 Regenerate Supabase Types

- [ ] Run:

```powershell
npm run types:supabase
npx tsc --noEmit
```

- [ ] Fix schema/type mismatches in `schemas.ts`, not by editing generated `supabase.ts`.

Exit gate: generated types are current and TypeScript passes.

### P1-04 RLS Smoke Test

Launch-critical tables:

- `sessions`
- `session_completion_ledgers`
- `reward_ledger`
- `wallet_transactions`
- `streaks`
- `streak_shields`
- `streak_repair_quests`
- `notifications`
- `reminder_plans`
- `push_tokens`
- `purchase_attempts`
- `companion_promises`
- `companion_memories`
- `focus_contracts`

For each:

- [ ] Test unauthenticated read behavior.
- [ ] Test authenticated user can read only their own rows.
- [ ] Test authenticated user cannot write another user's rows.
- [ ] Record SQL and result in `VERIFICATION_REPORT.md`.

Exit gate: no cross-user data exposure.

### Phase 1 Verification Packet

Database work does not pass until code, generated types, and remote Supabase behavior agree.

Required evidence:

| Evidence | Required proof |
|---|---|
| Migration inventory | migration filenames and applied order |
| Remote apply | `supabase db push` output or dashboard SQL execution proof |
| Type generation | `npm run types:supabase` output and changed generated types |
| Typecheck after generation | `npx tsc --noEmit` output |
| RLS | table-by-table anon and authenticated test results |

Minimum RLS evidence per table:

```markdown
| Table | Anon read | Own-row read | Other-user read | Other-user write | Result |
|---|---|---|---|---|---|
| sessions | denied/0 rows | allowed | denied/0 rows | denied | PASS |
```

PASS requires:

- Remote schema contains every launch-critical table.
- Generated Supabase types match remote schema.
- TypeScript passes after regeneration.
- No RLS test exposes another user's data.

FAIL if:

- Any launch-critical table is missing remotely.
- Generated types are stale.
- RLS behavior is untested.
- Any cross-user read or write succeeds.

---

## 9. Phase 2 - Integrity Sprint

**Priority:** P0  
**Deadline:** May 20  
**Goal:** Remove production trust breakers before feature polish.

### Phase 2 11/10 Outcome

This phase turns the codebase from "maybe works" into "safe to improve." No product polish matters if the code is hiding type escapes, minified files, oversized coordinators, hardcoded design values, or architectural shortcuts.

By the end of this phase:

- TypeScript is clean.
- Banned patterns are gone from production code.
- Minified files are readable.
- Oversized files are split before new edits.
- UI values use tokens.
- Data access boundaries are enforced.
- The codebase is ready for fast, confident launch work.

### Phase 2 Deep Work

- [x] Create an integrity backlog from scan results, grouped by:
  - launch blocker.
  - required before touching feature.
  - safe to fix after launch only if hidden.
- [x] For each `any` or dynamic alias:
  - identify the real domain object.
  - add or reuse a Zod schema.
  - infer the type.
  - parse at boundary.
  - remove unsafe cast.
- [x] For each oversized file:
  - identify responsibilities.
  - extract pure helpers first.
  - extract UI sections second.
  - extract side-effect orchestration last.
  - add tests around changed service logic.
- [x] For each hardcoded color:
  - find the closest existing token.
  - add a token only if the design system truly lacks it.
  - test dark mode.
- [x] For each direct Supabase call outside repository:
  - move query to owning feature repository.
  - expose service method.
  - wire hook.
  - update component to consume hook only.

### Phase 2 Perfect Code Rules

Do not "clean up" randomly. Every integrity edit should either:

- unblock TypeScript.
- enforce app architecture.
- make a launch-critical feature safe to edit.
- remove a production rule violation.

Avoid broad refactors that do not help the May 30 launch.

### Phase 2 Anti-Regression Checks

- [x] Existing tests still pass after file splits.
- [x] Public exports remain compatible unless all callers are updated.
- [x] No feature behavior changes during pure formatting/minified expansion.
- [x] No UI layout changes from token replacement except intended theme consistency.
- [x] No new dependency is introduced.

### P2-01 TypeScript Zero

- [x] Run:

```powershell
npx tsc --noEmit --pretty false 2>&1 | Tee-Object -FilePath ts-errors.txt
```

- [x] Fix every error.
- [x] Known issue to verify: invalid Reanimated spring config key `energyThreshold`.

Exit gate: TypeScript exits zero.

### P2-02 Expand Minified Source Files

Files previously identified as compressed or unreadable:

- `src_impl/features/session-start/events.ts`
- `src_impl/persistence/PersistenceService.ts`
- `src_impl/features/retention/StreakCreatureSystem.ts`
- `src_impl/features/retention/near-miss-hooks.ts`
- `src_impl/features/rewards/variable-reward-system.ts`

Tasks:

- [x] Reformat into readable TypeScript.
- [x] Keep behavior unchanged first.
- [x] Add or update tests only after behavior is understandable.
- [x] Keep each file under 200 lines by splitting if needed.

Exit gate: no production file is a single compressed line.

### P2-03 Remove Banned Type Escapes

- [x] Remove all `DynamicRecord`, `DynamicValue`, and `DynamicItem`.
- [x] Replace each with a real interface or Zod-inferred type.
- [x] Replace `z.any()` with specific schema types or `z.unknown()` plus narrowing.
- [x] Remove `as any`.

Exit gate: banned type scan returns zero production matches.

### P2-04 Remove Hardcoded UI Values

- [x] Replace hardcoded hex/rgb colors with design tokens.
- [x] Replace hardcoded spacing, radius, and font sizes where touched.
- [x] Confirm dark mode still renders correctly.

Known files to review:

- `src_impl/shared/ui/components/InteractiveCard.tsx`
- `src_impl/shared/ui/components/MicroRewardBanner.tsx`
- `src_impl/shared/ui/components/Toast.tsx`
- `src_impl/shared/ui/components/ProgressSteps.tsx`
- `src_impl/shared/ui/components/OfflineBanner.tsx`
- `src_impl/shared/ui/components/StatusFeedback.tsx`
- `src_impl/shared/ui/primitives/EmptyState.tsx`
- `src_impl/shared/ui/primitives/LoadingOverlay.tsx`
- `src_impl/shared/ui/primitives/Skeleton.tsx`
- `src_impl/shared/monetization/components/PurchaseErrorState.tsx`
- `src_impl/shared/ui/state-components.tsx`
- `src_impl/features/session-story/screens/PostSessionStoryScreen.tsx`

Exit gate: color scan returns zero production matches except generated or documented token definitions.

### P2-05 Architecture Violation Scan

- [x] Run:

```powershell
rg "supabase\.from|supabase\.rpc|supabase\.channel" src_impl/screens src_impl/components -g "*.ts" -g "*.tsx" -n
```

- [x] Move any query/subscription to the owning feature repository or event layer.
- [x] Confirm every realtime subscription has cleanup.

Exit gate: zero direct Supabase access in screens/components.

### Phase 2 Verification Packet

Integrity work only passes with clean scans and a diff review. Do not pass this phase because the app "seems fine."

Required evidence:

| Evidence | Required proof |
|---|---|
| TypeScript | full `npx tsc --noEmit --pretty false` output |
| Banned types | scan output showing zero production matches |
| Banned APIs | scan output showing zero production matches |
| Hardcoded colors | scan output or documented token-definition exceptions |
| File size | over-200-line scan output |
| Architecture | Supabase-in-screens/components scan output |
| Minified files | line count/readability proof for listed files |

Commands to record:

```powershell
npx tsc --noEmit --pretty false
rg "console\.|: any\b|as any\b|<any>|z\.any\(\)|@ts-ignore|@ts-nocheck|@ts-expect-error" src_impl -g "*.ts" -g "*.tsx" | rg -v "__tests__|supabase.ts"
rg "StyleSheet\.create|FlatList[^A-Za-z]|AsyncStorage|raw fetch\(" src_impl -g "*.ts" -g "*.tsx" | rg -v "__tests__"
rg "#[0-9A-Fa-f]{3,8}|rgb\(" src_impl -g "*.ts" -g "*.tsx" | rg -v "__tests__|supabase.ts"
rg "DynamicRecord|DynamicValue|DynamicItem" src_impl -g "*.ts" -g "*.tsx" | rg -v "__tests__"
rg "supabase\.from|supabase\.rpc|supabase\.channel" src_impl/screens src_impl/components -g "*.ts" -g "*.tsx" -n
```

PASS requires:

- Zero TypeScript errors.
- Zero banned production matches.
- No direct Supabase calls in screens/components.
- No compressed one-line production source files.
- No edited production file over 200 lines.

FAIL if:

- Any `any` escape remains in production code.
- Any launch-critical file is unreadable/minified.
- Any new hardcoded UI value is introduced.
- TypeScript is not zero.

---

## 10. Phase 3 - Companion Promise Loop

**Priority:** P1, launch-defining  
**Deadline:** May 22  
**Goal:** Make returning tomorrow feel personal and concrete.

### Phase 3 11/10 Outcome

The Companion Promise loop should be the reason VEX feels different from a timer. A user should feel that yesterday created a thread and today is an opportunity to keep it.

By the end of this phase:

- Completing a meaningful session creates a concrete future promise.
- Home shows that promise as the main emotional reason to start.
- Keeping the promise creates visible recognition.
- Missing the promise creates a kind recovery path.
- The companion references real behavior, not generic motivation.

### Product Behavior

After a completed session, VEX creates a promise for the next meaningful session. On the next home open, the companion references that promise. If the user keeps it, the story celebrates continuity. If the user misses it, the companion offers recovery without shame.

### Phase 3 Experience Design

#### Moment 1: Promise Creation

When the user completes a qualifying session, VEX should create a promise silently or with a lightweight confirmation:

- "Tomorrow, let's protect this rhythm with 15 minutes."
- "I will remember this. Come back tomorrow for 15 minutes."
- "Same time tomorrow?" only if the app can support time-based reminders.

The promise should be based on actual session behavior:

- If the user completed 5-14 minutes: suggest 5 or 10 minutes.
- If the user completed 15-29 minutes: suggest 15 minutes.
- If the user completed 30+ minutes: suggest 25 or 30 minutes.
- If the user used a mode, prefer that mode tomorrow.
- If the user struggled, suggest a smaller session instead of escalating.

#### Moment 2: Home Return

Home should show:

- The companion's face/state if available.
- The promise in one sentence.
- A primary CTA that starts the promised session.
- A secondary escape only if needed: "Choose different session."

#### Moment 3: Promise Kept

Completion should say:

- "You kept yesterday's promise."
- Mention duration/mode.
- Mention companion memory.
- Create the next promise if appropriate.

#### Moment 4: Promise Missed

Home should say:

- "Yesterday got away. Start small today and we will rebuild the thread."
- Never say "failed", "broke", "lost everything", or "disappointed."

### Phase 3 Deep Work

- [ ] Define promise lifecycle states and transitions:
  - none -> pending.
  - pending -> fulfilled.
  - pending -> missed.
  - pending -> replaced.
  - missed -> recovered.
- [ ] Define the promise matching rules:
  - target date window.
  - duration tolerance.
  - mode matching or fallback.
  - timezone behavior.
  - offline completion behavior.
- [ ] Define copy for each state:
  - new promise created.
  - promise pending.
  - promise due soon.
  - promise kept.
  - promise missed.
  - promise recovered.
  - no promise yet.
- [ ] Define how promise interacts with:
  - streak risk.
  - recommended session.
  - focus contract.
  - post-session story.
  - reminders/notifications.
  - paywall.
- [ ] Add tests for timezone boundaries and offline fulfillment.

### Phase 3 Edge Cases

- [ ] User completes multiple sessions in one day.
- [ ] User completes a shorter session than promised.
- [ ] User completes a longer session than promised.
- [ ] User completes wrong mode but right duration.
- [ ] User opens app after promise expired.
- [ ] User travels across timezone.
- [ ] User is offline when promise would be fulfilled.
- [ ] User deletes account or signs out.
- [ ] User has no companion state loaded.
- [ ] Repository fails while home loads promise.

### P3-01 Data Model

Create or verify `companion_promises` with:

- `id`
- `user_id`
- `source_session_id`
- `target_date`
- `target_duration_minutes`
- `target_mode`
- `status`: `pending | fulfilled | missed | replaced`
- `created_at`
- `fulfilled_at`
- `missed_at`

Tasks:

- [ ] Add Zod schemas in `features/companion-promise/schemas.ts`.
- [ ] Infer all types with `z.infer`.
- [ ] Add repository methods only in `repository.ts`.
- [ ] Add RLS policies.
- [ ] Regenerate Supabase types after migration.

Exit gate: repository tests cover create, read active, fulfill, miss.

### P3-02 Service Rules

Create service behavior:

- [ ] Create a promise after a qualifying completed session.
- [ ] Do not create promises for sessions under 5 minutes.
- [ ] Replace older pending promise only when the new session is more recent.
- [ ] Fulfill promise when user completes a matching or better session on target date.
- [ ] Mark missed after the target window passes.
- [ ] Never shame the user for missing.

Exit gate: service tests cover create, replace, fulfill, miss, and no-promise cases.

### P3-03 Hook Contract

Expose a hook that returns:

- `data`
- `isPending`
- `isError`
- `error`
- `refetch`
- `keepPromise`
- `dismissRecovery`

Tasks:

- [ ] Use TanStack Query only in `hooks.ts`.
- [ ] Invalidate related home and companion queries on mutation success.
- [ ] Capture mutation errors in Sentry.
- [ ] Show user-facing toast on mutation failure.

Exit gate: hook matches required query/mutation state contract.

### P3-04 Home Presentation

Create or update the home companion card:

- Pending: "You said tomorrow would be a [duration]-minute [mode] day. Ready?"
- Fulfilled: "You kept yesterday's promise. I remembered."
- Missed: "Yesterday got away. We can still make today count."

Requirements:

- [ ] One primary CTA.
- [ ] Loading skeleton matching layout.
- [ ] Error state with retry using `ErrorState`.
- [ ] Empty state hidden or replaced by normal home hero.
- [ ] Offline banner when offline.
- [ ] Accessibility labels, roles, and hints.
- [ ] Minimum 44x44 touch targets.

Exit gate: home shows the correct promise state on physical device.

### P3-05 Analytics

Track:

- `companion_promise_created`
- `companion_promise_viewed`
- `companion_promise_fulfilled`
- `companion_promise_missed`
- `companion_promise_recovered`

Tasks:

- [ ] Sentry breadcrumbs in `analytics.ts`.
- [ ] PostHog tracking if existing analytics layer supports it.
- [ ] No `console.log`.

Exit gate: events visible in debug analytics and Sentry breadcrumbs.

### Phase 3 Verification Packet

The Companion Promise loop is the launch-defining feature. It requires unit, integration, device, database, analytics, and copy verification.

Required evidence:

| Evidence | Required proof |
|---|---|
| Data model | migration/schema/types diff |
| Repository | test output for create/read/fulfill/miss |
| Service | test output for promise lifecycle rules |
| Hook | query/mutation contract review |
| Home UI | screenshots for pending, fulfilled, missed, offline, loading, error |
| Device flow | video or step log for create -> view -> fulfill |
| Database | rows showing status transitions |
| Analytics | Sentry breadcrumb/PostHog debug event proof |
| Copy review | confirmation that missed promise copy is recovery-based, not shame-based |

Required test scenarios:

- First qualifying session creates one pending promise.
- Session under 5 minutes creates no promise.
- Newer session replaces older pending promise.
- Matching target-day session fulfills promise.
- Better target-day session fulfills promise.
- Expired target window marks promise missed.
- Offline home shows degraded promise state without crashing.
- Promise card retry works after repository error.

PASS requires:

- All scenarios pass.
- Home shows the correct state.
- Completion story can consume promise state.
- No generic or guilt-based copy ships.

FAIL if:

- Promise state can duplicate.
- Promise never appears on home after a qualifying session.
- Missed promise copy shames the user.
- Any promise mutation lacks Sentry/error handling.

---

## 11. Phase 4 - Home Screen Single Next Action

**Priority:** P1  
**Deadline:** May 22  
**Goal:** Home feels calm, directed, and premium.

### Phase 4 11/10 Outcome

Home should feel like a personal command center, not a dashboard trying to show everything. The best version of VEX tells the user the next right action without making them think.

By the end of this phase:

- The user sees one primary action within one second.
- The companion/promise/streak logic determines the action.
- Secondary cards support the action instead of competing with it.
- New users are not shown empty historical systems.
- Returning users feel continuity from yesterday.

### Phase 4 Home Information Architecture

The home screen should be structured as:

1. Primary action zone.
2. Companion/promise context.
3. Streak or rhythm status.
4. Weekly progress.
5. One contextual module.
6. Lower-priority exploration below fold or in tabs.

Do not show these above the fold together:

- boss plus challenge plus battle pass.
- shop plus paywall plus reward prompt.
- focus score plus analytics plus weekly report.
- squad/social plus AI coach plus companion promise.

### Phase 4 Deep Work

- [x] Inventory every home card/module.
- [ ] Assign each module a job:
  - start session.
  - explain why now.
  - show recent progress.
  - recover risk.
  - optional exploration.
- [x] Remove or move modules with duplicate jobs.
- [x] Define new-user home:
  - no fake focus score.
  - no empty boss/challenge noise.
  - one first-session CTA.
- [x] Define returning-user home:
  - promise/streak/recommendation priority.
  - recent progress.
  - one contextual module.
- [x] Define offline home:
  - show offline banner.
  - allow local session start if supported.
  - avoid actions that require network unless disabled with explanation.
- [x] Define premium user home:
  - no irrelevant premium upsell.
  - premium value appears as improved insight/protection, not clutter.

### Phase 4 Visual Polish Checklist

- [ ] Primary CTA has the strongest visual weight.
- [ ] Secondary cards are smaller and quieter.
- [ ] No card has more than one primary-looking button.
- [ ] Typography hierarchy is clear.
- [ ] Companion card does not look like an ad.
- [ ] Above-fold content fits on small iPhone without cramped text.
- [ ] Skeleton state preserves layout height.
- [ ] Offline banner does not push critical CTA offscreen.

### P4-01 Priority Service

- [x] Read `src_impl/features/home-spine/priority-service.ts`.
- [x] Confirm it produces exactly one primary action.
- [x] Add `COMPANION_PROMISE` and `PROMISE_RECOVERY`.
- [x] Unit test all priority cases.

Priority order:

1. `STREAK_CRITICAL`
2. `COMPANION_PROMISE`
3. `PROMISE_RECOVERY`
4. `STREAK_AT_RISK`
5. `RECOMMENDED_SESSION`
6. `CHALLENGE_NEAR_DONE`
7. `BOSS_ACTIVE`
8. `DEFAULT_SESSION`

Exit gate: tests prove deterministic priority selection.

### P4-02 Hero Card

- [x] `HomeHeroCard` renders one primary CTA.
- [x] Secondary CTA is optional and never competes visually.
- [x] CTA copy matches the selected priority.

Copy:

- `STREAK_CRITICAL`: "Save Your Streak"
- `COMPANION_PROMISE`: "Keep Your Promise"
- `PROMISE_RECOVERY`: "Start Fresh Today"
- `STREAK_AT_RISK`: "Protect Today"
- `RECOMMENDED_SESSION`: "Start Recommended Session"
- `CHALLENGE_NEAR_DONE`: "Finish Today's Challenge"
- `BOSS_ACTIVE`: "Continue Focus Battle"
- `DEFAULT_SESSION`: "Start Focus"

Exit gate: manual device test confirms only one primary CTA above the fold.

### P4-03 Reduce Above-Fold Noise

Above the fold should contain:

- One hero card.
- Streak status.
- Weekly progress.
- One contextual card.

Tasks:

- [x] Remove boss and challenge from showing simultaneously.
- [x] Move shop, battle pass, analytics, and social prompts below fold or to tabs.
- [x] Hide incomplete P2 surfaces by feature flag.

Exit gate: standard iPhone viewport shows one clear primary action and no more than three secondary cards.

### Phase 4 Verification Packet

Home is the app's decision surface. This phase does not pass unless the home screen is visually and behaviorally calm.

Required evidence:

| Evidence | Required proof |
|---|---|
| Priority logic | unit tests covering every priority |
| Home CTA | screenshots for each priority state |
| Visual noise | screenshot showing above-the-fold card count |
| Navigation | device proof that each CTA reaches correct screen |
| Offline | screenshot and behavior proof |
| Accessibility | labels, roles, hints, and touch target review |
| Reduced motion | proof animations simplify or skip |

Required priority scenarios:

- Critical streak beats every other action.
- Companion promise beats recommended session.
- Promise recovery beats normal streak risk.
- Streak at risk beats challenge.
- Recommendation beats boss.
- Challenge near completion beats boss.
- Default session appears when no signals exist.

PASS requires:

- Exactly one primary CTA above the fold.
- No more than three secondary cards above the fold.
- Every priority CTA navigates correctly.
- Home does not show shop, battle pass, boss, challenge, social, and analytics all at once.

FAIL if:

- User has to choose between multiple primary actions.
- Home shows unfinished P2 features.
- CTA copy does not match action.
- Any primary CTA leads to a broken or placeholder screen.

---

## 12. Phase 5 - Session Completion Story

**Priority:** P1  
**Deadline:** May 23  
**Goal:** Finishing a session feels like a premium ritual.

### Phase 5 11/10 Outcome

The completion story should be the moment users understand why VEX is more than a timer. It must convert raw session data into meaning.

By the end of this phase:

- Completion never feels generic.
- The grade is explained clearly.
- The companion notices a real detail.
- The user sees progress without being overwhelmed.
- The next action is obvious.
- Rewards, promise, contract, streak, and story do not contradict each other.

### Phase 5 Story Structure

Every completed session story should have these beats:

1. Result: "You focused for X minutes."
2. Quality: "Grade Y because Z."
3. Meaning: "This helped your rhythm/streak/contract because Z."
4. Companion: specific memory or reaction.
5. Tomorrow: promise or recommended next session.
6. CTA: one next action.

Optional beats:

- Personal best.
- Streak saved.
- Contract fulfilled.
- Premium shield value.

Optional beats must not crowd the core story.

### Phase 5 Deep Work

- [x] Build a story beat model instead of hardcoding JSX branches.
- [x] Define beat priority:
  - session result.
  - grade explanation.
  - promise/contract outcome.
  - companion memory.
  - personal best.
  - next session.
- [x] Ensure each beat has:
  - title.
  - one-sentence body.
  - optional metric.
  - optional companion line.
  - accessibility label.
- [x] Create fallback copy for missing optional data.
- [x] Confirm rewards are already saved before story claims them.
- [x] Confirm story can render if companion memory fails.
- [x] Confirm story can render offline from local completion state.

### Phase 5 Copy Bar

Bad:

- "Great session!"
- "You earned rewards."
- "Come back tomorrow."

Better:

- "You protected 15 minutes without switching modes."
- "Your grade is A because you stayed clean through the final stretch."
- "I remembered this one. Tomorrow, 15 minutes is enough to keep the thread alive."

### Phase 5 Edge Cases

- [ ] Session completion succeeds but companion memory fails.
- [ ] Companion memory succeeds but promise creation fails.
- [ ] Personal best service returns no result.
- [ ] User completes session offline.
- [ ] User exits app during completion.
- [ ] Duplicate completion event fires.
- [ ] Story route opens with invalid session ID.
- [ ] User has reduced motion enabled.

### P5-01 Navigation Proof

- [x] Search:

```powershell
rg "PostSessionStory" src_impl -g "*.ts" -g "*.tsx" -n
```

- [x] Confirm session completion navigates to story with session ID.
- [x] If not, wire navigation in the completion flow.

Exit gate: completing a session opens the story screen.

### P5-02 Story View Model

Story must include:

- Session grade.
- Focus duration.
- Quality or purity signal.
- Companion memory message.
- Promise created/fulfilled/missed state.
- Next recommended session.

Tasks:

- [x] Build these in service/view-model layer, not JSX.
- [x] Parse all external data through Zod schemas.
- [x] Add tests for full, partial, and missing data.

Exit gate: story view model test covers all required beats.

### P5-03 Story UI States

The story screen must include:

- [x] Loading skeleton.
- [x] Error state with retry.
- [x] Empty fallback if no story exists.
- [x] Offline degraded banner.
- [x] Success story.
- [x] Reduced-motion behavior.

Exit gate: every state is reachable in development test setup.

### P5-04 Next Session CTA

- [x] If story has next-session recommendation, CTA opens `SessionSetup` with duration/mode prefilled.
- [x] If no recommendation, CTA returns home.
- [x] Secondary share CTA only appears when share handler is available.

Exit gate: CTA navigation works on device.

### Phase 5 Verification Packet

The completion story is the emotional payoff. It must be proven with real session data, not mocked happy paths only.

Required evidence:

| Evidence | Required proof |
|---|---|
| Navigation | step log showing completion opens story |
| View model | tests for full, partial, and missing data |
| UI states | screenshots for loading, error, empty, offline, success |
| Companion memory | database row and rendered copy screenshot |
| Promise state | story screenshot for created/fulfilled/missed where applicable |
| CTA | device proof that next-session CTA prefills setup |
| Reduced motion | proof story respects reduced motion |

Required story beats:

- What the user did.
- How well they did.
- What changed.
- What the companion remembered.
- What tomorrow is for.
- What the user can do next.

PASS requires:

- Story appears after session completion.
- Story never shows generic placeholder copy.
- Story handles missing optional data gracefully.
- Primary CTA is correct for the recommendation state.

FAIL if:

- Completion can skip to a dead end.
- Story screen only handles success state.
- Companion memory is generic or disconnected from session facts.
- CTA does not navigate or uses wrong params.

---

## 13. Phase 6 - Focus Contract

**Priority:** P1  
**Deadline:** May 23  
**Goal:** Make sessions intentional, then close the loop.

### Phase 6 11/10 Outcome

Focus Contract should make a session feel chosen, not accidental. If the user sets an intention, VEX must remember it during the session and ask about it after.

By the end of this phase:

- The contract is easy to set.
- The contract appears at the right moments, not constantly.
- Reflection is simple and emotionally safe.
- The companion response depends on the user's answer.
- Contract data improves the completion story.

### Phase 6 Experience Design

Contract setup should feel lightweight:

- "What are you protecting this session?"
- Options can be simple:
  - Deep work.
  - Study.
  - Reading.
  - Planning.
  - Custom short text if already supported.

During session:

- Early reminder: "You chose deep work. Keep the surface clear."
- Late reminder: "Final stretch. Finish the promise you set."

After session:

- Done: "You followed through."
- Partly: "You stayed with part of it. That still counts."
- Not today: "Good to know. Next time we make the target smaller."

### Phase 6 Deep Work

- [x] Confirm contract schema is clear and not overbuilt.
- [x] Confirm contract creation is optional.
- [x] Confirm session can start without contract.
- [x] Confirm reminder timing uses session progress, not arbitrary timers.
- [x] Confirm reminder is not repeated after dismissal.
- [x] Confirm reflection state is saved once.
- [x] Confirm contract reflection updates story view model.
- [x] Confirm contract failure cannot block session reward persistence.

### Phase 6 Edge Cases

- [x] User starts session without contract.
- [x] User creates contract then cancels setup.
- [x] User completes session before first reminder.
- [x] User backgrounds app during reminder window.
- [x] User skips reflection.
- [x] Reflection save fails.
- [x] Contract row exists but session row is missing.
- [x] Reduced motion enabled.

### P6-01 Contract Creation

- [x] Confirm setup can create a focus contract.
- [x] Confirm contract persistence goes through repository.
- [x] Confirm active session can read the current contract through a hook.

Exit gate: a contract created in setup appears during the active session.

### P6-02 Contract Reminder

- [x] Reminder appears only when a contract exists.
- [x] Reminder appears once near the first 10% and once near the last 10%.
- [x] Reminder respects reduced motion.

Exit gate: reminder timing verified manually.

### P6-03 Reflection

After completion, ask:

- "Did you accomplish what you set out to do?"

Options:

- Done.
- Partly.
- Not today.

Tasks:

- [x] Call `reflectOnContract` from completion flow.
- [x] Show companion response from service copy.
- [x] Capture errors in Sentry and show retry/fallback.

Exit gate: reflection is saved and visible in post-session story.

### Phase 6 Verification Packet

The contract system must either feel complete or be hidden. A half-wired intention flow damages trust.

Required evidence:

| Evidence | Required proof |
|---|---|
| Creation | setup screen step log and repository row |
| Active reminder | screenshots at early and late session windows |
| No-contract behavior | screenshot/log proving reminder is absent |
| Reflection | completion flow screenshot and saved row |
| Companion response | screenshot for Done, Partly, Not today |
| Error handling | forced failure proof with retry/fallback |
| Tests | service tests for create/read/reflect |

PASS requires:

- Contract can be created before a session.
- Reminder appears only when it should.
- Reflection is saved after completion.
- Companion response is visible in completion/story.

FAIL if:

- Contract entry point exists but reflection does not.
- Reminder appears continuously or without a contract.
- Reflection errors fail silently.
- Contract data bypasses repository/service layering.

---

## 14. Phase 7 - Monetization Moment

**Priority:** P1  
**Deadline:** May 24  
**Goal:** Make the paywall specific, timely, and trustworthy.

### Phase 7 11/10 Outcome

The paywall should feel like a natural extension of what the user just earned, not an interruption. It must protect trust first and convert second.

By the end of this phase:

- Paywall trigger is specific and rare enough to feel relevant.
- Copy references the user's actual streak/session context.
- The user can dismiss without losing results.
- Restore purchases is obvious.
- Purchase errors are handled gracefully.
- Premium value is honest and App Store-safe.

### Phase 7 Monetization Principles

- Never paywall the user's completed-session result.
- Never imply a streak is literally lost if that is not true.
- Never use fake urgency.
- Never hide restore purchases.
- Never call RevenueCat directly outside shared monetization.
- Never show multiple upsells in one flow.
- Never show premium copy before the user understands the base app.

### Phase 7 Deep Work

- [x] Inventory all existing paywall triggers.
- [x] Remove or suppress triggers that compete with completion story.
- [x] Add trigger cooldown so user is not repeatedly shown paywall.
- [x] Confirm free vs premium entitlement source.
- [x] Confirm paywall can render offline or shows a useful fallback.
- [x] Confirm restore purchases is visible from paywall and settings/profile if applicable.
- [x] Confirm purchase success updates entitlement and returns to the correct screen.
- [x] Confirm purchase failure preserves session state.
- [x] Confirm paywall analytics distinguish:
  - viewed.
  - dismissed.
  - purchase started.
  - purchase succeeded.
  - purchase failed.
  - restore started.
  - restore succeeded.
  - restore failed.

### Phase 7 Copy Variants to Test

Use the best-performing honest version after internal review:

Variant A:

- Headline: "Your streak is worth protecting."
- Body: "You just proved this routine matters. Streak Shield can protect one missed day when life interrupts."
- CTA: "Protect My Streak"

Variant B:

- Headline: "Protect the rhythm you just built."
- Body: "A strong week should not disappear because one day gets messy. Streak Shield gives you one recovery."
- CTA: "Add Streak Shield"

Variant C:

- Headline: "Keep this streak safe."
- Body: "You earned today's progress. Premium can protect your streak once when life interrupts."
- CTA: "Protect It"

Do not ship a variant that sounds threatening, childish, or misleading.

### P7-01 Streak Shield Moment

Trigger:

- Free user.
- Streak >= 5 days.
- Session grade A or S.
- No paywall shown in the current session.

Copy:

- Headline: "Your streak is worth protecting."
- Body: "You just proved this routine matters. Streak Shield can protect one missed day when life interrupts."
- CTA: "Protect My Streak"
- Secondary: "Not Now"

Tasks:

- [x] Use existing shared monetization layer only.
- [x] Do not call RevenueCat directly.
- [x] Do not block access to earned session results.
- [x] Restore purchases remains visible and functional.

Exit gate: sandbox user sees paywall at the correct moment and can dismiss without breaking flow.

### P7-02 Paywall Failure States

- [x] Purchase failure shows user-facing error.
- [x] Restore failure shows user-facing error.
- [x] Network failure shows retry.
- [x] Unexpected errors are captured in Sentry.

Exit gate: all purchase paths tested in sandbox or documented if App Store sandbox blocks testing.

### Phase 7 Verification Packet

Monetization is launch-critical. It must be trustworthy, dismissible, restorable, and aligned with App Store rules.

Required evidence:

| Evidence | Required proof |
|---|---|
| Trigger logic | test output or step log for eligible and ineligible users |
| Paywall copy | screenshot showing final copy |
| Dismiss path | video or step log showing user returns to app safely |
| Purchase path | sandbox purchase result or documented sandbox blocker |
| Restore path | sandbox restore result |
| Error path | screenshot of purchase/restore/network failure state |
| RevenueCat boundary | code review note showing shared monetization layer usage only |
| Sentry | captured unexpected failure proof |

PASS requires:

- Paywall appears only at the intended moment.
- Paywall never blocks earned completion results.
- Restore purchases works or has a documented external sandbox blocker.
- Failure states are user-facing and recoverable.

FAIL if:

- RevenueCat is called directly outside shared monetization.
- Paywall copy is generic or manipulative.
- Restore purchases is missing.
- Dismissing paywall breaks navigation or session state.

---

## 15. Phase 8 - Premium Polish

**Priority:** P2  
**Deadline:** May 24  
**Goal:** Add delight only where it is fully real.

### Phase 8 11/10 Outcome

Premium polish should make the app feel deeper without making it feel busier. Every extra surface must earn its space.

By the end of this phase:

- Personal bests feel celebratory only when real.
- Focus Score is useful, not a fake number.
- Companion memory feels varied and truthful.
- Unfinished progression systems are hidden.
- New users are not overwhelmed by advanced mechanics.

### Phase 8 Deep Work

- [x] Audit every P2 surface for:
  - real data.
  - loading state.
  - empty state.
  - error state.
  - offline state if network-backed.
  - accessibility.
  - navigation entry point.
  - tests.
- [x] Decide `SHIP` or `HIDE` for each P2 feature.
- [x] Remove P2 modules from home unless they support the primary action.
- [x] Ensure hidden features do not leave:
  - dead routes.
  - menu items.
  - push notification targets.
  - deep links.
  - analytics events implying visibility.
- [x] Confirm shipped P2 surfaces make the app feel calmer or more meaningful.

### Phase 8 Personal Best Rules

Personal bests should ship only if they are:

- based on real historical data.
- explained in plain language.
- shown at the right moment.
- not repeated every session.
- not more visually dominant than the completion story.

Examples:

- "New cleanest session: 94% focus purity."
- "Longest deep work session: 32 minutes."
- "Best week so far: 4 completed sessions."

### Phase 8 Focus Score Rules

Focus Score should not be shown as a fake grade for new users.

New user copy:

- "Finish three sessions and VEX will start reading your focus rhythm."

Returning user copy:

- "Your Focus Score rose because your last three sessions were cleaner."

Required:

- Explain why score changed.
- Show "not enough data" honestly.
- Never show 0 as if the user failed.

### Phase 8 Companion Memory Rules

Memory copy must be:

- derived from session facts.
- short.
- varied.
- privacy-safe.
- not overly intimate.
- not repetitive.

Bad:

- "I remember everything about you."
- "You are my favorite."
- "Great job focusing."

Better:

- "I remembered that you came back after a rough start."
- "You stayed with the final five minutes. That matters."
- "You chose study mode twice this week. I noticed the pattern."

### P8-01 Personal Bests

Ship only if:

- [x] Detection is already reliable.
- [x] Post-session story can show a personal best beat.
- [x] Beat includes category, old value, and new value.
- [x] Tests cover new personal best and no personal best.

Exit gate: personal best celebration appears after a real qualifying session.

### P8-02 Focus Score

Ship only if:

- [x] Home widget uses live hook data.
- [x] Dashboard loads real history.
- [x] New users see a useful empty state, not zero pretending to be a score.
- [x] Score updates after completed sessions.

Exit gate: test user with 3+ sessions sees a non-static score.

### P8-03 Companion Memory Depth

Ship only if:

- [x] Memory copy is based on actual session facts.
- [x] Memory is not repeated too often.
- [x] Memory never exposes private or sensitive content unexpectedly.

Exit gate: three completed sessions produce varied, accurate companion messages.

### Phase 8 Verification Packet

Premium polish ships only if it is real. Delight that is fake, noisy, or half-wired must be hidden.

Required evidence:

| Evidence | Required proof |
|---|---|
| Personal bests | test output and real qualifying session screenshot |
| Focus Score | test user with 0, 1, and 3+ sessions screenshots |
| Companion memory | three varied session examples with rendered copy |
| Empty states | screenshots for new-user states |
| Feature flags | list of hidden P2 surfaces and default values |
| Navigation | proof no hidden feature has a visible dead entry point |

PASS requires:

- Every shipped P2 surface has tests and full UI states.
- New users do not see fake zeros as meaningful scores.
- Companion memory is varied and grounded in facts.

FAIL if:

- Any P2 feature uses fake data.
- Any P2 surface has only happy path UI.
- Any P2 surface adds noise to home.
- Any P2 feature threatens P0/P1 stability.

---

## 16. Phase 9 - Production Hardening

**Priority:** P0  
**Deadline:** May 26  
**Goal:** Prove the app survives real user conditions.

### Phase 9 11/10 Outcome

The app must hold up when the real world is messy: weak network, app backgrounding, failed purchases, invalid links, accessibility needs, repeated sessions, and App Store review behavior.

By the end of this phase:

- A user can complete the core flow without perfect network.
- Errors are recoverable and reported.
- Accessibility is good enough for real use, not checkbox compliance.
- Deep links and notification targets are safe.
- The app does not degrade after repeated sessions.
- No launch-critical flow depends on dev-only assumptions.

### Phase 9 Deep Work

- [ ] Test core flow on physical device and simulator.
- [ ] Test fresh install and upgrade install if an existing production build exists.
- [ ] Test signed-out, signed-in, expired session, and deleted account states.
- [ ] Test slow network, offline, reconnect, and retry.
- [ ] Test app background/foreground during:
  - active session.
  - completion write.
  - story screen.
  - purchase flow.
- [ ] Test notification/deep link into:
  - home.
  - session setup.
  - promise.
  - focus score or fallback.
- [ ] Confirm no crash appears in Sentry after testing.
- [ ] Confirm app does not create duplicate rewards or promises.

### Phase 9 Real-World Failure Matrix

| Scenario | Expected 11/10 behavior |
|---|---|
| App opens offline | Home loads local/degraded state and clearly shows offline |
| Session completes offline | Completion is stored locally and syncs once later |
| Supabase write fails | User sees fallback/retry; Sentry captures unexpected error |
| Purchase fails | User sees clear error and can continue app |
| Restore finds no purchase | User sees clear result, not a crash |
| Deep link invalid | App falls back home |
| Notification target missing | App opens safe fallback |
| User has reduced motion | Animations are skipped/simplified |
| VoiceOver on | Core flow remains navigable |
| App backgrounded mid-session | Timer/session state remains coherent |

### Phase 9 Polish Pass

- [ ] Remove debug-only UI.
- [ ] Remove leftover test copy.
- [ ] Confirm no screen flashes blank before loading.
- [ ] Confirm no skeleton remains after data loads.
- [ ] Confirm all retry buttons actually retry.
- [ ] Confirm all empty states have one CTA.
- [ ] Confirm every destructive action has confirmation if applicable.
- [ ] Confirm all toasts are readable and not stacked awkwardly.

### P9-01 Offline Session Flow

- [ ] Enable airplane mode.
- [ ] Start a session.
- [ ] Complete a session.
- [ ] Confirm offline banner appears.
- [ ] Re-enable network.
- [ ] Confirm sync happens once.
- [ ] Confirm no duplicate rewards.

Database proof:

- exactly one row in `session_completion_ledgers`
- expected rows only in `reward_ledger`

Exit gate: offline completion is deduped.

### P9-02 Accessibility

Core flow:

Home -> Session Setup -> Active Session -> Completion -> Story -> Home

Verify:

- [ ] VoiceOver can navigate.
- [ ] Every interactive element has label, role, and hint.
- [ ] Touch targets are at least 44x44.
- [ ] Reduced motion is respected.
- [ ] Important status changes are announced where appropriate.

Exit gate: core flow is usable with VoiceOver.

### P9-03 Sentry

- [ ] Confirm Sentry initializes in app startup.
- [ ] Confirm user context is attached after auth.
- [ ] Trigger a dev-only test error.
- [ ] Confirm it appears in Sentry.
- [ ] Confirm no uncaught promise rejection in core flow.

Exit gate: Sentry receives expected test event.

### P9-04 Deep Links

Test:

- [ ] Valid link to session setup.
- [ ] Valid link to focus score or home fallback if feature is cut.
- [ ] Invalid link.
- [ ] Notification target link.

Exit gate: invalid links never crash and valid links route correctly.

### P9-05 App Performance

Verify on physical device:

- [ ] Cold start feels acceptable.
- [ ] Home renders without visible layout jump.
- [ ] Active timer stays smooth.
- [ ] Completion story transitions do not stutter.
- [ ] No obvious memory leak after three sessions.

Exit gate: performance issues are either fixed or documented as non-blocking.

### Phase 9 Verification Packet

Production hardening requires real-device proof. Simulator-only proof is not enough for this phase.

Required evidence:

| Evidence | Required proof |
|---|---|
| Offline flow | device step log plus database rows |
| Accessibility | VoiceOver checklist with screenshots or notes |
| Sentry | event URL or screenshot with user context |
| Deep links | commands/URLs tested and observed behavior |
| Performance | device notes for cold start, home render, timer, story |
| Memory/session repeat | three-session run log |
| Crash-free core flow | statement based on device run and Sentry check |

Offline database proof:

```markdown
| User | Session ID | Ledger rows | Reward rows | Duplicate? | Result |
|---|---|---:|---:|---|---|
| test-user | session-id | 1 | expected count | no | PASS |
```

PASS requires:

- Offline completion syncs once.
- Accessibility core flow is usable.
- Sentry receives expected test errors.
- Deep links do not crash.
- No obvious performance or memory blocker remains.

FAIL if:

- Offline can duplicate rewards.
- VoiceOver cannot complete the core flow.
- Sentry is not receiving unexpected errors.
- Any valid or invalid deep link crashes the app.
- Timer or completion story is visibly unstable on device.

---

## 17. Phase 10 - Final Launch Gate

**Priority:** P0  
**Deadline:** May 27 before release candidate  
**Goal:** Decide whether the app is submit-ready.

### Phase 10 11/10 Outcome

This phase is where optimism ends. The release candidate either proves VEX is ready or forces a delay/cut decision.

By the end of this phase:

- The final visible product surface is known.
- Every unfinished feature is hidden.
- Every P0/P1 gate is proven.
- TestFlight has been installed and exercised.
- The team has a written ship/delay decision.

### Phase 10 Deep Work

- [ ] Freeze product scope.
- [ ] Freeze visible navigation map.
- [ ] Freeze App Store screenshots after final UI changes.
- [ ] Create final feature status table:
  - feature.
  - visible route.
  - status.
  - verification link/evidence.
  - cut decision if hidden.
- [x] Run full static verification.
- [ ] Run full manual E2E.
- [ ] Review Sentry for new errors after E2E.
- [ ] Review Supabase for duplicate completion/reward rows after E2E.
- [ ] Review App Store metadata against current product.
- [ ] Decide ship/delay.

### Phase 10 Release Candidate Rules

After this phase starts:

- No new features.
- No large refactors.
- No UI redesigns unless they fix a blocker.
- No new dependencies.
- No speculative improvements.
- Only blocker fixes, copy fixes, hidden-feature cleanup, and verification fixes.

### Phase 10 Known Issue Policy

Every known issue must be classified:

| Severity | Meaning | Decision |
|---|---|---|
| P0 | crash, data loss, privacy, payment, App Store blocker | fix or delay |
| P1 | core loop broken or visible trust issue | fix or hide affected surface |
| P2 | polish issue outside core loop | fix only if low risk, otherwise document |
| P3 | post-launch cleanup | document only |

No P0 or P1 issue can be accepted for launch.

### P10-01 Static Verification

Run:

```powershell
npx tsc --noEmit --pretty false
npm run lint -- --quiet
npm run test -- --passWithNoTests
```

Exit gate: all pass.

### P10-02 Banned Pattern Verification

Run:

```powershell
rg "console\.|: any\b|as any\b|<any>|z\.any\(\)|@ts-ignore|@ts-nocheck|@ts-expect-error" src_impl -g "*.ts" -g "*.tsx" | rg -v "__tests__|supabase.ts"
rg "StyleSheet\.create|FlatList[^A-Za-z]|AsyncStorage|raw fetch\(" src_impl -g "*.ts" -g "*.tsx" | rg -v "__tests__"
rg "#[0-9A-Fa-f]{3,8}|rgb\(" src_impl -g "*.ts" -g "*.tsx" | rg -v "__tests__|supabase.ts"
rg "DynamicRecord|DynamicValue|DynamicItem" src_impl -g "*.ts" -g "*.tsx" | rg -v "__tests__"
```

Exit gate: zero production matches.

### P10-03 File Size Verification

Run the file-size command from section 5.2.

Exit gate: no production source file exceeds 200 lines except generated files.

### P10-04 Physical Device E2E

Flow A: New user activation

- [ ] Fresh install.
- [ ] Complete onboarding.
- [ ] Start first session in three taps or fewer after reaching home.
- [ ] Complete 10-minute session.
- [ ] See grade.
- [ ] See story.
- [ ] See companion memory or promise.
- [ ] Return home.
- [ ] See one clear next action.

Flow B: Promise kept

- [ ] Create promise.
- [ ] Open app in promise window.
- [ ] Start matching session.
- [ ] Complete session.
- [ ] See promise kept state.
- [ ] See companion acknowledgement.

Flow C: Promise missed

- [ ] Create promise.
- [ ] Let window expire or force time condition.
- [ ] Open app.
- [ ] See recovery copy.
- [ ] Start fresh session.
- [ ] App does not shame or block the user.

Flow D: Offline

- [ ] Complete session offline.
- [ ] Reconnect.
- [ ] Confirm sync once.
- [ ] Confirm no duplicate rewards.

Flow E: Monetization

- [ ] Free user with 5+ day streak completes A/S session.
- [ ] Paywall appears with Streak Shield copy.
- [ ] Dismiss works.
- [ ] Restore purchases works or documented sandbox blocker exists.

Exit gate: all five flows pass on physical device or TestFlight.

### Phase 10 Verification Packet

This is the release candidate gate. It is not a confidence check. It is the final objective proof package.

Required evidence:

| Evidence | Required proof |
|---|---|
| Static checks | TypeScript, lint, and test output |
| Banned scans | zero-match output for every scan |
| File size | zero over-limit output |
| Device E2E | pass/fail table for flows A-E |
| Screenshots | home, setup, active, completion, story, paywall, offline |
| Cut list | every hidden/deferred feature and reason |
| Known issues | severity, owner, decision, release impact |
| Final decision | `SHIP`, `DELAY`, or `CUT_AND_RETEST` |

E2E report format:

```markdown
| Flow | Device | Build | Result | Evidence | Notes |
|---|---|---|---|---|---|
| A New user activation | iPhone model | build id | PASS/FAIL | screenshot/video | notes |
| B Promise kept | iPhone model | build id | PASS/FAIL | screenshot/video | notes |
| C Promise missed | iPhone model | build id | PASS/FAIL | screenshot/video | notes |
| D Offline | iPhone model | build id | PASS/FAIL | screenshot/video/db | notes |
| E Monetization | iPhone model | build id | PASS/FAIL | screenshot/video | notes |
```

PASS requires:

- All static checks pass.
- All banned scans are clean.
- All five E2E flows pass.
- No P0 or P1 task remains unchecked.
- Every P2 miss is hidden.

FAIL if:

- Any core flow crashes.
- Any E2E flow fails.
- TypeScript, lint, or tests fail.
- Banned production patterns remain.
- A visible unfinished feature remains.

---

## 18. App Store Package

**Deadline:** May 28  
**Goal:** No metadata surprises.

- [ ] App icon is 1024x1024 with no alpha.
- [ ] Required screenshots are prepared.
- [ ] Privacy policy URL is live.
- [ ] Support URL is live.
- [ ] App privacy answers match actual SDKs and behavior.
- [ ] In-app purchase products match app copy.
- [ ] Trial length and price are accurate.
- [ ] Age rating is reviewed.
- [ ] Export compliance answered.
- [ ] Release notes are honest and user-facing.
- [ ] TestFlight build has been installed and smoke-tested.

Exit gate: App Store Connect has no missing metadata.

### App Store Verification Packet

Required evidence:

| Evidence | Required proof |
|---|---|
| Icon | asset inspected, 1024x1024, no alpha |
| Screenshots | filenames/device sizes listed |
| Privacy policy | live URL opened |
| Support URL | live URL opened |
| App privacy | answers reviewed against SDK list |
| IAP | product IDs, prices, trial, descriptions match app |
| Export compliance | selected answer recorded |
| Age rating | selected rating recorded |
| TestFlight | build number installed on device |
| Release notes | final copy pasted into report |

PASS requires:

- App Store Connect shows no missing metadata.
- IAP products are approved or ready for review as required.
- Privacy answers match actual app behavior.
- TestFlight build was installed and smoke-tested.

FAIL if:

- Metadata is incomplete.
- Privacy policy or support URL is not live.
- IAP copy and app paywall disagree.
- Screenshots show outdated UI, hidden features, or broken states.

---

## 19. North Star Metric

**Weekly fulfilled companion promises per activated user.**

Definition:

- Activated user: completed at least one session.
- Fulfilled companion promise: promise status is `fulfilled` within seven days of activation.

Target:

- Launch week: at least 20% of activated users fulfill one promise.
- Warning zone: below 10%.
- If below 10%, improve promise visibility/copy before adding new progression features.

Example query shape:

```sql
SELECT
  user_id,
  COUNT(*) FILTER (WHERE status = 'fulfilled') AS fulfilled_promises
FROM companion_promises
WHERE created_at >= now() - interval '7 days'
GROUP BY user_id;
```

---

## 20. Verification Report Template

Append this after every phase:

```markdown
## Phase N - Name

**Status:** PASS | FAIL | PARTIAL
**Date:** YYYY-MM-DD
**Commit:** short-sha
**Build:** local dev | EAS build id | TestFlight build
**Device(s):** simulator/device model + OS
**Verifier:** name

### Scope Completed
- Item:
- Item:

### Commands Run
- command here

### Command Output Summary
| Command | Exit code | Result | Notes |
|---|---:|---|---|
| command | 0 | PASS | key output |

### Automated Checks
| Check | Required | Actual | Result |
|---|---|---|---|
| TypeScript | 0 errors | 0 errors | PASS |
| Lint | 0 errors | 0 errors | PASS |
| Tests | all pass | all pass | PASS |
| Banned scans | 0 matches | 0 matches | PASS |
| File size | no production file >200 lines | no matches | PASS |

### Manual QA
| Flow/Screen | Device | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|
| Home | iPhone model | steps | expected | actual | PASS |

### Data and Backend Proof
| Area | Evidence |
|---|---|
| Supabase rows/RLS | query/result |
| Sentry | event URL/screenshot |
| Analytics | debug event/screenshot |
| EAS/App Store | build URL/status |

### UI Proof
- Screenshot:
- Screenshot:
- Video:

### Files Changed
- path/to/file

### Feature Flags and Cuts
| Feature | Decision | Flag/default | Reason |
|---|---|---|---|
| feature | SHIP/HIDE/CUT | flag=false | reason |

### Risks Remaining
| Risk | Severity | Owner | Decision |
|---|---|---|---|
| risk | P0/P1/P2 | owner | fix/cut/accept |

### Final Phase Decision
PASS/FAIL/PARTIAL because:
- reason
```

Rules:

- PASS means every checkbox has evidence.
- PARTIAL means anything is feature-flagged, deferred, or manually unverified.
- FAIL means a launch gate is blocked.
- A phase with missing command output cannot be PASS.
- A phase with missing device proof cannot be PASS if it changes a user-visible core flow.
- A phase with hidden P2 work can be PASS only if the hidden work has no visible entry point.
- A phase with any P0 blocker is FAIL, not PARTIAL.

### 20.1 Verification Quality Standard

Bad verification:

- "Looks good."
- "Should work."
- "Tested manually."
- "No errors seen."
- "Probably fine."

Acceptable verification:

- Exact command.
- Exit code.
- Relevant output.
- Device and build.
- Screenshot/video when UI changed.
- Database row or external service proof when backend state changed.
- Clear PASS/FAIL decision.

### 20.2 Required Screenshot Set for UI Phases

For phases 3, 4, 5, 6, 7, and 8, attach screenshots for:

- Default/light mode.
- Dark mode.
- Loading state.
- Error state.
- Empty state when applicable.
- Offline state when applicable.
- Smallest supported iPhone viewport.
- The exact success state being claimed.

### 20.3 Required Database Proof for Data Phases

For phases 1, 3, 5, 6, 7, and 9, include:

- User ID used for test.
- Session ID if applicable.
- Relevant row IDs.
- Before state.
- After state.
- Query used.
- Confirmation that duplicate rows were not created.

### 20.4 Required Sentry Proof

For phases touching async work:

- Sentry is called for unexpected failures.
- Error has useful context.
- User-facing copy does not expose implementation details.
- Retry or fallback behavior is visible.

---

## 21. Ship, Delay, or Cut

### Ship on May 30 only if:

- EAS production build and submit path is proven.
- Remote Supabase schema and RLS are verified.
- TypeScript, lint, and tests pass.
- Banned pattern scans are clean.
- Core session flow works on physical device.
- Companion Promise loop works.
- Home has one primary action.
- Offline sync is deduped.
- Paywall and restore purchases are functional.
- No visible placeholder, fake data, or dead entry point remains.

### Delay if:

- App Store Connect rejects the binary.
- EAS production build cannot complete.
- TypeScript is not zero.
- Remote RLS is unverified.
- Session completion can lose or duplicate data.
- Offline sync can duplicate rewards.
- Restore purchases is broken.
- Companion Promise never appears after a qualifying session.
- The app has a known crash in the core flow.

### Cut P2 work if:

- It is not fully wired by May 27.
- It has no tests.
- It lacks loading/error/empty/offline states.
- It uses fake data.
- It adds visual noise to home.
- It threatens a P0 gate.

---

## 22. 11/10 Perfection Audit

Run this after Phase 10 and before App Store submission. This audit exists to catch the difference between "works" and "feels exceptional."

### 22.1 First-Run Audit

- [ ] Fresh install does not show stale cached state.
- [ ] Onboarding is clear and not too long.
- [ ] Notification permission prompt is contextual, not random.
- [ ] Home after onboarding has one primary action.
- [ ] First session can be started in three taps or fewer.
- [ ] No historical widgets show fake zeros as if they are meaningful.
- [ ] No premium upsell appears before the user gets value.

PASS requires: a new user can understand and start VEX without explanation.

### 22.2 Day-Two Audit

- [ ] App recognizes the previous session.
- [ ] Companion references yesterday accurately.
- [ ] Promise state is visible if a promise exists.
- [ ] Missed promise state is kind and recovery-oriented.
- [ ] Primary CTA starts the right recovery or promise session.
- [ ] No unrelated gamification prompt competes with the return moment.

PASS requires: Day Two feels like VEX remembered the user.

### 22.3 Completion Ritual Audit

- [ ] Grade explanation is understandable.
- [ ] Companion message is specific to the session.
- [ ] Story has a clear beginning, result, and next step.
- [ ] Personal best appears only when real.
- [ ] Next-session CTA is obvious.
- [ ] Share option is secondary.
- [ ] User can leave the story without losing rewards or progress.

PASS requires: completion feels rewarding even without a paywall or animation.

### 22.4 Copy Audit

Remove or rewrite any copy that is:

- Generic: "Great job", "No items found", "Something went wrong".
- Shaming: "You failed", "You broke your promise", "Don't lose everything".
- Fake urgent: "Last chance" when it is not true.
- Too game-like for a focus app: copy that makes productivity feel childish.
- Too technical: database, query, network, auth, SDK, or stack wording shown to users.
- Too long: paragraph copy where one sentence is enough.

Required VEX voice:

- Direct.
- Calm.
- Specific.
- Encouraging without being cheesy.
- Honest about what happened.

Examples:

| Bad | Better |
|---|---|
| "No items found." | "Nothing is waiting yet. Finish one focus session and VEX will start tracking your rhythm." |
| "You missed your promise." | "Yesterday got away. Start small today and we will rebuild the thread." |
| "Something went wrong." | "VEX could not load this yet. Try again in a moment." |
| "Upgrade now!" | "Protect this streak" |

PASS requires: no generic system copy remains in launch-critical flows.

### 22.5 Visual QA Audit

For home, setup, active session, completion story, paywall, and offline state:

- [ ] No text clipping.
- [ ] No overlapping UI.
- [ ] No button label wraps awkwardly.
- [ ] No unbalanced card spacing.
- [ ] No card inside card.
- [ ] No hardcoded colors.
- [ ] Dark mode is not low contrast.
- [ ] Loading skeleton matches final layout.
- [ ] Empty state has one CTA.
- [ ] Error state has retry.

PASS requires: screenshots look release-quality on small, standard, and large iPhone sizes.

### 22.6 Trust Audit

- [ ] No fake data.
- [ ] No placeholder screens.
- [ ] No dead buttons.
- [ ] No debug labels.
- [ ] No hidden console logging.
- [ ] No user-facing stack traces.
- [ ] No reward can be duplicated by retrying, reconnecting, or reopening.
- [ ] No purchase state is ambiguous after failure.
- [ ] No privacy-sensitive data appears in companion memory unexpectedly.

PASS requires: every visible feature is honest.

### 22.7 App Store Review Audit

- [ ] App does not crash on launch without network.
- [ ] Login/auth flow works for reviewer path.
- [ ] Demo account exists if App Review needs one.
- [ ] IAP products are reachable and match metadata.
- [ ] Restore purchases is reachable.
- [ ] Push notification permission request has purpose.
- [ ] Privacy policy describes actual data use.
- [ ] App does not imply medical claims, guaranteed productivity, or manipulative outcomes.

PASS requires: an App Review tester can understand, use, and review the app without private instructions beyond demo credentials if needed.

### 22.8 Final Human Taste Test

Have one person who did not build the feature run the app for 10 minutes and answer:

1. What is VEX asking you to do next?
2. Did the companion feel connected to what you did?
3. Did anything feel fake, confusing, childish, or unfinished?
4. Would you open it again tomorrow?
5. What was the worst moment?

If the answer to question 1 is unclear, home is not ready.  
If the answer to question 2 is no, companion promise/story is not ready.  
If question 3 names a visible issue, fix or hide that surface.  
If question 5 is a crash, blank screen, broken paywall, or duplicate reward, delay submission.

---

## 23. Final Launch Checklist

- [ ] `VERIFICATION_REPORT.md` has evidence for every phase.
- [ ] No unchecked P0 task remains.
- [ ] No unchecked P1 task remains unless explicitly cut and hidden.
- [ ] All P2 unfinished work is hidden or removed.
- [ ] TestFlight build passes the five E2E flows.
- [ ] App Store metadata is complete.
- [ ] Submission build is selected in App Store Connect.
- [ ] 11/10 Perfection Audit passes.
- [ ] Final human taste test is recorded.
- [ ] Final decision recorded: ship or delay.

If any item above is not true, VEX is not ready for App Store submission.
