import { createClient } from '@supabase/supabase-js';
import type { WarDamageRow } from './weekly-reset-types';
import { parseArray, toWarDamageRow, buildDisplayName } from './weekly-reset-parsers';
import { grantCoinsToWallet } from './weekly-reset-wallet';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
  await grantCoinsToWallet({
    userId,
    coinsBonus,
    description: 'Squad War weekly placement reward',
    metadata,
  });
}
