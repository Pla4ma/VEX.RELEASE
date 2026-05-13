import { eventBus } from "../../events";


export function generateRecoveryResponse(
  scenario: RecoveryScenario,
  context?: {
    daysAbsent?: number;
    streakBefore?: number;
    sessionMinutes?: number;
    quality?: number;
  },
): RecoveryResponse {
  const messages = RECOVERY_MESSAGES[scenario];
  const message = messages[Math.floor(Math.random() * messages.length)]!;

  const tone = getTone(scenario);
  const action = getActionSuggestion(scenario, context);
  const bonus = getRecoveryBonus(scenario, context);

  return { scenario, companionMessage: message, emotionalTone: tone, actionSuggestion: action, bonusApplied: bonus };
}

export function detectBurnout(
  recentSessions: Array<{ duration: number; quality: number; completedAt: number }>,
): boolean {
  if (recentSessions.length < 3) {return false;}

  const last3 = recentSessions.slice(-3);
  const avgQuality = last3.reduce((sum, s) => sum + s.quality, 0) / last3.length;
  const avgDuration = last3.reduce((sum, s) => sum + s.duration, 0) / last3.length;
  const qualityDeclining = last3[2]!.quality < last3[0]!.quality - 10;
  const durationDeclining = last3[2]!.duration < last3[0]!.duration * 0.8;

  return avgQuality < 60 && (qualityDeclining || durationDeclining);
}

export function detectComebackOpportunity(
  daysAbsent: number,
  previousStreak: number,
): RecoveryScenario | null {
  if (daysAbsent >= 7) {return 'RETURN_AFTER_ABSENCE';}
  if (daysAbsent >= 3 && previousStreak >= 7) {return 'RETURN_AFTER_ABSENCE';}
  return null;
}

export function emitRecoveryEvent(
  userId: string,
  scenario: RecoveryScenario,
  response: RecoveryResponse,
): void {
  eventBus.publish('companion.recovery', {
    userId, scenario, message: response.companionMessage,
    tone: response.emotionalTone, bonus: response.bonusApplied, timestamp: Date.now(),
  });
}