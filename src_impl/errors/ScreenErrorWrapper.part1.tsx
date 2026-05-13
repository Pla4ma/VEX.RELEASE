import React from "react";
import { ScreenErrorBoundary } from "../shared/ui/components/ScreenErrorBoundary";


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

export function useScreenError(screenType: ScreenType) {
  const config = SCREEN_ERROR_CONFIGS[screenType];

  return {
    screenConfig: config,
    isCritical: config.isCritical,
    recoveryTarget: config.recoveryTarget,
    screenName: config.screenName,
  };
}

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

export const screenErrorRecovery = ScreenErrorRecovery.getInstance();