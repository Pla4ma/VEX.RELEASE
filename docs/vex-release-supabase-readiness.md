# VEX Supabase Release Readiness

## Project
- Supabase project: `icnbpjkyupuqzuvwuvbk`
- Name from connector: `VEX OFFICIAL`
- Security advisor fetch blocked: Supabase connector requires reauthentication.

## Post-Signup Failures
- `notifications`: likely auth/RLS timing. App now treats bootstrap read denial as empty notification state.
- `progression`: schema mismatch plus empty row. App now returns starter progression when live schema rejects create/read.
- `user_achievements`: schema mismatch. App now returns empty achievement state when launch columns are absent.
- `focus_score_current`: schema mismatch on selected top-factor columns. App now returns null score on that mismatch.
- `mastery_tracks`: empty row/schema mismatch. App now returns null/starter mastery instead of throwing.
- `streaks`: mostly empty-row handling; existing code already handles no row in core path.

## Signup Hardening
- Unconfirmed Supabase signups no longer mark user authenticated.
- Duplicate signup calls for the same email are suppressed for 60 seconds.
- Register screen sends confirmation-required users to `VerifyEmail`.
- Live resend still needs final wiring in `VerifyEmailScreen`; current screen remains UI-only and over the 200-line limit risk if patched inline.

## Admin Dashboard
No `vex-admin` project exists under this workspace. I could not update overview/users/sessions pages here. Required changes once admin repo is available:
- Replace `profiles` with `users`.
- Replace `sessions` with `user_sessions`.
- Update Zod row schemas from generated Supabase types.
- Replace setup/empty placeholders with real query states.
- Show security status from `admin_users`, `battle_pass_tiers`, `feature_flags`, and `liveops_config`.

## SQL Proposal
Review [supabase-release-sql-proposal.sql](./supabase-release-sql-proposal.sql) before applying. It includes:
- RLS enablement for `public.admin_users`.
- RLS enablement for `public.battle_pass_tiers`.
- Admin write policy via `public.is_admin_user()`.
- Launch flag seeds for `aiCoachEnabled`, `squadsEnabled`, `premiumEnabled`, `rewardsEnabled`.
- LiveOps config seeds for launch readiness.

## SECURITY DEFINER Plan
- Keep only functions that need privilege escalation as `SECURITY DEFINER`.
- Every `SECURITY DEFINER` function must use `set search_path = ''`.
- Revoke `public` execute by default; grant only `authenticated` or service roles as needed.
- Prefer invoker-rights functions for read-only dashboard summaries.
- Re-run Supabase security advisor after reauthentication and after applying SQL.
