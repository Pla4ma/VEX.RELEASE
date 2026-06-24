# VEX App — Comprehensive Technical Research Document

> **Generated:** June 24, 2026  
> **App:** VEX — Focus & Productivity App  
> **Codebase:** `vex-app-old`  
> **Lines of Code:** ~150,000+ lines across 1,500+ TypeScript/TSX files  
> **Features:** 60+ feature modules  
> **Tests:** 500+ test files  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [Project Architecture](#3-project-architecture)
4. [Navigation & Routing](#4-navigation--routing)
5. [State Management](#5-state-management)
6. [Session System (Deep Dive)](#6-session-system-deep-dive)
7. [Scoring & Grading Engine](#7-scoring--grading-engine)
8. [AI Coach System](#8-ai-coach-system)
9. [Personalization Engine](#9-personalization-engine)
10. [Lane Engine](#10-lane-engine)
11. [Home Experience & Spine](#11-home-experience--spine)
12. [Focus Identity & Scoring](#12-focus-identity--scoring)
13. [Streaks System](#13-streaks-system)
14. [Challenges System](#14-challenges-system)
15. [Achievements System](#15-achievements-system)
16. [Progression & XP System](#16-progression--xp-system)
17. [Mastery System](#17-mastery-system)
18. [Companion System](#18-companion-system)
19. [Coach Presence System](#19-coach-presence-system)
20. [Boss / Blocker System](#20-boss--blocker-system)
21. [Notifications System](#21-notifications-system)
22. [Monetization & RevenueCat](#22-monetization--revenuecat)
23. [Economy System](#23-economy-system)
24. [Content Study & Study OS](#24-content-study--study-os)
25. [Onboarding System](#25-onboarding-system)
26. [Authentication System](#26-authentication-system)
27. [Settings System](#27-settings-system)
28. [Analytics System](#28-analytics-system)
29. [Design System & Theme](#29-design-system--theme)
30. [Glass UI Components](#30-glass-ui-components)
31. [Supabase Backend](#31-supabase-backend)
32. [Edge Functions](#32-edge-functions)
33. [Database Migrations](#33-database-migrations)
34. [Event System](#34-event-system)
35. [Feature Flags & LiveOps Config](#35-feature-flags--liveops-config)
36. [Persistence Layer](#36-persistence-layer)
37. [Network & Offline Support](#37-network--offline-support)
38. [Error Handling & Resilience](#38-error-handling--resilience)
39. [Performance & Cold Start](#39-performance--cold-start)
40. [Accessibility & Internationalization](#40-accessibility--internationalization)
41. [Testing Architecture](#41-testing-architecture)
42. [Security](#42-security)
43. [Screens Directory](#43-screens-directory)
44. [Complete Feature Catalog](#44-complete-feature-catalog)
45. [Key Architectural Decisions](#45-key-architectural-decisions)
46. [Technical Debt & Risks](#46-technical-debt--risks)

---

## 1. Executive Summary

VEX is a **production-grade Expo React Native application** (Expo SDK 56) designed as a focus and productivity tool. The app combines **gamification mechanics** (streaks, challenges, achievements, companion creatures) with **AI-powered coaching** (Gemini 2.5 via Supabase Edge Functions) to help users build consistent focus habits.

### Core Value Proposition
- **Session-based focus tracking** with configurable durations and modes (Light Focus, Deep Work, Sprint, Creative, Study, Recovery)
- **AI Coach** that provides personalized messages, session recommendations, comeback prompts, streak-risk nudges, and weekly reflections
- **Personalization engine** that adapts the entire experience (home screen, coach tone, companion intensity, boss visibility) based on user behavior
- **Gamified progression** through XP, levels, mastery techniques, companion evolution, and focus identity scoring
- **Premium monetization** via RevenueCat with contextual paywalls and value-ladder pricing

### Current State
- **Release Phase:** Final Release (polishing for App Store submission)
- **Feature Gate Status:** ~14 features disabled/archived (social, economy advanced, battle pass, squads, etc.)
- **Active Core Features:** Focus sessions, AI coach (basic), streaks, achievements, challenges, companion, content study, notifications, settings
- **Premium-Gated:** Advanced AI coach (deep memory), advanced Study OS, quiz/review mode
- **Glass UI Migration:** In progress — migrating from dark obsidian aesthetic to light glass (mint/pearl) visual language

---

## 2. Technology Stack

### Frontend Framework
| Technology | Version | Purpose |
|---|---|---|
| Expo SDK | 56 | Managed React Native framework |
| React | 19.2.3 | UI framework |
| React Native | Latest (via Expo 56) | Mobile rendering |
| TypeScript | 6.0.3 | Type safety (strict mode) |
| Reanimated | 4.3.1 | Animations (only animation library) |

### State Management
| Technology | Purpose |
|---|---|
| Zustand | Persistent client state (auth, app, UI, onboarding, coach preferences) |
| TanStack Query v5 | Server state (all Supabase data fetching) |
| Zustand + Immer | Immutable state updates |

### Data Layer
| Technology | Purpose |
|---|---|
| Supabase | PostgreSQL database, Auth, Realtime, Storage |
| Zod | Schema validation (source of truth for all types) |
| MMKV | Fast non-sensitive local storage |
| expo-secure-store | Auth tokens and secrets |
| expo-sqlite | Local SQLite database (newly integrated) |

### Backend
| Technology | Purpose |
|---|---|
| Supabase Edge Functions | AI inference, session completion, content study |
| Gemini 2.5 Flash/Pro | AI model for coaching, summaries, reflections |
| PostHog | Product analytics |
| RevenueCat | In-app purchases & subscriptions |
| Sentry | Error monitoring & crash reporting |

### Navigation
| Technology | Purpose |
|---|---|
| React Navigation v6 | Fully typed navigation |
| @react-navigation/bottom-tabs | Main tab navigator |
| @react-navigation/native-stack | Stack navigators |

### UI & Design
| Technology | Purpose |
|---|---|
| expo-glass-effect | Native iOS glass blur (newly integrated) |
| expo-mesh-gradient | Mesh gradients for atmosphere |
| expo-blur | Blur effects |
| expo-linear-gradient | Gradient backgrounds |
| expo-symbols | SF Symbols for icons |
| @expo/ui | Expo UI components (drawer, etc.) |
| FlashList | High-performance lists (replaces FlatList) |

### Key Shims (Metro resolver)
The project uses 35+ shim modules to prevent native module crashes in Expo Go / dev builds:
- `expo-glass-effect`, `expo-blur`, `expo-linear-gradient`, `expo-image`, `expo-mesh-gradient`
- `react-native-svg`, `@shopify/react-native-skia`, `@rive-app/react-native`
- `react-native-gesture-handler`, `react-native-reanimated`, `react-native-screens`
- `vaul` (React DOM drawer pulled in by @expo/ui, shimmed always)

### Project Strict Rules (from AGENTS.md)
- No `any` type, no `@ts-nocheck`, no `console.log`
- File size hard limit: 200 lines
- Feature architecture: `types.ts` → `schemas.ts` → `repository.ts` → `service.ts` → `hooks.ts` → `components/`
- Data flow: Component → Hook → Service → Repository → Supabase
- All colors/spacing/fonts from `src/theme/tokens/`
- All UI states required: Loading, Error, Empty, Success, Offline, Optimistic

---

## 3. Project Architecture

### Directory Structure

```
vex-app/
├── App.tsx                    # Entry point (registerRootComponent)
├── index.js                   # Metro entry
├── app.json                   # Expo config
├── metro.config.js            # Metro bundler with 35+ shims
├── jest.config.js             # Jest configuration
├── package.json               # Dependencies
│
├── src/
│   ├── app/                   # App root, bootstrap, providers
│   │   ├── App.tsx            # Root component with providers
│   │   ├── bootstrap.ts       # App initialization pipeline
│   │   ├── cold-start-performance.ts
│   │   ├── providers/AppProviders.tsx
│   │   └── session/index.tsx
│   │
│   ├── navigation/            # All navigation setup
│   │   ├── RootNavigator.tsx  # Auth/onboarding/main routing
│   │   ├── MainNavigator.tsx  # Bottom tab: Home/Focus/Progress/Profile
│   │   ├── AuthNavigator.tsx
│   │   ├── OnboardingNavigator.tsx
│   │   ├── SessionNavigator.tsx
│   │   ├── SettingsNavigator.tsx
│   │   ├── ContentStudyNavigator.tsx
│   │   ├── types.ts, route-types.ts, param-types.ts
│   │   └── components/        # TabBar, NavigationGuard, RootCrashBoundary
│   │
│   ├── features/              ## 60+ FEATURE MODULES ##
│   │   ├── account-deletion/
│   │   ├── achievements/      # Achievement tracking & unlock
│   │   ├── ai-coach/          # AI coaching messages & interventions
│   │   ├── analytics/         # Analytics dashboards & trends
│   │   ├── auth/              # Email/OAuth authentication
│   │   ├── boss/              # Boss/Blocker encounters (archived → blocker)
│   │   ├── capture/           # Quick capture/note (new)
│   │   ├── challenges/        # Daily/weekly challenges
│   │   ├── coach-presence/    # Coach visibility & messaging
│   │   ├── companion/         # Virtual companion creature
│   │   ├── companion-promise/ # Companion commitment system
│   │   ├── content-study/     # Content upload & AI study planning
│   │   ├── economy/           # Virtual currency (coins/gems)
│   │   ├── feature-gate/      # Feature access gating components
│   │   ├── focus-contract/    # Focus commitment contracts
│   │   ├── focus-identity/    # Focus score & identity profile
│   │   ├── focus-memory/      # Session memory/evidence
│   │   ├── focus-profile/     # User focus profile
│   │   ├── focus-run/         # Focus run mode
│   │   ├── home-experience/   # Home screen content decisions
│   │   ├── home-spine/        # Home screen priority structure
│   │   ├── integration/       # Cross-feature integration
│   │   ├── invisible-agent/   # Background coach agent decisions
│   │   ├── lane-engine/       # Motivation lane resolution
│   │   ├── lane-home/         # Lane-specific home surfaces
│   │   ├── learning-execution/# Learning task execution
│   │   ├── liveops-config/    # Feature flags, health checks, release map
│   │   ├── mastery/           # Skill mastery tracking
│   │   ├── memory-candidate/  # What VEX learned system
│   │   ├── mode-native/       # Native session modes
│   │   ├── mode-retention/    # Retention mode copy
│   │   ├── monetization/      # Paywalls, tiers, pricing
│   │   ├── monthly-report/    # Monthly focus reports
│   │   ├── notification-policy/# Notification decision logic
│   │   ├── notifications/     # Push notifications & center
│   │   ├── onboarding/        # Onboarding flow & state
│   │   ├── personal-bests/    # Personal best tracking
│   │   ├── personalization/   # User experience personalization
│   │   ├── plan/              # Task/project planning
│   │   ├── progression/       # XP, leveling, prestige
│   │   ├── project-focus/     # Project-based focus sessions
│   │   ├── rescue-mode/       # Streak rescue system
│   │   ├── retention-loop/    # User retention mechanics
│   │   ├── reward-ledger/     # Reward tracking
│   │   ├── rewards/           # Reward distribution
│   │   ├── session/           # Active session management
│   │   ├── session-completion/# Post-session orchestration
│   │   ├── session-events/    # Session event tracking
│   │   ├── session-history/   # Session history storage
│   │   ├── session-recommendation/# Session recommendation engine
│   │   ├── session-start/     # Session creation & setup
│   │   ├── settings/          # User settings management
│   │   ├── streaks/           # Streak tracking & recovery
│   │   ├── study-intelligence/# Study pattern intelligence
│   │   ├── study-os/          # Study operating system
│   │   ├── themes/            # Session themes
│   │   ├── today-system/      # Daily focus system
│   │   ├── unlock-explainer/  # Feature unlock explanation
│   │   ├── unlock-system/     # Feature unlock mechanics
│   │   ├── vex-actions/       # VEX action definitions
│   │   └── weekly-intelligence/# Weekly insights
│   │
│   ├── session/               # Core session runtime
│   │   ├── SessionOrchestrator.ts        # Main session orchestrator
│   │   ├── SessionOrchestratorBase.ts    # Base class with core logic
│   │   ├── engines/           # Timer, Scoring, Completion engines
│   │   ├── orchestrators/     # Lifecycle, Timer, Completion, Recovery
│   │   ├── antiCheat/         # Anti-cheat validation
│   │   ├── presets/           # Session preset management
│   │   ├── recovery/          # Session recovery from interruption
│   │   ├── repository/        # Session persistence
│   │   ├── components/        # ActiveSessionHUD, SessionTimer, etc.
│   │   ├── hooks/             # useSession, useSessionTimer, etc.
│   │   └── integration/       # Boss, Coach, Reward integrations
│   │
│   ├── store/                 # Zustand global stores
│   │   ├── authStore.ts       # Authentication state
│   │   ├── appStore.ts        # App initialization state
│   │   ├── uiStore.ts         # Toast & modal state
│   │   └── session-state.ts   # Session UI state
│   │
│   ├── theme/                 # Design system
│   │   ├── tokens/            # Colors, typography, spacing, etc.
│   │   ├── ThemeService.ts    # Theme persistence & system integration
│   │   ├── ThemeContext.tsx    # React context provider
│   │   └── semanticColors.ts  # Semantic color definitions
│   │
│   ├── components/            # Shared UI components
│   │   ├── glass/             # Glass morphism UI (30+ components)
│   │   ├── primitives/        # Box, Text, Button, Card, Stack
│   │   ├── premium/           # Premium UI surfaces & badges
│   │   ├── overlays/          # Modal, Toast
│   │   ├── states/            # Loading, Error, Empty state components
│   │   ├── atmosphere/        # VexMeshAtmosphere background
│   │   ├── coach/             # AnimatedCoachAvatar, SmartCoachHint
│   │   ├── boss/              # BossPhaseIndicator
│   │   ├── streak/            # StreakBadge
│   │   └── ui/                # Progress indicators, skeletons
│   │
│   ├── screens/               # Screen components
│   │   ├── home/              # HomeScreen, HomeHero, FocusScreen
│   │   ├── session/           # ActiveSession, SessionSetup, SessionComplete
│   │   ├── profile/           # Profile, Achievements, Mastery, Memory
│   │   ├── settings/          # Settings, Account, Notifications, Privacy
│   │   ├── auth/              # Login, Register, ForgotPassword
│   │   ├── onboarding/        # OnboardingFlow
│   │   ├── paywall/           # PaywallScreen, VipPaywall
│   │   ├── streaks/           # StreakFuneral
│   │   ├── boss/              # BossScreen
│   │   ├── challenges/        # ChallengesScreen
│   │   ├── companion/         # CompanionDetailScreen
│   │   ├── notifications/     # NotificationsScreen
│   │   ├── analytics/         # AnalyticsScreen
│   │   ├── plan/              # PlanScreen
│   │   ├── progress/          # ProgressScreen
│   │   ├── search/            # Search infrastructure
│   │   └── reference-ui/      # Reference design components
│   │
│   ├── shared/                # Shared cross-cutting modules
│   │   ├── ai/                # AI integration (Gemini via edge functions)
│   │   ├── analytics/         # PostHog analytics service
│   │   ├── monetization/      # RevenueCat integration
│   │   ├── accessibility/     # a11y, contrast, i18n, RTL
│   │   ├── feedback/          # Haptics system
│   │   ├── hardening/         # Cache, circuit breaker, retry
│   │   ├── hooks/             # useOfflineAwareMutation
│   │   ├── sharing/           # Social sharing
│   │   ├── ui/                # Shared UI primitives
│   │   └── utils/             # Validation, formatting, etc.
│   │
│   ├── events/                # Event bus system
│   │   ├── EventBus.ts        # Singleton pub/sub event bus
│   │   ├── EventEmitter.ts    # Low-level event emitter
│   │   ├── EventTypes.ts      # Typed event channels
│   │   └── event-definitions/ # Analytics, challenges, coach, etc.
│   │
│   ├── api/                   # API client & TanStack Query
│   │   ├── api-client.ts      # API client
│   │   ├── QueryProvider.tsx  # TanStack Query provider
│   │   ├── circuit-breaker.ts
│   │   ├── retry.ts
│   │   └── deduplicator.ts
│   │
│   ├── config/                # App configuration
│   │   ├── supabase.ts        # Supabase client (lazy proxy)
│   │   ├── supabase-mock.ts   # Jest mock client
│   │   └── sentry.ts          # Sentry initialization
│   │
│   ├── persistence/           # Storage layer
│   │   ├── MMKVStorage.ts     # MMKV adapter
│   │   ├── SecureStorage.ts   # expo-secure-store wrapper
│   │   ├── StorageManager.ts  # High-level storage manager
│   │   └── PersistenceService.ts
│   │
│   ├── network/               # Network monitoring
│   │   ├── NetInfoAdapter.ts  # NetInfo wrapper
│   │   ├── RequestQueue.ts    # Offline request queue
│   │   └── useNetInfo.ts
│   │
│   └── lib/                   # Low-level libraries
│       ├── offline/queue.ts   # Offline operation queue
│       └── repository/        # Base repository patterns
│
├── supabase/
│   ├── migrations/            # 30+ database migrations
│   └── functions/             # Edge functions
│       ├── ai/                # AI inference (Gemini)
│       ├── ai-coach/          # Coach-specific AI logic
│       ├── content-study/     # Content analysis & study plans
│       ├── session-complete/  # Post-session processing
│       ├── trigger-jobs/      # Scheduled triggers
│       └── season-finalize/   # Season completion
│
├── shims/                     # 35+ Metro shims for native modules
├── e2e/                       # Detox E2E tests
├── docs/                      # Architecture & planning docs
├── plugins/                   # Expo config plugins
└── scripts/                   # Build & validation scripts
```

### Architecture Patterns

#### Feature Module Pattern (Mandatory)
Every feature in `src/features/<name>/` must have:
```
feature-name/
├── types.ts        # Domain types only, no logic
├── schemas.ts      # Zod schemas only, types inferred via z.infer<>
├── repository.ts   # ALL Supabase queries here and ONLY here
├── service.ts      # ALL business logic here and ONLY here
├── hooks.ts        # TanStack Query + Zustand wiring
├── store.ts        # Zustand slice (only if persistent state needed)
├── events.ts       # EventBus event definitions
├── analytics.ts    # Sentry + PostHog tracking
├── components/     # UI rendering only, zero business logic
└── __tests__/      # Unit and integration tests
```

#### Data Flow (Unidirectional)
```
Component → Hook → Service → Repository → Supabase
```

#### State Layer Separation
| State Type | Tool | Where |
|---|---|---|
| Server state | TanStack Query | hooks.ts → service.ts → repository.ts |
| Global client | Zustand (MMKV persisted) | store.ts — auth, prefs, offline queue |
| Local UI | useState | Components — open/closed, drafts only |

---

## 4. Navigation & Routing

### Navigation Hierarchy

```
RootNavigator (NavigationContainer)
├── Auth Stack (when unauthenticated)
│   ├── Login
│   ├── Register
│   ├── ForgotPassword
│   ├── ResetPassword
│   └── VerifyEmail
│
├── Onboarding (when authenticated but not onboarded)
│   └── OnboardingFlowScreen (5 steps)
│
└── Main (when authenticated & onboarded)
    ├── MainNavigator (Bottom Tabs)
    │   ├── Home Tab → HomeScreen
    │   ├── Focus Tab → FocusScreen
    │   ├── Progress Tab → ProgressScreen
    │   └── Profile Tab → ProfileTabRoute (ProfileScreen)
    │
    ├── Settings Stack
    │   ├── SettingsMain
    │   ├── AccountSettings
    │   ├── NotificationSettings
    │   ├── PrivacySettings
    │   ├── AppearanceSettings
    │   ├── CoachSettings
    │   ├── LaneMode
    │   └── DataExport
    │
    ├── Session Stack
    │   ├── SessionSetup
    │   ├── ActiveSession
    │   ├── SessionComplete
    │   └── SessionHistory
    │
    ├── Feature Screens (MainStack)
    │   ├── Boss
    │   ├── Notifications
    │   ├── ContentStudy
    │   ├── AICoach
    │   ├── Challenges
    │   ├── Mastery
    │   ├── CompanionDetail
    │   ├── MemoryConsole
    │   ├── Achievements
    │   └── Analytics
    │
    ├── Paywall / VipPaywall
    ├── Comeback (streak recovery)
    ├── StreakFuneral
    ├── FocusScoreDashboard
    └── Search
```

### Route Types
All routes are typed via `RootStackParamList` in `navigation/types.ts`. Navigation uses typed routes (no string literals).

### Deep Links
Configured in `navigation/linking-config.ts` with the `vex://` URL scheme. Supports:
- Auth callbacks (`vex://auth/callback`)
- Streak funeral deep links
- Notification deep links
- Session setup from notifications

### Navigation Components
- **VexTabBar** (`navigation/components/VexTabBar.tsx`) — Custom glass tab bar
- **RootCrashBoundary** — Catches navigation-level crashes and offers reset
- **NavigationGuard** — Guards against navigating to locked features
- **RootAuthLoadingScreen** — Shown during auth check
- **RouteLoadingFallback** — Shown during route transitions

### Notification Navigation
Dedicated notification routing system in `navigation/notification-routing.ts`:
- Resolves notification actions to navigation routes
- Handles boss behavior notifications, streak funeral triggers
- Deep link parsing from notification payloads

---

## 5. State Management

### Zustand Stores

| Store | Persistence | Key State |
|---|---|---|
| `useAuthStore` (authStore.ts) | MMKV (auth-storage) | user, isAuthenticated, isLoading, error |
| `useAppStore` (appStore.ts) | None (runtime only) | isInitialized, isOnline, lastSyncTime |
| `useUIStore` (uiStore.ts) | None (runtime only) | toast, activeModal, modalProps |
| `useOnboardingStore` (features/onboarding/store.ts) | Zustand persist | step, goal, focusDuration, completedAt, isOnboarded |
| `useCoachStore` (features/ai-coach/store.ts) | MMKV persist | Coach preferences (tone, frequency, persona) |
| `useSessionUIStore` (store/session-state.ts) | None | completionSyncState |
| `useMonetizationStore` (shared/monetization/store.ts) | None | RevenueCat derived state |

### TanStack Query
- **QueryProvider** (`api/QueryProvider.tsx`) wraps the entire app
- Query keys organized by domain: `QueryKeys.session`, `QueryKeys.streak`, `QueryKeys.achievements`
- Every mutation invalidates related queries on success
- Offline-aware via `useOfflineAwareMutation`

### Auth Store Details
The auth store persists minimally to MMKV:
```typescript
partialize: (state) => ({
  isAuthenticated: state.isAuthenticated,
  user: state.user ? {
    id: state.user.id,
    onboardingCompletedAt: state.user.onboardingCompletedAt
  } : null
})
```

### Session State Machine
Session state is managed by `useSessionUIStore` with states:
- `pending_sync` — saved locally, syncing
- `synced` — fully synced to Supabase
- `failed_sync` — needs repair pass

---

## 6. Session System (Deep Dive)

The session system is the **core runtime** of VEX. It manages the entire lifecycle of a focus session from creation to completion.

### Architecture

```
SessionOrchestrator (Facade)
├── SessionOrchestratorBase (Abstract base)
│   ├── TimerEngine          # Time tracking, warnings, break management
│   ├── ScoringEngine        # Score calculation, damage, focus quality
│   ├── CompletionEngine     # Session completion, abandonment, recovery
│   ├── AntiCheatEngine      # Tick validation, purity scoring
│   ├── SessionEventEmitter  # Internal event system
│   ├── SessionRepository    # Persistence (Supabase + MMKV)
│   └── PresetService        # Session preset management
│
├── Orchestrators (behavior modules)
│   ├── SessionCore.ts       # Create, finalize, load
│   ├── SessionLifecycle.ts  # Start, pause, resume, background
│   ├── SessionTimer.ts      # Tick handling, warnings, break logic
│   ├── SessionCompletion.ts # Complete, abandon
│   └── SessionRecovery.ts   # Interruption recovery
│
└── Accessors (orchestrator-accessors.ts)
    # Read-only state access
```

### Session States
```
PREPARING → COUNTDOWN → ACTIVE → PAUSED → ACTIVE → COMPLETED
                                    ↓
                              BACKGROUNDED → FOREGROUNDED → ACTIVE
                                    ↓
                              INTERRUPTED → RECOVERING → ACTIVE
                                    ↓
                              ABANDONED
```

### Session Modes
| Mode | Duration | Description |
|---|---|---|
| LIGHT_FOCUS | 10-25 min | Light, low-pressure focus |
| DEEP_WORK | 45-90 min | Long deep work sessions |
| SPRINT | 15-30 min | Short intense sprints |
| CREATIVE | 25-60 min | Creative flow sessions |
| STUDY | 25-45 min | Study with recall/quiz breaks |
| RECOVERY | 5-15 min | Comeback/recovery sessions |

### Timer Engine (`engines/TimerEngine.ts`)
- Interval-based tick system (configurable tick rate)
- Warning notifications at 5, 2, 1 minutes remaining
- Break management between intervals
- Background/foreground time tracking
- Serialization for state restoration after app restart

### Anti-Cheat Engine (`antiCheat/AntiCheatEngine.ts`)
- **Tick Validation**: Detects impossible time jumps
- **Purity Scoring**: Measures focus quality based on interruptions
- **Configurable thresholds** for warnings and session invalidation
- **Focus Quality Metrics**: overallScore, interruptionCount, distractionTime

### Session Repository (`repository/SessionRepository.ts`)
- Stores active session state in MMKV for persistence across app restarts
- Supabase sync for completed sessions
- Offline queue for sessions completed without network
- History queries with limit/pagination

### Session Completion Orchestration (`features/session-completion/`)
The completion pipeline executes these layers:
1. **LAYER 1**: Local completion receipt (always succeeds)
2. **LAYER 1b**: Idempotency guard (prevents duplicate processing)
3. **LAYER 2**: Persist session to Supabase (or offline queue)
4. **LAYER 3**: XP / streak / progression / rewards subsystems
5. **LAYER 4**: Personalization and side effects

### Session Recovery
When a session is interrupted (app backgrounded, phone call, etc.):
1. Record interruption with type and severity
2. Apply damage calculation (score penalty)
3. Offer recovery: USER_RESUME, STREAK_SAVE, or PARTIAL_CREDIT
4. Recovery chains multiply rewards for comeback sessions

### Session Presets
- **Default presets** defined in `presets/default-presets.ts`
- Users can create **custom presets** with name, duration, mode, tags
- Presets stored per-user in MMKV and optionally synced to Supabase

---

## 7. Scoring & Grading Engine

### Scoring Engine (`engines/ScoringEngine.ts`)

Calculates session scores using multiple factors:

```
Base Score = (duration / targetDuration) * modeMultiplier * 1000
Time Bonus = earlyCompletion * completionSpeed * 500
Streak Bonus = log(streakDays) * 100
Purity Multiplier = purityScore / 100
Final Score = (Base + Time + Streak) * Purity * LevelMultiplier
```

### Completion Tiers
| Tier | Percentage | Description |
|---|---|---|
| NONE | < 50% | Did not reach minimum |
| PARTIAL | 50-89% | Partial credit |
| FULL | 90-99% | Full completion |
| PERFECT | 100% | Perfect session (no interruptions, max quality) |

### Damage Calculation (`engines/DamageCalculator.ts`)
When a session is abandoned/interrupted, damage is calculated:
- **ABANDON**: Heavy penalty, proportional to time remaining
- **INTERRUPTION**: Moderate penalty based on interruption duration
- **TIMEOUT**: Penalty for exceeding session time significantly
- **ANTI_CHEAT**: Maximum penalty

### Focus Quality Calculator (`engines/focus-quality-calculator.ts`)
- Calculates focus quality from interruption count, duration, and severity
- Purity score (0-100) based on session cleanliness
- Labels: Elite (95+), Good (75-94), Okay (50-74), Distracted (< 50)

---

## 8. AI Coach System

### Architecture
```
AI Coach Feature (features/ai-coach/)
├── types.ts (CoachMessage, Intervention, Recommendation types)
├── schemas.ts (Zod validation)
├── service.ts → service/service.ts (business logic)
├── repository.ts → repository/ (Supabase Edge Function calls)
├── hooks.ts → hooks/ (TanStack Query hooks)
├── store.ts (Zustand coach preferences store)
├── analytics.ts (coach event tracking)
├── events.ts (EventBus definitions)
├── integration.ts (Session integration)
├── coach-state-types.ts (Coach state machine types)
├── ai-helpers.ts (Prompt building helpers)
└── constants.ts (Coach constants)
```

### AI Models Used
| Model | Use Case | Temperature | Max Tokens |
|---|---|---|---|
| Gemini 2.5 Flash | Coach messages, comeback prompts, streak nudges | 0.7-0.9 | 150-300 |
| Gemini 2.5 Pro | Session summaries, weekly reflections | 0.8 | 500-800 |

### Request Types
1. **GENERATE_COACH_MESSAGE** — Personalized encouragement/tips
2. **GENERATE_SESSION_SUMMARY** — Post-session narrative summary
3. **GENERATE_COMEBACK_PROMPT** — Re-engagement messaging
4. **GENERATE_STREAK_RISK_NUDGE** — Urgent streak protection
5. **GENERATE_WEEKLY_REFLECTION** — Weekly progress reflection
6. **GENERATE_AGENT_DECISION** — Invisible agent decisions

### AI Client Architecture (`shared/ai/`)
```
edge-function-service.ts → Supabase Edge Function
├── ai-client-contracts.ts (Request builders)
├── edge-function-invoke.ts (Invoke with fallback)
├── ai-fallback-tiers.ts (Tiered fallback: AI → local → generic)
├── ai-quota-service.ts (Rate limiting)
├── ai-quota-repository.ts
├── ai-quota-strategies.ts
├── ai-intent-routing.ts (AI response → safe action mapping)
├── core-policy.ts (Safety policies)
├── core-schemas.ts (Core validation)
├── core-trace.ts (Decision tracing/audit)
├── ai-events.ts (Event tracking)
├── ai-models.ts (Model configs, timeouts, cache TTLs)
└── ai-constants.ts (API constants)
```

### Safety Settings
All AI requests use Gemini safety settings:
- HARM_CATEGORY_HARASSMENT: BLOCK_MEDIUM_AND_ABOVE
- HARM_CATEGORY_HATE_SPEECH: BLOCK_MEDIUM_AND_ABOVE
- HARM_CATEGORY_SEXUALLY_EXPLICIT: BLOCK_MEDIUM_AND_ABOVE
- HARM_CATEGORY_DANGEROUS_CONTENT: BLOCK_MEDIUM_AND_ABOVE

### Fallback Tiers
When AI is unavailable, the system falls back through tiers:
1. **Tier 1**: Full AI (edge function)
2. **Tier 2**: Cached AI response (TTL-based)
3. **Tier 3**: Template-based local message
4. **Tier 4**: Generic encouragement
5. **Tier 5**: Silent (no message)

---

## 9. Personalization Engine

### Overview (`features/personalization/`)

The personalization engine adapts the entire app experience based on user behavior. It resolves:

- **Behavior Profile**: Session patterns, preferred times, durations, modes
- **Experience Profile**: Home layout, coach tone, companion intensity, boss visibility
- **Route Gates**: Which features/routes are available
- **Notification Policy**: What notifications to send
- **Premium Strategy**: When/how to present premium

### Resolution Pipeline
```
User Profile + Behavior Stats + Feature Availability
    → resolveVexExperience()
        → resolveBehavior()
        → resolveBoss()
        → resolveHome()
        → resolveCompletion()
        → resolveCompanionIntensity()
        → resolveCoachMode()
        → resolveHiddenSystems()
    → VexExperience (typed output)
```

### User Stages
| Stage | Sessions | Description |
|---|---|---|
| NEW_USER | 0 | First-time experience |
| ACTIVATING | 1-2 | Early habit formation |
| ENGAGED | 3-9 | Regular user |
| POWER_USER | 10+ | Heavy user |

### Behavior Signals
Tracked behavior signals include:
- `preferredSessionMode` — Most used session mode
- `lowEnergyPattern` — Detected low-energy periods
- `skipRate` — How often user skips sessions
- `preferredTimeOfDay` — Morning/afternoon/evening
- `averageSessionQuality` — Mean quality score
- `comebackCount` — Number of comebacks

### First Week Experience
A specialized sub-system (`first-week-*`) that manages:
- Day-by-day copy and lane assignment
- First session setup
- Companion introduction
- Gradual feature revelation
- Observation and engine adaptation

### Motivation Profiles
Users are classified into motivation styles:
- **CALM** — Minimal gamification, peaceful experience
- **STUDY_FOCUSED** — Study OS prominent
- **GAME_LIKE** — Boss battles, XP, competitive elements
- **INTENSE** — Maximum intensity, challenges, pressure

---

## 10. Lane Engine

### Overview (`features/lane-engine/`)

Lanes represent different motivation paths through the app. The lane engine determines which lane a user belongs to and how the experience adapts.

### Lane Types
- **Focus Lane** — Traditional focus sessions
- **Study Lane** — Content-based study with plans
- **Creative Lane** — Creative flow sessions
- **Run Lane** — Sprint/momentum-based
- **Project Lane** — Project-based deep work

### Lane Resolution
```
Initial Lane = resolveInitialLane(onboardingData)
Behavior Lane = resolveBehaviorLane(behaviorStats)
Final Lane = mergeLaneProfiles(initial, behavior)
```

The engine can suggest lane reconsideration when behavior patterns shift significantly.

### Lane Home Surfaces
Each lane has a distinct home surface experience:
- `CreativeHomeSurface.tsx`
- `GameLikeHomeSurface.tsx`
- `MinimalHomeSurface.tsx`
- `StudentHomeSurface.tsx`

---

## 11. Home Experience & Spine

### Home Experience (`features/home-experience/`)

The home experience engine builds the **HomeExperienceModel** which determines:
- Which sections are visible
- What queries are allowed
- What routes are accessible
- What elements are hidden/teased
- Companion placement
- Boss placement
- Premium copy
- Study OS placement

### Experience Stages
| Stage | Sessions | Description |
|---|---|---|
| STAGE_0 | 0 | Day zero (pre-first-session) |
| STAGE_1 | 1 | After first session |
| STAGE_2 | 2-4 | Early engagement |
| STAGE_3 | 5-9 | Established rhythm |
| STAGE_4 | 10+ | Power user |

### Home Spine (`features/home-spine/`)

The home spine builds the **HomeSpineModel** which determines:
- **Return Reason** — Why the user should come back (coach recommendation, streak risk, study plan continuation, next best action)
- **Primary Action** — The main CTA (start session, continue study, comeback session)
- **Progress Signal** — Compact progress display

### Day Zero (Pre-First-Session) Policy
Before the first session, the app enforces strict minimalism:
- Hidden: session_reflection, progress_signal, companion_thread, adaptive_challenge
- Must not run: boss_query, challenge_query, study_plan_query, squad_query
- Only routes: SessionStack.SessionSetup
- Spotlight: motivation_style selection

---

## 12. Focus Identity & Scoring

### Overview (`features/focus-identity/`)

The Focus Identity system gives users a persistent score and identity band that evolves with their focus habits.

### Score Bands
| Band | Score Range | Percentile |
|---|---|---|
| Novice | 0-300 | 0-25% |
| Building | 301-500 | 25-50% |
| Consistent | 501-650 | 50-75% |
| Strong | 651-800 | 75-90% |
| Elite | 801-900 | 90-98% |
| Legendary | 901-1000 | 98-100% |

### Score Factors
1. **Consistency** (25%) — Daily/weekly session frequency
2. **Streak Stability** (25%) — Longest streak, current streak
3. **Session Quality** (20%) — Average purity/quality scores
4. **Diversity** (15%) — Mode variety, time variety
5. **Recency** (15%) — Recent activity, comeback status

### Score Changes
Events that modify focus score:
- `SESSION_COMPLETED` (+10-25 based on quality)
- `PERFECT_WEEK` (+50)
- `STREAK_MILESTONE` (+30 at 7, +50 at 30, +100 at 100 days)
- `MISSED_DAY` (-15)
- `STREAK_BREAK` (-50 to -100)
- `RECOVERY_COMPLETE` (+25)

### Identity Statements
Each band has progressive identity statements based on streak-in-band:
- Building: "Building the foundation" → "The habit is taking root" → "Your rhythm is becoming real"
- Consistent: "Steady and sure" → "The machine is running" → "Consistency is your identity"
- Elite: "Focus is who you are" → "Others wonder how you do it" → "Legendary focus, earned daily"

### Monthly Report
The system generates monthly reports with:
- Score trend (last 90 days)
- Factor breakdown
- Strengths and weaknesses
- Personalized recommendations
- Recovery status

### Recovery System
When a user's score drops significantly:
- `isInRecovery = true`
- Recovery progress tracks comeback sessions
- Previous score is preserved as `preLapseScore`
- Events: `FOCUS_RECOVERY_COMPLETE`

---

## 13. Streaks System

### Overview (`features/streaks/`)

### Streak Mechanics
- **Qualifying Session**: ≥ 10 minutes duration AND ≥ 50 quality score
- **Streak Window**: 24 hours between sessions
- **Calendar Day**: Based on user timezone
- **Shields**: Freeze protection (earned at milestones)

### Streak States
| State | Description |
|---|---|
| ACTIVE | Streak is alive and healthy |
| AT_RISK | Close to deadline without session |
| CRITICAL | Very close to breaking |
| BROKEN | Streak has ended |
| RECOVERING | In comeback/recovery mode |
| PROTECTED | Shield is active |

### Milestones
| Days | Reward Type | Amount | Badge |
|---|---|---|---|
| 3 | COINS | 100 | streak-3 |
| 7 | COINS | 250 | streak-7 |
| 14 | GEMS | 25 | streak-14 |
| 30 | STREAK_SHIELD | 1 | streak-30 |
| 60 | GEMS | 100 | streak-60 |
| 100 | GEMS | 250 | streak-100 |
| 180 | GEMS | 500 | streak-180 |
| 365 | GEMS | 1000 | streak-365 |

### Streak Protection
- **Shields**: Automatically applied when streak would break (if available)
- **Freeze**: Time-limited pause on streak decay
- **Grace Period**: One-time per-streak grace period
- **Comeback Quests**: Recovery path with required sessions to restore streak

### Streak Funeral
When a long streak breaks, the user sees the **StreakFuneralScreen**:
- Animated flame effects
- Previous streak displayed
- Funeral costs (from `streak-funeral-costs.ts`)
- Comeback quest offer

### Streak Insurance (Archived)
- `StreakInsurance.ts` — Purchased streak protection (archived)
- Streak Insurance was removed as "pay-to-save" dark pattern

### Streak Evolution System
`StreakEvolutionSystem.ts` — Tracks streak evolution over time, detects patterns, and adjusts difficulty.

---

## 14. Challenges System

### Overview (`features/challenges/`)

### Challenge Types
- **Daily Challenges**: Reset daily, simple tasks (complete 1 session, focus 25 min)
- **Weekly Challenges**: Higher targets (5 sessions, 3 hours focus)
- **Special Challenges**: Event-based, milestone-linked

### Challenge Bank System
The challenge bank has multiple sub-systems:
- `challenge-bank-volume.ts` — Ensures enough challenges available
- `challenge-bank-morning-quality.ts` — Morning-specific challenges
- `challenge-bank-seasonal.ts` — Seasonal/event challenges
- `challenge-bank-social-combat.ts` — Social competition challenges
- `challenge-bank-streak.ts` — Streak-related challenges
- `challenge-bank-expansion.ts` — New challenge generation
- `challenge-bank-types.ts` — Type definitions

### Challenge Lifecycle
```
ASSIGNED → ACTIVE → PROGRESS_UPDATED → COMPLETED → CLAIMED
```

### Reward System
Challenges grant:
- **Coins**: For basic challenges
- **Gems**: For difficult challenges
- **XP**: For all completed challenges
- **Badges**: For special challenges

### Trigger Types
Challenges progress via triggers:
- `SESSION_COMPLETED` — Session completion
- `STREAK_DAY` — Daily streak update
- `FOCUS_MINUTES` — Cumulative focus time
- `BOSS_DAMAGE` — Boss encounter progress
- `STUDY_PLAN_PROGRESS` — Study plan advancement

---

## 15. Achievements System

### Overview (`features/achievements/`)

### Achievement Categories
- **Milestone**: Session count, streak length, total focus time
- **Quality**: Perfect sessions, high purity scores
- **Consistency**: Weekly streaks, monthly activity
- **Mastery**: Technique mastery, boss defeats
- **Study**: Study plan completions, content studied
- **Social**: (Partially archived) social features

### Achievement Conditions
| Comparator | Description |
|---|---|
| EQUALS | Exact value match |
| GREATER_THAN | Value exceeds target |
| LESS_THAN | Value under target |
| CUMULATIVE | Accumulated progress |

### Reward Distribution
On achievement unlock:
- `economy:add-currency` — Coins/gems
- `progression:add-xp` — Experience points
- `rewards:badge-granted` — Profile badges
- `rewards:title-granted` — Unlockable titles
- `rewards:cosmetic-unlocked` — Cosmetic items

### Boss Defeat Achievements
- `boss-streak-achievements.ts` — Boss encounter streak achievements
- `boss-defeat-tracking.ts` — Tracks boss defeat progress

### Study Achievements
- `study-achievements.ts` — Content study and quiz achievements

---

## 16. Progression & XP System

### Overview (`features/progression/`)

### XP Sources
| Source | XP Range |
|---|---|
| Session Completion | 50-200 (based on quality & duration) |
| Perfect Session | +50 bonus |
| Challenge Completion | 100-500 |
| Achievement Unlock | 250-1000 |
| Streak Milestone | 100-500 |
| Boss Encounter | 100-300 |
| Comeback Session | 1.5x multiplier |

### Level Formula
```
Level Threshold = baseXp + (level * levelMultiplier * growthFactor)
```

### Level Rewards
On level-up:
- `getLevelUpCelebrationRewards()` returns:
  - Badge unlocks
  - Feature unlocks
  - Coin/gem rewards
  - Cosmetic unlocks

### Prestige System (`progression/prestige-system.ts`)
- Prestige resets level but grants permanent bonuses
- Prestige bonuses include XP multipliers, streak protection

### XP History
- `xp-history.ts` — Tracks XP gains over time
- `daily-progress` — Daily XP tracking

---

## 17. Mastery System

### Overview (`features/mastery/`)

### Mastery Techniques
| Technique | Max Level | Description |
|---|---|---|
| durationMastery | 25 | Long session endurance |
| purityMastery | 25 | Distraction-free focus |
| consistencyMastery | 25 | Daily habit strength |
| comebackMastery | 25 | Recovery resilience |
| bossMastery | 25 | Challenge confrontation |

### Mastery Ranks
- **Novice** (0-24 points)
- **Apprentice** (25-49 points)
- **Adept** (50-74 points)
- **Master** (75-99 points)
- **Grandmaster** (100-125 points)

### S-Grade Streak System
`SGradeStreakTracker.ts` — Tracks consecutive S-grade (perfect) sessions for bonus rewards.

### Mastery Challenges
Each mastery technique has associated challenges that test and advance skill.

---

## 18. Companion System

### Overview (`features/companion/`)

The companion is a virtual creature that grows and evolves based on the user's focus habits.

### Companion States
| State | Description |
|---|---|
| SLEEPY | Just waking up / low activity |
| CURIOUS | Exploring / early session |
| FOCUSED | In the zone with user |
| PROUD | After good session |
| CONCERNED | After streak break |
| EVOLVED | After level-up |

### Companion Phases
- **Phase 1**: Egg / Seed (sessions 1-3)
- **Phase 2**: Hatchling (sessions 4-10)
- **Phase 3**: Growing (sessions 11-25)
- **Phase 4**: Mature (sessions 26-50)
- **Phase 5**: Evolved (sessions 51+)

### Companion Growth
The `CompanionGrowthService` manages:
- XP accumulation from sessions
- Level-ups and evolution triggers
- Mood changes based on session quality
- Reaction to streaks, comebacks, milestones

### Companion Events
- `MOOD_SHIFT` — Mood changes during session
- `MILESTONE` — Progress milestones (10% increments)
- `GROWTH_PULSE` — Growth from positive events
- `EVOLUTION` — Phase change

### Companion Personality
`CompanionPersonalityEngine.ts` — Generates personality traits and responses.
`personality-responses.ts` — Library of companion dialogue.

### Companion Memory
- `memory-repository.ts` — Stores companion memory/state
- `memory-events.ts` — Memory event tracking
- `memory-copy.ts` — Memory-based dialogue

### Companion Promise
`features/companion-promise/` — Commitment system where users make promises to their companion.

---

## 19. Coach Presence System

### Overview (`features/coach-presence/`)

The coach presence system manages when and how the AI coach appears to the user.

### Visibility Policy
The `visibility-policy.ts` determines coach visibility based on:
- User stage (new, activating, engaged, power)
- Feature availability (study, boss, progress)
- Session state (active, completed, idle)
- Premium status

### Coach Surfaces
| Surface | Context |
|---|---|
| HOME | Main home screen |
| SESSION | During active session |
| COMPLETION | Post-session screen |
| RESCUE | Streak rescue intervention |
| PREMIUM | Premium feature context |

### Action Intents
- `START_SESSION` — Begin a focus session
- `START_STUDY_SESSION` — Begin study session
- `REVIEW_PROGRESS` — Check progress
- `CONTINUE_PLAN` — Resume study plan
- `REFLECT` — Session reflection
- `TAKE_BREAK` — Recovery suggestion

### Copy System
The coach presence has an extensive copy library:
- `copy-messages.ts` — Message templates
- `copy-schemas.ts` — Message validation
- `copy-service.ts` — Message resolution
- `comeback-message.ts` — Comeback-specific messages
- `day-retention.ts` — Day-by-day retention messages
- `message-library.ts` — Organized message catalog

---

## 20. Boss / Blocker System

### Current State (Archived → Blocker)
The original **Boss System** (gamified enemy encounters during sessions) has been **archived** and replaced with a **Personal Blocker** system.

### Personal Blocker System
```typescript
// boss/types.ts
interface PersonalBlockerBlock {
  id: string;
  label: string;           // e.g., "Phone Distractions", "Perfectionism"
  triggerAfterSessions: number;
  motivationStyle?: 'calm' | 'study' | 'game_like' | 'intense';
}
```

### Blocker Visibility
| State | Description |
|---|---|
| hidden | Not visible to user |
| teaser | Subtle hint of upcoming feature |
| subtle | Quiet presence, no combat |
| visible | Full blocker interaction |

### Boss Service (All Stubbed)
The entire boss service (`features/boss/service.ts`) is stubbed:
```typescript
export function calculateDamage(): number { return 0; }
export function createEncounter(): Promise<null> { return Promise.resolve(null); }
export function getActiveEncounter(_userId: string): Promise<null> { return Promise.resolve(null); }
```

### Boss Screen Components
Although archived, the Boss screen UI remains:
- `BossScreen.tsx`, `BossScreenContent.tsx`, `BossScreenSections.tsx`
- They now display blocker awareness rather than combat

---

## 21. Notifications System

### Overview (`features/notifications/`)

### Notification Architecture
```
Push Notification In → notification-routing.ts
    → resolveNotificationAction()
    → Navigate to appropriate screen
```

### Notification Types
| Type | Priority | Trigger |
|---|---|---|
| URGENCY | high | Streak at risk |
| COACH_MESSAGE | normal | AI coach message |
| REMINDER | normal | Scheduled reminder |
| MILESTONE | normal | Streak/level milestone |
| COMEBACK | high | Re-engagement |
| SOCIAL | low | Social features |
| BOSS | normal | Boss encounter |

### Smart Notification System
`SmartNotificationSystem.ts` manages:
- **Scheduling**: Optimal delivery times
- **Re-engagement**: Return triggers
- **Rules**: `SmartNotificationSystem.rules.ts`
- **Generators**: `SmartNotificationSystem-generators.ts`
- **Rank Reports**: `SmartNotificationSystem-rankReport.ts`

### Quiet Hours
Notifications respect quiet hours (configurable, default 22:00-08:00).

### Daily Limits
Configurable daily notification limits prevent notification fatigue.

### Retention Strategy
`retention-strategy.ts` defines re-engagement flows:
- Day 1: Gentle reminder
- Day 3: Comeback offer
- Day 7: Streak funeral
- Day 14: Fresh start

### Push Token Management
- `registerPushToken()` — Register device token with Supabase
- `push-delivery.ts` — Push delivery through Expo notifications

---

## 22. Monetization & RevenueCat

### Overview (`shared/monetization/`)

### RevenueCat Integration
- **Service**: `revenuecat-service.ts` (singleton)
- **API Keys**: Stored in env vars (EXPO_PUBLIC_REVENUECAT_IOS_KEY, EXPO_PUBLIC_REVENUECAT_ANDROID_KEY)
- **Placeholder Detection**: Blocks placeholder keys in production
- **Observer Mode**: None (full purchase handling)

### RevenueCat Status Machine
```
uninitialized → initializing → ready/missing_keys/error
```

### Entitlements
- **Known Entitlement IDs**: Defined in `entitlements.ts`
- **Premium Check**: `hasPremiumEntitlement()`
- **Access State**: active, expired, trial, none

### Paywall Strategy
Multi-layered paywall system:
1. **Contextual Paywalls** (`ContextualPaywall.ts`)
   - Triggered by specific user actions
   - Paywall moments: feature gating, streak protection, advanced study
   - Cooldown periods between shows
   - Conversion tracking

2. **Paywall State Machine** (`paywall-state-machine.ts`)
   - States: idle, loading, presenting, purchased, error, dismissed
   - Transitions: trigger, purchase, cancel, error, dismiss

3. **Value Ladder** (`value-ladder.ts`)
   - Tiered pricing with upgrade paths
   - Discount calculations for upgrades
   - Feature comparison matrices

### Tier System
| Tier | Price | Features |
|---|---|---|
| FREE | $0 | Core focus, basic coach, streaks, challenges |
| PREMIUM | TBD | Deep coach memory, advanced study, quizzes |

### Purchase Trust
`purchase-trust.ts` implements:
- Receipt verification
- Purchase hash validation
- Suspicious purchase detection
- Refund eligibility
- Price trust scoring

### Paywall Components
- `VipPaywallScreen.tsx` — Premium paywall screen
- `PaywallScreen.tsx` — Contextual paywall
- `PaywallHero.tsx` — Animated hero section
- `PaywallPlans.tsx` — Plan comparison
- `PaywallFeatureList.tsx` — Feature highlights
- `PaywallFooterActions.tsx` — Purchase/restore buttons
- `PaywallStates.tsx` — Loading/error/empty states

### Premium Strategy
`premium-strategy.ts` resolves:
- When to show premium offers
- Which features to gate
- User's premium intent level
- Conversion optimization

### RevenueCat Hooks
- `useRevenueCat()` — Full RevenueCat state
- `usePremiumStatus()` — Simplified premium check
- `usePaywall()` — Paywall state management

---

## 23. Economy System

### Overview (`features/economy/`)

A simple virtual currency system (currently minimal, most advanced features archived).

### Currencies
| Currency | Earned From | Used For |
|---|---|---|
| COINS | Sessions, challenges, achievements | Basic rewards |
| GEMS | Streak milestones, rare achievements | Premium rewards |

### Wallet
- `repository.ts` — `getOrCreateWallet(userId)`
- Returns `WalletSummary: { coins, gems }`
- Idempotent RPCs in Supabase (`economy_idempotent_rpcs.sql`)

### Economy Features (Archived)
- Advanced economy (shop, inventory, battle pass)
- Gems prominent
- Economy advanced features
- Boss bounties

---

## 24. Content Study & Study OS

### Content Study (`features/content-study/`)

A system for uploading study content and having AI generate study plans.

### Features
- **Content Upload**: Text, files, URLs
- **AI Study Plan Generation**: Via Supabase edge function
- **Content Status Tracking**: `pollContentStatus()`
- **Feedback**: Submit feedback on generated content
- **History**: `fetchContentHistory()`

### Content Study Service (`ContentStudyService.ts`)
```typescript
export {
  submitContent, extractContent, generateStudyPlan,
  getContentStatus, submitFeedback,
  uploadStudyFile, deleteStudyFile,
  fetchContentHistory, fetchContentById, fetchGenerationById,
  updateContentText, deleteContent,
  buildContentStudyTimeoutFallback, pollContentStatus,
}
```

### Study OS (`features/study-os/`)

The Study Operating System manages study plans and blocks.

### Study Block System
- **Blocks**: Named study segments (Read Chapter 3, Review Notes, Practice Problems)
- **Enhanced Block Completion**: Tracks progress within blocks
- **Recall Questions**: AI-generated recall questions
- **Session Integration**: Builds sessions from study blocks

### Study Plan Service
- `createManualStudyPlan()` — User-defined plans
- `createPasteStudyPlan()` — From pasted content
- `buildFailedGenerationFallbackPlan()` — When AI fails
- `completeStudyBlock()` / `completeStudyBlockEnhanced()` — Progress tracking

---

## 25. Onboarding System

### Overview (`features/onboarding/`)

### Onboarding Steps
1. **WELCOME** — App introduction
2. **GOAL_SETTING** — Choose focus goal (Work, Study, Creative, Personal)
3. **FOCUS_TIME** — Select preferred session duration
4. **NAME_SETUP** — Set display name
5. **FIRST_SESSION_CTA** — Start first session

### Goal Options
| Goal | Description |
|---|---|
| WORK | Meetings, emails, deep work |
| STUDY | Learning, reading, exams |
| CREATIVE | Design, writing, art |
| PERSONAL | Goals, habits, growth |

### Duration Options
10, 15, 25, 45, 60+ minutes

### Onboarding Store
Zustand store with:
- `step` — Current step number
- `goal` — Selected focus goal
- `focusDuration` — Selected duration
- `displayName` — User's name
- `completedAt` — Timestamp
- `isOnboarded` — Boolean
- `completedForUserId` — User ID for validation

### Progressive Onboarding
`ProgressiveOnboarding.ts` — Manages progressive feature introduction after onboarding.

### Onboarding Gates
`onboarding-gates.ts` — Feature gates based on onboarding completion.

### Stale State Detection
The RootNavigator detects stale onboarding state and resets or syncs from backend.

### First Session Config
`getFirstSessionConfig()` returns a session config with the user's chosen duration and category.

---

## 26. Authentication System

### Overview (`features/auth/`)

### Auth Methods
- **Email/Password**: Sign up, sign in, password reset, email verification
- **Apple OAuth**: Native Apple Sign In (`apple-oauth.ts`)
- **Google OAuth**: Via system browser (`expo-web-browser`)

### Auth Flow
```
signUp(email, password, metadata) → repository.signUpWithEmail()
    → Supabase Auth signUp
    → Validate with UserSchema
    → Return AuthResult { user, error }

signIn(email, password) → repository.signInWithEmail()
    → Supabase Auth signInWithPassword
    → Return AuthResult

startOAuthSignIn('apple'|'google') → Apple native or browser OAuth
    → completeOAuthCallback(url)
    → Return AuthResult
```

### Auth Repository
- `repository.ts` — Main auth operations
- `repository-credentials.ts` — Credential-based auth
- `repository-session.ts` — Session management
- `repository-onboarding.ts` — Onboarding state sync

### Auth Store
The auth store (`store/authStore.ts`) persists minimally:
- Only `isAuthenticated` and minimal user data
- Tokens managed by Supabase SDK in secure storage

### Auth Helpers
- `services/supabase-auth-helpers.ts` — Auth utility functions
- `services/supabase-user-mapper.ts` — User data mapping
- `services/supabaseAuth.ts` — Auth service wrapper

### Signup Guard
`store/signupGuard.ts` — Prevents duplicate signups and manages signup state.

---

## 27. Settings System

### Overview (`features/settings/`)

### Setting Categories
| Category | Settings |
|---|---|
| NOTIFICATION | Push enabled, quiet hours, notification types |
| COACH | Tone, frequency, persona |
| APPEARANCE | Theme mode, color scheme, font size |
| PRIVACY | Analytics, data sharing, retention |
| DATA_CONTROL | Export, backup, retention policy |

### Settings Architecture
```
service.ts (CRUD + caching with TTLCache)
    → settings-domain.ts (Domain-specific getters/setters)
        → getNotificationSettings(), getCoachSettings(), etc.
    → settings-validation.ts (Value validation)
    → settings-sync.ts (Background sync to Supabase)
    → repository.ts (Supabase persistence)
```

### Settings Features
- **Import/Export**: Full settings export as JSON
- **Batch Updates**: Atomic batch setting changes
- **Background Sync**: Automatic sync to Supabase
- **Caching**: 5-minute TTL cache
- **Event Emission**: `settings:change` events for reactive updates

### Available Settings Screens
1. **SettingsMain** — Main settings hub
2. **AccountSettings** — Email change, password change, 2FA, account deletion
3. **NotificationSettings** — Push toggles, quiet hours, notification categories
4. **PrivacySettings** — Analytics, data sharing, privacy toggles
5. **AppearanceSettings** — Theme picker, color scheme, font size
6. **CoachSettings** — Coach persona, tone, frequency
7. **LaneMode** — Motivation lane selection
8. **DataExport** — GDPR data export

### Settings Validation
- `validation-notification.ts` — Notification setting validation
- `validation-preference.ts` — Preference validation
- `validation-types.ts` — Shared validation types

---

## 28. Analytics System

### Overview (`shared/analytics/`)

### Analytics Stack
- **PostHog**: Primary product analytics (via `posthog-react-native`)
- **Sentry**: Error monitoring & crash reporting

### Analytics Service (`analytics-service.ts`)

```typescript
class AnalyticsService {
  // PostHog client management
  initialize(): Promise<boolean>
  capture(eventName, properties): void
  identify(userId, traits): void
  screen(screenName, properties): void
  reset(): void
  flush(): Promise<void>

  // Feature flags (PostHog)
  getFeatureFlag(key): boolean | string | undefined
  isFeatureEnabled(key): boolean
}
```

### Event Categories
| Category | Examples |
|---|---|
| Auth | SIGN_UP, SIGN_IN, SIGN_OUT, OAUTH_START |
| Session | SESSION_STARTED, SESSION_COMPLETED, SESSION_ABANDONED |
| Progression | LEVEL_UP, ACHIEVEMENT_UNLOCKED, XP_GAINED |
| Economy | COINS_EARNED, GEMS_SPENT |
| Coach | COACH_MESSAGE_SHOWN, COACH_ACTION_TAKEN |
| Feature | FEATURE_UNLOCKED, FEATURE_USED |
| Onboarding | ONBOARDING_STARTED, ONBOARDING_COMPLETED |
| Purchase | PAYWALL_SHOWN, PURCHASE_STARTED, PURCHASE_COMPLETED |
| Retention | RETURN_SESSION, COMEBACK_TRIGGERED |

### Privacy Compliance
- `privacy.ts` — Sanitizes all analytics properties
- PII stripping from event data
- Configurable analytics opt-out (`EXPO_PUBLIC_ANALYTICS_DISABLED`)

### Sentry Integration
- `sentry.ts` — Sentry initialization with privacy filters
- `sentry-privacy.ts` — User ID hashing
- `sentry-alerts.ts` — Alert thresholds for revenue, wallet, analytics failures

### Event Bus Bridge
`event-bus-bridge.ts` — Bridges internal EventBus events to PostHog analytics events.

### Analytics Events (Detailed)
- `analytics-events.ts` — 15+ event categories with typed properties
- `core-events.ts` — Core app events
- `product-events.ts` — Product feature events
- `economy-events.ts` — Economy/monetization events
- `social-events.ts` — Social feature events
- `funnel-analytics.ts` — Conversion funnel tracking
- `retention-analytics.ts` — Retention cohort analysis

### Advanced Analytics
- `advanced-analytics.ts` — Advanced tracking patterns
- `analytics-alerts.ts` — Alerting system
- `analytics-event-properties.ts` — Event property builders

---

## 29. Design System & Theme

### Theme Architecture
```
ThemeContext.tsx (React Context)
├── ThemeService.ts (Persistence, system integration, events)
├── createTheme.ts (Theme object factory)
├── themeCoreTypes.ts (Core type definitions)
└── tokens/
    ├── colors.ts (Color palette exports)
    ├── typography.ts (Font families, sizes, weights)
    ├── spacing.ts (Spacing scale)
    ├── radius.ts (Border radius values)
    ├── shadows.ts (Shadow presets)
    ├── zIndex.ts (Z-index scale)
    ├── timing.ts (Animation timing)
    ├── sizing.ts (Size scales)
    ├── opacity.ts (Opacity values)
    ├── motion.ts (Motion presets)
    ├── elevation.ts (Elevation values)
    ├── brand.ts (Brand colors)
    ├── decorative.ts (Decorative colors)
    ├── ethereal-sky.ts (Atmosphere colors)
    ├── primary-palette.ts (Light theme colors)
    ├── dark-palette.ts (Dark theme colors)
    ├── contrast-palette.ts (High contrast accessibility)
    └── hex-colors-*.ts (Color value references)
```

### Semantic Colors (64 semantic tokens)
```typescript
interface SemanticColors {
  background, backgroundElevated, backgroundMuted,
  surface, surfaceElevated, surfaceGlass,
  border, borderStrong,
  textPrimary, textSecondary, textMuted, textDisabled,
  primary, primaryPressed, primarySoft,
  secondary, accent,
  success, warning, danger, info,
  overlay, shadow,
  inputBackground, inputBorder,
  tabActive, tabInactive,
  vexCyan, vexCyanSoft, vexCyanGlow,
  vexGold, vexGoldSoft,
  obsidian,
  editorialGold, editorialGoldBorder, editorialGoldGlow,
  editorialWarmText, editorialWarmMuted, editorialMuted,
  editorialDeepBackground, editorialGradientTop, editorialGradientBottom,
  liquidNight, liquidAbyss, liquidMist,
  liquidGlass, liquidGlassStrong, liquidGlassClear,
  liquidPanel, liquidSignal,
  liquidGlassBorder, liquidGlassHighlight,
  liquidText, liquidTextSoft, liquidTextMuted,
  liquidCyan, liquidViolet, liquidOrange, liquidAmber, liquidRose, liquidLime,
  liquidShadow, liquidInput, liquidInputBorder, liquidButtonText,
  brandAmber, brandOrange, brandCoral,
  auroraMidnight, auroraDeepViolet, auroraMidViolet, auroraDarkBase,
  auroraTeal, auroraWarmLight, auroraBrightViolet, auroraAccentViolet,
  auroraEditorialGold,
  stateRescued, stateStale, stateBlocked,
  stateRescuedText, textLavender, textSoftViolet,
  scorePlatinum, scoreCelestial,
  gradeMuted,
  breakGradientDark, breakGradientMid,
  atmosphereBase1-3,
  devotionalBase, devotionalBaseCool, devotionalWarm, devotionalWarmSoft, devotionalAsh,
  // ... and more
}
```

### VEX Light Glass Tokens (June 2026 Visual Language)
A comprehensive set of tokens for the new light glass aesthetic:

```typescript
export const vexLightGlass = {
  background: {
    pageTop: '#F8FFFC',    // Very light mint
    pageMid: '#EEF8F4',    // Mid mint
    pageBottom: '#DDECE8', // Deeper mint
    atmosphericMint: 'rgba(95, 230, 197, 0.18)',
    atmosphericCyan: 'rgba(132, 228, 229, 0.16)',
    atmosphericPearl: 'rgba(255, 255, 255, 0.78)',
    atmosphericFire: 'rgba(255, 128, 32, 0.16)',
  },
  mint: { 50...900 },     // Mint green scale
  glass: {
    fillSubtle: 'rgba(255, 255, 255, 0.52)',
    fill: 'rgba(255, 255, 255, 0.7)',
    fillStrong: 'rgba(255, 255, 255, 0.84)',
    fillHero: 'rgba(255, 255, 255, 0.78)',
    card: 'rgba(255, 255, 255, 0.64)',
    border: 'rgba(255, 255, 255, 0.88)',
    shadow: 'rgba(13, 76, 65, 0.13)',
  },
  semantic: {
    success: '#18B894', warning: '#DFA44A',
    danger: '#E05E5E', info: '#54AEEA',
    accent: '#8B5CF6', fire: '#FF8427',
  },
}

export const glassMaterials = {
  pane: { background, border, shadow, elevation, radius },
  paneStrong: { stronger version },
  hero: { largest glass surface },
  nav: { navigation bar glass },
  tabPill: { active tab indicator },
}

export const glassMotion = {
  screenEnter: { duration: 420, easing: 'easeOutCubic' },
  cardEnter: { duration: 360, stagger: 45 },
  pressDownScale: 0.985,
  pressUpSpring: { damping: 18, stiffness: 180 },
  selectedPillSpring: { damping: 20, stiffness: 220 },
  progressSpring: { damping: 18, stiffness: 130 },
}

export const glassRadius = {
  screenHero: 32, cardLg: 28, card: 24,
  cardSm: 20, pill: 999, tabBar: 30,
  orb: 22, sheetTop: 32,
}
```

### Theme Service (`ThemeService.ts`)
- MMKV persistence for user theme preference
- System dark mode detection via `Appearance` API
- Theme change events via EventBus
- Supports: light, dark, system

---

## 30. Glass UI Components

### Glass Component Library (`components/glass/`)

The project has a comprehensive glass morphism UI library with **30+ components**:

| Component | Description |
|---|---|
| **GlassScreen** | Full glass screen wrapper |
| **GlassCard** | Glass card with edge and gradient variants |
| **GlassPill** | Pill-shaped glass container |
| **GlassPillSurface** | Surface for pill content |
| **GlassIconOrb** | Circular glass icon container |
| **GlassProgressBar** | Glass progress indicator |
| **GlassRibbon** | Ribbon-shaped glass element |
| **GlassBlurLayer** | Blur effect layer |
| **GlassTextureOverlay** | Texture overlay for depth |
| **CrystalAvatar** | Crystal glass avatar |
| **FloatingDroplets** | Animated floating particles |
| **EmptyStateLens** | Empty state with glass lens effect |
| **LiquidButton** | Button with liquid glass effect |
| **LiquidGlassSphere** | 3D glass sphere |
| **LiquidLens** | Lens distortion effect |
| **LiquidProgressBar** | Liquid-filled progress bar |
| **WaterBubble** | Water bubble animation |
| **VexAssetImage** | Branded image with glass overlay |

### Sub-Components
- `GlassCard.edges.tsx` — Edge glow effects
- `GlassCard.gradients.tsx` — Gradient presets
- `GlassCard.tokens.ts` — Glass card design tokens
- `LiquidButton.effects.tsx` — Button animation effects
- `LiquidButton.tokens.ts` — Button design tokens
- `LiquidGlassObject.bubble.tsx` — Bubble variant
- `LiquidGlassObject.gem.tsx` — Gem variant
- `LiquidGlassObject.lens.tsx` — Lens variant
- `LiquidGlassObject.orb.tsx` — Orb variant
- `LiquidGlassObject.ribbon.tsx` — Ribbon variant
- `LiquidGlassObject.swirl.tsx` — Swirl variant
- `LiquidGlassSphere.defs.tsx` — SVG definitions
- `LiquidGlassSphere.tokens.ts` — Sphere tokens

### Native Glass Components (`components/glass/native/`)
New native glass primitives built on `expo-glass-effect`:

| Component | Description |
|---|---|
| **NativeGlassSurface** | Native iOS glass surface |
| **NativeGlassContainer** | Container with glass background |
| **GlassSheetBackground** | Sheet modal glass background |
| **NativeGlassOverlay** | Glass overlay effect |

### Liquid Glass UI (`shared/ui/liquid-glass/`)
- `LiquidGlassCard.tsx` — Liquid glass card component
- `LiquidGlassScreen.tsx` — Liquid glass screen wrapper
- `LiquidGlassHeader.tsx` — Header with liquid glass
- `FocusCrystalAsset.tsx` — Focus crystal visualization
- `SessionGlyphs.tsx` — Session-themed glyphs

### Atmosphere Components (`components/atmosphere/`)
- `VexMeshAtmosphere.tsx` — Animated mesh gradient background
- `atmosphereTokens.ts` — Atmosphere design tokens

### Primitives (`components/primitives/`)
- `Box`, `Text`, `Button`, `Card`, `Stack`, `HStack`, `VStack`, `Center`
- `AppScreen`, `FeatureScreen` — Screen templates
- `AuroraField` — Aurora background effect
- `BreathingGlow` — Pulsing glow animation
- `ShimmerSweep` — Shimmer loading effect
- `PremiumBackdrop` — Premium screen backdrop
- `PrivacyBlurOverlay` — Privacy blur for app switcher
- `VexLaunchButton` — Branded launch button
- `VexMotionSurface` — Animated motion surface

### Loading States (`components/states/`)
- `Loading.tsx` — Spinner with label
- `LoadingState.tsx` — Full loading state
- `FullScreenLoader.tsx` — Full screen loading
- `InlineLoader.tsx` — Inline loading indicator
- `Skeleton.tsx`, `SkeletonCard.tsx`, `SkeletonLines.tsx` — Skeleton UI
- `Dots.tsx`, `Pulse.tsx` — Animated loading indicators
- `loading-variants.tsx` — Loading variant presets

---

## 31. Supabase Backend

### Database
- **Type**: PostgreSQL (via Supabase)
- **Client**: `@supabase/supabase-js` v2.103.3
- **Types**: Auto-generated in `src/types/supabase.ts` via `npm run types:supabase`

### Supabase Client (`config/supabase.ts`)
- **Lazy initialization**: Uses JavaScript Proxy to defer client creation
- **Mock fallback**: Falls back to mock client in Jest or when createClient fails
- **Secure storage**: Auth tokens stored in expo-secure-store
- **Custom headers**: `X-Client-Info`, `X-Platform` for analytics
- **Session management**: Auto-refresh, session persistence via secure storage

### Configuration
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` from environment variables
- Test config from `TEST_CONSTANTS` in Jest

### Error Handling
- `handleSupabaseError()` — Converts Supabase errors to standard Error
- `isSupabaseConfigured()` — Check before operations
- `resetSupabaseClient()` — For testing/auth changes

### Realtime
- Supabase Realtime for live data (notifications, session updates)
- Every channel subscription has corresponding unsubscribe in useEffect cleanup

---

## 32. Edge Functions

### Edge Function Directory
```
supabase/functions/
├── ai/                    # Main AI inference endpoint
├── ai-coach/              # Coach-specific AI logic
├── content-study/         # Content analysis & study plan generation
├── session-complete/      # Post-session processing pipeline
├── trigger-jobs/          # Scheduled/cron trigger jobs
├── season-finalize/       # Season completion processing
└── _shared/               # Shared utilities across functions
```

### Edge Function Capabilities
- **ai/**: Gemini 2.5 Flash/Pro inference, prompt construction, safety filtering
- **ai-coach/**: Coach message generation, session summary, comeback prompts, streak nudges, agent decisions
- **content-study/**: Content extraction, study plan generation, quiz generation
- **session-complete/**: Complex post-session processing (XP, streaks, achievements, economy)
- **trigger-jobs/**: Scheduled jobs (daily/weekly resets, streak checks, notifications)
- **season-finalize/**: Season completion rewards and progression

### AI Request Flow
```
Client → edge-function-service.ts → Supabase Edge Function
    → Gemini API (via Google AI SDK)
    → Response parsing & validation
    → Return structured response
```

All AI calls happen **server-side only** — no API keys in client code.

---

## 33. Database Migrations

### Migration List (30+ migrations)

| Migration | Date | Description |
|---|---|---|
| `20260609_search_path_hardening` | Jun 9 | Security: Search path hardening |
| `20260610_search_path_hardening_fix` | Jun 10 | Fix for search path hardening |
| `202606160001_auth_session_policy_hardening` | Jun 16 | Auth session policy hardening |
| `202606160002_security_advisor_sweep` | Jun 16 | Security advisor recommendations |
| `202606160003_rpc_and_orphan_rls_hardening` | Jun 16 | RPC and orphan RLS hardening |
| `202606160004_policy_guard_and_public_execute_revoke` | Jun 16 | Policy guard, revoke public execute |
| `202606160005_revoke_authenticated_definer_rpc` | Jun 16 | Revoke authenticated definer RPCs |
| `202606160006_cover_unindexed_foreign_keys` | Jun 16 | Cover unindexed foreign keys |
| `202606160007_reduce_permissive_policy_overlap` | Jun 16 | Reduce permissive policy overlap |
| `202606160008_cleanup_fk_indexes` | Jun 16 | Cleanup FK indexes |
| `202606160009_optimize_auth_rls_initplan` | Jun 16 | Optimize auth RLS initplan |
| `202606160010_optimize_rate_limit_rls` | Jun 16 | Optimize rate limit RLS |
| `202606160011_revert_search_path_hardening` | Jun 16 | Revert search path hardening |
| `202606160012_add_economy_rpcs` | Jun 16 | Add economy RPCs |
| `202606160013_content_study_provenance` | Jun 16 | Content study provenance tracking |
| `20260618030727_release_admin_helper` | Jun 18 | Release admin helper |
| `20260618030819_release_admin_policies_and_flags_v2` | Jun 18 | Admin policies and flags v2 |
| `20260618030831_revoke_public_economy_definer_rpcs` | Jun 18 | Revoke public economy definer RPCs |
| `20260618030924_advisor_tighten_admin_anonymous_and_helper_execute` | Jun 18 | Tighten admin/anonymous execute |
| `20260618031017_advisor_tighten_onboarding_profiles_anonymous` | Jun 18 | Tighten onboarding/profiles |
| `20260618031122_cascade_wallets_on_user_delete` | Jun 18 | Cascade wallets on user delete |
| `202606230001_coach_memory_vectors` | Jun 23 | Coach memory vectors (pgvector) |
| `20260623183000_create_capture_and_plan_tables` | Jun 23 | Create capture & plan tables |
| `20260623184020_harden_capture_plan_anonymous_policies` | Jun 23 | Harden capture/plan policies |
| `20260623184221_advisor_cleanup_rls_policies` | Jun 23 | Cleanup RLS policies |
| `20260623193035_db_contracts_idempotency` | Jun 23 | DB contracts idempotency |
| `20260623193037_vector_memory_session_events` | Jun 23 | Vector memory session events |
| `20260623193038_materialized_stats_economy_rls_gate` | Jun 23 | Materialized stats, economy RLS |
| `20260623193100_economy_idempotent_rpcs` | Jun 23 | Economy idempotent RPCs |

### Key Migration Patterns
- **Row Level Security (RLS)**: Extensive RLS policies on all tables
- **Idempotency**: Idempotent RPCs for economy operations
- **Vector Search**: pgvector extension for coach memory vectors
- **Cascade Deletes**: Proper cascade on user deletion
- **Materialized Views**: For performance-critical stats

---

## 34. Event System

### EventBus Architecture (`events/`)

```
EventBus (Singleton pub/sub)
├── EventEmitter (Low-level event emitter)
├── EventTypes (Typed event channels)
├── EventSchemas (Event validation schemas)
├── EventService (Event persistence)
└── event-definitions/
    ├── analytics.ts
    ├── challenges.ts
    ├── coach.ts
    ├── economy.ts
    ├── integration.ts
    ├── notification.ts
    ├── progression.ts
    ├── session.ts
    ├── social.ts
    └── streak.ts
```

### Event Channels (Partial List)
- `notification:send` — Trigger push notification
- `challenge:progress` — Challenge progress update
- `achievement:unlocked` — Achievement unlocked
- `economy:add-currency` — Add coins/gems
- `progression:add-xp` — Add XP
- `rewards:badge-granted` — Grant badge
- `rewards:title-granted` — Grant title
- `rewards:cosmetic-unlocked` — Unlock cosmetic
- `session:completed` — Session completed
- `settings:change` — Setting changed
- `settings:reset` — Settings reset
- `theme:change` — Theme changed
- `FOCUS_SCORE_UPDATED` — Focus score changed
- `FOCUS_SCORE_BAND_CHANGE` — Score band changed
- `FOCUS_RECOVERY_COMPLETE` — Recovery completed
- `FOCUS_IDENTITY_CREATED` — Identity profile created

### EventBus Features
- **Typed channels**: Full TypeScript type safety
- **Async publish**: `publishAsync()` for async handlers
- **Wait for events**: `waitFor(channel, timeout)` — Promise-based
- **Event history**: Optional event history for debugging
- **Subscriber count**: `subscriberCount(channel)`
- **Active channels**: `getActiveChannels()`

---

## 35. Feature Flags & LiveOps Config

### Overview (`features/liveops-config/`)

The LiveOps config system manages feature rollout, gating, and health monitoring.

### Feature Release States
| State | Description |
|---|---|
| `final_release_core` | Core feature, always available |
| `final_release_progressive` | Progressive unlock based on sessions |
| `final_release_deactivated` | Permanently disabled |
| `premium_gated` | Requires premium subscription |
| `archived` | Removed from app |

### Feature Build Order
```
1. focus_session → 2. home_tab → 3. focus_tab → 4. profile_tab →
5. progress_view → 6. ai_coach_basic → 7. companion_detail →
8. challenges → 9. economy_basic → 10. achievements →
11. boss_tab → 12. ai_coach_advanced → 13. content_study →
14. quiz_review_mode → 15. advanced_settings →
16. seasonal_features → 17. content_study_advanced →
18. premium_paywall → 19+ (social/economy/archived)
```

### Disabled Features (14 total)
`squads, social_tab, rivals, rankings, wagers, gems_prominent, battle_pass, boss_bounties, economy_advanced, economy_basic, inventory, seasonal_features, shop, streak_insurance`

### Final Release Map
| Feature | Status |
|---|---|
| focus_session | included |
| home_tab, focus_tab, profile_tab | included |
| progress_view | included |
| ai_coach_basic | included |
| companion_detail | included |
| content_study | included |
| advanced_settings | included |
| achievements | progressive (3 sessions) |
| challenges | progressive (5 sessions) |
| boss_tab | progressive (1 session, subtle for calm/study) |
| ai_coach_advanced | premium_gated |
| content_study_advanced | premium_gated |
| quiz_review_mode | premium_gated |
| premium_paywall | progressive (5+ sessions, hidden if RevenueCat unavailable) |
| economy_basic | hidden |
| (14 more features) | hidden |

### Degraded Surfaces
When features are degraded, specific surfaces are blocked:
- `content_study` degraded → blocks study_layer, upload_cta, content_generation
- `ai_coach_advanced` degraded → blocks advanced_coach_cta, deep_intervention
- `premium_paywall` degraded → blocks premium_tease, purchasable_plan, paywall
- `boss_tab` degraded → blocks boss_full_cta, boss_combat, boss_route

### Feature Health Checks
- RevenueCat health check (API key validity)
- Feature flag health check
- Boss system health
- Deferred feature health

### Feature Access System
`feature-access.ts` resolves:
- `getProductTier(stage, sessions)` → CORE_EXECUTION / COACHING / STUDY_OS / RPG_DEPTH / SOCIAL_DEPTH
- `getStage(sessions)` → NEW_USER / ACTIVATING / ENGAGED / POWER_USER
- `buildFeatureAccess()` → Full feature access map
- Per-feature availability: canNavigate, canQuery, canRenderEntryPoint, etc.

---

## 36. Persistence Layer

### Storage Adapters

| Adapter | Backend | Use Case |
|---|---|---|
| **MMKVStorage** (`MMKVStorage.ts`) | react-native-mmkv | Fast key-value storage |
| **SecureStorage** (`SecureStorage.ts`) | expo-secure-store | Auth tokens, secrets |
| **MMKVProvider** (`MMKVProvider.ts`) | MMKV | Provider wrapper |
| **MMKVStorageAdapter** (`MMKVStorageAdapter.ts`) | MMKV | Zustand persist adapter |
| **StorageManager** (`StorageManager.ts`) | Unified | High-level storage orchestration |
| **PersistenceService** (`PersistenceService.ts`) | Combined | Service-level persistence |

### MMKV Encryption
- Encryption key initialized in `bootstrap.ts` via `getMmkvEncryptionKey()`
- Stored in `mmkv-key.ts`

### Session Persistence (`session/Persistence.ts`)
- Active session state persisted to MMKV for crash recovery
- Timer state serialization/deserialization
- Recovery state tracking

### Offline Queue (`lib/offline/queue.ts`)
- Queue operations when offline
- Auto-processing when online
- Queue length tracking
- Feature-specific queues (sessions, etc.)

---

## 37. Network & Offline Support

### NetInfo Adapter (`network/NetInfoAdapter.ts`)
- Wraps `@react-native-community/netinfo`
- Tracks online/offline state
- Initializes on app startup

### Request Queue (`network/RequestQueue.ts`)
- Queues API requests when offline
- Auto-retry when connectivity returns
- Configurable retry strategies

### Offline-Aware Mutations
`useOfflineAwareMutation` hook:
- Queues mutations when offline
- Optimistic UI updates
- Background sync on reconnect

### Session Offline Sync (`features/session-completion/offline-sync-*`)
- `offline-sync-service.ts` — Manages offline session sync
- `offline-sync-storage.ts` — Local storage of pending completions
- `offline-sync-types.ts` — Type definitions
- `offline-sync-processors.ts` — Process pending completions

---

## 38. Error Handling & Resilience

### Error Boundary System (`errors/`)
```
ErrorBoundary (Root-level)
├── ErrorFallback (User-facing error UI)
├── ErrorBoundary.helpers.ts
├── ErrorBoundary.types.ts
├── globalErrorHandlers.ts (Unhandled promise/error capture)
└── screen-error-*.ts (Per-screen error configs)
```

### Resilience Patterns (`shared/hardening/`)
- **Cache** (`cache.ts`): TTL-based caching
- **Circuit Breaker** (`circuit-breaker.ts`): Prevents cascading failures
- **Retry** (`retry.ts`): Configurable retry with backoff
- **Timing** (`timing.ts`): Operation timing/monitoring
- **Error Utils** (`error-utils.ts`): Error classification

### API Resilience (`api/`)
- **Circuit Breaker** (`circuit-breaker.ts`): API-level circuit breaking
- **Retry** (`retry.ts`): Automatic retry with exponential backoff
- **Deduplicator** (`deduplicator.ts`): Prevent duplicate API requests

### Sentry Integration
- All unexpected errors captured via Sentry
- Privacy-aware: user IDs hashed, PII stripped
- Breadcrumbs for important operations
- Alert thresholds for critical failures

---

## 39. Performance & Cold Start

### Cold Start Performance (`app/cold-start-performance.ts`)
- Tracks cold start milestones:
  - `app_mounted`
  - `root_navigator_ready`
  - `home_rendered`
- Performance monitoring via `utils/performance-monitor.ts`

### Performance Gate (`performance/PerformanceGate.ts`)
- Evaluates device performance
- Adjusts animation complexity
- Reduces effects on low-end devices

### Reduced Motion
- `useReducedMotion()` hook checks system preference
- Animations simplified or skipped when enabled

### Metro Optimizations
- **Shims**: 35+ shims prevent native module crashes in dev builds
- **Package Exports**: `unstable_enablePackageExports` for Zod
- **Supabase CJS Fallback**: Forces CJS entry for @supabase/* packages
- **Asset Exts**: `.cjs` added to asset extensions

---

## 40. Accessibility & Internationalization

### Accessibility (`shared/accessibility/`)
- **a11y.ts**: Accessibility utility functions
- **contrast-checker.ts**: WCAG contrast ratio checking
- **contrast.ts**: Contrast calculation
- **i18n.ts**: Internationalization utilities
- **rtl.ts**: Right-to-left layout support

### Translations (`shared/accessibility/translations/`)
- `en.ts` — English
- `es.ts` — Spanish
- `fr.ts` — French
- `de.ts` — German
- `ja.ts` — Japanese
- `ar.ts` — Arabic
- `he.ts` — Hebrew

### Accessibility Rules (from AGENTS.md)
- All interactive elements: `accessibilityLabel`, `accessibilityRole`, `accessibilityHint`
- Minimum touch target: 44×44 points
- `useReducedMotion()` check before animations

---

## 41. Testing Architecture

### Test Configuration
- **Runner**: Jest with Expo preset
- **E2E**: Detox (`e2e/.detoxrc.js`)
- **Playwright**: `playwright.config.ts` (for web testing)

### Test Structure
```
__tests__/ (root-level integration tests)
├── helpers/           # Test helpers
│   ├── clean-mode-polish/
│   ├── lane-polish/
│   ├── risk-coverage/
│   ├── no-direct-lane-inference/
│   └── lane-test-helpers.ts
├── journey/           # User journey tests
├── product-journey-*/ # Product journey tests
├── integration/       # Integration tests
├── smoke/             # Smoke tests
├── setup/             # Test setup
└── mocks/             # Mock implementations
```

### Test Categories
| Category | Location | Count |
|---|---|---|
| Unit Tests | `**/__tests__/**.test.ts` | 200+ |
| Integration Tests | `__tests__/integration/` | 10+ |
| Journey Tests | `__tests__/journey/` | 12+ |
| Product Journey | `__tests__/product-journey-*/` | 20+ |
| Lane Tests | `__tests__/helpers/lane-*/` | 15+ |
| Risk Coverage | `__tests__/helpers/risk-coverage/` | 7 |
| E2E | `e2e/` | Detox-based |

### Jest Mocks
- 20+ mock files in `src/__tests__/mocks/`
- Mock Supabase client in test mode
- Mock native modules (expo-blur, expo-glass-effect, expo-mesh-gradient, expo-haptics, etc.)

### Key Test Files
- `session/__tests__/` — 30+ session system tests
- `session/integration/__tests__/` — 20+ session integration tests
- `session/engines/__tests__/` — Engine unit tests
- `store/__tests__/` — State management tests
- `shared/monetization/__tests__/` — 15+ monetization tests
- `shared/ai/__tests__/` — AI system tests
- `navigation/__tests__/` — 15+ navigation tests

### E2E Tests
- `e2e/onboarding.spec.ts` — Onboarding flow
- `e2e/flows/auth-flow.test.ts` — Authentication flow
- `src/e2e/first-7-days-flow.test.ts` — First week user journey
- `src/e2e/real-device-proof.test.ts` — Real device verification

---

## 42. Security

### Supabase RLS
- Extensive Row Level Security policies on all database tables
- 30+ security-focused migrations hardening the database
- Public execute revoked on sensitive functions
- Definer-privilege RPCs tightly controlled

### Secure Storage
- Auth tokens stored exclusively in `expo-secure-store`
- MMKV encrypted with runtime key
- No sensitive data in MMKV

### API Security
- All Supabase calls via RLS-protected queries
- No raw SQL in client code
- All inputs validated via Zod schemas

### Privacy
- `PrivacyInventory.ts` — Documents all data collection
- `sentry-privacy.ts` — Hashes user IDs before sending to Sentry
- `analytics/privacy.ts` — Strips PII from analytics

### Code Security Rules
- No `console.log` in production (uses logger/Sentry)
- No `@ts-nocheck` or `@ts-ignore`
- No raw `fetch()` — uses API client
- Supabase queries only in repository.ts

---

## 43. Screens Directory

### Home Screens (`screens/home/`)
- **HomeScreen.tsx** — Main home screen
- **FocusScreen.tsx** — Focus tab screen
- **HomeHero.tsx** — Hero section with session CTA
- **HomeHero.helpers.tsx** — Hero layout helpers
- **HomeScreenCards.tsx** — Card layout system
- **HomeScreenVisuals.tsx** — Visual effects
- **HomeProgressiveBlocks.tsx** — Progressive content blocks
- **ContentStudyHeroCard.tsx** — Study content card
- **ContentStudyStates.tsx** — Study content states
- **GradientStartButton.tsx** — Animated start button
- **HistoryCard.tsx** — Session history card
- **RecentSessionsEmpty.tsx** — Empty history state
- **buildInterventionSessionParams.ts** — Build session from coach intervention

### Session Screens (`screens/session/`)
- **SessionSetupScreen.tsx** — Session configuration
- **ActiveSessionScreen.tsx** — Active session display
- **SessionCompleteScreen.tsx** — Post-session results
- **SessionHistoryScreen.tsx** — Session history list
- **ActiveSessionContent.tsx** — Active session content
- **ActiveSessionBottomControls.tsx** — Bottom controls
- **SessionQuickStartCard.tsx** — Quick start card
- **SessionNotices.tsx** — Session notices/warnings
- **OfflineBanner.tsx** — Offline indicator

### Profile Screens (`screens/profile/`)
- **ProfileScreen.tsx** — Main profile screen
- **AchievementsScreen.tsx** — Achievements display
- **MasteryScreen.tsx** — Mastery display
- **MemoryConsoleScreen.tsx** — Focus memory console
- **ProfileHeader.tsx** — Profile header
- **ProfileStatsTab.tsx** — Stats tab
- **ProfileAchievementsTab.tsx** — Achievements tab
- **ProfileActivityTab.tsx** — Activity tab
- **ProfileMasterySheet.tsx** — Mastery bottom sheet
- **MasteryHeader.tsx** — Mastery header
- **MasteryTechniqueGrid.tsx** — Technique grid
- **MasteryChallengesList.tsx** — Challenge list
- **AchievementCategorySection.tsx** — Category sections
- **AchievementProgressBar.tsx** — Progress bars
- **AchievementSearchFilter.tsx** — Search/filter

### Settings Screens (`screens/settings/`)
- **SettingsScreen.tsx** — Main settings
- **AccountSettingsScreen.tsx** — Account management
- **NotificationSettingsScreen.tsx** — Notification preferences
- **PrivacySettingsScreen.tsx** — Privacy controls
- **AppearanceSettingsScreen.tsx** — Theme/font settings
- **CoachSettingsScreen.tsx** — Coach configuration
- **LaneModeSettingsScreen.tsx** — Lane mode selection
- **DataExportScreen.tsx** — Data export
- Various sub-components (theme picker, toggles, etc.)

### Auth Screens (`screens/auth/`)
- **LoginScreen.tsx** — Login form
- **RegisterScreen.tsx** — Registration form
- **ForgotPasswordScreen.tsx** — Password reset request
- **ResetPasswordScreen.tsx** — Password reset
- **VerifyEmailScreen.tsx** — Email verification

### Paywall Screens (`screens/paywall/`)
- **PaywallScreen.tsx** — Main paywall
- **PaywallHero.tsx** — Hero section
- **PaywallPlans.tsx** — Plan comparison
- **PaywallFeatureList.tsx** — Feature list
- **PaywallFooterActions.tsx** — Purchase actions
- **PaywallStates.tsx** — Loading/error states
- **VipPaywallScreen.tsx** — VIP paywall (via shared/monetization)

### Other Screens
- **BossScreen.tsx** — Boss encounter screen
- **ChallengesScreen.tsx** — Challenges display
- **CompanionDetailScreen.tsx** — Companion detail
- **NotificationsScreen.tsx** — Notification center
- **AnalyticsScreen.tsx** — Analytics dashboard
- **PlanScreen.tsx** — Plan/task management
- **ProgressScreen.tsx** — Progress overview
- **ComebackScreen.tsx** — Comeback/recovery
- **StreakFuneralScreen.tsx** — Streak funeral
- **OnboardingFlowScreen.tsx** — Onboarding flow

---

## 44. Complete Feature Catalog

### Active Core Features (Final Release)
| # | Feature | Directory | Status |
|---|---|---|---|
| 1 | Focus Sessions | `features/session/`, `session/` | Core |
| 2 | AI Coach (Basic) | `features/ai-coach/` | Core |
| 3 | Streaks | `features/streaks/` | Core |
| 4 | Achievements | `features/achievements/` | Progressive |
| 5 | Challenges | `features/challenges/` | Progressive |
| 6 | Companion | `features/companion/` | Progressive |
| 7 | Content Study | `features/content-study/` | Progressive |
| 8 | Study OS | `features/study-os/` | Progressive |
| 9 | Notifications | `features/notifications/` | Core |
| 10 | Settings | `features/settings/` | Core |
| 11 | Onboarding | `features/onboarding/` | Core |
| 12 | Authentication | `features/auth/` | Core |
| 13 | Progression/XP | `features/progression/` | Core |
| 14 | Mastery | `features/mastery/` | Progressive |
| 15 | Economy (Basic) | `features/economy/` | Core |
| 16 | Home Experience | `features/home-experience/` | Core |
| 17 | Home Spine | `features/home-spine/` | Core |
| 18 | Personalization | `features/personalization/` | Core |
| 19 | Lane Engine | `features/lane-engine/` | Core |
| 20 | Focus Identity | `features/focus-identity/` | Core |
| 21 | Coach Presence | `features/coach-presence/` | Core |
| 22 | Session Completion | `features/session-completion/` | Core |
| 23 | Session Start | `features/session-start/` | Core |
| 24 | Session Recommendation | `features/session-recommendation/` | Core |
| 25 | Session Events | `features/session-events/` | Core |
| 26 | Session History | `features/session-history/` | Core |
| 27 | Monetization | `features/monetization/` | Progressive |
| 28 | Boss/Blocker | `features/boss/` | Progressive |
| 29 | Focus Contract | `features/focus-contract/` | Active |
| 30 | Focus Memory | `features/focus-memory/` | Active |
| 31 | Focus Profile | `features/focus-profile/` | Active |
| 32 | Focus Run | `features/focus-run/` | Active |
| 33 | Project Focus | `features/project-focus/` | Active |
| 34 | Rescue Mode | `features/rescue-mode/` | Active |
| 35 | Retention Loop | `features/retention-loop/` | Active |
| 36 | Today System | `features/today-system/` | Active |
| 37 | Plan (Capture/Plan) | `features/plan/` | New |
| 38 | Capture | `features/capture/` | New |
| 39 | Invisible Agent | `features/invisible-agent/` | New |
| 40 | VEX Actions | `features/vex-actions/` | Active |
| 41 | LiveOps Config | `features/liveops-config/` | Core |
| 42 | Feature Gate | `features/feature-gate/` | Core |
| 43 | Weekly Intelligence | `features/weekly-intelligence/` | Active |
| 44 | Monthly Report | `features/monthly-report/` | Active |
| 45 | Personal Bests | `features/personal-bests/` | Active |
| 46 | Mode Native | `features/mode-native/` | Active |
| 47 | Mode Retention | `features/mode-retention/` | Active |
| 48 | Lane Home | `features/lane-home/` | Active |
| 49 | Themes | `features/themes/` | Active |
| 50 | Notification Policy | `features/notification-policy/` | Active |
| 51 | Reward Ledger | `features/reward-ledger/` | Active |
| 52 | Rewards | `features/rewards/` | Active |
| 53 | Unlock Explainer | `features/unlock-explainer/` | Active |
| 54 | Unlock System | `features/unlock-system/` | Active |
| 55 | Learning Execution | `features/learning-execution/` | Active |
| 56 | Study Intelligence | `features/study-intelligence/` | Active |
| 57 | Memory Candidate | `features/memory-candidate/` | Active |
| 58 | Integration | `features/integration/` | Core |
| 59 | Account Deletion | `features/account-deletion/` | Core |
| 60 | Analytics (Feature) | `features/analytics/` | Active |
| 61 | Companion Promise | `features/companion-promise/` | Active |

### Archived/Disabled Features
- `squads` — Guild/team system
- `social_tab` — Social features
- `rivals` — Competitive rivalries
- `rankings` — Leaderboards
- `wagers` — Betting system
- `gems_prominent` — Premium currency prominence
- `battle_pass` — Season battle pass
- `boss_bounties` — Boss bounty rewards
- `economy_advanced` — Advanced economy
- `inventory` — Item inventory
- `seasonal_features` — Seasonal systems
- `shop` — In-app shop
- `streak_insurance` — Paid streak protection

---

## 45. Key Architectural Decisions

### 1. Lazy Supabase Client via Proxy
The Supabase client is lazily initialized using a JavaScript Proxy. This prevents crashes from missing config before error boundaries mount.

### 2. Metro Shims for Dev Builds
35+ shim modules prevent native module crashes in Expo Go and remote debug builds. Production builds resolve real native modules.

### 3. Feature Architecture Enforcement
All features follow a strict pattern: types → schemas → repository → service → hooks → components. Data only flows in one direction.

### 4. Zustand + TanStack Query Separation
- Zustand: Persistent client state (auth, preferences)
- TanStack Query: Server state (all Supabase data)
- Never mix server state into Zustand

### 5. Zod as Source of Truth
All types inferred from Zod schemas via `z.infer<>`. No hand-written types that mirror schemas.

### 6. EventBus for Cross-Cutting Concerns
A singleton EventBus connects features without direct coupling. Features publish/subscribe to typed channels.

### 7. Session Completion as Four-Layer Pipeline
1. Local receipt (always succeeds)
2. Supabase persistence (with offline fallback)
3. Subsystem application (XP, streaks, achievements)
4. Personalization updates and side effects

### 8. AI via Edge Functions Only
All AI API keys are server-side. Client calls Supabase Edge Functions which proxy to Gemini.

### 9. Feature Flag System with Health Checks
LiveOps config manages feature rollout with health checks for RevenueCat, boss system, and degraded surfaces.

### 10. Glass UI Migration (Ongoing)
Migrating from dark obsidian aesthetic to light glass (mint/pearl) with `expo-glass-effect` native components.

---

## 46. Technical Debt & Risks

### Known Issues
1. **Boss System Archival**: The boss system has been archived but the screen components and some integration code remain. Many boss service functions are stubbed returning null/0.

2. **Large Feature Count**: 60+ features create complexity. Several features overlap (e.g., focus-identity, focus-memory, focus-profile, focus-run, focus-contract).

3. **Part File Policy**: The AGENTS.md explicitly bans `.part-N.ts` files, suggesting past issues with file splitting.

4. **Supabase CJS Interop**: The Metro config has a fallback for Supabase CJS resolution, indicating ongoing ESM/CJS interop issues.

5. **Placeholder API Keys**: RevenueCat has placeholder key detection to prevent silent IAP failures.

6. **Glass UI Migration**: In progress — some screens still use dark theme, others use light glass.

7. **Archived Features in Code**: Several archived features (boss, economy advanced, social, battle pass) have code still present in the codebase.

### Debt Tracking
- `.debt-baseline/` — Tracks known technical debt items
- `as-any.json` — `as any` cast occurrences
- `as-unknown-as.json` — `as unknown as` patterns
- `component-query.json` — Components with direct queries
- `line-limit.json` — Files exceeding 200-line limit
- `part-n.json` — Files violating part-N policy
- `supabase-leak.json` — Supabase queries outside repositories

### Build Scripts (`scripts/`)
- `check-banned-patterns.js` — Scans for banned patterns
- `check-debt-freeze.js` — Debt freeze enforcement
- `check-line-limit.js` — File line limit check
- `check-no-ts-nocheck.js` — No @ts-nocheck check
- `check-rls.js` — RLS policy verification
- `check-eas-production-secrets.js` — EAS secrets check
- `performance-audit.js` — Performance auditing
- `replace-select-star.js` — Select * detection
- `generate-supabase-types.js` — Type generation

---

## Appendix A: Key Constants

### App Constants (`constants/app.ts`)
- Version from `app.json`
- Supabase URL and anon key from env
- RevenueCat keys from env
- PostHog key and host from env

### Feature Constants (`constants/features.ts`, `feature-defaults.ts`, `feature-flags.ts`, `feature-metadata.ts`)
- Feature build order
- Default unlock thresholds
- Feature metadata (names, descriptions)

### API Constants (`constants/api.ts`)
- API timeout: 10s default
- Retry config: 3 retries, exponential backoff
- Circuit breaker thresholds

### Storage Keys (`constants/storage.ts`)
- Organized storage key constants for MMKV and SecureStorage

### Haptics Constants (`constants/haptics.ts`)
- Named haptic patterns mapped to `expo-haptics` impact types

### Routes (`constants/routes.ts`)
- All route name constants

---

## Appendix B: Environment Variables

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat iOS API key |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | RevenueCat Android API key |
| `EXPO_PUBLIC_POSTHOG_KEY` | PostHog project API key |
| `EXPO_PUBLIC_POSTHOG_HOST` | PostHog host URL |
| `EXPO_PUBLIC_ANALYTICS_DISABLED` | Disable analytics |
| `EXPO_PUBLIC_ANALYTICS_FORCE_ENABLE` | Force analytics in dev |
| `EXPO_PUBLIC_APP_VERSION` | App version override |

---

---

# ⚡ AGENT QUICK REFERENCE (For AI Agents)

> **Purpose:** This section is designed for overnight AI agents (Hermes) to quickly locate files, run commands, understand import patterns, and avoid common pitfalls. Every path is relative to the project root.

---

## AQ1: ALL COMMANDS (Exactly What to Type)

### Development
```bash
# Start Expo dev server
npx expo start

# Start with dev client (for native modules)
npx expo start --dev-client

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Web
npx expo start --web
```

### Type Checking & Linting
```bash
# Full TypeScript check (NO emit — just type validation)
npx tsc --noEmit

# Lint all source files
npx eslint src --ext .ts,.tsx

# Auto-fix lint issues
npx eslint src --ext .ts,.tsx --fix
```

### Testing
```bash
# Run ALL tests
npm test

# Run a single test file (with pattern match)
npx jest --config jest.config.js --testPathPattern="session"

# Run a specific test file
npx jest --config jest.config.js path/to/file.test.ts

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests (Detox)
npm run test:e2e
```

### Code Quality Checks
```bash
# Check file line limits (must be ≤200 lines)
npm run check:line-limit

# Check banned patterns (any, ts-nocheck, console.log)
npm run check:banned-patterns

# Check for @ts-nocheck
npm run check:no-ts-nocheck

# Check RLS policies
npm run check:rls

# Check debt freeze
npm run check:debt-freeze

# Performance audit
npm run perf:audit
```

### Supabase
```bash
# Regenerate TypeScript types from database schema
npm run types:supabase
```

### Builds (EAS)
```bash
# iOS dev build (for device)
npm run build:ios:dev-device

# iOS dev build (for simulator)
npm run build:ios:dev-simulator

# Android dev build
npm run build:android:dev

# Production build (handled by EAS)
eas build --platform ios --profile production
eas build --platform android --profile production
```

---

## AQ2: EXACT FILE PATHS FOR EVERY FEATURE

When you need to modify a feature, here are the exact paths:

```
# CORE SYSTEMS
src/session/SessionOrchestrator.ts          # Main session orchestrator
src/session/SessionOrchestratorBase.ts      # Base class
src/session/types.ts                        # All session types (re-exports)
src/session/types/schemas.ts                # Core session schemas
src/session/types/enums.ts                  # Session enums
src/session/types/interfaces.ts             # Session interfaces
src/session/engines/TimerEngine.ts           # Timer engine
src/session/engines/ScoringEngine.ts         # Scoring engine
src/session/engines/CompletionEngine.ts      # Completion engine
src/session/antiCheat/AntiCheatEngine.ts     # Anti-cheat
src/session/repository/SessionRepository.ts  # Session persistence
src/session/SessionEventEmitter.ts           # Internal events
src/session/presets/preset-manager.ts        # Preset management

# NAVIGATION
src/navigation/RootNavigator.tsx             # Root nav (auth/onboarding/main)
src/navigation/MainNavigator.tsx             # Bottom tabs
src/navigation/types.ts                      # Navigation types (re-exports)
src/navigation/route-types.ts                # Route name types
src/navigation/param-types.ts                # Route parameter types
src/navigation/RootStackScreens.tsx          # Stack screen composition
src/navigation/AuthNavigator.tsx
src/navigation/OnboardingNavigator.tsx
src/navigation/SessionNavigator.tsx
src/navigation/SettingsNavigator.tsx
src/navigation/ContentStudyNavigator.tsx
src/navigation/linking-config.ts             # Deep links
src/navigation/components/VexTabBar.tsx      # Custom tab bar

# STATE MANAGEMENT
src/store/authStore.ts                       # Auth (MMKV persisted)
src/store/appStore.ts                        # App state
src/store/uiStore.ts                         # Toast/modal
src/store/session-state.ts                   # Session UI state
src/features/onboarding/store.ts             # Onboarding (Zustand persist)
src/features/ai-coach/store.ts               # Coach preferences (MMKV)

# DESIGN SYSTEM
src/theme/tokens/colors.ts                   # Color palette exports
src/theme/tokens/typography.ts               # Fonts, sizes, weights
src/theme/tokens/spacing.ts                  # Spacing scale
src/theme/tokens/radius.ts                   # Border radius
src/theme/tokens/shadows.ts                  # Shadow presets
src/theme/tokens/motion.ts                   # Animation presets
src/theme/tokens/vex-light-glass.ts          # Light glass tokens (NEW)
src/theme/tokens/semanticColors.ts           # 64 semantic color tokens
src/theme/ThemeContext.tsx                    # Theme provider
src/theme/ThemeService.ts                    # Theme persistence
src/theme/createTheme.ts                     # Theme factory

# SUPABASE
src/config/supabase.ts                       # Supabase client (lazy proxy)
src/config/supabase-mock.ts                  # Jest mock client
src/types/supabase.ts                        # Auto-generated DB types

# SHARED MODULES
src/shared/ai/edge-function-service.ts       # AI edge function calls
src/shared/ai/ai-models.ts                   # Gemini model configs
src/shared/ai/ai-fallback-tiers.ts           # AI fallback logic
src/shared/analytics/analytics-service.ts    # PostHog service
src/shared/monetization/revenuecat-service.ts # RevenueCat service
src/shared/monetization/index.ts             # Monetization public API
src/shared/feedback/HapticEngine.ts          # Haptics system
src/events/EventBus.ts                        # Event bus singleton

# APP ENTRY
App.tsx                                      # registerRootComponent
src/app/App.tsx                              # Root component
src/app/bootstrap.ts                         # Initialization pipeline
src/app/providers/AppProviders.tsx           # Provider composition

# EVERY FEATURE INDEX (for imports)
src/features/account-deletion/index.ts
src/features/achievements/index.ts
src/features/ai-coach/index.ts
src/features/analytics/index.ts
src/features/auth/index.ts
src/features/boss/index.ts
src/features/capture/index.ts
src/features/challenges/index.ts
src/features/coach-presence/index.ts
src/features/companion/index.ts
src/features/companion-promise/index.ts
src/features/content-study/index.ts
src/features/economy/index.ts
src/features/feature-gate/index.ts
src/features/focus-contract/index.ts
src/features/focus-identity/index.ts
src/features/focus-memory/index.ts
src/features/focus-profile/index.ts
src/features/focus-run/index.ts
src/features/home-experience/index.ts
src/features/home-spine/index.ts
src/features/integration/index.ts
src/features/invisible-agent/index.ts
src/features/lane-engine/index.ts
src/features/lane-home/index.ts
src/features/learning-execution/index.ts
src/features/liveops-config/index.ts
src/features/mastery/index.ts
src/features/memory-candidate/index.ts
src/features/mode-native/index.ts
src/features/mode-retention/index.ts
src/features/monetization/index.ts
src/features/monthly-report/index.ts
src/features/notification-policy/index.ts
src/features/notifications/index.ts
src/features/onboarding/index.ts
src/features/personal-bests/index.ts
src/features/personalization/index.ts
src/features/plan/index.ts
src/features/progression/index.ts
src/features/project-focus/index.ts
src/features/rescue-mode/index.ts
src/features/retention-loop/index.ts
src/features/reward-ledger/index.ts
src/features/rewards/index.ts
src/features/session/index.ts
src/features/session-completion/index.ts
src/features/session-events/index.ts
src/features/session-history/index.ts
src/features/session-recommendation/index.ts
src/features/session-start/index.ts
src/features/settings/index.ts
src/features/streaks/index.ts
src/features/study-intelligence/index.ts
src/features/study-os/index.ts
src/features/themes/index.ts
src/features/today-system/index.ts
src/features/unlock-explainer/index.ts
src/features/unlock-system/index.ts
src/features/vex-actions/index.ts
src/features/weekly-intelligence/index.ts
src/features/featureFlagInstance.ts
src/features/FeatureFlagService.ts
```

---

## AQ3: HOW TO IMPORT FROM EACH MODULE

### Feature Imports (always through index.ts)
```typescript
// Auth
import { useCurrentUser, signIn, signOut } from '../features/auth';

// Streaks
import { useStreakSummary, recordSession } from '../features/streaks';

// AI Coach
import { useCoachMessage } from '../features/ai-coach';

// Achievements
import { useAchievements, updateAchievementProgress } from '../features/achievements';

// Challenges
import { useActiveChallenges, assignChallenge } from '../features/challenges';

// Notifications
import { dispatchUrgencyNotification } from '../features/notifications';

// Onboarding
import { useOnboardingStore, completeOnboarding } from '../features/onboarding';

// Companion
import { CompanionService, getCompanionService } from '../features/companion';

// Coach Presence
import { useCoachPresence, buildCoachPresence } from '../features/coach-presence';

// Personalization
import { resolveVexExperience } from '../features/personalization';

// Focus Identity
import { FocusIdentityService } from '../features/focus-identity';

// Home Experience
import { buildHomeExperienceModel, getHomeStage } from '../features/home-experience';

// Home Spine
import { useHomeSpine, buildHomeSpineModel } from '../features/home-spine';

// Lane Engine
import { resolveInitialLane, getLaneMechanicPolicy } from '../features/lane-engine';

// LiveOps Config (Feature Flags)
import { useFeatureAccess, getFeatureAvailability } from '../features/liveops-config';

// Content Study
import { submitContent, generateStudyPlan } from '../features/content-study';

// Study OS
import { createManualStudyPlan, completeStudyBlock } from '../features/study-os';

// Progression
import { addXp, getDailyProgress } from '../features/progression';

// Mastery
import { MasteryService } from '../features/mastery';

// Economy
import { getWalletSummary } from '../features/economy';

// Session Start
import { buildSessionStartHero, buildLaneSessionBrief } from '../features/session-start';

// Session Completion
import { orchestrateSessionCompletion } from '../features/session-completion';

// Session Recommendation
import { generateSessionRecommendation } from '../features/session-recommendation';

// Settings
import { getSetting, updateSetting, exportSettings } from '../features/settings';

// Monetization
import { TIERS, isPremium } from '../features/monetization';

// Rescue Mode
import { isRescueEligible, createRescuePlan } from '../features/rescue-mode';

// Retention
import { buildRetentionJourney } from '../features/retention-loop';

// Notification Policy
import { decideNudge } from '../features/notification-policy';

// Today System
import { buildTodaySystem } from '../features/today-system';

// Invisible Agent
import { generateInvisibleAgentDecision } from '../features/invisible-agent';

// Plan
import { getTodayItems, addItem } from '../features/plan';

// Capture
import { submitCapture, loadCaptures } from '../features/capture';

// Weekly Intelligence
import { buildWeeklyIntelligence } from '../features/weekly-intelligence';

// Monthly Report
import { generateMonthlyReport } from '../features/monthly-report';

// Personal Bests
import { checkAndUpdatePersonalBest } from '../features/personal-bests';

// Boss/Blocker
import { PersonalBossBlockSchema } from '../features/boss';

// Account Deletion
import { deleteAccount } from '../features/account-deletion';

// Feature Gate
import { FeatureGate, NavigationGate } from '../features/feature-gate';

// VEX Actions
import { executeVexAction } from '../features/vex-actions';
```

### Store Imports
```typescript
import { useAuthStore } from '../store';       // Auth state
import { useAppStore } from '../store';        // App state
import { useUIStore } from '../store';         // Toast/modal
import { useSessionUIStore } from '../store/session-state';
```

### Shared Module Imports
```typescript
// AI
import { edgeAIClient, generateCoachMessage } from '../shared/ai';

// Analytics
import { analyticsService, capture } from '../shared/analytics';

// Monetization
import { useRevenueCat, usePremiumStatus } from '../shared/monetization';

// Haptics
import { triggerHaptic } from '../shared/feedback';

// Accessibility
import { checkContrast } from '../shared/accessibility';

// Hardening (retry, cache, circuit breaker)
import { withRetry, TTLCache } from '../shared/hardening';
```

### Config Imports
```typescript
import { supabase, getSupabaseClient } from '../config/supabase';
```

### EventBus
```typescript
import { eventBus } from '../events/EventBus';

// Publish
eventBus.publish('achievement:unlocked', { userId, achievementId });

// Subscribe
const unsubscribe = eventBus.subscribe('challenge:progress', (data) => { ... });
```

### Theme / Tokens
```typescript
import { colors, spacing, radius } from '../theme/tokens';
import { vexLightGlass, glassMaterials } from '../theme/tokens/vex-light-glass';
import { useTheme } from '../theme/ThemeContext';
```

### Theme (with alias paths in Jest only)
```typescript
// These aliases work in tests via jest.config.js moduleNameMapper:
import { something } from '@/features/streaks';       // → src/features/streaks
import { Button } from '@components/primitives';       // → src/components/primitives
import { useAuthStore } from '@store/authStore';       // → src/store/authStore
import { spacing } from '@theme/tokens';               // → src/theme/tokens

// In source code, use relative imports:
import { something } from '../features/streaks';
import { Button } from '../components/primitives';
```

---

## AQ4: WHERE TO FIND SPECIFIC THINGS (Quick Lookup)

| Question | Answer (exact path) |
|---|---|
| "Where is the main app component?" | `src/app/App.tsx` |
| "Where are routes defined?" | `src/navigation/route-types.ts`, `src/navigation/param-types.ts` |
| "Where is the Supabase client?" | `src/config/supabase.ts` |
| "Where are feature flags?" | `src/features/liveops-config/feature-flags.json` |
| "Where is the onboarding flow?" | `src/screens/onboarding/OnboardingFlowScreen.tsx` |
| "Where is the session timer UI?" | `src/session/components/SessionTimer.tsx` |
| "Where is the HUD?" | `src/session/components/ActiveSessionHUD.tsx` |
| "Where are session presets?" | `src/session/presets/default-presets.ts` |
| "Where is the paywall?" | `src/screens/paywall/PaywallScreen.tsx` |
| "Where are achievement definitions?" | `src/features/achievements/definitions.ts` |
| "Where is the focus score config?" | `src/features/focus-identity/focus-score-config.ts` |
| "Where are streak constants?" | `src/features/streaks/constants.ts` |
| "Where is the companion personality?" | `src/features/companion/CompanionPersonalityEngine.ts` |
| "Where are haptics defined?" | `src/shared/feedback/HapticEngine.ts` |
| "Where are UI state components?" | `src/shared/ui/state-components/` |
| "Where are empty states?" | `src/components/EmptyState.tsx`, `src/shared/ui/components/EmptyState.tsx` |
| "Where are error states?" | `src/components/states/ErrorState.tsx`, `src/shared/ui/state-components/error-state.tsx` |
| "Where are GlassCard tokens?" | `src/components/glass/GlassCard.tokens.ts` |
| "Where are glass materials?" | `src/theme/tokens/vex-light-glass.ts` (glassMaterials) |
| "Where is the logger?" | `src/logging/Logger.ts` |
| "Where are Sentry alerts?" | `src/shared/analytics/sentry-alerts.ts` |
| "Where is offline sync?" | `src/features/session-completion/offline-sync-service.ts` |
| "Where is auth persistence?" | `src/store/authStore.ts` |
| "Where is secure storage?" | `src/persistence/SecureStorage.ts` |
| "Where is MMKV config?" | `src/persistence/MMKVStorage.ts` |
| "Where are the Metro shims?" | `metro.config.js` (SHIMS object), `shims/*.js` |
| "Where is the debounce utility?" | `src/utils/debounced-write.ts` |
| "Where is the UUID util?" | `src/utils/uuid.ts` |
| "Where are date utils?" | `src/utils/date.ts` |
| "Where is the focus duration formatter?" | `src/utils/format-duration.ts` |

---

## AQ5: TEMPLATE — Creating a New Feature

```
# 1. Create directory
mkdir src/features/my-feature

# 2. Create these files (EXACT names):
src/features/my-feature/
├── types.ts          # Domain types, NO logic, only type/interface/enum
├── schemas.ts        # Zod schemas, export types via z.infer<>
├── repository.ts     # Supabase queries ONLY, one function per query
├── service.ts        # Business logic ONLY, calls repository
├── hooks.ts          # TanStack Query hooks, calls service
├── index.ts          # Barrel exports (public API)
├── analytics.ts      # capture() calls for PostHog
├── events.ts         # eventBus.publish() definitions (optional)
└── __tests__/
    └── service.test.ts
```

**types.ts template:**
```typescript
// Only type/interface/enum — never any logic or Zod
import { z } from 'zod';
export interface MyFeatureData { id: string; name: string; }
export type MyFeatureStatus = 'active' | 'inactive';
```

**schemas.ts template:**
```typescript
import { z } from 'zod';
export const MyFeatureSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  status: z.enum(['active', 'inactive']),
});
export type MyFeature = z.infer<typeof MyFeatureSchema>;
```

**repository.ts template:**
```typescript
import { supabase } from '../../config/supabase';
import type { MyFeature } from './schemas';
export async function fetchMyFeature(id: string): Promise<MyFeature | null> {
  const { data, error } = await supabase.from('my_table').select('*').eq('id', id).single();
  if (error) throw new Error(`Failed to fetch: ${error.message}`);
  return data;
}
```

**service.ts template:**
```typescript
import * as repository from './repository';
import { MyFeatureSchema, type MyFeature } from './schemas';
export async function getMyFeature(id: string): Promise<MyFeature | null> {
  const data = await repository.fetchMyFeature(id);
  return data ? MyFeatureSchema.parse(data) : null;
}
```

**hooks.ts template:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { getMyFeature } from './service';
export function useMyFeature(id: string) {
  return useQuery({
    queryKey: ['myFeature', id],
    queryFn: () => getMyFeature(id),
    enabled: !!id,
  });
}
```

**index.ts template:**
```typescript
export type { MyFeature, MyFeatureStatus } from './types';
export { MyFeatureSchema } from './schemas';
export { getMyFeature } from './service';
export { useMyFeature } from './hooks';
```

---

## AQ6: CRITICAL GOTCHAS (Don't Get Bitten)

### 🚫 NEVER DO THESE
| Don't | Why |
|---|---|
| Use `any` type | Banned — fix the architecture instead |
| Use `@ts-ignore` or `@ts-nocheck` | Banned — fix the type error |
| Use `console.log` | Use logger or Sentry breadcrumbs |
| Put Supabase queries in hooks or components | Must be in repository.ts |
| Put business logic in components | Must be in service.ts |
| Call RevenueCat SDK directly | Use `shared/monetization/` layer |
| Hardcode colors/spacing/fonts | Use `src/theme/tokens/` |
| Use `StyleSheet.create` | Use inline styles with theme tokens |
| Use `FlatList` | Use FlashList with `estimatedItemSize` |
| Use `Animated` from react-native | Use Reanimated 4.3.1 only |
| Use `AsyncStorage` | Use MMKV (non-sensitive) or SecureStorage (sensitive) |
| Use raw `fetch()` | Use the API client |
| Create `.part-N.ts` files | Banned — decompose by domain, not line count |
| Forget error handling on async | Every async path must have try/catch + user-facing error |
| Leave Supabase channel subscriptions open | Must have unsubscribe in useEffect cleanup |
| Skip UI states | Every data component needs: Loading, Error, Empty, Success, Offline, Optimistic |

### ⚠️ WATCH OUT FOR
- **File size**: Hard limit 200 lines — split files before hitting it
- **Zod is source of truth**: Types are always `z.infer<typeof Schema>`, never hand-written
- **Supabase types**: Auto-generated — run `npm run types:supabase` after schema changes
- **Shims**: 35+ shims in metro.config.js — if adding a native module, you likely need a shim
- **Boss service is STUBBED**: All boss functions return 0/null — don't try to use them
- **RevenueCat placeholder keys**: Detected and blocked in production
- **Expo Go crashes**: Many native modules crash in Expo Go — shims prevent this in dev, real modules in production
- **Metro CJS fallback**: @supabase/* packages need CJS fallback in metro.config.js
- **Line numbers**: If you see "Line limit exceeded" errors, split the file
- **No `as X` casts**: Except at Zod parse boundaries (add a comment)

---

## AQ7: FEATURE DEPENDENCY MAP (Who Imports What)

```
App.tsx
├── bootstrap.ts → analytics, session-completion, MMKV, network
├── ThemeProvider → ThemeService (MMKV), ThemeContext
├── RootNavigator → auth store, onboarding store, liveops-config (feature access)
│   ├── AuthNavigator → auth feature (hooks, service)
│   ├── OnboardingNavigator → onboarding feature (store, service)
│   └── MainNavigator → HomeScreen, FocusScreen, ProgressScreen, ProfileTabRoute
│       ├── HomeScreen → home-experience, home-spine, lane-engine, coach-presence, personalization
│       ├── FocusScreen → session-start, session-recommendation
│       ├── ProgressScreen → progression, streaks, focus-identity
│       └── ProfileTabRoute → settings, achievements, mastery, focus-memory
│
├── SessionNavigator → session (SessionOrchestrator)
│   ├── SessionSetup → session-start, session-recommendation, lane-engine
│   ├── ActiveSession → session (TimerEngine, ScoringEngine, AntiCheatEngine)
│   └── SessionComplete → session-completion (orchestrator)
│       ├── → streaks (recordSession)
│       ├── → progression (addXp)
│       ├── → achievements (updateAchievementProgress)
│       ├── → challenges (checkChallengeProgress)
│       ├── → economy (addCurrency)
│       ├── → personalization (resolveVexExperience)
│       ├── → focus-identity (updateScore)
│       └── → companion (completeSession)
│
├── SettingsNavigator → settings feature
├── ContentStudyNavigator → content-study feature
└── Feature screens → liveops-config (gating)
```

### Cross-Feature Dependencies (Who Needs Who)
| Feature | Depends On |
|---|---|
| `session-completion` | `streaks`, `progression`, `achievements`, `challenges`, `economy`, `personalization`, `focus-identity`, `companion` |
| `personalization` | `lane-engine`, `coach-presence`, `home-experience`, `notification-policy` |
| `home-experience` | `personalization`, `lane-engine`, `coach-presence` |
| `notifications` | `notification-policy`, `liveops-config` |
| `streaks` | `economy` (for milestone rewards) |
| `achievements` | `economy`, `progression`, `rewards` |
| `challenges` | `economy` (for rewards) |
| `mastery` | `progression` |
| `companion` | `streaks`, `focus-identity` |
| `coach-presence` | `companion`, `liveops-config`, `ai-coach` |
| `ai-coach` | `shared/ai` (edge functions) |
| `content-study` | `shared/ai`, `study-os` |
| `study-os` | `content-study`, `session` |
| `monetization` | `shared/monetization` (RevenueCat), `liveops-config` |
| `invisible-agent` | `shared/ai`, `liveops-config` |
| `rescue-mode` | `streaks`, `notifications` |
| `focus-identity` | `session-completion`, `streaks` |

---

## AQ8: KEY TYPE LOCATIONS

| Type | File |
|---|---|
| `SessionState`, `SessionSummary`, `SessionConfig` | `src/session/types/schemas.ts` |
| `TimerState`, `ScoreCalculation` | `src/session/types/schemas.ts` |
| `FocusQualityMetrics` | `src/session/types/interfaces.ts` |
| `User` (auth) | `src/types/models/user.ts` |
| `Database` (Supabase) | `src/types/supabase.ts` (auto-generated) |
| `RootStackParamList` | `src/navigation/param-types.ts` |
| `MainTabParams` | `src/navigation/param-types.ts` |
| `FeatureAccess`, `FeatureKey` | `src/features/liveops-config/feature-access-types.ts` |
| `VexExperience` | `src/features/personalization/schemas.ts` |
| `Streak`, `StreakSummary` | `src/features/streaks/schemas.ts` |
| `Achievement`, `UserAchievement` | `src/features/achievements/types.ts` |
| `CompanionState`, `CompanionPhase` | `src/features/companion/types.ts` |
| `CoachPresence` | `src/features/coach-presence/schemas.ts` |
| `HomeExperienceModel` | `src/features/home-experience/schemas.ts` |
| `HomeSpineModel` | `src/features/home-spine/schemas.ts` |
| `FocusIdentityProfile` | `src/features/focus-identity/FocusIdentityEngine-types.ts` |
| `PlanItem`, `PlanProject` | `src/features/plan/types.ts` |
| `CaptureItem` | `src/features/capture/types.ts` |
| `Setting`, `UserPreferences` | `src/features/settings/types.ts` |
| `RevenueCatStatus`, `UseRevenueCatState` | `src/shared/monetization/revenuecat-types.ts` |
| `AIRequest`, `AIResponse` | `src/shared/ai/ai-types.ts` |
| `CoachAgentDecision` | `src/features/invisible-agent/schemas.ts` |
| `ThemeMode` | `src/theme/types.ts` |
| `SemanticColors` | `src/theme/semanticColors.ts` |
| `Nullable<T>` | `src/types/global.ts` |

---

## AQ9: METRO SHIMS REFERENCE

If you need to add a new native module, you MUST add a shim. Here's the pattern:

**In `shims/your-module.js`:**
```javascript
// Shim for your-module — prevents "runtime not ready" crashes in Expo Go
module.exports = {};
```

**In `metro.config.js`, add to SHIMS object:**
```javascript
"your-module": path.resolve(__dirname, "shims/your-module.js"),
```

**Shim when to use:** Module calls `requireNativeViewManager` or `requireNativeModule` at module evaluation time (top level, not inside a function call).

**Currently shimmed modules** (35 total):
`vaul`, `expo-glass-effect`, `expo-blur`, `expo-linear-gradient`, `expo-image`, `expo-apple-authentication`, `react-native-svg`, `@react-native-community/netinfo`, `@shopify/react-native-skia`, `@rive-app/react-native`, `react-native-nitro-modules`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-screens`, `react-native-screens/native-stack`, `expo-secure-store`, `expo-system-ui`, `expo-notifications`, `expo-document-picker`, `expo-sqlite`, `expo-updates`, `expo-web-browser`, `expo-widgets`, `expo-symbols`, `expo-mesh-gradient`, `expo-status-bar`, `expo-file-system`, `expo-constants`, `expo-haptics`, `expo-splash-screen`, `@expo/ui`, `posthog-react-native`

---

## AQ10: TESTING BY DOMAIN

```bash
# Session system tests (the most critical)
npx jest --config jest.config.js --testPathPattern="src/session/__tests__"

# Session integration tests
npx jest --config jest.config.js --testPathPattern="src/session/integration/__tests__"

# Feature tests
npx jest --config jest.config.js --testPathPattern="src/features/"

# Store tests
npx jest --config jest.config.js --testPathPattern="src/store/__tests__"

# Navigation tests
npx jest --config jest.config.js --testPathPattern="src/navigation/__tests__"

# Monetization tests
npx jest --config jest.config.js --testPathPattern="src/shared/monetization/__tests__"

# AI tests
npx jest --config jest.config.js --testPathPattern="src/shared/ai/__tests__"

# Journey tests (integration)
npx jest --config jest.config.js --testPathPattern="src/__tests__/journey/"

# Product journey tests
npx jest --config jest.config.js --testPathPattern="src/__tests__/product-journey"

# Lane tests
npx jest --config jest.config.js --testPathPattern="src/__tests__/helpers/lane"

# Run just the failing tests from the legacy list
# (These are excluded by default via jest.legacy-failing-tests.js)
```

---

## AQ11: ENVIRONMENT VARIABLES QUICK REFERENCE

```bash
# Required for Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Required for RevenueCat (set both, app picks based on platform)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=rc_...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=rc_...

# Required for analytics
EXPO_PUBLIC_POSTHOG_KEY=phc_...
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Optional
EXPO_PUBLIC_ANALYTICS_DISABLED=true     # Kill analytics entirely
EXPO_PUBLIC_ANALYTICS_FORCE_ENABLE=true # Enable in dev
EXPO_PUBLIC_APP_VERSION=1.0.0           # Override app.json version
```

---

## AQ12: EAS BUILD PROFILES

```bash
# Profile: development (Expo Go compatible, internal distribution)
# Channel: development
# Env: APP_ENV=development, EXPO_PUBLIC_ENVIRONMENT=development

# Profile: development-device (physical device)
# Same as development + iOS resource class m-medium

# Profile: development-simulator (iOS simulator)
# Same as development + simulator=true

# Profile: preview (internal distribution, staging)
# Channel: preview
# Env: APP_ENV=preview, EXPO_PUBLIC_ENVIRONMENT=staging

# Profile: production (App Store / Play Store)
# Channel: production
# Env: APP_ENV=production, EXPO_PUBLIC_ENVIRONMENT=production
# autoIncrement: true
# iOS: m-large, Android: large
```

---

## AQ13: DEBUG TIPS

### Debug logging
```typescript
import { createDebugger } from '../utils/debug';
const debug = createDebugger('my-feature');
debug.info('Something happened', data);
debug.error('Something failed', error);
```

### Sentry breadcrumbs (for tracking flow)
```typescript
import * as Sentry from '@sentry/react-native';
Sentry.addBreadcrumb({ category: 'my-feature', message: 'User did X', level: 'info' });
```

### Sentry exception capture
```typescript
import { captureException } from '../config/sentry';
captureException(error, { tags: { feature: 'my-feature' } });
```

### Analytics event
```typescript
import { capture } from '../shared/analytics';
capture('my_event_name', { property: 'value' });
```

### Silent failure (non-critical errors)
```typescript
import { captureSilentFailure } from '../utils/silent-failure';
captureSilentFailure(error, { feature: 'my-feature', operation: 'some-op', type: 'network' });
```

### MMKV direct access (READ ONLY — use Zustand for writes)
```typescript
import { createRuntimeMMKV } from '../persistence/mmkv-runtime';
const storage = createRuntimeMMKV({ id: 'my-storage' });
const value = storage.getString('my-key');
```

### Secure storage (for tokens/secrets)
```typescript
import { getSecureStorage } from '../persistence/SecureStorage';
const secure = getSecureStorage();
await secure.setItem('token', 'value');
const token = await secure.getItem('token');
```

---

## AQ14: COMPONENT IMPORT QUICK REFERENCE

```typescript
// Glass components
import { GlassScreen, GlassCard, GlassPill, LiquidButton, GlassIconOrb } from '../components/glass';

// Primitives
import { Box, Text, Button, Card, Stack, HStack, VStack, Center } from '../components/primitives';

// Premium
import { PremiumSurface, PremiumBadge, SupporterBadge } from '../components/premium';

// States
import { ErrorState, LoadingState, FullScreenLoader, InlineLoader } from '../components/states';

// Overlays
import { Modal, Toast } from '../components/overlays';

// UI Shared
import { ToastProvider, ToastComponent } from '../shared/ui/components/Toast';
import { EmptyState } from '../shared/ui/components/EmptyState';
import { TabBar } from '../shared/ui/components/TabBar';
import { ProgressSteps } from '../shared/ui/components/ProgressSteps';
import { AnimatedCounter } from '../shared/ui/components/AnimatedCounter';
import { OfflineBanner } from '../shared/ui/components/OfflineBanner';
import { WittyLoadingState } from '../shared/ui/components/WittyLoadingState';
import { EnterAnimation } from '../shared/ui/components/EnterAnimation';

// Liquid Glass
import { LiquidGlassCard, LiquidGlassScreen, LiquidGlassHeader } from '../shared/ui/liquid-glass';

// Coach
import { AnimatedCoachAvatar, SmartCoachHint } from '../components/coach';

// Boss
import { BossPhaseIndicator } from '../components/boss';

// Atmosphere
import { VexMeshAtmosphere } from '../components/atmosphere';

// Other
import { Avatar, AvatarBadge, AvatarStatus } from '../components/Avatar';
import { StreakBadge } from '../components/StreakBadge';
import { LevelUpCelebration } from '../components/LevelUpCelebration';
import { FeatureTeaserCard } from '../components/FeatureTeaserCard';
import { LockedFeatureScreen } from '../components/LockedFeatureScreen';
import { Divider } from '../components/Divider';
import { FocusRing } from '../components/FocusRing';
```

---

## AQ15: ARCHITECTURE RULES CHECKLIST (Before Every Commit)

```
□ No `any` types anywhere
□ No `@ts-ignore` or `@ts-nocheck`
□ No `console.log` (use logger or Sentry)
□ All Supabase queries are in repository.ts
□ All business logic is in service.ts
□ All colors/spacing/fonts from theme tokens
□ File is under 200 lines (if not, split it)
□ All async functions have explicit return types
□ All Zod schemas used, not hand-written types
□ All UI states handled (Loading, Error, Empty, Success, Offline, Optimistic)
□ All interactive elements have accessibilityLabel, accessibilityRole, accessibilityHint
□ Touch targets are ≥44x44
□ Reanimated used for animations (not Animated from RN)
□ Haptics go through src/shared/feedback (not expo-haptics directly)
□ Sentry breadcrumbs added for important operations
□ TanStack Query hooks expose: data, isPending, isError, error, refetch
□ Every Supabase subscription has unsubscribe in useEffect cleanup
□ npx tsc --noEmit passes with zero errors
```

---

*End of VEX Comprehensive Technical Research Document — Including Agent Quick Reference*
*~150,000+ lines of TypeScript/TSX analyzed across 1,500+ files in 60+ feature modules*
