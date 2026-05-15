# VEX 11/10 App Store Launch Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Ship VEX to App Store review by **May 30, 2026** as a polished, trustworthy focus app where the core loop feels inevitable: open app, see the best action, start focus fast, finish, understand growth, know what to do next.

**Architecture:** Keep the current Expo React Native architecture. Do not rebuild the app. Tighten the existing systems, remove launch risk, wire isolated services into the real user loop, and verify every state with evidence.

**Tech Stack:** Expo SDK 54, TypeScript strict, TanStack Query v5, Zustand, Zod, React Navigation v6, Reanimated 3, Supabase, MMKV, SecureStore, Sentry, RevenueCat, design tokens from `src/theme/tokens/`.

**Scope Guard:** This document is the execution source of truth. Only implement features that directly improve the launch loop, data integrity, App Store acceptance, crash-free usage, accessibility, or retention. Anything else is a post-launch backlog item.

---

## 0. Launch Reality Check

### Current Date And Deadline

- Today for planning purposes: **May 15, 2026**.
- App Store target: **May 30, 2026**.
- Working window: **15 calendar days**.
- Required submission buffer: at least **72 hours before May 30** for TestFlight processing, App Review questions, metadata fixes, and a possible rejection loop.

### Current External Requirements To Respect

- Apple says that starting **April 28, 2026**, iOS and iPadOS apps uploaded to App Store Connect must be built with the **iOS/iPadOS 26 SDK or later**. Source: [Apple App Store submitting guidance](https://developer.apple.com/app-store/submitting/).
- Apple requires accurate App Privacy details in App Store Connect, including data collected by third-party SDKs. Source: [Apple App Privacy details](https://developer.apple.com/app-store/app-privacy-details/).
- Apple rejects invalid privacy manifest files and requires required-reason API declarations where applicable. Source: [Apple privacy manifest documentation](https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk).
- Expo supports configuring iOS privacy manifests through `expo.ios.privacyManifests`. Source: [Expo privacy manifests](https://docs.expo.dev/guides/apple-privacy/).
- Expo SDK 54 maps to React Native 0.81, React 19.1, and lists Xcode 16.1+ in the SDK reference. Source: [Expo SDK 54 reference](https://docs.expo.dev/versions/v54.0.0/).
- Expo App Store submission uses a production build and `eas submit --platform ios`. Source: [Expo iOS submission guide](https://docs.expo.dev/submit/ios/).

### Important Launch Risk

Do not assume Expo SDK 54 alone satisfies Apple's April 28, 2026 upload requirement. The plan must prove the production iOS binary is accepted by App Store Connect and built with an acceptable SDK. If EAS or local build tooling cannot produce an App Store Connect-accepted binary, resolving that becomes the top priority before feature polish.

---

## 1. Prime Directive

```text
Open app -> see one best action -> start focus fast -> complete session
-> see proof of growth -> know what to do next.
```

Every launch task must make that sentence more true.

### The Five Beliefs VEX Must Create

1. "I know exactly what to do right now."
2. "Starting focus is frictionless."
3. "The app remembers what I actually did."
4. "My progress is real and explainable."
5. "Nothing here feels fake, empty, broken, or manipulative."

If a task does not support one of those beliefs, it is not a launch task.

---

## 2. Non-Negotiable Engineering Rules

### Architecture

Data flow must stay:

```text
Component -> Hook -> Service -> Repository -> Supabase
```

Rules:

- `repository.ts`: Supabase queries only.
- `service.ts`: business logic only.
- `hooks.ts`: TanStack Query and Zustand wiring only.
- `components/`: rendering only.
- `schemas.ts`: Zod schemas only.
- `types.ts`: domain types only, inferred from Zod where schema-backed.

### Hard Bans

- No `any`.
- No `@ts-ignore`, `@ts-nocheck`, or `@ts-expect-error`.
- No `console.log`.
- No `StyleSheet.create`.
- No `FlatList`; use FlashList with accurate `estimatedItemSize`.
- No AsyncStorage for new work; use MMKV or the existing SecureStorage wrapper.
- No raw network calls in app code except the existing API client or approved local-file handling already in repository code.
- No hardcoded colors, spacing, font sizes, or radii.
- No Supabase queries outside repositories.
- No RevenueCat SDK calls outside `shared/monetization/`.
- No app file over 200 lines, except generated files such as `src_impl/types/supabase.ts`.

### Required UI States

Every data-driven screen or component must include:

- Loading: skeleton matching final layout.
- Error: `src/components/states/ErrorState.tsx` with retry.
- Empty: VEX-voiced copy and one CTA.
- Success: the real loaded view.
- Offline: degraded banner or cached-data explanation.
- Optimistic: for writes users care about.

### Verification Means Evidence

A checkbox is complete only when the implementer records:

- Commands run.
- Expected and actual output.
- Files changed.
- Manual test notes or screenshots for user-facing work.
- Deferrals or feature flags.

Record evidence in `VERIFICATION_REPORT.md`.

---

## 3. Current Codebase Diagnosis

These are the launch-critical findings this plan is built around:

- `SUPABASE_SCHEMA.sql` only defines a small subset of tables, while repositories reference many more tables.
- `src_impl/features/session-completion/hooks/useSessionCompleteController.ts` is over 200 lines.
- `src_impl/screens/session/SessionSetupScreen.tsx` is over 200 lines.
- `src_impl/screens/session/ActiveSessionScreen.tsx` is over 200 lines.
- `src_impl/features/session-completion/completion-orchestrator.ts` is over 200 lines.
- `src_impl/features/session-completion/offline-sync-service.ts` is over 200 lines.
- Several support files exceed the line cap and must be split before meaningful edits.
- Existing source scans show banned patterns or launch-risk patterns in app code, including direct Supabase calls outside repositories and compressed files that are hard to review.
- `app.json` lacks explicit iOS privacy manifest configuration.
- The app has strong subsystems, but several are not connected to the visible core loop: focus contract, personal bests, next-best-action, companion memory, and shareable weekly proof.

---

## 4. Execution Order

| Phase | Name | Priority | Launch Rule |
|---|---:|---:|---|
| 0 | Toolchain And App Store Upload Proof | P0 | Must pass before polish work can be trusted |
| 1 | Database Schema And RLS Reality Audit | P0 | Must pass before data features ship |
| 2 | Integrity Sprint: Typecheck, Lint, File Splits | P0 | Must pass before final submission |
| 3 | Core Loop Product Spine | P1 | Must pass for 11/10 feel |
| 4 | Post-Session Reward Clarity | P1 | Must pass for emotional payoff |
| 5 | Focus Contract Wire-Up | P1 | Must pass for session intent |
| 6 | Personal Bests Wire-Up | P2 | Ship only if clean by May 24 |
| 7 | Companion Memory Timeline | P2 | Ship only if clean by May 24 |
| 8 | Weekly Focus Card | P2 | Ship only if clean by May 24 |
| 9 | Production Hardening | P0 | Must pass before App Store submission |
| 10 | Final Launch Gate | P0 | Must pass before release candidate |

### Cut Rules

- P0 cannot be cut.
- P1 can only be cut if the app otherwise cannot submit.
- P2 ships only when fully implemented, tested, accessible, and verified.
- Partially wired P2 features must be hidden behind feature flags with no visible dead entry points.

---

## 5. Daily Ship Schedule

| Date | Outcome |
|---|---|
| May 15 | Toolchain upload proof, schema audit inventory, baseline verification report |
| May 16 | Supabase migrations/RLS plan complete, type generation verified |
| May 17 | P0 file splits and banned-pattern cleanup plan complete |
| May 18 | Typecheck clean, lint trend down, no touched file over 200 lines |
| May 19 | Focus Score home-to-dashboard spine verified |
| May 20 | Post-session reward clarity implemented and manually tested |
| May 21 | Next-best-action loop implemented and manually tested |
| May 22 | Focus Contract setup/completion/reflection flow implemented |
| May 23 | Personal Bests implementation decision: ship or cut |
| May 24 | Companion Timeline and Weekly Card implementation decision: ship or cut |
| May 25 | Accessibility, offline, privacy, restore purchases hardening |
| May 26 | Physical-device E2E and TestFlight build |
| May 27 | Submit release candidate to App Store Connect/TestFlight |
| May 28 | Fix review blockers only |
| May 29 | Metadata, screenshots, final smoke test |
| May 30 | Release readiness decision |

---

## 6. Phase 0 - Toolchain And App Store Upload Proof

**Goal:** Prove the app can produce an iOS production build accepted by App Store Connect under the current 2026 SDK rules.

### P0-01 - Record Toolchain Baseline

**Files:**

- Read: `package.json`
- Read: `app.json`
- Read: `eas.json`
- Modify only if needed: `VERIFICATION_REPORT.md`

**Steps:**

- [x] Run:

```powershell
node --version
npm --version
npx expo --version
npx eas-cli --version
npx expo-doctor
npx expo config --type introspect
```

- [x] Record Node, npm, Expo CLI, EAS CLI, Expo Doctor status, bundle ID, app version, build number source, and configured iOS entitlements in `VERIFICATION_REPORT.md`.
- [x] If `npx expo-doctor` reports dependency drift, run:

```powershell
npx expo install --fix
```

- [x] Re-run `npx expo-doctor` and record clean output.

**Exit Gate:**

- [x] Toolchain versions are documented.
- [x] Expo Doctor is clean or every remaining warning is documented as non-blocking with a reason.

### P0-02 - Prove App Store Connect Upload Compatibility

**Files:**

- Read: `eas.json`
- Read: `app.json`
- Modify only if required: `eas.json`
- Modify only if required: `app.json`
- Modify: `VERIFICATION_REPORT.md`

**Steps:**

- [x] Confirm production build profile targets App Store distribution:

```powershell
Get-Content .\eas.json
```

- [ ] Build production iOS:

```powershell
eas build --platform ios --profile production
```

- [ ] Submit to App Store Connect/TestFlight:

```powershell
eas submit --platform ios --latest
```

- [ ] If App Store Connect rejects the binary for SDK/toolchain reasons, stop feature work and fix the build path first. Options, in order:
  - Configure EAS build image/toolchain capable of iOS 26 SDK.
  - Build locally with Xcode 26 if compatible with this Expo SDK and native project output.
  - Upgrade Expo only if SDK 54 cannot produce an acceptable binary. This requires its own plan and full regression pass.

**Exit Gate:**

- [ ] App Store Connect accepts the binary for processing.
- [ ] The accepted build appears in TestFlight or App Store Connect processing.
- [ ] Rejection emails, if any, are pasted into `VERIFICATION_REPORT.md` with the exact fix applied.

### P0-03 - Add Privacy Manifest Plan

**Files:**

- Modify: `app.json`
- Read: `node_modules/*/ios/PrivacyInfo.xcprivacy` where applicable
- Modify: `VERIFICATION_REPORT.md`

**Steps:**

- [x] Audit native packages with privacy manifests:

```powershell
Get-ChildItem -Path .\node_modules -Recurse -Filter PrivacyInfo.xcprivacy |
  Select-Object -ExpandProperty FullName
```

- [x] Add `expo.ios.privacyManifests` in `app.json` with every required-reason API actually used by VEX or bundled native SDKs.
- [x] Include `NSPrivacyCollectedDataTypes` only for data the app or SDKs collect.
- [x] Do not copy generic privacy manifest samples. Match actual SDK usage.
- [x] Re-run:

```powershell
npx expo config --type introspect
```

**Exit Gate:**

- [x] `app.json` contains an accurate privacy manifest.
- [ ] App Store Connect processing does not send an invalid privacy manifest warning.

---

## 7. Phase 1 - Database Schema And RLS Reality Audit

**Goal:** Every table referenced by repositories exists in version-controlled SQL with correct columns, indexes, and RLS.

### P1-01 - Generate Used Table Inventory

**Files:**

- Read: `src_impl/features/**/repository*.ts`
- Read: `src_impl/screens/**/*.tsx`
- Read: `SUPABASE_SCHEMA.sql`
- Create if missing: `supabase/migrations/`
- Modify: `VERIFICATION_REPORT.md`

**Steps:**

- [x] Generate used tables:

```powershell
$matches = rg "\.from\('([^']+)'" src_impl -g "*.ts" -g "*.tsx" -o
$used = $matches |
  ForEach-Object {
    if ($_ -match "\.from\('([^']+)'") { $Matches[1] }
  } |
  Sort-Object -Unique
$used | Set-Content .\used_tables.txt
```

- [x] Generate committed schema tables:

```powershell
$schema = rg "create table (if not exists )?public\.([A-Za-z0-9_]+)" SUPABASE_SCHEMA.sql -o |
  ForEach-Object {
    if ($_ -match "public\.([A-Za-z0-9_]+)") { $Matches[1] }
  } |
  Sort-Object -Unique
$schema | Set-Content .\schema_tables.txt
```

- [x] Compare:

```powershell
Compare-Object (Get-Content .\schema_tables.txt) (Get-Content .\used_tables.txt) |
  Where-Object SideIndicator -eq "=>"
```

- [x] Delete `used_tables.txt` and `schema_tables.txt` after recording the inventory in `VERIFICATION_REPORT.md`.

**Exit Gate:**

- [ ] Every used table is either in committed SQL or explicitly feature-flagged out of launch.
- [ ] No screen component has direct Supabase access. Any direct access found in screens/components is moved into the correct repository during the relevant phase.

### P1-02 - Create Migration Backlog From Actual Repository Contracts

**Files:**

- Read: repository files for each missing table.
- Modify: `supabase/migrations/YYYYMMDD_launch_schema_reconciliation.sql`
- Modify: `VERIFICATION_REPORT.md`

**Steps:**

- [ ] For each missing table, inspect the exact selected/inserted/updated columns from repository code.
- [ ] Create SQL for the table with:
  - primary key,
  - `user_id` foreign key where user-owned,
  - timestamps,
  - check constraints for enum-like fields,
  - indexes for query filters and ordering,
  - RLS enabled,
  - owner read/write policies,
  - no permissive public access.
- [ ] Prefer matching existing repository contracts over inventing new column names.
- [ ] If two repositories disagree on table names such as `sessions`, `user_sessions`, and `focus_sessions`, choose one canonical launch table and update repository code in that feature phase.

**Exit Gate:**

- [ ] Migration applies cleanly to a local or staging Supabase project.
- [ ] `npm run types:supabase` regenerates `src_impl/types/supabase.ts`.
- [ ] `npm run typecheck -- --pretty false` passes after type regeneration.

### P1-03 - RLS Abuse Test

**Files:**

- Modify if needed: SQL migration from P1-02.
- Modify: `VERIFICATION_REPORT.md`

**Steps:**

- [ ] Create two test users in staging.
- [ ] Insert representative rows for user A.
- [ ] Authenticate as user B.
- [ ] Verify user B cannot read, update, or delete user A rows for:
  - sessions,
  - focus score,
  - reward ledger,
  - wallet/economy,
  - companion memories,
  - streaks,
  - notifications,
  - purchases/entitlements.

**Exit Gate:**

- [ ] Cross-user read/write attempts fail.
- [ ] All failures are expected authorization failures, not missing-table or malformed-query errors.

---

## 8. Phase 2 - Integrity Sprint

**Goal:** Make the codebase safe to finish. This phase removes the engineering drag that would otherwise make every product fix risky.

### P2-01 - Establish Clean Baseline Commands

**Files:**

- Modify: `VERIFICATION_REPORT.md`

**Steps:**

- [x] Run:

```powershell
npm run typecheck -- --pretty false
npm run lint -- --quiet
npm run test -- --passWithNoTests
```

- [x] Record exact output.
- [x] If typecheck fails, fix typecheck before product features.
- [x] If lint has many existing findings, categorize them by rule and fix launch-risk categories first: unused exports that hide dead code, no-new-func, direct Supabase misuse, accessibility violations, banned APIs.

**Exit Gate:**

- [x] Typecheck is green before P1 product work starts.
- [x] Lint trend is documented and all touched files are lint-clean.

### P2-02 - Split Files Over 200 Lines Before Editing Them

**Files Known To Check First:**

- `src_impl/features/session-completion/hooks/useSessionCompleteController.ts`
- `src_impl/screens/session/SessionSetupScreen.tsx`
- `src_impl/screens/session/ActiveSessionScreen.tsx`
- `src_impl/features/session-completion/completion-orchestrator.ts`
- `src_impl/features/session-completion/offline-sync-service.ts`
- `src_impl/store/index.ts`
- `src_impl/performance/PerformanceGate.ts`

**Steps:**

- [x] Run:

```powershell
Get-ChildItem -Path src,src_impl -Recurse -Include *.ts,*.tsx |
  Where-Object { ($_.FullName -notmatch "\\__tests__\\") -and ((Get-Content $_.FullName | Measure-Object -Line).Lines -gt 200) } |
  ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    "$lines $($_.FullName)"
  }
```

- [x] Split only files that must be edited for launch phases.
- [x] Keep splits mechanical: extract hooks, presentational components, mappers, constants, and pure helpers.
- [x] Run typecheck after each split.

**Exit Gate:**

- [x] Every touched source file is 200 lines or fewer.
- [x] Generated files are explicitly excluded in `VERIFICATION_REPORT.md`.

### P2-03 - Banned Pattern Audit For Touched Files

**Steps:**

- [x] After every task, run this against edited files:

```powershell
rg "console\.|: any\b|<any>|@ts-ignore|@ts-nocheck|@ts-expect-error" <edited-files>
rg "StyleSheet\.create|FlatList[^A-Za-z]|AsyncStorage|fetch\(" <edited-files>
rg "#[0-9A-Fa-f]{3,8}|rgb\(" <edited-files>
```

- [x] For feature folders, also run:

```powershell
rg "supabase\.(from|rpc)\(" src_impl/features -g "*.ts" -g "*.tsx" -l
```

- [x] Move Supabase calls from non-repository files into repository files.

**Exit Gate:**

- [x] Banned scans return empty for touched files.
- [x] Any existing exception outside touched files is documented and scheduled before final gate.

---

## 9. Phase 3 - Core Loop Product Spine

**Goal:** Make Home, Focus Score, Session Setup, Session Complete, and Next Action feel like one product instead of separate systems.

### P3-01 - Focus Score Widget Opens Dashboard

**Files:**

- Read: `src_impl/navigation/types.ts`
- Read: `src_impl/features/focus-identity/`
- Modify: Home screen/widget files that render the Focus Score widget.
- Test: nearest Home or focus identity test folder.

**Steps:**

- [x] Confirm `FocusScoreDashboard` route exists in `RootStackParamList`.
- [x] Add a typed navigation callback to the Home Focus Score widget.
- [x] The tap target must be at least 44x44 using `src/utils/touchTarget.ts`.
- [x] Add `accessibilityLabel`, `accessibilityRole`, and `accessibilityHint`.
- [x] Dashboard loading, error, empty, offline, and success states must render.
- [x] Manual test: tap widget on Home, dashboard opens, back returns to Home.

**Exit Gate:**

- [x] User can reach Focus Score Dashboard from Home.
- [x] Navigation is typed and has no stringly route helper added.

### P3-02 - Next-Best-Action Post-Session Loop

**Files:**

- Read: `src_impl/features/session-recommendation/recommendation-engine.ts`
- Read: `src_impl/features/session-story/`
- Modify: session completion service/hook files.
- Modify: post-session story or session complete CTA component.
- Test: `src_impl/features/session-recommendation/__tests__/` or session completion tests.

**Steps:**

- [x] Generate one next-best-action after session completion using existing recommendation logic.
- [x] Store or pass recommendation through service output, not component state alone.
- [x] Show one primary CTA: "Start next focus" or VEX-equivalent copy.
- [x] CTA pre-fills Session Setup with recommended duration, mode, and difficulty where route params support it.
- [x] If prefill params are missing, add typed params in `src_impl/navigation/types.ts` first.
- [x] Add error fallback: if recommendation fails, session completion still renders and logs to Sentry.

**Exit Gate:**

- [x] Completing a session gives one clear next action.
- [x] Failed recommendation does not break completion.

### P3-03 - One-Action Home Rule

**Files:**

- Read: Home spine service and Home screen files.
- Modify: Home rendering components only if multiple competing primary CTAs are visible.

**Steps:**

- [x] Audit Home first viewport on a small iPhone.
- [x] Confirm only one primary action visually wins.
- [x] Secondary systems such as battle pass, boss, streak, companion, and shop cannot compete with the daily mission/session start action.
- [x] If needed, move secondary content below the fold or reduce visual weight using existing tokens.

**Exit Gate:**

- [x] First viewport communicates one best action in under three seconds.
- [x] No feature advertises a route that is feature-flagged off.

---

## 10. Phase 4 - Post-Session Reward Clarity

**Goal:** Session completion must feel like proof of growth, not a stack of unrelated reward cards.

### P4-01 - Reward Priority Model

**Files:**

- Create or modify: `src_impl/features/session-completion/reward-priority.ts`
- Test: `src_impl/features/session-completion/__tests__/reward-priority.test.ts`

**Required Priority Order:**

1. New personal best.
2. Focus Score band change or large score delta.
3. Streak saved, extended, or recovered.
4. Boss defeated or major boss damage.
5. Level up or large XP gain.
6. Companion growth or memory.
7. Challenge progress.
8. Coins/gems/standard rewards.

**Steps:**

- [x] Define a Zod-backed reward summary schema.
- [x] Write tests for at least:
  - personal best beats normal XP,
  - band change beats boss damage,
  - streak recovery beats small currency,
  - empty consequences produce a safe fallback,
  - multiple rewards produce one headline and grouped secondary rewards.
- [x] Implement pure priority selection in service/helper code.
- [x] Do not put ranking logic in JSX.

**Exit Gate:**

- [x] Tests pass.
- [x] Completion UI receives a ranked model instead of doing business logic inline.

### P4-02 - Completion UI Hierarchy

**Files:**

- Modify: session completion components.
- Split components first if over 200 lines.

**Steps:**

- [x] Render one headline reward card.
- [x] Render secondary rewards as compact supporting rows.
- [x] Use design tokens only.
- [x] Add skeleton state matching the final layout.
- [x] Add error state with retry.
- [x] Add offline state that explains sync delay.
- [x] Add reduced-motion handling before reward animation.
- [x] Haptics go through `src/utils/haptics.ts` only.

**Exit Gate:**

- [x] A completed session has one obvious emotional payoff.
- [x] Offline completion still feels complete and syncs later.

---

## 11. Phase 5 - Focus Contract Wire-Up

**Goal:** Users state intent before focus, see it during focus, and reflect after focus.

### P5-01 - Setup Contract Input

**Files:**

- Read: `src_impl/features/focus-contract/`
- Modify: `src_impl/screens/session/SessionSetupScreen.tsx` after splitting if needed.
- Modify or create: focused contract setup component under the feature.
- Test: focus contract service tests.

**Steps:**

- [x] Add a pre-session contract input to Session Setup.
- [x] Validation belongs in schema/service, not the component.
- [x] Empty contract is allowed only if existing product rules allow sessions without intent; if allowed, UI must not imply a contract exists.
- [x] On session start, create or attach the contract through hook -> service -> repository.
- [x] If contract creation fails, show user-facing error and let user retry or start without contract only if product rules allow it.

**Exit Gate:**

- [x] Contract can be entered before starting a session.
- [x] Contract is persisted with the session.

### P5-02 - Completion Reflection

**Files:**

- Modify: session completion service/hook/component files.
- Test: focus contract reflection tests.

**Steps:**

- [x] If a session has a contract, ask for reflection on completion.
- [x] Options must be explicit, for example: done, partially done, not done.
- [x] Persist reflection through focus contract service/repository.
- [x] Reflection write has optimistic UI and rollback/error handling.
- [x] Capture unexpected errors in Sentry.

**Exit Gate:**

- [x] User can close the loop on intent.
- [x] Reflection state is visible in completion and available to future scoring/recommendation logic.

---

## 12. Phase 6 - Personal Bests Wire-Up

**Goal:** Make personal bests a memorable proof moment when earned.

### P6-01 - Service Integration

**Files:**

- Read: `src_impl/features/personal-bests/service.ts`
- Read: `src_impl/features/personal-bests/repository.ts`
- Modify: session completion orchestration/service layer.
- Test: personal best service tests.

**Steps:**

- [x] On session completion, call existing personal best logic from service code.
- [x] Ensure idempotency: replaying completion cannot duplicate or downgrade a personal best.
- [x] Return a typed personal-best result to completion reward priority.
- [x] Capture unexpected errors in Sentry but do not block completion rendering.

**Exit Gate:**

- [x] A new best appears as the top reward.
- [x] Non-best sessions do not show fake celebration.

### P6-02 - Personal Best UI

**Files:**

- Create or modify: personal best card component under `src_impl/features/personal-bests/components/`.
- Modify: completion UI.

**Steps:**

- [x] Show old value, new value, mode, duration bucket, and achieved date.
- [x] Use tokens only.
- [x] Add accessibility labels and hints.
- [x] Add reduced-motion-aware celebration.

**Exit Gate:**

- [x] Personal best feels earned and specific.
- [x] No placeholder values appear for missing old records.

---

## 13. Phase 7 - Companion Memory Timeline

**Goal:** Let users see that VEX remembers their journey.

### P7-01 - Memory Write Audit

**Files:**

- Read: `src_impl/features/companion/memory-service.ts`
- Read: `src_impl/features/companion/memory-repository.ts`
- Read: `src_impl/features/companion/memory-schemas.ts`
- Read: `src_impl/features/session-completion/companion-memory-integration.ts`

**Steps:**

- [x] Confirm session completion writes meaningful companion memories.
- [x] Confirm memories have title, body, event type, created date, and user ID.
- [x] If writes are missing, add them in session completion service code.
- [x] If writes are present, do not rewrite the memory system.

**Exit Gate:**

- [x] Completing a representative session creates at least one useful memory record.

### P7-02 - Memory Timeline UI

**Files:**

- Create: `src_impl/features/companion/components/CompanionMemoryTimeline.tsx`
- Create if needed: `src_impl/features/companion/components/CompanionMemoryItem.tsx`
- Modify: companion screen/component entry point.

**Steps:**

- [x] Fetch memories through hook -> service -> repository.
- [x] Use FlashList with measured `estimatedItemSize`.
- [x] Group by Today, Yesterday, This Week, Earlier.
- [x] Include loading skeleton, error with retry, empty state, offline banner, and success state.
- [x] Add one CTA in empty state: start a focus session.
- [x] Keep each file 200 lines or fewer.

**Exit Gate:**

- [x] Companion screen has a reachable Memories section.
- [x] Memory timeline never blocks the core focus loop.

---

## 14. Phase 8 - Weekly Focus Card

**Goal:** Give users a shareable proof artifact without adding new dependencies.

### P8-01 - Weekly Summary Service

**Files:**

- Create: `src_impl/features/social/weekly-focus-card/schemas.ts`
- Create: `src_impl/features/social/weekly-focus-card/service.ts`
- Create: `src_impl/features/social/weekly-focus-card/repository.ts`
- Create: `src_impl/features/social/weekly-focus-card/hooks.ts`
- Test: `src_impl/features/social/weekly-focus-card/__tests__/service.test.ts`

**Steps:**

- [x] Repository queries only the required session, focus score, and streak data.
- [x] Service computes total minutes, sessions, score delta, current band, best session, streak days, and one insight.
- [x] Zod schema owns the output type.
- [x] Empty week returns an honest empty summary, not fake zeros dressed as progress.
- [x] Tests cover normal week, empty week, and missing focus score.

**Exit Gate:**

- [x] Weekly summary is deterministic and test-covered.

### P8-02 - Shareable Card Component

**Files:**

- Create: `src_impl/features/social/weekly-focus-card/components/WeeklyFocusCard.tsx`
- Create: `src_impl/features/social/weekly-focus-card/components/WeeklyFocusCardSection.tsx`
- Modify: progress screen entry point.

**Steps:**

- [x] Render a compact card with week range, minutes, sessions, score delta, band, best session, and insight.
- [x] Share via React Native `Share.share()` text summary.
- [x] Do not add image-sharing dependencies.
- [x] If `react-native-view-shot` already exists, image share can be considered; it is not in the current dependencies and must not be added for launch.
- [x] Use tokens only.
- [x] Add all UI states and accessibility.

**Exit Gate:**

- [x] User can share weekly progress from Progress.
- [x] Sharing failure shows a friendly error and captures unexpected errors.

---

## 15. Phase 9 - Production Hardening

**Goal:** Make the app reviewable, accessible, private, resilient, and honest.

### P9-01 - Error Boundary Audit

**Steps:**

- [ ] List all screen files:

```powershell
Get-ChildItem src_impl\screens -Recurse -Filter "*Screen.tsx" |
  Select-Object -ExpandProperty FullName
```

- [ ] List wrapped screens:

```powershell
rg "withScreenErrorBoundary" src_impl\screens -g "*.tsx" -l
```

- [ ] Wrap every missing screen with existing screen error boundary.
- [ ] Verify Sentry receives screen name and exception.

**Exit Gate:**

- [ ] No screen can crash to a blank page.

### P9-02 - Offline Audit

**Steps:**

- [ ] Every network-backed screen shows an offline banner or cached-data explanation.
- [ ] Session timer works offline.
- [ ] Offline completion queues and syncs later.
- [ ] Reconnection updates user-facing state without duplicate rewards.

**Exit Gate:**

- [ ] Airplane-mode session flow passes on a physical device.

### P9-03 - Accessibility Audit

**Steps:**

- [ ] Audit all `Pressable`, `TouchableOpacity`, and custom buttons in launch screens.
- [ ] Every interactive element has:
  - `accessibilityLabel`,
  - `accessibilityRole`,
  - `accessibilityHint` when outcome is not obvious,
  - 44x44 minimum touch target.
- [ ] Test VoiceOver on iOS physical device.
- [ ] Document any Android TalkBack test separately if Android is in launch scope.

**Exit Gate:**

- [ ] Core flows are navigable with VoiceOver.

### P9-04 - Privacy And Analytics Accuracy

**Files:**

- Read/modify: privacy inventory files.
- Modify: settings/privacy screen if inaccurate.
- Modify: `app.json` privacy manifest if needed.

**Steps:**

- [ ] Inventory collected data:
  - account identifier,
  - focus sessions,
  - streak/progress data,
  - purchases/entitlements,
  - analytics events,
  - crash reports,
  - push token,
  - user-generated study/content data if enabled.
- [ ] Verify App Store Connect privacy answers match actual data collection.
- [ ] Verify analytics opt-out disables PostHog events where promised.
- [ ] Verify account deletion removes or anonymizes all user-owned Supabase rows.
- [ ] Verify Sentry behavior matches privacy copy.

**Exit Gate:**

- [ ] Privacy copy, settings behavior, App Store privacy labels, and code behavior agree.

### P9-05 - RevenueCat Restore Purchases

**Steps:**

- [ ] Locate shared monetization layer.
- [ ] Verify "Restore Purchases" is reachable from Settings and paywall.
- [ ] Confirm restore calls shared monetization layer, not RevenueCat directly in UI.
- [ ] Success updates entitlement state.
- [ ] Failure shows user-facing error and support path.

**Exit Gate:**

- [ ] Reinstall + restore flow works in sandbox.

### P9-06 - Performance And Subscription Cleanup

**Steps:**

- [ ] Scan for realtime subscriptions:

```powershell
rg "\.subscribe\(" src_impl -g "*.ts" -g "*.tsx" -n
```

- [ ] Confirm every subscription has cleanup with `unsubscribe()`.
- [ ] Profile Active Session for 30 minutes.
- [ ] Confirm no unnecessary once-per-second full-screen re-render.
- [ ] Confirm reduced-motion users skip non-essential animation.

**Exit Gate:**

- [ ] Active Session is stable for a 30-minute physical-device test.

---

## 16. Phase 10 - Final Launch Gate

**Goal:** Re-verify the entire release candidate from scratch.

### P10-01 - Static Verification

- [ ] Run:

```powershell
npm run typecheck -- --pretty false
npm run lint -- --quiet
npm run test -- --passWithNoTests
npm run types:supabase
npm run typecheck -- --pretty false
```

- [ ] Run banned-pattern scan:

```powershell
rg "console\.|: any\b|<any>|@ts-ignore|@ts-nocheck|@ts-expect-error" src src_impl -g "*.ts" -g "*.tsx"
rg "StyleSheet\.create|FlatList[^A-Za-z]|AsyncStorage|fetch\(" src src_impl -g "*.ts" -g "*.tsx"
rg "#[0-9A-Fa-f]{3,8}|rgb\(" src src_impl -g "*.ts" -g "*.tsx"
```

- [ ] Run file-size scan:

```powershell
Get-ChildItem -Path src,src_impl -Recurse -Include *.ts,*.tsx |
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

**Exit Gate:**

- [ ] Zero type errors.
- [ ] Zero lint errors.
- [ ] Tests pass.
- [ ] No banned patterns in source.
- [ ] No non-generated source file over 200 lines.

### P10-02 - Physical Device E2E

Test on a physical iPhone.

**Flow 1: New User First Session**

- [ ] Fresh install.
- [ ] Onboarding completes in under two minutes.
- [ ] First 10-minute session starts.
- [ ] Session completes.
- [ ] Completion shows one headline proof card.
- [ ] Home reflects the completed session.

**Flow 2: Returning User Focus Contract**

- [ ] Open app.
- [ ] Home shows one best action.
- [ ] Go to Session Setup.
- [ ] Enter a contract.
- [ ] Start session.
- [ ] Contract reminder appears during session.
- [ ] Complete session.
- [ ] Reflection persists.

**Flow 3: Focus Score**

- [ ] Tap Home Focus Score widget.
- [ ] Dashboard opens.
- [ ] Score history and factors render.
- [ ] Empty/error states are manually forced or tested with seeded users.

**Flow 4: Offline Session**

- [ ] Enable airplane mode.
- [ ] Offline banner appears.
- [ ] Start and complete a session.
- [ ] Re-enable network.
- [ ] Session syncs once.
- [ ] Rewards are not duplicated.

**Flow 5: Paywall And Restore**

- [ ] Trigger premium gate.
- [ ] Paywall appears.
- [ ] Restore purchases works in sandbox.
- [ ] Failure path shows useful copy.

**Flow 6: Notifications And Deep Links**

- [ ] Open notification deep link to session setup.
- [ ] Open focus score deep link.
- [ ] Invalid deep link falls back safely.

### P10-03 - App Store Package

- [ ] App icon is 1024x1024 with no alpha.
- [ ] Screenshots exist for required device sizes.
- [ ] Subtitle, description, keywords, privacy policy URL, support URL, and marketing URL are final.
- [ ] App privacy labels are complete and accurate.
- [ ] Age rating is reviewed under Apple's updated rating system.
- [ ] Accessibility support information is filled in App Store Connect.
- [ ] In-app purchases/subscriptions are configured and review screenshots are attached.
- [ ] Export compliance/encryption answers are complete.
- [ ] Bundle ID matches App Store Connect.
- [ ] Version and build number are incremented.
- [ ] Release notes are final.

### P10-04 - Release Candidate Submission

- [ ] Run:

```powershell
eas build --platform ios --profile production
eas submit --platform ios --latest
```

- [ ] Wait for App Store Connect processing.
- [ ] Add build to TestFlight internal testing.
- [ ] Install TestFlight build on physical device.
- [ ] Re-run smoke flows from P10-02.
- [ ] Submit for App Review only after smoke flows pass.

---

## 17. Verification Report Template

Create or update `VERIFICATION_REPORT.md` after every phase:

```markdown
## Phase N - Name

**Status:** PASS | FAIL | PARTIAL
**Date:** YYYY-MM-DD
**Branch/Commit:** branch-name / short-sha

**Commands run:**

```powershell
command here
```

**Actual output summary:**

- TypeScript:
- Lint:
- Tests:
- Build:
- Manual QA:

**Files changed:**

- `path/to/file`

**Evidence:**

- Screenshots:
- Sentry issue links:
- Supabase query/RLS proof:
- App Store Connect/TestFlight proof:

**Deferrals or flags:**

- None, or exact feature flag and reason.
```

A phase is **PASS** only when every task has evidence. A phase is **PARTIAL** if anything is feature-flagged, deferred, or untested. A phase is **FAIL** if a gate blocks launch.

---

## 18. Launch Decision Rubric

### Ship

Ship only if:

- P0 toolchain/App Store upload proof is green.
- P0/P1/P2/P9/P10 phases are green.
- Core session loop passes physical-device QA.
- Privacy labels and app behavior agree.
- Restore purchases works.
- No visible broken or placeholder feature exists.
- Crash-free smoke testing is clean.

### Delay

Delay if:

- App Store Connect rejects the binary.
- Supabase schema/RLS is not proven.
- Typecheck is not green.
- Session start or completion is unreliable.
- Offline completion can duplicate rewards or lose sessions.
- Privacy or purchase behavior is inaccurate.
- The app feels impressive in demos but cannot survive real user edge cases.

### Cut P2 Features

Cut Personal Bests, Companion Timeline, or Weekly Focus Card if any are not fully green by **May 24, 2026**. Cutting means:

- Hide entry points.
- Disable feature flags.
- Remove copy that implies the feature exists.
- Record the cut in `VERIFICATION_REPORT.md`.
- Keep data model changes only if already migrated and harmless.

---

## 19. 11/10 Product Standard

VEX does not become 11/10 by adding more systems. It becomes 11/10 when every visible system tells the same truth:

- The user has one clear next action.
- Focus starts fast.
- Completion feels earned.
- Progress is remembered.
- Data is real.
- Failure states are handled.
- The app never pretends.

The launch version should feel smaller than the codebase, sharper than the feature list, and more trustworthy than a typical gamified productivity app.
