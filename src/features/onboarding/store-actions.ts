import type { OnboardingStore } from './store';
import {
  type CoachPersona,
  type FocusDuration,
  type FocusGoal,
  type MotivationProfileType,
  type OnboardingElement,
  type OnboardingState,
} from './schemas';
import { LaneSchema } from '../lane-engine/schemas';
import {
  deriveMotivationProfile,
  mergeOnboardingCompletion,
  isCompletionValidForUser,
  type OnboardingDraft,
} from './store-helpers';
import { useAuthStore } from '../../store';

const initialState: OnboardingState = {
  isOnboarded: false, currentStep: 0, goal: null, focusDuration: null,
  displayName: null, startedAt: null, completedAt: null,
  completedForUserId: null, persona: null, element: null,
  motivationProfile: null, explicitMotivationStyle: null,
  profileStepsCompleted: false, firstSessionStarted: false,
  firstSessionCompleted: false, homePreviewEntered: false,
  chosenLane: null,
};

function getCurrentUserIdForBool(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

/** Mark profile steps as complete when advancing to or past step 5 (FIRST_SESSION_CTA). */
function advanceStepWithCompletionCheck(
  set: (partial: Partial<OnboardingStore>) => void,
  get: () => OnboardingStore,
  targetStep: number,
): void {
  const updates: Partial<OnboardingState> = { currentStep: targetStep };
  if (targetStep >= 5) {
    updates.profileStepsCompleted = true;
  }
  set(updates);
}

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
        advanceStepWithCompletionCheck(set, get, Math.min(5, get().currentStep + 1));
      }, 300);
    },

    setFocusDuration: (focusDuration: FocusDuration) => {
      set({ focusDuration });
      setTimeout(() => {
        advanceStepWithCompletionCheck(set, get, Math.min(5, get().currentStep + 1));
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
      if (currentStep < 5) {
        advanceStepWithCompletionCheck(set, get, currentStep + 1);
      }
    },

    previousStep: () => {
      const { currentStep } = get();
      if (currentStep > 0) set({ currentStep: currentStep - 1 });
    },

    skipOnboarding: () => set({ ...mergeOnboardingCompletion(true, Date.now()), profileStepsCompleted: true }),

    completeOnboarding: () => set({ ...mergeOnboardingCompletion(true, Date.now()), profileStepsCompleted: true }),

    resetOnboarding: () => set(initialState),

    canSkipCurrentStep: () => get().currentStep >= 1,

    canCompleteForUser: (userId: string | null | undefined) => isCompletionValidForUser(get(), userId),

    /** Home Preview: allowed when profile steps are done, even without first session. */
    canPreviewHome: (userId: string | null | undefined) => {
      if (!userId) return false;
      const state = get();
      return state.profileStepsCompleted && !state.isOnboarded;
    },

    markProfileStepsComplete: () => set({ profileStepsCompleted: true }),

    markFirstSessionStarted: () => set({ firstSessionStarted: true }),

    markFirstSessionCompleted: () => set({ firstSessionCompleted: true, isOnboarded: true, completedAt: Date.now(), completedForUserId: getCurrentUserIdForBool() }),

    markHomePreviewEntered: () => set({ homePreviewEntered: true }),

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
        explicitMotivationStyle: state.explicitMotivationStyle ?? undefined,
        personaId: state.persona ?? undefined,
        squadId: null,
        chosenLane: state.chosenLane ?? undefined,
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
      if (draft.explicitMotivationStyle) {
        updates.explicitMotivationStyle = draft.explicitMotivationStyle;
        updates.motivationProfile = deriveMotivationProfile(
          updates.goal ?? store.goal,
          updates.persona ?? store.persona,
          updates.element ?? store.element,
          draft.explicitMotivationStyle,
        );
      }
      if (draft.personaId) {
        updates.persona = draft.personaId;
        updates.motivationProfile = deriveMotivationProfile(
          updates.goal ?? store.goal, draft.personaId,
          draft.element ?? store.element, updates.explicitMotivationStyle ?? store.explicitMotivationStyle,
        );
      }
      if (draft.element) {
        updates.element = draft.element;
        updates.motivationProfile = deriveMotivationProfile(
          updates.goal ?? store.goal, updates.persona ?? store.persona,
          draft.element, updates.explicitMotivationStyle ?? store.explicitMotivationStyle,
        );
      }
      if (draft.chosenLane !== undefined) {
        const parsed = LaneSchema.safeParse(draft.chosenLane);
        if (parsed.success) updates.chosenLane = parsed.data;
      }
      if (Object.keys(updates).length > 0) set(updates);
    },

    setChosenLane: (lane) => {
      set({ chosenLane: lane });
    },
  };
}
