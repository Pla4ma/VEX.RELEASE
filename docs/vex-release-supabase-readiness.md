# VEX Supabase Release Readiness

## Project
- Supabase project: `icnbpjkyupuqzuvwuvbk`
- Name from connector: `VEX OFFICIAL`
- Security advisor fetch blocked: Supabase connector requires reauthentication.

## AI Provider Routing
- The shared `ai` route and `ai-coach` try OpenAI-compatible candidates first, then configured Gemini models after the compatible provider fails. AI Coach validates coach replies before accepting each candidate.
- Study Content validates generated plans before persistence and tries the next configured model/provider when a request or plan fails.
- Fallbacks only run when the corresponding server-side credential is configured. A valid key is not proof that its model is available, under quota, or included in a free tier.
- Repository checks do not prove the deployed Edge Function version or remote secret values. Verify both in Supabase before release; never paste secret values into logs or chat.
- Live AI routing is still unverified: Deno Edge Function checks could not run in this environment, and local browser requests to Supabase were blocked. Before release, verify deployed function versions, server-side provider secrets without exposing values, fallback across each shipped AI flow, and Android signed-in/skip-login behavior.

## Functional Repair Pass
- Day-zero access now keeps the full Boss route gated until its configured unlock threshold; the lightweight teaser remains separate. Study route registration follows `FeatureAvailability`.
- Study Library history uses offset pages, so older saved items are reachable beyond the initial 20.
- Export category, format, date range, and metadata choices now reach export generation; export-job query errors are distinct from a truly empty history.
- Analytics consent persists locally and controls analytics initialization. Nonfunctional archived social privacy switches were removed; the profile settings row no longer promises editing that the destination does not provide.
- Account deletion reports local cleanup status independently after remote deletion instead of presenting a cleanup failure as if the remote deletion had not happened.
- Session completion now exposes a personalized session-setup next action instead of null progression fields.
- Completion unlock announcements now derive before/after counts from persisted session statistics, not the reset-prone in-memory onboarding counter.

These are source changes, not proof of the deployed backend or Android runtime. Verify Supabase Edge Function deployments, server-side model credentials/provider availability, and auth flows on a device before release.

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
