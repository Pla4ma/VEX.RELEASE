
-- Explicit DB column contracts plus shared idempotency registry.

CREATE TABLE IF NOT EXISTS public.schema_column_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schema_name TEXT NOT NULL DEFAULT 'public',
  table_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  data_type TEXT NOT NULL,
  nullable BOOLEAN NOT NULL,
  allowed_values TEXT[] DEFAULT NULL,
  min_numeric NUMERIC DEFAULT NULL,
  max_numeric NUMERIC DEFAULT NULL,
  pii_classification TEXT NOT NULL DEFAULT 'none'
    CHECK (pii_classification IN ('none', 'user', 'sensitive', 'secret')),
  contract_note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (schema_name, table_name, column_name)
);

ALTER TABLE public.schema_column_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_column_contracts FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.schema_column_contracts FROM anon, authenticated;
GRANT ALL ON TABLE public.schema_column_contracts TO service_role;

DROP POLICY IF EXISTS schema_column_contracts_service_only ON public.schema_column_contracts;
CREATE POLICY schema_column_contracts_service_only
  ON public.schema_column_contracts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

INSERT INTO public.schema_column_contracts
  (table_name, column_name, data_type, nullable, allowed_values, min_numeric, max_numeric, pii_classification, contract_note)
VALUES
  ('sessions', 'user_id', 'uuid', false, NULL, NULL, NULL, 'user', 'Owner; access must scope to auth.uid().'),
  ('sessions', 'duration', 'integer', false, NULL, 0, 86400, 'none', 'Bounded session seconds.'),
  ('sessions', 'effective_duration', 'integer', true, NULL, 0, 86400, 'none', 'Bounded effective focus seconds.'),
  ('sessions', 'quality_score', 'numeric(5,2)', true, NULL, 0, 100, 'none', 'Percent-like score.'),
  ('sessions', 'status', 'text', false, ARRAY['pending','active','completed','cancelled','failed'], NULL, NULL, 'none', 'Finite lifecycle.'),
  ('session_completion_ledgers', 'idempotency_key', 'text', false, NULL, NULL, NULL, 'none', 'Completion dedupe key.'),
  ('reward_ledger', 'idempotency_key', 'text', false, NULL, NULL, NULL, 'none', 'Reward dedupe key.'),
  ('wallet_transactions', 'amount', 'integer', false, NULL, NULL, NULL, 'none', 'Signed immutable wallet delta.'),
  ('unified_wallets', 'coins', 'integer', true, NULL, 0, NULL, 'none', 'Server-authoritative coin balance.'),
  ('unified_wallets', 'tokens', 'integer', true, NULL, 0, NULL, 'none', 'Server-authoritative token balance.'),
  ('ai_memory_vectors', 'embedding', 'extensions.vector(1536)', false, NULL, NULL, NULL, 'user', 'User-scoped AI memory vector.')
ON CONFLICT (schema_name, table_name, column_name) DO UPDATE
SET data_type = EXCLUDED.data_type,
    nullable = EXCLUDED.nullable,
    allowed_values = EXCLUDED.allowed_values,
    min_numeric = EXCLUDED.min_numeric,
    max_numeric = EXCLUDED.max_numeric,
    pii_classification = EXCLUDED.pii_classification,
    contract_note = EXCLUDED.contract_note,
    updated_at = now();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_duration_contract') THEN
    ALTER TABLE public.sessions
      ADD CONSTRAINT sessions_duration_contract CHECK (duration >= 0 AND duration <= 86400) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_effective_duration_contract') THEN
    ALTER TABLE public.sessions
      ADD CONSTRAINT sessions_effective_duration_contract
      CHECK (effective_duration IS NULL OR (effective_duration >= 0 AND effective_duration <= 86400)) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_quality_score_contract') THEN
    ALTER TABLE public.sessions
      ADD CONSTRAINT sessions_quality_score_contract
      CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 100)) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unified_wallets_nonnegative_balances') THEN
    ALTER TABLE public.unified_wallets
      ADD CONSTRAINT unified_wallets_nonnegative_balances
      CHECK (
        COALESCE(coins, 0) >= 0 AND COALESCE(tokens, 0) >= 0
        AND COALESCE(total_earned_coins, 0) >= 0 AND COALESCE(total_earned_tokens, 0) >= 0
        AND COALESCE(total_spent_coins, 0) >= 0 AND COALESCE(total_spent_tokens, 0) >= 0
      ) NOT VALID;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'succeeded', 'failed')),
  locked_until TIMESTAMPTZ NOT NULL DEFAULT now() + interval '2 minutes',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, operation, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idempotency_keys_user_operation_idx
  ON public.idempotency_keys (user_id, operation, created_at DESC);

ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.idempotency_keys FROM anon;
GRANT SELECT ON TABLE public.idempotency_keys TO authenticated;
GRANT ALL ON TABLE public.idempotency_keys TO service_role;

DROP POLICY IF EXISTS idempotency_keys_owner_read ON public.idempotency_keys;
CREATE POLICY idempotency_keys_owner_read
  ON public.idempotency_keys FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS idempotency_keys_service_all ON public.idempotency_keys;
CREATE POLICY idempotency_keys_service_all
  ON public.idempotency_keys FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE public.schema_column_contracts IS 'Machine-readable DB column contracts for security, validation, and performance review.';
COMMENT ON TABLE public.idempotency_keys IS 'Shared idempotency registry for RPCs and async writes.';
