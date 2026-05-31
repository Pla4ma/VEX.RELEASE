import type {
  SessionDifficulty,
  StakesSessionResult,
} from './session-stakes-schemas';
import { DIFFICULTY_CONFIG } from './session-stakes-schemas';

export function getDifficultyDisplay(difficulty: SessionDifficulty): {
  label: string;
  description: string;
  icon: string;
  color: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
} {
  const config = DIFFICULTY_CONFIG[difficulty];
  return {
    label: config.label,
    description: config.description,
    icon: config.icon,
    color: config.color,
    riskLevel:
      difficulty === 'CASUAL'
        ? 'LOW'
        : difficulty === 'FOCUSED'
          ? 'MEDIUM'
          : 'HIGH',
  };
}

export function formatStakesSummary(result: StakesSessionResult): string {
  if (!result.completed) {
    if (result.gemsLost > 0) {
      return `💔 Abandoned! Lost ${result.gemsLost} gems. Try Focused mode next time?`;
    }
    return '⚠️ Session abandoned. No rewards earned.';
  }
  const difficultyConfig = DIFFICULTY_CONFIG[result.difficulty];
  let summary = `${difficultyConfig.icon} ${difficultyConfig.label} complete! +${result.xpEarned} XP`;
  if (result.gemsWon > 0) {
    summary += ` (+${result.gemsWon} gems)`;
  }
  if (result.winStreakUpdated > 1 && result.difficulty === 'DEEP_WORK') {
    summary += ` 🔥 ${result.winStreakUpdated} win streak!`;
  }
  return summary;
}
