import { addBattlePassXp } from '../../features/battle-pass/service';
import { fetchActiveSeason } from '../../features/seasons/repository';
import { clearStreakRestoreQuest, markStreakRestoreUsed, recordStreakRestoreSession } from '../../features/streaks/restore-quest';
import { getStreakSummary, restoreStreak } from '../../features/streaks/service';
import { eventBus } from '../../events';
import { createDebugger } from '../../utils/debug';
import { SessionSummarySchema, type SessionSummary } from '../types';
import {
  calculateRewards,
  grantRewards,
  publishAchievements,
  publishAnalytics,
  publishChallengeProgress,
  publishMilestones,
  publishSocialActivity,
  publishXp,
  recordSquadWarDamageIfNeeded,
  type RewardCalculationResult,
  updateStreak,
} from './session-reward-helpers';

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
}

const DEFAULT_CONFIG: RewardIntegrationConfig = {
  streakMultiplierEnabled: true,
  difficultyMultiplierEnabled: true,
  qualityMultiplierEnabled: true,
  autoGrantRewards: true,
  autoUpdateStreak: true,
  autoAddXP: true,
  autoUpdateAnalytics: true,
  autoCreateSocialActivity: true,
  enableSeasonChallengeProgress: true,
  enableAchievementChecks: true,
  enableMilestoneTracking: true,
};

export class SessionRewardIntegration {
  private config: RewardIntegrationConfig;

  constructor(config: Partial<RewardIntegrationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    eventBus.subscribe('session:completed', (data) => {
      if (!data) {return;}
      const summary = SessionSummarySchema.safeParse(data.summary);
      if (summary.success) {
        void this.handleSessionCompleted(data.sessionId, data.userId, summary.data);
      }
    });
    eventBus.subscribe('session:recovery:successful', (data) => {
      if (data) {void this.handlePartialCompletion(data.sessionId, data.userId, data.recoveredTime || 0);}
    });
    eventBus.subscribe('session:abandoned', (data) => {
      if (data) {void this.handleAbandonment(data.sessionId, data.userId, data.elapsedTime || 0);}
    });
  }

  private async handleSessionCompleted(sessionId: string, userId: string, sessionData: SessionSummary): Promise<void> {
    debug.info('Processing rewards for completed session %s', sessionId);
    const summary: SessionSummary = {
      ...sessionData,
      sessionId,
      userId,
      sessionMode: sessionData.sessionMode,
      plannedDuration: sessionData.plannedDuration,
      actualDuration: sessionData.actualDuration,
      effectiveDuration: sessionData.effectiveDuration,
      completionPercentage: sessionData.completionPercentage,
      focusQuality: sessionData.focusQuality,
      focusPurityScore: sessionData.focusPurityScore,
      interruptions: sessionData.interruptions,
      pauses: sessionData.pauses,
      pausedTime: sessionData.pausedTime,
      streakMaintained: sessionData.streakMaintained,
      modeBonus: sessionData.modeBonus,
      baseScore: sessionData.baseScore,
      createdAt: sessionData.createdAt,
    };

    const rewards = calculateRewards(await this.getUserStreak(userId), summary);

    if (this.config.autoGrantRewards) {grantRewards(userId, rewards);}
    await this.tryRecordSquadDamage(sessionId, userId, summary, rewards);
    if (this.config.autoUpdateStreak) {updateStreak(userId, summary, rewards);}
    if (this.config.autoAddXP) {await this.addSessionXp(userId, rewards.totalXP);}
    await this.advanceRestoreQuest(userId, sessionId);
    if (this.config.autoUpdateAnalytics) {publishAnalytics(userId, summary, rewards);}
    if (this.config.autoCreateSocialActivity) {publishSocialActivity(userId, summary, rewards);}
    if (this.config.enableSeasonChallengeProgress) {publishChallengeProgress(userId, summary, rewards);}
    if (this.config.enableAchievementChecks) {publishAchievements(userId, summary, rewards);}
    if (this.config.enableMilestoneTracking) {publishMilestones(userId, summary, rewards);}

    eventBus.publish('session:rewards:calculated', {
      sessionId,
      userId,
      rewards: { xp: rewards.totalXP, coins: rewards.totalCoins, gems: rewards.totalGems, bonuses: rewards.achievementsUnlocked },
      timestamp: Date.now(),
    });
  }

  private async addSessionXp(userId: string, totalXp: number): Promise<void> {
    publishXp(userId, totalXp, 'session_completion');
    const activeSeason = await fetchActiveSeason();
    const xpAmount = Math.floor(totalXp * 0.5);
    if (!activeSeason || xpAmount <= 0) {return;}
    await addBattlePassXp({ userId, seasonId: activeSeason.id, xpAmount, source: 'SESSION_COMPLETE' });
  }

  private async advanceRestoreQuest(userId: string, sessionId: string): Promise<void> {
    const progress = await recordStreakRestoreSession(userId, sessionId);
    if (!progress.shouldRestore || !progress.streakBefore) {return;}

    const restored = await restoreStreak(userId, progress.streakBefore);
    if (!restored) {return;}

    await markStreakRestoreUsed(userId);
    await clearStreakRestoreQuest(userId);
  }

  private async tryRecordSquadDamage(sessionId: string, userId: string, summary: SessionSummary, rewards: RewardCalculationResult): Promise<void> {
    try {
      await recordSquadWarDamageIfNeeded(sessionId, userId, summary, rewards.streakMultiplier);
    } catch (error) {
      debug.warn('Failed to record squad war damage for session %s', sessionId);
      debug.error('Squad war damage error', error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async handlePartialCompletion(sessionId: string, userId: string, recoveredTime: number): Promise<void> {
    debug.info('Processing partial completion for session %s', sessionId);
    const partialXp = Math.floor(recoveredTime / 60) * 5;
    publishXp(userId, partialXp, 'session_recovery');
    eventBus.publish('analytics:track', { event: 'session_partial_complete', properties: { userId, recoveredTime, xpEarned: partialXp } });
  }

  private async handleAbandonment(sessionId: string, userId: string, elapsedTime: number): Promise<void> {
    debug.info('Processing abandonment for session %s', sessionId);
    const partialXp = elapsedTime >= 300 ? Math.floor(elapsedTime / 60) * 3 : 0;
    if (partialXp > 0) {
      publishXp(userId, partialXp, 'session_partial_abandon');
      eventBus.publish('analytics:track', { event: 'session_abandon_partial_credit', properties: { userId, elapsedTime, xpEarned: partialXp } });
    }
    eventBus.publish('analytics:track', { event: 'session_abandoned', properties: { userId, elapsedTime, hadPartialCredit: partialXp > 0 } });
  }

  private async getUserStreak(userId: string): Promise<number> {
    const summary = await getStreakSummary(userId);
    return summary?.currentDays ?? 0;
  }
}

let rewardIntegration: SessionRewardIntegration | null = null;

export function getSessionRewardIntegration(config?: Partial<RewardIntegrationConfig>): SessionRewardIntegration {
  if (!rewardIntegration) {rewardIntegration = new SessionRewardIntegration(config);}
  return rewardIntegration;
}

export default SessionRewardIntegration;
