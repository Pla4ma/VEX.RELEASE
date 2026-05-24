import { z } from 'zod';
import { HeadlineRewardConsequencesSchema } from './headline-reward.schemas';
import type { HeadlineRewardConsequences } from './headline-reward.types';

export const RewardPriorityKindSchema = z.enum([
  'personal_best',
  'focus_score',
  'streak',
  'boss',
  'level',
  'companion',
  'challenge',
  'currency',
  'xp',
  'fallback',
]);

export const RewardPriorityLevelSchema = z.enum(['major', 'supporting', 'standard']);

export const RewardPriorityRewardSchema = z
  .object({
    detail: z.string().min(1),
    kind: RewardPriorityKindSchema,
    label: z.string().min(1),
    priority: RewardPriorityLevelSchema,
  })
  .strict();

export const RewardPriorityInputSchema = z
  .object({
    rewards: z.array(RewardPriorityRewardSchema),
  })
  .strict();

export const RewardPrioritySummarySchema = z
  .object({
    headline: RewardPriorityRewardSchema,
    secondaryRewards: z.array(RewardPriorityRewardSchema),
  })
  .strict();

export type RewardPriorityInput = z.infer<typeof RewardPriorityInputSchema>;
export type RewardPriorityReward = z.infer<typeof RewardPriorityRewardSchema>;
export type RewardPrioritySummary = z.infer<typeof RewardPrioritySummarySchema>;

const KIND_RANK: Record<RewardPriorityReward['kind'], number> = {
  personal_best: 0,
  focus_score: 1,
  streak: 2,
  boss: 3,
  level: 4,
  companion: 5,
  challenge: 6,
  currency: 7,
  xp: 7,
  fallback: 8,
};

const FALLBACK_REWARD: RewardPriorityReward = {
  detail: 'Your focus time is saved.',
  kind: 'fallback',
  label: 'Session complete',
  priority: 'standard',
};

function compareRewards(left: RewardPriorityReward, right: RewardPriorityReward): number {
  const kindDelta = KIND_RANK[left.kind] - KIND_RANK[right.kind];

  if (kindDelta !== 0) {
    return kindDelta;
  }

  return left.label.localeCompare(right.label);
}

export function buildRewardPrioritySummary(input: RewardPriorityInput): RewardPrioritySummary {
  const parsed = RewardPriorityInputSchema.parse(input);
  const rankedRewards = [...parsed.rewards].sort(compareRewards);
  const headline = rankedRewards[0] ?? FALLBACK_REWARD;
  const secondaryRewards = rankedRewards.slice(1);

  return RewardPrioritySummarySchema.parse({ headline, secondaryRewards });
}

export function buildSessionRewardPriority(
  consequences: HeadlineRewardConsequences,
): RewardPrioritySummary {
  const parsed = HeadlineRewardConsequencesSchema.parse(consequences);
  const { boss, challenge, companion, personalBest, streak, summary } = parsed;
  const rewards: RewardPriorityReward[] = [];

  if (personalBest?.isPersonalBest) {
    rewards.push({
      detail: `${personalBest.purityScore ?? summary.focusPurityScore ?? 0} purity`,
      kind: 'personal_best',
      label: 'New personal best',
      priority: 'major',
    });
  }

  if ((summary.focusScoreDelta ?? 0) >= 8 || summary.focusScoreBandChanged) {
    rewards.push({
      detail: summary.focusScoreBandChanged ? 'New Focus Score band' : `+${summary.focusScoreDelta} Focus Score`,
      kind: 'focus_score',
      label: 'Focus Score moved',
      priority: 'major',
    });
  }

  if (streak?.streakSaved || (streak && streak.currentDays > streak.previousDays)) {
    rewards.push({
      detail: streak.streakSaved ? `Day ${streak.currentDays} protected` : `Day ${streak.currentDays}`,
      kind: 'streak',
      label: streak.streakSaved ? 'Streak recovered' : 'Streak extended',
      priority: 'major',
    });
  }

  if (boss?.isEnabled && boss.currentHealth <= 0) {
    rewards.push({
      detail: 'Boss cleared',
      kind: 'boss',
      label: 'Boss defeated',
      priority: 'major',
    });
  }

  if (summary.newLevel > summary.previousLevel || summary.xpEarned >= 200) {
    rewards.push({
      detail: summary.newLevel > summary.previousLevel ? `Level ${summary.newLevel}` : `+${summary.xpEarned} XP`,
      kind: 'level',
      label: summary.newLevel > summary.previousLevel ? 'Level up' : 'Large XP gain',
      priority: 'major',
    });
  }

  if (companion?.evolved) {
    rewards.push({
      detail: 'Growth recorded',
      kind: 'companion',
      label: 'Companion growth',
      priority: 'supporting',
    });
  }

  if (challenge?.isEnabled && challenge.completedThisSession) {
    rewards.push({
      detail: 'Progress locked',
      kind: 'challenge',
      label: 'Challenge progress',
      priority: 'supporting',
    });
  }

  if (summary.xpEarned > 0) {
    rewards.push({
      detail: `+${summary.xpEarned} XP`,
      kind: 'xp',
      label: 'Session XP earned',
      priority: 'standard',
    });
  }

  return buildRewardPrioritySummary({ rewards });
}
