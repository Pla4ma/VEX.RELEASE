import { HeadlineRewardConsequencesSchema, HeadlineRewardSchema } from './headline-reward.schemas';
import type { HeadlineReward, HeadlineRewardConsequences } from './headline-reward.types';

const STREAK_MILESTONES = new Set([7, 14, 30, 100]);

function modeLabel(mode: string): string {
  return mode
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');
}

function reward(input: HeadlineReward): HeadlineReward {
  return HeadlineRewardSchema.parse(input);
}

export function selectHeadlineReward(consequences: HeadlineRewardConsequences): HeadlineReward {
  const parsed = HeadlineRewardConsequencesSchema.parse(consequences);
  const { boss, challenge, comeback, companion, contract, personalBest, streak, summary } = parsed;

  if (streak?.streakSaved) {
    return reward({
      type: 'streak_saved',
      title: `Streak saved. ${streak.currentDays} days and counting.`,
      body: 'That session protected the habit you are building.',
      iconName: 'flame',
      value: `Day ${streak.currentDays} streak`,
    });
  }

  if (personalBest?.isPersonalBest) {
    const purity = personalBest.purityScore ?? summary.focusPurityScore ?? 0;
    return reward({
      type: 'personal_best',
      title: `Personal best. ${purity} purity in ${modeLabel(summary.sessionMode)}.`,
      body: 'You beat your own record for this session type.',
      iconName: 'trophy',
      value: `${purity} purity`,
    });
  }

  if (streak && STREAK_MILESTONES.has(streak.currentDays) && streak.previousDays < streak.currentDays) {
    return reward({
      type: 'streak_milestone',
      title: `${streak.currentDays}-day streak. This is where habits form.`,
      body: 'Today pushed your streak into a new tier.',
      iconName: 'calendar-check',
      value: `Day ${streak.currentDays}`,
    });
  }

  if (companion?.evolved) {
    return reward({
      type: 'companion_evolved',
      title: 'Your companion remembers your progress.',
      body: 'This session moved your companion into its next phase.',
      iconName: 'sparkles',
      value: 'Evolution unlocked',
    });
  }

  if (boss?.isEnabled && boss.currentHealth <= 0) {
    return reward({
      type: 'boss_defeated',
      title: 'Boss defeated. Your focus did that.',
      body: 'Your session finished the fight.',
      iconName: 'swords',
      value: 'Boss cleared',
    });
  }

  if (summary.newLevel > summary.previousLevel) {
    return reward({
      type: 'level_up',
      title: `Level ${summary.newLevel}. You earned this.`,
      body: 'Your focused time moved progression forward.',
      iconName: 'arrow-up-circle',
      value: `Level ${summary.newLevel}`,
    });
  }

  if (challenge?.isEnabled && challenge.completedThisSession) {
    return reward({
      type: 'challenge_complete',
      title: 'Challenge cleared. Locked in.',
      body: 'This session finished an active challenge.',
      iconName: 'target',
      value: 'Challenge complete',
    });
  }

  if (comeback?.isComplete) {
    return reward({
      type: 'comeback_complete',
      title: 'Comeback complete. You came back.',
      body: 'The recovery loop is closed for today.',
      iconName: 'rotate-ccw',
      value: 'Comeback complete',
    });
  }

  if (contract?.status === 'done') {
    return reward({
      type: 'contract_done',
      title: 'You did what you said you would.',
      body: 'Your focus contract is complete.',
      iconName: 'check-circle',
      value: 'Contract done',
    });
  }

  return reward({
    type: 'xp_earned',
    title: `+${summary.xpEarned} XP. Session complete.`,
    body: summary.focusPurityScore
      ? `Focus purity: ${summary.focusPurityScore}%. Keep building the rhythm.`
      : 'Your progress is locked in. Keep building the rhythm.',
    iconName: 'zap',
    value: `+${summary.xpEarned} XP`,
  });
}
