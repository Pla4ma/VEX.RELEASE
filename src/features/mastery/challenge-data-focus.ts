import type { ChallengeTemplate } from './types';

export const FOCUS_CHALLENGES: Record<
  'durationMastery' | 'purityMastery',
  ChallengeTemplate[]
> = {
  durationMastery: [
    {
      title: 'Deep Focus',
      description: 'Complete a 45-minute session without pausing',
      target: 45,
      unit: 'minutes',
      difficulty: 'MEDIUM',
      points: 5,
    },
    {
      title: 'Marathon',
      description: 'Complete a 90-minute session with 90%+ purity',
      target: 90,
      unit: 'minutes',
      difficulty: 'HARD',
      points: 10,
    },
    {
      title: 'Iron Will',
      description:
        'Complete 3 sessions of 60+ minutes with zero pauses this week',
      target: 3,
      unit: 'sessions',
      difficulty: 'ELITE',
      points: 15,
    },
    {
      title: 'The Long Haul',
      description: 'Maintain 85%+ purity for a full 60-minute session',
      target: 60,
      unit: 'minutes',
      difficulty: 'HARD',
      points: 8,
    },
    {
      title: 'Sprint Endurance',
      description:
        'Complete 4 consecutive sprints (25 min each) without breaks between',
      target: 4,
      unit: 'sprints',
      difficulty: 'ELITE',
      points: 12,
    },
  ],
  purityMastery: [
    {
      title: 'Crystal Clear',
      description: 'Achieve 95%+ purity in a 30+ minute session',
      target: 95,
      unit: '% purity',
      difficulty: 'MEDIUM',
      points: 5,
    },
    {
      title: 'Perfect Streak',
      description: 'Complete 3 perfect sessions (95%+ purity) in a row',
      target: 3,
      unit: 'sessions',
      difficulty: 'HARD',
      points: 10,
    },
    {
      title: 'Enlightened',
      description: 'Maintain 90%+ average purity for 7 consecutive days',
      target: 7,
      unit: 'days',
      difficulty: 'ELITE',
      points: 15,
    },
    {
      title: 'Flawless Victory',
      description:
        'Achieve 100% purity (zero pauses) in a 45+ minute session',
      target: 1,
      unit: 'session',
      difficulty: 'ELITE',
      points: 20,
    },
    {
      title: 'Pure Consistency',
      description: 'Achieve S grade in 5 consecutive sessions',
      target: 5,
      unit: 'sessions',
      difficulty: 'HARD',
      points: 12,
    },
  ],
};
