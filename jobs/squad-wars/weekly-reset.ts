import { task } from '@trigger.dev/sdk';
import * as Sentry from '@sentry/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);

const DEFAULT_REWARD_MULTIPLIER = 1.5;
const BOSS_ROTATION = [
  { name: 'The Iron Leviathan', maxHealth: 120000 },
  { name: 'The Ember Matron', maxHealth: 135000 },
  { name: 'The Null Titan', maxHealth: 150000 },
  { name: 'The Glass Colossus', maxHealth: 145000 },
];

type WarRow = {
  id: string;
  squad_id: string;
  boss_name: string;
  boss_max_health: number;
  boss_current_health: number;
  reward_multiplier: number | null;
  week_starts_at: string;
  week_ends_at: string;
};

type WarDamageRow = {
  user_id: string;
  damage: number;
  session_id?: string;
  users?: {
    display_name?: string | null;
    username?: string | null;
  } | null;
};

type PushTokenRow = {
  user_id: string;
  token: string;
  platform: string;
};

type WeeklyResetResult = {
  processedWars: number;
  winners: number;
  losers: number;
  rewardsGranted: number;
  notificationsSent: number;
  nextWarsCreated: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function toWarRow(value: unknown): WarRow | null {
  if (!isRecord(value)) return null;
  const id = readString(value.id);
  const squadId = readString(value.squad_id);
  const bossName = readString(value.boss_name);
  const weekStartsAt = readString(value.week_starts_at);
  const weekEndsAt = readString(value.week_ends_at);
  const maxHealth = readNumber(value.boss_max_health);
  const currentHealth = readNumber(value.boss_current_health);
  const rewardMultiplier = value.reward_multiplier === null ? null : readNumber(value.reward_multiplier);
  if (!id || !squadId || !bossName || !weekStartsAt || !weekEndsAt || maxHealth === null || currentHealth === null) {
    return null;
  }
  return {
    id,
    squad_id: squadId,
    boss_name: bossName,
    boss_max_health: maxHealth,
    boss_current_health: currentHealth,
    reward_multiplier: rewardMultiplier,
    week_starts_at: weekStartsAt,
    week_ends_at: weekEndsAt,
  };
}

function toWarDamageRow(value: unknown): WarDamageRow | null {
  if (!isRecord(value)) return null;
  const userId = readString(value.user_id);
  const damage = readNumber(value.damage);
  if (!userId || damage === null) return null;
  const users = isRecord(value.users)
    ? {
        display_name: readString(value.users.display_name),
        username: readString(value.users.username),
      }
    : null;
  const sessionId = readString(value.session_id) ?? undefined;
  return { user_id: userId, damage, session_id: sessionId, users };
}

function toPushTokenRow(value: unknown): PushTokenRow | null {
  if (!isRecord(value)) return null;
  const userId = readString(value.user_id);
  const token = readString(value.token);
  const platform = readString(value.platform);
  return userId && token && platform ? { user_id: userId, token, platform } : null;
}

function parseArray<T>(data: unknown, operation: string, parseItem: (value: unknown) => T | null): T[] {
  if (data === null || data === undefined) return [];
  if (!Array.isArray(data)) {
    throw new Error(`${operation} expected an array response`);
  }
  return data.map(parseItem).filter((row): row is T => row !== null);
}

function getWeekBoss(weekStartsAt: Date) {
  const weekSeed = Math.floor(weekStartsAt.getTime() / (7 * 24 * 60 * 60 * 1000));
  return BOSS_ROTATION[Math.abs(weekSeed) % BOSS_ROTATION.length];
}

function getNextUtcWeekWindow(reference: Date): { start: Date; end: Date } {
  const start = new Date(reference);
  start.setUTCHours(0, 0, 0, 0);

  const day = start.getUTCDay();
  const daysUntilMonday = (8 - day) % 7 || 7;
  start.setUTCDate(start.getUTCDate() + daysUntilMonday);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  end.setUTCMilliseconds(-1);

  return { start, end };
}

async function fetchWarDamageTotals(warId: string): Promise<Map<string, number>> {
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

function buildDisplayName(row: WarDamageRow): string {
  const displayName = row.users?.display_name?.trim();
  if (displayName) {
    return displayName;
  }

  const username = row.users?.username?.trim();
  return username || 'Squadmate';
}

async function fetchWarLeaderboard(warId: string): Promise<Array<{
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

async function grantWinnerBonus(userId: string, contributedDamage: number, rewardMultiplier: number): Promise<void> {
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
      description: 'Squad War victory bonus',
      metadata: {
        source: 'squad_war_weekly_reset',
        contributedDamage,
        rewardMultiplier,
      },
      created_at: nowMs,
    });

    if (txError) throw txError;
  } else {
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
      description: 'Squad War victory bonus',
      metadata: {
        source: 'squad_war_weekly_reset',
        contributedDamage,
        rewardMultiplier,
      },
      created_at: nowMs,
    });

    if (txError) throw txError;
  }
}

async function sendPushNotification(params: {
  token: string;
  platform: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 10));
  return Boolean(params.token && params.platform);
}

async function notifySquadMembers(
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

async function grantCoinsReward(userId: string, coinsBonus: number, metadata: Record<string, unknown>): Promise<void> {
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

async function processWar(
  war: WarRow,
  io: { runTask: <T>(name: string, fn: () => Promise<T>) => Promise<T> }
): Promise<{ rewardsGranted: number; notificationsSent: number; rewardedUsers: number }> {
  const rewards = [1000, 500, 250];
  const leaderboard = await io.runTask(`leaderboard-${war.id}`, async () => fetchWarLeaderboard(war.id));
  const winners = leaderboard.filter((entry) => entry.damage > 0).slice(0, rewards.length);

  for (const [index, winner] of winners.entries()) {
    const coins = rewards[index];
    await io.runTask(`reward-${war.id}-${winner.userId}`, async () => {
      await grantCoinsReward(winner.userId, coins, {
        source: 'squad_war_weekly_reset',
        warId: war.id,
        placement: index + 1,
        damage: winner.damage,
      });
    });
  }

  const { error: updateError } = await supabase
    .from('squad_wars')
    .update({ status: 'completed' })
    .eq('id', war.id);

  if (updateError) throw updateError;

  const nextWeekStart = new Date(war.week_ends_at);
  nextWeekStart.setUTCMilliseconds(nextWeekStart.getUTCMilliseconds() + 1);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setUTCDate(nextWeekEnd.getUTCDate() + 7);
  nextWeekEnd.setUTCMilliseconds(nextWeekEnd.getUTCMilliseconds() - 1);

  const boss = getWeekBoss(nextWeekStart);
  const { error: insertError } = await supabase.from('squad_wars').insert({
    squad_id: war.squad_id,
    opponent_squad_id: null,
    boss_name: boss.name,
    boss_max_health: boss.maxHealth,
    boss_current_health: boss.maxHealth,
    week_starts_at: nextWeekStart.toISOString(),
    week_ends_at: nextWeekEnd.toISOString(),
    status: 'active',
    reward_multiplier: DEFAULT_REWARD_MULTIPLIER,
  });

  if (insertError) throw insertError;

  const notificationsSent = await notifySquadMembers(
    winners.map((winner) => winner.userId),
    'Squad War Rewards',
    `You earned a weekly Squad War reward against ${war.boss_name}.`,
    { warId: war.id, squadId: war.squad_id, type: 'squad_war_reward' }
  );

  return {
    rewardsGranted: winners.length,
    notificationsSent,
    rewardedUsers: winners.length,
  };
}

export const squadWarWeeklyReset = task({
  id: 'squad-war-weekly-reset',
  name: 'Squad War Weekly Reset',
  trigger: {
    type: 'schedule',
    cron: '55 23 * * 0',
  },
  run: async (_payload, io): Promise<WeeklyResetResult> => {
    const cutoff = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { data: wars, error: warsError } = await supabase
      .from('squad_wars')
      .select('id, squad_id, boss_name, boss_max_health, boss_current_health, reward_multiplier, week_starts_at, week_ends_at')
      .eq('status', 'active')
      .lt('week_ends_at', cutoff);

    if (warsError) throw warsError;

    const activeWars = parseArray(wars, 'squadWarWeeklyReset', toWarRow);

    let winners = 0;
    let losers = 0;
    let rewardsGranted = 0;
    let notificationsSent = 0;
    let nextWarsCreated = 0;

    for (const war of activeWars) {
      const result = await io.runTask(`process-war-${war.id}`, async () => processWar(war, io));
      winners += result.rewardedUsers;
      rewardsGranted += result.rewardsGranted;
      notificationsSent += result.notificationsSent;
      nextWarsCreated += 1;
    }

    return {
      processedWars: activeWars.length,
      winners,
      losers,
      rewardsGranted,
      notificationsSent,
      nextWarsCreated,
    };
  },
});

export default squadWarWeeklyReset;
