DO $$
DECLARE
  function_record record;
BEGIN
  FOR function_record IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated', function_record.signature);
  END LOOP;
END $$;
