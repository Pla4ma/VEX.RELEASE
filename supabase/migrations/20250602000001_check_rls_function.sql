-- Migration: Create check_rls_status RPC for CI verification
-- Every table in public schema must have RLS enabled.

CREATE OR REPLACE FUNCTION public.check_rls_status()
RETURNS TABLE(tablename text, rls_status text)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    t.tablename::text,
    CASE
      WHEN t.rowsecurity = true THEN 'ENABLED'
      ELSE 'MISSING'
    END AS rls_status
  FROM pg_catalog.pg_tables t
  WHERE t.schemaname = 'public'
    AND t.tablename NOT LIKE '\_%'
  ORDER BY rls_status DESC, t.tablename;
$$;

REVOKE ALL ON FUNCTION public.check_rls_status() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_rls_status() FROM anon;
REVOKE ALL ON FUNCTION public.check_rls_status() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_rls_status() TO service_role;
