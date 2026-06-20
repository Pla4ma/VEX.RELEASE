/**
 * Onboarding Repository
 *
 * Data access layer for onboarding state.
 *
 * @phase 2 - Deepening: Repository layer
 */

import { createRuntimeMMKV } from '../../../persistence/mmkv-runtime';
import {
  parseJsonWithSchema,
  stringifyJsonSafe,
} from '../../../persistence/safe-json';
import { createDebugger } from '../../../utils/debug';
import {
  OnboardingStateSchema,
  OnboardingProgressSchema,
  type OnboardingState,
  type OnboardingProgress,
} from '../schemas';

const debug = createDebugger('onboarding:repository');

const storage = createRuntimeMMKV({ id: 'onboarding-repo' });

const KEYS = {
  onboardingState: (userId: string) => `onboarding:state:${userId}`,
  onboardingBackup: (userId: string) => `onboarding:backup:${userId}`,
  onboardingProgress: (userId: string) => `onboarding:progress:${userId}`,
};

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export class OnboardingRepository {
  async getOnboardingState(userId: string): Promise<OnboardingState | null> {
    try {
      const state = this.readState(KEYS.onboardingState(userId));
      if (state) {
        return state;
      }

      const backup = this.readState(KEYS.onboardingBackup(userId));
      if (backup) {
        this.writeState(KEYS.onboardingState(userId), backup);
        return backup;
      }

      return null;
    } catch (error) {
      debug.error('Failed to get onboarding state', toError(error));
      return null;
    }
  }

  async saveOnboardingState(
    userId: string,
    state: OnboardingState,
  ): Promise<void> {
    try {
      const validated = OnboardingStateSchema.parse(state);
      this.writeState(KEYS.onboardingState(userId), validated);

      // Also save to backup
      this.writeState(KEYS.onboardingBackup(userId), validated);

      debug.info('Onboarding state saved', { userId, step: state.currentStep });
    } catch (error) {
      debug.error('Failed to save onboarding state', toError(error));
      throw new OnboardingRepositoryError('Failed to save state', {
        cause: error,
      });
    }
  }

  async clearOnboardingState(userId: string): Promise<void> {
    try {
      storage.delete(KEYS.onboardingState(userId));
      debug.info('Onboarding state cleared', { userId });
    } catch (error) {
      debug.error('Failed to clear onboarding state', toError(error));
    }
  }

  async hasOnboardingState(userId: string): Promise<boolean> {
    return storage.contains(KEYS.onboardingState(userId));
  }

  private readState(key: string): OnboardingState | null {
    const data = storage.getString(key);
    if (!data) {
      return null;
    }
    return parseJsonWithSchema(data, OnboardingStateSchema, {
      feature: 'onboarding',
      key,
    });
  }

  private writeState(key: string, state: OnboardingState): void {
    const encoded = stringifyJsonSafe(state, { feature: 'onboarding', key });
    if (encoded) {
      storage.set(key, encoded);
    }
  }

  // ============================================================================
  // Phase 3: Onboarding Progress State Machine
  // ============================================================================

  async getProgress(userId: string): Promise<OnboardingProgress | null> {
    try {
      const data = storage.getString(KEYS.onboardingProgress(userId));
      if (!data) {
        return null;
      }
      return parseJsonWithSchema(data, OnboardingProgressSchema, {
        feature: 'onboarding',
        key: KEYS.onboardingProgress(userId),
      });
    } catch (error) {
      debug.error('Failed to get onboarding progress', toError(error));
      return null;
    }
  }

  async saveProgress(
    userId: string,
    progress: OnboardingProgress,
  ): Promise<void> {
    try {
      const validated = OnboardingProgressSchema.parse(progress);
      const encoded = stringifyJsonSafe(validated, {
        feature: 'onboarding',
        key: KEYS.onboardingProgress(userId),
      });
      if (encoded) {
        storage.set(KEYS.onboardingProgress(userId), encoded);
      }
      debug.info('Onboarding progress saved', {
        userId,
        status: progress.status,
      });
    } catch (error) {
      debug.error('Failed to save onboarding progress', toError(error));
      throw new OnboardingRepositoryError('Failed to save progress', {
        cause: error,
      });
    }
  }
}

export class OnboardingRepositoryError extends Error {
  constructor(
    message: string,
    public details?: { cause?: unknown },
  ) {
    super(message);
    this.name = 'OnboardingRepositoryError';
  }
}

export const onboardingRepository = new OnboardingRepository();
export default onboardingRepository;
