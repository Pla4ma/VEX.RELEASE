# VEX Production Rescue Goal

Current objective: audit and fix session completion idempotency and reward synchronization risks.

## Audit Snapshot

Verification baseline:
- `rtk tsc --noEmit`: passing.
- `rtk lint`: timed out after 124 seconds, so lint is not a usable fast gate yet.
- `rtk test -- npm test -- --runInBand`: timed out after 184 seconds, so full Jest is not a usable fast gate yet.
- Working tree is already heavily dirty. Preserve existing user changes and avoid unrelated reversions.

Critical findings:
- File-size rule is systemically violated. At least 100 TypeScript files exceed 200 lines. Some files are minified single-line dumps over 10,000 characters, making review, diffs, and ownership unsafe.
- Several modules bypass the mandated feature layout. Legacy roots such as `src/session`, `src/services`, `src/analytics`, `src/accessibility`, and `src/production` hold feature/business logic outside `features/<name>/service.ts` and repository boundaries.
- Supabase access is scattered outside canonical repositories, including `src/services/supabaseAuth.ts`, `src/services/realtime.ts`, `src/features/session-story/NarrativeQueries.ts`, and nested repository fragments that do not follow the required feature shape.
- Monetization contains production blockers. `src/features/monetization/purchase-trust.ts` verifies receipts by returning `verified: true`, restores purchases as an empty array, and computes a fake hash that ignores the secret. This is not App Store or RevenueCat safe.
- Test quality is masking risk. Many tests use `as any`, private method access, giant one-line fixtures, and mocks that assert stub behavior instead of real contracts.
- Several product systems appear duplicated or competing: old `src/session` session engine, newer `features/session-*` flows, reward services in both shared/service roots and feature roots, multiple analytics frameworks, and multiple monetization layers.
- UI/state requirements are inconsistently enforced. Some data-driven components still rely on placeholders, ActivityIndicator-only patterns, hardcoded token aliases, and component-local decision logic.
- Runtime observability is incomplete. Unexpected async paths sometimes log through debug helpers or return false instead of capturing unrecoverable failures to Sentry with a typed boundary.
- Product scope is overgrown for first-week proof. Bosses, squads, battle pass, economy, inventory, achievements, AI coach, Study OS, personalization, and liveops all compete for attention instead of one clear seven-day activation loop.

## Fix Strategy

Order of operations:
1. Stabilize revenue and trust paths: remove fake purchase verification behavior and force all purchase validation through the shared RevenueCat layer.
2. Stabilize the session-completion spine: ensure one canonical completion path writes ledger, progression, streak, rewards, analytics, and offline fallback exactly once.
3. Decompose minified and over-limit production files by domain, not `.part-N.ts`.
4. Consolidate duplicated feature ownership into canonical `features/<name>/` layers.
5. Replace tests that assert stubs with schema-backed service tests and focused integration tests.
6. Add fast gates for line limit, banned patterns, and feature-boundary violations so regressions cannot re-enter.
7. Rework first-week product surface around one activation promise: start session, complete session, reflect, see progress, plan next session.

## Completed Objectives

Fix monetization purchase trust:
- Replaced fake client receipt verification with an explicit unverified result.
- Routed restore through the shared RevenueCat service and throw on unavailable/failed restore.
- Replaced fake client hash generation with an unsupported boundary.
- Unblacklisted and rewrote `purchase-trust.test.ts`.
- Verified with `npm test -- purchase-trust.test.ts --runInBand` and `rtk tsc --noEmit`.

Add a line-limit enforcement gate:
- Added `scripts/check-line-limit.js`.
- Added `npm run audit:line-limit` and `npm run check:line-limit`.
- Excluded generated `src/types/supabase.ts`.
- Verified audit mode: reports 108 current violations and exits 0.
- Verified strict mode: fails on the same 108 current violations.
- Verified TypeScript with `rtk tsc --noEmit`.

## Active Objective

Decompose `src/features/session-completion/completion-orchestrator.ts`:
- Extracted query invalidation to `completion-query-invalidation.ts`.
- Extracted UI sync-state mapping to `completion-sync-state.ts`.
- Reduced `completion-orchestrator.ts` from 223 to 186 lines.
- Verified with `completion-orchestrator-flow.test.ts`, `completion-orchestrator-return.test.ts`, `phase1-exit-gate.test.ts`, and `rtk tsc --noEmit`.

## Active Objective

Audit and fix session completion idempotency/reward sync:
- Inspect `completion-subsystems.ts`, idempotency helpers, ledger writes, and offline sync.
- Confirm rewards/progression/streaks cannot double-apply across retry, offline queue, duplicate events, or app restart.
- Add or update focused tests before changing behavior.
- Keep every touched file at or below 200 lines.
- Run focused tests and TypeScript.

## Next Objectives

- Audit and fix session completion idempotency and reward synchronization.
- Split the largest minified production files into readable modules.
- Build a canonical feature ownership map and delete duplicate legacy paths after coverage exists.
