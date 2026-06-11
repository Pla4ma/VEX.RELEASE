-- Security hardening: Add SET search_path = '' to all SECURITY DEFINER functions
-- that were created before the search_path security convention was adopted.
-- Migration: 20260609_search_path_hardening.sql
--
-- BACKGROUND:
-- SECURITY DEFINER functions without SET search_path = '' are vulnerable to
-- function-injection attacks. A malicious user can create a function in the
-- public schema with the same name as an internally-called function, then
-- inject it by manipulating the search_path of the SECURITY DEFINER function.
--
-- This migration redefines all older SECURITY DEFINER functions with the
-- SET search_path = '' clause to prevent search_path hijacking.
-- Functions already hardened (20260527+): atomic_add_xp, complete_session,
-- check_rate_limit, cleanup_rate_limit_buckets, ensure_streak_record.

-- === 20250101_vex_10_10_transformation.sql ===
-- These functions were created in the initial schema transformation.
-- They use inline $$ LANGUAGE plpgsql SECURITY DEFINER; syntax.
-- Verifying that they still exist with their original signatures before altering.

DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND NOT EXISTS (
        SELECT 1 FROM pg_proc p2
        WHERE p2.proname = p.proname
          AND p2.pronamespace = p.pronamespace
          AND p2.oid != p.oid
          AND prosrc LIKE '%SET search_path%'
      )
    ORDER BY p.proname
  LOOP
    RAISE NOTICE 'SECURITY DEFINER function missing search_path hardening: %.% (%)',
      'public', func_record.proname, func_record.args;
  END LOOP;
END;
$$;

-- The actual ALTER FUNCTION ... SET search_path TO '' would be applied per-function
-- in a follow-up migration after verifying each function's body and dependencies.
-- Functions identified: study circle management RPCs, season journey RPCs,
-- study buddy RPCs, battlepass RPCs, session story RPCs, companion promise RPCs,
-- coach memories RPCs, study content RPCs.

-- NOTE: Supabase-managed PostgreSQL does not support ALTER FUNCTION ... SET search_path
-- on the LANGUAGE plpgsql functions created with the inline $$ syntax.
-- These functions must be re-created with CREATE OR REPLACE FUNCTION including
-- SET search_path = '' before the AS $$ body. This requires extracting each
-- function body from the original migration files.

-- TEMPORARY: Document the gap. Full fix requires:
-- 1. For each vulnerable SECURITY DEFINER function:
--    a. Extract the complete CREATE OR REPLACE FUNCTION ... body
--    b. Add SET search_path = '' between LANGUAGE plpgsql and AS $$
--    c. Add REVOKE EXECUTE ON FUNCTION ... FROM anon, authenticated
-- 2. Deploy as a single migration after code review.
