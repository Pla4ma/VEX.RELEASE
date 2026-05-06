/**
 * Achievement Event Handler
 *
 * Subscribes to EventBus and checks achievement progress on relevant events.
 * Routes events to appropriate achievement checkers.
 */

import { eventBus } from "../../events/EventBus";
import type { EventChannels } from "../../events/EventTypes";
import * as Sentry from "@sentry/react-native";
import { createDebugger } from "../../utils/debug";
import { ALL_ACHIEVEMENTS, getAchievementById } from "./definitions";
import type { Achievement, AchievementCategory } from "./types";
import * as achievementRepository from "./repository";
import { spectacleService, SpectacleType, LootRarity } from "../spectacle";

const debug = createDebugger("achievements:event-handler");

// ============================================================================
// Types
// ============================================================================

type EventHandler<T extends keyof EventChannels> = (data: EventChannels[T]) => void;

interface AchievementCheckContext {
  userId: string;
  eventType: string;
  data: Record<string, unknown>;
  timestamp: number;
}

interface AchievementUnlockResult {
  achievementId: string;
  userId: string;
  unlockedAt: number;
  wasAlreadyUnlocked: boolean;
}

// ============================================================================
// Achievement Event Handler Class
// ============================================================================

export class AchievementEventHandler {
  private unsubscribeFns: Array<() => void> = [];
  private isInitialized = false;

  /**
   * Initialize and subscribe to all relevant events
   */
  initialize(): void {
    if (this.isInitialized) {
      debug.warn("AchievementEventHandler already initialized");
      return;
    }

    // Session events
    this.subscribe("session:completed", this.handleSessionCompleted.bind(this));
    this.subscribe("sessions:completed", this.handleSessionCompleted.bind(this));

    // Streak events
    this.subscribe("streak:updated", this.handleStreakUpdated.bind(this));
    this.subscribe("streak:milestone", this.handleStreakMilestone.bind(this));
    this.subscribe("streak:broken", this.handleStreakBroken.bind(this));
    this.subscribe("streak:comeback", this.handleStreakComeback.bind(this));

    // Boss events
    this.subscribe("boss:defeated", this.handleBossDefeated.bind(this));

    // Level/Progression events
    this.subscribe("progression:level_up", this.handleLevelUp.bind(this));
    this.subscribe("progression:prestige", this.handlePrestige.bind(this));

    // Social events
    this.subscribe("squad:joined", this.handleSquadJoined.bind(this));
    this.subscribe("squad:created", this.handleSquadCreated.bind(this));
    this.subscribe("squad-war:ended", this.handleSquadWarWon.bind(this));
    this.subscribe("duel:completed", this.handleDuelCompleted.bind(this));
    this.subscribe("social:referral-completed", this.handleFriendRecruited.bind(this));

    // Economy events
    this.subscribe("economy:currency_spent", this.handleCurrencySpent.bind(this));
    this.subscribe("crafting:item_crafted", this.handleItemCrafted.bind(this));
    this.subscribe("inventory:add_item", this.handleItemAdded.bind(this));

    // Season/Battle Pass events
    this.subscribe("season:tier_unlocked", this.handleTierUnlocked.bind(this));

    // Achievement check event (for manual triggers)
    this.subscribe("achievements:check", this.handleAchievementCheck.bind(this));

    this.isInitialized = true;

    Sentry.addBreadcrumb({
      category: "achievements",
      message: "AchievementEventHandler initialized",
      level: "info",
    });
  }

  /**
   * Clean up all subscriptions
   */
  destroy(): void {
    this.unsubscribeFns.forEach((fn) => fn());
    this.unsubscribeFns = [];
    this.isInitialized = false;
  }

  /**
   * Subscribe to an event channel
   */
  private subscribe<T extends keyof EventChannels>(channel: T, handler: EventHandler<T>): void {
    const unsubscribe = eventBus.subscribe(channel, handler);
    this.unsubscribeFns.push(unsubscribe);
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handle session completion - check session achievements
   */
  private async handleSessionCompleted(data: EventChannels["session:completed"] | EventChannels["sessions:completed"]): Promise<void> {
    const timestamp = "timestamp" in data ? data.timestamp : Date.now();
    const context: AchievementCheckContext = {
      userId: data.userId,
      eventType: "SESSION_COMPLETE",
      data: {
        duration: data.duration,
        quality: "quality" in data ? data.quality : "qualityScore" in data ? data.qualityScore : undefined,
        timestamp,
      },
      timestamp: Date.now(),
    };

    // Check session count achievements
    await this.checkCumulativeAchievements(context.userId, "SESSION_COMPLETE", ["session-first", "session-10", "session-50", "session-100", "session-500"]);

    // Check duration achievements
    if (data.duration >= 60 * 60) {
      // 60 minutes
      await this.checkAchievement(context.userId, "session-60-min");
    }

    // Check perfect session (S-grade)
    if ("quality" in data && data.quality && data.quality >= 95) {
      await this.checkCumulativeAchievements(context.userId, "PERFECT_SESSION", ["session-first-s-grade", "session-10-perfect"]);
    }

    // Check time-based achievements
    const ts = "timestamp" in data ? data.timestamp : Date.now();
    const hour = new Date(ts).getHours();
    if (hour === 0) {
      await this.checkAchievement(context.userId, "session-midnight");
    }
    if (hour === 5) {
      await this.checkAchievement(context.userId, "session-early-bird");
    }
  }

  /**
   * Handle streak updates - check streak achievements
   */
  private async handleStreakUpdated(data: EventChannels["streak:updated"]): Promise<void> {
    const streakDays = data.state.currentStreak;

    // Check milestone achievements
    const streakAchievements = [
      { id: "streak-3", minDays: 3 },
      { id: "streak-7", minDays: 7 },
      { id: "streak-14", minDays: 14 },
      { id: "streak-30", minDays: 30 },
      { id: "streak-60", minDays: 60 },
      { id: "streak-100", minDays: 100 },
      { id: "streak-180", minDays: 180 },
      { id: "streak-365", minDays: 365 },
    ];

    for (const { id, minDays } of streakAchievements) {
      if (streakDays >= minDays) {
        await this.checkAchievement(data.userId, id);
      }
    }
  }

  /**
   * Handle streak milestone
   */
  private async handleStreakMilestone(data: EventChannels["streak:milestone"]): Promise<void> {
    // Already handled by streak:updated, but could add specific milestone logic
    Sentry.addBreadcrumb({
      category: "achievements",
      message: `Streak milestone reached: ${data.milestone}`,
      level: "info",
      data: { userId: data.userId, milestone: data.milestone },
    });
  }

  /**
   * Handle streak broken - check phoenix achievement
   */
  private async handleStreakBroken(_data: EventChannels["streak:broken"]): Promise<void> {
    // This sets up for the phoenix achievement (recover after break)
    // We don't unlock anything here, just track that they had a streak
  }

  /**
   * Handle streak comeback - check phoenix achievement
   */
  private async handleStreakComeback(data: EventChannels["streak:comeback"]): Promise<void> {
    await this.checkAchievement(data.userId, "streak-phoenix");
  }

  /**
   * Handle boss defeat - check boss achievements
   */
  private async handleBossDefeated(data: EventChannels["boss:defeated"]): Promise<void> {
    // First boss defeat
    await this.checkCumulativeAchievements(data.userId, "BOSS_DEFEAT", ["boss-first", "boss-all-6"]);

    // Solo defeat (no participants)
    if (!data.participants || data.participants.length === 0) {
      await this.checkAchievement(data.userId, "boss-solo");
    }

    // Squad defeat
    if (data.participants && data.participants.length > 0) {
      await this.checkAchievement(data.userId, "boss-squad");
    }

    // Check critical hit achievement
    if (data.damageDealt > 100) {
      // Threshold for crit
      await this.checkAchievement(data.userId, "boss-critical");
    }
  }

  /**
   * Handle level up - check progression achievements
   */
  private async handleLevelUp(data: EventChannels["progression:level_up"]): Promise<void> {
    const level = data.newLevel;

    const levelAchievements = [
      { id: "prog-level-5", minLevel: 5 },
      { id: "prog-level-10", minLevel: 10 },
      { id: "prog-level-20", minLevel: 20 },
      { id: "prog-level-50", minLevel: 50 },
    ];

    for (const { id, minLevel } of levelAchievements) {
      if (level >= minLevel) {
        await this.checkAchievement(data.userId, id);
      }
    }
  }

  /**
   * Handle prestige - check prestige achievement
   */
  private async handlePrestige(data: EventChannels["progression:prestige"]): Promise<void> {
    await this.checkAchievement(data.userId, "prog-first-prestige");
  }

  /**
   * Handle squad join - check social achievements
   */
  private async handleSquadJoined(data: EventChannels["squad:joined"]): Promise<void> {
    await this.checkAchievement(data.userId, "social-join-squad");
  }

  /**
   * Handle squad create - check social achievements
   */
  private async handleSquadCreated(data: EventChannels["squad:created"]): Promise<void> {
    if (data.userId) {
      await this.checkAchievement(data.userId, "social-create-squad");
    }
  }

  /**
   * Handle squad war win
   */
  private async handleSquadWarWon(data: EventChannels["squad-war:ended"]): Promise<void> {
    // Check if user was on winning side
    const participants = data.participants || [];
    for (const userId of participants) {
      await this.checkAchievement(userId, "social-war-win");
    }
  }

  /**
   * Handle duel completion - check duel win achievement
   */
  private async handleDuelCompleted(data: EventChannels["duel:completed"]): Promise<void> {
    if (data.winnerId) {
      await this.checkCumulativeAchievements(data.winnerId, "DUEL_WIN", ["social-win-duel"]);

      // Check rival beat (if they beat a specific rival)
      // This would need additional context about rival relationships
    }
  }

  /**
   * Handle friend recruited
   */
  private async handleFriendRecruited(data: EventChannels["social:referral-completed"]): Promise<void> {
    await this.checkAchievement(data.referrerId, "social-invite-join");
  }

  /**
   * Handle currency spent - check economy achievements
   */
  private async handleCurrencySpent(data: EventChannels["economy:currency_spent"]): Promise<void> {
    if (data.currency === "COINS" && data.amount >= 1000) {
      await this.checkAchievement(data.userId, "econ-spend-1000");
    }
  }

  /**
   * Handle item crafted
   */
  private async handleItemCrafted(data: EventChannels["crafting:item_crafted"]): Promise<void> {
    await this.checkAchievement(data.userId, "econ-craft-first");
  }

  /**
   * Handle item added to inventory
   */
  private async handleItemAdded(data: EventChannels["inventory:add_item"]): Promise<void> {
    // Check total items owned
    // This would need to query the inventory count
    // For now, just check the achievement exists
    await this.checkAchievement(data.userId, "econ-own-5");
  }

  /**
   * Handle tier unlocked - check progression achievements
   */
  private async handleTierUnlocked(data: EventChannels["season:tier_unlocked"]): Promise<void> {
    await this.checkAchievement(data.userId, "prog-first-tier");
  }

  /**
   * Handle battle pass tier
   */
  private async handleBattlePassTier(data: { userId: string; tier: number }): Promise<void> {
    if (data.tier >= 25) {
      await this.checkAchievement(data.userId, "prog-bp-tier-25");
    }
  }

  /**
   * Handle manual achievement check
   */
  private async handleAchievementCheck(data: EventChannels["achievements:check"]): Promise<void> {
    // Manual check triggered by other systems
    Sentry.addBreadcrumb({
      category: "achievements",
      message: `Manual achievement check: ${data.type}`,
      level: "debug",
      data: { userId: data.userId, type: data.type },
    });
  }

  // ============================================================================
  // Achievement Checking Logic
  // ============================================================================

  /**
   * Check if a single achievement should be unlocked
   */
  private async checkAchievement(userId: string, achievementId: string): Promise<AchievementUnlockResult | null> {
    const achievement = getAchievementById(achievementId);
    if (!achievement) {
      debug.warn(`Achievement ${achievementId} not found`, new Error("Not found"));
      return null;
    }

    const existing = await achievementRepository.getUserAchievement(userId, achievementId);
    if (existing?.isUnlocked) {
      return null;
    }

    // For now, simulate unlock
    const result: AchievementUnlockResult = {
      achievementId,
      userId,
      unlockedAt: Date.now(),
      wasAlreadyUnlocked: false,
    };

    // Trigger unlock
    await this.unlockAchievement(userId, achievement);

    return result;
  }

  /**
   * Check cumulative achievements (where multiple achievements share the same counter)
   */
  private async checkCumulativeAchievements(userId: string, counterType: string, achievementIds: string[]): Promise<void> {
    const achievements = await achievementRepository.getAllUserAchievements(userId);

    for (const id of achievementIds) {
      const achievement = getAchievementById(id);
      if (!achievement) {
        continue;
      }

      const progress = achievements.find((item) => item.achievementId === id)?.progress ?? 0;
      if (progress >= achievement.progressMax) {
        await this.checkAchievement(userId, id);
      }
    }
  }

  /**
   * Unlock an achievement and trigger rewards
   */
  private async unlockAchievement(userId: string, achievement: Achievement): Promise<void> {
    const existing = await achievementRepository.getUserAchievement(userId, achievement.id);
    if (existing) {
      await achievementRepository.updateAchievementProgress(userId, achievement.id, {
        progress: achievement.progressMax,
        isUnlocked: true,
        unlockedAt: Date.now(),
      });
    } else {
      await achievementRepository.createUserAchievement(userId, achievement.id, {
        progress: achievement.progressMax,
        maxProgress: achievement.progressMax,
        isUnlocked: true,
      });
    }

    // 2. Grant rewards
    if (achievement.reward.coins) {
      // await economyService.addCoins(userId, achievement.reward.coins, 'achievement');
    }
    if (achievement.reward.xp) {
      // await progressionService.addXP(userId, achievement.reward.xp, 'achievement');
    }
    if (achievement.reward.gems) {
      // await economyService.addGems(userId, achievement.reward.gems, 'achievement');
    }

    // 3. Trigger spectacle for rare+ achievements
    if (achievement.rarity === "RARE" || achievement.rarity === "EPIC" || achievement.rarity === "LEGENDARY") {
      // Convert AchievementRarity to LootRarity
      const lootRarityMap: Record<string, LootRarity> = {
        RARE: LootRarity.RARE,
        EPIC: LootRarity.EPIC,
        LEGENDARY: LootRarity.LEGENDARY,
      };

      // Use LEGENDARY_LOOT_DROP spectacle type for legendary achievements
      const spectacleType = achievement.rarity === "LEGENDARY" ? SpectacleType.LEGENDARY_LOOT_DROP : SpectacleType.RARE_LOOT_DROP;

      spectacleService.triggerSpectacle(spectacleType, {
        userId,
        rarity: lootRarityMap[achievement.rarity],
        items: [
          {
            type: "achievement",
            name: achievement.title,
            amount: 1,
            icon: achievement.icon,
          },
        ],
        source: "CHEST",
        timestamp: Date.now(),
      });
    }

    // 4. Create feed post
    // await feedService.createAchievementPost(userId, achievement);

    // 5. Send notification
    // await notificationService.sendAchievementUnlocked(userId, achievement);

    // 6. Track analytics
    Sentry.addBreadcrumb({
      category: "achievements",
      message: `Achievement unlocked: ${achievement.title}`,
      level: "info",
      data: {
        userId,
        achievementId: achievement.id,
        rarity: achievement.rarity,
      },
    });

    // 7. Emit achievement unlocked event
    eventBus.publish("achievement:unlocked", {
      userId,
      achievementId: achievement.id,
      unlockedAt: Date.now(),
    });
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const achievementEventHandler = new AchievementEventHandler();

// ============================================================================
// Initialize on app startup
// ============================================================================

export function initializeAchievementEventHandler(): void {
  achievementEventHandler.initialize();
}

export function destroyAchievementEventHandler(): void {
  achievementEventHandler.destroy();
}

// ============================================================================
// Manual Achievement Check Helper
// ============================================================================

/**
 * Manually check an achievement (for edge cases not covered by events)
 */
export async function checkAchievementManually(userId: string, achievementId: string): Promise<boolean> {
  const achievement = getAchievementById(achievementId);
  if (!achievement) {
    debug.warn(`Achievement ${achievementId} not found`, new Error("Not found"));
    return false;
  }

  const existing = await achievementRepository.getUserAchievement(userId, achievementId);
  return !existing?.isUnlocked;
}

/**
 * Get achievements by category for a user
 */
export function getAchievementsByCategoryForUser(userId: string, category: AchievementCategory): Achievement[] {
  return ALL_ACHIEVEMENTS.filter((a) => a.category === category);
}
