/**
 * HomeHeroCard helpers
 * Title/eyebrow getters extracted from HomeHeroCard
 */
import type { HomePrimaryPriority } from '../../../features/home-spine/priority-schemas';

export function getHeroTitle(type: HomePrimaryPriority['type']): string {
  switch (type) {
    case 'STREAK_CRITICAL':
      return 'Your streak needs one clean save';
    case 'COMPANION_PROMISE':
      return 'Keep the promise alive today';
    case 'PROMISE_RECOVERY':
      return 'Start small and rebuild the thread';
    case 'STREAK_AT_RISK':
      return 'Protect the habit before it slips';
    case 'RECOMMENDED_SESSION':
      return 'VEX already has the next session ready';
    case 'CHALLENGE_NEAR_DONE':
      return 'You are close enough to finish this today';
    case 'BOSS_ACTIVE':
      return 'The battle is already in motion';
    case 'DEFAULT_SESSION':
      return 'VEX changes based on how you work';
  }
}

export function getHeroEyebrow(type: HomePrimaryPriority['type']): string {
  switch (type) {
    case 'COMPANION_PROMISE':
    case 'PROMISE_RECOVERY':
      return 'Companion thread';
    case 'CHALLENGE_NEAR_DONE':
      return 'Challenge';
    case 'BOSS_ACTIVE':
      return 'Boss run';
    case 'STREAK_AT_RISK':
    case 'STREAK_CRITICAL':
      return 'Habit protection';
    default:
      return 'Right next session';
  }
}
