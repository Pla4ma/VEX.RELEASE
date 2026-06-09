import * as service from '../service/service';
import * as repository from '../repository';
import * as analytics from '../analytics';
import {
  createStreakRiskDetectedEvent,
  createComebackActivatedEvent,
} from '../events';
import { generateAndSendMessage } from '../message/message-helpers';

export async function handleSessionCompleted(payload: {
  userId: string;
  sessionId: string;
  duration: number;
  qualityScore: number;
  completedAt: number;
}): Promise<void> {
  await service.processBehaviorSignal({
    userId: payload.userId,
    signalType: 'SESSION_QUALITY_TREND',
    value: payload.qualityScore,
    metadata: { sessionId: payload.sessionId, duration: payload.duration },
  });
  const state = await service.getOrCreateCoachState(payload.userId);
  if (state.currentState === 'STREAK_AT_RISK') {
    await service.evaluateInterventions({
      userId: payload.userId,
      trigger: 'NO_SESSION_24H',
      context: { sessionCompleted: true, qualityScore: payload.qualityScore },
    });
  }
  const comeback = await repository.fetchActiveComebackPlan(payload.userId);
  if (comeback && comeback.status === 'ACTIVE') {
    await service.trackComebackSession(payload.userId, true);
  }
  if (payload.qualityScore >= 95) {
    await generateAndSendMessage(payload.userId, 'MOTIVATION_BOOST', {
      qualityScore: payload.qualityScore,
    });
  }
}

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
  await service.processBehaviorSignal({
    userId: payload.userId,
    signalType: 'SESSION_QUALITY_TREND',
    value: 0.3,
    metadata: { abandoned: true, duration: payload.duration },
  });
}

export async function handleStreakRiskDetected(payload: {
  userId: string;
  currentStreak: number;
  hoursSinceLastSession: number;
  riskLevel: string;
}): Promise<void> {
  await service.detectStreakRisk(
    payload.userId,
    payload.hoursSinceLastSession,
    payload.currentStreak,
  );
  analytics.trackStreakRiskDetected(
    payload.userId,
    payload.currentStreak,
    payload.riskLevel,
    payload.hoursSinceLastSession,
  );
  const _event = createStreakRiskDetectedEvent(
    payload.userId,
    payload.currentStreak,
    payload.hoursSinceLastSession,
    payload.riskLevel,
  );
  if (payload.riskLevel === 'HIGH' || payload.riskLevel === 'CRITICAL') {
    await generateAndSendMessage(payload.userId, 'STREAK_RISK', {
      currentStreak: payload.currentStreak,
      hoursRemaining: Math.max(0, 48 - payload.hoursSinceLastSession),
      riskLevel: payload.riskLevel,
    });
  }
}

export async function handleStreakBroken(payload: {
  userId: string;
  previousStreak: number;
  daysInactive: number;
}): Promise<void> {
  if (payload.previousStreak >= 3) {
    const comeback = await service.activateComeback({
      userId: payload.userId,
      previousStreak: payload.previousStreak,
      daysInactive: payload.daysInactive,
    });
    analytics.trackComebackActivated(
      payload.userId,
      comeback.id,
      payload.previousStreak,
      payload.daysInactive,
    );
    const _event = createComebackActivatedEvent(
      payload.userId,
      comeback.id,
      payload.previousStreak,
      payload.daysInactive,
      2.0,
    );
  } else {
    await generateAndSendMessage(payload.userId, 'POST_FAILURE', {
      previousStreak: payload.previousStreak,
    });
  }
}
