CREATE POLICY admin_users_self_read ON public.admin_users
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

CREATE POLICY battle_pass_tiers_authenticated_read ON public.battle_pass_tiers
  FOR SELECT TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

CREATE POLICY unified_wallets_owner_read ON public.unified_wallets
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

CREATE POLICY unified_wallets_owner_insert ON public.unified_wallets
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

DO $$
DECLARE
  function_record record;
  policy_record record;
  guard text := 'COALESCE((auth.jwt() ->> ''is_anonymous'')::boolean, false) = false';
BEGIN
  FOR function_record IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND has_function_privilege('anon', p.oid, 'EXECUTE')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', function_record.signature);
  END LOOP;

  FOR policy_record IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname IN ('public', 'storage', 'realtime')
      AND ('public' = ANY (roles) OR 'anon' = ANY (roles))
  LOOP
    EXECUTE format(
      'ALTER POLICY %I ON %I.%I TO authenticated',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );

    IF policy_record.qual IS NOT NULL AND policy_record.qual NOT ILIKE '%' || guard || '%' THEN
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I USING ((%s) AND %s)',
        policy_record.policyname,
        policy_record.schemaname,
        policy_record.tablename,
        policy_record.qual,
        guard
      );
    END IF;

    IF policy_record.with_check IS NOT NULL AND policy_record.with_check NOT ILIKE '%' || guard || '%' THEN
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I WITH CHECK ((%s) AND %s)',
        policy_record.policyname,
        policy_record.schemaname,
        policy_record.tablename,
        policy_record.with_check,
        guard
      );
    END IF;
  END LOOP;
END $$;
