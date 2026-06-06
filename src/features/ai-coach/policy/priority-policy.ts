import * as repository from '../repository';
import {
  PriorityEngineSchema,
  type CoachPriority,
  type PriorityEngine,
} from '../recommendation/suggestion-schemas';

export function shouldCoachShowSuggestion(
  priorityEngine: PriorityEngine,
  suggestionPriority: CoachPriority,
): boolean {
  if (priorityEngine.streakCritical || priorityEngine.pendingSync) {
    return suggestionPriority === 'critical';
  }
  if (suggestionPriority === 'critical' || suggestionPriority === 'high') {
    return true;
  }
  return (
    !priorityEngine.coachNextAction &&
    !priorityEngine.dailyMissionReminder &&
    !priorityEngine.squadHelp
  );
}

export async function getPriorityEngineState(
  userId: string,
): Promise<PriorityEngine> {
  const coachState = await repository.fetchCoachState(userId);
  const recentMessages = await repository.fetchRecentMessages(userId, 5);

  return PriorityEngineSchema.parse({
    streakCritical: coachState?.currentState === 'STREAK_AT_RISK',
    pendingSync: recentMessages.some((message) => message.status === 'SENT'),
    coachNextAction: false,
    dailyMissionReminder: false,
    squadHelp: false,
  });
}
