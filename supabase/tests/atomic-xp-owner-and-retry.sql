BEGIN;
SELECT set_config('vex.test_user', gen_random_uuid()::text, true),
       set_config('vex.test_session', gen_random_uuid()::text, true);
INSERT INTO auth.users(id) VALUES (current_setting('vex.test_user')::uuid);
INSERT INTO public.session_completion_ledgers(user_id,session_id,idempotency_key,ledger_payload,completed_at,created_at,offline_sync_status)
VALUES(current_setting('vex.test_user')::uuid,current_setting('vex.test_session')::uuid,'rollback-receipt',jsonb_build_object('xpDelta',301),0,0,'synced');
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('vex.test_user'),'role','authenticated','is_anonymous',false)::text,true);
SET LOCAL ROLE authenticated;
DO $$
DECLARE r jsonb;
BEGIN
  r := public.atomic_add_xp(current_setting('vex.test_user')::uuid,301,'SESSION_COMPLETE',current_setting('vex.test_session')::uuid,'rollback-receipt:xp');
  IF (r->>'new_level')::int <> 3 OR (r->>'new_total_xp')::int <> 301 THEN RAISE EXCEPTION 'Canonical curve failed'; END IF;
  r := public.atomic_add_xp(current_setting('vex.test_user')::uuid,301,'SESSION_COMPLETE',current_setting('vex.test_session')::uuid,'rollback-receipt:xp');
  IF NOT (r->>'duplicate')::boolean OR (r->>'new_total_xp')::int <> 301 OR (r->>'new_level')::int <> 3 THEN RAISE EXCEPTION 'Duplicate balance failed'; END IF;
  IF (SELECT count(*) FROM public.xp_history WHERE user_id=current_setting('vex.test_user')::uuid) <> 1 THEN RAISE EXCEPTION 'Duplicate history failed'; END IF;
  BEGIN
    PERFORM public.atomic_add_xp(gen_random_uuid(),301,'SESSION_COMPLETE',current_setting('vex.test_session')::uuid,'foreign-key');
    RAISE EXCEPTION 'Foreign owner accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.atomic_add_xp(current_setting('vex.test_user')::uuid,302,'SESSION_COMPLETE',current_setting('vex.test_session')::uuid,'inflated-key');
    RAISE EXCEPTION 'Inflated award accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('vex.test_user'),'role','authenticated','is_anonymous',true)::text,true);
  BEGIN
    PERFORM public.atomic_add_xp(current_setting('vex.test_user')::uuid,301,'SESSION_COMPLETE',current_setting('vex.test_session')::uuid,'anonymous-key');
    RAISE EXCEPTION 'Anonymous award accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'atomic XP owner, canonical curve, duplicate receipt and inflation checks passed; all fixture writes rolled back' AS validation;
