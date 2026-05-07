/**
 * Mission-Based Recommendations
 *
 * Handles recommendations based on daily mission type.
 */

import type { SessionMode } from './schemas';

/**
 * Gets recommendation based on daily mission type
 */
export function getMissionBasedRecommendation(missionType: string): { duration: number; mode: SessionMode; reason: string } {
  switch (missionType) {
    case 'first-session':
      return {
        duration: 10,
        mode: 'RECOVERY',
        reason: 'Start your first session with a comfortable 10-minute focus block',
      };
    
    case 'streak-critical':
      return {
        duration: 15,
        mode: 'RECOVERY',
        reason: 'Protect your streak with this essential 15-minute session',
      };
    
    case 'boss-fight':
      return {
        duration: 45,
        mode: 'BOSS_PREP',
        reason: 'Boss battle ready! A 45-minute power session will deal maximum damage',
      };
    
    case 'comeback-quest':
      return {
        duration: 20,
        mode: 'RECOVERY',
        reason: 'Comeback session: 20 minutes to restore your momentum',
      };
    
    case 'daily-challenge':
      return {
        duration: 30,
        mode: 'FOCUS',
        reason: 'Challenge-ready: 30 minutes to complete your daily goal',
      };
    
    default:
      return {
        duration: 25,
        mode: 'FOCUS',
        reason: 'Standard session to support your daily mission',
      };
  }
}