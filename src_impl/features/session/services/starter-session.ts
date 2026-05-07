/**
 * Starter Session Service
 *
 * Service for creating and managing starter sessions for new users.
 * Handles 10-minute default sessions with Recovery/Starter mode configuration.
 *
 * @phase 4
 */

import type { SessionConfig } from '../types';
import { SessionMode } from '../../../session/modes';

export interface StarterSessionConfig {
  duration: number;
  mode: SessionMode.STARTER;
  category?: string | null;
  isFromOnboarding: boolean;
}

/**
 * Creates a starter session configuration
 */
export function createStarterSessionConfig(input: {
  category?: string | null;
  customDuration?: number;
  isFromOnboarding?: boolean;
}): StarterSessionConfig {
  const { category, customDuration, isFromOnboarding = true } = input;
  
  // Default to 10 minutes, allow custom duration
  const duration = customDuration && customDuration >= 5 && customDuration <= 30 
    ? customDuration 
    : 10;

  return {
    duration: duration * 60, // Convert to seconds
    mode: SessionMode.STARTER,
    category: category || null,
    isFromOnboarding,
  };
}

/**
 * Converts starter session config to general session config
 */
export function toSessionConfig(starterConfig: StarterSessionConfig): SessionConfig {
  return {
    mode: starterConfig.mode,
    duration: starterConfig.duration,
    metadata: {
      isStarterSession: true,
      isFromOnboarding: starterConfig.isFromOnboarding,
      category: starterConfig.category,
    },
  };
}

/**
 * Validates if a session qualifies as a starter session
 */
export function isStarterSession(config: SessionConfig): boolean {
  return config.mode === SessionMode.STARTER && 
         config.metadata?.isStarterSession === true;
}

/**
 * Gets starter session specific settings
 */
export function getStarterSessionSettings() {
  return {
    // Starter sessions are very forgiving
    allowAbandonPenalty: false,
    showComplexUI: false,
    enableAdvancedFeatures: false,
    showEncouragingMessages: true,
    companionAlwaysVisible: true,
    disableCoachInterruptions: true,
    simplifyGrading: true,
  };
}

/**
 * Calculates starter session completion rewards
 */
export function calculateStarterSessionRewards(config: StarterSessionConfig, completedSeconds: number) {
  const completionRate = completedSeconds / config.duration;
  
  // Generous rewards for first session
  const baseXP = Math.floor(config.duration / 60) * 2; // 2 XP per minute
  const completionBonus = completionRate >= 0.8 ? 5 : 0; // Bonus for mostly completing
  
  return {
    xp: baseXP + completionBonus,
    focusScoreChange: Math.floor(10 * completionRate), // +10 focus score max
    unlocksFirstStreakDay: completionRate >= 0.5, // Unlock streak if at least half completed
    showsCompanionExcitement: completionRate >= 0.7,
  };
}

/**
 * Determines if user should see starter session flow
 */
export function shouldShowStarterSession(userSessionCount: number): boolean {
  return userSessionCount === 0;
}

/**
 * Gets starter session onboarding messages
 */
export function getStarterSessionMessage(progress: number): string {
  if (progress < 0.1) {
    return "Great start! You're building your focus muscle.";
  } else if (progress < 0.3) {
    return "You're doing amazing! Keep this rhythm going.";
  } else if (progress < 0.5) {
    return "Halfway there! Your focus is getting stronger.";
  } else if (progress < 0.7) {
    return "Fantastic work! You're in the zone now.";
  } else if (progress < 0.9) {
    return "Almost there! You're about to complete your first session!";
  } else {
    return "Incredible! You're about to unlock your focus journey!";
  }
}