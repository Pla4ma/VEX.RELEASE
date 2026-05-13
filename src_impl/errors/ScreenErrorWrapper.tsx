/**
 * Screen Error Wrapper
 * 
 * Higher-order component that wraps screens with appropriate error boundaries
 * based on screen type and criticality.
 */

import React from 'react';
import { ScreenErrorBoundary } from '../shared/ui/components/ScreenErrorBoundary';

// ============================================================================
// Screen Error Configuration
// ============================================================================
// ============================================================================
// Screen Type Definitions
// ============================================================================
// ============================================================================
// Screen Error Configurations
// ============================================================================

const SCREEN_ERROR_CONFIGS: Record<ScreenType, ScreenErrorConfig> = {
  session: {
    screenName: 'Focus Session',
    isCritical: true,
    recoveryTarget: 'Home',
    preserveState: true,
    errorMessages: {
      network: 'Can\'t start session without internet. Please check your connection.',
      auth: 'Your session requires authentication. Please sign in again.',
      server: 'Session service is temporarily unavailable. Please try again.',
      validation: 'Invalid session configuration. Please check your settings.',
    },
  },
  'session-complete': {
    screenName: 'Session Complete',
    isCritical: true,
    recoveryTarget: 'Home',
    preserveState: true,
    errorMessages: {
      network: 'Can\'t save session progress without internet. Your session will be saved locally.',
      auth: 'Session completion requires authentication. Please sign in again.',
      server: 'Can\'t save session progress right now. Your session will be saved locally.',
    },
  },
  home: {
    screenName: 'Home',
    isCritical: true,
    recoveryTarget: 'Home',
    preserveState: false,
  },
  rewards: {
    screenName: 'Rewards',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
    errorMessages: {
      network: 'Can\'t load rewards without internet.',
      server: 'Rewards service is temporarily unavailable.',
    },
  },
  streaks: {
    screenName: 'Streaks',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
    errorMessages: {
      network: 'Can\'t load streak data without internet.',
      server: 'Streak service is temporarily unavailable.',
    },
  },
  progression: {
    screenName: 'Progression',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
    errorMessages: {
      network: 'Can\'t load progression data without internet.',
      server: 'Progression service is temporarily unavailable.',
    },
  },
  profile: {
    screenName: 'Profile',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
    errorMessages: {
      network: 'Can\'t load profile without internet.',
      auth: 'Profile requires authentication. Please sign in again.',
      server: 'Profile service is temporarily unavailable.',
    },
  },
  settings: {
    screenName: 'Settings',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
    errorMessages: {
      network: 'Can\'t save settings without internet.',
      validation: 'Invalid settings configuration.',
    },
  },
  boss: {
    screenName: 'Boss Battles',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
    errorMessages: {
      network: 'Can\'t access boss battles without internet.',
      server: 'Boss battles service is temporarily unavailable.',
    },
  },
  challenges: {
    screenName: 'Challenges',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
    errorMessages: {
      network: 'Can\'t load challenges without internet.',
      server: 'Challenges service is temporarily unavailable.',
    },
  },
  squads: {
    screenName: 'Squads',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
    errorMessages: {
      network: 'Can\'t access squads without internet.',
      auth: 'Squads require authentication. Please sign in again.',
      server: 'Squads service is temporarily unavailable.',
    },
  },
};

// ============================================================================
// Screen Error Wrapper Component
// ============================================================================
// ============================================================================
// Hook for Screen Error Handling
// ============================================================================
// ============================================================================
// Higher-Order Component for Easy Wrapping
// ============================================================================
// ============================================================================
// Screen Error Recovery Utilities
// ============================================================================
// Export singleton instance
export * from "./ScreenErrorWrapper.types";
export * from "./ScreenErrorWrapper.part1";
