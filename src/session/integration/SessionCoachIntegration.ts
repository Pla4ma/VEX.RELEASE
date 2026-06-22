import { eventBus } from '../../events';
import { getAvailabilityFor } from '../../features/liveops-config/feature-access-store';
import type { SessionHistoryEntry } from './sessionCoachContext';
import type { CoachIntegrationConfig } from './coach-config';
import { FEATURE_KEY, debug, DEFAULT_CONFIG } from './coach-config';
import {
  handleSessionStarted,
  handleInterruptionRisk,
  handleSessionPaused,
  handleSessionAbandoned,
  handleSessionCompleted,
  handleSuccessfulRecovery,
  sendCoachMessage,
  type CoachHandlerState,
} from './coach-handlers';

export type { CoachIntegrationConfig } from './coach-config';

export class SessionCoachIntegration {
  private readonly config: CoachIntegrationConfig;
  private readonly unsubscribers: Array<() => void> = [];
  private readonly handlerState: CoachHandlerState;

  constructor(config: Partial<CoachIntegrationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.handlerState = {
      userSessionHistory: new Map<string, SessionHistoryEntry[]>(),
      config: this.config,
    };
    this.setupEventListeners();
  }

  cleanup(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers.length = 0;
  }

  private setupEventListeners(): void {
    if (
      !getAvailabilityFor(FEATURE_KEY).canSubscribeToEvents ||
      !this.config.enabled
    ) {
      debug.info('SessionCoachIntegration skipped - feature not available');
      return;
    }

    this.unsubscribers.push(
      eventBus.subscribe(
        'session:started',
        (data) =>
          data && handleSessionStarted(this.handlerState, data.sessionId, ''),
      ),
      eventBus.subscribe(
        'session:interruption:risk',
        (data) => data && handleInterruptionRisk('', data.riskLevel),
      ),
      eventBus.subscribe(
        'session:paused',
        (data) => data && handleSessionPaused('', data.reason),
      ),
      eventBus.subscribe(
        'session:abandoned',
        (data) =>
          data &&
          handleSessionAbandoned(
            this.handlerState,
            data.userId || '',
            data.elapsedTime || 0,
          ),
      ),
      eventBus.subscribe(
        'session:completed',
        (data) =>
          data &&
          handleSessionCompleted(
            this.handlerState,
            data.sessionId,
            data.userId,
          ),
      ),
      eventBus.subscribe(
        'session:recovery:successful',
        (data) => data && handleSuccessfulRecovery(data.userId),
      ),
    );
  }
}

let coachIntegration: SessionCoachIntegration | null = null;

export function getSessionCoachIntegration(
  config?: Partial<CoachIntegrationConfig>,
): SessionCoachIntegration {
  if (!coachIntegration) {
    coachIntegration = new SessionCoachIntegration(config);
  }
  return coachIntegration;
}
