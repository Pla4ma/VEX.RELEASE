# VEX APP — FINAL RELEASE AUDIT & READINESS REPORT
## Generated: May 30, 2026 | Target: App Store + Play Store Submission
## Scope: Entire codebase deep audit — Security, Performance, Architecture, Accessibility, Testing, CI/CD, Release Blockers

---

# TABLE OF CONTENTS

1. [EXECUTIVE SUMMARY](#1-executive-summary)
2. [SECURITY AUDIT](#2-security-audit)
   - 2.1 Hardcoded Secrets & Environment Variables
   - 2.2 Insecure Storage (MMKV vs SecureStorage)
   - 2.3 Input Validation Gaps (Zod)
   - 2.4 Authentication & Authorization
   - 2.5 RLS & Service Role Risks
   - 2.6 Insecure Random Generation
   - 2.7 PII in Logs & Error Messages
   - 2.8 Certificate Pinning
   - 2.9 Deep Link Security
   - 2.10 XSS & Injection
   - 2.11 Rate Limiting
   - 2.12 Realtime/WebSocket Security
3. [PERFORMANCE AUDIT](#3-performance-audit)
   - 3.1 Missing Memoization (React.memo, useMemo, useCallback)
   - 3.2 Inline Functions in JSX
   - 3.3 Image Optimization
   - 3.4 Unnecessary Re-renders
   - 3.5 Missing Debounce/Throttle
   - 3.6 Bundle Size & Import Optimization
   - 3.7 Lazy Loading Gaps
   - 3.8 Supabase Query Optimization
   - 3.9 TanStack Query Configuration
   - 3.10 Realtime Subscription Overhead
   - 3.11 List Virtualization
   - 3.12 Heavy Computations on Main Thread
4. [ARCHITECTURE & CODE QUALITY AUDIT](#4-architecture--code-quality-audit)
   - 4.1 Files Exceeding 200-Line Limit
   - 4.2 Banned Pattern Violations
   - 4.3 Feature Directory Structure Compliance
   - 4.4 Barrel Export / Public API Violations
   - 4.5 Business Logic in Screens/Components
   - 4.6 Supabase Types Leaking to Public API
   - 4.7 Navigation Type Registration Gaps
   - 4.8 Orphaned & Stub Code
   - 4.9 Hardcoded Hex Colors Outside Theme Tokens
   - 4.10 Duplicate Type Definitions
   - 4.11 Circular Dependency Risks
   - 4.12 Redirect Files / Barrel Re-exports
   - 4.13 Repository Helper File Bypasses
5. [ACCESSIBILITY AUDIT](#5-accessibility-audit)
   - 5.1 Missing accessibilityLabels
   - 5.2 Missing accessibilityRole
   - 5.3 Missing accessibilityHint
   - 5.4 Touch Target Size Violations
   - 5.5 Color Contrast
   - 5.6 Screen Reader Support
6. [TESTING & CI/CD AUDIT](#6-testing--cicd-audit)
   - 6.1 Test Coverage Overview
   - 6.2 Features With Zero Tests
   - 6.3 Excluded/Disabled Tests
   - 6.4 Legacy Failing Tests
   - 6.5 E2E Test Coverage
   - 6.6 Coverage Threshold Verification
   - 6.7 CI/CD Pipeline Assessment
7. [RELEASE PHASE — BLOCKERS & PRE-FLIGHT CHECKLIST](#7-release-phase--blockers--pre-flight-checklist)
   - 7.1 CRITICAL Release Blockers (Must Fix Before Release)
   - 7.2 HIGH Priority (Must Fix Before Release)
   - 7.3 MEDIUM Priority (Should Fix Before Release)
   - 7.4 LOW Priority (Can Defer)
   - 7.5 Store Submission Readiness Checklist
   - 7.6 Post-Release Monitoring Plan
   - 7.7 Pre-Submission Final Verification Steps
   - 7.8 Release Runbook

---

# 1. EXECUTIVE SUMMARY

## App Statistics
- **Total TypeScript/TSX Files**: 4,557
- **Feature Directories**: 56
- **Supabase Edge Functions**: 6 (ai, ai-coach, content-study, session-complete, trigger-jobs, season-finalize)
- **Supabase Migrations**: 38
- **Test Files**: 1,136 (8,643 test cases, 97.3% pass rate)
- **Dirty Worktree Files**: 86 uncommitted changes
- **Dependencies**: Expo SDK 56, React Navigation v6, TanStack Query v5, Zustand, Reanimated 4.3.1, Zod, Supabase

## Overall Release Readiness: 72%
The codebase is remarkably disciplined for its size. Zero instances of the most egregious banned patterns (`@ts-ignore`, `console.log`, `// TODO`, `StyleSheet.create`, `AsyncStorage`). The primary release concerns are security (secrets on disk, insecure random), and architecture hygiene (files >200 lines, bypassed barrel exports, business logic in screens).

## Audit Severity Distribution
| Severity | Count | Must Fix Before Release |
|----------|-------|------------------------|
| CRITICAL | 2 | Yes |
| HIGH | 12 | Yes |
| MEDIUM | 28 | Yes (most) |
| LOW | 41 | Can defer some |

---

# 2. SECURITY AUDIT

## 2.1 Hardcoded Secrets & Environment Variables

### CRITICAL — Live production secrets in `.env.server`

| File | Line | Secret | Risk |
|------|------|--------|------|
| `.env.server` | 2 | `TRIGGER_SECRET_KEY=tr_dev_An7iN50YExZ153vyhFHD` | Trigger.dev development secret key leaked |
| `.env.server` | 7 | `SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Full Supabase service role JWT — grants full database access, bypasses RLS |
| `.env.server` | 11 | `GEMINI_API_KEY=AIzaSyBJxv7QV26pOIVH2K7CsW1-DD-Zs2_M24w` | Google Gemini API key — billable, can be abused |
| `.env.server` | 13 | `PINECONE_API_KEY=pcsk_3csQjF_Mdgj4pzKXFPXNLKp8hJhWXZmRHrvU8kqDE87BycwKWffcG5CnXiccNNJWiamBHn` | Pinecone vector DB API key — data exfiltration risk |
| `.env.server` | 8 | `SENTRY_DSN=https://c02d42adbcaae587f26cfe5ec1ee5815@...` | Sentry DSN for error ingestion |

### FIX REQUIRED:
```
1. ROTATE ALL KEYS immediately:
   - TRIGGER_SECRET_KEY: Create new key at https://app.trigger.dev → revoke old one
   - SUPABASE_SERVICE_KEY: Generate new JWT in Supabase Dashboard → Settings → API
   - GEMINI_API_KEY: Create new key at https://aistudio.google.com/apikey → revoke old one
   - PINECONE_API_KEY: Create new key at https://app.pinecone.io → API Keys → revoke old one
   - SENTRY_DSN: Create new DSN in Sentry → Project Settings → Client Keys

2. Audit git history for any commits that accidentally included this file:
   git log --all --full-history -- ".env.server"
   If any commits exist, the keys are permanently compromised. Rotate all of them.

3. Add .env.server to .gitignore (already done, verified)
4. Consider using a secrets manager (AWS Secrets Manager, Doppler, Infisical) instead of .env files
```

### HIGH — EXPO_PUBLIC_ keys bundled into app binary

| File | Line | Key | Risk |
|------|------|-----|------|
| `.env.local` | 5 | `EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_W_fG4QxH5XiUuxp7uSW9_A_gDYVEov1` | Supabase anon key — exposes project URL to attackers |
| `.env.local` | 6 | `EXPO_PUBLIC_SENTRY_DSN=https://c02d42adbcaae587f26cfe5ec1ee5815@...` | Sentry DSN — can be used for log pollution |
| `.env.local` | 8 | `EXPO_PUBLIC_POSTHOG_KEY=phc_qBqUpSeWYMR97jQHmxpG2xgSutrXrgzscSt7NgGVNLim` | PostHog public key — acceptable for analytics |
| `.env.local` | 13 | `EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_tHYEpsMvGBINzPOxMPyWHgfcJfa` | RevenueCat publishable key — acceptable (designed to be public) |
| `.env.local` | 14 | `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_key_here` | PLACEHOLDER — needs real Android key |

### FIX REQUIRED:
```
EXPO_PUBLIC_ variables are readable by anyone who extracts the app bundle.
This is unavoidable. Mitigations:

1. Ensure RLS policies are airtight on all Supabase tables — the anon key should
   only be able to access data the current user owns.
2. Set up Supabase Row-Level Security policies on ALL tables (verify with scripts/check-rls.js).
3. Replace EXPO_PUBLIC_REVENUECAT_ANDROID_KEY placeholder with real key from RevenueCat dashboard.
4. Set up Sentry rate limiting to prevent log pollution via DSN exposure.
```

---

## 2.2 Insecure Storage (MMKV vs SecureStorage)

### MEDIUM — Unencrypted MMKV instances store potentially sensitive data

| File | Line | Finding |
|------|------|---------|
| `src/features/ai-coach/session/offline-queue.ts` | 6 | `new MMKV({ id: 'coach-offline-queue' })` — no `encryptionKey`. Offline queue may contain user messages and mutation payloads. |
| `src/features/ai-coach/store/storage.ts` | 11 | `new MMKV({ id: 'coach-store' })` — no encryption. Stores coach preferences, message state, potential PII. |
| `src/store/authStore.ts` | 20 | Zustand persist middleware uses `MMKVStorageAdapter` (unencrypted). Persisted `isAuthenticated` and `user.id` leak auth state fingerprint. |
| `src/persistence/MMKVStorageAdapter.ts` | 17-18 | Singleton MMKV `zustand-storage` with no `encryptionKey` — all Zustand persisted state is unencrypted. |

### FIX REQUIRED:
```typescript
// src/features/ai-coach/session/offline-queue.ts - LINE 6
// CHANGE:
new MMKV({ id: 'coach-offline-queue' })
// TO:
new MMKV({ id: 'coach-offline-queue', encryptionKey: getMmkvEncryptionKeySync() })

// src/store/authStore.ts - ADD encryptionKey to persist config
// src/persistence/MMKVStorageAdapter.ts - LINE 17-18
// ADD encryptionKey parameter option to the adapter
```

### VERIFIED SECURE (no action needed):
- `src/session/utils/persistence.ts:23` — correctly encrypted with `getMmkvEncryptionKeySync()`
- `src/features/ai-coach/service/coach-memory.ts:18` — correctly encrypted
- `src/persistence/SecureStorage.ts:10` — correctly uses `expo-secure-store` for auth tokens
- `src/config/supabase.ts:26-30` — Supabase session storage uses `SecureStorage` backend

---

## 2.3 Input Validation Gaps (Zod)

### MEDIUM — Weak password validation on login

| File | Line | Finding |
|------|------|---------|
| `src/screens/auth/schemas.ts` | 29-33 | `loginSchema` checks `password: z.string().min(1, 'Password is required')`. No strength requirements. Allows brute-force attempts with any single character. The register schema (lines 16-27) is strong — the login schema should match. |

### FIX REQUIRED:
```typescript
// src/screens/auth/schemas.ts - LINE 29-33
// CHANGE:
password: z.string().min(1, 'Password is required'),
// TO:
password: z.string().min(8, 'Password must be at least 8 characters'),
// Note: Don't enforce complexity on login — just minimum length to deter empty-password brute force.
// Lock rate limiting should be enforced server-side (via Supabase Auth settings).
```

### LOW — Missing format validation on reset tokens

| File | Line | Finding |
|------|------|---------|
| `src/screens/auth/schemas.ts` | 68 | `token: z.string().min(1)` — reset token has no format/pattern validation. Should validate UUID or JWT format depending on implementation. |

### LOW — Missing max() constraints on user preference strings

| File | Line | Finding |
|------|------|---------|
| `src/features/auth/schemas.ts` | 7-40 | `UserPreferencesSchema` has no `max()` constraints on `theme`, `language`, `timezone` strings. Arbitrary-length strings can be inserted. |

### FIX REQUIRED:
```typescript
// src/features/auth/schemas.ts - ADD max() constraints
theme: z.string().max(50),
language: z.string().max(10),
timezone: z.string().max(100),
```

---

## 2.4 Authentication & Authorization

### VERIFIED SECURE — All queries include user_id filters

All repository files in `src/features/*/repository.ts` consistently use `.eq('user_id', userId)` filters. The auth identity comes from the Supabase SDK session. No unauthorized cross-user access is possible on the client side.

### VERIFIED SECURE — Edge functions validate JWT

Edge functions in `supabase/functions/*/index.ts` validate the user's JWT before processing requests, then use the service role key for database operations. The auth module in `supabase/functions/_shared/auth.ts` validates JWTs via HMAC-SHA256 using `SUPABASE_JWT_SECRET`.

---

## 2.5 RLS & Service Role Risks

### MEDIUM — RLS verification is manual and has no CI integration

| File | Line | Finding |
|------|------|---------|
| `scripts/check-rls.js` | 1-136 | RLS verification script exists but is manual. Requires `SUPABASE_SERVICE_ROLE_KEY` environment variable. Not integrated into CI pipeline. |

### FIX REQUIRED:
```
1. Run: node scripts/check-rls.js
   Verify that ALL tables have RLS enabled and policies defined.

2. Add a GitHub Actions step to run this script on PRs that touch supabase/migrations/:
   - name: Verify RLS policies
     run: node scripts/check-rls.js
     env:
       SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

3. Ensure edge functions using service role NEVER return raw database error messages
   to the client. All errors should be caught and returned as generic messages.
```

---

## 2.6 Insecure Random Generation

### HIGH — Math.random() as crypto fallback in UUID generation

| File | Line | Finding |
|------|------|---------|
| `src/utils/uuid.ts` | 46 | `bytes[index] = Math.floor(Math.random() * 256)` — used as fallback when `crypto.getRandomValues` is unavailable. Math.random() is NOT cryptographically secure. This fallback produces predictable UUIDs that can be exploited for IDOR or session hijacking attacks. |

### FIX REQUIRED:
```typescript
// src/utils/uuid.ts - LINE 38-48
// REPLACE the Math.random() fallback with:
function getRandomBytes(length: number): Uint8Array {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    return globalThis.crypto.getRandomValues(new Uint8Array(length));
  }
  // Fallback: expo-crypto polyfill
  // Import expo-crypto at top: import * as Crypto from 'expo-crypto'
  throw new Error('Crypto API unavailable — UUID generation failed');
  // NEVER fall back to Math.random() for UUIDs
}
```

### MEDIUM — Math.random() for IDs in production paths

| File | Line | Usage |
|------|------|-------|
| `src/session/utils/idGenerator.ts` | 24 | `Math.floor(Math.random() * 10000).toString(36)` for session IDs |
| `src/session/utils/idGenerator.ts` | 32 | `Math.random().toString(36).substring(2, 6)` for short IDs |
| `src/features/ai-coach/service/intervention-engine-helpers.ts` | 147 | `Math.random().toString(36).substring(2, 11)` for execution IDs |
| `src/features/session-start/events.ts` | 14 | `Math.random().toString(36).substr(2, 9)` for event IDs |
| `src/features/notifications/events.ts` | 178 | Same pattern for notification event IDs |

### FIX REQUIRED:
```
Replace ALL Math.random() calls in ID generation with uuid v4 (from src/utils/uuid.ts).
These ID generators should use the existing uuid utility:
  import { v4 } from '../../utils/uuid';
  const id = v4();

Exception: Math.random() used for UI effects (Confetti.tsx, VexAtmosphere.tsx) is acceptable.
```

---

## 2.7 PII in Logs & Error Messages

### MEDIUM — Edge function console.error calls may expose PII

| File | Line | Finding |
|------|------|---------|
| `supabase/functions/content-study/handlers.ts` | 151 | `console.error('Extraction failed for content:', contentId, e)` — exposes UUID |
| `supabase/functions/content-study/handlers.ts` | 176 | `console.error('Save failed:', genError)` — may expose full error with user data |
| `supabase/functions/content-study/handlers.ts` | 183 | `console.error('Generation failed:', e)` — may expose full error |
| `supabase/functions/trigger-jobs/index.ts` | 60 | `console.error('trigger-jobs failed:', error)` |
| `supabase/functions/season-finalize/index.ts` | 33 | `console.error('season-finalize failed:', error)` |
| `supabase/functions/_shared/rate-limit.ts` | 22 | `console.log(...)` with user ID and request type — logs PII to Supabase function logs |

### FIX REQUIRED:
```typescript
// For each console.error in edge functions, replace with structured logging:
// Instead of: console.error('Extraction failed for content:', contentId, e)
// Use: console.error(JSON.stringify({
//   event: 'extraction_failed',
//   content_id: contentId,
//   error_type: e?.constructor?.name,
//   error_message: e?.message
// }))
// This ensures logs are parseable and don't accidentally leak full stack traces.

// For rate-limit.ts line 22 — REMOVE console.log entirely or replace with:
// Sentry (or edge function logger) with user ID excluded from log but included in structured metadata.
```

### VERIFIED SECURE:
- `src/config/sentry.ts:34` — `sendDefaultPii: false` — correct
- `src/config/sentry.ts:95-103` — `setSentryUser()` only sets `id`, not email/username
- `src/shared/analytics/privacy.ts:6-27` — `SENSITIVE_KEY_PARTS` list filters emails, passwords, tokens, names
- `src/shared/analytics/privacy.ts:123-133` — `looksSensitiveString()` filters @-containing strings and long alphanumeric tokens

---

## 2.8 Certificate Pinning

### MEDIUM — No certificate pinning configured

Zero references to certificate pinning, SSL pinning, or trustkit found anywhere in the codebase.

The app connects to these external services:
- `*.supabase.co` — Database, Auth, Storage
- `generativelanguage.googleapis.com` — Gemini AI
- `api.trigger.dev` — Background jobs
- `us.i.posthog.com` — Analytics
- `ingest.us.sentry.io` — Error tracking
- `api.revenuecat.com` — Purchases

### FIX REQUIRED:
```
For Expo managed workflow, certificate pinning requires an Expo Config Plugin.
Options:
1. expo-ssl-pinning plugin: https://github.com/expo/config-plugins
2. Custom config plugin in plugins/ directory:
   Create plugins/ssl-pinning.js that modifies Android's network_security_config.xml
   and iOS's Info.plist NSAppTransportSecurity settings.

3. Alternatively, implement application-level certificate pinning using
   react-native-ssl-pinning or expo-build-properties plugin.

Priority: Pin Supabase and RevenueCat connections first (handle auth and payments).
```

---

## 2.9 Deep Link Security

### VERIFIED SECURE

| File | Finding |
|------|---------|
| `src/navigation/deep-link-parser.ts:36-97` | Validates URLs, checks schemes (`vex:` and `https:`), validates against `DeepLinkUrlSchema` (Zod), rejects unknown paths |
| `src/navigation/navigation-deep-links.ts:63-85` | `sanitizeParams()` strips `<>` characters, truncates to 1000 chars |
| `src/navigation/linking-config.ts:11` | OAuth callback validates host is `vex:` and hostname is `auth` |
| `src/navigation/hooks/useOAuthCallbackListener.ts:8` | Same check for OAuth callback URLs |

No action needed. Deep link routing is type-safe and validated.

---

## 2.10 XSS & Injection

### VERIFIED SECURE

- No `dangerouslySetInnerHTML` found in codebase
- No `innerHTML`, `insertAdjacentHTML`, `document.write` found
- Content renders via React Native `<Text>` components which auto-escape
- `src/features/ai-coach/input/llm-input-sanitizer.ts:12-19` — prompt injection detection with regex
- `supabase/functions/content-study/extractors.ts:77` — `sanitizeUserContent()` strips control characters
- `supabase/functions/ai/gemini.ts:47` — `sanitizeContent()` strips null bytes

No SQL injection risk — all database access uses Supabase query builder (parameterized).

---

## 2.11 Rate Limiting

### MEDIUM — No rate limiting on direct client-to-Supabase REST calls

| Scope | Status |
|-------|--------|
| Edge functions (`ai`, `ai-coach`, `session-complete`) | Protected by server-side rate limiter in `supabase/functions/_shared/rate-limit.ts` |
| Client-side rate limiter | Token bucket in `src/utils/rate-limiter.ts` for XP_EVENTS, SESSIONS, AI_QUERIES |
| Direct repository calls | **UNPROTECTED** — `src/features/*/repository.ts` calls to Supabase REST API have no client-side rate limiter |

### FIX REQUIRED:
```
Option 1 (Server-side): Enable Supabase Auth rate limiting in Supabase Dashboard
  → Authentication → Rate Limiting → Enable login/register limits

Option 2 (Database): Add RLS policies that limit INSERT/UPDATE frequency:
  CREATE POLICY "rate_limit_inserts" ON focus_score_history
    FOR INSERT WITH CHECK (
      (SELECT count(*) FROM focus_score_history
       WHERE user_id = auth.uid()
       AND created_at > now() - interval '1 minute') < 30
    );

Option 3 (Client): Wrap repository insert functions with rate limiter from src/utils/rate-limiter.ts
```

---

## 2.12 Realtime/WebSocket Security

### VERIFIED SECURE

- `src/services/realtimeSubscriptions.ts:30-64` — Channels scoped to `user_id=eq.${userId}`
- `src/services/realtimeSubscriptions.ts:58-63` — Cleanup returns `channel.unsubscribe()`
- `src/services/realtimeShared.ts:37` — `activeChannels` map tracks all channels
- No raw WebSocket connections — all realtime through Supabase `channel()` API

### LOW — Multiple channels per user without deduplication (see Performance section 3.10)

---

# 3. PERFORMANCE AUDIT

## 3.1 Missing Memoization (React.memo, useMemo, useCallback)

### HIGH — Only 1 component uses React.memo across 245+ components

| File | Line | Finding |
|------|------|---------|
| `src/session/components/PurityHUD.tsx` | 25 | The ONLY `React.memo` usage in the entire codebase |

These expensive, data-driven components MUST be wrapped in `React.memo`:

| File | Line | Component | Why |
|------|------|-----------|-----|
| `src/components/Banner.tsx` | 38 | `Banner` | Image rendering, stable props |
| `src/components/Avatar.tsx` | 35 | `Avatar` | Image rendering, inline onPress |
| `src/features/challenges/components/ChallengeHub.tsx` | 26 | `ChallengeHub` | FlashList with complex filtering |
| `src/features/challenges/components/ChallengeList.tsx` | — | `ChallengeList` | FlashList-backed list |
| `src/features/home-spine/components/RecentSessionsList.tsx` | 25 | `RecentSessionsList` | Animated FlashList |
| `src/features/content-study/components/YouTubeVideoPreview.tsx` | 21 | `YouTubeVideoPreview` | Remote Image rendering |
| `src/screens/profile/AchievementsScreen.tsx` | 22 | `AchievementsScreen` | FlashList + complex filtering |
| `src/screens/profile/ProfileActivityTab.tsx` | 77 | `ProfileActivityTab` | FlashList rendering |
| `src/screens/notifications/NotificationsScreen.tsx` | 25 | `NotificationsScreen` | FlashList rendering |

### FIX REQUIRED:
```typescript
// Pattern for EVERY screen/component rendering FlashList or expensive children:
// BEFORE:
export const ChallengeHub: React.FC<Props> = ({ challenges, onClaimReward }) => { ... }
// AFTER:
export const ChallengeHub: React.FC<Props> = React.memo(({ challenges, onClaimReward }) => { ... })
ChallengeHub.displayName = 'ChallengeHub';
```

### HIGH — renderItem callbacks not wrapped in useCallback

| File | Line | Finding |
|------|------|---------|
| `src/features/challenges/components/ChallengeHub.tsx` | 40 | `renderChallenge` not wrapped in `useCallback` — new function every render, defeats FlashList optimization |
| `src/features/content-study/screens/StudyLibraryScreen.tsx` | 64 | `renderContentItem` not wrapped in `useCallback` |
| `src/screens/profile/AchievementsScreen.tsx` | 130 | Inline `renderItem={({ item }) => (<AchievementCard .../>)}` — creates new function every render |

### FIX REQUIRED:
```typescript
// BEFORE (ChallengeHub.tsx line 40):
const renderChallenge: ListRenderItem<UserChallengeSummary> = ({ item }) => (
  <Pressable ...>
    <ChallengeCard challenge={item} onClaim={() => onClaimReward?.(item.challengeId)} />
  </Pressable>
);
// AFTER:
const renderChallenge = useCallback<ListRenderItem<UserChallengeSummary>>(
  ({ item }) => (
    <Pressable ...>
      <ChallengeCard challenge={item} onClaim={() => onClaimReward?.(item.challengeId)} />
    </Pressable>
  ),
  [onClaimReward]
);
```

### MEDIUM — Inline ItemSeparatorComponent factories

| File | Line | Finding |
|------|------|---------|
| `src/features/home-spine/components/RecentSessionsList.tsx` | 95-97 | `ItemSeparatorComponent={() => (...)}` creates new component identity on every render |

### FIX REQUIRED:
```typescript
// BEFORE:
ItemSeparatorComponent={() => (
  <Box height={1} mx="lg" bg={theme.colors.border.light} />
)}
// AFTER:
// Define OUTSIDE the component body:
const ItemSeparator = React.memo(() => (
  <Box height={1} mx="lg" bg={theme.colors.border.light} />
));
// Then use: ItemSeparatorComponent={ItemSeparator}
```

---

## 3.2 Inline Functions in JSX Causing Re-renders

### HIGH — Widespread inline onPress callbacks (238+ instances)

| File | Line | Pattern |
|------|------|---------|
| `src/components/Avatar.tsx` | 166 | `onPress={() => { buttonTap(); onPress(); }}` |
| `src/components/Banner.tsx` | 147 | `onPress={() => { buttonTap(); onDismiss(); }}` |
| `src/screens/search/components/CategoriesBar.tsx` | 44 | `onPress={() => onCategoryChange(item.id)}` — in FlashList item |
| `src/features/home-spine/components/StartSessionButton.tsx` | 80 | `onPress={() => { sessionStart(); onPress?.(); }}` |
| `src/session/components/SessionHistory.tsx` | 98 | 4 inline `onPress` callbacks in map |

### FIX PATTERN:
```typescript
// BEFORE:
<Pressable onPress={() => onCategoryChange(item.id)}>
// AFTER:
const handleCategoryPress = useCallback((id: string) => {
  onCategoryChange(id);
}, [onCategoryChange]);
// Then:
<Pressable onPress={() => handleCategoryPress(item.id)}>
// OR better — restructure to pass pre-bound callback from parent
```

### MEDIUM — Inline style factory functions

| File | Line | Finding |
|------|------|---------|
| `src/session/components/SessionHistory.tsx` | 93 | `style={({ pressed }) => [...]}` — creates new style array and opacity object on every press state change |

---

## 3.3 Image Optimization

### HIGH — No expo-image usage anywhere; getOptimizedImageUrl() is exported but never called

| Issue | Detail |
|-------|--------|
| `src/shared/performance/index.ts:118` | `getOptimizedImageUrl()` is exported but **zero usages across entire codebase** |
| `src/shared/performance/index.ts:131` | `preloadImages()` is exported but **zero usages** |
| Raw `<Image>` from react-native used everywhere — no caching, no progressive loading, no size optimization |

### FIX REQUIRED:
```typescript
// 1. Install expo-image (if not present):
// npm install expo-image

// 2. Replace ALL <Image> imports with <Image> from 'expo-image':
// BEFORE: import { Image } from 'react-native';
// AFTER: import { Image } from 'expo-image';

// 3. For avatar images (src/components/Avatar.tsx line 56):
<Image
  source={imageSource}
  placeholder={placeholderUri}
  transition={200}
  cachePolicy="memory-disk"
  contentFit="cover"
  style={...}
/>

// 4. For YouTube thumbnails (src/features/content-study/components/YouTubeVideoPreview.tsx line 53):
// Use optimized URL with getOptimizedImageUrl():
const optimizedUri = getOptimizedImageUrl(videoInfo.thumbnail, { width: 320, height: 180 });
<Image source={{ uri: optimizedUri }} cachePolicy="disk" contentFit="cover" ... />

// 5. Preload critical images on app boot:
// In src/navigation/AppEntry.tsx or similar:
useEffect(() => {
  preloadImages([
    require('assets/default-avatar.png'),
    require('assets/logo.png'),
  ]);
}, []);
```

---

## 3.4 Unnecessary Re-renders from Context Changes

### HIGH — ThemeContext causing re-renders in all consumers

| File | Line | Finding |
|------|------|---------|
| `src/theme/ThemeContext.tsx` | 157 | If theme object reference changes (deep merge, recreation), ALL components using `useTheme()` (nearly every component) will re-render |

### FIX REQUIRED:
```typescript
// src/theme/ThemeContext.tsx
// Ensure theme object is stable using useMemo with proper dependencies:
const themeValue = useMemo(() => ({
  colors: stableColorsRef.current,
  spacing: stableSpacingRef.current,
  typography: stableTypographyRef.current,
  isDark,
  setColorScheme,
}), [isDark, setColorScheme]);
// Key: colors/spacing/typography references MUST be stable across renders
```

### MEDIUM — ToastContext triggers re-renders in all consumers

| File | Line | Finding |
|------|------|---------|
| `src/shared/ui/components/ToastProvider.tsx` | 19 | Every toast state change triggers re-renders in ALL `useToast()` consumers |

### FIX REQUIRED:
```
Split ToastContext into two:
1. ToastDispatchContext — contains show/hide functions (stable reference)
2. ToastStateContext — contains active toasts (only consumed by ToastContainer)

Consumers that only call showToast() should use ToastDispatchContext.
```

---

## 3.5 Missing Debounce/Throttle on Search Inputs

### HIGH — Search inputs fire on every keystroke with no debounce

| File | Line | Finding |
|------|------|---------|
| `src/screens/search/SearchScreen.tsx` | 17, 51 | `query` state updated on every keystroke, `handleSearch` uses 800ms `setTimeout` for loading indicator (not actual debounce) |
| `src/screens/search/components/SearchBar.tsx` | 55 | `onChangeText={onQueryChange}` — raw setter, no debounce |
| `src/session/components/SessionHistory.tsx` | 84 | `onChangeText={setSearchQuery}` — every keystroke triggers `useMemo` recalculation filtering entire history array |

### FIX REQUIRED:
```typescript
// src/screens/search/SearchScreen.tsx
// Use the existing debounce utility:
import { debounce } from '../../../shared/hardening/timing';

// Add:
const [rawQuery, setRawQuery] = useState('');
const debouncedSetQuery = useMemo(
  () => debounce((q: string) => setQuery(q), 300),
  []
);

// In SearchBar:
onQueryChange={(text) => {
  setRawQuery(text); // For immediate UI feedback
  debouncedSetQuery(text); // For actual search (300ms debounce)
}}
```

---

## 3.6 Bundle Size & Import Optimization

### MEDIUM — Reanimated default import adds bundle weight

| File | Line | Finding |
|------|------|---------|
| `src/features/home-spine/components/StartSessionButton.tsx` | 3-10 | `import Animated, { useAnimatedStyle, ... } from 'react-native-reanimated'` — default `Animated` import pulls in entire namespace |

### FIX REQUIRED:
```typescript
// BEFORE:
import Animated, { useAnimatedStyle, withSpring, ... } from 'react-native-reanimated';
// AFTER:
import { useAnimatedStyle, withSpring, ... } from 'react-native-reanimated';
// Then use: <Animated.View ...>  → use animatedProps or separate Animated import only if needed
// For animated Views, import react-native's View and use animatedProps:
import { View } from 'react-native';
// And wrap with animated() only where needed
```

---

## 3.7 Lazy Loading Gaps

### MEDIUM — Some navigators not lazily loaded

Already lazy-loaded (good):
- `SessionNavigator`, `PaywallScreen`, `VipPaywallScreen`, `StreakFuneralScreen`, `ComebackScreen`, `FocusScoreDashboard`, `AchievementsScreen`, `AnalyticsScreen`, `CompanionDetailScreen`, `BossScreen`, `NotificationsScreen`, `ChallengesScreen`, `MasteryScreen`, `ContentStudyNavigator`

Not lazy-loaded:
- `MainNavigator` — imported directly in `src/navigation/root-stack-authenticated-routes.tsx:4`
- `SettingsNavigator` — imported directly, line 6
- `OnboardingNavigator` — imported directly, line 5

### FIX REQUIRED:
```typescript
// src/navigation/root-stack-authenticated-routes.tsx
// BEFORE:
import MainNavigator from './MainNavigator';
import SettingsNavigator from './settings-navigator';
import OnboardingNavigator from './onboarding-navigator';
// AFTER:
const MainNavigator = React.lazy(() => import('./MainNavigator'));
const SettingsNavigator = React.lazy(() => import('./settings-navigator'));
const OnboardingNavigator = React.lazy(() => import('./onboarding-navigator'));
```

Also: `src/shared/performance/index.ts:4-23` exports `lazyScreen()` preload wrapper but it's **never called** — use it or remove it.

---

## 3.8 Supabase Query Optimization

### HIGH — Wildcard selects in production

| File | Line | Finding |
|------|------|---------|
| `src/features/analytics/repository/dashboard.ts` | 46 | `.select('*')` on `dashboard_layouts` insert return |
| `src/features/analytics/repository/dashboard.ts` | 70 | `.select('*')` on `dashboard_widgets` update return |
| `src/features/analytics/repository/dashboard.ts` | 4 | `tableColumns` is **imported but unused** — eslint-disable comment suppresses the warning |

### FIX REQUIRED:
```typescript
// src/features/analytics/repository/dashboard.ts - LINE 4
// Either REMOVE the import (it's unused):
// import { tableColumns } from '../../../lib/repository/tableColumns'; // <-- REMOVE
// OR use it:
.select(tableColumns.dashboard_layouts.join(',')) // Instead of .select('*')
```

### MEDIUM — No pagination on heavy list queries

| File | Line | Finding |
|------|------|---------|
| `src/features/notifications/repository/notifications.ts` | 75 | `.limit(100)` — hard-coded limit, no cursor-based pagination. Users with 200+ notifications lose access to older ones. |
| `src/features/session-history/repository.ts` | 79 | `.limit(limit)` — limit is configurable but no cursor/offset mechanism |

### FIX REQUIRED:
```typescript
// Add cursor-based pagination to notifications repository:
async function fetchNotificationsPage(
  userId: string,
  cursor?: string,
  limit = 50
): Promise<{ data: Notification[]; nextCursor: string | null }> {
  let query = supabase
    .from('notifications')
    .select('id,user_id,type,title,body,read,created_at,data')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit + 1); // +1 to check for next page

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;
  if (error) throw new RepositoryError('fetchNotifications', error);

  const hasMore = data.length > limit;
  const results = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? results[results.length - 1]?.created_at ?? null : null;

  return { data: NotificationSchema.array().parse(results), nextCursor };
}
```

---

## 3.9 TanStack Query Configuration

### MEDIUM — Broad query invalidations cause unnecessary refetches

| File | Line | Finding |
|------|------|---------|
| `src/features/session-completion/completion-orchestrator.ts` | 33-34 | `invalidateQueries({ queryKey: QueryKeys.session })` and `invalidateQueries({ queryKey: QueryKeys.streak })` — invalidates ALL session and streak queries, not just the affected ones |

### FIX REQUIRED:
```typescript
// BEFORE:
void queryClient.invalidateQueries({ queryKey: QueryKeys.session });
// AFTER (targeted):
void queryClient.invalidateQueries({ queryKey: [...QueryKeys.session, userId] });
// Similarly for streaks:
void queryClient.invalidateQueries({ queryKey: [...QueryKeys.streak, userId] });
```

### MEDIUM — Queries missing gcTime configuration

| File | Line | Finding |
|------|------|---------|
| `src/features/notifications/hooks/index.ts` | 22 | `staleTime: 1000 * 30` — no `gcTime`. Notifications list will be GC'd after default 5 min. |
| `src/features/challenges/hooks/index.ts` | 29 | `staleTime: 1000 * 60 * 5` — no `gcTime` |
| `src/features/session-recommendation/hooks.ts` | 163 | `staleTime: 5 * 60 * 1000` — no `gcTime` |
| `src/features/progression/first-week-pacing/hooks.ts` | 32 | `staleTime: 1000 * 60 * 5` — no `gcTime` |

### FIX REQUIRED:
```typescript
// Add gcTime to all queries that set custom staleTime without gcTime:
{
  staleTime: 1000 * 60 * 5,  // 5 min
  gcTime: 1000 * 60 * 30,     // 30 min (inactive data kept in cache)
}
```

### NOTE: Global defaults are reasonable
```typescript
// src/api/QueryProvider.tsx:25-26 — no changes needed
staleTime: 1000 * 60 * 2,  // 2 min
gcTime: 1000 * 60 * 30,     // 30 min
```

---

## 3.10 Realtime Subscription Overhead

### HIGH — 4 separate Supabase channels in coach feature alone, no deduplication

| File | Lines | Finding |
|------|-------|---------|
| `src/features/ai-coach/repository/messages-subscriptions.ts` | 44-65 | `subscribeToCoachMessages` — `coach-messages-${userId}` |
| `src/features/ai-coach/repository/messages-subscriptions.ts` | 67-88 | `subscribeToCoachState` — `coach-state-${userId}` |
| `src/features/ai-coach/repository/messages-subscriptions.ts` | 90-111 | `subscribeToComebackPlan` — `coach-comeback-${userId}` |
| `src/features/ai-coach/repository/messages-subscriptions.ts` | 113-134 | `subscribeToRecommendations` — `coach-recommendations-${userId}` |

These should be combined into a single Supabase channel with multiple `.on()` handlers per channel.

### MEDIUM — No active channel check before subscribing

| File | Lines | Finding |
|------|-------|---------|
| `src/features/notifications/repository/notifications.ts` | 109-130 | `subscribeToNotificationCenter` creates a new channel every call without checking active channels map |

### FIX REQUIRED:
```typescript
// src/features/ai-coach/repository/messages-subscriptions.ts
// COMBINE 4 channels into 1:
const channel = supabase
  .channel(`coach-${userId}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'coach_messages', filter: `user_id=eq.${userId}` }, handleMessage)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'coach_state', filter: `user_id=eq.${userId}` }, handleState)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'comeback_plans', filter: `user_id=eq.${userId}` }, handleComeback)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'coach_recommendations', filter: `user_id=eq.${userId}` }, handleRecommendation)
  .subscribe();

// For notifications, add channel deduplication:
// In subscribeToNotificationCenter:
if (activeChannels.has(channelName)) {
  return () => {}; // Already subscribed, return no-op cleanup
}
activeChannels.set(channelName, channel);
```

---

## 3.11 List Virtualization

### HIGH — ScrollView + .map() used instead of FlashList for SessionHistory

| File | Line | Finding |
|------|------|---------|
| `src/session/components/SessionHistory.tsx` | 147 | `<ScrollView>{filteredHistory.map(...)}</ScrollView>` — renders ALL session cards. For 50+ sessions, this renders everything at once. |

### FIX REQUIRED:
```typescript
// REPLACE ScrollView + .map() with FlashList:
<FlashList
  data={filteredHistory}
  renderItem={renderSessionCard}
  keyExtractor={(item) => item.sessionId}
  estimatedItemSize={88} // Actual measured item height
  ItemSeparatorComponent={ItemSeparator}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

---

## 3.12 Heavy Computations on Main Thread

### MEDIUM — Repeated reduce() operations across 7+ hooks

The same `todayFocusMinutes` reduction pattern is computed independently in 7+ different files:

| File | Line |
|------|------|
| `src/screens/home/hooks/useNewUserHomeModel.ts` | 69 |
| `src/screens/home/hooks/usePowerUserHomeModel.ts` | 55 |
| `src/screens/home/hooks/useHomeScreenController.ts` | 73 |
| `src/screens/home/hooks/useEngagedQueries.ts` | 27 |
| `src/screens/home/hooks/useActivatingHomeModel.ts` | 67 |
| `src/screens/home/containers/NewUserHomeContainer.tsx` | 81 |
| `src/screens/home/containers/EngagedHomeContainer.tsx` | 56 |
| `src/screens/home/containers/PowerUserHomeContainer.tsx` | 50 |

### FIX REQUIRED:
```typescript
// EXTRACT into a shared hook in src/features/home-spine/hooks/useTodayFocusMinutes.ts:
export function useTodayFocusMinutes(history: SessionSummary[]): number {
  return useMemo(
    () => history.reduce((sum, entry) => sum + (entry.summary?.effectiveDuration ?? 0), 0),
    [history]
  );
}
// Then import and reuse across all 7+ locations.
```

### MEDIUM — Client-side sort on full achievement list (O(n log n))

| File | Line | Finding |
|------|------|---------|
| `src/screens/profile/AchievementsScreen.tsx` | 38-56 | Full `sort()` on every filter change for 500+ achievements |

### FIX:
Move sorting/filtering to the query layer (repository) or use a pre-sorted index.

---

# 4. ARCHITECTURE & CODE QUALITY AUDIT

## 4.1 Files Exceeding 200-Line Limit

### HIGH — 13 files violate the mandatory 200-line limit

| Lines | File | Action |
|------:|------|--------|
| **398** | `src/components/glass/LiquidGlassObject.tsx` | Split into: LiquidGlassObjectBase.tsx (core), LiquidGlassObjectShaders.tsx (SVG defs), LiquidGlassObjectStyles.ts (styles) |
| **285** | `src/components/glass/GlassSurface.tsx` | Extract sub-components: GlassSurfaceBackground, GlassSurfaceBorder, GlassSurfaceOverlay |
| **282** | `src/components/glass/LiquidGlassSphere.tsx` | Same decomposition as LiquidGlassObject |
| **259** | `src/components/glass/GlassCard.tsx` | Split: GlassCard.tsx (wrapper), GlassCardContent.tsx (inner) |
| **250** | `src/screens/home/components/HomeReferenceSections.tsx` | Split each reference section into its own component file |
| **246** | `src/components/primitives/Card.tsx` | Split variants: Card.tsx, CardHeader.tsx, CardFooter.tsx |
| **224** | `src/icons/actionIcons.ts` | Split by icon category or use code generation |
| **223** | `src/features/mode-native/components/ModeNativeHome.tsx` | Split into ModeNativeHeader, ModeNativeProgress, ModeNativeActions |
| **220** | `src/components/glass/LiquidButton.tsx` | Split into LiquidButton.tsx (core) + LiquidButtonVariants.ts |
| **214** | `src/features/challenges/hooks/index.ts` | Split into useChallenges.ts, useChallengeDetail.ts, useChallengeClaim.ts |
| **210** | `src/screens/home/containers/HomeScreenInner.tsx` | Extract HomeSection, HomeStatusBar, HomeActionBar |
| **201** | `src/features/ai-coach/components/primitives/button.tsx` | Split variants into separate files or use sub-components |
| **201** | `src/screens/home/ContentStudyHeroCard.tsx` | Split into ContentStudyHeroCard.tsx + ContentStudyHeroCardSkeleton.tsx |

**FILE SIZE BLOCKER RULE**: No file may exceed 200 lines. All 13 files above MUST be split before release. This is a non-negotiable AGENTS.md rule.

---

## 4.2 Banned Pattern Violations

### CLEAN — Zero instances of:
- `@ts-ignore` / `@ts-nocheck` — perfect compliance
- `console.log` — perfect compliance
- `// TODO` — perfect compliance (0 instances in shipped code)
- `StyleSheet.create` — perfect compliance (0 instances)
- `FlatList` — perfect compliance (only referenced in accessibility type mapping, not used)
- `Animated` from react-native — perfect compliance (0 instances)
- `AsyncStorage` — perfect compliance (0 instances)
- `.part-N.ts` files — perfect compliance (0 instances)

### MEDIUM — 1 raw fetch() found outside the API client

| File | Line | Finding |
|------|------|---------|
| `src/api/api-request-handler.ts` | 99 | `let response = await fetch(url, fetchConfig)` — raw fetch() call. AGENTS.md bans raw fetch. |

### FIX REQUIRED:
```typescript
// Verify src/api/api-request-handler.ts:99 is the API client's OWN implementation of fetch.
// If it IS the internal API client making the call, it's acceptable.
// If it's NOT, refactor to use the existing API client (e.g., supabase.functions.invoke() or a shared http client).
```

### CLEAN — Zero Supabase queries in components or hooks
All `.from()`, `.rpc()`, `.channel()`, `.auth.` calls are properly contained in `repository.ts` files. Excellent compliance.

---

## 4.3 Feature Directory Structure Compliance

### HIGH — 18 features missing required structure files

The AGENTS.md mandates every feature has EXACTLY: `types.ts`, `schemas.ts`, `repository.ts`, `service.ts`, `hooks.ts`, `store.ts`, `events.ts`, `analytics.ts`, `components/`.

| Feature | Missing Files |
|---------|---------------|
| `auth` | `store.ts`, `events.ts`, `analytics.ts`, `components/` |
| `analytics` | `repository.ts`, `hooks.ts` |
| `coach-presence` | (has all files) |
| `challenges` | `schemas.ts`, `hooks.ts` |
| `companion` | `hooks.ts` |
| `boss` | `hooks.ts` |
| `mastery` | `hooks.ts` |
| `liveops-config` | `components/` |
| `memory-candidate` | `events.ts`, `analytics.ts` |
| `mode-native` | `types.ts`, `repository.ts`, `store.ts`, `events.ts`, `analytics.ts` |
| `mode-retention` | `repository.ts`, `store.ts`, `events.ts`, `analytics.ts`, `components/` |
| `notifications` | `hooks.ts` |
| `progression` | `hooks.ts` |
| `retention-loop` | `store.ts`, `components/` |
| `session-completion` | `store.ts`, `analytics.ts` |
| `settings` | `hooks.ts` |
| `vex-actions` | `hooks.ts` |
| `weekly-intelligence` | `store.ts`, `events.ts`, `analytics.ts`, `components/` |

### FIX REQUIRED:
```
Each missing file MUST be created with at minimum a proper module export.
For features that don't need a particular file:
- store.ts: export an empty const if no Zustand slice needed
- events.ts: export an empty const declaration if no events defined  
- analytics.ts: export analytics helper stub
- hooks.ts: create barrel re-export if no custom hooks
- components/: create directory with index.ts barrier

Never leave these files absent — it breaks tooling that expects them.
```

### HIGH — 5 features missing components/ directory:
- `auth` — auth screens live in `src/screens/auth/` instead. Either move them or create a re-export barrier.
- `liveops-config` — no UI components
- `mode-retention` — no UI
- `retention-loop` — no UI
- `weekly-intelligence` — no UI

---

## 4.4 Barrel Export / Public API Violations

### HIGH — 13 features missing root index.ts barrel

| Feature |
|---------|
| `account-deletion`, `achievements`, `auth`, `companion-promise`, `feature-gate`, `focus-contract`, `home-spine`, `monthly-report`, `personal-bests`, `reward-ledger`, `session-history`, `session-recommendation`, `vex-actions` |

### HIGH — 250+ import sites bypassing barrel exports

Screens deeply import from internal feature sub-files (e.g., `'../../../features/home-spine/hooks'` instead of `'../../../features/home-spine'`). This creates tight coupling — refactoring a feature's internal structure breaks all consuming screens.

### FIX REQUIRED:
```typescript
// 1. Create index.ts for each of the 13 features listed above:
// src/features/home-spine/index.ts:
export { useHomeSpineModel } from './hooks';
export { buildHomeReturnReasonState } from './service';
export type { HomeSpineModel } from './schemas';
// ...export all public API items

// 2. Update ALL 250+ import sites to use the barrel:
// BEFORE: import { useHomeSpineModel } from '../../../features/home-spine/hooks';
// AFTER: import { useHomeSpineModel } from '../../../features/home-spine';
```

---

## 4.5 Business Logic in Screens/Components

### HIGH — Business logic in 15+ screen files

| File | Line | Logic Leaked |
|------|------|-------------|
| `src/screens/boss/BossScreenSectionsInner.tsx` | 36-47 | `useState<number>(25)` for session duration, `useMemo` data derivation, `handleLaunchAttack` orchestration |
| `src/screens/profile/AchievementsScreen.tsx` | 38-56 | `filteredAchievements` useMemo with full filtering/business logic |
| `src/screens/profile/ProfileScreen.tsx` | 63 | `achievements` useMemo computing derived state |
| `src/screens/home/containers/PowerUserHomeContainer.tsx` | 74-107 | Multiple useMemos computing `nextUnlockFeature`, `returnReason` |
| `src/screens/home/containers/EngagedHomeContainer.tsx` | 80-120 | Same pattern |
| `src/screens/home/containers/ActivatingHomeContainer.tsx` | 46-84 | Same pattern |
| `src/screens/home/containers/NewUserHomeContainer.tsx` | 95-111 | Same pattern |
| `src/screens/settings/PrivacySettingsScreen.tsx` | 28-62 | useState/useCallback for settings toggle logic |
| `src/screens/settings/CoachSettingsScreen.tsx` | 29 | `useState<CoachPersona>('mentor')` — selection logic in screen |
| `src/screens/settings/NotificationSettingsScreen.tsx` | — | useState/useCallback for toggle management |
| `src/screens/auth/RegisterScreen.tsx` | 45 | `handleRegister` async useCallback with validation/registration orchestration directly in screen |

### FIX REQUIRED:
```
Move ALL business logic to the service layer:
1. Create service functions for each screen's computation
2. Create hooks in the feature's hooks.ts that call services
3. Screens should ONLY render UI and call hooks

Pattern:
// Screen — ONLY rendering:
const { achievements, isLoading, error, refetch } = useAchievementsList(filter, sort);

// Hook (in features/achievements/hooks.ts) — wiring:
export function useAchievementsList(filter: Filter, sort: Sort) {
  return useQuery({
    queryKey: achievementsKeys.list(filter, sort),
    queryFn: () => achievementsService.list(filter, sort),
  });
}

// Service (in features/achievements/service.ts) — business logic:
export async function list(filter: Filter, sort: Sort): Promise<Achievement[]> {
  const data = await achievementsRepository.fetchAll(userId);
  return applyFiltersAndSort(data, filter, sort);
}
```

---

## 4.6 Supabase Types Leaking to Public API

### MEDIUM — Repository types exposed in feature types.ts

| File | Line | Leak |
|------|------|------|
| `src/features/personal-bests/types.ts` | 2 | `import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase'` |
| `src/features/focus-contract/types.ts` | 2 | Same pattern |
| `src/features/companion/memory-types.ts` | 2 | Same pattern |
| `src/features/companion-promise/types.ts` | 2 | `import type { Database } from '../../types/supabase'` — uses raw `Database['public']['Tables']` lookup |

### FIX REQUIRED:
```typescript
// Supabase table types should stay in repository.ts.
// In types.ts, define ONLY Zod-inferred types or domain types:
// WRONG (in types.ts):
import type { Tables } from '../../types/supabase';
export type FocusContract = Tables<'focus_contracts'>;
// CORRECT:
// In repository.ts:
import type { Tables } from '../../types/supabase';
type FocusContractRow = Tables<'focus_contracts'>;
// In types.ts:
import { z } from 'zod';
export const FocusContractSchema = z.object({ ... });
export type FocusContract = z.infer<typeof FocusContractSchema>;
```

---

## 4.7 Navigation Type Registration Gaps

### HIGH — 5 routes not registered in navigation types

| Screen File | Missing Route |
|-------------|---------------|
| `src/screens/RivalsScreen.tsx` | `'Rivals'` not in any route type |
| `src/screens/search/SearchScreen.tsx` | `'Search'` not in any route type |
| `src/screens/rewards/VaultScreen.tsx` | `'Vault'` not in any route type |

### MEDIUM — Routes in param-types.ts but missing from route-types.ts union

| Route | In param-types.ts | In route-types.ts |
|-------|:---:|:---:|
| `'CoachSettings'` | Line 120 | **MISSING** from `SettingsStackRoute` union (line 27-33) |
| `'LaneMode'` | Line 121 | **MISSING** from `SettingsStackRoute` union |

### FIX REQUIRED:
```
1. Register 'Rivals', 'Search', 'Vault' in the appropriate RootStackParamList type
2. Add 'CoachSettings' and 'LaneMode' to the SettingsStackRoute union type
3. Run: npx tsc --noEmit
   Fix all resulting type errors — at minimum these 5 routes will cause compilation failures
   when using typed navigation.navigate().
```

---

## 4.8 Orphaned & Stub Code

### MEDIUM — Stub screen with dead imports

| File | Finding |
|------|---------|
| `src/screens/RivalsScreen.tsx:12-26` | Stub implementation with inline inline stub hooks (`useMyRivals`, etc.) replacing commented-out real feature imports. Never wired. |

### LOW — Orphan files in features/ root (not in any feature directory)

These 7 files float in `src/features/` root instead of being in a dedicated directory:
- `src/features/featureFlagDefaults.ts`
- `src/features/featureFlagEvaluator.ts`
- `src/features/featureFlagInstance.ts`
- `src/features/featureFlagMutations.ts`
- `src/features/FeatureFlagService.ts`
- `src/features/featureFlagStorage.ts`
- `src/features/featureFlagTypes.ts`

### FIX REQUIRED:
```
Either:
1. Move these 7 files into src/features/feature-flags/ directory (create it)
   This is the cleanest approach.
OR:
2. Fold them into src/features/liveops-config/ (if feature flags are a subsystem of liveops)

Never leave files in the features/ root — they violate the mandatory structure.
```

---

## 4.9 Hardcoded Hex Colors Outside Theme Tokens

### MEDIUM — 67 files contain hardcoded hex colors

Major offenders:
- `src/components/glass/LiquidGlassObject.tsx` — 52 SVG stopColor instances
- `src/components/glass/LiquidGlassSphere.tsx` — SVG colors
- `src/components/glass/WaterBubble.tsx` — SVG colors
- `src/components/glass/GlassCard.tsx` — surface/tint colors
- `src/components/primitives/Card.tsx` — background/shadow colors
- `src/components/premium/PremiumSurface.tsx` — premium gradient colors
- `src/screens/home/components/FocusModeCardView.tsx` — gradient stops
- `src/screens/home/components/HomeReferenceSections.tsx` — background colors
- `src/screens/home/components/VexFocusSurface.tsx` — gradient colors
- `src/screens/profile/ProfileIdentityBlock.tsx` — background/text colors
- `src/features/focus-identity/components/score-card.tsx` — score colors
- `src/features/focus-identity/components/factor-map.tsx` — radar chart colors
- `src/features/ai-coach/components/CoachInterventionBanner.tsx` — accent colors
- `src/features/home-spine/components/AtRiskBanner.tsx` — warning colors
- `src/features/home-spine/components/StreakWidget.tsx` — streak colors

### FIX REQUIRED:
```
For each hardcoded hex color:
1. Determine if it maps to an existing design token in src/theme/tokens/
2. If yes: replace with the token reference (e.g., theme.colors.primary.default)
3. If no: add a new token to src/theme/tokens/colors.ts following the existing naming convention
4. Replace the hardcoded value with the token reference

Priority: Focus on non-SVG colors first (direct style props on components).
SVG gradient stopColors may need separate color tokens (e.g., theme.colors.glass.tint).
```

---

## 4.10 Duplicate Type Definitions

### MEDIUM — Hand-written types where Zod inference should be used

| File | Line | Type |
|------|------|------|
| `src/features/boss/hooks/useActiveBoss.ts` | 4-5 | `DamageCalculation`, `KillEstimate` — manual types |
| `src/features/mastery/types.ts` | 58 | `RankDisplay` — manual type |
| `src/features/ai-coach/session/session-analyzer-types.ts` | 4-5 | `KeyConcept`, `Summary` — manual types |
| `src/features/settings/repository-sync.ts` | 9-10 | `PendingChange`, `RemoteChange` — manual types |
| `src/features/companion/profile-service.ts` | 28 | `PersistOptions` — manual type |

### FIX REQUIRED:
```typescript
// Replace manual types with Zod schemas + z.infer:
// BEFORE:
type DamageCalculation = { rawDamage: number; multiplier: number; finalDamage: number };
export function calculateDamage(input: DamageCalculation): number { ... }
// AFTER:
export const DamageCalculationSchema = z.object({
  rawDamage: z.number().min(0),
  multiplier: z.number().min(0),
  finalDamage: z.number().min(0),
});
export type DamageCalculation = z.infer<typeof DamageCalculationSchema>;
```

---

## 4.11 Circular Dependency Risks

### MEDIUM — Cross-feature dependencies

| File | Line | Import |
|------|------|--------|
| `src/features/home-spine/hooks/useStreakDefense.ts` | 11 | Imports from `../../../features/streaks/hooks` — cross-feature dependency |
| `src/features/liveops-config/index.ts` | 5 | Imports from `../onboarding/store` — cross-feature dependency |

### FIX REQUIRED:
```
Cross-feature dependencies should go through a shared service or event bus:
1. features/home-spine should NOT directly import from features/streaks
   → Move shared logic to src/shared/ or use the EventBus for cross-feature communication
2. features/liveops-config should NOT import from features/onboarding
   → Use the existing event bus pattern (src/shared/events/) for cross-feature notifications
```

---

## 4.12 Redirect Files / Barrel Re-exports

### INFO — Test files that are barrel re-exports only
```
src/__tests__/helpers/risk-coverage/risk5-first-week-unlock.test.ts (60 bytes)
src/__tests__/helpers/risk-coverage/risk3-4-companion-project.test.ts (98 bytes)
src/features/ai-coach/__tests__/coachService.test.ts (128 bytes)
src/features/companion/__tests__/growth.test.ts (68 bytes)
src/features/onboarding/__tests__/validation.test.ts (78 bytes)
src/features/personalization/__tests__/service.test.ts (117 bytes)
src/features/reward-ledger/__tests__/repository.test.ts (195 bytes)
src/screens/session/__tests__/first-session-setup.test.ts (83 bytes)
```

These aggregate split test files. Verify they correctly re-export all necessary test suites and that no tests are silently lost.

---

## 4.13 Repository Helper File Bypasses

### MEDIUM — Repository helper files re-export supabase, bypassing the architecture

| File | Line | Finding |
|------|------|---------|
| `src/features/streaks/repository-helpers.ts` | 6 | `export { supabase } from '../../config/supabase'` — allows other files to import supabase without going through their own repository |
| `src/features/notifications/repository/shared.ts` | 4 | `export { supabase } from '../../../config/supabase'` — same bypass |
| `src/features/analytics/repository/storage-helpers.ts` | 7 | `export { supabase } from '../../../config/supabase'` — same bypass |

### FIX REQUIRED:
```
Remove these re-exports. Importers should either:
1. Use their own feature's repository.ts (correct architecture)
2. If truly shared, use src/config/supabase.ts only in repository files

Never expose supabase through helper re-exports.
```

---

# 5. ACCESSIBILITY AUDIT

## 5.1 Missing accessibilityLabels

### HIGH — Pressable components without accessibilityLabel

| File | Line | Component |
|------|------|-----------|
| `src/screens/profile/components/MasteryCard.tsx` | 53-156 | `<Pressable onPress={onPress}>` has ZERO accessibility attributes |
| `src/screens/profile/components/ProfileGlassTabs.tsx` | 42-72 | Each tab `<Pressable>` has `accessibilityRole="tab"` and `accessibilityState` but **no `accessibilityLabel`**. Screen readers won't announce tab names. |

### FIX REQUIRED:
```typescript
// MasteryCard.tsx LINE 53:
<Pressable
  onPress={onPress}
  accessibilityRole="button"
  accessibilityLabel={masteryName} // e.g., "Fire mastery — Level 5"
  accessibilityHint="View detailed mastery progress"
>

// ProfileGlassTabs.tsx LINE 42:
<Pressable
  accessibilityRole="tab"
  accessibilityState={{ selected: isActive }}
  accessibilityLabel={tab.label}  // ADD THIS
  accessibilityHint={isActive ? undefined : `Switch to ${tab.label} tab`}
  key={tab.key}
  onPress={() => onChange(tab.key)}
>
```

---

## 5.2 Missing accessibilityRole & accessibilityHint

### HIGH — Systematic gap across interactive elements

While some components have `accessibilityRole` (tabs have it), many interactive elements are missing both `accessibilityRole` and `accessibilityHint`. This needs a systematic sweep.

### FIX REQUIRED:
```
Audit ALL Pressable, TouchableOpacity, and Button components.
For each:
1. Add accessibilityRole: 'button' | 'link' | 'tab' | 'checkbox' | 'switch' | etc.
2. Add accessibilityLabel: concise description of what the element is
3. Add accessibilityHint: describes what happens when activated
4. For stateful elements: add accessibilityState (selected, disabled, checked, etc.)
```

---

## 5.3 Touch Target Size Violations

### MEDIUM — Potential small touch targets

The AGENTS.md requires minimum 44x44 point touch targets. The `src/utils/touchTarget.ts` utility should be verified and enforced on all interactive elements.

### ACTION:
```
grep for all interactive elements with explicit height/width < 44 and fix them.
Use the touchTarget utility everywhere:
import { ensureMinTouchTarget } from '../../../utils/touchTarget';
```

---

## 5.4 Color Contrast

### INFO — Needs manual verification

Hardcoded hex colors (67 files) may violate WCAG contrast ratios. After migrating to theme tokens (see section 4.9), verify all color pairs meet AA minimum (4.5:1 for normal text, 3:1 for large text).

---

## 5.5 Screen Reader Support

### INFO — React Native Text components auto-escape content

No `dangerouslySetInnerHTML` found. Content rendering via `<Text>` is screen-reader safe.

---

# 6. TESTING & CI/CD AUDIT

## 6.1 Test Coverage Overview

| Metric | Value |
|--------|-------|
| Test files | 1,136 |
| Test cases | 8,643 |
| Pass rate | 97.3% (8,408 pass) |
| Failed tests | 51 (0.6%) |
| Pending/skipped tests | 184 (2.1%) |
| Test run duration | ~109 seconds |
| Coverage thresholds | 70% branches, 70% functions, 70% lines, 70% statements |
| Coverage report generated | **NEVER** — coverage directory does not exist |

### ACTION REQUIRED:
```bash
npm test -- --coverage
# Then check coverage/lcov-report/index.html
# If thresholds not met, add tests to bring coverage up.
```

---

## 6.2 Features With Zero Tests

### CRITICAL — 1 feature has ZERO tests

| Feature | Risk |
|---------|------|
| `liveops-config` | **ZERO test files** despite having service.ts, repository.ts, hooks.ts, store.ts, FeatureFlagService.ts, schemas, types, analytics, events. This is a full-featured feature with no test coverage at all. |

### FIX REQUIRED:
```typescript
// Minimum required tests for liveops-config:
// 1. src/features/liveops-config/__tests__/service.test.ts — test ALL service functions
// 2. src/features/liveops-config/__tests__/repository.test.ts — test ALL repository queries
// 3. src/features/liveops-config/__tests__/hooks.test.ts — test hook wiring
// 4. src/features/liveops-config/__tests__/FeatureFlagService.test.ts — test flag evaluation
```

---

## 6.3 Features With Minimal Tests (0-3 files)

| Feature | Test Files | Gap |
|---------|:---:|------|
| `account-deletion` | 2 | Critical — handles user data deletion, needs thorough testing |
| `focus-profile` | 2 | Missing service and repository tests |
| `today-system` | 2 | Core feature, severely under-tested |
| `focus-contract` | 3 | Contract creation/validation needs testing |
| `rescue-mode` | 3 | Failure recovery paths need testing |
| `themes` | 3 | Also **entirely excluded from CI run** |

---

## 6.4 Features Excluded from CI Entirely

### HIGH — 4 features excluded from test run via jest.config.js testPathIgnorePatterns

| Excluded Pattern | Impact |
|------------------|--------|
| `src/features/challenges/` | 20+ test files excluded |
| `src/features/inventory/` | All inventory tests excluded |
| `src/features/shop/` | All shop tests excluded |
| `src/features/squads/` | All squad tests excluded |
| `src/features/themes/` | 3 test files excluded |

### FIX REQUIRED:
```
Review WHY these features are excluded.
If tests are broken: Fix the tests.
If features are disabled: Remove the test exclusion and add .skip prefixes to tests.
If features are removed: Remove the feature directories entirely.

Never exclude features from CI permanently — it hides broken tests.
```

---

## 6.5 Legacy Failing Tests

### HIGH — 48 test files permanently excluded via jest.legacy-failing-tests.js

Heaviest concentrations:
- `session-completion`: 30 files excluded
- `ai-coach`: 8 files excluded
- `streaks`: 2 files excluded
- `content-study`: 2 files excluded
- `feature-gate`: 1 file
- `auth`: 1 file

### FIX REQUIRED:
```
For each excluded test file:
1. Run the test in isolation: npx jest <file> --verbose
2. Determine if the test failure is:
   a. Test is wrong (outdated mock/expectation) → Fix the test
   b. Code is wrong (real bug) → Fix the code
   c. Feature was removed → Remove the test file
3. Remove the file from jest.legacy-failing-tests.js
4. Add to main test suite

Priority: Fix session-completion tests (30 excluded) — this is your core session engine.
```

---

## 6.6 Disabled/Pending Test Suites (46 skipped)

### HIGH — Key skipped test suites

| Category | Count | Files |
|----------|:-----:|-------|
| Monetization (RevenueCat) | 5 | PaywallVerification.*.test.ts |
| AI Coach integrations | 8 | Various integration tests |
| Production exit gates | 5 | ExitGate.*.test.ts |
| Streaks | 2 | service.test.ts, streak-system.test.ts |

### FIX REQUIRED:
```
1. Monetization (RevenueCat) — 5 skipped files:
   These are critical. Payment flows MUST be tested before release.
   Unskip and fix or confirm they pass.

2. AI Coach integrations — 8 skipped files:
   Integration tests validate cross-feature behavior.
   Unskip and fix.

3. Production exit gates — 5 skipped:
   These are pre-release quality gates. Enable them before release.
```

---

## 6.7 E2E Test Coverage

### MEDIUM — Only 3 Detox E2E flows

| Flow | Test File |
|------|-----------|
| Auth | `e2e/auth-flow.test.ts` |
| Complete Session | `e2e/complete-session-flow.test.ts` |
| Purchase | `e2e/purchase-flow.test.ts` |
| Onboarding (Playwright) | `e2e/onboarding.spec.ts` |
| First 7 Days (PoC) | `src/e2e/first-7-days-flow.test.ts` |
| Real Device (PoC) | `src/e2e/real-device-proof.test.ts` |

### GAPS — Missing E2E flows:
- Social/Community features
- Settings management
- Boss battles
- Streaks
- Challenges
- Companion interactions
- Notifications
- Focus Score Dashboard
- Content Study

### ACTION:
```
Run existing e2e tests:
npx detox test --configuration ios.sim.release

Add critical paths:
1. e2e/settings-flow.test.ts (settings changes persist)
2. e2e/boss-flow.test.ts (boss encounter + session + completion)
3. e2e/streak-flow.test.ts (streak creation, check, funeral)
```

---

## 6.8 CI/CD Pipeline Assessment

### CURRENT STATE:
- `ci.yml`: Runs all tests on CI
- `vex-ci.yml`: Runs tests with `--silent`
- `e2e.yml`: iOS-only, manual trigger (`workflow_dispatch`), auto on PRs touching src/e2e

### GAPS:
```yaml
# Missing CI steps:
1. TypeScript type checking: npx tsc --noEmit (NOT in CI!)
2. Linting: npx eslint src/ (NOT in CI — verify it's present)
3. RLS verification: node scripts/check-rls.js
4. Bundle size analysis: npx expo export (check bundle size doesn't regress)
5. Dependency audit: npm audit
6. Coverage upload to dashboard (Codecov/Coveralls)
```

### FIX REQUIRED:
```yaml
# Add to ci.yml:
jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx tsc --noEmit

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx eslint src/ --max-warnings 0

  rls-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: node scripts/check-rls.js
        env:
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

---

# 7. RELEASE PHASE — BLOCKERS & PRE-FLIGHT CHECKLIST

## 7.1 CRITICAL Release Blockers (MUST fix before ANY submission)

| # | Blocker | Section | Fix In |
|------|---------|---------|--------|
| C1 | **Rotate ALL hardcoded secrets in .env.server** — TRIGGER_SECRET_KEY, SUPABASE_SERVICE_KEY, GEMINI_API_KEY, PINECONE_API_KEY, SENTRY_DSN are live production keys on disk. If .env.server was ever committed to git (check git history), these keys are permanently compromised. | 2.1 | 1 hour |
| C2 | **liveops-config has ZERO tests** — Full-featured feature with service/repository/hooks/store/FeatureFlagService but no test files. This is the feature that controls which features users see. A bug here affects every user. | 6.2 | 4-8 hours |

## 7.2 HIGH Priority (MUST fix before release)

| # | Issue | Section | Fix In |
|------|-------|---------|--------|
| H1 | **Split 13 files exceeding 200-line limit** — Mandatory AGENTS.md rule. Every file >200 lines must be decomposed. | 4.1 | 8-12 hours |
| H2 | **Replace Math.random() in UUID/id generation with crypto-safe alternative** — `src/utils/uuid.ts:46` has a Math.random() fallback. Also fix 5 other ID generators using Math.random(). | 2.6 | 2 hours |
| H3 | **Register 5 missing routes in navigation types** — `Rivals`, `Search`, `Vault`, `CoachSettings`, `LaneMode` are not in route type unions. Run `npx tsc --noEmit` and fix ALL type errors. | 4.7 | 3 hours |
| H4 | **Create barrel index.ts for 13 features** — Missing root barrel exports. Then update 250+ import sites to use barrels. | 4.4 | 4 hours |
| H5 | **Remove business logic from 15+ screen files** — Move to service.ts and hooks.ts. Screens must only render UI. | 4.5 | 6-8 hours |
| H6 | **Fix search debouncing** — SearchScreen, SearchBar, and SessionHistory fire on every keystroke with no debounce. Use existing `src/shared/hardening/timing.ts` debounce utility. | 3.5 | 1 hour |
| H7 | **Fix 48 legacy failing tests** — Permanently excluded files in jest.legacy-failing-tests.js. Prioritize session-completion (30 files) and ai-coach (8 files). | 6.5 | 8-16 hours |
| H8 | **Enable 46 skipped test suites** — Monetization (5), AI Coach integrations (8), production exit gates (5), streaks (2). These test critical paths. | 6.6 | 4 hours |
| H9 | **Run test coverage and meet 70% thresholds** — Coverage has NEVER been generated. Run `npm test -- --coverage` and add tests until all thresholds pass. | 6.1 | 4-8 hours |
| H10 | **Remove features/ test exclusions from CI** — Challenges, inventory, shop, squads, themes are excluded. Fix or permanently remove. | 6.4 | 4 hours |
| H11 | **Add tsc --noEmit and eslint to CI pipeline** — Currently not in CI. Any TypeScript or lint error on main goes unnoticed. | 6.8 | 1 hour |
| H12 | **Fix 4 Supabase channels in ai-coach** — Combine into 1 channel with multiple .on() handlers. Add channel deduplication to notifications. | 3.10 | 2 hours |

## 7.3 MEDIUM Priority (SHOULD fix before release)

| # | Issue | Section | Fix In |
|------|-------|---------|--------|
| M1 | **Encrypt unencrypted MMKV instances** — Coach offline queue, coach store, and Zustand storage must use encryptionKey. | 2.2 | 1 hour |
| M2 | **Replace raw fetch() in src/api/api-request-handler.ts:99** — Use existing API client or verify it IS the API client implementation. | 4.2 | 30 min |
| M3 | **Fix .select('*') in analytics/dashboard repository** — Use explicit columns or existing tableColumns utility. | 3.8 | 30 min |
| M4 | **Add pagination to notifications and session-history** — Replace hard-coded .limit(100) with cursor-based pagination. | 3.8 | 2 hours |
| M5 | **Add gcTime to all queries with custom staleTime** — Notifications, challenges, session-recommendation, first-week-pacing. | 3.9 | 30 min |
| M6 | **Replace ScrollView with FlashList in SessionHistory.tsx** — Renders ALL cards in ScrollView. Switch to FlashList with estimatedItemSize. | 3.11 | 1 hour |
| M7 | **Extract repeated todayFocusMinutes reduction** — 7+ hooks compute same reduction independently. Create shared hook. | 3.12 | 1 hour |
| M8 | **Wrap renderItem callbacks in useCallback** — ChallengeHub, StudyLibraryScreen, AchievementsScreen. Prevents FlashList from re-rendering. | 3.1 | 1 hour |
| M9 | **Add React.memo to expensive components** — Banner, Avatar, ChallengeHub, ChallengeList, RecentSessionsList, YouTubeVideoPreview, AchievementsScreen, ProfileActivityTab, NotificationsScreen. | 3.1 | 2 hours |
| M10 | **Add accessibilityLabel to ALL pressable components** — Systematic sweep. Prioritize MasteryCard and ProfileGlassTabs. | 5.1 | 2 hours |
| M11 | **Remove Supabase type leaks from feature types.ts** — personal-bests, focus-contract, companion, companion-promise expose internal table types. | 4.6 | 1 hour |
| M12 | **Remove supabase re-exports from repository helpers** — streaks/repository-helpers.ts, notifications/repository/shared.ts, analytics/repository/storage-helpers.ts. | 4.13 | 30 min |
| M13 | **Move orphan files from features/ root into dedicated directory** — 7 feature flag files floating in src/features/ root. | 4.8 | 30 min |
| M14 | **Configure certificate pinning** — Priority: pin Supabase and RevenueCat connections. | 2.8 | 2 hours |
| M15 | **Fix edge function PII logging** — Replace console.error with structured JSON logging. Remove user ID from rate-limit.ts log. | 2.7 | 1 hour |
| M16 | **Add RLS verification to CI** — Run scripts/check-rls.js on PRs touching migrations. | 2.5 | 30 min |
| M17 | **Add max() constraints to UserPreferencesSchema** — Prevent arbitrary-length string injection. | 2.3 | 15 min |
| M18 | **Fix broadly scoped query invalidations** — Use targeted keys like [...QueryKeys.session, userId] instead of QueryKeys.session. | 3.9 | 1 hour |
| M19 | **Implement image optimization** — Install expo-image, replace all react-native Image imports, use getOptimizedImageUrl() where it's defined but never called. | 3.3 | 3 hours |
| M20 | **Lazy-load MainNavigator, SettingsNavigator, OnboardingNavigator** — These are imported directly, slowing initial load. | 3.7 | 30 min |
| M21 | **Stabilize ThemeContext to prevent global re-renders** — Ensure theme object reference is stable via useMemo with proper deps. | 3.4 | 1 hour |
| M22 | **Split ToastContext into dispatch/state** — Prevent all consumers re-rendering on toast state changes. | 3.4 | 1 hour |
| M23 | **Replace manual types with Zod schemas** — DamageCalculation, KillEstimate, RankDisplay, KeyConcept, Summary, PendingChange, RemoteChange, PersistOptions. | 4.10 | 2 hours |
| M24 | **Add rate limiting to direct repository calls** — Wrap repository insert functions with client-side rate limiter or add RLS policies. | 2.11 | 1 hour |
| M25 | **Wire RivalsScreen stub or remove it** — Stub screen with dead imports. Either implement or delete. | 4.8 | 1 hour |
| M26 | **Add missing E2E flows** — Settings, Boss, Streaks. Critical user journeys. | 6.7 | 4 hours |
| M27 | **Strengthen loginSchema password validation** — Add .min(8) to prevent empty-password brute force. | 2.3 | 5 min |
| M28 | **Add format validation to resetPasswordSchema token field** — Validate UUID/JWT format. | 2.3 | 15 min |

## 7.4 LOW Priority (CAN defer past release)

| # | Issue | Section |
|------|-------|---------|
| L1 | Fix inline style factory functions creating new objects every render | 3.2 |
| L2 | Remove unused `lazyScreen` wrapper or start using it | 3.7 |
| L3 | Verify test barrel re-export files correctly aggregate all test suites | 4.12 |
| L4 | Migrate SVG hardcoded hex colors to theme tokens (lower priority than style props) | 4.9 |
| L5 | Add touch target enforcement (use touchTarget utility systematically) | 5.3 |
| L6 | Manual color contrast verification after token migration | 5.4 |
| L7 | Additional E2E flows beyond the 3 critical ones | 6.7 |
| L8 | Dependency audit (npm audit) in CI | 6.8 |
| L9 | Bundle size analysis in CI | 6.8 |
| L10 | Coverage upload to dashboard (Codecov/Coveralls) | 6.8 |
| L11 | Fix cross-feature dependency: home-spine → streaks, liveops-config → onboarding | 4.11 |
| L12 | Optimize inline onPress callbacks (238 instances — can do incrementally) | 3.2 |
| L13 | Move client-side achievement sort to query layer | 3.12 |
| L14 | Reanimated default import removal (minor bundle savings) | 3.6 |
| L15 | Fix ItemSeparatorComponent factory pattern (move to stable reference) | 3.1 |

---

## 7.5 Store Submission Readiness Checklist

### Apple App Store

| # | Requirement | Status |
|------|-------------|--------|
| A1 | Apple Developer Account ($99/year) | VERIFY |
| A2 | Bundle identifier in app.json (`ios.bundleIdentifier`) | VERIFY |
| A3 | EAS CLI installed and authenticated | VERIFY |
| A4 | Production iOS build (`eas build --platform ios --profile production`) | BUILD & TEST |
| A5 | App Store Connect app record created | VERIFY |
| A6 | App Store screenshots (6.7" + 6.5" + 5.5" displays) | PREPARE |
| A7 | Privacy policy URL configured | VERIFY |
| A8 | App privacy labels (nutrition labels) completed | PREPARE |
| A9 | Export compliance (encryption usage declaration) | COMPLETE |
| A10 | TestFlight internal testing group configured | VERIFY |
| A11 | App rating (content rating) configured | COMPLETE |
| A12 | In-app purchases/products configured in App Store Connect | VERIFY |
| A13 | Sign in with Apple configured (if using social auth) | VERIFY |
| A14 | Push notification certificate configured | VERIFY |
| A15 | App Review notes prepared (test account credentials, special features) | PREPARE |
| A16 | `NSAppTransportSecurity` allows all required domains | VERIFY |
| A17 | App icon (1024x1024) uploaded to App Store Connect | PREPARE |
| A18 | Version number consistent across app.json, Xcode, and App Store Connect | VERIFY |

### Google Play Store

| # | Requirement | Status |
|------|-------------|--------|
| G1 | Google Play Developer Account ($25 one-time) | VERIFY |
| G2 | Package name in app.json (`android.package`) | VERIFY |
| G3 | EAS CLI installed and authenticated | VERIFY |
| G4 | Production Android build (`eas build --platform android --profile production`) | BUILD & TEST |
| G5 | Google Service Account key configured in EAS | VERIFY |
| G6 | App created in Google Play Console | VERIFY |
| G7 | First manual upload to Play Console (required by API limitation) | DO NOW |
| G8 | App screenshots for phone + tablet + TV | PREPARE |
| G9 | Privacy policy URL configured | VERIFY |
| G10 | Content rating questionnaire completed | COMPLETE |
| G11 | App signing key (uploaded to Play Console or managed by Play Signing) | VERIFY |
| G12 | Android App Bundle (AAB) signed with correct keystore | VERIFY |
| G13 | Target API level meets Play Store requirements (API 34+) | VERIFY |
| G14 | In-app products/subscriptions configured in Play Console | VERIFY |
| G15 | Data safety section completed | PREPARE |
| G16 | Deep links verified (app links / universal links) | TEST |
| G17 | App icon (512x512) uploaded to Play Console | PREPARE |
| G18 | Version code and version name consistent | VERIFY |

---

## 7.6 Post-Release Monitoring Plan

### Immediate (first 24 hours)
```
1. Sentry monitoring — watch for crash spikes
   → Dashboard: https://sentry.io (verify project setup)
   → Alert threshold: >1% crash rate for any release

2. Supabase monitoring — watch for RLS errors, connection spikes
   → Dashboard → Reports → API usage

3. App Store Connect Analytics — first-time downloads, crashes
4. Google Play Console → Android vitals → Crash rate, ANR rate

5. RevenueCat — purchase success rate
   → Alert if purchase failure rate > 5%

6. PostHog — session recordings, funnel conversion
   → Watch onboarding → first session conversion rate
```

### Short-term (first week)
```
1. Monitor all Sentry issues — triage and fix critical before they accumulate
2. Check Supabase database performance — add indexes if needed
3. Check RevenueCat subscription activations
4. Monitor Realtime subscription volume
5. Review user feedback in App Store / Play Store reviews daily
6. Check edge function invocation counts and rate limit hits
```

### Week 2-4
```
1. Review analytics: feature adoption, retention cohorts, conversion funnels
2. Performance profiling on real devices (React Native DevTools)
3. Supabase usage audit — optimize expensive queries
4. First patch release based on Sentry crash reports and user feedback
```

---

## 7.7 Pre-Submission Final Verification Steps

These MUST be done in order, no exceptions. Each step is a gate — do not proceed to the next until the current step passes.

### Gate 1: Type Check
```bash
npx tsc --noEmit
# ALL errors must be fixed. Zero warnings allowed.
# After fixing navigation type registration (H3), this should pass.
```

### Gate 2: Lint
```bash
npx eslint src/ --max-warnings 0
# ALL lint errors must be fixed. Zero warnings allowed.
```

### Gate 3: Unit Tests
```bash
npm test -- --coverage
# 1. All tests pass (no failures)
# 2. Coverage meets thresholds: branches 70%, functions 70%, lines 70%, statements 70%
# 3. No features excluded from test run
# 4. No legacy failing tests excluded
```

### Gate 4: RLS Verification
```bash
node scripts/check-rls.js
# ALL tables have RLS enabled with appropriate policies.
```

### Gate 5: E2E Tests
```bash
npx detox test --configuration ios.sim.release
# Auth flow, session flow, purchase flow all pass.
```

### Gate 6: Production Build (iOS)
```bash
eas build --platform ios --profile production
# Build succeeds. Install on test device via TestFlight.
```

### Gate 7: Production Build (Android)
```bash
eas build --platform android --profile production
# Build succeeds. Install on test device.
```

### Gate 8: Manual Smoke Test on Real Device
```
- [ ] App launches without crash
- [ ] Auth: sign up, sign in, sign out, password reset
- [ ] Onboarding: complete full flow
- [ ] Home screen: all sections render, no layout issues
- [ ] Session: start session, timer works, complete session, see results
- [ ] Boss: boss encounter renders, attack works
- [ ] Streaks: streak displays correctly, streak check works
- [ ] Challenges: challenges list renders, claim works
- [ ] Profile: profile renders, mastery levels show
- [ ] Notifications: notification list renders, badge count correct
- [ ] Settings: all settings can be changed and persist
- [ ] Content Study: study flow works
- [ ] AI Coach: coach messages appear and can be dismissed
- [ ] Paywall: paywall renders, test purchase works (sandbox)
- [ ] Offline: airplane mode, app doesn't crash, offline banner shows
- [ ] Deep links: test vex://auth/callback and other deep link paths
- [ ] Accessibility: VoiceOver/TalkBack navigates correctly
- [ ] Dark mode: all screens render correctly
- [ ] Network recovery: toggle airplane off, app recovers gracefully
```

### Gate 9: Store Submission
```bash
eas submit --platform ios
eas submit --platform android
```

---

## 7.8 Release Runbook

### Phase 0: Pre-Flight (1-2 days before submission)
```
- [ ] All CRITICAL items (C1-C2) fixed and verified
- [ ] All HIGH items (H1-H12) fixed and verified
- [ ] As many MEDIUM items as possible fixed
- [ ] App signed with production certificates
- [ ] All store metadata prepared:
      - App name, subtitle, description
      - Keywords (iOS) / tags (Android)
      - Category selections
      - Screenshots for all required device sizes
      - Privacy policy URL live and accessible
      - Support URL or email
      - App rating questionnaire completed
      - In-app purchases configured and approved
- [ ] Test account credentials prepared for app review
- [ ] App review notes written (explain special features, provide demo account)
- [ ] RMV checked — ready for market validation
```

### Phase 1: Internal TestFlight / Internal Testing Track (1 day)
```
1. Submit build to TestFlight (iOS) / Internal Testing (Android)
   eas submit --platform ios
   eas submit --platform android

2. Distribute to internal testers (team members)
3. Collect feedback, fix critical issues
4. Run Gate 8 smoke test on real devices
```

### Phase 2: External TestFlight / Closed Alpha (3-5 days)
```
1. Submit for TestFlight external testing / Play Store closed testing
2. Distribute to beta testers (20+)
3. Monitor Sentry for crashes
4. Monitor RevenueCat for purchase testing
5. Collect UX feedback
6. Fix critical and high-priority bugs
7. Run Gate 1-5 verification steps again
```

### Phase 3: Release Candidate (1 day before launch)
```
- [ ] All critical and high bugs from beta fixed
- [ ] All gate verification steps pass (Gates 1-8)
- [ ] Release notes written
- [ ] App store listing final review
- [ ] Marketing materials ready
- [ ] Support team briefed
- [ ] Rollback plan prepared:
      - How to pull the build from App Store Connect
      - How to revert to previous version
      - Emergency contact list
- [ ] Analytics dashboards set up
- [ ] Monitoring alerts configured
```

### Phase 4: Launch Day
```
1. Submit for App Review (Apple) — submit 1-3 days before target launch
2. Submit to Play Store (Google) — typically faster approval
3. Monitor app review status
4. Handle any rejection reasons immediately:
   - Apple Common Rejections: missing privacy labels, insufficient permissions descriptions,
     sign-in requirements, incomplete functionality, placeholder content
5. Once approved, release to store:
   - iOS: Manual release or set to automatic
   - Android: Publish to production track
6. Announce launch
7. Monitor Sentry + Analytics for first 4 hours continuously
```

### Phase 5: Post-Launch (Week 1)
```
- [ ] Daily Sentry review — triage all new issues
- [ ] Daily analytics review — conversion funnels, retention
- [ ] Daily app store review monitoring — respond to negative reviews within 24h
- [ ] Edge function cost monitoring — AI/trigger job spend
- [ ] Database performance — query timing, connection count
- [ ] RevenueCat — purchase conversion, subscription starts
- [ ] Push notification deliverability
- [ ] Schedule first patch release (target within 7 days if any critical bugs found)
```

### Rollback Procedure (if needed)
```
1. iOS: App Store Connect → App → Pricing and Availability → Remove from sale
   OR: Submit new version with fix and request expedited review

2. Android: Play Console → Release → Production → Create new release
   → Upload previous working AAB → Rollout 100% → Review and release

3. Database: If migration caused issues, run down migration:
   supabase db reset (for dev)
   OR: manually run reverse SQL migration

4. Communication:
   - Post status update on app support page
   - Notify beta testers
   - Update release notes with known issues
```

---

# APPENDIX A: Complete File Audit Reference

## Files Exceeding 200 Lines (Must Split Before Release)

```
src/components/glass/LiquidGlassObject.tsx — 398 lines
src/components/glass/GlassSurface.tsx — 285 lines
src/components/glass/LiquidGlassSphere.tsx — 282 lines
src/components/glass/GlassCard.tsx — 259 lines
src/screens/home/components/HomeReferenceSections.tsx — 250 lines
src/components/primitives/Card.tsx — 246 lines
src/icons/actionIcons.ts — 224 lines
src/features/mode-native/components/ModeNativeHome.tsx — 223 lines
src/components/glass/LiquidButton.tsx — 220 lines
src/features/challenges/hooks/index.ts — 214 lines
src/screens/home/containers/HomeScreenInner.tsx — 210 lines
src/features/ai-coach/components/primitives/button.tsx — 201 lines
src/screens/home/ContentStudyHeroCard.tsx — 201 lines
```

## Features Missing Root index.ts Barrel

```
src/features/account-deletion/
src/features/achievements/
src/features/auth/
src/features/companion-promise/
src/features/feature-gate/
src/features/focus-contract/
src/features/home-spine/
src/features/monthly-report/
src/features/personal-bests/
src/features/reward-ledger/
src/features/session-history/
src/features/session-recommendation/
src/features/vex-actions/
```

## 67 Files With Hardcoded Hex Colors

```
src/components/glass/LiquidGlassObject.tsx
src/components/glass/LiquidGlassSphere.tsx
src/components/glass/WaterBubble.tsx
src/components/glass/GlassCard.tsx
src/components/glass/GlassSurface.tsx
src/components/glass/LiquidButton.tsx
src/components/primitives/Card.tsx
src/components/primitives/VexLaunchButton.tsx
src/components/premium/PremiumSurface.tsx
src/components/premium/premium-surface-extras.tsx
src/screens/home/components/FocusModeCardView.tsx
src/screens/home/components/HomeReferenceSections.tsx
src/screens/home/components/VexFocusSurface.tsx
src/screens/home/components/MiniBossPreview.tsx
src/screens/home/components/HomeHeroSection.tsx
src/screens/home/ContentStudyHeroCard.tsx
src/screens/home/containers/HomeScreenInner.tsx
src/screens/profile/ProfileIdentityBlock.tsx
src/screens/profile/ProfileScreen.tsx
src/screens/profile/components/MasteryCard.tsx
src/screens/profile/components/ProfileGlassTabs.tsx
src/screens/boss/BossScreen.tsx
src/screens/boss/BossScreenSectionsInner.tsx
src/screens/session/SessionCompleteScreen.tsx
src/screens/session/SessionInProgressScreen.tsx
src/screens/auth/RegisterScreen.tsx
src/screens/auth/LoginScreen.tsx
src/screens/settings/SettingsScreen.tsx
src/screens/settings/PrivacySettingsScreen.tsx
src/screens/settings/CoachSettingsScreen.tsx
src/screens/settings/NotificationSettingsScreen.tsx
src/screens/notifications/NotificationsScreen.tsx
src/screens/search/SearchScreen.tsx
src/screens/streaks/StreakFuneralScreen.tsx
src/features/focus-identity/components/score-card.tsx
src/features/focus-identity/components/factor-map.tsx
src/features/focus-identity/components/focus-score-dashboard.tsx
src/features/focus-identity/components/focus-score-summary.tsx
src/features/focus-identity/components/identity-block.tsx
src/features/focus-identity/components/radar-chart.tsx
src/features/ai-coach/components/CoachInterventionBanner.tsx
src/features/ai-coach/components/intervention-helpers.tsx
src/features/ai-coach/components/CoachMessageBubble.tsx
src/features/ai-coach/components/primitives/button.tsx
src/features/ai-coach/components/primitives/card.tsx
src/features/home-spine/components/AtRiskBanner.tsx
src/features/home-spine/components/StreakWidget.tsx
src/features/home-spine/components/DayCheckRow.tsx
src/features/home-spine/components/StartSessionButton.tsx
src/features/home-spine/components/RecentSessionsList.tsx
src/features/challenges/components/ChallengeCard.tsx
src/features/challenges/components/ChallengeHub.tsx
src/features/challenges/components/ChallengeList.tsx
src/features/companion/components/CompanionStatusBar.tsx
src/features/companion/components/CompanionMemoryTimeline.tsx
src/features/content-study/components/YouTubeVideoPreview.tsx
src/features/content-study/screens/StudyLibraryScreen.tsx
src/features/mode-native/components/ModeNativeHome.tsx
src/features/mode-native/components/ModeNativeCard.tsx
src/features/progression/components/ProgressBar.tsx
src/features/progression/components/LevelUpModal.tsx
src/features/rewards/components/RewardCard.tsx
src/features/streaks/components/StreakFlame.tsx
src/features/streaks/components/StreakTracker.tsx
src/features/mastery/components/MasteryWheel.tsx
src/features/unlock-explainer/components/UnlockModal.tsx
src/features/session-events/components/EventCard.tsx
```

---

# APPENDIX B: Quick-Reference Fix Commands

```bash
# 1. Rotate secrets (CRITICAL)
# Do this manually via each service's dashboard

# 2. TypeScript type check
npx tsc --noEmit

# 3. Lint check
npx eslint src/ --max-warnings 0

# 4. Run all tests with coverage
npm test -- --coverage

# 5. Run RLS verification
node scripts/check-rls.js

# 6. Run E2E tests (iOS)
npx detox test --configuration ios.sim.release

# 7. Production build (iOS)
eas build --platform ios --profile production

# 8. Production build (Android)
eas build --platform android --profile production

# 9. Submit to App Store
eas submit --platform ios

# 10. Submit to Play Store
eas submit --platform android

# 11. Check for any remaining large files
Get-ChildItem -LiteralPath src -Recurse -Include *.ts,*.tsx |
  ForEach-Object { $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines;
                   if ($lines -gt 200) { "$($lines) lines - $($_.FullName)" } }

# 12. Check for hardcoded hex colors
rg -l '#[0-9a-fA-F]{3,8}' src/ --type ts --type tsx |
  Where-Object { $_ -notmatch 'theme\\tokens|\.test\.|__tests__' }

# 13. Check for Math.random() in non-UI code
rg 'Math\.random\(\)' src/ --type ts --type tsx |
  Where-Object { $_ -notmatch 'Confetti|Atmosphere|test|__tests__' }
```

---

# APPENDIX C: Hermes Agent Instructions

This section contains instructions for executing fixes via Hermes overnight. Each fix block is self-contained with exact file paths, before/after code, and verification steps.

## Fix Block C1: Rotate Secrets
```instructions
IMPORTANT: DO NOT execute these rotations. Instead, OUTPUT the full list of keys
that need rotation and the exact URLs where to rotate them. This is a manual
security operation that requires human access to the service dashboards.

Services to rotate:
1. Trigger.dev: https://app.trigger.dev → Settings → API Keys
2. Supabase: https://supabase.com/dashboard → Project Settings → API
3. Google AI Studio: https://aistudio.google.com/apikey
4. Pinecone: https://app.pinecone.io → API Keys
5. Sentry: https://sentry.io → Settings → Projects → Client Keys

After rotation, update .env.server with the new values.
```

## Fix Block H1: Split Large Files
```instructions
For each file listed in APPENDIX A "Files Exceeding 200 Lines":
1. Read the file
2. Identify logical sub-components or sections
3. Extract each into its own file
4. Keep the original file as the main entry point under 200 lines
5. Import and re-export from the split files

Example for LiquidGlassObject.tsx (398 lines):
- LiquidGlassObject.tsx → keeps the main component (~150 lines)
- LiquidGlassObject.SVGDefs.tsx → contains all <defs> and <linearGradient> definitions
- LiquidGlassObject.styles.ts → extracted style objects

Verify: no file in src/ exceeds 200 lines.
```

## Fix Block H2: Replace Math.random() with uuid v4
```instructions
File: src/utils/uuid.ts:46
REMOVE the Math.random() fallback and replace with a proper error:
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Crypto API unavailable');
  }

Files to replace Math.random() in ID generation:
- src/session/utils/idGenerator.ts:24,32 → use import { v4 } from '../../utils/uuid'
- src/features/ai-coach/service/intervention-engine-helpers.ts:147 → use v4()
- src/features/session-start/events.ts:14 → use v4()
- src/features/notifications/events.ts:178 → use v4()

DO NOT replace Math.random() in:
- src/features/streaks/components/Confetti.tsx (animation only)
- src/screens/auth/components/VexAtmosphere.tsx (visual effect only)
```

## Fix Block H4: Create Barrel Exports
```instructions
For each of the 13 features listed in "Features Missing Root index.ts Barrel":
1. Read the feature's hooks.ts, service.ts, types.ts, schemas.ts
2. Determine which exports are the public API
3. Create src/features/<feature>/index.ts that re-exports those
4. Example for home-spine:
   export { useHomeSpineModel } from './hooks';
   export { buildHomeReturnReasonState } from './service';
   export type { HomeSpineModel } from './schemas';

Then, find ALL import sites that import from feature internals:
   rg "from '.*features/(home-spine|account-deletion|achievements|auth|companion-promise|feature-gate|focus-contract|monthly-report|personal-bests|reward-ledger|session-history|session-recommendation|vex-actions)/(hooks|service|types|schemas|store)" src/ --type ts --type tsx

For each import site:
   CHANGE: import { X } from '../../features/feature-name/hooks'
   TO:     import { X } from '../../features/feature-name'
```

## Fix Block H7: Fix 48 Legacy Failing Tests
```instructions
Priority order:
1. session-completion (30 excluded files) — core session engine
2. ai-coach (8 excluded files) — core AI functionality
3. streaks (2 excluded files)
4. content-study (2 excluded files)
5. feature-gate (1 file)
6. auth (1 file)

For each test file:
1. Run in isolation: npx jest <filepath> --verbose
2. Read the test and the implementation
3. Determine if test expectations are wrong (fix test) or code is wrong (fix code)
4. After passing, remove from jest.legacy-failing-tests.js
```

---

# FINAL CHECKLIST — SIGN OFF

```
[ ] All CRITICAL items (C1-C2) resolved
[ ] All HIGH items (H1-H12) resolved
[ ] All MEDIUM items possible resolved
[ ] All 13 large files split (≤200 lines each)
[ ] All 13 features have index.ts barrel exports
[ ] All 5 routes registered in navigation types
[ ] All business logic moved from screens to service/hooks
[ ] npx tsc --noEmit passes with zero errors
[ ] npx eslint src/ --max-warnings 0 passes
[ ] npm test -- --coverage passes at 70%+ on all thresholds
[ ] 48 legacy failing tests fixed and re-enabled
[ ] 46 skipped test suites unskipped and passing
[ ] No features excluded from CI (remove testPathIgnorePatterns)
[ ] Secrets rotated
[ ] RLS verified on all tables
[ ] E2E tests passing
[ ] Production iOS build succeeds
[ ] Production Android build succeeds
[ ] Manual smoke test on real device passes all checklist items
[ ] Store metadata prepared (screenshots, descriptions, privacy policy)
[ ] EAS Submit commands tested
[ ] Rollback plan documented and reviewed
[ ] Support team briefed
[ ] Analytics dashboards confirmed working
```

---

*End of Release Audit Report. Generated May 30, 2026.*
*Codebase: 4,557 TypeScript files | 56 features | 8,643 test cases | 6 edge functions | 38 migrations*
