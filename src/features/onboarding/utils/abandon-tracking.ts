import { MMKV } from "react-native-mmkv";
import { captureSilentFailure } from "../../../utils/silent-failure";
import { createDebugger } from "../../../utils/debug";
import { eventBus } from "../../../events";
import type { OnboardingState } from "../types";
import { loadPersistedOnboarding } from "./persistence";

const debug = createDebugger("onboarding:persistence");

const storage = new MMKV({
  id: "onboarding-persistence",
  encryptionKey: "onboarding-secure-storage",
});

const KEYS = {
  ABANDON_COUNT: "onboarding:abandon_count",
  LAST_STEP_ABANDONED: "onboarding:last_step_abandoned",
  COMPLETION_ATTEMPTS: "onboarding:completion_attempts",
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
    const currentCount = storage.getNumber(KEYS.ABANDON_COUNT) || 0;
    storage.set(KEYS.ABANDON_COUNT, currentCount + 1);
    storage.set(KEYS.LAST_STEP_ABANDONED, currentStep);
    const history = getAbandonHistory();
    history.unshift(record);
    storage.set(
      "onboarding:abandon_history",
      JSON.stringify(history.slice(0, 5)),
    );
    debug.info("Onboarding abandoned recorded", { step: currentStep });
    eventBus.publish("analytics:track", {
      event: "onboarding_abandoned",
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
      "Failed to record abandon",
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}

export function getAbandonHistory(): AbandonRecord[] {
  try {
    const data = storage.getString("onboarding:abandon_history");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    captureSilentFailure(error, {
      feature: "onboarding",
      operation: "safe-fallback",
      type: "data",
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
  if (count >= 3) return true;
  if (history.length >= 2) {
    const lastStep = history[0]?.step;
    const sameStepCount = history.filter((h) => h.step === lastStep).length;
    if (sameStepCount >= 2) return true;
  }
  return false;
}

export function recordCompletionAttempt(
  success: boolean,
  error?: string,
): void {
  const attempts = storage.getNumber(KEYS.COMPLETION_ATTEMPTS) || 0;
  storage.set(KEYS.COMPLETION_ATTEMPTS, attempts + 1);
  eventBus.publish("analytics:track", {
    event: "onboarding_completion_attempt",
    properties: { success, attemptNumber: attempts + 1, error: error || null },
  });
}

export function getCompletionAttempts(): number {
  return storage.getNumber(KEYS.COMPLETION_ATTEMPTS) || 0;
}

export function getPartialData(): Partial<OnboardingState> | null {
  const state = loadPersistedOnboarding();
  if (!state || state.isOnboarded) return null;
  const partial: Partial<OnboardingState> = {};
  if (state.currentStep > 1) partial.goal = state.goal;
  if (state.currentStep > 2) partial.focusDuration = state.focusDuration;
  if (state.currentStep > 3) partial.displayName = state.displayName;
  return Object.keys(partial).length > 0 ? partial : null;
}
