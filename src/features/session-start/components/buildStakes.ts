import type { Theme } from '../../../theme';
import type { SessionStake, SessionStakesBriefingProps } from './SessionStakesBriefing.types';

type StakeInput = Pick<
  SessionStakesBriefingProps,
  'bossStake' | 'streakStake' | 'challengeStake' | 'rivalStake' | 'squadWarStake'
>;

export function buildStakes(
  input: StakeInput,
  theme: Theme,
): SessionStake[] {
  const stakes: SessionStake[] = [];
  const { bossStake, streakStake, challengeStake, rivalStake, squadWarStake } = input;

  if (bossStake) {
    const isCritical = bossStake.healthPercent <= 15;
    stakes.push({
      id: 'boss',
      priority: isCritical ? 1 : 2,
      icon: bossStake.isFinalStrike ? '⚔️' : '🐲',
      title: bossStake.isFinalStrike
        ? `⚔️ FINAL STRIKE: ${bossStake.bossName}`
        : `${bossStake.bossName} at ${bossStake.healthPercent.toFixed(0)}%`,
      subtitle: bossStake.wouldDefeat
        ? 'This session defeats the boss!'
        : `Est. damage: ~${bossStake.estimatedDamage} HP`,
      urgency: isCritical
        ? 'critical'
        : bossStake.healthPercent <= 50
          ? 'high'
          : 'medium',
      accentColor: theme.colors.primary[500],
    });
  }
  if (streakStake) {
    const isCritical =
      streakStake.isAtRisk &&
      streakStake.hoursUntilDeadline !== null &&
      streakStake.hoursUntilDeadline <= 6;
    stakes.push({
      id: 'streak',
      priority: isCritical ? 1 : 3,
      icon: '🔥',
      title:
        streakStake.isAtRisk && streakStake.hoursUntilDeadline !== null
          ? `🔥 Streak at risk — ${streakStake.hoursUntilDeadline}h left`
          : `Day ${streakStake.currentDays} of your streak`,
      subtitle: streakStake.isAtRisk
        ? 'Complete this session to save it!'
        : `Session ${streakStake.sessionNumberInStreak} • ${streakStake.multiplier.toFixed(1)}× multiplier`,
      urgency: isCritical ? 'critical' : streakStake.isAtRisk ? 'high' : 'low',
      accentColor: theme.colors.warning[500],
    });
  }
  if (challengeStake) {
    stakes.push({
      id: 'challenge',
      priority: challengeStake.canComplete ? 2 : 4,
      icon: '📋',
      title: `'${challengeStake.challengeName}'`,
      subtitle: challengeStake.canComplete
        ? `This session completes it! (${challengeStake.current}/${challengeStake.target})`
        : `Progress: ${challengeStake.current}/${challengeStake.target}`,
      urgency: challengeStake.canComplete ? 'high' : 'medium',
      accentColor: theme.colors.primary[500],
    });
  }
  if (rivalStake) {
    const isBehind = rivalStake.gapMinutes > 0;
    stakes.push({
      id: 'rival',
      priority: isBehind ? 3 : 5,
      icon: '⚔️',
      title: `${rivalStake.rivalName}`,
      subtitle: isBehind
        ? `${rivalStake.gapMinutes} min behind — catch up?`
        : `You're ${Math.abs(rivalStake.gapMinutes)} min ahead`,
      urgency: isBehind ? 'medium' : 'low',
      accentColor: theme.colors.error[500],
    });
  }
  if (squadWarStake) {
    const isUrgent = squadWarStake.hoursRemaining <= 12;
    stakes.push({
      id: 'squadwar',
      priority: isUrgent ? 3 : 5,
      icon: '🛡️',
      title: `Squad War ends in ${squadWarStake.hoursRemaining}h`,
      subtitle: `Squad needs ${squadWarStake.squadMinutesNeeded} more min`,
      urgency: isUrgent ? 'high' : 'medium',
      accentColor: theme.colors.primary[500],
    });
  }

  return stakes.sort((a, b) => a.priority - b.priority).slice(0, 3);
}
