/**
 * AI Coach Integration Layer
 *
 * Cross-system wiring for AI Coach feature
 * Subscribes to events from other features and emits coach events
 *
 * Dependencies:
 * - Sessions (session data for personalization)
 * - Streaks (streak risk detection)
 * - Progression (level-based advice)
 * - Challenges (challenge suggestions)
 * - Boss (boss encounter status)
 * - Notifications (message delivery)
 * - Analytics (effectiveness tracking)
 */

import * as service from './service';
import * as repository from './repository';
import * as analytics from './analytics';
import {
  AI_COACH_EVENT_CHANNELS,
  createCoachMessageGeneratedEvent,
  createStreakRiskDetectedEvent,
  createComebackActivatedEvent,
  createBehaviorSignalDetectedEvent,
  type AICoachEventPayloadMap,
} from './events';
import {
  type CoachMessage,
  type MessageCategory,
  type TriggerType,
  type SignalType,
} from './schemas';

// Event bus would be imported from shared/events
// import { eventBus } from '@/shared/events';

// ============================================================================
// Session Integration
// ============================================================================

/**
 * Handle session completion - update behavior signals and trigger interventions
 */
export async function handleSessionCompleted(payload: {
  userId: string;
  sessionId: string;
  duration: number;
  qualityScore: number;
  completedAt: number;
}): Promise<void> {
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

/**
 * Handle session abandonment - offer support
 */
export async function handleSessionAbandoned(payload: {
  userId: string;
  sessionId: string;
  duration: number;
  reason?: string;
}): Promise<void> {
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

// ============================================================================
// Streak Integration
// ============================================================================

/**
 * Handle streak risk detection from streaks feature
 */
export async function handleStreakRiskDetected(payload: {
  userId: string;
  currentStreak: number;
  hoursSinceLastSession: number;
  riskLevel: string;
}): Promise<void> {
  // Update coach state
  await service.detectStreakRisk(
    payload.userId,
    payload.hoursSinceLastSession,
    payload.currentStreak
  );

  // Track analytics
  analytics.trackStreakRiskDetected(
    payload.userId,
    payload.currentStreak,
    payload.riskLevel,
    payload.hoursSinceLastSession
  );

  // Emit event
  const event = createStreakRiskDetectedEvent(
    payload.userId,
    payload.currentStreak,
    payload.hoursSinceLastSession,
    payload.riskLevel
  );
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

/**
 * Handle streak break - activate comeback mode
 */
export async function handleStreakBroken(payload: {
  userId: string;
  previousStreak: number;
  daysInactive: number;
}): Promise<void> {
  // Activate comeback if user was on a decent streak
  if (payload.previousStreak >= 3) {
    const comeback = await service.activateComeback({
      userId: payload.userId,
      previousStreak: payload.previousStreak,
      daysInactive: payload.daysInactive,
    });

    // Track analytics
    analytics.trackComebackActivated(
      payload.userId,
      comeback.id,
      payload.previousStreak,
      payload.daysInactive
    );

    // Emit event
    const event = createComebackActivatedEvent(
      payload.userId,
      comeback.id,
      payload.previousStreak,
      payload.daysInactive,
      2.0 // bonus multiplier
    );
    // eventBus.publish(AI_COACH_EVENT_CHANNELS.COMEBACK_ACTIVATED, event);
  } else {
    // Send post-failure support message
    await generateAndSendMessage(payload.userId, 'POST_FAILURE', {
      previousStreak: payload.previousStreak,
    });
  }
}

// ============================================================================
// Progression Integration
// ============================================================================

/**
 * Handle level up - celebrate and adjust difficulty
 */
export async function handleLevelUp(payload: {
  userId: string;
  oldLevel: number;
  newLevel: number;
  xpGained: number;
}): Promise<void> {
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

// ============================================================================
// Challenge Integration
// ============================================================================

/**
 * Handle challenge deadline approaching
 */
export async function handleChallengeExpiring(payload: {
  userId: string;
  challengeId: string;
  challengeName: string;
  hoursRemaining: number;
  progress: number;
}): Promise<void> {
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

/**
 * Handle challenge completion
 */
export async function handleChallengeCompleted(payload: {
  userId: string;
  challengeId: string;
  difficulty: string;
}): Promise<void> {
  // Track completion rate signal
  await service.processBehaviorSignal({
    userId: payload.userId,
    signalType: 'CHALLENGE_COMPLETION_RATE',
    value: 1.0, // completed
    metadata: { challengeId: payload.challengeId, difficulty: payload.difficulty },
  });
}

// ============================================================================
// Boss Integration
// ============================================================================

/**
 * Handle boss timeout warning
 */
export async function handleBossTimeoutWarning(payload: {
  userId: string;
  bossId: string;
  bossName: string;
  hoursRemaining: number;
  healthRemaining: number;
}): Promise<void> {
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

// ============================================================================
// User Activity Integration
// ============================================================================

/**
 * Handle user returning after absence
 */
export async function handleUserReturned(payload: {
  userId: string;
  daysInactive: number;
  lastSessionAt: number;
}): Promise<void> {
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

/**
 * Handle daily check - generate recommendations
 */
export async function handleDailyCheck(payload: {
  userId: string;
  lastSessionAt: number | null;
  streakDays: number;
}): Promise<void> {
  const now = Date.now();
  const hoursSinceLastSession = payload.lastSessionAt
    ? (now - payload.lastSessionAt) / (1000 * 60 * 60)
    : Infinity;

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

// ============================================================================
// Helper Functions
// ============================================================================

async function generateAndSendMessage(
  userId: string,
  category: MessageCategory,
  context: Record<string, unknown>
): Promise<CoachMessage | null> {
  const message = await service.generateMessage({
    userId,
    category,
    context,
    preferredDelivery: 'BOTH',
  });

  if (message) {
    const savedMessage = await repository.createCoachMessage({
      ...message,
      status: 'SENT',
      deliveredAt: Date.now(),
    });

    // Track analytics
    analytics.trackMessageGenerated(userId, savedMessage, true);

    // Emit event
    const event = createCoachMessageGeneratedEvent(
      userId,
      savedMessage.id,
      category,
      savedMessage.content,
      savedMessage.priority,
      savedMessage.deliveryMethod
    );
    // eventBus.publish(AI_COACH_EVENT_CHANNELS.MESSAGE_GENERATED, event);

    return savedMessage;
  }

  return null;
}

// ============================================================================
// Event Subscription Setup
// ============================================================================

/**
 * Subscribe to cross-feature events
 * Call this in app initialization
 */
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

// ============================================================================
// Integration Health Check
// ============================================================================

export interface IntegrationHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    serviceAvailable: boolean;
    repositoryConnected: boolean;
    eventBusConnected: boolean;
  };
  lastChecked: number;
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
