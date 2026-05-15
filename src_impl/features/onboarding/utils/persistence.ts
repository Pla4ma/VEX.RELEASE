import { captureSilentFailure } from '../../../utils/silent-failure';
import { MMKV } from 'react-native-mmkv';
import { z } from 'zod';
import { createDebugger } from '../../../utils/debug';
import { eventBus } from '../../../events';
import type { OnboardingState, OnboardingStep, FocusDuration } from '../types';
const debug = createDebugger('onboarding:persistence');
const storage = new MMKV({
  id: 'onboarding-persistence',
  encryptionKey: 'onboarding-secure-storage',
});
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
  ABANDON_COUNT: 'onboarding:abandon_count',
  COMPLETION_ATTEMPTS: 'onboarding:completion_attempts',
  LAST_STEP_ABANDONED: 'onboarding:last_step_abandoned',
} as const;
export function persistOnboardingState(state: OnboardingState): void {
  try {
    const persistedState: PersistedOnboardingState = {
      ...state,
      lastUpdatedAt: Date.now(),
      version: 1,
    };
    const validated = PersistedOnboardingStateSchema.parse(persistedState);
    storage.set(KEYS.ONBOARDING_STATE, JSON.stringify(validated));
    if (!state.isOnboarded) {
      storage.set(KEYS.INCOMPLETE_BACKUP, JSON.stringify(validated));
    }
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
    const data = storage.getString(KEYS.ONBOARDING_STATE);
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
  storage.delete(KEYS.ONBOARDING_STATE);
  storage.delete(KEYS.INCOMPLETE_BACKUP);
  debug.info('Onboarding state cleared');
}
export function hasIncompleteOnboarding(): boolean {
  const state = loadPersistedOnboarding();
  return state !== null && !state.isOnboarded;
}
export function getResumeStep(): OnboardingStep | null {
  const state = loadPersistedOnboarding();
  if (!state || state.isOnboarded) {
    return null;
  }
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
    const data = storage.getString(KEYS.INCOMPLETE_BACKUP);
    if (!data) {
      return null;
    }
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
    const currentCount = storage.getNumber(KEYS.ABANDON_COUNT) || 0;
    storage.set(KEYS.ABANDON_COUNT, currentCount + 1);
    storage.set(KEYS.LAST_STEP_ABANDONED, currentStep);
    const history = getAbandonHistory();
    history.unshift(record);
    storage.set(
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
    const data = storage.getString('onboarding:abandon_history');
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
  return storage.getNumber(KEYS.ABANDON_COUNT) || 0;
}
export function getLastAbandonedStep(): number | null {
  const step = storage.getNumber(KEYS.LAST_STEP_ABANDONED);
  return step === undefined || step === 0 ? null : step;
}
export function isHighAbandonRisk(): boolean {
  const count = getAbandonCount();
  const history = getAbandonHistory();
  if (count >= 3) {
    return true;
  }
  if (history.length >= 2) {
    const lastStep = history[0]?.step;
    const sameStepCount = history.filter((h) => h.step === lastStep).length;
    if (sameStepCount >= 2) {
      return true;
    }
  }
  return false;
}
export function recordCompletionAttempt(
  success: boolean,
  error?: string,
): void {
  const attempts = storage.getNumber(KEYS.COMPLETION_ATTEMPTS) || 0;
  storage.set(KEYS.COMPLETION_ATTEMPTS, attempts + 1);
  eventBus.publish('analytics:track', {
    event: 'onboarding_completion_attempt',
    properties: { success, attemptNumber: attempts + 1, error: error || null },
  });
}
export function getCompletionAttempts(): number {
  return storage.getNumber(KEYS.COMPLETION_ATTEMPTS) || 0;
}
export function getPartialData(): Partial<OnboardingState> | null {
  const state = loadPersistedOnboarding();
  if (!state || state.isOnboarded) {
    return null;
  }
  const partial: Partial<OnboardingState> = {};
  if (state.currentStep > 1) {
    partial.goal = state.goal;
  }
  if (state.currentStep > 2) {
    partial.focusDuration = state.focusDuration;
  }
  if (state.currentStep > 3) {
    partial.displayName = state.displayName;
  }
  return Object.keys(partial).length > 0 ? partial : null;
}
export const OnboardingPersistence = {
  persist: persistOnboardingState,
  load: loadPersistedOnboarding,
  clear: clearOnboardingState,
  hasIncomplete: hasIncompleteOnboarding,
  getResumeStep,
  recordAbandon,
  getAbandonCount,
  getAbandonHistory,
  getLastAbandonedStep,
  isHighAbandonRisk,
  recordCompletionAttempt,
  getCompletionAttempts,
  getPartialData,
};
export default OnboardingPersistence;
