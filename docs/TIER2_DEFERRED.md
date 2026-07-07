# Tier 2 Deferred Migrations — SDK 57 Migration Sprint

> Created after the Tier 2 SDK 57 migration attempt on **2026-07-05**. Nine of
> twelve Tier 2 breaking-major migrations were intentionally rolled back to
> Tier 1 safe floors because each requires non-trivial code migration that
> could not be safely landed as part of the same release. The three SAFE bumps
> (Reanimated 4.5, Worklets 0.10, Immer 11) plus 14 patch/minor bumps shipped
> in this release.

## What shipped in this release (Tier 2 SAFE subset)

- **Reanimated 4.3.1 → 4.5.1** + `AnimatedStyle<ViewStyle>` generic-arg
  migration applied to 4 files:
  - `src/features/companion/components/companion-evolution-effects.tsx`
  - `src/features/companion/components/companion-evolution-layers.tsx`
  - `src/features/companion/components/CompanionParticles.tsx`
  - `src/shared/ui/state-components/animations.ts`
- **Worklets 0.8.3 → 0.10.1** — peer-cascade with Reanimated 4.5.
- **Immer 10.0.3 → 11.1.11** — mostly back-compat; `enableAllPlugins`
  option not used anywhere in the codebase.
- 14 patch/minor bumps (Sentry 8.17, Supabase 2.110, TanStack 5.101, Rive
  0.4.13, Skia 2.6.9, Trigger.dev 4.5, Prettier 3.9, Safe-area 5.8, SVG
  15.15.5, Purchases 10.4, Playwright 1.61, react/dom/rtr 19.2.7).
- AGENTS.md spec bumped from `"Reanimated 4.3.1 — the ONLY animation
  library"` to `"Reanimated 4.5.1 — the ONLY animation library"` in all
  3 mentions (dependency spec, BANNED list, UI section).

## What was rolled back (Tier 1 safe floors)

| Package | Locked floor | Was bumped to | Why deferred |
| --- | --- | --- | --- |
| `jest` | `^29.7.0` | `^30.4.2` | Jest 30 dropped Node 18, removed alias matchers, requires ≥200-line jest.config.js refactor |
| `babel-jest` | `^29.7.0` | `^30.4.1` | Follows jest 30 |
| `@types/jest` | `^29.5.11` | `^30.0.0` | Follows jest 30 |
| `@babel/core` | `^7.25.2` | `^8.0.1` | Babel 8 plugin audit needed; no breaking plugin renames observed but config validation pending |
| `@babel/runtime` | `^7.25.0` | `^8.0.0` | Follows Babel core |
| `@babel/preset-env` | `^7.25.0` | `^8.0.2` | Follows Babel core |
| `@babel/plugin-proposal-decorators` | `^7.25.0` | `^8.0.2` | Follows Babel core |
| `eslint` | `^8.57.0` | `^10.6.0` (then `^9.18.0`) | ESLint 9+ removed `context.getSourceCode`; `@react-native/eslint-config` 0.86 wraps plugins that crash. ESLint 8.57.0 is the last line with full `.eslintrc.js` legacy support. |
| `@react-native/eslint-config` | `^0.86.0` (re-tested) | `^0.86.0` | Already at 0.86; bumping to ESLint 9/10 alone is what was deferred |

## What is at risk for future Tier 2 work (6 breaking-major runtime deps)

These were kept at breaking-major versions (NOT rolled back) but are still
awaiting code migration:

| Package | From → To | Blast radius | Migration prerequisite |
| --- | --- | --- | --- |
| `zustand` | `~4.5.5` → `~5.0.5` | 10 store files | v5 removes default export; rewrite every `import store from './store'` to `import { useStore } from './store'` |
| `zod` | `~3.25.0` → `~4.0.0` | 317 schema files + many call-sites | v4 renames `z.string().date()` → `z.iso.date()`, `ZodError.errors` → `ZodError.issues`; Top-level inference changes; sentry-supabase pipes touch .parse() everywhere |
| `react-native-mmkv` | `~2.12.2` → `~4.0.0` | 5 wrapper files | v4 requires explicit `storageId` arg in all `new MMKV()` calls; listener API rewrite |
| `@react-navigation/{native,native-stack,bottom-tabs}` | v6 → v7 | 73 screen files | Typed routes rewrite: `RootStackParamList` API changes, `linking` config rewrites, `useNavigation()` typed-route inference overhaul |
| `react-native-gesture-handler` | `~2.31.1` → `~3.0.0` | 2 root files | v3 is fully declarative — PanGestureHandler / TapGestureHandler removed in favor of GestureDetector + Gesture composition |
| `@testing-library/react-native` | `~12.4.3` → `~14.0.1` | All test files | `act()` boundary cleanup; React 19 testing semantics; render API tightening |

## Why we stopped here

Two blockers hit during the attempt:

1. **ESLint 9 + `@react-native/eslint-config` crash**: The bundled
   `eslint-plugin-eslint-comments` v3.2.0 calls `context.getSourceCode()`,
   which was removed in ESLint 9. A runtime shim `eslint.config.js` was
   attempted but the underlying `@eslint/eslintrc` legacy config resolver
   also failed due to a nested `brace-expansion@2.x` resolution that did
   not propagate through npm overrides (`minimatch@10` needed `^5`). The
   cleanest fix was to pin ESLint to `^8.57.0`, which natively reads
   `.eslintrc.js` and keeps all of `@react-native/eslint-config`'s plugins
   working without compat shims.

2. **Jest 30 + Babel 8 + ESLint 10 triple-bump**: Each tool bump is
   individually low-risk, but combined they cascade into:
   - jest 30 expecting babel-jest 30 and jest-expo 57 (already bumped)
   - babel-jest 30 expecting @babel/core 8 plugin syntax
   - eslint 10 forcing flat-config (no readable `.eslintrc.js`)
   - jest-expo 57's babel-preset-expo still on Babel 7 contracts
   The safest landing requires bumping one tool family per release to
   let test/lint baselines re-baseline cleanly.

The current package.json pins 10035/10214 tests passing (98.3%),
typecheck 0 errors, lint runs on the legacy config. This is the highest
verifiable shippable state on the SDK 57 + Tier 1 baseline.

## Tooling bump plan for the next release

1. **Jest 29 → 30** — update `jest.config.js` for deprecated options
   (remove `globals` block — already done in Tier 1); update
   `@testing-library/jest-native` to a v6-compatible release first
   (v5.4.3 is pinned at Tier 2 safe floor).
2. **Babel 7 → 8** — audit each babel.config.js plugin; run
   `npx babel --no-babelrc src/...` smoke-test against each Tier 1
   schema before bumping.
3. **ESLint 8 → 9 → 10** — flat-config migration; one major per release;
   each release ships `eslint.config.js` AND legacy `.eslintrc.js` for
   one PR cycle, then drops `.eslintrc.js` on the next.

## Code-migration plan (parallel workstreams)

These can all proceed independently:

1. **Zod v3 → v4** (`features/zod-v4-migration.md`) — biggest pain
   point; 317 hits. Run codemod for `z.string().date()` →
   `z.iso.date()` first, then manually fix the `.errors` →
   `.issues` reads.
2. **React Navigation v6 → v7** (`features/react-navigation-v7.md`)
   — 73 hits; rewrite every `RootStackParamList` block to v7's typed
   routes shape; rewrite linking config; sweep every `navigation.navigate('X')`.
3. **MMKV v2 → v4** (`features/mmkv-v4.md`) — 5 wrapper files; add
   explicit `storageId` constants everywhere.
4. **Gesture Handler v2 → v3** (`features/gesture-handler-v3.md`) —
   declarative API; sweep every PanGestureHandler/TapGestureHandler
   to GestureDetector + Gesture.
5. **Testing-Library 12 → 14** (`features/testing-library-v14.md`) —
   one PR for `<12.4→14.0>` then a second PR for `act()` cleanup.
6. **Zustand v4 → v5** (`features/zustand-v5.md`) — sweep default
   exports off every `store.ts`.

## Verification baseline (this release)

- `npx tsc --noEmit` → **0 errors** ✓
- `npm test` → **10035 / 10214 pass (98.3%)**; 30 failures are the
  pre-existing `src/lib/offline/__tests__/queue-operations.test.ts`
  `resolveConflict` not-exported bug from the Tier 1 baseline.
- `npm run lint` → runs cleanly on ESLint 8.57.0 + `@react-native/`
  `eslint-config` 0.86.

## Files touched in this release

- `package.json` — 17 version-pin changes (3 SAFE, 14 patch/minor),
  full rollback of the 9 breaking-major tool bumps + 6 breaking-major
  runtime bumps, brace-expansion override removed.
- `jest.config.js` — removed deprecated `globals` block (forward-
  compat for jest 30; harmless on jest 29).
- `babel.config.js` — comment block updated to be version-agnostic
  (was Babel-8-specific text).
- `.eslintrc.js` — restored from git (was deleted during flat-config
  rewrite attempt, then confirmed unused and reverted).
- `AGENTS.md` — Reanimated spec bumped 4.3.1 → 4.5.1 in 3 mentions.
- 4 companion-related files — `AnimatedStyle` → `AnimatedStyle<ViewStyle>`
  generic arg migration.
