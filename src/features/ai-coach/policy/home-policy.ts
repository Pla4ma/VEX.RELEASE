import { validateCoachInput } from '../input/input-contract';
import { buildInputContractForUser } from '../input/input-builders';
import { generateMissionSuggestion } from './mission-policy';
import {
  getPriorityEngineState,
  shouldCoachShowSuggestion,
} from './priority-policy';
import { generateSessionRecommendation } from '../recommendation/recommendation-policy';
import { handleStreakRiskIntegration } from './streak-policy';
import type { CoachSuggestion } from '../recommendation/suggestion-schemas';

export async function getHomeCoachSuggestion(
  userId: string,
): Promise<CoachSuggestion | null> {
  const priorityState = await getPriorityEngineState(userId);
  if (priorityState.streakCritical || priorityState.pendingSync) {
    return null;
  }

  const inputContract = await buildInputContractForUser(userId);
  const validatedInput = validateCoachInput(inputContract);
  const suggestions = await Promise.all([
    generateMissionSuggestion(userId, validatedInput),
    generateSessionRecommendation(userId, validatedInput),
    handleStreakRiskIntegration(userId, {
      currentStreak: validatedInput.streakState.currentStreak,
      hoursSinceLastSession: validatedInput.streakState.hoursSinceLastSession,
      riskLevel: validatedInput.streakState.streakAtRisk ? 'high' : 'low',
    }),
  ]);

  const validSuggestions = suggestions.filter(
    (suggestion): suggestion is CoachSuggestion => suggestion !== null,
  );
  if (validSuggestions.length === 0) {
    return null;
  }

  const bestSuggestion = validSuggestions.reduce((best, current) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const bestPriority = priorityOrder[best.priority];
    const currentPriority = priorityOrder[current.priority];
    if (currentPriority > bestPriority) {
      return current;
    }
    if (
      currentPriority === bestPriority &&
      current.confidence > best.confidence
    ) {
      return current;
    }
    return best;
  });

  return shouldCoachShowSuggestion(priorityState, bestSuggestion.priority)
    ? bestSuggestion
    : null;
}
