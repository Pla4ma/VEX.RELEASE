# VEX App — AI Coding Context (skill.md)

> Paste this into your `skill.md` so any AI assistant instantly understands the VEX codebase, enforces its patterns, and never introduces tech that doesn't belong.

---

## What This App Is

**VEX** is a premium mobile focus app built with Expo SDK 54 and React Native 0.76.7.

The canonical user journey is:
1. Home → 2. Start Session → 3. Active Session → 4. Session Complete → 5. Return Reason

Every surface either strengthens one of those five steps or is visually secondary. The `src/session` domain owns the core loop. All engagement systems (streaks, progression, economy, social) are downstream of the session.

---

## Exact Stack — No Substitutions

| Layer | Library | Version |
|---|---|---|
| Runtime | Expo SDK (managed workflow) | 54 |
| Language | TypeScript | 5.x strict |
| Server state | TanStack Query | v5 |
| Client state | Zustand + Immer | 4.x |
| Validation | Zod | 3.x |
| Navigation | React Navigation | v6/v7 |
| Animations | Reanimated 3 | ~3.16.0 |
| Lists | FlashList | 2.0.2 |
| Fast storage | MMKV | ^2.11.0 |
| Secure storage | expo-secure-store | ~15.0.0 |
| Backend | Supabase | ^2.103.3 |
| Error tracking | Sentry | ~7.2.0 |
| Analytics | PostHog | ^4.42.1 |
| Monetization | RevenueCat (react-native-purchases) | ^10.0.1 |
| Background jobs | Trigger.dev | 4.4.4 |
| Push notifications | expo-notifications | ~0.32.12 |
| Bottom sheets | @gorhom/bottom-sheet | ^4.6.0 |
| SVG | react-native-svg | ~15.8.0 |
| Gradients | expo-linear-gradient | ~15.0.0 |
| Networking | NetInfo | 11.4.1 |
| Testing | Jest + @testing-library/react-native + MSW | 29.x |

**DO NOT introduce new libraries without explicit instruction.**

### Banned substitutions
| Banned | Use instead |
|---|---|
| `FlatList` | `FlashList` with `estimatedItemSize` |
| `StyleSheet.create` with magic numbers | design tokens from `src/theme/tokens/` |
| Raw `fetch()` | TanStack Query + repository layer |
| `AsyncStorage` | MMKV (non-sensitive) or `expo-secure-store` (sensitive) |
| Hardcoded hex, font-size, spacing | tokens only |
| `any` type | fix the architecture |
| `console.log` | `Sentry.addBreadcrumb` or `analytics.ts` |
| `Animated` API | Reanimated 3 only |

---

## File Size Rule

**Hard limit: 200 lines per file. No exceptions.**

When a file reaches 200 lines, stop, extract what doesn't belong, and import it.

---

## Folder Architecture

```
src/
├── features/         ← domain features (35+)
├── session/          ← canonical focus loop (separate from features/)
├── components/       ← shared UI primitives
├── shared/
│   ├── ai/           ← AI types, edge client contracts
│   ├── analytics/    ← analytics service + events
│   ├── jobs/         ← Trigger.dev job types/constants
│   ├── monetization/ ← RevenueCat service + types
│   ├── retrieval/    ← retrieval types/constants
│   ├── ui/           ← shared UI components + primitives
│   └── utils/        ← pure functions only
├── events/           ← EventBus, EventService, event types
├── economy/          ← EconomyService
├── streaks/          ← StreakService
├── social/           ← SocialService
├── progression/      ← ProgressionService
├── rewards/          ← RewardsService
├── coach/            ← CoachService
├── sync/             ← OfflineSyncService
├── store/            ← Zustand root store
├── api/              ← QueryProvider, API client
├── theme/            ← tokens, ThemeContext, ThemeService
├── config/           ← Supabase client, Sentry config
├── navigation/       ← types, guards, deep links
├── types/            ← global shared types, Supabase generated types
├── constants/        ← app, api, routes, features, storage
├── analytics/        ← AnalyticsService
├── hooks/            ← shared app-wide hooks
├── utils/            ← date, debug, haptics, uuid, string
├── screens/          ← screen components
├── services/         ← global services
├── onboarding/       ← onboarding flows
├── settings/         ← settings screens
├── persistence/      ← storage utilities
├── network/          ← network utilities
├── lib/              ← library wrappers
├── icons/            ← icon assets
├── accessibility/    ← accessibility hooks/utilities
├── animation/        ← animation utilities
├── errors/           ← error handling
└── validation/       ← validation utilities

supabase/
├── functions/        ← Edge functions: ai, ai-coach, content-study, season-finalize, trigger-jobs
└── migrations/       ← SQL migrations

jobs/                 ← Trigger.dev background jobs
├── challenges/       ← daily-refresh
├── coach/            ← cleanup, reminder-delivery
├── maintenance/      ← health-check
├── notifications/    ← batch-send
├── seasons/          ← finalize-season
└── squad-wars/       ← weekly-reset
```

### Required feature layout

Every feature under `src/features/<name>/` must follow this exact structure:

```
features/<name>/
├── types.ts          ← domain types ONLY — no logic, no schemas
├── schemas.ts        ← Zod schemas ONLY — all types inferred from here
├── service.ts        ← business logic and orchestration ONLY
├── repository.ts     ← all Supabase queries and storage access ONLY
├── hooks.ts          ← useX hooks for UI consumption ONLY
├── store.ts          ← Zustand slice ONLY (if persistent client state needed)
├── events.ts         ← event definitions ONLY
├── analytics.ts      ← Sentry breadcrumbs + event tracking ONLY
├── components/       ← feature-specific components
└── __tests__/        ← unit + integration tests
```

### What goes where — no ambiguity

| Logic type | File |
|---|---|
| Supabase query | `repository.ts` |
| Business rule / calculation | `service.ts` |
| UI async wiring | `hooks.ts` |
| Persistent app state | `store.ts` |
| Domain shape | `types.ts` |
| Input/output contract | `schemas.ts` |
| Error reporting | `analytics.ts` |
| UI rendering | `components/` |

If you're about to write a Supabase query in a hook → stop → put it in `repository.ts`.
If you're about to put business logic in a component → stop → put it in `service.ts` and expose via a hook.

---

## Existing Features (35+)

These all exist. Do not recreate them. Import from them.

`ai-coach` · `analytics` · `battle-pass` · `boss` · `boss-realtime` · `challenges` · `companion` · `content-study` · `crafting` · `duels` · `economy` · `feed` · `focus-identity` · `home-spine` · `integration` · `inventory` · `items` · `liveops-config` · `mastery` · `milestones` · `neuroplasticity` · `notifications` · `progression` · `progression-simple` · `rankings` · `rewards` · `seasons` · `session-completion` · `session-start` · `settings` · `shop` · `social` · `squad-wars` · `squads` · `streaks` · `themes` · `FeatureFlagService`

### Integration map — nothing ships as an island

```
sessions         → progression, rewards, streaks, analytics, feed, offline-queue
economy          → inventory, shop, rewards, analytics
auth             → user-profile, analytics identity, onboarding, deep-links
progression      → rewards, milestones, battle-pass, boss-unlocks
ai-coach         → sessions, streaks, push-reminders
social           → feed, squads, progression-signals, challenges
settings         → notifications, coach-behavior, theme, accessibility-prefs
offline-queue    → sessions, economy-writes, progression-writes
neuroplasticity  → sessions, progression, analytics
focus-identity   → sessions, progression, streaks, analytics
```

New systems declare their dependencies and consumers at the top of `service.ts` as a comment block before any code.

---

## TypeScript — Zero Tolerance

```
strict: true
noImplicitAny: true
strictNullChecks: true
noUncheckedIndexedAccess: true
```

- No `any`. Ever.
- No `as X` casts unless at a validated parse boundary with an explanatory comment.
- No `@ts-ignore` or `@ts-expect-error` without a written explanation.
- All async functions have explicit return types.
- All Supabase DB types come from `src/types/supabase.ts` (auto-generated via `npm run types:supabase`). Never hand-write them.
- Zod schemas own their types. Never write a type that mirrors a schema manually:

```ts
// WRONG
type CreateSessionInput = { userId: string; mode: 'solo' | 'squad' }

// CORRECT
const CreateSessionInputSchema = z.object({
  userId: z.string().uuid(),
  mode: z.enum(['solo', 'squad']),
})
type CreateSessionInput = z.infer<typeof CreateSessionInputSchema>
```

- Always separate summary types from full entity types:

```ts
type SessionSummary = { id: string; startedAt: string; durationSeconds: number }
type SessionDetail  = { id: string; startedAt: string; durationSeconds: number; events: SessionEvent[]; rewards: Reward[] }
```

---

## Naming Conventions

| Case | Used for |
|---|---|
| `PascalCase` | Components, Types, Interfaces, Enums, Classes |
| `camelCase` | functions, variables, hook names (`useX`), instances |
| `SCREAMING_SNAKE` | constants, config keys, action type strings |
| `kebab-case` | ALL file and folder names — no exceptions |

```
session-card.tsx      ✅    SessionCard.tsx       ❌
use-session-timer.ts  ✅    useSessionTimer.ts    ❌
session-service.ts    ✅    sessionService.ts     ❌
calculateStreakMultiplier()  ✅    streakHelper()  ❌
fetchUserSessionHistory()   ✅    getData()       ❌
```

---

## Validation — Zod at Every Boundary

Validate with Zod wherever data enters the system:
- Supabase/API responses
- User form inputs before submission
- Data read from MMKV (shape may be stale)
- Params into critical service functions
- Deep link params

Use `.parse()` by default. Use `.safeParse()` only when you explicitly need the error shape — and always handle it.

Required surfaces: auth inputs, all form submissions, session creation, purchase/reward claims, user-generated content.

---

## State — Three Layers, Never Mixed

| Layer | Tool | Used for |
|---|---|---|
| Server state | TanStack Query | Remote data, caching, background refetch |
| Client state | Zustand | Ephemeral local state, UI preferences |
| Persistent local | MMKV / expo-secure-store | Stored client state between sessions |

Always handle all async states — no partial implementations:

```tsx
const { data, isPending, isError, error, refetch, isRefetching } = useSessionHistory(userId)

if (isPending)    return <SessionHistorySkeleton />
if (isError)      return <ErrorState message={error.message} onRetry={refetch} />
if (!data?.length) return <EmptyState ... />
return <SessionList data={data} />
```

- Invalidate related queries after every mutation.
- Use optimistic updates on all user-visible writes.

---

## Supabase Rules

- Run `npm run types:supabase` after every schema migration. Never edit `src/types/supabase.ts` manually.
- All queries live in `repository.ts` — never inline in hooks or components.
- All queries rely on RLS — service role key never in client code.
- Always handle Supabase error shape explicitly:

```ts
// WRONG
const { data } = await supabase.from('sessions').select('*')
return data

// CORRECT
const { data, error } = await supabase
  .from('sessions')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

if (error) throw new RepositoryError('fetchUserSessions', error)
return SessionSummarySchema.array().parse(data)
```

- Use Supabase Realtime subscriptions through a dedicated hook in `hooks.ts`.
- Edge functions live in `supabase/functions/`. Existing: `ai`, `ai-coach`, `content-study`, `season-finalize`, `trigger-jobs`.

---

## Error Handling — Every Async Path

Every async operation must have:
- `try/catch` with a typed error — never `catch (e: any)`
- User-facing error state in UI
- Retry available for network operations
- `Sentry.captureException` for unexpected/unrecoverable errors
- Fallback or degraded state when recovery isn't possible

```ts
const mutation = useMutation({
  mutationFn: sessionService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['sessions', userId] })
  },
  onError: (error) => {
    Sentry.captureException(error, { tags: { feature: 'session-creation' } })
    showErrorToast('Could not create session. Tap to retry.')
  },
  retry: 2,
})
```

Do not ship any feature that only handles the success path.

---

## Offline + Sync

The app must degrade gracefully offline, not silently fail.

```ts
type OfflineQueueEntry = {
  id: string           // uuid — for deduplication
  type: string         // e.g. 'session:create'
  payload: unknown     // validated before enqueue
  timestamp: number    // unix ms
  retryCount: number
  status: 'pending' | 'syncing' | 'failed'
}
```

- Write operations go to offline queue first, sync after reconnect.
- On reconnect: process in order, deduplicate by `id`, check conflicts before applying.
- `useNetInfo()` hook is already wired — use it to drive degraded UI.
- Always show a degraded banner when offline.

---

## UI — All States Required

**A component that only renders its happy path is not finished.**

| State | Implementation |
|---|---|
| Loading | Skeleton UI — never a spinner alone |
| Empty | Illustrated empty state with a CTA |
| Error | Error message + retry button |
| Success | Confirmation toast or inline feedback |
| Disabled | Visually distinct — not reduced opacity alone |
| Optimistic | Immediate UI update before server confirms |
| Offline | Banner or inline degraded notice |

Additional rules:
- All values from `src/theme/tokens/` — no hardcoded colors, spacing, or font sizes
- All interactive elements need `accessibilityLabel` and `accessibilityRole`
- Minimum touch target: 44×44pt
- All forms use `KeyboardAvoidingView` + `ScrollView`
- All animations use Reanimated 3 — no `Animated` API
- All lists use `FlashList` with a tuned `estimatedItemSize`
- Dark mode supported via design token variants
- New components must use existing primitives from `src/components/primitives/` before creating new ones

---

## Navigation

All routes declared in `src/constants/routes.ts` and typed in `src/types/navigation.ts`:

```ts
export type RootStackParamList = {
  Home: undefined
  SessionDetail: { sessionId: string }
  RewardClaim: { rewardId: string; source: 'session' | 'milestone' }
}
```

- Every new screen registers params in `RootStackParamList` before the screen file is created.
- No `navigation.navigate('X')` calls without full type safety.
- Auth guards live in `navigation/guards.ts` — never inside screens.
- Deep link handlers live in `navigation/deeplinks.ts`.

---

## Security

- No secrets in source — all via `expo-constants` + EAS Secrets.
- Auth tokens in `expo-secure-store` via the existing `SecureStorage` wrapper — not MMKV.
- No PII in Sentry events, breadcrumbs, or any log output.
- Supabase client queries always rely on RLS.
- Sanitize user-generated content before rendering or persisting.

---

## Sentry

- `Sentry.captureException(error, { tags: { feature: '...' } })` for unexpected errors.
- `Sentry.addBreadcrumb({ message: '...', category: '...' })` at key flow steps.
- No PII in any Sentry payload.
- Sentry calls only in `analytics.ts`, service layer, or mutation `onError` — never in components.

---

## Testing

Stack: **Jest + @testing-library/react-native + MSW**

Required — no exceptions:
- Service layer: unit tests for every logic branch
- Zod schemas: valid input, invalid input, edge values
- Calculators / state machines: exhaustive unit tests
- Repositories: integration tests with MSW mocking Supabase
- Critical flows (auth, session creation, reward claiming, purchases): integration tests

Test structure:
```ts
describe('SessionService', () => {
  describe('createSession', () => {
    it('creates a session with valid input')
    it('throws ValidationError on invalid config')
    it('enqueues to offline queue when network is unavailable')
    it('handles Supabase error and reports to Sentry')
    it('deduplicates concurrent creation requests')
    it('rolls back optimistic state on failure')
  })
})
```

---

## Background Jobs (Trigger.dev)

Trigger.dev jobs live in `jobs/` and are typed in `shared/jobs/`. Existing jobs:
- `challenges/daily-refresh` — daily challenge rotation
- `coach/cleanup` — AI coach data cleanup
- `coach/reminder-delivery` — AI coach reminder delivery
- `maintenance/health-check` — system health monitoring
- `notifications/batch-send` — batch notification delivery
- `notifications/re-engagement-check` — user re-engagement triggers
- `seasons/finalize-season` — season end processing
- `squad-wars/weekly-reset` — squad wars weekly reset

New jobs must declare their types in `shared/jobs/job-types.ts` and register in `jobs/index.ts`.

---

## Monetization (RevenueCat)

RevenueCat service lives in `src/shared/monetization/revenuecat-service.ts`.  
Hook: `src/shared/monetization/use-revenuecat.ts`.  
Feature flags and entitlement checks flow through `src/features/liveops-config/` — never hardcoded.

---

## AI Coach Architecture

The AI Coach is a production-grade system with:
- **State machine** — 9 states: `COLD_START`, `LOW_CONFIDENCE`, `HIGH_CONFIDENCE`, `STREAK_AT_RISK`, `COMEBACK_MODE`, etc.
- **Intervention engine** — rule-based evaluation, circuit breaker, per-user rate limiting, cooldowns
- **Message generator** — template library, variable substitution, content sanitization, priority calculation
- **Offline hooks** — `hooks-offline.ts` — queues mutations when offline
- **Realtime hooks** — `hooks-realtime.ts` — Supabase subscriptions
- **Edge function** — `supabase/functions/ai-coach/index.ts` for server-side inference

AI type contracts live in `src/shared/ai/`. The edge client is `src/shared/ai/edge-client.ts`.

---

## Provider Hierarchy

```
GestureHandlerRootView (native only)
└── SafeAreaProvider
    └── QueryProvider (TanStack Query)
        └── ThemeProvider
            └── ErrorBoundary
                └── RootNavigator
```

---

## Design System

All design tokens live in `src/theme/tokens/`:
- `colors.ts` · `spacing.ts` · `typography.ts` · `radius.ts` · `shadows.ts` · `sizing.ts` · `opacity.ts` · `timing.ts` · `zIndex.ts`

Premium surface components live in `src/components/premium/PremiumSurface.tsx`.

New design tokens must be added to the token file before use — never inline.

---

## What Never Ships

- `// TODO` as a substitute for real implementation
- `console.log` anywhere
- `any` type anywhere
- `FlatList`
- `StyleSheet.create` with magic numbers
- Raw `fetch()`
- `AsyncStorage` for any purpose
- Hardcoded color, spacing, or font values in components
- Untyped `navigation.navigate()` calls
- Screens missing any required UI state
- Features that only handle the success path
- Business logic inside JSX or component render functions
- Dead code after refactors
- Files over 200 lines that haven't been split
- Supabase queries outside of repository files
- Service role key in any client-side code
