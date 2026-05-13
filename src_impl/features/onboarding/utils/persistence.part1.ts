import { captureSilentFailure } from "../../../utils/silent-failure";
import { MMKV } from "react-native-mmkv";
import { z } from "zod";
import { createDebugger } from "../../../utils/debug";
import { eventBus } from "../../../events";
import type { OnboardingState, OnboardingStep, FocusGoal, FocusDuration } from "../schemas";


export function persistOnboardingState(state: OnboardingState): void {
  try {
    const persistedState: PersistedOnboardingState = {
      ...state,
      lastUpdatedAt: Date.now(),
      version: 1,
    };

    const validated = PersistedOnboardingStateSchema.parse(persistedState);
    storage.set(KEYS.ONBOARDING_STATE, JSON.stringify(validated));

    // If incomplete, also save to backup for recovery
    if (!state.isOnboarded) {
      storage.set(KEYS.INCOMPLETE_BACKUP, JSON.stringify(validated));
    }

    debug.info('Onboarding state persisted', {
      step: state.currentStep,
      isOnboarded: state.isOnboarded,
    });
  } catch (error) {
    debug.error('Failed to persist onboarding state', error instanceof Error ? error : new Error(String(error)));
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

    // Check if state is stale (over 7 days old)
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

    // Convert to OnboardingState
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
    debug.error('Failed to load onboarding state', error instanceof Error ? error : new Error(String(error)));

    // Try recovery from backup
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

  const steps: OnboardingStep[] = ['WELCOME', 'GOAL_SETTING', 'FOCUS_TIME', 'NAME_SETUP', 'FIRST_SESSION_CTA'];

  return steps[state.currentStep] || null;
}

export function recordAbandon(currentStep: number, partialData: Partial<OnboardingState>): void {
  try {
    const record: AbandonRecord = {
      step: currentStep,
      timestamp: Date.now(),
      partialData,
    };

    // Increment abandon count
    const currentCount = storage.getNumber(KEYS.ABANDON_COUNT) || 0;
    storage.set(KEYS.ABANDON_COUNT, currentCount + 1);
    storage.set(KEYS.LAST_STEP_ABANDONED, currentStep);

    // Store abandon history (keep last 5)
    const history = getAbandonHistory();
    history.unshift(record);
    storage.set('onboarding:abandon_history', JSON.stringify(history.slice(0, 5)));

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
    debug.error('Failed to record abandon', error instanceof Error ? error : new Error(String(error)));
  }
}

export function getAbandonHistory(): AbandonRecord[] {
  try {
    const data = storage.getString('onboarding:abandon_history');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    captureSilentFailure(error, { feature: 'onboarding', operation: 'safe-fallback', type: 'data' });
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

  // Multiple recent abandons
  if (count >= 3) {
    return true;
  }

  // Abandoned same step multiple times
  if (history.length >= 2) {
    const lastStep = history[0]?.step;
    const sameStepCount = history.filter((h) => h.step === lastStep).length;
    if (sameStepCount >= 2) {
      return true;
    }
  }

  return false;
}