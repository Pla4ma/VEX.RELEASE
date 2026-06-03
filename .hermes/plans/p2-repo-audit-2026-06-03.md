# P2 Audit Task Progress
Last updated: 2026-06-03 (session)

## Completed
- [x] Replace `as Record<string, unknown>` in home containers — deleted `home-controller-stubs.ts`
- [x] Fix broken `useCoachRecommendations` import paths in home containers + add hook to `ai-coach/index.ts`
- [x] Fix broken home-screen imports through `ai-coach/hooks/index.ts` barrel (8 files)
- [x] Organize `progression/repository/` — split oversized `repository.ts` into domain files
  - `repository/focus-progression.ts` (191 lines, under limit)
  - `repository/session-history.ts` (153 lines, under limit)
  - `repository/completion-history.ts` (78 lines, under limit)
  - `repository/xp-history.ts` (168 lines, under limit)
  - `repository.ts` trimmed to 88 lines, re-exports all sub-modules
  - Progression directory now 26 files (15 unique source files); all under 200-line limit

## Current
- TypeScript: zero errors confirmed

## Not Started
- [ ] Relocate orphan files with wrong directory placement (apps/, lib/, core/, utils/)
- [ ] Delete duplicate files in wrong locations
- [ ] Audit `features/*/index.ts` but report only — do not touch
- [ ] Delete or archive `home-controller-stubs.ts` if not reachable (deleted above)
- [ ] Delete or archive `features/*/integration-enhanced.ts` and `repository-enhanced.ts` variants
- [ ] Standardize naming: lint-only audit, do not rename anything
- [ ] Re-verify all TS errors after every deletion/move pass
