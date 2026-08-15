-- Seed a development bypass user so the app's "Skip login" path can establish
-- a real Supabase session (instead of a fake local user with no session, which
-- makes every RLS-protected insert fail as `anon`).
--
-- The id matches the sentinel used by src/screens/auth/LoginScreen.tsx
-- (DEV_BYPASS_USER_ID), and the email/password match the dev credentials the
-- app uses to sign in. The existing owner policies on captures/plan_* require
-- auth.uid() = user_id and a non-anonymous session, which this user satisfies
-- without relaxing any security.
--
-- DEV ONLY. Remove this migration (and the app's dev-bypass) before release.

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'local-dev@vex.app',
  crypt('local-dev-password-2026', gen_salt('bf')),
  now(),
  jsonb_build_object('provider', 'email', 'providers', array['email']),
  jsonb_build_object('username', 'localdev'),
  now(),
  now(),
  '',
  '',
  '',
  ''
)
on conflict (id) do nothing;

-- Ensure the dev user has an onboarding profile row (no trigger creates these).
insert into public.onboarding_profiles (user_id, status)
values ('00000000-0000-0000-0000-000000000001', 'COMPLETE')
on conflict (user_id) do nothing;
