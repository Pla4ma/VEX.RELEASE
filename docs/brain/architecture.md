# Architecture Reference Document

## Project Structure

```
src/
├── features/           # Domain features (see below)
├── integration/        # Cross-system integration wiring
├── components/         # Shared UI primitives
├── events/            # Event bus and type definitions
├── api/               # TanStack Query configuration
├── theme/             # Design tokens and theming
└── config/            # App configuration
```

## Feature Folder Structure

The `session` feature exemplifies the required structure. Every feature must follow this exact layout:

```
src/features/session/
├── types.ts              # Domain types ONLY - no logic, no schemas
├── schemas.ts            # Zod schemas ONLY - types inferred from here
├── service.ts            # Business logic and orchestration ONLY
├── repository.ts         # All Supabase queries and storage access ONLY
├── hooks.ts              # useX hooks for UI consumption ONLY
├── store.ts              # Zustand slice ONLY (if persistent state needed)
├── events.ts             # Event definitions and handlers ONLY
├── analytics.ts          # Sentry breadcrumbs + custom event tracking ONLY
├── components/           # Feature-specific components
│   ├── session-card.tsx
│   ├── session-timer.tsx
│   ├── pause-overlay.tsx
│   └── index.ts
└── __tests__/
    ├── service.test.ts
    ├── repository.test.ts
    └── hooks.test.ts
```

### File Descriptions and Bans

**types.ts**
- ✅ Pure TypeScript interfaces describing domain entities
- ✅ Session, SessionConfig, SessionPhase, SessionStatus
- ❌ NO Zod schemas (those go in schemas.ts)
- ❌ NO business logic functions
- ❌ NO default values or constructors

**schemas.ts**
- ✅ Zod schemas for runtime validation
- ✅ SessionConfigSchema, SessionPresetSchema
- ✅ All schemas use `.strict()` to catch extra fields
- ❌ NO hand-written types that mirror schemas
- ❌ NO business logic
- ❌ NO UI components

**service.ts**
- ✅ Business rules: calculateScore, determinePhase, validateTransition
- ✅ Orchestration: startSession, pauseSession, completeSession
- ✅ State machine transitions
- ✅ Calls repository for data, calls store for state updates
- ❌ NO Supabase queries (repository only)
- ❌ NO JSX or React hooks
- ❌ NO direct UI manipulation

**repository.ts**
- ✅ Supabase queries: fetchSession, saveSession, deleteSession
- ✅ Storage operations via MMKV or AsyncStorage
- ✅ All queries return validated data via Zod schemas
- ❌ NO business logic (just CRUD + validation)
- ❌ NO state management
- ❌ NO hooks

**hooks.ts**
- ✅ useSession(userId) - returns session state + actions
- ✅ useSessionHistory(userId) - returns query + mutation hooks
- ✅ All hooks use TanStack Query for server state
- ✅ All hooks use Zustand for client state
- ❌ NO Supabase queries directly (call repository via service)
- ❌ NO business logic (call service methods)
- ❌ NO inline async functions in JSX

**store.ts**
- ✅ Zustand slice: SessionSlice with state + actions
- ✅ Only client-side state: currentSession, isPaused, uiPreferences
- ✅ Persists to storage via Zustand persist middleware
- ❌ NO server state (sessions belong in TanStack Query)
- ❌ NO Supabase client
- ❌ NO business logic beyond simple state updates

**events.ts**
- ✅ Event type definitions: SessionStarted, SessionCompleted, SessionAbandoned
- ✅ Event payload interfaces
- ❌ NO event handlers (those go in service.ts or analytics.ts)
- ❌ NO event emission logic (use eventBus from shared/)

**analytics.ts**
- ✅ Sentry breadcrumb calls for key flows
- ✅ Custom event tracking: trackSessionStarted, trackSessionCompleted

## AI Coach Architecture (NEW)

The AI Coach feature implements production-grade patterns:

```
src/features/ai-coach/
├── service/                    # Enhanced service layer
│   ├── coach-state-machine.ts  # Finite state machine (9 states)
│   ├── intervention-engine.ts  # Rule engine with circuit breaker
│   ├── message-generator.ts     # Template management + validation
│   ├── behavior-analytics.ts    # Signal processing + pattern detection
│   └── index.ts
├── components/primitives/       # Premium UI primitives
│   ├── skeleton.tsx            # Shimmer loading states
│   ├── empty-state.tsx         # 8 empty state scenarios
│   ├── error-state.tsx         # 6 error types with retry
│   ├── progress-state.tsx      # Progress bars, steps, loading
│   └── button.tsx              # Premium buttons with all states
├── hooks-enhanced.ts          # Retry logic, optimistic updates
├── hooks-realtime.ts          # Supabase subscriptions
├── hooks-offline.ts           # Offline mutation queue
├── integration-enhanced.ts    # Cross-system wiring
├── repository-enhanced.ts     # Circuit breakers, caching
├── utils/retry.ts             # Circuit breaker, rate limiter
├── utils/timezone.ts          # Timezone-aware streaks
└── services/notification-service.ts  # Push delivery
```

### Service Layer Patterns

**State Machine (coach-state-machine.ts)**
- 9 states: COLD_START, LOW_CONFIDENCE, HIGH_CONFIDENCE, STREAK_AT_RISK, COMEBACK_MODE, etc.
- Entry/exit actions for each state
- Auto-transitions based on duration
- Transition validation

**Intervention Engine (intervention-engine.ts)**
- Rule-based evaluation with conditions
- Circuit breaker for fault tolerance
- Rate limiting per-user
- Cooldown management

**Message Generator (message-generator.ts)**
- Template library with variable substitution
- Content sanitization
- Priority calculation
- Mute checks

### UI Primitive Patterns

**All States Covered:**
- Skeleton: 6 variants with shimmer animation
- Empty: 8 pre-built scenarios (no messages, no history, offline, etc.)
- Error: 6 types with retry logic, degraded mode
- Progress: Linear, segmented, circular, steps, success
- Button: Loading, disabled, 5 variants with press animations

**Animation:**
- react-native-reanimated for smooth transitions
- FadeIn, FadeInUp, SlideInDown, ZoomIn
- Shake animation for errors
- Spring animations for success states
- ❌ NO business logic
- ❌ NO data modification

**components/** (one component per file)
- ✅ session-card.tsx - displays session info
- ✅ session-timer.tsx - animated timer display
- ✅ pause-overlay.tsx - pause/resume UI
- ✅ index.ts - barrel export
- ❌ NO business logic in components (use hooks)
- ❌ NO inline styles (use design tokens)
- ❌ NO direct Supabase calls

---

## What Goes Where (Strict Rules)

| Logic Type | Correct File | Banned Locations |
|------------|--------------|------------------|
| Supabase query (SELECT/INSERT/UPDATE/DELETE) | `repository.ts` | Hooks, components, service.ts, store.ts |
| Business rule (scoring, validation, state transitions) | `service.ts` | Hooks, components, repository.ts |
| Calculation (XP, damage, streak multiplier) | `service.ts` | Hooks, components, JSX |
| UI async wiring (loading, error, success states) | `hooks.ts` | Components directly, service.ts |
| Persistent app state (auth, preferences, offline queue) | `store.ts` | Local state, TanStack Query cache |
| Domain shape (what a Session IS) | `types.ts` | Inline in functions, duplicated in schemas |
| Input/output contract (validation) | `schemas.ts` | Inline objects, `any` types |
| Error reporting (Sentry) | `analytics.ts` | Inline in components, console.log |
| UI rendering | `components/*.tsx` | Hooks, service.ts, store.ts |

---

## Separation Rules

### Rule 1: No Supabase Queries in Hooks or Components

**WRONG:**
```typescript
// hooks.ts - BANNED
export function useSession(userId: string) {
  const { data } = useQuery({
    queryKey: ['session', userId],
    queryFn: async () => {
      // ❌ Inline Supabase query
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .single();
      return data;
    }
  });
}
```

**CORRECT:**
```typescript
// repository.ts
export async function fetchActiveSession(userId: string): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .single();
  
  if (error) throw new RepositoryError('fetchActiveSession', error);
  return SessionSchema.parse(data);
}

// service.ts
export async function getActiveSession(userId: string): Promise<Session> {
  return repository.fetchActiveSession(userId);
}

// hooks.ts
export function useSession(userId: string) {
  return useQuery({
    queryKey: ['session', userId],
    queryFn: () => sessionService.getActiveSession(userId),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

### Rule 2: No Business Logic in JSX

**WRONG:**
```typescript
// session-card.tsx - BANNED
export function SessionCard({ session }: { session: Session }) {
  // ❌ Business logic in JSX
  const canPause = session.status === 'ACTIVE' && 
                   session.elapsedSeconds > 60 &&
                   !session.strictMode;
  
  // ❌ Direct mutation
  const handlePause = async () => {
    await supabase
      .from('sessions')
      .update({ status: 'PAUSED' })
      .eq('id', session.id);
  };
  
  return (
    <Button onPress={handlePause} disabled={!canPause}>
      Pause
    </Button>
  );
}
```

**CORRECT:**
```typescript
// service.ts
export function canPauseSession(session: Session): boolean {
  return session.status === 'ACTIVE' && 
         session.elapsedSeconds > 60 &&
         !session.config.strictMode;
}

export async function pauseSession(sessionId: string): Promise<void> {
  if (!canPauseSession(session)) {
    throw new ValidationError('Cannot pause this session');
  }
  return repository.updateSessionStatus(sessionId, 'PAUSED');
}

// hooks.ts
export function usePauseSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sessionService.pauseSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'session-pause' } });
    },
  });
}

// session-card.tsx
export function SessionCard({ session }: { session: Session }) {
  const pauseMutation = usePauseSession();
  const canPause = sessionService.canPauseSession(session); // Call service
  
  return (
    <Button 
      onPress={() => pauseMutation.mutate(session.id)}
      disabled={!canPause || pauseMutation.isPending}
      isLoading={pauseMutation.isPending}
    >
      Pause
    </Button>
  );
}
```

### Rule 3: No Types Duplicating Zod Schemas

**WRONG:**
```typescript
// types.ts - BANNED
export interface CreateSessionInput {
  userId: string;
  duration: number;
  mode: 'solo' | 'squad';
  difficulty: 'easy' | 'medium' | 'hard';
}

// schemas.ts - DUPLICATE
export const CreateSessionInputSchema = z.object({
  userId: z.string().uuid(),
  duration: z.number().min(60).max(7200),
  mode: z.enum(['solo', 'squad']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});
```

**CORRECT:**
```typescript
// schemas.ts - SOURCE OF TRUTH
export const CreateSessionInputSchema = z.object({
  userId: z.string().uuid(),
  duration: z.number().min(60).max(7200),
  mode: z.enum(['solo', 'squad']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

// types.ts - INFERRED
export type CreateSessionInput = z.infer<typeof CreateSessionInputSchema>;
```

### Rule 4: No Cross-Feature Imports Except Through shared/

**WRONG:**
```typescript
// features/session/service.ts - BANNED
import { calculateReward } from '../rewards/service'; // ❌ Direct import
import { updateStreak } from '../streaks/store'; // ❌ Direct import
```

**CORRECT:**
```typescript
// features/session/service.ts
import { eventBus } from '@/shared/events';

// Publish event for rewards system to handle
await eventBus.publish('session:completed', {
  sessionId: session.id,
  userId: session.userId,
  finalScore: session.finalScore,
  duration: session.effectiveDuration,
});

// Rewards system subscribes in its own service.ts
eventBus.subscribe('session:completed', async (payload) => {
  await rewardService.evaluateSessionRewards(payload);
});
```

### Rule 5: 200-Line File Size Hard Limit

**WRONG:**
```
session/
└── service.ts (450 lines) - BANNED
```

**CORRECT:**
```
session/
├── service/
│   ├── index.ts (exports only, 20 lines)
│   ├── session-lifecycle.ts (180 lines - start, pause, resume, complete)
│   ├── session-scoring.ts (150 lines - scoring algorithms)
│   └── session-validation.ts (120 lines - state transition rules)
```

### Rule 6: One Component Per File, One Hook Per File

**WRONG:**
```typescript
// session-components.tsx - BANNED
export function SessionCard() { /* 80 lines */ }
export function SessionTimer() { /* 60 lines */ }
export function SessionControls() { /* 70 lines */ }
export function useSession() { /* 90 lines */ }
export function useSessionStats() { /* 50 lines */ }
```

**CORRECT:**
```
session/components/
├── session-card.tsx (SessionCard only, 80 lines)
├── session-timer.tsx (SessionTimer only, 60 lines)
├── session-controls.tsx (SessionControls only, 70 lines)
└── index.ts (barrel export)

session/hooks/
├── use-session.ts (useSession only, 90 lines)
├── use-session-stats.ts (useSessionStats only, 50 lines)
└── index.ts (barrel export)
```

---

## Shared Folder Structure

```
src/shared/
├── ai/                 # AI types, edge client contracts
│   ├── types.ts
│   ├── edge-client.ts
│   └── index.ts
├── analytics/          # Analytics service and events
│   ├── AnalyticsService.ts
│   ├── events.ts
│   └── index.ts
├── monetization/       # RevenueCat service + types
│   ├── revenuecat-service.ts
│   ├── use-revenuecat.ts
│   └── types.ts
├── retrieval/          # Retrieval types/constants
│   ├── types.ts
│   ├── constants.ts
│   └── index.ts
├── ui/                 # Shared UI components + primitives
│   ├── primitives/     # Skeleton, EmptyState, ErrorState, etc.
│   ├── components/     # Shared composite components
│   └── hooks/          # Animation hooks
├── utils/              # Pure functions only
│   └── index.ts
├── jobs/               # Trigger.dev job types/constants (types only)
│   ├── job-types.ts
│   ├── job-constants.ts
│   └── index.ts
└── hardening/          # Security hardening utilities
```

---

## System Integration Map

```
sessions
  → progression (XP earned from session completion)
  → rewards (rewards triggered by session completion)
  → streaks (streak evaluated after each session)
  → analytics (session events tracked)
  → feed (session completions posted to social feed)
  → offline-queue (session writes queued when offline)
  → boss (session damage applied to active boss)
  ← boss (boss bonuses applied to session XP)
  ← streaks (streak multiplier applied to session XP)
  ← squad (squad multiplier applied to session XP)
  ← settings (focus mode settings affect session behavior)

economy
  → inventory (purchased items added to inventory)
  → progression (high-value purchases grant bonus XP)
  → analytics (purchase events tracked)
  ← rewards (currency rewards from other systems)
  ← progression (level unlocks new shop items)
  ← settings (currency display preferences)

auth
  → user-profile (profile created on signup)
  → analytics (user identity set for Sentry)
  → onboarding (onboarding shown after signup)
  → deep-links (auth tokens handled in deep links)
  ← user-profile (profile updates affect auth metadata)
  ← settings (auth settings like biometric)

progression
  → rewards (level-up rewards triggered)
  → boss (level gates boss unlocks)
  → shop (level gates shop items)
  → analytics (progression events tracked)
  ← sessions (XP earned from sessions)
  ← economy (bonus XP from purchases)
  ← streaks (streak bonuses to XP)

ai-coach
  → sessions (coach messages during session)
  → streaks (coach encourages streak maintenance)
  → push-reminders (coach sends reminders)
  → analytics (coach interaction tracked)
  ← sessions (session data informs coach advice)
  ← progression (coach tailors advice to level)
  ← settings (coach personality preferences)

social
  → feed (posts created from social actions)
  → squads (squad formation and management)
  → progression (social XP bonuses)
  → analytics (social events tracked)
  ← squads (squad data affects social features)
  ← sessions (squad multipliers from sessions)

settings
  → notifications (notification preferences)
  → coach-behavior (coach personality settings)
  → theme (dark/light mode)
  → accessibility (font size, reduce motion)
  ← all-systems (settings affect all systems)

offline-queue
  → sessions (session writes queued offline)
  → economy-writes (purchase writes queued)
  → progression-writes (progression writes queued)
  ← netinfo (queue processed on reconnect)
```

---

## New Feature Checklist

Follow this exact order when adding any new feature:

### Step 1: Types First
- [ ] Create `features/<name>/types.ts`
- [ ] Define all domain interfaces (Entity, Config, State, Events)
- [ ] Import shared types from `shared/types` where applicable
- [ ] Do not write any logic or defaults

### Step 2: Schemas Second
- [ ] Create `features/<name>/schemas.ts`
- [ ] Write Zod schemas for every input/output boundary
- [ ] Use `.strict()` on all object schemas
- [ ] Infer types from schemas: `export type X = z.infer<typeof XSchema>`
- [ ] Add custom validation messages for user-facing errors

### Step 3: Repository Third
- [ ] Create `features/<name>/repository.ts`
- [ ] Write Supabase queries for all CRUD operations
- [ ] Validate all responses with Zod schemas
- [ ] Handle Supabase errors with typed error classes
- [ ] Add JSDoc comments for query purposes

### Step 4: Service Fourth
- [ ] Create `features/<name>/service.ts`
- [ ] Import repository and implement business logic
- [ ] Write state machine transitions (if applicable)
- [ ] Implement calculation functions (scoring, damage, etc.)
- [ ] Add validation before state changes
- [ ] Emit events via eventBus for cross-feature communication

### Step 5: Hooks Fifth
- [ ] Create `features/<name>/hooks.ts`
- [ ] Write TanStack Query hooks for server state (useQuery, useMutation)
- [ ] Write Zustand hooks for client state (if needed)
- [ ] Implement optimistic updates with proper rollback
- [ ] Handle all async states (pending, error, success)
- [ ] Wire up service methods

### Step 6: Analytics
- [ ] Create `features/<name>/analytics.ts`
- [ ] Add Sentry breadcrumbs for all key flows
- [ ] Define custom event tracking functions
- [ ] Ensure no PII in analytics data

### Step 7: Components Last
- [ ] Create `features/<name>/components/`
- [ ] Build UI using hooks from hooks.ts
- [ ] Use design tokens for all styling
- [ ] Implement all required UI states (loading, error, empty, success)
- [ ] Add accessibility labels and roles

### Step 8: Tests Alongside Each Layer
- [ ] Repository tests: Mock Supabase responses, test validation
- [ ] Service tests: Test business logic, state transitions, calculations
- [ ] Hook tests: Test async flows, optimistic updates, error handling
- [ ] Component tests: Test rendering, user interactions, accessibility

### Step 9: Integration
- [ ] Add feature to navigation (if needed)
- [ ] Wire up events to other features via eventBus
- [ ] Add feature to integration map in docs
- [ ] Update root store if feature has persistent state

### Step 10: Documentation
- [ ] Update architecture.md if structure differs from standard
- [ ] Update domain-model.md with new entities
- [ ] Update product-logic.md if game mechanics involved
- [ ] Add inline code comments for complex logic

---

## Phase 3 — Progression Architecture (COMPLETED)

### Features Implemented

**Progression System:**
- XP calculation engine with multipliers (streak, squad, boss, comeback, perfect session)
- Level thresholds with exponential scaling
- Level up rewards with tier-based unlocks
- `service-enhanced.ts` with idempotency, race condition handling, offline queue fallback
- `repository-enhanced.ts` with retry logic, optimistic locking, batch operations
- Premium UI: `XpProgressBar`, `LevelUpOverlay` with confetti animations

**Boss Battle System:**
- Health scaling algorithm (base × level multiplier × squad size)
- Damage calculation with session quality, streak bonuses, equipped items
- Boss encounter lifecycle (create → active → defeated/timeout)
- Cooldown system with 7-day rotation
- Premium UI: `BossBattleCard` with animated health bar, floating damage numbers

**Streak System:**
- Qualifying session detection (15+ min, 50+ quality)
- Multiplier tiers: 1.0x (0-2d), 1.25x (3-6d), 1.5x (7-13d), 1.75x (14-29d), 2.0x (30d+)
- Shield protection for grace periods
- Comeback detection with bonus multipliers
- Risk level calculation (NONE → LOW → MEDIUM → HIGH → CRITICAL)
- Premium UI: `StreakFlameChain` with animated day nodes, milestone stars

**Rewards System:**
- Reward calculator with base amount + multipliers
- Duplicate prevention via unique constraints
- Claim lifecycle: PENDING → CLAIMED/EXPIRED/FAILED
- Delivery system for XP, Coins, Gems, Items, Titles
- Ledger tracking for audit trail
- Premium UI: `RewardChest` with animated opening, rarity-based glow effects

**Cross-System Integration:**
- `sessions-feed.ts`: Sessions → Progression, Streaks, Rewards, Analytics, Social, Challenges
- `economy-feed.ts`: Economy → Progression, Events, Challenges, Shop
- `social-feed.ts`: Social → Feed, Leaderboards, Squad Challenges, Notifications
- Event-driven architecture via `eventBus`
- 13 new event types added to `EventChannels`

**Test Coverage:**
- Comprehensive test suites for all 4 features
- Unit tests, integration tests, failure paths, concurrency tests
- Edge case coverage for all major functions

**Premium Visual Components:**
- Animated XP progress bar with particle effects
- Full-screen level up celebration with confetti
- Boss battle card with shake animations, combo tracking
- Streak flame chain with fire animations
- Reward chest with tap-to-open interaction
- All components mobile-optimized with proper touch targets

---

## Phase 5 — UI Deepening & Cross-System Integration (COMPLETED)

### Premium UI Primitives System

**Location:** `src/shared/ui/primitives/`

A comprehensive design system providing consistent, animated UI states across the application.

**Components Implemented:**

| Component | Variants | Features |
|-----------|----------|----------|
| **Skeleton** | text, circular, rectangular, rounded, card | Shimmer animation, pulse animation, responsive sizing |
| **SkeletonCard** | - | Card-shaped skeleton with header and body |
| **SkeletonList** | count prop | Multiple rows with stagger animation |
| **SkeletonChart** | height prop | Chart placeholder for analytics |
| **EmptyState** | 8 pre-built scenarios | Icon, title, message, CTA buttons, animations |
| **EmptyAnalytics** | - | "No data yet" with start session CTA |
| **EmptyInsights** | - | "No insights available" variant |
| **EmptyChallenges** | - | "No active challenges" variant |
| **NetworkError** | - | Offline state with retry button |
| **ErrorBoundary** | class component | Error catching, fallback UI, Sentry integration, retry |
| **LoadingOverlay** | full-screen, inline | Activity indicator, progress bar, blur background |
| **SectionLoading** | - | Inline section placeholder |
| **ProgressIndicator** | linear, circular | Progress tracking with labels |
| **ButtonLoading** | - | Button inline loading state |

**Animation Hooks:** `src/shared/ui/hooks/useAnimation.ts`
- `useFadeIn(duration, delay)` - Opacity animation
- `useSlideIn(direction, duration)` - Slide from edges
- `useScaleIn(duration)` - Scale up animation
- `useShimmer()` - Shimmer effect for skeletons
- `usePulse()` - Pulsing animation
- `useBounce()` - Bounce animation
- `usePressAnimation()` - Touch feedback
- `useStaggeredAnimation(count, staggerDelay)` - Staggered list animations
- `useCountUp(target, duration)` - Number counting animation

**Usage Pattern:**
```typescript
// Loading state with skeleton
<View style={styles.skeletonContainer}>
  <Skeleton width="60%" height={24} style={styles.skeletonTitle} />
  <SkeletonChart height={200} />
  <SkeletonList count={3} />
</View>

// Empty state
<EmptyAnalytics 
  onStartSession={() => eventBus.publish('session:created', {...})} 
/>

// Error boundary wrapper
<ErrorBoundary componentName="AnalyticsDashboard" onReset={handleRefresh}>
  <AnalyticsContent />
</ErrorBoundary>
```

### Cross-System Feature Wiring

**Location:** `src/integration/FeatureWiring.ts`

Comprehensive event-driven integration wiring all major features together.

**Integration Functions:**

| Function | Wires | Events Handled |
|----------|-------|----------------|
| `wireSessionIntegration()` | Session → All systems | session:completed → analytics, progression, economy, streaks, challenges, social, season, notifications, AI coach |
| `wireEconomyIntegration()` | Economy → Progression | economy:transaction → progression tracking, challenge checking |
| `wireSocialIntegration()` | Social → Notifications | social:activity → notifications, squad updates |
| `wireCoachIntegration()` | AI Coach → Actions | coach:trigger → streak reminders, session encouragement, comeback flows |
| `wireProgressionIntegration()` | Progression → Rewards | progression:level_up → economy grants, notifications, social feed |
| `wireBossIntegration()` | Boss → Rewards | boss:defeated → XP, coins, items, social feed, analytics |
| `wireCraftingIntegration()` | Crafting → Systems | crafting:item_crafted → challenges, achievements, social |

**Event Types Added:** 20+ new events including:
- `progression:xp_earned`, `economy:grant`, `streak:session_completed`
- `challenges:check_progress`, `social:squad_activity`, `season:check_objectives`
- `coach:session_feedback`, `boss:defeated`, `crafting:item_crafted`

**Integration Hub:** `src/integration/index.ts`
- Master initialization function
- Health checking
- Cleanup management
- Selective integration exports

### Enhanced Analytics Dashboard

**New Components:**
- **Heatmap** (`src/features/analytics/components/Heatmap.tsx`)
  - 7-day × 24-hour activity visualization
  - Color-coded intensity (blue/green/purple schemes)
  - Peak day/hour statistics
  - Interactive cell press handling
  - Legend and stats footer

- **DataExportScreen** (`src/features/analytics/components/DataExportScreen.tsx`)
  - Full-screen export management
  - Category selection (Everything, Sessions, Analytics, Achievements, Settings)
  - Format selection (JSON, CSV)
  - Metadata inclusion toggle
  - Export preview
  - Previous exports list with download/retry
  - Danger zone with data deletion
  - Confirmation modals for destructive actions

**Premium States:**
- Skeleton loading with chart and list placeholders
- Empty state with CTA to start session
- Network error with retry
- Error boundary for crash recovery
- Fade animations for content transitions

### Enhanced Settings Screen

**New Features:**
- **Danger Zone Pattern**: Red-styled section for destructive actions
  - Double-confirmation for data deletion
  - "Type DELETE" final confirmation
  - Visual distinction from regular settings

- **Data Controls:**
  - Export Data row with navigation event
  - Import Data with file picker Alert
  - Auto Export preferences
  - Data Retention settings

- **Rich Action Rows:**
  - Primary action text
  - Secondary description text
  - Arrow navigation indicator

**Settings Categories:**
1. **General** - Language, timezone
2. **Notifications** - Push, email, in-app, quiet hours
3. **Coach** - Personality, frequency, session tips
4. **Appearance** - Theme, accent color, font scale, accessibility
5. **Privacy** - Visibility, online status, data analysis, analytics opt-out
6. **Data** - Export, import, retention, danger zone

### Architecture Compliance

✅ All UI primitives follow strict composition patterns
✅ Animation hooks are pure and reusable
✅ Feature wiring uses eventBus for loose coupling
✅ All components implement full state coverage (loading, error, empty, success)
✅ Dangerous actions have multi-step confirmations
✅ Export functionality includes progress tracking
✅ Settings include data control and privacy options
✅ Heatmap provides meaningful behavioral insights
✅ Error boundaries protect all major feature areas

### Quality Checklist

**Premium UI Standards:**
- [x] Skeleton loading for all async data
- [x] Empty states with contextual CTAs
- [x] Error recovery with retry options
- [x] Success confirmations with animations
- [x] Progress indicators for long operations
- [x] Disabled states with visual feedback
- [x] Touch targets minimum 44dp
- [x] Accessible labels and roles
- [x] Consistent spacing and typography

**Operational Depth:**
- [x] Data export with format options
- [x] Import functionality for data restoration
- [x] Dangerous action confirmations
- [x] Reset to defaults per category
- [x] Privacy controls (opt-out, visibility)
- [x] Analytics insights (heatmaps, trends)
- [x] Cross-system integration verified
- [x] Event wiring fully implemented

---

## Phase 4 — LiveOps Retention Engine (COMPLETED)

### Features Implemented

**Seasons System:**
- Season lifecycle: PRESEASON → ACTIVE → ALMOST_ENDING → ENDED → ARCHIVED
- Tier progression with XP requirements (1000 XP per tier default)
- Grace period handling for season transitions
- User season progress tracking with conflict resolution
- Premium track with gem-based purchase
- Retroactive tier claiming for new premium users
- Batch tier claiming with transaction safety
- Premium UI: `SeasonCard`, `SeasonDetailView`, `SeasonTimeline`

**Battle Pass System:**
- Free and Premium track rewards per tier
- Tier claiming with reward delivery
- XP-based progression through tiers
- Premium purchase with economy integration
- Engagement and monetization analytics
- Premium UI: `BattlePassTrack` with animated tier nodes

**Challenges System:**
- Daily, weekly, and event challenge types
- Challenge generation with difficulty scaling
- Progress tracking with milestone support
- Reroll system (free + paid) with fraud prevention
- Reward claiming with inventory delivery
- Challenge completion statistics
- Premium UI: `ChallengeCard`, `ChallengeList` with progress animations

**LiveOps Config:**
- Remote configuration with versioning
- Feature flags with rollout percentages
- A/B testing framework with audience targeting
- Maintenance mode with scheduled messages
- Environment-specific config (dev/staging/prod)
- Config diff tracking for audit trail
- Premium UI: `ConfigViewer`, `FeatureFlagPanel`

**Cross-System Integration:**
- `integration/season-rewards.ts`: Seasons → Battle Pass, Challenges, Rewards, Economy
- `integration/challenge-progression.ts`: Challenges → Progression, Streaks, Rewards, Inventory
- `integration/economy-seasons.ts`: Economy → Seasons, Battle Pass (purchase bonuses)
- `integration/social-competition.ts`: Social → Leaderboards, Squad Challenges
- `integration/ai-coach.ts`: AI → Streaks, Sessions, Comeback flows
- Event-driven architecture with 20+ event types
- Health monitoring for all integrations

**Test Coverage:**
- Unit tests for all services (seasons, battle-pass, challenges, liveops-config)
- Integration tests for cross-system workflows
- Race condition and concurrency tests
- Failure path and rollback tests
- UI state tests (loading, empty, error, success)

**Premium Visual Components:**
- Multi-variant Card primitive with 5 states (default, loading, disabled, error, success)
- Animated interactions with Reanimated
- Skeleton loading states for all components
- Empty and error state handling
- Progress states with visual feedback
- Success confirmations with animations

### Architecture Compliance
✅ All features follow strict architecture rules
✅ Complete folder structure per feature (types, schemas, service, repository, hooks, store, events, analytics, components, tests)
✅ Repository pattern with transaction safety
✅ Service layer with business logic and event emission
✅ Zod schemas for validation at all boundaries
✅ TanStack Query hooks with optimistic updates
✅ Analytics tracking for all key flows
✅ Comprehensive test coverage (unit, integration, failure paths)
✅ Cross-feature integration via centralized integration hub
✅ Integration health monitoring
