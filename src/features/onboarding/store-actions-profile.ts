import type { OnboardingStore } from "./store";
import {
  type CoachPersona,
  type FocusDuration,
  type FocusGoal,
  type MotivationProfileType,
  type OnboardingElement,
  type OnboardingState,
} from "./schemas";
import {
  deriveMotivationProfile,
} from "./store-helpers";
import {
  initialState,
  advanceStepWithCompletionCheck,
} from "./store-action-types";

type SetFn = (partial: Partial<OnboardingStore>) => void;
type GetFn = () => OnboardingStore;

export function createProfileActions(
  set: SetFn,
  get: GetFn,
): Pick<
  OnboardingStore,
  | "startOnboarding"
  | "setGoal"
  | "setFocusDuration"
  | "setDisplayName"
  | "setPersona"
  | "setElement"
  | "setExplicitMotivationStyle"
  | "recomputeMotivationProfile"
> {
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
      const profile = deriveMotivationProfile(
        goal,
        store.persona,
        store.element,
        store.explicitMotivationStyle,
      );
      set({ goal, motivationProfile: profile });
      setTimeout(() => {
        advanceStepWithCompletionCheck(
          set,
          get,
          Math.min(5, get().currentStep + 1),
        );
      }, 300);
    },

    setFocusDuration: (focusDuration: FocusDuration) => {
      set({ focusDuration });
      setTimeout(() => {
        advanceStepWithCompletionCheck(
          set,
          get,
          Math.min(5, get().currentStep + 1),
        );
      }, 300);
    },

    setDisplayName: (name: string) => {
      const trimmed = name.trim();
      if (trimmed.length >= 2) set({ displayName: trimmed });
    },

    setPersona: (persona: CoachPersona) => {
      const store = get();
      const profile = deriveMotivationProfile(
        store.goal,
        persona,
        store.element,
        store.explicitMotivationStyle,
      );
      set({ persona, motivationProfile: profile });
    },

    setElement: (element: OnboardingElement) => {
      const store = get();
      const profile = deriveMotivationProfile(
        store.goal,
        store.persona,
        element,
        store.explicitMotivationStyle,
      );
      set({ element, motivationProfile: profile });
    },

    setExplicitMotivationStyle: (style: MotivationProfileType) => {
      const store = get();
      const profile = deriveMotivationProfile(
        store.goal,
        store.persona,
        store.element,
        style,
      );
      set({ explicitMotivationStyle: style, motivationProfile: profile });
    },

    recomputeMotivationProfile: () => {
      const { goal, persona, element, explicitMotivationStyle } = get();
      set({
        motivationProfile: deriveMotivationProfile(
          goal,
          persona,
          element,
          explicitMotivationStyle,
        ),
      });
    },
  };
}
