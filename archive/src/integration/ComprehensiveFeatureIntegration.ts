import { eventBus } from '../events';
import * as Sentry from '@sentry/react-native';
import { z } from 'zod';
import { createDebugger } from '../utils/debug';
import type {
  SessionCompletedEvent,
  ChallengesCompletedEvent,
  IntegrationSessionRewardsEvent,
} from '../events/event-definitions';
import type { EventPayload } from '../events/EventTypes';
import type { ChestResult } from '../features/rewards/chest-engine';
import type { SessionSummary } from '../session/types';

const debug = createDebugger('integration:comprehensive-feature');

const SessionSummarySchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  duration: z.number().min(0).max(86400),
  effectiveDuration: z.number().min(0),
  plannedDuration: z.number().min(0),
  actualDuration: z.number().min(0),
  completionPercentage: z.number().min(0).max(100),
  focusPurityScore: z.number().min(0).max(100).default(100),
  focusQuality: z.number().min(0).max(100),
  interruptions: z.number().min(0).default(0),
  pauses: z.number().min(0).default(0),
  streakMaintained: z.boolean().default(true),
  xpEarned: z.number().min(0).default(0),
  coinsEarned: z.number().min(0).default(0),
  gemsEarned: z.number().min(0).default(0),
  chestResult: z.unknown().optional(),
});
const ChestResultSchema = z.object({
  tier: z.enum(['wooden', 'silver', 'gold', 'legendary']),
  xpReward: z.number().min(0),
  coinReward: z.number().min(0),
  gemReward: z.number().min(0).default(0),
  bonusItemId: z.string().optional(),
  nearMissTier: z.string().optional(),
});
const RewardCalculationInputSchema = z.object({
  sessionSummary: SessionSummarySchema,
  chestResult: ChestResultSchema.optional(),
  streakMultiplier: z.number().min(1).default(1),
  userLevel: z.number().min(1).default(1),
  activeBoosts: z
    .array(
      z.object({
        type: z.string(),
        multiplier: z.number(),
        expiresAt: z.number(),
      }),
    )
    .default([]),
});
export interface IntegrationState {
  sessionId: string | null;
  userId: string | null;
  phase: 'idle' | 'active' | 'completing' | 'rewarding' | 'done';
  progressionData: {
    previousLevel: number;
    xpBefore: number;
    xpAfter: number;
    levelUp: boolean;
    achievementsUnlocked: string[];
  } | null;
  economyData: {
    coinsBefore: number;
    coinsAfter: number;
    gemsBefore: number;
    gemsAfter: number;
    chestOpened: boolean;
    bonusItemGranted: boolean;
  } | null;
  streakData: {
    daysBefore: number;
    daysAfter: number;
    increased: boolean;
    multiplier: number;
  } | null;
  socialData: {
    activityId: string | null;
    notificationsSent: string[];
    feedPosted: boolean;
  } | null;
  errors: Array<{
    system: string;
    error: Error;
    recoverable: boolean;
    timestamp: number;
  }>;
  retryCount: number;
  maxRetries: number;
}
export class ComprehensiveIntegrationOrchestrator {
  private state: IntegrationState;
  private subscribers: Map<string, Set<(state: IntegrationState) => void>>;
  private processingPromise: Promise<void> | null = null;
  constructor() {
    this.state = this.createInitialState();
    this.subscribers = new Map();
    this.setupEventListeners();
  }
  private createInitialState(): IntegrationState {
    return {
      sessionId: null,
      userId: null,
      phase: 'idle',
      progressionData: null,
      economyData: null,
      streakData: null,
      socialData: null,
      errors: [],
      retryCount: 0,
      maxRetries: 3,
    };
  }
  private setupEventListeners(): void {
    eventBus.subscribe(
      'session:completed',
      this.handleSessionCompleted.bind(this),
    );
    eventBus.subscribe('progression:level_up', this.handleLevelUp.bind(this));
    eventBus.subscribe('economy:grant', this.handleEconomyGrant.bind(this));
    eventBus.subscribe('streak:updated', this.handleStreakUpdate.bind(this));
    eventBus.subscribe(
      'challenges:completed',
      this.handleChallengeComplete.bind(this),
    );
    eventBus.subscribe('coach:trigger', this.handleCoachTrigger.bind(this));
  }
  private updateState(updates: Partial<IntegrationState>): void {
    this.state = { ...this.state, ...updates };
    this.notifySubscribers();
  }
  private notifySubscribers(): void {
    const globalSubscribers = this.subscribers.get('global');
    globalSubscribers?.forEach((callback) => {
      try {
        callback(this.state);
      } catch (error) {
        debug.error(
          'Integration subscriber error',
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    });
  }
  public subscribe(
    phase: string,
    callback: (state: IntegrationState) => void,
  ): () => void {
    if (!this.subscribers.has(phase)) {
      this.subscribers.set(phase, new Set());
    }
    this.subscribers.get(phase)!.add(callback);
    return () => {
      this.subscribers.get(phase)?.delete(callback);
    };
  }
  public getState(): Readonly<IntegrationState> {
    return Object.freeze({ ...this.state });
  }
  private async handleSessionCompleted(rawEvent: unknown): Promise<void> {
    if (this.processingPromise) {
      await this.processingPromise;
    }
    this.processingPromise = this.processSessionCompletion(rawEvent);
    try {
      await this.processingPromise;
    } finally {
      this.processingPromise = null;
    }
  }
  private async processSessionCompletion(rawEvent: unknown): Promise<void> {
    const startTime = Date.now();
    try {
      const event = rawEvent as SessionCompletedEvent;
      const validation = SessionSummarySchema.safeParse(event.summary);
      if (!validation.success) {
        throw new IntegrationError(
          'Invalid session summary data',
          'VALIDATION_FAILED',
          validation.error,
          false,
        );
      }
      this.updateState({
        sessionId: event.sessionId,
        userId: event.userId,
        phase: 'completing',
        errors: [],
        retryCount: 0,
      });
      Sentry.addBreadcrumb({
        category: 'integration',
        message: 'Session completion integration started',
        data: {
          sessionId: event.sessionId,
          userId: event.userId,
          duration: event.summary.effectiveDuration,
        },
      });
      await this.processRewardsPhase(event);
      await this.processProgressionPhase(event);
      await this.processStreakPhase(event);
      await this.processChallengesPhase(event);
      await this.processSocialPhase(event);
      await this.processCoachPhase(event);
      await this.processAnalyticsPhase(event);
      this.updateState({ phase: 'done' });
      const duration = Date.now() - startTime;
      eventBus.publish('integration:session_rewards', {
        sessionId: event.sessionId,
        userId: event.userId,
        rewards: {
          xp: event.summary.xpEarned,
          coins: event.summary.coinsEarned,
          gems: event.summary.gemsEarned,
          chestTier: event.chestResult?.tier,
          bonusItemId: event.chestResult?.bonusItemId,
        },
        streak: {
          days: event.summary.streakMaintained ? 1 : 0,
          multiplier: 1,
          increased: event.summary.streakMaintained,
        },
        purity: {
          score: event.summary.focusPurityScore ?? 100,
          label: this.getPurityLabel(event.summary.focusPurityScore ?? 100),
          perfectFocus: (event.summary.focusPurityScore ?? 100) >= 95,
        },
        timestamp: Date.now(),
      } as IntegrationSessionRewardsEvent);
      Sentry.addBreadcrumb({
        category: 'integration',
        message: 'Session completion integration completed',
        data: { duration, sessionId: event.sessionId },
      });
    } catch (error) {
      await this.handleIntegrationError(error as Error, 'session_completion');
    }
  }
  private async processRewardsPhase(
    event: SessionCompletedEvent,
  ): Promise<void> {
    this.updateState({ phase: 'rewarding' });
    const summary = event.summary;
    const rewardCalculation = this.calculateRewards(summary, event.chestResult);
    await this.grantRewardsWithRetry(event.userId, rewardCalculation);
    if (event.chestResult) {
      eventBus.publish('analytics:track', {
        event: 'chest_opened',
        properties: {
          tier: event.chestResult.tier,
          xp: event.chestResult.xpReward,
          coins: event.chestResult.coinReward,
          gems: event.chestResult.gemReward,
          bonusItemId: event.chestResult.bonusItemId,
          sessionId: event.sessionId,
        },
      });
    }
  }
  private calculateRewards(
    summary: SessionSummary,
    chestResult?: ChestResult,
  ): {
    baseXP: number;
    baseCoins: number;
    baseGems: number;
    streakMultiplier: number;
    purityMultiplier: number;
    totalXP: number;
    totalCoins: number;
    totalGems: number;
  } {
    const baseXP =
      chestResult?.xpReward ?? Math.floor(summary.effectiveDuration / 60) * 10;
    const baseCoins =
      chestResult?.coinReward ??
      Math.floor(summary.effectiveDuration / 300) * 5;
    const baseGems = chestResult?.gemReward ?? 0;
    const streakMultiplier = this.getStreakMultiplier(
      summary.streakMaintained ? 1 : 0,
    );
    const purityMultiplier = this.getPurityMultiplier(
      summary.focusPurityScore ?? 100,
    );
    const totalXP = Math.floor(baseXP * streakMultiplier * purityMultiplier);
    const totalCoins = Math.floor(
      baseCoins * streakMultiplier * purityMultiplier,
    );
    const totalGems = baseGems;
    return {
      baseXP,
      baseCoins,
      baseGems,
      streakMultiplier,
      purityMultiplier,
      totalXP,
      totalCoins,
      totalGems,
    };
  }
  private getStreakMultiplier(streakDays: number): number {
    if (streakDays >= 30) {return 2;}
    if (streakDays >= 14) {return 1.75;}
    if (streakDays >= 7) {return 1.5;}
    if (streakDays >= 3) {return 1.25;}
    return 1;
  }
  private getPurityMultiplier(purityScore: number): number {
    if (purityScore >= 95) {return 1.5;}
    if (purityScore >= 80) {return 1.25;}
    if (purityScore >= 60) {return 1.1;}
    if (purityScore >= 40) {return 1;}
    return 0.9;
  }
  private getPurityLabel(
    score: number,
  ): 'Elite' | 'Good' | 'Okay' | 'Distracted' {
    if (score >= 90) {return 'Elite';}
    if (score >= 70) {return 'Good';}
    if (score >= 45) {return 'Okay';}
    return 'Distracted';
  }
  private async grantRewardsWithRetry(
    userId: string,
    rewards: ReturnType<typeof this.calculateRewards>,
  ): Promise<void> {
    const maxRetries = 3;
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        eventBus.publish('progression:xp_earned', {
          userId,
          xp: rewards.totalXP,
          source: 'session',
        });
        eventBus.publish('economy:grant', {
          userId,
          currency: 'coins',
          amount: rewards.totalCoins,
          source: 'session',
        });
        if (rewards.totalGems > 0) {
          eventBus.publish('economy:grant', {
            userId,
            currency: 'gems',
            amount: rewards.totalGems,
            source: 'session_bonus',
          });
        }
        return;
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }
    throw new IntegrationError(
      'Failed to grant rewards after retries',
      'REWARD_GRANT_FAILED',
      lastError,
      true,
    );
  }
  private async processProgressionPhase(
    event: SessionCompletedEvent,
  ): Promise<void> {
    this.updateState({
      progressionData: {
        previousLevel: 0,
        xpBefore: 0,
        xpAfter: event.summary.xpEarned,
        levelUp: false,
        achievementsUnlocked: [],
      },
    });
  }
  private async processStreakPhase(
    event: SessionCompletedEvent,
  ): Promise<void> {
    if (event.summary.streakMaintained) {
      eventBus.publish('streak:session_completed', {
        userId: event.userId,
        streakDay: 0,
        sessionId: event.sessionId,
      });
    }
  }
  private async processChallengesPhase(
    event: SessionCompletedEvent,
  ): Promise<void> {
    eventBus.publish('challenges:check_progress', {
      userId: event.userId,
      challengeIds: [],
      progress: {
        sessionsCompleted: 1,
        duration: event.summary.effectiveDuration,
        xpEarned: event.summary.xpEarned,
      },
    });
  }
  private async processSocialPhase(
    event: SessionCompletedEvent,
  ): Promise<void> {
    eventBus.publish('social:activity', {
      userId: event.userId,
      activityType: 'session_completed',
      visibility: 'FRIENDS',
      data: {
        id: `activity_${Date.now()}`,
        content: `Completed a ${Math.floor(event.summary.actualDuration / 60)} minute focus session and earned ${event.summary.xpEarned} XP!`,
        timestamp: Date.now(),
        metadata: {
          sessionId: event.sessionId,
          duration: event.summary.actualDuration,
          xpEarned: event.summary.xpEarned,
          purityScore: event.summary.focusPurityScore,
        },
      },
    });
  }
  private async processCoachPhase(event: SessionCompletedEvent): Promise<void> {
    const quality = event.summary.focusPurityScore ?? 100;
    eventBus.publish('coach:session_feedback', {
      userId: event.userId,
      sessionId: event.sessionId,
      duration: event.summary.actualDuration,
      quality,
      streakDay: event.summary.streakMaintained ? 1 : 0,
    });
  }
  private generateFeedbackMessage(
    quality: number,
    streakMaintained: boolean,
  ): string {
    if (quality >= 95 && streakMaintained) {
      return 'Incredible focus! Your streak is looking strong.';
    }
    if (quality >= 80) {
      return 'Great session! Keep building that momentum.';
    }
    if (quality >= 50) {
      return 'Good effort. Try minimizing distractions next time.';
    }
    return 'Tough session? Even short focus time counts. You got this!';
  }
  private async processAnalyticsPhase(
    event: SessionCompletedEvent,
  ): Promise<void> {
    eventBus.publish('analytics:track', {
      event: 'session_complete_integrated',
      properties: {
        userId: event.userId,
        sessionId: event.sessionId,
        duration: event.summary.effectiveDuration,
        purityScore: event.summary.focusPurityScore,
        xpEarned: event.summary.xpEarned,
        coinsEarned: event.summary.coinsEarned,
        streakMaintained: event.summary.streakMaintained,
        chestTier: event.chestResult?.tier,
      },
    });
  }
  private handleLevelUp(event: EventPayload<'progression:level_up'>): void {
    this.updateState({
      progressionData: {
        ...(this.state.progressionData || {
          previousLevel: 0,
          xpBefore: 0,
          xpAfter: 0,
          achievementsUnlocked: [],
        }),
        levelUp: true,
      },
    });
    eventBus.publish('notification:send', {
      userId: event.userId,
      type: 'level_up',
      title: `Level ${event.newLevel}!`,
      body: `Congratulations! You've reached level ${event.newLevel}`,
      data: { newLevel: event.newLevel, rewards: event.rewards },
    });
  }
  private handleEconomyGrant(event: EventPayload<'economy:grant'>): void {
    const targetKey = event.currency === 'coins' ? 'coinsAfter' : 'gemsAfter';
    this.updateState({
      economyData: {
        ...(this.state.economyData || {
          coinsBefore: 0,
          coinsAfter: 0,
          gemsBefore: 0,
          gemsAfter: 0,
          chestOpened: false,
          bonusItemGranted: false,
        }),
        [targetKey]: (this.state.economyData?.[targetKey] || 0) + event.amount,
      },
    });
  }
  private handleStreakUpdate(event: EventPayload<'streak:updated'>): void {
    const currentStreak = event.state.currentStreak;
    this.updateState({
      streakData: {
        daysBefore: Math.max(0, currentStreak - 1),
        daysAfter: currentStreak,
        increased: currentStreak > 0,
        multiplier: 1,
      },
    });
    if (currentStreak === 7 || currentStreak === 30 || currentStreak === 100) {
      eventBus.publish('streak:milestone', {
        userId: event.userId,
        streak: currentStreak,
        milestone: currentStreak,
      });
    }
  }
  private handleChallengeComplete(event: ChallengesCompletedEvent): void {
    eventBus.publish('notification:send', {
      userId: event.userId,
      type: 'challenge_complete',
      title: 'Challenge Complete!',
      body: `You completed a challenge and earned ${event.rewards.xp} XP!`,
      data: { challengeId: event.challengeId, rewards: event.rewards },
    });
  }
  private handleCoachTrigger(event: EventPayload<'coach:trigger'>): void {
    if (event.trigger === 'streak_at_risk') {
      debug.warn('Urgent coach trigger received: %s', event.trigger);
    }
  }
  private async handleIntegrationError(
    error: Error,
    phase: string,
  ): Promise<void> {
    const integrationError =
      error instanceof IntegrationError
        ? error
        : new IntegrationError(error.message, 'UNKNOWN_ERROR', error, true);
    this.updateState({
      errors: [
        ...this.state.errors,
        {
          system: phase,
          error: integrationError,
          recoverable: integrationError.recoverable,
          timestamp: Date.now(),
        },
      ],
    });
    Sentry.captureException(integrationError, {
      tags: {
        integration: 'session_completion',
        phase,
        recoverable: String(integrationError.recoverable),
      },
      extra: {
        sessionId: this.state.sessionId,
        userId: this.state.userId,
        originalError: integrationError.originalError,
      },
    });
    if (
      integrationError.recoverable &&
      this.state.retryCount < this.state.maxRetries
    ) {
      this.updateState({ retryCount: this.state.retryCount + 1 });
      await this.delay(1000 * this.state.retryCount);
    }
  }
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  public reset(): void {
    this.state = this.createInitialState();
    this.notifySubscribers();
  }
  public async retryFailedOperations(): Promise<void> {}
}
export class IntegrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error | null,
    public recoverable: boolean = true,
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}
let orchestratorInstance: ComprehensiveIntegrationOrchestrator | null = null;
export function getIntegrationOrchestrator(): ComprehensiveIntegrationOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new ComprehensiveIntegrationOrchestrator();
  }
  return orchestratorInstance;
}
export default ComprehensiveIntegrationOrchestrator;
