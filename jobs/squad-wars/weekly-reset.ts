import { task } from '@trigger.dev/sdk';
import type { WarRow, WeeklyResetResult } from './weekly-reset-types';
import { DEFAULT_REWARD_MULTIPLIER } from './weekly-reset-types';
import { parseArray, toWarRow, getWeekBoss } from './weekly-reset-parsers';
import { supabase, fetchWarLeaderboard, grantCoinsReward } from './weekly-reset-database';
import { notifySquadMembers } from './weekly-reset-notifications';

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
