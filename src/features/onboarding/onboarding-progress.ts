import type {
  OnboardingState,
  UnlockedFeature,
  FeatureUnlockGate,
  StepContent,
  OnboardingProgress,
} from "./onboarding-types";
import {
  FEATURE_UNLOCK_GATES,
  STEP_CONTENT,
  STEP_ORDER,
} from "./onboarding-gates";
import { getOnboardingState } from "./onboarding-state";

export function markFeatureIntroduced(userId: string, featureId: string): void {
  const state = getOnboardingState(userId);
  if (!state) return;
  const feature = state.unlockedFeatures.find((f) => f.featureId === featureId);
  if (feature) feature.introduced = true;
}

export function getStepContent(state: OnboardingState): StepContent {
  const content = STEP_CONTENT[state.currentStep];
  if (
    state.currentStep === "FEATURE_UNLOCK" &&
    state.unlockedFeatures.length > 0
  ) {
    const latest = state.unlockedFeatures[state.unlockedFeatures.length - 1]!;
    const gate = FEATURE_UNLOCK_GATES.find(
      (g) => g.featureId === latest.featureId,
    );
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

export function getOnboardingProgress(
  userId: string,
): OnboardingProgress | null {
  const state = getOnboardingState(userId);
  if (!state) return null;
  const currentIndex = STEP_ORDER.indexOf(state.currentStep);
  const totalSteps = STEP_ORDER.length;
  let sessionsToNext: number | null = null;
  let nextFeature: string | null = null;
  if (state.nextFeatureUnlock) {
    sessionsToNext =
      state.nextFeatureUnlock.requiresSessions - state.sessionsCompleted;
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
  const state = getOnboardingState(userId);
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
  const state = getOnboardingState(userId);
  if (!state) return defaultAvailable;
  return state.unlockedFeatures.some((f) => f.featureId === featureId);
}

export function getAvailableFeatures(userId: string): UnlockedFeature[] {
  const state = getOnboardingState(userId);
  if (!state) return [];
  return state.unlockedFeatures;
}

export function getNextFeatureUnlock(userId: string): FeatureUnlockGate | null {
  const state = getOnboardingState(userId);
  if (!state) return FEATURE_UNLOCK_GATES[0] ?? null;
  return state.nextFeatureUnlock;
}
