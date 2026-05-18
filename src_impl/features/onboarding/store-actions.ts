import type { OnboardingStore } from './store';
import {
  type CoachPersona,
  type FocusDuration,
  type FocusGoal,
  type MotivationProfileType,
  type OnboardingElement,
  type OnboardingState,
} from './schemas';
import {
  deriveMotivationProfile,
  mergeOnboardingCompletion,
  isCompletionValidForUser,
  type OnboardingDraft,
} from './store-helpers';

const initialState: OnboardingState = {
  isOnboarded: false, currentStep: 0, goal: null, focusDuration: null,
  displayName: null, startedAt: null, completedAt: null,
  completedForUserId: null, persona: null, element: null,
  motivationProfile: null, explicitMotivationStyle: null,
};

export function createStoreActions(
  set: (partial: Partial<OnboardingStore>) => void,
  get: () => OnboardingStore,
): Omit<OnboardingStore, keyof OnboardingState> {
  return {
    startOnboarding: () => {
      set({
        ...initialState,
        startedAt: Date.now(),
        motivationProfile: deriveMotivationProfile(null, null, null, null),
      });
    },

    setGoal: (goal: FocusGoal) => {
      const store = get();
      const profile = deriveMotivationProfile(goal, store.persona, store.element, store.explicitMotivationStyle);
      set({ goal, motivationProfile: profile });
      setTimeout(() => {
        set({ currentStep: Math.min(5, get().currentStep + 1) });
      }, 300);
    },

    setFocusDuration: (focusDuration: FocusDuration) => {
      set({ focusDuration });
      setTimeout(() => {
        set({ currentStep: Math.min(5, get().currentStep + 1) });
      }, 300);
    },

    setDisplayName: (name: string) => {
      const trimmed = name.trim();
      if (trimmed.length >= 2) set({ displayName: trimmed });
    },

    setPersona: (persona: CoachPersona) => {
      const store = get();
      const profile = deriveMotivationProfile(store.goal, persona, store.element, store.explicitMotivationStyle);
      set({ persona, motivationProfile: profile });
    },

    setElement: (element: OnboardingElement) => {
      const store = get();
      const profile = deriveMotivationProfile(store.goal, store.persona, element, store.explicitMotivationStyle);
      set({ element, motivationProfile: profile });
    },

    setExplicitMotivationStyle: (style: MotivationProfileType) => {
      const store = get();
      const profile = deriveMotivationProfile(store.goal, store.persona, store.element, style);
      set({ explicitMotivationStyle: style, motivationProfile: profile });
    },

    recomputeMotivationProfile: () => {
      const { goal, persona, element, explicitMotivationStyle } = get();
      set({ motivationProfile: deriveMotivationProfile(goal, persona, element, explicitMotivationStyle) });
    },

    nextStep: () => {
      const { currentStep } = get();
      if (currentStep < 5) set({ currentStep: currentStep + 1 });
    },

    previousStep: () => {
      const { currentStep } = get();
      if (currentStep > 0) set({ currentStep: currentStep - 1 });
    },

    skipOnboarding: () => set({ ...mergeOnboardingCompletion(true, Date.now()) }),

    completeOnboarding: () => set({ ...mergeOnboardingCompletion(true, Date.now()) }),

    resetOnboarding: () => set(initialState),

    canSkipCurrentStep: () => get().currentStep >= 1,

    canCompleteForUser: (userId: string | null | undefined) => isCompletionValidForUser(get(), userId),

    setCompletionFromBackend: (userId: string, completedAt: number) => {
      set({ completedAt, completedForUserId: userId, isOnboarded: true });
    },

    getDraft: (_userId: string) => {
      const state = get();
      return {
        goal: state.goal ?? undefined,
        focusDuration: state.focusDuration ?? undefined,
        displayName: state.displayName ?? undefined,
        starterPresetId: undefined,
        element: state.element ?? undefined,
        personaId: state.persona ?? undefined,
        squadId: null,
      };
    },

    saveDraft: (_userId: string, draft: OnboardingDraft) => {
      const updates: Partial<OnboardingState> = {};
      const store = get();
      if (draft.goal) {
        updates.goal = draft.goal;
        updates.motivationProfile = deriveMotivationProfile(
          draft.goal, draft.personaId ?? store.persona,
          draft.element ?? store.element, store.explicitMotivationStyle,
        );
      }
      if (draft.focusDuration) updates.focusDuration = draft.focusDuration;
      if (draft.displayName) updates.displayName = draft.displayName;
      if (draft.personaId) {
        updates.persona = draft.personaId;
        updates.motivationProfile = deriveMotivationProfile(
          updates.goal ?? store.goal, draft.personaId,
          draft.element ?? store.element, store.explicitMotivationStyle,
        );
      }
      if (draft.element) {
        updates.element = draft.element;
        updates.motivationProfile = deriveMotivationProfile(
          updates.goal ?? store.goal, updates.persona ?? store.persona,
          draft.element, store.explicitMotivationStyle,
        );
      }
      if (Object.keys(updates).length > 0) set(updates);
    },
  };
}
