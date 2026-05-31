import { z } from 'zod';

/**
 * Streak Gamble mechanics.
 * @deprecated Gamification — gamble mechanic removed. Use recovery proof instead.
 */

export const StreakGambleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  streakDaysAtRisk: z.number(),
  startedAt: z.number(),
  sessionId: z.string(),
  status: z.enum(['ACTIVE', 'WON', 'LOST', 'CANCELLED']),
  requiredGrade: z.enum(['S', 'A', 'B']),
  actualGrade: z.string().optional(),
  bonusXpIfWon: z.number(),
  settledAt: z.number().optional(),
});

export type StreakGamble = z.infer<typeof StreakGambleSchema>;

export interface GambleConfig {
  requiredGrade: 'S' | 'A' | 'B';
  timeWindowHours: number;
  bonusXpMultiplier: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const GAMBLE_CONFIGS: Record<string, GambleConfig> = {
  conservative: {
    requiredGrade: 'B',
    timeWindowHours: 24,
    bonusXpMultiplier: 1.5,
    riskLevel: 'LOW',
  },
  moderate: {
    requiredGrade: 'A',
    timeWindowHours: 12,
    bonusXpMultiplier: 2.0,
    riskLevel: 'MEDIUM',
  },
  aggressive: {
    requiredGrade: 'S',
    timeWindowHours: 6,
    bonusXpMultiplier: 3.0,
    riskLevel: 'HIGH',
  },
};

export function getGambleOptions(
  streakDays: number,
  hoursRemaining: number,
): {
  available: boolean;
  options: Array<{
    type: string;
    config: GambleConfig;
    available: boolean;
    reason?: string;
  }>;
} {
  const options = Object.entries(GAMBLE_CONFIGS).map(([type, config]) => {
    const available = hoursRemaining <= config.timeWindowHours;
    return {
      type,
      config,
      available,
      reason: available
        ? undefined
        : `Requires ${config.timeWindowHours}h or less remaining`,
    };
  });
  return { available: options.some((o) => o.available), options };
}
