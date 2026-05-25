import { eventBus } from '../../events';
import { getCoachPresenceMessageForInterruption } from '../../features/coach-presence/coach-presence-message-resolver';
import { getCoachPresenceMessage as getCoachPresenceMessageEnriched } from '../../features/coach-presence/copy-service';
import { getAvailabilityFor } from '../../features/liveops-config/feature-access-store';
import { createDebugger } from '../../utils/debug';
import type { SessionStatus } from '../types';
import {
  analyzeSessionPattern,
  buildCoachPresenceContext,
  getRecentAbandonmentCount,
  getRecentCompletionCount,
  type CoachSessionInsight,
  type SessionHistoryEntry,
} from './sessionCoachContext';

const FEATURE_KEY = 'ai_coach_basic' as const;
const debug = createDebugger('session:coach-integration');

export interface CoachIntegrationConfig {
  enabled: boolean;
  interruptionThresholds: { warning: number; critical: number };
  enableProactiveTips: boolean;
  enableComebackDetection: boolean;
  enableStreakRiskAlerts: boolean;
  enablePersonalizedGoals: boolean;
  enableSessionInsights: boolean;
}

const DEFAULT_CONFIG: CoachIntegrationConfig = {
  enabled: true,
  interruptionThresholds: { warning: 60, critical: 300 },
  enableProactiveTips: false,
  enableComebackDetection: true,
  enableStreakRiskAlerts: false,
  enablePersonalizedGoals: true,
  enableSessionInsights: true,
};

type CoachMessage = {
  type: string;
  message: string;
  context: string;
  priority: 'low' | 'normal' | 'high';
  actionButton?: { label: string; action: string };
};

export class SessionCoachIntegration {
  private readonly config: CoachIntegrationConfig;
  private readonly unsubscribers: Array<() => void> = [];
  private readonly userSessionHistory = new Map<string, SessionHistoryEntry[]>();

  constructor(config: Partial<CoachIntegrationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupEventListeners();
  }

  cleanup(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers.length = 0;
  }

  private setupEventListeners(): void {
    if (!getAvailabilityFor(FEATURE_KEY).canSubscribeToEvents || !this.config.enabled) {
      debug.info('SessionCoachIntegration skipped - feature not available');
      return;
    }

    this.unsubscribers.push(
      eventBus.subscribe('session:started', (data) => data && this.handleSessionStarted(data.sessionId, '')),
      eventBus.subscribe('session:interruption:risk', (data) => data && this.handleInterruptionRisk('', data.riskLevel)),
      eventBus.subscribe('session:paused', (data) => data && this.handleSessionPaused('', data.reason)),
      eventBus.subscribe('session:abandoned', (data) => data && this.handleSessionAbandoned(data.userId || '', data.elapsedTime || 0)),
      eventBus.subscribe('session:completed', (data) => data && this.handleSessionCompleted(data.sessionId, data.userId)),
      eventBus.subscribe('session:recovery:successful', (data) => data && this.handleSuccessfulRecovery(data.userId)),
    );
  }

  private handleSessionStarted(sessionId: string, userId: string): void {
    const history = this.getRecentSessionHistory(userId);
    const pattern = analyzeSessionPattern(history);
    this.trackSessionEvent(userId, 'ACTIVE');
    if (this.config.enableComebackDetection && pattern.isComeback) {
      this.sendCoachMessage(userId, this.buildPresenceMessage('welcome_back', 'comeback_detected', 'normal', 'inactive', pattern));
    }
    if (this.config.enablePersonalizedGoals) {
      debug.debug('[Coach Goal]', { userId, sessionId, pattern });
    }
  }

  private handleInterruptionRisk(userId: string, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): void {
    if (riskLevel !== 'CRITICAL') {return;}
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
    this.sendCoachMessage(userId, { type: 'interruption_warning', message, context: 'interruption_risk', priority: 'high' });
  }

  private handleSessionPaused(userId: string, reason?: string): void {
    this.trackSessionEvent(userId, 'PAUSED');
    if (reason !== 'interruption' && reason !== 'emergency') {return;}
    const message = getCoachPresenceMessageEnriched(buildCoachPresenceContext({ sessionMode: 'active_paused' }));
    if (message.shouldShow) {
      this.sendCoachMessage(userId, { type: 'pause', message: message.message, context: 'pause_interruption', priority: 'normal' });
    }
  }

  private handleSessionAbandoned(userId: string, elapsedTime: number): void {
    this.trackSessionEvent(userId, 'ABANDONED');
    const history = this.getRecentSessionHistory(userId);
    if (getRecentAbandonmentCount(history) >= 3 || elapsedTime > 600) {
      this.sendCoachMessage(userId, this.buildPresenceMessage('support', 'abandonment_pattern', 'normal', 'active_paused'));
    }
  }

  private handleSessionCompleted(sessionId: string, userId: string): void {
    this.trackSessionEvent(userId, 'COMPLETED');
    if (!this.config.enableSessionInsights) {return;}
    const insight = this.generateSessionInsight(userId, sessionId);
    debug.debug('[Coach Insights]', insight);
    if (getRecentCompletionCount(this.getRecentSessionHistory(userId)) >= 5) {
      this.sendCoachMessage(userId, this.buildPresenceMessage('milestone', 'completion_streak', 'normal', 'completed'));
    }
  }

  private handleSuccessfulRecovery(userId: string): void {
    this.sendCoachMessage(userId, this.buildPresenceMessage('recovery', 'recovery_success', 'normal', 'completed'));
  }

  private buildPresenceMessage(
    type: string,
    context: string,
    priority: CoachMessage['priority'],
    sessionMode: Parameters<typeof buildCoachPresenceContext>[0]['sessionMode'],
    pattern?: Parameters<typeof buildCoachPresenceContext>[0]['pattern'],
  ): CoachMessage {
    const output = getCoachPresenceMessageEnriched(buildCoachPresenceContext({ sessionMode, pattern }));
    return { type, message: output.message, context, priority, actionButton: output.optionalActionLabel ? { label: output.optionalActionLabel, action: output.safeIntent } : undefined };
  }

  private sendCoachMessage(userId: string, message: CoachMessage): void {
    eventBus.publish("coach:intent", { userId, ...message });
    debug.debug('[Coach]', { userId, ...message, timestamp: Date.now() });
  }

  private getRecentSessionHistory(userId: string): SessionHistoryEntry[] {
    return this.userSessionHistory.get(userId) || [];
  }

  private trackSessionEvent(userId: string, status: SessionStatus): void {
    const history = this.getRecentSessionHistory(userId);
    history.push({ timestamp: Date.now(), status });
    this.userSessionHistory.set(userId, history.slice(-100));
  }

  private generateSessionInsight(userId: string, sessionId: string): CoachSessionInsight {
    return { sessionId, userId, type: 'pattern', insight: 'CoachPresence owns final copy.', actionItems: [], confidence: 0, generatedAt: Date.now() };
  }
}

let coachIntegration: SessionCoachIntegration | null = null;

export function getSessionCoachIntegration(config?: Partial<CoachIntegrationConfig>): SessionCoachIntegration {
  if (!coachIntegration) {coachIntegration = new SessionCoachIntegration(config);}
  return coachIntegration;
}

export default SessionCoachIntegration;
