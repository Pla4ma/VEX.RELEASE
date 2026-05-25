# VEX Continuous Execution Goal

## Mission

Make the existing VEX Expo React Native app May 2026-ready, production-grade, and structurally maintainable without creating a separate app. Work continuously by choosing one high-impact objective, implementing it, verifying it, updating this file, and immediately moving to the next objective.

## Current Objective

Split `src/session/components/ComboMeter.tsx`, now the largest over-limit production component, into focused modules under the 200-line cap without changing behavior.

## Current Phase

Line-limit backlog burn-down.

## Active Checklist

- Read `src/session/components/SquadSyncIndicator.tsx`.
- Read `src/session/components/ComboMeter.tsx`.
- Identify types, animation helpers, display components, and pure math that can move to domain-named files.
- Avoid `.part-N.ts` files.
- Keep every touched source file at or below 200 lines.
- Run focused typecheck and any related tests if present.
- Update this file with results and write the next objective.

## Audit Findings

- Full TypeScript currently passes, but full lint and full Jest timed out during the prior run and remain release-readiness blockers.
- `npm run audit:line-limit` reports 108 source files over the 200-line cap, excluding generated `src/types/supabase.ts`.
- Legacy roots such as `src/session`, `src/services`, `src/analytics`, `src/accessibility`, and `src/production` still contain feature and business logic outside the mandated feature-layer structure.
- Supabase access is scattered outside canonical `features/<name>/repository.ts` boundaries.
- Several tests are blacklisted in `jest.legacy-failing-tests.js`, which weakens confidence in production claims.
- The session-completion path is the activation spine and must be idempotent before product polish matters.
- Session completion previously used only an in-memory processed-key set, which did not clearly model in-flight versus completed work.

## Critical Blockers

- Full test suite is not a usable gate until timeout or failing-test debt is reduced.
- Strict line-limit gate fails on the existing 108-file backlog.
- Duplicate/legacy session systems create risk of double rewards, inconsistent history, and confusing UI state.

## Completed Work

- Replaced fake purchase verification with an explicit unverified raw-receipt boundary.
- Routed purchase restore through the shared RevenueCat service.
- Replaced fake client purchase hash generation with an unsupported boundary.
- Unblacklisted and rewrote `purchase-trust.test.ts`.
- Added `scripts/check-line-limit.js`.
- Added `npm run audit:line-limit` and `npm run check:line-limit`.
- Split `completion-orchestrator.ts` by extracting completion sync state and query invalidation helpers.
- Reworked session completion idempotency into begin/complete/release states.
- Added persisted completed idempotency keys for session completion.
- Added a concurrent duplicate completion regression test.
- Fixed `SessionCoachIntegration` to call the enriched coach-presence copy service after user changes shifted the API.
- Added `scripts/check-banned-patterns.js` with strict and audit modes.
- Added `npm run check:banned-patterns` and `npm run audit:banned-patterns`.
- Banned-pattern gate now passes with explicit canonical boundary allowlists for the API client, haptics wrapper, and accessibility role map.
- Split `SquadSyncIndicator.tsx` into a 163-line container plus focused member, toast, state, and type modules.

## Files Changed

- `GOAL.md`
- `jest.legacy-failing-tests.js`
- `package.json`
- `scripts/check-line-limit.js`
- `src/features/monetization/purchase-trust.ts`
- `src/features/monetization/__tests__/purchase-trust.test.ts`
- `src/features/session-completion/completion-orchestrator.ts`
- `src/features/session-completion/completion-query-invalidation.ts`
- `src/features/session-completion/completion-sync-state.ts`
- `src/features/session-completion/idempotency.ts`
- `src/features/session-completion/__tests__/completion-orchestrator-flow.test.ts`
- `src/session/integration/SessionCoachIntegration.ts`
- `scripts/check-banned-patterns.js`
- `src/session/components/SquadMemberIndicator.tsx`
- `src/session/components/SquadSyncIndicator.types.ts`
- `src/session/components/SquadSyncStates.tsx`
- `src/session/components/SquadSyncToasts.tsx`

## Verification Log

- `rtk tsc --noEmit`: passing in the prior run.
- `npm test -- purchase-trust.test.ts --runInBand`: 15 tests passed in the prior run.
- `npm test -- completion-orchestrator-flow.test.ts completion-orchestrator-return.test.ts phase1-exit-gate.test.ts --runInBand`: 8 tests passed in the prior run.
- `npm run audit:line-limit`: reports 108 current violations and exits 0.
- `npm run check:line-limit`: fails as expected on the same 108 current violations.
- `npm test -- completion-orchestrator-flow.test.ts --runInBand`: 4 tests passed.
- `npm test -- completion-orchestrator-flow.test.ts completion-orchestrator-return.test.ts completion-orchestrator-edge.test.ts phase1-exit-gate.test.ts --runInBand`: 14 tests passed.
- `rtk tsc --noEmit`: passing after fixing `SessionCoachIntegration`.
- `npm run audit:line-limit`: now reports 107 current violations and exits 0.
- `npm run audit:banned-patterns`: passes.
- `npm run check:banned-patterns`: passes.
- `rtk tsc --noEmit`: passing after the `SquadSyncIndicator` split.
- `npm run audit:line-limit`: now reports 106 current violations and exits 0.

## Failed Checks

- `rtk lint`: timed out after 124 seconds in the prior run.
- `rtk test -- npm test -- --runInBand`: timed out after 184 seconds in the prior run.
- `npm run check:line-limit`: fails until the existing line-limit backlog is decomposed.
- No failed checks from the banned-pattern gate.

## Risks Introduced

- Purchase trust now fails closed for raw receipts. Any UI still expecting client-side receipt success must route through RevenueCat restore/purchase APIs.
- Strict line-limit enforcement is intentionally failing against existing debt until the backlog is burned down.

## Blockers

- The working tree contains many user changes. Preserve them and avoid broad rewrites.
- Several session-completion files have active user edits; work with them rather than reverting them.
- Existing user edits changed coach-presence APIs; typecheck must be run after every pass.

## Next Objective Queue

- Fix session completion idempotency and reward synchronization.
- Continue splitting over-200-line production files.
- Split `ComboMeter.tsx`.
- Add a banned-pattern gate for `any`, `@ts-ignore`, `console.log`, `StyleSheet.create`, `FlatList`, `AsyncStorage`, and raw `fetch`.
- Build a canonical feature ownership map and identify duplicate legacy paths for deletion.
- Rework first-week product surface around one activation loop: start, complete, reflect, progress, plan next.

## Continuation Rule

After every objective, write the next objective into `GOAL.md` and keep going. If there is no obvious next objective, perform another audit pass and generate one from the highest-risk remaining area.

## Final Readiness Criteria

- `rtk tsc --noEmit` passes.
- Full focused feature suites pass without relying on legacy blacklists for core launch paths.
- Full Jest and lint are usable gates and pass or have documented, isolated non-launch exceptions.
- Strict line-limit gate passes for all non-generated source files.
- No fake purchase, reward, analytics, or persistence implementations remain in launch paths.
- Session completion is idempotent across duplicate events, offline replay, persistence retry, and app restart.
- First-week user journey is coherent, accessible, observable, and backed by real services.
