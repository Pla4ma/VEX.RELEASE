import type { ScreenType, ScreenErrorRecoveryOptions } from './screen-error-types';
import { SCREEN_ERROR_CONFIGS } from './screen-error-configs';

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
  async attemptRecovery(
    screenType: ScreenType,
    error: Error,
    options: ScreenErrorRecoveryOptions = {},
  ): Promise<boolean> {
    const { autoRecover = false, recoveryDelay = 1000, onRecovery } = options;
    const _config = SCREEN_ERROR_CONFIGS[screenType];
    const attempts = this.recoveryAttempts.get(screenType) || 0;
    if (
      error.message.includes('client') ||
      error.message.includes('reference')
    ) {
      return false;
    }
    if (attempts >= 3) {
      return false;
    }
    this.recoveryAttempts.set(screenType, attempts + 1);
    if (onRecovery) {
      onRecovery(screenType, error);
    }
    if (autoRecover) {
      await new Promise((resolve) => setTimeout(resolve, recoveryDelay));
    }
    return true;
  }
  resetRecoveryAttempts(screenType: ScreenType): void {
    this.recoveryAttempts.delete(screenType);
  }
  getRecoveryAttempts(screenType: ScreenType): number {
    return this.recoveryAttempts.get(screenType) || 0;
  }
  clearAllRecoveryAttempts(): void {
    this.recoveryAttempts.clear();
  }
}

export const screenErrorRecovery = ScreenErrorRecovery.getInstance();
