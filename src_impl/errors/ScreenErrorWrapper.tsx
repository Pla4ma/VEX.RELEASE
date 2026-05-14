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

export interface ScreenErrorConfig {
  screenName: string;
  isCritical: boolean;
  errorMessages?: Partial<Record<string, string>>;
  recoveryTarget?: string;
  preserveState?: boolean;
  fallback?: React.ReactNode;
}

// ============================================================================
// Screen Type Definitions
// ============================================================================

export type ScreenType = 
  | 'session'
  | 'session-complete'
  | 'home'
  | 'rewards'
  | 'streaks'
  | 'progression'
  | 'profile'
  | 'settings'
  | 'boss'
  | 'challenges'
  | 'squads';

export interface ScreenErrorWrapperProps {
  children: React.ReactNode;
  screenType: ScreenType;
  customConfig?: Partial<ScreenErrorConfig>;
}

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

export function ScreenErrorWrapper({
  children,
  screenType,
  customConfig,
}: ScreenErrorWrapperProps): React.ReactElement {
  const baseConfig = SCREEN_ERROR_CONFIGS[screenType];
  const finalConfig = { ...baseConfig, ...customConfig };

  return (
    <ScreenErrorBoundary
      screenName={finalConfig.screenName}
      fallback={finalConfig.fallback}
      featureTag={`screen-${screenType}`}
    >
      {children}
    </ScreenErrorBoundary>
  );
}

// ============================================================================
// Hook for Screen Error Handling
// ============================================================================

export function useScreenError(screenType: ScreenType) {
  const config = SCREEN_ERROR_CONFIGS[screenType];

  return {
    screenConfig: config,
    isCritical: config.isCritical,
    recoveryTarget: config.recoveryTarget,
    screenName: config.screenName,
  };
}

// ============================================================================
// Higher-Order Component for Easy Wrapping
// ============================================================================

export function withScreenErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenType: ScreenType,
  customConfig?: Partial<ScreenErrorConfig>
) {
  const WithErrorBoundary = (props: P) => (
    <ScreenErrorWrapper screenType={screenType} customConfig={customConfig}>
      <WrappedComponent {...props} />
    </ScreenErrorWrapper>
  );

  WithErrorBoundary.displayName = `withScreenErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithErrorBoundary;
}

// ============================================================================
// Screen Error Recovery Utilities
// ============================================================================

export interface ScreenErrorRecoveryOptions {
  /** Whether to attempt automatic recovery */
  autoRecover?: boolean;
  /** Recovery delay in milliseconds */
  recoveryDelay?: number;
  /** Custom recovery handler */
  onRecovery?: (screenType: ScreenType, error: Error) => void;
}

export class ScreenErrorRecovery {
  private static instance: ScreenErrorRecovery;
  private recoveryAttempts = new Map<ScreenType, number>();

  private constructor() {}

  static getInstance(): ScreenErrorRecovery {
    if (!ScreenErrorRecovery.instance) {
      ScreenErrorRecovery.instance = new ScreenErrorRecovery();
    }
    return ScreenErrorRecovery.instance;
  }

  /**
   * Attempt to recover from a screen error
   */
  async attemptRecovery(
    screenType: ScreenType,
    error: Error,
    options: ScreenErrorRecoveryOptions = {}
  ): Promise<boolean> {
    const {
      autoRecover = false,
      recoveryDelay = 1000,
      onRecovery,
    } = options;

    const config = SCREEN_ERROR_CONFIGS[screenType];
    const attempts = this.recoveryAttempts.get(screenType) || 0;

    // Don't attempt recovery for client errors
    if (error.message.includes('client') || error.message.includes('reference')) {
      return false;
    }

    // Don't attempt too many recoveries
    if (attempts >= 3) {
      return false;
    }

    this.recoveryAttempts.set(screenType, attempts + 1);

    // Call custom recovery handler
    if (onRecovery) {
      onRecovery(screenType, error);
    }

    if (autoRecover) {
      // Wait before attempting recovery
      await new Promise(resolve => setTimeout(resolve, recoveryDelay));
    }

    return true;
  }

  /**
   * Reset recovery attempts for a screen
   */
  resetRecoveryAttempts(screenType: ScreenType): void {
    this.recoveryAttempts.delete(screenType);
  }

  /**
   * Get recovery attempt count for a screen
   */
  getRecoveryAttempts(screenType: ScreenType): number {
    return this.recoveryAttempts.get(screenType) || 0;
  }

  /**
   * Clear all recovery attempts
   */
  clearAllRecoveryAttempts(): void {
    this.recoveryAttempts.clear();
  }
}

// Export singleton instance
export const screenErrorRecovery = ScreenErrorRecovery.getInstance();