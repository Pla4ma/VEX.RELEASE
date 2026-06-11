import type { PushTokenRow } from './weekly-reset-types';
import { parseArray, toPushTokenRow } from './weekly-reset-parsers';
import { supabase } from './weekly-reset-database';
import { grantCoinsToWallet } from './weekly-reset-wallet';

export async function sendPushNotification(params: {
  token: string;
  platform: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 10));
  return Boolean(params.token && params.platform);
}

export async function notifySquadMembers(
  userIds: string[],
  title: string,
  body: string,
  data: Record<string, unknown>
): Promise<number> {
  if (userIds.length === 0) {
    return 0;
  }

  const { data: pushTokens, error: tokensError } = await supabase
    .from('push_tokens')
    .select('user_id, token, platform')
    .in('user_id', userIds)
    .eq('is_active', true);

  if (tokensError) throw tokensError;

  let sent = 0;
  for (const token of parseArray(pushTokens, 'notifySquadMembers', toPushTokenRow)) {
    const success = await sendPushNotification({
      token: token.token,
      platform: token.platform,
      title,
      body,
      data,
    });

    if (success) {
      sent += 1;
    }
  }

  return sent;
}

export async function grantWinnerBonus(userId: string, contributedDamage: number, rewardMultiplier: number): Promise<void> {
  const bonusMultiplier = Math.max(0, rewardMultiplier - 1);
  if (contributedDamage <= 0 || bonusMultiplier <= 0) {
    return;
  }

  const xpBonus = Math.max(1, Math.floor(contributedDamage * bonusMultiplier));
  const coinsBonus = Math.max(1, Math.floor((contributedDamage / 10) * bonusMultiplier));
  const nowMs = Date.now();

  const { data: progressionRow, error: progressionFetchError } = await supabase
    .from('progression')
    .select('id, level, xp, total_xp, next_level_threshold, last_level_up_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (progressionFetchError) throw progressionFetchError;

  if (!progressionRow) {
    const { error: progressionInsertError } = await supabase
      .from('progression')
      .insert({
        user_id: userId,
        level: 1,
        xp: xpBonus,
        total_xp: xpBonus,
        next_level_threshold: 100,
        last_level_up_at: null,
        created_at: nowMs,
        updated_at: nowMs,
      });

    if (progressionInsertError) throw progressionInsertError;
  } else {
    const { error: progressionUpdateError } = await supabase
      .from('progression')
      .update({
        xp: (progressionRow.xp ?? 0) + xpBonus,
        total_xp: (progressionRow.total_xp ?? 0) + xpBonus,
        updated_at: nowMs,
      })
      .eq('user_id', userId);

    if (progressionUpdateError) throw progressionUpdateError;
  }

  const { error: xpHistoryError } = await supabase
    .from('xp_history')
    .insert({
      user_id: userId,
      amount: xpBonus,
      source: 'SQUAD_BONUS',
      session_id: null,
      metadata: {
        source: 'squad_war_weekly_reset',
        contributedDamage,
        rewardMultiplier,
      },
      created_at: nowMs,
    });

  if (xpHistoryError) throw xpHistoryError;

  await grantCoinsToWallet({
    userId,
    coinsBonus,
    description: 'Squad War victory bonus',
    metadata: {
      source: 'squad_war_weekly_reset',
      contributedDamage,
      rewardMultiplier,
    },
  });
}
