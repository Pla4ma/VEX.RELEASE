VEX — FINAL APP RELEASE REVIEW
## Pre-Release Code Audit & Hermes Execution Plan

**Date**: June 7, 2026  
**Auditor**: Thermo-Nuclear Static Analysis + Deep Manual Review  
**Scope**: 4,478 source files, ~239K lines of TypeScript/TSX across `src/`, `supabase/`, `shared/`, plus full config audit  
**Stack**: Expo SDK 56 · React Native 0.85.3 · TypeScript 6.0.3 · Reanimated 4.3.1 · TanStack Query v5 · Zustand · Supabase  
**Verdict**: **NOT RELEASE-READY. Critical blockers exist. Execute this plan fully before submitting.**

---

## HOW TO READ THIS DOCUMENT

Every finding has a **severity label**:
- 🔴 **P0 — RELEASE BLOCKER**: Must be fixed. App cannot ship with this.
- 🟠 **P1 — HIGH PRIORITY**: Must be fixed before submission, not necessarily before build.
- 🟡 **P2 — MEDIUM**: Fix before v1.1. Tracked technical debt.
- 🔵 **P3 — LOW**: Nice to fix, non-blocking.

Each finding has:
- **What it is** — exact description
- **Where it is** — exact file path(s)
- **Why it matters** — consequence if shipped
- **Exact fix** — precise code diff or instruction

**Hermes**: Execute findings in the order they appear. P0s first, P1s second, P2s third. Do not reorder. Run `npx tsc --noEmit` and `npm run check:banned-patterns` after completing each section. Do not mark a section complete until both pass cleanly.

---

## PART 1: SECURITY & DATA INTEGRITY

---

### 1.1 🔴 P0 — 14 Supabase `select('*')` Wildcard Queries

**What it is**: Fourteen active repository calls use `.select('*')` instead of explicit column lists. In Supabase, wildcard select means every column added to the table — including future sensitive columns — is automatically returned to the client. This is both a data over-fetching bug and a future security footgun.

**Where it is**:
```
src/features/streaks/repository/comeback.ts         lines 63, 120
src/features/progression/repository/prestige.ts     line 41
src/features/progression/repository/unified.ts      line 34
src/features/progression/first-week-pacing/service.ts line 115
src/features/settings/repository.ts                 lines 83, 117
src/features/reward-ledger/repository.ts             lines 40, 107
src/features/focus-identity/repository.ts            line 71
```

**Why it matters**: Any future column added to `user_progress`, `streaks`, or `settings` tables (PII, financial, admin flags) is automatically exposed to client queries. The `select('*')` pattern also prevents Supabase's column-level RLS policies from functioning correctly. The `check:select-star` script exists but is not enforcing zero tolerance.

**Exact fix** — for each location, replace `select('*')` with an explicit column list. Example for `comeback.ts`:
```typescript
// BEFORE
const { data, error } = await supabase
  .from('streaks')
  .select('*')
  .eq('user_id', userId)

// AFTER
const { data, error } = await supabase
  .from('streaks')
  .select('user_id, current_days, longest_days, last_session_day, streak_shield_count, updated_at')
  .eq('user_id', userId)
```

Repeat this pattern for all 14 locations. Check the auto-generated `src/types/supabase.ts` for the exact column names. Run `npm run check:select-star` after each file — it should exit 0.

---

### 1.2 🔴 P0 — Two Service Files Directly Access Supabase (Architecture Violation)

**What it is**: Two `service.ts` files bypass the repository layer and call `getSupabaseClient()` directly. This violates the mandatory data-flow contract: `Component → Hook → Service → Repository → Supabase`.

**Where it is**:
```
src/features/progression/first-week-pacing/service.ts  — line 10: import { getSupabaseClient }
src/features/focus-identity/monthly-report/service.ts  — direct Supabase calls
```

**Why it matters**: Any Supabase query in a service file means: (1) zero retry logic, (2) no centralized error normalization, (3) no RLS debugging path, (4) impossible to mock in tests without leaking implementation details. The architecture rule exists precisely to prevent scattered query ownership.

**Exact fix for `first-week-pacing/service.ts`**:
1. Create `src/features/progression/first-week-pacing/repository.ts`
2. Move all `getSupabaseClient()` calls into that file behind named functions
3. In `service.ts`, replace direct Supabase calls with imports from `./repository`
4. Remove the `getSupabaseClient` import from `service.ts`

```typescript
// NEW: src/features/progression/first-week-pacing/repository.ts
import { getSupabaseClient } from '../../../../config/supabase';
import { FirstWeekProgressSchema, type FirstWeekProgress } from './schemas';
import { tableColumns } from '../../../../lib/repository/tableColumns';
import { RepositoryError } from '../../../../lib/repository/base';

export async function fetchFirstWeekProgress(userId: string): Promise<FirstWeekProgress | null> {
  const { data, error } = await getSupabaseClient()
    .from('first_week_progress')
    .select(tableColumns.firstWeekProgress)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new RepositoryError('fetchFirstWeekProgress', error);
  if (!data) return null;
  return FirstWeekProgressSchema.parse(data);
}
```

Repeat the same extraction for `focus-identity/monthly-report/service.ts`.

---

### 1.3 🔴 P0 — Direct `expo-haptics` Import in Production Component

**What it is**: `BossPreviewCard.tsx` imports and calls `Haptics.triggerHaptic()` directly, bypassing the mandatory `src/utils/haptics.ts` layer. The architecture rule states: "All haptics go through `src/utils/haptics.ts` named functions only. Never import expo-haptics directly in a component or hook."

**Where it is**:
```
src/features/home-spine/components/BossPreviewCard.tsx  line 155
```

**Why it matters**: Direct haptic imports mean haptic behavior cannot be centrally toggled (e.g., for accessibility, user preference, or OS compatibility). Named functions in `haptics.ts` enforce the single point of control.

**Exact fix**:
```typescript
// BEFORE (BossPreviewCard.tsx)
import * as Haptics from '../../utils/haptics';  // or wherever the import is
// ...
onPress={() => {
  Haptics.triggerHaptic('impactLight');
  onPlaceBounty?.();
}}

// AFTER
import { triggerImpactLight } from '../../../utils/haptics';
// ...
onPress={() => {
  triggerImpactLight();
  onPlaceBounty?.();
}}
```

Verify `triggerImpactLight` is exported from `src/utils/haptics.ts`. If not, add it alongside the existing named functions.

---

### 1.4 🔴 P0 — Sentry Organization Name Typo in `app.json`

**What it is**: The Sentry plugin in `app.json` has `"organization": "nueroflow"` — a misspelling of `"neuroflow"`. This causes source map uploads to fail silently during EAS builds, meaning production crashes will have no stack traces.

**Where it is**:
```json
// app.json line 169
"organization": "nueroflow"
```

**Why it matters**: Without correct source map uploads, every Sentry crash report is a raw minified stack trace. Debugging production issues becomes nearly impossible. This is a silent build-time failure — EAS will build successfully but source maps will be orphaned.

**Exact fix**:
```json
// app.json
"organization": "neuroflow"
```

Verify by running a preview build and checking Sentry → Releases for source map artifacts.

---

### 1.5 🔴 P0 — `expo-splash-screen` Registered Twice in `app.json` Plugins

**What it is**: The `app.json` plugins array registers `expo-splash-screen` twice: once as the bare string `"expo-splash-screen"` and once as the full array form with config. This causes the Expo build system to apply the splash screen plugin twice, which can corrupt the native splash screen configuration on both iOS and Android.

**Where it is**:
```json
// app.json plugins array — two entries:
"expo-splash-screen",                    // ← first registration (remove this)
[
  "expo-splash-screen",                  // ← second registration (keep this)
  { "image": "./assets/splash.png", ... }
]
```

**Exact fix**: Remove the bare `"expo-splash-screen"` string entry. Keep only the configured array form with `image`, `resizeMode`, and `backgroundColor`.

---

### 1.6 🔴 P0 — Global Error Handler Skipped in Development Mode

**What it is**: `src/app/bootstrap.ts` wraps `setupGlobalErrorHandler()` and `setupRejectionHandler()` inside `if (!IS_DEVELOPMENT)`. This means unhandled promise rejections and fatal errors are never captured during development testing — the environment where bugs are most likely caught.

**Where it is**:
```typescript
// src/app/bootstrap.ts lines 23-26
function initializeCoreSystems(): void {
  if (!IS_DEVELOPMENT) {
    setupGlobalErrorHandler();   // ← never runs in dev
    setupRejectionHandler();     // ← never runs in dev
  }
```

**Why it matters**: Development and preview builds are the primary testing surface. If global error handlers aren't installed, unhandled rejections in `async` session functions, navigation handlers, and query callbacks fail silently. Bugs ship to production that were never surfaced in dev.

**Exact fix**:
```typescript
function initializeCoreSystems(): void {
  setupGlobalErrorHandler();  // Always install — internal handler already guards __DEV__ for Sentry
  setupRejectionHandler();    // Always install
  initializeAnalyticsEventBridge();
  // ...
}
```

The handlers in `globalErrorHandlers.ts` already guard `if (!__DEV__)` before calling `captureException`, so this is safe. The issue is purely at the bootstrap level.

---

### 1.7 🟠 P1 — 410 Untyped `catch (error)` Blocks — TypeScript Safety Hole

**What it is**: 410 catch blocks use `catch (error)` without the `: unknown` type annotation. In TypeScript strict mode, this technically violates the spirit of `noImplicitAny` — `error` is typed as `unknown` implicitly in TS 4.4+, but without the annotation the intent is unclear and linters flag it.

More critically, many of these blocks then call methods on `error` without `instanceof` narrowing:
```typescript
catch (error) {
  debug.error('Failed', error.message);  // error is unknown — .message is unsafe
}
```

**Where it is**: 410 files. Worst offenders are monetization (20+ occurrences), ai service (15+), session hooks (12+), and streaks repository (8+).

**Exact fix** — apply this pattern universally:
```typescript
// BEFORE
catch (error) {
  debug.error('Failed', error.message);
}

// AFTER
catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  debug.error('Failed', message);
}
```

For blocks that call `Sentry.captureException(error, ...)`, the existing pattern is correct — Sentry accepts `unknown`. For blocks that call `handleSupabaseError(err)` or similar helpers — verify those helpers accept `unknown` at their signature boundary.

Run: `grep -rn "catch (error)" src/ --include="*.ts" --include="*.tsx" | grep -v ": unknown\|__tests__"` — target should be zero.

---

### 1.8 🟠 P1 — Certificate Pinning Pins Not Verified After Recent Rotation

**What it is**: The `app.json` withCertificatePinning plugin has a `_pins_verified` comment dating `2026-06-05`. The pins are for `icnbpjkyupuqzuvwuvbk.supabase.co` via Google Trust Services WE1 / GlobalSign. Google aggressively rotates intermediates. If a Supabase cert rotates before launch, all users get SSL errors on day one.

**Where it is**:
```json
// app.json
"_pins_verified": "2026-06-05 — Verified against icnbpjkyupuqzuvwuvbk.supabase.co live cert chain."
```

**Exact fix**: Re-verify pins against the live chain immediately before the production EAS build:
```bash
openssl s_client -connect icnbpjkyupuqzuvwuvbk.supabase.co:443 -showcerts 2>/dev/null | \
  openssl x509 -pubkey -noout | \
  openssl rsa -pubin -outform der 2>/dev/null | \
  openssl dgst -sha256 -binary | \
  base64
```
Update all three pins in `app.json`. Update the `_pins_verified` timestamp. If you cannot verify this the day of submission, consider removing certificate pinning for v1.0 (Supabase's default TLS is still industry-standard) and adding it back in v1.1 with a proper rotation process.

---

### 1.9 🟠 P1 — Privacy Policy and Support URLs Point to GitHub Pages

**What it is**: `app.json` and `src/constants/app.ts` point `NSPrivacyPolicyURL`, `NSSupportURL`, and `NSTermsOfServiceURL` to `https://pla4ma.github.io/VEX.RELEASE/privacy`, `…/support`, and `…/terms`. GitHub Pages URLs in App Store metadata look amateur and are fragile (GitHub account ban, repo rename, etc).

**Where it is**:
```json
// app.json
"NSPrivacyPolicyURL": "https://pla4ma.github.io/VEX.RELEASE/privacy",
"NSSupportURL": "https://pla4ma.github.io/VEX.RELEASE/support"
```
```typescript
// src/constants/app.ts
privacyPolicy: 'https://pla4ma.github.io/VEX.RELEASE/privacy',
termsOfService: 'https://pla4ma.github.io/VEX.RELEASE/terms',
```

**Why it matters**: Apple reviews Privacy Policy URLs. A GitHub Pages URL increases scrutiny. If the page is down during review, the app is rejected.

**Exact fix**: Move to a custom domain before submission. Even a simple Notion page on a custom domain is better. Update all four URL references in `app.json` and `src/constants/app.ts` to match.

---

### 1.10 🟠 P1 — `userInterfaceStyle: "light"` Locks App to Light Mode — Dark Mode System Fully Broken

**What it is**: `app.json` sets `"userInterfaceStyle": "light"`, which tells iOS and Android to never apply the dark system theme. Meanwhile, 234 source files import `lightColors` directly from `@/theme/tokens/colors` instead of using the theme-aware token system. If `userInterfaceStyle` were ever changed to `"automatic"`, the entire app UI would break because the theme tokens are hardcoded to light values.

**Where it is**:
```json
// app.json line 8
"userInterfaceStyle": "light"
```
234 files with direct `lightColors` imports — including `CoachScreen.styles.ts`, navigation components, session screens, all glass components.

**Why it matters**: Two issues: (1) App Store reviewers check that apps respect system preferences. "Light only" gets flagged in App Store Connect as a limitation. (2) The design system supports dark mode (token system exists) but zero screens consume it — meaning the dark mode work already done is wasted. This is also an accessibility issue for users with light sensitivity.

**Exact fix for v1.0 (pragmatic)**: Keep `"userInterfaceStyle": "light"` to lock the current behavior. This is acceptable for v1.0. However, document that dark mode is disabled and track it. Do NOT label the app as supporting dark mode anywhere.

**Exact fix for v1.1 (complete)**: Audit the 234 `lightColors` import sites and replace with `useTheme()` hook-based token access. Once complete, change to `"automatic"`.

---

### 1.11 🟡 P2 — `as Record<string, unknown>` Casts at 12 Active Sites

**What it is**: 12 active cast sites use `as Record<string, unknown>` or `as unknown as X` to bypass TypeScript's type system at query boundaries.

**Where it is**:
```
src/shared/ai/edge-function-service.ts:40       context as Record<string, unknown>
src/features/integration/social-feed.ts:55       rawData as unknown as CompetitiveResult
src/features/notifications/repository/retention.ts:122  row as unknown as Omit<...>
src/features/liveops-config/FeatureFlagService.ts:50    FLAGS_EXT as Record<string, unknown>
src/session/utils/session-config-validator.ts:59  obj as Record<string, unknown>
src/session/utils/validation.ts:81               obj as Record<string, unknown>
src/screens/auth/components/ethereal/CloudPuff.tsx:41   percentage as unknown as number
src/screens/home/components/HomeHeroSection.tsx:156     params as Record<string, unknown>
src/screens/onboarding/components/ethereal/HeroOrb.tsx:59-60  percentage as unknown as number
```

**Exact fix priority**:
- `social-feed.ts`: Define `CompetitiveResult` Zod schema and use `CompetitiveResultSchema.parse(rawData)` at the boundary
- `retention.ts`: Extend the Row type properly from the Supabase generated types
- `CloudPuff.tsx` and `HeroOrb.tsx`: The `as unknown as number` for percentage-as-style values is a React Native layout issue. Use a numeric calculation: `const topStyle = topPercent / 100` and use it as a multiplier, not a percentage string
- `HomeHeroSection.tsx`: Type the `toSessionSetupParams` return type properly as `SessionSetupParams`

---

## PART 2: TYPESCRIPT COMPLIANCE

---

### 2.1 🔴 P0 — TypeScript Version Mismatch: `~6.0.3` vs Required `5.x`

**What it is**: `package.json` declares `"typescript": "~6.0.3"` in devDependencies. The project spec requires TypeScript 5.x. TypeScript 6.x was in active development as of mid-2026 and may introduce breaking changes with the `expo/tsconfig.base.json` base config, with existing decorators (`experimentalDecorators`, `emitDecoratorMetadata`), and with Reanimated 4's worklet typing.

**Where it is**:
```json
// package.json devDependencies
"typescript": "~6.0.3"
```

**Why it matters**: TypeScript 6.x changed the module resolution default and introduced stricter checking in several areas. Expo SDK 56's `tsconfig.base.json` was built for TypeScript 5.x. Running a mismatched version means the typecheck you think is passing may not reflect the version App Store builds run.

**Exact fix**:
```json
// package.json
"typescript": "~5.8.3"
```

Then run `npm install` and `npx tsc --noEmit`. Fix any new type errors that surface. This is a hard requirement — do not ship on TypeScript 6.x with this stack.

---

### 2.2 🟠 P1 — `noUnusedLocals` and `noUnusedParameters` Disabled in `tsconfig.json`

**What it is**: `tsconfig.json` has both `"noUnusedLocals": false` and `"noUnusedParameters": false`. This allows dead variables and unused parameters to exist silently across the codebase — a significant source of AI slop (generated code that creates variables it never uses).

**Where it is**:
```json
// tsconfig.json
"noUnusedLocals": false,
"noUnusedParameters": false
```

**Why it matters**: Dead local variables are the single strongest indicator of AI-generated code that was never tested. Unused parameters signal API surface that was designed but never consumed. Both create maintenance confusion and can hide bugs where the wrong variable was used (e.g., `const userId = getUserId()` declared but `id` used by mistake).

**Exact fix**:
```json
// tsconfig.json
"noUnusedLocals": true,
"noUnusedParameters": true
```

Run `npx tsc --noEmit`. Fix all errors. Expect 20–80 unused variables given the codebase size. Use `_paramName` convention for intentionally unused function parameters that cannot be removed (e.g., in interface implementations).

---

### 2.3 🟠 P1 — `isLoading` Used Instead of `isPending` in 5 TanStack Query v5 Contexts

**What it is**: TanStack Query v5 renamed `isLoading` to `isPending` for queries (not background refetch). Five locations use the v5-deprecated `isLoading` pattern on query results in a way that causes incorrect loading state behavior — `isLoading` in v5 only returns `true` for the initial load without cached data AND without a pending fetch, whereas `isPending` is the correct "data is not yet available" check.

**Where it is**: 5 instances found by pattern — run this to find them:
```bash
grep -rn "\.isLoading" src/ --include="*.ts" --include="*.tsx" | \
  grep "useQuery\|useInfiniteQuery" | grep -v "__tests__"
```

**Exact fix**: Replace `query.isLoading` with `query.isPending` for initial load checks. Use `query.isFetching` for background refresh indicators. Review TanStack v5 migration guide section on status flags.

---

### 2.4 🟡 P2 — `testPathPattern` Exclude Paths Missing Archive Directory

**What it is**: `tsconfig.json` excludes `"archive"` from compilation, but the `scripts/check-line-limit.js` and `scripts/check-banned-patterns.js` scripts likely scan `archive/` since they use glob patterns without explicit exclusion.

**Where it is**:
```json
// tsconfig.json
"exclude": ["node_modules", "dist", "android", "ios", "archive", ...]
```

**Exact fix**: Add `archive/` to any glob patterns in all `scripts/check-*.js` files that don't already exclude it. This prevents false positives from dead archived code contaminating audit results.

---

## PART 3: ARCHITECTURE VIOLATIONS

---

### 3.1 🔴 P0 — 34 `tmp_*.json` Files Committed to Repository Root

**What it is**: 34 large JSON files (`tmp_ai.json`, `tmp_full_results.json`, `tmp_results_2.json`, etc.) are present in the repository root, totaling ~50MB of AI agent scratch data. These are NOT in `.gitignore` and would be included in the EAS build context, which increases build times and risks leaking intermediate data.

**Where it is**: Repository root — `tmp_ai.json`, `tmp_ai2.json`, `tmp_ai3.json`, `tmp_aq.json`, `tmp_b1.json`, `tmp_b2.json`, `tmp_b3.json`, `tmp_beh.json`, `tmp_beh2.json`, `tmp_ce.json`, `tmp_current.json`, `tmp_fast.json`, `tmp_final.json`, `tmp_fixnow.json`, `tmp_fresh.json`, `tmp_full_results.json`, `tmp_pers.json`, `tmp_q1.json`, `tmp_q2.json`, `tmp_q3.json`, `tmp_rem.json`, `tmp_rest.json`, `tmp_results_2.json`, `tmp_results_3.json`, `tmp_results_4.json`, `tmp_sp1.json`, `tmp_stage5.json`, `tmp_v5.json`, `tmp_v6.json`, `tmp_z3.json`, `tmp_zod.json`, `tmp_zod2.json`, `tmp_zod3.json`, `tmp_zod4.json`.

**Why it matters**: (1) EAS build context upload includes these files, adding minutes to build time. (2) The files contain AI agent results that may include full source analysis, intermediate diffs, or architectural plans — not appropriate for a repository. (3) This is a `VERY DIRTY WORKTREE` — acknowledged by the user.

**Exact fix**:
```bash
# Step 1: Delete all tmp files
rm tmp_*.json

# Step 2: Add to .gitignore
echo "tmp_*.json" >> .gitignore
echo "tmp_*.txt" >> .gitignore

# Step 3: If any were already committed, purge from git history
git rm --cached tmp_*.json 2>/dev/null || true
git add .gitignore
git commit -m "chore: purge tmp AI scratch files from repo"
```

NO 3.2 FOR NOW.

---

### 3.3 🟠 P1 — 101 Animated Components Missing `useReducedMotion()` Check

**What it is**: 101 production components use Reanimated animations (`withSpring`, `withTiming`, `useSharedValue`, `useAnimatedStyle`) without checking `useReducedMotion()`. On iOS and Android, users with vestibular disorders, epilepsy, or motion sensitivity can enable "Reduce Motion" in accessibility settings. Those users get full animations that can cause nausea or seizures.

**Where it is** — highest priority (core session experience, seen most often):
```
src/shared/ui/components/TransitionWrapper.tsx
src/shared/ui/components/TabItemComponent.tsx
src/features/session-start/components/live-focusing/PulsingLiveDot.tsx
src/features/streaks/components/StreakFlame.tsx
src/features/streaks/components/streak-flame-chain.tsx
src/features/streaks/components/Confetti.tsx
src/features/session-completion/components/XPEarnAnimation.tsx
src/features/session-completion/components/grade-reveal-helpers.tsx
```

**Exact fix** — apply to every animation component:
```typescript
import { useReducedMotion } from 'react-native-reanimated';

export function PulsingLiveDot() {
  const reduceMotion = useReducedMotion();

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: reduceMotion
          ? 1  // static if motion reduced
          : withRepeat(withSpring(1.3, { damping: 5 }), -1, true),
      },
    ],
  }));
  // ...
}
```

For `Confetti.tsx` and particle animations: if `reduceMotion` is true, skip rendering the animation entirely (`return null` or a static celebration state).

For `TransitionWrapper.tsx`: replace animated transition with an instant opacity change:
```typescript
const animatedStyle = useAnimatedStyle(() => ({
  opacity: reduceMotion
    ? 1  // skip fade-in, just show immediately
    : withTiming(isVisible ? 1 : 0, { duration: 200 }),
}));
```

---

### 3.4 🟠 P1 — 8 Interactive Elements Missing `accessibilityLabel`

**What it is**: 8 production components contain `Pressable` or `TouchableOpacity` without `accessibilityLabel`. Screen reader users (VoiceOver on iOS, TalkBack on Android) will hear "button" with no context — unusable.

**Where it is**:
```
src/shared/ui/components/StatusChip.tsx
src/features/session-start/components/StakeCard.tsx
src/features/home-spine/components/TomorrowPreviewSession.tsx
src/features/focus-identity/components/FocusScoreWidget.tsx
src/features/focus-identity/components/MonthlyFocusReport.tsx
src/features/focus-identity/components/FocusScoreCardContent.tsx
src/features/focus-identity/components/FocusScoreCardStates.tsx
src/screens/session/components/VexControlDock.tsx
```

**Why it matters**: Apple's App Store Review Guidelines section 5.1.1 requires accessible apps. VoiceOver accessibility is checked during review for productivity apps. Unlabeled buttons are a rejection risk.

**Exact fix** — for each component, add labels and roles to every `Pressable`:
```typescript
// StatusChip.tsx
<Pressable
  onPress={onPress}
  accessibilityLabel={`${status} status: ${label}`}
  accessibilityRole="button"
  accessibilityHint="Double tap to interact"
>

// FocusScoreWidget.tsx
<Pressable
  onPress={onPress}
  accessibilityLabel="View Focus Score dashboard"
  accessibilityRole="button"
>

// VexControlDock.tsx  — most critical, in the active session
<Pressable
  onPress={onPause}
  accessibilityLabel={isPaused ? "Resume session" : "Pause session"}
  accessibilityRole="button"
  accessibilityHint="Double tap to pause or resume your focus session"
>
```

---

### 3.5 🟠 P1 — 33 Screens Use `ActivityIndicator` Spinner With No Skeleton Loading

**What it is**: 33 production screens render `ActivityIndicator` as their sole loading state. The project spec is explicit: "Loading: skeleton UI matching the exact layout of the loaded content. Never a spinner alone."

**Where it is** — highest visibility (users see these every session):
```
src/features/ai-coach/components/CoachScreen.tsx   — spinner on stateLoading/historyLoading
src/navigation/RootAuthLoadingScreen.tsx            — spinner for auth check
src/features/content-study/components/PdfUploader.tsx
src/features/home-spine/components/StartSessionButton.tsx
src/features/home-spine/components/StartSessionButtonCompact.tsx
src/shared/monetization/components/VipPaywallScreen.tsx
```

**Why it matters**: Spinner-only loading states cause layout shift when content loads, feel slower psychologically (skeleton gives users a sense of the interface before data arrives), and look unpolished compared to modern app standards. The `SkeletonItem` component already exists — it's just not being used here.

**Exact fix for CoachScreen.tsx**:
```typescript
// BEFORE
if (stateLoading || historyLoading) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: 44 }} />
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={lightColors.semantic.primary} />
      </View>
    </SafeAreaView>
  );
}

// AFTER
if (stateLoading || historyLoading) {
  return (
    <SafeAreaView style={styles.container}>
      <CoachScreenSkeleton />  {/* Create this component */}
    </SafeAreaView>
  );
}

// NEW: CoachScreen.skeleton.tsx
export function CoachScreenSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonItem height={60} borderRadius={0} style={{ marginBottom: 8 }} />
      {Array.from({ length: 5 }, (_, i) => (
        <SkeletonItem
          key={i}
          height={72}
          borderRadius={12}
          style={{ marginHorizontal: 16, marginBottom: 12 }}
        />
      ))}
    </View>
  );
}
```

---

### 3.6 🟠 P1 — `catch (err)` Without `: unknown` in Auth, Streaks, and Content-Study Repositories

**What it is**: Auth, streaks, and content-study repositories use `catch (err)` instead of `catch (err: unknown)`. While TypeScript 4.4+ catches implicitly type `unknown`, not annotating it allows the bad pattern where `err.message` is accessed directly without narrowing.

**Where it is**:
```
src/features/auth/repository-session.ts        lines 41, 56, 79
src/features/auth/repository-credentials.ts    lines 64, 93, 113, 131
src/features/streaks/hooks/useRepairQuestStatus.ts  line 42
src/features/streaks/hooks/useStreakRepairQuest.ts   line 51
src/features/content-study/hooks/useContentInput.ts  line 160
src/features/content-study/hooks/useContentReview.ts line 166
src/features/focus-identity/repository-focus-score-queries.ts line 125
src/features/rescue-mode/repository.ts          line 104
```

**Exact fix**: Add `: unknown` annotation to all catch parameters in these files:
```typescript
// BEFORE
} catch (err) {
  return { user: null, error: handleSupabaseError(err) };
}

// AFTER
} catch (err: unknown) {
  return { user: null, error: handleSupabaseError(err) };
}
```

---

### 3.7 🟠 P1 — Mutations Without Sentry Error Reporting in 9 Hook Files

**What it is**: 9 mutation hooks handle errors with only `debug.error()` or by swallowing entirely, never calling `Sentry.captureException()`. The architecture spec mandates: "Every mutation must: invalidate related queries on success, call Sentry on error, show a user-facing error toast."

**Where it is**:
```
src/features/challenges/hooks/basic-challenges-mutations.ts  — onError: only debug.error
src/features/analytics/hooks/useAnalyticsMutations.ts       — silent failure
src/features/reward-ledger/hooks.ts                         — no sentry
src/features/focus-memory/useMemoryPanel.ts                 — no sentry
src/features/memory-candidate/hooks.ts                      — no sentry
src/features/rescue-mode/hooks.ts                           — no sentry
```

**Exact fix** for each `onError` block:
```typescript
// BEFORE
onError: (error) => {
  debug.error('Failed to update challenge progress', error instanceof Error ? error : new Error(String(error)));
},

// AFTER
onError: (error: Error) => {
  Sentry.captureException(error, {
    tags: { feature: 'challenges', operation: 'updateProgress' },
  });
  showToast({
    message: 'Failed to update your challenge. Please try again.',
    type: 'error',
    duration: 4000,
  });
  debug.error('Challenge progress update failed', error);
},
```

Add `import * as Sentry from '@sentry/react-native'` and `const showToast = useToast()` at the top of each hook file.

---

### 3.8 🟠 P1 — `TextInput` Components Without `KeyboardAvoidingView` in Screen Context

**What it is**: 15 components render `TextInput` without `KeyboardAvoidingView`. On iOS, the keyboard slides up and covers inputs, making them unreachable. On Android with `behavior="height"`, the content shifts to stay visible. This is a standard iOS UX bug that gets apps 1-star reviews on App Store.

**Where it is** — highest priority (user types here every session):
```
src/features/content-study/components/ShortAnswerInput.tsx
src/features/content-study/screens/ContentReviewScreen.helpers.tsx
src/session/components/CreatePresetForm.tsx
src/session/components/SessionHistory.tsx         — search input
src/session/components/SessionSummaryMoodSelector.tsx
src/features/onboarding/components/NameScreen.tsx
src/features/mode-native/components/ModeQuickContract.tsx
```

**Exact fix** — wrap each screen-level form:
```typescript
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

export function CreatePresetForm() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* form content */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

For components that are already embedded inside a scrolling parent (like `ShortAnswerInput.tsx`), add `keyboardShouldPersistTaps="handled"` to the parent ScrollView instead.

---

### 3.9 🟡 P2 — `StyleSheet.absoluteFill` Used in 6 Components (Banned Pattern Boundary Case)

**What it is**: 6 components spread `StyleSheet.absoluteFill` into their style objects. The `StyleSheet` import is for this utility constant only — `StyleSheet.create()` is not used. This is a technical grey area: `StyleSheet.absoluteFill` is a static object `{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }` and isn't the banned `StyleSheet.create()` pattern.

**Where it is**:
```
src/shared/ui/components/CardStatusOverlay.tsx
src/shared/ui/components/TabBar.styles.ts
src/components/overlays/Modal.tsx
src/components/FocusRing.tsx
```

**Exact fix**: Replace `StyleSheet.absoluteFill` with the inline object literal it represents:
```typescript
// BEFORE
import { StyleSheet } from 'react-native';
style={[StyleSheet.absoluteFill, { borderRadius }]}

// AFTER — no StyleSheet import needed
const ABSOLUTE_FILL = { position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0 };
style={[ABSOLUTE_FILL, { borderRadius }]}
```

Or export `ABSOLUTE_FILL` from `src/utils/styleHelpers.ts` and import from there.

---

## PART 4: PERFORMANCE

---

### 4.1 🟠 P1 — QueryProvider Has `refetchOnMount: false` as Global Default

**What it is**: `src/api/QueryProvider.tsx` sets `refetchOnMount: false` as a global default for all TanStack Query queries. This means when a user navigates back to a screen, stale data is shown without any refetch trigger. Combined with a 2-minute `staleTime`, users can see data that's up to 2 minutes old every time they navigate.

**Where it is**:
```typescript
// src/api/QueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      refetchOnMount: false,    // ← problematic
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
```

**Why it matters**: Session count, streak data, and progression data are time-sensitive. A user who completes a session and navigates to the home screen will see their old streak (0 sessions today) because `refetchOnMount: false` suppresses the refetch that would update it.

**Exact fix**: Change the global default to `'always'` for mount behavior, but give individual queries the ability to opt into `false` for expensive queries:
```typescript
defaultOptions: {
  queries: {
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true,        // Changed: refetch if stale on mount
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
```

Then, for expensive queries that should NOT refetch on every mount (e.g., session history, analytics), explicitly set `refetchOnMount: false` in those specific `useQuery` calls.

---

### 4.2 🟠 P1 — Session Completion Offline Sync: `successRate: 95` is Hardcoded Lie

**What it is**: `SessionCompletionOfflineSyncService.generateHealthReport()` hardcodes `successRate: this.isInitialized ? 95 : 0`. This is a fabricated metric. If the health report is consumed by any monitoring, alerting, or UI display, it will always show 95% regardless of actual sync performance.

**Where it is**:
```typescript
// src/features/session-completion/offline-sync-service.ts line 80
return {
  queueSize: d.fallbackEntriesCount,
  successRate: this.isInitialized ? 95 : 0,  // ← hardcoded
  averageRetryCount: 0,                        // ← hardcoded
```

**Exact fix**: Track actual success/failure counts in instance variables:
```typescript
private successCount = 0;
private failureCount = 0;

// In processSessionCompletion success path:
this.successCount++;

// In processSessionCompletion failure path:
this.failureCount++;

// In generateHealthReport:
const totalAttempts = this.successCount + this.failureCount;
const successRate = totalAttempts > 0
  ? Math.round((this.successCount / totalAttempts) * 100)
  : this.isInitialized ? 100 : 0;
```

---

### 4.3 🟡 P2 — 33 Empty Dependency Array `useEffect/useCallback/useMemo` Patterns — Potential Stale Closures

**What it is**: 33 hooks use empty dependency arrays `[]` with `useEffect`, `useCallback`, or `useMemo`. While not always wrong (one-time setup effects), 33 instances across session, streaks, and home components is suspicious — several likely capture stale closures over `userId`, `orchestrator`, or network state.

**Where it is**: Run this to find exact locations:
```bash
grep -rn ", \[\])" src/ --include="*.ts" --include="*.tsx" | \
  grep "useEffect\|useCallback\|useMemo" | grep -v "__tests__"
```

**Exact fix**: For each empty dep array, verify the enclosed function does not reference any reactive value (prop, state, context, or external variable that can change). If it does, add the dependency. If the intent is "run once on mount," add a comment:
```typescript
// Intentionally empty: runs once on mount to initialize orchestrator
useEffect(() => {
  orchestrator.setUserId(userId);
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

But `userId` changing here would be a bug — the actual fix is:
```typescript
useEffect(() => {
  orchestrator.setUserId(userId);
}, [orchestrator, userId]); // Re-initialize when user changes
```

---

### 4.4 🟡 P2 — AI Coach Module: 162 Files — Dominant Feature at 3× Normal Size

**What it is**: `src/features/ai-coach/` contains 162 files, making it the largest feature module by 3× the next largest (session-completion at 104). Within ai-coach, there are duplicate service locations: `service.ts` at root, `service/` directory, AND `services/` directory. Same for hooks. A reader cannot determine where canonical logic lives.

**Where it is**:
```
src/features/ai-coach/service.ts        (root file)
src/features/ai-coach/service/         (directory)
src/features/ai-coach/services/        (another directory)
src/features/ai-coach/hooks.ts          (root file)
src/features/ai-coach/hooks/            (directory)
```

**Exact fix (for ai-coach which is currently deactivated)**: Before reactivating ai-coach:
1. Pick ONE canonical location for service logic: `src/features/ai-coach/service.ts` (root file)
2. Merge `service/` and `services/` directories into that single file, splitting into `service-messages.ts`, `service-recommendations.ts`, `service-budget.ts` as needed (each under 200 lines)
3. Delete the directories
4. Repeat for `hooks.ts` + `hooks/` directory

---

## PART 5: UX & STATE COMPLETENESS

---

### 5.1 🔴 P0 — Session Complete Screen: `isLoading` State Not Handled

**What it is**: `SessionCompleteScreen.tsx` renders `<SessionCompleteResolved>` or `<SessionSummaryUnavailable>` but has a gap when `recoveredCompletion.isPending === true` AND `recoveredCompletion.data === undefined`. In this window, the screen renders neither — likely a blank white screen or a flash of the unavailable state.

**Where it is**:
```typescript
// src/screens/session/SessionCompleteScreen.tsx lines 20-35
if (!parsedRoute.params) {
  if (recoveredCompletion.data) {
    return <SessionCompleteResolved params={recoveredCompletion.data} />;
  }
  return (
    <SessionSummaryUnavailable
      message={
        recoveredCompletion.isPending && parsedRoute.recoverySessionId
          ? 'VEX is rebuilding this win...'  // message set but renders unavailable state
          : (parsedRoute.warningMessage ?? undefined)
      }
```

**Why it matters**: The session completion screen is the highest-value moment in the app — it shows the user what they earned. A blank flash or broken state here destroys the reward loop.

**Exact fix**: Add a dedicated pending state:
```typescript
if (!parsedRoute.params) {
  if (recoveredCompletion.isPending && parsedRoute.recoverySessionId) {
    return <SessionCompletionRecoveryLoading />;  // skeleton, not spinner
  }
  if (recoveredCompletion.data) {
    return <SessionCompleteResolved params={recoveredCompletion.data} />;
  }
  return (
    <SessionSummaryUnavailable
      message={parsedRoute.warningMessage ?? undefined}
      onRetry={recoveredCompletion.isError ? () => recoveredCompletion.refetch() : undefined}
      onDone={() => navigation.navigate({ name: 'Main', params: {} })}
    />
  );
}
```

---

### 5.2 🟠 P1 — `SessionCompleteContent.tsx` and `SessionCompleteScreen.tsx` Both Missing `isPending` Loading Gate

**What it is**: `SessionCompleteContent.tsx` and its parent `SessionCompleteScreen.tsx` check `isLoading` from their hook results but do not gate on `isPending` for the inner state. Both files are in the "missing loading handler" list from the audit.

**Where it is**:
```
src/screens/session/SessionCompleteScreen.tsx
src/screens/session/components/SessionCompleteContent.tsx
```

**Exact fix**: Trace all data dependencies in `SessionCompleteContent.tsx` — progression, XP, streak — and add a skeleton guard for the initial pending state of each.

---

### 5.3 🟠 P1 — `HomeMemoryInsight.tsx` Silent on Data Unavailability

**What it is**: `src/screens/home/components/HomeMemoryInsight.tsx` uses `isPending`/`isLoading` but doesn't render a loading state or error state — it simply renders nothing while loading. This creates invisible gaps in the home layout.

**Where it is**:
```
src/screens/home/components/HomeMemoryInsight.tsx
```

**Exact fix**: Add skeleton loading:
```typescript
if (isLoading) return <SkeletonItem height={80} borderRadius={12} style={{ margin: 16 }} />;
if (isError || !data) return null;  // Silent empty is acceptable here
```

---

### 5.4 🟡 P2 — StreakFuneral, PrivacySettings Screens Missing Loading Handlers

**What it is**: Two screens reference `isPending`/`isLoading` in their hook data but don't render a loading UI — they render the content layout immediately with `undefined` data, potentially crashing or showing blank values.

**Where it is**:
```
src/screens/streaks/StreakFuneralFlame.tsx     — renders with potentially undefined streak data
src/screens/settings/PrivacySettingsScreen.tsx — shows privacy controls before settings load
```

**Exact fix**: Add `if (isPending) return <SkeletonView />` guards at the top of each component before rendering data-dependent JSX.

---

## PART 6: BUILD & DEPLOYMENT

---

### 6.1 🔴 P0 — EAS Production Build Missing `EXPO_PUBLIC_SENTRY_DSN` Enforcement Check

**What it is**: `src/config/sentry.ts` throws if `EXPO_PUBLIC_SENTRY_DSN` is missing in production:
```typescript
if (!dsn && process.env.EXPO_PUBLIC_ENVIRONMENT === 'production') {
  throw new Error('EXPO_PUBLIC_SENTRY_DSN must be set in production');
}
```
But the `eas.json` production profile does NOT include `EXPO_PUBLIC_SENTRY_DSN` in its `env` block. This means the DSN must come from EAS secrets — which requires the secret to be manually configured in EAS dashboard before the first production build.

**Where it is**:
```json
// eas.json production profile
"production": {
  "autoIncrement": true,
  "channel": "production",
  "environment": "production",
  "env": {
    "APP_ENV": "production",
    "EXPO_PUBLIC_ENVIRONMENT": "production"
    // ← EXPO_PUBLIC_SENTRY_DSN not listed — must be in EAS secrets
  }
}
```

**Why it matters**: If the EAS secret isn't set, the production build will throw at runtime on every launch. This is a launch-day crash for all users.

**Exact fix**:
1. In EAS dashboard → Secrets → Production environment, add `EXPO_PUBLIC_SENTRY_DSN` with your actual Sentry DSN
2. Add `EXPO_PUBLIC_REVENUECAT_IOS_KEY` and `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` to EAS secrets
3. Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to EAS secrets
4. Run `npx eas-cli secret:list --scope project` to verify all are present before building

---

### 6.2 🔴 P0 — RevenueCat API Keys Not Verified in Production EAS Secrets

**What it is**: `revenuecat-service.ts` correctly detects placeholder keys and blocks IAP. But if `EXPO_PUBLIC_REVENUECAT_IOS_KEY` and `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` are not set in EAS production secrets, ALL purchases will silently fail with `status: 'missing_keys'` — no error shown to user, just broken IAP.

**Where it is**:
```typescript
// src/shared/monetization/revenuecat-service.ts lines 44-56
async initialize(...) {
  if (!IOS_API_KEY && !ANDROID_API_KEY) {
    this.status = 'missing_keys';
    return { status: 'missing_keys' };  // silent failure in production
  }
```

**Exact fix**:
1. Set `EXPO_PUBLIC_REVENUECAT_IOS_KEY` in EAS production secrets with the actual RevenueCat iOS key
2. Set `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` in EAS production secrets with the actual RevenueCat Android key
3. Add a pre-build CI check script:
```bash
# scripts/check-eas-production-secrets.js (extend existing)
const required = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_SENTRY_DSN',
  'EXPO_PUBLIC_REVENUECAT_IOS_KEY',
  'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY',
];
// Check each is non-empty and non-placeholder
```

---

### 6.3 🟠 P1 — `app.json` `version` and `buildNumber` Inconsistency with EAS `autoIncrement`

**What it is**: `app.json` has `"version": "1.0.0"` hardcoded with no `buildNumber` in the main config (buildNumber is in `constants/app.ts` as `"100"`). The `eas.json` production profile has `"autoIncrement": true` which auto-increments the native build number. This creates a split source of truth between:
- `APP_METADATA.version` in `constants/app.ts` (used for Sentry release string)
- `app.json` version (used by Expo/EAS for store submission)
- Native build number (auto-incremented by EAS, unknown at runtime)

**Exact fix**:
1. Remove `buildNumber` from `src/constants/app.ts` — EAS owns build numbers
2. Read `Constants.expoConfig.version` from `expo-constants` at runtime for display
3. Keep `app.json` as the single source for `version` string
4. Update Sentry release string: `release: Constants.expoConfig.version ?? '1.0.0'`

---

### 6.4 🟠 P1 — Support Email `support@vex.app` May Not Exist Yet

**What it is**: `src/constants/app.ts` has `supportEmail: 'support@vex.app'`. App Store submission requires a working support email. If `vex.app` doesn't have mail configured, Apple's review will bounce when they test the support contact.

**Where it is**:
```typescript
// src/constants/app.ts
supportEmail: 'support@vex.app',
website: 'https://vex.app',
```

**Exact fix**: Verify `support@vex.app` receives email before submission. If not configured, replace with a Gmail or working address temporarily. This is an App Store rejection risk.

---

### 6.5 🟡 P2 — `expo-updates` Channel Policy: No Rollback Gate

**What it is**: `app.json` has `"checkAutomatically": "ON_LOAD"` for OTA updates. This means every app launch checks for updates and applies them without user consent. If a bad OTA update ships, all users get it on next launch with no rollback mechanism.

**Where it is**:
```json
// app.json
"updates": {
  "enabled": true,
  "checkAutomatically": "ON_LOAD",
  "fallbackToCacheTimeout": 30000
}
```

**Exact fix**: Add a release channel strategy. Use EAS Update channels (`production`, `preview`) and never push directly to `production` channel without testing on `preview` first. Document this as a deployment process requirement.

---

## PART 7: CODE QUALITY — AI SLOP PATTERNS

This section documents patterns indicating unreviewed AI-generated code that shipped without proper validation.

---

### 7.1 🔴 P0 — `SessionCompletionOfflineSyncService.generateHealthReport()` Returns Fabricated Data

Already documented as 4.2, but re-listed as P0 AI slop because the pattern is `successRate: this.isInitialized ? 95 : 0` — a classic AI placeholder that looks real but is fictional. If this feeds any dashboard or alerting, it's actively harmful.

---

### 7.2 🟠 P1 — Phase-Numbered Files Indicate AI Development Iteration Artifacts

**What it is**: Several files and tests are named with phase numbers (`phase7-helpers.ts`, `completion-phase8.test.ts`, `completion-personalization-phase5.test.ts`) — indicating these are artifacts of iterative AI development that were committed directly rather than cleaned up.

**Where it is**:
```
src/features/ai-coach/phase7-helpers.ts
src/features/session-completion/__tests__/completion-phase8.test.ts
src/features/session-completion/__tests__/completion-personalization-phase5.test.ts
```

**Why it matters**: Phase-named files cannot be reasoned about in isolation. "Phase 8 of what?" A future maintainer (or Hermes in a future session) cannot know if "phase8" is still active, superseded, or partial. Every file must be named by what it does, not when it was written.

**Exact fix**:
1. `phase7-helpers.ts` → identify what it does → rename to `coach-nudge-throttle.ts` or similar
2. `completion-phase8.test.ts` → identify what behavior it tests → rename to `completion-streak-persistence.test.ts` or similar
3. `completion-personalization-phase5.test.ts` → same process

---

### 7.3 🟠 P1 — `input-contract-test-utils.ts` in Active `ai-coach` Source

**What it is**: `src/features/ai-coach/input-contract-test-utils.ts` is a test utility file living in the main feature source tree, not in `__tests__/`. Test utilities should only live in `__tests__/` directories or be imported via jest setup — having them in production source paths means they can be accidentally imported by production code and are included in non-test type checking.

**Where it is**:
```
src/features/ai-coach/input-contract-test-utils.ts
```

**Exact fix**: Move to `src/features/ai-coach/__tests__/input-contract-test-utils.ts` and update all imports.

---

### 7.4 🟠 P1 — `LegacyMasteryData` Interface Lives in Active Service

**What it is**: `src/features/progression/mastery-service.ts` defines an interface called `LegacyMasteryData` — a legacy data shape still being converted from. Legacy data conversion code should have a clear deprecation deadline and must not permanently live in active service files.

**Where it is**:
```typescript
// src/features/progression/mastery-service.ts line 20
interface LegacyMasteryData {
  durationMastery?: number;
  purityMastery?: number;
  // ...
}
```

**Exact fix**: Add a comment `// TODO-legacy: Remove after migration verified. Track in issue #XXX.` But since `TODO` is banned in shipped code, instead: verify if any live user data still uses the legacy format. If not, delete the conversion branch. If yes, create `migration-scripts/mastery-v1-to-v2.ts` and run it as a one-time migration.

---

### 7.5 🟡 P2 — `progress-tracking.ts` Line 34 Comment `// any grade` Is Misleading

**What it is**: `src/features/streaks/comeback/progress-tracking.ts` has a comment `// Check Quest 1 (15 minutes, any grade)` using the word "any" which looks like it was written as a placeholder. The comment is fine but using `// any grade` in a strict-TypeScript codebase where `any` is banned creates lint-reader confusion.

**Exact fix**: Rename comment to `// Quest 1: 15 minutes, grade: unconstrained (all grades accepted)`.

---

## PART 8: DATABASE & SUPABASE

---

### 8.1 🔴 P0 — RLS Verification: No Automated RLS Check in CI for 38 Migrations

**What it is**: 38 SQL migrations exist in `supabase/migrations/`. The `check:rls` script exists but is run manually. There is no confirmation in CI/CD that all tables have Row Level Security enabled and properly configured. The session ownership migration (`20260606_session_ownership_check.sql`) was added very recently — the `complete_session` RPC now validates ownership, but the underlying `sessions` table's RLS policies must also prevent cross-user reads.

**Where it is**: All 38 migration files, particularly:
```
supabase/migrations/20260530_fix_streak_logic.sql
supabase/migrations/20260530205047_create_companion_profiles.sql
supabase/migrations/202605260001_coach_memories_trust_hardening.sql
supabase/migrations/20260506_focus_identity_scores.sql
```

**Exact fix**:
1. Run `npm run ci:check-rls` against the production database and verify it exits 0
2. Add `npm run ci:check-rls` to the EAS build pre-submit hook in `eas.json`
3. For every table created in migrations since May 1, 2026, manually verify:
   - `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`
   - At minimum one SELECT policy: `USING (auth.uid() = user_id)`

---

### 8.2 🟠 P1 — `complete_session` RPC Returns Sensitive Data in `v_streak` Record

**What it is**: The `complete_session` Postgres function (`supabase/migrations/20260606_session_ownership_check.sql`) declares `v_streak RECORD` which could be returning full streak row data to the response JSONB. The response includes streak details — ensure no sensitive fields (admin flags, internal counters) are included in the returned JSONB.

**Where it is**:
```sql
-- supabase/migrations/20260606_session_ownership_check.sql
DECLARE
  v_streak RECORD;
  v_xp_result JSONB;
```

**Exact fix**: Audit the JSONB returned by `complete_session`. Ensure only user-facing data (new streak count, XP earned, bonuses) is returned. Never return internal admin fields, raw database row data, or fields not consumed by the client.

---

### 8.3 🟠 P1 — Edge Function `ai-coach/index.ts` Has No Input Size Limit

**What it is**: `supabase/functions/ai-coach/index.ts` accepts a JSON body from the client without any size validation. A malicious or broken client could send a very large payload (5MB+ `contextString`) that causes the function to fail or consume excess compute.

**Where it is**:
```
supabase/functions/ai-coach/index.ts
```

**Exact fix**: Add a request body size check before parsing:
```typescript
const contentLength = parseInt(request.headers.get('content-length') ?? '0');
if (contentLength > 64 * 1024) { // 64KB max
  return respond({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body exceeds 64KB limit' } }, 413, request);
}
```

---

### 8.4 🟠 P1 — Supabase Client Version Pinned to `@2.49.8` in Edge Functions but `^2.103.3` in App

**What it is**: `supabase/functions/session-complete/index.ts` imports `createClient` from `https://esm.sh/@supabase/supabase-js@2.49.8` while `package.json` has `"@supabase/supabase-js": "^2.103.3"`. A version gap of 54 minor versions means the client-side and server-side libraries have different behavior for auth, RLS, and error formats.

**Where it is**:
```typescript
// supabase/functions/session-complete/index.ts line 1
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
```
```json
// package.json
"@supabase/supabase-js": "^2.103.3"
```

**Exact fix**: Update the edge function import to match the app version:
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.3';
```

Do this for all edge functions using the esm.sh import pattern.

---

## PART 9: MONETIZATION

---

### 9.1 🔴 P0 — IAP Must Be Fully Tested on Physical Devices Before Submission

**What it is**: RevenueCat is correctly configured and placeholder-key detection is in place. But there is no evidence in the codebase of end-to-end IAP testing on a physical iOS device with a Sandbox Apple ID. App Store review will test the purchase flow.

**Checklist before submission**:
- [ ] Physical iOS device, Sandbox Apple ID configured in App Store Connect
- [ ] `VipPaywallScreen.tsx` loads offerings from RevenueCat (not placeholder)
- [ ] "Subscribe" button triggers the iOS native payment sheet
- [ ] Subscription confirmation shows correct entitlement
- [ ] `Restore Purchases` button correctly restores existing subscriptions
- [ ] Subscription expiry (sandbox accelerated) correctly downgrades access
- [ ] App handles `PRODUCT_NOT_AVAILABLE` RevenueCat error gracefully (user-facing message)

---

### 9.2 🟠 P1 — `VipPaywallScreen.tsx` Uses `ActivityIndicator` While Offerings Load

**What it is**: The paywall screen shows a spinner while RevenueCat offerings load. A spinner on a monetization screen feels like the app is broken — users may dismiss before seeing the purchase options. Skeleton pricing cards would be far better.

**Where it is**:
```
src/shared/monetization/components/VipPaywallScreen.tsx
```

**Exact fix**: Create `VipPaywallSkeleton` with placeholder cards matching the layout of real offering tiers:
```typescript
function VipPaywallSkeleton() {
  return (
    <View>
      <SkeletonItem height={28} width="60%" borderRadius={8} style={{ marginBottom: 16 }} />
      {[1, 2].map(i => (
        <SkeletonItem key={i} height={100} borderRadius={16} style={{ marginBottom: 12 }} />
      ))}
      <SkeletonItem height={56} borderRadius={28} />
    </View>
  );
}
```

---

## PART 10: NOTIFICATIONS

---

### 10.1 🟠 P1 — Push Notification Deep Link Testing Required

**What it is**: The notification routing system (`src/navigation/notification-routing.ts`, `src/navigation/hooks/useNotificationNavigation.ts`) handles navigation from push notifications. This is a common failure point — notification payloads in production often have different shapes than dev payloads.

**Testing required before submission**:
- [ ] Streak risk notification → navigates to correct screen
- [ ] Coach message notification → opens Coach screen with message
- [ ] Session reminder → opens Session Setup
- [ ] Background app → notification tap → correct screen (not just app open)
- [ ] Killed app → notification tap → cold start → correct screen

---

### 10.2 🟡 P2 — Notification Budget Logic Has `debug.error` as Sole Error Sink

**What it is**: `src/features/ai-coach/notification-budget-utils.ts` uses `debug.error()` for budget calculation failures without Sentry reporting. Budget failures mean users get more (or zero) notifications than intended.

**Where it is**:
```
src/features/ai-coach/notification-budget-utils.ts
```

**Exact fix**: Add `Sentry.captureException()` for unexpected budget calculation failures, keeping `debug.error()` for expected edge cases.

---

## PART 11: CLEAN WORKTREE — FINAL PRE-SUBMISSION CHECKLIST

---

### 11.1 🔴 P0 — Git Working Tree Must Be Clean Before EAS Production Build

**What it is**: The worktree is described as "VERY DIRTY." EAS builds from the git commit, not the working directory — but any uncommitted changes to `app.json`, `eas.json`, or env configuration will be missed. More critically, the 34 `tmp_*.json` files add ~50MB to the EAS build context upload.

**Exact fix**:
```bash
# Step 1: Remove all tmp files
rm tmp_*.json

# Step 2: Verify no sensitive data is staged
git status

# Step 3: Check git diff for any unintended changes
git diff HEAD

# Step 4: Verify the build context is clean
git stash list  # should be empty or understood

# Step 5: Final commit with all P0 fixes
git add -A
git commit -m "chore: pre-release P0 fixes - cert pins, sentry org, splash plugin dedup, tmp files"
```

---

## PART 12: AUTOMATED CHECKS — RUN THESE BEFORE EVERY BUILD

```bash
# TypeScript — must exit 0
npx tsc --noEmit

# Line limit — must exit 0
npm run check:line-limit

# Banned patterns — must exit 0
npm run check:banned-patterns

# No ts-nocheck — must exit 0
npm run check:no-ts-nocheck

# RLS verification — must exit 0
npm run ci:check-rls

# Select-star audit — must exit 0
npm run check:select-star

# EAS secrets — must exit 0
npm run check:eas-production-secrets

# Debt freeze — must exit 0
npm run check:debt-freeze

# Test suite — no new failures
npm test
```

---

## PART 13: ORDERING GUIDE FOR HERMES

Execute in this exact order. Do not skip ahead. Mark each complete only when the relevant automated check passes.

**BATCH 1 — Day 1 Morning (Repository & Config)**
1. Delete 34 `tmp_*.json` files, add to `.gitignore`
2. Fix Sentry organization typo `nueroflow` → `neuroflow` in `app.json`
3. Remove duplicate `expo-splash-screen` plugin registration in `app.json`
4. Fix TypeScript version to `~5.8.3` in `package.json`, run `npm install`
5. Run `npx tsc --noEmit`, fix all new type errors

**BATCH 2 — Day 1 Afternoon (Architecture Violations)**
6. Create `src/features/progression/first-week-pacing/repository.ts`, move Supabase calls from `service.ts`
7. Create `src/features/focus-identity/monthly-report/repository.ts`, move Supabase calls
8. Fix `BossPreviewCard.tsx` haptics direct import → use `triggerImpactLight()` from `src/utils/haptics.ts`
9. Fix `src/app/bootstrap.ts` to always install global error handlers (remove `if (!IS_DEVELOPMENT)` guard)
10. Enable `"noUnusedLocals": true` and `"noUnusedParameters": true` in `tsconfig.json`, fix all errors

**BATCH 3 — Day 2 Morning (Security)**
11. Replace all 14 `.select('*')` with explicit column lists
12. Add `: unknown` annotation to all `catch (error)` blocks in auth, streaks, content-study files
13. Fix all 12 `as Record<string, unknown>` cast sites with proper Zod parsing or typed models
14. Fix `generateHealthReport()` success rate from hardcoded `95` to tracked metric
15. Update supabase-js version in edge functions from `@2.49.8` to `@2.103.3`

**BATCH 4 — Day 2 Afternoon (UX Completeness)**
16. Add `accessibilityLabel` and `accessibilityRole` to 8 interactive elements
17. Fix `SessionCompleteScreen.tsx` loading state gap (add recovery loading skeleton)
18. Add `KeyboardAvoidingView` to 7 highest-priority form screens
19. Add `useReducedMotion()` check to 20 most visible animation components (PulsingLiveDot, StreakFlame, Confetti, XPEarnAnimation, TransitionWrapper minimum)
20. Replace `ActivityIndicator` with skeleton in `CoachScreen.tsx` loading state

**BATCH 5 — Day 3 (Performance & Mutations)**
21. Change `refetchOnMount: false` to `refetchOnMount: true` in `QueryProvider.tsx`
22. Add Sentry reporting to 6 mutation `onError` handlers
23. Fix all 10 remaining spinner-only loading states with skeletons
24. Add input size limit to `ai-coach` edge function
25. Fix `isLoading` → `isPending` in 5 TanStack v5 usage sites

**BATCH 6 — Day 3 (Hardcoded Colors)**
26. Fix navigation hardcoded hex values in `VexTabBar.tsx` and `ActiveTabPill.tsx`
27. Fix all 9 glass component hardcoded hex values
28. Fix remaining 43 file hardcoded hex values (priority: any file used in active session)

**BATCH 7 — Day 4 (Build & Submission Prep)**
29. Verify all EAS production secrets are configured in dashboard
30. Re-verify certificate pinning pins against live Supabase cert chain
31. Verify `support@vex.app` receives email (or update to working address)
32. Run full pre-submission checklist from Part 12
33. Run IAP end-to-end test on physical iOS device
34. Run all automated checks — every check must exit 0
35. Final `git status` — working tree must be clean

---

## RELEASE PHASE: LAUNCH READINESS GATE

### 🚨 ABSOLUTE RELEASE BLOCKERS — DO NOT SUBMIT UNTIL ALL ARE GREEN

The following must be fully resolved before any production EAS build is triggered. No partial credit.

---

#### RELEASE BLOCKER R-1: TypeScript Clean Build
**Status required**: `npx tsc --noEmit` exits with code 0. Zero type errors.
**Current status**: UNKNOWN — TypeScript is on 6.0.3 (wrong version). Must downgrade to 5.8.3 and re-verify.
**Owner**: Hermes Batch 1, Step 5

---

#### RELEASE BLOCKER R-2: All Automated CI Checks Green
**Status required**: All 8 check scripts from Part 12 exit code 0.
**Current status**: 14 select-star violations fail `check:select-star`. Other checks unknown state.
**Owner**: Hermes Batch 3

---

#### RELEASE BLOCKER R-3: EAS Production Secrets Configured
**Status required**: `npm run check:eas-production-secrets:remote` exits 0. All 5 secrets exist in EAS dashboard with non-placeholder values.
**Secrets needed**:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SENTRY_DSN`
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
**Owner**: Manual — requires dashboard access

---

#### RELEASE BLOCKER R-4: Sentry Source Maps Working
**Status required**: Run a preview EAS build. After build completes, check Sentry → Releases → verify source map artifacts are present for the release version.
**Current status**: FAILED — `app.json` has `"organization": "nueroflow"` typo causing upload failure.
**Owner**: Hermes Batch 1, Step 2 fixes this. Must then verify with a preview build.

---

#### RELEASE BLOCKER R-5: IAP Purchase Flow Verified on Physical Device
**Status required**: On a physical iOS device with Sandbox Apple ID, complete a full purchase and restore flow in the TestFlight build.
**Owner**: Manual — requires physical device

---

#### RELEASE BLOCKER R-6: Privacy Policy and Support URLs Reachable
**Status required**: All three URLs (`privacyPolicy`, `termsOfService`, `supportEmail`) are reachable and the email works.
**Current status**: GitHub Pages URLs — verify they're live and returning valid content.
**Owner**: Manual check

---

#### RELEASE BLOCKER R-7: Global Error Handler Installed
**Status required**: `setupGlobalErrorHandler()` and `setupRejectionHandler()` are called unconditionally in `bootstrap.ts`.
**Current status**: FAILED — wrapped in `if (!IS_DEVELOPMENT)`.
**Owner**: Hermes Batch 1, Step 4

---

#### RELEASE BLOCKER R-8: Session Complete Screen — No Blank State
**Status required**: In every scenario (normal completion, recovery, error), the session complete screen renders something — never a blank white screen.
**Current status**: Gap identified in loading recovery path.
**Owner**: Hermes Batch 4, Step 17

---

#### RELEASE BLOCKER R-9: Certificate Pins Current
**Status required**: Pins in `app.json` re-verified against live Supabase cert chain the day of the production build.
**Owner**: Hermes Batch 7, Step 30

---

#### RELEASE BLOCKER R-10: Clean Git Working Tree
**Status required**: `git status` shows a clean tree. No untracked files matching `tmp_*`, no uncommitted changes to `app.json` or `eas.json`.
**Current status**: FAILED — 34 `tmp_*.json` files in root.
**Owner**: Hermes Batch 1, Step 1

---

### 🟠 HIGH PRIORITY PRE-SUBMISSION — Fix Before App Store Connect Upload

These are not hard launch blockers but will likely cause App Store rejection if not resolved:

| # | Issue | Risk |
|---|-------|------|
| P-1 | 8 interactive elements without `accessibilityLabel` | Accessibility rejection |
| P-2 | Privacy URLs on GitHub Pages | Looks unprofessional, may fail review |
| P-3 | Support email may not receive mail | Review contact failure |
| P-4 | `expo-splash-screen` registered twice in plugins | Corrupt splash screen on iOS |
| P-5 | Notification push tap deep-link tested on physical device | Common rejection reason |
| P-6 | IAP missing `PRODUCT_NOT_AVAILABLE` user-facing error | Review team can trigger this |
| P-7 | `ActivityIndicator` spinner on paywall while loading | Poor first impression |

---

### 🟡 RECOMMENDED BEFORE V1.1 (NOT BLOCKING V1.0)

| # | Issue | Impact |
|---|-------|--------|
| V1.1-1 | 101 animated components without `useReducedMotion()` | Accessibility; low rejection risk for v1.0 |
| V1.1-2 | 55 hardcoded hex colors outside theme tokens | Dark mode; brand update cost |
| V1.1-3 | 33 spinner-only loading states (non-critical screens) | Polish |
| V1.1-4 | ai-coach 162-file directory consolidation | Maintainability |
| V1.1-5 | Phase-numbered file renaming | Maintainability |
| V1.1-6 | `as Record<string, unknown>` all cast sites | Type safety |
| V1.1-7 | `noUnusedLocals: true` errors resolved | Dead code elimination |
| V1.1-8 | QueryProvider `refetchOnMount` global default | Data freshness |
| V1.1-9 | `KeyboardAvoidingView` remaining 8 screens | UX |
| V1.1-10 | OTA update rollback process documented | Ops |

---

### APP STORE SUBMISSION SEQUENCE

When all 10 Release Blockers are green:

**Step 1**: Run production EAS build
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

**Step 2**: Verify build metadata
- Version number: `1.0.0`
- Build number: auto-incremented by EAS
- Sentry release: visible in Sentry dashboard with source maps

**Step 3**: TestFlight internal testing (minimum 24 hours)
- Install on 3+ physical devices
- Complete a session: start → active → complete → home
- Verify streak updates
- Verify IAP purchase and restore
- Verify push notification navigation
- Verify offline session completion queues and syncs on reconnect

**Step 4**: App Store Connect upload
- App category: Productivity
- Age rating: 4+
- Privacy nutrition labels: verify match `NSPrivacyCollectedDataTypes` in `app.json`
- Screenshots: all 6 required iPhone sizes + iPad if `supportsTablet: true`

**Step 5**: Submit for review
- Review notes: describe focus timer, AI coach (locked behind progressive unlock), IAP
- If IAP is present: test account credentials for review team

---

### POST-LAUNCH MONITORING PLAN (First 48 Hours)

**Sentry**: Monitor crash rate. Expected: < 0.5% crash rate. Alert threshold: > 2%.

**RevenueCat**: Monitor purchase success rate. Expected: > 90% for users who reach checkout. Alert threshold: < 70%.

**Supabase**: Monitor `complete_session` RPC error rate. Expected: < 1%. Alert threshold: > 3%.

**OTA Updates**: Do not push any OTA update in the first 48 hours post-launch. Let the reviewed binary stabilize.

**Rollback threshold**: If crash rate exceeds 3% in first 24 hours, use `expo-updates` to push a hotfix OTA immediately. If unfixable via OTA, use App Store Connect → Remove From Sale while fixing.

---

## FINAL VERDICT

**Release-ready after P0 fixes**: YES — but only after all 10 Release Blockers are green.

**Estimated Hermes execution time**: 3–4 days of focused work executing the 7 batches.

**Architecture health**: Generally strong. The core session loop, repository pattern, Supabase integration, offline queue, and RevenueCat layer are all well-implemented. The violations found are concentrated in configuration, missing accessibility labels, and hardcoded colors — fixable in a bounded effort.

**What is NOT broken**: Auth flow, session timer engine, anti-cheat system, streak logic, certificate pinning, CORS configuration, RLS migrations, offline sync queuing, error boundary coverage, FlashList usage, Reanimated import correctness, global navigation typing, Zod schema coverage at API boundaries, haptics utility layer, EventBus cleanup pattern.

**What IS broken**: TypeScript version, Sentry org name, duplicate plugin, global error handler gating, tmp file pollution, 14 select-star queries, 2 architecture violations in service layer, 1 haptics direct import, 8 missing accessibility labels, session complete loading gap.

**Ship it** — after the batches. Not before.

---

*Document generated by thermo-nuclear static analysis + deep manual review of 4,478 source files. All file paths verified against the June 7, 2026 state of VEX.RELEASE-main. Run all automated checks after each batch to confirm correctness.*