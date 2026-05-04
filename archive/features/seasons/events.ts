/**
 * Seasons Feature - Event Handlers
 *
 * Cross-system event subscriptions
 */

import { eventBus } from '../../events';
import * as service from './service';
import type { EventPayload } from '../../events/EventTypes';

// ============================================================================
// Event Subscriptions
// ============================================================================

/**
 * Initialize season event handlers
 */
export function initializeSeasonEventHandlers(): () => void {
  const unsubscribers: Array<() => void> = [];

  // Listen for session completions to award season XP
  unsubscribers.push(
    eventBus.subscribe('session:completed', handleSessionCompleted)
  );

  // Listen for level ups to check season milestones
  unsubscribers.push(
    eventBus.subscribe('progression:level_up', handleLevelUp)
  );

  // Listen for challenge completions
  unsubscribers.push(
    eventBus.subscribe('challenge:completed', handleChallengeCompleted)
  );

  // Return cleanup function
  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle session completion - award season XP
 */
async function handleSessionCompleted(
  payload: EventPayload<'session:completed'>
): Promise<void> {
  const { userId, duration, summary } = payload;

  // Get active season
  const activeSeason = await service.getActiveSeason();
  if (!activeSeason) {return;}

  // Extract quality score from summary if available
  const summaryData = summary as { qualityScore?: number } | undefined;
  const qualityScore = summaryData?.qualityScore ?? 50; // Default to 50 if not available

  // Calculate season XP from session
  // Base: 1 XP per minute, bonus for quality
  const baseXp = Math.floor(duration / 60);
  const qualityMultiplier = qualityScore / 100;
  const seasonXp = Math.floor(baseXp * qualityMultiplier);

  if (seasonXp > 0) {
    await service.advanceTier({
      userId,
      seasonId: activeSeason.id,
      xpAmount: seasonXp,
      source: 'SESSION_COMPLETE',
    });
  }
}

/**
 * Handle level up - check for season milestones
 */
async function handleLevelUp(
  payload: EventPayload<'progression:level_up'>
): Promise<void> {
  const { userId, newLevel } = payload;

  // Get active season
  const activeSeason = await service.getActiveSeason();
  if (!activeSeason) {return;}

  // Award bonus XP for level up
  const bonusXp = newLevel * 10; // 10 XP per level

  await service.advanceTier({
    userId,
    seasonId: activeSeason.id,
    xpAmount: bonusXp,
    source: 'LEVEL_UP',
  });
}

/**
 * Handle challenge completion - award season XP
 */
async function handleChallengeCompleted(
  payload: EventPayload<'challenge:completed'>
): Promise<void> {
  const { userId, challengeId } = payload;

  // Get active season
  const activeSeason = await service.getActiveSeason();
  if (!activeSeason) {return;}

  // Award XP for completing a challenge
  const challengeXp = 50; // Fixed amount per challenge

  await service.advanceTier({
    userId,
    seasonId: activeSeason.id,
    xpAmount: challengeXp,
    source: 'CHALLENGE_COMPLETE',
  });
}

// ============================================================================
// Event Publishers
// ============================================================================

/**
 * Publish season started event
 */
export function publishSeasonStarted(seasonId: string, name: string): void {
  eventBus.publish('season:activated', { seasonId, name });
}

/**
 * Publish tier unlocked event
 */
export function publishTierUnlocked(
  userId: string,
  seasonId: string,
  tier: number,
  source: string
): void {
  eventBus.publish('season:tier_unlocked', { userId, seasonId, tier, source });
}

/**
 * Publish premium purchased event
 */
export function publishPremiumPurchased(
  userId: string,
  seasonId: string,
  gemsDeducted: number,
  paymentMethod: string
): void {
  eventBus.publish('season:premium:purchased', {
    userId,
    seasonId,
    gemsDeducted,
    paymentMethod,
  });
}
