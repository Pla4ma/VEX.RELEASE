-- Migration: Add economy RPCs (atomic_add_currency, atomic_spend_currency, grant_currency)
-- Date: 2026-06-16
--
-- These RPCs were called from src/features/economy/repository.ts but had no
-- corresponding migration definitions. They operate on unified_wallets.
--
-- Each function enforces auth.uid() = p_user_id to prevent unauthorized
-- minting/spending for arbitrary accounts.
--
-- Execute is revoked from anon — only authenticated users may call these.
-- Row-level security on unified_wallets provides the second layer of defense.

-- ============================================================================
-- atomic_add_currency: Atomically adds currency to a user's wallet
-- ============================================================================
CREATE OR REPLACE FUNCTION public.atomic_add_currency(
  p_user_id uuid,
  p_currency text,
  p_amount integer,
  p_source text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_column text;
  v_total_column text;
  v_new_balance integer;
BEGIN
  -- Enforce caller identity matches target user
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'You can only modify your own wallet';
  END IF;

  -- Map currency type to column names
  CASE p_currency
    WHEN 'COINS' THEN
      v_column := 'coins';
      v_total_column := 'total_earned_coins';
    WHEN 'GEMS' THEN
      v_column := 'tokens';
      v_total_column := 'total_earned_tokens';
    ELSE
      RAISE EXCEPTION 'Unsupported currency type: %', p_currency;
  END CASE;

  -- Upsert wallet row and increment atomically
  INSERT INTO public.unified_wallets (user_id, coins, tokens, total_earned_coins, total_earned_tokens)
  VALUES (p_user_id, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  EXECUTE format(
    'UPDATE public.unified_wallets SET %I = %I + $1, %I = %I + GREATEST($1, 0), updated_at = NOW() WHERE user_id = $2 RETURNING %I',
    v_column, v_column, v_total_column, v_total_column, v_column
  ) INTO v_new_balance USING p_amount, p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', COALESCE(v_new_balance, 0)
  );
END;
$$;

-- ============================================================================
-- atomic_spend_currency: Atomically spends currency from a user's wallet
-- ============================================================================
CREATE OR REPLACE FUNCTION public.atomic_spend_currency(
  p_user_id uuid,
  p_currency text,
  p_amount integer,
  p_sink text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_column text;
  v_total_spent_column text;
  v_balance integer;
  v_new_balance integer;
BEGIN
  -- Enforce caller identity matches target user
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'You can only modify your own wallet';
  END IF;

  -- Map currency type to column names
  CASE p_currency
    WHEN 'COINS' THEN
      v_column := 'coins';
      v_total_spent_column := 'total_spent_coins';
    WHEN 'GEMS' THEN
      v_column := 'tokens';
      v_total_spent_column := 'total_spent_tokens';
    ELSE
      RAISE EXCEPTION 'Unsupported currency type: %', p_currency;
  END CASE;

  -- Read current balance
  EXECUTE format('SELECT %I FROM public.unified_wallets WHERE user_id = $1', v_column)
    INTO v_balance USING p_user_id;

  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance'
    );
  END IF;

  -- Deduct atomically
  EXECUTE format(
    'UPDATE public.unified_wallets SET %I = %I - $1, %I = %I + $1, updated_at = NOW() WHERE user_id = $2 AND %I >= $1 RETURNING %I',
    v_column, v_column, v_total_spent_column, v_total_spent_column, v_column, v_column
  ) INTO v_new_balance USING p_amount, p_user_id;

  IF v_new_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance or concurrency conflict'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance
  );
END;
$$;

-- ============================================================================
-- grant_currency: Grants currency to a user with source/source_id tracking
-- ============================================================================
CREATE OR REPLACE FUNCTION public.grant_currency(
  p_user_id uuid,
  p_currency text,
  p_amount integer,
  p_source text,
  p_source_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_column text;
  v_total_column text;
  v_new_balance integer;
BEGIN
  -- Enforce caller identity matches target user
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'You can only modify your own wallet';
  END IF;

  -- Map currency type to column names
  CASE p_currency
    WHEN 'COINS' THEN
      v_column := 'coins';
      v_total_column := 'total_earned_coins';
    WHEN 'GEMS' THEN
      v_column := 'tokens';
      v_total_column := 'total_earned_tokens';
    ELSE
      RAISE EXCEPTION 'Unsupported currency type: %', p_currency;
  END CASE;

  -- Upsert wallet row and increment atomically
  INSERT INTO public.unified_wallets (user_id, coins, tokens, total_earned_coins, total_earned_tokens)
  VALUES (p_user_id, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  EXECUTE format(
    'UPDATE public.unified_wallets SET %I = %I + $1, %I = %I + $1, updated_at = NOW() WHERE user_id = $2 RETURNING %I',
    v_column, v_column, v_total_column, v_total_column, v_column
  ) INTO v_new_balance USING p_amount, p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', COALESCE(v_new_balance, p_amount)
  );
END;
$$;

-- Revoke execute from anon; only authenticated users can call these
REVOKE EXECUTE ON FUNCTION public.atomic_add_currency(uuid, text, integer, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.atomic_spend_currency(uuid, text, integer, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.grant_currency(uuid, text, integer, text, uuid, text) FROM anon;

GRANT EXECUTE ON FUNCTION public.atomic_add_currency(uuid, text, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.atomic_spend_currency(uuid, text, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_currency(uuid, text, integer, text, uuid, text) TO authenticated;
