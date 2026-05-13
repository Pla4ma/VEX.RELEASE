import * as service from "./service";
import * as repository from "./repository";
import * as analytics from "./analytics";
import { AI_COACH_EVENT_CHANNELS, createCoachMessageGeneratedEvent, createStreakRiskDetectedEvent, createComebackActivatedEvent, createBehaviorSignalDetectedEvent, type AICoachEventPayloadMap } from "./events";
import { type CoachMessage, type MessageCategory, type TriggerType, type SignalType } from "./schemas";


export async function handleUserReturned(payload: { userId: string; daysInactive: number; lastSessionAt: number }): Promise<void> {
  if (payload.daysInactive >= 3) {
    // This will be handled by streak break detection
    // But we can also check for comeback eligibility here
    await service.processBehaviorSignal({
      userId: payload.userId,
      signalType: 'COMEBACK_VELOCITY',
      value: 1, // returning user
      metadata: { daysInactive: payload.daysInactive },
    });
  }
}

export async function handleDailyCheck(payload: { userId: string; lastSessionAt: number | null; streakDays: number }): Promise<void> {
  const now = Date.now();
  const hoursSinceLastSession = payload.lastSessionAt ? (now - payload.lastSessionAt) / (1000 * 60 * 60) : Infinity;

  // No session in 24 hours
  if (hoursSinceLastSession > 24) {
    await service.evaluateInterventions({
      userId: payload.userId,
      trigger: 'NO_SESSION_24H',
      context: { hoursSinceLastSession, streakDays: payload.streakDays },
    });
  }

  // Generate daily recommendation
  await service.createRecommendation({
    userId: payload.userId,
    type: payload.streakDays > 0 ? 'STREAK_PROTECTION' : 'OPTIMAL_TIME',
    context: { hoursSinceLastSession, streakDays: payload.streakDays },
  });
}

export function subscribeToCoachEvents(): () => void {
  // These would subscribe to the actual event bus
  // const unsubscribers = [
  //   eventBus.subscribe('session:completed', handleSessionCompleted),
  //   eventBus.subscribe('session:abandoned', handleSessionAbandoned),
  //   eventBus.subscribe('streak:riskDetected', handleStreakRiskDetected),
  //   eventBus.subscribe('streak:broken', handleStreakBroken),
  //   eventBus.subscribe('progression:levelUp', handleLevelUp),
  //   eventBus.subscribe('challenge:expiring', handleChallengeExpiring),
  //   eventBus.subscribe('challenge:completed', handleChallengeCompleted),
  //   eventBus.subscribe('boss:timeoutWarning', handleBossTimeoutWarning),
  //   eventBus.subscribe('user:returned', handleUserReturned),
  //   eventBus.subscribe('system:dailyCheck', handleDailyCheck),
  // ];

  // Return cleanup function
  // return () => unsubscribers.forEach(unsub => unsub());
  return () => {}; // Placeholder
}

export async function checkIntegrationHealth(): Promise<IntegrationHealth> {
  const checks = {
    serviceAvailable: true, // Would check if service functions are accessible
    repositoryConnected: true, // Would check DB connection
    eventBusConnected: true, // Would check event bus connection
  };

  const healthy = Object.values(checks).every(Boolean);

  return {
    status: healthy ? 'healthy' : 'degraded',
    checks,
    lastChecked: Date.now(),
  };
}