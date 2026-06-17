DO $$
DECLARE
  policy_record record;
  rls_table text;
BEGIN
  FOREACH rls_table IN ARRAY ARRAY[
    'circle_activities',
    'circle_invites',
    'circle_members',
    'circle_weekly_checks',
    'journey_milestones',
    'journey_seasons',
    'season_journeys',
    'study_buddies',
    'study_buddy_check_ins',
    'study_buddy_encouragements',
    'study_buddy_shared_goals',
    'study_circles',
    'user_journey_claims',
    'user_journeys'
  ]
  LOOP
    IF to_regclass(format('public.%I', rls_table)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', rls_table);
    END IF;
  END LOOP;

  IF to_regclass('public.users') IS NOT NULL THEN
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
    REVOKE ALL ON TABLE public.users FROM anon;
    REVOKE ALL ON TABLE public.users FROM authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users TO authenticated;

    FOR policy_record IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'users'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', policy_record.policyname);
    END LOOP;

    CREATE POLICY "Users can read own profile"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (id = auth.uid() AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

    CREATE POLICY "Users can insert own profile"
      ON public.users
      FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid() AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

    CREATE POLICY "Users can update own profile"
      ON public.users
      FOR UPDATE
      TO authenticated
      USING (id = auth.uid() AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false)
      WITH CHECK (id = auth.uid() AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

    CREATE POLICY "Users can delete own profile"
      ON public.users
      FOR DELETE
      TO authenticated
      USING (id = auth.uid() AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
  END IF;

  IF to_regclass('public.user_sessions') IS NOT NULL THEN
    ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_sessions FORCE ROW LEVEL SECURITY;
    REVOKE ALL ON TABLE public.user_sessions FROM anon;
    REVOKE ALL ON TABLE public.user_sessions FROM authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_sessions TO authenticated;

    FOR policy_record IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'user_sessions'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_sessions', policy_record.policyname);
    END LOOP;

    CREATE POLICY "Users can read own sessions"
      ON public.user_sessions
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid() AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

    CREATE POLICY "Users can insert own sessions"
      ON public.user_sessions
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid() AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

    CREATE POLICY "Users can update own sessions"
      ON public.user_sessions
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid() AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false)
      WITH CHECK (user_id = auth.uid() AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

    CREATE POLICY "Users can delete own sessions"
      ON public.user_sessions
      FOR DELETE
      TO authenticated
      USING (user_id = auth.uid() AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
  END IF;

  IF to_regclass('auth.users') IS NOT NULL THEN
    REVOKE ALL ON TABLE auth.users FROM anon, authenticated;
  END IF;

  IF to_regclass('auth.sessions') IS NOT NULL THEN
    REVOKE ALL ON TABLE auth.sessions FROM anon, authenticated;
  END IF;

  IF to_regclass('auth.identities') IS NOT NULL THEN
    REVOKE ALL ON TABLE auth.identities FROM anon, authenticated;
  END IF;

  IF to_regclass('auth.refresh_tokens') IS NOT NULL THEN
    REVOKE ALL ON TABLE auth.refresh_tokens FROM anon, authenticated;
  END IF;
END $$;
