-- Spendable economy is explicitly archived by the release feature policy.
-- Client RPC access still allowed arbitrary caller-selected wallet credits;
-- disabling UI entry points does not disable the public RPC endpoints.
BEGIN;
SET LOCAL lock_timeout = '3s';

REVOKE EXECUTE ON FUNCTION public.apply_wallet_delta(uuid,text,integer,text,text,uuid,text,jsonb)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.atomic_add_currency(uuid,text,integer,text)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.atomic_spend_currency(uuid,text,integer,text)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_currency(uuid,text,integer,text,uuid,text)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_currency_idempotent(uuid,text,integer,text,text,uuid,text)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.spend_currency_idempotent(uuid,text,integer,text,text,uuid,text)
  FROM PUBLIC, anon, authenticated;

-- Match the non-anonymous ownership policy used by the rest of the app.
ALTER POLICY ai_memory_vectors_owner_read ON public.ai_memory_vectors
  USING (user_id = (SELECT auth.uid())
    AND COALESCE(((SELECT auth.jwt())->>'is_anonymous')::boolean, false) = false);
ALTER POLICY idempotency_keys_owner_read ON public.idempotency_keys
  USING (user_id = (SELECT auth.uid())
    AND COALESCE(((SELECT auth.jwt())->>'is_anonymous')::boolean, false) = false);
ALTER POLICY session_events_owner_read ON public.session_events
  USING (user_id = (SELECT auth.uid())
    AND COALESCE(((SELECT auth.jwt())->>'is_anonymous')::boolean, false) = false);
COMMIT;

-- Rollback is a forward migration restoring authenticated EXECUTE on these six
-- exact signatures and restoring the three owner-only SELECT expressions.
-- Do not restore client credit access without a server-authoritative reward
-- contract; this would reopen arbitrary credit creation in an archived feature.
