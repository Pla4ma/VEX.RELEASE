# VEX Release TODO

## Active
- [x] Map post-signup bootstrap Supabase queries and classify failures.
- [x] Patch signup bootstrap empty-row/schema/auth handling.
- [x] Harden signup submit/resend guards and rate-limit UX.
- [x] Locate `vex-admin` code and connect it to live `users` / `user_sessions`.
- [x] Prepare Supabase security SQL plan for `admin_users`, `battle_pass_tiers`, SECURITY DEFINER findings.
- [x] Wire feature flags to `feature_flags` and `liveops_config`, with launch flags seed SQL.
- [x] Run TypeScript/tests for touched surfaces.

## Blocked
- [ ] Update `vex-admin` screens: no `vex-admin` project exists in this workspace.
- [ ] Fetch live Supabase security advisors: connector requires reauthentication.
- [ ] Apply database migration: SQL review requested before applying.

## Findings
- Repo is already dirty; changes must avoid unrelated modified files.
- Only root `AGENTS.md` applies under app source, excluding `node_modules`.
- `icnbpjkyupuqzuvwuvbk` is connected as `VEX OFFICIAL`, but Supabase app advisor calls require reauthentication.
- No `vex-admin` app exists under this workspace. Current checkout is mobile `vex-app`.
- Bootstrap failures split:
  - Schema mismatch: `progression` and `user_achievements` repositories expect XP/achievement columns while generated live table columns expose only generic `metadata` rows.
  - Empty-row handling: `.single()` is used for new-account rows that may not exist yet.
  - Auth/session: immediate post-signup queries can run before a confirmed session exists, producing RLS 401/406.
- Verification: `rtk npx tsc --noEmit` passed.
- Verification: targeted Jest auth/store/progression/achievements tests passed.
- Verification: `npm run check:line-limit` still fails on pre-existing unrelated oversized files.
