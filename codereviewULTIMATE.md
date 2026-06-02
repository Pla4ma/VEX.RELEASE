# VEX ULTIMATE CODE REVIEW — RELEASE GATE

> **Generated:** 2026-05-30 | **Scope:** Full production codebase | **Audience:** Hermes overnight execution
> **Codebase:** 4,482 TS/TSX files | **App version:** 1.0.0 | **Stack:** Expo 56 / RN 0.85 / TS 6.0.3

---

## TABLE OF CONTENTS

1. [RELEASE BLOCKERS](#1-release-blockers) — MUST FIX BEFORE ANY DEPLOY
2. [SECURITY](#2-security)
3. [TYPE SAFETY & CAST AUDIT](#3-type-safety--cast-audit)
4. [ARCHITECTURE COMPLIANCE](#4-architecture-compliance)
5. [SUPABASE & DATA LAYER](#5-supabase--data-layer)
6. [REALTIME SUBSCRIPTION LEAKS](#6-realtime-subscription-leaks)
7. [ERROR HANDLING](#7-error-handling)
8. [STATE MANAGEMENT](#8-state-management)
9. [PERFORMANCE](#9-performance)
10. [UI / ACCESSIBILITY](#10-ui--accessibility)
11. [NAVIGATION](#11-navigation)
12. [DESIGN TOKEN VIOLATIONS](#12-design-token-violations)
13. [FILE SIZE VIOLATIONS](#13-file-size-violations)
14. [AI SLOP / DEAD CODE / TECH DEBT](#14-ai-slop--dead-code--tech-debt)
15. [DEPENDENCY & CONFIG AUDIT](#15-dependency--config-audit)
16. [TEST COVERAGE GAPS](#16-test-coverage-gaps)
17. [BUILD & NATIVE CONFIGURATION](#17-build--native-configuration)
18. [APP STORE READINESS](#18-app-store-readiness)
19. [EDGE FUNCTIONS & SERVER-SIDE](#19-edge-functions--server-side)
20. [MEMORY & RESOURCE MANAGEMENT](#20-memory--resource-management)
21. [I18N & TIMEZONE](#21-i18n--timezone)
22. [IMAGE ASSET OPTIMIZATION](#22-image-asset-optimization)
23. [OTA UPDATES & DEPLOYMENT](#23-ota-updates--deployment)
24. [CI/CD PIPELINE](#24-cicd-pipeline)
25. [MONITORING & OBSERVABILITY](#25-monitoring--observability)
26. [RELEASE PHASE — FINAL GATE](#26-release-phase--final-gate)

---

## 1. RELEASE BLOCKERS

These issues MUST be resolved before any production deployment. No exceptions.

### RB-001: credentials.json EXISTS IN WORKSPACE ROOT

**Severity:** CRITICAL | **File:** `credentials.json` (root)

`credentials.json` exists in the workspace root. While `.gitignore` includes it, the file's presence in the working directory is a security risk. If anyone stages it accidentally, secrets leak.

**Fix:**
```
1. Delete credentials.json from the workspace root immediately
2. Verify it was never committed: git log --all -- credentials.json
3. If committed, use git filter-branch or BFG to purge from history
4. Add a pre-commit hook that blocks any file matching *credentials* or *secret*
5. Rotate any keys that were in the file
```

### RB-002: .env.local CONTAINS LIVE SUPABASE URL + ANON KEY + SENTRY DSN + POSTHOG KEY

**Severity:** HIGH | **File:** `.env.local`

The `.env.local` file contains:
- `EXPO_PUBLIC_SUPABASE_URL=https://icnbpjkyupuqzuvwuvbk.supabase.co`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_W_fG4QxH5XiUuxp7uSW9_A_gDYVEov1`
- `EXPO_PUBLIC_SENTRY_DSN=https://c02d42adbcaae587...`
- `EXPO_PUBLIC_POSTHOG_KEY=phc_qBqUpSeWYMR97jQHmxpG2xgSutrXrgzscSt7NgGVNLim`

While these are `EXPO_PUBLIC_` prefixed (meaning they ship to the client), the Supabase project ID in the URL combined with the anon key is all someone needs to start probing your Supabase instance. **Verify RLS is enabled on EVERY table.** The PostHog and Sentry keys are exposed and cannot be rotated without redeployment — they are designed to be public, but verify your PostHog project has IP/domain restrictions if available.

**Fix:**
```
1. Verify RLS is enabled on EVERY table in Supabase dashboard
2. Run: SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN (SELECT relname FROM pg_policy);
3. For any table without RLS: ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
4. Add a Supabase migration that creates a test: every public table must have at least 1 policy
5. Verify PostHog has domain allowlisting enabled
6. Verify Sentry has allowed origins configured
7. Document that EXPO_PUBLIC_ vars are client-visible by design
```

### RB-003: API Client Has Dead Code That Throws on Every Request

**Severity:** CRITICAL | **File:** `src/api/client.ts:144`

The `executeRequest` method in `ApiClient` unconditionally throws:
```typescript
throw new Error('Direct HTTP calls are not allowed. Use Supabase client or a repository layer instead.');
```

This is placed AFTER the headers are built and BEFORE the fetch call. This means the `ApiClient` class is ENTIRELY NON-FUNCTIONAL. Every call to `client.get()`, `client.post()`, etc. will throw this error, never reaching the actual HTTP call. The `api-request-handler.ts` has a working implementation that DOES call `fetch()`, but the `client.ts` `ApiClient` class itself is broken.

**Fix:**
```
Option A (RECOMMENDED): Delete the entire ApiClient class from client.ts.
  The working implementation is in api-request-handler.ts via executeRequest().
  The ApiClient class appears to be a dead artifact from an earlier architecture.

Option B: Remove the throw on line 144 and replace it with the actual fetch call
  that exists in api-request-handler.ts. But this creates duplication.

In either case, audit all imports of ApiClient to ensure nothing depends on it.
```

### RB-004: SessionOrchestrator Singleton Never Destroyed on Logout

**Severity:** HIGH | **File:** `src/session/SessionOrchestrator.ts:188`

The module-level `orchestratorInstance` singleton is never destroyed when the user logs out. The `destroy()` method exists on the class but is never called during the auth logout flow in `authStoreActions.ts`. This means:
- Timer engine keeps running after logout
- Anti-cheat engine stays active
- Event emitter remains attached
- Session data persists in memory for a different user

**Fix:**
```
In src/store/authStoreIntegrations.ts, add:
  import { getSessionOrchestrator } from '../session/SessionOrchestrator';
  
  export function deinitializeServicesAfterLogout(): void {
    try {
      revenueCatService.clearUserId();
    } catch (error) {
      debug.error('[AuthStore] Failed to clear RevenueCat user ID:', error);
    }
    // NEW:
    try {
      const orchestrator = getSessionOrchestrator();
      orchestrator.destroy();
    } catch {
      // Orchestrator may not exist — safe to ignore
    }
    
    integrationsInitializedForUserId = null;
  }

Also reset the singleton by exporting a resetSessionOrchestrator function
and calling it, or setting orchestratorInstance = null.
```

### RB-005: PredictiveInterventionEngine Runs setInterval on All Users Without Cleanup Guarantee

**Severity:** HIGH | **File:** `src/features/ai-coach/PredictiveInterventionEngine.ts:38`

The `start()` method sets a 1-hour interval calling `analyzeAllUsers()`, but:
1. `analyzeAllUsers()` is a no-op stub: `debug.info('Would analyze all users')` — dead code that does nothing
2. The engine is a singleton that's never stopped on logout
3. The in-memory Maps (`predictions`, `patterns`, `interventions`) grow unbounded

**Fix:**
```
1. Either implement analyzeAllUsers() or remove the entire engine
2. If keeping it, add destroy() call to logout integrations
3. Add Map size limits (LRU or max entries)
4. The `start()` call must be gated behind a feature flag check AND only called when a user is authenticated
5. Add the engine to deinitializeServicesAfterLogout()
```

### RB-006: Web Platform Uses sessionStorage for Auth Tokens — Cleared on Tab Close

**Severity:** HIGH | **File:** `src/persistence/SecureStorage.ts:39`

On web, `SecureStorage` delegates to `sessionStorage`, which is cleared when the browser tab closes. This means:
- Users are logged out every time they close the tab
- The Supabase auth session is stored in sessionStorage (via the adapter)
- No persistence across browser sessions on web

**Fix:**
```
For web, use localStorage with encryption for auth tokens instead of sessionStorage.
The current approach of sessionStorage was chosen for security (tab-scoped), but
it fundamentally breaks auth persistence. Use an encrypted localStorage approach:

1. On web, use localStorage with AES encryption (via a device-bound key or derive key from origin)
2. OR use Supabase's built-in localStorage adapter for web
3. At minimum, document this as a known limitation if web is not a target platform
4. If web is not a release platform, this is lower priority
```

### RB-007: No RLS Verification Script or Test

**Severity:** HIGH | **Scope:** Entire Supabase layer

There is no automated test or CI check that verifies Row Level Security is enabled on every public table. A single table missing RLS means any client with the anon key can read/write all rows.

**Fix:**
```
1. Create a Supabase migration or seed script that queries pg_policy
2. Add a CI step that runs this check and fails if any public table lacks RLS
3. Document the expected policies per table
4. Add a test in src/__tests__/ that verifies the repository layer can't
   access data belonging to a different user
```

---

## 2. SECURITY

### SEC-001: Untyped catch Clauses — 7 Occurrences

**Files:**
- `src/config/sentry.ts:86` — `catch (e)`
- `src/features/content-study/EventEmitter.ts:31` — `catch (e)`
- `src/features/content-study/event-hooks.ts:53` — `catch (e)`
- `src/features/content-study/error-handler.ts:82` — `catch (e)`
- `src/features/content-study/analytics-service.ts:98,110` — `catch (e)` (2x)
- `src/features/monthly-report/__tests__/monthly-report-service.test.ts:99` — `catch (e)`

**Fix:** Replace every `catch (e)` with `catch (e: unknown)` and handle with `e instanceof Error ? e.message : String(e)`.

### SEC-002: content-study Repository Uses globalThis.fetch Directly

**File:** `src/features/content-study/repository.ts:42`

```typescript
const response = await globalThis.fetch(fileUri);
```

The AGENTS.md bans raw `fetch()` — use the existing API client. Additionally, `fileUri` is not validated before being fetched. A malicious file URI scheme could cause unexpected behavior.

**Fix:**
```
1. Validate fileUri starts with expected schemes (file://, content://, or https://)
2. Use the API client or a dedicated file upload helper
3. Add a URL allowlist for fetch targets
```

### SEC-003: api-request-handler.ts Uses Raw fetch()

**File:** `src/api/api-request-handler.ts:91`

This is the ONE legitimate use of `fetch()` in the API infrastructure. However, it's missing:
- No CSRF protection
- No request signing
- No certificate pinning configuration
- The `buildURL` function doesn't validate the endpoint path (could allow path traversal)

**Fix:**
```
1. Add endpoint path validation (must start with /, no .. segments)
2. Configure certificate pinning for production API calls
3. Add request signing via HMAC or similar
4. Document that this is the canonical fetch call site
```

### SEC-004: LoginScreen Has Hardcoded Colors (Not Using Theme Tokens)

**File:** `src/screens/auth/LoginScreen.tsx:121-156`

The GoldCta component has hardcoded hex colors:
- `#E0B870` (background, shadow)
- `#F5D8A0`, `#C49958` (gradient colors)
- `#1A1208` (text color)
- `rgba(255,255,255,0.35)` (shine sweep)

These don't respond to dark/light mode or theme changes. While this is a styled component, the colors should come from `src/theme/tokens/`.

**Fix:** Move these to theme tokens with appropriate semantic names (e.g., `colors.cta.gold.base`, `colors.cta.gold.light`, `colors.cta.gold.dark`).

### SEC-005: Password Length Check Only on Client Side

**File:** `src/features/auth/service.ts:65`

```typescript
if (newPassword.length < 8) {
  return { error: new Error('Password must be at least 8 characters') };
}
```

This check is only on the client. Supabase Auth has its own minimum, but you should verify the Supabase project settings enforce a minimum password length server-side. The `LIMITS.password.max: 128` is also not enforced client-side.

**Fix:**
```
1. Verify Supabase Auth settings enforce min password length
2. Add max length (128) validation on client
3. Add password strength requirements (uppercase, number, special char)
4. Consider using a Zod schema for password validation
```

### SEC-006: Account Deletion Has No Confirmation/Cooldown

**File:** `src/features/account-deletion/repository.ts`

The `deleteCurrentUser` RPC call has no client-side confirmation flow, no cooldown period, and no undo window. If a user taps delete accidentally, their data is gone.

**Fix:**
```
1. Add a confirmation dialog with typed confirmation text
2. Add a 30-day grace period on the server (soft delete, then hard delete)
3. Add a cooldown (e.g., must wait 24h after requesting deletion)
4. Send a confirmation email before deletion proceeds
```

### SEC-007: Economy RPC Calls Lack Client-Side Amount Validation

**File:** `src/features/economy/repository.ts`

The `spendCurrencyRpc` and `grantCurrencyRpc` accept `amount` as a raw number with no validation. Negative amounts, zero, or extremely large numbers could cause issues. While the server-side RPC should validate, the client should too.

**Fix:**
```
Add Zod schema validation before calling RPCs:
  const SpendCurrencyParamsSchema = z.object({
    userId: z.string().uuid(),
    currency: z.enum(['xp', 'coins', 'gems']),
    amount: z.number().positive().max(1000000),
    sink: z.string().min(1),
  });
```

### SEC-008: Supabase Auth Email Enumeration on Login

**File:** `src/features/auth/repository.ts:37-44`

The `signInWithEmail` function returns specific error messages from Supabase that could reveal whether an email exists. The `supabase-auth-credentials.ts` file correctly returns generic "Invalid email or password" messages, but the repository.ts does not.

**Fix:**
```
In repository.ts signInWithEmail, catch the error and return a generic message:
  if (error) {
    return { user: null, error: new Error('Invalid email or password.') };
  }
Same for signUpWithEmail — don't reveal if email is already registered.
```

---

## 3. TYPE SAFETY & CAST AUDIT

### TS-001: 37 Type Casts in settings-builders.ts — All Unvalidated

**File:** `src/features/settings/settings-builders.ts`

Every value from `getValue()` is cast with `as boolean`, `as string`, etc. without any runtime validation. The `getValue` function returns `unknown` (from `?.value ?? defaultValue`), and every cast is an unchecked assertion.

**Fix:**
```
Replace the builder functions with Zod schemas:
  const NotificationPushSchema = z.object({
    enabled: z.boolean().default(true),
    deviceTokens: z.array(z.string()).default([]),
    quietHoursStart: z.number().optional(),
    // ...
  });
Then use schema.parse() instead of `as` casts.
This ensures runtime validation matches compile-time types.
```

### TS-002: repository-insurance.ts Has 24 `as` Casts Without Zod Validation

**File:** `src/features/streaks/repository-insurance.ts:148-185`

The `dbToInsurance`, `dbToGamble`, and `dbToToken` functions cast every field from `Record<string, unknown>` with `as string`, `as number`, `as boolean`, etc. No runtime validation.

**Fix:**
```
Create Zod schemas for each type and use .parse():
  const StreakInsuranceRowSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    streak_days_protected: z.number().int().positive(),
    cost: z.number().nonnegative(),
    purchased_at: z.string(),
    expires_at: z.string(),
    used: z.boolean(),
    used_at: z.string().nullable().optional(),
  });
  type StreakInsuranceRow = z.infer<typeof StreakInsuranceRowSchema>;
Then map from validated data instead of raw unknown.
```

### TS-003: RealtimeSubscriptions Casts Broadcast Payload Without Validation

**File:** `src/services/realtimeSubscriptions.ts:59-63`

```typescript
callback({
  type: payload.event as BroadcastMessage['type'],
  payload: payload.payload,
  senderId: payload.payload?.senderId,
  timestamp: payload.payload?.timestamp || Date.now(),
});
```

The `payload.event` is cast to `BroadcastMessage['type']` without validation. A malformed broadcast could inject unexpected types.

**Fix:**
```
Create a BroadcastMessageSchema and parse:
  const BroadcastMessageSchema = z.object({
    type: z.enum(['activity', 'session_start', ...]),
    payload: z.unknown(),
    senderId: z.string().optional(),
    timestamp: z.number(),
  });
```

### TS-004: edge-function-invoke.ts Casts AIResponse at Fallback Boundary

**File:** `src/shared/ai/edge-function-invoke.ts:85`

```typescript
return { ...base, requestType } as AIResponse;
```

This cast is at the fallback boundary. The comment says "All callers check success: false before accessing typed fields" but this is a contract that could be violated.

**Fix:**
```
Construct a valid AIResponse using the schema:
  return AIResponseSchema.parse({ ...base, requestType });
OR make the success:false case a discriminated union variant that doesn't need a cast.
```

### TS-005: Proxy-Based supabase Export Masks Type Errors

**File:** `src/config/supabase.ts:91`

```typescript
export const supabase = new Proxy({} as SupabaseClient, lazySupabaseHandler);
```

The Proxy forwards all property access dynamically. TypeScript believes `supabase` is a `SupabaseClient`, but at runtime, any property access triggers `getSupabaseClient()`. This means:
- If `getSupabaseClient()` throws (missing config), the error happens at property access time, not at import time
- The Proxy hides whether the client is actually initialized
- `Reflect.get` + `.bind()` breaks some method chains

**Fix:**
```
This is an intentional design decision documented in the file. However:
1. Add a try/catch wrapper in the Proxy handler that throws a clearer error
2. Log a warning when the client is first accessed
3. Consider a "ready" check that components can use
```

### TS-006: UserSchema Uses z.ZodType<User> Instead of z.infer

**File:** `src/features/auth/schemas.ts:62`

```typescript
export const UserSchema: z.ZodType<User> = z.object({...});
```

Using `z.ZodType<User>` instead of inferring from the schema is the correct approach when the type comes from elsewhere, BUT it means the schema and the type can drift apart silently. If the `User` type changes but the schema doesn't, `.parse()` will accept data that doesn't match the type.

**Fix:**
```
Add a compile-time assertion that the schema output matches the type:
  import type { User } from '../../types/models';
  // Verify schema output matches User type:
  type _AssertSchemaMatchesType = z.infer<typeof UserSchema> extends User ? User : never;
This will cause a compile error if they drift.
```

---

## 4. ARCHITECTURE COMPLIANCE

### ARCH-001: Duplicate Auth Implementations — Three Separate Auth Paths

**Files:**
- `src/features/auth/` (feature-standard: repository → service → hooks)
- `src/services/supabase-auth-credentials.ts` (service-layer: direct Supabase calls)
- `src/store/authStoreActions.ts` (store actions calling `supabaseAuth` service)

The `authStoreActions.ts` imports from `../services/supabaseAuth` while `features/auth/hooks.ts` imports from `./service` which imports from `./repository`. These are TWO DIFFERENT auth implementations. The store actions bypass the feature layer entirely.

**Fix:**
```
1. Choose ONE canonical auth path
2. If features/auth/ is the canonical layer, make authStoreActions.ts import from features/auth/service.ts
3. If the store is the canonical layer, delete the features/auth/ duplication
4. The current setup means auth logic changes must be made in TWO places
```

### ARCH-002: Supabase Client Instantiated at Module Top Level in auth/repository.ts

**File:** `src/features/auth/repository.ts:6`

```typescript
const supabase = getSupabaseClient();
```

This calls `getSupabaseClient()` at module import time, which creates the client immediately. The `src/config/supabase.ts` has a lazy Proxy specifically to avoid this, but the repository bypasses it by calling `getSupabaseClient()` directly at the top level.

**Fix:**
```
Replace with the lazy proxy:
  import { supabase } from '../../config/supabase';
  // OR call getSupabaseClient() inside each function
The top-level call defeats the lazy initialization purpose.
```

### ARCH-003: content-study Feature Has Its Own EventEmitter

**File:** `src/features/content-study/EventEmitter.ts`

This feature has a custom EventEmitter instead of using the app's EventBus (`src/events/EventBus.ts`). This is an architectural violation — events should flow through the canonical event system.

**Fix:**
```
1. Migrate content-study events to src/events/EventBus.ts
2. Define event types in src/events/event-definitions/
3. Delete the custom EventEmitter.ts
4. Update all event-hooks.ts and analytics-service.ts references
```

### ARCH-004: Shared Mutation Defaults May Not Invalidate Correctly

**File:** `src/shared/mutation-defaults.ts`

If this file provides default `onError`/`onSuccess` handlers for mutations, verify that every mutation using these defaults also invalidates the correct query keys. AGENTS.md requires: "Every mutation must: invalidate related queries on success."

**Fix:**
```
Audit every useMutation call in the codebase and verify each has:
1. onSuccess that invalidates relevant query keys
2. onError that calls Sentry
3. User-facing error toast (via ToastProvider)
```

### ARCH-005: Economy Repository Exposes getSupabase() Function

**File:** `src/features/economy/repository.ts:7-9`

```typescript
export function getSupabase() {
  return getSupabaseClient();
}
```

This is a pass-through wrapper that adds no value and violates the "no unnecessary abstraction" rule. Every other repository calls `getSupabaseClient()` directly.

**Fix:** Delete the wrapper, call `getSupabaseClient()` directly in the 3 functions that use it.

---

## 5. SUPABASE & DATA LAYER

### SUPA-001: select('*') Used in 40+ Repository Queries

**Scope:** Across 20+ repository files

Using `.select('*')` fetches all columns including ones you don't need. This:
- Increases payload size
- Exposes internal columns (id, created_at, etc.) that must then be filtered
- Makes the query fragile to schema changes (new columns appear automatically)
- Potentially leaks data if a column is added with sensitive info

**Files with most violations:**
- `challenges/repository-user.ts` — 5 occurrences
- `challenges/repository-challenges.ts` — 4 occurrences
- `ai-coach/repository/messages-crud.ts` — 4 occurrences
- `ai-coach/repository/memories-operations.ts` — 4 occurrences

**Fix:**
```
Replace every .select('*') with explicit column lists:
  .select('id, user_id, streak_days_protected, cost, purchased_at, expires_at, used, used_at')
This also acts as documentation of what the query actually uses.
```

### SUPA-002: No RepositoryError in 60%+ of Repository Functions

**Scope:** Most repository files

Only the `economy/`, `focus-contract/`, and `lib/repository/` modules use `RepositoryError`. Most other repositories throw raw `Error` with no operation name, losing debugging context.

**Example:** `src/features/streaks/repository-insurance.ts` throws `throw error` directly from Supabase, losing the operation name.

**Fix:**
```
Standardize on RepositoryError across all repositories:
  if (error) {
    throw new RepositoryError('fetchActiveInsurance', error);
  }
Make RepositoryError the canonical error type for all repository functions.
```

### SUPA-003: withResilience Returns Unvalidated Data

**File:** `src/features/content-study/repository.ts:85-98`

```typescript
const { data, error } = await withResilience(
  getSupabaseClient().from('study_content').select('*')...,
  { operation: 'fetchContentHistoryRecords', fallbackValue: [] },
);
```

`withResilience` can return the `fallbackValue` (empty array) on failure, which is then mapped via `mapContentRow`. If the fallback is returned, `data` is `[]`, which is safe, but the pattern of "silently return empty data on error" can hide real failures.

**Fix:**
```
1. Log when withResilience returns a fallback value (via Sentry breadcrumb)
2. Consider making withResilience return a discriminated union: { data, usedFallback }
3. Never use withResilience for write operations
```

### SUPA-004: Supabase Auth Session Management Gap

**File:** `src/services/supabase-auth-session.ts`

This file manages the auth session state change listener. Verify:
- The listener is set up once and only once
- The listener is cleaned up on logout
- Token refresh errors trigger a logout flow
- Multiple tabs/sessions are handled correctly on web

**Fix:**
```
1. Ensure the session listener calls cleanupPresence() on SIGN_OUT events
2. Ensure token refresh failures redirect to login
3. Test the session listener with expired tokens
```

---

## 6. REALTIME SUBSCRIPTION LEAKS

### RT-001: subscribeToActivity Creates Channel Without Awaiting subscribe()

**File:** `src/services/realtimeSubscriptions.ts:65`

```typescript
channel.subscribe();
```

This calls `.subscribe()` without `await`. The channel may not be ready when messages start flowing. Compare with `subscribeToSquadPresence` in `realtime.ts:121` which correctly uses `await channel.subscribe()`.

**Fix:**
```
Change to: await channel.subscribe();
This is consistent with the other subscribe calls and ensures the channel is ready.
```

### RT-002: subscribeToFeedChanges, subscribeToSquadChanges, subscribeToGuildQuests — Same Issue

**Files:**
- `src/services/realtimeSubscriptions.ts:101`
- `src/services/realtimeSubscriptions.ts:140`
- `src/services/realtimeSubscriptions.ts:172`

All three call `channel.subscribe()` without await.

**Fix:** Change all three to `await channel.subscribe()`.

### RT-003: broadcastActivity Creates Ephemeral Channel With setTimeout Cleanup

**File:** `src/services/realtimeSubscriptions.ts:41-46`

```typescript
setTimeout(() => {
  channelToClean?.unsubscribe();
  if (activeChannels.get(txKey) === channelToClean) {
    activeChannels.delete(txKey);
  }
}, 5_000);
```

This uses a 5-second setTimeout for channel cleanup. If the app backgrounded during those 5 seconds, the timer may not fire (or may fire while the app is backgrounded). The channel could leak.

**Fix:**
```
1. Track the timeout ID and clear it if the app backgrounds
2. Or subscribe to the app state and clean up channels on background
3. Consider using a channel pool instead of creating/destroying per broadcast
```

### RT-004: useSquadChanges and useGuildQuests Have onChange/onQuestUpdate in useEffect Deps

**File:** `src/hooks/useRealtime.ts:156-161, 173-182`

The `onChange` and `onQuestUpdate` callbacks are in the `useEffect` dependency array. If the parent re-renders with a new callback reference (which happens unless the parent memoizes), the effect will unsubscribe and resubscribe on every render.

**Fix:**
```
Use refs for callbacks (like onMessageRef in useActivityBroadcast):
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => {
    const unsubscribe = subscribeToSquadChanges(squadId, (payload) => {
      onChangeRef.current?.(payload);
    });
    return unsubscribe;
  }, [squadId]); // Remove onChange from deps
```

### RT-005: useSquadPresence Has Race Condition on Unmount

**File:** `src/hooks/useRealtime.ts:73-91`

The `subscribe` async function sets `unsubscribe` after the await. If the component unmounts before `subscribeToSquadPresence` resolves, `mounted` is false and `nextUnsubscribe()` is called. But `unsubscribe?.()` in the cleanup also runs, potentially calling unsubscribe twice.

**Fix:**
```
Use a single unsubscribe ref and guard against double-unsubscribe:
  const unsubscribeRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    let cancelled = false;
    subscribeToSquadPresence(squadId, callback).then((unsub) => {
      if (cancelled) { unsub(); return; }
      unsubscribeRef.current = unsub;
    });
    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [squadId]);
```

---

## 7. ERROR HANDLING

### ERR-001: 7 Swallowed Promise Rejections in ActiveSessionContent

**File:** `src/screens/session/ActiveSessionContent.tsx:179-193`

```typescript
actions.retryControlFailure().catch(() => undefined);
actions.handleComplete().catch(() => undefined);
actions.handlePauseResume().catch(() => undefined);
actions.handleAbandon().catch(() => undefined);
```

These catch and discard errors without logging or reporting to Sentry. If a session completion fails, the user sees nothing and the error is lost.

**Fix:**
```
Replace each with:
  .catch((error: unknown) => {
    Sentry.captureException(error, { tags: { feature: 'session-controls' } });
    // Show user-facing toast
  });
```

### ERR-002: RootNavigator init() Error Swallowed

**File:** `src/navigation/RootNavigator.tsx:92`

```typescript
init().catch(() => undefined);
```

The `checkAuth()` call failure is silently discarded. If auth check fails, the user sees no error state and may be stuck.

**Fix:**
```
init().catch((error: unknown) => {
  Sentry.captureException(error, { tags: { feature: 'auth-check' } });
  setIsAuthCheckComplete(true); // Allow navigation to proceed in degraded state
});
```

### ERR-003: onboardingFlow and onboardingCompletion Swallow Errors

**Files:**
- `src/screens/onboarding/hooks/useOnboardingFlow.ts:148,169`
- `src/screens/onboarding/hooks/useOnboardingCompletion.ts:46`

```typescript
triggerHaptic('impactMedium').catch(() => undefined);
finishOnboarding(goal, starterPresetId, message).catch(() => undefined);
```

If `finishOnboarding` fails, the user's onboarding state may be inconsistent. This is a critical flow.

**Fix:**
```
1. finishOnboarding errors MUST be reported and shown to the user
2. haptic errors are non-critical — acceptable to swallow, but log to debug
3. Add error state to the onboarding flow UI
```

### ERR-004: content-study Has 5 Files with catch (e) Without Type

**Files:** `src/features/content-study/{EventEmitter,event-hooks,error-handler,analytics-service}.ts`

These are the untyped catch clauses identified in SEC-001. Beyond the type safety issue, none of them report to Sentry.

**Fix:**
```
Replace each with:
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    captureSilentFailure(error, { feature: 'content-study', operation: '...', type: 'runtime' });
  }
```

### ERR-005: Edge Function invokeAIWithFallback Silently Consumes Quota Error

**File:** `src/shared/ai/edge-function-invoke.ts:153`

```typescript
consumeQuota(userId, category, tokenEstimate).catch(() => {});
```

If `consumeQuota` fails, the quota tracking is lost. The user may exceed their AI quota without being stopped.

**Fix:**
```
1. Log the consumeQuota failure via captureSilentFailure
2. If quota tracking is critical, consider making consumeQuota synchronous or blocking
3. At minimum, track the failure so the next quota check can account for it
```

### ERR-006: stake-service Swallows Errors Returning Null

**File:** `src/features/session-start/stake-service.ts:86-94`

```typescript
fetchActiveEncounter(userId).catch(() => null),
fetchStreak(userId).catch(() => null),
fetchActiveChallengeDetails(userId).catch(() => []),
```

These silently return null/empty on failure. If the fetch fails due to a real error (network, auth), the user sees no encounter, no streak, no challenges — with no indication anything is wrong.

**Fix:**
```
1. Log errors via captureSilentFailure before returning null/[]
2. Consider distinguishing "no data" from "fetch failed"
3. Return a Result type that includes error info so the UI can decide what to show
```

---

## 8. STATE MANAGEMENT

### ST-001: Auth Store Persisted State Only Stores isAuthenticated

**File:** `src/store/authStore.ts:21`

```typescript
partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
```

Only `isAuthenticated` is persisted to MMKV. The `user` object is NOT persisted. On cold start, `isAuthenticated` may be `true` but `user` is `null`. The `checkAuth` flow in `RootNavigator` re-fetches the user, but there's a flash of `user === null` with `isAuthenticated === true` which could cause UI glitches.

**Fix:**
```
1. Also persist user.id (or the full user profile) via partialize
2. OR make the auth check synchronous on cold start by reading from SecureStorage
3. The current approach works if checkAuth is fast, but race conditions exist
```

### ST-002: authStoreActions.loginWithCredentials Duplicates Logic in features/auth/hooks.ts

**File:** `src/store/authStoreActions.ts:76-103` vs `src/features/auth/hooks.ts:59-77`

Both `loginWithCredentials` and `useSignIn` call `signInWithEmail`, set the user, save profile, set Sentry user, and initialize services. These are two implementations of the same flow that can drift.

**Fix:** See ARCH-001 — choose one canonical path.

### ST-003: App Store isOnline Defaults to true

**File:** `src/store/appStore.ts:17`

```typescript
isOnline: true,
```

The default is `true` before NetInfo confirms connectivity. Components checking `isOnline` may briefly think they're online when they're not.

**Fix:**
```
Default to false or null (indicating "unknown"):
  isOnline: false,
  // OR
  isOnline: null as Nullable<boolean>,
Then only set to true when NetInfo confirms.
```

### ST-004: Session State Not in Zustand

The session state is managed by the `SessionOrchestrator` class (singleton pattern) rather than through Zustand or TanStack Query. This means:
- Session state isn't visible to React DevTools
- No built-in persistence
- No automatic re-render optimization
- The orchestrator is a mutable class that components must subscribe to manually

**Fix:**
```
This is a legitimate architectural choice for a complex state machine.
However, consider:
1. Wrapping the orchestrator in a Zustand store for React integration
2. Using useSyncExternalStore to subscribe to orchestrator changes
3. At minimum, ensure all components that read orchestrator state re-render on changes
```

---

## 9. PERFORMANCE

### PERF-001: LoginScreen Creates 5+ Animated Values Per Render

**File:** `src/screens/auth/LoginScreen.tsx`

The LoginScreen uses multiple `Stage` components, each creating `useSharedValue(0)` for opacity, translateY, scale. Plus the GoldCta with its shine animation. Plus VexAtmosphere, CRTOverlay, etc. This is ~15+ animated values created on mount.

While Reanimated handles this well, the `useEffect` in each Stage runs animations on mount with hardcoded delays. If the user navigates away quickly, these animations continue.

**Fix:**
```
1. Cancel animations on unmount (use useAnimatedStyle with cancel)
2. Consider lazy mounting heavy animated components
3. Measure mount time and optimize if >16ms
```

### PERF-002: FlashList estimatedItemSize Values May Be Inaccurate

**Scope:** 20+ FlashList instances

Several `estimatedItemSize` values look like guesses:
- `estimatedItemSize={80}` — used for coach messages, notifications, search results
- `estimatedItemSize={72}` — used for recent sessions, memory items
- `estimatedItemSize={92}` — study library items
- `estimatedItemSize={168}` — challenge items

Inaccurate estimates cause layout jumps. FlashList documentation recommends measuring actual item heights.

**Fix:**
```
1. Measure actual item heights on each list's common device
2. Use the `estimatedItemSize` that matches the 90th-percentile item
3. Add a comment explaining how the value was determined
```

### PERF-003: home-spine Priority Context Fires 5+ Parallel fetch Calls

**File:** `src/features/home-spine/priority-context.ts:101-110`

```typescript
getHomePromiseState(userId, true, timeZone).catch(() => ({...})),
fetchActiveRecommendations(userId, 1).catch(() => []),
fetchActiveChallengeDetails(userId).catch(() => []),
```

Multiple parallel fetches on home screen load. Each is a separate Supabase query. While `Promise.all` parallelizes them, the sheer number of queries on home screen load could be slow.

**Fix:**
```
1. Consider a single RPC or Supabase function that returns all home data
2. Add loading states that progressively reveal content
3. Use staleTime to avoid refetching on every navigation to home
```

### PERF-004: Timer setInterval at 1-Second Intervals

**Files:**
- `src/session/hooks/useTimerActions.ts:55,82`
- `src/session/hooks/useSessionTimerSubscriptions.ts:125`
- `src/session/engines/timer-tick-handler.ts:78`

The session timer uses `setInterval` with ~1-second tick intervals. While this is necessary for the timer, ensure:
- The tick callback is lightweight
- No re-renders on every tick (use Reanimated shared values, not React state)
- The interval is cleaned up on background/unmount

**Fix:**
```
1. Verify timer ticks use useSharedValue, not useState
2. Ensure no heavy computation in tick handler
3. Verify interval cleanup on AppState 'background'
```

### PERF-005: AnimatedCounter setInterval at 16ms

**File:** `src/shared/ui/components/AnimatedCounter.tsx:112`

```typescript
const updateInterval = setInterval(() => {}, 16);
```

A 16ms interval (60fps) for an animated counter. This is extremely wasteful. The interval callback appears to be empty `{}`.

**Fix:**
```
1. If the callback is empty, delete the entire interval
2. Use Reanimated withTiming for counter animations instead of setInterval
3. This is a clear AI slop artifact — empty interval doing nothing at 60fps
```

### PERF-006: Prefetcher Fires 10+ Prefetch Queries

**File:** `src/hooks/prefetcher.ts`

The prefetcher fires queries for session, social, squad, shop, user, wallet, inventory, progression, etc. This could overwhelm the Supabase connection pool on app start.

**Fix:**
```
1. Prioritize: only prefetch the 3-4 most critical queries
2. Stagger prefetch calls with delays
3. Cancel prefetches if the user navigates before they complete
```

---

## 10. UI / ACCESSIBILITY

### A11Y-001: ~30+ Interactive Elements Missing AccessibilityLabel

**Scope:** Across 20+ component files

`onPress` handlers exist in 20+ files, but only 15 files have `accessibilityLabel` usage. The gap means some interactive elements are unlabeled.

**High-priority missing:**
- `src/features/analytics/components/data-export-helpers.tsx` — 15 onPress, 15 accessibilityLabel (good)
- `src/features/settings/components/SettingsDataControlSection.tsx` — 6 onPress, check labels
- `src/shared/ui/components/InteractiveCard.tsx` — 7 onPress
- `src/shared/ui/components/StatusChip.tsx` — 7 onPress

**Fix:**
```
Run: rg -n "onPress" src -g "*.tsx" -c | sort descending
For each file with onPress but without accessibilityLabel:
  Add accessibilityLabel, accessibilityRole, accessibilityHint
```

### A11Y-002: Hardcoded Font Sizes Throughout Analytics Components

**Files:**
- `src/features/analytics/components/Heatmap.tsx:134-181` — 10+ hardcoded fontSize values
- `src/features/analytics/components/TimeSeriesChart.tsx` — multiple fontSize values
- `src/features/analytics/components/TimeRangeFilter.tsx` — fontSize: 12

None use `theme.typography` or design tokens.

**Fix:** Replace all `fontSize: <number>` with `theme.typography.size.*` or `theme.font.size.*` tokens.

### A11Y-003: Multiple Components Use Hardcoded rgba() Colors

**Files:**
- `src/components/primitives/VexMotionSurface.tsx` — `rgba(18,18,26,0.85)`, `rgba(255,255,255,0.06)`
- `src/components/primitives/ShimmerSweep.tsx` — `rgba(255,255,255,0.18)`
- `src/components/states/ErrorState.tsx` — `rgba(0,229,255,0.08)`, `rgba(255,255,255,0.86)`
- `src/session/components/DeepWorkVignette.tsx` — `rgba(0,0,0,0.45)`, `rgba(0,0,0,0.35)`
- `src/session/components/QualityIndicator-helpers.tsx` — 5 hardcoded rgba colors
- `src/components/StreakBadge.tsx` — 5 hardcoded rgba colors

**Fix:** Move to `theme.colors.semantic.*` tokens with appropriate opacity modifiers.

### A11Y-004: Color Blind Palettes Use Hardcoded Hex Instead of Theme Tokens

**File:** `src/accessibility/colorBlindPalettes.ts`

This file has 30 hardcoded hex values for color-blind palettes. While these ARE palette definitions (somewhat appropriate to be hardcoded), they should reference the theme token system so they update with theme changes.

**Fix:**
```
1. Move palette definitions to src/theme/tokens/ 
2. Reference the same token system used by the main theme
3. Ensure color blind palettes adapt to dark/light mode
```

### A11Y-005: OfflineBanner Missing in Many Data-Driven Screens

**Files:** Multiple screens

The `OfflineBanner` component exists (`src/components/OfflineBanner.tsx`) and `src/shared/ui/components/OfflineBanner.tsx` (duplicate), but many data-driven screens don't include it. The AGENTS.md requires: "Offline: degraded banner when useNetInfo() returns offline. Never silently fail."

**Fix:**
```
1. Delete the duplicate OfflineBanner (keep one)
2. Add OfflineBanner to the AppScreen wrapper so ALL screens show it
3. OR add it to the root layout so it appears above all content
```

### A11Y-006: AchievementReward Components Use Emojis for Icons

**File:** `src/features/achievements/components/AchievementRewards.tsx:31-82`

```tsx
<Text style={{ fontSize: 24 }}>🪙</Text>
<Text style={{ fontSize: 24 }}>⭐</Text>
<Text style={{ fontSize: 24 }}>💎</Text>
```

Emojis render differently across platforms and may not be accessible to screen readers.

**Fix:**
```
1. Use SVG icons from the icon system instead of emojis
2. If keeping emojis, add accessibilityLabel with text description
3. Ensure minimum contrast ratio with emoji + background
```

---

## 11. NAVIGATION

### NAV-001: RootNavigator Has Three useEffects With Complex Dependencies

**File:** `src/navigation/RootNavigator.tsx:82-119`

Three `useEffect` blocks with overlapping dependencies on `user`, `checkAuth`, onboarding state, and streak funeral navigation. These can cause:
- Multiple auth checks on rapid state changes
- Stale closure bugs if effects fire in unexpected order
- The `cancelled` flag in the first effect may not prevent all race conditions

**Fix:**
```
1. Consolidate the auth check + onboarding sync into a single effect
2. Use useFocusEffect or a custom hook for auth state
3. Add integration tests for the auth → onboarding → main flow
```

### NAV-002: Deep Linking Config Created on Every Render (useMemo Missing Deps)

**File:** `src/navigation/RootNavigator.tsx:62`

```typescript
const linking = useMemo(() => createLinkingConfig(), []);
```

Empty dependency array means `createLinkingConfig()` is called once and cached. This is fine IF the config is truly static. Verify that `createLinkingConfig()` doesn't depend on any runtime values.

**Fix:** Audit `createLinkingConfig()` to ensure it's pure and static.

### NAV-003: Notification Deep Link Navigation May Fire Before Navigation is Ready

**File:** `src/navigation/RootNavigator.tsx:131-136`

```typescript
useNotificationNavigation({
  featureAccess: featureAccess.features,
  isAuthenticated,
  navigationRef,
  userId: user?.id,
});
```

If a notification arrives before `isNavigationReady` is true, the navigation call may fail silently.

**Fix:**
```
1. Queue navigation actions that arrive before isNavigationReady
2. Execute queued actions once onReady fires
3. This is a common React Navigation pattern — implement the queue
```

---

## 12. DESIGN TOKEN VIOLATIONS

### DT-001: 40+ Hardcoded Hex/rgba Colors Outside Theme System

**Scope:** Across 15+ files

**Category breakdown:**
- Session components (DeepWorkVignette, QualityIndicator, ActiveSessionHUD) — 10+ rgba values
- Auth screen components (LoginScreen, VexMotionSurface, VexLaunchButton) — 10+ hex/rgba values
- Analytics components (Heatmap) — 5+ hex values
- StreakBadge — 5+ rgba values
- ErrorState — 2+ rgba values
- Modal/Toast — 3+ rgba values

**Fix:**
```
1. Create a comprehensive set of semantic color tokens in src/theme/tokens/
2. Add tokens for: overlay, vignette, shimmer, cta-gold, quality-indicators
3. Replace ALL hardcoded colors with token references
4. Add a CI check that fails on hardcoded hex/rgba outside of tokens/
```

### DT-002: 30+ Hardcoded Font Size Values

**Scope:** Across 10+ files

Files with most violations:
- `src/features/analytics/components/Heatmap.tsx` — 10 fontSize values
- `src/features/analytics/components/TimeSeriesChart.tsx` — 4 fontSize values
- `src/features/achievements/components/AchievementRewards.tsx` — 6 fontSize values
- `src/navigation/components/RootCrashBoundary.tsx` — 3 fontSize values
- `src/components/OfflineBanner.tsx` — 2 fontSize values

**Fix:** Replace with `theme.typography.sizes.*` tokens.

### DT-003: No CI Check for Hardcoded Values

There's no automated check that prevents hardcoded colors, font sizes, spacing, or border radii from entering the codebase.

**Fix:**
```
1. Add a script similar to check-banned-patterns.js that detects hardcoded hex/rgba/fontSize
2. Add it to CI pipeline
3. Allow a whitelist file for known exceptions (e.g., colorBlindPalettes.ts)
```

---

## 13. FILE SIZE VIOLATIONS

### FS-001: src/types/supabase.ts — 5,616 Lines

**File:** `src/types/supabase.ts`

This is auto-generated Supabase types. The 200-line limit doesn't apply to auto-generated files. However, verify it's up to date.

**Fix:** Run `npm run types:supabase` and verify the output matches.

### FS-002: LoginScreen.tsx — 313 Lines (Exceeds 200)

**File:** `src/screens/auth/LoginScreen.tsx`

This exceeds the 200-line hard limit. The Stage, GoldCta, and FooterMark subcomponents should be extracted to their own files.

**Fix:**
```
Extract to:
  src/screens/auth/components/LoginStage.tsx (Stage component)
  src/screens/auth/components/GoldCta.tsx (GoldCta component)
  src/screens/auth/components/FooterMark.tsx (FooterMark component)
Main LoginScreen should be ~50 lines: import components, render layout.
```

### FS-003: VexAtmosphere.tsx — 209 Lines

**File:** `src/screens/auth/components/VexAtmosphere.tsx`

**Fix:** Extract animated sub-components (particle effects, gradient layers) to separate files.

### FS-004: VexEditorialMark.tsx — 299 Lines

**File:** `src/screens/auth/components/VexEditorialMark.tsx`

**Fix:** Extract SVG path definitions and animation logic to separate files.

### FS-005: ~30 Files Near/Over 200 Lines

**Scope:** 30 files between 150-200+ lines (non-test, non-generated)

Many files are at 193-199 lines — just under the limit but likely to grow. Proactive splitting recommended for:
- `challenges/types.ts` (199 lines)
- `shared/analytics/use-analytics-core.ts` (199 lines)
- `liveops-config/classification-data-internal.ts` (199 lines)
- `ai-coach/components/primitives/button.tsx` (198 lines)
- `challenges/service.ts` (198 lines)

**Fix:**
```
For each file near 200 lines, extract utilities, helpers, or type definitions
to separate files before they grow past the limit.
```

---

## 14. AI SLOP / DEAD CODE / TECH DEBT

### SLOP-001: AnimatedCounter Empty setInterval

**File:** `src/shared/ui/components/AnimatedCounter.tsx:112`

```typescript
const updateInterval = setInterval(() => {}, 16);
```

An empty callback running at 60fps. This is clearly AI-generated stub code that was never implemented.

**Fix:** Delete the empty setInterval, or implement the counter logic using Reanimated.

### SLOP-002: PredictiveInterventionEngine.analyzeAllUsers Is a No-Op

**File:** `src/features/ai-coach/PredictiveInterventionEngine.ts:192-194`

```typescript
private analyzeAllUsers(): void {
  debug.info('Would analyze all users');
}
```

This method is called every hour by setInterval and does nothing. It's a stub that was never implemented.

**Fix:**
```
Either:
1. Implement the method (fetch active users, analyze patterns, generate predictions)
2. Delete the entire engine if this feature is not in scope for release
3. At minimum, stop the interval from firing if the method is a no-op
```

### SLOP-003: Dual Auth Implementation (see ARCH-001)

Two complete auth flows that do the same thing. This is likely the result of AI-assisted development creating parallel implementations.

### SLOP-004: Two OfflineBanner Components

**Files:**
- `src/components/OfflineBanner.tsx`
- `src/shared/ui/components/OfflineBanner.tsx`

Two implementations of the same component. Both use `NetInfo.addEventListener`.

**Fix:** Delete one, keep the shared one, update all imports.

### SLOP-005: Dead ApiClient Class (see RB-003)

The entire `ApiClient` class in `src/api/client.ts` throws on every request. The working implementation is in `api-request-handler.ts`. This is dead code from an earlier architecture.

**Fix:** Delete `ApiClient` and its `getApiClient`/`resetApiClient` exports if nothing uses them.

### SLOP-006: Economy getSupabate() Wrapper (see ARCH-005)

A function that just calls another function. Zero value added.

### SLOP-007: COMPONENT_EXAMPLES.md in Production Code

**File:** `src/components/COMPONENT_EXAMPLES.md` (352 lines)

A markdown documentation file in the source tree. This should be in docs/ or deleted.

**Fix:** Move to `docs/component-examples.md` or delete.

### SLOP-008: Root-Level Script/Debug Files

**Files in project root:**
- `check-login.png`, `check-storage.js`, `diagnostic.js`, `screenshot*.js`, `screenshot*.png`
- `fix_no_void.py`, `fix_no_void2.py`, `fix-react-imports.sh`
- `cast_inventory.csv`, `inventory_script.ps1`, `inventory.ps1`
- `revised*.png`, `revised2*.png`, `revised3*.png`

These are debug/script files that should not be in the production codebase.

**Fix:**
```
1. Delete all screenshot*.png and revised*.png files
2. Move diagnostic scripts to scripts/ directory
3. Delete Python fix scripts (they should have been run and removed)
4. Add these patterns to .gitignore if they regenerate
```

---

## 15. DEPENDENCY & CONFIG AUDIT

### DEP-001: TypeScript 6.0.3 with ignoreDeprecations

**File:** `tsconfig.json:26`

```json
"ignoreDeprecations": "6.0"
```

This suppresses deprecation warnings from TS 6.0. Verify what deprecations are being hidden.

**Fix:** Investigate what deprecations are suppressed and fix them instead of ignoring.

### DEP-002: @sentry/react-native ~7.11.0 — Verify Expo Compatibility

Sentry RN 7.x may have compatibility issues with Expo SDK 56. Verify the integration works in both Expo Go and development builds.

**Fix:** Test Sentry error capture in both Expo Go and dev client builds.

### DEP-003: zustand ^4.5.0 — Consider Updating to 5.x

Zustand 5.x is available with better TypeScript support and middleware patterns. The current 4.x works but is outdated.

**Fix:** Evaluate migration to Zustand 5.x post-release. Not a blocker.

### DEP-004: @supabase/supabase-js ^2.103.3 — Verify Realtime Compatibility

Supabase JS 2.103+ has had realtime behavior changes. Verify that all channel subscriptions work with this version.

**Fix:** Test all realtime subscriptions (presence, broadcast, postgres_changes) work correctly.

### DEP-005: expo-haptics Direct Import Not Detected by ESLint

The ESLint config bans direct `expo-haptics` imports, but the enforcement only works if ESLint is run. No CI check enforces this.

**Fix:** Add ESLint check to CI pipeline.

### DEP-006: No Pre-commit Hooks

There are no pre-commit hooks (husky, lint-staged, etc.) to prevent:
- Committing `any` types
- Committing console.log
- Committing files over 200 lines
- Committing hardcoded colors
- Committing to protected branches

**Fix:**
```
1. Install husky + lint-staged
2. Configure pre-commit to run: typecheck, lint, check:banned-patterns, check:line-limit
3. Add pre-push to run tests
```

---

## 16. TEST COVERAGE GAPS

### TEST-001: No Integration Tests for Auth Flow

The auth flow (login → checkAuth → navigation → onboarding → home) has no integration test covering the full happy path. The `RootNavigator` has complex effects that could break silently.

**Fix:**
```
Write integration tests for:
1. Login → authenticated → home screen
2. Login → authenticated → onboarding → home
3. Logout → unauthenticated → login screen
4. Token expiry → auto-refresh → stay authenticated
5. Token expiry → refresh fails → redirect to login
```

### TEST-002: No Tests for Realtime Subscription Lifecycle

The `useRealtime.ts` hooks have unit test mocks but no tests for:
- Subscription cleanup on unmount
- Subscription restart on reconnect
- Race condition on rapid mount/unmount

**Fix:**
```
Add tests for:
1. useEffect cleanup calls unsubscribe
2. Rapid mount/unmount doesn't leak channels
3. Background/foreground lifecycle manages subscriptions
```

### TEST-003: No Test for Economy RPC Atomicity

The economy RPCs (`atomic_spend_currency`, `grant_currency`, `atomic_add_currency`) are critical for the game economy. There are no tests verifying:
- Concurrent spend operations don't create negative balances
- Grant + spend in same transaction is atomic
- Error paths return correct error types

**Fix:**
```
Add tests that:
1. Two concurrent spends of 50 on a 100-coin balance result in one success, one failure
2. Grant + spend in sequence results in correct final balance
3. Network failures during spend don't corrupt balance
```

### TEST-004: No Visual Regression Tests for Auth Screens

The auth screens (Login, Register, ForgotPassword) have complex animations and layouts. No visual regression tests exist.

**Fix:** Add screenshot-based tests using Detox or similar for auth screens.

### TEST-005: Supabase Types May Be Stale

**File:** `src/types/supabase.ts` (5,616 lines)

If the database schema has changed since the last `npm run types:supabase`, the types are stale and queries may fail silently.

**Fix:** Run `npm run types:supabase` and compare the output. Add this to CI.

---

## 17. BUILD & NATIVE CONFIGURATION

### BLD-001: Certificate Pinning Uses PLACEHOLDER Pin — CRITICAL

**File:** `app.json:130` + `plugins/withCertificatePinning.js`

```json
"pins": ["sha256/PLACEHOLDER_REPLACE_BEFORE_SHIP"]
```

The certificate pin is a **literal placeholder string**. If shipped as-is, this will either:
- Crash the app on launch (pin validation fails against real cert)
- Be silently ignored (depending on the pin validation implementation)
- Create a false sense of security

**Fix:**
```
1. Get the actual Supabase certificate pin:
   echo | openssl s_client -connect icnbpjkyupuqzuvwuvbk.supabase.co:443 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der 2>/dev/null | openssl dgst -sha256 -binary | openssl enc -base64
2. Replace PLACEHOLDER_REPLACE_BEFORE_SHIP with sha256/<actual_base64_hash>
3. Add a backup pin (for cert rotation)
4. Document the pin rotation process
5. Add a CI check that fails if the pin value contains "PLACEHOLDER"
```

### BLD-002: 4 Expo Packages Out of Date — Expo Doctor Fails

**Source:** `npx expo-doctor` output

```
package                expected  found    
expo                   ~56.0.8   56.0.6   
expo-build-properties  ~56.0.16  56.0.15  
expo-dev-client        ~56.0.18  56.0.16  
expo-notifications     ~56.0.15  56.0.14  
```

Patch mismatches can cause subtle native module crashes.

**Fix:**
```
npx expo install --check
This will update all packages to their SDK-56 compatible versions.
```

### BLD-003: New Architecture Enabled on Both Platforms — Verify Stability

**File:** `app.json:140,143`

```json
"ios": { "newArchEnabled": true },
"android": { "newArchEnabled": true }
```

New Architecture (Fabric + TurboModules) is enabled on both platforms. While Expo SDK 56 supports it, verify:
- All native modules (MMKV, RevenueCat, Sentry, Skia, FlashList) work with New Arch
- No TurboModule resolution errors in production builds
- Reanimated 4.3.1 is fully New Arch compatible

**Fix:**
```
1. Run a full EAS production build for both platforms
2. Test on a real device with New Arch enabled
3. Test all native module features: MMKV storage, Sentry capture, RevenueCat purchases, Skia rendering
4. If any module fails, disable New Arch: "newArchEnabled": false
```

### BLD-004: Expo Go Shims Must NEVER Ship in Production

**File:** `metro.config.js:68-70`

```javascript
const SHIMS_ENABLED =
  process.env.EXPO_PUBLIC_ENABLE_EXPO_GO_SHIMS === '1' &&
  process.env.NODE_ENV !== 'production';
```

The guard is `NODE_ENV !== 'production'`, which is correct. BUT the `eas.json` development build profiles set `EXPO_PUBLIC_ENABLE_EXPO_GO_SHIMS: "1"`, while the production profile does NOT. This is correct. However, verify:
- The `transform-remove-console` babel plugin only strips `console.log` in production (not `console.error` or `console.warn`) — this is correctly configured in `babel.config.js:17`
- No shim code path leaks into the production bundle

**Fix:**
```
1. Verify production build does NOT include shims by checking bundle size
2. Add a test that verifies shims throw in production (the MMKV and Sentry shims already do this)
3. Run: npx expo export --platform ios --dump-sourcemap && grep -c "shim" dist/...
```

### BLD-005: No expo-updates for OTA Updates

**Finding:** `expo-updates` is NOT in `package.json` and NOT in `app.json` plugins.

Without `expo-updates`, there is NO over-the-air update capability. Every fix requires a full app store review cycle (days/weeks). For a v1.0 release, you should have OTA capability ready.

**Fix:**
```
1. Install: npx expo install expo-updates
2. Configure in app.json:
   "updates": {
     "enabled": true,
     "checkAutomatically": "ON_LOAD",
     "fallbackToCacheTimeout": 30000
   }
3. Test OTA update flow on staging
4. Document the rollback procedure
```

### BLD-006: No Splash Screen Configuration

**Finding:** No `expo-splash-screen` configuration in `app.json` or `package.json`. The `assets/splash.png` exists (25KB) but there's no splash screen plugin configuration.

The app will use the default Expo splash behavior (white background with icon), which may look unpolished.

**Fix:**
```
1. Install: npx expo install expo-splash-screen
2. Configure in app.json:
   "splash": {
     "image": "./assets/splash.png",
     "resizeMode": "contain",
     "backgroundColor": "#0A0A0A"
   }
3. Design a proper splash screen matching the VEX brand
4. Ensure splash dismisses after JS loads and theme is ready
```

### BLD-007: Android Adaptive Icon Background is Hardcoded Hex

**File:** `app.json:116`

```json
"backgroundColor": "#0A0A0A"
```

While this IS a config file (not source code), the hardcoded hex should match a design token.

**Fix:** Document that `#0A0A0A` matches `theme.colors.semantic.background` and add a comment in app.json.

### BLD-008: Babel Config Has Many Unused Path Aliases

**File:** `babel.config.js:22-47`

The babel module-resolver has 26 path aliases defined, but many are not used in the codebase:
- `@overlays` — no `src/overlays` directory
- `@shell` — no `src/shell` directory
- `@states` — no `src/states` directory
- `@validation` — no `src/validation` directory
- `@featureFlags` — no `src/featureFlags` directory
- `@settings` — no `src/settings` directory

Unused aliases slow down Metro resolution and add confusion.

**Fix:**
```
1. Remove aliases for directories that don't exist
2. Update tsconfig.json paths to match (it has the same unused aliases)
3. Verify no imports use the dead aliases
```

### BLD-009: Privacy Policy and Terms URLs Point to pla4ma.github.io

**File:** `app.json:22-24`

```json
"NSPrivacyPolicyURL": "https://pla4ma.github.io/",
"NSSupportURL": "https://pla4ma.github.io/support",
"NSTermsOfServiceURL": "https://pla4ma.github.io/terms"
```

These URLs point to a GitHub Pages site, not vex.app. The privacy policy URL is just the root domain, not an actual privacy policy page. Apple requires actual policy pages for App Store review.

**Fix:**
```
1. Create actual privacy policy and terms of service pages
2. Host them at vex.app/privacy and vex.app/terms (matching constants/app.ts)
3. Update app.json URLs to match
4. Verify both URLs return 200 OK with actual content
```

### BLD-010: app.json githubUrl Points to pla4ma/vex-app

**File:** `app.json:11`

```json
"githubUrl": "https://github.com/pla4ma/vex-app"
```

If this is a public repo, the source code is accessible. Verify this is intentional and that no secrets are in the repository history.

**Fix:**
```
1. Audit the entire git history for accidentally committed secrets
2. Run: git log --all --diff-filter=A -- '*.env*' 'credentials*' '*secret*' '*key*.pem'
3. If the repo is private, this is fine
4. If public, verify .env files were never committed
```

---

## 18. APP STORE READINESS

### STORE-001: iOS Privacy Manifest Present But Incomplete

**File:** `app.json:27-110`

The privacy manifest is configured, which is good (Apple requires this since May 2024). However:

1. **NSPrivacyCollectedDataTypeOtherUserContent** — "Other User Content" is declared. If the app collects user-generated content (study materials, companion messages), verify this is accurate and the data handling matches what's declared.

2. **Missing data types:**
   - If the app uses notifications, declare `NSPrivacyCollectedDataTypeDeviceAndSystemInformation` for push tokens
   - If Supabase Realtime is used, WebSocket connections may trigger `NSPrivacyCollectedDataTypeOtherDiagnosticData`

3. **API reasons** — The declared API reasons (FileTimestamp, DiskSpace, UserDefaults, SystemBootTime) look correct for the libraries used, but verify each reason string matches Apple's documentation.

**Fix:**
```
1. Cross-reference declared data types with actual data collection
2. Add push notification token data type if using expo-notifications
3. Verify API reason codes match Apple's latest documentation
4. Test that the app passes Apple's privacy manifest validation
```

### STORE-002: iOS Encryption Declaration Set to false

**File:** `app.json:21`

```json
"ITSAppUsesNonExemptEncryption": false
```

This is correct if the app doesn't use custom encryption beyond HTTPS. However, the Supabase client uses HTTPS, and the SecureStorage adapter uses the keychain (which uses encryption). Verify this declaration is accurate for App Store Connect.

**Fix:**
```
Apple's guidance: If your app only uses standard HTTPS/SSL, set to false.
If you implement custom encryption algorithms, set to true and provide export compliance documentation.
The current value of false is likely correct since all encryption is system-provided.
```

### STORE-003: No App Store Metadata Configuration

**Finding:** No `appStore` configuration in `eas.json` for automated submissions.

For release, you'll need:
- App Store Connect metadata (description, keywords, screenshots, ratings)
- Google Play Store metadata
- Age rating configuration
- Review notes

**Fix:**
```
1. Create app store metadata:
   - Short description (80 chars)
   - Full description (4000 chars)
   - Keywords (100 chars)
   - Support URL, marketing URL
   - Age rating (likely 4+ or 12+ depending on social features)
2. Generate screenshots for all required device sizes
3. Configure EAS Submit:
   eas.json → "submit": { "production": { "ios": {...}, "android": {...} } }
```

### STORE-004: RevenueCat Android Key is Placeholder

**File:** `.env.local:14`

```
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_key_here
```

The Android RevenueCat API key is literally `your_android_key_here`. This means:
- In-app purchases on Android will FAIL in production
- Any premium/paywall flow on Android is non-functional

**Fix:**
```
1. Create a RevenueCat project for Android
2. Get the Android API key from RevenueCat dashboard
3. Replace the placeholder in .env.local (or EAS secrets)
4. Configure Google Play Billing
5. Test purchase flow on Android
```

### STORE-005: No App Version/SemVer Strategy

**File:** `app.json:6`, `constants/app.ts:12`

```json
"version": "1.0.0"
```

The version is hardcoded to "1.0.0". The EAS production build has `autoIncrement: true`, which auto-increments the build number, but the version string itself never changes.

**Fix:**
```
1. Define a version strategy: semver, calendar versioning, etc.
2. Document how version bumps work in CI
3. Ensure version is updated in BOTH app.json and constants/app.ts
4. Consider using a single source of truth for the version
```

### STORE-006: No App Icon Variants for Different Sizes

**File:** `assets/icon.png` (11.8KB)

The icon file is only 11.8KB, which likely means it's a low-resolution icon. App Store requires 1024x1024 icons, and adaptive icons require foreground/background layers.

**Fix:**
```
1. Create a 1024x1024 master icon
2. Generate all required sizes from the master
3. Verify adaptive-icon foreground image has proper safe zone (inner 66% of 108dp circle)
4. Test icon rendering on both platforms
```

---

## 19. EDGE FUNCTIONS & SERVER-SIDE

### EDGE-001: Shared Auth Module Uses Supabase Auth API Without Error Detail

**File:** `supabase/functions/_shared/auth.ts:22-32`

The `verifyAuthorizedUser` function fetches `${supabaseUrl}/auth/v1/user` to verify the token. If the auth service is down or returns an unexpected error, the function returns a generic 401. No logging of the actual error.

**Fix:**
```
1. Log the auth response status and body on failure
2. Return more specific error codes (token expired, invalid, service unavailable)
3. Add retry logic for transient auth service failures
4. Consider caching verified tokens for 60 seconds to reduce auth API calls
```

### EDGE-002: Rate Limit Module Creates New Supabase Client Per Check

**File:** `supabase/functions/_shared/rate-limit.ts:26`

```typescript
const supabase = createClient(supabaseUrl, serviceRoleKey);
```

A new Supabase client is created on every rate limit check. This is expensive — each `createClient` allocates a new connection.

**Fix:**
```
1. Create the Supabase client once at module scope
2. OR use a singleton pattern that reuses the client across function invocations
3. Deno/Supabase Edge Functions can reuse module-level state within a single isolate
```

### EDGE-003: Rate Limit Module Uses console.error Instead of Structured Logging

**File:** `supabase/functions/_shared/rate-limit.ts:37`

```typescript
console.error(`Rate limit check failed for ${operation}:`, error);
```

This should use structured logging that can be captured by the observability stack.

**Fix:**
```
Replace with:
  import * as Sentry from 'https://esm.sh/@sentry/deno';
  Sentry.captureException(error, { tags: { operation, feature: 'rate-limit' } });
OR use Deno's native structured logging.
```

### EDGE-004: CORS Allows localhost Origins

**File:** `supabase/functions/_shared/cors.ts:4-5`

```typescript
'http://localhost:8081',
'http://localhost:19006',
```

Localhost origins are allowed for development, but these should be removed in production edge function deployments.

**Fix:**
```
1. Make ALLOWED_ORIGINS environment-dependent
2. Use Deno.env.get("ENVIRONMENT") to switch between dev and prod origins
3. Remove localhost from production allowlist
4. Add the actual production web origin (vex.app)
```

### EDGE-005: Edge Function Auth Returns userId Without Role/Claims

**File:** `supabase/functions/_shared/auth.ts:34`

```typescript
const user = (await authResponse.json()) as { id?: string };
```

The auth check only extracts `id` from the user response. It doesn't check:
- Email verification status
- User role (admin, user, banned)
- App metadata

**Fix:**
```
1. Parse the full user object: { id, email, role, app_metadata, aud }
2. Verify email_confirmed_at is not null
3. Check app_metadata for role/ban status
4. Return the full user context, not just the ID
```

### EDGE-006: No Supabase Migration for rate_limit RPC

**File:** `supabase/functions/_shared/rate-limit.ts:28`

The `check_rate_limit` RPC is called but there's no visible migration creating this function. If it doesn't exist, rate limiting silently fails (error → allowed: false, which blocks all requests).

**Fix:**
```
1. Verify the check_rate_limit RPC exists in the Supabase database
2. If missing, create a migration for it
3. Test that rate limiting works end-to-end
```

---

## 20. MEMORY & RESOURCE MANAGEMENT

### MEM-001: PredictiveInterventionEngine Maps Grow Unbounded

**File:** `src/features/ai-coach/PredictiveInterventionEngine.ts:24-26`

```typescript
private predictions: Map<string, RiskPrediction[]> = new Map();
private patterns: Map<string, BehavioralPattern> = new Map();
private interventions: Map<string, InterventionResult[]> = new Map();
```

Three Maps that grow without limit as users are analyzed. In a production app with thousands of users, this could consume significant memory.

**Fix:**
```
1. Add max size limits (e.g., LRU eviction when Map exceeds 1000 entries)
2. Periodically clear stale predictions (past their predictedToOccurAt date)
3. Consider using a proper cache with TTL
```

### MEM-002: Event Bus Subscriptions May Leak

**File:** `src/events/EventBus.ts`

The EventBus allows subscriptions via `subscribe()`. If components subscribe but don't unsubscribe on unmount, the callbacks pile up. The `useOnlineUsers` hook in `useOnlineUsers.ts` subscribes to `eventBus.subscribe('online_users', ...)` and returns the unsubscribe function, but it relies on the component calling it in useEffect cleanup.

**Fix:**
```
1. Audit all eventBus.subscribe() calls and verify each has a corresponding unsubscribe in cleanup
2. Add weak reference support or automatic cleanup for subscriber GC
3. Consider a React hook that auto-unsubscribes: useEventBus(event, callback)
```

### MEM-003: useActivityBroadcast Messages Array Slices But Never Clears Proactively

**File:** `src/hooks/useRealtime.ts:114`

```typescript
setMessages((prev) => [...prev.slice(-49), message]);
```

Messages are kept to a max of 50, but each message object could be large (broadcast payloads). In a high-frequency channel, this creates 50 objects in memory at all times.

**Fix:**
```
1. Consider a smaller buffer (10-20) for most use cases
2. Add a TTL so old messages are auto-removed
3. Make the buffer size configurable per hook instance
```

### MEM-004: No AppState Handling for Backgrounding During Sessions

**Finding:** Only `src/api/QueryProvider.tsx` uses `AppState` (for refetch on foreground). The session timer, realtime subscriptions, and orchestrator don't respond to app backgrounding.

When the app backgrounds:
- Timers continue running (setInterval doesn't pause)
- Realtime subscriptions may disconnect silently
- Session state becomes stale

**Fix:**
```
1. Listen to AppState changes in the session layer
2. On 'background': pause timer, note background timestamp
3. On 'active': calculate elapsed time, resume timer or prompt user
4. On 'inactive': prepare for potential background
5. Add a useAppState hook that the session orchestrator consumes
```

### MEM-005: Offline Queue Has No Max Size

**File:** `src/lib/offline/queue.ts:123`

The offline queue uses `setInterval` for auto-processing but has no documented maximum size. The `NETWORK.maxOfflineQueue: 100` constant exists but may not be enforced at the queue level.

**Fix:**
```
1. Enforce maxOfflineQueue limit at the queue level
2. When the queue is full, reject new items or evict oldest
3. Log queue overflow via Sentry
4. Add a queue status hook for UI display
```

---

## 21. I18N & TIMEZONE

### TZ-001: Client-Side Date Calculations Use Local Timezone Without Server Sync

**Scope:** Multiple files

The app uses `Intl.DateTimeFormat().resolvedOptions().timeZone` for timezone detection:
- `src/features/home-spine/priority-context.ts:18`
- `src/features/companion-promise/hooks.ts:19`

This returns the device timezone, but there's no sync with the server timezone. If the user changes their device timezone, streak calculations, session timing, and daily resets could be wrong.

**Fix:**
```
1. Store the user's timezone in their profile (server-side)
2. Use the stored timezone for all date calculations
3. Offer a timezone override in settings
4. When timezone changes, recalculate affected streaks/daily limits
```

### TZ-002: Streak Boundary Calculations May Be Wrong Across Timezones

**Finding:** Streak logic depends on "consecutive days" but a "day" depends on timezone. If a user in UTC-8 completes a session at 11:59 PM local time, it's recorded as the next day in UTC. This could break streaks.

**Fix:**
```
1. All streak calculations MUST use the user's timezone, not UTC
2. The Supabase `increment_streak` or `check_streak` RPC must accept a timezone parameter
3. Test streak logic with users in different timezones
4. Test streak logic at timezone boundary (11:59 PM → 12:01 AM)
```

### TZ-003: No Date/Time Formatting Library

**Finding:** The app uses raw `Intl.DateTimeFormat` and manual date formatting instead of a library like `date-fns` or `dayjs`. The `src/utils/date.ts` and `src/utils/dateFns.ts` files exist but I need to verify they're used consistently.

The `DATE_FORMAT` constants in `app.ts` reference format strings like `'MMM d, yyyy'` which look like `date-fns` format strings, but `date-fns` is not in `package.json`.

**Fix:**
```
1. Verify date formatting is consistent across the app
2. If using manual formatting, add comprehensive tests for edge cases
3. Test formatting with non-English locales
4. Test formatting at DST boundaries
```

---

## 22. IMAGE ASSET OPTIMIZATION

### IMG-001: No expo-image for Optimized Image Loading

**Finding:** `expo-image` is not in `package.json`. The app uses the standard React Native `Image` component in 4 files:
- `src/components/Banner.tsx` — 7 Image uses
- `src/session/components/SquadMemberIndicator.tsx` — 2
- `src/features/content-study/components/YouTubeVideoPreview.tsx` — 2
- `src/components/Avatar.tsx` — 2

`expo-image` provides:
- Disk caching
- Placeholder/blur hash support
- Better memory management
- Progressive loading

**Fix:**
```
1. Install: npx expo install expo-image
2. Replace Image with ExpoImage in the 4 files
3. Add blur hash placeholders for avatar/thumbnail images
4. Configure cache policies (disk + memory)
```

### IMG-002: Splash Screen Asset is 25KB PNG

**File:** `assets/splash.png` — 25,505 bytes

This seems small for a splash screen. Verify it's the correct resolution (should be at least 1242x2436 for iPhone X+).

**Fix:**
```
1. Check splash.png dimensions
2. If too small, create a proper high-res splash image
3. Optimize as PNG (use tinypng or similar)
4. Consider using a vector/SVG-based approach for the splash
```

---

## 23. OTA UPDATES & DEPLOYMENT

### OTA-001: No expo-updates Installed — Cannot Push OTA Updates

**Finding:** `expo-updates` is not installed. After release, any bug fix requires a full app store submission (2-7 days for iOS review).

**Fix:**
```
1. Install: npx expo install expo-updates
2. Configure in app.json:
   "updates": {
     "enabled": true,
     "checkAutomatically": "ON_LOAD",
     "fallbackToCacheTimeout": 30000
   },
   "runtimeVersion": {
     "policy": "appVersion"
   }
3. Test: make a change, push an update, verify the app downloads it
4. Document the update/rollback procedure
5. Set up EAS Update for staging and production channels
```

### OTA-002: EAS Build Channels Configured But No Update Channels

**File:** `eas.json`

The build profiles define channels (`development`, `preview`, `production`) but there's no `eas.json` update configuration. Without this, `eas update` won't know which channel to target.

**Fix:**
```
Add to eas.json:
  "submit": {
    "production": {
      "ios": { "appleId": "...", "ascAppId": "..." },
      "android": { "serviceAccountKeyPath": "...", "track": "production" }
    }
  }
```

### OTA-003: No Rollback Strategy Documented

If an OTA update breaks the app, there's no documented procedure to roll back.

**Fix:**
```
1. Document: eas update --channel production --message "rollback to <previous-hash>"
2. Add a "force update" mechanism for critical fixes
3. Test rollback on staging before production
4. Add a minimum version check on app launch
```

---

## 24. CI/CD PIPELINE

### CI-001: No GitHub Actions CI Configuration

**Finding:** `.github/` contains only agents/instructions/skills — no CI workflow files. There is no automated:
- Type checking on push
- Lint checking on push
- Test running on push
- Build verification on PR
- EAS build integration

**Fix:**
```
Create .github/workflows/ci.yml:
  name: CI
  on: [push, pull_request]
  jobs:
    typecheck:
      runs-on: ubuntu-latest
      steps: [checkout, setup-node, npm ci, npx tsc --noEmit]
    lint:
      runs-on: ubuntu-latest
      steps: [checkout, setup-node, npm ci, npm run lint]
    test:
      runs-on: ubuntu-latest
      steps: [checkout, setup-node, npm ci, npm test]
    banned-patterns:
      runs-on: ubuntu-latest
      steps: [checkout, setup-node, npm ci, npm run check:banned-patterns]
    line-limit:
      runs-on: ubuntu-latest
      steps: [checkout, setup-node, npm ci, npm run check:line-limit]
```

### CI-002: No Branch Protection Rules

Without CI, there are no branch protection rules. Anyone can push directly to `main` with broken code.

**Fix:**
```
1. Enable GitHub branch protection on main
2. Require PR reviews
3. Require CI checks to pass before merge
4. Require up-to-date branch before merge
```

### CI-003: No EAS Build Integration with GitHub

The EAS project ID is configured (`d4b472ef-85f4-49a2-895d-4f3c5fce10fc`) but there's no GitHub integration for automated builds on PRs or pushes.

**Fix:**
```
1. Connect EAS to GitHub: eas build:connect-to-github
2. Configure auto-builds on PRs for the preview profile
3. Configure auto-builds on main push for the production profile
```

---

## 25. MONITORING & OBSERVABILITY

### MON-001: Sentry Disabled in Development

**File:** `src/config/sentry.ts:19,33`

```typescript
enabled: !IS_DEVELOPMENT,
beforeSend: (event) => { if (IS_DEVELOPMENT) return null; return event; },
```

Sentry is completely disabled in development. This means dev-only bugs are never captured. While this reduces noise, it also means you miss errors that only occur in development builds.

**Fix:**
```
1. Keep Sentry disabled for local development (dev server)
2. Enable Sentry for development BUILDS (custom dev client with real native modules)
3. Add a flag: IS_DEVELOPMENT_BUILD that enables Sentry even in dev mode
4. Current approach is acceptable if you're only using Expo Go for dev
```

### MON-002: No Performance Monitoring for Critical Paths

**Finding:** No performance traces for:
- App cold start time
- Session start latency
- Home screen load time
- Auth check duration
- Supabase query durations

Sentry performance monitoring is configured (`tracesSampleRate: 0.2`) but no custom transactions are defined.

**Fix:**
```
1. Define Sentry transactions for critical paths:
   - cold-start: from App mount to RootNavigator ready
   - auth-check: from checkAuth call to completion
   - session-start: from session create to timer running
   - home-load: from navigation to home to data rendered
2. Add spans for individual Supabase queries
3. Set alerts for p95 > threshold on each transaction
```

### MON-003: No PostHog Feature Flag Evaluation Tracking

**Finding:** PostHog is configured (`EXPO_PUBLIC_POSTHOG_KEY` exists) but there's no verification that feature flag evaluations are being tracked. The feature flag system (`src/features/FeatureFlagService.ts`) stores flags locally but may not report evaluations to PostHog.

**Fix:**
```
1. Verify PostHog feature flag evaluation events fire
2. Add $feature_flag_called events for each flag check
3. Set up PostHog dashboards for flag usage
4. Add A/B test tracking if any flags are used for experiments
```

### MON-004: No Health Check Endpoint or Uptime Monitoring

**Finding:** There's no health check endpoint for the app's backend services. If Supabase goes down, the app silently fails.

**Fix:**
```
1. Add a lightweight health check in the app:
   - Periodically ping Supabase health endpoint
   - Track response times in Sentry
2. Set up external uptime monitoring (UptimeRobot, etc.) for:
   - Supabase API
   - Edge Functions
   - vex.app website
3. Add Sentry alerts for error rate spikes
```

---

## 26. RELEASE PHASE — FINAL GATE

This section is the definitive checklist. Every item must be resolved or explicitly deferred with a documented reason before the app ships.

### CRITICAL RELEASE BLOCKERS (Ship-Stopping)

| ID | Issue | Status | Fix Time |
|----|-------|--------|----------|
| RB-001 | credentials.json in workspace | 🔴 MUST FIX | 5min |
| RB-002 | Verify RLS on every Supabase table | 🔴 MUST FIX | 2hr |
| RB-003 | ApiClient throws on every request — dead code | 🔴 MUST FIX | 30min |
| RB-004 | SessionOrchestrator not destroyed on logout | 🔴 MUST FIX | 1hr |
| RB-005 | PredictiveInterventionEngine no-op with setInterval | 🔴 MUST FIX | 1hr |
| RB-006 | Web sessionStorage loses auth on tab close | 🔴 MUST FIX | 2hr |
| RB-007 | No RLS verification script | 🔴 MUST FIX | 2hr |
| BLD-001 | Certificate pinning is PLACEHOLDER — will crash or fail silently | 🔴 MUST FIX | 30min |
| BLD-002 | 4 Expo packages out of date — Expo doctor fails | 🔴 MUST FIX | 10min |
| STORE-004 | RevenueCat Android key is placeholder "your_android_key_here" | 🔴 MUST FIX | 1hr |
| SEC-008 | Auth email enumeration possible | 🔴 MUST FIX | 30min |
| ERR-001 | 7 swallowed session control errors | 🔴 MUST FIX | 1hr |
| ERR-003 | onboarding errors swallowed | 🔴 MUST FIX | 1hr |
| BLD-009 | Privacy policy URLs are pla4ma.github.io — not actual policy pages | 🔴 MUST FIX | 2hr |

### HIGH PRIORITY (Should Fix Before Release)

| ID | Issue | Status | Fix Time |
|----|-------|--------|----------|
| SEC-002 | content-study raw fetch without validation | 🟡 SHOULD FIX | 30min |
| SEC-006 | Account deletion has no confirmation/cooldown | 🟡 SHOULD FIX | 1hr |
| SEC-007 | Economy RPC amount not validated | 🟡 SHOULD FIX | 30min |
| ARCH-001 | Duplicate auth implementations | 🟡 SHOULD FIX | 3hr |
| RT-001-002 | 4 realtime channels not awaiting subscribe() | 🟡 SHOULD FIX | 30min |
| RT-004 | useSquadChanges/useGuildQuests re-subscribe on every render | 🟡 SHOULD FIX | 30min |
| RT-005 | useSquadPresence race condition on unmount | 🟡 SHOULD FIX | 30min |
| SUPA-001 | 40+ select('*') queries | 🟡 SHOULD FIX | 4hr |
| SLOP-005 | Dead ApiClient class | 🟡 SHOULD FIX | 15min |
| SLOP-004 | Duplicate OfflineBanner | 🟡 SHOULD FIX | 15min |
| PERF-005 | Empty setInterval at 60fps in AnimatedCounter | 🟡 SHOULD FIX | 15min |
| FS-002 | LoginScreen exceeds 200-line limit | 🟡 SHOULD FIX | 1hr |
| DEP-006 | No pre-commit hooks | 🟡 SHOULD FIX | 1hr |
| ERR-002 | RootNavigator auth check error swallowed | 🟡 SHOULD FIX | 15min |
| ST-003 | App store isOnline defaults to true | 🟡 SHOULD FIX | 5min |
| BLD-003 | New Architecture enabled — verify all native modules work | 🟡 SHOULD FIX | 2hr |
| BLD-005 | No expo-updates — no OTA capability | 🟡 SHOULD FIX | 1hr |
| BLD-006 | No splash screen configuration | 🟡 SHOULD FIX | 30min |
| MEM-004 | No AppState handling for backgrounding | 🟡 SHOULD FIX | 2hr |
| TZ-002 | Streak boundary calculations may be wrong across timezones | 🟡 SHOULD FIX | 2hr |
| IMG-001 | No expo-image — no disk caching for images | 🟡 SHOULD FIX | 1hr |
| CI-001 | No CI pipeline at all | 🟡 SHOULD FIX | 2hr |
| EDGE-004 | CORS allows localhost in production | 🟡 SHOULD FIX | 15min |
| EDGE-005 | Edge auth doesn't check email verification or role | 🟡 SHOULD FIX | 1hr |
| MON-002 | No performance monitoring for critical paths | 🟡 SHOULD FIX | 2hr |
| STORE-006 | App icon may be low resolution | 🟡 SHOULD FIX | 30min |
| BLD-008 | Babel has unused path aliases | 🟡 SHOULD FIX | 15min |

### MEDIUM PRIORITY (Fix in First Patch)

| ID | Issue | Fix Time |
|----|-------|----------|
| TS-001 | 37 unvalidated casts in settings-builders.ts | 2hr |
| TS-002 | 24 unvalidated casts in repository-insurance.ts | 1hr |
| TS-003 | Realtime broadcast payload unvalidated | 30min |
| SUPA-002 | No RepositoryError in 60%+ of repositories | 4hr |
| ERR-006 | stake-service silently returns null on failure | 30min |
| ERR-004 | content-study 5 files with untyped catch | 30min |
| ERR-005 | consumeQuota error silently swallowed | 15min |
| DT-001 | 40+ hardcoded hex/rgba colors | 4hr |
| DT-002 | 30+ hardcoded font sizes | 2hr |
| A11Y-001 | ~30+ interactive elements missing a11y labels | 4hr |
| A11Y-003 | Multiple components with hardcoded rgba | 2hr |
| A11Y-005 | OfflineBanner missing from many screens | 1hr |
| ARCH-002 | auth/repository.ts top-level Supabase client | 5min |
| ARCH-003 | content-study custom EventEmitter | 1hr |
| PERF-003 | Home screen fires 5+ parallel fetches | 2hr |
| PERF-006 | Prefetcher fires 10+ queries on start | 1hr |
| SLOP-001 | Empty setInterval in AnimatedCounter | 5min |
| SLOP-002 | PredictiveInterventionEngine no-op method | 1hr |
| SLOP-008 | Root-level debug/script files | 30min |
| RB-006 | Web sessionStorage auth persistence | 2hr |
| BLD-010 | Audit git history for committed secrets | 1hr |
| STORE-001 | iOS privacy manifest may be incomplete | 1hr |
| EDGE-002 | Rate limit creates new Supabase client per check | 30min |
| EDGE-003 | Rate limit uses console.error instead of structured logging | 15min |
| EDGE-006 | No migration for check_rate_limit RPC | 30min |
| MEM-001 | PredictiveInterventionEngine Maps grow unbounded | 30min |
| MEM-002 | Event Bus subscriptions may leak | 1hr |
| MEM-005 | Offline queue may have no max size enforcement | 30min |
| TZ-001 | Client timezone not synced with server | 1hr |
| TZ-003 | No consistent date formatting library | 1hr |
| OTA-003 | No rollback strategy documented | 30min |
| CI-002 | No branch protection rules | 15min |
| CI-003 | No EAS build integration with GitHub | 30min |
| MON-001 | Sentry disabled in development builds | 30min |
| MON-003 | No PostHog feature flag evaluation tracking | 1hr |
| MON-004 | No health check or uptime monitoring | 1hr |

### LOW PRIORITY (Technical Debt Backlog)

| ID | Issue | Fix Time |
|----|-------|----------|
| TS-004 | AIResponse cast at fallback boundary | 30min |
| TS-005 | Proxy-based supabase export masks errors | 1hr |
| TS-006 | UserSchema type/schema drift risk | 30min |
| NAV-001 | RootNavigator complex useEffects | 2hr |
| NAV-002 | Deep linking config memoization audit | 15min |
| NAV-003 | Notification navigation before ready | 1hr |
| ST-001 | Auth store only persists isAuthenticated | 1hr |
| ST-004 | Session state not in Zustand | 4hr |
| PERF-001 | LoginScreen many animated values | 1hr |
| PERF-002 | FlashList estimatedItemSize accuracy | 2hr |
| PERF-004 | Timer setInterval re-render risk | 1hr |
| A11Y-002 | Analytics hardcoded font sizes | 1hr |
| A11Y-004 | Color blind palettes hardcoded hex | 1hr |
| A11Y-006 | AchievementRewards uses emojis | 30min |
| DEP-001 | TS 6.0.3 ignoreDeprecations | 30min |
| DEP-002 | Sentry RN 7.x Expo compatibility | 1hr |
| DEP-003 | Zustand 4.x — consider 5.x update | 2hr |
| DEP-004 | Supabase JS 2.103 — verify realtime compatibility | 1hr |
| DEP-005 | No ESLint in CI pipeline | 15min |
| TEST-001 | No auth flow integration tests | 4hr |
| TEST-002 | No realtime lifecycle tests | 2hr |
| TEST-003 | No economy RPC atomicity tests | 2hr |
| TEST-004 | No visual regression tests | 4hr |
| TEST-005 | Supabase types may be stale | 30min |
| FS-003-005 | Files near 200-line limit | 2hr |
| DT-003 | No CI check for hardcoded values | 1hr |
| BLD-004 | Verify shims don't ship in production | 30min |
| BLD-007 | Android adaptive icon hardcoded background | 5min |
| STORE-002 | ITSAppUsesNonExemptEncryption verification | 15min |
| STORE-003 | No app store metadata configuration | 2hr |
| STORE-005 | No semver strategy | 30min |
| IMG-002 | Splash screen asset may be too small | 30min |
| OTA-002 | EAS Update channels not configured | 30min |
| MEM-003 | Activity broadcast message buffer size | 15min |

### PRE-RELEASE EXECUTION ORDER (For Hermes)

Execute in this order to unblock the release:

```
PHASE 1 — Ship-Stoppers (Day 1, ~6 hours)
1. Delete credentials.json from workspace (RB-001)
2. Replace PLACEHOLDER certificate pin with real Supabase cert hash (BLD-001)
3. Run npx expo install --check to fix 4 outdated packages (BLD-002)
4. Replace RevenueCat Android key placeholder (STORE-004)
5. Remove dead ApiClient class (RB-003 / SLOP-005)
6. Fix SessionOrchestrator destruction on logout (RB-004)
7. Add SessionOrchestrator.destroy() to authStoreIntegrations.ts
8. Fix auth email enumeration in repository.ts (SEC-008)
9. Add error reporting to 7 swallowed session errors (ERR-001)
10. Add error reporting to onboarding flow errors (ERR-003)
11. Fix RootNavigator auth check error handling (ERR-002)
12. Set appStore isOnline default to false (ST-003)
13. Delete or disable PredictiveInterventionEngine (RB-005 / SLOP-002)
14. Create actual privacy policy and terms pages (BLD-009)

PHASE 2 — Security & Build (Day 1-2, ~5 hours)
1. Create and run RLS verification script (RB-002 / RB-007)
2. Enable RLS on any missing tables
3. Validate fileUri in content-study repository (SEC-002)
4. Add Zod validation to economy RPC params (SEC-007)
5. Add account deletion confirmation flow (SEC-006)
6. Remove localhost from production CORS (EDGE-004)
7. Add email verification check to edge function auth (EDGE-005)
8. Verify check_rate_limit RPC exists (EDGE-006)
9. Audit git history for committed secrets (BLD-010)
10. Verify New Architecture compatibility on real devices (BLD-003)
11. Test production build doesn't include shims (BLD-004)

PHASE 3 — Realtime & Data (Day 2, ~3 hours)
1. Add await to 4 channel.subscribe() calls (RT-001/002)
2. Fix useSquadChanges/useGuildQuests callback refs (RT-004)
3. Fix useSquadPresence race condition (RT-005)
4. Replace top 20 select('*') with column lists (SUPA-001)
5. Add RepositoryError to top 10 repositories (SUPA-002)

PHASE 4 — Cleanup & Memory (Day 2-3, ~4 hours)
1. Delete duplicate OfflineBanner (SLOP-004)
2. Delete empty AnimatedCounter setInterval (SLOP-001 / PERF-005)
3. Clean up root-level debug files (SLOP-008)
4. Fix untyped catch clauses (SEC-001 / ERR-004)
5. Add AppState handling for session backgrounding (MEM-004)
6. Add max size to PredictiveInterventionEngine Maps (MEM-001)
7. Add rate limit client per Supabase client reuse (EDGE-002)

PHASE 5 — File Size & Tokens (Day 3, ~3 hours)
1. Split LoginScreen.tsx (FS-002)
2. Split VexEditorialMark.tsx (FS-004)
3. Split VexAtmosphere.tsx (FS-003)
4. Remove unused babel path aliases (BLD-008)
5. Remove unused tsconfig path aliases

PHASE 6 — Infrastructure (Day 3, ~4 hours)
1. Install expo-updates and configure OTA (BLD-005 / OTA-001)
2. Configure splash screen (BLD-006)
3. Install husky + lint-staged (DEP-006)
4. Add pre-commit: typecheck + lint + banned patterns + line limit
5. Create GitHub Actions CI workflow (CI-001)
6. Add RLS check to CI
7. Run npm run types:supabase and verify (TEST-005)
8. Configure EAS Update channels (OTA-002)
9. Set up Sentry performance transactions (MON-002)
10. Test rollback procedure (OTA-003)

PHASE 7 — Architecture Cleanup (Post-Release Day 1-2)
1. Consolidate dual auth implementations (ARCH-001)
2. Migrate content-study EventEmitter to EventBus (ARCH-003)
3. Replace settings-builders.ts casts with Zod (TS-001)
4. Replace repository-insurance.ts casts with Zod (TS-002)
5. Install expo-image and optimize image loading (IMG-001)

PHASE 8 — Design Token Migration (Post-Release Week 1)
1. Create missing semantic color tokens (DT-001)
2. Replace hardcoded colors (40+ instances)
3. Replace hardcoded font sizes (30+ instances)
4. Add CI check for hardcoded values (DT-003)

PHASE 9 — Accessibility & Timezone (Post-Release Week 1)
1. Add missing accessibilityLabel to 30+ elements (A11Y-001)
2. Add OfflineBanner to AppScreen wrapper (A11Y-005)
3. Replace emoji icons with SVG (A11Y-006)
4. Sync timezone with server profile (TZ-001)
5. Fix streak boundary calculations (TZ-002)

PHASE 10 — Test Coverage & Monitoring (Post-Release Week 2)
1. Auth flow integration tests (TEST-001)
2. Realtime lifecycle tests (TEST-002)
3. Economy atomicity tests (TEST-003)
4. Set up uptime monitoring (MON-004)
5. PostHog feature flag tracking (MON-003)
```

### RELEASE SIGN-OFF CHECKLIST

Before pushing to production, verify EVERY item:

```
── CRITICAL (Must be ✅ before any build) ──────────────────────────────
[ ] credentials.json deleted and never committed to git history
[ ] Certificate pinning hash is NOT "PLACEHOLDER_REPLACE_BEFORE_SHIP"
[ ] RevenueCat Android key is NOT "your_android_key_here"
[ ] npx expo install --check passes (all packages SDK-56 compatible)
[ ] npx expo-doctor passes with 0 failures
[ ] Dead ApiClient class removed from src/api/client.ts
[ ] SessionOrchestrator.destroy() called in deinitializeServicesAfterLogout()
[ ] PredictiveInterventionEngine either fully implemented or disabled/stubbed
[ ] RLS enabled on every public Supabase table (verified by SQL query)
[ ] RLS verification script exists and runs green in CI
[ ] Auth error messages are generic (no email enumeration)
[ ] Session control errors (7 places) report to Sentry
[ ] Onboarding errors report to user and Sentry
[ ] Privacy policy and terms URLs return actual content (200 OK)

── BUILD & NATIVE ─────────────────────────────────────────────────────
[ ] npx tsc --noEmit passes with ZERO errors
[ ] npm run lint passes with ZERO errors
[ ] npm run check:banned-patterns passes
[ ] npm run check:line-limit passes
[ ] npm run types:supabase output matches current schema
[ ] EAS production build succeeds for iOS
[ ] EAS production build succeeds for Android
[ ] Production build does NOT include Expo Go shims
[ ] transform-remove-console strips console.log in production (but keeps error/warn)
[ ] New Architecture tested on real devices (iOS + Android)
[ ] All native modules work: MMKV, Sentry, RevenueCat, Skia, FlashList, Reanimated
[ ] splash.png is at least 1242x2436 pixels
[ ] icon.png is at least 1024x1024 pixels
[ ] adaptive-icon foreground has proper safe zone

── SECURITY ─────────────────────────────────────────────────────────────
[ ] RLS enabled on every Supabase table (verified by SQL)
[ ] No Supabase queries in component files (verified by search)
[ ] No business logic in component files (verified by search)
[ ] content-study fileUri validated before fetch
[ ] Economy RPC amounts validated with Zod before call
[ ] Account deletion has user confirmation
[ ] Edge function CORS does NOT include localhost in production
[ ] Edge function auth checks email verification
[ ] check_rate_limit RPC exists in Supabase
[ ] git history audited for accidentally committed secrets
[ ] .env.local NOT in git history
[ ] credentials.json NOT in git history

── REALTIME & SUBSCRIPTIONS ───────────────────────────────────────────
[ ] All Supabase channel.subscribe() calls use await
[ ] All realtime hooks use refs for callbacks (not direct deps in useEffect)
[ ] useSquadPresence race condition fixed
[ ] PredictiveInterventionEngine setInterval stopped on logout

── ERROR HANDLING ──────────────────────────────────────────────────────
[ ] No catch (e) — all are catch (e: unknown)
[ ] No swallowed errors in session controls
[ ] No swallowed errors in onboarding flow
[ ] RootNavigator auth check errors reported
[ ] consumeQuota failures logged via captureSilentFailure

── CODE QUALITY ────────────────────────────────────────────────────────
[ ] No @ts-nocheck or @ts-ignore in src/
[ ] No console.log in src/ (verified by search)
[ ] No StyleSheet.create in src/
[ ] No FlatList or Animated from react-native in src/
[ ] No AsyncStorage in src/
[ ] No direct expo-haptics imports outside haptics.ts
[ ] No .part-N.ts files in src/
[ ] No TODO comments in shipped code
[ ] All files under 200 lines (except auto-generated supabase.ts)
[ ] RepositoryError used in all repository files

── FUNCTIONAL VERIFICATION ─────────────────────────────────────────────
[ ] Login flow works on fresh install (iOS)
[ ] Login flow works on fresh install (Android)
[ ] Logout clears all state and redirects to login
[ ] Token refresh works (force expiry and verify auto-refresh)
[ ] Deep links work from cold start (notification tap)
[ ] Offline mode shows degraded state (not crash)
[ ] Session timer works correctly with background/foreground
[ ] In-app purchase flow works on iOS (sandbox)
[ ] In-app purchase flow works on Android (sandbox)
[ ] Streak calculations correct across timezone boundaries
[ ] Account deletion flow completes successfully
[ ] Push notifications received and handled
[ ] Sentry captures errors in staging build
[ ] RevenueCat entitlements verify in staging

── INFRASTRUCTURE ──────────────────────────────────────────────────────
[ ] expo-updates installed and configured for OTA
[ ] OTA update tested on staging
[ ] Rollback procedure documented and tested
[ ] EAS Update channels configured
[ ] GitHub Actions CI workflow created
[ ] Pre-commit hooks installed (typecheck, lint, banned patterns, line limit)
[ ] Branch protection enabled on main
[ ] EAS connected to GitHub for auto-builds
[ ] Sentry performance transactions defined for critical paths
[ ] Uptime monitoring configured for Supabase + edge functions

── APP STORE ──────────────────────────────────────────────────────────
[ ] Privacy policy page live at vex.app/privacy
[ ] Terms of service page live at vex.app/terms
[ ] iOS privacy manifest complete and accurate
[ ] App Store metadata prepared (description, keywords, screenshots)
[ ] Google Play metadata prepared
[ ] Age rating determined and configured
[ ] Review notes prepared for Apple/Google reviewers
[ ] App version is correct in app.json AND constants/app.ts
```

---

## APPENDIX A: FILES REQUIRING IMMEDIATE ATTENTION

| File | Lines | Primary Issues |
|------|-------|---------------|
| `src/api/client.ts` | 166 | RB-003: Dead code, throws on every request |
| `src/session/SessionOrchestrator.ts` | 198 | RB-004: Singleton never destroyed |
| `src/features/ai-coach/PredictiveInterventionEngine.ts` | 200 | RB-005: No-op setInterval, unbounded Maps |
| `src/screens/auth/LoginScreen.tsx` | 313 | FS-002: Over 200 lines, hardcoded colors |
| `src/features/settings/settings-builders.ts` | 90 | TS-001: 37 unvalidated casts |
| `src/features/streaks/repository-insurance.ts` | 185 | TS-002: 24 unvalidated casts |
| `src/services/realtimeSubscriptions.ts` | 186 | RT-001/002: Missing await on subscribe() |
| `src/hooks/useRealtime.ts` | 184 | RT-004/005: Callback dep issues, race condition |
| `src/persistence/SecureStorage.ts` | 189 | RB-006: sessionStorage loses auth on web |
| `src/shared/ui/components/AnimatedCounter.tsx` | - | SLOP-001: Empty setInterval at 60fps |
| `src/screens/session/ActiveSessionContent.tsx` | - | ERR-001: 7 swallowed errors |
| `src/features/content-study/repository.ts` | 159 | SEC-002: Raw fetch without validation |
| `src/features/economy/repository.ts` | 63 | SEC-007: No amount validation, useless wrapper |
| `src/navigation/RootNavigator.tsx` | 180 | NAV-001: Complex effects, swallowed auth error |
| `app.json` | 171 | BLD-001: PLACEHOLDER cert pin, BLD-009: wrong URLs |
| `plugins/withCertificatePinning.js` | 64 | BLD-001: Cert pin config using placeholder |
| `supabase/functions/_shared/cors.ts` | 70 | EDGE-004: Localhost in production |
| `supabase/functions/_shared/auth.ts` | 38 | EDGE-005: No email/role verification |
| `supabase/functions/_shared/rate-limit.ts` | 46 | EDGE-002: New client per check, EDGE-003: console.error |
| `.env.local` | 14 | STORE-004: Android RC key placeholder, RB-002: exposed keys |

## APPENDIX B: SUPABASE TABLES REQUIRING RLS VERIFICATION

Every table referenced in repository files must have RLS enabled:

```
streak_insurance, streak_gambles, comeback_tokens, study_content,
study_generations, feed_items, squad_members, guild_quests,
study_plans, user_challenges, challenges, focus_contracts,
focus_memory_entries, user_settings, notification_schedules,
coach_messages, coach_state, coach_recommendations, coach_reminders,
coach_memories, coach_personas, coach_interventions, user_progression,
user_achievements, user_xp, user_currency, user_wallet, user_inventory,
streaks, streak_shields, user_presences, sessions, session_stakes,
user_pledges, personal_bests, boss_encounters, boss_templates,
content_reviews, ai_quota, notifications, notification_preferences,
user_profiles, squad_memberships, comeback_quests, focus_identity_scores,
focus_contracts, personal_bests, companion_memories, companion_promises,
rescue_completions, onboarding_profiles, companion_profiles,
rate_limits, season_journey, study_circles, study_buddies,
session_stories, squad_wars
```

Run in Supabase SQL editor:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT IN (
  SELECT DISTINCT c.relname FROM pg_class c
  JOIN pg_policy p ON p.polrelid = c.oid
  WHERE c.relnamespace = 'public'::regnamespace
);
```

Any table returned by this query LACKS RLS and is a CRITICAL security hole.

## APPENDIX C: COMMANDS FOR HERMES VALIDATION

```bash
# Expo doctor — must pass with 0 failures
npx expo-doctor

# Fix package mismatches
npx expo install --check

# Type check — must pass with zero errors
npx tsc --noEmit

# Lint — must pass with zero errors
npm run lint

# Banned patterns check
npm run check:banned-patterns

# Line limit check
npm run check:line-limit

# No ts-nocheck
npm run check:no-ts-nocheck

# Debt freeze check
npm run check:debt-freeze

# Run all tests
npm test

# Regenerate Supabase types
npm run types:supabase

# Search for remaining hardcoded colors
rg -n "#[0-9a-fA-F]{3,8}" src -g "*.tsx" -g "*.ts" | Where-Object { $_ -notmatch "theme|tokens|colorBlind" }

# Search for remaining select('*')
rg -n "select\('\*'\)" src -g "*.ts"

# Search for remaining untyped catch
rg -n "catch\s*\(\s*e\s*\)" src -g "*.ts" -g "*.tsx"

# Search for swallowed errors
rg -n "\.catch\(\(\)\s*=>\s*undefined\)|\.catch\(\(\)\s*=>\s*\{\s*\}\)" src -g "*.ts" -g "*.tsx"

# Search for PLACEHOLDER in config files
rg -n "PLACEHOLDER" app.json plugins/ eas.json

# Search for placeholder API keys
rg -n "your_.*_key_here|PLACEHOLDER" .env.local

# Verify certificate pin is not placeholder
rg -n "PLACEHOLDER_REPLACE_BEFORE_SHIP" app.json plugins/

# Check for hardcoded rgba in non-token files
rg -n "rgba\(" src -g "*.tsx" | Where-Object { $_ -notmatch "theme|tokens" }

# Check for hardcoded fontSize in non-token files
rg -n "fontSize:\s*\d+" src -g "*.tsx" | Where-Object { $_ -notmatch "theme|tokens" }

# Search for files over 200 lines (non-test, non-generated)
Get-ChildItem src -Recurse -File -Include *.ts,*.tsx | Where-Object { $_.DirectoryName -notmatch "__tests__" -and $_.Name -notmatch "\.test\.|\.d\.ts|supabase\.ts" } | ForEach-Object { $l = (Get-Content $_.FullName | Measure-Object -Line).Lines; if ($l -gt 200) { "$l $($_.FullName)" } }

# Verify RLS on all tables (run in Supabase SQL editor)
# See Appendix B query

# Performance audit
npm run perf:audit

# Verify production build
npx expo export --platform ios
npx expo export --platform android

# Test EAS build (staging first)
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Test OTA update on staging
eas update --branch preview --message "test update"
```

## APPENDIX D: CERTIFICATE PIN HASH GENERATION

```bash
# Get Supabase certificate SHA-256 pin
echo | openssl s_client -connect icnbpjkyupuqzuvwuvbk.supabase.co:443 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der 2>/dev/null | openssl dgst -sha256 -binary | openssl enc -base64

# Get backup pin (for cert rotation)
# Use the intermediate CA certificate
echo | openssl s_client -connect icnbpjkyupuqzuvwuvbk.supabase.co:443 -showcerts 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der 2>/dev/null | openssl dgst -sha256 -binary | openssl enc -base64
```

## APPENDIX E: NEW ARCHITECTURE COMPATIBILITY MATRIX

Before shipping with `newArchEnabled: true`, verify each native module:

| Module | New Arch Compatible | Test Required |
|--------|--------------------|---------------|
| react-native-mmkv | ✅ (v2.11+) | MMKV read/write |
| react-native-purchases (RevenueCat) | ✅ (v10+) | Purchase flow |
| @sentry/react-native | ✅ (v7+) | Error capture |
| @shopify/flash-list | ✅ (v2+) | Scroll performance |
| @shopify/react-native-skia | ✅ (v1+) | Canvas rendering |
| react-native-reanimated | ✅ (v4+) | Animation playback |
| react-native-gesture-handler | ✅ (v2.18+) | Gesture recognition |
| react-native-svg | ✅ (v15+) | SVG rendering |
| expo-secure-store | ✅ | Token read/write |
| expo-notifications | ✅ | Push notification delivery |
| @gorhom/bottom-sheet | ✅ (v5+) | Bottom sheet open/close |
| react-native-safe-area-context | ✅ | Safe area insets |
| react-native-screens | ✅ | Screen transitions |
| expo-linear-gradient | ✅ | Gradient rendering |

If ANY module fails in a New Arch production build, set `newArchEnabled: false` for that platform.

---

> **END OF REVIEW** — This document represents the complete audit findings as of 2026-05-30.
> **Total findings:** 100+ across 26 sections
> **Critical blockers:** 14 | **High:** 26 | **Medium:** 32 | **Low:** 25+
> Execute Phase 1 first. Every item in the Release Sign-Off Checklist must be green before shipping.
