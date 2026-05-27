import { eventBus } from "../../events";
import type {
  OnboardingStep,
  OnboardingState,
  UserPreferences,
  UnlockedFeature,
  FeatureUnlockGate,
  StepContent,
  OnboardingProgress,
} from "./onboarding-types";
import { FEATURE_UNLOCK_GATES, STEP_CONTENT, STEP_ORDER } from "./onboarding-gates";

// Re-export all types and constants for backward compatibility
export type {
  OnboardingStep,
  OnboardingState,
  UserPreferences,
  UnlockedFeature,
  FeatureUnlockGate,
  StepContent,
  OnboardingProgress,
};
export { FEATURE_UNLOCK_GATES, STEP_CONTENT, STEP_ORDER };

const onboardingStates = new Map<string, OnboardingState>();

export function initializeOnboarding(userId: string): OnboardingState {
  const state: OnboardingState = {
    userId,
    currentStep: "WELCOME",
    sessionsCompleted: 0,
    firstSessionAt: null,
    skippedCustomization: false,
    completedAt: null,
    unlockedFeatures: [],
    nextFeatureUnlock: FEATURE_UNLOCK_GATES[0] ?? null,
    preferences: { focusDuration: 15, notificationsEnabled: true },
  };
  onboardingStates.set(userId, state);
  eventBus.publish("onboarding:started", { userId });
  return state;
}

export function getOnboardingState(userId: string): OnboardingState | null {
  return onboardingStates.get(userId) || null;
}

export function advanceStep(userId: string): OnboardingState | null {
  const state = onboardingStates.get(userId);
  if (!state) return null;
  const currentIndex = STEP_ORDER.indexOf(state.currentStep);
  if (currentIndex < STEP_ORDER.length - 1) {
    state.currentStep = STEP_ORDER[currentIndex + 1]!;
  }
  if (state.currentStep === "COMPLETE") {
    state.completedAt = Date.now();
    eventBus.publish("onboarding:completed", { userId });
  } else {
    eventBus.publish("onboarding:step_changed", { userId, step: state.currentStep });
  }
  return state;
}

export function skipToFirstSession(userId: string): OnboardingState | null {
  const state = onboardingStates.get(userId);
  if (!state) return null;
  state.skippedCustomization = true;
  state.currentStep = "FIRST_SESSION";
  eventBus.publish("onboarding:skipped", { userId, step: "CUSTOMIZATION", timestamp: Date.now() });
  return state;
}

export function recordSession(
  userId: string,
  durationMinutes: number,
): OnboardingState | null {
  const state = onboardingStates.get(userId);
  if (!state) return null;
  state.sessionsCompleted += 1;
  if (!state.firstSessionAt) {
    state.firstSessionAt = Date.now();
    state.currentStep = "POST_SESSION";
    eventBus.publish("onboarding:first_session_complete", { userId, durationMinutes });
  }
  checkFeatureUnlocks(state);
  return state;
}

function checkFeatureUnlocks(state: OnboardingState): void {
  for (const gate of FEATURE_UNLOCK_GATES) {
    if (state.unlockedFeatures.some((f) => f.featureId === gate.featureId)) continue;
    if (state.sessionsCompleted >= gate.requiresSessions) {
      const unlocked: UnlockedFeature = {
        featureId: gate.featureId,
        featureName: gate.featureName,
        unlockedAt: Date.now(),
        introduced: false,
      };
      state.unlockedFeatures.push(unlocked);
      const nextIndex = FEATURE_UNLOCK_GATES.findIndex((g) => g.featureId === gate.featureId) + 1;
      state.nextFeatureUnlock =
        nextIndex < FEATURE_UNLOCK_GATES.length ? (FEATURE_UNLOCK_GATES[nextIndex] ?? null) : null;
      eventBus.publish("onboarding:feature_unlocked", {
        userId: state.userId,
        feature: gate.featureId,
        featureId: gate.featureId,
        timestamp: Date.now(),
      });
    }
  }
}

export function markFeatureIntroduced(userId: string, featureId: string): void {
  const state = onboardingStates.get(userId);
  if (!state) return;
  const feature = state.unlockedFeatures.find((f) => f.featureId === featureId);
  if (feature) feature.introduced = true;
}

export function getStepContent(state: OnboardingState): StepContent {
  const content = STEP_CONTENT[state.currentStep];
  if (state.currentStep === "FEATURE_UNLOCK" && state.unlockedFeatures.length > 0) {
    const latest = state.unlockedFeatures[state.unlockedFeatures.length - 1]!;
    const gate = FEATURE_UNLOCK_GATES.find((g) => g.featureId === latest.featureId);
    if (gate) {
      return {
        ...content,
        title: `${gate.icon} ${gate.featureName} Unlocked!`,
        subtitle: gate.description,
      };
    }
  }
  return content;
}

export function getOnboardingProgress(userId: string): OnboardingProgress | null {
  const state = onboardingStates.get(userId);
  if (!state) return null;
  const currentIndex = STEP_ORDER.indexOf(state.currentStep);
  const totalSteps = STEP_ORDER.length;
  let sessionsToNext: number | null = null;
  let nextFeature: string | null = null;
  if (state.nextFeatureUnlock) {
    sessionsToNext = state.nextFeatureUnlock.requiresSessions - state.sessionsCompleted;
    nextFeature = state.nextFeatureUnlock.featureName;
  }
  return {
    stepNumber: currentIndex + 1,
    totalSteps,
    percentComplete: Math.round(((currentIndex + 1) / totalSteps) * 100),
    currentStep: state.currentStep,
    sessionsToNextFeature: sessionsToNext,
    nextFeatureName: nextFeature,
  };
}

export function shouldShowOnboarding(userId: string): boolean {
  const state = onboardingStates.get(userId);
  if (!state) return true;
  if (state.completedAt) return false;
  const unintroduced = state.unlockedFeatures.filter((f) => !f.introduced);
  if (unintroduced.length > 0) {
    state.currentStep = "FEATURE_UNLOCK";
    return true;
  }
  return true;
}

export function isFeatureAvailable(
  userId: string,
  featureId: string,
  defaultAvailable: boolean = false,
): boolean {
  const state = onboardingStates.get(userId);
  if (!state) return defaultAvailable;
  return state.unlockedFeatures.some((f) => f.featureId === featureId);
}

export function getAvailableFeatures(userId: string): UnlockedFeature[] {
  const state = onboardingStates.get(userId);
  if (!state) return [];
  return state.unlockedFeatures;
}

export function getNextFeatureUnlock(userId: string): FeatureUnlockGate | null {
  const state = onboardingStates.get(userId);
  if (!state) return FEATURE_UNLOCK_GATES[0] ?? null;
  return state.nextFeatureUnlock;
}
