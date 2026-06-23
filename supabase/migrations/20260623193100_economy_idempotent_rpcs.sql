
-- Server-authoritative economy RPCs with required idempotency keys.

CREATE OR REPLACE FUNCTION public.apply_wallet_delta(
  p_user_id UUID,
  p_currency TEXT,
  p_amount INTEGER,
  p_source TEXT,
  p_idempotency_key TEXT,
  p_source_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_column TEXT;
  v_earned_column TEXT;
  v_spent_column TEXT;
  v_wallet_id UUID;
  v_balance_before INTEGER;
  v_balance_after INTEGER;
  v_existing JSONB;
  v_operation TEXT := 'wallet_delta';
BEGIN
  IF (select auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'apply_wallet_delta owner mismatch';
  END IF;
  IF p_idempotency_key IS NULL OR length(trim(p_idempotency_key)) = 0 THEN
    RAISE EXCEPTION 'apply_wallet_delta requires idempotency key';
  END IF;
  IF p_amount = 0 THEN
    RAISE EXCEPTION 'apply_wallet_delta amount must be non-zero';
  END IF;

  CASE p_currency
    WHEN 'COINS' THEN
      v_column := 'coins'; v_earned_column := 'total_earned_coins'; v_spent_column := 'total_spent_coins';
    WHEN 'GEMS' THEN
      v_column := 'tokens'; v_earned_column := 'total_earned_tokens'; v_spent_column := 'total_spent_tokens';
    ELSE
      RAISE EXCEPTION 'Unsupported currency type: %', p_currency;
  END CASE;

  SELECT response_payload INTO v_existing
  FROM public.idempotency_keys
  WHERE user_id = p_user_id AND operation = v_operation
    AND idempotency_key = p_idempotency_key AND status = 'succeeded';
  IF v_existing IS NOT NULL THEN
    RETURN v_existing || jsonb_build_object('duplicate', true);
  END IF;

  INSERT INTO public.idempotency_keys (user_id, operation, idempotency_key, request_hash)
  VALUES (
    p_user_id, v_operation, p_idempotency_key,
    md5(jsonb_build_object('currency', p_currency, 'amount', p_amount, 'source', p_source, 'sourceId', p_source_id)::text)
  )
  ON CONFLICT (user_id, operation, idempotency_key) DO NOTHING;

  INSERT INTO public.unified_wallets (user_id, coins, tokens, total_earned_coins, total_earned_tokens, total_spent_coins, total_spent_tokens)
  VALUES (p_user_id, 1000, 0, 1000, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  EXECUTE format('SELECT id, %I FROM public.unified_wallets WHERE user_id = $1 FOR UPDATE', v_column)
    INTO v_wallet_id, v_balance_before USING p_user_id;

  IF v_balance_before + p_amount < 0 THEN
    v_existing := jsonb_build_object('success', false, 'error', 'Insufficient balance');
    UPDATE public.idempotency_keys
    SET status = 'failed', response_payload = v_existing, updated_at = now()
    WHERE user_id = p_user_id AND operation = v_operation AND idempotency_key = p_idempotency_key;
    RETURN v_existing;
  END IF;

  v_balance_after := v_balance_before + p_amount;
  EXECUTE format(
    'UPDATE public.unified_wallets
       SET %I = $1, %I = %I + $2, %I = %I + $3, updated_at = now()
     WHERE user_id = $4',
    v_column, v_earned_column, v_earned_column, v_spent_column, v_spent_column
  )
  USING v_balance_after, GREATEST(p_amount, 0), GREATEST(-p_amount, 0), p_user_id;

  INSERT INTO public.wallet_transactions (
    wallet_id, user_id, type, currency, amount, balance_before, balance_after,
    source, source_id, description, metadata, created_at
  )
  VALUES (
    v_wallet_id, p_user_id, CASE WHEN p_amount > 0 THEN 'CREDIT' ELSE 'DEBIT' END,
    p_currency, p_amount, v_balance_before, v_balance_after, p_source, p_source_id::text,
    p_description, COALESCE(p_metadata, '{}'::jsonb) || jsonb_build_object('idempotencyKey', p_idempotency_key),
    floor(extract(epoch from clock_timestamp()) * 1000)
  );

  v_existing := jsonb_build_object(
    'success', true, 'duplicate', false, 'new_balance', v_balance_after, 'balance_before', v_balance_before
  );
  UPDATE public.idempotency_keys
  SET status = 'succeeded', response_payload = v_existing, updated_at = now()
  WHERE user_id = p_user_id AND operation = v_operation AND idempotency_key = p_idempotency_key;
  RETURN v_existing;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_wallet_delta(UUID, TEXT, INTEGER, TEXT, TEXT, UUID, TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_wallet_delta(UUID, TEXT, INTEGER, TEXT, TEXT, UUID, TEXT, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION public.grant_currency_idempotent(
  p_user_id UUID, p_currency TEXT, p_amount INTEGER, p_source TEXT,
  p_idempotency_key TEXT, p_source_id UUID DEFAULT NULL, p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.apply_wallet_delta(p_user_id, p_currency, ABS(p_amount), p_source, p_idempotency_key, p_source_id, p_description, '{}'::jsonb);
$$;

CREATE OR REPLACE FUNCTION public.spend_currency_idempotent(
  p_user_id UUID, p_currency TEXT, p_amount INTEGER, p_sink TEXT,
  p_idempotency_key TEXT, p_source_id UUID DEFAULT NULL, p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.apply_wallet_delta(p_user_id, p_currency, -ABS(p_amount), p_sink, p_idempotency_key, p_source_id, p_description, '{}'::jsonb);
$$;

REVOKE ALL ON FUNCTION public.grant_currency_idempotent(UUID, TEXT, INTEGER, TEXT, TEXT, UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.spend_currency_idempotent(UUID, TEXT, INTEGER, TEXT, TEXT, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_currency_idempotent(UUID, TEXT, INTEGER, TEXT, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.spend_currency_idempotent(UUID, TEXT, INTEGER, TEXT, TEXT, UUID, TEXT) TO authenticated;
