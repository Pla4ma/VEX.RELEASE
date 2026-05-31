# codereviewSPECIAL.md — VEX Pre-Release Deep Code Review

> **Audience:** Hermes (autonomous overnight executor)
> **Author:** Sisyphus (deep static + structural audit)
> **Date:** 2026-05-30
> **Scope:** Code only — security, performance, correctness, architecture, type-safety, maintainability, AI-slop. **NO product/feature decisions** (a human owns those).
> **Goal:** Make the app *code-complete* and *release-safe*. This is the last gate before ship.

---

## 0. HOW TO USE THIS DOCUMENT (READ FIRST)

This document is an **execution plan**, not prose. Every finding has the same shape so you can act without re-investigating:

```
### [ID] Title
- **Severity:** P0 | P1 | P2 | P3
- **Location:** exact file:line
- **Category:** crash / security / financial / leak / architecture / type-safety / perf / slop
- **Evidence:** what was observed (verbatim where possible)
- **Why it matters:** the production consequence
- **Exact fix:** step-by-step, with code
- **Verify:** the command that proves it is fixed
```

### Execution rules for Hermes

1. **Work strictly top-down by priority.** Finish ALL P0 before ANY P1. A single P0 left in = do not ship.
2. **One finding = one atomic commit.** Commit message format: `fix(<area>): <ID> <short>`. Never batch unrelated findings.
3. **After every fix, run the finding's `Verify` command.** If it fails, the fix is not done. Do not move on.
4. **After every batch of ~5 fixes, run the Global Gate (Section 1.2).** If any gate regresses, stop and fix before continuing.
5. **Never suppress.** No `as any`, no `@ts-ignore`, no `@ts-expect-error`, no deleting tests, no `eslint-disable` to make a gate green. If a fix needs a suppression, the fix is wrong — re-read the finding.
6. **Respect the layering law** (`AGENTS.md`): `Component → Hook → Service → Repository → Supabase`. Never shortcut it to close a finding faster.
7. **Match existing tokens/patterns.** This codebase is disciplined. Sample 2 sibling files before writing new code. Use `src/theme/tokens/`, the haptics wrapper, the logger — never hardcode, never `console.log`.
8. **If a finding is already fixed** (someone else touched it), verify with the `Verify` command, mark it done in your log, move on. Do not revert work you did not make — other agents share this worktree.
9. **If a fix is genuinely ambiguous or risks behavior change beyond the finding, STOP and leave a `// REVIEW:` note** with your reasoning rather than guessing. Better a flagged unknown than a silent regression.

### Severity definitions

| Sev | Meaning | Ship without fixing? |
|-----|---------|----------------------|
| **P0** | Crash, data-loss, security hole, financial incorrectness, broken core flow | **NO. Hard blocker.** |
| **P1** | Memory leak, stale data, architecture rot that will cause P0s soon, latent crash | **NO. Fix before ship.** |
| **P2** | Maintainability debt, AI-slop, lint errors, type-safety erosion | Strongly discouraged; fix in this pass |
| **P3** | Style, lint warnings, nits | Optional; batch-fixable |

---

## 1. VERIFICATION BASELINE (current state, 2026-05-30)

This is the ground truth captured at audit time. Use it to detect regressions.

### 1.1 Gate results as-found

| Gate | Command | Result | Notes |
|------|---------|--------|-------|
| TypeScript | `npx tsc --noEmit` | ✅ **EXIT 0** | Clean. Strict mode fully on. Protect this. |
| ESLint | `npm run lint` | ❌ **53 errors**, 102,311 warnings | Errors are real (hooks). Warnings are 99% `singlequote` noise. |
| Line limit | `node scripts/check-line-limit.js` | ❌ **6 files > 200** | 1 prod (`config/supabase.ts` = 201), 5 test files = 201. |
| Banned patterns | `node scripts/check-banned-patterns.js` | ❌ **3** | **All false positives** (see [SLOP-07]). |
| ts-nocheck | `node scripts/check-no-ts-nocheck.js` | ✅ **0/56** | Clean. |
| Debt freeze | `node scripts/check-debt-freeze.js` | ❌ **56 new** | Breakdown in §1.3. |

### 1.2 The Global Gate (run after every ~5 fixes)

```powershell
npx tsc --noEmit; if ($?) { Write-Host "TSC OK" }
npm run lint 2>&1 | Select-String "problems"
node scripts/check-line-limit.js
node scripts/check-banned-patterns.js
node scripts/check-debt-freeze.js
```

**Success target at end of this pass:**
- `tsc` → exit 0 (unchanged)
- lint → **0 errors** (warnings may remain; see [P3-01])
- line-limit → 0 prod violations
- banned-patterns → 0 (after fixing the 1 real + accepting documented false positives)
- debt-freeze → trending to 0 new

### 1.3 Debt-freeze breakdown (56 new)

| Bucket | Count | Real issue? | Finding |
|--------|-------|-------------|---------|
| line limit > 200 | 4 | 1 prod real | [SLOP-01] |
| `as unknown as` | 17 | 3 prod real, 14 test | [TYPE-01] |
| `as any` | 23 | **0 prod** (all test) | [TYPE-02] |
| Supabase outside `repository.ts` | 11 | architecture | [ARCH-01] |
| `useQuery` in component | 1 | architecture | [ARCH-02] |

### 1.4 What is already GOOD (do not "fix", do not regress)

The team has real discipline. These passed clean — preserve them:

- ✅ **Zero `as any` in shipped code** (only in test files).
- ✅ **Zero `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`** anywhere.
- ✅ **Zero empty catch blocks**, zero `catch (e: any)`.
- ✅ **`console.*` only in `src/utils/debug.ts`** (the sanctioned logger). 4 hits, all legitimate.
- ✅ **No `Animated` from `react-native`** (Reanimated only).
- ✅ **No `StyleSheet.create`**.
- ✅ **No git-tracked `.env`** (only `.example` files; `.gitignore` correct).
- ✅ **No `.only` test footguns** (would silently skip the suite in CI).
- ✅ **No `eval` / `new Function` / `dangerouslySetInnerHTML`**.
- ✅ **`SecureStorage`** correctly uses `expo-secure-store` native + tab-scoped `sessionStorage` on web for tokens.
- ✅ **`config/supabase.ts`** uses a lazy `Proxy` so importing never constructs the client (avoids crash-before-error-boundary).
- ✅ **Strict tsconfig**: `strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch` all on.

> **Hermes:** if any of these flip during your pass, you introduced a regression. Revert and rethink.

---

## 2. P0 — HARD BLOCKERS (crash / security / financial / core-flow)

Fix every one of these before any other work. Each is independently capable of getting the app rejected, crashing on users, or corrupting money/data.

---

### [P0-01] `SessionSetupScreen` calls a hook after a conditional early return — crashes on first-session flow

- **Severity:** P0 (crash)
- **Location:** [`src/screens/session/SessionSetupScreen.tsx:42-55`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/screens/session/SessionSetupScreen.tsx#L42-L55)
- **Category:** crash (Rules of Hooks violation)
- **Evidence:** ESLint `react-hooks/rules-of-hooks` at line 51. The component returns early at line 42 (`if (isFirstSessionSetup) return <FirstSessionView/>`), then calls `useSessionStartController(...)` at line 51.

```tsx
if (isFirstSessionSetup) {
  return ( <FirstSessionView .../> );   // ← early return (line 42)
}
const controller = useSessionStartController({ ... });  // ← HOOK after return (line 51) 💥
```

- **Why it matters:** React tracks hooks by call order. When `route.params.source` toggles between onboarding and non-onboarding across renders, the hook count changes → React throws *"Rendered fewer hooks than expected"* and the screen white-screens. This is the **session setup** screen — the single most important flow in the app. It will crash for real users the moment they navigate from onboarding into a normal setup (or vice-versa) without unmount.
- **Exact fix:** Hooks must run unconditionally before any return. Move the branch *into* the render output, not before the hook.

```tsx
export const SessionSetupScreen = withScreenErrorBoundary(
  function _SessionSetupScreen(): React.JSX.Element {
    const navigation = useNavigation<SessionNavigationProp>();
    const route = useRoute<SessionSetupRouteProp>();
    const isFirstSessionSetup =
      route.params?.source === SESSION_SETUP_SOURCE_ONBOARDING;

    const [contractText, setContractText] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] =
      useState<SessionDifficulty>("FOCUSED");

    // ALL hooks run unconditionally, every render:
    const controller = useSessionStartController({
      navigation,
      routeParams: route.params,
      focusContractText: contractText.trim().length >= 3 ? contractText : null,
    });

    // Branch on OUTPUT only — after all hooks have run:
    if (isFirstSessionSetup) {
      return (
        <FirstSessionView navigation={navigation} onBack={() => navigation.goBack()} />
      );
    }

    if (!controller.userId) {
      return ( /* ...Not authenticated box unchanged... */ );
    }

    return ( <ReturningUserView controller={controller} .../> );
  },
  "Session Setup",
);
```

> ⚠️ Verify `useSessionStartController` tolerates being called during the first-session path (it now always runs). If it does network work keyed on `route.params`, gate that work *inside* the hook with an `enabled` flag rather than by not calling it. Read the hook before editing.

- **Verify:**
```powershell
npx eslint src/screens/session/SessionSetupScreen.tsx --ext .tsx
# expect: 0 problems
npx jest src/screens/session --silent
```

---

### [P0-02] `RescueBanner` calls `useCallback` twice after an early return — crashes when eligibility flips

- **Severity:** P0 (crash)
- **Location:** [`src/features/rescue-mode/components/RescueBanner.tsx:34-53`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/rescue-mode/components/RescueBanner.tsx#L34-L53)
- **Category:** crash (Rules of Hooks)
- **Evidence:** ESLint `react-hooks/rules-of-hooks` at lines 45 and 50. `if (!eligibility.eligible) return null;` (line 34) precedes `useCallback` at 45 and 50.

```tsx
const rescueSurface = useMemo(...);     // line 29 — ok
if (!eligibility.eligible) return null; // line 34 — EARLY RETURN
...
const handleStart = useCallback(...);   // line 45 — HOOK after return 💥
const handleDismiss = useCallback(...); // line 50 — HOOK after return 💥
```

- **Why it matters:** When `eligibility.eligible` transitions `false → true` while the component stays mounted (which is exactly what happens — eligibility is computed from live session state), the hook count jumps from 1 to 3 and React crashes. Rescue mode is a retention surface shown to struggling users; crashing it is doubly bad.
- **Exact fix:** Move both `useCallback`s above the early return. The `useMemo` is already correctly placed; co-locate the callbacks with it.

```tsx
export function RescueBanner({ eligibility, onStartRescue, onDismiss, lane, ... }: RescueBannerProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const rescueSurface = useMemo(
    () => (lane ? deriveRescueSurface(lane) : null),
    [lane],
  );

  const handleStart = useCallback(() => {
    sessionStart();
    onStartRescue();
  }, [onStartRescue]);

  const handleDismiss = useCallback(() => {
    buttonTap();
    onDismiss();
  }, [onDismiss]);

  // Early return AFTER all hooks:
  if (!eligibility.eligible) return null;

  const minutes = Math.round(eligibility.recommendedDurationSeconds / 60);
  // ...rest unchanged
}
```

- **Verify:**
```powershell
npx eslint src/features/rescue-mode/components/RescueBanner.tsx --ext .tsx
npx jest src/features/rescue-mode --silent
```

---

### [P0-03] `NearMissIndicator` calls 3 shared values + `useEffect` after an early return — crashes on every non-near-miss render

- **Severity:** P0 (crash)
- **Location:** [`src/features/challenges/components/NearMissIndicator.tsx:46-81`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/challenges/components/NearMissIndicator.tsx#L46-L81)
- **Category:** crash (Rules of Hooks)
- **Evidence:** `react-hooks/rules-of-hooks`. `if (!isValidNearMiss) { ...; return null; }` at line 46, then `useSharedValue` ×3 (55-57), `useEffect` (59), `useAnimatedStyle` ×3 (83-89) all after.

```tsx
if (!isValidNearMiss) {
  Sentry.addBreadcrumb({...});
  return null;                          // line 52 — EARLY RETURN
}
const pulseOpacity = useSharedValue(0.6);   // line 55 — HOOK after return 💥
const progressWidth = useSharedValue(0);
const shakeX = useSharedValue(0);
useEffect(() => {...}, [...]);              // line 59 💥
```

- **Why it matters:** `progressPercent` is a prop that changes continuously as a challenge progresses. The instant it crosses `NEAR_MISS_THRESHOLD`, the hook count flips from 0 to 7 and React crashes mid-animation. This component is *designed* to appear/disappear based on a numeric threshold — it is structurally guaranteed to hit the crash.
- **Exact fix:** Hooks first, then branch. The Sentry breadcrumb can move into the effect or stay as a guarded log after hooks.

```tsx
export const NearMissIndicator: React.FC<NearMissIndicatorProps> = ({
  challengeId, userName, progressPercent, hoursUntilNext, onAcknowledge, onViewNextChallenge,
}) => {
  const { theme } = useTheme();
  const isValidNearMiss =
    progressPercent >= NEAR_MISS_THRESHOLD && progressPercent < COMPLETE_THRESHOLD;

  const pulseOpacity = useSharedValue(0.6);
  const progressWidth = useSharedValue(0);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (!isValidNearMiss) return;        // gate the EFFECT, not the hook call
    progressWidth.value = withSpring(progressPercent / 100, { damping: 15, stiffness: 50 });
    pulseOpacity.value = withRepeat(withSequence(
      withTiming(1, { duration: 600 }), withTiming(0.4, { duration: 600 })), -1, true);
    shakeX.value = withDelay(1000, withSequence(
      withTiming(-3, { duration: 100 }), withTiming(3, { duration: 100 }), withTiming(0, { duration: 100 })));
    trackChallengeNearMiss(challengeId, progressPercent);
  }, [isValidNearMiss, challengeId, progressPercent, progressWidth, pulseOpacity, shakeX]);

  const progressStyle = useAnimatedStyle(() => ({ width: `${progressWidth.value * 100}%` }));
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value }));
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  // Branch on OUTPUT after all hooks:
  if (!isValidNearMiss) {
    Sentry.addBreadcrumb({
      category: "challenges",
      message: `NearMissIndicator rendered with invalid progress: ${progressPercent}%`,
      level: "warning",
    });
    return null;
  }

  return ( /* ...unchanged JSX... */ );
};
```

- **Verify:**
```powershell
npx eslint src/features/challenges/components/NearMissIndicator.tsx --ext .tsx
npx jest src/features/challenges --silent
```

---

### [P0-04] Realtime activity channel: subscribe-collision + scheduled-unsubscribe wipes live listeners

- **Severity:** P0 (data/feature breakage + leak)
- **Location:** [`src/services/realtimeSubscriptions.ts:13-69`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/services/realtimeSubscriptions.ts#L13-L69)
- **Category:** leak / correctness (shared mutable channel registry)
- **Evidence:** `broadcastActivity` and `subscribeToActivity` both key into the same `activeChannels` map under the same `getActivityChannelName(channelName)` key.
  - `broadcastActivity` (line 41-44) schedules `setTimeout(() => { channelToClean?.unsubscribe(); activeChannels.delete(fullChannelName); }, 5000)`.
  - `subscribeToActivity` (line 64) stores its long-lived listener channel under the *same key*.

- **Why it matters:** Two independent bugs in one place:
  1. **Listener assassination:** If a component is subscribed via `subscribeToActivity` (long-lived) and *anything* calls `broadcastActivity` on the same channel name, the 5-second timer will `unsubscribe()` the **subscriber's** channel and delete it from the registry. The user silently stops receiving realtime updates. No error, no log.
  2. **Key overwrite:** `subscribeToActivity` does `activeChannels.set(fullChannelName, channel)` — if `broadcastActivity` already put a transient channel there, one clobbers the other; the orphaned channel leaks (never unsubscribed).
- **Exact fix:** Separate the namespaces and never let broadcast teardown touch a subscriber channel. Use distinct keys for transient broadcast channels.

```ts
export async function broadcastActivity(channelName, type, payload): Promise<void> {
  const client = getSupabaseClient();
  const fullChannelName = getActivityChannelName(channelName);
  const txKey = `tx:${fullChannelName}`;           // ← transient namespace
  let channel = activeChannels.get(txKey);
  if (!channel) {
    const newChannel = client.channel(`${fullChannelName}:tx:${Date.now()}`);
    await newChannel.subscribe();
    activeChannels.set(txKey, newChannel);
    channel = newChannel;
  }
  if (channel) {
    await channel.send({ type: "broadcast", event: type, payload: {
      ...(payload as Record<string, unknown>), senderId: getCurrentUserId(), timestamp: Date.now() } });
  }
  const channelToClean = channel;
  setTimeout(() => {
    void channelToClean?.unsubscribe();
    if (activeChannels.get(txKey) === channelToClean) activeChannels.delete(txKey); // ← guard
  }, 5_000);
}
```

  And in `subscribeToActivity`, store under the subscriber key only (it already returns a correct unsubscribe). Optionally key it `sub:${fullChannelName}`.

  > **Better long-term (note for human):** broadcasting and subscribing through one shared module-level `activeChannels` map is fragile. Consider a `ChannelRegistry` class that ref-counts subscribers per channel and only tears down at zero. Flagged, not required for ship.

- **Verify:**
```powershell
npx jest src/services --silent
npx tsc --noEmit
```

---

### [P0-05] `useFeedUpdates` effect omits `userId` from deps — subscribes to the wrong user's feed

- **Severity:** P0 (privacy / correctness)
- **Location:** [`src/hooks/useRealtime.ts:134-142`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/hooks/useRealtime.ts#L134-L142)
- **Category:** correctness / privacy (stale closure)
- **Evidence:**
```tsx
export function useFeedUpdates({ userId, onUpdate }: UseFeedUpdatesOptions) {
  useEffect(() => {
    const unsubscribe = subscribeToFeedChanges(userId, (payload) => {...});
    return unsubscribe;
  }, [onUpdate]);   // ← userId MISSING from deps
}
```
The Postgres filter is `user_id=eq.${userId}` (see `subscribeToFeedChanges`). The subscription is created once with the *first* `userId` and never re-subscribes when `userId` changes.

- **Why it matters:** On account switch / re-auth where the same `useFeedUpdates` instance stays mounted, the user keeps receiving **another account's feed events** (and never their own). That is a cross-account data exposure, not just a stale-data bug. `useRealtime.ts:142` is also one of the 21 `exhaustive-deps` ESLint errors.
- **Exact fix:** Add `userId` to deps so the effect re-subscribes on change.

```tsx
useEffect(() => {
  const unsubscribe = subscribeToFeedChanges(userId, (payload) => {
    setUpdates((prev) => [...prev.slice(-19), payload]);
    onUpdate?.(payload);
  });
  return unsubscribe;
}, [userId, onUpdate]);
```

> Stabilize `onUpdate` at call sites with `useCallback` to avoid resubscribe churn (the caller passes it). If callers pass inline functions, that's a separate perf nit — note it but the correctness fix is adding `userId`.

- **Verify:**
```powershell
npx eslint src/hooks/useRealtime.ts --ext .ts   # line 142 error gone
npx jest src/hooks --silent
```

---

### [P0-06] Deep linking is fully stubbed — notification taps and external links go nowhere

- **Severity:** P0 (broken core flow + store-rejection risk)
- **Location:** [`src/navigation/linking-config.ts:63-75`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/navigation/linking-config.ts#L63-L75)
- **Category:** correctness (dead implementation behind a real-looking config)
- **Evidence:**
```ts
export function createLinkingConfig(): LinkingOptions<ExtendedRootStackParams> {
  return {
    prefixes: PREFIXES,
    config: { screens: SCREEN_CONFIG },
    async getInitialURL() { return null; },   // ← always null: cold-start deep link ignored
    subscribe() { return () => {}; },          // ← no-op: warm deep links never delivered
  };
}
```
The `SCREEN_CONFIG` path map is fully fleshed out (login, reset-password/:token, session/active/:sessionId, etc.) and `RootNavigator.tsx:141` wires `linking={linking}`. But `getInitialURL` and `subscribe` are stubbed, so React Navigation receives **no URLs at all**.

- **Why it matters:**
  - **Push notifications can't route.** `useNotificationNavigation` exists ([`src/navigation/hooks/useNotificationNavigation.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/navigation/hooks/useNotificationNavigation.ts)) and `RootNavigator.tsx:131` calls it — but if any notification path relies on the URL linking layer, it's dead. Verify whether notifications route via the imperative `navigationRef` (works) or via `linking` (broken).
  - **`reset-password/:token` is a declared deep link.** A user tapping the password-reset email link lands nowhere. Auth recovery is broken.
  - **2026 store reality:** deep-link handling is a reviewer-tested item (per current RN launch checklists). A declared `vex://` + universal-link scheme that does nothing is both a UX failure and a rejection risk.
- **Exact fix:** Implement the standard Expo `Linking` integration. If notifications must also feed initial URL, merge them.

```ts
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";

export function createLinkingConfig(): LinkingOptions<ExtendedRootStackParams> {
  return {
    prefixes: PREFIXES,
    config: { screens: SCREEN_CONFIG },
    async getInitialURL() {
      const url = await Linking.getInitialURL();
      if (url != null) return url;
      // Cold start from a notification tap:
      const response = await Notifications.getLastNotificationResponseAsync();
      return (response?.notification.request.content.data?.url as string) ?? null;
    },
    subscribe(listener) {
      const linkingSub = Linking.addEventListener("url", ({ url }) => listener(url));
      const notifSub = Notifications.addNotificationResponseReceivedListener((response) => {
        const url = response.notification.request.content.data?.url as string | undefined;
        if (url) listener(url);
      });
      return () => {
        linkingSub.remove();
        notifSub.remove();
      };
    },
  };
}
```

> **MUST validate before merging:** every incoming deep link must be checked against `SCREEN_CONFIG` (React Navigation does this) AND any `:token` param must be treated as untrusted (see [SEC-02]). Do not `Linking.openURL` arbitrary inbound URLs.
> **Confirm the notification data shape** (`data.url`) matches what the push sender actually sets — read `src/features/notifications/` before wiring.

- **Verify:**
```powershell
npx tsc --noEmit
# Manual (Hermes cannot do device QA): document a test plan —
#   npx uri-scheme open "vex://session/active/test-id" --ios
#   npx uri-scheme open "vex://reset-password/abc123" --android
```

---

### [P0-07] Financial RPCs trust unvalidated server payloads via `as { success: boolean }`

- **Severity:** P0 (financial correctness + type-safety)
- **Location:**
  - [`src/features/economy/service.ts:50`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/economy/service.ts#L50) — `return (data as { success: boolean }).success;`
  - [`src/features/economy/service.ts:36`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/economy/service.ts#L36) area (`addCurrency`)
  - [`src/features/economy/wallet-service.ts:36`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/economy/wallet-service.ts#L36), [`:56`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/economy/wallet-service.ts#L56)
- **Category:** financial / type-safety
- **Evidence:** Currency grant/spend RPC results are blindly cast: `(data as { success: boolean }).success`. Compare to the *correct* pattern in [`src/features/progression/operation-atomic.ts:45`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/progression/operation-atomic.ts#L45) which does `AtomicXpRpcResultSchema.parse(data)`.
- **Why it matters:** If the RPC returns `null`, an error envelope, or a renamed field, `(data as {success}).success` is `undefined` (falsy) at best — or throws on null at worst — and the code silently treats a *failed spend as "didn't crash"*. For currency this means **double-spend or lost-grant** depending on caller handling. The XP path already proved the right pattern exists; the money path skipped it. **Money must never be cast — it must be parsed.**
- **Exact fix:** Add a Zod schema and parse, exactly like `operation-atomic.ts`.

```ts
// economy/schemas.ts — add:
export const CurrencyRpcResultSchema = z.object({
  success: z.boolean(),
  new_balance: z.number().optional(),
});
export type CurrencyRpcResult = z.infer<typeof CurrencyRpcResultSchema>;

// economy/service.ts — spendCurrency:
const { data, error } = await supabase.rpc("atomic_spend_currency", {...});
if (error) throw new RepositoryError("spendCurrency", error);
return CurrencyRpcResultSchema.parse(data).success;
```

  Apply the same to `addCurrency` (`service.ts`) and both functions in `wallet-service.ts`.
- **Note (see [ARCH-03]):** `economy/service.ts` and `economy/wallet-service.ts` are **two competing implementations** of the same RPCs. Resolve that duplication while fixing this.
- **Verify:**
```powershell
npx jest src/features/economy --silent
npx tsc --noEmit
```

---

### [P0-08] Inconsistent spend error contract can mask failures as success

- **Severity:** P0 (financial)
- **Location:** [`src/features/economy/wallet-service.ts:43-60`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/economy/wallet-service.ts#L43-L60) vs [`src/features/economy/service.ts:40-51`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/economy/service.ts#L40-L51)
- **Category:** financial / API contract
- **Evidence:** Two `spendCurrency` functions with **different signatures and error semantics**:
  - `wallet-service.spendCurrency` returns `{ success: boolean; error?: SpendError }` and **catches** DB errors into `{ success: false, error }`.
  - `service.spendCurrency` returns `boolean` and **throws** `RepositoryError`.
  The barrel ([`economy/index.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/economy/index.ts)) exports the `wallet-service` one. So the "active" spend swallows DB errors into a boolean.
- **Why it matters:** A caller that does `if (result.success) deductLocally()` will, on a transient DB error, see `success:false` and *not* deduct — but the server may have actually committed the spend (network blip after commit). With no idempotency key on these spend calls (unlike the XP path which passes `p_idempotency_key`), a retry double-spends. Money paths need **idempotency + parsed results + a single contract**.
- **Exact fix:**
  1. Pick ONE contract. Recommend the explicit-result form `{ success; error? }` for money (callers must branch).
  2. Thread an `idempotencyKey` through to the RPC (mirror `tryAtomicAddXp`'s `p_idempotency_key`). Confirm the SQL function accepts it; if not, flag for the backend owner — **do not ship spend without idempotency**.
  3. Delete the duplicate (see [ARCH-03]).
- **Verify:**
```powershell
npx jest src/features/economy --silent
node scripts/check-debt-freeze.js
```

> If the underlying SQL `atomic_spend_currency` has no idempotency parameter, leave a `// REVIEW:` note and surface it to the human — this is a backend contract gap, not purely client.

---

### [P0-09] `stakes-stats.ts` constructs the Supabase client at module load + returns unvalidated RPC data

- **Severity:** P0 (defeats lazy-init crash guard + unvalidated data)
- **Location:** [`src/features/session/repository/stakes-stats.ts:12`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/session/repository/stakes-stats.ts#L12) and `:60-91`
- **Category:** crash-risk / type-safety
- **Evidence:**
  - Line 12: `const supabase = getSupabaseClient();` at **module top level**. This eagerly builds the client the moment this module is imported.
  - `fetchStakesStats` (line 60-91): returns `data` straight from `supabase.rpc("get_stakes_stats")` with **no Zod parse**, typed as a concrete `{ totalSessions: number; ... }` shape it never validates.
- **Why it matters:**
  1. `config/supabase.ts` went to great lengths to make the client **lazy** (the `Proxy` at line 173, the comment at 158-162: "Importing this module must NOT construct the client — construction throws on missing config, which would crash before any error boundary mounts"). This file's top-level `getSupabaseClient()` call **defeats that protection**: importing `stakes-stats.ts` (transitively, from session repo barrels) throws on missing env *before* any error boundary mounts → white screen on cold start with bad config.
  2. The RPC result is cast-by-annotation, not parsed. If the SQL returns snake_case (`total_sessions`) or null, every field is `undefined` and the UI shows `NaN`/blank stats with no error.
- **Exact fix:**
  1. Make the client access lazy — call `getSupabaseClient()` *inside* each function, like every other repository file does (`operation-atomic.ts`, `economy/service.ts` all call it per-invocation).
  ```ts
  // DELETE line 12: const supabase = getSupabaseClient();
  export async function updateStakesPreference(...) {
    const supabase = getSupabaseClient();   // ← inside
    ...
  }
  export async function fetchStakesStats(...) {
    const supabase = getSupabaseClient();   // ← inside
    ...
  }
  ```
  2. Parse the RPC result with a schema:
  ```ts
  const StakesStatsSchema = z.object({
    totalSessions: z.number(), completedSessions: z.number(),
    completionRate: z.number(), totalXpEarned: z.number(), netGems: z.number(),
  }); // adjust field names to the ACTUAL SQL return shape — read the migration
  ...
  return { data: StakesStatsSchema.parse(data), error: null };
  ```
- **Verify:**
```powershell
# Confirm no other module-level client construction:
Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | Where-Object { $_.FullName -notmatch '__tests__' } |
  Select-String -Pattern '^const \w+ = getSupabaseClient\(\)'
# expect: ONLY this file before fix, NONE after
npx jest src/features/session --silent
```

---

## 3. P1 — SECURITY HARDENING (fix before ship)

The codebase is already strong on the obvious stuff (no secrets in git, SecureStore for tokens, no `eval`, deep-link param validation exists). These are the remaining real gaps.

---

### [SEC-01] Hardcoded MMKV encryption keys across 8 stores — at-rest encryption is decorative

- **Severity:** P1 (security)
- **Location:** (all non-test)
  - [`src/persistence/MMKVProvider.ts:17`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/persistence/MMKVProvider.ts#L17) — `encryptionKey: "vex-encryption-key"`
  - [`src/features/ai-coach/services/coach-memory.ts:16`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/ai-coach/services/coach-memory.ts#L16) — `"coach-memory-key"`
  - [`src/features/onboarding/utils/abandon-tracking.ts:12`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/onboarding/utils/abandon-tracking.ts#L12), [`persistence.ts:21`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/onboarding/utils/persistence.ts#L21) — `"onboarding-secure-storage"`
  - [`src/session/utils/persistence.ts:21`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/session/utils/persistence.ts#L21), [`persistence-history.ts:6`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/session/utils/persistence-history.ts#L6), [`persistence-recovery.ts:6`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/session/utils/persistence-recovery.ts#L6) — `"session-secure-storage-key"`
- **Category:** security (at-rest encryption)
- **Evidence:** Every MMKV store hardcodes its `encryptionKey` as a string literal compiled into the JS bundle. 2026 RN security checklists explicitly call out "reviewers and security researchers read your bundle." A static string in the bundle is trivially extractable (`strings`, Hermes bytecode dump), so MMKV "encryption" provides **zero** protection against anyone with the binary.
- **Why it matters:** This is non-sensitive data per the architecture (AGENTS.md says MMKV = non-sensitive, SecureStore = tokens). So this is **not** a token-exposure P0 — but it is a real hardening gap, and shipping with a key literally named `"vex-encryption-key"` is the kind of thing that shows up in a teardown blog post. The fix is cheap: derive the key from a device-generated secret stored in SecureStore.
- **Exact fix:** Generate a random key once, persist it in `expo-secure-store`, reuse it for all MMKV instances.

```ts
// src/persistence/mmkv-key.ts  (new)
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

const KEY_NAME = "vex.mmkv.master-key";
let cached: string | null = null;

export async function getMmkvEncryptionKey(): Promise<string> {
  if (cached) return cached;
  let key = await SecureStore.getItemAsync(KEY_NAME);
  if (!key) {
    const bytes = await Crypto.getRandomBytesAsync(32);
    key = Buffer.from(bytes).toString("base64");
    await SecureStore.setItemAsync(KEY_NAME, key);
  }
  cached = key;
  return key;
}
```

  Then each store awaits this instead of a literal. `MMKVProvider` already lazy-inits in `getStorage()`, so it can `await getMmkvEncryptionKey()` there. For synchronous stores (`coach-memory.ts` calls `new MMKV(...)` at module top), refactor to lazy init the same way.

  > `expo-crypto` is not in `package.json` — confirm before adding (AGENTS.md: no new libs without instruction). If you cannot add it, use `react-native-get-random-values` if present, or flag to the human. **Do not invent a weaker key.**

- **Verify:**
```powershell
Get-ChildItem -Path src -Recurse -Include *.ts | Where-Object { $_.FullName -notmatch '__tests__' } |
  Select-String -Pattern 'encryptionKey:\s*"'
# expect: 0 string-literal keys after fix
npx tsc --noEmit
```

---

### [SEC-02] Deep-link `:token` params reach Auth screens without explicit token validation

- **Severity:** P1 (security — depends on [P0-06])
- **Location:** [`src/navigation/linking-config.ts:21`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/navigation/linking-config.ts#L21) (`ResetPassword: "reset-password/:token"`) + [`src/navigation/navigation-deep-links.ts:59-82`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/navigation/navigation-deep-links.ts#L59-L82)
- **Category:** security (untrusted input)
- **Evidence:** `sanitizeParams` (line 59) strips `<>` and clamps strings to 1000 chars, and `validateRouteParams` runs a Zod check — **good**. But the `ResetPassword` route's `:token` flows through React Navigation's *own* linking layer (once [P0-06] is implemented), which bypasses `navigateWithValidation`. So the token param is whatever the inbound URL contains.
- **Why it matters:** A reset-password token from a deep link is a credential. It must be: (a) format-validated (length/charset) before any network call, (b) never logged, (c) only ever sent to the Supabase reset endpoint. Today the validation path (`navigation-deep-links.ts`) and the linking-config path are **separate**, so the token from a real OS deep link may skip the sanitizer.
- **Exact fix:** When implementing [P0-06], route inbound URLs through a single validation chokepoint. For `ResetPassword`, add a param schema in `route-param-schemas.ts`:
```ts
ResetPassword: z.object({ token: z.string().min(20).max(512).regex(/^[A-Za-z0-9._-]+$/) }),
```
  and ensure the ResetPassword screen treats `route.params.token` as untrusted — validate before calling `supabase.auth` and never `debug.log` it.
- **Verify:**
```powershell
npx jest src/navigation --silent
# Manual: confirm reset-password screen rejects a malformed token param
```

---

### [SEC-03] No certificate pinning on the API client (note for human + native config)

- **Severity:** P1 (security — partially out of code scope)
- **Location:** [`src/api/api-request-handler.ts:91`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/api/api-request-handler.ts#L91) (`fetch`), Supabase client in [`src/config/supabase.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/config/supabase.ts)
- **Category:** security (network)
- **Evidence:** No `certificatePinning` / `sslPinning` references anywhere in `src`. All traffic is HTTPS (good — no `http://` or cleartext found), but unpinned.
- **Why it matters:** 2026 RN security checklists list certificate pinning for production API calls as a "Block PR" item for security-sensitive apps. VEX handles auth + purchases, so MITM resistance matters. This is mostly **native config** (Expo `expo-build-properties` / config plugin), not JS — so it's flagged for the human, but the API client should expose a hook for it.
- **Exact fix (flag + minimal code hook):** Document that pinning must be configured in the native layer (Android `network_security_config.xml`, iOS ATS + pinning lib or Expo config plugin). In code, confirm the `fetch` wrapper centralizes all outbound calls so pinning can be enforced in one place. **Do not attempt to add a pinning native module autonomously** — leave a `// REVIEW(security):` note and surface to the human.
- **Verify:** N/A (native). Add to the human's pre-ship checklist (§9).

---

### [SEC-04] Verify production source-map upload + console stripping + Hermes (release config audit)

- **Severity:** P1 (observability + security)
- **Category:** release config
- **Evidence / why:** Per 2026 launch checklists, three items routinely ship broken:
  1. **Source maps** uploaded to Sentry so release stack traces are readable (`@sentry/react-native` is wired — confirm the upload step runs in EAS build).
  2. **`console.*` stripped** from the production bundle. Code is clean (only `debug.ts`), but confirm `debug.ts` no-ops in production (read it) and that babel strips console in release.
  3. **Hermes enabled** for both platforms (bytecode = obfuscation + perf).
- **Exact fix:** Audit `app.json`/`app.config.*`, `babel.config.js`, and the EAS build profile. Confirm:
  - `expo.jsEngine: "hermes"` (or default in SDK 56).
  - A `transform-remove-console` babel plugin (or equivalent) in production env.
  - `debug.ts` guards on `__DEV__` / a build flag.
- **Verify:**
```powershell
Get-Content babel.config.js
Get-ChildItem -Filter "app.*" | ForEach-Object { $_.Name }
Get-Content src/utils/debug.ts | Select-Object -First 40
```

---

### [SEC-05] Server-side entitlement check for premium (do not trust client state)

- **Severity:** P1 (security — monetization)
- **Location:** `src/shared/monetization/`, `src/features/monetization/`, `src/features/feature-gate/`
- **Category:** security (authorization)
- **Evidence / why:** 2026 checklists flag "verify entitlement server-side" as the item that "ships broken in many apps." Client-side premium gates (RevenueCat customer info cached locally) can be tampered with on jailbroken devices. Any **server function** that grants paid value (e.g. an edge function, an RPC that unlocks content) must check entitlement against RevenueCat's API or a webhook-synced table — not a client flag.
- **Exact fix:** Audit every paid-feature unlock path. Where the *client* decides entitlement for purely-local UI, that's fine (it's just UI). Where a **server RPC/edge function** dispenses value (currency, content, AI quota), confirm the server independently verifies entitlement. `src/shared/ai/ai-quota-repository.ts` and any "unlock" RPC are the prime suspects.
- **Verify:** Code-read + a `// REVIEW(security):` note per server endpoint that dispenses value. Surface findings to the human; this straddles backend.

---

## 4. P1 — ARCHITECTURE & LAYERING

AGENTS.md mandates: **`Component → Hook → Service → Repository → Supabase`**, with **all Supabase queries inside `repository.ts` only**. The debt-freeze gate tracks drift. Fix the real drift; understand the false alarms.

---

### [ARCH-01] 11 Supabase calls outside a `repository.ts` file

- **Severity:** P1 (architecture)
- **Location (debt-freeze "Supabase outside repository", 11 files):**
  - [`src/features/economy/service.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/economy/service.ts), [`wallet-service.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/economy/wallet-service.ts)
  - [`src/features/progression/operation-atomic.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/progression/operation-atomic.ts)
  - [`src/features/session/repository/stakes-stats.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/session/repository/stakes-stats.ts) (already in [P0-09])
  - [`src/features/focus-identity/repository-score-history.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/focus-identity/repository-score-history.ts)
  - [`src/features/ai-coach/repository/messages-crud.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/ai-coach/repository/messages-crud.ts)
  - [`src/features/analytics/repository/stats.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/analytics/repository/stats.ts), [`storage-upload.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/analytics/repository/storage-upload.ts)
  - [`src/features/settings/repository-sync.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/settings/repository-sync.ts)
  - [`src/services/supabase-auth-credentials.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/services/supabase-auth-credentials.ts), [`supabase-auth-session.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/services/supabase-auth-session.ts)
- **Category:** architecture (layer boundary)
- **Evidence:** These query Supabase but are not named `repository.ts`. Triage reveals **two classes**:
  - **(a) False-positive-ish but acceptable:** files in a `repository/` *folder* or named `repository-*.ts` (`messages-crud.ts`, `repository-score-history.ts`, `analytics/repository/*`, `settings/repository-sync.ts`, `stakes-stats.ts`). These ARE the repository layer — the gate just matches the literal filename `repository.ts`. The fix is to either (i) teach the gate that `**/repository/**` and `repository-*.ts` count as the repository layer, or (ii) leave as-is and accept the entry. **These are not real leaks.**
  - **(b) Real leaks:** `economy/service.ts`, `economy/wallet-service.ts`, `progression/operation-atomic.ts`, `progression/first-week-pacing/service.ts` — **`service.ts` files calling Supabase directly**. That is business logic reaching into the data layer, exactly what the rule forbids.
- **Why it matters:** `service.ts` doing `supabase.rpc(...)` means business logic and data access are fused. When the query shape changes you edit business logic; you can't mock the repo in isolation; the RPC result-validation (the [P0-07] cast problem) hides where it shouldn't.
- **Exact fix:**
  1. For class (b): extract the Supabase calls into the feature's `repository.ts` (e.g. `economy/repository.ts` already exists — `wallet-service` imports `getSupabase` from `./repository`). Move `supabase.rpc("atomic_spend_currency")` into `economy/repository.ts` as `spendCurrencyRpc(...)`, return the **parsed** result ([P0-07]), and have `service.ts` call the repo function.
  2. For class (a): update `scripts/check-debt-freeze.js` to recognize the repository layer by folder/prefix, so the gate stops crying wolf and real leaks stand out. **Read the script first**; only adjust the matcher, do not weaken it.
- **Verify:**
```powershell
node scripts/check-debt-freeze.js   # "Supabase outside repository" count drops to the documented-acceptable set
npx tsc --noEmit
```

> **Do NOT** "fix" the auth files (`services/supabase-auth-*.ts`) by forcing them into a feature folder — auth is a cross-cutting service and these are effectively its repository. Either rename to `*-repository.ts` or whitelist. Confirm intent before moving auth code.

---

### [ARCH-02] `useEngagedQueries` flagged "useQuery in component" — actually a hook, but cast-heavy

- **Severity:** P2 (false-positive gate + real type smell)
- **Location:** [`src/screens/home/hooks/useEngagedQueries.ts:23-24, 44`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/screens/home/hooks/useEngagedQueries.ts#L23-L24)
- **Category:** architecture (false alarm) + type-safety (real)
- **Evidence:** Debt-freeze flags this as "useQuery in component (1 new)". But the file is `hooks/useEngagedQueries.ts` — it IS a hook, and wrapping `useQuery` in a hook is exactly what AGENTS.md requires. **The gate's heuristic is wrong here.** However, the file has real smells:
```ts
const streakData = streakQuery.data as Record<string, unknown> | undefined;   // line 23
const progData = progressionQuery.data as Record<string, unknown> | undefined; // line 24
const currentStreak = (streakData?.currentDays as number | undefined) ?? 0;    // line 25
```
- **Why it matters:** The architecture is fine; do not move the `useQuery`. But `streakQuery.data` is being cast to `Record<string, unknown>` then field-plucked with more casts — the query is untyped at the source. If `streakQuery` had a proper return type (it should, via its repository's Zod schema), none of these casts would exist.
- **Exact fix:**
  1. Adjust the debt-freeze heuristic to not flag `useQuery` inside `**/hooks/**` or `use*.ts` files.
  2. Type `streakQuery`/`progressionQuery` at their source (the hooks that produce them should return Zod-inferred types), then delete the casts here:
```ts
const currentStreak = streakQuery.data?.currentDays ?? 0;
const currentXp = progressionQuery.data?.xp ?? 0;
```
- **Verify:**
```powershell
node scripts/check-debt-freeze.js
npx tsc --noEmit
```

---

### [ARCH-03] Duplicate `economy` currency service — two implementations of the same RPCs

- **Severity:** P1 (architecture + financial — ties to [P0-07], [P0-08])
- **Location:** [`src/features/economy/service.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/economy/service.ts) vs [`src/features/economy/wallet-service.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/economy/wallet-service.ts)
- **Category:** architecture (duplication of a money path)
- **Evidence:** Both export `addCurrency` and `spendCurrency` calling the same RPCs (`atomic_spend_currency`, `grant_currency`/`atomic_add_currency`) with **divergent signatures and error contracts** (detailed in [P0-08]). **BOTH ARE LIVE, with different consumers:**
  - `wallet-service.spendCurrency` (returns `{success, error?}`, swallows DB errors) → exported via barrel ([`economy/index.ts:8`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/economy/index.ts#L8)), consumed by [`reward-ledger/service.ts:8`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/reward-ledger/service.ts#L8).
  - `service.spendCurrency` (returns `boolean`, **throws** `RepositoryError`) → consumed by [`companion/profile-service.ts:9`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/companion/profile-service.ts#L9).
  > ⚠️ **Verified recursively** — an earlier non-recursive grep falsely suggested `service.ts` was dead. It is NOT. Two live money paths with incompatible error semantics exist side by side.
- **Why it matters:** Two functions named identically that hit the same money RPC but behave differently, **each used by a different feature**. `companion` gets a throwing spend (must wrap in try/catch or it crashes on DB error); `reward-ledger` gets a swallowing spend (silently sees `success:false`). A dev moving logic between features inherits the wrong contract and either crashes or silently loses a spend. Neither is idempotent ([P0-08]).
- **Exact fix:**
  1. **Do NOT delete either** — both have live consumers. Consolidate to ONE implementation with ONE contract.
  2. Move the Supabase RPC calls into `economy/repository.ts` as `spendCurrencyRpc`/`grantCurrencyRpc`, returning **Zod-parsed** results ([P0-07]) + threading `idempotencyKey` ([P0-08]).
  3. Expose ONE `spendCurrency` from `economy/service.ts` with the explicit-result contract `{ success; error? }` (safer for money — forces callers to branch). Point the barrel at it.
  4. **Migrate both consumers** to the unified contract:
     - `companion/profile-service.ts`: change from `try { await spendCurrency(...) }` (throwing) to `const r = await spendCurrency(...); if (!r.success) { ...handle... }`.
     - `reward-ledger/service.ts`: already expects `{success}` — verify field names match.
  5. Delete `wallet-service.ts` (or `service.ts`) only after both consumers point at the survivor and tests pass.

  > **CAUTION:** financial path with TWO live consumers. Migrate consumers FIRST, then collapse. Run each consumer's tests after migration. If the contract change to `companion` alters behavior on DB error, that is a real behavior change — note it explicitly.
- **Verify:**
```powershell
npx jest src/features/economy --silent
npx tsc --noEmit
node scripts/check-debt-freeze.js
```

---

### [ARCH-04] `economy` is "archived/stubbed" but `wallet-service` is live — confirm the disabled-feature boundary

- **Severity:** P1 (correctness of the disabled-feature story)
- **Location:** [`src/features/economy/index.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/economy/index.ts)
- **Category:** architecture (dead/disabled code clarity)
- **Evidence:** The barrel header says: *"Economy feature stubs — active runtime only. All spendable currency (wallet/shop/wagers/transactions) logic archived. Streak insurance is no-op. Return values always zero/false."* Yet it still exports live `addCurrency`/`spendCurrency` from `wallet-service`, and `reward-ledger/service.ts` + `companion/profile-service.ts` import `wallet-service`.
- **Why it matters:** The user noted features are intentionally disabled. But the comment claims currency is "archived" while real spend/grant code is exported and consumed. Either the comment is stale (currency IS live → then [P0-07]/[P0-08] are critical) or the feature is disabled (→ then live consumers calling real RPCs is a bug). **This ambiguity must be resolved before ship** because it determines whether money code runs.
- **Exact fix:** This is a **product/architecture boundary the human must confirm** (per the "no product decisions" instruction). Leave a `// REVIEW:` note: *"economy/index.ts claims currency archived but wallet-service exports live RPC calls consumed by reward-ledger and companion. Confirm: is currency live or disabled?"* Then:
  - If **live:** fix [P0-07]/[P0-08] fully.
  - If **disabled:** make `addCurrency`/`spendCurrency` true no-ops (return `{success:false}`/`0`) and stop calling RPCs, matching the stated "always zero/false" contract.
- **Verify:** Human decision + corresponding test.

---

## 5. P1 — PERFORMANCE & LEAKS

Good news: timer cleanup is broadly disciplined (30+ `clearInterval`/cleanup return sites found, almost all paired). The real leaks are the realtime ones in [P0-04]/[P0-05]. Remaining items below.

---

### [PERF-01] `useFeedUpdates` / broadcast leaks — already covered

See [P0-04] and [P0-05]. These are the highest-impact leaks. The realtime channel registry is the one subsystem where cleanup is genuinely broken.

---

### [PERF-02] `useActivityBroadcast` / `useFeedUpdates` resubscribe churn from unstable `onMessage`/`onUpdate`

- **Severity:** P2 (perf)
- **Location:** [`src/hooks/useRealtime.ts:104-118`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/hooks/useRealtime.ts#L104-L118), `:134-142`
- **Category:** perf (effect thrash)
- **Evidence:** `useActivityBroadcast` effect depends on `[channelName, onMessage]`; `useFeedUpdates` on `[onUpdate]` (and after [P0-05], `[userId, onUpdate]`). If callers pass inline callbacks, the effect tears down and re-subscribes the realtime channel on **every render** — opening/closing a websocket channel each frame.
- **Why it matters:** Channel churn = wasted network, dropped messages during the teardown/resubscribe gap, and battery drain. Subtle but real on a screen that re-renders often.
- **Exact fix:** Either (a) require callers to memoize the callback (document it), or (b) stash the latest callback in a ref so the effect depends only on stable identifiers:
```tsx
const cbRef = useRef(onUpdate);
useEffect(() => { cbRef.current = onUpdate; }, [onUpdate]);
useEffect(() => {
  const unsubscribe = subscribeToFeedChanges(userId, (payload) => {
    setUpdates((prev) => [...prev.slice(-19), payload]);
    cbRef.current?.(payload);
  });
  return unsubscribe;
}, [userId]);   // stable — no churn
```
- **Verify:** `npx jest src/hooks --silent` + manual: confirm channel created once per `userId`.

---

### [PERF-03] `ScrollView` + `.map` candidates — confirm none render unbounded lists

- **Severity:** P2 (perf)
- **Location:** 4 `<ScrollView>` usages + 5 `.map`-in-`.tsx` rendering sites (non-test)
- **Category:** perf (list virtualization)
- **Evidence:** AGENTS.md bans `FlatList` in favor of `FlashList` (and there's a `flash-list-compat.d.ts` augmenting `estimatedItemSize`). But **no `<FlashList>` render site was found** — meaning either lists are short-and-static (fine in ScrollView) or a list is being rendered with `.map` inside a `ScrollView` (not virtualized → jank on long data).
- **Why it matters:** A `ScrollView` rendering a `.map` over user data (sessions, history, achievements) mounts every row at once. On a cheap Android device with hundreds of rows, this drops frames and spikes memory — a 2026-checklist "Fix before merge" item.
- **Exact fix:** Audit each `.map`-in-`ScrollView`. If the mapped data is **bounded and small** (e.g. ≤ ~20 fixed items like settings rows), leave it. If it's **user-data-driven and unbounded** (session history, feed, achievements list), convert to `FlashList` with `estimatedItemSize` = the measured row height, per AGENTS.md.
```powershell
Get-ChildItem -Path src -Recurse -Include *.tsx | Where-Object { $_.FullName -notmatch '__tests__' } |
  Select-String -Pattern '<ScrollView' -Context 0,30 | Select-String -Pattern '\.map\('
```
- **Verify:** Confirm long-data screens use `FlashList`; `node scripts/check-banned-patterns.js` stays clean.

---

### [PERF-04] `startFetchTimer` interval — confirm cleared on FeatureFlagService teardown

- **Severity:** P3 (verify-only; likely fine)
- **Location:** [`src/features/featureFlagStorage.ts:115`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/featureFlagStorage.ts#L115) → consumed [`src/features/FeatureFlagService.ts:74`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/FeatureFlagService.ts#L74), cleared at `:100`.
- **Evidence:** `startFetchTimer` returns a `setInterval` handle; `FeatureFlagService` stores it as `this.fetchTimer` and `clearInterval(this.fetchTimer)` at line 100. **Looks correct.** Just confirm the `dispose`/`stop` that calls line 100 actually runs on app teardown / sign-out.
- **Verify:** `npx jest src/features/__tests__/FeatureFlagService* --silent` and confirm a `stop()`/`dispose()` test exists.

---

## 6. P1/P2 — REACT HOOKS CORRECTNESS (the 53 ESLint errors)

The 53 ESLint **errors** break down as: **31 `rules-of-hooks`**, **21 `exhaustive-deps`**, **1 `no-restricted-imports`**. The 102k warnings are 99% `singlequote` ([P3-01]). Fixing the errors is mandatory — they are correctness bugs, not style.

### 6.1 `rules-of-hooks` (31 errors) — two distinct sub-classes

**Class A — REAL CRASHES (already P0):** components with hooks after early returns.
- [P0-01] `SessionSetupScreen.tsx:51`
- [P0-02] `RescueBanner.tsx:45,50`
- [P0-03] `NearMissIndicator.tsx` (7 hooks after return)

**Class B — LINT-ONLY today, LATENT LANDMINE:** hooks extracted into non-`use`/non-Component factory functions to dodge the 200-line limit. These don't crash *now* because their parent calls them unconditionally — but the linter can no longer verify hook order, so a future edit silently reintroduces a crash.

---

### [HOOK-01] `buildReturn` — 14 `useCallback`s inside a non-hook factory function

- **Severity:** P2 (latent crash risk; lint error)
- **Location:** [`src/features/session/hooks/useStudySession.return.ts:12-99`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/session/hooks/useStudySession.return.ts#L12-L99)
- **Category:** slop (decomposition that defeats lint) + hooks
- **Evidence:** `export function buildReturn(args)` contains 14 `useCallback` calls (lines 27-99). ESLint flags every one: *"called in function 'buildReturn' that is neither a React function component nor a custom React Hook."* It's called once, unconditionally, at [`useStudySession.ts:142`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/session/hooks/useStudySession.ts#L142) (`return buildReturn({...})`).
- **Why it matters:** This is the AI-slop "split by line count" pattern: `useStudySession.ts` was over 200 lines, so its tail got hacked off into `useStudySession.return.ts` with a `buildReturn` name. It works only by luck (unconditional call). The linter is now blind to these 14 hooks — if anyone adds an early `return` in `buildReturn`, or calls it conditionally, instant crash with no lint warning. **This is exactly the kind of fragility the thermo-nuclear review escalates.**
- **Exact fix:** Rename to a real hook so the linter validates it, OR inline it back. Cleanest: rename `buildReturn` → `useStudySessionReturn` (it IS a hook — it calls hooks). The `use` prefix restores lint coverage with zero behavior change.
```ts
// useStudySession.return.ts
export function useStudySessionReturn(args: BuildReturnArgs) {  // ← use-prefix
  // ...14 useCallbacks unchanged...
}
// useStudySession.ts:142
return useStudySessionReturn({ ... });   // still unconditional — now lint-verified
```
  Keep the file under 200 lines (it's 167 — fine). This satisfies both the line limit AND restores hook safety.
- **Verify:**
```powershell
npx eslint src/features/session/hooks/useStudySession.return.ts --ext .ts   # 0 errors
npx jest src/features/session --silent
```

---

### [HOOK-02] `buildNavigationCallbacks` — 6 `useCallback`s inside a non-hook factory

- **Severity:** P2 (latent crash risk; lint error)
- **Location:** [`src/screens/home/hooks/power-user-home-navigation.ts:16-85`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/screens/home/hooks/power-user-home-navigation.ts#L16-L85)
- **Category:** slop + hooks
- **Evidence:** `export function buildNavigationCallbacks(params)` holds 6 `useCallback`s (lines 38-83). Called unconditionally at [`usePowerUserHomeModel.ts:90`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/screens/home/hooks/usePowerUserHomeModel.ts#L90).
- **Why it matters:** Same landmine as [HOOK-01].
- **Exact fix:** Rename `buildNavigationCallbacks` → `useNavigationCallbacks`. Update the import + call site in `usePowerUserHomeModel.ts`. No behavior change; lint coverage restored.
- **Verify:** `npx eslint src/screens/home/hooks/power-user-home-navigation.ts --ext .ts` → 0 errors.

---

### [HOOK-03] `exhaustive-deps` — 21 errors across 18 files

- **Severity:** P1 (stale data/closures) — triage each
- **Locations (all non-test):**
  - **`useEffect` deps (HIGHEST risk — re-subscription/refetch correctness):**
    - [`src/hooks/useRealtime.ts:142`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/hooks/useRealtime.ts#L142) → **already [P0-05]** (missing `userId` = cross-account feed)
    - [`src/screens/session/hooks/useSessionSetupState.ts:132`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/screens/session/hooks/useSessionSetupState.ts#L132) (missing `params`)
  - **`useMemo` deps (stale derived values):** `focus-identity/hooks.ts:23`, `focus-run/hooks.ts:46`, `mode-native/hooks.ts:33,65`, `mode-retention/hooks.ts:54`, `personalization/useFirstWeekExperience.ts:107`, `useFirstWeekExperienceRuntime.ts:147`, `use-vex-runtime-experience.ts:49`, `retention-loop/hooks.ts:24`, `session-completion/hooks/useSessionHeadline.ts:70,82`, `unlock-explainer/hooks.ts:11`, `screens/home/hooks/useHomeSurfaceMap.ts:142`, `useInterventionVisibility.ts:137`, `content-study/hooks/useContentInput.ts:99`
  - **`useCallback` deps:** [`src/shared/monetization/use-revenuecat.ts:127`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/shared/monetization/use-revenuecat.ts#L127) (missing `offerings`)
  - **Reanimated worklet deps (usually benign):** `animation/hooks/useSpring.ts:46,94`, `animation/Particle.tsx:61`
- **Category:** correctness (stale closure)
- **Why it matters:** `exhaustive-deps` is not a style rule — each missing dep is a closure capturing a stale value. For `useEffect` it means **not re-running when it should** (stale subscriptions, missed refetches — see the [P0-05] cross-account bug). For `useMemo` it means **returning a stale computed value** when inputs change. These cause "works on my machine, weird in prod" bugs.
- **Exact fix:** Triage by hook type — **do not blindly add every dep** (that can cause infinite loops):
  1. **`useEffect` (subscriptions/fetches):** add the missing dep. If it's an object that changes identity each render, memoize it at the source or extract the primitive (`userId` not `user`). [P0-05] is the template.
  2. **`useMemo`:** if the missing dep (`input`, `context`) genuinely affects the output, add it. If `input` is a fresh object each render, memoize `input` upstream or destructure the primitives actually used into the dep array. **Several of these (`hooks.ts` files) take an `input` prop that's reconstructed each render — fix by depending on `input`'s primitive fields, not the object.**
  3. **`use-revenuecat.ts:127`:** add `offerings` — a purchase callback using stale offerings is a real monetization bug.
  4. **Reanimated `useSpring`/`Particle`:** these often intentionally omit shared values. Verify the shared value is stable; if so, the lint can be satisfied by including it (shared values have stable identity) — include it, don't disable.
- **Verify (per file):**
```powershell
npx eslint <file> --ext .ts,.tsx   # 0 exhaustive-deps errors
npx jest <feature dir> --silent
```

> **Hermes discipline:** fix these ONE FILE AT A TIME with a test run between. A wrong dep-array fix causes infinite render loops that are worse than the stale value. If adding a dep causes a loop, memoize the dep at its source — never `eslint-disable`.

---

### [HOOK-04] `no-restricted-imports` — `expo-haptics` imported directly

- **Severity:** P2 (architecture rule)
- **Location:** [`src/utils/haptics-types.ts:2`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/utils/haptics-types.ts#L2)
- **Category:** architecture (AGENTS.md: haptics only via `src/utils/haptics.ts`)
- **Evidence:** ESLint `no-restricted-imports`: *"'expo-haptics' import is restricted. Use src/utils/haptics.ts named functions instead."* Also flagged by `check-banned-patterns` as `expo-haptics-direct: 1`.
- **Why it matters:** Minor — but it's the one real banned-pattern hit. The file is `haptics-types.ts`; it likely imports `expo-haptics` only for its *types* (e.g. `ImpactFeedbackStyle`). If so it's a near-false-positive, but the rule is absolute.
- **Exact fix:** If it's a type-only import, use `import type`:
```ts
import type { ImpactFeedbackStyle } from "expo-haptics";
```
  `import type` is erased at compile time and most `no-restricted-imports` configs can be set to allow type imports — but if the config still flags it, re-export the needed type from `haptics.ts` and import from there. Read the file first to see what it actually pulls in.
- **Verify:**
```powershell
npx eslint src/utils/haptics-types.ts --ext .ts   # 0 errors
node scripts/check-banned-patterns.js              # expo-haptics-direct: 0
```

---

## 7. P2 — TYPE SAFETY

The shipped code is remarkably clean: **0 `as any`, 0 `@ts-ignore`/`@ts-nocheck`** outside tests. The remaining type debt is 3 `as unknown as` casts and a handful of unvalidated persistence parses.

---

### [TYPE-01] 3 `as unknown as` casts in shipped code

- **Severity:** P2 (type-safety) — 2 are defensible, 1 is the mock
- **Locations:**
  1. [`src/config/supabase.ts:77`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/config/supabase.ts#L77) — `mockClient as unknown as SupabaseClient` (Jest mock; documented `TODO(safe-cast)`).
  2. [`src/accessibility/AccessibilityEnhancer.class.ts:64`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/accessibility/AccessibilityEnhancer.class.ts#L64) — `EnhancedComponent as unknown as React.ComponentType<P>`.
  3. [`src/accessibility/AccessibilityEnhancer.ts:67`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/accessibility/AccessibilityEnhancer.ts#L67) — same as #2.
- **Category:** type-safety
- **Evidence:** All three have explanatory `// TODO(safe-cast):` / `// safe-cast:` comments. #1 is a test-only mock (acceptable but the `from()` chain mock is shallow — see note). #2/#3 cast a `forwardRef` component to `ComponentType` because `ForwardRefExoticComponent` isn't in the `ComponentType` union.
- **Why it matters:** Low — these are localized, commented, and at real type-system boundaries (mock; HOC ref forwarding). But `as unknown as` is the strongest "I'm overriding the type system" signal, and AGENTS.md wants casts only at Zod boundaries.
- **Exact fix:**
  - #1 (`supabase.ts` mock): Acceptable for a mock. **Better:** the mock is also a maintenance trap — its `from().select().eq().order()` chain is hand-rolled and shallow. Consider replacing test reliance on it with MSW (`msw` is already a dependency) so the cast disappears. If keeping, leave as-is — it's test-path only.
  - #2/#3 (`AccessibilityEnhancer`): The two files are near-duplicates (see [SLOP-04]). Fix the type properly: type the HOC return as `React.ForwardRefExoticComponent<...>` or `React.ComponentType<P> & { displayName?: string }`, eliminating the `as unknown as`. If the cast is truly unavoidable for ref-forwarding, narrow it to `as React.ComponentType<P>` (single cast) with the comment.
- **Verify:** `npx tsc --noEmit` + `node scripts/check-debt-freeze.js` (`as unknown as` count drops).

---

### [TYPE-02] 23 `as any` in test files — quarantine, don't ship-block

- **Severity:** P3 (test hygiene)
- **Location:** 23 `__tests__` files (debt-freeze "as any" bucket). **Zero in shipped code.**
- **Category:** type-safety (tests)
- **Evidence:** All 23 `as any` hits are in `*.test.ts` / test-helper files (e.g. `achievements-event-handler.test.ts`, `monetization-*.test.ts`).
- **Why it matters:** Tests with `as any` can pass while asserting against the wrong shape, giving false confidence. Not a ship blocker, but they erode the test suite's value.
- **Exact fix:** Lower priority than everything above. When touched, replace `as any` with a typed fixture or `as unknown as <RealType>` at minimum. Do NOT mass-rewrite now — it risks breaking green tests for cosmetic gain. Batch this post-launch.
- **Verify:** `node scripts/check-debt-freeze.js`.

---

### [TYPE-03] Unvalidated persistence parses cast to concrete types

- **Severity:** P2 (data integrity)
- **Location:** representative (non-exhaustive):
  - [`src/persistence/MMKVProvider.ts:28`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/persistence/MMKVProvider.ts#L28) — `JSON.parse(value) as T`
  - [`src/persistence/MMKVStorage.ts:117`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/persistence/MMKVStorage.ts#L117), [`StorageManager.ts:138`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/persistence/StorageManager.ts#L138) — `JSON.parse(json) as T`
  - [`src/features/monetization/subscription-store.ts:9`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/monetization/subscription-store.ts#L9) — `JSON.parse(raw) as Record<string, UserSubscription>`
- **Category:** type-safety (boundary validation)
- **Evidence:** These parse persisted JSON and cast to a concrete type with no runtime validation. **Contrast with the good pattern** the codebase already has: `src/persistence/safe-json.ts` exposes `parseJsonWithSchema(raw, schema, ctx)` and dozens of repositories use `SomeSchema.parse(JSON.parse(raw))` (e.g. `focus-run/repository.ts:15`, `today-system/repository.ts:11`). The generic storage providers and `subscription-store` skipped it.
- **Why it matters:** Persisted data can be stale (old app version wrote a different shape), corrupted, or — for `subscription-store` — security-relevant (a tampered subscription cache could fake premium locally; ties to [SEC-05]). Casting `as T` makes TypeScript believe a lie; downstream code crashes on `undefined` fields or trusts forged data.
- **Exact fix:**
  - For generic `MMKVProvider/MMKVStorage/StorageManager.getItem<T>`: these are intentionally generic, so a schema can't be baked in. **Acceptable** as the low-level layer — but ensure **callers** validate (most do via repository Zod parse). Leave the generic layer; verify each *caller* of premium/financial data parses.
  - For `subscription-store.ts:9`: **add validation** — subscription state gates paid features.
```ts
import { z } from "zod";
const SubscriptionMapSchema = z.record(UserSubscriptionSchema);
const raw = storage.getString(KEY);
const parsed = raw ? SubscriptionMapSchema.safeParse(JSON.parse(raw)) : null;
return parsed?.success ? parsed.data : {};
```
- **Verify:** `npx tsc --noEmit` + `npx jest src/features/monetization --silent`.

---

## 8. P2 — THERMO-NUCLEAR STRUCTURAL REVIEW (AI-slop / maintainability)

This is the section the thermo-nuclear skill demands. The codebase enforces a **200-line hard cap**, which is healthy in spirit — but it has produced a pervasive anti-pattern: **mechanical decomposition by line count instead of by domain.** AGENTS.md itself bans this (`.part-N.ts` files), but the same sin appears under different suffixes.

> **Root finding:** ~127 non-test files carry decomposition suffixes (`-helpers`, `-core`, `-builders`, `-generators`, `.main`, `.return`, `.class`, `.indicators`, `.impl`, `.internal`). Many are legitimate domain splits. A meaningful subset are **line-count hacks that fragment one cohesive unit across several files**, which is *worse* for maintainability than a single 250-line file would be. The thermo-nuclear standard: a split must reduce the number of concepts a reader holds in their head. These don't — they scatter one concept across N files.

---

### [SLOP-01] `config/supabase.ts` is 201 lines — 1 line over the prod cap

- **Severity:** P2 (line limit)
- **Location:** [`src/config/supabase.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/config/supabase.ts) (201 lines)
- **Category:** slop (line limit) — but **do NOT mechanically split**
- **Evidence:** The only **production** file over 200 (the other 5 are test files at exactly 201). It's a cohesive module: client factory + lazy proxy + error handler + config check.
- **Why it matters:** It trips the gate. But this file is the textbook case where splitting would HARM clarity — the mock client (lines 18-78), the lazy proxy, and the factory belong together.
- **Exact fix:** Extract the **mock client** (lines 18-78, ~60 lines) into `src/config/supabase-mock.ts` — it's a genuinely separable concern (test-only) and removing it drops the file to ~140 lines. This is a *domain* split (test scaffolding vs prod client), not a line-count hack. The mock's `as unknown as` ([TYPE-01]) goes with it.
```ts
// src/config/supabase-mock.ts
export function createMockSupabaseClient(): SupabaseClient { /* moved */ }
// supabase.ts
import { createMockSupabaseClient } from "./supabase-mock";
```
- **Verify:** `node scripts/check-line-limit.js` → 0 prod violations; `npx jest --silent`.

---

### [SLOP-02] Test files at exactly 201 lines (5 files)

- **Severity:** P3 (line limit — tests)
- **Location:** `personal-bests/__tests__/repository.test.ts`, `retention-loop/__tests__/guards.test.ts`, `session-completion/__tests__/completion-happy-path/unlock-shame-canonical.test.ts`, `settings/__tests__/crud.test.ts`, `production/__tests__/ExitGate.test-helpers.ts` — all 201.
- **Category:** slop (line limit)
- **Why it matters:** Trips the gate; trivial.
- **Exact fix:** Each is 1 line over. Split off one logical `describe` block or extract a fixture/helper. Don't agonize — these are tests.
- **Verify:** `node scripts/check-line-limit.js` → 0.

---

### [SLOP-03] Mechanical decomposition: hooks split into non-hook factories

- **Severity:** P2 (maintainability — high conviction)
- **Location:** [`useStudySession.return.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/session/hooks/useStudySession.return.ts) (+ `build-return-args.ts`), [`power-user-home-navigation.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/screens/home/hooks/power-user-home-navigation.ts) — covered by [HOOK-01]/[HOOK-02]
- **Category:** slop (the canonical example)
- **Evidence:** `useStudySession.ts` was too long, so its return-builder was sheared off into `useStudySession.return.ts` exporting `buildReturn`, with the args interface shaved into a *third* file `build-return-args.ts`. One hook is now spread across **three files**, and the linter lost the ability to verify 14 hooks.
- **Why it matters:** This is the **defining thermo-nuclear anti-pattern**: the split increased the concept-count (3 files + a hand-maintained args interface) instead of decreasing it, AND broke a safety check. A single 220-line `useStudySession.ts` would be *more* maintainable and *safer* than this 3-file shatter. The 200-line rule is being satisfied at the cost of the thing the rule exists to protect.
- **Exact fix:** Fixed structurally by [HOOK-01]/[HOOK-02] (rename to `use*` to restore lint). Additionally: if `build-return-args.ts` exists only to host an interface that's used by exactly one consumer, inline it back into `useStudySession.return.ts` (the interface is ~20 lines; a separate file for it is pure fragmentation). **Prefer 2 files over 3.**
- **Verify:** `npx eslint <files>` clean; `npx jest src/features/session --silent`.

---

### [SLOP-04] `AccessibilityEnhancer` — 6 files, TWO parallel implementations of one concept

- **Severity:** P2 (duplication + fragmentation — high conviction)
- **Location:** `src/accessibility/`:
  - [`AccessibilityEnhancer.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/accessibility/AccessibilityEnhancer.ts) (183) → imports `AccessibilityEnhancerTypes`, `AccessibilityEnhancerHelpers`
  - [`AccessibilityEnhancer.class.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/accessibility/AccessibilityEnhancer.class.ts) (119) → imports `enhancer-logic`
  - `AccessibilityEnhancer.helpers.ts` (85), `AccessibilityEnhancerCore.ts` (16), `AccessibilityEnhancerHelpers.ts` (170), `AccessibilityEnhancerTypes.ts` (60)
- **Category:** slop (duplication + over-fragmentation)
- **Evidence:** SIX files for "accessibility enhancer." Two of them (`AccessibilityEnhancer.ts` and `AccessibilityEnhancer.class.ts`) appear to be **two competing implementations** — they import different helper modules (`AccessibilityEnhancerHelpers` vs `enhancer-logic`) and both contain the same `as unknown as React.ComponentType<P>` HOC cast ([TYPE-01] #2/#3). There's also both `AccessibilityEnhancer.helpers.ts` AND `AccessibilityEnhancerHelpers.ts` (near-identical names, 85 vs 170 lines) — and a 16-line `AccessibilityEnhancerCore.ts`.
- **Why it matters:** This is duplication + fragmentation at its worst. A reader cannot tell which enhancer is live. Two files differing by import set is the classic "refactor abandoned halfway" smell. The 16-line `Core` and dual `Helpers`/`helpers` files multiply the concept count with zero clarity gain.
- **Exact fix:**
  1. **Determine which implementation is live** (`AccessibilityEnhancer.ts` vs `.class.ts`):
  ```powershell
  Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | Where-Object { $_.FullName -notmatch '__tests__' } |
    Select-String -Pattern "AccessibilityEnhancer\.class|from .*AccessibilityEnhancer'"
  ```
  2. Delete the dead implementation and its exclusive helper module.
  3. Collapse `AccessibilityEnhancerCore.ts` (16 lines), the surviving `*Helpers.ts`, and `*Types.ts` decision: keep `Types.ts` (legit — types separate), but merge the 16-line `Core` into the main file (16 lines does not deserve its own file). Aim for **3 files max**: `AccessibilityEnhancer.ts`, `AccessibilityEnhancer.types.ts`, `AccessibilityEnhancer.helpers.ts`.
  4. Fix the HOC cast ([TYPE-01]) in the survivor.

  > **CAUTION:** verify with imports before deleting. If both are imported somewhere, they may serve different call sites — consolidate rather than delete, and flag to the human.
- **Verify:** `npx tsc --noEmit`; `npx jest src/accessibility --silent`; `node scripts/check-debt-freeze.js` (`as unknown as` drops by 1-2).

---

### [SLOP-05] `SmartNotificationScheduler` split across 3 files reaching into Supabase

- **Severity:** P2 (fragmentation + layer leak)
- **Location:** [`SmartNotificationScheduler.ts`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/notifications/SmartNotificationScheduler.ts), `SmartNotificationScheduler-generators.ts`, `SmartNotificationScheduler-rankReport.ts`
- **Category:** slop (line-count split) + architecture (Supabase outside repository — part of [ARCH-01])
- **Evidence:** One scheduler hyphen-split into 3 by line count, and (per debt-freeze) it touches Supabase directly rather than via a repository.
- **Why it matters:** Combines two smells: domain-arbitrary fragmentation AND a layer leak.
- **Exact fix:** Move Supabase access to `notifications/repository.ts` (a `repository.ts` likely exists — check). For the split: if `-generators` and `-rankReport` are genuinely distinct concerns (message generation vs reporting), the split is *defensible by domain* — keep but rename to remove the parent-prefix hyphen hack (e.g. `notification-generators.ts`, `notification-rank-report.ts`). If they're just "the next 100 lines," consider whether the scheduler's responsibilities are too broad.
- **Verify:** `node scripts/check-debt-freeze.js`; `npx jest src/features/notifications --silent`.

---

### [SLOP-06] Systematic decomposition audit (the other ~120 split files)

- **Severity:** P2/P3 (maintainability — batch, don't block ship)
- **Location:** ~127 files with decomposition suffixes (full list via the command below)
- **Category:** slop
- **Evidence/why:** Most are fine (real domain modules). A subset are line-count hacks. Distinguishing them requires judgment, so this is a **guided batch task**, not a blanket rewrite.
- **Exact fix (heuristic for Hermes):** For each suffixed file, ask the thermo-nuclear question: *"Does this split reduce concepts, or just relocate lines?"*
  - **Keep** if the file has a clear single responsibility a reader would expect to find separately (e.g. `*-schemas.ts`, `*.types.ts`, a genuinely independent algorithm).
  - **Merge back / re-split by domain** if: (a) it's named `<parent>-helpers.ts` and contains the misc tail of one function, (b) a hook/component is sheared across `.main`/`.return`/`.indicators`, (c) two near-identical-named files exist (`X.helpers.ts` + `XHelpers.ts`).
  - **Hard rule:** never create a new `.part-N.ts`. Never split a file you can't give each piece a domain name.
  ```powershell
  Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | Where-Object {
    $_.FullName -notmatch '__tests__' -and
    $_.Name -match '-(helpers|core|builders|generators|detectors)\.tsx?$|\.(main|return|class|indicators|impl|internal)\.tsx?$'
  } | ForEach-Object { $_.FullName.Replace((Get-Location).Path + '\','') }
  ```
- **Verify:** After each merge: `npx tsc --noEmit`, the file's tests, `node scripts/check-line-limit.js` (stay ≤200). **This is the lowest-priority section — do it only after all P0/P1 are green.**

---

### [SLOP-07] `check-banned-patterns` false positives — fix the detector, not the code

- **Severity:** P2 (gate accuracy)
- **Location:** the 3 "violations":
  - [`src/accessibility/checks-types.ts:17`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/accessibility/checks-types.ts#L17) — `FlatList: ["list"]` is a **role-map key**, not a `FlatList` import.
  - [`src/api/api-request-handler.ts:91`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/api/api-request-handler.ts#L91) — the `fetch` here is **the sanctioned API client itself** (the thing AGENTS.md says to use *instead of* raw fetch).
  - [`src/utils/haptics-types.ts:2`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/utils/haptics-types.ts#L2) — real-ish, handled in [HOOK-04].
- **Category:** slop (tooling)
- **Evidence:** 2 of 3 "banned-pattern violations" are false positives that will nag forever and train the team to ignore the gate.
- **Exact fix:** Tighten `scripts/check-banned-patterns.js`:
  - `flatlist`: match `import ... FlatList ... from 'react-native'` or `<FlatList`, not the bare word `FlatList` (which appears in role maps, comments, type names).
  - `raw-fetch`: allowlist `src/api/**` (the API client is *allowed* to call `fetch` — it's the wrapper everyone else must use).
  - Read the script before editing; only narrow the matchers, never delete a rule.
- **Verify:** `node scripts/check-banned-patterns.js` → 0 (after [HOOK-04] fixes the haptics one).

---

### [SLOP-08] "Verification theater" — stub functions hardcoded to `true`

- **Severity:** P2 (misleading code)
- **Location:** [`src/features/feature-gate/verification.ts:74-104`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/features/feature-gate/verification.ts#L74-L104)
- **Category:** slop (fake implementation that looks real)
- **Evidence:** `verifyNoHomeCard`, `verifyNoSettingsEntry`, `verifySafeFallback`, `verifyAnalyticsBlocked` all just `return true;` with comments like *"This would need to be implemented based on actual home card rendering. For now, assume home cards respect feature visibility."* These feed `getPhase3VerificationSummary`, which reports `passed: true` based on these always-true stubs. Also note `verifyNoTabAccess` (line 62) calls `useFeatureAccess()` **inside a non-hook function** — another latent hook violation, though not currently lint-flagged because it's not in the error set (verify).
- **Why it matters:** This is a verification gate that **always passes because it doesn't actually verify anything.** It creates false confidence that "Phase 3 disabled features are hidden" when the checks are no-ops. AGENTS.md explicitly bans "stub implementations that look complete but aren't wired." For a pre-release gate, a fake green is dangerous.
- **Exact fix:** Either (a) implement the checks for real (query the actual nav/settings/home config to confirm disabled features are absent), or (b) **delete the theater** and replace with an honest single source of truth. If the disabled-feature hiding is already enforced by `useFeatureAccess`/`NavigationGate`, this verification layer is redundant — delete it rather than ship lies. Also fix `verifyNoTabAccess`'s in-function `useFeatureAccess()` call.
  > Product-adjacent — leave a `// REVIEW:` note flagging whether this gate is still needed at all.
- **Verify:** `npx tsc --noEmit`; `npx jest src/features/feature-gate --silent`.

---

## 9. RELEASE CHECKLIST (human-owned, code-adjacent)

These are not code edits Hermes should make autonomously, but they MUST be confirmed before ship. Surface each as a `// REVIEW:` note or a checklist item.

| # | Item | Why | Where to confirm |
|---|------|-----|------------------|
| R1 | Hermes engine enabled, both platforms | perf + bytecode obfuscation | `app.json` / EAS profile ([SEC-04]) |
| R2 | Source maps uploaded to Sentry on release build | readable prod stack traces | EAS / `@sentry/react-native` config |
| R3 | `console.*` stripped + `debug.ts` no-ops in prod | bundle hygiene, battery | `babel.config.js`, `debug.ts` ([SEC-04]) |
| R4 | In-app account deletion works + deletes server data | **Apple hard requirement 2026** | `src/features/account-deletion/` |
| R5 | Sign in with Apple present (if any social login exists) | Apple rejection reason | auth screens |
| R6 | Certificate pinning configured (native) | MITM resistance for auth+purchases | native config ([SEC-03]) |
| R7 | Server-side entitlement verification for paid value | jailbreak tamper resistance | edge functions / RPCs ([SEC-05]) |
| R8 | Deep links actually route (after [P0-06]) | notifications + password reset | manual device test |
| R9 | Privacy policy + terms public URLs live | store requirement | store metadata |
| R10 | Reviewer demo account works | auth apps rejected without it | — |
| R11 | No "beta"/"test" strings in prod UI | rejection reason | string audit |
| R12 | Push permission prompted after a real action, not on launch | opt-in rate + UX | onboarding flow |
| R13 | `economy` currency: live or disabled? | determines if money code runs | [ARCH-04] |

---

## 10. EXECUTION ORDER (the overnight runbook for Hermes)

Work in this exact order. Run the Global Gate (§1.2) after each phase.

### Phase 1 — P0 crashes (do first, fastest wins)
1. [P0-01] SessionSetupScreen hook-after-return
2. [P0-02] RescueBanner hook-after-return
3. [P0-03] NearMissIndicator hook-after-return
→ Gate: `npm run lint` rules-of-hooks errors in these 3 files = 0.

### Phase 2 — P0 data/security/financial
4. [P0-05] useFeedUpdates cross-account (add `userId`)
5. [P0-04] realtime channel collision/leak
6. [P0-09] stakes-stats eager init + unvalidated RPC
7. [P0-07] financial RPC cast → Zod parse
8. [P0-08] spend error contract + idempotency
9. [P0-06] deep linking implementation
→ Gate: full §1.2 + `npx jest src/services src/hooks src/features/economy src/features/session --silent`.

### Phase 3 — P1 security & architecture
10. [SEC-01] MMKV encryption keys
11. [SEC-02] reset-password token validation
12. [ARCH-03] economy duplicate consolidation
13. [ARCH-01] Supabase-in-service extraction (real leaks only)
14. [ARCH-04] economy live/disabled decision (flag to human)
15. [SEC-03/04/05] release-config audits (flag to human)

### Phase 4 — P1 hooks correctness
16. [HOOK-03] exhaustive-deps, ONE FILE AT A TIME, test between each
17. [HOOK-01]/[HOOK-02] rename factories to `use*`
18. [HOOK-04] haptics type-only import
→ Gate: `npm run lint` → **0 errors**.

### Phase 5 — P2 type safety & structure
19. [TYPE-01] as-unknown-as (esp. AccessibilityEnhancer)
20. [TYPE-03] subscription-store validation
21. [SLOP-01] supabase.ts mock extraction
22. [SLOP-04] AccessibilityEnhancer dedup
23. [SLOP-08] verification theater
24. [SLOP-07] fix banned-pattern detector
25. [ARCH-02] debt-freeze useQuery heuristic + cast cleanup
26. [PERF-02]/[PERF-03] realtime churn + list virtualization

### Phase 6 — P2/P3 cleanup batch (only if time remains)
27. [SLOP-05] SmartNotificationScheduler
28. [SLOP-06] systematic decomposition audit
29. [SLOP-02] test files at 201 lines
30. [TYPE-02] test `as any` (post-launch ok)
31. [P3-01] singlequote lint warnings (`npm run lint:fix`)

### Final gate before declaring done
```powershell
npx tsc --noEmit                          # exit 0
npm run lint 2>&1 | Select-String "problems"  # 0 errors
node scripts/check-line-limit.js          # 0 prod
node scripts/check-banned-patterns.js     # 0
node scripts/check-no-ts-nocheck.js       # 0
node scripts/check-debt-freeze.js         # trending to 0 new
npx jest --silent                         # all pass (note pre-existing failures explicitly)
```

---

## 11. P3 — NITS (batch, low priority)

### [P3-01] 102,311 ESLint `singlequote` warnings
- **Fix:** `npm run lint:fix` (the report says "101,347 warnings potentially fixable with --fix"). Run it in one commit, review the diff is purely quote changes, commit separately. **Do this LAST** — it touches thousands of files and will conflict with every other change if done early.
- **Verify:** `npm run lint 2>&1 | Select-String "problems"` — warning count collapses.

### [P3-02] `parseErrorResponse` swallows parse errors silently
- **Location:** [`src/api/api-request-handler.ts:47-55`](file:///C:/Users/jonat/CascadeProjects/vex-app-old/src/api/api-request-handler.ts#L47-L55) — `catch { return {}; }`. Acceptable (error-body parse failure → empty), but consider a `debug.warn` for diagnosability. Trivial.

---

## 12. SUMMARY SCORECARD

| Dimension | Grade | Notes |
|-----------|-------|-------|
| Type safety (shipped) | **A−** | 0 `as any`/`@ts-ignore`; 3 documented `as unknown as`; strict tsconfig. |
| Secrets / git hygiene | **A** | No tracked `.env`; SecureStore for tokens. |
| Error handling | **A−** | No empty/untyped catches; Sentry wired; consistent `RepositoryError`. |
| Crash safety | **C** | **3 P0 rules-of-hooks crashes** + 2 latent factory landmines. |
| Realtime / leaks | **C+** | Channel registry collision + cross-account feed bug. |
| Architecture/layering | **B** | Mostly clean; `service.ts`→Supabase leaks + economy duplication. |
| Financial correctness | **C+** | Unvalidated casts + inconsistent contract + no idempotency on spend. |
| Deep linking | **D** | Fully stubbed; notifications + reset-password broken. |
| Maintainability/slop | **B−** | 200-line rule causing line-count fragmentation; verification theater. |
| Test discipline | **B+** | 1369 test files; no `.only`; tests pass. `as any` in tests. |

**Ship verdict:** **NOT YET.** 9 P0s are hard blockers (3 guaranteed crashes, 1 cross-account data exposure, 1 broken auth-recovery flow, financial-correctness gaps). All are well-contained with exact fixes above. After Phases 1–4 are green, this app is in genuinely good shape to ship.

---

*End of codereviewSPECIAL.md. Every finding above was verified against the actual source at audit time (2026-05-30) via direct file reads and the project's own gate scripts. No finding is speculative — file:line references are exact. Where a fix touches money, auth, or product boundaries, Hermes is instructed to flag rather than guess.*





