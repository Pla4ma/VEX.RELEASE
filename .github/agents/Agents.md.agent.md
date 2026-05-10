# VEX AGENTS.md - Production AI Engineering Rules

You are working on VEX, a production Expo React Native app. Your job is to make correct, verified, product-coherent changes without creating cleanup debt. This repo is strict. Do not improvise architecture, create placeholders, or leave work half-wired.

## Product North Star

VEX wins through one world-class loop:

Open app -> see one best action -> start focus fast -> complete session -> see proof of growth -> know what to do next.

Protect these systems:
- Focus Score: main identity spine.
- Daily Mission: one best action.
- Session Grade: emotional receipt for effort.
- Companion / streak creature: emotional retention.
- Streaks and comeback quests: supportive habit recovery, never shame.
- AI Coach: specific, data-backed, actionable.
- STUDY/content features: preserve if working; feature-flag only when needed.
- Boss: ship only if simple, stable, and tied to session completion.
- Premium: sell insight, personalization, and cosmetics, never fear.

Do not make the app boring by deleting differentiated systems. Do not make it sloppy by shipping every half-built system. Feature-flag low-ROI bloat when it is not launch-ready.

## Stack - No Substitutions

- Expo SDK 54, managed workflow.
- TypeScript 5.x strict mode.
- TanStack Query v5 for server state only.
- Zustand for persistent client state only.
- Zod as source of truth for schemas and inferred types.
- React Navigation v6 with typed route params.
- Reanimated 3 only for animation. Never use `Animated` from `react-native`.
- Supabase for Postgres, Auth, Realtime, Storage.
- MMKV for non-sensitive local storage only.
- SecureStore only through the existing SecureStorage wrapper.
- Sentry for unexpected errors.
- RevenueCat only through `src/shared/monetization/`.
- Design tokens only from `src/theme/tokens/`.

No new libraries without explicit user approval.

## AI Operating Protocol

Before editing:
1. Read the user request.
2. If the request references `TASKSx.md`, read it fully first.
3. Read this `AGENTS.md`.
4. Read only relevant source files.
5. Identify the exact files to edit.
6. Identify tests to add or update.
7. Confirm edited files can stay under 200 lines.
8. If a file would exceed 200 lines, split it before adding behavior.

During editing:
1. Make the smallest complete change.
2. Reuse existing systems.
3. Do not repair unrelated issues.
4. Do not create placeholders.
5. Do not add dead files to satisfy checklists.
6. Do not move business logic into JSX.
7. Do not duplicate logic across features.
8. Validate external data with Zod.
9. Use EventBus for cross-system integration.
10. Preserve existing working behavior unless the task explicitly changes it.

After editing:
1. Run targeted tests.
2. Run `npm run typecheck -- --pretty false`.
3. Run relevant lint or `npm run lint`.
4. Audit edited files for banned patterns.
5. Check edited file line counts.
6. Update `VERIFICATION_REPORT.md` when working from checklist/phase tasks.
7. Report files changed, tests run, TypeScript result, risks, and deferred items.

## Phase Work Rules

If working from `TASKSx.md`:
- Work one phase at a time.
- Do not skip ahead.
- Do not reopen Phase 0 unless a later task creates a regression.
- Do not move to the next phase until the current phase exit gate passes.
- Every task must be fully wired into the app flow, not just file-created.
- A task is complete only when its VERIFY checklist passes.

## Architecture - Mandatory Data Flow

Component -> Hook -> Service -> Repository -> Supabase

Feature layout:
- `types.ts`: domain types only.
- `schemas.ts`: Zod schemas only; export inferred types when schema-backed.
- `repository.ts`: all Supabase and persistence queries.
- `service.ts`: business logic, orchestration, calculations.
- `hooks.ts`: TanStack Query and Zustand wiring for UI.
- `store.ts`: Zustand slice only when persistent client state is needed.
- `events.ts`: event definitions.
- `analytics.ts`: Sentry breadcrumbs and product analytics only.
- `components/`: UI rendering only.
- `__tests__/`: unit and integration tests.

Never put:
- Supabase queries in hooks or components.
- Business rules in components.
- `useQuery` directly in screen components when a feature hook should exist.
- RevenueCat calls outside shared monetization.
- Cross-feature orchestration through direct imports when events/shared contracts are appropriate.

## File Size Limit

Hard limit: 200 lines per source file.

If a file exceeds 200 lines:
- Stop.
- Split by responsibility.
- Keep imports clean.
- Continue only after the split.

Do not create 300-line "almost done" files.

## TypeScript Rules

- No `any`.
- No `@ts-ignore`.
- No `@ts-nocheck`.
- No unexplained `@ts-expect-error`.
- Avoid `as X` casts except at validated Zod parse boundaries with a short comment.
- All async functions must have explicit return types.
- All schema-backed types must use `z.infer<>`.
- Supabase table types come from `src/types/supabase.ts`.
- Run `npm run types:supabase` after schema migrations.
- Never manually edit generated Supabase types.

## UI Rules

Every meaningful data-driven UI must handle:
- loading with skeleton, not spinner-only
- empty state with one CTA
- error state with retry
- offline/degraded state
- disabled state
- optimistic state for user-visible writes
- success state

UI requirements:
- Use tokens from `src/theme/tokens/`.
- No hardcoded colors, spacing, font sizes, or radii.
- No `StyleSheet.create`.
- No `FlatList`; use FlashList with measured `estimatedItemSize`.
- All controls need `accessibilityLabel`, `accessibilityRole`, and useful `accessibilityHint`.
- Touch targets at least 44x44.
- Use `useReducedMotion()` before nonessential animation.
- Reanimated 3 only.
- Forms use `KeyboardAvoidingView` and `ScrollView`.
- Dark mode must work through tokens.

## State Rules

Server state:
- TanStack Query only.
- Hooks expose `data`, `isPending`, `isError`, `error`, `refetch`, and stale/refetching state where relevant.

Global client state:
- Zustand only.
- Use for auth, preferences, offline queue, UI prefs.

Local UI state:
- `useState` only for local drafts, open/closed state, and transient UI.

Mutations:
- invalidate related queries on success
- optimistic update where user-visible
- rollback on error
- Sentry capture on unexpected error
- user-facing error toast/message

## Offline And Sync

User progress must never be silently lost.

Offline queue entries must be validated and idempotent:
- id
- type
- payload
- timestamp
- retryCount
- status

Required:
- Queue important writes before or during failed network operations.
- Replay on reconnect in order.
- Deduplicate by idempotency key.
- Show pending sync UI.
- Handle corrupt queue data safely.
- Never show success for lost data.

## Error Handling

Every async operation needs:
- typed/narrowed error handling
- Sentry capture for unexpected failures
- user-facing fallback or error state
- retry for network operations
- degraded state if full recovery is impossible

No `catch (e: any)`.
No swallowed errors.
No `console.log`, `console.warn`, or `console.error`.

## Supabase Rules

- All Supabase queries live in repository files.
- RLS is required.
- Never use service role keys in client code.
- Validate all responses with Zod.
- Realtime subscriptions must unsubscribe in cleanup.
- Schema migrations require `npm run types:supabase`.

## Analytics And Events

Important user actions should use:
1. Sentry breadcrumb for debugging.
2. Analytics event for product measurement.
3. EventBus event for cross-system integration.

No PII in Sentry or analytics unless explicitly required and disclosed.

Core events to preserve:
- session started/completed/abandoned
- Focus Score changed
- daily mission shown/completed
- streak at risk/broken
- comeback started/completed
- companion state changed
- reward created/delivered
- coach suggestion shown/accepted
- purchase started/completed/failed

## Monetization Rules

Premium may include:
- full AI coach
- monthly Focus Report
- advanced analytics
- premium companion cosmetics
- extra personal quests
- cosmetic season track
- squad insights if squads are enabled

Premium must not include:
- paid streak rescue panic
- paid boss retry panic
- emergency gem sinks
- "save your progress" fear copy
- blocking basic sessions
- blocking basic companion growth

All purchases go through `src/shared/monetization/`.

## Testing Rules

Required:
- Service tests for every logic branch.
- Schema tests for valid, invalid, edge, corrupt data.
- Repository tests for success, empty, invalid response, Supabase error.
- Mutation tests for success, error, optimistic rollback.
- Offline queue tests for enqueue, replay, retry, corrupt data.
- Critical flow tests for onboarding, session completion, rewards, purchases.

Use Jest by default:
- `npm test -- <pattern>`

Use Vitest only for Vitest-style suites:
- `npx vitest run <path>`

Do not pass Jest-only flags to Vitest.

## Verification Commands

Preferred type gate:
- `npm run typecheck -- --pretty false`

Other gates:
- `node scripts/check-no-ts-nocheck.js`
- `npm run lint`
- `npm test`
- `npm run perf:audit`
- `rg "StyleSheet\.create|FlatList|AsyncStorage|fetch\(" <edited-files>`

Edited-file audits:
- `rg "console\.|: any\b|<any>|@ts-ignore|@ts-nocheck|@ts-expect-error" <edited-files>`
- `rg "#[0-9A-Fa-f]{3,8}|rgb\(" <edited-files>`

## What Never Ships

- Placeholder implementations.
- Fake TODOs.
- Dead files.
- One-state UIs.
- TypeScript suppressions.
- `any`.
- Console logging.
- Hardcoded design values.
- Supabase outside repositories.
- Business logic in JSX.
- Untyped navigation.
- Unhandled offline writes.
- Missing error states.
- Missing tests for nontrivial logic.
- Disabled features reachable by users.
- Fear-based monetization.

## Final Standard

A change is done only when it is implemented, wired, tested, verified, and does not create cleanup debt. If verification cannot pass, report the blocker clearly instead of pretending the task is complete.
