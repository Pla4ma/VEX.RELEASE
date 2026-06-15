import { eventBus } from '../../events/EventBus';
import type { OnboardingState, UnlockedFeature } from './onboarding-types';
import { FEATURE_UNLOCK_GATES, STEP_ORDER } from './onboarding-gates';

const onboardingStates = new Map<string, OnboardingState>();
const recordedSessionIds = new Map<string, Set<string>>();

export function initializeOnboarding(userId: string): OnboardingState {
  const state: OnboardingState = {
    userId,
    currentStep: 'WELCOME',
    sessionsCompleted: 0,
    firstSessionAt: null,
    skippedCustomization: false,
    completedAt: null,
    unlockedFeatures: [],
    nextFeatureUnlock: FEATURE_UNLOCK_GATES[0] ?? null,
    preferences: { focusDuration: 15, notificationsEnabled: true },
  };
  onboardingStates.set(userId, state);
  eventBus.publish('onboarding:started', { userId });
  return state;
}

export function getOnboardingState(userId: string): OnboardingState | null {
  return onboardingStates.get(userId) || null;
}

export function advanceStep(userId: string): OnboardingState | null {
  const state = onboardingStates.get(userId);
  if (!state) {return null;}
  const currentIndex = STEP_ORDER.indexOf(state.currentStep);
  if (currentIndex < STEP_ORDER.length - 1) {
    state.currentStep = STEP_ORDER[currentIndex + 1]!;
  }
  if (state.currentStep === 'COMPLETE') {
    state.completedAt = Date.now();
    eventBus.publish('onboarding:completed', { userId });
  } else {
    eventBus.publish('onboarding:step_changed', {
      userId,
      step: state.currentStep,
    });
  }
  return state;
}

export function skipToFirstSession(userId: string): OnboardingState | null {
  const state = onboardingStates.get(userId);
  if (!state) {return null;}
  state.skippedCustomization = true;
  state.currentStep = 'FIRST_SESSION';
  eventBus.publish('onboarding:skipped', {
    userId,
    step: 'CUSTOMIZATION',
    timestamp: Date.now(),
  });
  return state;
}

export function recordSession(
  userId: string,
  durationMinutes: number,
  idempotencyKey?: string,
): OnboardingState | null {
  const state = onboardingStates.get(userId);
  if (!state) {return null;}

  if (idempotencyKey) {
    let keys = recordedSessionIds.get(userId);
    if (!keys) {
      keys = new Set();
      recordedSessionIds.set(userId, keys);
    }
    if (keys.has(idempotencyKey)) {
      return state;
    }
    keys.add(idempotencyKey);
  }

  state.sessionsCompleted += 1;
  if (!state.firstSessionAt) {
    state.firstSessionAt = Date.now();
    state.currentStep = 'POST_SESSION';
    eventBus.publish('onboarding:first_session_complete', {
      userId,
      durationMinutes,
    });
  }
  checkFeatureUnlocks(state);
  return state;
}

function checkFeatureUnlocks(state: OnboardingState): void {
  for (const gate of FEATURE_UNLOCK_GATES) {
    if (state.unlockedFeatures.some((f) => f.featureId === gate.featureId))
      {continue;}
    if (state.sessionsCompleted >= gate.requiresSessions) {
      const unlocked: UnlockedFeature = {
        featureId: gate.featureId,
        featureName: gate.featureName,
        unlockedAt: Date.now(),
        introduced: false,
      };
      state.unlockedFeatures.push(unlocked);
      const nextIndex =
        FEATURE_UNLOCK_GATES.findIndex((g) => g.featureId === gate.featureId) +
        1;
      state.nextFeatureUnlock =
        nextIndex < FEATURE_UNLOCK_GATES.length
          ? (FEATURE_UNLOCK_GATES[nextIndex] ?? null)
          : null;
      eventBus.publish('onboarding:feature_unlocked', {
        userId: state.userId,
        feature: gate.featureId,
        featureId: gate.featureId,
        timestamp: Date.now(),
      });
    }
  }
}
