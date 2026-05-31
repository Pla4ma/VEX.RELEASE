import { z } from 'zod';

export const RewardAlignmentSchema = z.object({
  rewardId: z.string(),
  rewardName: z.string(),
  earnedBecause: z.string(),
  pointsTo: z.enum(['consistency', 'quality', 'depth', 'rhythm', 'growth']),
});

export type RewardAlignment = z.infer<typeof RewardAlignmentSchema>;

export const REWARD_ALIGNMENTS: RewardAlignment[] = [
  {
    rewardId: 'session_complete',
    rewardName: 'Session Complete',
    earnedBecause:
      'You showed up and focused. That is the only thing that matters.',
    pointsTo: 'consistency',
  },
  {
    rewardId: 'streak_milestone',
    rewardName: 'Streak Milestone',
    earnedBecause:
      'Days of showing up compound into real proof of consistency.',
    pointsTo: 'consistency',
  },
  {
    rewardId: 'purity_elite',
    rewardName: 'Exceptional Focus',
    earnedBecause:
      'You stayed deeply focused. Your brain is building stronger pathways.',
    pointsTo: 'quality',
  },
  {
    rewardId: 'xp_level_up',
    rewardName: 'Level Up',
    earnedBecause:
      'Your accumulated focus has built a new tier of consistency.',
    pointsTo: 'growth',
  },
  {
    rewardId: 'companion_growth',
    rewardName: 'Companion Growth',
    earnedBecause: 'Your companion reflects your real focus journey.',
    pointsTo: 'growth',
  },
  {
    rewardId: 'first_session',
    rewardName: 'First Session',
    earnedBecause: 'You started. The hardest session is behind you.',
    pointsTo: 'consistency',
  },
  {
    rewardId: 'content_mastered',
    rewardName: 'Content Mastered',
    earnedBecause: 'Your focused study produced real understanding.',
    pointsTo: 'depth',
  },
  {
    rewardId: 'daily_complete',
    rewardName: 'Daily Anchor Complete',
    earnedBecause: 'You protected your rhythm today. Tomorrow will be easier.',
    pointsTo: 'rhythm',
  },
];

export function getRewardAlignment(
  rewardId: string,
): RewardAlignment | undefined {
  return REWARD_ALIGNMENTS.find((r) => r.rewardId === rewardId);
}

export function getRewardWhy(rewardId: string): string {
  return (
    getRewardAlignment(rewardId)?.earnedBecause ??
    'You earned this through focused work.'
  );
}
