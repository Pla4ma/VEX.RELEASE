import { createClient } from '@supabase/supabase-js';
import type { WarDamageRow } from './weekly-reset-types';
import { parseArray, toWarDamageRow, buildDisplayName } from './weekly-reset-parsers';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);

export async function fetchWarDamageTotals(warId: string): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from('squad_war_damage')
    .select('user_id, damage')
    .eq('war_id', warId);

  if (error) throw error;

  const totals = new Map<string, number>();
  for (const row of parseArray(data, 'fetchWarDamageTotals', toWarDamageRow)) {
    totals.set(row.user_id, (totals.get(row.user_id) ?? 0) + (row.damage ?? 0));
  }
  return totals;
}

export async function fetchWarLeaderboard(warId: string): Promise<Array<{
  userId: string;
  displayName: string;
  damage: number;
  sessionCount: number;
}>> {
  const { data, error } = await supabase
    .from('squad_war_damage')
    .select('user_id, damage, session_id, users:user_id ( display_name, username )')
    .eq('war_id', warId);

  if (error) throw error;

  const leaderboard = new Map<string, {
    userId: string;
    displayName: string;
    damage: number;
    sessionCount: number;
  }>();

  for (const row of parseArray(data, 'fetchWarLeaderboard', toWarDamageRow)) {
    const current = leaderboard.get(row.user_id) ?? {
      userId: row.user_id,
      displayName: buildDisplayName(row),
      damage: 0,
      sessionCount: 0,
    };

    leaderboard.set(row.user_id, {
      ...current,
      damage: current.damage + Math.max(0, row.damage ?? 0),
      sessionCount: current.sessionCount + 1,
    });
  }

  return Array.from(leaderboard.values()).sort(
    (left, right) => right.damage - left.damage || right.sessionCount - left.sessionCount
  );
}

export async function grantCoinsReward(userId: string, coinsBonus: number, metadata: Record<string, unknown>): Promise<void> {
  if (coinsBonus <= 0) {
    return;
  }

  const nowMs = Date.now();
  const { data: walletRow, error: walletFetchError } = await supabase
    .from('wallets')
    .select('id, coins, total_coins_earned')
    .eq('user_id', userId)
    .maybeSingle();

  if (walletFetchError) throw walletFetchError;

  if (!walletRow) {
    const { data: createdWallet, error: walletInsertError } = await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        coins: coinsBonus,
        gems: 0,
        seasonal: {},
        total_coins_earned: coinsBonus,
        total_coins_spent: 0,
        total_gems_earned: 0,
        total_gems_spent: 0,
        created_at: nowMs,
        updated_at: nowMs,
      })
      .select('id')
      .single();

    if (walletInsertError) throw walletInsertError;

    const { error: txError } = await supabase.from('wallet_transactions').insert({
      wallet_id: createdWallet.id,
      user_id: userId,
      type: 'EARN',
      currency: 'COINS',
      amount: coinsBonus,
      balance_before: 0,
      balance_after: coinsBonus,
      source: 'SQUAD',
      source_id: null,
      description: 'Squad War weekly placement reward',
      metadata,
      created_at: nowMs,
    });

    if (txError) throw txError;
    return;
  }

  const beforeBalance = walletRow.coins ?? 0;
  const afterBalance = beforeBalance + coinsBonus;
  const { error: walletUpdateError } = await supabase
    .from('wallets')
    .update({
      coins: afterBalance,
      total_coins_earned: (walletRow.total_coins_earned ?? 0) + coinsBonus,
      updated_at: nowMs,
    })
    .eq('user_id', userId);

  if (walletUpdateError) throw walletUpdateError;

  const { error: txError } = await supabase.from('wallet_transactions').insert({
    wallet_id: walletRow.id,
    user_id: userId,
    type: 'EARN',
    currency: 'COINS',
    amount: coinsBonus,
    balance_before: beforeBalance,
    balance_after: afterBalance,
    source: 'SQUAD',
    source_id: null,
    description: 'Squad War weekly placement reward',
    metadata,
    created_at: nowMs,
  });

  if (txError) throw txError;
}
