-- Preserve authenticated ownership and non-anonymous guards while caching
-- request-level auth values. No rows or user data are changed.
BEGIN;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '20s';

ALTER POLICY study_content_owner_select ON public.study_content
USING (user_id = (SELECT auth.uid())
  AND COALESCE(((SELECT auth.jwt())->>'is_anonymous')::boolean, false) = false);

ALTER POLICY study_content_owner_delete ON public.study_content
USING (user_id = (SELECT auth.uid())
  AND COALESCE(((SELECT auth.jwt())->>'is_anonymous')::boolean, false) = false);

ALTER POLICY study_content_owner_update ON public.study_content
USING (user_id = (SELECT auth.uid())
  AND COALESCE(((SELECT auth.jwt())->>'is_anonymous')::boolean, false) = false)
WITH CHECK (user_id = (SELECT auth.uid())
  AND COALESCE(((SELECT auth.jwt())->>'is_anonymous')::boolean, false) = false);

ALTER POLICY study_content_unlocked_insert ON public.study_content
WITH CHECK (user_id = (SELECT auth.uid())
  AND COALESCE(((SELECT auth.jwt())->>'is_anonymous')::boolean, false) = false
  AND public.can_upload_study_content((SELECT auth.uid())));

-- Identical to battle_pass_tiers_authenticated_read for the same role.
DROP POLICY battle_pass_tiers_public_read ON public.battle_pass_tiers;
-- Always false: contributes no permission to the permissive policy union.
DROP POLICY rate_limit_service_only ON public.rate_limit_buckets;

-- Retain the original unique constraint and reject unexpected schema drift.
DO $$
BEGIN
  IF (SELECT pg_get_constraintdef(oid) FROM pg_constraint
      WHERE conrelid = 'public.session_completion_ledgers'::regclass
      AND conname = 'session_completion_ledgers_idempotency_key_key')
      IS DISTINCT FROM 'UNIQUE (idempotency_key)' THEN
    RAISE EXCEPTION 'Expected retained idempotency constraint is missing';
  END IF;
END $$;
ALTER TABLE public.session_completion_ledgers
  DROP CONSTRAINT session_completion_ledgers_idempotency_key_unique;
COMMIT;

-- Rollback: restore the duplicate UNIQUE(idempotency_key) constraint, recreate
-- battle_pass_tiers_public_read with the authenticated non-anonymous predicate,
-- recreate rate_limit_service_only USING(false) WITH CHECK(false), and replace
-- auth scalar subqueries above with their original direct calls. Permissions
-- remain equivalent; retaining this migration only avoids redundant work.
