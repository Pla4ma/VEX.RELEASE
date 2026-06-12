import { eventBus } from '../../events';
import { createDebugger } from '../../utils/debug';
import { SessionSummarySchema, type SessionSummary } from '../types';
import {
  handleSessionCompleted,
  handlePartialCompletion,
  handleAbandonment,
  isFullyDisabled,
  hasCompletionSideEffects,
} from './SessionRewardHandlers';

const debug = createDebugger('session:reward-integration');

export interface RewardIntegrationConfig {
  streakMultiplierEnabled: boolean;
  difficultyMultiplierEnabled: boolean;
  qualityMultiplierEnabled: boolean;
  autoGrantRewards: boolean;
  autoUpdateStreak: boolean;
  autoAddXP: boolean;
  autoUpdateAnalytics: boolean;
  autoCreateSocialActivity: boolean;
  enableSeasonChallengeProgress: boolean;
  enableAchievementChecks: boolean;
  enableMilestoneTracking: boolean;
  autoHandleRecoveryRewards: boolean;
  autoHandleAbandonmentPartialCredit: boolean;
}

const DEFAULT_CONFIG: RewardIntegrationConfig = {
  streakMultiplierEnabled: true,
  difficultyMultiplierEnabled: true,
  qualityMultiplierEnabled: true,
  autoGrantRewards: true,
  autoUpdateStreak: true,
  autoAddXP: true,
  autoUpdateAnalytics: true,
  autoCreateSocialActivity: false,
  enableSeasonChallengeProgress: false,
  enableAchievementChecks: true,
  enableMilestoneTracking: true,
  autoHandleRecoveryRewards: false,
  autoHandleAbandonmentPartialCredit: false,
};

export class SessionRewardIntegration {
  private config: RewardIntegrationConfig;
  private processedSessionIds = new Set<string>();
  private static readonly MAX_PROCESSED_IDS = 500;
  private unsubscribeFns: Array<() => void> = [];

  constructor(config: Partial<RewardIntegrationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupEventListeners();
  }

  isFullyDisabled(): boolean {
    return isFullyDisabled(this.config);
  }

  private setupEventListeners(): void {
    this.teardownEventListeners();

    if (this.isFullyDisabled()) {
      debug.info(
        'SessionRewardIntegration: fully disabled — not subscribing to any session events',
      );
      return;
    }

    if (hasCompletionSideEffects(this.config)) {
      this.unsubscribeFns.push(
        eventBus.subscribe('session:completed', (data) => {
          if (!data) {
            return;
          }
          const summary = SessionSummarySchema.safeParse(data.summary);
          if (summary.success) {
            this.handleCompleted(
              data.sessionId,
              data.userId,
              summary.data,
            );
          }
        }),
      );
    }

    if (this.config.autoHandleRecoveryRewards) {
      this.unsubscribeFns.push(
        eventBus.subscribe('session:recovery:successful', (data) => {
          if (data) {
            handlePartialCompletion(
              this.config,
              data.sessionId,
              data.userId,
              data.recoveredTime || 0,
            );
          }
        }),
      );
    }

    if (this.config.autoHandleAbandonmentPartialCredit) {
      this.unsubscribeFns.push(
        eventBus.subscribe('session:abandoned', (data) => {
          if (data) {
            handleAbandonment(
              this.config,
              data.sessionId,
              data.userId,
              data.elapsedTime || 0,
            );
          }
        }),
      );
    }
  }

  private teardownEventListeners(): void {
    for (const unsubscribe of this.unsubscribeFns) {
      unsubscribe();
    }
    this.unsubscribeFns = [];
  }

  destroy(): void {
    this.teardownEventListeners();
    debug.info('SessionRewardIntegration destroyed');
  }

  updateConfig(config: Partial<RewardIntegrationConfig>): void {
    this.config = { ...this.config, ...config };
    this.setupEventListeners();
  }

  private async handleCompleted(
    sessionId: string,
    userId: string,
    sessionData: SessionSummary,
  ): Promise<void> {
    if (this.processedSessionIds.has(sessionId)) {
      debug.debug(
        'SessionRewardIntegration: session %s already processed — skipping',
        sessionId,
      );
      return;
    }
    this.processedSessionIds.add(sessionId);
    if (
      this.processedSessionIds.size > SessionRewardIntegration.MAX_PROCESSED_IDS
    ) {
      let count = 0;
      const toRemove = Math.floor(this.processedSessionIds.size * 0.5);
      for (const id of this.processedSessionIds) {
        if (count >= toRemove) {
          break;
        }
        this.processedSessionIds.delete(id);
        count += 1;
      }
    }
    await handleSessionCompleted(this.config, sessionId, userId, sessionData);
  }
}

let rewardIntegration: SessionRewardIntegration | null = null;

export function getSessionRewardIntegration(
  config?: Partial<RewardIntegrationConfig>,
): SessionRewardIntegration {
  if (!rewardIntegration) {
    rewardIntegration = new SessionRewardIntegration(config);
  } else if (config) {
    rewardIntegration.updateConfig(config);
  }
  return rewardIntegration;
}

export default SessionRewardIntegration;
