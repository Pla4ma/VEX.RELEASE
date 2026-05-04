import { eventBus } from '../events';
import { capture } from '../shared/analytics/analytics-service';
import { ProgressionEvents } from '../shared/analytics/analytics-events';
import { createDebugger } from '../utils/debug';
import {
  PrestigeHistoryEntrySchema,
  LevelConfigSchema,
  LevelStateSchema,
  XPSourceSchema,
  type LevelConfig,
  type LevelState,
  type XPSource,
  type PrestigeRewardPreview,
  type LevelUpEvent,
  type XPAddedEvent,
  type PrestigeEvent,
  type XPBoost,
} from './schemas';
import {
  BoostManager,
  getInitialState,
  calculateXPForLevel,
  loadState,
  saveState,
  clearState,
  grantLevelUpRewards,
  getPrestigeRewardPreview as getPrestigePreview,
  canPrestige,
  prestige as doPrestige,
  processXPEntry,
  syncWithEnhancedService,
  type EnhancedProgressionContext,
} from './service';

const debug = createDebugger('progression');

export {
  PrestigeHistoryEntrySchema,
  LevelConfigSchema,
  LevelStateSchema,
  XPSourceSchema,
  type LevelConfig,
  type LevelState,
  type XPSource,
  type PrestigeRewardPreview,
  type LevelUpEvent,
  type XPAddedEvent,
  type PrestigeEvent,
  type XPBoost,
};

export class ProgressionService {
  private userId: string | null = null;
  private state: LevelState;
  private config: LevelConfig;
  private xpQueue: Array<{ amount: number; source: XPSource; timestamp: number }> = [];
  private processingXP = false;
  private boostManager = new BoostManager();

  constructor(userId?: string, config?: Partial<LevelConfig>) {
    this.config = LevelConfigSchema.parse({ baseXP: 1000, growthFactor: 1.5, maxLevel: 100, prestigeEnabled: true, softCapLevel: 50, softCapPenalty: 0.5, ...config });
    this.state = getInitialState(this.config);
    if (userId) {this.setUserId(userId);}
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    eventBus.subscribe('progression:add_xp', (payload) => {
      if (payload?.userId === this.userId) {
        void this.addXP(payload.amount, payload.source as XPSource, {
          sessionId:
            typeof payload.sessionId === 'string' ? payload.sessionId : undefined,
          metadata:
            payload.metadata &&
            typeof payload.metadata === 'object' &&
            !Array.isArray(payload.metadata)
              ? payload.metadata
              : undefined,
        });
      }
    });
    eventBus.subscribe('streak:apply_bonus', (payload: { userId: string; bonus: number }) => {
      if (payload.userId === this.userId) {void this.addXP(payload.bonus, 'STREAK_BONUS');}
    });
    eventBus.subscribe('boosts:activate', (payload: { userId: string; boostType: string; multiplier: number; duration: number }) => {
      if (payload.userId === this.userId && payload.boostType === 'XP') {
        this.boostManager.activateBoost(payload.boostType, payload.multiplier, payload.duration);
      }
    });
  }

  setUserId(userId: string): void {
    if (userId === this.userId) {return;}
    if (this.userId) { this.clearLocalState(this.userId); }
    if (!userId) { this.userId = null; return; }
    this.userId = userId;
    void this.loadState();
    debug.info('ProgressionService user set: %s', userId);
  }

  private clearLocalState(userId: string): void {
    this.state = getInitialState(this.config);
    this.xpQueue = [];
    this.processingXP = false;
    this.boostManager.clear();
    void clearState(userId);
  }

  private async loadState(): Promise<void> {
    if (!this.userId) {return;}
    const loaded = await loadState(this.userId, this.config);
    if (loaded) {this.state = loaded;}
  }

  async addXP(
    amount: number,
    source: XPSource,
    context: EnhancedProgressionContext = {},
  ): Promise<LevelState> {
    if (!this.userId) {throw new Error('ProgressionService: No user set');}
    if (amount <= 0) {throw new Error('XP amount must be positive');}
    await syncWithEnhancedService(this.userId, amount, source, context);
    this.xpQueue.push({ amount, source, timestamp: Date.now() });
    if (!this.processingXP) {await this.processXPQueue();}
    // Track XP gained analytics
    capture(ProgressionEvents.XP_GAINED, {
      user_id: this.userId,
      xp_amount: amount,
      source: source,
      current_level: this.state.currentLevel,
      total_xp: this.state.totalXP,
    });
    return this.state;
  }

  private async processXPQueue(): Promise<void> {
    if (this.processingXP || this.xpQueue.length === 0) {return;}
    this.processingXP = true;
    try {
      while (this.xpQueue.length > 0) {
        const entry = this.xpQueue.shift();
        if (!entry) {continue;}
        const boostMultiplier = this.boostManager.calculateActiveBoostMultiplier();
        const result = await processXPEntry(entry, this.state, this.config, this.userId!, boostMultiplier);
        this.state = result.newState;
        while (this.state.currentXP >= this.state.xpToNextLevel) {
          await this.levelUp(entry.source);
        }
      }
      await saveState(this.userId!, this.state);
    } finally { this.processingXP = false; }
  }

  private async levelUp(source: XPSource): Promise<void> {
    const previousLevel = this.state.currentLevel;
    this.state.currentXP -= this.state.xpToNextLevel;
    this.state.currentLevel += 1;
    if (this.state.currentLevel > this.config.maxLevel && this.config.prestigeEnabled) {
      this.state.currentLevel = this.config.maxLevel;
      await this.prestige();
      return;
    }
    this.state.levelUpHistory.push({ level: this.state.currentLevel, achievedAt: Date.now(), xpAtLevel: this.state.totalXP });
    this.state.lastLevelUpAt = Date.now();
    this.state.xpToNextLevel = calculateXPForLevel(this.state.currentLevel, this.config);
    const rewardIds = await grantLevelUpRewards(this.userId!, this.state.currentLevel, source);
    const levelUpEvent: LevelUpEvent = {
      userId: this.userId!, newLevel: this.state.currentLevel, previousLevel, totalXP: this.state.totalXP,
      xpToNextLevel: this.state.xpToNextLevel, prestige: this.state.prestige, source, rewards: rewardIds,
    };
    eventBus.publish('progression:level_up', levelUpEvent);
    eventBus.publish('social:level_up', { userId: this.userId!, newLevel: this.state.currentLevel, timestamp: Date.now() });
    // Track level up analytics
    capture(ProgressionEvents.LEVEL_UP, {
      user_id: this.userId,
      new_level: this.state.currentLevel,
      previous_level: previousLevel,
      total_xp: this.state.totalXP,
      prestige: this.state.prestige,
    });
    debug.info('Level up! %d -> %d', previousLevel, this.state.currentLevel);
  }

  async prestige(): Promise<LevelState> {
    if (!this.userId) {throw new Error('ProgressionService: No user set');}
    this.state = await doPrestige(this.userId, this.state, this.config);
    this.boostManager.setPrestigeMultiplier(this.state.prestigeMultiplier);
    return this.state;
  }

  getState(): LevelState { return { ...this.state }; }
  getLevel(): number { return this.state.currentLevel; }
  getTotalXP(): number { return this.state.totalXP; }
  getPrestige(): number { return this.state.prestige; }
  getProgressPercent(): number { return this.state.progressPercent; }
  getLevelUpHistory(): LevelState['levelUpHistory'] { return [...this.state.levelUpHistory]; }
  isMaxLevel(): boolean { return this.state.currentLevel >= this.config.maxLevel && !this.config.prestigeEnabled; }
  canPrestige(): boolean { return canPrestige(this.state, this.config); }
  getPrestigeRewardPreview(): PrestigeRewardPreview { return getPrestigePreview(this.state); }
  getRemainingXP(): number { return this.state.xpToNextLevel - this.state.currentXP; }
  getEstimatedSessionsToLevel(sessionAverageXP: number): number { return sessionAverageXP <= 0 ? Infinity : Math.ceil(this.getRemainingXP() / sessionAverageXP); }
  async getLeaderboardPosition(): Promise<{ position: number; total: number }> { return { position: 0, total: 0 }; }
  getDifficultyRecommendation(): 'EASY' | 'NORMAL' | 'HARD' | 'EXPERT' {
    const effectiveLevel = this.state.currentLevel + this.state.prestige * 50;
    if (effectiveLevel < 10) {return 'EASY';}
    if (effectiveLevel < 30) {return 'NORMAL';}
    if (effectiveLevel < 60) {return 'HARD';}
    return 'EXPERT';
  }
}

let progressionServiceInstance: ProgressionService | null = null;
export function getProgressionService(userId?: string): ProgressionService {
  if (!progressionServiceInstance) {progressionServiceInstance = new ProgressionService(userId);}
  else if (userId) {progressionServiceInstance.setUserId(userId);}
  return progressionServiceInstance;
}
