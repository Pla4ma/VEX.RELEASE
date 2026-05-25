# VEX Full-App Problem Audit

Generated: 2026-05-25
Workspace: `C:\Users\jonat\CascadeProjects\vex-app-old`

This file is intentionally only problems, blockers, red flags, and fix instructions. It is ordered by release risk, not by ease of repair.

## Verification Snapshot

Commands run through `rtk`:

- `node C:/Users/jonat/.codex/skills/bug-hunter/scripts/triage.cjs scan . --output .bug-hunter/triage.json`
  - Result: 2,936 total files, 2,883 scannable files, strategy `large-codebase`, estimated 361,128 source lines, `fileBudget` 60.
- `npm run typecheck`
  - Latest result: pass.
- `npm run test -- --runInBand --silent`
  - Latest result: pass, 271 suites / 2,717 tests.
- `npm run check:line-limit`
  - Result: fail. Latest run shows 108 files in `src` exceed 200 lines.
- `.bug-hunter/audit-static.ps1`
  - Result: 2,978 source-like files scanned, 367 files over 200 lines, 62 active non-test files over 200 lines, 48 feature folders missing mandatory files, 28 files with Supabase calls outside exact `repository.ts` / config / generated-type locations, 6 query/mutation call sites outside allowed hook layers, 92 string-literal navigation calls.
- `npm run check:banned-patterns`
  - Result: pass. The repo's script finds no configured banned-pattern violations.
- `npx eslint src --ext .ts,.tsx --format json`
  - Result: 0 errors, 18,340 warnings across 838 files. Top warning categories: `quotes` 15,074, `comma-dangle` 1,043, unused vars 755, `curly` 741, `react-hooks/rules-of-hooks` 57, `react-hooks/exhaustive-deps` 16.
- `npx expo-doctor`
  - Result: 21/21 checks passed.
- `npm audit --omit=dev --json`
  - Result: 11 moderate production advisories, mainly Expo transitive advisories plus `uuid` through `xcode`.

## P0 Stop-Ship Blockers

### 1. The app violates its own 200-line hard limit at release scale

Evidence:

- `npm run check:line-limit` fails with 108 `src` files over 200 lines.
- Static audit found 367 source-like files over 200 lines total and 62 active non-test files over 200 lines.
- Highest active offenders:
  - `src/types/supabase.ts`: 5,568 lines. This is generated and should be explicitly exempted by policy if it is allowed.
  - `supabase/functions/content-study/index.ts`: 882 lines.
  - `jobs/squad-wars/weekly-reset.ts`: 516 lines.
  - `supabase/functions/ai/index.ts`: 500 lines.
  - `src/session/components/ComboMeter.tsx`: 491 lines.
  - `src/session/presets/index.ts`: 442 lines.
  - `src/session/utils/StateMachine.ts`: 435 lines.
  - `src/session/antiCheat/AntiCheatEngine.ts`: 419 lines.
  - `src/session/components/SessionSummary.tsx`: 417 lines.
  - `src/session/engines/CompletionEngine.ts`: 414 lines.
  - `src/features/ai-coach/service/coach-state-machine.ts`: 372+ lines.
  - `src/navigation/navigation-helpers.ts`: 302+ lines.

Why this is critical:

- The project rule says if any file exceeds 200 lines, work must stop and the file must be split. The repo cannot be called release-ready while its own release gate fails.
- Many oversized files are core runtime files: session engine, session lifecycle, active session UI, navigation, Supabase edge functions. These are exactly the files where bugs are hardest to audit.
- The pattern is not isolated. It is systemic file sprawl across core product, backend jobs, feature services, tests, and UI.

How to fix:

1. Decide the generated-file exemption policy. `src/types/supabase.ts` is generated, so either exempt exactly that file in `scripts/check-line-limit.js` or split generated DB types at generation time. Do not manually edit `supabase.ts`.
2. Split runtime files before adding features. Start with files over 350 lines in active app code:
   - `src/session/hooks/useSession.ts` -> split timer state, lifecycle mutations, recovery, computed selectors, and query wrappers.
   - `src/session/services/SessionLifecycleService.ts` -> split repository orchestration, recovery policy, and lifecycle transitions.
   - `src/session/components/ComboMeter.tsx`, `ActiveSessionHUD.tsx`, `SessionSummary.tsx` -> split presentational subcomponents and view-model builders.
   - `src/navigation/navigation-helpers.ts` -> split root/auth/main/session/settings helpers and deep-link validation.
   - Edge functions -> split schemas, auth/rate-limit, extractors, generation, persistence, and routing.
3. For tests, split by behavior domain rather than arbitrary `part-N` files. Keep one assertion theme per test file.
4. Add a CI gate that runs `npm run check:line-limit` and fails release builds.

### 2. The first-7-days product contract is not enforced by the feature gate

Evidence:

- User requirement: the app must prove the first 7 days before advanced systems become active.
- Current gate uses only `totalCompletedSessions`, not account age or first-week day count.
- `src/features/liveops-config/feature-access-config.ts`:
  - `challenges` threshold is 5.
  - `boss_tab` threshold is 7.
  - `ai_coach_advanced` threshold is 8.
  - `content_study` threshold is 12.
- `src/features/liveops-config/feature-motivation-config.ts` lowers some thresholds:
  - `challenges` accelerated by 2 -> unlocks at 3 sessions for game-like/intense/competitive users.
  - `boss_tab` accelerated by 2 -> unlocks at 5 sessions for game-like/intense/competitive users.
  - `content_study` accelerated by 7 -> unlocks at 5 sessions for student/creator users.
  - `ai_coach_advanced` accelerated by 2 -> unlocks at 6 sessions.

Why this is critical:

- A motivated user can complete several sessions on Day 0 or Day 1 and unlock advanced systems before the app has proven retention or value.
- The app has many tests around first-week experience, but the actual feature gate has no `daysSinceOnboarding`, `firstSeenAt`, `trialStartedAt`, or "minimum calendar age" input.
- This weakens onboarding, retention learning, and monetization timing. It also creates inconsistent product behavior: copy says "after session 7" or "after value", while accelerated profiles can bypass that.

How to fix:

1. Add a canonical first-week proof model in `src/features/liveops-config/schemas.ts`, for example:
   - `completedSessions`
   - `daysSinceOnboarding`
   - `firstSessionCompletedAt`
   - `hasCompletedFirstSession`
   - `hasCompletedSevenDayProof`
2. Change `FeatureAccessInputs` to include first-week proof data, not just sessions.
3. In `computeFeatureAccess`, hard block advanced features until both conditions are met:
   - user has completed the required minimum sessions for that feature
   - user is past the first-week proof boundary
4. Define an explicit `ADVANCED_FEATURES` set. Do not infer "advanced" from thresholds or route names.
5. Keep core features always available: focus session, home tab, focus tab, profile tab, basic coach, progress view.
6. Add tests that prove high-volume Day 0 users cannot unlock advanced systems early.

### 3. The mandatory feature folder architecture is widely violated

Evidence:

- Static audit found 48 feature folders missing required architecture files.
- Examples:
  - `achievements`: missing `schemas.ts`, `events.ts`, `analytics.ts`.
  - `analytics`: missing `hooks.ts`, `analytics.ts`.
  - `companion`: missing `repository.ts`, `hooks.ts`.
  - `focus-identity`: missing `service.ts`.
  - `home-experience`: missing `repository.ts`, `events.ts`, `analytics.ts`.
  - `items`: missing `types.ts`, `repository.ts`, `hooks.ts`, `events.ts`.
  - `liveops-config`: missing the entire required top-level feature shape.
  - `session`: missing `repository.ts`, `hooks.ts`, `events.ts`, `analytics.ts`.
  - `shop`: missing `schemas.ts`, `repository.ts`, `service.ts`, `hooks.ts`.

Why this is critical:

- The app claims a canonical data flow: Component -> Hook -> Service -> Repository -> Supabase.
- Current code has feature-specific alternatives like `repository/`, `repository-focus-score.ts`, `repository-insurance.ts`, `hooks-focus-score.ts`, `repository/enhanced.ts`, `repository/unified.ts`, and direct screen/container queries.
- This makes it impossible for an AI IDE or human reviewer to know the correct owner for data, business logic, events, and analytics.

How to fix:

1. For each active feature, create the exact required files even if some are thin facades.
2. Use the exact canonical names:
   - `types.ts`
   - `schemas.ts`
   - `repository.ts`
   - `service.ts`
   - `hooks.ts`
   - `events.ts`
   - `analytics.ts`
3. Move alternate repository files behind a single `repository.ts` export. If the feature needs multiple repository modules, hide them under an internal folder and expose the public repository API from `repository.ts`.
4. Stop putting feature implementation in screen folders. Screens should render and delegate.
5. Add a script that enforces feature folder structure and fails CI.

### 4. Supabase access is not confined to canonical repositories

Evidence:

- Static audit found 28 files with Supabase calls outside allowed exact paths.
- Active examples:
  - `src/features/ai-coach/hooks-realtime.ts`
  - `src/features/ai-coach/repository/memories.ts`
  - `src/features/ai-coach/repository/messages.ts`
  - `src/features/analytics/repository/storage.ts`
  - `src/features/battle-pass/repository/journey.ts`
  - `src/features/boss/repository/enhanced.ts`
  - `src/features/focus-identity/repository-focus-score.ts`
  - `src/features/items/service.ts`
  - `src/features/progression/repository/prestige.ts`
  - `src/features/rewards/repository/chests.ts`
  - `src/features/session-story/NarrativeQueries.ts`
  - `src/features/squads/repository/persistence.ts`
  - `src/features/streaks/repository-insurance.ts`
  - `supabase/functions/content-study/index.ts`

Why this is critical:

- Some of these are repository-ish files, but they violate the exact file contract and scatter table ownership.
- `src/features/items/service.ts` directly owns Supabase queries while also implementing item effect logic. That breaks the service/repository boundary.
- Realtime hooks call Supabase channels directly. The subscription cleanup exists, but channel construction and query-cache mutation policy live in a UI hook layer.

How to fix:

1. For each feature, create or restore `repository.ts` as the only public Supabase access file.
2. Move files like `repository/memories.ts` and `repository-focus-score.ts` behind `repository.ts` or rename them into internal helpers that are not imported outside the feature repository.
3. Move direct Supabase calls out of `src/features/items/service.ts`.
4. Realtime hooks should call a service/repository subscription factory. The hook should only bind lifecycle and query invalidation.
5. Add a CI grep rule: `supabase.from`, `supabase.rpc`, `supabase.channel`, `supabase.storage` can appear only in `repository.ts`, `src/config/supabase.ts`, generated types, and Supabase edge functions.

### 5. TanStack Query leaks into screen/container code

Evidence:

- Static audit found query/mutation calls outside allowed hook layers.
- Confirmed active files:
  - `src/screens/home/containers/EngagedHomeContainer.tsx` imports `useQuery` and `coachRepository`.
  - `src/screens/home/containers/PowerUserHomeContainer.tsx` imports `useQuery` and `coachRepository`.
  - `src/features/focus-identity/hooks-focus-score.ts` is a hook file but violates the exact `hooks.ts` naming contract.
- `EngagedHomeContainer` and `PowerUserHomeContainer` duplicate a recommendation query:
  - query key `['coach', 'recommendations', userId]`
  - query function `coachRepository.fetchActiveRecommendations(userId)`

Why this is critical:

- Home containers now know repository details and recommendation filtering rules.
- The same query logic is duplicated in two stage containers.
- The project's rule is explicit: components/screens do not call `useQuery`; hooks wrap query wiring for UI consumption.

How to fix:

1. Add `useActiveCoachRecommendations(userId, enabled)` to `src/features/ai-coach/hooks.ts`.
2. Move query key, query function, stale time, error shape, and filtering into that hook or into `service.ts` if filtering is business logic.
3. The home containers should consume the hook result only.
4. Return the required query contract: `data`, `isPending`, `isError`, `error`, `refetch`.
5. Replace duplicate logic in `EngagedHomeContainer` and `PowerUserHomeContainer`.

### 6. The app still carries `.part-N.ts` files even though the rule explicitly bans them

Evidence:

- `rtk find . -name "*.part-*.ts"` found 52 files in active `src/features` paths.
- Examples:
  - `src/features/retention/analytics.part-01.ts` through `analytics.part-05.ts`
  - `src/features/session-story/types.part-01.ts` through `types.part-12.ts`
  - `src/features/shop/types.part-01.ts` through `types.part-10.ts`
  - `src/features/themes/types.part-01.ts` through `types.part-07.ts`

Why this is critical:

- The project rule says never create `.part-N.ts` files; decompose by domain names instead.
- These files make the type and analytics surfaces unreviewable. A reviewer cannot tell what each part owns.
- Some related features are final-release deactivated or archived, but the files remain inside `src/features`, so they still add codebase risk and cognitive load.

How to fix:

1. For deactivated features, move implementation-only code to `archive/` and keep only gate stubs in `src`.
2. For active features, rename by domain:
   - `types.part-01.ts` -> `reward-types.ts`, `story-types.ts`, `theme-selection-types.ts`, etc.
   - `analytics.part-03.ts` -> `lifecycle-analytics.ts`, `reward-analytics.ts`, etc.
3. Update imports through a canonical `types.ts` or `analytics.ts` barrel only if that barrel stays under 200 lines.
4. Add a CI check that fails on `*.part-*.ts`.

### 7. Production config can silently run with nonfunctional backend clients

Evidence:

- Status after this audit pass: partially fixed. `src/config/supabase.ts` now throws outside Jest when URL/key are missing, and `src/config/__tests__/supabase-config.test.ts` covers that behavior.
- Remaining evidence: Jest still uses a fake object cast with `as unknown as SupabaseClient`.
- `src/constants/app.ts` defaults `EXPO_PUBLIC_ENVIRONMENT` to `development` when absent.
- `src/config/sentry.ts` skips Sentry initialization if DSN is missing and disables Sentry in development.

Why this is critical:

- A production build with missing env can boot into a fake backend path instead of failing fast.
- Auth and data operations can degrade into confusing user-facing failures rather than a clear build/release failure.
- Crash reporting can be disabled by a missing env var or environment default, leaving production blind.

How to fix:

1. Keep mock Supabase only in Jest.
2. Add a startup config validator that checks Supabase, Sentry, RevenueCat keys, PostHog key, and app environment before rendering the app.
3. In production EAS builds, fail build if required public env vars are missing.
4. Remove broad `as unknown as SupabaseClient` by creating a typed test-only mock adapter.

### 8. Lint is effectively non-blocking because warnings are allowed at massive scale

Evidence:

- ESLint JSON summary:
  - 2,487 files linted.
  - 838 files with messages.
  - 0 errors.
  - 18,340 warnings.
- The `lint` script exits 0 because warnings are not treated as failures.
- Top rule counts:
  - `quotes`: 15,074
  - `comma-dangle`: 1,043
  - `@typescript-eslint/no-unused-vars`: 755
  - `curly`: 741
  - `react-hooks/rules-of-hooks`: 57
  - `react-hooks/exhaustive-deps`: 16

Why this is critical:

- React hook warnings are not cosmetic. Rules-of-hooks and exhaustive-deps warnings can be runtime bugs.
- 18k warnings means lint has no signal. New dangerous warnings will be buried.
- Many warnings come from one-line/minified source files, which also makes code review and bug localization harder.

How to fix:

1. Run Prettier/ESLint formatting once across `src`.
2. Convert `react-hooks/rules-of-hooks` to error.
3. Convert `react-hooks/exhaustive-deps` to error after fixing the 16 current warnings.
4. Set `eslint --max-warnings=0` once the cleanup lands.
5. Keep generated files out of lint or explicitly exempt them.

### 9. Feature release state and route registration are not enough to protect product scope

Evidence:

- Route registration is gated in `src/navigation/root-stack-feature-routes.tsx`.
- Query/background systems still exist for archived/deactivated areas:
  - `src/hooks/usePrefetchQueries.ts` contains social, shop, battle pass, wallet, inventory prefetch paths.
  - Jobs exist for challenges, squad wars, notifications, coach cleanup, and weekly reports.
  - Large archived/social/economy code remains in `src/features`.
- Feature availability is being asked to protect every layer: UI, navigation, queries, backend calls, notifications, subscriptions.

Why this is critical:

- A single missed `FeatureAvailability` check can activate hidden systems.
- Product strategy says the app must prove the first 7 days before advanced systems activate. That cannot rely on scattered call-site discipline.

How to fix:

1. Introduce a single `RuntimeSurfacePolicy` service that returns allowed routes, allowed query keys, allowed notification types, allowed jobs, and allowed subscriptions.
2. Make query hooks accept this policy rather than each hook independently deciding enabled flags.
3. Delete or move deactivated systems out of active runtime imports.
4. Add tests that scan active runtime imports for hidden feature modules.

## P1 Major Architecture and Runtime Risks

### 10. The home stage containers are duplicating business logic and spreading casts

Evidence:

- `src/screens/home/containers/EngagedHomeContainer.tsx` and `PowerUserHomeContainer.tsx` repeat recommendation query, recommendation filtering, navigation callbacks, return-reason calculation, data casting, and controller construction.
- Both files use broad casts such as `as Record<string, unknown>`, `as UseQueryResult`, and route param casts.
- These containers are close to the 200-line limit and already carry business rules that belong in hooks/services.

How to fix:

1. Extract `useStageHomeRecommendations`.
2. Extract `buildHomeController` as a pure typed mapper.
3. Move return-reason business decisions to `features/home-spine/service.ts`.
4. Keep containers as wiring only.
5. Replace cast-based controller assembly with explicit interfaces inferred from Zod schemas where possible.

### 11. Navigation is not consistently using typed helper APIs

Evidence:

- Static audit found 92 `navigation.navigate('...')` string-literal samples.
- `src/navigation/navigation-helpers.ts` exists but is 302+ lines and uses route casts to bypass React Navigation overloads.
- Many screens/containers navigate directly instead of through typed helpers.

How to fix:

1. Define route constants or typed helper functions for every stack.
2. Forbid raw `navigation.navigate('Literal')` outside navigation helper modules.
3. Split `navigation-helpers.ts` under 200 lines.
4. Validate all notification/deep-link target params through Zod before navigation.

### 12. Type safety is weakened by widespread casts

Evidence:

- Static audit counted thousands of `as ...` casts.
- Examples:
  - `src/config/supabase.ts`: `as unknown as SupabaseClient`.
  - Home containers cast query data and route params.
  - Repository mapping files cast raw Supabase rows instead of parsing schemas.
  - Navigation helper casts routes to string/object.

Why this matters:

- The project rule allows casts only at validated Zod parse boundaries.
- Cast-heavy code hides schema drift, nullability problems, and query shape bugs.

How to fix:

1. Replace row casts with `Schema.parse(row)` at repository boundaries.
2. Replace route casts with typed helper overloads or explicit route-specific functions.
3. Replace `Record<string, unknown>` UI casts with view-model schemas.
4. Add ESLint rules to ban `as unknown`, `as any`, and broad `as Record<string, unknown>` outside test/mocks and Zod parse boundaries.

### 13. Hardcoded design values exist outside the theme token layer

Evidence:

- `rtk grep "#[0-9A-Fa-f]" src --glob "!src/theme/**"` found 130 matches in 30 files.
- Active examples:
  - `src/accessibility/color-blind.ts`
  - `src/accessibility/constants.ts`
  - `src/animation/confetti/constants.ts`
  - SVG-heavy components such as boss/avatar/companion visuals.

How to fix:

1. Move accessibility palettes into `src/theme/tokens/`.
2. Move confetti color sets into token-backed semantic palettes.
3. For SVG gradients, define token-driven color props or a small themed asset palette.
4. Exempt only static SVG URL fragment ids like `url(#gradient)`; do not exempt real hex values.

### 14. RevenueCat imports exist outside the shared monetization boundary

Evidence:

- Direct `react-native-purchases` references exist in:
  - `src/features/monetization/purchase-trust.ts`
  - `src/monetization/paywall-verification-catalog.ts`
  - `src/monetization/paywall-verification-purchase.ts`
  - shared monetization files, which are allowed.

Risk:

- The project rule says all purchases go through `shared/monetization/`.
- Type-only imports may be harmless, but direct purchase/catalog verification outside shared ownership invites SDK leakage.

How to fix:

1. Move purchase verification modules into `src/shared/monetization/` or make them consume shared wrappers only.
2. Export app-facing types from `shared/monetization/revenuecat-types.ts`.
3. Ban `react-native-purchases` imports outside `src/shared/monetization` and tests.

### 15. Supabase Edge Functions are too large and mix concerns

Evidence:

- `supabase/functions/content-study/index.ts`: 882 lines.
- `supabase/functions/ai/index.ts`: 500 lines.
- `supabase/functions/ai-coach/index.ts`: 390 lines.

Risks:

- Request routing, auth, schemas, rate limiting, provider calls, parsing, persistence, and response mapping are in single files.
- Edge function regressions are high blast-radius because they sit at the backend trust boundary.

How to fix:

1. Split each edge function into:
   - `schemas.ts`
   - `auth.ts`
   - `rate-limit.ts`
   - provider client file
   - repository/persistence file
   - route handlers
   - `index.ts` router only
2. Keep `index.ts` under 120 lines.
3. Add integration tests for each route and every error response.

### 16. App identity, legal URLs, and product copy are inconsistent

Evidence:

- `app.json` iOS privacy/support/terms URLs point to `https://pla4ma.github.io/...`.
- `src/constants/app.ts` points to `https://vex.app`, `support@vex.app`, and uses "The ultimate mobile experience".
- `app.json` owner/project metadata points to other account names.

Risk:

- App Store review and user trust suffer when support, privacy, terms, bundle owner, and runtime constants disagree.

How to fix:

1. Pick one production domain and one support email.
2. Align `app.json`, app constants, store listing, Sentry release metadata, and website links.
3. Replace generic tagline with the actual core promise.
4. Add an app-store metadata test that compares runtime constants to `app.json`.

### 17. Security/privacy posture needs a real release audit, not only Expo Doctor

Evidence:

- Expo Doctor passes 21/21, but that does not prove privacy, RLS, auth, billing, telemetry, or data retention correctness.
- `npm audit --omit=dev` reports 11 moderate production dependency advisories.
- Sentry replay is configured (`replaysSessionSampleRate: 0.1`, `replaysOnErrorSampleRate: 1.0`) with PII disabled, but product screens can still display user-generated text.
- PostHog and Sentry are both configured via public env vars.

How to fix:

1. Create a privacy inventory that maps every collected field to app functionality.
2. Confirm Sentry replay masking for all text inputs and sensitive screens.
3. Validate PostHog event payloads do not include content, study text, emails, or raw session notes.
4. Run Supabase RLS tests against a real local or staging database for every user-owned table.
5. Triage `npm audit` advisories by reachability. Do not run `npm audit fix --force`; it suggests invalid Expo downgrades.

### 18. Tests currently pass, but the first full non-silent run exposed noisy act warnings

Evidence:

- A first full `npm run test -- --runInBand` run emitted repeated React warnings around `ConfettiCelebration` updates not wrapped in `act(...)`.
- Latest full silent run passed.

Risk:

- Silent passing can hide runtime warnings that correspond to test harness leaks or animation timers.
- The warning points at `src/animation/ConfettiCelebration.tsx` and `src/features/economy/__tests__/WagerWonCeremony.test.tsx`.

How to fix:

1. Fix the test to wrap timer advancement in `act`.
2. Make the test console fail on unexpected `console.error` again after known warnings are fixed.
3. Audit timer-based animation tests for cleanup and reduced-motion paths.

## P2 Product, UX, and Growth Risks

### 19. The app still has too many advanced systems in active source for a first-release focus app

Evidence:

- Active and archived code includes boss, challenges, battle pass, squads, social, economy, inventory, shop, wagers, streak insurance, AI coach, content study, companion, monthly reports, session story, and more.
- Many of these are final-release deactivated, but they still appear in source, jobs, tests, route types, and feature maps.

Product risk:

- The core promise is focus execution. Excess systems create onboarding noise, QA burden, and retention confusion.
- The first 7 days should teach one loop: choose focus -> start session -> complete -> see proof -> return tomorrow.

How to fix:

1. Define the first-release product spine in one document and one config file.
2. Move all non-spine systems to archive or behind compile-time/dead-code boundaries.
3. For the first 7 days, show only:
   - first session CTA
   - simple focus/session history proof
   - basic coach presence with no fake memory
   - streak/progress proof only after real sessions
4. Treat boss, study OS, advanced coach, premium, social, economy, and battle pass as post-proof systems.

### 20. Monetization timing is safer than older app versions, but still must be tied to proven value

Evidence:

- Premium paywall threshold is 40 sessions in `feature-access-config.ts`.
- Tests cover no premium on Day 0 and premium after value.
- However, high-intent action behavior is split across `shared/monetization/premium-strategy.ts`, personalized premium logic, and feature availability.

Risk:

- Multiple monetization strategy paths can diverge.
- RevenueCat degraded state copy and feature gates must stay synchronized.

How to fix:

1. Make `shared/monetization/premium-strategy.ts` the only paywall decision owner.
2. Require both value proof and billing health before any purchasable surface.
3. Keep high-intent actions as "interest recorded" until first-week proof is complete.
4. Add one test matrix for `completedSessions`, `daysSinceOnboarding`, `billingConfigured`, `entitlement`, `highIntentAction`.

### 21. UI state completeness is not enforceable from the current structure

Evidence:

- The project requires loading skeleton, error, empty, success, offline, and optimistic states for data-driven components.
- The codebase has many components and hooks, but there is no systematic gate proving all states exist.
- Static scan found query logic in containers and feature hooks with inconsistent return contracts.

How to fix:

1. Create a `DataViewContract` helper type used by every feature hook.
2. Every query hook must return `data`, `isPending`, `isError`, `error`, `refetch`.
3. Every screen should render through a state switch component that requires all states.
4. Add component tests per data-driven screen covering loading, error, empty, offline, and success.

### 22. Accessibility labels are present in places but often generic

Evidence:

- Several components use labels like "Interactive control" or generated labels rather than action-specific labels.
- Minimum touch target helper use was not proven systematically.

Risk:

- Generic labels pass superficial accessibility checks but fail actual screen-reader usability.

How to fix:

1. Add a test utility that rejects generic labels: "button", "interactive control", "activates this control".
2. Require label text to name the concrete user action.
3. Add touch-target assertions to shared Button, Pressable wrappers, cards, and icon buttons.

### 23. Analytics and Sentry ownership is split across many layers

Evidence:

- Feature folders are often missing `analytics.ts`.
- Sentry calls appear directly in components/hooks/services.
- PostHog event capture ownership is not visibly centralized per feature.

Risk:

- Product events become inconsistent, hard to trust, and hard to remove for privacy.
- Unexpected errors may be captured without feature tags or breadcrumb context.

How to fix:

1. Each feature gets `analytics.ts` with named event functions only.
2. Components call analytics functions, not PostHog/Sentry directly unless it is an error boundary.
3. Add event schemas so payloads are validated and redactable.

## P3 Maintainability Debt

### 24. The repo contains active source and archive source in the same audit surface

Evidence:

- Bug-hunter triage saw `archive/` as 432 scannable files.
- Many archive files are over 500 to 2,000 lines.

Risk:

- Global searches and AI IDE context get flooded with dead code.
- Release review wastes time on archived systems.

How to fix:

1. Move archive outside the app repo or mark it as non-source in tooling.
2. Exclude archive from all test, lint, type, static audit, and IDE indexing.
3. Keep only explicit migration notes in active docs.

### 25. Documentation and agent rules conflict on exact stack versions

Evidence:

- The user-provided instruction block says Expo SDK 54 / Reanimated 3.
- The project-doc block and `package.json` say Expo SDK 56 / Reanimated 4.3.1 / TypeScript 6.0.3.

Risk:

- Automated agents can make incompatible dependency or API decisions.

How to fix:

1. Keep one canonical stack file, probably `AGENTS.md`.
2. Update all duplicated rules to Expo SDK 56, React Native 0.85.3, React 19.2.3, TypeScript 6.0.3, Reanimated 4.3.1.
3. Delete stale duplicated stack instructions.

### 26. Generated and manual code are not clearly separated

Evidence:

- `src/types/supabase.ts` is generated and huge.
- Static and line-limit tools treat generated/manual files inconsistently.

How to fix:

1. Add a generated-file header check.
2. Exempt generated files only by exact path and reason.
3. Never allow generated files to hide manual files over line limit.

## Recommended Fix Order

1. Enforce first-week proof gating in `liveops-config`.
2. Fix line-limit gate by splitting the largest active runtime files.
3. Restore feature folder shape for active release features only.
4. Move Supabase access behind exact `repository.ts` files.
5. Remove `useQuery` from home containers and screens.
6. Fail fast on missing production backend/observability config.
7. Make hook rules lint errors and reduce warnings to zero.
8. Move deactivated systems out of active source or behind a stronger runtime policy.
9. Split Supabase Edge Functions.
10. Clean legal/app identity URLs before App Store submission.

## Files Created During Audit

- `.bug-hunter/triage.json`
- `.bug-hunter/static-audit.json`
- `.bug-hunter/static-audit.md`
- `.bug-hunter/eslint.json`
- `.bug-hunter/eslint-summary.json`
- `.bug-hunter/audit-static.ps1`
- `.bug-hunter/summarize-eslint.ps1`
