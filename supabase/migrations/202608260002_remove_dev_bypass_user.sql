-- Remove the development-only bypass identity on databases where the seed ran.
-- Safe on clean databases: both deletes are no-ops when the sentinel is absent.
DELETE FROM public.onboarding_profiles
WHERE user_id = '00000000-0000-0000-0000-000000000001';

DELETE FROM auth.users
WHERE id = '00000000-0000-0000-0000-000000000001'
  AND email = 'local-dev@vex.app';
