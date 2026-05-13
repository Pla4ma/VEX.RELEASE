import { z } from "zod";
import { createDebugger } from "../../utils/debug";


export async function completeComebackQuest(userId: string, questId: string): Promise<ComebackQuest | null> {
  const quest = activeQuests.get(userId);
  if (!quest || quest.id !== questId) {
    return null;
  }

  const completed: ComebackQuest = {
    ...quest,
    status: 'completed',
    completedAt: Date.now(),
  };

  activeQuests.set(userId, completed);
  debug.info('Completed comeback quest %s for user %s', questId, userId);

  return completed;
}

export function calculateReEngagementProbability(daysSinceLastSession: number, previousSessionsCount: number, averageSessionQuality: number): number {
  // Base probability
  let probability = 0.7;

  // Decrease with time away
  if (daysSinceLastSession > 7) {
    probability -= 0.2;
  }
  if (daysSinceLastSession > 14) {
    probability -= 0.2;
  }
  if (daysSinceLastSession > 30) {
    probability -= 0.2;
  }

  // Increase with engagement history
  if (previousSessionsCount > 10) {
    probability += 0.1;
  }
  if (previousSessionsCount > 50) {
    probability += 0.1;
  }

  // Quality bonus
  if (averageSessionQuality > 80) {
    probability += 0.1;
  }

  // Clamp to 0-1
  return Math.max(0, Math.min(1, probability));
}