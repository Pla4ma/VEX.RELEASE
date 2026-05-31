import { MMKV } from 'react-native-mmkv';
import { z } from 'zod';
import { createDebugger } from '../../../utils/debug';
import { eventBus } from '../../../events';
import type { OnboardingState, OnboardingStep, FocusDuration } from '../types';
import {
  recordAbandon as recordAbandonFn,
  getAbandonCount as getAbandonCountFn,
  getAbandonHistory as getAbandonHistoryFn,
  getLastAbandonedStep as getLastAbandonedStepFn,
  isHighAbandonRisk as isHighAbandonRiskFn,
  recordCompletionAttempt as recordCompletionAttemptFn,
  getCompletionAttempts as getCompletionAttemptsFn,
  getPartialData as getPartialDataFn,
} from './abandon-tracking';
import { getMmkvEncryptionKeySync } from '../../../persistence/mmkv-key';

const debug = createDebugger('onboarding:persistence');

let _storage: MMKV | null = null;
function getStorage(): MMKV {
  if (!_storage) {
    _storage = new MMKV({ id: 'onboarding-persistence', encryptionKey: getMmkvEncryptionKeySync() });
  }
  return _storage;
}

const PersistedOnboardingStateSchema = z.object({
  isOnboarded: z.boolean(),
  currentStep: z.number().min(0).max(4),
  goal: z.enum(['WORK', 'STUDY', 'CREATIVE', 'PERSONAL']).nullable(),
  focusDuration: z
    .number()
    .refine((val): val is FocusDuration => [15, 25, 45, 60].includes(val))
    .nullable(),
  displayName: z.string().min(2).max(30).nullable(),
  startedAt: z.number().nullable(),
  completedAt: z.number().nullable(),
  lastUpdatedAt: z.number(),
  version: z.number().default(1),
});

type PersistedOnboardingState = z.infer<typeof PersistedOnboardingStateSchema>;

const KEYS = {
  ONBOARDING_STATE: 'onboarding:state',
  INCOMPLETE_BACKUP: 'onboarding:incomplete_backup',
} as const;

export function persistOnboardingState(state: OnboardingState): void {
  try {
    const persistedState: PersistedOnboardingState = {
      ...state,
      lastUpdatedAt: Date.now(),
      version: 1,
    };
    const validated = PersistedOnboardingStateSchema.parse(persistedState);
    getStorage().set(KEYS.ONBOARDING_STATE, JSON.stringify(validated));
    if (!state.isOnboarded)
      {getStorage().set(KEYS.INCOMPLETE_BACKUP, JSON.stringify(validated));}
    debug.info('Onboarding state persisted', {
      step: state.currentStep,
      isOnboarded: state.isOnboarded,
    });
  } catch (error) {
    debug.error(
      'Failed to persist onboarding state',
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}

export function loadPersistedOnboarding(): OnboardingState | null {
  try {
    const data = getStorage().getString(KEYS.ONBOARDING_STATE);
    if (!data) {
      debug.info('No persisted onboarding state found');
      return null;
    }
    const parsed = JSON.parse(data);
    const validated = PersistedOnboardingStateSchema.parse(parsed);
    const age = Date.now() - validated.lastUpdatedAt;
    const isStale = age > 7 * 24 * 60 * 60 * 1000;
    if (isStale && !validated.isOnboarded) {
      debug.warn('Stale incomplete onboarding found, resetting', { age });
      eventBus.publish('analytics:track', {
        event: 'onboarding_stale_reset',
        properties: { age, step: validated.currentStep },
      });
      return null;
    }
    const state: OnboardingState = {
      isOnboarded: validated.isOnboarded,
      currentStep: validated.currentStep,
      goal: validated.goal,
      focusDuration: validated.focusDuration,
      displayName: validated.displayName,
      startedAt: validated.startedAt,
      completedAt: validated.completedAt,
    };
    debug.info('Onboarding state loaded', { step: state.currentStep });
    return state;
  } catch (error) {
    debug.error(
      'Failed to load onboarding state',
      error instanceof Error ? error : new Error(String(error)),
    );
    return recoverFromBackup();
  }
}

export function clearOnboardingState(): void {
  getStorage().delete(KEYS.ONBOARDING_STATE);
  getStorage().delete(KEYS.INCOMPLETE_BACKUP);
  debug.info('Onboarding state cleared');
}

export function hasIncompleteOnboarding(): boolean {
  const state = loadPersistedOnboarding();
  return state !== null && !state.isOnboarded;
}

export function getResumeStep(): OnboardingStep | null {
  const state = loadPersistedOnboarding();
  if (!state || state.isOnboarded) {return null;}
  const steps: OnboardingStep[] = [
    'WELCOME',
    'GOAL_SETTING',
    'FOCUS_TIME',
    'NAME_SETUP',
    'FIRST_SESSION_CTA',
  ];
  return steps[state.currentStep] || null;
}

function recoverFromBackup(): OnboardingState | null {
  try {
    const data = getStorage().getString(KEYS.INCOMPLETE_BACKUP);
    if (!data) {return null;}
    const parsed = JSON.parse(data);
    const validated = PersistedOnboardingStateSchema.parse(parsed);
    const state: OnboardingState = {
      isOnboarded: validated.isOnboarded,
      currentStep: validated.currentStep,
      goal: validated.goal,
      focusDuration: validated.focusDuration,
      displayName: validated.displayName,
      startedAt: validated.startedAt,
      completedAt: validated.completedAt,
    };
    debug.info('Onboarding state recovered from backup', {
      step: state.currentStep,
    });
    eventBus.publish('analytics:track', {
      event: 'onboarding_recovered_from_backup',
      properties: { step: state.currentStep },
    });
    return state;
  } catch (error) {
    debug.error(
      'Failed to recover from backup',
      error instanceof Error ? error : new Error(String(error)),
    );
    return null;
  }
}

export {
  recordAbandonFn as recordAbandon,
  getAbandonCountFn as getAbandonCount,
  getAbandonHistoryFn as getAbandonHistory,
  getLastAbandonedStepFn as getLastAbandonedStep,
  isHighAbandonRiskFn as isHighAbandonRisk,
  recordCompletionAttemptFn as recordCompletionAttempt,
  getCompletionAttemptsFn as getCompletionAttempts,
  getPartialDataFn as getPartialData,
};

export const OnboardingPersistence = {
  persist: persistOnboardingState,
  load: loadPersistedOnboarding,
  clear: clearOnboardingState,
  hasIncomplete: hasIncompleteOnboarding,
  getResumeStep,
  recordAbandon: recordAbandonFn,
  getAbandonCount: getAbandonCountFn,
  getAbandonHistory: getAbandonHistoryFn,
  getLastAbandonedStep: getLastAbandonedStepFn,
  isHighAbandonRisk: isHighAbandonRiskFn,
  recordCompletionAttempt: recordCompletionAttemptFn,
  getCompletionAttempts: getCompletionAttemptsFn,
  getPartialData: getPartialDataFn,
};

export default OnboardingPersistence;
