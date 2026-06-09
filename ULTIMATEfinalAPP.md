# ULTIMATE Final App Code Review And Release Plan

Prepared on 2026-06-09. User release context referenced 2026-05-30; this review uses the repository state and dependency ecosystem visible on 2026-06-09. Scope is code review only: security, correctness, architecture, maintainability, performance, reliability, CI, release readiness. Product choices, feature additions, and feature removals are intentionally out of scope.

## Executive Verdict

Do not release yet. The app is TypeScript-clean and Expo Doctor-clean, but the release gate is not clean: line-limit fails, debt-freeze fails, select-star fails, lint fails at large scale, Jest did not finish within the review timeout, remote EAS secrets were not verified, CI RLS verification could not run locally without required secrets, and there are concrete runtime bug candidates in realtime cleanup/subscription ownership. Treat this document as an overnight Hermes execution plan: fix the blockers, re-run every gate, record evidence, then run the release phase at the end.

## Skills And External Context Used

Local skills loaded: `thermo-nuclear-code-quality-review` for strict structural review, `code-review` for severity-based release gating, local `bug-hunter` instructions for adversarial Recon/Hunter/Skeptic/Referee framing, and Serena project memory for VEX architecture rules. GitHub CLI was not installed, so `gh search` could not run. GitHub REST repository search did run through `rtk curl` and found current public bug-hunter style repos including `codexstar69/bug-hunter` (updated 2026-06-08, 408 stars in API result), `Oleks1y/bug-hunt-codex`, `shanemhamilton/bugsweep`, and adjacent edge-case hunter repos. GitHub code search API required authentication, so exact remote `SKILL.md` code search could not be completed. Use this repo's installed local skills as the authoritative workflow unless the release machine has authenticated GitHub search.

External release standards to apply: GitHub code security docs for code scanning, secret scanning, dependency review; OWASP MASVS for mobile security verification; Supabase RLS docs for row-level authorization; Expo SDK 56 docs and `expo-doctor` for Expo compatibility; Sentry React Native/Expo docs for source maps and release health; RevenueCat React Native docs for StoreKit/Play Billing purchase hardening. Re-check docs on the actual release date because this stack is current and can shift.

## Evidence Snapshot

Commands were run through `rtk` as required. `rtk tsc --noEmit --pretty false` passed with no TypeScript errors. `rtk proxy npx expo-doctor` passed 21/21 checks. `rtk proxy npx expo install --check` reported dependencies up to date, excluding `@sentry/react-native` and `@shopify/react-native-skia` per package config. `rtk npm run check:banned-patterns` passed. `rtk npm run check:no-ts-nocheck` reported `@ts-nocheck count: 0/56`.

Blocking command evidence: `rtk npm run check:line-limit` failed with 29 files over 200 lines. `rtk npm run audit:debt-freeze` failed with 28 new violations. `rtk npm run check:select-star` failed with 2 `select('*')` violations in `src/features/analytics/repository/dashboard.ts`. ESLint via local binary reported 1306 problems: 780 errors and 526 warnings. `rtk npm test -- --runInBand` timed out after 244 seconds, so test suite release confidence is unknown. `rtk npm audit --production` reported 12 moderate vulnerabilities through `uuid <11.1.1` in the Expo/xcode dependency chain. `rtk npm run ci:check-rls` failed locally because `SUPABASE_SERVICE_ROLE_KEY` and `EXPO_PUBLIC_SUPABASE_URL` were missing. `rtk npm run check:eas-production-secrets:remote` failed because EAS secret listing could not run in the current login/tool state.

Dirty worktree warning: the worktree is already dirty. This review did not attempt to clean user changes. Running `npm run perf:audit` modified `docs/performance-metrics.json`; that file was not dirty before this review command. Decide whether to keep it as audit evidence or restore it before commit. Current dirty files include auth/onboarding visual changes, new mascot assets, new `src/features/auth/apple-oauth.ts`, new onboarding copy/mascot components, `.agents/`, `.omx/`, `skills-lock.json`, and generated/asset files.

## P0 Release Blockers

P0-1: CI will fail line-limit. Confirmed files over 200 lines include `src/components/glass/LiquidGlassObject.tsx` 400-458 lines depending counter, `src/screens/home/components/HomeReferenceSections.tsx` 348-354, `src/components/glass/FocusModeOrb.tsx` 325-358, `src/screens/home/components/VexFocusSurface.tsx` 294-311, `src/components/glass/GlassSurface.tsx` 285-299, `src/components/glass/LiquidGlassSphere.tsx` 284-314, `src/components/glass/GlassScreen.tsx` 261-271, `src/components/primitives/Card.tsx` 246-258, `src/components/glass/GlassCard.tsx` 244-260, plus many 201-236 line files. Fix: split by domain, not `.part-N.ts`; extract pure geometry/token helpers from glass components, break home surfaces into header/body/action subcomponents, split hooks by query/mutation groups, then re-run `rtk npm run check:line-limit` and `rtk npm run audit:debt-freeze`.

P0-2: ESLint is release-blocking. 780 errors means the codebase is not ready for a clean CI release. Fix unused imports/vars, explicit `any`, disabled suites warnings where rules require, unstable nested components, and generated Supabase lint exclusion strategy. Do not silence by weakening ESLint globally. Start with production files, then tests. Re-run `rtk proxy .\node_modules\.bin\eslint.cmd src --ext .ts,.tsx` until zero errors.

P0-3: `select('*')` exists in `src/features/analytics/repository/dashboard.ts`. This violates the repo's explicit select-star gate. Fix `fetchDashboardLayouts`, `fetchDefaultDashboard`, and `createDashboardLayout` to select explicit `dashboard_layouts` columns and explicit nested `dashboard_widgets` columns using `tableColumns` or a local typed column list. Then re-run `rtk npm run check:select-star`.

P0-4: Tests are not release-proven. Jest timed out at 244 seconds and 80 skipped/xdescribe matches exist across critical areas: AI coach, content study, focus identity, notifications, onboarding repository, session completion, navigation root, paywall, production exit gates, performance gates, anti-cheat, monetization verification, E2E. Disabled features are allowed only if explicitly fenced, but disabled tests for live routes or release-critical infrastructure are not acceptable. Fix timeout root cause, classify disabled suites as `disabled-feature-doc-only` or restore them, and run `rtk npm test -- --runInBand --passWithNoTests=false --no-coverage`.

P0-5: RLS is not verified in this environment. Non-CI script only prints manual SQL; CI mode failed without secrets. Before release, run `rtk npm run ci:check-rls` with `SUPABASE_SERVICE_ROLE_KEY` and `EXPO_PUBLIC_SUPABASE_URL` on a release-safe machine. Every public table must have RLS enabled and policies validated against anonymous, authenticated owner, and authenticated non-owner roles. Missing RLS is a critical security blocker.

P0-6: EAS production secrets were not remotely verified. Local config passed, but `check:eas-production-secrets:remote` failed because EAS secret listing could not run. On a logged-in release machine, run `rtk npm run check:eas-production-secrets:remote`; verify Supabase URL/anon key, Sentry DSN/auth token if used for source maps, RevenueCat iOS/Android keys, PostHog key/host, Apple/Google submit secrets, and Expo token.

P0-7: Realtime presence cleanup likely leaks. In `src/services/realtime.ts`, `initializePresence(userId)` stores `activeChannels.set(\`presence:${userId}\`, channel)`, but `cleanupPresence()` looks up `activeChannels.get('presence')`. That misses the stored key and leaves presence channels alive until `cleanupRealtime()`. Fix by using the current user id key in cleanup, or keep a dedicated current presence channel key constant. Add a unit test that initializes presence, calls cleanup, and asserts active channel count returns to 0.

P0-8: Async realtime subscription hooks can leak on rapid unmount. `src/hooks/useRealtime.ts` has several effects that call async subscribe functions and assign `unsub` in `.then((u) => { unsub = u; })`; if the component unmounts before the promise resolves, cleanup runs with `unsub === null`, then the late subscription remains active. `useSquadPresence` handles this correctly with `cancelled`; replicate that guard in `useActivityBroadcast`, `useFeedUpdates`, `useSquadChanges`, and `useGuildQuests`.

P0-9: Notification realtime singleton has subscriber ownership bugs. In `src/features/notifications/repository/notifications.ts`, `subscribeToNotificationCenter` returns a no-op cleanup for duplicate user subscriptions. If screen A subscribes and screen B gets no-op, screen A unmount can remove the channel while B still expects updates. Fix with reference counting and a callback set per user, or centralize the subscription in one hook/store owner. Add tests for two subscribers, first unmount, second still receives updates, final unmount unsubscribes.

P0-10: The app contains many shipped stubs/placeholders. Confirmed examples include `src/features/ai-coach/intervention/PredictiveInterventionEngine.ts` disabled no-op stub, `src/features/boss/components/boss-battle-hud.tsx` stub, `src/features/rewards/index.ts` rewards stub, many home controller stubs in `src/screens/home/hooks/home-controller-stubs.ts`, archived boss/session integration stubs, and "coming soon" metadata. Disabled features are acknowledged by the user, but release requires a disabled-feature manifest that proves no live route, CTA, notification, purchase entitlement, or analytics funnel depends on an unimplemented stub.

## P1 Security And Privacy Findings

S1: `EXPO_PUBLIC_*` variables are embedded in the client by design. Current code uses public Supabase anon key, PostHog key, RevenueCat keys, and Sentry DSN. That is normal only if all backend authorization is enforced by RLS, Edge Function auth, and provider-side restrictions. Do not put service role keys, PostHog personal keys, Sentry auth tokens, RevenueCat secret keys, Apple private keys, or Google service JSON in `EXPO_PUBLIC_*`.

S2: Supabase queries are mostly in repository files, which is good, but RLS plus explicit select columns remain mandatory. The analytics dashboard select-star issue is a concrete leak/scope risk because nested `widgets:dashboard_widgets(*)` can silently expose new columns if schema changes. Use explicit columns and schema parse boundaries for every table.

S3: Certificate pinning is configured for `supabase.co` with pins verified on 2026-06-05. Release task: verify actual production Supabase host and cert chain again on release day and document fail-open/fail-closed behavior. Certificate pinning can break production during provider rotation; it must have an operational rotation plan, monitoring, and emergency OTA/native release path.

S4: `src/config/sentry.ts` enables mobile replay with `replaysSessionSampleRate: 0.1` and `replaysOnErrorSampleRate: 1.0`. Because the app handles email, user content, purchase history, and productivity data, verify Sentry replay masking for React Native before release. If masking is not proven, set session replay sample to 0 for launch and keep error events/source maps.

S5: `app.json` privacy manifest exists, but it must be reconciled with actual SDKs and app behavior: Supabase Auth/Storage, Sentry crash/replay, PostHog product analytics, RevenueCat purchases, notifications, document picker/content study, MMKV, SecureStore, and any AI/edge function content. Run the privacy inventory tests and manually compare against App Store Connect privacy answers.

S6: App config has duplicate `expo-splash-screen` plugin entries: one bare string and one configured entry. Remove the duplicate and keep a single configured plugin. Duplicate config may be benign, but release configs should be deterministic and reviewable.

S7: `src/utils/debug.ts` uses console methods inside the debug abstraction. The custom banned-pattern script allows this, but release policy says no `console.log` and use logger/Sentry. Decide whether this debug wrapper is the canonical logger exception. If yes, document it and ensure production log level prevents noisy client logs. If no, replace console calls with a native-safe logging bridge.

S8: Apple OAuth handling in `src/features/auth/apple-oauth.ts` should check provider cancellation by `error.code` as well as message. Expo Apple auth cancellation often appears as a coded native error, not only `message === 'ERR_REQUEST_CANCELED'`. Fix with a typed guard over `{ code?: unknown; message?: unknown }` and add tests. Keep nonce generation and SHA-256 challenge tests.

S9: RevenueCat direct SDK access appears limited to `src/shared/monetization/`, which matches policy. Before release, run purchase sandbox tests for initialize, anonymous to identified login, purchase, restore, logout/login, refund/expiration webhook sync, and entitlement cache refresh. Confirm placeholder key blocking works in production env.

S10: GitHub Actions security posture is partial. Workflows use read-only contents permissions, good. Add dependency review/secret scanning/code scanning gates if GitHub Advanced Security or public repo features are available. Do not rely only on `npm audit`; include reachability review for vulnerable transitive packages.

## P1 Architecture And Maintainability Findings

A1: Feature layout does not match the mandatory contract. Missing files found: `analytics` missing repository/hooks, `auth` missing events/analytics, `boss` missing hooks, `challenges` missing schemas/hooks, `companion` missing hooks, `mastery` missing hooks, `memory-candidate` missing events/analytics, `mode-native` missing types/repository/events/analytics, `mode-retention` missing repository/events/analytics, `notifications` missing hooks, `progression` missing hooks, `session-completion` missing analytics, `settings` missing hooks, `vex-actions` missing hooks, `weekly-intelligence` missing events/analytics. Some dirs may use subfolders or disabled status; create an architecture exemption manifest or normalize layouts.

A2: Route navigation policy is broadly violated by string literals. `navigation.navigate(` appears in 111 matches across 58 files. Many are direct string route names in screens/components. Fix by centralizing typed route helpers and exporting route constants or typed action functions. Do not scatter raw strings through UI components.

A3: Query hook contract is inconsistent. Repo rule says every query hook must expose `data`, `isPending`, `isError`, `error`, `refetch`. Examples show `isLoading` usage and raw `useQuery` returns. Audit hooks and standardize wrappers. This is a release reliability issue because UI states depend on a stable contract.

A4: The new ethereal visual token file is a parallel token namespace with raw hex/rgba values. Token files can hold raw values, but components such as `LaneConfirmationStep`, `OnboardingWelcome`, `MascotGuide`, and `LoginScreen` still hardcode numeric spacing, font sizes, border radii, and rgba values. Move all visual constants to established token files or derive them from `theme.spacing`, `theme.radius`, `theme.typography`, and central color tokens.

A5: Several files mix presentation and local business decisions. `OnboardingFlowScreen` chooses step render branches and validation-driven navigation; that may be acceptable for screen composition, but any lane acceptance, onboarding persistence, or completion decisions must stay in hooks/service/store actions. Keep components render-only and push decisions into `useOnboardingFlow` or service/store functions.

A6: `src/features/onboarding/store.ts` uses many inline `import('./schemas').Type` references in the public action interface. That keeps the file under local imports but makes the type surface noisy. Prefer importing the actual inferred types at top level if line count permits, or split action types by domain (`store-action-types.ts` already exists). Avoid increasing store file complexity.

A7: The 200-line rule has created pressure to split, but some splits look mechanical instead of domain-based. Continue decomposing by ownership: glass geometry, glass interaction, glass accessibility, home data adapters, home section renderers, query families, and state-machine steps. Do not create `.part-N.ts` files.

A8: `src/types/supabase.ts` is 5646 lines. This generated file should be explicitly exempt from line-limit/lint style rules and never hand-edited. CI should verify freshness, not style format. If the line-limit script already exempts it, keep that; if not, update the script to mark generated source exemptions by path and generation comment.

## P1 Correctness And Runtime Reliability

R1: `src/features/analytics/repository/dashboard.ts` uses `Date.now()` for `updated_at`. If Supabase column is timestamp/timestamptz, this should be ISO string or database default. Verify schema. Fix with `new Date().toISOString()` or DB-side `now()` RPC depending column type.

R2: `src/features/notifications/repository/notifications.ts` maps `created_at` with `Number(row.created_at || row.timestamp || Date.now())`. ISO timestamps become `NaN`. If `NotificationCenterItemSchema.timestamp` expects a number, parse ISO via `Date.parse`; if it expects string, change schema. This can break ordering/cursor behavior.

R3: `fetchNotificationCenterItems` cursor compares `.lt('created_at', cursor)` but `nextCursor` is `items[last].timestamp.toString()`. If timestamp is numeric ms string while DB column is ISO timestamp, pagination is wrong. Return/store ISO cursor from the row, not mapped display timestamp.

R4: `cleanupPresence` bug plus async subscription race can cause duplicate channels, stale presence, battery/network drain, and repeated callbacks. Fix before E2E.

R5: Disabled/archived integrations must be fenced at runtime. If boss, rewards, AI coach, content study, or monetization surfaces are disabled, route guards and feature flags must prevent live user entry into stub paths. Add tests that all disabled feature entry points are hidden or route to explicit disabled states.

R6: OAuth refactor moved Apple native code into `apple-oauth.ts`. Good extraction, but add tests for missing native module, unavailable device, cancel, missing identity token, repository error, successful parse, and secure nonce/hash. Keep async return types explicit.

R7: `app.json` uses `runtimeVersion.policy = appVersion` and `updates.enabled = true`. Before release, confirm OTA update policy for native changes like Apple auth, certificate pinning, RevenueCat, Sentry, and splash screen. Native-dependent fixes require binary release, not OTA.

## P1 Performance Findings

P1-perf: `rtk npm run perf:audit` found 462 files with issues and 1992 warnings. The script flags many inline JSX objects, inline animated style objects, and image performance warnings. Some recommendations mention `react-native-fast-image`, but adding that library violates the no-new-library rule and is not appropriate for Expo SDK 56 unless explicitly approved. Use existing `expo-image`, memoized style helpers, `useMemo`, `useAnimatedStyle`, and component extraction.

P2-perf: Glass and ethereal components are visually heavy and line-limit offenders. Prioritize `LiquidGlassObject`, `FocusModeOrb`, `LiquidGlassSphere`, `GlassSurface`, `GlassScreen`, `GlassCard`, and `LiquidButton`. Extract static SVG/path data, memoize repeated arrays/objects, and verify 60fps on low-end Android and iPhone simulator with reduced-motion enabled.

P3-perf: `MascotGuide` animates with Reanimated and respects reduced motion, good. Ensure every new ethereal animation follows that pattern and never uses `Animated` from `react-native`.

P4-perf: Many UI components define inline style objects. Tokens do not remove render churn by themselves. For frequently re-rendering surfaces, move static style builders outside render or memoize by theme key. Keep dynamic pressed styles inline only when necessary.

## P1 UI, Accessibility, And State Completeness

U1: Interactive elements in inspected new files generally include accessibility labels/roles/hints and min touch target helpers, which is good. Continue auditing all new auth/onboarding buttons, including nested text links and icon-only controls.

U2: Hardcoded dimensions and colors are common in new visual files. Move font sizes, gaps, radii, shadow values, and rgba colors to tokens. A token file with raw values is acceptable only if the component consumes named semantic tokens and does not invent local magic numbers.

U3: Data-driven UI state contract must be audited. Every data-driven component needs loading skeleton, error with retry using the shared ErrorState, empty state with one CTA, success, offline banner, and optimistic writes for meaningful mutations. The current review did not prove every screen meets that standard; Hermes must run a screen-by-screen UI state audit before release.

U4: Form screens must use KeyboardAvoidingView + ScrollView. `LoginScreen` uses `AppScreen keyboardAvoiding` but `scroll={false}`; verify on small screens, keyboard open, long localized copy, and accessibility text scaling. Auth/register/reset/onboarding screens must not clip.

U5: `app.json` sets `userInterfaceStyle` to `light`. If dark mode is a declared requirement, this is a blocker; if launch intentionally supports only light mode, document that exception in release notes and App Store answers. Do not leave a hidden dark-mode requirement unresolved.

## P1 CI And Release Automation

C1: There are two CI workflows (`ci.yml`, `vex-ci.yml`) with overlapping jobs. Consolidate or make both intentional. Current `vex-ci.yml` is stronger because it includes select-star and debt-freeze. Ensure required branch protections use the stronger workflow and cannot be bypassed by the weaker one.

C2: E2E workflow exits 0 if no finished simulator build is found. For release gating, that is not acceptable. Change release E2E so missing build fails the job, or run EAS build in workflow before Detox. Keep manual workflow permissive only if it is not a release gate.

C3: CI Node version is 20, local Node is 24.14.1. Expo Doctor passed locally, but release should use CI-like Node 20 or explicitly update engines/CI. Avoid shipping a lockfile generated under a different major Node/npm behavior without CI validation.

C4: Add a release evidence file after fixes: command, date, machine, branch, commit, pass/fail, artifact links. Required commands: typecheck, lint, line-limit, debt-freeze, banned-patterns, select-star, no-ts-nocheck, tests, expo-doctor, expo install check, npm audit, RLS CI, EAS remote secrets, iOS build, Android build, E2E smoke.

## P2 AI Slop And Structural Cleanup

AS1: Terms like stub, placeholder, xdescribe, disabled, archived, no-op appear across shipped source. Do not blindly delete; classify. For each occurrence: live code blocker, disabled-feature documented, test-only acceptable, or wording-only false positive. Create `docs/release-disabled-feature-manifest.md` with owner, route exposure, flag, tests, and release decision.

AS2: Avoid fake completeness. Home controller stubs returning pending query objects can make UI look wired while data is absent. If a disabled advanced system is intentionally hidden, its stub must be behind a feature flag and cannot feed visible success UI.

AS3: Keep service/repository boundaries strict. Some directories use subfolder repositories and hooks. That can be fine, but the folder must still expose canonical `repository.ts`/`hooks.ts` or documented barrels matching the contract.

AS4: Remove stale comments like "Tests xdescribed - source removed" from release-critical tests by either restoring the test or deleting it with a manifest entry. A release test suite full of disabled tests is not evidence.

AS5: Do not add broad suppressions. No `eslint-disable` except narrow generated-file or one-line rule with rationale. No `as any`. No `@ts-ignore`. No hiding CI failures by excluding source.

## Exact Overnight Hermes Fix Order

1. Freeze scope: do not add features. Commit or stash user-approved unrelated work before massive cleanup. Preserve dirty user changes. Record current `rtk git status --short`.

2. Fix concrete runtime bugs first: realtime presence cleanup key, async subscription cancellation guards, notification subscription reference counting, notification timestamp/cursor parsing, Apple cancellation guard. Add focused tests for each.

3. Clear release gates: select-star, line-limit, debt-freeze, ESLint. Do not proceed to UI polish until these are green.

4. Classify disabled/stubbed code. Produce a disabled-feature manifest and tests proving disabled areas cannot be entered accidentally. If a stub is reachable from a live screen, either wire it fully or hard-disable the entry point with a real disabled state.

5. Normalize architecture: feature layout manifest/exemptions, query hook return shape, typed navigation helper migration for high-traffic routes, repository/service boundaries.

6. Security verification: RLS CI with service role, npm audit reachability, EAS remote secrets, privacy manifest inventory, Sentry replay masking/source maps, RevenueCat sandbox, Supabase auth/storage policies, certificate pin rotation plan.

7. Performance verification: repair highest-risk glass/ethereal render churn, run perf audit, run manual low-end device smoke, verify reduced motion, verify no blank/laggy hero/auth/onboarding screens.

8. Full validation: run all commands listed in Release Phase, capture outputs, update verification report, then cut release branch/tag.

## Release Phase - Final Gate Before Submission

Release Blockers must all be zero: TypeScript errors, ESLint errors, line-limit violations, debt-freeze violations, select-star violations, banned-pattern violations, `@ts-nocheck`, reachable live stubs, unclassified disabled tests, failed RLS verification, unverified EAS secrets, unverified RevenueCat sandbox purchases, unverified Sentry source maps, unverified privacy manifest, unresolved npm audit reachable vulnerabilities, failed E2E smoke, and dirty unreviewed generated artifacts.

Run these commands on the release machine, in order, through `rtk`: `rtk git status --short`; `rtk proxy node --version`; `rtk proxy npm --version`; `rtk npm ci`; `rtk tsc --noEmit --pretty false`; `rtk proxy .\node_modules\.bin\eslint.cmd src --ext .ts,.tsx`; `rtk npm run check:line-limit`; `rtk npm run check:banned-patterns`; `rtk npm run check:no-ts-nocheck`; `rtk npm run check:select-star`; `rtk npm run check:debt-freeze`; `rtk npm test -- --runInBand --passWithNoTests=false --no-coverage`; `rtk proxy npx expo-doctor`; `rtk proxy npx expo install --check`; `rtk npm audit --production`; `rtk npm run ci:check-rls`; `rtk npm run check:eas-production-secrets:remote`; `rtk proxy npx eas-cli build --platform ios --profile production --non-interactive`; `rtk proxy npx eas-cli build --platform android --profile production --non-interactive`.

Manual release QA must include: fresh install signed-out, email signup/signin/signout, Apple sign-in cancel/success, onboarding completion, first session start/finish, session recovery after app restart, notification permission denied/granted, offline app open and degraded states, RevenueCat purchase/restore on sandbox, Sentry test error with source map symbolication, Supabase RLS owner/non-owner checks, privacy policy/support/terms URLs, reduced motion, large text, small screen keyboard, Android notification channel, iOS Apple Sign In entitlement, OTA update behavior, and app cold-start time.

Final release rule: only submit when every automated command is green, every manual QA item has dated evidence, the disabled-feature manifest is complete, all P0/P1 items above are fixed or explicitly accepted by the human owner, and the final worktree contains only intentional release changes. If any blocker remains, do not submit; cut another fix pass.
