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
      AND has_function_privilege('public', p.oid, 'EXECUTE')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', function_record.signature);
  END LOOP;

  FOR policy_record IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname IN ('public', 'storage', 'realtime')
      AND 'authenticated' = ANY (roles)
  LOOP
    IF policy_record.qual IS NOT NULL
      AND policy_record.qual NOT ILIKE '%is_anonymous%'
    THEN
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I USING ((%s) AND %s)',
        policy_record.policyname,
        policy_record.schemaname,
        policy_record.tablename,
        policy_record.qual,
        guard
      );
    END IF;

    IF policy_record.with_check IS NOT NULL
      AND policy_record.with_check NOT ILIKE '%is_anonymous%'
    THEN
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
