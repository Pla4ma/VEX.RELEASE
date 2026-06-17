DO $$
DECLARE
  policy_record record;
  optimized_qual text;
  optimized_check text;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname IN ('public', 'storage', 'realtime')
      AND (
        qual LIKE '%auth.uid()%'
        OR qual LIKE '%auth.jwt()%'
        OR with_check LIKE '%auth.uid()%'
        OR with_check LIKE '%auth.jwt()%'
      )
  LOOP
    optimized_qual := replace(replace(policy_record.qual, 'auth.uid()', '(select auth.uid())'), 'auth.jwt()', '(select auth.jwt())');
    optimized_check := replace(replace(policy_record.with_check, 'auth.uid()', '(select auth.uid())'), 'auth.jwt()', '(select auth.jwt())');

    IF policy_record.qual IS NOT NULL THEN
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I USING (%s)',
        policy_record.policyname,
        policy_record.schemaname,
        policy_record.tablename,
        optimized_qual
      );
    END IF;

    IF policy_record.with_check IS NOT NULL THEN
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I WITH CHECK (%s)',
        policy_record.policyname,
        policy_record.schemaname,
        policy_record.tablename,
        optimized_check
      );
    END IF;
  END LOOP;
END $$;
