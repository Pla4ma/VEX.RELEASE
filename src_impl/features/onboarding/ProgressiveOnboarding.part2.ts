import { eventBus } from "../../events";


export function getStepContent(state: OnboardingState): StepContent {
  const content = STEP_CONTENT[state.currentStep];

  // Customize FEATURE_UNLOCK content
  if (state.currentStep === 'FEATURE_UNLOCK' && state.unlockedFeatures.length > 0) {
    const latest = state.unlockedFeatures[state.unlockedFeatures.length - 1];
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
  if (!state) {
    return null;
  }

  const stepOrder: OnboardingStep[] = ['WELCOME', 'QUICK_START', 'FIRST_SESSION', 'POST_SESSION', 'HOME_INTRO', 'FEATURE_UNLOCK', 'COMPLETE'];

  const currentIndex = stepOrder.indexOf(state.currentStep);
  const totalSteps = stepOrder.length;

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
  if (!state) {
    return true;
  } // New user

  // Show if not complete
  if (state.completedAt) {
    return false;
  }

  // Show if has new feature to introduce
  const unintroduced = state.unlockedFeatures.filter((f) => !f.introduced);
  if (unintroduced.length > 0) {
    state.currentStep = 'FEATURE_UNLOCK';
    return true;
  }

  return true;
}

export function isFeatureAvailable(userId: string, featureId: string, defaultAvailable: boolean = false): boolean {
  const state = onboardingStates.get(userId);
  if (!state) {
    return defaultAvailable;
  }

  // Check if unlocked
  return state.unlockedFeatures.some((f) => f.featureId === featureId);
}

export function getAvailableFeatures(userId: string): UnlockedFeature[] {
  const state = onboardingStates.get(userId);
  if (!state) {
    return [];
  }
  return state.unlockedFeatures;
}

export function getNextFeatureUnlock(userId: string): FeatureUnlockGate | null {
  const state = onboardingStates.get(userId);
  if (!state) {
    return FEATURE_UNLOCK_GATES[0];
  }
  return state.nextFeatureUnlock;
}