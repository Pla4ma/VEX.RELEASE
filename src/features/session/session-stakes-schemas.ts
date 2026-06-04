import { z } from 'zod';
import { lightColors } from '@/theme/tokens/colors';

export const SessionDifficultySchema = z.enum([
  'CASUAL',
  'FOCUSED',
  'DEEP_WORK',
]);

export const SessionStakesSchema = z.object({
  difficulty: SessionDifficultySchema,
  xpMultiplier: z.number().min(0.5).max(2.0),
  maxPauses: z.number().int().min(0),
  pausePenaltyPercent: z.number().min(0).max(100),
  gemWager: z.number().int().min(0),
  strictMode: z.boolean(),
  failureConsequence: z.enum(['NONE', 'REDUCED_XP', 'LOSE_WAGER']),
});

export const UserStakesPreferenceSchema = z.object({
  userId: z.string().uuid(),
  defaultDifficulty: SessionDifficultySchema,
  totalDeepWorkCompleted: z.number().int().default(0),
  totalGemsWagered: z.number().int().default(0),
  totalGemsWon: z.number().int().default(0),
  currentWinStreak: z.number().int().default(0),
  bestWinStreak: z.number().int().default(0),
});

export const DIFFICULTY_CONFIG = {
  CASUAL: {
    xpMultiplier: 0.5,
    maxPauses: Infinity,
    pausePenaltyPercent: 10,
    gemWager: 0,
    strictMode: false,
    failureConsequence: 'NONE' as const,
    label: 'Casual',
    description: 'Practice mode. Unlimited pauses. 50% XP.',
    icon: '',
    color: lightColors.semantic.success,
  },
  FOCUSED: {
    xpMultiplier: 1.0,
    maxPauses: 2,
    pausePenaltyPercent: 25,
    gemWager: 0,
    strictMode: false,
    failureConsequence: 'NONE' as const,
    label: 'Focused',
    description: 'Standard mode. 2 pauses allowed. 100% XP.',
    icon: '',
    color: lightColors.semantic.warning,
  },
  DEEP_WORK: {
    xpMultiplier: 1.5,
    maxPauses: 0,
    pausePenaltyPercent: 100,
    gemWager: 5,
    strictMode: true,
    failureConsequence: 'LOSE_WAGER' as const,
    label: 'Deep Work',
    description:
      'No pauses. Wager 5 gems. 150% XP if completed, lose gems if abandoned.',
    icon: '',
    color: lightColors.accent.purple,
  },
} as const;

export type SessionDifficulty = z.infer<typeof SessionDifficultySchema>;
export type SessionStakes = z.infer<typeof SessionStakesSchema>;
export type UserStakesPreference = z.infer<typeof UserStakesPreferenceSchema>;

export interface StakesSessionResult {
  sessionId: string;
  userId: string;
  difficulty: SessionDifficulty;
  completed: boolean;
  xpEarned: number;
  baseXp: number;
  gemWager: number;
  gemsWon: number;
  gemsLost: number;
  pausesUsed: number;
  qualityScore: number;
  winStreakUpdated: number;
}
