import type { CoachInputContract } from './input-contract-schema';

export function createFallbackInsight(input: Partial<CoachInputContract>): {
  canCoach: boolean;
  reason: string;
  fallbackMessage?: string;
} {
  if (!input.streakState?.currentStreak && !input.recentSessionGrades?.length) {
    return {
      canCoach: false,
      reason: 'Insufficient user data for personalized coaching',
      fallbackMessage: 'Complete a few sessions to unlock personalized AI coaching!',
    };
  }

  const dataPoints = [
    input.recentSessionGrades?.length || 0,
    input.missionHistory?.length || 0,
  ].reduce((sum, count) => sum + count, 0);

  if (dataPoints < 3) {
    return {
      canCoach: true,
      reason: 'Limited data - using general guidance',
      fallbackMessage: 'Keep completing sessions to get more personalized advice!',
    };
  }

  return {
    canCoach: true,
    reason: 'Sufficient data for personalized coaching',
  };
}
