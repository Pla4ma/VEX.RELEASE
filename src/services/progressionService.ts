/**
 * Progression Service
 *
 * Handles user progression, XP, levels, and achievements.
 * Direct service implementation replacing archived system.
 */

import { createDebugger } from "../utils/debug";
import { capture } from "../shared/analytics/analytics-service";
import { ProgressionEvents } from "../shared/analytics/analytics-events";
import { eventBus } from "../events";

const debug = createDebugger("progression-service");

export interface XPGrant {
  amount: number;
  source:
    | "session_complete"
    | "challenge_complete"
    | "achievement_unlock"
    | "streak_milestone"
    | "daily_login";
  metadata?: Record<string, unknown>;
}

export interface LevelInfo {
  level: number;
  currentXP: number;
  xpToNext: number;
  totalXP: number;
  isMaxLevel: boolean;
}

class ProgressionService {
  private userId: string = "";
  private currentXP: number = 0;
  private currentLevel: number = 1;
  private unsubscribeAddXP: (() => void) | null = null;

  constructor() {
    this.unsubscribeAddXP = eventBus.subscribe("progression:add_xp", (data) => {
      if (!data) { return; }
      void this.grantXP({
        amount: data.amount,
        source: data.source as XPGrant["source"],
        metadata: data.metadata,
      });
    });
  }

  /**
   * Set the current user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
    debug.info("Progression service initialized for user:", userId);
  }

  /**
   * Get current progression info
   */
  getProgressionInfo(): LevelInfo {
    const xpToNext = this.calculateXPToNext(this.currentLevel);
    const totalXP = this.calculateTotalXPForLevel(this.currentLevel);

    return {
      level: this.currentLevel,
      currentXP: this.currentXP,
      xpToNext,
      totalXP,
      isMaxLevel: this.currentLevel >= 100,
    };
  }

  /**
   * Grant XP to user
   */
  async grantXP(xpGrant: XPGrant): Promise<boolean> {
    if (!this.userId) {
      debug.error("No user ID set for progression service");
      return false;
    }

    try {
      const oldLevel = this.currentLevel;
      this.currentXP += xpGrant.amount;

      // Check for level up
      const newLevel = this.calculateLevelFromXP(this.currentXP);
      if (newLevel > oldLevel) {
        this.currentLevel = newLevel;
        await this.handleLevelUp(oldLevel, newLevel);
      }

      // Track analytics
      capture(ProgressionEvents.XP_GRANTED, {
        user_id: this.userId,
        amount: xpGrant.amount,
        source: xpGrant.source,
        new_level: this.currentLevel,
        old_level: oldLevel,
      });

      debug.info("XP granted successfully", {
        amount: xpGrant.amount,
        source: xpGrant.source,
        newTotal: this.currentXP,
        newLevel: this.currentLevel,
      });

      return true;
    } catch (error) {
      debug.error("Failed to grant XP:", error);
      return false;
    }
  }

  /**
   * Calculate level from total XP
   */
  private calculateLevelFromXP(totalXP: number): number {
    let level = 1;
    let xpNeeded = 0;

    while (xpNeeded <= totalXP && level < 100) {
      level++;
      xpNeeded = 50 * level * (level + 1);
    }

    return Math.max(1, level - 1);
  }

  /**
   * Calculate XP needed for next level
   */
  private calculateXPToNext(level: number): number {
    if (level >= 100) { return 0; }
    const nextLevel = level + 1;
    const totalXPForNext = 50 * nextLevel * (nextLevel + 1);
    const totalXPForCurrent = 50 * level * (level + 1);
    return totalXPForNext - totalXPForCurrent;
  }

  /**
   * Calculate total XP needed for a specific level
   */
  private calculateTotalXPForLevel(level: number): number {
    return 50 * level * (level + 1);
  }

  /**
   * Handle level up event — uses dynamic import to avoid circular dependency
   */
  private async handleLevelUp(
    oldLevel: number,
    newLevel: number,
  ): Promise<void> {
    debug.info("Level up!", { from: oldLevel, to: newLevel });

    capture(ProgressionEvents.LEVEL_UP, {
      user_id: this.userId,
      old_level: oldLevel,
      new_level: newLevel,
    });

    const { rewardService } = await import("./rewardService");
    rewardService.setUserId(this.userId);
    await rewardService.claimReward(`level_${Math.floor(newLevel / 5) * 5}`);
  }

  /**
   * Reset user data (for logout)
   */
  reset(): void {
    this.userId = "";
    this.currentXP = 0;
    this.currentLevel = 1;
    if (this.unsubscribeAddXP) {
      this.unsubscribeAddXP();
      this.unsubscribeAddXP = null;
    }
    debug.info("Progression service reset");
  }
}

// Singleton instance
export const progressionService = new ProgressionService();
