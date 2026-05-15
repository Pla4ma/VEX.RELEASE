# VEX Current Architecture Notes

Last updated: April 30, 2026

## Main Code Map

- `App.js` and `index.js` register `src/app/App.tsx` as the Expo and native entry point.
- `src/app/bootstrap.ts` owns one-time runtime wiring for progression config, social startup, session completion, boss integration, streak insurance, weekly quests, and offline queue draining.
- `src/navigation/RootNavigator.tsx` owns the navigation container and delegates route registration to `src/navigation/RootStackScreens.tsx`.
- `src/navigation/MainNavigator.tsx`, `SessionNavigator.tsx`, `SettingsNavigator.tsx`, and `ContentStudyNavigator.tsx` own nested navigator structure.
- `src/screens/` contains app-level screens and flow coordinators.
- `src/features/` contains domain features with service, repository, hook, schema, type, analytics, and component layers.
- `src/shared/` contains reusable UI, monetization, analytics, accessibility, and utility building blocks.
- `src/persistence/`, `src/network/`, `src/sync/`, and `src/store/` contain platform persistence, connectivity, offline sync, and global client state.
- `src/theme/tokens/` is the source for colors, spacing, radius, typography, timing, opacity, sizing, and z-index.
- Tests are colocated under feature `__tests__` folders, app-level `src/__tests__`, and flow tests under `e2e/`.

## Boundaries

- UI should render from screens/components and call hooks for async work.
- Hooks should wrap TanStack Query, Zustand selectors, and mutation state for UI consumption.
- Services own business rules, orchestration, calculations, and cross-system event emission.
- Repositories own Supabase queries and response mapping.
- Persistence helpers own MMKV and SecureStore access; screens should not touch storage directly.
- Cross-feature communication should prefer `src/events` and integration modules over direct feature-to-feature imports.

## Navigation

- Route params live in `src/navigation/types.ts`.
- Root stack screens are registered in `src/navigation/RootStackScreens.tsx`.
- Notification tap routing lives in `src/navigation/hooks/useNotificationNavigation.ts`.
- Streak funeral routing lives in `src/navigation/hooks/useStreakFuneralNavigation.ts`.
- The root auth/loading skeleton lives in `src/navigation/components/RootLoadingShell.tsx`.

## Adding A Screen

1. Add or confirm route params in `src/navigation/types.ts`.
2. Register the screen in the correct navigator.
3. Keep the screen as a coordinator; move async state into a hook and business rules into the service layer.
4. Render loading, error, empty, offline, disabled, and success states where data-driven.
5. Use theme tokens and shared primitives before adding new styling or UI patterns.

## Adding A Feature

1. Start with `features/<name>/schemas.ts` and infer types from Zod.
2. Put Supabase access in `repository.ts`.
3. Put business rules in `service.ts`.
4. Put TanStack Query and mutation wiring in `hooks.ts`.
5. Keep persistent client state in `store.ts` only when needed.
6. Add service/schema tests for non-trivial logic.
7. Wire integrations through events or a clearly named integration module.

## Current Architecture Risks

- Several legacy root-level domain folders still coexist with `src/features`, especially `src/session`, `src/progression`, `src/social`, `src/economy`, and `src/rewards`; treat these as active only after checking imports.
- Many files still exceed the 200-line target, so large edits should start by splitting the file instead of adding more responsibility.
- Some docs are stale and conflict with current rules, especially older mentions of AsyncStorage as app storage.
- Some feature folders contain minified or compressed files that are hard to review and should be decompressed before significant changes.
- Navigation params still use broad index signatures in places, which weakens route safety and should be tightened gradually.
