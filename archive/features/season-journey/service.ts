/**
 * Season Journey Service
 *
 * Business logic for Season Journey progression system.
 * Handles XP calculations, milestone progression, and reward delivery.
 *
 * @phase 3
 */

import { createDebugger } from '../../utils/debug';
import { getSeasonJourneyRepository } from './repository';
import { getEconomyService } from '../economy';
import { getProgressionService } from '../progression';
import { getAnalyticsService } from '../analytics';
import type {
  SeasonJourney,
  JourneyMilestone,
  UserJourney,
  UserJourneySummary,
  JourneySeason,
  SeasonSummary,
  JourneyRewardType,
} from './types';

const debug = createDebugger('season-journey:service');

// ============================================================================
// Service
// ============================================================================

export class SeasonJourneyService {
  private repository = getSeasonJourneyRepository();
  private economyService = getEconomyService();
  private progressionService = getProgressionService();
  private analyticsService = getAnalyticsService();
  private userId: string | null = null;

  setUserId(userId: string): void {
    this.userId = userId;
    this.repository.setUserId(userId);
    this.economyService.setUserId(userId);
    this.progressionService.setUserId(userId);
  }

  // ============================================================================
  // Journey Progression
  // ============================================================================

  /**
   * Initialize user's journey for active season
   */
  async initializeJourney(): Promise<UserJourney> {
    if (!this.userId) throw new Error('User ID not set');

    const activeSeason = await this.repository.getActiveSeasonJourney();
    if (!activeSeason) {
      throw new Error('No active season found');
    }

    // Check if user already has journey
    const existingJourney = await this.repository.getUserJourney(activeSeason.seasonId);
    if (existingJourney) {
      return existingJourney;
    }

    // Create new journey
    const newJourney = await this.repository.createUserJourney(activeSeason.seasonId);
    
    debug.info('Journey initialized', { 
      userId: this.userId, 
      seasonId: activeSeason.seasonId 
    });

    // Track analytics
    this.analyticsService.track('journey_initialized', {
      seasonId: activeSeason.seasonId,
      milestoneCount: activeSeason.milestoneCount,
    });

    return newJourney;
  }

  /**
   * Add XP to journey and check for milestone progression
   */
  async addXp(xpAmount: number, source: string = 'session'): Promise<{
    previousMilestone: number;
    newMilestone: number;
    milestonesUnlocked: number[];
  }> {
    if (!this.userId) throw new Error('User ID not set');

    const activeSeason = await this.repository.getActiveSeasonJourney();
    if (!activeSeason) {
      throw new Error('No active season');
    }

    const previousJourney = await this.repository.getUserJourney(activeSeason.seasonId);
    const previousMilestone = previousJourney?.currentMilestone || 0;

    // Add XP
    await this.repository.addJourneyXp(activeSeason.seasonId, xpAmount);

    const updatedJourney = await this.repository.getUserJourney(activeSeason.seasonId);
    const newMilestone = updatedJourney?.currentMilestone || 0;

    // Check for new milestones
    const milestonesUnlocked: number[] = [];
    for (let i = previousMilestone + 1; i <= newMilestone; i++) {
      if (!previousJourney?.claimedMilestones.includes(i)) {
        milestonesUnlocked.push(i);
      }
    }

    // Track analytics
    this.analyticsService.track('journey_xp_added', {
      xpAmount,
      source,
      seasonId: activeSeason.seasonId,
      previousMilestone,
      newMilestone,
      milestonesUnlocked,
    });

    debug.info('Journey XP added', {
      userId: this.userId,
      xpAmount,
      previousMilestone,
      newMilestone,
      milestonesUnlocked,
    });

    return {
      previousMilestone,
      newMilestone,
      milestonesUnlocked,
    };
  }

  /**
   * Claim milestone reward
   */
  async claimMilestone(milestoneNumber: number): Promise<{
    success: boolean;
    reward?: {
      type: JourneyRewardType;
      amount: number;
      itemId?: string;
    };
    error?: string;
  }> {
    if (!this.userId) throw new Error('User ID not set');

    const activeSeason = await this.repository.getActiveSeasonJourney();
    if (!activeSeason) {
      return { success: false, error: 'No active season' };
    }

    try {
      // Check if milestone is claimable
      const userJourney = await this.repository.getUserJourney(activeSeason.seasonId);
      if (!userJourney || userJourney.currentMilestone < milestoneNumber) {
        return { success: false, error: 'Milestone not reached' };
      }

      if (userJourney.claimedMilestones.includes(milestoneNumber)) {
        return { success: false, error: 'Already claimed' };
      }

      // Get milestone reward
      const milestones = await this.repository.getSeasonMilestones(activeSeason.seasonId);
      const milestone = milestones.find(m => m.milestoneNumber === milestoneNumber);
      if (!milestone) {
        return { success: false, error: 'Milestone not found' };
      }

      // Claim in database
      const success = await this.repository.claimMilestone(activeSeason.seasonId, milestoneNumber);
      if (!success) {
        return { success: false, error: 'Failed to claim' };
      }

      // Award reward
      const reward = await this.awardReward(milestone);

      // Track analytics
      this.analyticsService.track('milestone_claimed', {
        seasonId: activeSeason.seasonId,
        milestoneNumber,
        rewardType: milestone.rewardType,
        rewardAmount: milestone.rewardAmount,
      });

      debug.info('Milestone claimed', {
        userId: this.userId,
        seasonId: activeSeason.seasonId,
        milestoneNumber,
        reward,
      });

      return { success: true, reward };
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to claim milestone:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Award reward to user
   */
  private async awardReward(milestone: JourneyMilestone): Promise<{
    type: JourneyRewardType;
    amount: number;
    itemId?: string;
  }> {
    if (!milestone.rewardType || !milestone.rewardAmount) {
      throw new Error('No reward defined for milestone');
    }

    switch (milestone.rewardType) {
      case 'XP':
        await this.progressionService.addXp(milestone.rewardAmount, 'journey_milestone');
        return {
          type: 'XP',
          amount: milestone.rewardAmount,
        };

      case 'COINS':
        await this.economyService.addCoins(milestone.rewardAmount, 'journey_milestone');
        return {
          type: 'COINS',
          amount: milestone.rewardAmount,
        };

      case 'GEMS':
        await this.economyService.addGems(milestone.rewardAmount, 'journey_milestone');
        return {
          type: 'GEMS',
          amount: milestone.rewardAmount,
        };

      case 'ITEM':
        // Award item from inventory
        if (milestone.rewardId) {
          await this.economyService.grantItem(milestone.rewardId, 'journey_milestone');
          return {
            type: 'ITEM',
            amount: 1,
            itemId: milestone.rewardId,
          };
        }
        throw new Error('Item reward requires itemId');

      case 'COSMETIC':
        // Award cosmetic
        if (milestone.rewardId) {
          await this.economyService.grantCosmetic(milestone.rewardId, 'journey_milestone');
          return {
            type: 'COSMETIC',
            amount: 1,
            itemId: milestone.rewardId,
          };
        }
        throw new Error('Cosmetic reward requires itemId');

      case 'TITLE':
        // Award title
        if (milestone.rewardId) {
          await this.economyService.grantTitle(milestone.rewardId, 'journey_milestone');
          return {
            type: 'TITLE',
            amount: 1,
            itemId: milestone.rewardId,
          };
        }
        throw new Error('Title reward requires itemId');

      case 'BOOST':
        // Award boost
        await this.economyService.grantBoost(milestone.rewardId || 'journey_boost', milestone.rewardAmount, 'journey_milestone');
        return {
          type: 'BOOST',
          amount: milestone.rewardAmount,
          itemId: milestone.rewardId,
        };

      case 'STREAK_SHIELD':
        // Award streak shield
        await this.economyService.grantStreakShield(milestone.rewardAmount, 'journey_milestone');
        return {
          type: 'STREAK_SHIELD',
          amount: milestone.rewardAmount,
        };

      default:
        throw new Error(`Unknown reward type: ${milestone.rewardType}`);
    }
  }

  // ============================================================================
  // Journey Information
  // ============================================================================

  /**
   * Get user's current journey summary
   */
  async getJourneySummary(): Promise<UserJourneySummary | null> {
    const activeSeason = await this.repository.getActiveSeasonJourney();
    if (!activeSeason) return null;

    return this.repository.getUserJourneySummary(activeSeason.seasonId);
  }

  /**
   * Get all milestones for current season
   */
  async getCurrentSeasonMilestones(): Promise<JourneyMilestone[]> {
    const activeSeason = await this.repository.getActiveSeasonJourney();
    if (!activeSeason) return [];

    return this.repository.getSeasonMilestones(activeSeason.seasonId);
  }

  /**
   * Get season summary with user progress
   */
  async getSeasonSummary(): Promise<SeasonSummary> {
    return this.repository.getSeasonSummary();
  }

  /**
   * Check if user can claim specific milestone
   */
  async canClaimMilestone(milestoneNumber: number): Promise<boolean> {
    const summary = await this.getJourneySummary();
    if (!summary) return false;

    return summary.currentMilestone >= milestoneNumber && 
           !summary.claimedMilestones.includes(milestoneNumber);
  }

  /**
   * Get unclaimed milestones
   */
  async getUnclaimedMilestones(): Promise<JourneyMilestone[]> {
    const summary = await this.getJourneySummary();
    if (!summary) return [];

    const allMilestones = await this.getCurrentSeasonMilestones();
    const claimedSet = new Set(summary.claimedMilestones);

    return allMilestones.filter(
      milestone => milestone.milestoneNumber <= summary.currentMilestone && 
                   !claimedSet.has(milestone.milestoneNumber)
    );
  }

  /**
   * Calculate XP needed for next milestone
   */
  async getXpToNextMilestone(): Promise<number> {
    const summary = await this.getJourneySummary();
    return summary?.xpToNextMilestone || 0;
  }

  /**
   * Get journey progress percentage
   */
  async getJourneyProgress(): Promise<number> {
    const summary = await this.getJourneySummary();
    return summary?.totalProgress || 0;
  }

  // ============================================================================
  // Season Management (Admin)
  // ============================================================================

  /**
   * Create new season journey
   */
  async createSeasonJourney(
    seasonId: string,
    milestoneCount: number,
    xpPerMilestone: number,
    theme?: string
  ): Promise<SeasonJourney> {
    // This would be admin-only in production
    const journey = await this.repository.createSeasonJourney({
      seasonId,
      milestoneCount,
      xpPerMilestone,
      theme,
    });

    debug.info('Season journey created', { seasonId, milestoneCount, xpPerMilestone });

    return journey;
  }

  /**
   * Add milestone to season
   */
  async addMilestone(
    seasonJourneyId: string,
    milestoneNumber: number,
    xpRequired: number,
    reward: {
      type: JourneyRewardType;
      amount: number;
      itemId?: string;
    },
    config: {
      name: string;
      description: string;
      iconUrl?: string;
      isMajorMilestone?: boolean;
    }
  ): Promise<JourneyMilestone> {
    const milestone = await this.repository.createMilestone({
      seasonJourneyId,
      milestoneNumber,
      xpRequired,
      rewardId: reward.itemId,
      rewardType: reward.type,
      rewardAmount: reward.amount,
      iconUrl: config.iconUrl,
      isMajorMilestone: config.isMajorMilestone || false,
      name: config.name,
      description: config.description,
    });

    debug.info('Milestone created', { seasonJourneyId, milestoneNumber, rewardType: reward.type });

    return milestone;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let service: SeasonJourneyService | null = null;

export function getSeasonJourneyService(): SeasonJourneyService {
  if (!service) {
    service = new SeasonJourneyService();
  }
  return service;
}

export function resetSeasonJourneyService(): void {
  service = null;
}
