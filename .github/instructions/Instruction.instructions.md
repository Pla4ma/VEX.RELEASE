You are an expert engineer working on VEX — a production Expo React Native app. Every rule below is non-negotiable. Violating any of them is a failure condition.

---

## STACK — EXACT VERSIONS, NO SUBSTITUTIONS
- Expo SDK 54 (managed workflow)
- TypeScript 5.x — strict: true, noImplicitAny, strictNullChecks, noUncheckedIndexedAccess
- TanStack Query v5 — server state only
- Zustand — persistent client state only
- Zod — schemas are the source of truth, all types inferred via z.infer<>
- React Navigation v6 — fully typed, all routes in RootStackParamList
- Reanimated 3 — the ONLY animation library. Never use Animated from react-native.
- Supabase — Postgres + Auth + Realtime + Storage
- MMKV — non-sensitive fast storage only
- expo-secure-store — auth tokens and secrets only, via the existing SecureStorage wrapper
- Sentry — all unexpected errors captured here
- RevenueCat — all purchases go through shared/monetization/ layer only
- Design system tokens — src/theme/tokens/ — never hardcode any value

DO NOT introduce any new library without explicit instruction.

---

## ARCHITECTURE — MANDATORY STRUCTURE

Every feature lives in features/<name>/ with exactly this layout:
- types.ts — domain types only, no logic
- schemas.ts — Zod schemas only, types inferred from here, never written separately
- repository.ts — ALL Supabase queries here and ONLY here
- service.ts — ALL business logic here and ONLY here
- hooks.ts — TanStack Query + Zustand wiring for UI consumption only
- store.ts — Zustand slice only (only if persistent state is needed)
- events.ts — EventBus event definitions and handlers
- analytics.ts — Sentry breadcrumbs and PostHog event tracking only
- components/ — UI rendering only, zero business logic, zero Supabase access
- __tests__/ — unit and integration tests

Data flow is always and only: Component → Hook → Service → Repository → Supabase

NEVER:
- Put a Supabase query in a hook or component — it belongs in repository.ts
- Put a business rule or calculation in a component — it belongs in service.ts
- Put a useQuery call directly in a component — wrap it in a hook in hooks.ts
- Call RevenueCat SDK directly — use the shared/monetization/ layer

---

## FILE SIZE — HARD LIMIT: 200 LINES

If any file exceeds 200 lines, stop writing and split it. No exceptions.
Extract what does not belong, put it in its own file, import it.
A 350-line file that is "almost done" is not acceptable — split it first.

---

## TYPESCRIPT — ZERO TOLERANCE

- No `any`. If a type is hard, fix the architecture instead.
- No `@ts-nocheck` or `@ts-ignore` ever. If you find one, remove it and fix what it was hiding.
- No `as X` casts except at validated Zod parse boundaries (add a comment explaining why).
- All async functions have explicit return types.
- Zod schemas own all types — never write a type that mirrors a schema manually:

// WRONG
type Input = { userId: string; duration: number }

// CORRECT
const InputSchema = z.object({ userId: z.string().uuid(), duration: z.number().min(60) })
type Input = z.infer<typeof InputSchema>

- All Supabase table types come from the auto-generated src/types/supabase.ts — never hand-written.
- Run `npm run types:supabase` after any schema change. Never edit supabase.ts manually.

---

## BANNED — NEVER USE THESE

- `any` type
- `console.log` — use logger or Sentry breadcrumbs
- `@ts-nocheck` or `@ts-ignore`
- `// TODO` in shipped code — implement it or delete it
- `Animated` from react-native — use Reanimated 3 only
- `StyleSheet.create` — use inline styles with theme tokens
- `FlatList` — use FlashList with estimatedItemSize set to the actual item height
- `AsyncStorage` — use MMKV for non-sensitive, SecureStorage for sensitive
- `raw fetch()` — use the existing API client
- Business logic in JSX or component files
- Supabase queries outside repository.ts
- Hardcoded colors, spacing, font sizes, or border radii — always use src/theme/tokens/
- Stub implementations that look complete but aren't wired
- Features that only handle the success/happy path

---

## STATE — THREE LAYERS, NEVER MIXED

| State type        | Tool          | Where used                              |
|-------------------|---------------|-----------------------------------------|
| Server state      | TanStack Query| hooks.ts → service.ts → repository.ts  |
| Global client     | Zustand       | store.ts — auth, prefs, offline queue   |
| Local UI          | useState      | Components — open/closed, drafts only   |

Every query in hooks.ts must return and expose: data, isPending, isError, error, refetch.
Every mutation must: invalidate related queries on success, call Sentry on error, show a user-facing error toast.

---

## UI — ALL STATES REQUIRED, NO EXCEPTIONS

A component that only renders its happy path is not a finished component.

Every data-driven component ships with all of these:
- Loading: skeleton UI matching the exact layout of the loaded content. Never a spinner alone.
- Error: error message in VEX voice + retry button. Use src/components/states/ErrorState.tsx.
- Empty: illustrated empty state with one CTA. Use VEX-voiced copy, not generic "No items found."
- Success: what the user actually sees when data loads.
- Offline: degraded banner when useNetInfo() returns offline. Never silently fail.
- Optimistic: immediate UI update before server confirms on all writes users care about.

Additional UI rules:
- All interactive elements: accessibilityLabel, accessibilityRole, accessibilityHint — always.
- Minimum touch target: 44×44 points. Use src/utils/touchTarget.ts.
- All animations: Reanimated 3 only. useSharedValue, useAnimatedStyle, withSpring, withTiming.
- All lists: FlashList with estimatedItemSize set to the actual measured item height.
- Check useReducedMotion() before playing any animation — skip or simplify if true.
- All form screens: KeyboardAvoidingView + ScrollView.
- Dark mode: all colors via design tokens only — no hardcoded hex values anywhere.

---

## ERROR HANDLING — EVERY ASYNC PATH

Every async operation must have:
- try/catch with a typed error — never `catch (e: any)`
- User-facing error state in the UI
- Retry available for network operations
- Sentry.captureException() for unexpected/unrecoverable errors
- Degraded fallback state when full recovery isn't possible

// WRONG
const { data } = await supabase.from('sessions').select('*')
return data

// CORRECT
const { data, error } = await supabase.from('sessions').select('*').eq('user_id', userId)
if (error) throw new RepositoryError('fetchSessions', error)
return SessionSummarySchema.array().parse(data)

---

## SUPABASE REALTIME

Every Supabase channel().subscribe() call must have a corresponding unsubscribe() in the useEffect cleanup:
useEffect(() => {
  const channel = supabase.channel('x').subscribe()
  return () => { void channel.unsubscribe() }
}, [])

Never leave subscriptions open — they cause memory leaks.

---

## HAPTICS

All haptics go through src/utils/haptics.ts named functions only.
Never import expo-haptics directly in a component or hook.
Every significant user action (session start, completion, level up, achievement) must trigger the correct named haptic.

---

## NAVIGATION

Every new screen must:
1. Register its params in RootStackParamList in navigation/types.ts FIRST, before the screen file is created
2. Be added to the correct navigator stack
3. Have at least one entry point (another screen or tab that navigates to it)
4. Handle deep links if it's a notification target

Never use navigation.navigate('X') with a string literal — always use the typed route.

---

## OUTPUT QUALITY — NON-NEGOTIABLE

Do NOT:
- Write partial implementations and call them done
- Stub a service function and leave it returning undefined
- Skip error handling because "it's just an MVP"
- Mark a task complete when only the success state is handled
- Write a component that calls console.log instead of the real service
- Hardcode empty arrays, zeros, or placeholder strings where real data should be

DO:
- Wire every feature completely across all layers: component → hook → service → repository → Supabase
- Handle every state before moving on
- Write at least one test file for every new service
- Verify navigation works before marking a screen complete
- Run `npx tsc --noEmit` and fix all errors before declaring any phase done