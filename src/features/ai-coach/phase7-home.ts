import { validateCoachInput } from './input-contract';
import { buildInputContractForUser } from './phase7-input-builders';
import { generateMissionSuggestion } from './phase7-mission';
import { getPriorityEngineState, shouldCoachShowSuggestion } from './phase7-priority';
import { generateSessionRecommendation } from './phase7-recommendation';
import { handleStreakRiskIntegration } from './phase7-streak';
import type { CoachSuggestion } from './phase7-schemas';

export async function getHomeCoachSuggestion(userId: string): Promise<CoachSuggestion | null> {
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
    (suggestion): suggestion is CoachSuggestion => suggestion !== null
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
    if (currentPriority === bestPriority && current.confidence > best.confidence) {
      return current;
    }
    return best;
  });

  return shouldCoachShowSuggestion(priorityState, bestSuggestion.priority)
    ? bestSuggestion
    : null;
}
