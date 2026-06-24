import {
  createRuntimeMMKV,
  type RuntimeMMKV,
} from '../../../persistence/mmkv-runtime';
import { captureSilentFailure } from '../../../utils/silent-failure';
import { createDebugger } from '../../../utils/debug';
import { eventBus } from '../../../events/EventBus';
import type { OnboardingState } from '../types';
import { getMmkvEncryptionKeySync } from '../../../persistence/mmkv-key';
import { z } from 'zod';

const debug = createDebugger('onboarding:persistence');

let _storage: RuntimeMMKV | null = null;
function getStorage(): RuntimeMMKV {
  if (!_storage) {
    _storage = createRuntimeMMKV({ id: 'onboarding-persistence', encryptionKey: getMmkvEncryptionKeySync() });
  }
  return _storage;
}

const KEYS = {
  ABANDON_COUNT: 'onboarding:abandon_count',
  LAST_STEP_ABANDONED: 'onboarding:last_step_abandoned',
  COMPLETION_ATTEMPTS: 'onboarding:completion_attempts',
  ONBOARDING_STATE: 'onboarding:state',
} as const;

interface AbandonRecord {
  step: number;
  timestamp: number;
  partialData: Partial<OnboardingState>;
}

export function recordAbandon(
  currentStep: number,
  partialData: Partial<OnboardingState>,
): void {
  try {
    const record: AbandonRecord = {
      step: currentStep,
      timestamp: Date.now(),
      partialData,
    };
    const currentCount = getStorage().getNumber(KEYS.ABANDON_COUNT) || 0;
    getStorage().set(KEYS.ABANDON_COUNT, currentCount + 1);
    getStorage().set(KEYS.LAST_STEP_ABANDONED, currentStep);
    const history = getAbandonHistory();
    history.unshift(record);
    getStorage().set(
      'onboarding:abandon_history',
      JSON.stringify(history.slice(0, 5)),
    );
    debug.info('Onboarding abandoned recorded', { step: currentStep });
    eventBus.publish('analytics:track', {
      event: 'onboarding_abandoned',
      properties: {
        step: currentStep,
        abandonCount: currentCount + 1,
        hasGoal: !!partialData.goal,
        hasDuration: !!partialData.focusDuration,
        hasName: !!partialData.displayName,
      },
    });
  } catch (error) {
    debug.error(
      'Failed to record abandon',
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}

export function getAbandonHistory(): AbandonRecord[] {
  try {
    const data = getStorage().getString('onboarding:abandon_history');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'onboarding',
      operation: 'safe-fallback',
      type: 'data',
    });
    return [];
  }
}

export function getAbandonCount(): number {
  return getStorage().getNumber(KEYS.ABANDON_COUNT) || 0;
}

export function getLastAbandonedStep(): number | null {
  const step = getStorage().getNumber(KEYS.LAST_STEP_ABANDONED);
  return step === undefined || step === 0 ? null : step;
}

export function isHighAbandonRisk(): boolean {
  const count = getAbandonCount();
  const history = getAbandonHistory();
  if (count >= 3) {return true;}
  if (history.length >= 2) {
    const lastStep = history[0]?.step;
    const sameStepCount = history.filter((h) => h.step === lastStep).length;
    if (sameStepCount >= 2) {return true;}
  }
  return false;
}

export function recordCompletionAttempt(
  success: boolean,
  error?: string,
): void {
  const attempts = getStorage().getNumber(KEYS.COMPLETION_ATTEMPTS) || 0;
  getStorage().set(KEYS.COMPLETION_ATTEMPTS, attempts + 1);
  eventBus.publish('analytics:track', {
    event: 'onboarding_completion_attempt',
    properties: { success, attemptNumber: attempts + 1, error: error || null },
  });
}

export function getCompletionAttempts(): number {
  return getStorage().getNumber(KEYS.COMPLETION_ATTEMPTS) || 0;
}

export function getPartialData(): Partial<OnboardingState> | null {
  const state = readPersistedOnboardingState();
  if (!state || state.isOnboarded) {return null;}
  const partial: Partial<OnboardingState> = {};
  if (state.currentStep > 1) {partial.goal = state.goal;}
  if (state.currentStep > 2) {partial.focusDuration = state.focusDuration;}
  if (state.currentStep > 3) {partial.displayName = state.displayName;}
  return Object.keys(partial).length > 0 ? partial : null;
}

const StoredOnboardingStateSchema = z.object({
  isOnboarded: z.boolean(),
  currentStep: z.number(),
  goal: z.enum(['WORK', 'STUDY', 'CREATIVE', 'PERSONAL']).nullable(),
  focusDuration: z
    .union([z.literal(15), z.literal(25), z.literal(45), z.literal(60)])
    .nullable(),
  displayName: z.string().nullable(),
  startedAt: z.number().nullable(),
  completedAt: z.number().nullable(),
});

function readPersistedOnboardingState(): OnboardingState | null {
  try {
    const data = getStorage().getString(KEYS.ONBOARDING_STATE);
    if (!data) {
      return null;
    }
    return parseStoredOnboardingState(JSON.parse(data));
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'onboarding',
      operation: 'safe-fallback',
      type: 'data',
    });
    return null;
  }
}

function parseStoredOnboardingState(value: unknown): OnboardingState | null {
  const parsed = StoredOnboardingStateSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}
