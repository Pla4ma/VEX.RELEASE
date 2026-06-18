import { eventBus } from '../../../events';
import { getCoachPresenceMessageForInterruption } from '../../../features/coach-presence/coach-presence-message-resolver';
import { getCoachPresenceMessage as getCoachPresenceMessageEnriched } from '../../../features/coach-presence/copy-service';
import {
  analyzeSessionPattern,
  buildCoachPresenceContext,
  getRecentAbandonmentCount,
  getRecentCompletionCount,
  type CoachSessionInsight,
  type SessionHistoryEntry,
} from './sessionCoachContext';
import type { SessionStatus } from '../types';
import type { CoachIntegrationConfig, CoachMessage } from './coach-config';
import { debug } from './coach-config';

export interface CoachHandlerState {
  userSessionHistory: Map<string, SessionHistoryEntry[]>;
  config: CoachIntegrationConfig;
}

function getRecentSessionHistory(
  state: CoachHandlerState,
  userId: string,
): SessionHistoryEntry[] {
  return state.userSessionHistory.get(userId) || [];
}

function trackSessionEvent(
  state: CoachHandlerState,
  userId: string,
  status: SessionStatus,
): void {
  const history = getRecentSessionHistory(state, userId);
  history.push({ timestamp: Date.now(), status });
  state.userSessionHistory.set(userId, history.slice(-100));
}

export function buildPresenceMessage(
  type: string,
  context: string,
  priority: CoachMessage['priority'],
  sessionMode: Parameters<typeof buildCoachPresenceContext>[0]['sessionMode'],
  pattern?: Parameters<typeof buildCoachPresenceContext>[0]['pattern'],
): CoachMessage {
  const output = getCoachPresenceMessageEnriched(
    buildCoachPresenceContext({ sessionMode, pattern }),
  );
  return {
    type,
    message: output.message,
    context,
    priority,
    actionButton: output.optionalActionLabel
      ? { label: output.optionalActionLabel, action: output.safeIntent }
      : undefined,
  };
}

export function sendCoachMessage(userId: string, message: CoachMessage): void {
  eventBus.publish('coach:intent', { userId, ...message });
  debug.debug('[Coach]', { userId, ...message, timestamp: Date.now() });
}
export function handleSessionStarted(
  state: CoachHandlerState,
  sessionId: string,
  userId: string,
): void {
  const history = getRecentSessionHistory(state, userId);
  const pattern = analyzeSessionPattern(history);
  trackSessionEvent(state, userId, 'ACTIVE');
  if (state.config.enableComebackDetection && pattern.isComeback) {
    sendCoachMessage(
      userId,
      buildPresenceMessage(
        'welcome_back',
        'comeback_detected',
        'normal',
        'inactive',
        pattern,
      ),
    );
  }
  if (state.config.enablePersonalizedGoals) {
    debug.debug('[Coach Goal]', { userId, sessionId, pattern });
  }
}

export function handleInterruptionRisk(
  userId: string,
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
): void {
  if (riskLevel !== 'CRITICAL') {
    return;
  }
  const message = getCoachPresenceMessageForInterruption({
    motivationStyle: 'CALM',
    firstWeekStage: null,
    sessionState: 'risk',
    riskLevel: 'critical',
    primaryGoal: 'focus',
    studyLayerLabel: null,
    comebackState: null,
    bossIntensity: 'hidden',
  });
  sendCoachMessage(userId, {
    type: 'interruption_warning',
    message,
    context: 'interruption_risk',
    priority: 'high',
  });
}
export function handleSessionPaused(
  userId: string,
  reason?: string,
): void {
  if (reason !== 'interruption' && reason !== 'emergency') {
    return;
  }
  const message = getCoachPresenceMessageEnriched(
    buildCoachPresenceContext({ sessionMode: 'active_paused' }),
  );
  if (message.shouldShow) {
    sendCoachMessage(userId, {
      type: 'pause',
      message: message.message,
      context: 'pause_interruption',
      priority: 'normal',
    });
  }
}
export function handleSessionAbandoned(
  state: CoachHandlerState,
  userId: string,
  elapsedTime: number,
): void {
  trackSessionEvent(state, userId, 'ABANDONED');
  const history = getRecentSessionHistory(state, userId);
  if (getRecentAbandonmentCount(history) >= 3 || elapsedTime > 600) {
    sendCoachMessage(
      userId,
      buildPresenceMessage(
        'support',
        'abandonment_pattern',
        'normal',
        'active_paused',
      ),
    );
  }
}

export function handleSessionCompleted(
  state: CoachHandlerState,
  sessionId: string,
  userId: string,
): void {
  trackSessionEvent(state, userId, 'COMPLETED');
  if (!state.config.enableSessionInsights) {
    return;
  }
  const insight = generateSessionInsight(userId, sessionId);
  debug.debug('[Coach Insights]', insight);
  if (getRecentCompletionCount(getRecentSessionHistory(state, userId)) >= 5) {
    sendCoachMessage(
      userId,
      buildPresenceMessage(
        'milestone',
        'completion_streak',
        'normal',
        'completed',
      ),
    );
  }
}

export function handleSuccessfulRecovery(userId: string): void {
  sendCoachMessage(
    userId,
    buildPresenceMessage(
      'recovery',
      'recovery_success',
      'normal',
      'completed',
    ),
  );
}

function generateSessionInsight(
  userId: string,
  sessionId: string,
): CoachSessionInsight {
  return {
    sessionId,
    userId,
    type: 'pattern',
    insight: 'CoachPresence owns final copy.',
    actionItems: [],
    confidence: 0,
    generatedAt: Date.now(),
  };
}
