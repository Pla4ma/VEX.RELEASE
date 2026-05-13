import * as service from "./service";
import * as repository from "./repository";
import * as analytics from "./analytics";
import { AI_COACH_EVENT_CHANNELS, createCoachMessageGeneratedEvent, createStreakRiskDetectedEvent, createComebackActivatedEvent, createBehaviorSignalDetectedEvent, type AICoachEventPayloadMap } from "./events";
import { type CoachMessage, type MessageCategory, type TriggerType, type SignalType } from "./schemas";


export async function handleSessionCompleted(payload: { userId: string; sessionId: string; duration: number; qualityScore: number; completedAt: number }): Promise<void> {
  // Process behavior signals
  await service.processBehaviorSignal({
    userId: payload.userId,
    signalType: 'SESSION_QUALITY_TREND',
    value: payload.qualityScore,
    metadata: {
      sessionId: payload.sessionId,
      duration: payload.duration,
    },
  });

  // Check for streak risk mitigation
  const state = await service.getOrCreateCoachState(payload.userId);
  if (state.currentState === 'STREAK_AT_RISK') {
    // Evaluate if streak was saved
    await service.evaluateInterventions({
      userId: payload.userId,
      trigger: 'NO_SESSION_24H',
      context: { sessionCompleted: true, qualityScore: payload.qualityScore },
    });
  }

  // Track comeback session if active
  const comeback = await repository.fetchActiveComebackPlan(payload.userId);
  if (comeback && comeback.status === 'ACTIVE') {
    await service.trackComebackSession(payload.userId, true);
  }

  // Generate progress-based message if milestone reached
  if (payload.qualityScore >= 95) {
    await generateAndSendMessage(payload.userId, 'MOTIVATION_BOOST', {
      qualityScore: payload.qualityScore,
    });
  }
}

export async function handleSessionAbandoned(payload: { userId: string; sessionId: string; duration: number; reason?: string }): Promise<void> {
  await service.evaluateInterventions({
    userId: payload.userId,
    trigger: 'SESSION_ABANDONED',
    context: {
      sessionId: payload.sessionId,
      duration: payload.duration,
      reason: payload.reason,
    },
  });

  // Track signal for future personalization
  await service.processBehaviorSignal({
    userId: payload.userId,
    signalType: 'SESSION_QUALITY_TREND',
    value: 0.3, // Low quality due to abandonment
    metadata: { abandoned: true, duration: payload.duration },
  });
}

export async function handleStreakRiskDetected(payload: { userId: string; currentStreak: number; hoursSinceLastSession: number; riskLevel: string }): Promise<void> {
  // Update coach state
  await service.detectStreakRisk(payload.userId, payload.hoursSinceLastSession, payload.currentStreak);

  // Track analytics
  analytics.trackStreakRiskDetected(payload.userId, payload.currentStreak, payload.riskLevel, payload.hoursSinceLastSession);

  // Emit event
  const event = createStreakRiskDetectedEvent(payload.userId, payload.currentStreak, payload.hoursSinceLastSession, payload.riskLevel);
  // eventBus.publish(AI_COACH_EVENT_CHANNELS.STREAK_RISK_DETECTED, event);

  // Generate urgent message for high/critical risk
  if (payload.riskLevel === 'HIGH' || payload.riskLevel === 'CRITICAL') {
    await generateAndSendMessage(payload.userId, 'STREAK_RISK', {
      currentStreak: payload.currentStreak,
      hoursRemaining: Math.max(0, 48 - payload.hoursSinceLastSession),
      riskLevel: payload.riskLevel,
    });
  }
}

export async function handleStreakBroken(payload: { userId: string; previousStreak: number; daysInactive: number }): Promise<void> {
  // Activate comeback if user was on a decent streak
  if (payload.previousStreak >= 3) {
    const comeback = await service.activateComeback({
      userId: payload.userId,
      previousStreak: payload.previousStreak,
      daysInactive: payload.daysInactive,
    });

    // Track analytics
    analytics.trackComebackActivated(payload.userId, comeback.id, payload.previousStreak, payload.daysInactive);

    // Emit event
    const event = createComebackActivatedEvent(
      payload.userId,
      comeback.id,
      payload.previousStreak,
      payload.daysInactive,
      2.0, // bonus multiplier
    );
    // eventBus.publish(AI_COACH_EVENT_CHANNELS.COMEBACK_ACTIVATED, event);
  } else {
    // Send post-failure support message
    await generateAndSendMessage(payload.userId, 'POST_FAILURE', {
      previousStreak: payload.previousStreak,
    });
  }
}

export async function handleLevelUp(payload: { userId: string; oldLevel: number; newLevel: number; xpGained: number }): Promise<void> {
  // Generate milestone hype message
  await generateAndSendMessage(payload.userId, 'MILESTONE_HYPE', {
    milestoneLevel: payload.newLevel,
    oldLevel: payload.oldLevel,
  });

  // Evaluate if difficulty should be adjusted
  if (payload.newLevel % 5 === 0) {
    await service.adjustDifficulty({
      userId: payload.userId,
      reason: `Level up to ${payload.newLevel} - periodic review`,
    });
  }

  // Track signal
  await service.processBehaviorSignal({
    userId: payload.userId,
    signalType: 'DIFFICULTY_PREFERENCE',
    value: payload.newLevel,
  });
}

export async function handleChallengeExpiring(payload: { userId: string; challengeId: string; challengeName: string; hoursRemaining: number; progress: number }): Promise<void> {
  await service.evaluateInterventions({
    userId: payload.userId,
    trigger: 'CHALLENGE_EXPIRING',
    context: {
      challengeId: payload.challengeId,
      challengeName: payload.challengeName,
      hoursRemaining: payload.hoursRemaining,
      progress: payload.progress,
    },
  });
}

export async function handleChallengeCompleted(payload: { userId: string; challengeId: string; difficulty: string }): Promise<void> {
  // Track completion rate signal
  await service.processBehaviorSignal({
    userId: payload.userId,
    signalType: 'CHALLENGE_COMPLETION_RATE',
    value: 1.0, // completed
    metadata: { challengeId: payload.challengeId, difficulty: payload.difficulty },
  });
}

export async function handleBossTimeoutWarning(payload: { userId: string; bossId: string; bossName: string; hoursRemaining: number; healthRemaining: number }): Promise<void> {
  await service.evaluateInterventions({
    userId: payload.userId,
    trigger: 'BOSS_TIMEOUT_WARNING',
    context: {
      bossId: payload.bossId,
      bossName: payload.bossName,
      hoursRemaining: payload.hoursRemaining,
      healthRemaining: payload.healthRemaining,
    },
  });
}